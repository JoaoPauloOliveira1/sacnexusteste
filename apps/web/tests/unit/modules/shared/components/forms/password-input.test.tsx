import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { PasswordInput } from '@/modules/shared/components/forms/password-input'

describe('PasswordInput', () => {
  it('toggles password visibility', async () => {
    const user = userEvent.setup()

    render(
      <PasswordInput
        aria-label="Senha"
        showPasswordLabel="Mostrar senha"
        hidePasswordLabel="Ocultar senha"
      />,
    )

    const input = screen.getByLabelText('Senha')
    expect(input).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Mostrar senha' }))
    expect(input).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))
    expect(input).toHaveAttribute('type', 'password')
  })
})
