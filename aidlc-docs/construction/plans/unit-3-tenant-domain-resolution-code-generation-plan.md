# Unit 3 Code Generation Plan: Tenant Domain And Alias Resolution

## Purpose

This plan is the single source of truth for Unit 3 Code Generation. It implements tenant host resolution, tenant/domain schema, a safe public tenant status endpoint, host normalization PBT with `fast-check`, and example-based tests for resolver, route, schema, and event taxonomy behavior.

## Unit Context

- **Unit**: Unit 3: Tenant Domain And Alias Resolution.
- **Primary Story**: US-03: Resolve Tenant Context From The Original Request Host.
- **Supporting Story**: US-01 tenant/domain event taxonomy reservation only.
- **Workspace Type**: Brownfield pnpm/Turborepo monorepo.
- **Application Code Location**: `apps/idp` only.
- **Documentation Location**: `aidlc-docs/construction/unit-3-tenant-domain-resolution/code/`.
- **No Application Code In**: `aidlc-docs/`.

## Approved Implementation Shape

- Public endpoint path: `GET /tenant/status`.
- Public response: `{ "tenant_status": "available" }` or `{ "tenant_status": "unavailable" }`.
- Host source: prefer `X-Forwarded-Host`, otherwise `Host`.
- Host normalization: trim, lowercase, remove one trailing dot, remove valid port, reject malformed input.
- Schema: add IDP-owned `idp_tenant` and `idp_tenant_domain` tables.
- Lookup: single unique indexed `normalized_host` lookup plus indexed foreign keys.
- No custom cache, queue, outbox, rate limiter, durable audit storage, proxy-IP allowlist, or real PostgreSQL integration test lifecycle.
- PBT: add `fast-check` and use it only for pure host normalization/lookup-key behavior.
- Existing citizen auth flows remain unchanged.

## Dependencies And Inputs

- Unit 1 event publication foundation is complete.
- Unit 2 Better Auth organization schema and migration are complete and approved.
- Unit 3 Functional Design, NFR Requirements, and NFR Design are complete and approved.
- `fast-check` must be added as an IDP dev dependency during Code Generation.
- Drizzle owns IDP schema and migrations.
- Fastify route tests use `fastify.inject()` and do not bind real network ports.

## Target Paths

### Application And Test Code

- Modify: `apps/idp/package.json` and `pnpm-lock.yaml` through `pnpm --filter idp add -D fast-check`.
- Modify: `apps/idp/src/database/schema.ts`.
- Create: `apps/idp/src/database/tenant-domain-repository.ts`.
- Modify: `apps/idp/src/entrypoint/app.ts`.
- Modify: `apps/idp/src/entrypoint/dependencies.ts`.
- Modify: `apps/idp/src/entrypoint/routes/openapi-tags.ts`.
- Create: `apps/idp/src/entrypoint/routes/tenant/openapi.ts`.
- Create: `apps/idp/src/entrypoint/routes/tenant/index.ts`.
- Create: `apps/idp/src/entrypoint/routes/tenant/status/openapi.ts`.
- Create: `apps/idp/src/entrypoint/routes/tenant/status/route.ts`.
- Create: `apps/idp/src/usecases/tenant/host-source.ts`.
- Create: `apps/idp/src/usecases/tenant/host-normalizer.ts`.
- Create: `apps/idp/src/usecases/tenant/get-tenant-status.ts`.
- Modify: `apps/idp/src/events/identity-event-registry.ts`.
- Modify: `apps/idp/tests/unit/database/schema.test.ts`.
- Modify: `apps/idp/tests/unit/events/identity-event.test.ts`.
- Modify: `apps/idp/tests/unit/entrypoint/app.test.ts`.
- Create: `apps/idp/tests/unit/usecases/tenant/host-source.test.ts`.
- Create: `apps/idp/tests/unit/usecases/tenant/host-normalizer.test.ts`.
- Create: `apps/idp/tests/unit/usecases/tenant/host-normalizer.property.test.ts`.
- Create: `apps/idp/tests/unit/usecases/tenant/get-tenant-status.test.ts`.
- Create: `apps/idp/tests/unit/test-support/tenant-host-generators.ts`.
- Generate: `apps/idp/drizzle/<next>_*.sql`.
- Generate or update if Drizzle creates it: `apps/idp/drizzle/meta/*`.

### AI-DLC Documentation

- Create: `aidlc-docs/construction/unit-3-tenant-domain-resolution/code/code-generation-summary.md`.

## Story Traceability

| Story | Planned Coverage |
|---|---|
| US-03 | Tenant/domain schema, host source selection, host normalization, tenant resolver, public status endpoint, example tests, and PBT. |
| US-01 | Reserve tenant/domain event names and operation labels only; do not emit an event for every status endpoint call. |

## Step 1: Add PBT Dependency

- [x] Run `pnpm --filter idp add -D fast-check`.
- [x] Confirm only `apps/idp/package.json` and `pnpm-lock.yaml` dependency state changes are introduced by dependency installation.
- [x] Do not manually edit dependency versions.

## Step 2: Add Tenant And Domain Schema

- [x] Modify `apps/idp/src/database/schema.ts` in place.
- [x] Add status constants for tenant/domain status values: `active`, `pending`, `disabled`.
- [x] Add domain type constants: `primary`, `alias`.
- [x] Add `tenant` table mapped to `idp_tenant` with UUID primary key, `organization_id` FK to `idp_organization.id`, status, timestamps, and indexes.
- [x] Add `tenantDomain` table mapped to `idp_tenant_domain` with UUID primary key, `tenant_id` FK, `normalized_host`, `domain_type`, status, timestamps, globally unique `normalized_host` index, and FK index.
- [x] Keep Unit 3 tables outside `authSchema`; Better Auth adapter schema must remain plugin-owned auth models only.
- [x] Do not add business profile data fields.

## Step 3: Add Tenant Domain Repository Boundary

- [x] Create `apps/idp/src/database/tenant-domain-repository.ts`.
- [x] Define a small `TenantDomainRepository` interface with lookup by normalized host.
- [x] Implement Drizzle-backed repository using a single normalized-host lookup and tenant/domain status data.
- [x] Return only resolver-needed data: tenant status, domain status, tenant ID if internally needed, organization ID if internally needed.
- [x] Do not expose raw database rows to route handlers.

## Step 4: Add Host Source Selector

- [x] Create `apps/idp/src/usecases/tenant/host-source.ts`.
- [x] Prefer `X-Forwarded-Host` when present.
- [x] Fall back to `Host` when `X-Forwarded-Host` is absent.
- [x] Treat empty or ambiguous selected values as missing/unavailable input.
- [x] Do not log raw host values.

## Step 5: Add Pure Host Normalizer

- [x] Create `apps/idp/src/usecases/tenant/host-normalizer.ts`.
- [x] Implement deterministic normalization: trim, reject schemes/paths/query/fragments/credentials/control characters, lowercase, remove one trailing dot, remove valid port, reject invalid ports and malformed DNS labels.
- [x] Reject IP literals, wildcard hosts, localhost-only names, empty labels, overlong labels, and overlong hostnames.
- [x] Keep the normalizer pure and framework/database independent.

## Step 6: Add Tenant Status Use Case

- [x] Create `apps/idp/src/usecases/tenant/get-tenant-status.ts`.
- [x] Compose host source selector, host normalizer, tenant domain repository, and status evaluation.
- [x] Return `{ tenant_status: 'available' }` only when host, domain, and tenant are active and linked.
- [x] Return `{ tenant_status: 'unavailable' }` for normal unavailable cases.
- [x] Let unexpected internal failures use existing global error handling.
- [x] Do not add tenant requirements to existing citizen auth use cases.

## Step 7: Wire Dependencies

- [x] Modify `apps/idp/src/entrypoint/dependencies.ts` in place.
- [x] Add tenant/domain repository dependency to `AppDependencies`.
- [x] Build the Drizzle-backed tenant domain repository from the existing database client in `createAppDependencies`.
- [x] Preserve existing auth, database readiness, identity events, and close behavior.

## Step 8: Add Public Tenant Status Route

- [x] Create `apps/idp/src/entrypoint/routes/tenant/openapi.ts`.
- [x] Create `apps/idp/src/entrypoint/routes/tenant/index.ts`.
- [x] Create `apps/idp/src/entrypoint/routes/tenant/status/openapi.ts`.
- [x] Create `apps/idp/src/entrypoint/routes/tenant/status/route.ts`.
- [x] Register `GET /tenant/status`.
- [x] Define OpenAPI tag, operationId, summary, description, and explicit response schema.
- [x] Response schema must use `snake_case` and only `tenant_status` with `available|unavailable`.
- [x] Do not expose IDs, raw hosts, reason codes, domain names, or organization data.

## Step 9: Register Tenant Routes And OpenAPI Tag

- [x] Modify `apps/idp/src/entrypoint/app.ts` to register tenant routes.
- [x] Modify `apps/idp/src/entrypoint/routes/openapi-tags.ts` to include the tenant OpenAPI tag.
- [x] Preserve production OpenAPI behavior and existing operational/auth route behavior.

## Step 10: Extend Safe Event Taxonomy

- [x] Modify `apps/idp/src/events/identity-event-registry.ts` in place.
- [x] Add reserved event names: `identity.tenant.resolved`, `identity.tenant.resolution_failed`, and `identity.tenant.domain_configured`.
- [x] Add matching safe operation labels.
- [x] Do not emit an event for every public status endpoint call.
- [x] Do not add raw host or normalized host payload fields.

## Step 11: Generate Explicit Drizzle Migration

- [x] Run `pnpm --filter idp db:generate` after schema edits.
- [x] Review generated SQL under `apps/idp/drizzle`.
- [x] Confirm generated migration creates only Unit 3 tenant/domain schema support.
- [x] Confirm generated migration does not modify Better Auth organization/member plugin tables except allowed foreign-key references.
- [x] Confirm app startup remains migration-free.
- [x] Do not run `pnpm --filter idp db:migrate` during Code Generation unless explicitly approved as a deployment/schema-change action.

## Step 12: Add Schema Tests

- [x] Modify `apps/idp/tests/unit/database/schema.test.ts`.
- [x] Assert `idp_tenant` and `idp_tenant_domain` table names.
- [x] Assert Unit 3 tables are not added to `authSchema`.
- [x] Assert exported status/domain-type constants contain only approved values.

## Step 13: Add Host Source And Normalization Example Tests

- [x] Create `apps/idp/tests/unit/usecases/tenant/host-source.test.ts`.
- [x] Create `apps/idp/tests/unit/usecases/tenant/host-normalizer.test.ts`.
- [x] Cover forwarded-host precedence, host fallback, missing/ambiguous source, supported casing/trailing-dot/port variants, and representative invalid hosts.

## Step 14: Add PBT Host Generators And Property Tests

- [x] Create `apps/idp/tests/unit/test-support/tenant-host-generators.ts`.
- [x] Create `apps/idp/tests/unit/usecases/tenant/host-normalizer.property.test.ts`.
- [x] Use domain-specific `fast-check` generators for valid DNS hosts, supported variants, and invalid host shapes.
- [x] Assert normalization idempotence.
- [x] Assert valid-case stability for case, trailing dot, and valid port variants.
- [x] Assert invalid generated hosts do not produce lookup keys.
- [x] Keep shrinking enabled and do not skip PBT in CI.

## Step 15: Add Resolver Use Case Tests

- [x] Create `apps/idp/tests/unit/usecases/tenant/get-tenant-status.test.ts`.
- [x] Use mocked repository dependencies.
- [x] Cover active domain/tenant available result.
- [x] Cover unknown, malformed, pending domain, disabled domain, pending tenant, disabled tenant, and inconsistent linkage unavailable results.
- [x] Assert raw host values are not returned.

## Step 16: Add Route And App Tests

- [x] Modify `apps/idp/tests/unit/entrypoint/app.test.ts` or add a focused route test file if existing structure supports it.
- [x] Assert `GET /tenant/status` is registered.
- [x] Assert public response contains only `tenant_status`.
- [x] Assert forwarded-host and host fallback behavior through `fastify.inject()`.
- [x] Assert canonical logs do not include raw host or normalized host values.

## Step 17: Update Event Registry Tests

- [x] Modify `apps/idp/tests/unit/events/identity-event.test.ts`.
- [x] Assert reserved tenant event names and labels are present.
- [x] Assert allowed payload fields remain unchanged unless a safe field is explicitly required.

## Step 18: Create Code Generation Summary

- [x] Create `aidlc-docs/construction/unit-3-tenant-domain-resolution/code/code-generation-summary.md`.
- [x] Summarize modified files, created files, dependency addition, generated migration artifacts, and deferred scope.
- [x] Include Security Compliance and PBT Compliance summaries.
- [x] Note forwarded-host trust assumption and public endpoint rate-limit gap.
- [x] State that durable README, roadmap, and `docs/idp` updates are deferred to Unit 5 unless implementation reveals immediate doc changes are necessary.

## Step 19: Code Generation Verification

- [x] Confirm no duplicate brownfield files were created.
- [x] Confirm no `.env` files were read, printed, modified, or summarized.
- [x] Confirm no real PostgreSQL integration tests were introduced.
- [x] Run `pnpm --filter idp test`.
- [x] Run `pnpm --filter idp typecheck`.
- [x] Run `pnpm --filter idp check`.
- [x] Record verification results in the code generation summary.

## Security Compliance For This Plan

- **SECURITY-03**: Compliant. No raw host/normalized host logging and no per-lookup logs are planned.
- **SECURITY-05**: Compliant. Host validation and route response schemas are explicit planned steps.
- **SECURITY-08**: Compliant. Tenant-bound behavior fails closed and existing citizen auth flows remain unchanged.
- **SECURITY-09**: Compliant. Public response is generic and existing global error handling remains.
- **SECURITY-10**: Compliant. `fast-check` is added through pnpm and lockfile-managed workflow.
- **SECURITY-11**: Compliant. Header spoofing, duplicate aliases, endpoint abuse, and disabled statuses are covered by design/tests.
- **SECURITY-12**: Compliant. Better Auth internals are not modified.
- **SECURITY-13**: Compliant. Unique lookup keys and reviewable migrations preserve integrity.
- **SECURITY-15**: Compliant. Malformed input and internal failures fail safely.

## PBT Compliance For This Plan

- **PBT-01**: Compliant. Unit 3 properties are identified and carried into code generation.
- **PBT-02**: N/A. No round-trip transformation is planned.
- **PBT-03**: Applicable. Host normalization invariants are covered.
- **PBT-04**: Applicable. Host normalization idempotence is covered.
- **PBT-05**: N/A. No oracle/reference model is required.
- **PBT-06**: N/A. No custom stateful model is introduced.
- **PBT-07**: Applicable. Domain-specific host generators are planned.
- **PBT-08**: Applicable. `fast-check` shrinking and seed reproducibility remain enabled and CI-included.
- **PBT-09**: Compliant. `fast-check` is selected and installed during code generation.
- **PBT-10**: Compliant. PBT complements example-based resolver and route tests.

## Approval Question

How should AI-DLC proceed with Unit 3 Code Generation?

A) Approve this Code Generation plan and proceed with implementation
B) Request changes to this Code Generation plan
C) Other (please describe after [Answer]: tag below)

[Answer]: A
