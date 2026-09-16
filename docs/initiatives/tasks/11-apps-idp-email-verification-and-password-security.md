# Apps IDP Email Verification And Password Security Tasks

Execution checklist for [`docs/initiatives/prds/11-apps-idp-email-verification-and-password-security.md`](../prds/11-apps-idp-email-verification-and-password-security.md).

## Phase 1: Planning And Governance

- [x] Create IDP email verification and password security PRD.
- [x] Create IDP email verification and password security execution plan.
- [x] Review `idp-architecture-discussion.md` before implementation and keep this task scoped to the next two roadmap items.
- [x] Confirm this step combines email verification, password policy, password reset, password change, and session revocation.
- [x] Confirm Resend is the transactional email provider for this step.
- [x] Confirm React Email is used for local reusable auth email templates.
- [x] Confirm inline Resend calls are acceptable temporarily and future central email worker work is deferred.
- [x] Confirm custom robust email rate limits are deferred to a later task.
- [x] Confirm HIBP/compromised-password checks are deferred to a later task.
- [x] Confirm persistent audit-log storage and audit worker behavior are deferred to a later task.

## Phase 2: Dependencies

- [x] Add Resend runtime dependency with pnpm CLI.
- [x] Add React Email dependencies with pnpm CLI.
- [x] Add any React Email render/build dependencies required by the chosen implementation path with pnpm CLI.
- [x] Do not add queue, worker, Redis, HIBP, marketing email, organization, admin, 2FA, passkey, JWT, or OAuth dependencies in this step.
- [x] Run `pnpm install` after dependency changes.

## Phase 3: Environment Configuration

- [x] Add `RESEND_API_KEY` to centralized IDP environment validation.
- [x] Add `AUTH_EMAIL_FROM` to centralized IDP environment validation.
- [x] Add optional `AUTH_EMAIL_REPLY_TO` to centralized IDP environment validation.
- [x] Add redirect URL configuration needed for verification and reset flows.
- [x] Ensure every runtime environment requires real `RESEND_API_KEY` and `AUTH_EMAIL_FROM` values.
- [x] Keep tests able to run without a real Resend API key.
- [x] Update `.env.example` with safe placeholders only.
- [x] Ensure source files outside centralized env config do not read `process.env` directly.
- [x] Ensure frontend runtime configuration does not expose Resend secrets.

## Phase 4: Email Template Structure

- [x] Create local React Email template folder under `apps/idp`.
- [x] Create a reusable local transactional email layout.
- [x] Create an email verification template.
- [x] Create a password reset template.
- [x] Use Brazilian Portuguese for user-facing subject and body copy.
- [x] Include first name only when available and safe.
- [x] Do not include CPF, CNPJ, process data, protocol details, tenant-sensitive context, internal IDs, session IDs, raw tokens, or sensitive account metadata.
- [x] Include one primary call to action per email.
- [x] Include expiration information in each email.
- [x] Include safe fallback URL text when appropriate.
- [x] Include “ignore this email if you did not request this” copy.
- [x] Keep templates reusable without extracting a shared package.

## Phase 5: Resend Email Sending

- [x] Initialize Resend using centralized config.
- [x] Send verification emails through Resend.
- [x] Send password reset emails through Resend.
- [x] Pass React Email templates to Resend using the current supported SDK API.
- [x] Use `AUTH_EMAIL_FROM` as the sender.
- [x] Use `AUTH_EMAIL_REPLY_TO` when configured.
- [x] Keep direct Resend calls local and minimal.
- [x] Do not add a shared email package or worker in this step.
- [x] Add safe operational logs for send attempts, successes, and failures.
- [x] Ensure logs do not include email addresses, names, tokens, URLs, cookies, session IDs, request bodies, response bodies, API keys, or rendered email bodies.
- [x] Leave a clear code comment or seam where future audit-log event publication should happen.

## Phase 6: Better Auth Email Verification

- [x] Configure `emailAndPassword.requireEmailVerification: true`.
- [x] Configure `emailVerification.sendVerificationEmail`.
- [x] Configure verification email sending on signup.
- [x] Ensure verification links expire after 24 hours.
- [x] Do not configure automatic verification email sending on every sign-in attempt unless implementation constraints require it and the PRD is updated.
- [x] Ensure unverified users cannot receive effective email/password access.
- [x] Ensure verification behavior uses Better Auth-supported APIs and does not reimplement token internals.
- [x] Ensure verification redirects route through IDP/Better Auth token handling before returning users to web UX pages.

## Phase 7: Verification Resend Flow

- [x] Add an explicit IDP-owned verification resend operation if Better Auth supports it safely.
- [x] Add OpenAPI metadata for the resend operation when exposed as a custom route.
- [x] Return safe/generic responses where account state should not be revealed.
- [x] Do not implement custom robust rate limits in this step.
- [x] Document the missing custom email rate limit as a known risk and future backlog item.

## Phase 8: Password Policy

- [x] Configure Better Auth minimum password length to 12.
- [x] Configure Better Auth maximum password length to 128.
- [x] Add a local password policy helper when needed for denylist validation.
- [x] Add a local denylist for obvious/common passwords and project-specific weak defaults.
- [x] Ensure password policy allows passphrases.
- [x] Do not require mandatory uppercase/lowercase/number/symbol composition rules.
- [x] Apply the same policy to signup, password reset, and password change flows.
- [x] Ensure password validation errors are useful but do not leak policy internals that encourage trivial bypasses.

## Phase 9: Password Reset

- [x] Configure Better Auth `emailAndPassword.sendResetPassword`.
- [x] Configure password reset token expiration to 30 minutes.
- [x] Add or expose password reset request route if not already available.
- [x] Add or expose password reset completion route if required by the wrapper strategy.
- [x] Ensure password reset request responses do not reveal whether an account exists or is verified.
- [x] Ensure password reset uses the password policy.
- [x] Ensure password reset revokes all sessions.
- [x] Preserve Better Auth cookie/header/status behavior correctly.
- [x] Do not reimplement Better Auth token, credential, hashing, or reset internals.

## Phase 10: Password Change

- [x] Add or expose authenticated password change route if supported safely by Better Auth.
- [x] Require an authenticated session for password change.
- [x] Require current password when supported safely by Better Auth.
- [x] Ensure password change uses the password policy.
- [x] Revoke all other sessions after password change while preserving the current session when supported safely.
- [x] If preserving the current session is not supported safely, document the limitation and use the safer revocation behavior.
- [x] Preserve Better Auth cookie/header/status behavior correctly.
- [x] Do not reimplement Better Auth hashing, credential verification, or session internals.

## Phase 11: Auth Contracts And OpenAPI

- [x] Add stable OpenAPI tags for new auth wrapper routes.
- [x] Add stable `operationId` values for new auth wrapper routes.
- [x] Add request schemas for verification resend, password reset request, password reset completion, and password change where exposed.
- [x] Add response schemas that avoid leaking tokens, cookies, session IDs, provider details, or account existence.
- [x] Use synthetic non-sensitive examples.
- [x] Use `snake_case` for IDP-emitted API payload fields.
- [x] Document that frontend pages may be needed for final verification/reset UX.

## Phase 12: Logging And Security Review

- [x] Confirm auth/email routes do not log request bodies or response bodies.
- [x] Confirm auth/email routes do not log email, first name, password, cookies, tokens, session IDs, CPF, CNPJ, Resend API keys, rendered email, or reset/verification URLs.
- [x] Confirm Pino redaction covers new sensitive fields and headers where applicable.
- [x] Confirm canonical request events remain operational and no-PII.
- [x] Confirm email provider errors are sanitized before client responses.
- [x] Confirm no auth tokens are stored in `localStorage`.
- [x] Confirm Better Auth internals are not reimplemented.

## Phase 13: Unit Tests

- [x] Add unit tests for new environment parsing behavior.
- [x] Add unit tests for missing/invalid Resend and email sender configuration.
- [x] Add unit tests for Better Auth email verification config construction.
- [x] Add unit tests for Better Auth password reset config construction.
- [x] Add unit tests for password length validation.
- [x] Add unit tests for local password denylist behavior.
- [x] Add unit tests for React Email template rendering or template construction.
- [x] Add unit tests for safe logging behavior where practical.
- [x] Ensure unit tests do not call Resend or connect to any external service.

## Phase 14: Route And Use-Case Tests

- [x] Add `fastify.inject()` tests for new auth wrapper route registration.
- [x] Add route/use-case tests for verification email sending with mocked Resend behavior.
- [x] Add route/use-case tests for verification resend behavior with mocked Better Auth/email boundaries.
- [x] Add route/use-case tests for blocked unverified sign-in behavior where practical.
- [x] Add route/use-case tests for password reset request behavior and generic responses.
- [x] Add route/use-case tests for password reset completion behavior where practical.
- [x] Add route/use-case tests for password change behavior where practical.
- [x] Add route/use-case tests for session revocation behavior with mocked Better Auth boundaries.
- [x] Ensure route tests do not bind real network ports.
- [x] Ensure route tests do not send real emails.

## Phase 15: CI/CD And Deployment

- [x] Ensure quality gates still do not require real Resend connectivity.
- [x] Document required GitHub Environment secrets for any deployment workflow changes.
- [x] Document required Dokploy runtime environment variables for Resend/email configuration.
- [x] Confirm staging and production require verified Resend sender/domain setup before enabling real email delivery.
- [x] Confirm deployment logs do not print email secrets or provider responses with sensitive details.
- [x] Confirm smoke checks do not require sending real email unless explicitly run as a manual approved step.

## Phase 16: Documentation And Agent Guidance

- [x] Update `apps/idp/README.md` with Resend env vars, email flows, password policy, reset/change behavior, and manual smoke testing notes.
- [x] Update `apps/idp/AGENTS.md` with email/security implementation rules if useful.
- [x] Update root `AGENTS.md` only if a durable repo-wide agent rule is introduced.
- [x] Update `docs/AGENTS.md` only if documentation rules need to change.
- [x] Update `docs/idp/architecture.md` with the transactional email/template boundary if useful.
- [x] Update `docs/idp/security.md` with email verification, password policy, LGPD-conscious email content, session revocation, and no-PII logging rules.
- [x] Update `docs/idp/deployment.md` with Resend runtime configuration and verified sender/domain requirements.
- [x] Update `docs/idp/testing.md` with mocked email provider and React Email template test conventions.
- [x] Update `docs/TODO.md` for deferred email worker, robust email rate limits, audit worker, and compromised-password checks.
- [x] Update `idp-architecture-discussion.md` after implementation and verification.

## Phase 17: Verification

- [x] Run `pnpm install` after dependency changes.
- [x] Run `pnpm turbo run check --filter=idp`.
- [x] Run `pnpm turbo run typecheck --filter=idp`.
- [x] Run `pnpm turbo run test:coverage --filter=idp`.
- [x] Run `pnpm turbo run build --filter=idp`.
- [x] Start the IDP locally with approved configuration and mocked or approved email behavior.
- [x] Confirm signup triggers the verification email path with mocked or approved Resend behavior.
- [x] Confirm an unverified user cannot sign in or receive effective access.
- [x] Confirm verification link flow works in an approved environment.
- [x] Confirm verification resend flow works in an approved environment.
- [x] Confirm password reset request returns a generic response.
- [x] Confirm password reset email delivery works in an approved Resend environment.
- [x] Confirm password reset can be completed and revokes sessions.
- [x] Confirm authenticated password change works and revokes other sessions or documents the safer fallback.
- [x] Confirm logs do not expose credentials, cookies, tokens, emails, names, session IDs, Resend API keys, connection strings, request bodies, response bodies, rendered emails, or reset/verification URLs.

## Phase 18: Roadmap Update

- [x] Mark the email verification roadmap item complete in `idp-architecture-discussion.md` after implementation and verification.
- [x] Mark the password policy/reset/change/session revocation roadmap item complete in `idp-architecture-discussion.md` after implementation and verification.

## Phase 19: Future Enhancements

- [ ] Move transactional email delivery to a central email worker for the SAC Nexus ecosystem.
- [ ] Add durable outbox/queue semantics for retries and provider resilience.
- [ ] Add robust email/auth rate limits using durable or secondary storage.
- [ ] Add compromised-password checks such as HIBP k-anonymity after privacy and availability tradeoffs are approved.
- [ ] Add persistent audit-log event publication through the future audit worker.
- [ ] Add Resend delivery webhooks and provider event handling if operational needs justify it.
- [ ] Extract shared email templates only after another real service needs them.
