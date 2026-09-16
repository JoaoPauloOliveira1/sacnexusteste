import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'
import { passwordPolicy } from '@/identity/password-policy.js'

export const signUpEmailOpenApi = {
  schema: {
    operationId: 'signUpWithEmail',
    tags: [authOpenApiTagName],
    summary: 'Create an IDP account with email and password',
    description:
      'Creates a Better Auth-backed IDP account and sends email verification. Effective system access requires verified email.',
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', format: 'email' },
        password: {
          type: 'string',
          minLength: passwordPolicy.minLength,
          maxLength: passwordPolicy.maxLength,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        additionalProperties: false,
        required: ['user'],
        properties: { user: { $ref: 'AuthUserResponse#' } },
      },
      400: { $ref: 'AuthErrorResponse#' },
      422: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
