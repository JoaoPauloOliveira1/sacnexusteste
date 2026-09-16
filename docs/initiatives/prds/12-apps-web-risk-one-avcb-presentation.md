# Apps Web Risco 1 AVCB Presentation PRD

> Domain correction (2026-07-29): Risco 1 issues the Declaração de Dispensa de
> Licenciamento do Corpo de Bombeiros (DDLCB), not an AVCB. The historical
> initiative name is retained for traceability; active UI and durable journey
> documentation follow the corrected taxonomy.

## Summary

Rebuild the contributor-facing `Risco 1` presentation journey from the current
Figma source, replacing the first presentation implementation with a
componentized, production-shaped frontend that keeps all business data in
memory. The implementation covers the eleven Figma frames from the empty
dashboard through automatic AVCB issuance and completed-process details.

Execution plan:
[`docs/initiatives/tasks/12-apps-web-risk-one-avcb-presentation.md`](../tasks/12-apps-web-risk-one-avcb-presentation.md).

Design and component catalog:
[`docs/initiatives/sources/12-risk-one-figma-component-catalog.md`](../sources/12-risk-one-figma-component-catalog.md).

## Context

- Initial state: `apps/web/src/modules/risk-one` contained a broad presentation
  implementation created before the current Figma journey was available.
- Problem: its visual hierarchy, route sequence, data model, persistence model,
  and component boundaries no longer match the approved presentation.
- Why now: the product has a working design source and needs a reusable
  component foundation before more contributor and process journeys are added.
- Source: Figma file `SACNexus - Design`, page `AI Screens`, section
  `2241:774` (`Risco 1`), frames `2181:6` through `2181:16`.

## Goals

- Match the eleven Risco 1 Figma screens and their visible state transitions.
- Build the shell from the official shadcn `sidebar-07` block architecture.
- Establish reusable domain compositions before implementing page-specific
  markup.
- Use existing shared shadcn/Base UI primitives wherever possible.
- Keep routes thin and expose route-level screens through the `processes`
  module public API, with Risco 1 represented only as a domain classification
  and documented user journey.
- Keep company registration and the company collection in the `companies`
  module and require explicit company selection for a new process.
- Keep sidebar destinations aligned with their capability: AVCB process
  collection, company entity, document collection, and notification
  collection.
- Use English for URL segments, route parameters, and search-parameter keys
  while preserving Brazilian Portuguese visible copy.
- Model the presentation identity as separate user and profile entities, with
  an explicit contributor-to-company relationship and capabilities.
- Keep presentation state in a replaceable in-memory provider contract.
- Preserve keyboard, screen-reader, mobile, zoom, loading, empty, disabled, and
  completed-state usability.

## Non-Goals

- Backend, API, database, or production persistence integration.
- Treating browser fixtures or in-memory state as production contracts.
- Real COSCIP classification, payment, inspection, document signing, or
  authoritative PDF generation.
- Risco 2, Risco 3, the operational map, authentication, or account-creation
  redesign.
- Redesigning public consultation, institutional content, or auxiliary
  certificate/history routes before their own Figma sources are approved.

## Brainstorm

### Problem Framing

The contributor must be able to demonstrate a coherent AVCB journey that looks
and behaves like a production application, while the implementation remains
simple enough to replace with server-backed contracts later. Success is a
complete navigable flow whose pages share one shell, page grammar, status
language, data model, and action model.

### Gaps And Assumptions

- Figma provides desktop frames at `1440 × 900`; responsive behavior is not
  explicitly designed and must be derived mobile-first.
- The Figma source has no bound variables; semantic project tokens will map the
  observed colors, typography, spacing, and status treatments.
- The requested presentation stores state only for the current runtime. A
  browser refresh intentionally resets the scenario, while one runtime may
  create and retain multiple completed processes for repeated testing.
- The synthetic contributor may have registered companies, but each new
  process starts without a selected company. Every editable registration,
  establishment, and questionnaire value starts empty.
- Required fields expose a visible and screen-reader-readable indicator, and
  inputs provide format or content examples as placeholders.
- Structured Brazilian inputs apply progressive local masks for CNPJ, CEP,
  opening date, landline, and mobile numbers without fetching or prepopulating
  external data.
- The three questionnaire answers classify the fixture as Risco 1 when all are
  `Não`.
- Download and copy actions are demonstrable client actions; they do not imply
  a real signed document service.

### Counterpoints

- Keeping the former `localStorage` snapshot would make refresh demonstrations
  convenient, but it conflicts with the requested in-memory boundary and
  increases migration coupling.
- Copying every Figma frame as independent markup would be faster initially,
  but would duplicate the shell, cards, badges, navigation, headers, actions,
  and state rules eleven times.
- Extracting a workspace package now would be premature because reuse exists
  only inside one browser module.

### Options

| Option | Description | Benefits | Costs/Risks | When To Choose |
| --- | --- | --- | --- | --- |
| A | Patch the existing screens and retain their store | Smaller diff | Preserves obsolete routes, state, copy, and coupling | Only for an emergency demo |
| B | Rebuild the contributor process flow around capability modules and a process provider | Matches Figma, creates reusable foundations, keeps classification separate from architecture | Larger bounded rewrite | Current initiative |
| C | Build a generic workflow framework and shared package | Maximum theoretical reuse | Premature abstraction and slower delivery | After a second proven consumer |

### Recommendation

Choose option B. Keep process orchestration in `modules/processes`, company
registration and company entities in `modules/companies`, and Risco 1 only in
classification rules, visible domain language, tests, and documentation.
Retain unrelated auth, map, and auxiliary public surfaces until their own
design work is scoped.

## Architecture And Boundaries

- Web impact: `apps/web` owns all routes, presentation components, forms, and
  ephemeral state.
- Route impact: technical URLs use English and group contributor destinations
  under `/processes`, `/companies`, `/documents`, and `/notifications`.
- Auth impact: the presentation models separate `User`, `Profile`, and
  `DemoSession` entities. The contributor profile relates the user to a
  company and contributor capabilities.
- IDP impact: no runtime integration; real identity and profile assignment are
  deferred to the IDP.
- Future business API impact: process creation, classification, issuance,
  document metadata, and authorization will eventually be server-owned.
- Data/persistence impact: one in-memory provider with a version-independent
  `state`, `actions`, and `meta` interface, one active draft, and a completed
  process collection, plus a separate in-memory company collection; no
  `localStorage`.
- External provider impact: none.
- Shared package impact: none.
- Shared UI impact: install only official shadcn primitives required by
  `sidebar-07`; business compositions remain under
  `modules/processes`.

## Performance And Scalability

- The presentation holds a bounded synthetic company collection, at most one
  active draft, and multiple completed process snapshots for the current
  runtime.
- Completed process tables render the in-memory collection. Production
  integration must replace it with bounded pagination before real data volume
  is introduced.
- Derived metrics and navigation counts are computed from provider state
  without effects or duplicate stores.
- The processing animation uses a bounded timer sequence and respects reduced
  motion.
- A future API implementation must replace fixture arrays with bounded,
  paginated process and document queries.
- Submission actions must become server-idempotent before production; the
  presentation prevents duplicate local submission through disabled state.

## Security, Privacy, LGPD, And Abuse

- No auth token, secret, or privileged endpoint is stored in browser state.
- Fixture company and person data are synthetic presentation data.
- Fixture credentials are resolved locally, but passwords are not persisted in
  the browser session projection.
- Client navigation is not authorization.
- Clipboard/download actions expose only the synthetic document fixture.
- Future logs must exclude declarations, personal data, tokens, and complete
  document payloads.

## Accessibility And UX

- All navigation and actions remain keyboard accessible with visible focus.
- The sidebar is collapsible on desktop and becomes an accessible sheet on
  mobile.
- Page landmarks, headings, fieldsets, legends, labels, descriptions, and live
  processing status are semantic.
- Desktop card grids collapse without horizontal page scrolling; data tables
  use contained horizontal overflow where necessary.
- Motion is reduced when the user requests reduced motion.
- Loading and submission controls remain disabled without changing their label
  or causing layout shift.

## Logging And Observability

- No runtime telemetry is required for the in-memory presentation.
- Future integration should emit structured process-transition events,
  duration metrics for classification/issuance, and traces across business API
  boundaries.
- Sensitive field values and generated document contents must be redacted.

## Acceptance Criteria

- [x] The empty dashboard matches Figma frame `2181:6`.
- [x] The service, request, establishment, questionnaire, result, review, and
      processing screens match frames `2181:7` through `2181:13`.
- [x] The emitted document, completed dashboard, and process details screens
      match frames `2181:14` through `2181:16`.
- [x] The official shadcn `sidebar-07` architecture provides the responsive
      application shell.
- [x] Component selection follows existing shared primitive, official shadcn,
      compatible registry, then custom composition order.
- [x] The flow works entirely in memory and resets on browser refresh.
- [x] A contributor can complete multiple processes in one runtime without
      replacing earlier completed-process snapshots.
- [x] Every editable company, establishment, and questionnaire value starts
      empty; placeholders provide examples without becoming submitted values.
- [x] Every required company, establishment, and classification field exposes
      a visible and accessible required indicator.
- [x] CNPJ, CEP, opening date, landline, and mobile inputs apply progressive
      Brazilian masks while the contributor types.
- [x] A new process requires explicit selection of a registered company and
      offers a path to register another company.
- [x] The AVCB sidebar destination lists every completed AVCB process instead
      of opening only the latest record.
- [x] Company sidebar items open company-owned detail content instead of a
      process request screen.
- [x] Documents and notifications open their own collection modules instead of
      the latest completed process.
- [x] Route files, URL segments, dynamic parameters, and search keys use
      English while visible labels remain in Brazilian Portuguese.
- [x] The visual system uses the measured Figma values for the content canvas,
      typography, palette, card/input/button radii, and repeated spacing.
- [x] Every numbered request step exposes the same accessible journey progress
      bar at 25%, 50%, 75%, or 100%.
- [x] Buttons with loading behavior reserve balanced spinner space so their
      labels remain centered before and during submission.
- [x] Forms validate with React Hook Form and Zod and expose accessible errors.
- [x] Back, cancel, save, review, copy, download, and navigation actions work.
- [x] Duplicate submission is prevented and processing status is announced.
- [x] Focused unit/component tests, route tests, the Risco 1 E2E flow, Biome,
      typecheck, and production build pass.
- [x] Risco 1 is represented only as a classification rule, visible domain
      language, test scenario, and documented journey; it has no source folder,
      provider, state type, or component namespace.
- [x] Contributor authentication resolves separate user/profile entities and a
      typed company relationship without persisting passwords.
- [x] All document download entry points generate the same institutionally
      structured PDF with validation data and an explicit demonstration
      watermark.

## Verification Plan

- Unit/component tests: state transitions, classification, forms, shell
  navigation, status components, and action disabled states.
- Integration/contract tests: route-to-screen wiring and provider continuity.
- E2E/manual accessibility checks: complete keyboard journey, responsive
  sidebar, processing transition, clipboard/download behavior, and 200% zoom.
- Migration/deployment checks: none; presentation-only browser code.
- Commands: `pnpm --filter web check`, `typecheck`, `test`, focused
  `test:e2e`, and `build`.

## Execution And Backlog

- Execution plan:
  `docs/initiatives/tasks/12-apps-web-risk-one-avcb-presentation.md`.
- Deferred: server-owned persistence, production classification, official
  signed PDF, durable public links, process pagination, identity/profile
  administration, and authorization.

## Open Questions

- None blocking. The supplied Figma section and screenshots define the current
  presentation scope.
