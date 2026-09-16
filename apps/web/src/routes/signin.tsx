import { createFileRoute } from '@tanstack/react-router'

import { SignInPage } from '@/modules/auth'

export const Route = createFileRoute('/signin')({
  component: SignInRoute,
})

function SignInRoute() {
  return <SignInPage />
}
