# Phase 8 — CRM Operating Foundation

> **Program:** SiteStacker Parity · **Phase:** 8 · **Status:** Re-groomed (grill-with-docs, 2026-07-07; ADR-0001, #603) · **Base:** `develop`
> **Subtitle:** _CRM Operations Observability & Data-Health Foundation_
> **Roadmap:** [`roadmap.md`](./roadmap.md) slot 8 (Roadmap v2). Phase 40 (Data Stewardship / AI) hard-depends on the data-health-signal catalog this phase defines.
> **Dependencies (re-derived at the #603 re-groom):** **no hard prerequisite** for the build-now core — it observes Asym's own already-shipped runtime and the Phase-4 merge queue. **Phase 9** gates the party-graph-health sockets; **Phase 6** gates the emailed-alert seam + the missing-consent socket. See [Dependency Ledger](#dependency-ledger).
> **Supersedes:** `docs/prds/sitestacker-parity/phase-01-crm-operating-foundation.md` (tombstoned separately).
> **Charter / roadmap / matrix:** `README.md`, `roadmap.md`, `phase-map.md`, `parity-matrix.md`

> **Re-groom record (2026-07-07 — resolves the ADR-0001 scope-amendment banner; #603).**
> [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) retired Twenty CRM: **Asym Postgres owns all CRM truth**, so there is no external provider to write to, gate, probe, sync, or reconcile against. That removes the entire premise of this phase's original write-enable half. This PRD is **re-groomed, not patched**: the phase is reframed from _"safely open the first write to a backing provider"_ to _"make the CRM's own operations and data health visible, escalate what the shipped self-healing can't fix, and route alerts."_ The write-enable machinery is **withdrawn** (see [§ Withdrawn by ADR-0001](#withdrawn-by-adr-0001)); the surviving concerns are re-scoped against **Asym-internal subjects only**. Grill decision log: scratchpad `phase8-regroom-grill.md` (D1–D6). This record replaces — never silently deletes — the prior scope-amendment banner.

Modern SiteStacker parity for **making the CRM layer trustworthy, visible, and staff-operable before deeper CRM depth is built on top of it** — now that the CRM **is** Asym Postgres. This is an **observability + escalation + data-health-signal foundation**, not a rebuild and not a new self-healing engine: Asym's background-work runtime already self-heals its own jobs (durable Inngest recovery scans, dead-letter + replay ledgers, a notification-policy console). Phase 8 **surfaces** that runtime in one place, **escalates** what it cannot fix, **routes** alerts, and **defines the CRM data-health catalog** that Phase 40 later builds its AI stewardship product on. The steady state is a **green, empty operations screen**: "no news" reliably means "the system is handling it."

---

## Withdrawn by ADR-0001

The following were the Twenty-write-enable spine of the original (2026-07-06) grooming. Twenty's retirement removes the thing each one existed to do, so each is **withdrawn**; the dormant code is removed by cleanup ticket **#602**.

- **The write gate** — `crm_write_gates`, `getCrmReadiness`/`assertCrmWriteReady` as a _write_ interlock, the OpenFeature-shaped `evaluateWriteGate` seam, per-domain `approval_policy`, proof-of-health-at-gate-open. _(No provider ⇒ nothing to gate.)_
- **Provider idempotency** — `crm_provider_idempotency_log`, the resolved-record idempotency key, the reserve→call→persist ordering. _(No provider write.)_
- **The reactive pause as a write control** and the **global "stop all outbound writes" kill-switch**. _(No outbound writes.)_
- **Provider health / schema-hash probing** and `provider_version_verified`. _(No provider to probe.)_
- **Notes write-enable (Tranche 2)** and its live-Twenty round-trip evidence. _(Issue #599 closed 2026-07-06.)_
- **Five of the six reconcile categories** — `orphanLinks`, `staleProjections` (shadow copies _of Twenty data_), `stalledJobs` (outbound _to Twenty_), `failedWebhooks` (inbound _from Twenty_), `giftLinkDrift` (Asym↔Twenty). Only `duplicateCandidates` survives (Phase-4-owned; surfaced here as a count). _(→ #602.)_
- **The "Twenty conformance" section** and the env-flag retirement as a Phase-8 tranche — the `CRM_SYNC_*_ENABLED` flags are deleted with the dormant sync stack by **#602** (which folds in #598's CI-grep kernel).

**Reframed, not withdrawn:** the "CRM Healer" is redefined as the shipped recovery machinery this phase _observes_ plus one reserved Phase-9 heal (re-project a stale derived view); the "Disposition Predicate" survives only as the rule governing that one reserved heal.

---

## Problem Statement

Staff cannot answer basic operational questions about the CRM without asking an engineer: _Is the CRM healthy? Are background jobs stuck or dead-lettered? Are Stripe webhooks failing? Is the duplicate/merge backlog growing? Is any data-quality signal red? What needs a human?_ The CRM data/service layer and the durable background-work runtime are built, but there is **no operations surface above them**, and three concrete gaps block confident CRM depth on top:

1. **There is no single, plain-language operations view.** Health lives in logs and scattered per-domain consoles (a workflow-summaries table, a notification-policy console, the Stripe raw-event ledger). No one screen answers "is the CRM healthy, and if not, what and where?"
2. **The runtime self-heals its own jobs, but nothing escalates what it can't.** The shipped Inngest recovery scans re-drive stalled sagas, dispatch requests, and Stripe events; dead-letters and replay ledgers exist. But a dead-letter that no scan recovers, a duplicate backlog that no one is working, or (post-Phase-9) a derived view that keeps going stale has **no escalation path** — it sits invisibly until someone notices.
3. **There is no defined CRM data-health catalog.** "Is the CRM's data healthy?" has no answer because no one has enumerated the signals (merge backlog, RLS/advisor coverage, and — after Phase 9 — party-spine integrity and derived-view staleness). Phase 40's AI stewardship needs that catalog as its foundation and cannot build on an undefined one.

If we build deeper CRM depth before this operating foundation exists, staff operate blind, escalations are silent, and the data-quality layer has nothing to stand on.

## Solution

An **Asym-owned CRM operations observability and data-health foundation** that makes CRM health, background-runtime state, and data-quality signals **visible and trustworthy from inside Mission Control**, and routes what needs a human. It **reuses** the shipped self-healing runtime rather than forking a second one. Its shape:

1. **One read-only `/crm/operations` windowpane** — a plain-language health verdict (healthy / degraded / blocked) with reasons; per-signal counts and ages; a short "needs-a-human" list; the duplicate/merge backlog count linking to the Phase-4 Merge UI. Load-on-open, no polling, green-when-empty.
2. **Escalation over the shipped recovery** — the runtime keeps auto-recovering its own jobs; Phase 8 adds the **escalation consumer** that turns an unrecovered dead-letter (and other "needs-a-human" signals) into exactly one deduped, aging-tracked item, so nothing loops silently.
3. **Alert routing** — real machine failures page the **Sentry/error channel**; digested human-judgment notifications go through the **single Phase-6 `sendEmail` seam** as `staff_only`/`operational` `crm_alert` events. Diagnostic/state facts only — never amounts, donor names, or deductibility.
4. **The CRM data-health catalog** — the enumerated set of health signals (build-now: runtime health, merge backlog, RLS/advisor coverage; reserved: party-spine integrity, derived-view staleness, missing-consent) that this phase defines and Phase 40 later builds its stewardship product on.
5. **One reserved active heal** — re-projecting a stale derived view (a Phase-9 concept), governed by the Disposition Predicate. It is the _only_ net-new heal Phase 8 owns, and it lights up with Phase 9.

Underneath, the foundation **reuses everything already built** — the Inngest recovery scans, the dispatch/dead-letter ledgers, the notification-policy console, the Phase-6 send seam, tenant-scoped RLS — and adds no competing job-runner. The steady state is a **green, empty operations screen**.

---

## User Stories

### Staff operator — visibility & trust

1. As a **CRM operator**, I want one plain-language health verdict (healthy / degraded / blocked) with the reasons, so that I know the state of the CRM at a glance without reading logs.
2. As a **CRM operator**, I want a nav health badge, so that CRM status is always visible without opening a page.
3. As a **CRM operator**, I want a single read-only `/crm/operations` window showing runtime health (dead-letter counts + oldest age, recovery-scan status, Stripe-webhook backlog), the duplicate/merge backlog, data-quality signal counts, and a short "needs-a-human" list, so that I can triage without a control room.
4. As a **CRM operator**, I want the operations page to load on open and refresh only when I ask, so that it never becomes a noisy dashboard I must babysit.
5. As a **CRM operator**, I want a green, empty operations screen in steady state, so that "no news" reliably means "the system is handling it."
6. As a **CRM operator**, I want the count of duplicate candidates with a link to the Phase-4 Merge UI, so that I know cleanup is pending without a second merge tool living here.

### On-call engineer — alerting & escalation

7. As an **on-call engineer**, I want true machine failures (a dead-lettered job no scan recovered, a repeated recovery failure, an advisor regression) to alert the error channel, so that I am paged for things that are actually broken.
8. As an **on-call engineer**, I want ambiguous/judgment items to stay _off_ the error channel and on the operations page, so that judgment calls do not train me to ignore real alarms.
9. As an **on-call engineer**, I want an unrecovered stuck case to escalate as exactly one deduped, aging-tracked item, so that dead-letters get a human instead of silently looping.
10. As a **staff operator**, I want a digested (not per-event) email notification of judgment/escalation items, so that I am informed without alert fatigue.

### The platform — reuse, self-healing & safety

11. As the **platform**, I want Phase 8 to **reuse** the shipped Inngest recovery scans and dead-letter/replay ledgers rather than fork a second healer, so that there is exactly one job-runner and one recovery mechanism.
12. As the **platform**, I want the one net-new heal (re-project a stale derived view) to run only when it is idempotent, reversible, non-money, and well-scoped, so that an automated wrong guess on an irreversible thing is impossible. _(This is the Disposition Predicate, now scoping one reserved heal.)_
13. As the **platform**, I want money-adjacent drift, persistent duplicates, and anything failing the predicate to **escalate — never auto-act**, so that nothing irreversible is automated.
14. As the **platform**, I want every reserved heal and every escalation scan routed through the tenant-guard and bounded by a per-tenant/global blast-radius cap, so that a bug can never mass-act across tenants.

### Finance / auditor — safety of the surface

15. As **finance**, I want the operations page and every alert to show diagnostic/state facts only — never amounts, donor names, or deductibility — so that money detail can never leak through an ops channel.
16. As an **auditor**, I want any operator action on the surface (acknowledge/snooze an escalation) recorded with who/when/why, so that the surface is not a silent side channel.

### Founder / organization

17. As a **founder**, I want the steady state to be quiet and self-healing and the operations surface to be one coherent Mission-Control window, so that staff operate one product, not a control room.
18. As the **organization**, I want the CRM data-health catalog defined now, so that the later data-quality and AI-stewardship work (Phase 40) has a foundation to build on.

---

## Implementation Decisions

### A. Architecture rulings (the settled re-groom decisions)

- **A1 — Observability-first; reuse the shipped recovery, do not fork a healer.** _(D2.)_ Asym's background-work runtime already self-heals its own jobs (`donation-saga-recovery`, `dispatch-recovery-scan`, `stripe-event-processing` reconcile, `inbound-email-processing`) and carries dead-letter + replay ledgers (`workflow_dispatch_requests`, `stripe_raw_events`) and a notification-policy/summaries console. Phase 8 **reads** that runtime into one operations view and **escalates** what it does not recover. It builds no second scheduler, pool, or recovery scan for Asym's own jobs. _(ADR 1.)_
- **A2 — The CRM data-health catalog is the durable deliverable.** _(D3.)_ Phase 8 enumerates the health signals: **build-now** — background-runtime health (dead-letters/oldest-age, recovery-scan status, Stripe-webhook backlog, saga-outbox health), the duplicate/merge backlog (count + oldest-candidate age), and RLS/advisor coverage (all CRM tables FORCE-RLS + ≥1 policy; no security-definer in an exposed schema) as a periodic advisor-run signal; **reserved** — party-spine integrity and derived-view staleness (← Phase 9) and missing-consent (← Phase 6). Phase 40 builds its data-quality queues on this catalog. _(ADR 2.)_
- **A3 — Escalation is exactly-once and aging-tracked.** A signal that needs a human (an unrecovered dead-letter, a persistent duplicate backlog, a failing advisor check) produces **one** deduped escalation entry per `(tenant, source, key)`, records it to avoid re-escalation, and surfaces oldest-item age. Nothing silently loops. _(ADR 3.)_
- **A4 — Alerts split by channel, both wired.** Non-email machine/infra failures → the **Sentry/error channel** (wired server-side in this phase; absent in `packages/api` today). Emailed digested judgment/escalation **notifications** → the **single Phase-6 `sendEmail` seam** via `recordCommunication`, as a `communication_event` (`kind='crm_alert'`, `visibility='staff_only'`, `retention_class='operational'`, `actor='system'`, recipient by email with **no** person link). Routing predicate: _machine failures page Sentry; human-judgment notifications go through the one send seam._ _(ADR 4.)_
- **A5 — Redaction by construction.** The `/crm/operations` read model and every alert body carry **only diagnostic/state facts** (health verdict, counts, ages, signal names) — they structurally never contain amounts, donor names, or deductibility. The redaction wall is enforced by _what the read model includes_, not by policy filtering. _(ADR 5.)_
- **A6 — Merge ownership stays in Phase 4.** Phase 8 builds **no** merge/dedupe workbench; the duplicate/merge UI, execution, and receipt-integrity fix live in Phase 4 (`#514`/`#512`/`#507`/`#506`/`#516`, per Phase-4 §G). Phase 8's ops surface shows the duplicate **count** and links to the Phase-4 Merge UI. _(ADR 6.)_
- **A7 — One reserved active heal, governed by the Disposition Predicate.** _(D2.)_ The only net-new heal Phase 8 owns is **re-projecting a stale derived view** (a Phase-9 concept). It runs only when **`idempotent AND reversible AND non-money AND well-scoped`**; anything failing any clause escalates. Pre-Phase-9 there is nothing to re-project, so this is a reserved socket. The predicate is a rule, not the engine of a new healer. _(ADR 7.)_
- **A8 — A light, audited operator affordance; no fail-closed write gate.** _(D4.)_ The original governed write-levers (open a domain gate; global write kill-switch) are **withdrawn** — there is no write path to gate. What survives is at most a **reversible, audited "acknowledge / snooze an escalation"** action on the ops surface, recorded through the existing `crm_command_logs` (who/when/why). No `single|two_party` approval machinery and no fail-closed interlock ship in this phase. _(ADR 8.)_
- **A9 — Tenant-guard on every service-role path.** Every escalation scan, reserved re-projection heal, and read-model rollup runs through the **`withTenant()` tenant-guard** as a non-`BYPASSRLS` role so RLS applies; new tables (below) adopt composite `(tenant_id, id)` keys + ENABLE/FORCE RLS. This preserves the Phase-4 posture where Phase-4 has shipped, and threads an explicit `tenantId` where it has not. _(ADR 9.)_

### B. Deep modules (`packages/api/src/crm`)

Each is a deep module — a simple, testable interface hiding real complexity — with thin app routes calling in. **Note:** the Twenty-specific modules (`client/`, `gateway.ts`, `schema/twenty-object-model.ts`, `sync/`, `webhooks/twenty.ts`) are **dormant** and removed by #602; Phase 8 adds no code to them.

- **`operations` read model** — `getCrmOperationsView(tenantId)` composes the health verdict + the data-health catalog signals (read from the shipped runtime ledgers + the Phase-4 merge-candidate count + the advisor-run status) into the windowpane summary, from a **summary rollup written at the end of each escalation scan**, with a shown staleness bound. A dedicated **operational-events view** exposes no-person `crm_alert` rows to staff (they cannot render on a CRM person's Activity tab).
- **`health`** (reframe the existing `crm/health.ts`) — `getCrmHealthVerdict(tenantId)` returns `healthy | degraded | blocked` + reasons, composed from the catalog signals. No provider probe.
- **`escalation`** — `scanEscalations(tenant)` groups unrecovered dead-letters + persistent data-quality signals into deduped, aging-tracked entries; `acknowledgeEscalation` / `snoozeEscalation` (the A8 affordance, audited); the digested emailed-notification builder that calls the Phase-6 seam.
- **`alerting`** — `routeCrmSignals(healthVerdict, escalations)` → `{ sentryEvents, emailedNotifications, humanQueueItems }`; the Sentry/error-channel server-side wiring.
- **`dataHealth` (catalog contract)** — the enumerated signal set + each signal's reader; build-now readers wired, Phase-9/Phase-6 readers reserved (return "not-yet-available" until their source ships). This is the contract Phase 40 consumes.
- **`reservedHeal` (Phase-9-gated)** — the stale-derived-view re-projection, behind the Disposition Predicate; ships inert until Phase 9's derived views exist.
- **`commands` (reuse the existing command-log)** — `acknowledge/snooze` only; no gate-open, no kill-switch.

### C. Predecessor plug-ins (no parallel systems)

- **Phase 6 (soft — for the emailed path + a reserved socket).** Emailed alerts are captured at the single **`sendEmail` seam** via `recordCommunication` — never a parallel send path (the sole-seam CI lint would fail). Phase 8 uses the `crm_alert` kind and its `operational`/`staff_only` defaults; a no-person send is Phase-6's explicitly-modeled A5 case. The **missing-consent** data-health signal is a reserved socket that lights up with Phase 6. Until Phase 6 ships, alerting routes to Sentry only and the emailed path + consent signal stay reserved.
- **Phase 4 (soft — posture + the merge count).** New Phase-8 tables adopt Phase-4's composite `(tenant_id, id)` keys + FORCE RLS and route service-role paths through `withTenant`; the ops surface reads the Phase-4 `crm_merge_candidates` count and links to the Phase-4 Merge UI. **No write-gate depends on the merge contract** (the write gate is withdrawn), so Phase 4 is no longer a hard blocker for the build-now core.
- **Phase 9 (gates the reserved sockets).** Party-spine-integrity + derived-view-staleness signals and the one reserved re-projection heal light up only after Phase 9 ships the party graph and derived views.
- **Phase 3 (inherited).** `field_policies`/export governance classify any `communication_events.*` field reaching export/Mission-Control surfaces; the role-scoped projection chokepoint keeps `staff_only` events off donor/missionary surfaces; the audit spine records the acknowledge/snooze action (identifiers-only).
- **Phase 7 (inherited).** The redaction wall (never amounts/donor-names/deductibility to non-owner parties) is honored by A5's redaction-by-construction.
- **Phase 2 (inherited).** CRM operates at **tenant scope only** — the operations surface carries `tenant_id`, no `site_id`.
- **Phase 0 (inherited).** Evidence follows **Built / Live / Confirmed** discipline.

### D. Data model

The write-enable tables are **withdrawn** (`crm_write_gates`, `crm_provider_idempotency_log`, the provider health/schema-hash record — none ship). Net-new is small:

**Net-new tables (composite `(tenant_id, id)` PK, `ENABLE` + `FORCE` RLS, Supabase RLS-performance rules below):**

- **`crm_operations_summary`** — the healer/scan-written rollup backing `getCrmOperationsView` (avoids recomputing on every page load). `tenant_id`, `id`, `computed_at`, `health_verdict` (TEXT+CHECK `healthy|degraded|blocked`), `signals` (JSONB — per-signal counts/ages), `staleness_bound`. One current row per tenant (upsert).
- **`crm_escalations`** — deduped, aging-tracked "needs-a-human" items. `tenant_id`, `id`, `source` (TEXT+CHECK: `dead_letter|duplicate_backlog|advisor|derived_view|…`), `dedupe_key`, `first_seen_at`, `last_seen_at`, `acknowledged_at`, `acknowledged_by_profile_id`, `snoozed_until`, `state` (TEXT+CHECK `open|acknowledged|snoozed|resolved`). `UNIQUE (tenant_id, source, dedupe_key)`.

**Reuse (no forks):** `crm_command_logs` (the acknowledge/snooze audit), `crm_merge_candidates` (surfaced as a count), `crm_reconciliation_runs` (the surviving `duplicateCandidates` category only), plus the shipped runtime ledgers `workflow_dispatch_requests` and `stripe_raw_events` (read-only, for the runtime-health signals). **Not created:** `crm_write_gates`, `crm_provider_idempotency_log`, any provider-health table.

**Phase-6-owned (not created here):** `communication_events.recipient_email` + its exclusive-arc CHECK ship with **Phase 6 T3** (per the Phase-6 A5 amendment); Phase 8 is only a no-person _writer_ of that column via the seam — it does not add the column.

**Phase 17 privacy supersession (2026-07-19).** The preceding ownership/writer
claim is withdrawn: Phase 8 MUST NOT write a recipient address into
`communication_events`, and Phase 6 T3 MUST NOT ship that durable address column
for new governed events. If a legacy deployment already has it, the bounded
Phase 6 migration fences writers, backfills only independently proved authority
references, and purges remaining values. Phase 8 may pass an unresolved
destination only into encrypted, short-lived delivery material through the
guarded seam; durable history remains body-free and address-free.

**RLS-posture note:** Phase-6's `communication_events` is deliberately RLS-disabled (service-layer + projection + non-null `tenant_id` enforce isolation); Phase-8's own `crm_operations_summary`/`crm_escalations` use composite keys + FORCE RLS. Both are correct and coexist.

**Supabase RLS rules (mandatory on every new tenant table):** wrap the authz call as `(select has_staff_membership(...))` for `initPlan` caching; **`TO authenticated`** on every policy; one policy per operation with a `WITH CHECK`; index the non-leading policy columns (`source`, `state`), not a redundant `tenant_id` index; the authz function is `stable security definer set search_path = ''` in a private (non-exposed) schema, `EXECUTE` to `authenticated` only. **Migrations:** named CHECK constraints; `NOT VALID` → `VALIDATE` in separate statements; run the Supabase security advisors post-migration. **FORCE RLS subjects the table owner only — it does not stop `service_role`/`BYPASSRLS`;** real containment is the private-schema + privilege-revoke + the non-BYPASSRLS scheduler role.

### E. Contracts / wiring

- **Ops API (thin admin routes → `packages/api`):** `GET /api/admin/crm/operations` (the read-model view); `POST /api/admin/crm/escalations/:id/acknowledge` and `.../snooze` (the A8 affordance, audited). No gate/kill-switch routes. All access stays server-side.
- **Escalation scan (Inngest, reuse the recovery-scan pattern):** a cron **`crm-escalation-scan`** (~`*/10`, `concurrency: [{ limit: 1 }]`) that cursor-pages tenants, reads the shipped runtime ledgers + merge-candidate counts + advisor status, writes `crm_escalations` (deduped) and the `crm_operations_summary` rollup, and emits digested notifications through the Phase-6 seam. It **triggers no recovery of its own** — the runtime's existing recovery scans keep doing that; this scan only _observes and escalates_. Registered in the admin `serve()` with a runtime-smoke test asserting registration.
- **The reserved re-projection heal (Phase-9-gated):** wired inert now (returns "no derived views yet"); lights up when Phase 9 ships derived views, running under the Disposition Predicate + the tenant-guard + a blast-radius cap.

### F. Architecture Decision Records

_ADRs to author with the docs ticket (context / decision / rationale / consequences):_

1. **Observability-first: reuse the shipped recovery, do not fork a healer.** Why a second scheduler/scan next to the shipped Inngest recovery is the "two healers for one runtime" failure mode; what Phase 8 reads vs. builds.
2. **The CRM data-health catalog as the durable deliverable.** The enumerated signal set (build-now vs reserved) and why Phase 40 depends on it.
3. **Exactly-once, aging-tracked escalation.** Dedupe by `(tenant, source, key)`; nothing loops silently.
4. **Alerts split: Sentry for machine failures, the single Phase-6 seam for human notifications.** The routing predicate + why a parallel email path is forbidden.
5. **Redaction by construction.** The ops read model contains only diagnostic/state facts.
6. **Merge ownership is Phase 4.** Phase 8 reads + links, builds no workbench.
7. **One reserved active heal under the Disposition Predicate.** Re-project a stale derived view; `idempotent AND reversible AND non-money AND well-scoped` else escalate; Phase-9-gated.
8. **A light audited operator affordance; no fail-closed write gate.** Why the write-levers are withdrawn and what "acknowledge/snooze" replaces them with.
9. **Tenant-guard on every service-role path; Phase-4 posture without a hard write-gate dependency.**
10. **ADR-0001 supersession record.** What the original Phase 8 withdrew and why (the retirement keystone applied to this phase).

---

## Testing Decisions

Good tests assert **external behavior and safety invariants**, not implementation details — and because RLS failures are _silent by design_, isolation must be asserted with `is_empty()`-style expectations, not error absence.

- **Permanent negative/safety tier (a failure fails the build):**
  - **Cross-tenant isolation** (extends Phase-4's tier) — the escalation scan, ops read model, and reserved heal never touch another tenant's rows despite service-role; a service-path test drives the real scan with tenant-A context against tenant-B rows.
  - **Escalation exactly-once** — an unrecovered dead-letter produces exactly one deduped escalation, surfaces oldest-item age, and does not re-escalate on the next scan.
  - **Redaction wall** — the ops read model and every `crm_alert` body contain no amounts/donor-names/deductibility; a fixture that adds one fails.
  - **Reserved-heal gating** — the re-projection heal is inert until a derived view exists; when it runs it obeys the Disposition Predicate (a non-idempotent/irreversible/money/over-scoped case escalates instead of acting).
  - **Reuse, not fork** — a structural assertion that Phase 8 registers no second recovery scan for Asym's own jobs (it observes the shipped ones).
- **Structural gates:** a runtime-smoke test asserting the escalation scan is in the served-function list; the Supabase security advisors (every RLS table has `FORCE` + ≥1 policy; no security-definer object in an exposed schema; unindexed-FK check).
- **Harness / prior art:** the **`@inngest/test`** harness for the escalation scan (cursor-continue, dedupe, throttle); prior art — the shipped cross-tenant negative-test tiers, the recovery-scan cron functions, and the Phase-6 sole-seam lint.

---

## Out of Scope (reserved seams — documented, not built)

- **Any provider write, gate, probe, mirror, or reconcile** — Asym Postgres owns all CRM truth (ADR-0001); there is no provider. The dormant Twenty stack is removed by **#602**.
- **Any merge/dedupe workbench** — owned by **Phase 4** (`#514`/`#512`/`#513`/`#507`); Phase 8 shows the count and links out.
- **A new self-healing engine for Asym's own jobs** — the shipped Inngest recovery scans own that; Phase 8 observes + escalates.
- **Party-spine-integrity + derived-view-staleness signals and the re-projection heal** as _built_ — reserved sockets that light up with **Phase 9**.
- **The missing-consent signal** and the emailed-alert path as _built_ — gated on **Phase 6**.
- **The data-quality queue product, AI stewardship, and global search** — **Phase 40** builds those on the catalog this phase defines.
- **A full report builder, per-tenant tunable thresholds, a rich cockpit, live polling.**

---

## Further Notes

### Dependency Ledger

**Re-derived at the #603 re-groom (the write path is gone, so the write-enable-driven hard prerequisites no longer bind):**

- **No hard prerequisite for the build-now core.** The operations windowpane, escalation, and Sentry alerting observe Asym's already-shipped runtime (`workflow_dispatch_requests`, `stripe_raw_events`, the recovery scans, the notification-policy console) and the Phase-4 `crm_merge_candidates` count — all of which exist or ship independently. Phase 8's own two small tables adopt the Phase-4 RLS posture but depend on no Phase-4 _contract_.
- **Phase 6 (soft)** — supplies the `sendEmail` seam for the emailed-alert path and gates the missing-consent signal; until it ships, alerting is Sentry-only.
- **Phase 9 (gates reserved sockets)** — party-spine-integrity + derived-view-staleness signals and the one reserved re-projection heal.
- **Phase 3 consent gate (PR #502)** — consulted at the seam (a no-op for a staff/system alert with no donor); relevant only once the emailed path lights up with Phase 6.

**Graph:** the build-now core is a leaf that reads shipped infrastructure; the reserved sockets are downstream of `{6, 9}`. No dependency cycle. **This is a softening of the original ledger:** the original Phase 8 hard-blocked on Phase 4 + Phase 6 because of the write gate; with the write gate withdrawn, the build-now core can proceed independently, and only the reserved sockets carry `status:blocked-on-[Phase 6 | Phase 9]`.

### Relationship to `phase-01-crm-operating-foundation.md`

Phase 8 **supersedes** the groomed-but-unbuilt `phase-01-crm-operating-foundation.md` (tombstoned separately; retained for history).

### Best-practice grounding (verified this grill)

The Kubernetes/SRE **level-triggered reconcile + observe, heal only what is safe and reversible** posture — applied honestly given that the reconcile loops for Asym's own jobs already ship (so Phase 8 observes and escalates rather than re-implementing them). Alert-fatigue discipline (machine failures page; judgment items stay off the pager) from Google SRE. The redaction-by-construction and tenant-guard rules carry over from the original grill's Supabase RLS + Phase-3/4/7 grounding.

---

## Evidence & Acceptance

**Acceptance criteria (Phase 8 is "done" when):**

- [ ] A read-only `/crm/operations` windowpane shows a plain-language health verdict + reasons, per-signal counts/ages (runtime dead-letters + oldest age, recovery-scan status, Stripe-webhook backlog, duplicate/merge count linking to Phase-4 `#514`, advisor status), and a "needs-a-human" list — on a scan-written summary rollup with a shown staleness bound and no polling; green-and-empty in steady state.
- [ ] The CRM data-health catalog is defined and its build-now signals wired; the party-spine/derived-view and missing-consent signals are registered reserved sockets (inert until Phase 9 / Phase 6).
- [ ] The escalation scan reuses the shipped recovery (forks no second recovery scan for Asym's own jobs), produces exactly one deduped, aging-tracked escalation per `(tenant, source, key)`, and routes every scan/heal unit through the tenant-guard under a blast-radius cap.
- [ ] Non-email machine failures alert Sentry/error-channel (now wired server-side); emailed digested notifications route through the single Phase-6 seam as `staff_only`/`operational` `crm_alert` events (once Phase 6 ships); the ops surface and alerts show diagnostic/state facts only (no money/donor).
- [ ] The one reserved active heal (stale-derived-view re-projection) is wired inert and obeys the Disposition Predicate when Phase 9's derived views exist; nothing money-adjacent or irreversible auto-acts.
- [ ] The acknowledge/snooze affordance records who/when/why through `crm_command_logs`; no write gate, provider-idempotency, or kill-switch ships.
- [ ] The permanent negative/safety test tier is green — cross-tenant isolation, escalation exactly-once, redaction wall, reserved-heal gating, and the reuse-not-fork structural assertion each fail the build on violation; the Supabase security advisors pass.

**Evidence file** (Phase-2..7 style, authored at completion, Built/Live/Confirmed): migrations applied; the full test suite incl. the negative tier passing; route/API checks; the Supabase-advisor output; and an explicit list of what Phase 8 intentionally did **not** build (the reserved seams above) — **no live provider round-trip exists or is required** (the provider is retired).

---

## Tracking Issues (epic #587 + children #588–#601)

**Re-scoped at the #603 re-groom.** Foundation tickets first (`status:todo`); reserved-socket tickets carry `status:blocked-on-[Phase 6 | Phase 9]`. No `ready-for-agent` until dispatch. The original Twenty-write-enable tickets are closed or re-scoped as below (each carries an ADR-0001 / re-groom comment).

- **Epic #587 — Phase 8: CRM Operations Observability & Data-Health Foundation** _(re-scoped)_
- **T1 · #588** — Docs: this re-groomed PRD, the 10 ADRs, CONTEXT.md operating-term resolution, the `phase-01` supersession tombstone. _(foundation, re-scoped)_
- **T2 · #589** — Data model: `crm_operations_summary` + `crm_escalations` (composite-key + FORCE RLS + the Supabase rules). _(foundation, re-scoped — the write-gate/provider-idempotency/provider-health tables are dropped)_
- **T3 · #590** — **CLOSE** (readiness/write gate withdrawn — no provider write).
- **T4 · #591** — **CLOSE** (reactive pause / global write kill-switch withdrawn — no outbound writes).
- **T5 · #592** — Operations read model + `/crm/operations` windowpane (health verdict, catalog signals, merge count, needs-a-human list; scan-written rollup, staleness bound, no polling) + the operational-events staff view. _(re-scoped from "healer" — reuses shipped recovery; centerpiece)_
- **T6 · #593** — Disposition Predicate as the rule governing the **one reserved** Phase-9 re-projection heal (wired inert). _(re-scoped, blocked-on-Phase 9)_
- **T7 · #594** — **CLOSE** (outbound-to-Twenty hardening / provider idempotency withdrawn).
- **T8 · #595** — Alert routing: Sentry/error-channel server-side wiring + `routeCrmSignals` + the escalation consumer (deduped, aging-tracked) + the digested emailed notification via the Phase-6 seam. _(re-scoped to Asym-internal; the emailed path is blocked-on-Phase 6)_
- **T9 · #596** — The CRM data-health **catalog contract** (`dataHealth` module: build-now readers wired, Phase-9/Phase-6 readers reserved) — the foundation Phase 40 consumes. _(re-scoped from "operations read model", now the catalog contract; #595/#592 consume it)_
- **T10 · #597** — The light audited **acknowledge/snooze** affordance over `crm_command_logs`. _(re-scoped from the operator-command lane — the gate-open/kill-switch governed actions are withdrawn)_
- **T11 · #598** — **CLOSE** as folded into **#602** (the `CRM_SYNC_*_ENABLED` flags are deleted with the dormant sync stack; #602 owns the CI-grep kernel).
- **T12 · #599** — **CLOSED 2026-07-06** (Notes write-enable withdrawn).
- **T13 · #600** — Permanent negative/safety test tier + structural CI gates (`@inngest/test`; cross-tenant isolation, escalation exactly-once, redaction wall, reserved-heal gating, reuse-not-fork). _(re-scoped — provider-idempotency/notes-round-trip/gate-fail-closed tests dropped)_
- **T14 · #601** — Phase 8 evidence file (Built/Live/Confirmed; no live-provider round-trip — the provider is retired). _(re-scoped)_
