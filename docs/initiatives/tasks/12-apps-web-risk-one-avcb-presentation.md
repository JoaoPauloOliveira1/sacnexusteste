# Apps Web Risco 1 AVCB Presentation - Execution Plan

> Domain correction (2026-07-29): the completed Risco 1 journey now issues a
> DDLCB. Historical task wording below is retained as an execution record.

## Source

- PRD:
  [`docs/initiatives/prds/12-apps-web-risk-one-avcb-presentation.md`](../prds/12-apps-web-risk-one-avcb-presentation.md)
- Figma catalog:
  [`docs/initiatives/sources/12-risk-one-figma-component-catalog.md`](../sources/12-risk-one-figma-component-catalog.md)
- Figma section: `2241:774`

## Implementation Principles

- Replace the obsolete central journey instead of layering Figma-specific
  conditions over it.
- Keep route files thin and business compositions inside
  `modules/processes`.
- Use existing shared primitives first and official shadcn registry items
  second.
- Use the `sidebar-07` structure without copying generic sample business data.
- Keep state dependency-injectable through a provider contract.
- Keep current authentication, account creation, map, and auxiliary public
  surfaces outside this rewrite.

## Tasks

### Phase 1: Baseline And Design Intake

- [x] Confirm the web ownership and in-memory presentation boundary.
- [x] Inspect root, web, shared-component, and documentation instructions.
- [x] Read the architecture, initiative, web, shadcn, composition, Tailwind,
      router, and Vitest skills.
- [x] Resolve the Risco 1 Figma section and all eleven frame IDs.
- [x] Fetch individual Figma design context and screenshots for every frame.
- [x] Audit the existing Risco 1 module, routes, store, tests, and durable docs.
- [x] Catalog existing primitives, official registry components, and domain
      compositions.

### Phase 2: Component Foundation

- [x] Add the official shadcn primitives required by `sidebar-07` without
      overwriting locally customized shared primitives.
- [x] Implement the responsive contributor shell from the `sidebar-07`
      composition.
- [x] Implement reusable page header, page actions, metric, status, summary,
      document, processing, and process-list compositions.
- [x] Map observed Figma colors and states to semantic project tokens.
- [x] Add focused component tests for the new reusable compositions.

### Phase 3: In-Memory Presentation Domain

- [x] Replace the former persistence/store model with a reducer-backed provider
      exposing `state`, `actions`, and `meta`.
- [x] Define the exact company, establishment, questionnaire, process, document,
      and history fixtures used by the Figma flow.
- [x] Implement deterministic Risco 1 classification and bounded automatic
      processing transitions.
- [x] Keep browser refresh intentionally reset to the empty dashboard.
- [x] Add unit tests for the successful lifecycle, declaration gate, and reset
      path.

### Phase 4: Contributor Journey

- [x] Implement the empty and completed dashboard variants.
- [x] Implement service selection and request confirmation.
- [x] Implement establishment registration with React Hook Form and Zod.
- [x] Implement the accessible three-question classification form.
- [x] Implement classification result and response review.
- [x] Implement final review and declaration gating.
- [x] Implement automatic processing with stable status and reduced motion.
- [x] Implement emitted-document success and completed process details.
- [x] Connect copy, download, back, cancel, and forward actions.

### Phase 5: Routes And Compatibility

- [x] Add the request-confirmation route and update the central route sequence.
- [x] Keep all route files thin and imports behind the `processes/index.ts`
      public API.
- [x] Preserve out-of-scope auth, account creation, map, and auxiliary public
      routes without carrying their UI into the new journey shell.
- [x] Regenerate the TanStack Router tree through the package script.

### Phase 6: Quality And Documentation

- [x] Replace obsolete route and E2E expectations with the eleven-screen flow.
- [x] Verify accessible names/errors, live status, focus treatments, reduced
      motion behavior, responsive mobile sidebar, and no horizontal page
      scroll.
- [ ] Run `pnpm --filter web check`.
- [x] Run `pnpm --filter web typecheck`.
- [x] Run `pnpm --filter web test`.
- [x] Run the focused Risco 1 Playwright test.
- [x] Run `pnpm --filter web build`.
- [x] Update durable web architecture and security docs for the new in-memory
      provider and shell.
- [x] Record skipped checks, blockers, and final evidence below.

### Phase 7: Production-Shaped Repeated Testing And Visual Calibration

- [x] Replace prefilled establishment fields and questionnaire answers with
      empty draft values.
- [x] Preserve account-owned company and representative values as read-only
      synthetic identity data.
- [x] Retain multiple completed process snapshots while allowing one new active
      draft at a time.
- [x] Generate deterministic unique process/document identities for repeated
      in-memory runs.
- [x] Render all completed processes in the dashboard and resolve document and
      detail routes by process ID.
- [x] Re-audit the Figma source for exact colors, typography, content padding,
      card radius, input dimensions, button radius, and repeated gaps.
- [x] Add reducer and E2E coverage for empty drafts and two consecutive
      completed processes.
- [x] Re-run the full verification and preflight suite.

### Phase 8: Profiles And Document Identity

- [x] Keep route imports behind the `modules/processes` public API.
- [x] Model synthetic users, discriminated contributor/Triager profiles,
      capabilities, company relationship, and a versioned demo session.
- [x] Route contributor and Triager fixtures through profile-aware guards and
      preserve no password in browser storage.
- [x] Consolidate all AVCB download actions into one vector PDF generator.
- [x] Add print-specific tokens, institutional information hierarchy,
      validation QR/hash, and an explicit demonstration watermark.
- [x] Add profile/session regression coverage and update durable architecture,
      security, auth, PRD, task, and catalog documentation.

### Phase 9: Capability Modules And Explicit Form State

- [x] Remove every Risco 1 source and test directory namespace.
- [x] Rename provider, state, reducer, hooks, types, data, and page
      compositions around processes and classification instead of Risco 1.
- [x] Introduce `modules/companies` as the owner of company entities,
      registration, fixtures, and the in-memory company collection.
- [x] Require explicit company selection for every new process and expose
      company registration from the selection screen and sidebar.
- [x] Start company registration, process company selection, establishment
      fields, and classification answers without editable default values.
- [x] Add meaningful placeholders and visible/screen-reader required markers to
      company, establishment, and classification fields.
- [x] Reuse shared progressive masks for CNPJ, CEP, landline, and mobile fields,
      and add a shared Brazilian date formatter for the opening date.
- [x] Derive the shared journey progress bar from steps 1 through 4 and keep
      loading-capable button labels visually centered with balanced spinner
      space.
- [x] Document Risco 1 as a cross-capability user journey rather than a source
      boundary.

### Phase 10: Capability Destinations And English Routes

- [x] Replace the latest-process shortcuts for AVCB and completed requests with
      a complete AVCB process collection page.
- [x] Add a company-owned details screen and route each sidebar company to its
      own entity URL.
- [x] Add document and notification collection modules and route their sidebar
      destinations independently from process details.
- [x] Rename Portuguese route files, URL segments, dynamic parameters, and
      search keys to English.
- [x] Update navigation and route tests for the new technical URL contract.

## Verification Evidence

- `corepack pnpm --filter web typecheck`: passed.
- `corepack pnpm --filter web test`: passed, 29 files and 102 tests.
- `corepack pnpm --filter web build`: passed; the existing map and crest assets
  still produce bundle-size warnings.
- `corepack pnpm --filter web exec playwright test
  tests/e2e/auth.spec.ts tests/e2e/contributor-avcb.spec.ts`: passed, with the
  broader Chromium suite also passing all 27 scenarios, including
  raw-digit-to-mask assertions for CEP, CNPJ, date, landline, and mobile,
  profile-aware sign-in, explicit company selection,
  registration without prefilled editable values, required indicators,
  placeholders, two consecutive completed processes, AVCB/company/document/
  notification destination separation, English URL assertions, generated PDF
  download and size assertion, responsive sidebar, and mobile overflow
  assertion.
- Focused Biome check over the affected TypeScript, TSX, and CSS files: passed.
- The generated PDF was rasterized at high resolution and visually inspected
  for hierarchy, watermark, QR code, legibility, page background, and print
  bounds.
- Full `corepack pnpm --filter web check`: blocked only by four existing SVG
  accessibility findings and the existing oversized CBMPE crest outside this
  initiative.

## Risks And Follow-Ups

- [ ] Replace client fixtures and timers with authorized, idempotent business
      API contracts before production.
- [ ] Scope public document validation, signed PDF generation, and durable links
      as a separate Figma-backed initiative.
- [ ] Replace synthetic user/profile fixtures with IDP-owned sessions and
      server-enforced company/profile authorization.
- [ ] Validate the official document template, state visual identity, legal
      copy, signature, and issuing authority with CBMPE before production.
