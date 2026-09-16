import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createQueryClient } from '@/modules/shared/api/query-client'
import { routeTree } from '../../../../../src/routeTree.gen'

function renderSignupHubPage() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/signup'] }),
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

describe('SignupHubPage', () => {
  it('renders the signup routing hub copy', async () => {
    renderSignupHubPage()

    expect(await screen.findByRole('heading', { name: 'Como deseja se cadastrar?' })).toBeVisible()
    expect(screen.getByText('Já tem uma conta?')).toBeVisible()
  })

  it('renders accessible signup type links with the correct destinations', async () => {
    renderSignupHubPage()

    expect(await screen.findByRole('link', { name: /Pessoa Física/i })).toHaveAttribute(
      'href',
      '/signup/individual?step=personal-data',
    )
    expect(screen.getByRole('link', { name: /Empresa \/ CNPJ/i })).toHaveAttribute(
      'href',
      '/signup/company?step=company-data',
    )
    expect(screen.getByRole('link', { name: /Responsável Técnico/i })).toHaveAttribute(
      'href',
      '/signup/technical-responsible?step=responsible-data',
    )
  })

  it('links back and sign-in actions to the sign-in route', async () => {
    renderSignupHubPage()

    expect(await screen.findByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/signin')
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/signin')
  })
})
