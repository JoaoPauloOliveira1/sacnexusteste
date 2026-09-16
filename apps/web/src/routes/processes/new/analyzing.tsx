import { createFileRoute } from '@tanstack/react-router'

import { ClassificationAnalysisPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/analyzing')({
  component: ClassificationAnalysisPage,
})
