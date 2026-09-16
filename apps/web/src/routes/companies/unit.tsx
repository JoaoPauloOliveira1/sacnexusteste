import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { UnidadeRegistrationPage } from '@/modules/companies'

const searchSchema = z.object({ empresaId: z.string().optional() }).catch({})

export const Route = createFileRoute('/companies/unit')({
  validateSearch: (search) => searchSchema.parse(search),
  component: UnitRoute,
})

function UnitRoute() {
  const { empresaId } = Route.useSearch()
  return <UnidadeRegistrationPage empresaId={empresaId ?? ''} />
}
