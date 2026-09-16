import { createFileRoute } from '@tanstack/react-router'

import { OperationalMapPage } from '@/modules/operational-map'

export const Route = createFileRoute('/map')({
  component: MapRoute,
})

function MapRoute() {
  const { runtimeConfig } = Route.useRouteContext()

  return <OperationalMapPage googleMapsApiKey={runtimeConfig.googleMapsApiKey} />
}
