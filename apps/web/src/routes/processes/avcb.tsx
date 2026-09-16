import { createFileRoute } from '@tanstack/react-router'

import { AvcbProcessListPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/avcb')({
  component: AvcbProcessListPage,
})
