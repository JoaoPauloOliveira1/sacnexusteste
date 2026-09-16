import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoDeclarationPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/declaration')({
  component: RiskTwoDeclarationPage,
})
