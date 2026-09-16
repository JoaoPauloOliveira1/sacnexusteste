import { createFileRoute } from '@tanstack/react-router'

import { EstablishmentRegistrationPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/establishment')({
  component: EstablishmentRegistrationPage,
})
