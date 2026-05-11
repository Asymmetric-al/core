# PR #216 Review - Harden and redesign Support Hub workflows

- URL: https://github.com/Asymmetric-al/core/pull/216
- Base: `epic`
- Head: `support-hub-three-track-remediation`
- Draft: no
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 45 changed files, +3,676 / -222
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/epic`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed, including 113 test files and 481 tests.

## Verdict

Not ready until route auth ordering and rollout fallback behavior are fixed. The local gate is green, but there are real P1 correctness issues.

## Findings

### P1 - Support ticket list validates query parameters before auth

Evidence: `packages/api/src/admin/support/tickets.ts` validates query params around lines 35-41 before resolving auth and role access.

Impact: unauthenticated invalid requests can receive `400`/validation details instead of `401`. That leaks route behavior and violates the usual auth-first API posture.

Suggested fix:

- Call `getAuthContext` and require the proper role before parsing query params.
- Add a test for unauthenticated invalid-query requests that expects `401`.

### P1 - Missing-table fallback only handles one PostgREST error shape

Evidence: `packages/api/src/admin/support/service.ts` lines 51-58 only recognize `PGRST205` with `public.support_`.

Impact: during rollout, other relation-missing forms such as Postgres `42P01` can bypass the intended fallback and return 500.

Suggested fix:

- Treat known relation-missing codes/messages as fallback-eligible.
- Add tests for `PGRST205`, `42P01`, and the expected message variants.

### P2 - New ticket form drops selected contact id

Evidence: `NewTicketForm` selects a contact id, but its POST payload does not include it. `createSupportTicket` inserts contact snapshots but no `contact_id`.

Impact: tickets can lose the relationship to the selected contact and only retain snapshots.

Suggested fix:

- Add `contactId` to the client schema/input.
- Insert `contact_id` server-side.
- Add coverage proving the selected contact id is preserved.

### P2 - Contact identity fields are overloaded

Evidence: `mapTicketRow` in `service.ts` lines 70-79 maps `contactId` from multiple possible row fields, including email/name/id-like values.

Impact: downstream UI cannot reliably distinguish stable ids from display snapshots.

Suggested fix:

- Preserve explicit `contactId`, `contactEmailSnapshot`, and `contactNameSnapshot`.
- Derive display labels separately.

### P2 - Filtered list loader fetches unfiltered summary data in parallel

Evidence: `loadSupportTicketList` in `loaders.ts` lines 58-71 calls `getSupportSummary` and `listSupportTickets` in parallel, then replaces tickets.

Impact: filtered list routes still fetch broader unfiltered ticket/contact data.

Suggested fix:

- Split the summary query from list hydration.
- Avoid loading full unfiltered tickets when route filters are active.

### P2 - Support Hub tables lack updated-at triggers

Evidence: migration `20260501001500_support_hub_foundation.sql` lines 12-34 creates `updated_at` defaults without update triggers for `support_contacts` and `support_tickets`.

Impact: `updated_at` can become stale unless every write path updates it perfectly.

Suggested fix:

- Add a shared `updated_at` trigger or explicit update discipline with tests.

### P2 - Future dates render as "1m ago"

Evidence: `formatSupportRelativeTime` in `support-hub.derived.ts` lines 10-24 clamps future values to an "ago" label.

Impact: scheduled follow-ups or snoozed future times can display misleadingly.

Suggested fix:

- Render future values as `in Xm` or label them as scheduled.

## Required Before Merge

- Fix auth-before-validation.
- Broaden missing-table fallback tests.
- Preserve contact ids.
- Rebase because the PR is `BEHIND`.
- Re-run full preflight.
