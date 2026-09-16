import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const sendVerificationEmailOpenApi = {
  schema: {
    operationId: 'sendVerificationEmail',
    tags: [authOpenApiTagName],
    summary: 'Send or resend an email verification message',
    description:
      'Requests an email verification message without revealing whether the account exists or still needs verification.',
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['email'],
      properties: {
        callback_url: { type: 'string', format: 'uri' },
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
