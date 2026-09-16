import { CheckCircle2Icon } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'
import { Separator } from '@/modules/shared/components/ui/separator'
import { cn } from '@/modules/shared/lib/utils'

interface SectionCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function SectionCard({ title, description, children, footer, className }: SectionCardProps) {
  return (
    <Card className={cn('shadow-xs', className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? (
        <CardFooter className="flex-wrap gap-3 border-t bg-muted/30">{footer}</CardFooter>
      ) : null}
    </Card>
  )
}

export function DataList({
  items,
  columns = 2,
}: {
  items: readonly { label: string; value: React.ReactNode }[]
  columns?: 1 | 2 | 3
}) {
  return (
    <dl
      className={cn(
        'grid grid-cols-1 gap-x-8 gap-y-5',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-muted-foreground text-sm">{item.label}</dt>
          <dd className="mt-1 break-words font-medium text-sm leading-6">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function SuccessFeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-6">
          <CheckCircle2Icon aria-hidden="true" className="mt-1 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function ReviewSection({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-semibold text-base">{title}</h3>
        {action}
      </div>
      {children}
      <Separator className="mt-6" />
    </section>
  )
}
