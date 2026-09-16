import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { getReadiness } from '@/usecases/operational/get-readiness.js'
import { readinessOpenApi } from './openapi.js'

export function registerReadyRoute(app: FastifyInstance, dependencies: AppDependencies): void {
  app.get('/ready', readinessOpenApi, async (request, reply) => {
    const readiness = await getReadiness(request.requestContext, {
      checkDatabase: dependencies.database.checkReadiness,
      clock: () => new Date(),
    })

    if (readiness.status === 'unready') {
      reply.status(503)
    }

    return readiness
  })
}
