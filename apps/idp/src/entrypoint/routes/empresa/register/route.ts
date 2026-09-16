import { type FastifyInstance } from 'fastify'

import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { CnpjLookupError } from '@/infra/integrations/cnpj/cnpj-provider.js'
import { registerEmpresaFromCnpj } from '@/usecases/empresa/register-empresa-from-cnpj.js'
import { registerEmpresaOpenApi } from './openapi.js'

export function registerRegisterEmpresaRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
): void {
  app.post('/api/empresas', registerEmpresaOpenApi, async (request, reply) => {
    const body = request.body as { cnpj: string; organizationId: string }

    try {
      const result = await registerEmpresaFromCnpj(
        { cnpj: body.cnpj, organizationId: body.organizationId },
        { cnpjProvider: dependencies.cnpjProvider, empresas: dependencies.empresas },
      )
      return reply.status(200).send(result)
    } catch (error) {
      if (error instanceof CnpjLookupError) {
        return reply.status(error.statusCode).send({ message: error.message })
      }
      throw error
    }
  })
}
