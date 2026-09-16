import { createFileRoute } from '@tanstack/react-router'

import { ClassificationResultPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/result')({
  component: ClassificationResultPage,
})
