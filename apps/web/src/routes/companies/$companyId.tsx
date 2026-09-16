import { createFileRoute } from '@tanstack/react-router'

import { CompanyDetailsPage, useCompanies } from '@/modules/companies'
import { ContributorShell } from '@/modules/processes'

export const Route = createFileRoute('/companies/$companyId')({
  component: CompanyDetailsRoute,
})

function CompanyDetailsRoute() {
  const { companyId } = Route.useParams()
  const { companies } = useCompanies()
  const company = companies.find((candidate) => candidate.id === companyId)

  return (
    <ContributorShell title={company?.tradeName ?? 'Empresas'}>
      <CompanyDetailsPage companyId={companyId} />
    </ContributorShell>
  )
}
