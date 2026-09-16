import { type EmpresaRepository } from '@/database/empresa-repository.js'
import { type RiscoBand, riscoBands } from '@/database/schema.js'
import {
  CnpjLookupError,
  type CnpjLookupProvider,
} from '@/infra/integrations/cnpj/cnpj-provider.js'
import { getCnpjDigits, isValidCnpj } from '@/infra/validation/cnpj.js'

export type RegisterEmpresaInput = {
  cnpj: string
  /** Optional: when omitted, a dev default organization is resolved (temporary). */
  organizationId?: string
}

export type RegisterEmpresaDeps = {
  cnpjProvider: CnpjLookupProvider
  empresas: EmpresaRepository
}

export type EmpresaCnaeResult = {
  codigo: string
  descricao: string
  principal: boolean
  /** Preliminary risk band from Decreto 61.082/2026, or null if the CNAE is not in the table. */
  band: RiscoBand | null
}

export type RegisterEmpresaResult = {
  empresaId: string
  cnpj: string
  legalName: string
  tradeName: string
  registrationStatus: string
  legalNature: string
  porte: string
  /** ISO date (YYYY-MM-DD) or null. */
  openingDate: string | null
  email: string
  phone: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  overallRisk: RiscoBand | null
  cnaes: EmpresaCnaeResult[]
  socios: Array<{ nome: string; documento: string; qualificacao: string }>
  source: string
}

const BAND_RANK: Record<RiscoBand, number> = {
  [riscoBands.i]: 0,
  [riscoBands.undetermined]: 1,
  [riscoBands.ii]: 2,
  [riscoBands.iii]: 3,
}

function highestBand(bands: Array<RiscoBand | null>): RiscoBand | null {
  let best: RiscoBand | null = null
  for (const band of bands) {
    if (band && (best === null || BAND_RANK[band] > BAND_RANK[best])) {
      best = band
    }
  }
  return best
}

export async function registerEmpresaFromCnpj(
  input: RegisterEmpresaInput,
  deps: RegisterEmpresaDeps,
): Promise<RegisterEmpresaResult> {
  const digits = getCnpjDigits(input.cnpj)
  if (!isValidCnpj(digits)) {
    throw new CnpjLookupError('invalid', 'Informe um CNPJ válido.')
  }

  const organizationId = input.organizationId ?? (await deps.empresas.ensureDefaultOrganization())

  const company = await deps.cnpjProvider.fetch(digits)

  const bandByNumerico = await deps.empresas.findCnaeBandsByNumerico(
    company.cnaes.map((entry) => entry.numerico),
  )

  const cnaeLinks: Array<{ cnaeId: string; principal: boolean }> = []
  const cnaes: EmpresaCnaeResult[] = company.cnaes.map((entry) => {
    const match = bandByNumerico.get(entry.numerico)
    if (match) {
      cnaeLinks.push({ cnaeId: match.cnaeId, principal: entry.principal })
    }
    return {
      codigo: entry.codigo,
      descricao: entry.descricao,
      principal: entry.principal,
      band: match?.band ?? null,
    }
  })

  const openingDate = company.openingDate ? new Date(company.openingDate) : null

  const { empresaId } = await deps.empresas.saveEmpresa({
    organizationId,
    cnpj: digits,
    legalName: company.legalName,
    tradeName: company.tradeName,
    registrationStatus: company.registrationStatus,
    legalNature: company.legalNature,
    porte: company.porte,
    email: company.email,
    phone: company.phone,
    cep: company.cep,
    street: company.street,
    number: company.number,
    complement: company.complement,
    neighborhood: company.neighborhood,
    city: company.city,
    state: company.state,
    openingDate: openingDate && !Number.isNaN(openingDate.getTime()) ? openingDate : null,
    cnaeLinks,
    socios: company.socios,
  })

  return {
    empresaId,
    cnpj: digits,
    legalName: company.legalName,
    tradeName: company.tradeName,
    registrationStatus: company.registrationStatus,
    legalNature: company.legalNature,
    porte: company.porte,
    openingDate: company.openingDate,
    email: company.email,
    phone: company.phone,
    cep: company.cep,
    street: company.street,
    number: company.number,
    complement: company.complement,
    neighborhood: company.neighborhood,
    city: company.city,
    state: company.state,
    overallRisk: highestBand(cnaes.map((entry) => entry.band)),
    cnaes,
    socios: company.socios,
    source: company.source,
  }
}
