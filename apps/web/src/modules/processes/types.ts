import { type Company } from '@/modules/companies'

export interface ContributorActor {
  userId: string
  profileId: string
  profileType: 'contributor' | 'admin'
  profileLabel: string
  name: string
  email: string
  companyIds: readonly string[]
}

export type EstablishmentLocationSource = 'geocoded' | 'user-adjusted' | 'manual'

export interface EstablishmentLocation {
  latitude: number
  longitude: number
  source: EstablishmentLocationSource
  addressFingerprint: string
  confirmedAt: string
}

export interface EstablishmentData {
  name: string
  type: string
  purpose: string
  cep: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  builtArea: string
  floors: string
  constructionYear: string
  basement: 'Sim' | 'Não' | ''
  flammables: 'Sim' | 'Não' | ''
  glp: 'Sim' | 'Não' | ''
  publicPresence: 'Sim' | 'Não' | ''
  industrialActivity: 'Sim' | 'Não' | ''
  riskArea: 'Sim' | 'Não' | ''
  location: EstablishmentLocation | null
}

export interface BreQuestion {
  id: string
  label: string
  type: 'choice' | 'number' | 'text'
  options?: readonly string[]
  suffix?: string
}

export interface BreGroup {
  id: string
  title: string
  description: string
  questions: readonly BreQuestion[]
}

export interface ProcessData {
  id: string
  processNumber: string
  protocolNumber: string
  documentNumber: string
  openedAt: string
  completedAt: string
  issuedAt: string
  validUntil: string
  coscipVersion: string
  validationHash: string
}

export type IssuedDocumentKind = 'ddlcb' | 'avcb' | 'inspection-attestation'

export interface IssuedDocument {
  kind: IssuedDocumentKind
  label: string
  shortLabel: string
  number: string
  issuedAt: string
  validUntil: string
  validationHash: string
}

export interface HistoryEvent {
  title: string
  date: string
  time: string
  user: string
  source: string
  description: string
}

export interface CompletedProcess {
  process: ProcessData
  company: Company
  establishment: EstablishmentData
  answers: ClassificationAnswers
  classification?: RiskClassification
  issuedDocuments: readonly IssuedDocument[]
  history: readonly HistoryEvent[]
}

export interface IssuedDocumentMatch {
  record: CompletedProcess
  document: IssuedDocument
}

export type ProcessPhase =
  | 'idle'
  | 'request-selected'
  | 'request-confirmed'
  | 'establishment-completed'
  | 'questionnaire-completed'
  | 'classification-analyzing'
  | 'classified'
  | 'declaration-accepted'
  | 'processing'
  | 'risk-two-responsible-completed'
  | 'risk-two-declaration-completed'
  | 'risk-two-documents-completed'
  | 'risk-two-payment-completed'
  | 'risk-two-ready-to-protocol'
  | 'risk-two-protocolled'
  | 'risk-two-requirement'
  | 'risk-two-reanalyzing'
  | 'risk-two-inspection-required'
  | 'risk-two-inspection-scheduled'
  | 'completed'

export type YesNoAnswer = 'Sim' | 'Não' | ''

export type RiskClassification = 'risk-1' | 'risk-2'

export interface ClassificationAnswers {
  flammables: YesNoAnswer
  areaAboveLimit: YesNoAnswer
  floorsAboveLimit: YesNoAnswer
}

export type ResponsibleRelationship =
  | 'owner'
  | 'legal-representative'
  | 'proxy'
  | 'technical-responsible'
  | ''

export interface RiskTwoResponsibleData {
  cpf: string
  phone: string
  relationship: ResponsibleRelationship
  role: string
}

export type RiskTwoSignatureMethod = 'gov-br' | 'digital-certificate' | 'signed-upload' | ''

export interface RiskTwoDeclarationData {
  responsibilitiesAccepted: boolean
  informationConfirmed: boolean
  signatureMethod: RiskTwoSignatureMethod
}

export type RiskTwoDocumentId =
  | 'identification'
  | 'cnpj-registration'
  | 'responsibility-declaration'
  | 'extinguisher-invoice'
  | 'establishment-photos'

export interface RiskTwoDocument {
  id: RiskTwoDocumentId
  name: string
  description: string
  required: boolean
  status: 'pending' | 'generated' | 'uploaded'
  fileName?: string
  fileSize?: number
  fileType?: string
}

export type RiskTwoPaymentMethod = 'pix' | 'collection-document' | ''

export interface RiskTwoPaymentData {
  method: RiskTwoPaymentMethod
  amount: number
  status: 'pending' | 'confirmed'
}

export interface RiskTwoRequirementData {
  id: string
  title: string
  description: string
  deadline: string
  status: 'pending' | 'responded'
  response: string
  originStage?: Exclude<InternalWorkflowStage, 'not-started' | 'completed'>
  attachment?: Pick<RiskTwoDocument, 'fileName' | 'fileSize' | 'fileType'>
}

export interface RiskTwoInspectionData {
  required: boolean | null
  status: 'not-evaluated' | 'required' | 'scheduled' | 'approved'
  scheduledAt: string
}

export interface RiskTwoJourneyData {
  responsible: RiskTwoResponsibleData
  declaration: RiskTwoDeclarationData
  documents: RiskTwoDocument[]
  payment: RiskTwoPaymentData
  reviewConfirmed: boolean
  requirement: RiskTwoRequirementData | null
  inspection: RiskTwoInspectionData
}

export type InternalWorkflowStage =
  | 'not-started'
  | 'administrative-triage'
  | 'technical-analysis'
  | 'inspection'
  | 'completed'

export interface InternalWorkflowState {
  stage: InternalWorkflowStage
  statusLabel: string
  history: readonly HistoryEvent[]
}

export type InternalWorkflowTransition =
  | 'triage-started'
  | 'triage-requirement-issued'
  | 'triage-correction-received'
  | 'triage-approved'
  | 'analysis-started'
  | 'analysis-requirement-issued'
  | 'analysis-correction-received'
  | 'analysis-inspection-waived'
  | 'analysis-inspection-required'
  | 'inspection-scheduled'
  | 'inspection-started'
  | 'inspection-requirement-issued'
  | 'inspection-correction-received'
  | 'inspection-approved'
