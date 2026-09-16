import { type FastifyInstance } from 'fastify'
import { type Env } from '@/config/env.js'
import { getSafeRequestPath } from '@/infra/logging/canonical-event.js'
import {
  createRequestContext,
  type RequestContext,
} from '@/infra/request-context/request-context.js'

declare module 'fastify' {
  interface FastifyRequest {
    requestContext: RequestContext
  }
}

type RequestContextOptions = {
  appEnv: Env['IDP_APP_ENV']
}

export function registerRequestContext(app: FastifyInstance, options: RequestContextOptions): void {
  app.decorateRequest('requestContext', null as unknown as RequestContext)

  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id)

    request.requestContext = createRequestContext({
      appEnv: options.appEnv,
      logger: request.log,
      method: request.method,
      path: getSafeRequestPath({ url: request.url }),
      requestId: request.id,
    })
  })

  app.addHook('onError', async (request, _reply, error) => {
    request.requestContext.canonicalEvent.recordError(error)
  })

  app.addHook('onResponse', async (request, reply) => {
    request.requestContext.canonicalEvent.setPath(
      getSafeRequestPath({ routePath: request.routeOptions.url, url: request.url }),
    )

    request.requestContext.canonicalEvent.setHttpResult({
      durationMs: reply.elapsedTime,
      statusCode: reply.statusCode,
    })

    request.log.info(request.requestContext.canonicalEvent.toJSON())
  })
}
