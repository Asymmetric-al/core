# SiteStacker Parity — Program Charter

This folder governs the long-term SiteStacker parity effort for
`Asymmetric-al/core`. It is the program-level home: the rules, the inventory,
and how each area is tracked. Detailed per-feature plans are written later, when
each area is actually built — not here.

## What "SiteStacker parity" means (outcome parity)

Parity means **matching what SiteStacker/WMTek lets a Christian missions
organization accomplish — built our way**, not cloning its screens.
SiteStacker is the **benchmark of operational capability**, not a UI blueprint.

For every area, the question is: _"Can a missions organization get the same
real-world job done here as they can in SiteStacker?"_ — not _"Did we replicate
SiteStacker's exact screens?"_

This is a durable product term; see the `SiteStacker parity` entry in the
root `CONTEXT.md` glossary.

## Benchmark source (what we measure against)

Parity is measured against **official SiteStacker/WMTek public documentation**:

- `https://sitestacker.training` and
  `https://forms.sitestacker.training/full-training-documentation`
- product framing at `https://sitestacker.com`

Rule: every benchmark entry in the parity matrix **cites a specific doc page**
or is marked **"not yet sourced."** No benchmark claim rests on memory.

**Known limitation:** public docs describe _features_, not always _operational
depth_ (real behavior under failure/edge cases). Deep behavioral documentation
of an area happens when that area is built, not in Phase 0.

## Scope

- **In scope:** the 25 parity areas listed in [`parity-matrix.md`](./parity-matrix.md).
- **Out of scope:** **child sponsorship** (declared out now). Other exclusions
  are recorded in the matrix with an "out of scope / not pursuing" status as
  they surface — we do not guess the full exclusion list up front.

## Guardrails (inherited, not restated)

The parity effort inherits the platform's existing, binding boundaries. It does
**not** restate them — one source of truth. The binding rules live in OpenSpec:

- `openspec/specs/platform-boundaries/spec.md` — server-side boundary for
  sensitive operations; CRM = operational truth, CMS = public/content truth;
  role-scoped surface boundaries; tenant isolation; shared-logic convergence.
- `openspec/specs/platform-surfaces/spec.md` — Mission Control owns staff
  depth; donor portal = donor self-service; missionary workspace =
  support-raising/communication; public website = public content + giving.
- `openspec/specs/platform-product-intent/spec.md` and
  `openspec/specs/platform-principles/spec.md` — product intent and the
  decision ladder.

Source-of-truth ownership is additionally ruled by
[ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) and
the [Phase 1 ownership matrix](./phase-01-source-of-truth-ownership-matrix.md):
Asym Postgres owns all CRM truth; Twenty CRM is retired as a product
dependency.

**Parity-specific reminder:** a new SiteStacker-style capability must fit an
existing surface and use the shared `packages/api` layer — it must not become a
bolted-on module or push admin depth into donor/missionary surfaces.

## How work is sequenced

- The current build order is **[`roadmap.md`](./roadmap.md) (Roadmap v2,
  adopted 2026-07-07)** — 41 phases (0–40) in seven dependency lanes, with
  the v1→v2 renumbering map. [`phase-map.md`](./phase-map.md) is the short
  orientation mirror of it. The original post-Phase-0 order in
  [`phase-00-baseline.md`](./phase-00-baseline.md) was **provisional** and is
  superseded; phase-00 remains the origin of the firm, locked "B needs A
  first" dependencies. Any pre-2026-07-07 document citing a phase number
  above 9 uses v1 numbering — decode via the roadmap's map.
- Each area graduates to its own detailed PRD + OpenSpec change **when it is
  actually being built**, not before.
- **Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit
  Model)** is the final Lane-1 foundation phase (groomed 2026-07-05; Phases
  2–6 precede it in dependency order — see [`phase-map.md`](./phase-map.md)).
  It **fulfills the identity/party/credit seams reserved in Phase 4** — the
  persons spine, party entities, frozen-snapshot extension, and the
  `gift_credits`/tribute/matching/DAF model — which the provisional build
  order permits. Phase 7 **hard-depends on the Phase 4 isolation-hardening
  foundation, the Phase 6 communication-event spine + `sendEmail` seam, and
  the Phase 3 consent gate (PR #502) shipping first** (the PRD's hard
  prerequisites C1–C3).
- **Phase 8 (CRM Operating Foundation)** was **re-groomed 2026-07-07 (#603
  complete)** under
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md).
  With Twenty retired and Asym Postgres owning all CRM truth, the Twenty
  write-enable spine is **withdrawn** (dormant code → #602) and the phase is
  reframed to the **CRM Operations Observability & Data-Health Foundation**: a
  read-only `/crm/operations` windowpane, escalation over the shipped Inngest
  recovery machinery (no second healer), alert routing (Sentry + the Phase-6
  seam), and the CRM data-health catalog Phase 40 later builds on. Its
  **build-now core has no hard prerequisite** (it observes Asym's shipped
  runtime + the Phase-4 merge count); Phase 6 gates the emailed-alert path and
  Phase 9 gates the reserved party-graph-health sockets. Issues re-scoped
  2026-07-07 (epic #587; #590/#591/#594/#598 closed). **Supersedes** the
  earlier `phase-01-crm-operating-foundation.md`.

## Files in this program

- [`README.md`](./README.md) — this charter.
- [`roadmap.md`](./roadmap.md) — **Roadmap v2 (source of truth for phase
  architecture):** the full 41-phase table with slugs and dependencies, the
  v1→v2 renumbering map, dependency lanes/parallelism, and per-phase scope
  sections. **Read this (plus `phase-map.md`) before writing a PRD, issues,
  tickets, or a new implementation PR** so the work fits the whole program.
- [`parity-matrix.md`](./parity-matrix.md) — the 25-area inventory (the tracking
  source of truth).
- [`phase-map.md`](./phase-map.md) — short orientation guide mirroring the
  roadmap: phase order, dependency lanes, owner surfaces, and
  ticket-generation guardrails.
- [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md)
  — the Phase 1 deliverable (ruled 2026-07-06): the per-record-type
  source-of-truth ownership ruling and the record that Twenty CRM is retired
  as a product dependency
  ([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)).
  Not the same file as the tombstoned `phase-01-crm-operating-foundation.md`.
- [`phase-00-baseline.md`](./phase-00-baseline.md) — the Phase 0 plan: what
  Phase 0 does, its done-definition, and the provisional order.
- [`phase-01-crm-operating-foundation.md`](./phase-01-crm-operating-foundation.md)
  — tombstoned; superseded by Phase 8; retained for history (issues #466–#476
  closed as superseded, 2026-07-06).
- Phase PRDs (groomed, each tracked by an epic + children):
  [`phase-02-site-locale-currency-foundation.md`](./phase-02-site-locale-currency-foundation.md)
  (epic #477),
  [`phase-03-minimum-permission-role-scoped-projection-foundation.md`](./phase-03-minimum-permission-role-scoped-projection-foundation.md)
  (epic #489),
  [`phase-04-identity-account-claiming-foundation.md`](./phase-04-identity-account-claiming-foundation.md)
  (epic #503),
  [`phase-05-public-website-runtime-contract.md`](./phase-05-public-website-runtime-contract.md)
  (epic #520), and
  [`phase-06-shared-communication-event-model.md`](./phase-06-shared-communication-event-model.md)
  (epic #550).
- [`phase-07-receipt-statement-compliance-and-donor-credit.md`](./phase-07-receipt-statement-compliance-and-donor-credit.md)
  — the Phase 7 plan (Receipt & Statement Compliance Rules + Donor
  Identity/Credit Model): a rules-first receipt/statement engine + the full
  donor credit model. Groomed and committed; tracked by epic #566 + children
  #567–#586.
- [`phase-08-crm-operating-foundation.md`](./phase-08-crm-operating-foundation.md)
  — the Phase 8 plan, **re-groomed 2026-07-07 (#603 complete,
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md))**
  into the **CRM Operations Observability & Data-Health Foundation**: a
  read-only `/crm/operations` windowpane, escalation over the shipped Inngest
  recovery (no second healer), alert routing (Sentry + Phase-6 seam), and the
  CRM data-health catalog Phase 40 builds on. The Twenty write-enable spine is
  withdrawn (→ #602). The build-now core has no hard prerequisite; Phase 6/9
  gate the reserved sockets. Tracked by epic #587 (children #588–#601;
  #590/#591/#594/#598 closed at the re-groom). Supersedes
  `phase-01-crm-operating-foundation.md`.
- [`phase-09-full-crm-depth-relationship-graph.md`](./phase-09-full-crm-depth-relationship-graph.md)
  — the Phase 9 plan (Full CRM Depth & Relationship Graph): the People &
  Churches backbone — parties supertype + relationship graph (stored +
  derived edges), the record-detail shell (8 live tabs + 8 reserved
  sockets + the header contract), one list engine with kind-scoped routes,
  party-keyed notes/activity, Cmd-K search, and governed CSV export.
  Groomed 2026-07-06; hard-depends on Phase 4 + Phase 7 (party spine);
  Phase 8 is a soft dependency (ADR-0001). Tracked by epic #604 + children
  #605–#627.
- [`phase-10-sensitive-data-safety.md`](./phase-10-sensitive-data-safety.md)
  — the Phase 10 plan (Sensitive-Data Classification & Restricted-Ministry
  Safety Foundation), **groomed + founder-grilled 2026-07-07 (G1–G7 + a
  four-lens adversarial pass; epic #628 + #629–#641)**: the safety rails a
  missions CRM needs — a person-level `security_level` (**tenant-sovereign**
  country-risk-defaulted; opt-in World Watch List seed; person always
  overrides), dual identity (legal name vs public alias, **alias enforced at
  the data layer**), the publication firewall as a **sole-entry** architectural
  invariant, restricted data in a separate RLS table, ABAC through the Phase-3
  resolver, read-audit, **one identity-access-grant object** (standing /
  requested / break-glass) with **"Security Clearance" a role-toggled
  capability**, consent/publishing preferences, and telemetry redaction —
  landed **before** custom fields (Phase 11) and public missionary
  pages (Phase 22) can create unclassifiable data. **Extends** the Phase-3
  `field_policies` floor; the member-care case product stays Phase 38.
  Groomed 2026-07-07; hard-depends on Phase 3 + Phase 9. Tracked by epic
  #628 + children #629–#640.
- Evidence: `docs/ops/phase-evidence/2026-07-03_sitestacker-parity-phase-00-baseline.md`
  (the 0A truth-finding output).
- OpenSpec: `openspec/changes/sitestacker-parity/` (the durable record that this
  program exists and is governed as outcome parity).

## Related in-flight work

OpenSpec PR #462 refines the platform specs and adds capability specs
(donation-lifecycle, crm-core, contribution-operations, identity-and-access,
workflow-orchestration) plus donor-money-path changes (guest giving, donor
self-service, recurring giving, staff refunds). These overlap several parity
areas and are not yet merged. The parity program **reconciles with #462 rather
than duplicating it** — where #462 already governs an area, the matrix points to
it.
