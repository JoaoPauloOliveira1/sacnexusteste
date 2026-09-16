import { openApiExamples } from '@/entrypoint/openapi/examples.js'

export const idpServiceProperty = {
  type: 'string',
  const: openApiExamples.idpService,
  description: 'Stable service identifier.',
  example: openApiExamples.idpService,
} as const

export const timestampProperty = {
  type: 'string',
  format: 'date-time',
  description: 'Server-side timestamp generated when the response is created.',
  example: openApiExamples.timestamp,
} as const
