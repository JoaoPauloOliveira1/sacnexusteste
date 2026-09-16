import { describe, expect, it } from 'vitest'

import { parseDatabaseEnv, parseEnv } from '@/config/env.js'

const requiredEnv = {
  AUTH_EMAIL_FROM: 'SAC Nexus <auth@example.test>',
  AUTH_EMAIL_VERIFICATION_CALLBACK_URL: 'https://app.example.test/auth/email-verified',
  AUTH_PASSWORD_RESET_REDIRECT_URL: 'https://app.example.test/auth/reset-password',
  BETTER_AUTH_SECRET: 'test-secret-that-is-long-enough-for-better-auth',
  DATABASE_URL: 'postgresql://user:password@example.test:5432/idp',
  RESEND_API_KEY: 're_test_key',
}

describe('parseEnv', () => {
  it('requires explicit security and email configuration', () => {
    expect(() => parseEnv({})).toThrow()
  })

  it('uses defaults only for non-secret operational settings', () => {
    expect(parseEnv(requiredEnv)).toEqual({
      ...requiredEnv,
      AUTH_SESSION_EXPIRES_IN_SECONDS: 2_592_000,
      AUTH_TRUSTED_ORIGINS: [],
      CORS_ORIGINS: [],
      BETTER_AUTH_URL: 'http://127.0.0.1:3001',
      NODE_ENV: 'development',
      IDP_APP_ENV: 'local',
      IDP_HOST: '127.0.0.1',
      IDP_PORT: 3001,
      TIGRIS_ENDPOINT: 'https://t3.storage.dev',
      TIGRIS_REGION: 'auto',
    })
  })

  it('parses explicit values', () => {
    expect(
      parseEnv({
        NODE_ENV: 'test',
        IDP_APP_ENV: 'staging',
        IDP_HOST: '0.0.0.0',
        IDP_PORT: '4001',
        DATABASE_URL: 'postgresql://user:password@example.test:5432/idp',
        BETTER_AUTH_SECRET: 'test-secret-that-is-long-enough-for-better-auth',
        BETTER_AUTH_URL: 'https://idp.example.test',
        RESEND_API_KEY: 're_test_key',
        AUTH_EMAIL_FROM: 'SAC Nexus <auth@example.test>',
        AUTH_EMAIL_REPLY_TO: 'support@example.test',
        AUTH_EMAIL_VERIFICATION_CALLBACK_URL: 'https://app.example.test/auth/email-verified',
        AUTH_PASSWORD_RESET_REDIRECT_URL: 'https://app.example.test/auth/reset-password',
        AUTH_SESSION_EXPIRES_IN_SECONDS: '3600',
        AUTH_TRUSTED_ORIGINS: 'https://web.example.test, https://admin.example.test ',
      }),
    ).toEqual({
      AUTH_SESSION_EXPIRES_IN_SECONDS: 3600,
      AUTH_EMAIL_FROM: 'SAC Nexus <auth@example.test>',
      AUTH_EMAIL_REPLY_TO: 'support@example.test',
      AUTH_EMAIL_VERIFICATION_CALLBACK_URL: 'https://app.example.test/auth/email-verified',
      AUTH_PASSWORD_RESET_REDIRECT_URL: 'https://app.example.test/auth/reset-password',
      AUTH_TRUSTED_ORIGINS: ['https://web.example.test', 'https://admin.example.test'],
      CORS_ORIGINS: [],
      BETTER_AUTH_SECRET: 'test-secret-that-is-long-enough-for-better-auth',
      BETTER_AUTH_URL: 'https://idp.example.test',
      DATABASE_URL: 'postgresql://user:password@example.test:5432/idp',
      NODE_ENV: 'test',
      IDP_APP_ENV: 'staging',
      IDP_HOST: '0.0.0.0',
      IDP_PORT: 4001,
      RESEND_API_KEY: 're_test_key',
      TIGRIS_ENDPOINT: 'https://t3.storage.dev',
      TIGRIS_REGION: 'auto',
    })
  })

  it('rejects invalid app environments', () => {
    expect(() => parseEnv({ ...requiredEnv, IDP_APP_ENV: 'qa' })).toThrow()
  })

  it('rejects invalid ports', () => {
    expect(() => parseEnv({ ...requiredEnv, IDP_PORT: '0' })).toThrow()
  })

  it('requires database, auth secret, and email provider configuration for every app env', () => {
    expect(() => parseEnv({ IDP_APP_ENV: 'local' })).toThrow()
  })

  it('allows migration scripts to parse only database configuration', () => {
    expect(parseDatabaseEnv({ DATABASE_URL: requiredEnv.DATABASE_URL })).toEqual({
      DATABASE_URL: requiredEnv.DATABASE_URL,
    })
  })
})
