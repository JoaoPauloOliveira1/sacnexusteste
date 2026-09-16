import {
  type Atividade,
  type ConfigEntry,
  type RegraClassificacao,
  type Resultado,
  type RuleEngineResult,
} from './types'

/**
 * Priority-ordered rule engine: groups rules by regra_id, AND within a group,
 * resolves the CNAE's risco_base for the `atividade` field, and applies actions.
 * Risk is monotonic (never decreases). Ported from the fire-risk-guide prototype.
 */
export function executeRuleEngine(
  answers: Record<string, string>,
  regras: RegraClassificacao[],
  resultados: Resultado[],
  atividades: Atividade[],
  riscoInicial: string,
  config: ConfigEntry[] = [],
): RuleEngineResult {
  let risco_final = riscoInicial
  let regra_aplicada: string | null = null
  let encerramento: ConfigEntry | null = null

  const atividadeAnswer = answers.atividade
  const resolvedAnswers: Record<string, string> = { ...answers }

  if (atividadeAnswer) {
    const atividade = atividades.find((a) => a.codigo === atividadeAnswer)
    if (atividade) {
      resolvedAnswers.atividade = atividade.risco_base
    }
  }

  const ruleGroups = new Map<string, RegraClassificacao[]>()
  for (const regra of regras) {
    const group = ruleGroups.get(regra.regra_id) ?? []
    group.push(regra)
    ruleGroups.set(regra.regra_id, group)
  }

  const sortedGroups = Array.from(ruleGroups.entries()).sort((a, b) => {
    const prioA = Number(a[1][0]?.prioridade ?? 0)
    const prioB = Number(b[1][0]?.prioridade ?? 0)
    return prioA - prioB
  })

  const riskLevel: Record<string, number> = { baixo: 0, medio: 1, alto: 2 }

  for (const [regra_id, conditions] of sortedGroups) {
    const allMatch = conditions.every((cond) => {
      const userValue = resolvedAnswers[cond.campo]
      if (userValue === undefined) return false
      const condValor = typeof cond.valor === 'boolean' ? String(cond.valor) : cond.valor
      return userValue === condValor
    })

    if (!allMatch) continue

    const first = conditions[0]
    if (!first) continue
    const action = first.acao
    const shouldStop = first.encerrar === true || first.encerrar === 'true'
    const currentLevel = riskLevel[risco_final] ?? 0

    const applyRisk = (newRisk: string) => {
      const newLevel = riskLevel[newRisk] ?? 0
      if (newLevel >= currentLevel) {
        risco_final = newRisk
      }
    }

    switch (action) {
      case 'definir_alto':
      case 'elevar_para_alto':
        applyRisk('alto')
        break
      case 'definir_medio':
      case 'elevar_para_medio':
        applyRisk('medio')
        break
      case 'definir_baixo':
      case 'manter_baixo':
        applyRisk('baixo')
        break
      case 'encerrar_sem_classificacao': {
        const entry = config.find((c) => c.id === 'encerramento_sem_classificacao')
        encerramento = entry ?? { id: 'encerramento_sem_classificacao' }
        return {
          risco_final: 'encerramento',
          resultado: null,
          regra_aplicada: regra_id,
          encerramento,
        }
      }
      default:
        break
    }

    regra_aplicada = regra_id
    if (shouldStop) break
  }

  const resultado = resultados.find((r) => r.nivel === risco_final) ?? null
  return { risco_final, resultado, regra_aplicada, encerramento }
}

/**
 * Post-classification building overlay (isolation / corta-fogo): if the unit is
 * not fire-isolated from a higher-risk activity in the same building, raise the
 * risk by one level. Any uncertainty counts as "not isolated".
 */
export function applyIsolamento(
  base: RuleEngineResult,
  answers: Record<string, string>,
  resultados: Resultado[],
  mensagem?: string,
): RuleEngineResult {
  if (base.risco_final === 'encerramento') return base

  const gatilho = answers.outra_atividade_risco_maior
  const isolamento = answers.isolamento_corta_fogo

  let naoIsolado = false
  if (gatilho === 'nao_sei') naoIsolado = true
  if (gatilho === 'sim' && (isolamento === 'nao' || isolamento === 'nao_sei_dizer')) {
    naoIsolado = true
  }

  if (!naoIsolado) return base

  const escalonamento: Record<string, string> = { baixo: 'medio', medio: 'alto', alto: 'alto' }
  const novoNivel = escalonamento[base.risco_final] ?? base.risco_final
  const resultado = resultados.find((r) => r.nivel === novoNivel) ?? base.resultado

  return {
    ...base,
    risco_final: novoNivel,
    resultado,
    ...(mensagem ? { elevacao_mensagem: mensagem } : {}),
  }
}
