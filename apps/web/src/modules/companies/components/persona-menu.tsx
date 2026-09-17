import { Link } from '@tanstack/react-router'
import { ChevronsUpDownIcon, LogOutIcon, UserRoundIcon } from 'lucide-react'

import { DemoProfileSwitcher, useDemoSession } from '@/modules/auth'
import { Button } from '@/modules/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/modules/shared/components/ui/dropdown-menu'

const PERFIL_LABEL: Record<string, string> = {
  contributor: 'Contribuinte',
  triager: 'Triador (CBMPE)',
  inspector: 'Vistoriador',
  admin: 'Administrador',
}

/** Lightweight persona indicator + switcher for standalone pages (no shell). */
export function PersonaMenu() {
  const { session, signOut } = useDemoSession()
  const label = PERFIL_LABEL[session?.profile.type ?? ''] ?? 'Perfil'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="w-fit" />}>
        <UserRoundIcon data-icon="inline-start" />
        {label}
        <ChevronsUpDownIcon className="ml-1 size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Conta de demonstração</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DemoProfileSwitcher />
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link to="/signin" />} onClick={signOut}>
          <LogOutIcon />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
