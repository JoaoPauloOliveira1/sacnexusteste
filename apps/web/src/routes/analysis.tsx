import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AnalysisProvider } from '@/modules/analysis'
import { hasDemoProfile } from '@/modules/auth'

export const Route = createFileRoute('/analysis')({
  beforeLoad: () => {
    if (!hasDemoProfile('analyst')) {
      throw redirect({ to: '/signin' })
    }
  },
  component: AnalysisLayout,
})

function AnalysisLayout() {
  return (
    <AnalysisProvider>
      <Outlet />
    </AnalysisProvider>
  )
}
