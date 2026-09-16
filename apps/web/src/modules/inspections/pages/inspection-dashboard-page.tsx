import { Link } from '@tanstack/react-router'

import { Badge } from '@/modules/shared/components/ui/badge'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared/components/ui/table'
import { cn } from '@/modules/shared/lib/utils'
import { InspectionShell } from '../components/inspection-shell'
import { useInspectionStore } from '../lib/inspection-store'

export function InspectionDashboardPage() {
  const { processes } = useInspectionStore()

  return (
    <InspectionShell>
      <header className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="outline">Risco 2</Badge>
          <span className="text-muted-foreground text-sm">Vistoria determinada pela análise</span>
        </div>
        <h1 className="font-semibold text-3xl tracking-tight sm:text-4xl">Fila de vistorias</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground leading-7">
          Agende e registre a verificação presencial dos processos tecnicamente elegíveis.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Vistorias atribuídas</CardTitle>
          <CardDescription>
            Somente processos com decisão técnica de vistoria aparecem nesta fila.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Processo</TableHead>
                <TableHead>Estabelecimento</TableHead>
                <TableHead>Agendamento</TableHead>
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
                  <TableCell>{process.scheduledAt ?? 'Não agendada'}</TableCell>
                  <TableCell>
                    <Badge variant={process.status === 'Aprovada' ? 'default' : 'secondary'}>
                      {process.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/inspections/$processId"
                      params={{ processId: process.id }}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                    >
                      Abrir vistoria
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </InspectionShell>
  )
}
