import { getRuntimeConfig } from '@/modules/shared/config/runtime-config'

export interface TriagemProcessoItem {
  processoId: string
  protocoloNumero: string | null
  risco: string
  fase: string
  tipoSolicitacao: string
  modalidade: string
  empresaRazaoSocial: string
  empresaCnpj: string
  unidadeNome: string | null
  createdAt: string
}

export interface ProcessoDossie {
  processo: {
    id: string
    risco: string
    fase: string
    tipoSolicitacao: string
    modalidade: string
    protocoloNumero: string | null
    protocoladoEm: string | null
    dadosComplementares: Record<string, unknown> | null
    analistaResponsavel: string | null
    analiseStatus: string | null
    createdAt: string
  }
  empresa: { razaoSocial: string; cnpj: string } | null
  unidade: { nome: string | null; endereco: string; areaConstruida: string | null } | null
  respostas: Array<{ perguntaId: string; grupo: string | null; valor: unknown }>
  documentos: Array<{ tipo: string; key: string | null }>
  pagamento: { status: string; metodo: string | null; confirmadoEm: string | null } | null
  historico: Array<{ acao: string; descricao: string | null; createdAt: string }>
  triagemItens: TriagemItem[]
}

export type TriagemEstado = 'aprovado' | 'reprovado' | 'em_exigencia'

export interface TriagemItem {
  itemTipo: 'informacao' | 'documento'
  itemChave: string
  estado: TriagemEstado
  observacao: string | null
  autor: string | null
  createdAt: string
}

function apiBase(): string {
  const { apiUrl } = getRuntimeConfig()
  return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
}

async function readError(response: Response): Promise<never> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null
  throw new Error(body?.message ?? 'Operação indisponível no momento.')
}

/** URL of the server-generated AVCB PDF (deferred processes). */
export function avcbPdfUrl(processoId: string): string {
  return `${apiBase()}/processos/${processoId}/avcb.pdf`
}

/** URL of the server-generated .zip with all the process's documents. */
export function documentosZipUrl(processoId: string): string {
  return `${apiBase()}/processos/${processoId}/documentos.zip`
}

export async function listTriagem(): Promise<{ processos: TriagemProcessoItem[] }> {
  const response = await fetch(`${apiBase()}/triagem/processos`, { credentials: 'include' })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ processos: TriagemProcessoItem[] }>
}

export async function getProcessoDossie(processoId: string): Promise<ProcessoDossie> {
  const response = await fetch(`${apiBase()}/triagem/processos/${processoId}`, {
    credentials: 'include',
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<ProcessoDossie>
}

export async function registrarExigencia(
  processoId: string,
  descricao: string,
): Promise<{ ok: boolean; fase: string }> {
  const response = await fetch(`${apiBase()}/triagem/processos/${processoId}/exigencia`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ descricao }),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ ok: boolean; fase: string }>
}

async function postTriagem<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${apiBase()}/triagem/processos/${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<T>
}

export function assumirTriagem(processoId: string, analista: string) {
  return postTriagem<{ ok: boolean; analista: string }>(`${processoId}/assumir`, { analista })
}

export function salvarAnaliseTriagem(
  processoId: string,
  autor: string,
  itens: Array<{
    itemTipo: 'informacao' | 'documento'
    itemChave: string
    estado: TriagemEstado
    observacao?: string
  }>,
) {
  return postTriagem<{ ok: boolean; salvos: number }>(`${processoId}/analise`, { autor, itens })
}

export function enviarAnaliseTriagem(processoId: string) {
  return postTriagem<{ ok: boolean; analiseStatus: string }>(`${processoId}/analise/enviar`)
}

export function retomarAnaliseTriagem(processoId: string) {
  return postTriagem<{ ok: boolean; analiseStatus: string }>(`${processoId}/analise/retomar`)
}

export function concluirTriagem(
  processoId: string,
  decisao: 'liberar_avcb' | 'colocar_em_vistoria',
  observacao?: string,
) {
  return postTriagem<{ ok: boolean; fase: string }>(`${processoId}/conclusao`, {
    decisao,
    ...(observacao ? { observacao } : {}),
  })
}

export async function registrarDecisao(
  processoId: string,
  decisao: 'aprovado' | 'reprovado',
  observacao?: string,
): Promise<{ ok: boolean; fase: string }> {
  const response = await fetch(`${apiBase()}/triagem/processos/${processoId}/decisao`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ decisao, ...(observacao ? { observacao } : {}) }),
  })
  if (!response.ok) return readError(response)
  return response.json() as Promise<{ ok: boolean; fase: string }>
}
