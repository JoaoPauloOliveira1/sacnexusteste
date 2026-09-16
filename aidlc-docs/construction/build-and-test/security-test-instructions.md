# Security Test Instructions

## Purpose

Validate baseline security expectations for the IDP implementation and documentation changes.

## Local Security Checks

### Production Dependency Audit

Run from `apps/idp`:

```bash
pnpm audit --prod
```

Current result: no known vulnerabilities found.

### Documentation Sensitive-Value Review

Inspect changed durable documentation for forbidden examples:

- Real secrets or credentials.
- Real or realistic personal emails.
- CPF or CNPJ values.
- Tokens, cookies, session IDs, OTPs, reset URLs, or verification URLs.
- Raw SQL parameters, stack traces, internal IDs, production URLs, or production connection strings.

Current result: passed. Older realistic domain examples in `idp-architecture-discussion.md` were replaced with `.test` domains.

## Security Regression Areas

- HTTP errors remain generic and must not expose SQL or raw dependency errors.
- Identity event payloads remain allowlisted and non-durable until audit infrastructure is approved.
- Bootstrap output remains strict allowlist only.
- Better Auth credential, session, token, cookie, organization, and member internals remain Better Auth-owned.
- Tenant status responses remain only `available` or `unavailable`.
