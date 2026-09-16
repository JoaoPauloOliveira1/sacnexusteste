import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoResponsiblePage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/responsible')({
  component: RiskTwoResponsiblePage,
})
