import { CopyIcon, DownloadIcon, FileCheck2Icon } from 'lucide-react'

import { Button } from '@/modules/shared/components/ui/button'
import { copyDocumentLink, downloadIssuedDocument } from '../lib/document-actions'
import { createIssuedDocuments } from '../lib/process-data'
import { useProcesses } from '../lib/process-store'
import { type CompletedProcess } from '../types'
import { StatusBadge } from './process-page'

export function DocumentSummary({ record }: { record?: CompletedProcess | undefined }) {
  const { meta, state } = useProcesses()
  const company = record?.company ?? state.company
  const establishment = record?.establishment ?? state.establishment
  const process = record?.process ?? meta.process
  const classification = record?.classification ?? meta.classification ?? 'risk-1'
  const issuedDocuments = record?.issuedDocuments ?? createIssuedDocuments(process, classification)

  return (
    <div className="flex flex-col gap-3">
      {issuedDocuments.map((issuedDocument) => (
        <div key={issuedDocument.kind} className="flex flex-col gap-3 rounded-md border p-4">
          <StatusBadge tone="success">
            {issuedDocument.shortLabel.toUpperCase()} •{' '}
            {classification === 'risk-2' ? 'RISCO 2' : 'RISCO 1'}
          </StatusBadge>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex aspect-3/4 w-24 shrink-0 items-center justify-center rounded-md border bg-muted/20">
              <FileCheck2Icon aria-hidden="true" className="text-muted-foreground" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <h3 className="font-semibold text-xl">{issuedDocument.number}</h3>
              <p className="text-muted-foreground text-sm">{issuedDocument.label}</p>
              <p className="text-sm">
                {company.legalName} • CNPJ {company.cnpj}
              </p>
              <p className="text-sm">Validade: {issuedDocument.validUntil}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="lg"
                  onClick={() =>
                    void downloadIssuedDocument({
                      company,
                      establishment,
                      process,
                      classification,
                      issuedDocument,
                    })
                  }
                >
                  <DownloadIcon data-icon="inline-start" />
                  Baixar PDF
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={() =>
                    void copyDocumentLink({
                      ...process,
                      documentNumber: issuedDocument.number,
                      validationHash: issuedDocument.validationHash,
                    })
                  }
                >
                  <CopyIcon data-icon="inline-start" />
                  Copiar link
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
