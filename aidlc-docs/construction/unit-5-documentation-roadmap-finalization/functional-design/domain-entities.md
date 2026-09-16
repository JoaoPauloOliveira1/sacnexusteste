# Domain Entities: Unit 5 Documentation And Roadmap Finalization

## Durable Documentation Surface

### Purpose

Represents a project-owned documentation file intended to outlive AI-DLC execution artifacts.

### Examples

- `apps/idp/README.md`
- `docs/idp/architecture.md`
- `docs/idp/security.md`
- `docs/idp/testing.md`
- `docs/idp/deployment.md`

### Rules

- Must be written in English for technical content.
- Must use synthetic examples.
- Must not duplicate large sections unnecessarily.
- Must preserve security, ownership, and operational boundaries.

## Roadmap Item

### Purpose

Represents implementation progress tracked in `idp-architecture-discussion.md`.

### Fields

| Field | Purpose | Notes |
|---|---|---|
| `description` | Roadmap capability | Existing checklist item text. |
| `status` | Completion state | Complete only when verified implementation exists. |
| `evidence` | Verification basis | Unit code summary, tests, migration, or manual validation. |
| `deferred_gaps` | Remaining non-goals | Must stay visible when relevant. |

## Documentation Update

### Purpose

Represents one planned change to a durable documentation surface.

### Fields

| Field | Purpose | Notes |
|---|---|---|
| `target_file` | Documentation file to update | README, docs/idp file, roadmap, or TODO. |
| `source_unit` | Unit providing evidence | Unit 1, 2, 3, or 4. |
| `content_type` | Behavior being documented | Event, organization, tenant, bootstrap, testing, security, deployment, roadmap. |
| `safety_classification` | Sensitive-content risk | Must be no-secret/no-PII. |

## Deferred Work Item

### Purpose

Represents verified non-goals and future work from Units 1 through 4.

### Examples

- Persistent audit storage, audit worker, outbox, queue, or event bus.
- Institutional invitation flow.
- Better Auth admin plugin rollout.
- FastAPI integration contract.
- Frontend integration.
- Production edge/infrastructure rate limiting for tenant status.
- Custom cache or distributed resolver infrastructure.

### Rules

- Add to `docs/TODO.md` only when not already captured elsewhere.
- Keep items specific and traceable.
- Do not create an unbounded idea backlog.

## Safe Example

### Purpose

Represents a documentation example that demonstrates behavior without leaking real data.

### Allowed Values

- `tenant-example.sacnexus.test`
- `owner@example.test`
- `REPLACE_WITH_TEMPORARY_PASSWORD`
- Placeholder database connection strings with `REPLACE_*` parts.

### Forbidden Values

- Real secrets or credentials.
- CPF, CNPJ, phone, address, or realistic personal data.
- Real email addresses.
- Tokens, cookies, session IDs, reset URLs, verification URLs.
- Production database URLs or raw SQL parameters.

## Verification Evidence

### Purpose

Represents proof that a documentation or roadmap claim can be made.

### Sources

- Unit 1 code summary and verification.
- Unit 2 code-generation summary and migrations.
- Unit 3 code-generation summary, PBT, route tests, migrations, and manual validation.
- Unit 4 code-generation summary, automated verification, and manual validation.

## Entity Relationships

| Entity | Relationship | Notes |
|---|---|---|
| Verification Evidence | Supports Roadmap Item | Roadmap completion requires evidence. |
| Documentation Update | Targets Durable Documentation Surface | Each update has an explicit destination. |
| Documentation Update | Uses Safe Example | Examples must be synthetic. |
| Deferred Work Item | May update `docs/TODO.md` | Only if not already covered. |
| Roadmap Item | May include Deferred Work Item | Completed items can still mention gaps. |

## Security Compliance

- Durable docs and examples are no-secret/no-PII by design.
- Roadmap completion requires verification and cannot overstate current audit or authorization maturity.
- Better Auth boundaries remain explicit.

## PBT Compliance

- Verification Evidence includes Unit 3 PBT for host normalization.
- Documentation should identify PBT as complementary to example-based route/resolver/bootstrap tests.
