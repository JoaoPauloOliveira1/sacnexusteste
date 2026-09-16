import { act, renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { AnalysisProvider, useAnalysisStore } from '@/modules/analysis'
import { ProcessProvider } from '@/modules/processes'

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ProcessProvider>
      <AnalysisProvider>{children}</AnalysisProvider>
    </ProcessProvider>
  )
}

describe('technical analysis store', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('manages documents, checklist, and a required inspection decision', () => {
    const { result } = renderHook(() => useAnalysisStore(), { wrapper })
    const processId = result.current.processes[0]?.id

    expect(processId).toBeDefined()
    expect(result.current.getProcess('missing-process')).toBeUndefined()
    expect(
      result.current.setDecision(processId ?? '', 'required', 'Carga elevada', 'Analisar local'),
    ).toBe(false)

    act(() => {
      result.current.startAnalysis(processId ?? '')
    })
    expect(result.current.getProcess(processId ?? '')?.status).toBe('Em análise')

    act(() => {
      result.current.setDocumentStatus(
        processId ?? '',
        'responsibility-declaration',
        'Com exigência',
      )
      result.current.setDocumentStatus('missing-process', 'missing-document', 'Pendente')
      result.current.setChecklistItem(processId ?? '', 'occupation-compatible', true)
      result.current.setChecklistItem('missing-process', 'occupation-compatible', true)
    })
    expect(
      result.current
        .getProcess(processId ?? '')
        ?.documents.find(({ id }) => id === 'responsibility-declaration')?.status,
    ).toBe('Com exigência')

    act(() => {
      result.current.completeChecklist(processId ?? '')
      result.current.completeChecklist('missing-process')
    })

    let accepted = false
    act(() => {
      accepted = result.current.setDecision(
        processId ?? '',
        'required',
        ' Carga de incêndio elevada. ',
        ' Verificar armazenamento. ',
      )
    })

    const process = result.current.getProcess(processId ?? '')
    expect(accepted).toBe(true)
    expect(process?.inspectionDecision).toBe('required')
    expect(process?.inspectionReason).toBe('Carga de incêndio elevada.')
    expect(process?.technicalNotes).toBe('Verificar armazenamento.')
    expect(process?.history.at(-1)?.title).toBe('Vistoria técnica determinada')
  })

  it('issues a requirement, receives the correction, and can waive inspection', () => {
    const { result } = renderHook(() => useAnalysisStore(), { wrapper })
    const processId = result.current.processes[0]?.id ?? ''

    expect(result.current.issueRequirement(processId, '   ')).toBe(false)

    let issued = false
    act(() => {
      result.current.setDocumentStatus(processId, 'extinguisher-invoice', 'Com exigência')
      issued = result.current.issueRequirement(processId, ' Envie uma nota fiscal legível. ')
    })
    expect(issued).toBe(true)
    expect(result.current.getProcess(processId)?.status).toBe('Aguardando correção')

    act(() => {
      result.current.receiveCorrection(processId)
      result.current.receiveCorrection('missing-process')
    })
    expect(
      result.current
        .getProcess(processId)
        ?.documents.find(({ id }) => id === 'extinguisher-invoice')?.status,
    ).toBe('Pendente')

    act(() => {
      result.current.completeChecklist(processId)
    })

    let accepted = false
    act(() => {
      accepted = result.current.setDecision(processId, 'waived', ' Documentação suficiente. ', '')
    })
    expect(accepted).toBe(true)
    expect(result.current.getProcess(processId)?.history.at(-1)?.title).toBe(
      'Vistoria prévia dispensada',
    )
  })
})
