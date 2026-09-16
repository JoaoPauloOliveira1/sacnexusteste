import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, Building2Icon, PlusIcon } from 'lucide-react'

import {
  type EmpresaListItem,
  listEmpresas,
  listUnidadeCnaes,
  listUnidades,
  type UnidadeSummary,
} from '@/modules/shared/api/unidade'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { formatCnpj } from '@/modules/shared/lib/formatters/format-cnpj'
import { cn } from '@/modules/shared/lib/utils'

const BAND_RANK: Record<string, number> = { I: 0, undetermined: 1, II: 2, III: 3 }

const RISK_STYLE: Record<string, string> = {
  I: 'bg-green-100 text-green-700',
  II: 'bg-amber-100 text-amber-700',
  III: 'bg-red-100 text-red-700',
  undetermined: 'bg-muted text-muted-foreground',
}

const FASE_LABEL: Record<string, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  protocolado: 'Protocolado',
  em_exigencia: 'Em exigência',
  aprovado: 'Deferido',
  reprovado: 'Indeferido',
  concluido: 'Emitido (DDLCB)',
}

export function UnitsOverviewPage() {
  const empresasQuery = useQuery({ queryKey: ['empresas'], queryFn: listEmpresas })

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <Link
          to="/dashboard"
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Unidades</h1>
          <p className="text-muted-foreground">
            A unidade é o objeto do processo. Escolha uma empresa cadastrada para cadastrar uma nova
            unidade, ver as existentes e classificar o risco.
          </p>
        </header>

        {empresasQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando empresas…</p>
        ) : null}
        {empresasQuery.isError ? (
          <p className="text-destructive text-sm">{(empresasQuery.error as Error).message}</p>
        ) : null}

        {empresasQuery.data && empresasQuery.data.empresas.length === 0 ? (
          <Card className="gap-4 rounded-md py-5 shadow-none">
            <CardContent className="flex flex-col items-center gap-3 px-5 py-6 text-center">
              <Building2Icon className="size-8 text-muted-foreground" />
              <p className="text-sm">
                Nenhuma empresa cadastrada ainda. Cadastre uma empresa (por CNPJ) para depois criar
                unidades.
              </p>
              <Link
                to="/companies/new"
                search={{ returnTo: 'request' }}
                className={cn(buttonVariants({ variant: 'default' }))}
              >
                <PlusIcon data-icon="inline-start" />
                Cadastrar empresa
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {empresasQuery.data?.empresas.map((empresa) => (
          <EmpresaCard key={empresa.empresaId} empresa={empresa} />
        ))}
      </div>
    </main>
  )
}

function EmpresaCard({ empresa }: { empresa: EmpresaListItem }) {
  const navigate = useNavigate()
  const unidadesQuery = useQuery({
    queryKey: ['unidades', empresa.empresaId],
    queryFn: () => listUnidades(empresa.empresaId),
  })

  async function classify(unidadeId: string) {
    try {
      const { cnaes } = await listUnidadeCnaes(unidadeId)
      const top = [...cnaes].sort((a, b) => (BAND_RANK[b.band] ?? 0) - (BAND_RANK[a.band] ?? 0))[0]
      void navigate({
        to: '/classifier',
        search: top ? { atividade: top.codigo, unidadeId } : { unidadeId },
      })
    } catch {
      void navigate({ to: '/classifier', search: { unidadeId } })
    }
  }

  const local = [empresa.municipio, empresa.uf].filter(Boolean).join(' / ')

  return (
    <Card className="gap-4 rounded-md py-5 shadow-none">
      <CardHeader className="px-5">
        <CardTitle className="flex flex-col gap-0.5">
          <span>{empresa.nomeFantasia || empresa.razaoSocial}</span>
          <span className="font-normal text-muted-foreground text-xs">
            {formatCnpj(empresa.cnpj)}
            {local ? ` · ${local}` : ''} · {empresa.cnaeCount} CNAE(s) · {empresa.unidadeCount}{' '}
            unidade(s)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-5">
        {unidadesQuery.isLoading ? (
          <p className="text-muted-foreground text-sm">Carregando unidades…</p>
        ) : unidadesQuery.data && unidadesQuery.data.unidades.length > 0 ? (
          <div className="flex flex-col gap-1.5">
            {unidadesQuery.data.unidades.map((unidade) => (
              <UnidadeRow
                key={unidade.id}
                unidade={unidade}
                onClassify={() => void classify(unidade.id)}
                onNavigate={navigate}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhuma unidade cadastrada nesta empresa.</p>
        )}

        <div>
          <Button
            type="button"
            onClick={() =>
              void navigate({ to: '/companies/unit', search: { empresaId: empresa.empresaId } })
            }
          >
            <PlusIcon data-icon="inline-start" />
            Cadastrar unidade
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function UnidadeRow({
  unidade,
  onClassify,
  onNavigate,
}: {
  unidade: UnidadeSummary
  onClassify: () => void
  onNavigate: ReturnType<typeof useNavigate>
}) {
  const local = [unidade.municipio, unidade.uf].filter(Boolean).join(' / ')
  const meta = [local, unidade.areaConstruida ? `${unidade.areaConstruida} m²` : '']
    .filter(Boolean)
    .join(', ')
  const proc = unidade.processo
  const risco = unidade.riscoAtual
  const incompleta = !unidade.completa

  const completar = (
    <Button
      type="button"
      size="sm"
      onClick={() =>
        void onNavigate({ to: '/companies/unit-edit', search: { unidadeId: unidade.id } })
      }
    >
      Completar cadastro
    </Button>
  )

  let action = incompleta ? (
    completar
  ) : (
    <Button type="button" size="sm" onClick={onClassify}>
      Classificar
    </Button>
  )
  if (incompleta) {
    // Nothing else — the unit must be completed before classifying.
  } else if (proc && proc.fase === 'aguardando_pagamento') {
    action = (
      <Button
        type="button"
        size="sm"
        onClick={() =>
          void onNavigate({
            to: '/companies/processo',
            search: { unidadeId: unidade.id, risco: proc.risco },
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
  } else if (risco === 'I') {
    action = (
      <Button
        type="button"
        size="sm"
        onClick={() =>
          void onNavigate({ to: '/companies/ddlcb', search: { unidadeId: unidade.id } })
        }
      >
        Emitir DDLCB
      </Button>
    )
  } else if (risco === 'II' || risco === 'III') {
    action = (
      <Button
        type="button"
        size="sm"
        onClick={() =>
          void onNavigate({
            to: '/companies/processo',
            search: { unidadeId: unidade.id, risco },
          })
        }
      >
        Iniciar processo AVCB
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border p-2.5 text-sm">
      <span className="min-w-40 flex-1">
        <span className="font-medium">{unidade.nome ?? 'Unidade'}</span>
        {unidade.isMatriz ? (
          <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 font-medium text-primary text-xs">
            Matriz
          </span>
        ) : null}
        {meta ? <span className="text-muted-foreground"> — {meta}</span> : null}
      </span>
      <span className="flex items-center gap-2">
        {incompleta ? (
          <span className="rounded bg-amber-100 px-2 py-0.5 font-medium text-amber-700 text-xs">
            cadastro incompleto
          </span>
        ) : risco ? (
          <span
            className={cn(
              'rounded px-2 py-0.5 font-medium text-xs',
              RISK_STYLE[risco] ?? 'bg-muted text-muted-foreground',
            )}
          >
            Risco {risco}
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">não classificada</span>
        )}
        {proc ? (
          <span className="text-muted-foreground text-xs">
            · {FASE_LABEL[proc.fase] ?? proc.fase}
          </span>
        ) : null}
      </span>
      {action}
      {!incompleta ? (
        <button
          type="button"
          className="text-muted-foreground text-xs underline"
          onClick={() =>
            void onNavigate({ to: '/companies/unit-edit', search: { unidadeId: unidade.id } })
          }
        >
          editar
        </button>
      ) : null}
      {risco && !proc && !incompleta ? (
        <button
          type="button"
          className="text-muted-foreground text-xs underline"
          onClick={onClassify}
        >
          reclassificar
        </button>
      ) : null}
    </div>
  )
}
