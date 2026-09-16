# Apps Web Establishment Location Confirmation PRD

## Overview

This initiative adds an explicit address-confirmation step to the shared
contributor entry. After completing the visible address, the contributor
requests a lookup, reviews the result on a map, adjusts the pin when necessary,
and confirms the establishment coordinates before continuing.

Execution plan:
[`docs/initiatives/tasks/18-apps-web-establishment-location-confirmation.md`](../tasks/18-apps-web-establishment-location-confirmation.md).

## Goals

- Keep address entry and map adjustment as two clear sequential tasks.
- Store the confirmed coordinates on the canonical establishment record.
- Make the same location available to later process, analysis, and inspection
  projections without risk-specific duplication.
- Provide a usable fallback when automatic address lookup is unavailable.
- Preserve keyboard access, explicit status feedback, and responsive behavior.

## Functional Requirements

- The map remains hidden until CEP, street, neighborhood, and municipality are
  complete and the contributor activates the next location step.
- The map opens in a focused dialog. Closing it returns to address correction,
  but continuing the process remains disabled until a location is confirmed.
- No location card or raw latitude/longitude is exposed on the form. The
  coordinate remains internal process data.
- An explicit lookup suggests a coordinate and opens the map; address
  autocomplete is not used.
- The contributor can adjust the pin by dragging, clicking the map, or using
  arrow keys while the marker has focus.
- Continuing requires a confirmed coordinate matching the current visible
  address.
- Editing any address field invalidates the previous confirmation.
- Lookup failure or no result opens the map centered on Recife and allows
  manual positioning.
- The presentation snapshot stores latitude, longitude, source, address
  fingerprint, and confirmation timestamp.

## External Service Boundary

The presentation uses MapLibre GL JS with OpenStreetMap raster tiles. Explicit
address lookup uses the public Nominatim search endpoint with client-side
throttling and an in-memory cache. This is a presentation-only integration:

- no privileged key or secret is stored in the browser;
- no autocomplete or background lookup is performed;
- lookup errors never block manual coordinate selection;
- production must replace the direct browser call with an approved,
  provider-switchable backend integration that owns caching, privacy,
  observability, quotas, and service terms.

## Non-Goals

- Production-grade geocoding, address normalization, or address ownership
  verification.
- Reverse geocoding after every pin movement.
- Persisting real establishment data in browser storage.
- Changing classification rules or introducing a risk-specific location model.
- Adding operational-map queue behavior in this slice.

## Acceptance Criteria

- A contributor completes address fields, opens the mandatory map dialog,
  adjusts the pin, confirms the location, and continues.
- The map does not appear before the explicit address-confirmation action.
- Address changes require a new lookup and location confirmation.
- A failed lookup still permits manual map selection.
- The confirmed location survives the presentation-state snapshot migration.
- Unit tests cover address readiness, fingerprinting, response parsing, and
  lookup caching.
- Contributor and cross-profile E2E journeys exercise the required location
  confirmation.
- Check, typecheck, tests, build, and preflight pass.
