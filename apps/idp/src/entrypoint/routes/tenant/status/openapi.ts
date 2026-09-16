import { tenantOpenApiTagName } from '@/entrypoint/routes/tenant/openapi.js'

export const tenantStatusResponseSchema = {
  $id: 'TenantStatusResponse',
  title: 'Tenant status response',
  description:
    'Safe tenant availability response. It intentionally avoids tenant IDs, organization IDs, domains, aliases, raw hosts, and internal reason codes.',
  type: 'object',
  additionalProperties: false,
  required: ['tenant_status'],
  properties: {
    tenant_status: {
      type: 'string',
      enum: ['available', 'unavailable'],
      description:
        '`available` means the selected host maps to an active tenant and active domain. `unavailable` covers all other normal resolution outcomes.',
      example: 'available',
    },
  },
  example: {
    tenant_status: 'available',
  },
} as const

export const tenantStatusOpenApi = {
  schema: {
    summary: 'Check tenant availability for the request host',
    description:
      'Returns a generic tenant availability status based on the trusted original request host. The response never exposes tenant IDs, organization IDs, domains, aliases, raw hosts, request headers, SQL details, or internal reason codes.',
    operationId: 'getTenantStatus',
    tags: [tenantOpenApiTagName],
    response: {
      200: { $ref: 'TenantStatusResponse#' },
    },
  },
} as const
