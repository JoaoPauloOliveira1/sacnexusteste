import { z } from 'zod'

export const establishmentRegistrationSchema = z.object({
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-\d{3}$/, 'Informe um CEP válido.'),
  address: z.string().trim().min(3, 'Informe o logradouro.'),
  neighborhood: z.string().trim().min(2, 'Informe o bairro.'),
  city: z.string().trim().min(2, 'Informe o município.'),
  builtArea: z
    .string()
    .trim()
    .min(1, 'Informe a área construída.')
    .refine((value) => Number(value) > 0, 'Informe uma área maior que zero.'),
  floors: z
    .string()
    .trim()
    .min(1, 'Informe o número de pavimentos.')
    .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
      message: 'Informe pelo menos um pavimento.',
    }),
})

export type EstablishmentRegistrationValues = z.infer<typeof establishmentRegistrationSchema>
