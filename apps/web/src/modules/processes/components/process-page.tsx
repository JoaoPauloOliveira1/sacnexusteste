import { Badge } from '@/modules/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'
import { Progress } from '@/modules/shared/components/ui/progress'
import { cn } from '@/modules/shared/lib/utils'

type ProcessStep = 1 | 2 | 3 | 4
type RiskTwoStep = 1 | 2 | 3 | 4 | 5

const processStepLabels: Record<ProcessStep, string> = {
  1: 'Solicitação',
  2: 'Estabelecimento',
  3: 'Características',
  4: 'Enquadramento',
}

const riskTwoStepLabels: Record<RiskTwoStep, string> = {
  1: 'Responsável',
  2: 'Declaração',
  3: 'Documentos',
  4: 'Pagamento',
  5: 'Protocolo',
}

interface ProcessPageProps {
  title: string
  description: string
  badge?: React.ReactNode
  step?: ProcessStep
  riskTwoStep?: RiskTwoStep
  children: React.ReactNode
}

export function ProcessPage({
  title,
  description,
  badge,
  step,
  riskTwoStep,
  children,
}: ProcessPageProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-3 bg-[#fbfbfc] px-4 py-[26px] text-[13px] sm:px-6 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-semibold text-2xl leading-[30px] tracking-[-0.35px]">{title}</h1>
          <p className="text-[#6b6b75] text-[13px]">{description}</p>
        </div>
        {step ? (
          <ProcessStepBadge step={step} />
        ) : riskTwoStep ? (
          <RiskTwoStepBadge step={riskTwoStep} />
        ) : (
          badge
        )}
      </header>
      {step ? <ProcessJourneyProgress step={step} /> : null}
      {riskTwoStep ? <RiskTwoJourneyProgress step={riskTwoStep} /> : null}
      {children}
    </main>
  )
}

function RiskTwoStepBadge({ step }: { step: RiskTwoStep }) {
  return (
    <Badge variant="secondary">
      Risco 2 · etapa {step} de 5 · {riskTwoStepLabels[step]}
    </Badge>
  )
}

function ProcessStepBadge({ step }: { step: ProcessStep }) {
  return (
    <Badge variant="secondary">
      Etapa {step} de 4 · {processStepLabels[step]}
    </Badge>
  )
}

function RiskTwoJourneyProgress({ step }: { step: RiskTwoStep }) {
  return (
    <Progress
      value={step * 20}
      aria-label="Progresso da complementação do Risco 2"
      aria-valuetext={`Etapa ${step} de 5: ${riskTwoStepLabels[step]}`}
      className="[&_[data-slot=progress-indicator]]:bg-[#403bad] [&_[data-slot=progress-track]]:h-2"
    />
  )
}

function ProcessJourneyProgress({ step }: { step: ProcessStep }) {
  return (
    <Progress
      value={step * 25}
      aria-label="Progresso da solicitação"
      aria-valuetext={`Etapa ${step} de 4: ${processStepLabels[step]}`}
      className="[&_[data-slot=progress-indicator]]:bg-[#18181b] [&_[data-slot=progress-track]]:h-2"
    />
  )
}

type StatusTone = 'default' | 'success' | 'info'

export function StatusBadge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: StatusTone
}) {
  return (
    <Badge
      variant={tone === 'default' ? 'secondary' : 'outline'}
      className={cn(
        tone === 'success' && 'border-transparent bg-status-success text-status-success-foreground',
        tone === 'info' && 'border-transparent bg-status-info text-status-info-foreground',
      )}
    >
      {children}
    </Badge>
  )
}

interface SummaryCardProps {
  title: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function SummaryCard({ title, description, children, footer, className }: SummaryCardProps) {
  return (
    <Card
      className={cn(
        'gap-2.5 rounded-md py-4 shadow-none [&_[data-slot=button]]:rounded-md [&_[data-slot=button]]:px-4 [&_[data-slot=button]]:text-[13px]',
        className,
      )}
    >
      <CardHeader className="gap-1 px-4">
        <CardTitle className="font-semibold text-sm">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-[13px]">{description}</CardDescription>
        ) : null}
      </CardHeader>
      {children ? <CardContent className="px-4">{children}</CardContent> : null}
      {footer ? <CardFooter className="flex-wrap gap-2 px-4">{footer}</CardFooter> : null}
    </Card>
  )
}

export function ProcessPageActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end [&_[data-slot=button]]:rounded-md [&_[data-slot=button]]:px-4 [&_[data-slot=button]]:text-[13px]">
      {children}
    </div>
  )
}

export function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="gap-2 rounded-md py-4 shadow-none">
      <CardHeader className="gap-2 px-4">
        <CardTitle className="font-semibold text-sm">{label}</CardTitle>
        <p className="font-semibold text-2xl tabular-nums">{value}</p>
      </CardHeader>
    </Card>
  )
}

export function SummaryList({
  items,
  columns = 1,
}: {
  items: readonly { key: string; label?: string; value: React.ReactNode }[]
  columns?: 1 | 2
}) {
  return (
    <dl className={cn('grid gap-x-8 gap-y-2', columns === 2 && 'sm:grid-cols-2')}>
      {items.map((item) => (
        <div key={item.key} className="flex min-w-0 flex-wrap gap-1">
          {item.label ? <dt className="text-muted-foreground">{item.label}</dt> : null}
          <dd className="min-w-0 break-words font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
