import { createFileRoute } from '@tanstack/react-router'

import { ProcessHistoryPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/$processId/history')({
  component: ProcessHistoryPage,
})
