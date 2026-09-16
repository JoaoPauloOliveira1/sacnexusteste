import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { SignupSuccessPage } from '@/modules/auth'

export const Route = createFileRoute('/signup/company-success')({
  component: CompanySignupSuccessRoute,
})

function CompanySignupSuccessRoute() {
  const navigate = useNavigate()

  return (
    <SignupSuccessPage
      onBack={() =>
        void navigate({ to: '/signup/company', search: { step: 'email-verification' } })
      }
      onBackToSignup={() => void navigate({ to: '/signup' })}
    />
  )
}
