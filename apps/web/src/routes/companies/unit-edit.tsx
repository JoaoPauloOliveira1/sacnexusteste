import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { UnitEditPage } from '@/modules/companies'
import { ContributorShell } from '@/modules/processes'

const searchSchema = z.object({ unidadeId: z.string().optional() }).catch({})

export const Route = createFileRoute('/companies/unit-edit')({
  validateSearch: (search) => searchSchema.parse(search),
  component: UnitEditRoute,
})

function UnitEditRoute() {
  const { unidadeId } = Route.useSearch()
  return (
    <ContributorShell title="Unidade">
      <UnitEditPage unidadeId={unidadeId ?? ''} />
    </ContributorShell>
  )
}
