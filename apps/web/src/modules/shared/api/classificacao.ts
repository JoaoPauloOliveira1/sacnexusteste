import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface SaveClassificacaoBody {
  risco: 'I' | 'II' | 'III' | 'undetermined'
  origem?: string
  respostas: Array<{ perguntaId: string; grupo?: string; valor: unknown }>
  fatores?: Record<string, unknown>
}

function apiBase(): string {
  const { apiUrl } = getRuntimeConfig()
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
}

/** Persists a Unidade's classification (result + answers + context) for traceability. */
export async function saveClassificacao(
  unidadeId: string,
  body: SaveClassificacaoBody,
): Promise<{ classificacaoId: string }> {
  const response = await fetch(`${apiBase()}/unidades/${unidadeId}/classificacoes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const parsed = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(parsed?.message ?? 'Não foi possível salvar a classificação.')
  }
  return response.json() as Promise<{ classificacaoId: string }>
}
