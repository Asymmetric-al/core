# Phase 3 Evidence - Payments and Giving Pipeline Final Verification

Generated: 2026-05-13 22:12:11 +07
Phase: 3 - Payments and Giving Pipeline
Branch: epic
Commit: 4ba4a3321d3ec688797d511cedf3360db3aa7a99
Status: complete-except-admin-provider-proof

## Summary

Phase 3 implementation, Stripe proof, migration verification, deployment
readiness, and prior local gates are complete. This provider-proof pass used
the newly available AWS Lightsail DNS access and the authenticated Resend
dashboard session to advance Resend setup without printing or committing
secrets.

The phase remains `complete-except-admin-provider-proof`, not `complete`,
because Resend still needs live test-send/send-log/signed-webhook ingestion
proof, and Twenty Cloud still needs an authenticated runtime proof path or
restricted server-side API key.

Stripe remains complete and was not reopened. `SENTRY_AUTH_TOKEN` remains out
of Phase 3 scope unless a build/deploy explicitly fails on sourcemap upload.
No Phase 4 or Phase 5 work was started.

## Prior Evidence Reviewed

- `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline.md`
- `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline-final.md`
- `docs/ops/phase-assessments/2026-05-12_phase-03-payments-giving-pipeline-completion.md`
- `docs/ops/phase-assessments/2026-05-12_secrets-access-readiness.md`
- `docs/ops/phase-assessments/2026-05-12_secrets-access-readiness.json`

The official status entering this pass was
`complete-except-admin-provider-proof`.

## New Human-Provided Context Applied

- Resend proof may use the approved safe recipient `will@risencode.org`.
- AWS Lightsail DNS access is available through profile `codex-lightsail` in
  account `184825735819`, region `us-east-1`.
- The Resend API key was pasted into chat and must not be written to files,
  logs, or evidence. Codex did not print it and did not persist it locally.
- Twenty Cloud is accepted for Phase 3; self-hosted Twenty is not a blocker.
- The human owner declined rotating the previously exposed Twenty webhook
  secret for now. This is recorded as accepted residual risk for Phase 3.

## Vercel Env Scope Verification

Current repo state for the provider-proof evidence commit:

```txt
branch: epic
HEAD: 4ba4a3321d3ec688797d511cedf3360db3aa7a99
latest commits:
4ba4a3321d docs: update phase 3 provider deployment status
c19c0be4ec docs: record phase 3 provider proof update
f1b3ae9781 docs: add phase 3 completion assessment
```

Vercel production env names for `admin` include:

- `RESEND_API_KEY`
- `RESEND_WEBHOOK_SECRET`
- `RESEND_ENCRYPTION_KEY`

The new Resend webhook signing secret was copied from the Resend dashboard into
Vercel `admin` production `RESEND_WEBHOOK_SECRET` via
`vercel env add RESEND_WEBHOOK_SECRET production --sensitive --force --yes`.
The value was never printed, and the local clipboard was cleared immediately
after the update. The pushed evidence commit then triggered an admin production
redeploy so the new value is available to the deployed route.

Vercel CLI cannot read sensitive production values back into the shell. It
therefore cannot be used from Codex to prove sensitive Resend/Twenty values by
printing or local reuse.

## Self-Hosted Twenty Proof

Not applicable for Phase 3 after the owner correction. Twenty Cloud is accepted
for this phase and raw Twenty access remains server-side behind `packages/api`.

No `NEXT_PUBLIC_TWENTY_*` variables were added.

## Twenty Cloud Proof

Twenty mode: Cloud.

Code evidence:

- `packages/api/src/crm/client/config.ts` requires `TWENTY_API_URL` and
  `TWENTY_API_KEY`; `TWENTY_WORKSPACE_ID` is optional.
- `packages/api/src/crm/gateway.ts` uses the server-side package client and
  probes Twenty through metadata `listObjects()`.
- `apps/admin/app/api/admin/crm/gateway/status/route.ts` is a thin adapter over
  the package route.
- The deployed gateway route exists but correctly requires an authenticated
  staff/admin/super_admin session.

Runtime scope evidence:

- Production `admin` env pull/list does not expose usable Twenty runtime values
  to Codex.
- Prior custom `staging` env checks showed Twenty names by scope, but the
  sensitive API key is unreadable from CLI and cannot be used for a local
  authenticated read.
- No app-authenticated admin operator session was available to Codex for
  `/api/admin/crm/gateway/status?probe=1`.

Proof status:

```txt
TWENTY_API_URL present: not proven in production admin runtime
TWENTY_API_KEY present: not retrievable to Codex
TWENTY_WEBHOOK_SECRET present: not proven in production admin runtime
Harmless metadata read: blocked by missing app-auth/runtime key
Gift-posting fixture: not run; no production CRM data was mutated
Link-record proof: not run; no production CRM data was mutated
Webhook secret rotation: owner declined rotation for now; recorded residual risk
Remaining Twenty blocker: admin app session or restricted server-side Twenty key/runtime proof
```

## Stripe Proof

Stripe proof is complete and was not reopened in this pass.

Previously completed:

- Stripe CLI account: `acct_1TVtL9K54xMTIDwc`.
- Local signed webhook acceptance passed.
- Invalid signature rejection passed.
- Raw Stripe event storage passed.
- Duplicate/idempotency proof passed.
- Successful fixture metadata staged a gift.
- Replay/reconciliation code paths passed focused tests.
- The stale completed-state bug was fixed in
  `packages/api/src/stripe/webhooks.ts` and committed in
  `65b7a8252ca09a78d4642bb12b5d06afb7fa98ba`.

Remaining Stripe blocker: none for Phase 3.

## Resend Proof

Code and route evidence:

- `apps/admin/app/api/email/webhooks/resend/route.ts` exports the package
  webhook route.
- `apps/admin/app/api/email/test-send/route.ts` exports the package test-send
  route.
- `packages/api/src/email/webhooks/resend.ts` verifies Svix signatures using
  the raw body and updates email delivery status when tenant/message resolution
  succeeds.
- `packages/api/src/email/test-send.ts` sends through Resend and writes
  `email_send_logs` for successful or failed admin test sends.
- Unit coverage for receipts, Resend webhook handling, and test-send behavior
  passed in prior final evidence.

Provider/dashboard work completed in this pass:

- Confirmed AWS caller identity for profile `codex-lightsail` in account
  `184825735819`.
- Confirmed Lightsail DNS zone `asymmetric.al`.
- Created Resend sending domain `send.asymmetric.al` in the Resend dashboard
  with region `North Virginia (us-east-1)`.
- Added Resend-required DNS records in Lightsail for:
  - `resend._domainkey.send.asymmetric.al` `TXT`
  - `send.send.asymmetric.al` `MX`
  - `send.send.asymmetric.al` `TXT`
- Verified Lightsail lists the new DKIM, MX, and SPF records by name/type.
- Verified public DNS resolves the DKIM `TXT` and sending `MX` records.
- Created a Resend webhook for
  `https://admin.asymmetric.al/api/email/webhooks/resend`.
- Selected all 11 Resend Email events in the webhook UI. Visible subscribed
  examples included `email.bounced`, `email.clicked`,
  `email.delivery_delayed`, `email.failed`, `email.opened`,
  `email.received`, `email.scheduled`, `email.sent`, and
  `email.suppressed`.
- Copied the new webhook signing secret directly from Resend into Vercel
  `admin` production `RESEND_WEBHOOK_SECRET` without printing it, then cleared
  the clipboard.

Provider status at evidence time:

```txt
Resend API key printed? no
Domain: send.asymmetric.al
Domain id: f72e0ee2-7ff0-40ff-a466-1872a6148598
Domain status: Verified
DNS records added? yes
AWS Lightsail zone: asymmetric.al
Webhook endpoint: https://admin.asymmetric.al/api/email/webhooks/resend
Webhook events: all Email events selected in Resend UI
Test recipient: will@risencode.org
Test-send result: not run
email_send_logs proof: not completed
Signed webhook proof: not completed
Remaining Resend blocker: app-auth or usable runtime proof path for test-send/log/signed webhook ingestion
```

DNS propagation details:

- `dig TXT resend._domainkey.send.asymmetric.al` returned the DKIM record.
- `dig MX send.send.asymmetric.al` returned the Resend/Amazon SES feedback MX.
- `dig TXT send.send.asymmetric.al` returned the Resend SPF record.
- The Resend dashboard lists `send.asymmetric.al` as `Verified`.

What remains to close Resend:

1. Run a safe app test-send to `will@risencode.org` through an authenticated
   admin/staff operator session, or provide a safe runtime path that can call
   the app route without exposing the API key.
2. Confirm the `email_send_logs` row for that test send.
3. Trigger/replay a signed Resend webhook and confirm `email_events` plus
   delivery-status ingestion.

## Supabase Migration Verification

Migration verification passed previously against a disposable local Postgres
container.

Command:

```bash
DATABASE_URL=<safe disposable local database> bun run verify:supabase-migrations
```

Result:

- Verified 22 forward Supabase migrations.
- Target was local/disposable, not production.
- The disposable container was stopped after verification.

## E2E Runtime Verification

Focused Phase 3 runtime proof is covered by route/unit/API tests and the build
route inventory. Provider-backed Resend and Twenty E2E remains gated by the
admin/provider proof blockers above.

Broad admin smoke failures from earlier CRM/support expectations are not used
as a Phase 3 blocker here.

## CI and Build Verification

The full local gate was rerun after this provider-proof evidence update. No
code changed in this pass; this was a confidence rerun for the updated evidence
and provider setup state.

Commands passed:

| Command                                                              | Result |
| -------------------------------------------------------------------- | ------ |
| `bun run format:check`                                               | passed |
| `bun run lint`                                                       | passed |
| `bun run typecheck`                                                  | passed |
| `bun run build`                                                      | passed |
| `bun run test:unit`                                                  | passed |
| `bun run verify:data-boundary`                                       | passed |
| `bun run verify:workspace-contract`                                  | passed |
| `bun run verify:eslint`                                              | passed |
| `bun run verify:shadcn-diff`                                         | passed |
| `bun run skills:verify`                                              | passed |
| `bun run verify:vercel-production -- --commit $(git rev-parse HEAD)` | passed |

## Deployment Verification

Vercel production readiness passed for commit
`4ba4a3321d3ec688797d511cedf3360db3aa7a99`:

| App        | Production deployment                           | Status | Health check |
| ---------- | ----------------------------------------------- | ------ | ------------ |
| admin      | `admin-aqw3qf44m-asymmetric-al.vercel.app`      | READY  | HTTP 200     |
| donor      | `donor-f16odzqgl-asymmetric-al.vercel.app`      | READY  | HTTP 200     |
| missionary | `missionary-r6pp9zh2k-asymmetric-al.vercel.app` | READY  | HTTP 200     |

The admin production runtime was redeployed after the Resend webhook secret
update, so the remaining Resend blocker is not deployment. It is the
app-authenticated safe test-send/send-log/signed-webhook ingestion proof.

This pass did not mutate Stripe, donor, payment, or CRM production data.

## Secret Exposure / Rotation Notes

- No secret values were printed or committed.
- The Resend API key pasted into chat remains exposed by that channel. Codex did
  not write it to repo files, markdown, logs, or temp env files. If the key will
  be retained beyond this proof attempt, rotate it after provider proof.
- The new Resend webhook signing secret was moved from Resend to Vercel through
  dashboard copy plus `vercel env add` stdin. It was not printed, and the local
  clipboard was cleared.
- The earlier local Stripe `stripe listen` secret remains local/session-only and
  was not placed in Vercel.
- The Twenty webhook secret exposure is known. The human owner explicitly
  declined rotation for now.
- Twenty webhook rotation blocking Phase 3: no, by owner decision.

## Remaining Admin Manual Tasks

Resend:

- Run an authenticated app test-send to `will@risencode.org`.
- Confirm `email_send_logs` persistence and signed webhook delivery-status
  ingestion.

Twenty Cloud:

- Provide an app-authenticated admin operator session or restricted
  non-production Twenty API key/runtime.
- Run harmless metadata read through the server-side gateway.
- Run approved non-production gift-posting fixture through the server-side
  gateway and confirm link-record creation.

## Remaining Code Tasks

None known for Phase 3 local implementation.

If Twenty or Resend runtime proof reveals an API-path, mapping, or persistence
bug, fix it inside the package layer (`packages/api` / `packages/email`) and
keep app routes as thin adapters.

## Final Phase 3 Verdict

Phase 3 verification status: complete-except-admin-provider-proof.

Complete:

- Stripe webhook state fix committed and deployed.
- Stripe local signed webhook proof completed.
- Full local gate passed in prior final evidence.
- Migration verifier passed against disposable local database.
- Resend domain was created and DNS records were added in AWS Lightsail.
- Resend webhook endpoint was created with all Email events selected.
- Resend domain verification passed for `send.asymmetric.al`.
- Resend webhook secret was updated in Vercel production without printing it.
- Full local gate and Vercel production readiness passed for the current HEAD.
- No production donor, payment, or CRM data was mutated.
- No secret values were printed or committed.

Not complete:

- Resend safe test-send, `email_send_logs`, and signed webhook ingestion proof
  are not complete.
- Twenty Cloud authenticated read and gift-posting provider proof are not
  complete.

Phase 3 should not be marked `complete` until the remaining admin/provider proof
items above are completed.
