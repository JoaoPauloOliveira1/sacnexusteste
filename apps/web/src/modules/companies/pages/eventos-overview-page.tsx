import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, CalendarPlusIcon } from 'lucide-react'

import { type EventoSummary, listEventos } from '@/modules/shared/api/evento'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent } from '@/modules/shared/components/ui/card'
import { cn } from '@/modules/shared/lib/utils'

const RISK_STYLE: Record<string, string> = {
  II: 'bg-amber-100 text-amber-700',
  III: 'bg-red-100 text-red-700',
}

const FASE_LABEL: Record<string, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  protocolado: 'Protocolado',
  em_exigencia: 'Em exigência',
  aprovado: 'Deferido',
  reprovado: 'Indeferido',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

export function EventosOverviewPage() {
  const navigate = useNavigate()
  const query = useQuery({ queryKey: ['eventos'], queryFn: listEventos })

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Início
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Eventos temporários</h1>
          <p className="text-muted-foreground">
            Fluxo separado, sem unidade — só endereço e período. Sempre Risco II/III, duração de até
            6 meses. Qualquer pessoa pode solicitar.
          </p>
        </header>

        <div>
          <Link
            to="/companies/eventos/new"
            className={cn(buttonVariants({ className: 'rounded-md' }))}
          >
            <CalendarPlusIcon data-icon="inline-start" />
            Cadastrar evento
          </Link>
        </div>

        {query.isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando eventos…</p>
        ) : null}
        {query.isError ? (
          <p className="text-destructive text-sm">{(query.error as Error).message}</p>
        ) : null}

        {query.data && query.data.eventos.length === 0 ? (
          <Card className="rounded-md shadow-none">
            <CardContent className="px-5 py-6 text-center text-muted-foreground text-sm">
              Nenhum evento temporário cadastrado.
            </CardContent>
          </Card>
        ) : null}

        {query.data && query.data.eventos.length > 0 ? (
          <div className="flex flex-col gap-2">
            {query.data.eventos.map((ev) => (
              <EventoRow key={ev.id} evento={ev} onNavigate={navigate} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}

function EventoRow({
  evento,
  onNavigate,
}: {
  evento: EventoSummary
  onNavigate: ReturnType<typeof useNavigate>
}) {
  const local = [evento.municipio, evento.uf].filter(Boolean).join(' / ')
  const periodo = `${formatDate(evento.inicioEm)}–${formatDate(evento.terminoEm)}`
  const proc = evento.processo

  let action = (
    <Button
      type="button"
      size="sm"
      onClick={() =>
        void onNavigate({
          to: '/companies/processo',
          search: { eventoId: evento.id, risco: evento.risco ?? 'II' },
        })
      }
    >
      Iniciar processo
    </Button>
  )
  if (proc && proc.fase === 'aguardando_pagamento') {
    action = (
      <Button
        type="button"
        size="sm"
        onClick={() =>
          void onNavigate({
            to: '/companies/processo',
            search: { eventoId: evento.id, risco: evento.risco ?? 'II' },
          })
        }
      >
        Continuar processo
      </Button>
    )
  } else if (proc) {
    action = (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          void onNavigate({ to: '/triagem/$processoId', params: { processoId: proc.id } })
        }
      >
        Ver processo
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border bg-background p-3 text-sm">
      <span className="min-w-40 flex-1">
        <span className="font-medium">{evento.nome ?? 'Evento'}</span>
        <span className="text-muted-foreground">
          {' '}
          — {[local, periodo].filter(Boolean).join(', ')}
        </span>
      </span>
      {evento.risco ? (
        <span
          className={cn(
            'rounded px-2 py-0.5 font-medium text-xs',
            RISK_STYLE[evento.risco] ?? 'bg-muted text-muted-foreground',
          )}
        >
          Risco {evento.risco}
        </span>
      ) : null}
      {proc ? (
        <span className="text-muted-foreground text-xs">
          · {FASE_LABEL[proc.fase] ?? proc.fase}
        </span>
      ) : null}
      {action}
    </div>
  )
}
