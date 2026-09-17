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
  const query = useQuery({ queryKey: ['triagem'], queryFn: listTriagem, refetchInterval: 10_000 })
  const processos = query.data?.processos ?? []
  const exigencias = processos
    .filter((processo) => processo.fase === 'em_exigencia')
    .map((processo) => ({
      id: `exigencia-${processo.processoId}`,
      processId: processo.processoId,
      title: 'Exigência aguardando sua resposta',
      description: `${processo.protocoloNumero ?? 'Processo sem protocolo'} — ${processo.unidadeNome ?? processo.empresaRazaoSocial}`,
      occurredAt: processo.createdAt,
    }))
  const mensagens = processos
    .filter((processo) => processo.mensagensNaoLidasContribuinte > 0)
    .map((processo) => ({
      id: `mensagem-${processo.processoId}`,
      processId: processo.processoId,
      title: 'Nova mensagem do triador',
      description: `${processo.mensagensNaoLidasContribuinte} mensagem${processo.mensagensNaoLidasContribuinte > 1 ? 'ens' : ''} em ${processo.protocoloNumero ?? 'Processo sem protocolo'} — ${processo.unidadeNome ?? processo.empresaRazaoSocial}`,
      occurredAt: processo.ultimaMensagemEm ?? processo.createdAt,
    }))
  const exigenciasSanadas = processos
    .filter((processo) => processo.exigenciaSanadaEm)
    .map((processo) => ({
      id: `exigencia-sanada-${processo.processoId}`,
      processId: processo.processoId,
      title: 'Exigência sanada pelo CBMPE',
      description: `${processo.protocoloNumero ?? 'Processo sem protocolo'} — a análise foi concluída e o AVCB está disponível.`,
      occurredAt: processo.exigenciaSanadaEm as string,
    }))

  return (
    <ContributorShell title="Notificações">
      <NotificationListPage notifications={[...mensagens, ...exigencias, ...exigenciasSanadas]} />
    </ContributorShell>
  )
}
