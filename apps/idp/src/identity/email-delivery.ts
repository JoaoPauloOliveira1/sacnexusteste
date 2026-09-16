import { type ReactNode } from 'react'
import { Resend } from 'resend'
import { type Env } from '@/config/env.js'
import {
  EmailVerificationEmail,
  PasswordResetEmail,
} from '@/identity/emails/auth-email-templates.js'

export type EmailDeliveryEvent = {
  event: 'email.delivery.attempted' | 'email.delivery.failed' | 'email.delivery.succeeded'
  email_operation: 'email_verification' | 'password_reset'
  provider: 'resend'
}

export type EmailEventLogger = (event: EmailDeliveryEvent) => void

export type AuthEmailInput = {
  name: string
  to: string
  url: string
}

export type AuthEmailSender = {
  sendPasswordReset: (input: AuthEmailInput) => Promise<void>
  sendVerification: (input: AuthEmailInput) => Promise<void>
}

export function createResendAuthEmailSender(
  config: Env,
  logEmailEvent: EmailEventLogger = () => {},
): AuthEmailSender {
  const resend = new Resend(config.RESEND_API_KEY)

  async function send(input: {
    email: AuthEmailInput
    operation: EmailDeliveryEvent['email_operation']
    subject: string
    react: ReactNode
  }): Promise<void> {
    logEmailEvent({
      event: 'email.delivery.attempted',
      email_operation: input.operation,
      provider: 'resend',
    })

    try {
      const emailOptions = {
        from: config.AUTH_EMAIL_FROM,
        react: input.react,
        subject: input.subject,
        to: [input.email.to],
        ...(config.AUTH_EMAIL_REPLY_TO ? { replyTo: config.AUTH_EMAIL_REPLY_TO } : {}),
      }
      const result = await resend.emails.send(emailOptions)

      if (result.error) {
        throw new Error('Resend email delivery failed.')
      }

      logEmailEvent({
        event: 'email.delivery.succeeded',
        email_operation: input.operation,
        provider: 'resend',
      })
      // Future audit-log event publication should be emitted here after the audit worker contract exists.
    } catch (error) {
      logEmailEvent({
        event: 'email.delivery.failed',
        email_operation: input.operation,
        provider: 'resend',
      })
      throw error
    }
  }

  return {
    sendPasswordReset: (input) =>
      send({
        email: input,
        operation: 'password_reset',
        react: PasswordResetEmail({ actionUrl: input.url, firstName: getFirstName(input.name) }),
        subject: 'Redefina sua senha no SAC Nexus',
      }),
    sendVerification: (input) =>
      send({
        email: input,
        operation: 'email_verification',
        react: EmailVerificationEmail({
          actionUrl: input.url,
          firstName: getFirstName(input.name),
        }),
        subject: 'Confirme seu email no SAC Nexus',
      }),
  }
}

function getFirstName(name: string): string | undefined {
  const [firstName] = name.trim().split(/\s+/)

  return firstName || undefined
}
