import { Link, useRouterState } from '@tanstack/react-router'
import { ClipboardListIcon } from 'lucide-react'

import { DemoProfileSwitcher, useDemoSession } from '@/modules/auth'
import { InternalApplicationShell } from '@/modules/shared/components/internal-application-shell'
import { SidebarMenuButton, SidebarMenuItem } from '@/modules/shared/components/ui/sidebar'
import { inspectorIdentity } from '../lib/inspection-data'

export function InspectionShell({ children }: { children: React.ReactNode }) {
  const { session, signOut } = useDemoSession()
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <InternalApplicationShell
      title="Vistorias"
      identity={{
        name: session?.user.name ?? inspectorIdentity.name,
        email: session?.user.email ?? inspectorIdentity.email,
        profileLabel: session?.profile.label ?? inspectorIdentity.role,
      }}
      onSignOut={signOut}
      profileSwitcher={<DemoProfileSwitcher />}
      navigation={
        <SidebarMenuItem>
          <SidebarMenuButton
            render={<Link to="/inspections" />}
            isActive={pathname.startsWith('/inspections')}
            tooltip="Fila de vistorias"
          >
            <ClipboardListIcon />
            <span>Fila de vistorias</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      }
    >
      <div className="mx-auto w-full max-w-360">{children}</div>
    </InternalApplicationShell>
  )
}
