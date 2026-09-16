import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useProcesses } from '@/modules/processes'
import { upsertProjection } from '@/modules/shared/lib/upsert-projection'

import { type InspectionProcess } from '../types'
import {
  initialInspectionProcesses,
  inspectionChecklistItems,
  inspectorIdentity,
  isInspectionChecklistComplete,
} from './inspection-data'

const STORAGE_KEY = 'sac-nexus:inspection-presentation:v1'
const InspectionStoreContext = createContext<ReturnType<typeof createStoreValue> | null>(null)

function loadProcesses() {
  if (typeof window === 'undefined') {
    return structuredClone(initialInspectionProcesses) as InspectionProcess[]
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw
      ? (JSON.parse(raw) as InspectionProcess[])
      : (structuredClone(initialInspectionProcesses) as InspectionProcess[])
  } catch {
    return structuredClone(initialInspectionProcesses) as InspectionProcess[]
  }
}

function createStoreValue(
  processes: InspectionProcess[],
  setProcesses: React.Dispatch<React.SetStateAction<InspectionProcess[]>>,
  canonicalProcessId: string,
  recordInternalTransition: ReturnType<typeof useProcesses>['actions']['recordInternalTransition'],
) {
  return {
    processes,
    getProcess: (processId: string) => processes.find((process) => process.id === processId),
    schedule: (processId: string) => {
      if (processId === canonicalProcessId) {
        recordInternalTransition('inspection-scheduled')
      }
      return setProcesses((current) =>
        current.map((process) =>
          process.id === processId
            ? {
                ...process,
                status: 'Agendada',
                scheduledAt: '31/07/2026 às 09:00',
                assignedTo: inspectorIdentity.name,
                history: [
                  ...process.history,
                  {
                    id: `${process.id}-inspection-${process.history.length + 1}`,
                    title: 'Vistoria agendada',
                    description: 'Visita confirmada para 31/07/2026 às 09:00.',
                    date: '29/07/2026 às 09:12',
                    user: inspectorIdentity.name,
                  },
                ],
              }
            : process,
        ),
      )
    },
    start: (processId: string) => {
      if (processId === canonicalProcessId) {
        recordInternalTransition('inspection-started')
      }
      return setProcesses((current) =>
        current.map((process) =>
          process.id === processId ? { ...process, status: 'Em vistoria' } : process,
        ),
      )
    },
    setChecklistItem: (processId: string, itemId: string, checked: boolean) =>
      setProcesses((current) =>
        current.map((process) =>
          process.id === processId
            ? { ...process, checklist: { ...process.checklist, [itemId]: checked } }
            : process,
        ),
      ),
    completeChecklist: (processId: string) =>
      setProcesses((current) =>
        current.map((process) =>
          process.id === processId
            ? {
                ...process,
                checklist: Object.fromEntries(
                  inspectionChecklistItems.map((item) => [item.id, true]),
                ),
              }
            : process,
        ),
      ),
    approve: (processId: string, notes: string) => {
      const process = processes.find((candidate) => candidate.id === processId)
      if (!process || !isInspectionChecklistComplete(process)) {
        return false
      }
      if (processId === canonicalProcessId) {
        recordInternalTransition('inspection-approved', notes.trim())
      }
      setProcesses((current) =>
        current.map((candidate) =>
          candidate.id === processId
            ? {
                ...candidate,
                status: 'Aprovada',
                notes: notes.trim(),
                certificateNumber: 'AVCB 2026.00001234 · Atestado de Vistoria 2026.00001234',
                history: [
                  ...candidate.history,
                  {
                    id: `${candidate.id}-inspection-${candidate.history.length + 1}`,
                    title: 'Vistoria aprovada',
                    description: 'Condições de segurança verificadas no local.',
                    date: '31/07/2026 às 10:18',
                    user: inspectorIdentity.name,
                  },
                  {
                    id: `${candidate.id}-inspection-${candidate.history.length + 2}`,
                    title: 'Documento emitido',
                    description:
                      'AVCB 2026.00001234 e Atestado de Vistoria 2026.00001234 disponibilizados ao contribuinte.',
                    date: '31/07/2026 às 10:19',
                    user: 'SAC Nexus',
                  },
                ],
              }
            : candidate,
        ),
      )
      return true
    },
    requireCorrection: (processId: string, notes: string) => {
      if (!notes.trim()) {
        return false
      }
      if (processId === canonicalProcessId) {
        recordInternalTransition('inspection-requirement-issued', notes.trim())
      }
      setProcesses((current) =>
        current.map((process) =>
          process.id === processId
            ? {
                ...process,
                status: 'Aguardando correção',
                notes: notes.trim(),
                history: [
                  ...process.history,
                  {
                    id: `${process.id}-inspection-${process.history.length + 1}`,
                    title: 'Exigência de vistoria emitida',
                    description: notes.trim(),
                    date: '31/07/2026 às 10:18',
                    user: inspectorIdentity.name,
                  },
                ],
              }
            : process,
        ),
      )
      return true
    },
    receiveCorrection: (processId: string) => {
      if (processId === canonicalProcessId) {
        recordInternalTransition('inspection-correction-received')
      }
      return setProcesses((current) =>
        current.map((process) =>
          process.id === processId
            ? {
                ...process,
                status: 'Agendada',
                scheduledAt: '05/08/2026 às 09:00',
                checklist: Object.fromEntries(
                  inspectionChecklistItems.map((item) => [item.id, false]),
                ),
                history: [
                  ...process.history,
                  {
                    id: `${process.id}-inspection-${process.history.length + 1}`,
                    title: 'Correção recebida e revistoria agendada',
                    description: 'Nova visita confirmada para 05/08/2026 às 09:00.',
                    date: '04/08/2026 às 11:20',
                    user: 'SAC Nexus',
                  },
                ],
              }
            : process,
        ),
      )
    },
  }
}

export function InspectionProvider({ children }: { children: React.ReactNode }) {
  const { actions: processActions, meta: processMeta, state: processState } = useProcesses()
  const [processes, setProcesses] = useState<InspectionProcess[]>(loadProcesses)
  const canonicalProcessId = `process-${processState.process.protocolNumber.toLowerCase()}`

  useEffect(() => {
    if (
      processMeta.classification !== 'risk-2' ||
      !['inspection', 'completed'].includes(processState.internalWorkflow.stage) ||
      !processState.riskTwo.inspection.required
    ) {
      return
    }

    setProcesses((current) => {
      const template =
        current.find((process) => process.id === canonicalProcessId) ??
        initialInspectionProcesses[0]
      if (!template) {
        return current
      }
      const status: InspectionProcess['status'] =
        processState.internalWorkflow.stage === 'completed'
          ? 'Aprovada'
          : processState.internalWorkflow.statusLabel === 'Vistoria agendada'
            ? 'Agendada'
            : processState.internalWorkflow.statusLabel === 'Vistoria em andamento'
              ? 'Em vistoria'
              : processState.internalWorkflow.statusLabel.includes('correção')
                ? 'Aguardando correção'
                : 'Aguardando agendamento'
      const projected: InspectionProcess = {
        ...template,
        id: canonicalProcessId,
        processNumber: processState.process.processNumber,
        protocolNumber: processState.process.protocolNumber,
        companyName: processState.company.legalName,
        establishmentName: processState.establishment.name || processState.company.tradeName,
        address: [
          processState.establishment.address,
          processState.establishment.number,
          `${processState.establishment.city}/${processState.establishment.state}`,
          processState.establishment.cep,
        ]
          .filter(Boolean)
          .join(', '),
        status,
        scheduledAt: processState.riskTwo.inspection.scheduledAt || template.scheduledAt,
      }

      return upsertProjection(current, projected)
    })
  }, [
    canonicalProcessId,
    processMeta.classification,
    processState.company,
    processState.establishment,
    processState.internalWorkflow.stage,
    processState.internalWorkflow.statusLabel,
    processState.process.processNumber,
    processState.process.protocolNumber,
    processState.riskTwo.inspection.required,
    processState.riskTwo.inspection.scheduledAt,
  ])
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(processes))
    } catch {
      // The presentation remains usable in memory.
    }
  }, [processes])
  const value = useMemo(
    () =>
      createStoreValue(
        processes,
        setProcesses,
        canonicalProcessId,
        processActions.recordInternalTransition,
      ),
    [canonicalProcessId, processActions.recordInternalTransition, processes],
  )
  return <InspectionStoreContext.Provider value={value}>{children}</InspectionStoreContext.Provider>
}

export function useInspectionStore() {
  const store = useContext(InspectionStoreContext)
  if (!store) {
    throw new Error('useInspectionStore must be used inside InspectionProvider')
  }
  return store
}
