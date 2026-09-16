import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { hasDemoProfile } from '@/modules/auth'

export const Route = createFileRoute('/companies')({
  beforeLoad: () => {
    if (!hasDemoProfile('contributor')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: CompaniesRoute,
})

function CompaniesRoute() {
  return <Outlet />
}
