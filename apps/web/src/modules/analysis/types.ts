export type TechnicalAnalysisStatus =
  | 'Aguardando análise'
  | 'Em análise'
  | 'Aguardando correção'
  | 'Análise concluída'

export type InspectionDecision = 'required' | 'waived'

export interface AnalysisDocument {
  id: string
  name: string
  category: string
  status: 'Pendente' | 'Conforme' | 'Com exigência'
}

export interface AnalysisHistoryEntry {
  id: string
  title: string
  description: string
  date: string
  user: string
}

export interface TechnicalAnalysisProcess {
  id: string
  processNumber: string
  protocolNumber: string
  companyName: string
  companyCnpj: string
  establishmentName: string
  establishmentAddress: string
  occupation: string
  builtArea: string
  floors: string
  risk: 'Risco 2'
  status: TechnicalAnalysisStatus
  assignedTo: string | null
  documents: AnalysisDocument[]
  checklist: Record<string, boolean>
  technicalNotes: string
  inspectionDecision: InspectionDecision | null
  inspectionReason: string
  history: AnalysisHistoryEntry[]
}
