import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import {
  loadAtividades,
  loadCondicoes,
  loadConfig,
  loadEncerramentos,
  loadInputs,
  loadOpcoes,
  loadRegras,
  loadResultados,
} from '../lib/data-loader'
import { applyIsolamento, executeRuleEngine } from '../lib/rule-engine'
import { type RuleEngineResult } from '../lib/types'
import { getVisibleInputs } from '../lib/visibility-engine'

export function useFireRiskForm(
  initialAnswers: Record<string, string> = {},
  options: { baseRisco?: string } = {},
) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers)
  const [result, setResult] = useState<RuleEngineResult | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [earlyTermination, setEarlyTermination] = useState(false)

  const { data: config } = useQuery({ queryKey: ['clf-config'], queryFn: loadConfig })
  const { data: inputs } = useQuery({ queryKey: ['clf-inputs'], queryFn: loadInputs })
  const { data: opcoes } = useQuery({ queryKey: ['clf-opcoes'], queryFn: loadOpcoes })
  const { data: atividades } = useQuery({ queryKey: ['clf-atividades'], queryFn: loadAtividades })
  const { data: condicoes } = useQuery({ queryKey: ['clf-condicoes'], queryFn: loadCondicoes })
  const { data: regras } = useQuery({ queryKey: ['clf-regras'], queryFn: loadRegras })
  const { data: resultados } = useQuery({ queryKey: ['clf-resultados'], queryFn: loadResultados })
  const { data: encerramentos } = useQuery({
    queryKey: ['clf-encerramentos'],
    queryFn: loadEncerramentos,
  })

  const isLoading =
    !config || !inputs || !opcoes || !atividades || !condicoes || !regras || !resultados

  // When launched from a Unidade, the base risk is the highest across ALL the
  // unit's CNAE bands (options.baseRisco) — not a single CNAE — so an activity
  // that is not in the classifier's atividades list can never silently fall to
  // Risco I. The questionnaire can only escalate from here (monotonic).
  const riscoInicial =
    options.baseRisco ?? config?.find((c) => c.chave === 'risco_inicial')?.valor ?? 'baixo'
  const mensagemElevacao = config?.find((c) => c.chave === 'mensagem_elevacao_isolamento')?.valor

  const runEngine = (ans: Record<string, string>): RuleEngineResult | null => {
    if (!regras || !resultados || !atividades) return null
    const base = executeRuleEngine(
      ans,
      regras,
      resultados,
      atividades,
      riscoInicial,
      encerramentos ?? [],
    )
    return applyIsolamento(base, ans, resultados, mensagemElevacao)
  }

  const visibleInputs = inputs && condicoes ? getVisibleInputs(inputs, condicoes, answers) : []

  const derivedIds = new Set(
    (inputs ?? [])
      .filter((i) => i.tipo === 'multipla')
      .flatMap((i) =>
        (opcoes ?? []).filter((o) => o.input_id === i.origem_opcoes).map((o) => o.opcoes),
      ),
  )

  const visibleKey = visibleInputs.map((i) => i.id).join(',')

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run only when the visible set changes
  useEffect(() => {
    if (!inputs || !condicoes) return
    const visibleIds = new Set(visibleInputs.map((i) => i.id))
    const knownIds = new Set(inputs.map((i) => i.id))
    const nextAnswers = { ...answers }
    let changed = false
    for (const key of Object.keys(nextAnswers)) {
      const isHiddenInput = knownIds.has(key) && !visibleIds.has(key)
      const isOrphanDerived =
        derivedIds.has(key) &&
        !inputs.some(
          (i) => i.tipo === 'multipla' && visibleIds.has(i.id) && nextAnswers[i.id] !== undefined,
        )
      if (isHiddenInput || isOrphanDerived) {
        delete nextAnswers[key]
        changed = true
      }
    }
    if (changed) setAnswers(nextAnswers)
  }, [visibleKey])

  const setAnswer = (inputId: string, value: string) => {
    const nextAnswers = { ...answers, [inputId]: value }

    const inputDef = (inputs ?? []).find((i) => i.id === inputId)
    if (inputDef?.tipo === 'multipla') {
      const selected = new Set(value.split(',').filter(Boolean))
      for (const o of (opcoes ?? []).filter((o) => o.input_id === inputDef.origem_opcoes)) {
        nextAnswers[o.opcoes] = selected.has(o.opcoes) ? 'true' : 'false'
      }
    }

    setAnswers(nextAnswers)

    if (regras && resultados && atividades) {
      const r = runEngine(nextAnswers)
      if (r?.regra_aplicada) {
        const applied = regras.filter((reg) => reg.regra_id === r.regra_aplicada)
        if (applied.some((reg) => reg.encerrar === true || reg.encerrar === 'true')) {
          setEarlyTermination(true)
          setResult(r)
          setShowResult(false)
          return
        }
      }
    }

    setShowResult(false)
    setResult(null)
    setEarlyTermination(false)
  }

  const classify = () => {
    const r = runEngine(answers)
    if (!r) return
    setResult(r)
    setShowResult(true)
  }

  // Fill answers programmatically (e.g. reusing exact values already collected on
  // the Unidade) without running the engine. Existing answers are kept.
  const seedAnswers = (partial: Record<string, string>) => {
    setAnswers((prev) => {
      const next = { ...prev }
      let changed = false
      for (const [key, value] of Object.entries(partial)) {
        if (next[key] === undefined) {
          next[key] = value
          changed = true
        }
      }
      return changed ? next : prev
    })
  }

  const restart = () => {
    setAnswers({})
    setResult(null)
    setShowResult(false)
    setEarlyTermination(false)
  }

  const getOptionsForInput = (origemOpcoes: string): Array<{ value: string; label: string }> => {
    if (origemOpcoes === 'ATIVIDADES') {
      return (atividades ?? []).map((a) => ({
        value: a.codigo,
        label: `${a.codigo} - ${a.atividade_label}`,
      }))
    }
    return (opcoes ?? [])
      .filter((o) => o.input_id === origemOpcoes)
      .map((o) => ({ value: o.opcoes, label: o.opcoes_label }))
  }

  const allAnswered = visibleInputs.every(
    (input) =>
      (input.tipo === 'multipla' && input.obrigatorio !== 'sim') ||
      (answers[input.id] !== undefined && answers[input.id] !== ''),
  )

  const partialResult = Object.keys(answers).length > 0 ? runEngine(answers) : null

  return {
    answers,
    setAnswer,
    seedAnswers,
    visibleInputs,
    result,
    showResult,
    classify,
    restart,
    getOptionsForInput,
    isLoading,
    allAnswered,
    earlyTermination,
    partialResult,
  }
}
