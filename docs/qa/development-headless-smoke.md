# Development headless smoke tests

A small Playwright suite that runs **headless** against deployed development or
PR-preview hosts and exercises first-smoke coverage for admin, donor, and
missionary surfaces.

## Triggers

Run development headless smoke QA when validating deployed `develop` branch
behavior, release readiness before a production PR, or a suspected regression in
the shared development environment.

For label-gated PR previews, use
[PR Preview Smoke QA](./pr-preview-smoke.md). GitHub Actions is the preferred
runner for PR preview smoke: Actions creates the preview deployments, passes
Vercel deployment-protection bypass secrets as Playwright headers, runs the
`development-*` Playwright projects against the generated URLs, and comments
PASS/FAIL for Claude to read.

## Surfaces

- **admin** — `https://development-admin.asymmetric.al`
- **donor** — `https://development-donor.asymmetric.al`
- **missionary** — `https://development-missionary.asymmetric.al`

## Development vs PR Preview Smoke

Development smoke targets stable branch-bound development URLs. PR preview
smoke targets ephemeral Vercel preview URLs created only after a PR passes the
`qa:smoke` GitHub Actions label gate.

Development smoke validates the current `develop` deployment. PR preview smoke
validates a specific PR head SHA before merge.

## How this differs from Claude in Chrome

| Concern                      | Claude in Chrome                                | Headless Playwright                                                                  |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Visible browser              | yes (qa-claude profile)                         | no — `headless: true`                                                                |
| Driver                       | LLM driving DOM tools step-by-step              | Playwright spec files in `tests/e2e/development-smoke/`                              |
| Vercel deployment protection | seeded through local operator setup             | sent on every request as the **`x-vercel-protection-bypass`** header                 |
| Where secrets live           | gitignored local/cloud secret store             | GitHub Actions secrets for PR preview smoke; gitignored local secrets for local runs |
| When to use                  | exploratory / one-off verification, screenshots | regression-style re-check, runs without supervision                                  |

## Workflow Steps

1. Confirm the `develop` deployment or PR preview deployment is expected to be
   live for the commit under test.
2. Set Playwright base URLs for the surfaces being tested:

```bash
export QA_ADMIN_BASE_URL=https://development-admin.asymmetric.al
export QA_DONOR_BASE_URL=https://development-donor.asymmetric.al
export QA_MISSIONARY_BASE_URL=https://development-missionary.asymmetric.al
export VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET=...
export VERCEL_DONOR_AUTOMATION_BYPASS_SECRET=...
export VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET=...
export QA_TEST_EMAIL=...
export QA_TEST_PASSWORD=...
```

3. Run the relevant smoke project(s):

```bash
bun run test:e2e:development-smoke:admin
bun run test:e2e:development-smoke:donor
bun run test:e2e:development-smoke:missionary
bun run test:e2e:development-smoke
```

4. Keep reports and `test-results/` local or in CI artifacts. Do not commit
   them.
5. Record pass/fail status and non-secret evidence in the PR or release notes.

The committed scripts never print credentials, Vercel bypass secrets, or bypass
URLs. Playwright output includes the surface label, the clean base URL, the
Playwright project name, and the Playwright exit code.

## Configuration

The Playwright config is `playwright.development-smoke.config.ts`. It:

- defines three projects: `development-admin`, `development-donor`,
  `development-missionary`
- pulls each project's `baseURL` and Vercel bypass secret from env
  (`QA_<SURFACE>_BASE_URL`, `VERCEL_<SURFACE>_AUTOMATION_BYPASS_SECRET`)
- sends bypass via headers, not query params
- runs headless Chromium, one worker
- writes report artifacts under `playwright-report/development-smoke/`

The helpers in `tests/e2e/development-smoke/helpers.ts` cover:

- reading `QA_TEST_EMAIL` / `QA_TEST_PASSWORD` from env without logging
- filling the login form with Playwright `fill()`
- retrying once if the app shows "Invalid login credentials"
- asserting the page is off `/login` after login
- attaching non-secret evidence to the test report on failure

## How to view the report

```bash
bunx playwright show-report playwright-report/development-smoke
```

## Evidence captured on failure

For any failed test, Playwright keeps under
`playwright-report/development-smoke/`:

- HTML report
- JSON report at `results.json`
- screenshot, trace, and video when retained by Playwright
- non-secret `evidence.json` attachments

## Safety Rules

- Never point development smoke at production URLs.
- Never run destructive flows or live-payment flows as smoke checks.
- Never paste cookies, tokens, credentials, deployment-protection bypass URLs,
  or secret-bearing request URLs in comments or docs.
- For PR preview smoke, never pass Vercel automation bypass secrets in query
  parameters. Use Playwright request headers only.
- Keep `.claude/`, `playwright-report/`, `test-results/`, and cloud credential
  material out of commits.

## Checklist

- [ ] Target URLs are development or PR preview URLs, not production
- [ ] Only non-destructive smoke tests are selected
- [ ] `QA_*_BASE_URL` values and Vercel bypass secrets are loaded from a
      gitignored local or cloud secret store
- [ ] Playwright failures are triaged before release
- [ ] Reports remain uncommitted or in CI artifacts only
- [ ] Shared findings mention only non-secret URLs and statuses

## Related

- Repo testing rules: `docs/ai/rules/testing.md`
- PR preview smoke: `docs/qa/pr-preview-smoke.md`
