import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoApprovedPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/approved')({
  component: RiskTwoApprovedPage,
})
