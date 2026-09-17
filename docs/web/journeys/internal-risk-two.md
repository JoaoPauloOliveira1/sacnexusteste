# Internal Risco 2 Journey

## Purpose

This document describes the presentation contract for the internal Risco 2
journey after a contributor protocols a request. Risco 2 is a journey across
capabilities; it is not a source-code module.

## Roles And Entry Points

| Role | Demo credential | Route | Responsibility |
| --- | --- | --- | --- |
| Triager | `triador@email.com` | `/triagem` | Administrative and technical review, requirements, and inspection decision |
| Inspector | `vistoriador@email.com` | `/inspections` | Scheduling, field verification, requirements, and inspection outcome |

The internal demo password is `demonstracao`.

## Capability Sequence

1. The triager receives the protocol after contributor submission.
2. The same triager verifies registration data, required files, legibility,
   document content, and declared fire-safety conditions in one dossier.
3. The triager records one explicit, reasoned decision:
   - waive prior inspection and continue the issuance path; or
   - require an inspection and project the process to the inspection queue.
4. When required, the inspector schedules and performs the visit.
5. Triager or field requirements return to the responsible internal stage
   after the contributor correction is received.
6. An approved inspection projects the process to issuance of both the AVCB
   and the Atestado de Vistoria.

## Ownership Boundaries

- The triage workspace owns the unified administrative and technical review.
- `modules/inspections` owns the optional field-inspection branch.
- `modules/processes` owns the contributor-facing process journey.
- Shared visual chrome belongs to `modules/shared`.

No `risk-two` module or folder should be introduced. Risk classification is
process state that coordinates the capability modules.

## Presentation State

The current implementation uses one versioned canonical browser aggregate for
the process identity, protocol, classification, lifecycle stage, public
history, and issued documents. Triage and inspection derive
role-specific queue projections from that aggregate and record lifecycle
transitions back into it. Capability-owned checklist and composer data remain
local presentation projections.

Administrative, technical, and inspection requirements create a
contributor-visible requirement record in the canonical aggregate. A
contributor response stores only synthetic attachment metadata in the current
presentation, appends the public history, and projects the process back to the
internal stage that emitted the requirement.

This is intentionally a browser-only presentation adapter. A future backend
must replace it with one transactional canonical process aggregate, durable
audit history, and server-side authorization without changing the capability
ownership described above.

## Visual Authority

The approved contributor visual grammar is the baseline for internal screens:

- shared 240 px collapsible sidebar and 56 px top bar;
- neutral canvas, bordered cards, and restrained eight-pixel radii;
- purple for primary actions and active navigation;
- semantic green, amber, and red reserved for outcomes and attention states;
- Portuguese UI copy with English technical routes and source identifiers.

The Figma internal sequence is incomplete. When details conflict, use this
order: product rules, journey continuity, established shared visual grammar,
consistent Figma details, and finally legacy presentation behavior.
