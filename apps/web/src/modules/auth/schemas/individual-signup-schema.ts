import { z } from 'zod'
import { getDigits } from '@/modules/shared/lib/validators/digits'
import { isValidCpf } from '@/modules/shared/lib/validators/validate-cpf'
import {
  type BrazilianState,
  brazilianStateValues,
  getMaximumBirthDate,
  getMinimumBirthDate,
  isAllowedBirthDate,
  isBrazilianState,
  parseIsoDate,
} from './signup-common-schema'

const individualSignupStepValues = [
  'personal-data',
  'address',
  'security',
  'email-verification',
] as const

const stepFieldNames = {
  'personal-data': ['firstName', 'lastName', 'cpf', 'birthDate'],
  address: ['cep', 'street', 'number', 'hasNoNumber', 'neighborhood', 'city', 'state'],
  security: [
    'password',
    'passwordConfirmation',
    'acceptedTerms',
    'acceptedPrivacy',
    'wantsProcessCommunication',
  ],
  'email-verification': ['otp'],
} as const

const individualSignupSchema = z.object({
  acceptedPrivacy: z.boolean().refine((value) => value, 'Aceite a política de privacidade.'),
  acceptedTerms: z.boolean().refine((value) => value, 'Aceite os termos de uso.'),
  birthDate: z
    .string()
    .min(1, 'Informe sua data de nascimento.')
    .refine(isAllowedBirthDate, 'Informe uma data válida'),
  cep: z.string().refine((value) => getDigits(value).length === 8, 'Informe um CEP válido.'),
  city: z.string().trim().min(2, 'Informe sua cidade.'),
  cpf: z.string().refine(isValidCpf, 'Informe um CPF válido.'),
  firstName: z.string().trim().min(2, 'Informe seu nome.'),
  hasNoNumber: z.boolean(),
  lastName: z.string().trim().min(2, 'Informe seu sobrenome.'),
  neighborhood: z.string().trim().min(2, 'Informe seu bairro.'),
  number: z.string().trim().optional(),
  otp: z.string().regex(/^\d{6}$/, 'Informe o código de 6 dígitos.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  passwordConfirmation: z.string().min(1, 'Confirme sua senha.'),
  state: z.string().refine((value) => Boolean(isBrazilianState(value)), 'Selecione uma UF.'),
  street: z.string().trim().min(2, 'Informe seu endereço.'),
  wantsProcessCommunication: z.boolean(),
})

const personalDataSignupSchema = z.object({
  birthDate: z
    .string()
    .min(1, 'Informe sua data de nascimento.')
    .refine(isAllowedBirthDate, 'Informe uma data válida'),
  cpf: z.string().refine(isValidCpf, 'Informe um CPF válido.'),
  firstName: z.string().trim().min(2, 'Informe seu nome.'),
  lastName: z.string().trim().min(2, 'Informe seu sobrenome.'),
})

const addressSignupSchema = z
  .object({
    cep: z.string().refine((value) => getDigits(value).length === 8, 'Informe um CEP válido.'),
    city: z.string().trim().min(2, 'Informe sua cidade.'),
    hasNoNumber: z.boolean(),
    neighborhood: z.string().trim().min(2, 'Informe seu bairro.'),
    number: z.string().trim().optional(),
    state: z.string().refine((value) => Boolean(isBrazilianState(value)), 'Selecione uma UF.'),
    street: z.string().trim().min(2, 'Informe seu endereço.'),
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

const securitySignupSchema = z
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

const emailVerificationSignupSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Informe o código de 6 dígitos.'),
})

const individualSignupStepSchemas = {
  address: addressSignupSchema,
  'email-verification': emailVerificationSignupSchema,
  'personal-data': personalDataSignupSchema,
  security: securitySignupSchema,
}

type IndividualSignupStep = (typeof individualSignupStepValues)[number]
type IndividualSignupFormValues = z.infer<typeof individualSignupSchema>

const individualSignupDefaultValues = {
  acceptedPrivacy: false,
  acceptedTerms: false,
  birthDate: '',
  cep: '',
  city: '',
  cpf: '',
  firstName: '',
  hasNoNumber: false,
  lastName: '',
  neighborhood: '',
  number: '',
  otp: '',
  password: '',
  passwordConfirmation: '',
  state: '',
  street: '',
  wantsProcessCommunication: false,
} satisfies IndividualSignupFormValues

export {
  type BrazilianState,
  brazilianStateValues,
  getDigits,
  getMaximumBirthDate,
  getMinimumBirthDate,
  type IndividualSignupFormValues,
  type IndividualSignupStep,
  individualSignupDefaultValues,
  individualSignupSchema,
  individualSignupStepSchemas,
  individualSignupStepValues,
  isBrazilianState,
  parseIsoDate,
  stepFieldNames,
}
