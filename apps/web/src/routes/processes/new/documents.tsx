import { createFileRoute } from '@tanstack/react-router'

import { RiskTwoDocumentsPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/documents')({
  component: RiskTwoDocumentsPage,
})
