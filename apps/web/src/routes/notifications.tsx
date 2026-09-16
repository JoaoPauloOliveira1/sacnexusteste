import { createFileRoute, redirect } from '@tanstack/react-router'

import { hasDemoProfile } from '@/modules/auth'
import { NotificationListPage } from '@/modules/notifications'
import { ContributorShell, useProcesses } from '@/modules/processes'

export const Route = createFileRoute('/notifications')({
  beforeLoad: () => {
    if (!hasDemoProfile('contributor')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: NotificationsRoute,
})

function NotificationsRoute() {
  const { meta } = useProcesses()
  const notifications = meta.completedProcesses
    .slice()
    .reverse()
    .map(({ classification, company, issuedDocuments, process }) => ({
      id: `issued-${process.id}`,
      processId: process.id,
      title: classification === 'risk-2' ? 'AVCB e Atestado de Vistoria emitidos' : 'DDLCB emitida',
      description: `${
        (issuedDocuments ?? []).map(({ number }) => number).join(' • ') || process.documentNumber
      } — ${company.tradeName}`,
      occurredAt: process.issuedAt,
    }))

  return (
    <ContributorShell title="Notificações">
      <NotificationListPage notifications={notifications} />
    </ContributorShell>
  )
}
