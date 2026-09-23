# Dynamic Test Selection

> **When to use**: You need to decide *which* tests run, or *how* they retry, from outside the test files — driven by CI signals, a quarantine list, or historical flakiness data from an external service. Playwright 1.62+.
> **Prerequisites**: [core/flaky-tests.md](flaky-tests.md), [ci/reporting-and-artifacts.md](../ci/reporting-and-artifacts.md)

Before 1.62, filtering tests from outside the suite meant `--grep` with a generated regex, or editing spec files to add `test.skip()`. Both are blunt. `--grep` matches on titles, so a rename silently drops a test from the filter, and titles containing regex metacharacters have to be escaped. Editing spec files means a bot writing commits.

Playwright 1.62 adds `reporter.preprocess()`, a hook that runs after collection and before execution, with the ability to mark individual tests. The selection lives in a reporter, not in the specs.

## Quick Reference

```bash
# Run all retries at the end in one worker (1.62+)
npx playwright test --retries=2 --retry-strategy=isolated

# Append a reporter instead of replacing the configured one (1.63+)
npx playwright test --add-reporter json

# Still useful: title-based filtering for ad-hoc runs
npx playwright test --grep @smoke
npx playwright test --grep-invert @flaky
```

```ts
// playwright.config.ts
export default defineConfig({
  retries: 2,
  retryStrategy: 'isolated',              // 1.62+
  reporter: [['./reporters/quarantine.ts'], ['html']],
});
```

## Patterns

### Pattern 1: The `preprocess()` Hook (Playwright 1.62+)

`preprocess()` receives the collected suite and a `testRun` object. Mark tests before anything executes.

```js
// reporters/quarantine.ts
class QuarantineReporter {
  async preprocess({ config, suite, testRun }) {
    for (const test of suite.allTests()) {
      if (shouldSkip(test))
        testRun.skip(test);
    }
  }
}

export default QuarantineReporter;
```

`testRun` can mark a test as **skipped**, **excluded**, **fixed**, or **failing**. The distinction matters:

| Mark | Test executes? | Appears in report? | Use for |
|---|---|---|---|
| `skip` | No | Yes, as skipped | Quarantined tests you still want counted |
| `exclude` | No | No | Tests irrelevant to this run (wrong shard, wrong tag) |
| `fixed` | Yes | Yes | A test you expect to now pass; fails the run if it does not |
| `failing` | Yes | Yes | Known-broken; fails the run if it unexpectedly passes |

`failing` is the one people miss. It runs the test, expects red, and alerts you when it goes green — which is how a quarantine list shrinks on its own instead of rotting.

**Why this beats `--grep`**: the hook sees `TestCase` objects, so you can match on file path, title path, tags, annotations, or project — not just a title regex. Nothing needs escaping, and a renamed test fails loudly at lookup instead of silently falling out of a pattern.

### Pattern 2: Driving Selection From an External Flaky List

The useful version of a quarantine is not a hardcoded array. It is a list computed from run history, refreshed on every CI run.

This example uses the TestDino API, which returns test cases with aggregated flakiness across runs. Any service exposing a similar list works the same way.

```ts
// reporters/quarantine.ts
import type { Reporter, TestCase } from '@playwright/test/reporter';

const API = 'https://api.testdino.com/api/v1/public';

async function fetchFlakyTitles(): Promise<Set<string>> {
  const { TESTDINO_PROJECT_ID, TESTDINO_API_TOKEN } = process.env;
  if (!TESTDINO_PROJECT_ID || !TESTDINO_API_TOKEN) return new Set();

  const params = new URLSearchParams({
    status: 'flaky',
    days: '7',                 // 7, 30, or 90 only
    sortBy: 'flaky_rate',
    order: 'desc',
    limit: '50',               // 10, 25, or 50 only
  });

  try {
    const res = await fetch(`${API}/${TESTDINO_PROJECT_ID}/test-case-explorer?${params}`, {
      headers: { Authorization: `Bearer ${TESTDINO_API_TOKEN}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return new Set();
    const { success, data } = await res.json();
    if (!success) return new Set();
    return new Set(data.testCases.map((tc) => tc.title));
  } catch {
    return new Set();          // never let telemetry break the test run
  }
}

class QuarantineReporter implements Reporter {
  async preprocess({ suite, testRun }) {
    const flaky = await fetchFlakyTitles();
    if (flaky.size === 0) return;

    for (const test of suite.allTests()) {
      if (flaky.has(test.title))
        testRun.failing(test);   // runs, expected red, alerts if it goes green
    }
  }
}

export default QuarantineReporter;
```

**The `catch` returning an empty set is the important line.** A quarantine reporter that throws on a network blip takes the whole pipeline down. Degrade to "quarantine nothing" and let the run proceed.

**Match on more than the title.** Titles collide across files. If the API returns a spec path, key on `test.titlePath().join(' > ')` or compare `test.location.file` as well:

```ts
const key = (t: TestCase) => `${t.location.file}::${t.titlePath().join(' > ')}`;
```

### Pattern 3: Isolated Retries (Playwright 1.62+)

The default retry runs immediately, in the same worker, with whatever state that worker accumulated. That is the worst possible environment for diagnosing a flaky failure, because the retry inherits the conditions that may have caused it.

```ts
// playwright.config.ts
export default defineConfig({
  retries: 2,
  retryStrategy: 'isolated',
});
```

`'isolated'` defers all retries to the end of the run and executes them in a single worker. Two consequences worth knowing:

- **A test that passes on isolated retry but failed in the parallel run is telling you something specific**: the failure is concurrency-related, not inherent to the test. That is a diagnosis the default strategy hides.
- **Wall-clock time goes up** when many tests retry, because the retry phase is single-worker and serial. On a suite with a handful of retries this is noise. On a suite where 40 tests retry, it is a real cost, and the retries are not the problem you should be solving.

### Pattern 4: Shard-Aware Exclusion

`exclude` keeps a test out of the report entirely, which is what you want when a test is simply not this shard's job or its dependencies are unavailable in this environment.

```ts
class EnvironmentReporter {
  async preprocess({ suite, testRun }) {
    const hasStripeKey = Boolean(process.env.STRIPE_TEST_KEY);
    for (const test of suite.allTests()) {
      if (!hasStripeKey && test.titlePath().some((t) => t.includes('payment')))
        testRun.exclude(test);
    }
  }
}
```

Prefer tags and `--grep-invert` when the condition is static and known at command time. Reach for `exclude` when the condition is only knowable at runtime, such as a missing credential or a feature flag fetched from an API.

### Pattern 5: Combining With Tags

`preprocess()` does not replace tags. Use tags for intent the author declares, and `preprocess()` for facts the run discovers.

```ts
test('checkout completes', { tag: '@critical' }, async ({ page }) => { /* ... */ });
```

```ts
// Never quarantine a test the author marked critical, however flaky it looks
for (const test of suite.allTests()) {
  if (flaky.has(test.title) && !test.tags.includes('@critical'))
    testRun.failing(test);
}
```

That guard matters. An auto-quarantine with no exemption list will eventually silence your most important test, because the most important test is often the one touching the most infrastructure, which is the one that flakes.

## Decision Guide

| Situation | Approach |
|---|---|
| Static subset, known before the run | `--grep` / `--grep-invert` with tags |
| Subset depends on run history or an external service | `reporter.preprocess()` |
| Test is broken and you want it to stop blocking merges | `testRun.failing()` — runs it, alerts when it recovers |
| Test cannot run in this environment at all | `testRun.exclude()` |
| Diagnosing whether flakiness is concurrency-related | `retryStrategy: 'isolated'` |
| Tests contend over a shared resource | `lock` — see [ci/parallel-and-sharding.md](../ci/parallel-and-sharding.md) |

## Anti-Patterns

**Auto-quarantining with no exit path.** A list that only grows is a list nobody reads. Use `failing` rather than `skip` so a recovered test surfaces itself, and alert when the list does not shrink month over month.

**Letting the reporter's network call fail the run.** Wrap the fetch, set a timeout, and default to selecting nothing.

**Building a `--grep` regex from API-supplied titles without escaping.** A title containing `(`, `?`, or `[` produces either an invalid pattern or a silently wrong match. If you must use `--grep`, escape with `s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`. `preprocess()` avoids the problem entirely.

**Using `retryStrategy: 'isolated'` to make a red suite green.** It changes when retries run, not whether the test is sound. If isolated retries pass consistently, fix the isolation problem — see [core/flaky-tests.md](flaky-tests.md).

## Troubleshooting

### `preprocess()` never runs

The hook is only called on reporters listed in `reporter` config. A reporter passed via `--reporter` on the CLI **replaces** the configured list; use `--add-reporter` (1.63+) to append instead.

### Marks are applied but tests still run normally

Check that you are awaiting the async work inside `preprocess()`. The hook is `async`; returning before the fetch resolves leaves the loop unmarked.

### Titles from the API never match

Playwright's `test.title` is the innermost title only. A test inside `test.describe('Checkout')` has title `'completes'`, not `'Checkout > completes'`. Use `test.titlePath()` when the external system stores the full path.

## Related

- [core/flaky-tests.md](flaky-tests.md) — diagnosing and fixing the underlying flakiness
- [ci/parallel-and-sharding.md](../ci/parallel-and-sharding.md) — workers, shards, and `lock`
- [ci/reporting-and-artifacts.md](../ci/reporting-and-artifacts.md) — reporter configuration and `--add-reporter`
- [core/test-organization.md](test-organization.md) — tags and suite structure
