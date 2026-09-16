import { useNavigate } from '@tanstack/react-router'
import { CheckIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Button } from '@/modules/shared/components/ui/button'

import { ContributorShell } from '../components/contributor-shell'
import {
  ProcessPage,
  ProcessPageActions,
  StatusBadge,
  SummaryCard,
} from '../components/process-page'
import { getQuestionLabel } from '../lib/process-data'
import { useProcesses } from '../lib/process-store'

export function ClassificationResultPage() {
  const navigate = useNavigate()
  const { meta, state } = useProcesses()
  const isRiskOne = meta.classification === 'risk-1'
  const consideredFactors = Object.entries(state.answers).map(([questionId, answer]) => ({
    id: questionId,
    label: getQuestionLabel(questionId),
    answer,
  }))

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Resultado do enquadramento"
        description="O sistema concluiu a análise das características informadas."
        step={4}
      >
        <SummaryCard
          title={`Estabelecimento classificado como ${isRiskOne ? 'Risco 1' : 'Risco 2'}`}
          description={
            isRiskOne
              ? 'A solicitação atende aos critérios para emissão automática do AVCB.'
              : 'A solicitação seguirá para complementação, protocolo e análise obrigatória dos documentos.'
          }
        >
          <div className="flex flex-col gap-4">
            <div>
              <StatusBadge tone="success">
                {isRiskOne ? 'RISCO 1 • BAIXO RISCO' : 'RISCO 2 • ANÁLISE DOCUMENTAL'}
              </StatusBadge>
            </div>
            <ul className="flex flex-col gap-2 text-muted-foreground text-sm">
              {consideredFactors.map((factor) => (
                <li key={factor.id} className="flex items-start gap-2">
                  <CheckIcon aria-hidden="true" className="mt-0.5" />
                  <span>
                    {factor.label} <strong className="text-foreground">{factor.answer}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </SummaryCard>

        {isRiskOne ? (
          <SummaryCard
            title="O que acontece agora?"
            description="Não haverá pagamento, análise técnica, exigência documental ou vistoria. Após sua declaração, o documento será emitido automaticamente."
          />
        ) : (
          <Alert>
            <AlertTitle>Próximas etapas do Risco 2</AlertTitle>
            <AlertDescription>
              Após a complementação e o protocolo, os documentos serão analisados. A vistoria não é
              automática: ela poderá ser exigida depois da validação, conforme as condições do
              estabelecimento e as regras aplicáveis.
            </AlertDescription>
          </Alert>
        )}

        <ProcessPageActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: '/processes/new/classification' })}
          >
            Revisar respostas
          </Button>
          {isRiskOne ? (
            <Button
              type="button"
              size="lg"
              onClick={() => void navigate({ to: '/processes/new/review' })}
            >
              Continuar para declaração
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate({ to: '/dashboard' })}
              >
                Salvar e sair
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => void navigate({ to: '/processes/new/responsible' })}
              >
                Continuar solicitação
              </Button>
            </>
          )}
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}
