# Apps Web Contributor Risco 2 Lifecycle PRD

> Domain correction (2026-07-29): the approved terminal state projects two
> distinct documents, AVCB and Atestado de Vistoria. Generic `AR/AVCB` wording
> below is historical Figma terminology.

## Summary

Complete the contributor-facing Risco 2 presentation after the shared
classification entry. The journey collects the responsible person and
declaration, prepares required documents in memory, simulates payment,
protocols the request, performs mandatory validation, handles one requirement,
and then branches to issuance with or without an optional inspection.

Execution plan:
[`docs/initiatives/tasks/15-apps-web-contributor-risk-two-lifecycle.md`](../tasks/15-apps-web-contributor-risk-two-lifecycle.md).

## Context

- Current state: initiative 14 classifies a request as Risco 2 but stops at the
  result and leaves an active draft.
- Problem: the contributor cannot complete or demonstrate the mandatory
  document-analysis rite.
- Why now: the shared entry and canonical Risco 1 component grammar are stable,
  and the Figma handoff contains the remaining contributor states.
- Related sources: initiative 14 Figma handoff and the Risco 2 block
  screenshots supplied in the working session.

## Goals

- Complete the contributor Risco 2 lifecycle through document issuance.
- Preserve the Risco 1 visual system, shell, spacing, progress, actions, and
  accessible form patterns.
- Keep document analysis mandatory and inspection conditional after
  validation.
- Model responsible person, declaration, document metadata, payment,
  protocol, requirement, inspection, and completion as explicit in-memory
  process state.
- Support save-and-resume for every non-terminal phase.
- Keep technical routes, filenames, code, and docs in English.

## Non-Goals

- Real uploads, file contents, malware scanning, object storage, payment,
  Gov.br, digital certificates, notifications, or signatures.
- Authoritative risk rules, analyst decisions, inspection operations, APIs,
  persistence, or authorization.
- Internal firefighter, triager, analyst, or inspector interfaces.
- A risk-specific source module or a generic workflow engine.
- Legally valid AR/AVCB issuance.

## Brainstorm

### Problem Framing

Risco 2 is a longer rite through existing capabilities rather than a module.
The contributor must understand what is pending, respond to an actionable
requirement, and see why inspection may or may not be necessary.

### Gaps And Assumptions

- The presentation stores file metadata only and never persists file content.
- The accepted fixture charge is R$ 286,40 and no real transaction is created.
- The first validation emits one deterministic document requirement so the
  response loop remains demonstrable.
- After the requirement is answered, the fixture uses the inflammable-material
  answer to exercise the inspection-required branch. Other affirmative
  classification answers demonstrate issuance without prior inspection.
- The common entry retains its four stable stages. Risco 2 complementing uses
  a separate five-stage progress contract.

### Counterpoints

- Copying every Figma screen verbatim would preserve inconsistent step totals
  and two component grammars.
- Skipping the requirement would shorten the demo but omit the central
  contributor interaction in mandatory analysis.
- Letting the contributor approve analysis or inspection would be misleading.
  Bounded timers instead represent external status changes in the
  presentation.

### Options

| Option | Description | Benefits | Costs/Risks | When To Choose |
| --- | --- | --- | --- | --- |
| A | Stop after protocol | Small slice | Does not complete the requested journey | Not selected |
| B | Complete one deterministic lifecycle with both branch rules | Full contributor demo, explicit state, testable | More routes and reducer transitions | Current initiative |
| C | Add real providers and internal roles | Production fidelity | Requires backend, security, contracts, and operations | Future initiatives |

### Recommendation

Choose option B. Extend `modules/processes`, reuse installed shadcn primitives,
store bounded synthetic state in the existing provider, and document all real
provider and authority boundaries.

## Architecture And Boundaries

- Web impact: pages, English routes, Zod forms, file metadata, timers, reducer
  transitions, PDF variant, and tests in `apps/web`.
- IDP impact: none; the existing contributor demo profile remains the actor.
- Future business API impact: process commands, upload slots, payment,
  validation, requirements, inspection scheduling, status events, and
  issuance.
- Data/persistence impact: memory-only reducer state that resets on refresh.
- External provider impact: simulated only.
- Shared package impact: none.
- Module impact: `processes` owns orchestration; `companies` remains the
  company source; `documents` remains the document collection projection.

## Performance And Scalability

- One active draft and five bounded document metadata records are held in
  memory.
- Status simulation uses one cancellable timer per validation/inspection page
  and respects reduced motion.
- Production lists, conversations, and histories require bounded pagination.
- Uploads must move directly to controlled object storage with size, type,
  malware, retention, and authorization enforcement.
- Payment and protocol commands require idempotency before external
  integration.

## Security, Privacy, LGPD, And Abuse

- Only synthetic CPF, contact, file names, and process values are used.
- File bytes are not stored, logged, or persisted.
- Future APIs must enforce tenant and process ownership at every transition.
- Document content, CPF, contact data, signatures, and payment data must not be
  logged.
- Client transitions are presentation behavior and are not authoritative
  authorization or legal decisions.

## Accessibility And UX

- Required fields have labels, indicators, masks, errors, and disabled states.
- Radio groups, checkboxes, upload controls, progress, status, and timers
  remain keyboard and screen-reader operable.
- Reduced motion shortens simulated waits and removes animation.
- Mobile layouts stack actions and cards without horizontal overflow.
- Duplicate protocol, payment, requirement, and inspection actions are blocked
  by state guards.

## Logging And Observability

- No telemetry is added to the presentation.
- Future services should emit redacted command outcomes, state-transition
  durations, requirement deadlines, upload scan results, payment events, and
  inspection scheduling metrics.

## Acceptance Criteria

- [x] A Risco 2 result continues to a five-stage complementing flow.
- [x] The responsible form uses profile identity as read-only context and
      leaves editable CPF, phone, relationship, and role fields empty.
- [x] Declaration acceptance and signature method are required.
- [x] Required document metadata must be prepared before payment; generated
      declaration metadata is carried from the prior stage.
- [x] Payment, review, and protocol prevent incomplete duplicate actions.
- [x] Mandatory validation opens a requirement that accepts a response and
      corrected document metadata.
- [x] Post-validation state branches to direct issuance or conditional
      inspection.
- [x] The inspection branch supports scheduling and an externally simulated
      outcome.
- [x] Completion adds a Risco 2 process, history, document projection, and a
      Risco 2 PDF variant.
- [x] Every active phase can be resumed through English routes.
- [x] Targeted unit, E2E, typecheck, check, build, and visual verification are
      recorded.

## Verification Plan

- Unit: schemas, reducer guards, document completion, requirement response,
  direct issuance, and inspection issuance.
- Route/component: every new route renders from the public process API.
- E2E: complete a full Risco 2 inspection-required contributor journey and
  retain shared-entry/Risco 1 regressions.
- Commands: `pnpm --filter web check`, `pnpm --filter web typecheck`,
  `pnpm --filter web test`, focused Playwright, and
  `pnpm --filter web build`.

## Execution And Backlog

- Execution plan:
  `docs/initiatives/tasks/15-apps-web-contributor-risk-two-lifecycle.md`.
- Deferred: authoritative APIs, secure uploads, providers, internal-role
  interfaces, real-time status, and production audit.

## Open Questions

- None blocking for the presentation. Business rules and internal-role
  workflows remain future authoritative contracts.
