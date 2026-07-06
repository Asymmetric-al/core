# SiteStacker Parity Phase Map

_A short orientation guide for future PRDs, issues, tickets, and implementation PRs._

> **Read this first.** Before you write a PRD, GitHub issues, implementation
> tickets, or a new implementation PR for SiteStacker parity, read this map so
> you understand the order, the dependencies, what comes later, and what must
> not be built too early. The goal is to keep each phase's work from becoming
> isolated.

## What this is (and is not)

This is a **project map for the whole long-running SiteStacker parity effort** —
where you are, what came before, what comes next, and which later phases depend
on today's decisions.

It is **not** a new PRD, and it does **not** replace anything. The binding
sources of truth stay where they are, in this priority order:

1. **OpenSpec** — `openspec/specs/platform-boundaries/spec.md`,
   `platform-surfaces/spec.md`, `platform-product-intent/spec.md`,
   `platform-principles/spec.md`, and the parity change under
   `openspec/changes/sitestacker-parity/`.
2. **Program charter + inventory** — [`README.md`](./README.md) and
   [`parity-matrix.md`](./parity-matrix.md) (the 25-area tracking source of
   truth).
3. **Phase PRDs** — the `phase-0X-*.md` files in this folder.
4. **ADRs, evidence files, and the GitHub issues** for each phase.

If this map and a binding source ever disagree, the binding source wins — and
the disagreement should be fixed here, not silently worked around.

## First principles before you build

Do not blindly preserve the current implementation just because it exists. Use
the repo as **evidence, not unquestioned authority**. Before building, writing
issues, or shaping a PRD, ask:

- What is the real user need?
- Which product surface should own this experience?
- What is the cleanest source of truth?
- Who can see it, edit it, export it, send it, or publish it?
- What future phase could this decision affect?
- Does this fit the OpenSpec surface boundaries?
- Does this create duplicate logic or a future refactor?
- Are we copying SiteStacker too literally instead of building a better
  Asym-native pattern?

When you meet an existing implementation, **classify it before relying on it**:

1. **Durable pattern** — intentional, documented, aligned with OpenSpec. Prefer
   to preserve.
2. **Useful precedent** — helpful, probably worth following, may need
   refinement.
3. **Temporary bridge** — helped an earlier phase move, not automatically the
   long-term product pattern.
4. **Implementation accident** — exists because of earlier constraints, speed,
   or partial work.
5. **Conflict with first principles** — works today but conflicts with the
   better product, security, source-of-truth, or UX model.

Do not build future architecture on a **temporary bridge** or an
**implementation accident** without making a fresh decision.

## Modern SiteStacker parity, not a clone

We pursue **modern SiteStacker parity**, not a SiteStacker clone. Match the
useful ministry outcomes SiteStacker delivers, using better modern product
patterns where they help:

- clear source-of-truth ownership and role-scoped surfaces
- server-side trust boundaries and strong audit trails
- safer donor privacy and cleaner public/authenticated separation
- rules-first receipt and statement behavior (not template-first)
- clear provider boundaries (providers store/execute; Asym owns truth)
- better CRM data-health, recovery, and reconciliation paths
- better testing, evidence, accessibility, and responsive UX

This mirrors the charter's definition of parity: _"can a missions org get the
same real-world job done here?"_ — not _"did we replicate SiteStacker's
screens?"_

## A note on phase numbers — read before trusting a file name

The program order changed after roadmap review inserted additional foundation
phases before CRM depth. **Follow this phase map and the parity matrix for the
current conceptual order. Some existing files may carry older numbers.** Do not
rename or delete older PRDs unless explicitly asked. If a file number and the
current conceptual phase differ, document the relationship rather than guessing.

The one live mismatch today:

- **`phase-01-crm-operating-foundation.md` is superseded.** Its content became
  the current **Phase 8 — CRM Operating Foundation**
  ([`phase-08-crm-operating-foundation.md`](./phase-08-crm-operating-foundation.md)),
  after the earlier foundation phases (2–7) were inserted ahead of CRM depth.
  The `phase-01` file carries a SUPERSEDED banner and should not be built from.
- **The conceptual "Phase 1" slot below (Source-of-Truth Ownership Matrix) now
  has its own PRD file** —
  [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md)
  (ruled 2026-07-06, backed by
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)) —
  and is **not** the same thing as the tombstoned
  `phase-01-crm-operating-foundation.md`. See
  [Tracking, evidence & open questions](#tracking-evidence--open-questions).

Every other foundation file number already matches its conceptual phase
(`phase-02` = Phase 2, … `phase-08` = Phase 8).

## The roadmap

**Status legend** (conservative — never claim a phase is implemented, deployed,
or live without repo/evidence proof):

- `PRD exists` — a groomed phase PRD file is present in this folder.
- `needs PRD` — recognized phase, no PRD written yet.
- `future` — planned, not yet groomed; typically gated on earlier foundations.
- `blocked by earlier foundation` — cannot responsibly start until a named
  earlier phase ships.
- `open question` — phase existence, ownership, or numbering is unresolved.
- `out of scope` — deliberately not pursued.

`Built?` / `Live?` status for capabilities that already have code lives in the
[`parity-matrix.md`](./parity-matrix.md), not here — all matrix `Live?` cells
are `unconf` until the human-only Phase 0 Lane 2 check runs.

| Phase  | Name                                                                                                                              | Purpose (one sentence)                                                                                                                                                                                                                                                                                      | Depends on                                                                                                                                 | Owner surface / system                                                             | Do not build too early                                                                                                                     | Status                                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0**  | [Baseline, Governance & Evidence](./phase-00-baseline.md)                                                                         | Verify what is built, live, confirmed, and only planned before new parity work starts.                                                                                                                                                                                                                      | Existing repo + live evidence                                                                                                              | Docs, OpenSpec, parity matrix, evidence                                            | Later parity built on unconfirmed assumptions.                                                                                             | `PRD exists`                                                                                                                                                              |
| **1**  | Source-of-Truth Ownership Matrix                                                                                                  | Decide which system owns each record type, write path, conflict winner, sync direction, and repair path before features write in multiple places.                                                                                                                                                           | 0                                                                                                                                          | OpenSpec, architecture docs, `packages/api`                                        | Duplicate CRMs / duplicate content truth / unclear provider ownership.                                                                     | `PRD exists` ([ruled 2026-07-06](./phase-01-source-of-truth-ownership-matrix.md))                                                                                         |
| **2**  | [Site, Locale & Currency Foundation](./phase-02-site-locale-currency-foundation.md)                                               | Introduce site, locale, currency, and attribution primitives before ledger, receipts, public pages, and triggers depend on them.                                                                                                                                                                            | 1                                                                                                                                          | Tenant/site settings, public context, giving primitives                            | Ledger/receipts/batches/public pages on single-site, single-currency assumptions.                                                          | `PRD exists`                                                                                                                                                              |
| **3**  | [Minimum Permission & Role-Scoped Projection Foundation](./phase-03-minimum-permission-role-scoped-projection-foundation.md)      | Create the security floor for what each surface can see, edit, export, or project.                                                                                                                                                                                                                          | 1, 2                                                                                                                                       | `packages/api` authz, projection helpers, Mission Control                          | Custom fields / dashboards / reports / exports / portals before projection rules exist.                                                    | `PRD exists`                                                                                                                                                              |
| **4**  | [Identity & Account-Claiming Foundation](./phase-04-identity-account-claiming-foundation.md)                                      | Define how auth users, profiles, CRM people, donors, missionaries, staff, households, provider identities, and account claims connect.                                                                                                                                                                      | 2, 3                                                                                                                                       | Identity services, account claiming, CRM identity links, tenant membership         | Deeper portals / receipts / imports / CRM depth while identity links are implicit.                                                         | `PRD exists`                                                                                                                                                              |
| **5**  | [Public Website Runtime Contract](./phase-05-public-website-runtime-contract.md)                                                  | Decide where public pages run, how domains resolve, how content is delivered, how preview/publish/cache works, and how giving hands off to checkout.                                                                                                                                                        | 2, 3, 4                                                                                                                                    | Public Website, Web Studio, Payload CMS, donor public routes                       | Deeper public pages / events / campaigns before the runtime contract is settled.                                                           | `PRD exists`                                                                                                                                                              |
| **6**  | [Shared Communication Event Model](./phase-06-shared-communication-event-model.md)                                                | Create one communication history across receipts, statements, system emails, workflow/missionary messages, exports, delivery events, and suppressions.                                                                                                                                                      | 2, 3, 4, 5                                                                                                                                 | Communication services, CRM timeline, Resend/Mailchimp adapters, consent snapshots | System messages / Mailchimp sync / notifications with separate logs.                                                                       | `PRD exists`                                                                                                                                                              |
| **7**  | [Receipt & Statement Compliance Rules + Donor Identity/Credit Model](./phase-07-receipt-statement-compliance-and-donor-credit.md) | Define the rules engine for receipt/statement eligibility, corrections, voids, refunds, non-deductible portions, snapshots — **and** the legal/receipted/soft-credit/DAF donor credit model — before templates render anything.                                                                             | 2, 3, 4, 5, 6 — hard: Phase 4 isolation slice + Phase 6 comms spine/`sendEmail` seam + Phase 3 consent gate (PR #502), per the PRD's C1–C3 | Receipt/statement services, finance rules, donor document access                   | PDF templates or portal text deciding receipt truth.                                                                                       | `PRD exists` (epic #566, children #567–#586)                                                                                                                              |
| **8**  | [CRM Operating Foundation](./phase-08-crm-operating-foundation.md)                                                                | Make the CRM layer healthy, visible, and staff-operable in Mission Control (**scope re-groom pending under ADR-0001** — the Twenty write-enable tranche is withdrawn).                                                                                                                                      | **4 + 6 (hard)**, 3 & 7 (inherited seams) — per the PRD's dependency ledger                                                                | Mission Control CRM Operations, `packages/api/src/crm`                             | Deep CRM ops tooling before the re-groomed Asym-internal scope (#603) is ruled.                                                            | `PRD exists` (epic #587, children #588–#601; #599 closed 2026-07-06 — Tranche 2 withdrawn); **supersedes** `phase-01`; scope amended by ADR-0001, re-groom pending (#603) |
| **9**  | Full CRM Depth & Relationship Graph                                                                                               | Build the People & Churches backbone (people, churches, orgs, households, relationship graph, notes/activity net-new; task and duplicate-resolution surfaces over the existing task services and the Phase 4 merge contract; file sockets reserved for Phase 25; CRM-bound exports via Phase 3 governance). | 4, 3, 7 (party tables); 8 soft — operations-visibility only (ADR-0001; re-groom #603)                                                      | Mission Control CRM                                                                | A donor-detail extension only; it must become full operational CRM depth.                                                                  | `PRD exists` ([groomed 2026-07-06](./phase-09-full-crm-depth-relationship-graph.md); issues via /to-issues pending)                                                       |
| **10** | Custom CRM Fields & Configurable Entities                                                                                         | Let orgs define their own fields/entities (types, validation, layouts, import/export/report/workflow exposure, audit) without code changes.                                                                                                                                                                 | 9, 3                                                                                                                                       | Mission Control CRM configuration                                                  | Custom fields without visibility/edit/export/projection policy.                                                                            | `future`                                                                                                                                                                  |
| **11** | Full Role & Permission Configuration                                                                                              | Move beyond the minimum permission floor into staff-configurable groups, component/entity permissions, security tags, impersonation, and audits.                                                                                                                                                            | 3, 10                                                                                                                                      | Mission Control Admin, `packages/api` authz                                        | Replacing the Phase 3 projection floor; this deepens configuration.                                                                        | `future`                                                                                                                                                                  |
| **12** | Campaign, Designation, Contribution Ledger & Giving Cart                                                                          | Build the money backbone where one checkout carries multiple designations and one transaction yields multiple designation rows.                                                                                                                                                                             | 1, 2, 3, 4, 5, 7                                                                                                                           | Contributions/giving, public checkout, Mission Control finance                     | Donation-row-only logic; totals/exports/visibility must reconcile to designation rows.                                                     | `future`                                                                                                                                                                  |
| **13** | Offline Gift Batch Entry                                                                                                          | Give finance staff real batch entry for checks, cash, ACH, church/DAF/stock gifts, and offline recurring gifts.                                                                                                                                                                                             | 12, 7, 4, 9                                                                                                                                | Mission Control Contributions                                                      | Conflating with existing contribution-action batches (which act on existing rows).                                                         | `future`                                                                                                                                                                  |
| **14** | Soft Credits, Affiliated Donors & DAF Handling                                                                                    | Separate legal gift truth from relationship credit when DAFs, churches, foundations, or businesses give (builds on the Phase 7 credit model).                                                                                                                                                               | 9, 12, 7, 4                                                                                                                                | Contributions, CRM relationship view, reports                                      | Soft credit auto-creating tax-receipt ownership.                                                                                           | `future`                                                                                                                                                                  |
| **15** | Pledges & Offline Recurring Commitments                                                                                           | Track commitments separately from received cash (church/DAF/check/ACH/missionary support).                                                                                                                                                                                                                  | 9, 12, 14, 6, 3                                                                                                                            | Contributions and CRM                                                              | Dashboards conflating pledged support with received gifts.                                                                                 | `future`                                                                                                                                                                  |
| **16** | Receipt & PDF Template System                                                                                                     | Render official receipt/statement/document output from the Phase 7 approved facts.                                                                                                                                                                                                                          | 7, 12, 6                                                                                                                                   | PDF/Statement Studio, receipt/statement services                                   | Templates deciding receipt eligibility or financial truth.                                                                                 | `future`                                                                                                                                                                  |
| **17** | Year-End Statement Operations                                                                                                     | Give finance staff full statement-run operations beyond donor self-service downloads.                                                                                                                                                                                                                       | 7, 16, 12, 6, 9, 4                                                                                                                         | Mission Control Contributions/Finance                                              | Generating statements from ad-hoc year filters instead of eligibility snapshots.                                                           | `future`                                                                                                                                                                  |
| **18** | Accounting Exports & Reconciliation                                                                                               | Let finance export and reconcile gifts cleanly (codes, export profiles/runs, reconciliation, payouts, refunds, exceptions).                                                                                                                                                                                 | 12, 13, 14, 15, 7, 2                                                                                                                       | Mission Control Contributions/Accounting                                           | Exports becoming gift truth; they are downstream projections.                                                                              | `future`                                                                                                                                                                  |
| **19** | Public Missionary & Project Page Workflow                                                                                         | Make public missionary/project pages operationally linked to CRM, campaigns, designations, giving CTAs, and review/authorized-edit rules.                                                                                                                                                                   | 5, 9, 12, 13-lite, 3                                                                                                                       | Web Studio, Public Website, Missionary Workspace, Contributions                    | Loose CMS pages or public pages as financial source truth.                                                                                 | `future`                                                                                                                                                                  |
| **20** | CMS / Site Planner Dynamic Content Parity                                                                                         | Grow Web Studio into page tree, content explorer, menus, tags, dynamic listings, search, visibility, redirects, related content.                                                                                                                                                                            | 5, 3, 2                                                                                                                                    | Web Studio / Payload / Public Website                                              | Exposing raw Payload admin as normal ministry publishing UX.                                                                               | `future`                                                                                                                                                                  |
| **21** | Full Multi-Site, Language & Currency Management                                                                                   | Staff-facing management for multiple sites, languages, domains, localization, and currencies on top of the Phase 2 primitives.                                                                                                                                                                              | 2, 5                                                                                                                                       | Tenant settings, Web Studio, Contributions settings                                | New money truth outside the ledger; this deepens management UI.                                                                            | `future`                                                                                                                                                                  |
| **22** | Donor Dashboard Depth                                                                                                             | Turn the donor portal into a full self-service home (history, recurring, payment methods, receipts, statements, preferences, continuity).                                                                                                                                                                   | 4, 3, 12, 7, 6                                                                                                                             | Donor Portal                                                                       | Donor portal becoming a staff finance or CRM console.                                                                                      | `future`                                                                                                                                                                  |
| **23** | Missionary Dashboard Depth                                                                                                        | Give missionaries support-raising tools, partner stewardship, commitments, tasks, updates, resources, permitted exports.                                                                                                                                                                                    | 9, 12, 3, 15, 6                                                                                                                            | Missionary Workspace                                                               | Staff-only notes / donor scores / private donor data outside policy.                                                                       | `future`                                                                                                                                                                  |
| **24** | System Messages & Email Template Management                                                                                       | Let staff manage system message templates (receipts, failed payments, recurring, applications, reminders, thank-yous, workflow, statements).                                                                                                                                                                | 6, 2, 7, 3                                                                                                                                 | Email Studio / System Messages                                                     | Sends that skip communication events or preference/projection rules.                                                                       | `future`                                                                                                                                                                  |
| **25** | File Manager & Document Management                                                                                                | One file/document home for CRM attachments, workflow uploads, missionary resources, donor docs, public media, generated receipts, imports.                                                                                                                                                                  | 3, 9, the shipped workflow-orchestration runtime (not Phase 31), 16                                                                        | Documents/File Manager, CRM, Workflows, Web Studio                                 | Provider storing bytes becoming the owner of metadata/permissions/audit.                                                                   | `future`                                                                                                                                                                  |
| **26** | Mailchimp / Newsletter Sync with Suppression Handling                                                                             | Let missionaries safely export permitted partner contacts while respecting donor preferences and suppression state.                                                                                                                                                                                         | 6, 3, 23, 4                                                                                                                                | Missionary Workspace settings, Mission Control integrations                        | Export before suppression rules exist; a missionary must not override a donor unsubscribe.                                                 | `future`                                                                                                                                                                  |
| **27** | Peer-to-Peer Advocacy Campaigns                                                                                                   | Let donors run fundraiser pages tied to ministry campaigns while staff keep moderation, reporting, and financial truth.                                                                                                                                                                                     | 5, 12, 22, 3                                                                                                                               | Public Website, Donor Portal, Mission Control Contributions                        | Donor-created campaigns creating accounting truth.                                                                                         | `future`                                                                                                                                                                  |
| **28** | Event / Opportunity Workflows & Group Management                                                                                  | Support trips, trainings, retreats, registrations, capacity, payments, CRM context, communications, workflows.                                                                                                                                                                                              | 5, 9, 12, 6, the shipped workflow-orchestration runtime (not Phase 31)                                                                     | Event Hub, Public Website, CRM, Workflows                                          | Event payments bypassing the contribution ledger; ad-hoc event workflows.                                                                  | `future`                                                                                                                                                                  |
| **29** | Imports & Migration Tools                                                                                                         | Real migration tools (templates, mapping, dry run, validation, background import, row errors, duplicate detection, rollback, audit).                                                                                                                                                                        | Target schemas: 9, 12, 10, 25, 4, 3                                                                                                        | Mission Control Admin / Data Tools                                                 | Imports that skip source-of-truth, permissions, or identity-match rules.                                                                   | `future`                                                                                                                                                                  |
| **30** | Reporting & BI                                                                                                                    | Make reports a real product (standard + custom builder, scheduled, print/email/export, permission-aware fields).                                                                                                                                                                                            | 9, 12, 15, 13, 7, the shipped workflow-orchestration runtime (not Phase 31), 6                                                             | Report Studio                                                                      | Reports owning operational records; they read source truth + approved read models.                                                         | `future`                                                                                                                                                                  |
| **31** | Configurable Automation & Workflow Engine                                                                                         | SiteStacker Motion 2 parity: a staff-configurable process builder (workflows, roles, landmarks, tasks, triggers, forms, messages, dashboards).                                                                                                                                                              | 9, 10, 3/11, 25, 24, 6, 30                                                                                                                 | Automations/Workflows in Mission Control                                           | Inngest owning process truth; workflow truth stays in Asym.                                                                                | `future`                                                                                                                                                                  |
| **32** | Spark-Style Contribution Triggers                                                                                                 | Trigger workflows/follow-ups from settled contribution events (first-time, recurring, failed, large, campaign, source-code, soft-credit, tribute gifts).                                                                                                                                                    | **31 (firm, locked)**, 12, 6, 30, 3                                                                                                        | Automations, Contributions                                                         | Firing from raw Stripe events; use settled contribution events + idempotent triggers.                                                      | `future` (confirmed **separate** — see open questions)                                                                                                                    |
| **33** | Donor Development & Portfolio Management _(beyond-parity differentiator)_                                                         | Give development staff and regional reps portfolio-based donor and church-partnership development: portfolios derived from staff-assignment edges, cultivation pipelines (org-level and missionary support-raising), ask/proposal records, cadence tracking, and engagement scoring.                        | **9 (hard)**, 3, 6, 12; consumes 14, 15; enhanced by 30, 31                                                                                | Mission Control CRM (Development)                                                  | Ask/pipeline objects before the Phase 9 graph + Phase 12 settled gift facts exist; cultivation stage leaking into record lifecycle status. | `needs PRD` (added 2026-07-06; no SiteStacker equivalent — see open questions)                                                                                            |

_Depends-on legend: every entry is a phase number except "the shipped
workflow-orchestration runtime (not Phase 31)" (rows 25, 28, 30), which names
the durable workflow-orchestration runtime already built (see
[`parity-matrix.md`](./parity-matrix.md) area 24's current state) — not the
Phase 31 engine, which itself depends on Phases 25 and 30._

**Out of scope (deliberate):** **child sponsorship** — declared out now and
tracked as an out-of-scope row in [`parity-matrix.md`](./parity-matrix.md), so
it is visibly a decision, not a gap.

## Cross-phase dependency lanes

Six lanes group the work. Earlier lanes are foundations for later ones; within a
lane, lower numbers generally precede higher ones. Lanes overlap in time — the
lane grouping shows _what a phase leans on_, not a strict serial schedule.

**Lane 1 — Foundation & governance**

- Phase 0 — Baseline, Governance & Evidence
- Phase 1 — Source-of-Truth Ownership Matrix
- Phase 2 — Site, Locale & Currency Foundation
- Phase 3 — Minimum Permission & Role-Scoped Projection Foundation
- Phase 4 — Identity & Account-Claiming Foundation
- Phase 5 — Public Website Runtime Contract
- Phase 6 — Shared Communication Event Model
- Phase 7 — Receipt & Statement Compliance Rules + Donor Identity/Credit Model

**Lane 2 — CRM & operational records**

- Phase 8 — CRM Operating Foundation
- Phase 9 — Full CRM Depth & Relationship Graph
- Phase 10 — Custom CRM Fields & Configurable Entities
- Phase 11 — Full Role & Permission Configuration

**Lane 3 — Money & finance backbone**

- Phase 12 — Campaign, Designation, Contribution Ledger & Giving Cart
- Phase 13 — Offline Gift Batch Entry
- Phase 14 — Soft Credits, Affiliated Donors & DAF Handling
- Phase 15 — Pledges & Offline Recurring Commitments
- Phase 16 — Receipt & PDF Template System
- Phase 17 — Year-End Statement Operations
- Phase 18 — Accounting Exports & Reconciliation

**Lane 4 — Public & portal product depth**

- Phase 19 — Public Missionary & Project Page Workflow
- Phase 20 — CMS / Site Planner Dynamic Content Parity
- Phase 21 — Full Multi-Site, Language & Currency Management
- Phase 22 — Donor Dashboard Depth
- Phase 23 — Missionary Dashboard Depth

**Lane 5 — Communication, documents & integrations**

- Phase 24 — System Messages & Email Template Management
- Phase 25 — File Manager & Document Management
- Phase 26 — Mailchimp / Newsletter Sync with Suppression Handling

**Lane 6 — Fundraising, events, imports, reporting & automation**

- Phase 27 — Peer-to-Peer Advocacy Campaigns
- Phase 28 — Event / Opportunity Workflows & Group Management
- Phase 29 — Imports & Migration Tools
- Phase 30 — Reporting & BI
- Phase 31 — Configurable Automation & Workflow Engine
- Phase 32 — Spark-Style Contribution Triggers _(still separate — see below)_
- Phase 33 — Donor Development & Portfolio Management _(beyond-parity differentiator — see open questions)_

**Firm, locked dependencies** (from
[`phase-00-baseline.md`](./phase-00-baseline.md), do not reorder around them):
CRM foundation precedes CRM depth, custom fields, and anything reading CRM
relationships — with the ADR-0001 softening of Phase 8 → Phase 9: "CRM
foundation" here means the Asym system-of-record plus the Phase 4 isolation
plumbing and the Phase 7 party spine, **not** the Phase 8 operating layer;
the giving pipeline (Phase 12) precedes offline batch, pledges,
receipt/statement **rendering and operations** (Phases 16–17), and exports —
note the **rules-first inversion**: the receipt/statement _rules_ foundation
(Phase 7) comes _earlier_ than the ledger, and the ledger is later built to
produce the gift facts those rules evaluate; **the automation engine
(Phase 31) precedes contribution triggers (Phase 32).**

## Guardrails for issue and ticket generation

Before creating issues or tickets, check:

- What phase is this work part of? Which earlier phases does it depend on?
- Which **later** phases must not be blocked by this decision?
- Which product surface owns it? Which `packages/*` / API layer owns the
  business logic?
- Does it touch **source-of-truth ownership**? **permission/projection**
  policy? **identity/account linking**? **donor/missionary privacy**?
- Does it touch **money, receipts, statements, accounting, or taxes**?
- Does it touch **public/authenticated** boundaries?
- Does it touch **communication preferences, suppressions, or exports**?
- Does it create a **new provider dependency**?
- Does it need **evidence, tests, an ADR, or OpenSpec updates**?

> **Shared-contract warning:** if a ticket creates logic that a later phase will
> also need, prefer a shared `packages/*` / API contract over an app-local
> shortcut. App-local shortcuts in a foundation phase become the refactors of a
> later phase.

## Surface ownership reminder

| Surface / system         | Owns                                                                                                                                  | Must not become                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| **Mission Control**      | Staff/admin operations, CRM depth, finance, reports, workflows, settings                                                              | A thin wrapper around providers                   |
| **Public Website**       | Public ministry presence, storytelling, public giving entry points                                                                    | A staff or donor operations surface               |
| **Donor Portal**         | Donor self-service: receipts, statements, recurring gifts, profile/preferences                                                        | A staff CRM or finance console                    |
| **Missionary Workspace** | Support-raising, partner stewardship, tasks, updates, authorized public-page submissions                                              | A second Mission Control                          |
| **Payload / Web Studio** | Public content, page structure, drafts, publish/version state, media                                                                  | Source of CRM, giving, receipt, or identity truth |
| **CRM (Asym Postgres)**  | Operational relationship truth — the CRM system of record ([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)) | A provider console or a second source of truth    |
| **Stripe**               | Payment provider                                                                                                                      | Donor identity or receipt-rule source of truth    |
| **Resend / Mailchimp**   | Communication providers                                                                                                               | CRM or communication-history source of truth      |
| **Inngest**              | Job runner and workflow execution infrastructure                                                                                      | Workflow/process truth                            |
| **Storage provider**     | File bytes                                                                                                                            | File metadata, permissions, or audit truth        |

## Tracking, evidence & open questions

- **Resolved (2026-07-06) — the "Phase 1" Source-of-Truth Ownership Matrix now
  has a PRD.**
  [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md)
  records — per record type — which system owns the truth, who may write it,
  who wins a conflict, and how a divergence is repaired, backed by
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
  (Asym Postgres owns all CRM truth; Twenty CRM is retired as a product
  dependency). OpenSpec `platform-boundaries` and the matrix "Owning surface"
  column remain binding; the ownership matrix is now the per-record-type
  authority they pointed toward.

- **Phase 8 re-groom is pending (#603).** ADR-0001 withdrew Phase 8's Twenty
  write-enable tranche (Notes). The surviving operating-foundation concerns
  (staff operations visibility, CRM data health, alert routing) will be
  re-groomed against Asym-internal subjects in a dedicated session (#603)
  before any Phase 8 build starts; the Phase 8 PRD carries a scope-amendment
  banner until the re-groomed PRD lands. **Phase 9 does not wait on the
  re-groom** — per ADR-0001, Phase 8 is a soft, operations-visibility-only
  dependency for Phase 9. The ADR-0001 issue re-scoping was **applied
  2026-07-06**: the cleanup ticket is filed as #602, and #466–#476 (the old
  `phase-01` issues) plus #599 (the withdrawn Notes write-enable tranche) are
  closed as superseded.

- **Phase 7 is a cross-cutting foundation.** It owns not just receipt/statement
  compliance rules but the **donor identity/credit model** (party graph,
  households, organizations, soft credits, DAF, tribute, matching). Later phases
  **consume, not re-derive** it: Phase 9 (CRM depth) builds on the Phase 7 party
  tables; Phase 14 (soft credits/DAF) builds on the Phase 7 credit model; Phase
  16 (templates) and Phase 17 (statement ops) render the Phase 7 approved facts.
  Do not re-model those concepts in a later phase.

- **Spark-style contribution triggers are confirmed separate (Phase 32).** The
  parity matrix tracks Spark triggers (area #25) as distinct from the automation
  engine (area #24), and Phase 0 locks "automation engine precedes contribution
  triggers." **Remaining open question:** the exact boundary between the general
  workflow engine (Phase 31) and gift-specific triggers (Phase 32) — whether
  Phase 32 is a thin trigger catalog on top of Phase 31 or a distinct surface.
  The matrix keeps this open too (area #25, _"relationship to #24"_). Resolve
  when Phase 31 is groomed.

- **PR #465 review tracking gaps** — these are **matrix/evidence tracking
  concerns, not phase-sequencing concerns**; future agents should not confuse
  them with implementation readiness:
  1. _Child sponsorship out-of-scope row_ — **already present** in
     [`parity-matrix.md`](./parity-matrix.md) (status grid + detail block), so
     this gap is addressed.
  2. _Lane 2 live-confirmation ownership_ — the human-only live check has a
     named accountable owner (the platform owner/founder, per
     [`phase-00-baseline.md`](./phase-00-baseline.md) task 0A-4), but every
     matrix `Live?`/`Confirmed?` cell stays `unconf`/`No` until that check runs.
     Clearer per-area Lane 2 tracking in the matrix remains an open follow-up.

- **Phase 33 (Donor Development & Portfolio Management) added 2026-07-06** — a
  **beyond-parity differentiator**: SiteStacker has no moves-management or
  portfolio product (verified against the training docs), so this row carries no
  parity-matrix obligation; RE NXT / Salesforce Nonprofit Cloud establish the
  large-org expectation. Three-object domain when groomed: portfolio assignments
  (= Phase 9 staff-assignment edges, portfolios derived from active edges),
  pipeline enrollments carrying cultivation stage, and ask/proposal records tied
  to Phase 12 campaigns/designations. Missions inversion supported: org-level
  rep portfolios (churches + major donors) **and** missionary-level
  support-raising pipelines. Phase 33 also owns **engagement scoring**
  (previously unowned). Phase 9 reserves for it: the staff-assignment edge-type
  family (roles as data: donor_rep / regional_rep / church_relations /
  mobilizer), the header owner-chip contract (N role-qualified assignees + one
  primary, reading edges only), a hidden record-tab socket + an Overview
  cultivation/next-ask socket, and the guardrail that **cultivation stage is
  never a record lifecycle status and asks are never edges or custom fields**.

- **Staff-side payment methods — disposition settled 2026-07-06** (SiteStacker's
  record-level Payment Methods tab, decomposed compliantly): the **read-only
  instruments panel ships in Phase 9** (brand/last4/expiry/default via Stripe —
  explicitly non-sensitive metadata, zero PCI impact); a **"request payment
  method update" secure-link action socket** (setup-mode Checkout / billing-
  portal deep link, sent + audited via the Phase 6 seam) lights up with Phase 6;
  **phone gifts (Phase 13) run two lanes** — send-secure-link by default,
  org-level opt-in to Stripe-hosted MOTO surfaces only; **offline recurring
  methods are attributes of the commitment** (Phase 15, no stored instrument);
  the **donor self-service wallet is Phase 22**. **Hard program guardrail: staff
  never key card data into any surface this platform renders** — staff-keyed
  PANs are a gated Stripe MOTO channel and would break the platform's SAQ-A
  posture; orgs that insist use Stripe-hosted gated surfaces under their own PCI
  responsibility, outside this app.

- **Do not present any later phase (9–33) as implemented or live.** Phase 9's
  PRD landed 2026-07-06 (groomed, not built); no PRD files exist for phases
  10–33 yet; the matrix's `Built?` cells marked `(v)` still need per-area code
  verification, and all `Live?` cells are `unconf`.

## Related documents

- [`README.md`](./README.md) — program charter, scope, guardrails, sequencing.
- [`parity-matrix.md`](./parity-matrix.md) — the 25-area inventory (tracking
  source of truth), with per-area `Built?/Live?/Confirmed?`.
- [`phase-00-baseline.md`](./phase-00-baseline.md) — the Phase 0 plan,
  definition of done, provisional order, and locked dependencies.
- [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md)
  — the Phase 1 ownership ruling (system of record per record type) and the
  Twenty retirement record.
- [`docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md`](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
  — the keystone decision: Asym Postgres owns all CRM truth; Twenty CRM is
  retired as a product dependency.
- Phase PRDs: [`phase-02`](./phase-02-site-locale-currency-foundation.md),
  [`phase-03`](./phase-03-minimum-permission-role-scoped-projection-foundation.md),
  [`phase-04`](./phase-04-identity-account-claiming-foundation.md),
  [`phase-05`](./phase-05-public-website-runtime-contract.md),
  [`phase-06`](./phase-06-shared-communication-event-model.md),
  [`phase-07`](./phase-07-receipt-statement-compliance-and-donor-credit.md),
  [`phase-08`](./phase-08-crm-operating-foundation.md),
  [`phase-09`](./phase-09-full-crm-depth-relationship-graph.md).
- OpenSpec: `openspec/specs/platform-boundaries/spec.md`,
  `platform-surfaces/spec.md`, `platform-product-intent/spec.md`, and
  `openspec/changes/sitestacker-parity/`.
- Root `CONTEXT.md` — the durable product glossary.
