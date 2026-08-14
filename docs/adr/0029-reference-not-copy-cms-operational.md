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

## Dated Phase 22 D17 clarification (2026-08-06)

The historical phrase “a project page its fund” and the current Payload
`project-pages.fundId` field describe prototype behavior, not the final subject
contract. A Phase 22 Project/Campaign Page now owns one operational,
immutable-versioned Page Subject Binding to exactly one owner-certified CRM
Ministry Project, Phase 13 Giving Campaign, or separately public-subject-
eligible Phase 13 Designation. Payload may retain legacy hints only as migration
input and references the opaque Page identity for presentation; it never owns or
infers the subject.

Reference-not-copy now means the public release pins a minimum Phase-10-safe
subject snapshot rather than joining anonymous traffic to the live source or
copying operational identity into CMS. The D17 subject remains independent of
D7 Giving, D6 progress, D1 contributors/display, D2 release/reach, and D8
lifecycle. A subject correction before first release appends a successor; after
first release another subject requires a new Page identity plus D8 succession.

## Dated Phase 22 D19 clarification (2026-08-06)

A Missionary Ministry Page references one CRM-owned Ministry Assignment through
its immutable-versioned Page Subject Binding. Payload stores authored
presentation against the opaque Page identity and a release pins only the
minimum Phase-10-safe Ministry Assignment snapshot. Payload never copies or
owns the assignment, participant roster, relationships, optional Phase 21
Support Binding, support activity, supporter identity, Field Account balance,
grant, or notification preference.

Ministry Assignment Participant Membership, D1 Display Participant and Public
Page Contributor Assignment, Phase 21 Support Assignment participation, Phase
12 Support Workspace authorization, and notification preference remain
independent even when one People & access workflow creates selected local facts.
Anonymous reads never join raw CRM or finance truth, and authenticated support
reads always return through the owner-authorized Phase 12/21 projection.

## Dated Phase 22 D21 clarification (2026-08-14)

Legacy CMS ids, names, URLs, slugs, `missionaryId`, and `fundId` are adoption
hints only. A D21 coverage disposition must reference the exact current D1-D20
owner fact that authorizes its subject, presentation, Giving, progress, route,
media, reach, or retirement result. A matching string, successful legacy read,
or missing row cannot supply that authority. Unknown or ambiguous input stays
unadopted and cannot silently become a general-fund CTA, public Page, zero, or
retirement.

The sole post-cutover Phase 5/D18 gateway may preserve a proved-safe legacy
appearance only after a certified one-time adapter normalizes it into an
immutable, family-qualified D2 release. It never reads mutable legacy records at
request time or turns copied legacy values into managed operational truth.
