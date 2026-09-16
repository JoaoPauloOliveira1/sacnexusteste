import { createFileRoute } from '@tanstack/react-router'

import { TriagemDetailPage } from '@/modules/companies'

export const Route = createFileRoute('/triagem/$processoId')({
  component: TriagemDetailRoute,
})

function TriagemDetailRoute() {
  const { processoId } = Route.useParams()
  return <TriagemDetailPage processoId={processoId} />
}
