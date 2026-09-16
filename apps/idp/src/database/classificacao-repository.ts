import { desc, eq } from 'drizzle-orm'

import { type Database } from '@/database/client.js'
import {
  classificacao,
  contextoClassificacao,
  type RespostaGrupo,
  type RiscoBand,
  resposta,
  unidade,
} from '@/database/schema.js'

export type SaveClassificacaoInput = {
  unidadeId: string
  risco: RiscoBand
  origem: string
  respostas: Array<{ perguntaId: string; grupo?: string | null; valor: unknown }>
  fatores: unknown
  fonte: string
}

export type ClassificacaoSummary = {
  id: string
  risco: RiscoBand
  origem: string
  concluidaEm: Date | null
  createdAt: Date
}

export type RespostaRecord = { perguntaId: string; grupo: string | null; valor: unknown }

export type ClassificacaoRepository = {
  /** Persists a classification tied to a Unidade, with its answers + context factors. */
  saveClassificacao: (input: SaveClassificacaoInput) => Promise<{ classificacaoId: string }>
  listByUnidade: (unidadeId: string) => Promise<ClassificacaoSummary[]>
  /** Answers recorded for a classification (for triagem context). */
  getRespostas: (classificacaoId: string) => Promise<RespostaRecord[]>
}

export function createDrizzleClassificacaoRepository(db: Database): ClassificacaoRepository {
  return {
    saveClassificacao: async (input) =>
      db.transaction(async (tx) => {
        const [unit] = await tx
          .select({ organizationId: unidade.organizationId })
          .from(unidade)
          .where(eq(unidade.id, input.unidadeId))
          .limit(1)

        if (!unit) {
          throw new Error('Unidade não encontrada.')
        }

        const [row] = await tx
          .insert(classificacao)
          .values({
            organizationId: unit.organizationId,
            unidadeId: input.unidadeId,
            risco: input.risco,
            origem: input.origem,
            concluidaEm: new Date(),
          })
          .returning({ id: classificacao.id })

        if (!row) {
          throw new Error('Falha ao salvar a classificação.')
        }

        if (input.respostas.length > 0) {
          await tx.insert(resposta).values(
            input.respostas.map((r) => ({
              classificacaoId: row.id,
              perguntaId: r.perguntaId,
              grupo:
                r.grupo === 'ocupacao' || r.grupo === 'publico' ? (r.grupo as RespostaGrupo) : null,
              valor: r.valor,
            })),
          )
        }

        await tx.insert(contextoClassificacao).values({
          classificacaoId: row.id,
          fatores: input.fatores,
          fonte: input.fonte,
        })

        return { classificacaoId: row.id }
      }),

    listByUnidade: async (unidadeId) =>
      db
        .select({
          id: classificacao.id,
          risco: classificacao.risco,
          origem: classificacao.origem,
          concluidaEm: classificacao.concluidaEm,
          createdAt: classificacao.createdAt,
        })
        .from(classificacao)
        .where(eq(classificacao.unidadeId, unidadeId))
        .orderBy(desc(classificacao.createdAt)),

    getRespostas: async (classificacaoId) =>
      db
        .select({
          perguntaId: resposta.perguntaId,
          grupo: resposta.grupo,
          valor: resposta.valor,
        })
        .from(resposta)
        .where(eq(resposta.classificacaoId, classificacaoId)),
  }
}
