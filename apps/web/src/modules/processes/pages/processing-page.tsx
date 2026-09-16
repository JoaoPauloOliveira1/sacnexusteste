import { useNavigate } from '@tanstack/react-router'
import { LoaderCircleIcon } from 'lucide-react'
import { useEffect } from 'react'

import { Card, CardContent } from '@/modules/shared/components/ui/card'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, StatusBadge } from '../components/process-page'
import { useProcesses } from '../lib/process-store'

const processingSteps = [
  { label: 'Dados da empresa validados', state: 'complete' },
  { label: 'Enquadramento Risco 1 confirmado', state: 'complete' },
  { label: 'Gerando documento AVCB', state: 'active' },
] as const

export function ProcessingPage() {
  const navigate = useNavigate()
  const { actions, meta } = useProcesses()

  useEffect(() => {
    actions.startProcessing()

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timeout = window.setTimeout(
      () => {
        actions.completeProcess()
        void navigate({
          to: '/processes/$processId/completed',
          params: { processId: meta.process.id },
          replace: true,
        })
      },
      media.matches ? 300 : 2200,
    )

    return () => window.clearTimeout(timeout)
  }, [actions, meta.process.id, navigate])

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Processamento automático"
        description="Sua solicitação está sendo validada e o documento será emitido."
        badge={<StatusBadge>Processando</StatusBadge>}
      >
        <Card className="mx-auto w-full max-w-[760px] rounded-md py-0 shadow-none">
          <CardContent className="flex min-h-80 flex-col items-center justify-center gap-5 p-6 text-center">
            <div className="flex flex-col gap-2">
              <h2 className="font-semibold text-base">Processando solicitação</h2>
              <p className="text-muted-foreground text-sm">
                Aguarde enquanto realizamos as validações automáticas.
              </p>
            </div>

            <LoaderCircleIcon
              aria-hidden="true"
              className="size-12 animate-spin motion-reduce:animate-none"
            />

            <ProcessStatusList />

            <p className="text-muted-foreground text-sm">
              Não feche esta janela. O processo leva apenas alguns instantes.
            </p>
          </CardContent>
        </Card>
      </ProcessPage>
    </ContributorShell>
  )
}

function ProcessStatusList() {
  return (
    <ol className="flex flex-col gap-3 text-left" aria-live="polite">
      {processingSteps.map((step) => (
        <li key={step.label} className="flex items-center gap-3">
          <StatusBadge tone={step.state === 'complete' ? 'success' : 'info'}>
            {step.state === 'complete' ? 'Concluído' : 'Em andamento'}
          </StatusBadge>
          <span className="text-muted-foreground text-sm">{step.label}</span>
        </li>
      ))}
    </ol>
  )
}
