# Claude PR Preview Smoke Routine

## Triggers

Run this routine when `QA Smoke Preview Deploy` comments the
`qa-smoke-preview-ready` marker on a PR, or when the optional
`CLAUDE_QA_ROUTINE_WEBHOOK_URL` receives a `qa_smoke_preview_ready` payload.

Do not run this routine for PRs without preview URLs. Do not run it against
production.

## Inputs

Read preview URLs from either source:

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

1. Confirm `event` is `qa_smoke_preview_ready`, `repo` is
   `Asymmetric-al/core`, `base` is `develop`, and `label` is `qa:smoke`.
2. Read the `admin`, `donor`, and `missionary` URL values.
3. Run Playwright only for surfaces with non-null URLs:
   - Admin URL -> set `QA_ADMIN_BASE_URL`
   - Donor URL -> set `QA_DONOR_BASE_URL`
   - Missionary URL -> set `QA_MISSIONARY_BASE_URL`
4. Use cloud-hosted QA secrets from the automation environment. Do not ask the
   PR author for secrets and do not write secrets into comments.
5. Run the smallest non-destructive smoke set that matches the URL surface:
   - Admin: admin auth/table/support smoke or boneyard smoke as applicable
   - Donor: donor smoke and donation UI smoke with test-mode-only behavior
   - Missionary: missionary auth/boneyard smoke
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
- [ ] Only surfaces with preview URLs were tested
- [ ] `QA_ADMIN_BASE_URL`, `QA_DONOR_BASE_URL`, and/or
      `QA_MISSIONARY_BASE_URL` were set from preview URLs
- [ ] No production URL was tested
- [ ] No destructive flow or live-payment flow was run
- [ ] PASS/FAIL comment includes the commit SHA and per-surface status
- [ ] Comment contains no secrets, credentials, cookies, bypass URLs, reports,
      or trace artifacts with private data
