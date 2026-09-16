import { useNavigate } from '@tanstack/react-router'
import { CalendarCheck2Icon, Clock3Icon } from 'lucide-react'
import { useEffect, useState } from 'react'

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
} from '../components/process-page'
import { useProcesses } from '../lib/process-store'

const inspectionSlots = [
  '04/08/2026 · 08:00 às 10:00',
  '04/08/2026 · 13:00 às 15:00',
  '06/08/2026 · 09:00 às 11:00',
] as const

export function RiskTwoInspectionPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const [selectedSlot, setSelectedSlot] = useState(state.riskTwo.inspection.scheduledAt)
  const isScheduled = state.phase === 'risk-two-inspection-scheduled'

  useEffect(() => {
    if (!isScheduled) {
      return
    }
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 80 : 1600
    const timeout = window.setTimeout(() => {
      actions.completeRiskTwoInspection()
      void navigate({ to: '/processes/new/approved', replace: true })
    }, delay)
    return () => window.clearTimeout(timeout)
  }, [actions, isScheduled, navigate])

  function handleSchedule() {
    actions.scheduleRiskTwoInspection(selectedSlot)
  }

  return (
    <ContributorShell title="Acompanhamento">
      <ProcessPage
        title={isScheduled ? 'Vistoria agendada' : 'Vistoria necessária'}
        description={
          isScheduled
            ? 'Acompanhe o agendamento e aguarde a atualização da situação.'
            : 'A análise documental foi aprovada e o rito exige uma vistoria antes da emissão.'
        }
        badge={<StatusBadge>{state.process.protocolNumber}</StatusBadge>}
      >
        <Alert>
          {isScheduled ? <Clock3Icon /> : <CalendarCheck2Icon />}
          <AlertTitle>
            {isScheduled ? 'Agendamento confirmado' : 'Decisão tomada após a validação'}
          </AlertTitle>
          <AlertDescription>
            {isScheduled
              ? `${state.riskTwo.inspection.scheduledAt}. A conclusão será simulada em instantes.`
              : 'A vistoria é uma bifurcação condicional do Risco 2 e não ocorre em todas as solicitações.'}
          </AlertDescription>
        </Alert>

        {isScheduled ? (
          <SummaryCard
            title="Vistoria em acompanhamento"
            description="Na operação real, o resultado seria atualizado pela equipe responsável. Nesta apresentação, a aprovação será simulada automaticamente."
          >
            <div className="flex items-center gap-3 text-sm" aria-live="polite">
              <Clock3Icon className="animate-pulse text-primary motion-reduce:animate-none" />
              <span>Atualizando o resultado da vistoria...</span>
            </div>
          </SummaryCard>
        ) : (
          <SummaryCard
            title="Selecione uma janela de atendimento"
            description="Escolha uma das disponibilidades apresentadas para esta demonstração."
          >
            <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
              {inspectionSlots.map((slot) => (
                <FieldLabel key={slot}>
                  <Field orientation="horizontal">
                    <RadioGroupItem value={slot} />
                    <FieldContent>
                      <FieldTitle>{slot}</FieldTitle>
                      <p className="text-muted-foreground text-xs">
                        Responsável pelo estabelecimento deve estar presente.
                      </p>
                    </FieldContent>
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </SummaryCard>
        )}

        {!isScheduled ? (
          <ProcessPageActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigate({ to: '/dashboard' })}
            >
              Salvar e sair
            </Button>
            <Button type="button" size="lg" disabled={!selectedSlot} onClick={handleSchedule}>
              Agendar vistoria
            </Button>
          </ProcessPageActions>
        ) : null}
      </ProcessPage>
    </ContributorShell>
  )
}
