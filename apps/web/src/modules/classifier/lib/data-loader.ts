import {
  type Atividade,
  type CondicaoExibicao,
  type ConfigEntry,
  type InputField,
  type Opcao,
  type RegraClassificacao,
  type Resultado,
} from './types'

const BASE = '/classifier'

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}/${path}`)
  if (!response.ok) throw new Error(`Failed to load ${path}`)
  return response.json() as Promise<T>
}

export const loadConfig = () => fetchJson<ConfigEntry[]>('config.json')
export const loadInputs = () => fetchJson<InputField[]>('inputs.json')
export const loadOpcoes = () => fetchJson<Opcao[]>('opcoes.json')
export const loadAtividades = () => fetchJson<Atividade[]>('atividades.json')
export const loadCondicoes = () => fetchJson<CondicaoExibicao[]>('condicoes_exibicao.json')
export const loadRegras = () => fetchJson<RegraClassificacao[]>('regras_classificacao.json')
export const loadResultados = () => fetchJson<Resultado[]>('resultados.json')
export const loadEncerramentos = () => fetchJson<ConfigEntry[]>('resultados_encerramento.json')
