import { QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'

import { createQueryClient } from '@/modules/shared/api/query-client'
import { type PublicRuntimeConfig } from '@/modules/shared/config/env'
import { loadRuntimeConfig } from '@/modules/shared/config/runtime-config'

import { routeTree } from './routeTree.gen'

function createAppRouter(runtimeConfig: PublicRuntimeConfig) {
  const queryClient = createQueryClient()

  return createRouter({
    routeTree,
    context: {
      queryClient,
      runtimeConfig,
    },
    defaultPreload: 'intent',
    scrollRestoration: true,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = rootElement

async function bootstrap() {
  const runtimeConfig = await loadRuntimeConfig()
  const router = createAppRouter(runtimeConfig)

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={router.options.context.queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  )
}

bootstrap().catch((error: unknown) => {
  console.error(error)

  root.textContent = 'Não foi possível carregar a configuração da aplicação.'
})
