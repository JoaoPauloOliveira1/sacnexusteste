import { describe, expect, it } from 'vitest'

import { type AvcbDeps, startAvcb } from '@/usecases/processo/avcb-service.js'

describe('startAvcb', () => {
  it('returns the active process for the unit instead of opening another one', async () => {
    const deps = {
      processos: {
        getUnidadeDossie: async () => ({ organizationId: 'organizacao-1' }),
        getLatestProcessoByUnidade: async () => ({
          id: 'processo-ativo',
          risco: 'III',
          fase: 'em_exigencia',
          protocoloNumero: 'AVCB-2026-ATIVO',
        }),
        createAvcbProcesso: async () => {
          throw new Error('Não deve criar um segundo processo.')
        },
      },
      classificacoes: {
        listByUnidade: async () => [{ id: 'classificacao-1', risco: 'III' }],
      },
    } as unknown as AvcbDeps

    await expect(
      startAvcb('unidade-1', { dadosComplementares: {}, documentos: [] }, deps),
    ).resolves.toEqual({
      processoId: 'processo-ativo',
      risco: 'III',
      fase: 'em_exigencia',
      protocoloNumero: 'AVCB-2026-ATIVO',
      jaExistia: true,
    })
  })
})
