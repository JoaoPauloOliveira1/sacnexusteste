import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createQueryClient } from '@/modules/shared/api/query-client'
import { routeTree } from '../../../../../src/routeTree.gen'

function renderCompanySignupWizard(initialEntry = '/signup/company') {
  const queryClient = createQueryClient()
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    context: {
      queryClient,
      runtimeConfig: {
        apiUrl: '/api',
        appEnv: 'local',
        appName: 'SAC Nexus',
        authUrl: '/api/auth',
        enableMsw: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

describe('CompanySignupWizardPage', () => {
  it('renders the company data step by default', async () => {
    renderCompanySignupWizard()

    expect(
      await screen.findByRole('heading', { name: /Você está criando sua conta/i }),
    ).toBeVisible()
    expect(screen.getByLabelText('Razão social')).toBeVisible()
    expect(screen.getByLabelText('CNPJ')).toBeVisible()
  })

  it('renders the requested step from the URL', async () => {
    renderCompanySignupWizard('/signup/company?step=security')

    expect(await screen.findByLabelText('Senha')).toBeVisible()
    expect(screen.getByLabelText('Confirmação de senha')).toBeVisible()
  })
})
