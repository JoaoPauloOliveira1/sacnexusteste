import { createFileRoute } from '@tanstack/react-router'

import { ReviewPage } from '@/modules/processes'

export const Route = createFileRoute('/processes/new/review')({ component: ReviewPage })
