import { z } from 'zod'

const answerSchema = z
  .enum(['Sim', 'Não', ''])
  .refine((answer) => answer !== '', 'Selecione uma resposta.')

export const questionnaireSchema = z.object({
  flammables: answerSchema,
  areaAboveLimit: answerSchema,
  floorsAboveLimit: answerSchema,
})

export type QuestionnaireFormValues = z.input<typeof questionnaireSchema>
export type QuestionnaireValues = z.output<typeof questionnaireSchema>
