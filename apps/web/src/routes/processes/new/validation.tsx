import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoValidationPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/validation')({
  component: RiskTwoValidationPage,
})
