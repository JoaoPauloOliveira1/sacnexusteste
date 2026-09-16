import { describe, expect, it } from 'vitest'

import {
  formatCpf,
  formatCpfEmailInput,
} from '../../../../../../src/modules/shared/lib/formatters/format-cpf'

describe('CPF formatters', () => {
  it('formats numeric input as CPF', () => {
    expect(formatCpf('529')).toBe('529')
    expect(formatCpf('529982')).toBe('529.982')
    expect(formatCpf('529982247')).toBe('529.982.247')
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
  })

  it('formats CPF-like credential input as CPF', () => {
    expect(formatCpfEmailInput('52998224725')).toBe('529.982.247-25')
  })

  it('keeps incomplete numeric input unmasked because it can still become an email', () => {
    expect(formatCpfEmailInput('1234')).toBe('1234')
  })

  it('keeps numeric-start email input unmasked', () => {
    expect(formatCpfEmailInput('1234@example.com')).toBe('1234@example.com')
  })

  it('keeps long numeric input unmasked because it can still become an email', () => {
    expect(formatCpfEmailInput('123456789012')).toBe('123456789012')
  })

  it('restores a masked numeric local-part before emitting email input', () => {
    expect(formatCpfEmailInput('529.982.247-25@example.com')).toBe('52998224725@example.com')
  })

  it('keeps email input unmasked', () => {
    expect(formatCpfEmailInput('user@example.com')).toBe('user@example.com')
  })
})
