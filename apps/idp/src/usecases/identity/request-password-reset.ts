import {
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityOperationLabels,
} from '@/events/index.js'
import { type IdentityAuthService, type RequestPasswordResetBody } from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type RequestPasswordResetOptions = {
  auth: IdentityAuthService
  body: RequestPasswordResetBody
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function requestPasswordReset(
  context: RequestContext,
  options: RequestPasswordResetOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('request_password_reset')

  const response = await options.auth.requestPasswordReset(options.body, options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.requestPasswordReset,
      operation: identityOperationLabels.requestPasswordReset,
      request_id: context.requestId,
      response,
    }),
  )

  if (response.status >= 500) {
    return response
  }

  return Response.json({
    message: 'If an account exists, password reset instructions will be sent.',
    status: true,
  })
}
