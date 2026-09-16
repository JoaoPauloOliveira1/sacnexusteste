import { describe, expect, it } from 'vitest'
import {
  createIdentityEvent,
  identityEventAllowedPayloadFieldSet,
  identityEventAllowedPayloadFields,
  identityEventNames,
  identityEventOutcomes,
  identityOperationLabels,
  identityReasonCodes,
  noopIdentityEventPublisher,
} from '@/events/index.js'
import { assertIdentityEventSafe } from '../test-support/assert-identity-event-safety.js'

describe('identity events', () => {
  it('defines the approved auth event names and operation labels', () => {
    expect(identityEventNames).toMatchObject({
      authOk: 'identity.auth.ok',
      bootstrapCompleted: 'identity.bootstrap.completed',
      bootstrapFailed: 'identity.bootstrap.failed',
      bootstrapStarted: 'identity.bootstrap.started',
      changePassword: 'identity.auth.password_changed',
      getSession: 'identity.auth.session_lookup',
      organizationConfigured: 'identity.organization.configured',
      organizationMemberAdded: 'identity.organization.member_added',
      organizationOwnerAssigned: 'identity.organization.owner_assigned',
      requestPasswordReset: 'identity.auth.password_reset_requested',
      resetPassword: 'identity.auth.password_reset_completed',
      sendVerificationEmail: 'identity.auth.verification_email_requested',
      signInEmail: 'identity.auth.sign_in',
      signOut: 'identity.auth.sign_out',
      signUpEmail: 'identity.auth.sign_up',
      tenantDomainConfigured: 'identity.tenant.domain_configured',
      tenantResolutionFailed: 'identity.tenant.resolution_failed',
      tenantResolved: 'identity.tenant.resolved',
      verifyEmail: 'identity.auth.email_verified',
    })
    expect(identityOperationLabels).toMatchObject({
      authOk: 'auth_ok',
      bootstrapCompleted: 'bootstrap_completed',
      bootstrapFailed: 'bootstrap_failed',
      bootstrapStarted: 'bootstrap_started',
      changePassword: 'change_password',
      getSession: 'get_session',
      organizationConfigured: 'organization_configured',
      organizationMemberAdded: 'organization_member_added',
      organizationOwnerAssigned: 'organization_owner_assigned',
      requestPasswordReset: 'request_password_reset',
      resetPassword: 'reset_password',
      sendVerificationEmail: 'send_verification_email',
      signInEmail: 'sign_in_email',
      signOut: 'sign_out',
      signUpEmail: 'sign_up_email',
      tenantDomainConfigured: 'tenant_domain_configured',
      tenantResolutionFailed: 'tenant_resolution_failed',
      tenantResolved: 'tenant_resolved',
      verifyEmail: 'verify_email',
    })
  })

  it('defines only the approved event payload fields', () => {
    expect(identityEventAllowedPayloadFields).toEqual([
      'name',
      'outcome',
      'operation',
      'reason_code',
      'request_id',
      'user_id',
      'tenant_id',
      'occurred_at',
    ])
    expect([...identityEventAllowedPayloadFieldSet].sort()).toEqual(
      [...identityEventAllowedPayloadFields].sort(),
    )
  })

  it('defines safe bootstrap reason codes without widening event payload fields', () => {
    expect(identityReasonCodes).toMatchObject({
      bootstrapConflictDetected: 'bootstrap_conflict_detected',
    })
    expect(identityEventAllowedPayloadFields).not.toContain('email')
    expect(identityEventAllowedPayloadFields).not.toContain('domain')
    expect(identityEventAllowedPayloadFields).not.toContain('normalized_host')
    expect(identityEventAllowedPayloadFields).not.toContain('password')
    expect(identityEventAllowedPayloadFields).not.toContain('sql')
  })

  it('creates safe allowlisted events without undefined optional fields', () => {
    const event = createIdentityEvent({
      name: identityEventNames.signInEmail,
      occurred_at: new Date('2026-06-02T00:00:00.000Z'),
      operation: identityOperationLabels.signInEmail,
      outcome: identityEventOutcomes.failed,
      reason_code: identityReasonCodes.betterAuthRejected,
      request_id: 'request-1',
    })

    expect(event).toEqual({
      name: 'identity.auth.sign_in',
      occurred_at: '2026-06-02T00:00:00.000Z',
      operation: 'sign_in_email',
      outcome: 'failed',
      reason_code: 'better_auth_rejected',
      request_id: 'request-1',
    })
    expect(Object.keys(event).sort()).toEqual([
      'name',
      'occurred_at',
      'operation',
      'outcome',
      'reason_code',
      'request_id',
    ])
    assertIdentityEventSafe(event, [
      'user@example.test',
      'sensitive-password',
      'session-token',
      'https://app.example.test/auth/reset-password?token=reset-token',
    ])
  })

  it('publishes with the no-op publisher without side effects or failures', async () => {
    const event = createIdentityEvent({
      name: identityEventNames.authOk,
      occurred_at: '2026-06-02T00:00:00.000Z',
      operation: identityOperationLabels.authOk,
      outcome: identityEventOutcomes.succeeded,
      request_id: 'request-1',
    })

    await expect(noopIdentityEventPublisher.publish(event)).resolves.toBeUndefined()
    expect(event).toEqual({
      name: 'identity.auth.ok',
      occurred_at: '2026-06-02T00:00:00.000Z',
      operation: 'auth_ok',
      outcome: 'succeeded',
      request_id: 'request-1',
    })
  })
})
