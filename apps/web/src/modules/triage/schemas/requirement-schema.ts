import { z } from 'zod'

export const requirementSchema = z.object({
  title: z.string().trim().min(5, 'Informe um título com pelo menos 5 caracteres.'),
  description: z.string().trim().min(15, 'Descreva a inconsistência administrativa.'),
  relatedDocument: z.string().min(1, 'Selecione o documento relacionado.'),
  category: z.string().min(1, 'Selecione a categoria.'),
  deadline: z.string().min(1, 'Informe o prazo para correção.'),
  observations: z.string().trim().max(500, 'Use no máximo 500 caracteres.'),
})
