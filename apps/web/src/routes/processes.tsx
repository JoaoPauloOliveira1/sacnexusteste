import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { hasDemoProfile } from '@/modules/auth'

export const Route = createFileRoute('/processes')({
  beforeLoad: () => {
    if (!hasDemoProfile('contributor')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: ProcessesRoute,
})

function ProcessesRoute() {
  return <Outlet />
}
