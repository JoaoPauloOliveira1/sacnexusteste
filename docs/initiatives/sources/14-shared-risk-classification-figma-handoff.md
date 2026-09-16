# Shared Risk Classification Figma Handoff

## Sources

- File: `SACNexus - Design`
- Page: `AI Screens` (`2179:2`)
- Canonical visual grammar: Risco 1 section (`2241:774`)
- Risco 2 common entry:
  - Block 01 (`2254:194`)
  - Block 02 (`2261:194`)
  - Result (`2261:603`)
- Risco 2 optional inspection reference: `18 — Vistoria necessária`
  (`2290:208`)

## Accepted Journey

```txt
regularization entry
  -> company and establishment
  -> establishment characteristics
  -> classification analysis
  -> classification result
       -> Risco 1 automatic issuance branch
       -> Risco 2 document-analysis branch
```

The shared entry is not named after either risk. Risk becomes known only at the
classification result.

## Conflict Resolution Order

1. Explicit accepted product rule.
2. Journey continuity and domain semantics.
3. Existing canonical project components and Risco 1 visual grammar.
4. Consistent approved Figma details.
5. AI-generated screens as non-authoritative proposals.

When a lower-priority source conflicts, preserve the higher-priority contract,
reuse the canonical component, and record the deviation here or in the PRD.

## Visual Decisions

- Reuse `ContributorShell`, `ProcessPage`, `SummaryCard`,
  `ProcessPageActions`, `StatusBadge`, shared form primitives, and the existing
  responsive sidebar.
- Preserve the Risco 1 content width, `#fbfbfc` canvas, typography, semantic
  colors, card/input/button radii, and action alignment.
- Keep one progress treatment on every shared numbered stage.
- Do not reproduce Risco 2's six-to-eight step-count change.
- Use semantic `Alert`, `Badge`, `Card`, `Progress`, `Field`, `Input`,
  `Select`, and `RadioGroup` primitives before domain markup.

## Shared Entry Component Catalog

| Need | Decision | Owner |
| --- | --- | --- |
| Contributor application shell | Existing `ContributorShell` | processes |
| Page title, description, stage, progress | Extend `ProcessPage` composition | processes |
| Responsive action row | Existing `ProcessPageActions` | processes |
| Titled content grouping | Existing `SummaryCard` | processes |
| Company selection | Existing shadcn `Select` and `Field` composition | processes consuming companies |
| Establishment fields | Existing `FieldGroup`, `Field`, and `Input` | processes |
| Classification questions | Existing semantic `FieldSet` and `RadioGroup` | processes |
| Analysis state | Existing `Card`, status badges, and reduced-motion timer | processes |
| Risk result variants | Explicit Risco 1 and Risco 2 result compositions | processes |
| Explanatory notices | Existing shadcn `Alert` | shared primitive + process copy |

## Deferred Risco 2 Catalog

| Group | Screens | Components to evaluate later |
| --- | --- | --- |
| Responsible and declaration | 06–07 | identity summary, contact form, relationship choice, declaration, signature method |
| Documents and payment | 08–10 | upload checklist, document status row, charge summary, payment choice, review sections |
| Validation and requirements | 11–17 | protocol receipt, validation checklist, requirement inbox/thread, attachments, contestation |
| Optional inspection | 18–28 | inspection decision, scheduling, tracking, outcomes, corrections, reinspection, timeline |
| Auxiliary capabilities | 29–40 | certificates, renewal, public validation, public process lookup, notifications |

## Risco 2 Branch Rule

- Document analysis is mandatory.
- Inspection is optional.
- Eligibility may be calculated during classification.
- The authoritative presentation decision occurs after data and document
  validation.
- A requirement returns to document reanalysis.
- Approved processes either issue without inspection or enter scheduling and
  inspection before issuance.

## Known Figma Inconsistencies

- Early screens use totals of six while documents, payment, and review use
  totals of eight.
- The Risco 2 entry duplicates the existing Risco 1 request and classification
  entry with different spacing and component treatments.
- Establishment, undertaking, building, and company language is not always
  applied consistently.
- Several screens show filled values where the accepted presentation contract
  requires empty editable fields and placeholders.
- The `Militar - Analista` page has no complete approved screen sequence, so
  the current internal Triager module is not treated as Figma-backed analyst
  design.
