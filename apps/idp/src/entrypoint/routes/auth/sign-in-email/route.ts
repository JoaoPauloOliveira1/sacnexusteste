import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { signInWithEmail } from '@/usecases/identity/sign-in-with-email.js'
import { signInEmailOpenApi } from './openapi.js'

export function registerSignInEmailRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
): void {
  app.post('/api/auth/sign-in/email', signInEmailOpenApi, async (request, reply) => {
    const response = await signInWithEmail(request.requestContext, {
      auth: dependencies.auth,
      body: request.body as { email: string; password: string },
      headers: createAuthHeaders(request),
      identityEvents: dependencies.identityEvents,
    })

    return sendAuthApiResponse(response, reply)
  })
}
