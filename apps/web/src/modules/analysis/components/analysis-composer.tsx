import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowLeftIcon, FileSearchIcon } from 'lucide-react'

import { DemoProfileSwitcher, useDemoSession } from '@/modules/auth'
import { InternalApplicationShell } from '@/modules/shared/components/internal-application-shell'
import { Badge } from '@/modules/shared/components/ui/badge'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'
import { SidebarMenuButton, SidebarMenuItem } from '@/modules/shared/components/ui/sidebar'
import { cn } from '@/modules/shared/lib/utils'
import { analystIdentity } from '../lib/analysis-data'
import { type TechnicalAnalysisStatus } from '../types'

function Root({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useDemoSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <InternalApplicationShell
      title="Análise técnica"
      identity={{
        name: session?.user.name ?? analystIdentity.name,
        email: session?.user.email ?? analystIdentity.email,
        profileLabel: session?.profile.label ?? analystIdentity.role,
      }}
      onSignOut={signOut}
      profileSwitcher={<DemoProfileSwitcher />}
      navigation={
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link to="/analysis" />}
            isActive={pathname.startsWith('/analysis')}
            tooltip="Fila de análise"
          >
            <FileSearchIcon />
            <span>Fila de análise</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      }
    >
      <div className="mx-auto w-full max-w-360">{children}</div>
    </InternalApplicationShell>
  )
}

function PageHeader({
  title,
  description,
  backTo,
  actions,
  children,
}: {
  title: string
  description: string
  backTo?: '/analysis'
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-5">
      {backTo ? (
        <Link
          to={backTo}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), '-ml-2 w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar para a fila
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {children ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">{children}</div>
          ) : null}
          <h1 className="text-balance font-semibold text-3xl tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-pretty text-muted-foreground leading-7">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function InfoGrid({ items }: { items: ReadonlyArray<{ label: string; value: React.ReactNode }> }) {
  return (
    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-muted-foreground text-xs uppercase tracking-wide">{item.label}</dt>
          <dd className="mt-1 break-words font-medium text-sm leading-6">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function StatusBadge({ status }: { status: TechnicalAnalysisStatus }) {
  const variant =
    status === 'Aguardando correção'
      ? 'destructive'
      : status === 'Análise concluída'
        ? 'default'
        : status === 'Aguardando análise'
          ? 'outline'
          : 'secondary'
  return <Badge variant={variant}>{status}</Badge>
}

export const AnalysisComposer = { Root, PageHeader, Section, InfoGrid, StatusBadge }
