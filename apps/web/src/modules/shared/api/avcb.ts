import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface StartAvcbBody {
  dadosComplementares: Record<string, unknown>
  documentos: Array<{ tipo: string; key: string }>
}

export interface StartAvcbResult {
  processoId: string
  risco: string
  fase: string
  protocoloNumero: string | null
  jaExistia: boolean
}

export interface ConfirmPaymentResult {
  protocoloNumero: string
  protocoladoEm: string
  jaProtocolado: boolean
}

function apiBase(): string {
  const { apiUrl } = getRuntimeConfig()
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
}

async function readError(response: Response): Promise<never> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  throw new Error(body?.message ?? 'Operação indisponível no momento.')
}

export async function startAvcb(unidadeId: string, body: StartAvcbBody): Promise<StartAvcbResult> {
  const response = await fetch(`${apiBase()}/unidades/${unidadeId}/processo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<StartAvcbResult>
}

export interface UnidadeProcesso {
  id: string
  risco: string
  fase: string
  dadosComplementares: Record<string, unknown> | null
  documentos: Array<{ tipo: string; key: string | null }>
}

export async function getUnidadeProcesso(
  unidadeId: string,
): Promise<{ processo: UnidadeProcesso | null }> {
  const response = await fetch(`${apiBase()}/unidades/${unidadeId}/processo`, {
    credentials: 'include',
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ processo: UnidadeProcesso | null }>
}

export async function startAvcbEvento(
  eventoId: string,
  body: StartAvcbBody,
): Promise<StartAvcbResult> {
  const response = await fetch(`${apiBase()}/eventos/${eventoId}/processo`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<StartAvcbResult>
}

export async function getEventoProcesso(
  eventoId: string,
): Promise<{ processo: UnidadeProcesso | null }> {
  const response = await fetch(`${apiBase()}/eventos/${eventoId}/processo`, {
    credentials: 'include',
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ processo: UnidadeProcesso | null }>
}

export async function confirmProcessoPayment(processoId: string): Promise<ConfirmPaymentResult> {
  const response = await fetch(`${apiBase()}/processos/${processoId}/pagamento`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<ConfirmPaymentResult>
}

export async function responderExigencia(
  processoId: string,
  body: { mensagem?: string; documentos: Array<{ tipo: string; key: string }> },
): Promise<{ ok: boolean; fase: string }> {
  const response = await fetch(`${apiBase()}/processos/${processoId}/exigencia/resposta`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ ok: boolean; fase: string }>
}
