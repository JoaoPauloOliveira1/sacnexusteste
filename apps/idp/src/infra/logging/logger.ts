import { type FastifyServerOptions, type RawServerDefault } from 'fastify'
import { type Env } from '@/config/env.js'
import { getSafeRequestPath } from '@/infra/logging/canonical-event.js'

const REDACTION_CENSOR = '[Redacted]'

export const loggerRedactPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-api-key"]',
  'res.headers["set-cookie"]',
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  '*.password',
  '*.currentPassword',
  '*.current_password',
  '*.newPassword',
  '*.new_password',
  '*.token',
  '*.secret',
  '*.otp',
  '*.backupCode',
  '*.backup_code',
  'backup_code',
  'req.body.password',
  'req.body.currentPassword',
  'req.body.current_password',
  'req.body.newPassword',
  'req.body.new_password',
  'req.body.token',
  'req.body.secret',
  'req.body.otp',
  'req.body.backupCode',
  'req.body.backup_code',
]

type LoggerOptions = NonNullable<FastifyServerOptions<RawServerDefault>['logger']>

export function createLoggerOptions(enabled: boolean, appEnv: Env['IDP_APP_ENV']): LoggerOptions {
  if (!enabled) {
    return false
  }

  const loggerOptions: LoggerOptions = {
    level: 'info',
    redact: {
      censor: REDACTION_CENSOR,
      paths: loggerRedactPaths,
    },
    serializers: {
      req: (request) => ({
        request_id: request.id,
        method: request.method,
        path: getSafeRequestPath({ url: request.url }),
      }),
      res: (reply) => ({
        status_code: reply.statusCode ?? 'unknown',
      }),
    },
  }

  if (appEnv !== 'local') {
    return loggerOptions
  }

  return {
    ...loggerOptions,
    transport: {
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        messageFormat: '{event}',
        singleLine: false,
        translateTime: 'HH:MM:ss.l',
      },
      target: 'pino-pretty',
    },
  }
}
