import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SignInForm } from '../../../../../src/modules/auth/forms/sign-in-form'

function renderSignInForm() {
  return render(<SignInForm recoveryLink={<a href="/forgot-password">Esqueci minha senha</a>} />)
}

describe('SignInForm', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the login controls', () => {
    renderSignInForm()

    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Entrar com/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Esqueci minha senha' })).toBeInTheDocument()
  })

  it('accepts email input without masking', async () => {
    const user = userEvent.setup()
    renderSignInForm()

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')

    expect(screen.getByLabelText('E-mail')).toHaveValue('user@example.com')
  })

  it('shows validation messages for empty submit', async () => {
    const user = userEvent.setup()
    renderSignInForm()

    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe seu e-mail.')).toBeInTheDocument()
    expect(screen.getByText('Informe sua senha.')).toBeInTheDocument()
  })

  it('shows a validation message for invalid email', async () => {
    const user = userEvent.setup()
    renderSignInForm()

    await user.type(screen.getByLabelText('E-mail'), 'invalid-email')
    await user.type(screen.getByLabelText('Senha'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe um e-mail válido.')).toBeInTheDocument()
  })

  it('shows fake loading for three seconds without logging credentials', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const user = userEvent.setup()
    renderSignInForm()

    await user.type(screen.getByLabelText('E-mail'), 'user@example.com')
    await user.type(screen.getByLabelText('Senha'), 'secret')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    const submitButton = screen.getByRole('button', { name: 'Entrar' })

    expect(consoleSpy).not.toHaveBeenCalled()
    expect(submitButton).toBeDisabled()
    expect(submitButton).toHaveAttribute('aria-busy', 'true')

    await waitFor(() => expect(submitButton).not.toBeDisabled(), { timeout: 3500 })

    expect(submitButton).not.toHaveAttribute('aria-busy')
  }, 8000)
})
