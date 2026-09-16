import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createQueryClient } from '@/modules/shared/api/query-client'
import { routeTree } from '../../../../../src/routeTree.gen'

function renderIndividualSignupWizard(initialEntry = '/signup/individual') {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    context: {
      queryClient: createQueryClient(),
      runtimeConfig: {
        apiUrl: '/api',
        appEnv: 'local',
        appName: 'SAC Nexus',
        authUrl: '/api/auth',
        enableMsw: false,
      },
    },
  })

  return render(<RouterProvider router={router} />)
}

describe('IndividualSignupWizardPage', () => {
  it('renders the personal data step by default', async () => {
    renderIndividualSignupWizard()

    expect(
      await screen.findByRole('heading', { name: /Você está criando sua conta/i }),
    ).toBeVisible()
    expect(screen.getByLabelText('Nome')).toBeVisible()
    expect(screen.getByLabelText('CPF')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeVisible()
  })

  it('renders the requested step from the URL', async () => {
    renderIndividualSignupWizard('/signup/individual?step=security')

    expect(
      await screen.findByRole('heading', { name: /Você está criando sua conta/i }),
    ).toBeVisible()
    expect(screen.getByLabelText('Senha')).toBeVisible()
    expect(screen.getByLabelText('Confirmação de senha')).toBeVisible()
  })
})
