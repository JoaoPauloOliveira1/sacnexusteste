import { createFileRoute } from '@tanstack/react-router'

import { AnalysisDashboardPage } from '@/modules/analysis'

export const Route = createFileRoute('/analysis/')({
  component: AnalysisDashboardPage,
})
