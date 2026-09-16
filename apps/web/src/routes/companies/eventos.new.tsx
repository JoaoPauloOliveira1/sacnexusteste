import { createFileRoute } from '@tanstack/react-router'

import { EventoRegistrationPage } from '@/modules/companies'

export const Route = createFileRoute('/companies/eventos/new')({
  component: EventoRegistrationPage,
})
