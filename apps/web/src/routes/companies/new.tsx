import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { CompanyRegistrationPage } from '@/modules/companies'

const searchSchema = z.object({ returnTo: z.enum(['request', 'review']).optional() }).catch({})

export const Route = createFileRoute('/companies/new')({
  validateSearch: (search) => searchSchema.parse(search),
  component: CompanyRoute,
})

function CompanyRoute() {
  const search = Route.useSearch()
  return (
    <CompanyRegistrationPage
      returnTo={
        search.returnTo === 'request'
          ? 'request'
          : search.returnTo === 'review'
            ? 'review'
            : 'dashboard'
      }
    />
  )
}
