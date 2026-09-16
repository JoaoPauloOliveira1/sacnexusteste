import { type FastifyInstance } from 'fastify'
import { type Env } from '@/config/env.js'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { requestPasswordReset } from '@/usecases/identity/request-password-reset.js'
import { requestPasswordResetOpenApi } from './openapi.js'

type RequestPasswordResetRequestBody = {
  email: string
}

export function registerRequestPasswordResetRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
  config: Env,
): void {
  app.post(
    '/api/auth/request-password-reset',
    requestPasswordResetOpenApi,
    async (request, reply) => {
      const body = request.body as RequestPasswordResetRequestBody
      const response = await requestPasswordReset(request.requestContext, {
        auth: dependencies.auth,
        body: {
          email: body.email,
          redirectTo: config.AUTH_PASSWORD_RESET_REDIRECT_URL,
        },
        headers: createAuthHeaders(request),
        identityEvents: dependencies.identityEvents,
      })

      return sendAuthApiResponse(response, reply)
    },
  )
}
