import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'
import { organization } from 'better-auth/plugins'
import { v7 as uuidv7 } from 'uuid'
import { type Env } from '@/config/env.js'
import { type Database } from '@/database/client.js'
import { authSchema } from '@/database/schema.js'
import { type AuthEmailSender, createResendAuthEmailSender } from '@/identity/email-delivery.js'
import { passwordPolicy } from '@/identity/password-policy.js'

type CreateAuthOptions = {
  config: Env
  db: Database
  emailSender?: AuthEmailSender
}

type PasswordResetEmailInput = {
  emailSender: AuthEmailSender
  name: string
  to: string
  url: string
}

function generateUuidV7(): string {
  return uuidv7()
}

function queuePasswordResetEmail(input: PasswordResetEmailInput): void {
  // Keep the public reset response generic even when the email provider is slow or unavailable.
  void Promise.resolve()
    .then(() =>
      input.emailSender.sendPasswordReset({ name: input.name, to: input.to, url: input.url }),
    )
    .catch(() => {})
}

export function createAuth(options: CreateAuthOptions) {
  const emailSender = options.emailSender ?? createResendAuthEmailSender(options.config)

  return betterAuth({
    appName: 'SAC Nexus',
    basePath: '/api/auth',
    baseURL: options.config.BETTER_AUTH_URL,
    trustedOrigins: getTrustedOrigins(options.config),
    secret: options.config.BETTER_AUTH_SECRET,
    database: drizzleAdapter(options.db, {
      provider: 'pg',
      schema: authSchema,
    }),
    emailAndPassword: {
      enabled: true,
      maxPasswordLength: passwordPolicy.maxLength,
      minPasswordLength: passwordPolicy.minLength,
      requireEmailVerification: true,
      resetPasswordTokenExpiresIn: 60 * 30,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        queuePasswordResetEmail({ emailSender, name: user.name, to: user.email, url })
      },
    },
    emailVerification: {
      expiresIn: 60 * 60 * 24,
      sendOnSignIn: false,
      sendOnSignUp: true,
      sendVerificationEmail: async ({ user, url }) => {
        await emailSender.sendVerification({ name: user.name, to: user.email, url })
      },
    },
    plugins: [
      organization({
        allowUserToCreateOrganization: false,
        disableOrganizationDeletion: true,
      }),
    ],
    session: {
      expiresIn: options.config.AUTH_SESSION_EXPIRES_IN_SECONDS,
      cookieCache: {
        enabled: false,
      },
    },
    advanced: {
      database: {
        generateId: generateUuidV7,
      },
      useSecureCookies: options.config.IDP_APP_ENV !== 'local',
    },
  })
}

function getTrustedOrigins(config: Env): string[] {
  const origins = new Set<string>([new URL(config.BETTER_AUTH_URL).origin])

  origins.add(new URL(config.AUTH_EMAIL_VERIFICATION_CALLBACK_URL).origin)
  origins.add(new URL(config.AUTH_PASSWORD_RESET_REDIRECT_URL).origin)

  for (const origin of config.AUTH_TRUSTED_ORIGINS) {
    origins.add(origin)
  }

  if (config.IDP_APP_ENV === 'local') {
    const baseUrl = new URL(config.BETTER_AUTH_URL)
    const localHosts = ['127.0.0.1', 'localhost']

    for (const hostname of localHosts) {
      baseUrl.hostname = hostname
      origins.add(baseUrl.origin)
    }
  }

  return [...origins]
}
