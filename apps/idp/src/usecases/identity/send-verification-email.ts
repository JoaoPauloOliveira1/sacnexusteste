import {
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityOperationLabels,
} from '@/events/index.js'
import {
  type IdentityAuthService,
  type SendVerificationEmailBody,
} from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type SendVerificationEmailOptions = {
  auth: IdentityAuthService
  body: SendVerificationEmailBody
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function sendVerificationEmail(
  context: RequestContext,
  options: SendVerificationEmailOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('send_verification_email')

  const response = await options.auth.sendVerificationEmail(options.body, options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.sendVerificationEmail,
      operation: identityOperationLabels.sendVerificationEmail,
      request_id: context.requestId,
      response,
    }),
  )

  if (response.status >= 500) {
    return response
  }

  return Response.json({
    message: 'If an account exists and requires verification, instructions will be sent.',
    status: true,
  })
}
