import { type FastifyBaseLogger } from 'fastify'
import { type Env } from '@/config/env.js'
import { CanonicalEventBuilder } from '@/infra/logging/canonical-event.js'

export type RequestContext = {
  requestId: string
  logger: FastifyBaseLogger
  canonicalEvent: CanonicalEventBuilder
}

type RequestContextInit = {
  appEnv: Env['IDP_APP_ENV']
  logger: FastifyBaseLogger
  method: string
  path: string
  requestId: string
}

export function createRequestContext(init: RequestContextInit): RequestContext {
  return {
    canonicalEvent: new CanonicalEventBuilder({
      appEnv: init.appEnv,
      method: init.method,
      path: init.path,
      requestId: init.requestId,
    }),
    logger: init.logger,
    requestId: init.requestId,
  }
}
