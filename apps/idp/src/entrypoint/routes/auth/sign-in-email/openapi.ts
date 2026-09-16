import { authOpenApiTagName } from '@/entrypoint/routes/auth/openapi.js'

export const signInEmailOpenApi = {
  schema: {
    operationId: 'signInWithEmail',
    tags: [authOpenApiTagName],
    summary: 'Sign in with email and password',
    description:
      'Authenticates through Better Auth and sets session cookies while returning a sanitized response without session tokens.',
    body: {
      type: 'object',
      additionalProperties: false,
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 1 },
      },
    },
    response: {
      200: {
        type: 'object',
        additionalProperties: false,
        required: ['redirect', 'user'],
        properties: {
          redirect: { type: 'boolean', example: false },
          url: { type: 'string', nullable: true, example: null },
          user: { $ref: 'AuthUserResponse#' },
        },
      },
      400: { $ref: 'AuthErrorResponse#' },
      401: { $ref: 'AuthErrorResponse#' },
    },
  },
} as const
