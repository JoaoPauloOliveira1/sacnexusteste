import { z } from 'zod'

/**
 * Server-side CNPJ lookup provider. Fetches company data + ALL CNAEs
 * (principal + secundários) + quadro societário from a public source.
 *
 * Default: BrasilAPI (sends a browser-like User-Agent to avoid the 403 that
 * bare server requests get). Fallback: CNPJá open. Swappable for Serpro/ATI or
 * a self-hosted Minha Receita later — callers depend only on {@link CnpjLookupProvider}.
 *
 * CNAE codes are normalized to a 7-digit zero-padded `numerico` (e.g. `0111301`)
 * so they map directly to `sac_cnae.numerico` (which preserves leading zeros).
 */

export interface CnpjCnaeData {
  numerico: string
  codigo: string
  descricao: string
  principal: boolean
}

export interface CnpjSocioData {
  nome: string
  documento: string
  qualificacao: string
}

export interface CnpjCompanyData {
  cnpj: string
  legalName: string
  tradeName: string
  registrationStatus: string
  openingDate: string | null
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
  cnaes: CnpjCnaeData[]
  socios: CnpjSocioData[]
  source: 'brasilapi' | 'cnpja'
}

export type CnpjLookupErrorKind = 'invalid' | 'not-found' | 'rate-limited' | 'unavailable'

export class CnpjLookupError extends Error {
  readonly kind: CnpjLookupErrorKind
  readonly statusCode: 400 | 404 | 502
  constructor(kind: CnpjLookupErrorKind, message: string) {
    super(message)
    this.name = 'CnpjLookupError'
    this.kind = kind
    this.statusCode = kind === 'not-found' ? 404 : kind === 'invalid' ? 400 : 502
  }
}

export interface CnpjLookupProvider {
  fetch: (cnpjDigits: string) => Promise<CnpjCompanyData>
}

const REQUEST_TIMEOUT_MS = 12_000
const BROWSER_UA = 'Mozilla/5.0 (compatible; sac-nexus-idp/0.1; +local-dev)'

function padCnae(code: string | number | null | undefined): string {
  const digits = String(code ?? '').replace(/\D/g, '')
  return digits ? digits.padStart(7, '0') : ''
}

function formatCnaeCode(numerico: string): string {
  return numerico.length === 7
    ? `${numerico.slice(0, 4)}-${numerico.slice(4, 5)}/${numerico.slice(5, 7)}`
    : numerico
}

function digitsOnly(value: string | null | undefined): string {
  return String(value ?? '').replace(/\D/g, '')
}

async function fetchJson(url: string): Promise<{ status: number; body: unknown }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': BROWSER_UA },
      signal: controller.signal,
    })
    const body = response.status === 204 ? null : await response.json().catch(() => null)
    return { status: response.status, body }
  } finally {
    clearTimeout(timeout)
  }
}

const brasilApiSchema = z.object({
  razao_social: z.string().nullish(),
  nome_fantasia: z.string().nullish(),
  descricao_situacao_cadastral: z.string().nullish(),
  data_inicio_atividade: z.string().nullish(),
  natureza_juridica: z.string().nullish(),
  porte: z.string().nullish(),
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

function mapBrasilApi(cnpj: string, raw: unknown): CnpjCompanyData {
  const data = brasilApiSchema.parse(raw)
  const cnaes: CnpjCnaeData[] = []
  if (data.cnae_fiscal != null) {
    const numerico = padCnae(data.cnae_fiscal)
    cnaes.push({
      numerico,
      codigo: formatCnaeCode(numerico),
      descricao: (data.cnae_fiscal_descricao ?? '').trim(),
      principal: true,
    })
  }
  for (const entry of data.cnaes_secundarios ?? []) {
    if (entry.codigo != null) {
      const numerico = padCnae(entry.codigo)
      cnaes.push({
        numerico,
        codigo: formatCnaeCode(numerico),
        descricao: (entry.descricao ?? '').trim(),
        principal: false,
      })
    }
  }

  return {
    cnpj,
    legalName: (data.razao_social ?? '').trim(),
    tradeName: (data.nome_fantasia ?? '').trim(),
    registrationStatus: (data.descricao_situacao_cadastral ?? '').trim(),
    openingDate: data.data_inicio_atividade ?? null,
    legalNature: (data.natureza_juridica ?? '').trim(),
    porte: (data.porte ?? '').trim(),
    email: (data.email ?? '').trim().toLowerCase(),
    phone: digitsOnly(data.ddd_telefone_1),
    cep: digitsOnly(data.cep),
    street: (data.logradouro ?? '').trim(),
    number: (data.numero ?? '').trim(),
    complement: (data.complemento ?? '').trim(),
    neighborhood: (data.bairro ?? '').trim(),
    city: (data.municipio ?? '').trim(),
    state: (data.uf ?? '').trim().toUpperCase().slice(0, 2),
    cnaes,
    socios: (data.qsa ?? []).map<CnpjSocioData>((socio) => ({
      nome: (socio.nome_socio ?? '').trim(),
      documento: (socio.cnpj_cpf_do_socio ?? '').trim(),
      qualificacao: (socio.qualificacao_socio ?? '').trim(),
    })),
    source: 'brasilapi',
  }
}

const cnpjaSchema = z.object({
  alias: z.string().nullish(),
  founded: z.string().nullish(),
  company: z
    .object({
      name: z.string().nullish(),
      nature: z.object({ text: z.string().nullish() }).nullish(),
      size: z.object({ text: z.string().nullish() }).nullish(),
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

function mapCnpja(cnpj: string, raw: unknown): CnpjCompanyData {
  const data = cnpjaSchema.parse(raw)
  const cnaes: CnpjCnaeData[] = []
  if (data.mainActivity?.id != null) {
    const numerico = padCnae(data.mainActivity.id)
    cnaes.push({
      numerico,
      codigo: formatCnaeCode(numerico),
      descricao: (data.mainActivity.text ?? '').trim(),
      principal: true,
    })
  }
  for (const activity of data.sideActivities ?? []) {
    if (activity.id != null) {
      const numerico = padCnae(activity.id)
      cnaes.push({
        numerico,
        codigo: formatCnaeCode(numerico),
        descricao: (activity.text ?? '').trim(),
        principal: false,
      })
    }
  }
  const firstPhone = data.phones?.[0]

  return {
    cnpj,
    legalName: (data.company?.name ?? '').trim(),
    tradeName: (data.alias ?? '').trim(),
    registrationStatus: (data.status?.text ?? '').trim(),
    openingDate: data.founded ?? null,
    legalNature: (data.company?.nature?.text ?? '').trim(),
    porte: (data.company?.size?.text ?? '').trim(),
    email: (data.emails?.[0]?.address ?? '').trim().toLowerCase(),
    phone: digitsOnly(`${firstPhone?.area ?? ''}${firstPhone?.number ?? ''}`),
    cep: digitsOnly(data.address?.zip),
    street: (data.address?.street ?? '').trim(),
    number: (data.address?.number ?? '').trim(),
    complement: (data.address?.details ?? '').trim(),
    neighborhood: (data.address?.district ?? '').trim(),
    city: (data.address?.city ?? '').trim(),
    state: (data.address?.state ?? '').trim().toUpperCase().slice(0, 2),
    cnaes,
    socios: (data.company?.members ?? []).map<CnpjSocioData>((member) => ({
      nome: (member.person?.name ?? '').trim(),
      documento: (member.person?.taxId ?? '').trim(),
      qualificacao: (member.role?.text ?? '').trim(),
    })),
    source: 'cnpja',
  }
}

const BRASIL_API_URL = 'https://brasilapi.com.br/api/cnpj/v1'
const CNPJA_OPEN_URL = 'https://open.cnpja.com/office'

/**
 * BrasilAPI (primary) omits `email` (and often `phone`) for privacy, while cnpja
 * exposes the contact e-mail from the CNPJ card. When the primary result is missing
 * these, enrich them from cnpja — best-effort, never failing the lookup.
 */
async function enrichContactFromCnpja(
  cnpjDigits: string,
  company: CnpjCompanyData,
): Promise<CnpjCompanyData> {
  if (company.email && company.phone) return company
  try {
    const { status, body } = await fetchJson(`${CNPJA_OPEN_URL}/${cnpjDigits}`)
    if (status >= 200 && status < 300 && body) {
      const extra = mapCnpja(cnpjDigits, body)
      return {
        ...company,
        email: company.email || extra.email,
        phone: company.phone || extra.phone,
      }
    }
  } catch {
    // Best-effort enrichment: keep the primary result on any failure.
  }
  return company
}

export function createPublicCnpjProvider(): CnpjLookupProvider {
  return {
    fetch: async (cnpjDigits) => {
      try {
        const { status, body } = await fetchJson(`${BRASIL_API_URL}/${cnpjDigits}`)
        if (status === 404) throw new CnpjLookupError('not-found', 'CNPJ não encontrado.')
        if (status === 429) throw new CnpjLookupError('rate-limited', 'Muitas consultas.')
        if (status >= 200 && status < 300 && body) {
          return await enrichContactFromCnpja(cnpjDigits, mapBrasilApi(cnpjDigits, body))
        }
        throw new CnpjLookupError('unavailable', 'Serviço de consulta indisponível.')
      } catch (primaryError) {
        if (primaryError instanceof CnpjLookupError && primaryError.kind === 'not-found') {
          throw primaryError
        }
        try {
          const { status, body } = await fetchJson(`${CNPJA_OPEN_URL}/${cnpjDigits}`)
          if (status === 404) throw new CnpjLookupError('not-found', 'CNPJ não encontrado.')
          if (status >= 200 && status < 300 && body) return mapCnpja(cnpjDigits, body)
          throw new CnpjLookupError('unavailable', 'Serviço de consulta indisponível.')
        } catch (fallbackError) {
          if (fallbackError instanceof CnpjLookupError) throw fallbackError
          throw new CnpjLookupError('unavailable', 'Não foi possível consultar o CNPJ.')
        }
      }
    },
  }
}
