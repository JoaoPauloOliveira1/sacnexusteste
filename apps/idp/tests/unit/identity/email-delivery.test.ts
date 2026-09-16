import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Env } from '@/config/env.js'
import { createResendAuthEmailSender } from '@/identity/email-delivery.js'

const sendEmailMock = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  Resend: vi.fn(function ResendMock() {
    return { emails: { send: sendEmailMock } }
  }),
}))

const config = {
  AUTH_EMAIL_FROM: 'SAC Nexus <auth@example.test>',
  AUTH_EMAIL_REPLY_TO: 'support@example.test',
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

describe('createResendAuthEmailSender', () => {
  beforeEach(() => {
    sendEmailMock.mockReset()
  })

  it('sends verification emails with safe delivery logs', async () => {
    const events: unknown[] = []
    sendEmailMock.mockResolvedValue({ data: { id: 'email_123' }, error: null })
    const sender = createResendAuthEmailSender(config, (event) => events.push(event))

    await sender.sendVerification({
      name: 'Ana Silva',
      to: 'ana@example.test',
      url: 'https://idp.example.test/api/auth/verify-email?token=secret',
    })

    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'SAC Nexus <auth@example.test>',
        replyTo: 'support@example.test',
        subject: 'Confirme seu email no SAC Nexus',
        to: ['ana@example.test'],
      }),
    )
    expect(events).toEqual([
      {
        email_operation: 'email_verification',
        event: 'email.delivery.attempted',
        provider: 'resend',
      },
      {
        email_operation: 'email_verification',
        event: 'email.delivery.succeeded',
        provider: 'resend',
      },
    ])
    expect(JSON.stringify(events)).not.toContain('ana@example.test')
    expect(JSON.stringify(events)).not.toContain('secret')
  })

  it('logs safe failures without provider response details', async () => {
    const events: unknown[] = []
    sendEmailMock.mockResolvedValue({ data: null, error: { message: 'provider detail' } })
    const sender = createResendAuthEmailSender(config, (event) => events.push(event))

    await expect(
      sender.sendPasswordReset({
        name: 'Ana Silva',
        to: 'ana@example.test',
        url: 'https://idp.example.test/api/auth/reset-password?token=secret',
      }),
    ).rejects.toThrow('Resend email delivery failed.')

    expect(events).toEqual([
      {
        email_operation: 'password_reset',
        event: 'email.delivery.attempted',
        provider: 'resend',
      },
      {
        email_operation: 'password_reset',
        event: 'email.delivery.failed',
        provider: 'resend',
      },
    ])
    expect(JSON.stringify(events)).not.toContain('provider detail')
    expect(JSON.stringify(events)).not.toContain('ana@example.test')
  })
})
