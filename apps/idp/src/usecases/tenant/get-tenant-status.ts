import { tenantStatuses } from '@/database/schema.js'
import { type TenantDomainRepository } from '@/database/tenant-domain-repository.js'
import { type RequestContext } from '@/infra/request-context/request-context.js'
import { normalizeTenantHost } from '@/usecases/tenant/host-normalizer.js'
import { selectTenantHostSource, type TenantHostHeaders } from '@/usecases/tenant/host-source.js'

export type TenantStatusResponse = {
  tenant_status: 'available' | 'unavailable'
}

type GetTenantStatusDependencies = Readonly<{
  tenantDomains: TenantDomainRepository
}>

const unavailableTenantStatus: TenantStatusResponse = { tenant_status: 'unavailable' }

export async function getTenantStatus(
  context: RequestContext,
  headers: TenantHostHeaders,
  dependencies: GetTenantStatusDependencies,
): Promise<TenantStatusResponse> {
  void context

  const host = selectTenantHostSource(headers)

  if (!host) {
    return unavailableTenantStatus
  }

  const normalizedHost = normalizeTenantHost(host)

  if (!normalizedHost) {
    return unavailableTenantStatus
  }

  const tenantDomain = await dependencies.tenantDomains.findByNormalizedHost(normalizedHost)

  if (
    tenantDomain?.domainStatus === tenantStatuses.active &&
    tenantDomain.tenantStatus === tenantStatuses.active &&
    tenantDomain.organizationId
  ) {
    return { tenant_status: 'available' }
  }

  return unavailableTenantStatus
}
