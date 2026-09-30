# Preserve Support Hub persisted reads and verification boundaries

## Why

The route-backed collection schemas reject database-valid internal email
addresses, including nested assignees, dropping real conversations and inboxes.
The added test resolver also permits private package paths and mishandles export
conditions; the retirement scanner globally ignores names intended only for Eve
generated output. These can hide regressions behind successful local checks.

## What Changes

- Match persisted agent/inbox email fields to their existing SQL CHECK grammar.
- Keep valid collection rows and report rejected row IDs and counts.
- Delegate workspace exports to installed Vite from the current checkout.
- Limit Eve output exclusions to their repository-relative directories.
- Correct collection/live-hook and historical adapter documentation.

## Impact

No migrations, email sending, auth/tenant scope changes or collection cutover.
The current shared holiday-date write/read contract remains intact. Invalid
contact identifier shapes are not coerced into a different identity. Rollback is
a normal source revert; no deployment data rewrite is required.
