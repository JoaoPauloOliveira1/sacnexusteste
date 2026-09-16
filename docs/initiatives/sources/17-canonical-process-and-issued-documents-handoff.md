# Canonical Process And Issued Documents Handoff

## Product Decisions

- A request created by the Contributor is one system-wide process. Authorized
  internal profiles must read and mutate that same process rather than isolated
  role fixtures.
- Risco 1 concludes with a **Declaração de Dispensa de Licenciamento do Corpo
  de Bombeiros (DDLCB)**, not an AVCB.
- The Risco 2 presentation exposes two final document records:
  **AVCB** and **Atestado de Vistoria**.
- Risco 2 document analysis is mandatory. Inspection remains conditional on
  the technical decision.

## Design Audit

- Figma page: `AI Screens` (`2179:2`).
- Contributor Risco 2 blocks: `2254:194` through `2337:207`.
- Public certificate validation reference: `34A — Certificado válido`
  (`2325:209`).
- The current Figma copy uses `AR/AVCB` as a generic document label and does
  not model the corrected Risco 1/Risco 2 document taxonomy.
- The accepted product decisions in this handoff therefore override the
  outdated generic label while preserving the established visual language.

## Domain References

- The CBMPE public material identifies DDLCB as the Risco 1 licensing waiver.
- The current CBMPE public portal names the inspection service “Atestado de
  Vistoria do Corpo de Bombeiros”.
- These references inform presentation terminology only. This browser
  implementation is not a legal rules engine or production issuance service.

## Presentation Boundary

- The canonical process engine is browser-persisted, versioned, fictional, and
  resettable.
- It stores presentation process data and uploaded-file metadata only.
- It must not store authentication tokens, passwords, real documents, or
  authoritative public acts.
- A future backend may replace the repository adapter without changing
  capability ownership or route contracts.
