---
name: run-smoke-tests
description: Run Playwright smoke tests, debug failures, and verify fixes
---

# Run smoke tests

## Trigger

Need end-to-end smoke verification before or after changes.

## Workflow

1. Pick the suite. Playwright starts the app dev servers itself and reuses ones already running, so there is no separate build step.
2. Run the relevant smoke suite or a focused test file.
3. If failing, inspect traces/logs and isolate the root cause.
4. Apply a minimal fix and rerun until stable.

## Example Commands

```bash
# The required smoke gate (CI's e2e-smoke-gate runs the same script)
bun run test:e2e:smoke

# One spec, with the CI-safe environment defaults
bun run test:e2e tests/e2e/donate.spec.ts --project=chromium --workers=1

# The live development hosts (needs local-only secrets; see docs/ai/rules/testing.md)
bun run test:e2e:development-smoke:donor
```

## Guardrails

- Prefer deterministic waits and assertions over brittle timeouts.
- Re-run passing fixes to reduce flaky false positives.
- Quarantine tests only when explicitly requested and documented.

## Output

- Test results summary
- Root cause and fix
- Remaining flake risk (if any)
