# Shared Components Instructions

## Ownership

- `ui/` contains shadcn/Base UI primitives and low-level UI wrappers.
- `forms/` contains reusable form controls composed from `ui/` primitives.
- Shared components must not import from business modules.
- Shared components must not contain route paths, business flow decisions, product-specific assets, or fixed business copy.
- Prefer composition over boolean mode props.
- Shared buttons must support loading through `isLoading`, keep their label stable, render a spinner, and disable interaction while loading.
- Clickable shared controls should include `cursor-pointer`; disabled states should communicate non-interactivity.

## Imports

- Import shadcn/Base UI primitives from `@/modules/shared/components/ui/*`.
- Import reusable form controls from `@/modules/shared/components/forms/*`.
- Use `@/modules/shared/lib/validators/*` for generic validation helpers.
- Use `@/modules/shared/lib/formatters/*` for generic formatting and masking helpers.
