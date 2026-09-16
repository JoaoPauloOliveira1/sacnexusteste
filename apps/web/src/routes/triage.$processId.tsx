import { createFileRoute } from '@tanstack/react-router'
import { TriageProcessPage } from '@/modules/triage'

export const Route = createFileRoute('/triage/$processId')({
  component: TriageProcessRoute,
})

function TriageProcessRoute() {
  const { processId } = Route.useParams()
  return <TriageProcessPage processId={processId} />
}
