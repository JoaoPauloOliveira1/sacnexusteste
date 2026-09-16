import { useNavigate } from '@tanstack/react-router'
import { CheckCircle2Icon, Clock3Icon, LoaderCircleIcon } from 'lucide-react'
import { useEffect } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Progress } from '@/modules/shared/components/ui/progress'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, StatusBadge, SummaryCard } from '../components/process-page'
import { useProcesses } from '../lib/process-store'

export function RiskTwoValidationPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const isReanalysis = state.phase === 'risk-two-reanalyzing'

  useEffect(() => {
    if (state.phase !== 'risk-two-protocolled' && state.phase !== 'risk-two-reanalyzing') {
      return
    }

    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 80 : 1400
    const timeout = window.setTimeout(() => {
      actions.advanceRiskTwoValidation()
      if (state.phase === 'risk-two-protocolled') {
        void navigate({ to: '/processes/new/requirements', replace: true })
        return
      }
      void navigate({
        to:
          state.answers.flammables === 'Sim'
            ? '/processes/new/inspection'
            : '/processes/new/approved',
        replace: true,
      })
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [actions, navigate, state.answers.flammables, state.phase])

  return (
    <ContributorShell title="Acompanhamento">
      <ProcessPage
        title={isReanalysis ? 'Solicitação em reanálise' : 'Solicitação em validação'}
        description="Acompanhe as verificações realizadas sobre os dados e documentos enviados."
        badge={<StatusBadge>{state.process.protocolNumber}</StatusBadge>}
      >
        <Alert>
          <LoaderCircleIcon className="animate-spin motion-reduce:animate-none" />
          <AlertTitle>
            {isReanalysis ? 'Resposta em conferência' : 'Validação em andamento'}
          </AlertTitle>
          <AlertDescription>
            Esta etapa é simulada automaticamente. A próxima situação será apresentada em instantes.
          </AlertDescription>
        </Alert>

        <SummaryCard title="Itens analisados">
          <div className="flex flex-col gap-2">
            <ValidationItem label="Dados cadastrais" status="completed" />
            <ValidationItem label="Declaração de responsabilidade" status="completed" />
            <ValidationItem label="Documentos enviados" status="analyzing" />
            <ValidationItem label="Pagamento" status="completed" />
          </div>
          <Progress
            value={isReanalysis ? 92 : 75}
            aria-label="Progresso da validação"
            className="mt-4"
          />
        </SummaryCard>

        <p className="text-muted-foreground text-xs" aria-live="polite">
          Não feche esta página enquanto a situação é atualizada.
        </p>
      </ProcessPage>
    </ContributorShell>
  )
}

function ValidationItem({ label, status }: { label: string; status: 'completed' | 'analyzing' }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-muted/35 p-3">
      {status === 'completed' ? (
        <CheckCircle2Icon className="text-emerald-700" aria-hidden="true" />
      ) : (
        <Clock3Icon className="text-primary" aria-hidden="true" />
      )}
      <span className="flex-1 font-medium text-sm">{label}</span>
      <span className="text-muted-foreground text-xs">
        {status === 'completed' ? 'Concluído' : 'Em análise'}
      </span>
    </div>
  )
}
