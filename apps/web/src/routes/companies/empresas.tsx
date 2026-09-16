import { createFileRoute } from '@tanstack/react-router'

import { EmpresasListPage } from '@/modules/companies'
import { ContributorShell } from '@/modules/processes'

export const Route = createFileRoute('/companies/empresas')({
  component: EmpresasRoute,
})

function EmpresasRoute() {
  return (
    <ContributorShell title="Empresas">
      <EmpresasListPage />
    </ContributorShell>
  )
}
