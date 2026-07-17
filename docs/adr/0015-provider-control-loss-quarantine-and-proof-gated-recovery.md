# ADR-0015: Provider-control-loss quarantine and proof-gated recovery

**Status:** Accepted (founder ruling, Phase 16 grill session 2026-07-13 — D16)

> Full record: `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
> (ratified decisions D6, D15, and D16).

## Context

A disconnected or restricted Stripe account does not prove that every provider
executor stopped. Direct-charge subscriptions can continue outside Asym's
current access, a mutation can become indeterminate, and reconnecting access
does not prove that objects, events, commands, authorizations, or cash are
reconciled. A binary connected/disconnected flag would either issue unsafe work
or falsely tell donors that collection stopped.

## Decision

Maintain an evidence-derived internal control ladder: Managed, Degraded
observation, Control at risk, Control restricted, Control unknown, Reconciling,
and External/read-only. Keep donor intent, provider access, capabilities,
executor ownership, command posture, reconciliation, occurrence/payment state,
ledger truth, and audience projections as separate axes.

When control is unknown, restricted, or external, Asym immediately suppresses
new attempts, recovery slots, widening changes, replacement executors,
migrations, and stale-command replay. It does **not** claim that provider
collection stopped. One tenant/account incident owns the affected set, with a
low-latency cancellation-first queue instead of one task per recurring gift.
Donor stop instructions are accepted and timestamped immediately; the UI keeps
provider stop pending until current evidence proves it.

Same-binding recovery enters Reconciling and may release a cohort only after
**every live execution leg and every item-per-line binding in that cohort**
proves account, environment, application, merchant/executor identity, current
object state, accessible event gap, authorization, in-flight work, donor stops,
ledger effects, and no conflicting command. Per-binding proof is evidence, not
permission to expose a partially reconciled cohort. A different account,
merchant, or mode is a cutover: old-executor stop proof and any required fresh
authorization precede a new activation. Unknown remains suppressed or
read-only.

## Consequences

- Provider events route by signed top-level account plus livemode/environment;
  metadata never selects a tenant. Bindings are effective-dated and tenant-safe.
- Cash changes only from authoritative payment and ledger facts. Expected
  support is qualified separately when control cannot be proven.
- Staff see last verified truth and one safe next action; donors receive only
  material-impact communication; missionaries never see provider, KYC, payment,
  or incident internals.
- Durable inbox/outbox records, retrieve-after-write, CAS/fencing, bounded
  reconciliation, drift alerts, incident drills, and safe rollback are required.
- No automatic provider failover, universal distributed-control DSL, public
  seven-state jargon, or active-active replacement executor is built.
