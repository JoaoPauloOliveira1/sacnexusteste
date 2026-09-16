import { getTableName } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import {
  account,
  authSchema,
  invitation,
  member,
  organization,
  session,
  tenant,
  tenantDomain,
  tenantDomainStatuses,
  tenantDomainTypes,
  tenantStatuses,
  user,
  verification,
} from '@/database/schema.js'

describe('IDP database schema', () => {
  it('uses explicit idp-prefixed Better Auth table names', () => {
    expect(getTableName(user)).toBe('idp_user')
    expect(getTableName(session)).toBe('idp_session')
    expect(getTableName(account)).toBe('idp_account')
    expect(getTableName(verification)).toBe('idp_verification')
    expect(getTableName(organization)).toBe('idp_organization')
    expect(getTableName(member)).toBe('idp_member')
    expect(getTableName(invitation)).toBe('idp_invitation')
    expect(getTableName(tenant)).toBe('idp_tenant')
    expect(getTableName(tenantDomain)).toBe('idp_tenant_domain')
  })

  it('maps Better Auth model names to prefixed Drizzle tables', () => {
    expect(authSchema).toMatchObject({
      account,
      invitation,
      member,
      organization,
      session,
      user,
      verification,
    })
  })

  it('keeps Unit 3 tenant/domain schema outside Better Auth adapter mapping', () => {
    expect(authSchema).not.toHaveProperty('tenant')
    expect(authSchema).not.toHaveProperty('tenantDomain')
    expect(authSchema).not.toHaveProperty('domain')
    expect(authSchema).not.toHaveProperty('alias')
  })

  it('defines approved tenant/domain statuses and domain types', () => {
    expect(tenantStatuses).toEqual({ active: 'active', disabled: 'disabled', pending: 'pending' })
    expect(tenantDomainStatuses).toBe(tenantStatuses)
    expect(tenantDomainTypes).toEqual({ alias: 'alias', primary: 'primary' })
  })
})
