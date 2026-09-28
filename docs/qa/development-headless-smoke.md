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
- writes HTML and JSON reports under `PLAYWRIGHT_REPORT_DIR`, defaulting to
  `playwright-report/development-smoke/`
- writes bounded test evidence under
  `PLAYWRIGHT_OUTPUT_DIR`, defaulting to `test-results/`

The preview workflow sets both directories per surface so a later Playwright
invocation does not overwrite an earlier surface's failure evidence. Blank
overrides use the local defaults above. The suite-specific reporter preserves
the original failed exit and test status; it does not relax any assertion.

The helpers in `tests/e2e/development-smoke/helpers.ts` cover:

- reading `QA_TEST_EMAIL` / `QA_TEST_PASSWORD` from env without logging
- filling the login form with Playwright `fill()`
- retrying once if the app shows "Invalid login credentials"
- asserting the page is off `/login` after login
- attaching non-secret evidence to the test report on failure

## How to view the report

Open `<report directory>/sanitized/index.html`. This is a bounded diagnostic summary,
not Playwright's interactive trace/report viewer.

## Evidence captured on failure

For any failed test, Playwright keeps in the configured report and test-output
directories:

- HTML summary
- JSON report at `<report directory>/sanitized/results.json`
- test title, project, status and duration
- `evidence.json` with URL origin/path, page title/heading, and visible password
  input count; known QA and bypass values are redacted
- the last 50 document/fetch/XHR response method/status/origin/path entries
  observed during authentication, without request headers, cookies or bodies

Known QA and bypass values are redacted before truncation in their raw/trimmed,
URI, URI-component, form-URL-encoded and UTF-8 base64/base64url forms (with or
without padding). Percent escapes may use either hex case. This is a bounded
set of representations, not detection of arbitrary transformations. Response
metadata describes only browser-visible requests; server-side profile reads
may be absent and an access-denied route alone does not establish its cause.

URL queries and fragments are excluded. Raw trace, screenshot, video and the
automatic DOM error prompt are disabled for this credential-bearing suite:
traces retain bypass headers, authentication bodies and API arguments, and DOM
snapshots can retain password input values. The reporter replaces run-owned
test output (including generated error-context files) with the bounded
evidence above and never removes arbitrary attachment sources outside the
resolved run directories. It emits no assertion bodies or API-step text into
the HTML/JSON bundle. Reports and output directories must be separate and
must not be a workspace root or its ancestor. These checks resolve symlinks,
including the nearest existing parent of a new directory, before Playwright
startup. The reporter uses the checked canonical paths and checks them again
before cleanup.

CI uploads only `sanitized/index.html` and `sanitized/results.json`; raw test
output is never part of the upload allowlist. If a reporter or worker fails
before producing a sanitized bundle, the missing-artifact step fails instead
of uploading leftovers. Successful cleanup is not a prerequisite for keeping
raw credentials out of uploaded artifacts.

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
