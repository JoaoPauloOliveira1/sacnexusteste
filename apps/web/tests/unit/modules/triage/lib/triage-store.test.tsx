import { act, renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { ProcessProvider } from '@/modules/processes'
import { TriageProvider, useTriageStore } from '@/modules/triage'

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ProcessProvider>
      <TriageProvider>{children}</TriageProvider>
    </ProcessProvider>
  )
}

describe('triage store', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts triage, completes the checklist, and sends the process to analysis', () => {
    const { result } = renderHook(() => useTriageStore(), { wrapper })
    const processId = result.current.processes[0]?.id ?? ''

    expect(result.current.getProcess('missing-process')).toBeUndefined()
    expect(result.current.approveTriage(processId)).toBe(false)
    expect(result.current.approveTriage('missing-process')).toBe(false)

    act(() => {
      result.current.startTriage(processId)
      result.current.startTriage('missing-process')
      result.current.setChecklistItem(processId, 'company-registration', true)
      result.current.setChecklistItem('missing-process', 'company-registration', true)
      result.current.completeChecklist(processId)
      result.current.completeChecklist('missing-process')
    })

    let approved = false
    act(() => {
      approved = result.current.approveTriage(processId)
    })

    const process = result.current.getProcess(processId)
    expect(approved).toBe(true)
    expect(process?.status).toBe('Encaminhado para Distribuição')
    expect(process?.history.at(-1)?.title).toBe('Encaminhado para distribuição')
  })

  it('issues a requirement and starts a new triage after corrections arrive', () => {
    const { result } = renderHook(() => useTriageStore(), { wrapper })
    const processId = result.current.processes[0]?.id ?? ''

    act(() => {
      result.current.issueRequirement(processId, {
        title: 'Documento ilegível',
        description: 'Substitua o arquivo.',
        legalBasis: 'NT aplicável',
        deadline: '10/08/2026',
      })
      result.current.issueRequirement('missing-process', {
        title: 'Exigência inexistente',
        description: 'Não deve alterar a fila.',
        legalBasis: 'NT aplicável',
        deadline: '10/08/2026',
      })
    })
    expect(result.current.getProcess(processId)?.status).toBe('Aguardando Correções')
    expect(result.current.getProcess(processId)?.requirements.at(-1)?.status).toBe('Aberta')

    act(() => {
      result.current.receiveCorrections(processId)
      result.current.receiveCorrections('missing-process')
    })
    expect(result.current.getProcess(processId)?.requirements.at(-1)?.status).toBe('Atendida')

    act(() => {
      result.current.startTriage(processId)
    })
    expect(result.current.getProcess(processId)?.status).toBe('Em Nova Triagem')
    expect(result.current.getProcess(processId)?.history.at(-1)?.title).toBe(
      'Nova triagem iniciada',
    )
  })
})
