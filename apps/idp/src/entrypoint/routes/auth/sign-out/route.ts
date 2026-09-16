import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { signOut } from '@/usecases/identity/sign-out.js'
import { signOutOpenApi } from './openapi.js'

export function registerSignOutRoute(app: FastifyInstance, dependencies: AppDependencies): void {
  app.post('/api/auth/sign-out', signOutOpenApi, async (request, reply) => {
    const response = await signOut(request.requestContext, {
      auth: dependencies.auth,
      headers: createAuthHeaders(request),
      identityEvents: dependencies.identityEvents,
    })

    return sendAuthApiResponse(response, reply)
  })
}
