# Phase 1 — Source-of-Truth Ownership Matrix

> **Program:** SiteStacker Parity · **Phase:** 1 · **Status:** Ruled (founder
> ruling, Phase 9 grill session 2026-07-06) · **Base:** `develop`
> **Kind:** Governance artifact, not a build phase. This document is the
> standalone Phase 1 deliverable that the
> [`phase-map.md`](./phase-map.md) tracked as an open question.
> **Keystone decision:**
> [`ADR-0001`](../../adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md)
> — Asym Postgres owns all CRM truth; Twenty CRM is retired.
> **Naming note:** this file is **not** related to the tombstoned
> [`phase-01-crm-operating-foundation.md`](./phase-01-crm-operating-foundation.md),
> which carried old roadmap numbering and was superseded by Phase 8.

Every later phase writes records somewhere. Before more write paths land,
this matrix fixes — per record type — **which system owns the truth, who may
write it, who wins a conflict, and how a divergence is repaired**. If any
document disagrees with this matrix, this matrix (and ADR-0001 behind it)
wins, and the disagreement is a bug to fix, not a fork to preserve.

## The one-sentence ruling

**Asym Postgres is authoritative for Asym-owned operational decisions,
source-domain facts, immutable observations, Accounting Releases, and evidence.
External systems remain authoritative for the actions and records they own:
Supabase Auth for authentication; Stripe for processor execution, balance
transactions, and payout state; bank sources for observed bank evidence; and
QBO/Xero for accepted provider records, books, period close, and final
reconciliation. Provider facts never redefine donor identity, Legal Entity,
designation, or source-domain gift truth. Twenty CRM is retired as a product
dependency entirely (ADR-0001, 2026-07-06).**

## Ownership matrix

| Record type                                                                                                                                                                                                                         | System of record                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Write path                                                                                                                                                                                                                                                                                                                                                                                                             | Conflict winner                                                                                                                                                                                                                                                                                                                                                             | Repair path                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Auth users, sessions, credentials                                                                                                                                                                                                   | Supabase Auth                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Supabase Auth flows (magic link, password, claim per Phase 4)                                                                                                                                                                                                                                                                                                                                                          | Supabase Auth                                                                                                                                                                                                                                                                                                                                                               | Supabase admin APIs; Phase 4 claim/bind audit                                                                                                                                                                                                                                                                                                                                                                            |
| Profiles, tenant memberships, roles                                                                                                                                                                                                 | Asym Postgres (`profiles`, `authz.memberships` — the authz authority)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `packages/api` identity services                                                                                                                                                                                                                                                                                                                                                                                       | Asym                                                                                                                                                                                                                                                                                                                                                                        | Phase 4 identity services + audit spine                                                                                                                                                                                                                                                                                                                                                                                  |
| CRM person spine (persons anchor, party entities)                                                                                                                                                                                   | Asym Postgres (Phase 4 inert anchor → Phase 7 populated party spine)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `packages/api` (Phase 7 party services)                                                                                                                                                                                                                                                                                                                                                                                | Asym                                                                                                                                                                                                                                                                                                                                                                        | Phase 4 merge (`merge_operations`, reversible)                                                                                                                                                                                                                                                                                                                                                                           |
| Donors (legal donor identity)                                                                                                                                                                                                       | Asym Postgres (`donors`; `donations.donor_id` = sole hard credit)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `packages/api` donor/identity services                                                                                                                                                                                                                                                                                                                                                                                 | Asym                                                                                                                                                                                                                                                                                                                                                                        | Phase 4 non-destructive merge; frozen receipt snapshots never re-resolve                                                                                                                                                                                                                                                                                                                                                 |
| Missionaries                                                                                                                                                                                                                        | Asym Postgres (`missionaries`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `packages/api` missionary services                                                                                                                                                                                                                                                                                                                                                                                     | Asym                                                                                                                                                                                                                                                                                                                                                                        | Standard service-layer correction + audit                                                                                                                                                                                                                                                                                                                                                                                |
| Households, organizations, churches (parties)                                                                                                                                                                                       | Asym Postgres (Phase 7: `households`, org profiles, `org_contacts`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `packages/api` (Phase 7)                                                                                                                                                                                                                                                                                                                                                                                               | Asym                                                                                                                                                                                                                                                                                                                                                                        | Phase 4 merge contract extended to party children                                                                                                                                                                                                                                                                                                                                                                        |
| Relationship graph (typed edges between records)                                                                                                                                                                                    | Asym Postgres (Phase 9 net-new)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `packages/api` CRM services (Phase 9)                                                                                                                                                                                                                                                                                                                                                                                  | Asym                                                                                                                                                                                                                                                                                                                                                                        | Phase 9 relationship management + audit                                                                                                                                                                                                                                                                                                                                                                                  |
| CRM notes                                                                                                                                                                                                                           | Asym Postgres (Phase 9 net-new; withdrawn from the Twenty path)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `packages/api` CRM services (Phase 9)                                                                                                                                                                                                                                                                                                                                                                                  | Asym                                                                                                                                                                                                                                                                                                                                                                        | Ordinary row edits + audit; no provider reconcile                                                                                                                                                                                                                                                                                                                                                                        |
| CRM tasks                                                                                                                                                                                                                           | Asym Postgres (`mission_control_tasks`, `missionary_tasks`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Existing task services                                                                                                                                                                                                                                                                                                                                                                                                 | Asym                                                                                                                                                                                                                                                                                                                                                                        | Existing task flows                                                                                                                                                                                                                                                                                                                                                                                                      |
| CRM activity timeline                                                                                                                                                                                                               | Asym Postgres (Phase 9 net-new; composes source-truth events)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Emitting services write facts; timeline composes                                                                                                                                                                                                                                                                                                                                                                       | Underlying source of each fact                                                                                                                                                                                                                                                                                                                                              | Recompose from sources                                                                                                                                                                                                                                                                                                                                                                                                   |
| Duplicate candidates & merge state                                                                                                                                                                                                  | Asym Postgres (`crm_merge_candidates`, `merge_operations`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Phase 4 dedupe scan + merge workbench                                                                                                                                                                                                                                                                                                                                                                                  | Asym; merges never auto-run                                                                                                                                                                                                                                                                                                                                                 | Reversible un-merge (Phase 4)                                                                                                                                                                                                                                                                                                                                                                                            |
| Contribution money: gifts, designation allocations, refunds/returns                                                                                                                                                                 | Asym Postgres Phase 13 ledger; Stripe owns exact processor execution and provider observations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Donate paths + contribution operations (`packages/api`); signed Stripe evidence proves provider outcomes                                                                                                                                                                                                                                                                                                               | Asym source-domain gift meaning; Stripe only for what the processor executed                                                                                                                                                                                                                                                                                                | Source-owned append-only postings/reversals; re-ingest exact provider evidence without allowing it to rewrite legal donor, designation, or gift truth                                                                                                                                                                                                                                                                    |
| Noncash Contribution, asset/disposition source facts, Noncash Support Realization, and closed Field Account effect                                                                                                                  | Phase 13 owns the original noncash Contribution, legal donor, purpose, gift date, valuation, receipt, supporter, and fundraising truth; Phase 15 owns canonical append-only asset-lot, disposition, proceeds, finality, evidence, and correction truth; Phase 21 D21 owns only the immutable derivative realization manifest and D2/D11-closed Field Account occurrence; Phase 20 alone owns any later separately certified accounting admission                                                                                                                                                                                               | Phase 13/15 source commands preserve the original gift and exact disposition projection; D21 may derive only an exact source-final Realized Support Basis, which D2/D11 admits once through a CAS-guarded Support Cycle close; no disposition row itself posts money or accounting                                                                                                                                     | Each named source wins only its facts; D21 wins realization coverage and Field Account effect; Phase 20 wins a later qualified Accounting Release; QBO/Xero wins asset derecognition, gain/loss, cash, posted books, and final reconciliation                                                                                                                               | Re-ingest or append Phase 15 source evidence, append a non-overlapping D21 manifest successor/adverse correction, use D5 for valid purpose succession and D17 for pre-cutover coverage, and later use Phase 20 only with positive nonduplicate posting proof; never use valuation as support, create a second gift, fuzzy-map a lot, mutate a close, or post both disposition and derivative effect                      |
| Automatic recurring intent and schedules                                                                                                                                                                                            | Asym Postgres (Phase 16 recurring group/cohort/line, schedule epochs, occurrences and commands)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Phase 16 services own intent and scoped mutations; Stripe executes authorized leg/item bindings, generates ordinary renewals, and returns evidence                                                                                                                                                                                                                                                                     | Asym intent and append-only command/epoch history; provider events prove execution, never intent                                                                                                                                                                                                                                                                            | Reconcile provider-generated ordinary renewals and scoped mutation/recovery commands to exact bindings; quarantine unknown/control-loss state; formal proof-gated cutover                                                                                                                                                                                                                                                |
| Fixed-total pledges and fulfillment expectations                                                                                                                                                                                    | Asym Postgres (Phase 16 fixed pledge, plan versions, expectations, unscheduled balance lines and fulfillment applications)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Phase 16 pledge and fulfillment services; Phase 13/15 remain the only money writers                                                                                                                                                                                                                                                                                                                                    | Asym pledge versions and conserved fulfillment applications                                                                                                                                                                                                                                                                                                                 | Append correction/release/restore or exact inverse application; never mutate posted money or infer ownership from payment identity                                                                                                                                                                                                                                                                                       |
| Donor receipt and year-end donor-statement facts                                                                                                                                                                                    | Asym Postgres (Phase 7 immutable versioned facts)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Phase 7 receipt/statement engine                                                                                                                                                                                                                                                                                                                                                                                       | Asym; renderers never author truth                                                                                                                                                                                                                                                                                                                                          | Version supersede/void, never mutation                                                                                                                                                                                                                                                                                                                                                                                   |
| Generated-document definitions, requests, artifacts, current heads and records evidence                                                                                                                                             | Asym Postgres metadata plus private object storage for exact bytes (Phase 18)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | The single Phase 18 Generated Document service; renderers and storage are subordinate executors only                                                                                                                                                                                                                                                                                                                   | Asym purpose/facts/publication/current-head records plus the validated artifact digest and object generation                                                                                                                                                                                                                                                                | Source-authorized immutable correction/replacement, exact-byte recovery, or purpose-owned verified disposition; never rerender history or treat a provider URL/file as authority                                                                                                                                                                                                                                         |
| Field Account Support-statement eligibility, approved view, and financial facts                                                                                                                                                     | Phase 21 D11 Support Cycle Close, Integrity Manifest, covered occurrences, and D12 Approved Data View; Phase 18 stores only the admitted immutable Facts Package and artifact evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Phase 21 post-close projection supplies one exact Facts Package to the existing Phase 18 Generated Document service                                                                                                                                                                                                                                                                                                    | Phase 21 wins Field Account financial meaning, recipient meaning, and correction semantics; Phase 18 wins logical-document and exact-artifact truth                                                                                                                                                                                                                         | A later Support Cycle carries financial corrections; a same-facts Phase 18 successor repairs presentation/accessibility; never live-recompute history, rewrite close facts, or treat retained evidence as access                                                                                                                                                                                                         |
| Field Account occurrences, control-side entries, closes/manifests, balances, verification verdicts, and integrity cases                                                                                                             | Asym Postgres Phase 21 operational allocation subledger                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Phase 21 bounded financial commands, close publisher, and verifier; Mission Control writes follow-up task state only                                                                                                                                                                                                                                                                                                   | Immutable Phase 21 occurrence/manifest evidence wins Field Account truth; each owning source domain wins its source fact; QBO/Xero wins only posted books and final reconciliation                                                                                                                                                                                          | Rebuild disposable projections, replay only proved missing work, invoke the source owner's append-only correction, or append an exact reversal/compensating occurrence; never row edit, force balance, generic suspense, or task-state clearing                                                                                                                                                                          |
| Organization Support Cost source observations, occurrences, determinations, manifests, carryforward, closed effects, and accounting-candidate handoffs                                                                              | Exact external provider/AP or governed tenant source owns the cost fact; Phase 21 D20 owns only certified residual-family admission, one economic root, bearing policy, application, per-currency conservation, coverage, carryforward, correction, and closed Field Account effect; Phase 20 owns any later separately certified accounting admission                                                                                                                                                                                                                                                                                         | Explicit source-family binding feeds private Phase 21 D20 staging; D1/D11 alone recognizes the Field Account effect; a Support Cost Accounting Candidate Handoff remains dark until Phase 20 separately certifies it                                                                                                                                                                                                   | Source authority wins occurrence/finality; Phase 21 D20 wins internal application and close truth; Phase 20 wins a later qualified Accounting Release; QBO/Xero wins posted books/final reconciliation                                                                                                                                                                      | Re-ingest/repair source evidence, append a source-pinned determination/manifest/correction or bounded carryforward successor, and use D5 for valid retired-target succession; never fall through D3/D4/D10/D13/Phase 20 D19, duplicate processor costs, mutate a close, or infer accounting readiness                                                                                                                    |
| Support Assignments, Support Assignment Participant Memberships, workspace authorization, responsibilities, and notification preferences                                                                                            | Phase 21 owns organization-controlled Support Assignments, prospective Support Assignment Participant Memberships, and Support Workspace Notification Preference Versions; Phase 12 owns principal-bound request-time workspace authorization and current capabilities; D10/D13 own expense claimant, submitter, reviewer, and approval-route truth; D4 and the exact external Engagement Authority own compensation/payee identity; Phase 28 owns support-raising coaching/task truth; Phase 6 owns communication intent, dispatch, suppression, outcome, and history                                                                         | One Phase 21 `People & access` orchestration may invoke separately authorized owner-domain commands and one outbox intent; the sole Phase 12 PDP authorizes every read/write and Phase 6 re-proves current eligibility before release                                                                                                                                                                                  | Each owner wins only its named truth; participation, relationship, invitation, grant input, responsibility, preference, dispatch, and Field Account balance remain independent                                                                                                                                                                                              | Append prospective membership/preference/access successors or cause-linked corrections; deny access and queued notification eligibility first; reassign owner-domain work explicitly; use D5 alone for money succession; never merge identities, infer access from participation, or rewrite history                                                                                                                     |
| Field Account Opening Source Packages, Opening Coverage Manifests, Opening Positions, Operational Cutovers, and Opening Position Corrections                                                                                        | Phase 21 owns source precedence, source-fact dispositions, mapping admissibility, complete activation cohorts, exact-history qualification, residual and control entries, manifest/cutover/correction meaning, and retention purpose; Phase 29 owns private bytes/access lifecycle; Phase 30 owns import-session transport, mapping UI mechanics, and resumable staging                                                                                                                                                                                                                                                                        | Phase 30 transports and stages into Phase 21's typed preparation command; one finance-authorized Phase 21 CAS activation establishes the cohort after final reproof; Phase 20 alone may deliver a separately proved accounting gap                                                                                                                                                                                     | Phase 21 wins opening and cutover truth; each predecessor source wins what its exact artifact proves; QBO/Xero remains authoritative only for posted books, never the Field Account position                                                                                                                                                                                | Before activation discard or supersede a candidate generation; after activation append a cause-linked idempotent Opening Position Correction and manifest successor; never fuzzy-map, silently exclude, mutate a balance scalar, replay history/side effects, or treat import completion as activation                                                                                                                   |
| Expense claims, report submissions, evidence meaning, policy decisions and approved snapshots                                                                                                                                       | Asym Postgres for Phase 21 claim/report/evidence/disposition/snapshot truth; private byte lifecycle owns exact receipt bytes and access                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Phase 21 expense commands and review surface; shared AI may produce suggestions only; Phase 20 receives only a certified PII-minimized handoff                                                                                                                                                                                                                                                                         | Phase 21 wins claim, evidence meaning, policy, approval and snapshot truth; byte lifecycle wins stored bytes/access; external payroll/AP wins payment and QBO/Xero wins final books                                                                                                                                                                                         | Linked successor Claim Version, non-overlapping Approved Expense Snapshot supplement/successor, or cause-linked append-only correction; never destructive report reopening, OCR-authored truth, or report-level paid/synced state                                                                                                                                                                                        |
| Expense Claim Resolution Cause Contracts, Cases, Occurrences, Downstream Impact Manifests, and rebuildable projections                                                                                                              | Phase 21 D25 owns only the immutable exact case basis, closed cause/action contract, actor-attributed coordination occurrences, proportional complete downstream-impact coverage, and disposable next-action projection; each source domain retains its fact and correction truth; Phase 29 owns private evidence bytes                                                                                                                                                                                                                                                                                                                        | One exact D25 command reuses the sole Phase 12 PDP and invokes or observes only typed source-owner commands; Phase 6/17 owns governed communication and Phase 34 may mirror follow-up only; Phase 20 rejects all D25 objects before independent source admission                                                                                                                                                       | The root source owner wins cause proof; D10/D13, D15/D16, D23/D1/D11, D12, Phase 20, payroll/AP, providers, and QBO/Xero each win only their named successor, correction, payment, effect, statement, posting, or reconciliation truth                                                                                                                                      | Append an exact D25 occurrence and let the authoritative owner append its own successor/correction; derive completion only after every manifested family has an explicit disposition; never generic resolve/reopen/unapprove, edit as claimant, task-state completion, cross-domain rollback, or case-as-financial truth                                                                                                 |
| Expense Field Account Effect Recognition Profiles, Effect Bases, Effect Coverage, Funding Coverage Dispositions, closed Expense Field Account Effects, and cause-linked corrections                                                 | Each certified source family owns its exact qualifying occurrence and finality; Phase 21 D23 owns only prospective support-balance inclusion policy, profile resolution, immutable basis, non-overlapping exact per-currency effect coverage, funding-coverage disposition, and append-only effect correction; D1/D11 owns balanced occurrence admission and close                                                                                                                                                                                                                                                                             | D10/D13 supplies the exact Approved Expense Snapshot and D23 evaluates only the source-family-specific qualification contract; one CAS/Serializable Phase 21 commit appends effect, coverage, funding disposition, and outbox; Phase 20 rejects every D23 operational object before accounting admission                                                                                                               | Source owner wins source occurrence/finality; D23 wins operational support-balance inclusion; D1/D11 wins close; Phase 12 wins current authorization; Phase 20 and QBO/Xero independently own accounting posting and final books                                                                                                                                            | Append a source- and cause-linked D23 delta/reversal or exact D4 taxable-compensation ownership succession in a later permitted Support Cycle; never infer from approval, generic `paid`/`posted`, card statement payment, QBO/Xero state, or live provider/FX state; never let a reservation and resulting effect both consume capacity                                                                                 |
| Prospective Expense Authorization posture, requests, evidence meaning, governance, assignments, human review, decisions, capacity reservations, later-claim coverage, and residuals                                                 | Asym Postgres for Phase 21 D22 posture, request, governance, assignment, decision, exact coverage, and residual truth; Phase 29-compatible private byte lifecycle owns exact plan-evidence bytes and access; D1/D11 owns only any separately certified Field Account capacity reservation and later qualified effect                                                                                                                                                                                                                                                                                                                           | The existing Phase 21 Expenses doorway and D13 governance/route kernel execute exact D22 commands; D10 later owns actual claims and substantiation; Phase 20 rejects every prospective object before accounting admission                                                                                                                                                                                              | Phase 21 D22 wins organization authorization and exact use/residual truth; D10/D13 wins actual-claim policy and approval; D1/D11 wins Field Account capacity/effect; external payment owners and QBO/Xero retain payment and accounting truth                                                                                                                               | Withdraw before decision, append requester-authored or decision successors, link exact non-overlapping later-claim coverage, or append proved-unused release/correction; never mutate approval, infer use, release by timer, fabricate funding, or create procurement/payment/accounting truth                                                                                                                           |
| Travel Allowance Source Packages, Calculation Occurrences, and Cumulative Capacity Allocations                                                                                                                                      | Asym Postgres for Phase 21 source-package, tenant-applicability, exact calculation, coverage, and cumulative-capacity truth; primary authorities own what their schedules publish; route/map providers supply optional suggestions only                                                                                                                                                                                                                                                                                                                                                                                                        | The one D13 Expense Governance Resolution selects a bounded calculation module for an exact D10 claim item/split; D10 approval may freeze it in an Approved Expense Snapshot; D15/Phase 20 consume only independently qualified downstream truth                                                                                                                                                                       | Phase 21 wins the pinned calculation and cumulative/coverage evidence; tenant/adviser wins applicability; the named source wins its published schedule; external specialists/providers retain tax, payroll, payment, and accounting authority                                                                                                                               | Candidate source/package or profile successor, explicit unapproved recalculation, or append-only approved correction/exception/no-change disposition; never live approval lookup, implicit FX, mandatory GPS, stacked coverage, historical mutation, or calculation-as-payment/accounting truth                                                                                                                          |
| Organization Card Source, Import Profile Version, Activity File Asset, Activity Import Manifest, Transaction Evidence Version, Assignment Version, and Evidence Coverage                                                            | Asym Postgres for Phase 21 source/profile/manifest/evidence/assignment/coverage meaning; Phase 29-compatible private byte lifecycle for exact source-file bytes; issuer/export source for what it actually reported                                                                                                                                                                                                                                                                                                                                                                                                                            | Phase 21 D14 file intake and evidence commands; D10/D13 own claim and approval; Phase 20 alone receives one certified PII-minimized approved handoff                                                                                                                                                                                                                                                                   | Phase 21 wins imported provenance, assignment, exact same-currency coverage, and append-only correction; issuer wins its source record and settlement; QBO/Xero wins posted books and final reconciliation                                                                                                                                                                  | Superseding import profile/manifest, source revision, assignment successor, or cause-linked correction; never PDF/OCR/XLSX truth, fuzzy auto-deduplication, destructive undo, personal-card browsing, automatic approval/reimbursement, or direct accounting                                                                                                                                                             |
| Tenant-owned AI provider connections, credentials, purpose bindings, egress and invocation evidence                                                                                                                                 | Shared Asym AI execution foundation: stable Provider Connections, write-only Credential Revisions, prospective AI Capability Binding Versions, Egress Manifests and Invocation Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Certified server-side provider adapters after Phase 3/10/12 authorization and classification; feature domains own suggestion meaning and acceptance                                                                                                                                                                                                                                                                    | Shared foundation wins connection/credential/binding/invocation provenance; each source domain wins accepted truth; provider wins only the exact attempt/outcome it proves                                                                                                                                                                                                  | Prospective binding successor, serialized credential replacement/revocation, cryptographic erasure of secret material, and inspect-before-retry; never secret readback, silent provider fallback, arbitrary endpoint/model, or cross-domain AI write                                                                                                                                                                     |
| Public Page Writing Source Packages, Suggestion Versions, translation warnings, and suggestion applications                                                                                                                         | Phase 22 D16 owns the exact D1/D3 semantic target, source-minimal package, private immutable suggestion, application provenance, and authoring meaning; Phase 21 D10 owns provider/credential/binding/egress/invocation truth; Phase 10 owns safety; Phase 12 owns current actor authority; Phase 24 owns locale/translation status; CMS owns the resulting ordinary working revision                                                                                                                                                                                                                                                          | A currently authorized actor explicitly invokes one code-owned action through D10, reviews the unchanged source against one suggestion, and CAS-applies it into at most one D1 successor revision; Translate to English additionally requires an exact certified source-language → existing English-locale pair and the check-work warning                                                                             | D16 wins only suggestion and application meaning; D10 wins provider execution evidence; D1/D3 and CMS win working-revision content; Phase 10/12/24 and D4/D5 independently win safety, authorization, locale/status, and release. Provider fluency, Use, staff approval, bilingual review, certification, and publication remain separate                                   | Append a successor source package/suggestion/application or use ordinary draft revision history; expire private suggestion bodies; deny stale or unsafe application; never mutate the source, infer a locale, combine translation with rewriting, create publication truth, or treat an AI result as verified/certified                                                                                                  |
| Field Account compensation handoff authority and evidence                                                                                                                                                                           | Asym Postgres for Compensation Handoff Package, Compensation Draft Delivery Profile Version, adapter certification, Provider Draft Operation, and coverage; exact external payroll/AP provider for its native draft/input/result/payment truth                                                                                                                                                                                                                                                                                                                                                                                                 | Phase 21 package/profile/operation services call only the exact provider/product/country/operation currently certified; Phase 20 alone writes accounting                                                                                                                                                                                                                                                               | Asym wins package, route, profile, and operation evidence; provider wins what it accepted or later did; external HR/payroll/AP wins classification, calculation, approval, completion, and payment                                                                                                                                                                          | Append-only profile successor, exact inspect/readback or permitted confirmation, `proven_not_updated` residual successor, or `outcome_unknown` quarantine; never blind retry, dual delivery, adjacent-object substitution, or accounting inference                                                                                                                                                                       |
| Reimbursement handoff authority and evidence                                                                                                                                                                                        | Asym Postgres for Reimbursement Handoff Package, Delivery Profile Version, Execution Claim, Handoff Coverage, Handoff Attestation, Handoff Operation, and exact payment-evidence linkage; external payroll/AP/manual process owns execution                                                                                                                                                                                                                                                                                                                                                                                                    | Phase 21 creates a package without execution, then one explicit release claims exact non-overlapping coverage for one manual or currently certified pre-execution lane; Phase 20 alone writes accounting                                                                                                                                                                                                               | Asym wins package/claim/coverage/attestation/operation evidence; exact provider wins only what it proves; external process wins execution; source-qualified payment evidence wins payment; Phase 20 D17/QBO/Xero win accounting                                                                                                                                             | Append-only profile and operation successors for exact `proven_not_handed_off` residual only; inspect unknown outcomes; append return/reversal/correction/reissue evidence; never dual deliver, fuzzy match, mutate history, infer payment, or create QBO/Xero Accounting                                                                                                                                                |
| Missionary Support Feed projection, subscription, and delivery evidence                                                                                                                                                             | Phase 13, 14, 16, 21, and later 28 each retain their exact source facts; Phase 31 owns the prospective Subscription Version, Coverage Manifest, cursor/hint/delivery/revocation evidence, and rebuildable recipient-scoped composite                                                                                                                                                                                                                                                                                                                                                                                                           | Owner projections feed Phase 31; it composes and transports one certified read-only mapping and never writes source truth                                                                                                                                                                                                                                                                                              | The current owner-domain version and current authorization epoch win; a provider wins only for the exact fetch, application, or removal outcome it actually proves                                                                                                                                                                                                          | Rebuild or resnapshot from pinned source versions, reset an obsolete cursor, and append exact delivery/revocation evidence; never mutate an owner domain, write gifts or contacts back, infer deletion, or create accounting/payroll/payment truth                                                                                                                                                                       |
| Phase 21 record schedules, retention resolutions, tenant records packages, coverage manifests, custody assertions/transfers, holds, and copy-disposition evidence                                                                   | Asym Postgres for Phase 21 D26 schedule/binding/resolution/package/manifest meaning; Phase 29-compatible private storage for exact bytes and copy lifecycle; owner domains retain referenced source truth                                                                                                                                                                                                                                                                                                                                                                                                                                      | Phase 21 resolves schedules and compiles only governed owner projections; Phases 3/10/12 authorize egress; Phase 29 stages/streams/holds/disposes bytes; Phase 31 may later transport to one certified destination                                                                                                                                                                                                     | Phase 21 wins record-family, schedule, binding, resolution, package and manifest meaning; Phase 29 wins byte/copy execution; each referenced owner wins its source; a destination proves only exact accepted custody                                                                                                                                                        | Append immutable schedule/binding successor, impact manifest, fresh authorized package or residual package, and copy-specific outcome; never mutate a sealed package, infer transfer from download, cascade disposal, use Phase 30 outbound, or turn the package into a Phase 19/20/33 artifact or QBO/Xero backup                                                                                                       |
| Phase 21 Release Generation, Field Accounts Adoption Plan Version, Go-Live Readiness Manifest, and Operational Readiness Projection                                                                                                 | Platform release evidence owns only release qualification; Phase 21 D27 owns plan and manifest semantics; every D1-D26 or cross-phase owner retains the referenced fact; the projection is disposable                                                                                                                                                                                                                                                                                                                                                                                                                                          | Machine preparation plus authorized prospective plan commands; D17 alone performs financial cutover; each optional owner alone activates its bounded lane                                                                                                                                                                                                                                                              | The immutable source record from each owner wins its own fact; no combined `ready`, `live`, or `healthy` status becomes financial, permission, publication, provider, accounting, payroll, payment, or reconciliation truth                                                                                                                                                 | Append immutable plan/manifest successors, repair through the source owner and D17/D11 paths, and apply smallest-scope prospective containment; never toggle, waive, force-pass, destructively roll back, or treat Mission Control task completion as proof                                                                                                                                                              |
| Travel Allowance Capacity Key Contracts, Opening Cumulative States, Cumulative Admission Manifests, first-use admissions, and affected-suffix corrections                                                                           | Each external source owns its predecessor activity and prospective-completeness facts; Phase 21 D28 alone owns the versioned Capacity Key Contract, Opening Cumulative State, opening/continuity admission semantics, complete Cumulative Admission Manifest, group-atomic first-use admission, and append-only affected-suffix correction coverage; D18 owns only later native calculation facts; D27 owns only a reference to current proof                                                                                                                                                                                                  | One source-authorized clean-boundary, exact opening-state, or external-at-boundary disposition plus one prospective-completeness disposition enters the D28 admission command; D18 alone performs any later native calculation and Phase 30 may transport only selected bulk preparation                                                                                                                               | Source evidence wins its source facts; D28 wins cumulative admission and correction truth; D18 wins later native calculation truth; D27 cannot recreate, waive, or reinterpret the proof                                                                                                                                                                                    | D28 appends one exact Opening Cumulative State correction and recomputes only the affected suffix or indivisible group; missing never becomes zero, uncertain scope remains on D18's external-calculation lane, and no admission fact creates claim, approval, Field Account, payment, payroll/tax, or accounting truth                                                                                                  |
| Communication history                                                                                                                                                                                                               | Asym Postgres (Phase 6 `communication_events`); Resend/Mailchimp = providers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | The single Phase 6 `sendEmail` seam                                                                                                                                                                                                                                                                                                                                                                                    | Asym                                                                                                                                                                                                                                                                                                                                                                        | Phase 6 delivery-event reconcile                                                                                                                                                                                                                                                                                                                                                                                         |
| Ministry Project identity/lifecycle, Phase 13 Campaign or Designation subject eligibility, and Public Ministry Page Subject Binding versions                                                                                        | The Phase 9 CRM operational layer owns each Ministry Project's stable identity, Tenant/Legal Entity scope, type, version, and lifecycle; Phase 13 owns Giving Campaign and Designation identity/lifecycle plus explicit public-subject eligibility; Phase 22 D17 owns the exact typed Page Subject Binding and release-pinned privacy-safe snapshot; Phase 10 owns safe public labels/snapshot eligibility; Payload owns presentation content only                                                                                                                                                                                             | Each source owner writes and versions its own record; one Phase 22 server command binds exactly one owner-certified source to a Project/Campaign Page under same-scope composite integrity, then D2 pins the exact binding version only after current source and Phase 10 reproof                                                                                                                                      | The source owner wins identity and lifecycle; D17 wins what the Page is about; D1/12 wins contributors, D6 progress, D7 Giving, D8 Page lifecycle, D2/10 reach and safety, and CMS wins authored presentation. No source relationship advances another authority                                                                                                            | Before first release, append one CAS-guarded binding successor; after first release, create a new Page identity and use D8 succession. Restrict source deletion, quarantine ambiguous migration, and never infer a Ministry Project, Giving destination, progress source, permission, or public label from `fundId`, names, CMS content, Campaign ownership, or Designation membership                                   |
| Ministry Assignment identity/lifecycle, Ministry Assignment Participant Memberships, Missionary Page subject/display/contributor relations, optional Ministry Assignment Support Binding Versions, and authenticated support access | Phase 9 owns the organization-controlled Ministry Assignment and prospective participant association; Phase 22 D1 owns Page Subject Binding, Display Participant, and Public Page Contributor Assignment and D19 owns only orchestration semantics; Phase 21 owns the separately finance-authorized exact Support Binding Version, Support Assignment, support activity, and per-currency Field Account truth; Phase 12 owns current principal-bound purpose/projection/target/field/history authorization; Phase 10 owns the public-safe snapshot; Phase 6 owns notification delivery                                                         | Source-owner commands may be composed by one D19 `People & access` experience only after independent authorization for every selected consequence; public release references one Phase 10-safe Ministry Assignment snapshot and authenticated support reads invoke the sole Phase 12 PDP                                                                                                                               | Each owner wins only its named fact; relationship, Ministry or Support participant membership, subject, display, contributor, binding, Designation, progress, preference, or prior access grants no other authority                                                                                                                                                         | Append prospective membership, finance-authorized binding, display/contributor, grant, preference, or lifecycle successors and deny revoked access first; never merge identities, propagate grants on rebinding, copy ledgers/balances, combine currencies, infer authority, or move/rewrite money or closed history                                                                                                     |
| Public Ministry Runtime Composition Contract, current-serving evaluations, applicable-surface coverage, and convergence evidence                                                                                                    | Phase 22 D18 owns only Public Ministry semantic composition, the code-owned applicable-surface coverage plan, append-only Public Ministry Surface Convergence Operation evidence, and its rebuildable convergence projection; Phase 5 owns HTTP, cache, host-resolution, invalidation, and public-reader primitives; D2/Phase 10/D8 and D6/D7/D9/D11/D13/D14/D15/D17 retain their independently authoritative facts                                                                                                                                                                                                                            | One small disposable current-serving evaluation resolves exact D2 reach, Phase 10 safety/containment, and D8 route heads before reusable positive content; owner-labelled adverse facts deny locally first, then a transactionally coupled outbox invokes Phase 5 and the existing D8/D9/D13/D14 effect owners through exact-scope, monotonic, residual-only work                                                      | Each named owner wins its source fact; D18 wins only composition and applicable-coverage semantics; a cache, provider, deployment, webhook, operation, probe, or projection never becomes release, reach, safety, route, media, progress, Giving, Update, discovery, search/share, subject, or measurement truth                                                            | Rebuild disposable evaluations/projections and append or retry only the exact residual operation under current owner proof; never create a second release/effect head, infer authority from a tag, serve stale positive content for an adverse scope, broad-purge, force success, destructively roll back, or claim control of recipient-held or external copies                                                         |
| Public editorial content, ordinary Page Revisions, Staff-authored Page Revision provenance, and presentation revisions                                                                                                              | Payload CMS owns authored content, typed presentation-block values, assets, and editorial version bytes; Phase 22 D1/D24 owns the one coherent working-head contract, exact contributor/staff actor and authority path, predecessor and same-scope content-source identities, semantic comparison, and safe supersession reason where required; D4/D5 owns candidate/review truth; D2 owns the immutable release manifest, current-public head, and public containment; D18 owns runtime composition and controlled-surface convergence; Phase 10 owns the publication-safety ceiling; Phase 12 owns current edit/review/release authorization | Web Studio prepares private content versions only; one Phase 22 server command re-proves current exact-scope authority and D3/D20 editable targets, appends one attributed ordinary revision, and CAS-advances the working head; D4/D5 and D2 alone create and release an eligible candidate                                                                                                                           | CMS wins authored content and stored version bytes; D1/D24 wins working-revision and staff-attribution/supersession meaning; D4/D5 wins review; D2 wins release; Phase 10 wins current safety eligibility; Phase 12 wins current authorization; operational identity remains in Asym Postgres                                                                               | Append an ordinary Page Revision or Phase 22 release successor; use a prior revision only as a new starting point; reconcile inert pre-commit content versions; contain an unsafe current release at the smallest scope; never mutate a candidate, rewind a head, fabricate legacy attribution, treat autosave/lock/`_status`/restore/native publish as authority, or copy operational identity/financial truth into CMS |
| Editorial Actionability Evaluations and Public Page Recovery Buffers                                                                                                                                                                | Phase 22 D25 owns only the finite derived action-evaluation and bounded recovery semantics; every existing owner retains its Page, head, candidate, decision, release, safety, authorization, catalog, subject, lifecycle, media, retention, and erasure facts; Payload CMS owns the one private mutable non-semantic recovery object and editorial bytes; D24's existing reconciler owns reference-safe scratch and inert-prepare cleanup                                                                                                                                                                                                     | A server resolver permission-filters current exact-scope owner facts for each read, while each selected owning command independently re-proves its prerequisites at commit; the production-certified Payload adapter coalesces one Page-and-locale buffer beneath the expected D1 head and editor lease, and deliberate work first becomes an immutable non-autosave semantic version before D1/D4/D5 may reference it | Existing owner facts and commands always win; D25 wins no persistent actionability, expiry, archive, recovery, retention, resolution, health, or Page status. Stored bytes, elapsed time, prior authorship, a recovery buffer, and a disposable evaluation grant no authority                                                                                               | Recompute the evaluation, append an attributed same-scope D1 successor, or let D24 reclaim only reference-proved scratch after authoritative recheck; uncertainty preserves private work and omits unproved actions. Never create a D25 state machine, per-actor branch, per-autosave operational event, native restore/delete authority, age-created cause, cross-scope copy, or blind cleanup                          |
| Public Page Operations Projection, projected owner-cause references, Page/Ministry Update impacts, view membership, coverage, and cause-owned action navigation                                                                     | Phase 22 D22 owns only the finite adapter catalog, disposable projection composition, cause-to-impact grouping, exactly three navigation views, permission-safe presentation, coverage/freshness evidence, and navigation to code-owned owner actions; each D1–D21 or predecessor source domain owns its cause, action command, resolution, and history; Phase 10 owns disclosure safety; Phase 12 owns current authorization; Phases 6/17 own communication; the shared task model owns at most one optional collaboration task                                                                                                               | Owner-domain evidence produces versioned projected references and exact impacts; every row, count, aggregate, search, export, subscription, deep link, and action is filtered and re-proved for current scope and authorization; actions enter the owning workflow rather than writing D22 state                                                                                                                       | The source owner always wins cause and resolution truth; D22 wins only projection identity, grouping, coverage, and navigation. Page status, Payload `_status`, directory membership, task status, notification state, and generic attention rows never become D22 authority                                                                                                | Rebuild the disposable projection, reconcile coverage, or append a newer owner-domain cause version; task completion, dismissal, suppression, reassignment, reminder, or read state closes nothing; never write Page health, repair owner truth from the view, infer authorization, widen counts, or duplicate causes per affected Page                                                                                  |
| Public Page Setup & Settings Projection, Public Page Setting Descriptors, derived effective choices, consequence summaries, and owner-command navigation                                                                            | Phase 22 D23 owns only the finite presentation-and-routing descriptor catalog, disposable permission-filtered projection, setup guidance, scope navigation, and UI composition; D2–D20 and Phase 21 D10 retain every configuration version, head, fallback, capability, consequence, history, and command they own; Phase 10 owns the live safety ceiling; Phase 12 owns current read/change authorization                                                                                                                                                                                                                                     | The server composes exact current owner heads only after complete-scope authorization; one owner-specific form re-proves actor, capability, scope, source head, and consequence evidence before invoking that owner's typed idempotent CAS command to append one immutable successor; D23 stores no setting or generic mutation truth                                                                                  | The exact source owner always wins configuration, consequence, effective-time, and command outcome truth; D23 wins only descriptor meaning, permission-safe summary presentation, setup guidance, and navigation. Missing, built-in, fallback, Off, unavailable, partial, unknown, and not-applicable states remain distinct                                                | Rebuild the disposable projection or invoke the owning workflow to append a prospective successor; inspect owner truth before retrying an uncertain result; never patch `org_settings`, bulk apply/reset, use global Save all, move a head backward, infer a choice from absence, activate D21, clear D22 work, or treat saved as released/public/healthy                                                                |
| Public Ministry Discovery Profile Versions, Directory Projection generations and heads, membership coverage, bounded query/card contracts, cursors, and topology-specific presentation                                              | Phase 22 D13 owns the exact-scope discovery topology, complete immutable projection generation, public card/query semantics, cursor contract, activation, and directory-specific diagnostics; D2 alone owns `Listed publicly` membership eligibility; Phase 10 owns the safety ceiling and containment; D8 owns route dispositions; D6/D7 own optional progress/Giving references; Phase 5 owns HTTP/cache/canonical/sitemap transport; Phase 23 owns only ordinary layout/navigation infrastructure; Phase 24 owns locale/domain configuration; Phase 40 may later consume the admitted projection without widening it                        | One complete D13 shadow generation derives from the exact current D2/Phase 10 release census, proves one row for every eligible release and zero for every ineligible release, and advances one current head by idempotent CAS; topology routes query that same generation through server-owned scope and family constraints                                                                                           | D2 wins page reach and membership eligibility; Phase 10 wins safety; D13 wins only discovery composition and query/card meaning; D8/5 win route/HTTP effects; optional D6/D7 failures never change membership; neither CMS, `public.locations`, raw operational tables, a cursor, cache, crawler, nor later global search becomes authority                                 | Shadow-build and reconcile a complete successor, activate one head, and remove affected positive rows before or atomically with wider rebuilds; append profile/projection successors and preserve proved absence; never create separate family indexes, a second visibility switch, browser/Realtime authority, cross-locale fallback, destructive rebuild, or stale-positive fallback                                   |
| Page Giving Bindings and public Giving readiness                                                                                                                                                                                    | Phase 22 D7 owns the immutable released-page-to-Designation binding, protected replacement, CTA consistency, and affected-action containment; Phase 13 owns Designation and Settlement Account Binding eligibility, cart/contribution acceptance, provider execution, and contribution truth; Phase 10 owns public-safe labels/eligibility; Phase 5 owns server-resolved transport                                                                                                                                                                                                                                                             | Authorized staff selects one exact same-scope Designation through the normal Phase 22 candidate/release path; Phase 5 re-resolves at cart/checkout and Phase 13 re-proves immediately before provider execution                                                                                                                                                                                                        | D7 wins released page intent; Phase 13 current eligibility wins whether Giving may proceed; Phase 10 wins what may be exposed; neither CMS, source code, cache, contributor, nor provider object may select or replace the destination                                                                                                                                      | Contain the affected CTA immediately, preserve the safe page when permitted, and release a prospective staff-controlled replacement; never enumerate a Phase 22 MVP picker, trust a legacy URL/parameter, or silently fall back to another purpose                                                                                                                                                                       |
| Ministry Update Revisions, Audience Release Projections, Supporter Response Profile Versions, Engagement Spaces, response/comment revisions, moderation occurrences, and rebuildable audience-local response projections            | Phase 22 D11 owns canonical Update/Revision and Public Page/Supporter release meaning; D12 owns the prospective response ceiling, exact Engagement Space, typed response/comment and moderation occurrences, and rebuildable counts/viewer state; Phase 9/28 owns supporter relationship/purpose; Phase 10 owns safety; Phase 12 owns current authorization; Phases 17/6 own communication; D7/Phase 13 owns Giving                                                                                                                                                                                                                            | D11's release command creates exact audience projections; guarded Phase 22 response commands re-prove current owner-domain audience/safety/authorization and append idempotent occurrences; public runtime exposes no protected response fact                                                                                                                                                                          | D11 wins release truth; D12 wins response and moderation meaning; Phase 9/28, 10, 12, 17/6, and 13 each independently win only their named relationship, safety, authorization, delivery, or financial truth                                                                                                                                                                | Append a Revision/release successor, reversible acknowledgement occurrence, comment revision/withdrawal, or reasoned moderation disposition; rebuild disposable projections; never mutate Update counters, copy across audiences, infer authority from gifts/relationships, send hidden messages, expose raw tables/Realtime, or treat engagement as relationship or Giving truth                                        |
| Public Page Route Generations, Route Dispositions, tombstones, current projection, and Route Effect Manifests                                                                                                                       | Phase 22 D8 owns immutable route claims, source/cause-qualified disposition semantics, same-Page move eligibility, transition notice meaning, permanent tombstones, append-only effect intent/evidence, and the rebuildable current route head; D2 owns current release/reach authority; Phase 10 owns safety and concealment; Phase 5 owns HTTP serving; Phase 23/Payload owns only ordinary CMS redirect infrastructure                                                                                                                                                                                                                      | One server-owned D8 command re-proves source, actor, D2/D7/Phase 10, origin/target generations, and Site × locale × canonical-path availability; appends movement/removal truth through D2-head CAS; and dispatches idempotent effects through an outbox                                                                                                                                                               | D8 wins ministry-page route/disposition meaning; D2/Phase 10 wins whether any page may currently serve; Phase 5 maps the result to `200`/same-Page `308`/uniform `404`/no-store `503`; CMS, CDN, cache, search, and crawlers never become authority                                                                                                                         | Append a correcting/superseding disposition and residual effect request; re-resolve direct to the latest same-Page generation; immediately contain an ineligible target; never reuse a path, destructively rewrite history, redirect a different Page, forward untrusted parameters, confuse outage with not-found, or claim external cleanup completion                                                                 |
| Public Search & Sharing Presentation Manifests, typed Search/Share results, public Ministry Update permalink presentation, compiler generations, local readiness proof, and external outcome observations                           | Phase 22 D14 owns only the immutable manifest, typed result semantics, code-owned compiler, stable Update-permalink presentation, bounded editorial/search-sharing UX, local readiness proof, and cause-owned external observations; D2 owns reach; D3/D11 and D4/D5 own content and release; D8 owns route/effects; D9/Phase 29 owns media meaning/bytes; Phase 5 owns HTTP/head/sitemap/asset transport; Phase 10 owns safety; Phase 24 owns verified host/locale truth; D13 owns on-site discovery                                                                                                                                          | One D3/D11 and D4/D5 release operation pins exact owner-domain generations; D14 compiles one complete same-coverage manifest and Phase 5 serves its exact HTML/head, crawler, sitemap, card, asset, and share outputs; optional provider effects run asynchronously and never gate release                                                                                                                             | Each owning phase wins only its named truth; D14 wins local presentation coherence and readiness, while external crawlers, search engines, social platforms, browsers, CDNs, and recipients independently own crawl, index, rank, snippet, fetch, cache, share, refresh, removal, and forgetting outcomes                                                                   | Append a release/manifest/compiler successor or idempotent residual external effect; remove affected positive local output first on adverse proof; never mutate a publication head, widen D2 reach, use raw/inherited/cross-scope fallback, restore a stale card/sitemap result, blind-retry a provider, or equate search-ready/shared with an external outcome                                                          |
| Public Ministry Measurement Profile Versions, private transient Occurrences and idempotency evidence, sealed daily aggregate facts and corrections, coverage, and Public Page Activity Projections                                  | Phase 22 D15 owns only profile, four fixed metric meanings, admission, transient evidence, aggregate/correction, coverage, and report-projection truth; D1 and Phase 12 own current viewing authority; Phase 10 owns safety/disclosure ceilings; Phase 5 owns transport; D2/D11/D14 own release and presentation; Phase 13 owns Giving and attribution; Phase 31 alone may later own a certified external adapter                                                                                                                                                                                                                              | An authorized prospective profile activation permits same-origin fixed-schema post-render or explicit-action intake after exact release re-resolution; daily aggregation seals through-dated facts, and every staff/contributor read/export re-proves current Phase 12 or exact D1 assignment authority                                                                                                                | D15 wins only measured-interaction and aggregate meaning; every owning phase retains its release, authorization, safety, route, search/share, contribution, settlement, payment, attribution, provider, and operational-telemetry truth. External analytics never becomes D15 authority                                                                                     | Append profile successors and aggregate correction deltas; expire occurrences/idempotency within 24 hours and aggregates after the code-owned 24-month period; report delayed/partial/unavailable coverage honestly; never backfill logs/replay, mutate sealed truth, persist visitor identity, expose raw rows, infer permissions, or join clicks to financial truth                                                    |
| Public Ministry Media Upload Intakes, Sanitized Media Master Versions, Derivative Manifests, Placement Versions, delivery, and withdrawal evidence                                                                                  | Phase 22 D9 owns public-media meaning, context-specific placement, release eligibility, and withdrawal intent; Phase 29-compatible custody owns private byte identity, validation, scan/quarantine, deterministic transformation, copy/access, retention, and disposal evidence; Phase 10 owns current safety/consent; Phase 5 owns controlled HTTP delivery; CMS may own only authored references and presentation values                                                                                                                                                                                                                     | A server-minted single-object Upload Intent admits a private bounded intake; Phase 29-compatible processing emits an immutable sanitized master and certified derivative manifest; Phase 22 pins an exact placement and derivative generation in a Page Release Manifest; Phase 5 resolves only the opaque released delivery reference                                                                                 | Phase 10 wins whether any image or associated text may be exposed; D9 wins placement/release meaning and currentness; Phase 29-compatible evidence wins byte/processing truth; a storage/CDN provider proves only its exact operation; Phase 20 has no authority                                                                                                            | Preserve the coherent old release until a certified successor releases; append a new master/derivative/placement generation or smallest-scope withdrawal and residual purge evidence; never publish originals or provider URLs, overwrite bytes, expose a source filename/metadata, trust upload completion as release, or treat media as accounting truth                                                               |
| Public Ministry Preview selection, authorization, rendering, and effects                                                                                                                                                            | Payload owns coherently saved authored revisions; Phase 22 D4 owns immutable submitted Release Candidates; D10 owns exact preview selection and the private inert experience; Phase 12 owns current Principal authorization and named grants; Phase 10 owns the public-safe projection ceiling; D9 owns preview-media eligibility; Phase 5 owns HTTP, Draft Mode, and production-equivalent rendering plumbing                                                                                                                                                                                                                                 | An authenticated contributor deliberately selects one exact saved working revision, or an authorized staff reviewer / exact page-scoped Phase 12 `Preview only` grantee opens one immutable candidate; every HTML, data, media, refresh, and continuation request re-proves current scope and authorization                                                                                                            | Phase 12 wins whether the current Principal may preview the exact target; Phase 10 and D9 win what may be rendered; D10 wins version pinning and inert-effect semantics; Payload authentication, Draft Mode, copied URL, role names, relationships, and service roles never authorize access                                                                                | Save a new revision/candidate or change/revoke the current assignment or named grant; a newer version requires deliberate selection and never mutates an open exact preview. Deny or dependency ambiguity is non-enumerating and fail-closed; never issue/mutate a bearer token, follow `latest`, fall back to raw/live/public content, or treat preview as review/release truth                                         |
| Public Support Progress Profile Versions and public projections                                                                                                                                                                     | Phase 22 D6 owns the page-local profile, compatible source selection, disclosure choice, projection composition, and omission/exception state; Phase 13 owns corrected gross-received, exact-period, typed-count, and campaign-goal facts; Phase 16 owns active-commitment projections; Phase 28 owns Support-Raising Goal Versions; Phase 15 contributes only through admitted Phase 13 facts; Phase 10 owns privacy/safety eligibility                                                                                                                                                                                                       | A released Phase 22 page pins exactly one immutable profile selecting no progress or one compatible metric; the server-side reader composes a disposable privacy-safe projection from owner-domain facts                                                                                                                                                                                                               | Each source owner wins corrections to its fact; Phase 22 wins only binding/composition; Phase 10 wins public eligibility. Phase 20, Phase 21, and Phase 33 are ineligible as public-progress authority                                                                                                                                                                      | Replace the profile prospectively through a new release; recompute from corrected owner facts; omit the smallest unsafe, stale, incompatible, or uncomputable widget and open a cause-owned staff exception; never blend receipts and commitments, infer Field Account availability, expose raw source tables, or silently fall back                                                                                     |
| Public Content Sharing Attestations                                                                                                                                                                                                 | Phase 22 D26 owns only the code-owned statement and candidate-bound evidence meaning; D4/D5 owns the exact immutable Public Content Release Candidate and deliberate submit/publish command; D2 pins a Page candidate in its Page Release Manifest; D11 pins an Update candidate in its Audience Release Manifest and projection; Phase 10 owns known direct objections, `do_not_publish`, restricted-person rules, and current safety; Phase 12 owns current actor authorization                                                                                                                                                              | The actual currently authorized submitter creates one constant-size immutable fact atomically inside the existing candidate through the existing D4/D5 final command; D2 or D11 references that exact candidate and attestation at release                                                                                                                                                                             | D26 wins only what the actor confirmed, with which statement/version, at which time, for which exact scope, digest, and action. Phase 10 safety and direct preferences, Phase 12 authorization, D4/D5 review, D2/D11 release, and D9 media processing remain independently authoritative                                                                                    | Append a new candidate with its own attestation after any material edit, clone, import, translation, scope change, or statement successor; use D9/D2/D11/D18 for adverse containment and correction. Never mutate or inherit evidence, fabricate legacy confirmation, create a D26 table or Page Boolean, or treat attested as verified, consent-complete, safe, reviewed, approved, released, or public                 |
| Public Page Locale Lineages, current Site-family presentation heads, Public Page Family Presentation Activations, and activation manifests                                                                                          | Phase 22 D27 owns the one Site-scoped Page identity per exact D17 source-qualified typed subject, subordinate Page × Phase-24-owned locale lineages, one current D3 profile head per exact Tenant × Legal Entity × environment × Site × Page Family, and the immutable compatible family-activation and manifest semantics; D3 owns profile-version content; D2 owns Page × locale release/reach truth and immutable baseline pins; D4/D5/D26 own candidate, review, and attestation; Phase 24 owns locale availability/configuration; Phase 5 owns runtime primitives; D18 owns Public Ministry composition                                   | A compatible D3 successor is shadow-compiled against the complete current non-retired released Page × enabled-locale cohort, then one short idempotent CAS re-proves actor, scope, D2/D3 heads, Site × family epoch, exact release-head-set digest, generation, compatibility, and coherent artifacts before atomically advancing the family presentation head; each locale's editorial release remains independent    | D27 wins Page-versus-locale identity and compatible family-presentation activation only; D3 wins profile content, D2 wins content/reach releases, Phase 24 wins locale configuration, and D18/Phase 5 win semantic/runtime composition. No profile activation becomes translation, edit, attestation, review, publication, reach, route, safety, Giving, or financial truth | Keep the prior complete family generation current on any mismatch; append a successor activation or use the ordinary Page × locale release path for migration-required change; re-prove the exact cohort after races. Never copy layout JSON per Page/locale, partially activate a family, auto-translate, use public locale fallback, overwrite locale content, republish editorial meaning, or infer a missing locale  |
| Files                                                                                                                                                                                                                               | Storage provider holds **bytes**; Asym owns metadata/permissions (Phase 29)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Future file-manager services                                                                                                                                                                                                                                                                                                                                                                                           | Asym for metadata, always                                                                                                                                                                                                                                                                                                                                                   | Re-link/reissue from Asym metadata                                                                                                                                                                                                                                                                                                                                                                                       |
| Workflow / process truth                                                                                                                                                                                                            | Asym Postgres; **Inngest = execution infrastructure only**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Workflow services (Phase 34)                                                                                                                                                                                                                                                                                                                                                                                           | Asym                                                                                                                                                                                                                                                                                                                                                                        | Durable-workflow replay from Asym state                                                                                                                                                                                                                                                                                                                                                                                  |
| ~~Twenty CRM~~                                                                                                                                                                                                                      | **Retired (ADR-0001).** No surface may read or write it                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | None — the write path never opens                                                                                                                                                                                                                                                                                                                                                                                      | Not applicable — no competing copy exists                                                                                                                                                                                                                                                                                                                                   | Cleanup ticket (#602) removes dormant code; no reconcile needed                                                                                                                                                                                                                                                                                                                                                          |

**Provider rule (generalizes the last rows):** a provider may _execute_ an
action (charge a card, deliver an email, store bytes, host a login) and Asym
links the provider object by ID (the `crm_record_links` pattern, generalized
to Stripe/Mailchimp links). A provider ID is a **link, not an identity** —
losing or re-pointing it must never change who a record _is_ or what money
_happened_. For recurring giving, the provider's account, subscription, item,
invoice, payment method, and charge identifiers are execution evidence only.
They never replace the Commitment Party, donor authorization, Asym schedule,
expected occurrence, fulfillment, or posted contribution truth.

## Evidence & the one open verification item

- Repo evidence for "production Twenty was never live": three independent
  documents (integration completion-verification; Phase-4 env audit;
  Phase-8 PRD) — cited in ADR-0001.
- **Open item (Lane 2, human check):** the 2026-05-14 follow-up evidence file
  records `TWENTY_API_URL` / `TWENTY_API_KEY` / `TWENTY_WEBHOOK_SECRET`
  configured in the Vercel production/admin project, while the same-day env
  audit found no `TWENTY_*` keys in production runtime. The cleanup ticket
  (#602) must verify and revoke these entries and record the outcome per the
  Phase 0 Built/Live/Confirmed discipline.

## What changed where (congruence pointers)

The retirement ruling touches these documents (all edits point back here and
to ADR-0001; historical evidence files receive pointers only, never
rewrites):

- **This folder:** `README.md` (Phase 8 charter blurbs), `parity-matrix.md`
  (Area 1 reframed; Areas 2–3 de-Twenty'd), `phase-map.md` (rows 1 and 8–10,
  surface-ownership table), `phase-02-…md` (CRM tenant-scope wording — the
  earlier Twenty phrasing retired), `phase-04-…md` (A2 amended; reserved
  Twenty seam removed), `phase-06-…md` (negative-direction "Twenty person"
  mentions annotated — the rule survives provider-neutrally),
  `phase-07-…md` (C4 enum-extension note re-scoped), `phase-08-…md`
  (scope-amendment banner; Twenty write-enable withdrawn; re-groom pending).
- **OpenSpec:** `openspec/changes/integrate-twenty-crm-core/**` — RETIRED
  banner; spec deltas withdrawn, never to merge; physical archive move
  deferred to the cleanup ticket (#602). No **merged** spec mentions Twenty;
  no merged-spec change is required.
- **Guides:** `docs/guides/features/twenty-crm-integration/**` and
  `docs/guides/operations/twenty-crm-cutover.md` — status banners.
- **Glossary:** root `CONTEXT.md` — provider-neutral rewrites of the Phase-8
  operating terms (CRM Write Gate et al.) pending the Phase 8 re-groom
  (#603).
- **GitHub:** issue re-scoping **applied 2026-07-06** after founder
  approval — Phase 8 epic #587 carries the ADR-0001 scope banner and
  children #588–#601 carry ADR-0001 notice comments; #599 (the withdrawn
  Notes write-enable tranche) and the old Phase 1 issues #466–#476 are
  closed as superseded; Phase 4 epic #503 carries its ADR-0001 amendment
  section; the cleanup ticket (#602) and the Phase 8 re-groom session
  (#603) are filed.

## The cleanup ticket (#602 — dormant-code removal)

Scope recorded from the 2026-07-06 code inventory. **Delete:** the Twenty
client stack (`packages/api/src/crm/client/**`, health, gateway,
`schema/twenty-object-model.ts`), webhook ingress (both `webhooks/**`
packages + `crm_webhook_events`), Twenty read-through list services
(admin `relationships`/`notes`), the projection/mirror stack
(`projections/**`, `reconciliation`, `/crm/projections` UI), mapping
transforms, and the staff-visible "Twenty CRM owns …" strings (6 in
`packages/api/src/crm/projections/contracts.ts`, 1 in
`packages/api/src/admin/crm/relationships/model.ts`, 1 mirrored type literal
in `packages/database/types/crm-relationships.ts`).
**Keep:** the Supabase-backed CRM grid/detail/reports/table-preferences,
`auth/access.ts`, `commands/log.ts` + `crm_command_logs`,
`mapping/duplicates.ts` + `normalize.ts` + `crm_merge_candidates`,
`crm_record_links` (+ its identity-mapping migration/service surface —
ADR-0001 decision 3), and the durable idempotent outbound-queue pattern
(genericized) for future provider sync. **Also:** verify/revoke the Vercel `TWENTY_*` entries; remove the dev
Twenty Cloud proof record + dev API key; forward-migration re-`COMMENT` of
`staged_gifts` / `crm_command_logs`; archive the `integrate-twenty-crm-core`
package with a link-fix sweep.

## Open items

1. **Phase 8 re-groom (#603)** — a dedicated grill session re-scopes the
   operating foundation against Asym-internal subjects (ops visibility, data
   health, alerting). Until it lands the Phase 8 PRD carries a
   scope-amendment banner and its issues carry applied ADR-0001 scope
   notices, not silent changes.
2. **Lane 2 verification** of the Vercel `TWENTY_*` discrepancy (above).
3. **Issue re-scoping** — executed 2026-07-06 after founder approval: epic
   #587 bannered, children #588–#601 commented, #599 and #466–#476 closed
   as superseded, #602/#603 filed.

## Dated Phase 17 ownership amendment (2026-07-19)

**Old statement.** The matrix assigns Communication history to Asym Postgres
through the Phase 6 `communication_events` spine and treats Resend/Mailchimp as
providers. It does not yet name Phase 17's configuration and presentation
records.

**New winner.** Asym Postgres also owns the Phase 17 executable system-message
catalog and activation generations; tenant drafts and immutable publications;
Brand Kits, Role Layouts, locale readiness, fallback policy, and Delivery Plan
versions; the tenant-owned Resend connection, Sender Profile and human-reply
destination revisions; and the separately protected, expiring Recent sent copy
detail. Code owns stable catalog meaning and lifecycle. Resend executes email
and returns signed evidence only.

**Compatibility boundary.** Phase 6 continues to own communication intent,
event, dispatch, consent snapshot, provider reconciliation, and durable
body-free history. Producer domains own eligibility, facts, recipients, timing,
and protected actions. A provider message/template/account identifier is a
link, never product identity or authority. A Recent sent copy is subordinate
support detail, never communication truth, an official artifact, or a retry
payload. All tenant-facing Phase 17 records carry `tenant_id NOT NULL`,
same-tenant composite references, and the Phase 12 access floor; provider-ingest
evidence may be service-only only behind an explicit isolation contract.

## Dated Phase 19 ownership amendment (2026-07-24)

**Existing authorities remain unchanged.** Phase 7 owns the legal-donor
Statement Subject, eligibility, facts, coverage, and correction effect. Phase 13
owns posted money; Phase 14 owns recognition; Phase 18 owns generated-document
definitions, requests, logical identity, exact artifacts, current heads, access,
and records; Phase 17/6 own communication preparation, transport, delivery
evidence, and history.

**New winner.** Asym Postgres owns Phase 19's immutable Run Preflight and
purpose-pinned Statement Run/Run Items; append-only participation and release
evidence; Recipient-Document Operations, frozen delivery snapshots and
Destination Succession; Fulfillment Plans and derived Execution Lanes; release
and control fences; physical-fulfillment attempts; completion snapshots; late
fact/supplemental obligations; and the PII-minimized Run Evidence Record. The
tenant- and actor-scoped Statement Operations service is the only Phase 19 write
path.

**Conflict and repair.** A Phase 19 record never wins a conflict against its
source authority or rewrites a released run. Rebuild disposable projections,
append participation/control/completion/recovery evidence, reconcile
indeterminate external work, and create a supplemental or source-owned
correction operation. Inngest, renderers, Resend, print providers, mail houses,
object storage, and local downloads are subordinate executors or evidence—not
statement-run authority. Every Phase 19 record is tenant/environment scoped,
uses same-scope references and RLS, and preserves independently live document,
portal, communication, paper, incident, legal, and records truth.

## Dated Phase 20 ownership amendment (2026-07-27)

**Financial authority is deliberately split.** Phase 7 owns the stable Legal
Entity and immutable issuer-profile facts. Phase 13 owns posted contribution,
designation, refund, and return truth and the effective-dated Settlement
Account Binding to the exact Stripe account/environment. Stripe owns exact
processor execution, balance transactions, fees, and payout-transfer state.
The bank, imported statement, or certified read-only feed owns each observed
bank transaction. QBO/Xero owns accepted provider records, books, period close,
and final bank reconciliation.

**New Phase 20 winners.** Asym Postgres owns normalized mode-honest settlement
evidence and coverage; Expected Bank Arrivals and bounded Bank Match decisions;
tenant- and Legal-Entity-scoped accounting policy, Reporting Targets, mappings,
Posting Profiles, carrier plans, destination connections, and exact half-open
Posting Ownership Cutovers; immutable balanced Accounting Releases, evidence
artifacts, delivery packages, provider-operation evidence, exact readback and
drift findings; and cause-linked compensating releases and exception cases.
Every release uses exactly one direct-QBO, direct-Xero, or artifact lane.

**Conflict and repair.** Exact provider facts win only for what the provider
actually did; Asym relationships and decisions win only inside their bounded
contract. Missing or ambiguous settlement/bank/provider outcomes quarantine
affected work rather than trigger fuzzy inference, destination substitution,
dual-write, or whole-history replay. Repair is append-only: re-ingest exact
provider evidence, unmatch/rematch with successor evidence, reconnect the
proved same destination or activate a prospective replacement, retry only an
exactly safe provider operation, or create a new cause-linked Compensating
Accounting Release. An original release is never edited or reopened.

**Phase 21 boundary.** Phase 21 owns Field Accounts, Support Cycle Closes,
prospective Administrative Assessment Profile and Assignment versions,
Assessment Period Determinations, Assessment Entries, their immutable
source/period coverage and append-only corrections, Expense Claims, policy
decisions, Approved Expense Snapshots, Reimbursement Obligations, Field Account
Funding Coverage, and immutable evidence and coverage for External Payment
Occurrences. Phase 21 also owns prospective Compensation Funding Plan versions,
immutable Compensation Funding Decisions, purpose-typed non-reusable coverage,
artifact-always Compensation Handoff Packages, evidence-qualified Compensation
Field Account Effects, and exact typed payment coverage. D7 additionally makes
Phase 21 the authority for Compensation Handoff Adapter contracts and
certification, immutable prospective Compensation Draft Delivery Profile
Versions, the one executable route selected by each package, immutable Provider
Draft Operations, exact readback or permitted provider/staff confirmation
evidence, drift evidence, and per-unit delivery coverage. The capability-honest
launch portfolio comprises Gusto Employee Payroll Draft, ADP Workforce Now Pay
Data Input, and separately certified Xero Payroll AU/NZ draft-input adapters;
QuickBooks Workforce and Xero Payroll UK provide complete
readback-and-artifact behavior where no equivalent per-run write is proved.
The Phase 21 multi-provider launch is incomplete until at least two distinct
direct-write adapters hold current production authorization and pass a
production-shaped canary and certification.

Phase 21 D8 owns only the finance-safe Missionary Support Activity Projection,
the separately through-dated per-currency Support Balances Projection, and the
field/privacy contract under which those resource families may be exposed.
Phase 14 and Phase 16 remain the underlying supporter/recognition and
commitment authorities already composed by the activity projection. A later
Phase 28 may contribute only its separately ratified
relationship/contactability resource family. Phase 31 owns the
recipient-scoped composite Missionary Support Feed Projection, prospective
Subscription Versions, Coverage Manifests, provider authorization and mapping,
cursor/hint transport, connector health, backpressure, and delivery/revocation
evidence. The composite is disposable and rebuildable and has no independent
business authority.

Phase 21 D19 owns one immutable organization-controlled Support Assignment as
the canonical Field Account subject and prospective, effective-dated,
append-only-corrected Support Assignment Participant Memberships. Exactly one Field Account may
exist per Tenant, Legal Entity, Support Assignment, and ISO currency. Phase 12
remains authoritative for principal-bound request-time Support Workspace
authorization, grants, floors, epochs, revocation, and authorization audit;
D10/D13 own expense claimant, submitter, reviewer, and approval-route facts; D4
plus the external Engagement Authority own compensation and payee facts; Phase
28 owns support-raising coaching and task assignment; and Phase 12 owns
capabilities. Phase 21 owns one
recipient-, Support-Assignment-, event-family-, channel-, and purpose-scoped
Support Workspace Notification Preference Version; Phase 6 owns communication
intent, dispatch, suppression, provider result, and history.

Participation, access, source-owned responsibility, and notification preference
are four separate truths even when one `People & access` action coordinates
their owner-domain commands. A participant may have no login/access, and a
coach or staff viewer may have bounded access without participation. Every
person retains separate Party, principal, invitation, grant, claimant,
responsibility, and preference identities. Pending invitation grants nothing;
delivery re-proves current authorization and preference before release.
Participation changes never move money or rewrite a closed Field Account; only
D5 owns an explicit financial reallocation or succession case.

Phase 21 D20 owns only the internal application of exact source-final residual
organization service/direct-cost occurrences whose canonical family is not D3
assessment, D4 compensation, D10/D13 expense, Phase 20 D19 processor-cost, or
D21 noncash disposition/liquidation-cost truth. The external provider/AP or
governed tenant source retains occurrence,
amount, finality, correction, and payment truth. One prospective source-
admission contract, canonical economic root, finite bearing policy, immutable
per-currency conserving manifest, purpose-typed coverage, bounded carryforward,
and append-only correction prevent fallback ownership, duplicate economics,
unresolved close admission, cross-currency arithmetic, and negative Field
Accounts. D1/D11 alone recognizes a balanced Field Account effect. D9/D12 own
publication, D19/Phase 12 own access, Phase 29 owns any private source bytes,
and a Support Cost Accounting Candidate Handoff remains accounting-dark until
Phase 20 separately certifies exact source semantics, nonduplicate posting
ownership, and admission. QBO/Xero remains authoritative only for posted books
and final reconciliation.

Phase 21 D21 owns only an immutable source-mode-honest Noncash Support
Realization derived from exact source-final Phase 15 proceeds. Phase 13 retains
the original noncash Contribution, donor, accepted purpose, gift date,
valuation, receipt, supporter, and fundraising truth; Phase 15 retains canonical
asset-lot, disposition, proceeds, finality, evidence, and correction truth. An
original noncash recognized value, FMV, appraisal, or provider estimate is
structurally ineligible for monetary support and D21 never creates a second
gift. A realization manifest freezes complete Tenant/Legal-Entity/source-role/
lot/purpose/currency scope, exact quantity and per-currency minor-unit
conservation, cost treatment, Realized Support Basis, deterministic allocation,
D6 conversion evidence, non-overlapping D17/source coverage, and append-only
correction lineage. D2/D11 alone recognizes one balanced Field Account effect;
D3 assesses only the realized basis; D5 owns valid purpose succession; D19 and
Phase 12 own participant access and authorization. Phase 20 receives no current
D21 posting lane: any future Accounting Release must separately certify one
canonical economic source and prove that the disposition and derivative Field
Account effect are not both posted. QBO/Xero remains authoritative for asset
derecognition, gain/loss, cash, periods, and final reconciliation.

Phase 21 D9 separately owns immutable prospective Approved Support Plan
Versions, Support Planning Posture Versions, Support Workspace Publication
Profile Versions, and the disposable same-currency Balance Coverage, Reserve
Position, and optional Commitment Forecast projections compiled from their
exact source versions. Phase 16 remains authoritative for commitments and their
cadence normalization; Phase 28 remains authoritative for Support-Raising Goal
Versions and coaching denominators. A Phase 28 goal may copy a Plan only through
an explicit action that records provenance and creates a new independent Goal
Version; neither authority live-synchronizes or rewrites the other. A
Publication Profile controls native presentation only: it cannot create truth,
change calculations, widen authorization, or add any D9 resource to the D8 /
Phase 31 feed contract. Hiding a missionary balance never disables or changes
the underlying finance balance, close, history, or finance access.

Phase 21 D10 owns Expense Claims and immutable Claim Versions, optional
Expense Report Drafts, immutable Expense Report Submissions, receipt/evidence
meaning and coverage links, Receipt Extraction and Expense Match Suggestion
Versions, exact policy dispositions, and Approved Expense Snapshots and
non-overlapping supplements. A report is a review envelope and derived summary,
not approval, obligation, funding, payment, or accounting truth. The shared AI
execution foundation owns Provider Connections, write-only encrypted Credential
Revisions, closed Feature Purposes, prospective capability-certified AI
Capability Binding Versions, Egress Manifests, and Invocation Evidence. It
cannot accept a suggestion for a domain or widen Phase 3/10/12 authority.
Phase 29 owns the common private receipt-byte/access lifecycle without changing
Phase 21 evidence meaning. Phase 22 D16 owns source-bounded Public Page Writing
Suggestions, exact-English-locale translation warnings, and current-authorized
application into ordinary working revisions; D1–D5 and Phase 10/12/24 retain
content, release, safety, authorization, and locale authority. Phase 40 later
consumes, rather than recreates, the shared AI foundation for its generalized
workbench.

Phase 21 D18 adds one optional Travel Allowance Calculation module inside the
single winning D13 Expense Governance Profile. Phase 21 owns immutable Travel
Allowance Source Packages, exact Travel Allowance Calculation Occurrences,
duplicate-coverage proof, and serialized cumulative-capacity allocations.
Named authorities own only what their source schedules publish; the tenant or
its adviser owns applicability. D10/D13 retain claim and approval truth, D15
retains reimbursement handoff, and Phase 20 retains accounting. Calculation
never proves approval, obligation, Field Account capacity, availability,
payment, payroll/tax treatment, posting, or reconciliation. Source refresh,
route/map assistance, and GPS cannot become live approval authority, and a
different currency requires externally owned conversion evidence rather than a
Phase 21 FX calculation.

Phase 21 D22 owns an independently optional before-spend posture and exact
Prospective Expense Request, Governance Resolution, operation-scoped
assignment and human review, Organization Authorization Decision, later-claim
Authorization Coverage, unused/residual, and correction truth. Phase 12 owns
current action authority; Phase 29 owns private plan-evidence bytes/access;
D1/D11 owns only an explicitly certified compatible capacity reservation and
later qualified effect; and D10/D13 independently owns the later actual claim,
substantiation, policy, and approval. Immutable request/decision successors,
exact non-overlapping claim coverage, proved-unused release, and append-only
correction repair D22 without mutating history. A D22 plan, approval,
reservation, expiry, or application never creates an Expense Claim, advance,
Reimbursement Obligation, availability, payment, Posting Intent, Accounting
Release, or QBO/Xero truth.

Phase 21 D23 owns one prospective, certified-source-family-specific **Expense
Field Account Effect Recognition Profile**, the exact Approved-Expense-
Snapshot-rooted **Expense Field Account Effect Basis**, non-overlapping
**Expense Field Account Effect Coverage**, append-only **Field Account Funding
Coverage Dispositions**, and the resulting D1/D11-admitted operational
**Expense Field Account Effect**. Each source family retains its own qualifying
occurrence and finality: obligation-qualified claimant reimbursement, exact
external payment where that bounded alternative is activated, source-final
organization card, exact organization cash/debit/direct payment, or a
separately certified organization payable. D4 taxable compensation, D16
advance application, D20 Organization Support Cost, and D21 noncash realization
remain exclusive owners of their effects. Phase 12 owns current action
authority; Phase 20 owns only independently admitted accounting sources and
QBO/Xero final books. Repair is an exact source- and cause-linked append-only
delta/reversal or explicit ownership succession. Approval, a generic
`paid`/`posted` state, statement payment, D23 close inclusion, QBO/Xero
delivery/readback, or live provider/FX state can never qualify or rewrite the
effect. The reservation-to-effect transition is derived from immutable
dispositions so the same slice can never reduce capacity as both reservation
and debit. Claimant-paid sources may bind D16's Expense Settlement
Determination; organization-paid sources bind their exact D10/D13 approved
economic-payer slice directly and never fabricate D16 truth. A payment return
that leaves an obligation live atomically reverses the effect and restores
successor reserved coverage. D23 and Phase 20 coverage use independent purpose
namespaces. Initial adoption uses D17's complete Opening Coverage Manifest and
source-family half-open boundary; later profile replacement uses D11's complete
cycle boundary, captured cursor, and in-flight disposition manifest.

Phase 21 D11 owns immutable source-addressed balanced Field Account
Occurrences, their independently persisted bounded organization-control-side
entries, the derived non-writable Field Account Control Position, Support Cycle
Integrity Manifests, integrity-verification verdicts, and cause-owned Field
Account Integrity Cases. Every close proves one complete Tenant × Legal Entity
× ISO-currency scope over an exact half-open business interval and captured
monotonic Phase 21 ingestion interval. Mission Control may own assignment,
comments, reminders, and shared follow-up only; its task state cannot become
the defect, correction, verdict, or clearance. Repair is limited to rebuilding
a disposable projection, replaying only proved exact missing work, invoking the
source owner's append-only correction, activating a prospective configuration
successor, or appending an exact reversal/compensating occurrence. Row edit,
force close, force balance, tolerance, plug, generic suspense, and generic
mark-fixed actions do not exist.

Phase 21 D12 keeps that D11 close, manifest, and covered occurrence set as the
sole Field Account Support-statement facts authority. Phase 21 owns the
purpose-specific Approved Data View, exact eligibility and recipient meaning,
financial category/correction semantics, and the D9 prospective publication
decision. Phase 18 owns the admitted immutable Facts Package, logical document,
exact current accessible artifact, same-facts artifact successors, retention,
and private artifact access for `field_account.support_statement@1`. Phase
17/6 owns an optional readiness communication and its delivery outcome. A
statement, artifact, access result, or notice never becomes Field Account
close, QBO/Xero, payroll, reimbursement-payment, or availability truth.

The tenant's external HR/legal authority owns worker classification and
compensation entitlement; the configured provider record may carry that
external classification without making Asym its author. Payroll,
accounts-payable, or an authorized manual process owns calculation, approval,
submission, posting, execution, provider-native result, payroll/AP completion,
and payment evidence. A plan, decision, coverage reservation, export, provider
draft or acknowledgment, posted pay run, accounting entry, or payslip is not a
Field Account debit or proof of payment. Qualified effects atomically fulfill
or release matching coverage, and payment-based recognition requires
source-qualified organization-cost evidence rather than inferred gross cost
from net cash. QBO/Xero Accounting owns the books and final reconciliation,
and payroll accounting has exactly one posting owner. Phase 20 may consume only
approved
accounting-ready effects, the PII-minimized Accounting-Ready Expense Handoff,
or an explicitly certified D4 projection from an evidence-qualified
compensation occurrence with accountant-confirmed semantics and exact posting
owner. A plan, Funding Decision, reservation, or Handoff Package alone cannot
authorize accounting. Phase 20 never owns or rerates an assessment, classifies
a worker, calculates or runs payroll, or creates a second expense, payment,
payroll, Field Account, or QBO/Xero authority.

**Compensation-handoff conflict and repair.** The artifact-always package
selects exactly one executable lane. A provider draft operation never
automatically creates an External Compensation Result, payment, Field Account
effect, or Accounting Release. Every covered participant/component unit
resolves only as `confirmed_updated`, `proven_not_updated`, or
`outcome_unknown`. Only a proved non-application may enter an append-only
residual successor. Unknown work stays quarantined and cannot be retried
blindly or switched to artifact/another provider lane. Provider drift appends
evidence; it never triggers destructive overwrite. A payroll connection is
not an Accounting Destination Connection, and Xero Accounting or QBO objects
remain Phase 20-only even when a regional Xero Payroll adapter is authorized.

**Reimbursement-handoff conflict and repair.** A Reimbursement Handoff Package
may exist with zero execution claims; only explicit release atomically assigns
exact non-overlapping obligation coverage to one immutable Reimbursement
Execution Claim. The complete manual lane records an explicit Handoff
Attestation. Connected payroll/AP operations are limited to exact certified
pre-execution draft/input capabilities whose effective tenant automation
cannot approve, calculate, submit, schedule, fund, or send money. Reimbursement
may reuse D7's technical destination fence, idempotency, readback, drift, and
ambiguity kernel, but it retains separate package, profile, claim, coverage,
operation, and status truth. Provider draft readback proves handoff only.
`outcome_unknown` cannot switch lanes; only exact
`proven_not_handed_off` residual may enter an append-only successor.
`external_execution_owner` and Phase 20 D17 posting ownership remain
independent, and Phase 20 D17 assigns the owner of a future atomic
source/payment occurrence only when it
exists. External Payment Occurrence evidence retains its exact source and
strength; staff evidence remains **Payment recorded by finance**. QBO/Xero
Accounting remains Phase 20-only. Phase 21 D16 now owns the separately ratified
advance and claimant-repayment source families below; it does not reinterpret a
D15 Handoff Attestation, provider readback, accounting object, or bank match as
issuance, readiness, repayment, or returned money.

**Advance and claimant-repayment ownership and repair.** Phase 21 owns the
prospective Expense Advance and Claimant Repayment Policy Versions; exact
Expense Advance Authorization Version; source-qualified Expense Advance
Issuance Occurrence; pinned Advance Application Readiness; atomic Expense
Settlement Determination and non-overlapping Expense Advance Applications;
Repayment Subject Determination; Claimant Repayment Decision and operational
Requirement; exact Claimant Repayment Occurrence, evidence observations,
many-to-many coverage, typed residuals, corrections, and Repayment Restitution
Review. Authorization is not issuance; issuance is not readiness; a card
assignment, personal classification, portal role, or worker page is not
repayment-subject authority; a Requirement is not adjudicated debt or returned
money; and task completion is not an economic occurrence.

When an authorized advance is funded from organization-controlled support
capacity, its exact approved funding component creates purpose-typed,
non-reusable `expense_advance` Field Account Funding Coverage. Only a separately
qualified Field Account Effect under the pinned recognition contract may fulfill
that coverage. An Expense Advance Application alone cannot; a proved external
return appends its own cause-owned adverse or reversal effect before capacity
changes. Cross-currency application requires the Approved Expense Snapshot to
pin exact source and settlement amounts plus externally owned conversion
authority, rate, rounding, and residual. Phase 21 owns no FX engine.

Phase 20 may consume only separately certified PII-minimized advance issuance,
application, claimant return, or cause-linked correction occurrences under
accountant-confirmed policy and an independently assigned posting owner.
Policies, authorization, raw observations, tasks, Requirements, residual
projections, disputes, Restitution Reviews, and Field Account reservations are
accounting-dark. A Claimant Repayment Requirement becomes a receivable only if a
separate accountant-certified policy/source contract recognizes one; the cash
claimant return and expense advance return remain distinct typed economic occurrences. QBO/Xero
owns posted books and final reconciliation, never Phase 21 source or
responsibility truth.

**Opening-position and operational-cutover ownership and repair.** Phase 21 D17
owns the complete Tenant × Legal Entity × ISO-currency activation cohort,
Opening Source Package precedence, mapping admissibility, exactly-one source-fact
dispositions, atomic-group and complete D3 Assessment Period Determination
qualification,
nonnegative prefix-valid certified exact history, residual Field Account
Opening Position and balanced organization-control entry, Opening Coverage
Manifest, per-predecessor-source half-open boundaries, one common operational
through boundary, captured first-close cursor, independently live coverage
carry-forward, activation generation, and
Opening Position Corrections. Phase 29 owns private byte identity, storage,
access, malware hygiene, and access audit. Phase 30 owns import-session/upload
UX, transport, replaceable parsing and mapping mechanics, and resumable staging;
its commit, completion, or undo status has no Field Account authority.

Any D6 source-conserving atomic group spanning currencies is canonical exact
history only when wholly contained or every affected activation cohort is
linked behind one atomic barrier; otherwise it stays reference-only and each
currency uses an independently reconciled residual. No cohort may partially or
twice claim its source coverage.

The one finance-authorized Phase 21 activation occurs only after all predecessor
source families and every account in the cohort are classified and final
versions are re-proved. Before activation, any unresolved or inadmissibly
negative account blocks the whole cohort; post-activation containment is
smallest-scope and fix-forward. A source-reported negative position may be
resolved only through already source-authoritative obligation or lifecycle-
disposition evidence under the applicable owner domain; D5 applies only to an
actual exit or charitable-succession cause. Phase 21 cannot invent a generic
deficit obligation. Imported exact/reference history is side-effect-dark.
After activation, only one current-state projection transition may rebuild D9-
authorized workspace and Phase 31 views; no historical receipts, messages,
notifications, documents, feeds, accounting, payroll/AP, reimbursement, or
workflow effects replay. Reference history never enters D2 or D8. Phase 20 D17
independently owns only separately proved unposted accounting work; the Phase 21
Opening Position and cutover are accounting-dark and never make QBO/Xero Field
Account authority.

**Core Field Accounts production-activation ownership and repair.** Phase 21
D27 references D17's existing preparation and production-shaped shadow; D17
remains the sole Field Account Operational Cutover and D11 remains the sole
Support Cycle close/integrity authority. D9/D12 publication, Phase 12 access,
Phase 20 accounting, provider delivery, reconciliation, payroll completion,
reimbursement payment, and external payment outcomes remain independent. A
named missionary pilot narrows only the exact authorized publication audience
and never selects financial rows, changes the D17 cohort, or creates another
balance model. D27 records resolve into D26's existing authorization/audit/
evidence or transient staging/preview/diagnostic families; no seventh records
family exists.

For Field Account currency, Phase 21 owns the prospective Default Field
Account Currency Version, source-family-specific Field Account Currency
Activation Versions, single-currency Field Accounts, Support Balances
Projection, and any required Support Currency Allocation Manifest. Phase 13
continues to own the complete effective hard-tender contribution header and
line set—including fee-cover and other non-support lines—in its source
currency. Phase 20 or another qualified provider/bank source owns exact
organization-controlled target-currency and conversion evidence. The Phase 21
admission contract may conservingly allocate one exact typed target allocation
basis—`provider_balance_gross`, `bank_credited_amount`, or another closed
D2-qualified exact basis—across the frozen complete source line set, but only
eligible non-fee-cover designation target portions may create Gross Support
Allocations. It records only externally observed costs. Every later
cross-currency adverse occurrence receives its own immutable
successor/correction manifest, bounded by the remaining original coverage,
rather than mechanically reversing an earlier target amount or rate. The
manifest does not rewrite either source, authorize accounting translation,
create a market rate, or become balance authority; only Support Cycle Admission
Coverage accepted by a Support Cycle Close advances a Field Account balance.
QBO/Xero owns accounting translation, revaluation, and foreign-exchange
treatment.

For support reallocation, Phase 21 owns prospective Support Reallocation Policy
versions, bounded coordination Cases, Coverage Manifests and non-reusable
Coverage, immutable organization Decisions, atomic internal Field Account
occurrences, balanced external Field Account disposition occurrences,
conserving Exit Disposition Manifests, Charitable Succession Handoffs and
matched Results, and close-covered Support Reallocation Accounting
Occurrences. Phase 13 owns the immutable Accepted Source Purpose Authority
Snapshot, its closed source-provenance union, Designation retirement or
succession, and adverse contribution corrections; Phase 16 owns authorized
recurring-term change; the worker's external HR/mobilization or governed tenant
lifecycle authority owns the lifecycle fact, while Phase 21 owns the immutable
Worker Lifecycle Authority Reference consumed by the Case; external payment
owners own execution and payment evidence; Phase 22 owns page presentation
only; and Phase 20 alone may own accountant interpretation and QBO/Xero
delivery after a separately approved source certification. The current Phase
20 generation keeps support reallocation unsupported and accounting-dark.

**Support-reallocation conflict and repair.** A worker request is nonbinding and
cannot defeat organization authority, accepted source purpose, exact capacity,
or a source-owned lifecycle. Internal reallocation appends all balanced sides
atomically and both sides enter the same later Support Cycle Close. External
succession remains exactly covered until still-valid authority, Handoff, and
payment evidence match one qualified Result; its source debit and typed
organization-control/disposition counter-entry then append atomically and
enter the same governed close. The counter-entry is not a recipient Field
Account or GL truth. Late or adverse facts append cause-linked recovery against
the original Field Account; they never rewrite a Decision, silently claw back
a destination, infer external success, or let a page or accounting connection
redirect money.

## Dated Phase 21 D24 expense-collaboration ownership amendment (2026-08-02)

Phase 21 owns the immutable **Expense Collaboration Assignment Version** and
its exact Tenant, Legal Entity, claimant Party, helper Party and bound
principal, Expense Program, one stable Expense Claim, exact
item/split/purpose/evidence scope, code-owned collaboration-mode ceiling,
Evidence Access Projection Version reference, half-open interval, and action
provenance. The ceiling is the code-owned `prepare_only` or
`prepare_and_submit_confirmed` mode over one stable Expense Claim and exact
item/split/purpose/evidence scope, never a tenant-authored permission matrix.
The Assignment is collaboration scope and historical
provenance only; it is never a grant, tenant membership, relationship edge,
claimant consent, approval, payment, Field Account, payroll, or accounting
fact. Phase 12 remains the sole request-time policy decision point for every
enumeration, read, upload finalization, mutation, submission, export,
notification, job, support action, and audit retrieval.

Phase 4 owns principal proof and the authority-free, one-time, expiring
invitation lifecycle. Phase 9 owns relationship truth without authority. Phase
10 owns the strictest applicable sensitive-data floor, Phase 29 owns private
evidence bytes and their lifecycle, Phase 6 owns recipient intent and
send-time suppression, and Phase 17 owns governed message content. Private
evidence is exposed only through an exact authorized projection and
application-mediated `private, no-store` delivery, never a public or reusable
object URL. Revocation denies every new authorization after its commit without
claiming to retract bytes already delivered.

D10/D13 retain Claim Version, evidence, policy, review, and approval truth.
Claimant, economic payer, evidence contributor, preparer, submitter, confirmer
or attestor, reviewer, approver, beneficiary/payee, and actual actor principal
remain separate facts. Optional helper submission can cover only the unchanged current Claim
Version and canonical material-assertion digest already covered by exact
claimant confirmation or admitted claimant-authored attestation. Conflict,
revocation, and recovery append immutable evidence; no invitation,
relationship, notification, AI/OCR result, service credential, or stale prior
decision can manufacture authority or consent.

## Dated Phase 21 D25 expense-resolution ownership amendment (2026-08-02)

Phase 21 D25 owns only one exceptional exact Expense Claim Resolution Case
basis, its versioned closed cause/action contract, immutable actual-actor
Resolution Occurrences, proportional complete Downstream Impact Manifest, and
disposable next-action projection. The case coordinates recovery; it is not a
D10 claim or evidence fact, fifth D13 disposition or Reviewer Exception, D11
Field Account Integrity Case, D15/D16 obligation or payment case, D12 statement
correction, Phase 20 Accounting Exception Case or Release, or Phase 34 workflow
state. Healthy claim coverage creates no case, and clean separable siblings
continue.

D10 owns claimant facts, immutable Claim Versions, evidence linkage, and
submission successors. D13 owns route, review, policy, exception, decision,
and Approved Expense Snapshot truth. D15/D16 and external payroll/AP own
handoff, obligation, payment, return, and residual truth. D23 and D1/D11 own
operational Field Account effect and close correction. D12 owns immutable
statement correction and succession. Phase 20 alone owns any independently
qualified Compensating Accounting Release, provider operation, readback, and
drift; QBO/Xero own posted books and final reconciliation. A D25 command may
invoke one typed owner-domain command and observe its immutable outcome but
cannot edit, reopen, roll back, or mark that domain complete.

Phase 12 remains the sole policy decision point before every enumeration and
again at commit. Phase 29 owns private evidence bytes, scan, access audit,
retention, hold, quarantine, and disposition. Phase 6/17 own recipient-safe
communication, whose delivery or reply supplies no claimant fact or completion
proof. Phase 34 or Mission Control may mirror assignee, target, reminder, and
follow-up only; task completion cannot resolve D25 or any manifested source.
Relationship, helper assignment, lifecycle change, silence, timer,
notification, OCR/AI result, service credential, or provider ambiguity never
creates claimant authority, unavailability, succession, or completion.

The D25 projection may say **Needs your update**, **With finance**, **Waiting
on source**, **Correction in progress**, or **Complete** only as derived
coordination copy. Completion requires root-source proof plus an explicit
`corrected`, `unaffected`, `not_applicable`, or safely `quarantined`
disposition for every affected owner family. It never proves approval,
reimbursability, obligation, funding, availability, payment, Field Account
inclusion, statement correction, accounting delivery, provider acceptance,
posting, sync, or reconciliation.

## Dated Phase 21 D26 records-policy and custody-export ownership amendment (2026-08-02)

Phase 21 D26 owns the closed Phase 21 record-family catalog; each immutable
source-purpose-, jurisdiction-, Legal-Entity-, and relationship-where-material-
owned Records Schedule Contract Version; bounded prospective tenant Binding
Version; per-record Retention Resolution; Records Schedule Successor Impact
Manifest; export selection and open-format package schema; and Records Export
Coverage Manifest. Phase 21 therefore owns what its records mean, why and from
which trigger they are kept, which schedule and tenant choice resolved, and
what exact source/version coverage an export includes, references, restricts,
cannot currently supply, or proves lawfully disposed. It does not own generic
byte storage, backup, deletion, legal advice, a tenant-authored records DSL, or
the truth of another source domain.

Phase 29 alone owns private byte identity and custody, copy inventory, malware
and quarantine controls, package staging, authorized byte delivery, hold and
disposition execution, provider-copy outcomes, backup treatment, and restore
suppression. Phases 3, 10, and 12 own the governed exportable projection,
spreadsheet-safe serialization, strictest classification, restricted-person
lane, request-time and commit-time authorization, step-up, and egress audit.
Phase 30 remains inbound migration only. Phase 31 owns any later certified
external-destination adapter and its destination authorization/readback;
browser download and print remain a complete lane. Phase 38 owns data-subject
access, correction, restriction, portability, and erasure requests, which may
not be answered by treating a tenant business-record archive as an unredacted
privacy response.

Download, print, Tenant External Copy Assertion, Verified Destination Custody
Transfer, Asym-held retention, legal hold, termination, and each active,
provider, or backup copy disposition are independent immutable facts. None
changes a source schedule, releases a hold, triggers cross-owner deletion, or
proves legal sufficiency. A tenant controls copies in its custody; Asym remains
responsible for duties and published commitments applicable to copies in its
custody. Export recovery uses a fresh authorized package or append-only
residual package; sealed packages and source records are never mutated to make
coverage appear complete.

## Dated Phase 22 D21 surface-adoption ownership amendment (2026-08-14)

Phase 22 D21 owns only the exact-scope Public Ministry Surface Adoption Case,
immutable Adoption Plan and tenant Adoption Coverage Manifest versions,
complete source/effect disposition coverage, cutover receipt, and the exact
cohort's pre-/post-Phase-22 reader-generation boundary. Phase 2/24 retains Site,
verified-host membership, locale, canonical-path, and environment truth; Phase
5 owns the sole gateway and HTTP/cache execution; D1-D20 and every source domain
retain their named authority. A manifest, shadow, Payload publish state,
deployment, cache, provider result, preview, or completed job never becomes
Page release, reach, safety, route, subject, Designation, Giving, media, Update,
discovery, search/share, measurement, accounting, payment, or convergence
truth.

Private, chunked, resumable preparation references immutable owner facts and a
code-owned coverage-plan generation. One separately authorized staff action
re-proves current owner heads and the immutable host-membership digest, then one
short local CAS advances the exact Tenant × Legal Entity × environment × Site ×
verified-host-membership generation × locale reader head and transactionally
records the D18 cause. Drift appends a plan/manifest successor or aborts before
CAS; after CAS, ordinary D1-D20 releases and D18 residual convergence apply.
Never fuzzy-map, silently exclude, dual-read/write, expose raw evidence, restore
a mock/Payload reader, or use deployment rollback as authority rollback.

## Dated Phase 22 D22 Public Page operations ownership amendment (2026-08-14)

Phase 22 D22 owns only the finite owner-condition adapter contract, disposable
Public Page Operations Projection, cause-to-impact grouping, permission-safe
presentation, coverage/freshness evidence, and code-owned navigation from one
action to its owning workflow. It creates no Page-health, review, release,
reach, safety, Giving, route, media, Update, discovery, search/share,
measurement, cache, task-resolution, notification-delivery, accounting, or
payment truth. Every D1–D21 and predecessor domain retains its named cause,
command, history, correction, supersession, and final outcome authority.

Phase 3 owns the governed projection data plane. Phase 10 filters protected
existence, fields, copy, and aggregates before presentation. Phase 12 owns the
current Principal-, capability-, target-, field-, and epoch-resolved decision
for every row, impact, count, search, export, subscription, deep link, and
action. Phases 6/17 alone own recipient selection, message content, cadence,
suppression, dispatch, provider outcome, and communication history. One
human-actionable root cause may reference at most one same-scope shared Mission
Control collaboration task after structural and atomic/idempotent-link proof;
task completion, dismissal, suppression, reassignment, reminder, or read state
cannot clear the cause.

Only fresh owning-domain evidence removes or supersedes current D22 work.
Missing, stale, partial, contradictory, unavailable, or absent projection data
never becomes zero, healthy, resolved, or not applicable. D22 may state that a
Page remains visible while Giving is unavailable, but cannot choose or
substitute a Designation, move money, prove checkout, or affect accounting.

## Dated Phase 22 D23 Public Page setup/settings ownership amendment (2026-08-14)

Phase 22 D23 owns only one finite code-owned Public Page Setting Descriptor
catalog, the disposable Public Page Setup & Settings Projection, setup guidance,
scope navigation, permission-safe presentation, and routing to one exact
owner-domain action. D2–D20 and Phase 21 D10 retain every configuration version,
current head, state meaning, fallback, capability, effective time, consequence,
history, command, and outcome they already own. D23 creates no settings table,
generic mutation API, profile authority, public-serving state, Page release,
D21 readiness/activation, D22 cause/resolution, AI-provider credential, or
per-Page choice.

The server resolves the complete Tenant × Legal Entity × environment × Site and
only applicable locale, Page Family, and publication-path scope, then applies
current read authorization before composing any row, label, option, count,
history, preview, deep link, timing difference, or cache. One literal Change
action re-proves current change capability and owner truth, invokes only that
owner's typed idempotent CAS command, appends an immutable prospective successor,
and confirms through authoritative readback. Missing, safe-fallback, built-in,
creation-seed, Off, unavailable, partial, unknown, and not-applicable facts never
collapse into one value. Rebuild D23 or append an owner successor to repair
divergence; never copy or reinterpret source truth, use last-write-wins or Save
all, move history backward, infer a tenant choice from absence, or treat
configured, saved, released, public, Giving-ready, operationally healthy, or
paid as the same fact.

## Dated Phase 22 D24 Staff-authored Page Revision ownership amendment (2026-08-14)

Phase 22 D24 does not create a staff content family, override record, parallel
draft, queue, branch, workflow, setting, or release authority. One
**Staff-authored Page Revision** is an ordinary D1 Page Revision whose authored
bytes are CMS-owned and whose product meaning additionally preserves the current exact-scope staff actor and
authority path, predecessor and same-scope content source, changed D3/D20
semantic targets and comparison digest, safe reason when active or submitted
contributor work is deliberately superseded, idempotency identity, and commit
outcome.
Payload owns only the authored content and version bytes; D1/D24 owns the one
working head and attribution/supersession contract; Phase 12 owns current edit
authority; D4/D5 owns candidate/review meaning; D2 owns release; Phase 10 owns
the safety ceiling; and Phases 6/17 own any later communication outcome.

The Phase 22 server command prepares one private inert content version, then
re-proves current actor, complete scope, lifecycle, safety, D3/D20 allowlist,
source digest, and expected head before one short idempotent CAS advances the
working head and records provenance/audit/outbox evidence. Payload Local API
access and lock bypasses remain disabled for actor-context operations, while
Payload autosave, locks, `_status`, restore, native publish, Admin role, service
credentials, table ownership, and `BYPASSRLS` remain non-authoritative. Repair
uses an attributed successor, authoritative readback, inspect-before-retry, and
orphan reconciliation—never in-place candidate mutation, destructive restore,
last-write-wins, automatic merge, head rewind, or fabricated legacy authorship.
Operational provenance uses complete same-scope constraints; the Payload
version identity, scope, and digest are adapter-validated rather than joined by
an invented cross-schema CMS-to-operational foreign key.

## Dated Phase 22 D25 derived-actionability and recovery ownership amendment (2026-08-14)

Phase 22 D25 creates no authoritative actionability, stale, archive, expiry,
retention, health, recovery, resolution, Page, candidate, task, or notification
state. It adds no operational table or column, content body or full diff,
cross-schema foreign key, trigger, polling scan, materialized D25 projection,
or per-autosave audit, event, or outbox row. D1/D24 retains the sole coherent
working-head and attributed-successor contract; D4/D5 retains immutable
candidate, review, decision, and withdrawal truth; D2 retains release and reach;
D22 may present only a disposable permission-filtered result; and every other
owner retains its existing safety, authorization, catalog, media, subject,
lifecycle, retention, erasure, route, and controlled-surface facts.

The **Editorial Actionability Evaluation** is derived afresh from exact current
owner heads for one Principal and scope. It may independently admit or omit each
owner action and one privacy-safe source-owned explanation, but it cannot
authorize, close, age out, or reinterpret work. Each owning command performs its
own current commit-time proof. A submitted candidate remains in D22's **To
review** view until an existing D4/D5 outcome or explicit withdrawal; elapsed
time alone never creates a cause, task, notification, expiry, archive, or
**Needs attention** state.

Payload owns one private mutable **Public Page Recovery Buffer** for the exact
Page and locale beneath the expected D1 working head and current editor lease.
It is non-semantic scratch, not a revision, candidate, evidence occurrence,
per-actor branch, or retention class. Any deliberate revision or candidate may
reference only an immutable non-autosave semantic version and digest. D24's
existing bounded reconciler alone may reclaim reference-proved scratch or inert
prepares after an authoritative reference recheck; uncertainty preserves the
item and opens a private owner-domain exception. Recovery creates a newly
attributed, same-Page, same-locale, same-family, same-subject D1 successor and
never restores, mutates, rewinds, submits, publishes, or copies across scope.
Phase 29 continues to own public-media byte lifecycle only, not editorial text,
and D25 introduces no Phase 40 dependency.

## Dated Phase 22 D26 candidate-attestation ownership amendment (2026-08-14)

Phase 22 D26 owns only the meaning and code-owned wording of the **Public
Content Sharing Attestation** and the minimum immutable evidence proving which
actual actor confirmed which exact candidate. The constant-size fact lives
inside the D4/D5 Public Content Release Candidate; D26 creates no table, Page
Boolean, rights graph, consent record, public field, workflow, or rendering
lookup. D2 references the candidate and attestation from its Page Release
Manifest, while D11 references them from its Ministry Update Audience Release
Manifest and projection. Neither copies or reinterprets the evidence.

D4/D5 remains authoritative for candidate creation and review; Phase 12 for the
current actor's exact submit or publish capability; Phase 10 for direct
objections, `do_not_publish`, restricted-person rules, and the current safety
ceiling; D2 and D11 for release; D9/Phase 29 for media sanitization and bytes;
and D18 for adverse-first public convergence. The attestation grants no later
authority and proves neither rights, consent, safety, review, approval, release,
nor public availability.

A material edit, changed digest, new statement version, translation, clone,
import, scope change, or later candidate requires a new actual-actor
attestation. Corrections are append-only through a new candidate and existing
D9/D2/D11/D18 containment; evidence is never mutated, inherited, or fabricated
for legacy releases. Historical absence remains **not captured**, and no D26
fact may delay a stricter current safety outcome.

## Dated Phase 22 D27 Site-family presentation ownership amendment (2026-08-14)

Phase 22 D27 makes locale subordinate to one Site-scoped Public Ministry Page
identity per exact D17 source-qualified typed subject and owns one current D3 presentation
profile head for each exact Tenant × Legal Entity × environment × Site × Page
Family. D27 owns only the compatible Public Page Family Presentation
Activation and its manifest: complete-cohort preparation, the Site × family
coordination epoch, the exact D2 release-head-set digest, compatibility proof,
and the one short idempotent CAS that advances the family presentation head.
It creates no per-Page or per-locale profile, copied layout, layered override,
translation, editorial write, candidate, review, attestation, or release.

D3 retains profile-version content; D2 retains each Page × locale immutable
content/reach release and its historical baseline pins; D4/D5/D26 retain
candidate, review, and attestation truth; D20 retains semantic catalogs; Phase
24 retains locale availability and configuration; Phase 5 retains public
runtime primitives; and D18 alone composes the exact current release, current
family activation, and current admission. A migration-required profile change
uses the ordinary locale-specific release path. Any stale cohort, concurrent
release, mismatch, or partial artifact leaves the prior complete generation
current; public locale fallback and partial family activation are prohibited.
