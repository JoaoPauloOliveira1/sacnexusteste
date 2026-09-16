import { describe, expect, it } from 'vitest'

import {
  formatPhone,
  isValidBrazilianPhoneShape,
} from '../../../../../../src/modules/shared/lib/formatters/format-phone'

describe('phone formatters', () => {
  it('formats landline and mobile Brazilian phone numbers', () => {
    expect(formatPhone('81')).toBe('81')
    expect(formatPhone('813333')).toBe('(81) 3333')
    expect(formatPhone('8133334444')).toBe('(81) 3333-4444')
    expect(formatPhone('81999998888')).toBe('(81) 99999-8888')
    expect(formatPhone('8199999888899')).toBe('(81) 99999-8888')
  })

  it('validates Brazilian phone digit count', () => {
    expect(isValidBrazilianPhoneShape('(81) 99999-8888')).toBe(true)
    expect(isValidBrazilianPhoneShape('(81) 3333-4444')).toBe(true)
    expect(isValidBrazilianPhoneShape('819999')).toBe(false)
  })
})
