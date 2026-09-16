import { type CondicaoExibicao, type InputField } from './types'

/**
 * Determines which inputs should be visible based on current answers and the
 * conditions in condicoes_exibicao. This is the progressive/gating engine.
 * Ported verbatim from the fire-risk-guide prototype.
 */
export function getVisibleInputs(
  inputs: InputField[],
  condicoes: CondicaoExibicao[],
  answers: Record<string, string>,
): InputField[] {
  const inputsById = new Map(inputs.map((i) => [i.id, i]))
  const memo = new Map<string, boolean>()

  const isVisible = (inputId: string, stack: Set<string>): boolean => {
    const cached = memo.get(inputId)
    if (cached !== undefined) return cached
    if (stack.has(inputId)) return false // cycle guard
    const input = inputsById.get(inputId)
    if (!input) return false

    const conditions = condicoes.filter((c) => c.input_id === inputId)
    if (conditions.length === 0) {
      memo.set(inputId, true)
      return true
    }

    stack.add(inputId)
    const ok = conditions.every((cond) => {
      // The dependent field must itself be visible — otherwise its answer is
      // stale and must not be trusted.
      if (inputsById.has(cond.campo_dependente)) {
        if (!isVisible(cond.campo_dependente, stack)) {
          if (cond.operador === '!=') return true
          return false
        }
      }
      const dependentValue = answers[cond.campo_dependente]
      if (cond.operador === '!=') {
        if (dependentValue === undefined) return true
        return dependentValue !== cond.valor
      }
      if (dependentValue === undefined) return false
      return dependentValue === cond.valor
    })
    stack.delete(inputId)

    memo.set(inputId, ok)
    return ok
  }

  return inputs.filter((input) => isVisible(input.id, new Set()))
}
