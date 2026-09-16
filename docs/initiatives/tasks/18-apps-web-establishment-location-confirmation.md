# Apps Web Establishment Location Confirmation - Execution Plan

## Source

- PRD:
  [`docs/initiatives/prds/18-apps-web-establishment-location-confirmation.md`](../prds/18-apps-web-establishment-location-confirmation.md)

## Tasks

### Phase 1: Domain And Interaction

- [x] Model confirmed coordinates on the canonical establishment aggregate.
- [x] Invalidate stale coordinates when visible address fields change.
- [x] Add the explicit location step and delayed map dialog.
- [x] Support drag, map click, and keyboard marker adjustment.
- [x] Require location confirmation before classification.

### Phase 2: Provider Boundary And Resilience

- [x] Add explicit Nominatim lookup without autocomplete.
- [x] Add per-client throttling and in-memory response caching.
- [x] Preserve manual selection when lookup fails or has no result.
- [x] Keep map attribution and provider limitations visible and documented.

### Phase 3: Verification And Delivery

- [x] Add focused unit coverage for the geocoding adapter.
- [x] Update contributor and cross-profile E2E journeys.
- [x] Validate desktop layout and the keyboard-adjustable marker in a real browser.
- [x] Run repository preflight.
- [x] Publish the change to dev.
- [x] Smoke-test the deployed dev journey.
