import { createFileRoute } from '@tanstack/react-router'

import { QuestionnairePage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/classification')({
  component: QuestionnairePage,
})
