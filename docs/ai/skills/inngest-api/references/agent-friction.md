# Agent Friction Notes

Use this reference when the user asks to test, improve, or reason about the
agent experience of `npx inngest-cli@latest alpha api`.

## Current P0 Gaps

- No `list-runs`, `list-functions`, or `list-apps`. Agents cannot discover the
  IDs required by `get-function-run`, `get-function-trace`, `invoke-function`,
  or `sync-app`.
- Env-scoped commands can silently default to production. For write operations,
  require the user to confirm the target env and pass `--env` or
  `INNGEST_ENV` explicitly.
- Missing Cloud auth and bad Cloud auth both return `401 Unauthorized` with
  `access_denied`. Treat this as ambiguous: first verify a key was actually
  provided, then ask the user to rotate/regenerate only if a key was sent.
- `sync-app` requires an existing `--app-id`, so it is a re-sync shape, not a
  first-time "register this URL" workflow.
- Several generated field descriptions are too thin for agents:
  `--transform`, `--event-filter`, `--response`, `--data`, `--url`,
  `--idempotency-key`, `--id`, and `--name`.

## Known Response/Validation Traps

- Empty list responses may omit `data` instead of returning `data: []`.
- Pagination fields may be partially absent unless there are more results.
- `create-env` with no fields has been observed returning a 500 instead of a
  field-level 400.
- `patch-env --id` expects the env ID, while global `--env` accepts the env
  name. Do not assume env names and IDs are interchangeable.
- A no-op `patch-env --id <id>` may return 200 unchanged rather than
  `no_changes_requested`.
- Bogus app/function IDs can surface body validation errors first, so a
  `missing data` response does not prove the app/function exists.
- Webhook `url` and signing-key `decryptedKey` values are secrets. Redact them
  in summaries and do not commit them.

## Safer Agent Pattern

1. Start with `npx inngest-cli@latest alpha api --prod --help`, not only
   subcommand help, because subcommand help hides inherited target/auth flags.
2. Run read-only smoke tests:

   ```bash
   npx inngest-cli@latest alpha api --prod get-account
   npx inngest-cli@latest alpha api --prod get-account-envs --limit 5
   ```

3. For env-scoped operations, list envs and set `INNGEST_ENV` explicitly.
4. For list endpoints, parse `data || []` defensively and continue pagination
   only when `page.hasMore` is true.
5. Before mutating calls, confirm the target env and whether the operation is
   read-only, write-only, or side-effecting.
6. If a workflow requires app/function/run discovery and the user has not
   provided IDs, state that the current CLI surface cannot discover them yet.

## CLI Product Recommendations

- Add `list-runs`, `list-functions`, `list-apps`, and event-to-runs lookup.
- Add first-time app registration/sync by URL.
- Require or echo env targeting for env-scoped writes.
- Make auth errors actionable and distinguish no key from bad key.
- Echo inherited flags in every subcommand's help.
- Always return `{data, metadata, page?}` with stable empty and pagination
  shapes.
- Mark sensitive fields in the schema or output.
- Aggregate validation errors and prefer field-level 400s over generic 500s.
