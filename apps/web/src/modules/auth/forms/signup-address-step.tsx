import * as React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shared/components/ui/select'
import { formatCep } from '@/modules/shared/lib/formatters/format-cep'
import { brazilianStateValues } from '../schemas/signup-common-schema'

type SignupAddressFormValues = {
  cep: string
  city: string
  hasNoNumber: boolean
  neighborhood: string
  number?: string
  state: string
  street: string
}

const stateItems = [
  { label: 'Selecione a UF', value: null },
  ...brazilianStateValues.map((state) => ({ label: state, value: state })),
]

function SignupAddressStep() {
  const {
    control,
    formState: { errors },
    register,
    setValue,
    watch,
  } = useFormContext<SignupAddressFormValues>()

  const cep = watch('cep')
  const hasNoNumber = watch('hasNoNumber')

  React.useEffect(() => {
    if (hasNoNumber) {
      setValue('number', '', { shouldDirty: true })
    }
  }, [hasNoNumber, setValue])

  return (
    <FieldGroup className="gap-4">
      <Field data-invalid={!!errors.cep} className="gap-1.5">
        <FieldLabel htmlFor="cep">CEP</FieldLabel>
        <Input
          id="cep"
          inputMode="numeric"
          autoComplete="postal-code"
          className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          placeholder="00000-000"
          value={cep}
          aria-invalid={!!errors.cep}
          aria-describedby={errors.cep ? 'cep-error' : undefined}
          onChange={(event) =>
            setValue('cep', formatCep(event.target.value), { shouldDirty: true })
          }
        />
        <FieldError id="cep-error">{errors.cep?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.street} className="gap-1.5">
        <FieldLabel htmlFor="street">Rua</FieldLabel>
        <Input
          id="street"
          autoComplete="address-line1"
          className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
          placeholder="Nome da rua"
          aria-invalid={!!errors.street}
          aria-describedby={errors.street ? 'street-error' : undefined}
          {...register('street')}
        />
        <FieldError id="street-error">{errors.street?.message}</FieldError>
      </Field>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field data-invalid={!!errors.number} className="gap-1.5">
          <FieldLabel htmlFor="number">Número</FieldLabel>
          <Input
            id="number"
            autoComplete="address-line2"
            disabled={hasNoNumber}
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed"
            placeholder="000"
            aria-invalid={!!errors.number}
            aria-describedby={errors.number ? 'number-error' : undefined}
            {...register('number')}
          />
          <FieldError id="number-error">{errors.number?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.neighborhood} className="gap-1.5">
          <FieldLabel htmlFor="neighborhood">Bairro</FieldLabel>
          <Input
            id="neighborhood"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Nome do bairro"
            aria-invalid={!!errors.neighborhood}
            aria-describedby={errors.neighborhood ? 'neighborhood-error' : undefined}
            {...register('neighborhood')}
          />
          <FieldError id="neighborhood-error">{errors.neighborhood?.message}</FieldError>
        </Field>
      </div>

      <Controller
        control={control}
        name="hasNoNumber"
        render={({ field }) => (
          <Field orientation="horizontal" className="items-center gap-3">
            <Checkbox
              id="hasNoNumber"
              className="size-5 rounded-full"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            <FieldLabel htmlFor="hasNoNumber" className="font-normal text-foreground">
              Sem número
            </FieldLabel>
          </Field>
        )}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <Field data-invalid={!!errors.city} className="gap-1.5">
          <FieldLabel htmlFor="city">Cidade</FieldLabel>
          <Input
            id="city"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Nome da cidade"
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
            {...register('city')}
          />
          <FieldError id="city-error">{errors.city?.message}</FieldError>
        </Field>

        <Controller
          control={control}
          name="state"
          render={({ field }) => (
            <Field data-invalid={!!errors.state} className="gap-1.5">
              <FieldLabel htmlFor="state">Estado</FieldLabel>
              <Select
                items={stateItems}
                value={field.value || null}
                onValueChange={(value) => field.onChange(value ?? '')}
              >
                <SelectTrigger
                  id="state"
                  className="h-10 w-full rounded-md bg-input-background px-3 py-2 text-sm data-[size=default]:h-10"
                  aria-invalid={!!errors.state}
                  aria-describedby={errors.state ? 'state-error' : undefined}
                >
                  <SelectValue placeholder="Nome do estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {stateItems.map((item) => (
                      <SelectItem key={item.value ?? 'empty'} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError id="state-error">{errors.state?.message}</FieldError>
            </Field>
          )}
        />
      </div>
    </FieldGroup>
  )
}

export { SignupAddressStep }
