import * as React from 'react'
import { type FieldPath, FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/modules/shared/components/ui/button'
import { FieldGroup } from '@/modules/shared/components/ui/field'
import { sleep } from '@/modules/shared/lib/sleep'
import { SignupWizardIntro } from '../components/signup-wizard-intro'
import {
  clearIndividualSignupDraft,
  readIndividualSignupDraft,
  saveIndividualSignupDraft,
} from '../lib/individual-signup-draft'
import {
  type IndividualSignupFormValues,
  type IndividualSignupStep,
  individualSignupDefaultValues,
  individualSignupStepSchemas,
  individualSignupStepValues,
  stepFieldNames,
} from '../schemas/individual-signup-schema'
import { IndividualSignupPersonalDataStep } from './individual-signup-personal-data-step'
import { SignupAddressStep } from './signup-address-step'
import { SignupEmailVerificationStep } from './signup-email-verification-step'
import { SignupSecurityStep } from './signup-security-step'

function getNextStep(step: IndividualSignupStep) {
  const nextStep = individualSignupStepValues[individualSignupStepValues.indexOf(step) + 1]

  return nextStep
}

function pickStepValues(values: IndividualSignupFormValues, step: IndividualSignupStep) {
  return Object.fromEntries(stepFieldNames[step].map((fieldName) => [fieldName, values[fieldName]]))
}

function getDefaultValuesWithDraft(): IndividualSignupFormValues {
  const draft = readIndividualSignupDraft()

  return {
    ...individualSignupDefaultValues,
    acceptedPrivacy: draft.acceptedPrivacy ?? individualSignupDefaultValues.acceptedPrivacy,
    acceptedTerms: draft.acceptedTerms ?? individualSignupDefaultValues.acceptedTerms,
    wantsProcessCommunication:
      draft.wantsProcessCommunication ?? individualSignupDefaultValues.wantsProcessCommunication,
  }
}

interface IndividualSignupFormProps {
  currentStep: IndividualSignupStep
  onSuccess: () => void
  onStepChange: (step: IndividualSignupStep) => void
}

function IndividualSignupForm({ currentStep, onSuccess, onStepChange }: IndividualSignupFormProps) {
  const currentStepRef = React.useRef(currentStep)
  const submissionTokenRef = React.useRef(0)
  const form = useForm<IndividualSignupFormValues>({
    defaultValues: getDefaultValuesWithDraft(),
    mode: 'onSubmit',
  })
  const { clearErrors, getValues, handleSubmit, setError, watch } = form

  React.useEffect(() => {
    const subscription = watch((values, { name }) => {
      saveIndividualSignupDraft(values)

      if (name && ([...stepFieldNames[currentStepRef.current]] as string[]).includes(name)) {
        clearErrors(name as FieldPath<IndividualSignupFormValues>)
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
    const stepFields = [...stepFieldNames[currentStep]] as Array<
      FieldPath<IndividualSignupFormValues>
    >
    const result = individualSignupStepSchemas[currentStep].safeParse(
      pickStepValues(getValues(), currentStep),
    )

    clearErrors(stepFields)

    if (result.success) {
      return true
    }

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0]

      if (typeof fieldName === 'string') {
        setError(fieldName as FieldPath<IndividualSignupFormValues>, {
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

      clearIndividualSignupDraft()
      onSuccess()
      return
    }

    const nextStep = getNextStep(currentStep)

    if (nextStep) {
      onStepChange(nextStep)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleCurrentStepSubmit)} noValidate>
        <FieldGroup className="gap-4">
          <SignupWizardIntro accountType="Pessoa Física" />
          {currentStep === 'personal-data' ? <IndividualSignupPersonalDataStep /> : null}
          {currentStep === 'address' ? <SignupAddressStep /> : null}
          {currentStep === 'security' ? <SignupSecurityStep /> : null}
          {currentStep === 'email-verification' ? <SignupEmailVerificationStep /> : null}
          {currentStep !== 'email-verification' ? (
            <Button type="submit" className="h-10 w-full rounded-md">
              Continuar
            </Button>
          ) : null}
        </FieldGroup>
      </form>
    </FormProvider>
  )
}

export { getNextStep, IndividualSignupForm }
