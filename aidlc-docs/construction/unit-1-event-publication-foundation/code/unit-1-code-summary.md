# Unit 1 Code Summary: IDP Event Publication Foundation

## Overview

Unit 1 adds a safe internal identity event publication seam to the IDP. The implementation uses a central registry, a small event factory/helper, and a no-op publisher wired through existing application dependencies.

## Created Application Files

- `apps/idp/src/events/identity-event-registry.ts`
- `apps/idp/src/events/identity-event.ts`
- `apps/idp/src/events/identity-event-publisher.ts`
- `apps/idp/src/events/index.ts`
- `apps/idp/tests/unit/events/identity-event.test.ts`
- `apps/idp/tests/unit/usecases/identity/identity-events.test.ts`
- `apps/idp/tests/unit/test-support/assert-identity-event-safety.ts`

## Modified Application Files

- `apps/idp/src/entrypoint/dependencies.ts`
- `apps/idp/src/entrypoint/app.ts`
- `apps/idp/src/entrypoint/routes/auth/change-password/route.ts`
- `apps/idp/src/entrypoint/routes/auth/get-session/route.ts`
- `apps/idp/src/entrypoint/routes/auth/ok/route.ts`
- `apps/idp/src/entrypoint/routes/auth/request-password-reset/route.ts`
- `apps/idp/src/entrypoint/routes/auth/reset-password/route.ts`
- `apps/idp/src/entrypoint/routes/auth/send-verification-email/route.ts`
- `apps/idp/src/entrypoint/routes/auth/sign-in-email/route.ts`
- `apps/idp/src/entrypoint/routes/auth/sign-out/route.ts`
- `apps/idp/src/entrypoint/routes/auth/sign-up-email/route.ts`
- `apps/idp/src/entrypoint/routes/auth/verify-email/route.ts`
- `apps/idp/src/usecases/identity/change-password.ts`
- `apps/idp/src/usecases/identity/get-auth-ok.ts`
- `apps/idp/src/usecases/identity/get-auth-session.ts`
- `apps/idp/src/usecases/identity/request-password-reset.ts`
- `apps/idp/src/usecases/identity/reset-password.ts`
- `apps/idp/src/usecases/identity/send-verification-email.ts`
- `apps/idp/src/usecases/identity/sign-in-with-email.ts`
- `apps/idp/src/usecases/identity/sign-out.ts`
- `apps/idp/src/usecases/identity/sign-up-with-email.ts`
- `apps/idp/src/usecases/identity/verify-email.ts`
- `apps/idp/tests/unit/entrypoint/app.test.ts`

## Story Coverage

- **US-01**: Covered. Existing auth wrapper flows publish safe identity events through a no-op publisher abstraction.

## Security Checks

- Event payload fields are allowlisted through a central registry.
- Event payloads include request ID, operation, outcome, event name, timestamp, and safe reason codes only.
- Event tests assert representative forbidden keys and values are absent.
- No runtime per-event logging, storage, queue, external call, or file I/O was added.
- Better Auth internals remain untouched.

## PBT Status

- PBT remains N/A for Unit 1 because implementation uses simple allowlisted event construction and response-status classification only.
- If future work introduces complex sanitization or normalization, PBT must be revisited before implementation completes.

## Verification Commands

- `pnpm --filter idp test`
- `pnpm --filter idp typecheck`
- `pnpm --filter idp check`

## Verification Results

- `pnpm --filter idp test`: Passed. 14 test files, 74 tests.
- `pnpm --filter idp typecheck`: Passed.
- `pnpm --filter idp check`: Passed.

## Post-Generation Fix

- Ran `pnpm --filter idp db:migrate` to apply pending IDP database migrations.
- Added a global Fastify error handler so thrown internal errors return `{ "message": "Erro" }` instead of leaking SQL, raw query details, or PII.
- Added a regression test for generic 500 responses on auth route failures.

## Durable Documentation

Durable README, `docs/`, roadmap, and backlog updates are deferred to Unit 5 after verified implementation, as approved in the unit plan.
