import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const requestPasswordResetCallbackOpenApi = {
  schema: {
    operationId: 'requestPasswordResetCallback',
    tags: [authOpenApiTagName],
    summary: 'Validate a password reset token and redirect to reset UX',
    description:
      'Handles the Better Auth password reset email callback before redirecting to the server-configured frontend reset page.',
    params: {
      type: 'object',
      additionalProperties: false,
      required: ['token'],
      properties: { token: { type: 'string' } },
    },
    querystring: {
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: { callbackURL: { type: 'string', format: 'uri' } },
    },
    response: {
      200: { type: 'object', additionalProperties: true },
      302: { type: 'null', description: 'Redirect to the configured callback URL.' },
      400: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
