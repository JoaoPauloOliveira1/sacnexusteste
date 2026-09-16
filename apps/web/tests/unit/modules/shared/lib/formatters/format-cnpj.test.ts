import { describe, expect, it } from 'vitest'

import { formatCnpj } from '../../../../../../src/modules/shared/lib/formatters/format-cnpj'

describe('CNPJ formatters', () => {
  it('formats numeric input as CNPJ', () => {
    expect(formatCnpj('04')).toBe('04')
    expect(formatCnpj('04252')).toBe('04.252')
    expect(formatCnpj('04252011')).toBe('04.252.011')
    expect(formatCnpj('042520110001')).toBe('04.252.011/0001')
    expect(formatCnpj('04252011000110')).toBe('04.252.011/0001-10')
    expect(formatCnpj('0425201100011099')).toBe('04.252.011/0001-10')
  })
})
