# Apps Web Triager Risco 2 Presentation PRD

## Overview

This initiative implements the internal `Triador` persona described in the supplied `SAC-NEXUS_TRIADOR.md` product document. It complements the existing contributor Risco 1 presentation without changing that journey.

Execution plan: [`docs/initiatives/tasks/13-apps-web-triager-risk-two-presentation.md`](../tasks/13-apps-web-triager-risk-two-presentation.md).

## Goals

- Route demonstration users to either the contributor Risco 1 profile or the internal Triador Risco 2 profile according to login credentials.
- Present triage indicators and a priority-ordered administrative queue.
- Expose all process header, company, establishment, technical-responsible, BRE, document, checklist, requirement, status, and history information defined for the persona.
- Support document preview, PDF download, and version comparison in the presentation scenario.
- Support starting triage, completing the administrative checklist, forwarding eligible processes, issuing administrative requirements, receiving corrections, and starting a new triage.
- Keep BRE classification read-only and exclude technical-analysis tools.

## Demonstration Profiles

- Contributor / Risco 1: `contribuinte@mail.com` with password `123`.
- Triador / Risco 2: `triador@email.com` with password `demonstracao`.

A versioned projection of the synthetic user and profile is stored in
`sessionStorage` only. Passwords are not persisted. It is demonstration
routing state, not an authentication token or authorization boundary. Triage
fixtures and decisions use versioned `localStorage`, following the current
browser-only presentation architecture.

## Non-Goals

- Production authentication or authorization.
- Backend persistence, process APIs, or document object storage.
- Real document contents or legally valid hashes.
- Engineering interpretation, plant markup, COSCIP compliance decisions, approval, rejection, technical opinions, or inspections.
- Analyst or inspector personas.

## Acceptance Criteria

- The contributor credentials continue to enter the existing Risco 1 journey.
- The Triador credentials enter `/triage` and direct access without that presentation profile returns to sign-in.
- The dashboard exposes all documented indicators and supports queue search, status filtering, and priority filtering.
- Process details show the complete administrative header and all documented entity fields.
- BRE information is visibly read-only.
- Documents expose sender, version, date, size, hash, status, preview, download, and comparison actions.
- All 18 checklist items are available in the five documented groups.
- Approval is disabled until every checklist item is complete.
- Requirements capture title, description, related document, category, deadline, observations, status, date, and responsible user.
- The correction and new-triage states can be demonstrated end to end.
- Unit tests, typecheck, Biome check, focused Playwright tests, and production build pass.
