import { type FastifyInstance } from 'fastify'
import { getHealth } from '@/usecases/operational/get-health.js'
import { healthOpenApi } from './openapi.js'

export function registerHealthRoute(app: FastifyInstance): void {
  app.get('/health', healthOpenApi, async (request) => getHealth(request.requestContext))
}
