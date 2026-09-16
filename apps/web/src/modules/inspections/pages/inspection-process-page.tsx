import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, CalendarCheckIcon, CheckCheckIcon, PlayIcon } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import { Textarea } from '@/modules/shared/components/ui/textarea'
import { cn } from '@/modules/shared/lib/utils'
import { InspectionShell } from '../components/inspection-shell'
import { inspectionChecklistItems, isInspectionChecklistComplete } from '../lib/inspection-data'
import { useInspectionStore } from '../lib/inspection-store'

export function InspectionProcessPage({ processId }: { processId: string }) {
  const store = useInspectionStore()
  const process = store.getProcess(processId)
  const [notes, setNotes] = useState(process?.notes ?? '')
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!process) {
    return (
      <InspectionShell>
        <h1 className="font-semibold text-3xl">Vistoria não encontrada</h1>
      </InspectionShell>
    )
  }

  const editable = process.status === 'Em vistoria'
  const checklistComplete = isInspectionChecklistComplete(process)

  return (
    <InspectionShell>
      <Link
        to="/inspections"
        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mb-5 -ml-2')}
      >
        <ArrowLeftIcon data-icon="inline-start" />
        Voltar para a fila
      </Link>

      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant={process.status === 'Aprovada' ? 'default' : 'secondary'}>
              {process.status}
            </Badge>
            <Badge variant="outline">{process.risk}</Badge>
          </div>
          <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            Vistoria {process.processNumber}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {process.companyName} · {process.establishmentName}
          </p>
        </div>
        <div className="flex gap-2">
          {process.status === 'Aguardando agendamento' ? (
            <Button
              onClick={() => {
                store.schedule(process.id)
                setFeedback('Vistoria agendada para 31/07/2026 às 09:00.')
              }}
            >
              <CalendarCheckIcon data-icon="inline-start" />
              Agendar vistoria
            </Button>
          ) : null}
          {process.status === 'Agendada' ? (
            <Button
              onClick={() => {
                store.start(process.id)
                setFeedback('Vistoria presencial iniciada.')
              }}
            >
              <PlayIcon data-icon="inline-start" />
              Iniciar vistoria
            </Button>
          ) : null}
          {process.status === 'Aguardando correção' ? (
            <Button
              variant="outline"
              onClick={() => {
                store.receiveCorrection(process.id)
                setFeedback('Correção recebida e revistoria agendada para 05/08/2026 às 09:00.')
              }}
            >
              Simular correção atendida
            </Button>
          ) : null}
        </div>
      </header>

      {feedback ? (
        <Alert className="mb-6">
          <CheckCheckIcon aria-hidden="true" />
          <AlertTitle>Ação registrada</AlertTitle>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      ) : null}

      {process.certificateNumber ? (
        <Alert className="mb-6 border-emerald-200 bg-emerald-50 text-emerald-900">
          <CheckCheckIcon aria-hidden="true" />
          <AlertTitle>Regularização aprovada</AlertTitle>
          <AlertDescription>
            Documentos {process.certificateNumber} emitidos e disponibilizados ao contribuinte.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ordem de vistoria</CardTitle>
            <CardDescription>Dados definidos pela análise técnica.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-5 text-sm">
              {[
                ['Protocolo', process.protocolNumber],
                ['Endereço', process.address],
                ['Agendamento', process.scheduledAt ?? 'Pendente'],
                ['Vistoriador', process.assignedTo ?? 'Não atribuído'],
                ['Fundamentação', process.reason],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wide">{label}</dt>
                  <dd className="mt-1 font-medium leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checklist de campo</CardTitle>
            <CardDescription>
              Registre as condições verificadas presencialmente no estabelecimento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inspectionChecklistItems.map((item) => (
                <label
                  key={item.id}
                  htmlFor={`inspection-checklist-${item.id}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
                >
                  <Checkbox
                    id={`inspection-checklist-${item.id}`}
                    checked={Boolean(process.checklist[item.id])}
                    disabled={!editable}
                    onCheckedChange={(checked) =>
                      store.setChecklistItem(process.id, item.id, checked === true)
                    }
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </label>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled={!editable}
              onClick={() => store.completeChecklist(process.id)}
            >
              Marcar itens como conformes
            </Button>

            <label htmlFor="inspection-notes" className="mt-5 block font-medium text-sm">
              Relato da vistoria
            </label>
            <Textarea
              id="inspection-notes"
              value={notes}
              disabled={!editable}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Descreva evidências, orientações ou irregularidades encontradas."
              className="mt-2 min-h-28"
            />

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button
                variant="outline"
                disabled={!editable}
                onClick={() => {
                  if (!store.requireCorrection(process.id, notes)) {
                    setFeedback('Descreva a irregularidade antes de emitir a exigência.')
                    return
                  }
                  setFeedback('Exigência de vistoria enviada ao contribuinte.')
                }}
              >
                Emitir exigência
              </Button>
              <Button
                disabled={!editable || !checklistComplete}
                onClick={() => {
                  if (store.approve(process.id, notes)) {
                    setFeedback('Vistoria aprovada e documentos emitidos.')
                  }
                }}
              >
                Aprovar vistoria
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </InspectionShell>
  )
}
