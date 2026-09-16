import * as React from 'react'
import { type FieldPath, FormProvider, useForm } from 'react-hook-form'

import { Button } from '@/modules/shared/components/ui/button'
import { FieldGroup } from '@/modules/shared/components/ui/field'
import { sleep } from '@/modules/shared/lib/sleep'
import { SignupWizardIntro } from '../components/signup-wizard-intro'
import {
  clearCompanySignupDraft,
  readCompanySignupDraft,
  saveCompanySignupDraft,
} from '../lib/company-signup-draft'
import {
  type CompanySignupFormValues,
  type CompanySignupStep,
  companySignupDefaultValues,
  companySignupStepSchemas,
  companySignupStepValues,
  companyStepFieldNames,
} from '../schemas/company-signup-schema'
import { SignupAddressStep } from './signup-address-step'
import { SignupCompanyDataStep } from './signup-company-data-step'
import { SignupEmailVerificationStep } from './signup-email-verification-step'
import { SignupSecurityStep } from './signup-security-step'

function getNextCompanyStep(step: CompanySignupStep) {
  return companySignupStepValues[companySignupStepValues.indexOf(step) + 1]
}

function pickCompanyStepValues(values: CompanySignupFormValues, step: CompanySignupStep) {
  return Object.fromEntries(
    companyStepFieldNames[step].map((fieldName) => [fieldName, values[fieldName]]),
  )
}

function getCompanyDefaultValuesWithDraft(): CompanySignupFormValues {
  const draft = readCompanySignupDraft()

  return {
    ...companySignupDefaultValues,
    acceptedPrivacy: draft.acceptedPrivacy ?? companySignupDefaultValues.acceptedPrivacy,
    acceptedTerms: draft.acceptedTerms ?? companySignupDefaultValues.acceptedTerms,
    wantsProcessCommunication:
      draft.wantsProcessCommunication ?? companySignupDefaultValues.wantsProcessCommunication,
  }
}

interface CompanySignupFormProps {
  currentStep: CompanySignupStep
  onSuccess: () => void
  onStepChange: (step: CompanySignupStep) => void
}

function CompanySignupForm({ currentStep, onSuccess, onStepChange }: CompanySignupFormProps) {
  const currentStepRef = React.useRef(currentStep)
  const submissionTokenRef = React.useRef(0)
  const form = useForm<CompanySignupFormValues>({
    defaultValues: getCompanyDefaultValuesWithDraft(),
    mode: 'onSubmit',
  })
  const { clearErrors, getValues, handleSubmit, setError, watch } = form

  React.useEffect(() => {
    const subscription = watch((values, { name }) => {
      saveCompanySignupDraft(values)

      if (name && ([...companyStepFieldNames[currentStepRef.current]] as string[]).includes(name)) {
        clearErrors(name as FieldPath<CompanySignupFormValues>)
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
    const stepFields = [...companyStepFieldNames[currentStep]] as Array<
      FieldPath<CompanySignupFormValues>
    >
    const result = companySignupStepSchemas[currentStep].safeParse(
      pickCompanyStepValues(getValues(), currentStep),
    )

    clearErrors(stepFields)

    if (result.success) {
      return true
    }

    for (const issue of result.error.issues) {
      const fieldName = issue.path[0]

      if (typeof fieldName === 'string') {
        setError(fieldName as FieldPath<CompanySignupFormValues>, {
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

      clearCompanySignupDraft()
      onSuccess()
      return
    }

    const nextStep = getNextCompanyStep(currentStep)

    if (nextStep) {
      onStepChange(nextStep)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(handleCurrentStepSubmit)} noValidate>
        <FieldGroup className="gap-4">
          <SignupWizardIntro accountType="Empresa" />
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

export { CompanySignupForm, getNextCompanyStep }
