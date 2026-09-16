# Code Generation Summary: Unit 4 IDP Bootstrap Scripts

## Outcome

Unit 4 Code Generation implemented a controlled IDP tenant bootstrap command for low-frequency operator use. The command parses and validates CLI flags, reuses Unit 3 host normalization, orchestrates owner user, organization, tenant, domain, alias, membership, and safe setup event behavior through testable boundaries, and prints only strict allowlisted output.

## Modified Application Files

- `apps/idp/package.json`
  - Added `bootstrap:tenant` package script using `tsx src/scripts/bootstrap-tenant.ts`.
- `apps/idp/src/events/identity-event-registry.ts`
  - Added safe bootstrap event names and operation labels for started, completed, and failed events.
  - Added `bootstrap_conflict_detected` as a safe reason code.
  - Did not add any new event payload fields.
- `apps/idp/tests/unit/events/identity-event.test.ts`
  - Added assertions for bootstrap event taxonomy.
  - Added assertions that bootstrap does not widen allowed event payload fields with email, domain, normalized host, password, or SQL fields.

## Created Application Files

- `apps/idp/src/bootstrap/tenant-bootstrap.ts`
  - Pure CLI parser.
  - Accepts the `--` argument separator passed by `pnpm --filter idp bootstrap:tenant -- ...`.
  - Bootstrap request validation.
  - Unit 3 host normalization reuse.
  - Bootstrap orchestrator with injected dependencies.
  - Safe output projector.
  - Generic failure classification.
- `apps/idp/src/bootstrap/tenant-bootstrap-identity.ts`
  - Better Auth integration boundary for owner user, organization, and owner membership operations.
  - Uses supported Better Auth API method names available locally: `signUpEmail`, `createOrganization`, `addMember`, and `updateMemberRole`.
  - Reads minimal user/organization/member state through Drizzle to classify create/connect and verify outcomes, but does not write Better Auth credential/session/token/cookie internals directly.
- `apps/idp/src/bootstrap/tenant-bootstrap-repository.ts`
  - Drizzle persistence boundary for IDP-owned tenant and tenant-domain setup.
  - Creates or connects active tenants, primary domain, and aliases using existing Unit 3 schema.
  - Uses UUID v7 for new IDP-owned tenant/domain IDs.
  - Uses a transaction for related IDP-owned mutations.
- `apps/idp/src/scripts/bootstrap-tenant.ts`
  - Package command entrypoint.
  - Validates args before loading runtime dependencies.
  - Wires existing env/database/auth/event dependencies.
  - Prints safe projected output only.
- `apps/idp/tests/unit/bootstrap/tenant-bootstrap.test.ts`
  - Covers parser success.
  - Covers parser compatibility with the `pnpm` `--` argument separator.
  - Covers missing input, invalid domain, and duplicate normalized domain failure.
  - Covers successful new setup.
  - Covers idempotent same-state rerun.
  - Covers domain conflict failure.
  - Covers existing owner user reuse and already-satisfied owner membership.
  - Covers owner membership failure without success output.
  - Covers safe output redaction for owner email, temporary password, raw domain, normalized host, internal IDs, SQL-like strings, connection strings, tokens, cookies, and stack-like strings.

## Command Shape

Expected operator command shape:

```bash
pnpm --filter idp bootstrap:tenant -- --name "SAC Nexus PE" --slug sac-nexus-pe --domain pe.sacnexus.com.br --alias www.pe.sacnexus.com.br --owner-email owner@example.test --owner-name "Owner User" --temporary-password "..."
```

Safe output shape includes only operation categories and outcomes, for example:

```text
bootstrap: completed
owner_user: created
organization: created
tenant: created
domains: created
owner_membership: assigned
```

## Implementation Notes

- The internal operation order creates or connects the owner user before organization creation because Better Auth `createOrganization` supports a server-side `userId` creator input.
- This order preserves the approved safety property that invalid input and domain conflicts do not grant owner membership.
- Matching existing state supports idempotent rerun through `reused` and `already_satisfied` outcomes.
- Conflicting state fails with generic safe categories such as `conflict_detected` or `operation_failed`.
- Safe setup events are emitted through the Unit 1 abstraction as best-effort events until a durable audit design exists.
- Additional identity/repository boundary tests were not added because realistic coverage would require over-mocking Better Auth and Drizzle query-builder internals. Boundary behavior is covered through orchestrator tests with controlled fakes, while compile-time checks cover the concrete modules.

## Dependency And Schema Impact

- No new runtime dependencies were added.
- No new dev dependencies were added.
- No schema changes were introduced.
- No Drizzle migration was generated.
- No root scripts were modified.

## Documentation Decision

- Immediate durable docs were not updated in this unit because Unit 5 is explicitly assigned to documentation and roadmap finalization after implementation verification.
- This summary records the operational command, safe output policy, rerun behavior, event behavior, and Better Auth API usage so Unit 5 can update `apps/idp/README.md`, durable IDP docs, and roadmap materials accurately.
- No `docs/TODO.md` update is needed now because the deferred documentation work is already assigned to Unit 5.

## Verification

- `pnpm --filter idp test`: passed, 19 files and 102 tests.
- `pnpm --filter idp test tests/unit/bootstrap/tenant-bootstrap.test.ts`: passed after parser compatibility fix.
- `pnpm --filter idp typecheck`: passed.
- `pnpm --filter idp check`: passed.

## Safety Checks

- No `.env` files were read, printed, modified, or summarized.
- No real PostgreSQL integration tests were added.
- No real Resend or external service tests were added.
- No generated migration was added for Unit 4.
- No direct writes to Better Auth password, account, token, session, or cookie internals were introduced.

## Security Compliance

- **SECURITY-03**: Compliant. Output and events are strict allowlisted surfaces and redaction tests cover forbidden values.
- **SECURITY-05**: Compliant. CLI inputs are parsed and validated before runtime dependency wiring and mutation where practical.
- **SECURITY-08**: Compliant. Bootstrap is package-level operational tooling and does not add public endpoints or UI flows.
- **SECURITY-09**: Compliant. Failure output uses generic safe categories and does not expose raw internals.
- **SECURITY-10**: Compliant. No dependencies were added.
- **SECURITY-11**: Compliant. Tests cover rerun, conflict, duplicate domain, invalid input, membership failure, and output misuse cases.
- **SECURITY-12**: Compliant. Better Auth credential/session/token/cookie internals are not reimplemented.
- **SECURITY-13**: Compliant. Tenant/domain integrity uses existing schema constraints and safe event traceability.
- **SECURITY-15**: Compliant. Invalid input, conflicts, and partial failures fail safely without reporting success.

## PBT Compliance

- **PBT-01**: Compliant. Unit 4 property-bearing areas were evaluated during design and code planning.
- **PBT-03/PBT-04**: N/A for this implementation because Unit 4 reuses Unit 3 host normalization and does not introduce separate custom pure property targets that require new PBT.
- **PBT-08**: N/A because no new PBT was added.
- **PBT-09**: Compliant. Existing `fast-check` from Unit 3 remains available.
- **PBT-10**: Compliant. Example-based tests cover critical bootstrap behavior.
