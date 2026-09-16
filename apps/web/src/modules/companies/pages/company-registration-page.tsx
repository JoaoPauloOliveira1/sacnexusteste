import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon, SearchIcon } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { type UseFormRegisterReturn, useForm } from 'react-hook-form'

import { useRegisterEmpresa } from '@/modules/shared/api/use-register-empresa'
import { Button, buttonVariants } from '@/modules/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shared/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { formatBrazilianDate } from '@/modules/shared/lib/formatters/format-brazilian-date'
import { formatCep } from '@/modules/shared/lib/formatters/format-cep'
import { formatCnpj } from '@/modules/shared/lib/formatters/format-cnpj'
import { formatPhone } from '@/modules/shared/lib/formatters/format-phone'
import { cn } from '@/modules/shared/lib/utils'
import { getCnpjDigits, isValidCnpj } from '@/modules/shared/lib/validators/validate-cnpj'

import { emptyCompany } from '../lib/company-data'
import { useCompanies } from '../lib/company-store'
import {
  type CompanyRegistrationValues,
  companyRegistrationSchema,
} from '../schemas/company-registration-schema'

type CompanyRegistrationReturn = 'dashboard' | 'request' | 'review'

export function CompanyRegistrationPage({
  returnTo = 'dashboard',
}: {
  returnTo?: CompanyRegistrationReturn
}) {
  const navigate = useNavigate()
  const { registerCompany } = useCompanies()
  const cnpjLookup = useRegisterEmpresa()
  const {
    formState: { errors, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<CompanyRegistrationValues>({
    defaultValues: {
      cnpj: emptyCompany.cnpj,
      legalName: emptyCompany.legalName,
      tradeName: emptyCompany.tradeName,
      registrationStatus: emptyCompany.registrationStatus,
      openingDate: emptyCompany.openingDate,
      legalNature: emptyCompany.legalNature,
      primaryCnae: emptyCompany.primaryCnae,
      cep: emptyCompany.cep,
      address: emptyCompany.address,
      number: emptyCompany.number,
      complement: emptyCompany.complement,
      neighborhood: emptyCompany.neighborhood,
      city: emptyCompany.city,
      state: emptyCompany.state,
      phone: emptyCompany.phone,
      mobile: emptyCompany.mobile,
      institutionalEmail: emptyCompany.institutionalEmail,
      processOwner: emptyCompany.processOwner,
      processOwnerRole: emptyCompany.processOwnerRole,
    },
    resolver: zodResolver(companyRegistrationSchema),
  })

  async function handleCnpjLookup() {
    try {
      const data = await cnpjLookup.mutateAsync(getValues('cnpj'))
      const principal = data.cnaes.find((entry) => entry.principal)
      const isoToBr = (iso: string | null) => {
        if (!iso) return ''
        const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
        return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
      }
      const entries: Array<[keyof CompanyRegistrationValues, string]> = [
        ['legalName', data.legalName],
        ['tradeName', data.tradeName],
        ['registrationStatus', data.registrationStatus],
        ['openingDate', isoToBr(data.openingDate)],
        ['legalNature', data.legalNature],
        ['primaryCnae', principal ? `${principal.codigo} - ${principal.descricao}` : ''],
        ['cep', data.cep ? formatCep(data.cep) : ''],
        ['address', data.street],
        ['number', data.number],
        ['complement', data.complement],
        ['neighborhood', data.neighborhood],
        ['city', data.city],
        ['state', data.state],
        ['phone', data.phone ? formatPhone(data.phone) : ''],
        ['institutionalEmail', data.email],
      ]
      for (const [field, value] of entries) {
        if (value) {
          setValue(field, value, { shouldValidate: true, shouldDirty: true })
        }
      }
    } catch {
      // Error is surfaced through cnpjLookup.error below.
    }
  }

  // Auto-fill as soon as a complete, valid CNPJ is entered — no button click needed.
  // Runs once per distinct CNPJ; the button below is only a manual retry.
  const lastLookedUpCnpj = useRef('')
  const cnpjValue = watch('cnpj')

  // biome-ignore lint/correctness/useExhaustiveDependencies: fire once per completed CNPJ change
  useEffect(() => {
    const digits = getCnpjDigits(cnpjValue ?? '')
    if (digits.length !== 14 || !isValidCnpj(digits) || lastLookedUpCnpj.current === digits) {
      return
    }
    lastLookedUpCnpj.current = digits
    void handleCnpjLookup()
  }, [cnpjValue])

  function handleSave(values: CompanyRegistrationValues) {
    registerCompany({
      id: `company-${values.cnpj.replace(/\D/g, '')}`,
      ...values,
    })

    const destination =
      returnTo === 'request'
        ? '/processes/new/request'
        : returnTo === 'review'
          ? '/processes/new/review'
          : '/dashboard'
    void navigate({ to: destination })
  }

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <Link
          to={returnTo === 'request' ? '/processes/new/request' : '/dashboard'}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-fit')}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-semibold text-3xl tracking-tight">Cadastrar empresa</h1>
          <p className="text-muted-foreground">
            Informe os dados da empresa que poderá ser selecionada em novos processos.
          </p>
          <p className="text-muted-foreground text-sm">
            Ao informar um CNPJ válido, os dados e <strong>todos os CNAEs</strong> são preenchidos
            automaticamente a partir da base da Receita. Revise e ajuste se necessário. Os campos
            marcados com <span className="text-destructive">*</span> são obrigatórios.
          </p>
        </header>

        <form onSubmit={handleSubmit(handleSave)} noValidate className="flex flex-col gap-4">
          <CompanyFormCard title="Identificação da empresa">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <CompanyField
                    id="cnpj"
                    label="CNPJ"
                    placeholder="12.345.678/0001-90"
                    error={errors.cnpj?.message}
                    registration={register('cnpj')}
                    transform={formatCnpj}
                    inputMode="numeric"
                    maxLength={18}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="sm:mb-[2px]"
                  onClick={() => void handleCnpjLookup()}
                  isLoading={cnpjLookup.isPending}
                >
                  <SearchIcon data-icon="inline-start" />
                  Buscar novamente
                </Button>
              </div>
              {cnpjLookup.isError ? (
                <p className="text-destructive text-sm">{cnpjLookup.error.message}</p>
              ) : null}
              {cnpjLookup.isSuccess ? (
                <p className="text-muted-foreground text-sm">
                  Dados preenchidos automaticamente. Revise e complete os campos restantes.
                </p>
              ) : null}
            </div>
            <CompanyField
              id="legalName"
              label="Razão social"
              placeholder="Ex.: Empresa Exemplo LTDA"
              error={errors.legalName?.message}
              registration={register('legalName')}
            />
            <CompanyField
              id="tradeName"
              label="Nome fantasia"
              placeholder="Ex.: Empresa Exemplo"
              error={errors.tradeName?.message}
              registration={register('tradeName')}
            />
            <CompanyField
              id="registrationStatus"
              label="Situação cadastral"
              placeholder="Ex.: Ativa"
              error={errors.registrationStatus?.message}
              registration={register('registrationStatus')}
            />
            <CompanyField
              id="openingDate"
              label="Data de abertura"
              placeholder="DD/MM/AAAA"
              error={errors.openingDate?.message}
              registration={register('openingDate')}
              transform={formatBrazilianDate}
              inputMode="numeric"
              maxLength={10}
            />
            <CompanyField
              id="legalNature"
              label="Natureza jurídica"
              placeholder="Ex.: Sociedade Empresária Limitada"
              error={errors.legalNature?.message}
              registration={register('legalNature')}
            />
            <CompanyField
              id="primaryCnae"
              label="CNAE principal"
              placeholder="Código e descrição da atividade principal"
              error={errors.primaryCnae?.message}
              registration={register('primaryCnae')}
            />
          </CompanyFormCard>

          {cnpjLookup.data && cnpjLookup.data.cnaes.length > 0 ? (
            <CompanyFormCard title={`CNAEs da empresa (${cnpjLookup.data.cnaes.length})`}>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <p className="text-muted-foreground text-sm">
                  Todos os CNAEs recuperados da Receita. A <strong>classificação de risco</strong> é
                  feita depois, por <strong>unidade</strong> — aqui é só o cadastro da empresa.
                </p>
                {cnpjLookup.data.cnaes.map((cnae) => (
                  <div
                    key={`${cnae.codigo}-${cnae.principal ? 'p' : 's'}`}
                    className="flex items-center gap-3 rounded-md border p-2.5 text-sm"
                  >
                    <span className="font-medium tabular-nums">{cnae.codigo}</span>
                    <span className="flex-1 text-muted-foreground">{cnae.descricao}</span>
                    {cnae.principal ? (
                      <span className="whitespace-nowrap rounded bg-primary/10 px-2 py-0.5 text-primary text-xs">
                        principal
                      </span>
                    ) : null}
                  </div>
                ))}
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void navigate({
                        to: '/companies/unit',
                        search: { empresaId: cnpjLookup.data?.empresaId },
                      })
                    }
                  >
                    Cadastrar unidade desta empresa
                  </Button>
                </div>
              </div>
            </CompanyFormCard>
          ) : null}

          <CompanyFormCard title="Contato e responsável">
            <CompanyField
              id="phone"
              label="Telefone"
              placeholder="(81) 3030-0000"
              error={errors.phone?.message}
              registration={register('phone')}
              transform={formatPhone}
              inputMode="tel"
              maxLength={15}
            />
            <CompanyField
              id="mobile"
              label="Celular"
              placeholder="(81) 99999-0000"
              error={errors.mobile?.message}
              registration={register('mobile')}
              transform={formatPhone}
              inputMode="tel"
              maxLength={15}
            />
            <CompanyField
              id="institutionalEmail"
              label="E-mail institucional"
              type="email"
              placeholder="contato@empresa.com.br"
              error={errors.institutionalEmail?.message}
              registration={register('institutionalEmail')}
            />
            <CompanyField
              id="processOwner"
              label="Responsável pelo processo"
              placeholder="Nome completo"
              error={errors.processOwner?.message}
              registration={register('processOwner')}
            />
            <CompanyField
              id="processOwnerRole"
              label="Cargo do responsável"
              placeholder="Ex.: Representante legal"
              error={errors.processOwnerRole?.message}
              registration={register('processOwnerRole')}
            />
          </CompanyFormCard>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                void navigate({
                  to:
                    returnTo === 'request'
                      ? '/processes/new/request'
                      : returnTo === 'review'
                        ? '/processes/new/review'
                        : '/dashboard',
                })
              }
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Salvar empresa
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

function CompanyFormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="gap-4 rounded-md py-5 shadow-none">
      <CardHeader className="px-5">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        <FieldGroup className="grid gap-4 sm:grid-cols-2">{children}</FieldGroup>
      </CardContent>
    </Card>
  )
}

function CompanyField({
  id,
  label,
  placeholder,
  registration,
  error,
  required = true,
  type = 'text',
  transform,
  inputMode,
  maxLength,
}: {
  id: string
  label: string
  placeholder: string
  registration: UseFormRegisterReturn
  error?: string | undefined
  required?: boolean
  type?: 'email' | 'text'
  transform?: ((value: string) => string) | undefined
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number | undefined
}) {
  return (
    <Field data-invalid={!!error} className="gap-1.5">
      <FieldLabel htmlFor={id}>
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
            <span className="sr-only"> obrigatório</span>
          </>
        ) : null}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10 rounded-md bg-input-background"
        {...registration}
        onChange={(event) => {
          if (transform) {
            event.target.value = transform(event.target.value)
          }
          void registration.onChange(event)
        }}
      />
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}
