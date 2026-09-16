import { describe, expect, it } from 'vitest'

import {
  companySignupDefaultValues,
  companySignupSchema,
  companySignupStepSchemas,
} from '../../../../../src/modules/auth/schemas/company-signup-schema'

const validValues = {
  ...companySignupDefaultValues,
  acceptedPrivacy: true,
  acceptedTerms: true,
  cep: '50000-000',
  city: 'Recife',
  cnpj: '04.252.011/0001-10',
  email: 'empresa@example.com',
  legalName: 'Empresa Exemplo LTDA',
  neighborhood: 'Boa Vista',
  number: '123',
  otp: '123456',
  password: 'password123',
  passwordConfirmation: 'password123',
  phone: '(81) 99999-8888',
  representativeCpf: '529.982.247-25',
  state: 'PE',
  street: 'Rua do Sol',
  tradeName: 'Empresa Exemplo',
}

describe('companySignupSchema', () => {
  it('accepts valid company signup values', () => {
    expect(companySignupSchema.safeParse(validValues).success).toBe(true)
  })

  it('validates company data fields', () => {
    const result = companySignupStepSchemas['company-data'].safeParse({
      ...validValues,
      cnpj: '04.252.011/0001-11',
      email: 'invalid',
      representativeCpf: '111.111.111-11',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        'Informe um CNPJ válido.',
        'Informe um CPF válido.',
        'Informe um e-mail válido.',
      ]),
    )
  })

  it('requires address number unless no-number is checked', () => {
    expect(
      companySignupStepSchemas.address.safeParse({
        ...validValues,
        hasNoNumber: false,
        number: '',
      }).success,
    ).toBe(false)

    expect(
      companySignupStepSchemas.address.safeParse({
        ...validValues,
        hasNoNumber: true,
        number: '',
      }).success,
    ).toBe(true)
  })
})
