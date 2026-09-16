import { Link } from '@tanstack/react-router'
import {
  Building2Icon,
  ChevronLeftIcon,
  CircleUserRoundIcon,
  FileCheck2Icon,
  LayoutDashboardIcon,
  PlusIcon,
  SearchCheckIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import { Badge } from '@/modules/shared/components/ui/badge'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import { Progress, ProgressLabel, ProgressValue } from '@/modules/shared/components/ui/progress'
import { cn } from '@/modules/shared/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  title: string
  description: string
  eyebrow?: string
  step?: number
  totalSteps?: number
  backTo?: string
  backLabel?: string
  compact?: boolean
}

export function AppShell({
  children,
  title,
  description,
  eyebrow,
  step,
  totalSteps = 8,
  backTo,
  backLabel = 'Voltar',
  compact = false,
}: AppShellProps) {
  return (
    <div className="min-h-svh bg-muted/30 text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-16 max-w-360 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard" className="flex cursor-pointer items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <ShieldCheckIcon aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-semibold tracking-tight">SAC-NEXUS</span>
              <span className="mt-1 text-muted-foreground text-xs">CBMPE</span>
            </span>
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-1 lg:flex">
            <Link to="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              <LayoutDashboardIcon data-icon="inline-start" />
              Processos
            </Link>
            <Link to="/processes/new" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              <PlusIcon data-icon="inline-start" />
              Nova solicitação
            </Link>
            <Link
              to="/public-consultation"
              className={buttonVariants({ variant: 'ghost', size: 'sm' })}
            >
              <SearchCheckIcon data-icon="inline-start" />
              Consulta pública
            </Link>
          </nav>

          <div className="flex items-center gap-3 rounded-full border bg-background py-1 pr-3 pl-1">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted">
              <CircleUserRoundIcon aria-hidden="true" className="text-muted-foreground" />
            </span>
            <span className="hidden text-sm sm:block">João Carlos</span>
          </div>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto w-full max-w-360 px-4 py-8 sm:px-6 lg:px-8 lg:py-12',
          compact && 'max-w-280',
        )}
      >
        {backTo ? (
          <Link
            to={backTo}
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'mb-5 -ml-2')}
          >
            <ChevronLeftIcon data-icon="inline-start" />
            {backLabel}
          </Link>
        ) : null}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <div className="mb-3 flex items-center gap-2">
                <Badge variant="outline">{eyebrow}</Badge>
                <span className="h-px w-12 bg-border" aria-hidden="true" />
              </div>
            ) : null}
            <h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-pretty text-base text-muted-foreground leading-7">
              {description}
            </p>
          </div>

          {step ? (
            <Progress
              value={(step / totalSteps) * 100}
              className="w-full max-w-sm rounded-xl border bg-background p-4 shadow-xs"
            >
              <ProgressLabel>Progresso da solicitação</ProgressLabel>
              <ProgressValue>{() => `${step} de ${totalSteps}`}</ProgressValue>
            </Progress>
          ) : null}
        </div>

        {children}
      </main>
    </div>
  )
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-18 max-w-320 items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/signin" className="flex cursor-pointer items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheckIcon aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold tracking-tight">SAC-NEXUS</span>
              <span className="block text-muted-foreground text-xs">
                Corpo de Bombeiros Militar de Pernambuco
              </span>
            </span>
          </Link>
          <Link to="/signin" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Área do contribuinte
          </Link>
        </div>
      </header>
      {children}
    </div>
  )
}

export const journeyHighlights = [
  { icon: Building2Icon, label: 'Empresa e empreendimento' },
  { icon: FileCheck2Icon, label: 'Enquadramento automático' },
  { icon: ShieldCheckIcon, label: 'Certificado verificável' },
] as const
