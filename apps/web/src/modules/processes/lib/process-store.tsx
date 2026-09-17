import { createContext, use, useEffect, useMemo, useReducer } from 'react'

import { type Company, emptyCompany } from '@/modules/companies'
import {
  type ClassificationAnswers,
  type CompletedProcess,
  type ContributorActor,
  type EstablishmentData,
  type HistoryEvent,
  type InternalWorkflowState,
  type InternalWorkflowTransition,
  type ProcessData,
  type ProcessPhase,
  type RiskClassification,
  type RiskTwoDeclarationData,
  type RiskTwoDocumentId,
  type RiskTwoJourneyData,
  type RiskTwoPaymentMethod,
  type RiskTwoResponsibleData,
} from '../types'
import {
  createDemoProcess,
  createInitialRiskTwoJourney,
  createIssuedDocuments,
  demoContributorActor,
  emptyEstablishment,
  getRiskClassification,
  historyEvents,
  initialBreAnswers,
  riskTwoHistoryEvents,
} from './process-data'
import { clearProcessState, loadProcessState, saveProcessState } from './process-persistence'

export interface ActiveProcessRecord {
  company: Company
  establishment: EstablishmentData
  answers: ClassificationAnswers
  declarationAccepted: boolean
  riskTwo: RiskTwoJourneyData
  phase: ProcessPhase
  process: ProcessData
  internalWorkflow: InternalWorkflowState
}

export interface ProcessState extends ActiveProcessRecord {
  actor: ContributorActor
  activeProcesses: ActiveProcessRecord[]
  completedProcesses: CompletedProcess[]
}

interface ProcessActions {
  startRequest: () => void
  resumeRequest: (processId: string) => void
  confirmRequest: () => void
  saveCompany: (company: Company) => void
  saveEstablishment: (establishment: EstablishmentData) => void
  saveAnswers: (answers: ClassificationAnswers) => void
  setAnswer: (questionId: keyof ClassificationAnswers, answer: 'Sim' | 'Não') => void
  startClassificationAnalysis: () => void
  classify: () => void
  setDeclarationAccepted: (accepted: boolean) => void
  startProcessing: () => void
  saveRiskTwoResponsible: (responsible: RiskTwoResponsibleData) => void
  saveRiskTwoDeclaration: (declaration: RiskTwoDeclarationData) => void
  saveRiskTwoDocument: (
    documentId: RiskTwoDocumentId,
    file: { name: string; size: number; type: string },
  ) => void
  removeRiskTwoDocument: (documentId: RiskTwoDocumentId) => void
  completeRiskTwoDocuments: () => void
  confirmRiskTwoPayment: (method: RiskTwoPaymentMethod) => void
  setRiskTwoReviewConfirmed: (confirmed: boolean) => void
  protocolRiskTwo: () => void
  advanceRiskTwoValidation: () => void
  respondToRiskTwoRequirement: (
    response: string,
    file?: { name: string; size: number; type: string },
  ) => void
  scheduleRiskTwoInspection: (scheduledAt: string) => void
  completeRiskTwoInspection: () => void
  recordInternalTransition: (transition: InternalWorkflowTransition, description?: string) => void
  completeProcess: () => void
  reset: () => void
  signOut: () => void
}

interface ProcessMeta {
  process: ProcessData
  activeProcesses: readonly ActiveProcessRecord[]
  completedProcesses: readonly CompletedProcess[]
  classification: RiskClassification | null
  isAutomaticIssuanceEligible: boolean
  hasActiveProcess: boolean
  hasCompletedProcess: boolean
  processCount: number
  activeCount: number
  completedCount: number
  documentCount: number
}

interface ProcessContextValue {
  state: ProcessState
  actions: ProcessActions
  meta: ProcessMeta
}

export type ProcessEvent =
  | { type: 'set-actor'; actor: ContributorActor }
  | { type: 'start-request' }
  | { type: 'resume-request'; processId: string }
  | { type: 'confirm-request' }
  | { type: 'save-company'; company: Company }
  | { type: 'save-establishment'; establishment: EstablishmentData }
  | { type: 'save-answers'; answers: ClassificationAnswers }
  | { type: 'answer'; questionId: keyof ClassificationAnswers; answer: 'Sim' | 'Não' }
  | { type: 'start-classification-analysis' }
  | { type: 'classify' }
  | { type: 'accept-declaration'; accepted: boolean }
  | { type: 'start-processing' }
  | { type: 'save-risk-two-responsible'; responsible: RiskTwoResponsibleData }
  | { type: 'save-risk-two-declaration'; declaration: RiskTwoDeclarationData }
  | {
      type: 'save-risk-two-document'
      documentId: RiskTwoDocumentId
      file: { name: string; size: number; type: string }
    }
  | { type: 'remove-risk-two-document'; documentId: RiskTwoDocumentId }
  | { type: 'complete-risk-two-documents' }
  | { type: 'confirm-risk-two-payment'; method: RiskTwoPaymentMethod }
  | { type: 'confirm-risk-two-review'; confirmed: boolean }
  | { type: 'protocol-risk-two' }
  | { type: 'advance-risk-two-validation' }
  | {
      type: 'respond-risk-two-requirement'
      response: string
      file?: { name: string; size: number; type: string }
    }
  | { type: 'schedule-risk-two-inspection'; scheduledAt: string }
  | { type: 'complete-risk-two-inspection' }
  | {
      type: 'record-internal-transition'
      transition: InternalWorkflowTransition
      description?: string
    }
  | { type: 'complete-process' }
  | { type: 'reset' }

export const initialProcessState: ProcessState = {
  actor: demoContributorActor,
  company: emptyCompany,
  establishment: emptyEstablishment,
  answers: initialBreAnswers,
  declarationAccepted: false,
  riskTwo: createInitialRiskTwoJourney(),
  phase: 'idle',
  process: createDemoProcess(0),
  activeProcesses: [],
  completedProcesses: [],
  internalWorkflow: {
    stage: 'not-started',
    statusLabel: 'Não iniciado',
    history: [],
  },
}

const ProcessContext = createContext<ProcessContextValue | null>(null)

export function processReducer(state: ProcessState, event: ProcessEvent): ProcessState {
  switch (event.type) {
    case 'set-actor':
      return { ...state, actor: event.actor }
    case 'start-request': {
      const activeProcesses = archiveCurrentProcess(state)
      return {
        ...state,
        activeProcesses,
        company: emptyCompany,
        establishment: emptyEstablishment,
        answers: initialBreAnswers,
        declarationAccepted: false,
        riskTwo: createInitialRiskTwoJourney(),
        internalWorkflow: {
          stage: 'not-started',
          statusLabel: 'Não iniciado',
          history: [],
        },
        phase: 'request-selected',
        process: createDemoProcess(state.completedProcesses.length + activeProcesses.length),
      }
    }
    case 'resume-request': {
      const processToResume = state.activeProcesses.find(
        ({ process }) => process.id === event.processId,
      )
      if (!processToResume) {
        return state
      }

      return {
        ...state,
        ...processToResume,
        activeProcesses: archiveCurrentProcess(state).filter(
          ({ process }) => process.id !== event.processId,
        ),
      }
    }
    case 'confirm-request':
      return { ...state, phase: 'request-confirmed' }
    case 'save-company':
      return { ...state, company: event.company }
    case 'save-establishment':
      return {
        ...state,
        establishment: event.establishment,
        phase: 'establishment-completed',
      }
    case 'answer':
      return {
        ...state,
        answers: { ...state.answers, [event.questionId]: event.answer },
        declarationAccepted: false,
        phase: 'establishment-completed',
      }
    case 'save-answers':
      return {
        ...state,
        answers: event.answers,
        declarationAccepted: false,
        phase: 'questionnaire-completed',
      }
    case 'start-classification-analysis':
      if (Object.values(state.answers).some((answer) => answer === '')) {
        return state
      }
      return { ...state, phase: 'classification-analyzing' }
    case 'classify':
      if (state.phase !== 'classification-analyzing' && state.phase !== 'questionnaire-completed') {
        return state
      }
      return { ...state, phase: 'classified' }
    case 'accept-declaration':
      return {
        ...state,
        declarationAccepted: event.accepted,
        phase: event.accepted ? 'declaration-accepted' : 'classified',
      }
    case 'start-processing':
      if (!state.declarationAccepted) {
        return state
      }
      return { ...state, phase: 'processing' }
    case 'save-risk-two-responsible':
      if (getRiskClassification(state.answers) !== 'risk-2') {
        return state
      }
      return {
        ...state,
        phase: 'risk-two-responsible-completed',
        riskTwo: { ...state.riskTwo, responsible: event.responsible },
      }
    case 'save-risk-two-declaration':
      if (
        !event.declaration.responsibilitiesAccepted ||
        !event.declaration.informationConfirmed ||
        !event.declaration.signatureMethod
      ) {
        return state
      }
      return {
        ...state,
        phase: 'risk-two-declaration-completed',
        riskTwo: {
          ...state.riskTwo,
          declaration: event.declaration,
          documents: state.riskTwo.documents.map((document) =>
            document.id === 'responsibility-declaration'
              ? {
                  ...document,
                  status: 'generated' as const,
                  fileName: 'declaracao-de-responsabilidade.pdf',
                  fileSize: 148_000,
                  fileType: 'application/pdf',
                }
              : document,
          ),
        },
      }
    case 'save-risk-two-document':
      return {
        ...state,
        riskTwo: {
          ...state.riskTwo,
          documents: state.riskTwo.documents.map((document) =>
            document.id === event.documentId
              ? {
                  ...document,
                  status: 'uploaded' as const,
                  fileName: event.file.name,
                  fileSize: event.file.size,
                  fileType: event.file.type,
                }
              : document,
          ),
        },
      }
    case 'remove-risk-two-document':
      if (event.documentId === 'responsibility-declaration') {
        return state
      }
      return {
        ...state,
        phase: 'risk-two-declaration-completed',
        riskTwo: {
          ...state.riskTwo,
          documents: state.riskTwo.documents.map((document) => {
            if (document.id !== event.documentId) {
              return document
            }
            const {
              fileName: _fileName,
              fileSize: _fileSize,
              fileType: _fileType,
              ...pending
            } = document
            return { ...pending, status: 'pending' as const }
          }),
        },
      }
    case 'complete-risk-two-documents':
      if (
        state.riskTwo.documents.some(
          (document) => document.required && document.status === 'pending',
        )
      ) {
        return state
      }
      return { ...state, phase: 'risk-two-documents-completed' }
    case 'confirm-risk-two-payment':
      if (!event.method) {
        return state
      }
      return {
        ...state,
        phase: 'risk-two-payment-completed',
        riskTwo: {
          ...state.riskTwo,
          payment: { ...state.riskTwo.payment, method: event.method, status: 'confirmed' },
        },
      }
    case 'confirm-risk-two-review':
      return {
        ...state,
        phase: event.confirmed ? 'risk-two-ready-to-protocol' : 'risk-two-payment-completed',
        riskTwo: { ...state.riskTwo, reviewConfirmed: event.confirmed },
      }
    case 'protocol-risk-two':
      if (!state.riskTwo.reviewConfirmed || state.riskTwo.payment.status !== 'confirmed') {
        return state
      }
      return {
        ...state,
        phase: 'risk-two-protocolled',
        internalWorkflow: {
          stage: 'administrative-triage',
          statusLabel: 'Aguardando triagem administrativa',
          history: [
            {
              title: 'Incluído na fila de triagem',
              date: '29/07/2026',
              time: '14:33',
              user: 'SAC Nexus',
              source: 'Motor de processos',
              description: 'O protocolo foi disponibilizado para conferência administrativa.',
            },
          ],
        },
        process: {
          ...state.process,
          protocolNumber: `SAC-${state.process.processNumber.replace('.', '-')}`,
        },
      }
    case 'advance-risk-two-validation':
      if (state.phase === 'risk-two-protocolled') {
        return {
          ...state,
          phase: 'risk-two-requirement',
          riskTwo: {
            ...state.riskTwo,
            requirement: {
              id: 'requirement-001',
              title: 'Documento de identificação ilegível',
              description:
                'Envie uma nova cópia colorida, sem cortes e com frente e verso legíveis.',
              deadline: '10/08/2026',
              status: 'pending',
              response: '',
            },
          },
        }
      }
      if (
        state.phase !== 'risk-two-reanalyzing' ||
        state.riskTwo.requirement?.status !== 'responded'
      ) {
        return state
      }
      if (state.answers.flammables === 'Sim') {
        return {
          ...state,
          phase: 'risk-two-inspection-required',
          riskTwo: {
            ...state.riskTwo,
            inspection: {
              required: true,
              status: 'required',
              scheduledAt: '',
            },
          },
        }
      }
      return completeRiskTwoProcess(state, false)
    case 'respond-risk-two-requirement':
      if (!state.riskTwo.requirement || !event.response.trim()) {
        return state
      }
      if (state.riskTwo.requirement.originStage) {
        const originStage = state.riskTwo.requirement.originStage
        const statusLabel =
          originStage === 'administrative-triage'
            ? 'Correções recebidas'
            : originStage === 'technical-analysis'
              ? 'Correção técnica recebida'
              : 'Correção de vistoria recebida'
        return {
          ...state,
          phase: 'risk-two-protocolled',
          internalWorkflow: {
            ...state.internalWorkflow,
            stage: originStage,
            statusLabel,
            history: [
              ...state.internalWorkflow.history,
              {
                title: 'Resposta à exigência enviada',
                date: '29/07/2026',
                time: '16:10',
                user: state.actor.name,
                source: 'Portal do contribuinte',
                description: event.response.trim(),
              },
            ],
          },
          riskTwo: {
            ...state.riskTwo,
            requirement: {
              ...state.riskTwo.requirement,
              status: 'responded',
              response: event.response.trim(),
              ...(event.file
                ? {
                    attachment: {
                      fileName: event.file.name,
                      fileSize: event.file.size,
                      fileType: event.file.type,
                    },
                  }
                : {}),
            },
          },
        }
      }
      return {
        ...state,
        phase: 'risk-two-reanalyzing',
        riskTwo: {
          ...state.riskTwo,
          requirement: {
            ...state.riskTwo.requirement,
            status: 'responded',
            response: event.response.trim(),
            ...(event.file
              ? {
                  attachment: {
                    fileName: event.file.name,
                    fileSize: event.file.size,
                    fileType: event.file.type,
                  },
                }
              : {}),
          },
        },
      }
    case 'schedule-risk-two-inspection':
      if (state.phase !== 'risk-two-inspection-required' || !event.scheduledAt) {
        return state
      }
      return {
        ...state,
        phase: 'risk-two-inspection-scheduled',
        riskTwo: {
          ...state.riskTwo,
          inspection: {
            required: true,
            status: 'scheduled',
            scheduledAt: event.scheduledAt,
          },
        },
      }
    case 'complete-risk-two-inspection':
      if (state.phase !== 'risk-two-inspection-scheduled') {
        return state
      }
      return completeRiskTwoProcess(state, true)
    case 'record-internal-transition':
      return applyInternalTransition(state, event.transition, event.description)
    case 'complete-process':
      if (state.phase !== 'processing') {
        return state
      }
      return {
        ...state,
        phase: 'completed',
        completedProcesses: state.completedProcesses.some(
          ({ process }) => process.id === state.process.id,
        )
          ? state.completedProcesses
          : [
              ...state.completedProcesses,
              {
                process: state.process,
                company: state.company,
                establishment: state.establishment,
                answers: state.answers,
                classification: 'risk-1',
                issuedDocuments: createIssuedDocuments(state.process, 'risk-1'),
                history: historyEvents,
              },
            ],
      }
    case 'reset':
      clearProcessState()
      return {
        ...initialProcessState,
        actor: state.actor,
      }
  }
}

export function ProcessProvider({
  actor = demoContributorActor,
  children,
  onSignOut,
}: {
  actor?: ContributorActor
  children: React.ReactNode
  onSignOut?: () => void
}) {
  const [state, dispatch] = useReducer(
    processReducer,
    {
      ...initialProcessState,
      actor,
    },
    loadProcessState,
  )

  useEffect(() => {
    dispatch({ type: 'set-actor', actor })
  }, [actor])

  useEffect(() => {
    saveProcessState(state)
  }, [state])
  const classification: RiskClassification | null = getRiskClassification(state.answers)
  const isAutomaticIssuanceEligible = classification === 'risk-1'
  const hasCompletedProcess = state.completedProcesses.length > 0
  const activeProcesses = collectActiveProcesses(state)
  const hasActiveProcess = activeProcesses.length > 0
  const actions = useMemo<ProcessActions>(
    () => ({
      startRequest: () => dispatch({ type: 'start-request' }),
      resumeRequest: (processId) => dispatch({ type: 'resume-request', processId }),
      confirmRequest: () => dispatch({ type: 'confirm-request' }),
      saveCompany: (company) => dispatch({ type: 'save-company', company }),
      saveEstablishment: (establishment) => dispatch({ type: 'save-establishment', establishment }),
      saveAnswers: (answers) => dispatch({ type: 'save-answers', answers }),
      setAnswer: (questionId, answer) => dispatch({ type: 'answer', questionId, answer }),
      startClassificationAnalysis: () => dispatch({ type: 'start-classification-analysis' }),
      classify: () => dispatch({ type: 'classify' }),
      setDeclarationAccepted: (accepted) => dispatch({ type: 'accept-declaration', accepted }),
      startProcessing: () => dispatch({ type: 'start-processing' }),
      saveRiskTwoResponsible: (responsible) =>
        dispatch({ type: 'save-risk-two-responsible', responsible }),
      saveRiskTwoDeclaration: (declaration) =>
        dispatch({ type: 'save-risk-two-declaration', declaration }),
      saveRiskTwoDocument: (documentId, file) =>
        dispatch({ type: 'save-risk-two-document', documentId, file }),
      removeRiskTwoDocument: (documentId) =>
        dispatch({ type: 'remove-risk-two-document', documentId }),
      completeRiskTwoDocuments: () => dispatch({ type: 'complete-risk-two-documents' }),
      confirmRiskTwoPayment: (method) => dispatch({ type: 'confirm-risk-two-payment', method }),
      setRiskTwoReviewConfirmed: (confirmed) =>
        dispatch({ type: 'confirm-risk-two-review', confirmed }),
      protocolRiskTwo: () => dispatch({ type: 'protocol-risk-two' }),
      advanceRiskTwoValidation: () => dispatch({ type: 'advance-risk-two-validation' }),
      respondToRiskTwoRequirement: (response, file) =>
        dispatch({
          type: 'respond-risk-two-requirement',
          response,
          ...(file ? { file } : {}),
        }),
      scheduleRiskTwoInspection: (scheduledAt) =>
        dispatch({ type: 'schedule-risk-two-inspection', scheduledAt }),
      completeRiskTwoInspection: () => dispatch({ type: 'complete-risk-two-inspection' }),
      recordInternalTransition: (transition, description) =>
        dispatch({
          type: 'record-internal-transition',
          transition,
          ...(description ? { description } : {}),
        }),
      completeProcess: () => dispatch({ type: 'complete-process' }),
      reset: () => dispatch({ type: 'reset' }),
      signOut: () => onSignOut?.(),
    }),
    [onSignOut],
  )

  const value = useMemo<ProcessContextValue>(
    () => ({
      state,
      actions,
      meta: {
        process: state.process,
        activeProcesses,
        completedProcesses: state.completedProcesses,
        classification,
        isAutomaticIssuanceEligible,
        hasActiveProcess,
        hasCompletedProcess,
        processCount: state.completedProcesses.length + activeProcesses.length,
        activeCount: activeProcesses.length,
        completedCount: state.completedProcesses.length,
        documentCount: state.completedProcesses.reduce(
          (total, record) =>
            total +
            (record.issuedDocuments?.length ??
              createIssuedDocuments(record.process, record.classification ?? 'risk-1').length),
          0,
        ),
      },
    }),
    [
      actions,
      activeProcesses,
      classification,
      hasActiveProcess,
      hasCompletedProcess,
      isAutomaticIssuanceEligible,
      state,
    ],
  )

  return <ProcessContext value={value}>{children}</ProcessContext>
}

function isCurrentProcessActive(state: ProcessState) {
  return state.phase !== 'idle' && state.phase !== 'completed' && Boolean(state.company.id)
}

function toActiveProcessRecord(state: ProcessState): ActiveProcessRecord {
  return {
    company: state.company,
    establishment: state.establishment,
    answers: state.answers,
    declarationAccepted: state.declarationAccepted,
    riskTwo: state.riskTwo,
    phase: state.phase,
    process: state.process,
    internalWorkflow: state.internalWorkflow,
  }
}

function archiveCurrentProcess(state: ProcessState) {
  if (!isCurrentProcessActive(state)) {
    return state.activeProcesses
  }

  const current = toActiveProcessRecord(state)
  return [
    ...state.activeProcesses.filter(({ process }) => process.id !== current.process.id),
    current,
  ]
}

function collectActiveProcesses(state: ProcessState) {
  return isCurrentProcessActive(state)
    ? [
        ...state.activeProcesses.filter(({ process }) => process.id !== state.process.id),
        toActiveProcessRecord(state),
      ]
    : state.activeProcesses
}

function completeRiskTwoProcess(state: ProcessState, inspected: boolean): ProcessState {
  const history = createCompletedRiskTwoHistory(state, inspected)
  const completedProcess: CompletedProcess = {
    process: state.process,
    company: state.company,
    establishment: state.establishment,
    answers: state.answers,
    classification: 'risk-2',
    issuedDocuments: createIssuedDocuments(state.process, 'risk-2'),
    history,
  }

  return {
    ...state,
    phase: 'completed',
    riskTwo: {
      ...state.riskTwo,
      inspection: inspected
        ? {
            ...state.riskTwo.inspection,
            required: true,
            status: 'approved',
          }
        : {
            required: false,
            status: 'approved',
            scheduledAt: '',
          },
    },
    internalWorkflow: {
      ...state.internalWorkflow,
      stage: 'completed',
      statusLabel: 'Concluído',
    },
    completedProcesses: state.completedProcesses.some(
      ({ process }) => process.id === state.process.id,
    )
      ? state.completedProcesses
      : [...state.completedProcesses, completedProcess],
  }
}

function createCompletedRiskTwoHistory(state: ProcessState, inspected: boolean) {
  const history: HistoryEvent[] = [
    ...(riskTwoHistoryEvents[0] ? [riskTwoHistoryEvents[0]] : []),
    ...state.internalWorkflow.history,
  ]
  const hasEvent = (title: string) => history.some((event) => event.title === title)

  if (
    state.riskTwo.requirement?.status === 'responded' &&
    !hasEvent('Resposta à exigência enviada')
  ) {
    history.push({
      title: 'Resposta à exigência enviada',
      date: '29/07/2026',
      time: '14:48',
      user: state.actor.name,
      source: 'Portal do Contribuinte',
      description: state.riskTwo.requirement.response,
    })
  }

  if (inspected && !hasEvent('Vistoria aprovada')) {
    history.push({
      title: 'Vistoria aprovada',
      date: '29/07/2026',
      time: '15:45',
      user: 'Equipe de vistoria',
      source: 'CBMPE',
      description: 'A vistoria foi concluída sem impedimentos para a emissão.',
    })
  }

  history.push({
    title: inspected ? 'Rito com vistoria concluído' : 'Análise concluída',
    date: '29/07/2026',
    time: '15:10',
    user: 'SAC Nexus',
    source: 'Motor de processos',
    description: inspected
      ? 'A análise e a vistoria foram concluídas.'
      : 'A análise foi concluída sem necessidade de vistoria prévia.',
  })

  const issuanceEvent = riskTwoHistoryEvents.at(-1)
  if (issuanceEvent) {
    history.push(issuanceEvent)
  }

  return history
}

function applyInternalTransition(
  state: ProcessState,
  transition: InternalWorkflowTransition,
  description = '',
): ProcessState {
  const transitions: Record<
    InternalWorkflowTransition,
    {
      stage: InternalWorkflowState['stage']
      statusLabel: string
      title: string
      actor: string
    }
  > = {
    'triage-started': {
      stage: 'administrative-triage',
      statusLabel: 'Em triagem administrativa',
      title: 'Triagem administrativa iniciada',
      actor: 'Triador',
    },
    'triage-requirement-issued': {
      stage: 'administrative-triage',
      statusLabel: 'Aguardando correção administrativa',
      title: 'Exigência administrativa emitida',
      actor: 'Triador',
    },
    'triage-correction-received': {
      stage: 'administrative-triage',
      statusLabel: 'Correções recebidas',
      title: 'Correções administrativas recebidas',
      actor: 'Contribuinte',
    },
    'triage-approved': {
      stage: 'technical-analysis',
      statusLabel: 'Aguardando análise técnica',
      title: 'Triagem administrativa concluída',
      actor: 'Triador',
    },
    'analysis-started': {
      stage: 'technical-analysis',
      statusLabel: 'Em análise técnica',
      title: 'Análise técnica iniciada',
      actor: 'Triador',
    },
    'analysis-requirement-issued': {
      stage: 'technical-analysis',
      statusLabel: 'Aguardando correção técnica',
      title: 'Exigência técnica emitida',
      actor: 'Triador',
    },
    'analysis-correction-received': {
      stage: 'technical-analysis',
      statusLabel: 'Correção técnica recebida',
      title: 'Correção técnica recebida',
      actor: 'Contribuinte',
    },
    'analysis-inspection-waived': {
      stage: 'completed',
      statusLabel: 'Aprovado sem vistoria prévia',
      title: 'Vistoria prévia dispensada',
      actor: 'Triador',
    },
    'analysis-inspection-required': {
      stage: 'inspection',
      statusLabel: 'Aguardando agendamento de vistoria',
      title: 'Vistoria determinada',
      actor: 'Triador',
    },
    'inspection-scheduled': {
      stage: 'inspection',
      statusLabel: 'Vistoria agendada',
      title: 'Vistoria agendada',
      actor: 'Vistoriador',
    },
    'inspection-started': {
      stage: 'inspection',
      statusLabel: 'Vistoria em andamento',
      title: 'Vistoria iniciada',
      actor: 'Vistoriador',
    },
    'inspection-requirement-issued': {
      stage: 'inspection',
      statusLabel: 'Aguardando correção da vistoria',
      title: 'Exigência de vistoria emitida',
      actor: 'Vistoriador',
    },
    'inspection-correction-received': {
      stage: 'inspection',
      statusLabel: 'Correção recebida para revistoria',
      title: 'Correção de vistoria recebida',
      actor: 'Contribuinte',
    },
    'inspection-approved': {
      stage: 'completed',
      statusLabel: 'Vistoria aprovada',
      title: 'Vistoria aprovada',
      actor: 'Vistoriador',
    },
  }
  const next = transitions[transition]
  const historyEvent = {
    title: next.title,
    date: '29/07/2026',
    time: '15:30',
    user: next.actor,
    source: 'Motor de processos',
    description: description || next.statusLabel,
  }
  const withWorkflow: ProcessState = {
    ...state,
    internalWorkflow: {
      stage: next.stage,
      statusLabel: next.statusLabel,
      history: [...state.internalWorkflow.history, historyEvent],
    },
  }

  if (transition === 'analysis-inspection-waived') {
    return completeRiskTwoProcess(withWorkflow, false)
  }
  if (transition === 'analysis-inspection-required') {
    return {
      ...withWorkflow,
      phase: 'risk-two-inspection-required',
      riskTwo: {
        ...state.riskTwo,
        inspection: { required: true, status: 'required', scheduledAt: '' },
      },
    }
  }
  if (transition === 'inspection-scheduled') {
    return {
      ...withWorkflow,
      phase: 'risk-two-inspection-scheduled',
      riskTwo: {
        ...state.riskTwo,
        inspection: {
          required: true,
          status: 'scheduled',
          scheduledAt: '31/07/2026 às 09:00',
        },
      },
    }
  }
  if (transition === 'inspection-approved') {
    return completeRiskTwoProcess(withWorkflow, true)
  }
  if (
    transition === 'triage-requirement-issued' ||
    transition === 'analysis-requirement-issued' ||
    transition === 'inspection-requirement-issued'
  ) {
    const requirementByTransition = {
      'triage-requirement-issued': {
        title: 'Correção cadastral necessária',
        description:
          description ||
          'Revise os dados e encaminhe o documento solicitado para nova conferência.',
      },
      'analysis-requirement-issued': {
        title: 'Correção documental necessária',
        description:
          description ||
          'Encaminhe uma versão atualizada do documento para continuidade da análise técnica.',
      },
      'inspection-requirement-issued': {
        title: 'Adequação solicitada após vistoria',
        description:
          description ||
          'Comprove a adequação indicada pela equipe de vistoria para nova avaliação.',
      },
    } as const
    const requirement = requirementByTransition[transition]

    return {
      ...withWorkflow,
      phase: 'risk-two-requirement',
      riskTwo: {
        ...state.riskTwo,
        requirement: {
          id: `requirement-${state.internalWorkflow.history.length + 1}`,
          title: requirement.title,
          description: requirement.description,
          deadline: '10/08/2026',
          status: 'pending',
          response: '',
          originStage: next.stage as Exclude<
            InternalWorkflowState['stage'],
            'not-started' | 'completed'
          >,
        },
      },
    }
  }

  return withWorkflow
}

export function useProcesses() {
  const context = use(ProcessContext)
  if (!context) {
    throw new Error('useProcesses must be used inside ProcessProvider')
  }
  return context
}

/**
 * Compatibility facade for auxiliary presentation pages that are outside the
 * eleven-frame rebuild. New process screens use `useProcesses`.
 */
export function useProcessStore() {
  const { actions, meta, state } = useProcesses()

  return {
    company: state.company,
    companyRegistered: true,
    establishment: state.establishment,
    establishmentRegistered: state.phase !== 'idle' && state.phase !== 'request-selected',
    hasCompletedProcess: meta.hasCompletedProcess,
    answers: state.answers as unknown as Record<string, string>,
    completedEstablishment:
      meta.completedProcesses.at(-1)?.establishment ??
      (meta.hasCompletedProcess ? state.establishment : null),
    completedAnswers: (meta.completedProcesses.at(-1)?.answers ??
      state.answers) as unknown as Record<string, string>,
    classificationReady:
      state.phase === 'classified' ||
      state.phase === 'declaration-accepted' ||
      state.phase === 'processing' ||
      state.phase === 'completed',
    declarationAccepted: state.declarationAccepted,
    classification: meta.classification,
    process: meta.process,
    status: state.phase,
    saveCompany: actions.saveCompany,
    saveEstablishment: actions.saveEstablishment,
    setAnswer: (questionId: string, answer: string) => {
      if (
        (questionId === 'flammables' ||
          questionId === 'areaAboveLimit' ||
          questionId === 'floorsAboveLimit') &&
        (answer === 'Sim' || answer === 'Não')
      ) {
        actions.setAnswer(questionId, answer)
      }
    },
    setClassificationReady: (ready: boolean) => {
      if (ready) {
        actions.classify()
      }
    },
    setDeclarationAccepted: actions.setDeclarationAccepted,
    saveRequest: actions.confirmRequest,
    startProcessing: actions.startProcessing,
    completeProcess: actions.completeProcess,
    startNewRequest: actions.startRequest,
  }
}
