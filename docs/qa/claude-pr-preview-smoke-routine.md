# Claude PR Preview Smoke Routine

## Triggers

Run this routine when `QA Smoke Preview Deploy` comments the
`headless-pr-preview-smoke-qa` marker on a PR. The optional
`CLAUDE_QA_ROUTINE_WEBHOOK_URL` can also deliver a `qa_smoke_preview_ready`
payload for notification, but GitHub Actions is the preferred runner for
preview deployment and Playwright smoke.

Do not run this routine for PRs without preview URLs. Do not run it against
production.

## Inputs

Read preview URLs and smoke status from the PR comments first:

```html
<!-- headless-pr-preview-smoke-qa -->
```

Use the older preview-ready marker or webhook payload only as a URL handoff
source:

1. PR comment marker:

```html
<!-- qa-smoke-preview-ready
{"sha":"<sha>","admin":"<url-or-null>","donor":"<url-or-null>","missionary":"<url-or-null>"}
-->
```

2. Webhook payload:

```json
{
  "event": "qa_smoke_preview_ready",
  "repo": "Asymmetric-al/core",
  "pr_number": 123,
  "sha": "<sha>",
  "base": "develop",
  "label": "qa:smoke",
  "urls": {
    "admin": "<url-or-null>",
    "donor": "<url-or-null>",
    "missionary": "<url-or-null>"
  }
}
```

## Workflow Steps

1. Confirm the PR targets `develop`, has `qa:smoke`, and the comment SHA
   matches the PR head SHA.
2. Read the GitHub Actions PASS/FAIL/SKIPPED result from the
   `headless-pr-preview-smoke-qa` comment.
3. If the webhook payload is present, confirm `event` is
   `qa_smoke_preview_ready`, `repo` is `Asymmetric-al/core`, `base` is
   `develop`, and `label` is `qa:smoke`.
4. Do not store GitHub Actions secrets in Claude unless Claude itself is
   explicitly configured to run Playwright. In the preferred flow, GitHub
   Actions owns `QA_TEST_EMAIL`, `QA_TEST_PASSWORD`, and the Vercel automation
   bypass secrets.
5. If Claude is explicitly configured as the Playwright runner, run only for
   surfaces with non-null URLs:
   - Admin URL -> set `QA_ADMIN_BASE_URL`
   - Donor URL -> set `QA_DONOR_BASE_URL`
   - Missionary URL -> set `QA_MISSIONARY_BASE_URL`
     and pass Vercel deployment-protection bypass values through
     `x-vercel-protection-bypass` headers, never URL query parameters.
6. Comment PASS or FAIL on the PR, including:
   - commit SHA tested
   - surfaces tested
   - commands or suites run
   - concise failure summaries with non-secret evidence
7. On failure, do not retry indefinitely. Leave the failed status and enough
   sanitized detail for the author to reproduce.

## Comment Format

Use this shape:

```markdown
# QA Smoke Result

Commit: <sha>
Status: PASS|FAIL
Surfaces: Admin, Donor, Missionary

Results:

- Admin: PASS|FAIL|SKIPPED
- Donor: PASS|FAIL|SKIPPED
- Missionary: PASS|FAIL|SKIPPED

Notes:

- <short sanitized finding or "No issues found">
```

Do not include cookies, tokens, bypass URLs, secret names with values,
screenshots containing secrets, or raw trace links that require private
credentials.

## Checklist

- [ ] Marker/API payload repo, base, label, and SHA were validated
- [ ] GitHub Actions PASS/FAIL/SKIPPED comment was read first
- [ ] Only surfaces with preview URLs were tested when Claude is the runner
- [ ] `QA_ADMIN_BASE_URL`, `QA_DONOR_BASE_URL`, and/or
      `QA_MISSIONARY_BASE_URL` were set from preview URLs when Claude is the
      runner
- [ ] Claude did not store GitHub Actions secrets unless Claude itself ran
      Playwright
- [ ] No production URL was tested
- [ ] No destructive flow or live-payment flow was run
- [ ] PASS/FAIL comment includes the commit SHA and per-surface status
- [ ] Comment contains no secrets, credentials, cookies, bypass URLs, reports,
      or trace artifacts with private data
