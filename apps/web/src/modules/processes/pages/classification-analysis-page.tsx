import { useNavigate } from '@tanstack/react-router'
import { CircleCheckIcon, LoaderCircleIcon } from 'lucide-react'
import { useEffect } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, StatusBadge } from '../components/process-page'
import { useProcesses } from '../lib/process-store'

const analysisItems = [
  'Dados obrigatórios conferidos',
  'Características do estabelecimento analisadas',
  'Classificação de risco identificada',
] as const

export function ClassificationAnalysisPage() {
  const navigate = useNavigate()
  const { actions } = useProcesses()

  useEffect(() => {
    actions.startClassificationAnalysis()

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timeout = window.setTimeout(
      () => {
        actions.classify()
        void navigate({ to: '/processes/new/result', replace: true })
      },
      media.matches ? 300 : 1600,
    )

    return () => window.clearTimeout(timeout)
  }, [actions, navigate])

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Analisando enquadramento"
        description="Aguarde enquanto o sistema aplica as regras às características informadas."
        step={4}
      >
        <Card className="w-full max-w-3xl rounded-md shadow-none">
          <CardHeader>
            <div className="flex items-center gap-3">
              <LoaderCircleIcon
                aria-hidden="true"
                className="size-8 animate-spin text-primary motion-reduce:animate-none"
              />
              <CardTitle>Processando as informações do estabelecimento</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-5 text-muted-foreground text-sm">
              Não feche esta página. O resultado será exibido automaticamente.
            </p>
            <ol className="flex flex-col gap-3" aria-live="polite">
              {analysisItems.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CircleCheckIcon aria-hidden="true" className="text-status-success-foreground" />
                  <span>{item}</span>
                  <StatusBadge tone="success">Concluído</StatusBadge>
                </li>
              ))}
              <li className="flex items-center gap-3">
                <LoaderCircleIcon
                  aria-hidden="true"
                  className="animate-spin text-primary motion-reduce:animate-none"
                />
                <span>Definindo o rito aplicável</span>
                <StatusBadge tone="info">Em andamento</StatusBadge>
              </li>
            </ol>
          </CardContent>
        </Card>
      </ProcessPage>
    </ContributorShell>
  )
}
