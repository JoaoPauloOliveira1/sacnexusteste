import { createFileRoute } from '@tanstack/react-router'

import { ProcessDetailsPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/$processId/')({ component: ProcessDetailsRoute })

function ProcessDetailsRoute() {
  const { processId } = Route.useParams()
  return <ProcessDetailsPage processId={processId} />
}
