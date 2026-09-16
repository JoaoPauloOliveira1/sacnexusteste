import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const verifyEmailOpenApi = {
  schema: {
    operationId: 'verifyEmail',
    tags: [authOpenApiTagName],
    summary: 'Verify an email address with a Better Auth token',
    description:
      'Consumes a Better Auth email verification token and redirects to the server-configured callback URL.',
    querystring: {
      type: 'object',
      additionalProperties: false,
      required: ['token'],
      properties: {
        callbackURL: { type: 'string', format: 'uri' },
        token: { type: 'string' },
      },
    },
    response: {
      200: { type: 'object', additionalProperties: true },
      302: { type: 'null', description: 'Redirect to the configured callback URL.' },
      400: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
