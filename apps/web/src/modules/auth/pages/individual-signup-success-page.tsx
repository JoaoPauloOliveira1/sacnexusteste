import { IndividualSignupSuccess } from '../components/individual-signup-success'
import { SignupLayout } from '../components/signup-layout-composer'

interface IndividualSignupSuccessPageProps {
  onBack: () => void
  onBackToSignup: () => void
}

function IndividualSignupSuccessPage({ onBack, onBackToSignup }: IndividualSignupSuccessPageProps) {
  return (
    <SignupLayout.Root>
      <SignupLayout.BackHeader onBack={onBack} />
      <SignupLayout.Content>
        <SignupLayout.Card>
          <IndividualSignupSuccess onBackToSignup={onBackToSignup} />
        </SignupLayout.Card>
      </SignupLayout.Content>
      <SignupLayout.Footer>
        <SignupLayout.SignInPrompt />
      </SignupLayout.Footer>
    </SignupLayout.Root>
  )
}

export { IndividualSignupSuccessPage }
