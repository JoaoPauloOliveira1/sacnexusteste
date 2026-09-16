# Unit Test Execution

## Run Unit Tests

### 1. Execute IDP Unit Tests

```bash
pnpm --filter idp test
```

### 2. Review Test Results

- Expected: all IDP Vitest test files pass with 0 failures.
- Current result: 19 files passed, 102 tests passed.
- Test report location: terminal output. Coverage output is generated only when running `pnpm --filter idp test:coverage`.

### 3. Fix Failing Tests

If tests fail:

1. Review the failing Vitest output.
2. Fix the relevant source, test, or fixture.
3. Rerun `pnpm --filter idp test` until all tests pass.

## Additional Quality Checks

```bash
pnpm --filter idp typecheck
pnpm --filter idp check
```

`typecheck` validates TypeScript with `tsc --noEmit`. `check` validates Biome formatting, linting, and import organization.
