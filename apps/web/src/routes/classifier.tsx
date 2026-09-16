import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { ClassifierPage } from '@/modules/classifier'

const searchSchema = z
  .object({ atividade: z.string().optional(), unidadeId: z.string().optional() })
  .catch({})

export const Route = createFileRoute('/classifier')({
  validateSearch: (search) => searchSchema.parse(search),
  component: ClassifierRoute,
})

function ClassifierRoute() {
  const { atividade, unidadeId } = Route.useSearch()
  return (
    <ClassifierPage {...(atividade ? { atividade } : {})} {...(unidadeId ? { unidadeId } : {})} />
  )
}
