import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { FilePlus2Icon } from 'lucide-react'

import { listTriagem, type TriagemProcessoItem } from '@/modules/shared/api/triagem'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent } from '@/modules/shared/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/modules/shared/components/ui/empty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/modules/shared/components/ui/table'

import { ContributorShell } from '../components/contributor-shell'
import { MetricCard, ProcessPage, StatusBadge } from '../components/process-page'

const RISK_STYLE: Record<string, string> = {
  I: 'bg-green-100 text-green-700',
  II: 'bg-amber-100 text-amber-700',
  III: 'bg-red-100 text-red-700',
}

function tipoDocumento(p: TriagemProcessoItem): string {
  return p.risco === 'I' ? 'DDLCB' : 'AVCB'
}

function statusBadge(fase: string) {
  if (fase === 'concluido') return <StatusBadge tone="success">Emitido</StatusBadge>
  if (fase === 'aprovado') return <StatusBadge tone="success">Deferido</StatusBadge>
  if (fase === 'reprovado') return <StatusBadge>Indeferido</StatusBadge>
  if (fase === 'protocolado') return <StatusBadge tone="success">Protocolado</StatusBadge>
  if (fase === 'em_exigencia') return <StatusBadge>Em exigência</StatusBadge>
  return <StatusBadge>Aguardando pagamento</StatusBadge>
}

export function DashboardPage() {
  const query = useQuery({ queryKey: ['triagem'], queryFn: listTriagem })
  const processos = query.data?.processos ?? []

  const total = processos.length
  const emAndamento = processos.filter(
    (p) => p.fase === 'aguardando_pagamento' || p.fase === 'em_exigencia',
  ).length
  const emitidos = processos.filter(
    (p) => p.fase === 'concluido' || p.fase === 'protocolado' || p.fase === 'aprovado',
  ).length

  const exigencias = processos.filter((p) => p.fase === 'em_exigencia')
  const decididos = processos.filter((p) => p.fase === 'aprovado' || p.fase === 'reprovado')

  return (
    <ContributorShell title="Visão geral">
      <ProcessPage
        title="Visão geral"
        description="Acompanhe suas solicitações e documentos emitidos."
      >
        <section aria-label="Resumo de processos" className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Processos" value={total} />
          <MetricCard label="Em andamento" value={emAndamento} />
          <MetricCard label="Documentos emitidos" value={emitidos} />
        </section>

        {exigencias.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
            <span>
              <strong>
                {exigencias.length} processo{exigencias.length > 1 ? 's' : ''}
              </strong>{' '}
              com <strong>exigência pendente</strong>. Responda para o processo voltar à análise do
              CBMPE.
            </span>
            <div className="flex flex-wrap gap-2">
              {exigencias.map((p) => (
                <Link
                  key={p.processoId}
                  to="/triagem/$processoId"
                  params={{ processoId: p.processoId }}
                  className={buttonVariants({ size: 'sm', className: 'rounded-md' })}
                >
                  Responder — {p.unidadeNome ?? p.empresaRazaoSocial}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {decididos.length > 0 ? (
          <div className="flex flex-col gap-2 rounded-md border bg-muted/40 p-3 text-sm">
            <span className="font-medium">Decisões do CBMPE</span>
            <div className="flex flex-col gap-1.5">
              {decididos.map((p) => (
                <div key={p.processoId} className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      p.fase === 'aprovado'
                        ? 'rounded bg-green-100 px-2 py-0.5 font-medium text-green-700 text-xs'
                        : 'rounded bg-red-100 px-2 py-0.5 font-medium text-red-700 text-xs'
                    }
                  >
                    {p.fase === 'aprovado' ? 'Deferido' : 'Indeferido'}
                  </span>
                  <span className="flex-1 text-muted-foreground">
                    {p.unidadeNome ?? p.empresaRazaoSocial}
                  </span>
                  {p.fase === 'aprovado' ? (
                    <Link
                      to="/companies/avcb"
                      search={{ processoId: p.processoId }}
                      className={buttonVariants({ size: 'sm', className: 'rounded-md' })}
                    >
                      Baixar AVCB
                    </Link>
                  ) : (
                    <Link
                      to="/triagem/$processoId"
                      params={{ processoId: p.processoId }}
                      className={buttonVariants({
                        variant: 'outline',
                        size: 'sm',
                        className: 'rounded-md',
                      })}
                    >
                      Ver motivo
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {query.isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando processos…</p>
        ) : null}

        {!query.isLoading && total === 0 ? (
          <Card className="rounded-md py-0 shadow-none">
            <CardContent className="p-0">
              <Empty className="min-h-0 gap-2.5 rounded-none border-0 p-4">
                <EmptyHeader className="max-w-none">
                  <EmptyTitle>Nenhum processo encontrado</EmptyTitle>
                  <EmptyDescription>
                    Cadastre uma empresa, crie uma unidade e classifique o risco para emitir a DDLCB
                    (Risco I) ou iniciar um processo AVCB (Risco II/III).
                  </EmptyDescription>
                  <EmptyMedia className="mb-0 size-5">
                    <FilePlus2Icon aria-hidden="true" />
                  </EmptyMedia>
                </EmptyHeader>
                <EmptyContent>
                  <Link
                    to="/companies/units"
                    className={buttonVariants({
                      size: 'lg',
                      className: 'rounded-md px-4 text-[13px]',
                    })}
                  >
                    Ir para Unidades
                  </Link>
                </EmptyContent>
              </Empty>
            </CardContent>
          </Card>
        ) : null}

        {total > 0 ? (
          <Card className="gap-3 rounded-md py-4 shadow-none">
            <CardContent className="overflow-x-auto px-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risco</TableHead>
                    <TableHead>Empresa / unidade</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Protocolo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Ações</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processos.map((p) => (
                    <TableRow
                      key={p.processoId}
                      className={p.fase === 'em_exigencia' ? 'bg-amber-50' : undefined}
                    >
                      <TableCell>
                        <span
                          className={`rounded px-2 py-0.5 font-medium text-xs ${
                            RISK_STYLE[p.risco] ?? 'bg-muted text-muted-foreground'
                          }`}
                        >
                          Risco {p.risco}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{p.empresaRazaoSocial}</span>
                        {p.unidadeNome ? (
                          <span className="text-muted-foreground"> — {p.unidadeNome}</span>
                        ) : null}
                      </TableCell>
                      <TableCell>{tipoDocumento(p)}</TableCell>
                      <TableCell className="tabular-nums">{p.protocoloNumero ?? '—'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {statusBadge(p.fase)}
                          {p.exigenciaSanadaEm ? (
                            <span className="text-emerald-700 text-xs">Exigência sanada</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-max justify-end">
                          <Link
                            to="/triagem/$processoId"
                            params={{ processoId: p.processoId }}
                            className={buttonVariants({
                              variant: p.fase === 'em_exigencia' ? 'default' : 'outline',
                              className: 'rounded-md px-4 text-[13px]',
                            })}
                          >
                            {p.fase === 'em_exigencia' ? 'Responder' : 'Ver'}
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : null}
      </ProcessPage>
    </ContributorShell>
  )
}
