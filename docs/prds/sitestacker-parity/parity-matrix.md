# SiteStacker Parity Matrix

The tracking source of truth for all 25 parity areas. **Outcome parity** (match
what a missions org can accomplish, our way) — see
[`README.md`](./README.md).

**How to read the status columns** (agreed in Phase 0):

- **Built?** — the code exists and is finished: `Yes` / `Partial` / `No` /
  `?` (needs per-area code verification).
- **Live?** — actually running for real users. **All cells are `unconf`**
  (unconfirmed) until the human-only live check from the Phase 0 evidence file
  (Lane 2) is done. `No` where nothing is built to be live.
- **Confirmed?** — a human has verified live behavior. `No` everywhere until
  Lane 2 runs.

Status values also include **`out-of-scope`** (we chose not to pursue).

> This is an **initial pass**. `Built?` and `Current state` cells marked
> **(v)** are my best assessment from repo evidence and still need a per-area
> code verification before they are trusted. Benchmark cites marked **(s)**
> still need the specific SiteStacker doc page sourced. Nothing here is a
> finished judgment — the matrix is a living document.

## Status grid

| #   | Area                                                                          | Built?       | Live?  | Confirmed? | Owning surface                                           |
| --- | ----------------------------------------------------------------------------- | ------------ | ------ | ---------- | -------------------------------------------------------- |
| 1   | CRM system-of-record foundation (formerly: Twenty CRM integration foundation) | Partial (v)  | unconf | No         | Mission Control                                          |
| 2   | Full CRM depth & relationship graph                                           | Partial (v)  | unconf | No         | Mission Control                                          |
| 3   | Custom CRM fields & configurable entities                                     | ? (v)        | unconf | No         | Mission Control                                          |
| 4   | Role & permission configuration                                               | Partial (v)  | unconf | No         | Mission Control                                          |
| 5   | Campaign, designation, contribution ledger, giving cart                       | Partial (v)  | unconf | No         | Mission Control + public                                 |
| 6   | Offline gift batch entry                                                      | Partial (v)  | unconf | No         | Mission Control                                          |
| 7   | Soft credits, affiliated donors, DAF handling                                 | ? (v)        | unconf | No         | Mission Control (Phase 7 owns)                           |
| 8   | Pledges & recurring commitments                                               | Partial (v)  | unconf | No         | Mission Control + donor                                  |
| 9   | Receipt & PDF template system                                                 | Partial (v)  | unconf | No         | Mission Control (Phase 7 owns facts/compliance layer)    |
| 10  | Year-end statement operations                                                 | Partial (v)  | unconf | No         | Mission Control + donor (Phase 7 owns eligibility rules) |
| 11  | Accounting exports & reconciliation                                           | ? (v)        | unconf | No         | Mission Control                                          |
| 12  | Public missionary & project page workflow                                     | Partial (v)  | unconf | No         | Public website + CRM                                     |
| 13  | CMS / Site Planner dynamic content                                            | Partial (v)  | unconf | No         | Public website (CMS)                                     |
| 14  | Multi-site, language & currency                                               | ? (v)        | unconf | No         | Platform-wide                                            |
| 15  | Donor dashboard depth                                                         | Partial (v)  | unconf | No         | Donor portal                                             |
| 16  | Missionary dashboard depth                                                    | Partial (v)  | unconf | No         | Missionary workspace                                     |
| 17  | System messages & email template management                                   | Partial (v)  | unconf | No         | Mission Control                                          |
| 18  | File manager & document management                                            | ? (v)        | unconf | No         | Mission Control                                          |
| 19  | Mailchimp / newsletter sync                                                   | No (v)       | No     | No         | Mission Control                                          |
| 20  | Peer-to-peer advocacy campaigns                                               | ? (v)        | unconf | No         | Public + donor                                           |
| 21  | Event / opportunity workflows & groups                                        | ? (v)        | unconf | No         | Mission Control                                          |
| 22  | Imports & migration tools                                                     | Partial (v)  | unconf | No         | Mission Control                                          |
| 23  | Reporting & BI                                                                | Partial (v)  | unconf | No         | Mission Control                                          |
| 24  | Configurable automation / workflow engine                                     | Partial (v)  | unconf | No         | Mission Control                                          |
| 25  | Spark-style contribution triggers                                             | ? (v)        | unconf | No         | Mission Control                                          |
| —   | Child sponsorship                                                             | out-of-scope | —      | —          | —                                                        |

## Per-area detail

Each block: **SiteStacker capability (benchmark)** · **Current Asym state** ·
**Depends on** · **Acceptance test (outcome-based)** · **Evidence** · **Open
questions**. Benchmark source root: `https://sitestacker.training`.

### 1. CRM system-of-record foundation (formerly: Twenty CRM integration foundation)

- **Benchmark:** SiteStacker Ministry CRM as the operational system of record.
  (s) cite specific CRM docs page.
- **Current state:** Asym Postgres is the CRM system of record
  ([ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md);
  [Phase 1 ownership matrix](./phase-01-source-of-truth-ownership-matrix.md)).
  The earlier Twenty CRM integration is retired as a product dependency; its
  sync code is dormant pending the cleanup ticket (#602). The CRM grid/detail
  screens already run on Asym tables; the notes/relationships read-throughs
  re-point to local SQL in Phase 9. The **operating foundation**
  (`/crm/operations`, health, alerting) remains **Phase 8**
  (`phase-08-crm-operating-foundation.md`), **re-groomed 2026-07-07 (#603)**
  into the CRM Operations Observability & Data-Health Foundation — the Twenty
  write-enable spine withdrawn (→ #602), observability + escalation over the
  shipped Inngest recovery kept. (v)
- **Depends on:** — (foundational).
- **Acceptance test:** staff can create/read core CRM records through native
  Mission Control **on Asym Postgres**, with tenant isolation.
- **Evidence:** `docs/ops/phase-evidence/2026-05-14_phase-04_twenty-crm-foundation.md`;
  crm-core spec (in-flight PR #462).
- **Open questions:** current live parity vs SiteStacker CRM breadth.

### 2. Full CRM depth & relationship graph

- **Benchmark:** SiteStacker CRM relationships, households, organizations. (s)
- **Current state:** CRM domain workflows built (phase 05); relationship graph
  depth partial. The household + organization **party** tables (plus membership
  and org profiles/`org_contacts`) that satisfy this row are delivered by
  Phase 7 (Donor Identity/Credit Model) in Asym Postgres; phase 05 remains the
  consumer of that graph. (v)
- **Depends on:** #1; Phase 7 party tables.
- **Acceptance test:** staff can navigate people ↔ households ↔ organizations ↔
  giving relationships as one graph.
- **Evidence:** `docs/ops/phase-evidence/2026-05-14_phase-05_crm-domain-workflows.md`.
- **Open questions:** which relationship types are actually modeled.

### 3. Custom CRM fields & configurable entities

- **Benchmark:** SiteStacker custom fields / configurable entities. (s)
- **Current state:** custom-fields engine to be designed tenant-safe on Asym
  Postgres in Phase 11 (the Twenty Metadata API path retired with
  [ADR-0001](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)). (v)
- **Depends on:** #1, #2.
- **Acceptance test:** an org admin can add a custom field/entity and see it in
  native CRM screens without code changes.
- **Evidence:** needs per-area check.
- **Open questions:** is configuration exposed to staff, or dev-only today.

### 4. Role & permission configuration

- **Benchmark:** SiteStacker entity/permission configuration. (s)
- **Current state:** role model + tenant memberships built; **MVP posture: all
  staff subroles share broad admin access, per-subrole narrowing reserved**;
  granular capabilities enforced for sensitive contribution actions. (v)
- **Depends on:** #1.
- **Acceptance test:** an org admin can grant/deny a capability to a subrole and
  the server enforces it.
- **Evidence:** identity-and-access spec (in-flight PR #462);
  `packages/auth/permissions.ts`.
- **Open questions:** when does per-subrole configuration ship.

### 5. Campaign, designation, contribution ledger & giving cart

- **Benchmark:** SiteStacker giving (contributions, designations, campaigns,
  cart). (s)
- **Current state:** payments/giving pipeline + contribution operations built
  (phase 03); single-designation gifts today; multi-item giving cart likely not
  built. (v)
- **Depends on:** #1.
- **Acceptance test:** a donor can give to a campaign/designation and staff see
  it in the contribution ledger.
- **Evidence:** `docs/ops/phase-evidence/2026-05-12_phase-03_payments-giving-pipeline-final.md`;
  contribution-operations + donation-lifecycle specs (PR #462).
- **PRD:** groomed — [`phase-13-campaign-designation-contribution-ledger-giving-cart.md`](./phase-13-campaign-designation-contribution-ledger-giving-cart.md) (decisions D1–D25); resolves the giving-cart, ledger, campaign, and source-code scope. `Built?`/`Live?` cells stay code-verification-pending.
- **Open questions:** giving cart (multi-designation basket) scope. **Resolved by the Phase 13 PRD.**

### 6. Offline gift batch entry

- **Benchmark:** SiteStacker offline gifts entered alongside online gifts,
  batches. (s)
- **Current state:** offline known/unknown-donor entry **proposed** in
  add-guest-giving (PR #462); batch reconciliation partial. (v)
- **Depends on:** #5.
- **Acceptance test:** staff batch-enter a stack of offline checks and reconcile
  to a bank deposit.
- **Evidence:** add-guest-giving change (PR #462).
- **Open questions:** batch UI + reconciliation depth. **Resolved by the Phase 15 PRD.**

### 7. Soft credits, affiliated donors & DAF handling

- **Benchmark:** SiteStacker soft credits, affiliated donors, donor-advised
  funds. (s)
- **Current state:** no evidence found; likely not built. Owned by Phase 7
  (Receipt & Statement Compliance Rules + Donor Identity/Credit Model). (v)
- **Depends on:** #2 (party graph), #5 (giving pipeline), Phase 4 identity
  spine (fulfilled by Phase 7).
- **Acceptance test:** the D3 credit model holds — a gift carries `0..N` typed
  soft credits with `is_receiptable=FALSE` that never mint a receipt or enter a
  money total; a DAF gift receipts the sponsor/fund as legal donor and issues
  the advisor a non-deductible **acknowledgment** (not a tax receipt), excluded
  from the advisor's year-end deductible total; and a matching gift is two
  donations (employee gift + company-match receipted to the company).
- **Evidence:** needs per-area check.
- **Open questions:** demand/priority.
- **Ownership note (2026-07-10):** soft-credit / DAF / tribute / matching-gift
  **operations** ownership moves to Phase 14 (Donor Credit Operations);
  Phase 7 (Receipt & Statement Compliance Rules + Donor Identity/Credit Model)
  retains document compliance (the receipt/acknowledgment/notification walls);
  Phase 13 (Campaign, Designation, Contribution Ledger & Giving Cart) retains
  capture shape. PRD:
  [`phase-14-donor-credit-operations.md`](./phase-14-donor-credit-operations.md).

### 8. Pledges & recurring commitments

- **Benchmark:** SiteStacker pledges / recurring commitments. (s)
- **Current state:** legacy `donor_pledges` and `pledge_charge_attempts` shapes
  exist as prototype/migration evidence, and the repo consumes some Stripe
  subscription events, but the Phase 16 automatic-recurring and fixed-total-
  pledge domains are **not built**. The stale `add-recurring-giving` proposal is
  superseded where it conflicts with the Phase 16 PRD. (v)
- **Depends on:** #5, the Phase 13 append-only contribution ledger, Phase 9
  CRM projections, Phase 6 communication history, Phase 12 authorization, and
  Phase 15 offline money entry.
- **Acceptance test:** a donor can start and safely manage automatic recurring
  giving with donor-anchored dates; staff can provide authorization-bound
  service; missionaries see cash-first, privacy-safe recurring support; and
  staff can record the uncommon fixed-total pledge and fulfill it from posted
  contributions without confusing expectations with money.
- **Evidence:**
  [`phase-16-pledges-recurring-commitments.md`](./phase-16-pledges-recurring-commitments.md),
  its dated congruence package, research evidence, and ADRs 0012–0017.
- **Open questions:** none at product-contract level; D1–D19 are ratified.

### 9. Receipt & PDF template system

- **Benchmark:** SiteStacker receipts / PDF templates. (s)
- **Current state:** current PDF Studio persistence, live text downloads,
  `contribution_receipt_snapshots`, `gift_receipt_records`, direct render routes,
  DocRaptor selection, and Unlayer compatibility are non-production prototypes,
  not the final authority. Phase 18 is fully specified but not built; its D17
  clean cut removes those paths rather than migrating or preserving them. (v)
- **Depends on:** #5/Phase 13 ledger truth, Phase 7 receipt/statement facts and
  optional issuance, and Phase 17 delivery/protected-action governance.
- **Acceptance test:** staff safely author, prove, publish, generate, batch,
  correct, access, and manage one logical generated document through one
  tenant-safe Generated Document service. Every current PDF is the exact
  validated private artifact over frozen source facts; one U.S. reference or
  exact-issuer Canadian serial policy applies; a copy preserves bytes/identity;
  formal replacement retains/cancels the predecessor and advances identity as
  the jurisdiction contract requires; no prototype writer/reader remains.
- **Evidence:**
  [`phase-18-receipt-pdf-template-system.md`](./phase-18-receipt-pdf-template-system.md),
  its executable manifest, renderer protocol, 204-row traceability, research,
  dated congruence, ADRs 0033–0039, and Document Production OpenSpec delta.
- **Open questions:** none at product-contract level; the pre-registered D3
  contest may qualify one exact renderer or correctly produce no winner, and
  legal/accessibility/Canadian approvals are explicit release evidence gates.

### 10. Year-end statement operations

- **Benchmark:** SiteStacker year-end statements. (s)
- **Current state:** donor-portal live statements exist only as prototype
  behavior; annual statement operations remain unbuilt. The active
  `add-donor-self-service` change now delegates population/run truth to Phase 19
  and exact artifacts/access to Phase 18. (v)
- **Depends on:** #5, #9, Phase 7 eligibility/facts, Phase 18 generation, and
  Phase 17 delivery.
- **Acceptance test:** Phase 19 freezes a source-authorized population/cutoff and
  operates item-authoritative runs; every item uses Phase 18's one generation
  seam and Phase 17's separate delivery seam. ACH initiation/processing is not
  received and is absent from official successful-payment receipt/statement
  truth until processor-confirmed success; later returns/refunds append exact
  inverse and source-authorized replacement effects without deleting history.
- **Evidence:** add-donor-self-service OpenSpec plus the Phase 18 PRD/OpenSpec
  package.
- **Open questions:** the detailed Phase 19 run UX and operations contract is
  still ungroomed; rendering, artifact currentness, and delivery ownership are
  closed.

### 11. Accounting exports & reconciliation

- **Benchmark:** SiteStacker exports / accounting reconciliation. (s)
- **Current state:** unknown; needs assessment. (v)
- **Depends on:** #5.
- **Acceptance test:** staff export contributions in an accounting-ready format
  that reconciles to the ledger.
- **Evidence:** needs per-area check.
- **Open questions:** target accounting systems.

### 12. Public missionary & project page workflow

- **Benchmark:** SiteStacker missionary/project public pages. (s)
- **Current state:** public `/workers` + profile pages currently render **mock
  data**, not real CRM-backed entities (see PR #462 audit note); CMS foundation
  built. (v) The runtime contract these pages run on — isolation choke-point,
  host resolution, reference validation, enumeration-safe checkout handoff,
  caching, Draft Mode preview — is governed by Phase 5 (Public Website Runtime
  Contract): PRD `phase-05-public-website-runtime-contract.md`, epic #520,
  ADRs 0026–0030; the missionary giving page is its proof slice (mock →
  contract, built as a generalizable template).
- **Depends on:** #1, #13; Phase 5 (public runtime contract).
- **Acceptance test:** a real CRM missionary has a public, CMS-managed page with
  native giving.
- **Evidence:** phase 06/07 CMS evidence; PR #462 project.md current-state note.
- **Open questions:** real-entity backing timeline.

### 13. CMS / Site Planner dynamic content

- **Benchmark:** SiteStacker Site Planner / dynamic content. (s)
- **Current state:** Payload Web Studio CMS foundation built (phase 06/07);
  dynamic-content parity partial. (v) Public delivery of that content —
  published-only isolated reads, allowlist serialization, tagged caching with
  secured invalidation, Draft Mode preview convergence — is governed by
  Phase 5 (Public Website Runtime Contract): PRD
  `phase-05-public-website-runtime-contract.md`, epic #520, ADRs 0026–0030.
- **Depends on:** —; Phase 5 governs the public delivery contract.
- **Acceptance test:** staff build/publish tenant-branded dynamic pages.
- **Evidence:** `docs/ops/phase-evidence/2026-05-15_phase-07_web-studio-ux.md`.
- **Open questions:** dynamic content-type breadth.

### 14. Multi-site, language & currency

- **Benchmark:** SiteStacker multi-site/language/currency. (s)
- **Current state:** platform is multi-tenant; multi-site/language/currency
  support unverified/likely not built. (v)
- **Depends on:** #13.
- **Acceptance test:** a tenant runs more than one branded site and/or accepts a
  second currency/language.
- **Evidence:** needs per-area check.
- **Open questions:** demand/priority.

### 15. Donor dashboard depth

- **Benchmark:** SiteStacker donor dashboard. (s)
- **Current state:** donor portal built (phase 09: snapshot, billing portal,
  receipts, statements); self-service depth (pause/cancel recurring, payment
  methods) **proposed** in PR #462. (v)
- **Depends on:** #5, #8.
- **Acceptance test:** a donor manages giving, recurring gifts, payment methods,
  and documents self-service.
- **Evidence:** phase 09 evidence; add-donor-self-service (PR #462).
- **Open questions:** depth gap vs SiteStacker donor tools.

### 16. Missionary dashboard depth

- **Benchmark:** SiteStacker missionary dashboard. (s)
- **Current state:** missionary workspace built (phase 09: snapshot, tasks,
  support gifts, donor relationships, updates). (v)
- **Depends on:** #2.
- **Acceptance test:** a missionary tracks support, responds to donors, manages
  updates and tasks.
- **Evidence:** phase 09 evidence.
- **Open questions:** depth gap vs SiteStacker missionary tools.

### 17. System messages & email template management

- **Benchmark:** SiteStacker system messages / email templates. (s)
- **Current state:** **Partial foundation, not the Phase 17 product.** The repo
  has real `tenant_email_settings`, `email_templates`,
  `email_template_versions`, `email_template_system_bindings`, Resend send/event
  logs, suppressions, and test-send paths. The Phase 6 communication-intent/event
  spine and Phase 17 catalog, immutable publication, typed fact, locale/layout,
  Delivery Plan, in-product, SMS-governance, sender/reply, recent-copy, recovery,
  portability, and staff-workspace contracts remain forward. (v)
- **Depends on:** Phase 6 communication spine, Phase 2 site/locale context, and
  Phase 3 consent/projection governance. Producer-specific Live contracts also
  require their source owner and proof bundle.
- **Acceptance test:** every current producer and prior obligation is accounted
  for in a cited inventory and stable Reserved/Live/Retired catalog; authorized
  staff can safely customize, preview with synthetic data, review, publish,
  resolve, and repair a complete message without accessing arbitrary records or
  weakening required truth; every external recipient delivery attempt first
  creates exactly one durable pre-dispatch Phase 6 intent, while its
  communication event is created only at the send seam after the applicable
  transition occurs; every `in_product` step becomes one role-safe attention
  projection; tenant/site/locale, sender/reply, consent, privacy,
  accessibility, provider-boundary, recovery, and cross-tenant negative tests
  pass; SMS remains unable to send.
- **Evidence:** Phase 17 PRD, dated 2026-07-19 cross-PRD congruence package,
  research-evidence ledger, focused ADRs, and the active
  `outbound-communications` OpenSpec delta. Current repo anchors remain evidence
  of the starting point, not proof the target is built.
- **Open questions:** none requiring another Phase 17 founder decision; D1–D20
  are ratified. Producer-owned future meanings—such as exact Eve occurrence
  keys—remain intentionally unminted until their owning producer ratifies the
  occurrence and fence, and implementation proofs remain pending. Phase 17 is
  groomed-not-dispatched and the issue set is pending.

### 18. File manager & document management

- **Benchmark:** SiteStacker file/document management. (s)
- **Current state:** unknown; needs assessment. (v)
- **Depends on:** —.
- **Acceptance test:** staff store, organize, and permission documents; donors/
  missionaries access role-scoped files.
- **Evidence:** needs per-area check.
- **Open questions:** storage model.

### 19. Mailchimp / newsletter sync

- **Benchmark:** SiteStacker Mailchimp/newsletter sync. (s)
- **Current state:** not built. (v)
- **Depends on:** #2.
- **Acceptance test:** CRM audiences sync to the newsletter provider without
  manual export.
- **Evidence:** none found.
- **Open questions:** provider choice.

### 20. Peer-to-peer advocacy campaigns

- **Benchmark:** SiteStacker advocacy / peer-to-peer. (s)
- **Current state:** unknown; likely not built. (v)
- **Depends on:** #5, #12.
- **Acceptance test:** a supporter runs a personal advocacy page that raises
  designated gifts.
- **Evidence:** needs per-area check.
- **Open questions:** demand/priority.

### 21. Event / opportunity workflows & group management

- **Benchmark:** SiteStacker events/opportunities/groups. (s)
- **Current state:** unknown; needs assessment. (v)
- **Depends on:** #2.
- **Acceptance test:** staff run an event/opportunity signup with group
  management.
- **Evidence:** needs per-area check.
- **Open questions:** scope.

### 22. Imports & migration tools

- **Benchmark:** SiteStacker CRM/content import tools. (s)
- **Current state:** CRM import capability referenced; extent partial. (v)
- **Depends on:** #1.
- **Acceptance test:** staff import CRM records/content from a file with mapping
  and validation.
- **Evidence:** needs per-area check.
- **Open questions:** SiteStacker → Asym migration path specifically.

### 23. Reporting & BI

- **Benchmark:** SiteStacker real-time BI / reporting. (s)
- **Current state:** partial; some reporting exists in CRM/contributions; BI
  depth unverified. (v)
- **Depends on:** #2, #5.
- **Acceptance test:** staff build and export a report answering a real giving/
  relationship question.
- **Evidence:** needs per-area check.
- **Open questions:** BI ambition vs simple reports.

### 24. Configurable automation / workflow engine

- **Benchmark:** SiteStacker program automation. (s)
- **Current state:** Mission Control automations designed (PRD) and durable
  workflow orchestration built; declarative automation engine partial. (v)
- **Depends on:** #2, #5.
- **Acceptance test:** an admin builds a declarative automation (trigger →
  condition → action) with preview + test run.
- **Evidence:** `docs/prds/mission-control-contribution-operations/04-automation-builder.md`;
  workflow-orchestration spec (PR #462).
- **Open questions:** trigger/action catalog breadth.

### 25. Spark-style contribution triggers

- **Benchmark:** SiteStacker Spark contribution triggers. (s)
- **Current state:** unknown; likely not built. (v)
- **Depends on:** #24.
- **Acceptance test:** a contribution event fires a configured downstream action
  automatically.
- **Evidence:** needs per-area check.
- **Open questions:** relationship to #24.

### — Child sponsorship (out of scope)

Declared **out of scope / not pursuing**. Tracked here so it is visibly a
deliberate exclusion, not a missed gap.
