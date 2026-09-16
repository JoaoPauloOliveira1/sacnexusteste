import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { IndividualSignupSuccessPage } from '@/modules/auth'

export const Route = createFileRoute('/signup/individual-success')({
  component: IndividualSignupSuccessRoute,
})

function IndividualSignupSuccessRoute() {
  const navigate = useNavigate()

  return (
    <IndividualSignupSuccessPage
      onBack={() =>
        void navigate({ to: '/signup/individual', search: { step: 'email-verification' } })
      }
      onBackToSignup={() => void navigate({ to: '/signup' })}
    />
  )
}
