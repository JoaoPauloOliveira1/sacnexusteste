# NFR Requirements: Unit 5 Documentation And Roadmap Finalization

## Overview

Unit 5 updates durable documentation and roadmap state. NFR requirements focus on documentation safety, traceability, maintainability, verification, and avoiding new tooling complexity. Unit 5 must not overstate implemented security/audit maturity, mark unverified roadmap items complete, or leak realistic credentials/examples.

## Performance Requirements

- Unit 5 has no runtime performance requirements because it changes documentation only.
- Documentation updates should remain lightweight Markdown edits.
- Documentation examples should be concise enough for operators and future maintainers to use without duplicating long-form content across files.

## Scalability Requirements

- Documentation must scale by placing content in the right durable surface.
- Operational quick-start content belongs in `apps/idp/README.md`.
- Long-form architecture, security, testing, deployment, and conventions belong in `docs/idp/*`.
- Roadmap completion belongs in `idp-architecture-discussion.md`.
- Cross-project backlog items belong in `docs/TODO.md` only when not already captured elsewhere.
- Unit 5 should avoid duplicating large sections between README, durable docs, roadmap, and backlog.

## Availability And Reliability Requirements

- Roadmap completion state must be backed by Unit 1 through Unit 4 implementation and verification evidence.
- Documentation must preserve known gaps instead of implying unsupported production readiness.
- Documentation must distinguish current behavior from future work, especially for audit durability, invitation flow, FastAPI integration, frontend integration, and production rate limiting.
- Documentation must not recommend destructive cleanup or unsafe credential handling as normal recovery.

## Security Requirements

- Documentation examples must use strict synthetic-only values and placeholders.
- Docs must not include real secrets, real credentials, realistic emails, CPF, CNPJ, tokens, cookies, session IDs, raw SQL parameters, or production URLs/connection strings.
- Docs must preserve Better Auth official API/plugin boundaries and must not encourage reimplementing password, session, token, cookie, credential, organization, or member internals.
- Docs must not claim current identity events are durable audit records.
- Docs must accurately describe no-PII/no-secret event payload boundaries.
- Docs must accurately describe fail-safe behavior for tenant/domain resolution, bootstrap conflicts, and invalid inputs.
- Docs must preserve the `X-Forwarded-Host` ingress/proxy sanitization trust assumption.

## Traceability Requirements

- Each completed roadmap update must be traceable to code-generation summaries and verification results.
- Unit 1 evidence supports internal event publication abstraction completion.
- Unit 2 evidence supports Better Auth organization plugin and institutional membership model completion.
- Unit 3 evidence supports tenant domain/alias resolution completion.
- Unit 4 evidence supports bootstrap scripts completion.
- Deferred work must remain traceable to explicit gaps from Units 1 through 4.

## Maintainability Requirements

- Use existing Markdown files and existing project checks only.
- Do not add markdown linting dependencies, documentation site generators, or docs build tools in Unit 5.
- Keep README focused on operational commands and setup.
- Keep `docs/idp/architecture.md` focused on durable architecture and boundaries.
- Keep `docs/idp/security.md` focused on security rules and safe behavior.
- Keep `docs/idp/testing.md` focused on automated and manual verification guidance.
- Keep `docs/idp/deployment.md` focused on deployment and operational environment assumptions only when relevant.
- Keep `docs/TODO.md` limited to specific deferred work not already covered.

## Usability Requirements

- Documentation should give operators a usable bootstrap command shape.
- Bootstrap examples should be one-line shell commands to avoid shell continuation problems.
- Documentation should describe safe output categories and rerun expectations clearly.
- Tenant status smoke tests should be simple and use synthetic hosts.
- Documentation should warn that temporary passwords can remain in shell history when pasted directly.

## Verification Requirements

- Run relevant existing quality checks after documentation updates.
- At minimum, run `pnpm --filter idp check` if app docs or package files are touched.
- Manually inspect changed docs for forbidden sensitive examples.
- Verify roadmap completion marks are backed by Units 1 through 4 summaries.
- Do not run production deployment pipelines for documentation-only updates.

## PBT Requirements

- Documentation should state that Unit 3 uses `fast-check` for host normalization properties.
- Documentation should state that PBT complements example-based tests, not replaces them.
- Documentation may mention shrinking/seed reproducibility only if the wording is accurate and consistent with existing tests.
- Documentation must not claim Unit 4 bootstrap orchestration is property-tested.

## Out Of Scope

- New documentation tooling or dependencies.
- Documentation site generator.
- Production deploy pipeline execution.
- New code behavior.
- New schema or migrations.
- New PRD/task documents unless implementation discovers a missing planning artifact.
- Marking unverified roadmap items complete.
- Removing known security/operational gaps to make docs appear complete.

## Security Compliance

- **SECURITY-03**: Compliant. Strict synthetic-only examples prevent sensitive documentation leakage.
- **SECURITY-09**: Compliant. Docs must not recommend unsafe credentials, raw error exposure, or destructive cleanup as standard behavior.
- **SECURITY-10**: Compliant. No new dependency is selected.
- **SECURITY-11**: Compliant. Security-critical gaps and boundaries remain traceable.
- **SECURITY-12**: Compliant. Better Auth boundaries remain explicit.
- **SECURITY-13**: Compliant. Docs must not overstate current audit durability.
- **SECURITY-15**: Compliant. Fail-safe behavior must be described accurately.

## PBT Compliance

- **PBT-01**: Compliant. Unit 5 identifies PBT documentation scope.
- **PBT-03/PBT-04**: N/A for Unit 5 because no new property-bearing code is introduced.
- **PBT-08**: Applicable only if docs mention seed/shrinking reproducibility.
- **PBT-09**: Compliant by reference to Unit 3 `fast-check` setup.
- **PBT-10**: Compliant. Docs must state that PBT complements example-based tests.
