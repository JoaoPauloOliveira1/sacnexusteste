# Apps IDP Email Verification And Password Security PRD

## Overview

This document defines the next incremental implementation step for `apps/idp`.

The goal is to require verified email addresses before effective email/password access, add transactional email delivery through Resend, introduce reusable local React Email templates, and implement the first password security slice: password policy, password reset, password change, and session revocation behavior after password changes/resets.

Execution plan: [`docs/initiatives/tasks/11-apps-idp-email-verification-and-password-security.md`](../tasks/11-apps-idp-email-verification-and-password-security.md).

## Product Context

The IDP already has Fastify, Drizzle, PostgreSQL-backed Better Auth persistence, minimal email/password auth wrapper routes, session cookies, no cookie cache, readiness checks, CI/CD, and deployment documentation.

The next roadmap items from `idp-architecture-discussion.md` are:

- Implement email verification for signup before granting effective access.
- Add password policy, password change, password reset, and session revocation behavior after password changes/resets.

This PRD covers both items as one step because both rely on transactional email, user credential policy, Better Auth email/password configuration, and related user-facing account recovery flows.

## Goals

- Require email verification before email/password sign-in creates effective access.
- Send email verification automatically after signup.
- Provide an explicit resend-verification flow.
- Use Resend as the transactional email provider for this step.
- Call Resend inline from the IDP for now, without introducing a shared email package or worker.
- Use React Email for local reusable transactional email templates inside `apps/idp`.
- Keep email templates LGPD-conscious by minimizing personal data exposure.
- Include the user's first name in email templates when available, but never CPF, CNPJ, process data, tokens, raw URLs in logs, or sensitive account context.
- Use Portuguese user-facing email copy.
- Configure verification links to expire after 24 hours.
- Add password policy with minimum 12 characters and maximum 128 characters.
- Allow passphrases and avoid mandatory composition rules such as forced uppercase, number, and symbol requirements.
- Block an initial local denylist of obvious/common passwords.
- Add password reset email delivery with links expiring after 30 minutes.
- Add authenticated password change behavior.
- Revoke all sessions after password reset.
- Revoke other sessions after authenticated password change while preserving the current session when supported safely.
- Return generic responses for password reset requests to avoid account enumeration.
- Add safe operational logs for email operations without storing or logging PII, tokens, URLs, cookies, or email bodies.
- Leave a clear implementation seam or code comment where future audit-log event publication should be emitted.
- Update app README, durable IDP docs, agent guidance where useful, and the global backlog for deferred email/security work.

## Non-Goals

- No central email worker or queue in this step.
- No outbox pattern in this step.
- No shared monorepo email package in this step.
- No robust custom email rate-limit implementation in this step.
- No HIBP or external compromised-password check in this step.
- No persistent audit-log table or audit worker in this step.
- No marketing, broadcast, or preference-management email flows in this step.
- No frontend signup wizard integration in this step unless a later implementation task explicitly expands scope.
- No organization, admin, 2FA, passkey, OAuth, GOV.BR, JWT, or bearer-token work in this step.
- No storage of CPF, CNPJ, phone, address, profile, company, technical-responsible, tenant membership, or process-specific data in the IDP.
- No email delivery from CI quality gates.
- No real email provider calls in automated unit or route tests.

## Decisions

### Combined Scope

Email verification and password security should be implemented in the same PRD/TASK.

Rationale:

- Both flows need transactional email delivery.
- Both flows use Better Auth email/password configuration.
- Password reset requires email templates and Resend configuration similar to verification.
- Session revocation is part of the security posture expected after credential changes.

### Email Verification Access Policy

Email/password users must not receive effective access until their email is verified.

The account may exist in the database after signup, but sign-in/effective access must be blocked while `emailVerified` is false.

Use Better Auth's supported configuration for this behavior, including `emailAndPassword.requireEmailVerification: true`.

### Verification Email Sending

Verification email should be sent automatically after signup.

The IDP should also expose an explicit resend-verification operation with generic/safe responses.

Do not automatically send a new verification email on every sign-in attempt in this step. This reduces spam, cost, and abuse risk while keeping resend behavior intentional.

### Verification Token Lifetime

Email verification links expire after 24 hours.

Configure Better Auth `emailVerification.expiresIn` to `24 * 60 * 60` seconds unless implementation constraints require an equivalent supported option.

### Resend Integration

Use Resend as the email provider.

For this step, the IDP may call Resend directly from the Better Auth email callbacks or a very small local helper if needed for testability. Do not introduce a shared package, queue, or worker yet.

Required runtime configuration:

- `RESEND_API_KEY`
- `AUTH_EMAIL_FROM`
- `AUTH_EMAIL_REPLY_TO` optional

`AUTH_EMAIL_FROM` must be environment-specific and should use a verified Resend sender/domain before staging and production use.

No secret or provider token may be exposed to frontend runtime configuration.

### Future Email Worker

The direct Resend call is an intentional temporary implementation.

The global backlog must track a future central email worker for the SAC Nexus ecosystem. That worker should eventually own queueing, retries, provider abstraction, delivery observability, and cross-service transactional email concerns.

### React Email Templates

Use React Email templates local to `apps/idp`.

Create a reusable local transactional layout for auth emails, then compose specific templates for:

- Email verification.
- Password reset.

Do not create a shared template package until another service actually consumes it.

### LGPD-Conscious Email Content

Transactional auth emails may include the user's first name when available.

Emails must not include:

- CPF.
- CNPJ.
- Process numbers.
- Protocol details.
- Tenant-sensitive context.
- Raw verification/reset tokens.
- Internal IDs.
- Session IDs.
- Sensitive account metadata.

Email templates should include:

- Portuguese subject and body copy.
- One primary call to action.
- A fallback URL shown to the user only inside the email body when appropriate.
- Link expiration information.
- A warning to ignore the email if the user did not request the action.

Example user-facing subjects:

- `Confirme seu email no SAC Nexus`.
- `Redefina sua senha no SAC Nexus`.

### Redirect And Token Handling

Email links should route through IDP/Better Auth token handling and then redirect to configured `apps/web` pages for user experience.

The frontend should render final UX states such as email verified, verification failed/expired, and reset-password form where practical. The IDP should remain responsible for token validation/consumption.

The implementation should avoid exposing long-lived tokens to frontend storage and must not store auth tokens in `localStorage`.

### Password Policy

Use a modern password policy:

- Minimum length: 12 characters.
- Maximum length: 128 characters.
- Allow passphrases.
- Do not require mandatory uppercase/lowercase/number/symbol composition rules.
- Block a small local denylist of obvious/common passwords and project-specific weak defaults.

Rationale:

- Longer passwords and passphrases are more useful than composition theater.
- Avoiding forced composition reduces predictable substitutions and user frustration.
- A local denylist is simple, testable, and avoids an external dependency in the auth path.

### Compromised Password Checks

Do not add HIBP or another compromised-password service in this step.

Track it as a future enhancement. A later task should evaluate k-anonymity, privacy impact, availability, provider risk, latency, caching, and failure behavior.

### Password Reset

Password reset requests must use generic responses that do not reveal whether an email exists, whether an account is verified, or whether an email was sent.

Password reset links expire after 30 minutes.

Configure Better Auth `emailAndPassword.resetPasswordTokenExpiresIn` to `30 * 60` seconds unless implementation constraints require an equivalent supported option.

### Password Change

Authenticated password change should require the current authenticated session and the current password when supported safely by Better Auth's APIs.

Password change must use the same password policy as signup and reset.

### Session Revocation

After password reset, revoke all sessions.

After authenticated password change, revoke all other sessions while preserving the current session when supported safely. If preserving the current session is not supported by Better Auth in the chosen implementation path, the implementation must document the limitation and prefer the safer behavior.

### Email Rate Limits

Do not implement custom robust email rate limits in this step.

This is a known risk and must be tracked in the global backlog. A later task should design a robust approach, likely using durable storage or secondary storage and covering IP, normalized email, operation type, provider cost control, and abuse response behavior.

### Logging And Audit Preparation

Add safe operational logs around email operations using operation labels and status only.

Allowed labels include:

- `email_verification`.
- `password_reset`.
- `send_attempted`.
- `send_succeeded`.
- `send_failed`.

Logs must not include:

- Email addresses in clear text.
- Names.
- Request bodies.
- Response bodies.
- Tokens.
- Verification or reset URLs.
- Cookies.
- Session IDs.
- Resend API keys.
- Rendered email HTML or text.

The implementation should leave a clear code comment or minimal seam where future audit-log event publication will occur. Persistent audit logging remains out of scope.

### Testing

Automated tests must use mocks/fakes and must not send real emails.

Tests should cover:

- Environment parsing for Resend and email config.
- Better Auth email verification and password reset config construction.
- Password policy validation.
- Local denylist behavior.
- React Email template rendering or template construction without real delivery.
- Wrapper route behavior using mocked Better Auth/email boundaries.
- Safe response behavior for password reset and verification resend requests.
- Logging redaction expectations where practical.

A manual smoke test against an approved environment with a verified Resend sender/domain should be included as a verification step.

## Functional Requirements

- A new signup triggers an email verification email.
- Unverified email/password users cannot sign in or receive effective authenticated access.
- Users can request a verification email resend through an IDP-owned operation.
- Users can request password reset without account enumeration in the API response.
- Users can complete password reset through Better Auth-supported token handling.
- Users can change password while authenticated when the API is supported safely.
- Password creation, reset, and change enforce the same password policy.
- Password reset revokes all sessions.
- Password change revokes other sessions while preserving the current session when safely supported.
- Resend sends verification and reset emails in configured runtime environments.
- React Email templates produce Portuguese transactional auth emails.
- The IDP exposes OpenAPI metadata for custom wrapper routes introduced in this step.

## Non-Functional Requirements

- TypeScript must remain strict.
- Email sending must not block tests or require external services in CI.
- Secrets must be centrally validated and never logged.
- Email provider errors must not leak provider internals or sensitive data to clients.
- Logs must remain no-PII and no-secret by default.
- Email templates must avoid unnecessary personal data and business context.
- The implementation must avoid premature shared packages or worker infrastructure.
- Documentation must clearly distinguish current inline Resend behavior from the future central email worker direction.

## Risks

- Direct inline Resend calls can couple auth latency to provider latency until a worker/outbox exists.
- Without custom robust email rate limits, resend and reset endpoints may be more exposed to abuse or provider cost spikes.
- Email deliverability depends on correct Resend domain/sender setup outside the application code.
- Token redirect topology can become confusing if frontend and IDP public URLs are not configured consistently.
- Password-change session preservation may depend on Better Auth API support and may need a safer fallback.
- Email templates can accidentally include excessive personal data if future edits are not reviewed with LGPD in mind.

## Acceptance Criteria

- `idp-architecture-discussion.md` links this PRD/TASK from the email verification and password security roadmap items.
- `apps/idp` validates `RESEND_API_KEY`, `AUTH_EMAIL_FROM`, and optional `AUTH_EMAIL_REPLY_TO` through centralized runtime config.
- Better Auth is configured to require email verification for email/password access.
- Verification emails are sent on signup through Resend.
- Verification links expire after 24 hours.
- Verification resend is available through an explicit IDP-owned operation.
- Password reset email delivery is configured through Resend.
- Password reset links expire after 30 minutes.
- Password reset request responses do not reveal account existence.
- Password reset revokes all sessions.
- Authenticated password change is implemented where safely supported.
- Authenticated password change revokes other sessions or documents a safer fallback.
- Password policy enforces 12 to 128 characters and local denylist checks.
- React Email templates exist for verification and password reset using a reusable local layout.
- Email templates use Portuguese user-facing copy and include only allowed personal data.
- Automated tests do not send real emails.
- Manual smoke verification against an approved Resend environment is documented.
- `apps/idp/README.md`, durable `docs/idp/*` docs, relevant `AGENTS.md` files, and `docs/TODO.md` are updated where needed.

## Future Enhancements

- Move transactional email delivery to a central worker serving the broader SAC Nexus ecosystem.
- Add durable outbox/queue semantics for retries and provider resilience.
- Add robust email/auth rate limits using durable or secondary storage.
- Add compromised-password checks such as HIBP k-anonymity after privacy and availability tradeoffs are approved.
- Add persistent audit-log events through the future audit worker.
- Add delivery webhooks and provider event handling if needed for operations.
- Extract shared email templates only after a second real consumer exists.
