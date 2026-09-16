# Component Methods

## Event Contracts

```ts
type IdentityEventName =
  | "identity.auth.sign_up"
  | "identity.auth.sign_in"
  | "identity.auth.sign_out"
  | "identity.auth.email_verified"
  | "identity.auth.password_reset"
  | "identity.auth.password_changed"
  | "identity.tenant.created"
  | "identity.tenant_domain.created"
  | "identity.membership.owner_assigned";

type IdentityEventOutcome = "succeeded" | "failed" | "skipped";

function createIdentityEvent(input: CreateIdentityEventInput): IdentityEvent;
```

- **Purpose**: Build safe event payloads from controlled inputs.
- **Input**: Event name, outcome, request ID when available, safe actor/user/tenant identifiers when approved, and safe reason codes.
- **Output**: Sanitized `IdentityEvent` object.
- **Detailed Rules Later**: Exact event names, allowed identifiers, and sanitization invariants.

## Event Publisher

```ts
interface IdentityEventPublisher {
  publish(event: IdentityEvent): Promise<void>;
}

function createNoopIdentityEventPublisher(): IdentityEventPublisher;
```

- **Purpose**: Provide a replaceable event publication seam.
- **Input**: Sanitized `IdentityEvent`.
- **Output**: `Promise<void>`.
- **Detailed Rules Later**: Failure behavior by operation class and test doubles.

## Tenant Domain Normalization

```ts
function normalizeTenantHost(host: string): TenantHostNormalizationResult;
```

- **Purpose**: Convert raw host header input into a safe lookup key or rejection result.
- **Input**: Raw host value from selected request header.
- **Output**: Normalized host or safe validation error.
- **Detailed Rules Later**: Port handling, trailing dots, casing, IDN/punycode stance, malformed host rejection, PBT invariants.

## Tenant Resolver

```ts
function selectTenantHost(headers: TenantHostHeaders): string | null;

async function resolveTenantFromRequestHost(input: ResolveTenantInput): Promise<ResolveTenantResult>;
```

- **Purpose**: Select trusted host source and resolve tenant/domain status.
- **Input**: `x-forwarded-host`, `host`, environment/trust settings, tenant-domain repository.
- **Output**: Resolved tenant context or safe unresolved status.
- **Detailed Rules Later**: Trust boundary, multi-value header handling, disabled/pending/unknown behavior.

## Tenant Repository

```ts
async function findTenantByDomainLookupKey(lookupKey: string): Promise<TenantWithDomain | null>;

async function createTenant(input: CreateTenantInput): Promise<TenantRecord>;

async function createTenantDomain(input: CreateTenantDomainInput): Promise<TenantDomainRecord>;
```

- **Purpose**: Encapsulate Drizzle access for tenant and domain data.
- **Input**: Normalized host/domain values, organization ID, status values, metadata needed for setup.
- **Output**: Tenant/domain records.
- **Detailed Rules Later**: Transactions, uniqueness, indexes, and migration details.

## Organization Auth Integration

```ts
function configureOrganizationPlugin(): BetterAuthPlugin;

async function createOrganizationForTenant(input: CreateOrganizationForTenantInput): Promise<OrganizationResult>;

async function assignOwnerMembership(input: AssignOwnerMembershipInput): Promise<MemberResult>;
```

- **Purpose**: Centralize Better Auth organization plugin configuration and internal organization operations.
- **Input**: Tenant/organization name, slug, owner user ID, role.
- **Output**: Better Auth organization/member results adapted to IDP service needs.
- **Detailed Rules Later**: Exact Better Auth APIs, plugin schema behavior, disabled deletion/self-service settings.

## Tenant Status Endpoint Handler

```ts
async function getTenantStatus(request: FastifyRequest, reply: FastifyReply): Promise<void>;
```

- **Purpose**: Public safe diagnostic endpoint for tenant/domain status.
- **Input**: Request headers and route context.
- **Output**: Safe `snake_case` response such as active/unavailable/unknown without sensitive internal details.
- **Detailed Rules Later**: Route path, response schema, status codes, cache behavior.

## Bootstrap CLI Parser

```ts
function parseBootstrapTenantArgs(argv: string[]): BootstrapTenantArgsResult;
```

- **Purpose**: Validate CLI flags for tenant setup.
- **Input**: CLI argument vector.
- **Output**: Parsed bootstrap command input or validation errors.
- **Detailed Rules Later**: Required flags, temporary password input handling, safe error messages.

## Bootstrap Service

```ts
async function bootstrapTenant(input: BootstrapTenantInput): Promise<BootstrapTenantResult>;
```

- **Purpose**: Create tenant, domain aliases, initial owner user, and owner membership.
- **Input**: Tenant name/slug/status, domain aliases, owner name/email/temporary password, event publisher, repositories, Better Auth APIs.
- **Output**: Safe bootstrap result with created/existing/skipped status and no secrets.
- **Detailed Rules Later**: Transaction boundaries, idempotency, rollback behavior, owner verification state.

## Documentation Update Service

No runtime component is required. Documentation updates remain implementation tasks rather than application services.
