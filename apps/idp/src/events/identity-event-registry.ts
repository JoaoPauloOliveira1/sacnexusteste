export const identityEventNames = {
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
} as const

export type IdentityEventName = (typeof identityEventNames)[keyof typeof identityEventNames]

export const identityOperationLabels = {
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
} as const

export type IdentityOperationLabel =
  (typeof identityOperationLabels)[keyof typeof identityOperationLabels]

export const identityEventOutcomes = {
  failed: 'failed',
  skipped: 'skipped',
  succeeded: 'succeeded',
} as const

export type IdentityEventOutcome =
  (typeof identityEventOutcomes)[keyof typeof identityEventOutcomes]

export const identityReasonCodes = {
  betterAuthRejected: 'better_auth_rejected',
  bootstrapConflictDetected: 'bootstrap_conflict_detected',
  invalidRequest: 'invalid_request',
  notAuthenticated: 'not_authenticated',
  passwordPolicyViolation: 'password_policy_violation',
  unknownControlledFailure: 'unknown_controlled_failure',
} as const

export type IdentityReasonCode = (typeof identityReasonCodes)[keyof typeof identityReasonCodes]

export const identityEventAllowedPayloadFields = [
  'name',
  'outcome',
  'operation',
  'reason_code',
  'request_id',
  'user_id',
  'tenant_id',
  'occurred_at',
] as const

export type IdentityEventAllowedPayloadField = (typeof identityEventAllowedPayloadFields)[number]

export const identityEventAllowedPayloadFieldSet = new Set<string>(
  identityEventAllowedPayloadFields,
)
