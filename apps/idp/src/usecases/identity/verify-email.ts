import {
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityOperationLabels,
} from '@/events/index.js'
import { type IdentityAuthService, type VerifyEmailQuery } from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type VerifyEmailOptions = {
  auth: IdentityAuthService
  headers: Headers
  identityEvents: IdentityEventPublisher
  query: VerifyEmailQuery
}

export async function verifyEmail(
  context: RequestContext,
  options: VerifyEmailOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('verify_email')

  const response = await options.auth.verifyEmail(options.query, options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.verifyEmail,
      operation: identityOperationLabels.verifyEmail,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
