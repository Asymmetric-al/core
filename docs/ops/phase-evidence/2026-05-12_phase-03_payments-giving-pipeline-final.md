# Phase 3 Evidence — Payments and Giving Pipeline Final Verification

Generated: 2026-05-13T05:24:50Z
Phase: 3 — Payments and Giving Pipeline
Branch: epic
Commit: f4d3831c4991ef9eb64b4cbbe37c5c3f828397f4
Status: complete-except-provider-dashboard-proof

## Summary

Phase 3 is no longer blocked on self-hosted Twenty infrastructure. The owner
accepted Twenty Cloud for Phase 3, and the repo client supports the current
Cloud-shaped `/rest` base path.

This follow-up completed the strongest safe local proof available without
mutating production data:

- Stripe CLI signed webhook proof passed against a local donor route and a
  disposable local Supabase stack.
- A Phase 3 webhook state bug was found and fixed: a newly claimed raw event was
  being reloaded as `processing` and then skipped as already handled.
- Raw Stripe event storage, signature rejection, idempotency, staged-gift
  creation, replay, and reconciliation were verified locally.
- Focused Mission Control contributions E2E passed.
- Vercel production readiness passed for the current HEAD/deployed commit.
- Resend receipt/webhook code tests passed.

Phase 3 still cannot be marked fully production-complete until provider
dashboard/runtime proofs are completed for Resend and Twenty and the local
Stripe bug fix is committed, pushed, deployed, and re-verified at the new
deployment commit.

## Prior Evidence Reviewed

- Reviewed `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline.md`.
- Reviewed prior
  `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline-final.md`.
- Reviewed `docs/ops/phase-assessments/2026-05-12_secrets-access-readiness.md`.
- Reviewed `docs/ops/phase-assessments/2026-05-12_secrets-access-readiness.json`.
- Reviewed Phase 3 implementation surfaces under `packages/api/src/stripe`,
  `packages/api/src/giving`, `packages/api/src/admin/contributions`,
  `packages/api/src/crm`, admin contribution routes, Stripe webhook routes,
  Resend webhook routes, and Phase 3 tests.
- Current branch and commit still match the prior Phase 3 evidence commit:
  `f4d3831c4991ef9eb64b4cbbe37c5c3f828397f4`.

## New Human-Provided Context Applied

- Stripe CLI is authenticated for sandbox account `acct_1TVtL9K54xMTIDwc`.
- The previously pasted local `stripe listen` webhook secret was treated as
  exposed and was not reused.
- A fresh local `stripe listen` secret was generated for this proof and was not
  printed or written to evidence.
- Twenty Cloud is accepted for Phase 3. Self-hosted Twenty is not a Phase 3
  blocker.
- `SENTRY_AUTH_TOKEN` is not a Phase 3 blocker unless build/deploy explicitly
  fails because sourcemap upload is required. Sourcemaps are Phase 11
  observability work.
- Resend proof should use a local/staging key, a deployed app route, a
  human/operator dashboard check, or a restricted non-production key supplied
  through env. No Resend secret values were requested in chat.

## Vercel Env Scope Verification

The direct `vercel env ls ... --cwd apps/<app>` commands could not run because
this checkout is not linked to Vercel projects. The repo verifier was able to
inspect production readiness and env presence by name:

```bash
bun run verify:vercel-production -- --commit f4d3831c4991ef9eb64b4cbbe37c5c3f828397f4
```

Result: passed, overall `READY`.

Production readiness verifier results:

| Project    | Status | Missing production env | Invalid production env | Latest target deployment | Health |
| ---------- | ------ | ---------------------- | ---------------------- | ------------------------ | ------ |
| admin      | READY  | none                   | none                   | READY on `epic`          | 200    |
| donor      | READY  | none                   | none                   | READY on `epic`          | 200    |
| missionary | READY  | none                   | none                   | READY on `epic`          | 200    |

Sensitive provider values are present by name but unreadable by the verifier,
as expected for protected Vercel env values. No values were printed.

Important deployment caveat: the readiness verifier targeted current HEAD,
`f4d3831c4991ef9eb64b4cbbe37c5c3f828397f4`. The Stripe state fix made during
this verification is still uncommitted, so it is not included in those deployed
production URLs yet.

No `NEXT_PUBLIC_TWENTY_*` variables were added or found.

## Self-Hosted Twenty Proof

Self-hosted Twenty is not a Phase 3 blocker after the owner correction. Phase 3
now treats Twenty as Cloud.

Twenty Cloud evidence:

- Existing investigated env classified `TWENTY_API_URL` as
  `https://api.twenty.com/rest` by origin/path shape. The value was not printed
  in command output or evidence before this owner-approved literal appeared in
  the prompt.
- Twenty UI/workspace evidence points to `risencode.twenty.com`.
- No Supabase Edge Function, Vercel project, or repo deployment config was found
  for a self-hosted Twenty API service.
- `packages/api/src/crm/client/config.ts` requires `TWENTY_API_URL` and
  `TWENTY_API_KEY` for a configured client.
- `TWENTY_WORKSPACE_ID` is optional metadata in current code and is not required
  for Phase 3 gateway/client configuration.
- `packages/api/src/crm/client/core.ts` resolves relative paths against the
  configured API base URL. A `/rest` base path is compatible with the metadata
  path shape used by the current client.

Twenty proof status:

| Check                           | Result                                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| Twenty mode                     | Cloud accepted for Phase 3.                                                                     |
| `TWENTY_WORKSPACE_ID` required? | No. Optional in current code.                                                                   |
| Gateway/read proof              | Not completed. Local `TWENTY_API_KEY` is unavailable; production route requires app auth.       |
| Staging route signal            | `staging-admin` gateway fetch returned Payload initialization 500 before CRM proof could run.   |
| Production route signal         | Production gateway route exists but returned 401 without app auth.                              |
| Gift-posting proof              | Pending provider/runtime proof.                                                                 |
| Remaining blocker               | Authenticated harmless read through a safe runtime with `TWENTY_API_KEY`, then gift-post proof. |

The Twenty webhook secret shown in an earlier screenshot should still be treated
as exposed unless it has already been rotated.

## Stripe Proof

Stripe CLI proof was completed locally against the donor webhook route:

- Stripe CLI account: `acct_1TVtL9K54xMTIDwc`.
- Webhook route tested: `http://localhost:3000/api/webhooks/stripe`.
- Runtime target: local donor dev server with a disposable local Supabase stack.
- Fresh local webhook secret printed? no.
- Production data mutated? no.

Events triggered through Stripe CLI:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`
- `charge.refunded`
- `payment_intent.processing`

Observed route behavior:

- Signed CLI events returned HTTP 200.
- Invalid signature probe returned HTTP 400.
- Raw events were stored in `public.stripe_raw_events`.
- Required event types reached terminal raw-event states:
  - handled events: `processed`
  - ignored sidecar events emitted by Stripe CLI fixtures: `ignored`
- Duplicate signed event proof:
  - first delivery: `payment_intent_not_matched`
  - second delivery with same event id: `stripe_event_already_recorded`
  - database proof: one raw event row, `processed`, `process_attempts = 1`
- Staged gift proof:
  - seeded local pending donation `pi_demo_000004` was completed by a signed
    event.
  - `staged_gifts` row was created with `status = received`,
    `receipt_status = pending`, `crm_post_status = not_required`.
- Replay proof:
  - package-level replay path loaded the raw event, marked it replayable,
    claimed it, processed it, and completed it.
  - replay outcome was `terminal_status_preserved`, as expected after the
    donation had already completed.
- Reconciliation proof:
  - package-level reconciliation ran and created a run record.
  - result was `failed` only because one local staged gift still required a
    receipt; this is an expected finding, not a runtime failure.

Bug found and fixed during proof:

- File: `packages/api/src/stripe/webhooks.ts`
- Problem: after `claimStripeRawEvent`, the handler reloaded the raw event with
  `processing_status = processing`, then skipped it because `processing` was
  treated as already handled.
- Fix: only return `stripe_event_already_recorded` when the claim was not
  acquired. A successfully claimed event now proceeds to business processing and
  completion.
- Regression coverage: `tests/unit/packages/api/stripe-webhooks.test.ts` now
  mocks the claimed row as `processing`, so the test catches this bug.

Remaining Stripe blocker:

- Commit, push, deploy, and rerun Vercel/provider proof for the fixed working
  tree. Current production readiness is for HEAD before this uncommitted fix.

## Resend Proof

Resend code-level proof passed, but provider/dashboard proof remains pending.

Evidence:

- `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET`, and `RESEND_ENCRYPTION_KEY` are
  present by name in Vercel production readiness output where required.
- Local `.env.local` does not contain these Resend values.
- No local Resend CLI/API proof could be run without a key.
- Safari/Resend dashboard inspection was attempted through Computer Use but
  timed out; AppleScript fallback was blocked by macOS automation permissions.
- No production donor email was sent.

Commands passed:

```bash
SKIP_ENV_VALIDATION=1 bunx vitest run \
  tests/unit/packages/api/giving-receipts.test.ts \
  tests/unit/packages/api/email/webhooks-resend.test.ts \
  tests/unit/packages/api/email/test-send.test.ts
```

Result: 3 files passed, 25 tests passed.

Resend proof status:

| Check                   | Result                                                                                  |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Env scope               | Present by name in Vercel production readiness; values unreadable as expected.          |
| Domain verified         | Not verified in dashboard/API this run.                                                 |
| Webhook endpoint        | Route exists at `apps/admin/app/api/email/webhooks/resend/route.ts`; provider pending.  |
| Webhook events          | Not verified in dashboard/API this run.                                                 |
| Test-send proof         | Not completed; no local/staging key and no approved safe recipient/runtime route proof. |
| Send log proof          | Unit/code path proof passed; provider-backed send log proof pending.                    |
| Webhook ingestion proof | Unit/code path proof passed; provider-backed signed event proof pending.                |

Remaining Resend blocker:

- A human/operator must verify the Resend domain and webhook configuration in
  the dashboard, or provide a restricted non-production Resend key through
  local/Vercel/GitHub env. Then run a safe test-send and signed webhook
  ingestion proof without sending production donor email.

## Supabase Migration Verification

The prior follow-up completed:

```bash
DATABASE_URL=<local-disposable-postgres> bun run verify:supabase-migrations
```

Result from prior evidence: passed, `Verified 22 forward Supabase migrations.`

This run did not rerun the verifier because no migration file changed. It did
start a disposable local Supabase stack for Stripe proof. The standard
`supabase start` hit the known local migration issue:

```txt
LOCK TABLE can only be used in transaction blocks
```

The repo-documented local workaround was used:

- started Supabase with only the init migration,
- restored migrations and seed,
- applied `20260214090000_foundation_1_schema.sql` with
  `--single-transaction`,
- applied remaining `2026*` migrations in order,
- applied `supabase/seed.sql`,
- verified Phase 3 tables existed locally.

No hosted production Supabase project was used. The production `epic` project
was not touched.

## E2E Runtime Verification

Focused Phase 3 E2E passed:

```bash
bunx playwright test tests/e2e/mc-contributions-live-query.spec.ts --project=chromium-admin
```

Result: 2 passed.

Covered:

- `/contributions` loads the Mission Control contributions live-query shell.
- The app shell exposes the canonical `/contributions` navigation href and
  reaches the contributions page.

The earlier broad admin E2E failures in CRM/support were not used as Phase 3
blockers for this run because the focused Phase 3 route proof passed and the
owner explicitly asked not to let unrelated CRM/support smoke expectations block
Phase 3 provider proof.

## CI and Build Verification

Commands run after the Stripe fix:

| Command                             | Result                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `bun run format:check`              | passed after formatting Phase 3 docs/evidence files                     |
| `bun run lint`                      | passed                                                                  |
| `bun run typecheck`                 | passed                                                                  |
| `bun run build`                     | passed                                                                  |
| `bun run test:unit`                 | passed: 190 files, 847 tests                                            |
| `bun run verify:data-boundary`      | passed                                                                  |
| `bun run verify:workspace-contract` | passed                                                                  |
| `bun run verify:eslint`             | passed                                                                  |
| `bun run verify:shadcn-diff`        | passed                                                                  |
| `bun run skills:verify`             | failed due pre-existing Stripe skill mirror drift, unrelated to Phase 3 |
| `bun run verify:vercel-production`  | passed for current HEAD/deployed commit                                 |
| focused Resend/receipt unit tests   | passed                                                                  |
| focused Stripe webhook/store tests  | passed                                                                  |
| focused contributions E2E           | passed                                                                  |

`skills:verify` failure details:

- Drift is in `.agents/skills/stripe-best-practices/SKILL.md`,
  `.cursor/skills/stripe-best-practices/SKILL.md`, and `skills-lock.json`.
- The drift adds a Stripe restricted-key recommendation and was present in the
  workspace before this Phase 3 fix path.
- It should be reconciled/committed or intentionally reverted by the owner of
  the skill refresh work. It is not caused by the Phase 3 payments code change.

## Deployment Verification

Vercel production readiness passed for current HEAD:

```bash
bun run verify:vercel-production -- --commit f4d3831c4991ef9eb64b4cbbe37c5c3f828397f4
```

Result: overall `READY`.

Production health checks:

- `https://admin.asymmetric.al/api/health` — HTTP 200
- `https://donor.asymmetric.al/api/health` — HTTP 200
- `https://missionary.asymmetric.al/api/health` — HTTP 200

Deployment caveat:

- No deployment was performed in this follow-up.
- The Stripe bug fix is local/uncommitted, so deployment proof must be rerun
  after commit/push/deploy.
- `SENTRY_AUTH_TOKEN` did not block build or Vercel readiness and remains Phase
  11 sourcemap/observability work.

## Secret Exposure / Rotation Notes

- No secret values were written to this evidence file.
- No `.env.local` file was committed.
- The fresh local Stripe `stripe listen` signing secret was captured only in a
  temp runtime flow and was not printed in evidence.
- The earlier pasted `stripe listen` secret remains exposed and should not be
  reused anywhere.
- The earlier Twenty webhook secret screenshot should be treated as exposed
  unless it has already been rotated.
- No `NEXT_PUBLIC_TWENTY_*` variables were added.
- Twenty remains server-side behind `packages/api`.

Required manual rotations/checks:

1. Do not place any local `stripe listen` secret in Vercel.
2. Rotate `TWENTY_WEBHOOK_SECRET` if the screenshot-exposed value is still
   active.
3. Verify Resend webhook signing secret only through dashboard/env, without
   printing it.

## Remaining Admin Manual Tasks

- Resend dashboard/API proof:
  - verify sending domain,
  - verify webhook endpoint,
  - verify webhook event subscriptions,
  - run safe non-production test-send,
  - verify send log and signed webhook ingestion.
- Twenty Cloud proof:
  - provide a safe runtime with `TWENTY_API_KEY`,
  - run a harmless authenticated read through the repo gateway/package client,
  - perform non-mutating or explicitly approved gift-posting proof.
- Rotate the exposed Twenty webhook secret if not already rotated.
- Reconcile the pre-existing Stripe skill mirror drift so `bun run
skills:verify` can pass.
- Commit/push/deploy the Stripe webhook state fix and rerun Vercel readiness
  against the new commit.

## Remaining Code Tasks

- None known in Phase 3 payments code after the Stripe raw-event completion fix.
- The skill mirror drift is a repo hygiene task, not a Phase 3 payments-code
  task.
- If Twenty gift-posting proof reveals an API path mismatch, adapt
  `packages/api/src/crm/client` while keeping raw Twenty access server-side only.

## Final Phase 3 Verdict

Phase 3 verification status: complete-except-provider-dashboard-proof.

What is complete:

- Stripe signed webhook local proof passed.
- Raw event storage, idempotency, staged gift creation, replay, and
  reconciliation were proved against a disposable local Supabase runtime.
- The discovered Stripe event completion bug was fixed and covered by focused
  unit tests.
- Focused Phase 3 E2E passed.
- Build, lint, typecheck, unit tests, data-boundary, workspace-contract, ESLint,
  shadcn drift, and Vercel production readiness passed.
- Vercel production env names, deployments, and health checks are ready for the
  current deployed commit.

What remains before claiming production-complete:

- Resend dashboard/test-send/webhook proof.
- Twenty Cloud authenticated read/gift-posting proof.
- Reconcile `skills:verify` mirror drift.
- Commit, deploy, and re-verify the local Stripe webhook fix.

Ready for Phase 4 or Phase 5: no, not until the remaining provider-dashboard
proof and deployment proof are closed.
