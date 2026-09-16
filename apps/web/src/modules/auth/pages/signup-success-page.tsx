import { SignupLayout } from '../components/signup-layout-composer'
import { SignupSuccess } from '../components/signup-success'

interface SignupSuccessPageProps {
  onBack: () => void
  onBackToSignup: () => void
}

function SignupSuccessPage({ onBack, onBackToSignup }: SignupSuccessPageProps) {
  return (
    <SignupLayout.Root>
      <SignupLayout.BackHeader onBack={onBack} />
      <SignupLayout.Content>
        <SignupLayout.Card>
          <SignupSuccess onBackToSignup={onBackToSignup} />
        </SignupLayout.Card>
      </SignupLayout.Content>
      <SignupLayout.Footer>
        <SignupLayout.SignInPrompt />
      </SignupLayout.Footer>
    </SignupLayout.Root>
  )
}

export { SignupSuccessPage }
