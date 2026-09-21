# ADR-0013: Explicit recurring groups and compatible billing cohorts

**Status:** Accepted (founder ruling, Phase 16 grill session 2026-07-12 — D2)

> Full record: `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
> (ratified decisions D2–D5 and D14–D16).

## Context

Donors often support more than one destination in one recurring-giving action.
Mapping every line to a separate provider subscription preserves line control
but creates multiple invoices and charges that a visual grouping cannot hide.
Mapping every donor to one subscription makes unrelated authorizations and
schedules accidentally share fate. Grouping by donor, email, payment method, or
date is also unsafe because none of those facts proves one donor instruction.

## Decision

Create a **recurring-giving group only by explicit donor or authorized staff
action**. It contains stable, destination-specific recurring commitment lines
for one tenant, Commitment Party, legal payer/collection-authorizer context, and
currency. A mismatch in any group-level invariant creates a separate group.
Within the group, a **billing cohort** contains only lines that can truthfully
share connected account and Customer, reusable authorization lineage, cadence,
anchor, collection behavior, provider capability, and provider limits.

The Stripe adapter uses explicit execution legs under a compatible cohort.
Ordinary cadences normally use one leg/subscription; twice-monthly uses two
monthly legs/subscriptions, one for the 1st and one for the 15th. Every line owns
one exact subscription-item binding in every applicable leg. Amount,
designation, planned end, and ending a line are line-scoped. Payment method,
charge date, pause, skip, resume, and failed-payment recovery are cohort-scoped
unless a previewed, effective-dated split first isolates the line. A group may
contain multiple cohorts only for a real executor incompatibility or provider
limit, and donor review must show the exact charge count, amounts, and dates.

Group totals and summary status are derived. Provider replacement creates a new
execution-binding epoch without changing the Asym group or line identity. No
group is inferred or merged from shared attributes, and imported topology is
preserved or quarantined when it cannot be proven.

## Consequences

- The common compatible multi-destination ordinary-cadence gift produces one
  understandable charge while retaining stable line identity and allocation
  truth; twice-monthly truthfully discloses its two scheduled charges.
- Cohort-scoped actions must name every affected line; a line-only exception may
  require a durable split saga rather than an in-place item edit.
- Exact leg/item IDs, invoice-line allocations, immutable provider-binding
  epochs, and per-cohort serialization are mandatory; code must never assume
  `items[0]` or that every cadence has one leg.
- The Phase 13 one-subscription-per-line default and inferred donor/account group
  uniqueness are superseded by the dated Phase 16 congruence amendment.
- No generalized billing-topology optimizer, arbitrary cross-group merge, or
  hidden normalization engine is built in v1.

**Phase 24 D65 amendment (2026-08-30).** A pre-acceptance **Donor
Gift-Schedule Transition** changes one editable cart line, not a recurring
group or accepted agreement. Its primary effect is line-scoped, but the
compatibility planner must invalidate and recompute the smallest complete
dependency closure: every draft payment group, cohort preview, execution plan,
fee basis, authorization fingerprint, and review token whose membership or
meaning changes. Another line's donor-entered amount, purpose, and schedule are
preserved even when a shared plan must be rebuilt. No submitted, attempted, or
outcome-ambiguous provider operation is reused, and no Phase 16 group, term,
schedule epoch, cohort, leg, or occurrence is created merely because a donor
changes an editable line's schedule identity.
