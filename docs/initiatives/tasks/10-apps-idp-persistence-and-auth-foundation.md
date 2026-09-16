# Apps IDP Persistence And Auth Foundation Tasks

Execution checklist for [`docs/initiatives/prds/10-apps-idp-persistence-and-auth-foundation.md`](../prds/10-apps-idp-persistence-and-auth-foundation.md).

## Phase 1: Planning And Governance

- [x] Create IDP persistence and auth foundation PRD.
- [x] Create IDP persistence and auth foundation execution plan.
- [x] Review `idp-architecture-discussion.md` before implementation and keep this task scoped to the fourth IDP roadmap step.
- [x] Confirm this step intentionally combines Drizzle/PostgreSQL access and minimal Better Auth email/password integration.
- [x] Confirm email verification, password reset, password change, organization, admin, 2FA, event publication, tenant resolution, FastAPI integration, frontend wizard integration, and real database integration tests remain out of scope.

## Phase 2: Dependencies

- [x] Add Better Auth runtime dependency with pnpm CLI.
- [x] Add Drizzle ORM runtime dependency with pnpm CLI.
- [x] Add `pg` runtime dependency with pnpm CLI.
- [x] Add `drizzle-kit` development dependency with pnpm CLI.
- [x] Add `@types/pg` development dependency with pnpm CLI if required by TypeScript.
- [x] Do not add Neon-specific drivers or SDKs in this step.
- [x] Do not add email, queue, Redis, OpenTelemetry, JWT, OAuth, passkey, or 2FA dependencies in this step.

## Phase 3: Environment Configuration

- [x] Add `DATABASE_URL` to centralized IDP environment validation.
- [x] Add `BETTER_AUTH_SECRET` to centralized IDP environment validation.
- [x] Add `BETTER_AUTH_URL` to centralized IDP environment validation.
- [x] Add `AUTH_SESSION_EXPIRES_IN_SECONDS` to centralized IDP environment validation with a 30-day default.
- [x] Ensure deployed environments require real `DATABASE_URL` and `BETTER_AUTH_SECRET` values.
- [x] Keep unit tests able to run without real external database access.
- [x] Update `.env.example` with safe placeholders only, never real credentials.
- [x] Ensure source files outside `src/config/env.ts` do not read `process.env` directly.

## Phase 4: Database Structure

- [x] Create a concrete `src/database` layer for Drizzle, schema, migrations, and database health checks.
- [x] Add a Drizzle database client using `pg` and Drizzle's node-postgres integration.
- [x] Configure connection lifecycle so Fastify can close database resources during app shutdown.
- [x] Keep database connection strings and pool internals out of logs.
- [x] Add a safe database readiness check that can be mocked in tests.
- [x] Ensure the database layer is IDP-owned and does not import business API concepts.
- [x] Use UUID v7 as the IDP persisted entity ID standard.

## Phase 5: Drizzle Schema And Ownership

- [x] Define IDP-owned Better Auth persistence tables in Drizzle schema.
- [x] Use `snake_case` physical table names with the `idp_` prefix.
- [x] Define `idp_user` for the Better Auth user model.
- [x] Define `idp_session` for the Better Auth session model.
- [x] Define `idp_account` for the Better Auth account model.
- [x] Define `idp_verification` for the Better Auth verification model.
- [x] Map Better Auth adapter model names to the prefixed Drizzle tables.
- [x] Add indexes and constraints required by Better Auth and Drizzle best practices.
- [x] Keep CPF, CNPJ, phone, address, company, technical-responsible, tenant membership, and business profile fields out of the IDP schema.

## Phase 6: Drizzle Kit And Migrations

- [x] Add `drizzle.config.ts` for the IDP.
- [x] Configure Drizzle Kit for PostgreSQL.
- [x] Configure schema path and migration output path under the IDP app.
- [x] Add `db:generate` package script.
- [x] Add `db:migrate` package script.
- [x] Add `db:studio` package script.
- [x] Generate the initial SQL migration for the IDP Better Auth tables.
- [x] Commit generated migration SQL and metadata.
- [x] Ensure migrations are reviewable and do not include secrets.
- [x] Confirm application startup does not run migrations automatically.

## Phase 7: Better Auth Configuration

- [x] Create a focused Better Auth integration boundary under the IDP source tree.
- [x] Configure Better Auth with the Drizzle adapter and `provider: 'pg'`.
- [x] Configure Better Auth to use the prefixed Drizzle schema/table mapping.
- [x] Enable `emailAndPassword` for the minimal email/password flow.
- [x] Configure session expiration from `AUTH_SESSION_EXPIRES_IN_SECONDS`.
- [x] Explicitly disable Better Auth cookie cache using the documented Better Auth option.
- [x] Ensure secure cookies are required outside local development.
- [x] Configure Better Auth trusted origins from `BETTER_AUTH_URL` and optional `AUTH_TRUSTED_ORIGINS`.
- [x] Avoid JWT, bearer token, localStorage, OAuth, organization, admin, 2FA, and passkey configuration in this step.
- [x] Keep Better Auth secret and URL sourced through typed config.

## Phase 8: Auth Wrapper Routes

- [x] Create an `auth` route tag under `src/entrypoint/routes`.
- [x] Add `POST /api/auth/sign-up/email` wrapper route.
- [x] Add `POST /api/auth/sign-in/email` wrapper route.
- [x] Add `POST /api/auth/sign-out` wrapper route.
- [x] Add `GET /api/auth/session` wrapper route.
- [x] Add `GET /api/auth/ok` wrapper route.
- [x] Ensure wrappers call identity use cases that call explicit Better Auth server SDK methods instead of proxying through the generic handler.
- [x] Ensure wrappers preserve Better Auth cookies, headers, and status behavior correctly.
- [x] Ensure wrappers can access `RequestContext` for future spans, canonical event enrichment, and events.
- [x] Enrich auth route canonical events with safe `auth_operation` labels only.
- [x] Do not expose a public Better Auth catch-all route unless needed internally and explicitly controlled.

## Phase 9: Auth Contracts And OpenAPI

- [x] Add stable OpenAPI tags for auth wrapper routes.
- [x] Add stable `operationId` values for auth wrapper routes.
- [x] Add request schemas for sign-up and sign-in.
- [x] Keep sign-up payload limited to `name`, `email`, and `password`.
- [x] Keep sign-in payload limited to email/password fields required by Better Auth.
- [x] Add explicit response schemas that avoid leaking session IDs, tokens, cookies, or sensitive user details.
- [x] Use synthetic non-sensitive examples.
- [x] Use `snake_case` for IDP-emitted API payload fields.
- [x] Document that existing frontend signup wizards need a later adaptation before calling this endpoint directly.

## Phase 10: Readiness Integration

- [x] Extend `/ready` to include a database dependency check.
- [x] Return `503` when the database check fails.
- [x] Keep readiness payloads non-sensitive.
- [x] Do not include connection strings, hosts, usernames, database names, provider metadata, query text, pool internals, or raw errors in readiness responses.
- [x] Keep Better Auth readiness/status separate from database readiness unless a concrete check is added safely.

## Phase 11: Logging And Security Review

- [x] Confirm auth routes do not log request bodies or response bodies.
- [x] Confirm auth routes do not log email, password, cookies, tokens, session IDs, CPF, CNPJ, or connection strings.
- [x] Confirm Pino redaction still covers auth-sensitive headers and common sensitive fields.
- [x] Confirm canonical request events stay operational and no-PII.
- [x] Confirm Better Auth internals are not reimplemented.
- [x] Confirm no localStorage auth guidance or bearer-token browser pattern is introduced.

## Phase 12: Unit Tests

- [x] Add unit tests for new environment parsing behavior.
- [x] Add unit tests for invalid secret/session/database configuration where practical.
- [x] Add unit tests for Drizzle table naming and schema ownership expectations.
- [x] Add unit tests for Better Auth config construction using mocked database boundaries.
- [x] Add unit tests for database readiness behavior using mocked checks.
- [x] Add unit tests for auth route OpenAPI metadata where useful.
- [x] Ensure unit tests do not connect to Neon or any real PostgreSQL database.

## Phase 13: Route Tests

- [x] Add `fastify.inject()` tests for auth wrapper route registration.
- [x] Add route tests for sign-up wrapper behavior using mocked Better Auth behavior.
- [x] Add route tests for sign-in wrapper behavior using mocked Better Auth behavior.
- [x] Add route tests for sign-out wrapper behavior using mocked Better Auth behavior.
- [x] Add route tests for session wrapper behavior using mocked Better Auth behavior.
- [x] Add route tests for auth ok wrapper behavior using mocked Better Auth behavior.
- [x] Add route tests for `/ready` database success and failure states using mocked database checks.
- [x] Ensure route tests do not bind real network ports.

## Phase 14: CI/CD And Deployment

- [x] Update IDP deployment workflows so migrations can run before Dokploy deploy for develop, staging, and production.
- [x] Ensure migration steps use the environment's `DATABASE_URL` secret and do not print it.
- [x] Ensure quality gates still do not require real database connectivity.
- [x] Document required GitHub Environment secrets for migration execution.
- [x] Document required Dokploy runtime environment variables for the IDP service.
- [x] Update rollback documentation to state that database migrations are not automatically rolled back.
- [x] Confirm migration execution order is package, migration, deploy, smoke check.
- [x] Confirm `/ready` smoke checks account for database readiness after deployment.

## Phase 15: Documentation And Agent Guidance

- [x] Update `apps/idp/README.md` with database, migrations, auth env vars, auth routes, and deployment migration behavior.
- [x] Update `apps/idp/AGENTS.md` with database ownership and Better Auth wrapper rules if needed.
- [x] Update `docs/idp/architecture.md` with concrete `src/database` and auth wrapper boundaries.
- [x] Update `docs/idp/security.md` with Better Auth secret, session cookie, no cookie cache, and database logging rules.
- [x] Update `docs/idp/deployment.md` with migration execution requirements and environment variables.
- [x] Update `docs/idp/testing.md` with mocked database/auth unit and route test conventions.
- [x] Update `docs/TODO.md` only for deferred items not already covered by this task plan.
- [x] Update `idp-architecture-discussion.md` after implementation and verification.

## Phase 16: Verification

- [x] Run `pnpm install` after dependency changes.
- [x] Run `pnpm --filter idp db:generate` after schema creation or changes.
- [x] Review generated migration SQL before applying it anywhere.
- [x] Run `pnpm turbo run check --filter=idp`.
- [x] Run `pnpm turbo run typecheck --filter=idp`.
- [x] Run `pnpm turbo run test:coverage --filter=idp`.
- [x] Run `pnpm turbo run build --filter=idp`.
- [x] Run `pnpm --filter idp db:migrate` against an approved development Neon database.
- [x] Start the IDP locally with approved local Neon `DATABASE_URL`.
- [ ] Confirm local `/ready` returns database-ready status.
- [ ] Confirm local `/api/auth/ok` works without exposing sensitive details.
- [ ] Manually exercise minimal sign-up, sign-in, session, and sign-out flows against a development database if approved for the implementation cycle.
- [x] Confirm logs do not expose credentials, cookies, tokens, emails, session IDs, connection strings, CPF, CNPJ, request bodies, or response bodies.

Verification note: `db:migrate` was executed against an approved development database after the UUID v7 migration reset. Full `/ready`, `/api/auth/ok`, and sign-up/sign-in/session/sign-out smoke coverage remains a pre-merge QA step unless explicitly accepted as manual local verification.

## Phase 17: Roadmap Update

- [x] Mark the Drizzle/PostgreSQL roadmap item complete in `idp-architecture-discussion.md` after implementation and verification.
- [x] Mark the minimal Better Auth email/password roadmap item complete in `idp-architecture-discussion.md` after implementation and verification.

## Phase 18: Future Enhancements

- [ ] Add email verification before granting effective access.
- [ ] Add password reset, password change, and session revocation after password changes/resets.
- [ ] Add strong password policy and compromised-password checks.
- [ ] Add real PostgreSQL integration tests after database lifecycle and CI policy are defined.
- [ ] Add event publication abstraction and emit auth identity events.
- [ ] Add Better Auth organization plugin and tenant/membership ownership.
- [ ] Add tenant domain/alias resolution from original request host.
- [ ] Add Better Auth admin and 2FA plugins in later steps.
- [ ] Define FastAPI session validation and tenant/membership lookup contracts.
- [ ] Revisit local PostgreSQL Compose if Neon-only development becomes a bottleneck.
