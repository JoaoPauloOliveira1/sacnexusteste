import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const getAuthSessionOpenApi = {
  schema: {
    operationId: 'getAuthSession',
    tags: [authOpenApiTagName],
    summary: 'Read the current auth session',
    description:
      'Returns the current Better Auth-backed session as a sanitized payload without session tokens or session IDs.',
    response: {
      200: {
        type: 'object',
        additionalProperties: false,
        required: ['authenticated'],
        properties: {
          authenticated: { type: 'boolean', example: true },
          user: { $ref: 'AuthUserResponse#' },
          session: { $ref: 'AuthSessionResponse#' },
        },
      },
    },
  },
} as const
