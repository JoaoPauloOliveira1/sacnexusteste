import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'
import { passwordPolicy } from '@/identity/password-policy.js'

export const changePasswordOpenApi = {
  schema: {
    operationId: 'changePassword',
    tags: [authOpenApiTagName],
    summary: 'Change password for the current authenticated account',
    description:
      'Changes the authenticated user password and requests revocation of other sessions.',
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['current_password', 'new_password'],
      properties: {
        current_password: { type: 'string', minLength: 1 },
        new_password: {
          type: 'string',
          minLength: passwordPolicy.minLength,
          maxLength: passwordPolicy.maxLength,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        additionalProperties: true,
        properties: { user: { $ref: 'AuthUserResponse#' } },
      },
      400: { $ref: 'AuthErrorResponse#' },
      401: { $ref: 'AuthErrorResponse#' },
      422: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
