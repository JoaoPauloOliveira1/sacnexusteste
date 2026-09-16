import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { PublicConsultationPage } from '@/modules/processes'

const searchSchema = z.object({ document: z.string().optional() }).catch({})

export const Route = createFileRoute('/public-consultation')({
  validateSearch: (search) => searchSchema.parse(search),
  component: PublicConsultationRoute,
})

function PublicConsultationRoute() {
  const search = Route.useSearch()
  return search.document ? (
    <PublicConsultationPage initialDocument={search.document} />
  ) : (
    <PublicConsultationPage />
  )
}
