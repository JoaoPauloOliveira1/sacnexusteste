---
name: sac-nexus-initiative-workflow
description: Plan, review, update, or execute SAC Nexus initiatives using paired PRDs and execution plans with explicit alternatives, boundaries, performance, scalability, accessibility, security, privacy, observability, acceptance criteria, and verification.
---

# SAC Nexus Initiative Workflow

Use this skill for work under `docs/initiatives`. Write user-facing analysis in
Brazilian Portuguese and initiative documents in English.

## Files

- PRDs: `docs/initiatives/prds/{nn-slug}.md`
- Plans: `docs/initiatives/tasks/{nn-slug}.md`
- Sources and handoffs: `docs/initiatives/sources/`
- Templates: `docs/initiatives/templates/`

Use the same filename for a PRD and its plan.

## Workflow

1. Read related PRDs, plans, durable docs, local `AGENTS.md` files, package
   scripts, current code, and relevant skills.
2. Frame the problem and outcome before prescribing a solution.
3. Record gaps, assumptions, counterpoints, a simpler option, and a more robust
   future option.
4. Evaluate ownership across web, IDP, future business APIs, persistence, and
   external providers with `sac-nexus-architecture`.
5. Evaluate performance and scalability, bounded queries, concurrency,
   accessibility, responsive and loading states, security, privacy/LGPD, abuse,
   logging, metrics, traces, and prohibited sensitive data.
6. Ask only for decisions that cannot be inferred safely; record conservative
   assumptions otherwise.
7. Create or update the execution plan after the recommendation is explicit.
8. Order tasks by dependency, make them verifiable, and check them only when
   evidence exists.
9. Record skipped checks, blockers, evidence, and deferred follow-ups.

Do not claim capacity numbers unless measured or clearly estimated with stated
assumptions. If the requested approach is weaker than a practical alternative,
present the counterproposal and tradeoffs before implementation.

## Verification Expectations

- Web: focused tests, accessibility and responsive checks, route/E2E coverage
  when relevant, typecheck, check, and build.
- IDP: access policy, config, route/OpenAPI, migration, logging/redaction, and
  integration-boundary tests as relevant.
- CI/CD: workflow and action inspection plus available local validation.
- Data-heavy work: bounded pagination/filter/sort behavior and query reasoning.
- Documentation-only work: link, structure, template, and consistency checks.
