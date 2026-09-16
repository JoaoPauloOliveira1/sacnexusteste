import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoRequirementsPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/requirements')({
  component: RiskTwoRequirementsPage,
})
