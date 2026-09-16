# Apps Web Internal Risco 2 Lifecycle - Execution Plan

## Source

- PRD:
  [`docs/initiatives/prds/16-apps-web-internal-risk-two-lifecycle.md`](../prds/16-apps-web-internal-risk-two-lifecycle.md)
- Handoff:
  [`docs/initiatives/sources/16-internal-risk-two-journey-handoff.md`](../sources/16-internal-risk-two-journey-handoff.md)

## Implementation Principles

- Keep Risco 2 as a journey across capability-owned modules.
- Use one canonical process projection and append-only visible history.
- Reuse shared shadcn primitives before introducing domain components.
- Keep routes thin, transitions explicit, and presentation state injectable.
- Treat Figma internal screens as incomplete and apply the documented conflict
  resolution order.

## Tasks

### Phase 1: Audit And Internal Foundation

- [x] Revalidate the completed contributor Risco 2 journey.
- [x] Audit the existing Triador module, routes, fixtures, tests, and role
      session.
- [x] Audit the available Figma Risco 2 blocks and record the missing internal
      sequence.
- [x] Define capability ownership and the internal role sequence.
- [x] Introduce the shared internal application shell and align Triager
      identity and navigation.
- [x] Add a contributor-consistent Risco 2 process projection to the queue.
- [x] Revalidate existing administrative-triage behavior.

### Phase 2: Mandatory Technical Analysis

- [x] Add the technical-analyst demo profile and guarded routes.
- [x] Add analysis queue, assignment, process summary, document workspace, and
      technical checklist.
- [x] Implement technical requirement, correction, and reanalysis states.
- [x] Implement document approval and explicit inspection decision.

### Phase 3: Optional Inspection

- [x] Add the inspector demo profile and guarded routes.
- [x] Add inspection queue, schedule, assignment, and field checklist.
- [x] Implement approved, requirement, correction, and reinspection outcomes.
- [x] Project final approval into document issuance and process history.

### Phase 4: Cross-Role Quality

- [ ] Add reducer and projection coverage for every permitted transition.
- [x] Add focused E2E journeys for no-inspection and inspection-required
      branches.
- [ ] Add responsive and keyboard-oriented visual review.
- [ ] Create guided recordings after the journeys are accepted.
- [ ] Run check, typecheck, unit tests, focused E2E, build, and preflight.

## Verification Evidence

- Focused formatting and lint checks pass for the internal journey files.
- TypeScript and generated-route validation pass.
- Unit suite: 30 files and 121 tests pass.
- Focused internal E2E: triage, analysis, inspection, correction, reanalysis,
  reinspection, role guards, and mobile overflow checks pass.
- Production build passes.
- The repository-wide Biome check remains blocked by the pre-existing
  oversized `cbmpe-crest.svg` and missing SVG titles in the authentication
  assets. Those assets are outside this initiative's change scope.
