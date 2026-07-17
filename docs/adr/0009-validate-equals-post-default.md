# ADR-0009: Validate = post by default, with risk-scaled auto-route

**Status:** Accepted (founder ruling, Phase 15 grill session 2026-07-11 — D5)

> Full record: `docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`
> (ratified decision D5 + its hardening amendments Amd 1–14 and the
> 4 founder micro-choices).

## Context

Offline gift/batch entry needs a commit contract. The conventional
enter → approve → post ceremony (a mandatory second approver) is friction on
the ordinary case — most gifts are settled-on-entry checks and cash keyed by
trusted staff — yet a naive zero-gate auto-post lets a mis-keyed gift mail a
real IRS tax receipt before anyone looks. A decision was needed on where the
safety should live.

## Decision

**Validate is the post.** When staff validate a gift-entry batch it posts
immediately, and for settled-on-entry tenders (check/cash/settled card) tax
receipts fire immediately via the durable outbox; the second approver becomes
**opt-in per tenant**, not the default. The removed pre-post review is replaced
by risk-scaled, always-on controls: high-risk gifts (large amount / brand-new
donor / cash / backdated) auto-route to a brief review even in default mode; a
new-operator soft-guard routes a user's first batches to review then
auto-graduates; a detective floor (actor stamp, recently-posted feed, anomaly
signals) plus one surviving preventive rule — money-OUT above a threshold is
not self-approvable by the poster. Commit is one guarded, revision-pinned,
idempotent transaction through the ONE money-writer, with a short receipt
catch-window as the recall safety.

## Consequences

- Ordinary gifts carry no mandatory ceremony; safety is evidence-triggered
  (risk routing + new-operator guard) and detective, not blanket.
- Control-total balance is a validation predicate _inside_ validate — auto-post
  can never drop it; an unbalanced batch blocks absent a governed override.
- The receipt catch-window is donor-invisible and gives a one-click recall for a
  fat-finger before the email leaves; the gift date is unchanged.
- Exactly ONE per-batch confirm ("Post N gifts, email M receipts now?"), never
  per row — the one deliberate moment for the irreversible money+receipt act.
- Policy over ONE state machine / commit service / receipt rail: no second code
  path, and the approve node is never deleted (forward-compat).
- The founder UX rider governs presentation, not control existence — low
  friction is the consciously-accepted tradeoff, carried by opt-in + detection.
