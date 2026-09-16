import { createFileRoute } from '@tanstack/react-router'

import { ServiceSelectionPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/')({ component: ServiceSelectionPage })
