import { Link, useNavigate } from '@tanstack/react-router'

import { Alert, AlertDescription } from '@/modules/shared/components/ui/alert'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/modules/shared/components/ui/field'

import { ContributorShell } from '../components/contributor-shell'
import {
  ProcessPage,
  ProcessPageActions,
  SummaryCard,
  SummaryList,
} from '../components/process-page'
import { useProcesses } from '../lib/process-store'

const relationshipLabels = {
  owner: 'Proprietário ou sócio',
  'legal-representative': 'Representante legal',
  proxy: 'Procurador',
  'technical-responsible': 'Responsável técnico',
  '': 'Não informado',
} as const

export function RiskTwoSubmitPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const uploadedCount = state.riskTwo.documents.filter(
    (document) => document.status !== 'pending',
  ).length

  function handleProtocol() {
    actions.protocolRiskTwo()
    void navigate({ to: '/processes/new/protocol' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Revisão e protocolo"
        description="Confira todas as informações antes de enviar a solicitação."
        riskTwoStep={5}
      >
        <Alert className="border-amber-300 bg-amber-50 text-amber-950">
          <AlertDescription>
            Após protocolar, correções deverão ser realizadas por meio de exigência ou solicitação
            formal.
          </AlertDescription>
        </Alert>

        <SummaryCard title="Resumo da solicitação">
          <div className="flex flex-col divide-y">
            <ReviewItem
              label="Estabelecimento"
              value={`${state.company.legalName} · ${state.establishment.city}/${state.establishment.state} · CNPJ ${state.company.cnpj}`}
              to="/processes/new/request"
            />
            <ReviewItem
              label="Enquadramento"
              value="Risco 2 · análise documental obrigatória"
              to="/processes/new/result"
            />
            <ReviewItem
              label="Responsável"
              value={`${relationshipLabels[state.riskTwo.responsible.relationship]} · ${state.riskTwo.responsible.phone}`}
              to="/processes/new/responsible"
            />
            <ReviewItem
              label="Declaração"
              value="Aceita e preparada para assinatura na demonstração"
              to="/processes/new/declaration"
            />
            <ReviewItem
              label="Documentos"
              value={`${uploadedCount} documentos preparados · validação pendente`}
              to="/processes/new/documents"
            />
            <ReviewItem
              label="Pagamento"
              value={`${state.riskTwo.payment.method === 'pix' ? 'PIX' : 'Documento de arrecadação'} confirmado · R$ 286,40`}
              to="/processes/new/payment"
            />
          </div>
        </SummaryCard>

        <SummaryCard title="Confirmação final">
          <FieldLabel className="cursor-pointer">
            <Field orientation="horizontal">
              <Checkbox
                checked={state.riskTwo.reviewConfirmed}
                onCheckedChange={(value) => actions.setRiskTwoReviewConfirmed(value === true)}
              />
              <FieldContent>
                <FieldTitle className="font-normal">
                  Confirmo que revisei os dados e sou responsável pelas informações enviadas.
                  <span aria-hidden="true" className="text-destructive">
                    *
                  </span>
                </FieldTitle>
              </FieldContent>
            </Field>
          </FieldLabel>
        </SummaryCard>

        <ProcessPageActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: '/processes/new/payment' })}
          >
            Voltar
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={!state.riskTwo.reviewConfirmed}
            onClick={handleProtocol}
          >
            Protocolar solicitação
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}

function ReviewItem({
  label,
  value,
  to,
}: {
  label: string
  value: string
  to:
    | '/processes/new/request'
    | '/processes/new/result'
    | '/processes/new/responsible'
    | '/processes/new/declaration'
    | '/processes/new/documents'
    | '/processes/new/payment'
}) {
  return (
    <div className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
      <SummaryList items={[{ key: label, label, value }]} />
      <Link
        to={to}
        className={buttonVariants({
          size: 'sm',
          variant: 'outline',
          className: 'ml-auto rounded-md',
        })}
      >
        Editar
      </Link>
    </div>
  )
}
