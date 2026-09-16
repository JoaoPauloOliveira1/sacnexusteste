import { afterEach, describe, expect, it } from 'vitest'

import {
  clearCompanySignupDraft,
  companySignupDraftStorageKey,
  readCompanySignupDraft,
  saveCompanySignupDraft,
  toCompanySignupDraft,
} from '../../../../../src/modules/auth/lib/company-signup-draft'

describe('company signup draft persistence', () => {
  afterEach(() => {
    window.sessionStorage.clear()
  })

  it('excludes sensitive fields from draft serialization', () => {
    const draft = toCompanySignupDraft({
      acceptedPrivacy: true,
      acceptedTerms: true,
      cep: '50000-000',
      city: 'Recife',
      cnpj: '04.252.011/0001-10',
      email: 'empresa@example.com',
      legalName: 'Empresa Exemplo LTDA',
      password: 'password123',
      passwordConfirmation: 'password123',
      phone: '(81) 99999-8888',
      representativeCpf: '529.982.247-25',
      wantsProcessCommunication: true,
    })

    expect(draft).toEqual({
      acceptedPrivacy: true,
      acceptedTerms: true,
      wantsProcessCommunication: true,
    })
    expect(draft).not.toHaveProperty('cnpj')
    expect(draft).not.toHaveProperty('email')
    expect(draft).not.toHaveProperty('password')
    expect(draft).not.toHaveProperty('representativeCpf')
  })

  it('reads and clears valid drafts', () => {
    saveCompanySignupDraft({ acceptedTerms: true })

    expect(readCompanySignupDraft()).toMatchObject({ acceptedTerms: true })

    clearCompanySignupDraft()

    expect(window.sessionStorage.getItem(companySignupDraftStorageKey)).toBeNull()
  })
})
