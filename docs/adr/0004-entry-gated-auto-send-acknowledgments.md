# ADR-0004: Entry-gated auto-send acknowledgments — no letter-review queues

**Status:** Accepted (founder ruling, Phase 14 grill session 2026-07-10 — D2)

> Full record: `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`,
> Section D (ratified decision D2; the founder ruled auto-send over the
> proposed review-queue option, hardened by the UX fleet `wf_12c9023f-c40`).

## Context

DAF advisor thank-yous (and the streams that reuse the pattern) need a
send decision. The legacy-CRM norm is a letter-review queue; the modern
precedents (Bloomerang's send-at-entry, Little Green Light generating both
letters on save, industry-wide receipt auto-send) show the queue is ceremony.
The real quality gate is knowing WHO the letter goes to.

## Decision

**The identity decision at entry IS the review.** The staffer entering the
gift must fill a required attribution field — an identified household/donor,
"Not Provided", or "Anonymous" — and a confidently identified attribution
**auto-sends** the non-receipt thank-you. No letter-review queue exists.

Safety comes from **guardrails, not queues**: a hold-then-send window
(cancel from toast and gift record), an in-form disclosure line,
acknowledgment as a state on the gift (`pending_send / sent / held /
suppressed / failed / not_applicable`) with an "Unacknowledged" work view,
the Phase 6 consent gate with visible suppression/failure events,
amount-omitted-by-default letters, longer holds for first-sends to new
parties, ambiguity holds forcing an explicit pick, imports never auto-send,
a "Sent automatically" outbox feed, and a re-attribute flow with an offered
correction notice. Fund-name memory (confirm-once rules with provenance
chips) is what makes confident identification possible; "Not Provided" gifts
land in the Attribution Inbox worklist.

## Consequences

- Zero-touch happy path: a prefilled, evidence-chipped attribution is Tab
  past and done; silent-null attributions are impossible (unknowns are
  explicit options with visible consequences).
- Wrong-person blast radius is bounded by the hold window, amount omission,
  and the correction-notice idiom — not by a human reading every letter.
- The same entry-gated pattern is the template for the matched-employee
  stream; tribute NOTIFICATIONS are explicitly excluded (more sensitive —
  see ADR-0005).
- Reintroducing a review queue anywhere in these streams is a reversal of
  this decision, not a tuning knob.
