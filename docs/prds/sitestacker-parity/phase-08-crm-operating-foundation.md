# Phase 8 — CRM Operating Foundation

> **Program:** SiteStacker Parity · **Phase:** 8 · **Status:** Groomed (grill-with-docs, 2026-07-06) · **Base:** `develop`
> **Subtitle:** _Readiness & Self-Healing · Notes Write-Enable_
> **Hard prerequisites:** **Phase 4** (Identity & Account-Claiming / tenant-isolation foundation) **and** **Phase 6** (Shared Communication Event Model) must ship first; the **Phase 3 consent gate (PR #502)** must merge. See [Dependency Ledger](#dependency-ledger).
> **Supersedes:** `docs/prds/sitestacker-parity/phase-01-crm-operating-foundation.md` (groomed-but-unbuilt; it explicitly named this work "Phase 8+"). That file is tombstoned separately.
> **Charter / matrix:** `docs/prds/sitestacker-parity/README.md`, `parity-matrix.md`
> **Predecessors:** Phase 0 (baseline/governance) · Phase 2 (site/locale/currency) · Phase 3 (permission & role-scoped projection) · Phase 4 (identity & isolation) · Phase 6 (communication events) · Phase 7 (receipt/statement rules)

> **Scope amendment (2026-07-06 — ADR-0001).** Twenty CRM has been retired as a product dependency ([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md); [Phase 1 ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)). The Twenty-facing scope of this PRD — Tranche 2 (Notes write-enable, T12), the provider write gates and provider-idempotency machinery as Twenty-write enablers, the provider-health/schema-hash probes, the "Twenty conformance" section, and every live-Twenty round-trip evidence requirement — is **withdrawn**. The §E/T11 env-flag retirement (expand→migrate→contract, #598) is superseded: the `CRM_SYNC_*_ENABLED` flags are deleted with the dormant sync stack by cleanup ticket #602, which folds in #598's surviving CI-grep kernel. The surviving concerns — staff operations visibility, CRM data health (Asym-internal subjects only), alert routing — will be **re-groomed against Asym-internal subjects** in a dedicated session (#603) before any Phase 8 build starts; the re-groomed PRD adopts the root `CONTEXT.md` operating-term names verbatim (Disposition Predicate et al.). Do not build from this document until the re-groomed PRD lands; issues #587–#601 carry applied ADR-0001 scope notices (#599 — the withdrawn Notes write-enable tranche — closed 2026-07-06).

Modern SiteStacker parity for **making the CRM layer trustworthy, self-healing, and staff-operable before deeper CRM depth is built on top of it** — and then proving it by safely opening the **first production write** to the backing provider (Twenty) for exactly one low-risk domain (Notes). This is a **foundation + write-enable** phase, not a rebuild: the Twenty engine (signed/deduped webhooks, an idempotent outbound job queue, detect-only reconciliation, shadow projections, tenant-scoped tables) is **already built** and used read-only; Phase 8 **surfaces, operationalizes, hardens, and opens one gate**. Production writes stay fail-closed everywhere except the one domain this phase deliberately, and reversibly, enables.

---

## Problem Statement

Today, staff cannot answer basic operational questions about the CRM without asking an engineer: _Is CRM healthy? Is Twenty reachable? Is the schema what we expect? Is sync paused? Are webhooks or outbound jobs failing? Are projections drifting? Are duplicates waiting? Can we safely enable writes for this domain? Did the last reconciliation pass? What should I do next?_ The CRM engine is ~built at the data/service layer, but the **operating layer above it is missing**, and three concrete gaps block everything downstream:

1. **There is no machine-readable safety interlock for writes.** Write control today is a set of environment-variable feature flags (`CRM_SYNC_*_ENABLED`, all default off) plus per-tenant/per-domain pause booleans — invisible, unauditable, and not a fail-closed gate. Nothing records _who_ enabled a domain, _when_, or _against what evidence_. There is no durable, per-domain interlock guaranteeing that no future phase can flip on Twenty writes until recorded safety preconditions are met.
2. **Drift is detected but never healed, and failures are silent.** Reconciliation finds six drift categories but takes no action and runs only when a human triggers it. A dead-lettered job emits no alert, a failed webhook sits invisibly, and "self-healing" is a design claim, not a running fact. There is no operations surface, so the steady state is not "quiet and green" — it is "unknown."
3. **The write path has never actually written in production, and isn't yet safe to.** No domain has ever been written to Twenty from production, the write path lacks a provider-facing idempotency guarantee (so a crash-recovery replay could double-create), and a note write persists no durable Asym↔Twenty link — so it could not be reconciled, replayed, or audited.

If we build deeper CRM depth before this operating foundation exists, we build on unstable sync, hidden failures, unclear write ownership, provider rate limits, and unsafe repair paths.

## Solution

An **Asym-owned CRM operating foundation** that makes CRM health, sync state, drift, write-readiness, and safe next-actions **visible and trustworthy from inside Mission Control** — and a **first, reversible, fully-accountable production write** for one domain to prove it. Two independently-shippable tranches:

1. **Tranche 1 — Foundation (no external writes).** A durable, fail-closed **write gate** (readiness recorded as data, not code constants); a **hysteretic reactive pause** so transient blips never flap the write path; a **scheduled, multi-tenant, self-healing reconcile** that auto-heals the mechanical/reversible drift and escalates the rest; **alert routing** that pages engineers for real failures and surfaces judgment items quietly; a **read-only `/crm/operations` windowpane** with exactly two governed levers (open a domain's gate; emergency global kill-switch); and the retirement of the legacy env-flag control plane.
2. **Tranche 2 — Notes write-enable.** Open the gate for the `notes` domain only, with recorded proof-of-health; make a successful note write **persist a durable record-link** (reconcilable, replayable, auditable); prove it with a **live Twenty round-trip**; and make rollback a simple, reversible gate-close.

Underneath, the foundation is **provider-neutral by shape** (an OpenFeature-style evaluation seam so a second provider or a Twenty version bump doesn't re-plumb the write path) and **reuses everything already built** — the outbound queue, webhook dedupe, reconcile categories, tenant RLS, the Inngest recovery-scan pattern, and the Phase-6 send seam. The steady state is a **green, empty operations screen**: "no news" reliably means "the system is handling it."

---

## User Stories

### Staff operator — visibility & trust

1. As a **CRM operator**, I want one plain-language health verdict (healthy / degraded / blocked) with the reasons, so that I know the state of the CRM at a glance without reading logs.
2. As a **CRM operator**, I want a nav health badge, so that CRM status is always visible without opening a page.
3. As a **CRM operator**, I want a single read-only `/crm/operations` window showing per-domain gate/pause state, drift counts, the oldest dead-letter's age, and a short "needs-a-human" list, so that I can triage without a control room.
4. As a **CRM operator**, I want the operations page to load on open and refresh only when I ask, so that it never becomes a noisy dashboard I must babysit.
5. As a **CRM operator**, I want a green, empty operations screen in steady state, so that "no news" reliably means "the system is handling it."
6. As a **CRM operator**, I want the count of duplicate candidates with a link to the Phase-4 Merge UI, so that I know cleanup is pending without a second merge tool living here.

### Staff operator — the two governed actions

7. As a **CRM lead**, I want to open a domain's write gate with a required one-line reason and an automatically-recorded proof-of-health, so that enabling writes is a deliberate, auditable decision made against a healthy system.
8. As a **CRM lead**, I want the gate-open button disabled with a plain reason ("Blocked: provider schema mismatch") when readiness is not green, so that I can never force an unsafe write.
9. As a **CRM lead**, I want a single global "stop all outbound writes" kill-switch, so that in an emergency I have one lever that does not require reasoning about per-domain rows.
10. As a **CRM lead**, I want opening a domain and flipping the kill-switch to be recorded with who/when/why and the health snapshot, so that every high-consequence action is traceable.

### On-call engineer — alerting

11. As an **on-call engineer**, I want true failures (Twenty unreachable, schema mismatch, a dead-lettered job) to alert the error channel, so that I am paged for things that are actually broken.
12. As an **on-call engineer**, I want ambiguous/judgment items to stay _off_ the error channel and on the operations page, so that judgment calls do not train me to ignore real alarms.
13. As an **on-call engineer**, I want a stuck case to escalate after bounded attempts rather than retry forever, so that dead-letters get a human instead of silently looping.
14. As a **staff operator**, I want a digested (not per-event) email notification of judgment/reconciliation items, so that I am informed without alert fatigue.

### The platform — self-healing & safety

15. As the **platform**, I want a scheduled reconcile that runs across every configured tenant without a human triggering it, so that drift is detected and repaired continuously.
16. As the **platform**, I want to auto-heal only mechanical, idempotent, reversible, non-money drift (stalled jobs, stale projections, transient webhook failures), so that routine misalignment never reaches a person.
17. As the **platform**, I want to escalate — never auto-act on — money-adjacent drift, persistent orphan links, and duplicate candidates, so that an automated wrong guess on an irreversible thing is impossible.
18. As the **platform**, I want every auto-heal bounded by a per-tenant and global blast-radius cap, so that a detection bug can never mass-act across tenants.
19. As the **platform**, I want each tenant's reconcile isolated in its own concurrency lane and the whole fleet bounded by one shared provider budget, so that one large tenant can neither starve the others nor blow Twenty's rate limit.
20. As the **platform**, I want the reactive pause to trip only after sustained failures and clear only after several consecutive healthy probes, so that a transient blip never flaps writes on and off.

### Finance / auditor — safety of the write path

21. As **finance**, I want no money-domain writes to Twenty in this phase (only Notes), so that no financial truth can be corrupted by an operational change.
22. As an **auditor**, I want the gate's "why writes are blocked/allowed" to be a durable, queryable fact, not an in-code boolean, so that write-readiness is provable.
23. As an **auditor**, I want the conformance preconditions (write-idempotency, webhook-dedupe, provider-version) proven by a **live** Twenty round-trip before the gate opens, so that the gate never opens on a design claim.
24. As **finance**, I want operational alerts and the operations page to show diagnostic/state facts only — never amounts, donor names, or deductibility — so that money detail can never leak through an ops channel.

### Developer / system — the durable write contract

25. As a **developer**, I want a successful Notes write to persist the returned Twenty record id and a record-link, so that the write is reconcilable, replayable, and auditable.
26. As a **developer**, I want the provider-facing idempotency key to include the resolved record, so that a crash-recovery replay after a merge or re-point can never double-create or write to the wrong record.
27. As a **developer**, I want every service-role reconcile/heal/write unit routed through the tenant-guard wrapper, so that a missing tenant predicate can't cross tenants where RLS is bypassed.
28. As a **developer**, I want the per-write readiness check to read only local state (no synchronous provider probe on the hot path), so that a provider blip can't hang or flap a write.
29. As a **developer**, I want the legacy `CRM_SYNC_*_ENABLED` env flags retired via expand→migrate→contract with a CI grep-test, so that we never keep two control planes for one decision.
30. As a **developer**, I want the gate built as a neutral evaluation seam with a provider adapter, so that a second provider or a Twenty version bump changes an adapter, not the whole write path.

### Founder / organization

31. As a **founder**, I want the steady state to be quiet and self-healing, and Twenty to stay a backing provider behind Asym contracts, so that staff operate one coherent product, not a provider control-room.
32. As the **organization**, I want the first production write to be reversible and provable, so that we can trust the write path before we build on it.

---

## Implementation Decisions

### A. Architecture rulings (the settled decisions)

- **A1 — The write gate is a durable evidence record, not code constants.** Readiness/write-enable is a persisted per-`(tenant, provider, domain)` row (`crm_write_gates`) that is the single source of truth for `assertCrmWriteReady`, published in Phase-0 Built/Live/Confirmed form. This resolves the Phase-0 evidence-discipline gap and makes "why are writes blocked?" a queryable fact. _(ADR 1.)_
- **A2 — Two controls: a deliberate gate and a reactive health pause.** Opening a domain is a rare, human, evidence-recorded decision; "is it safe to write _right now_?" is a frequent, automatic, health-driven answer. They are separate: the per-write check reads **local state only** (`gate.enabled AND NOT paused AND last_known_health ≠ blocked`, with a max-probe-age staleness guard → `unknown` → refuse); the **healer is the sole prober**. This is the LaunchDarkly governed-flag-vs-automatic-kill-switch pattern, realized on our own tables. _(ADR 2.)_
- **A3 — Fail-closed, always.** Any gate condition that is false, absent, or stale means "not ready" and refuses the write. Conditions: gate row `enabled` **AND** live flags (`gatewayOk`, `schemaOk`, `reconciliationClean` within a freshness TTL, `syncNotPaused`) **AND** conformance (`writeIdempotencyVerified`, `webhookDedupVerified`) **AND** `providerVersionVerified` **AND** not-paused. No single condition can open it.
- **A4 — Provider-neutral by shape (OpenFeature-style), not by SDK.** A neutral `evaluateWriteGate(context)` call, a swappable provider adapter behind it, `(tenant, provider, domain)` as the evaluation context, and **hooks** carrying the cross-cutting concerns (audit, proof-of-health capture, fail-closed validation). We adopt the _shape_ (future-proofing the provider boundary) — not a managed flag vendor, percentage rollouts, relay proxy, or approval-workflow tooling (over-engineering at this scale). _(ADR 2.)_
- **A5 — Per-domain approval strength.** `approval_policy ∈ {single, two_party}` on the gate row. Notes (reversible, non-money) opens with a **single** authorized operator + recorded justification + proof-of-health. **`two_party` (four-eyes / separation-of-duties)** is reserved as a policy value for future money/identity domains — no rework, just a stricter field value later.
- **A6 — Hysteretic reactive pause (anti-flap).** The pause trips only after N sustained failures over a window and clears only after N consecutive green probes with increasing re-probe backoff; a single success never clears it. Modeled as a few state columns on the existing `crm_sync_settings` pause rows — not a circuit-breaker framework. A single **global kill-switch** sets the same pause path for emergencies.
- **A7 — Multi-tenant healer via fan-out + native flow control.** A cron **orchestrator** cursor-pages the enabled/not-paused `(tenant, domain)` registry and emits **one event per pair**; a **worker** runs each as its own event with a **per-tenant concurrency key** (the bulkhead) plus an **unkeyed global throttle** sized to the single shared Twenty workspace budget. This is the AWS/Microsoft noisy-neighbor + Inngest concurrency-key pattern, copying the shipped `donation-saga-recovery` scan→emit shape — **no hand-rolled scheduler, pool, or rate limiter.** _(ADR 4.)_
- **A8 — Auto-heal only what is safe to be wrong about zero times.** A single principled predicate: **auto-heal iff `idempotent AND reversible AND non-money AND well-scoped`; anything failing any clause escalates.** So a future drift category classifies itself rather than needing a new hand-tuned handler. Money-adjacent, provider-irreversible, and duplicate items escalate; nothing auto-merges. _(ADR 5.)_
- **A9 — Alerts split by channel, both wired.** Non-email operational/infra failures → the **Sentry/error channel** (wired server-side in this phase; absent in `packages/api` today). Emailed digested judgment/reconciliation **notifications** → the **single Phase-6 `sendEmail` seam** via `recordCommunication`, as a `communication_event` (`kind='crm_alert'`, `visibility='staff_only'`, `retention_class='operational'`, `actor='system'`, recipient by email with **no** person link). Routing predicate: _machine failures page Sentry; human-judgment notifications go through the one send seam._ _(ADR 6.)_
- **A10 — Redaction by construction.** The `/crm/operations` read model and every alert body carry **only diagnostic/state facts** (gate/pause/sync/reconcile status, counts, ages) — they structurally never contain amounts, donor names, or deductibility. The redaction wall is enforced by _what the read model includes_, not by policy filtering; `field_policies` registration is a congruence wiring for when Phase-3's table ships, not a gate. _(ADR 7.)_
- **A11 — Merge ownership stays in Phase 4.** Phase 8 builds **no** merge/dedupe workbench; the donor merge UI, execution, and receipt-integrity fix live in Phase 4 (`#514`/`#512`/`#507`/`#506`/`#516`, per Phase-4 §G). Phase 8's ops surface shows the duplicate **count** and links to the Phase-4 Merge UI. Where the healer/outbound path re-points a `crm_record_link` after a donor merge, it reads Phase-4's `merge_operations`/tombstone contract and never invents a link-state. _(ADR 9.)_
- **A12 — Notes write is accountable or it does not ship.** A successful Notes write persists the returned Twenty note id + a `crm_record_link` (extending the existing gift-only success path); the write is reconcilable/replayable/auditable. Reads stay read-through; inbound Twenty-side note-edit reconciliation is a **documented deferral** surfaced by the reconciler's drift count. _(ADR 8.)_
- **A13 — One provider idempotency contract.** The provider-facing idempotency key includes the resolved `crm_record_link`/`twenty_record_id` (the "P0-3" fix); a `crm_provider_idempotency_log` records the acknowledged result. Ordering is **reserve-key → call provider → atomically persist response id + record-link**; a crash-recovery retry re-drives from the reserved key and uses the request hash to detect the same logical write (re-fetch/reconcile, never blind-create). A note the provider reports deleted/not-found is a reconciler drift path. _(ADR 10.)_

### B. Deep modules (`packages/api/src/crm`)

Each is a deep module — a simple, testable interface hiding real complexity — with thin app routes calling in.

- **`readiness`** — `getCrmReadiness(tenantId, provider, domain)` composes the gate row + live flags + conformance + provider-version into a typed verdict (`healthy | degraded | blocked` + reasons); `assertCrmWriteReady(...)` is the fail-closed guard (throws on any false/absent/stale). `evaluateWriteGate(context)` is the neutral OpenFeature-shaped entry with hooks for audit/proof-of-health/fail-closed. The per-write check is **local-state only**.
- **`gate`** — the `crm_write_gates` store + `openDomainGate` / `closeDomainGate`, executed **only** through the operator-command lane (below); records the proof-of-health snapshot at open. Reads back into `readiness`.
- **`pause`** — the hysteretic trip/clear state machine over `crm_sync_settings`; `getPauseState` / `tripPause(reason)` / `attemptClear`; the global kill-switch writer. Owns `last_known_health`, `paused_until`, and the trip/clear counters.
- **`reconciliation` (extend, not fork)** — the existing detect-only engine gains `resolveReconcileActions(findings, policy)`: the pure mapping of the six categories → `{ autoHealed, escalated, deadLettered }` under the A8 predicate, plus the bounded auto-heal executors (reset+re-enqueue stalled jobs; re-project stale shadows with a max-staleness horizon; bounded transient replay of failed webhooks). Never auto-deletes a link; never auto-merges.
- **`alerting`** — `routeCrmSignals(readiness, reconcileOutcome)` → `{ sentryEvents, emailedNotifications, humanQueueItems, staleEscalations }`; the **escalation consumer** for dead-letters (groups new dead-letters by `(tenant, domain)`, records an escalation entry to avoid re-escalation, surfaces oldest-item-age); the digested emailed-notification builder that calls the Phase-6 seam.
- **`operations` read model** — `getCrmOperationsView(tenantId)` returns the windowpane summary (per-domain gate/pause state, drift counts, dead-letter oldest-age, human-judgment list, duplicate count) from a **summary rollup written by the healer at the end of each pass**, with a shown staleness bound. A dedicated **operational-events view** exposes no-person `crm_alert` rows to staff (they cannot render on a CRM person's Activity tab).
- **`commands` (operator-command lane; extend the existing command-log)** — `runCrmOperatorCommand(command, actor, ctx)`: permission-union check, `approval_policy` enforcement (`single | two_party`), idempotency-key handling, an audit write to the command log, and a typed result. The **only** callers are the two governed actions (gate-open, kill-switch) and the system auto-healer.
- **`sync/outbound` (extend)** — the provider-idempotency key includes the record link; on success write `crm_provider_idempotency_log` and (for notes) update the `crm_record_link`. **Single-layer retry ownership** (remove the double `retries` layer); add **jitter + capped exponential backoff + `Retry-After`** honoring; **transient-vs-terminal** classification (reuse the existing client status-code set) gates every auto-heal.
- **`healer` (Inngest, `packages/api/src/workflows`)** — the orchestrator + worker functions (see §E), extending the recovery-scan pattern.

### C. Predecessor plug-ins (no parallel systems)

- **Phase 4 (hard prereq).** Every service-role path (healer worker, gate/kill-switch writes, outbound processor, record-link re-point) routes through the **`withTenant()` tenant-guard** running as a non-owner/non-`BYPASSRLS` role so `FORCE` RLS applies; new tables adopt **composite `(tenant_id, id)` keys + ENABLE/FORCE RLS**; the Inngest healer runs under a **non-BYPASSRLS scheduler role**; record-link re-point reads Phase-4's `merge_operations` contract. Until `withTenant` lands, the healer routes through the existing service layer that threads an explicit `tenantId` into every store call and relies on the tenant-id RLS + composite keys — swapping to `withTenant` at a single call-site when it ships.
- **Phase 6 (hard prereq).** Emailed alerts are captured at the single **`sendEmail` seam** via `recordCommunication` — never a parallel send path (the sole-seam CI lint would fail). Phase 8 adds the `crm_alert` kind and its `operational`/`staff_only` defaults; a no-person send is Phase-6's explicitly-modeled A5 case.
- **Phase 3 (inherited).** The **consent gate** is consulted at the seam (a no-op for a staff/system alert with no donor); **`field_policies`/export governance** classify any `communication_events.*` field reaching export/Mission-Control surfaces; the **role-scoped projection chokepoint** keeps `staff_only` events off donor/missionary surfaces by the resolver; the **audit spine** records governed actions (identifiers-only).
- **Phase 7 (inherited).** The **redaction wall** (never amounts/donor-names/deductibility to non-owner parties) is honored by A10's redaction-by-construction; **version-scoped idempotency** engages only if an alert ever references a receipt/donation (disjoint key space from Phase 8's own `(tenant, kind, alert_source, alert_id)` key).
- **Phase 2 (inherited).** CRM operates at **tenant scope only** — the write-gate table and `/crm/operations` carry `tenant_id`, **no `site_id`**; gate/kill-switch act at tenant scope.
- **Phase 0 (inherited).** Evidence follows **Built / Live / Confirmed** discipline (see Evidence & Acceptance).

### D. Data model

**Net-new tables (all composite `(tenant_id, id)` PK, `ENABLE` + `FORCE` RLS, Supabase RLS-performance rules below):**

- **`crm_write_gates`** — the durable per-domain write-enable evidence record. `tenant_id`, `id`, `provider` (TEXT+CHECK, `'twenty'`), `domain` (TEXT+CHECK over the sync domains), `enabled` (bool, default false), `enabled_by_profile_id`, `enabled_at`, `disabled_at`, `reason`, `readiness_snapshot` (JSONB — the green verdict at open), `approval_policy` (TEXT+CHECK `'single' | 'two_party'`, default `'single'`), timestamps. `UNIQUE (tenant_id, provider, domain)`. RLS: staff read; **admin/super_admin only** may insert/update (enable/disable). This is the source of truth for `assertCrmWriteReady`.
- **`crm_provider_idempotency_log`** — result-level dedupe for provider writes. `tenant_id`, `id`, `provider`, `idempotency_key`, `outbound_job_id`, `twenty_response_id`, `request_hash`, `sent_at`, `acknowledged_at`. `UNIQUE (tenant_id, provider, idempotency_key)`.
- **A minimal provider health/schema-hash record** — backs `last_known_health` + `provider_version_verified` (the trimmed survivor of the dropped `crm_schema_versions`/`crm_provider_health_checks`; minimal, not a framework): `tenant_id`, `provider`, `schema_hash`, `probed_at`, `verdict`, `version_ref`.

**Extend existing:**

- **`crm_sync_settings`** — add hysteresis columns: `last_known_health` (TEXT+CHECK `healthy|degraded|blocked|unknown`), `paused_until`, `pause_trip_count`, `pause_last_tripped_at`, and a `max_probe_age` interval. Preserves the existing `UNIQUE (tenant_id, domain)` and shipped pause columns.
- **`communication_events`** (Phase-6 table) — **`recipient_email` (TEXT NULL)** with an **exclusive-arc CHECK** (`donor_id XOR missionary_id XOR recipient_email` present). _(Amended 2026-07-06: per the Phase 6 A5 amendment the column ships with Phase 6 T3; the re-groomed Phase 8 (#603) is only its first no-person writer — reconcile the final wording at the #603 re-groom.)_ Add `field_policies` census rows for any `communication_events.*` fields reaching export/Mission-Control surfaces.

**Reuse (no forks):** `crm_webhook_events` (inbound), `crm_reconciliation_runs` (sync runs), `crm_command_logs` (audit), `crm_outbound_jobs`, `crm_record_links`, `crm_projection_state`, `crm_merge_candidates` (surfaced as a count only).

**RLS-posture note (state to avoid a false "double-standard" review flag):** Phase-6's `communication_events` is deliberately **RLS-disabled** (service-layer + projection + non-null `tenant_id` enforce isolation), whereas Phase-8's own new tables use **composite keys + `FORCE` RLS**. Both are correct and coexist — the alert row inherits Phase-6's posture; the gate rows use Phase-8's stricter posture.

**Supabase RLS rules (mandatory on every new tenant table):** wrap the authz call as `(select has_staff_membership(...))` for `initPlan` caching (prefer the minimize-joins rewrite pushing the membership set into the subselect); **`TO authenticated`** on every policy; **one policy per operation** with a `WITH CHECK` so a member can't write under a different `tenant_id`; index only the non-leading policy columns (`provider`, `domain`, `status`, `donor_id`, the membership lookup) — not a redundant `tenant_id` index; the authz function is `stable security definer set search_path = ''` in a **private (non-exposed) schema**, `EXECUTE` to `authenticated` only; internal tables in a non-exposed schema and/or `revoke` from the Data API. **Migrations:** named CHECK constraints; `NOT VALID` → `VALIDATE` in separate statements under a short `lock_timeout`; plain `CREATE INDEX` on the brand-new empty tables; run the Supabase security advisors post-migration. **Reminder: FORCE RLS subjects the table owner only — it does _not_ stop `service_role`/`BYPASSRLS`;** real service-role containment is the private-schema + privilege-revoke + the non-BYPASSRLS scheduler role.

### E. Contracts / wiring

- **Readiness / gate API (thin admin routes → `packages/api`):** `GET /api/admin/crm/operations` (the read-model view); `POST /api/admin/crm/gate` (open/close a domain — through the operator-command lane, `two_party` reserved); `POST /api/admin/crm/kill-switch` (global stop). All Twenty access stays server-side; no credentials or raw Twenty UI reach the browser.
- **Inngest healer (mounted + registered in the admin app's `serve()` — with a runtime-smoke test asserting registration so it can't silently never-run):**
  - **Orchestrator** `crm-healer-scan` — cron (~`*/10`), `concurrency: [{ limit: 1 }]` (no overlapping ticks). Cursor-pages `crm_sync_settings` for enabled/not-paused `(tenant, domain)` pairs (`ORDER BY (tenant_id, domain) … > :cursor LIMIT ~50`), emits one `crm/healer.tenant.reconcile` event per pair via a single batched `step.sendEvent(id, events[])`, and a follow-up self-event with the next cursor if pages remain. Does **no** reconcile work; **never** enters tenant context.
  - **Worker** `crm-healer-reconcile` — trigger `crm/healer.tenant.reconcile`; `retries: 3`; `concurrency: [{ key: "event.data.tenantId", limit: 1–2 }]` (per-tenant bulkhead — keyed on `tenantId` only, even for `(tenant, domain)` events); `throttle: { limit: ~100, period: "60s" }` **unkeyed** (the shared single-Twenty-workspace budget — the in-process `MinuteRateLimiter` is per-run and is only a secondary in-run guard); each unit through `withTenant`; a per-run record cap (~100/domain, cursor-continue the rest); idempotent heals. On pause-clear, drain the backlog subject to the blast-radius cap + throttle.
- **Env-flag retirement (expand→migrate→contract):** the gate reads the legacy `CRM_SYNC_*_ENABLED` values as one initial input (expand); backfill `crm_sync_settings` and convert the ~12 call-sites + flag-injecting tests to read the store (migrate); delete the env reads with a **CI grep-test** that fails if a retired flag name reappears (contract). A removal task is filed from the start.
- **Kill-switch semantics:** flipping the global kill-switch stops **new** enqueues/worker starts; in-flight worker runs **drain at batch boundaries** by re-reading the pause flag (bounded by the per-run record cap — the drain window is one batch, ≤ the record cap).

### F. Architecture Decision Records

_ADRs to author with the docs ticket (context / decision / rationale / consequences):_

1. **Durable evidence-row write gate over code constants.** Fail-closed write-readiness is a persisted `(tenant, provider, domain)` fact, not an in-code boolean; it is the auditable answer to "why are writes blocked?"
2. **Deliberate gate vs. reactive health pause, OpenFeature-shaped, LaunchDarkly-consistent.** Two controls with different rhythms; per-write check is local-state-only; adopt the governance _shape_, not the enterprise machinery.
3. **Pre-adopt Phase-4 composite `(tenant_id, id)` keys + FORCE RLS.** Phase 4 ships first (hard block); the composite-FK isolation is worth the ordering constraint. Records the FORCE-RLS-≠-service_role-containment calibration.
4. **Multi-tenant healer via Inngest concurrency-key + unkeyed throttle.** Fan-out (one event per tenant) over a loop; per-tenant bulkhead + shared global provider budget; reuse the recovery-scan pattern.
5. **The auto-heal predicate.** `idempotent AND reversible AND non-money AND well-scoped` else escalate — one rule so new drift classifies itself; nothing money-adjacent or irreversible auto-acts.
6. **Alerts split: Sentry for machine failures, the single Phase-6 seam for human notifications.** The routing predicate + why a parallel email path is forbidden.
7. **Redaction by construction.** The ops read model contains only diagnostic/state facts; no money/donor detail can leak because it is never present.
8. **Notes write-enable persists a record-link; reads read-through; inbound deferred.** The minimum that makes the first live write accountable.
9. **Merge ownership is Phase 4.** Phase 8 reads + links, builds no workbench; record-link re-point honors the `merge_operations` contract.
10. **One provider idempotency contract.** Key includes the resolved record; reserve→call→persist ordering; a worked receipt-correction → re-notification example showing the disjoint key space from the Phase-7 versioned-idempotency chain.
11. **Operator-command-lane authorization.** Which role invokes gate-open vs. the global kill-switch; the `single | two_party` binding; how the Phase-3 audit spine records the action.

---

## Testing Decisions

Good tests assert **external behavior and safety invariants**, not implementation details — and because RLS failures and gate refusals are _silent by design_, isolation and fail-closed behavior must be asserted with `is_empty()`-style and refusal expectations, not error absence.

- **Permanent negative/safety tier (a failure fails the build):**
  - **Gate fail-closed** — `assertCrmWriteReady` refuses when _any_ condition is false, absent, or stale; with conformance flags false it refuses every domain; a **never-write-to-a-blocked-domain** structural assertion.
  - **Provider idempotency** — the key includes the resolved record; a post-merge/re-point replay does not double-create or write to the wrong record; same-key-different-body is loudly rejected.
  - **Cross-tenant isolation** (extends Phase-4's tier) — the multi-tenant healer, gate reads, and outbound never touch another tenant's rows despite service-role; a service-path test drives the real healer with tenant-A context against tenant-B rows.
  - **Fan-out safety** — per-tenant concurrency isolates a large tenant's backlog; the unkeyed throttle bounds aggregate Twenty call-rate; keying concurrency by `tenantId` (not domain) so a multi-domain tenant isn't multiplied.
  - **Pause hysteresis no-flap** — health oscillating at the boundary does not flap the pause; a single green does not clear; the per-write staleness guard refuses on a stale `last_known_health`.
  - **Dead-letter → escalation fires** — a dead-lettered job produces exactly one escalation (deduped), surfaces oldest-item-age, and does not silently loop.
  - **Notes round-trip** — a successful write persists the Twenty note id + `crm_record_link`; a failure sets `link_status='failed'`; a crash between write and link is a heal-able reconciler finding, not an orphan.
  - **Redaction wall** — the ops read model and every `crm_alert` body contain no amounts/donor-names/deductibility; a fixture that adds one fails.
- **Structural gates:** the env-flag retirement **CI grep-test**; a runtime-smoke test asserting the healer is in the served-function list; the Supabase security advisors (every RLS table has `FORCE` + ≥1 policy; no security-definer object in an exposed schema; unindexed-FK check).
- **Harness / prior art:** the **`@inngest/test`** harness for the orchestrator/worker (concurrency-key, throttle, retry, cursor-continue); a **Twenty provider-mock** strategy for gateway/schema/write round-trips; prior art — the shipped cross-tenant negative-test tiers, the recovery-scan cron functions, the outbound-idempotency tests, and the Phase-6 sole-seam lint.

---

## Out of Scope (reserved seams — documented, not built)

- **Any Twenty-side merge**, and **any merge/dedupe workbench** — owned by **Phase 4** (`#514`/`#512`/`#513`/`#507`); Phase 8 shows the duplicate count and links out.
- **Any money-domain write to Twenty** beyond Notes (people/orgs/churches/gifts stay read-only + gated).
- **Per-tenant Twenty workspaces** — one shared workspace today; the throttle stays unkeyed. When workspaces become per-tenant, re-key the throttle by `workspaceId` (no rewrite).
- **An event-driven (non-cron) healer**, **multi-tenant fan-out beyond the concurrency-key/throttle model already specified**, and **bidirectional Notes / inbound Twenty-side note-edit reconciliation** (a documented deferral surfaced by drift count).
- **A full report builder, per-tenant tunable thresholds, a rich cockpit, live polling**, and **Mailchimp/comms live sync**.
- **Raw Twenty UI / break-glass access** as a normal staff workflow (provider details live in advanced diagnostics only).
- **Live schema mutation of the provider** — Phase 8 verifies schema; it never mutates it.

---

## Further Notes

### Dependency Ledger

**Hard prerequisites (Phase 8 cannot ship until all are merged):**

- **Phase 4** — supplies composite `(tenant_id, id)` keys, `ENABLE`/`FORCE` RLS, the `withTenant` tenant-guard + the non-`BYPASSRLS` scheduler role the healer runs under, and the replayable `merge_operations` record. Phase 4 explicitly declares Phase 8 the consumer of its merge and forbids a second workbench.
- **Phase 6** — supplies `communication_events` + `recordCommunication` capture at the single `sendEmail` seam (the vehicle for every emailed alert). Phase 6 hard-depends on the Phase-3 consent gate and consumes Phase 4's identity graph (its auth-email capture additionally waits on Phase 4's #511 hook).
- **Phase 3 consent gate (PR #502, currently OPEN/unmerged)** — transitively hard via Phase 6's consent-gate prerequisite; listed among this PRD's header hard prerequisites.

**Inherited seams (consumed as designed):** Phase 3 (`field_policies`/export governance; role-scoped projection chokepoint; audit lane), Phase 7 (redaction wall + version-scoped idempotency), Phase 2 (tenant-scoped only, no `site_id`), Phase 0 (Built/Live/Confirmed).

**Graph:** `0 → 2 → 3 → 4 → 6 → 7` is an acyclic DAG; Phase 8 is a downstream sink of `{4, 6}` consuming `{3, 7, 2, 0}`. **No dependency cycle** (Phase 6's "Phase 1" predecessor is the shared reconcile-cron pattern, already in the repo — not a dependency on Phase 8's output). **Every Phase-8 ticket carries `status:blocked-on-[Phase 4 | Phase 6 | #502]`, exactly as Phase 7 documents.**

### Relationship to `phase-01-crm-operating-foundation.md`

Phase 8 **supersedes** the groomed-but-unbuilt `phase-01-crm-operating-foundation.md`, which described this same operating foundation under the old roadmap numbering and explicitly named the write-enable successor "Phase 8+." That file is tombstoned separately (a supersession pointer; retained for history). The `integrate-twenty-crm-core` **Phase-07 "Production Cutover & Operations" guide is cited, not superseded** — it is the operational cutover discipline (the 10-step domain cutover, frozen-domain catalog) that T2 follows.

### Twenty conformance (official-docs review)

Twenty is one shared workspace/API today (per-tenant workspaces reserved). Webhooks are at-least-once, HMAC-SHA256 signed over the raw body with the secret stripped, with **no vendor event id** (we synthesize the dedupe key) and no documented retry policy (the consumer owns idempotency + dead-lettering). There is **no native write idempotency and no REST upsert** — hence our provider-idempotency key + log. Merge is an irreversible hard-delete with no merge-specific webhook (hence merge stays in Phase 4, gated). There is **no API version/deprecation guarantee** — pin the release and make `providerVersionVerified` a live check.

### Best-practice grounding (verified this grill)

Validated against current official docs and modern practice: OpenFeature (provider-neutral evaluation + hooks) and LaunchDarkly/Unleash governance (governed flag vs. automatic kill-switch; flag-debt lifecycle); AWS/Microsoft multi-tenant noisy-neighbor + bulkhead + Inngest concurrency-key/throttle; AWS/Temporal retry-with-jitter, Merge.dev idempotency, Kubernetes level-triggered reconcile, Azure hysteretic circuit-breaker, Google SRE risk-and-reversibility automation limits; and the **official Supabase RLS performance + FORCE-RLS + migration guidance** captured in §D.

---

## Evidence & Acceptance

**Acceptance criteria (Phase 8 is "done" when):**

- [ ] A durable `crm_write_gates` row per `(tenant, provider, domain)` is the single source of truth for `assertCrmWriteReady`, published in Built/Live/Confirmed form; the gate is fail-closed on any false/absent/stale condition.
- [ ] Opening a domain requires a single authorized operator + a recorded reason + an auto-attached proof-of-health snapshot; the button is disabled with a plain reason when readiness is not green; `two_party` is available as a per-domain policy value.
- [ ] The per-write check reads local state only (no synchronous provider probe); a stale `last_known_health` refuses; the hysteretic pause trips on sustained failure and clears only after N consecutive green probes; the global kill-switch stops new work and in-flight drains at batch boundaries.
- [ ] The scheduled multi-tenant healer fans out one event per `(tenant, domain)`, is registered + smoke-tested, runs with a per-tenant concurrency key + an unkeyed global Twenty throttle + per-tenant/global blast-radius caps, and routes every unit through the tenant-guard.
- [ ] Auto-heal is limited to mechanical/idempotent/reversible/non-money drift by the predicate; money-adjacent drift, persistent orphan links, and duplicates escalate; nothing auto-merges; dead-letters produce exactly one deduped escalation.
- [ ] Non-email failures alert Sentry/error-channel (now wired server-side); emailed digested notifications route through the single Phase-6 seam as `staff_only`/`operational` `crm_alert` communication_events; the ops surface and alerts show diagnostic/state facts only (no money/donor).
- [ ] A read-only `/crm/operations` windowpane shows health verdict, per-domain gate/pause state, drift counts, dead-letter oldest-age, human-judgment list, and duplicate count (linking to Phase-4 `#514`), on a healer-written summary read model with a shown staleness bound and no polling.
- [ ] The `CRM_SYNC_*_ENABLED` env flags are retired via expand→migrate→contract with a merge-blocking CI grep-test.
- [ ] **T2:** the `notes` domain gate opens; a successful note write persists the Twenty note id + a `crm_record_link` (reconcilable/replayable/auditable); the provider-idempotency key includes the resolved record and a crash-recovery replay does not double-create; rollback (close gate) is reversible and already-written notes/links remain.
- [ ] The permanent negative/safety test tier is green; cross-tenant isolation, provider-idempotency, hysteresis, dead-letter escalation, notes round-trip, and redaction-wall each fail the build on violation; the Supabase security advisors pass.

**Evidence file** (Phase-2..7 style, authored at completion, Built/Live/Confirmed): migrations applied; the full test suite incl. the negative tier passing; route/API checks; the Supabase-advisor output. **Per-flag live-vs-built:** `writeIdempotencyVerified`, `webhookDedupVerified`, and `providerVersionVerified` **must be proven by a live Twenty round-trip, not fixtures** — else the gate opens on a design claim. The **Notes cutover artifact** is a **live write + read-back + link-persist proof**, with the Twenty version pinned; and an explicit list of what Phase 8 intentionally did **not** build (the reserved seams above).

---

## Tracking Issues (epic + children; created later via `/to-issues`)

Mirrors the Phase-2..7 structure. Foundation tickets first (`status:todo`); the rest `status:blocked` until their blockers land. **Every ticket additionally carries `status:blocked-on-[Phase 4 | Phase 6 | #502]` as applicable** (the hard-prereq gates). No `ready-for-agent` until dispatch.

- **Epic — Phase 8: CRM Operating Foundation**
- **T1** — Docs: this PRD, OpenSpec/glossary (`CONTEXT.md`) terms, the 11 ADRs, and the `phase-01` supersession tombstone. _(foundation)_
- **T2** — Data model: `crm_write_gates`, `crm_provider_idempotency_log`, the minimal provider health/schema-hash, the `crm_sync_settings` hysteresis columns, the `communication_events.recipient_email` + exclusive-arc CHECK, the `field_policies` census rows — all composite-key + FORCE RLS + the Supabase rules. _(foundation, blocked-on Phase 4)_
- **T3** — Readiness gate + write gate (`getCrmReadiness` / `assertCrmWriteReady` / `evaluateWriteGate`, fail-closed, proof-of-health), OpenFeature-shaped.
- **T4** — Hysteretic reactive pause + the global kill-switch + the per-write local-state check + the max-probe-age staleness guard.
- **T5** — Multi-tenant Inngest healer (orchestrator + worker: fan-out, concurrency-key, unkeyed throttle, blast-radius caps, `withTenant`, registration smoke-test).
- **T6** — Disposition policy (`resolveReconcileActions` + the predicate) + the bounded auto-heal executors + the six-category mapping.
- **T7** — Outbound hardening: provider-idempotency key + log (reserve→call→persist), single-layer retry, jitter/backoff/`Retry-After`, transient/terminal classification.
- **T8** — Alerting: Sentry/error-channel server-side wiring + `routeCrmSignals` + the dead-letter escalation consumer + the digested emailed-notification via the Phase-6 seam.
- **T9** — Operations read model + `/crm/operations` windowpane (summary rollup, staleness bound, no polling, duplicate-count link to `#514`) + the operational-events staff view. _(blocked-on Phase 6 for the emailed path)_
- **T10** — Operator-command lane (`runCrmOperatorCommand`: permission-union, `approval_policy`, idempotency, audit) + the two governed-action routes.
- **T11** — Env-flag retirement (expand→migrate→contract + CI grep-test + call-site/test conversion).
- **T12** — **Tranche 2 (Notes write-enable):** open the notes gate; persist note id + `crm_record_link` (extend the success path); cutover (live round-trip) + rollback.
- **T13** — Permanent negative/safety test tier + structural CI gates + the `@inngest/test` + Twenty-mock harness.
- **T14** — Phase 8 evidence file (Built/Live/Confirmed; per-flag live proof; the Notes cutover artifact).
