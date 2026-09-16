# IDP App Agent Instructions

## Stack

- Fastify is the HTTP framework.
- TypeScript must stay strict.
- `tsx` is used for local development.
- `tsc` emits production JavaScript to `dist`.
- Zod validates runtime environment configuration.
- Drizzle ORM owns IDP PostgreSQL schema and migrations.
- Better Auth owns user, credential, session, cookie, and auth security internals.
- Resend sends transactional auth emails.
- React Email owns local reusable transactional email templates.
- Vitest is the unit test runner.
- Biome is the formatter, linter, and import organizer.

## Architecture

- `src/server.ts` is the executable entrypoint.
- `src/config` owns environment parsing and runtime configuration.
- `src/database` owns Drizzle schema, PostgreSQL client setup, migration runner, and database readiness checks.
- `src/entrypoint` owns Fastify app composition, plugins, routes, and transport concerns.
- `src/infra/http` owns HTTP infrastructure helpers such as request ID resolution.
- `src/infra/logging` owns logger redaction config and canonical event helpers.
- `src/infra/request-context` owns the explicit `RequestContext` passed into use cases.
- `src/usecases/<context>/<operation>.ts` owns application behavior by route context and operation, such as `src/usecases/operational/get-health.ts`.
- `src/usecases/dependencies` owns small default dependencies such as `clock`; use cases import only the defaults they need and may accept explicit overrides for tests or future composition.
- `src/identity` owns Better Auth configuration and auth engine integration boundaries.
- `src/identity/emails` owns local React Email templates for IDP auth emails.
- Keep use cases Fastify-agnostic: route handlers should call named use case functions, such as `getHealth`, without framework-specific dependency wiring unless a concrete Fastify-managed resource needs it.
- Use `@/*` imports for source-root imports.
- Add `src/usecases` only when a real application action exists.
- Add database, identity, events, and shared layers only when concrete code needs them.
- Avoid empty folders and placeholder abstractions.
- Keep business/domain authorization out of the IDP unless the PRD explicitly assigns it to IDP-owned roles or permissions.
- Keep IDP-owned tables explicitly prefixed with `idp_`; business services must not write directly to those tables.
- Use UUID v7 for persisted IDP entity IDs and PostgreSQL `uuid` columns for primary/foreign keys.
- Generate and review Drizzle migrations under `apps/idp/drizzle`; never run migrations automatically during application startup.

## Routes And OpenAPI

- Group routes by OpenAPI tag under `src/entrypoint/routes/<tag>`.
- Keep tag metadata in `src/entrypoint/routes/<tag>/openapi.ts`.
- Keep each operation under `src/entrypoint/routes/<tag>/<operation>`.
- Keep route registration in `<operation>/route.ts` files.
- Keep route schemas and OpenAPI operation objects in `<operation>/openapi.ts` files.
- Keep reusable OpenAPI examples and shared property schemas under `src/entrypoint/openapi`.
- Export route options as `{ schema: ... }` objects so route handlers stay focused on transport and use case calls.
- Aggregate tag definitions in `src/entrypoint/routes/openapi-tags.ts` for the root OpenAPI plugin.
- Every custom endpoint must define stable `operationId`, `tags`, `summary`, `description`, and explicit response schemas.
- Auth wrapper routes under `/api/auth/*` are custom IDP endpoints and must call identity use cases. Identity use cases call explicit Better Auth server SDK methods; routes preserve Better Auth cookies/headers and sanitize public response payloads.
- Use named reusable schemas with `$id`, `title`, `description`, field descriptions, and safe examples when response shapes are reused or client-facing.
- Use `snake_case` for emitted API payload fields and log event fields.
- Keep Swagger UI and `/openapi.json` disabled in `IDP_APP_ENV=production` unless a future PRD approves a production exposure policy.

## Testing

- Unit tests live under `tests/unit` and should mirror source layers.
- Future integration tests belong under `tests/integration`.
- Use Fastify app creation and `app.ready()` for unit-level boot tests.
- Use `fastify.inject()` for route-level tests; do not bind real network ports.
- Do not bind real network ports in unit tests.
- Do not add database, Better Auth, or external service dependencies to unit tests.
- Mock database and Better Auth boundaries in unit/route tests unless an explicit integration-test PRD introduces real PostgreSQL lifecycle management.

## Security

- Do not commit secrets or realistic credentials.
- Keep `.env.example` limited to placeholders, never real secrets or realistic credentials.
- Never read, grep, print, summarize, or modify `apps/idp/.env`; use `apps/idp/.env.example` only.
- Read `process.env` only in `src/config/env.ts`.
- Do not log credentials, cookies, tokens, OTPs, backup codes, or sensitive personal data.
- Do not log CPF, CNPJ, email, raw query strings, request bodies, or response bodies by default.
- Use `x-request-id` as the canonical request ID, with `x-correlation-id` only as an inbound fallback.
- Create request context in the entrypoint layer and pass it explicitly into use cases that need request-scoped context.
- Emit routine canonical request lifecycle events only from the entrypoint layer after the response completes.
- Keep canonical events limited to safe operational fields and safe auth operation labels unless a future PRD explicitly expands them.
- Use `snake_case` for all data emitted by the IDP, including logs and API payloads.
- Do not introduce localStorage-based auth guidance or patterns.
- Do not reimplement Better Auth cryptographic, password, session, cookie, or token internals.
- Do not log `DATABASE_URL`, `BETTER_AUTH_SECRET`, passwords, cookies, session tokens, session IDs, or raw Better Auth responses.
- Do not log `RESEND_API_KEY`, email bodies, rendered email HTML, verification URLs, reset URLs, or raw email provider responses.
- Auth emails may include first name when available, but must not include CPF, CNPJ, process data, tenant-sensitive context, internal IDs, tokens, or session IDs.
- Keep Better Auth cookie cache disabled unless a future PRD explicitly changes the session strategy.

## Package Management

- Use `pnpm --filter idp add` for runtime dependencies.
- Use `pnpm --filter idp add -D` for development dependencies.
- Do not manually edit dependency versions when pnpm can manage them.
- Keep scripts package-level and let root scripts delegate through Turborepo.
- Keep database scripts package-level: `db:generate`, `db:migrate`, and `db:studio`.
- Keep `tsc-alias` in the production build when using `@/*` imports, because Node does not understand TypeScript `paths` at runtime.

## CI/CD

- Use GitHub Actions, pnpm, and Turborepo for IDP CI/CD automation.
- Use `pnpm turbo run <task> --filter=idp` in CI instead of direct package-manager task calls.
- Use shared gate names in `snake_case`: `idp_quality`, `idp_security`, `idp_package`, `idp_deploy_<env>`, and `idp_rollback_production`.
- Keep IDP Docker images environment-agnostic and non-root at runtime.
- Keep Dokploy variables and secrets app-scoped, such as `IDP_DEVELOP_URL` and `DOKPLOY_IDP_DEVELOP_WEBHOOK_URL`.
- IDP deploy workflows must smoke check `/health` and `/ready` after Dokploy deploy or rollback.
- IDP deploy workflows must run `pnpm --filter idp db:migrate` before Dokploy deploy. Rollbacks do not automatically roll back database migrations.
- Do not merge the IDP and web Dokploy stacks unless a future PRD explicitly approves full-stack routing changes.

## Useful Local Skills

- `sac-nexus-architecture`
- `sac-nexus-initiative-workflow`
- `sac-nexus-idp-development`
- `sac-nexus-preflight-review`
- `sac-nexus-pr-review-triage`
- `fastify-best-practices`
- `vitest`
- `turborepo`
- `better-auth-best-practices`
- `email-and-password-best-practices`
- `organization-best-practices`
- `two-factor-authentication-best-practices`
- `postgres-drizzle`
- `observability-guidelines`
- `ci-cd-and-automation`
- `github-actions-docs`
- `react-email`
- `resend`
