# ADR-0009: Validate = post by default, with risk-scaled auto-route

**Status:** Accepted (founder ruling, Phase 15 grill session 2026-07-11 — D5)

> Full record: `docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`
> (ratified decision D5 + its hardening amendments Amd 1–14 and the
> 4 founder micro-choices).
>
> **Authority amendment (2026-07-27):** The low-friction validate-to-post
> ruling remains in force, but the historical combined money-and-receipt
> wording is superseded by the settled cross-phase authority chain. Phase 15
> posts accepted source occurrences only; downstream receipt facts, artifacts,
> content, and delivery remain independently authoritative.

## Context

Offline gift/batch entry needs a commit contract. The conventional
enter → approve → post ceremony (a mandatory second approver) is friction on
the ordinary case — most gifts are settled-on-entry checks and cash keyed by
trusted staff — yet a naive zero-gate auto-post lets a mis-keyed gift mail a
real IRS tax receipt before anyone looks. A decision was needed on where the
safety should live.

## Decision

**Validate posts by default.** The canonical Phase 15 lifecycle is
`draft → validated → posted`. When a tenant policy or risk rule requires a
reviewer, the one conditional branch is
`validated → awaiting_approval → posted`; `awaiting_approval` is not imposed
on ordinary batches. There is no general `approved`, `finalized`, or
`exported` batch state.

Posting is one guarded, revision-pinned, idempotent transaction through the
single Phase 15 money-writer, and it creates accepted source occurrences
only. It does not create a receipt or send a message. Phase 7 derives legal
receipt facts and eligibility; Phase 14 owns acknowledgment purpose and
readiness; Phase 18 owns the canonical document artifact; Phase 17 owns
governed message content, sender profile, and reply configuration; and Phase 6
alone owns consent-at-dispatch, scheduling, provider outcomes, retries, and
communication history.

The removed blanket pre-post review is replaced by risk-scaled, always-on
controls: high-risk gifts (large amount / brand-new donor / cash / backdated)
auto-route to the conditional reviewer branch even in default mode; a
new-operator soft guard routes a user's first batches to review then
auto-graduates; a detective floor (actor stamp, recently-posted feed, anomaly
signals) plus one surviving preventive rule — money-OUT above a threshold is
not self-approvable by the poster.

## Consequences

- Ordinary gifts carry no mandatory ceremony; safety is evidence-triggered
  (risk routing + new-operator guard) and detective, not blanket.
- Control-total balance is a validation predicate _inside_ validate — auto-post
  can never drop it; an unbalanced batch blocks absent a governed override.
- A bounded donor-invisible hold may delay a downstream acknowledgment release
  and provide a one-click cancellation path before dispatch, but it never
  rolls back, renames, or fuses the posted source occurrence with delivery
  state.
- Exactly one per-batch confirmation ("Post N gifts?"), never per row, is the
  deliberate moment for the irreversible source-posting act. Receipt and
  message previews may be summarized there without claiming they are posted
  or sent in the same transaction.
- One lifecycle and one posting service serve both paths; tenant policy selects
  whether `awaiting_approval` is traversed. Accounting export belongs to Phase
  20 and never locks or mutates the Phase 15 batch.
- The founder UX rider governs presentation, not control existence — low
  friction is the consciously-accepted tradeoff, carried by opt-in + detection.
