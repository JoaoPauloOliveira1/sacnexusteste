import { Link, useRouterState } from '@tanstack/react-router'
import {
  BellIcon,
  Building2Icon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  FilesIcon,
  HomeIcon,
  InboxIcon,
  LogOutIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from 'lucide-react'

import { DemoProfileSwitcher, useDemoSession } from '@/modules/auth'
import { ApplicationBrandMark } from '@/modules/shared/components/application-brand-mark'
import { Avatar, AvatarFallback } from '@/modules/shared/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/modules/shared/components/ui/collapsible'
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/modules/shared/components/ui/sidebar'
import { TooltipProvider } from '@/modules/shared/components/ui/tooltip'

import { useProcesses } from '../lib/process-store'

interface ContributorShellProps {
  title: string
  children: React.ReactNode
}

export function ContributorShell({ title, children }: ContributorShellProps) {
  const { state } = useProcesses()

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
            '--status-success': '#dbf5e3',
            '--status-success-foreground': '#14612e',
            '--status-info': '#e0f0ff',
            '--status-info-foreground': '#144d94',
            '--sidebar': '#ffffff',
            '--sidebar-foreground': '#404047',
            '--sidebar-accent': '#f2f2ff',
            '--sidebar-accent-foreground': '#403bad',
            '--sidebar-border': '#e3e3e8',
          } as React.CSSProperties
        }
      >
        <ContributorSidebar />
        <SidebarInset className="min-w-0 bg-muted/20">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger />
              <p className="truncate font-medium text-sm">{title}</p>
            </div>
            <span className="max-w-56 truncate rounded-full bg-primary/5 px-3 py-1.5 font-medium text-primary text-xs">
              {state.actor.name}
            </span>
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function ContributorSidebar() {
  const pathname = useRouterState({ select: (routerState) => routerState.location.pathname })
  const { meta, state } = useProcesses()
  const { session } = useDemoSession()
  const isAdmin = session?.profile.type === 'admin'
  const isNewProcess = pathname.startsWith('/processes/new')
  const isAvcbList = pathname === '/processes/avcb'
  const isCompletedProcess = pathname.startsWith('/processes/') && !isNewProcess && !isAvcbList

  return (
    <Sidebar
      collapsible="icon"
      className="[&_[data-slot=sidebar-menu-button]]:text-[13px] [&_[data-slot=sidebar-menu-sub-button]]:text-xs"
    >
      <SidebarHeader className="h-14 justify-center border-b px-3 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/dashboard" />}
              size="lg"
              tooltip="SAC-NEXUS"
              className="h-12"
            >
              <ApplicationBrandMark />
              <span className="flex min-w-0 flex-1 flex-col items-start leading-tight">
                <span className="truncate font-semibold tracking-tight">SAC-NEXUS</span>
                <span className="truncate text-muted-foreground text-xs">
                  {state.actor.profileLabel}
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/dashboard" />}
              isActive={pathname === '/dashboard'}
              tooltip="Início"
            >
              <HomeIcon />
              <span>Início</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {isAdmin ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/triagem" />}
                isActive={pathname.startsWith('/triagem')}
                tooltip="Triagem (CBMPE)"
              >
                <ShieldCheckIcon />
                <span>Triagem (CBMPE)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : null}

          {/* Solicitações — abrir um pedido e acompanhar o andamento */}
          <Collapsible defaultOpen className="group/requests" render={<SidebarMenuItem />}>
            <CollapsibleTrigger render={<SidebarMenuButton tooltip="Solicitações" />}>
              <InboxIcon />
              <span>Solicitações</span>
              <ChevronRightIcon className="ml-auto transition-transform group-data-open/requests:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link to="/companies/units" />}
                    isActive={pathname === '/companies/units'}
                  >
                    <span>Nova solicitação</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link to="/companies/eventos" />}
                    isActive={pathname.startsWith('/companies/eventos')}
                  >
                    <span>Evento temporário</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link to="/processes/new" />}
                    isActive={isNewProcess && pathname !== '/processes/new'}
                  >
                    <span>Em andamento</span>
                    <span className="ml-auto tabular-nums">{meta.activeCount}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link to="/processes/avcb" aria-label="Concluídos" />}
                    isActive={isAvcbList || isCompletedProcess}
                  >
                    <span>Concluídos</span>
                    <span className="ml-auto tabular-nums">{meta.completedCount}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          {/* Cadastros — cada empresa e, aninhadas nela, as suas unidades */}
          <Collapsible defaultOpen className="group/companies" render={<SidebarMenuItem />}>
            <CollapsibleTrigger render={<SidebarMenuButton tooltip="Cadastros" />}>
              <Building2Icon />
              <span>Cadastros</span>
              <ChevronRightIcon className="ml-auto transition-transform group-data-open/companies:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link to="/companies/empresas" />}
                    isActive={pathname === '/companies/empresas'}
                  >
                    <span>Ver empresas cadastradas</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    render={<Link to="/companies/new" search={{ returnTo: 'request' }} />}
                    isActive={pathname === '/companies/new'}
                  >
                    <PlusIcon className="size-3.5" />
                    <span>Cadastrar empresa</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>

          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/documents" />}
              isActive={pathname === '/documents'}
              tooltip="Documentos emitidos"
            >
              <FilesIcon />
              <span>Documentos</span>
            </SidebarMenuButton>
            <SidebarMenuBadge>{meta.documentCount}</SidebarMenuBadge>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/notifications" />}
              isActive={pathname === '/notifications'}
              tooltip="Notificações"
            >
              <BellIcon />
              <span>Notificações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <ContributorUserMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function ContributorUserMenu() {
  const { isMobile } = useSidebar()
  const { actions, state } = useProcesses()
  const initials = state.actor.name
    .split(' ')
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
              <span className="truncate font-medium">{state.actor.name}</span>
              <span className="truncate text-muted-foreground text-xs">{state.actor.email}</span>
            </span>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? 'bottom' : 'right'} align="end" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Conta de demonstração</DropdownMenuLabel>
              <DropdownMenuItem>
                <UserRoundIcon />
                {state.actor.profileLabel}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DemoProfileSwitcher />
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/signin" />} onClick={actions.signOut}>
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
