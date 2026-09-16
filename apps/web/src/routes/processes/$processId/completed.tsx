import { createFileRoute } from '@tanstack/react-router'

import { ProcessCompletedPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/$processId/completed')({
  component: ProcessCompletedRoute,
})

function ProcessCompletedRoute() {
  const { processId } = Route.useParams()
  return <ProcessCompletedPage processId={processId} />
}
