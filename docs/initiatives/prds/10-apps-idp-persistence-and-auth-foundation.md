# Apps IDP Persistence And Auth Foundation PRD

## Overview

This document defines the fourth incremental implementation step for `apps/idp`.

The goal is to add the first persistence and authentication slice to the IDP by configuring Drizzle with PostgreSQL and integrating Better Auth for a minimal email/password flow. This step intentionally combines database access and Better Auth because the first useful auth flow depends on persisted users, accounts, sessions, and verification records.

Execution plan: [`docs/initiatives/tasks/10-apps-idp-persistence-and-auth-foundation.md`](../tasks/10-apps-idp-persistence-and-auth-foundation.md).

## Product Context

The IDP already has a Fastify foundation, operational endpoints, request IDs, structured logs, OpenAPI exposure outside production, Docker packaging, and CI/CD coverage.

The next roadmap items from `idp-architecture-discussion.md` are:

- Configure Drizzle and PostgreSQL access for the IDP, keeping table ownership boundaries explicit even while sharing the same database.
- Integrate Better Auth with the minimal email/password flow, session cookies, and no cookie cache.

This PRD covers both items as one step. It does not implement email verification, password reset, organization membership, admin, 2FA, event publication, tenant resolution, or FastAPI integration.

## Goals

- Add Drizzle ORM to `apps/idp` using PostgreSQL through the standard `pg` driver.
- Use a shared PostgreSQL database while keeping IDP table ownership explicit through `idp_` table prefixes.
- Use `DATABASE_URL` for IDP database connectivity in each service runtime environment.
- Keep migrations versioned under the IDP app and applied through explicit operational/deploy steps, not application startup.
- Integrate Better Auth with the Drizzle adapter and PostgreSQL-backed persistence.
- Enable the minimal Better Auth email/password flow.
- Expose IDP-owned wrapper routes for auth operations under `/api/auth/*`.
- Preserve Better Auth as the implementation owner for users, credentials, sessions, cookies, and auth security internals.
- Use secure HttpOnly session cookies and explicitly disable Better Auth cookie cache.
- Keep session duration configurable, defaulting to 30 days.
- Add database readiness checks without requiring real database access in unit tests.
- Add unit and route tests with mocked database/auth boundaries only.

## Non-Goals

- No email verification, OTP sending, or email provider integration in this step.
- No password reset, password change, session revocation on password changes, or password breach checks in this step.
- No Better Auth `organization`, `admin`, `twoFactor`, `jwt`, bearer, OAuth Provider, GOV.BR, or passkey plugins in this step.
- No FastAPI implementation or business API session validation endpoint in this step.
- No tenant/domain resolution in this step.
- No event publication abstraction in this step.
- No real database integration tests in CI in this step.
- No local PostgreSQL Docker Compose setup in this step.
- No frontend wizard integration in this step.
- No storage of CPF, CNPJ, phone, address, profile, company, technical-responsible, or process-specific data in the IDP.
- No account-level Terms of Use or Privacy Policy acceptance persistence in this step.
- No automatic migration execution inside the IDP application startup.

## Decisions

### Combined Scope

This step combines database foundation and minimal Better Auth integration.

The split was considered, but the first meaningful database schema is the Better Auth persistence model. Building Drizzle without Better Auth would either create placeholder database code or require a second immediate task to make it useful.

### PostgreSQL Driver

Use `pg` with Drizzle's `node-postgres` integration.

Rationale:

- SAC Nexus currently expects to use Neon, but may move to another PostgreSQL provider later.
- The standard `pg` driver keeps the code generic and provider-portable.
- The IDP should not couple itself to a Neon-specific SDK unless infrastructure constraints require it later.

### Database URL

Use `DATABASE_URL`, not an app-scoped variable such as `IDP_DATABASE_URL`.

Rationale:

- Each service runs in its own runtime environment.
- `DATABASE_URL` is a conventional name for PostgreSQL-backed services.
- Ownership is expressed through table naming, migrations, code boundaries, and deployment policy rather than the variable name.

`DATABASE_URL` must never be exposed to the frontend or browser runtime config.

### Shared Database Ownership Boundary

The initial deployment may share one PostgreSQL database with future business APIs.

IDP-owned tables must use the `idp_` prefix in `snake_case`. Initial Better Auth table names should stay close to Better Auth model names while carrying the prefix:

- `idp_user`
- `idp_session`
- `idp_account`
- `idp_verification`

Business services must not write directly to IDP-owned tables. They must use IDP APIs or explicitly approved integration contracts.

If future operational or security requirements justify it, the IDP can move to a dedicated database or schema without changing the ownership rule.

### Drizzle Schema And Adapter Mapping

The Drizzle schema should live under `apps/idp/src/database` and define IDP-owned tables explicitly.

The Better Auth Drizzle adapter must map Better Auth model names to the prefixed Drizzle tables. Better Auth model naming should remain the auth engine boundary; the physical PostgreSQL tables carry the `idp_` prefix.

Do not rely on business API migrations or schemas for IDP-owned tables.

### Migrations

Migrations must be generated and versioned inside the IDP app.

Required package-level scripts:

- `db:generate` for generating SQL migrations from Drizzle schema changes.
- `db:migrate` for applying pending migrations.
- `db:studio` for local database inspection when useful.

The application startup command must not apply migrations automatically.

Deployments should apply migrations as an explicit operational/deploy step before rolling out the new IDP runtime version. This avoids multiple application instances racing on migrations and makes schema changes visible in deployment logs.

Rollback does not automatically roll back database migrations. Migrations must be forward-compatible with the previous runtime version when practical, and rollback limitations must be documented.

### Neon Usage

Local, development, staging, and production environments may all point `DATABASE_URL` to Neon-managed PostgreSQL databases for now.

This step should not add a local PostgreSQL Compose service. A local Compose database can be revisited later if developer workflow, cost, offline development, or CI integration tests require it.

### Better Auth Integration Boundary

Use Better Auth as the authentication engine.

IDP route handlers are wrappers around official Better Auth APIs, handlers, adapters, hooks, and supported extension points. Wrappers may own route shape, OpenAPI metadata, request context, future spans, canonical event enrichment, controlled error responses, and identity-event emission points in later tasks.

Wrappers must not reimplement Better Auth cryptographic, password hashing, session, cookie, token, CSRF, or credential verification internals.

IDP-owned persisted IDs use the SAC Nexus UUID v7 standard. Better Auth ID generation is configured through the supported `advanced.database.generateId` option, and IDP primary/foreign keys use PostgreSQL `uuid` columns.

### Auth Route Scope

Expose the initial auth wrapper routes under `/api/auth/*`, aligned with the current frontend runtime auth URL default.

Initial routes:

- `POST /api/auth/sign-up/email`
- `POST /api/auth/sign-in/email`
- `POST /api/auth/sign-out`
- `GET /api/auth/session`
- `GET /api/auth/ok`

These routes should stay close to Better Auth conventions while remaining IDP-owned wrappers. Native Better Auth catch-all endpoints should not become the public default path unless a later PRD approves that change.

### Signup Payload

The minimal `POST /api/auth/sign-up/email` payload is:

- `name`
- `email`
- `password`

This step does not accept CPF, CNPJ, phone, address, representative data, company profile data, technical-responsible data, tenant membership data, communication preferences, Terms of Use acceptance, or Privacy Policy acceptance.

Existing `apps/web` signup wizards must be adapted in a later frontend/API task to provide a global account email and map IDP-owned account fields separately from FastAPI-owned domain profile fields.

### Existing Signup Wizard Implications

The current frontend signup wizards are not ready to call this endpoint directly.

Observed state:

- Individual signup currently collects first name, last name, CPF, birth date, address, password, terms, privacy, communication preference, and OTP, but not email.
- Company signup collects email inside company data, which may represent a company/contact email rather than the global IDP account email.
- Technical responsible signup also collects email inside company data, not clearly as the responsible user's global account email.
- All current signup flows simulate email verification with client-side delay.

This IDP step should not reshape those wizards. It should record the backend contract that later web work must satisfy.

### Email Verification Boundary

Email/password signup can create an account before the dedicated email verification step exists.

Effective access remains limited until email verification is implemented in the next roadmap item. This step must not claim that users have completed access after signup.

### Session Cookies

Use Better Auth cookie-based sessions as the primary browser authentication mechanism.

Initial session policy:

- Default session duration is 30 days.
- Session duration is configurable through `AUTH_SESSION_EXPIRES_IN_SECONDS`.
- Better Auth cookie cache is explicitly disabled.
- Secure cookies are required outside local development.
- Better Auth trusted origins include the configured `BETTER_AUTH_URL` origin and optional `AUTH_TRUSTED_ORIGINS` entries.
- HttpOnly cookies are required for session cookies.
- JWT, bearer tokens, and localStorage token patterns are out of scope.

### Environment Variables

Add these variables to the IDP runtime config:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `AUTH_SESSION_EXPIRES_IN_SECONDS`

`BETTER_AUTH_SECRET` must be a real secret in deployed environments and must not be committed.

`BETTER_AUTH_URL` should represent the public base URL expected by Better Auth in the current environment. The broader browser topology still prefers same-origin `/api/auth` routing.

Email provider variables are out of scope until email verification and reset-password flows are implemented.

### Readiness

`GET /ready` should include a database readiness check once PostgreSQL is introduced.

The readiness payload must stay non-sensitive. It may report dependency names and status, but must not include connection strings, hostnames, usernames, database names, pool internals, query text, or provider-specific metadata.

### Testing

This step uses unit and route-level tests only.

Tests may validate:

- Environment parsing for new variables.
- Drizzle config construction.
- Schema/table naming ownership rules.
- Better Auth config construction.
- Auth wrapper route registration.
- Route behavior using mocked auth/database boundaries.
- Readiness behavior with mocked database checks.

Tests must not connect to Neon or any real PostgreSQL database in this step.

Real database integration tests are deferred until a later task defines database lifecycle, secrets, cleanup, isolation, and CI cost policy.

### OpenAPI

Auth wrapper routes are custom IDP endpoints and should follow the current OpenAPI standards where practical:

- Stable `operationId` values.
- Explicit tags.
- Explicit request and response schemas.
- Synthetic, non-sensitive examples.
- `snake_case` emitted payload fields.

Do not expose cookies, tokens, secrets, real emails, session IDs, CPF, CNPJ, or other sensitive data in examples.

### CI/CD And Deployments

IDP deployment workflows must be updated so migrations can run before deployment for each environment that receives the IDP.

Each GitHub Environment or approved deployment mechanism must provide a `DATABASE_URL` secret for the migration step. Dokploy/runtime configuration must also provide `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and session configuration for the running service.

CI quality gates should not require a real database connection. They should validate source quality, type safety, tests, build output, migration files, and workflow syntax where practical.

## Functional Requirements

- Developers can configure IDP database connectivity through `DATABASE_URL`.
- Developers can generate migrations with `pnpm --filter idp db:generate`.
- Developers can apply migrations with `pnpm --filter idp db:migrate`.
- The IDP can initialize Drizzle with a `pg` connection pool.
- The IDP can initialize Better Auth with the Drizzle adapter and prefixed IDP tables.
- The IDP exposes wrapper routes under `/api/auth/*` for sign-up, sign-in, sign-out, session lookup, and auth health/status.
- The IDP persists users, accounts, sessions, and verification records in IDP-owned PostgreSQL tables.
- The IDP uses Better Auth email/password behavior for credential operations.
- The IDP uses HttpOnly session cookies and disables Better Auth cookie cache.
- The IDP reports database readiness through `/ready` without leaking sensitive details.

## Non-Functional Requirements

- TypeScript must remain strict.
- Database ownership boundaries must be explicit in table names, migration locations, docs, and code organization.
- Migrations must be reviewable SQL artifacts committed to the repository.
- Application startup must remain free from migration side effects.
- Unit tests must not depend on external services.
- Logs and canonical events must not include credentials, cookies, tokens, emails, CPF, CNPJ, session IDs, connection strings, or request/response bodies.
- Auth wrappers must preserve Better Auth cookie and header behavior correctly.
- The implementation must remain minimal and avoid premature abstractions beyond concrete database/auth boundaries.

## Risks

- Auth wrappers can accidentally break Better Auth cookie/header behavior if they do not preserve response metadata correctly.
- Running migrations from deployment workflows introduces environment secret requirements and rollback limitations.
- Shared database usage can blur ownership if future business services read or write `idp_*` tables directly.
- Existing frontend signup flows do not yet align cleanly with the minimal IDP account contract.
- Creating accounts before email verification exists can confuse product expectations if UI work integrates too early.

## Acceptance Criteria

- `apps/idp` has Drizzle, `pg`, and migration tooling configured.
- IDP-owned Better Auth tables use `idp_` prefixed `snake_case` names.
- Migrations for the initial Better Auth persistence tables are committed.
- `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `AUTH_SESSION_EXPIRES_IN_SECONDS` are centrally validated.
- Better Auth is configured with email/password enabled, Drizzle adapter, session cookies, and no cookie cache.
- Auth wrapper routes exist under `/api/auth/*` for the initial operation set.
- `/ready` includes a safe database readiness check.
- Unit and route tests cover config, schema naming, route wiring, and mocked auth/database behavior.
- CI/CD docs and workflows account for explicit migration execution before deploy.
- Durable IDP docs and app README are updated where implementation changes behavior or operational requirements.

## Future Enhancements

- Implement email verification before granting effective access.
- Implement password reset, password change, stronger password policy, and session revocation rules.
- Add the IDP event publication abstraction and emit auth flow events.
- Add real database integration tests after database lifecycle and CI policy are defined.
- Add Better Auth organization plugin for tenant and membership ownership.
- Add tenant/domain resolution from original request host.
- Add admin and two-factor authentication plugins in later steps.
- Define FastAPI session validation and tenant/membership lookup contracts.
- Revisit local PostgreSQL Compose if Neon-only development becomes a bottleneck.
- Revisit JWT/JWKS only after the initial IDP session validation model is stable.
