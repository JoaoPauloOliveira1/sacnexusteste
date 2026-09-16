import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useProcesses } from '@/modules/processes'
import { upsertProjection } from '@/modules/shared/lib/upsert-projection'

import { type InspectionDecision, type TechnicalAnalysisProcess } from '../types'
import {
  analystIdentity,
  initialAnalysisProcesses,
  isTechnicalChecklistComplete,
  technicalChecklistItems,
} from './analysis-data'
import { loadAnalysisProcesses, saveAnalysisProcesses } from './analysis-persistence'

interface AnalysisStoreValue {
  processes: readonly TechnicalAnalysisProcess[]
  getProcess: (processId: string) => TechnicalAnalysisProcess | undefined
  startAnalysis: (processId: string) => void
  setDocumentStatus: (
    processId: string,
    documentId: string,
    status: TechnicalAnalysisProcess['documents'][number]['status'],
  ) => void
  setChecklistItem: (processId: string, itemId: string, checked: boolean) => void
  completeChecklist: (processId: string) => void
  setDecision: (
    processId: string,
    decision: InspectionDecision,
    reason: string,
    notes: string,
  ) => boolean
  issueRequirement: (processId: string, notes: string) => boolean
  receiveCorrection: (processId: string) => void
}

const AnalysisStoreContext = createContext<AnalysisStoreValue | null>(null)
const presentationTimestamp = '28/07/2026 às 15:28'

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const { actions: processActions, meta: processMeta, state: processState } = useProcesses()
  const [processes, setProcesses] = useState<TechnicalAnalysisProcess[]>(loadAnalysisProcesses)
  const canonicalProcessId = `process-${processState.process.protocolNumber.toLowerCase()}`

  useEffect(() => {
    if (
      processMeta.classification !== 'risk-2' ||
      !['technical-analysis', 'inspection', 'completed'].includes(
        processState.internalWorkflow.stage,
      )
    ) {
      return
    }

    setProcesses((current) => {
      const template =
        current.find((process) => process.id === canonicalProcessId) ?? initialAnalysisProcesses[0]
      if (!template) {
        return current
      }
      const status: TechnicalAnalysisProcess['status'] =
        processState.internalWorkflow.stage === 'completed' ||
        processState.internalWorkflow.stage === 'inspection'
          ? 'Análise concluída'
          : processState.internalWorkflow.statusLabel === 'Em análise técnica'
            ? 'Em análise'
            : processState.internalWorkflow.statusLabel === 'Correção técnica recebida'
              ? 'Aguardando análise'
              : processState.internalWorkflow.statusLabel.includes('correção')
                ? 'Aguardando correção'
                : 'Aguardando análise'
      const projected: TechnicalAnalysisProcess = {
        ...template,
        id: canonicalProcessId,
        processNumber: processState.process.processNumber,
        protocolNumber: processState.process.protocolNumber,
        companyName: processState.company.legalName,
        companyCnpj: processState.company.cnpj,
        establishmentName: processState.establishment.name || processState.company.tradeName,
        establishmentAddress: [
          processState.establishment.address,
          processState.establishment.number,
          `${processState.establishment.city}/${processState.establishment.state}`,
          processState.establishment.cep,
        ]
          .filter(Boolean)
          .join(', '),
        occupation: processState.establishment.purpose || template.occupation,
        builtArea: `${processState.establishment.builtArea || 'Não informada'} m²`,
        floors: `${processState.establishment.floors || 'Não informado'} pavimento(s)`,
        status,
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
  ])

  useEffect(() => {
    saveAnalysisProcesses(processes)
  }, [processes])

  const value = useMemo<AnalysisStoreValue>(
    () => ({
      processes,
      getProcess: (processId) => processes.find((process) => process.id === processId),
      startAnalysis: (processId) => {
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition('analysis-started')
        }
        setProcesses((current) =>
          current.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  status: 'Em análise',
                  assignedTo: analystIdentity.name,
                  history: [
                    ...process.history,
                    {
                      id: `${process.id}-analysis-${process.history.length + 1}`,
                      title: 'Análise técnica iniciada',
                      description: 'Processo assumido pelo Analista Técnico.',
                      date: presentationTimestamp,
                      user: analystIdentity.name,
                    },
                  ],
                }
              : process,
          ),
        )
      },
      setDocumentStatus: (processId, documentId, status) => {
        setProcesses((current) =>
          current.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  documents: process.documents.map((document) =>
                    document.id === documentId ? { ...document, status } : document,
                  ),
                }
              : process,
          ),
        )
      },
      setChecklistItem: (processId, itemId, checked) => {
        setProcesses((current) =>
          current.map((process) =>
            process.id === processId
              ? { ...process, checklist: { ...process.checklist, [itemId]: checked } }
              : process,
          ),
        )
      },
      completeChecklist: (processId) => {
        setProcesses((current) =>
          current.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  checklist: Object.fromEntries(
                    technicalChecklistItems.map((item) => [item.id, true]),
                  ),
                  documents: process.documents.map((document) => ({
                    ...document,
                    status: 'Conforme',
                  })),
                }
              : process,
          ),
        )
      },
      setDecision: (processId, decision, reason, notes) => {
        const process = processes.find((candidate) => candidate.id === processId)
        if (
          !process ||
          !isTechnicalChecklistComplete(process) ||
          process.documents.some((document) => document.status !== 'Conforme') ||
          !reason.trim()
        ) {
          return false
        }
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition(
            decision === 'required' ? 'analysis-inspection-required' : 'analysis-inspection-waived',
            reason.trim(),
          )
        }

        setProcesses((current) =>
          current.map((candidate) =>
            candidate.id === processId
              ? {
                  ...candidate,
                  status: 'Análise concluída',
                  technicalNotes: notes.trim(),
                  inspectionDecision: decision,
                  inspectionReason: reason.trim(),
                  history: [
                    ...candidate.history,
                    {
                      id: `${candidate.id}-analysis-${candidate.history.length + 1}`,
                      title:
                        decision === 'required'
                          ? 'Vistoria técnica determinada'
                          : 'Vistoria prévia dispensada',
                      description: reason.trim(),
                      date: presentationTimestamp,
                      user: analystIdentity.name,
                    },
                  ],
                }
              : candidate,
          ),
        )
        return true
      },
      issueRequirement: (processId, notes) => {
        if (!notes.trim()) {
          return false
        }
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition('analysis-requirement-issued', notes.trim())
        }

        setProcesses((current) =>
          current.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  status: 'Aguardando correção',
                  technicalNotes: notes.trim(),
                  history: [
                    ...process.history,
                    {
                      id: `${process.id}-analysis-${process.history.length + 1}`,
                      title: 'Exigência técnica emitida',
                      description: notes.trim(),
                      date: presentationTimestamp,
                      user: analystIdentity.name,
                    },
                  ],
                }
              : process,
          ),
        )
        return true
      },
      receiveCorrection: (processId) => {
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition('analysis-correction-received')
        }
        setProcesses((current) =>
          current.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  status: 'Em análise',
                  documents: process.documents.map((document) =>
                    document.status === 'Com exigência'
                      ? { ...document, status: 'Pendente' }
                      : document,
                  ),
                  history: [
                    ...process.history,
                    {
                      id: `${process.id}-analysis-${process.history.length + 1}`,
                      title: 'Correção técnica recebida',
                      description: 'Processo devolvido ao Analista Técnico para reanálise.',
                      date: presentationTimestamp,
                      user: 'João Carlos da Silva',
                    },
                  ],
                }
              : process,
          ),
        )
      },
    }),
    [canonicalProcessId, processActions, processes],
  )

  return <AnalysisStoreContext.Provider value={value}>{children}</AnalysisStoreContext.Provider>
}

export function useAnalysisStore() {
  const store = useContext(AnalysisStoreContext)
  if (!store) {
    throw new Error('useAnalysisStore must be used inside AnalysisProvider')
  }
  return store
}
