import { describe, expect, it } from 'vitest'

import {
  technicalResponsibleSignupDefaultValues,
  technicalResponsibleSignupSchema,
  technicalResponsibleSignupStepSchemas,
} from '../../../../../src/modules/auth/schemas/technical-responsible-signup-schema'

const validValues = {
  ...technicalResponsibleSignupDefaultValues,
  acceptedPrivacy: true,
  acceptedTerms: true,
  birthDate: '1990-01-01',
  cep: '50000-000',
  city: 'Recife',
  cnpj: '04.252.011/0001-10',
  cpf: '529.982.247-25',
  email: 'responsavel@example.com',
  firstName: 'Maria',
  identificationDocument: 'CREA 123456',
  lastName: 'Silva',
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

describe('technicalResponsibleSignupSchema', () => {
  it('accepts valid technical responsible signup values', () => {
    expect(technicalResponsibleSignupSchema.safeParse(validValues).success).toBe(true)
  })

  it('validates responsible data fields', () => {
    const result = technicalResponsibleSignupStepSchemas['responsible-data'].safeParse({
      ...validValues,
      birthDate: '2020-01-01',
      cpf: '111.111.111-11',
      identificationDocument: '',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        'Informe um CPF válido.',
        'Informe uma data válida',
        'Informe o documento de identificação.',
      ]),
    )
  })

  it('validates company data fields', () => {
    const result = technicalResponsibleSignupStepSchemas['company-data'].safeParse({
      ...validValues,
      cnpj: '04.252.011/0001-11',
      representativeCpf: '111.111.111-11',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining(['Informe um CNPJ válido.', 'Informe um CPF válido.']),
    )
  })
})
