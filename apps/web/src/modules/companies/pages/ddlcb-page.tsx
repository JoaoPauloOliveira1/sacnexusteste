import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon, PrinterIcon } from 'lucide-react'

import { type DdlcbDocument, ddlcbPdfUrl, emitDdlcb } from '@/modules/shared/api/ddlcb'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { formatCnpj } from '@/modules/shared/lib/formatters/format-cnpj'
import { cn } from '@/modules/shared/lib/utils'

function formatDate(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString('pt-BR')
}

export function DdlcbPage({ unidadeId }: { unidadeId: string }) {
  const query = useQuery({
    queryKey: ['ddlcb', unidadeId],
    queryFn: () => emitDdlcb(unidadeId),
    enabled: Boolean(unidadeId),
    retry: false,
  })

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between print:hidden">
          <Link
            to="/companies/units"
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Voltar
          </Link>
          {query.data ? (
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => window.open(ddlcbPdfUrl(unidadeId), '_blank', 'noopener')}
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

        {query.isLoading ? (
          <p className="text-muted-foreground text-sm">Emitindo a declaração…</p>
        ) : null}
        {query.isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">Não foi possível emitir a DDLCB</p>
            <p className="text-muted-foreground">{(query.error as Error).message}</p>
          </div>
        ) : null}

        {query.data ? <DdlcbDeclaration doc={query.data} /> : null}
      </div>
    </main>
  )
}

function DdlcbDeclaration({ doc }: { doc: DdlcbDocument }) {
  return (
    <article className="flex flex-col gap-6 rounded-md border bg-background p-8 text-sm leading-relaxed shadow-none">
      <header className="flex flex-col items-center gap-1 border-b pb-4 text-center">
        <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
          Corpo de Bombeiros Militar de Pernambuco
        </p>
        <h1 className="font-semibold text-xl">Declaração de Dispensa de Licenciamento (DDLCB)</h1>
        <p className="text-muted-foreground text-xs">
          Decreto Estadual nº 61.082/2026 — atividade classificada como Risco I
        </p>
      </header>

      <div className="flex flex-wrap justify-between gap-2 text-xs">
        <span>
          <span className="text-muted-foreground">Número: </span>
          <span className="font-medium tabular-nums">{doc.numero}</span>
        </span>
        <span>
          <span className="text-muted-foreground">Emitida em: </span>
          <span className="font-medium">{formatDate(doc.emitidoEm)}</span>
        </span>
      </div>

      <p>
        Declara-se, para os devidos fins, que o estabelecimento abaixo identificado exerce
        atividade(s) econômica(s) enquadrada(s) como <strong>Risco I</strong> segundo o Decreto
        Estadual nº 61.082/2026 e, portanto, está{' '}
        <strong>dispensado do licenciamento prévio</strong> junto ao Corpo de Bombeiros Militar de
        Pernambuco, observadas as medidas de segurança contra incêndio e pânico aplicáveis.
      </p>

      <section className="grid gap-3 rounded-md bg-muted/40 p-4 sm:grid-cols-2">
        <Field label="Empresa" value={doc.empresa.razaoSocial} />
        <Field label="CNPJ" value={formatCnpj(doc.empresa.cnpj)} />
        <Field label="Unidade" value={doc.unidade.nome ?? '—'} />
        <Field
          label="Área construída"
          value={doc.unidade.areaConstruida ? `${doc.unidade.areaConstruida} m²` : '—'}
        />
        <Field label="Endereço" value={doc.unidade.endereco} className="sm:col-span-2" />
      </section>

      <section className="flex flex-col gap-2">
        <p className="font-medium">Atividades (CNAE) da unidade</p>
        <ul className="flex flex-col gap-1">
          {doc.cnaes.map((cnae) => (
            <li key={cnae.codigo} className="flex gap-2">
              <span className="font-medium tabular-nums">{cnae.codigo}</span>
              <span className="text-muted-foreground">{cnae.descricao}</span>
              {cnae.principal ? <span className="text-primary text-xs">(principal)</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t pt-4 text-muted-foreground text-xs">
        <p>
          Documento gerado pelo SAC Nexus. A dispensa é válida enquanto a unidade mantiver as
          atividades e condições que a classificam como Risco I. Este documento é orientativo e não
          substitui a análise oficial do CBMPE.
        </p>
      </footer>
    </article>
  )
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
