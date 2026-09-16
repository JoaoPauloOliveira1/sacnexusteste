import { type jsPDF } from 'jspdf'
import { toast } from 'sonner'

import { type Company } from '@/modules/companies'
import {
  type EstablishmentData,
  type IssuedDocument,
  type ProcessData,
  type RiskClassification,
} from '../types'
import { avcbDocumentTheme as theme } from './avcb-document-theme'
import { createIssuedDocuments } from './process-data'

interface IssuedDocumentInput {
  company: Company
  establishment: EstablishmentData
  process: ProcessData
  classification?: RiskClassification
  issuedDocument?: IssuedDocument
}

export async function downloadIssuedDocument(input: IssuedDocumentInput) {
  const classification = input.classification ?? 'risk-1'
  const issuedDocument =
    input.issuedDocument ?? createIssuedDocuments(input.process, classification)[0]
  if (!issuedDocument) {
    return
  }
  const documentProcess: ProcessData = {
    ...input.process,
    documentNumber: issuedDocument.number,
    issuedAt: issuedDocument.issuedAt,
    validUntil: issuedDocument.validUntil,
    validationHash: issuedDocument.validationHash,
  }
  const resolvedInput = { ...input, classification, issuedDocument, process: documentProcess }
  const [{ jsPDF }, { default: QRCode }] = await Promise.all([import('jspdf'), import('qrcode')])
  const pdf = new jsPDF({ format: 'a4', orientation: 'portrait', unit: 'mm' })
  const validationUrl = new URL(
    `/public-consultation?document=${encodeURIComponent(issuedDocument.number)}`,
    window.location.origin,
  ).toString()
  const qrCode = await QRCode.toDataURL(validationUrl, {
    color: { dark: '#143153', light: '#ffffff' },
    margin: 1,
    width: 320,
  })

  drawDocumentFrame(pdf)
  drawInstitutionalHeader(pdf, documentProcess)
  drawDocumentBody(pdf, resolvedInput)
  drawValidationBlock(pdf, documentProcess, validationUrl, qrCode)
  drawDocumentFooter(pdf, documentProcess)

  pdf.save(`${input.process.processNumber}-${issuedDocument.kind}.pdf`)
  toast.success(`Download de ${issuedDocument.shortLabel} iniciado.`)
}

function drawDocumentFrame(pdf: jsPDF) {
  const { colors, page } = theme

  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, page.width, page.height, 'F')

  pdf.setFillColor(...colors.red)
  pdf.rect(0, 0, 70, 4, 'F')
  pdf.setFillColor(...colors.yellow)
  pdf.rect(70, 0, 70, 4, 'F')
  pdf.setFillColor(...colors.blue)
  pdf.rect(140, 0, 70, 4, 'F')

  pdf.setDrawColor(...colors.navy)
  pdf.setLineWidth(0.55)
  pdf.rect(8, 9, page.width - 16, page.height - 18)
  pdf.setDrawColor(...colors.border)
  pdf.setLineWidth(0.2)
  pdf.rect(10.5, 11.5, page.width - 21, page.height - 23)

  pdf.setTextColor(...colors.watermark)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(29)
  pdf.text('DOCUMENTO DE DEMONSTRAÇÃO', 105, 176, {
    align: 'center',
    angle: 45,
  })
}

function drawInstitutionalHeader(pdf: jsPDF, process: ProcessData) {
  const { colors, page } = theme
  const centerX = page.width / 2

  pdf.setFillColor(...colors.navy)
  pdf.circle(26, 25, 9, 'F')
  pdf.setDrawColor(...colors.yellow)
  pdf.setLineWidth(0.7)
  pdf.circle(26, 25, 7.2, 'S')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('PE', 26, 23.8, { align: 'center' })
  pdf.setFontSize(5.5)
  pdf.text('CBMPE', 26, 27.3, { align: 'center' })

  pdf.setTextColor(...colors.navy)
  pdf.setFontSize(9)
  pdf.text('ESTADO DE PERNAMBUCO', centerX, 18, { align: 'center' })
  pdf.setFontSize(8)
  pdf.text('SECRETARIA DE DEFESA SOCIAL', centerX, 22.5, { align: 'center' })
  pdf.setFontSize(10.5)
  pdf.text('CORPO DE BOMBEIROS MILITAR DE PERNAMBUCO', centerX, 28, {
    align: 'center',
  })
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(...colors.muted)
  pdf.text('Sistema de Atendimento ao Contribuinte — SAC Nexus', centerX, 32.5, {
    align: 'center',
  })

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(6.5)
  pdf.setTextColor(...colors.navy)
  pdf.text(`PROCESSO ${process.processNumber}`, 194, 18, { align: 'right' })
  pdf.text('EMISSÃO ELETRÔNICA', 194, 22, { align: 'right' })

  pdf.setDrawColor(...colors.navy)
  pdf.setLineWidth(0.35)
  pdf.line(16, 38, 194, 38)
}

function drawDocumentBody(
  pdf: jsPDF,
  {
    company,
    establishment,
    process,
    classification = 'risk-1',
    issuedDocument,
  }: IssuedDocumentInput,
) {
  const { colors } = theme
  const isRiskTwo = classification === 'risk-2'
  const documentKind = issuedDocument?.kind ?? (isRiskTwo ? 'avcb' : 'ddlcb')
  const documentTitle =
    documentKind === 'ddlcb'
      ? 'DECLARAÇÃO DE DISPENSA DE LICENCIAMENTO'
      : documentKind === 'inspection-attestation'
        ? 'ATESTADO DE VISTORIA'
        : 'AUTO DE VISTORIA DO CORPO DE BOMBEIROS'
  const documentSubtitle =
    documentKind === 'ddlcb'
      ? 'DDLCB — CLASSIFICAÇÃO RISCO 1'
      : `${issuedDocument?.shortLabel ?? 'AVCB'} — CLASSIFICAÇÃO RISCO 2`

  pdf.setTextColor(...colors.navy)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(14)
  pdf.text(documentTitle, 105, 48, {
    align: 'center',
  })
  pdf.setFontSize(10)
  pdf.text(documentSubtitle, 105, 54, {
    align: 'center',
  })

  pdf.setFillColor(...colors.successSurface)
  pdf.roundedRect(67, 59, 76, 8, 2, 2, 'F')
  pdf.setTextColor(...colors.success)
  pdf.setFontSize(8)
  pdf.text(isRiskTwo ? 'RITO ANALISADO  •  VÁLIDO' : 'EMISSÃO AUTOMÁTICA  •  VÁLIDO', 105, 64.2, {
    align: 'center',
  })

  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...colors.ink)
  pdf.setFontSize(8)
  const statement = pdf.splitTextToSize(
    documentKind !== 'ddlcb'
      ? 'Atesta-se, para fins desta apresentação, que o estabelecimento identificado neste documento concluiu o rito de Risco 2 após a validação dos dados e documentos apresentados.'
      : 'Declara-se, para fins desta apresentação, que a atividade econômica informada foi enquadrada como Risco 1 e está dispensada do licenciamento do Corpo de Bombeiros, conforme as declarações do responsável.',
    164,
  )
  pdf.text(statement, 23, 75)

  drawSectionTitle(pdf, '1. IDENTIFICAÇÃO DO TITULAR', 88)
  drawField(pdf, 'Razão social', company.legalName, 23, 96, 80)
  drawField(pdf, 'CNPJ', company.cnpj, 111, 96, 76)
  drawField(pdf, 'Nome fantasia', company.tradeName, 23, 108, 80)
  drawField(pdf, 'Responsável', company.processOwner, 111, 108, 76)

  drawSectionTitle(pdf, '2. IDENTIFICAÇÃO DO ESTABELECIMENTO', 122)
  drawField(pdf, 'Endereço', formatAddress(establishment), 23, 130, 164)
  drawField(
    pdf,
    'Características',
    `${establishment.builtArea} m² de área construída • ${establishment.floors} ${
      establishment.floors === '1' ? 'pavimento' : 'pavimentos'
    }`,
    23,
    142,
    164,
  )

  drawSectionTitle(pdf, '3. ENQUADRAMENTO E VALIDADE', 156)
  drawField(
    pdf,
    'Classificação',
    isRiskTwo ? 'Risco 2 — rito sujeito a análise' : 'Risco 1 — dispensa de licenciamento',
    23,
    164,
    80,
  )
  drawField(pdf, 'Documento', process.documentNumber, 111, 164, 76)
  drawField(pdf, 'Data de emissão', process.issuedAt, 23, 176, 80)
  drawField(pdf, 'Válido até', process.validUntil, 111, 176, 76)
  drawField(pdf, 'Referência normativa', process.coscipVersion, 23, 188, 80)
  drawField(pdf, 'Protocolo', process.protocolNumber, 111, 188, 76)

  pdf.setFillColor(...colors.surface)
  pdf.setDrawColor(...colors.border)
  pdf.roundedRect(16, 199, 178, 18, 1.5, 1.5, 'FD')
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...colors.navy)
  pdf.setFontSize(7.5)
  pdf.text('CONDIÇÕES DA EMISSÃO', 21, 205)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...colors.muted)
  pdf.setFontSize(7)
  const conditions = pdf.splitTextToSize(
    isRiskTwo
      ? 'Emissão de demonstração posterior à validação documental e à conclusão do rito aplicável. A autenticidade deve ser conferida pelo código de validação.'
      : 'Emissão automática baseada nas declarações prestadas, sem pagamento, análise técnica ou vistoria nesta simulação. A autenticidade deve ser conferida pelo código de validação.',
    166,
  )
  pdf.text(conditions, 21, 210)
}

function drawSectionTitle(pdf: jsPDF, title: string, y: number) {
  const { colors } = theme

  pdf.setFillColor(...colors.navy)
  pdf.rect(16, y - 5.5, 3, 6.5, 'F')
  pdf.setTextColor(...colors.navy)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text(title, 23, y)
  pdf.setDrawColor(...colors.border)
  pdf.setLineWidth(0.2)
  pdf.line(23, y + 2.3, 194, y + 2.3)
}

function drawField(pdf: jsPDF, label: string, value: string, x: number, y: number, width: number) {
  const { colors } = theme

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(6.5)
  pdf.setTextColor(...colors.muted)
  pdf.text(label.toUpperCase(), x, y)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(...colors.ink)
  pdf.text(pdf.splitTextToSize(value || 'Não informado', width), x, y + 4.5)
}

function drawValidationBlock(
  pdf: jsPDF,
  process: ProcessData,
  validationUrl: string,
  qrCode: string,
) {
  const { colors } = theme

  pdf.addImage(qrCode, 'PNG', 21, 224, 30, 30, undefined, 'FAST')
  pdf.setTextColor(...colors.navy)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.text('VALIDAÇÃO DO DOCUMENTO', 58, 228)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(...colors.muted)
  pdf.text('Escaneie o QR Code ou confira o endereço e o hash abaixo.', 58, 233)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(6.5)
  pdf.setTextColor(...colors.ink)
  pdf.text(pdf.splitTextToSize(validationUrl, 128), 58, 239)
  pdf.setFontSize(6)
  pdf.text(pdf.splitTextToSize(process.validationHash, 128), 58, 249)
}

function drawDocumentFooter(pdf: jsPDF, process: ProcessData) {
  const { colors } = theme

  pdf.setDrawColor(...colors.navy)
  pdf.setLineWidth(0.3)
  pdf.line(16, 264, 194, 264)
  pdf.setTextColor(...colors.navy)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(7)
  pdf.text('DOCUMENTO GERADO ELETRONICAMENTE', 105, 269, { align: 'center' })
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...colors.muted)
  pdf.setFontSize(6.3)
  pdf.text(
    `Emitido em ${process.completedAt}. Esta versão pertence ao ambiente de demonstração do SAC Nexus.`,
    105,
    274,
    { align: 'center' },
  )
  pdf.setFontSize(5.8)
  pdf.text(
    'Não substitui documento oficial emitido pelos sistemas autorizados do Estado de Pernambuco.',
    105,
    278,
    { align: 'center' },
  )
  pdf.text('Página 1 de 1', 194, 283, { align: 'right' })
}

function formatAddress(establishment: EstablishmentData) {
  const locality = [establishment.neighborhood, establishment.city, establishment.state]
    .filter(Boolean)
    .join(' — ')
  const street = [establishment.address, establishment.number].filter(Boolean).join(', ')
  return [street, locality, establishment.cep ? `CEP ${establishment.cep}` : '']
    .filter(Boolean)
    .join(' • ')
}

export async function copyDocumentLink(process: ProcessData) {
  const url = new URL(`/processes/${process.id}/completed`, window.location.origin).toString()
  await navigator.clipboard.writeText(url)
  toast.success('Link copiado.')
}
