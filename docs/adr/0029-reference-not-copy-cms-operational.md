# ADR-0029: Reference-not-copy CMS↔operational, operational-wins on drift

**Status:** Accepted (founder ruling, Phase 5 grill session 2026-07-05 — A7)

> Full record: `docs/prds/sitestacker-parity/phase-05-public-website-runtime-contract.md`
> (ruling A7; A15 records the two-schema footgun rules this preserves).

## Context

The platform runs one database with two schemas: `public` (operational truth,
RLS-protected) and `cms` (Payload-owned presentation). CMS pages need to point
at operational records — a missionary giving page needs its missionary, a
project page its fund. The alternatives were: **copy** operational data into
CMS documents (names, goals, support progress — which drifts the moment the
operational record changes, and puts money/identity truth in a schema RLS does
not protect), **hard foreign keys** across the schema boundary (couples
Payload's migrations to Supabase's, breaks the disjoint migration tooling, and
is the classic two-schema footgun), or **soft references validated in the
application layer** at read time.

## Decision

CMS stores **stable operational references plus presentation content — never
money or identity truth**. Cross-schema links stay soft UUID references; the
runtime resolves and **validates every reference at read time** (the record
exists, belongs to the resolved tenant, and is public-eligible); references
are batched and cached; live operational data (for example support progress)
is read at render, never copied into CMS. On drift, **operational truth wins**
for identity, money, existence, and permission; **CMS wins** for presentation.
A dangling or cross-tenant reference **fails safe** (hide the CTA, 404 the
page) — never a charge to a stale designation. **Public page identity is a
presentation identity linked to — not equal to — the operational record**,
which is what enables display names, family/team pages (one page, several
records, an explicit designation target), restricted-country suppression,
independent slugs, and independent publish state. Graceful degradation
distinguishes an invalid reference (hide/refuse) from a transient operational
outage (retry or degrade the affected element, not the whole page).

## Consequences

- No sync engine and no snapshot job between `cms` and `public` — there is
  nothing to drift, reconcile, or repair.
- Migration tooling stays disjoint (Payload owns `cms`; the Supabase CLI owns
  `public` plus shared roles/extensions); neither schema's migrations can
  break the other's.
- Reference validation is a read-time cost, paid once per render and
  amortized by batching and the Phase 5 cache contract (ADR-0030).
- Deleting or reassigning an operational record cannot leave a public page
  charging the wrong target — the reference fails validation and the page
  fails safe instead.
- The presentation-identity split is load-bearing for later phases
  (family/team pages, restricted-worker suppression) and must not be
  collapsed into "the page is the record."
