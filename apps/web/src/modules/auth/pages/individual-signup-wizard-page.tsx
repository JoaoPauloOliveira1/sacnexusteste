import { SignupLayout } from '../components/signup-layout-composer'
import { individualSignupStepperSteps, SignupStepper } from '../components/signup-stepper'
import { IndividualSignupForm } from '../forms/individual-signup-form'
import { type IndividualSignupStep } from '../schemas/individual-signup-schema'

interface IndividualSignupWizardPageProps {
  currentStep: IndividualSignupStep
  onBack: () => void
  onSuccess: () => void
  onStepChange: (step: IndividualSignupStep) => void
}

function IndividualSignupWizardPage({
  currentStep,
  onBack,
  onSuccess,
  onStepChange,
}: IndividualSignupWizardPageProps) {
  const shouldShowStepper = currentStep !== 'email-verification'

  return (
    <SignupLayout.Root>
      <SignupLayout.BackHeader onBack={onBack} />
      <SignupLayout.Content
        sidebar={
          shouldShowStepper ? (
            <SignupStepper currentStep={currentStep} steps={individualSignupStepperSteps} />
          ) : undefined
        }
      >
        <SignupLayout.Card>
          <IndividualSignupForm
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

export { IndividualSignupWizardPage }
