import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

import { DemoSessionProvider, useDemoSession } from '@/modules/auth'
import { CompaniesProvider } from '@/modules/companies'
import { type ContributorActor, demoContributorActor, ProcessProvider } from '@/modules/processes'
import { Toaster } from '@/modules/shared/components/ui/sonner'
import { type PublicRuntimeConfig } from '@/modules/shared/config/env'

interface RouterContext {
  queryClient: QueryClient
  runtimeConfig: PublicRuntimeConfig
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
})

function RootRoute() {
  return (
    <DemoSessionProvider>
      <CompaniesProvider>
        <SessionBoundApplication />
      </CompaniesProvider>
    </DemoSessionProvider>
  )
}

function SessionBoundApplication() {
  const { session, signOut } = useDemoSession()
  const actor: ContributorActor =
    session?.profile.type === 'contributor' || session?.profile.type === 'admin'
      ? {
          userId: session.user.id,
          profileId: session.profile.id,
          profileType: session.profile.type,
          profileLabel: session.profile.label,
          name: session.user.name,
          email: session.user.email,
          companyIds: session.profile.companyIds,
        }
      : demoContributorActor

  return (
    <ProcessProvider actor={actor} onSignOut={signOut}>
      <Outlet />
      <Toaster richColors />
    </ProcessProvider>
  )
}
