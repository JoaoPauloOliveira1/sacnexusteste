# Internal Risco 2 Journey Handoff

## Sources

- Contributor lifecycle:
  [`docs/web/journeys/contributor-avcb-risk-two.md`](../../web/journeys/contributor-avcb-risk-two.md)
- Existing Triador product mapping:
  [`docs/initiatives/prds/13-apps-web-triager-risk-two-presentation.md`](../prds/13-apps-web-triager-risk-two-presentation.md)
- Figma page: `AI Screens` (`2179:2`).
- Contributor validation reference: `12 — Solicitação em validação`
  (`2280:347`).
- Optional inspection reference: `18 — Vistoria necessária` (`2290:208`).

## Product Sequence

```txt
contributor protocol
  -> administrative triage
       -> administrative requirement -> contributor correction -> new triage
       -> distribution
  -> mandatory technical document analysis
       -> technical requirement -> contributor correction -> reanalysis
       -> documents approved
  -> inspection decision
       -> inspection waived -> issuance
       -> inspection required -> scheduling -> inspection outcome
            -> approved -> issuance
            -> requirement -> correction -> reinspection or approval
```

Risco 2 is the classification and rite connecting these capabilities. It is
not a source-code module.

## Capability Ownership

| Capability | Responsibility |
| --- | --- |
| `processes` | Protocol identity, shared process state, history, and contributor projection |
| `triage` | Administrative queue, completeness checklist, administrative requirements, and distribution |
| `analysis` | Mandatory technical document review, technical requirements, and inspection decision |
| `inspections` | Scheduling, assignment, inspection checklist, outcome, correction, and reinspection |
| `documents` | Document metadata and future secure-file projections |
| `notifications` | Role-appropriate process events and future delivery projections |

## Visual Authority

The `Militar - Analista` Figma page does not contain a complete approved
internal screen sequence. Internal screens therefore use this precedence:

1. accepted product and role rules;
2. end-to-end journey continuity;
3. the established contributor shell, tokens, and shared shadcn primitives;
4. consistent details from available Figma screens;
5. existing Triador presentation screens as functional reference.

The internal application must feel like the same SAC Nexus product while
preserving role-specific navigation and density.

## Presentation Boundary

- Internal decisions are deterministic browser-only presentation state.
- No decision represents legal authority, a real CBMPE act, or a production
  authorization boundary.
- Uploaded files remain metadata-only.
- Cross-role process projections use synthetic identifiers and fictional data.
- Production requires authenticated role and tenant authorization, durable
  workflow commands, audit history, secure documents, notifications, and
  concurrency control.
