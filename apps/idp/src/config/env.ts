import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'

const appEnvFilePath = fileURLToPath(new URL('../../.env', import.meta.url))

loadAppEnvFile()

function loadAppEnvFile(): void {
  if (process.env.NODE_ENV === 'test') {
    return
  }

  try {
    loadEnvFile(appEnvFilePath)
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error
    }
  }
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}

export const appEnvSchema = z.enum(['local', 'development', 'staging', 'production'])

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  IDP_APP_ENV: appEnvSchema.default('local'),
  IDP_HOST: z.string().min(1).default('127.0.0.1'),
  IDP_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url().default('http://127.0.0.1:3001'),
  AUTH_TRUSTED_ORIGINS: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean)
        : [],
    ),
  // Browser origins allowed to call the domain API (the web app). Comma-separated.
  CORS_ORIGINS: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean)
        : [],
    ),
  AUTH_SESSION_EXPIRES_IN_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60 * 60 * 24 * 30),
  RESEND_API_KEY: z.string().min(1),
  AUTH_EMAIL_FROM: z.string().min(3),
  AUTH_EMAIL_REPLY_TO: z.string().min(3).optional(),
  AUTH_EMAIL_VERIFICATION_CALLBACK_URL: z.url(),
  AUTH_PASSWORD_RESET_REDIRECT_URL: z.url(),
  // Tigris (S3-compatible) object storage for uploaded documents (N1-01 PDFs).
  // Optional: when key/secret/bucket are unset, upload endpoints return 503 and
  // the app still boots.
  TIGRIS_ENDPOINT: z.string().min(1).default('https://t3.storage.dev'),
  TIGRIS_REGION: z.string().min(1).default('auto'),
  TIGRIS_BUCKET: z.string().min(1).optional(),
  TIGRIS_ACCESS_KEY_ID: z.string().min(1).optional(),
  TIGRIS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
})

export type Env = z.infer<typeof envSchema>

const databaseEnvSchema = envSchema.pick({ DATABASE_URL: true })

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>

export function parseEnv(input: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(input)
}

export function parseDatabaseEnv(input: NodeJS.ProcessEnv = process.env): DatabaseEnv {
  return databaseEnvSchema.parse(input)
}

let cachedEnv: Env | undefined

function getEnv(): Env {
  cachedEnv ??= parseEnv()

  return cachedEnv
}

export const env = new Proxy({} as Env, {
  get(_target, property, receiver) {
    return Reflect.get(getEnv(), property, receiver)
  },
})
