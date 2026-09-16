# Apps Web Triager Risco 2 Presentation Tasks

Execution checklist for [`docs/initiatives/prds/13-apps-web-triager-risk-two-presentation.md`](../prds/13-apps-web-triager-risk-two-presentation.md).

## Phase 1: Functional Mapping

- [x] Map the supplied Triador document to queue, process, document, checklist, requirement, status, and history behavior.
- [x] Preserve the contributor AVCB flow while keeping Risco 1 as a
      classification rather than an independent module.

## Phase 2: Presentation Domain

- [x] Create the `triage` business module and public API.
- [x] Add complete Risco 2 process, document-version, checklist, requirement, and history fixtures.
- [x] Add versioned presentation persistence.
- [x] Add deterministic demonstration-profile resolution without storing credentials or tokens.

## Phase 3: Triager Experience

- [x] Implement indicators and priority queue.
- [x] Implement search, status, and priority filters.
- [x] Implement the complete process header and administrative entity views.
- [x] Keep BRE classification read-only.
- [x] Implement document preview, download, and version comparison.
- [x] Implement all administrative checklist groups and gated approval.
- [x] Implement administrative requirement creation and history.
- [x] Implement corrections received, new triage, and distribution transitions.
- [x] Keep cancel unavailable unless a future rule enables it.

## Phase 4: Login And Routing

- [x] Route the contributor demonstration login to Risco 1.
- [x] Route the Triador demonstration login to `/triage`.
- [x] Guard Triador routes with the active demonstration profile.

## Phase 5: Quality

- [x] Add unit coverage for fixtures, checklist completeness, and profile resolution.
- [x] Add focused end-to-end coverage for login, approval, requirements, and corrections.
- [x] Run Biome check.
- [x] Run typecheck.
- [x] Run unit tests.
- [x] Run focused Playwright tests.
- [x] Run the production build.
