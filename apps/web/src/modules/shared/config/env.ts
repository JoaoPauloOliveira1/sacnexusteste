import { z } from 'zod'

export const appEnvSchema = z.enum(['local', 'development', 'staging', 'production'])

export const publicRuntimeConfigSchema = z.object({
  apiUrl: z.string().min(1),
  authUrl: z.string().min(1),
  appName: z.string().min(1),
  appEnv: appEnvSchema,
  enableMsw: z.boolean(),
  googleMapsApiKey: z.string().optional(),
})

export type PublicRuntimeConfig = z.infer<typeof publicRuntimeConfigSchema>

const envSchema = z.object({
  VITE_API_URL: z.string().min(1).default('/api'),
  VITE_AUTH_URL: z.string().min(1).default('/api/auth'),
  VITE_APP_NAME: z.string().min(1).default('SAC Nexus'),
  VITE_APP_ENV: appEnvSchema.default('local'),
  VITE_ENABLE_MSW: z.coerce.boolean().default(false),
  VITE_GOOGLE_MAPS_API_KEY: z.string().optional(),
})

const parsedEnv = envSchema.parse(import.meta.env)

export const env: PublicRuntimeConfig = {
  apiUrl: parsedEnv.VITE_API_URL,
  authUrl: parsedEnv.VITE_AUTH_URL,
  appName: parsedEnv.VITE_APP_NAME,
  appEnv: parsedEnv.VITE_APP_ENV,
  enableMsw: parsedEnv.VITE_ENABLE_MSW,
  googleMapsApiKey: parsedEnv.VITE_GOOGLE_MAPS_API_KEY,
} as const
