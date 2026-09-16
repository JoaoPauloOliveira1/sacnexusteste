# Apps Web Internal Risco 2 Lifecycle PRD

## Overview

This initiative completes the presentation-side Risco 2 lifecycle for CBMPE
internal profiles after the contributor protocols a request. It evolves the
existing Triador presentation into a coherent sequence across administrative
triage, mandatory technical document analysis, and optional inspection.

Execution plan:
[`docs/initiatives/tasks/16-apps-web-internal-risk-two-lifecycle.md`](../tasks/16-apps-web-internal-risk-two-lifecycle.md).

Source handoff:
[`docs/initiatives/sources/16-internal-risk-two-journey-handoff.md`](../sources/16-internal-risk-two-journey-handoff.md).

## Goals

- Present one coherent process lifecycle across contributor and internal
  profiles.
- Give every internal profile an explicit identity, capability set, route
  boundary, navigation, queue, and permitted actions.
- Preserve mandatory document analysis and make inspection a decision taken
  only after the required validation.
- Reuse the established SAC Nexus visual grammar and shared components.
- Keep triage, analysis, inspections, documents, and notifications as
  capability-owned modules.
- Make every transition visible in process status, history, queues, and the
  contributor projection.

## Roles

### Triager

- Confirms administrative completeness and duplicate warnings.
- Reviews submitted document metadata for administrative validity.
- Issues administrative requirements.
- Distributes eligible processes for technical analysis.
- Cannot alter the BRE classification or perform technical decisions.

### Technical Analyst

- Performs the mandatory technical document analysis.
- Records checklist decisions and technical notes.
- Issues technical requirements and reviews corrections.
- Approves the document analysis.
- Decides whether inspection is required according to the presentation
  scenario.

### Inspector

- Receives only processes with an approved inspection decision.
- Manages proposed and confirmed schedules.
- Records the inspection outcome and field requirements.
- Approves, requests correction, or returns a process for reinspection.

## Functional Requirements

- Internal pages use a shared responsive sidebar shell and the established
  tokens, spacing, radii, typography, badges, alerts, cards, tables, and action
  alignment.
- Queue items expose protocol, company, establishment, risk, status, priority,
  current owner, received date, and SLA signal.
- Process details preserve a single canonical header and history across roles.
- Requirements retain author, role, reason, foundation, deadline, attachments,
  responses, and status.
- Distribution, assignment, analysis, inspection decision, scheduling, and
  outcomes are explicit state transitions.
- Actions are disabled outside the active role and phase.
- Presentation state is deterministic, versioned, fictional, and resettable.
- URLs, route segments, code, and documentation remain in English.

## Non-Goals

- Production authentication, authorization, persistence, workflow APIs, file
  storage, signatures, payments, notifications, or legal issuance.
- A real rules engine or authoritative BRE/COSCIP interpretation.
- Real analyst or inspector identities, documents, process records, or
  decisions.
- Making Risco 2 a module or coupling internal UI directly to contributor page
  components.

## Acceptance Criteria

- The Triager area visually belongs to the same SAC Nexus application as the
  contributor portal.
- The accepted Risco 2 protocol appears as a coherent internal projection.
- Administrative triage supports approval and requirement/correction loops.
- Approved triage enters a technical-analysis queue.
- Technical analysis is mandatory and supports requirement/reanalysis.
- Inspection can be waived or required only after document approval.
- Required inspections support scheduling, outcome, correction, and final
  approval.
- Contributor-visible status and history reflect internal transitions.
- Role guards prevent a profile from entering another role's workspace.
- Unit, route, E2E, accessibility-oriented interaction, typecheck, Biome, and
  production-build verification cover the implemented slices.
