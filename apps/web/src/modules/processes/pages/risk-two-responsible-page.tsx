import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { Button } from '@/modules/shared/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/modules/shared/components/ui/radio-group'
import { formatCpf } from '@/modules/shared/lib/formatters/format-cpf'
import { formatPhone } from '@/modules/shared/lib/formatters/format-phone'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, ProcessPageActions, SummaryCard } from '../components/process-page'
import { useProcesses } from '../lib/process-store'
import { type RiskTwoResponsibleValues, riskTwoResponsibleSchema } from '../schemas/risk-two-schema'
import { type ResponsibleRelationship } from '../types'

const relationshipOptions: readonly {
  value: Exclude<ResponsibleRelationship, ''>
  label: string
}[] = [
  { value: 'owner', label: 'Proprietário ou sócio' },
  { value: 'legal-representative', label: 'Representante legal' },
  { value: 'proxy', label: 'Procurador' },
  { value: 'technical-responsible', label: 'Responsável técnico' },
]

export function RiskTwoResponsiblePage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<RiskTwoResponsibleValues>({
    defaultValues: {
      cpf: state.riskTwo.responsible.cpf,
      phone: state.riskTwo.responsible.phone,
      role: state.riskTwo.responsible.role,
      ...(state.riskTwo.responsible.relationship
        ? { relationship: state.riskTwo.responsible.relationship }
        : {}),
    },
    resolver: zodResolver(riskTwoResponsibleSchema),
  })
  const relationship = watch('relationship')

  function handleSave(values: RiskTwoResponsibleValues) {
    actions.saveRiskTwoResponsible(values)
    void navigate({ to: '/processes/new/declaration' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Dados do responsável"
        description="Confirme quem realiza a solicitação e como o CBMPE poderá entrar em contato."
        riskTwoStep={1}
      >
        <form onSubmit={handleSubmit(handleSave)} noValidate className="flex flex-col gap-3">
          <SummaryCard
            title={`${state.company.legalName} · CNPJ ${state.company.cnpj}`}
            description={`${state.establishment.address} · ${state.establishment.city}/${state.establishment.state}`}
          />

          <SummaryCard
            title="Solicitante e contato"
            description="A identidade da conta é apresentada como dado cadastral; complete apenas os dados necessários para esta solicitação."
          >
            <FieldGroup className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="risk-two-name">Nome completo</FieldLabel>
                <Input id="risk-two-name" value={state.actor.name} readOnly />
              </Field>
              <RequiredField
                id="risk-two-cpf"
                label="CPF"
                placeholder="000.000.000-00"
                error={errors.cpf?.message}
              >
                <Input
                  id="risk-two-cpf"
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  aria-required="true"
                  aria-invalid={!!errors.cpf}
                  {...register('cpf')}
                  onChange={(event) => {
                    event.target.value = formatCpf(event.target.value)
                    void register('cpf').onChange(event)
                  }}
                />
              </RequiredField>
              <Field>
                <FieldLabel htmlFor="risk-two-email">E-mail</FieldLabel>
                <Input id="risk-two-email" value={state.actor.email} readOnly />
              </Field>
              <RequiredField
                id="risk-two-phone"
                label="Telefone"
                placeholder="(81) 99999-0000"
                error={errors.phone?.message}
              >
                <Input
                  id="risk-two-phone"
                  inputMode="tel"
                  maxLength={15}
                  placeholder="(81) 99999-0000"
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  {...register('phone')}
                  onChange={(event) => {
                    event.target.value = formatPhone(event.target.value)
                    void register('phone').onChange(event)
                  }}
                />
              </RequiredField>
            </FieldGroup>
          </SummaryCard>

          <SummaryCard
            title="Vínculo com o estabelecimento"
            description="Selecione a opção que descreve sua atuação nesta solicitação."
          >
            <FieldSet data-invalid={!!errors.relationship}>
              <FieldLegend className="sr-only">Vínculo com o estabelecimento</FieldLegend>
              <RadioGroup
                value={relationship ?? ''}
                onValueChange={(value) =>
                  setValue('relationship', value as RiskTwoResponsibleValues['relationship'], {
                    shouldValidate: true,
                  })
                }
                className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
              >
                {relationshipOptions.map((option) => (
                  <FieldLabel key={option.value}>
                    <Field orientation="horizontal">
                      <RadioGroupItem value={option.value} />
                      <span>{option.label}</span>
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
              <FieldError>{errors.relationship?.message}</FieldError>
            </FieldSet>
            <div className="mt-4 max-w-xl">
              <RequiredField
                id="risk-two-role"
                label="Cargo ou função"
                placeholder="Ex.: Administrador"
                error={errors.role?.message}
              >
                <Input
                  id="risk-two-role"
                  placeholder="Ex.: Administrador"
                  aria-required="true"
                  aria-invalid={!!errors.role}
                  {...register('role')}
                />
              </RequiredField>
            </div>
          </SummaryCard>

          <ProcessPageActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigate({ to: '/processes/new/result' })}
            >
              Voltar
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Salvar e continuar
            </Button>
          </ProcessPageActions>
        </form>
      </ProcessPage>
    </ContributorShell>
  )
}

function RequiredField({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  placeholder: string
  error: string | undefined
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id}>
        {label}
        <span aria-hidden="true" className="ml-0.5 text-destructive">
          *
        </span>
        <span className="sr-only"> obrigatório</span>
      </FieldLabel>
      {children}
      <FieldError>{error}</FieldError>
    </Field>
  )
}
