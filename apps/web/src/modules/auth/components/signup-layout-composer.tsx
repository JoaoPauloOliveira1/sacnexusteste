import { Link } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'

import { cn } from '@/modules/shared/lib/utils'

type SignupLayoutBackHeaderProps = {
  label?: string
  onBack?: () => void
  to?: React.ComponentProps<typeof Link>['to']
}

const backControlClassName =
  'inline-flex h-auto cursor-pointer items-center gap-2 p-0 font-medium text-foreground text-sm leading-5 outline-none transition-colors hover:text-primary focus-visible:rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-6'

function SignupLayoutRoot({ children, className }: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn(
        'flex min-h-svh flex-col bg-background px-4 py-8 text-foreground sm:px-8 lg:px-16 lg:py-22',
        className,
      )}
    >
      {children}
    </main>
  )
}

function SignupLayoutBackHeader({ label = 'Voltar', onBack, to }: SignupLayoutBackHeaderProps) {
  return (
    <header className="flex items-center">
      {to ? (
        <Link to={to} className={backControlClassName}>
          <ArrowLeftIcon aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ) : (
        <button type="button" className={backControlClassName} onClick={onBack}>
          <ArrowLeftIcon aria-hidden="true" />
          <span>{label}</span>
        </button>
      )}
    </header>
  )
}

function SignupLayoutContent({
  children,
  className,
  contentClassName,
  sidebar,
}: {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  sidebar?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex flex-1 justify-center py-8',
        sidebar ? 'lg:items-start lg:pt-14 lg:pb-12' : 'items-center lg:py-10',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex w-full max-w-112 flex-col items-center gap-5',
          sidebar ? 'lg:max-w-none lg:items-stretch' : 'lg:mx-auto',
          contentClassName,
        )}
      >
        {sidebar}
        <div className={cn('w-full lg:mx-auto', sidebar ? 'lg:max-w-112' : undefined)}>
          {children}
        </div>
      </div>
    </div>
  )
}

function SignupLayoutCard({ children, className }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('w-full rounded-3xl bg-muted p-2 text-card-foreground sm:max-w-112', className)}
    >
      <div className="w-full rounded-2xl bg-background p-6 shadow-xs sm:p-8">{children}</div>
    </section>
  )
}

function SignupLayoutFooter({ children, className }: React.ComponentProps<'footer'>) {
  return (
    <footer
      className={cn(
        'flex min-h-17 flex-col items-center justify-center gap-4 text-center font-medium text-sm leading-5',
        className,
      )}
    >
      {children}
    </footer>
  )
}

function SignupLayoutSignInPrompt() {
  return (
    <p className="text-muted-foreground">
      Já tem uma conta?{' '}
      <Link to="/signin" className="cursor-pointer text-foreground hover:underline">
        Entrar
      </Link>
    </p>
  )
}

const SignupLayout = {
  BackHeader: SignupLayoutBackHeader,
  Card: SignupLayoutCard,
  Content: SignupLayoutContent,
  Footer: SignupLayoutFooter,
  Root: SignupLayoutRoot,
  SignInPrompt: SignupLayoutSignInPrompt,
}

export { SignupLayout }
