# ADR-0016: Proof-gated fixed-total pledge reminders

**Status:** Accepted (founder ruling, Phase 16 grill session 2026-07-13 — D19)

> Full record: `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md`
> (ratified decision D19).

## Context

Fixed-total pledge reminders can be useful stewardship, but automatic
enrollment, arbitrary cadences, inferred recipients, debt language, and stale
scheduled jobs can create donor harm and legal or consent failures. Tenants need
control without turning Phase 16 into a second marketing-automation platform.
The existing unused `scheduled_gift_reminder` literal is not a sufficient policy
or authorization record.

## Decision

Provide one platform-governed **Gentle** reminder profile for fixed-total pledge
expectation plans:

1. an upcoming reminder 30 calendar days before an eligible scheduled
   expectation; and
2. at most one source-aware follow-up at that expectation's frozen review date.

Every tenant and every pledge starts **Off**. A tenant may set only a
reduction-only maximum: Unavailable, Upcoming reminder only, or Upcoming plus
one follow-up. Saving or importing a pledge never enrolls it. An authorized
staff member explicitly enrolls the **current plan version once** through **Set
up reminders**; enrollment is plan-scoped, not one enrollment per installment.
Each eligible named expectation and stage derives its own candidate under that
enrollment and permanent tenant/pledge/plan/expectation/stage semantic key. A
plan change invalidates the enrollment and its unsubmitted candidates until the
new current plan is explicitly reviewed and enrolled again.

Each stage is only a candidate. Immediately before the Phase 6 communication
seam and Phase 17 template/render seam, the system re-proves current pledge and
plan version, source evidence, authority, recipient, tenant maximum, purpose,
consent or other lawful route, suppression, current template, due window, and
permanent semantic deduplication. A missed window is skipped, never caught up.
Recipients can stop this reminder purpose without ending or changing the
pledge. GET requests are read-only; stop actions use a narrow authenticated or
signed POST path and support applicable one-click unsubscribe contracts.

## Consequences

- Tenant control can reduce or disable reminders but cannot add touches, change
  timing, force-send, infer a recipient, or weaken safety and consent floors.
- Staff receive a calm exception-only view; missionaries receive no reminder
  noise or private communication evidence.
- Delivery/open/click outcomes never change pledge, fulfillment, or cash truth;
  open/click tracking is off by default and never treated as donor intent.
- Phase 16 owns policy, enrollment, and candidate generation; Phase 6 owns
  consent/event/delivery truth; Phase 17 owns governed rendering.
- No general journey builder, arbitrary template variables, third touch,
  due-date collection letter, catch-up send, channel escalation, or guilt-based
  language is introduced.
