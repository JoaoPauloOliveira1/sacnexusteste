import { createFileRoute } from '@tanstack/react-router'
import { TriageDashboardPage } from '@/modules/triage'

export const Route = createFileRoute('/triage/')({
  component: TriageDashboardPage,
})
