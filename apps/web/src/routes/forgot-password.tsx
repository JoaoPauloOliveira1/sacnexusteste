import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forgot-password')({
  component: ForgotPasswordRoute,
})

function ForgotPasswordRoute() {
  return (
    <main className="min-h-svh bg-background">
      <h1 className="sr-only">Recuperação de senha</h1>
    </main>
  )
}
