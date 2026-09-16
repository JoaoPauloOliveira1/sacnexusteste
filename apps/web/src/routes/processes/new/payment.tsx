import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoPaymentPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/payment')({
  component: RiskTwoPaymentPage,
})
