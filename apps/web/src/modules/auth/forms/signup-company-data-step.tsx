import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

import { useCnpjLookup } from '@/modules/shared/api/use-cnpj-lookup'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { formatCnpj } from '@/modules/shared/lib/formatters/format-cnpj'
import { formatCpf } from '@/modules/shared/lib/formatters/format-cpf'
import { formatPhone } from '@/modules/shared/lib/formatters/format-phone'
import { getCnpjDigits, isValidCnpj } from '@/modules/shared/lib/validators/validate-cnpj'

import { type CompanySignupFormValues } from '../schemas/company-signup-schema'

function SignupCompanyDataStep() {
  const {
    formState: { errors },
    register,
    setValue,
    watch,
  } = useFormContext<CompanySignupFormValues>()
  const cnpjLookup = useCnpjLookup()

  const cnpj = watch('cnpj')
  const representativeCpf = watch('representativeCpf')
  const phone = watch('phone')

  // Auto-fill company data + address as soon as a complete, valid CNPJ is entered.
  const lastLookedUpCnpj = useRef('')

  // biome-ignore lint/correctness/useExhaustiveDependencies: fire once per completed CNPJ change
  useEffect(() => {
    const digits = getCnpjDigits(cnpj ?? '')
    if (digits.length !== 14 || !isValidCnpj(digits) || lastLookedUpCnpj.current === digits) {
      return
    }
    lastLookedUpCnpj.current = digits

    void (async () => {
      try {
        const data = await cnpjLookup.mutateAsync(cnpj)
        const entries: Array<[keyof CompanySignupFormValues, string]> = [
          ['legalName', data.legalName],
          ['tradeName', data.tradeName],
          ['email', data.institutionalEmail],
          ['phone', data.phone || data.mobile],
          ['cep', data.cep],
          ['street', data.address],
          ['number', data.number],
          ['neighborhood', data.neighborhood],
          ['city', data.city],
          ['state', data.state],
        ]
        for (const [field, value] of entries) {
          if (value) {
            setValue(field, value, { shouldDirty: true })
          }
        }
      } catch {
        // Error surfaced through cnpjLookup.error below.
      }
    })()
  }, [cnpj])

  return (
    <FieldGroup className="gap-4">
      <Field data-invalid={!!errors.legalName} className="gap-1.5">
        <FieldLabel htmlFor="legalName">Razão social</FieldLabel>
        <Input
          id="legalName"
          className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          placeholder="Insira a razão social"
          aria-invalid={!!errors.legalName}
          aria-describedby={errors.legalName ? 'legalName-error' : undefined}
          {...register('legalName')}
        />
        <FieldError id="legalName-error">{errors.legalName?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.tradeName} className="gap-1.5">
        <FieldLabel htmlFor="tradeName">Nome fantasia</FieldLabel>
        <Input
          id="tradeName"
          className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          placeholder="Insira o nome fantasia"
          aria-invalid={!!errors.tradeName}
          aria-describedby={errors.tradeName ? 'tradeName-error' : undefined}
          {...register('tradeName')}
        />
        <FieldError id="tradeName-error">{errors.tradeName?.message}</FieldError>
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field data-invalid={!!errors.cnpj} className="gap-1.5">
          <FieldLabel htmlFor="cnpj">CNPJ</FieldLabel>
          <Input
            id="cnpj"
            inputMode="numeric"
            autoComplete="off"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira o CNPJ"
            value={cnpj}
            aria-invalid={!!errors.cnpj}
            aria-describedby={errors.cnpj ? 'cnpj-error' : undefined}
            onChange={(event) =>
              setValue('cnpj', formatCnpj(event.target.value), { shouldDirty: true })
            }
          />
          <FieldError id="cnpj-error">{errors.cnpj?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.representativeCpf} className="gap-1.5">
          <FieldLabel htmlFor="representativeCpf">CPF representante</FieldLabel>
          <Input
            id="representativeCpf"
            inputMode="numeric"
            autoComplete="off"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira o CPF"
            value={representativeCpf}
            aria-invalid={!!errors.representativeCpf}
            aria-describedby={errors.representativeCpf ? 'representativeCpf-error' : undefined}
            onChange={(event) =>
              setValue('representativeCpf', formatCpf(event.target.value), { shouldDirty: true })
            }
          />
          <FieldError id="representativeCpf-error">{errors.representativeCpf?.message}</FieldError>
        </Field>
      </div>

      {cnpjLookup.isPending ? (
        <p className="text-muted-foreground text-sm">Buscando dados da empresa…</p>
      ) : null}
      {cnpjLookup.isError ? (
        <p className="text-destructive text-sm">{cnpjLookup.error.message}</p>
      ) : null}
      {cnpjLookup.isSuccess ? (
        <p className="text-muted-foreground text-sm">
          Dados e endereço preenchidos automaticamente. Revise nas próximas etapas.
        </p>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <Field data-invalid={!!errors.email} className="gap-1.5">
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira um e-mail"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          <FieldError id="email-error">{errors.email?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.phone} className="gap-1.5">
          <FieldLabel htmlFor="phone">Telefone</FieldLabel>
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira um telefone"
            value={phone}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            onChange={(event) =>
              setValue('phone', formatPhone(event.target.value), { shouldDirty: true })
            }
          />
          <FieldError id="phone-error">{errors.phone?.message}</FieldError>
        </Field>
      </div>

      {cnpjLookup.data && cnpjLookup.data.cnaes.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-sm">CNAEs da empresa ({cnpjLookup.data.cnaes.length})</p>
          <div className="flex max-h-56 flex-col gap-1.5 overflow-auto rounded-md border p-2">
            {cnpjLookup.data.cnaes.map((cnae) => (
              <div
                key={`${cnae.codigo}-${cnae.principal ? 'p' : 's'}`}
                className="flex items-start gap-2 text-sm"
              >
                <span className="font-medium tabular-nums">{cnae.codigo}</span>
                <span className="text-muted-foreground">{cnae.descricao}</span>
                {cnae.principal ? (
                  <span className="ml-auto whitespace-nowrap rounded bg-primary/10 px-1.5 py-0.5 text-primary text-xs">
                    principal
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </FieldGroup>
  )
}

export { SignupCompanyDataStep }
