import { eq } from 'drizzle-orm'
import { type Database } from '@/database/client.js'
import {
  type TenantDomainStatus,
  type TenantStatus,
  tenant,
  tenantDomain,
} from '@/database/schema.js'

export type TenantDomainLookupResult = {
  domainStatus: TenantDomainStatus
  organizationId: string
  tenantId: string
  tenantStatus: TenantStatus
}

export type TenantDomainRepository = {
  findByNormalizedHost: (normalizedHost: string) => Promise<TenantDomainLookupResult | null>
}

export function createDrizzleTenantDomainRepository(db: Database): TenantDomainRepository {
  return {
    findByNormalizedHost: async (normalizedHost) => {
      const [result] = await db
        .select({
          domainStatus: tenantDomain.status,
          organizationId: tenant.organizationId,
          tenantId: tenant.id,
          tenantStatus: tenant.status,
        })
        .from(tenantDomain)
        .innerJoin(tenant, eq(tenantDomain.tenantId, tenant.id))
        .where(eq(tenantDomain.normalizedHost, normalizedHost))
        .limit(1)

      return result ?? null
    },
  }
}
