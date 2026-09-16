import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { useDemoSession } from '@/modules/auth'
import { listTriagem } from '@/modules/shared/api/triagem'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent } from '@/modules/shared/components/ui/card'
import { cn } from '@/modules/shared/lib/utils'
import { PersonaMenu } from '../components/persona-menu'

const RISK_STYLE: Record<string, string> = {
  I: 'bg-green-100 text-green-700',
  II: 'bg-amber-100 text-amber-700',
  III: 'bg-red-100 text-red-700',
}

const FASE_LABEL: Record<string, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  protocolado: 'Protocolado',
  em_exigencia: 'Em exigência',
  aprovado: 'Deferido',
  reprovado: 'Indeferido',
  concluido: 'Concluído (DDLCB)',
  documentos: 'Documentos',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

export function TriagemListPage() {
  const { session } = useDemoSession()
  const perfil = session?.profile.type
  const isAnalista = perfil === 'triager' || perfil === 'analyst' || perfil === 'admin'
  const query = useQuery({ queryKey: ['triagem'], queryFn: listTriagem })

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Início
          </Link>
          <PersonaMenu />
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Triagem — CBMPE</h1>
          <p className="text-muted-foreground">
            Processos protocolados e emitidos, com o contexto de classificação, documentos e
            pagamento. Clique em um processo para ver o dossiê completo.
          </p>
        </header>

        {!isAnalista ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
            Esta é a área de análise do CBMPE. Para <strong>registrar exigências</strong> e agir
            como analista, entre com o perfil <strong>Triador</strong> (ou Analista). Como
            contribuinte, você acompanha e responde aos seus processos pelo <strong>Início</strong>.
          </div>
        ) : null}

        {query.isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando processos…</p>
        ) : null}
        {query.isError ? (
          <p className="text-destructive text-sm">{(query.error as Error).message}</p>
        ) : null}

        {query.data && query.data.processos.length === 0 ? (
          <Card className="rounded-md shadow-none">
            <CardContent className="px-5 py-6 text-center text-muted-foreground text-sm">
              Nenhum processo ainda. Classifique unidades e emita DDLCB / inicie processos AVCB para
              vê-los aqui.
            </CardContent>
          </Card>
        ) : null}

        {query.data && query.data.processos.length > 0 ? (
          <div className="flex flex-col gap-2">
            {query.data.processos.map((p) => (
              <Link
                key={p.processoId}
                to="/triagem/$processoId"
                params={{ processoId: p.processoId }}
                className="flex flex-wrap items-center gap-3 rounded-md border bg-background p-3 text-sm hover:bg-accent/40"
              >
                <span
                  className={cn(
                    'rounded px-2 py-0.5 font-medium text-xs',
                    RISK_STYLE[p.risco] ?? 'bg-muted text-muted-foreground',
                  )}
                >
                  Risco {p.risco}
                </span>
                <span className="min-w-40 flex-1">
                  <span className="font-medium">{p.empresaRazaoSocial}</span>
                  {p.unidadeNome ? (
                    <span className="text-muted-foreground"> — {p.unidadeNome}</span>
                  ) : null}
                </span>
                <span className="text-muted-foreground text-xs">
                  {FASE_LABEL[p.fase] ?? p.fase}
                </span>
                {p.protocoloNumero ? (
                  <span className="font-medium text-xs tabular-nums">{p.protocoloNumero}</span>
                ) : null}
                <span className="text-muted-foreground text-xs">{formatDate(p.createdAt)}</span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}
