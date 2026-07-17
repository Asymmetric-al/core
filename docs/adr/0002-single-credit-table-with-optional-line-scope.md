# ADR-0002: One credit table with optional line scope; recognition is a derivation

**Status:** Accepted (founder ruling, Phase 14 grill session 2026-07-10 — D1)

> Full record: `docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`,
> Sections A–C and the Data Model (ratified decision D1, hardened by the
> 17-category adversarial pass `wf_8173b0a3-b3b`, amendments D1.1–D1.14).

## Context

Phase 14 (Donor Credit Operations) needs one substrate for every recognition
fact — soft credits, DAF advisor recognition, church-member remittance
attribution, matched-employee credit, tribute annotation. The alternatives
were per-domain credit tables (one per lifecycle), or a single table. Vendor
precedent is gift-level-only credits (Salesforce Nonprofit Cloud's
`GiftSoftCredit` has no designation reference; NPSP soft credits do not
interact with GAU allocations), but Phase 13 (Campaign, Designation,
Contribution Ledger & Giving Cart) had already ratified per-line remittance
attributions, so the grain question was settled before this phase opened.

## Decision

Build **ONE `contribution_credits` table keyed to the contribution header
with OPTIONAL line scope**. Lifecycle objects (`tributes` /
`contribution_tributes`, `matching_gift_expectancies`, standing rules, the
`daf_sponsors` registry) are **separate tables that GENERATE credit rows** —
they are never themselves credits and never enter any sum. Header-keying is
the default grain; line scope is a narrow, named exception for
allocation-style attribution, set only by named flows.

Recognition exposure is a **derivation, never a stored total**: one canonical
recognition fold (`LEAST(amount_minor, scope_effective_minor)`, 0 when the
scope is reversed/voided) keyed on the Phase 13 `effective_seq` cursor is the
sole aggregator; credit rows are historical facts corrections never silently
mutate. A fixed role registry assigns each role one of three amount classes
(`allocation` / `recognition` / `annotation`), and reporting keeps two
vocabularies forever — Legal giving (hard credit only) vs Recognition giving —
never one mixed column.

## Consequences

- One identity key (`tenant, header, optional line, party, role` with
  `NULLS NOT DISTINCT`, active-partial) makes generator convergence and
  dedupe structural — the NPSP #5796 duplicate class is impossible.
- Every credit consumer goes through three named read models
  (`getPartyCreditActivity`, `getMatchingActivity`, `getSupporterRoster`);
  raw-table sums fail the CI non-money gate.
- Scope exclusivity (a party+role is header-scoped XOR line-scoped per
  header) keeps naive sums correct by construction.
- Per-domain credit semantics cannot drift, because there is no per-domain
  table to drift in; new recognition kinds are new roles + generators, not
  new spines.
