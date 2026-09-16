import { and, eq } from 'drizzle-orm'
import {
  createTenantBootstrapFailure,
  type TenantBootstrapEntityResult,
  type TenantBootstrapIdentity,
  type TenantBootstrapMembershipResult,
} from '@/bootstrap/tenant-bootstrap.js'
import { type Database } from '@/database/client.js'
import { member, organization, user } from '@/database/schema.js'
import { getPasswordPolicyViolation } from '@/identity/password-policy.js'

type BetterAuthApiMethod = (input: unknown) => Promise<unknown>

export type TenantBootstrapBetterAuthApi = {
  addMember: BetterAuthApiMethod
  createOrganization: BetterAuthApiMethod
  signUpEmail: BetterAuthApiMethod
  updateMemberRole: BetterAuthApiMethod
}

export function createBetterAuthTenantBootstrapIdentity(
  authApi: unknown,
  db: Database,
): TenantBootstrapIdentity {
  const api = authApi as TenantBootstrapBetterAuthApi

  return {
    ensureOrganization: async ({ name, ownerUserId, slug }) => {
      const existing = await findOrganizationBySlug(db, slug)

      if (existing) {
        if (existing.name !== name) {
          throw createTenantBootstrapFailure('conflict_detected', 'organization')
        }

        return { id: existing.id, outcome: 'reused' }
      }

      await api.createOrganization({
        body: {
          keepCurrentActiveOrganization: true,
          name,
          slug,
          userId: ownerUserId,
        },
      })

      const created = await findOrganizationBySlug(db, slug)

      if (!created) {
        throw createTenantBootstrapFailure('operation_failed', 'organization')
      }

      return { id: created.id, outcome: 'created' }
    },
    ensureOwnerMembership: async ({ organizationId, ownerUserId }) => {
      const existing = await findMemberByOrganizationAndUser(db, organizationId, ownerUserId)

      if (existing?.role === 'owner') {
        return { outcome: 'already_satisfied' }
      }

      if (existing) {
        await api.updateMemberRole({
          body: {
            memberId: existing.id,
            organizationId,
            role: 'owner',
          },
        })

        return assertOwnerMembership(db, organizationId, ownerUserId)
      }

      await api.addMember({
        body: {
          organizationId,
          role: 'owner',
          userId: ownerUserId,
        },
      })

      return assertOwnerMembership(db, organizationId, ownerUserId)
    },
    ensureOwnerUser: async ({ email, name, temporaryPassword }) => {
      const existing = await findUserByEmail(db, email)

      if (existing) {
        return { id: existing.id, outcome: 'reused' }
      }

      if (getPasswordPolicyViolation(temporaryPassword)) {
        throw createTenantBootstrapFailure('validation_failed', 'ownerUser')
      }

      await api.signUpEmail({
        body: {
          email,
          name,
          password: temporaryPassword,
        },
      })

      const created = await findUserByEmail(db, email)

      if (!created) {
        throw createTenantBootstrapFailure('operation_failed', 'ownerUser')
      }

      return { id: created.id, outcome: 'created' }
    },
  }
}

async function assertOwnerMembership(
  db: Database,
  organizationId: string,
  userId: string,
): Promise<TenantBootstrapMembershipResult> {
  const updated = await findMemberByOrganizationAndUser(db, organizationId, userId)

  if (updated?.role !== 'owner') {
    throw createTenantBootstrapFailure('operation_failed', 'ownerMembership')
  }

  return { outcome: 'assigned' }
}

async function findUserByEmail(
  db: Database,
  email: string,
): Promise<TenantBootstrapEntityResult | null> {
  const [result] = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1)

  return result ? { id: result.id, outcome: 'reused' } : null
}

async function findOrganizationBySlug(
  db: Database,
  slug: string,
): Promise<{ id: string; name: string } | null> {
  const [result] = await db
    .select({ id: organization.id, name: organization.name })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1)

  return result ?? null
}

async function findMemberByOrganizationAndUser(
  db: Database,
  organizationId: string,
  userId: string,
): Promise<{ id: string; role: string } | null> {
  const [result] = await db
    .select({ id: member.id, role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)

  return result ?? null
}
