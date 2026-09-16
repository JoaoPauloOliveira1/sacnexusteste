import { createFileRoute } from '@tanstack/react-router'

import { WelcomePage } from '@/modules/processes'

export const Route = createFileRoute('/first-access/')({ component: WelcomePage })
