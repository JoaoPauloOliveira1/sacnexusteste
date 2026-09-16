import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { hasDemoProfile } from '@/modules/auth'
import { TriageProvider } from '@/modules/triage'

export const Route = createFileRoute('/triage')({
  beforeLoad: () => {
    if (!hasDemoProfile('triager')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: TriageLayout,
})

function TriageLayout() {
  return (
    <TriageProvider>
      <Outlet />
    </TriageProvider>
  )
}
