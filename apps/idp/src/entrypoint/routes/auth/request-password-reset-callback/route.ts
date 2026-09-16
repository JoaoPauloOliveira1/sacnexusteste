import { type FastifyInstance } from 'fastify'
import { type Env } from '@/config/env.js'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { requestPasswordResetCallback } from '@/usecases/identity/request-password-reset-callback.js'
import { requestPasswordResetCallbackOpenApi } from './openapi.js'

type RequestPasswordResetCallbackParams = {
  token: string
}

export function registerRequestPasswordResetCallbackRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
  config: Env,
): void {
  app.get(
    '/api/auth/reset-password/:token',
    requestPasswordResetCallbackOpenApi,
    async (request, reply) => {
      const params = request.params as RequestPasswordResetCallbackParams
      const response = await requestPasswordResetCallback(request.requestContext, {
        auth: dependencies.auth,
        headers: createAuthHeaders(request),
        params,
        query: { callbackURL: config.AUTH_PASSWORD_RESET_REDIRECT_URL },
      })

      return sendAuthApiResponse(response, reply)
    },
  )
}
