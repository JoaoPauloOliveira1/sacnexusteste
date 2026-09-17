import { createFileRoute, redirect } from '@tanstack/react-router'

import { hasDemoProfile } from '@/modules/auth'
import { OperationalMapPage } from '@/modules/operational-map'

export const Route = createFileRoute('/map')({
  beforeLoad: () => {
    if (!hasDemoProfile('triager')) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: MapRoute,
})

function MapRoute() {
  return <OperationalMapPage />
}
