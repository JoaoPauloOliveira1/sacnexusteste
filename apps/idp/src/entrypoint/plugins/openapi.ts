import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { type FastifyInstance } from 'fastify'
import { openApiTags } from '@/entrypoint/routes/openapi-tags.js'

type OpenApiOptions = {
  enabled: boolean
}

export function registerOpenApi(app: FastifyInstance, options: OpenApiOptions): void {
  if (!options.enabled) {
    return
  }

  app.register(swagger, {
    openapi: {
      info: {
        description:
          'Custom operational and identity-facing API surface for the SAC Nexus Identity Provider. Better Auth-native flows may be exposed separately and should not be reimplemented here.',
        title: 'SAC Nexus IDP API',
        version: '0.0.0',
      },
      externalDocs: {
        description: 'SAC Nexus IDP architecture documentation.',
        url: 'https://github.com/corvi-io/sac-nexus/tree/staging/docs/idp',
      },
      tags: [...openApiTags],
    },
    refResolver: {
      buildLocalReference: (json, _baseUri, _fragment, index) => {
        if (typeof json.$id === 'string') {
          return json.$id
        }

        return `schema_${index}`
      },
    },
  })

  app.register(swaggerUi, {
    routePrefix: '/docs',
    staticCSP: true,
  })

  app.get(
    '/openapi.json',
    {
      schema: {
        hide: true,
      },
    },
    async () => app.swagger(),
  )
}
