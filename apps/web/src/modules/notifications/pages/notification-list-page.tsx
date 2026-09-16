import { Link } from '@tanstack/react-router'
import { BellIcon } from 'lucide-react'

import { Card, CardContent } from '@/modules/shared/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/modules/shared/components/ui/empty'
import { type NotificationListItem } from '../types'

export function NotificationListPage({
  notifications,
}: {
  notifications: readonly NotificationListItem[]
}) {
  return (
    <main className="flex min-h-0 flex-1 flex-col gap-3 bg-[#fbfbfc] px-4 py-7 text-[13px] sm:px-6 lg:px-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl leading-8 tracking-tight">Notificações</h1>
        <p className="text-muted-foreground">
          Acompanhe atualizações sobre seus processos e documentos.
        </p>
      </header>

      {notifications.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <Card className="rounded-md py-0 shadow-none">
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-1">
                    <h2 className="font-semibold text-sm">{notification.title}</h2>
                    <p className="text-muted-foreground">{notification.description}</p>
                    <time className="text-muted-foreground text-xs">{notification.occurredAt}</time>
                  </div>
                  <Link
                    to="/processes/$processId/completed"
                    params={{ processId: notification.processId }}
                    className="w-fit cursor-pointer font-medium text-primary hover:underline"
                  >
                    Ver documento
                  </Link>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      ) : (
        <Card className="rounded-md py-0 shadow-none">
          <CardContent className="p-0">
            <Empty className="min-h-72">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BellIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Nenhuma notificação</EmptyTitle>
                <EmptyDescription>
                  As atualizações dos seus processos aparecerão nesta área.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
