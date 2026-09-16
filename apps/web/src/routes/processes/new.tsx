import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/processes/new')({ component: NewProcessRoute })

function NewProcessRoute() {
  return <Outlet />
}
