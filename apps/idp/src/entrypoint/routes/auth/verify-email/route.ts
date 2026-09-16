import { type FastifyInstance } from 'fastify'
import { type Env } from '@/config/env.js'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { verifyEmail } from '@/usecases/identity/verify-email.js'
import { verifyEmailOpenApi } from './openapi.js'

type VerifyEmailQuery = {
  callbackURL?: string
  token: string
}

export function registerVerifyEmailRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
  config: Env,
): void {
  app.get('/api/auth/verify-email', verifyEmailOpenApi, async (request, reply) => {
    const query = request.query as VerifyEmailQuery
    const response = await verifyEmail(request.requestContext, {
      auth: dependencies.auth,
      headers: createAuthHeaders(request),
      identityEvents: dependencies.identityEvents,
      query: { callbackURL: config.AUTH_EMAIL_VERIFICATION_CALLBACK_URL, token: query.token },
    })

    return sendAuthApiResponse(response, reply)
  })
}
