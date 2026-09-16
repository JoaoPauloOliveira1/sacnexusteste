import {
  createIdentityEvent,
  createIdentityEventFromResponse,
  type IdentityEventPublisher,
  identityEventNames,
  identityEventOutcomes,
  identityOperationLabels,
  identityReasonCodes,
} from '@/events/index.js'
import { type IdentityAuthService, type SignUpEmailBody } from '@/identity/auth-service.js'
import {
  createPasswordPolicyErrorResponse,
  getPasswordPolicyViolation,
} from '@/identity/password-policy.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type SignUpWithEmailOptions = {
  auth: IdentityAuthService
  body: SignUpEmailBody
  headers: Headers
  identityEvents: IdentityEventPublisher
}

export async function signUpWithEmail(
  context: RequestContext,
  options: SignUpWithEmailOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('sign_up_email')

  const passwordPolicyViolation = getPasswordPolicyViolation(options.body.password)

  if (passwordPolicyViolation) {
    await options.identityEvents.publish(
      createIdentityEvent({
        name: identityEventNames.signUpEmail,
        operation: identityOperationLabels.signUpEmail,
        outcome: identityEventOutcomes.failed,
        reason_code: identityReasonCodes.passwordPolicyViolation,
        request_id: context.requestId,
      }),
    )

    return createPasswordPolicyErrorResponse(passwordPolicyViolation)
  }

  const response = await options.auth.signUpEmail(options.body, options.headers)

  await options.identityEvents.publish(
    createIdentityEventFromResponse({
      name: identityEventNames.signUpEmail,
      operation: identityOperationLabels.signUpEmail,
      request_id: context.requestId,
      response,
    }),
  )

  return response
}
