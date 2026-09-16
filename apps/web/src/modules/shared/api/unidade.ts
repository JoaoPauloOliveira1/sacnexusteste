import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface UnidadeCnae {
  cnaeId: string
  codigo: string
  descricao: string
  band: string
  principal: boolean
}

export interface EmpresaEndereco {
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  municipio: string | null
  uf: string | null
}

export interface EmpresaCnaesResponse {
  empresaId: string
  cnaes: UnidadeCnae[]
  empresa?: EmpresaEndereco
}

export interface CreateUnidadeBody {
  nome?: string
  areaConstruida?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  uf?: string
  cnaeIds: string[]
}

export interface CreateUnidadeResult {
  unidadeId: string
  nome: string | null
  overallRisk: string | null
  cnaes: UnidadeCnae[]
}

export interface EmpresaListItem {
  empresaId: string
  cnpj: string
  razaoSocial: string
  nomeFantasia: string | null
  municipio: string | null
  uf: string | null
  cnaeCount: number
  unidadeCount: number
}

export interface UnidadeSummary {
  id: string
  nome: string | null
  municipio: string | null
  uf: string | null
  areaConstruida: string | null
  isMatriz: boolean
  completa: boolean
  riscoAtual: string | null
  processo: { id: string; fase: string; risco: string } | null
}

export interface UnidadeDetail {
  id: string
  nome: string | null
  isMatriz: boolean
  completa: boolean
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

export interface UpdateUnidadeBody {
  nome?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  uf?: string
  areaConstruida?: string
  pavimentos?: number
  ocupacao?: number
  tipoExploracao?: string
}

function apiBase(): string {
  const { apiUrl } = getRuntimeConfig()
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
}

async function readError(response: Response): Promise<never> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  throw new Error(body?.message ?? 'Operação indisponível no momento.')
}

export async function listEmpresas(): Promise<{ empresas: EmpresaListItem[] }> {
  const response = await fetch(`${apiBase()}/empresas`, { credentials: 'include' })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ empresas: EmpresaListItem[] }>
}

export async function listUnidades(
  empresaId: string,
): Promise<{ empresaId: string; unidades: UnidadeSummary[] }> {
  const response = await fetch(`${apiBase()}/empresas/${empresaId}/unidades`, {
    credentials: 'include',
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ empresaId: string; unidades: UnidadeSummary[] }>
}

export async function listUnidadeCnaes(
  unidadeId: string,
): Promise<{ unidadeId: string; cnaes: UnidadeCnae[] }> {
  const response = await fetch(`${apiBase()}/unidades/${unidadeId}/cnaes`, {
    credentials: 'include',
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ unidadeId: string; cnaes: UnidadeCnae[] }>
}

export async function listEmpresaCnaes(empresaId: string): Promise<EmpresaCnaesResponse> {
  const response = await fetch(`${apiBase()}/empresas/${empresaId}/cnaes`, {
    credentials: 'include',
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<EmpresaCnaesResponse>
}

export async function deleteEmpresa(empresaId: string, cnpj: string): Promise<{ ok: boolean }> {
  const response = await fetch(`${apiBase()}/empresas/${empresaId}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ cnpj }),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ ok: boolean }>
}

export async function createUnidade(
  empresaId: string,
  body: CreateUnidadeBody,
): Promise<CreateUnidadeResult> {
  const response = await fetch(`${apiBase()}/empresas/${empresaId}/unidades`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<CreateUnidadeResult>
}

export async function getUnidade(unidadeId: string): Promise<UnidadeDetail> {
  const response = await fetch(`${apiBase()}/unidades/${unidadeId}`, { credentials: 'include' })
  if (!response.ok) return readError(response)
  return response.json() as Promise<UnidadeDetail>
}

export async function updateUnidade(
  unidadeId: string,
  body: UpdateUnidadeBody,
): Promise<UnidadeDetail> {
  const response = await fetch(`${apiBase()}/unidades/${unidadeId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<UnidadeDetail>
}

export interface CepLookupResult {
  cep: string
  logradouro: string
  bairro: string
  municipio: string
  uf: string
  /** Coordinates when BrasilAPI resolves them (for the map preview). */
  lat: number | null
  lng: number | null
}

/** Looks a CEP up on BrasilAPI (v2, with coordinates) to auto-fill the address. */
export async function lookupCep(cep: string): Promise<CepLookupResult> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) {
    throw new Error('Informe um CEP com 8 dígitos.')
  }
  const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`)
  if (!response.ok) {
    throw new Error('CEP não encontrado.')
  }
  const data = (await response.json()) as {
    cep?: string
    street?: string
    neighborhood?: string
    city?: string
    state?: string
    location?: { coordinates?: { latitude?: string; longitude?: string } }
  }
  const rawLat = data.location?.coordinates?.latitude
  const rawLng = data.location?.coordinates?.longitude
  const lat = rawLat ? Number(rawLat) : Number.NaN
  const lng = rawLng ? Number(rawLng) : Number.NaN
  return {
    cep: data.cep ?? digits,
    logradouro: data.street ?? '',
    bairro: data.neighborhood ?? '',
    municipio: data.city ?? '',
    uf: data.state ?? '',
    lat: Number.isFinite(lat) ? lat : null,
    lng: Number.isFinite(lng) ? lng : null,
  }
}
