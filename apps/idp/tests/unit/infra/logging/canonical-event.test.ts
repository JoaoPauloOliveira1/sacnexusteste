import { describe, expect, it } from 'vitest'

import { CanonicalEventBuilder, getSafeRequestPath } from '@/infra/logging/canonical-event.js'

describe('CanonicalEventBuilder', () => {
  it('initializes a safe canonical HTTP event', () => {
    const event = new CanonicalEventBuilder({
      appEnv: 'local',
      method: 'GET',
      path: '/health?email=user@example.test',
      requestId: 'req-1',
    }).toJSON()

    expect(event).toEqual({
      app_env: 'local',
      event: 'http.request.completed',
      method: 'GET',
      path: '/health',
      request_id: 'req-1',
      service: 'idp',
    })
  })

  it('records HTTP result enrichment', () => {
    const builder = new CanonicalEventBuilder({
      appEnv: 'staging',
      method: 'GET',
      path: '/ready',
      requestId: 'req-2',
    })

    builder.setHttpResult({ durationMs: 12.6, statusCode: 200 })

    expect(builder.toJSON()).toMatchObject({
      duration_ms: 13,
      outcome: 'success',
      status_code: 200,
    })
  })

  it('records safe auth operation enrichment', () => {
    const builder = new CanonicalEventBuilder({
      appEnv: 'local',
      method: 'POST',
      path: '/api/auth/sign-in/email',
      requestId: 'req-4',
    })

    builder.setAuthOperation('sign_in_email')

    expect(builder.toJSON()).toMatchObject({ auth_operation: 'sign_in_email' })
  })

  it('sanitizes recorded errors', () => {
    const builder = new CanonicalEventBuilder({
      appEnv: 'local',
      method: 'GET',
      path: '/health',
      requestId: 'req-3',
    })

    builder.recordError(new TypeError('do not log this sensitive value'))

    expect(builder.toJSON().error).toEqual({ category: 'application', name: 'TypeError' })
  })

  it('records safe database error classification without query details', () => {
    const builder = new CanonicalEventBuilder({
      appEnv: 'local',
      method: 'POST',
      path: '/api/auth/sign-in/email',
      requestId: 'req-5',
    })
    const error = new Error(
      'Failed query: select "email" from "idp_user" where email = $1 params: user@example.test',
      { cause: { code: '42P01' } },
    )

    builder.recordError(error)

    const event = builder.toJSON()

    expect(event.error).toEqual({
      category: 'database',
      code: '42P01',
      db_error_kind: 'relation_missing',
      name: 'Error',
    })
    expect(JSON.stringify(event)).not.toContain('Failed query')
    expect(JSON.stringify(event)).not.toContain('idp_user')
    expect(JSON.stringify(event)).not.toContain('user@example.test')
  })
})

describe('getSafeRequestPath', () => {
  it('prefers route templates over raw URLs', () => {
    expect(
      getSafeRequestPath({
        routePath: '/users/:user_id/security',
        url: '/users/123/security?token=abc',
      }),
    ).toBe('/users/:user_id/security')
  })

  it('sanitizes unmatched paths without keeping query strings or segment values', () => {
    expect(getSafeRequestPath({ url: '/reset/sensitive-backup-code?token=abc' })).toBe(
      '/:path/:path',
    )
  })
})
