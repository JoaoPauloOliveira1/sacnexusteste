import {
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityOperationLabels,
} from '@/events/index.js'
import { type IdentityAuthService, type SignInEmailBody } from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type SignInWithEmailOptions = {
  auth: IdentityAuthService
  body: SignInEmailBody
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function signInWithEmail(
  context: RequestContext,
  options: SignInWithEmailOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('sign_in_email')

  const response = await options.auth.signInEmail(options.body, options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.signInEmail,
      operation: identityOperationLabels.signInEmail,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
