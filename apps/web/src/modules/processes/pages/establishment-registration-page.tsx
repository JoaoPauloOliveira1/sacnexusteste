import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { type UseFormRegisterReturn, useForm } from 'react-hook-form'

import { Button } from '@/modules/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { formatCep } from '@/modules/shared/lib/formatters/format-cep'

import { ContributorShell } from '../components/contributor-shell'
import { EstablishmentLocationDialog } from '../components/establishment-location-picker'
import { ProcessPage, ProcessPageActions, SummaryCard } from '../components/process-page'
import { useProcesses } from '../lib/process-store'
import {
  type EstablishmentRegistrationValues,
  establishmentRegistrationSchema,
} from '../schemas/establishment-registration-schema'
import { type EstablishmentLocation } from '../types'

export function EstablishmentRegistrationPage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const [location, setLocation] = useState(state.establishment.location)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [pendingValues, setPendingValues] = useState<EstablishmentRegistrationValues | null>(null)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm<EstablishmentRegistrationValues>({
    defaultValues: {
      cep: state.establishment.cep,
      address: state.establishment.address,
      neighborhood: state.establishment.neighborhood,
      city: state.establishment.city
        ? `${state.establishment.city} — ${state.establishment.state}`
        : '',
      builtArea: state.establishment.builtArea,
      floors: state.establishment.floors,
    },
    resolver: zodResolver(establishmentRegistrationSchema),
  })
  const [cep, address, neighborhood, city] = watch(['cep', 'address', 'neighborhood', 'city'])
  const addressInput = {
    cep,
    address,
    neighborhood,
    city,
  }

  function handleSave(values: EstablishmentRegistrationValues) {
    setPendingValues(values)
    setIsLocationDialogOpen(true)
  }

  function completeSave(
    values: EstablishmentRegistrationValues,
    confirmedLocation: EstablishmentLocation,
  ) {
    const city = values.city.replace(/\s+[—-]\s+PE$/i, '').trim()
    actions.saveEstablishment({
      ...state.establishment,
      ...values,
      city,
      state: 'PE',
      location: confirmedLocation,
    })
    setLocation(confirmedLocation)
    setIsLocationDialogOpen(false)
    void navigate({ to: '/processes/new/classification' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Dados do estabelecimento"
        description="Informe o endereço e as características físicas do local que será regularizado."
        step={2}
      >
        <form onSubmit={handleSubmit(handleSave)} noValidate className="flex flex-col gap-3">
          <SummaryCard
            title="Endereço e características"
            description="Os campos marcados com * são obrigatórios."
          >
            <FieldGroup className="grid gap-3 sm:max-w-[928px] sm:grid-cols-2 sm:gap-x-[18px]">
              <TextField
                id="cep"
                label="CEP"
                placeholder="50000-000"
                error={errors.cep?.message}
                registration={register('cep')}
                transform={formatCep}
                inputMode="numeric"
                maxLength={9}
              />
              <TextField
                id="address"
                label="Logradouro"
                placeholder="Ex.: Avenida Norte, 1500"
                error={errors.address?.message}
                registration={register('address')}
              />
              <TextField
                id="neighborhood"
                label="Bairro"
                placeholder="Ex.: Santo Amaro"
                error={errors.neighborhood?.message}
                registration={register('neighborhood')}
              />
              <TextField
                id="city"
                label="Município"
                placeholder="Ex.: Recife — PE"
                error={errors.city?.message}
                registration={register('city')}
              />
              <TextField
                id="builtArea"
                label="Área construída (m²)"
                type="number"
                placeholder="Ex.: 450"
                error={errors.builtArea?.message}
                registration={register('builtArea')}
              />
              <TextField
                id="floors"
                label="Número de pavimentos"
                type="number"
                placeholder="Ex.: 1"
                error={errors.floors?.message}
                registration={register('floors')}
              />
            </FieldGroup>
          </SummaryCard>

          <ProcessPageActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigate({ to: '/processes/new/request' })}
            >
              Voltar
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Salvar e continuar
            </Button>
          </ProcessPageActions>

          <EstablishmentLocationDialog
            address={addressInput}
            open={isLocationDialogOpen}
            onOpenChange={setIsLocationDialogOpen}
            value={location}
            onConfirm={(confirmedLocation) => {
              if (pendingValues) {
                completeSave(pendingValues, confirmedLocation)
              }
            }}
          />
        </form>
      </ProcessPage>
    </ContributorShell>
  )
}

function TextField({
  id,
  label,
  placeholder,
  type = 'text',
  error,
  registration,
  transform,
  inputMode,
  maxLength,
}: {
  id: string
  label: string
  placeholder: string
  type?: 'text' | 'number'
  error: string | undefined
  registration: UseFormRegisterReturn
  transform?: ((value: string) => string) | undefined
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  maxLength?: number | undefined
}) {
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={id} className="text-[13px]">
        {label}
        <span aria-hidden="true" className="ml-0.5 text-destructive">
          *
        </span>
        <span className="sr-only"> obrigatório</span>
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        inputMode={inputMode ?? (type === 'number' ? 'numeric' : undefined)}
        maxLength={maxLength}
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="h-10 px-3 text-[13px]"
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
