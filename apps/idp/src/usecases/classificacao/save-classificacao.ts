import { type ClassificacaoRepository } from '@/database/classificacao-repository.js'
import { type RiscoBand } from '@/database/schema.js'

export type SaveClassificacaoRequest = {
  unidadeId: string
  risco: RiscoBand
  origem?: string
  respostas: Array<{ perguntaId: string; grupo?: string; valor: unknown }>
  fatores?: unknown
}

export type SaveClassificacaoDeps = { classificacoes: ClassificacaoRepository }

export async function saveClassificacao(
  request: SaveClassificacaoRequest,
  deps: SaveClassificacaoDeps,
): Promise<{ classificacaoId: string }> {
  return deps.classificacoes.saveClassificacao({
    unidadeId: request.unidadeId,
    risco: request.risco,
    origem: request.origem ?? 'questionario',
    respostas: request.respostas,
    fatores: request.fatores ?? {},
    fonte: 'classificador',
  })
}
