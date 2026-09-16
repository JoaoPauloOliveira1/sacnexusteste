import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { PaperclipIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/modules/shared/components/ui/field'
import { Textarea } from '@/modules/shared/components/ui/textarea'

import { ContributorShell } from '../components/contributor-shell'
import {
  ProcessPage,
  ProcessPageActions,
  StatusBadge,
  SummaryCard,
} from '../components/process-page'
import { useProcesses } from '../lib/process-store'
import {
  type RiskTwoRequirementResponseValues,
  riskTwoRequirementResponseSchema,
} from '../schemas/risk-two-schema'

export function RiskTwoRequirementsPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const requirement = state.riskTwo.requirement
  const [attachment, setAttachment] = useState<File | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RiskTwoRequirementResponseValues>({
    defaultValues: { response: requirement?.response ?? '' },
    resolver: zodResolver(riskTwoRequirementResponseSchema),
  })

  if (!requirement) {
    return null
  }
  const returnsToInternalWorkflow = Boolean(requirement.originStage)

  function handleResponse(values: RiskTwoRequirementResponseValues) {
    if (!attachment) {
      toast.error('Anexe o documento corrigido para responder à exigência.')
      return
    }
    actions.respondToRiskTwoRequirement(values.response, {
      name: attachment.name,
      size: attachment.size,
      type: attachment.type,
    })
    void navigate({
      to: returnsToInternalWorkflow ? '/dashboard' : '/processes/new/validation',
    })
  }

  return (
    <ContributorShell title="Acompanhamento">
      <ProcessPage
        title="Exigências do processo"
        description="Responda à solicitação do CBMPE e mantenha a comunicação registrada."
        badge={<StatusBadge>{state.process.protocolNumber}</StatusBadge>}
      >
        <SummaryCard title="1 exigência aguardando sua resposta">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>Prazo para resposta: {requirement.deadline}</span>
            <Badge variant="destructive">Aguardando resposta</Badge>
          </div>
        </SummaryCard>

        <SummaryCard title={`#01 · ${requirement.title}`} description="Análise documental">
          <Alert variant="destructive">
            <AlertTitle>Correção necessária</AlertTitle>
            <AlertDescription>{requirement.description}</AlertDescription>
          </Alert>

          <div className="mt-4 rounded-md bg-primary/5 p-4 text-sm">
            <p className="font-medium text-primary">Equipe de análise · CBMPE</p>
            <p className="mt-1 text-muted-foreground">
              O arquivo enviado não permite confirmar todos os dados do responsável. Encaminhe uma
              nova cópia conforme a orientação acima.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(handleResponse)}
            noValidate
            className="mt-4 flex flex-col gap-3"
          >
            <Field data-invalid={!!errors.response}>
              <FieldLabel htmlFor="requirement-response">
                Resposta ou justificativa
                <span aria-hidden="true" className="text-destructive">
                  *
                </span>
              </FieldLabel>
              <Textarea
                id="requirement-response"
                placeholder="Descreva a providência tomada..."
                rows={5}
                aria-required="true"
                aria-invalid={!!errors.response}
                {...register('response')}
              />
              <FieldError>{errors.response?.message}</FieldError>
            </Field>

            <div className="flex flex-wrap items-center gap-3">
              <input
                id="requirement-attachment"
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0] ?? null
                  if (file && file.size > 10 * 1024 * 1024) {
                    toast.error('O arquivo deve ter no máximo 10 MB.')
                    event.currentTarget.value = ''
                    return
                  }
                  setAttachment(file)
                }}
              />
              <label
                htmlFor="requirement-attachment"
                className={buttonVariants({
                  variant: 'outline',
                  className: 'cursor-pointer rounded-md',
                })}
              >
                <PaperclipIcon />
                Anexar documento corrigido
              </label>
              <span className="min-w-0 truncate text-muted-foreground text-xs">
                {attachment?.name ?? 'Nenhum arquivo selecionado'}
              </span>
            </div>

            <ProcessPageActions>
              <Button
                type="button"
                variant="outline"
                onClick={() => void navigate({ to: '/dashboard' })}
              >
                Salvar e sair
              </Button>
              <Button type="submit" size="lg" disabled={!attachment} isLoading={isSubmitting}>
                Enviar resposta
              </Button>
            </ProcessPageActions>
          </form>
        </SummaryCard>
      </ProcessPage>
    </ContributorShell>
  )
}
