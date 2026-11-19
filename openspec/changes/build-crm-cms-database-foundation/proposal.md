# Change: Build The CRM, CMS And Database Foundation

## Why

Core's tenancy, publishing and money problems come from several parts of the
system each holding their own answer to "which organization is this, and what
may this person do": profile columns, a token claim that no hosted database
fills, a `super_admin` bypass, Payload's own roles, and server handlers that read
with the service key and filter by convention. The public website reads live
from the admin app, withdrawal depends on a cache signal no code sends, money
steps can be lost or duplicated on retry, and the hosted databases have drifted
from source. The facts are in the
[audit](../../../docs/audits/core-crm-cms-database-audit.md).

The [CRM, CMS and database plan](../../../docs/audits/core-crm-cms-database-target-architecture.md)
answers this: keep Supabase, Postgres and Payload, give every fact one owner, and
make the database check the tenant boundary itself. Its coordinator ratified it,
with the reservations in
[section C.8 of the council record](../../../docs/audits/core-crm-cms-database-council-record.md#c8-final-review-and-ratification),
on 16 November 2026. On 17 November 2026 the owner instructed that the whole plan
be implemented
([implementation record, section 1](../../../docs/audits/core-crm-cms-database-implementation-record.md#1-baseline)).
That instruction is the ratifying instruction for the dispositions the plan's
section 14 lists, and this change carries them through Core's OpenSpec workflow
so that every work package has durable, traceable intent behind it.

## What Changes

- **One program change for work packages WP0, WP0b and WP1 to WP14** of plan
  section 12, with the five thin proofs, as `tasks.md`. Status is not kept here:
  the [implementation record](../../../docs/audits/core-crm-cms-database-implementation-record.md#5-work-packages)
  is the one place that says what is implemented, integrated and verified.
- **Spec deltas that section 14 calls for:**
  - `identity-and-access`: ADDED, the database enforces the tenant boundary for
    every caller with a user identity, with the stated application-enforced
    exceptions.
  - `platform-boundaries`: ADDED, the CMS domain owns publishing state and
    Core's release tables store it, with per-page releases until whole-Site
    generations return; ADDED, row isolation inside `cms` is a stated
    application-enforced exception.
  - `donation-lifecycle`: MODIFIED, financial execution pinned to one Legal
    Entity gains its first-release narrowing (a cart covers one Legal Entity
    until payment groups exist); MODIFIED, the legacy recurring reflection is
    parked by the money kernel and replaced by derived counters in the first
    recurring slice; REMOVED and ADDED, gift begin is replaced by a requirement
    that keeps every clause but the GraphQL adapter's (OpenSpec cannot drop a
    scenario from a MODIFIED requirement).
  - `platform-surfaces`: REMOVED, the GraphQL shared-record adapter requirement.
- **Decision records.** ADR-0224 to ADR-0239 record the new decisions section 14
  lists and the Stripe Connect topology that ADR-0011 calls missing. Seventeen
  existing ADRs carry dated 2026-11-17 amendments: 0011, 0027, 0028, 0030, 0119,
  0124, 0126, 0145, 0171, 0174, 0178, 0179, 0206, 0207, 0209, 0210 and 0213.
- **Owner sources amended in place, with dated labels:** the Phase 10 PRD (five
  replaced mechanisms), the Phase 23 decision log (D1 first-release scope and its
  dependent decisions), the roadmap (sequencing and launch-item placement) and
  the `identity-and-access` contract section that the active `sitestacker-parity`
  change binds (processor identifiers and the receipt census).

## Authority And Its Limits

- The owner's instruction of 17 November 2026 ratifies the section 14
  dispositions. The owner decisions of plan section 15.1 are taken at their
  stated defaults (implementation record, D-01 to D-08). Where a delta or a
  decision record rests on one of those defaults, it says so: a default taken is
  not a fresh owner ruling, and the owner may still decide otherwise.
- The deltas that rest on defaults are named in `design.md`. They stay proposed
  until this change is archived after implementation, like every delta here.
- Nothing in this change says or implies that a package is implemented. Decision
  records state intent; the implementation record says what exists.

## Non-Goals

- No application code, migration, test of behaviour, configuration or
  deployment changes here. Each package makes those in its own change.
- Documents that describe current behaviour and must change with the code that
  changes it stay with their packages: `docs/security/tenant-guard.md`,
  `docs/security/tenant-read-floor.md`, `donor-feed-preferences-rls.md`,
  `docs/guides/architecture/data-access-boundary.md` and README files.
- The plan's "Not in this plan" list and its launch table are not delivered by
  this change; the roadmap places each launch item against its owning phase.
- No other active change's target requirement is narrowed by this change except
  the `sitestacker-parity` sensitive-fields contract that section 14 amends. The
  Phase 23 D1 requirement in `add-web-studio-cms` and the D14 requirement in
  `add-public-ministry-pages` state targets this plan keeps; their first-release
  narrowings are recorded in ADR-0145, ADR-0119 and the Phase 23 decision log.

## Affected Capabilities And Sources

- Capabilities: `identity-and-access`, `platform-boundaries`,
  `donation-lifecycle`, `platform-surfaces`.
- Active changes that touch the same requirements: `sitestacker-parity` also
  modifies "Legacy Recurring Reflection Does Not Define The Target Topology" to
  the full Phase 16 target; this change's delta is the first-slice step of that
  target, and whichever change archives second reconciles the two.
  `add-guest-giving-and-gift-anonymity` is kept: WP8a builds its
  accepted-contribution boundary and per-gift anonymity choice.
- Sources: the plan and its section 14, the implementation record, the council
  record, the ADR registry, the Phase 10 PRD, the Phase 13 PRD, the Phase 23
  decision log and the roadmap.

## Rollback

Every artifact here is documentation. Reverting this change's commits restores
the earlier decision text, contracts and deltas; content-addressed contract
sections added here stay in their files as unreferenced history, as the contracts
README prescribes. A work package that has already shipped against a reverted
decision must be reconciled by its own change.
