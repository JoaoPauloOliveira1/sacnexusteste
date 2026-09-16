import { CheckCircle2Icon, UserRoundIcon } from 'lucide-react'

import { Badge } from '@/modules/shared/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/modules/shared/components/ui/card'

import { AppShell } from '../components/app-shell'
import { historyEvents } from '../lib/process-data'
import { useProcessStore } from '../lib/process-store'

export function ProcessHistoryPage() {
  const { process } = useProcessStore()

  return (
    <AppShell
      title="Histórico do processo"
      description={`Eventos públicos registrados durante a jornada do processo ${process.processNumber}.`}
      eyebrow="Auditoria"
      backTo="/dashboard"
    >
      <Card className="shadow-xs">
        <CardHeader>
          <CardTitle>Linha do tempo</CardTitle>
          <CardDescription>
            Informações técnicas internas ou sensíveis não são exibidas neste histórico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative flex flex-col gap-0 before:absolute before:top-3 before:bottom-3 before:left-4 before:w-px before:bg-border">
            {historyEvents.map((event, index) => (
              <li
                key={event.title}
                className="relative grid grid-cols-[2rem_1fr] gap-4 pb-7 last:pb-0"
              >
                <span className="z-10 flex size-8 items-center justify-center rounded-full border bg-background text-primary">
                  <CheckCircle2Icon aria-hidden="true" />
                </span>
                <div className="rounded-xl border bg-muted/15 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="mt-1 text-muted-foreground text-sm">{event.description}</p>
                    </div>
                    <Badge variant="outline">
                      {index + 1} de {historyEvents.length}
                    </Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-muted-foreground text-xs">
                    <span>
                      {event.date} · {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserRoundIcon aria-hidden="true" />
                      {event.user}
                    </span>
                    <span>{event.source}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </AppShell>
  )
}
