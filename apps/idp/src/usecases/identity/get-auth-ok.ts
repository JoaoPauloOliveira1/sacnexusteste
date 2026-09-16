import {
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityOperationLabels,
} from '@/events/index.js'
import { type IdentityAuthService } from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type GetAuthOkOptions = {
  auth: IdentityAuthService
  identityEvents: IdentityEventPublisher
}

export async function getAuthOk(
  context: RequestContext,
  options: GetAuthOkOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('ok')

  const response = await options.auth.ok()

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.authOk,
      operation: identityOperationLabels.authOk,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
