import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '@/modules/shared/components/ui/button'

describe('Button', () => {
  it('renders user-facing text', () => {
    render(<Button type="button">Validar UI</Button>)

    expect(screen.getByRole('button', { name: 'Validar UI' })).toBeInTheDocument()
  })

  it('disables interaction and marks itself busy while loading', () => {
    render(
      <Button type="button" isLoading>
        Salvar
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Salvar' })

    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('reserves balanced spinner space before loading starts', () => {
    const { container } = render(
      <Button type="button" isLoading={false}>
        Salvar
      </Button>,
    )

    expect(container.querySelector('[data-slot=loading-spacer]')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveClass('opacity-0')
  })
})
