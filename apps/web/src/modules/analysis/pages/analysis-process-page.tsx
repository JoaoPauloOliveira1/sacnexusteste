import {
  AlertTriangleIcon,
  CheckCheckIcon,
  ClipboardCheckIcon,
  EyeIcon,
  FileTextIcon,
  HistoryIcon,
  PlayIcon,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/modules/shared/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/modules/shared/components/ui/tabs'
import { Textarea } from '@/modules/shared/components/ui/textarea'
import { AnalysisComposer } from '../components/analysis-composer'
import { isTechnicalChecklistComplete, technicalChecklistItems } from '../lib/analysis-data'
import { useAnalysisStore } from '../lib/analysis-store'
import { type InspectionDecision } from '../types'

type AnalysisTab = 'documents' | 'checklist' | 'decision' | 'history'

export function AnalysisProcessPage({ processId }: { processId: string }) {
  const store = useAnalysisStore()
  const process = store.getProcess(processId)
  const [activeTab, setActiveTab] = useState<AnalysisTab>('documents')
  const [decision, setDecision] = useState<InspectionDecision | null>(
    process?.inspectionDecision ?? null,
  )
  const [reason, setReason] = useState(process?.inspectionReason ?? '')
  const [notes, setNotes] = useState(process?.technicalNotes ?? '')
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!process) {
    return (
      <AnalysisComposer.Root>
        <AnalysisComposer.PageHeader
          title="Processo não encontrado"
          description="O processo informado não está disponível para análise."
          backTo="/analysis"
        />
      </AnalysisComposer.Root>
    )
  }

  const isEditable = process.status === 'Em análise'
  const checklistComplete = isTechnicalChecklistComplete(process)
  const documentsComplete = process.documents.every((document) => document.status === 'Conforme')

  return (
    <AnalysisComposer.Root>
      <AnalysisComposer.PageHeader
        title={`Análise ${process.processNumber}`}
        description={`${process.companyName} · ${process.establishmentName}`}
        backTo="/analysis"
        actions={
          process.status === 'Aguardando análise' ? (
            <Button
              onClick={() => {
                store.startAnalysis(process.id)
                setFeedback('Análise técnica iniciada e vinculada ao seu perfil.')
              }}
            >
              <PlayIcon data-icon="inline-start" />
              Iniciar análise
            </Button>
          ) : process.status === 'Aguardando correção' ? (
            <Button
              variant="outline"
              onClick={() => {
                store.receiveCorrection(process.id)
                setFeedback('Correção recebida. O processo retornou para reanálise técnica.')
              }}
            >
              Simular correção recebida
            </Button>
          ) : null
        }
      >
        <AnalysisComposer.StatusBadge status={process.status} />
        <Badge variant="outline">{process.risk}</Badge>
        {process.inspectionDecision ? (
          <Badge variant={process.inspectionDecision === 'required' ? 'secondary' : 'default'}>
            {process.inspectionDecision === 'required'
              ? 'Vistoria necessária'
              : 'Vistoria dispensada'}
          </Badge>
        ) : null}
      </AnalysisComposer.PageHeader>

      {feedback ? (
        <Alert className="mb-6">
          <CheckCheckIcon aria-hidden="true" />
          <AlertTitle>Ação registrada</AlertTitle>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      ) : null}

      <AnalysisComposer.Section title="Resumo técnico">
        <AnalysisComposer.InfoGrid
          items={[
            { label: 'Protocolo', value: process.protocolNumber },
            { label: 'CNPJ', value: process.companyCnpj },
            { label: 'Endereço', value: process.establishmentAddress },
            { label: 'Ocupação', value: process.occupation },
            { label: 'Área utilizada', value: process.builtArea },
            { label: 'Pavimentos', value: process.floors },
            { label: 'Triador responsável', value: process.assignedTo ?? 'Não atribuído' },
          ]}
        />
      </AnalysisComposer.Section>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab((value ?? 'documents') as AnalysisTab)}
        className="mt-6"
      >
        <div className="overflow-x-auto pb-1">
          <TabsList variant="line" className="min-w-max">
            <TabsTrigger value="documents">
              <FileTextIcon />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <ClipboardCheckIcon />
              Checklist técnico
            </TabsTrigger>
            <TabsTrigger value="decision">
              <EyeIcon />
              Decisão de vistoria
            </TabsTrigger>
            <TabsTrigger value="history">
              <HistoryIcon />
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="documents" className="mt-4">
          <AnalysisComposer.Section
            title="Documentos para análise"
            description="A triagem confirmou a presença dos arquivos. Aqui o conteúdo e a consistência técnica são avaliados."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Avaliação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {process.documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.name}</TableCell>
                    <TableCell>{document.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          document.status === 'Com exigência'
                            ? 'destructive'
                            : document.status === 'Conforme'
                              ? 'default'
                              : 'outline'
                        }
                      >
                        {document.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!isEditable}
                          onClick={() =>
                            store.setDocumentStatus(process.id, document.id, 'Com exigência')
                          }
                        >
                          Apontar exigência
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!isEditable}
                          onClick={() =>
                            store.setDocumentStatus(process.id, document.id, 'Conforme')
                          }
                        >
                          Marcar conforme
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!isEditable ? (
              <p className="mt-4 text-muted-foreground text-sm">
                Inicie a análise para registrar a avaliação dos documentos.
              </p>
            ) : null}
          </AnalysisComposer.Section>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <AnalysisComposer.Section
            title="Checklist técnico"
            description="Registre as verificações que sustentam a decisão sobre a necessidade de vistoria."
          >
            <div className="space-y-3">
              {technicalChecklistItems.map((item) => (
                <label
                  key={item.id}
                  htmlFor={`technical-checklist-${item.id}`}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
                >
                  <Checkbox
                    id={`technical-checklist-${item.id}`}
                    checked={Boolean(process.checklist[item.id])}
                    disabled={!isEditable}
                    onCheckedChange={(checked) =>
                      store.setChecklistItem(process.id, item.id, checked === true)
                    }
                  />
                  <span className="font-medium text-sm leading-5">{item.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={!isEditable}
                onClick={() => {
                  store.completeChecklist(process.id)
                  setFeedback('Documentos e checklist técnico marcados como conformes.')
                }}
              >
                <CheckCheckIcon data-icon="inline-start" />
                Concluir conferência
              </Button>
            </div>
          </AnalysisComposer.Section>
        </TabsContent>

        <TabsContent value="decision" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <AnalysisComposer.Section
              title="Decisão sobre vistoria"
              description="A vistoria é uma consequência da análise técnica, não uma etapa obrigatória para todo processo Risco 2."
            >
              <RadioGroup
                value={decision}
                disabled={!isEditable}
                onValueChange={(value) => setDecision(value as InspectionDecision)}
                className="grid gap-3 sm:grid-cols-2"
              >
                <label
                  htmlFor="inspection-waived"
                  className="flex cursor-pointer gap-3 rounded-lg border p-4 has-data-checked:border-primary has-data-checked:bg-primary/5"
                >
                  <RadioGroupItem id="inspection-waived" value="waived" />
                  <span>
                    <span className="block font-medium text-sm">Dispensar vistoria prévia</span>
                    <span className="mt-1 block text-muted-foreground text-xs">
                      A documentação é suficiente para continuar a regularização.
                    </span>
                  </span>
                </label>
                <label
                  htmlFor="inspection-required"
                  className="flex cursor-pointer gap-3 rounded-lg border p-4 has-data-checked:border-primary has-data-checked:bg-primary/5"
                >
                  <RadioGroupItem id="inspection-required" value="required" />
                  <span>
                    <span className="block font-medium text-sm">Determinar vistoria</span>
                    <span className="mt-1 block text-muted-foreground text-xs">
                      É necessária verificação presencial antes da decisão final.
                    </span>
                  </span>
                </label>
              </RadioGroup>

              <label htmlFor="inspection-reason" className="mt-5 block">
                <span className="font-medium text-sm">Fundamentação da decisão *</span>
                <Textarea
                  id="inspection-reason"
                  value={reason}
                  disabled={!isEditable}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Descreva os critérios técnicos que fundamentam a decisão."
                  className="mt-2 min-h-28"
                />
              </label>

              <label htmlFor="technical-notes" className="mt-5 block">
                <span className="font-medium text-sm">Observações internas</span>
                <Textarea
                  id="technical-notes"
                  value={notes}
                  disabled={!isEditable}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Registre observações complementares para o histórico."
                  className="mt-2"
                />
              </label>
            </AnalysisComposer.Section>

            <AnalysisComposer.Section
              title="Condições para decisão"
              description="O sistema preserva a rastreabilidade da análise."
            >
              <ul className="space-y-3 text-sm">
                <DecisionCondition complete={documentsComplete}>
                  Todos os documentos estão conformes
                </DecisionCondition>
                <DecisionCondition complete={checklistComplete}>
                  Checklist técnico concluído
                </DecisionCondition>
                <DecisionCondition complete={Boolean(decision)}>
                  Decisão de vistoria selecionada
                </DecisionCondition>
                <DecisionCondition complete={Boolean(reason.trim())}>
                  Fundamentação registrada
                </DecisionCondition>
              </ul>

              <div className="mt-6 grid gap-2">
                <Button
                  type="button"
                  disabled={!isEditable}
                  onClick={() => {
                    if (!decision || !store.setDecision(process.id, decision, reason, notes)) {
                      setFeedback('Conclua os documentos, o checklist e a fundamentação.')
                      return
                    }
                    setFeedback(
                      decision === 'required'
                        ? 'Análise concluída. O processo foi encaminhado para vistoria.'
                        : 'Análise concluída. A vistoria prévia foi dispensada.',
                    )
                  }}
                >
                  Registrar decisão técnica
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!isEditable}
                  onClick={() => {
                    if (!store.issueRequirement(process.id, notes)) {
                      setFeedback('Descreva a exigência nas observações internas.')
                      return
                    }
                    setFeedback('Exigência técnica emitida para o contribuinte.')
                  }}
                >
                  <AlertTriangleIcon data-icon="inline-start" />
                  Emitir exigência técnica
                </Button>
              </div>
            </AnalysisComposer.Section>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <AnalysisComposer.Section title="Histórico do processo">
            <ol className="space-y-5">
              {process.history.map((entry) => (
                <li key={entry.id} className="border-l-2 pl-4">
                  <p className="font-medium text-sm">{entry.title}</p>
                  <p className="mt-1 text-muted-foreground text-sm">{entry.description}</p>
                  <p className="mt-2 text-muted-foreground text-xs">
                    {entry.date} · {entry.user}
                  </p>
                </li>
              ))}
            </ol>
          </AnalysisComposer.Section>
        </TabsContent>
      </Tabs>
    </AnalysisComposer.Root>
  )
}

function DecisionCondition({
  complete,
  children,
}: {
  complete: boolean
  children: React.ReactNode
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={
          complete
            ? 'flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700'
            : 'flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground'
        }
      >
        {complete ? '✓' : '—'}
      </span>
      <span>{children}</span>
    </li>
  )
}
