import { Link } from '@tanstack/react-router'
import { DownloadIcon, QrCodeIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, StatusBadge, SummaryCard, SummaryList } from '../components/process-page'
import { downloadIssuedDocument } from '../lib/document-actions'
import { createIssuedDocuments } from '../lib/process-data'
import { useProcesses } from '../lib/process-store'

export function RiskTwoApprovedPage() {
  const { meta, state } = useProcesses()
  const completed = meta.completedProcesses.find(({ process }) => process.id === state.process.id)
  const company = completed?.company ?? state.company
  const establishment = completed?.establishment ?? state.establishment
  const issuedDocuments =
    completed?.issuedDocuments ?? createIssuedDocuments(state.process, 'risk-2')

  return (
    <ContributorShell title="Documentos">
      <ProcessPage
        title="Regularização aprovada"
        description="O rito aplicável foi concluído e os documentos estão disponíveis."
        badge={<StatusBadge tone="success">Documentos emitidos</StatusBadge>}
      >
        <Alert className="border-emerald-300 bg-emerald-50 text-emerald-950">
          <AlertTitle>Solicitação concluída com sucesso</AlertTitle>
          <AlertDescription>
            Os dados e documentos foram aprovados
            {state.riskTwo.inspection.required ? ' após a vistoria' : ' sem vistoria prévia'}.
          </AlertDescription>
        </Alert>

        <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
          <SummaryCard title={`Documentos — ${company.tradeName || company.legalName}`}>
            <SummaryList
              items={[
                ...issuedDocuments.map((document) => ({
                  key: document.kind,
                  label: `${document.shortLabel}:`,
                  value: document.number,
                })),
                { key: 'issued', label: 'Data de emissão:', value: state.process.issuedAt },
                { key: 'validity', label: 'Validade:', value: state.process.validUntil },
                {
                  key: 'protocol',
                  label: 'Protocolo de origem:',
                  value: state.process.protocolNumber,
                },
                {
                  key: 'auth',
                  label: 'Código de autenticação:',
                  value: state.process.validationHash,
                },
              ]}
            />
          </SummaryCard>
          <SummaryCard title="Validar documento">
            <div className="flex min-h-40 flex-col items-center justify-center rounded-md border border-primary/30 bg-primary/5 text-center">
              <QrCodeIcon className="size-16 text-primary" aria-hidden="true" />
              <p className="mt-2 text-muted-foreground text-xs">
                QR Code disponível no PDF de demonstração.
              </p>
            </div>
          </SummaryCard>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Link
            to="/processes/$processId"
            params={{ processId: state.process.id }}
            className={buttonVariants({ variant: 'outline', className: 'rounded-md' })}
          >
            Ver detalhes do processo
          </Link>
          <div className="flex flex-wrap justify-end gap-2">
            {issuedDocuments.map((issuedDocument) => (
              <Button
                key={issuedDocument.kind}
                type="button"
                size="lg"
                onClick={() =>
                  void downloadIssuedDocument({
                    company,
                    establishment,
                    process: state.process,
                    classification: 'risk-2',
                    issuedDocument,
                  })
                }
              >
                <DownloadIcon />
                Baixar {issuedDocument.shortLabel}
              </Button>
            ))}
          </div>
        </div>
      </ProcessPage>
    </ContributorShell>
  )
}
