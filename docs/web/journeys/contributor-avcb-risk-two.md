# Contributor Risco 2 Journey

This document records the accepted Risco 2 contributor journey and the boundary
implemented in the current presentation.

Risco 2 is a domain classification and rite through existing capabilities. It
is not a source-code module.

## Implemented Presentation

The contributor completes the shared classification entry documented in
[`contributor-shared-risk-classification.md`](contributor-shared-risk-classification.md).
When at least one disqualifying answer is `Sim`, the result is Risco 2.

After the shared result, the contributor completes a separate five-stage
complementing flow:

1. Complement responsible-person data.
2. Accept and sign the declaration of responsibility.
3. Prepare every required document metadata record.
4. Complete the simulated charge.
5. Review and protocol the request.

The protocol then moves through mandatory triage and technical analysis. An
internal role can open a document requirement against the canonical process.
The contributor receives it in the portal, submits a response and
corrected-file metadata, and the process returns to the originating internal
queue. After approval it branches to either:

   - issuance without prior inspection; or
   - inspection scheduling, execution, and outcome handling.

The Risco 2 request produces two distinct final document records only after the
selected rite reaches an approved terminal state:

- `AVCB`;
- `Atestado de Vistoria`.

Completion projects both records into dashboards, process lists, documents,
notifications, history, and their respective demonstration PDF downloads.

The canonical request and file metadata survive profile changes and refreshes
in versioned browser presentation storage. Timed analysis and inspection
updates are bounded presentation fixtures, not contributor authority.

## Ownership

- `companies`: company and establishment relationships.
- `processes`: request orchestration, classification, protocol, requirements,
  analysis status, and inspection decision state.
- `documents`: contributor-visible document collection and future upload
  projections.
- Future business APIs: canonical process persistence, authoritative rules,
  upload security, payment, document analysis, inspection scheduling, audit
  history, and issuance.

## Production Boundaries

The presentation does not upload file bytes or integrate digital signatures,
payments, notifications, analyst decisions, inspection operations, or legal
document issuance. Production versions require authenticated and idempotent
commands, tenant authorization, secure uploads, malware scanning, provider
contracts, durable audit history, retention policy, real-time status, and
internal-role interfaces.
