---
name: sac-nexus-web-development
description: Build or refactor the SAC Nexus React SPA in apps/web using its module boundaries, TanStack Router and Query, ky, React Hook Form, Zod, Tailwind CSS, shadcn/Base UI, runtime config, accessibility, tests, and documentation conventions.
---

# SAC Nexus Web Development

Use this skill for `apps/web/**`. Read root `AGENTS.md`,
`apps/web/AGENTS.md`, relevant nested `AGENTS.md`, and `docs/web` first.

## Workflow

1. Select the owning feature module. Keep routes thin and cross-module access
   behind public `index.ts` APIs.
2. Start components in the narrowest owner. Reuse existing shared components,
   then inspect shadcn before creating custom primitives.
3. Keep server state in TanStack Query, HTTP behavior in shared API clients,
   forms in React Hook Form with Zod, and meaningful search state validated.
4. Keep browser-visible copy in Brazilian Portuguese and technical artifacts in
   English.
5. Read `import.meta.env` only through the approved config boundary. Keep
   `/config.json` public and never store auth tokens in `localStorage`.
6. Preserve keyboard use, visible focus, accessible names and errors, stable
   loading labels, duplicate-action prevention, responsive behavior, and no
   loading layout shift.
7. Check bundle impact, duplicate requests, rerenders, unbounded client work,
   and whether browser fixtures are being mistaken for production.
8. Add focused tests and run the smallest relevant package checks.
9. Decide whether README, durable docs, AGENTS, initiative docs, skills, or
   backlog need updates.

## Validation

```bash
pnpm --filter web check
pnpm --filter web typecheck
pnpm --filter web test
pnpm --filter web build
```

Run `pnpm --filter web test:e2e` for affected routes, navigation, forms, auth
flows, loading/error states, or responsive behavior when browser setup exists.
Use relevant vendor skills for framework-specific details.
