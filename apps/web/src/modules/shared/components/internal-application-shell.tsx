import { Link } from '@tanstack/react-router'
import { ChevronsUpDownIcon, LogOutIcon, UserRoundIcon } from 'lucide-react'

import { ApplicationBrandMark } from '@/modules/shared/components/application-brand-mark'
import { Avatar, AvatarFallback } from '@/modules/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/modules/shared/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/modules/shared/components/ui/sidebar'
import { TooltipProvider } from '@/modules/shared/components/ui/tooltip'

interface InternalIdentity {
  name: string
  email: string
  profileLabel: string
}

interface InternalApplicationShellProps {
  title: string
  identity: InternalIdentity
  children: React.ReactNode
  navigation: React.ReactNode
  onSignOut: () => void
  profileSwitcher?: React.ReactNode
}

export function InternalApplicationShell({
  title,
  identity,
  children,
  navigation,
  onSignOut,
  profileSwitcher,
}: InternalApplicationShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '15rem',
            '--sidebar-width-mobile': '18rem',
            '--primary': '#403bad',
            '--primary-foreground': '#ffffff',
            '--secondary': '#f2f2ff',
            '--secondary-foreground': '#332e8f',
            '--foreground': '#121214',
            '--card-foreground': '#17171c',
            '--muted-foreground': '#6b6b75',
            '--border': '#e3e3e8',
            '--input': '#c7c7cc',
            '--sidebar': '#ffffff',
            '--sidebar-foreground': '#404047',
            '--sidebar-accent': '#f2f2ff',
            '--sidebar-accent-foreground': '#403bad',
            '--sidebar-border': '#e3e3e8',
          } as React.CSSProperties
        }
      >
        <Sidebar collapsible="icon" className="[&_[data-slot=sidebar-menu-button]]:text-[13px]">
          <SidebarHeader className="h-14 justify-center border-b px-3 py-0">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<div />}
                  size="lg"
                  tooltip="SAC Nexus · Área interna"
                  className="h-12"
                >
                  <ApplicationBrandMark />
                  <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                    <span className="truncate font-semibold">SAC Nexus</span>
                    <span className="truncate text-muted-foreground text-xs">
                      Área interna · CBMPE
                    </span>
                  </span>
                  <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent className="pt-2">
            <SidebarMenu className="px-2">{navigation}</SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t">
            <InternalUserMenu
              identity={identity}
              onSignOut={onSignOut}
              profileSwitcher={profileSwitcher}
            />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="min-w-0 bg-muted/20">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <p className="truncate font-medium text-sm">{title}</p>
            </div>
            <span className="max-w-64 truncate rounded-full bg-primary/5 px-3 py-1.5 font-medium text-primary text-xs">
              {identity.name} · {identity.profileLabel}
            </span>
          </header>
          <main className="w-full min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function InternalUserMenu({
  identity,
  onSignOut,
  profileSwitcher,
}: {
  identity: InternalIdentity
  onSignOut: () => void
  profileSwitcher?: React.ReactNode
}) {
  const { isMobile } = useSidebar()
  const initials = identity.name
    .split(' ')
    .filter((part) => part.length > 2)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="data-open:bg-sidebar-accent" />}
          >
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="grid min-w-0 flex-1 text-left leading-tight">
              <span className="truncate font-medium">{identity.name}</span>
              <span className="truncate text-muted-foreground text-xs">{identity.email}</span>
            </span>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Conta de demonstração</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserRoundIcon />
                {identity.profileLabel}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {profileSwitcher ? (
              <>
                {profileSwitcher}
                <DropdownMenuSeparator />
              </>
            ) : null}
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/signin" />} onClick={onSignOut}>
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
