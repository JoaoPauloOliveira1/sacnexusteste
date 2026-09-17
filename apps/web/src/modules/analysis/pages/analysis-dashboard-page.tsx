import { Link } from '@tanstack/react-router'
import { CheckCircle2Icon, Clock3Icon, FileSearchIcon } from 'lucide-react'

import { Badge } from '@/modules/shared/components/ui/badge'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared/components/ui/table'
import { cn } from '@/modules/shared/lib/utils'
import { AnalysisComposer } from '../components/analysis-composer'
import { useAnalysisStore } from '../lib/analysis-store'

export function AnalysisDashboardPage() {
  const { processes } = useAnalysisStore()
  const pending = processes.filter((process) => process.status === 'Aguardando análise').length
  const active = processes.filter((process) => process.status === 'Em análise').length
  const completed = processes.filter((process) => process.status === 'Análise concluída').length

  return (
    <AnalysisComposer.Root>
      <AnalysisComposer.PageHeader
        title="Revisão técnica da triagem"
        description="Como triador, avalie os documentos e as condições do estabelecimento para decidir o prosseguimento do processo."
      >
        <Badge variant="outline">Risco 2</Badge>
        <span className="text-muted-foreground text-sm">Atualizado em 28/07/2026 às 15:18</span>
      </AnalysisComposer.PageHeader>

      <section aria-label="Indicadores da revisão técnica" className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Aguardando revisão',
            value: pending,
            description: 'Processos distribuídos e ainda não assumidos',
            icon: Clock3Icon,
          },
          {
            label: 'Em revisão',
            value: active,
            description: 'Avaliações técnicas em andamento',
            icon: FileSearchIcon,
          },
          {
            label: 'Concluídos',
            value: completed,
            description: 'Decisões técnicas registradas',
            icon: CheckCircle2Icon,
          },
        ].map(({ label, value, description, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-3">
              <div>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="mt-1 text-2xl">{value}</CardTitle>
                <p className="mt-2 text-muted-foreground text-xs">{description}</p>
              </div>
              <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </CardHeader>
          </Card>
        ))}
      </section>

      <div className="mt-8">
        <AnalysisComposer.Section
          title="Processos para revisão técnica"
          description="A mesma pessoa responsável pela triagem administrativa decide a necessidade de vistoria."
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processo</TableHead>
                <TableHead>Empresa / Estabelecimento</TableHead>
                <TableHead>Enquadramento</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process) => (
                <TableRow key={process.id}>
                  <TableCell>
                    <div className="font-medium">{process.processNumber}</div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {process.protocolNumber}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-96 whitespace-normal">
                    <div className="font-medium">{process.companyName}</div>
                    <div className="mt-1 text-muted-foreground text-xs">
                      {process.establishmentName}
                    </div>
                  </TableCell>
                  <TableCell>{process.risk}</TableCell>
                  <TableCell>
                    <AnalysisComposer.StatusBadge status={process.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/analysis/$processId"
                      params={{ processId: process.id }}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      Abrir análise
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AnalysisComposer.Section>
      </div>
    </AnalysisComposer.Root>
  )
}
