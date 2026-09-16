# Build Instructions

## Prerequisites

- **Build Tool**: pnpm 10.33.3 with Turborepo and package-level scripts.
- **Runtime**: Node.js version defined by the repository root.
- **Dependencies**: Install with `pnpm install` from the repository root.
- **Environment Variables**: Build and unit checks do not require real `.env` values. Runtime execution requires IDP variables documented in `apps/idp/README.md` and `.env.example`.
- **System Requirements**: macOS/Linux shell, Node.js, pnpm via Corepack.

## Build Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Build The IDP

```bash
pnpm --filter idp build
```

### 3. Verify Build Success

- Expected output: `tsc -p tsconfig.build.json && tsc-alias -p tsconfig.build.json` completes with exit code 0.
- Build artifacts: compiled IDP JavaScript under `apps/idp/dist`.
- Application startup does not run migrations automatically.

## Troubleshooting

### Build Fails With Dependency Errors

- Cause: dependencies are missing or lockfile is out of sync.
- Solution: run `pnpm install` from the repository root and retry.

### Build Fails With Compilation Errors

- Cause: TypeScript errors, missing imports, or alias rewrite issues.
- Solution: run `pnpm --filter idp typecheck`, fix reported errors, then rerun `pnpm --filter idp build`.

### Runtime Startup Fails After Build

- Cause: runtime environment variables or database availability are invalid.
- Solution: compare runtime variables against `apps/idp/.env.example` and `apps/idp/README.md`. Do not print or commit real secrets.
