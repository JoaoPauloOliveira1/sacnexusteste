import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/modules/shared/components/ui/button'

import { ContributorShell } from '../components/contributor-shell'
import { DocumentSummary } from '../components/document-summary'
import {
  ProcessPage,
  ProcessPageActions,
  StatusBadge,
  SummaryCard,
} from '../components/process-page'
import { useProcesses } from '../lib/process-store'

export function ProcessCompletedPage({ processId }: { processId: string }) {
  const navigate = useNavigate()
  const { meta } = useProcesses()
  const record =
    meta.completedProcesses.find(({ process }) => process.id === processId) ??
    meta.completedProcesses.at(-1)
  const process = record?.process ?? meta.process

  return (
    <ContributorShell title="Documentos">
      <ProcessPage
        title="Dispensa de licenciamento emitida"
        description="A DDLCB foi gerada automaticamente e já está disponível."
        badge={<StatusBadge tone="success">Concluído</StatusBadge>}
      >
        <SummaryCard
          title="Documento disponível"
          description="DDLCB emitida em 25/07/2026 às 14:32."
        >
          <DocumentSummary record={record} />
        </SummaryCard>

        <SummaryCard
          title="Emissão automática concluída"
          description="O processo foi finalizado sem pagamento, análise técnica ou vistoria."
        />

        <ProcessPageActions>
          <Button
            type="button"
            size="lg"
            onClick={() =>
              void navigate({
                to: '/processes/$processId',
                params: { processId: process.id },
              })
            }
          >
            Ver detalhes do processo
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}
