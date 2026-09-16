import { CopyIcon, DownloadIcon } from 'lucide-react'

import { Button } from '@/modules/shared/components/ui/button'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, StatusBadge, SummaryCard, SummaryList } from '../components/process-page'
import { copyDocumentLink, downloadIssuedDocument } from '../lib/document-actions'
import { createIssuedDocuments } from '../lib/process-data'
import { useProcesses } from '../lib/process-store'

export function ProcessDetailsPage({ processId }: { processId: string }) {
  const { meta, state } = useProcesses()
  const record =
    meta.completedProcesses.find(({ process }) => process.id === processId) ??
    meta.completedProcesses.at(-1)
  const company = record?.company ?? state.company
  const establishment = record?.establishment ?? state.establishment
  const process = record?.process ?? meta.process
  const history = record?.history ?? []
  const classification = record?.classification ?? meta.classification ?? 'risk-1'
  const issuedDocuments = record?.issuedDocuments ?? createIssuedDocuments(process, classification)

  return (
    <ContributorShell title={company.legalName}>
      <ProcessPage
        title="Detalhes do processo"
        description={`${process.processNumber} — ${company.legalName}`}
        badge={<StatusBadge tone="success">Concluído</StatusBadge>}
      >
        <SummaryCard
          title={`Processo ${process.processNumber}`}
          description="Solicitação de regularização • Criada em 25/07/2026"
        >
          <StatusBadge tone="success">CONCLUÍDO • DOCUMENTO EMITIDO</StatusBadge>
        </SummaryCard>

        <div className="grid gap-3 lg:grid-cols-2">
          <SummaryCard title="Dados do processo">
            <SummaryList
              items={[
                { key: 'company', label: 'Empresa', value: company.legalName },
                { key: 'document', label: 'CNPJ', value: company.cnpj },
                {
                  key: 'establishment',
                  label: 'Empreendimento',
                  value: `${establishment.address}, ${establishment.number}`,
                },
                {
                  key: 'classification',
                  label: 'Classificação',
                  value: classification === 'risk-2' ? 'Risco 2' : 'Risco 1',
                },
              ]}
            />
          </SummaryCard>

          <SummaryCard title="Histórico">
            <ol className="flex flex-col gap-3">
              {history.map((event) => (
                <li key={event.time} className="grid grid-cols-[auto_1fr] gap-4 text-sm">
                  <time className="text-muted-foreground tabular-nums">{event.time}</time>
                  <span>{event.title}</span>
                </li>
              ))}
            </ol>
          </SummaryCard>
        </div>

        {issuedDocuments.map((issuedDocument) => (
          <SummaryCard
            key={issuedDocument.kind}
            title={issuedDocument.label}
            description={`${issuedDocument.number} • ${issuedDocument.validUntil}`}
            footer={
              <>
                <Button
                  type="button"
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
                <Button
                  type="button"
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
                  Baixar {issuedDocument.shortLabel} em PDF
                </Button>
              </>
            }
          />
        ))}
      </ProcessPage>
    </ContributorShell>
  )
}
