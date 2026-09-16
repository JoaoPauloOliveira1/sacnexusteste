# Performance Test Instructions

## Applicability

Dedicated performance testing is not applicable for this AI-DLC construction cycle.

## Rationale

- Unit 5 is documentation-only.
- Units 1 through 4 add low-frequency event seams, schema/plugin configuration, tenant status lookup, and controlled bootstrap tooling.
- No performance SLA, load target, or production traffic model was approved for this cycle.

## Future Performance Areas

- Public `GET /tenant/status` traffic volume and rate limiting.
- Tenant/domain lookup caching if database load becomes measurable.
- IDP session validation latency for future FastAPI integration.
- Bootstrap command runtime under realistic operator conditions.

Future performance tests should be introduced only after approved NFRs define targets, environment, traffic model, and acceptable error rates.
