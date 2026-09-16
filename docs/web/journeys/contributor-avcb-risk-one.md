# Contributor Risco 1 Licensing Exemption Journey

This document describes the presentation path in which a contributor request
is classified as Risco 1 and receives an automatic Declaração de Dispensa de
Licenciamento do Corpo de Bombeiros (DDLCB).

Risco 1 is a domain classification, not a source-code module. The path crosses
the `auth`, `companies`, and `processes` capabilities and may later consume a
server-owned document capability.

## Preconditions

- The current session has a `contributor` profile.
- The contributor has at least one registered company or registers one during
  the flow.
- No company is selected automatically for a new request.

## Flow

1. The contributor completes the common entry documented in
   [`contributor-shared-risk-classification.md`](contributor-shared-risk-classification.md).
2. When all disqualifying answers are `Não`, the result is Risco 1.
3. The contributor reviews the selected company, establishment, classification,
   and declaration.
4. The presentation simulates automatic processing and DDLCB issuance without
   payment, technical analysis, or inspection.
5. The completed process and demonstration document become available in the
   dashboard and detail screens.

## Capability Ownership

- `auth`: user, contributor profile, demo session, and company relationship
  identifier.
- `companies`: company entity, company registration, and available-company
  collection.
- `processes`: request draft, explicit company selection, establishment data,
  classification answers, process transitions, history, and completed
  snapshots.
- Future business APIs: authoritative classification, persistence,
  authorization, document issuance, signature, and validation.

## Form Contract

- Editable fields start empty.
- Placeholders demonstrate expected format or content and are never treated as
  values.
- CNPJ, CEP, opening date, landline, and mobile inputs format progressively as
  Brazilian values while preserving empty initial state.
- CEP formatting is local (`00000-000`) and does not imply address lookup or
  automatic field population.
- Required fields have visible and screen-reader-readable indicators.
- The process cannot advance from request confirmation without a selected
  company.
- The classification cannot advance until every question is answered.
- Numbered steps 1 through 4 share one progress indicator and expose their
  current position to assistive technology.
- Technical paths use English route segments. Visible navigation and page
  language remain in Brazilian Portuguese.
- Regularization processes, companies, documents, and notifications have distinct
  collection or entity destinations in the contributor sidebar.

## Presentation Boundary

Company state remains a synthetic browser fixture. Canonical process state is
persisted in the versioned presentation process engine so it survives profile
changes and refreshes. Generated DDLCB files are explicitly marked as
demonstration documents and have no legal validity.
