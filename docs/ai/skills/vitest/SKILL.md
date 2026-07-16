---
name: vitest
description: Write, review, filter, mock, and debug Core unit tests with the repository's installed Vitest 4 configuration. Use for tests under Core's Vitest include paths, `vi.mock`/spies/timers, jsdom component tests, coverage output, focused reruns, or unit-test failures. Do not use for browser E2E flows or async Next.js Server Components.
---

# Vitest in Core

Use the repository harness as the source of truth. Core currently resolves
Vitest 4.1.x from `bun.lock`; verify the exact version before relying on a newly
introduced API.

## Authority and test surface

Read these before changing tests or configuration:

- `vitest.config.ts` — include globs, aliases, Node default environment,
  timeouts, mock clearing, setup, and the custom coverage provider.
- `tests/setup/unit-env.ts` — safe env defaults and browser shims.
- `scripts/verify/unit-tests.mjs` — the full unit gate and platform behavior.
- `docs/ai/rules/testing.md` — repository-wide test and CI policy.
- `.next-docs/01-app/02-guides/testing/vitest.mdx` when testing Next.js code.

Do not use `bun test`; that selects Bun's test runner. Use Vitest through the
committed scripts or `bunx vitest`.

## Commands

```bash
# Full CI-equivalent unit suite with Core's coverage provider
bun run test:unit

# Focused file or directory while iterating
bunx vitest run tests/unit/path/to/example.test.ts

# Focused test name
bunx vitest run tests/unit/path/to/example.test.ts -t "expected behavior"

# Watch a focused surface
bunx vitest tests/unit/path/to/example.test.ts

# Structured failure report and targeted reruns
bun run test:unit:feedback
```

## Workflow

1. **Choose the boundary.** Test observable behavior at the smallest stable
   public boundary. Prefer pure logic/unit coverage; use Playwright when the
   claim depends on a real browser, routing, hydration, or an async Server
   Component.
2. **Place the test in an included path.** Match the existing `tests/unit`,
   `packages/api/tests/unit`, or `packages/auth` conventions from
   `vitest.config.ts`; do not invent a disconnected test root.
3. **Control the environment.** The default is `node`. Add
   `// @vitest-environment jsdom` only to files that need DOM APIs, and clean up
   rendered components and mutated globals.
4. **Mock boundaries, not the unit's internals.** Remember that `vi.mock` is
   hoisted. Use `vi.hoisted` for shared mock state, dynamic imports when a module
   must load after mocks, and `vi.importActual` for intentional partial mocks.
5. **Reset all changed state.** `clearMocks: true` clears call history but does
   not restore globals, timers, dates, env values, or spy implementations. Undo
   those changes in hooks.
6. **Run focused, then full.** Iterate on the smallest file/name filter and run
   `bun run test:unit` before handoff.

## Core-specific guardrails

- Unit tests must not call live Supabase, Stripe, Resend, Payload, or network
  services. Use deterministic fakes at repository boundaries.
- Keep real credentials out of tests. The committed env defaults are
  placeholders and intentionally clear the Supabase service-role key.
- Assert behavior and durable contracts, not incidental class strings or
  implementation order unless that order is itself the contract.
- Prefer explicit test data builders/helpers over large untyped fixture blobs.
- Avoid `.only`; use `.skip`/`.todo` only with a documented reason and no hidden
  loss of required coverage.
- Core's custom coverage output is useful evidence, but its current
  `totalScripts: 0` summary is not a line/branch quality signal. Do not claim a
  threshold the provider does not measure.

## Checklist

- [ ] The test exercises an observable contract at the right test layer.
- [ ] The file is inside a configured include path and uses the correct env.
- [ ] Mocks intercept external boundaries and respect Vitest hoisting.
- [ ] Globals, env, timers, dates, spies, DOM, and module state are isolated.
- [ ] Assertions are deterministic and do not depend on network or test order.
- [ ] Focused tests pass, then `bun run test:unit` passes.
- [ ] Coverage output is described without overstating its current signal.

## Provenance

See [references/upstream.md](references/upstream.md) for the reviewed upstream
source, version mismatch decision, license, and refresh workflow.
