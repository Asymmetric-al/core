# Phase 29 Q36 A — runtime, database and scope adversarial review

2026-10-23, Asia/Bangkok. Conrad selected A: allow authorized source staff to add an ordinary requested item to the same eligible issued unfinished request for its continuing purpose and intended recipient. This independent review proposes exact required amendments and native proof. Q01–Q35 are fully ratified; Q36's complete amendment package is not yet ratified. Only this note is authored.

## Verdict

**Accept with required amendments.** The useful feature is prospective additional source work in one coherent request, not generic row insertion. The critical obligations are a truthful usable work route, immutable original authority/history, exact amended scope, unaffected old-work continuity and one correct aggregate outcome. Broadening old tokens or adding an inaccessible mandatory row would not satisfy A.

Publication must qualify the actual declared route. Participant-required work needs current original/fresh authority with the exact scope successor, or actual independently authorized fresh admission after eligible expiry. A vague future-grant promise is not current usability. Conversely, an independently lawful Q28 staff-evidence/review route requiring no participant action must not force unnecessary regrant. It never becomes participant submission/affirmation or a claim that participant access exists.

## Calibrated risks

These are prospective implementation risks, not proven vulnerabilities in a nonexistent native endpoint. Likelihood is qualitative engineering judgment, not measured incidents.

| Risk | Failure                                                                                                               | Severity / likelihood                 | Closure                      |
| ---- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ---------------------------- |
| R01  | Generic staff/task edit, assignment or admin-client access substitutes for requirement and grant authority.           | High / plausible                      | C01–C03,C10; P01–P03,P24–P25 |
| R02  | Appending an item widens old proof/token scope or rewrites original admission and deadline.                           | High / plausible                      | C03–C04,C08; P04–P09,P13–P14 |
| R03  | Required item commits without usable route; projection lag becomes false access success or blocks unrelated old work. | High / plausible process failure      | C03,C05; P06,P11–P12,P18     |
| R04  | Expired access revives implicitly, or staff-only evidence wrongly requires participant regrant.                       | High / plausible ownership conflation | C03,C08; P06–P07,P21         |
| R05  | Concurrent additions overwrite each other or stale Q22 fulfills without the new requirement.                          | High / plausible concurrency          | C06–C07; P15–P20             |
| R06  | Dynamic current item membership enlarges completed-read scope or fabricates an old completed admission.               | High / plausible                      | C08; P13–P14                 |
| R07  | Lost-response retry duplicates work; old replay revives a removed demand or borrows a newer period.                   | High / plausible ordinary failure     | C05,C09; P22–P23             |
| R08  | Individual UUID foreign keys, filtered counts or service-only grants are mistaken for native scope/currentness proof. | High / plausible copied pattern       | C06,C10; P15,P24–P25         |
| R09  | Broad revision invalidation loses lawful old uploads/review or retargets bytes to the new item.                       | High / plausible coarse fencing       | C04,C07; P09–P10,P19–P21     |
| R10  | Undo/delete or copied replacement removes accepted history, reopens terminal work or sends an unrelated notice.       | High / plausible repair error         | C09,C11; P23,P26,P28         |
| R11  | Full scans and child writes under locks make publication slow or leave derived scope authoritative.                   | Medium to high / workload-dependent   | C05,C10–C12; P12,P30–P32     |
| R12  | Mixed clients/imports/restore infer old scope from current membership or lose later restrictions.                     | High / plausible migration error      | C12; P31–P32                 |

## Evidence and freshness

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`. During this review live develop advanced from `f59331942c6e84ab66bcdd14c3b120025cceecfd` to `550c142e669ba4f3f4d3e0146aa2a37d9d70423a`. Owner independently established a complete **50-commit/31-path** delta and unchanged root AGENTS, docs, OpenSpec, apps and Supabase trees. Real package source and acceptance/test/tooling changes exist; no unchanged-runtime claim is made.

Fresh pinned connector reads at f593 cover the auth/operation, financial replay and representative schema/RLS seams below. Owner's complete changed-path/tree proof establishes those paths did not change in the new delta. Both changed package source files were read at 550c and compared to f593. No pull or checkout update occurred.

Root/API/Auth/Database/Supabase AGENTS, repository-entry, backend/data-access and Supabase/Postgres/auth guidance were read in this continuing review. No SQL, provider, deployed environment, credential, private-data, browser or test execution occurred. Existing code is not presumed correct because it has tests.

| Concrete evidence                                                                                                                                                                                            | Meaning and reuse boundary                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/auth/context.ts:249–338,355–378`, blob `a1fb819f1cfd6e5eb233aeb1c617a79b6e1f3a06`                                                                                                                  | Caller/profile and tenant-membership loading supply identity inputs. Generic roles do not establish exact addition/scope authority or current permission after waits. This membership-based helper does not demonstrate Q01's request-only successor.                                        |
| `packages/api/src/shared/with-operation.ts:137–163`, blob `86da81fed1ccb7a39bf5065c0bd8349cf351ac23`                                                                                                         | Handler receives an admin client after generic auth/role checks. Privilege does not establish source/request/recipient/requirement authority.                                                                                                                                                |
| `packages/api/src/admin/member-care/mutations.ts:313–355`, blob `8ee269af968d67dba40b9c38003e3ef15b84aa37`                                                                                                   | Specialist care upsert validates personnel and writes activity interval/notes. It supplies no private-request scope successor or Q22 boundary.                                                                                                                                               |
| `packages/api/src/admin/mission-control-tasks/service.ts:48–84`, blob `c7eed05a7046d36f3655ff1a41460503376281c0`                                                                                             | Task, links and event are separate awaited writes, not atomic native item/requiredness/scope/history admission.                                                                                                                                                                              |
| `packages/api/src/admin/contribution-operations/correction-requests.ts:128–141,430–489`, blob `6f3bc962be94fa6c5371e9c22ef955ac1d5fb0dc`                                                                     | Duplicate financial creation reads an ID by tenant/key; apply supplies null expected revision, then pending-state CAS/audit. Inner protections may exist. These seams do not prove Q36 material comparison, affected-basis fencing or atomic native effect; no unrelated exploit is claimed. |
| `packages/api/src/missionary-portal/task.ts:8–121`, blob `5515cf6058b95947b556987def10fdbb52a2c194`                                                                                                          | Generic task PATCH/DELETE cannot add document demand, broaden a grant, accept evidence or fulfill a source request.                                                                                                                                                                          |
| `supabase/migrations/20260526193000_mission_control_tasks.sql:14–48,68–131`, blob `65045c05c4702a7f2b652da9083a4e00e0bcb676`                                                                                 | Independent task/tenant IDs and string record links, states, indexes and service-only grants/RLS are generic. Individual FKs or privileged writes alone do not prove native same-scope integrity. No complete deployed-schema conclusion follows.                                            |
| `supabase/migrations/20260414180338_member_care_foundation.sql:283–333`, blob `0ffd636e7c27177d15cd33964031a7f98227b6e4`                                                                                     | Specialist care policies distinguish USING and WITH CHECK. Native review must test actual effective grants/policies/functions, not copy those membership predicates.                                                                                                                         |
| `packages/api/src/generated-documents/purpose-catalog/catalog.ts:624–700` at 550c, blob `d4256a7012c00125d439f00c7d618c53534a26e6`; `types.ts:1–13,133–153`, blob `6239fd5c88eb35d50dcb24be0625ad24404a08b7` | New Phase18 informational giving-summary owner/recognition-subject role, data view v2, household/DAF fields and privacy/recognition/statement gates; schema version 2 adds gate vocabulary. Generated-document purpose is not a request item or amendment command.                           |
| Q36 research and prior inspected task/financial mock tests and SQL-text assertions                                                                                                                           | Supplied/mocked seams are not native actual-role scope, database race, complete-predicate, serving or restore proof. None was executed here.                                                                                                                                                 |

Bounded local native-name searches and changed-live classification establish no qualified Add requested item command in the inspected paths. This is not exhaustive absence proof under every name or a deployed-state assertion.

## Governing reconciliation

| Existing source                                                                                        | Required distinction                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q01 ADR `0001-confirmed-recipient-private-document-requests.md:25–40,49–55,66–82`; full review Q01-C08 | Exact revision/proof; versioned successors fence obsolete contexts. Source authority and proof differ. Fence actual affected scope, without silently widening or globally destroying old rights.                          |
| Q11/Q12; Q13-C06; Q15-C03–C05                                                                          | Original outputs/time stay immutable. Fresh scope excludes new requirements until Q36 explicitly reconciles approved added lineage; original-expiry proof, no-overlap, current restrictions and timing/repetition remain. |
| Q22 ADR `0022-source-owned-request-fulfillment.md:30–96`                                               | Complete current predicate and actual F govern, not final click/worker/count. Changes order through aggregate boundary or equivalent protocol with coherent durable follow-through.                                       |
| Q24/Q25 ADR `0025-review-readiness-before-original-issuance.md:37–60,71–100`                           | Qualify newly declared coverage while reusing valid person/team responsibility. Original issuance gate is not a universal ongoing gate or future-file grant.                                                              |
| Q03/Q21/Q28                                                                                            | Exact evidence, receipt/correction/acceptance and staff provenance; staff evidence cannot supply participant affirmation or transfer acceptance.                                                                          |
| Q30 ADR `0030-source-owned-item-questions-and-replies.md:54–75,87–99`                                  | Relevant admitted text fences affected uncommitted human basis, not all work; no Read/Reply/Resolve or completion gate.                                                                                                   |
| Q33 ADR `0033-source-owned-no-longer-required.md:33–82`; Q34                                           | Actual eligible remedy only; no generic Undo/delete/unaccept/reopen.                                                                                                                                                      |
| Q06–Q08; Q16 ADR `0016-fresh-read-recovery-both-completed-routes.md:17–48`; Q19                        | Actual timely fulfillment-created completed permission is the later read ceiling. Amendment cannot fabricate it, add later files or union write rights.                                                                   |

## Exact required amendments

### C01 — Bounded source addition

Support deliberate Add requested item only for the same eligible issued unfinished ordinary request, continuing legitimate purpose and intended recipient. Record a stable new item/requirement identity with exact source-owned instructions, applicability/requiredness, attribution and qualified revision. Saved preparation is not publication or a completion obligation. Do not admit unrelated purpose/recipient, edit an old item by disguise, propagate templates, bypass specialist rules, change acceptance or reopen terminal work. If eligibility or the route cannot qualify, preserve lawful preparation and an actual capable source/separate-new-request remedy.

### C02 — Current authority and declared review work

Derive tenant/environment/actor/time and validated source/request/recipient from trusted context. Qualify requirement-addition authority separately from review, assignment, reading, contact management, original/fresh access administration and service privilege. Staff need not inspect all old bodies if sufficient independent source facts justify the addition; optional preview failure must not block independently authorized work. Unknown required authority still denies the dependent action.

Before publication explicitly qualify usable review coverage for the new declared work under source/P12 and Q24. Reuse a still-qualified person/team; no new named assignee, roster snapshot, combined individual powers, online presence, repeated original-issuance ceremony or future-file permissions. Preserve current later review checks and normal recovery for later staffing loss. This is Q36's new-work prerequisite, not reinterpretation of Q25 as an always-on intake gate.

### C03 — Usable route and lawful Q28 branch

Publication must establish the actual source-approved route. Participant-required work needs an exact prospective scope successor under an independently valid original/fresh period, or actual separately authorized fresh admission after eligible expiry. A combined review may expose both effects but cannot combine their permissions or silently grant. Preserve distinct known results and semantic identities. A promise of later administrator action is not current usability. If required route cannot be established, keep authorized inert preparation and capable remedy rather than a stranded mandatory demand or false Add success.

An explicitly source-qualified staff-evidence/review route under Q28/Q21, requiring no participant submission, affirmation or other action, may publish without participant grant. Prove that exact current staff/target route, preserve staff attribution and independent acceptance predicates, and show no participant access where applicable. This is not a new mode or waiver of participant-required work. If participant action later becomes necessary, qualify actual scope/fresh authority or a capable source correction/new-request remedy before presenting actionable demand; no inaccessible hidden blocker. Staff-only processing creates no historical participant grant or completed-view entitlement.

### C04 — Prospective scope, immutable original facts

Explicitly adopt the compatible Q01/Q13/Q15 successor for approved added-item lineage within the same request/purpose/recipient lineage. Record newly admitted scope and exact authority/basis. Preserve original grants, proofs, initial item set, ends, recipient/mailbox revisions, adverse facts and outcomes; do not rewrite them to pretend the item was always included. New scope is prospective, not union of expired scopes or dynamic folder membership.

A valid original/fresh period retains its exact end and all earlier caps/restrictions. New scope requires actual source/P12 authority and compatible Q01 proof/session qualification. An existing entry URL may lead to a newly qualified current context; possession alone grants nothing additional. Reuse proof only under exact compatible principal/mailbox/request/purpose/freshness rules, without challenge-per-row or account/email-equality shortcuts. Fence obsolete contexts/promotion at their real affected scope. Preserve independently lawful old-item continuation, qualifying its successor mapping where required; a broad revision bump may not silently revoke unrelated rights or retarget an old command.

### C05 — Coherent admission and truthful projections

Coherently persist addition, requiredness/current requirement basis, review-route qualification, exact scope/admission result or explicit lawful staff-only branch, required history and follow-through. Co-located required facts/outbox commit atomically; cross-owner designs must prove equivalent closed admission/recovery rather than assume sequential calls are atomic. Do not acknowledge participant-ready success with a row and guessed future grant. Rollback leaves no acknowledged new demand; unknown commitment reconciles before repeating effects or deleting potentially admitted evidence.

Task/count/cache/index/optional notification projections may lag only while authoritative serving and source paths already enforce correct scope/requirement truth. Stale child projections cannot grant access or fulfill early. Optional projection failure cannot undo known addition, promise false usability or block independent old work. Preserve known source success and actual access state separately with owned recovery. Providers/file processing/unbounded child updates remain outside short source locks.

### C06 — Aggregate ordering and actual occurrence

Order addition, other requirement decisions and actual Q22 fulfillment/cancellation through one aggregate boundary or an equivalent proved version/fence. Addition-first joins the complete current requirement set; actual F/cancellation-first prevents unfinished publication. Final acceptance, uploaded/accepted visible counts, prepared completion, worker claim and deferred evaluation are not F. No hidden draft obligation, arbitrary hold, extra Complete action or waiting interval may preserve an opportunity to add.

Concurrent distinct additions cannot overwrite each other; the same effect cannot duplicate. Serial admission may preserve both where each current reviewed basis remains valid, otherwise produce an affected meaningful conflict. Do not silently rebase materially stale human intent or re-review unchanged evidence just because an unrelated item appeared. Last acceptance versus additions must prevent premature F and durably arrange any due evaluation. Use complete source facts, not pagination/filter-visible rows or cache counts. Record actual occurrence after relevant waits; no backdating to form-open, client time, transaction start or scheduling intent.

### C07 — Evidence, old work and clarification remain exact

Preserve prior receipt, immutable versions, correction links, staff associations, acceptance, questions and history. Addition cannot turn old evidence into new-item submission/acceptance, reset progress or make unsafe material admissible. Q28 reuse requires exact target/version/source authority and deliberate staff attribution, without copied approval or participant assertion.

An old-item transfer/unadmitted command keeps its exact target and reviewed material. Continue only if that exact action remains currently lawful; do not let it borrow new scope or fail solely because an unrelated item was added. Transfer is not receipt. Reconcile uncertain finalization and preserve admitted evidence without duplicate upload for view repair. Q03 dependencies and independent safety/holds/retention/other uses remain.

Relevant Q30 text admitted before an affected prepared addition fences that decision for deliberate revalidation. Unrelated text is not a global lock, and no Read/Reply/Resolve gate follows. Committed decisions stay historical facts. New item publication is not a clarification or evidence-received occurrence.

### C08 — Finite present and future access mapping

Addition never resets or lengthens original/fresh/completed access, pauses time, creates overlap, revives adverse endings or imports new timing/repetition. Requested-by target, binding cutoff and access end differ. Declare supported new-work timing; do not retroactively blame the participant for pre-publication time or silently create a deadline editor. Honor binding prohibitions/cutoffs. Ordinary time advance under unchanged reviewed terms does not require confirmation; relevant expiry/shortening during waits changes authority.

Later eligible fresh unfinished decisions may include only approved amended lineage under existing Q13–Q15 proof/predecessor/no-overlap/scope/time rules. An old unadmitted command cannot borrow that period. At normal F, only actual qualified participant authority and declared eligible read scope may establish Q06/Q07 or Q13 completed permission. Source-only addition or staff-only fulfillment after participant expiry grants none. Keep exact admitted members/original versions/actions/Q05 context and causal provenance. Later Q08/Q16/Q19 reads remain bounded by that actual completed ceiling and current restrictions, not all current items/files or wider unfinished scope. No first completed admission backfill or rewritten old end.

### C09 — Semantic recovery and lasting correction

Every deliberate addition has permanent source effect identity and stable material intent: exact request/purpose/recipient, new requirement meaning, material route/scope and relevant reviewed basis. Generated IDs, actual occurrence, resolved qualification witnesses and final timing are immutable original results, not regenerated retry intent. Recover a committed matching effect under current disclosure before treating it as new; changed material conflicts. Expired/different HTTP keys, double click, crash, worker retry and restore cannot create another item or substitute a newer addition/grant. Identical labels do not collapse distinct work.

Use Q33 only where its current No longer required/correction eligibility holds. Preserve history; no silent unaccept, terminal undo or old scope restoration. Replaying addition after Q33 removal returns original historical success plus current outcome without reactivating demand. If Q33 does not apply, provide an actual capable source remedy, not direct SQL, generic Undo or assumed reopen. Independent new original issuance retains Q25/Q01–Q19 and permitted Q28 reuse without copied grants/acceptance.

### C10 — Structural integrity and effective authorization

Enforce same tenant/environment/source/request/recipient/requirement/admission relations, valid lifecycle/requiredness/scope states, immutable original identities/actor/time/end, unique permanent effect/material binding and necessary retained evidence. Individual UUID existence, email equality, generic record strings or mutable arrays do not suffice. Generated scope members bind only the exact approved addition and qualified continuation. No new physical table or global version engine is mandated when existing source structures prove these invariants.

Test effective privileges and actual-role SELECT/INSERT/UPDATE/DELETE/UPSERT, old-row USING/new-row WITH CHECK with all permissive/restrictive policies, triggers and grants combined. Omitted WITH CHECK alone is not a proven bypass; test effective semantics. Cover views, RPC, definer functions, service/admin/job/import/repair/GraphQL/collection routes and direct callers, not only UI. Privilege must not mutate original authority, reparent items, fabricate recipient proof or publish unauthorized demand. Current source/P12 checks after waits complement static constraints.

Authorize before enumeration and every request/item name/count/instruction, summary, preview/original/range/conditional/cache retrieval, correction/finalization/promotion, replay/history and action-result path. Counts and titles can disclose added private work. Same-request membership cannot justify bearer provider URLs, profile fallback, stale private caches or union of reviewer/recipient purposes.

### C11 — Small UX, privacy and distinct effects

Use existing source/request Base UI/base-maia surfaces: one meaningful Add requested item review with safe exact context/instructions, requirement consequence, actual route and unchanged timing. Distinguish prepared/published/unknown and actual recipient-unavailable state. Preserve previous accepted/received progress; new work is not rejection. Keep lawful focus/input/reading context across recoverable failure and clear forbidden or delayed content on tenant/user/source changes. No routine extra modal/approver, mandatory essay, general diff engine, new settings/modes, private offline archive or reconnect auto-submit.

No new email/bell/reminder policy follows. Existing message purposes/pins/provider facts stay with their owners; do not impersonate Q26 review, Q27 receipt, Q30 text or Q35 cancellation to send. A view update does not prove awareness. Preserve source history/scope provenance while preventing private instructions/evidence/reasons/raw recipient addresses/credentials in ordinary diagnostics/events/errors/search/exports. Independently qualified protected carriers retain their own rules. Source/custody retention/holds/disposal do not reset on addition.

### C12 — Bounded operations, rollout and restore

Reuse source/P12/custody/work infrastructure. Qualify indexed bounded currentness/complete aggregate queries, paginated protected history, finite supported input/member/recovery load, deterministic lock order and measured latency/lock/p95/p99/fairness budgets. No invented item quota or generic throttling platform. No truncating predicates, whole-tenant/lineage/roster scan per action, per-poll business event or provider work under locks.

Adopt prospectively through exact source/P12/Q01/Q13/Q15/Q22/Q24/Q25 and completed-read owners, preserving specialist contracts. Read full incorporated OpenSpec; update canonical authors/projections at authorized publication. Mixed old clients/workers/imports cannot infer old scope from item existence, bypass route qualification or reconstruct original proof from current state. Scoped stop preserves committed source truth and lawful old work. Restore reapplies later revocation/shortening, Q33/Q34/F, scope, retention/destruction and permanent identities before use. Roll forward if downgrade would erase them. Operators need minimal traces of original result, current route/scope, aggregate state and owned recovery without bodies/credentials/manual DB repair. Documentation alone is not activation.

## Native proof groups

These are falsifiable release requirements, not tests executed by this review.

| ID  | Required proof                                                                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | Add only legitimate ordinary work in the same issued eligible unfinished request/purpose/recipient. Reject terminal, wrong-purpose/recipient and specialist bypass; inert drafts do not block Q22.                                                                |
| P02 | Actual source requirement authority, separate scope/fresh-grant authority and trusted tenant/actor/time hold after waits. Generic role/assignment/admin client fails; optional prior preview outage does not block independent authority.                         |
| P03 | Added review scope has current usable Q24 coverage, reusing valid paths. No roster copy, combined powers, online requirement or retroactive Q25 standing gate.                                                                                                    |
| P04 | Original-period successor admits only approved new work and qualified continuation, preserving immutable original grant/item/proof and exact end/caps.                                                                                                            |
| P05 | Fresh-period successor explicitly reconciles Q13/Q15 with unchanged period/predecessor/no-overlap and no new initial issuance.                                                                                                                                    |
| P06 | Expired participant-required publication needs actual independently authorized fresh admission of amended lineage. No promise-only route, revived old grant, unknown-as-expired or stranded mandatory item.                                                       |
| P07 | Later fresh admission recognizes only approved amended lineage, current restrictions and correct predecessor expiry; no union of old scopes or old-command borrowing.                                                                                             |
| P08 | Compatible current Q01 proof reuse works; wrong mailbox revision/request/purpose, account equality and insufficient proof fail. No challenge/signup per row.                                                                                                      |
| P09 | Old token/entry alone cannot authorize added item; a qualified current successor may permit entry/continuation. Obsolete contexts fence actual affected authority across every read/write/finalization/promotion/replay door.                                     |
| P10 | Old receipts/versions/corrections/acceptance and independent rights retain meaning; new item cannot automatically adopt their evidence or acceptance.                                                                                                             |
| P11 | Faults around source item/requiredness/route/scope/history/handoff yield coherent success or no acknowledged effect. Unknown commit recovers original result without partial grants/demands.                                                                      |
| P12 | Delayed optional task/count/index/UI projections cannot authorize scope, fulfill early, claim usability, re-add work or block unrelated lawful old work.                                                                                                          |
| P13 | Timely actual F under qualified amended authority admits only declared eligible completed members/versions/actions/context and existing ends. Expired/staff-only/no-admission/gap cases get no retroactive grant.                                                 |
| P14 | Q08/Q16/Q19 reads stay within actual completed ceiling/current restrictions, not current items/later files/old writes; rendition repair adds no scope or intake.                                                                                                  |
| P15 | Distinct concurrent additions preserve both when lawful or conflict deliberately; same intent is one. Same labels do not universally dedupe and new keys do not bypass identity.                                                                                  |
| P16 | Both orders of last acceptance/deferred Q22/actual F versus addition avoid premature F and lost evaluation. Final click/queue is not F; actual occurrence after waits never backdates.                                                                            |
| P17 | Both orders against Q34/terminal restrictions preserve eligible outcomes/history. Stale addition or Q22 cannot reopen or overwrite terminal truth.                                                                                                                |
| P18 | Capability/source/recipient/route/period expiry/shortening races hold at admission/use. Unknown required authority denies affected new work while independent old rights remain usable.                                                                           |
| P19 | Selected/transferring/admitted old upload/correction keeps exact target. Unrelated addition alone neither retargets nor loses lawful receipt; uncertain finalization reconciles and old operation cannot borrow new scope.                                        |
| P20 | Relevant new Q30 text fences affected uncommitted addition; unrelated/later text creates no Read/Reply/Resolve or extra completion gate.                                                                                                                          |
| P21 | Lawful staff-only Q28 route after participant expiry needs no regrant, but proves target/evidence/acceptance authority and staff attribution. It cannot replace required participant affirmation or claim access; later participant need has actual route/remedy. |
| P22 | Lost response, rollback/crash, double click, expired/different transport keys and workers recover one original effect under current disclosure. Generated IDs/time/witnesses are not new intent.                                                                  |
| P23 | Changed material conflicts; replay after Q33 removal/correction, newer grant or another addition cannot restore old demand/scope or return newest effect as original.                                                                                             |
| P24 | Real native keys/checks/FKs/state constraints enforce same scope, necessary original facts, immutable outputs, effect/material uniqueness and safe deactivation; forged/reparented references fail.                                                               |
| P25 | Actual-role combined grants/RLS USING/WITH CHECK, UPSERT, views/RPC/functions/triggers and service/admin/job/import/repair/collection/GraphQL paths cannot mutate allowed rows into unauthorized scope or leak protected counts/content.                          |
| P26 | Mistaken addition uses eligible Q33/history; accepted/terminal cases use a capable authorized remedy. No generic delete/Undo/reopen, copied grants/acceptance or SQL repair.                                                                                      |
| P27 | Near target/access boundaries, exact existing terms and binding cutoffs hold without time reset or pre-publication lateness fabrication. Proof/credential repair differs from fresh scope/grant.                                                                  |
| P28 | Composed staff/participant mobile/keyboard/AT/IME/RTL/locale/slow-network flows distinguish prior success/new work/draft/publication/unknown/access; lawful focus remains and cross-context delayed data clears.                                                  |
| P29 | Source/provenance/history and diagnostics remain minimized/purpose-authorized; every metadata/byte/cache/export door rejects widening. No new message, private-log dump or retention reset.                                                                       |
| P30 | Production-shaped concurrent additions/last updates/readers meet declared finite query/lock/payload/fairness/recovery budgets with complete predicates and bounded history; no unbounded scans or providers under source lock.                                    |
| P31 | Mixed clients/schema/workers, activation/import/backfill/restore cannot invent old scope, reopen terminal work, erase later restrictions/destruction or replay effects. Unsafe downgrade uses stop/roll-forward.                                                  |
| P32 | Full owner/OpenSpec/ADR-to-command/test trace and existing operator recovery distinguish original result/current route/scope/aggregate follow-through/old rights without private bodies or manual DB repair. Native/user proof gates activation.                  |

## Limits and handoff

No runtime, actual-role database/RLS, concurrency, provider, load, restore, composed browser/AT or intended-user test ran. No real message, private data, credential or external mutation occurred. New 550c source changes were inspected and classified; code, mocks, generated catalogs and documentation remain distinct from native qualification. Supported resource budgets must be measured before activation; no schema, permission engine, quota, duration or provider policy is invented.

Root owns consolidation and ratification. The complete consolidated report/ADR will receive final readback and a proof crosswalk after reconciliation. Only this work note is writable by this agent.

## Final whole-report, ADR and glossary closure — 2026-10-23

Read the complete `work/phase29-q36-adversarial-review.md` and `work/phase29-q36-decision.md`, including all 22 category assessments, 22 user journeys, 18 lifecycle distinctions, 8 measurement rows, 6 operational controls, exact decision, twelve clauses, twenty-eight proof groups and the proposed glossary refinement. Re-read the final changed decision/C03/C04/C06/P04/P08/P20/P21 and glossary after reconciliation. The ADR explicitly incorporates every consolidated C/P in full. The exact corrected decision and ADR selected-decision text have equal 8,756-character bodies and pass normalized whitespace parity.

Two bounded findings from the full readback are resolved:

1. The Q28 staff route now shows actual participant scope/availability, with absence only where applicable; it does not falsely claim that independently valid old-item participant access disappeared merely because staff supplies the added evidence.
2. Consolidated P20 now explicitly tests UPSERT and combined permissive/restrictive policies; P21 includes trigger-invoked writes. These carry the effective real-role proof through rather than relying only on a generic every-writer statement.

Also verified the independently raised narrow-scope precision: an individual current/fresh/recovery admission remains narrow while effective, but its subset alone does not create a permanent global ceiling on later separately authorized admission. Genuine source restrictions still bind. For completed reading, the actual F-created ceiling is binding; a narrower later recovery does not shrink that ceiling, and later admission can never enlarge it from today's request definition. This clarification applies to this note's C04/C08/P04–P07/P13–P14 as incorporated by the consolidated exact decision.

The final package preserves coherent source publication and actual participant-required scope authority, the narrowly qualified Q28/Q21 route without unnecessary regrant, current Q24 added-work coverage without a standing Q25 gate, and source ordering against actual Q22 F and Q34 cancellation. Two distinct additions, deferred evaluation, old-item receipt/transfer, relevant clarification and retry after Q33 removal have truthful separate outcomes. Optional projections cannot authorize scope, create premature F or block independently lawful old work. No unconditional old-grant widening, blanket old-work invalidation, time reset, first completed-view backfill, provider-derived fact or new notification purpose remains.

The accepted/terminal mistaken-collection remedy is more precise in the consolidated report than a generic new-request fallback: retain attributable correction/remediation and actual qualified source/privacy restriction or disposition where needed; a new request does not undo unnecessary evidence already collected. Q33 retains its exact outstanding-unaccepted eligibility, and no generic Undo/unaccept/delete/reopen is added. Every supported stage requires an actual capable route before activation.

The glossary proposal is a bounded amendment to the existing Fresh Unfinished Request Access definition only: approved added-item lineage is included solely through an explicit qualified prospective amendment, within the same original purpose/intended recipient and existing finite-admission semantics. It neither adds a twenty-fourth term nor changes the Avoid line or independently authorizes access. Fresh completed reading retains the actual fulfillment-created scope. Current ratified glossary text remains untouched until ratification.

### Independent proof crosswalk

The root report consolidates this note's 32 proof groups into 28; the following coverage preserves every substantive obligation. Exact decision text and clauses remain binding alongside the proof rows.

| This note | Consolidated coverage                                                 |
| --------- | --------------------------------------------------------------------- |
| P01       | Q36-P01/P12; C01–C02/C05                                              |
| P02       | Q36-P01/P20/P21; C01/C03/C10 and exact decision                       |
| P03       | Q36-P17; C04 and new-work coverage decision                           |
| P04       | Q36-P03/P13; C03                                                      |
| P05       | Q36-P04/P13; C03                                                      |
| P06       | Q36-P05; C03 and participant-demand publication decision              |
| P07       | Q36-P04/P05/P08; C03/C06 and explicit Q13/Q15 amended-lineage mapping |
| P08       | Q36-P06; C03 and Q01 proof decision                                   |
| P09       | Q36-P03/P04/P14/P21; C03/C07/C10                                      |
| P10       | Q36-P02; C02                                                          |
| P11       | Q36-P16; C03/C11                                                      |
| P12       | Q36-P16/P25/P26; C07/C11/C12                                          |
| P13       | Q36-P08/P09/P13; C06                                                  |
| P14       | Q36-P08; C06 and actual completed-ceiling decision                    |
| P15       | Q36-P11/P15; C05/C07                                                  |
| P16       | Q36-P09/P12/P13; C05/C11                                              |
| P17       | Q36-P10; C05/C07                                                      |
| P18       | Q36-P10/P13/P14/P17; C01/C03/C04/C07                                  |
| P19       | Q36-P02/P14; C02/C07                                                  |
| P20       | Q36-P14; C07 and relevant-Q30 decision                                |
| P21       | Q36-P07/P17/P19; C04/C09 and actual-route decision                    |
| P22       | Q36-P15/P16; C07/C11                                                  |
| P23       | Q36-P15/P19; C07/C09                                                  |
| P24       | Q36-P20; C10                                                          |
| P25       | Q36-P20/P21; C10 with explicit UPSERT/policy/trigger proof            |
| P26       | Q36-P19; C09 and stage-correct remediation decision                   |
| P27       | Q36-P13/P18; C03/C08 and target-versus-end decision                   |
| P28       | Q36-P23/P24; C08                                                      |
| P29       | Q36-P21/P23/P25/P27; C10–C12 and privacy/effect decision              |
| P30       | Q36-P22; C05/C11 and finite measurement gates                         |
| P31       | Q36-P26/P27; C12                                                      |
| P32       | Q36-P27/P28; C09/C11/C12 and named operational controls               |

No unresolved material runtime/source/database/auth/lifecycle/recovery contradiction remains in this proposed package. Verdict remains **Accept with required amendments**, awaiting Conrad's ratification. This closes documentation/source review only: no native implementation, actual-role SQL/RLS, concurrency, provider, load, restore, browser/AT or intended-user qualification is claimed. No canonical/root/runtime/provider file or record was changed; only this work note was edited.
