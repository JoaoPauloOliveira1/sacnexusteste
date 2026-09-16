import { z } from 'zod'

export const riskTwoResponsibleSchema = z.object({
  cpf: z
    .string()
    .trim()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Informe um CPF válido.'),
  phone: z
    .string()
    .trim()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Informe um telefone válido.'),
  relationship: z.enum(
    ['owner', 'legal-representative', 'proxy', 'technical-responsible'],
    'Selecione o vínculo com o estabelecimento.',
  ),
  role: z.string().trim().min(2, 'Informe o cargo ou a função.'),
})

export const riskTwoRequirementResponseSchema = z.object({
  response: z.string().trim().min(10, 'Descreva a providência tomada em pelo menos 10 caracteres.'),
})

export type RiskTwoResponsibleValues = z.infer<typeof riskTwoResponsibleSchema>
export type RiskTwoRequirementResponseValues = z.infer<typeof riskTwoRequirementResponseSchema>
