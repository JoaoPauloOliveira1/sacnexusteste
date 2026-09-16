import { REGEXP_ONLY_DIGITS } from 'input-otp'
import * as React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@/modules/shared/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/modules/shared/components/ui/field'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/modules/shared/components/ui/input-otp'

type SignupEmailVerificationFormValues = {
  otp: string
}

const RESEND_SECONDS = 29

function formatCountdown(seconds: number) {
  return `0:${String(seconds).padStart(2, '0')}`
}

function SignupEmailVerificationStep() {
  const {
    control,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useFormContext<SignupEmailVerificationFormValues>()
  const [secondsUntilResend, setSecondsUntilResend] = React.useState(RESEND_SECONDS)
  const otp = watch('otp')

  React.useEffect(() => {
    if (secondsUntilResend <= 0) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSecondsUntilResend((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timeoutId)
  }, [secondsUntilResend])

  function handleResend() {
    setValue('otp', '', { shouldDirty: true })
    setSecondsUntilResend(RESEND_SECONDS)
  }

  return (
    <FieldGroup className="gap-4">
      <p className="text-center font-medium text-foreground text-sm leading-5">
        Enviamos um código de verificação para seu e-mail.
      </p>
      <Controller
        control={control}
        name="otp"
        render={({ field }) => (
          <Field data-invalid={!!errors.otp} className="items-center gap-2 text-center">
            <FieldLabel htmlFor="otp" className="sr-only">
              Código de verificação
            </FieldLabel>
            <InputOTP
              id="otp"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              value={field.value}
              onChange={field.onChange}
              containerClassName="justify-center"
              aria-invalid={!!errors.otp}
              aria-describedby={errors.otp ? 'otp-error' : undefined}
            >
              <InputOTPGroup className="gap-1">
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot
                    // biome-ignore lint/suspicious/noArrayIndexKey: OTP slots are fixed positions.
                    key={index}
                    index={index}
                    className="size-10 rounded border border-[#e2e8f0] bg-background font-medium text-2xl leading-9 sm:size-16 sm:text-3xl"
                    aria-invalid={!!errors.otp}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <FieldError id="otp-error">{errors.otp?.message}</FieldError>
          </Field>
        )}
      />

      <div className="flex flex-col gap-4 text-center">
        <Button
          type="submit"
          className="h-10 w-full rounded-lg disabled:opacity-60"
          disabled={otp.length !== 6 || isSubmitting}
          isLoading={isSubmitting}
        >
          Validar
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-full text-primary hover:bg-transparent disabled:text-primary disabled:opacity-100"
          disabled={secondsUntilResend > 0}
          onClick={handleResend}
        >
          {secondsUntilResend > 0
            ? `Enviar código novamente em ${formatCountdown(secondsUntilResend)}`
            : 'Reenviar código'}
        </Button>
      </div>
    </FieldGroup>
  )
}

export { formatCountdown, SignupEmailVerificationStep }
