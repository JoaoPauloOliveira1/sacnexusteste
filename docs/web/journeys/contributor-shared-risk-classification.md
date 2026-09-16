# Contributor Shared Risk Classification Journey

This document describes the contributor entry shared by every establishment
regularization request until the system determines the applicable risk
classification and rite.

Risk levels are outcomes of this journey. They are not application modules,
route groups, component namespaces, or persistence boundaries.

## Shared Stages

1. **Solicitação**: the contributor starts an establishment regularization
   request and explicitly selects the responsible company.
2. **Estabelecimento**: the contributor supplies the establishment identity,
   address, physical characteristics, and special conditions. After completing
   the address, the contributor opens a focused map dialog, reviews the
   suggested location, adjusts the pin when necessary, and confirms the
   coordinate before continuing. Closing the dialog allows address correction
   but cannot skip location confirmation. Changing the address invalidates the
   previous coordinate. Raw latitude and longitude remain internal process
   data and are not shown in the contributor form.
3. **Características**: the contributor answers every required classification
   question.
4. **Enquadramento**: the presentation analyses the supplied answers and
   produces an explicit `risk-1` or `risk-2` classification.

Every numbered screen uses the same four-stage progress contract. Screens after
the result belong to the selected rite and do not renumber the common entry.

## Classification Fixture

The current presentation uses three required disqualifying questions:

- storage of flammable liquids;
- built area above the fixture limit;
- more than three floors.

All answers set to `Não` produce Risco 1. Any `Sim` answer produces Risco 2.
This client rule is synthetic and must be replaced by a server-owned, versioned,
auditable rules contract before production.

## Result Branches

- **Risco 1** continues to declaration and automatic DDLCB issuance without
  payment, document analysis, or inspection.
- **Risco 2** requires contributor complementation and document analysis.
  Inspection is not automatic: the responsible authority may require it after
  validation according to the establishment conditions and applicable rules.

The current Risco 2 presentation continues through contributor complementation,
upload metadata, payment simulation, protocol, mandatory internal analysis,
requirements, and the conditional inspection branch. The confirmed
establishment coordinate remains part of the canonical process aggregate so
later capabilities can consume the same location.

## State And Navigation

- The process provider preserves multiple active requests when they belong to
  different companies.
- Starting another request archives the current active state before opening an
  empty company-selection step, so no request is overwritten.
- A company that already owns an active request cannot be selected for a
  duplicate request; the contributor resumes it from the service-selection
  screen instead.
- The service-selection screen exposes every active request by company and
  resumes each one from its latest phase.
- Canonical process state uses versioned browser presentation persistence so
  the same request survives refreshes and profile changes.
- Technical URLs remain in English; visible copy remains in Brazilian
  Portuguese.
