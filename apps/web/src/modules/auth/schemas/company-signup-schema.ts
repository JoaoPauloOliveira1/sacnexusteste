import { z } from 'zod'
import { isValidBrazilianPhoneShape } from '@/modules/shared/lib/formatters/format-phone'
import { getDigits } from '@/modules/shared/lib/validators/digits'
import { isValidCnpj } from '@/modules/shared/lib/validators/validate-cnpj'
import { isValidCpf } from '@/modules/shared/lib/validators/validate-cpf'
import { isBrazilianState } from './signup-common-schema'

const companySignupStepValues = [
  'company-data',
  'address',
  'security',
  'email-verification',
] as const

const companyStepFieldNames = {
  address: ['cep', 'street', 'number', 'hasNoNumber', 'neighborhood', 'city', 'state'],
  'company-data': ['legalName', 'tradeName', 'cnpj', 'representativeCpf', 'email', 'phone'],
  'email-verification': ['otp'],
  security: [
    'password',
    'passwordConfirmation',
    'acceptedTerms',
    'acceptedPrivacy',
    'wantsProcessCommunication',
  ],
} as const

const companyDataSignupSchema = z.object({
  cnpj: z.string().refine(isValidCnpj, 'Informe um CNPJ válido.'),
  email: z.email('Informe um e-mail válido.'),
  legalName: z.string().trim().min(2, 'Informe a razão social.'),
  phone: z.string().refine(isValidBrazilianPhoneShape, 'Informe um telefone válido.'),
  representativeCpf: z.string().refine(isValidCpf, 'Informe um CPF válido.'),
  tradeName: z.string().trim().min(2, 'Informe o nome fantasia.'),
})

const companyAddressSignupSchema = z
  .object({
    cep: z.string().refine((value) => getDigits(value).length === 8, 'Informe um CEP válido.'),
    city: z.string().trim().min(2, 'Informe a cidade.'),
    hasNoNumber: z.boolean(),
    neighborhood: z.string().trim().min(2, 'Informe o bairro.'),
    number: z.string().trim().optional(),
    state: z.string().refine((value) => Boolean(isBrazilianState(value)), 'Selecione uma UF.'),
    street: z.string().trim().min(2, 'Informe a rua.'),
  })
  .superRefine((values, context) => {
    if (!values.hasNoNumber && !values.number?.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o número ou marque sem número.',
        path: ['number'],
      })
    }
  })

const companySecuritySignupSchema = z
  .object({
    acceptedPrivacy: z.boolean().refine((value) => value, 'Aceite a política de privacidade.'),
    acceptedTerms: z.boolean().refine((value) => value, 'Aceite os termos de uso.'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    passwordConfirmation: z.string().min(1, 'Confirme sua senha.'),
    wantsProcessCommunication: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.password !== values.passwordConfirmation) {
      context.addIssue({
        code: 'custom',
        message: 'As senhas não conferem.',
        path: ['passwordConfirmation'],
      })
    }
  })

const companyEmailVerificationSignupSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Informe o código de 6 dígitos.'),
})

const companySignupSchema = z
  .object({
    acceptedPrivacy: z.boolean().refine((value) => value, 'Aceite a política de privacidade.'),
    acceptedTerms: z.boolean().refine((value) => value, 'Aceite os termos de uso.'),
    cep: z.string().refine((value) => getDigits(value).length === 8, 'Informe um CEP válido.'),
    city: z.string().trim().min(2, 'Informe a cidade.'),
    cnpj: z.string().refine(isValidCnpj, 'Informe um CNPJ válido.'),
    email: z.email('Informe um e-mail válido.'),
    hasNoNumber: z.boolean(),
    legalName: z.string().trim().min(2, 'Informe a razão social.'),
    neighborhood: z.string().trim().min(2, 'Informe o bairro.'),
    number: z.string().trim().optional(),
    otp: z.string().regex(/^\d{6}$/, 'Informe o código de 6 dígitos.'),
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
    passwordConfirmation: z.string().min(1, 'Confirme sua senha.'),
    phone: z.string().refine(isValidBrazilianPhoneShape, 'Informe um telefone válido.'),
    representativeCpf: z.string().refine(isValidCpf, 'Informe um CPF válido.'),
    state: z.string().refine((value) => Boolean(isBrazilianState(value)), 'Selecione uma UF.'),
    street: z.string().trim().min(2, 'Informe a rua.'),
    tradeName: z.string().trim().min(2, 'Informe o nome fantasia.'),
    wantsProcessCommunication: z.boolean(),
  })
  .superRefine((values, context) => {
    if (!values.hasNoNumber && !values.number?.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o número ou marque sem número.',
        path: ['number'],
      })
    }

    if (values.password !== values.passwordConfirmation) {
      context.addIssue({
        code: 'custom',
        message: 'As senhas não conferem.',
        path: ['passwordConfirmation'],
      })
    }
  })

const companySignupStepSchemas = {
  address: companyAddressSignupSchema,
  'company-data': companyDataSignupSchema,
  'email-verification': companyEmailVerificationSignupSchema,
  security: companySecuritySignupSchema,
}

type CompanySignupStep = (typeof companySignupStepValues)[number]
type CompanySignupFormValues = z.infer<typeof companySignupSchema>

const companySignupDefaultValues = {
  acceptedPrivacy: false,
  acceptedTerms: false,
  cep: '',
  city: '',
  cnpj: '',
  email: '',
  hasNoNumber: false,
  legalName: '',
  neighborhood: '',
  number: '',
  otp: '',
  password: '',
  passwordConfirmation: '',
  phone: '',
  representativeCpf: '',
  state: '',
  street: '',
  tradeName: '',
  wantsProcessCommunication: false,
} satisfies CompanySignupFormValues

export {
  type CompanySignupFormValues,
  type CompanySignupStep,
  companySignupDefaultValues,
  companySignupSchema,
  companySignupStepSchemas,
  companySignupStepValues,
  companyStepFieldNames,
}
