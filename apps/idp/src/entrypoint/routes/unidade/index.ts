import { type FastifyPluginAsync } from 'fastify'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { HttpError } from '@/infra/http/http-error.js'
import {
  createUnidade,
  getUnidade,
  getUnidadeCnaes,
  listEmpresaCnaes,
  listUnidades,
  type UpdateUnidadeRequest,
  updateUnidade,
} from '@/usecases/unidade/unidade-service.js'
import { unidadeOpenApiTagName } from './openapi.js'

const unidadeIdParams = {
  type: 'object',
  required: ['unidadeId'],
  properties: { unidadeId: { type: 'string', format: 'uuid' } },
} as const

const unidadeDetail = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'isMatriz', 'completa'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    nome: { type: 'string', nullable: true },
    isMatriz: { type: 'boolean' },
    completa: { type: 'boolean' },
    cep: { type: 'string', nullable: true },
    logradouro: { type: 'string', nullable: true },
    numero: { type: 'string', nullable: true },
    complemento: { type: 'string', nullable: true },
    bairro: { type: 'string', nullable: true },
    municipio: { type: 'string', nullable: true },
    uf: { type: 'string', nullable: true },
    areaConstruida: { type: 'string', nullable: true },
    pavimentos: { type: 'integer', nullable: true },
    ocupacao: { type: 'integer', nullable: true },
    tipoExploracao: { type: 'string', nullable: true },
  },
} as const

const cnaeItem = {
  type: 'object',
  additionalProperties: false,
  required: ['cnaeId', 'codigo', 'descricao', 'band', 'principal'],
  properties: {
    cnaeId: { type: 'string', format: 'uuid' },
    codigo: { type: 'string' },
    descricao: { type: 'string' },
    band: { type: 'string' },
    principal: { type: 'boolean' },
  },
} as const

const empresaIdParams = {
  type: 'object',
  required: ['empresaId'],
  properties: { empresaId: { type: 'string', format: 'uuid' } },
} as const

const notFound = {
  type: 'object',
  additionalProperties: false,
  properties: { message: { type: 'string' } },
} as const

export const unidadeRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  const deps = { unidades: dependencies.unidades }

  app.get(
    '/api/empresas/:empresaId/cnaes',
    {
      schema: {
        operationId: 'listEmpresaCnaes',
        tags: [unidadeOpenApiTagName],
        summary: 'Lista os CNAEs da empresa (para confirmar quais se aplicam à unidade)',
        params: empresaIdParams,
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['empresaId', 'cnaes'],
            properties: {
              empresaId: { type: 'string' },
              cnaes: { type: 'array', items: cnaeItem },
              empresa: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  cep: { type: 'string', nullable: true },
                  logradouro: { type: 'string', nullable: true },
                  numero: { type: 'string', nullable: true },
                  complemento: { type: 'string', nullable: true },
                  bairro: { type: 'string', nullable: true },
                  municipio: { type: 'string', nullable: true },
                  uf: { type: 'string', nullable: true },
                },
              },
            },
          },
          404: notFound,
        },
      },
    },
    async (request, reply) => {
      const { empresaId } = request.params as { empresaId: string }
      try {
        return await listEmpresaCnaes(empresaId, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.get(
    '/api/empresas/:empresaId/unidades',
    {
      schema: {
        operationId: 'listUnidades',
        tags: [unidadeOpenApiTagName],
        summary: 'Lista as unidades já cadastradas da empresa',
        params: empresaIdParams,
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['empresaId', 'unidades'],
            properties: {
              empresaId: { type: 'string' },
              unidades: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['id'],
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    nome: { type: 'string', nullable: true },
                    municipio: { type: 'string', nullable: true },
                    uf: { type: 'string', nullable: true },
                    areaConstruida: { type: 'string', nullable: true },
                    isMatriz: { type: 'boolean' },
                    completa: { type: 'boolean' },
                    riscoAtual: { type: 'string', nullable: true },
                    processo: {
                      type: 'object',
                      nullable: true,
                      additionalProperties: false,
                      properties: {
                        id: { type: 'string' },
                        fase: { type: 'string' },
                        risco: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          404: notFound,
        },
      },
    },
    async (request, reply) => {
      const { empresaId } = request.params as { empresaId: string }
      try {
        return await listUnidades(empresaId, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.get(
    '/api/unidades/:unidadeId/cnaes',
    {
      schema: {
        operationId: 'getUnidadeCnaes',
        tags: [unidadeOpenApiTagName],
        summary: 'Lista os CNAEs confirmados de uma unidade (para semear a classificação)',
        params: {
          type: 'object',
          required: ['unidadeId'],
          properties: { unidadeId: { type: 'string', format: 'uuid' } },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['unidadeId', 'cnaes'],
            properties: {
              unidadeId: { type: 'string' },
              cnaes: { type: 'array', items: cnaeItem },
            },
          },
        },
      },
    },
    async (request) => {
      const { unidadeId } = request.params as { unidadeId: string }
      return getUnidadeCnaes(unidadeId, deps)
    },
  )

  app.get(
    '/api/unidades/:unidadeId',
    {
      schema: {
        operationId: 'getUnidade',
        tags: [unidadeOpenApiTagName],
        summary: 'Retorna os dados de uma unidade (para completar/editar o cadastro)',
        params: unidadeIdParams,
        response: { 200: unidadeDetail, 404: notFound },
      },
    },
    async (request, reply) => {
      const { unidadeId } = request.params as { unidadeId: string }
      try {
        return await getUnidade(unidadeId, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.patch(
    '/api/unidades/:unidadeId',
    {
      schema: {
        operationId: 'updateUnidade',
        tags: [unidadeOpenApiTagName],
        summary: 'Completa/edita uma unidade (endereço, área, pavimentos, ocupação, tipo)',
        description:
          'Usado para completar a "matriz" (nascida incompleta) ou editar qualquer unidade: endereço, área construída, número de pavimentos, ocupação (lotação de pico) e tipo de exploração.',
        params: unidadeIdParams,
        body: {
          type: 'object',
          additionalProperties: false,
          properties: {
            nome: { type: 'string' },
            cep: { type: 'string' },
            logradouro: { type: 'string' },
            numero: { type: 'string' },
            complemento: { type: 'string' },
            bairro: { type: 'string' },
            municipio: { type: 'string' },
            uf: { type: 'string' },
            areaConstruida: { type: 'string' },
            pavimentos: { type: 'integer' },
            ocupacao: { type: 'integer' },
            tipoExploracao: { type: 'string' },
          },
        },
        response: { 200: unidadeDetail, 400: notFound, 404: notFound },
      },
    },
    async (request, reply) => {
      const { unidadeId } = request.params as { unidadeId: string }
      try {
        return await updateUnidade(unidadeId, request.body as UpdateUnidadeRequest, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 400 | 404).send({ message: error.message })
        }
        throw error
      }
    },
  )

  app.post(
    '/api/empresas/:empresaId/unidades',
    {
      schema: {
        operationId: 'createUnidade',
        tags: [unidadeOpenApiTagName],
        summary: 'Cria uma unidade da empresa com o subconjunto de CNAEs confirmados',
        description:
          'A unidade é a entidade central. Confirma-se quais CNAEs da empresa se exercem nesta unidade (endereço + área construída próprios) e calcula-se o risco preliminar da unidade.',
        params: empresaIdParams,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['cnaeIds'],
          properties: {
            nome: { type: 'string' },
            cep: { type: 'string' },
            logradouro: { type: 'string' },
            numero: { type: 'string' },
            complemento: { type: 'string' },
            bairro: { type: 'string' },
            municipio: { type: 'string' },
            uf: { type: 'string' },
            areaConstruida: { type: 'string', description: 'Área construída (m²).' },
            cnaeIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['unidadeId', 'cnaes'],
            properties: {
              unidadeId: { type: 'string', format: 'uuid' },
              nome: { type: 'string', nullable: true },
              overallRisk: { type: 'string', nullable: true },
              cnaes: { type: 'array', items: cnaeItem },
            },
          },
          404: notFound,
        },
      },
    },
    async (request, reply) => {
      const { empresaId } = request.params as { empresaId: string }
      const body = request.body as {
        nome?: string
        cep?: string
        logradouro?: string
        numero?: string
        complemento?: string
        bairro?: string
        municipio?: string
        uf?: string
        areaConstruida?: string
        cnaeIds: string[]
      }
      try {
        return await createUnidade(empresaId, body, deps)
      } catch (error) {
        if (error instanceof HttpError) {
          return reply.status(error.statusCode as 404).send({ message: error.message })
        }
        throw error
      }
    },
  )
}
