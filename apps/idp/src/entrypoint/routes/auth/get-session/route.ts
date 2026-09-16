import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { getAuthSession } from '@/usecases/identity/get-auth-session.js'
import { getAuthSessionOpenApi } from './openapi.js'

export function registerGetAuthSessionRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
): void {
  app.get('/api/auth/session', getAuthSessionOpenApi, async (request, reply) => {
    const response = await getAuthSession(request.requestContext, {
      auth: dependencies.auth,
      headers: createAuthHeaders(request),
      identityEvents: dependencies.identityEvents,
    })

    return sendAuthApiResponse(response, reply)
  })
}
