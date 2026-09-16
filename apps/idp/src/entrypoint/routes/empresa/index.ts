import { type FastifyPluginAsync } from 'fastify'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { empresaOpenApiTagName } from '@/entrypoint/routes/empresa/openapi.js'
import { registerRegisterEmpresaRoute } from '@/entrypoint/routes/empresa/register/route.js'
import { HttpError } from '@/infra/http/http-error.js'
import { deleteEmpresa } from '@/usecases/empresa/delete-empresa.js'
import { listEmpresas } from '@/usecases/empresa/list-empresas.js'

const errorResponse = {
  type: 'object',
  additionalProperties: false,
  properties: { message: { type: 'string' } },
} as const

export const empresaRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  registerRegisterEmpresaRoute(app, dependencies)

  app.get(
    '/api/empresas',
    {
      schema: {
        operationId: 'listEmpresas',
        tags: [empresaOpenApiTagName],
        summary: 'Lista as empresas cadastradas do tenant (para a área de Unidades)',
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['empresas'],
            properties: {
              empresas: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['empresaId', 'cnpj', 'razaoSocial', 'cnaeCount', 'unidadeCount'],
                  properties: {
                    empresaId: { type: 'string', format: 'uuid' },
                    cnpj: { type: 'string' },
                    razaoSocial: { type: 'string' },
                    nomeFantasia: { type: 'string', nullable: true },
                    municipio: { type: 'string', nullable: true },
                    uf: { type: 'string', nullable: true },
                    cnaeCount: { type: 'integer' },
                    unidadeCount: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async () => listEmpresas({}, { empresas: dependencies.empresas }),
  )

  app.delete(
    '/api/empresas/:empresaId',
    {
      schema: {
        operationId: 'deleteEmpresa',
        tags: [empresaOpenApiTagName],
        summary: 'Exclui uma empresa e tudo sob ela (confirmação pelo CNPJ)',
        description:
          'Exclusão permanente. Requer o CNPJ da empresa no corpo como confirmação; remove unidades, processos, documentos, pagamentos, histórico, classificações, CNAEs e sócios.',
        params: {
          type: 'object',
          required: ['empresaId'],
          properties: { empresaId: { type: 'string', format: 'uuid' } },
        },
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['cnpj'],
          properties: { cnpj: { type: 'string', minLength: 1 } },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['ok'],
            properties: { ok: { type: 'boolean' } },
          },
          400: errorResponse,
          404: errorResponse,
        },
      },
    },
    async (request, reply) => {
      const { empresaId } = request.params as { empresaId: string }
      const { cnpj } = request.body as { cnpj: string }
      try {
        return await deleteEmpresa(
          { empresaId, cnpjConfirmacao: cnpj },
          { empresas: dependencies.empresas },
        )
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 400 | 404).send({ message: error.message })
        }
        throw error
      }
    },
  )
}
