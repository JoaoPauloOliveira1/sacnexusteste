import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoInspectionPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/inspection')({
  component: RiskTwoInspectionPage,
})
