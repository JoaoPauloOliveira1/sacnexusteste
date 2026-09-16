import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { SignupSuccessPage } from '@/modules/auth'

export const Route = createFileRoute('/signup/technical-responsible-success')({
  component: TechnicalResponsibleSignupSuccessRoute,
})

function TechnicalResponsibleSignupSuccessRoute() {
  const navigate = useNavigate()

  return (
    <SignupSuccessPage
      onBack={() =>
        void navigate({
          to: '/signup/technical-responsible',
          search: { step: 'email-verification' },
        })
      }
      onBackToSignup={() => void navigate({ to: '/signup' })}
    />
  )
}
