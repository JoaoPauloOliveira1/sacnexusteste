import { eq } from 'drizzle-orm'
import { v7 as uuidv7 } from 'uuid'
import {
  createTenantBootstrapFailure,
  type TenantBootstrapDomainOutcome,
  type TenantBootstrapEntityResult,
  type TenantBootstrapTenantSetupResult,
  type TenantBootstrapTenantStore,
} from '@/bootstrap/tenant-bootstrap.js'
import { type Database } from '@/database/client.js'
import {
  tenant,
  tenantDomain,
  tenantDomainStatuses,
  tenantDomainTypes,
  tenantStatuses,
} from '@/database/schema.js'

export function createDrizzleTenantBootstrapStore(db: Database): TenantBootstrapTenantStore {
  return {
    ensureTenantSetup: async ({ aliases, organizationId, primaryDomain }) =>
      db.transaction(async (tx) => {
        const ensuredTenant = await ensureTenant(tx as Database, organizationId)
        const domainOutcomes: TenantBootstrapDomainOutcome[] = []

        domainOutcomes.push(
          await ensureDomain(tx as Database, {
            domainType: tenantDomainTypes.primary,
            normalizedHost: primaryDomain,
            tenantId: ensuredTenant.id,
          }),
        )

        for (const alias of aliases) {
          domainOutcomes.push(
            await ensureDomain(tx as Database, {
              domainType: tenantDomainTypes.alias,
              normalizedHost: alias,
              tenantId: ensuredTenant.id,
            }),
          )
        }

        return {
          domains: domainOutcomes.includes('created') ? 'created' : 'reused',
          tenant: ensuredTenant,
        } satisfies TenantBootstrapTenantSetupResult
      }),
  }
}

async function ensureTenant(
  db: Database,
  organizationId: string,
): Promise<TenantBootstrapEntityResult> {
  const [existing] = await db
    .select({ id: tenant.id, status: tenant.status })
    .from(tenant)
    .where(eq(tenant.organizationId, organizationId))
    .limit(1)

  if (existing) {
    if (existing.status !== tenantStatuses.active) {
      throw createTenantBootstrapFailure('conflict_detected', 'tenant')
    }

    return { id: existing.id, outcome: 'reused' }
  }

  const [created] = await db
    .insert(tenant)
    .values({ id: uuidv7(), organizationId, status: tenantStatuses.active })
    .returning({ id: tenant.id })

  if (!created) {
    throw createTenantBootstrapFailure('operation_failed', 'tenant')
  }

  return { id: created.id, outcome: 'created' }
}

async function ensureDomain(
  db: Database,
  input: { domainType: 'alias' | 'primary'; normalizedHost: string; tenantId: string },
): Promise<TenantBootstrapDomainOutcome> {
  const [existing] = await db
    .select({
      domainType: tenantDomain.domainType,
      status: tenantDomain.status,
      tenantId: tenantDomain.tenantId,
    })
    .from(tenantDomain)
    .where(eq(tenantDomain.normalizedHost, input.normalizedHost))
    .limit(1)

  if (existing) {
    if (
      existing.tenantId !== input.tenantId ||
      existing.domainType !== input.domainType ||
      existing.status !== tenantDomainStatuses.active
    ) {
      throw createTenantBootstrapFailure('conflict_detected', 'domains')
    }

    return 'reused'
  }

  const [created] = await db
    .insert(tenantDomain)
    .values({
      domainType: input.domainType,
      id: uuidv7(),
      normalizedHost: input.normalizedHost,
      status: tenantDomainStatuses.active,
      tenantId: input.tenantId,
    })
    .returning({ id: tenantDomain.id })

  if (!created) {
    throw createTenantBootstrapFailure('operation_failed', 'domains')
  }

  return 'created'
}
