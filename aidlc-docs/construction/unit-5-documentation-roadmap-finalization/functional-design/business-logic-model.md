# Business Logic Model: Unit 5 Documentation And Roadmap Finalization

## Purpose

Unit 5 finalizes durable documentation and roadmap state after Units 1 through 4 have been implemented and verified. The unit translates verified implementation summaries into project-owned documentation without adding code behavior, secrets, realistic credentials, unsupported claims, or speculative roadmap completion.

## Business Capability

The project must provide durable, safe, and traceable IDP documentation for operators and future implementers. Documentation must reflect implemented behavior for event publication, Better Auth organization/membership ownership, tenant/domain resolution, bootstrap tenant setup, tests, and deferred gaps.

## Documentation Workflow

1. Read Unit 1 through Unit 4 code-generation summaries.
2. Read existing durable documentation surfaces.
3. Classify each implemented capability by documentation destination.
4. Update `apps/idp/README.md` for operational setup, scripts, commands, and smoke tests.
5. Update `docs/idp/*` for long-form architecture, security, testing, deployment, and operational behavior.
6. Update `idp-architecture-discussion.md` roadmap items only when completion is verified by Units 1 through 4 summaries.
7. Update `docs/TODO.md` only for deferred work not already covered by active plans or durable docs.
8. Use synthetic examples only.
9. Preserve security and Better Auth boundaries in all wording.
10. Record documentation decisions and remaining gaps in the Unit 5 code-generation summary later.

## Documentation Surfaces

### `apps/idp/README.md`

The README should document app-level operational commands and day-to-day setup. Unit 5 should add or update:

- `bootstrap:tenant` command.
- Required flags.
- Safe output policy.
- Rerun/idempotency behavior.
- Tenant status smoke tests.
- Reminder to use synthetic examples and avoid secrets in shell history when practical.

### `docs/idp/architecture.md`

Architecture docs should reflect current durable IDP structure and boundaries:

- `src/events` event abstraction exists and is no-op/durable-audit-ready.
- Better Auth organization plugin is configured.
- Tenant metadata links to Better Auth organization IDs.
- Tenant domain resolution uses normalized host registry.
- Bootstrap tooling lives under `src/bootstrap` and `src/scripts`.
- Citizen users are not automatically institutional members.

### `docs/idp/security.md`

Security docs should reflect no-secret/no-PII boundaries:

- Bootstrap output and events must not include emails, passwords, domains, internal IDs, tokens, cookies, SQL, or connection strings.
- Better Auth internals remain official-API-owned.
- Tenant/domain unknown, pending, disabled, malformed, or conflicting states fail safely.
- Forwarded-host trust remains an ingress/proxy sanitization assumption.

### `docs/idp/testing.md`

Testing docs should reflect:

- Unit 3 PBT coverage for host normalization using `fast-check`.
- Unit 4 example-based bootstrap tests with controlled dependencies.
- No real PostgreSQL lifecycle tests, real Resend calls, or `.env` reads in unit tests.
- Manual smoke tests for bootstrap and tenant status.

### `docs/idp/deployment.md`

Deployment docs should be updated only if they need operational notes for migrations, smoke checks, or host-forwarding assumptions. Unit 5 should not invent deployment infrastructure or rate limits.

### `idp-architecture-discussion.md`

Roadmap items may be marked complete only for verified work:

- Internal event publication abstraction.
- Better Auth organization plugin and tenant/membership ownership model.
- Tenant domain/alias resolution.
- Bootstrap scripts for tenants, domains, and initial owner users.

### `docs/TODO.md`

Backlog updates should include only deferred work not already captured, such as:

- Institutional invitation flow.
- Admin UI/API or Better Auth admin plugin rollout.
- Persistent audit worker/outbox/queue/event bus.
- FastAPI integration contract.
- Frontend integration.
- Production rate limiting or edge/infrastructure controls for tenant status.

## Safe Example Model

Documentation examples must use synthetic values only:

- Domains such as `tenant-example.sacnexus.test`.
- Emails such as `owner@example.test`.
- Password placeholders such as `REPLACE_WITH_TEMPORARY_PASSWORD`.
- IDs such as `00000000-0000-0000-0000-000000000000` only if needed.

Examples must not include real secrets, real credentials, CPF, CNPJ, personal data, tokens, cookies, session IDs, or production connection strings.

## Testable Documentation Outcomes

- Durable docs mention each verified Unit 1-4 capability at least once in the appropriate surface.
- Roadmap marks only verified items complete.
- Backlog contains only deferred gaps not already covered by active implementation.
- Examples remain synthetic and non-sensitive.
- Docs preserve Better Auth and IDP/FastAPI responsibility boundaries.

## Security Compliance

- **SECURITY-03**: Compliant. Safe example policy excludes secrets, credentials, PII, tokens, cookies, SQL, and connection strings.
- **SECURITY-09**: Compliant. Documentation does not recommend unsafe default credentials or raw error exposure.
- **SECURITY-11**: Compliant. Security-critical boundaries and gaps are documented.
- **SECURITY-12**: Compliant. Docs preserve Better Auth official API boundaries.
- **SECURITY-13**: Compliant. Event/audit boundaries are documented as non-durable until future audit work.
- **SECURITY-15**: Compliant. Fail-safe tenant and bootstrap behavior is documented accurately.

## PBT Compliance

- **PBT-01/PBT-10**: Compliant. Unit 5 documents Unit 3 PBT coverage and example-test complementarity.
- **PBT-08**: Applicable if testing docs mention seed/shrinking reproducibility.
