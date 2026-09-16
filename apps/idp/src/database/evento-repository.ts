import { desc, eq, inArray } from 'drizzle-orm'

import { type Database } from '@/database/client.js'
import { eventoTemporario, processo, type RiscoBand } from '@/database/schema.js'

export type CreateEventoInput = {
  organizationId: string
  nome: string | null
  solicitanteNome: string | null
  solicitanteCpf: string | null
  risco: RiscoBand
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  inicioEm: Date
  terminoEm: Date
}

export type EventoRecord = {
  id: string
  organizationId: string
  nome: string | null
  risco: RiscoBand | null
  solicitanteNome: string | null
  solicitanteCpf: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  inicioEm: Date
  terminoEm: Date
}

export type EventoSummary = {
  id: string
  nome: string | null
  municipio: string | null
  uf: string | null
  risco: RiscoBand | null
  inicioEm: Date
  terminoEm: Date
  processo: { id: string; fase: string; risco: RiscoBand } | null
}

export type EventoRepository = {
  createEvento: (input: CreateEventoInput) => Promise<{ eventoId: string }>
  getEvento: (eventoId: string) => Promise<EventoRecord | null>
  listEventos: (organizationId: string) => Promise<EventoSummary[]>
}

export function createDrizzleEventoRepository(db: Database): EventoRepository {
  return {
    createEvento: async (input) => {
      const [row] = await db
        .insert(eventoTemporario)
        .values({
          organizationId: input.organizationId,
          nome: input.nome,
          solicitanteNome: input.solicitanteNome,
          solicitanteCpf: input.solicitanteCpf,
          risco: input.risco,
          cep: input.cep,
          logradouro: input.logradouro,
          numero: input.numero,
          complemento: input.complemento,
          bairro: input.bairro,
          municipio: input.municipio,
          uf: input.uf,
          inicioEm: input.inicioEm,
          terminoEm: input.terminoEm,
        })
        .returning({ id: eventoTemporario.id })
      if (!row) {
        throw new Error('Falha ao criar o evento temporário.')
      }
      return { eventoId: row.id }
    },

    getEvento: async (eventoId) => {
      const [row] = await db
        .select()
        .from(eventoTemporario)
        .where(eq(eventoTemporario.id, eventoId))
        .limit(1)
      if (!row) return null
      return {
        id: row.id,
        organizationId: row.organizationId,
        nome: row.nome,
        risco: row.risco,
        solicitanteNome: row.solicitanteNome,
        solicitanteCpf: row.solicitanteCpf,
        cep: row.cep,
        logradouro: row.logradouro,
        numero: row.numero,
        complemento: row.complemento,
        bairro: row.bairro,
        municipio: row.municipio,
        uf: row.uf,
        inicioEm: row.inicioEm,
        terminoEm: row.terminoEm,
      }
    },

    listEventos: async (organizationId) => {
      const rows = await db
        .select({
          id: eventoTemporario.id,
          nome: eventoTemporario.nome,
          municipio: eventoTemporario.municipio,
          uf: eventoTemporario.uf,
          risco: eventoTemporario.risco,
          inicioEm: eventoTemporario.inicioEm,
          terminoEm: eventoTemporario.terminoEm,
        })
        .from(eventoTemporario)
        .where(eq(eventoTemporario.organizationId, organizationId))
        .orderBy(desc(eventoTemporario.createdAt))
      if (rows.length === 0) return []
      const ids = rows.map((row) => row.id)

      const processos = await db
        .select({
          eventoId: processo.eventoTemporarioId,
          id: processo.id,
          fase: processo.fase,
          risco: processo.risco,
          createdAt: processo.createdAt,
        })
        .from(processo)
        .where(inArray(processo.eventoTemporarioId, ids))
        .orderBy(desc(processo.createdAt))
      const procByEvento = new Map<string, { id: string; fase: string; risco: RiscoBand }>()
      for (const row of processos) {
        if (row.eventoId && !procByEvento.has(row.eventoId)) {
          procByEvento.set(row.eventoId, { id: row.id, fase: row.fase, risco: row.risco })
        }
      }

      return rows.map((row) => ({ ...row, processo: procByEvento.get(row.id) ?? null }))
    },
  }
}
