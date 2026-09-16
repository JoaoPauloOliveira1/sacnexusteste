import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { DdlcbPage } from '@/modules/companies'

const searchSchema = z.object({ unidadeId: z.string().optional() }).catch({})

export const Route = createFileRoute('/companies/ddlcb')({
  validateSearch: (search) => searchSchema.parse(search),
  component: DdlcbRoute,
})

function DdlcbRoute() {
  const { unidadeId } = Route.useSearch()
  return <DdlcbPage unidadeId={unidadeId ?? ''} />
}
