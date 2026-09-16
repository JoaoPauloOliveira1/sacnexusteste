import { createFileRoute } from '@tanstack/react-router'

import { AboutPage } from '@/modules/processes'

export const Route = createFileRoute('/about')({ component: AboutPage })
