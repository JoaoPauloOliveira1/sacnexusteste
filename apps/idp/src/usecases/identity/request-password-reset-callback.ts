import {
  type IdentityAuthService,
  type RequestPasswordResetCallbackParams,
  type RequestPasswordResetCallbackQuery,
} from '@/identity/auth-service.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'

type RequestPasswordResetCallbackOptions = {
  auth: IdentityAuthService
  headers: Headers
  params: RequestPasswordResetCallbackParams
  query: RequestPasswordResetCallbackQuery
}

export async function requestPasswordResetCallback(
  context: RequestContext,
  options: RequestPasswordResetCallbackOptions,
): Promise<Response> {
  context.canonicalEvent.setAuthOperation('password_reset_callback')

  return options.auth.requestPasswordResetCallback(options.params, options.query, options.headers)
}
