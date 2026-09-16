import { describe, expect, it } from 'vitest'
import { selectTenantHostSource } from '@/usecases/tenant/host-source.js'

describe('selectTenantHostSource', () => {
  it('prefers x-forwarded-host over host', () => {
    expect(
      selectTenantHostSource({
        host: 'idp.example.test',
        'x-forwarded-host': 'tenant.example.test',
      }),
    ).toBe('tenant.example.test')
  })

  it('falls back to host when x-forwarded-host is absent', () => {
    expect(selectTenantHostSource({ host: 'tenant.example.test' })).toBe('tenant.example.test')
  })

  it('treats ambiguous selected forwarded hosts as unavailable instead of falling back', () => {
    expect(
      selectTenantHostSource({ host: 'tenant.example.test', 'x-forwarded-host': 'a.test,b.test' }),
    ).toBeNull()
  })

  it('treats missing and empty host sources as unavailable', () => {
    expect(selectTenantHostSource({})).toBeNull()
    expect(selectTenantHostSource({ host: '   ' })).toBeNull()
    expect(selectTenantHostSource({ 'x-forwarded-host': [] })).toBeNull()
  })
})
