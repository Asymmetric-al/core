# ADR-0006: Matching gifts at rung 2 — org-owned machinery, vendor-agnostic seam

**Status:** Accepted (founder ruling, Phase 14 grill session 2026-07-10 — D4,
with the binding don't-over-engineer rider)

> Full record: `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`,
> Section G (ratified decision D4, hardened by the 17-category pass
> `wf_ac3d918a-9f6`).

## Context

Matching-gift capability comes in rungs: (1) notes-only, (2) org-owned
expectancy machinery, (3) vendor lookup integration, (4) full vendor
submission/status sync (Double the Donation / HEPdata). A vendor contract in
this phase would couple the ledger to a third party before the platform has
any connector framework; skipping the machinery entirely would leave the
universal two-gift bookkeeping model (origin gift + employer check) unmodeled.
DTD's own posture is that the CRM stays the system of record.

## Decision

Ship **rung 2**: full org-owned machinery with **no vendor contract this
phase** — the expectancy lifecycle (`identified | submitted | received |
reversed | closed | superseded`), the `matching_gift_settlements` junction
(one employer line settles ≤1 expectancy; the line IS the amount), employee
recognition generated from settlements, age-bucketed worklists, and program
notes. Vendor connectivity is a **socket, not an integration**: a ratified
versioned event-shape contract (tenant from per-tenant registration, never
from payload; quarantine ≠ dead-letter; no synchronous match/no-match echo),
reserved for Phase 31 (Platform API, Webhooks & Connector Framework) rungs
3/4. The don't-over-engineer rider binds v1 to the leanest compliant shape:
6 states not 8, no `match_ratio` column, no ingest archive table until a
non-staff producer exists, worklists not per-row tasks, no proposal queues.

## Consequences

- Orgs get real matching operations (pipeline, aging, two-gift bookkeeping,
  employee thank-yous) with zero vendor dependency, pricing, or API-stability
  exposure.
- Expectancies are advisory-only pipeline facts — never in any money fold or
  vocabulary — so rung 2 cannot corrupt ledger truth (see ADR-0002).
- When Phase 31 lands, DTD/HEPdata/Benevity feeds plug into the existing
  socket and the existing `party_payer_aliases` registry; no Phase 14 schema
  change is expected (vendor linkage rides generalized `crm_record_links`).
- Deferring rungs 3/4 is deliberate scope, not debt: the socket contract and
  payer-of-record ruling (ADR-0003) are the seams that make later adoption
  additive.
