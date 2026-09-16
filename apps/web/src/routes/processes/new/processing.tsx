import { createFileRoute } from '@tanstack/react-router'

import { ProcessingPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/processing')({ component: ProcessingPage })
