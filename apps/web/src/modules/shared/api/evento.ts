import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface EventoSummary {
  id: string
  nome: string | null
  municipio: string | null
  uf: string | null
  risco: string | null
  inicioEm: string
  terminoEm: string
  processo: { id: string; fase: string; risco: string } | null
}

export interface CreateEventoBody {
  nome?: string | undefined
  solicitanteNome?: string | undefined
  solicitanteCpf?: string | undefined
  risco: 'II' | 'III'
  cep?: string | undefined
  logradouro?: string | undefined
  numero?: string | undefined
  complemento?: string | undefined
  bairro?: string | undefined
  municipio?: string | undefined
  uf?: string | undefined
  inicioEm: string
  terminoEm: string
}

function apiBase(): string {
  const { apiUrl } = getRuntimeConfig()
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
}

async function readError(response: Response): Promise<never> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  throw new Error(body?.message ?? 'Operação indisponível no momento.')
}

export async function listEventos(): Promise<{ eventos: EventoSummary[] }> {
  const response = await fetch(`${apiBase()}/eventos`, { credentials: 'include' })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ eventos: EventoSummary[] }>
}

export async function createEvento(body: CreateEventoBody): Promise<{ eventoId: string }> {
  const response = await fetch(`${apiBase()}/eventos`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ eventoId: string }>
}
