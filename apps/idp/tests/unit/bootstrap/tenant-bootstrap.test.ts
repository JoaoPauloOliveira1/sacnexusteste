import { describe, expect, it } from 'vitest'
import {
  bootstrapTenant,
  createTenantBootstrapFailure,
  createTenantBootstrapRequest,
  parseTenantBootstrapArgs,
  projectTenantBootstrapOutput,
  type TenantBootstrapDependencies,
  type TenantBootstrapRequest,
} from '@/bootstrap/tenant-bootstrap.js'
import { type IdentityEvent } from '@/events/identity-event.js'

const baseInput = {
  aliases: ['www.PE.SACNEXUS.COM.BR'],
  domain: 'PE.SACNEXUS.COM.BR',
  name: 'SAC Nexus PE',
  ownerEmail: 'owner@example.test',
  ownerName: 'Owner User',
  slug: 'sac-nexus-pe',
  temporaryPassword: 'safe-temporary-password',
}

describe('tenant bootstrap', () => {
  it('parses required flags and repeatable aliases without mutating state', () => {
    const result = parseTenantBootstrapArgs([
      '--',
      '--name',
      'SAC Nexus PE',
      '--slug=sac-nexus-pe',
      '--domain',
      'pe.sacnexus.com.br',
      '--alias',
      'www.pe.sacnexus.com.br',
      '--alias=login.pe.sacnexus.com.br',
      '--owner-email',
      'owner@example.test',
      '--owner-name',
      'Owner User',
      '--temporary-password',
      'safe-temporary-password',
    ])

    expect(result).toEqual({
      ok: true,
      value: {
        aliases: ['www.pe.sacnexus.com.br', 'login.pe.sacnexus.com.br'],
        domain: 'pe.sacnexus.com.br',
        name: 'SAC Nexus PE',
        ownerEmail: 'owner@example.test',
        ownerName: 'Owner User',
        slug: 'sac-nexus-pe',
        temporaryPassword: 'safe-temporary-password',
      },
    })
  })

  it('rejects missing required flags and invalid or duplicate domains before mutation', () => {
    expect(parseTenantBootstrapArgs(['--name', 'SAC Nexus PE'])).toEqual({
      failureCategory: 'validation_failed',
      ok: false,
    })

    expect(
      createTenantBootstrapRequest({ ...baseInput, domain: 'https://pe.sacnexus.com.br' }),
    ).toBeInstanceOf(Error)
    expect(
      createTenantBootstrapRequest({ ...baseInput, aliases: ['pe.sacnexus.com.br.'] }),
    ).toBeInstanceOf(Error)
  })

  it('completes a new tenant setup with safe operation outcomes and events', async () => {
    const events: IdentityEvent[] = []
    const result = await bootstrapTenant(getRequest(), createDependencies({ events }))

    expect(result).toEqual({
      domains: 'created',
      organization: 'created',
      ownerMembership: 'assigned',
      ownerUser: 'created',
      status: 'completed',
      tenant: 'created',
    })
    expect(events.map((event) => event.name)).toEqual([
      'identity.bootstrap.started',
      'identity.bootstrap.completed',
    ])
  })

  it('supports idempotent rerun with matching existing state', async () => {
    const result = await bootstrapTenant(
      getRequest(),
      createDependencies({
        organizationOutcome: 'reused',
        ownerMembershipOutcome: 'already_satisfied',
        ownerUserOutcome: 'reused',
        tenantDomainOutcome: 'reused',
        tenantOutcome: 'reused',
      }),
    )

    expect(result).toMatchObject({
      domains: 'reused',
      organization: 'reused',
      ownerMembership: 'already_satisfied',
      ownerUser: 'reused',
      status: 'completed',
      tenant: 'reused',
    })
  })

  it('fails safely when a normalized host belongs to another tenant', async () => {
    const result = await bootstrapTenant(
      getRequest(),
      createDependencies({
        tenantStoreFailure: createTenantBootstrapFailure('conflict_detected', 'domains'),
      }),
    )

    expect(result).toMatchObject({
      domains: 'failed',
      failureCategory: 'conflict_detected',
      ownerMembership: 'skipped',
      status: 'failed',
    })
  })

  it('reuses an existing owner user and already satisfied owner membership', async () => {
    const result = await bootstrapTenant(
      getRequest(),
      createDependencies({
        ownerMembershipOutcome: 'already_satisfied',
        ownerUserOutcome: 'reused',
      }),
    )

    expect(result).toMatchObject({
      ownerMembership: 'already_satisfied',
      ownerUser: 'reused',
      status: 'completed',
    })
  })

  it('does not produce success output when owner membership assignment fails', async () => {
    const result = await bootstrapTenant(
      getRequest(),
      createDependencies({
        ownerMembershipFailure: createTenantBootstrapFailure('operation_failed', 'ownerMembership'),
      }),
    )

    expect(result).toMatchObject({
      failureCategory: 'operation_failed',
      ownerMembership: 'failed',
      status: 'failed',
    })
    expect(projectTenantBootstrapOutput(result)).toContain('bootstrap: failed')
  })

  it('projects safe output without secrets, PII, internal IDs, hosts, SQL, tokens, or stack traces', async () => {
    const result = await bootstrapTenant(getRequest(), createDependencies())
    const output = projectTenantBootstrapOutput(result)

    expect(output).toBe(
      'bootstrap: completed\nowner_user: created\norganization: created\ntenant: created\ndomains: created\nowner_membership: assigned\n',
    )

    for (const forbidden of [
      'owner@example.test',
      'safe-temporary-password',
      'PE.SACNEXUS.COM.BR',
      'pe.sacnexus.com.br',
      'user-id-1',
      'organization-id-1',
      'tenant-id-1',
      'postgresql://user:password@example.test:5432/idp',
      'select * from idp_user',
      'session-token',
      'Error: stack',
    ]) {
      expect(output).not.toContain(forbidden)
    }
  })
})

function getRequest(): TenantBootstrapRequest {
  const request = createTenantBootstrapRequest(baseInput)

  if (request instanceof Error) {
    throw request
  }

  return request
}

function createDependencies(
  options: {
    events?: IdentityEvent[]
    organizationOutcome?: 'created' | 'reused'
    ownerMembershipFailure?: Error
    ownerMembershipOutcome?: 'already_satisfied' | 'assigned'
    ownerUserOutcome?: 'created' | 'reused'
    tenantDomainOutcome?: 'created' | 'reused'
    tenantOutcome?: 'created' | 'reused'
    tenantStoreFailure?: Error
  } = {},
): TenantBootstrapDependencies {
  return {
    clock: () => new Date('2026-06-03T00:00:00.000Z'),
    events: {
      async publish(event) {
        options.events?.push(event)
      },
    },
    identity: {
      async ensureOrganization() {
        return { id: 'organization-id-1', outcome: options.organizationOutcome ?? 'created' }
      },
      async ensureOwnerMembership() {
        if (options.ownerMembershipFailure) {
          throw options.ownerMembershipFailure
        }

        return { outcome: options.ownerMembershipOutcome ?? 'assigned' }
      },
      async ensureOwnerUser() {
        return { id: 'user-id-1', outcome: options.ownerUserOutcome ?? 'created' }
      },
    },
    tenantStore: {
      async ensureTenantSetup() {
        if (options.tenantStoreFailure) {
          throw options.tenantStoreFailure
        }

        return {
          domains: options.tenantDomainOutcome ?? 'created',
          tenant: { id: 'tenant-id-1', outcome: options.tenantOutcome ?? 'created' },
        }
      },
    },
  }
}
