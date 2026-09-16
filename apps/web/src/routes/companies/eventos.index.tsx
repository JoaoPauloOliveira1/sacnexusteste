import { createFileRoute } from '@tanstack/react-router'

import { EventosOverviewPage } from '@/modules/companies'

export const Route = createFileRoute('/companies/eventos/')({
  component: EventosOverviewPage,
})
