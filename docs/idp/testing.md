# IDP Testing

This document records durable testing guidance for `apps/idp`.

## Test Scopes

Unit tests live under `apps/idp/tests/unit`.

Integration tests will live under `apps/idp/tests/integration` when database, Better Auth, or multi-component flows are introduced.

## Unit Tests

Unit tests should be fast and isolated.

- Do not bind real network ports.
- Do not require PostgreSQL.
- Do not require Better Auth storage.
- Do not call external services.
- Do not send real emails or call Resend from automated unit tests.
- Use Fastify app creation plus `app.ready()` and `app.close()` for app boot tests.
- Use `fastify.inject()` through `createApp()` for route-level tests.
- Test pure config, policies, helpers, and use cases directly.
- Mock database and Better Auth boundaries for unit and route tests.
- Mock email provider boundaries and validate React Email templates through rendering or template construction tests.

## Route Tests

Route tests should verify status codes, response payloads, headers, and OpenAPI metadata without binding network ports.

Operational route tests should cover `/health`, `/ready`, request ID propagation, `x-correlation-id` fallback, one canonical event per request, non-production OpenAPI availability, and production OpenAPI disablement.

Auth wrapper route tests should verify that wrappers preserve cookies/headers, enrich canonical events with safe `auth_operation` values through identity use cases, return sanitized `snake_case` payloads, and do not expose session tokens or session IDs. Identity use case tests may verify direct delegation to the intended Better Auth server SDK boundary.

Email verification, verification resend, password reset, and password change route tests should use mocked Better Auth/email boundaries. Password reset request and verification resend tests should assert generic responses that do not reveal account existence.

OpenAPI route tests should verify stable `operationId`, tags, summaries, named component schemas, and `$ref` response schemas when those contracts are part of the endpoint standard.

Tenant route tests should verify `GET /tenant/status` returns only `available` or `unavailable`, prioritizes `X-Forwarded-Host` over `Host`, fails safely for malformed/unknown/pending/disabled states, and does not log raw hosts or expose tenant/domain details.

Bootstrap tests should cover parser behavior, required flags, the `pnpm` `--` separator, invalid domains, duplicate normalized domains, safe output redaction, successful setup with controlled fakes, idempotent reruns, domain conflicts, existing owner users, already-satisfied owner membership, and membership failure without success output.

## Property-Based Tests

Unit 3 uses `fast-check` for property-based host normalization tests. Those tests cover normalization invariants and idempotence with domain-specific host generators.

Property-based tests complement example-based route and use-case tests; they do not replace them. Unit 4 bootstrap orchestration is covered by example-based tests and is not currently property-tested.

## Integration Tests

Integration tests are intentionally deferred even though the IDP now has persistence and Better Auth wiring. The current policy is to avoid real PostgreSQL/Neon access in CI until database lifecycle, cleanup, isolation, secrets, and cost are explicitly defined.

When introduced, choose the database strategy explicitly. Candidate options include testcontainers, a local Docker Compose PostgreSQL service, or a dedicated test database managed by setup scripts.

## Commands

- Unit tests: `pnpm --filter idp test`
- Coverage: `pnpm --filter idp test:coverage`
- Watch mode: `pnpm --filter idp test:watch`

Database migration commands are operational commands, not unit-test setup:

- Generate migrations: `pnpm --filter idp db:generate`
- Apply migrations: `pnpm --filter idp db:migrate`

Root monorepo test commands should keep working through Turborepo.

Real Resend delivery should be verified only as a manual smoke test in an approved environment with a verified sender/domain.

## Manual Smoke Checks

After migrations and tenant bootstrap have been completed in an approved environment, tenant status can be checked with synthetic examples such as:

```bash
curl -H "Host: tenant.example.test" http://127.0.0.1:3001/tenant/status
```

The response should be only `{"tenant_status":"available"}` for configured active tenant domains, or `{"tenant_status":"unavailable"}` otherwise.

Tenant bootstrap can be manually exercised with synthetic values:

```bash
pnpm --filter idp bootstrap:tenant -- --name "SAC Nexus Example" --slug sac-nexus-example --domain tenant.example.test --owner-email owner@example.test --owner-name "Owner Example" --temporary-password "REPLACE_TEMPORARY_PASSWORD"
```

Manual smoke-test notes must not include real emails, temporary passwords, raw domains from production, internal IDs, tokens, cookies, SQL, connection strings, or raw errors.

## Documentation Verification

Documentation-only changes should still be reviewed for safety. Inspect changed docs for real secrets, real credentials, realistic personal emails, CPF, CNPJ, tokens, cookies, session IDs, SQL parameters, production URLs, and production connection strings.

Roadmap completion marks should be backed by implementation summaries and verification evidence. Known gaps should remain visible instead of being reframed as completed behavior.
