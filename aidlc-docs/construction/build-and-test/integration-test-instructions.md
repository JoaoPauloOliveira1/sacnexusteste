# Integration Test Instructions

## Purpose

Integration tests for real PostgreSQL, Better Auth persistence, Resend delivery, FastAPI integration, and frontend flows are intentionally deferred until database lifecycle, cleanup, secrets, isolation, cost, and service contracts are explicitly approved.

## Current Coverage

- Route-level behavior is covered through Fastify `inject()` unit tests.
- Database, Better Auth, Resend, and bootstrap boundaries are covered with controlled fakes or compile-time checks where practical.
- Manual smoke testing has been performed by the user for the implemented documentation/tenant-bootstrap flow.

## Future Integration Test Scenarios

### Scenario 1: PostgreSQL-Backed Auth And Tenant Setup

- Description: Validate migrations, auth tables, organization tables, tenant/domain tables, and bootstrap behavior against an isolated test database.
- Setup: Approved test database lifecycle such as testcontainers or a dedicated disposable PostgreSQL database.
- Expected result: migrations apply, bootstrap creates/connects expected records, tenant status returns safe availability responses.

### Scenario 2: IDP To FastAPI Contract

- Description: Validate session validation, tenant context, membership lookup, and business authorization handoff.
- Setup: Approved FastAPI contract and test environment.
- Expected result: FastAPI receives and validates IDP-owned identity/tenant/membership context without writing to IDP-owned tables.

### Scenario 3: Frontend Auth And Tenant Flow

- Description: Validate browser signup/login/session and tenant-domain routing through same-origin `/api` and `/api/auth` paths.
- Setup: Approved web integration and routing configuration.
- Expected result: browser flows use secure cookie-based sessions and do not store auth tokens in localStorage.

## Cleanup

Future integration tests must clean all test data and must not use production secrets, production URLs, or real user data.
