import { type FastifyPluginAsync } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { tenantStatusResponseSchema } from '@/entrypoint/routes/tenant/status/openapi.js'
import { registerTenantStatusRoute } from '@/entrypoint/routes/tenant/status/route.js'

export const tenantRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  app.addSchema(tenantStatusResponseSchema)

  registerTenantStatusRoute(app, dependencies)
}
