import { describe, expect, it } from 'vitest'

import { type ProcessoFull } from '@/database/processo-repository.js'
import {
  enviarAnalise,
  enviarMensagemProcesso,
  listarMensagensProcesso,
  retomarAnalise,
  type TriagemDeps,
} from '@/usecases/triagem/triagem-service.js'

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

  it('stores process messages and marks the recipient messages as read', async () => {
    const mensagens: Array<{
      id: string
      autorPapel: 'triador' | 'contribuinte'
      autorNome: string
      conteudo: string
      lidaEm: Date | null
      createdAt: Date
    }> = [
      {
        id: 'mensagem-1',
        autorPapel: 'contribuinte' as const,
        autorNome: 'Contribuinte',
        conteudo: 'Documento corrigido anexado.',
        lidaEm: null,
        createdAt: new Date('2026-09-16T12:00:00.000Z'),
      },
    ]
    const leituras: string[] = []
    const deps = {
      processos: {
        getProcessoFull: async () => processo,
        marcarMensagensComoLidas: async ({ leitorPapel }: { leitorPapel: string }) => {
          leituras.push(leitorPapel)
        },
        listProcessoMensagens: async () => mensagens,
        addProcessoMensagem: async ({ conteudo }: { conteudo: string }) => {
          mensagens.push({
            id: 'mensagem-2',
            autorPapel: 'triador',
            autorNome: 'Triador',
            conteudo,
            lidaEm: null,
            createdAt: new Date('2026-09-16T12:01:00.000Z'),
          })
          return mensagens[1]
        },
      },
    } as unknown as TriagemDeps

    await expect(
      enviarMensagemProcesso(
        processo.id,
        { autorPapel: 'triador', autorNome: 'Triador', conteudo: 'Recebido, obrigado.' },
        deps,
      ),
    ).resolves.toEqual({ ok: true })
    await expect(listarMensagensProcesso(processo.id, 'triador', deps)).resolves.toHaveLength(2)
    expect(leituras).toEqual(['triador'])
  })
})
