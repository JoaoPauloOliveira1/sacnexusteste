import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'

import {
  type TechnicalResponsibleSignupStep,
  TechnicalResponsibleSignupWizardPage,
  technicalResponsibleSignupStepValues,
} from '@/modules/auth'

const technicalResponsibleSignupSearchSchema = z
  .object({
    step: z.enum(technicalResponsibleSignupStepValues).catch('responsible-data'),
  })
  .catch({ step: 'responsible-data' })

export const Route = createFileRoute('/signup/technical-responsible')({
  validateSearch: (search) => technicalResponsibleSignupSearchSchema.parse(search),
  component: TechnicalResponsibleSignupRoute,
})

function TechnicalResponsibleSignupRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  React.useEffect(() => {
    const rawStep = new URLSearchParams(window.location.search).get('step')

    if (rawStep !== search.step) {
      void navigate({ replace: true, search: { step: search.step } })
    }
  }, [navigate, search.step])

  function handleStepChange(step: TechnicalResponsibleSignupStep) {
    void navigate({ search: { step } })
  }

  function handleBack() {
    const currentIndex = technicalResponsibleSignupStepValues.indexOf(search.step)

    if (currentIndex <= 0) {
      void navigate({ to: '/signup' })
      return
    }

    const previousStep = technicalResponsibleSignupStepValues[currentIndex - 1]

    if (previousStep) {
      handleStepChange(previousStep)
    }
  }

  return (
    <TechnicalResponsibleSignupWizardPage
      currentStep={search.step}
      onBack={handleBack}
      onSuccess={() => void navigate({ to: '/signup/technical-responsible-success' })}
      onStepChange={handleStepChange}
    />
  )
}
