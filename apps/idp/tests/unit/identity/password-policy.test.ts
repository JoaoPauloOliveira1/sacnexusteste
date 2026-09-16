import { describe, expect, it } from 'vitest'
import { getPasswordPolicyViolation, passwordPolicy } from '@/identity/password-policy.js'

describe('password policy', () => {
  it('allows long passphrases without composition requirements', () => {
    expect(getPasswordPolicyViolation('correct horse battery staple')).toBeUndefined()
  })

  it('requires at least 12 characters', () => {
    expect(getPasswordPolicyViolation('short')).toBe(
      `Password must contain at least ${passwordPolicy.minLength} characters.`,
    )
  })

  it('limits passwords to 128 characters', () => {
    expect(getPasswordPolicyViolation('a'.repeat(129))).toBe(
      `Password must contain at most ${passwordPolicy.maxLength} characters.`,
    )
  })

  it('blocks locally denied common passwords', () => {
    expect(getPasswordPolicyViolation('  SacNexus2026  ')).toBe('Password is too common.')
  })
})
