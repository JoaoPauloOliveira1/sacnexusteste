import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { getTenantStatus } from '@/usecases/tenant/get-tenant-status.js'
import { tenantStatusOpenApi } from './openapi.js'

export function registerTenantStatusRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
): void {
  app.get('/tenant/status', tenantStatusOpenApi, async (request) =>
    getTenantStatus(request.requestContext, request.headers, {
      tenantDomains: dependencies.tenantDomains,
    }),
  )
}
