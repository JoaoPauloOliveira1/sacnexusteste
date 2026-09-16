import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/modules/shared/components/ui/alert'
import { Button } from '@/modules/shared/components/ui/button'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/modules/shared/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/modules/shared/components/ui/radio-group'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, ProcessPageActions, SummaryCard } from '../components/process-page'
import { useProcesses } from '../lib/process-store'
import { type RiskTwoSignatureMethod } from '../types'

const signatureOptions: readonly {
  value: Exclude<RiskTwoSignatureMethod, ''>
  title: string
  description: string
}[] = [
  {
    value: 'gov-br',
    title: 'Assinar com Gov.br',
    description: 'Assinatura simulada pela identidade da conta.',
  },
  {
    value: 'digital-certificate',
    title: 'Certificado digital',
    description: 'Assinatura ICP-Brasil simulada.',
  },
  {
    value: 'signed-upload',
    title: 'Enviar declaração assinada',
    description: 'O PDF será solicitado na etapa de documentos.',
  },
]

export function RiskTwoDeclarationPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const [responsibilitiesAccepted, setResponsibilitiesAccepted] = useState(
    state.riskTwo.declaration.responsibilitiesAccepted,
  )
  const [informationConfirmed, setInformationConfirmed] = useState(
    state.riskTwo.declaration.informationConfirmed,
  )
  const [signatureMethod, setSignatureMethod] = useState<RiskTwoSignatureMethod>(
    state.riskTwo.declaration.signatureMethod,
  )
  const canContinue = responsibilitiesAccepted && informationConfirmed && !!signatureMethod

  function handleContinue() {
    actions.saveRiskTwoDeclaration({
      responsibilitiesAccepted,
      informationConfirmed,
      signatureMethod,
    })
    void navigate({ to: '/processes/new/documents' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Declaração de responsabilidade"
        description="Leia integralmente, confirme as responsabilidades e escolha como assinar."
        riskTwoStep={2}
      >
        <Alert className="border-amber-300 bg-amber-50 text-amber-950">
          <AlertDescription>
            Ao assinar, você declara que as informações prestadas são verdadeiras e que manterá as
            medidas de segurança exigidas.
          </AlertDescription>
        </Alert>

        <SummaryCard title="Declaração de responsabilidade — Risco 2">
          <div className="rounded-md border bg-muted/25 p-4 text-muted-foreground text-sm leading-6">
            <p>
              Declaro que as informações e os documentos desta solicitação correspondem à situação
              atual do estabelecimento.
            </p>
            <p>
              Comprometo-me a instalar, conservar e manter as medidas de segurança contra incêndio e
              emergência determinadas para o enquadramento informado.
            </p>
            <p>
              Declaro ciência de que o estabelecimento poderá ser fiscalizado e de que divergências,
              omissões ou informações falsas poderão resultar em exigências, suspensão ou
              cancelamento do documento emitido.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <DeclarationCheck
              checked={responsibilitiesAccepted}
              onCheckedChange={setResponsibilitiesAccepted}
              label="Li integralmente e aceito as responsabilidades descritas acima."
            />
            <DeclarationCheck
              checked={informationConfirmed}
              onCheckedChange={setInformationConfirmed}
              label="Confirmo que os dados e documentos correspondem ao estabelecimento."
            />
          </div>
        </SummaryCard>

        <SummaryCard
          title="Forma de assinatura"
          description="Escolha uma forma para concluir a declaração nesta demonstração."
        >
          <RadioGroup
            value={signatureMethod}
            onValueChange={(value) => setSignatureMethod(value as RiskTwoSignatureMethod)}
            className="grid gap-2 lg:grid-cols-3"
          >
            {signatureOptions.map((option) => (
              <FieldLabel key={option.value}>
                <Field orientation="horizontal">
                  <RadioGroupItem value={option.value} />
                  <FieldContent>
                    <FieldTitle>{option.title}</FieldTitle>
                    <p className="text-muted-foreground text-xs">{option.description}</p>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        </SummaryCard>

        <ProcessPageActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: '/processes/new/responsible' })}
          >
            Voltar
          </Button>
          <Button type="button" size="lg" disabled={!canContinue} onClick={handleContinue}>
            Aceitar e continuar
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}

function DeclarationCheck({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}) {
  return (
    <FieldLabel className="cursor-pointer">
      <Field orientation="horizontal">
        <Checkbox checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} />
        <FieldContent>
          <FieldTitle className="font-normal">
            {label}
            <span aria-hidden="true" className="text-destructive">
              *
            </span>
          </FieldTitle>
        </FieldContent>
      </Field>
    </FieldLabel>
  )
}
