# PR Preview Smoke QA

## Triggers

Use PR preview smoke QA when a ready-for-review PR targets `develop`, is not a
fork, is not a draft, and has the `qa:smoke` label.

Codex should apply `qa:smoke` when a PR affects user-facing runtime flows:

- `apps/admin/**`, `apps/donor/**`, or `apps/missionary/**`
- `packages/ui/**`, `packages/auth/**`, `packages/api/**`
- routing, middleware, login/session, dashboards, giving flows, or the shared
  app shell

Skip the label for docs-only, evidence-only, formatting-only, or other
non-runtime changes.

## Policy

Vercel does not natively filter Preview Deployments by GitHub label. The label
gate lives in GitHub Actions:
`.github/workflows/qa-smoke-preview-deploy.yml`.

The workflow only deploys after these checks pass:

- base branch is `develop`
- PR is ready for review, not draft
- PR head repository is `Asymmetric-al/core`, not a fork
- PR has `qa:smoke`
- changed files affect at least one smoke surface

The workflow never uses `pull_request_target` and never passes Vercel secrets to
fork PRs. It deploys Vercel Preview targets only and does not deploy
Production.

## Workflow Steps

1. Add `qa:smoke` to the PR.
2. If the PR is draft, mark it ready for review. The workflow runs on
   `ready_for_review` or when the label is applied.
3. The action reads PR files and resolves affected surfaces:
   - `apps/admin/**` -> Admin preview
   - `apps/donor/**` -> Donor preview
   - `apps/missionary/**` -> Missionary preview
   - shared runtime/config/smoke changes -> all three previews
4. If no surface is affected, the action comments that all previews were
   skipped and exits successfully.
5. For affected surfaces, the action runs `vercel deploy --target=preview` with
   the selected project ID.
6. The action upserts a PR comment with preview URLs and this marker:

```html
<!-- qa-smoke-preview-ready
{"sha":"<sha>","admin":"<url-or-null>","donor":"<url-or-null>","missionary":"<url-or-null>"}
-->
```

7. The action runs headless Playwright smoke only for projects with preview
   URLs:
   - `development-admin`
   - `development-donor`
   - `development-missionary`
8. Playwright receives Vercel deployment-protection bypass secrets as
   `x-vercel-protection-bypass` headers, never as URL query parameters.
9. The action upserts a separate PASS/FAIL/SKIPPED comment with this marker:

```html
<!-- headless-pr-preview-smoke-qa -->
```

10. If `CLAUDE_QA_ROUTINE_WEBHOOK_URL` is configured, the action posts the same
    preview URL payload for Claude QA handoff. Missing webhook configuration is
    a skip, not a failure.

## Required Secrets

Configure these GitHub repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_ADMIN_PROJECT_ID`
- `VERCEL_DONOR_PROJECT_ID`
- `VERCEL_MISSIONARY_PROJECT_ID`
- `QA_TEST_EMAIL`
- `QA_TEST_PASSWORD`
- `VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET`
- `VERCEL_DONOR_AUTOMATION_BYPASS_SECRET`
- `VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET`

Optional:

- `CLAUDE_QA_ROUTINE_WEBHOOK_URL`

Do not print or paste secret values in PR comments, workflow summaries, docs, or
logs. Preview comments may contain public Vercel preview URLs, but must not
contain deployment-protection bypass URLs, tokens, cookies, credentials, or
other secrets.

## Playwright Handoff

The same Playwright smoke specs run against preview URLs by setting:

- `QA_ADMIN_BASE_URL`
- `QA_DONOR_BASE_URL`
- `QA_MISSIONARY_BASE_URL`

The older `PLAYWRIGHT_*_BASE_URL` variables still work and take precedence for
local or specialized runs.

GitHub Actions sets `QA_TEST_EMAIL`, `QA_TEST_PASSWORD`, and the per-surface
Vercel automation bypass secrets only in the Playwright step. These values must
not be printed, written to files, embedded in URLs, or included in PR comments.
Claude cloud routines should not store these secrets unless Claude itself runs
Playwright. The preferred flow is that GitHub Actions deploys previews, runs
Playwright, uploads sanitized failure artifacts, and comments the PASS/FAIL
result for Claude to read.

## Rerun Method

Use one of these:

- remove and re-add `qa:smoke`
- mark a labeled draft PR ready for review
- run `QA Smoke Preview Deploy` manually with `workflow_dispatch` and the PR
  number

For a new commit on an already-labeled PR, use manual dispatch unless the label
or ready-for-review state changes again.

## Vercel Settings

The app-level Vercel configs currently disable automatic Git deployments for
feature branches while keeping `develop` and `production` enabled:

- `apps/admin/vercel.json`
- `apps/donor/vercel.json`
- `apps/missionary/vercel.json`

Each file keeps:

```json
"git": {
  "deploymentEnabled": {
    "*": false,
    "develop": true,
    "production": true,
    "main": false
  }
}
```

This is safe for the label-gated workflow because the action creates explicit
CLI preview deployments only after `qa:smoke` passes, while branch-bound
development and production deployments remain available.

## Checklist

- [ ] PR targets `develop`
- [ ] PR is not draft
- [ ] PR is not from a fork
- [ ] `qa:smoke` is present only for user-facing/runtime changes
- [ ] Workflow comment lists Admin, Donor, and Missionary as URL or skipped
- [ ] Marker JSON contains only the commit SHA and preview URL/null values
- [ ] Headless PR preview smoke QA comment reports PASS/FAIL/SKIPPED per
      `development-*` project
- [ ] No production deployment was requested
- [ ] No secrets, credentials, tokens, cookies, reports, or bypass URLs were
      posted
