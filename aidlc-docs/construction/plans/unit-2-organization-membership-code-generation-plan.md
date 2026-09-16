# Unit 2 Code Generation Plan: Organization And Membership Model

## Purpose

This plan is the single source of truth for Unit 2 Code Generation. It implements Better Auth organization plugin support, organization/member schema mapping, explicit migration artifacts, and example-based tests while preserving citizen auth behavior and Better Auth official boundaries.

## Unit Context

- **Unit**: Unit 2: Better Auth Organization And Membership Model.
- **Primary Story**: US-02: Model Institutional Tenants And Memberships In The IDP.
- **Supporting Story**: US-01 event taxonomy extension points only, no runtime per-plugin instrumentation.
- **Workspace Type**: Brownfield pnpm/Turborepo monorepo.
- **Application Code Location**: `apps/idp` only.
- **Documentation Location**: `aidlc-docs/construction/unit-2-organization-membership-model/code/`.
- **No Application Code In**: `aidlc-docs/`.

## Dependencies And Inputs

- Unit 1 event publication foundation is complete.
- Unit 2 Functional Design is complete.
- Unit 2 NFR Requirements are complete.
- Unit 2 NFR Design is complete and approved.
- Better Auth organization plugin is available from existing `better-auth` dependency.
- Drizzle owns IDP schema and migrations.
- Existing Vitest unit tests are the approved test framework.

## Design Constraints

- Use Better Auth official organization plugin APIs.
- Do not reimplement organization, member, role, session, credential, cookie, or token internals.
- Disable public/self-service organization creation in every environment.
- Disable organization deletion through supported plugin configuration.
- Do not add tenant metadata or tenant domain/alias tables; Unit 3 owns those.
- Do not add invitation UX, teams, custom roles, dynamic access control, bootstrap CLI, frontend organization UI, caches, queues, outbox, or per-plugin-operation logs.
- Citizen auth flows must not perform custom organization/member lookups.
- Migrations must be explicit and reviewable; app startup must not run migrations.
- PBT remains N/A unless implementation introduces custom role/status transformation logic.

## Target Paths

### Application Code

- Modify: `apps/idp/src/identity/auth.ts`
- Modify: `apps/idp/src/database/schema.ts`
- Modify: `apps/idp/src/events/identity-event-registry.ts`
- Modify: `apps/idp/tests/unit/identity/auth.test.ts`
- Modify: `apps/idp/tests/unit/database/schema.test.ts`
- Modify: `apps/idp/tests/unit/events/identity-event.test.ts`
- Generate: `apps/idp/drizzle/<next>_*.sql`
- Generate or update if Drizzle creates it: `apps/idp/drizzle/meta/*`

### AI-DLC Documentation

- Create: `aidlc-docs/construction/unit-2-organization-membership-model/code/code-generation-summary.md`

## Story Traceability

| Story | Planned Coverage |
|---|---|
| US-02 | Configure Better Auth organization plugin, add organization/member schema mapping, generate migration, test safety constraints. |
| US-01 | Reserve safe organization/member event names and operation labels only; no runtime event emission unless concrete Unit 2 operations are introduced. |

## Step 1: Confirm Installed Better Auth Plugin Contract

- [x] Inspect the installed Better Auth organization plugin contract and schema expectations for `better-auth@1.6.11` before editing code.
- [x] Confirm supported server options include `allowUserToCreateOrganization` and `disableOrganizationDeletion`.
- [x] Confirm required plugin schema objects and fields for organization, member, and invitation support.
- [x] Do not proceed with schema edits if installed package behavior conflicts with approved design; document the conflict and request clarification.

## Step 2: Configure Organization Plugin

- [x] Modify `apps/idp/src/identity/auth.ts` in place.
- [x] Import `organization` from the official Better Auth plugin path supported by the installed package.
- [x] Add the organization plugin to `betterAuth({ plugins: [...] })`.
- [x] Set `allowUserToCreateOrganization: false`.
- [x] Set `disableOrganizationDeletion: true` if supported by the installed plugin version.
- [x] Do not configure teams, custom roles, dynamic access control, invitation email delivery, or client organization plugins.
- [x] Do not add custom membership checks to citizen auth flows.

## Step 3: Add Organization Schema Mapping

- [x] Modify `apps/idp/src/database/schema.ts` in place.
- [x] Add Better Auth organization plugin schema tables using existing IDP naming conventions.
- [x] Use IDP-prefixed table names: `idp_organization`, `idp_member`, and `idp_invitation` if invitation schema is required by the official plugin.
- [x] Use UUID primary/foreign keys where Better Auth ID generation and existing IDP schema require UUID v7 persisted IDs.
- [x] Map Better Auth adapter model names to prefixed Drizzle tables in `authSchema`.
- [x] Preserve existing `idp_user`, `idp_session`, `idp_account`, and `idp_verification` schema behavior.
- [x] Do not add `idp_tenant`, tenant metadata, domain, alias, or membership status extension tables.

## Step 4: Extend Safe Event Taxonomy

- [x] Modify `apps/idp/src/events/identity-event-registry.ts` in place only if needed for the approved reserved taxonomy.
- [x] Add reserved event names for `identity.organization.configured`, `identity.organization.member_added`, and `identity.organization.owner_assigned`.
- [x] Add matching safe operation labels if event names are added.
- [x] Do not add runtime event emission for Better Auth plugin internals.
- [x] Do not add event payload fields containing emails, request bodies, response bodies, cookies, tokens, session IDs, domain profile data, or raw Better Auth responses.

## Step 5: Generate Explicit Drizzle Migration

- [x] Run `pnpm --filter idp db:generate` after schema edits.
- [x] Review generated SQL under `apps/idp/drizzle`.
- [x] Confirm generated migration creates only Unit 2 plugin schema support.
- [x] Confirm generated migration does not include tenant metadata or tenant domain/alias tables.
- [x] Confirm app startup remains migration-free.
- [x] Do not run `pnpm --filter idp db:migrate` during Code Generation unless explicitly approved as a deployment/schema-change action.

## Step 6: Update Auth Configuration Tests

- [x] Modify `apps/idp/tests/unit/identity/auth.test.ts` in place.
- [x] Assert the organization plugin is configured.
- [x] Assert public/self-service organization creation is disabled in all environments, including `local`.
- [x] Assert organization deletion is disabled where supported.
- [x] Assert existing email/password, session, trusted origin, UUID v7, and secure cookie expectations remain intact.
- [x] Assert no custom membership lookup is required for citizen auth configuration.

## Step 7: Update Schema Tests

- [x] Modify `apps/idp/tests/unit/database/schema.test.ts` in place.
- [x] Assert IDP-prefixed organization/member table names.
- [x] Assert invitation table name if the official plugin requires invitation schema support.
- [x] Assert `authSchema` maps Better Auth model names to the prefixed Drizzle tables.
- [x] Assert no Unit 3 tenant/domain schema objects are introduced.

## Step 8: Update Event Registry Tests

- [x] Modify `apps/idp/tests/unit/events/identity-event.test.ts` in place only if Step 4 adds reserved event names or operation labels.
- [x] Assert reserved organization/member event names and labels are present.
- [x] Assert allowed payload fields remain unchanged unless a safe Unit 2 field is explicitly needed.
- [x] Preserve existing event safety tests.

## Step 9: Create Code Generation Summary

- [x] Create `aidlc-docs/construction/unit-2-organization-membership-model/code/code-generation-summary.md`.
- [x] Summarize modified files, generated migration artifacts, and deferred scope.
- [x] Include Security Compliance and PBT Compliance summaries.
- [x] State whether durable README, `AGENTS.md`, PRD/task docs, durable docs, or backlog updates are needed now or deferred to Unit 5.

## Step 10: Code Generation Verification Preparation

- [x] Confirm no duplicate brownfield files were created.
- [x] Confirm no `.env` files were read, printed, modified, or summarized.
- [x] Confirm no new dependencies were added unless required by installed Better Auth behavior and approved separately.
- [x] Prepare these commands for the Build and Test stage: `pnpm --filter idp test`, `pnpm --filter idp typecheck`, and `pnpm --filter idp check`.
- [x] If quick local verification is run during Code Generation, record results in the code generation summary without replacing the later Build and Test stage.

## Security Compliance For This Plan

- **SECURITY-01**: N/A. No infrastructure storage resource is created by the plan.
- **SECURITY-02**: N/A. No network intermediary is created by the plan.
- **SECURITY-03**: Compliant. Existing canonical logging is preserved and no per-plugin-operation logs are added.
- **SECURITY-04**: N/A. No HTML-serving endpoints are added by the plan.
- **SECURITY-05**: Compliant. No new custom API input-processing endpoint is added.
- **SECURITY-06**: N/A. No IAM policy is created by the plan.
- **SECURITY-07**: N/A. No network configuration is created by the plan.
- **SECURITY-08**: Compliant. Public organization creation and owner self-assignment remain disabled/inaccessible.
- **SECURITY-09**: Compliant. Existing generic error behavior remains unchanged.
- **SECURITY-10**: Compliant. No new dependency is expected; lockfile-managed existing Better Auth package is reused.
- **SECURITY-11**: Compliant. Plugin configuration stays isolated at the Better Auth boundary and misuse cases are tested.
- **SECURITY-12**: Compliant. Better Auth auth and organization internals are not reimplemented.
- **SECURITY-13**: Compliant. Explicit migrations and stable organization IDs support future integrity and auditability.
- **SECURITY-14**: N/A for Unit 2 Code Generation. No alerting infrastructure is added in this unit.
- **SECURITY-15**: Compliant. Organization ownership fails closed and global generic error handling is preserved.

## PBT Compliance For This Plan

- **PBT-01**: Compliant. Unit 2 Functional Design identified no PBT properties under direct plugin configuration.
- **PBT-02**: N/A. No round-trip transformation is planned.
- **PBT-03**: N/A. No custom invariant-bearing transformation is planned.
- **PBT-04**: N/A. No custom idempotent transformation is planned.
- **PBT-05**: N/A. No oracle/reference model target is planned.
- **PBT-06**: N/A. No custom stateful model is planned.
- **PBT-07**: N/A. No PBT generators are needed for Unit 2.
- **PBT-08**: N/A. No PBT execution is introduced in Unit 2.
- **PBT-09**: Deferred to Unit 3 or later applicable NFR stage.
- **PBT-10**: Compliant. Critical Unit 2 behavior is covered with example-based Vitest tests.

## Approval Question

How should AI-DLC proceed with Unit 2 Code Generation?

A) Approve this Code Generation plan and proceed with implementation
B) Request changes to this Code Generation plan
C) Other (please describe after [Answer]: tag below)

[Answer]: A
