# ADR-0005: Setup-gated automated tribute digests on a decay cadence

**Status:** Accepted (founder ruling, Phase 14 grill session 2026-07-10 — D3)

> Full record: `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`,
> Section F (ratified decision D3, Option B + 14 hardening amendments from
> the adversarial pass `wf_d2a57022-c30`).
>
> **Authority amendment (2026-07-27):** The tribute cadence and coverage
> ruling remains in force. The historical reference to rendering on “both
> engines” is superseded by Phase 18's clean production contract: a bounded
> evidence contest may select at most one exact production renderer, and the
> production runtime never operates two rendering engines in parallel.

## Context

Tribute/memorial notifications are the most sensitive letters the platform
sends — condolence mail to a grieving family. Per-gift zero-gate auto-notify
exists in market (DonorDock) but is unsafe; a fully manual letter flow does
not scale and silently starves families of the notifications they asked for.
Research (ADRP decay ladder, practitioner interviews) supports front-loaded
then decaying frequency, names-never-amounts content, and print-first
delivery.

## Decision

**One deliberate human moment, then automation.** Tribute setup is the gate:
a staffer confirms notify parties, channels, and preferences once; from then
on, consolidated letters compose automatically on a **decay cadence** —
age-anchored pace (weekly in tribute weeks 0–4, then ≥28-day gaps), stored as
`next_due_at` advanced at mint. **No automatic stop ever**: an uncovered gift
always eventually composes (a gift years later simply rides the monthly
pace). Letters carry donor **names, never per-gift amounts**; the single
governed exception is the opt-in frozen aggregate total
(`tribute_aggregate_total`, monotonic floor — a family never sees the
memorial shrink). Coverage truth is the explicit `tribute_notification_items`
ledger at (notify party, header) grain, written in the letter's transaction.
Honor tributes send immediately; memorial digests ship last, per-tenant
enable, default OFF. Imported tributes arrive stopped.

## Consequences

- Families get told reliably without staff remembering; staff get worklists
  ("Tributes awaiting setup") instead of letter queues; the D2 guardrail set
  (holds, states, outbox feed, imports-never-send) is reused verbatim.
- The (notify party, header) coverage grain makes tribute merges and
  "Mom and Dad watch two tributes" safe — a watcher is told once.
- Notify preferences (`stream_default / immediate / monthly / once / never`,
  plus a per-party pause) are a market first; `never` is a suppression-grade
  fact.
- The no-auto-stop rule means cadence, not lifecycle heuristics, is the only
  thing that ends letters — closing a stream is always a human act.
- Render paths enforce the notification document-class allowlist with
  render-refusal on the single Phase 18 production renderer before the first
  letter ships. Any losing spike implementation is removed or kept strictly
  outside production; there is no dual-renderer runtime or failover path.
