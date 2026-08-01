# ADR-0004: Entry-gated auto-send acknowledgments — no letter-review queues

**Status:** Accepted (founder ruling, Phase 14 grill session 2026-07-10 — D2)

> Full record: `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`,
> Section D (ratified decision D2; the founder ruled auto-send over the
> proposed review-queue option, hardened by the UX fleet `wf_12c9023f-c40`).
>
> **Authority amendment (2026-07-27):** The original ruling remains in force,
> but its historical delivery-shaped gift statuses are superseded by the
> cross-phase ownership contract below. Phase 14 owns acknowledgment purpose
> and readiness; Phase 6 exclusively owns dispatch, provider outcomes, and
> communication history.

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
an acknowledgment request associated with the gift whose Phase 14
`acknowledgment_request_state` is exactly
`not_applicable | held | ready | released | canceled`, with an
"Unacknowledged" work view derived by joining that request to Phase 6
communication outcomes, the Phase 6 consent gate with visible
suppression/failure events,
amount-omitted-by-default letters, longer holds for first-sends to new
parties, ambiguity holds forcing an explicit pick, imports never auto-send,
a "Sent automatically" outbox feed, and a re-attribute flow with an offered
correction notice. Fund-name memory (confirm-once rules with provenance
chips) is what makes confident identification possible; "Not Provided" gifts
land in the Attribution Inbox worklist.

`pending_send`, `sent`, `suppressed`, and `failed` are not gift or Phase 14
states. Once Phase 14 releases a ready request, Phase 17 owns the governed
message content and sender/reply configuration, while Phase 6 alone owns
scheduling, consent-at-dispatch, delivery outcomes, retries, and communication
history.

## Consequences

- Zero-touch happy path: a prefilled, evidence-chipped attribution is Tab
  past and done; silent-null attributions are impossible (unknowns are
  explicit options with visible consequences).
- Wrong-person blast radius is bounded by the hold window, amount omission,
  and the correction-notice idiom — not by a human reading every letter.
- Staff still see one coherent status surface, but it is a projection over the
  independently authoritative Phase 14 request and Phase 6 communication
  event; delivery truth is never copied back onto the gift.
- The same entry-gated pattern is the template for the matched-employee
  stream; tribute NOTIFICATIONS are explicitly excluded (more sensitive —
  see ADR-0005).
- Reintroducing a review queue anywhere in these streams is a reversal of
  this decision, not a tuning knob.
