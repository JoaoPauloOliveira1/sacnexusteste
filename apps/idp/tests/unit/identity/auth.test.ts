import { describe, expect, it, vi } from 'vitest'
import { type Env } from '@/config/env.js'
import { type Database } from '@/database/client.js'
import { authSchema } from '@/database/schema.js'
import { createAuth } from '@/identity/auth.js'

const config = {
  AUTH_EMAIL_FROM: 'SAC Nexus <auth@example.test>',
  AUTH_EMAIL_VERIFICATION_CALLBACK_URL: 'https://app.example.test/auth/email-verified',
  AUTH_PASSWORD_RESET_REDIRECT_URL: 'https://app.example.test/auth/reset-password',
  AUTH_SESSION_EXPIRES_IN_SECONDS: 2_592_000,
  AUTH_TRUSTED_ORIGINS: [],
  CORS_ORIGINS: [],
  BETTER_AUTH_SECRET: 'test-secret-that-is-long-enough-for-better-auth',
  BETTER_AUTH_URL: 'https://idp.example.test',
  DATABASE_URL: 'postgresql://user:password@example.test:5432/idp',
  IDP_APP_ENV: 'production',
  IDP_HOST: '0.0.0.0',
  IDP_PORT: 3001,
  NODE_ENV: 'production',
  RESEND_API_KEY: 're_test_key',
  TIGRIS_ENDPOINT: 'https://t3.storage.dev',
  TIGRIS_REGION: 'auto',
} satisfies Env

describe('createAuth', () => {
  it('configures Better Auth with email/password and secure DB-backed sessions', () => {
    const auth = createAuth({ config, db: {} as Database })

    expect(auth.options).toMatchObject({
      advanced: { database: { generateId: expect.any(Function) }, useSecureCookies: true },
      appName: 'SAC Nexus',
      basePath: '/api/auth',
      baseURL: 'https://idp.example.test',
      emailAndPassword: {
        enabled: true,
        maxPasswordLength: 128,
        minPasswordLength: 12,
        requireEmailVerification: true,
        resetPasswordTokenExpiresIn: 1800,
        revokeSessionsOnPasswordReset: true,
      },
      emailVerification: {
        expiresIn: 86_400,
        sendOnSignIn: false,
        sendOnSignUp: true,
      },
      plugins: [
        {
          id: 'organization',
          options: {
            allowUserToCreateOrganization: false,
            disableOrganizationDeletion: true,
          },
        },
      ],
      session: {
        cookieCache: { enabled: false },
        expiresIn: 2_592_000,
      },
    })
    expect(auth.options.trustedOrigins).toEqual([
      'https://idp.example.test',
      'https://app.example.test',
    ])
  })

  it('generates UUID v7 Better Auth IDs', () => {
    const auth = createAuth({ config, db: {} as Database })
    const generateId = auth.options.advanced?.database?.generateId

    expect(generateId).toEqual(expect.any(Function))
    expect(typeof generateId === 'function' ? (generateId as () => string)() : undefined).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
  })

  it('allows explicit trusted origins for browser clients and Swagger callers', () => {
    const auth = createAuth({
      config: {
        ...config,
        AUTH_TRUSTED_ORIGINS: ['https://web.example.test', 'https://admin.example.test'],
      },
      db: {} as Database,
    })

    expect(auth.options.trustedOrigins).toEqual([
      'https://idp.example.test',
      'https://app.example.test',
      'https://web.example.test',
      'https://admin.example.test',
    ])
  })

  it('trusts localhost and 127.0.0.1 variants in local development', () => {
    const auth = createAuth({
      config: {
        ...config,
        BETTER_AUTH_URL: 'http://127.0.0.1:3001',
        IDP_APP_ENV: 'local',
      },
      db: {} as Database,
    })

    expect(auth.options.trustedOrigins).toEqual([
      'http://127.0.0.1:3001',
      'https://app.example.test',
      'http://localhost:3001',
    ])
  })

  it('keeps secure cookies enabled for every deployed app environment', () => {
    for (const appEnv of ['development', 'staging', 'production'] as const) {
      const auth = createAuth({ config: { ...config, IDP_APP_ENV: appEnv }, db: {} as Database })

      expect(auth.options.advanced).toMatchObject({ useSecureCookies: true })
    }
  })

  it('allows non-secure cookies only for local development', () => {
    const auth = createAuth({ config: { ...config, IDP_APP_ENV: 'local' }, db: {} as Database })

    expect(auth.options.advanced).toMatchObject({ useSecureCookies: false })
  })

  it('keeps public organization creation disabled in every app environment', () => {
    for (const appEnv of ['local', 'development', 'staging', 'production'] as const) {
      const auth = createAuth({ config: { ...config, IDP_APP_ENV: appEnv }, db: {} as Database })
      const organizationPlugin = auth.options.plugins?.find(
        (plugin) => plugin.id === 'organization',
      )

      expect(organizationPlugin?.options).toMatchObject({
        allowUserToCreateOrganization: false,
        disableOrganizationDeletion: true,
      })
    }
  })

  it('queues password reset email delivery without awaiting provider failures', async () => {
    const emailSender = {
      sendPasswordReset: vi.fn(async () => Promise.reject(new Error('provider unavailable'))),
      sendVerification: vi.fn(),
    }
    const auth = createAuth({ config, db: {} as Database, emailSender })
    const sendResetPassword = auth.options.emailAndPassword?.sendResetPassword

    expect(sendResetPassword).toEqual(expect.any(Function))
    await expect(
      sendResetPassword?.({
        token: 'reset-token',
        url: 'https://app.example.test/auth/reset-password?token=reset-token',
        user: {
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          email: 'user@example.test',
          emailVerified: true,
          id: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b20',
          name: 'Synthetic User',
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        },
      }),
    ).resolves.toBeUndefined()

    await Promise.resolve()

    expect(emailSender.sendPasswordReset).toHaveBeenCalledWith({
      name: 'Synthetic User',
      to: 'user@example.test',
      url: 'https://app.example.test/auth/reset-password?token=reset-token',
    })
  })

  it('exposes the prefixed schema mapping for Better Auth adapter usage', () => {
    expect(authSchema).toHaveProperty('user')
    expect(authSchema).toHaveProperty('session')
    expect(authSchema).toHaveProperty('account')
    expect(authSchema).toHaveProperty('verification')
    expect(authSchema).toHaveProperty('organization')
    expect(authSchema).toHaveProperty('member')
    expect(authSchema).toHaveProperty('invitation')
  })
})
