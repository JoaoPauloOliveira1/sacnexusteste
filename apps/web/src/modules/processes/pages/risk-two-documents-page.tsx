import { useNavigate } from '@tanstack/react-router'
import { CheckIcon, FileUpIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/modules/shared/components/ui/badge'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Progress } from '@/modules/shared/components/ui/progress'
import { cn } from '@/modules/shared/lib/utils'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, ProcessPageActions, SummaryCard } from '../components/process-page'
import { useProcesses } from '../lib/process-store'
import { type RiskTwoDocument } from '../types'

const acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png']
const maxFileSize = 10 * 1024 * 1024

export function RiskTwoDocumentsPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const completedDocuments = state.riskTwo.documents.filter(
    (document) => document.status !== 'pending',
  ).length
  const requiredComplete = state.riskTwo.documents.every(
    (document) => !document.required || document.status !== 'pending',
  )

  function handleContinue() {
    actions.completeRiskTwoDocuments()
    void navigate({ to: '/processes/new/payment' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Documentos exigidos"
        description="Envie os arquivos solicitados para permitir a análise da regularização."
        riskTwoStep={3}
      >
        <SummaryCard
          title={`${completedDocuments} de ${state.riskTwo.documents.length} documentos preparados`}
          description="Arquivos aceitos: PDF, JPG ou PNG. Tamanho máximo de 10 MB por arquivo. Os arquivos permanecem apenas na memória desta demonstração."
        >
          <Progress
            className="mt-2"
            value={(completedDocuments / state.riskTwo.documents.length) * 100}
            aria-label="Progresso dos documentos"
          />
        </SummaryCard>

        <div className="rounded-md border bg-card p-3">
          <ul className="flex flex-col gap-2">
            {state.riskTwo.documents.map((document) => (
              <DocumentRow
                key={document.id}
                document={document}
                onUpload={(file) => {
                  if (!acceptedTypes.includes(file.type)) {
                    toast.error('Envie um arquivo PDF, JPG ou PNG.')
                    return
                  }
                  if (file.size > maxFileSize) {
                    toast.error('O arquivo deve ter no máximo 10 MB.')
                    return
                  }
                  actions.saveRiskTwoDocument(document.id, {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  })
                }}
                onRemove={() => actions.removeRiskTwoDocument(document.id)}
              />
            ))}
          </ul>
        </div>

        <ProcessPageActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: '/processes/new/declaration' })}
          >
            Voltar
          </Button>
          <Button type="button" size="lg" disabled={!requiredComplete} onClick={handleContinue}>
            Continuar para cobrança
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}

function DocumentRow({
  document,
  onUpload,
  onRemove,
}: {
  document: RiskTwoDocument
  onUpload: (file: File) => void
  onRemove: () => void
}) {
  const inputId = `document-${document.id}`
  const completed = document.status !== 'pending'

  return (
    <li className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/5 text-primary',
          completed && 'bg-status-success text-status-success-foreground',
        )}
      >
        {completed ? <CheckIcon aria-hidden="true" /> : <FileUpIcon aria-hidden="true" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-sm">{document.name}</p>
          <Badge variant="secondary">{document.required ? 'Obrigatório' : 'Opcional'}</Badge>
        </div>
        <p className="text-muted-foreground text-xs">{document.description}</p>
        {document.fileName ? (
          <p className="mt-1 truncate text-primary text-xs">{document.fileName}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={completed ? 'outline' : 'secondary'}>
          {document.status === 'generated'
            ? 'Gerado'
            : document.status === 'uploaded'
              ? 'Enviado'
              : 'Pendente'}
        </Badge>
        {document.status === 'generated' ? null : (
          <>
            <input
              id={inputId}
              className="sr-only"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                if (file) {
                  onUpload(file)
                }
                event.currentTarget.value = ''
              }}
            />
            <label
              htmlFor={inputId}
              className={buttonVariants({
                variant: completed ? 'outline' : 'default',
                className: 'cursor-pointer rounded-md px-4 text-[13px]',
              })}
            >
              {completed ? 'Substituir' : 'Enviar arquivo'}
            </label>
          </>
        )}
        {document.status === 'uploaded' ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={`Remover ${document.name}`}
            onClick={onRemove}
          >
            <Trash2Icon />
          </Button>
        ) : null}
      </div>
    </li>
  )
}
