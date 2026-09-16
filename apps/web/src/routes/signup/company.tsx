import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { z } from 'zod'

import {
  type CompanySignupStep,
  CompanySignupWizardPage,
  companySignupStepValues,
} from '@/modules/auth'

const companySignupSearchSchema = z
  .object({
    step: z.enum(companySignupStepValues).catch('company-data'),
  })
  .catch({ step: 'company-data' })

export const Route = createFileRoute('/signup/company')({
  validateSearch: (search) => companySignupSearchSchema.parse(search),
  component: CompanySignupRoute,
})

function CompanySignupRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  React.useEffect(() => {
    const rawStep = new URLSearchParams(window.location.search).get('step')

    if (rawStep !== search.step) {
      void navigate({ replace: true, search: { step: search.step } })
    }
  }, [navigate, search.step])

  function handleStepChange(step: CompanySignupStep) {
    void navigate({ search: { step } })
  }

  function handleBack() {
    const currentIndex = companySignupStepValues.indexOf(search.step)

    if (currentIndex <= 0) {
      void navigate({ to: '/signup' })
      return
    }

    const previousStep = companySignupStepValues[currentIndex - 1]

    if (previousStep) {
      handleStepChange(previousStep)
    }
  }

  return (
    <CompanySignupWizardPage
      currentStep={search.step}
      onBack={handleBack}
      onSuccess={() => void navigate({ to: '/signup/company-success' })}
      onStepChange={handleStepChange}
    />
  )
}
