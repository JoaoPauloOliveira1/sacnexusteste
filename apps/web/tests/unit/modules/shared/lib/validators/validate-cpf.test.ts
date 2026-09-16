import { describe, expect, it } from 'vitest'

import {
  isCpfLike,
  isValidCpf,
  isValidCpfShape,
} from '../../../../../../src/modules/shared/lib/validators/validate-cpf'

describe('CPF validators', () => {
  it('detects CPF-like input', () => {
    expect(isCpfLike('123.456.789-01')).toBe(true)
    expect(isCpfLike('user@example.com')).toBe(false)
  })

  it('validates CPF shape by digit count', () => {
    expect(isValidCpfShape('123.456.789-01')).toBe(true)
    expect(isValidCpfShape('123.456')).toBe(false)
  })

  it('validates CPF check digits', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('529.982.247-24')).toBe(false)
    expect(isValidCpf('111.111.111-11')).toBe(false)
  })
})
