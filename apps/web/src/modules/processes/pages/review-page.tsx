import { useNavigate } from '@tanstack/react-router'

import { Button } from '@/modules/shared/components/ui/button'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import { Field, FieldContent, FieldLabel, FieldTitle } from '@/modules/shared/components/ui/field'

import { ContributorShell } from '../components/contributor-shell'
import {
  ProcessPage,
  ProcessPageActions,
  StatusBadge,
  SummaryCard,
  SummaryList,
} from '../components/process-page'
import { useProcesses } from '../lib/process-store'

export function ReviewPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()

  function handleIssue() {
    actions.startProcessing()
    void navigate({ to: '/processes/new/processing', replace: true })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Revisão e declaração"
        description="Revise os dados e confirme a veracidade das informações."
        badge={<StatusBadge tone="success">Risco 1</StatusBadge>}
      >
        <SummaryCard title="Empresa">
          <SummaryList
            items={[
              { key: 'company-name', value: state.company.legalName },
              { key: 'company-document', value: `CNPJ ${state.company.cnpj}` },
              {
                key: 'company-representative',
                value: `Representante: ${state.company.processOwner}`,
              },
            ]}
          />
        </SummaryCard>

        <SummaryCard title="Empreendimento">
          <SummaryList
            items={[
              {
                key: 'establishment-address',
                value: `${state.establishment.address}, ${state.establishment.number} — ${state.establishment.city}/${state.establishment.state}`,
              },
              {
                key: 'establishment-characteristics',
                value: `Área construída: ${state.establishment.builtArea} m² • ${state.establishment.floors} ${
                  state.establishment.floors === '1' ? 'pavimento' : 'pavimentos'
                }`,
              },
            ]}
          />
        </SummaryCard>

        <SummaryCard title="Enquadramento">
          <p className="text-muted-foreground text-sm">Risco 1 — Emissão automática</p>
        </SummaryCard>

        <SummaryCard title="Declaração do responsável">
          <FieldLabel className="cursor-pointer">
            <Field orientation="horizontal">
              <Checkbox
                id="responsible-declaration"
                checked={state.declarationAccepted}
                onCheckedChange={(checked) => actions.setDeclarationAccepted(checked === true)}
              />
              <FieldContent>
                <FieldTitle className="font-normal">
                  Declaro que as informações prestadas são verdadeiras e estou ciente das
                  responsabilidades legais.
                </FieldTitle>
              </FieldContent>
            </Field>
          </FieldLabel>
        </SummaryCard>

        <ProcessPageActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: '/processes/new/result' })}
          >
            Voltar
          </Button>
          <Button
            type="button"
            size="lg"
            disabled={!state.declarationAccepted}
            onClick={handleIssue}
          >
            Confirmar e emitir DDLCB
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}
