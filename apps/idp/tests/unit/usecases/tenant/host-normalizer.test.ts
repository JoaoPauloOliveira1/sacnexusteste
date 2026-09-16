import { describe, expect, it } from 'vitest'
import { normalizeTenantHost } from '@/usecases/tenant/host-normalizer.js'

describe('normalizeTenantHost', () => {
  it('normalizes supported case, trailing-dot, and port variants', () => {
    expect(normalizeTenantHost('PE.SACNEXUS.COM.BR')).toBe('pe.sacnexus.com.br')
    expect(normalizeTenantHost('pe.sacnexus.com.br.')).toBe('pe.sacnexus.com.br')
    expect(normalizeTenantHost('pe.sacnexus.com.br:443')).toBe('pe.sacnexus.com.br')
    expect(normalizeTenantHost('  pe.sacnexus.com.br  ')).toBe('pe.sacnexus.com.br')
  })

  it('rejects malformed hosts and URL-shaped values', () => {
    for (const host of [
      '',
      'localhost',
      '127.0.0.1',
      '*.example.test',
      'https://example.test',
      'example.test/path',
      'example.test?token=secret',
      'example.test#fragment',
      'user@example.test',
      'example.test:0',
      'example.test:65536',
      'example.test:not-a-port',
      'example..test',
      '-example.test',
      'example-.test',
      'example_test.com',
    ]) {
      expect(normalizeTenantHost(host)).toBeNull()
    }
  })
})
