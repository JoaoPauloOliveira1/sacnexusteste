import PDFDocument from 'pdfkit'

export type PdfDocumentSpec = {
  org: string
  title: string
  subtitle?: string
  meta: Array<[string, string]>
  paragraph: string
  fields: Array<[string, string]>
  list?: { title: string; items: string[] }
  footer: string
}

/**
 * Renders a simple institutional document (header + meta + paragraph + fields +
 * optional list + footer) to a PDF Buffer using pdfkit's built-in fonts.
 */
export function createDocumentPdf(spec: PdfDocumentSpec): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 })
    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const left = doc.page.margins.left
    const width = doc.page.width - doc.page.margins.left - doc.page.margins.right

    // Header
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#555')
      .text(spec.org.toUpperCase(), { align: 'center', characterSpacing: 1 })
    doc.moveDown(0.3)
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#111').text(spec.title, { align: 'center' })
    if (spec.subtitle) {
      doc.moveDown(0.2)
      doc.font('Helvetica').fontSize(9).fillColor('#666').text(spec.subtitle, { align: 'center' })
    }
    doc.moveDown(0.6)
    doc
      .moveTo(left, doc.y)
      .lineTo(left + width, doc.y)
      .strokeColor('#ddd')
      .stroke()
    doc.moveDown(0.8)

    // Meta row
    doc.font('Helvetica').fontSize(9).fillColor('#333')
    for (const [label, value] of spec.meta) {
      doc.text(`${label}: `, { continued: true }).font('Helvetica-Bold').text(value)
      doc.font('Helvetica')
    }
    doc.moveDown(0.6)

    // Paragraph
    doc.font('Helvetica').fontSize(11).fillColor('#111').text(spec.paragraph, { align: 'justify' })
    doc.moveDown(0.8)

    // Fields box
    doc.font('Helvetica').fontSize(10)
    for (const [label, value] of spec.fields) {
      doc.fillColor('#777').text(label)
      doc.fillColor('#111').font('Helvetica-Bold').text(value)
      doc.font('Helvetica').moveDown(0.4)
    }

    // Optional list
    if (spec.list && spec.list.items.length > 0) {
      doc.moveDown(0.3)
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#111').text(spec.list.title)
      doc.moveDown(0.2)
      doc.font('Helvetica').fontSize(9).fillColor('#333')
      for (const item of spec.list.items) {
        doc.text(`•  ${item}`)
      }
    }

    // Footer
    doc.moveDown(1.2)
    doc
      .moveTo(left, doc.y)
      .lineTo(left + width, doc.y)
      .strokeColor('#ddd')
      .stroke()
    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(8).fillColor('#666').text(spec.footer, { align: 'justify' })

    doc.end()
  })
}
