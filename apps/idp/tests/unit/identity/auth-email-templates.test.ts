import { render } from 'react-email'
import { describe, expect, it } from 'vitest'
import {
  EmailVerificationEmail,
  PasswordResetEmail,
} from '@/identity/emails/auth-email-templates.js'

describe('auth email templates', () => {
  it('renders the verification email with first name and safe Portuguese copy', async () => {
    const html = await render(
      EmailVerificationEmail({
        actionUrl: 'https://idp.example.test/api/auth/verify-email?token=synthetic',
        firstName: 'Ana',
      }),
    )

    expect(html).toContain('Olá, Ana.')
    expect(html).toContain('Confirmar email')
    expect(html).toContain('Este link expira em 24 horas.')
    expect(html).not.toContain('CPF')
    expect(html).not.toContain('CNPJ')
  })

  it('renders the password reset email with expiration and fallback URL', async () => {
    const html = await render(
      PasswordResetEmail({
        actionUrl: 'https://idp.example.test/api/auth/reset-password/token',
      }),
    )

    expect(html).toContain('Redefinir senha')
    expect(html).toContain('Este link expira em 30 minutos.')
    expect(html).toContain('copie e cole este endereço')
  })
})
