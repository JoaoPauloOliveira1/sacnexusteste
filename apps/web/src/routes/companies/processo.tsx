import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { AvcbProcessPage } from '@/modules/companies'

const searchSchema = z
  .object({
    unidadeId: z.string().optional(),
    eventoId: z.string().optional(),
    risco: z.string().optional(),
  })
  .catch({})

export const Route = createFileRoute('/companies/processo')({
  validateSearch: (search) => searchSchema.parse(search),
  component: ProcessoRoute,
})

function ProcessoRoute() {
  const { unidadeId, eventoId, risco } = Route.useSearch()
  return (
    <AvcbProcessPage
      {...(unidadeId ? { unidadeId } : {})}
      {...(eventoId ? { eventoId } : {})}
      risco={risco ?? 'II'}
    />
  )
}
