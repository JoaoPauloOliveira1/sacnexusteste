# Apps Web Canonical Process And Issued Documents PRD

## Overview

This initiative replaces isolated contributor, triage, analysis, and
inspection presentation snapshots with one canonical browser process model. It
also corrects the final-document taxonomy for Risco 1 and Risco 2.

Execution plan:
[`docs/initiatives/tasks/17-apps-web-canonical-process-and-issued-documents.md`](../tasks/17-apps-web-canonical-process-and-issued-documents.md).

Source handoff:
[`docs/initiatives/sources/17-canonical-process-and-issued-documents-handoff.md`](../sources/17-canonical-process-and-issued-documents-handoff.md).

## Goals

- Make a contributor request visible as the same process to every authorized
  internal profile.
- Keep protocol identity, classification, current stage, ownership, history,
  requirements, inspection decision, and issued documents in one canonical
  aggregate.
- Preserve capability ownership: processes own lifecycle identity and
  transitions; triage, analysis, and inspections own their role interfaces.
- Persist fictional presentation state across profile changes and refreshes.
- Support more than one process and more than one issued document per process.
- Emit DDLCB for Risco 1 and expose AVCB plus Atestado de Vistoria for Risco 2.

## Functional Requirements

- Protocol creation appends or updates a canonical process record.
- Internal queues are projections of canonical records eligible for each
  capability.
- Every accepted internal action updates the canonical current stage and
  append-only history.
- Contributor pages reflect internal requirements, decisions, inspection
  outcomes, and final documents after a profile change or refresh.
- Issued documents have explicit kinds, labels, numbers, issue dates,
  validity, and validation identifiers.
- Generic `AR/AVCB` and Risco 1 `AVCB` labels are removed from active journey
  screens and generated PDFs.
- Browser persistence is versioned, fault-tolerant, and contains presentation
  data only.

## Non-Goals

- Production database, APIs, authorization, concurrency control, audit
  signatures, secure files, payments, or legally valid issuance.
- A complete BRE/COSCIP rules engine.
- Treating Risco 1 or Risco 2 as source-code modules.
- Redesigning accepted Figma layouts outside terminology and data-driven
  behavior required by this initiative.

## Acceptance Criteria

- A Risco 2 request protocolled by the Contributor appears in the Triager
  queue with the same process and protocol identifiers.
- Triage approval makes that process eligible for technical analysis.
- A technical inspection decision controls whether the process enters the
  inspection queue.
- Final internal approval is visible to the Contributor without recreating a
  separate request fixture.
- A completed Risco 1 process lists and downloads a DDLCB.
- A completed Risco 2 process lists AVCB and Atestado de Vistoria as distinct
  final document records.
- Existing role guards, responsive behavior, keyboard access, typecheck,
  tests, and production build remain valid.
