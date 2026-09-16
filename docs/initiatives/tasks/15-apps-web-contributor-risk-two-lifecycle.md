# Apps Web Contributor Risco 2 Lifecycle - Execution Plan

## Source

- PRD:
  [`docs/initiatives/prds/15-apps-web-contributor-risk-two-lifecycle.md`](../prds/15-apps-web-contributor-risk-two-lifecycle.md)
- Figma handoff:
  [`docs/initiatives/sources/14-shared-risk-classification-figma-handoff.md`](../sources/14-shared-risk-classification-figma-handoff.md)

## Implementation Principles

- Keep Risco 2 as a documented journey through capability-owned modules.
- Use the Risco 1 component grammar as the canonical design system.
- Represent branch behavior with explicit reducer phases and composed page
  variants.
- Keep routes thin and all presentation data dependency-injectable.
- Do not imply real upload, payment, signature, analysis, inspection, or legal
  issuance authority.

## Tasks

### Phase 1: Baseline And Boundaries

- [x] Audit the current shared entry, state, routes, tests, Figma references,
      local instructions, and available shadcn primitives.
- [x] Confirm process ownership and the no-risk-module boundary.
- [x] Confirm mandatory document analysis and optional post-validation
      inspection.

### Phase 2: Contributor Complementing

- [x] Add a separate five-stage Risco 2 progress contract.
- [x] Implement responsible person and declaration pages.
- [x] Implement in-memory document metadata preparation and validation.
- [x] Implement simulated charge, payment, review, and protocol pages.

### Phase 3: Lifecycle And Branches

- [x] Implement validation and requirement-response states.
- [x] Implement direct issuance after approved validation.
- [x] Implement conditional inspection scheduling and outcome.
- [x] Add completion snapshots, history, document projections, PDF variant,
      and save/resume routing.

### Phase 4: Quality And Documentation

- [x] Add reducer, schema, route, and E2E regression coverage.
- [x] Update durable architecture and journey documentation.
- [x] Run check, typecheck, unit tests, focused E2E, build, and visual review.
- [x] Record final verification evidence and remaining follow-ups.

## Verification Evidence

- `pnpm --filter web typecheck`: passed.
- `pnpm --filter web test`: passed, 30 files and 119 tests.
- Focused contributor Playwright: passed, five Chromium scenarios including
  the complete Risco 2 requirement and conditional-inspection journey.
- Focused Risco 2 Playwright rerun after visual-warning correction: passed.
- Focused Biome check for process source, routes, process tests, contributor
  E2E, and route tests: passed.
- `pnpm --filter web build`: passed.
- Visual review: passed at 1440 × 900 and 390 × 844 for the document stage;
  progress, hierarchy, file rows, disabled action, responsive stacking, and
  horizontal containment matched the established contributor grammar.
- Full `pnpm --filter web check`: blocked only by pre-existing SVG title
  findings in `public/favicon.svg`, `public/icons.svg`, and auth-owned logos,
  plus the existing oversized auth crest warning. No changed initiative file
  has a remaining Biome finding.

## Risks And Follow-Ups

- [ ] Replace metadata-only uploads with secure server-issued upload contracts.
- [ ] Define authoritative payment, signature, analysis, and inspection APIs.
- [ ] Build the internal analyst and inspector journeys as separate bounded
      initiatives.
- [ ] Add real-time event delivery and persisted requirement conversations.
