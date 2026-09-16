import { type ChecklistGroup, type TriageProcess } from '../types'

export const triagerIdentity = {
  name: 'Cap. Marina Albuquerque',
  role: 'Triador',
  organization: 'CBMPE',
} as const

export const checklistGroups: readonly ChecklistGroup[] = [
  {
    id: 'company',
    title: 'Empresa',
    items: [
      { id: 'company-registration', label: 'Empresa cadastrada corretamente' },
      { id: 'valid-cnpj', label: 'CNPJ válido' },
      { id: 'consistent-company-data', label: 'Dados cadastrais consistentes' },
    ],
  },
  {
    id: 'establishment',
    title: 'Empreendimento',
    items: [
      { id: 'complete-address', label: 'Endereço completo' },
      { id: 'minimum-data', label: 'Dados mínimos preenchidos' },
      { id: 'occupation-type', label: 'Tipo de ocupação informado' },
      { id: 'built-area', label: 'Área construída informada' },
    ],
  },
  {
    id: 'technical-responsible',
    title: 'Responsável Técnico',
    items: [
      { id: 'responsible-when-required', label: 'Responsável Técnico informado quando aplicável' },
      { id: 'professional-registration', label: 'Registro profissional informado' },
      { id: 'art-rrt', label: 'ART/RRT anexada' },
    ],
  },
  {
    id: 'documentation',
    title: 'Documentação',
    items: [
      { id: 'required-documents', label: 'Todos os documentos obrigatórios enviados' },
      { id: 'legible-files', label: 'Arquivos legíveis' },
      { id: 'accepted-formats', label: 'Formatos aceitos' },
      { id: 'required-signatures', label: 'Assinaturas presentes quando obrigatórias' },
      { id: 'compatible-documents', label: 'Documentos compatíveis com o empreendimento' },
    ],
  },
  {
    id: 'process',
    title: 'Processo',
    items: [
      { id: 'no-duplicate', label: 'Não existe duplicidade' },
      { id: 'compatible-classification', label: 'Processo compatível com a classificação' },
      { id: 'ready-for-distribution', label: 'Processo apto para distribuição' },
    ],
  },
] as const

export const checklistItemIds = checklistGroups.flatMap((group) =>
  group.items.map((item) => item.id),
)

function createChecklist(unchecked: readonly string[] = []) {
  return Object.fromEntries(checklistItemIds.map((id) => [id, !unchecked.includes(id)]))
}

const commonDocuments = [
  {
    id: 'architectural-project',
    name: 'Projeto arquitetônico.pdf',
    category: 'Projeto',
    format: 'PDF' as const,
    versions: [
      {
        version: 2,
        uploadedAt: '19/07/2026 às 16:42',
        uploadedBy: 'Carlos Eduardo Lima',
        size: '8,4 MB',
        hash: '8F7A-91BC-224E-D102',
        status: 'Pendente de conferência' as const,
        note: 'Versão substitutiva com prancha de implantação atualizada.',
      },
      {
        version: 1,
        uploadedAt: '18/07/2026 às 10:17',
        uploadedBy: 'Carlos Eduardo Lima',
        size: '8,1 MB',
        hash: '4AC2-731F-114D-9B02',
        status: 'Substituído' as const,
        note: 'Versão protocolada originalmente.',
      },
    ],
  },
  {
    id: 'art',
    name: 'ART de projeto.pdf',
    category: 'Responsabilidade técnica',
    format: 'PDF' as const,
    versions: [
      {
        version: 1,
        uploadedAt: '19/07/2026 às 16:44',
        uploadedBy: 'Carlos Eduardo Lima',
        size: '612 KB',
        hash: 'BB91-5F20-A137-4C09',
        status: 'Pendente de conferência' as const,
        note: 'ART assinada digitalmente pelo Responsável Técnico.',
      },
    ],
  },
  {
    id: 'company-registration-card',
    name: 'Cartão CNPJ.pdf',
    category: 'Empresa',
    format: 'PDF' as const,
    versions: [
      {
        version: 1,
        uploadedAt: '19/07/2026 às 16:45',
        uploadedBy: 'Fernanda Bezerra',
        size: '284 KB',
        hash: 'C101-291A-77D0-31FA',
        status: 'Válido' as const,
        note: 'Comprovante de inscrição e situação cadastral.',
      },
    ],
  },
] as const

const contributorRiskTwoDocuments = [
  {
    id: 'identification',
    name: 'documento-identificacao.pdf',
    category: 'Identificação',
    format: 'PDF' as const,
    versions: [
      {
        version: 1,
        uploadedAt: '28/07/2026 às 14:24',
        uploadedBy: 'João Carlos da Silva',
        size: '1,2 MB',
        hash: '8A2F-740C-912D-44B1',
        status: 'Pendente de conferência' as const,
        note: 'Documento de identificação do responsável pela solicitação.',
      },
    ],
  },
  {
    id: 'cnpj-registration',
    name: 'comprovante-cnpj.pdf',
    category: 'Empresa',
    format: 'PDF' as const,
    versions: [
      {
        version: 1,
        uploadedAt: '28/07/2026 às 14:25',
        uploadedBy: 'João Carlos da Silva',
        size: '384 KB',
        hash: 'C18E-301B-765A-09FD',
        status: 'Pendente de conferência' as const,
        note: 'Comprovante de inscrição e situação cadastral da empresa.',
      },
    ],
  },
  {
    id: 'responsibility-declaration',
    name: 'declaracao-responsabilidade.pdf',
    category: 'Declaração',
    format: 'PDF' as const,
    versions: [
      {
        version: 1,
        uploadedAt: '28/07/2026 às 14:25',
        uploadedBy: 'SAC Nexus',
        size: '218 KB',
        hash: '66DB-442A-907E-12F0',
        status: 'Válido' as const,
        note: 'Declaração gerada a partir do aceite da etapa anterior.',
      },
    ],
  },
  {
    id: 'extinguisher-invoice',
    name: 'nota-fiscal-extintores.pdf',
    category: 'Equipamentos',
    format: 'PDF' as const,
    versions: [
      {
        version: 1,
        uploadedAt: '28/07/2026 às 14:26',
        uploadedBy: 'João Carlos da Silva',
        size: '746 KB',
        hash: '71BE-09A4-321C-88D7',
        status: 'Pendente de conferência' as const,
        note: 'Nota fiscal dos equipamentos informados na solicitação.',
      },
    ],
  },
] as const

const baseCompany = {
  legalName: 'Recife Eventos e Convenções LTDA',
  tradeName: 'Recife Expo Center',
  cnpj: '08.392.114/0001-62',
  registrationStatus: 'Ativa',
  primaryCnae: '82.30-0-01 — Serviços de organização de feiras, congressos e exposições',
  address: 'Avenida Professor Andrade Bezerra, 1250, Salgadinho, Olinda/PE, 53110-110',
  contacts: '(81) 3222-4070 · atendimento@recifeexpo.com.br',
}

const baseEstablishment = {
  name: 'Pavilhão Recife Expo Center',
  address: 'Avenida Professor Andrade Bezerra, 1250, Salgadinho, Olinda/PE, 53110-110',
  builtArea: '3.850 m²',
  floors: '2 pavimentos',
  height: '9,5 m',
  purpose: 'Centro de eventos',
  occupation: 'Local de reunião de público',
  occupationDivision: 'F-10 — Exposições de objetos ou animais',
}

const baseResponsible = {
  name: 'Carlos Eduardo Lima',
  cpf: '***.482.***-20',
  council: 'CREA-PE',
  registration: 'PE 048219/D',
  relationshipStatus: 'Vínculo confirmado',
  artRrt: 'ART PE20260718420 — anexada',
}

function history(
  processId: string,
  entries: ReadonlyArray<Omit<TriageProcess['history'][number], 'id'>>,
) {
  return entries.map((entry, index) => ({ ...entry, id: `${processId}-history-${index + 1}` }))
}

export const initialTriageProcesses: readonly TriageProcess[] = [
  {
    id: 'process-sac-2026-00001234',
    processNumber: '2026.00001234',
    protocolNumber: 'SAC-2026-00001234',
    company: {
      legalName: 'ABC Logística LTDA',
      tradeName: 'ABC Logística',
      cnpj: '12.345.678/0001-90',
      registrationStatus: 'Ativa',
      primaryCnae: '49.30-2-02 — Transporte rodoviário de carga',
      address: 'Av. Norte, 1500, Santo Amaro, Recife/PE, 50000-000',
      contacts: '(81) 99999-0000 · contribuinte@mail.com',
    },
    establishment: {
      name: 'Centro de Distribuição — Unidade Recife',
      address: 'Av. Norte, 1500, Santo Amaro, Recife/PE, 50000-000',
      builtArea: '1.250 m²',
      floors: '2 pavimentos',
      height: 'Não informada',
      purpose: 'Centro de distribuição',
      occupation: 'Depósito e logística',
      occupationDivision: 'J-4 — Depósitos com carga de incêndio média',
    },
    contributor: 'João Carlos da Silva',
    technicalResponsible: {
      name: 'Não indicado na etapa administrativa',
      cpf: 'Não se aplica',
      council: 'Não se aplica',
      registration: 'Não se aplica',
      relationshipStatus: 'Representante legal confirmado',
      artRrt: 'Não exigida para o rito apresentado',
    },
    classification: 'Regularização de estabelecimento — Risco 2',
    risk: 'Risco 2',
    processType: 'Análise inicial',
    protocolDate: '28/07/2026 às 14:32',
    status: 'Protocolado',
    priority: 'Alta',
    averageWait: '8 min',
    bre: {
      riskClassification: 'Risco 2',
      coscipVersion: 'COSCIP/PE 2025.1',
      requiredDocuments: [
        'Documento de identificação',
        'Comprovante de inscrição no CNPJ',
        'Declaração de responsabilidade',
        'Nota fiscal dos extintores',
      ],
    },
    documents: contributorRiskTwoDocuments,
    checklist: createChecklist(['legible-files', 'ready-for-distribution']),
    requirements: [],
    history: history('process-sac-2026-00001234', [
      {
        title: 'Solicitação protocolada',
        description: 'Protocolo Risco 2 concluído pelo Contribuinte.',
        date: '28/07/2026 às 14:32',
        user: 'João Carlos da Silva',
      },
      {
        title: 'Pagamento identificado',
        description: 'Pagamento de apresentação vinculado ao protocolo.',
        date: '28/07/2026 às 14:32',
        user: 'SAC Nexus',
      },
      {
        title: 'Incluído na fila de triagem',
        description: 'Documentos disponíveis para conferência administrativa.',
        date: '28/07/2026 às 14:33',
        user: 'SAC Nexus',
      },
    ]),
  },
  {
    id: 'process-2026-000247',
    processNumber: '2026.000247-1',
    protocolNumber: '2026.0720.00247',
    company: baseCompany,
    establishment: baseEstablishment,
    contributor: 'Fernanda Maria Bezerra',
    technicalResponsible: baseResponsible,
    classification: 'Projeto de Segurança Contra Incêndio e Pânico',
    risk: 'Risco 2',
    processType: 'Análise inicial',
    protocolDate: '20/07/2026 às 08:14',
    status: 'Protocolado',
    priority: 'Alta',
    averageWait: '1h 28min',
    bre: {
      riskClassification: 'Risco 2',
      coscipVersion: 'COSCIP/PE 2025.1',
      requiredDocuments: ['Projeto arquitetônico', 'ART/RRT', 'Cartão CNPJ'],
    },
    documents: commonDocuments,
    checklist: createChecklist(['legible-files', 'required-signatures', 'ready-for-distribution']),
    requirements: [],
    history: history('process-2026-000247', [
      {
        title: 'Processo protocolado',
        description: 'Protocolo definitivo realizado pelo Contribuinte.',
        date: '20/07/2026 às 08:14',
        user: 'Fernanda Maria Bezerra',
      },
      {
        title: 'Processo incluído na fila de triagem',
        description: 'Classificação Risco 2 confirmada automaticamente pelo BRE.',
        date: '20/07/2026 às 08:15',
        user: 'SAC-NEXUS',
      },
    ]),
  },
  {
    id: 'process-2026-000238',
    processNumber: '2026.000238-4',
    protocolNumber: '2026.0719.00238',
    company: {
      ...baseCompany,
      legalName: 'Mercado Boa Viagem LTDA',
      tradeName: 'Mercado Boa Viagem',
      cnpj: '31.625.780/0001-09',
    },
    establishment: {
      ...baseEstablishment,
      name: 'Mercado Boa Viagem — Unidade Setúbal',
      builtArea: '1.240 m²',
      floors: '1 pavimento',
      height: '6 m',
      purpose: 'Comércio varejista',
      occupation: 'Comercial',
      occupationDivision: 'C-2 — Comércio com média e alta carga de incêndio',
    },
    contributor: 'Rafael José da Costa',
    technicalResponsible: { ...baseResponsible, name: 'Ana Paula Mendonça' },
    classification: 'Projeto de Segurança Contra Incêndio e Pânico',
    risk: 'Risco 2',
    processType: 'Nova triagem',
    protocolDate: '19/07/2026 às 14:26',
    status: 'Correções Recebidas',
    priority: 'Alta',
    averageWait: '18h 16min',
    bre: {
      riskClassification: 'Risco 2',
      coscipVersion: 'COSCIP/PE 2025.1',
      requiredDocuments: ['Projeto arquitetônico', 'ART/RRT', 'Cartão CNPJ'],
    },
    documents: commonDocuments,
    checklist: createChecklist(['no-duplicate', 'ready-for-distribution']),
    requirements: [
      {
        id: 'requirement-2026-041',
        title: 'Substituir ART sem assinatura',
        description: 'A ART anexada não apresenta assinatura do Responsável Técnico.',
        relatedDocument: 'ART de projeto.pdf',
        category: 'Responsabilidade técnica',
        deadline: '24/07/2026',
        observations: 'Enviar o documento assinado, sem alteração do objeto registrado.',
        status: 'Atendida',
        date: '19/07/2026 às 16:20',
        responsibleUser: triagerIdentity.name,
      },
    ],
    history: history('process-2026-000238', [
      {
        title: 'Processo protocolado',
        description: 'Protocolo definitivo realizado pelo Contribuinte.',
        date: '19/07/2026 às 14:26',
        user: 'Rafael José da Costa',
      },
      {
        title: 'Exigência administrativa emitida',
        description: 'Foi solicitada a substituição da ART sem assinatura.',
        date: '19/07/2026 às 16:20',
        user: triagerIdentity.name,
      },
      {
        title: 'Correções recebidas',
        description: 'O Contribuinte enviou nova versão do documento relacionado.',
        date: '20/07/2026 às 07:52',
        user: 'Rafael José da Costa',
      },
    ]),
    duplicateWarning:
      'Foi localizado o processo 2025.001902-8 para o mesmo CNPJ e endereço. Confirme se o objeto é diferente antes de concluir.',
  },
  {
    id: 'process-2026-000221',
    processNumber: '2026.000221-0',
    protocolNumber: '2026.0718.00221',
    company: { ...baseCompany, legalName: 'Clínica Santa Luzia S/A', cnpj: '05.714.981/0001-33' },
    establishment: {
      ...baseEstablishment,
      name: 'Clínica Santa Luzia',
      builtArea: '2.180 m²',
      purpose: 'Serviço de saúde',
      occupation: 'Serviço profissional e saúde',
      occupationDivision: 'H-3 — Hospital e assemelhado',
    },
    contributor: 'Luciana Ramos de Oliveira',
    technicalResponsible: { ...baseResponsible, name: 'Paulo Sérgio Nunes' },
    classification: 'Projeto de Segurança Contra Incêndio e Pânico',
    risk: 'Risco 2',
    processType: 'Análise inicial',
    protocolDate: '18/07/2026 às 15:03',
    status: 'Em Triagem',
    priority: 'Normal',
    averageWait: '2 dias',
    bre: {
      riskClassification: 'Risco 2',
      coscipVersion: 'COSCIP/PE 2025.1',
      requiredDocuments: ['Projeto arquitetônico', 'ART/RRT', 'Cartão CNPJ'],
    },
    documents: commonDocuments,
    checklist: createChecklist(['required-documents', 'ready-for-distribution']),
    requirements: [],
    history: history('process-2026-000221', [
      {
        title: 'Processo protocolado',
        description: 'Protocolo definitivo realizado pelo Contribuinte.',
        date: '18/07/2026 às 15:03',
        user: 'Luciana Ramos de Oliveira',
      },
      {
        title: 'Triagem iniciada',
        description: 'Conferência administrativa iniciada.',
        date: '20/07/2026 às 08:31',
        user: triagerIdentity.name,
      },
    ]),
  },
  {
    id: 'process-2026-000199',
    processNumber: '2026.000199-5',
    protocolNumber: '2026.0717.00199',
    company: { ...baseCompany, legalName: 'Hotel Marco Zero LTDA', cnpj: '44.209.118/0001-76' },
    establishment: {
      ...baseEstablishment,
      name: 'Hotel Marco Zero',
      builtArea: '4.920 m²',
      purpose: 'Hospedagem',
      occupation: 'Serviço de hospedagem',
      occupationDivision: 'B-1 — Hotel e assemelhado',
    },
    contributor: 'Eduardo Vieira de Melo',
    technicalResponsible: { ...baseResponsible, name: 'Camila Torres Rocha' },
    classification: 'Projeto de Segurança Contra Incêndio e Pânico',
    risk: 'Risco 2',
    processType: 'Análise inicial',
    protocolDate: '17/07/2026 às 11:38',
    status: 'Encaminhado para Distribuição',
    priority: 'Baixa',
    averageWait: '1 dia 4h',
    bre: {
      riskClassification: 'Risco 2',
      coscipVersion: 'COSCIP/PE 2025.1',
      requiredDocuments: ['Projeto arquitetônico', 'ART/RRT', 'Cartão CNPJ'],
    },
    documents: commonDocuments,
    checklist: createChecklist(),
    requirements: [],
    history: history('process-2026-000199', [
      {
        title: 'Processo protocolado',
        description: 'Protocolo definitivo realizado pelo Contribuinte.',
        date: '17/07/2026 às 11:38',
        user: 'Eduardo Vieira de Melo',
      },
      {
        title: 'Triagem concluída',
        description: 'Checklist administrativo concluído sem pendências.',
        date: '18/07/2026 às 16:02',
        user: triagerIdentity.name,
      },
      {
        title: 'Encaminhado para distribuição',
        description: 'Processo disponibilizado para distribuição a um Analista Técnico.',
        date: '18/07/2026 às 16:03',
        user: 'SAC-NEXUS',
      },
    ]),
  },
]

export function getChecklistProgress(process: TriageProcess) {
  const completed = checklistItemIds.filter((id) => process.checklist[id]).length
  return { completed, total: checklistItemIds.length }
}

export function isChecklistComplete(process: TriageProcess) {
  const progress = getChecklistProgress(process)
  return progress.completed === progress.total
}

export function isProcessInActiveQueue(process: TriageProcess) {
  return ['Protocolado', 'Em Triagem', 'Correções Recebidas', 'Em Nova Triagem'].includes(
    process.status,
  )
}
