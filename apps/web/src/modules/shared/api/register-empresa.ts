import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface EmpresaCnaeResult {
  codigo: string
  descricao: string
  principal: boolean
  /** Preliminary risk band from Decreto 61.082/2026 (I | II | III | undetermined), or null. */
  band: string | null
}

export interface EmpresaRegistrationResult {
  empresaId: string
  cnpj: string
  legalName: string
  tradeName: string
  registrationStatus: string
  legalNature: string
  porte: string
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
  overallRisk: string | null
  cnaes: EmpresaCnaeResult[]
  socios: Array<{ nome: string; documento: string; qualificacao: string }>
  source: string
}

/**
 * Registers/updates an empresa from a CNPJ through the IDP domain API
 * (`POST {apiUrl}/empresas`). The server does the CNPJ lookup, persists the
 * empresa + all CNAEs + sócios, and maps each CNAE to its risk band.
 *
 * Uses an origin-absolute path (e.g. `/api/empresas`) so it works from any
 * route via the Vite dev proxy.
 */
export async function registerEmpresaByCnpj(cnpj: string): Promise<EmpresaRegistrationResult> {
  const { apiUrl } = getRuntimeConfig()
  const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl

  const response = await fetch(`${base}/empresas`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ cnpj }),
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? 'Não foi possível consultar o CNPJ agora.')
  }

  return response.json() as Promise<EmpresaRegistrationResult>
}
