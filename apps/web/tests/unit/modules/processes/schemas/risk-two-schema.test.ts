import { describe, expect, it } from 'vitest'

import { riskTwoRequirementResponseSchema, riskTwoResponsibleSchema } from '@/modules/processes'

describe('Risco 2 contributor schemas', () => {
  it('accepts a complete responsible person and rejects unmasked identifiers', () => {
    expect(
      riskTwoResponsibleSchema.safeParse({
        cpf: '123.456.789-00',
        phone: '(81) 99999-0000',
        relationship: 'legal-representative',
        role: 'Administrador',
      }).success,
    ).toBe(true)

    expect(
      riskTwoResponsibleSchema.safeParse({
        cpf: '123',
        phone: '81999990000',
        relationship: '',
        role: '',
      }).success,
    ).toBe(false)
  })

  it('requires a meaningful requirement response', () => {
    expect(riskTwoRequirementResponseSchema.safeParse({ response: 'Corrigido' }).success).toBe(
      false,
    )
    expect(
      riskTwoRequirementResponseSchema.safeParse({
        response: 'Encaminho o documento corrigido para nova análise.',
      }).success,
    ).toBe(true)
  })
})
