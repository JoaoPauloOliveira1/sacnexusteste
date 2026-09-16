import signupCompanyImageUrl from '../assets/signup-company.webp'
import signupIndividualImageUrl from '../assets/signup-individual.webp'
import signupTechnicalResponsibleImageUrl from '../assets/signup-technical-responsible.webp'
import { SignupLayout } from '../components/signup-layout-composer'
import { SignupTypeCard } from '../components/signup-type-card'

const signupTypes = [
  {
    description: 'Para solicitar em nome próprio ou imóvel pessoal',
    imageAlt: 'Pessoa usando tablet para acessar serviços digitais',
    imageSrc: signupIndividualImageUrl,
    search: { step: 'personal-data' },
    title: 'Pessoa Física',
    to: '/signup/individual',
  },
  {
    description: 'Para representar empresa, comércio ou estabelecimento',
    imageAlt: 'Representante de empresa usando notebook em ambiente corporativo',
    imageSrc: signupCompanyImageUrl,
    search: { step: 'company-data' },
    title: 'Empresa / CNPJ',
    to: '/signup/company',
  },
  {
    description: 'Engenheiro, arquiteto ou procurador',
    imageAlt: 'Profissional técnico analisando documentos em uma obra',
    imageSrc: signupTechnicalResponsibleImageUrl,
    search: { step: 'responsible-data' },
    title: 'Responsável Técnico',
    to: '/signup/technical-responsible',
  },
] as const

function SignupHubPage() {
  return (
    <SignupLayout.Root>
      <SignupLayout.BackHeader to="/signin" />
      <SignupLayout.Content className="py-12 lg:py-16" contentClassName="max-w-274">
        <section className="flex w-full max-w-274 flex-col items-center gap-10">
          <h1 className="text-center font-semibold text-2xl leading-8">
            Como deseja se cadastrar?
          </h1>
          <div className="grid w-full grid-cols-1 justify-items-center gap-4 md:grid-cols-3">
            {signupTypes.map((signupType) => (
              <SignupTypeCard key={signupType.to} {...signupType} />
            ))}
          </div>
        </section>
      </SignupLayout.Content>
      <SignupLayout.Footer>
        <SignupLayout.SignInPrompt />
      </SignupLayout.Footer>
    </SignupLayout.Root>
  )
}

export { SignupHubPage }
