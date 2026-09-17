import { createFileRoute, redirect } from '@tanstack/react-router'

import { hasDemoProfile } from '@/modules/auth'
import { TriagemListPage } from '@/modules/companies'

export const Route = createFileRoute('/triagem/')({
  beforeLoad: () => {
    // The triagem queue is the CBMPE triager's area. Contributors reach their
    // own process dossiê from the dashboard, not this list.
    if (!hasDemoProfile('triager')) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: TriagemListPage,
})
