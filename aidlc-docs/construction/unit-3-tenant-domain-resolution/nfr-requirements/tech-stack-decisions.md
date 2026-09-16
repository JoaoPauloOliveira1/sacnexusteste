# Tech Stack Decisions: Unit 3 Tenant Domain And Alias Resolution

## Existing Stack Reuse

Unit 3 reuses the existing `apps/idp` backend stack:

- TypeScript for resolver, route, repository, schema, and test code.
- Fastify for the public tenant status endpoint.
- Drizzle ORM and PostgreSQL for tenant/domain schema and migrations.
- Vitest for example-based unit and route tests.
- Biome and TypeScript quality gates.
- Existing canonical request logging and generic global error handling.

## Decision 1: Host Normalization Implementation

- **Decision**: Implement host normalization as a pure TypeScript function.
- **Rationale**: Pure logic supports deterministic behavior, PBT, and straightforward example-based tests.
- **Rejected Alternatives**: Normalizing inside route handlers or repository queries is rejected because it scatters validation and makes PBT harder.

## Decision 2: Tenant Resolver Boundary

- **Decision**: Keep tenant resolver logic separate from Fastify route handlers and database persistence.
- **Rationale**: This matches IDP layering and enables unit tests with mocked repository/database boundaries.
- **Rejected Alternatives**: Route-only logic and direct DB calls in route handlers are rejected.

## Decision 3: Database And Indexing

- **Decision**: Use Drizzle/PostgreSQL with a unique `normalized_host` index and indexed foreign keys.
- **Rationale**: The resolver needs efficient single-key lookup and deterministic duplicate prevention.
- **Rejected Alternatives**: JSON/array alias storage and duplicate active-row resolution are rejected because they reduce queryability and create ambiguity.

## Decision 4: No Caching In Unit 3

- **Decision**: Do not add process-local cache, Redis, or secondary storage.
- **Rationale**: A unique indexed lookup is sufficient for the initial unit and avoids invalidation complexity.
- **Rejected Alternatives**: Immediate in-memory or external caching is rejected until measured need appears.

## Decision 5: Public Endpoint Error Shape

- **Decision**: Public tenant status responses expose only `available` or `unavailable`.
- **Rationale**: Generic responses avoid tenant enumeration and infrastructure leakage.
- **Rejected Alternatives**: Detailed reason codes in local/development or all environments are rejected because behavior drift and diagnostics can leak sensitive classification.

## Decision 6: Forwarded Host Trust

- **Decision**: Document forwarded-host trust as an ingress/proxy sanitization assumption and test IDP header selection.
- **Rationale**: The functional design approved `X-Forwarded-Host` preference without adding proxy IP allowlisting.
- **Rejected Alternatives**: IDP-managed trusted proxy IP allowlisting and disabling forwarded-host support are deferred/rejected for Unit 3.

## Decision 7: PBT Framework

- **Decision**: Add `fast-check` as an IDP dev dependency during Unit 3 Code Generation.
- **Rationale**: `fast-check` supports custom generators, shrinking, seed-based reproducibility, and Vitest integration for TypeScript.
- **Package Command**: Use `pnpm --filter idp add -D fast-check` during approved Code Generation.
- **Rejected Alternatives**: Manual randomized Vitest tests and deferring PBT framework selection are rejected because PBT is enabled and Unit 3 owns host normalization properties.

## Decision 8: PBT Scope

- **Decision**: Use PBT only for pure host normalization and lookup-key behavior.
- **Rationale**: PBT is strongest for pure deterministic functions and should not make route/database tests flaky.
- **Rejected Alternatives**: PBT for route/database I/O and PBT replacing example-based tests are rejected.

## Decision 9: Test Strategy

- **Decision**: Use Vitest example-based tests with mocked repository/database boundaries, plus schema/migration tests and PBT for pure functions.
- **Rationale**: This keeps Unit 3 fast and deterministic without introducing real PostgreSQL lifecycle management.
- **Rejected Alternatives**: Real PostgreSQL integration tests in Unit 3 and route-only tests are rejected.

## Decision 10: Documentation Timing

- **Decision**: Defer durable README, roadmap, and `docs/idp` updates to Unit 5, while requiring Unit 3 code-generation summary to document behavior and gaps.
- **Rationale**: Unit 5 owns documentation and roadmap finalization after dependent implementation units are verified.
- **Required Summary Notes**: Tenant resolver behavior, PBT scope, forwarded-host trust assumption, and public endpoint rate-limit gap.

## Dependency Impact

- Add `fast-check` as a dev dependency in Unit 3 Code Generation.
- No runtime dependency additions are expected.
- No cache or infrastructure dependencies are introduced.
- Drizzle migration generation will add tenant/domain schema migration artifacts.

## Security Compliance

- **SECURITY-03**: Existing logging stack is reused without raw host logging by default.
- **SECURITY-05**: Host validation is implemented as explicit pure logic and endpoint response schema.
- **SECURITY-08**: Resolver fail-closed behavior is isolated and testable.
- **SECURITY-09**: Generic public response shape prevents diagnostic leakage.
- **SECURITY-10**: `fast-check` must be added through pnpm and lockfile-managed dependency workflow.
- **SECURITY-11**: Resolver and host trust boundaries remain isolated and misuse-tested.
- **SECURITY-13**: Unique normalized host keys support data integrity.
- **SECURITY-15**: Invalid input and internal failures fail safely.

## PBT Compliance

- **PBT-09**: Compliant. `fast-check` is selected and must be added to IDP dev dependencies.
- **PBT-07**: Future code generation must define domain-specific host generators.
- **PBT-08**: Future build/test instructions must preserve seed and shrinking reproducibility.
- **PBT-10**: Example tests remain required for critical route and resolver scenarios.
