# Asym Missions Platform — Program Roadmap (v2)

_The source-of-truth roadmap for the SiteStacker parity program and the full
Asym product build-out. Adopted 2026-07-07._

> **Precedence.** This file is the **source of truth for phase architecture:
> the phase set, numbering, ordering, dependencies, and per-phase scope
> summaries.** [`phase-map.md`](./phase-map.md) remains the short orientation
> guide and mirrors this file's table; if the two ever disagree, **this file
> wins** and the mirror must be fixed. Binding product boundaries still live in
> OpenSpec (`platform-boundaries`, `platform-surfaces`,
> `platform-product-intent`, `platform-principles`) and
> [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md);
> nothing here overrides them. Groomed phase PRDs
> (`phase-00` … `phase-09`) remain the binding scope for their phases — this
> roadmap frames them, it does not re-open them.

## How to read this roadmap

- **Phase numbers = current build order.** A lower number is groomed and built
  before a higher number **unless the dependency column says otherwise** —
  dependencies gate starts, not numbers. Lanes (below) show what can run in
  parallel.
- **Every phase has a stable slug** (e.g. `custom-fields`). New PRDs, issues,
  and tickets must cite phases as **"Phase N (Name)"** — never a bare number —
  so any future re-sequencing can be swept mechanically.
- **Renumbering governance:** if the program ever re-sequences again, the
  change lands as a new roadmap revision with an old→new mapping table (like
  [the v1→v2 map below](#renumbering-map-v1--v2)), plus a same-commit
  congruence sweep of every PRD, doc, and open GitHub issue that cites a moved
  number. Partial renumbering is forbidden.
- **Statuses are conservative.** `PRD exists` means a groomed PRD file is in
  this folder — it does **not** mean built or live. `future (needs PRD)` means
  the phase is recognized and scoped here at roadmap depth only; everything in
  its section is **direction, not commitment** until the phase is groomed.
  `Built?`/`Live?` truth for existing code lives in
  [`parity-matrix.md`](./parity-matrix.md).
- **Per-phase sections are roadmap-depth, not PRDs.** They exist so that (a)
  nothing is forgotten, (b) grooming starts from a complete feature inventory,
  and (c) earlier phases can reserve the right seams. Where the best build
  approach is genuinely unsettled, the section says so explicitly under **Open
  questions** — those are resolved by research + founder decision when the
  phase is groomed, not silently assumed here.

## Executive summary — what v2 changes and why

Roadmap v2 replaces the 34-phase (0–33) v1 ordering that lived in
`phase-map.md`. **Phases 0–9 are unchanged** — they are the committed,
groomed program of record (PR #465) and v2 is congruent with them. From
Phase 10 up, v2 makes **five ordering corrections** and adds **seven new
phases** (34 → 41 phases, numbered 0–40):

**Ordering corrections** (each is a dependency-safety argument, not taste):

1. **Sensitive-ministry safety moves ahead of extensibility.** A new safety
   foundation (Phase 10) lands immediately after CRM depth, **before** custom
   fields (11), full permissions (12), and public missionary pages (22).
   Restricted-country workers and member-care confidentiality need a data
   classification model **before** tenants can mint arbitrary fields or
   publish missionary content — otherwise custom fields become a leak path
   that no later phase can fully repair.
2. **Donor credit operations move ahead of offline batch entry.** v1 had
   batch entry before soft-credit/DAF handling; that is backwards — batch
   entry must capture DAF, soft-credit, tribute, and matching-gift facts at
   the moment of entry, so the credit operations phase (14) now precedes
   batch entry (15).
3. **System messages / template management moves much earlier** (v1 Phase 24
   → v2 Phase 17). Pledge reminders (16), receipt/PDF rendering (18),
   statement delivery (19), and workflow notifications (34) all need governed
   templates; putting the template product after statements meant statements
   would ship on ungoverned ad-hoc sends.
4. **Donor development moves ahead of Missionary Workspace depth** (v1 Phase
   33 → v2 Phase 27, before workspace depth at 28). The missionary workspace
   exposes a **safe slice of support-raising operations** — portfolios,
   appeals, referrals, partner health. Those concepts must exist as
   staff-side truth first, or the workspace invents its own parallel models.
5. **The workflow engine moves ahead of events/opportunities** (engine at 34,
   events at 37). Trips, trainings, applications, and registrations are
   workflow-driven products; building an Event Hub before workflow truth
   exists would create a second, duplicate process engine.

**New phases** (each was hidden inside another phase in v1, and each hides a
different data model, permission model, or provider boundary that deserves
its own grooming):

- **Phase 10 — Sensitive-Data Classification & Restricted-Ministry Safety
  Foundation** (the early safety layer; full member-care operations stay
  later, at 38).
- **Phase 21 — Missionary Field Accounts & Support Balances** (deputized
  fundraising operations: finance-closed organization-controlled support
  balances, expense obligations, and external payment evidence — distinct
  from donation, accounting, and payroll truth).
- **Phase 26 — Support Hub & Conversation Management** (inbound
  email/conversations/routing — distinct from outbound comms truth).
- **Phase 31 — Platform API, Webhooks & Connector Framework** (one governed
  integration spine before provider-specific syncs multiply).
- **Phase 38 — Member Care, Crisis & Restricted-Ministry Operations** (the
  deep care product on top of the Phase 10 foundation).
- **Phase 39 — Mobile, Low-Bandwidth & Conflict-Safe Field Experience** (the
  field-reality hardening pass as a product contract, not an afterthought).
- **Phase 40 — Data Stewardship, Global Search & AI Operator Workbench**
  (deliberately last: AI assistance is only safe on top of stable truth,
  permissions, and audit).

**Inputs evaluated.** v2 was produced by evaluating the external
"asym_missions_crm_parity_phase_architecture_v5" roadmap document (2026-07-07)
against the committed program, the repo, and fresh research. v5's structural
corrections were adopted; its errors were **not**: v2 fixes a dependency cycle
in v5 (its File Manager phase depended on its Platform API phase, which
depended on Imports, which depended on File Manager), trims spurious
dependencies (e.g. mobile UX does not depend on imports), converts v5's
forward references into explicit "enhanced by" links, and keeps committed
Phase 0–9 titles exactly as their PRDs state them.

## The master phase table

Legend — **Hard deps**: must ship first (a number in **bold** is a firm,
locked dependency from `phase-00-baseline.md`). **Soft / consumes**: improves
or feeds this phase but does not gate its start; "enhanced by" links point
forward and never gate anything. Statuses: `PRD exists` / `re-groom pending` /
`grilling in progress` / `future (needs PRD)`.

| #      | Slug                         | Phase                                                                                                                             | Hard deps                                             | Soft / consumes / enhanced by                         | Owner surface / system                                          | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0**  | `baseline`                   | [Baseline, Governance & Evidence](./phase-00-baseline.md)                                                                         | —                                                     | —                                                     | Docs, OpenSpec, parity matrix, evidence                         | `PRD exists`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **1**  | `ownership-matrix`           | [Source-of-Truth Ownership Matrix](./phase-01-source-of-truth-ownership-matrix.md)                                                | 0                                                     | —                                                     | OpenSpec, architecture docs, `packages/api`                     | `PRD exists` (ruled 2026-07-06)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **2**  | `site-locale-currency`       | [Site, Locale & Currency Foundation](./phase-02-site-locale-currency-foundation.md)                                               | 1                                                     | —                                                     | Tenant/site settings, public context, giving primitives         | `PRD exists` (epic #477)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **3**  | `permission-floor`           | [Minimum Permission & Role-Scoped Projection Foundation](./phase-03-minimum-permission-role-scoped-projection-foundation.md)      | 1, 2                                                  | —                                                     | `packages/api` authz/projections, Mission Control               | `PRD exists` (epic #489)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **4**  | `identity-claiming`          | [Identity & Account-Claiming Foundation](./phase-04-identity-account-claiming-foundation.md)                                      | 2, 3                                                  | —                                                     | Identity services, account claiming, tenant membership          | `PRD exists` (epic #503)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **5**  | `public-runtime`             | [Public Website Runtime Contract](./phase-05-public-website-runtime-contract.md)                                                  | 2, 3, 4                                               | —                                                     | Public Website, Web Studio, Payload, donor public routes        | `PRD exists` (epic #520)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **6**  | `comms-event-model`          | [Shared Communication Event Model](./phase-06-shared-communication-event-model.md)                                                | 2, 3, 4, 5                                            | —                                                     | Communication services, CRM timeline, provider adapters         | `PRD exists` (epic #550)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **7**  | `receipt-rules-credit`       | [Receipt & Statement Compliance Rules + Donor Identity/Credit Model](./phase-07-receipt-statement-compliance-and-donor-credit.md) | **4, 6, 3** (PRD C1–C3)                               | 2, 5                                                  | Receipt/statement services, finance rules, party/credit model   | `PRD exists` (epic #566)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **8**  | `crm-operating`              | [CRM Operating Foundation](./phase-08-crm-operating-foundation.md) _(re-groomed → Operations Observability & Data-Health)_        | none (build-now core)                                 | 6 (emailed path), 9 (reserved sockets)                | Mission Control CRM Operations, `packages/api/src/crm`          | `PRD exists` (re-groomed 2026-07-07, ADR-0001; epic #587)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **9**  | `crm-depth-graph`            | [Full CRM Depth & Relationship Graph](./phase-09-full-crm-depth-relationship-graph.md)                                            | **4, 7, 3**                                           | 8 (operations visibility only)                        | Mission Control CRM (Asym Postgres)                             | `PRD exists` (epic #604 + #605–#627)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **10** | `sensitive-safety`           | [Sensitive-Data Classification & Restricted-Ministry Safety Foundation](./phase-10-sensitive-data-safety.md)                      | **3, 9**                                              | 4, 5, 6                                               | Mission Control, security projections, Member Care seams        | `PRD exists` (grilled 2026-07-07; epic #628 + #629–#641)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| **11** | `custom-fields`              | Custom Fields & Custom Collections                                                                                                | 9, 10, 3                                              | —                                                     | Mission Control CRM configuration                               | `PRD exists` (epic #645 + #646–#664)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **12** | `permission-config`          | Full Role & Permission Configuration                                                                                              | 3, 10, 11                                             | —                                                     | Mission Control Admin, `packages/api` authz                     | `PRD exists` (epic #665 + #666–#687)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **13** | `contribution-ledger`        | Campaign, Designation, Contribution Ledger & Giving Cart                                                                          | 1, 2, 3, 4, 5, 7                                      | —                                                     | Contributions/giving, public checkout, MC finance               | `PRD exists` (epic #690 + #691–#713)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **14** | `donor-credit-ops`           | [Donor Credit Operations: Soft Credits, DAFs, Tributes & Matching Gifts](./phase-14-donor-credit-operations.md)                   | 13, 7, 9                                              | enhanced by 17 (tribute letters)                      | Contributions, CRM views, reports                               | `PRD exists` (epic #719 + #720–#741)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **15** | `gift-batch-entry`           | Offline Gift & Batch Entry                                                                                                        | **13**, 14, 7                                         | 9; enhanced by 16 (fulfillment matching)              | Mission Control Contributions                                   | `PRD exists (epic #758 + #759–#786)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **16** | `pledges-commitments`        | Pledges & Recurring Commitments                                                                                                   | **2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15**           | enhanced by 17 (message rendering/delivery)           | Contributions and CRM                                           | `PRD exists` (epic #793 + #794–#837; groomed-not-dispatched)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **17** | `system-messages`            | [System Messages & Template Management](./phase-17-system-messages-template-management.md)                                        | 6, 2, 3, 7                                            | —                                                     | Email Studio / System Messages                                  | `PRD exists` (epic #873 + #874–#905; groomed-not-dispatched)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **18** | `document-templates`         | [Receipt & PDF Template System](./phase-18-receipt-pdf-template-system.md)                                                        | 7, **13**, 17                                         | 6                                                     | Document Studio / Generated Documents                           | `PRD exists` (epic #907 + #908–#961; #908–#910 ready frontier)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **19** | `statement-operations`       | [Year-End Statement Operations](./phase-19-year-end-statement-operations.md)                                                      | 6, 7, 12, **13**, 14, 15, 17, 18                      | 9, 4                                                  | Mission Control Contributions/Finance                           | `PRD exists` (epic #977 + #978–#1031; blocked/not-dispatched)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **20** | `accounting-exports`         | [Accounting Exports & Reconciliation](./phase-20-accounting-exports-reconciliation.md)                                            | **2, 3, 4, 7, 12, 13, 14, 15**                        | 16                                                    | Mission Control Accounting                                      | `PRD exists` (implementation-ready 2026-07-27; not implemented)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| **21** | `field-accounts`             | [Missionary Field Accounts & Support Balances](./phase-21-field-accounts.md)                                                      | **1**, 3, 4, 6, **9, 10, 12**, 13, **15**, 17, 18, 20 | 16                                                    | Mission Control Finance/Admin, Missionary Workspace projection  | `PRD exists` (implementation-ready 2026-08-02; spec #1108; epic #1109 + lane epics #1110–#1120 + P21-01–P21-101 published and dependency-governed; not implemented; D1-D28 scope-frozen; D17/D27 activation requires certified Phase 29 opening-source private-byte custody and Phase 30 import-session staging; selected private-byte-bearing D10/D14/D18/D22/D24/D25/D28 and D26 package/lifecycle slices require their exact owner seams, while metadata/manual/feed paths remain separate; D28 requires Phase 29/30 only for its selected private-byte/bulk lane and otherwise weakens no owning-phase prerequisite) |
| **22** | `public-ministry-pages`      | Public Missionary & Project Page Workflow                                                                                         | 5, 9, 10, 13, 3                                       | 15, 16 (offline gifts + commitments in progress bars) | Web Studio, Public Website, Missionary Workspace, Contributions | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **23** | `web-studio-cms`             | CMS / Site Planner Dynamic Content Parity                                                                                         | 5, 3, 2                                               | 22                                                    | Web Studio, Payload, Public Website                             | `future (needs PRD)` — deps allow an early start after Phase 5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **24** | `multi-site-management`      | Full Multi-Site, Language & Currency Management                                                                                   | 2, 5, 13, 20, 23                                      | 17                                                    | Tenant settings, Web Studio, Contributions settings             | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **25** | `donor-portal-depth`         | Donor Dashboard Depth                                                                                                             | 4, 3, 13, 7, 6                                        | 17, 19                                                | Donor Portal                                                    | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **26** | `support-hub`                | Support Hub & Conversation Management                                                                                             | 6, 3, 4, 9, 17                                        | —                                                     | Support Hub, communication services, `packages/api`             | `future (needs PRD)` — **new in v2**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **27** | `donor-development`          | Donor Development & Portfolio Management _(beyond-parity differentiator)_                                                         | **9**, 3, 6, 13                                       | consumes 14, 16; 26; enhanced by 33, 34               | Mission Control CRM (Development)                               | `future (needs PRD)` (was v1 Phase 33)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| **28** | `missionary-workspace-depth` | Missionary Workspace Depth & Support-Raising CRM                                                                                  | 9, 13, 16, 6, 3, 27                                   | 26                                                    | Missionary Workspace                                            | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **29** | `files-documents`            | File Manager & Document Management                                                                                                | 3, 9                                                  | 18, 26, the shipped workflow-orchestration runtime    | Documents/File Manager, CRM, Workflows, Web Studio              | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **30** | `imports-migration`          | Imports & Migration Tools                                                                                                         | 9, 13, 11, 29, 4, 3                                   | 14                                                    | Mission Control Data Tools                                      | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **31** | `platform-api`               | Platform API, Webhooks & Connector Framework                                                                                      | 1, 3, 4, 6                                            | 9, 13                                                 | Platform API, Integrations, Admin                               | `future (needs PRD)` — **new in v2**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **32** | `newsletter-sync`            | Mailchimp / Newsletter Sync with Suppression Handling                                                                             | 6, 3, 28, 4, 31                                       | —                                                     | Missionary Workspace settings, MC integrations                  | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **33** | `reporting-bi`               | Reporting & BI / Report Studio                                                                                                    | 9, 13, 7, 6, 3                                        | 11, 15, 16, 30                                        | Report Studio                                                   | `future (needs PRD)` — deps allow an early start (see lanes)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **34** | `workflow-engine`            | Configurable Automation & Workflow Engine                                                                                         | 9, 11, 12, 29, 17, 6                                  | 13 (registration fees), 33                            | Automations/Workflows in Mission Control                        | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **35** | `contribution-triggers`      | Spark-Style Contribution Triggers                                                                                                 | **34**, 13, 6, 3                                      | 33                                                    | Automations, Contributions                                      | `future (needs PRD)` (confirmed separate from 34)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **36** | `p2p-campaigns`              | Peer-to-Peer & Advocacy Campaigns                                                                                                 | 5, 13, 25, 3, 22                                      | —                                                     | Public Website, Donor Portal, Contributions                     | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **37** | `events-groups`              | Event / Opportunity Workflows & Group Management                                                                                  | 5, 9, 13, 6, 29, 34, 36                               | 10                                                    | Event Hub, Public Website, CRM, Workflows                       | `future (needs PRD)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **38** | `member-care-ops`            | Member Care, Crisis & Restricted-Ministry Operations                                                                              | 10, 3, 4, 9, 29                                       | 6, 12, 26, 34                                         | Member Care, Mission Control, security-sensitive projections    | `future (needs PRD)` — **new in v2**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **39** | `field-first-ux`             | Mobile, Low-Bandwidth & Conflict-Safe Field Experience                                                                            | 3, 4, 9, 28                                           | 31                                                    | Cross-surface UX, `packages/api` concurrency contracts          | `future (needs PRD)` — **new in v2**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **40** | `data-stewardship-ai`        | Data Stewardship, Global Search & AI Operator Workbench                                                                           | 3, 4, 8, 9, 13, 30, 33                                | 6, 11, 34                                             | Mission Control, Data Tools, Search, AI Assist                  | `future (needs PRD)` — **new in v2**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

**Out of scope (deliberate):** **child sponsorship** (tracked as an
out-of-scope row in [`parity-matrix.md`](./parity-matrix.md)).
**Adjacent-but-not-in-program:** platform SaaS operations (tenant
provisioning/self-signup, the platform's own subscription billing, plan
gating) — real work, but it is platform business infrastructure, not
missions-org capability, and is tracked outside this parity roadmap.

## Renumbering map (v1 → v2)

Every document or issue written before 2026-07-07 that cites a phase number
above 9 uses the **v1** numbering and must be read through this map (the
same-day congruence sweep updated all live documents and open issues; this
table is the decoder for anything that escaped or for external copies).

| v1 # | Phase (v1 name)                                          | v2 #                           | Notes                                                                                                       |
| ---- | -------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 0–9  | (unchanged)                                              | 0–9                            | Committed program of record — identical                                                                     |
| 10   | Custom CRM Fields & Configurable Entities                | **11**                         | Safety foundation (new 10) inserted ahead                                                                   |
| 11   | Full Role & Permission Configuration                     | **12**                         |                                                                                                             |
| 12   | Campaign, Designation, Contribution Ledger & Giving Cart | **13**                         |                                                                                                             |
| 13   | Offline Gift Batch Entry                                 | **15**                         | Now **after** donor credit operations                                                                       |
| 14   | Soft Credits, Affiliated Donors & DAF Handling           | **14**                         | Number unchanged; renamed + expanded (tributes, matching)                                                   |
| 15   | Pledges & Offline Recurring Commitments                  | **16**                         |                                                                                                             |
| 16   | Receipt & PDF Template System                            | **18**                         |                                                                                                             |
| 17   | Year-End Statement Operations                            | **19**                         |                                                                                                             |
| 18   | Accounting Exports & Reconciliation                      | **20**                         |                                                                                                             |
| 19   | Public Missionary & Project Page Workflow                | **22**                         |                                                                                                             |
| 20   | CMS / Site Planner Dynamic Content Parity                | **23**                         |                                                                                                             |
| 21   | Full Multi-Site, Language & Currency Management          | **24**                         |                                                                                                             |
| 22   | Donor Dashboard Depth                                    | **25**                         |                                                                                                             |
| 23   | Missionary Dashboard Depth                               | **28**                         | Renamed: Missionary Workspace Depth & Support-Raising CRM; now after Donor Development                      |
| 24   | System Messages & Email Template Management              | **17**                         | Moved much earlier                                                                                          |
| 25   | File Manager & Document Management                       | **29**                         |                                                                                                             |
| 26   | Mailchimp / Newsletter Sync                              | **32**                         | Now after the connector framework (31)                                                                      |
| 27   | Peer-to-Peer Advocacy Campaigns                          | **36**                         |                                                                                                             |
| 28   | Event / Opportunity Workflows & Group Management         | **37**                         | Now after the workflow engine (34)                                                                          |
| 29   | Imports & Migration Tools                                | **30**                         |                                                                                                             |
| 30   | Reporting & BI                                           | **33**                         |                                                                                                             |
| 31   | Configurable Automation & Workflow Engine                | **34**                         |                                                                                                             |
| 32   | Spark-Style Contribution Triggers                        | **35**                         |                                                                                                             |
| 33   | Donor Development & Portfolio Management                 | **27**                         | Moved ahead of Missionary Workspace depth                                                                   |
| —    | _(new in v2)_                                            | **10, 21, 26, 31, 38, 39, 40** | Safety foundation; field accounts; Support Hub; platform API; member care ops; field-first UX; AI workbench |

**Collision warning for anyone sweeping old text:** v1-25 (Files) became 29
while v2-25 is the old 22 (Donor Dashboard); v1-13/17/27 similarly collide
with different v2 phases. Never renumber by bare number — always anchor on
the phase **name**.

## Dependency lanes & parallelism

Lanes group phases by what they lean on. Earlier lanes are foundations for
later ones; **lanes overlap in time** — a phase starts when its hard
dependencies ship, not when its number comes up. Within a lane, lower numbers
generally precede higher ones.

| Lane                                              | Phases | Theme                                                                                                                                 |
| ------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Foundations & governance**                  | 0–7    | Truth ownership, site/locale/currency context, permission floor, identity, public runtime, communication history, finance/legal rules |
| **B — CRM backbone & safety**                     | 8–12   | CRM operations health, the Party graph, sensitive-data safety, custom fields, full permissions                                        |
| **C — Money & finance backbone**                  | 13–21  | Designation ledger, donor credit, batch entry, pledges, templates, statements, accounting, field accounts                             |
| **D — Public web & content**                      | 22–24  | Public ministry pages, Web Studio/CMS depth, multi-site/language/currency management                                                  |
| **E — Engagement & stewardship surfaces**         | 25–28  | Donor portal depth, Support Hub, donor development, missionary workspace depth                                                        |
| **F — Data, documents, integrations & reporting** | 29–33  | Files, imports, platform API/connectors, newsletter sync, Report Studio                                                               |
| **G — Automation & advanced operations**          | 34–40  | Workflow engine, contribution triggers, P2P, events, member care, field-first UX, AI workbench                                        |

**What can run in parallel once Phase 9 ships** (the current frontier):

- **Lane B remainder (10 → 11 → 12)** and **Lane C start (13 → 14 → …)** are
  independent chains and can be groomed/built in parallel.
- **Phase 17 (System Messages)** needs only 6 + 2 + 3 + 7 — it can run alongside
  either chain.
- **Phase 23 (Web Studio/CMS)** needs only 5 + 3 + 2 — it can start early
  whenever content-lane capacity exists.
- **Phase 31 (Platform API framework)** needs only 1/3/4/6 hard — its spine
  can also be pulled forward if integration pressure demands, though its
  useful payload grows with 9 + 13.
- **Phase 33 (Reporting)** can start once 13 (and ideally 16) ship — its
  number reflects priority relative to the engagement surfaces, not a
  dependency wall.

**Firm, locked dependencies** (from
[`phase-00-baseline.md`](./phase-00-baseline.md), carried through v2 —
do not reorder around them):

- CRM foundation precedes CRM depth, custom fields, and anything reading CRM
  relationships (with the ADR-0001 softening: for Phase 9, "CRM foundation"
  means the Asym system-of-record + Phase 4 isolation + Phase 7 party spine,
  not the Phase 8 operating layer).
- The giving pipeline (**Phase 13**) precedes offline batch (15), pledges
  (16), receipt/statement **rendering and operations** (18–19), and exports
  (20) — with the **rules-first inversion**: the receipt/statement _rules_
  foundation (Phase 7) came _earlier_ than the ledger, and the ledger is
  built to produce the gift facts those rules evaluate.
- The automation engine (**Phase 34**) precedes contribution triggers
  (**Phase 35**).

## The phases in depth

Phases 0–9 are the committed program of record — their sections here are
orientation summaries; the PRDs are binding. Phases 10–40 are roadmap-depth:
complete feature inventories and boundaries so grooming starts from
everything, with open questions marked instead of guessed.

---

### Phase 0 — Baseline, Governance & Evidence (`baseline`)

**What it is.** The governance spine: keep **Built**, **Live**, and
**Confirmed** separate so no later phase builds on guesses. Lane 1 is
repo-provable evidence; Lane 2 is human live confirmation. Every future PRD
inherits this evidence-and-stop-condition discipline.

**Status.** `PRD exists` —
[`phase-00-baseline.md`](./phase-00-baseline.md); evidence at
`docs/ops/phase-evidence/2026-07-03_sitestacker-parity-phase-00-baseline.md`.
Phase 0 also originated the firm, locked dependencies carried in the lanes
section above. The human-only Lane 2 live check (owner: the founder) remains
outstanding — all parity-matrix `Live?` cells stay `unconf` until it runs.

**Guardrail.** Never claim live behavior without Lane 2 confirmation.

---

### Phase 1 — Source-of-Truth Ownership Matrix (`ownership-matrix`)

**What it is.** The ownership spine: for every record type, name the system
of record, the only write path, the conflict winner, and the repair path.
Ruled 2026-07-06 with an 18-row matrix
([`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md))
backed by
[ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md):
**Asym Postgres owns all CRM truth; Twenty CRM is retired as a product
dependency; providers execute or store artifacts — they never own Asym
truth.**

**Standing rule for every later phase.** If a phase introduces a new record
type (field accounts, conversations, workflow definitions, files, fundraiser
pages, care records…), it must **extend the ownership matrix in the same
PRD** — no record type ships without an owner row.

---

### Phase 2 — Site, Locale & Currency Foundation (`site-locale-currency`)

**What it is.** Puts **Site, locale, currency, Entry Method, and Source
Code** context under every public and money flow before deeper finance work,
so ledger/receipt/statement/accounting records never have to be backfilled
with context they should have carried from day one. Original currency is
preserved alongside reporting currency.

**Status.** `PRD exists`
([`phase-02-site-locale-currency-foundation.md`](./phase-02-site-locale-currency-foundation.md),
epic #477).

**What later phases take from it.** Phase 13 stamps every contribution with
site/entry-method/source-code; Phase 17 keys template overrides by
site/locale; Phase 24 builds the staff management UX on these primitives —
none of them re-model context.

---

### Phase 3 — Minimum Permission & Role-Scoped Projection Foundation (`permission-floor`)

**What it is.** The security **floor**: allow-listed, role-scoped
projections deciding what each surface can see, edit, export, or project —
plus the consent gate for outbound email (PR #502). It is deliberately _not_
the full permissions product (that is Phase 12); its job is to stop leaks
before data spreads.

**Status.** `PRD exists`
([`phase-03-minimum-permission-role-scoped-projection-foundation.md`](./phase-03-minimum-permission-role-scoped-projection-foundation.md),
epic #489).

**Standing rule.** No custom fields, dashboards, reports, or exports for a
data domain before that domain has allow-listed projections. Phase 9's CSV
export, Phase 30's imports, Phase 33's reports, and Phase 31's API all flow
through this governance.

---

### Phase 4 — Identity & Account-Claiming Foundation (`identity-claiming`)

**What it is.** Defines how auth users, profiles, parties, donors,
missionaries, staff, households, and account claims connect **without
collapsing into each other**. One human may be a login, a person, a donor, a
missionary, and a church contact — different records, linked. Account
claiming is audited; low-confidence matches require manual review; tenant
membership governs access. Owns the merge contract that Phase 9's duplicate
surfaces feed.

**Status.** `PRD exists`
([`phase-04-identity-account-claiming-foundation.md`](./phase-04-identity-account-claiming-foundation.md),
epic #503). Amended 2026-07-06 (Phase 9 C1) for the party-spine handoff.

**Guardrail.** An auth user is not a person, donor, missionary, or Stripe
customer. Identity collapse is the single most expensive CRM mistake; every
later phase inherits this separation.

---

### Phase 5 — Public Website Runtime Contract (`public-runtime`)

**What it is.** Settles where public pages run, how domains resolve, how
preview/publish/cache work, and how giving hands off to checkout — so public
content and donor self-service never tangle. Payload owns public content;
drafts never leak to public routes; checkout context (site, source code,
locale, currency, designation) survives the handoff.

**Status.** `PRD exists`
([`phase-05-public-website-runtime-contract.md`](./phase-05-public-website-runtime-contract.md),
epic #520).

**What later phases take from it.** Phase 22 (public missionary pages),
Phase 23 (Web Studio depth), Phase 36 (P2P pages), and Phase 37 (event
pages) all render inside this contract.

---

### Phase 6 — Shared Communication Event Model (`comms-event-model`)

**What it is.** One communication history for the whole platform: message
intent separated from provider delivery events; consent/preference state
snapshotted at send time; suppressions (including provider unsubscribes)
landing in Asym. Resend and Mailchimp are providers, never communication
truth. Includes the `sendEmail` seam every later sender uses.

**Status.** `PRD exists`
([`phase-06-shared-communication-event-model.md`](./phase-06-shared-communication-event-model.md),
epic #550).

**What later phases take from it.** Receipts/statements (7, 18, 19), system
messages (17), Support Hub (26), workflow notifications (34), newsletter
sync (32), and the CRM Comms tab (Phase 9 socket) all write and read this
one spine. A send that skips it is a defect by definition.

---

### Phase 7 — Receipt & Statement Compliance Rules + Donor Identity/Credit Model (`receipt-rules-credit`)

**What it is.** The finance brain **and** the party/credit foundation:
rules-first receipt/statement eligibility, corrections, voids, refunds,
non-deductible portions, immutable versioned receipt facts with
jurisdiction-gated numbering — plus the donor credit model (legal donor vs
receipted donor, households, organizations, soft credits, DAF sponsor,
tribute, matching) and the **party spine** (parties supertype + shared-PK
subtypes) that Phase 9 builds the CRM on.

**Status.** `PRD exists`
([`phase-07-receipt-statement-compliance-and-donor-credit.md`](./phase-07-receipt-statement-compliance-and-donor-credit.md),
epic #566 + children #567–#586). Amended 2026-07-06 (Phase 9 C2) for the
`party_kind`/`org_type` taxonomy.

**Standing rule.** Later phases **consume, never re-derive** this model:
Phase 9 builds on the party tables; Phase 14 operationalizes the credit
model; Phases 18–19 render the approved facts. Templates never decide
receipt truth.

---

### Phase 8 — CRM Operating Foundation (`crm-operating`)

**What it is (re-groomed 2026-07-07).** With Twenty retired (ADR-0001) and
Asym Postgres owning all CRM truth, there is no provider to write to, gate,
probe, or sync — so the phase is reframed from "safely open the first write
to a provider" to the **CRM Operations Observability & Data-Health
Foundation**: a read-only `/crm/operations` windowpane (health verdict +
data-health signals + duplicate/merge backlog + a needs-a-human list),
**escalation over the shipped Inngest recovery machinery** (it reuses that
runtime — it does _not_ fork a second healer), alert routing (Sentry + the
Phase-6 send seam), and the **CRM data-health catalog** that Phase 40 builds
its stewardship product on. The one net-new active heal it owns —
re-projecting a stale derived view — is reserved until Phase 9 makes derived
views exist. Withdrawn (dormant code → #602): the write gate,
provider-idempotency, reactive pause, kill-switch, provider-health probing,
and Notes write-enable.

**Status.** `PRD exists` — re-groomed 2026-07-07 (#603 complete)
([`phase-08-crm-operating-foundation.md`](./phase-08-crm-operating-foundation.md),
epic #587). Issues re-scoped 2026-07-07 (#588/#589/#592/#593/#595/#596/#597/
#600/#601 re-scoped; #590/#591/#594/#598 closed).

**Dependencies (softened at the re-groom).** The build-now core has **no
hard prerequisite** — it observes Asym's already-shipped runtime
(dispatch/dead-letter ledgers, recovery scans, the notification-policy
console) and the Phase-4 merge count. Phase 6 gates the emailed-alert path;
Phase 9 gates the reserved party-graph-health signals and the reserved
re-projection heal. Phase 40 (AI stewardship) hard-depends on the
data-health catalog this phase defines.

---

### Phase 9 — Full CRM Depth & Relationship Graph (`crm-depth-graph`)

**What it is.** The real CRM build — the People & Churches backbone. Party
is the CRM record (persons, orgs incl. churches, households); stored +
derived edges form the relationship graph (single canonical edge rows, typed
catalog, provenance, UNION-ALL read surface); one record shell (8 live tabs
plus 8 reserved sockets and the header contract); one list engine (saved
views, keyset pagination, faceting) with kind-scoped routes; party-keyed
notes/activity/tasks; Cmd-K search; governed CSV export; duplicate
visibility surfaces feeding the Phase 4 merge contract.

**Status.** `PRD exists`
([`phase-09-full-crm-depth-relationship-graph.md`](./phase-09-full-crm-depth-relationship-graph.md),
groomed 2026-07-06; epic #604 + children #605–#627 — dispatch-ready).

**What later phases take from it.** Nearly everything: Phase 10 classifies
its fields/notes; Phase 11 extends its records; Phase 27 reads its
staff-assignment edges; Phase 22 links public pages to its parties; Phases
14/16/33 read its graph for credit, commitments, and reporting. Its reserved
sockets are the contract: Comms (6), Custom Fields (11), Files (29),
Workflows (34), Events (37), External IDs (30/31), Donor Development (27).

---

### Phase 10 — Sensitive-Data Classification & Restricted-Ministry Safety Foundation (`sensitive-safety`)

> **Status: `PRD exists` — groomed + founder-grilled 2026-07-07 (G1–G7 + a
> four-lens adversarial pass)** →
> [`phase-10-sensitive-data-safety.md`](./phase-10-sensitive-data-safety.md);
> epic #628 + children #629–#641. Extends the Phase-3
> `field_policies`/resolver floor (which explicitly reserved break-glass +
> blanket read-audit for here) with a person-level `security_level`, dual
> identity (legal name vs public alias, alias enforced at the data layer), the
> publication firewall as a **sole-entry** architectural invariant, restricted
> data in a separate RLS table, read-audit, **one identity-access-grant object**
> (standing / requested / break-glass), consent/publishing prefs, and telemetry
> redaction. **Country risk is tenant-sovereign** (opt-in importable World
> Watch List seed; person always overrides). **"Security Clearance" is a
> capability admins toggle onto any role.** The grill trimmed 3
> over-engineering spots (a country-risk subscription engine, a trigger-word
> hook, premature purge executors) and hardened 2 brittleness holes. The
> member-care case product + the exposure report stay Phase 38; the full grant
> product stays Phase 12.

**What this phase is (plain language).** A missions CRM is different from every
other nonprofit CRM in one brutal way: **the database itself is a targeting
list.** Workers serve in roughly 60 creative-access/restricted countries where
a leaked real name, photo, or location is a physical-safety event — not a
privacy incident. And because this is a _missions_ CRM, essentially every
person record reveals religious belief by mere presence (GDPR Art. 9
special-category data), with member care adding health/counseling/crisis data
on top. This phase builds the **safety rails**: a small, fixed classification
model and a publication firewall, landed **before** custom fields, public
missionary pages, files, or newsletters can create unclassifiable data. The
deep member-care _product_ comes later (Phase 38); this phase is the
schema-level foundation that phase — and every public surface — stands on.

**Why it sits here.** Retrofit is effectively impossible: once notes, files,
photos, and published pages accumulate unclassified, nobody hand-triages them
— and the fresh-build posture (no users yet) is a one-time window that closes
at first tenant onboarding. Custom fields (11) would otherwise mint
ungoverned leak paths; public missionary pages (22) would render identity
with no firewall.

**What it covers.**

- **Person-level security classification** on the party record — a fixed enum
  `security_level ∈ {standard, sensitive, restricted, high_risk}` — defaulted
  from a **tenant-sovereign**, versioned country-risk table (an **opt-in
  importable** Open Doors World Watch List seed the tenant may load; a ratchet
  that never auto-lowers; **the person-level setting always overrides the
  country default**) and consumed by every rendering surface. A
  `security_level_source` marker + an "unreviewed workers" data-health signal
  keep the no-default posture visible, not silent.
- **Dual identity**: legal name vs public alias (pseudonym), with photos,
  bio, location, and country stored as classified attributes. Public
  surfaces read **only** the sanitized public projection — a restricted
  worker's real name/photo/country is structurally unreachable from public
  queries, CMS content, donor-portal APIs, OG images, sitemaps, URL slugs,
  and receipt/email templates.
- **Four-tier data classification** (public / internal / confidential /
  restricted) as first-class metadata on CRM fields, notes, and files —
  restricted data in **separate tables with their own RLS policies**, not
  masked columns (masking via views is fragile in Postgres).
- **RBAC + ABAC hybrid**: existing roles for coarse surface access; attribute
  predicates (classification ceiling, team/assignment relationship,
  named-person grants) for record/field decisions — one policy vocabulary
  shared with the Phase 3 projection layer.
- **Append-only sensitive-read audit** (who viewed/exported which restricted
  record, when, from where) plus the **break-glass primitive** (emergency
  access with mandatory justification + alert + post-hoc review) at the API
  level — crisis UI comes in Phase 38.
- **Egress choke-point enforcement**: classification honored in search
  indexing, CSV export, bulk-email merge fields, webhooks/API, file
  downloads, and photo EXIF/geolocation scrubbing. A model that only guards
  the UI read path is theater.
- **Consent & publishing preferences** per person (explicit consent records
  for publishing name/photo/story; hard do-not-publish flags), wired into the
  existing outbound-email consent gate — honoring the Art. 9(2)(d) invariant
  (no disclosure outside the body without consent).
- **Security-aware content seams** for later phases: the review-before-publish
  **verdict contract** (`allowed | needs_review | blocked`) that Phase 22 (public
  pages) and Phase 32 (newsletters) consume. _(Trigger-word content detection
  was dropped at the 2026-07-07 grill as speculative — no owning phase.)_

**Benchmark & better-than-parity.** SiteStacker's answer is thin — group CRUD
permissions plus "Security Tags" on notes/files; no person-level security
levels, no pseudonym pipeline, no country-risk model, no read audit.
Missions-specific tools (Denari security levels, MissionaryConnect
"Restricted Access Nation") prove the category expectation. The publication
firewall + security levels + read audit are a headline differentiator.

**Boundaries & guardrails.** Private care and restricted-location data must
never become ordinary CRM fields or notes. Keep the classification vocabulary
small and **fixed** (tenant-configurable mappings, not tenant-defined tiers)
so RLS, egress checks, and compliance evidence stay testable. Over-classify
and staff will route around the system — need-to-know must not stop
mobilization from finding a worker or finance from reconciling a gift.

**Open questions for grooming.** Classification granularity (person-level +
field-group + per-note tags, strictest wins — pressure-test this); who may
see the legal-name↔alias mapping (named grant vs `security officer` role);
what appears on Stripe descriptors/receipts for gifts to restricted workers
(alias vs fund code — must be decided **with** Phase 13); whether platform
observability (Sentry, logs, support tooling) counts as "outside the body"
and what telemetry redaction applies; pseudonym lifecycle on reclassification
(retro-scrub of published/cached content); whether all person records are
treated as Art. 9 data or only flagged subsets.

---

### Phase 11 — Custom Fields & Custom Collections (`custom-fields`)

> **Ratified PRD:** [`phase-11-custom-fields-custom-collections.md`](./phase-11-custom-fields-custom-collections.md)
> — grill-complete 2026-07-08 (13 decisions D1–D13, deep-researched + adversarially verified + congruence-swept).
> The section below is the pre-grill roadmap sketch; the PRD supersedes it (renamed "Configurable Entities" →
> "Custom Collections"; the open questions below are resolved there).

**What this phase is (plain language).** Every missions org tracks things no
vendor predicted — visa categories, language proficiencies, home-assignment
cycles, church-partnership tiers. This phase lets an org admin define their
own fields (and repeatable "entity-like" child collections) on CRM records
**without code changes and without the platform running schema migrations
per tenant** — while every field is born with visibility, export, and
sensitivity policy attached.

**Why it sits here.** After Phase 9 (there must be a record shell and list
engine for fields to live in) and after Phase 10 (tenant-defined fields are
dangerous while visibility is vague — a custom field is a leak path unless
classification is mandatory at creation).

**What it covers.**

- **Field catalog as metadata** (the Salesforce "Universal Data Dictionary"
  model on Postgres): per-tenant `field_definitions` — key, label, type,
  options, validation, required/default, help text — with values in a
  per-entity JSONB extensions column. **Zero tenant-triggered DDL; no raw
  EAV.** Record the storage decision as an ADR.
- **Policy at birth**: every field declares visibility (roles/surfaces),
  edit rights, export policy (included/excluded/masked), and a Phase 10
  sensitivity tier — enforced by **one server-side field-policy module**
  shared by UI mutations, the API, and imports (never per-code-path checks;
  Salesforce's "classification is manual tagging with no enforcement" is the
  anti-pattern, as is its Data-Loader-bypasses-rules inconsistency).
- **Layout placement**: which record-shell section/tab and order a field
  renders in (the Phase 9 Custom Fields socket) — and fields must be movable
  between groups (SiteStacker famously can't move a field between entities
  without developer help).
- **First-class everywhere**: custom fields appear in list views, filters,
  saved views, CSV exports, the report builder (33), imports (30), and the
  public API (31) with type fidelity — a custom field you can't report on is
  parity theater.
- **Reporting performance strategy**: hot fields promoted to generated
  columns/expression indexes (GIN alone degrades for typed equality/range
  filters), with a per-tenant indexed-field quota.
- **Entity-like child collections** (SiteStacker Entity Groups → Entities →
  Fields parity: repeatable typed collections per person, e.g.
  certifications, references) as catalog-defined collections with hard caps
  and quotas (HubSpot-style), **not** uncontrolled object creation.
- **Audit**: field definition changes and sensitive-field value changes are
  audited from creation.

**Benchmark.** SiteStacker's Entity Groups/Entities/Fields hierarchy is the
parity target (import templates are even auto-generated from configured
entities — Phase 30 should match that coupling); Salesforce/HubSpot define
the modern metadata-catalog + guardrails pattern.

**Boundaries & guardrails.** Custom fields must be policy-bound and
auditable from creation. Field definitions and values stay separate. No
tenant-defined tables. Quotas are explicit (max fields, indexed fields,
collections, picklist options). Custom fields on money records (if allowed
at all) are excluded from receipt templates by default — receipts render
Phase 7 approved facts only.

**Open questions for grooming.** Which entities get custom fields in v1
(persons/orgs/households only vs gifts/pledges/funds too); whether child
collections ship in the same phase or trail; exact quota numbers; whether
classification enforcement lives in Postgres (RLS/masking) or the API
serialization layer as source of truth (one must win); build-vs-buy for any
admin form-layout tooling.

---

### Phase 12 — Full Role & Permission Configuration (`permission-config`)

> **PRD:** [`phase-12-full-role-permission-configuration.md`](./phase-12-full-role-permission-configuration.md)
> — grill-complete 2026-07-08 (26 decisions + 7 cross-cutting rulings + the tenant-axis
> substrate; five adversarial passes incl. a definitive 8-cluster validation and a final
> ruthless 7-lens risk review). The "open questions for grooming" below are **resolved** in
> the PRD (capability taxonomy = friendly levels compiled to an explicit capability map;
> seeded defaults = Owner + 9 templates; **SSO = deferred/seam-only**; named-person-grant
> admin UI ships here).

**What this phase is (plain language).** Phase 3 built the security _floor_ —
fixed, allow-listed projections per surface. This phase builds the
_configurable_ permissions **product**: org admins managing staff groups,
granting capabilities, testing what a role can see, and auditing access —
because by now there are custom fields (11), classified data (10), and soon
money operations (13+) that different staff must see differently.

**Why it sits here.** It deepens Phase 3 (never replaces it), and it needs
Phase 10's classification vocabulary and Phase 11's field catalog to have
something meaningful to grant access _to_. The MVP posture recorded in the
parity matrix (all staff subroles share broad admin access; per-subrole
narrowing reserved) ends here.

**What it covers.**

- **Staff-managed groups** with capability grants: roles remain
  understandable labels; **capabilities enforce** (never role-name string
  checks). Groups ease administration but are not a substitute for field
  policy.
- **Component/entity/field permissions**: per-module access (CRM,
  Contributions, Reports, Web Studio…), per-entity CRUD, per-field
  visibility/edit riding the Phase 11 catalog and Phase 10 tiers —
  SiteStacker's group CRUD-checkbox model is the floor; classification-aware
  grants are the ceiling.
- **Security-tag parity**: extra permission layers on notes/files
  (SiteStacker Security Tags) mapped onto the Phase 10 tag model.
- **Page/menu visibility** in Mission Control driven by capability, so
  admins can shape what staff even see.
- **Impersonation** ("view as" a role or user for permission testing;
  optionally support-driven user impersonation) — **time-bound, consented
  where applicable, and always audited**. SiteStacker supports admin +
  workflow-instance impersonation; ours must add the audit/consent guardrails
  it lacks.
- **Permission testing & audit reports**: "what can this group see/do"
  reviews, access-change history, sensitive-permission-grant alerts.
- **Enterprise SSO seam** (SAML/OIDC for tenant staff — SiteStacker documents
  Azure/Google SAML): decide in grooming whether it ships here or is
  deferred; record the decision either way.

**Boundaries & guardrails.** Do not replace the Phase 3 projection floor —
narrow surfaces (donor portal, missionary workspace, public) stay on
allow-listed projections no matter what staff configuration says.
Impersonation without audit is prohibited. Derived relationship roles are
never authorization inputs (Phase 9 CI-gated guardrail carries forward).

**Open questions for grooming.** Capability taxonomy granularity (coarse
modules vs fine actions — start coarse, split by demand); whether donor-care
vs finance vs mobilization ship as seeded default groups; SSO timing;
whether record-level named-person grants (Phase 10/38's mechanism) get admin
UI here or stay API-managed until Phase 38.

---

### Phase 13 — Campaign, Designation, Contribution Ledger & Giving Cart (`contribution-ledger`)

> **PRD:** [`phase-13-campaign-designation-contribution-ledger-giving-cart.md`](./phase-13-campaign-designation-contribution-ledger-giving-cart.md)
> — grill-complete 2026-07-09 (decisions D1–D25 + governing rulings R-JW / R-UX; five
> ruthless 16/17-category adversarial reviews). The "open questions for grooming" below
> are **resolved** in the PRD (topology = Stripe Connect direct charges on tenant-owned
> accounts, 0% platform cut; append-only header+lines+postings ledger; bounded campaign
> hierarchy; per-method fee-cover; recurring commitments + dunning). Groomed-not-built.

**What this phase is (plain language).** The money backbone rebuilt properly.
Today a gift is one donation row; real missions giving is **one checkout that
splits into many designations** ("$100 to the Smiths, $50 to the Kenya well,
$25 where needed most"). Every mature nonprofit system (CiviCRM, Salesforce
Nonprofit Cloud, Blackbaud, Virtuous) converges on the same shape — a
**transaction header** (who paid, how, when) plus **designation line rows**
(how the money divides) — and this phase adopts it natively on Postgres +
Stripe, with a persistent multi-designation giving cart on the public side.

**Why it sits here.** It needs the Phase 2 context primitives, Phase 3
projections, Phase 4 identity, Phase 5 checkout handoff, and — by the
program's deliberate **rules-first inversion** — Phase 7's receipt rules,
which this ledger is built to produce facts _for_. Nearly every later money
phase (14–21, 33, 35) writes to or reads from this spine.

**What it covers.**

- **Contribution ledger, header + lines**: one payment (tender: card, ACH,
  check, cash, stock, church check) → N designation lines with amount,
  designation, and attribution. DB-enforced `sum(lines) = header`;
  **append-only postings** — corrections, refunds, NSF, chargebacks, and
  re-designations are compensating entries, **never UPDATEs** (the repo's
  `contribution_adjustments` pattern, ADR-CD-004, generalized). Minor-unit
  integer amounts + currency column throughout.
- **Designation (fund) registry**: code, name, restriction class (with /
  without donor restrictions), lifecycle, linkage to
  missionary/project/campaign, default-designation rules — replacing today's
  read-only fund directory and denormalized `funds.current_amount`. Phase 20 D6
  owns the prospective Designation-to-Accounting-Reporting-Target mapping.
- **Accepted source-purpose authority for downstream reallocation**: every
  accepted posted line freezes exact Designation identity,
  restriction-or-preference classification, purpose and excess-use policy
  version, source-posting coverage, and one closed provenance variant: the
  exact source-owned publication kind/reference/digest when governed content
  was presented or captured, or typed `not_applicable`/`not_captured` plus the
  exact source-purpose evidence reference/digest. Phase 22 owns a public
  giving-page publication only when that page was the accepted source, over
  Phase 23's CMS substrate; Phase 17 owns a message publication only when a
  governed communication was the accepted source. Offline, imported, and
  remittance producers supply owner-labelled Designation, memo, remittance, or
  acceptance evidence to the Phase 13 resolver; they never fabricate a
  publication or choose their own legal classification. This producer contract
  applies to public/runtime, offline batch, recurring, import, migration, and
  integration sources owned by Phases 5/15/16/22/30/31. Phase 21 D5 may
  consume this immutable projection but never reconstruct it from current
  labels, pages, or organization discretion. Any later purpose-authority
  succession preserves the original terms and requires the exact
  jurisdiction-permitted donor, legal, court, or regulator authority.
- **Persistent giving cart** (the SiteStacker parity anchor): unlimited
  designations per checkout, mixed one-time + recurring lines, donor
  fee-cover as a separate ledger line with deterministic correction
  allocation, cart remembered across sessions. Phase 20 D19 alone governs
  attribution of exact uncovered processor cost.
- **Recurring-intent handoff** — the Phase 13 cart may accept recurring intent
  beside one-time lines and persist the one accepted checkout command, but it
  does not own recurring execution topology. Phase 16 owns donor-initiated
  recurring setup, groups, lines, cohorts, legs, and the mapping from accepted
  recurring intent to subscriptions or saved-method scheduled charges. Phase
  13 owns only the accepted cart and one-time money branch.
- **First-class Source Codes** (channel × segment × message, many per
  campaign — the Nonprofit Cloud Outreach Source Code model) + UTM capture,
  stamped **per line at capture time** and copied onto every recurring
  installment at commitment creation — in the _first migration_, even if the
  management UI trails; retrofitting attribution onto a live ledger is the
  classic painful migration.
- **Refund initiation** from Mission Control (staff-initiated
  `refunds.create` with capability gates) — today refunds are only consumed
  from webhooks.
- **Campaign objects** (giving campaigns distinct from the email-channel
  concerns the current `campaigns` table mixes in).

**What already exists (evidence-classified).** Durable patterns carried
forward are idempotent PaymentIntent creation, the donation-saga outbox +
recovery, the signed `stripe_raw_events` webhook ledger with
claim/replay/dead-letter, and the staged-gifts review precedent. Existing
`contribution_adjustments` supplies append-only/idempotency lessons but is
folded into canonical Phase 13 postings; receipt-delivery snapshots are legacy
evidence replaced by Phase 7 facts → Phase 18 artifact → Phase 17 prepared
content/sender identity → Phase 6 dispatch/provider outcome/history. Other
implementation accidents replaced outright under the fresh-build ruling are
`donations.amount NUMERIC` with loose TEXT statuses, denormalized
`donor_pledges` counters, `funds.current_amount`, the writerless
`pledge_charge_attempts` table, and the Twenty-bound `donation_crm_links`.

**Boundaries & guardrails.** Do not keep donation-row-only accounting —
totals, exports, and visibility reconcile to designation lines. Stripe
executes payment; Asym owns ledger truth. Fund accounting (net-asset
reclassification, release from restriction) stays in the org's GL — Asym is
a **subledger** with restriction metadata and provider-neutral downstream
accounting projections. Enforce
invariants in Postgres (CHECK/trigger sum rule, no UPDATE/DELETE on posted
rows), not just app code. Idempotency end-to-end: webhook dedupe, charge
creation, and every money-writing entry point.

**Grooming resolution and remaining downstream questions.** Phase 13 resolves
Stripe topology as Connect direct charges on tenant-owned connected accounts
and removes tenant secret-key storage. Phase 20 D19 resolves processor-cost
attribution as organization-borne by default with one prospective,
fee-cover-first Designation-borne uncovered-cost mode. Phase 20 D20 resolves
accounting as local/home-currency settlement by default from exact Stripe
balance-transaction facts, with retained foreign settlement available only
through a proof-gated lane; Phase 24 still owns activation of additional donor
presentment currencies. Church bulk remittances and the public presentation of
restricted workers (Phase 10) remain owned by their respective source and
publication phases.

---

### Phase 14 — Donor Credit Operations: Soft Credits, DAFs, Tributes & Matching Gifts (`donor-credit-ops`)

> **PRD:** [`phase-14-donor-credit-operations.md`](./phase-14-donor-credit-operations.md)
> — grill-complete 2026-07-10 (decision families D1–D5 + five consolidated
> close-outs; three ruthless adversarial review fleets — the 17-category D1
> and D4 passes plus the D3 pass — and two focused design passes). The "open
> questions for grooming" below are **resolved** in the PRD (see the dated
> note on that paragraph). Groomed-not-built.

**What this phase is (plain language).** Real gifts are rarely simple. A
donor gives through a **donor-advised fund** (Fidelity Charitable is the
legal donor; the advisor gets a thank-you that is explicitly _not_ a tax
receipt). A **church check** covers twenty members' support. An **employer
matches** an employee's gift (two separate legal gifts). A gift arrives **in
memory of** someone, and the family should be notified. Phase 7 defined the
_truth model_ for all of this; this phase makes it **operational** — in gift
entry, CRM views, reports, statements, and dashboards.

**Why it sits here.** After the ledger (13) exists to hang credits on, and
**before** batch entry (15) — the v1 ordering had batch entry first, which
was backwards: finance staff keying a stack of checks must be able to record
DAF/soft-credit/tribute/matching facts at the moment of entry, not repair
them later.

**What it covers.**

- **Soft credits** as first-class, typed, non-receiptable records (0..N per
  gift; need not sum to the gift; partial soft credits when one company
  check covers many people; household/spousal credit so either spouse's view
  shows household giving) — surfaced in the Phase 9 Giving tab, reports, and
  statements (as a clearly non-tax, org-togglable recognition section).
- **DAF operations**: sponsor = legal donor with hard credit; advisor gets a
  typed soft credit + a **non-deductible acknowledgment** (never a receipt,
  excluded from year-end deductible totals); DAF-flagged gifts block quid
  pro quo benefits per IRS Notice 2017-73.
- **Tribute/memorial gifts**: honoree + notify-party modeling (the notify
  party is a party record with a relationship to the honoree), and the
  **second letter stream** — notification letters listing donors
  (customarily without amounts) through the Phase 6 seam and Phase 17
  templates.
- **Matching gifts** as an expectancy lifecycle: identified → submitted →
  employer verified → received; the match is a **separate legal gift on the
  employer's record** mirroring fund/designation, with the employee
  soft-credited when the match is received (expectancy stages mint zero
  credit rows — only the received employer contribution generates the
  line-scoped employee credit; Phase 14 (Donor Credit Operations) D1.12).
  _(Amended 2026-07-10, Phase 14 (Donor Credit Operations) D1.12: corrected
  from the earlier "automatic soft credit to the employee on both expectancy
  and payment" — expectancy stages mint zero credit rows.)_
- **Affiliated-party rules**: standing rules like "always soft-credit person
  X when org Y gives" (the NPSP affiliation-driven pattern), powering
  church-giving and org-giving recognition reports.

**Boundaries & guardrails.** Soft credit never creates tax-receipt ownership
or enters a money total. DAF advisor acknowledgments are not receipts.
Matching gifts are never merged into one donation. Gift-level facts are
never party edges (Phase 9 guardrail).

**Grooming close-out.** The Phase 14 PRD resolves the former roadmap
questions: employer databases are a seam-only second rung; church remittance
recognition appears in the missionary supporter roster rather than producing
member letters; standing rules are capped and party-scoped in v1; and Phase 27
consumes Phase 14 read models for portfolio ranking. No open roadmap-level
choice remains.

---

### Phase 15 — Offline Gift & Batch Entry (`gift-batch-entry`)

**What this phase is (plain language).** Checks, cash, ACH transfers, stock
gifts, and church remittances still fund most missions work. Finance staff
need to enter a stack of mail gifts **fast** (keyboard-first, no mouse),
validate the batch before it posts (with review only when tenant policy or risk
requires it), tie it to a bank deposit, and trust that receipts flow through
the same downstream authorities as online gifts. Today the repo has **no
manual gift creation surface at all** — "Cash/Check" exist only as display
strings.

**Why it sits here.** After the ledger (13) it posts into and the credit
operations (14) it must capture during entry.

**What it covers.**

- **Gift-entry batches** with one canonical lifecycle:
  `draft → validated → posted`. Validation is repeatable and non-mutating;
  posting is all-or-nothing, revision-pinned, and idempotent. The only
  conditional branch is
  `validated → awaiting_approval → posted` when tenant policy or a risk rule
  requires review. There is no general `approved`, `finalized`, or `exported`
  Phase 15 state; Phase 20 independently owns accounting releases and exports.
  Gift-entry batches remain explicitly distinct from the existing
  `contribution_operation_batches` (bulk _actions_ over existing gifts; the
  naming guardrail lives in the phase-00 locked dependencies). _(Amended
  2026-07-11 by Phase 15 D5 and authority-normalized 2026-07-27: validate posts
  by default; a second approver/quorum is an opt-in tenant control, while
  high-risk batches may auto-route to the same conditional reviewer branch.)_
- **Keyboard-first grid entry** (TanStack Table + Virtual): batch templates
  with preset columns and default values; control totals (expected count/
  amount vs entered); inline donor lookup/create with dedupe warnings; per-
  row DAF/soft-credit/tribute/matching capture (14); and a reserved
  pledge/commitment-matching inspector seam that activates only against Phase
  16's authoritative fulfillment contract.
- **Deposit grouping** for operational bank-deposit preparation and
  slips/reports. Phase 20 owns bounded Bank Match; QBO/Xero owns final
  reconciliation.
- **Non-cash gifts**: stock (ticker, share count, gift date, high/low-average
  FMV, receipts that never state a value per IRS Pub 561), in-kind with
  description + FMV handling.
- **Phone gifts, two lanes** (settled disposition, restated per D4): the
  **primary** card lane is the **native embedded Stripe Payment Element keyed
  by staff** (SAQ-A) + **server-confirm MOTO**; the Stripe-hosted secure-link
  is the **fallback**. **Asym never stores, logs, or processes raw card or
  bank-account details** — staff key into a Stripe-owned iframe this platform
  embeds but cannot read (SAQ-A guardrail). _(Amended 2026-07-11, Phase 15
  (Offline Gift & Batch Entry) D4: the native embedded SAQ-A Element is now the
  primary phone-card flow and the hosted secure-link is the fallback — the
  earlier "send-secure-link by default / staff never key card data into any
  surface this platform renders" wording is superseded; the guardrail is
  restated as never store/log/process raw card or bank-account details.)_

**Boundaries & guardrails.** Batch totals must reconcile before posting. A
posted batch revision and its contribution postings are immutable; later
changes append source-owned compensating entries. Accounting release,
delivery, and period treatment belong to Phase 20 and QBO/Xero, not a mutable
Phase 15 “exported” state. If grid entry is slower than Excel, ops staff will
keep shadow spreadsheets — the keyboard UX is an acceptance criterion, not
polish.

**Grooming close-out.** The Phase 15 PRD resolves the former roadmap
questions: validate=post is the ordinary low-friction path, while risk policy
can require a separate authorized reviewer; scanned-check and remittance-image
bytes defer to the Phase 29 storage seam; church remittances use the governed
attribution sub-grid; and securities ship through the first-class generic
noncash lifecycle. No open roadmap-level choice remains.

---

### Phase 16 — Pledges & Recurring Commitments (`pledges-commitments`)

> **PRD:**
> [`phase-16-pledges-recurring-commitments.md`](./phase-16-pledges-recurring-commitments.md)
> — grill-complete 2026-07-13 (ratified decisions D1–D19, each researched and
> adversarially hardened). The PRD is planning only; dispatch remains a
> separate founder decision.

**What this phase is (plain language).** The flagship experience is modern
**automatic recurring giving** by card or ACH: donors create a clean recurring
arrangement, choose when it runs, manage each destination without losing the
grouped experience, and recover safely when a payment fails. Staff and
missionaries see received cash and scheduled recurring support truthfully,
without treating a scheduled charge as guaranteed money. A separate,
deliberately quiet **fixed-total pledge** workflow records the uncommon legacy
case where a donor promises a total and fulfills it over time through later
online or offline gifts.

**Why it sits here.** After the ledger (13); enriched by credit ops (14) and
batch entry (15, where fulfillment matching happens for offline gifts).

**What it covers.**

- **Two distinct aggregates, never one universal pledge record:** automatic
  recurring commitments and fixed-total pledges. Collection arrangements,
  posted contributions, recognition, fulfillment, and health remain separate
  facts connected by explicit typed references.
- **Recurring groups with independently manageable destination lines** and
  compatible billing cohorts. Each cohort has the minimum explicit execution-leg
  set its authorized cadence requires: one leg for an ordinary cadence and two
  monthly legs for the twice-monthly 1st/15th cadence. One provider subscription
  represents exactly one leg; every applicable line has an exact provider-item
  binding in every applicable leg by durable identifier—never by array position.
- **Donor-controlled scheduling:** monthly is featured when enabled; tenants
  may offer weekly, every two weeks, twice monthly, every four weeks, monthly,
  quarterly, semiannual, and annual. The first gift is attempted immediately;
  the donor chooses the continuing anchor date; calendar math uses a frozen
  IANA giving time zone and clamp-and-recover short-month rules. No end date is
  the frictionless default.
- **Truthful donor, staff, and missionary management:** skip one occurrence,
  pause until a chosen date or indefinitely, cancel, restart with fresh
  authorization, change schedules with projected-date previews, and manage
  payment methods through provider-owned fields. Staff service-desk actions
  are broad but authorization-bound; missionaries remain read-only.
- **Rail-specific recovery:** Asym owns retry policy while Stripe executes
  payments. Card retries use the bounded ratified burst and runway; ACH is not
  silently represented. Missed occurrences never become collectible debt and
  are never silently back-charged. Provider-control loss quarantines unsafe
  mutations until proof-based recovery.
- **Occurrence-level fulfillment:** posted Phase 13/15 designation lines are
  applied to expected occurrences through immutable, conserved fulfillment
  applications. Recognition and legal-donor facts remain Phase 14/7 truth.
- **Derived multi-axis support health and cash-first dashboards:** cash received
  this month comes first, then automatic recurring outcomes and the recurring
  list. Fixed-total pledges appear only when relevant and never dominate the
  missionary experience.
- **Lightweight fixed-total pledges:** total first, optional dated plan, explicit
  undated remainder, four truthful change/end/release/correction operations,
  and optional two-touch reminders only after explicit enrollment. Tenant
  policy may only narrow or disable reminders; all tenants start with them off.
- Replaces the prototype `donor_pledges` and `pledge_charge_attempts` shapes as
  product authority; those tables remain migration evidence, not the target.

**Boundaries & guardrails.** Dashboards must always distinguish pledged
or scheduled support from received gifts. Commitments and pledges never mint
ledger rows before money arrives. The Phase 13 append-only contribution ledger
remains the sole money truth; Phase 6 owns communication delivery history;
Phase 17 owns editable message content; Phase 12 owns authorization; Stripe
executes but does not own Asym intent. No status label, dashboard total,
provider object, retry counter, or fulfillment suggestion may become a second
writable truth. Daily giving is excluded. No stale Phase 13 recurring ticket
may be dispatched without the dated Phase 16 supersession. A Phase 21 exit
manifest may request retirement or succession, but Phase 16 alone accepts the
required donor or tenant authorization and changes future recurring terms.

**Grooming close-out.** D1–D19 resolve aggregate boundaries, grouping,
cadences, donor anchors, pause/cancel semantics, card and ACH recovery,
notifications, fulfillment, support health, dashboard hierarchy, Party roles,
staff service, provider-control loss, fixed-pledge planning and changes, and
reminder governance. There are no open product choices left in this roadmap
section; implementation details are pinned in the Phase 16 PRD, ADRs, dated
congruence package, research evidence, and OpenSpec delta.

---

### Phase 17 — System Messages & Template Management (`system-messages`)

**What this phase is (plain language).** Everything the platform sends —
gift acknowledgments, failed-payment notices, pledge reminders, statement
delivery, workflow notifications, password resets — should come from
**governed, versioned templates** staff can safely edit, preview with fake
data, and override per site/locale, with every send recorded in the one
communication history. Moved up from v1 Phase 24 because Phases 18, 19, 16,
and 34 all deliver through it.

**Why it sits here.** Needs the Phase 6 spine, Phase 2 site/locale context,
Phase 3 consent governance, and Phase 7 source-owned receipt/statement truth.
Phase 7 is hard because the Target Live launch catalog includes required receipt
contracts and its first tracer consumes an immutable Phase 7 receipt artifact.
Phase 17 must then precede the statement/reminder/workflow phases that send at
scale.

**What it covers.**

- **Email Studio hardened** (the repo already has versioned react-email
  templates — `email_templates` / `email_template_versions` — and
  `email_template_system_bindings`): add **version-pinned-at-send** recorded
  on the communication event; **stored mock test data** per template driving
  preview/test sends (never real donor PII); and a **typed variable
  allow-list per message type** (escaping by default, no arbitrary record
  access — the SSTI/PII-leak defense; donor-facing templates can never
  reference staff-only or care fields).
- **Draft → commit → publish promotion** as the approval gate (the Knock
  model: immutable published versions, diff view, publish audit) — no
  separate approval bureaucracy.
- **Whole-publication override resolution** with deterministic, contract-bounded
  fallback. Tenant-policy-eligible System message contracts allow exactly two
  priorities: recipient language first (recommended) or site wording first.
  Receipts, official documents, and every contract without tenant choice retain
  Phase 2's fixed order. Resolution always selects one complete compatible
  publication—never field-level merging. A broken override falls through only
  to another contract-approved compatible publication; if none exists, the
  message fails closed and alerts rather than sending incompatible content.
- **Shared layouts** (Postmark-style): tenant branding lives once; templates
  carry content only.
- **Trigger-binding registry** generalized from
  `email_template_system_bindings`: system event → step → channel template,
  so **in-app notifications** (staff bell/inbox: assignment, @mention,
  alerts) and **future SMS** are new steps on existing bindings, not new
  systems. The full system-message catalog is enumerated against
  SiteStacker's ~30 component rules (auth, address changes, receipts,
  recurring lifecycle, payment methods, workflow tasks, ops failures).
- **SMS reserved, not enabled**: model per-tenant 10DLC/toll-free
  registration state, immovable STOP/HELP handling, and channel-scoped
  consent provenance now; Twilio enablement is its own later slice
  (compliance lead time is weeks).

**Boundaries & guardrails.** Every send crosses the single `sendEmail` seam
(consent snapshot + communication event by construction). Templates render
approved facts — they never decide receipt/statement truth (Phase 7).

**Ratified grooming result (2026-07-19; D1–D20).** The earlier fallback
shorthand is superseded by the exact whole-publication rule above and the Phase
17 PRD and dated congruence package. The permanent winner is one
code-governed complete System message catalog with contract-owned safety and a
tenant capability envelope; complete immutable structured publications with
typed source-owned facts, whole-message inheritance/fallback, tenant-open
contract-proven locales, Brand Kits and bounded Layout Roles; standard publish
with audit plus independent review for protected publications; contract-bounded
Delivery Plans compiled into the Phase 6 recipient-specific intent/event spine;
proportional in-product notifications; SMS compliance evidence with transport
dark; one proof-gated tenant-owned Resend connection with no shared fallback,
one Default plus bounded same-domain Sender Profiles, and contract-owned human
reply destinations; body-free durable history with an optional expiring
support-safe Recent sent copy; phase-separated whole-message recovery; and
versioned tenant portability. Platform-owner email such as Eve #436 uses a
structurally separate Asym-fixed platform contract/Resend connection through the
same Phase 6/17 spine and never falls back for tenant mail; Eve keeps its Discord
operational channel outside tenant System Messages.

**Dated compatibility boundary.** Phase 6 remains communication execution and
history. Phase 7 owns receipt/statement legal-donor, eligibility, facts,
coverage, and correction truth; Phase 14 owns recognition; Phase 18 owns
logical generated documents, immutable artifacts, currentness, access, and
records; Phase 19 owns frozen statement population, bounded participation,
run/recipient-operation coordination, physical fulfillment, control, completion,
and run evidence; Phase 24 owns broad site/CMS/shell localization;
Phase 25/28 own complete donor/missionary notification-center information
architecture; Phase 26 owns inbound replies; Phase 32 owns campaigns/newsletters;
and Phase 34 owns general workflows. The three original open questions are
closed, not deferred. The phase is a groomed PRD only—neither built nor
dispatched. Epic #873 and children #874–#905 are published and blocked; no
`ready-for-agent` label or implementation authorization is implied.

---

### Phase 18 — Receipt & PDF Template System (`document-templates`)

**What this phase is (plain language).** One governed Generated Document
product for official acknowledgments/receipts, statements, tribute and pledge
documents, and bounded custom business documents. Source domains guarantee the
facts; staff design within a safe structured visual editor; one qualified
pipeline creates and privately preserves the exact accessible PDF.

**Why it sits here.** After Phase 7 (facts), Phase 13 (ledger lines the
facts derive from), and Phase 17 (template governance it reuses).

**What it covers.**

- One clean canonical `pdf_*` bounded context: immutable definitions,
  drafts/commits/publications/heads, source-owned Facts Packages, idempotent
  requests, fenced attempts, exact artifacts, logical-document currentness,
  batches, access evidence, publication appointments, and records controls.
- Three staff destinations only: **Templates**, **Documents**, and **Batches**;
  one current-first donor/missionary document experience; broad safe visual
  freedom through structured blocks, purpose-scoped facts, exact synthetic
  proof, and proportionate review.
- A pre-registered production-shaped contest between exact renderer pipelines;
  at most one winner ships, and no winner keeps official generation dark. Every
  final artifact is validated, hashed, privately stored, read back, and promoted
  atomically.
- A complete everyday U.S. acknowledgment pack plus governed specialist
  obligations; a deliberately activated exact-issuer Canadian registered-
  charity pack with prescribed fields, split receipting, one `R-` series,
  protected signer evidence, and new-serial formal replacement.
- One logical document and one current canonical accessible PDF. Historical
  versions remain evidence-only; access, delivery, issuance, human reading, and
  records disposition remain separate truths.
- Purpose-owned retention, holds, custody, verified staged disposal, and
  restore-suppression evidence; scanner-resistant selector-plus-fragment access
  through the shared Phase 17 protected-action primitive.
- An environment-gated destructive pre-production cut that removes every live
  text, snapshot-rerender, `gift_receipt_records`, direct render, provider-URL,
  Unlayer, and dual-runtime prototype. Contrary production evidence stops the
  cut before mutation and requires re-grooming.

**Boundaries & guardrails.** Document templates cannot invent legal, donor,
recipient, money, correction, delivery, or records truth. Phase 7/source domains
own facts and optional issuance; Phase 17 owns message delivery; Phase 19
consumes source-authoritative eligibility and owns the immutable Run Preflight,
bounded participation, frozen Statement Run/Run Items, recipient-operation
coordination, physical fulfillment, control, completion, and Run Evidence
Record. Restricted-worker policy applies to
visible and hidden artifact surfaces. Renderer selection, U.S. breadth, Canada
scope, access, records, publication scheduling, and the clean cut are resolved
by the Phase 18 D1–D17 contracts; no founder question remains open. Epic #907
and children #908–#961 are published: #908–#910 form the approved
`status:todo` + `ready-for-agent` frontier and #911–#961 remain
`status:blocked`. That ticket posture claims no implementation and authorizes no
further dispatch.

---

### Phase 19 — Year-End Statement Operations (`statement-operations`)

**What this phase is (plain language).** Finance needs to produce correct
year-end statements for every eligible donor at scale. That is a **population
and run-operations product**: consume source-authoritative eligibility, prepare
one exact immutable Run Preflight, release the reviewed candidate atomically,
operate item-authoritative work, preserve separately authoritative outcomes,
recover exceptions, fulfill paper work, serve exact-current artifacts, and
retain auditable evidence. January 31 may be a tenant service target; the phase
must not present it as a universal federal deadline.

**Why it sits here.** After facts (7), rendering (18), templates/delivery
(17), the ledger (13), and the comms spine (6).

**What it covers.**

- **One canonical purpose-pinned Statement Run system.** An inert Run Preflight
  freezes tenant/environment, issuer, jurisdiction activation, purpose,
  document period, source-fact cutoff, rule/publication/profile versions,
  Statement Subjects, reasons, counts, totals, and digests. One idempotent
  transaction promotes the exact reviewed preflight, creates Run Items and
  release evidence, opens one release barrier, and emits the outbox wake.
- **Source-owned people and facts.** Phase 7 owns each legal-donor Statement
  Subject, eligibility, facts, coverage, and correction effect; Phase 13 owns
  posted money; Phase 14 owns optional Recognition Subjects. A Delivery
  Recipient is independently authorized. Household recognition never merges
  official legal-donor documents or deductible totals.
- **Bounded tenant participation.** Automatic source-derived participation is
  the default. Authorized staff may include, hold, omit where the purpose
  permits, restore the automatic result, or add an already-existing eligible
  Statement Subject before release. They cannot create legal donors, edit gift
  lines/totals, force ineligible facts, or write jurisdiction rules.
- **Separately authoritative outcomes.** Population, Phase 18 document,
  portal-access, Phase 17/6 communication, paper, run-control, completion, and
  evidence-package state remain distinct. There is no blended
  `rendered/sent/delivered` status or fabricated global completion percentage.
- **Tenant-configurable delivery with code-owned safety.** Versioned Statement
  Delivery Profiles compile deterministically into compatible Fulfillment
  Plans and mutually exclusive Execution Lanes. Recipient/destination meaning
  freezes at release; governed Destination Succession changes only still-safe
  future execution.
- **Self-print first.** The quiet default is a secure exact-artifact package
  with reconciled counts, checksums, print profile, and truthful staff-recorded
  print/postal evidence. Existing mail-house export uses the same contract. At
  most one direct-mail adapter may launch after production-shaped proof;
  PostGrid is the first candidate and Lob the U.S.-focused alternative.
- **Cooperative containment and truthful completion.** Pause closes admission
  and proves containment; Resume re-proves only safe work; Stop permanently
  prevents every unclaimed operation and every claimed operation that has not
  crossed its serialized irreversible-handoff fence, while handed-off or
  outcome-unknown work reconciles. Staff decide when to mark a run complete,
  while Asym derives clean versus exception outcome and preserves independently
  live follow-up.
- **Source-owned late facts and exact-current help.** A released primary run is
  immutable. Proof-backed year-boundary checks use Phase 7/15 gift-date truth;
  post-release facts create deduplicated supplemental/correction obligations.
  Staff use one **Help with this statement** doorway, and donors have unmetered
  authorized access to the exact current Phase 18 artifact plus bounded,
  repeatable outbound-copy fulfillment.
- **Quiet evidence and seasonal operations.** One PII-minimized Run Evidence
  Record preserves release/completion proof and owner references; a governed
  temporary package supports audit retrieval. Execution is certified,
  tenant-fair, resumable, provider-adaptive, and protects critical messages.
  Tenants receive one bounded **Target ready for review by** control, not queue
  priority.
- **Optional products stay separate.** Exact-issuer Canadian annual-receipt
  behavior is structurally absent only for a non-Canadian or never-activated
  issuer. An active or repairably paused Canadian epoch retains its frozen plan
  (the pause holds generation/issuance); a legal lock or ended epoch creates no
  new issuable plan facts and never falls through to ordinary policy for that
  issuer and interval. Historical artifacts, access, and records remain visible
  under pause, lock, or end.
  **Support overview — Not a tax document** is an off-by-default informational
  document, never a section of or substitute for an official statement.

**Boundaries & guardrails.** Phase 19 owns the Run Preflight, frozen population,
bounded participation, Statement Run/Run Items, release/control fences,
recipient-operation coordination, physical fulfillment, operational completion,
and Run Evidence Record. It does not re-author Phase 7/13/14 truth, render
documents outside Phase 18, or send outside Phase 17/6. Inngest is a subordinate
executor; durable database state, idempotency, leases, fencing, outbox/recovery,
composite tenant/environment ownership, RLS, and reconciliation remain the
authority. Test mode uses synthetic data and can never become live work.

**Grooming outcome (2026-07-24).** Ratified D1–D18; no founder product question
remains open. The [Phase 19 PRD](./phase-19-year-end-statement-operations.md),
its authority map, research, decision-to-test traceability, cross-PRD
congruence, focused ADRs, and OpenSpec delta are the planning
authority. Epic #977 and children #978–#1031 are published and blocked;
explicit dispatch, implementation, provider qualification, and production
evidence remain pending.

---

### Phase 20 — Accounting Exports & Reconciliation (`accounting-exports`)

> **Controlling implementation-ready amendment (2026-07-27):**
> [`phase-20-accounting-exports-reconciliation.md`](./phase-20-accounting-exports-reconciliation.md)
> and its
> [`decision log`](./phase-20-accounting-exports-reconciliation-decision-log.md)
> carry the ratified D1–D20 contract. The corresponding
> [`OpenSpec change`](../../../openspec/changes/add-accounting-exports-reconciliation/proposal.md)
> defines the capability boundary. Where the older roadmap summary below
> conflicts, this amendment controls.

The finished contract provides one accounting doorway over exact
source-coverage fences and immutable balanced Accounting Releases. It supports
exact, mode-honest Stripe settlement/payout evidence; bounded source-labelled
Bank Match; prospective Legal-Entity-scoped Posting Profiles, designation
mapping, QBO/Xero carrier plans, destination connections, and Posting Ownership
Cutovers; and exactly one delivery lane per release: direct QBO, direct Xero, or
an evidence-always staff-mediated artifact. Provider authorization, capacity,
operation-level ambiguity recovery, exact readback, drift detection, and
cause-linked compensating releases remain independently truthful.

Tenants control release cadence, mapping, supported carrier roles, destination,
and certified artifact shape through one quiet Ready for Accounting workspace.
Organization-absorbed processor costs are the default, with one prospective
fee-cover-first uncovered-cost attribution mode. Local settlement currency
matching the QBO home or Xero base currency is the default; retained foreign
settlement lanes require explicit end-to-end proof. Phase 21 later owns expense
reports and supplies only an immutable Approved Expense Snapshot plus
PII-minimized Accounting-Ready Expense Handoff. Asym never becomes the GL:
QBO/Xero owns accepted records, books, periods, translation/revaluation, and
final bank reconciliation.

Phase 21 D5 identifies one future source root, but the current Phase 20
generation keeps the entire support-reallocation source family unsupported and
accounting-dark. A later separately approved Phase 20 change must certify its
source schema, accountant semantics, Posting Profile recipe, and Phase 20 D17 ownership
behavior before any close-covered Support Reallocation Accounting Occurrence
may enter this doorway. No reallocation request, policy, coverage, Decision,
open-cycle pair, Charitable Succession Handoff, payment evidence, unknown
result, generic journal, manual journal, or artifact fallback may bypass that
gate, and Phase 21 never writes QBO or Xero **Accounting** directly. This does
not prohibit a later exact Phase 21 regional Xero **Payroll** draft-input
adapter certified under D7; payroll draft input and accounting delivery remain
different capabilities and authorities.

**What this phase is (plain language).** The org's bookkeeper must be able
to (a) tie every bank deposit back to gross gifts, fees, and refunds, and
(b) import clean journal entries into their accounting system. Today the
repo has an internal pipeline-consistency sweep but **no true financial
reconciliation** (nothing consumes Stripe payouts/balance transactions) and
**no GL export**.

**Why it sits here.** After the ledger (13), batch entry (15), and credit
ops (14) produce the facts to reconcile; pledges (16) inform expected-cash
reports.

**What it covers.**

- **Payout-centric reconciliation**: persist Stripe balance transactions
  (webhook + nightly sync); each payout auto-creates a **settlement batch**
  reconciling gross/fees/refunds/chargebacks to the net bank deposit; an
  **exception queue** for unmatched items. Gross-gift reports never match
  deposits without this — finance distrust in month one is the failure mode.
- **Accounting delivery**: balanced immutable releases at certified selectable
  grain compile through provider-native QBO/Xero plans. Direct API and
  staff-mediated artifact lanes are both first-class, mutually exclusive per
  release, idempotent, evidence-retaining, and drift-aware.
- **Bank evidence for offline batches (15):** Phase 15 owns deposit groups,
  exact membership revisions, slips, and operational deposit state. Phase 20
  derives Expected Bank Arrivals and bounded Bank Match from frozen evidence.
  QBO/Xero owns native undeposited-funds/clearing accounts and final bank
  reconciliation.
- **Refund/chargeback/fee accounting** as compensating entries in the
  current period (never reopening exported batches).
- **Immutable release and period discipline:** released intent never changes.
  Later corrections create source- and cause-linked Compensating Accounting
  Releases posted only into tenant-policy-permitted and provider-accepted
  periods; originals remain immutable.

**Boundaries & guardrails.** Accounting releases and provider records are
downstream projections, never gift truth. Asym does not become a GL:
tenant-confirmed net-asset accounting and release-from-restriction remain in
QBO/Xero. One Legal Entity is the quiet default; proof-gated multi-entity
activation is supported without permitting a release to cross entity,
destination, currency, or posting-owner boundaries.

**Grooming resolution.** D1–D20 are ratified. QBO and Xero are first-class
targets; artifact-always continuity is required; fee attribution, multi-entity,
expense handoff, provider cutover, and currency/FX boundaries are resolved in
the implementation-ready Phase 20 specification.

---

### Phase 21 — Missionary Field Accounts & Support Balances (`field-accounts`)

**What this phase is (plain language).** The financial heart of the
**deputized-fundraising model**: every gift legally belongs to the org and is
only _preferenced_ toward an approved ministry purpose. When a tenant activates
one organization-controlled Support Assignment and its currency-scoped Field
Accounts for that purpose, the organization-owned
balance is derived from explicit operational entries: gross support
allocations, separate assessments or permitted costs, compensation-funding
coverage, expenses, Support Reallocation occurrences, and exact reversals.
Tenant-scheduled finance closes turn provisional activity into a dated
confirmed balance. Tenants that do not use or publish balances retain a calm
activity- and planning-capable workspace without fake zeroes or setup noise;
finance gets the exact source coverage, policy versions, and exception detail
for every activated authority.

**Why it sits here.** It builds on the Phase 13 contribution ledger, Phase 15
offline/noncash source and disposition projection, Phase 18 generated-document
service, and Phase 20 accounting doorway, plus the identity, permission, and
restricted-worker floors. Optional statement-ready
communication uses the existing Phase 17 contract and Phase 6 delivery spine.
A Field Account is a **source-authoritative operational allocation subledger**,
not a second general ledger and not a mirror of the current QBO or Xero balance.
It links to contribution, expense, and payment facts only through explicit
immutable coverage. Final accounting delivery and reconciliation stay in Phase
20 and QBO/Xero respectively.

**What it covers.**

- **Support Assignment and Field Account authority**: one immutable
  organization-controlled, Tenant- and Legal-Entity-scoped Support Assignment
  is the stable subject. Exactly one Field Account may exist per Support
  Assignment and ISO currency, with append-only balanced operational entries,
  immutable source coverage, deterministic correction/succession, and
  **derived per-currency balances**. Support recorded in an open cycle remains
  separate from the **Finance-confirmed Field Account Balance** through the
  last closed cycle. Pending, confirmed, reserved, obligation, released,
  externally paid, and accounting-delivered meanings remain separate; no
  mutable balance column or cross-currency scalar is authoritative.
  Each Field Account has one immutable currency. Every Legal Entity has one
  explicit prospective **Default Field Account Currency Version**, and a
  tenant may activate a sibling currency-scoped Field Account only through one
  prospective, source-family-specific **Field Account Currency Activation
  Version** proving an organization-controlled same-currency admission path.
  The default orders suggestions and presentation only; it never converts or
  relabels history. Activation, source readiness, close, Phase 20 accounting,
  and external payroll/AP payment remain independently authoritative.
- **Support Assignment participants, access, and collaboration**: a Support
  Assignment may have zero, one, or many prospective, effective-dated Party
  memberships recorded as **Support Assignment Participant Memberships**, and
  one Party may participate in several Support Assignments. Participation,
  Phase 12 request-time workspace authorization,
  source-owned operational responsibility, and recipient-scoped notification
  preference remain independent. D10/D13 own expense claimant, submitter,
  reviewer, and approval-route facts; D4 plus the external Engagement Authority
  own compensation and payee facts; Phase 28 owns support-raising coaching and
  task assignment; and Phase 12 owns capabilities. One quiet
  **People & access** surface offers tenant-safe presets and one literal
  consequence review, but every spouse, teammate, leader, coach, and staff
  member retains separate Party, principal, invitation, access, responsibility,
  and preference identity. Access is server-authorized through Phase 12's sole
  PDP over forced coarse Tenant RLS; Realtime is signal-only. Life events use
  deny-first revocation and append-only succession, and people changes never
  move money or rewrite closed history.
- **Reconciled Opening Position and operational cutover**: an established
  tenant starts one complete Tenant × Legal Entity × ISO-currency activation
  cohort from one immutable, precedence-explicit **Opening Source Package** and
  exhaustive **Opening Coverage Manifest**. Every pre-cutover source fact has
  exactly one non-overlapping disposition—certified exact history, opening
  residual, structurally inert reference-only history, proved
  non-balance-bearing exclusion, or unresolved—and unresolved coverage blocks
  activation. Per-account and cohort proof requires certified exact history
  plus one balanced nonzero **Field Account Opening Position** residual to equal
  the reconciled boundary position in exact minor units. A zero position uses
  manifest coverage only; a negative legacy position blocks activation until
  already source-authoritative obligation or lifecycle-disposition evidence is
  resolved under the applicable owner domain (D5 only for a real exit or
  succession cause), rather than becoming a negative Field Account. Private
  chunked, resumable,
  non-authoritative staging and shadow reconciliation lead to one short
  finance-authorized, CAS-guarded **Field Account Operational Cutover** at an
  exact half-open boundary for every predecessor source family plus one common
  operational through boundary proved complete by every source. That common
  cut starts the first D11 business interval. The cutover also pins the captured
  ingestion cursor that becomes the predecessor for the first D11 Support Cycle
  close and carries forward exact independently live reservations, obligations,
  compensation/reimbursement coverage, reallocations, unresolved payments, and
  other balance-capacity effects without replaying them as new occurrences.
  Atomic source groups receive one group-complete disposition; assessment
  history may be certified only as one complete, non-overlapping D3 Assessment
  Period Determination, including its explicit partial-period policy and every
  component/correction. A D6 source-conserving group spanning currencies is
  canonical exact history only if wholly contained or all affected cohorts
  activate behind one linked barrier; otherwise it remains reference-only and
  each currency uses its reconciled residual. Activation
  is side-effect-dark and D9-publication-gated: it sends no receipts,
  communications, notices, statements, feed events, accounting, payroll/AP, or
  reimbursement work. Late facts append idempotent Opening Position Corrections
  and manifest successors; no destructive rollback or replay exists. Phase 30
  owns transport and mapping mechanics, Phase 21 D17 owns opening authority,
  and Phase 20 D17 alone owns separately proved accounting-gap delivery.
  Every Phase 21 decision other than D17 follows its own dependency path, but
  Phase 21 D17 activation stays feature-gated until certified Phase 29 private-
  byte/access and Phase 30 import-session transport/staging seams exist or are
  explicitly pulled forward under their owning phases; this grooming decision
  does not claim those runtimes exist.
- **Evidence-gated production activation**: one immutable **Phase 21 Release
  Generation**, one prospective **Field Accounts Adoption Plan Version**, and
  one content-addressed **Field Accounts Go-Live Readiness Manifest** compose
  the applicable D1-D26 and owning-phase proofs for the exact Tenant, Legal
  Entity, ISO currency, complete Support Assignment and source-family census,
  environment, code/schema generation, and D17 half-open authority boundary.
  D17 remains the sole CAS-guarded Operational Cutover and D11 remains the sole
  close/integrity authority; D27 creates neither a second enablement state nor
  a second financial truth. Synthetic demonstration, provider sandbox, and
  complete-cohort D17 production-shaped opening shadow evidence are labelled
  separately. D27 invokes that existing D17 shadow rather than owning a second
  financial calculation or reconciliation, and the shadow remains structurally
  side-effect-dark and non-authoritative.
  Finance receives one accessible, exception-first consequence review and one
  literal start action. Optional capabilities activate independently only when
  their own applicable proofs pass; a named missionary pilot may narrow only
  D19/Phase 12 publication, never the financial cohort. One disposable,
  through-dated **Field Accounts Operational Readiness Projection** keeps
  healthy tenants quiet. Post-start drift opens a cause-owned exception and
  applies the smallest prospective containment that preserves immutable
  history, authorized reads, D26 custody export, established obligations,
  mandatory adverse corrections, artifact/manual continuity, and append-only
  recovery.
- **Gross support allocation**: an eligible Phase 13 posted money Designation
  allocation, or one exact source-final Phase 21 D21 Realized Support Basis,
  creates at most one covered gross Field Account credit under the frozen
  recognition policy. An original noncash recognized value, FMV, appraisal, or
  estimate is structurally ineligible. One prospective, tenant-owned **Support Allocation
  Readiness Policy** defines the rail-specific evidence required before a
  positive allocation may enter a Support Cycle close. Its guided setting uses
  exact provider settlement evidence for Stripe and deposited/direct-credit
  evidence for offline money; bounded source-family choices may recognize a
  posted gift earlier or require exact bank evidence later. Exact provider
  `available` remains finance evidence and never becomes missionary-facing
  availability. Refunds, returns, redesignations, and source corrections append
  exact linked effects; known adverse effects cannot be deferred, and both
  sides of a redesignation or D5-qualified Support Reallocation occurrence
  enter atomically. Phase 21 never derives balances by summing live donation
  rows or changes legal-donor, receipt, or Designation truth. A Gross Support
  Allocation is current-cycle activity; it does not by itself advance the
  Finance-confirmed Field Account Balance or authorize compensation or
  reimbursement.
  When the source header and Field Account gross use different currencies, one
  immutable, admission-contract-owned **Support Currency Allocation Manifest**
  binds the complete effective Phase 13 hard-tender line set—including
  fee-cover and other non-support lines—to one exact typed
  organization-controlled target allocation basis such as
  `provider_balance_gross`, `bank_credited_amount`, or another D2-qualified
  basis. It conserves source and target totals independently, uses the existing
  deterministic largest-remainder minor-unit seam, preserves exact
  provider/bank conversion provenance and only separately observed costs, and
  prevents double coverage. Only eligible non-fee-cover designation target
  portions create Gross Support Allocations; `gross` means before separate
  Phase 21 assessment and cost effects, not that every rail exposed processor
  gross. Each later cross-currency adverse occurrence receives its own
  immutable successor/correction manifest bounded by remaining original
  coverage. The manifest is not gift, receipt, accounting, rate, or balance
  truth; no current rate, staff rate, synthetic `1.0`, or Phase 21 FX engine
  exists.
- **Noncash Support Realization**: Phase 21 D21 preserves the original Phase 13
  noncash Contribution, legal donor, accepted purpose, gift date, valuation,
  receipt, supporter, and fundraising truth and never creates support from that
  asset's recorded value. Only exact source-final Phase 15 disposition proceeds
  may enter one immutable, source-mode-honest realization manifest. The manifest
  freezes Tenant, Legal Entity, source role/legal recipient, asset lot and exact
  quantity, purpose, ISO currency, finality evidence, gross/cost/net or
  legitimate exact-net-only facts, treatment, deterministic allocations and
  residuals, non-overlapping source/opening coverage, D6 conversion evidence,
  source/policy versions, semantic idempotency, and append-only correction
  lineage. `net_realized` is the zero-setup default; prospective
  organization-absorbed exact costs require certified gross, eligible-cost, and
  net proof. D3 assesses only the resulting Realized Support Basis. Partial,
  pooled, installment, corporate-action, and terminal nonmonetary dispositions
  require exact quantity and minor-unit conservation; retained, used,
  donated-onward, abandoned, worthless, or donated-service outcomes create no
  positive support. D2/D11 alone admit one balanced close occurrence, D5 owns
  valid purpose succession, D17 owns pre-cutover coverage, D19 owns participant
  access, and Phase 20 alone may later certify one nonduplicate accounting
  source. Relevant staff use one conditional contribution lifecycle and the
  existing exception workspace; missionaries see at most one quiet grouped
  story and only closed support effects—never valuation, custody, liquidation,
  accounting, availability, payment, or a second gift.
- **Administrative Assessment Profiles**: every Tenant and Legal Entity starts
  with an explicit immutable **No administrative assessment** profile, so a
  tenant that does not charge assessments has no setup burden or zero-value
  missionary UI. A bounded prospective catalog supports source-family
  percentage, percentage with a monthly minimum and/or cap, fixed monthly,
  percentage plus a separately recorded monthly-service component, exact-
  account negotiated flat, and narrower exemption. Profiles never stack: one
  fixed specificity model resolves exactly one account profile, then selects a
  finite frozen source-family treatment inside it. An ambiguous same-rank
  assignment blocks the affected account rather than silently choosing a
  charge. Source-linked percentage entries and monthly
  **Assessment Period Determinations** remain different immutable occurrences;
  one separate period adjustment owns a minimum top-up or cap credit even when
  Support Cycles are biweekly. Gift-linked variable assessment reverses from
  original coverage, while minimum/cap/fixed/service effects remeasure through
  append-only period correction. Gross support remains unchanged and the
  transparent result is **support credited**, never a rewritten gift or
  availability claim. Staff activate through one production-shaped preview;
  tenants choose a bounded honest missionary presentation without hiding a
  nonzero assessment.
- **Optional processor-cost effect**: Phase 20 D19 never silently changes a
  Field Account. If a tenant separately enables a compatible Phase 21 policy,
  it consumes the exact immutable Processor Cost Attribution Manifest once,
  records a distinct Field Account entry, and cannot allocate across currencies
  or charge the same provider cost twice. Processor cost is never an
  Administrative Assessment Profile component or part of its assessable base.
- **Optional Organization Support Cost Applications**: Phase 21 D20 is an
  absent-unless-enabled residual lane for exact source-final, purpose-compatible
  organization services and direct costs whose canonical semantic family is
  not owned by D3 assessment, D4 compensation, D10/D13 expense, or Phase 20 D19
  processor-cost attribution. One source-family admission contract and
  canonical economic root prevent fallback ownership and duplicate economics.
  A prospective finite bearing policy defaults to **Organization covers it**
  and may instead target a support balance, make one reviewed exact split, or
  require review. Allocation distributes an exact source amount; it never
  calculates a cost from gifts, balances, participants, budgets, or arbitrary
  formulas. One immutable per-currency manifest conserves every minor unit;
  unresolved target work is not close-complete, exact coverage is non-reusable,
  and an ordinary application never authorizes a discretionary overdraft. A
  mandatory source-owned adverse correction still appends even when it exposes
  a visible deficit, and D1 close alone recognizes a D11-balanced occurrence.
  Optional bounded carryforward has explicit amount, age,
  and append-only successor disposition and is never debt, AP, availability,
  payment, or a silent expiry. Source-linked credits and corrections use the
  original policy/evidence versions and later closes. D6 exact external
  conversion evidence is required for a different-currency result; Phase 21
  supplies no FX engine. A PII-minimized Support Cost Accounting Candidate
  Handoff stays Phase 20 accounting-dark until a later separately approved
  source contract proves semantics, nonduplicate posting ownership, and
  admission. The ordinary product has no D20 navigation, card, queue, empty
  state, notification, or existence signal; enabled clean work reuses the
  Support Cycle review, exceptions reuse D11, and only authorized grouped
  post-close effects enter existing missionary activity/statements.
- **Support-cycle and compensation planning**: tenant-scheduled cycles use a
  monthly guided default and a supported biweekly alternative, with one clear
  `Collecting → Finance review → Closed` progression. A close freezes its
  exact boundary, entries, policy versions, tie-out evidence, actor, and time;
  later facts append as linked corrections.
- **Contract-referenced compensation funding**: compensation planning starts
  `Not managed in Asym`. A tenant may activate one prospective Plan Version,
  pinned to an exact Engagement Authority Reference, for one worker/payee,
  Legal Entity, Field Account, Field Account funding currency, external
  compensation/payment currency, and destination using exactly one bounded
  method: **Finance enters each cycle**, **Fixed approved target**, or **Up to
  an approved maximum**. The Plan Version owns a prospective half-open
  configuration-effective interval and cadence, not a cycle's Compensation
  Funding Period. Each proposal/decision instantiates one exact half-open
  Compensation Funding Period; overlapping plan intervals and duplicate
  current same-scope/period decisions fail through uniqueness plus CAS. The
  Engagement Authority Reference pins an exact provider source when available
  or a governed tenant-issued authority record, so artifact-only tenants are
  supported without Asym inferring classification. Both currencies are equal
  by default; a different pair requires exact external conversion authority,
  amounts, rounding, residual, and provenance. Support Cycles, Compensation
  Funding Periods, and external payroll/AP periods remain distinct even when
  they align. A disposable proposal may use only Finance-confirmed capacity,
  non-reusable prior coverage, and one optional support-balance floor. One
  immutable Compensation Funding Decision separates Field Account-covered,
  separately organization-covered, and unresolved amounts; its purpose-typed
  Field Account Funding Coverage reserves capacity but does not debit, create
  wages or liability, authorize payment, or prove payment. Shortfalls become
  exceptions—never automatic wage reduction, negative balance, debt, backpay,
  or arrears.
- **Artifact-always compensation handoff**: every authorized decision creates
  one content-addressed, schema-versioned, PII-minimized Compensation Handoff
  Package. The artifact always remains usable evidence, while exactly one
  executable lane owns delivery: staff artifact fulfillment, an exact
  capability-certified provider-draft input, or a certified Phase 20 source
  handoff. Artifact existence is not a second execution. Provider automation
  is draft-input-only; QBO
  Accounting, QuickBooks Workforce, Xero Accounting, and regional Xero Payroll
  products are separate capabilities, and an accounting connection never
  implies payroll access. Asym does not classify workers, calculate wages,
  taxes, deductions, benefits, or net pay, submit or run payroll, move
  compensation money, or archive raw paystubs.
  The optional Phase 20 lane is only a source handoff: the funding decision or
  reservation creates no Posting Intent, payable, expense, or Accounting
  Release until a separately certified evidence-qualified source occurrence,
  accountant-confirmed semantics, and Phase 20 D17 posting owner authorize it.
- **Capability-honest launch adapter portfolio**: Phase 21 fully builds the
  lifecycle appropriate to each exact provider capability: provider- and
  region-pinned Gusto Employee Payroll Draft, ADP Workforce Now Pay Data Input,
  and separately certified Xero Payroll AU and NZ draft-input adapters;
  QuickBooks Workforce and Xero Payroll UK receive complete readback and
  artifact workflows because no equivalent safe per-run write is currently
  proved. The Phase 21 multi-provider launch is incomplete until at least two
  distinct direct-write adapters hold current production authorization and pass
  a production-shaped canary and certification. One prospective immutable
  Compensation Draft
  Delivery Profile Version pins Tenant, Legal Entity, provider organization,
  product, country, environment, external provider participant/payee reference,
  currency, pay cycle, component
  role, operation, and certification. Staff receive an exact provider-native
  preflight/diff and one literal release action. Each attempt becomes an
  immutable Provider Draft Operation with destination serialization,
  concurrency proof, exact readback when available, drift evidence, and
  per-unit `confirmed_updated`, `proven_not_updated`, or `outcome_unknown`
  coverage. Only proved non-updates enter a residual successor; unknown work
  remains quarantined and cannot be blindly retried or switched to another
  lane. Provider acceptance proves only accepted input. Tenant external
  HR/legal authority and configured provider records own classification and
  entitlement; payroll/AP providers own calculation, approval, submission,
  posting, completion, and payment. Xero Accounting draft bills and QBO Bills
  remain Phase 20 accounting concerns, not Phase 21 adapter shortcuts.
- **Independent compensation result and effect truth**: the External
  Compensation Result, External Payment Occurrence, Compensation Field Account
  Effect, and QBO/Xero accounting remain independently authoritative. Each
  Legal Entity pins one prospective recognition policy: the guided default
  recognizes a finalized external result; the bounded alternative recognizes
  exact external payment evidence only when that occurrence carries an exact
  source-qualified Field Account organization-cost basis or links to a
  finalized result that does. Net cash alone is insufficient. Plans,
  approvals, reservations, downloads, provider drafts or acknowledgments,
  posted pay runs, accounting entries, and payslips cannot create a Field
  Account effect or prove payment. Recognition atomically transitions the
  exact effect-backed coverage to `fulfilled`, never `released`, so projected
  capacity subtracts the reservation before the effect and the debit
  afterward—never both. Only a non-overlapping remainder may be released, with
  proof that it was never handed off/submitted or cannot execute after exact
  downstream cancellation/reversal; an unknown outcome remains reserved in an
  exception and no timer silently frees it. Every effect carries a
  component-level application manifest that conserves qualified
  organization-cost basis into Field Account-applied, separately
  organization-funded, and unresolved variance without exceeding coverage or
  authorization or silently reprioritizing sources. Mixed
  compensation/reimbursement payments use one payment currency, exact typed
  coverage, one signed typed resolved residual, and exact FX evidence for any
  different-currency source component. Corrections, failures, partial
  reversals, and reversals append without rewriting prior closes, and only the
  policy-selected recognition authority may correct the Field Account effect.
  Payroll/AP accounting has exactly one posting owner, so Phase 20 never
  duplicates journals already posted externally.
- **Expense operations and accounting-ready handoff**: report, line,
  itemization, receipt, mixed-funding, **Expense Claim**, policy decision,
  immutable Approved Expense Snapshot, any resulting **Reimbursement
  Obligation**, **Field Account Funding Coverage**, external Payment
  Occurrence, exact payment coverage, successor, and correction truth stay
  source-authoritative here. Insufficient Field Account capacity may block a
  prospective spending authorization or create a finance exception, but it
  cannot automatically erase or relabel an already established obligation.
  Every claim pins its effective employee, independent-contractor, volunteer,
  or unresolved/other relationship and applicable jurisdiction; unresolved
  classification permits capture but blocks automatic downstream disposition.
  Phase 21 produces the PII-minimized Accounting-Ready Expense Handoff adopted
  by Phase 20 D18. Phase 20 validates and posts that projection through its
  single accounting doorway; Phase 21 does not create another QBO/Xero
  Accounting connector or payment rail. One atomic mixed
  compensation/reimbursement
  payment uses a complete typed coverage manifest and one Phase 20 D17 posting owner;
  when payroll/AP owns accounting for the whole payment, the expense slice does
  not create a standalone Accounting Release. A Compensation Handoff Package,
  Compensation Draft Delivery Profile Version, Provider Draft Operation, or
  provider acceptance/readback cannot enter through the D18 expense lane. At
  D10, the immutable **Expense Claim Version** is the smallest claimant-authored
  source fact. An optional Expense Report Draft and immutable Expense Report
  Submission provide one adaptive report-first experience but no aggregate
  approval, obligation, funding, payment, or accounting authority. Every exact
  item/split receives a conserving policy disposition; clean claims may advance
  while selected claims use linked successor recovery. Each approved Claim
  Version yields at most one non-overlapping Approved Expense Snapshot for its
  exact coverage, and later approval/correction appends a supplement, successor,
  or cause-linked correction.
  Receipt Evidence Assets remain private and immutable, with exact many-to-many
  Expense Evidence Link coverage. The repo has **no existing safe receipt
  substrate**: `document-uploads` is public and prohibited for this use. Before
  D10 ships, it must use a genuinely private Phase-29-compatible byte seam with
  opaque identity, safe upload finalization, malware/file hygiene, short-lived
  authorized access, access audit, retention, and hold behavior. Phase 29 later
  owns that common byte/access lifecycle without changing Phase 21 evidence
  identity, linkage, sufficiency, approval, correction, obligation, funding,
  payment, or accounting coverage.
  Receipt OCR and matching are suggestion-only consumers of the shared
  tenant-owned AI control plane: write-only Credential Revisions, prospective
  purpose-specific capability-certified AI Capability Binding Versions,
  classification-gated minimum-data egress, immutable invocation provenance,
  explicit human confirmation, and a complete manual path. No public receipt,
  AI suggestion, credential, report status, or provider model field enters
  Phase 20 truth.
  D13 keeps that experience quiet until one immutable prospective Expense
  Program Activation Version enables it for the exact Tenant and Legal Entity.
  One guided Expense Governance Profile Version default plus bounded,
  source-backed relationship, jurisdiction, Expense Policy Cohort, certified
  expense-family, purpose/project/grant, or exact-claimant assignments resolves
  exactly one non-stacking incurred-date winner for every item or split.
  Same-rank ambiguity blocks only affected coverage; staff never order rules or
  author scripts, formulas, or workflow graphs. Exact ISO-currency thresholds
  use integer minor units and an explicit amount basis, with no implicit FX.
  Expense Approval Route Versions are separate finite review contracts:
  submission freezes one Approval Assignment Snapshot, while every human
  decision rechecks current authority and conflict-of-interest. The ordinary
  path is one independent reviewer, with conditional project, finance,
  specialist, or named independent small-tenant review only when the active
  contract requires it. Governed delegation and reassignment preserve the
  original snapshot and grant no decision power. Clean-only
  **Approve clean claims** shows the exact consequences before confirmation
  and records one Expense Review Action per item or split; self-, AI-, timeout-,
  and automatic approval do not exist. A typed Reviewer Exception records the
  violated clauses, reason, authority, and independent review inside the
  Expense Policy Decision without mutating the Profile or creating a generic
  override. Phase 20 receives only PII-minimized frozen approved-snapshot
  lineage and never receives Profiles, Routes, Assignments, receipt evidence,
  reviewer identity, or internal review workflow.
- **Optional exact Prospective Expense Authorization**: D22 remains
  independently off by default and structurally absent from requester, staff,
  notification, reporting, and API surfaces. An authorized tenant may make one
  secondary **Plan an expense** action available when helpful or require it for
  exact D13-selected scopes without changing the complete **Add expense** path.
  The short flow captures the plan, maximum and ISO currency, expected half-
  open incurrence window, and purpose. Immutable requester versions,
  submission-time governance and assignment snapshots, current-authority human
  review, narrowing-only decisions, exact later D10 item/split coverage,
  partial/multi-claim use, and append-only correction remain distinct from the
  actual claim. The guided consequence is approval-only. A separately
  certified advanced scope may atomically reserve exact same-purpose, same-
  currency D1 planning capacity; failure cannot yield partial approval or
  silently downgrade. Expiry ends new reliance but never releases an unproved
  residual. Missing required authorization becomes a typed D13 exception and
  never blocks actual claim/evidence capture. Planning or approval never means
  incurred, substantiated, reimbursable, owed, available, payable, paid,
  posted, synced, or reconciled, and creates no procurement, card, payment,
  payroll, or accounting authority.
- **Source-family-specific Expense Field Account Effect Recognition**: D23
  resolves exactly when one approved expense slice may enter the operational
  support balance without pretending to recognize accounting. One immutable
  prospective profile is scoped by Tenant, Legal Entity, purpose, Field
  Account, ISO currency, and certified source family. Claimant-paid
  reimbursement uses the D16 settlement partition and defaults to exact
  obligation plus funding; a tenant may prospectively certify an exact-payment
  alternative. Organization-card, organization cash/debit/direct-payment, and
  certified-payable paths instead root directly in their exact D10/D13 approved
  economic-payer coverage and source occurrence, never a fabricated D16
  settlement. One common Effect Basis, exact non-overlapping Effect Coverage,
  and immutable Funding Coverage Dispositions ensure a reservation and debit
  never both consume capacity. Initial adoption uses D17's no-gap/no-overlap
  cutover coverage; later profile replacement uses a complete D11 boundary,
  cursor, and in-flight manifest. D4, D16, D20, and D21 remain exclusive
  effect owners. Corrections are source- and cause-linked later-cycle deltas or
  atomic ownership succession. Clean work is zero-action; staff and
  missionaries see independently labelled approval, support-balance,
  reimbursement/payment, and accounting truth with no availability, payment,
  or GAAP claim.
- **Own-identity, exact-claim-bounded expense collaboration**: D24 adds one
  optional Tenant-controlled Expense Collaboration Assignment Version for one
  exact claimant, helper, Expense Program, stable claim, item/split/purpose/
  evidence scope, and half-open interval. A separate authority-free, one-time,
  expiring invitation must be accepted by the helper's verified principal.
  The quiet default is prepare-only. A separately enabled mechanical submit
  operation is allowed only for a complete unchanged Claim Version whose
  material facts and evidence links are pinned by immutable authenticated
  Claimant Confirmation or a tenant-admitted claimant-authored external
  attestation meeting Asym's proof floor. Every request reuses Phase 12 as the
  sole policy decision point and applies the code-owned collaboration-mode and
  Evidence Access Projection ceilings; stricter Phase 3/10 classification may
  only subtract. Access is non-transitive, requester-specific, and revocable
  for future retrieval without pretending to recall delivered bytes. Claimant,
  payer, evidence contributor, preparer, submitter, confirmer, reviewer,
  approver, payee, and actual principal remain separate immutable truth.
  Commit-time reauthorization and current-version/epoch CAS prevent stale
  submission. D24 creates no review, approval, payment, Field Account,
  accounting, payroll, notification, relationship, or successor authority.
- **Exact, cause-owned Expense Claim resolution**: D25 adds one exceptional-
  only immutable Resolution Case per exact root-cause fingerprint and
  item/split/purpose/ISO-currency coverage. Seven code-owned causes supply one
  literal source-owned next action; tenants may choose bounded queue owners,
  reminders, existing D13 routes, and help copy but no custom causes, states,
  scripts, timers, financial meanings, or workflow graph. Same-cause repeats
  converge, overlapping unresolved cases relate/order or fail visibly, and
  clean separable siblings continue. Immutable actual-actor Occurrences and a
  proportional complete Downstream Impact Manifest let the current projection
  explain **Needs your update**, **With finance**, **Waiting on source**,
  **Correction in progress**, or **Complete** without becoming authority.
  Completion derives only from root-source proof plus an explicit disposition
  for every affected owner family. D10, D13, D15/D16, D23/D1/D11, D12, Phase
  20, payroll/AP, and providers append their own successors or corrections;
  Phase 12 remains the sole PDP, Phase 29 owns private evidence bytes, Phase
  6/17 owns communication, and Mission Control/Phase 34 may mirror follow-up
  only. Case or task completion proves no approval, obligation, payment, Field
  Account inclusion, statement correction, accounting delivery, posting, or
  reconciliation.
- **Purpose-owned records schedules and exact tenant custody exports**: D26
  applies one owner-qualified catalog of immutable, qualified-review-backed
  Records Schedule Contract Versions to six closed Phase 21 record families,
  with a quiet reviewed default, bounded prospective tenant bindings,
  per-record resolutions, holds, and complete successor-impact coverage. Every
  authorized tenant can repeatedly create one source-watermarked, open-format,
  manifest-complete Records Export Package per Legal Entity; one tenant-wide
  action fans out under one index. Canonical JSONL, bounded spreadsheet-safe
  CSV, accessible PDF/HTML, authorized originals, exact relationships,
  versions, ordered parts, and digests remain representation-labelled. Every
  selected record receives one explicit inclusion, restricted-lane, owner-
  reference, authority-exclusion, disposed, unavailable, or not-applicable
  disposition. Download, print, Tenant External Copy Assertion, Verified
  Destination Custody Transfer, retention, hold, termination, and copy-specific
  disposal remain separate truths. Phase 21 owns schedule, package, and
  manifest meaning; Phase 29 owns byte custody, staging, hold/disposal
  execution, backups, and restore suppression; Phases 3/10/12 own egress;
  Phase 30 stays inbound; Phase 31 owns any later destination adapter; and
  Phase 38 owns privacy requests. The tenant owns external-copy choices while
  Asym retains its actual obligations for copies in Asym custody.
- **Optional organization-card transaction evidence**: D14 adds one
  tenant-off-by-default, organization-card-only **Upload card activity** lane
  over the complete D10 manual Expense Claim path. A Tenant-, Legal-Entity-,
  Organization-Card-Source-, billing-currency-, and immutable Organization Card
  Import Profile Version-scoped staged CSV produces one complete immutable
  Organization Card Activity Import Manifest. Structural file defects commit
  no evidence; a structurally valid manifest atomically records every row
  disposition while safe rows may create immutable Organization Card
  Transaction Evidence Versions. Exact file repeats are no-ops, cross-file
  convergence requires a certified stable source identifier, and similarity
  creates only a reviewable Possible overlap. Effective-dated Organization Card
  Assignment Versions route work without becoming claimant, classification,
  policy, or approval authority. Same-billing-currency Organization Card
  Evidence Coverage conserves each source-final posted purchase through
  business Claim coverage, a nonbusiness/personal portion, and unresolved
  remainder; typed Organization Card Source Adjustment Evidence appends rather
  than rewriting history. Original merchant currency and issuer conversion or
  fee data remain attributed provenance—never an Asym FX result. Raw files use
  the private Phase 29 byte lifecycle; uploads containing unmasked PAN or
  sensitive authentication data fail acceptance and are quarantined. Import,
  assignment, linkage, classification, or approval creates no Reimbursement
  Obligation, Field Account effect, payment, Accounting Release, issuer
  settlement, card-liability payment, or reconciliation. Only an eligible
  D10/D13 Approved Expense Snapshot may cross the existing PII-minimized Phase
  20 doorway. Claimants get a quiet camera-first completion task; finance gets
  one cause-grouped **Card activity** workspace; inactive tenants see no setup
  or empty-state noise.
- **Artifact-always reimbursement handoff with qualified execution**: D15
  creates one immutable, content-addressed, schema-versioned, PII-minimized
  Reimbursement Handoff Package for exact Reimbursement Obligations. Package
  creation, preview, protected retrieval, download, and redownload are
  non-executing and may exist with zero Execution Claims. Only explicit release
  atomically creates one unique Reimbursement Execution Claim and exact
  non-overlapping Reimbursement Handoff Coverage for one executable lane.
  **Handle outside Asym** is the complete quiet default and uses an explicit
  Handoff Attestation that proves only external handoff. Connected payroll or
  AP options appear only for exact capability-certified pre-execution
  draft/input operations whose endpoint and effective tenant automation cannot
  approve, calculate, submit, schedule, fund, or send money. QBO and Xero
  Accounting objects remain Phase 20-only. D15 may reuse D7's technical
  concurrency, idempotency, readback, drift, backpressure, and ambiguity kernel
  but retains separate reimbursement packages, commands, coverage, operations,
  and statuses. Each unit is `confirmed_handed_off`,
  `proven_not_handed_off`, or `outcome_unknown`; only proved non-handoff
  residual may enter a successor, while unknown outcomes stay quarantined.
  Provider draft readback is handoff evidence only. Separately authoritative
  External Payment Occurrence evidence retains source and strength, exact
  many-to-many payment coverage, typed residual conservation, and append-only
  return/reversal/correction/reissue. Staff evidence says **Payment recorded by
  finance** and is never silently upgraded to **Payment confirmed**. D15 does
  not move money, hold beneficiary-bank data, collect claimant repayment,
  become AP/payroll, or infer payment from handoff, provider, accounting, or
  bank evidence.
- **Purpose-separated advances and claimant repayments**: D16 keeps one quiet,
  tenant-off-by-default setup that compiles into independently activatable,
  immutable prospective Expense Advance and Claimant Repayment Policy Versions.
  Authorization, exact economic issuance, **Advance Application Readiness**, and
  one Approved-Expense-Snapshot-rooted Expense Settlement Determination remain
  distinct. The settlement atomically applies only readiness-qualified advance
  coverage and creates only the remaining Reimbursement Obligation plus typed
  residuals; it never creates a gross obligation and reduces it later. When a
  tenant funds an advance from organization-controlled support capacity, the
  exact approved funding component of the Expense Advance Authorization creates
  non-reusable `expense_advance` Field Account Funding Coverage; only a
  separately qualified Field Account Effect fulfills it, and a proved external
  return drives its own cause-owned adverse or reversal effect. A source-final
  review candidate cannot become a return request until an immutable Repayment
  Subject Determination proves the responsible Party, relationship,
  jurisdiction, conflict route, actor, and version. Only the
  `request_external_return` decision creates an operational Claimant Repayment
  Requirement, never adjudicated debt or a bookable receivable by default.
  Externally handled returns use exact Claimant Repayment Occurrences,
  source-labelled observations, many-to-many coverage, typed residuals, and
  append-only correction. Cross-currency expense application requires exact
  externally owned source and settlement amounts, conversion authority, rate,
  rounding, and residual; Phase 21 supplies no FX engine. Phase 20 may admit
  only separately certified PII-minimized economic occurrences with an
  independently assigned posting owner. Policies, authorizations, observations,
  tasks, disputes, reservations, and Requirements remain accounting-dark unless
  an accountant-certified contract separately recognizes a receivable.
- **Support reallocation and exit disposition**: one bounded
  organization-authorized Support Reallocation Case coordinates an optional
  nonbinding missionary preference, one prospective tenant policy, exact Phase
  13 accepted-source purpose authority, deterministic close-aware capacity,
  immutable Decision, and independently authoritative outcomes. Internal
  same-Tenant, same-Legal-Entity, same-currency source/destination entries
  append atomically and advance both Finance-confirmed balances only through
  one later Support Cycle Close. Exit activates only from an exact Worker
  Lifecycle Authority Reference and uses one conserving Exit Disposition
  Manifest whose internal, external, continuing-authority, and
  organization-retained lines preserve every purpose and currency. External
  charitable succession is optional and proof-gated; Asym does not move money,
  and payment evidence alone is insufficient. A qualified external disposition
  appends one balanced Field Account occurrence—source debit plus a typed
  organization-control/disposition counter-entry—and both sides enter the same
  close; the counter-entry is not a recipient account or GL truth. Source
  domains own lifecycle, Designation, recurring, assessment, compensation, and
  page succession; late facts use append-only recovery rather than target
  clawback. A close-covered
  occurrence is the sole eligible future Phase 20 source root, but the current
  Phase 20 generation deliberately keeps this family dark until a separately
  approved Phase 20 source certification exists. Staff use one exception-first
  doorway; missionary requests are absent unless enabled and never present a
  balance as available or transferable.
- **Missionary-facing Support Workspace**: one quiet, privacy-filtered
  missionary CRM surface whose current Support Workspace Publication Profile
  selects only authorized source-backed modules. It may include Support
  Activity, income/expense by month, expense/reimbursement progress,
  downloadable support-cycle activity artifacts (monthly by default), and
  tenant-enabled notifications or digests. Balance, Balance Coverage, Reserve
  Position, commitments, goals, and
  alerts are absent unless their independent authorities, exact prerequisites,
  audience authorization, and current publication profile permit them. When
  published, a Finance-confirmed support balance carries its through/as-of date,
  Balance Coverage uses the D9 conservative same-currency Planning Coverage
  Base, and Support recorded since close remains separately labelled. The
  surface feels like a small, calm missionary CRM, not a finance console or a
  second donor CRM. When the exact D3 winner is No Assessment,
  assessment UI is absent. Otherwise the tenant chooses **Compact
  transparent** (guided), **Balanced**, or **Detailed** presentation while the
  exact detail and immutable statement always preserve **Gross support
  recorded**, **Organization assessment**, separately governed costs when
  applicable, and **Support credited**. Percentage detail may accompany the
  affected gift; minimum, cap-credit, flat, and service components remain
  separate period activity. An honest custom label or explanation cannot
  disguise an assessment as processor cost, tax, payroll deduction,
  withdrawal, or worker-owned money. Ordinary recent gift rows show useful
  relationship context without repetitive success badges. Material adverse
  outcomes remain visible, while an accessible **View details** disclosure or
  optional hidden-by-default Status column reveals plain terms such as
  `Recorded`, `Processing`, `Received`, `Not received`, `Returned`,
  `Refunded`, `Reversed`, or `Corrected`; optional detail may say `Declined`
  only when the exact source proves that outcome. Those terms project source
  truth; they never expose internal
  close readiness, raw gateway reasons, deposit/payout/Bank Match detail, or
  QBO/Xero state, and `Received` never means irrevocable or available to the
  worker. The surface shows a compensation amount only from an authoritative
  approved plan or payroll result and uses `Paid` only with external payment
  evidence. It composes Phase 13 effective contribution facts, Phase 14's
  `getSupporterRoster`, Phase 16's safe recurring-support statements, and the
  Phase 3/10/12 projection and authorization floor. The Phase 14
  consumer-specific field floor governs supporter identity; Phase 21 owns no
  contact fields, donor edits, notes, tasks, appeals, newsletters, or coaching.
  Restricted and anonymous facts are removed before counts, totals, search,
  pagination, notifications, exports, and caching. Phase 28 remains the
  support-raising CRM owner.
  Phase 21 owns activity facts, recipient purpose, and alert eligibility;
  Phase 18 renders artifacts, Phase 17 owns and prepares governed message
  content, and Phase 6 sends and records communication history. Phase 21 never
  calls Resend or another transport directly. Staff work from one
  exception-first Field Accounts workspace, not raw journal jargon or a second
  accounting console.
  When the current Support Workspace Publication Profile Version authorizes
  missionary balance publication, one active currency appears as one exact,
  ISO-labelled balance with no multicurrency controls. When sibling currencies
  exist, every balance authorized as part of that publication family remains
  simultaneously visible with its own ISO code and through date; the grouping
  has no writable or converted total. When balance publication is off, the
  missionary sees no balance or balance-derived placeholder while every
  finance balance and close remains live. Activity may mix currencies only
  with an ISO label on every amount and no mixed subtotal. Support statements
  remain separate per exact Field Account, Support Cycle, and ISO currency;
  the workspace may group sibling same-period statements but never converts
  or sums them. Any later Phase 33 reporting estimate remains visibly
  secondary and cannot drive Field Account behavior.
- **Optional Approved Support Plan and bounded publication**: D9 defaults each
  exact Tenant, Legal Entity, Support Assignment, purpose, currency, and
  applicable Field Account scope to **Support planning not managed in Asym**.
  A tenant may prospectively activate one winning immutable **Approved Support
  Plan Version** with a positive recurring need, bounded dated needs, and one
  optional same-currency diagnostic reserve target. Phase 13/21 activity,
  Phase 16 commitments, D1 balances, D4 compensation funding, and Phase 28
  Support-Raising Goals remain independently authoritative. One finite
  **Support Workspace Publication Profile Version** selects only authorized
  source-backed modules for each audience under Phase 12 capabilities. Guided
  starting profiles are Activity only, Goal and activity, Balance and activity,
  and Support planning; unused modules are absent rather than zero-filled.
  Personal reorder/collapse never widens access or changes truth.
  **Balance Coverage** divides one conservative same-currency
  Finance-confirmed Planning Coverage Base by the positive recurring need. The
  Base begins with the D1 balance, subtracts qualified negative open-cycle
  effects plus still-active non-reusable compensation/reimbursement and
  reallocation coverage exactly once, and never adds provisional positive
  support. Reserve Position remains diagnostic and Commitment Forecast remains
  an optional Phase 16 view. Missing, stale, future, conflicting,
  unauthorized, or currency-incompatible inputs produce no derived value, not
  zero or infinity. Creating a Phase 28 goal from a Plan is an explicit
  copy-with-provenance action; neither authority live-synchronizes. D9 grants
  no D8/Phase 31 feed field.
- **Purpose and compliance boundary**: donor preference versus legal
  restriction, organization discretion and control, solicitation wording, and
  receipt/message language remain split by authority: Phase 7 owns legal
  receipt facts and eligibility, Phase 17 owns governed receipt and message
  language, and Phase 18 owns any canonical generated artifact. Phase 22 owns
  only the public page and presentation projection; it cannot decide legal
  facts, certification, or governed message language. Phase 21 records
  operational support effects; it does not provide legal or tax certification.
- **Clean future handoffs**: Phase 14 owns `getSupporterRoster`; Phase 16 owns
  safe recurring-support and payment-health statements; Phase 28 owns the
  missionary's contact permissions, support-raising workflow, tasks, notes,
  appeals, newsletters, coaching, and goal. Phase 21 owns Support Cycle,
  assessment, expense/reimbursement, Compensation Funding Plan/Decision,
  Compensation Handoff Package semantic identity, External Compensation
  Result, Field Account Effect, and payment-evidence projections and composes
  those read authorities without copying them. Phase 29 may manage
  expense-evidence and Compensation Handoff Package bytes and access but
  cannot own their business meaning, digest, or purpose-retention authority.
  D8 adds one disposable **Missionary Support Feed Projection**. Phase 21 owns
  the Missionary Support Activity Projection, separately through-dated
  per-currency Support Balances Projection, and their strict finance-safe
  external field/publication floor. Phase 31 composes those source projections
  exactly once without directly rejoining or re-owning Phase 14 supporter and
  Phase 16 commitment truth. Phase 28 may contribute only a separately
  ratified, purpose-authorized relationship/contactability resource family,
  and it can never widen the Phase 21 field floor. Phase 31 alone owns the
  composite feed protocol:
  prospective subscriptions, authorization, provider serialization, no-gap
  snapshot/page/change delivery, cursor reset, signed reconciliation hints,
  tenant-fair backpressure, connection health, and delivery evidence. Phase 30
  owns inbound migration. Phase 20 remains the only accounting doorway.
- **Source-authoritative continuity feed**: D8 bounds one exact Tenant-,
  Legal-Entity-, destination-, recipient-, Missionary-Support-Feed-Subject-, purpose-,
  Designation/Field-Account-, resource/field-, history-, currency-, schema-,
  certification-, and authorization-epoch-scoped Subscription Version. One
  immutable Coverage Manifest and atomic snapshot-through cut produce
  resumable page cursors followed by an opaque authorization-bound
  at-least-once change cursor with finite retention and explicit reset. Each
  feed namespace binds one recipient and one Missionary Support Feed Subject,
  which D19 defines as an exact Support Assignment; bulk setup creates
  independent Subscription Versions rather than a multi-recipient or multi-
  subject cursor.
  The projection is rebuildable; only subscription, coverage, change-envelope,
  delivery, and source-version evidence is immutable. Authorization and
  privacy apply before enumeration, counts, arithmetic, pagination, caching,
  hints, or diagnostics. Visible records use destination-recipient-scoped
  pseudonyms; private gifts retain only occurrence identity needed for
  correction and deduplication, never a stable hidden Party. Restricted and
  high-risk workers are excluded from ordinary activation. **Stop sharing**
  denies future egress first and reports downstream removal as confirmed,
  unsupported, or unknown without claiming deletion. TntConnect is supported
  only through a vendor-authorized, production-certified DonorHub pathway and
  MPDX only for explicitly authorized installed-base organizations. The feed
  never claims support is available, withdrawable, payroll-ready, payable, or
  paid and never creates an authoritative converted total.
- **Layered Field Account integrity and cause-owned repair**: every Tenant ×
  Legal Entity × ISO-currency scope uses immutable source-addressed atomic
  balanced occurrences with independently persisted bounded
  organization-control-side entries, checked minor-unit arithmetic, exact
  source conservation, semantic idempotency, and per-account version fences.
  Every close publishes one fresh immutable Support Cycle Integrity Manifest
  over an exact half-open business boundary and captured monotonic Phase 21
  ingestion cursor. Workload-shaped resumable verification plus bounded
  historical re-verification creates one typed root-cause Field Account
  Integrity Case with the smallest proved containment radius; mandatory adverse
  corrections remain appendable. Clean cycles require one prepared staff
  review and one close action. Exceptions expose one cause, affected scope,
  owner, and safe source-owned next action. Tenant cadence, closers, routing,
  reminders, optional proportional review, compatible presentation, and
  stricter advisories are configurable; arithmetic, isolation, currency,
  source coverage, pair atomicity, immutability, and adverse-correction
  continuity are not waivable. Mission Control owns follow-up only, while
  Phase 20 and QBO/Xero retain separately authoritative accounting delivery
  and final-reconciliation truth.
- **Immutable Support Cycle statements with automatic tenant publication**:
  D11's Support Cycle Integrity Manifest and covered occurrences remain the
  sole statement-facts authority. Every close commits only one durable
  post-close source occurrence; a deterministic Phase 21 Approved Data View
  then supplies one immutable Phase 18 Facts Package for
  `field_account.support_statement@1` when the effective D9 Support Workspace
  Publication Profile authorizes it. The profile supplies one-time prospective
  tenant control and compatible guided defaults; hidden-balance profiles expose
  no statement or existence signal, and an optional ready notice is Off by
  default. A clean cycle requires no statement-specific date, recipient,
  template, approval, Publish, retry, render-count, or resend work.
  Missionaries receive one HTML-first history and one currently authorized PDF
  action per exact Field Account, Support Cycle, and ISO currency, with
  finance-confirmed through dates and no converted total. Financial
  corrections append through a later qualified close; a same-facts
  presentation/accessibility repair creates an immutable Phase 18 artifact
  successor. Rendering, access, communication, QBO/Xero, payroll,
  reimbursement payment, and provider truth never block or mutate close truth.
- **Clean D1-D28 implementation**: Phase 21 must not reuse the dormant `Available Funds` /
  `Withdraw` component, mutable `current_funding` or `funds.current_amount`
  counters, donation sums as balances, fabricated analytics amounts, or public
  promises that a gift goes directly to a worker. It also must not reuse the
  dormant missionary donor CRUD/projection that exposes contact fields, notes,
  household details, stable anonymous identifiers, tasks, or staff-only facts.
  Assessment implementation also rejects hidden gross-to-net rewriting,
  mutable current-rate lookup, stackable fees, source-only modelling of monthly
  effects, and zero-dollar missionary assessment noise.
  Compensation implementation also rejects donation-triggered or
  percentage-of-balance pay, automatic debits from plans or reservations,
  classification inference from the missionary role, universal payroll
  adapters, a generic QBO/Xero-connected capability, duplicate payroll
  accounting, and one collapsed `Complete`, `Processed`, or `Paid` state. D7
  additionally rejects logo-only connectors, one universal payroll payload,
  regional-product collapse, mutable delivery profiles, name-only target
  matching, adjacent-object substitution, destructive overwrite, blind retry,
  dual delivery, provider-acceptance-as-completion, and launch claims backed
  only by sandbox or pending provider approval.
  Production activation additionally rejects a tenant-global enable bit,
  arbitrary flag or workflow matrices, random-row financial canaries, mutable
  readiness truth, shadow side effects, repeated manual certification,
  sandbox-as-production proof, blind retry, force-close, destructive rollback,
  or any second activation state beside D17's sole cutover.
  Reallocation implementation also rejects wallet/withdrawal language, worker
  execution authority, arbitrary destinations or workflows, current-label
  purpose inference, interested self-approval, non-atomic internal pairs,
  blind bulk approval, timer-released external coverage, target clawback,
  payment-evidence-only charitable completion, and direct accounting writes.
  Expense/AI implementation additionally rejects the display-only missionary
  `LedgerEntry` type as a financial source model, public `document-uploads` or
  Cloudinary URLs for receipt evidence, mutable whole-report approval/payment
  state, and the dormant `/mc/admin/ai` or `/mc/admin/keys` navigation links as
  an existing control plane. Those routes are placeholders, not an
  implementation seam. It also rejects feature-local provider SDK calls,
  per-feature key columns, one global tenant AI key, secret readback, arbitrary
  endpoints/models, and AI-authored expense or biography truth.
  The cutover inventory includes
  `packages/missionary/components/balance-card.tsx`, missionary dashboard
  `raisedCents`, `packages/api/src/missionary-portal/model.ts`,
  `packages/api/src/public-giving/{projection,columns,types}.ts`,
  `supabase/schema.sql` and its `current_funding` lineage, related unit tests,
  public-worker direct-to-field copy, and donor FAQ ownership claims.
  `packages/config/payouts.ts` remains Mission Control configuration and cannot
  become a compensation adapter.
  Donation-only views remain clearly labelled activity until a source-owned
  Phase 21 projection exists.
  Public support progress consumes an approved public-goal projection and
  never exposes an internal Field Account balance or ministry-expense capacity.
  Currency implementation also rejects implicit USD, mutable account currency,
  destructive merge, selector-only balance discovery, mixed-currency totals,
  provider-rate inference, a generic readiness flag, provider calls during
  close, and QBO/Xero as Field Account authority. Existing counters or donation
  sums cannot become opening balances without exact source-covered
  per-currency evidence. Phase 21 D17 opening implementation additionally rejects
  double-counted history and residuals, arbitrary-row cohorts, fuzzy identity,
  silent exclusions, fabricated history, mutable balance scalars, negative
  Field Accounts, giant transactions, universal external-lock claims, dual
  write, destructive rollback, whole-history replay, public evidence storage,
  and replay of downstream communication, document, feed, accounting,
  payroll/AP, reimbursement, or workflow effects. Feed implementation
  additionally rejects duplicate
  Phase 14/16 reads, mutable integration copies, global IDs, stable anonymous
  Party identities, all-history defaults, cursor-as-authorization, date-only
  polling or recovery, arbitrary fields, bidirectional writes, pre-filter
  counts, false `Synced` or deletion claims, destructive resync, and provider
  support inferred from a logo, public query API, sandbox, or local adapter.
  D9 implementation additionally rejects mandatory Plans, commitments,
  balances, reserves, or alerts; false zeroes; arbitrary financial formulas or
  dashboard builders; UI hiding as authorization; raw balance as an
  overstated planning numerator; commitment or provisional-support balance
  uplift; automatic Plan/Goal synchronization; cross-currency coverage or
  totals; retroactive Plan mutation; and silent expansion of D8/Phase 31.
  D12 implementation additionally rejects live historical statement
  recomputation, a second facts store or monthly scheduler, a Phase 19-style
  run, per-cycle Publish work, stable artifact bearer URLs, retroactive mass
  publication, routine attachments, duplicate user-visible versions,
  retained-evidence-as-current-access, and donor/contact-data expansion.
  D13 implementation additionally rejects mandatory expense setup; mutable or
  stacking policies; admin-authored rule order, scripts, formulas, or arbitrary
  workflow graphs; report-wide policy or approval; mixed-currency threshold
  arithmetic; implicit FX; assignment-as-authority; interested self-review;
  AI-, timeout-, or automatic approval; broad evidence bypass; generic
  override; retroactive policy mutation; and copying Profiles, Routes,
  Assignments, review workflow, or Receipt Evidence into Phase 20.
  D14 implementation additionally rejects bare Statement UI, personal-card
  batch browsing, a general importer, PDF/OCR/XLSX-derived financial truth,
  pending-as-final evidence, heuristic auto-deduplication, silent row drops,
  destructive undo, historical assignment retargeting, full PAN or sensitive
  authentication data, import-as-claim or approval, automatic reimbursement,
  Phase 21 accounting delivery, and false `synced`, `paid`, `settled`,
  `available`, or `reconciled` status.
  D15 implementation additionally rejects package access as release, download
  as handoff, Handoff Attestation or provider draft readback as payment,
  whole-report routing or `Paid`, dual delivery, timer fallback, blind retry,
  fuzzy payment matching, mutable route or package history, QBO/Xero
  Accounting as an AP-input shortcut, beneficiary-bank custody, direct money
  movement, automatic payroll/AP execution, or claimant-repayment source truth
  outside the separately ratified D16 contract.
  D16 implementation additionally rejects authorization-as-issuance,
  issuance-as-readiness, application-as-Field-Account-effect, card assignment or
  personal classification as repayment-subject authority,
  gross-obligation-then-reduction accounting, mutable source-finality, implicit
  FX, cross-currency netting, claimant debt or collections language, in-product
  money collection, payroll deduction initiation, task completion as returned
  money, evidence-strength upgrades, and policy, Requirement, reservation,
  observation, dispute, or workflow records entering accounting by default.
  D18 implementation additionally rejects a second travel policy, assignment,
  resolver, queue, workflow, or application; live approval-time government,
  map, or route lookup; one universal nonprofit rate; claimant-selected policy;
  mutable or destructively deleted schedules/calculations; arbitrary,
  natural-language, or order-dependent financial rules; preview consumption of
  cumulative capacity; mandatory GPS; implicit jurisdiction, classification,
  currency conversion, or tax treatment; silent fallback, retroactive
  recalculation, or stacked mileage/per-diem coverage; and copy that treats a
  calculation or approval as available, payable, tax-free, reimbursed, paid,
  payroll-ready, posted, or reconciled.
  D19 implementation additionally rejects person-, login-, household-, or
  team-owned Field Accounts; a polymorphic owner; shared credentials; broad
  account sharing; implicit spouse/team/leader access; participation as
  claimant, approver, payee, notification, donor-purpose, or financial
  authority; one combined membership/access/preference record; a Phase 21 ACL
  engine; assignment-aware RLS; fine grants in JWTs or client state; reuse of
  Support Hub's `public.support_assignments`; raw financial or membership
  `postgres_changes`; cascade deletion; destructive Party merge; combined
  cross-assignment balances; and participation-driven money movement.
  D20 implementation additionally rejects fallback ownership from disabled or
  unconfigured D3/D4/D10/D13/Phase 20 D19; processor-cost duplication; whole-
  ledger ingestion; record-exists-as-finality; arbitrary debits, journals,
  formulas, participant-derived splits, or current-balance charges; unresolved-
  as-close-complete; nonconserving or cross-currency arithmetic; negative Field
  Accounts; silent carryforward expiry; mutable source/policy/history;
  retroactive reclassification or ordinary backfill; live-provider close
  dependency; candidate-handoff-as-accounting-ready; duplicate QBO/Xero posting;
  sensitive source disclosure; and a standalone module, queue, zero card,
  setup nag, or per-cost missionary notification.
  D22 implementation additionally rejects implicit enablement from D13 or D19;
  hidden-but-live off-state resources; mandatory preapproval; mutable requests
  or decisions; claimant-selected reviewers; self-, AI-, automatic-, email-
  link-, broad-admin-, blind-bulk-, or timeout approval; widening an approval
  without a requester-authored successor; approval-as-funding; partial or non-
  atomic reservation; fuzzy or overlapping claim coverage; timer-based release;
  implicit FX; public plan evidence; a second workflow or reservation engine;
  procurement, cards, purchase orders, travel booking, direct payment, payroll,
  or accounting authority; and any copy that says planned or approved means
  incurred, substantiated, reimbursable, owed, available, payable, paid, posted,
  synced, or reconciled.
  D23 implementation additionally rejects generic `approved`, `paid`, or
  `posted` qualification; per-claim mode, rate, or date overrides; capacity-
  created partial effects; simultaneous reservation and debit subtraction;
  synthetic D16 settlements for organization-paid sources; pending-card,
  card-statement-payment, claimant-repayment, or accounting-state inference;
  observation revisions as new economic roots; date-only or replay-based
  adoption; live provider or FX dependency during close; D4/D23 double
  ownership; mutable close/effect history; blind retry; and QBO/Xero bill,
  payment, home amount, readback, drift, or Bank Match as Field Account effect
  authority.
  D24 implementation additionally rejects shared credentials, whole-account
  impersonation or visibility, a second policy decision point, generic or
  transitive delegation, membership/spouse/team/manager/email-derived
  authority, invitation-as-authority, stale or reusable evidence URLs,
  helper-created claimant consent, helper-selected review, self-approval,
  automatic lifecycle succession, mutable actor provenance, blind retry, and
  any helper action creating approval, payment/payroll, Field Account,
  accounting, notification, or public/supporter truth. Assignment and access
  checks must remain exact-claim-bounded, requester-specific, deny-first,
  commit-time reauthorized, and CAS-guarded.
  D25 implementation additionally rejects a case for every healthy claim,
  report-wide blocking or reopen, a fifth D13 disposition, mutable status or
  comments-as-evidence, tenant-authored `other`, custom actions/statuses/
  formulas/scripts/timers/workflow graphs, generic Resolve/Close/Reopen/
  Unapprove/Override/Edit-as-claimant/Mark-paid/rollback, broad administrator or
  service-role authority, relationship/helper/lifecycle succession, silence/
  notification/AI/provider ambiguity as proof, destructive deletion,
  overlapping last-created-wins cases, float or cross-currency arithmetic,
  reusable evidence URLs, hidden partial success, blind retry, task state as
  case completion, or case completion as approval, payment, Field Account,
  statement, accounting, posting, or reconciliation truth.
  D26 implementation additionally rejects a universal retention period,
  mutable `expires_at`, tenant-authored legal DSL, arbitrary timer, casual
  forever, direct delete, floor weakening, unsupported privacy-ceiling breach,
  export-triggered disposal, download-as-transfer, paper/PDF as universal
  original, silent package omission, generic database dump, Phase 19 Audit
  Package or Phase 20 Accounting Delivery Package reuse, QBO/Xero backup
  claims, reusable package URLs, email attachment, broad restricted-person
  export, giant transaction/archive, cross-owner deletion, Phase 30 outbound
  ownership, launch-time connector sprawl, restore resurrection, or a
  disclaimer purporting to erase Asym's duties.

**Boundaries & guardrails.** A Field Account balance is organization-owned
operational truth, not a donor asset, worker-owned bank balance, contribution
ledger total, donor receipt fact, bank reconciliation, payroll record, AP
ledger, or general-ledger balance. UI must never frame a gift as irrevocably
earmarked to an individual (“give to John's account”), as `your money`,
`available salary`, `withdrawable`, or `available to cash out`. Expense Claim,
policy decision, Approved Expense Snapshot, Reimbursement Obligation, Field
Account Funding Coverage, external payment execution/evidence, Field Account
effect, Accounting Release, provider delivery, and final reconciliation remain
independently truthful even when one screen summarizes their progress. Worker
classification and applicable wage, reimbursement, accountable-plan, and
international rules remain tenant/adviser-owned; Phase 21 cannot universalize
one agency's short-check, deficit, or hold-until-funded practice.

**Grooming status.** D1-D28 are ratified and scope-frozen as the complete
founder product authority; `/to-spec` is in progress and creates no D29. D8
resolves the exact Phase 21-to-31
read-projection contract and leaves provider activation subject to exact vendor
authorization and production certification. D9 resolves optional
organization-approved Support Plans, conservative purpose-separated planning
projections, and bounded native workspace publication without conflating Phase
28 goals, Phase 16 commitments, D4 compensation funding, or D1 balances.
D10 resolves claim-level expense truth, report-first review, private
many-to-many receipt evidence, exact selective approval/recovery, and the
minimal shared purpose-routed tenant AI foundation without making AI, a report,
or Phase 20 authoritative for expense facts.
D11 resolves exact Field Account occurrence/control invariants, cursor-fenced
close proof, workload-shaped re-verification, smallest-scope containment,
cause-owned repair, and one quiet machine-prepared close without making
Mission Control tasks or QBO/Xero Field Account authority.
D12 resolves immutable Support Cycle statement facts, the Phase 21-to-18
Approved Data View and purpose boundary, one-time prospective tenant
publication, zero-routine-work close operation, exact per-currency missionary
access, append-only correction, same-facts artifact succession, and
exception-only recovery without creating another statement run or financial
authority.
D13 resolves one quiet tenant-enabled Expense Program, bounded immutable
prospective Expense Governance Profile and finite Approval Route versions,
deterministic item/split-level incurred-date policy resolution,
submission-time assignment snapshots with current-authority rechecks,
conflict-free human review, clean-only consequence-previewed bulk approval,
typed independently authorized Reviewer Exceptions, and the PII-minimized
approved-snapshot-only Phase 20 boundary without creating an arbitrary policy
engine, generic workflow system, or accounting/payment authority.
D14 resolves one optional file-first organization-card evidence product over
the complete manual claim path: bounded immutable CSV interpretation, atomic
manifest acceptance, exact identity tiers, overlap-to-review, effective-dated
routing assignments, same-currency coverage conservation, append-only source
adjustments, private raw-file handling, quiet claimant and exception-first
finance UX, and the existing approved-snapshot-only Phase 20 boundary. It does
not create a general importer, card ledger, repayment or reimbursement engine,
payment rail, accounting connector, or reconciliation authority.
D15 resolves one immutable artifact-always reimbursement handoff, explicit
coverage-scoped release ownership, a complete outside-Asym default, bounded
capability-certified payroll/AP pre-execution inputs, D7 technical-kernel reuse
without domain conflation, ambiguity quarantine and residual-only succession,
separately qualified payment evidence and strength, exact append-only payment
coverage/recovery, quiet staff and claimant stages, and the Phase-20-only
QBO/Xero Accounting boundary. It does not move money, store beneficiary bank
details, calculate or execute payroll/AP, infer payment from provider or
accounting state, or certify claimant repayment.
D16 resolves independently activatable prospective advance and repayment
policies, exact authorization/issuance/Advance Application Readiness separation,
atomic expense settlement, authorization-created `expense_advance` Field Account
Funding Coverage fulfilled only by a qualified Field Account Effect, immutable
Repayment Subject Determination, operational rather than debt-framed return
requirements, exact externally handled repayment occurrences and evidence,
append-only correction, externally evidenced cross-currency application, and a
closed Phase 20 admission boundary that keeps non-economic workflow and policy
records accounting-dark by default.
Phase 21 D17 resolves one finance-authorized, per-Field-Account and per-currency
reconciled immutable Opening Position over a complete Tenant × Legal Entity ×
ISO-currency activation cohort; one precedence-explicit Opening Source Package,
five-way exact coverage disposition, complete Opening Coverage Manifest,
private resumable staging, final reproof, one short CAS-guarded Asym-side
operational cutover, first-close cursor continuity, independently live coverage
carry-forward, D9-gated side-effect-dark activation, append-only late-fact
correction, smallest-scope containment, and independently authoritative Phase
20/21/30 boundaries. It does not reconstruct unverifiable history, write a
balance scalar, make QBO/Xero authoritative for Field Accounts, replay
downstream effects, or claim Asym locked an external source.
Phase 21 D18 resolves one optional policy-pinned Travel Allowance Calculation
inside the single winning D13 Expense Governance Profile, with an explicit
Actual-expenses-only default; tenant/adviser-owned applicability; individually
certified immutable official Source Packages or bounded tenant-owned schedules;
typed mileage, fixed-allowance, actual-against-limit, and external-calculation
modes; exact source/input/component/rounding/coverage evidence; deterministic
serialized cumulative capacity; duplicate-reimbursement prevention;
prospective production-shaped preview and CAS activation; append-only source-
revision and late-fact recovery; low-friction manual, odometer, optional route/
GPS, per-day, and offline claimant paths; and one quiet exception-first finance
experience. The calculation remains D10 claim evidence, freezes only through an
Approved Expense Snapshot, and creates no approval, availability, obligation,
Field Account, payment, payroll/tax, or Phase 20 accounting authority.
Phase 21 D19 resolves one immutable organization-controlled Support Assignment
as the canonical Field Account subject, one Field Account per Support
Assignment and ISO currency, and prospective zero-to-many Support Assignment
Participant Memberships. Participation may exist without a login. Participation,
Phase 12 request-time Support Workspace authorization, D10/D13 expense
responsibility, D4/external Engagement Authority compensation/payee identity,
Phase 28 support-raising coaching/task truth, and recipient-scoped Support
Workspace Notification Preference Versions stay independently
authoritative even when one quiet **People & access** action coordinates their
explicit commands. It supports couples, teams, participant-free projects,
several assignments per person, scoped leaders, mobile invitation recovery,
deny-first revocation, life-event succession, exact assignment/currency
navigation, forced coarse Tenant RLS, one server PDP, and signal-only Realtime
without relationship-derived access, shared credentials, destructive merge,
another ACL engine, or people-driven financial effects.
Phase 21 D20 resolves one absent-unless-enabled, source-authoritative residual
Organization Support Cost Application lane with configuration-independent
semantic ownership, including an explicit exclusion for Phase 20 D19 processor
costs. Exact source-family admission, one economic root, organization-absorbed
default, finite tenant bearing treatments, evidence-backed allocation, one
immutable per-currency conserving manifest, purpose-typed non-reusable
coverage, D1/D11-only close recognition, no discretionary overdraft, mandatory
adverse-correction continuity even when it exposes a visible deficit, optional
bounded carryforward, source-pinned append-only correction, exact external
currency evidence, and complete Tenant/Legal-Entity/Support-Assignment/Field-
Account isolation are binding. All Support Cost Accounting Candidate Handoffs
remain Phase 20 accounting-dark pending a separate certified contract. Disabled,
zero-work, unauthorized, and unaffected scopes expose no feature signal; clean
work and exceptions reuse existing close and D11 surfaces, and missionaries see
only authorized grouped post-close effects.
Phase 21 D21 resolves the noncash-to-support bridge without treating valuation
as money or creating a second gift. Phase 13 retains the original Contribution
and donor/receipt/fundraising truth; Phase 15 retains exact asset, disposition,
proceeds, finality, evidence, and correction truth; and one immutable D21
Noncash Support Realization Manifest may derive only an exact source-final
Realized Support Basis. The no-setup default uses exact net proceeds, while a
prospective organization-absorbed exact-cost treatment requires complete proof.
Exact quantity and per-currency minor-unit coverage, deterministic purpose
allocation, D6 conversion, D17 non-overlap, append-only corrections, and D2/D11
CAS-guarded admission are binding. D3 assesses only the realized basis. Phase 20
must separately certify one nonduplicate accounting source before any delivery;
QBO/Xero remain authoritative for asset derecognition, gain/loss, cash, and
reconciliation. The experience stays conditional, exception-first, and one
grouped lifecycle, with no availability, payment, or accounting claim.
Phase 21 D22 resolves one independently optional, structurally absent-by-
default Prospective Expense Authorization inside the existing Expenses doorway
and D13 governance kernel. One short requester flow, immutable request versions,
submission-time governance and finite assignment snapshots, current-authority-
rechecked human review, narrowing-only decisions, exact later D10 item/split
coverage, partial and multi-claim use, and append-only succession are binding.
The guided default is approval-only; a separately certified advanced scope may
atomically reserve exact same-purpose and same-currency D1 planning capacity.
Expiry stops new reliance but never proves unused residual or releases capacity,
and uncertain in-flight work remains quarantined. Missing required authorization
does not block actual claim or evidence capture; D13 records the exact exception.
Phase 20 rejects all D22 prospective objects, and D22 adds no procurement,
cards, wallets, spend limits, purchase orders, travel booking, payment, payroll,
or accounting authority.
Phase 21 D23 resolves ordinary approved-expense support-balance inclusion
through one prospective certified-source-family profile and one immutable
Approved-Expense-Snapshot-rooted Effect Basis. Claimant-paid families use D16's
settlement partition; organization-paid families bind approved economic-payer
coverage directly. Exact per-currency Effect Coverage and append-only Funding
Coverage Dispositions conserve every slice, prevent reservation-plus-debit
double subtraction, and restore a successor reservation atomically when an
exact-payment return leaves the obligation live. Initial adoption uses D17's
no-gap/no-overlap cutover manifest; later profile replacement uses a complete
D11 boundary/cursor and in-flight manifest. D4, D16, D20, and D21 remain
exclusive owners; D1/D11 alone admits and closes the operational occurrence;
and Phase 20 independently admits only its closed accounting sources. QBO/Xero
delivery and reconciliation cannot qualify or rewrite D23. The clean path is
automatic and the experience separates approval, support-balance inclusion,
reimbursement/payment, and accounting without claiming availability, payment,
or GAAP recognition. See
[ADR-0084](../../adr/0084-source-family-expense-field-account-effect-recognition.md).
Phase 21 D24 resolves optional own-identity expense help through one exact-
claim-bounded Assignment Version, authority-free invitation and verified
acceptance, a prepare-only default, and one separately enabled claimant-
confirmed mechanical submit operation. Phase 12 remains the sole request-time
authorization authority; the collaboration-mode and Evidence Access Projection
versions are ceilings, not grants. Every route, job, retrieval, export, and
commit rechecks the current requester and exact assignment scope, while
commit-time epoch/version CAS blocks stale work. Private evidence retrieval is
short-lived and non-cacheable; revocation ends future access without claiming
to recall delivered bytes. Distinct claimant, payer, contributor, preparer,
submitter, confirmer, reviewer, approver, payee, and principal provenance is
immutable. D24 creates no approval, obligation, payment, Field Account effect,
payroll, Phase 20 accounting, notification, relationship, or successor
authority. See
[ADR-0085](../../adr/0085-own-identity-claim-bounded-expense-collaboration.md).
Phase 21 D25 resolves exceptional actual-expense recovery through one immutable
exact-scope Expense Claim Resolution Case, seven code-owned causes, separately
attributed actors, one literal next safe action, and one proportional complete
Downstream Impact Manifest. Same-cause repeats converge, distinct cases may be
grouped for presentation only, and clean separable siblings continue. Case
completion derives from root-source proof plus an explicit disposition for
every affected owner family; no generic Resolve/Reopen/Unapprove/Override,
tenant workflow builder, broad admin bypass, relationship/AI/timer authority,
or destructive mutation exists. Phase 12 remains the sole PDP; D10/D13,
D15/D16, D23/D1/D11, D12, Phase 20, payroll/AP, and providers alone append
their own source results. The claimant receives one quiet contextual update,
finance reuses **Expenses → Needs attention**, and Mission Control/Phase 34 may
mirror follow-up only. **Complete** never means approved, reimbursable, owed,
funded, available, payable, paid, Field Account-included, statement-corrected,
accounting-delivered, provider-accepted, posted, synced, or reconciled. See
[ADR-0086](../../adr/0086-cause-owned-expense-claim-resolution.md).
Phase 21 D26 resolves Phase 21 records policy and exact tenant custody exports
through six closed source-purpose record families, immutable schedule contract
and prospective binding versions, per-record retention resolutions, complete
successor-impact and export coverage manifests, and one sealed open-format
Records Export Package per Legal Entity. Contextual copy/print, complete
archive, offboarding snapshot-plus-delta, Tenant External Copy Assertion, and
Verified Destination Custody Transfer are explicitly different actions. A
package is **Ready** only when manifest coverage closes; **Ready with issues**
remains truthfully partial and may receive an append-only residual. Phase 21
owns meaning, Phase 29 owns physical lifecycle execution for Phase-21-owned
evidence and D26 package bytes, and Phase 18 retains its generated-document
artifact bytes and lifecycle. Phases 3/10/12 own egress, Phase 30 remains
inbound, Phase 31 owns optional destination transport, and Phase 38 owns privacy
requests. No export changes source
retention, releases a hold, proves legal sufficiency, posts accounting, or
erases either the tenant's external-copy responsibility or Asym's own custody
duties. See
[ADR-0087](../../adr/0087-purpose-owned-phase21-records-schedules-and-exact-custody-exports.md).
Phase 21 D27 resolves one evidence-gated Core Field Accounts Production
Activation Contract composed through D17's sole Operational Cutover. One
immutable Release Generation, one prospective Adoption Plan Version, and one
content-addressed Go-Live Readiness Manifest bind the complete financial cohort,
exact authority boundary, environment, and code/schema generation while
referencing rather than recreating every applicable D1-D26 and owning-phase
proof. Synthetic, sandbox, and production-shadow evidence stay distinct; the
complete-cohort production shadow is non-authoritative and side-effect-dark.
One quiet consequence review and literal start action perform final reproof
inside D17's idempotent CAS cutover. Optional capability bindings remain
independent, a named missionary pilot narrows publication only, and one derived
through-dated readiness projection opens only cause-owned exceptions. Live
drift receives smallest-scope prospective containment and append-only recovery,
not a global disable, second activation state, force-close, or destructive
rollback. See
[ADR-0088](../../adr/0088-evidence-gated-core-field-accounts-production-activation.md).
Phase 21 D28 resolves native cumulative Travel Allowance adoption through one
source-defined clean-period default, immutable Opening Cumulative State, stable
Capacity Key Contract, and complete opening-plus-continuity Admission Manifest
for every exact pool or indivisible group before first native use. A clean reset
proves only opening zero, never prospective completeness; missing never becomes
zero, later pools receive the same proof, and uncertain or externally changing
scope remains fully usable through D18's external-calculation lane. First use is
group-atomic and CAS-guarded, late predecessor facts append through affected-
suffix correction, D27 may reference but never own the proof, and no D28 fact
creates a claim, approval, Field Account, obligation, payment, payroll/tax,
statement, accounting, posting, or reconciliation truth. See
[ADR-0089](../../adr/0089-proof-gated-opening-cumulative-travel-allowance-admission.md).
The post-D28 completeness audit found no remaining Phase 21-owned founder seam.
Implementation prerequisites, provider/source certification, and verification
matrices now belong to the implementation-ready specification rather than a
new product decision.

**Status.** `PRD exists` — D1-D28 are scope-frozen and the complete
implementation-ready PRD/OpenSpec contract was published on 2026-08-02 as
[#1108](https://github.com/Asymmetric-al/core/issues/1108). The approved
implementation graph is epic
[#1109](https://github.com/Asymmetric-al/core/issues/1109), lane epics
[#1110](https://github.com/Asymmetric-al/core/issues/1110) through
[#1120](https://github.com/Asymmetric-al/core/issues/1120), and P21-01 through
P21-101. Tickets are published and governed by their native blockers; Phase 21
runtime and production authorization are not claimed.

---

### Phase 22 — Public Missionary & Project Page Workflow (`public-ministry-pages`)

**What this phase is (plain language).** The public pages where donors meet
missionaries and projects — connected to _real_ operational records instead
of the mock data the public `/workers` pages render today. A missionary's
public page shows their story, a support progress bar, and a give button
that lands in the right designation with the right attribution; the
missionary can propose edits; staff approve; and **restricted workers are
protected by construction** (Phase 10).

**Why it sits here.** Needs the Phase 5 runtime contract, Phase 9 parties
(pages represent parties), **Phase 10 safety (hard — a public identity
surface must not exist before the publication firewall)**, and Phase 13
designations (CTAs carry designation + source code + site/locale context).

**What it covers.**

- **Public page ↔ party linkage**: presentation identity (CMS content)
  referencing operational identity (party) — reference, never copy; the
  public projection renders only Phase 10 public-tier fields (alias,
  approved photo, generalized region for restricted workers).
- **Support progress**: percent-raised / monthly-support-vs-goal computed
  from source-authoritative ledger facts and commitments (13/16; offline
  gifts included via 15) against an approved Phase 28 support-raising goal,
  through the existing PII-safe public projection pattern. Base public pages
  ship cleanly without this optional progress widget until that approved goal
  projection exists. Its numerator and denominator must use the same explicit
  currency and period; a converted comparison is a visibly labelled Phase 33
  reporting projection, never source truth. It never exposes or substitutes a
  Phase 21 Field Account balance, available-to-spend amount, assessment,
  expense, or accounting total. When donor-facing assessment disclosure is
  required, Phase 22 may render only the approved general policy-language
  projection; it never exposes an account-specific profile, rate,
  determination, or support-credited result and never recalculates progress
  from those effects.
- **Missionary edit workflow**: workspace-submitted drafts → staff review
  queue → publish, consuming Phase 10's publication firewall + review-verdict
  contract and photo/EXIF scrubbing in the pipeline; shareable expiring review
  links.
- **Optional AI drafting assistance**: a tenant may bind an independently
  authorized public-profile drafting purpose through the shared D10 AI Provider
  Connection, write-only Credential Revision, and prospective
  capability-certified Binding Version. Phase 22—not Phase 21 or the model—owns
  biography draft meaning, source selection, human acceptance, moderation,
  consent, review, and publication. The feature is suggestion-only, never reads
  receipt evidence, never bypasses the Phase 10 firewall, and has a complete
  manual writing path.
- **Giving CTAs** preserving site, source code, locale, currency, and
  designation through the Phase 5 checkout handoff into the Phase 13 cart.
  The server resolves the designation's exact Legal Entity and
  SettlementAccountBinding and shows the issuer before confirmation; a Site
  never defines or overrides financial ownership.
- **Project/campaign pages** with the same mechanics (designation-backed,
  progress from ledger truth).
- **Page lifecycle**: created on mobilization and retired safely on departure.
  Phase 21 D5's exact Worker Lifecycle Authority Reference may trigger the
  presentation task, but Phase 22 retires or redirects only after Phase 13/16
  proves the financial destination or recurring-term successor. A page never
  chooses or silently redirects money, and no orphaned page continues
  collecting for an inactive destination.

**Boundaries & guardrails.** Public pages are presentation, never
operational identity or financial truth. Missionary edits route through
approval. Restricted-worker rules are enforced at the projection, not by
page-by-page configuration (SiteStacker's page-level "Authenticate" checkbox
model is the anti-pattern).

**Open questions for grooming.** Slug policy for restricted workers (never
name-derived); page templates per org vs per-missionary customization
latitude; whether staff can override a missionary's page entirely; and, after
source-owned financial succession is proved, whether the departed-worker page
redirects to the approved successor presentation or shows an explanatory
message.

---

### Phase 23 — CMS / Site Planner Dynamic Content Parity (`web-studio-cms`)

**What this phase is (plain language).** Grow Web Studio into the ministry
publishing product SiteStacker's Site Planner represents: a page tree,
menus, dynamic content lists, redirects, scheduled publishing windows, and
site search — a friendly two-pane "content vs site plan" experience for
non-technical ministry staff, **without ever exposing raw Payload admin**.

**Why it sits here.** Only hard-needs Phases 5/3/2 — it can start early when
content-lane capacity exists (its number reflects priority, not
dependency). Phase 10 and Phase 22 gate only the public operational blocks
that consume their safety and publication contracts, not the CMS foundation.

**What it covers.**

- **Page tree** (drag-drop sitemap over the Payload nested-docs plugin —
  parent/breadcrumb/URL cascade is plugin-provided; the tree UI is the Web
  Studio build), per-site slug uniqueness, auto-redirect on slug change.
- **Menu management** with item-level visibility conditions and versioned
  draft/preview (the Phase 5 nav draft-leak fix must hold through the menu
  editor).
- **Redirects UI + runtime enforcement** (the Payload redirects plugin only
  _stores_ them — the public app must enforce, with loop/collision
  validation and cache-tag invalidation).
- **Visibility windows**: scheduled publish **and unpublish** via Payload
  `schedulePublish` — which silently never fires without a deployed jobs
  runner; wire the runner (Inngest vs Payload jobs — one scheduler, decided
  at grooming) _before_ the UI ships, with a bounded-staleness backstop.
- **Dynamic content lists**: missionary/project/opportunity/article list
  blocks bound to operational records through the published-only,
  tenant-scoped choke point (SiteStacker's dynamic content types are the
  parity bar). Missionary, project, and opportunity blocks remain unavailable
  until the Phase 10 public projection and Phase 22 publication workflow are
  active; Payload never queries or copies raw operational rows.
- **Adopt Payload core, don't rebuild**: Folders, Query Presets, Trash,
  autosave, version history, Live Preview; SEO/search/form-builder plugins.
- **Localization flags enabled now** on content collections (retrofitting
  `localized: true` later forces a storage-shape migration — cheap insurance
  under the fresh-build posture), even while the UI ships English-only.

**Boundaries & guardrails.** Payload remains the content engine; Web Studio
is the ministry UX; public runtime stays separate from the donor portal.
Vendor risk is real (Payload acquired by Figma; its Visual Editor is
enterprise-tier "coming soon") — the Phase 5 Asym boundary contains it;
nothing on this roadmap may depend on Payload enterprise features. Judge
parity on staff outcomes, not wrapper-nesting nostalgia — model
SiteStacker's inherited-content/wrapper cascade as per-site layout defaults.
CMS configuration cannot bypass a source domain's publication or safety
contract.

**Open questions for grooming.** Audience-conditional public content
(beyond date windows) vs the tenant-keyed cache — needs an explicit
personalization/cache rule before conditions ship; per-locale publish status
(Payload `localizeStatus` is beta); content import/export as staff-facing vs
ops-only.

---

### Phase 24 — Full Multi-Site, Language & Currency Management (`multi-site-management`)

**What this phase is (plain language).** Phase 2 built the primitives (site,
locale, currency, entry method, source code); this phase builds the **staff
management product** on top: run a second branded site, add a domain and
watch it verify, enable a locale and see translation status, configure
currencies — all self-service in Mission Control/Web Studio.

**Why it sits here.** After Phase 23 (site management UX lives in the
Studio shell) and Phase 2/5 (primitives + runtime).

**What it covers.**

- **Site management**: create/configure branded sites (SiteStacker's Site
  Channel mental model: per-site domains, templates, language, content
  sharing), per-site branding and defaults, and one shared tenant checkout
  policy. Every financial route is prospectively bound to one exact Legal
  Entity, Designation, SettlementAccountBinding, environment, and currency
  lane; a Site supplies presentation and entry context but never defines
  financial ownership.
- **Domain lifecycle**: wildcard tenant subdomains by default; custom
  domains added/verified via the Vercel Domains API with **async
  verification status UX** (the API is rate-limited — 50/hr/team — so bulk
  onboarding must queue), automatic SSL, fail-closed unknown-host behavior
  (Phase 5).
- **Localization management**: enabled locales per site/tenant, translation
  status visibility, fallback-chain configuration, per-locale system-message
  overrides (with Phase 17).
- **Currency management**: per-site default plus enabled donor presentment
  currencies, donor-facing conversion disclosure, and clear separation of
  presentment from settlement. The ordinary path lets Stripe convert activity
  into the tenant's local settlement currency and Phase 20 accounts from exact
  provider balance-transaction evidence. Retaining and paying out a separate
  foreign currency is optional and activates only after Phase 20 D20 certifies
  the exact Tenant, Legal Entity, SettlementAccountBinding, current
  Stripe-region capability, matching-currency payout destination, and QBO or
  Xero currency path. Provider fees, minimums, availability, and limits are
  live source-labelled facts rather than roadmap constants. Donor presentment
  never creates or selects a Phase 21 Field Account, Default Field Account
  Currency Version, or source-family-specific Field Account Currency
  Activation Version.

**Boundaries & guardrails.** This phase manages context; it creates **no new
money truth** outside the ledger. Currency correctness is type-level
(minor-unit integers with currency exponent — ¥/BHD edge cases) everywhere
amounts render. It may enable donor presentment and certified settlement lanes
prospectively, but cannot convert, merge, or rewrite Phase 21 Field Account
currency, Activation Version, Support Currency Allocation Manifest, or any
frozen Phase 20 Accounting Release.

**Open questions for grooming.** Whether the donor portal lives on tenant
domains or a platform domain; brand-theming depth per site. Phase 24 only
surfaces Phase 17-owned sender-domain, outbound-identity, and readiness status
per site/locale; it does not own Resend credentials, sender profiles, or
delivery configuration.

---

### Phase 25 — Donor Dashboard Depth (`donor-portal-depth`)

**What this phase is (plain language).** The donor portal becomes a
complete self-service home: manage recurring giving (change amount, pause,
skip, reactivate), keep payment methods current, view or download the
exact-current receipt and statement for each logical document, control
communication preferences by topic, and see a giving history with impact —
the features research shows retain recurring donors (pause/skip alone retains
~8 of 10 recurring donors over 12 months; amount-modification cuts
cancellation likelihood ~26%).

**Why it sits here.** After identity (4), projections (3), the ledger (13),
receipt facts (7), comms (6), recurring commands (16), governed messages (17),
canonical generated documents (18), and statement runs (19).

**What it covers.**

- **Recurring control** built as custom UI over the Phase 16 server-command
  and provider-adapter contracts — explicitly **not** delegated to the hosted
  billing portal. Donors can change eligible future amount/date/designation
  terms, skip one named occurrence, pause until a date or indefinitely,
  resume a pause, and cancel. Restart after cancellation requires fresh
  authorization and creates a linked successor; it never resurrects the old
  authorization. The portal consumes Phase 16's separate donor-intent,
  schedule/occurrence, payment/collection-health, and provider-control/
  reconciliation facts. A planned pause is shown truthfully as paused, never
  inferred as behind or lapsed. Phase 25 owns the donor-facing portal UX and
  wallet completion, not a second lifecycle or retry authority.
- **Wallet**: add/remove/set-default payment methods (the settled
  disposition's donor-side completion), network card-updater, pre-expiry and
  failed-payment notices with self-service recovery links (17).
- **Documents**: for each logical per-gift receipt or year-end statement,
  present one exact-current canonical accessible PDF with a clear current
  status and correction explanation plus unmetered view/download. Immutable
  prior versions remain governed evidence in Phase 18, not separate donor
  file choices. Repeatable outbound-copy requests use Phase 19's bounded
  fulfillment contract; offline/imported gifts merge into one history without
  minting retroactive receipts.
- **Giving history + impact**: cumulative totals partitioned by currency,
  per-missionary/project impact view, CSV export (Phase 3-governed). Any
  converted comparison is an explicitly labelled Phase 33 reporting
  projection with rate, basis, and as-of time, never source truth.
- **Preference center**: topic- and channel-granular over the shipped
  consent gate; **RFC 8058 one-click unsubscribe** honored instantly
  (Gmail/Yahoo bulk-sender rules) with topic mapping — never
  unsubscribe-all-by-accident, and transactional mail (receipts) never
  suppressed by marketing opt-out.
- **Access**: passwordless magic-link flows aligned with Phase 4
  account-claiming (guest-first; enumeration-safe, constant-time).
- **"My Campaigns"** socket reserved for Phase 36 P2P.

**Boundaries & guardrails.** The donor portal is self-service — never a
staff finance or CRM console. Everything renders through Phase 3
projections.

**Open questions for grooming.** Household visibility (do spouses see each
other's gifts — Phase 7 receipted-donor model governs); giving-history depth
for imported legacy data (with 30); donor-facing designation names for
restricted workers (10).

---

### Phase 26 — Support Hub & Conversation Management (`support-hub`)

**What this phase is (plain language).** The staff home for **inbound**
communication: a donor replies to a receipt, a church emails a question, a
missionary asks for help — every message lands in a shared team inbox,
routes to the right person, links to the sender's CRM record, and can't be
lost, double-answered, or silently dropped. The industry table stakes are
four features: **assignment, collision detection, internal notes, and
status tracking** — plus a quarantine queue so no donor email ever
disappears.

**Why it sits here.** After the comms spine (6 — conversations emit into
`communication_events`), parties (9 — sender linking), and templates (17 —
macros/canned responses ride the same variable safety), with Phase 10
classification deciding which subjects may enter the general inbox. **The repo is
already well down this road** — a 19-table Support Hub schema (inboxes,
agents, teams, labels, SLA policies, conversations, messages, saved views,
macros, automation rules, audit log), a live Supabase adapter with
inbound-email → conversation routing through the durable workflow ledger,
an admin workspace UI, and unit + e2e smoke coverage all exist (classified
durable), alongside an **older parallel `support` module (fixed queue ids)
that this phase must consolidate or retire**, plus two written-but-
unexecuted hardening plans (SQL-side filters; inbound pipeline). This phase
grooms all of that against the researched semantics and completes the
product.

**What it covers.**

- **Conversation model**: one canonical thread with typed parts (customer
  message / staff reply / internal note / system event — notes structurally
  never deliverable), status lifecycle (decide Front-lightweight
  open/snoozed/closed vs Zendesk-full at grooming; snooze-with-timer and
  reopen-on-reply either way).
- **Collision detection that blocks send** on mid-compose updates (Help
  Scout semantics) — the highest-ROI delta over a shared mailbox.
- **Assignment**: individual + team, manual, round-robin, and rules
  conditioned on CRM party data (donor tier, missionary link, content, wait
  time); an explicit unassigned queue. Launch routing is a bounded coded
  policy, not a second tenant-authored automation engine.
- **CRM linking**: auto-match sender → party on exact email;
  suggest-and-confirm for unknown senders (never HubSpot-style auto-create
  junk); conversations on the person timeline via the Phase 6 emit-hook with
  the dedupe rule (support replies must not double-write timeline events).
- **Inbound ingestion**: forwarding-based + BYO-domain (MX/inbound routes)
  with verification; RFC-2822 threading (In-Reply-To/References) +
  unguessable plus-address tokens as fallback; quoted-reply stripping;
  attachment limits. The provider spike qualifies Resend Inbound against the
  mandatory contract first. Other providers remain contingency research only
  if Resend cannot satisfy a mandatory inbound capability; Phase 26 does not
  ship a multi-provider mail adapter.
- **The safety layer ships before real domains open**: suspended/quarantine
  review queue (never silently drop), Auto-Submitted/Precedence:bulk
  detection, per-sender loop rate limits (Zendesk's 20/hr-suspend, 40/hr-
  reject budget), DMARC-failure and own-address-loop guards.
- **Outbound failure states on the conversation** (pending → retrying →
  undelivered/bounced) from the Resend webhooks + Phase 6 monotonic machine.
- **SLA machinery** (schema exists): first-reply/next-reply/resolution
  against business-hours calendars — groom whether small missions teams need
  enforcement UI at launch or reporting suffices.
- **Macros/canned responses** through the Phase 17 variable allow-list.

**Boundaries & guardrails.** Support Hub owns support work — not CRM truth,
provider mail truth, message-template truth, or member-care private truth
(care-classified subjects route to Phase 38 surfaces, not the general inbox).
Phase 17 owns and prepares governed replies; Phase 6 dispatches and records them.
Existing `support_automation_rules` remain inert versioned data until Phase 34
becomes the sole configurable trigger/condition/action vocabulary and
adopts or migrates them; Phase 26 does not forward-gate on Phase 34 or ship a
parallel builder.

**Open questions for grooming.** Whether donors/missionaries get a "my
messages" portal view (rides Phase 6 projections) or the hub stays
staff-only; conversation merge/split at launch; retention/redaction class
for message bodies + attachments (Phase 6 redact-not-delete interplay);
auto-acknowledgment policy and loop budget.

---

### Phase 27 — Donor Development & Portfolio Management (`donor-development`)

**What this phase is (plain language).** The staff-side relationship-
cultivation product (this program's **beyond-parity differentiator** —
SiteStacker has nothing here): development officers and regional reps work
assigned portfolios of major donors and church partners through a
cultivation pipeline, record asks, follow a next-action cadence, and watch
engagement scores — the RE NXT / Salesforce Nonprofit Cloud capability
rebuilt missions-first. Moved ahead of Missionary Workspace depth (28)
because the workspace exposes a **safe slice of these same concepts**; build
the truth once, staff-side first.

**Why it sits here.** Hard on Phase 9 (the graph + staff-assignment edges +
reserved sockets), with the ledger (13); consumes credit ops (14) and
commitments (16); Support Hub context (26) enriches it; reporting (33) and
workflows (34) enhance it later.

**What it covers** (the three-object domain reserved by Phase 9 A12):

- **Portfolios as derived views** over active staff-assignment edges (roles
  as data: donor_rep / regional_rep / church_relations / mobilizer) —
  rule-based auto-assignment + manual override, assignment history, **no
  stored portfolio table**.
- **Pipeline enrollments** carrying cultivation stage — one enrollment
  primitive with **stage presets**: staff preset (identification →
  qualification → cultivation → solicitation → stewardship) and the
  missionary MPD preset (Phase 28 reuses this object, different preset;
  never fork the model per surface).
- **Ask/proposal records**: asked/expected/funded amounts + status + owner
  (the RE NXT opportunity pattern), tied to Phase 13 campaigns/designations;
  pipeline rollups by status and owner; projection-accuracy metrics. Every
  monetary ask carries an explicit currency and Legal Entity/campaign scope.
  Rollups remain same-currency and same-entity unless Phase 33 supplies a
  visibly labelled reporting conversion.
- **Next-action discipline**: every active enrollment has a next task with a
  due date; **portfolio health metrics** (untouched prospects, stage aging,
  overdue actions) — research shows 55–65% of prospects in naive portfolios
  are never visited; health metrics are the fix, not bigger lists.
- **Engagement scoring v1**: transparent RFM bands recomputed on schedule,
  score-drop alerts as tasks; advisory input to stage, never the stage.
  (Fills the Phase 9 Overview socket that ships with placeholder data.)
- **Appeals (org-scope)**: goal + Excluded/Asked/Committed/Received/Given
  buckets (MPDX model; collapse Received/Given if same-database processing
  makes the distinction moot — decide at grooming), list + kanban views,
  segment export. Goals and buckets use explicit currency lanes; Phase 27
  never sums unlike currencies into one scalar.
- **Church-partnership development**: org-party pipelines (sending/
  supporting church cultivation) as a first-class preset.
- **Donor brief**: pre-meeting summary generated from the party record
  (giving, commitments, interactions, relationships).

**Boundaries & guardrails.** Cultivation stage is never a lifecycle status
and never authorization. Asks are never edges or custom fields. Suppression
(never-ask, do_not_contact) blocks ask suggestions and appeal inclusion via
the one consent authority. AI next-best-action/wealth screening explicitly
deferred post-parity — deterministic cadence first.

**Open questions for grooming.** Interaction-visibility policy when a donor
is in both a staff portfolio and a missionary's supporter list (staff see
all; missionary sees own + shared? — decide precisely); ask approval
workflows; per-tenant stage-preset customization latitude; which leadership
rollups land here vs Phase 33.

---

### Phase 28 — Missionary Workspace Depth & Support-Raising CRM (`missionary-workspace-depth`)

**What this phase is (plain language).** The missionary's personal
support-raising (MPD) home — the MPDX/TntConnect capability rebuilt
first-party. Because Asym owns both the org CRM **and** the missionary's
supporter data in one database, DonorHub-style middleware is not required for
normal Asym operation: a gift lands and the missionary's thank-you task exists
in near-real-time. Phase 21 D8 and Phase 31 nevertheless preserve one optional,
tenant-controlled, read-only continuity feed for a certified DonorHub pathway
or an explicitly authorized installed-base MPDX organization without making
either provider a source of truth.

**Why it sits here.** After the kernel exists: parties (9), ledger (13),
commitments (16), comms (6), projections (3), and the shared cultivation
objects (27), with Phase 10 safety and the exact authorized Phase 21 source
projections available when their tenant-selected modules are active.

**What it covers.**

- **MPD funnel** on the shared enrollment object (preset: Never Contacted →
  Ask in Future → Contact for Appointment → Appointment Scheduled → Call for
  Decision → Partner-Financial/Special/Prayer) with the **terminal/
  suppression tail** (Not Interested, Unresponsive, Never Ask, Research
  Abandoned, Expired Referral) — Never Ask wired into the consent gate.
- **Optional commitment tracking vs goal**: when a tenant uses commitments or
  goals, preserve multiple concurrent commitments per
  partner (TntConnect's single-pledge limit is a known pain — beat it),
  source-authoritative Phase 16 commitment and occurrence attention states
  (frequency math, grace windows, and ambiguity rules specced precisely), and
  a distinct first-gift event. Attention belongs to the named commitment or
  occurrence; a partner or donor is never labelled “lapsed.” Multi-currency
  commitments, progress, and goals remain explicit per-currency lanes unless
  a separately governed reporting conversion exists; they are never
  collapsed into a source-authoritative cross-currency scalar.
- **Gift-event-driven automatic tasks** (the flagship differentiator,
  Inngest fan-out from Phase 6/13 events): thank first gift, thank
  special/above-commitment gift, review a named Phase 16 attention transition,
  celebrate fulfillment — idempotent and permanently semantic-deduped at every
  generated task/send. Phase 28 owns task and audience purpose; Phase 16 owns
  communication eligibility, Phase 17 owns governed content and sender
  profile, and Phase 6 owns dispatch and communication history.
- **Personal appeals + referrals**: appeals over their supporters (five-
  bucket model shared with 27); referrals as "referred by" **edges in the
  Phase 9 graph** (never a text field) with expiry timeout and source
  reporting.
- **Newsletter list management**: Physical/Email/Both/None per contact +
  invalid-address flags; clean segment exports (print partners) and
  consent-gated sends through Phases 17 and 6; **newsletter-preference seam**
  (Phase 9 Contact tab) fulfilled here; Mailchimp sync itself is Phase 32.
  Phase 28 never calls Resend or another transport directly.
- **Dashboard**: a bounded, role-safe composition that may include monthly
  support vs goal, gained/lost this week/month, a 13-month trend,
  commitments/occurrences needing attention, appeal progress, and only the
  Phase 21 modules published for the exact Support Assignment by the current
  Support Workspace Publication Profile Version and authorized for the current
  principal by Phase 12. A Support Assignment Participant Membership alone
  grants nothing. Each module requires its own current source, configuration,
  and authorization. Activity, goal, commitment, Plan, balance,
  Balance Coverage, and Reserve Position remain independent. A tenant that
  does not use commitments or publish balances sees no empty or zero-valued
  cards. When the balance family is enabled, every authorized parallel
  Finance-confirmed Field Account Balance is simultaneously discoverable,
  separately ISO-labelled, and independently through-dated; there is no
  authoritative converted aggregate or selector-only discovery. The projection
  may also show provisional support recorded since close,
  next-compensation date/status/tenant-visible amount only from the exact
  Compensation Funding Plan Version, Compensation Funding Decision, External
  Compensation Result, and External Payment Occurrence safe projection,
  optional policy-derived ministry-expense capacity, and expense/reimbursement
  progress. It consumes D3's exact assessment
  presentation—including the quiet No-Assessment state, bounded tenant-selected
  detail mode, canonical gross/assessment/support-credited values, and
  period-level components—without resolving profiles or recalculating
  assessment from gifts. Phase 28 never recomputes or relabels these facts from
  gifts, commitments, support-raising goals, or accounting records.
- **Coaching/accountability views** with **PII redaction by design**
  (coach sees weekly appointments vs target, dials, new partners, support
  gained/lost, trends — initials + amounts only; read-only, invite-based;
  weekly qualitative self-report) — redaction enforced in the Phase 3
  projection layer, not component code; targets org-configurable, not
  hard-coded to one org's methodology.
- **Goal setting**: the Phase 28 Support-Raising Goal Version owns the
  fundraising/coaching goal, MPD start/end dates, and weekly targets—the
  denominators for coaching metrics. An authorized user may explicitly create
  a new Phase 28 Goal Version from an Approved Support Plan Version with exact
  provenance. Later Plan changes produce only a compare/update suggestion;
  neither authority live-synchronizes or rewrites the other. Phase 21
  separately owns finance-closed Support Cycles, assessments, compensation
  funding coverage, and optional policy-derived ministry-expense capacity.
- **Interaction log shared with staff** (one log, permission-scoped
  visibility — the same phone call is never logged twice or lost).

**Boundaries & guardrails.** The workspace is not a second Mission Control:
it can only see/enumerate parties with an active supporter-or-referral
relationship to that missionary (Phase 9 guardrail), with approved exports
obeying donor privacy and suppression. Org-owned data stays org-owned. The
optional Phase 21 D8/Phase 31 continuity feed is an outbound, read-only
transition lane for an incumbent external tool, not middleware inside the
Asym-native workspace. Phase 28 contributes no feed resource until its
relationship/contactability purpose contract is separately ratified.

**Open questions for grooming.** Private prospect contacts (personal
network, not yet org CRM) — allowed? promotion/dedupe workflow, staff
visibility rules; coach identity (staff role vs external invite); Gmail/
calendar sync scope (MPDX parity) vs manual logging v1.

---

### Phase 29 — File Manager & Document Management (`files-documents`)

**What this phase is (plain language).** One common storage-object and access
layer for files the platform touches: CRM attachments, workflow uploads (visa
scans, reference letters), missionary resources, donor-document artifacts,
public media, expense evidence, and import files. It is not the semantic home
for every document. The owning domain retains logical identity, legal meaning,
versions/currentness, relationships, and purpose-retention policy; the storage
provider holds **bytes**, while Phase 29 owns immutable byte identity,
storage/access mechanics, malware hygiene, and access audit.

**Why it sits here.** After Phase 9 (files attach to parties — the reserved
Files socket) and Phase 3 (permissioned access); before imports (30, which
ingest files), workflows (34, file-request tasks), and member care (38,
restricted documents). Phase 18 may store exact generated artifacts here;
Phase 21 D10 requires a bounded Phase-29-compatible private receipt-byte seam
before expense evidence can ship; Phase 29 later adopts that seam into this
common lifecycle. Phase 21 may likewise adopt Compensation Handoff Package
bytes; Phase 26 supplies conversation attachments. None transfers semantic
authority.

**What it covers.**

- **One storage-object/access model**: immutable digest and byte identity,
  owner-domain and owner-record reference, kind, Phase 10 classification,
  owner-supplied retention-policy reference, storage class, and provenance;
  signed, expiring access URLs; download audit for confidential/restricted
  tiers. Domain-specific document or evidence state remains in its owner.
- **Resolve the dual-storage accident**: the repo currently runs Supabase
  Storage buckets (profiles, document-uploads, email-assets, PDF studio)
  _and_ a parallel Cloudinary signed-upload pipeline (with a duplicated
  module) with no ownership rule — this phase rules which provider owns
  what (recommendation at grooming: media-optimized public assets vs
  private documents) and documents it in the ownership matrix.
- **Folders/organization** (SiteStacker File Manager parity: nested
  folders, path-based linking), per-domain attachment surfaces (the Phase 9
  record-shell Files tab lights up), bulk operations.
- **Public media vs private documents as different classes** with different
  defaults (public assets cacheable; private docs signed-URL only,
  classification-gated).
- **Photo hygiene pipeline** (with Phase 10): EXIF/geolocation scrubbing on
  upload for worker-linked media; review gates for restricted workers.
- **Retention execution** under owner policy: care files, generated documents,
  expense evidence, and imports can have different legal lives. Phase 29
  applies holds and executes the owning domain's authorized disposition,
  feeding the Phase 6 redact-not-delete posture and future DSAR tooling (40);
  it never invents or overrides purpose retention.
- **Generated-document artifact storage** (18): Phase 18 exclusively owns the
  Logical Document, immutable Generated Document Versions, current canonical
  accessible PDF, purpose-retention version, and evidence-only revision
  history. Phase 29 stores and serves exact immutable bytes. It cannot retitle
  or replace semantic identity, mark a version current, expose prior revisions
  as donor choices, or choose their disposal.
- **Expense-evidence byte lifecycle** (21): Phase 29 supplies the private
  storage, access, malware-hygiene, retention, and deletion mechanics for
  receipt images and other expense evidence. Phase 21 owns the expense
  evidence's business meaning, immutable Receipt Evidence Asset identity,
  exact Claim Version/item coverage links, qualification,
  approval/correction state, and accounting-ready coverage. The D10
  predecessor seam and Phase 29 lifecycle use the same opaque byte identity;
  adoption is not a file rewrite. Moving or deleting bytes cannot silently
  rewrite that source truth.
- **Expense-collaboration evidence retrieval** (21): D24 reuses the same
  private-byte lifecycle; it does not create a helper file store. Phase 21 owns
  the exact claim/item/split/evidence collaboration scope, Evidence Access
  Projection Version, current purpose authorization, assignment lifecycle, and
  action provenance. Phase 29 owns immutable byte identity, private storage,
  malware hygiene, retention, hold, quarantine, disposition, access audit, and
  short-lived requester-authorized delivery. Retrieval must be non-public and
  non-cacheable, and reusable bearer URLs are forbidden. Revocation blocks
  future retrieval without claiming that bytes already delivered can be
  recalled; storage movement or deletion cannot create, expand, or rewrite
  D24 assignment, consent, approval, submission, payment, Field Account, or
  accounting truth.
- **Expense-resolution evidence boundary** (21): D25 reuses the exact D10
  Receipt Evidence identity and D24/Phase 12 current-access contract; it creates
  no file store, duplicate evidence asset, or new byte family. Phase 29 owns
  immutable bytes, scan, private retrieval, access audit, retention, hold,
  quarantine, and authorized disposition. D25 owns only typed evidence
  references and source-attributed coordination. Storage movement, deletion,
  quarantine, or access failure cannot supply a claimant response, prove
  evidence unavailable or sufficient, resolve a case, satisfy a downstream
  disposition, or trigger a financial correction.
- **Phase 21 records-package byte lifecycle** (21): D26 owns its six closed
  record-family meanings, Records Schedule Contract and Binding Versions,
  per-record Retention Resolutions, successor-impact coverage, package schema
  and selected content, Coverage Manifest, representation labels, and business
  completeness. Phase 29 alone owns immutable private package bytes, encrypted
  staging, scan/quarantine, copy inventory, authenticated streaming and access
  audit, short package-byte expiry, owner-authorized hold/disposition
  execution, provider-copy outcomes, backup treatment, and restore suppression.
  A download, print, Tenant External Copy Assertion, or expired staging copy
  cannot make Phase 29 infer completeness, legal sufficiency, verified
  destination custody, source retention, hold release, or source disposal.
- **Prospective-expense-evidence byte lifecycle** (21): D22 quotes,
  itineraries, estimates, budgets, and other plan evidence use a separate
  Phase 21 semantic identity from D10 Receipt Evidence. Phase 29 owns immutable
  byte identity, private storage/retrieval, malware hygiene, access audit,
  retention, hold, quarantine, and disposition; Phase 21 owns meaning,
  request-version coverage, classification purpose, and decision lineage.
  Bytes cannot become a claim, receipt, approval, reservation, reimbursement,
  payment, or accounting fact. Evidence-bearing D22 activation waits for the
  certified private-byte seam; an attachment-free manual plan path remains
  complete wherever the tenant's winning policy permits it.
- **Travel-route and location-evidence byte lifecycle** (21): route files,
  optional GPS artifacts, odometer images, map-provider evidence, destinations,
  and similar D18 travel inputs are separately purpose-labelled expense evidence,
  not generic attachments. Phase 29 owns private byte identity, malware/file
  hygiene, short-lived purpose-bound retrieval, access audit, tenant-visible
  retention, holds, quarantine, and disposition. Phase 21 owns their evidence
  meaning, exact claim/item coverage, qualification, calculation lineage, and
  retention purpose; Phase 10 supplies the strictest worker/location
  classification and egress floor. A manual evidence path remains available,
  and no broad export, support view, ordinary approved artifact, or accounting
  package receives raw route/GPS content by default.
- **Travel cumulative-admission evidence byte lifecycle** (21): any D28
  predecessor export, attestation support, associated-scope proof, or continuing-
  completeness feed artifact remains private purpose-labelled calculation-
  admission evidence. Phase 29 owns immutable byte identity, malware/file
  hygiene, short-lived authorized retrieval, access audit, retention, hold,
  quarantine, and disposition. Phase 21 owns the Opening Cumulative State,
  Capacity Key Contract, evidence class, pool/group meaning, Admission Manifest,
  first-use authority, correction, and containment. A file, digest, upload,
  restore, or storage result cannot prove zero or completeness, admit native
  calculation, create a historical claim, or establish downstream financial
  truth.
- **Compensation-handoff byte lifecycle** (21): Phase 29 stores and serves the
  exact immutable artifact bytes, enforces private access and access audit, and
  executes disposition under Phase 21's retention purpose. Phase 21 retains
  Compensation Handoff Package semantic identity, schema, content digest,
  source coverage, currentness, provider-operation lineage, and retention
  authority. Moving or disposing bytes cannot turn a decision into payroll,
  payment, or accounting truth.
- **Organization-card activity file lifecycle** (21): Phase 29 supplies private
  byte storage, malware and sensitive-card-data hygiene, short-lived authorized
  access, access audit, retention, hold, quarantine, and disposition mechanics
  for Organization Card Activity File Assets. Phase 21 owns their purpose,
  immutable identity, Organization Card Source and Import Profile relationship,
  manifest linkage, parser provenance, transaction meaning, and retention
  reference. Moving, quarantining, or disposing bytes cannot rewrite accepted
  transaction evidence, assignments, coverage, corrections, claims, approval,
  payment, accounting, or reconciliation truth.
- **Field Account opening-evidence byte lifecycle** (21): Phase 29 supplies
  private byte storage, content identity, malware/file hygiene, short-lived
  authorized retrieval, access audit, retention, hold, quarantine, and
  disposition mechanics for artifacts in a Phase 21 D17 Opening Source Package.
  Phase 21 owns source precedence, package and manifest identity, source-fact
  dispositions, exact-history qualification, cohort reconciliation,
  conservation, activation, corrections, evidence-purpose retention, and what
  remains structurally inert reference history. Moving, restoring,
  quarantining, or disposing bytes cannot activate Field Accounts, alter an
  Opening Position, make reference history authoritative, replay side effects,
  or create accounting truth. Opening evidence is never public storage.

**Boundaries & guardrails.** Storage providers hold bytes only. Phase 29 owns
generic storage-object metadata, signed access, and access audit; the source
domain owns business meaning, versions/currentness, relationships,
authorization purpose, legal status, and retention policy. No direct-to-bucket
access from clients outside the signed flow, and filenames/folders never
define domain truth.

**Open questions for grooming.** Virus/malware scanning (provider-native vs
service); upload size/type policy per surface; whether missionary resources
(org → field distribution) ship here or with 28; CDN posture for public
media.

---

### Phase 30 — Imports & Migration Tools (`imports-migration`)

**What this phase is (plain language).** Every prospective tenant arrives
with a legacy database — usually SiteStacker. This phase is the embedded
migration product: upload a file, get guided column mapping, see per-row
validation in a fixable grid, **dry-run** the whole import, review
fuzzy-duplicate matches with confidence tiers, commit in the background, and
undo only work that remains safely reversible. Because there are no production
users, this tool is also the **demo-seed pipeline** — dogfooded from day one.

**Why it sits here.** Target schemas must exist first: parties (9), ledger
(13), custom fields (11 — SiteStacker parity even auto-generates import
templates from the field catalog), files (29), identity/merge (4).

**What it covers.**

- **Import wizard** to the 2026 embedded-importer bar (Flatfile/OneSchema/
  Dromo): CSV/XLSX upload, deterministic mapping suggestions with
  tenant-confirmed remembered mappings, template generation from the live
  field catalog, in-grid validation with bulk fix-up, annotated error
  downloads. A later AI enhancement must use Phase 40's suggestion ledger,
  classification, evidence, and human-commit contract; imported PII never
  leaves its governed boundary merely to improve mapping. Build-vs-embed is
  decided at grooming.
- **Dry-run/preview**: exactly what would be created/updated/skipped/merged,
  per-row detail, before anything commits.
- **Dedupe everywhere, consistently**: matching rules (exact/fuzzy per
  field) separated from duplicate actions (block/warn/queue); a
  match-confidence review queue (auto-merge high band only, human review
  middle band) — the **same rules firing across UI entry, API writes, and
  bulk import** (Salesforce's Data-Loader-bypasses-rules inconsistency is
  the named anti-pattern), reusing the Phase 4 merge contract and Phase 9
  duplicate surfaces.
- **Stable external/source IDs** on all importable records: re-import
  updates instead of duplicating; cross-system reconciliation. Every imported
  financial root also pins exact Tenant, Legal Entity, currency, source
  system, and stable external ID. None is inferred from Site, provider, or a
  default entity.
- **Provenance + rollback**: every import batch tagged on created/updated
  records; time-boxed batch undo with before-image capture only while no
  immutable downstream coverage exists. If an issued document, fulfillment
  application, Field Account entry, Accounting Release, provider operation,
  or external transfer covers a fact, undo is blocked and the owning domain's
  append-only successor/correction path applies, including Phase 20
  compensation where applicable. The undo-after-merge hazard (Planning Center
  documents it deleting real people) is explicitly blocked.
- **Background processing** via Inngest: chunked, progress-reported,
  row-level failure isolation, resumable; **batch-origin event suppression**
  (an import must not fan out ten thousand automation emails).
- **Owner-domain import adapters**: parties, relationships, historic gifts,
  commitments, custom fields/entities, files, and content activate only after
  the target phase and its typed import command exist; Phase 30 never defines
  a target domain's schema or bypasses its invariants. Source-authoritative
  Field Account opening/history and expense records, if supported, enter only
  through owner-domain commands. For Phase 21 D17, Phase 29 owns private byte
  identity, storage/access, malware hygiene, and access audit. Phase 30 owns
  import-session/upload UX and transport, replaceable parsing, mapping
  mechanics, chunked resumable staging, and review mechanics only. Phase 21
  owns source precedence and mapping admissibility, the complete Tenant × Legal Entity ×
  ISO-currency cohort, exact-history certification, five-way coverage
  disposition, residual Opening Position, conservation, independently live
  coverage carry-forward, first-close predecessor cursor, manifest,
  activation, and correction. General fuzzy matching or auto-merge is forbidden
  for Phase 21 D17 financial identity. A Phase 30 import `commit`, `complete`, or `undo`
  state never implies Field Account activation, and imported exact or reference
  history remains side-effect-dark. An import never writes a balance scalar or
  replays historic Accounting Releases into QBO/Xero. Adoption of prior
  accounting history obeys Phase 20 D17's
  source-family-specific Posting Ownership Cutover: exact half-open ownership
  intervals, a source-complete coverage manifest, preserved previous-owner
  evidence, and optional gap-only backfill for proved-unposted work—never
  dual-write, fuzzy adoption, or whole-backlog replay. Phase 20 and Phase 21
  boundaries remain independently authoritative even when intentionally
  aligned.
- **D28 cumulative-travel adoption remains owner-controlled**: Phase 30 may
  provide a downloadable opaque-ID template, private upload session, parsing,
  mapping, chunked resumable staging, row validation, and correction-file
  mechanics for a large opening census. Phase 21 alone defines qualifying
  quantity, source period/unit/pool/group semantics, evidence class, opening and
  continuity dispositions, complete Admission Manifest, first-use CAS,
  correction, and external fallback. A Phase 30 dry run, commit, complete, or
  undo state cannot prove opening zero or prospective completeness, activate
  native D18 calculation, fabricate predecessor claims, or alter an admitted
  cumulative pool.
- **Operational source ingestion remains owner-domain work**: recurring intake
  of one operational source artifact under a fixed, certified source contract—
  including Phase 21 organization-card activity under D14—is owned by that
  source domain, not by this general migration workbench. Phase 30 may not
  reinterpret, heuristically deduplicate, destructively undo, replay, or bypass
  Phase 21 card evidence, manifest, assignment, coverage, correction, or
  approval invariants.
- **The SiteStacker migration kit as a named deliverable**: field-catalog
  bootstrap from a SiteStacker entity export, mapping presets for its basic
  CRM fields, donations/pledges/relationship import order, and
  **reconciliation reports** with record counts and Legal-Entity-partitioned,
  per-currency control totals proving migration fidelity. Unlike currencies
  are never summed into one “dollar total.” Migration friction is
  SiteStacker's moat; this is the battering ram.

**Boundaries & guardrails.** Imports write through each owning domain's typed
service (authorization, validation, consent, dedupe, classification,
idempotency, and audit) — never raw table loads. Historic-giving imports never
mint receipts for pre-platform gifts. The Phase 21 D8 outbound continuity feed
and every Phase 31 resnapshot/reset are not imports or migrations. A resnapshot
rebuilds only the recipient-scoped export projection and delivery cursor from
current source-authoritative versions; it never writes Phase 14, 16, 21, or 28
truth, destructively merges records, or erases or claims deletion of
provider-owned work.

Phase 21 D26 outbound records archives, offboarding retrieval, browser
downloads, and custody delivery are not imports or migration transport. Phase
30 may provide no outbound destination adapter, package staging, transfer
claim, or disposition authority; any optional certified external destination
uses Phase 31 while Phase 29 retains byte custody and Phase 21 retains package
meaning.

**Open questions for grooming.** Importer build-vs-embed; the reversible undo
window for otherwise eligible work; whether historic gifts live in the main
ledger with a source flag or a linked historic store (reports/progress bars
must include them either way — decide with 13/33).

---

### Phase 31 — Platform API, Webhooks & Connector Framework (`platform-api`)

**What this phase is (plain language).** The governed way for the outside
world to talk to Asym: a versioned public REST API, signed webhooks, scoped
tokens, and a per-tenant connector registry — **one integration spine**
built before provider-specific syncs multiply into one-off code.
SiteStacker ships a versioned API + webhooks (and its dead developer-docs
site is a cautionary tale — ours live in-repo and published).

**Why it sits here.** Needs the foundations (1/3/4/6), Phase 10
classification, and Phase 12's central capability model; its useful payload
grows with 9 + 13. It precedes Mailchimp (32) so the first real connector
rides the framework instead of defining it ad hoc.

**What it covers.**

- **Versioned REST API**: date-pinned versions per tenant/token (the Stripe
  model — additive changes safe, per-request override header, isolated
  downgrade transforms), OpenAPI spec + generated docs from day one,
  published deprecation policy.
- **AuthN/Z**: OAuth2 client-credentials for org integrations +
  fine-grained expiring PATs (GitHub model: resource- and
  permission-scoped, last-used tracking, org policy controls); everything
  resolves through the same Phase 12 capability evaluator used by first-party
  surfaces rather than a parallel access model, then through Phase 3
  projections — **external consumers get governed projections and events,
  never raw tables**; Phase 10 classification is enforced in serialization.
- **Rate limiting**: per-tenant and per-token token buckets, 429 +
  Retry-After + limit headers, separate read/write buckets.
- **Webhooks to the Standard Webhooks spec**: HMAC-SHA256 signing
  (id.timestamp.payload), replay windows, ~8-attempt exponential backoff,
  per-endpoint event-type filtering, auto-disable on sustained failure,
  delivery logs + manual replay, secret rotation. (Svix-hosted vs
  Inngest-backed delivery decided at grooming.)
- **Event contract registry**: typed, versioned, thin-to-medium payloads in
  a consistent envelope (CloudEvents-style id/source/type/time), published
  catalog with compatibility guarantees.
- **Connector registry** in Mission Control: installed integrations per
  tenant, provider links (generalizing `crm_record_links` — this phase
  co-owns the Phase 9 External-IDs socket with imports), granted scopes,
  connection health, last sync/delivery status, enable/disable, full audit.
  Embedded-iPaaS primitives (Nango-style managed OAuth) evaluated
  build-vs-buy.
- **API/audit trail** queryable by tenant admins; sensitive-field access
  flagged.
- **First concrete feed consumer**: Phase 21 D8's recipient-scoped Missionary
  Support Feed Projection. Phase 21 owns the Missionary Support Activity and
  Support Balances source projections plus their finance-safe external field
  floor; Phase 14 and Phase 16 retain supporter and commitment truth; Phase 28
  contributes relationship/contactability only after a separate ratified
  purpose contract. The feed subject is one exact Support Assignment, not a
  Party participant, household, relationship, or access grant. Phase 31 owns
  the recipient-scoped composite, complete
  scoped snapshot, monotonic change cursor, reset/resnapshot protocol, signed
  reconciliation hints where certified, provider mappings, and delivery
  evidence. Later candidates include read-only Phase 20 accounting evidence
  where explicitly authorized and church-management syncs. Phase 20 remains
  the only Stripe/QBO/Xero authorization, delivery, and recovery doorway;
  Phase 31 must not generalize that provider-specific financial authority into
  a second connector. Financial projections carry explicit Legal Entity,
  currency, source, and as-of semantics and never expose provider credentials.
- **Optional D26 records destination**: only after D26's complete browser lane
  exists, Phase 31 may certify a tenant-owned storage destination using
  provider-native authorization, exact destination identity, least privilege,
  package-manifest write and readback, integrity, ambiguity-safe retry, drift,
  revocation, residency, preserved holds/restrictions, and exit behavior.
  Phase 21 owns package and custody semantics; Phase 29 owns staged bytes;
  Phase 31 owns connection and transport evidence. There is no launch-time
  Drive/Dropbox/Box/SharePoint/S3/SFTP marketplace, raw-key flow, or claim that
  upload acceptance proves durable custody.

**Boundaries & guardrails.** Connectors cannot bypass permissions or
source-of-truth rules. A feed exports governed projections and stable
references; it does not create another contribution ledger, Field Account
subledger, accounting release, or final reconciliation. A reset or resnapshot
can replace only disposable Phase 31 projection/delivery state; it cannot write
an owning source, erase provider-owned records, or claim downstream deletion.
No GraphQL, no
tenant-authored server-side scripting, no third-party app marketplace —
post-parity. Don't hand-roll the importer grid, webhook delivery, and
connector OAuth simultaneously (each is a whole company's product — the
build-vs-buy triage is a grooming deliverable).

**Open questions for grooming.** Webhook delivery build-vs-buy; whether the
public API v1 is read-only with writes trailing. Phase 21 D8 is the first
concrete feed consumer; its provider activation still requires an authorized
design partner and production certification.

---

### Phase 32 — Mailchimp / Newsletter Sync with Suppression Handling (`newsletter-sync`)

**What this phase is (plain language).** Missionaries keep partner
newsletter lists in Mailchimp; this phase lets them sync **permitted**
partner contacts safely — without ever overriding an unsubscribe, leaking a
suppressed donor, or importing provider state as truth. Today the repo has
**zero Mailchimp integration** (a static settings card implies one — a
misleading placeholder to remove or wire).

**Why it sits here.** The first real outbound connector on the Phase 31
framework, exposed through the Phase 28 workspace (newsletter list
management), governed by Phase 3 export policy, Phase 6 suppression/history,
and Phase 17 message governance.

**What it covers.**

- **Permitted-audience computation**: only parties with an active
  supporter relationship to the missionary AND export-eligible under
  consent/suppression policy (never-ask, do_not_contact, bounce, complaint
  all exclude).
- **Strictest-suppression-wins, both directions**: Mailchimp unsubscribes
  land in Asym as channel-scoped suppression facts (Phase 6); Asym
  suppressions are pushed/enforced on export; a missionary can never
  override a donor unsubscribe.
- **One-way identity**: Asym never overwrites party identity from Mailchimp;
  provider links via the connector registry.
- **Sync operations UX**: per-sync results, failures, drift visibility;
  provider rate-limit handling; audience/tag mapping.
- **Provider-agnostic seam**: the Phase 6 unsubscribe landing and the
  newsletter-preference model stay provider-neutral so a second ESP (or
  native Resend newsletters) doesn't re-architect anything.

**Boundaries & guardrails.** Mailchimp is a provider, never communication or
CRM truth. For an Asym-native newsletter, Phase 28 owns audience and purpose,
Phase 17 owns governed content and sender profile, and Phase 6 owns consent,
dispatch, and communication history; Resend is transport only. Phase 32 is the
external-ESP bridge.

**Open questions for grooming.** Org-level Mailchimp accounts vs
per-missionary accounts (auth topology); whether campaign/open metrics flow
back into partner "newsletter health" (28); native-newsletter-vs-ESP
long-term posture.

---

### Phase 33 — Reporting & BI / Report Studio (`reporting-bi`)

**What this phase is (plain language).** Answers for staff: "who gave to
the Kenya project last quarter," "which church relationships need review,"
"how is monthly support trending" — as a real product: a **standard report library first**
(SiteStacker ships 20+ standard donor reports — that's the parity bar),
then a constrained custom builder, saved/scheduled report runs, and
permission-aware exports.

**Why it sits here.** After the permission, classification, and core-data
foundations exist (3/6/7/9/10/12/13). Its framework may start then; each
standard report module activates only after its source-owning phase exists
(including 15/16/19/20/21/30). Its number reflects priority relative to the
engagement surfaces, not a license to invent missing source truth.

**What it covers.**

- **Standard report library**: giving (by donor/fund/campaign/source),
  named Phase 16 commitment/occurrence health, contribution-inactivity
  segments, church/org giving, missionary support progress, Field Account
  activity/balances by explicit currency, expense operations, batch/deposit,
  Accounting Release evidence, and statement runs — each permission-aware and
  exportable; enumerated against SiteStacker's catalog at grooming. Reports do
  not turn an attention state into a person-level “lapsed” label.
- **Semantic layer** (the architecture keystone): metrics, dimensions,
  joins, and access rules defined once, tenant + role security compiled
  into every emitted query (the Cube-core pattern; build-vs-adopt at
  grooming) — dashboards, scheduled runs, exports, **and any future AI
  (40)** consume the same governed definitions. Embedded per-seat BI
  (Metabase-class) is ruled out by economics for donor-scale viewers;
  the UI is ours (shadcn + TanStack Table over the semantic layer).
- **Custom report builder** (second): constrained field pickers over the
  semantic layer, custom fields included (11), saved reports with
  visibility scoping (reusing the Phase 9 saved-view machinery).
- **Scheduled reports**: Phase 33 owns the schedule, report snapshot, recipient
  eligibility, and purpose; Phase 17 owns and prepares the governed message,
  while Phase 6 dispatches and records it with Resend as transport only.
  **Permissions are
  evaluated per recipient at generation time** (QuickSight pattern), with
  delivery history.
- **Report permissions as their own model** (create vs save vs schedule vs
  send — the Salesforce lesson), on Phase 12 capabilities.
- **Read models**: reconciled, documented read models/rollups where live
  OLTP queries can't serve (decided per report; no shadow warehouse in v1).

**Boundaries & guardrails.** Reports read source truth + approved read
models; they never own records. Exports obey Phase 3 + Phase 10 policy
(classification-aware columns). Comparisons must state the exact source,
version, Legal Entity, recognition/posting basis, currency, and as-of time;
contribution, Field Account, processor-payout, Bank Match, and Accounting
Release values are not blended into one authoritative total. Numbers must
agree with finance surfaces (19/20/21) when comparing like-for-like facts,
but Phase 33 never becomes final bank or QBO/Xero reconciliation.

A Phase 33 report export is a current governed analytical projection, not a
Phase 21 D26 Records Export Package, records-retention artifact, offboarding
archive, or custody transfer. Report filters and scheduled runs never define
archival completeness, source-family watermarks, original-byte coverage,
retention, hold, or disposition.

**Open questions for grooming.** Semantic-layer build-vs-adopt (Cube Core
vs in-house definitions); which rollups are materialized vs live;
donor/missionary-facing report surfaces (portal impact views ride the same
layer?); analytics-scale story if a tenant outgrows OLTP.

---

### Phase 34 — Configurable Automation & Workflow Engine (`workflow-engine`)

**What this phase is (plain language).** SiteStacker **Motion 2** parity —
the staff-configurable process builder that runs mobilization: an applicant
applies, forms are filled, references are requested, a coach is assigned,
files are collected, stages complete, and everyone sees their dashboard. A
workflow is a hierarchy of **stages (landmarks), tasks, and triggers**
assigned to **roles**; each run is an **engagement**. Notably, WMTek
recommends clients _pay hourly consultants_ to build their first Motion
workflow — true self-service configurability is the parity-plus opening.

**Why it sits here.** After the primitives it composes: parties (9), custom
fields (11), permissions (12), files (29), templates (17), comms (6).
Events (37) deliberately come after, so trips/registrations reuse this
engine instead of growing a second one.

**What it covers.**

- **Workflow truth in Asym Postgres, Inngest as pure execution** (the
  Inngest Workflow-Kit pattern the shipped runtime already embodies):
  versioned workflow _definitions_ (in-flight runs keep their version) and
  _runs/engagements_ as tenant data; the engine is a state-machine
  interpreter over a fixed catalog of coded actions. The existing runtime —
  tenant-scoped event envelope with sensitive-key rejection, durable
  dispatch ledger, recovery scans, notification policy, staff console — is
  the execution substrate, already classified durable.
- **Motion-parity building blocks**: nestable stages; task types (Form,
  File Request → Phase 29, Message → Phase 17, Note → party notes,
  Relationship task → Phase 9 edges, e.g. assign-a-coach); triggers on task
  completed/assigned/due, stage completion, specific form answers, and
  delays (relative or form-date-derived); actions including assign task,
  send message, dashboard notification, redirect (incl. to checkout),
  engagement-status change, record-type/group/relationship changes.
- **Primary roles** (participants — optionally with a paid registration
  fee via the ledger) and **secondary roles** (staff bound via CRM
  relationships — a coach receives their applicant's tasks); per-role
  dashboards as product surfaces (not hand-built pages); engagement
  statuses (Active/On-hold/Discontinued/Complete).
- **Form builder**: JSON-schema-as-data (SurveyJS/Form.io convergence) with
  conditional logic, multi-page, partial save/resume, calculated fields —
  writing only through governed domain APIs; **tokenized external-
  participant links** (references complete a questionnaire with no
  account — pre-login token infrastructure).
- **Donor-journey automation** on the same trigger+condition+action
  vocabulary (query/segment enrollment, Virtuous-style; programmatic
  contribution-inactivity definitions from settled ledger facts, never a
  person-, Party-, commitment-, or recurring-line `lapsed` state),
  consolidating the existing
  `mission-control-automations` foundation (rule schema/compiler/evaluator
  already in the repo) and Support Hub's `support_automation_rules` into
  **one** rules vocabulary — three parallel engines is the named failure
  mode.
- **Enrollment governance** (HubSpot lessons): loop prevention by default,
  one active enrollment per record per workflow, explicit re-enrollment,
  **simulation/test mode** before activation; flowchart-first authoring UX
  encoded in the product (SiteStacker leaves it to consultants).
- **Mobilization as the flagship use case**: applicant pipelines,
  references, coaching — the missions org's core process.

**Boundaries & guardrails.** Inngest never owns process truth. Forms write
through product services with permission checks. Workflow messages are
consent-gated templates (17). Applicant/care-sensitive workflows respect
Phase 10 classification. A workflow may request a permitted Phase 21 command
through the domain service and observe its result; it cannot write Field
Account entries, approve expense truth, generate an Accounting Release, or
mutate provider-delivery state directly.

D25 ships complete without Phase 34. A later workflow may subscribe to an exact
D25 occurrence, mirror a follow-up task, and invoke only an already permitted
typed D25 or source-owner command through the authoritative service. It cannot
add causes, actions, states, SLAs, financial meanings, select a reviewer, author
claimant facts, resolve a case, satisfy a Downstream Impact Manifest, or mutate
any owner-domain truth. Timer or task completion is never case completion.

D26 also ships complete without Phase 34. A later workflow may mirror a
records-review or offboarding reminder and invoke only an independently
authorized typed Phase 21 or Phase 29 command. It cannot decide legal
applicability, author or weaken a schedule, release a hold, dispose a copy,
mark export coverage complete, record a tenant assertion as another actor, or
verify destination custody. Timer, task, or workflow completion supplies none
of those facts.

**Open questions for grooming.** Definition-versioning UX for staff;
per-role dashboard composition surface; whether Support Hub rules migrate
onto this engine or stay scoped; background-check/e-sign integrations
(Checkr/SignNow-class) — connector seams via 31.

---

### Phase 35 — Spark-Style Contribution Triggers (`contribution-triggers`)

**What this phase is (plain language).** Gift-driven automation: first-time
gift → welcome series; large gift → notify the rep; contribution inactivity →
an appropriately consented re-engagement path. SiteStacker calls this Spark.
It is a **trigger catalog on top of the Phase 34 engine**. Contribution
triggers react to _settled contribution facts_ only, never raw Stripe events.
Any recurring-failure or recurring-health action consumes an explicit typed
Phase 16 occurrence/health transition; it never infers one from an absent gift
and never owns payment retry, dunning, or a duplicate recovery sequence.

**Why it sits here.** Firm, locked: the engine (34) precedes it. Also needs
the ledger (13) and comms (6).

**What it covers.**

- **Contribution event conditions** (the Spark condition set, rebuilt on
  our facts): first-time gift (global/per-campaign), amount ranges,
  online/offline entry method, anonymous, recurring first/last occurrence,
  schedule-modified, soft credit, tribute, source code, site/channel,
  affiliated person.
- **Actions**: enroll in workflow/journey, send templated message
  (consent-gated), create task (rep/missionary), change record
  type/tags, dashboard notification. A send prompted by a Phase 16 transition
  must use Phase 16's recorded domain-transition meaning and purpose-specific recipient projection, the Phase 6 dispatch spine,
  Phase 17 content, and the same permanent semantic dedupe key; Phase 35 cannot
  create a second message for the same meaning.
- **Timing modes**: immediate (event-fired) and scheduled/batch (cron-
  evaluated conditions like "no settled gift in N months"), as distinct
  evaluation modes (CiviRules pattern). That condition is explicitly
  **contribution inactivity**, not a person-, Party-, pledge-, or recurring-
  line `lapsed` state, and it cannot override Phase 16's multi-axis health.
- **Idempotency everywhere**: settled-fact triggers with dedupe keys;
  refund/adjustment compensations never re-fire welcome journeys.
- **Trigger observability**: per-rule fire history, dry-run against
  historical data, kill switch.

**Boundaries & guardrails.** Contribution rules fire from settled contribution
facts only. Recurring-state rules may consume only named Phase 16 transitions
and remain downstream of Phase 16 recovery and communication-eligibility
policy. Every send crosses the Phase 6 consent/dispatch gate and the permanent
semantic-dedupe fence; no Phase 35 rule schedules a provider retry or duplicates
a Phase 16 state-change notice. The open question from the matrix (thin catalog
vs distinct surface) is resolved **at Phase 34 grooming** and recorded here.

---

### Phase 36 — Peer-to-Peer & Advocacy Campaigns (`p2p-campaigns`)

**What this phase is (plain language).** Supporters become fundraisers: a
donor creates a personal page ("my birthday for the Kenya well"), teams
rally around goals, leaderboards and thermometers drive momentum — while
staff keep moderation, financial truth, and attribution. The **same engine
powers trip-participant fundraising in Phase 37** — one P2P core (campaign
→ team → personal page → attributed ledger lines), built once.

**Why it sits here.** After public runtime (5), the ledger (13), donor
portal (25 — "My Campaigns"), and public pages (22).

**What it covers.**

- **Fundraiser page lifecycle**: donor-created from a parent campaign,
  org-defined default content, edit permissions and optional
  edit-approval, admin edit/deactivate (ServiceReef-style moderation
  controls).
- **Teams**: captains, team goals rolling up member pages, join via
  invite/link. Every campaign/team/page goal uses one explicit reporting
  currency and Legal Entity scope; a labelled Phase 33 reporting conversion
  may compare lanes but never becomes contribution truth.
- **Attribution**: unique share links auto-crediting gifts to the
  fundraiser (as influence/soft credit — 14), plus **admin repair tooling**
  for unattributed/misattributed gifts (a documented operational pain
  across P2P platforms); source codes survive checkout (13). Repair tooling
  invokes Phase 14's append-only credit/attribution correction command and
  never edits a posted gift, designation, or source-code fact in place.
- **Gamification**: thermometers, countdowns, individual/team leaderboards,
  milestones, partitioned by the campaign reporting currency rather than
  silently summing unlike currencies.
- **Fee handling consumes existing authorities**: the donor-facing fee-cover
  choice and gross gift remain Phase 13 truth; exact processor cost,
  organization-absorbed default, and optional designation-borne uncovered-cost
  effect follow Phase 20 D19. Phase 36 may present those approved choices but
  cannot create another fee formula, net a gift in place, or infer a Field
  Account effect.
- Donor-portal "My Campaigns" management (25 socket).

**Boundaries & guardrails.** Donor-created pages are moderated projections;
contribution truth stays in the ledger; fundraiser pages for restricted
workers inherit Phase 10 publication rules.

**Open questions for grooming.** Fundraiser page creation open to all
donors vs invited; personal-page media moderation depth; offline gifts
credited to a fundraiser's total.

---

### Phase 37 — Event / Opportunity Workflows & Group Management (`events-groups`)

**What this phase is (plain language).** The **mobilization** product:
short-term trips, trainings, retreats, and recurring local-serving
opportunities — published as opportunities, applied to through workflow
pipelines, staffed as team rosters with capacity and deadlines, funded
through the ledger, documented (passports/waivers), and communicated with
as groups. Purpose-built tools (ManagedMissions, ServiceReef) converge on
exactly this shape; SiteStacker ships events/opportunities as dynamic
content + workflow-driven applicant management, so this is required parity.

**Why it sits here.** Deliberately **after the workflow engine (34)** —
applications, references, approvals, and document collection _are_
workflows; building an Event Hub earlier would create a duplicate process
engine. Also needs public runtime (5), parties (9), ledger (13), comms (6),
files (29).

**What it covers.**

- **Opportunity model** spanning the serving spectrum: one-day events,
  recurring local roles, trainings, multi-week trips; publishable via
  Phase 23 dynamic lists; auto open/close by date; capacity (max/remaining)
  first-class; fund/designation mapping per opportunity (GL stays clean —
  20).
- **Application pipelines on Phase 34**: reusable form/question libraries,
  reference requests (tokenized external forms), background-check/e-sign
  integration seams, approval stages, per-role dashboards.
- **Trip money, two distinct types** (the domain's critical nuance):
  **non-deductible participant payments** (deposits, installments with due
  dates + reminders, application fees; refundable per policy) vs
  **deductible third-party donations** to org-controlled trip funds
  soft-credited to the participant — separate Phase 13 contribution objects.
  Phase 7 owns receipt eligibility/legal facts; Phase 14 owns recognition and
  acknowledgment purpose/audience facts; Phase 17 owns governed message
  content; Phase 18 owns any canonical document artifact; and Phase 6 owns
  dispatch/history. Phase 22/23 presentation consumes those approved
  source-owned fields and cannot decide deductibility. Each payment or
  donation pins the exact Legal Entity, designation/payment purpose, and
  currency before confirmation; mixed-entity or mixed-currency carts use
  explicit donor-confirmed Phase 13 groups rather than inferring ownership
  from a trip or Site.
- **Per-participant fundraising** via the Phase 36 P2P engine
  (registration-with-fundraising hybrids: pay, raise-by-date commitment, or
  both; donate buttons auto-disappear after deadline; over-fundraising
  policy).
- **Rosters & groups**: team rosters, leaders, capacity; **the Phase 9
  groups ruling lands here** — `party_kind='group'` reserved value +
  ONE shared `group_memberships` table (D3 R3), covering teams, regions,
  and event participation; participant dashboards (per-currency payment and
  fundraising progress, schedule, documents due). Any converted comparison is
  visibly labelled Phase 33 reporting, not source truth.
- **Document collection** (29): passports, waivers, insurance — collected
  via workflow file-request tasks, tracked per participant, classification-
  aware (identity docs are confidential-tier).
- **Group communication**: Phase 37 owns the audience and purpose, Phase 17
  owns governed content and sender profile, and Phase 6 owns dispatch and
  communication history for whole-team or individual messages.
- **Trip-expense handoff without a side ledger**: Phase 37 owns opportunity,
  trip, participant, budget-context, and cost-allocation intent. Phase 21 owns
  expense capture, evidence, approval, reimbursement/payment coverage, and
  any Field Account effect; Phase 20 alone owns the accounting-ready handoff
  and QBO/Xero delivery.

**Boundaries & guardrails.** Event payments use the contribution ledger —
never a side money path. Event workflows use the Phase 34 engine — never a
bespoke pipeline. Trip budgets and expense summaries are operational context,
not another Field Account or general ledger. Restricted-country trips inherit
Phase 10 rules (public opportunity pages for sensitive destinations use
generalized geography).

**Open questions for grooming.** Volunteer management depth (background-
check policy per tenant); recurring local-serving roles v1 or fast-follow;
launch depth for leader-entered trip budgets and the Phase 21 command surface;
registrant-becomes-party dedupe flow.

---

### Phase 38 — Member Care, Crisis & Restricted-Ministry Operations (`member-care-ops`)

**What this phase is (plain language).** The confidential care product on
the Phase 10 rails: member-care staff manage counseling/health/crisis
records that even org admins cannot read by default; care teams are
assigned per worker; crisis events (evacuation, detention, medical) run
with break-glass access and post-incident review; restricted-ministry
operating rules (publication delays, content review) get their operations
UI. This is the **most sensitive data in the entire platform** — clinical-
grade boundaries, or counselors won't use it and the org's GDPR Art. 9
posture collapses.

**Why it sits here.** On the Phase 10 foundation (classification, named
grants, read audit, break-glass primitive), with parties (9), permissions
(3, deepened by 12), and files (29); comms (6), Support Hub (26), and
workflows (34) enrich it.

**What it covers.**

- **Confidential case module**: care records sealed by default
  (named-participant grants — the Salesforce Compliant-Data-Sharing
  analog); care notes are **never** ordinary CRM notes; per-case
  participant lists with roles.
- **Provider-type modeling** (licensed counselor vs lay carer) and
  **limits-of-confidentiality acknowledgment** captured at intake (both
  parties know reporting limits before care starts); duty-to-warn/
  mandatory-report escalation paths — explicit, acknowledged, audited.
- **Crisis operations**: contingency plans and proof-of-life data as
  Restricted-tier documents (29); emergency contact trees; **break-glass
  activation UI** (mandatory justification, real-time alert, post-incident
  access review queue); crisis event logging and after-action records.
- **Care-team assignment** (staff-assignment edges, role-qualified) and
  care caseload views; care-sensitive indicators surfaced to general staff
  only as the Phase 10-approved summary chip (structural member-care
  exclusion from Phase 9 general surfaces carries through).
- **Candidate-screening data** (psychological assessments from
  mobilization workflows, 34/37) landing as Restricted with its own
  retention schedule.
- **Compliance evidence surfaces**: per-tier retention/deletion enforcement
  reports, appropriate-policy-document support (ICO), DSAR/erasure tooling
  that correctly excludes data whose disclosure endangers third parties.
- **Audit of the audit**: sensitive-read logs are themselves confidential
  (who is in counseling is confidential) with their own tier and retention.

**Boundaries & guardrails.** Care truth is not general CRM. Leadership
cannot silently unseal counselor notes (the trust-failure mode); whatever
unseal authority exists is explicit, disclosed at intake, and audited.
Cross-tenant sharing of restricted worker data: export-with-consent only.
Care notes, case membership, crisis details, and sensitive-read history never
enter a Phase 21 Approved Expense Snapshot, Phase 20 Accounting-Ready Expense
Handoff, Accounting Release, provider artifact, or QBO/Xero payload. Expense
operations may carry only the minimum approved business-purpose evidence
allowed by the Phase 10 egress policy.

A D26 tenant business-record archive is not an individual's subject-access,
portability, correction, restriction, or erasure response. Phase 38 privacy-
request authority may constrain or request owner-filtered D26 records, but it
cannot treat an unredacted tenant archive as the response or use export as
deletion or hold authority.

**Open questions for grooming.** Sealing default depth (invisible vs
visible-with-audit for org owners — tenant-configurable within a floor?);
break-glass authority configuration; retention defaults per record class;
whether care staff get a separate surface or a gated Mission Control area.

---

### Phase 39 — Mobile, Low-Bandwidth & Conflict-Safe Field Experience (`field-first-ux`)

**What this phase is (plain language).** Missionaries work from phones on
bad connections. This phase is the **field-reality hardening pass as a
product contract**: the workspace and key staff flows become genuinely
usable on mobile over slow/intermittent networks, a small named set of
field workflows (log an interaction, complete a task, draft a note) queue
offline and sync safely — and **money paths are never offline-writable**.

**Why it sits here.** Last-but-one on purpose: the 2026 consensus is that
full local-first sync (CRDTs, through-the-DB sync) is **over-engineering**
for a server-authoritative, RLS-multi-tenant CRM. The realistic sweet spot
— read-path caching + optimistic idempotency-keyed write queues for named
workflows — needs the workflows (28) and API idempotency contracts to
exist first.

**What it covers.**

- **PWA shell** (Serwist — the standard Next.js App Router toolchain):
  installable workspace, app-shell precache, runtime caching, offline
  detection.
- **Read-path resilience**: TanStack DB persistence (SQLite-WASM adapters)
  for the missionary's permitted slice (partners, tasks, commitments) —
  server-authoritative, schema-version-controlled re-sync. Before the device
  posture is certified, only non-sensitive projections may persist locally.
- **Offline write queue for a small named set** of workflows via
  `@tanstack/offline-transactions`: client-generated idempotency keys,
  exponential backoff, ordered replay for dependent ops, **visible
  pending/synced state** ($synced/$origin row metadata → WhatsApp-style
  indicators).
- **D22 offline boundary**: only a visibly device-local, non-authoritative
  Prospective Expense Plan Draft may be resumed offline after the device-
  security contract is certified. Submit, withdraw, request-information,
  review, decide, reserve, apply coverage, release, correct, and notify remain
  online, server-confirmed actions; they are never offline-queued or rendered
  optimistically as committed.
- **D25 offline boundary**: a visibly device-local response text draft may be
  retained only under the certified device contract and must remain labelled
  **Not sent**. Evidence upload/finalization, response submission, withdrawal,
  request-another-review, source correction, Resolution Occurrence, downstream
  disposition, and case completion remain online and server-confirmed. The UI
  never shows **Sent**, **Complete**, approved, paid, or financially corrected
  before authoritative commit.
- **D26 offline boundary**: package request, scope preview, manifest seal,
  authorization reproof, external-copy assertion, verified transfer, hold, and
  disposition remain online and server-confirmed. A deliberate authenticated
  download may create an external device copy that Asym cannot recall, but a
  service worker or ordinary offline cache must never silently retain archive
  bytes; offline UI cannot claim **Stored**, **Verified**, **Complete**, or
  **Transferred**.
- **Conflict policy per entity, decided up front** (TanStack DB explicitly
  does not solve conflicts): LWW-safe fields vs must-surface fields with
  human-readable choices — no silent merges.
- **Low-bandwidth budgets** as acceptance criteria (payload sizes,
  image variants, skeleton behavior) across donor/missionary/staff
  field-relevant routes.
- **Escalation ladder documented** (Electric's four tiers): if a future
  need demands true bidirectional mobile sync, PowerSync-class engines are
  the evaluated path — not an ad-hoc rebuild.

**Boundaries & guardrails.** Writes stay server-authoritative through the
existing API. Donations, receipts, batch commits, and any money mutation
are **never** offline-queued (pessimistic confirmation only). Restricted-
tier data (10/38) is never persisted to device caches. Confidential or partner
PII cannot persist until encrypted-at-rest storage and key handling,
device/session binding, logout and revocation wipe, TTL expiry, remote
invalidation, schema-migration safety, and a lost-device threat test all pass.
Failure falls back to online-only or non-sensitive cached projections, never
plaintext convenience storage.

**Open questions for grooming.** The exact named offline-write set and the
implementation selected to meet the fixed device-security contract above;
whether staff batch entry gets an offline mode (recommend no — money).

---

### Phase 40 — Data Stewardship, Global Search & AI Operator Workbench (`data-stewardship-ai`)

**What this phase is (plain language).** The capstone: help staff **find,
clean, explain, and act on** everything — governed global search across all
record types, data-quality queues as a continuous practice, and an
AI-assisted workbench where the machine _suggests_ (duplicate merges,
record summaries, next-action drafts, anomaly flags) and a **human commits
every change**. Deliberately last: AI on top of unstable truth,
permissions, or audit summarizes garbage confidently.

The generalized workbench remains deliberately last. Phase 21 D10 pulls forward
only the small shared execution foundation needed by earlier bounded features:
AI Provider Connections, write-only Credential Revisions, closed Feature
Purposes, prospective capability-certified AI Capability Binding Versions,
minimum-data Egress Manifests, immutable Invocation Evidence, and the
non-authoritative Suggestion Version contract. Phase 40 consumes and extends
that foundation; it does not create a second key store, model router, egress
ledger, or suggestion authority.

**Why it sits here.** Hard on the permission/identity floors (3/4), health
infrastructure (8), Phase 10 classification, Phase 12 capabilities, mature
truth (9/13), imports (30 — the data it stewards), and reporting (33 — the
semantic layer AI must speak through); custom fields (11) and workflows (34 —
the actions it drafts) enrich it.

**What it covers.**

- **Global search**: cross-record-type, permission-governed (Phase 3/10
  compiled into the query — restricted tiers excluded from indexing per the
  Phase 10 ruling), extending the Phase 9 Cmd-K foundation platform-wide.
- **Data-quality queues as continuous control** (not periodic cleanup):
  duplicate suggestions (prevent-at-entry + real-time detect + small
  governed merges), completeness/staleness/consistency checks, growing the
  Phase 8 data-health foundation into a product.
- **AI suggestion ledger** (the architecture keystone): every AI output is
  a _suggestion record_ with provenance (model, prompt version, inputs),
  confidence, and **evidence links back to source records**; a human commit
  creates the actual audited mutation — **AI never writes canonical truth
  directly**. Approval invokes the owning domain's existing typed command with
  fresh authorization, current-version/CAS checks, validation, idempotency,
  and append-only correction rules. A stale suggestion fails safely and must
  be re-previewed; the suggestion itself grants no authority. Suggested vs
  confirmed data is a first-class distinction.
- **Shared AI control-plane continuation**: add generalized feature purposes
  only through the D10 code-owned registry and current capability-certification
  process. Reuse Provider Connections, Credential Revisions, Binding Versions,
  Egress Manifests, Invocation Evidence, purpose budgets, health, revocation,
  and kill switches. Feature domains still own suggestion interpretation and
  acceptance commands; a Phase 40 workbench never gains generic write
  authority.
- **Tiered autonomy + review-by-exception**: conservative thresholds first;
  expand only as override rates drop (<~30%); human corrections captured as
  feedback, not discarded. Advisory-first merge (the shipped Dynamics 365
  pattern: AI pre-selects surviving values with reasoning; a click
  commits).
- **Governed AI access to numbers**: any natural-language analytics speaks
  **only through the Phase 33 semantic layer** (tenant/role security
  compiled in — cross-tenant queries impossible to construct).
- **Operator assists**: record summaries, donor briefs (27's generator,
  AI-drafted), next-action drafts, anomaly flags (giving-pattern changes) —
  all consent- and classification-aware (restricted/care data excluded from
  AI features per the Phase 10 open-question ruling, resolved by then).
- **Governance rails** (EU AI Act Art. 12 / NIST AI RMF convergence):
  append-only hash-chained audit of AI-driven decisions recording actor
  type (human/AI/system); the four-element guardrail set — permission,
  approval, audit trail, **kill switch**.

**Boundaries & guardrails.** AI suggests; an authorized human may invoke the
owning domain command. No generic AI mutation path to party, gift, document,
Field Account, or accounting truth exists—structurally, not by policy.
Care/restricted data never enters model context. AI may summarize
already-authorized finance evidence through Phase 33, but cannot approve an
expense, create or change a Field Account entry, choose a Legal Entity or
accounting destination, release or retry an Accounting Release, resolve an
ambiguous Bank Match, reconnect a provider, select a posting period, or attest
provider readback.

**Open questions for grooming.** Which capability-certified providers/models
serve the generalized Phase 40 purposes under tenant data-processing
agreements and D10 bindings; which suggestion domains ship v1 (dedupe +
summaries recommended); search infrastructure
(Postgres FTS/pg_trgm scale-up vs dedicated engine) — decided with real
data volumes.

---

## Features the roadmap must not miss (cross-phase checklist)

Compiled from the SiteStacker documentation sweep and domain research —
every item maps to a phase (the "won't build" items are explicit rulings,
not omissions). Grooming for the named phase must check its items off.

- **Recurring-gift ops toolkit** (13/16/25): expiring-card surfacing,
  provider- and policy-authorized exact-occurrence recovery, pre-charge
  reminders, staff-side prospective recurring edits, and commitment
  reconciliation — never a generic failed-payment rerun. Stripe automates
  parts (account updater, smart retries); the staff-facing views remain parity
  requirements without duplicating Phase 16 authority.
- **Historic giving** (30 + 13/33): imported legacy gifts feeding the same
  reports and progress bars without minting receipts — model decided at
  Phase 30 grooming.
- **Workflow payments** (34/37 + 13): application/registration fees inside
  workflows bridge to the ledger — named at both groomings so the coupling
  isn't missed.
- **Reference requests** (34): tokenized external forms, pre-login
  infrastructure.
- **Future text-to-give activation** (6/13/17/31): an inbound SMS keyword may
  produce a pre-filled source-coded checkout link only after provider,
  channel-scoped consent, STOP/HELP, abuse, and tenant 10DLC/toll-free
  readiness are proof-gated through the Phase 17 transport-dark reservation
  and Phase 6 history contract. It is not launch scope or a shortcut around
  SMS compliance.
- **Saved views / configurable grids everywhere** (9 → all): one shared
  platform capability (built in Phase 9), reused by contributions,
  reports, support — never rebuilt per surface.
- **Generated-document templates as a shared service** (18): receipts,
  statements, and acknowledgments use the Phase 18 canonical document
  contract. Phase 20 Accounting Delivery Packages, CSV/IIF artifacts, and
  provider-native imports remain Phase 20-owned and are not Phase 18 exports.
- **Change log / API logs** (12/31): tenant-admin-visible audit surfaces.
- **Crons/jobs visibility** (8): tenant-admin-visible scheduled-job health
  (the Inngest console generalized) with failure alerting.
- **Staff SSO (SAML/OIDC)** (12): decided at Phase 12 grooming.
- **Impersonation with guardrails** (12 + 34): admin + workflow-instance
  impersonation for testing — audited, time-bound.
- **Multi-language system messages** (17/24): per-site-channel language +
  per-language templates is the SiteStacker bar.
- **Donor portal completeness** (25): giving history, recurring
  self-service, wallet, statements, profile, My Campaigns.
- **Public REST API + webhooks with failure alerting** (31).
- **World-map / region modules, internal resource sharing** (28): workspace
  extras — groomed with Phase 28.
- **Prayer calendar & letter-writing** — **won't build** as
  child-sponsorship-adjacent features (child sponsorship is out of scope);
  missionary–donor correspondence is covered by 6/17/26/28. Recorded here
  so the omission is a decision.
- **Visibility conditions on public content** (23): date windows ship;
  audience-conditional content is a Phase 23 grooming decision (cache
  interplay).
- **Platform-adjacent (outside this program):** tenant provisioning/
  self-signup, the platform's own SaaS billing, plan gating.

<!-- END OF PER-PHASE SECTIONS -->

## Terminology & translation rules

When reading competitor or legacy material (including SiteStacker docs, MPDX,
CiviCRM, and older internal drafts), translate into Core glossary terms
(root `CONTEXT.md`) before writing PRDs or issues. Never import a competitor
term when Core already has an equivalent.

| External term                                                | Core term                                                          | Rule                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| SiteStacker "People" / MPDX "contact" / CiviCRM "individual" | **Party** with `party_kind = 'person'`                             | `person` is the canonical value for a human. Do not adopt "constituent" or "contact" as Core record terms. |
| SiteStacker "Group"                                          | **Party** with `party_kind = 'org'` or `'household'`               | A church is `org_type = 'church'`; a household is its own `party_kind`.                                    |
| "Channel"                                                    | **Entry Method** or **Source Code** (by meaning)                   | Entry Method = how a gift physically entered; Source Code = what motivated/attributed it.                  |
| "Relationship"                                               | **Stored edge** or **derived edge**                                | Stored = a `crm_relationships` row; derived = computed from source truth (ledger, household membership).   |
| "Portfolio" / "account list"                                 | **Staff-assignment edges** + saved views                           | Assignment is data; display roles are never authorization.                                                 |
| "Appeal"                                                     | **Donor-development appeal**                                       | Connects to Source Codes, communication events, tasks, and contribution attribution.                       |
| Provider record ID                                           | **Provider link**                                                  | A link to an external object — never identity, never operational truth.                                    |
| "Case"                                                       | **Support Hub conversation** or **member-care record** (by domain) | Do not import "case" as a generic term; the two domains have opposite visibility defaults.                 |
| "Moves management"                                           | **Donor development** (cultivation pipeline)                       | Cultivation stage is never a lifecycle status and never authorization.                                     |

## Governance — how this roadmap changes

- **This file changes by roadmap revision** (v2 → v3 …), each with an
  executive summary of deltas, an updated mapping table if numbers move, and
  a same-commit congruence sweep. Small factual updates (a phase gets its
  PRD; an epic number lands) are normal edits, not revisions.
- **Grooming order recommendation** (updated 2026-07-07): Phase 8 is
  re-groomed (#603 complete); **next is Phase 10** (the sensitive-data safety
  foundation) before any Phase 11 grooming; the money lane (13) can be groomed
  in parallel with 10–12. Phase 9's PRD is the live pattern for how deep a
  phase grooming should go.
- **Every new PRD starts here:** read this roadmap's phase section + the
  phase-map guardrails + the Core glossary; translate all competitor
  terminology; extend the Phase 1 ownership matrix if the phase introduces a
  new record type; and reserve seams for the later phases its section names.
- **Related documents:** [`README.md`](./README.md) (charter),
  [`parity-matrix.md`](./parity-matrix.md) (25-area tracking),
  [`phase-map.md`](./phase-map.md) (orientation mirror),
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md),
  OpenSpec (`openspec/specs/**`, `openspec/changes/sitestacker-parity/`),
  root `CONTEXT.md` (glossary).
