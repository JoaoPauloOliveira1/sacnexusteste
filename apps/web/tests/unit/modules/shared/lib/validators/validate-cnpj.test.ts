import { describe, expect, it } from 'vitest'

import {
  isValidCnpj,
  isValidCnpjShape,
} from '../../../../../../src/modules/shared/lib/validators/validate-cnpj'

describe('CNPJ validators', () => {
  it('validates CNPJ shape by digit count', () => {
    expect(isValidCnpjShape('04.252.011/0001-10')).toBe(true)
    expect(isValidCnpjShape('04.252.011')).toBe(false)
  })

  it('validates CNPJ check digits', () => {
    expect(isValidCnpj('04.252.011/0001-10')).toBe(true)
    expect(isValidCnpj('04.252.011/0001-11')).toBe(false)
    expect(isValidCnpj('11.111.111/1111-11')).toBe(false)
  })
})
