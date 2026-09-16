import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { AvcbCertificatePage } from '@/modules/companies'

const searchSchema = z.object({ processoId: z.string().optional() }).catch({})

export const Route = createFileRoute('/companies/avcb')({
  validateSearch: (search) => searchSchema.parse(search),
  component: AvcbCertificateRoute,
})

function AvcbCertificateRoute() {
  const { processoId } = Route.useSearch()
  return <AvcbCertificatePage processoId={processoId ?? ''} />
}
