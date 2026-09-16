import { describe, expect, it } from 'vitest'

import { formatCep } from '../../../../../../src/modules/shared/lib/formatters/format-cep'

describe('CEP formatters', () => {
  it('formats numeric input as CEP', () => {
    expect(formatCep('500')).toBe('500')
    expect(formatCep('50000000')).toBe('50000-000')
    expect(formatCep('50000-0009')).toBe('50000-000')
  })
})
