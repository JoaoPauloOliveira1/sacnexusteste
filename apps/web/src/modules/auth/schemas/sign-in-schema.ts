import { z } from 'zod'

// Logins de demonstração que não são e-mail (ex.: administrador de testes "AVCB").
const demoLoginHandles = ['avcb']

const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Informe seu e-mail.')
    .refine(
      (value) =>
        z.email().safeParse(value).success || demoLoginHandles.includes(value.toLowerCase()),
      {
        message: 'Informe um e-mail válido.',
      },
    ),
  password: z.string().min(1, 'Informe sua senha.'),
})

type SignInFormValues = z.infer<typeof signInSchema>

export { type SignInFormValues, signInSchema }
