# Phase 27 — proposed existing-issue reconciliation packet

Prepared 2026-10-11. **Proposal only: no tracker, repository, parent, state, label or dependency mutation has been performed.** Each actual tracker edit below requires approval with the final ticket breakdown. This packet distinguishes a required owner-contract amendment from a narrow clarification and from an unresolved component gate; they are not interchangeable.

All issue states below were fetched read-only on 2026-10-11. Full bodies and `updatedAt` were read from the linked tracker issues; local research snapshots are not authority or a publication prerequisite. All are **OPEN**. Current planning text is not implementation or qualification evidence. New P27 behavior remains owned by its proposed vertical slice; amendments must not copy that slice wholesale into an older issue or create two completion owners.

## Recommended disposition

| Kind                                                                | Existing issues                          | Action proposed                                                                                                                                                                                                                    |
| ------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Material contract replacements/additions                            | #492, #607, #610, #620, #622, #764, #773 | Approve the exact bounded amendments below before the affected component is treated as implementable under its old body.                                                                                                           |
| Narrow qualification/coordination notes                             | #617, #618, #625, #763, #780             | Include the bounded notes if editing the predecessor packet; no additional implementation scope or blanket issue-closure requirement follows. The same explicit constraints also remain in the new consuming tickets.              |
| Unresolved source-policy gates                                      | #702, #703                               | Preserve E7 and its activation gate; do not replace the financial attribution policy with an invented answer. Optional cross-reference text is supplied below.                                                                     |
| Incorrect producer reference, Phase6 implementation-allocation gate | #897, referencing #888                   | Phase6 is the documented owner. Record the missing exact implementation allocation and block only the affected provider component until that producer is allocated and qualified. Do not enlarge #888 or manufacture a dependency. |

No generic last-touch redefinition is proposed. An earlier research suggestion to replace #618's operational `lastTouchAt` was incorrect and has been removed from both affected evidence notes. REQ27-P33 and REQ27-C12 expressly preserve its separate meaning.

## 1. Required material owner-contract amendments

### #492 — one acting authorization context, not union of unrelated hats

[Issue #492](https://github.com/Asymmetric-al/core/issues/492), OPEN; updated 2026-07-04T01:16:17Z.

**Current contradictory clauses:** Guardrails say “Multi-hat = union.” The effective resolver says “union across all active memberships”; the acceptance criterion says “a donor+staff multi-hat user gets the union.” The testing section repeats that requirement.

**Replace all four statements with:**

> Resolve authority for one server-validated current Tenant Authorization Context. Only grants applicable to that exact acting context may contribute; unrelated memberships, hats, tenants or an unselected context must not be unioned into authority. Apply current source, action, scope and deny/floor checks through the code-authoritative resolver. Non-human, public and operator execution uses its separately qualified context, never a fabricated human membership. Dormant tenant overrides remain dormant and do not create a grant.

**Acceptance replacement:**

> A multi-hat principal succeeds only for actions permitted by the selected validated context; an unrelated staff membership cannot elevate a donor/missionary context. Forged context, foreign Tenant and revoked current authority refuse without protected result disclosure. Existing graduated propose-versus-approve and dormant-override tests remain.

**Preserve:** code authority, no Phase3 grant registry tables, capability vocabulary, existing money/meta-capability separation. This does not demand all P12 administrative interfaces or invent a new capability product.

**Affected P27 owners:** every reached source capability; first source slices P27-S01, P27-P14/P01, P27-A01, P27-C01 and P27-F12/F01 register/qualify their actual contracts. Later slices inherit this floor. Existing #667/#668/#669/#505/#516 remain exact component/proof gates, not a substitute for this correction.

**Authority:** `docs/adr/0210-code-authoritative-capability-foundation.md`; current P3/P12 owners and #493 component contract; Phase27 `proof.md` Q01–Q06 and source volumes.

### #607 — role-aware identity only for the staff-assignment family

[Issue #607](https://github.com/Asymmetric-al/core/issues/607), OPEN; updated 2026-07-06T18:29:40Z.

**Current conflicting clauses:** active uniqueness is `(tenant_id, from_party_id, to_party_id, relationship_type_id)` for every family. `reRoleEdge` says role changes in place with edge identity unchanged, and end-and-recreate is not the mechanism. Matching acceptance criteria require those general rules unconditionally.

**Replace those clauses and their tests with:**

> Keep the existing active-edge identity for non-staff relationship families. For the existing staff-assignment family, source identity must distinguish the exact role-qualified relationship within Tenant: the same staff person and Party may hold distinct legitimate roles, one role may have multiple staff, and an exact duplicate active staff/Party/role-qualified source edge is forbidden. Preserve one primary in the shared header contract independently. Role change/transfer targets one exact source responsibility and retains attributable history, policy provenance and protected manual/unknown control; it cannot silently overwrite another role or treat role as an identity-neutral label. Use the owner-qualified physical representation; this contract does not mandate a new responsibility-slot aggregate or a universal end-and-recreate implementation.

**Acceptance replacement:**

> Two legitimate roles for the same staff/Party coexist; an exact active role-qualified duplicate refuses; changing one role leaves the other roles, independent primary and their work/control history intact. Non-staff duplicate and temporal re-link tests retain their prior behavior. Staff merge compatibility uses the reconciled role-aware contract in #610.

**Preserve:** one canonical edge, type catalog and data-extensible role vocabulary, composite Tenant references, endpoint eligibility, time-bounded no-hard-delete history, derived-view portfolios and original non-staff cardinalities.

**Affected:** P27-A01 supplies the first complete assignment/control behavior; P27-A02 consumes its source facts; P27-A09 consumes merge/import qualification. #625 is a UI consumer, not a second assignment owner.

**Authority:** Phase27 `owner-reconciliation.md` “P9 — Role-aware staff assignments”; `assignments.md` REQ27-A03/A04/A10/A17, particularly AC27-A03-01–05 and AC27-A17-01; current P9 A4/A12.

### #610 — staff collisions and replay cannot infer winning authority

[Issue #610](https://github.com/Asymmetric-al/core/issues/610), OPEN; updated 2026-07-06T18:29:48Z.

**Current conflicting clauses:** every active collision is evaluated by `(from, to, type)` and “the survivor's edge is kept; the loser's edge is end-dated.” Unmerge restores prior endpoints/`ended_at`; the round-trip criterion is unconditional.

**Replace the staff-family application with:**

> For staff assignments, use #607's exact role-qualified identity. A Party merge is not authority to collapse distinct roles, discard protected manual/unknown choices, mark a surviving responsibility rule-managed, guess a primary, transfer independently owned work or widen access. Preserve provenance and work evidence. An unresolved staff-role/control/primary collision remains an explicit source repair condition rather than a guessed winning assignment. The existing merge owner records the exact changes and qualified correction/replay; unmerge must revalidate current constraints, intervening changes and current authority before restoring any active effect. An unchanged lawful round-trip restores the prior state; intervening effects cannot be blindly undone or revived.

**Acceptance addition:**

> Merge/import/Undo with conflicting manual, unknown and rule-managed provenance preserves protected choices and actual source work. Distinct legitimate roles survive; unresolved same-role/primary conflicts are explicit. Replay after intervening responsibility or authority changes cannot silently restore a stale assignment or grant.

**Preserve:** Phase4 merge engine/workbench ownership, no automatic/cross-Tenant merge, no hard delete, single atomic source transaction, self-edge handling, canonical edges and replay evidence. General non-staff collision behavior is unchanged.

**Affected:** P27-A09 is the primary new assignment adapter. P27-C02 and P27-F17 independently consume their exact history/membership merge contracts; this amendment does not assign their feature implementation to #610.

**Authority:** `assignments.md` REQ27-A03/A10/A17 and AC27-A03-05, AC27-A10-02, AC27-A17-01; `owner-reconciliation.md` role-aware paragraph.

### #620 — bounded durable assignment commands, not client-only replay safety

[Issue #620](https://github.com/Asymmetric-al/core/issues/620), OPEN; updated 2026-07-06T16:10:25Z.

**Current contradictory clauses:** posture says “Double-submit protection is client-side + the Phase4 dedupe scan”; acceptance says “Double-submit protection is client-side only.” Its relationship primitive also assumes generic active `(from,to,type)` identity.

**Replace the blanket assertion and qualify the relationship path:**

> Preserve existing independently qualified narrow source-command recovery contracts, including P25 personal-contact changes. D30 assignment commands require durable local source operation/effect identity and current-authorized result recovery. Assignment, primary effect, protected control, attributable history, source receipt and required durable effect intent commit coherently; retries/lost responses recover that exact result under current authority instead of reapplying the transfer. A changed payload or stale source/policy/protection revision is not the same accepted operation. Staff relationship identity follows the reconciled #607 contract. This is a bounded local owner-command extension, not a generic provider journal.

**Acceptance replacement:**

> Assignment retries and lost-response recovery produce one accepted effect; current authorization still governs receipt disclosure. Independent database sessions prove stale/control/primary races and injected pre-commit failure leave no partial source/history/receipt/required-intent result; post-commit projection failure preserves the accepted source result.

**Preserve:** one CRM transaction, shared audit/activity emitters, no Twenty/provider gate, no new `crm_write_gates`, no legacy `crm_command_logs` use and no donation idempotency-header import. Do not amend task ownership or turn every CRM command into a new generic workflow engine.

**Affected:** P27-A01 is the first extension; A03/A04/A05/A06/A07 consume it. The required source-work adapter is delivered in P27-P01 and exact partnership/Request readiness in P27-P04/P27-F05, not inferred from #620.

**Authority:** `assignments.md` REQ27-A09/A11/A12; AC27-A09-01–04, AC27-A11-01–03; current P9 A17/B17 narrow-command precedent; ADR0183 source-work boundary.

### #622 — narrow new shared-interaction exception, retaining general private-note floors

[Issue #622](https://github.com/Asymmetric-al/core/issues/622), OPEN; updated 2026-07-06T16:10:31Z.

**Current contradictory clause and AC:** “Party notes/activity never appear in any missionary-workspace projection”; fixture asserts absence of every `crm_notes`/`crm_activity_events` row or field for an otherwise permitted supporter.

**Replace that absolute statement with:**

> General Party/donor notes, private CRM activity and scores remain excluded from missionary projections. Only newly authored, sharing-eligible development-interaction context from the qualified P9 source may be exposed for an exact partnership under current audience, permitted fields/purpose and explicit qualified historical-access scope. Protected old notes cannot be relabeled, imported, quoted or summarized into this exception. Assignment or linking alone grants no access. Revocation applies to later reads, derivatives and result recovery. Ordinary eligible updates require no supervisory approval after the source and projection policy have been qualified; any actual projection-policy widening follows the distinct-human owner approval requirement.

**Acceptance replacement:**

> Preserve negative tests for general notes, private activity, scores, Care/Support protected facts, donor surfaces and out-of-slice enumeration. Add a narrowly positive missionary test for one newly authored eligible exact-context update and negative tests for another partnership, unqualified historical access, revoked audience, search/export/cache/result recovery and protected-note laundering. Reading/writing shared context neither admits/reopens work nor imposes reporting, coaching, tasks or financial authority.

**Preserve:** one qualified projection choke point; restricted-note predicate; no broad missionary CRM access; absence-shaped protection outside the slice. Do not convert normal updates into policy-approval requests.

**Affected:** P27-C01/C02; P27-C03 only derives from currently qualified permitted source facts.

**Authority:** `owner-reconciliation.md` D26 section; `context.md` REQ27-C01–C09; current P3/P9/P12 projection amendments; ADR0211.

### #764 — exact reported-intake lineage through the one financial commit

[Issue #764](https://github.com/Asymmetric-al/core/issues/764), OPEN; updated 2026-07-11T17:10:53Z.

**Current contract to extend, not replace:** `commitBatch` is the sole guarded revision-pinned offline-money writer; row promotion and financial/outbox facts commit atomically and replay is idempotent on batch/revision. It does not yet promise D25 intake-to-row/line coverage.

**Add to that source/acceptance contract:**

> When a qualified staged item comes from a source-admitted reported intake, preserve its exact intake identity and item correspondence through the batch row and contribution-line/amount coverage, with coherent source revision and durable result. Resolve recording only for the exact covered source items, never by amount/date/name similarity, generic status or task completion. Report permission grants no entry/post/correction authority. Required local source/receipt/lineage writes commit coherently. If posting committed independently before consumer failure, reconciliation attaches the exact existing result; it never repeats posting, receipt or fulfillment to repair the consumer. Recording resolution does not complete independently unresolved physical handling.

**Acceptance addition:**

> One reported intake can continue through valid staged entry to exact posted coverage without duplicate entry; partial coverage leaves uncovered items open. A lost consumer result after successful posting is repaired by source lineage without another money/receipt/fulfillment effect. Both posting-before-transfer and transfer-before-posting remain legal with truthful separate work.

**Preserve:** single money writer, validate=post controls, current finance authority, exact revision, original financial approval policy and C-01 reservation, append-only posted money and existing control-total/tender/outbox semantics.

**Affected:** P27-F22 is the primary new source adapter; P27-F23/F24 and F20 consume its exact results. Do not duplicate the commit engine in F22.

**Authority:** `owner-reconciliation.md` D25 section; `requests.md` Gifts awaiting finance requirements and acceptance; ADR0206.

### #773 — carry a financial row without cloning the actual intake or losing handling

[Issue #773](https://github.com/Asymmetric-al/core/issues/773), OPEN; updated 2026-07-11T17:11:17Z.

**Current contract to extend:** errors are carried as fresh draft rows into a linked follow-on batch, clean-async-pending stays with its origin, and expected-value conservation is frozen. This does not yet specify the reported physical intake identity across fresh row identities.

**Add to carried-row identity and its acceptance:**

> Preserve one actual reported-intake occurrence and exact item correspondence across original, carried and follow-on row identities. Creating a new staged row does not create another actual intake or duplicate its independent obligations. Keep asynchronous pending items with their actual origin as already required. Carry-forward, batch cleanup/archive/deletion or an exception must not erase receipt/handling evidence or unresolved actual handling. Any lawful final handling disposition is source-owned and preserves required accountable work; the P27 projection introduces no second carry writer.

**Acceptance addition:**

> Mixed carry and later commit retain one actual intake, exact covered/uncovered item lineage and one corresponding source-work occurrence. Carry/retry/cleanup cannot clone handling or erase an unresolved physical responsibility. Existing conservation and async-origin tests still pass.

**Preserve:** same existing escape-valve engine, frozen control-total conservation, tender classification, capability/approval gates and exactly one financial commit writer.

**Affected:** P27-F22 primary; F23/F24 consume the resulting lineage. #764/#763 are inherited through the existing producer chain, not redundant direct blockers on every consumer.

**Authority:** same D25 owner amendment and `requests.md` intake lineage/handling clauses.

## 2. Bounded qualification notes, not duplicate implementation amendments

### #617 — retain real evidence; allow the new source extension without misclassifying CRM mutations

[Issue #617](https://github.com/Asymmetric-al/core/issues/617), OPEN; updated 2026-07-06T18:30:06Z.

**Current text:** legacy deletion says “No backfill, no shim: the product has no users… it is demo data.” Existing CRM mutation taxonomy is exactly eight values. The timeline is one read-time composition, not a persisted second timeline.

**Proposed bounded note:**

> The fresh-build demo-deletion statement is not proof about a later retained-data population. Before deleting or replacing a consumed retained source, census actual rows, private history, live readers/writers and restore obligations; retain or lawfully transform real evidence under the qualified owner contract. P27-C01/C02 deliver the narrow new eligible development-interaction extension on the P9 source and its permitted composed projection. The existing CRM-mutation taxonomy is not actual conversation evidence and does not authorize private-note relabeling. Any necessary new source/event shape must be explicitly qualified; this note does not preselect a table or require every development interaction to be one of those eight mutation events.

**Preserved:** original eight CRM events, no persisted universal timeline, private/Care and finance-provenance floors, transactional emitter and optional P6 branch. No new broad activity architecture or mandatory historical import. A proved disposable demo population can retain the original demolition posture.

**Affected:** P27-C01/C02/C03; retained migration proof contributes to P27-Q01.

### #618 — keep generic last touch and its staff endpoint; qualify distinct consumers

[Issue #618](https://github.com/Asymmetric-al/core/issues/618), OPEN; updated 2026-07-06T18:30:08Z.

**Current text to qualify:** generic `lastTouchAt` is `GREATEST` of latest CRM event occurrence and linked task update. The body permits P27 to “enrich the definitions behind the same field names.” It also calls service-role-only table isolation “already correct,” and identifies this as a read-side integration slice with existing task mutation out of scope.

**Proposed replacement for the loose enrichment/proof wording:**

> Preserve the generic operational last-touch field and its separately defined meaning. Do not label/use activity/task-update recency as Last recorded exchange, actual conversation, supporter responsiveness or missionary performance. P27-C03 supplies the distinct source-qualified exchange measure with actual occurrence/precision, completeness, correction and current visibility semantics. Existing task-table posture is migration input, not proof of the new consumer's current Tenant/source/field/history/purpose authority: qualify exact grants, RLS and every reached service/RPC/result path. The P9 CRM Tasks endpoint stays staff-scoped. A separately admitted P27/P28 source-work profile uses its own qualified role-safe context/action/attention contract; it cannot copy or expose this staff endpoint.

**Preserved:** generic metric formula; original staff read/tab scope; earliest-due generic next-task summary; task history owner. #618 does not deliver the missing general source-work writer; P27-P01 provides the smallest bounded adapter inside actual ordinary admission.

**Affected:** P27-C03; P27-P01/P07/P08/P09/P10 and P27-A05 only through exact consumed projections/work, never because the entire read-side issue implies task mutation qualification.

**Authority:** REQ27-P33; REQ27-C10–C12, especially C12's explicit separate generic meaning; ADR0183.

### #625 — consume the reconciled staff command without a second editor

[Issue #625](https://github.com/Asymmetric-al/core/issues/625), OPEN; updated 2026-07-06T18:30:16Z.

**Current text:** “Re-role: updates relationship_role on the active edge with audit”; ended then re-added `(from,to,type)` succeeds.

**Proposed bounded note:**

> Non-staff add/end/re-role retains its existing source semantics. For staff assignments, this tab consumes the reconciled #607/#620 exact role-aware source command and P27 assignment control behavior. A generic relationship route cannot bypass manual/unknown protection, current authority, primary constraints, attributable history or required independently owned work/handoff conditions. Render the one canonical current/former result; do not create a competing portfolio/assignment editor or broaden the tab's grant.

**Why a note is enough:** “update role” is not itself a second policy choice once its exact source command is reconciled. Do not assign the whole D30 implementation to #625 or make all derived relationship tabs a blocker on P27-A01. P27-C09 remains a genuine consumer of #625's church relationship behavior.

### #763 — coordinate the additive P15-owned lane, not another complete schema ticket

[Issue #763](https://github.com/Asymmetric-al/core/issues/763), OPEN; updated 2026-09-23T04:30:46Z.

**Current text:** “entire Phase15 relational substrate,” “schema-only and demolition-only,” and no-users/no-data fresh-build assumptions. The staged rows are proto-financial headers and lines.

**Proposed bounded note:**

> Phase27 D25/P27-F21 adds a narrow P15-owned operational reported-receipt extension; the earlier staging schema alone does not establish that behavior. Unknown donor, financial Legal Entity, amount or allocation may remain unknown in a qualified restricted operational envelope, never through fabricated financial scope/default money or weakened financial-root constraints. Reuse existing staging wherever valid; valid financial entry has no mandatory precursor report. F21 owns the complete new behavior and qualification, coordinating exact final source references with this substrate. Existing one-money-door and source retention rules remain; perform a retained-data census before relying on old demo-only deletion assumptions.

**No duplicate amendment scope:** nothing in the current positive schema contract forbids this later owner extension. Do not expand #763 into another intake UI/workflow or claim it already completes F21. Effects: P27-F21 primary, F22 inherited staging compatibility.

### #780 — qualify the already compatible separate deposit projection

[Issue #780](https://github.com/Asymmetric-al/core/issues/780), OPEN; updated 2026-09-23T04:30:52Z.

**Current compatible text:** “Derived deposit-state is independent of entry-batch and P13 posting lifecycles”; posting/receipt is explicitly non-gated by deposit membership; posted-yet-undeposited is valid. No existing clause needs reversal.

**Optional coordination note:**

> For the D25 reported-intake consumer, expose exact current authorized gift-grain membership/return evidence with source revision and clear ownership. Actual reported receipt/handling, next responsible actor, finance recording, deposit membership and P20 clearance remain independent. Neither posting nor a financial reversal invents completed handling or revived physical possession. Existing P15 operations remain authoritative; P27-F24 builds no deposit/custody ledger or mutable posted-money fields.

**Effects:** P27-F24 consumes #780's actual owner projection; F22 can demonstrate recording independently. This is qualification of an already compatible contract, not new deposit policy.

## 3. Explicit unresolved gates; no selected owner policy

### #702 and #703 — E7 attribution remains unresolved

[#702](https://github.com/Asymmetric-al/core/issues/702), OPEN; updated 2026-07-09T00:46:10Z. [#703](https://github.com/Asymmetric-al/core/issues/703), OPEN; updated 2026-07-09T00:46:12Z.

**Exact current seam:** #702 report-time toggle and P3 say campaign rollup reads “live source_code_id → campaign_id as-of-report-time.” #703 says linking is a single-row update with no ledger retrofit and “campaign_id is immutable once gifts exist on the code”; its acceptance repeats that rule. The full P13 owner additionally describes frozen campaign attribution. These statements do not settle previously unmapped or remapped gifts and current-versus-historical reporting.

**Proposed gate text, if appended to both:**

> Phase27 E7 remains an explicit financial-owner decision gate. Before qualifying affected received-toward-appeal results, record the temporal association policy for previously attributed/unmapped gifts, source-code mapping, hierarchy changes, recurring origin, refunds/corrections and current/historical reports, with exact source revision and coverage. Neither posted-row immutability nor the live-FK instruction selects that missing policy. Until qualified, the affected result is Unavailable; ordinary Requests, nonfinancial appeals and independently qualified finance facts remain usable. This note does not change the present financial policy or authorize a shadow mapping/ledger.

**Effects:** P27-F20 primary; any P27-C10 measure consuming that affected appeal attribution inherits the same gate. P27-C04 direct financial facts do not inherit E7 merely for being financial. Existing #697/#820/#823 source contracts remain unchanged; #710 remains re-scoped to its P16 successors and must not become a competing dependency.

**Scope:** this packet does not resolve E7 or C-01. No speculative new implementation issue is needed just to pretend either policy is settled.

### #897 → #888 — incorrect prepared-submission producer reference

[#897](https://github.com/Asymmetric-al/core/issues/897), OPEN; updated 2026-07-21T03:26:46Z. [#888](https://github.com/Asymmetric-al/core/issues/888), OPEN; updated 2026-07-21T03:26:28Z.

**Current mismatch:** #897's blocker names “#888 — immutable recipient intent, prepared artifact, provider-submission envelope, queue, and claim fence.” Current #888 is an atomic Delivery Plan occurrence compiler and expressly says it “does not execute email/in-product delivery” or own provider outcomes. Its occurrence compilation is not proof that the required prepared/submission owner exists.

**Proposed bounded correction to #897's prerequisite wording:**

> #888 supplies the atomic source-fenced occurrence/child-intent compiler and its qualified Phase6 handoff. Phase6 owns the immutable prepared artifacts, sealed provider-submission envelopes, queue/claim state and provider-entry preparation, as specified in its current PRD section E and dated Prepared identity, provider boundary and recovery contract. Its exact implementation allocation and actual component proof are still missing from the current issue set. Qualify that narrowly scoped Phase6 producer before implementing or activating this affected provider boundary or its consuming adapter. Do not attribute those unproved records to #888, expand the compiler into transport ownership, invent a replacement issue number, or require unrelated Phase6 completion. Record the actual implementation issue/component and contract when the owner allocation is reconciled; until then the affected provider path remains blocked while independent native work stays usable.

**Search proof:** The full current #550 children list contains #551–#565 and no amended preparation/submission implementation slice. Full #553 is the communication-history schema and full #554 explicitly owns capture only; neither implements the new prepared-submission chain. Full #794 is readiness verification and full #896 is a history consumer; #896 repeats the incorrect preparation attribution to #888. Repository-wide issue-body searches returned `dispatchCommunicationIntent`: zero results; `communication_preparations`: #897/#896 only; `communication_intents`: #888/#794/#896 only; and `submission envelope`: #897/#1108 only. Current `packages` and `supabase` source searches for the preparation/submission tables and dispatch command returned no implementation. The governing Phase6 PRD nevertheless defines the exact source contract; the gap is implementation allocation and proof, not an unknown domain owner or unsettled P27 product policy.

**Effects:** P27-F11's provider-action profile and dependent P27-F16 solicitation transport profile require this real component. Manual/native source recording and unrelated in-product paths are not automatically blocked on external transport. Do not create a fake blocker ID or call the gap satisfied by catalog/readiness text. A later material producer reassignment or new ticket requires explicit review; this packet supplies no invented replacement producer.

## Publication and verification limits

Approval of these edits would authorize only the exact reconciliations named here, not issue closure, broad re-grooming, dependency rewrites, implementation or activation. Re-read issue bodies at publication and preserve intervening changes. Do not modify parent #1992. Source readiness uses pinned governing contracts plus actual component proof; neither an OPEN issue, a merged unrelated child nor a static/mock test establishes implementation qualification.

Read together with the evidence reports in `evidence/` and `tickets.json`. The source specification is `docs/prds/sitestacker-parity/phase-27-donor-development/`, with exact owner amendments in `owner-reconciliation.md`; its documented unresolved decisions remain gates. This packet records the minimal reconciliations needed so stale predecessor prose cannot override that source.
