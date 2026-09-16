import { describe, expect, it } from 'vitest'
import {
  checklistGroups,
  getChecklistProgress,
  initialTriageProcesses,
  isChecklistComplete,
  isProcessInActiveQueue,
} from '@/modules/triage'

describe('triage presentation data', () => {
  it('contains every administrative checklist group and item from the persona document', () => {
    expect(checklistGroups.map((group) => group.title)).toEqual([
      'Empresa',
      'Empreendimento',
      'Responsável Técnico',
      'Documentação',
      'Processo',
    ])
    expect(checklistGroups.flatMap((group) => group.items)).toHaveLength(18)
  })

  it('provides active, correction and completed queue scenarios', () => {
    expect(initialTriageProcesses.some(isProcessInActiveQueue)).toBe(true)
    expect(initialTriageProcesses.some((process) => process.status === 'Correções Recebidas')).toBe(
      true,
    )
    expect(
      initialTriageProcesses.some((process) => process.status === 'Encaminhado para Distribuição'),
    ).toBe(true)
  })

  it('only considers a process complete when every checklist item is checked', () => {
    const completedProcess = initialTriageProcesses.find(
      (process) => process.status === 'Encaminhado para Distribuição',
    )
    if (!completedProcess) {
      throw new Error('Completed presentation process fixture is missing')
    }
    expect(getChecklistProgress(completedProcess)).toEqual({ completed: 18, total: 18 })
    expect(isChecklistComplete(completedProcess)).toBe(true)
  })
})
