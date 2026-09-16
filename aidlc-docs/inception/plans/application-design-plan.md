# Application Design Plan

## Purpose

Define high-level component boundaries, component methods, services, dependencies, and orchestration patterns for the selected `apps/idp` roadmap scope.

## Context

- Requirements: `aidlc-docs/inception/requirements/requirements.md`.
- Stories: `aidlc-docs/inception/user-stories/stories.md`.
- Execution plan: `aidlc-docs/inception/plans/execution-plan.md`.
- Durable IDP architecture: `docs/idp/architecture.md`.
- Durable IDP security: `docs/idp/security.md`.
- Security Baseline: enabled, full enforcement.
- Property-Based Testing: enabled, full enforcement.

## Design Scope

- Event publication abstraction.
- Better Auth organization plugin boundary.
- Tenant and membership ownership model.
- Tenant domain/alias resolution from original request host.
- Bootstrap scripts for tenants, domains, and initial owner users.
- Database ownership and migration boundaries.
- Tests and documentation surfaces that must be supported by design.

## Proposed Design Approach

- Keep `apps/idp` as the only application package changed.
- Add concrete layers only when needed, following existing IDP architecture guidance.
- Use `src/events` for identity/tenant event publication.
- Keep Better Auth as the owner of auth and organization internals; use official APIs/plugins/hooks.
- Keep tenant/domain resolution as IDP-owned logic, but do not move business authorization into IDP.
- Keep bootstrap scripts under `apps/idp` package ownership.
- Keep PBT-focused pure helpers isolated where practical, especially host normalization, event sanitization, and bootstrap input normalization.

## Mandatory Artifacts To Generate After Approval

- [ ] Generate `aidlc-docs/inception/application-design/components.md` with component definitions and high-level responsibilities.
- [ ] Generate `aidlc-docs/inception/application-design/component-methods.md` with method signatures and high-level purposes.
- [ ] Generate `aidlc-docs/inception/application-design/services.md` with service definitions and orchestration patterns.
- [ ] Generate `aidlc-docs/inception/application-design/component-dependency.md` with dependency relationships and communication patterns.
- [ ] Generate `aidlc-docs/inception/application-design/application-design.md` as a consolidated document.
- [ ] Validate design completeness and consistency.

## Design Questions

Please answer every `[Answer]:` tag before application design artifacts are generated.

### Question 1
Where should the event publication abstraction live?

A) `apps/idp/src/events`, as a dedicated layer for identity/tenant event contracts and publishers
B) `apps/idp/src/infra/events`, as infrastructure alongside logging/request context
C) `apps/idp/src/identity/events`, scoped narrowly to auth/identity integration
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
What should the first event publisher implementation do?

A) No-op only, with tests proving calls are made through the interface
B) Structured safe logs only, using existing logger/request context without PII
C) Both: default no-op for tests plus structured-log publisher for runtime wiring where safe
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
How should tenant domain/alias data be modeled at this design level?

A) Dedicated IDP-owned tables for tenant metadata and tenant domains/aliases, linked to Better Auth organization IDs
B) Better Auth organization metadata only, storing domains/aliases in organization metadata JSON
C) A hybrid model with Better Auth organizations plus a dedicated normalized domain/alias lookup table
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 4
Which host source strategy should the design prefer?

A) Use only the standard `Host` header initially
B) Prefer trusted `X-Forwarded-Host` when present, falling back to `Host`
C) Resolve through an explicit helper that accepts configured trusted forwarded-host behavior, with local default using `Host`
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 5
Should custom public IDP HTTP endpoints be introduced in this cycle?

A) No new public endpoints unless implementation discovers a hard need
B) Yes, add tenant-resolution/status endpoints for frontend/API diagnostics
C) Only internal/server-side use cases and scripts; public API changes should wait for future frontend/FastAPI integration
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 6
How should bootstrap commands receive input?

A) CLI flags only
B) JSON config file path plus explicit CLI overrides
C) Environment variables plus CLI flags
D) Minimal CLI flags for this cycle, with config-file support deferred
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 7
How should initial owner users be handled by bootstrap design?

A) Create a new Better Auth user with a provided temporary password
B) Require an existing verified Better Auth user email and assign that user as owner
C) Support both existing user assignment and new user creation, with safer existing-user path preferred
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 8
How should active/inactive membership behavior be represented in this cycle?

A) Add explicit status field where Better Auth schema customization supports it
B) Document an extension path only; do not implement membership status until deactivation/ban flow
C) Add a separate IDP-owned membership status overlay table keyed to Better Auth member ID
X) Other (please describe after [Answer]: tag below)

[Answer]: B

### Question 9
What should be the default stance for PRD/task docs for this implementation cycle?

A) Create new durable PRD and task plan before code generation
B) Update existing roadmap/discussion docs only, no new PRD/task plan
C) Create AI-DLC artifacts only and defer `docs/initiatives/prds` / `docs/initiatives/tasks` updates until implementation is complete
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Design Generation Checklist

- [x] Load answered design questions.
- [x] Validate answers for ambiguity or contradictions.
- [x] Generate component definitions.
- [x] Generate component method signatures.
- [x] Generate service definitions and orchestration patterns.
- [x] Generate dependency relationships and communication patterns.
- [x] Generate consolidated application design.
- [x] Include Security Baseline compliance summary.
- [x] Include PBT compliance summary.
- [x] Update `aidlc-state.md` and `audit.md`.

## Approval Gate

Application design artifacts will not be generated until all design questions are answered and validated.
