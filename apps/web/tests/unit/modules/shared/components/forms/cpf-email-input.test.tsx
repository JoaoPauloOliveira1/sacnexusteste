import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { CpfEmailInput } from '@/modules/shared/components/forms/cpf-email-input'

function TestCpfEmailInput({ onValueChange }: { onValueChange: (value: string) => void }) {
  const [value, setValue] = useState('')

  return (
    <CpfEmailInput
      aria-label="CPF ou Email"
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue)
        onValueChange(nextValue)
      }}
    />
  )
}

describe('CpfEmailInput', () => {
  it('formats numeric input as CPF before emitting the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<TestCpfEmailInput onValueChange={onValueChange} />)

    await user.type(screen.getByLabelText('CPF ou Email'), '12345678901')

    expect(onValueChange).toHaveBeenLastCalledWith('123.456.789-01')
  })

  it('keeps email input unmasked before emitting the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<TestCpfEmailInput onValueChange={onValueChange} />)

    await user.type(screen.getByLabelText('CPF ou Email'), 'user@example.com')

    expect(onValueChange).toHaveBeenLastCalledWith('user@example.com')
  })

  it('keeps numeric-start email input unmasked before emitting the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<TestCpfEmailInput onValueChange={onValueChange} />)

    await user.type(screen.getByLabelText('CPF ou Email'), '1234@example.com')

    expect(onValueChange).toHaveBeenLastCalledWith('1234@example.com')
  })

  it('keeps long numeric-start email input unmasked before emitting the value', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()

    render(<TestCpfEmailInput onValueChange={onValueChange} />)

    await user.type(screen.getByLabelText('CPF ou Email'), '123456789012@example.com')

    expect(onValueChange).toHaveBeenLastCalledWith('123456789012@example.com')
  })
})
