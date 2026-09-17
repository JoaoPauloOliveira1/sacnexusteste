import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { enviarAnaliseTriagem } from '@/modules/shared/api/triagem'
import { setRuntimeConfig } from '@/modules/shared/config/runtime-config'

describe('triagem API', () => {
  beforeEach(() => {
    setRuntimeConfig({
      apiUrl: 'https://api.example.test/api',
      authUrl: 'https://api.example.test/api/auth',
      appName: 'SAC Nexus',
      appEnv: 'local',
      enableMsw: false,
    })
  })

  afterEach(() => vi.unstubAllGlobals())

  it('does not send an empty JSON body when publishing an analysis', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, analiseStatus: 'enviada' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await expect(enviarAnaliseTriagem('processo-1')).resolves.toEqual({
      ok: true,
      analiseStatus: 'enviada',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.test/api/triagem/processos/processo-1/analise/enviar',
      { credentials: 'include', method: 'POST' },
    )
  })
})
