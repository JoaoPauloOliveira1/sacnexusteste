import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { type Control, Controller, useForm } from 'react-hook-form'

import { Button } from '@/modules/shared/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/modules/shared/components/ui/field'
import { RadioGroup, RadioGroupItem } from '@/modules/shared/components/ui/radio-group'

import { ContributorShell } from '../components/contributor-shell'
import { ProcessPage, ProcessPageActions } from '../components/process-page'
import { classificationQuestions } from '../lib/process-data'
import { useProcesses } from '../lib/process-store'
import {
  type QuestionnaireFormValues,
  type QuestionnaireValues,
  questionnaireSchema,
} from '../schemas/questionnaire-schema'

export function QuestionnairePage() {
  const navigate = useNavigate()
  const { actions, state } = useProcesses()
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<QuestionnaireFormValues, unknown, QuestionnaireValues>({
    defaultValues: {
      flammables: state.answers.flammables,
      areaAboveLimit: state.answers.areaAboveLimit,
      floorsAboveLimit: state.answers.floorsAboveLimit,
    },
    resolver: zodResolver(questionnaireSchema),
  })

  function handleResult(values: QuestionnaireValues) {
    actions.saveAnswers(values)
    actions.startClassificationAnalysis()
    void navigate({ to: '/processes/new/analyzing' })
  }

  return (
    <ContributorShell title="Novo processo">
      <ProcessPage
        title="Características do estabelecimento"
        description="Responda às perguntas para que o sistema determine o enquadramento aplicável."
        step={3}
      >
        <form onSubmit={handleSubmit(handleResult)} noValidate className="flex flex-col gap-3">
          <FieldGroup className="gap-3">
            {classificationQuestions.map((question) => (
              <QuestionCard key={question.id} control={control} question={question} />
            ))}
          </FieldGroup>

          <ProcessPageActions>
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigate({ to: '/processes/new/establishment' })}
            >
              Voltar
            </Button>
            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Analisar enquadramento
            </Button>
          </ProcessPageActions>
        </form>
      </ProcessPage>
    </ContributorShell>
  )
}

function QuestionCard({
  control,
  question,
}: {
  control: Control<QuestionnaireFormValues>
  question: (typeof classificationQuestions)[number]
}) {
  return (
    <Controller
      name={question.id}
      control={control}
      render={({ field, fieldState }) => (
        <FieldSet data-invalid={fieldState.invalid} className="rounded-md border bg-card p-4">
          <FieldLegend variant="label">
            {question.label}
            <span aria-hidden="true" className="ml-0.5 text-destructive">
              *
            </span>
            <span className="sr-only"> obrigatório</span>
          </FieldLegend>
          <RadioGroup
            value={field.value}
            onValueChange={(value) => field.onChange(value ?? '')}
            aria-invalid={fieldState.invalid}
            className="flex gap-6"
          >
            {(['Sim', 'Não'] as const).map((answer) => (
              <Field key={answer} orientation="horizontal">
                <RadioGroupItem
                  id={`${question.id}-${answer}`}
                  value={answer}
                  aria-describedby={fieldState.invalid ? `${question.id}-error` : undefined}
                />
                <FieldContent>
                  <FieldLabel
                    htmlFor={`${question.id}-${answer}`}
                    className="cursor-pointer font-normal"
                  >
                    {answer}
                  </FieldLabel>
                </FieldContent>
              </Field>
            ))}
          </RadioGroup>
          <FieldError id={`${question.id}-error`}>{fieldState.error?.message}</FieldError>
        </FieldSet>
      )}
    />
  )
}
