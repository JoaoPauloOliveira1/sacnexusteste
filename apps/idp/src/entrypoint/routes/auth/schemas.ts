export const sanitizedUserSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'email', 'email_verified', 'name'],
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'SAC Nexus UUID v7 IDP user identifier.',
      example: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b20',
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Global IDP account email address.',
      example: 'user@example.test',
    },
    email_verified: {
      type: 'boolean',
      description: 'Whether the IDP account email has been verified.',
      example: false,
    },
    name: {
      type: 'string',
      description: 'Display name stored by the IDP account.',
      example: 'Synthetic User',
    },
    image: {
      type: 'string',
      nullable: true,
      description: 'Optional account image URL when present.',
      example: null,
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      description: 'Account creation timestamp.',
      example: '2026-05-12T00:00:00.000Z',
    },
    updated_at: {
      type: 'string',
      format: 'date-time',
      description: 'Account update timestamp.',
      example: '2026-05-12T00:00:00.000Z',
    },
  },
} as const

export const sanitizedSessionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    expires_at: {
      type: 'string',
      format: 'date-time',
      description: 'Session expiration timestamp.',
      example: '2026-06-11T00:00:00.000Z',
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      description: 'Session creation timestamp.',
      example: '2026-05-12T00:00:00.000Z',
    },
    updated_at: {
      type: 'string',
      format: 'date-time',
      description: 'Session update timestamp.',
      example: '2026-05-12T00:00:00.000Z',
    },
  },
} as const

export const authUserResponseSchema = {
  $id: 'AuthUserResponse',
  title: 'Auth user response',
  description: 'Sanitized IDP user payload returned by auth wrapper routes.',
  ...sanitizedUserSchema,
} as const

export const authSessionResponseSchema = {
  $id: 'AuthSessionResponse',
  title: 'Auth session response',
  description: 'Sanitized session payload that never exposes session tokens or session IDs.',
  ...sanitizedSessionSchema,
} as const

export const authErrorResponseSchema = {
  $id: 'AuthErrorResponse',
  title: 'Auth error response',
  description: 'Safe error payload for auth wrapper routes.',
  type: 'object',
  additionalProperties: true,
  properties: {
    message: {
      type: 'string',
      description: 'Safe public error message.',
      example: 'Invalid email or password.',
    },
  },
} as const
