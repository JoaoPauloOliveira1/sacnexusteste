# Apps Web Shared Risk Classification Entry PRD

## Summary

Unify the contributor regularization entry so Risco 1 and Risco 2 share one
request, establishment, characteristics, analysis, and classification path.
The classification result, rather than a service choice or source-code module,
selects the subsequent presentation journey.

Execution plan:
[`docs/initiatives/tasks/14-apps-web-shared-risk-classification-entry.md`](../tasks/14-apps-web-shared-risk-classification-entry.md).

Design and component handoff:
[`docs/initiatives/sources/14-shared-risk-classification-figma-handoff.md`](../sources/14-shared-risk-classification-figma-handoff.md).

## Context

- Current state: the contributor presentation implements a complete Risco 1
  path, while the Risco 2 Figma screens repeat the entry using a different
  visual grammar and inconsistent step totals.
- Problem: risk is not known when a contributor starts regularization, so two
  risk-specific entry flows duplicate behavior and expose an implementation
  detail to the user.
- Why now: Risco 2 work needs a stable shared foundation before documents,
  payment, analysis, requirements, and optional inspection are added.
- Related sources: Risco 1 section `2241:774`; Risco 2 blocks `2254:194` and
  `2261:194` on Figma page `AI Screens` (`2179:2`).

## Goals

- Present one establishment-regularization entry for contributors.
- Reuse the existing Risco 1 shell, page grammar, forms, masks, validation,
  progress, spacing, radius, and action alignment.
- Keep every editable draft field and classification answer empty initially.
- Classify the presentation deterministically as Risco 1 or Risco 2.
- Add a shared analysis state before displaying the classification result.
- Enable the existing automatic Risco 1 continuation without duplicating its
  entry screens.
- End the first Risco 2 slice at a complete, explanatory classification result
  prepared for the later document-analysis journey.
- Document the post-classification Risco 2 branches, including mandatory
  document analysis and optional inspection.

## Non-Goals

- Contributor document upload, payment, signature-provider integration,
  requirements, or inspection implementation.
- Triager, analyst, or inspector redesign.
- Production classification rules, persistence, APIs, authorization, or
  external providers.
- A `risk-one` or `risk-two` source module.
- Treating AI-generated Figma screens as a second design system.

## Brainstorm

### Problem Framing

The contributor starts a regularization request without knowing its risk
classification. The application must collect the common facts once, analyze
them, and then explain the selected rite. Success is a single coherent entry
whose Risco 1 and Risco 2 outcomes can be tested by changing answers.

### Gaps And Assumptions

- The presentation rule classifies all-negative answers as Risco 1 and any
  disqualifying answer as Risco 2.
- The current questionnaire is deliberately smaller than a production rules
  engine and remains a fixture contract.
- The Risco 2 Figma changes from six to eight total steps after documents and
  payment appear. The shared entry therefore owns a stable four-stage progress
  contract and branch-specific progress starts only after classification.
- Risco 2 requires document analysis. Inspection is optional and is decided
  after validation, although eligibility may be calculated earlier.
- State remains memory-only and resets on refresh.

### Counterpoints

- Copying the Risco 2 entry exactly would be faster, but it would retain two
  conflicting component grammars and make fixes diverge.
- Expanding the first slice through documents and payment would demonstrate a
  longer path, but would hide unresolved provider and upload contracts inside
  presentation-only code.
- A generic workflow engine could model every branch, but it is premature
  before the second branch is implemented.

### Options

| Option | Description | Benefits | Costs/Risks | When To Choose |
| --- | --- | --- | --- | --- |
| A | Keep separate Risco 1 and Risco 2 entries | Small isolated changes | Duplicate forms, state, routes, and components | Never for the accepted model |
| B | Share the entry and branch at classification | Coherent user model, maximum current reuse, bounded delivery | Requires refactoring current labels and transitions | Current initiative |
| C | Implement the complete Risco 2 lifecycle now | End-to-end demo | Large scope with unresolved provider and internal-role contracts | After the shared entry |

### Recommendation

Choose option B. Keep orchestration and classification in `modules/processes`,
consume company entities through the `companies` public API, retain the
existing contributor component grammar, and use Risco 2 Figma as a content and
state source when it does not conflict with the accepted journey.

## Architecture And Boundaries

- Web impact: `apps/web` owns routes, forms, presentation state, timers, and
  responsive UI.
- IDP impact: none.
- Future business API impact: authoritative establishment selection,
  classification, process creation, validation, and branch decisions.
- Data/persistence impact: extend the current in-memory process reducer only;
  no browser storage.
- External provider impact: none in this slice.
- Shared package impact: none.
- Module impact: `processes` owns the shared journey; `companies` continues to
  own company entities. Risk classifications remain values and documented
  paths.

## Performance And Scalability

- The shared entry keeps one active draft and performs a bounded synchronous
  fixture classification.
- The analysis screen uses one bounded timer and respects reduced motion.
- Production classification must move to an idempotent business API and must
  not run an unbounded client-side ruleset.
- Later company and establishment selectors require bounded server search and
  pagination before real data volume is introduced.

## Security, Privacy, LGPD, And Abuse

- No tokens, credentials, or real documents are introduced.
- Company and contributor values remain synthetic.
- Future logs must not include questionnaire answers, personal identifiers, or
  document content.
- Client classification and route guards are presentation behavior, not
  authorization or a legally authoritative decision.

## Accessibility And UX

- Every form field retains labels, required indicators, accessible errors, and
  keyboard operation.
- Progress exposes the current shared stage and does not change its total after
  classification.
- Analysis status uses a polite live region and reduced-motion timing.
- Actions remain responsive, prevent duplicate submission, and keep stable
  labels while loading.
- The Risco 2 result explains mandatory document analysis and conditional
  inspection without exposing an unavailable continuation action.

## Logging And Observability

- No telemetry is required for this presentation slice.
- Future APIs should emit redacted classification decision and duration events,
  process-transition metrics, and traces across the rules boundary.

## Acceptance Criteria

- [x] The contributor starts one establishment-regularization flow without
      choosing Risco 1 or Risco 2.
- [x] Request, establishment, and classification pages reuse the established
      Risco 1 visual and component grammar.
- [x] The common entry exposes a stable four-stage accessible progress model.
- [x] Every new draft starts with no company, empty establishment fields, and
      empty answers.
- [x] All-negative answers produce the Risco 1 result and continue to the
      existing automatic issuance branch.
- [x] Any affirmative disqualifying answer produces a Risco 2 result.
- [x] The Risco 2 result states that document analysis is mandatory and
      inspection is conditional after validation.
- [x] A shared analysis screen appears before either result and respects
      reduced motion.
- [x] Route files and URL segments remain English while visible copy remains
      Brazilian Portuguese.
- [x] Focused unit tests, route tests, E2E coverage, typecheck, check, and build
      pass or have explicit recorded blockers.

## Verification Plan

- Unit tests: reducer transitions, classification outcome, empty reset, and
  branch safety.
- Route/component tests: shared analysis route and Risco 2 result rendering.
- E2E: complete both the Risco 1 and Risco 2 shared entry scenarios.
- Commands: `pnpm --filter web check`, `pnpm --filter web typecheck`,
  `pnpm --filter web test`, focused `pnpm --filter web test:e2e`, and
  `pnpm --filter web build`.

## Execution And Backlog

- Execution plan:
  `docs/initiatives/tasks/14-apps-web-shared-risk-classification-entry.md`.
- Deferred: Risco 2 responsible, declaration, documents, payment, protocol,
  validation, requirements, optional inspection, and issuance.

## Open Questions

- None blocking. The product decision establishes mandatory document analysis
  and optional inspection after validation for Risco 2.
