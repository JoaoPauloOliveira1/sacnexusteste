import { createFileRoute } from '@tanstack/react-router'

import { RequestConfirmationPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/request')({
  component: RequestConfirmationPage,
})
