import { type FastifyPluginAsync } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { healthResponseSchema } from './health/openapi.js'
import { registerHealthRoute } from './health/route.js'
import { readinessResponseSchema } from './ready/openapi.js'
import { registerReadyRoute } from './ready/route.js'

export const operationalRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  app.addSchema(healthResponseSchema)
  app.addSchema(readinessResponseSchema)

  registerHealthRoute(app)
  registerReadyRoute(app, dependencies)
}
