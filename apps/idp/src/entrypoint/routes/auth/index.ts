import { type FastifyPluginAsync } from 'fastify'
import { env } from '@/config/env.js'
import { type AppDependencies } from '@/entrypoint/dependencies.js'
import { registerChangePasswordRoute } from '@/entrypoint/routes/auth/change-password/route.js'
import { registerGetAuthSessionRoute } from '@/entrypoint/routes/auth/get-session/route.js'
import { registerAuthOkRoute } from '@/entrypoint/routes/auth/ok/route.js'
import { registerRequestPasswordResetRoute } from '@/entrypoint/routes/auth/request-password-reset/route.js'
import { registerRequestPasswordResetCallbackRoute } from '@/entrypoint/routes/auth/request-password-reset-callback/route.js'
import { registerResetPasswordRoute } from '@/entrypoint/routes/auth/reset-password/route.js'
import {
  authErrorResponseSchema,
  authSessionResponseSchema,
  authUserResponseSchema,
} from '@/entrypoint/routes/auth/schemas.js'
import { registerSendVerificationEmailRoute } from '@/entrypoint/routes/auth/send-verification-email/route.js'
import { registerSignInEmailRoute } from '@/entrypoint/routes/auth/sign-in-email/route.js'
import { registerSignOutRoute } from '@/entrypoint/routes/auth/sign-out/route.js'
import { registerSignUpEmailRoute } from '@/entrypoint/routes/auth/sign-up-email/route.js'
import { registerVerifyEmailRoute } from '@/entrypoint/routes/auth/verify-email/route.js'

export const authRoutes: FastifyPluginAsync<AppDependencies> = async (app, dependencies) => {
  app.addSchema(authUserResponseSchema)
  app.addSchema(authSessionResponseSchema)
  app.addSchema(authErrorResponseSchema)

  registerSignUpEmailRoute(app, dependencies)
  registerSignInEmailRoute(app, dependencies)
  registerSendVerificationEmailRoute(app, dependencies, env)
  registerVerifyEmailRoute(app, dependencies, env)
  registerRequestPasswordResetRoute(app, dependencies, env)
  registerRequestPasswordResetCallbackRoute(app, dependencies, env)
  registerResetPasswordRoute(app, dependencies)
  registerChangePasswordRoute(app, dependencies)
  registerSignOutRoute(app, dependencies)
  registerGetAuthSessionRoute(app, dependencies)
  registerAuthOkRoute(app, dependencies)
}
