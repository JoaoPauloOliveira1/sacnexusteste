import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react'

import { avcbPdfUrl, getProcessoDossie, type ProcessoDossie } from '@/modules/shared/api/triagem'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { formatCnpj } from '@/modules/shared/lib/formatters/format-cnpj'
import { cn } from '@/modules/shared/lib/utils'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}

function addOneYear(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  d.setFullYear(d.getFullYear() + 1)
  return d.toLocaleDateString('pt-BR')
}

export function AvcbCertificatePage({ processoId }: { processoId: string }) {
  const query = useQuery({
    queryKey: ['triagem', processoId],
    queryFn: () => getProcessoDossie(processoId),
    enabled: Boolean(processoId),
    retry: false,
  })
  const dossie = query.data
  const aprovado = dossie?.processo.fase === 'aprovado'

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/dashboard"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Voltar
          </Link>
          {aprovado ? (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => window.open(avcbPdfUrl(processoId), '_blank', 'noopener')}
              >
                <PrinterIcon data-icon="inline-start" />
                Baixar PDF
              </Button>
              <Button type="button" variant="outline" onClick={() => window.print()}>
                Imprimir
              </Button>
            </div>
          ) : null}
        </div>

        {query.isLoading ? <p className="text-muted-foreground text-sm">Carregando…</p> : null}
        {query.isError ? (
          <p className="text-destructive text-sm">{(query.error as Error).message}</p>
        ) : null}

        {dossie && !aprovado ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
            O AVCB só está disponível após o <strong>deferimento</strong> do processo pelo CBMPE.
            Situação atual: <strong>{dossie.processo.fase}</strong>.
          </div>
        ) : null}

        {dossie && aprovado ? <AvcbDeclaration dossie={dossie} /> : null}
      </div>
    </main>
  )
}

function AvcbDeclaration({ dossie }: { dossie: ProcessoDossie }) {
  const { processo, empresa, unidade, historico } = dossie
  const decisao = historico.find((h) => h.acao === 'decisao')
  const deferidoEm = decisao?.createdAt ?? null
  const banda = processo.risco === 'III' ? 'projeto' : 'vistoria'

  return (
    <article className="flex flex-col gap-6 rounded-md border bg-background p-8 text-sm leading-relaxed shadow-none">
      <header className="flex flex-col items-center gap-1 border-b pb-4 text-center">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          Corpo de Bombeiros Militar de Pernambuco
        </p>
        <h1 className="font-semibold text-xl">Auto de Vistoria do Corpo de Bombeiros (AVCB)</h1>
        <p className="text-muted-foreground text-xs">
          Risco {processo.risco} — modalidade {banda} · Decreto Estadual nº 61.082/2026
        </p>
      </header>

      <div className="flex flex-wrap justify-between gap-2 text-xs">
        <span>
          <span className="text-muted-foreground">Protocolo: </span>
          <span className="font-medium tabular-nums">{processo.protocoloNumero ?? '—'}</span>
        </span>
        <span>
          <span className="text-muted-foreground">Deferido em: </span>
          <span className="font-medium">{formatDate(deferidoEm)}</span>
        </span>
        <span>
          <span className="text-muted-foreground">Válido até: </span>
          <span className="font-medium">{addOneYear(deferidoEm)}</span>
        </span>
      </div>

      <p>
        Certifica-se que a unidade abaixo identificada foi <strong>vistoriada e aprovada</strong>{' '}
        pelo Corpo de Bombeiros Militar de Pernambuco, atendendo às exigências de segurança contra
        incêndio e pânico aplicáveis à sua classificação de <strong>Risco {processo.risco}</strong>,
        conforme o Decreto Estadual nº 61.082/2026.
      </p>

      <section className="grid gap-3 rounded-md bg-muted/40 p-4 sm:grid-cols-2">
        <Field label="Empresa" value={empresa?.razaoSocial ?? '—'} />
        <Field label="CNPJ" value={empresa ? formatCnpj(empresa.cnpj) : '—'} />
        <Field label="Unidade" value={unidade?.nome ?? '—'} />
        <Field
          label="Área construída"
          value={unidade?.areaConstruida ? `${unidade.areaConstruida} m²` : '—'}
        />
        <Field label="Endereço" value={unidade?.endereco ?? '—'} className="sm:col-span-2" />
      </section>

      <footer className="border-t pt-4 text-muted-foreground text-xs">
        <p>
          Documento gerado pelo SAC Nexus. Válido por 1 ano a partir do deferimento, enquanto a
          unidade mantiver as condições vistoriadas. Este documento é orientativo e não substitui o
          AVCB oficial emitido pelo CBMPE.
        </p>
      </footer>
    </article>
  )
}

function Field({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string | undefined
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
