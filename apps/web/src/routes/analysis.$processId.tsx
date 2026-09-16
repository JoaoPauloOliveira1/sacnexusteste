import { createFileRoute } from '@tanstack/react-router'

import { AnalysisProcessPage } from '@/modules/analysis'

export const Route = createFileRoute('/analysis/$processId')({
  component: AnalysisProcessRoute,
})

function AnalysisProcessRoute() {
  const { processId } = Route.useParams()
  return <AnalysisProcessPage processId={processId} />
}
