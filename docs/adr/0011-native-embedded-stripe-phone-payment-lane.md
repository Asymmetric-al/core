# ADR-0011: Native embedded Stripe phone-payment lane

**Status:** Accepted (founder ruling, Phase 15 grill session 2026-07-11 — D4)

> Full record: `docs/prds/sitestacker-parity/phase-15-offline-gift-batch-entry.md`
> (ratified decision D4 + its Stripe-deep-dive hardening amendments A16–A18).

## Context

Staff need to take a full card or ACH gift over the phone during a live donor
call. The market answer — bounce staff out to a Stripe Dashboard or virtual
terminal — forces copy-paste, orphan charges, and manual record-linking. The
permanent safety principle is that Asym never renders, proxies, logs, stores,
or processes a raw card/bank number. Reviewers over-rotated on it to forbid
even a Stripe-hosted iframe; the Stripe deep dive confirmed the founder's
instinct that a staff-keyed Payment Element is SAQ-A, not SAQ-D.

## Decision

**A phone gift is a native-in-Asym flow where Stripe owns the sensitive
field.** Card: an embedded Payment Element that staff key into, then a
server-confirm carrying `payment_method_options[card][moto]=true`, reusing the
existing PaymentIntent + saga + webhook → staged-gift seam and auto-linking
via PaymentIntent metadata; repeat donors charge a saved method off-session.
ACH: a mid-call Financial Connections donor-tap (WEB mandate, async
settlement) as primary, plus a bounded staff-keyed TEL lane (Stripe beta +
recording/retention + legal review + single-use, never-store-raw) as
secondary. Every phone gift is an ONLINE gift written by the Stripe webhook —
never an offline batch money row. It runs on the ratified full Stripe Connect
substrate (Phase 13): delete the plaintext tenant key, detect capabilities via
`account.capabilities`, revoke via `account.application.deauthorized`.

## Consequences

- A Stripe-hosted iframe keyed by staff is explicitly permitted (SAQ-A;
  number goes browser→Stripe); a raw PAN/bank `<input>` Asym JS can read stays
  permanently forbidden — the invariant the whole lane rests on.
- Phone/MOTO/hosted-link gifts flow through the webhook → staged-gift seam,
  so they are never double-counted as offline batch money rows.
- MOTO is Stripe-support-gated per connected account with no liability shift;
  the lane must gate + detect + degrade (falls back to ordinary CNP confirm).
- Phone-ACH cannot settle on the call (NACHA reality); the donor taps once on
  their own device, and the receipt fires only on `succeeded`.
- Consciously accepted: the online `card.moto` REST flag is absent from the
  public reference and needs a Stripe-support/test-probe confirmation at build.
- Overlaps Phase 13's ratified-but-unwritten Connect topology — a
  program-level ADR gap to close, not a fresh P15 decision.
