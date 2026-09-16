# Business Rules: Unit 5 Documentation And Roadmap Finalization

## Documentation Scope Rules

### BR-01 Durable Docs Must Be Updated When Relevant

Unit 5 updates `apps/idp/README.md`, `docs/idp/*`, and `idp-architecture-discussion.md` when verified implementation content exists.

### BR-02 AI-DLC Docs Are Not A Substitute For Durable Docs

AI-DLC artifacts preserve workflow traceability, but durable project docs must capture operational and architectural knowledge for future developers/operators.

### BR-03 Avoid Duplicate Long-Form Content

Large explanations should live in durable docs and be referenced where appropriate rather than duplicated across multiple surfaces.

## Roadmap Rules

### BR-04 Verified Completion Only

Roadmap items may be marked complete only when implementation and verification are recorded in Units 1 through 4 summaries.

### BR-05 No Speculative Completion

Future items such as invitation flow, admin plugin, persistent audit worker, FastAPI integration, frontend integration, and production rate limiting remain incomplete unless implemented and verified.

### BR-06 Completion Notes Must Preserve Gaps

When roadmap items are marked complete, remaining limitations and deferred scope must still be documented.

## Bootstrap Documentation Rules

### BR-07 Document Operational Command Shape

The bootstrap docs must include command name, required flags, alias behavior, and one-line command examples.

### BR-08 Document Safe Output Policy

Docs must explain that output uses operation categories and outcomes only.

### BR-09 Document Rerun Behavior

Docs must document same-state rerun as idempotent/reused/already-satisfied and conflicting rerun as safe failure.

### BR-10 Warn About Shell Secrets

Docs must warn that temporary passwords should be handled carefully and examples must use placeholders or synthetic values.

## Tenant/Domain Documentation Rules

### BR-11 Document Tenant Status Endpoint

Docs must document `GET /tenant/status` and its safe response shape.

### BR-12 Document Host Normalization

Docs must document supported normalization at a durable level: trim, lowercase, remove one trailing dot, remove valid port, reject malformed values.

### BR-13 Document Status Semantics

Docs must document active, pending, and disabled tenant/domain behavior.

### BR-14 Document Forwarded Host Trust Boundary

Docs must state that `X-Forwarded-Host` trust depends on ingress/proxy sanitization.

### BR-15 Document Rate-Limit Gap

Docs must preserve the current public tenant status endpoint rate-limit gap for future infrastructure/edge design.

## Event Documentation Rules

### BR-16 Document No-Op Publisher

Docs must state that the current publisher is no-op and non-durable.

### BR-17 Document Safe Event Taxonomy

Docs must describe event names/operation labels as safe no-PII/no-secret signals.

### BR-18 Do Not Claim Durable Audit

Docs must not represent current events as persisted audit records.

## Organization And Membership Rules

### BR-19 Document Organization Plugin

Docs must document Better Auth organization plugin usage.

### BR-20 Document Public Creation Disabled

Docs must document that public/self-service organization creation is disabled.

### BR-21 Document Citizen/Member Separation

Docs must state that citizen users are not automatically organization members.

### BR-22 Document Owner Bootstrap

Docs must explain owner role assignment through controlled bootstrap tooling.

## Safe Example Rules

### BR-23 Synthetic Examples Only

Examples must use synthetic domains, emails, IDs, and placeholders.

### BR-24 Forbidden Documentation Values

Docs must not include real secrets, real credentials, CPF, CNPJ, tokens, cookies, session IDs, raw SQL parameters, real email addresses, or production connection strings.

### BR-25 No Unsafe Cleanup Guidance

Docs must not normalize destructive manual cleanup as a standard recovery process.

## Backlog Rules

### BR-26 Backlog Only For Uncovered Deferred Work

`docs/TODO.md` receives only deferred items not already captured by active task plans or durable documentation.

### BR-27 No Kitchen-Sink Backlog

Do not add every possible future idea; add only traceable gaps from Units 1 through 4.

## Security Compliance

- **SECURITY-03**: BR-23 and BR-24 prevent sensitive documentation leakage.
- **SECURITY-09**: BR-10 and BR-25 prevent unsafe credential/error/cleanup guidance.
- **SECURITY-11**: BR-05, BR-15, BR-18, and BR-26 preserve known security gaps and boundaries.
- **SECURITY-12**: BR-19 through BR-22 preserve Better Auth boundaries.
- **SECURITY-13**: BR-16 through BR-18 preserve audit/event integrity claims.
- **SECURITY-15**: BR-09, BR-13, and BR-14 document fail-safe behavior.

## PBT Compliance

- **PBT-01/PBT-10**: Unit 5 documentation must mention property-based host normalization coverage and example-test complementarity where testing guidance is updated.
- **PBT-08**: Testing docs should preserve shrinking/seed reproducibility guidance if PBT details are included.
