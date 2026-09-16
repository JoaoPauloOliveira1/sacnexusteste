import { createFileRoute } from '@tanstack/react-router'

import { UnitsOverviewPage } from '@/modules/companies'

export const Route = createFileRoute('/companies/units')({
  component: UnitsOverviewPage,
})
