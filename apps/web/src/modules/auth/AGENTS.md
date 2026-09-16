# Auth Module Instructions

## Structure

- `pages/` contains route-level page composition exported through `index.ts`.
- `forms/` contains auth form wiring, validation, and submit behavior.
- `components/` contains auth-specific presentational components.
- Tightly coupled sign-in layout pieces should stay grouped in `components/sign-in-composer.tsx` as composer parts, not split into unrelated one-off files.
- `schemas/` contains auth-owned Zod schemas.
- `assets/` contains auth-owned brand assets.

## Boundaries

- Routes should import auth pages from `@/modules/auth`.
- Auth internals should use relative imports inside this module.
- The presentation sign-in resolves a synthetic `User` and one typed profile
  (`Contributor` or `Triager`) from email and password fixtures.
- Auth owns the demo session boundary. Store only the canonical, non-sensitive
  user/profile projection in `sessionStorage`; never persist fixture passwords.
- Client-side profile and capability checks are navigation aids for the
  presentation, not production authorization.
- Keep CPF/email formatting and reusable CPF/email form controls in `shared` for future auth or profile forms unless they become auth-specific.
