import { BuildingIcon, LockIcon, MapPinIcon, UserIcon } from 'lucide-react'

import { SignupLayout } from '../components/signup-layout-composer'
import { SignupStepper } from '../components/signup-stepper'
import { TechnicalResponsibleSignupForm } from '../forms/technical-responsible-signup-form'
import { type TechnicalResponsibleSignupStep } from '../schemas/technical-responsible-signup-schema'

const technicalResponsibleSignupStepperSteps = [
  {
    icon: UserIcon,
    label: 'Dados do Responsável',
    step: 'responsible-data',
  },
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

interface TechnicalResponsibleSignupWizardPageProps {
  currentStep: TechnicalResponsibleSignupStep
  onBack: () => void
  onSuccess: () => void
  onStepChange: (step: TechnicalResponsibleSignupStep) => void
}

function TechnicalResponsibleSignupWizardPage({
  currentStep,
  onBack,
  onSuccess,
  onStepChange,
}: TechnicalResponsibleSignupWizardPageProps) {
  const shouldShowStepper = currentStep !== 'email-verification'

  return (
    <SignupLayout.Root>
      <SignupLayout.BackHeader onBack={onBack} />
      <SignupLayout.Content
        sidebar={
          shouldShowStepper ? (
            <SignupStepper
              currentStep={currentStep}
              steps={technicalResponsibleSignupStepperSteps}
            />
          ) : undefined
        }
      >
        <SignupLayout.Card>
          <TechnicalResponsibleSignupForm
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

export { TechnicalResponsibleSignupWizardPage }
