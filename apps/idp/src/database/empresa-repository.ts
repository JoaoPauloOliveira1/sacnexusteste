import { randomUUID } from 'node:crypto'
import { eq, inArray, sql } from 'drizzle-orm'

import { type Database } from '@/database/client.js'
import {
  cnae,
  organization,
  pessoaJuridica,
  pessoaJuridicaCnae,
  pessoaJuridicaSocio,
  processo,
  type RiscoBand,
  unidade,
  unidadeCnae,
} from '@/database/schema.js'

export type CnaeBand = { cnaeId: string; numerico: string; band: RiscoBand }

export type EmpresaListItem = {
  empresaId: string
  cnpj: string
  razaoSocial: string
  nomeFantasia: string | null
  municipio: string | null
  uf: string | null
  cnaeCount: number
  unidadeCount: number
}

export type SaveEmpresaInput = {
  organizationId: string
  cnpj: string
  legalName: string
  tradeName: string
  registrationStatus: string
  legalNature: string
  porte: string
  email: string
  phone: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  openingDate: Date | null
  cnaeLinks: Array<{ cnaeId: string; principal: boolean }>
  socios: Array<{ nome: string; documento: string; qualificacao: string }>
}

export type EmpresaRepository = {
  /** Maps 7-digit CNAE `numerico` values to their seeded id + preliminary risk band. */
  findCnaeBandsByNumerico: (numericos: string[]) => Promise<Map<string, CnaeBand>>
  /** Upserts the empresa (by organization + CNPJ) and replaces its CNAE links + sócios. */
  saveEmpresa: (input: SaveEmpresaInput) => Promise<{ empresaId: string }>
  /** Lists the tenant's persisted empresas with CNAE + unidade counts (for the Unidades area). */
  listEmpresas: (organizationId: string) => Promise<EmpresaListItem[]>
  /** Loads an empresa's id + CNPJ (to confirm a deletion). Null when not found. */
  getEmpresaById: (empresaId: string) => Promise<{ empresaId: string; cnpj: string } | null>
  /**
   * Permanently deletes an empresa and everything under it (unidades, their
   * processos + documentos/pagamentos/histórico, classificações, CNAE links,
   * sócios), in a single transaction.
   */
  deleteEmpresa: (empresaId: string) => Promise<void>
  /**
   * Dev convenience: resolves a fixed default organization (create-or-get by slug).
   * Temporary until tenant/auth resolution replaces the explicit `organizationId`.
   */
  ensureDefaultOrganization: () => Promise<string>
}

export function createDrizzleEmpresaRepository(db: Database): EmpresaRepository {
  return {
    ensureDefaultOrganization: async () => {
      const [org] = await db
        .insert(organization)
        .values({ id: randomUUID(), name: 'SAC Nexus (dev)', slug: 'sac-nexus-dev' })
        .onConflictDoUpdate({ target: organization.slug, set: { name: 'SAC Nexus (dev)' } })
        .returning({ id: organization.id })
      if (!org) {
        throw new Error('Falha ao resolver a organização padrão.')
      }
      return org.id
    },

    listEmpresas: async (organizationId) => {
      const empresas = await db
        .select({
          empresaId: pessoaJuridica.id,
          cnpj: pessoaJuridica.cnpj,
          razaoSocial: pessoaJuridica.razaoSocial,
          nomeFantasia: pessoaJuridica.nomeFantasia,
          municipio: pessoaJuridica.municipio,
          uf: pessoaJuridica.uf,
        })
        .from(pessoaJuridica)
        .where(eq(pessoaJuridica.organizationId, organizationId))
        .orderBy(pessoaJuridica.razaoSocial)

      if (empresas.length === 0) return []
      const ids = empresas.map((row) => row.empresaId)

      const cnaeCounts = await db
        .select({ id: pessoaJuridicaCnae.pessoaJuridicaId, n: sql<number>`count(*)::int` })
        .from(pessoaJuridicaCnae)
        .where(inArray(pessoaJuridicaCnae.pessoaJuridicaId, ids))
        .groupBy(pessoaJuridicaCnae.pessoaJuridicaId)
      const unidadeCounts = await db
        .select({ id: unidade.pessoaJuridicaId, n: sql<number>`count(*)::int` })
        .from(unidade)
        .where(inArray(unidade.pessoaJuridicaId, ids))
        .groupBy(unidade.pessoaJuridicaId)

      const cnaeMap = new Map(cnaeCounts.map((row) => [row.id, row.n]))
      const unidadeMap = new Map(unidadeCounts.map((row) => [row.id, row.n]))

      return empresas.map((row) => ({
        ...row,
        cnaeCount: cnaeMap.get(row.empresaId) ?? 0,
        unidadeCount: unidadeMap.get(row.empresaId) ?? 0,
      }))
    },

    getEmpresaById: async (empresaId) => {
      const [row] = await db
        .select({ empresaId: pessoaJuridica.id, cnpj: pessoaJuridica.cnpj })
        .from(pessoaJuridica)
        .where(eq(pessoaJuridica.id, empresaId))
        .limit(1)
      return row ?? null
    },

    deleteEmpresa: async (empresaId) => {
      await db.transaction(async (tx) => {
        const unidades = await tx
          .select({ id: unidade.id })
          .from(unidade)
          .where(eq(unidade.pessoaJuridicaId, empresaId))
        const unidadeIds = unidades.map((row) => row.id)

        if (unidadeIds.length > 0) {
          // Processos reference unidade with ON DELETE SET NULL, so remove them
          // first (cascades documentos/pagamentos/histórico) to avoid orphans.
          await tx.delete(processo).where(inArray(processo.unidadeId, unidadeIds))
          // Deleting unidades cascades unidade_cnae + classificações (and their
          // respostas/contexto/ia) via ON DELETE CASCADE.
          await tx.delete(unidade).where(eq(unidade.pessoaJuridicaId, empresaId))
        }

        // Deleting the empresa cascades pessoa_juridica_cnae, sócios and vínculos.
        await tx.delete(pessoaJuridica).where(eq(pessoaJuridica.id, empresaId))
      })
    },

    findCnaeBandsByNumerico: async (numericos) => {
      const unique = [...new Set(numericos)].filter(Boolean)
      const map = new Map<string, CnaeBand>()
      if (unique.length === 0) return map

      const rows = await db
        .select({ id: cnae.id, numerico: cnae.numerico, band: cnae.preliminaryBand })
        .from(cnae)
        .where(inArray(cnae.numerico, unique))

      for (const row of rows) {
        map.set(row.numerico, { cnaeId: row.id, numerico: row.numerico, band: row.band })
      }
      return map
    },

    saveEmpresa: async (input) =>
      db.transaction(async (tx) => {
        const [empresa] = await tx
          .insert(pessoaJuridica)
          .values({
            organizationId: input.organizationId,
            cnpj: input.cnpj,
            razaoSocial: input.legalName || '—',
            nomeFantasia: input.tradeName || null,
            email: input.email || null,
            telefone: input.phone || null,
            naturezaJuridica: input.legalNature || null,
            porte: input.porte || null,
            situacaoCadastral: input.registrationStatus || null,
            aberturaEm: input.openingDate,
            cep: input.cep || null,
            logradouro: input.street || null,
            numero: input.number || null,
            complemento: input.complement || null,
            bairro: input.neighborhood || null,
            municipio: input.city || null,
            uf: input.state || null,
          })
          .onConflictDoUpdate({
            target: [pessoaJuridica.organizationId, pessoaJuridica.cnpj],
            set: {
              razaoSocial: input.legalName || '—',
              nomeFantasia: input.tradeName || null,
              email: input.email || null,
              telefone: input.phone || null,
              naturezaJuridica: input.legalNature || null,
              porte: input.porte || null,
              situacaoCadastral: input.registrationStatus || null,
              aberturaEm: input.openingDate,
              cep: input.cep || null,
              logradouro: input.street || null,
              numero: input.number || null,
              complemento: input.complement || null,
              bairro: input.neighborhood || null,
              municipio: input.city || null,
              uf: input.state || null,
            },
          })
          .returning({ id: pessoaJuridica.id })

        if (!empresa) {
          throw new Error('Falha ao salvar a empresa.')
        }
        const empresaId = empresa.id

        await tx
          .delete(pessoaJuridicaCnae)
          .where(eq(pessoaJuridicaCnae.pessoaJuridicaId, empresaId))
        await tx
          .delete(pessoaJuridicaSocio)
          .where(eq(pessoaJuridicaSocio.pessoaJuridicaId, empresaId))

        if (input.cnaeLinks.length > 0) {
          await tx.insert(pessoaJuridicaCnae).values(
            input.cnaeLinks.map((link) => ({
              pessoaJuridicaId: empresaId,
              cnaeId: link.cnaeId,
              principal: link.principal,
            })),
          )
        }
        if (input.socios.length > 0) {
          await tx.insert(pessoaJuridicaSocio).values(
            input.socios.map((socio) => ({
              pessoaJuridicaId: empresaId,
              nome: socio.nome || '—',
              cpf: socio.documento || null,
              qualificacao: socio.qualificacao || null,
            })),
          )
        }

        // Every empresa gets a "Matriz" unit created up front (born incomplete):
        // it carries the Receita address + all the empresa's CNAEs, and the
        // contribuinte later completes it (área, pavimentos, ocupação, tipo).
        // Idempotent: only create it when the empresa has no unit yet.
        const [existingUnidade] = await tx
          .select({ id: unidade.id })
          .from(unidade)
          .where(eq(unidade.pessoaJuridicaId, empresaId))
          .limit(1)

        if (!existingUnidade) {
          const [matriz] = await tx
            .insert(unidade)
            .values({
              organizationId: input.organizationId,
              pessoaJuridicaId: empresaId,
              nome: 'Matriz',
              isMatriz: true,
              cep: input.cep || null,
              logradouro: input.street || null,
              numero: input.number || null,
              complemento: input.complement || null,
              bairro: input.neighborhood || null,
              municipio: input.city || null,
              uf: input.state || null,
            })
            .returning({ id: unidade.id })

          if (matriz && input.cnaeLinks.length > 0) {
            await tx.insert(unidadeCnae).values(
              input.cnaeLinks.map((link) => ({
                unidadeId: matriz.id,
                cnaeId: link.cnaeId,
                principal: link.principal,
              })),
            )
          }
        }

        return { empresaId }
      }),
  }
}
