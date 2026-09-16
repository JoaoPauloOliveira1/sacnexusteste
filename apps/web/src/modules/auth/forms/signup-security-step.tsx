import { Controller, useFormContext } from 'react-hook-form'

import { PasswordInput } from '@/modules/shared/components/forms/password-input'
import { Checkbox } from '@/modules/shared/components/ui/checkbox'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/modules/shared/components/ui/field'

type SignupSecurityFormValues = {
  acceptedPrivacy: boolean
  acceptedTerms: boolean
  password: string
  passwordConfirmation: string
  wantsProcessCommunication: boolean
}

function SignupSecurityStep() {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<SignupSecurityFormValues>()

  return (
    <FieldGroup className="gap-3">
      <Field data-invalid={!!errors.password} className="gap-1.5">
        <FieldLabel htmlFor="password">Senha</FieldLabel>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          className="h-10 rounded-md bg-input-background"
          placeholder="Senha com +8 caracteres"
          showPasswordLabel="Mostrar senha"
          hidePasswordLabel="Ocultar senha"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        <FieldError id="password-error">{errors.password?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.passwordConfirmation} className="gap-1.5">
        <FieldLabel htmlFor="passwordConfirmation">Confirmação de senha</FieldLabel>
        <PasswordInput
          id="passwordConfirmation"
          autoComplete="new-password"
          className="h-10 rounded-md bg-input-background"
          placeholder="Repita sua senha"
          showPasswordLabel="Mostrar senha"
          hidePasswordLabel="Ocultar senha"
          aria-invalid={!!errors.passwordConfirmation}
          aria-describedby={errors.passwordConfirmation ? 'passwordConfirmation-error' : undefined}
          {...register('passwordConfirmation')}
        />
        <FieldError id="passwordConfirmation-error">
          {errors.passwordConfirmation?.message}
        </FieldError>
      </Field>

      <FieldGroup className="gap-3 pt-1">
        <Controller
          control={control}
          name="acceptedTerms"
          render={({ field }) => (
            <Field orientation="horizontal" data-invalid={!!errors.acceptedTerms}>
              <Checkbox
                id="acceptedTerms"
                className="size-5 rounded-full"
                checked={field.value}
                aria-invalid={!!errors.acceptedTerms}
                aria-describedby={errors.acceptedTerms ? 'acceptedTerms-error' : undefined}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldContent>
                <FieldLabel htmlFor="acceptedTerms" className="font-normal">
                  Aceito Termos de Uso
                </FieldLabel>
                <FieldError id="acceptedTerms-error">{errors.acceptedTerms?.message}</FieldError>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="acceptedPrivacy"
          render={({ field }) => (
            <Field orientation="horizontal" data-invalid={!!errors.acceptedPrivacy}>
              <Checkbox
                id="acceptedPrivacy"
                className="size-5 rounded-full"
                checked={field.value}
                aria-invalid={!!errors.acceptedPrivacy}
                aria-describedby={errors.acceptedPrivacy ? 'acceptedPrivacy-error' : undefined}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldContent>
                <FieldLabel htmlFor="acceptedPrivacy" className="font-normal">
                  Aceito Política de Privacidade
                </FieldLabel>
                <FieldError id="acceptedPrivacy-error">
                  {errors.acceptedPrivacy?.message}
                </FieldError>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="wantsProcessCommunication"
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="wantsProcessCommunication"
                className="size-5 rounded-full"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              <FieldContent>
                <FieldLabel htmlFor="wantsProcessCommunication" className="font-normal">
                  Autorizo comunicações do processo
                </FieldLabel>
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
    </FieldGroup>
  )
}

export { SignupSecurityStep }
