# IDP Security

This document records durable security guidance for `apps/idp`.

The IDP is security-critical because it will own authentication, sessions, tenant membership, broad permissions, and identity events.

## Secrets

- Do not commit real secrets.
- Keep `.env.example` limited to placeholders, never real secrets or realistic credentials.
- Add sensitive variables only in the implementation step that actually uses them.
- Do not expose IDP secrets through frontend environment variables or browser runtime config.
- `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `RESEND_API_KEY` are backend-only secrets and must never be exposed to `apps/web`, `/config.json`, logs, OpenAPI examples, or PR comments.

## Environment

`process.env` should be read only from the central config module.

Other code should consume typed configuration values. This keeps validation, defaults, and future secret handling in one place.

Keep `NODE_ENV` and `IDP_APP_ENV` distinct. `NODE_ENV` controls Node/runtime behavior, while `IDP_APP_ENV` describes the deployment environment using `local`, `development`, `staging`, or `production`.

## Logging

Do not log credentials, cookies, tokens, OTPs, backup codes, or sensitive personal data.

Do not log CPF, CNPJ, email, raw query strings, request bodies, response bodies, full user-agent strings, IP addresses, session IDs, or tenant/user identifiers unless a future PRD explicitly defines a safe policy.

Fastify/Pino logging must keep redaction enabled for sensitive headers and common auth fields, including `authorization`, `cookie`, `set-cookie`, `x-api-key`, `password`, `token`, `secret`, `otp`, and `backupCode`.

Database readiness and migration logs must not print connection strings, hosts, usernames, database names, query text, pool internals, or raw dependency errors.

Transactional email logs must use safe operation labels only. Do not log email addresses, names, verification/reset URLs, rendered email HTML/text, raw Resend responses, or provider secrets.

Canonical request events are operational logs, not audit records. They should include request ID, method, safe path, status code, duration, outcome, app environment, safe auth operation labels, and sanitized error name only.

Identity events emitted through `src/events` are also safe signals, not durable audit records. Event payloads must stay allowlisted to operation labels, outcomes, request IDs, timestamps, event names, and generic reason codes. Do not include email addresses, passwords, raw domains, normalized hosts, internal IDs, tokens, cookies, session IDs, request bodies, response bodies, SQL, stack traces, or raw errors.

Data emitted by the IDP should use `snake_case`, including API payload fields and log event fields.

Use `x-request-id` as the canonical request ID response header. `x-correlation-id` is accepted only as an inbound fallback when `x-request-id` is absent. Browser-generated IDs are not authoritative in production; ingress or the IDP should normalize the request ID.

## Authentication Internals

Use Better Auth official APIs, plugins, hooks, and supported extension points for authentication behavior.

Do not reimplement Better Auth cryptographic, password, session, cookie, token, or security internals.

Do not depend on private cookie formats or internal table details outside supported Better Auth contracts.

Better Auth cookie cache is disabled in the initial SAC Nexus session strategy. Re-enable it only through a future PRD that explicitly evaluates revocation, performance, and security tradeoffs.

Initial browser auth uses HttpOnly session cookies. Secure cookies are required outside local development.

Configure `AUTH_TRUSTED_ORIGINS` for any browser origin that must call IDP auth wrapper routes directly. Keep the allowlist environment-specific and avoid wildcard origins unless a future PRD explicitly approves preview-domain behavior.

Email/password users must verify their email before receiving effective access. Verification emails are sent on signup and can be requested again through the explicit resend endpoint.

Password policy requires 12 to 128 characters, allows passphrases, does not require composition rules, and blocks a small local denylist of obvious/common passwords.

Password reset responses must not reveal whether an account exists. Password reset revokes all sessions. Authenticated password change should revoke other sessions while preserving the current session when safely supported.

Email verification and password reset callback destinations are controlled by `AUTH_EMAIL_VERIFICATION_CALLBACK_URL` and `AUTH_PASSWORD_RESET_REDIRECT_URL`. Wrapper routes must not trust client-provided `callbackURL` or `redirect_to` values for these flows.

The Better Auth `organization` plugin owns organization and membership behavior. Public organization creation is disabled, organization deletion is disabled, and owner assignment happens only through controlled server-side flows such as approved bootstrap tooling. Do not reimplement Better Auth organization, member, credential, session, cookie, or token internals.

## Tenant Resolution

Tenant/domain resolution must fail safely. Malformed hosts, unknown hosts, pending tenants, disabled tenants, pending domains, and disabled domains return a generic unavailable status instead of exposing technical details.

`GET /tenant/status` returns only `tenant_status` with `available` or `unavailable`. It must not expose tenant IDs, organization IDs, domains, aliases, raw host headers, normalized hosts, reason codes, SQL details, or raw errors.

The IDP checks `X-Forwarded-Host` before `Host`. Production deployments must ensure the ingress or reverse proxy strips or controls untrusted forwarded-host headers before requests reach the IDP.

Production abuse controls for public tenant status traffic remain future work. Until a durable rate-limit design is approved, do not document stronger custom rate limiting as implemented behavior.

## Bootstrap Safety

`pnpm --filter idp bootstrap:tenant -- ...` is controlled operator tooling, not a public user flow.

Bootstrap output and bootstrap events must stay allowlisted to operation categories, outcomes, and generic failure categories. They must not include owner email, owner name, temporary password, raw domains, normalized hosts, internal IDs, connection strings, SQL, stack traces, raw errors, tokens, cookies, session IDs, reset URLs, verification URLs, full records, or raw Better Auth responses.

Temporary passwords can remain in shell history when pasted directly. Use an approved secret-handling workflow for real environments and never commit bootstrap commands containing real credentials.

Matching existing bootstrap state can be reported as reused or already satisfied. Conflicting state should fail with generic categories such as `conflict_detected` or `operation_failed`, without printing the conflicting value.

## Error Responses

Production error responses must stay generic. Internal database, Better Auth, or dependency errors must not expose stack traces, SQL, SQL parameters, internal paths, framework versions, personal data, or secrets. The current generic HTTP error shape is `{ "message": "Erro" }`.

## Transactional Email Content

Auth emails are built with local React Email templates and sent through Resend.

Email templates may include the user's first name when available. They must not include CPF, CNPJ, process data, protocol details, tenant-sensitive context, internal IDs, raw tokens, session IDs, or sensitive account metadata.

Verification links expire after 24 hours. Password reset links expire after 30 minutes.

## Browser Storage

Do not introduce localStorage-based authentication token patterns.

Browser authentication should prefer secure HttpOnly cookie-based sessions through same-origin or same-site routing.

Do not return Better Auth session tokens, session IDs, or bearer-style credentials in public wrapper responses.

## Data Boundary

Keep IDP-owned profile data minimal.

Business/person data such as CPF, CNPJ, phone, address, professional registration, legal representation, process participation, and domain-specific consent records should live in business APIs unless a future PRD explicitly changes that boundary.

The initial IDP account payload is limited to `name`, `email`, and `password`. Email verification, Terms of Use/Privacy Policy acceptance evidence, and domain profile writes are handled in later scoped tasks.
