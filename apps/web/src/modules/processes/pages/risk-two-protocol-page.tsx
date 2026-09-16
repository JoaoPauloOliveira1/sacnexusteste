import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2Icon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Button } from '@/modules/shared/components/ui/button'

import { ContributorShell } from '../components/contributor-shell'
import {
  ProcessPage,
  ProcessPageActions,
  StatusBadge,
  SummaryCard,
  SummaryList,
} from '../components/process-page'
import { useProcesses } from '../lib/process-store'

export function RiskTwoProtocolPage() {
  const navigate = useNavigate()
  const { state } = useProcesses()

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Solicitação protocolada"
        description="Seu pedido foi recebido e já pode ser acompanhado."
        badge={<StatusBadge>Risco 2</StatusBadge>}
      >
        <Alert className="border-emerald-300 bg-emerald-50 text-emerald-950">
          <CheckCircle2Icon />
          <AlertTitle>Protocolo {state.process.protocolNumber}</AlertTitle>
          <AlertDescription>Registrado em 29/07/2026 às 14:32.</AlertDescription>
        </Alert>

        <SummaryCard title="Dados da solicitação">
          <SummaryList
            items={[
              {
                key: 'company',
                label: 'Estabelecimento:',
                value: `${state.company.legalName} · ${state.establishment.city}/${state.establishment.state}`,
              },
              {
                key: 'rite',
                label: 'Rito definido:',
                value: 'Risco 2 · análise documental obrigatória',
              },
              {
                key: 'status',
                label: 'Situação atual:',
                value: 'Validação de dados e documentos',
              },
            ]}
          />
        </SummaryCard>

        <SummaryCard title="O que acontece agora?">
          <ol className="list-inside list-decimal text-muted-foreground text-sm leading-6">
            <li>O sistema validará dados, declaração, documentos e pagamento.</li>
            <li>Se houver pendência, você receberá uma exigência com prazo para resposta.</li>
            <li>A necessidade de vistoria será decidida após a validação.</li>
            <li>O AVCB e o Atestado de Vistoria serão emitidos quando o rito for aprovado.</li>
          </ol>
        </SummaryCard>

        <ProcessPageActions>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            Baixar comprovante
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={() => void navigate({ to: '/processes/new/validation' })}
          >
            Acompanhar solicitação
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}
