# ADR-0017: Donor-anchored civil-date recurring schedules

**Status:** Accepted (founder rulings, Phase 16 grill session 2026-07-12 — D3–D5)

> Full record: `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
> (ratified decisions D3–D5).

## Context

A recurring schedule is donor intent expressed on a calendar, while Stripe
executes timestamps, invoices, and payments. Using subscription creation time,
last attempt, settlement time, or an organization-wide 1st/15th billing day as
the schedule authority would surprise donors and cause drift. Calendar dates
also behave differently across short months, leap years, time zones, retries,
pauses, and provider delays. The first actual gift can happen now even when the
donor chooses a future date for the continuing series.

## Decision

One pure, provider-independent schedule kernel owns calendar calculation for
the supported cadence, donor-selected continuing anchor, frozen IANA giving
time zone, schedule epochs, named occurrences, projected dates, and optional
final eligible date. A separate versioned tenant-policy resolver determines
which closed cadences are prospectively available. For every ordinary cadence,
the current civil date in the arrangement's frozen giving time zone is the
default anchor; checkout may choose that date or a future date. The initial
actual contribution is attempted immediately. When the continuing anchor is
today, that contribution fulfills the first occurrence and the next gift is one
full cadence later. When the anchor is future, the immediate gift is explicitly
outside the continuing series and the next gift occurs on the selected date.

Twice monthly is the explicit exception because selecting that cadence itself
means the fixed 1st/15th grid. When checkout occurs on the 1st or 15th and the
start is today, the immediate gift fulfills that slot. On any other date, the
immediate gift is outside the series and the default continuing occurrence is
the next 1st or 15th; any donor-selected future start must also be a 1st or
15th. Checkout must disclose both facts and must never silently treat the
off-slot initial gift as another 1st/15th occurrence.

Supported recurring cadences are weekly, every two weeks, twice monthly on the
1st and 15th, every four weeks, monthly, quarterly, semiannual, and annual.
Monthly is featured when enabled; tenant configuration controls prospective
availability without mutating grandfathered schedules. Daily is not enabled.
One-time giving is a separate gift mode, not a cadence.

For monthly-like dates that do not exist, use the last valid day and return to
the original anchor when it exists again; annual February 29 follows the same
clamp-and-recover rule. Twice monthly is one composite intent with two fixed
execution legs. All calculations use local civil dates in the frozen giving
zone, then resolve each occurrence to a provider-safe instant. Retries, late
processing/settlement, skip, and pause never move the normal grid. A schedule
change appends a new effective epoch; it never rewrites prior dates or creates a
retroactive charge, catch-up amount, proration, or debt.

No end date is the automatic checkout default and creates no extra question.
An optional, visually secondary end-date control sets an inclusive final
eligible gift date after concise, non-guilt-based explanation.

**Phase 24 D65 amendment (2026-08-30).** When an unaccepted editable gift line
changes between one-time and an exact recurring cadence, or between two exact
recurring cadences, every source cadence anchor, start, end, final-date answer,
occurrence preview, and schedule-derived acknowledgement clears. The target
schedule is computed afresh by this kernel under the current Tenant policy and
giving time zone: ordinary cadences use the current civil-date default, twice
monthly uses today when the current civil date is the 1st or 15th and otherwise
the next 1st/15th slot, and no end date remains the default.
Source dates are never copied or position-mapped. The donor must review the new
per-occurrence amount and **Today / Next / Then** consequences before
acceptance. Accepted schedule changes remain append-only effective epochs and
are outside D65.

## Consequences

- Checkout and every management surface must preview the first gift, continuing
  start, next amount/date, cadence, and at least the next two or three dates.
- Provider anchors and subscriptions are reconciled execution bindings; they do
  not replace the product's local-date schedule or historical epoch.
- Date-changing commands require CAS/idempotency, explicit same-day charge
  confirmation where applicable, and no mutation of already submitted payments.
- Calendar property tests across IANA zones, DST, short months, leap years,
  composite legs, end dates, and replay are release blockers.
- No arbitrary tenant-authored cadence DSL, automatic billing-date
  normalization, daily recurrence, weekend sliding, or settlement-driven anchor
  is introduced.
- Property and journey tests cover all 72 ordered transitions among one-time
  and the eight recurring cadences, including short-month, leap-year, DST, and
  twice-monthly boundaries.
