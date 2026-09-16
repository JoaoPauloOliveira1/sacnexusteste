import { createFileRoute } from '@tanstack/react-router'

import { CertificatePage } from '@/modules/processes'

export const Route = createFileRoute('/processes/$processId/certificate')({
  component: CertificatePage,
})
