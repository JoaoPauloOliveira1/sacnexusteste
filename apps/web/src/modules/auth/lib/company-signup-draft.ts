import { z } from 'zod'

import { type CompanySignupFormValues } from '../schemas/company-signup-schema'

const companySignupDraftStorageKey = 'sac-nexus:company-signup-draft'

const companySignupDraftSchema = z.object({
  acceptedPrivacy: z.boolean().optional(),
  acceptedTerms: z.boolean().optional(),
  wantsProcessCommunication: z.boolean().optional(),
})

type CompanySignupDraft = z.infer<typeof companySignupDraftSchema>

function canUseSessionStorage() {
  return typeof window !== 'undefined' && 'sessionStorage' in window
}

function toCompanySignupDraft(values: Partial<CompanySignupFormValues>): CompanySignupDraft {
  return {
    acceptedPrivacy: values.acceptedPrivacy,
    acceptedTerms: values.acceptedTerms,
    wantsProcessCommunication: values.wantsProcessCommunication,
  }
}

function readCompanySignupDraft() {
  if (!canUseSessionStorage()) {
    return {}
  }

  try {
    const storedDraft = window.sessionStorage.getItem(companySignupDraftStorageKey)

    if (!storedDraft) {
      return {}
    }

    const parsedDraft = JSON.parse(storedDraft)
    const result = companySignupDraftSchema.safeParse(parsedDraft)

    return result.success ? result.data : {}
  } catch {
    return {}
  }
}

function saveCompanySignupDraft(values: Partial<CompanySignupFormValues>) {
  if (!canUseSessionStorage()) {
    return
  }

  const draft = toCompanySignupDraft(values)

  try {
    window.sessionStorage.setItem(companySignupDraftStorageKey, JSON.stringify(draft))
  } catch {
    // Ignore unavailable storage; the form state remains in memory for the current page session.
  }
}

function clearCompanySignupDraft() {
  if (!canUseSessionStorage()) {
    return
  }

  try {
    window.sessionStorage.removeItem(companySignupDraftStorageKey)
  } catch {
    // Ignore unavailable storage; clearing is best-effort for this local-only draft.
  }
}

export {
  type CompanySignupDraft,
  clearCompanySignupDraft,
  companySignupDraftStorageKey,
  readCompanySignupDraft,
  saveCompanySignupDraft,
  toCompanySignupDraft,
}
