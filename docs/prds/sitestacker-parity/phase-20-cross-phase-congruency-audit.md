# Phase 20 Cross-Phase Congruency Audit

> **Audit date:** 2026-07-27
> **Status:** Completed program-congruency audit, repository-document correction
> pass, and implementation-ready `/to-spec` publication package; the full Phase
> 20 OpenSpec change validates strictly as part of the 43/43 repository set, and
> spec issue #1036 is published without implementation children or dispatch
> **Phase 20 baseline:** Ratified decisions D1-D20 in
> [`phase-20-accounting-exports-reconciliation-decision-log.md`](./phase-20-accounting-exports-reconciliation-decision-log.md)
> **Historical input:** The attached Phase 21-40 roadmap draft was reviewed as
> discovery material only. It is older than the repository's current roadmap
> and is not an authority.

## Executive verdict

Phase 20's ratified D1-D20 model is internally coherent and remains the
accounting-integration direction:

- source domains own business facts;
- Phase 20 freezes an immutable, balanced Accounting Release from exact source
  coverage;
- direct QBO/Xero delivery and staff-mediated artifacts are mutually exclusive
  delivery lanes over the same frozen release;
- provider operations, provider readback, Bank Match, and final accounting
  reconciliation remain separate truths;
- corrections are append-only compensating releases;
- QBO/Xero remain the general ledger and own final bank reconciliation,
  translation, revaluation, period close, and accountant-directed
  restatements;
- Phase 20 does not become accounts payable, payroll, expense management,
  foreign-exchange software, or a second general ledger.

The repository-document pass corrected the identified ownership and lifecycle
contradictions in the Phase 1 matrix; Phases 2–7, 9, and 12–16; the Phase 17–21
roadmap contracts; the active guest-giving, recurring-giving, donor
self-service, and Statement Studio OpenSpec changes; the historical Statement
Studio routing documents; accepted ADRs 0004, 0005, 0009, and 0011; and the
Phase 21–40 dependency, authority, communication, privacy, currency, document,
import, workflow, and offline-operation fences. It also exposed one
cross-program schema rule that
must remain explicit everywhere: the stable **Legal Entity** is the financial
partition key, while an immutable **Legal Issuer Profile Version** is only
time-bound issuer evidence pinned by receipts and documents. A Legal Entity
may optionally link to a same-Tenant organization Party for CRM purposes, but
neither that Party nor a Site, Stripe account, QBO company, or Xero
organization defines the Legal Entity.

The initial OpenSpec Guardian verdict was **`NEEDS_OPENSPEC_CHANGE`**. The
cross-capability boundary pass added the proposed
`add-accounting-exports-reconciliation` change and reconciled the merged and
active donation/recurring/statement deltas. The subsequent approved `/to-spec`
pass expanded that bootstrap into the complete observable D1-D20 product
contract, 66 independently verifiable user stories, 40 acceptance suites, and
120 OpenSpec scenarios. Strict validation now passes for all 43 specs/changes.
This remains planning authority, not runtime implementation authorization.

At the initial live-state inspection, no Phase 20 or Phase 21 epic existed.
Phase 20 specification issue
[#1036](https://github.com/Asymmetric-al/core/issues/1036) is now published,
without implementation children or dispatch; Phase 21 remains future grooming.
PR [#872](https://github.com/Asymmetric-al/core/pull/872) now carries the Phase
17–20 planning package, including the current Phase 19 issue posture. The Phase
13, 15, and 16 issue families still predate these corrections, so their current
bodies do not automatically inherit this documentation amendment.

## 1. Audit authority and method

### 1.1 Authority order used

The audit used the repository's required source order:

1. merged OpenSpec contracts;
2. repository instruction and ownership documents;
3. ratified phase decision logs and accepted ADRs;
4. current phase PRDs and the current parity roadmap;
5. current GitHub issue state;
6. the attached old draft as non-authoritative discovery input.

The current working tree contains newer, not-yet-merged Phase 20 grooming
records that are not present in the indexed repository snapshot. Local direct
reads therefore supplied the Phase 20 evidence; repository-scoped Nia search
was corroborative only and was not allowed to overwrite newer local evidence.

### 1.2 Primary repository evidence

- [`CONTEXT.md`](../../../CONTEXT.md), especially the Phase 20 ubiquitous
  language and ownership definitions.
- [`roadmap.md`](./roadmap.md), especially Phases 20-40.
- [`phase-map.md`](./phase-map.md).
- [`phase-01-source-of-truth-ownership-matrix.md`](./phase-01-source-of-truth-ownership-matrix.md).
- [`phase-02-site-locale-currency-foundation.md`](./phase-02-site-locale-currency-foundation.md).
- [`phase-03-minimum-permission-role-scoped-projection-foundation.md`](./phase-03-minimum-permission-role-scoped-projection-foundation.md).
- [`phase-04-identity-account-claiming-foundation.md`](./phase-04-identity-account-claiming-foundation.md).
- [`phase-05-public-website-runtime-contract.md`](./phase-05-public-website-runtime-contract.md).
- [`phase-06-shared-communication-event-model.md`](./phase-06-shared-communication-event-model.md).
- [`phase-07-receipt-statement-compliance-and-donor-credit.md`](./phase-07-receipt-statement-compliance-and-donor-credit.md).
- [`phase-09-full-crm-depth-relationship-graph.md`](./phase-09-full-crm-depth-relationship-graph.md).
- [`phase-12-full-role-permission-configuration.md`](./phase-12-full-role-permission-configuration.md).
- [`phase-13-campaign-designation-contribution-ledger-giving-cart.md`](./phase-13-campaign-designation-contribution-ledger-giving-cart.md).
- [`phase-14-donor-credit-operations.md`](./phase-14-donor-credit-operations.md).
- [`phase-15-offline-gift-batch-entry.md`](./phase-15-offline-gift-batch-entry.md).
- [`phase-16-pledges-recurring-commitments.md`](./phase-16-pledges-recurring-commitments.md).
- [`phase-20-accounting-exports-reconciliation.md`](./phase-20-accounting-exports-reconciliation.md).
- [`phase-20-accounting-exports-reconciliation-decision-log.md`](./phase-20-accounting-exports-reconciliation-decision-log.md).
- ADRs
  [`0043`](../../adr/0043-immutable-accounting-releases-and-exclusive-delivery-lanes.md)
  through
  [`0061`](../../adr/0061-local-currency-first-proof-gated-multicurrency.md).
- The current `openspec/specs/` and `openspec/changes/` trees, including the
  proposed
  [`add-accounting-exports-reconciliation`](../../../openspec/changes/add-accounting-exports-reconciliation/proposal.md)
  D1-D20 product contract and the active guest-giving, recurring-giving, donor
  self-service, Statement Operations, and Statement Studio changes whose
  ownership seams were reconciled.

The D1-D20 decision log and its evidence appendices already capture the
provider-specific official documentation used to ratify Stripe, QBO, and Xero
behavior. This audit does not introduce a new provider behavior or overwrite
those citations. Provider facts must still be re-certified at implementation
time because API capabilities, importer limits, regional availability, and
accounting-product plans can change.

### 1.3 GitHub evidence

The audit inspected live PR and issue state on 2026-07-27. It made no GitHub
mutation.

- [PR #872](https://github.com/Asymmetric-al/core/pull/872) is open against
  `develop`, mergeable, and review-required. It is the Phase 17–20 planning
  review vehicle; its title and body are updated as part of this publication.
- Phase 13 has epic [#690](https://github.com/Asymmetric-al/core/issues/690)
  and open children #691-#713. The family is labelled blocked but lacks native
  epic/sub-issue and intra-family blocking relationships; a few outbound
  blockers do not provide a complete execution graph. Relevant stale seams include
  [#691](https://github.com/Asymmetric-al/core/issues/691),
  [#697](https://github.com/Asymmetric-al/core/issues/697),
  [#705](https://github.com/Asymmetric-al/core/issues/705), and
  [#711](https://github.com/Asymmetric-al/core/issues/711).
  Children
  [#706](https://github.com/Asymmetric-al/core/issues/706)-[#710](https://github.com/Asymmetric-al/core/issues/710)
  are also still open and blocked even though the Phase 16 PRD materially
  supersedes or re-scopes their recurring behavior; they must not be
  dispatched unchanged.
- Phase 15 has epic [#758](https://github.com/Asymmetric-al/core/issues/758)
  and open children #759-#786, likewise blocked without a native
  epic/sub-issue or intra-family blocking graph; the directly affected deposit
  issues are
  [#780](https://github.com/Asymmetric-al/core/issues/780) and
  [#781](https://github.com/Asymmetric-al/core/issues/781).
- Phase 16 has epic [#793](https://github.com/Asymmetric-al/core/issues/793)
  and open children #794-#837. Its issue family predates the explicit Legal
  Entity propagation rule and must not implement a Tenant-default or inferred
  processor account.
- Phase 7 issues
  [#579](https://github.com/Asymmetric-al/core/issues/579)-[#584](https://github.com/Asymmetric-al/core/issues/584)
  remain open and `status:blocked`. Their statement-run, document-delivery,
  live-statement, and formatting scopes predate the Phase 17-19 owner split;
  they must be retired or retargeted rather than dispatched unchanged.
- Phase 17 has epic #873 and native sub-issues #874-#905; Phase 18 has epic #907
  and native sub-issues #908-#961; Phase 19 has epic #977 and native sub-issues
  #978-#1031. This proves PR #872's Phase 19 dispatch paragraph is stale even
  though repository planning documents can be corrected independently.
- Phase 20 has spec issue
  [#1036](https://github.com/Asymmetric-al/core/issues/1036), with no
  implementation children or dispatch. There is no Phase 21 epic or child
  issue.

The closed Statement Studio bookkeeping-packet issues
[#342](https://github.com/Asymmetric-al/core/issues/342) and
[#343](https://github.com/Asymmetric-al/core/issues/343) are historical only.
They must not be reopened or treated as the Phase 20 implementation authority.

### 1.4 Severity and disposition

| Level   | Meaning                                                                                             | Required disposition                                  |
| ------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Blocker | Competing authority, mutable-after-release risk, double posting, or materially false finance result | Correct before affected implementation work begins    |
| High    | Likely ownership drift, duplicate integration, or misleading operational result                     | Correct in the next documentation/spec pass           |
| Medium  | Ambiguity that will create UX, privacy, or maintainability debt                                     | Resolve in the owning phase's next grooming/spec pass |
| Low     | Terminology or index drift with limited runtime risk                                                | Correct while touching the owning document            |

### 1.5 Correction execution status

This table distinguishes corrections actually present in the repository
working tree from follow-up that this audit did not perform.

| Finding or gate                                           | Status on 2026-07-27                                             | Exact disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C-01 ownership matrix                                     | **Corrected locally**                                            | Phase 1 now separates contribution facts, processor settlement/payout evidence, bank evidence and Bank Match, accounting configuration/releases/delivery, and Phase 21 field-account/expense authorities, with authority-specific append-only repair.                                                                                                                                                                                                                                                                                          |
| Legal Entity propagation discovered during C-01/C-03/C-04 | **Corrected locally across affected source and consumer phases** | The stable Legal Entity is distinct from immutable Legal Issuer Profile Versions and optional same-Tenant Party presentation. Financial roots and authorization checks carry explicit entity scope; Settlement Account Binding replaces a Tenant-wide processor-account shortcut.                                                                                                                                                                                                                                                              |
| Receipt/document/communication authority propagation      | **Corrected locally across Phases 3–7, 9, and 13–19**            | Phase 13 owns contribution truth; Phase 7 owns immutable receipt/statement facts; Phase 14 owns acknowledgment/notification purpose, readiness, and coverage; Phase 17 owns governed content; Phase 18 owns the one canonical generated artifact; Phase 6 owns dispatch/history; and Phase 19 owns statement-run population/coordination. Legacy snapshots, live rendering, receipt-status stubs, and phase-local delivery profiles are not runtime authorities.                                                                               |
| Residual accepted-ADR and PRD drift                       | **Corrected locally**                                            | ADRs 0004, 0005, 0009, and 0011 preserve their historical rationale behind dated authority amendments while using the current acknowledgment, renderer, offline-posting, and phone-payment owner contracts. Phase 9/11 communication wording and Phase 7/13/15 repository-status headers now match current owners and live GitHub state.                                                                                                                                                                                                       |
| C-02 reconciliation authority                             | **Corrected locally**                                            | The roadmap and glossary separate Stripe settlement evidence, source-labelled bank evidence, Asym Bank Match/provider-effect verdicts, and QBO/Xero final books and bank reconciliation.                                                                                                                                                                                                                                                                                                                                                       |
| C-03 Phase 13 accounting-export axis                      | **Corrected locally**                                            | The writable `ACCOUNTING-EXPORT` lifecycle was removed in favor of a read-only one-to-many Phase 20 coverage projection over independently authoritative releases and provider operations.                                                                                                                                                                                                                                                                                                                                                     |
| C-04 Phase 15 source/deposit lifecycle                    | **Corrected locally**                                            | Phase 15 and ADR-0007 now own exact batch, source-occurrence, and deposit-group evidence only. The lifecycle is `draft → validated → posted`, with `awaiting_approval` only when the effective Phase 12-backed tenant/risk policy requires it; there is no parallel approve, commit, or finalize state. Phase 15 freezes exact source coverage at Accounting Release inclusion, preserves later changes as new revisions/corrections, creates no competing receipt/acknowledgment delivery queue, and leaves final reconciliation to QBO/Xero. |
| C-05/C-06 Phase 21 ownership, fees, and currency          | **Corrected locally**                                            | The roadmap now makes Phase 21 the per-currency operational Field Account and expense authority; gross support, assessments, exact D19 processor-cost effects, approved draws, transfers, and expense effects remain separate occurrences.                                                                                                                                                                                                                                                                                                     |
| C-07 Phase 2 account terminology                          | **Corrected locally**                                            | Site presentation no longer defines financial ownership. Exact Legal Entity and Settlement Account Binding own processor context; the single-entity case remains quietly preselected.                                                                                                                                                                                                                                                                                                                                                          |
| C-08 through C-17 future-phase fences                     | **Corrected locally in the roadmap**                             | Phases 22, 24, 28-31, 33-34, and 36-40 now consume typed projections/commands without rebuilding field-account, fee, expense, connector, reconciliation, privacy, offline, or AI authority.                                                                                                                                                                                                                                                                                                                                                    |
| Remaining Phase 21–40 owner/dependency fences             | **Corrected locally in the roadmap and phase map**               | Phases 21–40 now carry matching hard dependencies and explicit source-owner fences for public/CMS routing, exact-current documents, inbound/outbound communication, Legal Entity and currency scope, target-domain imports, safe undo, capability resolution, device privacy, and typed AI-assisted commands.                                                                                                                                                                                                                                  |
| C-18 status/index drift                                   | **Corrected locally**                                            | Roadmap, phase map, parity matrix, README, root context, and this audit describe Phase 20 as D1-D20 decision-complete, implementation-ready planning, and not built.                                                                                                                                                                                                                                                                                                                                                                           |
| OpenSpec Guardian                                         | **Full specification completed and validating**                  | The initial `NEEDS_OPENSPEC_CHANGE` verdict produced the proposed boundary change; the approved `/to-spec` pass expanded it into the full D1-D20 observable capability and reconciled active guest-giving, recurring-giving, donor self-service, Statement Operations, and Statement Studio deltas. Strict validation passes 43/43.                                                                                                                                                                                                            |
| GitHub predecessor issue bodies                           | **Not changed**                                                  | Phase 7 #579-#584, Phase 13 #690/#691-#713, Phase 15 #758/#759-#786, and Phase 16 #793/#794-#837 remain live historical dispatch surfaces. They require retirement, retargeting, dated congruency notes, or regenerated ticket authority before affected implementation; this audit performed read-only inspection only.                                                                                                                                                                                                                       |
| PR #872                                                   | **Updated by the authorized publication task**                   | The PR carries the congruent Phase 17–20 package; its title and body identify all four phases and the current issue posture.                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Phase 20/21 issues                                        | **Phase 20 spec published; no implementation dispatch**          | Phase 20 spec issue #1036 is published without child tickets; approved `/to-tickets` remains the only path to implementation issues. Phase 21 remains a future grooming/spec phase.                                                                                                                                                                                                                                                                                                                                                            |

### 1.6 OpenSpec Guardian verdict

**Initial verdict: `NEEDS_OPENSPEC_CHANGE`; full specification correction
completed.**

The corrections clarify explicit Legal-Entity partitioning, immutable
Accounting Releases, exclusive QBO/Xero delivery ownership, bounded Bank Match,
Phase 21 expense/Field Account source authority, and downstream
command/projection fences. The proposed
`add-accounting-exports-reconciliation` change now defines the complete D1-D20
product behavior and platform boundaries. Merged `donation-lifecycle` and the
active `sitestacker-parity`, recurring, guest-giving, donor self-service,
Statement Operations, and Statement Studio changes were corrected so they
cannot reintroduce the tenant-only, single-allocation, live-statement, or
direct legacy-receipt contracts.
Therefore:

1. these PRD, ADR, roadmap, context, ownership-matrix, and proposed OpenSpec
   updates are the implementation-ready planning record;
2. they authorize no runtime implementation;
3. strict OpenSpec validation currently passes 43/43;
4. the Phase 20 `/to-spec` output contains complete D1-D20 behavior and testing
   seams and has passed the repeated congruency check;
5. PR #872 semantically integrates these Legal Entity and accounting boundaries
   with its newer Phase 17–19 files rather than accepting textual conflicts.

## 2. Ratified Phase 20 authority baseline

The following table is the compact authority baseline against which every
other phase was checked. It summarizes; it does not replace the full decision
log or ADRs.

| Decision | Ratified authority                                                                                                           | Cross-phase constraint                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| D1       | One accounting doorway coordinating settlement evidence, accounting delivery, and expense handoff as bounded contexts        | A neighboring phase may supply facts but may not build a second accounting doorway               |
| D2       | Immutable Accounting Release and Evidence Artifact; direct and artifact delivery lanes; operation-granular provider recovery | `exported`, `synced`, `read back`, and `reconciled` may not collapse into one state              |
| D3       | Explicit Legal Entity boundary with a one-entity default and proof-gated multi-entity activation                             | No release, destination, bank match, or package crosses a Legal Entity                           |
| D4       | Typed Accounting Posting Intent plus canonical balanced Accounting Effect                                                    | Source terminology and provider carrier shape stay separate                                      |
| D5       | Goal-based, provider-native Posting Profiles                                                                                 | Tenant choice is prospective, bounded by accounting and provider capability                      |
| D6       | Source-exact designation resolution through semantic reporting targets                                                       | Grouped mappings require proved coverage and may not erase source-level lineage                  |
| D7       | Capability-certified QBO Carrier Plans                                                                                       | QBO classes, locations, items, customers, and accounts are carriers, not Asym domain truth       |
| D8       | Capability-certified Xero Carrier Plans                                                                                      | Xero tracking categories, contacts, accounts, and references are carriers, not Asym domain truth |
| D9       | Mode-honest Processor Settlement Evidence and independent Processor Payout Transfer truth                                    | Unsupported payout composition remains bounded evidence; it is never inferred                    |
| D10      | One source-labelled, allocation-safe Bank Match with tenant-selected evidence lanes                                          | Phase 20 assists finance; QBO/Xero owns final bank reconciliation                                |
| D11      | Append-only compensating releases in tenant-policy-permitted and provider-accepted periods                                   | No original release is reopened or edited                                                        |
| D12      | Tenant-controlled release cadence through one Ready for Accounting workspace                                                 | Cadence never bypasses source, period, mapping, destination, or provider gates                   |
| D13      | Cause-owned Accounting Exception Cases with Mission Control follow-up                                                        | Task completion is not accounting resolution proof                                               |
| D14      | Separate encrypted provider grant and exact tenant/Legal Entity destination connection                                       | No generic connector may silently swap the destination or widen authorization                    |
| D15      | Workload-shaped, capability-certified delivery capacity                                                                      | Capacity pressure never changes accounting grain, lane, destination, or intent                   |
| D16      | Immutable capability-certified Accounting Delivery Packages                                                                  | Download, import, provider finalization, verification, and reconciliation stay distinct          |
| D17      | Source-family Posting Ownership Cutover with exact half-open intervals and a Coverage Manifest                               | No dual write, fuzzy historical adoption, or unproved backlog replay                             |
| D18      | Phase 21-owned Approved Expense Snapshot and PII-minimized accounting-ready handoff                                          | Phase 20 is not the expense system, AP ledger, payroll system, or receipt archive                |
| D19      | Organization-borne processor cost by default; optional fee-cover-first uncovered-cost attribution                            | Gross gift, fee-cover, provider cost, settlement, and field-account effect stay separate         |
| D20      | Local-currency-first settlement; retained currencies only through a proof-gated lane                                         | Phase 24 owns donor presentment; QBO/Xero owns FX accounting and revaluation                     |

## 3. Attached draft disposition

The attached text is an **old Phase 21-40 planning draft**. It is useful for
identifying intended outcomes and unresolved questions, but it predates
ratified Phase 20 D18-D20 and the current roadmap amendments. It must not be
copied over the current roadmap.

| Draft content                                                                                    | Disposition                                                      | Reason                                                                                                                                                |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 21 as a second linked operational subledger with immutable entries and derived balances    | Preserve                                                         | It cleanly separates field-account operations from donation and GL truth                                                                              |
| Gifts legally belong to the organization and are only preferenced toward workers                 | Preserve                                                         | This is the legal and product boundary used by Phases 7, 13, 18, 21, and 22                                                                           |
| Effective-dated admin assessments, reversals, transfers, monthly draw, and support projections   | Preserve for Phase 21 grooming                                   | These are Phase 21 operations, not Phase 20 accounting inventions                                                                                     |
| "Asym subledger of record vs mirror of external accounting" as an open question                  | Close in favor of Phase 21 source ownership                      | A mirror would let QBO/Xero overwrite operational field-account truth and contradict D18                                                              |
| Generic "expense submission"                                                                     | Replace with the current D18 boundary                            | Phase 21 owns report, evidence, approval, reimbursement, payment coverage, and corrections; Phase 20 receives only the approved PII-minimized handoff |
| Processor fees implicitly netted into worker support                                             | Replace with D19's separate-occurrence rule                      | A Phase 21 balance effect is optional tenant policy and must consume the exact D19 occurrence once                                                    |
| Multi-currency deferred with only schema seams                                                   | Refine with D20                                                  | Per-currency field-account truth is required; retained settlement is available only through a certified lane                                          |
| Phase 24 claim that every settlement currency requires its own bank account and costs about 1.5% | Reject as stale and overbroad                                    | Current provider capability is account-, region-, currency-, destination-, and time-dependent; D20 uses live proof instead of hardcoded claims        |
| TntConnect/DonorHub feed as a Phase 31 possibility                                               | Preserve as a future read-only projection question               | It must not become a second source, posting owner, or QBO/Xero connector                                                                              |
| Public progress, portal, file, import, reporting, workflow, and offline outcomes                 | Preserve only with the authority constraints in Sections 5 and 7 | The desired outcomes remain valid, but several old descriptions were too broad                                                                        |

## 4. Blocking and high-priority contradictions

The findings below preserve the adversarial diagnosis of the pre-correction
documents. Section 1.5 is authoritative for which permanent corrections are
already present and which external/specification gates remain.

### C-01 — Phase 1 ownership matrix omits Phase 20 authorities

**Concern:** Yes — **Blocker**

**What can go wrong.** Before this correction, the canonical ownership matrix
compressed donations, refunds, and payouts into one "Money" row owned by the
Asym ledger with repair through `contribution_adjustments`. It did not name Accounting
Releases, provider operations, settlement evidence, Bank Matches, accounting
destinations, delivery packages, posting cutovers, or compensating releases.
A developer following the declared top authority could reasonably mutate the
wrong aggregate, route all corrections through the contribution ledger, or
let Stripe/QBO/Xero evidence overwrite an Asym source.

**Why it matters.** The matrix explicitly wins when another document
disagrees. Leaving it stale makes every lower-level Phase 20 decision
structurally subordinate to the wrong contract.

**Permanent correction.**

1. Keep contribution gift and refund truth in the Phase 13 ledger.
2. Replace the generic repair sentence with source-owned append-only postings
   for gift truth and Phase 20 compensating Accounting Releases for accounting
   projection corrections.
3. Add explicit rows for:
   - Legal Entity and settlement-account binding;
   - Accounting Posting Intent, Canonical Accounting Effect, and Source
     Coverage Manifest;
   - Posting Profiles, reporting-target mappings, and provider Carrier Plans;
   - Accounting Release, Evidence Artifact, Delivery Plan, Delivery Operation,
     Provider Record, and Reconciliation Verdict;
   - Accounting Destination Connection and Provider Authorization Grant;
   - Processor Payout Transfer and Processor Settlement Evidence;
   - Expected Bank Arrival, Bank Evidence, and Bank Match;
   - Accounting Exception Case and Compensating Accounting Release;
   - Accounting Delivery Package and import-conformance evidence;
   - Posting Ownership Cutover and Cutover Coverage Manifest;
   - Phase 21 Approved Expense Snapshot and Phase 20 accounting-ready
     projection.
4. State that QBO/Xero executes posting and owns the final books and final bank
   reconciliation but does not own Asym's release, mapping, cutover, or source
   evidence.

### C-01A — Legal Entity identity and partitioning were not propagated

**Concern:** Yes — **Blocker**

**What can go wrong.** Earlier Phase 2, 7, 13, 15, and 16 wording could make a
Tenant, Site, mutable receipt issuer, Stripe account, QBO company, Xero
organization, or current default stand in for the legal organization that
receives money and keeps books. A recurring cohort, deposit, receipt, or
Accounting Release could then cross legal issuers or silently change ownership
when a default or provider connection changes.

**Why it matters.** This is a tenant-safety and financial-integrity boundary,
not a Phase 20 UI preference. Historical roots must retain exact ownership
before multi-entity activation is even possible.

**Permanent correction.**

1. Introduce one stable Legal Entity identity beneath the Tenant and seed one
   quiet default for the ordinary case.
2. Store exact `legal_entity_id` on every independently authoritative financial
   root; never infer historical ownership from a mutable default.
3. Treat the Phase 7 Legal Issuer Profile Version as immutable, effective-dated
   evidence pinned to the Legal Entity—not as a competing identity.
4. Permit an optional same-Tenant organization Party link for CRM
   relationships and presentation only. Party merge, archival, or renaming
   cannot mutate financial identity.
5. Replace a Tenant-wide processor account with an exact, effective-dated
   Settlement Account Binding; keep QBO/Xero Accounting Destinations separate.
6. Reject cross-entity coverage, batches, cohorts, transfers, releases, bank
   matches, and provider failover. Multi-entity activation remains proof-gated.

### C-02 — Phase 20 uses "reconciliation" at two different authority levels

**Concern:** Yes — **High**

**What can go wrong.** D1 and early roadmap wording can be read as Phase 20
owning payout/offline-deposit reconciliation. D10 later and more precisely
limits Phase 20 to a bounded Bank Match while QBO/Xero owns final bank
reconciliation. A team could accidentally build a second accounting-system
reconciliation screen with close/reopen semantics and ledger authority.

**Permanent correction.** Add a dated clarification to the opening Phase 20
description and D1 synthesis:

- Phase 20 owns source-labelled settlement evidence, Expected Bank Arrivals,
  bounded Bank Matches, provider-effect readback, and exception evidence.
- QBO/Xero owns the final bank-register match, period close, and reconciled
  books.
- A Phase 20 Reconciliation Verdict means "the exact external provider effect
  agrees with the frozen delivery plan," not "the tenant's bank account is
  finally reconciled."

### C-03 — Phase 13's mutable `ACCOUNTING-EXPORT` axis conflicts with D2

**Concern:** Yes — **Blocker**

**What can go wrong.** Phase 13 specifies
`not_exported / queued / exported / failed / excluded`, describes re-export,
and reserves it as one lifecycle axis. D2 deliberately establishes separately
authoritative release, delivery, provider record, readback, and reconciliation
records. A single state cannot honestly describe:

- released but not admitted;
- admitted but provider outcome unknown;
- partly delivered;
- provider-created but not read back;
- read back with drift;
- downloaded but not imported;
- imported but not verified;
- excluded by policy;
- superseded by a compensating release.

**Permanent correction.**

- Phase 13 must expose an immutable, source-owned accounting eligibility and
  coverage seam only.
- Any contribution-level "accounting status" must be a read-only projection
  derived from Phase 20 records, with source-labelled detail and no write
  authority.
- Remove or supersede the mutable five-state machine and "re-export" wording.
- Idempotency belongs to release identity, source coverage, delivery
  operations, and provider readback, not a mutable export flag.
- Update issue #697 before implementation.

### C-04 — Phase 15 freezes deposits too late and overloads `cleared`

**Concern:** Yes — **Blocker**

**What can go wrong.** Phase 15 allows deposit membership changes until
"Phase 20 export" and then moves the group into an `exported` regime. Under
D2/D4, source coverage becomes immutable when it is atomically included in an
Accounting Release, which can occur before a file is downloaded or a provider
operation finishes. Continuing to edit membership after release would make
the frozen Accounting Effect false. Separately, a Phase 20-driven `cleared`
state can be mistaken for final QBO/Xero reconciliation.

**Permanent correction.**

- Freeze deposit membership at atomic inclusion in immutable Phase 20 Source
  Coverage, not at file download, API completion, or provider reconciliation.
- Rename the Phase 15 regime to `accounting_frozen`, `release_covered`, or
  another term that states the actual boundary. If the stored enum remains
  `exported` for implementation reasons, its contract must explicitly mean
  "covered by an immutable Accounting Release," never "downloaded" or
  "reconciled."
- Derive any operational `cleared` signal only from an exact D10 Bank Match and
  label it "bank evidence matched" in staff UX.
- Keep final accounting reconciliation and period close in QBO/Xero.
- Update ADR-0007, the Phase 15 PRD, #780, and #781 before affected work is
  assigned.

### C-05 — Phase 21 has competing source-of-truth possibilities

**Concern:** Yes — **High**

**What can go wrong.** The old draft called field accounts a first-class
immutable operational subledger and makes Phase 21 the D18 expense source, but
its open questions also asked whether Asym is the subledger of record or a
mirror of external accounting. A mirror makes provider edits capable of
rewriting missionary balances, breaks append-only operational lineage, and
creates circular authority with Phase 20.

**Permanent correction.**

- Ratify Phase 21 as the source of operational field-account entries,
  balances, assessment occurrences, draws, transfers, expense workflows,
  reimbursement obligations, payment coverage, and missionary statements.
- QBO/Xero remains the GL. Phase 20 projects Phase 21-approved occurrences into
  accounting without feeding provider balances back as field-account truth.
- Remove "mirror of external accounting" as an open option.
- Keep settlement-versus-posting timing and gross-versus-net display as Phase
  21 grooming decisions, but never collapse gross gift, assessment, processor
  cost, reimbursement, or settlement into one amount.
- Exclude payroll, contractor compensation, tax, and ordinary monthly draw from
  the D18 expense-report handoff. They require a separately typed future source
  and handoff.

### C-06 — Phase 21 currency and processor-cost semantics need explicit joins

**Concern:** Yes — **High**

**What can go wrong.** A local-currency Stripe balance, donor presentment
amount, D19 cost allocation, or accounting-system translated amount could be
used as the missionary's balance without a source-owned Phase 21 occurrence.
That would cause silent balance drift and cross-currency addition.

**Permanent correction.**

- A Phase 21 account, entry, balance, statement, and runway calculation has one
  currency.
- Never add unlike currencies or convert them merely to force a tie-out.
- Local settlement is the default accounting lane. A retained currency may
  participate only when D20 has certified the exact Stripe-bank-destination
  lane.
- D19 processor cost changes a field balance only if the tenant prospectively
  enables a Phase 21 policy and Phase 21 consumes the exact D19 occurrence once
  as its own separately labelled entry.
- Refunds and assessment reversals use source-linked inverse occurrences; they
  do not recompute using today's policy.

### C-07 — Phase 2 contains stale standalone-account and capability wording

**Concern:** Yes — **High**

**What can go wrong.** Before this correction, Phase 2 contained language suggesting one
"standalone" Stripe account supports a fixed presentment-currency count, while
the current architecture uses connected accounts and D20 makes capabilities
live and account-scoped. A future implementation could validate the platform
account instead of the connected account or hardcode a count that changes.

**Permanent correction.** Replace standalone-account wording with exact
connected-account context and live capability inspection. Do not encode a
fixed currency count, universal bank-account requirement, or fixed conversion
cost as a product invariant.

### C-08 — Phase 22 and Phase 28 can conflate support with accounting

**Concern:** Yes — **Medium for Phase 22; High for Phase 28**

**What can go wrong.** Public progress and missionary dashboards can show a
provider balance, Accounting Release amount, or converted total as "support."
That would expose a finance projection as fundraising or field-account truth.

**Permanent correction.**

- Phase 22 public progress uses Phase 13 posted contribution facts and Phase 16
  commitment/goal contracts only, through the Phase 10-safe projection.
- Phase 28 distinguishes support received, committed support, field-account
  available balance, runway, and accounting status.
- Field-account balances come from Phase 21; accounting delivery and FX
  evidence come from Phase 20 and are not substitutes.
- Multi-currency commitment and trend screens remain currency-separated unless
  a separately labelled reporting conversion is introduced by Phase 33.

### C-09 — Phase 29 needs a bounded relationship to finance artifacts

**Concern:** Yes — **Medium**

**What can go wrong.** A general file service could mutate, replace, retitle,
or apply an unrelated retention policy to Accounting Evidence Artifacts,
Delivery Packages, or expense receipts. It could also copy raw expense
evidence into Phase 20.

**Permanent correction.**

- Phase 29 may own storage bytes, generic immutable-object metadata, signed
  access, classification, retention execution, and download audit.
- Phase 20 owns digest, byte identity, release/package lineage, provider
  conformance, and accounting purpose.
- Phase 21 owns raw expense receipts and report attachments. D18 passes no raw
  receipt image unless a future typed contract explicitly requires it.
- File replacement creates a new version; it never mutates a frozen finance
  artifact.

### C-10 — Phase 30 import and undo can violate D17 and immutable releases

**Concern:** Yes — **Blocker**

**What can go wrong.** Phase 30 promises all-record imports, re-import updates,
and time-boxed undo. Without D17, imported historical records can be treated as
Asym-owned accounting work and posted a second time. Undo can also delete or
rewrite a fact already covered by an Accounting Release.

**Permanent correction.**

- Every accounting-relevant import carries source family, external identity,
  occurrence time, provenance, and posting-owner treatment.
- A D17 Posting Ownership Cutover and half-open ownership interval determine
  whether Asym may post it.
- Historical import never implies Asym posting ownership or Accounting Release
  readiness.
- Gap-only backfill remains off by default and requires proof that the exact
  closed population was not previously posted.
- Undo is blocked for any fact covered by an immutable Accounting Release.
  Corrections append through the source domain and D11.
- Import reconciliation totals prove migration fidelity only. They do not
  prove provider posting, Bank Match, or final reconciliation.

### C-11 — Phase 31 cannot become a second QBO/Xero connector authority

**Concern:** Yes — **High**

**What can go wrong.** Phase 31 lists accounting handoffs as an early connector
consumer and proposes a generic connector registry and managed OAuth. D14
already gives Phase 20 exact provider-native authorization, destination
identity, reconnect, replacement, quarantine, and disconnect semantics.
Generalizing QBO/Xero into a second registry could create two tokens, two
destination identities, or two write paths.

**Permanent correction.**

- Phase 20 exclusively owns QBO/Xero grants, destination connections,
  capability certificates, delivery plans, delivery operations, and provider
  readback.
- Phase 31 may expose governed read-only Phase 20 projections/events and may
  later provide shared infrastructure only through an explicit prospective
  migration preserving D14 identity and evidence.
- No Phase 31 connector may post Phase 20 Accounting Releases or dual-write
  them.
- A TntConnect/DonorHub-compatible feed is a governed read-only projection. It
  does not become field-account, contribution, accounting, or posting-owner
  truth.

### C-12 — Phase 33's universal numeric-equality promise is false

**Concern:** Yes — **Blocker**

**What can go wrong.** The pre-correction roadmap said reports must reconcile with
Phase 19/20 finance surfaces and that disagreement with a statement is a
defect. A donor statement and an Accounting Release can legitimately differ
because of legal donor, soft credits, eligibility, cutoff, settlement timing,
fees, processor costs, currency, grain, and accounting period.

**Permanent correction.**

- Every finance metric declares authority, subject, grain, currency, cutoff,
  recognition basis, and lifecycle status.
- Reports reconcile only under the same declared metric contract.
- Cross-purpose surfaces use explicit reconciliation bridges and control
  totals rather than implied equality.
- Donor-statement truth remains Phase 19; field-account truth remains Phase 21;
  Accounting Release truth remains Phase 20; provider books remain QBO/Xero.
- Reporting conversion, if added, is visibly a reporting projection and never
  overwrites source or accounting currency truth.

### C-13 — Phase 34 workflows cannot write generic accounting actions

**Concern:** Yes — **High**

**What can go wrong.** A generic workflow action could approve, release,
retry, reconnect, remap, or resolve accounting work without the D4-D17
contracts. Retrying an ambiguous provider operation can double post.

**Permanent correction.**

- Workflow automation may create follow-up tasks, reminders, and notifications.
- Any accounting mutation calls a typed Phase 20 command and is revalidated
  against source coverage, capability, period, destination, capacity,
  idempotency, and current evidence at execution time.
- An Accounting Exception Case is the cause-owned authority. The Mission
  Control task is only work coordination.
- Generic workflow completion never clears an accounting exception or
  authorizes a provider retry.

### C-14 — Phase 36 risks creating a second fee model

**Concern:** Yes — **High**

**What can go wrong.** "Donor covers fees" in peer-to-peer fundraising can
create a second estimator, allocation rule, or net-to-fund rule independent of
Phase 13 and D19. Totals would disagree by surface and designations could bear
unsupported costs.

**Permanent correction.**

- Phase 36 reuses the Phase 13 fee-cover source contract and display policy.
- D19 alone governs exact provider-cost attribution to designations.
- P2P may change presentation and campaign context, not fee truth,
  provider-cost truth, accounting mapping, or field-account policy.
- No P2P-specific fee calculator or accounting occurrence is introduced.

### C-15 — Phase 37 trip expenses can bypass Phase 21

**Concern:** Yes — **High**

**What can go wrong.** Trip budgeting or expense tracking can become a second
expense approval system and QBO/Xero handoff. Participant payments can also be
misclassified as deductible gifts.

**Permanent correction.**

- Phase 37 owns trip, participant, budget, and participant-payment context.
- Phase 13 owns contribution truth and preserves the payment-versus-donation
  distinction.
- Phase 21 owns expense report, evidence, approval, reimbursement, payment
  coverage, and correction.
- Phase 20 consumes only the D18 handoff and D6 mapping. It does not author trip
  expense policy or operate a second AP flow.

### C-16 — Phase 38 restricted care facts must not enter accounting evidence

**Concern:** Yes — **Medium**

**What can go wrong.** An emergency or member-care expense could place care
notes, diagnoses, locations, or protected worker identity in Accounting
Releases, QBO/Xero descriptions, packages, logs, or support tasks.

**Permanent correction.** Phase 21 emits only the minimum accounting-purpose
facts allowed by D18. Care-classified details and source evidence remain in the
Phase 38/29 restricted boundary. Accounting descriptions use approved safe
labels and opaque source references.

### C-17 — Offline and AI boundaries need finance-specific examples

**Concern:** Yes — **Medium**

**What can go wrong.** Generic offline or AI language can be interpreted as
allowing queued expense approvals, mappings, release actions, provider retries,
or AI-resolved accounting exceptions.

**Permanent correction.**

- Phase 39's "money mutations never offline" explicitly includes field-account
  entries/transfers, expense approval/payment, mapping/profile/currency-lane
  changes, Accounting Releases, Bank Matches, provider delivery, and
  corrections. A receipt-photo draft may be cached only under Phase 29/10
  policy and is never an approval or payment.
- Phase 40 AI may explain, classify, or suggest. It may not certify a
  capability, activate a currency lane, approve an expense, alter a mapping or
  profile, release accounting, resolve an exception, or retry an ambiguous
  provider write. A human typed command plus domain revalidation is mandatory.

### C-18 — Status and index documents understate Phase 20 maturity

**Concern:** Yes — **Medium**

**What can go wrong.** Before this correction, `phase-map.md` said Phase 20
was simply "future (needs PRD)," while the roadmap said the D1-D20 grill was complete and an
implementation-ready specification is next. Agents may repeat discovery,
ignore ratified decisions, or mistake the decision log for a final spec.

**Permanent correction.**

- Mark Phase 20 as "implementation-ready planning; not built or dispatched."
- Index the approved PRD, decision log, ADRs, evidence, and OpenSpec contract.
- Preserve Phase 21 as future and not yet groomed.
- Preserve `/to-tickets` as a separate approval gate; the completed `/to-spec`
  package does not itself authorize implementation.

## 5. Phase-by-phase congruency pass

The table explicitly records a concern for every phase. "No concern" means no
conflict was found at this boundary; it does not mean the phase has been
implementation-reviewed.

| Phase | Concern?                                        | Congruency result and required action                                                                                                                                                                                                                                  |
| ----- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | No                                              | Program/devops foundations do not claim accounting truth. Preserve tenant-safe jobs, idempotency, secrets, and audit controls when Phase 20 is specified.                                                                                                              |
| 1     | **Yes — Blocker found; corrected locally**      | C-01 updated the ownership matrix with distinct contribution, settlement, bank-evidence, accounting, and Phase 21 authorities plus authority-specific repair.                                                                                                          |
| 2     | **Yes — Blocker/high found; corrected locally** | C-01A/C-07 separate Site presentation, stable Legal Entity ownership, Settlement Account Binding, and capability-specific readiness.                                                                                                                                   |
| 3     | **Yes — High found; corrected locally**         | Legal Entity is now an explicit subtract-only scope in the projection resolver; it is never inferred from Site, designation, processor account, or a mutable Tenant default.                                                                                           |
| 4     | **Yes — High found; corrected locally**         | Identity remains distinct from financial/provider identity, and the former interim receipt-snapshot extension is explicitly retired rather than allowed to survive as parallel truth.                                                                                  |
| 5     | No                                              | Public runtime and checkout provide site/source context but do not own accounting mapping or settlement truth.                                                                                                                                                         |
| 6     | No                                              | Communication events own communication consent, dispatch, and delivery history; they may notify about accounting work but do not own an Accounting Exception Case or QBO/Xero accounting-delivery truth.                                                               |
| 7     | **Yes — Blocker found; corrected locally**      | C-01A separates stable Legal Entity identity from immutable, effective-dated Legal Issuer Profile Versions while preserving receipt/legal-donor authority.                                                                                                             |
| 8     | No                                              | Mission Control can host D13 follow-up tasks; task state must remain non-authoritative for accounting.                                                                                                                                                                 |
| 9     | **Yes — High found; corrected locally**         | Party/external-reference primitives remain compatible, but the stale Phase 4 interim receipt snapshot was removed as runtime authority. A QBO/Xero provider identity cannot become Party truth.                                                                        |
| 10    | No                                              | Restricted-worker projection rules strengthen D18/Phase 38 minimization. Provider descriptions must use safe publication identities.                                                                                                                                   |
| 11    | No                                              | Default-closed custom-field rules are compatible. Accounting and money records must not gain arbitrary EAV fields that bypass typed contracts.                                                                                                                         |
| 12    | **Yes — High found; corrected locally**         | Capabilities now carry exact Legal Entity scope and signed scope revision/hash. Release, mapping, destination, reconnect, exception, and package actions still require explicit finance capabilities.                                                                  |
| 13    | **Yes — Blocker found; corrected locally**      | C-01A/C-03 removed the writable `ACCOUNTING-EXPORT` axis, made exact Legal Entity/Settlement Account Binding explicit, and preserved D17/D19 source joins. GitHub notes remain.                                                                                        |
| 14    | No                                              | Credit operations supply source-owned facts and compensations. Phase 20 consumes them without becoming credit truth.                                                                                                                                                   |
| 15    | **Yes — Blocker found; corrected locally**      | C-01A/C-04 now freeze exact source coverage, partition batch/deposit work by Legal Entity, and reserve final reconciliation for QBO/Xero. GitHub notes remain.                                                                                                         |
| 16    | **Yes — Blocker found; corrected locally**      | C-01A adds exact Legal Entity and Settlement Account Binding to recurring groups, cohorts, occurrences, authorization, and executor bindings; commitments remain source truth.                                                                                         |
| 17    | No                                              | System messages may notify about readiness/exceptions but cannot authorize release or provider delivery.                                                                                                                                                               |
| 18    | No after clarification                          | Generated-document identity, lineage, and canonical PDFs remain separate from Phase 20 Accounting Evidence Artifacts and Delivery Packages. Phase 20 may reuse a renderer behind an explicit interface but never delegates package authority.                          |
| 19    | No                                              | Donor statements and accounting releases intentionally have different purposes. Preserve the distinction and fix Phase 33's equality wording.                                                                                                                          |
| 20    | **Yes — High found; corrected locally**         | C-02 separates source, Stripe, bank evidence, Asym matching/release, and QBO/Xero authorities; D1-D20 remain unchanged. The full `/to-spec` PRD and OpenSpec contract validate strictly and remain planning—not runtime—authority.                                     |
| 21    | **Yes — High found; corrected in roadmap**      | C-05/C-06 close source ownership around per-currency Field Accounts, gross allocations, separate assessments/costs, and the D18 expense handoff.                                                                                                                       |
| 22    | **Yes — Medium found; corrected in roadmap**    | C-08 prevents public progress from using provider, Accounting Release, or Field Account balance as fundraising truth.                                                                                                                                                  |
| 23    | **Yes — Medium found; corrected in roadmap**    | CMS/site planning does not own finance truth. Public operational blocks require their owning domain and safety gate, and dynamic blocks consume only published, safe projections.                                                                                      |
| 24    | **Yes — High found; corrected in roadmap**      | Site presentation cannot define a financial route. Phase 24 resolves an exact Legal Entity, Designation, Settlement Account Binding, environment, and currency lane; D20 owns settlement/FX evidence. Do not restore fixed conversion-cost claims from the attachment. |
| 25    | **Yes — Medium found; corrected in roadmap**    | Donors receive unmetered exact-current logical-document access, not a chooser full of duplicate artifact revisions. Internal accounting artifacts, mappings, and evidence-only history remain hidden.                                                                  |
| 26    | **Yes — Medium found; corrected in roadmap**    | Support Hub launches on Resend Inbound rather than a speculative provider abstraction. Conversation purpose belongs to Phase 26, while Phase 17 owns governed content/sender policy and Phase 6 owns consent, dispatch, and history.                                   |
| 27    | **Yes — Medium found; corrected in roadmap**    | Portfolio/appeal metrics use Phase 13/16 facts and retain Legal Entity and currency scope. Any finance rollup later uses the Phase 33 semantic contract.                                                                                                               |
| 28    | **Yes — High found; corrected in roadmap**      | C-08 keeps support goals and operational Field Account projections distinct and per currency.                                                                                                                                                                          |
| 29    | **Yes — Medium found; corrected in roadmap**    | C-09 separates Phase 18 document identity/lineage and Phase 21 expense-evidence meaning from Phase 29 byte storage, access mechanics, and policy execution.                                                                                                            |
| 30    | **Yes — Blocker found; corrected in roadmap**   | C-10 requires D17 half-open ownership, source-complete manifests, previous-owner evidence, and proof-gated gap-only backfill.                                                                                                                                          |
| 31    | **Yes — High found; corrected in roadmap**      | C-11 makes Phase 20 the exclusive QBO/Xero grant, destination, posting, retry, and readback path.                                                                                                                                                                      |
| 32    | **Yes — Medium found; corrected in roadmap**    | Newsletter sync is consent/communication work with no accounting authority. Phase 17 owns governed message/sender policy, Phase 6 owns consent/dispatch/history, and Phase 34 alone owns configurable workflow vocabulary.                                             |
| 33    | **Yes — Blocker found; corrected in roadmap**   | C-12 requires source, version, Legal Entity, currency, grain, cutoff, and recognition basis instead of universal numeric equality.                                                                                                                                     |
| 34    | **Yes — High found; corrected in roadmap**      | C-13 permits only typed Phase 20 commands with execution-time revalidation; workflow state remains non-authoritative.                                                                                                                                                  |
| 35    | **Yes — Medium found; corrected in roadmap**    | Contribution-event triggers remain source events and exact-occurrence recovery; they neither use a generic failed-payment rerun nor directly create provider accounting writes.                                                                                        |
| 36    | **Yes — High found; corrected in roadmap**      | C-14 reuses Phase 13 fee-cover truth and Phase 20 D19 exact processor-cost allocation; it creates no P2P fee engine.                                                                                                                                                   |
| 37    | **Yes — High found; corrected in roadmap**      | C-15 routes trip expenses through Phase 21/D18 and keeps participant payment classification in source domains.                                                                                                                                                         |
| 38    | **Yes — Medium found; corrected in roadmap**    | C-16 prevents care facts and attachments from entering expense/accounting projections beyond purpose-minimum approved fields.                                                                                                                                          |
| 39    | Clarification required; corrected in roadmap    | C-17 keeps release, mapping, approval, Bank Match, provider write, and other finance authority online and server-owned.                                                                                                                                                |
| 40    | Clarification required; corrected in roadmap    | C-17 makes AI advisory only and prohibits autonomous certification, approval, release, retry, provider mutation, and exception resolution.                                                                                                                             |

## 6. Recommended roadmap corrections

The following amendments are intentionally concrete enough to paste into the
owning roadmap sections. They preserve the intended product outcomes while
removing the authority conflicts.

### Phase 21 — Missionary Field Accounts & Support Balances

Replace the allocation, expense, currency, and open-question language with:

> **Field-account source authority.** Phase 21 is the source of truth for the
> operational field-account subledger. Each supported allocation posts a
> **gross support credit** and each admin assessment posts a **separate,
> source-linked debit**; the available balance may display the resulting net,
> but the source entries never collapse into one net credit. Refunds,
> assessment reversals, transfers, draws, and corrections post append-only
> inverse or successor entries against the exact original occurrence.
>
> **Processor costs.** Phase 20 D19 never silently changes a field-account
> balance. If a tenant prospectively enables designation-borne uncovered
> processor costs for field accounts, Phase 21 consumes the exact D19
> occurrence once and posts a separate, clearly labelled Phase 21 debit.
> Gross support, admin assessment, processor cost, reimbursement, and available
> balance remain independently inspectable.
>
> **Currency.** Every field account, entry, balance, monthly statement, and
> runway calculation is currency-specific. Unlike currencies are never added.
> The ordinary lane follows D20 local settlement; a retained settlement
> currency is eligible only through the exact D20-certified
> Stripe-bank-accounting-destination lane. Any reporting conversion is a
> separately labelled Phase 33 projection, never field-account truth.
>
> **Expenses and accounting.** Phase 21 owns expense reports, lines,
> itemization, receipt-evidence semantics, approvals, reimbursement
> obligations, hold-until-funded state, payment coverage, successors, and
> corrections. Phase 29 may hold the private receipt bytes and access audit.
> Phase 20 receives only the immutable, PII-minimized D18 accounting-ready
> handoff and remains the only QBO/Xero delivery path. Payroll, contractor
> compensation, per diem, advances, and tax treatment require separately typed
> source contracts and may not be smuggled through the expense-report handoff.

Delete "whether Asym is the subledger of record vs a mirror" from the open
questions. Retain only the real UX/policy choices: posting timing, which
currency-separated measures missionaries see, goal/budget ownership, and
read-only transition feeds.

### Phase 22 — Public Missionary & Project Page Workflow

Add:

> **Truthful support progress.** A progress component binds to one approved
> goal contract with an explicit numerator, currency, period, and source.
> Ordinary support-raised progress uses eligible gross support from Phase 13
> and commitments from Phase 16 as defined by that contract; admin assessment,
> processor cost, Accounting Release state, Stripe balance, and Phase 21
> available balance do not silently reduce or replace the numerator. If a
> tenant chooses to publish a separate available-balance or runway measure, it
> is explicitly labelled, currency-specific, Phase 21-owned, and privacy
> reviewed.

### Phase 24 — Full Multi-Site, Language & Currency Management

Replace the old fixed settlement claim with:

> **Presentment management, not FX accounting.** Phase 24 lets staff enable
> donor-presentment currencies and configure per-site defaults, disclosure,
> formatting, and checkout availability. Phase 20 D20 owns downstream
> settlement and accounting-lane certification. Local settlement matching the
> QBO home or Xero base currency is the quiet default. Retained foreign
> settlement is shown only when the exact connected Stripe account,
> matching-currency payout bank, and accounting destination are currently
> certified. The product never hardcodes a universal currency count, bank
> account requirement, conversion percentage, or regional capability.

### Phase 28 — Missionary Workspace Depth & Support-Raising CRM

Replace the single blended finance dashboard promise with:

> **Purpose-separated support dashboard.** Show separate cards for committed
> support, gross support received, admin assessments, optional processor-cost
> debits, Phase 21 available balance, and runway. Each card names its source,
> period, and currency. Behind/late partner logic remains Phase 16 commitment
> truth; available balance remains Phase 21 truth; accounting delivery remains
> Phase 20 truth. Multi-currency data is viewed per currency and never added
> into one operational balance. Any translated leadership trend comes from a
> visibly labelled Phase 33 reporting projection.

### Phase 29 — File Manager & Document Management

Add:

> **Finance and expense evidence.** Phase 29 owns private receipt bytes,
> immutable-object storage, malware/format checks, classification, retention
> execution, signed access, and access/download audit. Phase 21 owns what an
> expense receipt proves, which report/line it belongs to, whether evidence is
> sufficient, and every approval or correction. Phase 20 receives the D18
> PII-minimized handoff, not the receipt bytes. For Accounting Evidence
> Artifacts and Delivery Packages, Phase 20 owns the digest, exact bytes
> identity, release/package lineage, and provider-conformance meaning while
> Phase 29 supplies storage and governed access. Replacing bytes always creates
> a new immutable version.

### Phase 30 — Imports & Migration Tools

Add:

> **Accounting-safe historical import.** Accounting-relevant imports preserve
> source family, original external identity, occurrence time, currency,
> provenance, and previous posting-owner evidence. Importing a record never
> grants Asym posting ownership. Phase 20 D17 half-open Posting Ownership
> Cutovers and Cutover Coverage Manifests govern prospective eligibility;
> historical gap-only backfill is off by default and requires proof that the
> exact closed population is unposted. Undo may not delete or mutate any fact
> covered by an immutable Accounting Release; source corrections and D11
> compensating releases append instead. Migration count/amount checks prove
> import fidelity only, not QBO/Xero delivery, Bank Match, or final
> reconciliation.

### Phase 31 — Platform API, Webhooks & Connector Framework

Replace "accounting handoffs" as a generic connector consumer with:

> **Phase 20 accounting-connector boundary.** Phase 20 is the exclusive owner
> of QBO/Xero Provider Authorization Grants, tenant/Legal Entity Accounting
> Destination Connections, capability certificates, carrier plans, delivery
> operations, and exact readback. Phase 31 may expose permissioned, versioned,
> read-only Phase 20 projections and events. It may not establish a second
> QBO/Xero grant, destination registry, posting path, retry path, or dual write.
> Any later shared connector infrastructure adoption is a prospective,
> evidence-preserving migration of internals, not a transfer of domain
> authority.

Keep the TntConnect/DonorHub candidate as a read-only governed feed from
Phase 13/16/21 projections. It must not write field-account entries or
Accounting Releases.

### Phase 33 — Reporting & Analytics

Replace the blanket "all finance numbers must match" rule with:

> **Metric contracts and reconciliation bridges.** Every finance measure names
> its authoritative source, subject, grain, currency, period/cutoff,
> recognition basis, and included lifecycle states. Equal values are required
> only when two surfaces implement the same metric contract. Phase 19 legal
> donor statements, Phase 21 field-account balances, Phase 20 Accounting
> Releases, Stripe settlement evidence, and QBO/Xero books are
> purpose-distinct. Where staff need to move between them, Phase 33 supplies an
> explicit bridge showing the included/excluded occurrences and control totals.
> Reporting-currency conversion is clearly labelled and never overwrites
> source, settlement, field-account, or accounting currency truth.

### Phase 34 — Workflow & Automation Builder

Add:

> **Accounting action boundary.** Workflows may create tasks, reminders,
> assignments, and notifications from Phase 20 events. Any accounting mutation
> invokes a typed Phase 20 command and is revalidated at execution against
> current source coverage, Legal Entity, period, destination, capability,
> capacity, idempotency, and provider evidence. Generic workflow actions cannot
> approve or alter mappings, release accounting, reconnect/replace a
> destination, clear an Accounting Exception Case, or retry an ambiguous
> provider write. Mission Control task completion never substitutes for
> cause-specific resolution proof.

### Phase 37 — Trip & Event Management

Add:

> **Trip-money boundary.** Phase 37 owns trip, participant, budget, approval
> context, and the distinction between participant payments and donations.
> Phase 13 remains the contribution source. Trip expenses use the Phase 21
> report, receipt, approval, reimbursement, payment-coverage, and correction
> workflow; Phase 37 supplies a typed trip reference and approved cost context.
> Phase 20 receives only the D18 accounting-ready handoff and D6 mapping and is
> the sole QBO/Xero delivery path. Phase 37 creates no parallel AP ledger,
> receipt store, fee rule, accounting mapping, or connector.

## 7. GitHub issue implications

Phase 20 spec issue #1036 is published from the approved specification; no
implementation child may be invented from this audit. The implementation issue
set must be produced only through an approved `/to-tickets` run. Phase 21
remains future grooming. The following are predecessor follow-ups, not
implementation authority created by this pass:

| Issue                                                                                                              | Required update                                                                                                                                                                                 | Timing                                         |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [PR #872](https://github.com/Asymmetric-al/core/pull/872)                                                          | Carry the congruent Phase 17–20 package and identify Phase 17/18/19 issue sets plus Phase 20 spec issue #1036 without implying implementation dispatch                                          | Completed by the authorized publication task   |
| [#690](https://github.com/Asymmetric-al/core/issues/690)                                                           | Parent note linking the Phase 20 audit and stating that #697/#705/#711 are amended by D2/D17/D19                                                                                                | Before affected Phase 13 children are assigned |
| [#691](https://github.com/Asymmetric-al/core/issues/691)                                                           | Add the Phase 20 ownership-matrix rows and glossary terms; do not cement the current generic money row                                                                                          | Before ownership-matrix completion             |
| [#697](https://github.com/Asymmetric-al/core/issues/697)                                                           | Replace the writable accounting-export axis with a Phase 20-derived projection over separate authorities                                                                                        | Before implementation                          |
| [#705](https://github.com/Asymmetric-al/core/issues/705)                                                           | State that fee-cover source truth remains Phase 13 and exact uncovered processor-cost allocation is D19; no Phase 36 fee engine                                                                 | Before implementation                          |
| [#711](https://github.com/Asymmetric-al/core/issues/711)                                                           | Add D17 half-open ownership intervals, Cutover Coverage Manifest, no dual write, and gap-only proof-gated backfill                                                                              | Before import/adoption implementation          |
| [#758](https://github.com/Asymmetric-al/core/issues/758)                                                           | Parent note linking the Phase 20 audit and correcting "export" and final-reconciliation terminology                                                                                             | Before deposit children are assigned           |
| [#780](https://github.com/Asymmetric-al/core/issues/780)                                                           | Freeze membership on immutable release coverage, not download/provider export; relabel `cleared` as bounded Bank Match evidence                                                                 | Before implementation                          |
| [#781](https://github.com/Asymmetric-al/core/issues/781)                                                           | Keep Phase 15 UX operational; do not present final QBO/Xero reconciliation as Phase 15 state                                                                                                    | Before implementation                          |
| [#793](https://github.com/Asymmetric-al/core/issues/793) and relevant #794-#837 children                           | Add explicit Legal Entity and Settlement Account Binding propagation to recurring groups/cohorts/occurrences/authorization/executor bindings; forbid inferred defaults and cross-entity cohorts | Before affected Phase 16 implementation        |
| [#342](https://github.com/Asymmetric-al/core/issues/342), [#343](https://github.com/Asymmetric-al/core/issues/343) | Leave closed. Do not revive their bookkeeping packet as the Phase 20 artifact or reconciliation system                                                                                          | Permanent                                      |

Phase 20 `/to-spec` is complete. Before implementation dispatch:

1. preserve parent spec issue #1036 unchanged as the approved source;
2. create tracer-bullet children from the approved spec only after explicit
   `/to-tickets` approval;
3. model blockers in dependency order;
4. link the Phase 13/15 predecessor corrections rather than duplicating them;
5. leave Phase 21 expense implementation out until its own source contract is
   groomed, while retaining the D18 boundary seam.

## 8. Correction plan and execution result

The repository-document portions of steps 1-16 are complete in this working
tree. References to GitHub issue updates in steps 2-3 were **not** performed.
Steps 17-18 remain the `/to-spec` and post-spec dispatch gates.

### P0 — Correct authority before implementation — locally complete

1. Update the Phase 1 ownership matrix with the Phase 20 record families and
   append-only repair rules.
2. Amend Phase 13's accounting seam and #697.
3. Amend Phase 15's release-coverage freeze, Bank Match terminology, ADR-0007,
   #780, and #781.
4. Replace Phase 33's universal-equality promise with explicit metric
   contracts and reconciliation bridges.
5. Add D17 limits to Phase 30 imports and undo.

### P1 — Eliminate duplicate systems — locally complete

6. Close Phase 21 source ownership in favor of its operational subledger and
   expense authority.
7. Pin QBO/Xero authorization and delivery to Phase 20, not the generic Phase
   31 connector registry.
8. Constrain Phase 34 to typed Phase 20 commands and non-authoritative
   follow-up.
9. Reuse Phase 13/D19 fee truth in Phase 36.
10. Route Phase 37 expenses through Phase 21/D18.

### P2 — Make projections and UX truthful — locally complete

11. Separate support, field-balance, accounting, and currency views in Phases
    22 and 28.
12. Define Phase 29's storage-only relationship to immutable accounting
    artifacts and private expense evidence.
13. Add finance-specific privacy, offline, and AI boundaries to Phases 38-40.
14. Correct Phase 2 connected-account/capability wording.

### P3 — Align program indices and specify — complete

15. Update `phase-map.md` to "implementation-ready planning; not built."
16. Index the Phase 20 PRD, decision log, ADRs, evidence, and OpenSpec package.
17. Publish the `/to-spec` output as spec issue #1036 without implementation
    children.
18. Run the same cross-document and issue-state checks before any
    `/to-tickets` publication.

## 9. Final dependency and authority matrix

| Fact or operation                                                                     | Source authority                                                                                     | Phase 20 role                                                                                                    | Valid downstream consumer                                             | Prohibited shortcut                                                                       |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Legal donor, contribution amount, designation, refund/return                          | Phase 13 and its source-owned append-only postings                                                   | Read exact eligible coverage and project balanced accounting effect                                              | Phase 7/18/19, Phase 21 allocations, QBO/Xero projection              | Editing gift truth from QBO/Xero, Bank Match, or an Accounting Release                    |
| Soft credit, tribute, DAF, matching-credit recognition                                | Phase 14                                                                                             | Consume only the source treatment explicitly allowed by Posting Intent                                           | Reporting and accounting projection where policy permits              | Treating recognition credit as cash or legal-donor truth                                  |
| Commitment or expected cash                                                           | Phase 16                                                                                             | Forecast context only; no cash or release authority                                                              | Phase 19/22/28/33                                                     | Posting a pledge as received cash                                                         |
| Offline entry batch and deposit group                                                 | Phase 15 operational source                                                                          | Freeze exact source coverage; generate deposit-clearing effect; perform bounded Bank Match                       | Finance staff, QBO/Xero                                               | Freezing on file download; calling Phase 20 match final reconciliation                    |
| Legal Entity, Legal Issuer Profile Version, and Settlement Account Binding            | Stable Legal Entity and issuer versions begin in Phase 7; source phases pin exact settlement binding | Phase 20 proves accounting capability and partitions every release, destination, Bank Match, package, and policy | Receipts/documents, Stripe settlement, QBO/Xero destination, staff UI | Parallel issuer identity, mutable default ownership, or inference from Site/provider name |
| Accounting Posting Intent and Canonical Accounting Effect                             | Phase 20 D4                                                                                          | Own immutable provider-neutral balanced projection                                                               | Carrier compiler, artifact, provider plan                             | Provider object shape becoming domain truth                                               |
| Posting Profile and designation mapping                                               | Phase 20 D5-D8                                                                                       | Resolve prospective tenant policy into certified provider carriers                                               | QBO/Xero plan/package                                                 | Mutable retroactive remap of a released occurrence                                        |
| Accounting Release and Source Coverage                                                | Phase 20 D2/D4                                                                                       | Freeze one exact balanced accounting publication                                                                 | Direct or artifact lane                                               | Mutating, reopening, or silently changing grain after release                             |
| QBO/Xero delivery operation and provider record                                       | Phase 20 D2/D14-D16                                                                                  | Execute idempotently, preserve ambiguous outcomes, read back exact effect                                        | Finance staff and exception logic                                     | Blind retry, destination swap, or one `synced` flag                                       |
| Final books, period close, bank reconciliation, translation/revaluation               | QBO/Xero under tenant accountant control                                                             | Inspect and retain evidence only                                                                                 | Accountant/bookkeeper                                                 | Asym declaring the books closed/reconciled or inventing FX treatment                      |
| Processor payout transfer and settlement evidence                                     | Stripe evidence captured by Phase 20 D9                                                              | Preserve mode-honest exact or bounded composition                                                                | Expected Bank Arrival, Accounting Effect, exception case              | Inferring unsupported payout membership or using mutable balance as truth                 |
| Expected Bank Arrival, Bank Evidence, Bank Match                                      | Phase 20 D10; evidence remains source-labelled                                                       | Assist operational tie-out and explain discrepancies                                                             | Finance staff; QBO/Xero final reconciliation                          | Fuzzy auto-match, cross-entity allocation, or final-reconciliation claim                  |
| Processor fee-cover and provider cost                                                 | Phase 13 fee-cover source; Stripe exact cost; Phase 20 D19 allocation                                | Keep gross, fee-cover, cost, settlement, and designation effect separate                                         | Accounting release; optional Phase 21 occurrence                      | Netting the gift, recomputing cost, or creating a Phase 36 fee model                      |
| Donor presentment currency                                                            | Phase 2/24 and Stripe payment facts                                                                  | Preserve it as source evidence, not settlement truth                                                             | Donor UI, reporting with explicit contract                            | Using presentment as QBO/Xero home/base accounting amount                                 |
| Settlement currency and retained-currency lane                                        | Phase 20 D20 from exact account-scoped provider evidence                                             | Certify local default or prospective retained lane                                                               | Accounting release and provider destination                           | Hardcoded capability/cost; forced conversion to make numbers match                        |
| Field Account, Gross Support Allocation, Assessment Entry, draw, transfer             | Phase 21 operational allocation subledger                                                            | Consume only approved source occurrences needed for accounting                                                   | Missionary projection and QBO/Xero projection                         | Mirroring QBO/Xero as operational balance, netting gifts, or summing gifts directly       |
| Approved Expense Snapshot, receipt evidence, approval, Reimbursement Payment Coverage | Phase 21 expense authority                                                                           | Validate and post only the immutable D18 PII-minimized accounting-ready handoff                                  | QBO/Xero; staff finance workspace                                     | Phase 20 AP ledger, raw-receipt copy, payroll through expense handoff                     |
| Accounting exception                                                                  | Phase 20 cause-owned Accounting Exception Case                                                       | Isolate work and clear only on cause-specific proof                                                              | Mission Control follow-up task and finance UI                         | Clearing because a task was closed or retrying an unknown provider outcome                |
| Accounting correction                                                                 | Source domain plus Phase 20 D11 policy                                                               | Create a new cause-linked compensating Accounting Release                                                        | QBO/Xero accepted period                                              | Editing or deleting the original release                                                  |
| File bytes and access                                                                 | Phase 29 for generic storage/access; owning domain for semantic identity                             | Own accounting digest, lineage, conformance, and retention purpose                                               | Authorized staff/auditor                                              | Replacing frozen bytes or letting filename/folder define accounting truth                 |
| Historical import                                                                     | Phase 30 import provenance plus target-domain source service                                         | Apply D17 ownership intervals before release eligibility                                                         | Target domain and explicitly proved gap-only backfill                 | Import implies posting ownership; undo released facts                                     |
| Public API/webhook/connector projection                                               | Phase 31 governance                                                                                  | Publish read-only governed Phase 20 views/events where allowed                                                   | External consumer                                                     | Second QBO/Xero auth, posting, or destination registry                                    |
| Reporting metric                                                                      | Phase 33 semantic contract referencing the actual source                                             | Supply explicitly scoped accounting measures and bridges                                                         | Staff/leadership reports                                              | Comparing unlike purpose, grain, cutoff, or currency as a defect                          |
| Workflow/task                                                                         | Phase 34/8 coordination                                                                              | Expose typed commands and follow-up only                                                                         | Staff operations                                                      | Generic release/retry/remap/resolve action                                                |
| Offline draft                                                                         | Phase 39 bounded local draft policy                                                                  | No authoritative accounting or money mutation offline                                                            | Receipt-image draft where policy allows                               | Offline approval, payment, mapping, release, Bank Match, or provider write                |
| AI suggestion                                                                         | Phase 40 governed advisory layer                                                                     | Explain or suggest against Phase 33/Phase 20 safe projections                                                    | Human decision support                                                | Autonomous certification, approval, release, exception resolution, or retry               |

## 10. UX congruency rules

These rules keep the cross-phase corrections from turning into a noisy finance
product:

1. **One accounting doorway.** Ready for Accounting, Needs attention,
   Destinations, Mapping, Packages, and Bank Match are views of one Phase 20
   product, not separate admin products.
2. **Progressive disclosure.** Ordinary local-currency, single-entity,
   organization-borne-cost tenants see defaults and exceptions, not the
   carrier matrix, retained-currency certification, or cutover internals.
3. **Source-labelled status.** Use plain labels such as "Ready to release,"
   "Sent to QuickBooks," "QuickBooks confirmed," "Bank evidence matched," and
   "Finish reconciliation in QuickBooks." Never show one ambiguous
   "exported/synced/reconciled" badge.
4. **Exception first.** Healthy work stays quiet. Every exception shows what
   happened, what remains safe, what is blocked, who can act, and the exact
   evidence needed.
5. **No fake certainty.** Unsupported provider composition, ambiguous writes,
   fuzzy bank matches, stale capability, and cross-currency differences stay
   explicit and do not receive a green success state.
6. **Tenant control is prospective.** Staff can choose cadence, grain,
   provider carriers, mappings, expense treatments, fee attribution,
   currencies, and evidence lanes within certified bounds. A choice never
   rewrites a frozen release.
7. **One source, many explanations.** Donor, missionary, finance, and
   leadership surfaces may explain the same occurrence differently, but each
   names its purpose and authority and links to a reconciliation bridge when
   totals differ.
8. **Accessible finance semantics.** Status and exceptions use text plus icon,
   keyboard-operable review surfaces, programmatic error associations,
   announced async outcomes, non-color-only differences, and safe
   confirmation copy for irreversible prospective changes.

## 11. Acceptance gates for program congruency

The repository-document correction pass is complete when the local contract
gates are checked. OpenSpec and GitHub dispatch remain separate, visible gates:

- [x] The Phase 1 ownership matrix names every Phase 20 authority and repair
      route.
- [x] Stable Legal Entity, immutable Legal Issuer Profile Version, optional
      same-Tenant Party linkage, and exact Settlement Account Binding are
      distinct and propagated through affected source phases.
- [x] Phase 13 no longer specifies a writable five-state accounting-export
      machine.
- [x] Phase 15 freezes deposit membership at immutable Source Coverage and
      does not claim receipt, acknowledgment delivery, or final reconciliation.
- [x] Phase 15 uses one `draft → validated → posted` lifecycle, adds
      `awaiting_approval` only when the effective Phase 12-backed policy
      requires it, and defines no parallel approve, commit, or finalize state.
- [x] Phase 15's declared hard predecessors match both roadmap indices:
      Phases 7, 12, 13, and 14.
- [x] Phase 13 accepts mixed cart intent and owns the one-time money branch,
      while Phase 16 alone owns recurring groups, lines, cohorts, legs, and
      provider execution topology.
- [x] The canonical donor-document chain is explicit: Phase 13 contribution
      truth → Phase 7 official facts → Phase 14 non-receipt purpose/coverage
      where applicable → Phase 17 governed content → Phase 18 canonical
      artifact → Phase 6 dispatch/history; Phase 19 coordinates statement runs.
- [x] The active guest-giving OpenSpec routes every staff-entered offline gift
      through Phase 15's governed batch posting transaction and contains no flat-donation,
      legacy donor-id, live-receipt, or parallel offline-contribution authority.
- [x] The active donor self-service OpenSpec consumes Phase 19 frozen
      statement-run truth and Phase 18 exact-current artifacts; it defines no
      live-row/year-filter statement builder and gives the donor BFF access
      authority only, not delivery ownership.
- [x] The active Statement Studio OpenSpec names Phase 7 fact, Phase 19 run,
      Phase 18 artifact/access, Phase 17 content/sender, and Phase 6
      dispatch/history owners, and treats stale Phase 7 issue proposals
      #579-#584 as historical scopes to retire or retarget.
- [x] Accepted ADRs 0004, 0005, 0009, and 0011 carry dated amendments that
      preserve their original decisions without reintroducing gift-level
      delivery states, dual renderers, a second Phase 15 lifecycle, or
      processor-triggered receipt authority.
- [x] Phase 9 and Phase 11 split governed content/sender/reply ownership from
      dispatch/outcome/history ownership, and Phase 7, 13, and 15 status
      headers match the current merged PR and published issue state.
- [x] Historical Statement Studio documents explicitly route implementation to
      Phase 18's one-winner, zero-legacy-runtime cutover contract rather than
      authorizing DocRaptor, dual runtime, or gradual migration.
- [x] Phase 21 is explicitly the operational Field Account and expense source,
      while QBO/Xero remains the GL.
- [x] Phase 21 treats processor cost and currency as separate exact
      occurrences, not implicit netting.
- [x] Phase 30 import/undo honors D17 and cannot mutate released coverage.
- [x] Phase 31 cannot create a second QBO/Xero authorization or posting path.
- [x] Phase 33 declares authority, grain, currency, cutoff, and recognition
      basis for every finance metric.
- [x] Phase 34 generic workflows cannot release, retry, or resolve accounting
      work without typed Phase 20 commands and current proof.
- [x] Phase 36 reuses Phase 13/D19 fee truth.
- [x] Phase 37 routes expenses through Phase 21/D18.
- [x] Phases 38-40 explicitly preserve privacy, online authority, and
      human-controlled accounting actions.
- [x] `phase-map.md` and related indices describe Phase 20 as
      implementation-ready planning, not built or dispatched.
- [x] The approved `/to-spec` output expands the initial boundary bootstrap
      into the complete observable D1-D20 OpenSpec contract.
- [x] The documentation requires live QBO, Xero, and Stripe capability facts to
      be re-certified at build and release time rather than copied from a
      hardcoded roadmap claim.
- [ ] Phase 7 #579-#584 are retired or retargeted and required dated notes are
      applied to other affected GitHub issue families before those predecessors
      are dispatched unchanged.
- [x] PR #872 carries the congruent Phase 17–20 package and current Phase 19 and
      Phase 20 issue posture.

## Final ruling

Keep Phase 20 D1-D20. Do not reopen the ratified architecture and do not replace
the current roadmap with the attached draft.

The surrounding repository-document authority seams are now repaired: the
ownership matrix and source lifecycles are explicit, Phase 21 has a bounded
operational subledger/expense contract, and later phases consume projections or
typed commands without creating a second ledger, connector, fee engine, or
reconciliation authority.

The remaining path is deliberate rather than dangling: the completed `/to-spec`
package and spec issue #1036 are the full D1-D20 planning authority, and PR #872
reconciles that package with Phases 17–19. Only an explicitly approved
`/to-tickets` run may generate Phase 20 implementation tickets; affected
predecessor issue bodies must be corrected before they are dispatched
unchanged. These documents are implementation-ready planning, not runtime
implementation authorization.
