# Code Generation Summary: Unit 3 Tenant Domain And Alias Resolution

## Outcome

Unit 3 Code Generation implemented tenant host resolution for the IDP with a safe public status endpoint, tenant/domain schema, deterministic host normalization, and property-based tests using `fast-check`.

## Dependency Changes

- Added `fast-check` as an IDP dev dependency through `pnpm --filter idp add -D fast-check`.
- Updated `apps/idp/package.json`.
- Updated `pnpm-lock.yaml`.

## Modified Application Files

- `apps/idp/src/database/schema.ts`
  - Added `tenantStatuses`, `tenantDomainStatuses`, and `tenantDomainTypes` constants.
  - Added `idp_tenant` schema linked to `idp_organization.id`.
  - Added `idp_tenant_domain` schema with global unique `normalized_host` index and tenant FK index.
  - Kept Unit 3 tables outside `authSchema`.
- `apps/idp/src/entrypoint/app.ts`
  - Registered tenant routes.
- `apps/idp/src/entrypoint/dependencies.ts`
  - Added tenant domain repository dependency wiring.
- `apps/idp/src/entrypoint/routes/openapi-tags.ts`
  - Added tenant OpenAPI tag.
- `apps/idp/src/events/identity-event-registry.ts`
  - Reserved tenant event names and labels.
- `apps/idp/tests/unit/database/schema.test.ts`
  - Added tenant/domain table and constant assertions.
- `apps/idp/tests/unit/events/identity-event.test.ts`
  - Added tenant event taxonomy assertions.
- `apps/idp/tests/unit/entrypoint/app.test.ts`
  - Added tenant status route tests and canonical-log safety assertion.

## Created Application Files

- `apps/idp/src/database/tenant-domain-repository.ts`
- `apps/idp/src/entrypoint/routes/tenant/openapi.ts`
- `apps/idp/src/entrypoint/routes/tenant/index.ts`
- `apps/idp/src/entrypoint/routes/tenant/status/openapi.ts`
- `apps/idp/src/entrypoint/routes/tenant/status/route.ts`
- `apps/idp/src/usecases/tenant/host-source.ts`
- `apps/idp/src/usecases/tenant/host-normalizer.ts`
- `apps/idp/src/usecases/tenant/get-tenant-status.ts`
- `apps/idp/tests/unit/usecases/tenant/host-source.test.ts`
- `apps/idp/tests/unit/usecases/tenant/host-normalizer.test.ts`
- `apps/idp/tests/unit/usecases/tenant/host-normalizer.property.test.ts`
- `apps/idp/tests/unit/usecases/tenant/get-tenant-status.test.ts`
- `apps/idp/tests/unit/test-support/tenant-host-generators.ts`

## Generated Migration Artifacts

- `apps/idp/drizzle/0002_wide_rafael_vega.sql`
- `apps/idp/drizzle/meta/0002_snapshot.json`
- `apps/idp/drizzle/meta/_journal.json`

The generated migration creates only Unit 3 tenant/domain schema support:

- `idp_tenant`
- `idp_tenant_domain`

It does not modify Better Auth organization/member plugin tables except by referencing `idp_organization.id` through a foreign key.

## Public Endpoint

- `GET /tenant/status`

Response shape:

```json
{ "tenant_status": "available" }
```

or:

```json
{ "tenant_status": "unavailable" }
```

The response does not expose tenant IDs, organization IDs, domains, aliases, raw hosts, request headers, reason codes, SQL details, or internal errors.

## Verification

- `pnpm --filter idp db:generate`: passed and generated `0002_wide_rafael_vega.sql`.
- `pnpm --filter idp db:migrate`: passed after explicit user approval. Output included only a Node `DEP0205` deprecation warning from `tsx`/module registration.
- `pnpm --filter idp test`: passed, 18 files and 93 tests.
- `pnpm --filter idp typecheck`: passed.
- `pnpm --filter idp check`: passed.

## Deferred Scope And Gaps

- Applying the Unit 3 migration was completed after explicit approval.
- Durable README, roadmap, and `docs/idp` updates remain deferred to Unit 5 unless requested sooner.
- Forwarded-host trust remains a deployment/ingress sanitization assumption.
- The public tenant status endpoint rate-limit gap is documented for later infrastructure/edge design.
- No custom cache, proxy IP allowlist, distributed rate limiter, durable audit table, queue, outbox, or real PostgreSQL integration-test lifecycle was added.

## Security Compliance

- **SECURITY-03**: Compliant. No raw host/normalized host logging and no per-lookup logs were added.
- **SECURITY-05**: Compliant. Host validation and route response schemas are explicit.
- **SECURITY-08**: Compliant. Tenant-bound behavior fails closed and existing citizen auth flows remain unchanged.
- **SECURITY-09**: Compliant. Public response is generic and existing global error handling remains.
- **SECURITY-10**: Compliant. `fast-check` was added through pnpm and lockfile-managed workflow.
- **SECURITY-11**: Compliant. Header spoofing, duplicate aliases, endpoint abuse, and disabled statuses are covered by design/tests.
- **SECURITY-12**: Compliant. Better Auth internals were not modified.
- **SECURITY-13**: Compliant. Unique lookup keys and reviewable migrations preserve integrity.
- **SECURITY-15**: Compliant. Malformed input and internal failures fail safely.

## PBT Compliance

- **PBT-01**: Compliant. Unit 3 properties were carried into code generation.
- **PBT-03**: Compliant. Host normalization invariants are covered.
- **PBT-04**: Compliant. Host normalization idempotence is covered.
- **PBT-07**: Compliant. Domain-specific host generators were added.
- **PBT-08**: Compliant. `fast-check` shrinking remains enabled and PBT is included in the normal test suite.
- **PBT-09**: Compliant. `fast-check` is installed as the TypeScript/Vitest PBT framework.
- **PBT-10**: Compliant. PBT complements example-based resolver and route tests.
