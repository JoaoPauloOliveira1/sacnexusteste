export const tenantOpenApiTagName = 'tenant'

export const tenantOpenApiTag = {
  name: tenantOpenApiTagName,
  description:
    'Safe tenant availability endpoints that avoid exposing tenant identifiers, domains, aliases, or internal resolution reasons.',
} as const
