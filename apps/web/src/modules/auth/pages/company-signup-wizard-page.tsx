import { BuildingIcon, LockIcon, MapPinIcon } from 'lucide-react'

import { SignupLayout } from '../components/signup-layout-composer'
import { SignupStepper } from '../components/signup-stepper'
import { CompanySignupForm } from '../forms/company-signup-form'
import { type CompanySignupStep } from '../schemas/company-signup-schema'

const companySignupStepperSteps = [
  {
    icon: BuildingIcon,
    label: 'Dados da Empresa',
    step: 'company-data',
  },
  {
    icon: MapPinIcon,
    label: 'Endereço',
    step: 'address',
  },
  {
    icon: LockIcon,
    label: 'Segurança',
    step: 'security',
  },
] as const

interface CompanySignupWizardPageProps {
  currentStep: CompanySignupStep
  onBack: () => void
  onSuccess: () => void
  onStepChange: (step: CompanySignupStep) => void
}

function CompanySignupWizardPage({
  currentStep,
  onBack,
  onSuccess,
  onStepChange,
}: CompanySignupWizardPageProps) {
  const shouldShowStepper = currentStep !== 'email-verification'

  return (
    <SignupLayout.Root>
      <SignupLayout.BackHeader onBack={onBack} />
      <SignupLayout.Content
        sidebar={
          shouldShowStepper ? (
            <SignupStepper currentStep={currentStep} steps={companySignupStepperSteps} />
          ) : undefined
        }
      >
        <SignupLayout.Card>
          <CompanySignupForm
            currentStep={currentStep}
            onSuccess={onSuccess}
            onStepChange={onStepChange}
          />
        </SignupLayout.Card>
      </SignupLayout.Content>
      <SignupLayout.Footer>
        {currentStep === 'email-verification' ? (
          <p className="max-w-112 text-muted-foreground">
            Ao criar sua conta você concorda que leu e aceitou os Termos de Serviço e a Política de
            Privacidade
          </p>
        ) : null}
        <SignupLayout.SignInPrompt />
      </SignupLayout.Footer>
    </SignupLayout.Root>
  )
}

export { CompanySignupWizardPage }
