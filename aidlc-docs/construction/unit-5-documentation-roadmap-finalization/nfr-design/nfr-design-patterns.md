# NFR Design Patterns: Unit 5 Documentation And Roadmap Finalization

## Overview

Unit 5 NFR Design converts approved documentation NFRs into concrete patterns for safe Markdown updates. The design uses existing documentation surfaces only, requires evidence-backed roadmap updates, preserves known gaps, and verifies documentation changes with existing project checks plus manual sensitive-value inspection.

## Documentation Safety Patterns

### Strict Synthetic Example Allowlist

- **Pattern**: Documentation examples must use only `.test` domains, `example.test` emails, `REPLACE_*` placeholders, and obviously synthetic values.
- **Allowed Examples**: `tenant.example.test`, `owner@example.test`, `REPLACE_TEMPORARY_PASSWORD`, `REPLACE_DATABASE_URL`, `REPLACE_SECRET`.
- **Forbidden Examples**: Real secrets, real credentials, realistic personal emails, CPF, CNPJ, tokens, cookies, session IDs, raw SQL parameters, production domains, production URLs, and production connection strings.
- **Rejected Pattern**: Write realistic examples first and redact them later.
- **Rationale**: Durable docs are copied into issues, PRs, logs, and chat. Safety must be built into examples before review.

### Safe Command Examples

- **Pattern**: Bootstrap and smoke-test commands must be one-line examples using synthetic values.
- **Applies To**: `pnpm --filter idp bootstrap:tenant -- ...`, `curl` smoke tests, and setup snippets.
- **Constraint**: Command examples must warn that pasted temporary passwords may remain in shell history.
- **Rejected Pattern**: Multi-line shell continuations as the primary command form.
- **Rationale**: One-line examples reduce shell-copy mistakes and match Unit 5 usability requirements.

### No Raw Error Or Internal Detail Examples

- **Pattern**: Docs must describe safe failure categories, not raw exception text or SQL output.
- **Allowed Wording**: `validation_failed`, `conflict_detected`, `operation_failed`, generic HTTP `{ "message": "Erro" }`.
- **Forbidden Wording**: Raw SQL query examples, SQL parameters, stack traces, request/response bodies, internal IDs, tokens, cookies, and session identifiers.
- **Rationale**: Documentation must reinforce the existing error-leak prevention policy.

## Traceability Patterns

### Evidence Gate For Roadmap Completion

- **Pattern**: A roadmap item can be marked complete only when Unit 1 through Unit 4 implementation summaries and verification evidence support the claim.
- **Evidence Sources**:
  - Unit 1 code summary for event publication abstraction.
  - Unit 2 code summary for Better Auth organization plugin and membership model.
  - Unit 3 code summary for tenant domain/alias resolution.
  - Unit 4 code summary for bootstrap scripts.
- **Rejected Pattern**: Mark items complete because the AI-DLC cycle is ending.
- **Rationale**: Roadmap state must reflect implemented and verified behavior, not planned intent.

### Gap Preservation

- **Pattern**: Known gaps remain visible in the most relevant durable documentation surface.
- **Known Gaps To Preserve**: Invitation flow, admin UI/API/plugin, persistent audit worker/outbox/queue/event bus, FastAPI integration, frontend integration, and production rate limiting.
- **Backlog Rule**: Add `docs/TODO.md` items only for actionable deferred work not already captured elsewhere.
- **Rejected Pattern**: Hide gaps to make documentation appear complete.
- **Rationale**: Accurate gap visibility supports secure follow-up planning and prevents unsupported production-readiness claims.

## Content Placement Patterns

### README Operational Quick Start

- **Pattern**: `apps/idp/README.md` owns app-level operational quick-start content.
- **Content**: Bootstrap command shape, required flags, safe output policy, rerun expectations, tenant status smoke tests, and relevant existing package commands.
- **Rejected Pattern**: Put all long-form architecture and security guidance in the README.
- **Rationale**: Operators need short command-focused guidance in the app package.

### Durable IDP Docs For Long-Form Guidance

- **Pattern**: `docs/idp/*` owns long-form durable guidance.
- **Content**:
  - `docs/idp/architecture.md`: components, boundaries, current capabilities, and known integration gaps.
  - `docs/idp/security.md`: safe examples, Better Auth boundaries, no-PII/no-secret event policy, error behavior, and trust assumptions.
  - `docs/idp/testing.md`: automated checks, PBT scope, manual smoke tests, and manual sensitive-value review.
  - `docs/idp/deployment.md`: deployment and ingress/proxy assumptions when relevant.
- **Rejected Pattern**: Duplicate large sections across README and durable docs.
- **Rationale**: Long-form docs should be discoverable without bloating package-level quick-start material.

### Roadmap And Backlog Separation

- **Pattern**: `idp-architecture-discussion.md` owns roadmap checklist state; `docs/TODO.md` owns cross-project actionable backlog only when needed.
- **Constraint**: Roadmap completion must cite implemented scope implicitly through Unit evidence; TODO should not become an unbounded idea dump.
- **Rationale**: Roadmap state and backlog work are related but distinct artifacts.

## Verification Patterns

### Documentation Verification Checklist

- **Pattern**: Code Generation for Unit 5 must include a checklist for docs-only verification.
- **Checklist Items**:
  - Run relevant existing checks after edits, including `pnpm --filter idp check` if app docs or package files are touched.
  - Manually inspect changed docs for forbidden sensitive values.
  - Verify each roadmap completion against Unit 1 through Unit 4 summaries.
  - Confirm known gaps remain visible and are not reframed as completed behavior.
  - Confirm PBT documentation does not overstate coverage.
- **Rejected Pattern**: Skip verification because Markdown is not executable.
- **Rationale**: Documentation changes can create security, operational, and roadmap regressions.

### Existing Tooling Only

- **Pattern**: Use existing pnpm/Biome checks and manual review.
- **Rejected Pattern**: Add markdown linting dependencies, docs site generators, or docs CI in Unit 5.
- **Rationale**: Unit 5 is documentation-only and should not expand project tooling.

## PBT Documentation Pattern

### Accurate Unit 3 PBT Scope

- **Pattern**: Durable docs may state that Unit 3 uses `fast-check` for host normalization properties and that PBT complements example-based tests.
- **Required Accuracy**: Do not claim Unit 4 bootstrap orchestration is property-tested.
- **Optional Accuracy**: Mention seed/shrinking reproducibility only if wording remains aligned with existing Vitest/fast-check behavior.
- **Rejected Pattern**: Claim every unit has PBT coverage.
- **Rationale**: PBT documentation should help maintainers understand coverage without overstating assurance.

## Explicitly Excluded Patterns

- New documentation tooling or dependencies.
- Documentation site generator.
- Production deploy pipeline execution.
- New application behavior.
- Schema changes or migrations.
- New PRD/task documents unless a missing planning artifact is discovered.
- Marking unverified roadmap items complete.
- Removing or hiding known security/operational gaps.
- Using real manual-test values in durable docs.

## Security Compliance

- **SECURITY-03**: Compliant. Strict synthetic examples and forbidden-value inspection prevent sensitive documentation leakage.
- **SECURITY-09**: Compliant. Safe command, output, and error examples avoid unsafe operational guidance.
- **SECURITY-10**: Compliant. No new dependencies or tooling are selected.
- **SECURITY-11**: Compliant. Known gaps remain traceable instead of hidden.
- **SECURITY-12**: Compliant. Better Auth boundaries remain part of durable documentation.
- **SECURITY-13**: Compliant. Event documentation must not overstate durable audit maturity.
- **SECURITY-15**: Compliant. Fail-safe tenant, bootstrap, and error behavior must be documented accurately.

## PBT Compliance

- **PBT-01**: Compliant. Unit 5 identifies the documentation-only PBT scope.
- **PBT-03/PBT-04**: N/A. Unit 5 introduces no new property-bearing code.
- **PBT-08**: Conditional. Applies only if docs mention seed or shrinking behavior.
- **PBT-09**: Compliant by documenting existing Unit 3 `fast-check` coverage.
- **PBT-10**: Compliant. Docs must state that PBT complements example-based tests.
