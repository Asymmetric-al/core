# Phase 18 Cross-PRD and Clean-Cut Congruence — 2026-07-21

- **Verdict:** GREEN for specification. The predecessor, program-document, ADR, OpenSpec, and normative [Renderer Qualification Protocol](./phase-18-renderer-qualification-protocol.md) amendments named below land atomically in this package; implementation still must pass the listed closure checks.
- **Dispatch posture:** PRD exists; epic #907 and children #908–#961 are
  published. The separately approved frontier #908–#910 is `status:todo` +
  `ready-for-agent`; #911–#961 remain `status:blocked`. This specification
  claims no implementation and authorizes no further dispatch.

## Authority and reconciliation rule

Phase 18 D17 is the latest controlling decision for receipt/PDF runtime architecture: one clean canonical `pdf_*` system, no legacy runtime or migration product, and an environment-gated destructive pre-production cutover. It supersedes earlier active wording that would preserve, import, shadow, backfill, federate, or fall back to prototype paths.

D17 does not supersede the durable authorities from earlier phases: Phase 7 receipt/statement facts and issuance, Phase 10 restricted-person rules, Phase 11 field policy, Phase 12 capabilities, Phase 13 posted money, Phase 14 tribute meaning, Phase 16 commitment truth, Phase 17 delivery, Phase 19 statement population/runs, Phase 29 general files/custody future, or Phase 38 donor-wide privacy orchestration.

## Canonical ownership map

| Concern                                                                                                         | Owner    | Phase 18 relationship                                                              |
| --------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------- |
| Legal donor, receipt/statement eligibility, tax facts, correction/void/replacement effect and optional issuance | Phase 7  | Consumes immutable facts and authority; never derives from renderer/artifact/email |
| Restricted worker and publication privacy                                                                       | Phase 10 | Applies strictest policy to visible and hidden PDF/metadata/access surfaces        |
| Native/custom field identity, type, classification and egress                                                   | Phase 11 | Reuses catalog through Approved Data Views; no second catalog                      |
| Capabilities and separation of duties                                                                           | Phase 12 | Reuses server authorization/step-up; no role engine                                |
| Posted designation/ledger/money truth                                                                           | Phase 13 | Renders only; never owns totals or accounting state                                |
| Tribute/recognition recipients and privacy                                                                      | Phase 14 | Renders only source-selected meaning/recipient                                     |
| Recurring/fixed commitment and fulfillment                                                                      | Phase 16 | Renders source-owned non-debt truth                                                |
| Message wrapper, protected action primitive, outbox/provider/communication history                              | Phase 17 | Receives exact artifact identity; owns send/retry/delivery evidence                |
| Statement population, cutoff, schedule and run recovery                                                         | Phase 19 | Requests item-authoritative generation; Phase 18 alone renders/stores              |
| General files and later custody abstraction                                                                     | Phase 29 | Does not absorb generated-document identity/currentness/evidence                   |
| Donor-wide privacy/erasure case                                                                                 | Phase 38 | Coordinates owner outcomes; Phase 18 disposes only its records                     |

## Required predecessor amendments

### Phase 7 — Receipt & Statement Compliance Rules + Donor Identity/Credit Model

Preserve source-owned immutable facts, legal donor, eligibility, correction/void/supersession and issuance authority. Amend active implementation shorthand:

- Replace any claim that a complete render layer already ships or needs additive compatibility migration. Current code is prototype evidence; Phase 18 supplies the sole clean runtime.
- Replace generic per-tenant/gapless Canadian numbering with jurisdiction-specific identity: U.S. `ACK-XXXXX-XXXXX` plus immutable `vN`; Canadian exact-issuer `R-` lifetime series with nonreuse/accounted dispositions and new-serial replacements. Do not call Canada mathematically gapless.
- Replace any rule that ACH `processing` can issue a receipt. Phase 16 controls recurring ACH: initiation/processing is not payment success; only source-confirmed success posts and becomes acknowledgment/receipt eligible.
- Preserve Phase 7 facts for annual statements but assign population/cutoff/run orchestration to Phase 19 and rendering/archive to Phase 18.
- Replace additive/shadow migration language for current prototypes with D17's gated destructive pre-production cut.
- Preserve the three-document DAF/pass-through wall and source-fact/renderer wall.
- Replace generic January 31 contemporaneous wording with the qualified U.S. rule: January 31 may be a service target; contemporaneous evidence is based on the applicable donor filing/return due rule and current qualified review.

### Phase 10 — Restricted Worker / Publication

No authority transfer is needed. Phase 18 MUST apply Phase 10 alias/withholding/publication policy to template field discovery, synthetic fixtures, real generation, visible text, accessibility text, metadata, bookmarks, filenames, logs, exports, storage and every role projection. Historical bytes are immutable; a current safety change may deny future access/generation and require source-owned correction, never silently rewrite bytes.

### Phase 11 — Data Model / Custom Fields

No second merge-field catalog or per-template permission matrix is allowed. Phase 18 consumes stable semantic IDs, types, classification, recipient binding, synthetic samples and egress policy. `Available in documents` is an audited narrowing only. Type/meaning/privacy changes require impact and new proof; label changes do not break bindings.

### Phase 12 — Roles and Capabilities

Map draft/edit, publish-standard, submit-protected, review-protected, manage publication schedule, generate, correct/replace, access artifact, manage Canadian issuer/signer, inspect serial register, manage holds/disposition and inspect technical evidence onto explicit capability atoms. Enforcement is server-side and tenant/issuer/object scoped. D5/D16 protected review requires a different authorized human and step-up; no new role/policy engine ships.

### Phase 13 — Campaign, Designation, Contribution Ledger & Giving Cart

Preserve posted line-level money, designation aliases, legal-donor facts and tenant isolation. Phase 18 consumes exact source-owned Facts Packages and cannot recompute eligible/deductible/advantage/fulfillment totals. Remove `gift_receipt_records.status` and other prototype receipt carriers as document/receipt authority. Specialist form facts/clocks remain source-owned; Phase 18 owns only the governed obligation/document presentation.

### Phase 14 — DAF, Matching, Tribute and Recognition

Preserve DAF/tribute/matching/recognition facts, recipients and privacy. Phase 18 supplies the PDF purpose where approved; Phase 17 supplies the communication. An advisor, employee, tribute recipient or missionary cannot receive a second tax acknowledgment.

### Phase 16 — Pledges & Recurring Commitments

Preserve commitment Party/roles, line/occurrence fulfillment, schedule and payment finality. A pledge statement is a Phase 18 governed document over a Phase 16 Facts Package, not a balance calculator. ACH processing receives Phase 17 initiation copy, not an official Phase 18 receipt. Phase 16 recurring state messages continue through Phase 17.

### Phase 17 — System Messages & Template Management

Preserve the one communication spine and boundary: Phase 18 owns official/current artifact; Phase 17 owns editable surrounding message, protected action presentation, outbox/provider/evidence and resend. A send retry references exact artifact identity and never rerenders/substitutes it. Recent sent copy/communication history never stores official PDF bytes or becomes archive/issuance truth.

D13 requires one successor amendment to the protected-action contract. The shared primitive MUST use a non-secret selector plus an independent 256-bit verifier in the fragment; inert `GET`/`HEAD`; deliberate same-origin CSRF-protected `POST`; removal from history; no selector-only facts/consumption; and recipient-bound revocable session. This replaces any earlier first-GET secret-handle/cookie exchange that cannot coexist with the fragment protocol. The primitive remains Phase 17-owned; Phase 18 supplies current recipient/artifact resolution.

Every protected Phase 18 HTML, redirect, denial/error, full PDF and range response MUST set `Cache-Control: private, no-store, no-transform, max-age=0`, `CDN-Cache-Control: no-store`, and `Vercel-CDN-Cache-Control: no-store`; deployed CDN tests are required.

### Phase 19 — Statements and Batch Runs

Phase 7 and the applicable source pack own statement eligibility, Statement Subject, facts, coverage, and receipt plan. Phase 19 owns tenant-authorized participation, frozen population, cutoff, run scheduling, items, and run-level recovery. Phase 18 owns one immutable Facts Package/request/artifact per item. A Phase 19 batch pins one complete publication graph, displays a known Phase 18 publication appointment inside its planned window, preserves item-authoritative mixed outcomes and invokes retry-failed-only. Phase 19 does not render or store a competing statement artifact.

### Phase 29 — General Files

Keep general file management separate. Phase 18 generated artifacts, logical-document head, corrections, exact custody and records evidence remain authoritative. Phase 18 may expose a narrow provider-neutral custody port that Phase 29 can later adopt, but it must not duplicate registry/currentness or present hidden recovery/WORM objects as files.

### Phase 38 — Privacy

Phase 38 owns the donor-wide privacy case. Phase 18 returns a document-specific idempotent outcome separating access/profile removal, restricted lawful retention, hold and physical disposal. It never cascades into Party/ledger/receipt facts/communication history and never describes restricted retained records as deleted.

## Active OpenSpec conflict requiring replacement

The active `add-statement-studio` change is architecturally superseded where it:

- treats current Studio/receipt/text routes as migration inputs;
- makes current `pdf_*` a legacy migration base rather than a clean final bounded context;
- selects DocRaptor before D3 qualification;
- retains Unlayer as a compatibility fallback;
- chooses annual giving as the first job irrespective of the Phase 18 tracer dependency graph;
- leaves receipt carriers outside Studio for later reconciliation;
- keeps live `.txt` and direct receipt paths;
- forbids destructive replacement merely because hosted-state evidence was unknown; or
- requires backfill/shadow/legacy adapters.

The Phase 18 OpenSpec delta MUST replace those active forward requirements with candidate-neutral D3 qualification, D17 environment assertion, one canonical schema/service/runtime, direct removal of prototypes, and stop-the-line behavior if the no-production premise is false. Do not keep contradictory active requirements side by side.

The `outbound-communications` protected-action requirement and the Phase 17 ADR that owns it MUST receive the D13 successor amendment described above.

## Program-document corrections

Update all active Phase 18 surfaces to the same wording:

- roadmap Phase 18 describes one clean canonical system, not three-model migration;
- Canadian numbering is unique/nonreused/accounted, not mathematically gapless;
- Phase 18 owns one PDF and same-facts HTML status/detail; Phase 17 owns the separate delivery email;
- renderer, U.S. religious-benefit breadth and Canadian scope are resolved by D3/D8/D10 rather than open founder questions;
- Phase 19 owns run timing; January 31 is not expressed as a universal federal deadline;
- exact current copy preserves bytes/serial; a changed Canadian receipt uses formal new-serial replacement;
- Phase map says Phase 19 selects/runs and Phase 18 alone renders/stores; and
- parity matrix says specified/not built, removes stale ACH-processing receipt finality and records the D17 clean cut.

Ticket posture everywhere is **epic #907 and children #908–#961 published**:
#908–#910 are the explicitly approved `status:todo` + `ready-for-agent`
frontier, while #911–#961 remain `status:blocked`. Published tickets and
frontier labels are planning/dispatch state, not proof that implementation
exists, and this contract does not authorize further dispatch.

## D17 clean-cut closure map

| Prototype/current path                                 | Final disposition                                                                                                                    | CI/acceptance closure                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Donor live receipt `.txt`                              | Delete; portal calls logical-document/current-artifact access                                                                        | Route/export inventory and donor E2E reject live generation |
| Donor live annual statement `.txt`                     | Delete; Phase 19 requests Phase 18 artifacts                                                                                         | Same public seam and exact-byte tests                       |
| Staged-gift hard-coded receipt send                    | Delete direct generation/send; source fact/outbox goes through Phase 18 then Phase 17                                                | Forbidden symbol/route and outbox tracer                    |
| `contribution_receipt_snapshots` prototype             | Remove from the target schema and runtime entirely; no import, backfill, compatibility view, dual read/write, or historical rerender | Schema/type/query/forbidden-symbol inventory                |
| `gift_receipt_records` scaffold and placeholder output | Remove                                                                                                                               | Fresh reset and forbidden schema/symbol checks              |
| Mutable PDF root content/status/current pointers       | Replace with draft/commit/publication/head/CAS                                                                                       | Direct-write denial and concurrency tests                   |
| Direct native preview/render production route          | Preview becomes synthetic proof only; production calls Generated Document service                                                    | Route contract and no browser production facts              |
| DocRaptor-as-selected provider                         | Remove selection claim; run D3 contest                                                                                               | No-winner dark assertion and one-winner evidence            |
| Unlayer/native switch and migration reports            | Delete                                                                                                                               | Dependency/symbol/UI/test inventory                         |
| Provider URL as artifact truth                         | Delete; private opaque exact-byte access only                                                                                        | Object substitution/cache/range tests                       |
| Duplicate receipt/document statuses                    | Replace with separated source issuance, request, artifact, delivery, access and records axes                                         | State projection tests                                      |

No compatibility flag, dual writer/reader, alias, generic importer, legacy archive, migration report, repair workbench or backfill is created.

## Environment-gated destructive cutover

Before any destructive change, an authorized run records and signs/hashes:

- environment identity and production classification;
- tenant/user/row/object counts for every affected prototype table/bucket/path;
- evidence of external URLs/integrations/jobs/reports and retained artifact/history reliance;
- schema/code/deployment version and exact destructive plan;
- fresh reset/rebuild and rollback-before-first-canonical-write procedure; and
- named owner/go-no-go approval.

The allowed outcome is either:

1. **Clean pre-production proof:** no real production tenant, irreplaceable data/artifact/history or external reliance; proceed with direct deletion/replacement and record closure; or
2. **Stop the line:** any contrary evidence ends destructive work before mutation and requires explicit re-grooming. The implementation may not improvise migration.

After the first canonical official artifact is issued, rollback is forward repair or rebuild from canonical evidence; it never restores an obsolete writer or copies canonical truth backward.

## Published-issue dispatch dispositions (documentation only)

This package does not mutate GitHub. The following open issues contain
implementation instructions that conflict with Phase 18. Their affected scope
is **blocked from dispatch** until the issue body is amended to the controlling
owner split or the issue is closed and replaced. Existing blocked labels are not
authorization to implement stale text.

```yaml
schema: sitestacker.issue-dispositions.v1
authority: phase_18
github_mutation_performed: false
disposition_for_every_listed_scope: superseded_by_phase_18
dispatch_for_every_listed_scope: blocked_from_dispatch
unblock_condition: issue_body_reconciled_to_phase_18_or_issue_closed_and_reissued
issues:
  - issue: 576
    scope: ach_processing_receipt_and_tenant_hold_toggle
    replacement_owner: phase_7_source_finality_and_phase_18_artifact
  - issue: 578
    scope: mathematical_gapless_canada_and_base_number_reuse
    replacement_owner: phase_18_identity_and_serial_lifecycle
  - issue: 580
    scope: statement_run_orchestration
    replacement_owner: phase_19_run_and_phase_18_item_artifact
  - issue: 581
    scope: document_delivery
    replacement_owner: phase_17_delivery_and_phase_18_exact_artifact
  - issue: 583
    scope: portal_artifact_access_and_additive_legacy_path
    replacement_owner: phase_18_current_head_and_authenticated_access
  - issue: 585
    scope: additive_migration_and_legacy_compatibility
    replacement_owner: phase_18_d17_clean_preproduction_cutover
  - issue: 719
    scope: affected_document_clauses_only
    replacement_owner: phase_7_facts_phase_17_delivery_phase_18_artifact
  - issue: 722
    scope: affected_document_fact_wall_and_renderer_clauses
    replacement_owner: phase_17_message_and_phase_18_document_seams
  - issue: 730
    scope: affected_template_and_generated_document_clauses
    replacement_owner: phase_17_message_and_phase_18_document_seams
  - issue: 733
    scope: signed_or_provider_url_artifact_access
    replacement_owner: phase_18_exact_authenticated_access
  - issue: 740
    scope: affected_document_test_seams
    replacement_owner: phase_17_delivery_and_phase_18_artifact_tests
  - issue: 905
    scope: source_owned_phase_7_receipt_artifact_tracer
    replacement_owner: phase_7_source_issuance_plus_phase_18_exact_artifact
  - issue: 314
    scope: historical_statement_studio_slice_ss_01
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 316
    scope: historical_statement_studio_slice_ss_02
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 318
    scope: historical_statement_studio_slice_ss_03
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 320
    scope: historical_statement_studio_slice_ss_04
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 322
    scope: historical_statement_studio_slice_ss_05
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 324
    scope: historical_statement_studio_slice_ss_06
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 326
    scope: historical_statement_studio_slice_ss_07
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 328
    scope: historical_statement_studio_slice_ss_08
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 330
    scope: historical_statement_studio_slice_ss_09
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 332
    scope: historical_statement_studio_slice_ss_10
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 334
    scope: historical_statement_studio_slice_ss_11
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 336
    scope: historical_statement_studio_slice_ss_12
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 338
    scope: historical_statement_studio_slice_ss_13
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 340
    scope: historical_statement_studio_slice_ss_14
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 342
    scope: historical_statement_studio_slice_ss_15
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 344
    scope: historical_statement_studio_slice_ss_16
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 346
    scope: historical_statement_studio_slice_ss_17
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 348
    scope: historical_statement_studio_slice_ss_18
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 350
    scope: historical_statement_studio_slice_ss_19
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 352
    scope: historical_statement_studio_slice_ss_20
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 354
    scope: historical_statement_studio_slice_ss_21
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 356
    scope: historical_statement_studio_slice_ss_22
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 358
    scope: historical_statement_studio_slice_ss_23
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 360
    scope: historical_statement_studio_slice_ss_24
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 362
    scope: historical_statement_studio_slice_ss_25
    replacement_owner: phase_18_canonical_generated_document_system
  - issue: 364
    scope: historical_statement_studio_slice_ss_26
    replacement_owner: phase_18_canonical_generated_document_system
```

The Phase 7, 14, and 17 issues above may retain unrelated valid scope. The
`superseded_by_phase_18` disposition applies only to the named conflicting
clauses. The historical Statement Studio #314-#364 set is blocked as a complete
implementation plan because its provider selection, migration posture, access
model, ownership split, and runtime topology predate D1-D17.

## Congruence verification

Before publishing the Phase 18 package and again before implementation dispatch:

1. search PRD/ADRs/OpenSpec/roadmap/phase map/parity/guides/tickets for DocRaptor-as-winner, Unlayer fallback, live `.txt`, snapshot rerender, `gift_receipt_records`, gapless Canada, ACH-processing receipt success, universal January 31, Phase 18 email template, Phase 19 rendering, raw/signed storage URL and legacy migration wording;
2. classify every hit as removed executable path, dated superseded history, or current congruent contract;
3. verify purpose/authority manifest keys match PRD, OpenSpec and tests;
4. verify every Phase 17 delivery contract references exact Phase 18 artifact identity and every Phase 19 item calls the one generation seam;
5. verify Canada remains structurally absent for nonparticipants;
6. verify all protected response header values and deployed-CDN proof requirements are identical across PRD/OpenSpec/tests; and
7. verify docs report the published ticket set and approved frontier accurately
   without claiming built/live behavior, broader dispatch, CRA/IRS
   certification, a selected renderer, legal advice, mathematical gaplessness,
   human read/delivery, or historical migration.

## Final congruence verdict

The D1-D17 model is coherent when the amendments above land together. Phase 18 owns semantic publication, generation, exact artifact, logical-document projection and its records evidence. Source domains own truth/issuance; Phase 17 owns delivery; Phase 19 owns populations/runs. D17 removes every prototype runtime instead of preserving it. No additional founder choice is required.
