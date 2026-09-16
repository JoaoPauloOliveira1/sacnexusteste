import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoProtocolPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/protocol')({
  component: RiskTwoProtocolPage,
})
