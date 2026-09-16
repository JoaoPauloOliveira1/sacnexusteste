import * as React from 'react'
import { type FieldPath, FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/modules/shared/components/ui/button'
import { FieldGroup } from '@/modules/shared/components/ui/field'
import { sleep } from '@/modules/shared/lib/sleep'
import { SignupWizardIntro } from '../components/signup-wizard-intro'
import {
  clearTechnicalResponsibleSignupDraft,
  readTechnicalResponsibleSignupDraft,
  saveTechnicalResponsibleSignupDraft,
} from '../lib/technical-responsible-signup-draft'
import {
  type TechnicalResponsibleSignupFormValues,
  type TechnicalResponsibleSignupStep,
  technicalResponsibleSignupDefaultValues,
  technicalResponsibleSignupStepSchemas,
  technicalResponsibleSignupStepValues,
  technicalResponsibleStepFieldNames,
} from '../schemas/technical-responsible-signup-schema'
import { SignupAddressStep } from './signup-address-step'
import { SignupCompanyDataStep } from './signup-company-data-step'
import { SignupEmailVerificationStep } from './signup-email-verification-step'
import { SignupSecurityStep } from './signup-security-step'
import { TechnicalResponsibleDataStep } from './technical-responsible-data-step'

function getNextTechnicalResponsibleStep(step: TechnicalResponsibleSignupStep) {
  return technicalResponsibleSignupStepValues[
    technicalResponsibleSignupStepValues.indexOf(step) + 1
  ]
}

function pickTechnicalResponsibleStepValues(
  values: TechnicalResponsibleSignupFormValues,
  step: TechnicalResponsibleSignupStep,
) {
  return Object.fromEntries(
    technicalResponsibleStepFieldNames[step].map((fieldName) => [fieldName, values[fieldName]]),
  )
}

function getTechnicalResponsibleDefaultValuesWithDraft(): TechnicalResponsibleSignupFormValues {
  const draft = readTechnicalResponsibleSignupDraft()

  return {
    ...technicalResponsibleSignupDefaultValues,
    acceptedPrivacy:
      draft.acceptedPrivacy ?? technicalResponsibleSignupDefaultValues.acceptedPrivacy,
    acceptedTerms: draft.acceptedTerms ?? technicalResponsibleSignupDefaultValues.acceptedTerms,
    wantsProcessCommunication:
      draft.wantsProcessCommunication ??
      technicalResponsibleSignupDefaultValues.wantsProcessCommunication,
  }
}

interface TechnicalResponsibleSignupFormProps {
  currentStep: TechnicalResponsibleSignupStep
  onSuccess: () => void
  onStepChange: (step: TechnicalResponsibleSignupStep) => void
}

function TechnicalResponsibleSignupForm({
  currentStep,
  onSuccess,
  onStepChange,
}: TechnicalResponsibleSignupFormProps) {
  const currentStepRef = React.useRef(currentStep)
  const submissionTokenRef = React.useRef(0)
  const form = useForm<TechnicalResponsibleSignupFormValues>({
    defaultValues: getTechnicalResponsibleDefaultValuesWithDraft(),
    mode: 'onSubmit',
  })
  const { clearErrors, getValues, handleSubmit, setError, watch } = form

  React.useEffect(() => {
    const subscription = watch((values, { name }) => {
      saveTechnicalResponsibleSignupDraft(values)

      if (
        name &&
        ([...technicalResponsibleStepFieldNames[currentStepRef.current]] as string[]).includes(name)
      ) {
        clearErrors(name as FieldPath<TechnicalResponsibleSignupFormValues>)
      }
    })

    return () => subscription.unsubscribe()
  }, [clearErrors, watch])

  React.useEffect(() => {
    currentStepRef.current = currentStep
    submissionTokenRef.current += 1

    return () => {
      submissionTokenRef.current += 1
    }
  }, [currentStep])

  function validateCurrentStep() {
    const stepFields = [...technicalResponsibleStepFieldNames[currentStep]] as Array<
      FieldPath<TechnicalResponsibleSignupFormValues>
    >
    const result = technicalResponsibleSignupStepSchemas[currentStep].safeParse(
      pickTechnicalResponsibleStepValues(getValues(), currentStep),
    )

    clearErrors(stepFields)

    if (result.success) {
      return true
    }

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0]

      if (typeof fieldName === 'string') {
        setError(fieldName as FieldPath<TechnicalResponsibleSignupFormValues>, {
          message: issue.message,
          type: 'manual',
        })
      }
    }

    return false
  }

  async function handleCurrentStepSubmit() {
    if (!validateCurrentStep()) {
      return
    }

    if (currentStep === 'email-verification') {
      const submissionToken = submissionTokenRef.current

      await sleep(3000)

      if (
        submissionToken !== submissionTokenRef.current ||
        currentStepRef.current !== currentStep
      ) {
        return
      }

      clearTechnicalResponsibleSignupDraft()
      onSuccess()
      return
    }

    const nextStep = getNextTechnicalResponsibleStep(currentStep)

    if (nextStep) {
      onStepChange(nextStep)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleCurrentStepSubmit)} noValidate>
        <FieldGroup className="gap-4">
          <SignupWizardIntro
            accountType="Responsável Técnico"
            description="(Engenheiro, arquiteto ou procurador)"
          />
          {currentStep === 'responsible-data' ? <TechnicalResponsibleDataStep /> : null}
          {currentStep === 'company-data' ? <SignupCompanyDataStep /> : null}
          {currentStep === 'address' ? <SignupAddressStep /> : null}
          {currentStep === 'security' ? <SignupSecurityStep /> : null}
          {currentStep === 'email-verification' ? <SignupEmailVerificationStep /> : null}
          {currentStep !== 'email-verification' ? (
            <Button type="submit" className="h-10 w-full rounded-md">
              {currentStep === 'security' ? 'Criar conta' : 'Continuar'}
            </Button>
          ) : null}
        </FieldGroup>
      </form>
    </FormProvider>
  )
}

export { getNextTechnicalResponsibleStep, TechnicalResponsibleSignupForm }
