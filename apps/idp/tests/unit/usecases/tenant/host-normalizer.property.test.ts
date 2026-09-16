import fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { normalizeTenantHost } from '@/usecases/tenant/host-normalizer.js'
import {
  invalidTenantHostArbitrary,
  validTenantHostArbitrary,
  validTenantHostVariantArbitrary,
} from '../../test-support/tenant-host-generators.js'

describe('normalizeTenantHost properties', () => {
  it('is idempotent for valid normalized hosts', () => {
    fc.assert(
      fc.property(validTenantHostArbitrary, (host) => {
        const normalized = normalizeTenantHost(host)

        expect(normalized).toBe(host)
        expect(normalized ? normalizeTenantHost(normalized) : null).toBe(normalized)
      }),
    )
  })

  it('normalizes supported variants to the same lookup key', () => {
    fc.assert(
      fc.property(validTenantHostVariantArbitrary, ({ host, variant }) => {
        expect(normalizeTenantHost(variant)).toBe(host)
      }),
    )
  })

  it('rejects invalid host shapes', () => {
    fc.assert(
      fc.property(invalidTenantHostArbitrary, (host) => {
        expect(normalizeTenantHost(host)).toBeNull()
      }),
    )
  })
})
