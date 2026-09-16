import { type FastifyInstance } from 'fastify'
import { type Env } from '@/config/env.js'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { createAuthHeaders, sendAuthApiResponse } from '@/entrypoint/routes/auth/response.js'
import { sendVerificationEmail } from '@/usecases/identity/send-verification-email.js'
import { sendVerificationEmailOpenApi } from './openapi.js'

type SendVerificationEmailRequestBody = {
  callback_url?: string
  email: string
}

export function registerSendVerificationEmailRoute(
  app: FastifyInstance,
  dependencies: AppDependencies,
  config: Env,
): void {
  app.post(
    '/api/auth/send-verification-email',
    sendVerificationEmailOpenApi,
    async (request, reply) => {
      const body = request.body as SendVerificationEmailRequestBody
      const response = await sendVerificationEmail(request.requestContext, {
        auth: dependencies.auth,
        body: {
          callbackURL: body.callback_url ?? config.AUTH_EMAIL_VERIFICATION_CALLBACK_URL,
          email: body.email,
        },
        headers: createAuthHeaders(request),
        identityEvents: dependencies.identityEvents,
      })

      return sendAuthApiResponse(response, reply)
    },
  )
}
