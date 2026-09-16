# Tech Stack Decisions: Unit 2 Organization And Membership Model

## Existing Stack Reuse

Unit 2 reuses the existing `apps/idp` stack:

- TypeScript for Better Auth configuration and schema typing.
- Better Auth official organization plugin APIs.
- Drizzle ORM and PostgreSQL for plugin schema support.
- Drizzle migrations under `apps/idp/drizzle`.
- Vitest for example-based unit tests.
- Existing canonical request logging and global generic error handling.
- Existing Biome, typecheck, and build quality gates.

## Decision 1: Better Auth Organization Plugin

- **Decision**: Use Better Auth official organization plugin APIs with a dedicated plugin import path.
- **Rationale**: The approved functional design requires Better Auth to own organization/member internals and role semantics.
- **Rejected Alternatives**: Custom organization/member tables and temporary local abstractions are rejected because they would reimplement Better Auth behavior and increase security risk.

## Decision 2: Public Organization Creation

- **Decision**: Configure or verify public/self-service organization creation is disabled or inaccessible.
- **Rationale**: Institutional tenants must be created only by controlled server-side flows; public users cannot self-assign ownership.
- **Rejected Alternatives**: Local/development-only public creation is rejected because it creates environment drift and security test ambiguity.

## Decision 3: Organization Deletion

- **Decision**: Disable organization deletion when supported by Better Auth plugin configuration.
- **Rationale**: Organization records become future tenant linkage anchors and should not be hard-deleted without a later archival/audit design.
- **Rejected Alternatives**: Owner-controlled deletion and docs-only warnings are rejected for Unit 2.

## Decision 4: Schema And Migrations

- **Decision**: Add Better Auth organization/member plugin schema support to `apps/idp/src/database/schema.ts` and generate committed Drizzle migrations in Unit 2.
- **Rationale**: The project requires explicit, reviewable migrations and does not run migrations at application startup.
- **Rejected Alternatives**: Runtime schema creation, uncommitted Better Auth CLI-only migration behavior, and deferring organization schema to Unit 3 are rejected.

## Decision 5: Invitations And Teams

- **Decision**: Keep invitations and teams business workflows disabled/deferred.
- **Rationale**: Unit 2 scope is organization/member foundation only. Invitation UX, teams, custom roles, and dynamic access control require separate functional and NFR design.
- **Schema Note**: If Better Auth plugin schema support includes invitation objects, they may be present as plugin-owned schema support without enabling invitation business workflows.

## Decision 6: Observability

- **Decision**: Continue current canonical request-completion logs and Unit 1 event abstraction; do not add runtime logs for every Better Auth organization plugin operation.
- **Rationale**: Unit 2 prepares organization/membership support without adding log volume or sensitive output.

## Decision 7: Testing Framework

- **Decision**: Use existing Vitest example-based tests only.
- **Rationale**: Unit 2 validates configuration, schema presence, and safety constraints. It does not introduce custom property-bearing algorithms or require real PostgreSQL lifecycle in unit tests.

## Decision 8: PBT Framework

- **Decision**: Do not add a PBT framework in Unit 2.
- **Rationale**: Unit 2 relies on direct plugin configuration and example-based verification. Unit 3 remains the primary PBT owner.
- **Future Trigger**: If implementation introduces custom role/status transformation logic, PBT must be revisited before code generation completes.

## Dependency Impact

- No new package dependency is expected if Better Auth organization plugin support is available from the existing `better-auth` package.
- No new dev dependency is required for Unit 2 as currently designed.
- Drizzle migration generation may update existing migration metadata and add a new SQL migration.

## Security Compliance

- Existing Better Auth package use preserves supply-chain posture for SECURITY-10.
- Official plugin APIs preserve SECURITY-12 by avoiding custom auth/member internals.
- Explicit migration review supports SECURITY-13.
- Public creation/deletion restrictions support SECURITY-08, SECURITY-11, and SECURITY-15.

## PBT Compliance

- PBT framework selection remains deferred because PBT is N/A for Unit 2.
- Unit 3 remains expected to decide PBT setup if not already available.
