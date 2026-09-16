import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
  type RawServerDefault,
} from 'fastify'
import { type Env, env } from '@/config/env.js'
import { type AppDependencies, createAppDependencies } from '@/entrypoint/dependencies.js'
import { registerOpenApi } from '@/entrypoint/plugins/openapi.js'
import { registerRequestContext } from '@/entrypoint/plugins/request-context.js'
import { authRoutes } from '@/entrypoint/routes/auth/index.js'
import { classificacaoRoutes } from '@/entrypoint/routes/classificacao/index.js'
import { empresaRoutes } from '@/entrypoint/routes/empresa/index.js'
import { eventoRoutes } from '@/entrypoint/routes/evento/index.js'
import { operationalRoutes } from '@/entrypoint/routes/operational/index.js'
import { processoRoutes } from '@/entrypoint/routes/processo/index.js'
import { tenantRoutes } from '@/entrypoint/routes/tenant/index.js'
import { triagemRoutes } from '@/entrypoint/routes/triagem/index.js'
import { unidadeRoutes } from '@/entrypoint/routes/unidade/index.js'
import { uploadRoutes } from '@/entrypoint/routes/upload/index.js'
import { resolveRequestId } from '@/infra/http/request-id.js'
import { createLoggerOptions } from '@/infra/logging/logger.js'

type CreateAppOptions = FastifyServerOptions<RawServerDefault> & {
  appEnv?: Env['IDP_APP_ENV']
  dependencies?: AppDependencies
}

export function createApp(options: CreateAppOptions = {}): FastifyInstance {
  const {
    appEnv = env.IDP_APP_ENV,
    dependencies: providedDependencies,
    logger: providedLogger,
    ...fastifyOptions
  } = options
  const logger = providedLogger ?? createLoggerOptions(env.NODE_ENV !== 'test', appEnv)

  const app = Fastify({
    ...fastifyOptions,
    disableRequestLogging: true,
    genReqId: (request) => resolveRequestId(request.headers),
    logger,
    requestIdLogLabel: 'request_id',
  })
  const dependencies =
    providedDependencies ??
    createAppDependencies(env, { logEmailEvent: (event) => app.log.info(event) })

  const corsOrigins =
    env.CORS_ORIGINS.length > 0
      ? env.CORS_ORIGINS
      : ['http://localhost:5173', 'http://127.0.0.1:5173']
  // @fastify/cors defaults `methods` to GET,HEAD,POST — set it explicitly so
  // DELETE (empresa removal) and PUT/PATCH pass the browser's CORS preflight.
  app.register(cors, {
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
  app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } })

  registerRequestContext(app, { appEnv })
  registerOpenApi(app, { enabled: appEnv !== 'production' })

  app.setErrorHandler((error, _request, reply) => {
    return reply.status(getSafeErrorStatusCode(error)).send({ message: 'Erro' })
  })

  app.addHook('onClose', async () => {
    await dependencies.close()
  })

  app.register(operationalRoutes, dependencies)
  app.register(authRoutes, dependencies)
  app.register(tenantRoutes, dependencies)
  app.register(empresaRoutes, dependencies)
  app.register(unidadeRoutes, dependencies)
  app.register(classificacaoRoutes, dependencies)
  app.register(processoRoutes, dependencies)
  app.register(uploadRoutes, dependencies)
  app.register(triagemRoutes, dependencies)
  app.register(eventoRoutes, dependencies)

  return app
}

function getSafeErrorStatusCode(error: unknown): number {
  const statusCode =
    typeof error === 'object' && error !== null && 'statusCode' in error
      ? error.statusCode
      : undefined

  if (typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
    return statusCode
  }

  return 500
}
