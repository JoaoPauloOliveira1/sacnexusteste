import * as React from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { Button } from '@/modules/shared/components/ui/button'
import { Calendar } from '@/modules/shared/components/ui/calendar'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shared/components/ui/popover'
import { formatCpf } from '@/modules/shared/lib/formatters/format-cpf'
import {
  getMaximumBirthDate,
  getMinimumBirthDate,
  type IndividualSignupFormValues,
  parseIsoDate,
} from '../schemas/individual-signup-schema'

function formatIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string) {
  const date = parseIsoDate(value)

  if (!date) {
    return ''
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

function IndividualSignupPersonalDataStep() {
  const {
    control,
    formState: { errors },
    register,
    setValue,
    watch,
  } = useFormContext<IndividualSignupFormValues>()

  const cpf = watch('cpf')
  const maxBirthDate = getMaximumBirthDate()
  const minBirthDate = getMinimumBirthDate()
  const [isBirthDateOpen, setBirthDateOpen] = React.useState(false)

  return (
    <FieldGroup className="gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <Field data-invalid={!!errors.firstName} className="gap-1.5">
          <FieldLabel htmlFor="firstName">Nome</FieldLabel>
          <Input
            id="firstName"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira seu nome"
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            {...register('firstName')}
          />
          <FieldError id="firstName-error">{errors.firstName?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.lastName} className="gap-1.5">
          <FieldLabel htmlFor="lastName">Sobrenome</FieldLabel>
          <Input
            id="lastName"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira seu sobrenome"
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            {...register('lastName')}
          />
          <FieldError id="lastName-error">{errors.lastName?.message}</FieldError>
        </Field>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Field data-invalid={!!errors.cpf} className="gap-1.5">
          <FieldLabel htmlFor="cpf">CPF</FieldLabel>
          <Input
            id="cpf"
            inputMode="numeric"
            autoComplete="off"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira seu CPF"
            value={cpf}
            aria-invalid={!!errors.cpf}
            aria-describedby={errors.cpf ? 'cpf-error' : undefined}
            onChange={(event) =>
              setValue('cpf', formatCpf(event.target.value), { shouldDirty: true })
            }
          />
          <FieldError id="cpf-error">{errors.cpf?.message}</FieldError>
        </Field>

        <Controller
          control={control}
          name="birthDate"
          render={({ field }) => {
            const selectedDate = parseIsoDate(field.value) ?? undefined

            return (
              <Field data-invalid={!!errors.birthDate} className="gap-1.5">
                <FieldLabel htmlFor="birthDate">Data de nascimento</FieldLabel>
                <Popover open={isBirthDateOpen} onOpenChange={setBirthDateOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        id="birthDate"
                        variant="outline"
                        className="h-10 justify-start rounded-md bg-input-background px-3 py-2 font-normal text-muted-foreground text-sm hover:bg-input-background"
                        aria-invalid={!!errors.birthDate}
                        aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
                      />
                    }
                  >
                    {field.value ? formatDisplayDate(field.value) : <span>00/00/0000</span>}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={selectedDate}
                      defaultMonth={selectedDate ?? maxBirthDate}
                      disabled={(date) => date < minBirthDate || date > maxBirthDate}
                      onSelect={(date) => {
                        field.onChange(date ? formatIsoDate(date) : '')
                        setBirthDateOpen(false)
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <FieldError id="birthDate-error">{errors.birthDate?.message}</FieldError>
              </Field>
            )
          }}
        />
      </div>
    </FieldGroup>
  )
}

export { formatDisplayDate, formatIsoDate, IndividualSignupPersonalDataStep }
