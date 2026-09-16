import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { PasswordInput } from '@/modules/shared/components/forms/password-input'
import { Button } from '@/modules/shared/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/modules/shared/components/ui/field'
import { Input } from '@/modules/shared/components/ui/input'
import { sleep } from '@/modules/shared/lib/sleep'
import { SignInComposer } from '../components/sign-in-composer'
import { type SignInFormValues, signInSchema } from '../schemas/sign-in-schema'

interface SignInFormProps {
  defaultValues?: SignInFormValues
  onGovBrSignIn?: () => void
  onSignInSuccess?: (values: SignInFormValues) => boolean
  recoveryLink: React.ReactNode
}

function SignInForm({
  defaultValues,
  onGovBrSignIn,
  onSignInSuccess,
  recoveryLink,
}: SignInFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<SignInFormValues>({
    defaultValues: defaultValues ?? { email: '', password: '' },
    resolver: zodResolver(signInSchema),
  })

  async function handleSignInSubmit(values: SignInFormValues) {
    await sleep(3000)
    const accepted = onSignInSuccess?.(values)
    if (accepted === false) {
      setError('root', { message: 'Credenciais de demonstração não reconhecidas.' })
    }
  }

  return (
    <form onSubmit={handleSubmit(handleSignInSubmit)} noValidate>
      <FieldGroup className="gap-2">
        <Field data-invalid={!!errors.email} className="gap-1.5">
          <FieldLabel htmlFor="email" className="font-medium text-foreground text-sm leading-5.25">
            E-mail
          </FieldLabel>
          <Input
            id="email"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Insira seu e-mail"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          <FieldError id="email-error">{errors.email?.message}</FieldError>
        </Field>

        <Field data-invalid={!!errors.password} className="gap-1.5">
          <FieldLabel
            htmlFor="password"
            className="font-medium text-foreground text-sm leading-5.25"
          >
            Senha
          </FieldLabel>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            className="h-10 rounded-md bg-input-background px-3 py-2 text-sm placeholder:text-muted-foreground"
            placeholder="Digite sua senha"
            showPasswordLabel="Mostrar senha"
            hidePasswordLabel="Ocultar senha"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          <FieldError id="password-error">{errors.password?.message}</FieldError>
        </Field>
      </FieldGroup>

      <FieldError className="mt-3 text-center">{errors.root?.message}</FieldError>

      <div className="mt-4 flex flex-col gap-2">
        <Button type="submit" size="lg" className="h-10 w-full rounded-md" isLoading={isSubmitting}>
          Entrar
        </Button>

        <FieldSeparator className="my-0 h-6">ou</FieldSeparator>

        <SignInComposer.GovBrButton onClick={onGovBrSignIn} />
      </div>

      <div className="flex h-15 items-center justify-center">{recoveryLink}</div>
    </form>
  )
}

export { SignInForm }
