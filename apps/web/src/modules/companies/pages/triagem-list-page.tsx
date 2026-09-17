import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, CheckCircle2Icon, MapIcon, MessageCircleIcon } from 'lucide-react'

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
  em_vistoria: 'Em vistoria',
  aprovado: 'Deferido',
  reprovado: 'Indeferido',
  concluido: 'Concluído (DDLCB)',
  documentos: 'Documentos',
}

type TriagemProc = { fase: string; createdAt: string }

function computeIndicadores(processos: TriagemProc[]) {
  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const dia = startOfToday.getTime()
  const semana = now - 7 * 24 * 60 * 60 * 1000
  const mes = now - 30 * 24 * 60 * 60 * 1000

  let fila = 0
  let emVistoria = 0
  let deferidos = 0
  let indeferidos = 0
  let hoje = 0
  let ultimaSemana = 0
  let ultimoMes = 0
  for (const p of processos) {
    if (p.fase === 'protocolado' || p.fase === 'em_exigencia') fila += 1
    if (p.fase === 'em_vistoria') emVistoria += 1
    if (p.fase === 'aprovado') deferidos += 1
    if (p.fase === 'reprovado') indeferidos += 1
    const t = new Date(p.createdAt).getTime()
    if (!Number.isNaN(t)) {
      if (t >= dia) hoje += 1
      if (t >= semana) ultimaSemana += 1
      if (t >= mes) ultimoMes += 1
    }
  }
  return { fila, emVistoria, deferidos, indeferidos, hoje, ultimaSemana, ultimoMes }
}

function Indicador({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="flex flex-col rounded-md border bg-background p-3">
      <span className={cn('font-semibold text-2xl tabular-nums', tone)}>{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}

function IndicadoresPanel({ processos }: { processos: TriagemProc[] }) {
  const ind = computeIndicadores(processos)
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Indicador label="Na fila (a decidir)" value={ind.fila} tone="text-primary" />
        <Indicador label="Em vistoria" value={ind.emVistoria} />
        <Indicador label="Deferidos" value={ind.deferidos} tone="text-green-700" />
        <Indicador label="Indeferidos" value={ind.indeferidos} tone="text-red-700" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Indicador label="Novos hoje" value={ind.hoje} />
        <Indicador label="Últimos 7 dias" value={ind.ultimaSemana} />
        <Indicador label="Últimos 30 dias" value={ind.ultimoMes} />
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

export function TriagemListPage() {
  const { session } = useDemoSession()
  const perfil = session?.profile.type
  const isTriador = perfil === 'triager' || perfil === 'admin'
  const query = useQuery({
    queryKey: ['triagem'],
    queryFn: listTriagem,
    refetchInterval: isTriador ? 10_000 : false,
  })

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <nav className="flex items-center gap-1" aria-label="Navegação da triagem">
            <Link
              to="/dashboard"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              Início
            </Link>
            <Link
              to="/map"
              className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
            >
              <MapIcon data-icon="inline-start" />
              Mapa
            </Link>
          </nav>
          <PersonaMenu />
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Triagem — CBMPE</h1>
          <p className="text-muted-foreground">
            Processos protocolados e emitidos, com o contexto de classificação, documentos e
            pagamento. Clique em um processo para ver o dossiê completo.
          </p>
        </header>

        {!isTriador ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900 text-sm">
            Esta é a área de triagem do CBMPE. Para <strong>registrar exigências</strong> e revisar
            dados e documentos, entre com o perfil <strong>Triador</strong>. Como contribuinte, você
            acompanha e responde aos seus processos pelo <strong>Início</strong>.
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
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3" aria-label="Visão geral da triagem">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium text-sm">Visão geral</h2>
                <Link
                  to="/map"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-fit')}
                >
                  <MapIcon data-icon="inline-start" />
                  Mapa de Pernambuco
                </Link>
              </div>
              <IndicadoresPanel processos={query.data.processos} />
            </section>
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
                  {isTriador && p.exigenciaRespondidaEm ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs">
                      <CheckCircle2Icon className="size-3.5" />
                      Exigência respondida
                    </span>
                  ) : null}
                  {isTriador && p.exigenciaSanadaEm ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs">
                      <CheckCircle2Icon className="size-3.5" />
                      Exigência sanada
                    </span>
                  ) : null}
                  {isTriador && p.mensagensNaoLidasTriador > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded bg-primary/8 px-1.5 py-0.5 font-medium text-primary text-xs">
                      <MessageCircleIcon className="size-3.5" />
                      {p.mensagensNaoLidasTriador} nova{p.mensagensNaoLidasTriador > 1 ? 's' : ''}
                    </span>
                  ) : null}
                  {p.protocoloNumero ? (
                    <span className="font-medium text-xs tabular-nums">{p.protocoloNumero}</span>
                  ) : null}
                  <span className="text-muted-foreground text-xs">{formatDate(p.createdAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
