import { useNavigate } from '@tanstack/react-router'
import {
  ClipboardCheckIcon,
  ClipboardListIcon,
  FileSearchIcon,
  LayoutDashboardIcon,
  ShieldCheckIcon,
} from 'lucide-react'

import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from '@/modules/shared/components/ui/dropdown-menu'
import { demoIdentities, useDemoSession } from '../lib/demo-session'
import { type DemoProfile } from '../types'

const demoProfileSwitchOptions = [
  {
    type: 'contributor',
    label: 'Contribuinte',
    description: 'Portal',
    route: '/dashboard',
    icon: LayoutDashboardIcon,
  },
  {
    type: 'triager',
    label: 'Triador',
    description: 'Triagem',
    route: '/triagem',
    icon: ClipboardCheckIcon,
  },
  {
    type: 'analyst',
    label: 'Analista',
    description: 'Análise',
    route: '/analysis',
    icon: FileSearchIcon,
  },
  {
    type: 'inspector',
    label: 'Vistoriador',
    description: 'Vistorias',
    route: '/inspections',
    icon: ClipboardListIcon,
  },
  {
    type: 'admin',
    label: 'Administrador',
    description: 'Acesso total',
    route: '/dashboard',
    icon: ShieldCheckIcon,
  },
] as const satisfies ReadonlyArray<{
  type: DemoProfile['type']
  label: string
  description: string
  route: string
  icon: React.ComponentType
}>

function DemoProfileSwitcher() {
  const navigate = useNavigate()
  const { session, signIn } = useDemoSession()
  const currentProfileType = session?.profile.type

  function switchProfile(profileType: DemoProfile['type']) {
    const identity = demoIdentities[profileType]
    signIn({ user: identity.user, profile: identity.profile })

    const option = demoProfileSwitchOptions.find((candidate) => candidate.type === profileType)
    if (option) {
      void navigate({ to: option.route })
    }
  }

  return (
    <DropdownMenuGroup>
      <DropdownMenuLabel>Trocar perfil</DropdownMenuLabel>
      {demoProfileSwitchOptions.map(({ type, label, description, icon: Icon }) => {
        const isCurrent = currentProfileType === type

        return (
          <DropdownMenuItem key={type} disabled={isCurrent} onClick={() => switchProfile(type)}>
            <Icon />
            <span>{label}</span>
            <DropdownMenuShortcut>{isCurrent ? 'Atual' : description}</DropdownMenuShortcut>
          </DropdownMenuItem>
        )
      })}
    </DropdownMenuGroup>
  )
}

export { DemoProfileSwitcher }
