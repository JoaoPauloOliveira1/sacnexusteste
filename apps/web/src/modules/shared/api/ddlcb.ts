import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface DdlcbCnae {
  codigo: string
  descricao: string
  principal: boolean
}

export interface DdlcbDocument {
  numero: string
  emitidoEm: string
  risco: string
  empresa: { razaoSocial: string; cnpj: string }
  unidade: {
    id: string
    nome: string | null
    endereco: string
    areaConstruida: string | null
  }
  cnaes: DdlcbCnae[]
  jaEmitida: boolean
}

function apiBase(): string {
  const { apiUrl } = getRuntimeConfig()
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
}

/** URL of the server-generated DDLCB PDF (opens/downloads in the browser). */
export function ddlcbPdfUrl(unidadeId: string): string {
  return `${apiBase()}/unidades/${unidadeId}/ddlcb.pdf`
}

/**
 * Issues (or returns) the DDLCB for a Risco I unit. Idempotent server-side, so
 * it is safe to call on page load.
 */
export async function emitDdlcb(unidadeId: string): Promise<DdlcbDocument> {
  const response = await fetch(`${apiBase()}/unidades/${unidadeId}/ddlcb`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? 'Não foi possível emitir a DDLCB.')
  }
  return response.json() as Promise<DdlcbDocument>
}
