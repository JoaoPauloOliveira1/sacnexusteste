import { act, renderHook } from '@testing-library/react'
import { type ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'

import { InspectionProvider, useInspectionStore } from '@/modules/inspections'
import { ProcessProvider } from '@/modules/processes'

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ProcessProvider>
      <InspectionProvider>{children}</InspectionProvider>
    </ProcessProvider>
  )
}

describe('inspection store', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('schedules, starts, completes, and approves an inspection', () => {
    const { result } = renderHook(() => useInspectionStore(), { wrapper })
    const processId = result.current.processes[0]?.id ?? ''

    expect(result.current.getProcess('missing-process')).toBeUndefined()
    expect(result.current.approve(processId, 'Conforme')).toBe(false)

    act(() => {
      result.current.schedule(processId)
      result.current.schedule('missing-process')
    })
    expect(result.current.getProcess(processId)?.status).toBe('Agendada')

    act(() => {
      result.current.start(processId)
      result.current.start('missing-process')
      result.current.setChecklistItem(processId, 'access', true)
      result.current.setChecklistItem('missing-process', 'access', true)
    })
    expect(result.current.getProcess(processId)?.status).toBe('Em vistoria')

    act(() => {
      result.current.completeChecklist(processId)
      result.current.completeChecklist('missing-process')
    })

    let approved = false
    act(() => {
      approved = result.current.approve(processId, ' Condições conformes. ')
    })

    const process = result.current.getProcess(processId)
    expect(approved).toBe(true)
    expect(process?.status).toBe('Aprovada')
    expect(process?.notes).toBe('Condições conformes.')
    expect(process?.certificateNumber).toContain('Atestado de Vistoria')
    expect(process?.history.at(-1)?.title).toBe('Documento emitido')
  })

  it('requires a correction and schedules a new inspection after the response', () => {
    const { result } = renderHook(() => useInspectionStore(), { wrapper })
    const processId = result.current.processes[0]?.id ?? ''

    expect(result.current.requireCorrection(processId, '   ')).toBe(false)

    let required = false
    act(() => {
      required = result.current.requireCorrection(processId, ' Corrigir a sinalização da saída. ')
      result.current.requireCorrection('missing-process', 'Correção inexistente')
    })
    expect(required).toBe(true)
    expect(result.current.getProcess(processId)?.status).toBe('Aguardando correção')

    act(() => {
      result.current.receiveCorrection(processId)
      result.current.receiveCorrection('missing-process')
    })
    const process = result.current.getProcess(processId)
    expect(process?.status).toBe('Agendada')
    expect(process?.scheduledAt).toBe('05/08/2026 às 09:00')
    expect(Object.values(process?.checklist ?? {})).toEqual(expect.arrayContaining([false]))
  })
})
