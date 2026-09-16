# Global TODO

This file tracks cross-project backlog items that are not part of the immediate implementation plan.

## Apps Web

- [ ] Define final production domain topology for app, API, and auth service.
- [ ] Add Sentry error monitoring across all applications.
- [ ] Track `GHSA-rmmr-r34h-pfm5` for `@tanstack/history` and remove the explicit audit ignore when remediation is available.
- [ ] Implement Better Auth integration.
- [ ] Define advanced API error handling and response normalization.
- [ ] Define toast/notification strategy.
- [ ] Complete remaining apps/web CI/CD external verification items from `docs/initiatives/tasks/02-apps-web-cicd.md`.
- [ ] Add Renovate after CI exists.
- [ ] Define dark/light theme support if product requires it.
- [ ] Review and finalize document title, description, and core SEO/meta tags.
- [ ] Add Storybook if shared components grow enough to justify it.
- [ ] Extract shared packages only after real reuse appears outside `apps/web`.

## Apps IDP

- [ ] Move transactional email delivery from inline Resend calls to a central email worker for the SAC Nexus ecosystem.
- [ ] Design robust email/auth rate limits using durable or secondary storage, covering IP, normalized email, operation type, abuse response, and provider cost control.
- [ ] Design the persistent audit-log worker and event publication contract for IDP security events.
- [ ] Implement institutional invitation flow with verified-email acceptance, 24h expiration, and one pending invitation per email/tenant.
- [ ] Define safe IDP admin operations and Better Auth admin plugin rollout, keeping impersonation disabled unless a future PRD approves it.
- [ ] Define the FastAPI integration contract for IDP session validation, tenant context, membership lookup, and business authorization handoff.
- [ ] Integrate apps/web with IDP auth, tenant status, and tenant-aware signup/login flows.
- [ ] Evaluate compromised-password checks such as HIBP k-anonymity, including privacy, availability, latency, caching, and failure behavior.

## Design Delegation

- [ ] Replace oversized CBMPE crest and gov.br SVG assets with designer-provided optimized versions.
- [ ] Add designer-provided not-found and error screens for 404 and 500 states.
- [ ] Add designer-provided production favicon assets.
- [ ] Add designer-provided Open Graph images and social sharing meta assets.

## Technical Debt

- [ ] Review develop workflow concurrency after parallel PR usage becomes common. Current `web_develop` and `idp_develop` concurrency groups cancel older runs because develop is a shared environment; fix by moving to per-PR preview environments or changing concurrency groups when simultaneous previews are required.
- [ ] Reduce PR workflow package write permissions if the repository accepts untrusted contributors. Current develop workflows need `packages: write` to publish GHCR images from PRs; fix by moving image publishing to trusted events, using preview deploy indirection, or adding stricter contributor gating.
- [ ] Pin Docker base images by digest if stronger build reproducibility is required. Current IDP runtime uses `node:24-alpine` so security patches can flow automatically; fix by pinning a digest and adding Renovate or an explicit base-image update process.
- [ ] Optimize oversized web build assets and main bundle. Current production build warns about a large `index` chunk and existing large SVG assets; fix by code-splitting heavy routes and replacing oversized vector assets with optimized designer-provided files.
