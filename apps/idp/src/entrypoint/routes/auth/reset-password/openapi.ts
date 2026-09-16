import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'
import { passwordPolicy } from '@/identity/password-policy.js'

export const resetPasswordOpenApi = {
  schema: {
    operationId: 'resetPassword',
    tags: [authOpenApiTagName],
    summary: 'Reset password with a Better Auth token',
    description: 'Completes a password reset using Better Auth-supported token handling.',
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['new_password', 'token'],
      properties: {
        new_password: {
          type: 'string',
          minLength: passwordPolicy.minLength,
          maxLength: passwordPolicy.maxLength,
        },
        token: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        additionalProperties: true,
        properties: { status: { type: 'boolean' } },
      },
      400: { $ref: 'AuthErrorResponse#' },
      422: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
