import { env, type PublicRuntimeConfig, publicRuntimeConfigSchema } from './env'

let runtimeConfig: PublicRuntimeConfig | undefined

export function parseRuntimeConfig(input: unknown): PublicRuntimeConfig {
  return publicRuntimeConfigSchema.parse(input)
}

export function setRuntimeConfig(config: PublicRuntimeConfig) {
  runtimeConfig = config
}

export function getRuntimeConfig() {
  if (!runtimeConfig) {
    throw new Error('Runtime config has not been loaded')
  }

  return runtimeConfig
}

export async function loadRuntimeConfig() {
  try {
    const response = await fetch('/config.json', { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`Failed to load runtime config: ${response.status}`)
    }

    const config = parseRuntimeConfig(await response.json())
    setRuntimeConfig(config)

    return config
  } catch (error) {
    if (import.meta.env.DEV) {
      setRuntimeConfig(env)

      return env
    }

    throw error
  }
}
