import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { resetPassword } from '@/usecases/identity/reset-password.js'
import { resetPasswordOpenApi } from './openapi.js'

type ResetPasswordRequestBody = {
  new_password: string
  token: string
}

export function registerResetPasswordRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
): void {
  app.post('/api/auth/reset-password', resetPasswordOpenApi, async (request, reply) => {
    const body = request.body as ResetPasswordRequestBody
    const response = await resetPassword(request.requestContext, {
      auth: dependencies.auth,
      body: {
        newPassword: body.new_password,
        token: body.token,
      },
      headers: createAuthHeaders(request),
      identityEvents: dependencies.identityEvents,
    })

    return sendAuthApiResponse(response, reply)
  })
}
