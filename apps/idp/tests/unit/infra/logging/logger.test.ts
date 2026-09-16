import { describe, expect, it } from 'vitest'

import { createLoggerOptions, loggerRedactPaths } from '@/infra/logging/logger.js'

describe('logger configuration', () => {
  it('can disable Fastify logging for tests', () => {
    expect(createLoggerOptions(false, 'local')).toBe(false)
  })

  it('redacts sensitive headers and auth fields', () => {
    expect(loggerRedactPaths).toEqual(
      expect.arrayContaining([
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-api-key"]',
        'res.headers["set-cookie"]',
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
        'req.body.current_password',
        'req.body.new_password',
        'req.body.backup_code',
      ]),
    )
  })

  it('configures structured JSON logging when enabled', () => {
    const options = createLoggerOptions(true, 'staging')

    expect(typeof options).toBe('object')

    if (typeof options !== 'object') {
      throw new TypeError('Expected logger options object')
    }

    expect(options).toMatchObject({
      level: 'info',
      redact: {
        censor: '[Redacted]',
        paths: loggerRedactPaths,
      },
    })
    expect(options).not.toHaveProperty('transport')
  })

  it('uses pino-pretty only in local app environment', () => {
    const options = createLoggerOptions(true, 'local')

    expect(typeof options).toBe('object')

    if (typeof options !== 'object') {
      throw new TypeError('Expected logger options object')
    }

    expect(options).toMatchObject({
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
    })
  })
})
