# Delta for Platform Product Intent

## ADDED Requirements

### Requirement: SiteStacker Parity Is An Outcome-Parity Program

The platform MUST pursue SiteStacker parity as an outcome-parity program: it
MUST match what SiteStacker/WMTek lets a Christian missions organization
accomplish, built on the platform's own model, rather than cloning SiteStacker's
screens. Parity work MUST stay governed by the existing platform boundaries and
surface ownership — it MUST NOT bolt on disconnected modules and MUST NOT push
admin depth into donor or missionary surfaces. Each parity area MUST be
benchmarked against cited official SiteStacker documentation (or explicitly
marked not-yet-sourced) and MUST be tracked in the parity matrix with its built,
live, and confirmed status recorded separately. Per-area behavior MUST be
specified in its own change when that area is built, not defined up front. Child
sponsorship is out of scope.

#### Scenario: A parity capability is proposed

- WHEN a SiteStacker-style capability is proposed for the platform
- THEN it is scoped as the real outcome an organization must accomplish, fitted
  to an existing surface through the shared `packages/api` layer, and
  benchmarked against a cited SiteStacker doc (or marked not-yet-sourced)
- AND it does not become a bolted-on module or move admin depth into a
  role-scoped surface

#### Scenario: A parity area moves into active build

- WHEN a parity area moves from tracked to actually being built
- THEN its detailed behavior is specified in its own OpenSpec change and PRD at
  that time
- AND the parity matrix records its built, live, and confirmed status separately

### Requirement: The Parity Program's Phase Architecture Is Governed By One Roadmap

The SiteStacker parity program MUST govern its phase set, numbering,
ordering, and dependencies through a single roadmap source of truth
(`docs/prds/sitestacker-parity/roadmap.md`, Roadmap v2 adopted 2026-07-07;
`phase-map.md` is its compact mirror and loses on conflict). New PRDs, issues,
and tickets MUST cite phases as "Phase N (Name)" — never a bare number — and
MUST start from the roadmap's per-phase scope section. Dependencies gate phase
starts, not numbers. Any re-sequencing of the roadmap MUST land as a new
roadmap revision carrying an old→new renumbering map together with a
same-commit congruence sweep of every live document and open issue that cites
a moved number; partial renumbering MUST NOT occur. Documents dated before a
renumbering are read through the roadmap's mapping table rather than edited
retroactively where they are historical records.

#### Scenario: A new phase PRD is groomed

- WHEN a phase moves into grooming
- THEN the PRD starts from that phase's roadmap scope section, cites phases as
  "Phase N (Name)", extends the Phase 1 ownership matrix if it introduces a new
  record type, and reserves the seams the roadmap names for later phases

#### Scenario: The program is re-sequenced

- WHEN phase numbering or ordering changes
- THEN the change lands as a roadmap revision with an old→new mapping table and
  a same-commit congruence sweep of live PRDs, program docs, and open issues
- AND no document or issue is left citing a moved number without the mapping

### Requirement: Donor-Credit Recognition Stays Structurally Separate From Money Truth

Donor-credit operations SHALL keep recognition structurally separate from
money truth — across soft credits, DAF advisor recognition, tribute
notifications, matching-gift expectancies, and church-member attribution.
Recognition
rows SHALL never mint receipts, SHALL never enter money totals (receipt,
deductible, cash, or ledger), and SHALL render only through the governed
recognition read models. Reporting SHALL keep two vocabularies — Legal giving
(hard credit only) and Recognition giving — and SHALL never blend them into
one mixed column. Detailed behavior is specified in
`docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md`
(Phase 14 (Donor Credit Operations)).

#### Scenario: A recognition row is recorded against a contribution

- WHEN a soft-credit, DAF-advisor, tribute, matching-gift, or church-member
  attribution row is recorded against a contribution
- THEN no receipt is minted from it, no receipt/deductible/cash/ledger total
  includes it, and every surface that shows it reads through the governed
  recognition read models
- AND no column, export, or API field sums Legal giving and Recognition
  giving together
