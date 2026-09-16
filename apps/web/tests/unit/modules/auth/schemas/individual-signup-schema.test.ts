import { describe, expect, it } from 'vitest'

import {
  individualSignupDefaultValues,
  individualSignupSchema,
  individualSignupStepSchemas,
} from '../../../../../src/modules/auth/schemas/individual-signup-schema'

const validValues = {
  ...individualSignupDefaultValues,
  acceptedPrivacy: true,
  acceptedTerms: true,
  birthDate: '1990-01-01',
  cep: '50000-000',
  city: 'Recife',
  cpf: '529.982.247-25',
  firstName: 'Maria',
  lastName: 'Silva',
  neighborhood: 'Boa Vista',
  number: '123',
  otp: '123456',
  password: 'password123',
  passwordConfirmation: 'password123',
  state: 'PE',
  street: 'Rua do Sol',
}

describe('individualSignupSchema', () => {
  it('accepts valid individual signup values', () => {
    expect(individualSignupSchema.safeParse(validValues).success).toBe(true)
  })

  it('validates personal data fields', () => {
    const result = individualSignupStepSchemas['personal-data'].safeParse({
      ...validValues,
      birthDate: '2020-01-01',
      cpf: '123',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Informe um CPF válido.', 'Informe uma data válida']),
    )
  })

  it('requires address number unless no-number is checked', () => {
    expect(
      individualSignupStepSchemas.address.safeParse({
        ...validValues,
        hasNoNumber: false,
        number: '',
      }).success,
    ).toBe(false)

    expect(
      individualSignupStepSchemas.address.safeParse({
        ...validValues,
        hasNoNumber: true,
        number: '',
      }).success,
    ).toBe(true)
  })

  it('validates security and OTP fields', () => {
    expect(
      individualSignupStepSchemas.security.safeParse({
        ...validValues,
        acceptedTerms: false,
        passwordConfirmation: 'different',
      }).success,
    ).toBe(false)

    expect(
      individualSignupStepSchemas['email-verification'].safeParse({ otp: '12345' }).success,
    ).toBe(false)
  })
})
