import { createFileRoute, redirect } from '@tanstack/react-router'

import { hasDemoProfile } from '@/modules/auth'
import { DocumentListPage } from '@/modules/documents'
import {
  ContributorShell,
  createIssuedDocuments,
  downloadIssuedDocument,
  useProcesses,
} from '@/modules/processes'

export const Route = createFileRoute('/documents')({
  beforeLoad: () => {
    if (!hasDemoProfile('contributor')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: DocumentsRoute,
})

function DocumentsRoute() {
  const { meta } = useProcesses()
  const records = meta.completedProcesses.slice().reverse()
  const documents = records.flatMap((record) => {
    const issuedDocuments =
      record.issuedDocuments ??
      createIssuedDocuments(record.process, record.classification ?? 'risk-1')

    return issuedDocuments.map((issuedDocument) => ({
      id: `${record.process.id}:${issuedDocument.kind}`,
      processId: record.process.id,
      documentKind: issuedDocument.kind,
      documentNumber: issuedDocument.number,
      documentLabel: issuedDocument.label,
      companyName: record.company.legalName,
      issuedAt: issuedDocument.issuedAt,
      validUntil: issuedDocument.validUntil,
    }))
  })

  return (
    <ContributorShell title="Documentos">
      <DocumentListPage
        documents={documents}
        onDownload={(documentId) => {
          const document = documents.find(({ id }) => id === documentId)
          const record = records.find(({ process }) => process.id === document?.processId)
          const issuedDocument = record?.issuedDocuments?.find(
            ({ kind }) => kind === document?.documentKind,
          )
          if (record && issuedDocument) {
            void downloadIssuedDocument({ ...record, issuedDocument })
          }
        }}
      />
    </ContributorShell>
  )
}
