import { type InspectionProcess } from '../types'

export const inspectorIdentity = {
  name: 'Ten. Renata Melo',
  email: 'vistoriador@email.com',
  role: 'Vistoriador',
} as const

export const inspectionChecklistItems = [
  { id: 'access', label: 'Acesso e circulação desobstruídos' },
  { id: 'extinguishers', label: 'Extintores instalados, sinalizados e dentro da validade' },
  { id: 'emergency-exits', label: 'Saídas de emergência dimensionadas e sinalizadas' },
  { id: 'electrical-installation', label: 'Instalações elétricas sem irregularidades aparentes' },
  { id: 'declared-conditions', label: 'Condições encontradas compatíveis com os dados declarados' },
] as const

export const initialInspectionProcesses: readonly InspectionProcess[] = [
  {
    id: 'process-sac-2026-00001234',
    processNumber: '2026.00001234',
    protocolNumber: 'SAC-2026-00001234',
    companyName: 'ABC Logística LTDA',
    establishmentName: 'Centro de Distribuição — Unidade Recife',
    address: 'Av. Norte, 1500, Santo Amaro, Recife/PE, 50000-000',
    risk: 'Risco 2',
    reason: 'A carga de incêndio e a área utilizada exigem verificação presencial.',
    status: 'Aguardando agendamento',
    scheduledAt: null,
    assignedTo: null,
    checklist: Object.fromEntries(inspectionChecklistItems.map((item) => [item.id, false])),
    notes: '',
    certificateNumber: null,
    history: [
      {
        id: 'inspection-history-1',
        title: 'Análise técnica concluída',
        description: 'A necessidade de vistoria prévia foi fundamentada pelo Triador.',
        date: '28/07/2026 às 15:28',
        user: 'Sgt. Júlio Prates',
      },
      {
        id: 'inspection-history-2',
        title: 'Encaminhado para vistoria',
        description: 'Processo incluído na fila de agendamento.',
        date: '28/07/2026 às 15:29',
        user: 'SAC Nexus',
      },
    ],
  },
] as const

export function isInspectionChecklistComplete(process: InspectionProcess) {
  return inspectionChecklistItems.every((item) => process.checklist[item.id])
}
