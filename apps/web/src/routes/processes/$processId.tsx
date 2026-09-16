import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/processes/$processId')({ component: ProcessRoute })

function ProcessRoute() {
  return <Outlet />
}
