---
name: sac-nexus-architecture
description: Decide where SAC Nexus workspace changes belong and preserve boundaries across apps, modules, documentation, AGENTS instructions, and project skills. Use when planning features, moving behavior between apps, introducing modules or packages, changing architecture conventions, or deciding what durable documentation must change.
---

# SAC Nexus Architecture

Place work in the correct boundary before implementing it. Write user-facing
analysis in Brazilian Portuguese. Keep code, routes, filenames, technical docs,
commits, and PR titles in English.

## Workflow

1. Identify the user-visible intent, data owner, trust boundary, and affected
   runtime.
2. Choose the owner:
   - `apps/web`: browser SPA, routes, presentation, forms, and browser-safe
     runtime configuration.
   - `apps/idp`: identity, authentication, sessions, tenants, memberships,
     auth email, and IDP-owned operational contracts.
   - future business APIs: product-domain behavior, persistence, and
     authorization that do not belong to identity.
   - `packages/*`: only after stable cross-app reuse exists.
   - docs/backlog only: planning, conventions, or deferred work without runtime
     behavior.
3. Read the relevant reference:
   - `references/boundaries.md` for ownership decisions.
   - `references/documentation.md` for documentation placement.
   - `references/skill-governance.md` before creating or editing skills.
4. Route implementation through `sac-nexus-web-development` or
   `sac-nexus-idp-development` when one of those apps owns the work.

## Principles

- Prefer explicit product and trust boundaries over catch-all services.
- Keep business-domain authorization and workflows outside the IDP unless an
  accepted initiative assigns an identity-owned role or permission.
- Keep secrets and privileged integration details outside browser code and
  `/config.json`.
- Do not create shared packages until reuse is real, repeated, and stable.
- Consider critical paths, data growth, query bounds, concurrency, latency,
  external limits, and failure modes without inventing capacity numbers.
- Treat documentation as a design surface for durable contracts, workflows,
  conventions, and operational expectations.
- Treat `sac-nexus-*` skills as local wrappers over project knowledge. Do not
  modify downloaded skills to encode local policy.
