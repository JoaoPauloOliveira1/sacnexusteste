import {
  createIdentityEvent,
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityEventOutcomes,
  identityOperationLabels,
  identityReasonCodes,
} from '@/events/index.js'
import { type ChangePasswordBody, type IdentityAuthService } from '@/identity/auth-service.js'
import {
  createPasswordPolicyErrorResponse,
  getPasswordPolicyViolation,
} from '@/identity/password-policy.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type ChangePasswordOptions = {
  auth: IdentityAuthService
  body: ChangePasswordBody
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function changePassword(
  context: RequestContext,
  options: ChangePasswordOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('change_password')

  const passwordPolicyViolation = getPasswordPolicyViolation(options.body.newPassword)

  if (passwordPolicyViolation) {
    await options.identityEvents.publish(
      createIdentityEvent({
        name: identityEventNames.changePassword,
        operation: identityOperationLabels.changePassword,
        outcome: identityEventOutcomes.failed,
        reason_code: identityReasonCodes.passwordPolicyViolation,
        request_id: context.requestId,
      }),
    )

    return createPasswordPolicyErrorResponse(passwordPolicyViolation)
  }

  const response = await options.auth.changePassword(
    { ...options.body, revokeOtherSessions: true },
    options.headers,
  )

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.changePassword,
      operation: identityOperationLabels.changePassword,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
