# Phase 3 Evidence - Payments and Giving Pipeline Final Verification

Generated: 2026-05-14 00:00:30 +07
Phase: 3 - Payments and Giving Pipeline
Branch: epic
Commit under final closure proof: 2fff1bff82de4986885bef9e3668e4635dc49162
Status: complete-except-admin-provider-proof

## Summary

Phase 3 implementation, Stripe proof, migration verification, deployment
readiness, Resend provider setup, and Resend runtime proof are complete. This
provider-proof pass used a temporary Supabase Auth super-admin proof user, the
authenticated Resend CLI/keychain profile, and a safe app-route send to verify
the deployed Resend send-log and signed-webhook ingestion path without printing
or committing secrets.

The phase remains `complete-except-admin-provider-proof`, not `complete`,
because Twenty Cloud still needs a non-empty server-side `TWENTY_API_KEY` in a
safe runtime or a restricted key supplied to Codex for harmless metadata read
and approved non-production gift-posting/link proof.

During this pass, production Resend webhooks initially exposed a code-path
regression: PostgREST rejected `email_events.upsert(... onConflict:
tenant_id,resend_event_id)` because the deployed schema uses a partial unique
index. The webhook persistence path was fixed to insert events and treat
duplicate-key violations as idempotent replays. The fix was committed in
`2fff1bff82de4986885bef9e3668e4635dc49162`, pushed to `epic`, deployed to
Vercel Production, and then re-proven against the production Resend webhook.

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

Current repo state for the final closure attempt:

```txt
branch: epic
HEAD: 2fff1bff82de4986885bef9e3668e4635dc49162
latest commits:
2fff1bff82 fix resend webhook event persistence
7e6c22525a docs: record resend cli provider proof
7793e4d8c0 docs: record resend runtime proof status
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

- Production `admin` env pull lists no `TWENTY_*` variables.
- Custom `staging` env pull lists `TWENTY_API_URL` and
  `TWENTY_WEBHOOK_SECRET`, but `TWENTY_API_KEY` is present with an empty value.
- Local `.env.local` does not include `TWENTY_API_URL`, `TWENTY_API_KEY`,
  `TWENTY_WEBHOOK_SECRET`, or `TWENTY_WORKSPACE_ID`.
- A temporary production super-admin proof user authenticated successfully, but
  the deployed production gateway route returned `404` with
  `CRM gateway smoke route is disabled in protected deployments.` This matches
  `packages/api/src/crm/gateway.ts`, where the smoke route is disabled when
  `NODE_ENV === "production"` or the deployment is protected.
- Because no non-empty `TWENTY_API_KEY` is available in local, production, or
  staging runtime scope, the package/client fallback could not perform a
  harmless authenticated metadata read.
- `TWENTY_API_URL`, `TWENTY_API_KEY`, `TWENTY_WEBHOOK_SECRET`, and
  `TWENTY_WORKSPACE_ID` were not printed.
- The current repo client expects `TWENTY_API_URL` to include the path prefix it
  should call. With `https://api.twenty.com/rest`, metadata probing calls
  `/metadata/objects`, resulting in the Twenty Cloud URL
  `https://api.twenty.com/rest/metadata/objects`.

Proof status:

```txt
TWENTY_API_URL present: not proven in production admin runtime
TWENTY_API_KEY present: staging key is present but empty; production key missing
TWENTY_WEBHOOK_SECRET present: staging present; production not present in env pull
Harmless metadata read: blocked by missing non-empty TWENTY_API_KEY; authenticated deployed gateway returned 404 because smoke route is disabled in protected production
Gift-posting fixture: not run; no production CRM data was mutated
Link-record proof: not run; no production CRM data was mutated
Webhook secret rotation: owner declined rotation for now; recorded residual risk
Remaining Twenty blocker: set/provide a non-empty server-side TWENTY_API_KEY in a safe staging/proof runtime, or provide a restricted key to Codex; then run metadata read and approved non-production gift-posting/link proof
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
- Ran `resend doctor --json`; CLI v2.2.1 passed, credentials came from macOS
  Keychain profile `default`, and the domain check reported 1 verified domain.
- Ran `resend domains list --json`; `send.asymmetric.al` is `verified`, region
  `us-east-1`, with sending enabled and receiving disabled.
- Ran `resend webhooks list --json`; webhook
  `e0aa0690-a2a3-48f6-80a2-36904a47880b` is `enabled` at
  `https://admin.asymmetric.al/api/email/webhooks/resend` with all 11 expected
  Email events selected.

Provider/runtime status at final evidence time:

```txt
Resend API key printed? no
Domain: send.asymmetric.al
Domain id: f72e0ee2-7ff0-40ff-a466-1872a6148598
Domain status: verified by Resend API
DNS records added? yes
AWS Lightsail zone: asymmetric.al
Webhook endpoint: https://admin.asymmetric.al/api/email/webhooks/resend
Webhook status: enabled by Resend API
Webhook events: email.bounced, email.clicked, email.complained, email.delivered, email.delivery_delayed, email.failed, email.opened, email.received, email.scheduled, email.sent, email.suppressed
Test recipient: will@risencode.org
Direct provider test-send: accepted by Resend and delivered
Direct provider message id: da1a9400-0193-4b26-8773-a5728b381ba2
Direct provider created_at: 2026-05-13 15:59:29.35649+00
CLI provider test-send: accepted by Resend and delivered
CLI provider message id: 1d80b616-9633-4c78-b4d1-69bff02a7630
CLI provider from: Asymmetric.al <no-reply@send.asymmetric.al>
CLI provider created_at: 2026-05-13 16:18:50.647845+00
Initial app webhook result: Resend delivered signed webhook attempts to the admin endpoint, but direct/CLI provider sends bypassed app logging and returned HTTP 422 after tenant/message resolution
Code fix: 2fff1bff82de4986885bef9e3668e4635dc49162 changed email_events persistence from PostgREST partial-index upsert to insert with duplicate-event replay tolerance
Fixed deployment: Vercel Production admin/donor/missionary READY for commit 2fff1bff82de4986885bef9e3668e4635dc49162
Test-send route exists: yes
Test-send route requires app auth: yes, admin/super_admin
Test-send writes email_send_logs: yes, after Resend send attempt
Webhook route verifies signed raw payload: yes, Svix headers over raw body
Webhook route updates delivery/event state: yes, after tenant/message resolution
Temporary proof user: phase3-proof-admin+20260513165953@risencode.org
Temporary proof user role: super_admin
Temporary proof user cleanup: profile deleted, auth user deleted, session token not printed or persisted
App-authenticated test-send: yes, deployed /api/email/test-send returned HTTP 200
App test-send message id: cdf483d0-69b4-4ce7-a6c6-e0acaf1763ec
App test-send correlation id: 466b96c0-a018-47fd-8a01-67261c914e56
email_send_logs proof: yes, row 0080f9a2-26fe-4567-b73a-4cddb9ef27a6 with status sent, recipient_count 1, message_type transactional
Signed webhook proof: yes, signed Resend webhooks reached /api/email/webhooks/resend and persisted events
email_events proof: yes, rows e2605eeb-6ed1-4cc1-8bfe-6123d21cf852 and f0087842-f4d1-4d8f-8c06-3f5c03d6fc25
Delivery-status ingestion proof: yes, event types email.sent and email.delivered persisted for recipient will@risencode.org; email_send_logs status remained sent with delivered timestamp
Remaining Resend blocker: none
```

DNS propagation details:

- `dig TXT resend._domainkey.send.asymmetric.al` returned the DKIM record.
- `dig MX send.send.asymmetric.al` returned the Resend/Amazon SES feedback MX.
- `dig TXT send.send.asymmetric.al` returned the Resend SPF record.
- The Resend dashboard lists `send.asymmetric.al` as `Verified`.
- Resend now has no remaining Phase 3 blocker.

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

The full local gate was rerun for the Resend webhook persistence fix and final
provider-proof evidence update. The pre-push `ci:preflight` also passed before
commit `2fff1bff82de4986885bef9e3668e4635dc49162` was pushed.

Commands passed:

| Command                                                                                 | Result |
| --------------------------------------------------------------------------------------- | ------ |
| `bun run format:check`                                                                  | passed |
| `bun run lint`                                                                          | passed |
| `bun run typecheck`                                                                     | passed |
| `bun run build`                                                                         | passed |
| `bun run test:unit`                                                                     | passed |
| `bun run verify:data-boundary`                                                          | passed |
| `bun run verify:workspace-contract`                                                     | passed |
| `bun run verify:eslint`                                                                 | passed |
| `bun run verify:shadcn-diff`                                                            | passed |
| `bun run skills:verify`                                                                 | passed |
| `bun run verify:vercel-production -- --commit 2fff1bff82de4986885bef9e3668e4635dc49162` | passed |

## Deployment Verification

Vercel production readiness passed for commit
`2fff1bff82de4986885bef9e3668e4635dc49162` after the commit was pushed to
`epic` and Vercel completed all three production deployments:

| App        | Production deployment                           | Status | Health check |
| ---------- | ----------------------------------------------- | ------ | ------------ |
| admin      | `admin-arj8sm72b-asymmetric-al.vercel.app`      | READY  | HTTP 200     |
| donor      | `donor-9dq6cmhoq-asymmetric-al.vercel.app`      | READY  | HTTP 200     |
| missionary | `missionary-l8561gbi0-asymmetric-al.vercel.app` | READY  | HTTP 200     |

The admin production runtime was redeployed after the Resend webhook persistence
fix. The app-authenticated safe test-send, send-log proof, and signed webhook
ingestion proof then passed against the deployed production route.

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

Resend: none.

Twenty Cloud:

- Provide an app-authenticated admin operator session or restricted
  non-production Twenty API key/runtime.
- Run harmless metadata read through the server-side gateway.
- Run approved non-production gift-posting fixture through the server-side
  gateway and confirm link-record creation.

## Remaining Code Tasks

None known for Phase 3 local implementation.

If Twenty runtime proof reveals an API-path, mapping, or persistence bug, fix it
inside the package layer (`packages/api`) and keep app routes as thin adapters.

## Final Phase 3 Verdict

Phase 3 verification status: complete-except-admin-provider-proof.

Complete:

- Stripe webhook state fix committed and deployed.
- Stripe local signed webhook proof completed.
- Full local gate passed after the Resend webhook persistence fix.
- Migration verifier passed against disposable local database.
- Resend domain was created and DNS records were added in AWS Lightsail.
- Resend webhook endpoint was created with all Email events selected.
- Resend domain verification passed for `send.asymmetric.al`.
- Resend API verification confirmed the webhook endpoint is enabled at
  `https://admin.asymmetric.al/api/email/webhooks/resend` with all 11 Email
  events selected.
- Resend CLI verification confirmed the same domain and webhook status from
  macOS Keychain profile `default`.
- Resend accepted and delivered one safe direct provider test email to
  `will@risencode.org`.
- Resend CLI accepted and delivered one additional safe provider proof email to
  `will@risencode.org`.
- Resend webhook secret was updated in Vercel production without printing it.
- Resend webhook persistence was fixed in
  `2fff1bff82de4986885bef9e3668e4635dc49162` and deployed.
- Temporary super-admin proof user
  `phase3-proof-admin+20260513165953@risencode.org` authenticated through the
  app route, then was deleted.
- Resend app test-send to `will@risencode.org` returned HTTP 200 and created
  `email_send_logs` row `0080f9a2-26fe-4567-b73a-4cddb9ef27a6`.
- Signed Resend webhooks persisted `email.sent` and `email.delivered` rows
  `e2605eeb-6ed1-4cc1-8bfe-6123d21cf852` and
  `f0087842-f4d1-4d8f-8c06-3f5c03d6fc25`.
- Full local gate and Vercel production readiness passed for the current HEAD.
- No production donor, payment, or CRM data was mutated.
- No secret values were printed or committed.

Not complete:

- Twenty Cloud authenticated read and gift-posting provider proof are not
  complete because a non-empty `TWENTY_API_KEY` is unavailable in production or
  staging runtime scope.

Phase 3 should not be marked `complete` until the remaining Twenty Cloud
admin/runtime proof item above is completed.
