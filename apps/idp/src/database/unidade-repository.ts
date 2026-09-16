import { desc, eq, inArray } from 'drizzle-orm'

import { type Database } from '@/database/client.js'
import {
  classificacao,
  cnae,
  pessoaJuridica,
  pessoaJuridicaCnae,
  processo,
  type RiscoBand,
  unidade,
  unidadeCnae,
} from '@/database/schema.js'

export type EmpresaSummary = {
  organizationId: string
  razaoSocial: string
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
}

export type CnaeOption = {
  cnaeId: string
  codigo: string
  descricao: string
  band: RiscoBand
  principal: boolean
}

export type CreateUnidadeInput = {
  organizationId: string
  pessoaJuridicaId: string
  nome: string | null
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  areaConstruida: string | null
  cnaeIds: string[]
}

export type UnidadeSummary = {
  id: string
  nome: string | null
  municipio: string | null
  uf: string | null
  areaConstruida: string | null
  isMatriz: boolean
  /** True when área, pavimentos, ocupação and tipo de exploração are all filled. */
  completa: boolean
  /** Risk of the unit's most recent classification (null = not classified yet). */
  riscoAtual: RiscoBand | null
  /** The unit's most recent processo (DDLCB/AVCB), if any. */
  processo: { id: string; fase: string; risco: RiscoBand } | null
}

export type UnidadeDetail = {
  id: string
  nome: string | null
  isMatriz: boolean
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
  areaConstruida: string | null
  pavimentos: number | null
  ocupacao: number | null
  tipoExploracao: string | null
}

export type UpdateUnidadeInput = {
  unidadeId: string
  nome?: string | null
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  municipio?: string | null
  uf?: string | null
  areaConstruida?: string | null
  pavimentos?: number | null
  ocupacao?: number | null
  tipoExploracao?: string | null
}

export type UnidadeRepository = {
  findEmpresa: (pessoaJuridicaId: string) => Promise<EmpresaSummary | null>
  listEmpresaCnaes: (pessoaJuridicaId: string) => Promise<CnaeOption[]>
  createUnidade: (input: CreateUnidadeInput) => Promise<{ unidadeId: string }>
  listUnidadeCnaes: (unidadeId: string) => Promise<CnaeOption[]>
  listUnidadesByEmpresa: (pessoaJuridicaId: string) => Promise<UnidadeSummary[]>
  getUnidade: (unidadeId: string) => Promise<UnidadeDetail | null>
  updateUnidade: (input: UpdateUnidadeInput) => Promise<void>
}

export function createDrizzleUnidadeRepository(db: Database): UnidadeRepository {
  return {
    findEmpresa: async (pessoaJuridicaId) => {
      const [row] = await db
        .select({
          organizationId: pessoaJuridica.organizationId,
          razaoSocial: pessoaJuridica.razaoSocial,
          cep: pessoaJuridica.cep,
          logradouro: pessoaJuridica.logradouro,
          numero: pessoaJuridica.numero,
          complemento: pessoaJuridica.complemento,
          bairro: pessoaJuridica.bairro,
          municipio: pessoaJuridica.municipio,
          uf: pessoaJuridica.uf,
        })
        .from(pessoaJuridica)
        .where(eq(pessoaJuridica.id, pessoaJuridicaId))
        .limit(1)
      return row ?? null
    },

    listEmpresaCnaes: async (pessoaJuridicaId) =>
      db
        .select({
          cnaeId: cnae.id,
          codigo: cnae.codigo,
          descricao: cnae.atividade,
          band: cnae.preliminaryBand,
          principal: pessoaJuridicaCnae.principal,
        })
        .from(pessoaJuridicaCnae)
        .innerJoin(cnae, eq(pessoaJuridicaCnae.cnaeId, cnae.id))
        .where(eq(pessoaJuridicaCnae.pessoaJuridicaId, pessoaJuridicaId)),

    createUnidade: async (input) =>
      db.transaction(async (tx) => {
        const [row] = await tx
          .insert(unidade)
          .values({
            organizationId: input.organizationId,
            pessoaJuridicaId: input.pessoaJuridicaId,
            nome: input.nome,
            cep: input.cep,
            logradouro: input.logradouro,
            numero: input.numero,
            complemento: input.complemento,
            bairro: input.bairro,
            municipio: input.municipio,
            uf: input.uf,
            areaConstruida: input.areaConstruida,
          })
          .returning({ id: unidade.id })

        if (!row) {
          throw new Error('Falha ao criar a unidade.')
        }

        if (input.cnaeIds.length > 0) {
          await tx
            .insert(unidadeCnae)
            .values(input.cnaeIds.map((cnaeId) => ({ unidadeId: row.id, cnaeId })))
        }

        return { unidadeId: row.id }
      }),

    listUnidadeCnaes: async (unidadeId) => {
      const rows = await db
        .select({
          cnaeId: cnae.id,
          codigo: cnae.codigo,
          descricao: cnae.atividade,
          band: cnae.preliminaryBand,
        })
        .from(unidadeCnae)
        .innerJoin(cnae, eq(unidadeCnae.cnaeId, cnae.id))
        .where(eq(unidadeCnae.unidadeId, unidadeId))
      return rows.map((row) => ({ ...row, principal: false }))
    },

    listUnidadesByEmpresa: async (pessoaJuridicaId) => {
      const rows = await db
        .select({
          id: unidade.id,
          nome: unidade.nome,
          municipio: unidade.municipio,
          uf: unidade.uf,
          areaConstruida: unidade.areaConstruida,
          isMatriz: unidade.isMatriz,
          pavimentos: unidade.pavimentos,
          ocupacao: unidade.ocupacao,
          tipoExploracao: unidade.tipoExploracao,
        })
        .from(unidade)
        .where(eq(unidade.pessoaJuridicaId, pessoaJuridicaId))
        .orderBy(desc(unidade.isMatriz), unidade.nome)
      if (rows.length === 0) return []
      const ids = rows.map((row) => row.id)

      const classificacoes = await db
        .select({
          unidadeId: classificacao.unidadeId,
          risco: classificacao.risco,
          createdAt: classificacao.createdAt,
        })
        .from(classificacao)
        .where(inArray(classificacao.unidadeId, ids))
        .orderBy(desc(classificacao.createdAt))
      const processos = await db
        .select({
          unidadeId: processo.unidadeId,
          id: processo.id,
          fase: processo.fase,
          risco: processo.risco,
          createdAt: processo.createdAt,
        })
        .from(processo)
        .where(inArray(processo.unidadeId, ids))
        .orderBy(desc(processo.createdAt))

      const riscoByUnidade = new Map<string, RiscoBand>()
      for (const row of classificacoes) {
        if (row.unidadeId && !riscoByUnidade.has(row.unidadeId)) {
          riscoByUnidade.set(row.unidadeId, row.risco)
        }
      }
      const procByUnidade = new Map<string, { id: string; fase: string; risco: RiscoBand }>()
      for (const row of processos) {
        if (row.unidadeId && !procByUnidade.has(row.unidadeId)) {
          procByUnidade.set(row.unidadeId, { id: row.id, fase: row.fase, risco: row.risco })
        }
      }

      return rows.map(({ pavimentos, ocupacao, tipoExploracao, ...row }) => ({
        ...row,
        completa:
          row.areaConstruida != null &&
          pavimentos != null &&
          ocupacao != null &&
          Boolean(tipoExploracao),
        riscoAtual: riscoByUnidade.get(row.id) ?? null,
        processo: procByUnidade.get(row.id) ?? null,
      }))
    },

    getUnidade: async (unidadeId) => {
      const [row] = await db
        .select({
          id: unidade.id,
          nome: unidade.nome,
          isMatriz: unidade.isMatriz,
          cep: unidade.cep,
          logradouro: unidade.logradouro,
          numero: unidade.numero,
          complemento: unidade.complemento,
          bairro: unidade.bairro,
          municipio: unidade.municipio,
          uf: unidade.uf,
          areaConstruida: unidade.areaConstruida,
          pavimentos: unidade.pavimentos,
          ocupacao: unidade.ocupacao,
          tipoExploracao: unidade.tipoExploracao,
        })
        .from(unidade)
        .where(eq(unidade.id, unidadeId))
        .limit(1)
      return row ?? null
    },

    updateUnidade: async ({ unidadeId, ...fields }) => {
      // Only set the fields that were provided (undefined = leave as-is; null clears).
      const patch = Object.fromEntries(
        Object.entries(fields).filter(([, value]) => value !== undefined),
      )
      if (Object.keys(patch).length === 0) return
      await db.update(unidade).set(patch).where(eq(unidade.id, unidadeId))
    },
  }
}
