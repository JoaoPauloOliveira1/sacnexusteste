import { Button } from '@/modules/shared/components/ui/button'

import cbmpeCrestUrl from '../assets/cbmpe-crest.svg'
import govBrLogoUrl from '../assets/gov-br-logo.svg'
import sacNexusLogoUrl from '../assets/sac-nexus-logo.svg'

function Root({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <div className="flex w-full max-w-112 flex-col items-center gap-8">{children}</div>
    </main>
  )
}

function BrandHeader() {
  return (
    <header className="flex h-20 w-55 items-center justify-center gap-5 text-center">
      <img src={cbmpeCrestUrl} alt="Brasão do CBMPE" className="size-17.5" />
      <img src={sacNexusLogoUrl} alt="SAC Nexus" className="h-20 w-auto" />
    </header>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-129.5 w-full flex-col gap-2 rounded-2xl bg-muted p-2 shadow-sm">
      {children}
    </section>
  )
}

function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-112.5 rounded-xl border border-border bg-card px-8 pt-8 shadow-xs">
      {children}
    </div>
  )
}

function Intro({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-20 items-start justify-center">
      <p className="max-w-65 text-center text-muted-foreground text-sm leading-5">{children}</p>
    </div>
  )
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <footer className="flex h-11 items-center justify-center font-medium text-muted-foreground text-sm leading-5">
      {children}
    </footer>
  )
}

function GovBrButton({ onClick }: { onClick?: (() => void) | undefined }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-10 w-full rounded-full"
      onClick={onClick}
    >
      <span>Entrar com</span>
      <img src={govBrLogoUrl} alt="gov.br" className="h-5 w-auto" />
    </Button>
  )
}

const SignInComposer = {
  BrandHeader,
  Card,
  CardBody,
  CardFooter,
  GovBrButton,
  Intro,
  Root,
}

export { SignInComposer }
