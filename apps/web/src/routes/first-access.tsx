import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/first-access')({ component: FirstAccessRoute })

function FirstAccessRoute() {
  return <Outlet />
}
