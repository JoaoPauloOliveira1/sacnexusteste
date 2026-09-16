import { describe, expect, it, vi } from 'vitest'
import { tenantStatuses } from '@/database/schema.js'
import { type TenantDomainRepository } from '@/database/tenant-domain-repository.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'
import { getTenantStatus } from '@/usecases/tenant/get-tenant-status.js'

const context = { requestId: 'request-1' } as RequestContext

function createRepository(
  result: Awaited<ReturnType<TenantDomainRepository['findByNormalizedHost']>>,
) {
  return {
    findByNormalizedHost: vi.fn(async () => result),
  } satisfies TenantDomainRepository
}

describe('getTenantStatus', () => {
  it('returns available when domain and tenant are active', async () => {
    const tenantDomains = createRepository({
      domainStatus: tenantStatuses.active,
      organizationId: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b20',
      tenantId: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b21',
      tenantStatus: tenantStatuses.active,
    })

    await expect(
      getTenantStatus(context, { host: 'PE.SACNEXUS.COM.BR' }, { tenantDomains }),
    ).resolves.toEqual({ tenant_status: 'available' })
    expect(tenantDomains.findByNormalizedHost).toHaveBeenCalledWith('pe.sacnexus.com.br')
  })

  it('returns unavailable for unknown or malformed hosts without leaking details', async () => {
    const tenantDomains = createRepository(null)

    await expect(
      getTenantStatus(context, { host: 'unknown.example.test' }, { tenantDomains }),
    ).resolves.toEqual({ tenant_status: 'unavailable' })
    await expect(
      getTenantStatus(context, { host: 'https://tenant.example.test' }, { tenantDomains }),
    ).resolves.toEqual({ tenant_status: 'unavailable' })

    expect(tenantDomains.findByNormalizedHost).toHaveBeenCalledTimes(1)
  })

  it('returns unavailable for pending or disabled tenant/domain states', async () => {
    for (const result of [
      { domainStatus: tenantStatuses.pending, tenantStatus: tenantStatuses.active },
      { domainStatus: tenantStatuses.disabled, tenantStatus: tenantStatuses.active },
      { domainStatus: tenantStatuses.active, tenantStatus: tenantStatuses.pending },
      { domainStatus: tenantStatuses.active, tenantStatus: tenantStatuses.disabled },
    ]) {
      const tenantDomains = createRepository({
        ...result,
        organizationId: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b20',
        tenantId: '0197f7d6-9f4a-75b1-9f3d-f1d55d6e7b21',
      })

      await expect(
        getTenantStatus(context, { host: 'tenant.example.test' }, { tenantDomains }),
      ).resolves.toEqual({ tenant_status: 'unavailable' })
    }
  })
})
