import { openApiExamples } from '@/entrypoint/openapi/examples.js'
import { idpServiceProperty, timestampProperty } from '@/entrypoint/openapi/properties.js'
import { operationalOpenApiTagName } from '@/entrypoint/routes/operational/openapi.js'

export const healthResponseSchema = {
  $id: 'HealthResponse',
  title: 'Health response',
  description: 'Minimal non-sensitive liveness payload for the IDP service.',
  type: 'object',
  additionalProperties: false,
  required: ['status', 'service', 'timestamp'],
  properties: {
    status: {
      type: 'string',
      const: 'ok',
      description: 'Liveness status. `ok` means the process can answer HTTP requests.',
      example: 'ok',
    },
    service: idpServiceProperty,
    timestamp: timestampProperty,
  },
  example: {
    status: 'ok',
    service: openApiExamples.idpService,
    timestamp: openApiExamples.timestamp,
  },
} as const

export const healthOpenApi = {
  schema: {
    summary: 'Check IDP liveness',
    description:
      'Returns a minimal liveness response when the IDP process can answer HTTP requests. The payload intentionally avoids host, version, commit, memory, uptime, IP, environment, and dependency details.',
    operationId: 'getHealth',
    tags: [operationalOpenApiTagName],
    response: {
      200: { $ref: 'HealthResponse#' },
    },
  },
} as const
