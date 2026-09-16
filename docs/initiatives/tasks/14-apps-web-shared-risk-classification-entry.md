# Apps Web Shared Risk Classification Entry - Execution Plan

## Source

- PRD:
  [`docs/initiatives/prds/14-apps-web-shared-risk-classification-entry.md`](../prds/14-apps-web-shared-risk-classification-entry.md)
- Figma handoff:
  [`docs/initiatives/sources/14-shared-risk-classification-figma-handoff.md`](../sources/14-shared-risk-classification-figma-handoff.md)

## Implementation Principles

- Preserve the existing contributor component grammar as the canonical visual
  system.
- Treat Risco 2 screens as content and state references when they conflict with
  established components.
- Keep one shared entry and explicit result variants instead of boolean-heavy
  pages or duplicated risk modules.
- Keep routes thin and state dependency-injectable through the process
  provider.
- Keep this slice bounded at the classification result.

## Tasks

### Phase 1: Baseline And Boundaries

- [x] Confirm mandatory Risco 2 document analysis and optional inspection after
      validation.
- [x] Audit the current process module, routes, state, tests, Figma screens,
      local instructions, and applicable skills.
- [x] Confirm web ownership, memory-only presentation state, and no new risk
      module.
- [x] Catalog the common entry and later Risco 2 component/state groups.

### Phase 2: Shared Journey Model

- [x] Replace risk-specific entry copy with establishment-regularization copy.
- [x] Define one stable four-stage progress contract through classification.
- [x] Add an explicit classification value derived from the fixture answers.
- [x] Add a bounded shared analysis phase before the result.

### Phase 3: Result Branches

- [x] Preserve the Risco 1 automatic issuance continuation.
- [x] Implement the Risco 2 result variant with considered factors and the
      accepted mandatory-analysis/optional-inspection explanation.
- [x] Keep the deferred Risco 2 continuation explicit without adding fake
      upload, payment, or provider contracts.

### Phase 4: Quality And Documentation

- [x] Add reducer and classification regression coverage.
- [x] Add focused E2E coverage for both shared-entry outcomes.
- [x] Update durable shared and Risco 1/Risco 2 journey documentation.
- [x] Run check, typecheck, unit tests, focused E2E, and build.
- [x] Record final verification evidence and remaining follow-ups.

## Verification Evidence

- `pnpm --filter web typecheck`: passed.
- `pnpm --filter web test`: passed, 29 files and 106 tests.
- `pnpm --filter web build`: passed.
- `pnpm --filter web exec playwright test`: passed, 28 Chromium scenarios.
- Focused Biome check for `modules/processes`, its unit tests, route tests, and
  contributor E2E: passed.
- Full `pnpm --filter web check`: blocked by pre-existing SVG accessibility
  findings in `public/favicon.svg`, `public/icons.svg`, and auth-owned SVG
  assets, plus the existing oversized CBMPE crest warning. No finding remained
  in the files changed for this initiative.
- Visual inspection: passed at `1440 × 900` and `390 × 844` for the shared
  entry, questionnaire, progress model, Risco 2 result, and responsive actions.

## Risks And Follow-Ups

- [ ] Implement the post-classification contributor Risco 2 journey in a
      separate bounded initiative.
- [ ] Reconcile the internal Triager presentation with future approved
      analyst/inspector Figma screens.
- [ ] Replace the fixture classification with a server-owned audited rules
      contract before production.
