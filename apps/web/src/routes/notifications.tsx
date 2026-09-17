import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { hasDemoProfile } from '@/modules/auth'
import { NotificationListPage } from '@/modules/notifications'
import { ContributorShell } from '@/modules/processes'
import { listTriagem } from '@/modules/shared/api/triagem'

export const Route = createFileRoute('/notifications')({
  beforeLoad: () => {
    if (!hasDemoProfile('contributor')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: NotificationsRoute,
})

function NotificationsRoute() {
  const query = useQuery({ queryKey: ['triagem'], queryFn: listTriagem })
  const notifications = (query.data?.processos ?? [])
    .filter((processo) => processo.fase === 'em_exigencia')
    .map((processo) => ({
      id: `exigencia-${processo.processoId}`,
      processId: processo.processoId,
      title: 'Exigência aguardando sua resposta',
      description: `${processo.protocoloNumero ?? 'Processo sem protocolo'} — ${processo.unidadeNome ?? processo.empresaRazaoSocial}`,
      occurredAt: processo.createdAt,
    }))

  return (
    <ContributorShell title="Notificações">
      <NotificationListPage notifications={notifications} />
    </ContributorShell>
  )
}
