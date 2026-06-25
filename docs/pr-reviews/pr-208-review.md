# PR #208 Review - Harden email integration

- URL: https://github.com/Asymmetric-al/core/pull/208
- Base: `production`
- Head: `codex/resend-audit-remediation`
- Draft: no
- GitHub state at review: `BEHIND`, `REVIEW_REQUIRED`
- Size: 15 changed files, +1,078 / -201
- Local review note: Nia MCP was unavailable in this session; fallback used `gh`, `git`, `rg`, and direct file reads.

## Merge And Tests

Local merge into `upstream/production`: clean.

Command run in `/tmp/core-pr-review`:

```sh
bun install --frozen-lockfile && bun run ci:preflight
```

Result: passed, including 104 test files and 451 tests.

## Verdict

The local gate is green, but webhook behavior still has merge-risk issues. Fix the inbound unresolved-tenant handling and sanitize public error responses before merge.

## Findings

### P1 - Inbound email with unresolved or ambiguous tenant is accepted and stored with `tenant_id = null`

Evidence: `apps/admin/app/api/admin/email/webhooks/resend` logic in `packages/api/src/email/webhooks/resend.ts` lines 705-824 continues inbound processing when tenant resolution is unresolved or ambiguous, stores `email_inbound_messages` with `tenant_id: tenantId`, and returns `202` when `inboundTenantWarning` exists. Docs state the same behavior.

Impact: a real inbound message can be acknowledged to Resend without being assigned to a tenant. Unless there is an operator-visible quarantine and replay flow, this can silently orphan support mail.

Suggested fix:

- Prefer `503` for unresolved/ambiguous inbound tenant resolution so Resend retries while the configuration issue is fixed, or
- Add an explicit quarantine table/status with alerting, search, and replay, and document that `202` means "accepted into quarantine".
- Add tests for unresolved, ambiguous, dependency-failed, and successfully resolved inbound events.

### P2 - Webhook persistence errors expose internal details in public JSON

Evidence: `toWebhookPersistenceResponse` returns `error.message`, `operation`, and spreads error context into the response.

Impact: callers can see internal operation names, ids, and database failure context.

Suggested fix:

- Log detailed context server-side.
- Return a stable external code and a correlation id.
- Avoid exposing raw persistence messages to the webhook caller.

### P2 - Webhook route bypasses validated env access

Evidence: `resend.ts` reads `process.env.RESEND_WEBHOOK_SECRET` and `process.env.RESEND_API_KEY` directly around lines 523-541 and 719-753, even though `packages/env/src/schema.ts` validates these values.

Impact: runtime behavior can diverge from the env schema. This is especially confusing for preview/local where validation may not be strict.

Suggested fix:

- Use the repo's env accessor/server env module for these values, or centralize a validated Resend config helper.
- Test missing API key and missing webhook secret through that helper.

### P2 - `.env.example` omits required Resend server variables

Evidence: `.env.example` lists `RESEND_API_KEY` but not `RESEND_WEBHOOK_SECRET` or `RESEND_ENCRYPTION_KEY`, while `packages/env/src/schema.ts` validates both for development/production.

Impact: deploy setup can pass docs review but fail env validation.

Suggested fix:

- Add placeholders and comments for all three server-only Resend variables.
- Mention required formats: `whsec_` for the webhook secret and at least 32 characters for the encryption key.

### P2 - Retry backoff can exceed configured maximum

Evidence: `packages/email/resend.ts` `backoffDelayMs` computes a capped delay and then adds jitter, so final delay can exceed `RETRY_CONFIG.maxDelayMs`.

Impact: retry timing can violate the documented/configured maximum.

Suggested fix:

- Cap after jitter: `Math.min(RETRY_CONFIG.maxDelayMs, Math.round(cappedDelay + jitter))`.
- Add a deterministic test for the upper bound.

### P2 - Env audit/docs should be updated with the new validation contract

Evidence: Resend validation changed in `packages/env/src/schema.ts`, while docs such as `docs/env-var-audit.md` should stay aligned.

Suggested fix:

- Update the audit/runbook docs to include `RESEND_WEBHOOK_SECRET` and `RESEND_ENCRYPTION_KEY` requirements and rotation notes.

## Required Before Merge

- Decide retry vs quarantine semantics for unresolved inbound tenant events.
- Sanitize public webhook error responses.
- Centralize validated Resend env access.
- Update `.env.example` and env docs.
- Re-run full preflight after changes.
