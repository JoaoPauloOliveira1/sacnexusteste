import { createFileRoute } from '@tanstack/react-router'

import { SignupHubPage } from '@/modules/auth'

export const Route = createFileRoute('/signup/')({
  component: SignupIndexRoute,
})

function SignupIndexRoute() {
  return <SignupHubPage />
}
