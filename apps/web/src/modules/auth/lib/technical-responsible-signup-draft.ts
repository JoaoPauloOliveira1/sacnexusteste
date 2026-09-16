import { z } from 'zod'

import { type TechnicalResponsibleSignupFormValues } from '../schemas/technical-responsible-signup-schema'

const technicalResponsibleSignupDraftStorageKey = 'sac-nexus:technical-responsible-signup-draft'

const technicalResponsibleSignupDraftSchema = z.object({
  acceptedPrivacy: z.boolean().optional(),
  acceptedTerms: z.boolean().optional(),
  wantsProcessCommunication: z.boolean().optional(),
})

type TechnicalResponsibleSignupDraft = z.infer<typeof technicalResponsibleSignupDraftSchema>

function canUseSessionStorage() {
  return typeof window !== 'undefined' && 'sessionStorage' in window
}

function toTechnicalResponsibleSignupDraft(
  values: Partial<TechnicalResponsibleSignupFormValues>,
): TechnicalResponsibleSignupDraft {
  return {
    acceptedPrivacy: values.acceptedPrivacy,
    acceptedTerms: values.acceptedTerms,
    wantsProcessCommunication: values.wantsProcessCommunication,
  }
}

function readTechnicalResponsibleSignupDraft() {
  if (!canUseSessionStorage()) {
    return {}
  }

  try {
    const storedDraft = window.sessionStorage.getItem(technicalResponsibleSignupDraftStorageKey)

    if (!storedDraft) {
      return {}
    }

    const parsedDraft = JSON.parse(storedDraft)
    const result = technicalResponsibleSignupDraftSchema.safeParse(parsedDraft)

    return result.success ? result.data : {}
  } catch {
    return {}
  }
}

function saveTechnicalResponsibleSignupDraft(
  values: Partial<TechnicalResponsibleSignupFormValues>,
) {
  if (!canUseSessionStorage()) {
    return
  }

  const draft = toTechnicalResponsibleSignupDraft(values)

  try {
    window.sessionStorage.setItem(technicalResponsibleSignupDraftStorageKey, JSON.stringify(draft))
  } catch {
    // Ignore unavailable storage; the form state remains in memory for the current page session.
  }
}

function clearTechnicalResponsibleSignupDraft() {
  if (!canUseSessionStorage()) {
    return
  }

  try {
    window.sessionStorage.removeItem(technicalResponsibleSignupDraftStorageKey)
  } catch {
    // Ignore unavailable storage; clearing is best-effort for this local-only draft.
  }
}

export {
  clearTechnicalResponsibleSignupDraft,
  readTechnicalResponsibleSignupDraft,
  saveTechnicalResponsibleSignupDraft,
  type TechnicalResponsibleSignupDraft,
  technicalResponsibleSignupDraftStorageKey,
  toTechnicalResponsibleSignupDraft,
}
