import { z } from 'zod'

import { getCnpjDigits, isValidCnpj } from '@/modules/shared/lib/validators/validate-cnpj'

/**
 * CNPJ lookup client. On a valid CNPJ, fetches company data + ALL CNAEs
 * (principal + secundários) + quadro societário from a public provider.
 *
 * Default provider: BrasilAPI (free, no key, CORS-enabled, aggregates several
 * upstreams). Fallback: CNPJá open. This is the prototype/browser path; the
 * production path moves the call server-side to persist the snapshot, map each
 * CNAE to the risk table, and validate the proprietário against the QSA — see
 * the vault note "02-architecture/CNPJ Lookup Integration".
 *
 * Shared across the `companies` (Cadastrar empresa) and `auth` (signup wizard)
 * modules, hence its home in `shared/api`.
 */

export interface CnpjCnae {
  codigo: string
  descricao: string
  principal: boolean
}

export interface CnpjSocio {
  nome: string
  documento: string
  qualificacao: string
}

export interface CnpjLookupResult {
  cnpj: string
  legalName: string
  tradeName: string
  registrationStatus: string
  openingDate: string
  legalNature: string
  primaryCnae: string
  cep: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  phone: string
  mobile: string
  institutionalEmail: string
  cnaes: readonly CnpjCnae[]
  socios: readonly CnpjSocio[]
  source: 'brasilapi' | 'cnpja'
}

export type CnpjLookupErrorKind = 'invalid' | 'not-found' | 'rate-limited' | 'unavailable'

export class CnpjLookupError extends Error {
  readonly kind: CnpjLookupErrorKind
  constructor(kind: CnpjLookupErrorKind, message: string) {
    super(message)
    this.name = 'CnpjLookupError'
    this.kind = kind
  }
}

const REQUEST_TIMEOUT_MS = 12_000
const resultCache = new Map<string, CnpjLookupResult>()

function formatCnaeCode(code: string | number | null | undefined): string {
  const digits = String(code ?? '').replace(/\D/g, '')
  if (digits.length !== 7) return String(code ?? '').trim()
  return `${digits.slice(0, 4)}-${digits.slice(4, 5)}/${digits.slice(5, 7)}`
}

function isoToBrDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

function formatPhoneDigits(raw: string | null | undefined): string {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  if (digits.length === 11)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  return ''
}

function formatCep(raw: string | null | undefined): string {
  const digits = String(raw ?? '').replace(/\D/g, '')
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : (raw ?? '').trim()
}

/** Split up to two phone numbers into the schema's landline (phone) + mobile fields. */
function splitPhones(values: Array<string | null | undefined>): { phone: string; mobile: string } {
  const formatted = values.map(formatPhoneDigits).filter(Boolean)
  const mobile = formatted.find((value) => value.replace(/\D/g, '').length === 11) ?? ''
  const phone = formatted.find((value) => value.replace(/\D/g, '').length === 10) ?? ''
  return { phone, mobile }
}

async function fetchJson(url: string): Promise<{ status: number; body: unknown }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
    })
    const body = response.status === 204 ? null : await response.json().catch(() => null)
    return { status: response.status, body }
  } finally {
    clearTimeout(timeout)
  }
}

// --- BrasilAPI ---------------------------------------------------------------

const brasilApiSchema = z.object({
  cnpj: z.string().nullish(),
  razao_social: z.string().nullish(),
  nome_fantasia: z.string().nullish(),
  descricao_situacao_cadastral: z.string().nullish(),
  data_inicio_atividade: z.string().nullish(),
  natureza_juridica: z.string().nullish(),
  cnae_fiscal: z.number().nullish(),
  cnae_fiscal_descricao: z.string().nullish(),
  cnaes_secundarios: z
    .array(z.object({ codigo: z.number().nullish(), descricao: z.string().nullish() }))
    .nullish(),
  cep: z.string().nullish(),
  logradouro: z.string().nullish(),
  numero: z.string().nullish(),
  complemento: z.string().nullish(),
  bairro: z.string().nullish(),
  municipio: z.string().nullish(),
  uf: z.string().nullish(),
  ddd_telefone_1: z.string().nullish(),
  ddd_telefone_2: z.string().nullish(),
  email: z.string().nullish(),
  qsa: z
    .array(
      z.object({
        nome_socio: z.string().nullish(),
        cnpj_cpf_do_socio: z.string().nullish(),
        qualificacao_socio: z.string().nullish(),
      }),
    )
    .nullish(),
})

function mapBrasilApi(cnpj: string, raw: unknown): CnpjLookupResult {
  const data = brasilApiSchema.parse(raw)
  const cnaes: CnpjCnae[] = []
  if (data.cnae_fiscal != null) {
    cnaes.push({
      codigo: formatCnaeCode(data.cnae_fiscal),
      descricao: (data.cnae_fiscal_descricao ?? '').trim(),
      principal: true,
    })
  }
  for (const entry of data.cnaes_secundarios ?? []) {
    if (entry.codigo != null)
      cnaes.push({
        codigo: formatCnaeCode(entry.codigo),
        descricao: (entry.descricao ?? '').trim(),
        principal: false,
      })
  }

  const { phone, mobile } = splitPhones([data.ddd_telefone_1, data.ddd_telefone_2])
  const principal = cnaes[0]

  return {
    cnpj,
    legalName: (data.razao_social ?? '').trim(),
    tradeName: (data.nome_fantasia ?? '').trim(),
    registrationStatus: (data.descricao_situacao_cadastral ?? '').trim(),
    openingDate: isoToBrDate(data.data_inicio_atividade),
    legalNature: (data.natureza_juridica ?? '').trim(),
    primaryCnae: principal ? `${principal.codigo} - ${principal.descricao}`.trim() : '',
    cep: formatCep(data.cep),
    address: (data.logradouro ?? '').trim(),
    number: (data.numero ?? '').trim(),
    complement: (data.complemento ?? '').trim(),
    neighborhood: (data.bairro ?? '').trim(),
    city: (data.municipio ?? '').trim(),
    state: (data.uf ?? '').trim().toUpperCase().slice(0, 2),
    phone,
    mobile,
    institutionalEmail: (data.email ?? '').trim().toLowerCase(),
    cnaes,
    socios: (data.qsa ?? []).map<CnpjSocio>((socio) => ({
      nome: (socio.nome_socio ?? '').trim(),
      documento: (socio.cnpj_cpf_do_socio ?? '').trim(),
      qualificacao: (socio.qualificacao_socio ?? '').trim(),
    })),
    source: 'brasilapi',
  }
}

// --- CNPJá open (fallback) ---------------------------------------------------

const cnpjaSchema = z.object({
  taxId: z.string().nullish(),
  alias: z.string().nullish(),
  founded: z.string().nullish(),
  company: z
    .object({
      name: z.string().nullish(),
      nature: z.object({ text: z.string().nullish() }).nullish(),
      members: z
        .array(
          z.object({
            person: z.object({ name: z.string().nullish(), taxId: z.string().nullish() }).nullish(),
            role: z.object({ text: z.string().nullish() }).nullish(),
          }),
        )
        .nullish(),
    })
    .nullish(),
  status: z.object({ text: z.string().nullish() }).nullish(),
  mainActivity: z.object({ id: z.number().nullish(), text: z.string().nullish() }).nullish(),
  sideActivities: z
    .array(z.object({ id: z.number().nullish(), text: z.string().nullish() }))
    .nullish(),
  address: z
    .object({
      zip: z.string().nullish(),
      street: z.string().nullish(),
      number: z.string().nullish(),
      details: z.string().nullish(),
      district: z.string().nullish(),
      city: z.string().nullish(),
      state: z.string().nullish(),
    })
    .nullish(),
  emails: z.array(z.object({ address: z.string().nullish() })).nullish(),
  phones: z.array(z.object({ area: z.string().nullish(), number: z.string().nullish() })).nullish(),
})

function mapCnpja(cnpj: string, raw: unknown): CnpjLookupResult {
  const data = cnpjaSchema.parse(raw)
  const cnaes: CnpjCnae[] = []
  if (data.mainActivity?.id != null) {
    cnaes.push({
      codigo: formatCnaeCode(data.mainActivity.id),
      descricao: (data.mainActivity.text ?? '').trim(),
      principal: true,
    })
  }
  for (const activity of data.sideActivities ?? []) {
    if (activity.id != null)
      cnaes.push({
        codigo: formatCnaeCode(activity.id),
        descricao: (activity.text ?? '').trim(),
        principal: false,
      })
  }
  const { phone, mobile } = splitPhones(
    (data.phones ?? []).map((entry) => `${entry.area ?? ''}${entry.number ?? ''}`),
  )
  const principal = cnaes[0]

  return {
    cnpj,
    legalName: (data.company?.name ?? '').trim(),
    tradeName: (data.alias ?? '').trim(),
    registrationStatus: (data.status?.text ?? '').trim(),
    openingDate: isoToBrDate(data.founded),
    legalNature: (data.company?.nature?.text ?? '').trim(),
    primaryCnae: principal ? `${principal.codigo} - ${principal.descricao}`.trim() : '',
    cep: formatCep(data.address?.zip),
    address: (data.address?.street ?? '').trim(),
    number: (data.address?.number ?? '').trim(),
    complement: (data.address?.details ?? '').trim(),
    neighborhood: (data.address?.district ?? '').trim(),
    city: (data.address?.city ?? '').trim(),
    state: (data.address?.state ?? '').trim().toUpperCase().slice(0, 2),
    phone,
    mobile,
    institutionalEmail: (data.emails?.[0]?.address ?? '').trim().toLowerCase(),
    cnaes,
    socios: (data.company?.members ?? []).map<CnpjSocio>((member) => ({
      nome: (member.person?.name ?? '').trim(),
      documento: (member.person?.taxId ?? '').trim(),
      qualificacao: (member.role?.text ?? '').trim(),
    })),
    source: 'cnpja',
  }
}

// --- Orchestration -----------------------------------------------------------

const BRASIL_API_URL = 'https://brasilapi.com.br/api/cnpj/v1'
const CNPJA_OPEN_URL = 'https://open.cnpja.com/office'

export async function lookupCnpj(rawCnpj: string): Promise<CnpjLookupResult> {
  if (!isValidCnpj(rawCnpj)) {
    throw new CnpjLookupError('invalid', 'Informe um CNPJ válido antes de buscar.')
  }
  const cnpj = getCnpjDigits(rawCnpj)

  const cached = resultCache.get(cnpj)
  if (cached) return cached

  try {
    const { status, body } = await fetchJson(`${BRASIL_API_URL}/${cnpj}`)
    if (status === 404) throw new CnpjLookupError('not-found', 'CNPJ não encontrado na base.')
    if (status === 429)
      throw new CnpjLookupError('rate-limited', 'Muitas consultas. Tente novamente em instantes.')
    if (status >= 200 && status < 300 && body) {
      const result = mapBrasilApi(cnpj, body)
      resultCache.set(cnpj, result)
      return result
    }
    throw new CnpjLookupError('unavailable', 'Serviço de consulta indisponível.')
  } catch (primaryError) {
    if (primaryError instanceof CnpjLookupError && primaryError.kind === 'not-found') {
      throw primaryError
    }
    try {
      const { status, body } = await fetchJson(`${CNPJA_OPEN_URL}/${cnpj}`)
      if (status === 404) throw new CnpjLookupError('not-found', 'CNPJ não encontrado na base.')
      if (status >= 200 && status < 300 && body) {
        const result = mapCnpja(cnpj, body)
        resultCache.set(cnpj, result)
        return result
      }
      throw new CnpjLookupError('unavailable', 'Serviço de consulta indisponível no momento.')
    } catch (fallbackError) {
      if (fallbackError instanceof CnpjLookupError) throw fallbackError
      throw new CnpjLookupError('unavailable', 'Não foi possível consultar o CNPJ agora.')
    }
  }
}
