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
2. **Program roadmap** — [`roadmap.md`](./roadmap.md) (**Roadmap v2, adopted
   2026-07-07**) — the source of truth for the phase set, numbering, ordering,
   dependencies, and per-phase scope summaries. The table below is a compact
   mirror of it; **if they ever disagree, `roadmap.md` wins** and the mirror
   must be fixed.
3. **Program charter + inventory** — [`README.md`](./README.md) and
   [`parity-matrix.md`](./parity-matrix.md) (the 25-area tracking source of
   truth).
4. **Phase PRDs** — the `phase-0X-*.md` files in this folder.
5. **ADRs, evidence files, and the GitHub issues** for each phase.

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
- clear, source-specific provider boundaries: Asym owns its operational
  intent, source coverage, and audit evidence; Stripe, banks, and QBO/Xero
  remain authoritative for the exact external facts and outcomes each
  produces
- better CRM data-health, recovery, and reconciliation paths
- better testing, evidence, accessibility, and responsive UX

This mirrors the charter's definition of parity: _"can a missions org get the
same real-world job done here?"_ — not _"did we replicate SiteStacker's
screens?"_

## A note on phase numbers — read before trusting a file name

**Roadmap v2 (2026-07-07) renumbered every phase above 9.** Documents and
issues written before that date cite **v1** numbers; decode them with the
[renumbering map in `roadmap.md`](./roadmap.md#renumbering-map-v1--v2). The
same-day congruence sweep updated all live PRDs, docs, and open issues — if
you find a stale v1 number anywhere, fix it against the map rather than
guessing. Phases 0–9 were **not** renumbered.

Never cite a phase as a bare number in new writing — always **"Phase N
(Name)"** — so future re-sequencing can be swept mechanically.

The one live file-name mismatch today:

- **`phase-01-crm-operating-foundation.md` is superseded.** Its content became
  the current **Phase 8 — CRM Operating Foundation**
  ([`phase-08-crm-operating-foundation.md`](./phase-08-crm-operating-foundation.md)),
  after the earlier foundation phases (2–7) were inserted ahead of CRM depth.
  The `phase-01` file carries a SUPERSEDED banner and should not be built from.
- **The conceptual "Phase 1" slot (Source-of-Truth Ownership Matrix) has its
  own PRD file** —
  [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md)
  (ruled 2026-07-06, backed by
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)) —
  and is **not** the same thing as the tombstoned
  `phase-01-crm-operating-foundation.md`.

Every other groomed phase file number matches its conceptual phase
(`phase-02` = Phase 2, … `phase-09` = Phase 9).

## The roadmap (compact mirror)

The full table — with slugs, soft dependencies, per-phase scope summaries,
and the v1→v2 renumbering map — lives in [`roadmap.md`](./roadmap.md). This
mirror carries the order, hard dependencies, and status only.

**Status legend** (conservative — never claim a phase is implemented,
deployed, or live without repo/evidence proof): `PRD exists` — a groomed
phase PRD file is present in this folder. `future (needs PRD)` — recognized
phase, scoped at roadmap depth, no PRD yet. `Built?` / `Live?` status for
capabilities that already have code lives in
[`parity-matrix.md`](./parity-matrix.md) — all matrix `Live?` cells are
`unconf` until the human-only Phase 0 Lane 2 check runs.

The Phase 16 qualifier `epic #793 + #794–#837; groomed-not-dispatched` means its
PRD and issue set exist, but no implementation dispatch has been authorized.
The Phase 17 qualifier `epic #873 + #874–#905; groomed-not-dispatched` means its
PRD and blocked issue set exist, but no implementation dispatch has been
authorized and no child carries `ready-for-agent`.
The Phase 18 qualifier `epic #907 + #908–#961; approved frontier #908–#910`
means its PRD and published issue set exist. Children #908–#910 are open with
`status:todo` + `ready-for-agent`; #911–#961 remain open with
`status:blocked`. Those labels do not prove implementation or authorize further
dispatch.

The Phase 19 qualifier `epic #977 + #978–#1031; blocked/not-dispatched` means
its PRD authority map, traceability, research, congruence, ADR, OpenSpec package,
and issue set exist, but no implementation dispatch has been authorized.

`PRD in PR #872` means the Phase 17–20 planning package is reviewable but not
yet merged into `develop`. Phase 20 is implementation-ready planning only; its
specification, ADRs, OpenSpec package, and spec issue #1036 do not prove runtime
implementation or authorize ticket dispatch.

| #      | Phase                                                                            | Hard deps                                        | Status                                                          |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| **0**  | Baseline, Governance & Evidence                                                  | —                                                | `PRD exists`                                                    |
| **1**  | Source-of-Truth Ownership Matrix                                                 | 0                                                | `PRD exists` (ruled 2026-07-06)                                 |
| **2**  | Site, Locale & Currency Foundation                                               | 1                                                | `PRD exists` (epic #477)                                        |
| **3**  | Minimum Permission & Role-Scoped Projection Foundation                           | 1, 2                                             | `PRD exists` (epic #489)                                        |
| **4**  | Identity & Account-Claiming Foundation                                           | 2, 3                                             | `PRD exists` (epic #503)                                        |
| **5**  | Public Website Runtime Contract                                                  | 2, 3, 4                                          | `PRD exists` (epic #520)                                        |
| **6**  | Shared Communication Event Model                                                 | 2, 3, 4, 5                                       | `PRD exists` (epic #550)                                        |
| **7**  | Receipt & Statement Compliance Rules + Donor Identity/Credit Model               | **4, 6, 3** (PRD C1–C3)                          | `PRD exists` (epic #566)                                        |
| **8**  | CRM Operating Foundation _(re-groomed → Operations Observability & Data-Health)_ | none (build-now core); 6/9 gate reserved sockets | `PRD exists` (re-groomed 2026-07-07, ADR-0001; epic #587)       |
| **9**  | Full CRM Depth & Relationship Graph                                              | **4, 7, 3**; 8 soft                              | `PRD exists` (epic #604 + #605–#627)                            |
| **10** | Sensitive-Data Classification & Restricted-Ministry Safety Foundation            | **3, 9**                                         | `PRD exists` (grilled 2026-07-07; epic #628 + #629–#641)        |
| **11** | Custom Fields & Custom Collections                                               | 9, 10, 3                                         | `PRD exists` (epic #645 + #646–#664)                            |
| **12** | Full Role & Permission Configuration                                             | 3, 10, 11                                        | `PRD exists` (epic #665 + #666–#687)                            |
| **13** | Campaign, Designation, Contribution Ledger & Giving Cart                         | 1, 2, 3, 4, 5, 7                                 | `PRD exists` (epic #690 + #691–#713)                            |
| **14** | Donor Credit Operations: Soft Credits, DAFs, Tributes & Matching Gifts           | 13, 7, 9                                         | `PRD exists` (epic #719 + #720–#741)                            |
| **15** | Offline Gift & Batch Entry                                                       | **13**, 14, 7                                    | `PRD exists (epic #758 + #759–#786)`                            |
| **16** | Pledges & Recurring Commitments                                                  | **2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14, 15**      | `PRD exists` (epic #793 + #794–#837; groomed-not-dispatched)    |
| **17** | System Messages & Template Management                                            | 6, 2, 3, 7                                       | `PRD exists` (epic #873 + #874–#905; groomed-not-dispatched)    |
| **18** | Receipt & PDF Template System                                                    | 7, **13**, 17                                    | `PRD exists` (epic #907 + #908–#961; #908–#910 ready frontier)  |
| **19** | Year-End Statement Operations                                                    | 6, 7, 12, **13**, 14, 15, 17, 18                 | `PRD exists` (epic #977 + #978–#1031; blocked/not-dispatched)   |
| **20** | Accounting Exports & Reconciliation                                              | **2, 3, 4, 7, 12, 13, 14, 15**                   | `PRD exists` (implementation-ready 2026-07-27; not implemented) |
| **21** | Missionary Field Accounts & Support Balances                                     | 13, 20, 3, 4                                     | `future (needs PRD)` — new in v2                                |
| **22** | Public Missionary & Project Page Workflow                                        | 5, 9, 10, 13, 3                                  | `future (needs PRD)`                                            |
| **23** | CMS / Site Planner Dynamic Content Parity                                        | 5, 3, 2                                          | `future (needs PRD)` — deps allow an early start after Phase 5  |
| **24** | Full Multi-Site, Language & Currency Management                                  | 2, 5, 13, 20, 23                                 | `future (needs PRD)`                                            |
| **25** | Donor Dashboard Depth                                                            | 4, 3, 13, 7, 6                                   | `future (needs PRD)`                                            |
| **26** | Support Hub & Conversation Management                                            | 6, 3, 4, 9, 17                                   | `future (needs PRD)` — new in v2                                |
| **27** | Donor Development & Portfolio Management _(beyond-parity differentiator)_        | **9**, 3, 6, 13                                  | `future (needs PRD)` (was v1 Phase 33)                          |
| **28** | Missionary Workspace Depth & Support-Raising CRM                                 | 9, 13, 16, 6, 3, 27                              | `future (needs PRD)`                                            |
| **29** | File Manager & Document Management                                               | 3, 9                                             | `future (needs PRD)`                                            |
| **30** | Imports & Migration Tools                                                        | 9, 13, 11, 29, 4, 3                              | `future (needs PRD)`                                            |
| **31** | Platform API, Webhooks & Connector Framework                                     | 1, 3, 4, 6                                       | `future (needs PRD)` — new in v2                                |
| **32** | Mailchimp / Newsletter Sync with Suppression Handling                            | 6, 3, 28, 4, 31                                  | `future (needs PRD)`                                            |
| **33** | Reporting & BI / Report Studio                                                   | 9, 13, 7, 6, 3                                   | `future (needs PRD)` — deps allow an early start (see lanes)    |
| **34** | Configurable Automation & Workflow Engine                                        | 9, 11, 12, 29, 17, 6                             | `future (needs PRD)`                                            |
| **35** | Spark-Style Contribution Triggers                                                | **34**, 13, 6, 3                                 | `future (needs PRD)` (confirmed separate from 34)               |
| **36** | Peer-to-Peer & Advocacy Campaigns                                                | 5, 13, 25, 3, 22                                 | `future (needs PRD)`                                            |
| **37** | Event / Opportunity Workflows & Group Management                                 | 5, 9, 13, 6, 29, 34, 36                          | `future (needs PRD)`                                            |
| **38** | Member Care, Crisis & Restricted-Ministry Operations                             | 10, 3, 4, 9, 29                                  | `future (needs PRD)` — new in v2                                |
| **39** | Mobile, Low-Bandwidth & Conflict-Safe Field Experience                           | 3, 4, 9, 28                                      | `future (needs PRD)` — new in v2                                |
| **40** | Data Stewardship, Global Search & AI Operator Workbench                          | 3, 4, 8, 9, 13, 30, 33                           | `future (needs PRD)` — new in v2                                |

**Out of scope (deliberate):** **child sponsorship** — declared out now and
tracked as an out-of-scope row in [`parity-matrix.md`](./parity-matrix.md), so
it is visibly a decision, not a gap.

## Cross-phase dependency lanes

Seven lanes group the work. Earlier lanes are foundations for later ones;
within a lane, lower numbers generally precede higher ones. **Lanes overlap in
time** — a phase starts when its hard dependencies ship, not when its number
comes up. See [`roadmap.md`](./roadmap.md#dependency-lanes--parallelism) for
the parallelism guide.

- **Lane A — Foundations & governance:** Phases 0–7
- **Lane B — CRM backbone & safety:** Phases 8–12
- **Lane C — Money & finance backbone:** Phases 13–21
- **Lane D — Public web & content:** Phases 22–24
- **Lane E — Engagement & stewardship surfaces:** Phases 25–28
- **Lane F — Data, documents, integrations & reporting:** Phases 29–33
- **Lane G — Automation & advanced operations:** Phases 34–40

**Firm, locked dependencies** (from
[`phase-00-baseline.md`](./phase-00-baseline.md), do not reorder around them):
CRM foundation precedes CRM depth, custom fields, and anything reading CRM
relationships — with the ADR-0001 softening of Phase 8 → Phase 9: "CRM
foundation" here means the Asym system-of-record plus the Phase 4 isolation
plumbing and the Phase 7 party spine, **not** the Phase 8 operating layer;
the giving pipeline (Phase 13) precedes offline batch (15), pledges (16),
receipt/statement **rendering and operations** (Phases 18–19), and exports
(20) — note the **rules-first inversion**: the receipt/statement _rules_
foundation (Phase 7) comes _earlier_ than the ledger, and the ledger is later
built to produce the gift facts those rules evaluate; **the automation engine
(Phase 34) precedes contribution triggers (Phase 35).**

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

- **Roadmap v2 adopted 2026-07-07.** The phase architecture (41 phases, 0–40,
  seven lanes) and the v1→v2 renumbering live in
  [`roadmap.md`](./roadmap.md). Any pre-2026-07-07 document or issue citing a
  phase number above 9 uses v1 numbering — decode via the roadmap's map.

- **Resolved (2026-07-06) — the "Phase 1" Source-of-Truth Ownership Matrix now
  has a PRD.**
  [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md)
  records — per record type — which system owns the truth, who may write it,
  who wins a conflict, and how a divergence is repaired, backed by
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
  (Asym Postgres owns all CRM truth; Twenty CRM is retired as a product
  dependency). OpenSpec `platform-boundaries` and the matrix "Owning surface"
  column remain binding; the ownership matrix is now the per-record-type
  authority they pointed toward. **Standing rule:** any phase introducing a
  new record type extends the ownership matrix in the same PRD.

- **Phase 8 was re-groomed 2026-07-07 (#603 complete).** ADR-0001 withdrew the
  Twenty write-enable spine, so Phase 8 is reframed from "safely open the first
  write to a provider" to the **CRM Operations Observability & Data-Health
  Foundation**: a read-only `/crm/operations` windowpane, escalation over the
  shipped Inngest recovery machinery (it does **not** fork a second healer),
  alert routing (Sentry + the Phase-6 seam), and the CRM data-health **catalog**
  that Phase 40 builds its stewardship product on. The write gate,
  provider-idempotency, reactive pause, kill-switch, and Notes write-enable are
  **withdrawn** (dormant code → #602). Dependencies softened: the build-now core
  has **no hard prerequisite** (it observes Asym's already-shipped runtime + the
  Phase-4 merge count); Phase 6 gates the emailed-alert path and Phase 9 gates
  the reserved party-graph-health sockets + the one reserved re-projection heal.
  Issues re-scoped 2026-07-07: epic #587 + #588/#589/#592/#593/#595/#596/#597/
  #600/#601 re-scoped; **#590/#591/#594/#598 closed** (write-enable withdrawn;
  #598 folded into #602); #599 already closed. The earlier ADR-0001 cleanup
  filing stands (#602; #466–#476 closed as superseded). Grill log: scratchpad
  `phase8-regroom-grill.md`.

- **Phase 7 is a cross-cutting foundation.** It owns not just receipt/statement
  compliance rules but the **donor identity/credit model** (party graph,
  households, organizations, soft credits, DAF, tribute, matching). Later phases
  **consume, not re-derive** it: Phase 9 (CRM depth) builds on the Phase 7 party
  tables; Phase 14 (donor credit operations) builds on the Phase 7 credit
  model; Phase 18 alone renders/stores exact artifacts from approved facts,
  while Phase 19 freezes source-authoritative populations, applies only bounded
  pre-release participation, and operates statement runs. Do not
  re-model those concepts in a later phase.

- **Phase 19 is a source-authoritative bulk-operations consumer, not a second
  receipt or statement engine.** Phase 7 owns the legal donor, eligibility,
  facts, coverage, and correction effect; Phase 13 owns posted money; Phase 14
  owns recognition; Phase 18 owns exact generated-document identity, artifact,
  currentness, access, and records; and Phase 17/6 own message preparation,
  transport, and delivery evidence. Phase 19 alone owns the immutable Run
  Preflight, purpose-pinned Statement Run and Run Items, bounded participation,
  release and control fences, recipient-operation coordination, physical
  fulfillment, operational completion, and the PII-minimized Run Evidence
  Record. Its Year-End Operations workspace is a rebuildable projection, never
  another authority.

- **Spark-style contribution triggers are confirmed separate (Phase 35).** The
  parity matrix tracks Spark triggers (area #25) as distinct from the automation
  engine (area #24), and Phase 0 locks "automation engine precedes contribution
  triggers." **Remaining open question:** the exact boundary between the general
  workflow engine (Phase 34) and gift-specific triggers (Phase 35) — whether
  Phase 35 is a thin trigger catalog on top of Phase 34 or a distinct surface.
  The matrix keeps this open too (area #25, _"relationship to #24"_). Resolve
  when Phase 34 is groomed.

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

- **Phase 27 (Donor Development & Portfolio Management; v1 Phase 33, added
  2026-07-06)** — a **beyond-parity differentiator**: SiteStacker has no
  moves-management or portfolio product (verified against the training docs),
  so this row carries no parity-matrix obligation; RE NXT / Salesforce
  Nonprofit Cloud establish the large-org expectation. Three-object domain
  when groomed: portfolio assignments (= Phase 9 staff-assignment edges,
  portfolios derived from active edges), pipeline enrollments carrying
  cultivation stage, and ask/proposal records tied to Phase 13
  campaigns/designations. Missions inversion supported: org-level rep
  portfolios (churches + major donors) **and** missionary-level
  support-raising pipelines. Phase 27 also owns **engagement scoring**
  (previously unowned). Phase 9 reserves for it: the staff-assignment
  edge-type family (roles as data: donor_rep / regional_rep / church_relations
  / mobilizer), the header owner-chip contract (N role-qualified assignees +
  one primary, reading edges only), a hidden record-tab socket + an Overview
  cultivation/next-ask socket, and the guardrail that **cultivation stage is
  never a record lifecycle status and asks are never edges or custom fields**.

- **Staff-side payment methods — disposition settled 2026-07-06** (SiteStacker's
  record-level Payment Methods tab, decomposed compliantly): the **read-only
  instruments panel ships in Phase 9** (brand/last4/expiry/default via Stripe —
  explicitly non-sensitive metadata, zero PCI impact); a **"request payment
  method update" secure-link action socket** (setup-mode Checkout / billing-
  portal deep link, sent + audited via the Phase 6 seam) lights up with Phase 6;
  **phone gifts (Phase 15 — Offline Gift & Batch Entry) run two lanes** — the
  **primary** card lane is the **native embedded Stripe Payment Element keyed
  by staff** (SAQ-A) + **server-confirm MOTO**, with the Stripe-hosted
  secure-link as the **fallback** (phone-ACH rides the TEL /
  Financial-Connections lane); **Phase 16 automatic recurring collection uses
  provider-owned payment fields and exact cohort bindings**. A fixed-total
  pledge never owns a payment instrument or executor; it may be fulfilled by
  posted gifts, including gifts from a separately authorized and explicitly
  linked recurring commitment. The **donor self-
  service wallet is Phase 25**. Phase 16 staff service may reuse only a
  provider-supported path after independent authority/instruction/
  authorization checks; recurring ACH is not silently treated as TEL. **Hard
  program guardrail: Asym never stores, logs, or processes raw card or bank-
  account details**—staff key into a Stripe-owned iframe this app embeds but
  cannot read, which **keeps** the platform's SAQ-A posture; a raw PAN never
  touches an Asym-rendered field or server.
  _(Amended 2026-07-11, Phase 15 (Offline Gift & Batch Entry) D4: the native
  embedded SAQ-A Element is now the primary phone-card lane and the hosted
  secure-link is the fallback — the earlier "send-secure-link by default /
  staff never key card data into any surface this platform renders /
  staff-keyed PANs would break SAQ-A" wording is superseded.)_

- **Do not present any later phase (9–40) as implemented or live.** Groomed
  PRDs through Phase 20 are planning contracts, not build proof. Phase 16 is
  marked `PRD exists` with epic #793 and children #794–#837; Phase 17 has a PRD
  plus blocked epic #873 and children #874–#905. Phase 18 has published epic
  #907 and children #908–#961; #908–#910 are the approved
  `status:todo` + `ready-for-agent` frontier and #911–#961 remain
  `status:blocked`. Phase 19 has published epic #977 and children #978–#1031,
  all blocked/not dispatched. Phase 20 is implementation-ready but not
  implemented or dispatched. Published issue posture is not build proof, and
  only an explicit founder decision may dispatch additional work. The matrix's `Built?`
  cells marked `(v)` still need per-area
  code verification, and all `Live?` cells are `unconf`.

## Related documents

- [`roadmap.md`](./roadmap.md) — **Roadmap v2** (source of truth for phase
  architecture): full table with slugs and soft dependencies, the v1→v2
  renumbering map, dependency lanes and parallelism, and per-phase scope
  sections for all 41 phases.
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
