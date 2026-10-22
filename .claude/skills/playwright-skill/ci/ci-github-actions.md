# CI: GitHub Actions

> **When to use**: Running Playwright tests automatically on pull requests, merges to main, or on a schedule. GitHub Actions is the most common CI for Playwright projects.

## Quick Reference

```bash
# Key CLI flags for CI
npx playwright install --with-deps    # install browsers + OS deps
npx playwright test --shard=1/4       # run 1 of 4 shards
npx playwright test --reporter=github # annotate PR with failures
npx playwright merge-reports ./blob-report  # merge shard reports
npx playwright test --fail-on-flaky-tests  # exit 1 if any test passed only on retry
npx playwright test --last-failed --last-failed-file=prev/.last-run.json  # re-run a downloaded run's failures (file flag 1.61+)
```

## Patterns

### Pattern 1: Production-Ready Workflow (Copy-Paste Starter)

**Use when**: Any project using GitHub Actions. This is the complete, battle-tested workflow.

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Cancel in-progress runs for the same PR/branch
concurrency:
  group: playwright-${{ github.ref }}
  cancel-in-progress: true

env:
  CI: true

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v6
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps

      - name: Install Playwright OS dependencies
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload HTML report
        uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

      - name: Upload test traces
        uses: actions/upload-artifact@v7
        if: failure()
        with:
          name: playwright-traces
          path: test-results/
          retention-days: 7
```

### Pattern 2: Sharded Execution with Matrix Strategy

**Use when**: Test suite takes more than 10 minutes. Split across parallel runners to cut wall-clock time.
**Avoid when**: Suite runs under 5 minutes -- sharding overhead (checkout, install, merge) negates the benefit.

```yaml
# .github/workflows/playwright-sharded.yml
name: Playwright Tests (Sharded)

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: playwright-${{ github.ref }}
  cancel-in-progress: true

env:
  CI: true

jobs:
  test:
    timeout-minutes: 20
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v6
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps

      - name: Install Playwright OS dependencies
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps

      - name: Run Playwright tests (shard ${{ matrix.shard }})
        run: npx playwright test --shard=${{ matrix.shard }}

      - name: Upload blob report
        uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ strategy.job-index }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Download all blob reports
        uses: actions/download-artifact@v8
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Merge reports
        run: npx playwright merge-reports --reporter=html ./all-blob-reports

      - name: Upload merged HTML report
        uses: actions/upload-artifact@v7
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

**Config for sharding** -- add blob reporter so shard output can be merged:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'on-failure' }]],
});
```

### Pattern 3: Reusable Workflow

**Use when**: Multiple repositories or multiple workflow files need the same Playwright setup.
**Avoid when**: Single repo with one workflow.

```yaml
# .github/workflows/playwright-reusable.yml
name: Playwright Reusable

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: 'lts/*'
      test-command:
        type: string
        default: 'npx playwright test'
      shard-total:
        type: number
        default: 1
    secrets:
      BASE_URL:
        required: false
      TEST_PASSWORD: # pragma: allowlist secret
        required: false

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: ${{ fromJson(format('[{0}]', join(fromJson(format('[{0}]', inputs.shard-total == 1 && '"1/1"' || '"1/4","2/4","3/4","4/4"')), ','))) }}

    env:
      CI: true
      BASE_URL: ${{ secrets.BASE_URL }}
      TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'

      - run: npm ci

      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v6
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps

      - name: Install Playwright OS dependencies
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps

      - name: Run tests
        run: ${{ inputs.test-command }} --shard=${{ matrix.shard }}

      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: playwright-report-${{ strategy.job-index }}
          path: playwright-report/
          retention-days: 14
```

**Calling the reusable workflow:**

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main]

jobs:
  e2e:
    uses: ./.github/workflows/playwright-reusable.yml
    with:
      node-version: 'lts/*'
      shard-total: 4
    secrets:
      BASE_URL: ${{ secrets.STAGING_URL }}
      TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }} # pragma: allowlist secret
```

### Pattern 4: Running in a Container

**Use when**: You need a reproducible environment identical to local Docker runs, or the runner's OS dependencies cause issues.
**Avoid when**: Standard `ubuntu-latest` with `--with-deps` works fine (the common case).

```yaml
# .github/workflows/playwright-container.yml
name: Playwright (Container)

on:
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.64.0-noble
      options: --ipc=host

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: lts/*

      - run: npm ci

      # No browser install needed -- they're in the container image
      - name: Run Playwright tests
        run: npx playwright test
        env:
          HOME: /root  # required when running as root in container

      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

### Pattern 5: Environment Secrets and Deployment Targets

**Use when**: Tests run against staging/production environments that require authentication credentials.
**Avoid when**: Tests only run against a locally started dev server.

```yaml
# .github/workflows/playwright-staging.yml
name: Playwright (Staging)

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    environment: staging  # GitHub Environment with protection rules

    env:
      CI: true
      BASE_URL: ${{ vars.STAGING_URL }}
      TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }} # pragma: allowlist secret
      API_KEY: ${{ secrets.API_KEY }}

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'

      - run: npm ci

      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v6
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps

      - name: Install Playwright OS dependencies
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps

      - name: Run tests against staging
        run: npx playwright test --grep @smoke

      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: staging-report
          path: playwright-report/
          retention-days: 14
```

### Pattern 6: Scheduled Runs (Nightly Regression)

**Use when**: Full regression suite is too slow for every PR. Run it nightly against main.
**Avoid when**: Suite runs in under 15 minutes and can run on every PR.

```yaml
# .github/workflows/playwright-nightly.yml
name: Nightly Regression

on:
  schedule:
    - cron: '0 3 * * 1-5'  # 3 AM UTC, Mon-Fri
  workflow_dispatch:         # allow manual trigger

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    env:
      CI: true
      BASE_URL: ${{ vars.STAGING_URL }}

    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v7
        with:
          node-version: lts/*
          cache: 'npm'

      - run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run full regression suite
        run: npx playwright test --grep @regression

      - uses: actions/upload-artifact@v7
        if: ${{ !cancelled() }}
        with:
          name: nightly-report-${{ github.run_number }}
          path: playwright-report/
          retention-days: 30

      - name: Notify on failure
        if: failure()
        uses: slackapi/slack-github-action@v4.0.0
        with:
          webhook: ${{ secrets.SLACK_WEBHOOK_URL }}
          webhook-type: incoming-webhook
          payload: |
            text: "Nightly Playwright regression failed: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
```

## Decision Guide

| Scenario | Approach | Why |
|---|---|---|
| Small suite (< 5 min) | Single job, no sharding | Overhead of sharding exceeds time saved |
| Medium suite (5-20 min) | 2-4 shards with matrix | Cut wall-clock time by ~60-75% |
| Large suite (20+ min) | 4-8 shards + blob report merge | Keep PR feedback under 10 minutes |
| Cross-browser on PRs | Chromium only on PRs; all browsers on main | 3x fewer minutes burned on PRs |
| Staging/prod smoke tests | Separate workflow with `environment:` | Isolate secrets, add approval gates |
| Nightly full regression | `schedule` trigger + `workflow_dispatch` | Full coverage without blocking PRs |
| Multiple repos, same setup | Reusable workflow with `workflow_call` | DRY; update one file, all repos benefit |
| Reproducible env needed | Container job with Playwright image | Identical to local Docker environment |

## Security: Pinning Actions to Commit SHAs

Version tags like `actions/checkout@v7` are mutable — the tag can be moved to a different commit without warning, introducing unverified code into your CI pipeline (supply-chain risk W012).

**Best practice**: pin every action to its full commit SHA.

```yaml
# Instead of:
- uses: actions/checkout@v7

# Pin to a specific immutable commit SHA:
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1  # v7.0.1
```

**How to find the SHA for any action:**

```bash
# Look up the SHA for a tagged release on GitHub:
# https://github.com/<owner>/<action>/releases
# Click the tag → copy the full commit SHA from the URL or commit details

# Or use the gh CLI:
gh api repos/actions/checkout/git/ref/tags/v7.0.1 --jq '.object.sha'
```

**Example pinned workflow step set (verify SHAs at release pages before use):**

```yaml
steps:
  - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1        # v7.0.1
  - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1        # v7.1.0
  - uses: actions/cache@55cc8345863c7cc4c66a329aec7e433d2d1c52a9             # v6.1.0
  - uses: actions/upload-artifact@cf430e030ddbb5b0abf93d22962f4752f3646cd9   # v7.0.2
  - uses: actions/download-artifact@9000827ccba6bdab643e8b6fd33ac0654aef8333 # v8.0.2
```

> Always verify these SHAs against the official release pages at github.com/actions before adding them to production workflows.

## Anti-Patterns

| Anti-Pattern | Problem | Do This Instead |
|---|---|---|
| No `concurrency` group | Duplicate runs waste minutes on every push | Add `concurrency: { group: ..., cancel-in-progress: true }` |
| `fail-fast: true` with sharding | One shard failure cancels others; you lose their results | Set `fail-fast: false` to collect all failures |
| Installing browsers without caching | 60-90 seconds wasted every run | Cache `~/.cache/ms-playwright` keyed on lockfile hash |
| `timeout-minutes` not set | Stuck jobs run for 6 hours (GitHub default) | Set explicit timeout: 20-30 minutes |
| Uploading artifacts only on failure | No report when tests pass; can't verify results | Use `if: ${{ !cancelled() }}` to always upload |
| Hardcoding secrets in workflow files | Security breach | Use GitHub Secrets and Environments |
| Running all browsers on every PR | 3x CI cost for marginal benefit | Chromium on PR; cross-browser on main merge |
| `actions/upload-artifact` with no retention | Default 90-day retention fills storage | Set `retention-days: 7-14` for reports |
| No `--with-deps` on browser install | Missing OS libraries cause browser launch failures | Always use `npx playwright install --with-deps` |
| Using mutable action version tags (`@v7`) | Tag can be silently re-pointed to a different commit (supply-chain risk) | Pin to full commit SHA; see Security section above |

## Troubleshooting

### Browser launch fails: "Missing dependencies"

**Cause**: Browsers installed from cache but OS dependencies were not cached (they live in system directories, not `~/.cache`).

**Fix**: Always run `npx playwright install-deps` on cache hit:

```yaml
- name: Install Playwright OS dependencies
  if: steps.playwright-cache.outputs.cache-hit == 'true'
  run: npx playwright install-deps
```

### Tests pass locally but fail in CI with timeouts

**Cause**: CI runners have fewer CPU cores and less RAM than your dev machine. Default workers and timeouts are too aggressive.

**Fix**: Reduce workers and increase timeouts for CI in your config:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  workers: process.env.CI ? '50%' : undefined,
  use: {
    actionTimeout: process.env.CI ? 15_000 : 10_000,
    navigationTimeout: process.env.CI ? 30_000 : 15_000,
  },
});
```

### Sharded reports are incomplete -- some shards missing from merged report

**Cause**: Using `actions/download-artifact@v8` without `merge-multiple: true`, or artifact names collide across shards.

**Fix**: Give each shard a unique artifact name and use `merge-multiple`:

```yaml
# Upload in each shard job
- uses: actions/upload-artifact@v7
  with:
    name: blob-report-${{ strategy.job-index }}
    path: blob-report/

# Download in merge job
- uses: actions/download-artifact@v8
  with:
    path: all-blob-reports
    pattern: blob-report-*
    merge-multiple: true
```

### `webServer` fails in CI: "port 3000 already in use"

**Cause**: Previous run left a zombie process, or another job step is using the port.

**Fix**: Ensure `reuseExistingServer: false` in CI and add a pre-step to kill stale processes:

```yaml
- name: Kill stale processes
  run: lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

### GitHub annotations not appearing on PR

**Cause**: The `github` reporter is not configured.

**Fix**: Add `github` reporter for CI runs:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],
});
```

## Related

- [ci/parallel-and-sharding.md](parallel-and-sharding.md) -- sharding strategies and blob report merging
- [ci/reporting-and-artifacts.md](reporting-and-artifacts.md) -- reporter configuration and artifact management
- [ci/docker-and-containers.md](docker-and-containers.md) -- container images for CI
- [ci/ci-gitlab.md](ci-gitlab.md) -- GitLab CI equivalent
- [ci/ci-other.md](ci-other.md) -- CircleCI, Azure DevOps, Jenkins
- [core/configuration.md](../core/configuration.md) -- CI-aware config settings
