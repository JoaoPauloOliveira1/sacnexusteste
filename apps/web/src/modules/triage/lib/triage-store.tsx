import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useProcesses } from '@/modules/processes'
import { upsertProjection } from '@/modules/shared/lib/upsert-projection'
import { type RequirementDraft, type TriageProcess } from '../types'
import {
  checklistItemIds,
  initialTriageProcesses,
  isChecklistComplete,
  triagerIdentity,
} from './triage-data'
import { loadTriageProcesses, saveTriageProcesses } from './triage-persistence'

interface TriageStoreValue {
  processes: readonly TriageProcess[]
  getProcess: (processId: string) => TriageProcess | undefined
  startTriage: (processId: string) => void
  setChecklistItem: (processId: string, itemId: string, checked: boolean) => void
  completeChecklist: (processId: string) => void
  approveTriage: (processId: string) => boolean
  issueRequirement: (processId: string, draft: RequirementDraft) => void
  receiveCorrections: (processId: string) => void
}

const TriageStoreContext = createContext<TriageStoreValue | null>(null)

const presentationTimestamp = '20/07/2026 às 10:18'

export function TriageProvider({ children }: { children: React.ReactNode }) {
  const { actions: processActions, meta: processMeta, state: processState } = useProcesses()
  const [processes, setProcesses] = useState<TriageProcess[]>(loadTriageProcesses)
  const canonicalProcessId = `process-${processState.process.protocolNumber.toLowerCase()}`

  useEffect(() => {
    if (
      processMeta.classification !== 'risk-2' ||
      processState.internalWorkflow.stage === 'not-started'
    ) {
      return
    }

    setProcesses((current) => {
      const template =
        current.find((process) => process.id === canonicalProcessId) ?? initialTriageProcesses[0]
      if (!template) {
        return current
      }
      const status: TriageProcess['status'] =
        processState.internalWorkflow.statusLabel === 'Em triagem administrativa'
          ? 'Em Triagem'
          : processState.internalWorkflow.statusLabel === 'Correções recebidas'
            ? 'Correções Recebidas'
            : processState.internalWorkflow.statusLabel.includes('correção')
              ? 'Aguardando Correções'
              : processState.internalWorkflow.stage === 'technical-analysis' ||
                  processState.internalWorkflow.stage === 'inspection' ||
                  processState.internalWorkflow.stage === 'completed'
                ? 'Encaminhado para Distribuição'
                : 'Protocolado'
      const projected: TriageProcess = {
        ...template,
        id: canonicalProcessId,
        processNumber: processState.process.processNumber,
        protocolNumber: processState.process.protocolNumber,
        company: {
          ...template.company,
          legalName: processState.company.legalName,
          tradeName: processState.company.tradeName,
          cnpj: processState.company.cnpj,
          address: [
            processState.establishment.address,
            processState.establishment.number,
            processState.establishment.neighborhood,
            `${processState.establishment.city}/${processState.establishment.state}`,
            processState.establishment.cep,
          ]
            .filter(Boolean)
            .join(', '),
          contacts: `${processState.riskTwo.responsible.phone || 'Telefone não informado'} · ${processState.actor.email}`,
        },
        establishment: {
          ...template.establishment,
          name: processState.establishment.name || processState.company.tradeName,
          address: [
            processState.establishment.address,
            processState.establishment.number,
            `${processState.establishment.city}/${processState.establishment.state}`,
          ]
            .filter(Boolean)
            .join(', '),
          builtArea: `${processState.establishment.builtArea || 'Não informada'} m²`,
          floors: `${processState.establishment.floors || 'Não informado'} pavimento(s)`,
          purpose: processState.establishment.purpose || 'Não informada',
        },
        contributor: processState.actor.name,
        status,
      }

      return upsertProjection(current, projected)
    })
  }, [
    canonicalProcessId,
    processMeta.classification,
    processState.actor.email,
    processState.actor.name,
    processState.company,
    processState.establishment,
    processState.internalWorkflow.stage,
    processState.internalWorkflow.statusLabel,
    processState.process.processNumber,
    processState.process.protocolNumber,
    processState.riskTwo.responsible.phone,
  ])

  useEffect(() => {
    saveTriageProcesses(processes)
  }, [processes])

  const value = useMemo<TriageStoreValue>(
    () => ({
      processes,
      getProcess: (processId) => processes.find((process) => process.id === processId),
      startTriage: (processId) => {
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition('triage-started')
        }
        setProcesses((current) =>
          current.map((process) => {
            if (process.id !== processId) {
              return process
            }

            const isNewTriage = process.status === 'Correções Recebidas'
            return {
              ...process,
              status: isNewTriage ? 'Em Nova Triagem' : 'Em Triagem',
              history: [
                ...process.history,
                {
                  id: `${process.id}-history-${process.history.length + 1}`,
                  title: isNewTriage ? 'Nova triagem iniciada' : 'Triagem iniciada',
                  description: isNewTriage
                    ? 'Os documentos corrigidos entraram em nova conferência administrativa.'
                    : 'A conferência administrativa e documental foi iniciada.',
                  date: presentationTimestamp,
                  user: triagerIdentity.name,
                },
              ],
            }
          }),
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
                  checklist: Object.fromEntries(checklistItemIds.map((id) => [id, true])),
                }
              : process,
          ),
        )
      },
      approveTriage: (processId) => {
        const process = processes.find((candidate) => candidate.id === processId)
        if (!process || !isChecklistComplete(process)) {
          return false
        }
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition('triage-approved')
        }

        setProcesses((current) =>
          current.map((candidate) =>
            candidate.id === processId
              ? {
                  ...candidate,
                  status: 'Encaminhado para Distribuição',
                  history: [
                    ...candidate.history,
                    {
                      id: `${candidate.id}-history-${candidate.history.length + 1}`,
                      title: 'Triagem concluída',
                      description: 'Checklist administrativo concluído sem pendências.',
                      date: presentationTimestamp,
                      user: triagerIdentity.name,
                    },
                    {
                      id: `${candidate.id}-history-${candidate.history.length + 2}`,
                      title: 'Encaminhado para distribuição',
                      description:
                        'Processo disponibilizado para revisão técnica pelo Triador.',
                      date: presentationTimestamp,
                      user: 'SAC-NEXUS',
                    },
                  ],
                }
              : candidate,
          ),
        )
        return true
      },
      issueRequirement: (processId, draft) => {
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition('triage-requirement-issued', draft.title)
        }
        setProcesses((current) =>
          current.map((process) => {
            if (process.id !== processId) {
              return process
            }

            const requirementId = `${process.id}-requirement-${process.requirements.length + 1}`
            return {
              ...process,
              status: 'Aguardando Correções',
              requirements: [
                ...process.requirements,
                {
                  id: requirementId,
                  ...draft,
                  status: 'Aberta',
                  date: presentationTimestamp,
                  responsibleUser: triagerIdentity.name,
                },
              ],
              history: [
                ...process.history,
                {
                  id: `${process.id}-history-${process.history.length + 1}`,
                  title: 'Exigência administrativa emitida',
                  description: draft.title,
                  date: presentationTimestamp,
                  user: triagerIdentity.name,
                },
              ],
            }
          }),
        )
      },
      receiveCorrections: (processId) => {
        if (processId === canonicalProcessId) {
          processActions.recordInternalTransition('triage-correction-received')
        }
        setProcesses((current) =>
          current.map((process) =>
            process.id === processId
              ? {
                  ...process,
                  status: 'Correções Recebidas',
                  requirements: process.requirements.map((requirement) => ({
                    ...requirement,
                    status: 'Atendida',
                  })),
                  history: [
                    ...process.history,
                    {
                      id: `${process.id}-history-${process.history.length + 1}`,
                      title: 'Correções recebidas',
                      description:
                        'O Contribuinte enviou as correções solicitadas para nova conferência.',
                      date: presentationTimestamp,
                      user: process.contributor,
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

  return <TriageStoreContext.Provider value={value}>{children}</TriageStoreContext.Provider>
}

export function useTriageStore() {
  const store = useContext(TriageStoreContext)
  if (!store) {
    throw new Error('useTriageStore must be used inside TriageProvider')
  }
  return store
}
