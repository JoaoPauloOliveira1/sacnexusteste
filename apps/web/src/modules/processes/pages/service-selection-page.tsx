import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/modules/shared/components/ui/button'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, StatusBadge, SummaryCard } from '../components/process-page'
import { getRiskClassification } from '../lib/process-data'
import { type ActiveProcessRecord, useProcesses } from '../lib/process-store'
import { type ProcessPhase } from '../types'

export function ServiceSelectionPage() {
  const navigate = useNavigate()
  const { actions, meta, state } = useProcesses()

  function handleSelect() {
    actions.startRequest()
    void navigate({ to: '/processes/new/request' })
  }

  function handleResume(record: ActiveProcessRecord) {
    if (record.process.id !== state.process.id) {
      actions.resumeRequest(record.process.id)
    }
    void navigate({ to: getResumeRoute(record.phase) })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Regularização de estabelecimento"
        description="Inicie uma nova solicitação. O sistema identificará o enquadramento e o rito aplicáveis ao estabelecimento."
        badge={<StatusBadge>Nova solicitação</StatusBadge>}
      >
        <SummaryCard
          title="Regularizar estabelecimento"
          description="Informe os dados da empresa e do estabelecimento para solicitar a regularização."
          footer={
            <Button type="button" size="lg" onClick={handleSelect}>
              Iniciar solicitação
            </Button>
          }
        >
          <p className="text-muted-foreground text-sm">
            O enquadramento será definido automaticamente após a análise das características
            informadas.
          </p>
        </SummaryCard>

        {meta.activeProcesses.length > 0 ? (
          meta.activeProcesses.map((record) => {
            const classification = getRiskClassification(record.answers)

            return (
              <SummaryCard
                key={record.process.id}
                title={record.company.legalName}
                description={
                  classification === 'risk-2'
                    ? 'Enquadramento Risco 2 identificado. Retome a complementação, a análise ou a vistoria a partir da última situação salva.'
                    : 'Continue a solicitação a partir da última etapa salva.'
                }
                footer={
                  <Button type="button" variant="outline" onClick={() => handleResume(record)}>
                    Retomar solicitação
                  </Button>
                }
              >
                <p className="text-muted-foreground text-sm">
                  Protocolo provisório: {record.process.protocolNumber}
                </p>
              </SummaryCard>
            )
          })
        ) : (
          <SummaryCard
            title="Solicitações já iniciadas"
            description="Nenhuma solicitação de regularização está em andamento."
          />
        )}
      </ProcessPage>
    </ContributorShell>
  )
}

function getResumeRoute(phase: ProcessPhase) {
  switch (phase) {
    case 'request-selected':
      return '/processes/new/request' as const
    case 'request-confirmed':
      return '/processes/new/establishment' as const
    case 'establishment-completed':
      return '/processes/new/classification' as const
    case 'questionnaire-completed':
    case 'classification-analyzing':
      return '/processes/new/analyzing' as const
    case 'classified':
      return '/processes/new/result' as const
    case 'declaration-accepted':
      return '/processes/new/review' as const
    case 'processing':
      return '/processes/new/processing' as const
    case 'risk-two-responsible-completed':
      return '/processes/new/declaration' as const
    case 'risk-two-declaration-completed':
      return '/processes/new/documents' as const
    case 'risk-two-documents-completed':
      return '/processes/new/payment' as const
    case 'risk-two-payment-completed':
    case 'risk-two-ready-to-protocol':
      return '/processes/new/submit' as const
    case 'risk-two-protocolled':
      return '/processes/new/protocol' as const
    case 'risk-two-requirement':
      return '/processes/new/requirements' as const
    case 'risk-two-reanalyzing':
      return '/processes/new/validation' as const
    case 'risk-two-inspection-required':
    case 'risk-two-inspection-scheduled':
      return '/processes/new/inspection' as const
    case 'idle':
    case 'completed':
      return '/processes/new' as const
  }
}
