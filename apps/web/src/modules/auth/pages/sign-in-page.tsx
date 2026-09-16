import { Link, useNavigate } from '@tanstack/react-router'

import { getContributorPresentationEntryRoute } from '@/modules/processes'
import { SignInComposer } from '../components/sign-in-composer'
import { SignInForm } from '../forms/sign-in-form'
import {
  demoCredentials,
  demoIdentities,
  resolveDemoIdentity,
  useDemoSession,
} from '../lib/demo-session'
import { type SignInFormValues } from '../schemas/sign-in-schema'

function SignInPage() {
  const navigate = useNavigate()
  const { signIn } = useDemoSession()

  function enterContributorPresentation() {
    signIn({
      user: demoIdentities.contributor.user,
      profile: demoIdentities.contributor.profile,
    })
    const entryRoute = getContributorPresentationEntryRoute()
    void navigate({ to: entryRoute })
  }

  function enterPresentation(values: SignInFormValues) {
    const identity = resolveDemoIdentity(values.email, values.password)
    if (identity?.profile.type === 'triager') {
      signIn(identity)
      void navigate({ to: '/triagem' })
      return true
    }

    if (identity?.profile.type === 'analyst') {
      signIn(identity)
      void navigate({ to: '/analysis' })
      return true
    }

    if (identity?.profile.type === 'inspector') {
      signIn(identity)
      void navigate({ to: '/inspections' })
      return true
    }

    if (identity?.profile.type === 'contributor') {
      signIn(identity)
      void navigate({ to: getContributorPresentationEntryRoute() })
      return true
    }

    if (identity?.profile.type === 'admin') {
      signIn(identity)
      void navigate({ to: '/dashboard' })
      return true
    }

    return false
  }

  return (
    <SignInComposer.Root>
      <SignInComposer.BrandHeader />
      <SignInComposer.Card>
        <SignInComposer.CardBody>
          <SignInComposer.Intro>
            Entre com suas credenciais para acessar o sistema SAC Nexus
          </SignInComposer.Intro>
          <details className="-mt-3 mb-3 rounded-lg border bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
            <summary className="cursor-pointer text-center font-medium text-foreground">
              Acessos de demonstração
            </summary>
            <ul className="mt-2 space-y-1">
              <li>
                Contribuinte: {demoCredentials.contributor.email} · senha{' '}
                {demoCredentials.contributor.password}
              </li>
              <li>
                Triador: {demoCredentials.triager.email} · senha {demoCredentials.triager.password}
              </li>
              <li>
                Analista: {demoCredentials.analyst.email} · senha {demoCredentials.analyst.password}
              </li>
              <li>
                Vistoriador: {demoCredentials.inspector.email} · senha{' '}
                {demoCredentials.inspector.password}
              </li>
              <li className="border-t pt-1 font-medium text-foreground">
                Admin (acesso total): {demoCredentials.admin.email} · senha{' '}
                {demoCredentials.admin.password}
              </li>
            </ul>
          </details>
          <SignInForm
            defaultValues={{
              email: demoCredentials.contributor.email,
              password: demoCredentials.contributor.password,
            }}
            onGovBrSignIn={enterContributorPresentation}
            onSignInSuccess={enterPresentation}
            recoveryLink={
              <Link
                to="/forgot-password"
                className="cursor-pointer font-medium text-primary text-sm leading-5 hover:underline"
              >
                Esqueci minha senha
              </Link>
            }
          />
        </SignInComposer.CardBody>
        <SignInComposer.CardFooter>
          <p>
            Não tem uma conta?{' '}
            <Link to="/signup" className="cursor-pointer text-foreground hover:underline">
              Cadastre-se
            </Link>
          </p>
        </SignInComposer.CardFooter>
      </SignInComposer.Card>
      <nav
        aria-label="Acessos públicos"
        className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm"
      >
        <Link
          to="/public-consultation"
          className="cursor-pointer font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Consultar Processo
        </Link>
        <Link
          to="/about"
          className="cursor-pointer font-medium text-muted-foreground hover:text-foreground hover:underline"
        >
          Saiba mais
        </Link>
      </nav>
    </SignInComposer.Root>
  )
}

export { SignInPage }
