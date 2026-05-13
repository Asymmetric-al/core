# Phase 3 Payments and Giving Pipeline Completion Assessment

Generated: 2026-05-14 00:00:30 +07
Repo: Asymmetric-al/core
Branch: epic
Audited HEAD: 2fff1bff82de4986885bef9e3668e4635dc49162
Phase implementation commit: 65b7a8252ca09a78d4642bb12b5d06afb7fa98ba
Status: handoff-complete; phase remains complete-except-admin-provider-proof

## Objective Restatement

This assessment records the latest Phase 3 provider-proof pass. The task was to
close the remaining Resend and Twenty Cloud proof gates where Codex could do so
safely, without reopening Stripe, exposing secrets, mutating production
donor/payment/CRM data, or starting Phase 4/5.

## Current Repo State

```txt
branch: epic
HEAD: 2fff1bff82de4986885bef9e3668e4635dc49162
latest commits:
2fff1bff82 fix resend webhook event persistence
7e6c22525a docs: record resend cli provider proof
7793e4d8c0 docs: record resend runtime proof status
```

Working tree note:

- The Resend webhook package route and focused unit test changed during this
  pass, then this assessment and the final Phase 3 evidence file were updated.
- Existing untracked local configuration folders and untracked
  `skills/stripe-*` symlinks remain unrelated to this provider proof.
- Temporary Vercel env pull files and the generated `apps/admin/.vercel`
  artifact were removed.

## Provider Proof Update

### Resend

Status: complete for Phase 3.

Completed in this pass:

- Confirmed AWS Lightsail access with profile `codex-lightsail` in account
  `184825735819`.
- Confirmed Lightsail DNS zone `asymmetric.al`.
- Created Resend domain `send.asymmetric.al` in region
  `North Virginia (us-east-1)`.
- Added required Resend DNS records in Lightsail:
  `resend._domainkey.send.asymmetric.al` `TXT`,
  `send.send.asymmetric.al` `MX`, and `send.send.asymmetric.al` `TXT`.
- Verified Lightsail lists the new records by name/type.
- Verified public DNS resolves the DKIM `TXT`, sending `MX`, and SPF `TXT`.
- Confirmed the Resend dashboard lists `send.asymmetric.al` as `Verified`.
- Created the Resend webhook endpoint
  `https://admin.asymmetric.al/api/email/webhooks/resend`.
- Selected all 11 Resend Email webhook events.
- Copied the new Resend webhook signing secret directly into Vercel `admin`
  production `RESEND_WEBHOOK_SECRET` using Vercel env management. The value was
  not printed and the clipboard was cleared.
- Pushed commits `c19c0be4ec8b9d5125c2c2294855cdd2ab2cef7d` and
  `4ba4a3321d3ec688797d511cedf3360db3aa7a99`; Vercel production readiness
  passed for admin, donor, and missionary after the deploys finished.

Final closure attempt result:

- Created temporary Supabase Auth proof user
  `phase3-proof-admin+20260513165953@risencode.org` with `super_admin` profile
  role in the proof tenant, signed in through Supabase password auth, used the
  returned bearer token only in memory, and deleted the profile/auth user after
  proof.
- The deployed `POST /api/email/test-send` route returned HTTP 200 for the safe
  app send to `will@risencode.org`.
- The app-created send persisted `email_send_logs` row
  `0080f9a2-26fe-4567-b73a-4cddb9ef27a6` for Resend message
  `cdf483d0-69b4-4ce7-a6c6-e0acaf1763ec`.
- Signed Resend webhook delivery persisted `email.sent` and `email.delivered`
  rows `e2605eeb-6ed1-4cc1-8bfe-6123d21cf852` and
  `f0087842-f4d1-4d8f-8c06-3f5c03d6fc25`.
- Before the fix, production logs showed signed Resend webhooks reached the
  route but failed with PostgREST `42P10` because the code tried to upsert
  against a partial unique index. Commit
  `2fff1bff82de4986885bef9e3668e4635dc49162` fixed this by inserting
  `email_events` and treating duplicate-key violations as idempotent replays.
- Resend API verification confirmed `send.asymmetric.al` is verified, the
  webhook is enabled at `https://admin.asymmetric.al/api/email/webhooks/resend`,
  and all 11 Email events are selected.
- Resend CLI verification confirmed CLI v2.2.1 is authenticated from macOS
  Keychain profile `default`, `send.asymmetric.al` is verified with sending
  enabled, and the same webhook endpoint/events are enabled.
- A safe direct provider test email to `will@risencode.org` was accepted by
  Resend and reached `delivered` status.
- A safe CLI provider test email to `will@risencode.org` was accepted by Resend
  and reached `delivered` status.
- The earlier direct provider sends remain recorded only as provider/domain
  delivery proof because they bypassed app persistence. The final app-route
  proof above closes the Phase 3 Resend send-log and webhook-ingestion gate.

### Twenty Cloud

Status: admin/runtime blocked.

Current evidence:

- Twenty Cloud is accepted for Phase 3.
- `TWENTY_WORKSPACE_ID` is optional in current code.
- Raw Twenty access remains server-side behind `packages/api`.
- No `NEXT_PUBLIC_TWENTY_*` variables were added.
- The deployed CRM gateway route exists and correctly requires authenticated
  staff/admin/super_admin access.
- A temporary production super-admin proof user authenticated successfully, but
  the deployed production gateway route returned `404` because the CRM gateway
  smoke route is intentionally disabled in protected production deployments.
- Production `admin` env pull lists no `TWENTY_*` variables.
- Custom `staging` env pull lists `TWENTY_API_URL` and
  `TWENTY_WEBHOOK_SECRET`, but `TWENTY_API_KEY` is present with an empty value.
- `TWENTY_API_URL`, `TWENTY_API_KEY`, `TWENTY_WEBHOOK_SECRET`, and
  `TWENTY_WORKSPACE_ID` were not present in local `.env.local`.
- The repo client path builder expects a base URL that already includes `/rest`
  for the accepted Phase 3 Twenty Cloud shape; metadata probing appends
  `/metadata/objects`.

Still required:

1. Set/provide a non-empty restricted server-side `TWENTY_API_KEY` in a safe
   staging/proof runtime, or provide a restricted key to Codex.
2. Run harmless metadata read through the package/admin gateway.
3. Run approved non-production gift-posting fixture and confirm link-record
   creation.
4. Keep the previously exposed Twenty webhook secret as accepted residual risk;
   the human owner explicitly declined rotation for now.

## Completed Phase 3 Gates

- Phase 3 implementation is complete locally.
- Stripe proof is complete and was not reopened.
- Stripe webhook state fix is committed in
  `65b7a8252ca09a78d4642bb12b5d06afb7fa98ba`.
- Supabase migration verifier passed previously against a disposable local
  database.
- Full local gate was rerun in this pass and passed:
  `format:check`, `lint`, `typecheck`, `build`, `test:unit`,
  `verify:data-boundary`, `verify:workspace-contract`, `verify:eslint`,
  `verify:shadcn-diff`, and `skills:verify`.
- Vercel production readiness passed for pushed proof commit
  `2fff1bff82de4986885bef9e3668e4635dc49162`; admin, donor, and missionary
  were READY with HTTP 200 health checks.
- Sentry sourcemaps are not a Phase 3 blocker unless deployment explicitly
  fails on sourcemap upload.

## Security Review

- No `.env.local`, provider key, webhook secret, database password, connection
  string, or API token was committed.
- The chat-exposed Resend API key was not printed or persisted by Codex. Rotate
  it after proof if it will remain in use.
- The temporary proof user password and access token were never printed,
  written, or committed. The proof profile and auth user were deleted.
- The new Resend webhook signing secret was moved from Resend to Vercel without
  printing and the clipboard was cleared.
- Temporary env files under `/tmp` were removed.
- The human owner declined Twenty webhook secret rotation for now; this is
  recorded as accepted residual risk, not a Phase 3 blocker.

## Phase Boundary Review

No Phase 4 or Phase 5 work was started in this completion pass.

Phase 3 status remains:

```txt
complete-except-admin-provider-proof
```

## Final Handoff Decision

Handoff decision: complete for implementation, still incomplete for final
provider proof.

Implementation status:

- Local implementation: complete.
- Stripe proof and fix: complete.
- Supabase migration verifier: complete.
- Local/pre-push/GitHub CI: complete in prior evidence.
- Vercel readiness: complete in prior evidence.
- Resend provider proof: complete.
- Twenty Cloud provider proof: admin/runtime blocked.
- Phase 4/5: not started.

Next owner action:

- Provide a safe Twenty Cloud runtime proof path with a non-empty restricted
  server-side `TWENTY_API_KEY`.
- After Twenty metadata read and approved non-production gift-post/link proof
  pass, update the final Phase 3 evidence status from
  `complete-except-admin-provider-proof` to `complete`.
