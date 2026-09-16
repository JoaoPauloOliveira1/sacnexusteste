import { createFileRoute } from '@tanstack/react-router'

import { InspectionDashboardPage } from '@/modules/inspections'

export const Route = createFileRoute('/inspections/')({
  component: InspectionDashboardPage,
})
