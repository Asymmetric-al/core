# ADR-0040: Canonical statement-run authorities and atomic release

**Status:** Accepted (founder rulings, Phase 19 grill session — D1-D5, D18)

> Full record:
> `docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md`

## Context

Year-end statement operations must freeze and release thousands of legal and
informational document candidates without treating a mutable report, current
household, delivery destination, browser selection, or workflow run as
authority. The current live-text annual-statement route has no immutable
population, exact release, coverage protection, or late-fact contract.

Tenants need operational participation control, but staff must not be able to
rewrite legal donor, gift, date, amount, jurisdiction, receipt-plan, or coverage
truth. Ordinary U.S. year-boundary check intake also must be flexible enough for
authorized staff to record a truthful prior-year mailing date without imposing
universal evidence bureaucracy.

## Decision

Phase 19 owns one purpose-pinned Statement Run and Run Item system. One run has
exactly one tenant/environment, issuer, jurisdiction activation, purpose
contract and version, period, source cutoff, timezone, compliance policy, and
frozen population. A Run Item is one source-owned Statement Subject/document
candidate; source gift and recognition lines are subordinate inclusion facts,
not peer run items.

The Year-End Operations workspace is a rebuildable projection over these
authorities. It owns no lifecycle, idempotency, completion, or command truth.

Before release, the server builds one immutable, inert Run Preflight containing
the exact included, excluded, blocked, held, and already-current subjects;
stable reasons; source fact closures; document and communication resolution
pins; delivery and physical policies; counts, totals, release floor, and a
canonical digest. A connected paid-mail lane also pins exact pieces, current
connection/capability, billing currency, provider quote or certified upper
bound, expiry, and tenant spending guard. The browser may display but never
assemble or author it.

One `Start live run`, or protected `Approve and start live run`, command:

1. reauthorizes the actor and scope;
2. re-proves every material source and policy pin;
3. compares the exact preflight and review versions;
4. atomically creates the run, items, release evidence, outbox, and control
   barrier; and
5. opens claim admission.

The one Start confirmation shows the exact population and consequences,
including physical pieces and bounded provider spend when applicable. A paid
lane requires both run-start and direct-mail-authorization capabilities; it
does not add a second purchase step.

No renderer, Resend, Inngest, object storage, portal, or physical provider call
occurs in that transaction. A successful command means durable work is queued;
it does not mean a document was generated, issued, accessed, sent, delivered,
printed, or mailed. Exact replay returns the same run; changed semantic reuse
conflicts; concurrent starts produce one winner.

Phase 7 owns legal donor, eligibility, facts, gift date, receipt plan, coverage,
and correction. Phase 13 owns posted money. Phase 14 owns recognition. Phase 18
owns generated-document identity, artifact, currentness, and access. Phase 17/6
owns communication intent and outcome. Phase 19 owns frozen population,
participation, release, recipient-operation coordination, physical
fulfillment, controls, completion, and evidence projection.

The Statement Subject is the exact source-proved legal donor. Household,
address, email, payment method, contact role, recognition, or staff preference
never substitutes for it. Optional household and disclosed DAF recognition is
produced only through the separate `giving.summary.informational@1` purpose and
is always labeled **Support overview — Not a tax document**.

For an exact issuer with an active Phase 18 Canadian pack, Phase 7 prospectively
freezes `individual_cash` or `annual_cumulative_cash` on each eligible
occurrence. Phase 19 consumes that decision and enforces nonoverlapping
coverage. Inactive issuers have no Canadian state, work, or surface.

For mailed year-boundary checks, Phase 15/7 records the actual mailing date and
delivery basis. One authorized staff attestation is sufficient by default;
tenant or jurisdiction policy may strengthen proof. Phase 19 cannot edit the
date. Facts arriving before start stale the preflight. Facts arriving after
start create one deduplicated Late Fact Obligation and a separately reviewed
supplemental or correction operation; the primary run never reopens.

Before release, authorized staff may append bounded participation decisions:
include, hold, purpose-permitted omit, restore automatic, or add an existing
eligible subject. Every commit re-proves source eligibility and compatibility.
No gift-line, amount, date, currency, issuer, jurisdiction, donor, or coverage
override exists. Bulk decisions operate atomically on one materialized
selection and never silently skip raced items.

## Consequences

- One public Statement Operations service becomes the only command/query
  boundary for Phase 19-owned routes, UI, workers, recovery, and physical
  adapters; Phase 17 and Phase 18 retain their own public boundaries.
- Test preflights are synthetic-only, visibly watermarked, and incapable of
  official or outbound effects.
- Household recognition and official tax documents have independent run,
  artifact, access, and delivery truth.
- `issued-on-accept`, ad hoc year queries, and live statement recomputation are
  not valid target semantics.
- Tenant flexibility is preserved through bounded participation and source
  correction, not a legal-rules editor.
- Same-scope keys, forced RLS, unique coverage, CAS, semantic idempotency,
  outbox, leases, fencing, and hostile cross-tenant tests are mandatory.
- The live `.txt` annual-statement path and any alternate statement-run writer
  must be removed before production.
