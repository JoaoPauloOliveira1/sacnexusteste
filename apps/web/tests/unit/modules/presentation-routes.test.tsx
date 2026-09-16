import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { demoIdentities, saveDemoSession } from '@/modules/auth'
import { createQueryClient } from '@/modules/shared/api/query-client'
import { routeTree } from '../../../src/routeTree.gen'

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,cHJlc2VudGF0aW9u'),
  },
}))

const runtimeConfig = {
  apiUrl: '/api',
  appEnv: 'local' as const,
  appName: 'SAC Nexus',
  authUrl: '/api/auth',
  enableMsw: false,
}

function renderRoute(initialEntry: string) {
  const queryClient = createQueryClient()
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    context: { queryClient, runtimeConfig },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  }
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: createMemoryStorage(),
  })
  Object.defineProperty(window, 'sessionStorage', {
    configurable: true,
    value: createMemoryStorage(),
  })
  saveDemoSession({
    user: demoIdentities.contributor.user,
    profile: demoIdentities.contributor.profile,
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('presentation routes', () => {
  it.each([
    ['/first-access', 'Bem-vindo ao SAC-NEXUS'],
    ['/companies/new', 'Cadastrar empresa'],
    ['/companies/empresas', 'Empresas cadastradas'],
    ['/dashboard', 'Visão geral'],
    ['/documents', 'Documentos'],
    ['/notifications', 'Notificações'],
    ['/processes/avcb', 'Regularizações concluídas'],
    ['/processes/new', 'Regularização de estabelecimento'],
    ['/processes/new/request', 'Empresa responsável'],
    ['/processes/new/establishment', 'Dados do estabelecimento'],
    ['/processes/new/classification', 'Características do estabelecimento'],
    ['/processes/new/analyzing', 'Analisando enquadramento'],
    ['/processes/new/result', 'Resultado do enquadramento'],
    ['/processes/new/responsible', 'Dados do responsável'],
    ['/processes/new/declaration', 'Declaração de responsabilidade'],
    ['/processes/new/documents', 'Documentos exigidos'],
    ['/processes/new/payment', 'Cobrança e pagamento'],
    ['/processes/new/submit', 'Revisão e protocolo'],
    ['/processes/new/protocol', 'Solicitação protocolada'],
    ['/processes/new/validation', 'Solicitação em validação'],
    ['/processes/new/inspection', 'Vistoria necessária'],
    ['/processes/new/approved', 'Regularização aprovada'],
    ['/processes/new/review', 'Revisão e declaração'],
    ['/processes/new/processing', 'Processamento automático'],
    ['/processes/process-2026-00001234/completed', 'Dispensa de licenciamento emitida'],
    ['/processes/process-2026-00001234', 'Detalhes do processo'],
    ['/processes/process-2026-000184/history', 'Histórico do processo'],
    ['/processes/process-2026-000184/certificate', 'Certificado emitido'],
    ['/public-consultation', 'Consulta pública'],
    ['/about', 'Segurança contra incêndio com uma jornada simples e verificável'],
  ])('renders %s', async (path, heading) => {
    renderRoute(path)

    expect(await screen.findByRole('heading', { name: heading })).toBeVisible()
  })

  it('renders and operates the triage dashboard and process review', async () => {
    const user = userEvent.setup()
    saveDemoSession({
      user: demoIdentities.triager.user,
      profile: demoIdentities.triager.profile,
    })
    renderRoute('/triage/process-2026-000247')

    expect(await screen.findByRole('heading', { name: '2026.000247-1' })).toBeVisible()
    await user.click(screen.getByRole('button', { name: 'Iniciar triagem', exact: true }))
    await user.click(screen.getByRole('tab', { name: 'Documentos' }))
    await user.click(
      screen.getByRole('button', { name: 'Comparar versões de Projeto arquitetônico.pdf' }),
    )
    expect(screen.getByText('Versão 2', { exact: true })).toBeVisible()

    await user.click(screen.getByRole('tab', { name: 'Checklist' }))
    await user.click(screen.getByRole('button', { name: 'Marcar todos como conferidos' }))
    await user.click(screen.getByRole('button', { name: 'Aprovar triagem' }))

    await waitFor(() => {
      expect(screen.getAllByText('Encaminhado para Distribuição')[0]).toBeVisible()
    })
  })

  it('renders the triage queue for the authorized presentation profile', async () => {
    saveDemoSession({
      user: demoIdentities.triager.user,
      profile: demoIdentities.triager.profile,
    })
    renderRoute('/triage')

    expect(await screen.findByRole('heading', { name: 'Painel de Triagem' })).toBeVisible()
    expect(screen.getAllByRole('link', { name: 'Abrir processo' })).toHaveLength(5)
  })

  it('renders the technical analysis queue for the analyst profile', async () => {
    saveDemoSession({
      user: demoIdentities.analyst.user,
      profile: demoIdentities.analyst.profile,
    })
    renderRoute('/analysis')

    expect(await screen.findByRole('heading', { name: 'Fila de análise técnica' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Abrir análise' })).toBeVisible()
  })

  it('renders the inspection queue for the inspector profile', async () => {
    saveDemoSession({
      user: demoIdentities.inspector.user,
      profile: demoIdentities.inspector.profile,
    })
    renderRoute('/inspections')

    expect(await screen.findByRole('heading', { name: 'Fila de vistorias' })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Abrir vistoria' })).toBeVisible()
  })
})
