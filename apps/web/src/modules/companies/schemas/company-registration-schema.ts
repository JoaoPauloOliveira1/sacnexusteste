import { z } from 'zod'

const requiredText = z.string().trim().min(1, 'Campo obrigatório')

export const companyRegistrationSchema = z.object({
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Informe um CNPJ válido'),
  legalName: requiredText,
  tradeName: requiredText,
  registrationStatus: requiredText,
  openingDate: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Informe a data no formato DD/MM/AAAA'),
  legalNature: requiredText,
  primaryCnae: requiredText,
  // Address is no longer collected on the empresa form — it belongs to the unit
  // (the "matriz"). These fields stay (auto-filled from the CNPJ lookup) but are
  // not required nor shown here.
  cep: z.string().trim(),
  address: z.string().trim(),
  number: z.string().trim(),
  complement: z.string().trim(),
  neighborhood: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  phone: z.string().regex(/^\(\d{2}\) \d{4}-\d{4}$/, 'Informe um telefone válido'),
  mobile: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Informe um celular válido'),
  institutionalEmail: z.email('Informe um e-mail válido'),
  processOwner: requiredText,
  processOwnerRole: requiredText,
})

export type CompanyRegistrationValues = z.infer<typeof companyRegistrationSchema>
