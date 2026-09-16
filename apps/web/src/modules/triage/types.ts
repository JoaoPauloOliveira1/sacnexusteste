export type TriagePriority = 'Alta' | 'Normal' | 'Baixa'

export type TriageStatus =
  | 'Protocolado'
  | 'Em Triagem'
  | 'Triagem Concluída'
  | 'Aguardando Correções'
  | 'Correções Recebidas'
  | 'Em Nova Triagem'
  | 'Encaminhado para Distribuição'

export interface TriageCompany {
  legalName: string
  tradeName: string
  cnpj: string
  registrationStatus: string
  primaryCnae: string
  address: string
  contacts: string
}

export interface TriageEstablishment {
  name: string
  address: string
  builtArea: string
  floors: string
  height: string
  purpose: string
  occupation: string
  occupationDivision: string
}

export interface TriageTechnicalResponsible {
  name: string
  cpf: string
  council: string
  registration: string
  relationshipStatus: string
  artRrt: string
}

export interface TriageBreSummary {
  riskClassification: string
  coscipVersion: string
  requiredDocuments: readonly string[]
}

export interface TriageDocumentVersion {
  version: number
  uploadedAt: string
  uploadedBy: string
  size: string
  hash: string
  status: 'Válido' | 'Pendente de conferência' | 'Substituído' | 'Com inconsistência'
  note: string
}

export interface TriageDocument {
  id: string
  name: string
  category: string
  format: 'PDF' | 'JPG' | 'PNG'
  versions: readonly [TriageDocumentVersion, ...TriageDocumentVersion[]]
}

export interface TriageHistoryEntry {
  id: string
  title: string
  description: string
  date: string
  user: string
}

export interface AdministrativeRequirement {
  id: string
  title: string
  description: string
  relatedDocument: string
  category: string
  deadline: string
  observations: string
  status: 'Aberta' | 'Atendida'
  date: string
  responsibleUser: string
}

export interface TriageProcess {
  id: string
  processNumber: string
  protocolNumber: string
  company: TriageCompany
  establishment: TriageEstablishment
  contributor: string
  technicalResponsible: TriageTechnicalResponsible
  classification: string
  risk: string
  processType: string
  protocolDate: string
  status: TriageStatus
  priority: TriagePriority
  averageWait: string
  bre: TriageBreSummary
  documents: readonly TriageDocument[]
  checklist: Record<string, boolean>
  requirements: readonly AdministrativeRequirement[]
  history: readonly TriageHistoryEntry[]
  duplicateWarning?: string
}

export interface ChecklistItem {
  id: string
  label: string
}

export interface ChecklistGroup {
  id: string
  title: string
  items: readonly ChecklistItem[]
}

export interface RequirementDraft {
  title: string
  description: string
  relatedDocument: string
  category: string
  deadline: string
  observations: string
}
