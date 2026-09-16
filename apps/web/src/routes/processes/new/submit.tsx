import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoSubmitPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/submit')({
  component: RiskTwoSubmitPage,
})
