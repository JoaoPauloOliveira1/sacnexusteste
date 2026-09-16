// Data-driven fire-risk classifier types. Ported from the fire-risk-guide
// prototype (Lovable). The engines are decree-agnostic; the data is regenerated
// for Decreto 61.082/2026 (see 02-architecture/Classifier Reuse in the vault).

export interface ConfigEntry {
  chave?: string
  valor?: string
  id?: string
  titulo?: string
  orientacao?: string
  link?: string
}

export interface InputField {
  id: string
  pergunta: string
  tipo: 'lista' | 'booleano' | 'multipla'
  origem_opcoes: string
  obrigatorio: string
  descricao: string
  categoria?: string
}

export interface Opcao {
  input_id: string
  opcoes: string
  opcoes_label: string
}

export interface Atividade {
  codigo: string
  atividade_label: string
  risco_base: string
}

export interface CondicaoExibicao {
  input_id: string
  campo_dependente: string
  operador: string
  valor: string
}

export interface RegraClassificacao {
  regra_id: string
  prioridade: number | string
  campo: string
  operador: string
  valor: string | boolean
  acao: string
  /** JSON stores this as the string "true"/"false". */
  encerrar: boolean | string
}

export interface Resultado {
  nivel: string
  codigo: string
  descricao: string
  orientacao?: string
  link?: string
  modelo?: string
  aqui?: string
  observação?: string
}

export interface RuleEngineResult {
  risco_final: string
  resultado: Resultado | null
  regra_aplicada: string | null
  encerramento?: ConfigEntry | null
  elevacao_mensagem?: string
}
