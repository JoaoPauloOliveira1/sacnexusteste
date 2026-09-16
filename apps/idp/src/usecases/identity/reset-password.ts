import {
  createIdentityEvent,
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityEventOutcomes,
  identityOperationLabels,
  identityReasonCodes,
} from '@/events/index.js'
import { type IdentityAuthService, type ResetPasswordBody } from '@/identity/auth-service.js'
import {
  createPasswordPolicyErrorResponse,
  getPasswordPolicyViolation,
} from '@/identity/password-policy.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type ResetPasswordOptions = {
  auth: IdentityAuthService
  body: ResetPasswordBody
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function resetPassword(
  context: RequestContext,
  options: ResetPasswordOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('reset_password')

  const passwordPolicyViolation = getPasswordPolicyViolation(options.body.newPassword)

  if (passwordPolicyViolation) {
    await options.identityEvents.publish(
      createIdentityEvent({
        name: identityEventNames.resetPassword,
        operation: identityOperationLabels.resetPassword,
        outcome: identityEventOutcomes.failed,
        reason_code: identityReasonCodes.passwordPolicyViolation,
        request_id: context.requestId,
      }),
    )

    return createPasswordPolicyErrorResponse(passwordPolicyViolation)
  }

  const response = await options.auth.resetPassword(options.body, options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.resetPassword,
      operation: identityOperationLabels.resetPassword,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
