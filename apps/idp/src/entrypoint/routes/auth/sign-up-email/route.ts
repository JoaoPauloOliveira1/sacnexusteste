import { type FastifyInstance } from 'fastify'
import { env } from '@/config/env.js'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { signUpWithEmail } from '@/usecases/identity/sign-up-with-email.js'
import { signUpEmailOpenApi } from './openapi.js'

export function registerSignUpEmailRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
): void {
  app.post('/api/auth/sign-up/email', signUpEmailOpenApi, async (request, reply) => {
    const response = await signUpWithEmail(request.requestContext, {
      auth: dependencies.auth,
      body: {
        ...(request.body as { email: string; name: string; password: string }),
        callbackURL: env.AUTH_EMAIL_VERIFICATION_CALLBACK_URL,
      },
      headers: createAuthHeaders(request),
      identityEvents: dependencies.identityEvents,
    })

    return sendAuthApiResponse(response, reply)
  })
}
