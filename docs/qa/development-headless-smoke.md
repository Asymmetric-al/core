# Development headless smoke tests

A small Playwright suite that runs **headless** against the deployed
development hosts and exercises the same first-smoke coverage we previously
proved manually through Claude in Chrome. Use this as a fast, repeatable
re-check after admin / donor / missionary changes ship to development.

## Surfaces

- **admin** — `https://development-admin.asymmetric.al`
- **donor** — `https://development-donor.asymmetric.al`
- **missionary** — `https://development-missionary.asymmetric.al`

## How this differs from Claude in Chrome

| Concern                      | Claude in Chrome                                      | Headless Playwright                                                                                       |
| ---------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Visible browser              | yes (qa-claude profile)                               | no — `headless: true`                                                                                     |
| Driver                       | LLM driving DOM tools step-by-step                    | Playwright spec files in `tests/e2e/development-smoke/`                                                   |
| Vercel deployment protection | seeded via query-param URL the helper opens in Chrome | sent on every request as the **`x-vercel-protection-bypass`** header + `x-vercel-set-bypass-cookie: true` |
| Where secrets live           | `.claude/settings.local.json` (gitignored)            | `.claude/settings.local.json` (gitignored) — same source                                                  |
| When to use                  | exploratory / one-off verification, screenshots       | regression-style re-check, runs without supervision                                                       |

## How to run

Export the required local QA env vars first. Keep them in a gitignored local
file or shell secret store; do not commit them.

```bash
export QA_ADMIN_BASE_URL=https://development-admin.asymmetric.al
export QA_DONOR_BASE_URL=https://development-donor.asymmetric.al
export QA_MISSIONARY_BASE_URL=https://development-missionary.asymmetric.al
export VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET=...
export VERCEL_DONOR_AUTOMATION_BYPASS_SECRET=...
export VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET=...
export QA_TEST_EMAIL=...
export QA_TEST_PASSWORD=...

bun run test:e2e:development-smoke:admin
bun run test:e2e:development-smoke:donor
bun run test:e2e:development-smoke:missionary
bun run test:e2e:development-smoke
```

If you maintain a local `.claude/local-bin/asym-qa` wrapper, it may inject the
same env vars and call these scripts, but the committed entry points are the
`bun run test:e2e:development-smoke*` scripts above.

The committed scripts never print credentials, the Vercel bypass secret, or any
bypass URL. Playwright output includes:

- the surface label (`admin` / `donor` / `missionary`)
- the **clean** base URL (no bypass token, no query params)
- the Playwright project name
- the Playwright exit code

## Configuration

The Playwright config is `playwright.development-smoke.config.ts`. It:

- defines three projects: `development-admin`, `development-donor`,
  `development-missionary`
- pulls each project's `baseURL` and Vercel bypass secret from env
  (`QA_<SURFACE>_BASE_URL`, `VERCEL_<SURFACE>_AUTOMATION_BYPASS_SECRET`)
- sends bypass via **headers**, not query params
- runs headless chromium, one worker
- writes report artifacts under `playwright-report/development-smoke/`

The helpers in `tests/e2e/development-smoke/helpers.ts` cover:

- reading `QA_TEST_EMAIL` / `QA_TEST_PASSWORD` from env without logging
- filling the login form (clear first, then `fill()`) — no paste mechanics
- retrying once if the app shows "Invalid login credentials"
- asserting the page is off `/login` after login
- attaching non-secret evidence (URL, title, heading, visible-password count)
  to the test report on failure

## How to view the report

```bash
bunx playwright show-report playwright-report/development-smoke
```

(or `npx playwright show-report playwright-report/development-smoke`)

## Evidence captured on failure

For any failed test, Playwright keeps under `playwright-report/development-smoke/`:

- **HTML report** — pass/fail tree, attachments, embedded screenshot/video/trace
- **JSON report** — `results.json`, machine-readable run summary
- **screenshot** — `screenshot: "only-on-failure"`
- **trace** — `trace: "retain-on-failure"` (open with `playwright show-trace`)
- **video** — `video: "retain-on-failure"`
- **`evidence.json` attachment** — current URL, page title, primary heading,
  visible-password-input count (no secrets, no input values)

## What this suite does not do

- It is a **smoke** suite, not regression coverage. Three short specs total.
- It does not run from CI (no required GitHub status check). It is meant to be
  triggered locally from this repo by an operator with the QA env vars
  loaded.
- It does not exercise giving forms, donor payment methods, recurring gifts,
  publishing, public-page edits, or any other write surface.

## Do not

- Do not commit `.claude/settings.local.json` (ignored locally via
  `.git/info/exclude`).
- Do not put the Vercel bypass secret in URLs, package.json scripts, CI logs,
  or any committed file. Headers only.
- Do not hard-code `QA_TEST_PASSWORD` or any of the bypass secrets anywhere in
  the spec files, helpers, or config.
- Do not point this suite at production unless the operator has consciously
  swapped the env values and accepted that production data is at stake.

## Related

- Repo testing rules: `docs/ai/rules/testing.md`.
- Local secret names: `QA_<SURFACE>_BASE_URL`,
  `VERCEL_<SURFACE>_AUTOMATION_BYPASS_SECRET`, `QA_TEST_EMAIL`, and
  `QA_TEST_PASSWORD`.

## PR preview smoke relationship

Do not use this development smoke flow for label-gated PR previews. Use
[PR Preview Smoke QA](./pr-preview-smoke.md) for `qa:smoke` preview
deployments. Development smoke validates stable branch-bound `develop` URLs;
PR preview smoke validates a specific PR head SHA and uses clean Vercel preview
URLs from the GitHub Actions comment marker.

## Checklist

- [ ] Target URLs are development URLs, not production
- [ ] Only non-destructive smoke tests are selected
- [ ] `QA_*_BASE_URL` values and Vercel bypass secrets are loaded from a
      gitignored local or cloud secret store
- [ ] Playwright failures are triaged before release
- [ ] Reports remain uncommitted
- [ ] Shared findings mention only non-secret URLs and statuses
