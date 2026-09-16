import { demoCompany } from '@/modules/companies'
import {
  type BreGroup,
  type ClassificationAnswers,
  type CompletedProcess,
  type ContributorActor,
  type EstablishmentData,
  type HistoryEvent,
  type IssuedDocument,
  type IssuedDocumentMatch,
  type ProcessData,
  type RiskClassification,
  type RiskTwoJourneyData,
} from '../types'

export const demoContributorActor: ContributorActor = {
  userId: 'user-contributor-001',
  profileId: 'profile-contributor-001',
  profileType: 'contributor',
  profileLabel: 'Contribuinte',
  name: 'João Carlos da Silva',
  email: 'contribuinte@mail.com',
  companyIds: ['company-abc-logistica'],
}

export { demoCompany }

export const demoEstablishment: EstablishmentData = {
  name: 'ABC Logística LTDA',
  type: 'Empresa',
  purpose: 'Logística',
  cep: '50000-000',
  address: 'Av. Norte',
  number: '1500',
  complement: '',
  neighborhood: 'Santo Amaro',
  city: 'Recife',
  state: 'PE',
  builtArea: '450',
  floors: '1',
  constructionYear: '2018',
  basement: 'Não',
  flammables: 'Não',
  glp: 'Não',
  publicPresence: 'Não',
  industrialActivity: 'Não',
  riskArea: 'Não',
  location: {
    latitude: -8.05784,
    longitude: -34.88508,
    source: 'geocoded',
    addressFingerprint: '50000 000|av norte 1500|santo amaro|recife pe',
    confirmedAt: '2026-07-25T14:30:00.000Z',
  },
}

export const emptyEstablishment: EstablishmentData = {
  name: '',
  type: '',
  purpose: '',
  cep: '',
  address: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: 'PE',
  builtArea: '',
  floors: '',
  constructionYear: '',
  basement: '',
  flammables: '',
  glp: '',
  publicPresence: '',
  industrialActivity: '',
  riskArea: '',
  location: null,
}

export const classificationQuestions = [
  {
    id: 'flammables',
    label: 'A atividade possui armazenamento de líquidos inflamáveis?',
  },
  {
    id: 'areaAboveLimit',
    label: 'A edificação possui área construída superior a 750 m²?',
  },
  {
    id: 'floorsAboveLimit',
    label: 'O empreendimento possui mais de 3 pavimentos?',
  },
] as const

export const breGroups: readonly BreGroup[] = [
  {
    id: 'classification',
    title: 'Questionário de enquadramento',
    description: 'Responda às perguntas sobre a atividade e o imóvel.',
    questions: classificationQuestions.map((question) => ({
      ...question,
      type: 'choice' as const,
      options: ['Sim', 'Não'] as const,
    })),
  },
]

export const initialBreAnswers: ClassificationAnswers = {
  flammables: '',
  areaAboveLimit: '',
  floorsAboveLimit: '',
}

export function createInitialRiskTwoJourney(): RiskTwoJourneyData {
  return {
    responsible: {
      cpf: '',
      phone: '',
      relationship: '',
      role: '',
    },
    declaration: {
      responsibilitiesAccepted: false,
      informationConfirmed: false,
      signatureMethod: '',
    },
    documents: [
      {
        id: 'identification',
        name: 'Documento de identificação',
        description: 'RG ou CNH do responsável pela solicitação.',
        required: true,
        status: 'pending',
      },
      {
        id: 'cnpj-registration',
        name: 'Comprovante de inscrição no CNPJ',
        description: 'Comprovante atualizado da empresa.',
        required: true,
        status: 'pending',
      },
      {
        id: 'responsibility-declaration',
        name: 'Declaração de responsabilidade',
        description: 'Declaração aceita e assinada na etapa anterior.',
        required: true,
        status: 'pending',
      },
      {
        id: 'extinguisher-invoice',
        name: 'Nota fiscal dos extintores',
        description: 'Documento válido dos equipamentos instalados.',
        required: true,
        status: 'pending',
      },
      {
        id: 'establishment-photos',
        name: 'Fotografias do estabelecimento',
        description: 'Fachada e áreas internas relevantes.',
        required: false,
        status: 'pending',
      },
    ],
    payment: {
      method: '',
      amount: 286.4,
      status: 'pending',
    },
    reviewConfirmed: false,
    requirement: null,
    inspection: {
      required: null,
      status: 'not-evaluated',
      scheduledAt: '',
    },
  }
}

export function getRiskClassification(answers: ClassificationAnswers): RiskClassification | null {
  if (Object.values(answers).some((answer) => answer === '')) {
    return null
  }

  return Object.values(answers).every((answer) => answer === 'Não') ? 'risk-1' : 'risk-2'
}

export const demoProcess: ProcessData = {
  id: 'process-2026-00001234',
  processNumber: '2026.00001234',
  protocolNumber: '2026.00001234',
  documentNumber: 'DDLCB nº 2026.00001234',
  openedAt: '25/07/2026 às 14:28',
  completedAt: '25/07/2026 às 14:32',
  issuedAt: '25/07/2026',
  validUntil: '25/07/2027',
  coscipVersion: 'COSCIP/PE',
  validationHash: 'SAC-NEXUS-2026-00001234',
}

export function createDemoProcess(sequence: number): ProcessData {
  const numericSuffix = 1234 + sequence
  const processNumber = `2026.${String(numericSuffix).padStart(8, '0')}`

  return {
    ...demoProcess,
    id: `process-${processNumber.replace('.', '-')}`,
    processNumber,
    protocolNumber: processNumber,
    documentNumber: `DDLCB nº ${processNumber}`,
    validationHash: `SAC-NEXUS-${processNumber.replace('.', '-')}`,
  }
}

export function createIssuedDocuments(
  process: ProcessData,
  classification: RiskClassification,
): readonly IssuedDocument[] {
  const number = process.processNumber

  if (classification === 'risk-1') {
    return [
      {
        kind: 'ddlcb',
        label: 'Declaração de Dispensa de Licenciamento do Corpo de Bombeiros',
        shortLabel: 'DDLCB',
        number: `DDLCB nº ${number}`,
        issuedAt: process.issuedAt,
        validUntil: 'Validade indeterminada',
        validationHash: `${process.validationHash}-DDLCB`,
      },
    ]
  }

  return [
    {
      kind: 'avcb',
      label: 'Auto de Vistoria do Corpo de Bombeiros',
      shortLabel: 'AVCB',
      number: `AVCB nº ${number}`,
      issuedAt: process.issuedAt,
      validUntil: process.validUntil,
      validationHash: `${process.validationHash}-AVCB`,
    },
    {
      kind: 'inspection-attestation',
      label: 'Atestado de Vistoria',
      shortLabel: 'Atestado de Vistoria',
      number: `Atestado nº ${number}`,
      issuedAt: process.issuedAt,
      validUntil: process.validUntil,
      validationHash: `${process.validationHash}-ATESTADO`,
    },
  ]
}

export function findIssuedDocument(
  records: readonly CompletedProcess[],
  value: string,
): IssuedDocumentMatch | null {
  const query = value.trim().toLocaleLowerCase('pt-BR')
  if (!query) {
    return null
  }

  for (const record of records) {
    const classification = record.classification ?? 'risk-1'
    const documents = record.issuedDocuments?.length
      ? record.issuedDocuments
      : createIssuedDocuments(record.process, classification)
    const document = documents.find(
      (candidate) =>
        candidate.number.toLocaleLowerCase('pt-BR') === query ||
        candidate.validationHash.toLocaleLowerCase('pt-BR') === query,
    )

    if (document) {
      return { record, document }
    }

    if (
      record.process.processNumber.toLocaleLowerCase('pt-BR') === query ||
      record.process.protocolNumber.toLocaleLowerCase('pt-BR') === query
    ) {
      const firstDocument = documents[0]
      return firstDocument ? { record, document: firstDocument } : null
    }
  }

  return null
}

export const historyEvents: readonly HistoryEvent[] = [
  {
    title: 'Solicitação criada',
    date: '25/07/2026',
    time: '14:28',
    user: 'João Carlos da Silva',
    source: 'Portal do Contribuinte',
    description: 'A solicitação de regularização foi criada.',
  },
  {
    title: 'Risco 1 confirmado',
    date: '25/07/2026',
    time: '14:30',
    user: 'SAC Nexus',
    source: 'Processamento automático',
    description: 'O enquadramento automático confirmou a classificação Risco 1.',
  },
  {
    title: 'DDLCB emitida automaticamente',
    date: '25/07/2026',
    time: '14:32',
    user: 'SAC Nexus',
    source: 'Processamento automático',
    description: 'A dispensa de licenciamento foi emitida sem análise técnica ou vistoria.',
  },
]

export const riskTwoHistoryEvents: readonly HistoryEvent[] = [
  {
    title: 'Solicitação protocolada',
    date: '29/07/2026',
    time: '14:32',
    user: 'João Carlos da Silva',
    source: 'Portal do Contribuinte',
    description: 'A solicitação Risco 2 foi protocolada para análise.',
  },
  {
    title: 'Exigência documental atendida',
    date: '29/07/2026',
    time: '14:48',
    user: 'João Carlos da Silva',
    source: 'Portal do Contribuinte',
    description: 'O contribuinte respondeu à exigência emitida durante a análise documental.',
  },
  {
    title: 'Análise concluída',
    date: '29/07/2026',
    time: '15:10',
    user: 'SAC Nexus',
    source: 'Processamento de demonstração',
    description: 'Os dados e documentos foram aprovados.',
  },
  {
    title: 'Documentos de Risco 2 emitidos',
    date: '29/07/2026',
    time: '15:12',
    user: 'SAC Nexus',
    source: 'Processamento de demonstração',
    description: 'O AVCB e o Atestado de Vistoria foram emitidos após a conclusão do rito.',
  },
]

export function getQuestionLabel(questionId: string) {
  return classificationQuestions.find((question) => question.id === questionId)?.label ?? questionId
}
