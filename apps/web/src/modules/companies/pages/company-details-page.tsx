import { Link } from '@tanstack/react-router'
import { Building2Icon, FilePlus2Icon, PlusIcon } from 'lucide-react'

import { Badge } from '@/modules/shared/components/ui/badge'
import { buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/modules/shared/components/ui/empty'
import { cn } from '@/modules/shared/lib/utils'

import { useCompanies } from '../lib/company-store'

export function CompanyDetailsPage({ companyId }: { companyId: string }) {
  const { companies } = useCompanies()
  const company = companies.find((candidate) => candidate.id === companyId)

  if (!company) {
    return (
      <main className="flex min-h-0 flex-1 flex-col bg-[#fbfbfc] px-4 py-7 sm:px-6 lg:px-10">
        <Card className="rounded-md py-0 shadow-none">
          <CardContent className="p-0">
            <Empty className="min-h-72">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Building2Icon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>Empresa não encontrada</EmptyTitle>
                <EmptyDescription>
                  A empresa pode não estar mais disponível nesta sessão de demonstração.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link
                  to="/companies/new"
                  className={buttonVariants({ className: 'rounded-md px-4' })}
                >
                  <PlusIcon data-icon="inline-start" />
                  Cadastrar empresa
                </Link>
              </EmptyContent>
            </Empty>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-3 bg-[#fbfbfc] px-4 py-7 text-[13px] sm:px-6 lg:px-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <h1 className="font-semibold text-2xl leading-8 tracking-tight">{company.tradeName}</h1>
          <p className="text-muted-foreground">
            Consulte os dados cadastrais e de contato da empresa.
          </p>
        </div>
        <Badge variant="secondary">{company.registrationStatus}</Badge>
      </header>

      <CompanyDetailsCard
        title="Identificação da empresa"
        items={[
          { label: 'Razão social', value: company.legalName },
          { label: 'Nome fantasia', value: company.tradeName },
          { label: 'CNPJ', value: company.cnpj },
          { label: 'Data de abertura', value: company.openingDate },
          { label: 'Natureza jurídica', value: company.legalNature },
          { label: 'CNAE principal', value: company.primaryCnae },
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <CompanyDetailsCard
          title="Endereço"
          items={[
            { label: 'CEP', value: company.cep },
            {
              label: 'Logradouro',
              value: `${company.address}, ${company.number}${
                company.complement ? ` — ${company.complement}` : ''
              }`,
            },
            { label: 'Bairro', value: company.neighborhood },
            { label: 'Município', value: `${company.city} — ${company.state}` },
          ]}
        />
        <CompanyDetailsCard
          title="Contato e responsável"
          items={[
            { label: 'Telefone', value: company.phone },
            { label: 'Celular', value: company.mobile },
            { label: 'E-mail institucional', value: company.institutionalEmail },
            { label: 'Responsável', value: company.processOwner },
            { label: 'Cargo', value: company.processOwnerRole },
          ]}
        />
      </div>

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
        <Link
          to="/companies/new"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            'rounded-md px-4 text-[13px]',
          )}
        >
          <PlusIcon data-icon="inline-start" />
          Cadastrar outra empresa
        </Link>
        <Link
          to="/processes/new"
          className={cn(buttonVariants({ size: 'lg' }), 'rounded-md px-4 text-[13px]')}
        >
          <FilePlus2Icon data-icon="inline-start" />
          Iniciar novo processo
        </Link>
      </div>
    </main>
  )
}

function CompanyDetailsCard({
  title,
  items,
}: {
  title: string
  items: readonly { label: string; value: string }[]
}) {
  return (
    <Card className="gap-3 rounded-md py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="flex min-w-0 flex-col gap-1">
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="break-words font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
