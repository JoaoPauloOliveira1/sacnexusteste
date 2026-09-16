import { jsPDF } from 'jspdf'
import { type TriageDocument, type TriageProcess } from '../types'

export function downloadTriageDocument(process: TriageProcess, document: TriageDocument) {
  const version = document.versions[0]
  const pdf = new jsPDF()
  pdf.setFontSize(16)
  pdf.text('SAC-NEXUS — Documento de demonstração', 20, 24)
  pdf.setFontSize(11)
  const lines = [
    `Processo: ${process.processNumber}`,
    `Documento: ${document.name}`,
    `Categoria: ${document.category}`,
    `Versão: ${version.version}`,
    `Responsável pelo envio: ${version.uploadedBy}`,
    `Data: ${version.uploadedAt}`,
    `Tamanho: ${version.size}`,
    `Hash: ${version.hash}`,
    `Situação: ${version.status}`,
    '',
    'Este arquivo representa o documento anexado no cenário de demonstração da triagem.',
  ]
  pdf.text(lines, 20, 38)
  pdf.save(document.name)
}
