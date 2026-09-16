import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { hasDemoProfile } from '@/modules/auth'
import { InspectionProvider } from '@/modules/inspections'

export const Route = createFileRoute('/inspections')({
  beforeLoad: () => {
    if (!hasDemoProfile('inspector')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: InspectionLayout,
})

function InspectionLayout() {
  return (
    <InspectionProvider>
      <Outlet />
    </InspectionProvider>
  )
}
