export type InspectionStatus =
  | 'Aguardando agendamento'
  | 'Agendada'
  | 'Em vistoria'
  | 'Aguardando correção'
  | 'Aprovada'

export interface InspectionProcess {
  id: string
  processNumber: string
  protocolNumber: string
  companyName: string
  establishmentName: string
  address: string
  risk: 'Risco 2'
  reason: string
  status: InspectionStatus
  scheduledAt: string | null
  assignedTo: string | null
  checklist: Record<string, boolean>
  notes: string
  certificateNumber: string | null
  history: Array<{
    id: string
    title: string
    description: string
    date: string
    user: string
  }>
}
