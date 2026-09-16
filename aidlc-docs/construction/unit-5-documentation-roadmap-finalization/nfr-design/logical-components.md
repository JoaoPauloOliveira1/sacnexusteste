# Logical Components: Unit 5 Documentation And Roadmap Finalization

## Overview

Unit 5 logical components model documentation surfaces, evidence sources, roadmap state, backlog state, safety inspection, and verification. These are documentation workflow components, not runtime application components. Unit 5 does not add code behavior, schema, migrations, dependencies, or deployment tooling.

## Component Summary

| Component | Responsibility | Runtime I/O | Unit 5 Status |
|---|---|---:|---|
| Documentation Surface Map | Assign content to README, durable docs, roadmap, and TODO | No | Required |
| Safe Example Policy | Enforce synthetic-only examples and forbidden-value rules | No | Required |
| Unit Evidence Catalog | Map Unit 1-4 summaries to roadmap claims | No | Required |
| Roadmap Update Component | Mark only evidence-backed roadmap items complete | No | Required |
| Gap Preservation Component | Keep deferred work visible in relevant docs | No | Required |
| Backlog Update Component | Add TODO items only for uncovered actionable deferred work | No | Conditional |
| PBT Documentation Component | Document Unit 3 `fast-check` scope accurately | No | Required |
| Documentation Verification Checklist | Verify checks, evidence, sensitive-value safety, and gap accuracy | Existing tools/manual review | Required |

## Documentation Surface Map

### Responsibility

Route each documentation topic to the smallest appropriate durable surface.

### Surfaces

- `apps/idp/README.md` for operational quick-start and package command usage.
- `docs/idp/architecture.md` for architecture, component boundaries, implemented capabilities, and integration gaps.
- `docs/idp/security.md` for security rules, safe examples, Better Auth boundaries, event payload limits, error behavior, and trust assumptions.
- `docs/idp/testing.md` for automated checks, PBT scope, manual smoke tests, and documentation verification.
- `docs/idp/deployment.md` for ingress/proxy and operational environment assumptions if relevant.
- `idp-architecture-discussion.md` for roadmap checklist state.
- `docs/TODO.md` for cross-project actionable backlog items not already captured elsewhere.

### NFR Contribution

- **Scalability**: Prevents large duplicated documentation sections.
- **Maintainability**: Keeps each file focused and discoverable.
- **Usability**: Keeps commands close to the IDP package.

## Safe Example Policy

### Responsibility

Constrain all Unit 5 examples to synthetic-only values.

### Rules

- Use `.test` hostnames and domains.
- Use `example.test` email addresses.
- Use `REPLACE_*` placeholders for secrets and environment-specific values.
- Never include real emails, CPF, CNPJ, credentials, tokens, cookies, session IDs, raw SQL parameters, production domains, or production connection strings.
- Prefer safe categories over raw errors or internal records.

### NFR Contribution

- **Security**: Prevents accidental sensitive-value leaks in durable docs.
- **Reliability**: Ensures docs reinforce safe operational behavior.

## Unit Evidence Catalog

### Responsibility

Provide the evidence base for roadmap updates.

### Evidence Inputs

- `aidlc-docs/construction/unit-1-event-publication-foundation/code/unit-1-code-summary.md`.
- `aidlc-docs/construction/unit-2-organization-membership-model/code/code-generation-summary.md`.
- `aidlc-docs/construction/unit-3-tenant-domain-resolution/code/code-generation-summary.md`.
- `aidlc-docs/construction/unit-4-idp-bootstrap-scripts/code/code-generation-summary.md`.

### Evidence Mapping

- Unit 1 supports internal event publication abstraction and safe no-PII/no-secret event payloads.
- Unit 2 supports Better Auth organization plugin configuration and institutional membership modeling.
- Unit 3 supports tenant domain/alias resolution and tenant status fail-safe behavior.
- Unit 4 supports controlled bootstrap scripts for tenants, domains, aliases, and initial owner membership.

### NFR Contribution

- **Traceability**: Links durable roadmap claims to verified implementation evidence.
- **Reliability**: Prevents unsupported completion claims.

## Roadmap Update Component

### Responsibility

Update `idp-architecture-discussion.md` roadmap state based only on evidence.

### Behavior

- Mark items complete only when Unit Evidence Catalog supports the claim.
- Keep partially implemented or deferred items visibly incomplete.
- Preserve future-work language for invitation flow, admin UI/API/plugin, durable audit infrastructure, FastAPI integration, frontend integration, and production rate limiting.

### NFR Contribution

- **Traceability**: Roadmap completion reflects implemented scope.
- **Security**: Prevents overstated production readiness.

## Gap Preservation Component

### Responsibility

Keep known limitations visible in the relevant durable docs.

### Known Gaps

- Invitation flow.
- Admin UI/API/plugin.
- Persistent audit worker/outbox/queue/event bus.
- FastAPI integration.
- Frontend integration.
- Production rate limiting.
- Deployment ingress/proxy sanitization responsibility for `X-Forwarded-Host`.

### NFR Contribution

- **Availability/Reliability**: Future operators understand current limits.
- **Security**: Known security and deployment assumptions stay explicit.

## Backlog Update Component

### Responsibility

Update `docs/TODO.md` only when Unit 5 discovers actionable deferred work not already captured in durable docs or roadmap notes.

### Behavior

- Add concise, actionable items.
- Avoid duplicating every roadmap gap if already represented elsewhere.
- Do not add speculative ideas unrelated to Units 1 through 4.

### Status

Conditional. It is required only if Code Generation identifies missing backlog coverage.

## PBT Documentation Component

### Responsibility

Document current PBT coverage accurately.

### Behavior

- State that Unit 3 uses `fast-check` for host normalization properties.
- State that property-based tests complement example-based route/use-case tests.
- Do not state that Unit 4 bootstrap orchestration is property-tested.
- Mention shrinking or seed reproducibility only if the wording matches actual tooling behavior.

### NFR Contribution

- **Testing**: Helps maintainers understand where generated inputs are used.
- **Traceability**: Aligns docs with PBT requirements without overstating coverage.

## Documentation Verification Checklist

### Responsibility

Verify Unit 5 documentation changes before approval.

### Required Checks

- Run relevant existing checks, including `pnpm --filter idp check` if app docs or package files are touched.
- Manually inspect changed documentation for forbidden sensitive examples.
- Confirm roadmap completion has Unit 1 through Unit 4 evidence.
- Confirm known gaps remain visible.
- Confirm PBT statements are accurate and bounded.
- Confirm no production deployment pipeline is run for documentation-only work.

### NFR Contribution

- **Maintainability**: Uses existing tools only.
- **Security**: Manual inspection catches docs-only leaks.
- **Reliability**: Roadmap and gap claims remain accurate.

## Component Interactions

1. Documentation Surface Map assigns the target file for each topic.
2. Safe Example Policy constrains examples before writing.
3. Unit Evidence Catalog supports Roadmap Update Component decisions.
4. Gap Preservation Component keeps deferred work visible.
5. Backlog Update Component adds TODO entries only if a gap lacks coverage.
6. PBT Documentation Component constrains testing claims.
7. Documentation Verification Checklist validates the final docs-only change set.

## Security Compliance

- **SECURITY-03**: Safe Example Policy and Documentation Verification Checklist prevent documentation leaks.
- **SECURITY-09**: Safe examples and failure categories avoid unsafe operational recovery guidance.
- **SECURITY-10**: Components use existing Markdown and checks only.
- **SECURITY-11**: Gap Preservation Component keeps risks traceable.
- **SECURITY-12**: Documentation Surface Map keeps Better Auth boundaries in durable docs.
- **SECURITY-13**: Roadmap and docs distinguish safe internal events from durable audit infrastructure.
- **SECURITY-15**: Verification checks ensure fail-safe behavior is not overstated or omitted.

## PBT Compliance

- **PBT-01**: PBT Documentation Component explicitly identifies property-tested behavior.
- **PBT-03/PBT-04**: N/A for Unit 5 documentation-only work.
- **PBT-08**: Conditional on whether docs mention seed/shrinking behavior.
- **PBT-09**: Existing Unit 3 `fast-check` dependency remains the documented tooling.
- **PBT-10**: Documentation must preserve example-based tests as complementary coverage.
