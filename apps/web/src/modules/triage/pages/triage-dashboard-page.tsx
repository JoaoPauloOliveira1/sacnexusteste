import { Link } from '@tanstack/react-router'
import {
  BadgeCheckIcon,
  CircleGaugeIcon,
  ClipboardClockIcon,
  Clock3Icon,
  FileWarningIcon,
  RotateCcwIcon,
  SearchIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/modules/shared/components/ui/badge'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import { Input } from '@/modules/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared/components/ui/table'
import { cn } from '@/modules/shared/lib/utils'
import { TriageComposer } from '../components/triage-composer'
import { isProcessInActiveQueue } from '../lib/triage-data'
import { useTriageStore } from '../lib/triage-store'
import { type TriagePriority, type TriageStatus } from '../types'

const statusOptions: ReadonlyArray<TriageStatus | 'Todos'> = [
  'Todos',
  'Protocolado',
  'Em Triagem',
  'Correções Recebidas',
  'Em Nova Triagem',
  'Aguardando Correções',
  'Encaminhado para Distribuição',
]

const priorityOptions: ReadonlyArray<TriagePriority | 'Todas'> = [
  'Todas',
  'Alta',
  'Normal',
  'Baixa',
]

const priorityOrder: Record<TriagePriority, number> = { Alta: 0, Normal: 1, Baixa: 2 }

export function TriageDashboardPage() {
  const { processes } = useTriageStore()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<TriageStatus | 'Todos'>('Todos')
  const [priority, setPriority] = useState<TriagePriority | 'Todas'>('Todas')

  const metrics = useMemo(() => {
    const requirements = processes.flatMap((process) => process.requirements)
    return {
      awaiting: processes.filter(isProcessInActiveQueue).length,
      triagedToday: processes.filter((process) =>
        ['Aguardando Correções', 'Encaminhado para Distribuição'].includes(process.status),
      ).length,
      requirements: requirements.length,
      approved: processes.filter((process) => process.status === 'Encaminhado para Distribuição')
        .length,
      returned: processes.filter((process) => process.status === 'Aguardando Correções').length,
    }
  }, [processes])

  const filteredProcesses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
    return [...processes]
      .filter((process) => status === 'Todos' || process.status === status)
      .filter((process) => priority === 'Todas' || process.priority === priority)
      .filter(
        (process) =>
          !normalizedQuery ||
          [
            process.processNumber,
            process.protocolNumber,
            process.company.legalName,
            process.establishment.name,
            process.contributor,
          ].some((value) => value.toLocaleLowerCase('pt-BR').includes(normalizedQuery)),
      )
      .sort((left, right) => priorityOrder[left.priority] - priorityOrder[right.priority])
  }, [priority, processes, query, status])

  return (
    <TriageComposer.Root>
      <TriageComposer.PageHeader
        title="Painel de Triagem"
        description="Conferência administrativa e documental dos processos antes da distribuição para análise técnica."
      >
        <TriageComposer.StatusBadge status="Em Triagem" />
        <Badge variant="outline">Risco 2</Badge>
        <span className="text-muted-foreground text-sm">Atualizado em 20/07/2026 às 10:18</span>
      </TriageComposer.PageHeader>

      <section
        aria-label="Indicadores da triagem"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <TriageComposer.Metric
          label="Aguardando triagem"
          value={String(metrics.awaiting)}
          description="Processos ativos na fila administrativa"
          icon={ClipboardClockIcon}
        />
        <TriageComposer.Metric
          label="Triados hoje"
          value={String(metrics.triagedToday)}
          description={`${metrics.approved} aprovados · ${metrics.returned} devolvidos`}
          icon={BadgeCheckIcon}
        />
        <TriageComposer.Metric
          label="Tempo médio"
          value="22 min"
          description="Por processo concluído no dia"
          icon={Clock3Icon}
        />
        <TriageComposer.Metric
          label="SLA da triagem"
          value="88%"
          description="Meta operacional: 90%"
          icon={CircleGaugeIcon}
        />
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TriageComposer.Metric
          label="Exigências emitidas"
          value={String(metrics.requirements)}
          description="Exclusivamente documentais ou cadastrais"
          icon={FileWarningIcon}
        />
        <TriageComposer.Metric
          label="Processos em retorno"
          value={String(metrics.returned)}
          description="Aguardando correções do Contribuinte"
          icon={RotateCcwIcon}
        />
      </div>

      <div className="mt-8">
        <TriageComposer.Section
          title="Fila por prioridade"
          description="Os processos de prioridade alta aparecem primeiro. Use os filtros para localizar um protocolo."
        >
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_180px]">
            <label htmlFor="triage-search" className="relative block">
              <span className="sr-only">Buscar processo</span>
              <SearchIcon
                aria-hidden="true"
                className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="triage-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por processo, empresa ou empreendimento"
                className="pl-9"
              />
            </label>

            <Select
              value={status}
              onValueChange={(value) => setStatus((value ?? 'Todos') as TriageStatus | 'Todos')}
            >
              <SelectTrigger className="w-full" aria-label="Filtrar por situação">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={priority}
              onValueChange={(value) => setPriority((value ?? 'Todas') as TriagePriority | 'Todas')}
            >
              <SelectTrigger className="w-full" aria-label="Filtrar por prioridade">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === 'Todas' ? 'Todas as prioridades' : option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processo</TableHead>
                <TableHead>Empresa / Empreendimento</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Espera</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcesses.map((process) => (
                <TableRow key={process.id}>
                  <TableCell>
                    <div className="font-medium">{process.processNumber}</div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {process.protocolNumber}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-88 whitespace-normal">
                    <div className="font-medium">{process.company.tradeName}</div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {process.establishment.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TriageComposer.StatusBadge status={process.status} />
                  </TableCell>
                  <TableCell>
                    <TriageComposer.PriorityBadge priority={process.priority} />
                  </TableCell>
                  <TableCell>{process.averageWait}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/triage/$processId"
                      params={{ processId: process.id }}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      Abrir processo
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProcesses.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground text-sm">
              Nenhum processo corresponde aos filtros selecionados.
            </p>
          ) : null}
        </TriageComposer.Section>
      </div>
    </TriageComposer.Root>
  )
}
