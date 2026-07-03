# Phase 1 — CRM Operating Foundation (PRD)

**Program:** SiteStacker Parity. **Phase:** 1 of the parity roadmap (CRM
truth). **Status:** decision-complete, ready for implementation.

> Phase 1 makes the CRM **trustworthy and safe-by-default** before any CRM depth
> is built on top of it. The CRM engine (Twenty CRM behind Asym server
> contracts) is already ~70% built at the data + service layer; Phase 1 is
> **surface + operationalize + harden**, not a rebuild. Production writes to
> Twenty stay **gated off**; record merge stays **deferred**.

This PRD assumes the guardrails, boundary specs, and Twenty-conformance
governance recorded by the parity program (see `README.md`, the
`platform-boundaries` / `platform-surfaces` specs, and the Twenty Conformance &
Deviation findings). It does not restate them.

---

## Problem Statement

From the staff and founder perspective:

The CRM engine works but nobody can trust it or see it. The self-healing
reconcile that is supposed to keep our records aligned with Twenty **only runs
when a human clicks a button** — there is no schedule, and nothing raises an
alarm when the system hits drift it cannot fix. So "self-healing" is a design
claim, not a running fact.

There is no single answer to "is the CRM healthy, degraded, or unsafe right
now?", and — more dangerously — no **machine-checkable guarantee** that stops a
later phase from switching on writes to Twenty while the integration is in a bad
state. Twenty is fragile in specific, documented ways: no API version or
deprecation guarantee, at-least-once webhook delivery with no vendor de-dup id,
no native write idempotency, and a record merge that hard-deletes the losing
record irreversibly. A failure in any of these can stay **invisible** until it
becomes data loss.

At the same time, staff must **not** be turned into a manual-repair crew staring
at a dashboard. The founder needs earned confidence that the CRM is safe before
investing in People & Churches depth, imports, reports, and donor/missionary
projections.

## Solution

From the user perspective:

Make the CRM trustworthy and safe-by-default, with the smallest surface that
achieves it.

1. **The self-healing reconcile runs on a schedule** (not on a human click) and
   automatically repairs the mechanical drift it is allowed to fix.
2. **The system raises its hand only when it must.** Real failures (Twenty
   unreachable, provider schema mismatch, a job that gave up) alert the existing
   error channel. Genuine human-judgment items (an ambiguous duplicate, a true
   conflict) surface on a thin read-only page. Steady state is **silence** — a
   green, empty screen means "working," not "unwatched."
3. **A machine-readable CRM readiness gate** answers "is the CRM safe to write
   to?" as data, and a **fail-closed** check guarantees no future phase can
   enable Twenty writes until the recorded safety preconditions are met.
4. **One thin `/crm/operations` window** (plus a nav health badge) shows the
   verdict and the short "needs-a-human" list — a windowpane, not a control
   room. It has no polling and no repair buttons.
5. **The Twenty webhook ingress is hardened** to match Twenty's exact signing
   scheme and to de-duplicate on a key we synthesize ourselves.

No staff repair actions, no production writes, no schema changes, and no raw
Twenty UI ship in this phase. Those are deliberately deferred behind the
readiness contract this phase establishes.

## User Stories

**Visibility & trust (CRM operator / founder)**

1. As a CRM operator, I want one clear health verdict for the CRM (healthy /
   degraded / blocked), so that I know at a glance whether anything needs
   attention.
2. As a CRM operator, I want the verdict to come with plain-language reasons, so
   that "degraded" or "blocked" tells me _why_, not just a color.
3. As a CRM operator, I want a health badge in the Mission Control nav, so that I
   can see CRM status from anywhere without opening a page.
4. As a CRM operator, I want a single `/crm/operations` page that shows the
   verdict, the readiness flags, and the short "needs-a-human" list, so that I
   have one place to look when something asks for me.
5. As a CRM operator, I want that page to load on open and refresh only when I
   ask, so that it is a status window I visit — not a monitor I am expected to
   babysit.
6. As a CRM operator, I want the page to deep-link to the existing projection
   drift dashboard and the latest reconcile summary, so that I can dig into
   detail without the page duplicating those views.
7. As a founder, I want the steady state of the CRM to be a green, empty screen
   with no alerts, so that "no news" reliably means "the system is handling it."
8. As a founder, I want to trust that the CRM is safe before we build more on it,
   so that parity depth is built on solid ground rather than hope.

**Self-healing reconcile (the platform as actor / operator)**

9. As the platform, I want to run the CRM reconcile automatically on a schedule
   per configured tenant, so that drift is detected and repaired without a human
   remembering to trigger it.
10. As the platform, I want to auto-heal the mechanical drift categories (e.g.
    stale projections, stalled jobs) myself, so that routine misalignment never
    reaches a person.
11. As the platform, I want to fast-escalate money-adjacent drift, so that
    gift-link problems are surfaced quickly rather than quietly retried forever.
12. As the platform, I want to give up after a bounded number of attempts and
    dead-letter an item, so that a stuck case is escalated rather than retried
    indefinitely.
13. As a CRM operator, I want to know if the scheduled healer itself stops
    running, so that a silent scheduler failure cannot hide every other problem.
14. As the platform, I want every automatic repair recorded in the audit log
    with the system as the actor, so that "no repair without an audit trail"
    holds even when no human is involved.

**Alerting split (on-call engineer / operator)**

15. As an on-call engineer, I want true failures (Twenty unreachable, provider
    schema mismatch, dead-lettered job) to alert the error channel, so that I am
    paged for things that are actually broken.
16. As an on-call engineer, I want ambiguous duplicates and true conflicts to
    stay _off_ the error channel, so that judgment calls do not train me to
    ignore real alarms.
17. As a CRM operator, I want human-judgment items to appear on the operations
    page from the latest reconcile snapshot, so that I can find them when I look.
18. As a CRM operator, I want the system to escalate to the error channel only if
    the judgment queue goes stale (nobody is looking), so that important items
    are not lost while normal ones stay quiet.
19. As an on-call engineer, I want alerts de-duplicated per tenant and category,
    so that one recurring condition does not spam the channel.

**Readiness gate & safety interlock (operator / future write-enable phase)**

20. As a CRM operator, I want a readiness object that reports the individual
    safety flags (provider reachable, schema matches, reconcile clean, sync not
    paused), so that I can see exactly which precondition is unmet.
21. As an engineer building the future write-enable phase, I want a
    fail-closed `assertCrmWriteReady(tenant, domain)` check, so that writes to
    Twenty cannot be enabled while any safety precondition is false, absent, or
    stale.
22. As an engineer, I want the Twenty verify-before-ship preconditions
    (write-idempotency verified, webhook-dedup verified, merge dry-run verified)
    represented as readiness flags that start false, so that the conformance
    review becomes an enforced gate rather than a document.
23. As an engineer, I want the readiness object consumable as plain data, so that
    a CI or deploy check can assert it programmatically, not just a human eye.
24. As a founder, I want the gate to refuse everything in Phase 1 (all
    conformance flags false), so that the interlock is proven to block _before_
    any write path exists.

**Operator-command lane (contract-only)**

25. As the platform, I want the auto-healer to perform its writes through one
    canonical operator-command lane (permission + idempotency + audit + typed
    result), so that the first real writer already runs on the durable contract
    all future writes will use.
26. As an engineer building later phases, I want a single command seam that new
    state-changing actions plug into, so that write concerns (authorization,
    idempotency, audit) are solved once, not re-implemented per feature.

**Webhook hardening (engineer / platform)**

27. As the platform, I want to verify each Twenty webhook against Twenty's exact
    signing scheme (raw request body, secret field stripped, timestamp-prefixed
    HMAC-SHA256, timing-safe comparison), so that forged or malformed deliveries
    are rejected and valid ones are never wrongly dropped.
28. As the platform, I want to de-duplicate inbound webhooks on a key we
    synthesize ourselves (since Twenty provides no delivery id), so that
    at-least-once redelivery cannot double-apply an event.

**Access & multi-hat**

29. As a staff member who is also a donor and a missionary, I want CRM operations
    access to be granted by the union of my roles, so that holding a donor or
    missionary hat never removes staff access I am entitled to.
30. As a plain donor with no staff role, I want to be denied CRM operations
    access, so that operational surfaces stay staff-only.

**Boundaries / negative guarantees**

31. As a founder, I want no production writes to Twenty in this phase, so that no
    irreversible change can occur while we are still establishing trust.
32. As a founder, I want no record merges in this phase, so that Twenty's
    irreversible hard-delete-on-merge cannot cause data loss yet.
33. As a security-conscious founder, I want no raw Twenty UI or credentials
    exposed to staff or the browser, so that Twenty stays fully behind Asym
    server contracts.
34. As a founder, I want no schema changes to the live CRM in this phase, so that
    the provider data model is only verified, never mutated.
35. As a donor, I want none of my private data to leak into missionary-facing
    projections as a result of this work, so that the surface boundary holds.

## Implementation Decisions

### Scope posture

- **Read + system-heal only.** Phase 1 ships **no staff write-actions**. The only
  writer is the platform's own auto-healer. Duplicate classification, manual
  single-item replay UI, and the filterable audit timeline UI are deferred.
- **One tenant, from config.** The scheduled reconcile runs for a single
  configured Twenty workspace. Multi-tenant fan-out is deferred until a second
  tenant exists (there is no "active tenants" list to fan out over today).
- **No database migration.** The Twenty conformance flags ship as code constants
  (all false); the persisted per-domain write-gate evidence columns are deferred
  to the write-enable phase. Phase 1 introduces no schema.
- **New route.** The surface is a new `/crm/operations` page in Mission Control
  plus a nav health badge — the cheapest always-visible consumer of the verdict.
  It reuses existing projection-dashboard components and links out for detail;
  it is a windowpane, not a control room.

### Deep modules (tested in isolation)

**A. CRM Readiness Gate** — the safety interlock, in the admin CRM API layer.

- `getCrmReadiness(tenantId)` composes the **live flags** (`gatewayOk`,
  `schemaOk`, `reconciliationClean`, `syncNotPaused`) with the **conformance
  constants** (`writeIdempotencyVerified`, `webhookDedupVerified`,
  `mergeDryRunVerified`, all false in Phase 1) and derives one verdict plus
  reasons.
- `assertCrmWriteReady(tenantId, domain)` is **fail-closed**: any flag that is
  false, absent, or stale means "not ready." In Phase 1 it refuses everything.
- Decision shape (encodes the contract precisely):

  ```
  CrmReadiness = {
    verdict: "healthy" | "degraded" | "blocked",
    reasons: string[],
    live: { gatewayOk, schemaOk, reconciliationClean, syncNotPaused },      // booleans
    conformance: { writeIdempotencyVerified, webhookDedupVerified,
                   mergeDryRunVerified },                                    // all false in Phase 1
  }
  ```

  Verdict rule: `blocked` if `gatewayOk` or `schemaOk` is false; `degraded` if a
  reconcile is mid-work or sync is paused; otherwise `healthy`.

**B. Reconcile Action Policy** — the heal-vs-escalate judgment, in the CRM
reconciliation module.

- `resolveReconcileActions(findings, policy)` is a **pure** mapping from the six
  projection-drift categories to `{ autoHealed, escalated, deadLettered }`. It
  encodes: auto-heal the safe categories; fast-escalate money-adjacent drift;
  give up after N attempts → dead-letter. It is decoupled from the scheduler and
  from the actual repair executions, which are thin I/O around it.

**C. Signal / Alert Router** — the alerting split, in the admin CRM API layer.

- `routeCrmSignals(readiness, reconcileOutcome)` is a **pure** function producing
  `{ sentryEvents, humanQueueItems, staleEscalations }`. Real failures →
  error-channel events; human-judgment items → the page queue; escalate to the
  error channel only when the queue is stale. The thin wrapper performs the
  actual emit and de-duplicates per tenant + category.

**D. Operator-Command Lane** — the durable write seam, in the CRM commands
module. Contract-only in Phase 1.

- `runCrmOperatorCommand(command, actor, ctx)` performs permission checks
  (role-union via the existing CRM access helper), idempotency-key handling, an
  **audit write** to the command log, and returns a typed result/failure. In
  Phase 1 the **only** caller is the system auto-healer; the human command
  surface is deferred, but the lane is built so future writes plug straight in.

**E. Twenty Webhook Verify + De-dup** — correctness-critical, hardening the
existing CRM webhooks module.

- `verifyTwentyWebhookSignature(rawBody, headers, secret)` reproduces Twenty's
  exact documented scheme: HMAC-SHA256 over the **raw** received body with the
  `secret` field stripped, timestamp-prefixed, compared timing-safely.
- `deriveWebhookDedupKey(payload)` synthesizes a stable de-dup key (record id +
  event + changed fields) because Twenty provides no per-delivery id.

### Thin wiring (integration / e2e, not deep-unit)

- **Scheduled reconcile function** — a recurring Inngest cron modeled on the
  existing recovery-scan functions, mounted in the **admin** app's Inngest
  serve endpoint. It reads the single configured tenant, runs the existing
  reconcile engine, applies `resolveReconcileActions`, executes the safe repairs,
  and hands the outcome to `routeCrmSignals`. A companion **cron-liveness**
  signal alerts if the scheduler stops.
- **Operations read-model** — `getCrmOperationsView(tenantId)` composes the
  readiness object, the needs-a-human queue (from the latest reconcile
  snapshot), and a reconcile summary for the page.
- **Provider health reachability** — `getTwentyCrmHealth` is made callable
  server-side in production (today it is dev-only-gated), so `schemaOk` is
  observable where it matters. This is a reachability fix, not a new route.
- **UI** — a new `/crm/operations` route (thin), a Suspense page shell, a
  browser-side page client using TanStack Query (load-on-open, manual refresh,
  **no polling**), a `useAdminCrmOperationsView` hook, and a nav health badge.
  TanStack DB is intentionally **reserved** as the future realtime-upgrade path;
  Phase 1 uses plain Query.

### Key architectural rulings

- **One source of truth for the gate.** The readiness object is a pure read layer
  over existing services plus the conformance constants; the persisted
  per-domain write-gate evidence lives with the (deferred) write-enable phase.
  No two constructs track the same gate; in Phase 1 there is no persisted gate
  state at all.
- **Twenty stays behind Asym contracts.** All Twenty access remains server-side
  in `packages/api`; app routes stay thin re-exports; no Twenty credentials or
  raw Twenty UI reach the browser.
- **Deliberate deviations are recorded.** Where Twenty is silent (webhook
  delivery guarantees, API versioning) we implement our own approach and record
  it against the conformance findings; the readiness conformance flags are the
  enforced expression of the verify-before-ship preconditions.

## Testing Decisions

**What makes a good test here:** assert observable behavior through each module's
public interface — inputs to outputs — never its internals. The five deep
modules are designed as pure or near-pure functions specifically so they can be
tested in isolation with fixtures, without standing up Twenty, Inngest, or the
UI.

**Modules under test (all five deep modules):**

- **A. Readiness Gate** — given each combination of live flags and conformance
  constants, the verdict and reasons are correct; a false/absent/stale flag makes
  `assertCrmWriteReady` refuse; with all conformance flags false the assert
  refuses **every** domain (the interlock is proven before any write path
  exists). This is the priority suite.
- **B. Reconcile Action Policy** — given drift-finding fixtures for each of the
  six categories, items are bucketed correctly into auto-heal / escalate /
  dead-letter, including the give-up-after-N boundary and money-adjacent
  fast-escalation.
- **C. Alert Router** — given readiness + reconcile-outcome fixtures, failures
  route to error-channel events, judgment items route to the page queue, and a
  stale queue produces an escalation; nothing judgment-shaped leaks to the error
  channel.
- **D. Operator-Command Lane** — a command with an authorized actor writes an
  audit record and returns a typed success; an unauthorized actor (role-union
  correctly evaluated, including multi-hat) is refused; a repeated idempotency
  key does not double-apply.
- **E. Webhook Verify + De-dup** — a correctly signed sample Twenty payload
  verifies; a tampered body, wrong secret, or altered timestamp fails; the de-dup
  key is stable for the same logical event and distinct across events.

**Boundary / integration coverage (lighter):** the scheduled reconcile wiring
end-to-end on fixtures; `assertCrmWriteReady` refusing writes captured as
evidence; a smoke check that the operations page renders the verdict and the
needs-a-human list; a data-boundary check that no donor-private field crosses
into a missionary projection.

**Prior art:** the existing unit-test suite (Vitest) already covers CRM services;
model the pure-function suites on existing reconciliation/replay tests and the
webhook-signature verification style, and the permission tests on the existing
`requireCrmAccess` coverage.

## Out of Scope

Explicitly **not** built in Phase 1 (each deferred deliberately, on the record):

- Any **production write** to Twenty; any **record merge**.
- **Staff repair actions:** duplicate confirm/reject classification (command,
  permission, and the `confirmed_pending_merge` state), manual single-item replay
  UI, and the filterable staff audit timeline UI. (The audit **write** stays; only
  the reader UI is deferred.)
- **Multi-tenant fan-out** of the scheduled healer.
- **Persisted per-domain write-gate evidence columns** and any database
  migration.
- The **operator kill-switch** (sync-pause writer) — deferred to write-enable,
  where there is finally a write to pause.
- Rich cockpit features: live polling, an auto-heal activity feed, a standing
  audit panel, per-tenant tunable thresholds, and per-row triage deep-links to
  routes that do not exist.
- **Raw Twenty UI / break-glass** access of any kind.
- People & Churches record depth, relationship depth, donor/missionary CRM
  projections, imports, reports, bulk replay — later phases.
- Live schema mutation of the provider (Phase 1 verifies schema; it never
  mutates it).

## Further Notes

- **Why the pivot.** An earlier design proposed a full operations "cockpit." An
  adversarial evaluation (four independent lenses) unanimously found most of it
  to be over-engineering for a self-healing, write-gated, low-traffic phase, and
  surfaced the real gap: the self-healing loop was never scheduled and never
  alerted. This PRD reflects the corrected, minimal scope — schedule the healer,
  alert on exceptions, expose a fail-closed gate, and ship one thin window.
- **Twenty conformance governance.** Default is to conform to Twenty as
  documented; deliberate deviations (our own webhook idempotency; our own API
  version-pinning discipline) are recorded against the conformance findings. The
  three verify-before-ship preconditions (write idempotency, webhook dedup, merge
  dry-run) are represented as the readiness conformance flags and must be
  verified against the live Twenty workspace before the write-enable phase flips
  them true.
- **Realtime upgrade path.** The needs-a-human queue and feeds are shaped as
  clean collections so the client layer can later swap from TanStack Query
  polling to a TanStack DB live-query collection for realtime auto-heal updates —
  a localized change, deferred until incident volume warrants it.
- **OpenSpec.** A Phase 1 OpenSpec change entry under
  `openspec/changes/sitestacker-parity/` must be drafted; per repo rules,
  OpenSpec sits at the top of the source-of-truth order.
- **ADR candidates:** (1) Twenty as a backing provider behind Asym contracts with
  deliberate-deviation governance; (2) the CRM readiness gate as a fail-closed
  write-enable interlock.
- **Follow-up work (drafting, no new decisions):** consolidated acceptance
  criteria per build item, the Phase 1 evidence file (including the captured run
  proving `assertCrmWriteReady` refuses), the OpenSpec entry, the parity-matrix
  update for area 1, and the GitHub ticket breakdown.

## Tracking issues

Dependency-ordered. Opened as `status:todo` (no `ready-for-agent` until dispatch).

- #466 — Make the Twenty provider health check reachable in prod _(foundation)_
- #467 — Reconcile Action Policy `resolveReconcileActions` (module B)
- #468 — Operator-command lane `runCrmOperatorCommand` (module D, contract-only)
- #469 — Twenty webhook signature verification + de-dup hardening (module E)
- #470 — CRM Readiness Gate `getCrmReadiness` + `assertCrmWriteReady` (module A) — dep #466
- #471 — Signal/alert router `routeCrmSignals` + Sentry emit (module C) — deps #467, #470
- #472 — Scheduled self-healing reconcile (Inngest cron) + liveness alert — deps #467, #468, #471
- #473 — CRM operations read-model `getCrmOperationsView` — dep #470
- #474 — Thin `/crm/operations` page + nav health badge — dep #473
- #475 — OpenSpec change entry + parity-matrix update (CRM foundation)
- #476 — Phase 1 evidence file — deps all build tickets
