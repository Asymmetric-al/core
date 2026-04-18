# Support Hub — Release notes (Phase 7 → Phase 8)

This document is the canonical rollout reference for the Donor Care Support Hub. Read it once before the first production deploy of `/support` and again before flipping the Phase 8 Supabase swap.

> **Wired today vs staged for Phase 8.** Phase 7 ships the API adapter
> layer + 30 thin route handlers + the inbound-router stub, but the UI
> still reads + writes the in-memory TanStack DB collection directly. The
> matrix below is the precise truth — see
> [`final-audit-and-wrap-up.md`](./final-audit-and-wrap-up.md) for full
> evidence.
>
> | Surface                                                                                                                               | Wired today                                                                               | Staged for Phase 8                                                                            |
> | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
> | Inbox + board + table + detail + composer + macros + canned + saved views + command palette + reports + settings + automation builder | Yes (in-memory)                                                                           | Same UX, but data flows through the new route handlers + Supabase tables                      |
> | `packages/api/src/admin/support-hub/*` adapter                                                                                        | Built, unwired from UI                                                                    | Single export flip in `adapter/index.ts` activates the Supabase implementation                |
> | `apps/admin/app/api/admin/support/**` route handlers (30)                                                                             | Built, auth-gated, **tenant-isolated** (in-memory preview), called by no client today     | The UI hooks (`useSupportXxxLive`) swap to `useQuery` against these routes                    |
> | Supabase migration + RLS                                                                                                              | None                                                                                      | New `supabase/migrations/<ts>_support_hub_foundation.sql` + rollback                          |
> | Inbound email                                                                                                                         | None                                                                                      | `routeInboundToSupportHub()` body filled in + invoked from the Resend `email.received` branch |
> | Outbound email                                                                                                                        | Mock — adapter writes a row with `deliveryState: "queued"`; `sendEmail()` is never called | Adapter calls `sendEmail()` from `@asym/email` and persists the `outboundSendLogId`           |
> | CSAT, KB-article insertion, live CRM hydration, mention notifications                                                                 | None                                                                                      | All deferred to Phase 8 / Phase 8.5                                                           |

## Phase 7 release (this PR)

### What ships

- Production-shaped `packages/api/src/admin/support-hub/*` adapter layer with a single swap point in `adapter/index.ts`.
- 30 thin route handlers under `apps/admin/app/api/admin/support/**` covering every conversation, registry, and report surface — every handler binds the authenticated `tenantId` via `withSupportHubAccess()` so the in-memory adapter cannot leak or mutate another tenant's rows.
- Tenant-isolated in-memory adapter: `AsyncLocalStorage` request scope (`packages/api/src/admin/support-hub/request-context.ts`), per-call `tenantScopeForReads()` filter on every list / get / message read, and a `SUPPORT_HUB_TENANT_MISMATCH` write guard mapped to a 403 by `toApiErrorResponse`. Cross-tenant reads return empty / not-found; cross-tenant writes return 403.
- CRM cross-links from the contact sidecar into `/crm` and `/contributions`.
- A11y improvements: aria labels + `aria-pressed` on board cards, `aria-busy` on the composer Send button, focus return when the detail pane closes.
- Perf gates: 200-row virtualization on the table; 50-card-per-column pagination on the board; per-slice memoization of the report request shape.
- Failure recovery: `useSupportFailureRecovery` context + inline retry banner for send-reply / save-draft / add-note paths.
- 47 new unit / component tests, 1 new e2e smoke spec.
- Operator + admin guides, phase note, this release note.

### What does NOT ship in Phase 7

- No `supabase/migrations/*` change. The in-memory adapter is the only live data path.
- No live Resend wiring for the inbound router. `routeInboundToSupportHub()` is a typed stub.
- The tenant model on the new route handlers is still **single-demo-seed**. Tenant isolation is enforced (see "What ships" above), but only one tenant (`SUPPORT_HUB_DEMO_TENANT_ID = "tenant-give-hope"`) has rows in the in-memory adapter today. Foreign-tenant reads return empty and foreign-tenant writes are rejected with a 403 — but the in-memory adapter is still process-scoped and ephemeral. Phase 8 step 1 lands the Supabase migration so additional tenants get real, persistent rows and step 2 translates the in-memory `tenantScopeForReads()` filter into RLS on `tenant_id`.
- No CSAT collection or report.
- No Knowledge Base article insertion.
- No CRM hydration (donor profile lookup, gift history, missionary/church detail) — the sidecar uses safe deep-links into existing list pages.

### Compatibility / migration steps

- No database migration to apply.
- No environment variables to add.
- No nav changes (`/support` role gate stays as `member_care | admin`).
- No new shared UI primitives — every Phase 7 component is feature-scoped.
- Demo seed data in `packages/database/collections/support-hub.ts` ships with the build. Phase 8 will move it behind `NODE_ENV !== "production"`.

### Quality gates run

- `bun run typecheck` — 13 packages clean.
- `bun run lint` — workspace clean.
- `bun run test:unit` — 531 tests across 122 files (the original 528 + 3 new tenant-isolation tests in `tests/unit/packages/api/admin/support-hub/tenant-isolation.test.ts`).
- `bun run test:e2e:smoke` — Phase 7 adds `tests/e2e/support-hub.smoke.spec.ts` alongside the existing CRM / contributions smokes. The spec self-skips when the demo session install is unavailable, so it has not been verified end-to-end inside CI yet; it should be promoted to a hard requirement once the Phase 8 Supabase migration ships.
- Prettier — clean.
- `tanstack-foundation-guardrails.test.ts` — green.

### Rollback

This PR is purely additive. To roll back, revert the merge commit; nothing in the existing `/support` UX depended on the new route handlers and the in-memory adapter is the same data path Phase 6 used.

## Phase 8 plan

Phase 8 turns on real persistence + real inbound email. The sequence is intentional — each step should land in its own PR and pass the `support-hub.smoke.spec.ts` regression net before the next one starts.

### Step 0 — Tenant isolation: DONE on this PR (commit `585cddbb`)

Cherry-picked from `cursor/critical-correctness-issues-b783@4357b908`. See "What ships" above and the Open risks section of [`final-audit-and-wrap-up.md`](./final-audit-and-wrap-up.md). The Supabase migration in step 1 below should keep this contract green and step 2 should translate the in-memory `tenantScopeForReads()` filter into `tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid` RLS policies on every `support_*` table. The new `tenant-isolation.test.ts` is the regression net while the in-memory adapter is still in use; Phase 8 should port the same three assertions onto the Supabase adapter as a parallel suite.

### Step 1 — Supabase migration

- Author `supabase/migrations/<ts>_support_hub_foundation.sql` per Phase 1 §3.4 + Phase 6 additions:
  - `support_conversations`, `support_messages`, `support_message_attachments`, `support_labels`, `support_conversation_labels`, `support_assignments`, `support_saved_views`, `support_macros`, `support_canned_responses`, `support_signatures`, `support_business_hours`, `support_sla_policies`, `support_audit_log`.
  - Phase 6 additions: `support_automation_rules`, `support_notification_preferences`.
  - Bridging columns on `email_inbound_messages`: `conversation_id`, `message_id_header`, `in_reply_to_header`, `references_headers`.
  - Indexes per the Phase 1 file map.
  - RLS policies gated on `tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid`, mirroring `member_care_foundation.sql`.
- Add a paired rollback file: `supabase/migrations/rollback_<ts>_support_hub_foundation.sql`.
- Apply via `supabase db push` against staging → smoke → production push during a low-traffic window.

### Step 2 — Supabase adapter

- Implement `packages/api/src/admin/support-hub/adapter/supabase.ts` against the new tables.
- Each method on the `SupportHubAdapter` interface gets a Supabase implementation that uses `getAdminClient` from `@asym/database/supabase/admin` (or `getServerClient` for RLS-respecting reads when called from a request context).
- Flip the export in `packages/api/src/admin/support-hub/adapter/index.ts`:
  ```ts
  export { supabaseSupportHubAdapter as supportHubAdapter } from "./supabase";
  ```
- Run the existing Phase 7 unit tests against the Supabase adapter (the `tests/unit/packages/api/admin/support-hub/reads-mutations.test.ts` suite was written so it works against any `SupportHubAdapter` implementation — point it at the swap or keep the in-memory test fixture for CI speed).
- Run the e2e smoke spec.

### Step 3 — Inbound webhook

- Wire `routeInboundToSupportHub()` into `packages/api/src/email/webhooks/resend.ts` inside the existing `email.received` branch (around line 572).
- The router needs to:
  1. Look up the inbox via the recipient address.
  2. Thread the message via `In-Reply-To` → `References` → `(tenant, external_email, normalized_subject)`.
  3. Insert a `support_messages` row.
  4. Re-evaluate enabled automation rules with `evaluateSupportAutomationRule`; dispatch matched actions through `runSupportMacroOnServer`.
- Add `tests/unit/packages/api/email/webhooks-resend.test.ts` cases for the threading happy paths.

### Step 4 — Seed posture

- Move the in-memory seed in `packages/database/collections/support-hub.ts` behind a `NODE_ENV !== "production"` guard so production tenants start clean.
- Add a one-time seeding script for production tenants: default labels, default SLA policy, default business hours, default workspace signature.

### Step 5 — Production tenant onboarding

- Configure `RESEND_INBOUND_DOMAIN` per tenant (`tenant_email_settings.inbound_domain`).
- Verify the Resend webhook URL points at the production handler.
- Smoke-test by sending a real donor email through the inbound flow.
- Promote the inbox to live for a single donor care agent first; expand once the activity log + reply round-trip looks right.

## Provider secrets

| Variable                   | Phase              | Notes                                                                                                                                                  |
| -------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `RESEND_API_KEY`           | Already configured | Outbound email (Phase 5+) and inbound retrieval (Phase 8).                                                                                             |
| `RESEND_INBOUND_DOMAIN`    | Phase 8            | Configured per tenant in `tenant_email_settings`.                                                                                                      |
| `SUPPORT_HUB_USE_SUPABASE` | Phase 8 (optional) | Override flag if we need to feature-gate the Supabase swap by tenant during the cutover. Default behaviour is to honor the swap globally once shipped. |

## Phase 8 follow-ups (not blocking the swap)

- CSAT collection + reports surface.
- Knowledge-base article insertion in the reply composer.
- Live CRM hydration in the contact sidecar (donor profile, gift history, missionary detail).
- Tenant timezone plumbing so business-hours computations interpret schedules in the tenant-local offset (currently UTC-only).
- `mark_escalated` + `run_macro` runtime coverage in the server-side automation evaluator.
- Resend daily digest emails + Mission Control inbox bell surface for mention notifications.

## Risk register

- **In-memory state vs production tenants** — the Phase 7 in-memory adapter is process-scoped. In production, two parallel server instances would diverge. This is acceptable today because the UI continues to read from TanStack DB collections (which run client-side) and only the new route handlers exercise the server adapter. Phase 8 fixes this by swapping in Supabase as the source of truth.
- **Dry-run preview ≠ live runtime** — the automation dry-run runs the same pure evaluator the future server runtime will use, but there is no live event source today. Phase 8 closes this gap.
- **CSV export size** — in-browser export builds the file in memory. For tenants with > 100k report rows this becomes painful. Phase 8 moves the export server-side if/when needed.
- **Mobile composer** — the composer pane mounts inside a full-screen Sheet on ≤ md viewports. Tiptap on iOS Safari has occasional focus-return quirks; the Phase 7 `useFocusReturn` hook is the mitigation. Monitor.

## Continuity notes

Every phase doc lives at `docs/features/support-hub/phase-NN-*.md`. Read them in order. The single swap point that Phase 8 changes is documented in:

- `packages/api/src/admin/support-hub/adapter/index.ts`
- `packages/api/src/admin/support-hub/adapter/types.ts` (the contract)
- `packages/api/src/admin/support-hub/inbound-router.ts` (the stub)

Nothing else needs to change at the seam.
