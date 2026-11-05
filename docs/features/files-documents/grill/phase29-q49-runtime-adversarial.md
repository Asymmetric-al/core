# Phase 29 Q49 — Runtime, database and recovery adversarial review

2026-10-25, Asia/Bangkok. Conrad selected **A: guided linked replacement for a different intended person** and requested a complete adversarial review. Q01–Q48 and all 29 canonical terms are ratified. Q49's amendments and any proposed term remain pending ratification; Q50 is unasked. Only this work note is authored. No native implementation, hosted SQL, migration, repository test, provider operation, identity/contact mutation or formal publication is performed.

## Recommendation and key closure

**Accept with required amendments.** The smallest complete model is one resumable inert preparation, one actual source handoff and at most one **ever-issued** direct successor per predecessor. Normal handoff must atomically commit the actual old Q34 cancellation/fence and the new Q25-qualified original issuance, their protected relationship, mandatory history/result and required local outbox work. Providers stay outside the transaction. This is a source command, not a client sequence of Cancel, Create and Send calls.

Urgent old-access containment is a separate permitted act. If an actual source cancellation commits before a replacement can issue, it stays canceled. Preserve or permit the inert preparation and an honest blocked/not-issued result. Later issuance must prove the actual canceled-source remedy and current remaining authority/readiness, without re-canceling, reopening or demanding the earlier actor's cancellation power merely to perform a separately authorized new issuance. A failed or abandoned replacement never rolls back that earlier stop. A canceled label alone is not proof of a legitimate remedy.

The source-bound draft must be protected at **every issuance door**. Generic Issue, import, service, template or direct mutation paths cannot issue it independently while bypassing the predecessor handoff. A UI-only restriction would leave two recipients authorized. At-most-one issuance must persist after the successor is later canceled; uniqueness on a mutable `status = issued` predicate alone would permit a second sibling. Later genuine correction proceeds from the current successor, not by reopening its predecessor's slot.

## Current source, instruction and evidence limits

An independent authenticated comparison **8c8f541a8ad09676795557de3a7b2120519fd959 → develop** returned identical: zero ahead, zero behind and zero files. Current source is pinned to **8c8f541…**. Historical local HEAD remains **3d85897ebf1515008ef5c676b1c58a15422fb9ab**; no pull/reset occurred. The complete prior 21ae→8c8f delta is recorded in the Q49 research note: eight commits, twelve paths, all patches present, with a real Supabase function-grant/policy-role change. Supabase is not described as unchanged.

Read in this continuous scoped review: root/API/Supabase instructions, backend/data-access rules, the Supabase and Postgres skills; full Q34 and Q25 ADRs; the complete Q39 ratified decision; Q01's exact recipient/proof/source-correction clauses; Q13/Q15 same-recipient limits; Q21/Q22/Q30/Q35/Q48 source boundaries; and the new grant guide/migration/role-test source. Current PostgreSQL documentation takes precedence over misleading generic skill shorthand. No instruction to execute SQL or tests overrides this research-only task.

| Evidence                                                                                                                                                                                                                               | Actual observation and relevance                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E01 `packages/auth/context.ts:243–380`, blob `a1fb819f1cfd6e5eb233aeb1c617a79b6e1f3a06`, read at 21ae and unchanged in complete later delta                                                                                            | Current user resolution loads a profile, tenant and memberships; missing profile is unauthenticated. This is not the intended neutral request-only recipient admission, nor an ordinary correction command. Global identity and source recipient are different.                                                                                                                                              |
| E02 `packages/api/src/donor-portal/settings-patch.ts:3–19,33–87`, blob `08b32165da6c249150567488bd2fe3c8df177dbe`                                                                                                                      | Strict profile/settings patch does not accept email, although form prefill includes email. Neither displaying an address nor changing an account field authorizes source request reassignment.                                                                                                                                                                                                               |
| E03 `packages/api/src/crm/identity/concepts.ts:1–90`, blob `8bddbdc8645cbb7ef1bdcf9abf03c2822ed824f1`                                                                                                                                  | Current definitions separate Auth user, profile, tenant membership, CRM person and donor identity. The catalog is not a source-authority resolver or a transaction.                                                                                                                                                                                                                                          |
| E04 `packages/api/src/identity/tenant-guard.ts:1–99`, freshly fetched at 8c8f, blob `06133e276392d54dd00f188ae26331f7637e1988`                                                                                                         | Only acquire/release workflow-claim RPCs are allowlisted; one guarded RPC is the atomicity unit. A callback with several guarded calls is not a multi-command transaction and does not establish Q49 capability.                                                                                                                                                                                             |
| E05 `supabase/migrations/20260802041500_current_user_memberships_rpc.sql`, fresh full read at 8c8f, blob `32e77924d95dd097acbffd0f94dace265727f5a8`                                                                                    | The postgres-owned definer filters active memberships by `auth.uid()` and target tenant; it accepts no arbitrary user ID. The original PUBLIC-only revoke must be read with later grants. Removing that source predicate or using an admin fallback is not an acceptable Q49 adaptation.                                                                                                                     |
| E06 `20261024163000_authz_definer_execute_lockdown.sql`, blob `869b2edbad1bfe78d8af4dd7a75f9a062efa0ea9`; guide blob `929edff357061c8d39c0d78b7a7b237e90cd83f4`                                                                        | Four function entry points now have explicit named grants: membership RPC excludes anon/service_role; the three authz helpers allow authenticated/service_role. Eight CRM policy role lists become authenticated with predicates unchanged. This is real migration-source evidence, not a hosted ACL read or qualification of a new source command. The guide's other-function gaps remain outside this fix. |
| E07 #2270 real-stack test blob `3cb0512009db80f11c5043c63727e601d909ebe0`, static grant test `845da5b2d5dced135d98c9286bb989d1fc35f468`, harness `e9e7201350e5d1f90f85c266f762d450ca3637d5`                                            | Freshly inspected test source exercises exact ACLs, widened-grant simulation, real roles/JWT subjects, 42501 denials, valid own-tenant memberships and unchanged CRM predicates. These tests were **not run** and do not establish native Q49 behavior or deployed grants.                                                                                                                                   |
| E08 `apps/admin/src/cms/create-from-template-endpoint.ts:92–145`, blob `3c4accb0b6acfaa606c84c1af8ce9a78f4614a0c`; `create-from-template-payload-shapes.ts:116–155`, blob `149bd13465420fd1c3666dfaf9fbd9b65466f29d`, fresh 8c8f reads | CMS staff/tenant checks and content cloning remove persisted block row IDs while retaining relationship/rich-text IDs for that owner's content. Such copying would be unsafe for unqualified request people/evidence/grants. CMS field shapes do not authorize ordinary issued-request copying. No exploitable CMS defect is alleged from this scoped comparison.                                            |
| E09 Q34 full ADR `0034-source-owned-request-cancellation.md`                                                                                                                                                                           | Cancellation orders with actual Q22 fulfillment, preserves partial accepted/received history and independent duties, fences ordinary old actions, and provides an independent original-issuance remedy after a mistake. Its finite canceled-status response is not a new file/transcript archive or new admission.                                                                                           |
| E10 Q25 full ADR `0025-review-readiness-before-original-issuance.md`                                                                                                                                                                   | Actual first issuance requires current qualified responsibility and a usable declared-work review path. It recovers a committed original before checking new-issuance eligibility, separates preparation from issuance and keeps provider work outside the coherent source boundary.                                                                                                                         |
| E11 Q39 complete ratified decision `0039-reusable-ordinary-request-templates.md`                                                                                                                                                       | Reusable source-approved definition fields enter independent never-issued drafts. Issued-instance cloning, person/evidence/history/grant/clock/plan copying and permanent live-template dependence are not granted. Q49's reviewed issued-origin definition reuse needs an explicit narrow amendment.                                                                                                        |
| E12 Q20 full scope readback `0020-default-on-fresh-access-notices.md:31–47`                                                                                                                                                            | Q20 governs **fresh unfinished and fresh completed-read access notices** and expressly excludes initial invitations. An earlier exploratory coordination message incorrectly labeled the successor invitation Q20; that suggestion is withdrawn. The new original invitation requires its actual source/P17/P6 binding. Q35 separately governs an actual old cancellation notice.                            |

No native ordinary recipient-replacement writer, coherent old/new transaction or complete participant handoff was established by the scoped source search. This is an implementation/qualification gap, not a discovered production defect. Retained/private requests, hosted SQL, Auth users, actual recipient identities and provider accounts were not inspected.

## Current primary technical research

Context7 resolved and queried PostgreSQL 17 and Supabase; current primary pages were also read. [PostgreSQL transactions](https://www.postgresql.org/docs/17/tutorial-transactions.html) support an all-or-nothing local mutation. [Transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html), [application consistency](https://www.postgresql.org/docs/17/applevel-consistency.html) and [serialization-failure handling](https://www.postgresql.org/docs/17/mvcc-serialization-failure-handling.html) require actual concurrency design and bounded whole-transaction retry where applicable. They do not make several RPCs atomic or guarantee that an unlocked preflight remains current.

[CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) distinguishes existing-row selection from resulting-row checks, including trigger timing and applicable UPSERT/MERGE/SELECT behavior. Omitted WITH CHECK may inherit USING; omission alone is not a proven reparenting bug. [CREATE FUNCTION](https://www.postgresql.org/docs/17/sql-createfunction.html) and [Supabase functions](https://supabase.com/docs/guides/database/functions) distinguish effective invoker/definer privilege and explicit function callers. A safe search path does not restrict the caller set; a grant to authenticated does not supply row/source authority. A definer's actual owner/BYPASSRLS/table ownership/policies matter; “all definers bypass” is not the review rule. The current 8c8f migration is a concrete reason to inspect named/default grants rather than assume PUBLIC-only revoke is sufficient.

No schema, global isolation setting, database framework, queue platform, extension or provider is selected by these references. The authoritative source must adopt the smallest qualified current mechanism and prove it under real roles and races.

## Exact proposed amendments

### C01 — Different-person correction and actual source eligibility

Limit this operation to eligible ordinary request work needing a genuinely different intended person under the same qualified tenant/environment/requesting source and continuing legitimate purpose. Use guided linked replacement even when the predecessor is untouched; do not retain a pristine same-request retarget branch. Same-person mailbox recovery, representation, collaborator addition and specialist/ownership transfer stay separate. A source-approved address and actual person/role eligibility are required; string similarity, account presence or a checkbox is not proof. Actual fulfilled predecessors do not enter unfinished cancellation. A real prior cancellation may support only its proved current source remedy, not an arbitrary terminal-status shortcut.

### C02 — Separate capabilities and trusted context

Preparation, origin-definition read/reuse, destination draft authoring, responsibility administration, cancellation/restriction, new issuance and repair require their actual source/P12 powers. Derive actor, tenant/environment, source and occurrence time from trusted context; validate caller-selected targets and content. File Read, reviewer/task role, administrator label, service key and draft creator identity do not imply these powers. Sufficient lawful source facts may justify old cancellation without old file inspection; copy only text/definitions the actor can actually read and disclose. A later authorized operator may continue without impersonating the creator. Once an earlier stop is committed, require current authority for remaining acts rather than re-demanding the earlier actor's cancel permission.

### C03 — One inert resumable preparation and safe definition reuse

Keep at most one active source-owned replacement preparation per predecessor, using ordinary draft facilities and a protected immutable origin relationship. Repeated Start recovers or returns the existing permitted preparation instead of creating another or leaking its contents. Draft creation/edit/autosave and recipient selection are inert: no old stop, new grant, invitation, reminder or reserved future issuance. Drafts do not block predecessor fulfillment/safety work. Explicit discard preserves any earlier stop; later genuine preparation receives a new identity.

Explicitly qualify reuse of selected current compatible ordinary labels/types/instructions/requiredness from the issued origin into fresh draft/item IDs. Q39 is not a Clone permission. Preserve exact selected origin revision/member attribution and independent destination content; no silent latest-pointer substitution, partial successful copy or overwrite of staff edits. Review prose for private or prior-person content; an allowlist/AI promise cannot make it safe. Do not copy evidence/attachments, conversations, assertions, acceptance, outcomes, identities, grants/proofs, reviewer instances, clocks, message material, reminder plans or personal preferences. Qualified operative references keep their exact meaning/current access; no new fetch/archive engine.

### C04 — New work and first-issuance readiness are independently reviewed

Determine actual remaining legitimate work before issuance. Do not recollect already sufficient evidence merely to replace a label, copy old acceptance into new items, turn optional work into a hold or require the new person to attest that they supplied old files. Separate current Q28 evidence reuse remains available only under its own origin/target authority and true staff attribution. No legitimate new recipient work means no fabricated replacement obligation.

Reuse current Q24 coverage only when it genuinely satisfies Q25 for the successor's declared work; no automatic assignment transfer, entire-roster/body-read/online requirement or blanket extra approval. Recheck current recipient, safe definitions, source purpose, declared responsibility, actual original access terms and reviewed communication choices at commit after waits. Relevant new evidence/clarification/requirement changes fence an older decision; unrelated aggregate changes need not force universal reconfirmation.

### C05 — Atomic normal cancellation and new issuance

The normal final handoff must be one authoritative transaction over the local old cancellation/fence, new original issuance, unique issued relationship, mandatory history/audit, permanent result and required local follow-through/outbox. Expensive rendering, providers and remote calls stay outside source locks. A definite failure rolls back all new transaction facts; no canceled predecessor plus unissued draft is called a completed replacement. A post-commit response/projection failure recovers source success. If this actual coherent boundary cannot be qualified, the path is not activatable; sequential RPCs or compensation that reopens the predecessor are not substitutes.

The bound draft cannot escape through generic Issue, import, job, service, raw DML or another UI. Every issuance door must invoke the handoff or the proved earlier-cancellation remedy; otherwise it is closed. Do not allow a caller to clear/reparent the replacement binding merely to evade old-authority handling or successor uniqueness.

### C06 — Independent urgent stop and permanent blocked-replacement recovery

Allow actual current source restriction or Q34 cancellation without waiting for a draft, new recipient or mail. An access-only restriction is not itself cancellation. An already committed Q34 cancellation remains terminal. If new issuance is invalid, unavailable or rejected, expose the true canceled old record and unissued/blocked preparation with a capable owner repair path; do not reopen, re-cancel, resend cancellation or label it complete replacement.

Later deliberate issuance must prove the exact original cancellation, legitimate current remedy, current remaining permissions/readiness and unused successor relation. Atomically commit only the remaining new issuance, relationship, result/history and outbox. Repairing readiness does not auto-issue. Discarding the draft leaves the old stop intact; a new authorized preparation may be made if the actual source remedy remains legitimate. Missing cancellation provenance or unknown commitment requires reconciliation, not status-based guessed eligibility or a second request key.

### C07 — Source order, actual time and late work

Use the actual request source order against fulfillment, cancellation, receipt, clarification, evidence adoption, instructions/requiredness and authority. Durable fulfillment first prevents this stale cancellation/handoff; a click, transfer or queued Q22 evaluation is not fulfillment. Receipt or clarification first remains an immutable old fact and requires relevant review of the proposed work; cancellation first prevents new ordinary predecessor acts. Already admitted independent safety/retention/follow-through retains its own authority. A late processor records only its exact permitted technical fact, never routes old bytes to the successor or revives old intake.

Record actual source occurrence/admission time after relevant waits. Do not copy old created-at, requested-by, clock ends or receipt timeliness into new issuance. A deliberately reviewed past soft target remains possible only where Q09/Q46 actually permit it; no automatic stale target carryover, backdated act or access extension follows.

### C08 — Permanent unique issued lineage, not a reusable status slot

Enforce one active preparation and at most one **ever-issued** direct successor per predecessor, with at most one predecessor for a replacement, exact same-scope references and no self-link/cycle. An issued edge cannot be cleared, retargeted or made reusable by canceling the successor, cleaning up a draft or restoring an old backup. Uniqueness only while a child is currently `issued` is inadequate. A later mistake uses the current successor's qualified remedy and, if legitimate, its own new replacement; the old predecessor never issues a sibling. Genuine separate needs use independently reviewed ordinary authoring, not duplicate obligations disguised as replacements. Link history is not an access grant or a second state owner.

### C09 — Original semantic recovery and canonical no-op

Bind each preparation/save/stop/final handoff to stable source operation identity and material intent. Recover a matching committed result under current disclosure before evaluating eligibility for a genuinely new act; return original facts plus current safe status, never rewrite today's state with an old response. Same key with changed recipient/definitions/intent conflicts. Canonical save/control no-op under current authority/expected basis changes no business revision, clock, event or count; stale expected basis conflicts even after values change away and back. Required security audit remains separate. Different concurrent transport keys still cannot issue two successors. Retry an aborted serialization transaction as the entire intended transaction with fresh relevant checks; reconcile ambiguous commitment before attempting another operation. Provider keys and leases are not permanent identity.

### C10 — Preserve old history and qualify new access separately

Keep old receipt, accepted evidence, discussions, actors, holds, retention and independent uses intact. Q34 fences old ordinary actions and narrows any then-valid unfinished admission only to its exact finite Canceled/help response; no file/transcript/internal reason/new-person disclosure, new root, renewal or normal completed view. Wrong-recipient/privacy/expired/unknown status authority yields neutral unavailable/help. Independent shares keep their own actual restrictions, not automatic transfer or universal revocation. Delivered bytes cannot be recalled.

The successor gets fresh item IDs and actual Q11/Q12 original admission, Q25 readiness and Q01 current recipient/proof qualification. It is not Q13/Q15 continuation, grant union or inherited Q06 completed access. Reuse a proof only when explicitly qualified for that principal/address/revision/new context; do not force full enrollment or fabricate a Party. No global Auth, CRM person, donor, membership or contact mutation is part of Q49.

### C11 — Separate cancellation, original invitation and reminder effects

An actual new old-request cancellation can produce Q35 only under its actual original choice/plan/contact/material/usefulness rules. Wrong-recipient privacy can prohibit mail to the old address without preventing lawful source cancellation or new issuance; do not impose a blanket ban or unconditional notification. Earlier committed cancellation produces no duplicate Q35 event when the replacement later issues. The successor's **original invitation** uses its independently qualified source/P17/P6 purpose; Q20 expressly excludes initial invitations and cannot be borrowed without an explicit owner amendment. No new recipient-change/composite notice, staff broadcast or channel is granted.

Capture required local communication handoff with the source result. Prove original policy/plan-publication ordering and complete bounded P6 candidate/hash validation, one/proved-zero/unknown, no child before full parent release and exact committed replay without appended children. Missing optional mail does not create false source failure or permission to issue another request. Preserve exact frozen recipient/material/account/environment/provider pins. Existing P17/P6 sealed possible-submission, callback, definite-rejection and indeterminate rules remain; only `concurrent_idempotent_request`, exact typed `provider_5xx`, or `network_or_timeout` with an exact sealed request and no contradictory evidence allow at most two total identical-envelope follow-ups after the initial call, within every earlier deadline/current fence. Other indeterminate causes reconcile only. Never rekey accepted/unknown work or promise recall.

Q48 old eligibility ends under actual old source cancellation, while old plans/counts/stops/reservations/unknown facts remain. A genuinely new person may get the new original request's independently qualified current plan/count/choice; this does not reset the predecessor. Do not copy individual stops or erase broader restrictions that still apply; source/P3 rules must reject nominal identity/contact-alias changes used to evade a person's stop, cap or contact restriction. Every old effect remains pinned to its original purpose/recipient.

### C12 — Native structural and real-role authorization proof

Enforce required scope, typed identities, valid state combinations, fresh item identity, immutable actor/issuance/outcome provenance and same-tenant/environment/source predecessor/draft/successor/member references. Native uniqueness must survive all subsequent terminal states. Prevent silent cascades that erase independent history, grant facts or the consumed successor relation. Dynamic authorization remains current source/P12, not a copied ready flag or denormalized counter.

Inspect effective schema/table/sequence/function privileges, named/default/inherited grants, exposed schemas, ENABLE/FORCE state, owners/BYPASSRLS, actual invoker/definer role/search path/EXECUTE/overloads, views and trigger writes. Test SELECT/RETURNING, INSERT/UPDATE/DELETE, UPSERT/ON CONFLICT and supported MERGE, combined permissive/restrictive old-row USING and resulting-row WITH CHECK, including inherited checks. Every API/GraphQL/CMS/collection/raw/import/job/operator/service/restore door must preserve the command or be closed. The 8c8f lockdown is narrow; neither it nor `withTenant` supplies new source authority or atomicity for a multi-call handoff. Keep one fine-grained P12 PDP and its prescribed coarse tenant defense, not a second authorization engine or universal new FORCE instruction.

### C13 — Current disclosure, concise usable flow and actual repair

Protect the predecessor/successor link, chosen recipient, draft text, history, counts, errors/cursors and original-operation results under current source/field/P12 rights. Seeing one request does not expose the other or the new person's identity to the old recipient. Invalidate or reject stale private UI/cache/late results after tenant, actor, recipient or permission changes. Technical diagnostics remain payload-free/minimized; protected business/security evidence keeps its actual owner and retention.

Use one source-context preparation and explicit final action that describes its actual effects. A previously canceled source needs issuance wording, not another Cancel claim. Distinguish active old request, inert new draft, independent stop, blocked readiness, committing/unknown result, issued successor and delivery problem. Preserve lawful input/focus, keyboard/AT/speech/touch/mobile/RTL/IME/long-name/date-zone usability and original recovery on weak networks. No routine essay, extra reviewer, signup, preview/download, double confirmation on every save, transfer dashboard, bulk reassignment or SQL-only support path.

### C14 — Bounded work, retention and prospective rollout

Use indexed exact current/predecessor/successor/operation lookups and stable bounded history pages; no recursive whole-chain scan, per-file polling, byte copy, mandatory Realtime, generic saga or new provider. Before activation record measured item/text/preparation, query/rows/governance, lock/transaction/retry/concurrency, history/retention, outbox/recovery and cost bounds with units and accountable operators. P12's governed-read budget remains its own set-wise obligation, not an asserted cap on the entire source transaction. No unchanged-bill claim follows existing infrastructure.

Census retained drafts/issued/canceled facts and every writer before exposing replacement. Do not guess unused slots/relationships/proofs from missing history or similar names/emails. Preserve current cancellation/issuance/privacy/possible-send history across mixed schema/client/cache/provider restore before serving or dispatch. Fence unsafe old writers; scoped disable preserves known results, existing issued requests and independent urgent containment. Roll forward when old code cannot honor admitted facts; never roll back by reopening or deleting a source record. Separate lawful readable-history/draft minimization from the minimal opaque uniqueness/stop/result evidence needed to reject or reconcile stale retries. Every claimed native source/role/race/provider/load/AT/intended-user outcome remains a release proof, not a result of this research.

## Calibrated material risks

| Omission or naive reuse                               | Severity / likelihood            | Effect on A and exact fix                                                                                                                                                              |
| ----------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sequential cancel/create/send or generic Issue bypass | High / plausible                 | Dual authority or old stopped with falsely “issued” successor. E04/E09/E10; C05/C06/C12 require actual atomic normal handoff and distinct urgent-stop continuation at every door.      |
| Mutable-status uniqueness or lost operation identity  | High / plausible                 | Two successors, a reused slot after cancellation, or replay rewriting current state. C08/C09 require permanent issued lineage and original result first.                               |
| Whole-request/CMS clone                               | High / plausible                 | Old person's private text/relationships, evidence, acceptance or access copied to a new person. E08/E11; C03/C04/C10 require selected safe definition reuse and independent admission. |
| Blanket terminal handling                             | High / plausible                 | Fulfilled old work canceled or a real earlier cancellation cannot recover. E09/E10; C01/C06/C07 distinguish actual fulfillment, cancellation provenance and current remedy.            |
| Incorrect role/ACL assumption                         | High / plausible                 | Service/admin/global identity used as source authority or exposed function permits forbidden writes. E01–E07; C02/C12 require real effective roles, named grants and one PDP.          |
| Recipient/notice retarget                             | High / plausible                 | Wrong-address disclosure, copied unknown provider intent or Q20 scope expansion. E12/C10/C11 require exact original purposes and independent invitation binding.                       |
| Misleading UI/repair                                  | Medium–High / plausible          | Inert draft looks like containment, mail failure looks like source failure, or no way to continue a stopped request. C05/C06/C09/C13 close the permanent journey.                      |
| Unbounded history/work or guessed restored state      | Medium–High / workload-dependent | Slow/hot transactions, duplicate effects or unsafe old rights after restore. C08/C12/C14 require bounded current reads and authoritative adverse lineage.                              |

These are risks in the proposed capability and unsafe reuse, not assertions of deployed Q49 defects or an independently verified hosted exploit.

## Prospective native proof groups

| Proof | Required observable result                                                                                                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01   | Exact ordinary different-person/current-purpose eligibility; same-person recovery, delegation, ownership transfer, specialist and fulfilled contexts remain separate.                                                                  |
| P02   | Current separate preparation/reuse/cancel/restrict/responsibility/issue/repair capabilities; generic roles/read/session/creator cannot grant them.                                                                                     |
| P03   | One active preparation under concurrent Start, protected existing-result recovery and authorized continuation after creator departure.                                                                                                 |
| P04   | Draft/autosave/recipient selection/discard are inert; no grant, cancel, mail, reminder, fulfilled-state hold or rollback of earlier stop.                                                                                              |
| P05   | Complete selected source-approved definition copy with fresh IDs/current origin basis, safe prose review and no private/history/evidence/grant/clock/plan/relationship clone.                                                          |
| P06   | Copy/edit/source-revision race both orders, no silent latest substitution, partial success, lost input or later live-template propagation.                                                                                             |
| P07   | Actual legitimate remaining work, optionality and prior source-sufficiency; no recollection/attestation/acceptance copy; independent Q28 reuse only.                                                                                   |
| P08   | New Q25 readiness with current Q24 coverage, no automatic reviewer copy or future-file/roster/online requirement; incapable actor gets real continuation.                                                                              |
| P09   | Coherent final old cancellation/fence + new original issuance + unique relation/history/result/outbox; faults before/after every local write/commit expose no partial normal handoff.                                                  |
| P10   | Generic Issue/raw/import/service/alternate paths cannot independently issue the bound replacement draft or silently unlink it to bypass handoff.                                                                                       |
| P11   | Current ordinary cancellation can act without file preview/read when sufficient safe source facts exist; urgent restriction remains distinct from cancellation.                                                                        |
| P12   | Prior committed cancellation plus failed/absent/discarded draft remains stopped; current legitimate remedy can later issue without re-cancel/re-notify/reopen or irrelevant old cancel permission.                                     |
| P13   | Missing/unknown/foreign cancellation provenance, wrong purpose or consumed successor cannot be turned into an old-status issuance entitlement.                                                                                         |
| P14   | Fulfillment versus normal handoff both directions; actual durable Q22 outcome, not click/transfer/queued reevaluation; earlier source fact cannot be overwritten.                                                                      |
| P15   | Receipt/clarification/adoption/requirement/instruction changes versus final review/commit both directions; preserve new original fact and revalidate only relevant old decision.                                                       |
| P16   | Handoff-first denies new old-context intake/correction/review/Q30 acts; late scanner/processor only records its permitted exact result, never assigns old bytes to successor.                                                          |
| P17   | At most one ever-issued successor and one predecessor; self/cross-scope/cycle/reparent attempts denied; canceled successor does not reopen predecessor slot.                                                                           |
| P18   | New mistake on the issued successor uses its actual current remedy/new link; independent needs cannot be fake replacement siblings.                                                                                                    |
| P19   | Matching committed preparation/stop/handoff replay before new eligibility, changed-intent conflict, loss after commit, current result disclosure and no late-state overwrite.                                                          |
| P20   | Canonical new save no-op/current expected basis, ABA/stale conflicts, no new business revision/clock/count/effect; security audit retained.                                                                                            |
| P21   | Concurrent different keys/actors, serialization/deadlock retry and expired transport dedup cannot duplicate issuance or bypass current source checks.                                                                                  |
| P22   | Actual new issuance time/current original Q11/Q12 terms, safe reviewed Q09/Q46 target including permitted past soft target; no copied/backdated access/receipt terms.                                                                  |
| P23   | New Q01 principal/address/context proof and limited route, exact compatible proof reuse; no old session/link/grant retarget, fake Party, signup or global identity mutation.                                                           |
| P24   | Old Q34 finite outcome-only root/end/current restrictions; no old files/transcript/new-person identity or canceled renewal; independent rights and retention preserved.                                                                |
| P25   | New Q35 only for actual cancellation and none for earlier cancellation replay; current wrong-recipient/privacy/choice rules; original invitation separately qualified and not mislabeled Q20.                                          |
| P26   | Source/plan-publication ordering, complete P6 candidate/hash/one-zero-unknown membership validation, no child before release, before/after crash and no appended replay child.                                                         |
| P27   | Exact sealed provider recipient/material/pins and pre-byte possible-submission; recognized definite rejection versus indeterminate, three permitted causes/at-most-two follow-ups/current fences/deadlines; no accepted/unknown rekey. |
| P28   | Old Q48 plan/count/stop/unknown evidence preserved and fenced; genuinely new recipient/request gets current lawful plan, no preference transfer or nominal identity/cap-evasion workaround.                                            |
| P29   | Required native same-scope keys/FKs/unique/closed states and immutable actor/issuance/outcome relation; no cascade that loses history or releases issued slot.                                                                         |
| P30   | Real effective grants/defaults/inherited roles/ENABLE/FORCE/owner/BYPASS, SELECT/RETURNING/all DML/UPSERT/MERGE and composed old/new checks.                                                                                           |
| P31   | Actual EXECUTE/search path/overloads/views/trigger/raw/API/GraphQL/CMS/collection/service/import/operator/restore doors preserve source command or are closed; current 8c8f grant changes correctly scoped.                            |
| P32   | Single current P12 PDP/trusted context and prescribed coarse tenant defense, set-wise governed metadata/result/history/link disclosure and no cross-person existence oracle.                                                           |
| P33   | Context switches/revocation/late responses/cache/export/count/error cursors and protected relationship privacy; no sensitive payloads in general telemetry.                                                                            |
| P34   | Protected true actor/history/source result versus transport/audit/technical evidence; legitimate finite retention/holds and minimal opaque stale-replay/slot proof.                                                                    |
| P35   | Bounded indexed operations/history, finite item/text/transaction/locks/retries/concurrency/outbox/cost and exact/one-over representative workload proof.                                                                               |
| P36   | Mixed writer/schema/client/cache/provider restore, stopped/issued/unknown provenance, scoped disable and safe roll-forward; no guessed mappings or old access revival.                                                                 |
| P37   | Complete accessible staff/old-recipient/new-recipient/operator journey, mobile/AT/keyboard/speech/RTL/IME/long names/localized times/weak networks with true outcomes and lawful input/focus.                                          |
| P38   | Native dependency/source/P17/P6/role/clock/provider/intended-user proof and canonical trace; static sources, adjacent tests and isolated model are not implementation/activation.                                                      |

## All 22 adversarial categories

| Category                                   | Material concern / severity / likelihood | Consequence, adjustment and exact prevention                                                                                                                                                                                                                             |
| ------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Necessity/alternatives                  | Yes / Medium / plausible                 | A avoids a second pristine-state correction model but must not become manual retyping. Keep guided safe reuse and genuine B tradeoff acknowledged; no measured-frequency claim. C01/C03/C04.                                                                             |
| 2. Brittleness                             | Yes / High / plausible                   | Mutable recipient/status or independent API calls disguise source order. Bind exact preparation and actual terminal/issuance facts. C05–C09.                                                                                                                             |
| 3. Technical debt                          | Yes / Medium / plausible                 | Generic clone/saga/transfer framework duplicates owners. One ordinary source command, draft and protected relation. E08/C03/C05/C14.                                                                                                                                     |
| 4. Edge cases                              | Yes / High / plausible                   | Prior receipt/clarification, partial accepted work, prior stop, fulfilled-first, discarded draft or canceled successor. Exact source branches and durable lineage. C01/C04–C10.                                                                                          |
| 5. Footguns                                | Yes / High / plausible                   | Preparing looks like containment, generic Issue bypasses handoff, a copied instruction leaks or failed mail causes another request. C03/C05/C06/C11/C13.                                                                                                                 |
| 6. Tenant safety                           | Yes / High / plausible                   | Foreign predecessor/draft/recipient relation or service-context default grants authority. Trusted scope and every-door current source proof. C02/C12/C13.                                                                                                                |
| 7. Database/RLS/authorization              | Yes / High / plausible                   | Named grants, effective definer/owner roles, resulting-row mutation, trigger write or split commit escapes intent. Fresh E04–E07; real constraints/roles/transaction. C05/C12.                                                                                           |
| 8. Overengineering                         | Yes / Medium / plausible                 | Multiple clone frameworks, whole-chain engine, calendars, new provider or approval ritual. Small bounded local source model and existing qualified owners. C03/C05/C13/C14.                                                                                              |
| 9. UX/UI/friction                          | Yes / Medium–High / plausible            | Users cannot tell which request is active, whether old access ended, or how to recover a stopped source. Actual states and capable simple continuation. C06/C09/C13.                                                                                                     |
| 10. Source truth/invariants                | Yes / High / plausible                   | Replacement relabels old supplier, copies acceptance or reopens canceled/fulfilled source. Immutable old facts and new original authority. C04/C07/C08/C10.                                                                                                              |
| 11. Hidden coupling                        | Yes / High / plausible                   | Q39 clone, Q13 continuation, Q20 initial invitation, Q48 preference/count or global identity edits borrowed incorrectly. Exact owner scopes. E12/C03/C10/C11.                                                                                                            |
| 12. Failure modes                          | Yes / High / plausible                   | Old stop commits alone during alleged normal handoff, unknown result rekeyed, draft disappears or issued child deleted to retry. Co-commit versus independent stop clearly separated. C05/C06/C08/C09.                                                                   |
| 13. Lifecycle/time/concurrency/idempotency | Yes / High / plausible                   | Terminal-first races, two starts/issues, ABA, old response or provider window interpreted as source identity. Exact expected basis, permanent original result and bounded serialized retries. C07–C09/C11.                                                               |
| 14. Data integrity                         | Yes / High / plausible                   | Mutable-status unique index permits a sibling after child cancellation; cross-scope/cyclic links or cascades erase truth. Permanent native issued relation and immutable provenance. C08/C12/C14.                                                                        |
| 15. Security/privacy                       | Yes / High / plausible                   | New recipient sees old text/transcript/identity; wrong old address gets new-context notice; links reveal protected association. Current field/source disclosure and purpose-qualified messages. C03/C10–C13.                                                             |
| 16. Scalability/performance                | Yes / Medium / workload-dependent        | Recursive history reads, copy-all text/bytes, global locks or unbounded operations. Current indexed bounded lookups, short transactions and measured budgets. C05/C14.                                                                                                   |
| 17. Operational burden                     | Yes / High / plausible                   | Prior stop makes source unrecoverable, old creator must return, or SQL/provider console becomes normal remedy. Current remaining authority and persistent honest repair. C02/C06/C13/C14.                                                                                |
| 18. Observability/auditability             | Yes / High / plausible                   | No link between true stop/new issuance, impersonated actor or source success equated with mail. Coherent protected source/result history and separate transport evidence. C02/C05/C09/C11/C13.                                                                           |
| 19. Dependency/integration                 | Yes / High / plausible                   | Current guard/grant patch/template machinery mistaken for native Q49. Explicit adoption of source/P12/P6/P17 and exact new invitation contract. E01–E12/C11/C12.                                                                                                         |
| 20. Migration/rollout/upgrade              | Yes / High / plausible                   | Similar names/emails fabricate lineage, old Issue writer bypasses new binding, backup frees used slot or revives recipient. Prospective census, old-writer fences and adverse-history restore. C08/C12/C14.                                                              |
| 21. Testability/traceability/proof         | Yes / High claim risk / plausible        | A recorded option, static SQL or toy model presented as native success. P01–P38 are required prospective real-role/race/provider/user/load proof. C14.                                                                                                                   |
| 22. Other hazards                          | No additional independent concern        | Financial/specialist ownership, signature truth, public publication, broad contact editing and universal transfer were checked and remain outside scope. Their risks are addressed by C01/C03/C10–C12; no new money type, legal guarantee or product branch is inferred. |

## Finite budgets and permanent controls

Before Live, bind concrete measured profiles for draft/item/text and selected-copy size; current/history query rows/pages/payloads; native source transaction/lock/connection/retry work; simultaneous preparation/handoff fairness; communication member/outbox/attempt/recovery bounds; protected readable retention versus minimal uniqueness/stop/result evidence; client/render/AT/network cohorts; and actual database/runtime/provider costs. These are finite owner-qualified release values, not invented marketing capacities or a new founder cadence choice.

Permanent operational controls are scoped new-handoff disable, independently authorized urgent containment, original-result reconciliation, current draft/readiness repair, source-proven prior-cancellation continuation, exact provider outcome repair, immutable relationship/restore reconciliation and safe roll-forward. Confirmed unauthorized action, duplicate issued edge, dual ordinary authority after a purported normal handoff, lost immutable fact or stopped-effect revival is a prevention failure requiring containment and requalification, not monitor-only acceptance. Routine repair must remain possible without raw SQL, deleting the successor or reopening the predecessor.

## Review status and model plan

This note contains **14 exact proposed clauses, 38 prospective proof groups and all 22 category findings**. Root's complete 22-paragraph decision body was read; the every-door bound-draft fence and clarification that reviewed permitted past soft targets remain possible were sent for readback. The earlier exploratory Q20 invitation label has been corrected explicitly above. A bounded credential-free state illustration will be appended after the exact single-preparation/coherent-handoff rules are modeled; no implementation or native proof is claimed. Full consolidated report/ADR review remains a separate next step.

## Credential-free state illustration — exact saved code

The following Python standard-library code is saved only in this note and runs in memory. `old_write` and `new_write` represent only ordinary unfinished participant-write admission in the model, not every independently lawful read/right. The fixture's booleans stand in for source decisions solely to make serial outcome expectations explicit; they are **not** a native PDP or authorization design. Deep-copy commit/rollback illustrates intended local atomicity; it does not prove PostgreSQL locks, isolation, RPC behavior, real concurrency, outbox delivery or P6/P17. No private data, database, network, repository test or provider is used.

```python
from copy import deepcopy
from itertools import permutations

class Source:
    def __init__(self):
        self.old = 'active'
        self.old_revision = 0
        self.old_write = True
        self.cancel_proved = False
        self.active_prep = None
        self.drafts = {}
        self.successor = None
        self.operations = {}
        self.outbox = []
        self.serial = 0

    def prepare(self, key):
        if key in self.operations:
            return ('replay', self.operations[key][1])
        if self.successor:
            return ('already_issued', self.successor)
        if self.active_prep:
            return ('existing', self.active_prep)
        self.serial += 1
        draft = f'D{self.serial}'
        self.drafts[draft] = dict(state='draft', revision=0, bound='OLD', new_write=False)
        self.active_prep = draft
        self.operations[key] = (('prepare',), draft)
        return ('prepared', draft)

    def discard(self, draft):
        if self.active_prep != draft or self.drafts[draft]['state'] != 'draft':
            return 'conflict'
        self.drafts[draft]['state'] = 'discarded'
        self.active_prep = None
        return 'discarded'

    def stop(self, key, allowed=True):
        if key in self.operations:
            return 'replay'
        if not allowed:
            return 'denied'
        if self.old != 'active':
            return 'not_active'
        self.old, self.old_write, self.cancel_proved = 'canceled', False, True
        self.old_revision += 1
        self.outbox.append('cancel:OLD')
        self.operations[key] = (('stop',), 'canceled')
        return 'canceled'

    def fulfill(self):
        if self.old != 'active':
            return 'blocked'
        self.old, self.old_write = 'fulfilled', False
        self.old_revision += 1
        return 'fulfilled'

    def generic_issue(self, draft):
        if self.drafts[draft]['bound']:
            return 'handoff_required'
        raise AssertionError('independent issuance is outside this model')

    def handoff(self, key, draft, expected_old, expected_draft=0,
                can_cancel=True, can_issue=True, ready=True,
                remedy=True, fail_after_old_write=False):
        fingerprint = ('handoff', draft, expected_old, expected_draft)
        if key in self.operations:
            previous, result = self.operations[key]
            return ('replay', result) if previous == fingerprint else ('intent_conflict', None)
        if self.successor:
            return ('successor_exists', None)
        if self.active_prep != draft or self.drafts[draft]['state'] != 'draft':
            return ('draft_conflict', None)
        if self.old_revision != expected_old or self.drafts[draft]['revision'] != expected_draft:
            return ('stale_basis', None)
        if self.old == 'fulfilled':
            return ('terminal', None)
        if self.old == 'active' and not can_cancel:
            return ('cancel_denied', None)
        if self.old == 'canceled' and not (self.cancel_proved and remedy):
            return ('unproved_remedy', None)
        if not can_issue or not ready:
            return ('new_issue_blocked', None)
        candidate = deepcopy(self.__dict__)
        if candidate['old'] == 'active':
            candidate['old'] = 'canceled'
            candidate['old_write'] = False
            candidate['cancel_proved'] = True
            candidate['old_revision'] += 1
            candidate['outbox'].append('cancel:OLD')
        if fail_after_old_write:
            return ('rolled_back', None)  # candidate never commits
        candidate['drafts'][draft]['state'] = 'issued'
        candidate['drafts'][draft]['new_write'] = True
        candidate['successor'] = draft
        candidate['active_prep'] = None
        candidate['outbox'].append(f'issue:{draft}')
        candidate['operations'][key] = (fingerprint, draft)
        self.__dict__ = candidate
        assert not (self.old_write and self.drafts[draft]['new_write'])
        return ('issued', draft)

# Inert preparation, resumability, discard and no generic Issue bypass.
s = Source(); d = s.prepare('p1')[1]
assert s.prepare('p2') == ('existing', d)
assert s.old == 'active' and s.old_write and not s.outbox
assert s.generic_issue(d) == 'handoff_required'
assert s.discard(d) == 'discarded' and s.old_write
d2 = s.prepare('p3')[1]
assert d2 != d and s.old == 'active'
print('inert_single_preparation_discard_and_issue_door', 'passed')

# A failure after tentative old cancellation cannot expose a partial normal handoff.
s = Source(); d = s.prepare('p')[1]
assert s.handoff('h', d, 0, fail_after_old_write=True)[0] == 'rolled_back'
assert s.old == 'active' and s.old_write and s.successor is None
assert s.drafts[d]['state'] == 'draft' and s.outbox == []
assert s.handoff('h', d, 0) == ('issued', d)
assert s.outbox == ['cancel:OLD', f'issue:{d}']
print('normal_atomic_failure_then_same_intent_success', 'passed')

# Earlier real cancellation survives failed issuance and draft discard.
s = Source(); d = s.prepare('p')[1]; assert s.stop('stop') == 'canceled'
assert s.handoff('h', d, 1, can_cancel=False, ready=False)[0] == 'new_issue_blocked'
assert s.old == 'canceled' and not s.old_write and s.successor is None
assert s.discard(d) == 'discarded' and s.old == 'canceled'
d = s.prepare('p-new')[1]
assert s.handoff('h-new', d, 1, can_cancel=False) == ('issued', d)
assert s.outbox.count('cancel:OLD') == 1
assert s.outbox.count(f'issue:{d}') == 1
print('urgent_stop_failed_issue_discard_later_current_issuance', 'passed')

# A canceled label or access-only stop cannot invent missing authority.
s = Source(); d = s.prepare('p')[1]; s.old = 'canceled'; s.old_write = False
assert s.handoff('h', d, 0)[0] == 'unproved_remedy'
s = Source(); d = s.prepare('p')[1]; s.old_write = False
assert s.handoff('h', d, 0, can_cancel=False)[0] == 'cancel_denied'
print('status_only_and_access_only_are_not_cancellation_proof', 'passed')

# Two different transport keys cannot issue siblings from one preparation.
for order in permutations(('h1', 'h2')):
    s = Source(); d = s.prepare('p')[1]
    results = [s.handoff(k, d, 0)[0] for k in order]
    assert results == ['issued', 'successor_exists']
    assert len([x for x in s.outbox if x.startswith('issue:')]) == 1
print('competing_handoff_serial_orders', 2, 'one_successor_each')

# Actual fulfillment first wins; handoff first keeps old fulfillment blocked.
for order in permutations(('fulfill', 'handoff')):
    s = Source(); d = s.prepare('p')[1]; results = []
    for action in order:
        results.append(s.fulfill() if action == 'fulfill' else s.handoff('h', d, s.old_revision)[0])
    assert results == (['fulfilled', 'terminal'] if order[0] == 'fulfill' else ['issued', 'blocked'])
print('fulfillment_handoff_serial_orders', 2, 'single_terminal_order')

# New receipt/context facts force actual refreshed review; no silent old-basis issue.
s = Source(); d = s.prepare('p')[1]; s.old_revision += 1
assert s.handoff('h', d, 0)[0] == 'stale_basis'
assert s.handoff('h-reviewed', d, 1) == ('issued', d)
print('new_source_fact_requires_current_review', 'passed')

# Recover a committed original before current eligibility; never reopen its slot.
s = Source(); d = s.prepare('p')[1]; assert s.handoff('h', d, 0) == ('issued', d)
s.drafts[d]['state'] = 'canceled'; s.drafts[d]['new_write'] = False
before = deepcopy(s.__dict__)
assert s.handoff('h', d, 0, can_cancel=False, can_issue=False, ready=False) == ('replay', d)
assert s.__dict__ == before
assert s.handoff('h', d, 1)[0] == 'intent_conflict'
assert s.prepare('p-later') == ('already_issued', d)
assert s.handoff('sibling', d, 1)[0] == 'successor_exists'
print('lost_response_replay_and_canceled_successor_slot_persistence', 'passed')
print('RESULT', 'all assertions passed; non-native serial illustration only')
```

Executed once from the exact saved code under WSL Ubuntu-24.04 Python **3.12.3**, standard library only, exit code **0**. Exact stdout:

```text
inert_single_preparation_discard_and_issue_door passed
normal_atomic_failure_then_same_intent_success passed
urgent_stop_failed_issue_discard_later_current_issuance passed
status_only_and_access_only_are_not_cancellation_proof passed
competing_handoff_serial_orders 2 one_successor_each
fulfillment_handoff_serial_orders 2 single_terminal_order
new_source_fact_requires_current_review passed
lost_response_replay_and_canceled_successor_slot_persistence passed
RESULT all assertions passed; non-native serial illustration only
```

The observable model outcomes are limited to these assertions: preparation is inert and singular; its generic Issue route is fenced; a failed tentative normal handoff commits neither side; an earlier independent cancellation survives failed issuance/discard and permits later currently authorized new issuance without a second cancellation; status-only/access-only is not cancellation provenance; both serial orders of competing handoffs issue once; both fulfillment/handoff orders retain one terminal winner; a changed source basis needs refreshed review; and original handoff replay after later successor cancellation does not reopen the slot or mutate current state. These are **four enumerated serial race orderings**, plus the listed direct state checks—not real concurrency, SQL or complete source/role tests. The model does not implement all operation fingerprints, current disclosure, recipient identity, source readiness, P6/P17/outbox delivery, retention, accessibility, native constraints or performance. Required P01–P38 remain prospective.

## Consolidation handoff

The independent 14-clause/38-proof/all-22-category note and one bounded in-memory illustration are ready for root consolidation. Key permanent outcomes are the real atomic normal handoff, truthful independent-stop continuation, immutable one-ever-issued relation, every-door bound-draft issuance fence, source-safe definition reuse and current remaining actor powers. Q20's fresh-access notice scope is explicitly preserved; the original invitation is separately qualified. The complete root report/ADR will receive a separate whole-package read before closure. No Q49 ratification or native implementation success is asserted.

## Independent complete-package read — findings before final closure

Read the entire consolidated report, entire ADR and proposed glossary term on 2026-10-25. The report read was SHA-256 `32c8e5f93afe544b2f72d2e7c0495e446d97a94f7e87e2eb6fa1df800a03d8ac` (78,568 characters); the ADR was `4ca679ee26377ec04b6eb8e4934d664c5494ec0c6ee3f6c19101d372e2615658` (26,291 characters). The glossary proposal was `5397e03eb266f48af22dc1e3f443f90e76ece3d65a585b61f76f294380a4a2d6`. Read-only extraction confirmed exact report/ADR/body parity: 22 paragraphs and 22,808 characters. The proposal appears exactly in both artifacts. Structural counts are 22 clauses, 50 proofs, 26 lifecycle rows, 34 journeys, eight budget families and eight operating controls; all 22 category rows were read.

The complete read found no contradiction in the proposed source command, one-active-preparation/one-ever-issued-successor cardinality, atomic normal handoff, earlier-cancellation continuation with only current remaining-act powers, every-door issuance fence, old history versus new recipient scope, Q46 target semantics, Q48 anti-evasion boundary, effective SQL role requirements or prospective activation. Two inherited communication proof details were sent to the parent for explicit carry-through, without proposing a new policy: (1) P37 should spell out source/plan publication ordering, changed/disjoint/missing/extra/duplicate/stale/cross-scope candidate rejection, pre/post-release crash recovery and no appended child on original-parent replay; (2) P38 should spell out sealed attempt admission before the first provider byte, definite-not-started versus uncertain outcomes, original earliest deadline/provider window/current gates for every later call, and no accepted/indeterminate fresh-key retry. The exact body already delegates the governing P17/P6 contracts.

The report's conditional wording about a model may now state the actual bounded run above: one Python 3.12.3 standard-library in-memory illustration, four enumerated serial race orderings plus direct checks, all assertions passed. It remains neither native concurrency/transaction/role proof nor a complete feature simulation. Final closure awaits the corrected report readback; no model rerun, runtime operation, ratification or canonical edit is implied.

## Whole-package review closure — final corrected readback

On 2026-10-25, completed the independent full-report, full-ADR and proposed-term review, followed by readback of every corrected passage in its surrounding context. The final report is **SHA-256 `3e8e812aa92031cb645b35700a14fceb533aebd8fa38c02c852608311f9dd8f8`**, 80,708 characters. The unchanged full-read ADR is **`4ca679ee26377ec04b6eb8e4934d664c5494ec0c6ee3f6c19101d372e2615658`**, 26,291 characters. The proposed term remains **`5397e03eb266f48af22dc1e3f443f90e76ece3d65a585b61f76f294380a4a2d6`**. The report's 22 exact decision paragraphs equal the ADR and standalone body byte-for-byte after their intentional Markdown blockquote framing is removed: **22,808 characters**. Both artifacts contain the exact proposed term. Counts remain **22 clauses / 50 proofs / all 22 categories / 26 lifecycle rows / 34 journeys / eight budgets / eight controls**.

Verified all nine changed segments in `phase29-q49-review-refinement.json` against the actual corrected report, then reversed those exact segments in memory. The resulting SHA-256 is the original whole-read report hash `32c8e5f93afe544b2f72d2e7c0495e446d97a94f7e87e2eb6fa1df800a03d8ac`; this proves the final report contains only the inspected refinements, not an unread body change. The two communication-proof findings above are resolved by explicit P37 source/plan ordering, complete candidate/release/crash/replay cases and P38 sealed attempt, definite-versus-ambiguous outcome, original-window/current-gate and no-rekey cases. The actual model statement accurately describes the saved one-time run and its limits; no rerun was needed.

The additional refinements are consistent in context: independent temporary restriction may have its own qualified repair while Q34 cancellation remains terminal; definition-copy failure cannot masquerade as complete success; Q01 proof need not require recipient attendance at staff issuance; Q41 source-ended shares obey their own cancellation restriction without globally revoking unrelated rights; the budget header now matches its five cells; primary prefill examples are identified as documented patterns, not measured Core effectiveness. None changes the exact decision or introduces new native/provider authority.

### Independent clause crosswalk

The left-hand identifiers are this note's independent clauses; the right-hand identifiers are the consolidated package. This maps requirements, not implementation completion.

| Independent clause                                    | Consolidated clauses | Main proof coverage         |
| ----------------------------------------------------- | -------------------- | --------------------------- |
| C01 — Different-person source scope                   | C01                  | P01–P03                     |
| C02 — Actual powers and trusted context               | C02,C07,C09,C18      | P04–P05,P14,P20–P22,P40–P42 |
| C03 — One inert preparation and safe reuse            | C03,C04,C06          | P06–P10,P13                 |
| C04 — Actual new work and issuance readiness          | C05,C07,C14          | P11–P16                     |
| C05 — Atomic normal handoff and every-door fence      | C08,C11              | P17–P19,P26–P27             |
| C06 — Independent stop and permanent recovery         | C09,C20              | P20–P22,P45,P47             |
| C07 — Source order, actual time and late work         | C10,C13,C14          | P23–P25,P31–P33             |
| C08 — Permanent singular issued lineage               | C11,C17,C21          | P26–P28,P39,P42             |
| C09 — Original semantic result and canonical no-op    | C12                  | P18,P29–P30                 |
| C10 — Old history and new access remain separate      | C13,C14,C17          | P15–P16,P31–P33,P39–P41     |
| C11 — Exact Q35, original invitation and Q48 effects  | C15,C16              | P33–P38                     |
| C12 — Native invariants and effective role paths      | C17,C18,C21          | P39–P42                     |
| C13 — Current disclosure, usable UX and repair        | C19,C20              | P43–P45,P47–P48             |
| C14 — Bounded work, retention and prospective release | C20,C21,C22          | P46–P50; B01–B08; O01–O08   |

### Independent proof crosswalk

| Independent proof | Consolidated proof coverage | Required subject retained                                                             |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| P01               | P01–P03                     | Different-person ordinary purpose and excluded recovery contexts                      |
| P02               | P04–P05,P14,P21             | Separate current powers, including only the remaining acts after a real prior stop    |
| P03               | P06                         | One active preparation and authorized continuation                                    |
| P04               | P07–P08,P20                 | Inert edits/discard and independent stop truth                                        |
| P05               | P09–P10                     | Allowlisted coherent copy, fresh identities and protected prose                       |
| P06               | P07,P09–P10,P13             | Origin/draft edit races and no silent partial copy or lost edits                      |
| P07               | P11–P12                     | Real remaining need, no acceptance transfer and separate qualified Q28 act            |
| P08               | P14–P15                     | Q25/Q24 readiness without roster, online-presence or future-read requirements         |
| P09               | P17–P19                     | Atomic cancellation/issuance/edge/result/history/outbox and fault boundaries          |
| P10               | P27,P40–P42                 | Generic, imported, service and direct-write bound-draft enforcement                   |
| P11               | P04,P20,P43                 | Independent actual stop; preview not required; revocation is not cancellation         |
| P12               | P21–P22,P30                 | Earlier-stop failure/discard/current issuance without recancel or reopening           |
| P13               | P03,P20–P21,P25,P39         | Proved remedy, current authority and unconsumed slot; status alone insufficient       |
| P14               | P23                         | Actual fulfillment versus handoff in both orders                                      |
| P15               | P13,P24                     | Evidence, clarification, requirement and instruction races with relevant revalidation |
| P16               | P24–P25,P31–P32             | Old ordinary actions fenced; original facts and independently lawful duties preserved |
| P17               | P26–P28,P39                 | One ever-issued child, typed lineage, no slot refund or reparenting                   |
| P18               | P22,P26,P28                 | Correct a later child through its own source path, not an earlier sibling slot        |
| P19               | P18,P29–P30,P45             | Matching original replay first, changed intent conflict and safe current projection   |
| P20               | P07,P13,P29–P30,P48         | Canonical no-op, expected-basis/ABA conflict and required security history            |
| P21               | P18,P26–P30,P38             | Competing keys, complete transaction retry and permanent effect identity              |
| P22               | P13,P16,P33                 | Actual new issuance/target meaning, permitted reviewed past value and no backdating   |
| P23               | P15,P33,P44                 | New-context proof without retargeting, fake Party or compulsory full membership       |
| P24               | P31–P32,P44                 | Exact old finite outcome root, independent current restrictions and no archive grant  |
| P25               | P33,P36                     | Q35 only for actual cancellation; original invitation is not Q20                      |
| P26               | P37                         | Source/plan ordering, complete candidates, proved zero, crash/release/replay identity |
| P27               | P38                         | Sealed provider attempt, closed outcome causes, original limits and no rekey          |
| P28               | P34–P35                     | Old Q48 facts and genuine new-person enrollment without preference transfer/evasion   |
| P29               | P26–P28,P39,P48             | Native scope/keys/closed states/immutability and disposition-safe uniqueness          |
| P30               | P40–P41                     | Effective grants/RLS and all DML, selection and resulting-row outcomes                |
| P31               | P27,P40–P42                 | EXECUTE/search_path/owner/views/triggers and all alternate paths                      |
| P32               | P04,P25,P39–P41             | Sole source/P12 decision, trusted context and protected link/result disclosure        |
| P33               | P25,P40–P45                 | Revocation/context/cache/export/count/error privacy across serving doors              |
| P34               | P17,P39,P41,P48             | True actor and protected durable history versus minimized diagnostics                 |
| P35               | P46–P47; B01–B08            | Finite indexed work, query/lock/fairness/cost and operating ownership                 |
| P36               | P42,P47–P48                 | Prospective provenance, mixed writers/restore, scoped disable and roll-forward        |
| P37               | P43–P45,P49                 | Composed staff/recipient/operator, accessibility, locale and weak-network journeys    |
| P38               | P01–P50,C22                 | Actual native qualification and owner trace, never static/model substitution          |

All 22 categories were reconciled with these mappings and the final lifecycle/journey/budget/control tables. The categories retain calibrated hypothetical severity and evidence limits rather than claiming existing production defects. The exact source command is still proposed; current helpers, the named-grant migration and the isolated serial illustration do not qualify it. No material runtime/source, authorization, concurrency, provider-recovery or operational discrepancy remains in this reviewed amendment package. **This closes the independent package review only:** Q49 ratification, canonical adoption, formal publication, implementation, native tests and activation remain outside this closure. All 29 canonical glossary terms remain unchanged by this note, and Q50 is not asked.
