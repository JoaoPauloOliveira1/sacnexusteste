import { type TechnicalAnalysisProcess } from '../types'

export const analystIdentity = {
  name: 'Sgt. Júlio Prates',
  email: 'analista@email.com',
  role: 'Analista técnico',
} as const

export const technicalChecklistItems = [
  {
    id: 'occupation-compatible',
    label: 'Ocupação e atividade compatíveis com o enquadramento informado',
  },
  {
    id: 'area-compatible',
    label: 'Área, pavimentos e características físicas conferidos',
  },
  {
    id: 'fire-load-compatible',
    label: 'Carga de incêndio e materiais especiais avaliados',
  },
  {
    id: 'documents-compatible',
    label: 'Documentos técnicos consistentes com o estabelecimento',
  },
] as const

export const initialAnalysisProcesses: readonly TechnicalAnalysisProcess[] = [
  {
    id: 'process-sac-2026-00001234',
    processNumber: '2026.00001234',
    protocolNumber: 'SAC-2026-00001234',
    companyName: 'ABC Logística LTDA',
    companyCnpj: '12.345.678/0001-90',
    establishmentName: 'Centro de Distribuição — Unidade Recife',
    establishmentAddress: 'Av. Norte, 1500, Santo Amaro, Recife/PE, 50000-000',
    occupation: 'J-4 — Depósitos com carga de incêndio média',
    builtArea: '1.250 m²',
    floors: '2 pavimentos',
    risk: 'Risco 2',
    status: 'Aguardando análise',
    assignedTo: null,
    documents: [
      {
        id: 'identification',
        name: 'documento-identificacao.pdf',
        category: 'Identificação',
        status: 'Conforme',
      },
      {
        id: 'cnpj-registration',
        name: 'comprovante-cnpj.pdf',
        category: 'Empresa',
        status: 'Conforme',
      },
      {
        id: 'responsibility-declaration',
        name: 'declaracao-responsabilidade.pdf',
        category: 'Declaração',
        status: 'Pendente',
      },
      {
        id: 'extinguisher-invoice',
        name: 'nota-fiscal-extintores.pdf',
        category: 'Equipamentos',
        status: 'Pendente',
      },
    ],
    checklist: Object.fromEntries(technicalChecklistItems.map((item) => [item.id, false])),
    technicalNotes: '',
    inspectionDecision: null,
    inspectionReason: '',
    history: [
      {
        id: 'analysis-history-1',
        title: 'Triagem administrativa concluída',
        description: 'Dados e documentos obrigatórios conferidos.',
        date: '28/07/2026 às 15:02',
        user: 'Cap. Marina Albuquerque',
      },
      {
        id: 'analysis-history-2',
        title: 'Processo distribuído',
        description: 'Processo incluído na fila de análise técnica.',
        date: '28/07/2026 às 15:04',
        user: 'SAC Nexus',
      },
    ],
  },
] as const

export function isTechnicalChecklistComplete(process: TechnicalAnalysisProcess) {
  return technicalChecklistItems.every((item) => process.checklist[item.id])
}
