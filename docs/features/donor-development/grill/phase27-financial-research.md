# Phase 27 financial-source research — initial grooming evidence

Observed 2026-10-09. Repository /workspace/core at commit 225c02e9499bd6c0d493223cd4b1a4120ff787e3. Research only; no PRD, specification, issue, product code, or external write. Current source/test inspection is not production qualification. This note records inherited decisions and questions, not a proposed complete design.

## Highest-leverage opening decision

Support the parent’s proposed opening question: what is a cultivation enrollment for, and when does it end? Recommendation for discussion: a Party can have separate, purpose-specific cultivation efforts, each with its own accountable person, stage history, asks and next task. The lasting Party relationship and overall staff assignment survive when a particular effort ends. A church’s annual partnership renewal and a building-project proposal can coexist without overwriting each other. Do not ratify exact duplication rules or schema from this recommendation yet.

The financial sources reinforce this separation. One Party may be legal donor for one gift, recognition recipient for another, and promise owner for a commitment, while several staff cultivate distinct purposes. A single donor-wide “stage,” “funded,” or “lapsed” field collapses those meanings. Detailed amount/coverage questions can follow after the enrollment purpose/lifetime decision.

## Binding inherited contracts

### Phase 13: received money, designation lines, campaigns, attribution and correction

- PRD: /workspace/core/docs/prds/sitestacker-parity/phase-13-campaign-designation-contribution-ledger-giving-cart.md.
- Lines 750–827: fresh header + designation-line + append-only posting ledger replaces legacy donations. Posted rows are immutable; effective values come from the sole cursor-backed fold. effective_seq signals staleness. Legal giving reads that fold; fees/designation/money remain exact currency minor units. No mutable current_amount foundation.
- Lines 833–872: staff corrections express clear intentions, require authority/reason, and append new correction facts; sum-preserving re-designation never reassigns a posted line in place. Phase 27 must follow downstream correction events rather than keep a mutable “funded” total.
- Lines 1596–1616: source codes are first-class tenant-scoped references. Attribution is per-line at cart-add, frozen into approved posting snapshots, carried across recurring installments. Raw UTM is separately erasable. Null attribution honestly means Unknown / Direct. A source code is attribution, not fulfillment authority.
- Lines 1618–1635: giving campaign is a time-bounded fundraising effort; not an appeal, public page, designation, email blast or P2P fundraiser. Campaign goals can be monetary/count based and per currency; campaign and designation totals are overlapping views of the same dollars. One canonical DISTINCT-line-set rollup supplies own/subtree amounts. Appeal owns its future linkage; no appeal fields belong on campaign.
- Lines 1661–1690: historical recurring implementation clauses are explicitly superseded by Phase 16 (2026-07-13). Do not build against old Phase 13 subscriptions/dunning/continuation language.
- Current #695 incorporates C-02 (2026-09-23): immutable posted legal-donor snapshot reached through qualified donors.party_id; no replacing donor_id by bare Party id or re-pointing original financial donor facts through later identity repair.
- Current PRD line 2252 explicitly says Phase 13 of 45, roadmap v3 adopted 2026-09-22. Older live epics still mention v2; they are not evidence against adoption.

### Phase 14: recognition is separate from money

PRD /workspace/core/docs/prds/sitestacker-parity/phase-14-donor-credit-operations.md, ratified 2026-07-10, later amended by Phases 16/17/19/21. Status line 5 explicitly groomed-not-built.

- Lines 314–387: one contribution_credits spine, header-keyed with optional line scope, and separate lifecycle generators. Credits are recognition/attribution, never money. Identity deduplicates manual/generated rows. Scope exclusivity is header XOR line for one Party/role/header.
- Lines 340–347: recognized exposure derives from current Phase 13 effective money and effective_seq; zero when scope voided/reversed. Financial correction does not silently rewrite the historical credit.
- Lines 358–364: P14 reacts to P13 correction/reversal domain events, not raw provider webhooks. Generated credits re-derive; manual credits requiring reattachment get a review task.
- Lines 432–468: sole consumer interfaces:
  - getPartyCreditActivity(tenant, party, legal|recognition, scope filters): source-linked row facts and currency buckets; no mixed legal+recognition scalar.
  - getMatchingActivity: matching-expectancy pipeline facts and funnel aggregates; expectancy is neither money nor recognition.
  - getSupporterRoster(missionary_scope,lens): designation-centric dual, same substrate and cursor, one Party row with direct/via paths, not a stored roster.
  - Per-Party recognition rollup is MAX per (Party,header) across roles, never sum across roles. Phase 27 ranking was explicitly deferred to Phase 27; no preexisting score semantics may be inferred.
- Lines 1035–1040: church is legal donor on a remittance. Member breakdown is capture input only; stored truth is bounded per-line church_member allocation credits. Under-attribution is legitimate; no fake unknown member. Recognition generation is eventually consistent and cannot block money posting.
- Lines 1052–1078: roster aggregate tiles are Legal; individual rows show Recognition. They need not sum to the same number. supports_policy_v2 is roster only: positive recognized scope in trailing 365d OR typed active Phase16 commitment; “lapsed” 365–730d is display-only, no automation, drop after 730d. It does not change Phase9 supports_policy_v1.
- Lines 1080–1114: missionary roster field floor excludes contact info, staff/private notes, household/provenance internals; restricted rows leave no arithmetic/count shadow. Org-sourced rows view-only; flag errors to staff. Recognition never invents commitment truth.
- Lines 1167–1177: org-sourced member visibility does not authorize contact, lists, or auto-enrollment; church_member credits do not appear on member’s own portal or statement.
- Lines 2119–2159: Phase21 Support Activity composes permitted P14 roster facts once for external feeds; Phase31 must not independently join raw recognition. Exact Support Assignment and current Phase12 purpose/field-floor/Legal Entity authorization precede roster data. Membership, missionary role, spouse/team/page or old feed grant gives zero access.
- Current #726 and #735 (updated 2026-09-23) add C-02: acknowledgment purpose/request records separate from immutable posted headers and settlements. Communication/artifact progress remain P6/P18-owned. Their source publication references PR #1901; a reference is not implementation evidence.

### Phase 16: promises, received gifts and applied fulfillment remain distinct

PRD /workspace/core/docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md, ratified 2026-07-13, amended by later phase owners.

- Lines 397–472 and 1160–1190: two operational roots: automatic/manual recurring support and fixed-total promise. Each group/pledge has one explicit immutable Commitment Party. Representative authority, purpose-bound service contact, expected remitter, collection authorizer, legal donor and recognition Party are separate. Shared address, household membership, church title, DAF advisor or past gifts grants no role authority. Genuine owner transfer closes/supersedes and creates fresh Party-owned intent; duplicate identity merge is not transfer.
- Lines 964–1031 (D11): only the conserved fulfillment service applies an effective P13 designation line to a typed occurrence or explicit undated pledge-balance line. Exact Tenant, Legal Entity, currency, designation, source/target capacity and current authority are re-proved under common locks. One source amount is consumed once.
- Automatic apply requires exactly one qualified authority type: frozen provider lineage; authenticated donor instruction; approved authenticated structured remittance mapping. Names, dates, equal amount, memo, OCR, source code, soft credit, household/church relationship and missionary connection are suggestions only. Staff manual application remains an explicit fourth authority type.
- A gift can be Received while Commitment match is Needs review. It is not missing cash.
- Explicit recurring-to-fixed link yields derived fixed coverage from the one recurring application, never a second money application. History pins original target/plan; new plan does not relocate past coverage.
- Corrections append exact signed inverses. Ambiguous partial correction retracts affected allocation vector to uncertainty and routes review, rather than guessing proportions. Current correction authority does not require old application authority to remain active.
- Lines 1033–1082: health evaluates a recurring line or fixed pledge, never a person. P16 Lapsed is an internal collection consequence only when future automatic collection really unavailable/parked. It is distinct from P14 roster-recency “lapsed” and any future P27 relationship attention. Source stale/unavailable = Status updating; suppress negative outreach; unknown never healthy, failed, zero or received.
- Lines 1322–1364: fixed pledge is total first; dates/plan optional. No schedule prompts required. Save says no automatic charge or money received. “Promised,” “Received and applied,” “Released internally,” “Remaining expected,” dated and undated totals are separate. Undated remainder is never late, dated forecast or reminder-eligible.
- Lines 1366–1421: donor change, donor end, organization-only expectation release, and error correction are different operations. Late gift cannot resurrect ended pledge/reminders. A linked recurring stop is separately authorized.
- Lines 1423–1468: fixed-pledge Gentle reminder profile is email-only and starts Off per tenant/pledge/import/migration/new plan. Explicit current-plan enrollment, verified purpose-bound contact, 30-day-before candidate plus one source-aware review-time candidate. P6 owns consent/dispatch/history, P17 content, P16 exact eligibility. No third touch, catch-up or automatic enrollment. P27 native staff tasks must not create a competing pledge-reminder program or infer solicitation permission.
- Lines 2117–2196: modules/commands are owner boundaries. Relevant approved forward APIs include preview/createFixedTotalPledge, preview/applyCommitmentFulfillment, evaluateCommitmentHealth, enroll/stopFixedPledgeReminder, typed role change and governed export. P27 can reference/call qualified services; absence is not permission to reconstruct.
- OpenSpec /workspace/core/openspec/changes/sitestacker-parity/specs/donation-lifecycle/spec.md explicitly classifies current donor_pledges reflection as migration evidence, not target, and forbids mutable pledge counters as target truth.

## Earlier/adjacent financial owner boundaries reviewed

- Phase5 PRD line288: public checkout handoff revalidates server-side and preserves exact attribution/designation context. No public content grants access to internal portfolio/ask/brief.
- Phase7 PRD lines234–240 and 301: one hard-credit legal donor; recognition not receiptable; P14 now owns credit objects. Tax receipt vs recognition acknowledgment vs tribute notification remain separate. Later P18/P19 amendments control runtime/run grains.
- Phase8 PRD lines106–134: operational data-health catalog and existing recovery runtime; unavailable readers explicitly not-yet-available. No second healer/scheduler.
- Phase15 PRD lines58–72: every staff-entered offline gift goes through one batch domain/commit service; quick entry is a batch of one. P27 “gift in hand” cannot create a competing gift writer. Deposit status is separate from posting and Phase20 clearance.
- Phase18 congruence /workspace/core/docs/prds/sitestacker-parity/phase-18-cross-prd-congruence-2026-07-21.md lines13–29,57–83: source phases supply exact facts; P18 generates artifacts, P17 content, P6 delivery/history, P19 runs. A donor brief export must not counterfeit receipt or pledge facts; on-screen brief does not require full general-files product.
- Phase19 PRD lines914–925: optional Support overview is separately purposed, Not a tax document, no added missionary access. It is not an ask success signal.
- Phase20 PRD lines1280–1291: support feed/projection never creates accounting/payment/bank fact; Finance-confirmed Field Account Balance not available-cash balance.
- Phase21 PRD lines412–428: approved need, Phase28 goal, recorded activity, P16 commitment, Finance balance and publication remain separate authorities; absent approved support plan not zero.
- P9 A12 lines484–494 explicitly reserves stage/ask socket, role-qualified assignments + one primary, server-computed lastTouch/next-action; cultivation stage not Party lifecycle, ask not edge/custom field, portfolio derived from assignments.

## Actual issue bodies/statuses, not titles

Fetched via read-only GitHub tools on 2026-10-09. Body snapshot evidence: /workspace/scratch/phase27-financial-issue-evidence.json (initial 17 important issues; later eight issue fetches additionally summarized here).
All following are OPEN; all implementation children listed carry status:blocked. Epics #690/#719/#793 only type:docs.

- Phase13: #690 epic; #695 immutable ledger (updated 2026-09-23); #696 designation; #698 corrections/reversal; #700 staff operations; #701 progress; #702 source codes; #703 campaigns (latter six updated 2026-07-09). #702/#703 comments fetched: none. Old epic includes superseded recurring scope; later P16 disposition controls.
- Phase14: #719 epic; #723 fold; #726 sole party reader (updated 2026-09-23); #734 matching expectancy; #735 matching received (updated 2026-09-23); #736 remittance; #737 roster. Original children dated 2026-07-10. Bodies specify substrate blockers, no owner-authority shortcut; #737 depends on #723/#726/#736 plus #493/#604/#628. #734 matching worklist explicitly creates zero per-row healthy-match tasks.
- Phase16: #793 epic, #810 Party roles, #820 total-first fixed pledge, #823 conserved fulfillment, #824 recurring-to-fixed coverage, #826 authenticated structured mapping, #828 versioned health, #829 received/online outcomes, #830 private recurring detail/forecast, #833 Gentle reminders. Bodies updated 2026-07-14, explicitly blocked and undispatched until separate founder decision.
- Issue comments fetched for #690/#719/#726/#737/#793/#810/#823/#828/#829/#833/#702/#703/#735: zero returned.
- Search Phase27 and named read models found predecessor seams, not a distinct Phase27 implementation epic. Search match is not exhaustive absence proof.

URLs are https://github.com/Asymmetric-al/core/issues/NUMBER for each number above. Source publication PR1901 reference: https://github.com/Asymmetric-al/core/pull/1901.

## Actual checked-in code, migrations, and tests

Observed existing behavior; not qualified live behavior.

1. /workspace/core/packages/api/src/admin/crm/detail/service.ts line11 GIFT_HISTORY_LIMIT=100; lines244–256 reads 101 donations, returns100 + giftHistoryTruncated. Lines215–217 uses donor.last_gift_date and donor.total_given. This is explicitly limited loaded history and a denormalized legacy total, not evidence suitable for full-history RFM.
   Test /workspace/core/tests/unit/packages/api/admin-crm-detail-report.test.ts lines394–416 proves100+truncation via fixture. It does not prove pagination-independent financial summaries.

2. /workspace/core/packages/api/src/admin/crm/reports/service.ts lines79–102 reads completed raw donations and limit5000, with donor/fund/missionary on flat rows. It is not P13 line-preserving complete source. Treat as implementation accident/temporary bridge, not ranking foundation.

3. /workspace/core/packages/api/src/missionary-portal/donors.ts lines332–374 maps donor-only rows, donor.missionary_id scope, total_given default0, score default0, legacy pledges. /workspace/core/packages/database/hooks/missionary-donors-model.ts line374 also defaults score0. These are existing legacy view assumptions, not Phase14 getSupporterRoster or P27 scoring decisions.

4. /workspace/core/packages/api/src/stripe/recurring.ts lines101–121 looks up donor_pledges by subscription, optional tenant filter; lines148–185 maps provider state into pledge status; lines250–274 increments payments_completed/failed_charge_count. Tests /workspace/core/tests/unit/packages/api/stripe-recurring-pledges.test.ts lines183–225 assert those current counter/status operations and guard cancelled status from late invoice reactivation. Useful protective precedent, but target P16 forbids this collapsed source model. Do not claim full recurring product from these tests.

5. /workspace/core/packages/api/src/admin/contribution-shared/effective-values.ts lines84–116 folds applied adjustment effectiveValues in time order, including whole replacement designation arrays. Useful precedent for immutable adjustment/read derivation; P13 requires line-identified posting fold instead. Existing tests at /workspace/core/tests/unit/packages/api/admin/contribution-effective-values.test.ts cover current helper, not replacement ledger.

6. /workspace/core/supabase/migrations/20250101000000_init_schema.sql lines78,108,238 defines legacy total_given/current_amount and donor_pledges. /workspace/core/supabase/migrations/20260214090000_foundation_1_schema.sql lines9–19 defines campaigns/current_amount, later converts counters to bigint. These remain source evidence of legacy tables. Newer field policy migration 20261005050728 enumerates donor_pledges fields; enumeration does not migrate domain ownership.

7. Exact search in packages/api/src, packages/database, supabase/migrations, apps/admin, apps/missionary found no getPartyCreditActivity/getMatchingActivity/getSupporterRoster/contribution_credits/contribution_headers/contribution_designation_lines/contribution_postings/commitment_fulfillment/fixed_pledges hits. No commitments/ module appeared in file scan. This supports “required readers not found in inspected checkout,” not universal deployment absence. No database/runtime verification or tests executed for this research task.

## Dependency/conflict register — do not silently amend owners

1. P13 campaign attribution ambiguity (P13 owner): PRD line1608 and live #702 explicitly use live source-code→campaign association at report time; PRD line1631 says frozen campaign node, line1633 and live #703 require source-code campaign_id immutable once gifts exist. A consistent explanation may distinguish frozen association from live hierarchy, but line456 explicitly promises later re-parenting a source code into campaign changes reporting. Needs owner clarification before P27 chooses appeal outcome reclassification behavior. Opening enrollment-purpose decision need not wait.

2. P14 #737 old body vs later P16/P21 amendments: body date2026-07-10 precedes typed commitment/Support Assignment access amendments. Current owner PRDs/OpenSpec govern intent; issue blocked posture is unchanged. Do not adopt old active-pledge inference or assignment-as-access.

3. Contactability wording: P14 line1172 lists direct gift/portal claim as member contactability transitions. This must not be generalized into marketing/solicitation consent. Current user request and P6/P17 purpose-specific eligibility remain binding. If a proposed P27 action needs broader permission, exact communication owner decides; no silent reinterpretation.

4. Staff performance attribution vs P14 solicitor recognition: P14 owns solicitor credit role. P27 owns staff accountability/ask outcomes. These need separately named measures and deduplication; do not reuse recognition as staff financial-credit authority by default.

5. Distinct “lapsed” semantics: P14 roster recency, P16 unavailable automatic collection, prospective P27 relationship attention. Interface should explain qualified meaning, never one person status. No amendment needed to preserve separation.

6. Missing source services are implementation gates for their features, not a reason to import raw tables or false zero. Native cultivation records/tasks can be groomed without pretending gift/recognition/commitment qualification exists.

## Later product questions, once enrollment meaning is settled

- What counts as an ask being accepted, especially tentative/verbal response vs P16 evidenced promise?
- Which exact gift/line associations count toward one ask, and what remains nonexclusive staff attribution versus conserved commitment fulfillment?
- How should organization-wide appeal totals deduplicate overlapping asks/appeals/households/recognition?
- Is physically received evidence an independent Phase15 source event worth showing separately from posted gift, and can the staff read it safely? A kanban drag must never create either.
- Which financial lens and subject grain is RFM for; how does incomplete history disclose coverage rather than assign zero?
- Which native staff follow-up belongs to P27 while P16 retains pledge/recurring reminders and P14 matching worklists?

These are recommendations/questions, not ratified decisions.
