import { z } from 'zod'

import { type IndividualSignupFormValues } from '../schemas/individual-signup-schema'

const individualSignupDraftStorageKey = 'sac-nexus:individual-signup-draft'

const individualSignupDraftSchema = z.object({
  acceptedPrivacy: z.boolean().optional(),
  acceptedTerms: z.boolean().optional(),
  wantsProcessCommunication: z.boolean().optional(),
})

type IndividualSignupDraft = z.infer<typeof individualSignupDraftSchema>

function canUseSessionStorage() {
  return typeof window !== 'undefined' && 'sessionStorage' in window
}

function toIndividualSignupDraft(
  values: Partial<IndividualSignupFormValues>,
): IndividualSignupDraft {
  return {
    acceptedPrivacy: values.acceptedPrivacy,
    acceptedTerms: values.acceptedTerms,
    wantsProcessCommunication: values.wantsProcessCommunication,
  }
}

function readIndividualSignupDraft() {
  if (!canUseSessionStorage()) {
    return {}
  }

  try {
    const storedDraft = window.sessionStorage.getItem(individualSignupDraftStorageKey)

    if (!storedDraft) {
      return {}
    }

    const parsedDraft = JSON.parse(storedDraft)
    const result = individualSignupDraftSchema.safeParse(parsedDraft)

    return result.success ? result.data : {}
  } catch {
    return {}
  }
}

function saveIndividualSignupDraft(values: Partial<IndividualSignupFormValues>) {
  if (!canUseSessionStorage()) {
    return
  }

  const draft = toIndividualSignupDraft(values)

  try {
    window.sessionStorage.setItem(individualSignupDraftStorageKey, JSON.stringify(draft))
  } catch {
    // Ignore unavailable storage; the form state remains in memory for the current page session.
  }
}

function clearIndividualSignupDraft() {
  if (!canUseSessionStorage()) {
    return
  }

  try {
    window.sessionStorage.removeItem(individualSignupDraftStorageKey)
  } catch {
    // Ignore unavailable storage; clearing is best-effort for this local-only draft.
  }
}

export {
  clearIndividualSignupDraft,
  type IndividualSignupDraft,
  individualSignupDraftStorageKey,
  readIndividualSignupDraft,
  saveIndividualSignupDraft,
  toIndividualSignupDraft,
}
