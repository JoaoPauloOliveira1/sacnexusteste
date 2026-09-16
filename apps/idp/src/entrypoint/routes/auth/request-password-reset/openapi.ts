import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const requestPasswordResetOpenApi = {
  schema: {
    operationId: 'requestPasswordReset',
    tags: [authOpenApiTagName],
    summary: 'Request a password reset email',
    description:
      'Requests password reset instructions without revealing whether the account exists or is verified. The reset redirect URL is controlled by server configuration.',
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email' },
      },
    },
    response: {
      200: {
        type: 'object',
        additionalProperties: false,
        required: ['message', 'status'],
        properties: {
          message: { type: 'string' },
          status: { type: 'boolean' },
        },
      },
      400: { $ref: 'AuthErrorResponse#' },
      422: { $ref: 'AuthErrorResponse#' },
      500: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
