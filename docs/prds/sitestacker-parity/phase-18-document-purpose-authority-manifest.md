# Phase 18 Executable Document-Purpose and Authority Manifest

- **Date:** 2026-07-21
- **Phase:** 18 — Receipt & PDF Template System (`document-templates`)
- **Status:** Groomed specification; epic #907 and children #908–#961
  published; approved frontier #908–#910 is `status:todo` +
  `ready-for-agent`; #911–#961 remain `status:blocked`
- **Authority:** This manifest is normative for the Phase 18 PRD. It is not a runtime-generated inventory and it does not authorize implementation.

## Purpose

This file closes the launch catalog that every implementation, fixture, API, database constraint, jurisdiction pack, [renderer qualification](./phase-18-renderer-qualification-protocol.md), and acceptance test must use. A template may present a purpose; it may not create, widen, rename, or reinterpret one.

The canonical chain is:

`source-owned immutable facts / optional issuance -> immutable document publication -> idempotent generation request -> subordinate fenced attempts -> exact verified private PDF -> separately linked Phase 17 delivery`

D17 controls every apparent conflict: Phase 18 is a clean new system. Current receipt, statement, snapshot, Unlayer, mutable-root, hard-coded-send, text-download, and on-demand-render paths are deletion targets. They are not legacy/foreign import formats, compatibility requirements, or fallback authorities. D1's narrow Asym-native semantic-template package transfers authoring content only into a destination-owned quarantined draft; it is not a runtime or cutover path.

## Phase 19 statement-operations authority amendment

Phase 7 remains authoritative for the exact legal-donor **Statement Subject**,
eligibility, immutable facts/exclusions, correction effect, issuance, and each
prospectively frozen exact-issuer receipt plan. Phase 19 owns only
tenant-authorized participation, Run Preflight, frozen population, run/item
coordination, cutoffs, and late-fact handling. Phase 18 accepts an exact
item-authoritative generation request and never infers household grouping,
legal donor, jurisdiction, receipt coverage, or run eligibility.

The exact-issuer receipt-plan resolver is closed and reason-aware; no caller
branches on `active` alone. A non-Canadian or never-activated issuer uses the
applicable ordinary policy. An active or repairably paused Canadian epoch
retains its frozen plan, while a repairable pause holds generation and issuance.
A legal lock or ended epoch creates no new Canadian issuable plan and never
falls through to ordinary policy for that issuer and interval. Pause, lock, and
end never hide or revoke historical artifacts, access, or records.

Phase 14 separately supplies a closed **Recognition Subject** projection.
`giving.summary.informational@1` is Phase 19's optional, default-Off **Support
overview — Not a tax document**. Direct support remains sourced from Phases
7/13. Its recognition facts are limited to authorized household support and
sufficiently disclosed, unambiguous DAF recommendations. It is a separate
purpose with independently authoritative run, artifact, access, delivery,
correction, and completion truth; it never enters or blocks an official
document.

## Phase 21 Field Account Support-statement authority amendment

Phase 21 D11 remains authoritative for every Support Cycle Close, exact
Support Cycle Integrity Manifest, covered Field Account Occurrence, opening
and closing Finance-confirmed Field Account Balance, correction meaning,
reservation or obligation meaning, scope, and ISO currency. Phase 21 D12 owns
the code-defined **Field Account Support Statement Approved Data View**,
statement eligibility, exact recipient meaning, and financial correction
semantics.

When the effective D9 Support Workspace Publication Profile authorizes
missionary access, a post-close idempotent Phase 21 projection produces one
immutable Facts Package for `field_account.support_statement@1`. Phase 18
never queries live Field Account history, infers an arbitrary period, merges
currencies, recalculates balances, chooses recipients, or changes financial
meaning. Phase 18 owns the one logical document, exact current accessible
artifact, immutable same-facts artifact successors, retention, and private
artifact access. Phase 17/6 may optionally communicate readiness through the
protected document-artifact seam, but delivery is not document or financial
truth.

The manifest row below reserves a future additive contract. It does not claim
that the current executable purpose catalog, Approved Data View registry,
fixture pack, or renderer supports this purpose during grooming. Phase 21
implementation must add those artifacts through the existing Phase 18 service
and pass purpose-specific certification before the global purpose can leave
Reserved. Separately, every request requires an effective tenant D9 publication
profile and current Phase 12 principal authorization for the exact Support
Assignment; Support Assignment Participant Membership alone never authorizes a
document. Global qualification never activates a tenant or grants access.

This purpose is distinct from Phase 19's donor-oriented
`giving.summary.informational@1`, Phase 7/19 year-end statements, Phase 16
pledge statements, payroll documents, bank statements, and accounting
artifacts. Each logical item is scoped to one exact Tenant, Legal Entity,
Support Assignment, currently authorized recipient principal, charitable
purpose, Field Account, Support Cycle, and ISO currency. It contains no donor
roster or donor contact data and makes
no tax, bank, payroll, payment, ownership, availability, withdrawability,
reconciliation, or QBO/Xero-posting claim.

## Document Purpose Contract schema

Every code-owned purpose version MUST freeze the following fields as one immutable unit:

| Field                      | Required meaning                                                                                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `purpose_key`              | Stable ASCII semantic key; never tenant-authored or label-derived.                                                                                                                                                        |
| `purpose_version`          | Positive immutable contract version.                                                                                                                                                                                      |
| `lane`                     | Exactly `official_tax`, `governed_business`, or `general_custom`.                                                                                                                                                         |
| `source_owner`             | Phase/domain that supplies eligibility, facts, recipient meaning, correction effect, and issuance where applicable.                                                                                                       |
| `legal_issuer_requirement` | `none`, `verified_us_issuer`, or `active_ca_registered_charity_issuer`; the Canadian value is a new-generation admission proof after the reason-aware resolver, never a plan/fallback selector or historical-access gate. |
| `recipient_role`           | One deterministic source-owned role and its authorization policy.                                                                                                                                                         |
| `approved_data_view`       | Exact immutable typed data-view version accepted by this purpose.                                                                                                                                                         |
| `case_registry`            | Closed source-selected case set; templates and callers cannot select a protected case.                                                                                                                                    |
| `required_blocks`          | Protected semantic blocks that must survive authoring, compilation, rendering, and extraction.                                                                                                                            |
| `optional_blocks`          | Closed block subset available to the tenant for this purpose.                                                                                                                                                             |
| `forbidden_facts`          | Versioned structural deny-set, including existence-sensitive facts.                                                                                                                                                       |
| `output_policy`            | Exactly `accessible-v1` or `accessible-archive-v1`.                                                                                                                                                                       |
| `locale_policy`            | Activated locale set, required legal-language variants, and fail-closed fallback rule.                                                                                                                                    |
| `publication_scope_policy` | Configured assignment/inheritance plus the fixed D15 recovery order: one compatible same-scope prior, then one exact-locale permitted ancestor.                                                                           |
| `review_floor`             | Server-derived `standard` or `protected`; structural failures can never be approved away.                                                                                                                                 |
| `identity_policy`          | Internal logical identity plus the applicable public reference/serial rule.                                                                                                                                               |
| `correction_policy`        | Source-owned currentness, successor, cancellation, and replacement semantics.                                                                                                                                             |
| `delivery_policy`          | Permitted Phase 17 handoff routes; delivery never changes issuance/artifact truth.                                                                                                                                        |
| `access_policy`            | Portal, guest, staff, support, and missionary object-authorization rules.                                                                                                                                                 |
| `records_schedule`         | Exact effective-dated Records Schedule Contract.                                                                                                                                                                          |
| `fixture_pack`             | Required synthetic ordinary, negative, maximum-content, locale, accessibility, and failure fixtures.                                                                                                                      |
| `release_evidence`         | Renderer, legal/finance, accessibility, security, records, load, and operational proof required before activation.                                                                                                        |

Unknown, missing, stale, or ambiguous authority is a blocking result. Callers cannot provide jurisdiction, issuer, recipient, signer, serial, case, current publication, output policy, records schedule, or delivery authority.

## Normative purpose registry

This registry may name a future contract in `Reserved` state before that
contract enters the executable catalog. The currently executable catalog is
the exact eleven-purpose subset that excludes
`field_account.support_statement@1`. Phase 21 implementation must first add
the reserved contract to the executable catalog as runtime `dark`; only its
separate release evidence may later make it available. This explicit mapping
does not mutate or weaken the existing eleven contracts.

| Purpose key                               | Lane and source owner                                                                      | Recipient and coverage                                                                                                                                                | Protected outcome                                                                                                                                      | Output                  | Launch state                                                                                                                              |
| ----------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `us.contribution_acknowledgment.single@1` | `official_tax`; Phases 7/13                                                                | Legal contributor for one source-eligible posted contribution                                                                                                         | Source-selected U.S. acknowledgment case and `ACK-XXXXX-XXXXX` logical reference                                                                       | `accessible-archive-v1` | Dark until U.S. legal/finance and D3 gates pass                                                                                           |
| `us.contribution_acknowledgment.annual@1` | `official_tax`; Phase 7 owns eligibility/subject/facts; Phase 19 freezes population        | Exact source-owned legal contributor; exact frozen annual item set                                                                                                    | Itemized acknowledgment; each gift preserves its own date, amount/property, and case                                                                   | `accessible-archive-v1` | Dark until Phase 19 seam and U.S. gates pass                                                                                              |
| `us.qcd.acknowledgment@1`                 | `official_tax`; Phases 7/13                                                                | Source-approved QCD recipient and exact distribution                                                                                                                  | Separate QCD wording; never enters ordinary deductible-contribution totals                                                                             | `accessible-archive-v1` | Dark until U.S. gates pass                                                                                                                |
| `ca.official_receipt.individual_cash@1`   | `official_tax`; Phase 7 issuance + Phase 13 money                                          | True donor for one eligible cash gift under one issuance-admitted verified issuer epoch                                                                               | CRA ordinary cash case, `ca_r_v1` serial, current signer                                                                                               | `accessible-archive-v1` | New generation only while the exact issuer epoch admits issuance                                                                          |
| `ca.official_receipt.cumulative_cash@1`   | `official_tax`; Phase 7 owns plan/coverage/issuance; Phase 19 freezes population           | True donor; nonoverlapping source-frozen annual-cumulative cash plan/coverage                                                                                         | CRA cumulative cash case, one `ca_r_v1` serial                                                                                                         | `accessible-archive-v1` | New generation only while issuance and coverage proof both pass                                                                           |
| `ca.official_receipt.non_cash@1`          | `official_tax`; Phases 7/13                                                                | True donor for one eligible noncash gift                                                                                                                              | Property, FMV/deemed-value and eligible-amount facts required by Canadian contract                                                                     | `accessible-archive-v1` | New generation only while the exact issuer epoch admits this case                                                                         |
| `ca.official_receipt.advantage_split@1`   | `official_tax`; Phases 7/13                                                                | True donor for one eligible split-receipting event                                                                                                                    | Payment/value, advantage description/FMV, eligible amount, protected wording                                                                           | `accessible-archive-v1` | New generation only while the exact issuer epoch admits this case                                                                         |
| `giving.summary.informational@1`          | `governed_business`; Phases 7/13 direct facts + Phase 14 recognition + Phase 19 population | Exact authorized Recognition Subject; direct support plus frozen household-support/DAF-recommendation allow-list                                                      | **Support overview — Not a tax document**; no legal-donor, deductible, cash, receipt, or official-total claim                                          | `accessible-v1`         | Default Off; supported only after Phase 7/13/14/19 purpose and privacy proof                                                              |
| `field_account.support_statement@1`       | `governed_business`; Phase 21 D11/D12/D19                                                  | Exact currently Phase 12-authorized recipient principal for one Support Assignment × Field Account × Support Cycle × ISO currency; participation alone grants nothing | Finance-closed organization-controlled support activity; no tax, bank, payroll, payment, ownership, availability, withdrawal, or converted-total claim | `accessible-v1`         | Reserved future additive purpose; unavailable until Phase 18 artifact/renderer and Phase 21 D11/D12/D19 purpose/access certification pass |
| `tribute.notification@1`                  | `governed_business`; Phase 14                                                              | Source-selected tribute recipient with privacy-governed facts                                                                                                         | Recognition notice; no deductible amount or legal-donor claim                                                                                          | `accessible-v1`         | Supported after Phase 14 contract proof                                                                                                   |
| `pledge.statement@1`                      | `governed_business`; Phase 16                                                              | Commitment Party/authorized recipient                                                                                                                                 | Frozen commitment plan, fulfillment and non-debt meaning; never invents balance                                                                        | `accessible-v1`         | Supported after Phase 16 contract proof                                                                                                   |
| `custom.business_document@1`              | `general_custom`; owning Approved Data View                                                | Purpose-approved deterministic recipient                                                                                                                              | Tenant-composed content over safe facts; never official/tax                                                                                            | `accessible-v1`         | Supported only for registered safe data views                                                                                             |

`Specialist Document Obligation` is a durable obligation record, not a generic document purpose. Each native specialty document requires its own future code-owned purpose contract and release evidence. External completion is allowed only with the obligation's exact governed evidence; no generic mark-done path exists.

## U.S. acknowledgment case registry

| Case key                            | Source-owned trigger                                                       | Required protected facts/content                                                              | Structurally forbidden or separate                                                        |
| ----------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `us.cash.under_250@1`               | Eligible posted monetary gift below the single-contribution threshold      | Issuer, legal donor, gift date, amount, required goods/services result                        | No cross-gift aggregation; no deductibility promise                                       |
| `us.cash.250_or_more@1`             | One eligible contribution at or above the federal substantiation threshold | Full acknowledgment facts and required goods/services statement                               | A later combined statement cannot erase item facts                                        |
| `us.quid_pro_quo.over_75@1`         | Gross payment exceeds the disclosure threshold                             | Gross payment, source-owned goods/services description, good-faith value, required disclosure | Disclosure threshold uses gross payment; acknowledgment threshold uses payment less value |
| `us.intangible_religious_benefit@1` | Source proves eligible organization and qualifying benefit                 | Exact protected statement and ordinary gift facts                                             | Staff/template cannot enable; tuition/travel/commercial goods cannot qualify              |
| `us.property_or_market_asset@1`     | Eligible noncash, stock, or digital asset                                  | Approved property description and date                                                        | Donor-facing value, internal valuation, proceeds, appraisal, donor-claimed value          |
| `us.daf_or_pass_through@1`          | Source proves sponsoring/pass-through legal contributor                    | Applicable legal-source acknowledgment                                                        | Advisor/employee/tribute/missionary does not receive a second deductible acknowledgment   |
| `us.qcd@1`                          | Source proves qualified charitable distribution                            | QCD-specific protected wording and facts                                                      | Ordinary deductible totals and ordinary acknowledgment wording                            |
| `us.corrected@1`                    | Source authorizes correction of an issued U.S. acknowledgment              | True issue date, replaced version, corrected facts                                            | Backdating or claiming correction cures a missed deadline                                 |

Boundary values below, at, and above `$75` and `$250` MUST be fixture-tested. Threshold values and protected language are versioned legal-pack data, never template constants.

## U.S. specialist-obligation registry

Launch recognizes, but does not pretend to natively complete, obligations including qualified vehicle reporting/donor copies, Forms 8283, 8282, and 8899, conservation easements, bargain sales, inventory, partial interests, and other proven uncommon duties. Each obligation MUST have a stable key, source/policy revision, reason, owner capability, deadline plus provenance or explicit no-fixed-deadline state, status, evidence requirement, and one next action.

Allowed terminal outcomes are exactly:

- native specialty purpose completed under its qualified contract;
- governed external completion with required evidence; or
- reviewed not-applicable because corrected source facts prove it.

Delete, dismiss, force-close, generic mark-done, indefinite snooze, and bulk close are forbidden.

## Canadian official-receipt case registry

| Case key                 | Required source truth                                                                                                           | Serial and signer                                     | Additional protected rule                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `ca.cash.individual@1`   | Exact issuer, true donor name/address, gift date, amount, issue locality/date, eligibility                                      | New `ca_r_v1` reservation; signer current at issuance | One gift; source-owned eligibility                                                                                             |
| `ca.cash.cumulative@1`   | Exact nonoverlapping source-eligible item set, frozen `annual_cumulative_cash` plan/coverage, and every required item/date fact | One new serial; current signer                        | Phase 7 owns plan/coverage/issuance; Phase 19 freezes the eligible population; coverage cannot overlap prior official receipts |
| `ca.property.non_cash@1` | Property description, source-approved FMV/deemed value, advantage where applicable, eligible amount                             | New serial; current signer                            | Canadian value facts are required and must not inherit the U.S. no-value rule                                                  |
| `ca.advantage.split@1`   | Gift/payment, advantage description and FMV, eligible amount, all required identity facts                                       | New serial; current signer                            | Eligible amount is source-owned, never template-computed                                                                       |
| `ca.replacement@1`       | Source-authorized correction/replacement and predecessor identity                                                               | New serial; signer current at replacement             | Names original serial; states replacement; predecessor retained and canceled atomically after successor proof                  |

The ordinary Québec overlay is one protected presentation/readiness overlay on the same artifact and case, not a parallel product. Any unsupported regime enters the governed specialist path. Exact protected copy remains dark until dated qualified Canadian federal and, where applicable, Québec review approves it.

## Identity policies

### U.S. acknowledgment reference

- Internal identity is opaque and tenant scoped.
- Display is fixed `ACK-XXXXX-XXXXX`.
- Stored token is exactly ten uppercase Crockford Base32 characters generated from 50 unbiased CSPRNG bits; `I`, `L`, `O`, and `U` are not generated.
- Global retained-native-token uniqueness is database enforced. Only the named collision constraint may trigger a fresh candidate; five total candidates are allowed, then fail closed and alert.
- Corrections retain the base and create immutable `vN` publications; only authorized evidence users may resolve a historical version.
- The reference is a locator, never authorization, a sequence, a legal serial, an object key, or encoded tenant/donor/date/amount data.

### Canadian `ca_r_v1` serial

- Scope is the exact full CRA registration account (`BN + RR + four-digit reference`) and active authority interval, not Site, locale, template, currency, or tenant branding.
- Display is fixed `R-` plus an unbounded positive `BIGINT`, padded to at least six digits. It never resets. `R-999999` is followed by `R-1000000`.
- One short issuer-local transaction re-proves authority, locks only that allocator, advances once, and inserts the immutable reservation. Rendering/storage/provider calls occur outside it.
- Allocation states are `reserved`, `issued`, and `not_issued_number_reserved`; receipt validity is independently `current`, `cancelled`, or `replaced`; delivery is separate.
- A reservation is never reused. If official-looking/final bytes existed or may have escaped, uncertainty becomes canceled, not not-issued.
- An exact copy preserves the serial and bytes. A true replacement receives a new serial and cites the canceled predecessor.
- Activation MUST establish a collision-safe starting position for the exact issuer. If continuity cannot be proved without importing external history, activation routes to a qualified specialist; Phase 18 does not build an external-history migration subsystem.

## Output policies

| Policy                  | Required final-byte contract                                                                                                                                                                                                 | Forbidden                                                                                        |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `accessible-v1`         | PDF 1.7 + PDF/UA-1; WCAG 2.2 AA product outcomes; tagged structure; reading order; document/passage language; heading/table/link semantics; alt text; Unicode maps; embedded licensed fonts; contrast; no color-only meaning | A separate accessible copy, tenant downgrade, interactive/executable PDF features                |
| `accessible-archive-v1` | Every `accessible-v1` requirement plus PDF/A-2a, archival metadata and self-containment                                                                                                                                      | A peer archive copy, file encryption of the canonical archival PDF, unproved profile declaration |

Finalization order is fixed: freeze all pins -> render -> perform every byte-changing authorized finalization -> validate the exact final bytes -> hash -> private store -> read back and verify -> atomically promote -> hand exact artifact identity to Phase 17. No byte changes are permitted after validation/hash.

## Structured block registry

| Block key               | Allowed behavior                                                 | Protection rule                                                              |
| ----------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `page@1`                | Size/margins from purpose-supported choices                      | No arbitrary canvas/overflow escape                                          |
| `section@1`             | Flow grouping, keep hints, bounded one/two columns               | Explicit linear reading order required                                       |
| `heading@1`             | Semantic level independent of visual style                       | Cannot skip purpose-required structure                                       |
| `rich_text@1`           | Bounded safe prose, links, lists                                 | Escaped/sanitized; no raw HTML/CSS/script                                    |
| `image@1`               | Approved content-addressed raster/vector asset                   | Alt text or decorative; no remote fetch                                      |
| `fact@1`                | Typed field chip with approved format                            | Stable semantic reference; no path expression                                |
| `money@1`               | Source-owned amount with locale format                           | Cannot calculate or compare legal/money truth                                |
| `summary@1`             | Source-owned named summary                                       | No template aggregation                                                      |
| `table@1`               | Semantic headers and source-owned ordered bounded rows           | No filtering, sorting, joining, grouping, nested repeater, silent truncation |
| `divider@1`             | Decorative separator                                             | Never conveys state alone                                                    |
| `spacer@1`              | Bounded spacing token                                            | No negative margin/overlap                                                   |
| `header@1` / `footer@1` | Purpose-approved repeating content and page fields               | Protected official facts remain mandatory                                    |
| `page_break@1`          | Intentional break/keep hint                                      | Renderer must preserve semantics and prove no dropped content                |
| `official_block@1`      | Code-owned legal/identity/money/serial/correction region         | Managed Truth Rail; smallest protected unit; cannot hide or override         |
| `signer_block@1`        | Canadian signer name/title as text and decorative protected mark | Exact issuer-owned signer only; no template/Brand Kit asset selection        |

The only tenant presentation predicates are `has_value`, `is_empty`, `is_yes`, `is_no`, `is_option`, and `is_not_option`, applied only to contract-permitted optional tenant content. No formula, arbitrary Boolean group, regex, money/date comparison, SQL, GraphQL, JSONPath, code, live query, relationship traversal, or remote fetch is permitted.

## Durable authorities and write ownership

| Authority                              | Owner                                                          | Mutability and Phase 18 rights                                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Document definition draft              | Phase 18                                                       | Mutable through CAS autosave; single-writer UX; conflict creates review/copy, never hidden merge                                                                       |
| Document definition publication        | Phase 18                                                       | Immutable complete executable graph; currentness only through publication head CAS                                                                                     |
| Approved Data View                     | Source owner + Phase 11 field policy                           | Immutable typed semantic contract; Phase 18 reads approved projection only                                                                                             |
| Facts Package                          | Source owner                                                   | Immutable exact values/version/digest; Phase 18 pins and renders, never patches                                                                                        |
| Generation Request                     | Phase 18                                                       | Sole orchestration state machine; immutable pins after atomic admission                                                                                                |
| Render Attempt                         | Phase 18                                                       | Append-only subordinate operational evidence; never document identity/currentness                                                                                      |
| Issuance authorization/validity        | Phase 7/applicable source pack                                 | Optional; source owns whether/why identity is required, issuer/recipient/coverage, validity and correction effect; Phase 18 links/pins                                 |
| Generated-document identity            | Phase 18 D9/D11 code-owned policy                              | Allocates U.S. reference or exact-issuer Canadian serial only after source authorization/admission; owns version/nonreuse/disposition/artifact linkage                 |
| Artifact                               | Phase 18                                                       | Exact immutable bytes/hash/length/object generation/validation/custody evidence                                                                                        |
| Logical-document head                  | Phase 18 projection constrained by source validity             | At most one current eligible publication; CAS only                                                                                                                     |
| Delivery and communication event       | Phase 17                                                       | Phase 18 hands off exact artifact identity; cannot send or infer delivery/read                                                                                         |
| Statement eligibility/subject/facts    | Phase 7/applicable source pack                                 | Phase 19 and Phase 18 consume exact immutable authority; neither may infer, merge, or override it                                                                      |
| Statement participation/population/run | Phase 19                                                       | Tenant-authorized participation and exact source eligibility produce a frozen Run Preflight; Phase 18 accepts item-authoritative generation requests only              |
| Field Account Support-statement facts  | Phase 21 D11/D12                                               | D11 close/manifest stays authoritative; the D12 Approved Data View supplies one immutable purpose- and recipient-safe Facts Package; Phase 18 cannot live-recompute it |
| Field Account statement publication    | Phase 21 D9/D12 profile + current access authority             | Prospective profile permits source admission and presentation only; Phase 18 cannot widen audience, retro-publish history, or treat retained evidence as access        |
| Records schedule/hold/disposal         | Phase 18 for Phase 18 records; source owners for their records | Effective-dated contract; monotonic hold; owner-coordinated disposal; no cross-domain cascade                                                                          |

## Closed state vocabularies

### Generation request

`queued -> generating -> ready`

Alternate transitions: `queued|generating -> needs_attention`; `queued -> canceled`. A transient retry remains the same request and state family. `ready` is terminal for that exact artifact. A successor/correction is a new linked request, never reopening the ready request.

### Render attempt

`claimed -> rendered -> finalized -> validated -> stored -> read_back_verified -> completed`

Any stage may become `failed_transient`, `failed_terminal`, or `outcome_ambiguous`. A fenced successor attempt may start only for the same request/pins. Ambiguous outcome is reconciled before any retry that could duplicate an artifact.

### Artifact

`staged -> validated -> stored_verified -> current`

Alternate states: `quarantined`, `superseded`, `canceled`, `disposed`. Promotion requires exact digest/length/read-back and every purpose-required validator. The object is never overwritten.

Artifact integrity evidence has a separate shared-checkpoint state: `unanchored_pending -> anchored`. Every final artifact digest is submitted to the platform's existing append-only, externally anchored audit-checkpoint capability. Delay alerts the accountable evidence owner and is reconciled without changing artifact identity, issuance, currentness, or authorized access. Phase 18 adds no receipt-only signing service and never labels this platform proof as the human signer's signature.

### Batch and item

Batch status is derived: `preflight`, `queued`, `running`, `completed`, `completed_with_issues`, or `canceled_before_claim`. Item states are authoritative: `ready`, `excluded`, `already_current`, `queued`, `generating`, `successful`, `needs_attention`, or `outcome_ambiguous`. Retry targets eligible failed items only; successful or ambiguous items never rerun blindly.

### Publication appointment

Staff-visible: `scheduled`, `needs_attention`, `published`, `canceled`, `superseded`. At most one unresolved appointment exists per exact publication head. Publish now remains primary. An appointment pins the civil minute, named IANA zone, displayed offset, resolved UTC not-before instant, time-zone-data generation, exact completed approval evidence, and any append-only explicit invalidation. Ordinary reviewer offboarding or unrelated permission change does not erase completed approval. A material later time-zone-data reinterpretation keeps the exact approved UTC instant fixed and moves the appointment to `needs_attention`. Appointment bounds are at least five minutes and no more than five years ahead; transient activation retries stop after 24 hours. No recurrence, auto-revert, scheduled unpublish, or release bundle exists.

### Records disposal

`eligible -> access_restricted -> grace -> final_reproof -> destroying -> backup_or_restore_suppression_pending -> verified_disposed`

Alternate: `needs_records_review`, `held`, or `failed_repairable`. A hold review date escalates but never releases the hold. `verified_disposed` requires every owned copy class to return acceptable evidence and restore-suppression replay proof.

## Normative transition and command tables

The physical table names remain implementation-owned. These commands, guards, outcomes and forbidden transitions do not.

### Definition, draft, commit, publication and head

| Command                     | From                                  | Required guard                                                                               | To/effect                                                                        | Forbidden                                                                                         |
| --------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `create_draft`              | no draft or any retained publication  | Current tenant/definition/purpose capability                                                 | New mutable draft at revision 1                                                  | Editing a publication                                                                             |
| `save_draft`                | mutable draft revision N              | Expected revision N and current policy                                                       | Revision N+1; prior revision evidence retained as required                       | Last-write-wins, protected-node auto-merge                                                        |
| `commit_draft`              | valid draft                           | Complete graph, no structural blocker, expected revision                                     | Immutable committed candidate                                                    | Partial/implicit dependency capture                                                               |
| `record_proof`              | committed candidate                   | Exact synthetic fixture/pipeline identities                                                  | Append-only proof outcome; candidate becomes `ready_for_review` only if complete | Mutating candidate or converting unknown to pass                                                  |
| `approve_candidate`         | proved protected candidate            | Different current authorized human, step-up, exact evidence                                  | Immutable review decision                                                        | Self-approval, waived structural blocker                                                          |
| `publish_candidate`         | proved candidate with required review | Expected head and current live proof                                                         | New immutable publication and atomic head CAS                                    | Mutating old publication, erasing prior head                                                      |
| `withdraw_or_quarantine`    | current/noncurrent publication        | Purpose-owned authority and reason                                                           | Publication becomes ineligible prospectively; evidence retained                  | Changing already-frozen requests/artifacts                                                        |
| `create_draft_from_version` | retained publication                  | Draft capability                                                                             | New draft copy                                                                   | Direct historical reactivation                                                                    |
| `export_native_package`     | authorized definition/version         | Current tenant export capability and exact native package schema                             | Versioned semantic graph plus dependency identities/digests                      | Real data, secrets, artifacts, signer source, authority, review, heads or operational history     |
| `import_native_package`     | validated native package              | Destination tenant capability, integrity/schema check and complete compatibility/loss report | Destination-owned `quarantined` draft                                            | Foreign approximation, silent loss, source authority transfer, proof/review reuse or auto-publish |

### Facts Package

| Command                  | From                         | Required guard                                           | To/effect                                     | Forbidden                                                       |
| ------------------------ | ---------------------------- | -------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `assemble_facts_package` | source-owned candidate facts | Exact tenant/purpose/view/source revision/current policy | One immutable typed package and digest        | Template/renderer database query or patch                       |
| `resolve_exact_replay`   | existing package identity    | Same source revision/view/policy/digest                  | Existing package returned                     | Label/path-based match                                          |
| `reject_changed_reuse`   | existing identity            | Any different pin/value/digest                           | `FACTS_IDEMPOTENCY_CONFLICT`                  | Silent overwrite/version drift                                  |
| `revoke_future_use`      | immutable package            | Safety/privacy/source invalidation                       | Package remains evidence; new admission fails | Mutating bytes/values or retroactively changing issued artifact |

### Source-authorized issuance and Phase 18 document identity

| Command                    | From                                              | Required guard                                                                               | To/effect                                                                                       | Forbidden                                             |
| -------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `admit_issuance_candidate` | no issuance                                       | Source eligibility, exact issuer/recipient/coverage/facts/purpose and issuance authorization | Stable source-authorized candidate identity                                                     | Renderer/template declaring issuance                  |
| `reserve_identity`         | admitted candidate                                | Admitted request plus exact code-owned D9/D11 policy and issuer authority                    | Phase 18 allocates one U.S. reference or exact-issuer Canadian serial and opens its disposition | Preview allocation, caller-supplied identity or reuse |
| `mark_issued`              | reserved identity + verified artifact             | Exact links/fences plus current source issuance validity                                     | Artifact/identity linkage recorded and source-valid issuance projected                          | Render success alone or delivery-as-issuance          |
| `cancel_or_replace`        | issued/candidate                                  | Source correction/withdrawal authorization and applicable D9/D11 identity policy             | Append-only source-effect projection; replacement identity allocated where required             | Delete, overwrite, reuse serial or backdate           |
| `record_not_issued`        | reserved identity without possible official bytes | Phase 18 conservative D9/D11 disposition evidence plus source candidate state                | Allocated identity permanently nonreusable/accounted                                            | Claiming not-issued under final-byte ambiguity        |

### Logical-document revision and current head

| Command                   | From                              | Required guard                                              | To/effect                                                           | Forbidden                                          |
| ------------------------- | --------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| `create_logical_document` | no exact chain                    | Semantic identity uniqueness and source authority           | Stable chain/reference, no current artifact yet                     | Deriving from filename/provider/object             |
| `promote_first_revision`  | no current revision               | Verified artifact and applicable issuance                   | Revision 1 current                                                  | Two current rows                                   |
| `prepare_successor`       | current or source-withdrawn chain | Source correction/replacement authority                     | New linked noncurrent revision/request                              | Editing predecessor                                |
| `promote_successor`       | prepared verified successor       | Expected current head and purpose-specific currentness rule | Successor current; predecessor replaced/canceled as one transaction | Canceling valid predecessor before successor proof |
| `serve_current`           | current authorized chain          | Per-request authorization and artifact health               | Exact current bytes                                                 | Rerender or historical version fallback            |

### Canadian activation

| Command                     | From                    | Required guard                                                                                                                                                                                                     | To/effect                                                                                                                     | Forbidden                                                                                                          |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `start_ca_setup`            | structural absence      | Intentional authorized admin action                                                                                                                                                                                | Sparse non-live setup record                                                                                                  | Country/currency/Site/import/clone auto-enrollment                                                                 |
| `complete_ca_task`          | setup in progress       | Exact task proof and expected setup revision                                                                                                                                                                       | Immutable task evidence; derived readiness updates                                                                            | Editable readiness Boolean                                                                                         |
| `activate_ca_pack`          | all four tasks complete | Exact issuer/proof/pack/signer/serial/records/locale revisions; proved primary and backup location in Canada; production readability/decryption; representative restore; tenant responsibility; final confirmation | New prospective active epoch atomically                                                                                       | Partial/backdated activation, offshore/unproved custody or historical sweep                                        |
| `pause_ca_issuance`         | active epoch            | Authorized repairable reason/effective instant/impact                                                                                                                                                              | Frozen epoch and plan facts continue; generation/issuance held; existing artifacts/access/records remain visible              | Deleting or hiding history, blocking gifts, or treating the pause as a legal lock                                  |
| `lock_ca_authority`         | active/paused           | Confirmed suspension/revocation evidence                                                                                                                                                                           | Legal lock at effective instant; no new issuable plan facts; existing artifacts/access/records remain visible                 | Queuing suspension-period gifts for later receipts or falling through to ordinary policy                           |
| `end_or_reactivate_ca_pack` | active/paused/ended     | Impact/handoff or fresh full proof and continuity                                                                                                                                                                  | Closed interval with no new issuable plan facts, or fresh active interval; historical artifacts/access/records remain visible | Toggle reversal, retroactive queue, reused authority epoch, or ordinary-policy fallback inside the closed interval |

### Canadian signer

| Command                    | From                     | Required guard                                                          | To/effect                                         | Forbidden                                     |
| -------------------------- | ------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------- |
| `stage_signer`             | no signer/current signer | Exact issuer, authorization/consent attestation, sanitized asset, proof | Immutable candidate version                       | Brand Kit/media asset, remote URL, tenant PKI |
| `activate_signer_now`      | valid candidate          | Expected issuer/signer epoch and current proof                          | One current signer atomically                     | Overlapping current intervals                 |
| `appoint_signer_successor` | current signer           | Valid nonoverlap and one-successor constraint                           | At most one ready future successor                | Multiple queue/router                         |
| `revoke_signer`            | current/successor        | Authority loss and effective instant                                    | Fence future issuance; historical bytes unchanged | Rerendering or invalidating exact old receipt |

### Canadian serial

| Command                       | From                        | Required guard                                                          | To/effect                                                      | Forbidden                                                     |
| ----------------------------- | --------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| `reserve_ca_serial`           | admitted issuance candidate | Exact active issuer epoch, continuity, facts/coverage/publication proof | Atomic allocator advance + immutable `reserved` ledger row     | Batch range allocation, rendering in lock, reset/manual value |
| `reuse_exact_reservation`     | existing reservation        | Same issuance identity and fingerprint                                  | Same serial returned                                           | Changed-fingerprint dedupe                                    |
| `issue_reserved_serial`       | reserved                    | Verified artifact and source issuance commit                            | Allocation `issued`; receipt validity `current`                | Delivery event as issue                                       |
| `disposition_reserved_serial` | reserved                    | Recovery conclusively ended                                             | `not_issued_number_reserved` or conservative canceled evidence | Reuse/delete/missing disposition                              |
| `replace_ca_receipt`          | current receipt             | New reservation + verified successor + expected predecessor             | New serial current; predecessor canceled/replaced atomically   | Old-serial rerender                                           |

### Recipient grant and session

| Command                      | From                                   | Required guard                                                                         | To/effect                                                  | Forbidden                                              |
| ---------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------ |
| `mint_recipient_grant`       | current recipient epoch/document       | Purpose route, mailbox/recipient authority, exact current lineage                      | Selector + HMAC-held 256-bit fragment verifier evidence    | Token in DB/log/path/query; arbitrary address          |
| `preflight_grant`            | active grant                           | Inert `GET`/`HEAD`/selector only                                                       | No facts, session or consumption                           | Side effect or existence leak                          |
| `redeem_grant`               | active grant                           | Same-origin CSRF-protected deliberate POST, verifier, current authority                | Bounded receipt-only session; first-use sibling retirement | Treating scanner/preflight as intent/identity          |
| `authorize_artifact_request` | authenticated portal or active session | Reprove tenant/issuer/Party/epoch/purpose/lineage/artifact on every full/range request | Exact bytes/range from one generation                      | Raw object URL or cached authorization                 |
| `reissue_or_revoke_grant`    | active/failed grant                    | Fixed authoritative destination or security authority                                  | Bounded handover or immediate revoke                       | More than incumbent+newest usable, arbitrary recipient |

### Specialist Document Obligation

| Command                        | From        | Required guard                                 | To/effect                               | Forbidden                         |
| ------------------------------ | ----------- | ---------------------------------------------- | --------------------------------------- | --------------------------------- |
| `upsert_specialist_obligation` | absent/open | Stable source/policy/duty identity             | One deduplicated open obligation        | Default cash case or lossy merge  |
| `update_deadline_evidence`     | open        | Source/policy revision and provenance          | Append-only deadline/current projection | Free-form invented due date       |
| `complete_native`              | open        | Qualified native purpose and artifact/evidence | Completed with immutable native proof   | Generic mark done                 |
| `complete_external`            | open        | Contract-required external evidence            | Completed externally with provenance    | Free-text checkbox                |
| `mark_not_applicable`          | open        | Reviewed corrected source facts                | Terminal not-applicable evidence        | Dismiss/delete/snooze/force close |

### Records hold

| Command                   | From                            | Required guard                                                 | To/effect                                                     | Forbidden                                |
| ------------------------- | ------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------- |
| `place_hold`              | retained/nonirreversible record | Capability, typed basis/scope/owner/evidence/start/review date | Active monotonic hold; access unchanged/restricted separately | Staff note as hold                       |
| `review_hold`             | active hold                     | Current owner/evidence                                         | Append-only review and next review date                       | Automatic release at review date         |
| `release_hold`            | active hold                     | Explicit authorized release evidence                           | Released transition; schedule re-evaluated                    | Deleting hold history or widening access |
| `serialize_with_disposal` | active/placement race           | Same record guard and irreversible boundary                    | Exactly hold wins or destruction wins truthfully              | Successful hold recorded after destroyed |

### Records administration and Canadian custody closure

| Command                                 | From                                        | Required guard                                                                                                      | To/effect                                                                                              | Forbidden                                                                                          |
| --------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `transition_schedule_contract`          | current effective Records Schedule Contract | Qualified reviewed successor, bounded impact set, expected prior version, effective date, idempotency identity      | Effective-dated successor plus idempotent recalculation; each prior schedule/trigger decision retained | Silent historical rewrite, indefinite obsolete rule, duplicate effect, or immediate mass deletion  |
| `set_retention_extension`               | current effective Records Schedule Contract | Records capability, exact purpose-contract option, expected schedule version, documented basis                      | Audited bounded extension; disposition projection recalculated                                         | Weakening floor, unsupported option, unreviewed ceiling breach, forever, per-document timer/delete |
| `begin_canadian_custody_offboarding`    | activated Canadian issuer                   | Authorized closure intent and exact issuer/records/hold versions                                                    | One restricted `closure_pending` case; ordinary access remains until a valid path completes            | Nonparticipant case/work, cascade delete, stranded records                                         |
| `complete_canadian_custody_offboarding` | `closure_pending`                           | Verified destination transfer preserving issuer/history/holds OR explicit restricted records-only custody agreement | Append-only proof and `closed_to_ordinary_access`; required custody remains readable and controlled    | Unproved destination, lost hold/history, ordinary closure before custody proof                     |

### Publication appointment

| Command                                | From                                                | Required guard                                                                                                                            | To/effect                                                                          | Forbidden                                                                          |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `schedule_publication`                 | ready candidate/head without unresolved appointment | Exact candidate/head/review, 5-minute to 5-year valid civil time and time-zone-data generation                                            | Immutable `scheduled` appointment                                                  | Prefilled arbitrary time, second pending successor                                 |
| `reschedule_publication`               | scheduled                                           | New exact human decision and protected review where required                                                                              | Old appointment superseded; new immutable appointment                              | In-place time mutation                                                             |
| `publish_now_instead`                  | scheduled                                           | Same candidate and publish reproof/CAS                                                                                                    | One head advance; appointment superseded                                           | Later timer action                                                                 |
| `resolve_different_candidate_conflict` | scheduled plus a different ready candidate          | Explicit `keep_scheduled` OR `publish_now_and_cancel_scheduled`, current proof/review/head CAS                                            | No change, or one atomic different-candidate publish plus appointment cancellation | Silent appointment rebase or two future/current winners                            |
| `invalidate_approval`                  | scheduled                                           | Scoped security/governance authority, documented compromise/unauthorized approval/rescission/incident evidence                            | Append-only invalidation; `needs_attention`; publishes nothing                     | Ordinary offboarding/permission change as invalidation; deleting approval evidence |
| `cancel_appointment`                   | scheduled/needs attention                           | Current publication capability and concise reason                                                                                         | `canceled`; publishes nothing                                                      | Canceling independent safety obligation                                            |
| `activate_due_appointment`             | due scheduled                                       | Due barrier, finite current reproof, no approval invalidation, unchanged material civil-time interpretation, expected head, database time | One atomic head advance and `published`                                            | Clock-only/early/partial publish                                                   |
| `fail_or_expire_recovery`              | due but blocked/transient                           | Stable cause or 24-hour transient ceiling                                                                                                 | `needs_attention`; prior compatible head retained; no late surprise                | Force publish or indefinite retries                                                |

## Stable cause codes and HTTP projection

Service errors use stable machine codes, safe plain-language titles, `cause_owner`, `retryability`, and an optional authorized `repair_action`. They MUST NOT contain donor values, rendered content, secrets, raw provider errors, SQL, paths, stack traces or object URLs.

| Code family / examples                                                                                     | HTTP projection                                                                                          | Retry/repair semantics                                                                     |
| ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `AUTH_REQUIRED`, `AUTH_FORBIDDEN`, `OBJECT_NOT_AVAILABLE`                                                  | `401`, `403`, or nonrevealing `404` according to established auth boundary                               | Never reveal cross-tenant/object existence; reauthenticate or evidence-bound recovery only |
| `REVISION_CONFLICT`, `HEAD_CONFLICT`, `IDEMPOTENCY_CONFLICT`, `APPOINTMENT_CONFLICT`                       | `409 Conflict`                                                                                           | Refresh/review exact conflict; never automatic overwrite/rebase                            |
| `INPUT_INVALID`, `PURPOSE_UNSUPPORTED`, `FACTS_INCOMPATIBLE`, `TIME_INVALID`                               | `422 Unprocessable Content`                                                                              | Correct named safe field/source; no retry without change                                   |
| `SOURCE_FACTS_MISSING`, `SOURCE_ROLE_AMBIGUOUS`, `ISSUER_NOT_READY`, `SIGNER_NOT_READY`, `LEGAL_PACK_DARK` | `409` for command; safe `needs_attention` projection for reads                                           | Cause-owned repair; affected purpose only remains dark                                     |
| `PUBLICATION_NOT_COMPATIBLE`, `NO_COMPATIBLE_PUBLICATION`, `PROOF_STALE`, `VALIDATION_FAILED`              | `409` command; `503` only for genuinely unavailable service read                                         | Fix publication/proof; no draft/downgrade/substitution                                     |
| `REQUEST_ALREADY_COMPLETE`                                                                                 | `200` exact existing result                                                                              | Idempotent success, never duplicate                                                        |
| `REQUEST_IN_PROGRESS`, `BATCH_IN_PROGRESS`, `DISPOSITION_IN_PROGRESS`                                      | `202 Accepted` plus stable status URL/identity                                                           | Poll/subscription uses authorized projection; no provider job URL                          |
| `RENDER_TRANSIENT`, `STORAGE_TRANSIENT`, `DEPENDENCY_TRANSIENT`                                            | `202` while bounded automatic recovery remains; `503` only at synchronous edge                           | Same pins only; `Retry-After` when meaningful; terminal transition after budget            |
| `OUTCOME_AMBIGUOUS`                                                                                        | `202` or `409` by command context                                                                        | Reconcile; never rerun blindly or create successor                                         |
| `ARTIFACT_CORRUPT`, `ARTIFACT_UNAVAILABLE`, `RECORDS_REVIEW_REQUIRED`, `HOLD_ACTIVE`                       | Nonrevealing `404/409/423` only where repo conventions support them; product projection is authoritative | Exact repair/records owner; never rerender plausible copy                                  |
| `RATE_LIMITED`                                                                                             | `429 Too Many Requests`                                                                                  | Tenant/actor scoped, safe `Retry-After`, no cross-tenant signal                            |
| `SERVICE_UNAVAILABLE`                                                                                      | `503 Service Unavailable`                                                                                | Bounded same-operation retry; no provider/fallback authority                               |

Creation commands return `201` only when a new durable aggregate was created; exact idempotent replay returns `200`; asynchronous admission returns `202` with the stable Asym resource, never a provider identifier. Successful no-body commands may return `204`. Download/full/range behavior follows HTTP semantics (`200`, `206`, satisfiable `Content-Range`, `416`) while binding all ranges to the same authorized object generation.

Every protected HTML, redirect, denial/error, full PDF and range response MUST include `Cache-Control: private, no-store, no-transform, max-age=0`, `CDN-Cache-Control: no-store`, and `Vercel-CDN-Cache-Control: no-store`, plus `X-Content-Type-Options: nosniff`; PDF responses use a safe filename and `application/pdf`. Guest HTML/error responses use a restrictive first-party CSP and no third-party resources, analytics or service worker. Tests MUST prove effective deployed behavior through Vercel/CDN, not merely route-object headers.

## Publication resolution and freeze

The server resolves configured assignment/inheritance first. Recovery is evaluated only when the expected primary is unusable. The closed shallow order is fixed and code-owned: first evaluate at most one affirmatively current-compatible prior publication at the same exact scope and locale; only if it is absent or incompatible, evaluate at most one exact-locale, purpose-permitted ancestor publication. The first compatible candidate wins, so a both-compatible case deterministically selects the same-scope prior. Sibling-Site, protected Asym system publication, arbitrary history, fragments, drafts, downgraded profiles, other renderers, and foreign tenant/issuer/locale candidates are forbidden.

Resolution plus request freeze is one logical admission command. A compatible alternative is ordinary `Ready`; only accountable staff see a quiet secondary source line. After freeze, every retry uses identical publication, purpose, facts, locale, assets, fonts, renderer/profile, authorization and safety pins. Safety may stop work but may not substitute or mutate it.

## Access and exact-byte contract

- Every portal, guest, staff, support, missionary, print, full-file, and range request re-proves current tenant/environment/issuer, Party/representative, recipient authorization epoch, purpose, logical-document state, lineage, capability, and artifact health.
- The application streams the exact private object through an Asym boundary with `Cache-Control: private, no-store, no-transform, max-age=0`, `CDN-Cache-Control: no-store`, `Vercel-CDN-Cache-Control: no-store`, `X-Content-Type-Options: nosniff`, safe `Content-Disposition`, a fixed PDF media type, no transformation, and range consistency bound to one object generation.
- No provider URL, Supabase signed URL, selector, public reference, filename, or email address grants artifact access.
- The optional guest route reuses Phase 17's protected-action primitive: public URL contains only a non-secret selector; an independent 256-bit verifier stays in the fragment, is removed from history, and is submitted only by deliberate same-origin CSRF-protected `POST`. `GET`/`HEAD`/scanner activity returns no document facts and consumes nothing.
- Default evidence target is a disclosed 14-day grant and 30-minute receipt-only session, subject to production evidence. Routine reissue uses bounded first-use-wins handover; security revocation is immediate.
- Donors see one current document action. Missionaries have no tax-document access by default. Staff never type an arbitrary resend address or see bearer material.

## Canadian activation and signer contract

No enrollment is a structural absence: no Canadian UI, rows, queries, jobs, exports, warnings, metrics, storage, cryptographic work, donor question, or meaningful performance cost.

An authorized administrator intentionally opens one four-task setup: **Verify your registered charity**; **Authorize receipts and records**; **Review appearance and languages**; **Confirm history and activation**. Activation binds one exact issuer, pack version, proof digest, signer, serial-continuity decision, records posture, locale proof, and prospective effective interval by CAS. Routine eligible cash becomes automatic; genuine exceptions alone enter `Needs attention`.

The records posture is finite and production-shaped: required primary and backup custody locations are proved in Canada; the exact retained object is readable and decryptable in production; a representative restore succeeds; and tenant responsibility during service and at closure is explicit. Missing or stale proof blocks only Canadian activation/new official issuance. Nonparticipants perform none of these checks.

One current signer and at most one ready future successor are permitted. The signer mark is a sanitized private PNG/JPEG unavailable to Brand Kit, templates, media libraries, support signatures, exports, or another tenant. Name/title remain accessible text; the image is decorative. No tenant certificates, PKI console, annual renewal, per-receipt ceremony, drawing tool, or mandatory Asym per-receipt cryptographic signature ships.

Repairable proof loss pauses only new official issuance. Confirmed CRA suspension/revocation enforces the applicable effective lock and donor disclosure; suspension-period gifts are not queued for retroactive receipts. Pause/lock/end/reactivation use audited effective intervals, never fall through a Canadian locked/ended interval to ordinary policy, and never delete or hide existing receipts, artifacts, access, or records or recycle serials.

## Retention, hold, custody, and disposal contract

Records Schedule Contracts classify exactly: canonical artifact/official duplicate; issuance identity/lifecycle; source-owned financial facts; template/render-validation evidence; delivery/access/security evidence; privacy/hold/disposal evidence; and temporary authoring/render material. Incident records remain with the incident authority.

Each schedule separately states preservation floor, privacy ceiling, source-owned trigger, bounded tenant extension, custody/location, access restriction, hold, recovery, and disposal. A conflict becomes `Needs records review`, with restricted access and no guessed deletion or forever retention. Access revocation, profile erasure, restricted lawful custody, hold, and physical disposal are independent.

A later law, policy, or provider change never mutates prior schedule evidence in place. A qualified review creates one effective-dated successor, a bounded explicit impact set, and an idempotent expected-version recalculation while each record retains the schedule version and trigger facts that governed the earlier decision. If the successor shortens retention, affected records enter the ordinary grace, final-reproof and verified-disposal lane; there is no immediate bulk deletion.

Permissioned records staff see one quiet projection of controlling purpose, authority, dates, schedule version, explanation, contract-enumerated extension choices, holds and custody/disposition evidence export. Extensions require the exact allowed option, expected schedule version and documented basis. They cannot weaken a floor, exceed a ceiling without reviewed lawful authority, choose casual forever, set a per-document timer, or directly delete an official object.

For an activated Canadian issuer only, service closure enters one restricted custody case and may end ordinary application access only after either verified destination-custody transfer preserving issuer identity, document/serial history and all holds, or an explicit restricted records-only custody agreement. The proof is append-only and the retained records remain readable and governed. A tenant that never enrolled has no closure UI, row, query, job, warning or cost.

Phase 18 destroys only its owned artifacts/derivatives/evidence and coordinates with source owners; it never cascades into ledger, contribution, Party, restricted-worker, or Phase 17 communication truth. Hidden recovery/WORM copies are custody of the same exact artifact, not peer documents. Restore MUST replay the forward-only PII-minimized disposition-suppression journal before reads or workers reopen.

The separately scheduled minimal disposition proof may retain only record class, tenant/issuer, schedule version, reason code, operation/time, copy-class outcomes, and the narrow D11 identity disposition needed to prove nonreuse. It MUST NOT retain names, addresses, amounts, filenames, storage paths, rendered content, raw Party IDs, or raw hashes. A raw hash is still identifying/linkable evidence, not automatic anonymization.

## Release-stop assertions

Production MUST remain blocked for the affected capability when any of the following is true:

1. D3 yields no single qualified renderer.
2. Required PDF/UA, PDF/A, font-license, sandbox, determinism, final-byte, or load evidence fails.
3. Current qualified U.S. or Canadian/Québec legal, finance, signer, records, privacy, security, accessibility, or delivery review is absent.
4. Issuer, serial, signer, source facts, issuance authority, or purpose coverage is unresolved.
5. Hash, byte length, immutable object generation, private storage, read-back, exact-byte serving, or shared audit-checkpoint submission/reconciliation proof is absent.
6. Tenant/issuer/Party isolation, authorization, bounded retention extension, Canadian primary/backup custody/readability/decryption/representative restore/offboarding, hold, restore, disposal, fairness, or recovery proof fails.
7. The D17 environment assertion discovers any real production tenant, irreplaceable customer data, externally relied-upon artifact/history, or production dependency.

No staff override, feature flag, fallback renderer, draft, mutable template, direct database write, or delivery action may bypass these assertions.

## Explicit anti-overengineering boundary

Build one bounded relational module, semantic editor, publication lifecycle, qualified renderer port, request state machine, exact-PDF finalizer, private custody/access boundary, timeline, and grouped repair surface. Include only the narrow Asym-native authoring package above. Do not build legacy/foreign import or migration, dual reads/writes, a Word/Canva clone, arbitrary query/formula/rules language, event-sourcing platform, microservice fleet, multi-renderer runtime, tenant legal DSL, workflow engine, release calendar, generic records/eDiscovery system, file-sharing product, identity platform, PKI console, second delivery history, or second statement population engine.

## Dated Phase 21 D26 records-export boundary (2026-08-02)

Phase 18 remains the sole resolver for generated-document purpose, issuer,
Facts Package admission, Logical Document, exact artifact generation and
currentness, recipient access, correction, Records Schedule Contract, hold,
Canadian records posture, and verified disposition. A Phase 21 D26 export
request must ask Phase 18 for one current-authorized exact copy or an explicit
owner-domain reference and record the result in D26's Coverage Manifest.

D26 cannot publish, rerender, reclassify, retain, release, hold, dispose, or
certify a Phase 18 artifact. Missing, lawfully disposed, quarantined,
unavailable, or unauthorized Phase 18 bytes receive their truthful manifest
disposition and are never called included or silently regenerated. A D26
records archive is not a donor document, document delivery, Canadian closure
substitute, Phase 19 fulfillment package, or generic generated-document backup.
