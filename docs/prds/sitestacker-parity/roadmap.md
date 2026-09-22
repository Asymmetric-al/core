# Asym Missions Platform — Program Roadmap (v3)

Adopted 2026-09-22 under [AL-1892](https://github.com/Asymmetric-al/core/issues/1892)
from the founder-supplied complete roadmap. This revision has **45 phases (0–44)**.
Phases 0–40 keep their numbers and stable slugs; Phases 41–44 are additions.
No historical issue or accepted earlier-phase contract is silently renumbered.

## Authority and adoption

This file owns phase architecture and scope. [phase-map.md](phase-map.md) is its
compact mirror. Detailed current PRDs, accepted owner amendments, OpenSpec and
source contracts govern their exact domains; a later consumer cannot acquire
source authority through shorthand. Phases 0–26 below retain their detailed
reconciled contracts, including stronger dependencies than the supplied orientation
summaries. The [adoption index](../program-roadmap/README.md) routes the complete
Studio packages, evidence, source assets, unresolved decisions and ticket impact.

This is accepted planning direction, not proof of implementation, provider
qualification, deployment or activation. Phases 22–26 remain the integrated
planning contracts imported by AL-1861/PR #1891; original source PR merge state
is separate. All current source and release gates remain required.

## How to read this roadmap

- Phase numbers identify stable scope. **Dependencies gate delivery, not numeric order.**
- Prioritize **Phase 41 (Mobilization, Applications & Onboarding)** immediately
  after **Phase 34 CORE (Workflow Studio)**. Other packs do not block CORE.
- **Phase 42 (Web Studio Hybrid Authoring & Governed Web Development)** is an
  independent content lane after its exact CMS, permission and source gates;
  it does not wait for Phases 34, 40 or 41. WEB-VISUAL does not wait for Git.
- Phase 31's minimum connection capability does not depend on its SMS or
  enterprise consumers. Phase 32 native email does not wait for SMS.
- Cite phases as **Phase N (Name)**, preserve stable work/requirement identifiers,
  and bind each capability to actual qualified owners before dispatch.
- Read the [integration guide](../program-roadmap/integration-guide.md),
  [shared delivery and completion contract](../program-roadmap/delivery-contract.md)
  and [retained owner requirements](../program-roadmap/owner-constraints.md).
  A structural test or available fixture does not qualify the runtime.

## What v3 changes

Workflow Studio now separates its 57-recipe CORE from MOBILIZATION (12), GIVING
(15), EVENTS (3) and CARE (9). Phase 41 owns application evidence and decisions;
Phase 34 owns common coordination. Phase 42 adds governed visual and source-based
Web authoring while preserving Phase 23 CMS and Phase 24 Site owners. Phase 43
adds separately qualified SMS channel, conversation and outreach checkpoints;
Phase 44 adds sign-in, directory and operations checkpoints. Phase 32 includes
organization campaigns and Phase 33 includes governed dashboard composition.
Native behavior remains complete without optional Studio enrollment.

## The master phase table

Starting dependencies retain current accepted floors. The exact source capability,
owner acceptance, privacy and release gates also apply; optional downstream
consumers are never whole-phase prerequisites of their own foundations.
`PRD exists` and `specification adopted` describe planning, never shipped behavior.

<!-- prettier-ignore -->
| # | Slug | Phase | Hard deps | Soft / consumes / enhanced by | Owner surface / system | Status |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0** | `baseline` | [Baseline, Governance & Evidence](./phase-00-baseline.md) | — | — | Docs, OpenSpec, parity matrix, evidence | `PRD exists` |
| **1** | `ownership-matrix` | [Source-of-Truth Ownership Matrix](./phase-01-source-of-truth-ownership-matrix.md) | 0 | — | OpenSpec, architecture docs, `packages/api` | `PRD exists` (ruled 2026-07-06) |
| **2** | `site-locale-currency` | [Site, Locale & Currency Foundation](./phase-02-site-locale-currency-foundation.md) | 1 | — | Tenant/site settings, public context, giving primitives | `PRD exists` (epic #477) |
| **3** | `permission-floor` | [Minimum Permission & Role-Scoped Projection Foundation](./phase-03-minimum-permission-role-scoped-projection-foundation.md) | 1, 2 | — | `packages/api` authz/projections, Mission Control | `PRD exists` (epic #489) |
| **4** | `identity-claiming` | [Identity & Account-Claiming Foundation](./phase-04-identity-account-claiming-foundation.md) | 2, 3 | — | Identity services, account claiming, tenant membership | `PRD exists` (epic #503) |
| **5** | `public-runtime` | [Public Website Runtime Contract](./phase-05-public-website-runtime-contract.md) | 2, 3, 4 | — | Public Website, Web Studio, Payload, donor public routes | `PRD exists` (epic #520) |
| **6** | `comms-event-model` | [Shared Communication Event Model](./phase-06-shared-communication-event-model.md) | 2, 3, 4, 5 | — | Communication services, CRM timeline, provider adapters | `PRD exists` (epic #550) |
| **7** | `receipt-rules-credit` | [Receipt & Statement Compliance Rules + Donor Identity/Credit Model](./phase-07-receipt-statement-compliance-and-donor-credit.md) | **4, 6, 3** (PRD C1–C3) | 2, 5 | Receipt/statement services, finance rules, party/credit model | `PRD exists` (epic #566) |
| **8** | `crm-operating` | [CRM Operating Foundation](./phase-08-crm-operating-foundation.md) _(re-groomed → Operations Observability & Data-Health)_ | none (build-now core) | 6 (emailed path), 9 (reserved sockets) | Mission Control CRM Operations, `packages/api/src/crm` | `PRD exists` (re-groomed 2026-07-07, ADR-0001; epic #587) |
| **9** | `crm-depth-graph` | [Full CRM Depth & Relationship Graph](./phase-09-full-crm-depth-relationship-graph.md) | **4, 7, 3** | 8 (operations visibility only) | Mission Control CRM (Asym Postgres) | `PRD exists` (epic #604 + #605–#627) |
| **10** | `sensitive-safety` | [Sensitive-Data Classification & Restricted-Ministry Safety Foundation](./phase-10-sensitive-data-safety.md) | **3, 9** | 4, 5, 6 | Mission Control, security projections, Member Care seams | `PRD exists` (grilled 2026-07-07; epic #628 + #629–#641) |
| **11** | `custom-fields` | Custom Fields & Custom Collections | 9, 10, 3 | — | Mission Control CRM configuration | `PRD exists` (epic #645 + #646–#664) |
| **12** | `permission-config` | Full Role & Permission Configuration | 3, 10, 11 | — | Mission Control Admin, `packages/api` authz | `PRD exists` (epic #665 + #666–#687) |
| **13** | `contribution-ledger` | Campaign, Designation, Contribution Ledger & Giving Cart | 1, 2, 3, 4, 5, 7 | — | Contributions/giving, public checkout, MC finance | `PRD exists` (epic #690 + #691–#713) |
| **14** | `donor-credit-ops` | [Donor Credit Operations: Soft Credits, DAFs, Tributes & Matching Gifts](./phase-14-donor-credit-operations.md) | 13, 7, 9 | enhanced by 17 (tribute letters) | Contributions, CRM views, reports | `PRD exists` (epic #719 + #720–#741) |
| **15** | `gift-batch-entry` | Offline Gift & Batch Entry | **13**, 14, 7 | 9; enhanced by 16 (fulfillment matching) | Mission Control Contributions | `PRD exists (epic #758 + #759–#786)` |
| **16** | `pledges-commitments` | Pledges & Recurring Commitments | **2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15** | enhanced by 17 (message rendering/delivery) | Contributions and CRM | `PRD exists` (epic #793 + #794–#837; groomed-not-dispatched) |
| **17** | `system-messages` | [System Messages & Template Management](./phase-17-system-messages-template-management.md) | 6, 2, 3, 7 | — | Email Studio / System Messages | `PRD exists` (epic #873 + #874–#905; groomed-not-dispatched) |
| **18** | `document-templates` | [Receipt & PDF Template System](./phase-18-receipt-pdf-template-system.md) | 7, **13**, 17 | 6 | Document Studio / Generated Documents | `PRD exists` (epic #907 + #908–#961; #908–#910 ready frontier) |
| **19** | `statement-operations` | [Year-End Statement Operations](./phase-19-year-end-statement-operations.md) | 6, 7, 12, **13**, 14, 15, 17, 18 | 9, 4 | Mission Control Contributions/Finance | `PRD exists` (epic #977 + #978–#1031; blocked/not-dispatched) |
| **20** | `accounting-exports` | [Accounting Exports & Reconciliation](./phase-20-accounting-exports-reconciliation.md) | **2, 3, 4, 7, 12, 13, 14, 15** | 16 | Mission Control Accounting | `PRD exists` (implementation-ready 2026-07-27; not implemented) |
| **21** | `field-accounts` | [Missionary Field Accounts & Support Balances](./phase-21-field-accounts.md) | **1**, 3, 4, 6, **9, 10, 12**, 13, **15**, 17, 18, 20 | 16 | Mission Control Finance/Admin, Missionary Workspace projection | `PRD exists` (implementation-ready 2026-08-02; spec #1108; epic #1109 + lane epics #1110–#1120 + P21-01–P21-101 published and dependency-governed; not implemented; D1-D28 scope-frozen; D17/D27 activation requires certified Phase 29 opening-source private-byte custody and Phase 30 import-session staging; selected private-byte-bearing D10/D14/D18/D22/D24/D25/D28 and D26 package/lifecycle slices require their exact owner seams, while metadata/manual/feed paths remain separate; D28 requires Phase 29/30 only for its selected private-byte/bulk lane and otherwise weakens no owning-phase prerequisite) |
| **22** | `public-ministry-pages` | [Public Missionary & Project Page Workflow](./phase-22-public-ministry-pages.md) | 5, 9, 10, **12**, 13, 3 | 15, 16, 21, 28 (optional source-owned progress/support inputs) | Web Studio, Public Website, Missionary Workspace, Contributions | `PRD exists` (implementation-ready 2026-08-14; spec [#1281](https://github.com/Asymmetric-al/core/issues/1281); P22-01–P22-41 / #1282–#1322 published with native blockers; #1282 sole child ready frontier; [OpenSpec](../../../openspec/changes/add-public-ministry-pages/proposal.md); D1–D27 scope-frozen; not implemented; activation requires certification of Phase 23 CMS, Phase 24 locale/domain, and Phase 29 media-custody/sanitization owner slices); original source PR remains unmerged; affected P25 consumers require accepted owner contracts and qualified producer implementation |
| **23** | `web-studio-cms` | [CMS / Site Planner Dynamic Content Parity](./phase-23-web-studio-cms.md) | **2, 3, 5** | 22 | Web Studio, Payload, Public Website | `PRD exists` (implementation-ready 2026-08-24; spec [#1339](https://github.com/Asymmetric-al/core/issues/1339); [OpenSpec](../../../openspec/changes/add-web-studio-cms/proposal.md); D1–D36 scope-frozen; not implemented); original source PR remains unmerged; affected P25 consumers require accepted owner contracts and qualified producer implementation; P10/P12/P22 are required consumer/safety seams, not blanket core merge gates (clarified 2026-09-16, #1340 at db7a5e5) |
| **24** | `multi-site-management` | [Full Multi-Site, Language & Currency Management](./phase-24-multi-site-management.md) | 2, 5, 13, 20, 23 | 17 | Tenant settings, Web Studio, Contributions settings | `PRD exists` (implementation-ready 2026-09-01; spec [#1431](https://github.com/Asymmetric-al/core/issues/1431); [OpenSpec](../../../openspec/changes/add-multi-site-management/proposal.md); tickets [#1432–#1557](https://github.com/Asymmetric-al/core/issues/1432) published and dependency-governed; P24-01/#1432 sole ready frontier; 125 successors blocked; D1–D18 and D57–D84 scope-frozen; D19–D55 preserved cross-phase evidence; D56 deferred; not implemented); original source PR remains unmerged; affected P25 consumers require accepted owner contracts and qualified producer implementation |
| **25** | `donor-portal-depth` | [Donor Dashboard Depth](./phase-25-donor-dashboard-depth.md) | Baseline/start: 3, 4, 6, 7, 13.<br>Before affected consumer dispatch: exact P9, P10, P12, P14, P16, P17, P18, P19 and P22–24 producers from S04/S06 require final accepted contracts plus implemented, qualified owner seams. Q25 also requires the bounded P28/P12 guest-recipient projection and P32 external-enrollment exclusion before dispatch; neither whole future phase is a prerequisite. P22–24-dependent and Q25 consumers remain not dispatch-ready until their exact producer gates pass. Unaffected safe slices remain independent. | 17/19 are required for affected consumers, not optional enhancements; apply the scoped producer gates in the preceding cell. | Donor Portal | `PRD exists` (spec #1563; Q01–Q29 ratified, Q30 accepted; scoped source-owner prerequisites; not implemented; 88 native implementation issues #1565–#1652 under #1563; no blanket dispatch readiness) |
| **26** | `support-hub` | Support Hub & Conversation Management | 6, 3, 4, 9, 17; 23 (selected lanes) | — | Support Hub, communication services, `packages/api` | `PRD exists` — [ratified specification #1656](https://github.com/Asymmetric-al/core/issues/1656); D1–D40 complete, including D27-C and D29-X01; 4 native index issues #1658–#1661 and 199 implementation leaves #1662–#1860 under #1656; implementation and release proof outstanding |
| **27** | `donor-development` | [Donor Development & Portfolio Management](#phase-27) | **9**, 3, 6, 13 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **28** | `missionary-workspace-depth` | [Missionary Workspace Depth & Support-Raising CRM](#phase-28) | 9, 13, 16, 6, 3, 27 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **29** | `files-documents` | [File Manager & Document Management](#phase-29) | 3, 9 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **30** | `imports-migration` | [Imports & Migration Tools](#phase-30) | 9, 13, 11, 29, 4, 3 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **31** | `platform-api` | [Platform API, Webhooks & Connector Framework](#phase-31) | 1, 3, 4, 6 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **32** | `newsletter-sync` | [Mailchimp / Newsletter Sync with Suppression Handling](#phase-32) | 6, 3, 28, 4, 31 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **33** | `reporting-bi` | [Reporting & BI / Report Studio](#phase-33) | 9, 13, 7, 6, 3 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **34** | `workflow-engine` | [Configurable Automation & Workflow Engine](#phase-34) | 9, 11, 12, 29, 17, 6 | Exact source gates; optional consumers never back-gate foundations | Workflow Studio | specification adopted; independent CORE qualification pending |
| **35** | `contribution-triggers` | [Spark-Style Contribution Triggers](#phase-35) | **34**, 13, 6, 3 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **36** | `p2p-campaigns` | [Peer-to-Peer & Advocacy Campaigns](#phase-36) | 5, 13, 25, 3, 22 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **37** | `events-groups` | [Event / Opportunity Workflows & Group Management](#phase-37) | 5, 9, 13, 6, 29, 34, 36 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **38** | `member-care-ops` | [Member Care, Crisis & Restricted-Ministry Operations](#phase-38) | 10, 3, 4, 9, 29 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **39** | `field-first-ux` | [Mobile, Low-Bandwidth & Conflict-Safe Field Experience](#phase-39) | 3, 4, 9, 28 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **40** | `data-stewardship-ai` | [Data Stewardship, Global Search & AI Operator Workbench](#phase-40) | 3, 4, 8, 9, 13, 30, 33 | Exact source gates; optional consumers never back-gate foundations | Existing source-owned surfaces | roadmap scope adopted; phase grooming/qualification required |
| **41** | `mobilization-onboarding` | [Mobilization, Applications & Onboarding](#phase-41) | 34 CORE (inherits exact source floors) | Exact source gates; optional consumers never back-gate foundations | Mobilize / My Journey | specification adopted; binding/qualification gates open |
| **42** | `web-studio-hybrid-authoring` | [Web Studio Hybrid Authoring & Governed Web Development](#phase-42) | 12, 23 | Exact source gates; optional consumers never back-gate foundations | Web Studio | specification adopted; binding/qualification gates open |
| **43** | `sms-channel-activation` | [Governed SMS Messaging & Channel Activation](#phase-43) | 6, 12, 17, 31 (minimum) | Exact source gates; optional consumers never back-gate foundations | Communications / Support Hub | specification adopted; binding/qualification gates open |
| **44** | `enterprise-identity-integration` | [Enterprise Sign-In & Directory Integration](#phase-44) | 4, 12, 31 (minimum) | Exact source gates; optional consumers never back-gate foundations | People & access / connections | specification adopted; binding/qualification gates open |

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

| **Lane**                                | **Phases** | **Intended result**                                                                                                       |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| Foundations and governance              | 0–7        | Ownership, Site/locale/currency context, identity, public runtime, communication and receipt/credit rules.                |
| CRM and safety                          | 8–12       | Operational visibility, Party graph, classification, custom data and current capabilities.                                |
| Giving and finance                      | 13–21      | Contributions, recognition, batches, commitments, messages, documents, statements, accounting and Field Accounts.         |
| Public web and content                  | 22–24, 42  | Governed ministry pages, CMS, Site/locale/domain management and hybrid visual/developer authoring.                        |
| Engagement and stewardship              | 25–28      | Donor self-service, Support Hub, donor development and missionary support-raising.                                        |
| Data and integration                    | 29–33      | Document custody, migration, APIs/connectors, newsletter synchronization and reporting.                                   |
| Workflows and advanced operations       | 34–41      | Shared automation, giving triggers, P2P, events, care, field resilience, stewardship assistance and mobilization.         |
| Extended channels and enterprise access | 43–44      | Qualified SMS messaging, two-way communication, text-to-give, organization-managed staff sign-in and directory lifecycle. |

**Intentional exclusions.** Child sponsorship and its specific prayer-calendar/letter-writing product are outside this program; ordinary missionary–donor correspondence remains covered by communications, Support Hub and the workspace. Tenant self-signup/provisioning, Asym's own subscription billing and commercial plan management are adjacent platform-business work, not silently included here. A hosted IDE, hosted OpenCode/BYOK product, arbitrary tenant server runtime and app marketplace are not prerequisites of the web-development plan.

## The phases in depth

<a id="phase-00"></a>

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

<a id="phase-01"></a>

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

<a id="phase-02"></a>

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

<a id="phase-03"></a>

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

<a id="phase-04"></a>

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

<a id="phase-05"></a>

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

<a id="phase-06"></a>

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

<a id="phase-07"></a>

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

<a id="phase-08"></a>

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
views exist. The withdrawn Twenty runtime was removed through merged PR #1325
on 2026-08-19: the write gate,
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

<a id="phase-09"></a>

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

<a id="phase-10"></a>

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
  (no disclosure outside the body without consent). Phase 22 D26 narrowly uses
  one whole-candidate Public Content Sharing Attestation as its ordinary Page
  and Update input, so absent granular affirmative rows alone create no second
  editorial workflow; any known objection, hard flag, restriction, or stricter
  current safety result still wins, and other Phase 10 purposes are unchanged.
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

<a id="phase-11"></a>

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

<a id="phase-12"></a>

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

<a id="phase-13"></a>

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

<a id="phase-14"></a>

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

<a id="phase-15"></a>

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

<a id="phase-16"></a>

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

<a id="phase-17"></a>

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

<a id="phase-18"></a>

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

<a id="phase-19"></a>

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

<a id="phase-20"></a>

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

<a id="phase-21"></a>

### Phase 21 — Missionary Field Accounts & Support Balances (`field-accounts`)

**What this phase is (plain language).** The financial heart of the
**deputized-fundraising model**: every gift legally belongs to the organization;
its approved purpose may be a donor preference or a legally enforceable
restriction, and Phase 21 admits only the immutable Phase 13 source-purpose
authority. When a tenant activates
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
  Public support progress consumes only the exact D6 page profile and compatible
  Phase 13/16/28 source projection; typed counts do not require a Phase 28 goal.
  It never exposes an internal Field Account balance, support-credit amount, or
  ministry-expense capacity.
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
founder product authority. The implementation-ready PRD and OpenSpec contract
are published; any later mechanical refinement creates no D29. D8
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
[ADR-0112](../../adr/0112-source-family-expense-field-account-effect-recognition.md).
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
[ADR-0113](../../adr/0113-own-identity-claim-bounded-expense-collaboration.md).
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
[ADR-0114](../../adr/0114-cause-owned-expense-claim-resolution.md).
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
[ADR-0115](../../adr/0115-purpose-owned-phase21-records-schedules-and-exact-custody-exports.md).
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
[ADR-0116](../../adr/0116-evidence-gated-core-field-accounts-production-activation.md).
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
[ADR-0117](../../adr/0117-proof-gated-opening-cumulative-travel-allowance-admission.md).
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

<a id="phase-22"></a>

### Phase 22 — Public Missionary & Project Page Workflow (`public-ministry-pages`)

**Status.** `PRD exists` — implementation-ready planning, not implemented. The founder accepted the completed
[formal closure audit §51](./phase-22-public-ministry-pages-research-evidence.md#51-formal-phase-22-closure-audit--d1d27-are-product-decision-complete)
on 2026-08-14 and froze D1–D27 as the complete Phase 22 grooming authority. No
D28 is opened. The founder subsequently invoked `/to-spec`; the canonical
[Phase 22 PRD](./phase-22-public-ministry-pages.md) and active
[`add-public-ministry-pages` OpenSpec change](../../../openspec/changes/add-public-ministry-pages/proposal.md)
now carry the approved implementation contract. Parent specification issue
[#1281](https://github.com/Asymmetric-al/core/issues/1281) owns 41 native child
issues, [#1282](https://github.com/Asymmetric-al/core/issues/1282) through
[#1322](https://github.com/Asymmetric-al/core/issues/1322), connected by 117
native blocking relationships. P22-01/#1282 alone among the 41 implementation
children is the current `ready-for-agent` frontier. Implementation, migration,
and production remain separate work governed by each ticket's live blockers.

**What this phase is (plain language).** The public pages where donors meet
missionaries and projects — connected to _real_ operational records instead
of the mock data the public `/workers` pages render today. A missionary's
public page shows their story, an optional source-authoritative support
progress presentation, and a give button that lands in the right designation
with the right attribution. A missionary can prepare and deliberately submit
edits; the tenant's current Phase 22 Review & Release Profile decides whether
an authorized staff member reviews that exact candidate or it releases after
all mandatory checks pass; and **restricted workers are protected by
construction** (Phase 10).

**Why it sits here.** Needs the Phase 5 runtime contract; Phase 9 Parties and
organization-owned Ministry Assignments; **Phase 10 safety (hard — a public
identity surface must not exist before the publication firewall)**; Phase 12
authorization; Phase 13 Designations (CTAs carry designation + source code +
site/locale context); and optional Phase 21 support projections.

**What it covers.**

- **Missionary Page ↔ Ministry Assignment linkage**: presentation identity
  references one organization-owned operational Ministry Assignment—never a
  copied Party, household, Support Assignment, Field Account, or CMS ownership
  shortcut. Each spouse, teammate, leader, and contributor remains a separate
  Party and principal. D1 Display Participant and contributor facts decide
  public portrayal and editing; the public projection renders only Phase 10
  public-tier fields such as an approved alias, approved photo, and generalized
  region for restricted workers.
- **Exact typed Project/Campaign Page subjects**: every Project/Campaign Page
  binds immutably to exactly one owner-certified CRM Ministry Project, Phase 13
  Giving Campaign, or separately public-subject-eligible Phase 13 Designation.
  The CRM operational layer owns the minimal Ministry Project identity and
  lifecycle; Phase 13 owns Campaign/Designation truth; Phase 22 owns only the
  exact Page Subject Binding and release-pinned privacy-safe snapshot. Subject,
  D7 Giving, D6 progress, D1 contributors/display, D2 reach/release, D8
  lifecycle, D9 media, D11 Updates, D13 discovery, and D14 search/share remain
  independent. Staff answer one plain-language **What is this page about?**
  question and then review separate **This Page is about**, **Gifts go to**,
  **Progress shown**, **Who can edit**, **Public reach**, and review/release
  rows. Before first release a correction is a CAS-guarded binding successor;
  afterward a different subject requires a new Page identity plus D8 succession.
  No CMS record, fund, `fundId`, title, accounting project, Party relationship,
  Campaign owner, or Designation membership may fabricate a project or infer
  permissions, public identity, Giving, progress, or lifecycle.
- **Optional, page-resolved support progress**: every released page explicitly
  selects **Do not show public progress** or exactly one compatible typed
  metric. Page Family and tenant defaults only seed new drafts; they never
  decide visibility, assume missionary means monthly or project means finite,
  or live-inherit into released pages. Eligible sources remain distinct:
  Phase 13 owns corrected posted-effective gross received and typed counts,
  Phase 16 owns a separately certified active-commitment projection, and Phase
  28 owns a referenced Support-Raising Goal Version. Phase 15 contributes only
  after an offline gift becomes Phase 13 posted-effective truth. Every monetary
  comparison uses one exact ISO currency, compatible period and goal, names
  whether it is **committed** or **received**, and shows a through date. There
  is no mixed commitment/receipt formula, mutable counter, manual total,
  converted public grand total, or Phase 20/21/33 fallback. Privacy is applied
  before aggregation; incomplete, stale, suppressed, or unsafe truth omits only
  the optional block and opens one cause-owned staff exception rather than
  showing zero or last-known data. Giving remains independently controlled.
- **Missionary edit workflow**: private workspace drafts become immutable
  release candidates only after deliberate submission. The tenant selects
  `Review before publishing` or `Publish after checks` prospectively for each
  page/update path; both modes consume Phase 10's publication firewall and
  review-verdict contract, then use the content owner's current-proofed release
  command: D2's Page CAS and Page Release Manifest for a Page, or D11's
  audience-scoped CAS, Audience Release Manifest, and selected projection head
  for a Ministry Update. Neither command or manifest may substitute for the
  other. Review-mode staff judge the exact rendered candidate through
  **Approve & publish** or **Request changes**; healthy automatic candidates do
  not enter the staff queue. Phase 22 adds no second consent workflow or
  participant/field/asset permission matrix. A contributor assignment alone
  never grants publication authority; in the automatic lane an authorized
  contributor may initiate **Publish changes**, while the tenant profile and
  current system proofs still decide whether one release succeeds.
- **Optional AI drafting assistance**: a tenant may bind an independently
  authorized public-profile drafting purpose through the shared D10 AI Provider
  Connection, write-only Credential Revision, and prospective
  capability-certified Binding Version. One quiet **Help me write** control may
  act only on an exact D1 contributor-editable D3 narrative field, block, or
  selection through a source-visible minimum-data manifest, immutable private
  suggestion, accessible original-versus-suggestion review, and explicit CAS-
  guarded Use into an ordinary successor working revision. The code-owned action
  catalog is small; AI never reads broad Page, CRM, supporter, receipt, expense,
  financial, progress, or Giving context and never submits or publishes.
  **Translate to English** is separately available only for a pair-certified
  source language and exact existing Phase 24 English BCP 47 target locale. It
  names both languages, treats detection as confirmable help, separates mixed-
  language ambiguity, preserves the original, and cannot combine translation
  with rewriting or factual localization. Every result carries the adjacent
  **Check this translation** warning and asks the author to review names, dates,
  numbers, quotations, Scripture, ministry terms, relationships, and cultural
  meaning; important content should be checked by a fluent English reader and
  is never represented as certified. Phase 22—not Phase 21 or the model—owns
  biography draft meaning, source selection, human acceptance, moderation,
  consent, review, and publication. The feature is tenant-off-by-default,
  suggestion-only, never bypasses the Phase 10 firewall, and has a complete
  manual writing path.
- **Canonical Ministry Updates with exact audience projections**: one stable,
  source-scoped Ministry Update has immutable Revisions and one exact Audience
  Release Manifest. Independently recoverable Public Page and authenticated
  purpose-authorized Supporter projections consume D1 contribution authority,
  D3's exact Feed Binding, D4/D5's sole review/release lane, D2's current reach,
  Phase 10's per-egress ceiling, Phase 12 current authorization, Phase 24
  locale, and D9/Phase 29 media. The missionary uses one accessible autosaving
  **Ministry updates** composer—**My Feed** is only a legacy alias—with separate
  **Save draft**, tenant-seeded **Supporters**, **Public page**, or **Public page
  and supporters** choices, exact previews, an optional deliberately authored
  public-safe variant, and one consequence review. Publication, current
  protected access, supporter relationship, notification intent, recipient/
  consent/suppression/cadence, provider delivery, engagement, and Giving remain
  separate truths. **Publish & notify supporters** may be one quiet interaction
  but routes notification through Phases 28/17/6; it is never hidden email or
  collapsed authority. Corrections and withdrawal are audience-specific and
  append-only, current protected membership is re-proved on every governed
  request, and migration uses one complete disposition manifest and authority
  cutover rather than copied posts, inferred audiences, or dual write.
- **Bounded authenticated supporter responses**: one prospective immutable
  tenant Supporter Response Profile Version selects exactly **Responses off**,
  **Like + I prayed**, or **Like + I prayed + comments**. New tenants begin off;
  guided setup recommends acknowledgements without comments. Every response is
  contained inside one exact D11 Supporter Release Projection-bound Engagement
  Space and re-proves current purpose-authorized membership, Phase 10 safety,
  and Phase 12 authority on every operation. Like and I prayed are fixed,
  reversible, idempotent acknowledgements. Optional comments are bounded plain
  text with one reply level, append-only self-edit/withdrawal, privacy-safe
  tombstones, and one quiet reversible moderation lane. Counts/viewer state are
  rebuildable audience-local projections; anonymous public releases contain no
  protected response fact. Phase 22 emits typed response/moderation occurrences
  only—Phases 17/6 independently own any communication, and D7/Phase 13 owns
  Giving. No existing demo reactions, mutable counters, comments, raw browser
  tables, or Realtime policies are grandfathered as D12 authority.
- **Scoped public ministry discovery**: one exact Tenant, Legal Entity,
  environment, Site, and locale-scoped Public Ministry Discovery Profile uses
  **Together** by quiet default or tenant-selected **Separate by Page Family**
  presentation over one complete D2/Phase-10-admitted Directory Projection,
  bounded server query contract, and family-typed card contract. Separate
  Missionary and Project destinations are views, never separate membership,
  index, search, cache, or inclusion authorities. Search uses admitted public
  fields only, deterministic locale-pinned behavior, bounded filters, opaque
  generation-bound keyset cursors, complete shadow rebuilds, atomic head
  activation, and affected-positive-first removal. D6 progress and D7 Giving
  remain optional independent references; Phase 5/D8 retain request and route
  authority. No page-level directory toggle, raw browser table/Realtime read,
  hidden facet count, map/exact coordinate, popularity or financial ranking,
  unsafe locale fallback, dual-read migration, or concurrent indexable
  Together/Separate catalogs may become D13 authority.
- **Release-bound public search and sharing presentation**: one immutable,
  locale-exact D14 manifest contains distinct Search and Share results for each
  exact current Phase-10-safe Page Release and Public Page Ministry Update
  Release. Listed-public releases are server-rendered, canonical, reciprocal-
  locale and exact-host sitemap eligible, locally search-index eligible, and
  shareable; Shared-by-link releases remain public and shareable but `noindex`
  and absent from public discovery; stricter truth emits no content-specific
  anonymous presentation. Each canonical Ministry Update has one stable opaque
  Site/locale permalink whose posture derives from complete current placement
  coverage. One code-owned compiler produces coherent HTML/head, crawler
  directives, canonical/alternate links, significant-release `lastmod`,
  sharded sitemaps, visible-fact JSON-LD, Open Graph-compatible metadata, and an
  exact D9-certified social derivative. Staff get generated defaults and only
  bounded locale title/description and certified-image choices inside the sole
  D4/D5 lane; visitors get native Share plus Copy-link/click-only fallbacks.
  Search-ready, crawler submission, crawl, index, rank, snippet, share opening,
  completed sharing, cache refresh, local removal, and external forgetting
  remain distinct facts.
- **Bounded public-ministry measurement**: one prospective Tenant × Legal
  Entity × Site profile is persisted **Off** until staff explicitly selects
  guided **Staff only** or **Staff + assigned page contributors**. Exactly four
  fixed, first-party, immutable-release-bound interactions—qualified Page load,
  full Update open, Share options opened, and Give button selected—use
  best-effort same-origin post-render or explicit-action intake; fetch, render,
  preview, crawler, scanner, social-card, and monitor paths create nothing.
  Durable measurement contains no raw IP/header, URL/referrer, identity,
  fingerprint, cookie/session, free-form, replay, or cross-site/device data.
  Private occurrences and idempotency evidence expire within 24 hours; sealed
  daily aggregates retain for one code-owned 24-month period with append-only
  corrections. Every report read/export re-proves current Phase 12 staff or D1
  exact-page assignment authority. One accessible **Public page activity**
  report uses fixed 7/30/90 complete-day presets, suppression-safe values,
  distinct coverage states, and **Data complete through** truth. D15 never
  claims people, reach, completed shares, conversion, gifts, attribution,
  settlement, or payment; its failure never changes the public or Giving path,
  and replay-free production proof precedes activation.
- **One exact Giving destination per released page for the MVP**: every
  Missionary Ministry Page and Project/Campaign Page pins one immutable Page
  Giving Binding to exactly one Phase 13 Designation, and every CTA placement
  shares it. Phase 5 carries only untrusted plain parameters; cart/checkout
  entry and the final pre-provider boundary re-prove the current D2 release,
  Phase 10-safe label and eligibility, Tenant, Legal Entity, Site, binding,
  Designation, Settlement Account Binding, environment, currency, cadence,
  registered attribution, and internal return path. Suggested amount/frequency
  and per-CTA source code remain bounded context, never routing authority. A
  stale or ineligible destination makes only Giving unavailable with no silent
  fallback; any separately labelled general-giving path starts a fresh donor
  choice. Phase 13's campaign `expected designations` remains staff intent and
  a future seam, not a Phase 22 MVP public picker. A Site never defines or
  overrides financial ownership.
- **Project/campaign pages** with the same publication and Giving mechanics;
  progress is absent or uses the page's exact D6 source-authoritative profile,
  never a Page-Family default or copied campaign counter.
- **Source-qualified route and lifecycle disposition**: a route/lifecycle source
  event opens one cause-owned case but never chooses the public result. Staff may
  keep the current eligible release, publish a substantive coverage-aware
  Transition Notice Release at the current address, permanently move only the
  same immutable Listed-public Page to its already released eligible new
  canonical route, or remove the route through the same real privacy-safe `404`
  plus `noindex` as an unknown page. A different proved successor presentation
  is a clearly labelled fresh link, never a redirect or inherited Giving action.
  The external URL namespace is uniquely Site × locale × canonical path; exact
  Tenant, Legal Entity, Page Family, Page, route class, and release scope remain
  mandatory composite integrity. Shared/restricted direct links never redirect;
  resolver outage is neutral no-store `503`; every request freshly checks D2 and
  Phase 10 before cached content. D7/Phase 13 Giving and Phase 16 recurring truth
  remain independent, so a page disposition never chooses, closes, moves, or
  silently redirects money.
- **Release-bound, privacy-preserving public media**: one Phase-29-compatible
  Public Ministry Media Asset contract separates short-lived private Upload
  Intakes, immutable Sanitized Media Master Versions, bounded certified Public
  Media Derivative Manifests, and context-owned Public Ministry Media Placement
  Versions. Original filenames and prohibited source metadata never enter a
  durable identity, public URL or response, derivative, log, analytic, error,
  export, title, or alt-text default. Qualifying still images are fully decoded,
  bounded, reconstructed, re-encoded, and independently reparsed before they
  can become ready; raw originals, raw provider URLs, mutable overwrite, SVG,
  animation, arbitrary remote fetch, and unproved formats remain ineligible.
  Every placement pins its exact semantic role, focal point or crop, contextual
  alt-or-decorative decision, caption/attribution, master, and responsive/card/
  social derivative set. D3 owns typed placement, D4/D5 remain the sole review
  lane, and the Page Release Manifest atomically pins only certified
  derivatives after fresh D2 and Phase 10 proof. Replacement keeps the old
  coherent release live until the new release succeeds. Ordinary removal is a
  page draft; urgent remove-everywhere is smallest-scope Phase 10 containment
  with exact where-used evidence. An opaque Asym-controlled resolver serves
  private-origin bytes and records targeted purge outcomes without claiming
  recall from external copies. Phase 22 owns public-media meaning, placement,
  release eligibility, and withdrawal intent; Phase 29 owns shared byte
  custody, scans, transformations, copy inventory, access, retention, and
  disposal evidence.
- **Authenticated exact-version Public Ministry Preview**: a contributor
  previews one explicitly selected coherently saved working revision; an
  authorized staff editor/reviewer or existing verified tenant principal with
  one exact Phase 12 page-scoped `Preview only` named grant previews one
  immutable submitted candidate. Every HTML, RSC/data, media, refresh, and
  session-continuation request reauthenticates and reauthorizes the exact
  principal, active tenant assignment, Tenant, Legal Entity, Site, Page Family,
  Page, locale, version/candidate, purpose, assignment/capability/grant and
  expiry, authorization epoch, environment, Phase 10 ceiling, D3 renderer
  generation, and D9 media coverage. Preview uses Phase 5's production-
  equivalent reader and renderer, is private, `no-store`, non-indexable,
  referrer-suppressed, and makes Giving, forms, embeds, notifications,
  tracking, and other consequential controls visibly inert. Authentication,
  Draft Mode, a copied URL, role, relationship, CMS user, or service role grants
  nothing. No anonymous, bearer, shared-password, preview-token, or separate
  guest-identity path exists, and preview never means reviewed, released,
  live, Giving-ready, payable, or paid.
- **Release-bound Public Ministry runtime composition**: Phase 5 executes the
  public runtime and cache mechanics; Phase 22 owns Public Ministry semantics,
  current-serving admission, and adverse-first convergence across controlled
  surfaces. Every Asym-controlled response evaluates current serving before
  returning reusable positive content, and no Payload publish state, cache,
  deployment, provider result, or effect worker becomes a second public
  authority. D18 is recorded in
  [ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).
- **Organization-owned Ministry Assignments with separated support access**:
  one stable Phase-9-owned, Tenant- and Legal-Entity-scoped Ministry Assignment is the exact
  Missionary Ministry Page subject. Zero-to-many effective-dated, append-only-
  corrected Party memberships model spouses, teammates, leaders, coaches,
  staff, and contributors without shared accounts or implicit access. One
  optional prospective Phase-21-owned Support Binding Version may connect the
  Ministry Assignment to one exact Support Assignment. It never grants access:
  each person separately requires the current purpose-, projection-, target-,
  field-, currency-, and history-specific Phase 12 Support Workspace grant, and
  the tenant's D9 publication must permit the selected module. A quiet **People
  & access** experience can apply explicit same-scope membership, display,
  contributor, notification, responsibility, and support-access facts through
  bounded presets after one literal consequence review. Membership, marriage,
  display, editing, Designation, notification preference, or the binding itself
  cannot expose supporter identity, read support data, move money, or rewrite
  history. Raw tables remain browser-inaccessible; coarse Tenant RLS plus the
  sole server-side Phase 12 policy decision point, live authorization epochs,
  append-only evidence, deny-first revocation, and production-shaped isolation
  proof are mandatory. D19 is recorded in
  [ADR-0136](../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).

- **Two bounded Page Family Semantic Catalogs and quiet authoring**: D20 fills
  D3's concrete launch vocabulary with one immutable code-owned Missionary
  Ministry catalog and one non-interchangeable Project/Campaign catalog. Every
  semantic role declares source/edit authority, cardinality, certified zone,
  locale/accessibility/performance behavior, and exact empty, unavailable,
  invalid, and withdrawn outcomes. A prospective D3 profile may set only an
  eligible optional editorial role to **Off**, **Available**, or **Expected**,
  choose bounded order inside certified zones, and make it staff-only or
  contributor-editable. Expected is private completeness guidance, never
  public filler. Contributors work through one quiet **Basics**, **Story**,
  **Media**, **Support & giving**, and **Updates** form; staff configure two
  compact family surfaces with safe defaults and prospective consequence
  preview. Every D2 release pins the exact catalog/renderer/profile/content/
  locale/brand/managed-reference generations. Unknown, wrong-family,
  unauthorized, stale, or over-budget input rejects the new candidate and
  preserves the last certified release. The current shared seven-block Payload
  builder, copied mutable templates, free CTA URLs, duplicated serializers, and
  silent unknown-block omission are migration evidence only. D20 is recorded in
  [ADR-0137](../../adr/0137-two-bounded-page-family-semantic-catalogs.md).

- **Complete-surface authority cutover with incremental private Page
  adoption**: D21 replaces the current mock, static, generic, and copied Public
  Ministry surface through one immutable-scope Adoption Case per exact Tenant ×
  Legal Entity × environment × Site × verified-host set × locale. Preparation
  is additive, chunked, resumable, private, and non-authoritative; the public
  surface changes once through one content-addressed complete Adoption Coverage
  Manifest and a short current-reproved, idempotent CAS authority cutover.
  Every discovered route, Page/version, shared template, subject/identity hint,
  Giving hint, Update, media artifact, preview, directory/search/sitemap/social
  output, cache variant, API/reader, fixture, and import path receives exactly
  one non-overlapping disposition. A narrowly certified compatible-legacy D2
  release may preserve proved-safe editorial presentation only where D20 allows
  it; it is never raw Payload publication, a fallback reader, or managed truth.
  The D21 production-shaped shadow has no public effects, staff review only
  genuine exceptions and one complete visitor-consequence summary, and the one
  literal action is **Start using these prepared pages**. After cutover the
  Phase 5/D18 gateway is the sole reader, current admission prevents stale
  positive bytes from regaining authority, and recovery may select only a
  currently re-proved generation-compatible safe release—never mock data, the
  legacy reader, destructive rollback, or deployment-as-content authority. D21
  is recorded in
  [Phase 22 research evidence §44](./phase-22-public-ministry-pages-research-evidence.md#44-ratified-d21-research--complete-public-ministry-surface-authority-cutover)
  and
  [ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).

**Boundaries & guardrails.** Public pages are presentation, never operational
identity or financial truth. Missionary edits route through the tenant's exact
Review & Release Profile and the same mandatory safety/release proof; automatic
release is system execution of standing tenant authority, not contributor
publication authority. Restricted-worker rules are enforced at the projection,
not by page-by-page configuration (SiteStacker's page-level "Authenticate"
checkbox model is the anti-pattern).

**Scope-freeze record.** D1–D27 are binding and no founder-level product question
remains open. D12's bounded Supporter
Response contract is recorded in
[ADR-0129](../../adr/0129-bounded-supporter-response-profiles.md). D13 ratifies
one source-complete directory/search authority with tenant-chosen Together or
Separate-by-family presentation, recorded in
[Phase 22 research evidence §29](./phase-22-public-ministry-pages-research-evidence.md#29-ratified-d13-adversarial-review--one-authority-tenant-chosen-directory-topology)
and
[ADR-0130](../../adr/0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md).
D14's exact search/share manifest, stable Update permalink, safe sharing, and
honest external-outcome contract are recorded in
[Phase 22 research evidence §32](./phase-22-public-ministry-pages-research-evidence.md#32-ratified-d14-selected-option-adversarial-review-and-hardened-decision)
and
[ADR-0131](../../adr/0131-release-bound-public-search-and-sharing-presentation.md).
D15's bounded first-party measurement, current-assignment visibility, privacy
ceiling, through-dated reporting, and failure-isolation contract are recorded
in
[Phase 22 research evidence §36](./phase-22-public-ministry-pages-research-evidence.md#36-ratified-d15-synthesis-and-hardened-decision)
and
[ADR-0132](../../adr/0132-bounded-public-ministry-measurement-and-contributor-visibility.md).
D16's source-bounded assistant, exact-English-locale translation rider,
check-work warning, and shared-D10/manual-continuity contract are recorded in
[Phase 22 research evidence §§37–39](./phase-22-public-ministry-pages-research-evidence.md#37-ratified-d16-research--source-bounded-public-page-writing-assistant)
and
[ADR-0133](../../adr/0133-source-bounded-public-page-writing-assistance.md).
D17's owner-certified closed subject-kind contract, CRM-owned Ministry Project
source, independently authoritative Page Subject/Giving/progress/permission
bindings, and immutable subject-succession rules are recorded in
[Phase 22 research evidence §41](./phase-22-public-ministry-pages-research-evidence.md#41-ratified-d17-research--one-exact-source-qualified-typed-projectcampaign-page-subject)
and
[ADR-0134](../../adr/0134-exact-typed-public-page-subject-bindings.md).
D18's release-bound composition, current-serving admission, adverse-first
convergence, and Phase 5 execution boundary are recorded in
[ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).
D19's organization-owned Ministry Assignment subject, effective-dated Party
memberships, independently authorized Support Workspace access, and
Phase-21-owned optional Support Binding are recorded in
[Phase 22 research evidence §42](./phase-22-public-ministry-pages-research-evidence.md#42-ratified-d19-research--organization-owned-ministry-assignments-and-separated-support-access)
and
[ADR-0136](../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).
D20's exact family catalogs, D3 section offerings, bounded authoring experience,
source/edit authority, release pinning, and fail-closed candidate behavior are
recorded in
[Phase 22 research evidence §43](./phase-22-public-ministry-pages-research-evidence.md#43-ratified-d20-research--two-small-code-owned-page-family-semantic-catalogs-under-d3)
and
[ADR-0137](../../adr/0137-two-bounded-page-family-semantic-catalogs.md).
D21's complete surface census and adoption coverage, incremental private
preparation, compatible-legacy boundary, production-shaped shadow, one current-
reproved CAS authority transition, quiet role-specific UX, and no-fallback
post-cutover contract are recorded in
[Phase 22 research evidence §44](./phase-22-public-ministry-pages-research-evidence.md#44-ratified-d21-research--complete-public-ministry-surface-authority-cutover)
and
[ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).
D22's quiet disposable Public Page Operations Projection, three fixed
permission-filtered navigation views, source-owned root causes and resolution,
cause-to-impact grouping, finite owner actions, and prohibition on Page-health,
mutable close, and second-workflow authority are recorded in
[Phase 22 research evidence §45](./phase-22-public-ministry-pages-research-evidence.md#45-ratified-d22-research--quiet-derived-public-page-operations)
and
[ADR-0139](../../adr/0139-derived-public-page-operations-with-cause-owned-actions.md).
No current mock, `public.locations`, exact-coordinate map, browser filtering,
raw table/Realtime policy, independent family index, global metadata helper,
raw-id URL, original-filename serializer, fictional share URL, or inert Share
control, Session Replay, access-log-derived counter, or mock/financial
missionary Analytics, generic seven-block builder, free author-entered CTA URL,
mutable copied template, silent unknown-block omission, page-by-page authority
flag, mixed reader, fuzzy adoption, or destructive legacy rollback is
grandfathered. D23 Public Pages setup/settings is ratified as the exact
C-prime-R: one scope-first disposable summary over source-owned versions with
one owner-specific amendment at a time. D24 is ratified as one
attribution-preserving Staff-authored Page Revision path inside D1's sole
working head and the unchanged D4/D5/D2 review-and-release lane: staff edit,
review, release, reach, safety, and managed-fact authority remain separate;
active or submitted contributor work remains immutable and attributed; routine
staff edits remain quiet; and successor-only, current-reproved CAS prevents an
override, destructive restore, or last-write-wins path. See
[Phase 22 research evidence §47](./phase-22-public-ministry-pages-research-evidence.md#47-ratified-d24-research--attribution-preserving-staff-authored-page-revisions)
and
[ADR-0141](../../adr/0141-attribution-preserving-staff-authored-page-revisions.md).
The founder ratified D25 as the exact hardened C-prime-R. It keeps the design
database-minimal: actionability is derived
per action from current owner facts; one coalesced Payload recovery buffer sits
beneath the sole Page-and-locale head; deliberate sources remain immutable; and
no D25 table, status, queue, timer, tenant expiry matrix, or per-autosave event
stream is added. See
[Phase 22 research evidence §48](./phase-22-public-ministry-pages-research-evidence.md#48-ratified-d25-research--cause-gated-actionability-with-bounded-recoverable-editorial-work)
and
[ADR-0142](../../adr/0142-derived-editorial-actionability-and-bounded-recovery.md).
The founder ratified D26 as the exact hardened A-prime-R. One calm statement
beside the existing final action records the actual current submitter's exact
candidate-bound Public Content Sharing Attestation; it adds no checkbox, D26
table, Page Boolean, rights workflow, public-render lookup, inherited evidence,
or staff verification duty. Missing granular affirmative Phase 10 records alone
create no Page checklist, while known objections, `do_not_publish`, restricted-
person rules, and stricter current safety remain non-overridable. See
[Phase 22 research evidence §49](./phase-22-public-ministry-pages-research-evidence.md#49-ratified-d26-research--one-calm-page-content-sharing-attestation)
and
[ADR-0143](../../adr/0143-candidate-bound-public-content-sharing-attestation.md).
D27 is ratified as one Site-scoped Page with exactly one
Missionary and one Project/Campaign family presentation pattern per Site,
independent Page × locale editorial releases, public fallback disabled, and a
complete-cohort compatible family-head switch fenced against concurrent D2
release changes rather than copied layout or per-Page fanout. This is an
explicit amendment to the current multi-decision presentation
composition. See
[Phase 22 research evidence §50](./phase-22-public-ministry-pages-research-evidence.md#50-ratified-d27-research--one-family-pattern-with-independent-locale-content)
and
[ADR-0144](../../adr/0144-site-family-presentation-with-independent-locale-releases.md).
Implementation, migration, and production activation remain separate work
governed by the published issue graph and each ticket's live blockers.

---

<a id="phase-23"></a>

### Phase 23 — CMS / Site Planner Dynamic Content Parity (`web-studio-cms`)

**Status.** `PRD exists` — implementation-ready planning, not implemented.
Phase 23 D1–D36 were founder-ratified and formally closed on 2026-08-24. The
[Phase 23 PRD](./phase-23-web-studio-cms.md), active
[`add-web-studio-cms` OpenSpec change](../../../openspec/changes/add-web-studio-cms/proposal.md),
and parent specification issue
[#1339](https://github.com/Asymmetric-al/core/issues/1339) carry the approved
implementation contract. The
[decision log](./phase-23-web-studio-cms-decision-log.md) and ADR-0145 through
ADR-0180 preserve its founder authority.

**What this phase is (plain language).** Grow Web Studio into the tenant-safe
ministry publishing product: Page-local content and explicit reuse, staged
hierarchical paths, curated navigation, one coherent Site Plan release,
recoverable editing and scheduling, dynamic lists and search, a Content
Library, exact-locale editorial lineages, whole-Site Preview, forms, public
media, portability, content health, and production qualification. Staff use an
Asym-owned ministry UX; Payload remains the content engine behind those
authority boundaries.

**Why it sits here.** Its hard dependencies remain Phases 2, 3, and 5. Phase 10
and Phase 22 qualify only the public operational sources that consume their
safety and publication contracts; they do not gate the ordinary CMS
foundation. Later owner phases may supply certified integrations without
becoming hidden prerequisites for the Phase 23 core.

**What it covers.**

- **One coherent Site release (D1–D10):** deterministic Page-local composition,
  explicit reusable sections, staged hierarchical Public Paths, automatic
  same-Page route continuity, curated Link-or-Group navigation, bounded
  semantic Page families and starters, tenant-distinct certified presentation
  packages, and complete-cohort activation through one sealed Site Plan.
- **Bounded editorial operations (D11–D13):** one versioned Rich Text Profile
  with typed video embeds, recoverable autosave with one active editor, and
  exact-revision publish or unpublish appointments executed through the D1
  activation authority.
- **Discoverable and recoverable content (D14–D25):** one versioned Dynamic
  Source Catalog, three Page-local curation strategies, link-native public
  windows, one derived public-search projection, authority-free Content Library
  folders, controlled topics and saved views, reference-aware Trash,
  explicit-start exact-locale lineages with no silent fallback, independent
  Copy to Site drafts, one exact public audience with app-owned authenticated
  surfaces, and immutable whole-Site Preview candidates.
- **Governed inputs, custody, operations, and production admission (D26–D35):**
  purpose-bounded forms and domain-owned routes; a Tenant-wide public-media
  catalog over immutable byte-and-rendition custody; release-bound search and
  sharing profiles; governed exports and staged imports; Supabase Auth as the
  sole human authority with governed engine diagnostics; quiet, exception-first
  Content Health; advisory accessibility assistance with source-owned release
  invariants; a provider-neutral capacity profile qualified for Vercel; a
  release-bound Payload v4 major-line commitment; and a census-gated,
  one-authority pre-production cutover.

**Boundaries & guardrails.** The D1 Site Plan compiler and atomic activation
fence own every public generation change. The single `PublishedContentReader`
remains the public observation seam. Supabase Auth remains authoritative for
human identity and access. Payload, Inngest, Vercel, Supabase Storage, search,
email, and other providers are qualified engines or adapters, never parallel
product authorities. No CMS configuration, plugin default, preview, autosave,
schedule, import, health signal, or diagnostic may bypass tenant isolation,
source-domain safety, exact-revision publication, or release invariants.

**Remaining founder questions.** None. D36 formally closed Phase 23. Provider
qualification, migration census, capacity evidence, accessibility evidence,
test matrices, and rollout proof are implementation evidence requirements, not
new product decisions.

**Public Ministry owner seams.** Phase 22 D8 still owns typed Ministry
Page route dispositions and the uniform privacy-safe response; D13 owns exact
scope Directory Projection, query, family, cards and topology; D14 owns release-
bound metadata and manifests. Phase 23 consumes these through qualified owner
contracts and cannot invent cross-page successors, duplicate public membership
or override D2 or Phase 10 safety.

**Phase 24 D59 integration.** Phase 24 owns the ordinary self-service Site-
brand management experience and complete bounded Site Brand Versions; it does
not create another renderer or serving head. Under Phase 23's adopted
Presentation Package/Public Site Generation contracts, Phase 24 consumes their qualified presentation choices and release authority. Staff-supplied executable uploads and runtime scripts remain prohibited. Phase 42 HA-A2/A4 now explicitly supplies the ministry-controlled conventional source lane into independent D9 admission; ordinary editors need no source tooling, and authorized source managers gain no publication or CMS authority from repository control. The complete Asym authoring shell preserves the governing Base Maia/Base UI contract.

**Phase 42 bounded successor.** HA-A1 explicitly uses D7’s reserved composition evolution seam for qualified ordinary-Page composition/2 Stack/Split/Grid. Flat v1 stays valid without automatic wrapping or retroactive limits; Article and specialized Phase 22 grammars remain unchanged. HA-A3 adds a replaceable isolated composer over the same canonical document, D12 save and D25 review owners. Native Phase 23 must remain usable without Phase 42, Git delivery or optional Workflow Studio; see [the complete successor contract](../web-studio-hybrid/README.md).

Phase 24 D66 governs public Site Locale publication; Payload localized
status remains experimental/default-off editor convenience and never Core's
readiness or serving authority.

---

<a id="phase-24"></a>

### Phase 24 — Full Multi-Site, Language & Currency Management (`multi-site-management`)

**What this phase is (plain language).** Phase 2 built the Site, locale, and
currency primitives; it also records entry method and source code as
independent giving-attribution context, but Phase 24 does not manage those
axes. This phase builds the **staff management product** on the Site/locale/
currency primitives: run a second branded site, add a domain and watch it
verify, enable a locale and see translation status, and configure currencies —
all self-service in Mission Control/Web Studio.

**Why it sits here.** After Phase 23 (site management UX lives in the
Studio shell) and Phase 2/5 (primitives + runtime).

**What it covers.**

- **Site management**: create/configure branded sites (SiteStacker's Site
  Channel mental model: per-site domains, templates, language, content
  sharing), complete bounded Site Brand Versions and defaults, and one shared
  Tenant-wide checkout flow/product structure with Site-scoped brand, currency,
  and suggested-amount facets. Every financial route is prospectively bound to
  one exact Legal Entity, Designation, SettlementAccountBinding, environment,
  and currency lane; a Site supplies presentation and entry context but never
  defines financial ownership.
- **Domain lifecycle**: private provider/platform preview hosts during setup;
  publicly activated Sites use exact Tenant-controlled custom domains added/
  verified via the Vercel Domains API with **async
  verification status UX**. Provider domain APIs are rate-limited, so Core
  coalesces and queues checks, honors current response limit/reset headers and
  `429` backoff, and presents plan/endpoint limits as source-labelled evidence
  rather than product constants. Automatic SSL and fail-closed unknown-host behavior
  (Phase 5).
- **Localization management**: stable Site Locales per Site, exact translation
  status visibility, private preparation/production-faithful preview, and
  proof-gated explicit public release. Exact public locale routes never use a
  Site-wide cross-language content fallback; independently current equivalents
  may be linked explicitly. Phase 17 separately owns its permitted whole-
  message fallback and per-locale overrides.
  D13 public discovery always requests one exact
  current Site locale and pins its declared search configuration or literal-
  token mode. A general CMS fallback chain cannot make a missing translation,
  legal name, unsafe source language, or cross-locale Page Release searchable.
  D14 additionally consumes only the exact verified Site host and admitted
  locale for canonical URLs, reciprocal alternates, sitemaps, public Update
  permalinks, card media, and cache identity. An unverified domain, provider
  verification, IndexNow acceptance, or general fallback never establishes
  reach, search readiness, or locale admission.
  Phase 22 D16 may create only a reviewed writing suggestion for an already
  existing exact English-locale working revision. Its **Translate to English**
  action never enables a locale, creates a locale record or route, marks
  translation complete, chooses fallback, establishes an alternate, or proves
  release/publication. Deliberate **Use English draft** may create only an
  ordinary D1 successor draft in that existing locale lineage; Phase 24 remains
  authoritative for every locale and release fact.
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

**Phase 24 D57 resolution.** The authenticated Donor Portal launches only on
one current verified Tenant-controlled HTTPS host per Tenant and environment.
It is Tenant-wide rather than Site-owned; all donor-facing identity and portal
surfaces are Tenant-brand-native and provide no visible Asym co-branding or
`asymmetric.al` fallback. Host and branding never establish authorization, and
required legal, merchant, processor, payment, security, and accessibility facts
remain truthful.

**Phase 24 D58 resolution.** That one portal uses one current Tenant Donor
Account Brand across sign-in, claim, recovery, errors, navigation, settings,
and cross-Site history. The Default Site and entry Site never reskin the
account; a verified same-Tenant Site may appear only as secondary attribution
or a validated return action. Customization stays inside the shared accessible
product structure, brand never authorizes or replaces legal/financial truth,
and no failed asset or incomplete draft may fall back to Asym, GiveHope,
another Tenant, or a Site brand.

**Phase 24 D59 resolution.** Each Site has complete immutable Site Brand
Versions for its public website and public-giving presentation. Ordinary staff
controls are expressive but bounded to approved identity assets, dedicated
semantic brand roles, compatible typography, and finite purpose-named choices;
they contain no runtime code or unrestricted styling. Starting from an exact
compatible Tenant Donor Account Brand projection creates an independent draft,
never live inheritance or Site authority for the account brand. The applicable
public-Site release authority pins one exact qualified version; drafts and
failures have no public effect, and D59 creates no second renderer, theme store,
serving head, or approval workflow. Navigation,
content, media, account, message, legal, payment, and authorization owners keep their facts. Phase 42’s finite Page-instance layout/settings remain on the editorial axis; its source deployment does not publish this Site Brand Version or change the current locale cohort. The existing D1/D10 and D59 release paths remain controlling.

**Phase 24 D60 resolution.** Each applicable Site setup/readiness view shows one
quiet, read-only **Messages** summary derived by Phase 17 for the exact current
Site capabilities and Site Locales. It preserves exact Ready, compatible-
fallback, and attention outcomes; shows an explicit unavailable state rather
than stale green; groups exceptions; and offers one authorization-safe action
into System Messages. Phase 17 remains the only configuration, readiness,
provider-evidence, repair, and audit owner. The Site surface copies no settings,
provider enums, scores, polling, or mutation controls and creates no readiness
authority. Core website activation remains independent; only an exact
capability owner may declare and re-prove its own message dependency.

**Phase 24 D61 resolution.** A Site with several enabled donor presentment
currencies uses one provider-neutral, country-level suggestion only for an
empty giving intent. The exact current donor-visible set is the intersection of
Site policy and payments-owned qualification for the complete Tenant, Site,
Legal Entity, Settlement Account Binding, connected account/environment,
cart/route, cadence, amount, and payment-method context. Donor choice wins for
that intent; one cart remains one currency; the accepted contribution and any
recurring agreement freeze it. Locale, browser language, URL, profile, cookie,
Site default, provider global support, or location never authorizes currency or
changes a nonempty cart. Missing/ambiguous location uses the qualified Site
default; if it is unavailable, the donor explicitly chooses another qualified
currency or Giving fails closed when none exist. D61 adds no GPS prompt,
third-party geocoder, profile preference, country rules, currency URL, FX
engine, Stripe Adaptive Pricing/Checkout Sessions dependency, retained
settlement lane, or accounting setup.

The donor sees one labelled ISO-code-plus-localized-name control before amounts
when multiple currencies qualify, or static currency text when one qualifies,
with the code repeated through authorization, confirmation, receipt, and
history. Staff manage only default plus enabled intent, current availability,
prospective impact, and one owner action in the Site workspace; payments owns
qualification and Phase 20 keeps settlement/accounting consequences separate.
No non-USD cohort may activate until the exponent-aware money seam, exact
connected-account binding, structural single-currency cart, currency-bearing
idempotency, fee/preset/payment-method correctness, and every downstream money
projection pass production-shaped proof.

**Phase 24 D62 resolution.** Adding a presentment currency is one compact step
inside the Site **Currencies** card. Selection automatically runs a read-only,
Payments-owned qualification for each current live Site route/giving-mode
cohort; there is no separate wizard, checklist, provider matrix, test charge,
or provider-setting mutation. Staff see one truthful result—ready for the named
modes, payment setup needed, unavailable for the Site, or temporarily unable to
check—and one cause-owned next action. One explicit save changes the complete
Site policy only when at least one route qualifies, the Site-policy revision and
exact qualification fingerprints still match, and a new default covers every
current entry that relies on it.

Qualification binds the exact Tenant, live environment, Site financial route,
Legal Entity, Settlement Account Binding, connected account/charge topology,
currency, gift mode, admissible rail, canonical money implementation, pinned
provider contract/configuration, source generation, and expiry. It proves a
stable offering envelope, not a donor payment: checkout must still re-prove the
actual cart, amount, cadence, method, limits, binding/account, and currency
before any provider object. Sandbox success, Stripe's global currency list, a
past gift, or Site intent never proves live readiness. Unknown, stale, drifted,
or contradictory evidence removes only the affected currency/mode from new
donor availability while preserving selected Site intent and all carts,
accepted gifts, recurring agreements, provider evidence, receipts, refunds,
ledger, settlement, and accounting history. Ordinary CAD-presentment to
USD-settlement adds no foreign bank/accounting prerequisite or FX engine.

**Phase 24 D63 resolution.** A donor may deliberately change a still-editable
cart from CAD to another currently qualified currency without losing its
purpose. A pristine cart changes immediately. Once any entered/prefilled amount,
fee choice, derived total, payment selection/input, authorization, client
secret, provider session, or other currency-dependent state exists, Core leaves
the complete CAD cart untouched and first uses one accessible consequence-
specific confirmation. The target is re-proved for every current cross-Tenant/
Site line, Legal Entity/payment group, cadence, route, account/environment, and
qualification before commit; any stale/incompatible/concurrent result writes
nothing.

One server-owned successor revision preserves only revalidated currency-
independent designation/order, cadence, attribution, contact, tribute,
anonymity, comments, consent, and form intent. All amounts, presets, allocations,
fee-cover meaning, totals/amount-derived claims, payment/method/mandate/
authorization state, browser payment state, old client-secret meaning, and
attempt identity clear by default. No FX lookup, rounding, or digit carryover
occurs. The donor sees **Change currency to USD?**, initially focuses **Keep
CAD**, and after success sees a persistent **Currency changed to USD. Enter your
gift amounts in USD** instruction with focus at the first amount. Provider-
attempt, confirming/authenticating/processing/capture-pending, successful, and
outcome-unknown states are immutable or reconciled before a separately
identified successor; accepted gifts and recurring agreements never change
currency. Draft amount absence is valid only while editable—review, acceptance,
provider creation, recurring authorization, and every money projection require
checked target-currency amounts.

**Phase 24 D64 resolution.** Suggested gift amounts are reviewed native Site
fundraising presentation, not FX, Stripe pricing, or money truth. Operational
Postgres owns one immutable versioned Site Suggested Amount Set for each exact
Tenant, Site, ISO presentment currency, and one-time or exact enabled recurring
cadence. A set contains zero to six unique positive exponent-correct amounts in
ascending order and selects none automatically. Ordinary open giving always
offers a custom amount.
Missing or intentionally empty sets therefore produce a clean custom-only flow
only while the exact context remains qualified, not a donor-facing setup error.

The Site workspace shows compact per-currency summaries and one in-context
frequency-tab editor with the shared donor preview. One authorized expected-
revision save is the review and applies prospectively to new pristine views;
there is no matrix, wizard, CMS publication, separate approval, mandatory
reason, Stripe/provider call, FX source, AI personalization, or live inheritance.
Core never copies monetary digits across currencies or frequencies. Phase 13
owns and revalidates the donor-selected Money; changing a set never rewrites a
selected cart amount, accepted gift, recurring agreement, receipt, refund,
ledger, or accounting history. D61/D62 still determine currency availability,
Phase 16 still owns cadence policy, and D63 loads a target set without silently
selecting new money after a confirmed currency clear. Amount-dependent impact
claims remain outside D64's numeric contract.

Deliberate currency/cadence disablement retires the corresponding set from
public use without deleting history; a later re-enable must explicitly reaffirm
former values through a successor before presets return. A transient D62
qualification pause preserves reviewed Site policy and resumes only under D62's
same exact proof, never through a custom-input bypass.

**Phase 24 D65 resolution.** A Donor Gift-Schedule Transition changes one
unaccepted editable cart line between one-time and any exact enabled Phase 16
cadence, or between two exact cadences. It preserves the same revalidated
destination/purpose and every unrelated line, but clears the affected amount,
source schedule details, amount/schedule-derived claims and the smallest
complete dependent fee, payment, authorization, group/cohort and execution-plan
state. It never carries digits, maps D64 preset position, substitutes another
destination, edits an accepted gift/agreement, or performs provider proration.

Pristine unanswered changes are immediate. Any material donor, fee, payment,
authorization or provider state keeps the complete source cart authoritative
until one accessible consequence-specific confirmation and either an
authenticated owner-scoped CAS transaction or a server-revalidated idempotent
guest successor result proves the exact target context. A guest cart remains
client-only and replaces local state only after success/readback; Core stores no
guest cart or permanent donor history. Failure or stale/incompatible proof
changes nothing. Success makes the target amount explicitly unanswered, shows
its D64 set unselected, derives a fresh Phase 16 schedule with no copied source
dates, preserves sibling intent even when shared execution projections must
rebuild, and prevents every predecessor secret or provider attempt from
submitting. D65 adds no staff setting, capability, workflow, provider
subscription editor, or generic transition engine.

**Phase 24 D66 resolution.** The original Option 1 wording is rejected and
replaced because its `/fr-ca/...` examples, Site-wide ordinary-content fallback,
and universal Giving/account/message gate contradicted D14-D16, D57-D60, and the
fixed `/lang/{exact-locale}` contract. The permanent direction remains private
preparation plus explicit proof-gated publication.

Site Platform must maintain one small, code-owned, versioned **Site Locale
Publication Contract**. Version 1 has exactly five core-website families:
trusted route/Site/host/locale/release identity; exact-locale homepage/frame/
Brand/Navigation/language control and invoked support/privacy/legal links;
known-Site not-found/error/unavailable/recovery; complete exact-locale
presentation of every applicable member of those presentation families plus
direction/script/font/bidi/responsive/accessibility correctness; and canonical/
reciprocal-alternate/sitemap/robots/serializer/generation/cache closure. New
universal website dependencies must classify themselves in the same change or
CI fails. Tenants cannot add, remove, waive, score, or percentage-weight rows.
Each source owner retains its truth; the contract only composes exact current
evidence.

Staff may add, author, and production-preview a Site Locale privately. The
first default locale participates in the Site's one D6 **Go live** action; an
additional locale on a live Site receives one explicit **Publish French
(Canada)** action after a fresh Preview. When untranslated ordinary content
exists, the confirmation shows a numeric unavailable total only from a complete
safe aggregate; otherwise it says **Some** and never exposes hidden items. Every
generated label uses the complete Site Locale display label. A ready action creates one immutable
Site Locale Public Release through D66's minimal Public Site Generation
contract. D66 does not acquire D9 package admission or D10 design-activation authority: it consumes the accepted compatible generation owner. The adopted Phase 23 planning contract and Phase 42 successor remain separate from their original source PR merge state and from implementation qualification; no second generation owner is introduced. Publication uses current authorization, expected heads, semantic idempotency, short-
transaction CAS, business receipt, audit, and outbox—or changes nothing. The UI
shows **Publishing** until the exact public URL, language menu, canonical/
alternate metadata, and sitemap acknowledge the same generation. Search-engine
indexing is not part of convergence. A pre-commit failure keeps the first locale
private or preserves the prior head; after commit the new head is sole authority
and failed readback remains honestly **Publishing** with fail-safe serving.
Favorable publication commits the human-authorized head before enabling the
generation-bound admission projection; every withdrawal, suspension, or safety
revocation persists and acknowledges the adverse admission fence before its
head transition. Unknown fence outcomes reconcile before continuing.
After fence success, head failure/conflict/unknown keeps admission adverse and
the same durable command in **Needs attention** for forward reconciliation;
only an explicit reauthorized all-source safety proof may restore admission.

Ordinary missing stories do not block publication. Missing items remain absent
from French Navigation, site search, sitemap, and `hreflang`; only a source-
owned typed same-resource relation may place an explicit **Read this story in
English** link to its current authorized, non-source-revoked URL. D67
translation freshness remains a separate editorial fact. Exact French URLs never
substitute another Site Locale as field/resource/Page fallback; deliberately
authored multilingual passages remain valid with truthful `lang`/`dir`. D67
owns the serving policy for an already-published item that later becomes out of date.
Giving/address, Tenant account, Messages, receipts, currencies, payments, and
default-locale activation remain separately owned and nonblocking. Publication
does not enable or configure them. Publishing French does not make it the D16
default, and withdrawal never redirects to another locale or releases route/
history.

Phase 2's `default_locale`/`allowed_locales[]` become one-way migration
projections, not dual owners. Relational writers remain off until one cutover
fences every legacy array mutation; rollback never re-enables array writes.
Phase 24 normalizes stable same-scope Site Locale identity as A1a's bounded
repeated-facet exception; the sole Public Site Generation head remains serving
truth, with no `is_ready`/`is_public` Boolean or checklist table. Site data is
isolated one deployment environment per Supabase project/database; a future
shared database must add environment to Site and every dependent key/FK in one
migration. Operational tables require full-scope keys/FKs, restrictive
deletion, explicit grants, FORCE RLS, matching structural `USING`/`WITH CHECK`,
and command-only writes. Direct DML is revoked from browser and secret/service-
role paths; Phase 12 PDP/PEP owns capabilities while RLS remains coarse Tenant/
structural isolation. Fresh human `sites.publish_locales` authority governs
first activation and whole-locale lifecycle/contract transitions. Later
resource publications follow the Tenant's source-owned manual, automatic, or
scheduled publication policy and add no second locale approval; an NHI may
mechanically process only a command already authorized by that applicable
policy. Payload owns exact-
locale drafts/publications and is queried with fallback disabled; its role's
RLS bypass, experimental localized status, and internal version are contained
behind access hooks and the published-reader boundary.

Vercel publication is runtime/data driven: no Domain API call, deployment,
`generateStaticParams` inventory, Proxy database/content lookup, or language-
negotiation cache variant. Keys bind Tenant/environment/Site/host/stable locale/
generation/resource/renderer; scoped tags invalidate only. Private, unknown,
withdrawn, preview, and adverse results are `no-store`; generation-bound,
adverse-first Edge Config (or an equivalent non-React seam) performs pre-stream
admission but never sole authorization, and runtime/head/existence rechecks
produce real non-success status before streaming.
The admission adapter reuses one bounded A6 lookup and stores only compact
host/Site/locale/generation/status coordinates; it must prove current provider
size/read/write/cost limits, remains partitionable/replaceable, and denies on
exhaustion rather than scanning Postgres in Proxy or broadly allowing.
The current static English metadata/root layout, unprefixed catch-all, host-only
CMS cache, broad locale tag, and 24-hour sitemap cache are migration blockers,
not accepted runtime behavior. See ADR-0187.

**Phase 24 D67 resolution.** Every target revision has immutable **Translated**,
**Independently authored**, or **Legacy · source unclassified** provenance. Only
Translated pins exactly one explicit same-scope, distinct-locale Translation
Basis and source-owner translation-input identity containing a compatible
canonicalization profile/version plus digest. Independent has no freshness
comparison; a currently public Independent target reports **Current** (no
translation follow-up) with **Independently authored** detail. Legacy is **Could
not be checked**. A current authoritative source publication with different
semantic input derives staff-only **Out of date**; an unproved profile
transition is **Could not be checked**, never compared by bare digest;
drafts, autosaves, future/rejected candidates, timestamps, cache age, tasks, and
unrelated source changes do not. Ordinary drift leaves the reviewed target route,
content, Navigation, search, sitemap, reciprocal alternatives, and authorized
language links public. Provenance and lineage are explicit, never inferred.

Only a registered safety-governed source successor asks its authoritative owner
whether prior translation-dependent public use may continue or must be revoked.
That one source-owned, unselected consequence choice stays in the existing source
publication review and creates no generic risk tier, approval workflow, reason,
task, timer, notification, or translation-quality decision. An adverse result
uses D66's server-derived smallest complete closure and fence-first transition;
a resource successor omits only the complete affected resource closure, while a
universal-frame dependency may deny the locale. The compact generation fence may
temporarily deny the containing locale but never stores per-Page truth, selects a
fallback, or becomes a favorable head. See ADR-0188.
Every safety-governed unpublish/retire/tombstone/delete must likewise resolve
prior public use or complete adverse fencing, and referenced evidence cannot be
hard-deleted.

**Phase 24 D68 resolution.** The promised **fallback-chain configuration** is
renamed **Suggested translation sources** and narrowed to one optional partial
same-Site order for staff authoring. It ranks currently eligible sources in
explicit, unselected **Copy from…** and **Compare with…** choosers; every omitted
eligible source remains available. The order grants no access, establishes no
locale equivalence or Translation Basis, changes no provenance/freshness, and
has no public route, alternative, publication, generation, search, SEO, cache,
Vercel, message, Giving, currency, receipt, or payment effect. `sites.manage_locales`
owns one expected-revision save; source/target commands reauthorize and pin the
actual revision. Empty/unavailable preference leaves the ordinary chooser
usable. See ADR-0189.

**Phase 24 D69 resolution.** For each exact D68-eligible source locale, **Copy
from…** may offer at most two distinct, unselected logical heads: **Latest saved
draft**, the exact current server-acknowledged D12 Working Revision when
ADR-0191-qualified, and **Current published version**, the exact source revision
selected by D1's current authorized public generation when it also qualifies.
Each exact head qualifies before enabled-candidate deduplication; equal compatible
copy inputs collapse to the public row only when the public head qualifies, so an
unknown public head never hides a qualified private one. Provider latest/history/status, unsaved or
outcome-unknown work, schedules, and arbitrary versions are excluded.

Selecting a private head freezes/reuses an immutable retention-protected Copy
Source Checkpoint. One trusted resource command reauthorizes exact source/target
scope and atomically creates checkpoint if needed, one private target, Translated
provenance, D67 Basis, audit, and receipt—or none. It copies only the finite
source manifest, never overwrites, and creates no policy, workflow, task,
notification, version browser, public resolver, Vercel, Giving, currency,
Stripe, or message behavior. A target whose Basis is supported only by private
source evidence cannot first publish as Translated until D1's current
authoritative source publication pins that same exact source revision and
compatible copy identity, or D67 records a reviewed successor Basis against the
actual current publication. Compatible readers must retain the derived blocker
and D67 remediation after the private writer is disabled. See ADR-0190.

**Phase 24 D70 resolution.** Private-draft Copy requires exact-revision,
purpose-specific **Copy Qualification**, not publication readiness. After D12's
side-effect-dark acknowledgement, source owners asynchronously create or reuse at most one durable immutable content-free
completed revision result for an exact revision/digest and versioned source-
contract digest covering the supported schema/profile/manifest/canonicalizer/
qualifier/block/node/package versions and limits,
without delaying Save; a retained-reader-qualified legacy D1 current publication
may receive the same source-owned evidence. Missing/in-progress/failed work is
retryable unknown, and Check again idempotently requests the same identity through
source-owned durable work—not a revision attempt history or readiness workflow.
Pending work coalesces to current private/public heads and revisions referenced by
a retained D69 Copy Source Checkpoint/Basis;
superseded unretained autosaves do not build an unbounded queue.
The picker combines it with batched live authorization/
lifecycle/safety/reference facts, and the selected command reloads the exact body
and reruns lossless proof. Unknown, corrupt, over-limit, unclassified, silently
omitted, fallback-derived, unauthorized, cross-scope, ambiguous, or zero-effect
input cannot create a Translated target. Public source heads pass the same proof.

Source-owned Details to finish, Suggestions, Technical issues, and unavailable
checks remain truthful, visible, and non-gating when Copy qualification succeeds.
They never transfer to the independently validated target or become public truth.
D70 adds no Ready-for-translation state, workflow, capability, setting, issue
ledger, generic validator, external scanner, eager candidate-body scan, public
runtime, Vercel, Giving, currency, Stripe, or message behavior. D1/D66 retain
publication authority. See ADR-0191.

**Phase 24 D71 resolution.** For one exact authorized viewer, target, Copy
action, and D69 private/public head, the server derives one nonpersisted **Copy
Source Disposition**: qualified, proved unavailable, qualification unknown, or
not disclosable. Only qualified heads enter the unselected **Source version**
RadioGroup. Immediately afterward, one neutral **Unavailable source versions**
section renders authorized unavailable/unknown heads as ordinary semantic list
content with exact locale/head identity, bounded content-free reason, and at
most one independently authorized cause-owned action. It exposes no disabled
radio, selectable row, count, raw error, provider detail, live static row, or
nondisclosable-head distinction.

Candidate and status members derive from one authorization/head snapshot and
cursor; paging retains locale groups that contain only authorized status heads.
Check again and source handoff reauthorize the displayed exact current D12/D1
lane head and never silently substitute its successor. Zero qualified heads omit
the RadioGroup/disabled Create control and make **Start {target locale} blank
draft** the direct primary Sheet-footer action. D71 persists nothing, creates no
second resolver, query, workflow, retry store, poller, schema/RLS change,
Vercel/Stripe call, or public behavior, and must meet D69's p95 300 ms budget at
the Site Locale owner's maximum supported status-heavy catalog. See ADR-0192.

**Phase 24 D72 resolution.** Every publicly activated, nonretired Site retains
exactly one current **Primary Site Domain**, including while D7 suspends
serving. It alone may serve favorable website content and supplies the origin
for new canonical/internal/alternate/sitemap/social/feed/share/public-generation
output. Private pre-activation Sites may have no public role; retired Sites keep
history without favorable roles. No live Tenant website uses an Asym, Vercel,
or other platform-branded public fallback.

A Site may have zero or more explicit **Redirect Site Domains**. They never
serve duplicate website content or become another origin. The staff-facing
state is **Redirects website visits**: Core's trusted host/router projection
may send only route-owner-qualified `GET`/`HEAD` navigation one hop to the exact
final current-primary destination. It composes D16 root directly, prevents
source-fragment inheritance, and uses only owner-allowlisted query context.
Giving/checkout, protected/auth/callback/API/control, and every other source-
owned route run first and retain D9–D15/their owner's exact behavior. Vercel
whole-domain redirects, serving aliases, arbitrary forwarding, fallback homes,
chains, and implicit apex/`www` activation are prohibited.

Operational Domain authority—not CMS `primaryDomain`, proposed
`primary_domain`/`alias_domains[]`, DNS, TLS, or provider state—owns canonical
hostname identity, platform-wide current uniqueness, complete Site scope,
role/lifecycle, immutable public history, CAS heads, receipts, and provider-
evidence references. The logical model is relational with one-primary
cardinality, restrictive grants/RLS/privileged parity, provider work outside
transactions, adverse-first fencing, and one bounded admission lookup under
Phase 5's 15 ms launch p99 budget after capacity proof. The compact **Site →
Domains** workspace separates public role from setup/serving health, shows safe
IDN identity and bounded route-owner exceptions, suggests but never selects
`www`, and exposes one authorized next action. **Not used for website** applies
when the website role is absent but an independently owned public route may
remain; **Not public** requires complete owner proof of no favorable Core route.
See ADR-0193.

**Phase 24 D73 resolution.** Every exact replacement of an existing Primary
Site Domain requires one initially unselected former-primary website choice:
**Redirect eligible website visits — recommended** or **Stop website use on the
old domain**. There is no implicit apex/`www` exception: current or historical
redirect/cache behavior must prove promotion and inverse mapping loop-safe.
The choice changes no Giving, checkout, auth, callback, API, protected, or other
source-owned route; the owner supplies its direct/unavailable/successor/block
outcome. Known messages, documents, QR codes, analytics/search properties, and
external placements are advisory and explicitly incomplete—Core builds no URL
crawler or universal placement graph.

One focused Base Maia review shows Current/New, origin and existing Redirect
effects, authorized owner outcomes, incomplete advisory evidence, the
RadioGroup, and **Make {new host} primary**. Stop means no Site website role,
not erasure or provider detachment. Primary replacement privately compiles the
exact D1/D66 current public-locale origin successors and advances the Domain/
public-head cohort in one expected-head command with receipt/audit/outbox.
Stable equivalent website routes may use owner-approved `308`; the mutable root
uses D16 `307`; every redirect is one-hop, `no-store`, `no-referrer`, and
route-aware. Vercel remains evidence/transport and receives no whole-domain
redirect, force, detach, DNS change, or rollback authority. Later provider
disconnection remains the separate D74 operation. See ADR-0194.

**Phase 24 D74 resolution.** One exact Tenant-controlled custom hostname may
disconnect from one Site through Tenant self-service only after a complete
current finite owner manifest proves no positive hosting dependency. Historical
facts and D9–D15 reservations survive and do not falsely block. The eligible row
says **Not public · Connected for hosting** and offers **Disconnect from this
Site**; one compact confirmation warns that registration, DNS, renewal, email,
and history remain unchanged and DNS still pointing to Vercel may produce an
external error. The commit action is **Disconnect domain**.

One reauthorized CAS transaction records the durable operation and establishes
a monotonic Disconnecting barrier. Every public admission cohort must
acknowledge the adverse host generation before a sealed worker removes exact
Core-controlled provider routing outside the transaction. Only authenticated
current absence permits a second transaction to end the current Site-binding
interval and platform-wide occupancy claim. Ambiguity retains the fence/claim
and shows **Disconnection needs attention**. `sites.disconnect_domains` is the
separately protected human effect included in the standard Domain Manager
bundle. D74 never cascades across hosts/Sites, deletes provider-account/domain
ownership, changes DNS/registration/email, transfers or force-moves a domain, or
authorizes future reuse. See ADR-0195.

**Phase 24 D75 resolution.** After D74 final release, every Tenant may use the
ordinary Site → Domains **Add domain** flow. An unproved verification attempt is
private, nonexclusive, provider-dark, and reserves nothing. **Verify domain
control** shows one Core-issued, seven-day, server-generated 256-bit exact-host
TXT challenge with Type/Name/Value copy actions, absolute expiry/last-checked
times, bounded automatic checks, one **Check again**, and leave/resume. It proves
current technical DNS control—not legal ownership or public readiness.

Immediately after trusted server DNS observation, one reauthorized short
transaction consumes the one-use challenge, proves D74 final/no current claim,
acquires the sole platform-wide hostname claim, creates a new private binding
generation, and records receipt/audit/provider outbox—or changes nothing. Two
valid claimants have one constraint-enforced winner; foreign/history outcomes
remain non-enumerating. Old bindings are never retargeted. No former positive
content/brand/locale/role/route/permission/provider/integration/donor/auth/cache/
client state follows; D9–D15 adverse reservations remain and run first.

Only after claim may Vercel hosting prepare without force/move. Core proof,
provider verification/assignment, TLS, DNS routing, Site readiness, and public
role remain separate; success is **Domain verified · Not public**. D75 reuses
`sites.manage_domains`, adds no reconnect/approval capability, and does not
solve a current live same-Tenant move or contested current claim. See ADR-0196.

**Phase 24 D76 resolution.** A still-connected hostname moves between two Sites
in the same Tenant through one prepared self-service successor, not D74→D75,
mutable reassignment, routine DNS reproof, support or provider control. Current
`sites.manage_domains` on both Sites prepares; `sites.activate_domains` on both
commits. Destination Primary/Redirect/Not-public is initially unselected; an
active source Primary needs a different eligible replacement; D6/D73 and all
critical D9–D15/security owners retain their exact authority.

The hostname remains globally occupied by the same Tenant. One command first
establishes/read-backs an adverse Moving generation, then appends a new target
binding and atomically advances the private host plus both Sites' Domain/public
heads. A bounded neutral gap is honest; two favorable/mixed Sites or a literal
zero-downtime promise are not. Launch performs no Vercel/DNS/TLS/registrar
mutation because all Sites share the donor project. The full-page Base Maia
review has two entry points, explicit consequences, durable progress/receipt,
and no content, Giving/auth, Stripe, email or provider-project migration. See
ADR-0197.

**Phase 24 D77 resolution.** Before that D76 barrier, one immutable **Domain Move
Route Review** reuses the existing small, versioned, code-owned D72–D76 critical
owner-family inventory and compares complete source/destination effective-host
route manifests. This is future contract reuse—current `develop` has neither the
registry nor authoritative manifests—and D77 adds no adapter framework. Missing,
unknown, stale, contradictory or blocking critical evidence stops the move.

One pure canonical comparison classifies source-only, target-only, exact
collision, current owner-qualified successor, redirect/history conflict, and
unknown outcomes. Source-only ordinary addresses automatically compile durable
real-not-found effects into the target binding generation; later destination
Pages cannot silently reuse them. Exact different-Page collisions remain
blocked until their owner publishes an accepted successor or the destination
changes path. The D76 page shows one compact **Existing web addresses** section:
only blockers open, qualified/not-found counts stay collapsed, and known
external placements are explicitly incomplete advice. Phase 5 remains the sole
runtime router; D77 creates no redirect console, crawler, workflow, pattern DSL,
query carry, money effect or Vercel/project rule. See ADR-0198.

**Phase 24 D78 resolution.** One exact D77 collision between different Site-
owned ordinary General Pages may be resolved only by an **Ordinary Page
Successor Qualification** issued through the existing Page route owner. Core
proves same Tenant/environment, exact locale, `general_page`, public audience,
exact Publication Reach, compatible safety, current public releases/routes/
generations, and protected-
owner exclusion. One authorized human then compares both exact public releases
and explicitly answers whether the target gives a visitor the same public
subject, substantive purpose, and intended task. The fixed-pair choice begins
unselected: use the named target for this address or keep the address
unavailable.

The relation is immutable, directional, path-specific, non-symmetric,
non-transitive, and bound to exact reviewed evidence. It stores a stable Page
identity, not a URL; copy provenance, slug/title/content/template/search/
analytics/AI never proves it. Pages remain independent and no purpose taxonomy,
redirect console, workflow, Page editor, provider rule, or money effect is
created. D76 alone may activate it. Same-path direct service requires a target
Primary; redirect-only roles or different paths compile one direct final clean-
`GET`/`HEAD` result to the Primary without source context carry. Before D76
activation, later target revisions require the same exact fixed-pair proof. See
ADR-0199.

**Phase 24 D79 resolution.** After D76 activation, a D78 relation pins one
sparse, opaque **Page Purpose Continuity Version** for the stable target General
Page and exact locale. It is a Page-owner same-subject/substantive-purpose/
visitor-task assertion, not tenant-authored purpose prose, taxonomy, Page family,
body/diff/hash/score/AI, or copied audience/Reach/safety/route state.

Only a candidate affected effective Page release whose exact meaning-bearing
Page/localized/Reusable Section/shared/global/reference dependency digest
changed adds one initially unselected choice to the existing D1 Publish review:
**This update keeps what this Page is for** universally preserves the current
version for every reviewed current relation; **This update changes what this
Page is for** requires a fresh independent private Page under D80. D80 leaves
the source version/relations unchanged and the target inherits none.
Draft/autosave/preview and delivery-only D1
rebuilds with the exact effective digest unchanged do nothing; Pages that never
had D78 predecessors have no D79 state/UX and terminal history remains inert.

One calm main-column **Historical addresses** panel shows truthful server-
derived status, an exact count only with aggregate authority, and permission-
safe detail. The Page owner makes one universal Page-level choice over every
reviewed current relation; each D78 relation remains independent and fresh
renewal still uses the exact fixed pair and both-Page authority. Restore/copy cannot revive or inherit
authority. Phase 5 consumes only D1's compiled direct/redirect/not-found effect;
there is no runtime purpose lookup, new workflow/capability, provider/money
mutation, or donor interstitial. An advanced-purpose candidate cannot publish
through the source identity.
See ADR-0200.

**Phase 24 D80-D84 resolution.** A D79 material-purpose candidate always continues
as a new Page; Core has no direct-only in-place exception or route-history
override. One contextual **Move saved changes to new Page draft** action uses the exact
acknowledged Page-owned candidate and D23's finite transfer compiler to create a
fresh same-Tenant/environment/Site/locale `general_page`, exact locale lineage,
Page-local identities, D12 Working Revision, and staff-reviewed D2 parent/path
claim. It is a private handoff, not Publish or generic duplicate.

The source public release, current/historical routes, continuity/D78,
Navigation, schedule, search/cache, and donor result remain unchanged; target
inherits none and has no public route before later ordinary D1. Reusable
Sections materialize; nonseparable shared-owner change blocks; no owner,
provider, operational, or money authority copies. The inline old/new review
uses title, Parent Page/Top level, and web address, with explicit target/source
outcomes. The same transaction records independently resource-scoped protected
Editorial/Placement checkpoint pins, appends clean source successors only for
changed Page-owned axes from exact D1 public pins, fences every old lease in the
sealed source pair, and leaves separately managed content unchanged. Safely
transferable content reaches the target; every repairable omission is listed and
the exact original remains in protected source History. D80-D81 adds no
workflow, purpose classifier, public resolver, larger critical-owner inventory,
or Vercel/DNS/TLS/Stripe mutation. See ADR-0201 and ADR-0202.

ADR-0203/D82 permits one narrow D2 exception to the ordinary occupied-path
rule. A sealed source **Draft-only Path Claim** may be atomically superseded by
a fresh target Placement and claimant-ownership occurrence/version for the
exact same canonical key only after
complete positive proof that no equivalent, under any claimant, has ever been
activated or admitted to a public/protected route effect and has no platform-
reserved, specialized source-owned, scheduled, safety, migration, or Trash
owner other than the exact current private source candidate claim. Private source Revision History is
preserved but is not current route authority; unknown history fails closed.
The D2-owned D82 disposition inside the D80-D84 transaction and semantic receipt
owns the succession with the exact source claimant before and exact target
claimant after, no visible gap or dual owner, exact replay, and no public/Vercel/
money effect. Later D2/Trash lifecycle
may supersede, protect, or release the target claim but never returns it
automatically to the source.

The existing Parent Page/Web address group shows source provenance, the full
tenant-branded URL, and private/not-live meaning; editing returns to ordinary
D2. No checkbox, modal, suffix, reservation service, transfer API, resolver,
redirect, or saga is added.

ADR-0204/D83 permits one completely qualified source-owned descendant closure
when cleaning the source ancestor changes derived private paths and their
corresponding breadcrumbs.
D2 server-derives and seals the exact same-scope closure; preserves every child
identity, direct parent, authored segment, sibling order, every existing
immutable History row, Editorial content, Navigation, permission, schedule,
reference, and public fact; may append only the qualified cause-labelled
derived-output successor required by accepted D2 storage; and changes only
exact private derived outputs/claim dispositions. High fan-out reuses D2's
bounded/resumable sealed plan/impact artifact and one D33-admitted atomic
business transition without a private closure head. Staff see an always-visible permission-safe affected address count,
plain live-site/Navigation non-change, and proportional mappings under the one
existing handoff action. Every stale, inaccessible, protected, independently
incompatible, or over-capacity closure uses its exact ordinary D2 owner action.
If that action cleans/releases the source root claim, D82 adoption ends and the
target address becomes an unreserved ordinary suggestion that may lose fresh
validation. No recursive child resave, authoritative partial batch, subtree transfer, literal-link rewrite,
workflow, route engine, or public-delivery/Vercel/money effect is added. See ADR-0204.

ADR-0205/D84 gives the fresh target one initial D2 sibling position without
transferring a source/provider rank or adding another question in the qualified
common path. The visible Parent Page or **Top level** choice resolves through
trusted D2 Site/root state, never null/caller inference. A position is
preserved only when immutable D2 placement-command provenance proves a tagged
start/between/end/only boundary. Under lock, D2 determines the sealed D81/D82/
D83 effects and their post-clean/pre-target final cohort, then validates that
boundary or resolves a positively recorded append-last default against the
same baseline. Missing/unknown provenance and stale explicit boundaries use
ordinary D2 review; neither silently appends. No immutable prior revision is
mutated; only sealed predecessor effects may advance affected heads, and D84
adds no collateral pre-existing Page parent/order write while preserving final-
cohort relative order. One read-only consequence row distinguishes reviewed
First/Last/Only/Between from default Last/Only, uses “at top level” when
applicable, safely separates structural calculation from detail disclosure,
and states that Navigation/live website do not change. Boundary IDs obey the
handoff privacy/retention/tombstone contract. Provider ranks, raw Payload
`orderable`, imports, current adjacency, and drag telemetry are never intent or
authority. The qualified same-database Payload adapter may persist the command;
D84 adds no native reorder authority, capability, workflow, selector, public/
D4/Vercel/external-provider/donor/money effect. See ADR-0205.

The three original Phase 24 grooming questions—Donor Portal host, brand depth,
and outbound-message readiness presentation—are resolved by D57-D60. D84 closes
the D78-D84 ordinary-Page continuity/material-purpose branch. Before another
founder question is added, the phase requires a complete decision-to-spec
coverage audit and consolidated OpenSpec/PRD synthesis; implementation details
or already-separated owner facts are not new grooming decisions. The former
D56 access-profile withdrawal-authority question remains explicitly deferred
to its Phase 12/17 activation boundary.

---

<a id="phase-25"></a>

### Phase 25 — Donor Dashboard Depth (`donor-portal-depth`)

**Status.** The complete
[Phase 25 specification](./phase-25-donor-dashboard-depth.md), published as
[#1563](https://github.com/Asymmetric-al/core/issues/1563), records Q01-Q29's
ratified choices, Q30's accepted scope and F01-F14's final clarifications.
Its 242 stories, five normative contracts, source-clause traceability and
implementation task plan govern the adopted planning. The live 2026-09-16
delivery graph contains 88 native implementation issues #1565–#1652 under
#1563. No Phase 25 feature is implemented or activated by this reconciliation.

**What this phase is.** One calm organization portal lets donors care for their
giving, retrieve the right records, read Ministry Updates and change their own
account and communication choices. Personal giving is the neutral starting
point when available; an exact represented task keeps its independently
authorized financial context. Reading and personal contact choices remain the
acting human's own.

**What it covers.**

- **Home, Updates and ministry connection:** a useful neutral Home, bounded
  current Needs attention, a prominent complete Ministry Updates reader,
  independent Show and post-email preferences, finite source-owned
  notifications, an optional private ministry overview and a simple newsletter
  request. A newsletter request records interest without claiming external
  enrollment or delivery.
- **Recurring giving and Wallet:** native owner-reviewed changes, pause,
  resume, skip, cancel and fresh-authorized successor restart, with distinct
  card and ACH recovery. Add, selected-use replacement, new-gift preference
  and Remove are independently qualified effects; a provider default does not
  become product authority and hosted billing UI does not own these commands.
- **Giving records:** all currently authorized source-admitted History, exact
  filters and bounded exports; an explainable calendar-year monetary measure
  partitioned by issuer and currency; and one Receipts & statements destination
  over exact current canonical documents. No guessed impact, cross-currency
  total or portal tax calculation is introduced.
- **Account and Preferences:** email-first link/code entry with the selected
  qualified Google, Apple and Facebook direction; guided sign-in/contact email
  changes; ordinary Name and optional Phone; one optional personal mailing
  address; and direct purpose-specific communication choices. Authentication,
  claims, represented access and each communication purpose retain separate
  owners.
- **Relevant-only records:** fixed-total Campaign commitments, recorded
  employer-match progress and received DAF-grant awareness appear only under
  their exact admitted scope. IRA/QCD intent, source-case admission and
  acknowledgment remain distinct from DAF recognition and personal tax
  treatment. These paths create no general household or sponsor access.

**Dependencies and boundaries.** The dependency cell separates baseline/start
conditions from the mandatory producers for each affected consumer. Phase 9
contact, Phase 10 safety, Phase 12 authorization, Phase 14 recognition, Phase 16
recurring/Wallet, Phase 17 communications and Phase 18/19 documents are required
where the exact capability consumes them; they are not optional enhancements.
[Shared S04-S06](./phase-25-donor-dashboard-depth/contracts/shared.md#s04--exact-owner-amendment-and-predecessor-reconciliation-register)
assigns each source amendment and proof gate. Complete and qualify the exact
producer before dispatching its dependent consumer implementation; independently
safe work with satisfied prerequisites may proceed. This is not a global union
that blocks unrelated slices.

The Phase 22-24 rows now identify their existing proposed PRs rather than claiming
that no PRD exists. Their open, unmerged versions remain pinned research and
reconciliation inputs. The Updates, newsletter, public-content and host/brand
consumers that depend on them are **not dispatch-ready** until the affected
producer's final source contract is accepted and its required implementation and
qualification are established. A specification issue's readiness label does not
waive this gate, authorize copying a draft producer or imply permission to invent
a substitute. Activation still requires the consumer's own remaining S06 gates.

Q25 additionally requires two already-ratified, bounded owner extensions under
[EX11-EX13/EX16](./phase-25-donor-dashboard-depth/contracts/experience.md#ex16--qualification-rollout-and-retained-proof):
P28/P12 supplies the exact authenticated recipient projection for a guest-origin
newsletter request without fabricating a donor/supporter relationship; P32 keeps
that request, handoff and engagement outside automatic external-list enrollment,
resubscription, suppression-reset and consent/export admission. The P23 occurrence
remains the source. These exact extensions must be accepted, implemented and
qualified before Q25 consumer dispatch. Full Phase 28 workspace depth and Phase 32
newsletter sync remain unimplemented future work; neither whole phase must be
groomed or completed for this narrow contract. Other Phase 25 slices retain their
independent satisfied-gate paths.

**Remaining qualification.** The product choices are ratified, not open
roadmap questions. G01's supported native Auth linking guarantee remains
unresolved and blocks affected social activation; email-only does not complete
the selected social scope. Actual database, native provider, document,
accessibility and complete-journey proof remain to be earned at the named
owner gates. The
[decision log](./phase-25-donor-dashboard-depth/decision-log.md),
[glossary](./phase-25-donor-dashboard-depth/glossary.md) and
[evidence register](./phase-25-donor-dashboard-depth/evidence.md)
retain the decision and research context without certifying runtime behavior.

---

<a id="phase-26"></a>

### Phase 26 — Support Hub & Conversation Management (`support-hub`)

**Status and authority.** D1–D40, including D27-C and D29-X01, are fully
ratified. The [Phase 26 specification](./phase-26-support-hub-conversation-management.md),
[glossary](./phase-26-support-hub-glossary.md), normative requirement volumes
[A](./phase-26-support-hub-requirements-a.md),
[B](./phase-26-support-hub-requirements-b.md) and
[C](./phase-26-support-hub-requirements-c.md),
[traceability register](./phase-26-support-hub-traceability.md), and
[OpenSpec package](../../../openspec/changes/add-support-hub-conversation-management/)
form the implementation contract published in
[specification #1656](https://github.com/Asymmetric-al/core/issues/1656).
The former roadmap-level grooming questions are settled by that contract.
Implementation and runtime release proof remain outstanding.

**What this phase is (plain language).** Support Hub is one staff surface
within Asym for handling ordinary help requests, continuing them by email and
using qualified contextual Help entry points. Staff see the responsible worker,
current work, permitted CRM context and truthful action outcomes without
turning every ministry workflow into a ticket. Requesters do not need an Asym
account to continue ordinary email contact; this phase does not add a requester
"My messages" archive.

**Ratified scope.**

- **Work and continuity.** Four work states — Open, Waiting for requester,
  Waiting on our side and Resolved — remain separate from assignment, personal
  reading, reminders and delivery. Qualified assignment and coverage, exact
  duplicate merge/Undo, related conversations and delegated owner work preserve
  original-source identity, current authorization and genuine obligations.
- **Safe reading and authoring.** Deliberate Reply and Internal note modes,
  private Reply/new-note drafts in My drafts, optional quotation, own-note edits
  with visible history, advisory composing cues, personal read/unread, a Compact
  default with a personal Full option, and qualified file previews share the
  accessible Base UI/Maia experience. Presence and reading never replace the
  exact send-review and concurrency checks.
- **CRM continuity.** Observed sender endpoints and authorized CRM associations
  remain distinct. Matching email does not prove identity or access and does not
  create a Party automatically. Support and CRM show the same owner-filtered
  facts; protected updates use the owning domain's commands without duplicate
  CRM records, communication history or Support-to-CRM synchronization.
- **Intake and recovery.** Canonical intake, source-safe threading, loop and
  abuse controls, accountable Needs review with exact Release/Dismiss, truthful
  attachment/delivery recovery, and Resend qualification precede applicable
  activation. Unwanted correspondence has a recoverable designation separate
  from work status; future holding is a separate, explicit exact
  receiving-inbox/mailbox policy. It does not block CRM contacts or silently
  dispose of already accepted or held inputs.
- **Useful guidance and wording.** Public and Internal Guidance share a surface
  while retaining different content owners. Contextual guides and direct
  contact do not force self-service. Saved wording, signatures and curated
  shortcuts use qualified authoring and publication boundaries.
- **Truthful history and reporting.** Optional internal First/Next reply targets
  are distinct from public service promises or resolution timers. Feedback and
  reports preserve genuine obligations and historical evidence. Restrictions,
  redaction, finite purpose-based retention and recovery follow the exact source,
  privacy and authorization contracts.

**Ownership and activation.** Phases 6, 3, 4, 9 and 17 remain the foundational
owners. Email Studio (Phase 17) owns governed email preparation and its reusable
content; Phase 6 owns dispatch, immutable communication/provider evidence and
recovery. Support owns work, deliberate authoring and its private working state.
Internal note saving/posting is not external email preparation; any independently
authorized notification keeps its own Phase 17/6 admission. CRM, giving and
sensitive-care actions retain their owning domain's permissions and history.

Phase 23 is required before activating the selected Help/contact/form and Public
Guidance lanes, including their qualified occurrence, publication and withdrawal
seams. This lane-specific gate does not make Phase 23 the owner of Internal Staff
guides or a blanket prerequisite for core inbox/work/CRM behavior. Phase 34 remains
the sole configurable automation vocabulary; legacy Support rule data does not
authorize a parallel builder or make Phase 34 a blanket forward gate.

**Proof still required.** Existing schema, adapters, UI, tests and the parallel
legacy Support module are partial source evidence, not proof of the ratified
product. Consolidation and migration must preserve qualified identities/history.
The confirmed testing contract requires real authenticated API/intake/job seams,
disposable Supabase database and Storage checks, authorization/concurrency/replay
and migration cases, complete browser and assistive-technology journeys, intended
user evaluation, and actual provider/capacity qualification. Production inboxes
and dependent lanes activate only after their recorded evidence gates pass.

---

<a id="phase-27"></a>

### Phase 27 — Donor Development & Portfolio Management (`donor-development`)

<a id="phase-27-what-this-phase-is"></a>

#### What this phase is

The staff-side relationship-development product. Development officers, regional representatives and church-relations staff can organize their assigned relationships, prepare an ask, record the response and maintain an appropriate next action. This is a planned beyond-parity capability: the goal is a useful missions-oriented cultivation system, not just more fields on a donor record.

**Primary surface:** Mission Control, with shared development records later projected into the missionary workspace. **Stable slug:** `donor-development`.

<a id="phase-27-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 9, 3, 6 and 13. The CRM graph, approved projections, communication history and contribution facts must exist first. Consume the exact Phase 14 recognition and Phase 16 commitment contracts for those features; Phase 26 supplies permitted conversation context. Reporting in Phase 33 and optional workflows in Phase 34 enhance the product without gating its native operation. Phase 28 follows because staff and missionaries must reuse the same cultivation model.

<a id="phase-27-what-it-covers"></a>

#### What it covers

**Portfolios and responsibility.** Derive portfolios from active staff-assignment relationships and saved views. Support rule-based assignment, authorized manual override, transfer and assignment history. Use the accepted role vocabulary, including donor representative, regional representative, church relations and mobilizer; do not create a second stored portfolio membership model.

**Cultivation enrollments.** Use one shared enrollment primitive with an organization-approved stage preset. The staff preset covers identification, qualification, cultivation, solicitation and stewardship. Phase 28 uses a support-raising preset on the same object. Preserve stage history and distinguish a cultivation enrollment from a Workflow Studio run.

**Asks and proposals.** Record the ask, expected response, requested and expected amounts, source-confirmed funding, status and responsible person. Link the appropriate campaign or designation. Provide owner/stage rollups and forecast-versus-outcome comparison, always retaining Legal Entity, currency and the meaning of each amount. An ask is a business record, not a relationship edge or a custom field.

**Next-action discipline.** Every active enrollment has a next task and due date, or an explicit actionable exception. Show overdue actions, untouched relationships, time in stage and missing owners. Native reminders and source-backed task creation must work without installing an optional workflow.

**Appeals and church partnerships.** Support organization-level appeals with a goal, permitted audience and response buckets: Excluded, Asked, Committed, Received and Given, subject to the bucket decision below. Provide list and kanban views and governed segment export. Treat sending and supporting churches as organization Parties with a first-class partnership preset.

**Relationship context.** Produce a pre-meeting brief from authorized giving, commitments, interactions and relationships. Provide transparent recency/frequency/monetary bands, scheduled recomputation and source-backed score-change attention. Explain the inputs and coverage; an advisory score must not change a stage automatically or pretend to measure the value of a relationship.

<a id="phase-27-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 9 retains Party identity, relationships, assignments, shared tasks and record-shell conventions. This phase owns cultivation enrollments, asks, appeals and their business meaning. Phase 13 owns received gifts; Phase 14 owns recognition; Phase 16 owns commitments; Phases 6 and 17 own communication eligibility, content and delivery. Read these facts rather than copying them into new authorities.

Expose accepted development events and bounded commands for DON-14–DON-16 and the development portion of WS-18 in Phase 34. Share a source-purpose identity between native and configurable follow-up so one intended task or message is not created twice. Supply governed measures to Phase 33. Website content may consume only an independently qualified public projection, never an internal portfolio or donor brief.

**Extended-channel consumption.** Any SMS cultivation or appeal follow-up consumes Phase 43 through the communication owner and exact recipient purpose; a relationship stage or ask never grants phone consent. Directory-driven staff changes in Phase 44 use Phase 12 authority and source-owned reassignment, not automatic portfolio or financial succession. Native development remains independent of both optional capabilities.

<a id="phase-27-implementation-and-user-experience"></a>

#### Implementation and user experience

Start with one complete journey: assign a prospect, enroll them, prepare an ask, record the response and complete the next action. Then add appeals, church presets, health views and authorized rollups. Reuse the shared CRM record shell, saved views, filters and task controls; use TanStack Table/Virtual for the lists and the established server-command boundary for business changes.

Show why a person is in a portfolio, who is responsible and what is due next. Assignment changes must preserve accountability rather than silently dropping pending work. Label unknown source coverage and stale scores. Do not require staff to open the workflow diagram to perform ordinary cultivation.

<a id="phase-27-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

Cultivation stage, assignment labels and relationship membership never grant access. Never-ask and contact restrictions exclude prohibited ask suggestions, appeal inclusion and dispatch. A proposed ask or a commitment is not received money. No silent currency conversion or duplicated financial total is permitted. Deterministic follow-up is required; wealth screening and autonomous next-best-action decisions are not part of this phase.

<a id="phase-27-acceptance-and-release"></a>

#### Acceptance and release

Prove the full prospect-to-ask-to-follow-up journey through real source services and the staff interface. Include unauthorized portfolio enumeration, stale assignment, concurrent stage edits, contact suppression between preparation and dispatch, duplicate task delivery and explicit entity/currency rollups. A missing next action must be visible and repairable.

Prove that native development work remains usable with Phases 34 and 42 unavailable. Replace reached placeholder scores or shadow objects only after a retained-data census, with history-preserving migration and source-linked recovery. Release with accessible list/kanban operation, understandable status and a representative staff pilot.

<a id="phase-27-open-decisions"></a>

#### Open decisions

Resolve stage-preset customization, ask-review rules, shared interaction visibility between staff and missionaries, score inputs and completeness, and which rollups require materialization. Decide whether Received and Given describe distinct real events; combine them only when the accepted same-system process makes them identical. Record these decisions before the affected feature is implemented, without reopening the earlier identity, consent or financial contracts.

#### Existing owner requirements

Read the [complete retained Phase 27 owner obligations](../program-roadmap/owner-constraints.md#phase-27) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-28"></a>

### Phase 28 — Missionary Workspace Depth & Support-Raising CRM (`missionary-workspace-depth`)

<a id="phase-28-what-this-phase-is"></a>

#### What this phase is

A missionary's practical support-raising home: keep up with supporters, pursue referrals, plan personal appeals, see commitments separately from received gifts and know what follow-up is needed. The product should connect organizational giving operations and personal relationship work without making the missionary maintain another CRM or wait for a second system to synchronize.

**Primary surface:** Missionary Workspace, with permission-scoped staff and coaching views. **Stable slug:** `missionary-workspace-depth`.

<a id="phase-28-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 9, 13, 16, 6, 3 and 27. Reuse the shared development objects rather than creating another pipeline. Consume exact Phase 21 financial projections, Phase 22 public-content operations and the accepted Phase 25/12 newsletter-recipient purpose where required. Phase 26 adds conversation context. Optional workflows, gift-trigger customization and external newsletter sync arrive through Phases 34, 35 and 32 respectively; native workspace work must not wait for them.

<a id="phase-28-what-it-covers"></a>

#### What it covers

**Support-raising pipeline.** Use Phase 27's enrollment model with a support-raising preset: Never Contacted, Ask in Future, Contact for Appointment, Appointment Scheduled, Call for Decision and Partner-Financial/Special/Prayer. Include explicit terminal or suppressed dispositions such as Not Interested, Unresponsive, Never Ask, Research Abandoned and Expired Referral. Never Ask is enforced by the consent owner, not just a column label.

**Commitments and goals.** Support multiple concurrent commitments per partner, distinct currencies, support goals, support-raising start/end dates and weekly activity targets. Display expected versus received support using the commitment owner's frequency, coverage and currentness rules. A missing gift, paused schedule and genuinely late occurrence must not be conflated.

**Native gift-driven work.** Create source-qualified tasks to thank a first gift, acknowledge a special or above-commitment gift, review permitted missed-support attention and celebrate fulfillment. Record completed interactions once. Native tasks are required product behavior, consent- and privacy-aware, with durable identities that later optional automations reuse.

**Appeals, referrals and interaction history.** Reuse the appeal response model over the missionary's allowed supporters. Referrals use the accepted relationship graph, source provenance, expiry and follow-up. Maintain one interaction log with the agreed staff/missionary visibility policy; the same call should not need separate entries in separate products.

**Newsletter work.** Provide Physical, Email, Both and None preferences, invalid-address visibility, print segments and governed native email preparation/sending. Use source-owned audiences and templates. Mailchimp synchronization is Phase 32, not a second implementation here. The newsletter-recipient purpose accepted by Phases 25/12 remains separate from broader supporter access.

**Dashboard and coaching.** Show monthly support against goal, gains/losses over selected periods, a 13-month trend, source-qualified support attention, appeal progress and the exact authorized Field Account projection. Offer invited, read-only coaching views with approved redaction, activity-versus-target measures, trends, weekly qualitative check-ins and agreed next actions. Organization-configurable goals must not impose one agency's methodology on every tenant.

**Field resources.** Include the already-planned internal resource-sharing and region/world-map entry points only through qualified document and public-safe geography projections. Their precise first-release scope remains a decision below; they cannot expose restricted locations.

<a id="phase-28-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 27 owns cultivation and appeal meaning; Phase 9 owns Parties, referrals, interactions and shared tasks; Phases 13/16 own giving and commitment facts. Phase 21 supplies only the authorized Support Assignment, currency and through-date projection. A fundraising goal is not a finance Support Plan, balance, compensation amount or instruction to move money.

Use Phase 22 for Ministry Update submission and public-page changes. Later Web Studio authoring may improve that interface without taking over the specialized content owner. Phase 34 adds approved outreach, referral, coaching, goal-review, appeal and update-reminder recipes; Phase 35 adds configurable MPD-01 and MPD-06 gift/recurring recipes. Share effect identities across missionary and organization follow-up while retaining genuinely distinct intended communications.

**Extended-channel and sign-in boundaries.** Phase 43 may add qualified SMS purposes without converting newsletter recipients into broadly visible supporters or changing the native email requirement. Phase 44 affects only the exact source-authorized staff/worker access context; an IdP group cannot grant a Support Assignment, coaching visibility or another person’s supporter roster. Preserve native newsletter independence from the Phase 32 campaign/external-sync product.

<a id="phase-28-implementation-and-user-experience"></a>

#### Implementation and user experience

Deliver the permitted supporter list, relationship detail, next action and one source-qualified gift task first. Then add commitments/goals, appeals/referrals, coaching and newsletter operations. Keep daily work phone-friendly and allow server-backed save/resume for permitted forms. Show what is saved, pending, unavailable or stale without inventing a successful financial or communication outcome.

Reuse the shared list, record, form and task components. Enforce redaction and restricted enumeration in server projections, including totals and search suggestions. A participant-only My Journey session from Phase 34 is not a missionary-workspace account. A newsletter-recipient relationship does not reveal the supporter roster or giving history.

<a id="phase-28-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

The workspace is not a second Mission Control. Supporter/referral access is limited by the accepted source contract, and organization-owned records remain organization-owned. Giving does not create marketing consent; coaching membership does not expose raw supporter or care records. Do not synchronize fundraising goals into finance plans or treat an absent installment as debt. Public aliases and anonymous-donor protections apply to tasks, notifications and exports as well as screens.

<a id="phase-28-acceptance-and-release"></a>

#### Acceptance and release

Prove a missionary can review permitted support, complete a thank-you once, pursue a referral, update an appeal and share only the approved coaching projection. Test duplicate events, anonymous gifts, revoked relationships, consent changes, multiple commitments/currencies and stale financial coverage. Prove newsletter-recipient-only access cannot widen into support or giving access.

Exercise poor-network and repeated-submit behavior through real owner services. Native tasks must work with optional workflows disabled. Migrate any reached personal-task or supporter-data duplicates through an explicit source-preserving cutover; retain a useful manual interaction path during provider outages.

<a id="phase-28-open-decisions"></a>

#### Open decisions

Decide whether private prospects are allowed, how they are promoted/deduplicated and what staff can see. Set the external-coach assurance and redaction policy, exact activity metrics, resource-library/region scope and measured UX budgets. Decide which calendar/email connections or TntConnect/MPDX continuity feeds are required, using Phases 21/31 where applicable. Do not represent an unbuilt connector or unsettled access policy as available.

#### Existing owner requirements

Read the [complete retained Phase 28 owner obligations](../program-roadmap/owner-constraints.md#phase-28) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-29"></a>

### Phase 29 — File Manager & Document Management (`files-documents`)

<a id="phase-29-what-this-phase-is"></a>

#### What this phase is

One governed document service for CRM attachments, applicant evidence, missionary resources, donor documents, import files and public media custody. Staff should find and share the right file without confusing a public image, confidential document or executable development artifact. Asym owns classification, access, provenance and retention; storage providers hold bytes.

**Primary surface:** Mission Control File Manager and embedded document controls across the product. **Stable slug:** `files-documents`.

<a id="phase-29-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 3 and 9, with the existing safety, identity and permission requirements applied to each document class. This phase supplies upstream capabilities for imports, workflows, mobilization, events, care and custom web development. Generated artifacts from Phase 18 and conversation attachments from Phase 26 are consumers. Document processing uses the existing execution substrate and does not depend on Phase 34 or Phase 42 being complete.

<a id="phase-29-what-it-covers"></a>

#### What it covers

**Document identity and organization.** Maintain the source owner, attachment purpose, classification, retention class, provenance, exact byte version and authorized metadata. Provide folders, search, permitted bulk operations and embedded attachments, including the CRM Files area. Folder placement and a human-readable path organize a document; they do not grant access or replace its stable identity.

**Upload and evidence lifecycle.** Provide bounded upload initiation, finalization, integrity checks, malware scanning/quarantine, accepted byte custody and exact-version retrieval. Make each state visible and retry-safe. Uploaded, malware-clean, reviewed, signed and accepted are distinct facts; the relevant business owner decides whether evidence satisfies a requirement.

**Public media custody.** Produce qualified renditions, preserve asset lineage and support privacy-safe public delivery. Apply worker-linked metadata and EXIF/geolocation hygiene and required safety review. Phase 23's logical public-media catalog and Site-use qualification remain separate from generalized physical custody. Placement-local alt text, caption and crop are not global file metadata.

**Private document access.** Require current user/purpose authorization before issuing expiring access. Protect originals, previews, filenames, metadata and confidential download audit. Support revocation, attachment removal and source-specific access requirements without exposing a reusable public URL.

**Generated and imported records.** Register receipts, statements and other generated artifacts with their source/version lineage; the registry does not create their legal or financial meaning. Preserve Phase 21's private-byte and record-custody contracts, including qualified opening-source evidence, and Phase 30's staging-only role.

**Development artifacts.** Supply the minimum controlled custody profiles for Phase 42 source captures, build artifacts, manifests and retained renderer versions. These are not public media by default. Keep ordinary upload preview/scan processing distinct from explicitly authorized source execution in an isolated build environment.

**Retention, holds and disposition.** Use the approved purpose-specific schedules and holds for care, finance, imports and other documents. Track references from active, candidate, scheduled and recovery generations. Purge only after complete source-use and policy proof; incomplete or stale zero-use counts are not permission to delete. Preserve truthful partial-deletion and unknown-outcome records.

<a id="phase-29-ownership-and-integrations"></a>

#### Ownership and integrations

The business domain owns the document's meaning and accepted evidence; this phase owns the qualified custody, access and disposition operations. Phase 10 supplies safety/classification, Phase 12 capability decisions, Phase 23 logical public media, Phase 18 generated-document facts and Phases 34/41 evidence references. Events and care consume narrower purpose profiles, not general folder access.

Expose exact-version upload, currentness, quarantine and retrieval outcomes through stable source contracts. Workflow records and events carry authorized references, never bytes or reusable signed URLs. Phase 42 consumes custody without transferring package admission or public activation here. Supply governance evidence to data stewardship and reporting through permission-safe projections.

**Channel and enterprise evidence custody.** Register any retained sender-registration or identity-connection evidence only under its exact source purpose and retention policy. Credential secrets remain with their credential owner, and raw authentication assertions, directory payloads and SMS bodies do not become ordinary searchable File Manager documents. Deprovisioning or source disconnect cannot erase held financial evidence; access revocation still applies to future reads.

<a id="phase-29-implementation-and-user-experience"></a>

#### Implementation and user experience

First census actual providers, buckets, code paths and retained records. Choose a deliberate custody allocation instead of preserving multiple pipelines by accident. Do not treat historical provider mentions as a current deployment inventory. Keep physical paths and backend choices internal to the service.

Deliver an end-to-end private attachment journey, then public rendition and generated-artifact registration, then specialized evidence and development-artifact profiles. Reuse shared pickers and file-status controls. Explain why a file cannot be used and direct recovery to the scan, rights, access or business-review owner rather than exposing raw storage consoles.

<a id="phase-29-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No direct client bucket access outside the qualified signed flow; no public originals for private evidence. A clean scan does not certify a signature or application requirement. Moving a file cannot bypass classification or erase retained history. No age-only purge of an admitted renderer or financial artifact. Do not build another CMS media library, business-approval service or source-code execution platform inside the File Manager.

<a id="phase-29-acceptance-and-release"></a>

#### Acceptance and release

Prove real upload/finalize/scan/retrieve behavior, cross-tenant and cross-purpose denial, expiry and revocation, malicious/oversized files, repeated finalization, interruption and incomplete deletion. Verify a public rendition cannot expose private originals or unsafe metadata. Test rights withdrawal against a previously prepared publication candidate.

Prove required artifact retention across active, preview, scheduled, recovery and held references. Register source-linked recovery and storage-failure operations before enabling dependent workflows. Complete a bounded migration with reconciled metadata/byte integrity and one access authority; no silent dual custody or lost source lineage.

<a id="phase-29-open-decisions"></a>

#### Open decisions

Select the storage/provider allocation, scanning service, per-purpose size/type limits, preview formats, public delivery profile, resource-library scope and retention schedules with the owning teams. Qualify the exact source/build-artifact profiles and current access behavior. Legal or records-policy questions remain owner decisions; this roadmap does not supply universal disposal periods or a compliance certificate.

#### Existing owner requirements

Read the [complete retained Phase 29 owner obligations](../program-roadmap/owner-constraints.md#phase-29) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-30"></a>

### Phase 30 — Imports & Migration Tools (`imports-migration`)

<a id="phase-30-what-this-phase-is"></a>

#### What this phase is

The embedded migration product for bringing an organization's legacy data into Asym safely. Staff upload a file, understand the proposed mapping and effects, resolve errors and duplicates, commit authorized changes, and reconcile what actually arrived. The SiteStacker migration kit is a named delivery requirement, not an incidental example.

**Primary surface:** Mission Control Data Tools. **Stable slug:** `imports-migration`.

<a id="phase-30-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 9, 13, 11, 29, 4 and 3. Real target owners, the field catalog, file custody and identity/merge rules must exist before data can be accepted. Consume Phase 14 recognition where supported. Each additional target requires only its exact owner contract; the import transport does not wait for every future application module.

<a id="phase-30-what-it-covers"></a>

#### What it covers

**Upload and mapping.** Support CSV/XLSX intake, source-specific templates generated from the field catalog, remembered tenant mappings, row-level validation, bulk correction and annotated error downloads. Mapping assistance may propose matches, but staff review determines the accepted plan; optional AI is not a prerequisite.

**Dry-run and reviewed commit.** Produce a no-write plan showing records to create, update, skip or queue for merge, dependencies, warnings and expected totals. Bind the plan to exact source bytes, mapping/version, scope and target revisions. Reprove authority and affected target state at commit; a changed target is a conflict, not permission to overwrite newer work.

**Consistent duplicate handling.** Separate matching rules from permitted actions. Use the accepted exact/fuzzy identity evidence, confidence review and source-owned merge command across UI entry, APIs and bulk import. Do not make import an alternate path around classification, consent or duplicate controls. Any automated merge must already be permitted by the identity owner.

**Stable source identities and provenance.** Preserve external IDs, source system, batch identity, occurrence and recorded times, historical/cutover disposition and coverage. Reimport converges on the same permitted target identity instead of creating another copy. Provide per-record lineage and reconciliation against the source export.

**Recoverable processing.** Use bounded durable batches with per-row outcomes, progress, restart and failure isolation. Record accepted work before dispatch. Preserve late-committing records and do not advance a cursor past unprocessed lower-order work. Historic data stays outward-effect-dark: no mass welcome, first-gift trigger, account grant or new receipt merely because a row was imported.

**Target coverage.** Plan Parties, relationships, historic gifts, commitments, custom fields/collections, files and content in the correct owner-defined order. Additional application targets use Phase 41; finance opening evidence uses Phase 21. Target readiness, not a generic upload success, determines what can be committed.

**SiteStacker migration kit.** Include field-catalog bootstrap, source mapping presets, relationship and contribution/commitment sequencing, exception guidance and reconciliation reports. Check record counts and financial totals by Legal Entity, original currency and source basis; do not collapse them into an arbitrary converted scalar.

**Reversal and correction.** Show what can be safely undone, what needs a compensating source operation and what is irreversible. Retain permitted before-images and batch provenance where required. Reversal must not delete a real Party after merge, erase later staff edits or rewind financial history.

<a id="phase-30-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 30 owns transport, staging, mappings, plans and import-run evidence. Target services own validation and business acceptance. Phase 4 owns identity/merge; Phase 11 owns custom-data semantics; contribution and finance owners retain all money rules. Resolve historic giving within the accepted source model rather than inventing a shadow ledger.

CMS imports use Phase 23's governed no-write import plan and create private D12 draft successors only. Phase 42's composition/schema evolution remains catalog-owned. Git source capture is not a database import, and a developer database must never replace current CMS content. Workflow template portability belongs to Phase 34 and is inert configuration, not operational-record migration.

**SMS and directory import scope.** Historic phones and provider subscription flags remain evidence to classify, not automatic SMS consent. Historic identity/directory mappings do not create staff membership, reactivate revoked grants or merge principals by email. Any migration into Phase 43/44 invokes the exact source acceptance and current-proof contracts, preserves adverse history and stays outward-effect-dark until a separately authorized activation.

<a id="phase-30-implementation-and-user-experience"></a>

#### Implementation and user experience

Begin with a complete low-risk source-to-Party import and exact repeat import, then add relationship/custom-data and source-qualified money/document/content targets. Keep preview and commit separate and make uncertainty visible per row. Long operations must recover after a closed browser without requiring a fresh import identity.

Use the shared accessible grid and file controls. Choose an embedded importer or native implementation only after evaluating the required data boundary, source validation hooks and lifecycle. Provide clear counts for accepted, rejected, pending and unchanged work, with a cause-owned next action rather than a generic failed batch.

<a id="phase-30-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No raw table loads, implicit publication, synthetic source success or mass outward replay. Importing a historical gift never creates a new tax receipt. A source event marked historical cannot become prospective by changing a displayed timestamp. Reviewed backfill is a separate bounded operation. Do not promise universal time-window undo, permanent dual writers or lossless transformation of unknown data; quarantine unresolved records for a visible disposition.

<a id="phase-30-acceptance-and-release"></a>

#### Acceptance and release

Prove exact reimport, changed mapping, duplicate identity, revoked scope, stale plan, partial failure, interrupted batch and concurrent target edits. Use real database tests for idempotency, scope, commit boundaries and late commits. Verify source counts, relationships and native-currency totals, plus zero unintended send, enrollment, payment or public effect.

Run a representative SiteStacker migration with reviewed exceptions and recovery. Census actual retained state before migration; fresh-build assumptions are not a substitute for evidence. Publish target-specific reversal and reconciliation procedures before tenant use.

<a id="phase-30-open-decisions"></a>

#### Open decisions

Choose importer build-versus-adopt, the first supported source export profiles, mapping-assistance data handling, per-target chunking and safe reversal policies. Resolve unsupported legacy fields and whether a target supports update, append, merge or reference-only import. Any uncertainty in historic finance, media rights or identity is decided by its existing owner, not by this transport phase.

#### Existing owner requirements

Read the [complete retained Phase 30 owner obligations](../program-roadmap/owner-constraints.md#phase-30) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-31"></a>

### Phase 31 — Platform API, Webhooks & Connector Framework (`platform-api`)

<a id="phase-31-what-this-phase-is"></a>

#### What this phase is

The governed way external systems connect to Asym. Deliver a documented API, reliable signed events and a reusable connection framework so newsletter sync, legacy feeds and web-source delivery do not become isolated integrations with different security and recovery rules.

**Primary surface:** Mission Control Integrations, developer documentation and server integration services. **Stable slug:** `platform-api`.

<a id="phase-31-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 1, 3, 4 and 6. The integration foundation can be delivered independently; its useful resource catalog grows as CRM, contribution and other source owners qualify their operations. Phase 32 consumes it. Phase 42 needs its minimum connection, credential and revocation contracts for the Git lane, not completion of every public API resource or connector.

<a id="phase-31-what-it-covers"></a>

#### What it covers

**Versioned public API.** Provide source-owned resource operations, OpenAPI definitions, generated developer documentation, pagination/error conventions and a published compatibility/deprecation policy. Retain date-pinned tenant/token versions and explicit request-version selection as the proposed design to qualify; transformation behavior must not change business meaning or authorization.

**Integration identity and access.** Support the approved organization client-credential and fine-grained expiring token patterns. Use Phase 12's current principal and capability rules, including applicable non-human-owner restrictions. Show granted scope, last use, expiry, rotation and revocation. API callers receive approved projections and source commands, never raw database or Payload authority.

**Capacity and delivery controls.** Apply tenant- and token-scoped limits, separate read/write budgets, Retry-After and useful failure feedback. Accept essential durable work without silent loss; queue or reject additional work truthfully according to the owning contract. Provider limits do not become a reason to drop accepted source intent.

**Signed webhooks.** Publish a typed, versioned event catalog, endpoint-specific subscriptions, timestamped signature/replay protection, secret rotation and delivery evidence. Include bounded exponential retry, failure alerting, endpoint suspension and authorized redelivery using the original event identity. Preserve source occurrence time separately from delivery attempts.

**Connection registry.** Track installed integrations, provider links, exact scopes, connection state, health, latest successful work, failures and repair. Share external-ID conventions with Phase 30 and the CRM's External IDs surface. Credentials remain server-side under the connection owner; ordinary UI and job payloads store references only.

**Source-specific adapters.** Support the required seams for newsletter sync, read-only continuity feeds, accounting handoffs and selected future signing/screening services. Phase 20 retains accounting delivery decisions; provider support is not a generic permission to move money. Start with a concrete design-partner use case, not an abstract marketplace.

**Text-to-give handoff.** Preserve the planned SMS-keyword-to-secure-checkout-link seam with source code and giving context intact. Any SMS provider/channel enablement uses its existing consent and compliance owner; this is not a new payment route or a requirement to build native SMS giving.

**Minimum Git connection contract.** Supply exact provider/repository identity, credential custody, current Asym authority, provider authorization, binding generation, revocation, durable event acceptance and recovery. Phase 42 owns the presentation-specific GitHub App journey and capture/build behavior. Neither repository control nor Asym administration proves the other domain's permission.

<a id="phase-31-ownership-and-integrations"></a>

#### Ownership and integrations

The framework owns connection and transport facts. Each source domain owns its resources, action eligibility, business effect identity and outcome. External events, internal dispatch envelopes and application commands may share infrastructure but are not interchangeable permission surfaces.

Phase 34 uses only registered purpose-qualified connector actions, not raw HTTP nodes. Internal first-party orchestration remains independent of a public API launch. Phase 21/28 continuity feeds preserve their exact read-only source rules. Phase 42 consumes the minimum Git capabilities while ordinary visual editing remains independent. Newly introduced e-signature or screening profiles require separate source evidence before use.

**Explicit extended consumers.** Phase 43 owns actual SMS channel operation and completes the text-to-give consumer using the existing giving resolver. Phase 44 consumes the minimum scoped connection, credential and audit interfaces for enterprise identity, but owns federation/provisioning semantics. The shared framework and unrelated integrations remain complete without either consumer. Callback verification is provider-specific, not one generic signature algorithm assumed to fit GitHub, messaging and SCIM.

<a id="phase-31-implementation-and-user-experience"></a>

#### Implementation and user experience

Deliver one end-to-end connection and source operation with visible scope, event delivery, failure and revocation. Then add the API/resource catalog and additional provider adapters. Decide build-versus-adopt for OAuth/token lifecycle and webhook delivery alongside Phase 30's importer choice; do not accidentally build three unrelated infrastructure products.

Make connection state understandable: connected does not mean synchronized, delivered or business-complete. A repair should name the owner and affected operation. Preserve accepted requests across downtime and reconcile missed/out-of-order events through bounded source readback. Treat incoming payloads as untrusted and validate signature, schema, event action and scope before scheduling work.

<a id="phase-31-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No tenant-authored server scripts, arbitrary SQL/HTTP workflow actions, raw provider-console replay, general GraphQL product or app marketplace in this phase. Do not expose pasted secrets in Workflow Studio. A source outage is not proof of deletion or authorization loss; explicit disconnection must still fence future work immediately while external cleanup is reconciled separately. Redelivery cannot weaken current access or silently change the original effect.

<a id="phase-31-acceptance-and-release"></a>

#### Acceptance and release

Prove scoped API reads/writes, cross-tenant denial, token expiry/rotation/revocation, raw-body signature verification, replay protection and accepted-before-acknowledge behavior. Exercise duplicate, missed, late and out-of-order events, provider throttling, endpoint failure, lost acknowledgements and unknown outcomes. Verify logs, counts and status pages do not leak private payloads or unrelated resources.

Qualify the minimum Git contract with forged callback/installation evidence and stale events after reconnect; the concrete source adapter is tested again in Phase 42. Release each connector profile only with its source-specific contract, operating limits, documentation and safe recovery path.

<a id="phase-31-open-decisions"></a>

#### Open decisions

Confirm API versioning details, first resource/consumer, initial write scope, webhook transport and retry budget, managed OAuth use and the exact provider permission profiles. Standard Webhooks, Svix-style delivery and managed-connector tooling are evaluation inputs, not assumed installed services. Keep provider-specific support, licensing and operational limits explicit rather than promising universal integrations.

#### Existing owner requirements

Read the [complete retained Phase 31 owner obligations](../program-roadmap/owner-constraints.md#phase-31) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-32"></a>

### Phase 32 — Mailchimp / Newsletter Sync with Suppression Handling (`newsletter-sync`)

<a id="phase-32-what-this-phase-is"></a>

#### What this phase is

A reliable external newsletter bridge for ministries that use Mailchimp. It should export only an authorized audience, preserve unsubscribe and privacy decisions in both directions, and make drift and failed synchronization repairable. It is not a second CRM or a replacement for native Asym newsletter work.

**Primary surface:** Missionary Workspace settings and Mission Control Integrations. **Stable slug:** `newsletter-sync`.

<a id="phase-32-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 6, 3, 28, 4 and 31. Native audience/preference meaning, identity and the connection framework must be available before an external provider can receive contacts. Phase 17 governs native message content where used. The accepted Phase 25/28/12 recipient-purpose rules and Phase 32 external-enrollment exclusion are mandatory for affected audience paths.

<a id="phase-32-what-it-covers"></a>

#### What it covers

**Permitted audience.** Compute membership from the approved source relationship and newsletter purpose, then apply current consent, export permission, address validity and suppression. A supporter relationship alone does not authorize export. A recipient-only purpose accepted for native Asym access does not automatically authorize external enrollment; preserve the exact accepted exclusion.

**Audience and tag mapping.** Let an authorized user select the permitted provider audience and supported tags, review the intended scope and inspect proposed additions/removals. Keep stable provider links without copying provider identity over the canonical Party. Source identity repair and recipient consent are separate operations.

**Bidirectional suppression.** Land qualified provider unsubscribe, bounce and complaint evidence in the existing communication/consent owner. Push and enforce Asym restrictions on export. Apply the stricter applicable suppression and never re-subscribe someone merely to repair drift, reconnect an account or complete a workflow.

**Operational sync.** Provide initial synchronization, incremental updates, source/provider drift visibility, per-item results, rate-limit handling and cause-owned recovery. Preserve original work identities through duplicate events and interrupted runs. Show accepted work, provider acceptance and confirmed membership separately when the provider contract distinguishes them.

**Future provider seam.** Keep newsletter preferences, unsubscribe handling and audience eligibility provider-neutral so another qualified email provider can be added without reworking the CRM. Optional campaign/open metrics must remain labelled provider evidence and must not become proof of reading, consent or relationship strength.

<a id="phase-32-organization-wide-communication-campaigns"></a>

##### Organization-wide communication campaigns

**Complete product responsibility.** In addition to every external newsletter-sync obligation in this chapter, Phase 32 delivers organization-wide communication campaigns in Mission Control. This is the campaign/newsletter ownership explicitly reserved by the Phase 17 contract, not another System Messages product. Phase 28 retains independently usable missionary newsletter preparation and sending through shared lower-level communication primitives. Organization campaigns must not require a missionary persona, a Mailchimp account or an enabled Workflow Studio template. The native campaign and the external-sync lanes reuse source-governed audiences without becoming two competing audience or delivery authorities. \[R-COM-01\]

**Campaign versus appeal versus giving campaign.** The communication campaign owns its purpose, content, reviewed audience/send occurrence and communication outcomes. Phase 27 owns an appeal and its relationship-development response; Phase 13 owns a giving campaign and authoritative contribution attribution. Link those records through permitted references and Source Codes instead of putting send status on a giving campaign, copying gift totals into an email record, or treating a tracked click as received money. Reported fundraising response uses the qualified source basis and retains uncertainty; it is not proof that the communication caused the gift.

**Author, review and release.** Staff select a permitted purpose, Site/locale where relevant, sender/reply identity, audience and content. Reuse the qualified structured email editor, layouts and safe variables without adding human-authored campaigns to the system-message catalog. Provide draft history, revision conflict handling, synthetic preview, controlled test recipients, exact audience/content review, scheduling, stop and repeat-as-a-deliberately-new-occurrence. Explain authorization, affected recipient count, exclusions, stale or incomplete audience evidence and potential external export before committing. Routine review follows the owning proportional policy; do not impose an invented universal second approver.

**Audience and occurrence integrity.** Separate a saved segment definition from a specific reviewed send population. Pin the selected definition, scope, permissible source basis and bounded recipient manifest or equivalent qualified immutable selection at admission. Recheck current recipient/contact/consent restrictions before delivery and record exclusions, without silently adding later segment matches. Resolve duplicate destinations, shared mailboxes, anonymity and locale through the recipient owner, not arbitrary first-row matching. A full browser refresh, repeated schedule action or resumed worker keeps the same occurrence identity; intentionally repeating the campaign creates a separate reviewed occurrence.

**One delivery path per intended effect.** Native sends cross Phase 6 with the originating campaign, recipient, purpose and exact content identity. An external provider campaign is available only after its connector proves the corresponding source ownership, eligible audience, outcome correlation, suppression, stop and unknown-outcome contract; a generic provider Broadcasts call is not that proof. Never run both a provider-owned broadcast and a per-recipient Core loop for the same occurrence. Mailchimp audience synchronization alone does not establish an Asym-controlled campaign scheduler or deliverability claim. Provider-native authoring, when supported, must be labelled as an external lane with honest evidence limits. \[T-07, C-08\]

**Timing and recovery.** The campaign owner records its exact not-before time, intended content, audience, expiry, responsible authority and cancellation generation. Use shared execution infrastructure rather than a second scheduler. Pause/stop contains work not yet admitted to transport, preserves accepted outcomes and distinguishes unsent, suppressed, failed and unknown recipients. Reconcile uncertain sends before retry or switching providers. Required system notices, personal missionary work and approved native email must continue independently during a campaign/provider outage.

**Preferences and outcomes.** Present organization topics and channel purposes clearly; internal segmentation is not recipient consent. A donor can withdraw one applicable topic without an accidental unrelated opt-out, subject to broader hard restrictions that still win. Provider opens/clicks remain imperfect provider observations, not proof of reading, identity or consent. Outcome screens show the original send basis, source time, counts by actual state, permitted per-recipient evidence and source-linked repair. Reports use Phase 33's shared definitions. \[T-07\]

**SMS integration.** Phase 43 supplies an individually qualified SMS channel for the same organizational campaign purpose, with separate phone/consent/registration/timing proof. Email permission cannot populate the SMS audience. The campaign's email and external-newsletter scope remains complete without Phase 43; its SMS lane becomes available only when both owners' contracts are qualified. The joint campaign-to-SMS adapter and SMS acceptance close within Phase 43, not as a new mandatory exit gate on Phase 32. No combined email/SMS setting invents permission or silently duplicates a communication.

<a id="phase-32-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 28 owns native newsletter-list operations and preparation/sending; Phases 6/17 own consent, communication intent/history and governed content; Phase 31 owns connection credentials and lifecycle. This phase owns external synchronization and its evidence, not a new consent field or independent audience authority.

Workflow Studio may coordinate an approved campaign handoff or a connection-repair task. Web forms use their source-qualified consent operation. Neither a donation, public form occurrence, Git commit, relationship change nor workflow enrollment can create newsletter permission by inference. Native and external messages need distinct intentional source purposes, not duplicate copies of the same send.

<a id="phase-32-implementation-and-user-experience"></a>

#### Implementation and user experience

Deliver a reviewed audience-to-provider sync, then a provider unsubscribe returning to Asym, before adding broad automation. Explain excluded recipients without disclosing data outside the viewer's scope. Show what will leave Asym, which account receives it and why it is allowed.

Provide source-linked repair for invalid addresses, revoked provider access, mapping errors and uncertain membership. Reconnect must not reset suppressions or mark all historical work as new. A disconnected provider must not break native newsletter preferences or the permitted native sending path.

<a id="phase-32-campaign-implementation-and-completion"></a>

##### Campaign implementation and completion

Build complete slices in order: native organization campaign draft and synthetic review; exact permitted audience and one real Phase 6 send; scheduled/partial/uncertain-outcome operations; source-coded appeal/giving attribution; then individually qualified external-provider and SMS adapters. Shared authoring/dispatch primitives needed by Phase 28 must remain below the Phase 32 product boundary, so adding organization campaigns cannot create a Phase 28↔32 cycle. Keep stable slug newsletter-sync and all existing external-sync obligations; UI may explain the broader communication-campaign scope.

Logical records include campaign definition/revisions, reviewed send occurrence, audience evidence, source-effect links, scheduling/cancellation facts and governed outcome projections. Reuse existing equivalents before adding storage. Same-tenant references, immutable accepted identity, expected-revision checks, current permission and retention apply throughout. A campaign row is not a second communication ledger. Route shared business logic through packages/api and approved browser collections/hooks; reuse the existing Email Studio and list controls.

<a id="phase-32-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No provider-driven Party overwrite, donor roster export by broad administrator assumption, second campaign scheduler or independently editable unsubscribe flag. Identity, permission to view a contact, permission to export and marketing consent remain distinct. Do not relabel a failed provider response as an empty successful audience or automatically fail over to another sender when a prior send is uncertain.

<a id="phase-32-acceptance-and-release"></a>

#### Acceptance and release

Test suppression changes during export, unsubscribe-before/after-sync races, invalid destinations, duplicate and out-of-order webhooks, partial batches and reconnect. Prove recipient-only, anonymous and restricted records cannot enter a prohibited external audience. Verify the source rules survive Party corrections and provider-link replacement.

Run a representative end-to-end tenant sync with per-recipient evidence, safe diagnostics and recovery. Native operations must continue during external provider downtime. Do not claim an integration exists merely because a settings card or provider SDK is present.

<a id="phase-32-campaign-acceptance-cases"></a>

##### Campaign acceptance cases

| **Case**  | **Additional required Phase 32 evidence**                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| COM-AT-01 | Organization staff create, review and send a native campaign without a missionary account, Mailchimp or optional Workflow Studio.                                               |
| COM-AT-02 | Exact reviewed population stays attributable; later segment additions are not silently enrolled and withdrawals before dispatch suppress the affected effects.                  |
| COM-AT-03 | Shared/duplicate addresses, anonymous or restricted records, wrong locale and insufficient recipient purpose cannot widen disclosure.                                           |
| COM-AT-04 | Revision conflict, duplicate start, response loss and resumed scheduling preserve one intended occurrence and one recipient effect; a deliberate repeat is separately reviewed. |
| COM-AT-05 | Stop/partial failure/unknown delivery remains honest; no blind replacement send, provider failover or simultaneous provider-broadcast/Core-loop execution occurs.               |
| COM-AT-06 | Source-coded giving response reconciles with Phase 13/27/33; opens, clicks, pledges and gifts remain distinct and no unsupported causal claim is displayed.                     |
| COM-AT-07 | Native Phase 28 newsletters and Phase 32 email work with external sync/SMS absent; an SMS recipient requires the exact Phase 43 permission and readiness.                       |
| COM-AT-08 | Staff complete audience/content review, scheduling, outcome inspection and safe recovery with real source services, keyboard/screen-reader access and a representative pilot.   |

<a id="phase-32-open-decisions"></a>

#### Open decisions

Resolve organization-level versus per-missionary provider accounts, supported audience/tag mappings, conflict and removal policy, allowed metrics and the initial sync scale. Reconfirm the exact recipient-purpose exclusion from the accepted predecessor contracts before implementation. Provider authentication and plan limitations require qualification; no broader enrollment scope is implied by a new connection.

**Open implementation decisions.** Resolve the first organization audience/purpose catalog, approved campaign author/reviewer roles, exact shared-address deduplication policy, calendar/expiry rules, native and provider-native scope, attribution basis, retention and measured send-volume/cost limits. Resend Broadcasts/Segments/Topics and Mailchimp capabilities are evaluation evidence, not permission to duplicate their contact databases or bypass the Phase 6 spine. The mandatory native organization campaign journey must be completed even if an optional external adapter remains unsupported.

---

<a id="phase-33"></a>

### Phase 33 — Reporting & BI / Report Studio (`reporting-bi`)

<a id="phase-33-what-this-phase-is"></a>

#### What this phase is

A reporting product that gives staff dependable answers without assembling spreadsheets from conflicting sources. Deliver standard ministry reports first, then a constrained custom builder, saved reports, governed exports and scheduled delivery. The parity target is useful organizational reporting; the beyond-parity goal is consistent definitions across finance, relationship work, workflows and future assistance.

**Primary surface:** Mission Control Report Studio, with approved projections reused elsewhere. **Stable slug:** `reporting-bi`.

<a id="phase-33-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 9, 13, 7, 6 and 3. The phase can start when those source facts exist; its number is not a requirement to wait for every engagement surface. Custom fields, recognition, batches, commitments and imports enrich reporting through their exact owners. Workflow, mobilization and hybrid-web measures register when Phases 34, 41 and 42 provide them, without becoming prerequisites for base reports.

<a id="phase-33-what-it-covers"></a>

#### What it covers

**Standard report library.** Include giving by donor, designation, campaign and source; organization/church giving; recognition where applicable; commitment and recurring health; source-qualified inactivity and missed-support attention; missionary support progress; batch/deposit views; and statement-run operations. Enumerate the actual required SiteStacker report outcomes during phase planning rather than treating a competitor report count as acceptance.

**One semantic layer.** Define metrics, dimensions, joins, time/coverage rules and access once. Dashboards, custom reports, exports, scheduled runs and AI questions use these governed definitions. Preserve Legal Entity, currency, source basis, original versus derived facts and through-date; unknown coverage is not zero and commitments are not received cash.

**Constrained custom reports.** Offer permitted fields, dimensions, filters, grouping and ordering, including qualified custom fields. Reuse saved-view and visibility conventions. Do not expose arbitrary SQL or unconstrained joins. Explain what the report measures and why rows or fields are unavailable.

**Saved and scheduled delivery.** Separate capabilities to create, save, share, schedule and send. Generate each recipient's authorized projection using current permissions and the exact report definition/snapshot. Deliver through Phases 6/17 with source-linked history and failure recovery. A report schedule remains report-owned rather than being duplicated by Workflow Studio.

**Read models and exports.** Use documented, reconciled read models or rollups when live queries cannot meet the admitted workload. Exports retain definition, input basis, generation time, coverage, access and artifact lineage. A saved file or stale rollup does not become financial authority.

**Operational reporting.** Add source-governed run age, wait time, missing owner, overdue work, blocked cause, accepted handoff, suppressed optional communication and unknown outcome measures. Web development measures distinguish capture, build, admission, runtime availability, activation and convergence. Incomplete usage counts cannot authorize publication or deletion.

<a id="phase-33-configurable-personal-and-shared-dashboards"></a>

##### Configurable personal and shared dashboards

**User outcome.** An operations lead, development officer or finance user can assemble the permitted reports, metrics, saved lists and source-owned work summaries needed for the day into a personal or shared dashboard. SiteStacker advertises configurable dashboards, and HubSpot documents practical add/filter/reorder/clone/share controls. Adopt that bounded outcome inside Report Studio rather than creating another general-purpose Workspace Studio or arbitrary application builder. \[C-01, C-09\]

**One widget catalog and semantic layer.** Register a finite set of metric, chart, report-table, saved-view list and source-linked work-summary widgets. Each declares its approved query/report or source projection, compatible filters, time/currency/entity basis, freshness, permission purpose and resource cost. Dashboard configuration stores layout and qualified references, not SQL, executable code, arbitrary HTML, private snapshots, iframe URLs or a new copy of source records. The report and list owners retain their definitions and action boundaries.

**Composition and everyday controls.** Support creating from a safe preset or blank, adding/removing widgets, changing approved size/layout roles, ordering, duplicating, renaming, setting a personal default and sharing view/edit configuration where authorized. Provide explicit Move controls and a readable stacked layout for keyboard, single-pointer and narrow-screen use. Removing a widget does not delete its report or saved view. A copied dashboard is independently editable and records its source provenance without silently copying access grants or private cached results.

**Sharing does not share data.** Separate the ability to manage dashboard configuration from permission to run each underlying query. Evaluate every widget for the current viewer, tenant, purpose, classification and entity scope. Never use the creator's cached results or a privileged run-as-owner identity to make sharing appear convenient. Unauthorized widget names, counts, drill-throughs and failure messages must not reveal sealed work. A user who loses scope cannot continue seeing a previously loaded dashboard through a stale client or shared URL.

**Filters with honest meaning.** Offer only filters that the selected widgets explicitly support. Show which widgets an overall date, currency, Legal Entity, Site, assignment or saved-view filter affects; never silently reinterpret incompatible metrics. Preserve original currency and source coverage. A visible total without current source data remains unavailable/stale rather than zero. Filters and layout changes do not mutate source state or redefine a report. Drill-through opens only independently authorized source rows, not a privileged aggregate expansion.

**Persistence, performance and recovery.** Store a versioned dashboard definition with expected-revision saves and safe conflict recovery, plus per-user layout/default preferences where useful. Bound simultaneous widget queries, refresh frequency, export workload and per-tenant resource use. Reuse TanStack Query for server projections, Table/Virtual for grids and Store only for local layout interaction; do not reuse React Flow or Puck as a new executable dashboard grammar. Superseded or unavailable source definitions produce cause-owned repair, not silent substitution with a different metric. Late responses after a tenant or permission-context change must be discarded.

**Delivery and export.** A dashboard link preserves configuration, not access. Any supported scheduled digest or snapshot goes through the existing Phase 33 recipient-specific reporting contract, Phase 29 artifact custody and Phase 6 delivery. Recheck current recipient authority and record exact definition/source basis. Do not add an independent dashboard timer, make a screenshot a financial source, or export private widgets merely because the dashboard itself is shared.

<a id="phase-33-ownership-and-integrations"></a>

#### Ownership and integrations

Source domains own records and final business outcomes. Reporting owns the meaning and execution of approved queries and the evidence for its output. Finance reports must reconcile with the authoritative contribution, credit, statement, accounting and Field Account owners rather than implement another ledger. Phase 29 supplies export custody; Phase 30 supplies import provenance and history coverage.

Phase 35's historical/inactivity conditions consume a named completeness-qualified projection, not an ad hoc person-level lapsed flag. Phase 40's numerical answers use this same semantic layer. Private repository names, preview metadata, care existence and restricted source attributes remain protected in counts, facets, filters, searches and exports—not only in report detail rows.

<a id="phase-33-implementation-and-user-experience"></a>

#### Implementation and user experience

Build a small complete set of reconciled standard reports with accessible tables, readable dates/currencies and safe downloads. Then expose the constrained builder and scheduling over the same definitions. Use the Core UI system and TanStack Table/Virtual; do not introduce an independent embedded BI permission model or per-viewer product by assumption.

Each report shows its definition, filters, source time and completeness. Distinguish no matching data from missing source coverage or failed generation. Let staff move from an authorized aggregate to its source records without exposing unauthorized siblings. Record workload budgets and prevent a large tenant report from starving other tenants.

<a id="phase-33-dashboard-implementation-and-completion"></a>

##### Dashboard implementation and completion

Deliver one useful personal dashboard over qualified standard reports and saved lists, then current-viewer sharing, compatible filters, accessible composition and source-linked recovery. Adding this capability does not delay standard reconciled reports or require all future module widgets. Every required initial widget must use the existing semantic/source owner and pass its real permission and data tests; a set of static mock cards is not dashboard completion.

<a id="phase-33-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

Reports never write source truth. Do not combine incomparable currencies, count soft credits as new money, label a scheduled commitment received or treat a stale result as current. A report recipient must be authorized at generation and applicable delivery/access boundaries. No shadow warehouse, unrestricted SQL builder or separate AI analytics engine is required by this phase.

<a id="phase-33-acceptance-and-release"></a>

#### Acceptance and release

Prove selected standard reports against authoritative fixtures and real source totals, including credits, corrections, refunds, historical coverage and separate currencies/entities. Test forbidden joins, restricted counts, stale definitions, current permission loss, concurrent source changes, scheduled-delivery duplication and reproducible export evidence.

Qualify the admitted dataset and query/cost profile. Make failure and stale-result recovery source-linked and independently usable without Workflow Studio or AI. The custom builder is complete only when its output uses the same definitions and security as standard reports.

<a id="phase-33-dashboard-acceptance-cases"></a>

##### Dashboard acceptance cases

| **Case**   | **Additional required Phase 33 evidence**                                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DASH-AT-01 | A staff user creates, edits and saves a useful dashboard using real qualified reports/lists without SQL, custom code or another application builder.          |
| DASH-AT-02 | Two viewers of one shared dashboard see only their own current authorized data; creator cache, run-as-owner and hidden-widget labels cannot leak scope.       |
| DASH-AT-03 | Compatible global filters apply as described; incompatible widgets are clearly identified and retain correct currency, entity, dates and source completeness. |
| DASH-AT-04 | Removing/copying/reordering widgets preserves backing reports, source identity and permission; concurrent layout changes show a recoverable conflict.         |
| DASH-AT-05 | Revocation, tenant switching and late query responses clear or fence old private projections, including counts, exports and drill-through.                    |
| DASH-AT-06 | Stale/failed/retired source definitions remain distinguishable from no data; repair cannot replace a metric silently or write business truth.                 |
| DASH-AT-07 | Query fan-out, refresh, snapshot/export and scheduled recipient projection satisfy the approved load profile and existing delivery/retention controls.        |
| DASH-AT-08 | Keyboard, non-drag pointer, screen-reader and narrow-screen users can compose and use the dashboard; a representative staff pilot completes the daily job.    |

<a id="phase-33-open-decisions"></a>

#### Open decisions

Select the first complete report catalog, semantic-layer implementation, materialized versus live projections, workload limits and export formats. Cube-style semantic tooling and an in-house catalog are alternatives to evaluate, not assumed dependencies. Decide which donor/missionary projections are needed and what larger-scale architecture is justified by measured data volumes.

**Open implementation decisions.** Select the initial presets/widget catalog, allowed layout sizes, personal-versus-shared defaults, filter compatibility rules, whether dashboard-specific snapshots are needed, and measured concurrency/refresh budgets. Confirm the actual safe source projections before exposing a module widget. Do not introduce arbitrary embeds, a second report permission model, or universal micro-application creation under the dashboard label.

#### Existing owner requirements

Read the [complete retained Phase 33 owner obligations](../program-roadmap/owner-constraints.md#phase-33) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-34"></a>

### Phase 34 — Configurable Automation & Workflow Engine (`workflow-engine`)

<a id="phase-34-what-this-phase-is"></a>

#### What this phase is

Workflow Studio is the shared Mission Control product for designing and operating workflows across Asym. A small team can change a reminder or handoff without programming; an operations lead can build a longer process with tasks, evidence, branches and responsible roles. The same definition becomes clear operational work for staff and an appropriate next action for each participant.

This phase delivers a complete usable Studio, not just a canvas or execution infrastructure. Mobilization is a major consumer, but its application records and full business journey belong to Phase 41.

**Primary surface:** Mission Control Workflow Studio, contextual entry points in other products and purpose-scoped participant views in the existing application surfaces. **Stable slug:** `workflow-engine`.

<a id="phase-34-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 9, 11, 12, 29, 17 and 6, including their inherited requirements. Every selected action also needs its exact source capability implemented and qualified. Phase 35 contribution triggers, Phase 37 event recipes, Phase 38 care recipes and Phase 41 applications consume this Studio; none may become a prerequisite of its core through package imports, startup registration, fixtures or final acceptance.

Prioritize Phase 41 immediately after this phase in the mobilization lane. Web Studio's native publication, scheduling and recovery remain independent. Phase 42's hybrid editor and Git delivery neither gate this phase nor become its responsibility.

<a id="phase-34-what-it-covers"></a>

#### What it covers

**One library with honest customization.** Provide Templates, Runs, Needs attention and My Work. Distinguish Editable workflow, Automation and Managed by \[source product\]. The first permits approved steps and branches; the second configures allowed event/action combinations; the third opens native protected settings or coordination commands. Finance, Support Hub, development, communications and missionary screens link to filtered views of the same library.

**Complete authoring.** Support starter selection, permitted blank definitions, duplication, contextual action/field pickers, roles, parameters, forms, schedules, validation, simulation, publication comparison, activation, archive and safe export/import. A starter explains outcome, prerequisites, recipients and external effects. It installs as an inert draft; required source bindings remain visible until resolved.

**One structured definition.** Use the versioned `asym.workflow/1` language as canonical meaning. A pure compiler produces the normalized syntax tree, derived execution graph, semantic digest, exact source dependencies, risk/purpose classification and diagnostics. React Flow coordinates, zoom, selection and stage layout are presentation only. Guided sentences, canvas and outline operate over the same definition; a simple view must not discard a structure it cannot express.

**Supported process constructs.** Include sequence, shared task, evidence request, registered action, durable wait, exclusive choice, selected parallel branches, exact-version nonrecursive subflow and declared finish outcome. Validate node identity, legal placement, input/output types, output availability, references, role fallback, joins and workload bounds. Initial certified parallel work uses all-required joins. Any/quorum joins require independently proved required-branch and remaining-work policies before activation; no freehand loops or unbounded fan-out.

**Typed facts and decisions.** Every fact declares meaning, owner, subject, version, scope, completeness, freshness, classification and permitted purpose/audience. Conditions distinguish true, false and unknown; access denial blocks evaluation instead of pretending a value is absent. An exclusive branch requires proven exclusivity, not the first convenient match. Selected branches and past decisions freeze for their occurrence; current access, suppression and source eligibility still apply before effects.

**Subject-aware enrollment.** A run may concern a conversation, document requirement, contribution, occurrence or application—not always a person. Apply once-per-subject, once-per-event or one-active-per-subject within tenant, environment and template lineage. Publishing another version cannot restart the same journey. New applications have their own identities; Party corrections and merges preserve source lineage rather than reenrolling all work. Historical imports remain outward-effect-dark unless a distinct reviewed backfill is authorized.

**Shared tasks, forms and evidence.** Adopt the canonical shared task owner and source exceptions rather than create a second inbox. Deliver bounded multi-page forms, conditional fields/groups, server validation, partial save/resume, immutable submission versions and approved mappings. Only named source-approved calculations are allowed. File bytes and quarantine remain Phase 29; a source reviewer decides whether evidence qualifies. Task completion, clean upload, accepted evidence, communication outcome and business decision are separate facts.

**Roles and participant access.** Resolve a responsibility to an eligible person, an approved team queue or Needs assignment. Ambiguity does not select the first database row; assignment never grants access. Provide attributable reassignment and delegation. Reusable purpose-scoped participant sessions and tasks live within existing identity/application boundaries. Applicants and referees receive their Phase 41-specific bindings later, without a fourth app or automatic donor/missionary membership.

**Publication and run management.** Use revision-aware draft saving and visible conflicts. A server-issued expiring preflight binds the exact definition, source references, scope, audience impact and required review; final publication rechecks them. Published definitions are immutable. Publishing, enabling future enrollment and changing existing runs are separate actions. Runs pin compatible definition/action versions and support pause/resume, safe discontinuation, reassignment, allowed deadline changes, source-linked reconciliation and reviewed future-plan amendment.

**Individual variation.** Preview the consequences before changing one run: added or canceled tasks, deadlines, evidence reuse, messages, required review and irreversible work already admitted. Record the reason and accepted plan revision. Completed source history remains intact. A held business disposition requires its source-approved successor; it is not the same as pausing operational work. Nonwaivable requirements cannot be removed through the graph editor.

**Simulation and portability.** Run the real evaluator against synthetic adapters and a virtual clock with no live transport or credentials. Imported templates contain no active grants, real participant IDs, code or run data; validate and rebind them into disabled drafts. Retain supported action/dialect versions for active runs, with explicit migration or safe discontinuation rather than hidden reinterpretation. A pinned subflow has a linked child engagement, only the permitted delegated authority and its own completion; old child evidence is reusable only after exact source-equivalence proof.

<a id="phase-34-ownership-and-integrations"></a>

#### Ownership and integrations

**Core execution components.** Use `@xyflow/react` for the workflow diagram and Core's shared Inngest client, serve endpoint, dispatch ledger, claims and recovery infrastructure. Do not create an Inngest application or deployed function per tenant/template. Workflow Kit is reference material, not a competing business engine. Postgres owns process records; the executor's run state and trace retention do not define process truth or lifetime.

**Source actions and permissions.** The coded action registry declares allowed subjects, exact input/output schema, source owner, capability, purpose, classification, semantic effect identity, human/automation eligibility, retry/reconciliation policy and simulation/real-test behavior. Bind automation authority to the existing Phase 12 non-human identity model with an active human owner and the live intersection of that owner's current capabilities. Owner departure or capability loss stops affected work; an authorized transfer must revalidate authority.

**Native business owners.** Identity, consent, giving, financial approval, recurring recovery, receipts, accounting, public release and records disposal retain their existing commands and policies. There is no general Mark paid, Approve expense, Grant role, Set any status, Write table or Provider replay action. Preserve any narrowly approved source separation-of-duties rules rather than substituting a generic Studio policy.

**Communication and public entry.** Owning domains choose audience and purpose; Phase 17 supplies governed publications/sender/reply plans and Phase 6 supplies dispatch, eligibility and history. Support Hub retains threads, quarantine, internal-note privacy and response clocks. Public intake uses Phase 23's durable occurrence and one Primary Outcome; do not add a second form ledger or silently extend upload/payment-free public launch forms. Private participant forms remain app-owned.

**Domain delivery.** This phase owns 57 recipes: administration/common operations, development, permitted missionary coordination, content/documents and protected finance coordination. Phase 35 owns 15 gift/recurring recipes; Phase 37 owns 3 event recipes; Phase 38 owns 9 sensitive recipes; Phase 41 owns 12 mobilization recipes. The complete recipe register and WS-01–WS-26 allocation are included later in this document. Delivery ownership never substitutes for exact source readiness.

**Qualified extended channels and directory events.** Expose an SMS action only after its exact Phase 43 purpose/channel proof and the existing source message contract are available; do not activate every recipe by adding a channel enum. Phase 44 deactivation reaches the native permission owner directly and stops affected human-owner-dependent NHI actions. Optional workflow checklists may coordinate staff handoff but cannot delay revocation, grant access, collect credentials or own SSO configuration. CORE remains complete with both new phases absent.

<a id="phase-34-implementation-and-user-experience"></a>

#### Implementation and user experience

**Advance work safely.** Load authorized source facts and the current run/plan/fences, compute a pure plan, then apply a short revision-checked transaction that records new work and dispatch intent. Recheck source versions; never hold database locks during provider I/O. Use committed outbox acknowledgements or another qualified commit-aware cursor so a later transaction cannot hide an earlier uncommitted event.

**Wait without losing completion.** Persist a wait, schedule an immediate post-commit source recheck, consume source completion events and run indexed overdue reconciliation. This covers completion before registration, after registration and lost wakeups. A timeout may remind, escalate or hold within policy; it never approves a requirement.

**Prevent duplicate external effects.** The effect-owning domain assigns a permanent semantic identity across native behavior, workflows, retries and publication changes. A provider deduplication cache is only supplemental. Same identity with incompatible payload blocks for review. Expired leases after possible dispatch mean Outcome unknown, not permission to send again. Cancellation winning before source admission prevents work; admitted effects may be irreversible. Record valid late outcomes while stopping unauthorized future actions.

**Respect source clocks.** Store timezone, calendar version, anchor, time interpretation, due instant and cancellation generation. Distinguish elapsed time, local dates and business intervals. Pause only pauseable relative clocks; fixed expiries continue. Coalesce missed reminders instead of flooding recipients. CMS appointments, Support response clocks, report schedules and financial/recurring operations remain source-owned. The native CMS organization's completed scheduling authorization is not a general exemption from Studio's current human-owner authority.

**Minimize data and bound work.** Events, step returns, cancellation inputs, logs and concurrency keys contain only approved identifiers and safe routing information—not names, free text, documents, signed URLs, source records or secrets. Opaque metadata may still require restricted-purpose provider qualification. Use bounded continuations, fair queues, cost measurements and protected capacity for essential source work. Never drop accepted events to satisfy optional workflow limits.

**Make work understandable.** Provide a guided Purpose → Start → Scope and people → Steps → Review and test → Publish path, plus canvas/inspector and full outline editing. The run timeline names the real wait, responsible person and next action. Use explicit milestones rather than an arbitrary progress percentage. Lazy-load the canvas; keep participant routes light. Keyboard and single-pointer non-drag operations, screen readers and poor-network submissions are required at this phase, not deferred to Phase 39.

**Permission and instance previews.** Reuse Phase 12's approved view-as/impersonation controls where that contract permits them, with audit, bounded duration and required consent. Synthetic role and run previews do not confer real source permissions or permit live effect testing.

**Protect limited access.** Reuse protected-action exchange with an opaque high-entropy secret stored hashed, exact task/recipient/tenant purpose, expiry, rotation, revocation and non-enumerating errors. Neutral GET must not consume a link or submit/sign/approve when scanned. Deliberate exchange and every later retrieval/submission recheck authority. Stronger restricted assessment access is separately qualified; a bearer link is not a universal care-access method.

<a id="phase-34-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No tenant JavaScript, SQL, JSONPath, arbitrary network node, pasted provider key, autonomous AI approval or replacement business ledger. Derived conditions inherit the source's sensitivity unless the source explicitly supplies a safer projection. Ordinary staff must not infer sealed work from names, counts, search, My Work, logs or empty states. A financial amount comparison requires compatible currency, Legal Entity and amount basis.

Essential native behavior works without a starter or an enabled tenant workflow. Web Studio AU01–AU12 remain fixed product behavior, not optional tenant recipes. Care content stays with Phase 38; application meaning stays with Phase 41. A simulated green node, task checkbox or provider acknowledgment cannot supply missing source evidence.

<a id="phase-34-acceptance-and-release"></a>

#### Acceptance and release

Deliver real non-mobilization tracers first: qualified intake/shared-task follow-up, then private document request/review with the actual purpose owner. Add complete authoring, forms and limited participant work, simulation/publication, long waits, run amendments and version compatibility. Prove the generic product with Phase 41 and Phase 42 modules unavailable; later application or hybrid-web proof cannot replace this core evidence.

Run compiler/property tests, real Postgres grants/RLS/composite-reference/CAS/outbox/lease races, source-adapter tests, privacy and revocation matrices, and browser/accessibility journeys. Include completion-before-wait, lost wakes, replay beyond provider caches, cancellation-versus-dispatch, unknown outcomes, historical imports, changed preflights, dead dependencies and active-run upgrades. Retain the 64 cross-cutting scenarios and each assigned recipe's three source tests; the complete program catalog contains 352 specified tests, not an assertion of passing implementation.

Qualify the documented starting complexity and load profile before activation: 250 expanded nodes, depth 8, 10 branches per group, subflow depth 4, 25 external participants per request and 100 planned operations per advance. The supplied initial measurements target p95 local feedback under 100 ms, authoritative participant acceptance under 1 second excluding uploads/providers, and normal source-to-task lag under 10 seconds at p95/60 seconds at p99. Test 100 tenants, 100,000 dormant runs, 10,000 due operations and a 10× burst tenant. These are proposed qualification targets requiring an approved profile, not promises of existing capacity.

Release with a representative pilot, source-linked exceptions, independent outage detection, safe canary activation and runbooks for missing work, bad definitions, revoked owners and uncertain effects. Database restoration starts with outward effects disabled; reconcile effect identities, revocations and disposal records before reopening. CORE closes independently; the all-pack acceptance rollup cannot gate it backwards.

<a id="phase-34-open-decisions"></a>

#### Open decisions

Resolve exact shared task/record reuse, participant admission, action/fact bindings, selected provider plan/data handling, deployment limits, retention and retained-state migration. The supplied defaults for debounce, preflight/link expiry, reminders and retry budgets are proposals to qualify within source policy, not universal tenant or legal rules. Determine the actual manual/provider profiles for signing and other evidence with their owners. Do not invent missing application, care, finance or public-source services inside the Studio.

#### Existing owner requirements

Read the [complete retained Phase 34 owner obligations](../program-roadmap/owner-constraints.md#phase-34) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

**Implementation packet:** [complete workflow-studio contract](../workflow-studio/README.md).

---

<a id="phase-35"></a>

### Phase 35 — Spark-Style Contribution Triggers (`contribution-triggers`)

<a id="phase-35-what-this-phase-is"></a>

#### What this phase is

The configurable gift-stewardship pack on Workflow Studio. Staff can arrange appropriate welcome, acknowledgment and relationship follow-up from authoritative contribution, recognition and recurring facts. This is the roadmap's Spark-style outcome, delivered through the shared engine rather than another automation application.

**Primary surface:** Workflow Studio, Contributions and contextual donor/missionary follow-up. **Stable slug:** `contribution-triggers`.

<a id="phase-35-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 34, 13, 6 and 3. The workflow engine must precede the trigger pack. Recognition and recurring recipes require their exact Phase 14/16 owners; history-dependent conditions require a completeness-qualified source/reporting projection. Existing missionary tasks from Phase 28 remain native and do not wait for this pack. There is no Phase 42 dependency.

<a id="phase-35-what-it-covers"></a>

#### What it covers

**First and special gifts.** Support organization-first and designation-first qualifying gifts, same-currency threshold/special-gift attention and privacy-safe anonymous-gift awareness. Define the exact source basis, subject and occurrence; incomplete history cannot prove a first gift.

**Recognition and service follow-up.** Include tribute acknowledgments, donor-advised-fund and soft-credit stewardship, matching-gift evidence follow-up, and communication after a source-confirmed refund or correction. Keep the legal donor, recognition party and message recipient distinct. A match expectancy is not received money.

**Commitment and recurring attention.** Coordinate new-commitment orientation, named occurrence/health attention, pause/end follow-up and fixed-pledge milestones. Use the source's eligibility, opt-in and timing rules; do not create a second charging, dunning or reminder program.

**Inactivity review.** Use a source-qualified historical cohort with explicit lookback, coverage and contact restrictions. Freeze the reviewed cohort and create permitted human relationship work. Do not create a universal person-level Lapsed status or override source recurring health.

**Configuration and visibility.** Provide purpose-named triggers, approved conditions, eligible owners, messages, cadence, prospective activation, dry-run, fire history and disable controls. Conditions may use source-approved entry method, source code, designation/campaign, amount, anonymity, recognition and recurring occurrence. Actions use the shared registry: permitted tasks, messages, notifications, enrollment and only explicitly approved record changes.

**Recipe scope.** Deliver DON-01–DON-13 plus configurable MPD-01 and MPD-06: 15 recipes. DON-14–DON-16 remain development integrations in Phase 34, not a reason to delay the generic Studio until this phase.

<a id="phase-35-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 13 owns contribution facts; Phase 14 recognition; Phase 16 accepted commitment/occurrence state; Phases 6/17 communications; Phase 27 cultivation; Phase 28 native missionary follow-up; Phase 34 definitions and execution. This phase supplies source-certified trigger bindings and templates, not financial state.

Coordinate the same intended effect across native staff, organizational stewardship and missionary follow-up through the owning domain's semantic identity. Preserve different intentional messages while rejecting conflicting bodies for one effect. Public forms and custom web designs cannot bypass donor intent, source money rules or consent.

**SMS stewardship is a separately qualified channel.** A giving event never creates phone consent or sender registration. The same intended communication retains its source purpose and duplicate-prevention identity when a permitted channel plan includes Phase 43. A suppressed or uncertain SMS is not permission to resend by email, and ordinary gift stewardship remains usable without SMS or enterprise identity.

<a id="phase-35-implementation-and-user-experience"></a>

#### Implementation and user experience

Implement one source-certified gift trigger through task creation and permitted communication, including replay and suppression, before expanding the catalog. Separate event-driven triggers from scheduled cohort evaluation. Show the qualifying source event, why the rule matched, which work was accepted and which communication was suppressed or remains unknown.

Use the shared guided/canvas/outline editor and simulation; no separate rule DSL or template store. Thresholds show currency and inclusive/exclusive boundaries. Installation is disabled until an authorized tenant reviews recipients, timing and actual source readiness.

<a id="phase-35-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No raw Stripe event as a user-authored gift fact; no direct financial correction, replay, role grant, canceled-authority revival or receipt creation. Posted, settled and qualifying follow the source's exact meaning, not a universal timestamp. Refunds/adjustments must not restart a welcome journey. Required notices, official receipts, payment recovery and source-controlled pledge reminders remain native even when this pack is disabled.

<a id="phase-35-acceptance-and-release"></a>

#### Acceptance and release

Run all 45 recipe tests plus relevant shared scenarios through real source services. Test incomplete history, imports, anonymous/recognition projections, multiple currencies, adjusted/refunded gifts, paused and canceled commitments, contact suppression at dispatch and duplicate native/Studio work. Replay beyond provider caches must not produce a second business effect.

Use a representative tenant pilot and prospective rollout. Keep source receipts and accepted work when new enrollment is disabled; reconcile uncertain effects rather than replay the donor lifecycle. This phase closes the GIVING checkpoint without becoming a prerequisite of CORE.

<a id="phase-35-open-decisions"></a>

#### Open decisions

Set source-compatible qualifying definitions, available conditions, cohort completeness, thresholds, cooldowns and optional cadence during phase planning and tenant activation. Determine which supplementary recurring communications the source permits. A missing historical projection or provider evidence blocks the affected recipe; it must not be replaced by a guessed query or a green mock.

#### Existing owner requirements

Read the [complete retained Phase 35 owner obligations](../program-roadmap/owner-constraints.md#phase-35) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-36"></a>

### Phase 36 — Peer-to-Peer & Advocacy Campaigns (`p2p-campaigns`)

<a id="phase-36-what-this-phase-is"></a>

#### What this phase is

A supporter-facing fundraising product. A donor creates a personal campaign page, a team rallies around a shared goal, and staff moderate the presentation while gift attribution and money remain trustworthy. The same core supports participant fundraising for events and trips without building another fundraising system.

**Primary surface:** Public website, Donor Portal My Campaigns and Mission Control campaign operations. **Stable slug:** `p2p-campaigns`.

<a id="phase-36-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 5, 13, 25, 3 and 22. Public runtime, contributions, donor identity/projections and governed page behavior must be available. Use exact Phase 14 recognition/attribution contracts where required. Phase 37 consumes this fundraising core for trips; Phase 42 may improve its qualified presentation but is not a prerequisite or a new money owner.

<a id="phase-36-what-it-covers"></a>

#### What it covers

**Personal fundraising pages.** Create a page from a parent campaign with organization-approved starting content. Support the accepted donor edit, staff review, moderation, deactivation and retirement lifecycle. Provide permissions and clear status for draft, review and public work rather than making every edit live implicitly.

**Teams.** Support captain responsibilities, team goals, invitations/joining and rollups of eligible personal pages. Reuse the accepted group/relationship model where applicable; preserve the Phase 37 shared-group boundary rather than inventing an unrelated platform-wide group system.

**Attribution and repair.** Carry source-coded share links through checkout and retain their connection to the fundraiser and parent campaign. Use the source's influence/soft-credit model rather than transferring legal gift ownership. Provide authorized repair for missing or incorrect attribution with evidence and retained history.

**Progress and participation.** Deliver goal thermometers, countdowns, permitted individual/team leaderboards and milestones. Totals reconcile to the approved contribution basis and treatment of corrections, refunds and eligible offline gifts. Respect anonymity, restricted-worker presentation and participant visibility in rankings and aggregate views.

**Giving and donor management.** Use the existing giving/cart and donor-covers-fees behavior; do not introduce donor tipping or another checkout. Donors manage their permitted pages through the existing My Campaigns surface. Staff can moderate and close pages without deleting contribution records.

**Trip-fundraising reuse.** Make campaign/team/personal-page and attribution capabilities available to Phase 37. A registration, participant balance and fundraising goal remain distinct. Event deadlines and over-fundraising policy are source-approved integrations, not hidden edits to accepted gifts.

<a id="phase-36-ownership-and-integrations"></a>

#### Ownership and integrations

Public runtime and safety remain Phases 5/10; specialized public-page behavior remains Phase 22; Phase 25 owns authenticated donor context; Phase 13 owns gifts and allocation; Phase 14 owns recognition. This phase owns fundraising participation, page lifecycle and the source-qualified attribution relationships it introduces.

Use existing document/media and communication owners rather than local upload or mail pipelines. Any custom presentation consumes the approved public model; it cannot read private donor details or alter campaign totals. Group data and event participation must use the single accepted membership contract when shared.

**Text-to-give and fundraising attribution.** A Phase 43 keyword or approved campaign link may lead into this phase’s existing public fundraiser/checkout handoff using the qualified source code. It cannot create a fundraiser account, subscribe a visitor to outreach, change the legal donor or authorize a recurring gift. Fundraiser participation and an external identity-provider group remain separate from permission.

<a id="phase-36-implementation-and-user-experience"></a>

#### Implementation and user experience

Start with one donor creating a page, staff reviewing it, a visitor giving through its link and the donor seeing the correct result. Add teams, rankings and attribution repair over that same behavior. Make personal-versus-team-versus-campaign scope explicit, particularly when editing goals or closing pages.

Use accessible public and donor controls, clear fee wording and source-labelled progress. A removed page should have an owner-defined public disposition and retain its history. Do not imply that retirement refunds, redirects or reallocates funds unless the existing source explicitly authorizes that separate operation.

<a id="phase-36-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

Fundraiser pages are moderated presentation and attribution, not contribution or legal-donor authority. No duplicate ledger, receipt model, mutable progress counter as truth or unqualified public media path. Source codes must survive checkout. Restricted-worker protections apply to URLs, media, rankings, social previews and notifications, not just body text.

<a id="phase-36-acceptance-and-release"></a>

#### Acceptance and release

Prove page creation/review/publication, current donor access, share-link attribution through real checkout, team aggregation and source-safe retirement. Test duplicate contribution events, refunds/adjustments, anonymous donors, stale moderation, unauthorized page edits and source-code loss. Verify all displayed totals against the owning contribution basis.

Include mobile and keyboard completion, governance of media and public safety, and staff recovery of an attribution error. Preserve financial history during migration or page closure. The phase remains usable without hybrid web development or event registration.

<a id="phase-36-open-decisions"></a>

#### Open decisions

Decide open versus invite-only fundraiser creation, media/moderation depth, captain permissions, offline-gift attribution, leaderboard visibility and goal/deadline/over-funding policies. Resolve any shared-group implementation detail against the accepted CRM/group contract. Do not invent charitable-treatment rules or silently change earlier contribution policy to simplify the interface.

#### Existing owner requirements

Read the [complete retained Phase 36 owner obligations](../program-roadmap/owner-constraints.md#phase-36) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-37"></a>

### Phase 37 — Event / Opportunity Workflows & Group Management (`events-groups`)

<a id="phase-37-what-this-phase-is"></a>

#### What this phase is

The operations product for trainings, retreats, short-term trips and other serving opportunities. Staff can publish an opportunity, manage registration and capacity, organize participants, collect required evidence and communicate clearly. Application-based opportunities reuse mobilization; ordinary registration remains its own simpler path.

**Primary surface:** Mission Control Event Hub, public opportunity pages and purpose-scoped participant views. **Stable slug:** `events-groups`.

<a id="phase-37-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 5, 9, 13, 6, 29, 34 and 36, preserving the supplied program gate. Common primitives may be developed in parallel under their own owner proof, but an earlier independently released plain-registration profile requires an explicit scheduling decision; it is not silently authorized by this reconciliation. Only selected application, reference, screening or onboarding lanes require the exact Phase 41 capability. Plain registration does not depend on the entire mobilization product. Phase 41's ordinary application path does not depend back on Event Hub.

<a id="phase-37-what-it-covers"></a>

#### What it covers

**Opportunity model and publication.** Represent the supported one-day, recurring local, training and multi-week trip profiles with dates, deadlines, capacity, approved location and fund/designation context. Use qualified public pages and Phase 23 dynamic lists. Date-driven opening/closing and public availability remain source-owned; a private roster is not CMS content.

**Registration and capacity.** Own registration, reservation, seat offer, offer expiry, waitlist, cancellation and accepted disposition. Capacity allocation must be atomic and fair within the selected policy. A waitlisted person is not confirmed because a workflow finishes. Repeated submissions and acceptance-versus-expiry races must conserve seats.

**Application-based admission.** Use Phase 41 application identities, references, requirements and reviewed decisions, with Phase 34 forms, tasks and participant access. Do not fork the application/evidence model for trips. A required screening or signing profile remains unavailable until its source is qualified or an explicitly permitted manual alternative is accepted.

**Participant money.** Keep participant fees, deposits, installments and refunds distinct from third-party donations to an organization-controlled trip fund. Use the qualified source payment, classification, receipt and accounting contracts. The phase must settle the actual treatment with its finance owner before activation; a generic event template cannot decide deductibility or financial control.

**Fundraising.** Reuse Phase 36 personal/team fundraising, including supported pay/raise/both participation profiles, deadlines, giving-page availability and over-funding disposition. A fundraising total does not become a participant payment or available balance by inference.

**Groups and rosters.** Implement the accepted shared group and membership contract reserved by Phase 9, covering relevant teams, regions and participation without parallel membership tables. Provide eligible leaders, controlled rosters, attendance and authorized participant dashboards showing source-labelled schedule, financial context, fundraising progress and documents due.

**Readiness and communication.** Collect passports, waivers, insurance and training evidence through the private document/task owners. Track currentness and reviewed completion separately from upload. Send team or individual messages through the communication owner. Record event changes, departure readiness, debrief/survey and permitted follow-up without treating attendance as marketing consent or training certification.

<a id="phase-37-ownership-and-integrations"></a>

#### Ownership and integrations

This phase owns opportunity/registration/capacity/group/attendance facts and its authorized readiness outcomes. Phase 34 coordinates work; Phase 41 owns selected application decisions; Phase 29 owns private bytes; Phases 13/7/18/20 own payment, receipt and accounting meaning; Phase 36 owns fundraising.

Deliver GEN-10–GEN-12 and the event portion of WS-21 on the shared Studio. Public listing/design integrations use the existing qualified source catalog; custom components never own seats, rosters, money or access. Clinical contents stay with Phase 38 and expose only an allowed determination to the selected application path.

**Optional SMS and enterprise participation.** Registration does not establish SMS consent. A permitted reminder uses the exact Phase 43 route and recipient purpose; an IdP login only establishes its separately admitted access context. Neither channel delivery nor staff provisioning confirms a seat, application, payment or readiness decision. Event operation without these optional profiles remains required.

<a id="phase-37-implementation-and-user-experience"></a>

#### Implementation and user experience

Deliver simple registration through confirmed/waitlisted disposition first, including a real capacity race and cancellation. Then add participant evidence, groups, communications and source-qualified money/fundraising. Add the application lane only when its exact Phase 41 services are ready.

Show registration, application, payment, fundraising and readiness as separate statuses with a clear next action. Keep sensitive evidence out of public pages and broad group messages. Participant journeys must work on a phone with server save/resume, repeated-submit safety and understandable uncertainty after a dropped connection.

<a id="phase-37-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No bespoke workflow engine, side payment ledger, source-free approval or arbitrary roster sharing. Public restricted-country opportunities use approved generalized geography. Fees and donations cannot be merged into one unlabeled number. A task or deadline cannot allocate a seat, authorize a refund, complete screening or certify training. Relationship/group membership never supplies permission by itself.

<a id="phase-37-acceptance-and-release"></a>

#### Acceptance and release

Prove seat allocation under concurrent registrations, waitlist offers, expiry-versus-acceptance, cancellation and late payment evidence. Test separate payment/donation attribution, source-safe refunds, evidence expiry/revocation, unauthorized roster access and repeated participant submission. Validate publication and source-coded giving handoffs under the existing public-safety rules.

Run the three event recipes' nine tests and relevant shared/conditional application scenarios. Demonstrate a complete staff/participant journey and source-owned recovery. The EVENTS checkpoint closes here; it does not gate Phase 34 CORE backwards. No required selected application or screening path may be called complete while its adapter is a mock.

<a id="phase-37-open-decisions"></a>

#### Open decisions

Resolve recurring local-serving and volunteer scope, registration/Party dedupe, waitlist ordering and offer windows, participant-payment profiles, qualified signing/screening, group permissions and leader-side trip budgeting versus Phase 21. Use actual organizational/jurisdiction policy for financial classification; preserve all previously accepted money and identity contracts.

#### Existing owner requirements

Read the [complete retained Phase 37 owner obligations](../program-roadmap/owner-constraints.md#phase-37) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-38"></a>

### Phase 38 — Member Care, Crisis & Restricted-Ministry Operations (`member-care-ops`)

<a id="phase-38-what-this-phase-is"></a>

#### What this phase is

The confidential care and crisis product. Authorized carers can coordinate support and retain appropriate records without exposing counseling, health or sensitive ministry details to ordinary staff. Crisis responders can use explicit emergency authority and accountable communication rather than treating broad administration as permission to see everything.

**Primary surface:** A purpose-gated care area and crisis operations within the approved Asym surface arrangement. **Stable slug:** `member-care-ops`.

<a id="phase-38-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 10, 3, 4, 9 and 29. The classification, identity, projection and private-file foundations must exist first. Deep capability decisions use Phase 12. Communication and Support Hub integrations consume their exact source contracts. Native care remains usable without optional automation; the nine care coordination recipes additionally require the Phase 34 primitives and restricted-purpose provider qualification.

<a id="phase-38-what-it-covers"></a>

#### What it covers

**Sealed care records.** Maintain source-owned intake, cases, care notes and participant grants with restricted defaults. General CRM notes are not a place for clinical content. Record the authorized purpose and each participant's current role, including differences between licensed professionals and lay carers where applicable.

**Confidentiality and duty-related policy.** Capture the approved limits of confidentiality and relevant intake acknowledgments. Define source-governed escalation and reporting procedures with the responsible organizational/legal owner. The software must not invent a universal clinical or jurisdictional rule from a generic checklist.

**Care teams and continuity.** Use qualified staff-assignment relationships, named access and controlled handoff. Provide authorized caseload, check-in and follow-up views. General staff see only the specifically approved nonrevealing summary, if any; ordinary administrators must not infer sealed work from counts, names or notifications.

**Crisis operations.** Support contingency records, emergency contact trees, source-authorized proof-of-life information, incident coordination and after-action review. Break-glass access is time-bounded, justified, alerted, audited and reviewed through the existing safety authority. Maintain a tested alternate communication path independent of optional automation.

**Restricted-ministry operations.** Apply required publication restrictions, review and delayed/safe handoff through the public-safety owners. Ordinary logistics may connect to sealed work only through an approved minimal handoff that does not reveal clinical or restricted details.

**Candidate assessments.** Retain clinical/psychological assessment contents requested by Phase 41 or Phase 37 in the qualified care source with purpose-specific access and retention. Application/registration records receive only the permitted determination/reference. Neither workflow execution nor a general file picker may expose the raw assessment.

**Records stewardship.** Provide approved retention/hold/disposition evidence and privacy-request handling that respects third-party and safety restrictions. Sensitive-read audit is itself protected. A broad search or export request must not bypass the care owner merely because it is called administration or data stewardship.

**Coordination recipes.** Deliver CARE-01–CARE-08 plus GEN-18 and WS-23: nine sealed coordination recipes. Workflow Studio stores only approved references and purpose-safe outcomes; care decisions and accepted records remain here.

<a id="phase-38-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 10 owns the shared safety floor and emergency primitive; Phase 12 current capabilities; Phase 29 private custody. This phase owns care records, qualified reviewers, clinical/assessment content, care decisions, crisis dispositions and their records policy. Phase 34 coordinates approved work only.

Support Hub must remove or contain inappropriate ordinary exposure before a qualified sensitive handoff. Phase 41's ordinary applications need not wait for care; an application that actually requires a clinical determination cannot progress without its exact qualified source or a source-authorized alternative. No requirement is silently waived because a provider is unavailable.

**Extended integration privacy.** Ordinary SMS profiles exclude clinical and restricted context, and an enterprise connection administrator receives no implicit care access. Directory revocation uses current named-purpose grants; a provider outage or user departure never deletes sealed history. Any genuinely necessary future care communication profile needs its own explicit owner/provider/retention evidence, not a quiet expansion of Phase 43.

<a id="phase-38-implementation-and-user-experience"></a>

#### Implementation and user experience

Build the private intake-to-named-carer journey and prove exclusion from ordinary surfaces before adding crisis and automated coordination. Keep permissions understandable to authorized carers and disclosure-safe to everyone else. Separate records, operational tasks, clinical determinations and communication evidence.

Test every output path: list, count, search, autocomplete, My Work, exports, audit, notifications and telemetry. Qualify metadata handling, retention, access and residency for any external execution provider; identifier-only payloads alone do not establish confidentiality. Use safe source-native recovery and manual work during outages.

<a id="phase-38-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

Leadership or broad tenant administration cannot silently unseal counselor records. No clinical content in ordinary CRM fields, workflow state, Web Studio, developer fixtures, public previews, Git or AI prompts. An automation cannot grant break-glass access, assert proof of life, make a clinical decision or dispose held records. Cross-tenant sharing requires its own explicitly permitted source process, not a general connector shortcut.

<a id="phase-38-acceptance-and-release"></a>

#### Acceptance and release

Prove current named grants and revocation, sealed intake/handoff, download protection and zero unauthorized existence disclosure across all surfaces. Exercise emergency access expiry, required alerts, retrospective review and the alternate crisis communication path. Test assessment handoff to a selected application without copying private contents.

Run the nine recipes' 27 tests plus restricted source, provider-handling and shared negative scenarios. Activate only qualified purposes with a representative authorized-care pilot and approved records/recovery procedures. CARE closes independently from CORE; a general Studio safety test is not proof that a care provider or clinical workflow is qualified.

<a id="phase-38-open-decisions"></a>

#### Open decisions

Resolve sealing floors, any permitted general summary, care-surface placement, professional-versus-lay role policy, emergency authority, privacy-request/disclosure rules and purpose-specific retention. Obtain the required clinical, organizational and legal decisions from their responsible owners. Do not label this phase legally or clinically certified from specifications or automated tests alone.

#### Existing owner requirements

Read the [complete retained Phase 38 owner obligations](../program-roadmap/owner-constraints.md#phase-38) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-39"></a>

### Phase 39 — Mobile, Low-Bandwidth & Conflict-Safe Field Experience (`field-first-ux`)

<a id="phase-39-what-this-phase-is"></a>

#### What this phase is

The field-resilience phase. Missionaries and appropriate staff can use the product reliably on phones and intermittent connections, with a small explicitly approved set of offline actions and clear recovery when connectivity returns. This extends baseline mobile usability; it does not excuse earlier phases from delivering accessible, responsive interfaces.

**Primary surface:** Field-relevant missionary and staff experiences, shared client infrastructure and source command recovery. **Stable slug:** `field-first-ux`.

<a id="phase-39-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 3, 4, 9 and 28. Permitted records and stable source commands must exist before device persistence and replay can be safe. Use Phase 31 where a selected integration needs it. Workflow Studio and Mobilization already owe usable phone journeys; Web Studio already owes its supported narrow-screen authoring and review tasks.

<a id="phase-39-what-it-covers"></a>

#### What it covers

**Installable field shell.** Qualify a PWA/app-shell and cache strategy for the supported Next.js/runtime configuration. Keep offline detection and a readable recovery state. Cache policies must distinguish public assets from authorized private projections.

**Bounded read resilience.** Persist only the approved permitted slice, with schema/version control, expiry, resynchronization, context isolation and explicit device-data policy. A cached result shows its age and cannot establish current financial, permission or evidence truth.

**Named offline actions.** Evaluate the previously identified interaction logging, task completion and draft-note cases individually. Each allowed action needs a client operation identity, server reauthorization, ordered replay where dependent, bounded retries and a visible pending/synced/conflict result. Offline submission is a request waiting for acceptance, not a committed source fact.

**Conflict policy.** Define behavior per entity and field: safe automatic resolution where explicitly approved, otherwise a human-readable comparison. Preserve meaningful unsent input; do not silently merge incompatible recipient, financial, access or approval changes. Stale replay and deleted/revoked sources must produce a safe disposition rather than recreating them.

**Low-bandwidth delivery.** Set and measure route payload, image, loading and interaction budgets for real devices and network profiles. Avoid loading the workflow canvas or developer tooling on participant/read routes. Explain which tasks remain available and which require a connection.

**Context loss and recovery.** Clear private caches on logout or lost scope according to the device policy, fence delayed responses and revalidate at reconnect. Separate acknowledged server saves from in-memory input and queued operations. No interface should promise device-loss recovery for data it never durably saved.

<a id="phase-39-ownership-and-integrations"></a>

#### Ownership and integrations

All writes remain with the existing source API and current permission authority. TanStack Query and approved DB collections supply bounded client projections; they are not a new database authority. Workflow tasks and participant forms retain their own submission/evidence rules. Financial views remain source-labelled, including their currency and through-date.

Web Studio D12 and Phase 42 remain online-authoritative: private CMS drafts, source code, exact previews and publication do not enter a persistent offline mutation queue. Phase 34/41 participant server save/resume is not permission to cache restricted evidence. Public caching cannot reveal private application or care content.

**Online-only channel and identity control.** SMS enrollment/dispatch, sender/provider changes, SSO enforcement, SCIM provisioning and access grants remain online-authoritative. Device caches cannot preserve revoked staff access or turn a queued local preference edit into current send permission. Reconnect reauthorizes exact operations and fences late old-context responses through the existing owners.

<a id="phase-39-implementation-and-user-experience"></a>

#### Implementation and user experience

Start with the named field journeys and measure the actual failure modes before choosing persistence technology. Qualify candidate PWA, TanStack DB, SQLite-WASM or offline-transaction libraries against the repository's supported stack. An earlier library mention is an evaluation option, not proof of production fit.

Deliver one approved offline action through queue, reconnect, server acceptance and conflict recovery before broadening the set. Show useful status without requiring technical vocabulary. A source refusal remains visible and actionable rather than endlessly retried. Keep a straightforward online path and a safe option to abandon an unsent request.

<a id="phase-39-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No offline money mutation, batch posting, approval, public publication, account grant, protected-action exchange or restricted evidence submission. Restricted/care data is not persisted in device caches. Do not introduce blanket last-write-wins, a universal CRDT or an ad hoc bidirectional database sync engine. More ambitious synchronization requires a separate evidence-backed decision.

<a id="phase-39-acceptance-and-release"></a>

#### Acceptance and release

Test normal and slow connections, prolonged disconnect, response loss after commit, repeated replay, dependency ordering, schema upgrade, device/context loss, permission revocation and expired caches. Prove a stale offline operation cannot re-create revoked access or overwrite newer conflicting source work.

Measure complete mobile tasks, keyboard/assistive-technology use and the named bandwidth budgets. Release only the supported offline set with wipe, retention, sync-failure and rollback procedures. Verify finance, care and CMS publication remain online-only.

<a id="phase-39-open-decisions"></a>

#### Open decisions

Choose the exact offline action allowlist, cache contents and lifetime, device encryption/logout wipe posture, supported browsers/devices, network targets and conflict rules. Decide whether any additional staff journey merits offline support; financial batch entry remains excluded unless an explicit future source decision changes that boundary. Escalate to a dedicated sync engine only when measured requirements justify it.

#### Existing owner requirements

Read the [complete retained Phase 39 owner obligations](../program-roadmap/owner-constraints.md#phase-39) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-40"></a>

### Phase 40 — Data Stewardship, Global Search & AI Operator Workbench (`data-stewardship-ai`)

<a id="phase-40-what-this-phase-is"></a>

#### What this phase is

The governed find-and-improve layer across Asym: search permitted records, investigate data-quality problems and use assistance to prepare useful suggestions. Staff remain in control of consequential changes. The beyond-parity aim is less fragmented work and better source-linked decisions, not an agent that can silently rewrite the CRM.

**Primary surface:** Mission Control global search, Data Tools and the operator workbench. **Stable slug:** `data-stewardship-ai`.

<a id="phase-40-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 3, 4, 8, 9, 13, 30 and 33. Identity, permissions, source facts, import provenance and report meaning must be reliable first. Custom fields, communications and workflows add qualified capabilities. Hybrid Web Studio and Mobilization remain complete without an AI provider or this workbench.

<a id="phase-40-what-it-covers"></a>

#### What it covers

**Governed global search.** Extend the CRM search foundation across approved record types and source projections. Apply tenant, capability, classification and purpose to indexing, query, counts and navigation. Restricted sources excluded by the safety contract stay out; a hidden result must not leak through snippets, counts or autocomplete.

**Continuous data-quality work.** Provide source-linked queues for duplicate suggestions, missing/inconsistent information, stale records and qualified anomalies. Reuse Phase 8 findings, Phase 4 merge and the appropriate source correction commands. Findings describe evidence and uncertainty; they do not become a second version of the record.

**Suggestion records.** Retain the proposed action, permitted source references, model/prompt-policy version where used, evidence, confidence or evaluation information and human disposition. Clearly distinguish suggested from confirmed data. A human commit invokes the same current authorized source operation as manual work.

**Operator assistance.** Support the approved initial domains, such as record summaries, donor briefs, duplicate-review preparation, next-action drafts and source-qualified anomaly explanations. Numerical answers use only Phase 33's governed semantic definitions. Claims should identify their source basis rather than fabricate missing facts.

**Workflow and content assistance.** A workflow draft or amendment uses the same typed catalog, simulation and human publication path as manual editing. Any in-product CMS assistance uses the same content schema, exact revision, preview and release owner. External coding agents remain a developer's source-workflow choice; hosted IDE/OpenCode/BYOK is not silently added here.

**Governance and evaluation.** Provide permission checks, review, provenance, an appropriate audit record, scoped containment and provider disable controls. Evaluate unsupported claims, unsafe actions, prompt injection, leakage, user overrides and usefulness before expanding any assisted capability. The product remains usable without inference.

<a id="phase-40-ownership-and-integrations"></a>

#### Ownership and integrations

The workbench owns suggestions, search projections and stewardship coordination. Existing domains own records, access, business decisions and repair. Phase 33 owns metric meaning; Phase 34 owns workflow definition/publication; Phases 23/42 own content and qualified presentation; Phase 41 owns application decisions. No suggestion ledger can approve its own effect.

Inbound email, forms, imported text and source files are untrusted content, not instructions granting an agent authority. Source retrieval and any external model egress must respect current permission, purpose and data-processing rules. Care/restricted material remains excluded from these assistance paths under the accepted boundary.

**Channel and identity assistance.** Assistance may explain a permitted delivery failure, draft safe wording or summarize an authorized connection repair, but cannot infer phone consent, resolve identity by email, grant directory access or send autonomously. Inbound texts and directory attributes are untrusted content. Credentials, full assertions and prohibited message/evidence bodies do not enter a model prompt or global search index.

<a id="phase-40-implementation-and-user-experience"></a>

#### Implementation and user experience

Deliver useful governed search and deterministic data-quality queues first. Add assistance at one stable source seam with source-visible review and a measured evaluation set. Show what will change, why it is proposed and what is unknown; let users correct or dismiss without mutating source truth.

Use one source command and audit path for human and assisted work. Reprove scope and expected revision when a suggestion is accepted; a once-authorized draft cannot be replayed after revocation. Keep model failure, search failure and source refusal distinct. Do not make staff memorize a new permission or record vocabulary to use the workbench.

<a id="phase-40-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No direct AI writes to Party, gift, permission, care, screening or publication truth; no unrestricted database or provider tool. A high confidence score is not approval. No new analytical SQL path bypasses Phase 33. Do not send private code, operational records or evidence to a model by convenience. Any later autonomy expansion needs an explicit policy and source decision, not a threshold copied from a vendor example.

<a id="phase-40-acceptance-and-release"></a>

#### Acceptance and release

Prove source-authorized search across record types, revocation and restricted-existence exclusion. Test prompt injection and hostile retrieved content, forbidden egress, stale suggestions, changed source revisions, source citation accuracy and zero unauthorized effects. Numerical results must reconcile with the same reporting definitions used elsewhere.

Demonstrate a human-reviewed correction through the real owner, with safe rejection and recovery. Qualify the selected model/provider purpose, retention, costs and evaluation set before use. Release with deterministic alternatives, scoped disablement and accountable monitoring; never call the system correct merely because a model produces plausible text.

<a id="phase-40-open-decisions"></a>

#### Open decisions

Choose the first suggestion domains, search infrastructure and scale, provider/model/data-processing arrangements, evaluation criteria, retention and assistance budgets. Define any additional allowed context explicitly. Audit implementation and autonomy policy must follow the actual source requirements; the roadmap does not assert legal certification or authorize autonomous approval.

#### Existing owner requirements

Read the [complete retained Phase 40 owner obligations](../program-roadmap/owner-constraints.md#phase-40) together with this chapter. These preserve the precise source semantics omitted by roadmap summaries.

---

<a id="phase-41"></a>

### Phase 41 — Mobilization, Applications & Onboarding (`mobilization-onboarding`)

<a id="phase-41-what-this-phase-is"></a>

#### What this phase is

The complete application-to-handoff product. A coordinator guides a person from inquiry through application, references, interviews, a reviewed decision and preparation for service. The applicant sees understandable next steps in My Journey. This phase supplies the actual application domain and decisions, not just templates pointing to unspecified future services.

**Primary surface:** Mission Control Mobilization and the existing app's distinct participant mode. **Stable slug:** `mobilization-onboarding`.

<a id="phase-41-why-it-sits-here"></a>

#### Why it sits here

**Starting dependency:** Phase 34, including its inherited identity, CRM, safety, permission, communication and private-file floors. This phase is the next prioritized delivery after Workflow Studio; its number does not place it after Phase 40.

Selected setup paths consume exact Phase 21/28 services; connected signing/screening uses a qualified Phase 31/provider profile. Clinical assessments require the relevant Phase 38 determination. These are conditional requirements for the paths that use them, not blanket prerequisites for ordinary applications. Phase 42 hybrid web development and Phase 37 event registration do not gate this product.

<a id="phase-41-what-it-covers"></a>

#### What it covers

**Application identity and requirements.** Own inquiry/application identity, program-scoped requirements, accepted submissions, evidence qualification, decisions, conditions, preparation, readiness and handoff. Reuse Party and identity owners. One Party may have multiple independently scoped applications. A new application, resubmission, Party correction and workflow amendment are distinct operations.

**Inquiry and discovery — MOB-01.** Accept an authorized inquiry, assign a coordinator, acknowledge it through the communication owner and record discovery with an explicit proceed, follow-up, refer or close disposition. Public entry uses the existing qualified intake; an inquiry does not create missionary membership.

**Application and correction — MOB-02.** Bind a versioned multi-page form with conditional sections, server save/resume, accessible validation and immutable accepted submissions. Request corrections as attributable successors. Map answers only to the application or an independently permitted CRM command; private answers never become public CMS content.

**References — MOB-03.** Record nominations, permitted contact purpose, required categories and quantities. Use the shared limited-task access and questionnaire mechanisms, then have the source qualify the evidence. A required church reference cannot be replaced by any two unrelated references or a completed graph node.

**Interviews and screening — MOB-04/05.** Assign eligible interviewers, coordinate appointments, retain exact submitted assessment versions and obtain the authorized review. Calendar end is not interview completion. Screening uses required consent and a certified provider or a clearly labelled permitted manual path; a workflow condition or AI output never issues clearance. Clinical contents stay with their qualified restricted owner.

**Decision and conditions — MOB-06.** Prepare an exact evidence/version bundle for the authorized human decision: acceptance, conditional acceptance, deferral or decline. Keep internal deliberation restricted and publish only approved participant wording. Conditions are identifiable requirements with source-proved satisfaction or an explicitly permitted waiver. Nonwaivable requirements remain binding regardless of broad administrator access or provider availability.

**Appointment agreements — MOB-07.** Bind accepted terms to exact document versions and required signers. Superseded signatures do not satisfy a replacement agreement. A reviewed scanned signature remains manual evidence rather than a claimed certified electronic signature. Agreement replacement and missing signer recovery must be explicit.

**Operational setup — MOB-08.** Coordinate identity, finance, workspace and operations through their approved commands, recording each independent outcome and receiving owner. Acceptance alone cannot grant a role, create a Field Account, appoint a payee, redirect support or publish a worker page. Keep unresolved required setup visible.

**Training and orientation — MOB-09.** Assign the approved plan, exact course/policy versions, prerequisites and eligible instructors. Distinguish attendance, acknowledgment, assessment and accepted completion. Prior learning or waiver needs source-approved equivalence and review, not a copied completed task.

**Readiness and receiving handoff — MOB-10.** Recheck required evidence for identity, purpose, version, expiry and revocation. Record final authorized readiness separately from receiving-team acknowledgment. Accepted, appointed, onboarded, ready and deployed are different milestones; finishing a workflow does not create deployment truth.

**Hold, withdrawal and reapplication — MOB-11.** Distinguish paused execution from a held business disposition. Apply source lifecycle decisions, stop optional future requests safely, handle clocks, revoke affected limited sessions and preserve accepted history. Reapplication creates a new application identity with lineage; evidence reuse requires current source equivalence.

**Individual variation — MOB-12.** Reuse Phase 34's amendment preflight to add an interview, change eligible future work or request a permitted waiver for one applicant. Show tasks, deadlines, evidence coverage, messages and irreversible effects before committing. Preserve completed work, reasons and required reviews; do not duplicate sends or weaken nonwaivable requirements.

<a id="phase-41-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 34 owns the workflow language, compiler, React Flow/outline editing, execution, common tasks/forms, participant access and amendment machinery. This phase implements the application-specific records, accepted evidence, decisions and complete My Journey. Create the necessary bounded source service under the established API ownership boundary where no compatible owner exists; symbolic aliases are not a delivered business domain.

Reuse Phases 4/12 for identity/capabilities, 9 for Party and relationships, 29 for private bytes, and 6/17 for communication. Phase 23's public occurrence/Primary Outcome contract remains the entry boundary; do not retrofit private uploads into public launch forms. Phase 37 owns opportunity capacity, registrations, rosters and attendance while consuming this phase only for its selected application lanes.

A clinical path stores only the permitted determination/reference from Phase 38. If that exact required source is unavailable, the application cannot silently pass. Ordinary applications remain independent of care, and source-approved alternatives must be named and truthfully labelled.

**Participant communication and staff identity.** Optional SMS reminders consume Phase 43’s exact purpose; private application evidence is not placed in texts. Phase 44 organization sign-in may serve independently authorized staff, but applicant/referee sessions keep their existing limited identity boundary. Provisioning, delivery, application acceptance, appointment and receiving-team handoff remain distinct facts.

<a id="phase-41-implementation-and-user-experience"></a>

#### Implementation and user experience

Deliver complete narrow journeys in order: inquiry/application; reference/interview/screening evidence; decision and conditions; agreements/preparation/setup; readiness/handoff; lifecycle and individual variation. Use real services, protected participant routes and staff review queues at each step, not a final integration ticket expected to supply missing ownership.

The coordinator sees applications, source-backed milestones, next required action, missing owner, evidence review and handoff. Applicants see only their permitted tasks, saved/submitted items, corrections, contact and approved milestones. Referees, trainers and interviewers receive only their qualified purpose. Spouse, coach, donor status or assignment does not reveal another application or private assessment.

Use Phase 34's scanner-safe neutral link entry, deliberate protected exchange, current session checks and revocation. Forms resume from server drafts and repeated submission is safe on poor networks. A private participant route is not a personalized public CMS page or another login system.

<a id="phase-41-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No duplicate Party, financial account, workflow engine, form store, task authority or permission system. Application stage is not authority, a task is not evidence, and an accepted applicant is not automatically appointed, funded, ready or deployed. Clinical notes do not enter application fields, ordinary counts, email or orchestration state. A required review cannot be bypassed by editing the process or waiting for a timeout.

<a id="phase-41-acceptance-and-release"></a>

#### Acceptance and release

Retain all 12 MOB recipes and their 36 tests, application-specific shared scenarios, BP-04/BP-05 journey coverage and the relevant integration cases. Prove a complete application-to-receiving-handoff journey, conditional acceptance, missing required reference category, concurrent decisions, expired/revoked evidence and superseded agreements.

Exercise scanner links, same request submitted twice, lost response/wake, withdrawal versus dispatch, new application lineage, per-applicant amendments and old-version compatibility. Verify tenant/purpose isolation, no private evidence in executor state and complete keyboard/screen-reader/poor-network mobile use. A full applicant/staff pilot is required here, separate from Phase 34's non-mobilization pilot.

Release with source-safe recovery, reviewed manual/provider profiles and explicit enrollment containment. Disabling optional enrollment must preserve accepted work, source history and current access controls. MOBILIZATION closes independently and never becomes a backward gate on CORE.

<a id="phase-41-open-decisions"></a>

#### Open decisions

Set exact application/program policies, requirement and waiver contracts, evidence equivalence, participant assurance, screening/signing profiles, retention and source-compatible schema/command names. Clarify any real organizational appointment and receiving-handoff rules rather than assuming one universal ministry process. Resolve genuine predecessor incompatibilities explicitly through the accepted owner process without rewriting the already-ticketed phases.

**Implementation packet:** [complete workflow-studio contract](../workflow-studio/README.md).

---

<a id="phase-42"></a>

### Phase 42 — Web Studio Hybrid Authoring & Governed Web Development (`web-studio-hybrid-authoring`)

<a id="phase-42-what-this-phase-is"></a>

#### What this phase is

One Web Studio where staff create and maintain supported websites visually while a ministry-appointed developer supplies custom presentation through conventional source files and Git. Visual-first, code-first and mixed work share one canonical content system. The decisive outcome is that staff can still edit the supported text, media and layouts after a developer redesigns the site.

Payload stays private CMS machinery; Core Postgres remains operational CRM truth. This is not another CMS, a Payload-based CRM, a hosted coding platform or a replacement Workflow Studio.

**Primary surface:** Web Studio in Mission Control, isolated composer/preview surfaces, a public presentation SDK and governed source-delivery services. **Stable slug:** `web-studio-hybrid-authoring`.

<a id="phase-42-why-it-sits-here"></a>

#### Why it sits here

**Starting dependencies:** Phases 12 and 23, including their inherited source requirements. Exact Phase 24 Site/locale/brand/cohort operations and Phase 29 media/artifact custody gate their consuming paths. Phase 31's minimum connection, credential and revocation contracts are required for Git delivery, not for standard visual authoring.

Run this as an independent content lane when those capabilities are ready; it does not wait for Phases 34, 39, 40 or 41. The already-ticketed native CMS must remain usable without this phase. Keep three accountable checkpoints: WEB-VISUAL for a complete standard-renderer editing product, WEB-SOURCE for conventional development and governed source delivery, and WEB-HYBRID for the actual redesign-to-staff-handoff integration.

<a id="phase-42-what-it-covers"></a>

#### What it covers

**A coherent staff workspace.** Keep normal Content/Pages/Media navigation at an explicit Site and exact locale. Provide a persistent title/scope/save/preview/publication bar, synchronized canvas and outline, insertion controls and a selected-node Content/Appearance inspector. Narrow layouts switch panels deliberately. Ordinary creation and editing require no repository, GitHub account or developer settings on every Page.

**One content and save model.** Project the provider-neutral composition document into a replaceable visual adapter; bounded edit intents produce the same canonical document. Editing and movement preserve stable node IDs; duplication/cross-lineage copy creates fresh IDs. Puck state, DOM positions, source filenames and field labels are not a second stored document or identity model. Retain the qualified D11/Lexical prose grammar, exact source references and existing family restrictions.

**Bounded visual composition.** Add the explicitly adopted `asym.page-composition/2` profile for ordinary Pages. Existing flat composition/1 documents remain valid without automatic wrapping, reparenting or new retroactive limits. Articles remain prose-first and restricted; specialized Phase 22 resources keep their own grammar. Hero stays first, root-only and at most one; reusable references stay root-only, same-Site/exact-locale and nonrecursive.

| **Layout** | **Allowed placement and contents**                                                                                            | **Staff controls**                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Stack      | Root or eligible Split slot. Root Stack may contain leaves, Split or Grid within two container levels. No Stack inside Stack. | Width role, gap, surface and alignment.                                    |
| Split      | Root or root Stack. Start/end slots contain eligible leaves or one Stack where depth permits; no Split/Grid inside Split.     | Equal, wide-start or wide-end intent; gap and vertical alignment.          |
| Grid       | Root or root Stack; eligible leaves only.                                                                                     | Two-, three- or four-column intent and gap; code owns responsive collapse. |

No container contains Hero or reusable references. One logical order supplies DOM, keyboard, screen-reader and collapsed-mobile order; RTL affects logical alignment, not identity. Store finite intent rather than per-device coordinates. Width roles are narrow/content/wide; spacing compact/comfortable/roomy; surface default/muted/emphasis; inline alignment start/center. No arbitrary CSS, class name, style bag, script, breakpoint array or alternate mobile tree enters canonical content.

Preserve the supplied proposed qualification limits: 64 root entries, 128 expanded nodes including reuse, two container levels, 16 children per Stack/Split slot, 12 Grid items, one reusable expansion level and 512 KiB canonical UTF-8 JSON. Existing semantic/prose/repeater limits still apply and may be stricter. Empty structurally safe layout shells may save with diagnostics; publication requires complete content. Unsafe or out-of-scope structure is rejected, not stored under the excuse of an unfinished draft.

**Media, reuse and locale editing.** Select exact owner-qualified media/renditions and retain usage-local alt text, caption, crop and decorative treatment. Dynamic content stores permitted source references or selection intent, not copied donor, missionary or financial records. Shared sections open their separately authorized resource and show allowed impact; a Page lease cannot edit the shared resource implicitly. Locale work starts blank or from an explicitly selected revision and remains independent, without fallback or source overwrites.

**Appearance and content separation.** Page instance variants change only that instance. Site appearance/brand/settings belong to their separate approved axis and explain affected scope. Package settings are a finite admitted schema of booleans, bounded ranges, enums and qualified references; additional text meaning belongs in catalog-approved content. A Page save cannot move routes, edit Navigation, change a shared section or activate a Site design.

**A professional developer project.** Supply a conventional ministry-controlled TypeScript/TSX presentation project with styles/assets, manifest, lockfile, tests, synthetic or explicitly approved safe fixtures, local preview, debugging, setup and maintenance documentation. A fresh clone must work without Core private source, production credentials, hosted AI or a proprietary IDE. Developers can use their preferred editor and external coding agent within the same source and fixture boundary.

**Public SDK and editable bindings.** Export versioned public semantic view types, safe media/link references, deterministic presentation helpers, finite settings and registered capability-island interfaces. Separate public/server-rendering and editor/client entry points. Bind stable semantic type/version and renderer key to supported fields/settings/families/locales. Test that an edited headline or image actually changes rendered output; accepting a prop or finding a DOM node is not proof of editability. Arbitrary React cannot be promised automatic visual round-tripping.

**Repository connection and lifecycle.** Connect verified ministry-controlled source through a narrowly scoped GitHub App using both Asym permission and provider repository authority. Bind immutable repository identity, tenant/environment/project, approved package root and revocation generation. Verify callbacks and installation relationships; matching emails, repository URLs and posted installation IDs are not grants. Rename updates labels; ownership/control changes require verification; disconnect stops new intake without deleting acknowledged content or retained safe artifacts.

**Exact source capture and builds.** Resolve an authorized source selection once to immutable commit/tree and bounded bytes. Trusted fetching may hold the narrow token; remove credential-bearing Git metadata and secrets before any package script executes. Validate paths, symlinks, expansion and source policy; unsupported submodules or LFS-dependent bytes are rejected rather than silently omitted. Build only in a qualified isolated nonproduction environment with controlled dependency acquisition, egress, caches, resource limits and tenant fairness.

**Independent package admission.** Submitted tests are diagnostics, not the final oracle. Run platform-controlled conformance, source-boundary, binding, security, accessibility, locale, SSR/no-JS/hydration, dependency/license and recovery checks. Retain exact artifact/source/lock/toolchain digests, evidence, maintainer/support window, compatibility and rights. Existing D9 is the sole package admission owner; source authors cannot self-certify by rewriting their checks. An admitted package is reviewed first-party code, not an arbitrary tenant program made safe by a signature or static scan.

**Three preview modes.** Distinguish disposable developer-fixture preview, unsaved working visual feedback and the fixed exact review candidate. D25 review binds deliberately selected acknowledged content, dependencies, package/settings/brand, media, locale and compatible runtime. It is complete-or-unavailable, private, no-store/noindex and reauthorized per request. Candidate-local links and 404s never fall through to Live, and opaque IDs are not bearer permissions. Giving, forms, sends, subscriptions, tracking and consequential downloads are inert in preview.

**Controlled release and restoration.** Content/composition uses D1 with admitted code and no source rebuild. Site-wide design uses the approved appearance owner and D10 complete-locale-cohort activation. New executable packages first become available through a controlled managed application build/registry retaining required old versions; that deployment does not activate a Site. Restore creates a newly qualified successor over current compatible content and safety, not a database rewind or mutable active-theme pointer.

**Native automation.** Retain all 12 fixed AU behaviors: autosave; acknowledged preview refresh; source discovery/reconciliation; build/qualification; candidate preparation; exact scheduled publication; public projection convergence; adverse safety containment; compatibility/impact refresh; repository lifecycle; dispatch/unknown-outcome recovery; and preview expiry/retained-artifact maintenance. AU01/AU02 are editor/request behavior. Background work uses existing shared infrastructure, not a tenant-authored DSL, per-tenant cron, another queue platform or Payload Jobs publishing runner.

<a id="phase-42-ownership-and-integrations"></a>

#### Ownership and integrations

Phase 23 remains the content/catalog/editorial/reuse and publication owner: D1 public generation, D9 package admission, D10 design activation, D12 acknowledged revisions/leases, D13 exact appointments and D25 review candidates. Phase 24 owns Site, domain, locale and brand lifecycle; Phase 10 current public safety; Phase 29 qualified bytes; Phase 31 connections. This phase adds compatible authoring and development paths through those owners, not duplicate tickets or authorities.

Record HA-A1–HA-A4 as the explicit later-phase successor decisions: bounded Page composition; ministry-controlled source authorship; the Puck/isolated-origin adapter; and capture/build delivery into existing admission/release. These are local decision labels, not allocated or automatically ratified ADR numbers. Preserve the earlier flat grammar, first-party admission, identity, source safety and complete-cohort release. A genuine incompatible decision must be resolved before implementation rather than hidden in a library choice.

Use the existing API/business boundary with the private Payload adapter remaining in the admin application. Inject that adapter at the application composition root; shared packages must not import admin runtime code. A proposed SDK path is not proof that a package exists. Browser collections/hooks supply approved projections only; multi-table saves and releases use source commands.

Phase 34 may coordinate permitted exact-revision editorial review and link to owner-managed operations, but COM recipe delivery remains with its existing phase. Native CMS work and hybrid authoring remain usable with optional tenant workflows disabled. Conversely, disabling hybrid authoring must not stop the qualified native CMS.

**Enterprise session and source authority.** Any Phase 44 staff sign-in policy is enforced by the same current permission/session owner before editing, preview access, connection changes and publication. Revocation fences the applicable composer lease and stale responses without equating IdP control to ministry GitHub authority. A valid organization-owned D13 appointment retains its own completed-authorization semantics; no blanket directory cleanup silently cancels it. Native visual and code-development lanes remain independent of enterprise sign-in and SMS.

<a id="phase-42-implementation-and-user-experience"></a>

#### Implementation and user experience

**Qualify the real adapter.** Start with Puck core as the leading candidate, using its composition, fields, slots, localization and outline APIs through one bounded adapter. Confine any experimental override surface and prove upgrades. Rediscover and pin one coherent Payload-v4-compatible Next/React/editor/toolchain cohort; an old internal pin, vendor page or public documentation for another major cannot qualify it. No forced peers, mixed channels, silent major downgrade or raw-Admin fallback.

**Prove one physical commit.** Editorial content, source revision, lease/authority proof, receipt and required dispatch intent must commit or roll back in one qualified physical Postgres transaction. A Payload request and a separate Supabase HTTP/RPC call are not atomic merely because they share an identifier. Demonstrate the chosen adapter/connection with rollback injection and response-loss tests before writes ship.

**Keep saving truthful.** Coalesce a single save stream; Save now and keyboard save flush it without publishing. Only the exact receipt establishes Saved. Stop successor saves on unknown outcome and recover the original receipt or replay the identical command/key. Two tabs from one person remain separate sessions. Takeover checkpoints and fences the old lease. Compare Started from, Current draft and Your unsaved work instead of silently merging. Never imply unsent memory will survive losing the device or tab.

**Isolate the whole composer.** Run one coherent composer context on a separately qualified origin from the privileged shell. Puck's internal same-origin viewport is not that boundary. The shell retains broad authentication context, connection credentials, scope, receipt handling and publication controls. Only independently admitted renderers receive the minimum authorized editorial projection; unreviewed source uses separate synthetic previews.

**Constrain the bridge.** Validate exact origin, window source, channel nonce, sequence, schema, size and node membership for select/set-field/insert/move/duplicate/remove/layout-setting intents. No message publishes, installs source, fetches arbitrary URLs, obtains secrets or grants permissions. Server validation remains independent. Test browser engines and blocked third-party cookies. Use an equally isolated full-page composer when needed, not a same-origin downgrade. Isolation alone does not prove an admitted renderer's edit intention came from a human.

**Retain exact review meaning.** Later drafts or source commits remain excluded from an existing candidate until an explicit successor is prepared. They do not silently rewrite review or automatically invalidate it merely by existing. Current rights/safety, authority, relevant compatibility, cohort and expected-head proof still control. Code availability, admission, review, deployment, activation and delivery convergence are separate states.

**Keep scheduled intent source-owned.** D13 appointments bind exact reviewed publish/unpublish intent, civil time, IANA zone, chosen offset and resolved UTC not-before instant. Preserve at most one unresolved kind per Page/locale and publish-before-unpublish order. Use its six-day execution handoff and shared overdue reconciliation. Routine initiator departure alone does not erase the organization's completed appointment authorization; explicit invalidation does. Separate Studio actions still obey Phase 12's live human-owner ceiling.

**Recover work and retain required artifacts.** Authenticate raw Git events, accept them durably before acknowledging, and reconcile missed/out-of-order delivery. Use permanent source identities and claim fences beyond provider caches. Cancellation fences favorable commits before best-effort external termination; unknown attempts reconcile before retry. Keep source/capture/admission/history and artifacts needed by active, candidate, scheduled, recovery or held generations. Incomplete use evidence blocks purge; source disconnection does not retire the Site.

**Migrate without competing writers.** Census reached prototype content and current owners. Deploy compatible readers before new writers, prepare no-write transforms against exact revisions and commit only authorized private successors. Unknown data remains repairable; staff edits invalidate the affected plan rather than being overwritten. Retire incompatible alternate writers at the qualified switch. Do not copy a development database over editorial truth or maintain permanent dual-authority drafts.

<a id="phase-42-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No arbitrary runtime customer code, URL modules, eval, uploaded executable production bundles, tenant plugins, raw Payload product API, private operational data in renderer props, unrestricted network/process/filesystem/server-action imports or another public authority. Package CSS cannot style the privileged shell. Essential public content remains server-rendered/no-JS capable; enhancements respect reduced motion and meaningful reading order.

No public personalized CMS audience, independent Git-backed content copy, CMS draft per code branch or automatic source-to-production publication. Content paths do not inherit a new universal two-person review simply because executable code needs admission. TanStack Highlight may show safe read-only excerpts; it is not an IDE. Hosted OpenCode/BYOK, model billing and independently hosted frontends remain outside this phase's required scope.

Repository ownership is not ownership of every dependency, font or image, nor a promise to export a standalone Asym platform. Record the actual rights to build, serve and retain artifacts and provide a practical maintainer-replacement/export explanation. Current safety withdrawal overrides a previously working design.

<a id="phase-42-acceptance-and-release"></a>

#### Acceptance and release

**WEB-VISUAL.** Prove create/edit/layout/media/reuse/locale/preview/publish/schedule/recover with a standard admitted renderer while Git credentials and the custom build service are absent. Include actual adapter round-trip, complete isolated browser flow, physical transactions, migration, accessibility and staff evidence. An outline-only limited rollout is not completion of the promised visual product.

**WEB-SOURCE.** Prove fresh-clone setup, normal debugging and tests, exact verified Git capture, credential-free isolated execution, independent D9 admission, controlled runtime availability, source replacement and recovery. Test hostile install scripts, metadata/private-network access, archive expansion, symlink escape, cache poisoning and source-controlled false green tests.

**WEB-HYBRID.** Activate a real custom redesign through D10, then have representative staff independently edit supported fields and layouts, change media, identify unpublished work, preview, publish when permitted and recover a mistake without Git. Prove complete-locale atomicity, deployment skew, current safety, source disconnection and retained-artifact use. A hardcoded “editable” headline must fail binding qualification, not be explained away during training.

Retain all 48 HW requirements and 96 paired scenarios, 18 WF journeys, 12 AU automations, 27 HA work packages and Q01–Q09. The reference registers below keep them identifiable. Split common visual operations, convergence, migration and usability proof from custom-source proof so final integration does not block the basic visual checkpoint backwards. The whole phase remains incomplete until all three checkpoints and required profiles pass.

Run real restricted-role database/transaction/concurrency tests, actual pinned browser/SSR/no-JS/preview and bridge tests, source/build security, restore/upgrade, source-adapter and production-shaped capacity tests. Include keyboard and single-pointer non-drag controls, screen readers, touch, 320px reflow, 400% zoom, forced colors, reduced motion, RTL/CJK, long translations, missing assets and poor networks. Safe source invariants can block release; arbitrary accessibility scores must not become a new editorial policing system.

Release with cause-owned operations, scoped source/build/admission pause, preview revocation and public-safety containment. Keep ordinary safe edits and existing safe public generations available during unrelated build failures. Numeric test profiles are engineering proposals to adopt and measure, not current performance or customer SLA claims.

<a id="phase-42-open-decisions"></a>

#### Open decisions

Qualify the exact dependency cohort, physical transaction adapter, catalog mapping, SDK distribution, composer origin/authentication/deployment, Git App permission profile, source-repository scope, build provider/image/egress/cache policy, artifact custody/rights/retention and representative staff/developer test group. One repository belongs to one Tenant; this isolation rule is not a one-repository-per-Tenant count limit. Qualify the exact repository/project/Site relationship without inventing a commercial restriction.

Preserve the proposed capacity evaluation basis: 10 tenants × 3 Sites × 2 locales × 1,000 Pages; 100 concurrent editors including 20 in one tenant; 10 global/2 per-tenant builds; captured source ceilings of 100 MiB compressed, 500 MiB expanded and 10,000 files; a 2-vCPU/4-GiB/10-minute build envelope; and a 20-MiB compressed package excluding separately qualified media. Proposed feedback targets are p95 save server processing at 500 ms and local interaction at 100 ms, with a 1-Mbps/256-kbps, 300-ms-RTT test network, disconnect and lost-response cases. Confirm or explicitly amend these before qualification; no unmeasured larger profile is implied.

For each unresolved choice record the responsible owner, selected contract/version, permitted data, failure behavior, proof and activation/requalification conditions. Do not fill an evidence gap with an invented API, provider guarantee, admitted version or successful benchmark.

**Implementation packet:** [complete web-studio-hybrid contract](../web-studio-hybrid/README.md).

---

<a id="phase-43"></a>

### Phase 43 — Governed SMS Messaging & Channel Activation (`sms-channel-activation`)

<a id="phase-43-what-this-phase-is"></a>

#### What this phase is

**The complete text-messaging channel for eligible ministry communication.** An organization can qualify a sender, collect appropriate permission, send an approved notice or campaign, receive and answer a conversation, honor withdrawal, and understand delivery and cost. Text-to-give returns the existing secure giving link; it never collects payment details in a text message. The product is useful to a small donor-services team without requiring a workflow designer or a provider console for routine work.

Primary surfaces: Mission Control communication settings and delivery operations; Support Hub for conversations; Phase 32 campaign authoring; existing recipient preference surfaces where their source contract permits SMS. Stable slug: sms-channel-activation. The full phase includes the qualified channel, two-way support, campaign delivery, and text-to-give journeys described here. A restricted channel pilot is not completion of that whole scope.

**Existing commitment and new delivery.** Phase 17 D9, ADR-0028 and issue #892 deliberately reserve evidence while making SMS execution structurally impossible. This phase is the accountable later successor: it adds actual channel operation through the same authorities. It does not rewrite Phase 17's completed specification/ticket scope or reinterpret a historical Planned state as consent, registration or permission to send. New operational records, capability names and provider choices below require the normal phase PRD/OpenSpec adoption and implementation proof. \[R-SMS-01\]

**Benchmark and design basis.** SiteStacker advertises text marketing; its dated text-to-give guide describes a third-party keyword reply carrying a giving link. Virtuous documents a guided, verified toll-free SMS setup, while HubSpot exposes quiet-hour deferral and understandable send timing. Asym adopts the useful outcomes, not a competitor's provider, country coverage, blanket consent attestation or ability to bypass a safety floor. These are documented offerings, not independently tested competitor behavior. \[C-01–C-05\]

<a id="phase-43-why-it-sits-here"></a>

#### Why it sits here

Starting dependencies: Phases 6, 12, 17 and the minimum Phase 31 connection/credential contracts, including the inherited identity, Party/contact, classification and consent foundations. Build the channel only against the actual qualified source contracts, not the current email-only consent function or a provider SDK's defaults. Phase 26's conversation contract gates the two-way Support Hub lane; Phases 5 and 13 gate the text-to-give handoff; Phase 32's campaign occurrence and audience contracts gate organization-wide marketing delivery. Each is a capability-specific prerequisite rather than permission to block unrelated foundation work.

**Delivery positions.** SMS-CHANNEL proves registration, consent, safe dispatch, withdrawal, evidence and recovery. SMS-CONVERSATIONS proves ordinary inbound and staff reply work. SMS-OUTREACH proves a complete Phase 32 campaign and source-coded text-to-give. All three are required for full Phase 43 completion. The Phase 31 integration foundation closes without SMS; its text-to-give consumer closes here. Phase 32's email and external-newsletter lanes close without SMS; only its SMS delivery profile consumes this phase. Neither dependency may become a startup import or all-channel acceptance cycle.

**Optional consumers.** Phases 28, 34, 35, 37 and 41 may expose individually qualified SMS purposes after the channel exists. They do not automatically gain a new delivery step or permission to contact every known phone. Phase 38 crisis and clinical work remains outside the ordinary SMS profile; the existing alternate crisis communication plan is not replaced by a carrier-delivery badge. Phase 44 sign-in is independent: enabling ministry SMS does not enable SMS authentication or weaken required assurance.

<a id="phase-43-what-it-covers"></a>

#### What it covers

**Supported operating profiles.** Publish a closed, versioned support matrix for provider, customer-account topology, originating sender type, destination market, message purpose, inbound capability, language/encoding, registration requirements and operational limits. Qualify at least one complete two-way profile serving the selected pilot market before activation; record the actual supported combinations rather than claiming worldwide support. Twilio is a researched candidate, not a committed dependency. Number purchase, porting, registration and provider charges require an authorized operator and an exact consequence review. Unsupported routes remain unavailable, not silently sent through another country or shared sender. \[T-01, T-02\]

**Sender setup and maintenance.** Guide an authorized administrator through organization/account authority, the exact sender and use case, required disclosures, registration evidence, connection credentials, callback proof, monitored reply destination and a controlled canary. Show separate pending, rejected, stale, disconnected and ready components with a cause-owned next action. Registration observations are evidence about the exact route; an administrator cannot type Approved. Preserve number ownership, porting/replacement and retirement history. A sender change requires fresh scope/consent compatibility proof and cannot reset suppression or transfer another ministry's identity.

**Five independent eligibility axes.** Retain platform capability, exact sender-route readiness, affirmative recipient consent, recipient preference, and suppression/withdrawal as separate facts. A useful Ready summary is derived from their current qualified combination, not a new mutable authorization Boolean. Each producer must additionally prove its business purpose, recipient authority, content, timing and current source conditions. A donor receipt or urgent reminder is not an exemption from the existing absolute do-not-contact or SMS-withdrawal floor. Required notices remain governed by their source-approved alternative handling rather than an improvised SMS override. \[R-SMS-01\]

**Phone identity and enrollment.** Reuse the contact owner's exact phone revision, normalization and evidence. Format validity, apparent mobile capability, provider-observed origin, possession verification, identity, and consent are different facts. Enrollment records tenant, Party, phone revision, sender, use case, message class, disclosure version, method, source, time, market, actor and lineage as required by the existing contract. Present a clear voluntary choice and a separate way to decline without losing unrelated functionality. Imported phone lists, gifts, email subscriptions, notes, prior messages, relationship labels and staff assertions do not establish SMS consent. Changed numbers, shared household phones, reassignment and Party corrections require the appropriate current proof; they never silently transfer a private conversation or another person's permission.

**Withdrawal, HELP and renewed permission.** Process standard opt-out keywords and reasonable withdrawal through the source suppression owner before ordinary conversation automation. A known sender/phone withdrawal must be enforceable even when Party matching is unresolved. Repeated or reordered evidence cannot erase a newer restriction. HELP is assistance, not subscription. START or a provider unblock does not recreate all the required purpose-specific consent; renewed permission needs the documented evidence and current phone binding. A broad withdrawal is not narrowed merely because the campaign has several topics. Any exceptional statutory or carrier confirmation is a separately approved, minimal provider-control response, not permission for another promotional send. \[R-SMS-01, T-01, T-03\]

**One response authority for control keywords.** Determine whether the provider has already sent the STOP/HELP response. For a Twilio profile, use its documented OptOutType evidence and configured Messaging Service behavior, rather than unconditionally sending a second confirmation. Preserve Core's own withdrawal evidence through provider service, account and sender changes; provider suppression is an additional enforcement layer, not the only record. Unknown or inconsistent provider control state blocks favorable resubscription and produces an actionable reconciliation case. \[T-02, T-03\]

**System notices and human messages.** Each code-originated notice uses a meaning-specific Phase 17 contract and an explicitly qualified SMS step. Required/optional steps, recipient policy and whole-message recovery remain source-owned. Human-authored support replies and campaigns use their owning composition and purpose contracts outside the system-message catalog, while delivery still goes through Phase 6. No generic transactional label may transform marketing into a protected notice. The initial qualified use cases must demonstrate a real source-backed notice, staff conversation and organization campaign, not only a provider test send.

**Content, links and language.** Provide readable sender identity, required withdrawal/help wording, safe typed personalization, locale handling and the exact link destination. Validate the fully rendered recipient-specific text, including mandatory wording and substituted variables. Show segment count and estimated cost for the selected route and encoding; Unicode and concatenated-message boundaries need actual encoder tests. Do not silently truncate, transliterate, replace a person's name, omit disclosure, or change a protected link to meet a segment budget. Provider smart-encoding behavior must be disabled or explicitly qualified against exact prepared-content meaning. Links use approved source destinations; no arbitrary shortened redirect, private record identifier or reusable signed document URL. \[T-04\]

**Timing, pressure and budgets.** Record the source occurrence, intended business deadline, not-before instant, recipient time-zone evidence, applicable quiet-hour policy/version, expiration and cancellation generation. Show when deferred work is expected to send. A phone's country code or area code does not prove the recipient's current zone. Unknown zone handling must be conservative and explicit in the qualified profile. At dispatch, recheck the current permitted window; expire stale notices instead of delivering a flood after an outage. Coordinate optional contact pressure across campaigns and workflows without suppressing source-required non-SMS handling. Separate message admission, provider throughput, segment cost estimates and observed charges; these are not donor funds or the contribution ledger.

**Two-way Support Hub.** Resolve tenant and sender from an authenticated provider/account binding, then record the inbound occurrence through the conversation owner. Preserve provider message identity, route and exact external correspondent; normalize a phone only through the contact contract. Ambiguous matching creates a restricted review task, not automatic Party creation, account claiming or disclosure of an existing conversation. SMS has no email References chain: threading and reopening require an explicit route/correspondent/conversation-epoch policy. Sender reassignment must not attach a new person's messages to old private history. Reuse assignment, collision-safe send, internal-note separation, quarantine, status and response clocks. Unknown attachments or MMS cannot enter an unqualified byte-fetch path; show a safe unsupported-content result.

**Requested public text-to-give.** A keyword may request one source-approved public checkout link with the tenant, Site, source code, designation and giving context preserved. The giving owner validates the destination at use; a keyword cannot authorize a charge, an amount, a saved payment method, account access or a future marketing series. Unknown correspondents require an explicit additive Phase 3/6 requested-response contract before this lane ships: a provider-authenticated inbound request supplies evidence only for its narrow response, without fabricating Party enrollment or reusable consent. Keep that evidence distinct from Phase 17's Party-bound marketing/notice permission. Bound repeat requests, prevent loops and unsafe disclosure, and honor current route/withdrawal policy. The public link contains no account-specific bearer authority; a scanner GET does not donate or subscribe. \[C-03, T-01\]

**Organization campaign delivery.** Phase 32 supplies the reviewed content and audience/send occurrence. This phase supplies the SMS route, eligibility and channel evidence. Preview excluded and uncertain recipients, expected segments, cost and timing; create no live effects during preview. Stop can prevent not-yet-admitted work but cannot recall messages accepted by a provider. A recipient's opt-out between review and release removes that effect without silently widening the audience elsewhere. Do not send the same occurrence through both a provider broadcast and an independent per-recipient loop.

<a id="phase-43-ownership-and-integrations"></a>

#### Ownership and integrations

**One responsibility for each fact.** Phase 3/6 retains consent, suppression, recipient-specific intent and communication history; Phase 4/9 retains identity and contact meaning; Phase 12 retains the sole permission decision point. Phase 17 owns system content and channel-plan admission. Phase 26 owns conversations and their content-retention policy. Phase 31 owns connection and credential lifecycle. This phase owns channel profiles, sender-route qualification, provider-specific execution/evidence interpretation and the supported channel experience, extending those owners rather than replacing them. Phase 32 owns campaign/audience occurrences, and Phases 5/13 own giving.

Logical records below describe required semantics, not approved physical table or API names. Census existing storage first. Every new owned record needs an ownership-matrix row, exact writer, same-scope references, retention policy, conflict rule and repair path. Provider accounts and message IDs are external references, never Core tenant or business-effect identity.

| **Record or contract**                          | **Owner and minimum binding**                                                                   | **Required integrity**                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| SMS operating profile and activation evidence   | Channel owner; exact provider/route/market/purpose/schema and evidence generation               | Code-qualified profile; no tenant switch that bypasses proof; explicit withdrawal and requalification              |
| Sender-route and registration versions          | Connection/channel owners; tenant, environment, sender, provider account, use case and market   | Same-scope references; immutable observations and attributable succession; current readiness is derived            |
| Phone and permission evidence                   | Existing contact and consent owners; exact phone revision and purpose                           | No permission transfer on merge, number change, import or reconnect; suppression remains independently enforceable |
| Prepared communication and business receipt     | Phase 6; source occurrence, purpose, recipient, channel, exact body/reference and route version | Permanent semantic identity, conflict on changed payload, current read authorization; no parallel SMS history      |
| Dispatch attempts and provider observations     | Phase 6 with channel adapter; exact request, attempt, route and provider message reference      | Append-only evidence; legal state transitions; uncertain submission cannot become retryable by lease expiry        |
| Inbound occurrence and conversation binding     | Phase 26 with authenticated channel ingress                                                     | Scope-complete duplicate prevention; correspondent epoch; no false account identity from a telephone number        |
| Keyword routing and requested-response evidence | Channel/intake owner plus giving resolver                                                       | Exact public source binding and purpose; no charge, private access or ongoing subscription as a side effect        |
| Pressure, usage and repair projections          | Channel operations; source-labelled counts and observed provider cost                           | Derived, permission-safe, currency-labelled where relevant; no financial authority or payload-bearing logs         |

**Database and privacy integrity.** Require trusted non-null tenant/environment scope, same-scope contact/connection/source references, uniqueness for the exact business receipt and inbound occurrence, constrained transitions and revision/fence checks. Apply the existing coarse tenant RLS/grant posture plus the sole current PDP on privileged and browser-facing paths. Raw sender credentials, consent proof, phone identities and message content stay outside generic client collections, search and orchestration logs. Append-only evidence is subject to lawful source-owned retention; it is not an infinite-content archive.

**Repository placement.** Use shared auth/session helpers from packages/auth, business operations and source adapters in packages/api, approved browser projections in packages/database, and shared controls in packages/ui. A communications/sms subtree is a proposed placement to reconcile with the actual Phase 6 module; it is not a claim that the folder or public API exists. App routes stay thin. The inspected packages/api/src/email/consent.ts is an email-only legacy precedent, not an SMS decision engine. Follow the exact base-maia/Base UI system and the repository's current pinned dependency and test commands. \[R-CORE-01–R-CORE-04\]

**Execution and external disclosure.** Reuse the existing Inngest dispatch/claim infrastructure with bounded coded handlers. Events and step results contain approved opaque references only, not numbers, message bodies, consent documents, signed URLs or credentials. Restricted metadata requires its own data-handling qualification. The service may load an authorized prepared body inside the effect-owning boundary; it must not return that body into orchestration history. Do not add an Inngest app per tenant, a universal provider abstraction, or a workflow-owned send endpoint.

<a id="phase-43-implementation-and-user-experience"></a>

#### Implementation and user experience

**Atomic local admission, qualified remote work.** Prepare and commit the source request, exact eligibility evidence, receipt and required outbox intent in a short transaction. Final source admission serializes relevant withdrawal/cancellation/currentness checks. External I/O occurs after commit under the existing claim/fence protocol. Record what cancellation can still prevent. A withdrawal accepted before final admission prevents the send; one arriving after irreversible submission cannot be represented as recalling it. Provider delivery evidence does not prove that a human read, agreed, donated or completed a task.

**Unknown outcomes and retry.** Retain one permanent source-purpose identity across UI retries, workflow/native callers and provider-cache expiry. Same identity with incompatible content blocks. A timeout after possible provider acceptance, including a lost response before a message ID is stored, becomes Outcome unknown. Query exact supported correlation evidence or hold for controlled review; matching only phone, body and approximate time is not proof. Do not assume the selected provider's message-create endpoint supports an arbitrary idempotency header. Qualify its actual behavior; an unresolved old attempt cannot trigger a new provider, sender or fresh-key retry. Core can prove its own admission invariants, not promise globally exactly-once carrier delivery. \[T-05\]

**Authenticated ingress.** Validate callbacks using the exact provider protocol and SDK under the pinned version. For Twilio, signed form requests depend on the public request URL and parameters; JSON uses its documented body-validation arrangement. A generic raw-body HMAC or a fabricated mandatory timestamp is not an interchangeable verifier. Derive the external URL from trusted deployment configuration, not arbitrary forwarded headers. Bind the verified account and destination route before accepting payload scope; retain durable occurrence IDs and duplicate protection. Acknowledge only accepted work, with a bounded response time. Preserve privacy-safe rejected-event evidence without logging secrets or raw hostile text. \[T-06\]

**Critical intake remains available.** Withdrawal and authenticated outcome intake need protected capacity independent of campaign budgets, subscription limits and optional workflow availability. The platform may stop new sends while still accepting restrictions and late outcomes. Where the exact provider protocol permits, commit suppression immediately and defer ordinary thread processing. If durable acceptance fails, return the protocol's truthful retry/failure response and alert rather than falsely acknowledging a lost opt-out.

**Default user journey.** Use Set up sender → Prove readiness → Choose purpose/audience → Compose → Review → Send or schedule → Inspect outcomes. Keep advanced registration and provider diagnostics behind permission-scoped details. Routine staff see the sender, why a recipient is eligible or excluded, the exact intended timing and the next recovery action. Show registration pending separately from campaign queued. A safe canary uses explicitly consented controlled recipients and cannot inherit a real donor segment.

**Implementation packages.** Each package includes its own current contract, migration where needed, permission proof, real tests, accessible UI, observability and recovery; the last package does not retroactively supply missing safety. IDs are planning identifiers, not created GitHub issues. Reconcile ticket overlap before publishing a new backlog.

| **Package** | **Complete implementation outcome**                                                                    | **Predecessors within this phase**   | **Acceptance cases** |
| ----------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------ | -------------------- |
| SMS-W01     | Census source contracts, preserve transport-dark generation, adopt exact successor and support profile | None; foundation owners required     | SMS-AT-01, 02        |
| SMS-W02     | Governed account/sender setup, exact registration evidence, credential rotation and visible readiness  | W01                                  | AT-03, 04, 22        |
| SMS-W03     | Phone-purpose enrollment, withdrawal, re-consent and current eligibility through existing owners       | W01                                  | AT-05–09             |
| SMS-W04     | Authenticated durable ingress and control-keyword handling, including overload protection              | W02, W03                             | AT-08, 10, 11, 20    |
| SMS-W05     | Exact prepared text, encoding/segment proof, time-window/deadline and budget preflight                 | W02, W03                             | AT-12–14             |
| SMS-W06     | Phase 6 dispatch, permanent identities, provider evidence and ambiguity recovery                       | W04, W05                             | AT-15–18             |
| SMS-W07     | Qualified source notice through its explicit Phase 17 contract, without workflow dependency            | W06                                  | AT-02, 19            |
| SMS-W08     | Complete Support Hub inbound, assignment, safe reply and correspondent lifecycle                       | W04, W06; exact Phase 26 contract    | AT-21–23             |
| SMS-W09     | Public keyword-to-giving-link with bounded unknown-correspondent requested-response contract           | W04, W06; exact Phase 5/13 contracts | AT-24, 25            |
| SMS-W10     | Organization campaign send/schedule/stop and source-labelled outcomes                                  | W06; Phase 32 occurrence contract    | AT-16, 26, 27        |
| SMS-W11     | Consent-preserving migration, route replacement, privacy disposition and safe restore                  | W07–W10                              | AT-28–30             |
| SMS-W12     | All-profile load, accessibility, user pilot, independent outage monitoring and release evidence        | W11                                  | AT-20, 31, 32        |

<a id="phase-43-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No second CRM, consent flag, communication history, Support Hub, financial ledger or SMS workflow language. No number-based account claiming, hidden group texting that reveals other recipients, automatic marketing enrollment, donor-controlled provider replay, or broad Force send capability. Provider purchase/usage records do not alter donations, receipts or Asym subscription billing. Human authorship does not exempt application-mediated texts from applicable provider and legal rules. \[T-01\]

No clinical, counseling, restricted-worker identity/location, passport, banking or other prohibited private content in the ordinary SMS profile, even behind a short link. Inbound sensitive material is untrusted input and follows the existing containment/handoff owner. Its arrival cannot expose sealed context to a general agent. No emergency-service, guaranteed-delivery, end-to-end-encryption, universal jurisdiction-compliance or authentication-factor claim is made by shipping this phase. MMS, WhatsApp, RCS, voice, native payment-by-text and unsupported international senders require separate explicitly approved profiles or scope.

Phase 17 preservation. Keep historical evidence-only semantics and negative fixtures. The successor must replace a blanket runtime absence assertion only through an explicit, scoped architecture/contract change: old/inactive profiles still cannot create work; a new qualified profile can execute only the enumerated purposes and channels whose proofs pass. Do not delete the non-inference, withdrawal, exact phone, tenant-isolation or privacy tests to make activation green.

<a id="phase-43-acceptance-and-release"></a>

#### Acceptance and release

**Every case below is specified, not executed.** Pair real provider/profile evidence with database and browser tests. Mocks can exercise error handling but cannot certify sender registration, callbacks, phone control, carrier outcomes or production delivery. Required profiles and their quantitative workloads must be approved before measurement; record actual versions, countries, account arrangements, controlled test recipients and evidence scope.

| **Case**  | **Required observable proof**                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SMS-AT-01 | With only the Phase 17 generation or an unqualified profile, every SMS creation path remains unavailable; existing evidence still reads correctly.            |
| SMS-AT-02 | Activating one exact source purpose does not activate another purpose, tenant, sender, country or channel; missing required proof rejects before work exists. |
| SMS-AT-03 | A real verified setup reaches usable readiness; partial/rejected/stale registration and forged account ownership never do.                                    |
| SMS-AT-04 | Secret rotation and route replacement preserve current scope; copied ciphertext, another tenant's account and revoked credentials fail safely.                |
| SMS-AT-05 | Explicit enrollment captures the required disclosure and phone-purpose evidence; a gift, email opt-in, imported number or staff checkbox alone cannot enroll. |
| SMS-AT-06 | Shared, corrected, reassigned and changed phones do not inherit private threads or old consent; ambiguous identity remains a visible unresolved state.        |
| SMS-AT-07 | A do-not-contact change or source eligibility loss between preview and admission prevents the affected send, including a required/urgent-labelled request.    |
| SMS-AT-08 | STOP and reasonable withdrawal suppress before ordinary follow-up, including unresolved Party matching, repeated events and adverse orderings.                |
| SMS-AT-09 | HELP changes no permission; START/provider-unblock without complete fresh applicable evidence cannot resume recurring outreach.                               |
| SMS-AT-10 | Provider-generated control response is recorded without a duplicate platform response; ordinary acknowledgments cannot loop with another autoresponder.       |
| SMS-AT-11 | Real signature validation covers trusted proxy URL construction, all required parameters, JSON variants, tampering, replay and wrong-account routing.         |
| SMS-AT-12 | Fully personalized text crosses GSM/Unicode/concatenation boundaries correctly; no truncation, protected-link change or hidden encoding rewrite occurs.       |
| SMS-AT-13 | Quiet hours, unknown zone, daylight-saving boundaries, source expiration and delayed recovery produce the documented not-before/expired outcomes.             |
| SMS-AT-14 | Budget and provider throttling truthfully defer/refuse new optional work without dropping accepted intent or blocking withdrawal ingestion.                   |
| SMS-AT-15 | Double submit, response loss, concurrent native/Studio requests and replay beyond provider caches preserve one semantic effect identity.                      |
| SMS-AT-16 | Cancel/withdrawal versus admission has a deterministic boundary; already-submitted work remains truthfully irreversible or uncertain.                         |
| SMS-AT-17 | Provider acceptance with a lost response, including no stored provider ID, cannot cause a fresh-key retry or automatic route/provider failover.               |
| SMS-AT-18 | Late, duplicate and reordered delivery observations do not invent reading or business completion; incompatible evidence requires reconciliation.              |
| SMS-AT-19 | One actual source-backed system notice succeeds with optional Workflow Studio absent; existing required email/in-product behavior stays intact.               |
| SMS-AT-20 | Fault and overload drills retain all durably accepted restrictions and outcomes, enforce fair capacity and expose independently detected outages.             |
| SMS-AT-21 | An inbound message, assignment, collision-safe staff reply and later response work through the actual Support Hub and one communication history.              |
| SMS-AT-22 | A sender port, reassignment, disconnect or ownership change cannot attach a new correspondent to prior private conversation history.                          |
| SMS-AT-23 | Internal notes, raw attachments, sealed-care context and unrelated recipient details cannot escape through SMS, exports, previews or diagnostics.             |
| SMS-AT-24 | Known and unknown keyword requesters receive only a permitted source-coded public giving link; no Party claim, consent enrollment or payment occurs.          |
| SMS-AT-25 | A retired designation, changed route, malicious keyword/URL, repeated request and link scanner cannot misdirect a gift or perform a hidden action.            |
| SMS-AT-26 | A reviewed campaign sends only currently eligible intended recipients, shows exact exclusions and does not execute twice through native/provider lanes.       |
| SMS-AT-27 | Schedule/change/stop and partial campaign failure retain original occurrence identity and truthful per-recipient outcomes without blocking email-only work.   |
| SMS-AT-28 | Import or provider migration retains provenance and restrictions; incomplete legacy evidence remains unconsented rather than silently repaired.               |
| SMS-AT-29 | Privacy/retention and backup restore preserve minimal required restriction/effect evidence without resurrecting removed content or repeating messages.        |
| SMS-AT-30 | Killing new SMS sends preserves withdrawal, authenticated late-outcome intake, authorized history and recovery; reconnect does not replay old campaigns.      |
| SMS-AT-31 | Real administrator, campaign author and support agent complete their jobs with keyboard, screen reader and narrow-screen layouts.                             |
| SMS-AT-32 | The approved provider/market profile completes all three checkpoints with measured performance/cost, operating runbooks and a representative tenant pilot.    |

**Release evidence.** Record local commit/receipt correctness, exact source-adapter qualifications, provider request/response and callback behavior, actual browser accessibility, controlled recipient tests and a production-shaped load profile. Set admitted recipient counts, simultaneous campaigns, route throughput, maximum queue age, callback response budget, pressure limits and cost ceilings from expected tenants and provider evidence before activation. Report p95/p99 measurements and observed backlog-drain behavior, not a generic SMS SLA. A failed mandatory profile remains incomplete even if a smaller pilot works.

**Operations and recovery.** Provide playbooks for registration rejection, expired evidence, lost credential, unknown submission, wrong-recipient suspicion, provider outage, abuse, number transfer, withdrawal dispute and privacy/backup restore. Investigate using authorized source references rather than raw-provider-console replay. Restore begins outbound-disabled; reconcile suppressions, route generations, consent and prior attempts before reopening. New-sends shutdown must not shut down critical safety intake. Assign named operational and compliance owners, escalation paths and an independently tested monitoring mechanism.

<a id="phase-43-open-decisions"></a>

#### Open decisions

Before dispatch, record the chosen pilot market, originating sender type, provider and account/billing ownership; the exact sender/use-case registration program; permitted source notice and campaign classes; recipient-phone assurance; required disclosure and renewed-permission policy; handling of shared numbers; unknown-zone timing; provider request idempotency/correlation; retention, residency and support-safe content; safe unknown-correspondent requested-response contract; throughput, spending limits and operational ownership. Each decision needs an owner, selected contract/version, evidence, failure behavior and requalification trigger. A generic later developer choice is not permission to leave these gates undefined at release.

**Legal and carrier qualification is time-sensitive and distinct from software tests.** The September 2026 review included FCC DA 26-12, which extends only the identified cross-topic informational revocation requirement to January 31, 2027; it is not a delay of every consent or withdrawal rule. Obtain current jurisdiction-specific review for the actual ministry/use case, including applicable nonprofit treatment, carrier/provider restrictions and privacy obligations. Core's stronger recorded withdrawal and do-not-contact floors remain binding unless their own authorized successor contract changes them; this roadmap supplies no universal legal exemption or compliance certificate. \[L-01, T-01\]

**Implementation packet:** [complete governed-sms contract](../governed-sms/README.md).

---

<a id="phase-44"></a>

### Phase 44 — Enterprise Sign-In & Directory Integration (`enterprise-identity-integration`)

<a id="phase-44-what-this-phase-is"></a>

#### What this phase is

**Organization-managed staff access without a second identity or permission system.** A ministry connects its organizational identity provider, tests sign-in, safely binds existing people, provisions approved staff access and reliably removes it when someone leaves. The same person may separately remain a donor or belong to another tenant; enterprise sign-in must not merge those identities or permissions merely because an email address matches.

Primary surfaces: Mission Control administration for Sign-in & Directory, existing shared application sign-in/callbacks, My Access and source-owned access-recovery views. Stable slug: enterprise-identity-integration. Supabase Auth remains the authentication engine; Phase 12 remains the only authorization decision point. This phase owns enterprise connection, federation admission, directory synchronization and identity-provider lifecycle, not a new CRM, HR system, tenant-signup product or authorization engine.

**Existing commitment and new delivery.** Phase 12 D9/§J and issue #686 ratify an inert SSO/SCIM configuration home and one safety-critical deactivation adapter, while explicitly deferring full identity-provider integration. This phase completes that handoff under a separately adopted successor contract. Earlier configuration rows, a social-login button or a successfully parsed SAML assertion do not prove enterprise sign-in or directory lifecycle is delivered. The current shared auth code is implementation evidence, not proof that the target Phase 12 substrate already exists. \[R-ID-01, R-ID-02, R-CORE-03\]

**Benchmark and design basis.** SiteStacker's SAML documentation identifies Google and Azure configurations. HubSpot documents connection testing, optional/required SSO and SCIM provisioning, demonstrating that administration and account lifecycle are part of the user-facing product. Asym should provide similarly understandable setup and recovery while keeping its stronger tenant, principal, sensitive-grant and source-ownership boundaries. Vendor email matching, role-name mapping or broad administrator exceptions are not imported as authority. \[C-02, C-06, C-07\]

<a id="phase-44-why-it-sits-here"></a>

#### Why it sits here

Starting dependencies: Phases 4 and 12, plus the minimum Phase 31 connection/credential/audit capabilities actually used. Their inherited Party, privacy, classification, governed communication and causal-revocation contracts remain binding. Shared connection tooling does not become a new permission authority. The enterprise foundation can proceed without the whole public API catalog, SMS, Workflow Studio, Mobilization or hybrid Web Studio.

**Capability checkpoints.** ID-SIGNIN proves one complete connection, sign-in, existing-account transition and enforced staff-access policy. ID-DIRECTORY proves the selected provisioning/group/deactivation lifecycle with current source authority. ID-OPERATIONS proves renewal, reconciliation, containment, recovery, migration and real administrator/staff use. All are required for full phase completion. The already-required Phase 12 deactivation behavior remains independently available without the new enterprise interface; Phase 44 cannot become a backward blocker for Phase 12.

**Initial profile direction.** Use Supabase project-level SAML as the first federation path and qualify Microsoft Entra ID and Google Workspace sign-in profiles for the SiteStacker parity outcome. Qualify a complete SCIM 2.0 provisioning profile with Microsoft Entra ID, including Users, the required supported Group operations and deactivation. Okta and additional providers/protocols may join the certified matrix only with their own evidence; they are not implied by SAML/SCIM labels. Google SAML support does not itself prove arbitrary Google directory provisioning works. Preserve reserved OIDC configuration without silently activating a second federation stack. Exact product plans, runtime support and supported operations are pre-build qualification decisions, not assumed services. \[I-01, I-03, C-02\]

<a id="phase-44-what-it-covers"></a>

#### What it covers

**Verified organization connection.** An authorized tenant administrator creates a connection in the exact tenant/environment, supplies or retrieves bounded provider metadata, proves administrative control, reviews issuer/entity identity and redirect settings, and tests with a controlled account. Record provider identifier, connection identity, approved domains for discovery, protocol/profile, trust versions, capability evidence, operational owner and recovery posture. Domain verification assists discovery; it never proves tenant membership or permission. A Site domain, company email suffix or posted provider identifier cannot claim another tenant's connection.

**Connection lifecycle and enforcement.** Support draft, verification/test, available, required-for-selected-staff, degraded, suspended, retiring and disconnected semantics as explicit versioned policies, without collapsing connection health into access permission. First test; then permit a bounded pilot; then enable required sign-in only after account-impact and recovery proof. Explain which staff assignments and surfaces are affected. A valid non-SSO session must not bypass the required-SSO policy by entering through another app or old callback. Policy changes re-evaluate current sessions through the existing governance epoch. Do not change a shared Supabase project's global settings in a way that silently affects unrelated tenants.

**Safe staff sign-in.** Prefer the application-initiated SAML flow using the supported PKCE/session mechanism. Provider launch tiles may link to Asym's sign-in entry so the application starts that flow. Do not disable PKCE merely to make unsolicited identity-provider-initiated SAML work: Supabase currently documents that limitation. Bind the request to exact connection, tenant, approved redirect, browser/session challenge, nonce/state where applicable and expiry. The protocol library/engine must validate issuer, audience, recipient, correlation, time, signature and replay according to its supported profile. A successful authentication creates a verified principal context, not an automatic broad role. \[I-01\]

**Trusted authentication evidence.** Resolve the exact verified Supabase user/session and provider binding server-side. Distinguish authentication method, provider, authentication time, assurance and tenant assignment. Do not authorize from user-editable metadata, email domain, an unverified JWT, the first element of an authentication-method array, a role string or a client tenant selector. A provider ID is not a tenant ID. Current Phase 12 checks continue on every protected request and consequential operation; a trusted login token is not a permanent permission snapshot. \[R-ID-02, R-CORE-03\]

**Existing accounts and identity succession.** Inventory existing local/social/SSO principals, Party links, tenant assignments, invitations, active sessions and protected grants before enforcement. Supabase's documented SAML behavior allows the same email on separate regular and SSO accounts and does not provide their automatic/manual identity linking. Therefore implement the supported Phase 4 owner-approved binding or principal-succession journey rather than claiming a provider merge exists. Require evidence of the intended existing identity and new connection identity, show affected access and retain exact historical principals and authorship. Suspend and re-attest sensitive grants as the existing identity-change contract requires. Do not edit Supabase auth internals, merge Parties, union grants or attach financial history by email alone. Missing safe existing-account transition keeps the affected enforcement profile incomplete. \[I-01, R-ID-01\]

**Several roles and tenants.** Keep the human, Party, authentication principal, Active Tenant Assignment, Support Assignment participation, workspace access and operational responsibility distinct. Deprovisioning in tenant A must not delete a global human/Party, another tenant's membership, donated gifts or the person's independent donor authority. A provider's user-wide session cleanup may require reauthentication more broadly; disclose and test that technical effect separately from permission scope. Reauthentication in tenant B must never restore access in A. A spouse, team relationship or shared email address is not an enterprise account-binding rule.

**Admission and just-in-time behavior.** Define whether a certified connection uses pre-provisioned membership, existing approved invitations, or an explicitly authorized bounded just-in-time admission policy. Default unknown identities to no operational access. A preapproved ordinary starter may be applied only through the existing membership/capability owner under current policy; an inert default_membership_role column is not a sufficient grant. Do not create a tenant or populate a real organization merely because an IdP authenticated someone. Concurrent SCIM provisioning and first login must converge on the same exact external-subject binding without duplicate principals or accidental grants.

**SCIM service and protocol truth.** Deliver the exact SCIM 2.0 endpoints and representations required by each certified profile: honest ServiceProviderConfig/Schema/ResourceType discovery where applicable; stable Users and supported Groups; bounded filtering/pagination; required create/read/update/PATCH/deactivate behavior; appropriate status/error responses; concurrency/version behavior; and explicit unsupported-operation responses. Publish the actual supported attributes, operators and PATCH shapes. Do not claim full RFC support while silently ignoring a required operation. Protocol compatibility must be demonstrated with the real identity provider, not only handcrafted HTTP requests. \[I-03, I-04, I-05\]

**Scoped external identity.** Use server-owned resource IDs and immutable source bindings scoped to tenant, environment, connection/directory generation and external subject. SCIM externalId and mutable userName/email serve their defined protocol purposes; neither is a globally unique Core identity. Never let a client select another tenant by body attributes. Where a provider uses an email-shaped or otherwise mutable NameID, qualify a non-reassigned persistent subject or stable directory/attribute binding instead of pretending the email is permanent. The profile must demonstrate renamed and recycled identifiers; missing stable binding blocks automatic admission. Attribute changes update only approved identity-source fields; they do not rewrite legal donor names, CRM ownership, worker status or clinical records. Omitted, null, replaced and removed values follow the exact supported PATCH semantics. Changes that alter bound identity trigger the existing re-evaluation rules rather than retaining sensitive grants unexamined.

**Source-governed group mapping.** Map verified external group identities to explicitly approved flat Asym groups through Phase 12 commands. A rename changes a display label, not the grant target. Preview affected principals and permission consequences before approving a mapping or changing its scope. Preserve direct versus directory-derived membership provenance so removal of one mapping does not erase an unrelated grant, while tenant deprovisioning still invokes the full existing tenant-scoped revocation contract. Do not infer access from group-name similarity or flatten unknown nested memberships by guess. Do not activate reserved nested-groups or ABAC-condition engines as a side effect of SCIM support.

**Sensitive access remains separately governed.** Directory provisioning can request only source-approved membership outcomes. It cannot grant security clearance, bypass maker-checker rules, activate a privileged just-in-time grant, self-approve a protected action or manufacture a named-person care grant. The same None/View/Manage/Admin explanation may be reused for configuration, but the existing capability registry and final subtractive privacy/safety/entity/purpose floors enforce the result. A source group labeled Finance does not prove financial or donor instruction authority.

**Deactivation and reactivation.** An authenticated applicable active=false or certified equivalent invokes the existing Phase 12 revocation operation for the affected tenant assignments and current session/stream invalidation. Record source-observed time when known, local received time, local access-denied time and provider-cleanup outcome separately. Do not wait for a workflow, human task, campaign budget or bulk-change approval to enforce a valid received revocation. Deleting a SCIM resource retires that external admission and access under policy; it does not erase CRM/financial history. Reactivation is a fresh authorized lifecycle transition with current admission and grant proof, not revival of all former grants.

**Lifecycle-aware retries.** The Phase 12 seam's deactivation-only deduplication is not sufficient for a full deactivate → reactivate → deactivate lifecycle if reused as a permanent connection/subject/Boolean key. Define an exact command/source generation and lifecycle-aware receipt so redelivery of the same revocation is harmless but a later genuine revocation always applies. SCIM does not promise a universal caller-supplied event sequence or idempotency header: do not require an invented field for interoperability. Serialize relevant subject updates, use supported conditional versions or current source reconciliation, and prevent stale positive updates from overriding a known deactivation. If authoritative ordering cannot be proved, hold reactivation for the approved recovery/admission path and return an honest protocol result. \[R-ID-01, I-03\]

**Directory reconciliation.** Show the configured scope, last successful synchronization, source freshness, pending changes, mismatches and failed users/groups. Provider silence or an incomplete page of results does not prove deletion. A reconciled complete snapshot may propose changes only under the approved scope policy; it is not a blanket replacement of Core memberships. Large planned local mapping changes need an impact review, but upstream accidental-deletion protection is a separate provider control and must never cause Core to acknowledge an unapplied individual revocation as successful. Unmatched deactivation records remain visible security exceptions and retain a source-scoped negative admission fence, so a late create or first login cannot bypass a previously received leaver signal. Only an explicitly authorized, currently proved successor can clear that fence; these events cannot be dropped as harmless empty results. \[I-06\]

**MFA, sessions and assurance.** SSO means federation, not automatically strong enough authentication for every Asym action. Qualify how the chosen provider/Supabase profile conveys authentication method, freshness and required assurance, and use the existing step-up policy. Do not treat any claimed AuthnContext as verified Core assurance or introduce SMS MFA merely because Phase 43 exists. Current Supabase documentation says SAML Single Logout is not supported and notes that session controls are evaluated during refresh; local causal authorization must therefore deny revoked access even while a cryptographically valid access token exists. Provider logout is not the sole access-revocation mechanism. \[I-01, I-02\]

**Recovery and administrator continuity.** Before required SSO is enabled, exercise the existing Phase 12 recovery/break-glass path with qualified administrators and accountable audit. Avoid a permanent unaudited password bypass, a shared master account or a broad support back door. Recovery is time-bound, purpose-scoped, reauthenticated and visible to its authorized owner, with a documented return to normal enforcement. Ordinary last-owner configuration safeguards must coexist with the source's emergency/deprovisioning rules: do not silently retain an unsafe person's access just to preserve an owner count. Resolve any real policy conflict through the existing authorization owner before this profile ships.

**Connection rotation, replacement and exit.** Support certificate/metadata rotation with a reviewed bounded overlap and explicit retirement of old trust; reverify issuer/control changes. Replacement IdPs/directories use a reviewed binding and identity-transition plan, not a changed URL on a live record. Suspending a connection fences new favorable sign-ins/provisioning according to policy while retaining safe revocation/recovery operations. Only currently authenticated or already durably accepted negative work may continue; retired credentials do not become a permanent deprovisioning back door. Routine provider outage is not evidence that users were deleted. Disconnection does not delete business history, silently enable password access, or revoke another tenant's connection. Record who maintains certificates, receives warnings and can authorize replacement.

<a id="phase-44-ownership-and-integrations"></a>

#### Ownership and integrations

**Authentication versus business access.** packages/auth retains the shared session and callback machinery; Supabase Auth verifies the supported federation flow. Phase 4 owns identity binding and claiming. Phase 12's resolveProjection and existing grant-state operations own effective access, epochs, assignment scope and sensitive-grant policy. Phase 31 supplies narrowly scoped connection/credential lifecycle. This phase owns enterprise connection/admission settings, source binding, provisioned-resource mapping and synchronization evidence. A directory supplies observations or permitted requests; it never becomes the final authorization engine. \[R-CORE-01, R-CORE-02, R-ID-02\]

**Logical records and interfaces.** Extend the existing inert configuration home wherever its qualified shape fits. Proposed details must be reconciled with implemented predecessor contracts; do not create parallel sso_connection or group stores because a different name is easier. Non-human connector credentials obey the current Phase 12 owner/purpose limits; negative-event processing and recovery need an explicitly qualified service capability, not a broad service-role exception.

| **Record or contract**                           | **Minimum meaning**                                                                                                     | **Integrity and authority**                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Enterprise connection and trust versions         | Exact tenant/environment, provider identity, protocol/profile, issuer, trust, owner and lifecycle                       | Same-scope keys; versioned trust; no arbitrary metadata URL or mutable enabled flag as complete proof       |
| Staff sign-in policy                             | Exact affected assignments/purposes, admitted providers, enforcement mode, exceptions and generation                    | Changed only by current authority; checked server-side across app entry points; no global tenant inference  |
| External-subject binding                         | Connection/directory generation, immutable external subject, local auth principal and approved Party/assignment linkage | Unique exact binding; no email-only link; current identity proof and historical attribution preserved       |
| Provisioned resource and command receipt         | Stable SCIM resource identity, externalId, source scope/version, requested operation and authoritative result           | Idempotent lifecycle-aware application; no silent unsupported PATCH; no cross-tenant body selector          |
| External group mapping and membership provenance | Stable external group, selected existing Asym group and attributable membership contribution                            | Flat approved mappings through Phase 12; no label-derived capability or destructive full replacement        |
| Revocation and reconciliation evidence           | Source/received/enforced times, exact affected assignments, denial receipt and cleanup outcome                          | Deny-first local authority, durable unmatched exceptions, no Boolean-only lifetime deduplication            |
| Identity transition and enforcement preflight    | Reviewed old/new bindings, expected versions, impacted access, required re-attestation and recovery proof               | Current source commit; no permission union, provider identity-table hack or history rewrite                 |
| Operational/recovery audit                       | Authorized policy/trust changes, test results, containment, certificate expiry and recovery use                         | Minimal protected evidence; no passwords, tokens, full assertions or unrestricted directory payload archive |

**Database and egress integrity.** New tenant-scoped records require non-null trusted scope, same-tenant/environment connection and subject references, uniqueness for exact external bindings, revision-aware mutations, minimal append-only audit and explicit retention/disposition. Browser roles cannot enumerate raw identity, mapping, assertion or credential records. Use the existing coarse tenant RLS/grant posture as defense in depth and enforce fine-grained permission through the sole PDP, including privileged service paths; no provider-derived RLS policy may become a second authorization model.

**Core implementation boundaries.** App sign-in/callback routes reuse or re-export shared contracts; they do not each construct a new provider client. Business persistence and authorization composition remain in packages/api, with browser-safe query hooks in packages/database and shared administrative controls in packages/ui. A proposed enterprise-identity subtree is a placement decision, not an existing API claim. Keep provider SDK/management credentials server-side in the established environment/secret boundary. The inspected packages/auth/context.ts demonstrates current Supabase/Next session handling but its prototype role/context shape cannot substitute for the future effective-access token. \[R-CORE-01–R-CORE-03\]

**Downstream effects.** Source-backed deactivation must invalidate cached private projections, protected streams and queued work whose authority depends on the revoked principal. Phase 34 non-human automation grants retain their live human-owner ceiling; do not transfer ownership automatically. Existing source appointments whose completed organization authorization legitimately survives routine initiator departure, such as the qualified Web Studio D13 contract, remain governed by that owner rather than a blanket delete-all-jobs rule. Finance, mobilization and care histories remain immutable or corrected through their owners; directory changes do not redirect support, appoint successors or erase records.

<a id="phase-44-implementation-and-user-experience"></a>

#### Implementation and user experience

**Start with proof of the substrate.** Read the current Phase 4/12 contracts, issue #686, nearest AGENTS.md, actual callback/session code, group mutation functions, epoch/stream behavior, credential registry and migrations. Classify real code, forward contracts and obsolete paths. Verify supported Supabase project-level SAML capabilities, plan/region limitations, SDK/runtime cohort and provider test configuration before choosing the adapter. Do not implement a new identity service solely because old source still has coarse role checks.

**Metadata and federation security.** Use the qualified protocol engine instead of custom SAML cryptography or a handwritten XML parser. Bound metadata retrieval, document size, redirects, permitted endpoints and trust updates; reject private-network/metadata-service fetches, external entities, malformed XML and unapproved algorithms. Validate the intended issuer/audience/recipient and exact assertion/request relationship with replay and expiry tests. Keep authentication artifacts out of URLs, analytics, logs and long-term generic audit; retain only the approved minimal evidence. Configuration testing must not grant production administrator access. \[I-01, R-ID-02\]

**SCIM access and request integrity.** Use a dedicated tenant/connection-scoped credential with only certified provisioning operations, secure transport, rotation, revocation and audit. Never expose a project service key as the SCIM token. The endpoint resolves scope from that verified credential and configured path, not body-provided tenant values. Reject arbitrary password, grant, role or business-data writes and return standards-compatible errors for unsupported attributes/operations. Protect filtering and pagination from injection, unbounded queries and cross-scope enumeration. Limit payloads and group changes without losing valid received negative security events.

**Transactions and external identity creation.** Commit local mapping, membership/grant changes, epoch, receipt and required outbox intent through the appropriate owning transaction. Supabase administrative identity creation and a separate business-database request are not automatically one transaction. Where external creation is required, use a recoverable operation with a stable subject binding and no effective access until local authority accepts it. A partially created authentication account stays unentitled and visible for source-owned repair; retry cannot create another privileged principal. Preserve lock order and compare-and-swap expectations across native and directory mutations.

**Truthful synchronization and revocation.** Provider-directory polling latency is not the same as Core enforcement latency. Measure and show both where observable. Preserve Phase 12's applicable immediate/managed-stream bound after local accepted revocation; verify its actual implementation instead of relying on JWT expiry or changing a project-wide timeout. Killing an expired connection must not cause already authenticated late positive requests to reactivate it. A recovery or reconnect needs a new verified generation and an explicit plan for retained revocation evidence.

**Usable administration.** Guide the operator through Connect → Test → Review affected accounts → Enable a pilot → Require for selected staff → Monitor. Present separate controls for sign-in, directory provisioning, group mapping and recovery. Staff see which organization they are signing into and a safe next action for denied access, wrong account, expired invitation or provider failure without learning internal principal terminology. Preserve user work through reauthentication where its source permits, but never replay a consequential mutation automatically with a new identity.

**Implementation packages.** Each package includes the relevant source contract, tests, migration, current access checks, accessible user journey, observability and recovery. The identifiers below are planning labels, not GitHub issues or completed implementation.

| **Package** | **Complete implementation outcome**                                                                    | **Predecessors within this phase** | **Acceptance cases** |
| ----------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------- | -------------------- |
| EID-W01     | Qualify current identity/PDP substrate, reserved seams, exact support matrix and adopted successor     | None; foundation owners required   | EID-AT-01, 02        |
| EID-W02     | Verified connection/trust configuration and nonprivileged end-to-end test setup                        | W01                                | AT-03, 04, 21        |
| EID-W03     | Shared application-initiated SAML callback/session path and exact provider/tenant binding              | W02                                | AT-05–08             |
| EID-W04     | Reviewed existing-account transition and concurrent login/provisioning identity convergence            | W03                                | AT-09–12             |
| EID-W05     | Scoped SCIM protocol, discovery, Users lifecycle, current source mutation and honest errors            | W01, W02                           | AT-13–15             |
| EID-W06     | Stable group mappings, reviewed permission impact and source-provenanced membership changes            | W05                                | AT-16–18             |
| EID-W07     | Lifecycle-aware deactivation/reactivation, current epoch/stream denial and unmatched-event recovery    | W04–W06                            | AT-19, 20, 22, 23    |
| EID-W08     | Optional/required staff enforcement, tested step-up and controlled administrator recovery              | W04, W07                           | AT-08, 24–26         |
| EID-W09     | Complete directory reconciliation, operational freshness and safe mapping-change review                | W06, W07                           | AT-27, 28            |
| EID-W10     | Certificate/provider succession, scoped disconnection, privacy and restore controls                    | W08, W09                           | AT-21, 29, 30        |
| EID-W11     | Downstream authority propagation through source tasks, workflows, finance and content                  | W07, W10; exact selected consumers | AT-31, 32            |
| EID-W12     | Certified provider interoperability, accessibility, fault/load tests, user pilot and operating release | W11                                | AT-33, 34            |

<a id="phase-44-boundaries-and-guardrails"></a>

#### Boundaries and guardrails

No replacing Supabase Auth, bypassing Phase 12, trusting group names, merging by email, sharing credentials, automatically granting broad membership, or copying an IdP directory into the CRM as a new system of record. No public account enumeration through domain discovery or provider errors. No tenant-wide social-login toggle presented as enterprise SSO. Directory provision/deprovision does not create marketing consent, a missionary appointment, a care determination, compensation/payee authority, donor authority or a financial write.

**Only the explicitly adopted SSO and provisioning successors activate.** Reserved nested groups, arbitrary ABAC conditions, bulk permission widening, unrelated NHI sender constraints and enterprise commercial features stay under their existing owners and activation rules. This phase must not quietly implement all the reserved fields in issue #686. Recovery does not grant access to sealed care or bypass an independent financial approval.

**Protective behavior is not optional automation.** Validated deactivation cannot depend on an enabled Workflow Studio template or wait for a staffing handoff. Manual ordinary group changes, directory changes and protected emergency changes must converge through the same grant-state owner, with their distinct required authority. Retain old-generation inertness tests alongside new qualified-profile tests; do not simply disable assertSsoInert or remove identity-change safety fixtures globally.

<a id="phase-44-acceptance-and-release"></a>

#### Acceptance and release

**All cases are specified, not executed.** Demonstrate real provider behavior in controlled test tenants and the actual authenticated application/database stack. Source code, green documentation checks or a successful vendor-console login are insufficient. Record supported provider plans, metadata/profile versions, schemas, credential custody, exact identity-transition policy and evidence for each completed profile.

| **Case**  | **Required observable proof**                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EID-AT-01 | The Phase 12 reserved generation remains inert for sign-in/provision-up while its qualified active=false safety adapter still works independently.                                                            |
| EID-AT-02 | One adopted enterprise profile cannot activate a different protocol, nested groups, ABAC, tenant provisioning or another tenant's connection.                                                                 |
| EID-AT-03 | A real administrator configures and tests the correct tenant/provider; spoofed domains, posted provider IDs and wrong-account control cannot bind.                                                            |
| EID-AT-04 | Hostile metadata, private-network URLs, invalid trust, replayed assertions, expired signatures and audience/recipient mismatches fail safely.                                                                 |
| EID-AT-05 | Application-initiated SAML and an IdP bookmark through that path preserve PKCE and the approved redirect without a separate app-local auth client.                                                            |
| EID-AT-06 | Verified provider/session evidence binds the correct principal and tenant; user metadata, email domain, role label and array ordering cannot grant access.                                                    |
| EID-AT-07 | A new authenticated but unadmitted identity has no operational permissions; any permitted starter uses the current approved membership command.                                                               |
| EID-AT-08 | Required SSO applies across relevant protected app routes and existing sessions; an old password/social token or alternate callback cannot bypass it.                                                         |
| EID-AT-09 | Existing regular and SSO accounts sharing an email require the approved proof/binding transition; they do not silently merge or union grants.                                                                 |
| EID-AT-10 | Identity/email succession preserves attribution, protects financial history and suspends/re-attests sensitive grants under the predecessor contract.                                                          |
| EID-AT-11 | Concurrent first login, SCIM creation, repeated callback and response loss converge on one source binding without duplicate privileged accounts.                                                              |
| EID-AT-12 | Partial external-auth creation before local acceptance remains unentitled and recoverable; an orphaned provider account cannot acquire authority.                                                             |
| EID-AT-13 | The real selected IdP completes supported SCIM discovery, lookup, create, update and PATCH cases with correct resource and error semantics.                                                                   |
| EID-AT-14 | Credential/body/path scope mismatch, cross-tenant external IDs, token replay after rotation and unbounded/hostile filters cannot enumerate or mutate.                                                         |
| EID-AT-15 | Null/omitted/removed attributes, case rules, pagination and supported version conditions match the declared profile; unsupported operations never report false success.                                       |
| EID-AT-16 | Stable external group IDs map only to approved flat groups; a rename, recycled name, nested group or forged claim cannot expand permissions.                                                                  |
| EID-AT-17 | Removing a mapping removes its attributable membership effect without erasing unrelated grants; the existing privacy/purpose/entity floors still subtract.                                                    |
| EID-AT-18 | Directory changes cannot self-approve clearance, sensitive elevation, named care access or a financial operation through a friendly group label.                                                              |
| EID-AT-19 | Received active=false denies applicable tenant assignments within the existing Phase 12 enforcement bound and invalidates protected streams and queued user authority.                                        |
| EID-AT-20 | Deactivate → reactivate → deactivate is processed correctly; duplicate old messages and stale positive updates cannot swallow the second revocation.                                                          |
| EID-AT-21 | Certificate rotation, expired metadata and issuer/provider replacement use exact reviewed trust generations; no unrelated tenant is changed.                                                                  |
| EID-AT-22 | Unmatched deactivation is durably visible, repairable and fences a later first login/create; valid negative security events are not delayed by optional workflow or campaign limits.                          |
| EID-AT-23 | SCIM deletion/deactivation in tenant A does not delete Party/gifts or tenant B authority; any broader provider reauthentication effect is accurately disclosed.                                               |
| EID-AT-24 | Required assurance and step-up are actually proved; SSO, asserted MFA, SMS availability and provider logout cannot substitute for local authorization.                                                        |
| EID-AT-25 | A tested authorized administrator recovery works during IdP failure without a permanent shared bypass or automatic sealed-data access.                                                                        |
| EID-AT-26 | Last-owner protection and legitimate emergency/deprovisioning follow the approved owner policy; unsafe access is not retained silently for convenience.                                                       |
| EID-AT-27 | Incomplete directory snapshots, provider silence, removed scope and upstream deletion quarantine remain visible uncertainty, not mass local deletion.                                                         |
| EID-AT-28 | Reviewed mapping changes show exact impact; concurrent native edits or changed authorization invalidate stale plans instead of overwriting current grants.                                                    |
| EID-AT-29 | Disconnect/reconnect and provider transition fence old positive work, reject newly presented retired credentials, retain accepted safe revocation/recovery and do not automatically enable password fallback. |
| EID-AT-30 | Privacy and backup restore retain required minimal revocation/identity evidence without restoring deleted contents, old tokens or revoked memberships.                                                        |
| EID-AT-31 | A revoked workflow human owner cannot authorize a queued NHI action; no automation ownership or task responsibility transfers by directory inference.                                                         |
| EID-AT-32 | Legitimate organization-owned content appointments follow their source policy; directory changes cannot erase finance/care history or redirect money.                                                         |
| EID-AT-33 | Administrator and staff finish setup, sign-in, denied-access recovery and required migration using keyboard, screen reader and narrow-screen layouts.                                                         |
| EID-AT-34 | All selected Entra/Google sign-in and selected SCIM profiles complete the three checkpoints, production-shaped fault/load tests and documented user pilot.                                                    |

**Operating evidence.** Measure connection lookup, callback completion, concurrent sign-in/provisioning, directory batch size, largest group update, local revocation propagation, stream closure, reconciliation backlog and cross-tenant workload isolation. State source-event latency separately from received-to-denied latency. Approve the quantitative profile before testing and report observed results; do not invent a universal upstream synchronization SLA. Repeat the deactivate/reactivate cycle and old-session access attempt against the actual session and database implementation.

**Rollout and containment.** Release by exact tenant/connection/profile with a tested optional pilot before mandatory staff enforcement. Preserve a source-authorized recovery path, existing donor/public access and unrelated tenants. Shut down new positive federation/provisioning independently from required negative-event processing and recovery. Restore with favorable admission disabled until connection generations, identity bindings, revocations and memberships are reconciled. Retiring old trust or readers requires evidence that required sessions/history and recovery no longer depend on them.

**Runbooks.** Include failed setup, wrong-account login, an existing-account collision, unexpected JIT admission, invalid SCIM PATCH, group drift, unmatched leaver, delayed upstream deactivation, lost certificate, IdP outage, malicious metadata, compromised connector credential, last-owner loss and backup restore. Each names the responsible source owner, safe diagnostic evidence, exact supported operation and escalation. No runbook should repair by editing auth tables, deleting a Party or clearing a governance epoch manually.

<a id="phase-44-open-decisions"></a>

#### Open decisions

Resolve the exact Supabase project/plan/runtime cohort and provider profiles; SAML initiation and assurance evidence; existing-account binding/succession supported by Phase 4; pilot enforcement scope; whether bounded JIT admission is allowed; SCIM authentication and supported verbs/attributes/filter/PATCH/version behavior; immutable external identity source; group-mapping approval and provenance; lifecycle ordering/reactivation proof; provider-wide versus tenant-scoped session cleanup; certificate overlap/rotation; connection-owner departure; negative-event service authority; recovery personnel and procedure; retention/residency; and the approved quantitative load/revocation profile.

Each decision needs an accountable owner, concrete selected behavior, evidence and a safe unresolved state. Library/provider gaps must be resolved through the supported adapter or an explicit source-compatible successor before the affected required profile can close; a successful new-user demo cannot stand in for migration or deprovisioning. Do not promise unsupported SAML Single Logout, automatic account linking, arbitrary OIDC providers, every SCIM feature, or instantaneous receipt of upstream directory changes. Refresh current vendor and standards evidence at build and before activation. \[I-01–I-06\]

<a id="roadmap-recipe-register"></a>

**Implementation packet:** [complete enterprise-identity contract](../enterprise-identity/README.md).

---

## Governance — how this roadmap changes

Update this roadmap, phase-map and structured phase inventory together. Preserve
stable phase slugs and existing ticket IDs. Any future renumbering requires an
explicit old→new map and a same-change sweep of affected documents and issues.
Scope additions do not prove runtime delivery, and new phase adoption does not
reopen predecessor tickets. Read the [adoption and source-disposition record](../program-roadmap/README.md)
and the current [document-authority guide](../../ai/document-authority.md).
