import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const authOkOpenApi = {
  schema: {
    operationId: 'getAuthOk',
    tags: [authOpenApiTagName],
    summary: 'Check Better Auth handler availability',
    description: 'Delegates to Better Auth ok/status behavior without exposing sensitive details.',
    response: {
      200: {
        type: 'object',
        additionalProperties: false,
        required: ['ok'],
        properties: { ok: { type: 'boolean', example: true } },
      },
    },
  },
} as const
