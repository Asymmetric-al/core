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
| 7   | Soft credits, affiliated donors, DAF handling                                 | ? (v)        | unconf | No         | Mission Control (Phase 14 owns operations)               |
| 8   | Pledges & recurring commitments                                               | Partial (v)  | unconf | No         | Mission Control + donor                                  |
| 9   | Receipt & PDF template system                                                 | Partial (v)  | unconf | No         | Mission Control (Phase 7 owns facts/compliance layer)    |
| 10  | Year-end statement operations                                                 | Partial (v)  | unconf | No         | Mission Control + donor (Phase 7 owns eligibility rules) |
| 11  | Accounting exports & reconciliation                                           | ? (v)        | unconf | No         | Mission Control                                          |
| 12  | Public missionary & project page workflow                                     | Partial (v)  | unconf | No         | Public website + CRM                                     |
| 13  | CMS / Site Planner dynamic content                                            | Partial (v)  | unconf | No         | Public website (CMS)                                     |
| 14  | Multi-site, language & currency                                               | ? (v)        | unconf | No         | Platform-wide                                            |
| 15  | Donor dashboard depth                                                         | Partial (v)  | unconf | No         | Donor portal                                             |
| 16  | Missionary dashboard depth                                                    | Partial (v)  | unconf | No         | Missionary workspace                                     |
| 17  | System-message content, sender profiles & template management                 | Partial (v)  | unconf | No         | Email Studio / System Messages                           |
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
- **Acceptance test:** staff batch-enter a stack of offline checks through one
  reviewed Phase 15 commit, preserve source-labelled deposit evidence, and hand
  the resulting Expected Bank Arrival to Phase 20 Bank Match; QBO/Xero remains
  authoritative for final bank reconciliation.
- **Evidence:** add-guest-giving change (PR #462).
- **Open questions:** batch UI + reconciliation depth. **Resolved by the Phase 15 PRD.**

### 7. Soft credits, affiliated donors & DAF handling

- **Benchmark:** SiteStacker soft credits, affiliated donors, donor-advised
  funds. (s)
- **Current state:** no evidence found; likely not built. Operationally owned
  by Phase 14 (Donor Credit Operations); Phase 7 consumes approved recognition
  facts only for receipt/statement compliance. (v)
- **Depends on:** #2 (Party graph), #5 (Phase 13 giving pipeline), Phase 4
  identity/claim isolation, and Phase 7 official-facts contract.
- **Acceptance test:** the D3 credit model holds — a gift carries `0..N` typed
  soft credits with `is_receiptable=FALSE` that never mint a receipt or enter a
  money total; a DAF gift identifies the proved sponsor/fund as legal donor so
  Phase 7 can evaluate receipt eligibility, while Phase 14 may issue the advisor
  a non-deductible **acknowledgment** (not a tax receipt), excluded from the
  advisor's year-end deductible total; and a matching relationship
  links two canonical Phase 13 contributions, with the matched contribution's
  frozen legal donor set to its payer of record and Phase 14 owning the
  expectancy/settlement/recognition link.
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
  clean cut removes those paths rather than migrating or preserving them. The
  contract is carried by PR #872; epic #907 and children #908–#961 are
  published under the documented dependency frontier. (v)
- **Depends on:** #5/Phase 13 ledger truth, Phase 7 receipt/statement facts and
  optional issuance, and Phase 17 delivery/protected-action governance.
- **Acceptance test:** staff safely author, prove, publish, generate, batch,
  correct, access, and manage one logical generated document through one
  tenant-safe Generated Document service. Every current PDF is the exact
  validated private artifact over frozen source facts; one U.S. reference or
  exact-issuer Canadian serial policy applies; a copy preserves bytes/identity;
  formal replacement retains/cancels the predecessor and advances identity as
  the jurisdiction contract requires; numbering, signer, retention, and
  replacement behavior come from the frozen Legal Entity/jurisdiction contract;
  and no prototype writer/reader remains.
- **Evidence:**
  [`phase-18-receipt-pdf-template-system.md`](./phase-18-receipt-pdf-template-system.md),
  its executable manifest, renderer protocol, 204-row traceability, research,
  dated congruence, ADRs 0033–0039, and Document Production OpenSpec delta.
- **Open questions:** none at product-contract level; the pre-registered D3
  contest may qualify one exact renderer or correctly produce no winner, and
  legal/accessibility/Canadian approvals are explicit release evidence gates.

### 10. Year-end statement operations

- **Benchmark:** SiteStacker year-end statements. (s)
- **Current state:** the annual statement runtime remains unbuilt; the existing
  donor-portal live-text year view is prototype behavior, not the target
  architecture. Phase 19 is fully groomed through D1–D18 as a planning-only,
  groomed-not-dispatched contract carried by PR #872. Epic #977 and children
  #978–#1031 are published and blocked. It delegates eligibility and legal
  donor truth to Phase 7, exact documents and current access to Phase 18, and
  message delivery to Phase 17/6. (v)
- **Depends on:** Phase 6 communication spine; Phase 7 eligibility/facts; Phase
  12 authorization/review; Phase 13 posted money; Phase 14 optional recognition;
  Phase 15 check intake/correction; Phase 17 delivery; and Phase 18
  generation/access.
- **Acceptance test:** staff review one exact immutable Run Preflight and start
  it through one idempotent atomic release barrier; the resulting purpose-pinned
  Legal-Entity-scoped Statement Run preserves frozen source-authoritative
  membership while document, portal, communication, and paper outcomes remain
  separately truthful. Staff can contain and recover work, use self-print by
  default, mark a run complete without erasing live exceptions, and donors can
  repeatedly access the exact current artifact without creating another
  document or delivery.
- **Evidence:** Phase 19 PRD and its authority map,
  decision-to-test traceability, primary-source research, dated cross-PRD
  congruence, focused ADRs, and the Statement Operations OpenSpec delta; Phase
  18 and Phase 17 packages remain the subordinate document and communication
  authorities; epic #977 and children #978–#1031 carry the blocked issue set.
- **Open questions:** none requiring another Phase 19 founder decision; D1–D18
  are ratified. Implementation proofs, provider qualification, issue slicing,
  and explicit dispatch remain pending.

### 11. Accounting exports & reconciliation

- **Benchmark:** SiteStacker exports / accounting reconciliation. (s)
- **Current state:** runtime not built. Phase 20 is decision-complete through
  D1–D20 and implementation-ready: exact Stripe settlement/payout evidence, a
  bounded source-labelled Bank Match, immutable balanced Accounting Releases,
  mutually exclusive direct-QBO/direct-Xero or artifact delivery lanes, exact
  provider readback, drift detection, append-only compensation, and an
  accounting-ready Phase 21 expense seam. Asym assists finance but does not
  become the GL or own final bank reconciliation. (v)
- **Depends on:** Phases 2, 3, 4, 7, 12, 13, 14, and 15; Phase 21 supplies
  approved expense facts later without blocking the contribution/payout
  accounting spine.
- **Acceptance test:** from one exact source-coverage fence, staff can review a
  balanced immutable release, deliver it once through the selected certified
  QBO/Xero or artifact lane, inspect exact operation/readback evidence, tie
  gross gifts, fees, refunds/returns, payout transfer, and expected bank
  arrival without fuzzy inference, and resolve any later difference by a
  cause-linked compensating release. QBO/Xero remains authoritative for final
  books and final bank reconciliation.
- **Evidence:**
  [`phase-20-accounting-exports-reconciliation-decision-log.md`](./phase-20-accounting-exports-reconciliation-decision-log.md),
  [ADRs 0043–0061](../../adr/0043-immutable-accounting-releases-and-exclusive-delivery-lanes.md),
  and the
  [`Phase 20 cross-phase congruency audit`](./phase-20-cross-phase-congruency-audit.md).
- **Open questions:** no unresolved founder-level product decision. The
  complete implementation/testing contract is in the approved Phase 20 spec;
  implementation and issue dispatch remain separate work.

### 12. Public missionary & project page workflow

- **Benchmark:** SiteStacker missionary/project public pages. (s)
- **Current state:** public `/workers` + profile pages still render **mock data**
  rather than the Phase 22 operational/release contract, while the Payload CMS
  and Phase 5 public-runtime foundation exist. The canonical
  [Phase 22 PRD](./phase-22-public-ministry-pages.md) and active
  [`add-public-ministry-pages` OpenSpec change](../../../openspec/changes/add-public-ministry-pages/proposal.md)
  are implementation-ready planning published as spec
  [#1281](https://github.com/Asymmetric-al/core/issues/1281), not current runtime proof. Phase 22
  grooming is scope-frozen at D1–D27: typed page families and
  contributors, Phase-10-bounded reach,
  family-specific presentation, tenant-chosen review/release, simple staff
  judgment, optional source-authoritative progress, one exact Designation,
  source-qualified route dispositions, release-bound safe media, and
  authenticated exact-version preview with no bearer access, and canonical
  immutable Ministry Updates with independently governed public-page and
  purpose-authorized supporter projections plus separate notification truth.
  D12 adds tenant-bounded **Responses off**, **Like + I prayed**, or **Like + I
  prayed + comments** over exact protected Engagement Spaces, with current
  authorization/safety reproof, append-only comment and moderation evidence,
  rebuildable audience-local counts, and no protected response data on the
  anonymous public projection. D13 adds one exact-scope directory/search
  authority with Together-by-default or tenant-selected Separate-by-family
  presentation over the same complete D2/Phase-10-admitted projection, bounded
  server query, family-typed cards, generation/caches, and adverse-removal
  contract—never a second visibility switch or independent family index. D14
  adds one immutable release-bound Search/Share manifest with distinct results,
  stable public Update permalinks, coherent initial HTML, canonical/crawler/
  locale/sitemap/JSON-LD/social-card artifacts, D9-certified card media, bounded
  authoring, accessible native-share/Copy-link fallbacks, and honest separation
  of local readiness from external provider outcomes. These are implementation-
  ready product decisions, not claims that the current mock, global metadata
  helpers, fictional share URLs, or interim Web Studio preview satisfies them.
  D15 adds one persisted-Off, prospective Site-scoped measurement profile with
  guided Staff-only or Staff-plus-current-assigned-contributor visibility over
  exactly four fixed first-party, release-bound interactions. Its private
  transient evidence expires within 24 hours; sealed daily aggregates retain
  for one code-owned 24-month period with append-only corrections; reporting is
  suppression-safe and through-dated; and neither current Session Replay nor
  existing mock/financial missionary analytics is D15 authority or backfill.
  D16 adds one tenant-off-by-default, D10-routed, source-bounded writing
  assistant over one exact contributor-editable semantic draft target. Its
  private suggestions preserve the original and require explicit current-
  authorized CAS Use; AI never submits or publishes. **Translate to English**
  is an independently pair-certified operation into one exact existing Phase 24
  English locale, with source-language confirmation, mixed-language and bidi
  handling, original/English comparison, and a visible check-work warning; it
  cannot create locale, translation-status, release, or certified-translation
  truth.
  D17 adds one exact immutable-versioned Project/Campaign Page Subject Binding
  to an owner-certified CRM Ministry Project, Phase 13 Giving Campaign, or
  separately public-subject-eligible Phase 13 Designation. The minimal Ministry
  Project identity/lifecycle belongs to the CRM operational layer, never CMS or
  a fund. Subject, Giving, progress, contributors, reach/release, lifecycle,
  media, Updates, discovery, and search/share remain independently
  authoritative; after first release a different subject requires a new Page
  plus D8 succession.
  D18 adds the release-bound Public Ministry Runtime Composition Contract:
  Phase 5 executes runtime/cache mechanics, while Phase 22 owns Public Ministry
  semantics, current-serving admission, and adverse-first controlled-surface
  convergence. No controlled response may bypass that evaluation, and no CMS,
  cache, deployment, provider result, or worker is a second public authority.
  D19 makes one organization-owned, exact-scope Ministry Assignment the
  Missionary Ministry Page subject, with separate effective-dated Party
  memberships and independently authorized Page, display, notification, and
  Support Workspace relationships. A prospective Phase-21-owned Support Binding
  may connect it to one Support Assignment, but neither that binding nor any
  family/team relationship grants financial access, reveals supporter identity,
  or moves money. Current `missionary_id`, single-person ownership, service-role,
  and browser-readable shortcuts remain prototype evidence, not authority.
  D20 defines two non-interchangeable immutable code-owned Page Family Semantic
  Catalog Generations under D3. The Missionary Ministry and Project/Campaign
  families each receive an exact bounded launch catalog; optional editorial
  roles may be **Off**, **Available**, or **Expected** and staff-only or
  contributor-editable through the prospective D3 profile. One five-group
  content editor keeps managed facts read-only and source-labelled. Every D2
  release pins the exact catalog/renderer/profile/content/locale/brand/managed-
  reference generations, while unknown, wrong-family, unauthorized, stale, or
  over-budget input rejects the new candidate and preserves the last certified
  release. The shared generic Payload builder is migration evidence, not D20
  authority.
  D21 adds one complete-surface authority adoption per exact Tenant × Legal
  Entity × environment × Site × verified-host set × locale. Preparation is
  private, additive, chunked, resumable, and incremental; the public surface
  changes once through one content-addressed complete Adoption Coverage
  Manifest and one short current-reproved, idempotent CAS cutover. Every legacy
  route, Page/version, shared dependency, subject/Giving hint, Update, media
  artifact, preview, discovery/search/share output, cache variant, API/reader,
  fixture, and import path receives exactly one proved disposition. A frozen
  compatible-legacy D2 release may retain only certified safe editorial
  presentation under the new gateway. It is never a generic fallback reader or
  a source of managed truth. After cutover Phase 5/D18 is the sole reader and
  cannot fall back to mocks, raw Payload publication, an old cache namespace,
  or the legacy runtime.
  D22 adds one disposable, permission-filtered Public Page Operations
  Projection with exactly **To review**, **Needs attention**, and **All pages**.
  It derives current root causes and exact Page/Update impacts from versioned
  owner descriptors, routes finite literal actions to the owning workflow for
  current reproof, and leaves resolution to owner proof. Its views are not Page
  states, and it creates no health score, mutable close state, second repair
  authority, relationship-derived access, or donor-facing operations surface.
  D23 adds one quiet scope-first, disposable Public Page Setup & Settings
  Projection over source-owned configuration versions and capability facts; it
  stores no settings, changes exactly one owner at a time, and cannot activate,
  publish, clear operations work, or create cross-owner atomicity. D24 adds one
  attribution-preserving Staff-authored Page Revision path inside D1's sole
  working head and the existing D4/D5/D2 review-and-release lane. Routine edits
  stay quiet; active or submitted contributor work remains immutable and
  attributed; staff edit, review, release, reach, safety, and managed-fact
  authority remain separate; and one current-reproved idempotent CAS prevents
  Payload-native, last-write-wins, restore, or override behavior from becoming
  product truth.
- **Depends on:** #1, #13; Phase 5 (public runtime contract).
- **Acceptance test:** a real operational missionary or project has one typed,
  CMS-authored, immutable-release-backed page whose current D2/Phase 10 reach,
  D7 Giving, D9 media, and source facts fail closed independently; an authorized
  contributor/reviewer previews one exact version through the production-
  equivalent renderer while copied URLs, unrelated authenticated principals,
  stale grants, and consequential controls remain inert or unavailable; an
  authorized supporter sees only the exact enabled D12 response actions and
  one consistent current projection, while anonymous/wrong-scope users receive
  no protected counts, identities, comments, cursors, or realtime state; the
  active D13 Together or Separate public directory returns exactly the same
  eligible release membership under server-owned family and locale scope, and
  safety narrowing removes affected positive results without raw-source or
  stale-cache fallback; each exact D14 release returns coherent server-rendered
  body/head, canonical and crawler posture, reciprocal admitted locales,
  sitemap disposition, visible-fact structured data, D9-certified social card,
  and accessible Share fallback from one coverage digest, with Listed-public,
  Shared-by-link/noindex, and non-public states remaining distinct; D15 Off
  produces no occurrences, every fetch/render/preview/machine path remains
  measurement-effect-free, duplicate intake is idempotent and bound to one
  exact release,
  current assignment revocation removes contributor report access immediately,
  low-count and coverage states never silently become zero, and measurement
  failure never changes Page, Share, Give, cart, or checkout behavior; and D16
  disabled/unsafe/unsupported/provider-failure states preserve complete manual
  authoring, source or target changes cannot be overwritten, Translate to
  English names and certifies the exact pair, its warning and source comparison
  remain accessible, and Use creates only one ordinary working revision; and
  D17 rejects generic or cross-scope subject references, duplicate current
  Pages, source-derived permissions/Giving/progress, destructive source
  deletion, and post-release subject swaps while a staff setup clearly separates
  **This Page is about** from **Gifts go to** and every other independent fact.
  Every Asym-controlled public response also proves D18 current-serving
  admission before returning reusable positive content; adverse or unknown
  authority denies or omits the affected positive behavior before asynchronous
  convergence, without stale fallback or a second public head; and D19 proves a
  couple or team can share one Missionary Ministry Page while each person keeps
  an own-identity login and only explicitly authorized people can read the exact
  Phase-12-authorized, D19-associated Support Workspace modules, fields,
  currencies, and history; and
  D20 proves each Page uses exactly one compatible family catalog generation,
  contributors can edit only offered authorized semantic roles, and unknown,
  wrong-family, duplicate, over-cardinality, or over-budget input cannot enter a
  candidate. Preview, release, and public serving use the same pinned compiler/
  renderer generation and preserve the last certified release on failure; and
  D21 proves a count- and digest-reconciled complete source census, exactly one
  non-overlapping disposition per item, side-effect-dark production-shaped
  shadow parity for every included and excluded controlled surface, and one
  CAS winner after final scope/permission/source/generation reproof. Before the
  CAS no public behavior changes; afterward no request, old deployment, cache,
  reader, fixture, copied CTA, or recovery path can restore superseded authority
  or silently change a Designation; and D22 proves one cause can affect many
  Pages without task or notification fanout, many causes on one Page remain
  independently owned, permission-filtered rows/counts/search/cache reveal no
  unauthorized Page, stale or unavailable coverage never becomes healthy or
  resolved, and only current owner proof removes work while each action returns
  safely from the owning workflow; and D23 proves one scope-first setup/settings
  projection displays exact source-owned choices, fallbacks, capabilities, and
  consequences without storing them, while every amendment invokes exactly one
  current-authorized owner command, appends an immutable successor, handles
  conflict or uncertainty without stale overwrite, and cannot publish, activate
  D21, clear D22 work, change per-Page choices, or manufacture cross-owner
  atomicity; and D24 proves routine staff editing creates one private,
  staff-attributed ordinary successor with no source question or reason, while
  superseding active or submitted contributor work preserves the exact
  candidate, actor, source, safe reason, and accessible semantic comparison.
  Reviewer-only staff cannot edit, editor-only staff cannot approve or release,
  stale-head or ambiguous outcomes cannot overwrite work, and prior content is
  reused only through **Use as starting point** as a new successor; and D25
  proves preserved work remains private and recoverable without a database
  state machine, while every action is derived and currently re-proved and only
  immutable semantic content can enter a revision or candidate; and D26 proves
  the existing final action atomically records the actual submitter's exact
  candidate-bound attestation with no checkbox or second permission workflow,
  cannot be inherited or fabricated, and never overrides a direct Phase 10
  objection, `do_not_publish`, restricted-person rule, or stricter safety result;
  and D27 proves one Site-scoped Page identity remains locale-independent while
  each Page × locale content release stays independent, one compatible
  Site-family presentation activation either advances the complete fenced cohort
  or leaves the prior generation current, and no Page/locale layout override,
  automatic translation, public locale fallback, partial activation, or
  editorial republication is introduced.
- **Evidence:** phase 06/07 CMS evidence; PR #462 current-state note; the
  [Phase 22 PRD](./phase-22-public-ministry-pages.md),
  [`add-public-ministry-pages` OpenSpec change](../../../openspec/changes/add-public-ministry-pages/proposal.md),
  [Phase 22 decision log](./phase-22-public-ministry-pages-decision-log.md),
  [research evidence](./phase-22-public-ministry-pages-research-evidence.md),
  [ADRs 0118–0144](../../adr/0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md),
  and
  [D13 ADR-0130](../../adr/0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md)
  plus
  [D14 ADR-0131](../../adr/0131-release-bound-public-search-and-sharing-presentation.md).
  See also
  [D15 ADR-0132](../../adr/0132-bounded-public-ministry-measurement-and-contributor-visibility.md).
  See also
  [D16 ADR-0133](../../adr/0133-source-bounded-public-page-writing-assistance.md).
  See also
  [D17 ADR-0134](../../adr/0134-exact-typed-public-page-subject-bindings.md).
  See also
  [D18 ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).
  See also
  [D19 ADR-0136](../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).
  See also
  [D20 ADR-0137](../../adr/0137-two-bounded-page-family-semantic-catalogs.md).
  See also
  [D21 research evidence §44](./phase-22-public-ministry-pages-research-evidence.md#44-ratified-d21-research--complete-public-ministry-surface-authority-cutover)
  and
  [D21 ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).
  See also
  [D22 research evidence §45](./phase-22-public-ministry-pages-research-evidence.md#45-ratified-d22-research--quiet-derived-public-page-operations)
  and
  [D22 ADR-0139](../../adr/0139-derived-public-page-operations-with-cause-owned-actions.md).
  See also
  [D23 research evidence §46](./phase-22-public-ministry-pages-research-evidence.md#46-ratified-d23-research--derived-public-page-setup-and-settings)
  and
  [D23 ADR-0140](../../adr/0140-derived-public-page-setup-and-settings.md).
  See also
  [D24 research evidence §47](./phase-22-public-ministry-pages-research-evidence.md#47-ratified-d24-research--attribution-preserving-staff-authored-page-revisions)
  and
  [D24 ADR-0141](../../adr/0141-attribution-preserving-staff-authored-page-revisions.md).
- **Decision status:** the completed
  [formal closure audit §51](./phase-22-public-ministry-pages-research-evidence.md#51-formal-phase-22-closure-audit--d1d27-are-product-decision-complete)
  found no unresolved Phase-22-owned founder choice. The founder selected Option
  A on 2026-08-14, scope-freezing D1–D27 and closing the grill without opening
  D28. The founder subsequently invoked `/to-spec`; the PRD and active OpenSpec
  change are now the implementation-ready specification, while Phase 22 remains
  unimplemented. Parent issue
  [#1281](https://github.com/Asymmetric-al/core/issues/1281) owns 41 approved
  native child issues, #1282–#1322, and 117 native blocking relationships;
  P22-01/#1282 alone among the 41 implementation children is the current
  `ready-for-agent` frontier. That planning posture is not build, deployment,
  or production proof. D24 is ratified as one
  attribution-preserving Staff-authored Page Revision path inside the sole D1
  working head and D4/D5/D2 review-and-release lane.
  D25 is ratified as the database-minimal, action-specific hardened C-prime-R;
  it adds no D25 workflow table
  or status and keeps only one coalesced Payload recovery buffer beneath the
  existing coherent head. See
  [D25 research evidence §48](./phase-22-public-ministry-pages-research-evidence.md#48-ratified-d25-research--cause-gated-actionability-with-bounded-recoverable-editorial-work)
  and
  [accepted ADR-0142](../../adr/0142-derived-editorial-actionability-and-bounded-recovery.md).
  D26 is ratified as the exact hardened A-prime-R: one calm whole-candidate
  Public Content Sharing Attestation through the existing final action, no
  extra checkbox or rights-management workflow, and all known Phase 10
  prohibitions preserved as non-overridable. See
  [D26 research evidence §49](./phase-22-public-ministry-pages-research-evidence.md#49-ratified-d26-research--one-calm-page-content-sharing-attestation)
  and
  [accepted ADR-0143](../../adr/0143-candidate-bound-public-content-sharing-attestation.md).
  D27 is ratified as one Site-scoped Page with one Missionary
  and one Project/Campaign family profile shared by every Page/locale in that
  family, independent locale editorial release, no public locale fallback, and
  one D2-race-fenced complete-cohort compatible family switch. Its live D3
  presentation head explicitly amends the current D2/D3/D14/D18/D20/D23
  composition. See
  [D27 research evidence §50](./phase-22-public-ministry-pages-research-evidence.md#50-ratified-d27-research--one-family-pattern-with-independent-locale-content)
  and
  [accepted ADR-0144](../../adr/0144-site-family-presentation-with-independent-locale-releases.md).
  Implementation, migration, and production activation remain separate work
  governed by the published issue graph and each ticket's live blockers.

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
  groomed-not-dispatched; epic #873 and children #874–#905 are published, every
  child remains open with `status:blocked`, and none carries
  `ready-for-agent`.

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
