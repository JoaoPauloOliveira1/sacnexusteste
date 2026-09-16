import { Link, useNavigate } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

import { useCompanies } from '@/modules/companies'
import { Button } from '@/modules/shared/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, ProcessPageActions, SummaryCard } from '../components/process-page'
import { useProcesses } from '../lib/process-store'

export function RequestConfirmationPage() {
  const navigate = useNavigate()
  const { companies } = useCompanies()
  const { actions, meta, state } = useProcesses()
  const companiesWithAnotherActiveRequest = new Set(
    meta.activeProcesses
      .filter(({ process }) => process.id !== state.process.id)
      .map(({ company }) => company.id),
  )

  function handleContinue() {
    actions.confirmRequest()
    void navigate({ to: '/processes/new/establishment' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Empresa responsável"
        description="Selecione a empresa vinculada ao estabelecimento que será regularizado."
        step={1}
      >
        <SummaryCard
          title="Selecione uma empresa"
          description="A empresa selecionada será responsável por esta solicitação."
        >
          <FieldGroup className="grid gap-3 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="request-company">
                Empresa
                <span aria-hidden="true" className="ml-0.5 text-destructive">
                  *
                </span>
                <span className="sr-only"> obrigatório</span>
              </FieldLabel>
              <Select
                value={state.company.id || null}
                onValueChange={(companyId) => {
                  const company = companies.find((candidate) => candidate.id === companyId)
                  if (company) {
                    actions.saveCompany(company)
                  }
                }}
              >
                <SelectTrigger
                  id="request-company"
                  aria-required="true"
                  className="h-10 w-full rounded-md bg-input-background px-3 text-[13px]"
                >
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.id}
                        value={company.id}
                        disabled={companiesWithAnotherActiveRequest.has(company.id)}
                      >
                        {company.legalName}
                        {companiesWithAnotherActiveRequest.has(company.id)
                          ? ' — solicitação em andamento'
                          : ''}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Link
                to="/companies/new"
                search={{ returnTo: 'request' }}
                className="mt-1 flex w-fit cursor-pointer items-center gap-1 text-primary text-xs hover:underline"
              >
                <PlusIcon className="size-3.5" aria-hidden="true" />
                Cadastrar nova empresa
              </Link>
            </Field>
            <Field>
              <FieldLabel htmlFor="request-cnpj">CNPJ</FieldLabel>
              <Input
                id="request-cnpj"
                value={state.company.cnpj}
                placeholder="Selecione uma empresa"
                readOnly
              />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="request-service">Serviço</FieldLabel>
              <Input id="request-service" value="Regularização de estabelecimento" readOnly />
            </Field>
          </FieldGroup>
        </SummaryCard>

        <SummaryCard
          title="Enquadramento definido pelo sistema"
          description="O risco e o rito aplicáveis serão apresentados depois da análise das características do estabelecimento."
        />

        <ProcessPageActions>
          <Button
            type="button"
            variant="outline"
            onClick={() => void navigate({ to: '/dashboard' })}
          >
            Cancelar
          </Button>
          <Button type="button" size="lg" disabled={!state.company.id} onClick={handleContinue}>
            Continuar
          </Button>
        </ProcessPageActions>
      </ProcessPage>
    </ContributorShell>
  )
}
