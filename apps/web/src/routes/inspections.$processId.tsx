import { createFileRoute } from '@tanstack/react-router'

import { InspectionProcessPage } from '@/modules/inspections'

export const Route = createFileRoute('/inspections/$processId')({
  component: InspectionProcessRoute,
})

function InspectionProcessRoute() {
  const { processId } = Route.useParams()
  return <InspectionProcessPage processId={processId} />
}
