# Plan 004: Consolidate duplicated workflow helpers and trim wasted I/O

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 1b2afd5a..HEAD -- packages/api/src packages/lib apps/donor/app apps/admin/app tests/unit`
> Plans 001–003 intentionally modify several in-scope files first — run this
> plan LAST and treat their changes as the new baseline; on any other
> mismatch with the "Current state" notes, STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW (mechanical consolidation; behavior-preserving)
- **Depends on**: plans/001, 002, 003 (touches the same files; land after)
- **Category**: tech-debt
- **Planned at**: commit `1b2afd5a`, 2026-06-12

## Why this matters

The Inngest executor branch shipped working code with several copy-paste
clusters and avoidable I/O. None are bugs today; all are drift hazards: the
same logic exists in 3–7 places, so the next fix lands in some copies and not
others (the review already found one real divergence: the inline Stripe path
records outcomes without `pledgeId` while the workflow path includes it).
Consolidating now, while the branch is unmerged, is the cheap moment.

## Current state (the duplication clusters)

1. **Envelope validation boilerplate** — identical
   `workflowEventEnvelopeSchema.safeParse` + `NonRetriableError("workflow_envelope_invalid: ...")`
   blocks in `packages/api/src/workflows/functions/workflow-smoke.ts`,
   `donation-saga-recovery.ts`, `stripe-event-processing.ts`,
   `inbound-email-processing.ts`; the same issue-path formatting is repeated in
   `packages/api/src/workflows/dispatch.ts` and twice in
   `packages/api/src/workflows/ledger.ts`.
2. **Admin-client unwrap** — `getAdminClient()` + null-check + throw
   `"<prefix>_admin_client_unavailable"` appears 5× across
   `functions/inbound-email-processing.ts` (named helper),
   `functions/dispatch-recovery-scan.ts`, `functions/donation-saga-recovery.ts`
   (twice), `functions/stripe-event-processing.ts`.
3. **`extractEmailAddress`** — verbatim copies in
   `packages/api/src/workflows/adapters/inbound-routing.ts` and
   `packages/api/src/admin/support-hub/inbound-router.ts`; a stricter variant
   in `packages/api/src/email/webhooks/resend.ts`.
4. **`STRIPE_API_VERSION` / Stripe client factory** — constant re-declared in
   `packages/api/src/workflows/functions/donation-saga-recovery.ts`,
   `packages/api/src/stripe/webhooks.ts` (which also has `getStripeClient`),
   `packages/api/src/admin/contributions/replay.ts`, plus inline literals in
   `donate/index.ts`, `donate/outbox.ts`, `donations/index.ts`,
   `donor-portal/billing.ts`.
5. **`appendSupportAudit`** — helper in
   `packages/api/src/workflows/adapters/inbound-routing.ts`; raw equivalent
   inserts in `packages/api/src/admin/support-hub/move-service.ts`.
6. **New route modules skip `withOperation`** — the six new handlers
   (`admin/workflows/summaries.ts`, `admin/workflows/notification-policy.ts`,
   `admin/support-hub/inbound-routes.ts`, `inbound-route.ts`,
   `inbound-retry.ts`, `move.ts`) hand-roll auth + admin client + try/catch,
   losing the `requestId` correlation field and prerender-control-flow guard
   that `packages/api/src/shared/with-operation.ts` provides to the other 23
   admin endpoints (see `packages/api/src/admin/users.ts` as the exemplar).
7. **Wasted I/O** —
   `packages/api/src/workflows/summaries.ts` selects `*` (context jsonb,
   event_ids) for 50 rows when ~10 scalar columns are used;
   `packages/api/src/workflows/recovery.ts` dead-letters rows one
   UPDATE+RETURNING at a time and processes rows strictly sequentially;
   `packages/api/src/admin/support-hub/move-service.ts` re-validates the same
   destination inbox once per item in a bulk move;
   `inbound-routing.ts` `resumeMatchingPendingReviews` resolves reviews one
   UPDATE at a time.
8. **Misc** — `notification-policy.ts` requires an unused `attempts` field and
   the admin summaries handler evaluates the policy twice per row;
   `apps/donor/app/(public)/checkout/checkout-client.tsx` `SuccessView` has two
   nearly identical paragraph branches; `retryFailedBulkMove` +
   `bulkMoveSupportConversations(isRetry)` write the batch row twice per retry.

## Commands you will need

| Purpose   | Command                                                            | Expected on success |
| --------- | ------------------------------------------------------------------ | ------------------- |
| Tests     | `bunx vitest run tests/unit/packages tests/unit/apps/admin`         | all pass            |
| Typecheck | `bun run typecheck`                                                 | exit 0 (14/14)      |
| Lint      | `bun run lint`                                                      | exit 0 (14/14)      |
| Gates     | `bun run format:check && bun run verify:workspace-contract`         | exit 0              |

## Scope

**In scope**: the files named in "Current state", plus new shared modules
`packages/api/src/workflows/envelope-guard.ts`,
`packages/api/src/workflows/admin-client.ts`,
`packages/api/src/stripe/client.ts`,
`packages/api/src/email/address.ts`,
`packages/api/src/admin/support-hub/audit.ts`, and their tests.

**Out of scope**: any behavior change (this plan is consolidation only); the
dual-path Stripe webhook design; `packages/api/src/email/webhooks/resend.ts`
beyond importing the shared address helper; UI styling.

## Git workflow

- Current branch; one conventional commit per numbered step
  (`refactor(workflows): ...` / `perf(workflows): ...`).
- Do NOT push unless instructed.

## Steps

### Step 1: `parseWorkflowEnvelopeOrThrow` + shared issue formatting

Create `packages/api/src/workflows/envelope-guard.ts` exporting
`formatEnvelopeIssues(error: ZodError): string` and
`parseWorkflowEnvelopeOrThrow(data: unknown): WorkflowEventEnvelope` (throws
`NonRetriableError`). Replace the four function-level blocks and the three
ledger/dispatch formatting sites. Add the export to
`packages/api/package.json` only if an app-side import is needed (it is not —
internal relative imports suffice; skip the exports map).

**Verify**: `bunx vitest run tests/unit/packages/api/workflows` → all pass; `grep -rn "workflow_envelope_invalid" packages/api/src/workflows --include="*.ts" | grep -v envelope-guard | grep -v test` → only `envelope-guard.ts` constructs the message (call sites may still reference the string in comments/tests).

### Step 2: `requireWorkflowAdminClient`

Create `packages/api/src/workflows/admin-client.ts` exporting
`requireWorkflowAdminClient(errorPrefix: string)` that unwraps `getAdminClient()`
or throws `` `${errorPrefix}_admin_client_unavailable: ${error}` ``. Replace the
five unwrap sites in `packages/api/src/workflows/functions/*.ts`.

**Verify**: `grep -rn "admin_client_unavailable" packages/api/src/workflows/functions` → 0 inline constructions (all via the helper); workflows tests pass.

### Step 3: Shared `extractEmailAddress`

Create `packages/api/src/email/address.ts` with the stricter variant from
`resend.ts` (exactly-one-`@` validation). Import it in
`inbound-routing.ts`, `inbound-router.ts`, and `resend.ts`; delete the local
copies. Run the routing tests — if the stricter validation changes any
existing test expectation (it should not for well-formed fixtures), STOP.

**Verify**: `grep -rn "function extractEmailAddress" packages/api/src` → exactly 1 match (the shared module); `bunx vitest run tests/unit/packages/api/workflows/inbound-routing.test.ts tests/unit/packages/api/email` → all pass.

### Step 4: Shared Stripe client factory

Create `packages/api/src/stripe/client.ts` exporting
`STRIPE_API_VERSION = "2025-02-24.acacia"` and
`getStripeClient(secretKey: string): Stripe`. Replace the constant/factory in
the seven sites listed in Current state #4 (import from the new module;
`webhooks.ts` re-exports nothing — update its internal use).

**Verify**: `grep -rn "2025-02-24.acacia" packages/api/src --include="*.ts" | grep -v stripe/client.ts` → 0 matches; `bun run typecheck` filter `@asym/api` → exit 0.

### Step 5: Shared `appendSupportAudit`

Move the helper from `inbound-routing.ts` to
`packages/api/src/admin/support-hub/audit.ts` (same signature). Import it in
`inbound-routing.ts` and use it for the paired move markers in
`move-service.ts` (after Plan 003 Step D the pair is one `.insert([a, b])` —
extend the helper with an `appendSupportAuditPair` or accept an array; keep
one error-handling policy: THROW on failure, and adjust move-service to map
that throw to its existing `move_failed` return).

**Verify**: `grep -rn "support_audit_log" packages/api/src --include="*.ts" | grep -v audit.ts | grep -v test` → only reads remain (no raw inserts outside the helper); move-service + routing tests pass.

### Step 6: Adopt `withOperation` in the six new route modules

Read `packages/api/src/shared/with-operation.ts` and its use in
`packages/api/src/admin/users.ts`. Wrap the six new handlers' exports with the
same pattern (auth + role checks stay inside, ditto admin-client unwrap if
withOperation does not provide it — match `admin/users.ts` exactly). Preserve
each handler's status codes and response bodies; the wrapper may add
`requestId` to error responses — that is the point.

**Verify**: `bunx vitest run tests/unit/packages` → all pass; `bun run verify:workspace-contract` → exit 0.

### Step 7: I/O trims

1. `summaries.ts`: replace `select("*")` with the explicit ~10-column list.
2. `recovery.ts`: collect exhausted row ids and dead-letter them with one
   `.update({...}).in("id", ids)` (no `.select()`).
3. `move-service.ts` `bulkMoveSupportConversations`: validate the destination
   inbox once before the loop and pass a `destinationValidated` flag (or
   pre-fetched row) into the per-item move to skip the per-item lookup —
   preserve the per-item `same_inbox`/conversation checks.
4. `inbound-routing.ts` `resumeMatchingPendingReviews`: batch the review
   resolution into one `.update({...}).in("id", matchedIds)` before the
   dispatch loop.

**Verify**: all focused suites pass (`workflows`, `support-hub-move-service`, `inbound-routing`); `bun run typecheck` → exit 0.

### Step 8: Misc small cleanups

1. `notification-policy.ts`: drop `attempts` from both input types; update the
   two callers and tests.
2. `packages/api/src/admin/workflows/summaries.ts`: compute per-row
   notifications once and derive counts from that array (delete the second
   `countWorkflowNotifications` pass, or refactor it to accept decisions).
3. `checkout-client.tsx` `SuccessView`: collapse the duplicated paragraph into
   one with a variable lead sentence.
4. `move-service.ts`: in `bulkMoveSupportConversations`, skip the batch-row
   write entirely when `options.isRetry` is true (retryFailedBulkMove owns the
   merged write).

**Verify**: `bunx vitest run tests/unit/packages tests/unit/apps/admin` → all pass; `bun run lint && bun run format:check` → exit 0.

## Test plan

This plan is behavior-preserving; the existing ~90 workflow/move/summaries
tests are the harness. Add only: one test for `parseWorkflowEnvelopeOrThrow`
(valid → envelope, invalid → NonRetriableError message) in a new
`tests/unit/packages/api/workflows/envelope-guard.test.ts`.

## Done criteria

- [ ] All greps in Steps 1–5 return the stated counts
- [ ] `bun run typecheck` exits 0 (all 14 workspaces)
- [ ] `bunx vitest run tests/unit/packages tests/unit/apps/admin` exits 0
- [ ] `bun run lint && bun run format:check && bun run verify:workspace-contract && bun run verify:data-boundary` all exit 0
- [ ] No behavior-visible diffs: route response shapes unchanged except added `requestId` on errors (Step 6)
- [ ] `plans/README.md` status row updated

## STOP conditions

- `withOperation`'s signature does not fit a handler (e.g. it assumes a
  different auth flow than `requireRole`) — report with the exemplar diff
  rather than forcing it.
- Any grep target shows a consumer this plan did not list (e.g. an app-side
  import of a moved symbol) — list it and stop.
- Plans 001–003 are not yet applied (this plan assumes their file states).

## Maintenance notes

- After Step 4, a Stripe API version bump is a one-line change; add a comment
  in `stripe/client.ts` pointing at the webhook-endpoint-version caveat from
  Plan 002 Step 3.
- The envelope-guard helper is where schemaVersion-2 negotiation should land
  later.
- Deliberately NOT done here (see plans/README rejected list): envelope
  context allowlist redesign, summaries outcome-loader registry, Stripe
  dual-path removal, generic `set_updated_at` trigger rename.
