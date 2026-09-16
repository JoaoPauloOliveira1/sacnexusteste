import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'

import {
  type IndividualSignupStep,
  IndividualSignupWizardPage,
  individualSignupStepValues,
} from '@/modules/auth'

const individualSignupSearchSchema = z
  .object({
    step: z.enum(individualSignupStepValues).catch('personal-data'),
  })
  .catch({ step: 'personal-data' })

export const Route = createFileRoute('/signup/individual')({
  validateSearch: (search) => individualSignupSearchSchema.parse(search),
  component: IndividualSignupRoute,
})

function IndividualSignupRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  React.useEffect(() => {
    const rawStep = new URLSearchParams(window.location.search).get('step')

    if (rawStep !== search.step) {
      void navigate({ replace: true, search: { step: search.step } })
    }
  }, [navigate, search.step])

  function handleStepChange(step: IndividualSignupStep) {
    void navigate({ search: { step } })
  }

  function handleBack() {
    const currentIndex = individualSignupStepValues.indexOf(search.step)

    if (currentIndex <= 0) {
      void navigate({ to: '/signup' })
      return
    }

    const previousStep = individualSignupStepValues[currentIndex - 1]

    if (previousStep) {
      handleStepChange(previousStep)
    }
  }

  return (
    <IndividualSignupWizardPage
      currentStep={search.step}
      onBack={handleBack}
      onSuccess={() => void navigate({ to: '/signup/individual-success' })}
      onStepChange={handleStepChange}
    />
  )
}
