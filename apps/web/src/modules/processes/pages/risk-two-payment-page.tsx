import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Button } from '@/modules/shared/components/ui/button'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/modules/shared/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/modules/shared/components/ui/radio-group'

import { ContributorShell } from '../components/contributor-shell'
import {
  ProcessPage,
  ProcessPageActions,
  StatusBadge,
  SummaryCard,
  SummaryList,
} from '../components/process-page'
import { useProcesses } from '../lib/process-store'
import { type RiskTwoPaymentMethod } from '../types'

export function RiskTwoPaymentPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const [method, setMethod] = useState<RiskTwoPaymentMethod>(state.riskTwo.payment.method)
  const formattedAmount = state.riskTwo.payment.amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  function handleConfirm() {
    actions.confirmRiskTwoPayment(method)
    void navigate({ to: '/processes/new/submit' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Cobrança e pagamento"
        description="Confira o cálculo apresentado e escolha a forma de pagamento da demonstração."
        riskTwoStep={4}
      >
        <Alert>
          <AlertTitle>Cobrança calculada conforme os dados informados</AlertTitle>
          <AlertDescription>
            O protocolo será liberado após a confirmação simulada do pagamento. Nenhuma transação
            real será criada.
          </AlertDescription>
        </Alert>

        <SummaryCard
          title="Taxa de regularização"
          description="Referência: solicitação de regularização — Risco 2"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SummaryList
                items={[
                  {
                    key: 'calculation',
                    label: 'Memória resumida:',
                    value: `${state.establishment.builtArea} m² · valor parametrizado`,
                  },
                ]}
              />
              <StatusBadge>Aguardando pagamento</StatusBadge>
            </div>
            <div className="flex items-end justify-between border-t pt-4">
              <span className="text-muted-foreground">Valor total</span>
              <strong className="text-3xl tracking-tight">{formattedAmount}</strong>
            </div>
          </div>
        </SummaryCard>

        <SummaryCard
          title="Forma de pagamento"
          description="Escolha uma das formas disponíveis nesta apresentação."
        >
          <RadioGroup
            value={method}
            onValueChange={(value) => setMethod(value as RiskTwoPaymentMethod)}
          >
            <PaymentOption
              value="pix"
              title="PIX"
              description="Confirmação simulada imediatamente."
            />
            <PaymentOption
              value="collection-document"
              title="Documento de arrecadação"
              description="Boleto de demonstração com vencimento em 05/08/2026."
            />
          </RadioGroup>
        </SummaryCard>

        <ProcessPageActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: '/processes/new/documents' })}
          >
            Voltar
          </Button>
          <Button type="button" size="lg" disabled={!method} onClick={handleConfirm}>
            Confirmar pagamento e continuar
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}

function PaymentOption({
  value,
  title,
  description,
}: {
  value: Exclude<RiskTwoPaymentMethod, ''>
  title: string
  description: string
}) {
  return (
    <FieldLabel>
      <Field orientation="horizontal">
        <RadioGroupItem value={value} />
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          <p className="text-muted-foreground text-xs">{description}</p>
        </FieldContent>
      </Field>
    </FieldLabel>
  )
}
