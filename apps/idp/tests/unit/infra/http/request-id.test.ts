import { describe, expect, it } from 'vitest'

import { resolveRequestId } from '@/infra/http/request-id.js'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('resolveRequestId', () => {
  it('uses x-request-id when present', () => {
    expect(resolveRequestId({ 'x-request-id': ' upstream-request-1 ' })).toBe('upstream-request-1')
  })

  it('uses x-correlation-id as a fallback', () => {
    expect(resolveRequestId({ 'x-correlation-id': 'correlation-1' })).toBe('correlation-1')
  })

  it('prefers x-request-id over x-correlation-id', () => {
    expect(
      resolveRequestId({ 'x-correlation-id': 'correlation-1', 'x-request-id': 'request-1' }),
    ).toBe('request-1')
  })

  it('generates a safe request ID when inbound values are missing or unsafe', () => {
    expect(
      resolveRequestId({ 'x-request-id': 'not safe', 'x-correlation-id': 'also not safe' }),
    ).toMatch(UUID_PATTERN)
  })
})
