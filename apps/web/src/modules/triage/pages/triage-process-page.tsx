import {
  AlertCircleIcon,
  CheckCheckIcon,
  DownloadIcon,
  EyeIcon,
  FilesIcon,
  HistoryIcon,
  ListChecksIcon,
  PlayIcon,
  RefreshCwIcon,
  SendIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/modules/shared/components/ui/alert'
import { Badge } from '@/modules/shared/components/ui/badge'
import { Button } from '@/modules/shared/components/ui/button'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from '@/modules/shared/components/ui/field'
import { Progress, ProgressLabel, ProgressValue } from '@/modules/shared/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/modules/shared/components/ui/tabs'
import { TriageComposer } from '../components/triage-composer'
import { RequirementForm } from '../forms/requirement-form'
import { downloadTriageDocument } from '../lib/document-export'
import { checklistGroups, getChecklistProgress, isChecklistComplete } from '../lib/triage-data'
import { useTriageStore } from '../lib/triage-store'
import { type TriageDocument } from '../types'

type ProcessTab = 'overview' | 'documents' | 'checklist' | 'requirements' | 'history'

export function TriageProcessPage({ processId }: { processId: string }) {
  const store = useTriageStore()
  const process = store.getProcess(processId)
  const [activeTab, setActiveTab] = useState<ProcessTab>('overview')
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    process?.documents[0]?.id ?? null,
  )
  const [comparisonDocumentId, setComparisonDocumentId] = useState<string | null>(
    process?.documents.find((document) => document.versions.length > 1)?.id ?? null,
  )
  const [feedback, setFeedback] = useState<string | null>(null)

  const selectedDocument = useMemo(
    () => process?.documents.find((document) => document.id === selectedDocumentId),
    [process, selectedDocumentId],
  )
  const comparisonDocument = useMemo(
    () => process?.documents.find((document) => document.id === comparisonDocumentId),
    [comparisonDocumentId, process],
  )

  if (!process) {
    return (
      <TriageComposer.Root>
        <TriageComposer.PageHeader
          title="Processo não encontrado"
          description="O processo informado não está disponível na fila de demonstração."
          backTo="/triage"
        />
      </TriageComposer.Root>
    )
  }

  const checklistProgress = getChecklistProgress(process)
  const checklistComplete = isChecklistComplete(process)
  const canStart = process.status === 'Protocolado' || process.status === 'Correções Recebidas'
  const isEditable = process.status === 'Em Triagem' || process.status === 'Em Nova Triagem'
  const isAwaitingCorrections = process.status === 'Aguardando Correções'

  return (
    <TriageComposer.Root>
      <TriageComposer.PageHeader
        title={process.processNumber}
        description={`${process.company.tradeName} · ${process.establishment.name}`}
        backTo="/triage"
        actions={
          <>
            {canStart ? (
              <Button
                onClick={() => {
                  store.startTriage(process.id)
                  setFeedback(
                    process.status === 'Correções Recebidas'
                      ? 'Nova triagem iniciada com os documentos corrigidos.'
                      : 'Triagem administrativa iniciada.',
                  )
                }}
              >
                <PlayIcon data-icon="inline-start" />
                {process.status === 'Correções Recebidas'
                  ? 'Iniciar nova triagem'
                  : 'Iniciar triagem'}
              </Button>
            ) : null}
            {isAwaitingCorrections ? (
              <Button
                variant="outline"
                onClick={() => {
                  store.receiveCorrections(process.id)
                  setFeedback('Correções recebidas. O processo está pronto para uma nova triagem.')
                }}
              >
                <RefreshCwIcon data-icon="inline-start" />
                Simular correções recebidas
              </Button>
            ) : null}
          </>
        }
      >
        <TriageComposer.StatusBadge status={process.status} />
        <TriageComposer.PriorityBadge priority={process.priority} />
        <Badge variant="outline">{process.risk}</Badge>
      </TriageComposer.PageHeader>

      {feedback ? (
        <Alert className="mb-6">
          <CheckCheckIcon aria-hidden="true" />
          <AlertTitle>Ação registrada</AlertTitle>
          <AlertDescription>{feedback}</AlertDescription>
        </Alert>
      ) : null}

      <TriageComposer.Section title="Identificação do processo">
        <TriageComposer.InfoGrid
          items={[
            { label: 'Número do processo', value: process.processNumber },
            { label: 'Número do protocolo', value: process.protocolNumber },
            { label: 'Empresa', value: process.company.legalName },
            { label: 'Empreendimento', value: process.establishment.name },
            { label: 'Contribuinte', value: process.contributor },
            { label: 'Responsável Técnico', value: process.technicalResponsible.name },
            { label: 'Classificação', value: process.classification },
            { label: 'Risco', value: process.risk },
            { label: 'Tipo de processo', value: process.processType },
            { label: 'Data do protocolo', value: process.protocolDate },
            {
              label: 'Situação atual',
              value: <TriageComposer.StatusBadge status={process.status} />,
            },
          ]}
        />
      </TriageComposer.Section>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab((value ?? 'overview') as ProcessTab)}
        className="mt-6"
      >
        <div className="overflow-x-auto pb-1">
          <TabsList variant="line" className="min-w-max">
            <TabsTrigger value="overview">Dados cadastrais</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="requirements">Exigências</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <TriageComposer.Section title="Dados da Empresa">
              <TriageComposer.InfoGrid
                items={[
                  { label: 'Razão Social', value: process.company.legalName },
                  { label: 'Nome Fantasia', value: process.company.tradeName },
                  { label: 'CNPJ', value: process.company.cnpj },
                  { label: 'Situação Cadastral', value: process.company.registrationStatus },
                  { label: 'CNAE', value: process.company.primaryCnae },
                  { label: 'Endereço', value: process.company.address },
                  { label: 'Contatos', value: process.company.contacts },
                ]}
              />
            </TriageComposer.Section>

            <TriageComposer.Section title="Dados do Empreendimento">
              <TriageComposer.InfoGrid
                items={[
                  { label: 'Nome', value: process.establishment.name },
                  { label: 'Endereço', value: process.establishment.address },
                  { label: 'Área construída', value: process.establishment.builtArea },
                  { label: 'Pavimentos', value: process.establishment.floors },
                  { label: 'Altura', value: process.establishment.height },
                  { label: 'Finalidade', value: process.establishment.purpose },
                  { label: 'Ocupação', value: process.establishment.occupation },
                  { label: 'Divisão da ocupação', value: process.establishment.occupationDivision },
                ]}
              />
            </TriageComposer.Section>

            <TriageComposer.Section title="Responsável Técnico">
              <TriageComposer.InfoGrid
                items={[
                  { label: 'Nome', value: process.technicalResponsible.name },
                  { label: 'CPF', value: process.technicalResponsible.cpf },
                  { label: 'Conselho', value: process.technicalResponsible.council },
                  { label: 'Registro', value: process.technicalResponsible.registration },
                  {
                    label: 'Situação do vínculo',
                    value: process.technicalResponsible.relationshipStatus,
                  },
                  { label: 'ART/RRT', value: process.technicalResponsible.artRrt },
                ]}
              />
            </TriageComposer.Section>

            <TriageComposer.Section
              title="Resumo do BRE"
              description="Informações somente para leitura. O Triador não pode alterar a classificação."
            >
              <TriageComposer.InfoGrid
                items={[
                  { label: 'Classificação do risco', value: process.bre.riskClassification },
                  { label: 'Versão do COSCIP', value: process.bre.coscipVersion },
                ]}
              />
              <div className="mt-5">
                <h3 className="font-medium text-sm">Documentos obrigatórios definidos pelo BRE</h3>
                <ul className="mt-2 flex flex-col gap-2 text-muted-foreground text-sm">
                  {process.bre.requiredDocuments.map((document) => (
                    <li key={document} className="flex items-center gap-2">
                      <CheckCheckIcon aria-hidden="true" className="size-4" />
                      {document}
                    </li>
                  ))}
                </ul>
              </div>
            </TriageComposer.Section>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <TriageComposer.Section
            title="Documentos enviados"
            description="Visualize metadados, baixe o arquivo de demonstração ou compare versões anteriores."
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Hash</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {process.documents.map((document) => {
                  const currentVersion = document.versions[0]
                  return (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div className="font-medium">{document.name}</div>
                        <div className="mt-1 text-muted-foreground text-xs">
                          {document.category}
                        </div>
                      </TableCell>
                      <TableCell>{currentVersion.uploadedBy}</TableCell>
                      <TableCell>v{currentVersion.version}</TableCell>
                      <TableCell>{currentVersion.uploadedAt}</TableCell>
                      <TableCell>{currentVersion.size}</TableCell>
                      <TableCell className="font-mono text-xs">{currentVersion.hash}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            currentVersion.status === 'Com inconsistência'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {currentVersion.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Visualizar ${document.name}`}
                            onClick={() => setSelectedDocumentId(document.id)}
                          >
                            <EyeIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Baixar ${document.name}`}
                            onClick={() => downloadTriageDocument(process, document)}
                          >
                            <DownloadIcon />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Comparar versões de ${document.name}`}
                            disabled={document.versions.length < 2}
                            onClick={() => setComparisonDocumentId(document.id)}
                          >
                            <FilesIcon />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TriageComposer.Section>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <DocumentPreview document={selectedDocument} />
            <DocumentComparison document={comparisonDocument} />
          </div>
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          {process.duplicateWarning ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircleIcon aria-hidden="true" />
              <AlertTitle>Possível duplicidade encontrada</AlertTitle>
              <AlertDescription>{process.duplicateWarning}</AlertDescription>
            </Alert>
          ) : null}

          <TriageComposer.Section
            title="Checklist da Triagem"
            description="Aprovar a triagem exige a confirmação de todos os itens administrativos."
            action={
              <Button
                variant="outline"
                size="sm"
                disabled={!isEditable}
                onClick={() => store.completeChecklist(process.id)}
              >
                <ListChecksIcon data-icon="inline-start" />
                Marcar todos como conferidos
              </Button>
            }
          >
            <Progress value={(checklistProgress.completed / checklistProgress.total) * 100}>
              <ProgressLabel>Itens conferidos</ProgressLabel>
              <ProgressValue>
                {() => `${checklistProgress.completed} de ${checklistProgress.total}`}
              </ProgressValue>
            </Progress>

            {!isEditable ? (
              <Alert className="mt-5">
                <AlertCircleIcon aria-hidden="true" />
                <AlertTitle>Checklist somente para leitura</AlertTitle>
                <AlertDescription>
                  {canStart
                    ? 'Inicie a triagem para alterar os itens.'
                    : 'O status atual não permite alterar a conferência administrativa.'}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {checklistGroups.map((group) => (
                <FieldSet key={group.id} className="rounded-xl border p-4">
                  <FieldLegend>{group.title}</FieldLegend>
                  {group.items.map((item) => (
                    <FieldLabel
                      key={item.id}
                      data-disabled={!isEditable}
                      className="cursor-pointer rounded-lg border bg-background p-3 has-data-checked:border-primary/30 has-data-checked:bg-primary/5"
                    >
                      <Field orientation="horizontal">
                        <Checkbox
                          checked={process.checklist[item.id] ?? false}
                          disabled={!isEditable}
                          onCheckedChange={(checked) =>
                            store.setChecklistItem(process.id, item.id, checked === true)
                          }
                        />
                        <FieldContent>
                          <FieldTitle>{item.label}</FieldTitle>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  ))}
                </FieldSet>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Decisão da triagem</p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Aprovar encaminha para distribuição. Exigências devolvem ao Contribuinte.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  disabled={!isEditable}
                  onClick={() => setActiveTab('requirements')}
                >
                  <AlertCircleIcon data-icon="inline-start" />
                  Emitir exigência
                </Button>
                <Button
                  disabled={!isEditable || !checklistComplete}
                  onClick={() => {
                    if (store.approveTriage(process.id)) {
                      setFeedback(
                        'Triagem concluída. O processo foi encaminhado para distribuição.',
                      )
                    }
                  }}
                >
                  <SendIcon data-icon="inline-start" />
                  Aprovar triagem
                </Button>
              </div>
            </div>

            <p className="mt-3 text-muted-foreground text-xs">
              Cancelar triagem não está disponível neste cenário, pois nenhuma regra de cancelamento
              foi satisfeita.
            </p>
          </TriageComposer.Section>
        </TabsContent>

        <TabsContent value="requirements" className="mt-4">
          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
            <TriageComposer.Section
              title="Exigências emitidas"
              description="Histórico de inconsistências exclusivamente administrativas."
            >
              {process.requirements.length ? (
                <div className="flex flex-col gap-4">
                  {process.requirements.map((requirement) => (
                    <article key={requirement.id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium">{requirement.title}</h3>
                          <p className="mt-1 text-muted-foreground text-sm">
                            {requirement.description}
                          </p>
                        </div>
                        <Badge
                          variant={requirement.status === 'Aberta' ? 'destructive' : 'secondary'}
                        >
                          {requirement.status}
                        </Badge>
                      </div>
                      <TriageComposer.InfoGrid
                        items={[
                          { label: 'Documento relacionado', value: requirement.relatedDocument },
                          { label: 'Categoria', value: requirement.category },
                          { label: 'Prazo', value: requirement.deadline },
                          { label: 'Data', value: requirement.date },
                          { label: 'Usuário responsável', value: requirement.responsibleUser },
                          {
                            label: 'Observações',
                            value: requirement.observations || 'Sem observações',
                          },
                        ]}
                      />
                    </article>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground text-sm">
                  Nenhuma exigência administrativa foi emitida para este processo.
                </p>
              )}
            </TriageComposer.Section>

            <TriageComposer.Section
              title="Nova exigência administrativa"
              description="Não inclua análise de engenharia, cálculos, medidas de segurança ou parecer técnico."
            >
              {isEditable ? (
                <RequirementForm
                  documents={process.documents}
                  onSubmit={(draft) => {
                    store.issueRequirement(process.id, draft)
                    setFeedback('Exigência emitida. O processo aguarda correções do Contribuinte.')
                  }}
                />
              ) : (
                <Alert>
                  <AlertCircleIcon aria-hidden="true" />
                  <AlertTitle>Emissão indisponível</AlertTitle>
                  <AlertDescription>
                    Inicie uma triagem ativa para emitir uma nova exigência administrativa.
                  </AlertDescription>
                </Alert>
              )}
            </TriageComposer.Section>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <TriageComposer.Section
            title="Histórico do processo"
            description="Registro completo das ações administrativas e versões recebidas."
          >
            <ol className="flex flex-col gap-0">
              {[...process.history].reverse().map((entry, index, entries) => (
                <li key={entry.id} className="grid grid-cols-[24px_1fr] gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 flex size-6 items-center justify-center rounded-full border bg-background">
                      <HistoryIcon aria-hidden="true" className="size-3" />
                    </span>
                    {index < entries.length - 1 ? (
                      <span className="min-h-12 w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="pb-6">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h3 className="font-medium">{entry.title}</h3>
                      <span className="text-muted-foreground text-xs">{entry.date}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground text-sm">{entry.description}</p>
                    <p className="mt-2 text-xs">Responsável: {entry.user}</p>
                  </div>
                </li>
              ))}
            </ol>
          </TriageComposer.Section>
        </TabsContent>
      </Tabs>
    </TriageComposer.Root>
  )
}

function DocumentPreview({ document }: { document: TriageDocument | undefined }) {
  if (!document) {
    return (
      <TriageComposer.Section title="Visualização rápida">
        <p className="py-8 text-center text-muted-foreground text-sm">
          Selecione um documento para visualizar seus dados.
        </p>
      </TriageComposer.Section>
    )
  }

  const version = document.versions[0]
  return (
    <TriageComposer.Section
      title="Visualização rápida"
      description="Pré-visualização segura do arquivo selecionado."
    >
      <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border bg-muted/30 p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-background shadow-sm">
          <EyeIcon aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-medium">{document.name}</h3>
        <p className="mt-1 text-muted-foreground text-sm">
          {document.format} · versão {version.version} · {version.size}
        </p>
        <p className="mt-3 max-w-md text-muted-foreground text-sm">{version.note}</p>
      </div>
    </TriageComposer.Section>
  )
}

function DocumentComparison({ document }: { document: TriageDocument | undefined }) {
  if (!document || document.versions.length < 2) {
    return (
      <TriageComposer.Section title="Comparação de versões">
        <p className="py-8 text-center text-muted-foreground text-sm">
          Selecione um documento que possua pelo menos duas versões.
        </p>
      </TriageComposer.Section>
    )
  }

  const [current, previous] = document.versions
  if (!previous) {
    return null
  }
  return (
    <TriageComposer.Section
      title="Comparação de versões"
      description={`${document.name} · alterações de metadados e envio`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {[current, previous].map((version) => (
          <div key={version.version} className="rounded-xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium">Versão {version.version}</h3>
              <Badge variant={version.version === current.version ? 'default' : 'outline'}>
                {version.version === current.version ? 'Atual' : 'Anterior'}
              </Badge>
            </div>
            <dl className="mt-4 flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">Data</dt>
                <dd>{version.uploadedAt}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Tamanho</dt>
                <dd>{version.size}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Hash</dt>
                <dd className="break-all font-mono text-xs">{version.hash}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Observação</dt>
                <dd>{version.note}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </TriageComposer.Section>
  )
}
