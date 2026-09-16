# Code Quality Assessment

## Test Coverage

- **Overall**: Coverage tooling is configured for both apps with 50 percent thresholds for branches, functions, lines, and statements.
- **Unit Tests**: Present for web utilities/components/schemas/pages and IDP app/auth/database/logging/usecase behavior.
- **Integration Tests**: Limited. IDP database, Better Auth, cookies, migrations, and Resend behavior are mostly mocked or unit-tested.
- **E2E Tests**: Present for web auth/signup journeys through Playwright.

## Code Quality Indicators

- **Linting**: Configured through Biome at root and app scripts.
- **Formatting**: Configured through Biome.
- **Import Boundaries**: Biome restricted-import rules discourage deep imports across business modules outside shared areas.
- **Typechecking**: Root and app scripts delegate TypeScript checks through Turbo or app-specific scripts.
- **Documentation**: Good for IDP durable docs and app READMEs; web/IDP runtime docs exist.

## Technical Debt

- Web sign-in and signup flows are currently client-only simulations using timed sleeps rather than real IDP calls.
- Web gov.br button is visual only and has no OAuth/OIDC integration handler.
- Web forgot-password route is placeholder only.
- Web signup wizard allows direct navigation to later steps through `step` search params; final OTP step validates OTP only, not the full form.
- Web HTTP client should be verified before first real API integration because ky commonly uses `prefixUrl` rather than `prefix`.
- IDP lacks visible route-level rate limiting for abuse-sensitive auth endpoints.
- IDP lacks integration tests against real PostgreSQL, Better Auth cookie behavior, migrations, and email-provider boundaries.
- IDP readiness checks database connectivity only, not migration/schema compatibility.
- Password reset email failures are intentionally swallowed for safe public responses but no durable retry queue exists.
- Coverage thresholds are modest for security-sensitive auth code.

## Patterns and Anti-patterns

- **Good Pattern**: Runtime web config avoids storing secrets in frontend env vars and supports deployment-time public URL changes.
- **Good Pattern**: IDP response sanitization removes token-like/session-sensitive fields from public responses.
- **Good Pattern**: IDP logs safe canonical events and avoids logging auth tokens, email body, provider details, or sensitive URL content.
- **Good Pattern**: IDP OpenAPI/Swagger is disabled in production.
- **Good Pattern**: Web stores only non-sensitive signup draft preferences in `sessionStorage`.
- **Risk Pattern**: Client-only auth/signup simulation can hide missing API contracts and backend error handling.
- **Risk Pattern**: Lack of explicit rate limiting creates exposure for signup/signin/password-reset abuse if Better Auth defaults are insufficient.
- **Risk Pattern**: Low coverage thresholds may miss auth edge cases.
