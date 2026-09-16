import { describe, expect, it, vi } from 'vitest'
import { createBetterAuthTenantBootstrapIdentity } from '@/bootstrap/tenant-bootstrap-identity.js'
import { type Database } from '@/database/client.js'

describe('Better Auth tenant bootstrap identity', () => {
  it('rejects weak temporary owner passwords before calling signUpEmail', async () => {
    const signUpEmail = vi.fn()
    const identity = createBetterAuthTenantBootstrapIdentity(
      {
        addMember: vi.fn(),
        createOrganization: vi.fn(),
        signUpEmail,
        updateMemberRole: vi.fn(),
      },
      createEmptyResultDatabase(),
    )

    await expect(
      identity.ensureOwnerUser({
        email: 'owner@example.test',
        name: 'Owner User',
        temporaryPassword: 'password1234',
      }),
    ).rejects.toMatchObject({
      failureCategory: 'validation_failed',
      operation: 'ownerUser',
    })
    expect(signUpEmail).not.toHaveBeenCalled()
  })
})

function createEmptyResultDatabase(): Database {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => [],
        }),
      }),
    }),
  } as unknown as Database
}
