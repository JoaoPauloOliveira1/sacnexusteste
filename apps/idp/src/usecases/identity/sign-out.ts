import {
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityOperationLabels,
} from '@/events/index.js'
import { type IdentityAuthService } from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type SignOutOptions = {
  auth: IdentityAuthService
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function signOut(context: RequestContext, options: SignOutOptions): Promise<Response> {
  context.canonicalEvent.setAuthOperation('sign_out')

  const response = await options.auth.signOut(options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.signOut,
      operation: identityOperationLabels.signOut,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
