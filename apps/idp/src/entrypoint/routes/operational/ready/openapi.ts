import { openApiExamples } from '@/entrypoint/openapi/examples.js'
import { idpServiceProperty, timestampProperty } from '@/entrypoint/openapi/properties.js'
import { operationalOpenApiTagName } from '@/entrypoint/routes/operational/openapi.js'

export const readinessResponseSchema = {
  $id: 'ReadinessResponse',
  title: 'Readiness response',
  description: 'Minimal non-sensitive readiness payload for the IDP service.',
  type: 'object',
  additionalProperties: false,
  required: ['status', 'service', 'timestamp', 'checks'],
  properties: {
    status: {
      type: 'string',
      enum: ['ready', 'unready'],
      description:
        'Readiness status. `ready` means the service can receive traffic; `unready` means at least one required dependency is unavailable.',
      example: 'ready',
    },
    service: idpServiceProperty,
    timestamp: timestampProperty,
    checks: {
      type: 'array',
      description:
        'Dependency readiness checks. Values are intentionally coarse and never expose connection strings, hosts, database names, usernames, pool internals, query text, or raw errors.',
      example: [{ name: 'database', status: 'ready' }],
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'status'],
        properties: {
          name: {
            type: 'string',
            enum: ['database'],
            description: 'Safe dependency identifier.',
            example: 'database',
          },
          status: {
            type: 'string',
            enum: ['ready', 'unready'],
            description: 'Coarse dependency readiness status.',
            example: 'ready',
          },
        },
      },
    },
  },
  example: {
    status: 'ready',
    service: openApiExamples.idpService,
    timestamp: openApiExamples.timestamp,
    checks: [{ name: 'database', status: 'ready' }],
  },
} as const

export const readinessOpenApi = {
  schema: {
    summary: 'Check IDP readiness',
    description:
      'Returns a minimal readiness response with a safe PostgreSQL dependency check. The response never exposes connection strings, hosts, database names, usernames, pool internals, query text, or raw errors.',
    operationId: 'getReadiness',
    tags: [operationalOpenApiTagName],
    response: {
      200: { $ref: 'ReadinessResponse#' },
      503: { $ref: 'ReadinessResponse#' },
    },
  },
} as const
