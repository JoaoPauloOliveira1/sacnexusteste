import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createQueryClient } from '@/modules/shared/api/query-client'
import { routeTree } from '../../../../../src/routeTree.gen'

function renderTechnicalResponsibleSignupWizard(initialEntry = '/signup/technical-responsible') {
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

describe('TechnicalResponsibleSignupWizardPage', () => {
  it('renders the responsible data step by default', async () => {
    renderTechnicalResponsibleSignupWizard()

    expect(
      await screen.findByRole('heading', { name: /Você está criando sua conta/i }),
    ).toBeVisible()
    expect(screen.getByLabelText('Nome')).toBeVisible()
    expect(screen.getByLabelText('Documento de identificação')).toBeVisible()
  })

  it('renders the requested step from the URL', async () => {
    renderTechnicalResponsibleSignupWizard('/signup/technical-responsible?step=company-data')

    expect(await screen.findByLabelText('Razão social')).toBeVisible()
    expect(screen.getByLabelText('CNPJ')).toBeVisible()
  })
})
