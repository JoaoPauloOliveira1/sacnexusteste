import { afterEach, describe, expect, it } from 'vitest'

import {
  clearTechnicalResponsibleSignupDraft,
  readTechnicalResponsibleSignupDraft,
  saveTechnicalResponsibleSignupDraft,
  technicalResponsibleSignupDraftStorageKey,
  toTechnicalResponsibleSignupDraft,
} from '../../../../../src/modules/auth/lib/technical-responsible-signup-draft'

describe('technical responsible signup draft persistence', () => {
  afterEach(() => {
    window.sessionStorage.clear()
  })

  it('excludes sensitive fields from draft serialization', () => {
    const draft = toTechnicalResponsibleSignupDraft({
      acceptedPrivacy: true,
      acceptedTerms: true,
      birthDate: '1990-01-01',
      cnpj: '04.252.011/0001-10',
      cpf: '529.982.247-25',
      email: 'responsavel@example.com',
      firstName: 'Maria',
      identificationDocument: 'CREA 123456',
      password: 'password123',
      passwordConfirmation: 'password123',
      phone: '(81) 99999-8888',
      wantsProcessCommunication: true,
    })

    expect(draft).toEqual({
      acceptedPrivacy: true,
      acceptedTerms: true,
      wantsProcessCommunication: true,
    })
    expect(draft).not.toHaveProperty('birthDate')
    expect(draft).not.toHaveProperty('cnpj')
    expect(draft).not.toHaveProperty('cpf')
    expect(draft).not.toHaveProperty('identificationDocument')
    expect(draft).not.toHaveProperty('password')
  })

  it('reads and clears valid drafts', () => {
    saveTechnicalResponsibleSignupDraft({ acceptedPrivacy: true })

    expect(readTechnicalResponsibleSignupDraft()).toMatchObject({ acceptedPrivacy: true })

    clearTechnicalResponsibleSignupDraft()

    expect(window.sessionStorage.getItem(technicalResponsibleSignupDraftStorageKey)).toBeNull()
  })
})
