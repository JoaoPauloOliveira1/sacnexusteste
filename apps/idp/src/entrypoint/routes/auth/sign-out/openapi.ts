import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const signOutOpenApi = {
  schema: {
    operationId: 'signOut',
    tags: [authOpenApiTagName],
    summary: 'Sign out from the current session',
    description: 'Delegates session revocation and cookie clearing to Better Auth.',
    response: {
      200: {
        type: 'object',
        additionalProperties: false,
        required: ['success'],
        properties: { success: { type: 'boolean', example: true } },
      },
      401: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
