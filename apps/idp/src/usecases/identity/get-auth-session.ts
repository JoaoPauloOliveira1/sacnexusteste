import {
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityOperationLabels,
} from '@/events/index.js'
import { type IdentityAuthService } from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type GetAuthSessionOptions = {
  auth: IdentityAuthService
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function getAuthSession(
  context: RequestContext,
  options: GetAuthSessionOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('get_session')

  const response = await options.auth.getSession(options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.getSession,
      operation: identityOperationLabels.getSession,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
