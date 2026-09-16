import { Link, useRouterState } from '@tanstack/react-router'
import { ArrowLeftIcon, ClipboardCheckIcon } from 'lucide-react'
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
import { triagerIdentity } from '../lib/triage-data'
import { type TriagePriority, type TriageStatus } from '../types'

function Root({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useDemoSession()
  const pathname = useRouterState({ select: (routerState) => routerState.location.pathname })

  return (
    <InternalApplicationShell
      title="Triagem administrativa"
      identity={{
        name: session?.user.name ?? triagerIdentity.name,
        email: session?.user.email ?? 'triador@email.com',
        profileLabel: session?.profile.label ?? triagerIdentity.role,
      }}
      onSignOut={signOut}
      profileSwitcher={<DemoProfileSwitcher />}
      navigation={
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link to="/triage" />}
            isActive={pathname.startsWith('/triage')}
            tooltip="Fila de triagem"
          >
            <ClipboardCheckIcon />
            <span>Fila de triagem</span>
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
  backTo?: '/triage'
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

function Metric({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string
  value: string
  description: string
  icon: React.ComponentType<{ 'aria-hidden'?: boolean | 'true' }>
}) {
  return (
    <Card size="sm">
      <CardHeader className="grid grid-cols-[1fr_auto] items-start gap-3">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-1 text-2xl">{value}</CardTitle>
        </div>
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="text-muted-foreground text-xs">{description}</CardContent>
    </Card>
  )
}

function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {action ? <div className="mt-2 flex flex-wrap gap-2">{action}</div> : null}
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

function StatusBadge({ status }: { status: TriageStatus }) {
  const variant =
    status === 'Aguardando Correções'
      ? 'destructive'
      : status === 'Encaminhado para Distribuição' || status === 'Triagem Concluída'
        ? 'default'
        : status === 'Protocolado'
          ? 'outline'
          : 'secondary'
  return <Badge variant={variant}>{status}</Badge>
}

function PriorityBadge({ priority }: { priority: TriagePriority }) {
  const variant =
    priority === 'Alta' ? 'destructive' : priority === 'Baixa' ? 'outline' : 'secondary'
  return <Badge variant={variant}>Prioridade {priority.toLowerCase()}</Badge>
}

export const TriageComposer = {
  Root,
  PageHeader,
  Metric,
  Section,
  InfoGrid,
  StatusBadge,
  PriorityBadge,
}
