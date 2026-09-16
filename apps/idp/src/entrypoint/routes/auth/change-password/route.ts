import { type FastifyInstance } from 'fastify'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { changePassword } from '@/usecases/identity/change-password.js'
import { changePasswordOpenApi } from './openapi.js'

type ChangePasswordRequestBody = {
  current_password: string
  new_password: string
}

export function registerChangePasswordRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
): void {
  app.post('/api/auth/change-password', changePasswordOpenApi, async (request, reply) => {
    const body = request.body as ChangePasswordRequestBody
    const response = await changePassword(request.requestContext, {
      auth: dependencies.auth,
      body: { currentPassword: body.current_password, newPassword: body.new_password },
      headers: createAuthHeaders(request),
      identityEvents: dependencies.identityEvents,
    })

    return sendAuthApiResponse(response, reply)
  })
}
