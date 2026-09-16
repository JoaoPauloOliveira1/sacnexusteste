---
name: sac-nexus-idp-development
description: Build or refactor SAC Nexus Identity Provider code in apps/idp using Fastify, Better Auth, Drizzle, PostgreSQL, Zod, React Email, Resend, request context, safe structured logging, OpenAPI, Vitest, migrations, and project security boundaries.
---

# SAC Nexus IDP Development

Use this skill for `apps/idp/**`. Read root `AGENTS.md`,
`apps/idp/AGENTS.md`, `apps/idp/README.md`, and `docs/idp` first.

## Workflow

1. Confirm the concern belongs to identity, sessions, tenants, memberships,
   auth email, or IDP operations. Route product-domain behavior elsewhere.
2. Keep transport in `src/entrypoint`, application actions in named
   `src/usecases/<context>/<operation>.ts` functions, Better Auth integration in
   `src/identity`, persistence in `src/database`, and infrastructure in
   `src/infra`.
3. Keep routes and OpenAPI tag-scoped, with stable operation IDs, explicit
   response schemas, safe examples, and `snake_case` payloads.
4. Keep `idp_*` tables and UUIDv7 IDs. Generate and review Drizzle migrations;
   never run migrations automatically on startup.
5. Read runtime variables only through `src/config/env.ts`. Never read, print,
   grep, summarize, or modify real `.env` files.
6. Do not log credentials, cookies, tokens, OTPs, session IDs, email, CPF,
   CNPJ, bodies, raw query strings, provider payloads, or private headers.
7. Preserve Better Auth security internals and cookie/header behavior; sanitize
   public wrapper responses and never expose session tokens.
8. Check bounded queries, indexes, hashing/email latency, transactions,
   external failures, retry/idempotency, rate limits, and tenant isolation.
9. Add focused tests and update docs for durable contract or workflow changes.

## Validation

```bash
pnpm --filter idp check
pnpm --filter idp typecheck
pnpm --filter idp test
pnpm --filter idp build
```

Run migration generation or integration checks only when required. Use relevant
vendor skills for framework-specific details.
