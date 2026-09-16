import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, Building2Icon, CheckCircle2Icon, SparklesIcon } from 'lucide-react'

import { Badge } from '@/modules/shared/components/ui/badge'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'

import { journeyHighlights, PublicShell } from '../components/app-shell'

export function WelcomePage() {
  return (
    <PublicShell>
      <main className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-320 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <section>
          <Badge variant="outline" className="mb-5">
            <SparklesIcon aria-hidden="true" />
            Primeiro acesso
          </Badge>
          <h1 className="max-w-2xl text-balance font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
            Bem-vindo ao SAC-NEXUS
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg text-muted-foreground leading-8">
            Antes de iniciar seu primeiro processo, precisamos cadastrar sua empresa.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {journeyHighlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl border bg-background p-4 text-sm shadow-xs"
              >
                <Icon aria-hidden="true" className="shrink-0 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="border-b bg-muted/30">
            <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Building2Icon aria-hidden="true" />
            </span>
            <CardTitle>Vamos começar pela sua empresa</CardTitle>
            <CardDescription>
              Os dados do CNPJ serão consultados e preenchidos automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-6">
            {[
              'Cadastre a pessoa jurídica representada',
              'Informe os dados complementares de contato',
              'Abra a primeira solicitação de AVCB',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2Icon aria-hidden="true" className="text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="border-t bg-muted/20">
            <Link
              to="/companies/new"
              className={buttonVariants({ size: 'lg', className: 'w-full' })}
            >
              Continuar
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </CardFooter>
        </Card>
      </main>
    </PublicShell>
  )
}
