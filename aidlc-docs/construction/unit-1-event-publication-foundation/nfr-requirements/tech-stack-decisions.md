# Tech Stack Decisions: Unit 1 Event Publication Foundation

## Existing Stack Reuse

Unit 1 reuses the existing `apps/idp` stack:

- TypeScript for event contracts and publisher interface.
- Fastify route/use-case structure already present in the IDP.
- Better Auth official APIs remain the auth boundary.
- Vitest for unit and route/use-case tests.
- Existing structured logging and canonical request event pattern.
- Existing Biome/typecheck/build quality gates.

## Decision 1: Event Publisher Implementation

- **Decision**: Use a no-op publisher implementation for Unit 1.
- **Rationale**: The approved scope is to add a stable event seam without durable audit infrastructure, queues, outbox, or external calls.
- **Rejected Alternatives**: Structured-log publisher and durable persistence are deferred to future units/tasks.

## Decision 2: Event Registry

- **Decision**: Add a central code-level registry for event names, operation labels, outcomes, and allowed payload fields.
- **Rationale**: Central registry improves maintainability, prevents arbitrary inline event names, and prepares future audit/event worker integration.
- **Rejected Alternatives**: Local event names in each use case are rejected because they increase drift and contract ambiguity.

## Decision 3: Testing Framework

- **Decision**: Use existing Vitest only for Unit 1.
- **Rationale**: Unit 1 uses simple event contract and no-op publisher behavior. No new PBT framework is required unless implementation introduces non-trivial transformations.
- **Test Doubles**: Use publisher test doubles to verify use cases publish expected events.

## Decision 4: Sensitive Data Test Helper

- **Decision**: Add a reusable test assertion helper for forbidden keys and representative forbidden values.
- **Rationale**: This preserves the approved Functional Design and reduces duplicated assertions across auth-flow event tests.
- **Scope**: Test-only helper. It is not a runtime sanitizer unless later design changes.

## Decision 5: Observability

- **Decision**: Continue using current structured request-completion logs; do not emit runtime logs for every no-op event.
- **Rationale**: Unit 1 prepares future observability without increasing log volume or leakage risk.

## Decision 6: PBT Framework

- **Decision**: Do not add a PBT framework in Unit 1.
- **Rationale**: The unit plan assigns primary PBT ownership to tenant resolution, and Unit 1 intentionally avoids property-bearing pure transformations.
- **Future Trigger**: If implementation introduces complex event sanitization or transformations, revisit this decision before code generation completes.

## Dependency Impact

- No new runtime dependency is required.
- No new dev dependency is required for Unit 1 as currently designed.
- No package manager changes are required in this NFR stage.

## Security Compliance

- No new external package reduces supply-chain risk for SECURITY-10.
- No durable publisher avoids premature storage/logging security decisions.
- Test helper supports SECURITY-03 by checking sensitive data exclusions.

## PBT Compliance

- PBT framework selection is deferred because PBT is N/A for Unit 1.
- Unit 3 remains expected to decide PBT framework setup if not already available.
