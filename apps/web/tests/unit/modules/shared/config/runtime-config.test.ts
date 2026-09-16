import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getRuntimeConfig,
  loadRuntimeConfig,
  parseRuntimeConfig,
  setRuntimeConfig,
} from '@/modules/shared/config/runtime-config'

const validConfig = {
  apiUrl: '/api',
  authUrl: '/api/auth',
  appName: 'SAC Nexus',
  appEnv: 'staging',
  enableMsw: false,
} as const

describe('runtime config', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('parses a valid public runtime config', () => {
    const config = parseRuntimeConfig(validConfig)

    expect(config).toEqual(validConfig)
  })

  it('rejects invalid public runtime config', () => {
    expect(() =>
      parseRuntimeConfig({
        apiUrl: '/api',
        authUrl: '/api/auth',
        appName: 'SAC Nexus',
        appEnv: 'invalid',
        enableMsw: false,
      }),
    ).toThrow()
  })

  it('stores and returns the loaded runtime config', () => {
    setRuntimeConfig(validConfig)

    expect(getRuntimeConfig()).toEqual(validConfig)
  })

  it('loads runtime config from /config.json', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => validConfig,
        ok: true,
      })),
    )

    await expect(loadRuntimeConfig()).resolves.toEqual(validConfig)
    expect(fetch).toHaveBeenCalledWith('/config.json', { cache: 'no-store' })
    expect(getRuntimeConfig()).toEqual(validConfig)
  })
})
