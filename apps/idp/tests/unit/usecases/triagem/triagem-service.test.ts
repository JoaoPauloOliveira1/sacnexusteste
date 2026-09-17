import { describe, expect, it } from 'vitest'

import { type ProcessoFull } from '@/database/processo-repository.js'
import { type TriagemDeps, enviarAnalise, retomarAnalise } from '@/usecases/triagem/triagem-service.js'

const processo: ProcessoFull = {
  id: 'processo-1',
  organizationId: 'organizacao-1',
  unidadeId: null,
  eventoTemporarioId: null,
  classificacaoId: null,
  risco: 'II',
  fase: 'protocolado',
  tipoSolicitacao: 'novo',
  modalidade: 'regular',
  protocoloNumero: 'AVCB-2026-TESTE',
  protocoladoEm: new Date(),
  dadosComplementares: null,
  triadorResponsavel: 'Triador',
  analiseStatus: 'rascunho',
  createdAt: new Date(),
}

function createDeps(statuses: string[], exigencias: string[] = []): TriagemDeps {
  return {
    processos: {
      getProcessoFull: async () => processo,
      setAnaliseStatus: async ({ status }: { status: string }) => {
        statuses.push(status)
      },
      listTriagemItens: async () => [
        {
          itemTipo: 'documento',
          itemChave: 'N1-01',
          estado: 'em_exigencia',
          observacao: 'Anexe a planta baixa corrigida.',
          autor: 'Triador',
          createdAt: new Date(),
        },
      ],
      addExigencia: async ({ descricao }: { descricao: string }) => {
        exigencias.push(descricao)
      },
    },
  } as unknown as TriagemDeps
}

describe('triagem analysis visibility', () => {
  it('sends and resumes an analysis with the expected status', async () => {
    const statuses: string[] = []
    const exigencias: string[] = []
    const deps = createDeps(statuses, exigencias)

    await expect(enviarAnalise(processo.id, deps)).resolves.toEqual({
      ok: true,
      analiseStatus: 'enviada',
    })
    await expect(retomarAnalise(processo.id, deps)).resolves.toEqual({
      ok: true,
      analiseStatus: 'rascunho',
    })
    expect(statuses).toEqual(['enviada', 'rascunho'])
    expect(exigencias).toEqual(['Anexe a planta baixa corrigida.'])
  })
})
