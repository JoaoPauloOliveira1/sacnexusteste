import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  clearIndividualSignupDraft,
  individualSignupDraftStorageKey,
  readIndividualSignupDraft,
  saveIndividualSignupDraft,
  toIndividualSignupDraft,
} from '../../../../../src/modules/auth/lib/individual-signup-draft'

describe('individual signup draft persistence', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    window.sessionStorage.clear()
  })

  it('excludes sensitive fields from draft serialization', () => {
    const draft = toIndividualSignupDraft({
      acceptedPrivacy: true,
      acceptedTerms: true,
      birthDate: '1990-01-01',
      cep: '50000-000',
      city: 'Recife',
      cpf: '123.456.789-01',
      email: 'pessoa@example.com',
      firstName: 'Maria',
      lastName: 'Silva',
      neighborhood: 'Boa Vista',
      number: '123',
      otp: '123456',
      password: 'password123',
      passwordConfirmation: 'password123',
      state: 'PE',
      street: 'Rua do Sol',
      wantsProcessCommunication: true,
    })

    expect(draft).toEqual({
      acceptedPrivacy: true,
      acceptedTerms: true,
      wantsProcessCommunication: true,
    })
    expect(draft).not.toHaveProperty('birthDate')
    expect(draft).not.toHaveProperty('cep')
    expect(draft).not.toHaveProperty('city')
    expect(draft).not.toHaveProperty('cpf')
    expect(draft).not.toHaveProperty('email')
    expect(draft).not.toHaveProperty('firstName')
    expect(draft).not.toHaveProperty('lastName')
    expect(draft).not.toHaveProperty('neighborhood')
    expect(draft).not.toHaveProperty('number')
    expect(draft).not.toHaveProperty('password')
    expect(draft).not.toHaveProperty('passwordConfirmation')
    expect(draft).not.toHaveProperty('otp')
    expect(draft).not.toHaveProperty('state')
    expect(draft).not.toHaveProperty('street')
  })

  it('reads valid drafts and ignores malformed drafts', () => {
    saveIndividualSignupDraft({ acceptedTerms: true, wantsProcessCommunication: true })

    expect(readIndividualSignupDraft()).toMatchObject({
      acceptedTerms: true,
      wantsProcessCommunication: true,
    })

    window.sessionStorage.setItem(individualSignupDraftStorageKey, '{invalid-json')

    expect(readIndividualSignupDraft()).toEqual({})
  })

  it('clears the stored draft', () => {
    saveIndividualSignupDraft({ acceptedPrivacy: true })
    clearIndividualSignupDraft()

    expect(window.sessionStorage.getItem(individualSignupDraftStorageKey)).toBeNull()
  })

  it('ignores storage access failures', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked')
    })

    expect(readIndividualSignupDraft()).toEqual({})
  })
})
