# Q47 A — runtime, database and recovery adversarial review

2026-10-25. Conrad selected Q47 A and requested the full review. **Disposition: Accept with required amendments.** This independent note proposes the exact source, recovery and qualification boundaries below; it does not ratify or implement Q47. Q01–Q46 and the 27 existing terms remain authoritative. Only this assigned work note was edited. Q48 is unasked.

## Small complete model and material decisions

Withdrawal is a source transition ending the current review candidacy of one exact participant-origin received contribution. Its receipt, immutable bytes/provenance, applicable history, other members and independent uses remain facts. It is not storage deletion, a waiver, unacceptance, request cancellation or recall. Current item/evidence-basis acceptance and source eligibility govern; no new per-file approval flag is implied by “unaccepted.”

The smallest permanent recovery is a deliberate **Offer this file again** source act for the same qualified retained immutable version, linked to the original receipt and withdrawal. It creates a new current candidacy/admission with current terms and an actual new occurrence, while preserving original upload/receipt facts. It does not restore a snapshot, revive an old approval, backdate current work, bypass a later successor or require a pointless physical upload. Independent byte-read rights are not a prerequisite when exact safe metadata and server-side custody can qualify the action. Missing actual custody/rights/meaning cannot be disguised as a transient delay.

The bounded flexibility agreed during review is explicit: **Recipient self-service withdrawal initially Enabled**, with a current authorized tenant/source control for this action only. Disabled blocks new participant withdrawals, not Q03 correction, current reads, original result recovery or independently qualified reoffer. A narrow, separately authorized **staff-assisted withdrawal** may act on the same eligible participant contribution with its true staff actor; it is not Q28 authority or participant impersonation. Staff resupply can use independently qualified Q28 as a **new staff-origin contribution**, not a new staff power to replay a participant's offer.

Q27 may be expressly extended to a genuinely new source-actionable reoffer basis, preserving its Off default and complete original-boundary/dispatch/material contract. This is an explicit proposed owner amendment, not a fabricated upload event or a notification default inferred from Q47. Withdrawal alone updates affected source work/currentness and does not send mail or suppress unrelated outstanding-need awareness by analogy.

## Fresh live evidence and practical limits

Live selected-answer snapshot: **fdec2ba2f13d23db38a0d0173873507f37ce41bd**. Complete comparison from `02bd6e661ad8a94ccaf97111942658982cb6fe78`: **13 commits ahead, 0 behind, 20 changed paths**. GitHub connector returned the complete file inventory; a read-only authenticated Windows `gh api` comparison independently confirmed 20 paths and a patch for every file. No fetch/checkout, GitHub write, credential action, hosted SQL, private data, provider configuration or runtime mutation occurred. The historical local checkout remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`.

The delta is one CI workflow, one tenant-guard contract, six API files, one migration and eleven test/helper files. The new SQL/helper/contract and workflow claims were read in full, all changed runtime caller patches were inspected, and the new real-stack/unit/static acceptance source was read for its actual assertions and limits. It changes real infrastructure; it does not implement Q47 or prove all P12 gates are live.

| Evidence | Actual source / observed behavior                                                                                                                                                                                                                                                                                                                       | Q47 implication                                                                                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E01      | `packages/api/src/identity/tenant-guard.ts`, blob `06133e276392d54dd00f188ae26331f7637e1988`, 99 lines. UUID validation, frozen acquire/release RPC allow-list, injected tenant and tenant echo check; no automatic retries.                                                                                                                            | There is now a concrete guard, not an absent seam. An arbitrary UUID is not resolved source authority, and the allow-list contains no withdrawal/reoffer command.                                                                    |
| E02      | `supabase/migrations/20261024150000_tenant_guard.sql`, blob `a1bdb4b2475d1f5ab1ceb9666d5f877d9fca8a35`, 255 lines. Private guarded functions owned by NOLOGIN/NOBYPASSRLS/non-table-owning role; transaction-local GUC, tenant policy old/new-row checks, restricted grants, public invoker wrappers and removed unguarded release overload.            | Definer does not universally mean RLS bypass. Actual owner/grants/policies matter. One guarded function is atomic, not several RPCs under a TypeScript callback. This is a qualified pattern candidate, not current Q47 enforcement. |
| E03      | `docs/security/tenant-guard.md`, blob `3003ac1b8e0ea735c558549648c44683b10769fd`, 90 lines. Current guarded path is workflow work claims; existing JWT tenant source remains separate pending owner integration. Unrouted service paths and compromised service credentials are explicitly out of scope. Hosted ownership transfer needs its own proof. | Do not describe P12's unified Tenant source/current authority or all service paths as already qualified. Do not weaken the one-PDP rule or add a second permission resolver to this coarse guard.                                    |
| E04      | `packages/api/src/workflows/claims.ts`, blob `dcab91dd5481f4975fcefcc0cc4442a6a705ae65`, read in full. Acquire/release run through withTenant; release requires the acquiring tenant; lease TTL remains bounded by its own contract.                                                                                                                    | A current claim controls concurrent attempts; it is not permanent business idempotency, historical result retention or the withdrawal transaction. Do not copy its TTL into Q47 rights or semantic identity.                         |
| E05      | Changed `admin/support-hub/move-service.ts:377–389,517–525`, `workflows/adapters/inbound-email.ts:572–580`, `workflows/recovery.ts:136–146`, plus identity export. Actual patches pass the acquiring tenant through release.                                                                                                                            | These callers demonstrate current integration of claim isolation, not atomicity of all surrounding source/business effects.                                                                                                          |
| E06      | New issue-2250 real-stack test blob `05125d9293a864a0159a1e95fcce43923e304692`; withTenant unit blob `49b20ae7b44bdafdf7e3675bdbc2e2deedefda36`; static blob `24c86bb4497c7de47b6c94705ddd69bf1b0f705d`. Assertions cover role catalog/ACL, cross-tenant operations, GUC reset, rollback, echo/allow-list and routed callers.                           | These tests were inspected, not run here. PG17 superuser-driven role emulation and authored CI gates do not establish hosted ownership migration, actual Q47 SQL, current source authorization or participant UX.                    |
| E07      | Unchanged Q47 research paths: `packages/ui/components/primitives/image-upload.tsx:35–46,154–168` (`424a0d23d014b1d5336f3fdacb19cfa07f8a6e47`); Cloudinary client (`f917ec6e45aef4c145b285e442cd10c052aa2730`); asset metadata helper (`7f79acb5c090f67133eb35879cf88fe1160e542a`).                                                                      | onRemove delegates to a caller, uploads return provider results and metadata is not a source receipt/candidate. No withdrawal authority or durable business transaction is supplied.                                                 |
| E08      | Unchanged donor image route (`717efa778fdd5a43a6e9272a6213c8dc22a321c9`) is explicitly minimal E2E/501; CMS Media (`51a141631f5e07a1574e6b44435af81d77f96c34`) has different image/public/delete ownership; Eve retention control (`b04b05739482da8934e64dd9c2aa715bafc1499b`) removes storage objects for its own artifact lifecycle.                  | These cannot implement Q47 by substituting a delete callback/provider action. This is an incompatible-reuse risk, not a newly demonstrated vulnerability in those features.                                                          |
| E09      | Q03 exact correction/predecessor fence; Q21 exact item/evidence acceptance; Q22 complete current fulfillment; Q23 recoverable review; Q28 staff-origin contribution/removal. Full relevant ADR bodies/clauses read during this research and prior question review.                                                                                      | Source interpretation and exact accepted dependencies prevail over filenames, digest equality or a generic file flag. Q47 must explicitly add its own participant/staff-assisted actions.                                            |
| E10      | Q05 `0005-current-files-and-participant-submission-history.md`: current eligible members plus minimized source-authorized receipt/history; no ordinary superseded-byte archive. Q01/Q04–Q20 govern actual participant proof/actions/original/fresh/completed access.                                                                                    | Withdrawn receipt/status can remain in qualified history, but history is not a byte grant. Current reoffer action must be explicitly adopted without fake participant enrollment or automatic new time.                              |
| E11      | Q27 `0027-opt-in-staff-email-for-source-actionable-review.md`: full decision/reconciliation read; occurrence is first authoritative actionable exact current review basis, not raw receipt/scan/readiness. Q28 already explicitly extends staff-contribution basis.                                                                                     | A genuinely new reoffer can be an explicitly added Q27 source cohort, with all existing original-plan/cohort/Off/release/utility/material proof. No same-basis retry/readiness mail.                                                 |

Repository backend/API/Supabase instructions and skills remain applicable and were rechecked in the continuous review. The new delta does not change those instruction files. Runtime facts above are current source evidence only. Native scope-qualified ordinary withdrawal/reoffer/staff assistance is still unproved.

## Current primary technical research

Context7 `/websites/postgresql_17` and `/supabase/supabase` were queried afresh, and official pages were read directly. [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) and [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html) require evaluating actual role, ownership, grants, policy composition and old/resulting rows. UPDATE/ALL policies can inherit USING for an omitted WITH CHECK; a missing keyword alone is not evidence of an unsafe update. Constraints can expose existence through errors, so same-scope constraints and privacy-safe error handling are both needed.

[PostgreSQL locking](https://www.postgresql.org/docs/17/explicit-locking.html) and [transaction isolation](https://www.postgresql.org/docs/17/transaction-iso.html) explain why source eligibility, exact current candidacy and concurrent accepted evidence need a real short ordering protocol. A plain read/update or expiring work lease does not automatically serialize every dependent source fact. [Supabase functions](https://supabase.com/docs/guides/database/functions) require actual owner/EXECUTE/search-path and invoker/definer assessment. The newly read tenant guard is a concrete non-table-owner definer example; it is not a reason to remove business capability checks or claim all direct service access is safe.

The current Supabase changelog/compatibility notices were reviewed in the immediately preceding Q46 technical pass on this date; nothing in Q47 calls for provider changes or a new extension. No generic skill performance multiplier, blanket FORCE setting or new fine-grained RLS PDP is adopted. Existing platform/version/hosted-policy qualification remains required before activation.

## Exact proposed amendments

### C01 — Exact participant contribution and current eligibility

Q47 SHALL operate on one source-proved current participant-origin received contribution/use in the exact Tenant/environment/request/item/purpose and recipient context. Preserve the source's actual indivisible unit; do not assume one file per item or silently split a multifile contribution. Current accepted/frozen evidence dependencies, source closure and specialist rules restrict the action. A request waiting on staff may still have withdrawable unaccepted evidence; do not import Q46's outstanding-recipient-work eligibility. Superseded evidence, staff-Q28 evidence, unrelated uses and an accepted item/evidence basis do not become withdrawable merely because a UI lists a file. No role, filename, digest, mailbox match, possession of bytes or uploader label supplies authority.

### C02 — Action-specific tenant flexibility and true staff assistance

Offer bounded Recipient self-service withdrawal initially Enabled under the qualified ordinary source plan. A known qualified source default can resolve the effective policy without a redundant per-tenant override row; unknown/unqualified effective policy cannot authorize a dependent new withdrawal. Current authorized tenant/source administration may Disable that participant action; it does not grant the action past P12/source floors. Disabled is not a blanket switch for Q03 correction, reading, source history/result reconciliation, staff assistance or independently lawful reoffer. New participant commands must bind/revalidate the actually reviewed availability generation at commit; Off→On cannot silently authorize an old uncommitted review. Later enabling permits a newly reviewed current act, not catch-up or a replayed stale command. Committed original outcomes are still reconciled first under current disclosure. Do not import P17 mail suppression semantics as a permanent ban on future newly authorized source acts.

Explicitly add narrow staff-assisted withdrawal under its own current source/P12 power and exact same eligible participant contribution/evidence-basis limits. Record the actual staff actor and legitimate source assistance/remediation basis from trusted context or concise input under its actual audience/retention rules; no routine essay. Never impersonate the participant or borrow Q28 removal. Routine tenant control is bounded configuration, not arbitrary script/policy machinery. Independently lawful staff assistance after participant expiry need not create a new participant grant, but cannot bypass acceptance, source closure or other actual source restrictions. No automatic general admin power is inferred.

### C03 — Withdraw candidacy, preserve admitted facts and obligations

A committed withdrawal SHALL remove only the exact targeted participation from current review consideration, advance the relevant authoritative evidence/review basis and preserve receipt, original admission time/terms, immutable version, provenance, prior decisions and attributable withdrawal history. Other supporting members, independent accepted work, uses and holds remain intact. The requirement remains whatever the source currently requires; withdrawal does not waive it, mark No longer required, cancel the request, reverse acceptance or create fulfillment by an empty-set shortcut. Complete Q22 reevaluation or its durable owned intent must follow genuinely relevant source changes, without another routine Complete action or artificial blocker.

No superseded predecessor automatically becomes current after withdrawal or later failed checking. A reviewer can keep the exact reading context where currently allowed; current action controls must show/fence the changed basis without replacing content beneath them. A view/open event is neither a lock nor proof of acceptance. Retained staff/history read authority remains separately current.

### C04 — Withdrawn status and original reads stay distinct

Explicitly add the exact safe withdrawn status to the participant's Q05-style minimized receipt/history projection under current source/PDP authority. A retained receipt is not a new previous-version archive. The withdrawn participation no longer supplies ordinary current-candidate original/preview access; another independently qualified use may still authorize its own reads without being merged into this one. Apply current gates to metadata, names, counts, history, locators, HEAD/full/range/conditional/preview/recovery/print/export paths, applicable per-chunk streaming checks and cached results. Do not delete or promise recall of already disclosed bytes.

Withdrawal requires safe exact identification and current mutation authority, not opening the original or waiting for preview/technical checks. Checking or unsafe content does not automatically bar candidacy withdrawal where source metadata/action authority suffices; independently required security/records work continues. If permitted metadata cannot distinguish the target safely, offer capable source assistance rather than blind confirmation or disclosure of restricted details. Original/fresh participant action scopes must expressly qualify Q47, without new duration or universal proof reset; completed access remains read-only. Expired/revoked participant access alone cannot authorize the mutation.

### C05 — Permanent mistaken-withdrawal recovery as a new offer

Provide a lasting **Offer this file again** action for the exact source-qualified retained immutable version and withdrawn participation, where current recipient/source rights, requirement context, cardinality and custody permit. Coherently create a new current source candidacy/admission linked to the original receipt and withdrawal, with actual new actor/time/terms and relevant review basis. It is not a new physical upload or fabricated original receipt, and it does not restore prior acceptance, unresolved decisions, old proofs/grants or the old semantic intent. Historical original receipt/timing stays true; current reoffer timing/applicability is recorded now under Q09/Q46 and must not borrow an earlier timely receipt to disguise a late current act.

Do not silently displace an actual later successor/current participation or resurrect a superseded predecessor. Reoffer is bounded to the exact eligible withdrawn lineage, not an arbitrary historical file picker. Source uniqueness/current revision must prevent duplicate current membership of that same participation lineage; other independent supporting members remain distinct even if bytes match. A new repeated legitimate withdrawal/reoffer uses new semantic occurrences and current authority, while retries recover their original occurrences. No automatic Undo or expiry timer is chosen.

### C06 — Reoffer custody, scope and practical fallback

The source may qualify reoffer from safe metadata plus server-held exact custody/integrity without granting the participant byte-read/download/history access. It must prove the exact retained version/use and applicable origin restrictions, current requirement/source/recipient/proof scope and current admission eligibility. Quarantine, prohibited unsafe data, unknown custody or missing authority cannot be bypassed. Only explicitly bounded post-admission checks allowed by the actual source intake contract may remain Checking. No stale cached scan or identical digest transfers safety/acceptance automatically.

Reoffer must order with custody/disposition and establish required live use/reference protection before a destructive owner can win. If bytes are gone or cannot lawfully be reused, explain the actual limitation and provide a qualified ordinary new submission/correction or capable source/privacy remedy; no forced reupload when valid retained bytes suffice. Missing required authority is not a mere technical retry. If participant access is expired, use an actual independently authorized fresh admission where eligible, or qualified source help; never silently renew. Staff resupply may use independently qualified Q28 as a new staff-origin use with true attribution, not a new staff ability to impersonate participant reoffer. Supported blocked/ended mistakes need an actual capable owner route before activation, not a powerless support link or raw SQL repair.

### C07 — Exact source race ordering and late processors

Withdraw, reoffer, Q03 correction, Q21 acceptance, Q23 review/concern state, relevant instructions/new work, Q33/Q34 and actual Q22 closure, tenant availability, access expiry/revocation and source restrictions SHALL have one explainable order for affected facts. Acceptance/freeze/closure first blocks an ineligible new action; withdrawal first fences stale acceptance of the removed contribution. Correction-first means an old withdrawal cannot retarget the successor; withdrawal-first makes the old correction basis stale and preserves any independently qualified new resupply route. Reoffer-first admits its new basis; later withdrawal targets that basis explicitly. Do not impose an unrelated global request revision or invalidate all accepted items/proofs.

Late scan/preview/provider callbacks may record their exact technical result under their own current authority but cannot reintroduce a withdrawn/obsolete candidate, transfer acceptance or choose a new current version. Processing cancellation is not universally required, nor may stale callbacks resurrect work. Receipt/transfer/click/queued fulfillment evaluation are not actual acceptance or fulfillment. Recheck actual time and source authority after waits; preserve exact durable admission order rather than browser/queue/transaction-start timestamps alone.

### C08 — One coherent authoritative transition, not sequential RPC illusion

Each deliberate withdraw/reoffer or staff-assisted withdrawal SHALL coherently commit current candidacy/evidence basis, immutable history/attribution, exact source reference/retention consequences, semantic result and genuinely required work/outbox intent. Co-located facts commit atomically; a cross-owner equivalent must prove coherent source admission and fail-safe recovery. No partially removed candidate without required history or falsely acknowledged reoffer without custody protection. A technical projection failure after a known commit does not undo it. External/network/processing work stays outside short source locks.

An expiring work claim is attempt coordination, not the business identity. The new withTenant seam's atomic unit is one guarded call; several calls under its JavaScript callback do not share a transaction. Reuse only an actually qualified source command/transaction, without prescribing a new framework, table count or a generic event-sourcing system. Draft choices/Cancel create no withdrawal/reoffer business event; independently required protected-read/security evidence remains.

### C09 — Original semantic replay, current no-op and returned-state safety

Under current disclosure authority, resolve matching committed semantic identity **before** new-action eligibility/availability/expected-revision/no-op logic. Bind exact tenant/environment/source/request/item/contribution/current participation, actor/context, operation kind and reviewed material basis. A changed payload or target under the same identity conflicts. Committed withdrawal replay after reoffer must not withdraw the new candidacy; old reoffer replay after another withdrawal must not reactivate it. Return the earlier operation result honestly and obtain current source state separately; a late response cannot overwrite a newer UI projection.

A genuinely new action uses current capability/availability and expected relevant basis. An already-withdrawn fact is not a second withdrawal; an independently permitted current read may report it without claiming a new admitted act. Do not convert an unauthorized/stale new mutation into successful no-op, or equate same bytes/label with same semantic operation. Current duplicate membership/reoffer attempts must converge or conflict under source uniqueness without another occurrence, receipt, review job or mail. Preserve minimal governed result-or-reject identity after readable history/transport-key expiry; unverifiable stale identity cannot become a fresh act. A failed response is not proof of no commit.

### C10 — Actual review work and explicit Q27 extension

Withdrawal updates/fences only genuinely affected current source/My Work/review basis. It does not create Request changes, a new receipt, an extra task or a notification. Required source follow-through has durable owned recovery and cannot be inferred from a provider callback.

Expressly extend Q27's eligible source cohort to a genuine **new reoffer admission that first makes its exact current item/evidence/review basis actionable**. Reuse Q27's optional staff-mail step with its existing Off system default and bounded tenant opt-in, original occurrence/plan order, exact finite original staff recipient generation, complete P6 release or proved zero, durable unresolved original handoff, permanent semantic identity, current narrowing/usefulness, explicit Off-stop/no old-On revival, material/retention/Recent-copy qualification and provider ambiguity rules. This is source-actionability, not a fabricated upload/receipt event. Template facts must truthfully describe newly available review evidence; technical readiness restoration/retry on the same basis creates no occurrence. Native review remains usable if optional mail proof is unavailable.

Staff resupply already qualified under Q28 keeps its explicit Q27 mapping. Q47 does not add a new default, bell, digest, reminder, participant mail or generic notification engine. Withdrawal does not blindly cancel Q40 awareness of still-outstanding requirements or unrelated Q26/Q31/Q32/Q35 purposes; their exact current source usefulness/actions and sealed pins decide. No old-message rewrite, unknown-attempt rekey, recall or provider-result-as-human-awareness claim.

### C11 — Small relational model and effective all-role database enforcement

Use native required keys, same-scope composite relationships, immutable tenant/environment/source/request/item/participant/version/receipt attribution, valid participation states, coherent relevant current basis and unique semantic operation/candidacy identities. A reference to an existing foreign row is insufficient if it crosses scope. Separate original immutable receipt, current participation/review basis and withdrawal/reoffer occurrences; timestamps alone are not unique revision keys. Do not mutate original uploader/receipt time to the staff actor or reoffer date. Parent/actor deletion cannot cascade away required evidence. Do not store permissions or requiredness in an arbitrary provider metadata blob.

Prove actual accumulated grants/exposed schemas/RLS ENABLE/FORCE state/owner/BYPASSRLS and effective SELECT/INSERT/UPDATE/DELETE/UPSERT/MERGE/RETURNING old/new-row behavior, including combined permissive/restrictive/default policies. Inspect invoker/definer ownership, EXECUTE/search path, views, triggers and every raw/API/GraphQL/CMS/collection/import/job/operator/service/backfill/restore writer. Alternate doors use the same source boundary or are closed. Do not infer safety from a literal WITH CHECK or unsafe behavior from its omission where USING is inherited. Scope/constraint/error responses must not expose hidden records.

### C12 — One PDP and purpose-qualified reads, not a second role system

All actions/readers/effects use current P12/source decisions and the exact trusted Tenant Authorization Context, with P12-prescribed coarse Tenant RLS as defense in depth. No new capability inference from recipient, staff, admin, original-author or task labels; no manufactured Party/donor/default Tenant. Actor/context selection and coarse guard tenant must agree end-to-end. Native participant and independently authorized staff paths remain distinct; a source policy may narrow within bounds but cannot widen the floor. The new workflow guard is a useful concrete seam, not current proof of unified JWT/GUC authority or all-service coverage.

Protect participant status, exact identifying metadata, reoffer controls, prior/current terms, history, authors/counts, operation results and technical diagnostics separately from byte access. Current disclosure still applies after an original effect succeeded. Cache/draft/result isolation must include relevant context/governance state; fence late responses on account/Tenant/assignment/purpose changes. No public cache, raw private realtime stream or offline auto-replay is introduced. P12 set-wise projection/audit/metering and restricted signals remain binding.

### C13 — Custody, holds, retention and restore remain honest

Ending candidacy is not physical unlink/delete authorization. Required receipt/history/holds/independent references and continued security/records processing retain their owners. Do not decrement a generic file counter to zero and purge bytes merely because the last current candidate withdrew. Actual disposition uses complete registered use/hold/retention facts and its own fence. A lawful future deletion may remove bytes while minimal history remains; history alone then cannot support reoffer. Reoffer-first must protect its actual admitted use; disposition-first cannot be hidden by returning an old URL or restoring a row.

Retain only required business/audit/replay evidence for its exact schedule and current disclosure. No new indefinite history or byte retention, deleted-equals-not-readable inference or hold-equals-access grant. Restoring older database/cache/job state cannot revive withdrawn candidacy, superseded evidence, expired participant rights, earlier accepted state or stopped mail. Unknown newer facts block affected unsafe actions pending capable source reconciliation, without false deletion or success claims. Keep private filenames/content/source IDs/recipient details out of general logs, analytics, traces and session replay; restricted audit and minimized operational correlation remain separate.

### C14 — Deliberate accessible user experience and permanent support

Use the existing exact request/evidence context with clear **Withdraw submission** and, where qualified, **Offer this file again**. Show the actual safe contribution unit and consequence; never call it Delete or imply total erasure. One deliberate meaningful action and usable Cancel suffice; no forced replacement/preview/download, reason essay, repeated proof, routine second approver or general Trash screen. Existing valid proof can be reused when actually compatible; no automatic new account or enrollment. Do not rely on a decorative cross or row position as identity.

Preserve safe draft/reading/focus context and honest uncommitted/pending/outcome-unknown/withdrawn/offered-again/conflict/blocked states. Reconcile lost outcomes before new intent; failed projection refresh is not failed source commit. Keyboard/AT/speech/touch/mobile/reflow/RTL/IME and long names must work without large preview loads or live subscription dependency. If the source cannot expose enough exact context, use a capable authorized help route. Accepted/closed/privacy incidents and unavailable retained bytes need actual source remediation before activation; no empty Contact admin button or direct SQL is the normal solution.

### C15 — Finite resource profiles and prospective rollout

Keep one bounded current-source command, indexed exact receipt/participation/version/operation lookups, unique-key authorized history pagination and set-wise work/actor projections. No per-file provider deletion, rescanning by default, N+1 history queries, full-tenant evidence scan, hot global counter, CRDT/presence/mandatory Realtime or new provider is selected. Reuse valid safety evidence only under its owner; required genuinely new checks remain explicit. Measure actual real-role plans/rows, transaction/lock/connection use, retry amplification, history/reference/index/WAL growth, per-Tenant contention, queue/egress and actual operating cost before Live. P12 governance budget is logical and does not mean one SQL statement for the whole command.

Activation must qualify the actual participant/staff actions, availability policy, Q05 readback/no-byte-archive, reoffer scope/custody, Q24/Q27 source actionability amendment, effective native roles/constraints, both-order races, bounded resources and complete intended-user journeys. Census retained data and protect mixed writers; no generic assets/CMS deletion record becomes a historical withdrawal by backfill. Old clients/workers must preserve or reject unknown participation state. Scoped disabling blocks unsafe new actions while preserving known results, truthful history and independent lawful source work; rollback cannot erase committed facts and may require roll-forward. Keep 27 terms unchanged unless root separately proposes a necessary term through the requested review. No formal owner/OpenSpec/ticket publication, provider activation or Q48 follows from this note.

## Calibrated risks

| Material risk                                                           | Severity / likelihood if naive reuse | Why and permanent closure                                                                           |
| ----------------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Physical deletion mistaken for withdrawal                               | High / plausible                     | CMS/Eve/provider delete seams have different ownership; C03/C06/C13 preserve custody and exact use. |
| Wrong member or accepted evidence removed                               | High / plausible                     | Multi-file/source-unit and item-basis acceptance matter; C01/C07/C11.                               |
| Old processor/replay reintroduces withdrawn evidence                    | High / plausible                     | Late readiness or old semantic result is not current authority; C07/C09.                            |
| Reoffer restores approval, bypasses later successor or hides new timing | High / plausible                     | Immutable original receipt and new source candidacy must remain separate; C05/C06/C09.              |
| Staff/tenant setting becomes implicit participant impersonation         | High / plausible                     | New source capability and real actor/context must be explicit; C02/C12.                             |
| Guarded RPC mistaken for all-route capability/transaction proof         | High / plausible                     | Current guard scope and call atomicity are deliberately narrow; E01–E06/C08/C11/C12.                |
| Withdrawn history grants unintended originals or leaks private metadata | High / plausible                     | Current projection and byte access are separate; C04/C12/C13.                                       |
| Duplicate source-actionability mail or false new-upload statement       | Medium–High / plausible              | Q27 extension must be explicit and exact; C10.                                                      |
| Excessive history/reference churn, contention or recovery loops         | Medium impact / workload-dependent   | Small indexed command, finite retry/pages and measured tenant fairness; C15.                        |

## Bounded in-memory transition illustration

Executed once with Python 3.12.3 standard library, no files/DB/providers/network/runtime code. This is an illustrative **single-member source-basis model**, not Q21 per-file acceptance, a proposed schema, concurrent database execution, security test or proof of production correctness. It enumerates both serial admission orders and demonstrates the intended distinction between original-operation replay and new reoffer/current state. It intentionally omits real authorization, full multi-file predicates, actual time, outboxes, reference/hold protocols and byte-read policy; those need native proof below.

Exact executed code:

```python
from copy import deepcopy
from itertools import permutations
import sys

def fresh():
    return dict(current='a', version='v1', rev=0, accepted=None, ended=False,
                retained=True, safe=True, policy=True, epoch=0,
                receipt=('a', 'original-time', 'original-target'), sibling='s',
                history=[], ops={}, technical={})

def act(s, op, kind, target, expected, policy_epoch=0):
    intent=(kind, target, expected, policy_epoch)
    if op in s['ops']:
        old_intent,result=s['ops'][op]
        return 'replay:'+result if intent==old_intent else 'identity-conflict'
    if s['ended'] or s['accepted'] is not None or s['rev']!=expected:
        return 'blocked'
    if kind=='withdraw':
        if not s['policy'] or policy_epoch!=s['epoch'] or s['current']!=target:
            return 'blocked'
        s['current']=None
        result='withdrawn:'+target
    elif kind=='accept':
        if s['current']!=target: return 'blocked'
        s['accepted']=target
        result='accepted:'+target
    elif kind=='correct':
        if s['current']!=target: return 'blocked'
        s['current']='b'; s['version']='v2'
        result='corrected:b'
    elif kind=='reoffer':
        if s['current'] is not None or not s['retained'] or not s['safe']:
            return 'blocked'
        if ('withdraw',target) not in s['history']: return 'blocked'
        s['current']='reoffer:'+op; s['version']='v1'
        result='offered:'+s['current']
    else:
        raise ValueError(kind)
    s['rev']+=1
    s['history'].append((kind,target))
    s['ops'][op]=(intent,result)
    return result

print('Python',sys.version.split()[0])
for rival in ('accept','correct'):
    for order in permutations(('withdraw',rival)):
        s=fresh(); out=[act(s,k,k,'a',0) for k in order]
        assert out[1]=='blocked'
        assert s['receipt']==('a','original-time','original-target') and s['sibling']=='s'
        print('order',','.join(order),'outcomes',out,'current',s['current'])
s=fresh(); assert act(s,'w','withdraw','a',0)=='withdrawn:a'
s['technical']['a']='clean'
assert s['current'] is None
print('late_processing_current',s['current'],'retained',s['retained'])
assert act(s,'r','reoffer','a',1).startswith('offered:')
current=s['current']; assert act(s,'w','withdraw','a',0)=='replay:withdrawn:a'
assert s['current']==current
assert act(s,'w2','withdraw',current,2)=='withdrawn:'+current
assert act(s,'r','reoffer','a',1).startswith('replay:offered:') and s['current'] is None
print('old_withdraw_and_reoffer_replays_preserve_new_state',s['current'] is None,'original_receipt',s['receipt'])
t=fresh(); act(t,'w','withdraw','a',0); t['retained']=False
print('disposition_first_reoffer',act(t,'r','reoffer','a',1))
u=fresh(); u['policy']=False; u['epoch']=1; u['policy']=True; u['epoch']=2
print('off_on_stale_withdraw',act(u,'stale','withdraw','a',0,0),'fresh_review',act(u,'fresh','withdraw','a',0,2))
assert act(u,'fresh','withdraw','other',0,2)=='identity-conflict'
print('identity_conflict_does_not_retarget',u['current'] is None)
print('illustration_assertions_passed')
```

Exact stdout:

```text
Python 3.12.3
order withdraw,accept outcomes ['withdrawn:a', 'blocked'] current None
order accept,withdraw outcomes ['accepted:a', 'blocked'] current a
order withdraw,correct outcomes ['withdrawn:a', 'blocked'] current None
order correct,withdraw outcomes ['corrected:b', 'blocked'] current b
late_processing_current None retained True
old_withdraw_and_reoffer_replays_preserve_new_state True original_receipt ('a', 'original-time', 'original-target')
disposition_first_reoffer blocked
off_on_stale_withdraw blocked fresh_review withdrawn:a
identity_conflict_does_not_retarget True
illustration_assertions_passed
```

## Required native proof groups — prospective, not executed

| Proof | Outcome requiring actual native evidence                                                                                                                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01   | Exact current participant-origin received contribution/unit, original attribution, tenant/environment/request/item/purpose and actual participant action capability; no filename/email/digest/account/file-read shortcut.                                          |
| P02   | Multimember/indivisible contribution, sibling preservation, accepted/frozen item/evidence basis and source closure; no invented per-file acceptance flag or whole-request withdrawal.                                                                              |
| P03   | Waiting-on-staff/Checking/unsafe/preview-unavailable eligibility with safely distinguishable metadata and current action permission; no forced byte read or privacy leak.                                                                                          |
| P04   | Original/fresh action scope and proof compatibility; expiry/revocation/completed-read restrictions, no new period/Party/account or global proof reset.                                                                                                             |
| P05   | Enabled default and actual bounded tenant control; Disabled blocks new participant withdraw only, not independently permitted correction/read/result/reoffer; current policy basis and Off→On stale-command fence.                                                 |
| P06   | Explicit staff-assisted capability with true actor/attribution, exact accepted/source limits and independently lawful post-participant-expiry help; no Q28 inheritance or participant impersonation.                                                               |
| P07   | Candidacy withdrawal atomically preserves receipt/time/terms/version/provenance/history/other members and actual unsatisfied requirement; no waiver, deletion or empty-set fulfillment.                                                                            |
| P08   | Withdrawal of current correction never revives superseded predecessor; reviewer context remains exact and current accept action is fenced.                                                                                                                         |
| P09   | Withdrawn status/minimal Q05 history under current projection, no new historical-byte rights; original/preview/range/conditional/recovery and current independent-use distinctions.                                                                                |
| P10   | Reoffer exact retained immutable version/withdrawal lineage as new current act with actual admission time/current terms; original receipt unchanged, no fabricated upload or inherited acceptance.                                                                 |
| P11   | Reoffer current rights/custody/integrity/admissibility and supported bounded Checking; prohibited unsafe/quarantine/unknown custody fail safely without blind confirmation.                                                                                        |
| P12   | Reoffer without participant original-byte-read permission when safe metadata/server custody/current action qualify; insufficient safe identification routes to capable help.                                                                                       |
| P13   | Current same-lineage membership/expected basis, concurrent reoffers and later successor: no silent replacement, historical picker, duplicate candidate or copied approval.                                                                                         |
| P14   | Qualified resupply after expired access, unavailable/disposed bytes and closed stages; actual capable source remedy before Live. Staff Q28 resupply records new staff origin, not participant reoffer.                                                             |
| P15   | Atomic withdraw/reoffer/history/current basis/result/reference/outbox intent with crash before/after every boundary and projection failure after known commit.                                                                                                     |
| P16   | Matching committed replay before new eligibility/no-op; changed kind/target/payload/context conflicts, response loss, double click, transport-key expiry and current result disclosure.                                                                            |
| P17   | Old withdrawal replay after reoffer and old reoffer replay after later withdrawal/closure; original outcome retained, current state/late UI response never overwritten.                                                                                            |
| P18   | Already-withdrawn/duplicate-current state versus unauthorized or stale new command; no fabricated second history/receipt/work/mail and no digest-only global dedup.                                                                                                |
| P19   | Withdrawal/acceptance and withdrawal/correction races both directions; actual exact relevant basis, no stale retarget or loss of accepted/sibling work.                                                                                                            |
| P20   | Reoffer/withdrawal/review/requirement revisions/No longer required/cancellation/actual Q22 fulfillment and availability/authority races in both orders, after-wait actual time and current floors.                                                                 |
| P21   | Late check/scan/preview callback records only its legitimate exact technical result; no candidate reintroduction/approval transfer; independently required security processing retained.                                                                           |
| P22   | Original upload finalization/unknown receipt versus local cancel/withdrawal; reconcile exact original admission before targeting it, no deletion to repair uncertainty.                                                                                            |
| P23   | Source Q22 complete predicate and durable reevaluation after real relevant change; no routine Complete/Resolve/read/extra task gate or fabricated current work.                                                                                                    |
| P24   | Disposition/hold/reference races: withdrawn history is not zero use; reoffer must protect actual admitted use before destructive win; disposition-first cannot yield false usable reoffer.                                                                         |
| P25   | Native required/unique/same-scope composite relationships, immutable actor/receipt/bytes/source attribution and participation/result lineage; foreign-child/caller retarget/cascade attempts rejected.                                                             |
| P26   | Effective real-role grants/RLS enable/force/owner/BYPASSRLS, SELECT/INSERT/UPDATE/DELETE/UPSERT/MERGE/RETURNING and default/permissive/restrictive old/new checks.                                                                                                 |
| P27   | Every API/GraphQL/CMS/raw/collection/function/view/trigger/import/job/operator/service/restore path uses source authority or is closed; safe EXECUTE/ownership/search path.                                                                                        |
| P28   | One P12 PDP/unified Tenant source/current context, prescribed coarse guard and no role fallback. New withTenant protects only adopted RPCs and one-call atomicity; no claimed all-service/current-authority qualification.                                         |
| P29   | Current disclosure of status/metadata/history/actor/count/error/cursor/result/reoffer control, cache/draft/context switch and denied/not-found behavior; protected audit versus general telemetry.                                                                 |
| P30   | Current source/My Work/evidence-set projection after withdrawal and reoffer, no content switch; optional projection failure has owned repair and no false source failure.                                                                                          |
| P31   | Explicit Q27 new reoffer actionable cohort, actual new basis, unchanged Off default; no raw receipt/scan hook/readiness replay or fake upload facts.                                                                                                               |
| P32   | Reoffer Q27 original actionability plan publication order, finite original cohort/current narrowing, complete release/known-zero/unresolved handoff, Off-stop/material/utility/Recent-copy/ambiguity/dedup proof; no wrong-recipient expansion or source rollback. |
| P33   | Withdrawal alone updates genuinely affected work/effects, preserves independent Q26/Q31/Q32/Q35/Q40 purposes and sealed truth, and creates no new default/bell/reminder/ack.                                                                                       |
| P34   | Finite indexed current/candidacy/result lookups, uniquely ordered history pages and batched projections; no N+1/full-file-history scan/provider delete or per-input writes.                                                                                        |
| P35   | Real-role representative plans/rows/locks/connections/contention/retries/WAL/index/reference/history/egress cost and tenant fairness meet concrete caps with exact and one-over-boundary fixtures.                                                                 |
| P36   | Business/history/replay/security retention and disposal/hold/current-read distinctions, stale jobs/old client/mixed DB-cache-object restores; no authority/candidate/approval/mail resurrection.                                                                   |
| P37   | Complete accessible target inspection/Withdraw/Cancel/Offer again and staff assistance, keyboard/AT/speech/mobile/RTL/IME/long names/low bandwidth, exact metadata without preview requirement.                                                                    |
| P38   | Truthful pending/unknown/withdrawn/offered-again/blocked/conflict/current-state recovery, retained lawful input/focus and capable blocked/privacy remedy, no powerless help/SQL/forced upload.                                                                     |
| P39   | Additive source/schema/profile/old-writer activation, retained-data census, scoped disable/roll-forward, current native dependency/provider compatibility and intended-user proof; no mocked/source-only qualification.                                            |

## All 22 adversarial categories

| Category                                   | Concern, materiality and disposition                                                                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Necessity/alternatives                  | Medium/plausible coordination cost. User selected A; B/Q03/staff help remain valid stricter routes. Accept narrow current-candidate control and permanent recovery, not global deletion. C01–C06.                         |
| 2. Brittleness                             | High/plausible: current pointer, file ID, async callback or lease mistaken for source candidacy. Exact original/participation/result lineage and relevant version fences. C03/C07–C09.                                    |
| 3. Technical debt                          | Medium/plausible: repurposed image/CMS delete or new generic evidence engine. Small source transition/reference/history with existing qualified seams. C08/C11/C15.                                                       |
| 4. Edge cases                              | High/plausible: multifile unit, Checking, unknown receipt, withdrawn correction, reoffer after later successor or disposition. C01/C03–C09.                                                                               |
| 5. Footguns                                | High/plausible: Delete label/privacy recall, blind confirm, forced dummy upload, Undo approval restoration or misleading old replay UI. C04–C06/C09/C14.                                                                  |
| 6. Tenant safety                           | High/plausible: stale assignment, email match, foreign contribution, service caller supplying tenant or shared cache. Native scope/current one-PDP and every-door proof. C01/C11/C12.                                     |
| 7. Database/RLS/authorization              | High/plausible: effective role bypass, composed policies, trigger write, multi-RPC non-atomicity and old overload. Actual guard is narrow; qualify all real roles/static invariants. E01–E06/C08/C11/C12.                 |
| 8. Overengineering                         | Medium/plausible: general Trash/Restore framework, new provider, CRDT, blanket review invalidation or notification center. Exact actions/recovery, local UI, finite source work. C02/C05/C08/C10/C15.                     |
| 9. UX/UI/friction                          | Medium–High/plausible: mistaken file cannot be safely identified, no replacement yet, user loses context or misunderstood retained history. C04/C06/C14.                                                                  |
| 10. Source truth/invariants                | High/plausible: withdrawal becomes waiver/physical erase, reoffer resets original time or copies approval. C03/C05/C07/C13.                                                                                               |
| 11. Hidden coupling                        | High/plausible: last-candidate count triggers purge, late scan selects current, Off disables recovery, staff Q28 identity copied. C02/C06/C07/C10/C13.                                                                    |
| 12. Failure modes                          | High/plausible: withdrawn without history, reoffer without custody protection, unknown wrongly retried or result refresh called source failure. C06/C08/C09/C14.                                                          |
| 13. Lifecycle/time/concurrency/idempotency | High/plausible: acceptance/correction/withdraw/reoffer/closure/rate-policy races and stale operation revival. Exact source order and original-result recovery. C05–C09.                                                   |
| 14. Data integrity                         | High/plausible: foreign child, duplicate participation, unsafe cascade, wrong occurrence or custody generation. Native same-scope/unique/state/immutability and reference fences. C06/C08/C11/C13.                        |
| 15. Security/privacy                       | High/plausible: withdrawn bytes still reachable through ordinary current route, private metadata/errors/history leak, privacy erasure implied. C04/C12/C13.                                                               |
| 16. Scalability/performance                | Medium/workload-dependent: history/candidate churn, lock contention, review/mail fanout or full scans. Indexed bounded current source, set-wise history and measured caps. C10/C15.                                       |
| 17. Operational burden                     | Medium–High/plausible: irreversible wrong click, unavailable bytes, expired participant or old writer forces SQL. Persistent exact reoffer/new source remedy and scoped disable. C05/C06/C14/C15.                         |
| 18. Observability/auditability             | High/plausible: no actor/current occurrence or original receipt distinction; protected values leaked to telemetry. Coherent source history/result, true staff attribution and separate minimized logs. C02/C05/C08/C13.   |
| 19. Dependency/integration                 | Medium/plausible: new guard/API claims misread as full P12 coverage, provider delete/email results become source state. Exact qualified integration and inherited Q27 proof. E01–E11/C08/C10–C12.                         |
| 20. Migration/rollout/upgrade              | High/plausible: assets deletes backfilled as withdrawals, old callback ignores state, restored DB revives candidate or lost dedup identity. Prospective census/writer fences/current adverse reconciliation. C09/C13/C15. |
| 21. Testability/traceability/proof         | High claim risk/plausible: authored real-stack tests, source inspection or a serial toy model presented as native proof. P01–P39 remain prospective; actual SQL/races/AT/users/limits required.                           |
| 22. Other hazards                          | Medium/plausible scope expansion: specialist application/financial/care/public deletion rights or blanket staff permission. No money types/new archive/general privacy promise/new product question. C01/C02/C10/C15.     |

## Finite budgets and operational controls

Before activation publish actual numerical profiles/units for: (B01) contribution-unit/input/current-relation cardinality; (B02) source query/transaction/lock/connection/retry limits; (B03) history/page/payload/replay-retention; (B04) actor/source/Tenant concurrency and fair rate limits, including repeated withdraw/reoffer; (B05) custody/reference/required-check/recovery duration and unresolved outcomes; (B06) actual Q24 projection and explicitly extended Q27 candidate/release/material/dispatch limits under their owners; (B07) compatible native UI/API/database/old-writer/census/restore workload and actual DB/compute/egress envelope. Test exact-boundary and over-boundary behavior. No invented universal days, file counts, retry budget, measured capacity or unchanged bill is supplied by this research.

Named operational obligations: (O01) any unauthorized/cross-scope mutation/disclosure stops the affected path; (O02) any withdrawn/old candidate revival or stale acceptance triggers scoped source containment and current-fact repair; (O03) mixed source history/current/result/reference state triggers reconciliation before unsafe new actions; (O04) outcome unknown beyond qualified bound reaches a capable owner without blind new intent; (O05) custody/disposition/hold discrepancy stops affected reoffer/disposition, not truthfully retained unrelated work; (O06) duplicate/wrong-basis Q27 effect or unresolved optional handoff follows its owner repair without undoing source success; (O07) exceeded workload/fairness/latency bounds lead to bounded admission/repair and plan/index review without authorization bypass; (O08) incompatible old writer/restore or essential accessibility/recovery failure blocks the affected cohort until proof passes. Bind these roles to actual release owners/on-call and concrete thresholds, with privacy-safe signals. Invariants are prevention/test gates, not monitor-only promises.

## Review status

Independent review complete: **15 proposed exact clauses, 39 native proof groups, all 22 categories**, fresh complete-delta classification and relevant source/test reads, current primary technical evidence, one explicitly non-native in-memory illustration, finite budget/control families and implementation limits. No hosted/native feature test or provider operation occurred. Await root's complete report/ADR for full-package independent review and exact proof crosswalk. All amendments remain pending ratification.

## Preliminary complete decision-body readback

Read all **20 paragraphs / 20,455 reported characters** of `work/phase29-q47-decision-body.md` at SHA-256 **04b89bee75366976f60f21cb8d6102588758a37d9a59f2146ffc5784d1b165ca**. No material runtime/source issue was found. The exact body coherently includes action-specific known/default/unknown policy, truthful staff assistance, source-basis acceptance, preserved receipt/current candidacy, replay-first/no-op/cycle behavior, real custody/disposition and permitted Checking, current every-door readback, persistent exact retained-version new reoffer, explicit Q27 source-actionability extension, one PDP/effective SQL, and prospective finite release evidence. It does not treat a staff withdrawal alone as a freeze or allow reoffer to bypass actual source restrictions. Latest default-policy, assistance-basis and serving-door precisions are now explicit in this note's C02/C04 too. This is body-only readback; the full report/ADR/term package remains to be independently reviewed before final closure.

## Final whole-package review closure

Read the **entire** `work/phase29-q47-adversarial-review.md` (**379 lines / 83,226 characters**) and `work/0047-deliberate-ordinary-submission-withdrawal.md` (**70 lines / 23,543 characters**), including current evidence/comparators, all 20 exact decision paragraphs, the proposed term, clause crosswalk, all 22 adversarial categories, 32 lifecycle cases, 52 journeys, all 46 proof groups, nine finite budgets, nine operating controls, synthesis/order of work, final adversarial questions and stage/activation limits. This was a whole-package review, not only a comparison of the sections derived from this note. **No unresolved material runtime/database/temporal/recovery finding remains.**

Exact reviewed file hashes:

- Report: **0d74e6ec2ab8fcd9b09df517a2ef5909c23c9501f894a1cad5e0a28010cdfec4**.
- ADR: **9b1aee7fe7daf64d117a1d3b7bf33aa97f15d1732d4a80cbe3fdede888898d59**.
- Report/ADR exact decision parity independently verified after removing report blockquote syntax and normalizing line endings: **20 paragraphs / 20,455 LF characters**, SHA-256 **0ce84e0cfdc48d5fbebcce440df192ab3ddda91ca702114094309aaf7c7aea47**.
- Proposed glossary definition parity independently verified: **314 characters including the Markdown term label**, SHA-256 **74e00e2edfac62b4f621e3b3db2d92c9d4fda80a148dfe922beba18687938576**. Submission Withdrawal accurately names the source act without implying deletion/waiver/cancellation/unacceptance; it remains proposed and the 27 canonical terms were not edited here.
- Counts independently checked: **20 C rows / 46 P rows / 22 category rows / 32 lifecycle rows / 52 journey rows / nine budgets / nine controls**.

Final read-only freshness comparison from **fdec2ba2f13d23db38a0d0173873507f37ce41bd** to develop returned **identical, 0 ahead/0 behind, no changed files**. The full earlier 20-path delta and actual guard limits above therefore remain the current bounded evidence. This does not claim a hosted migration, native Q47 test or all-service P12 implementation.

### Material outcomes checked together

The package consistently separates original immutable receipt from current candidacy and a new retained-version offer; acceptance is the real item/evidence basis, not a new file flag. Withdrawal preserves siblings, requirement meaning, holds and independent uses while fencing genuinely affected review. Original-operation replay precedes new eligibility, policy and no-op checks and cannot mutate a later cycle or overwrite current UI state. New commands, including no-op candidates, require actual current reviewed basis. Repeated cycles preserve their own identities rather than reviving original intent.

The bounded tenant control is default Enabled only under a known qualified source profile, controls participant withdrawal alone, and cannot create capability or silently reactivate an old pending basis across Off→On. Staff assistance is explicit, attributable and separately authorized; staff resupply stays a new Q28 staff-origin use. Participant reoffer is deliberate/current, verifies retained exact custody and admission rights, protects its new reference against disposition, preserves original receipt timing and records new current terms, and cannot bypass a later successor or actual source restriction. Withdrawn history gives no new archive; current gates cover metadata and all affected byte/conditional/range/stream/recovery doors while independent source rights remain separate.

Q27 is an explicit extension for a genuine new source-actionable reoffer basis, with all original-boundary/finite cohort/release/Off/material/current utility/dedup rules retained. It is not a fabricated upload/receipt or general new notification. Withdrawal alone neither sends mail nor blindly stops Q40's independent still-required-item purpose. The actual tenant guard is accurately described as coarse, limited to adopted claim RPCs and atomic per call; neither its authored tests nor its UUID/echo check is treated as Q47 capability or multi-call transaction proof. Effective SQL/all-role/old-new-row/privileged-path requirements preserve one P12 PDP without generic WITH CHECK/definer/FORCE myths.

All budgets require concrete qualified finite profiles and boundary tests before activation; operating controls detect residual failures rather than waive invariants. The four ordered cases and additional replay/disposition/policy checks from the Python illustration are represented accurately as non-native, single-member observations. Native SQL, real concurrency/custody, hosted role transfer, intended-user/mobile/AT, workload and bill proof remain explicitly unexecuted.

### Exact independent-to-consolidated coverage

| This note's clause                         | Consolidated exact coverage  |
| ------------------------------------------ | ---------------------------- |
| C01 exact contribution/current eligibility | Q47-C01,C04                  |
| C02 tenant control/true staff assistance   | Q47-C02–C03                  |
| C03 candidacy/history/obligations          | Q47-C05,C08,C14              |
| C04 status/current reads                   | Q47-C04,C10                  |
| C05 new retained-version offer             | Q47-C11–C13                  |
| C06 custody/current scope/fallback         | Q47-C09,C11–C13              |
| C07 races/late processors                  | Q47-C04–C05,C08–C09          |
| C08 coherent transition                    | Q47-C06,C17–C18              |
| C09 replay/no-op/current-state safety      | Q47-C07,C16                  |
| C10 actual work/explicit Q27 cohort        | Q47-C14                      |
| C11 relational/effective all-role SQL      | Q47-C17–C18                  |
| C12 one PDP/current projections            | Q47-C10,C18                  |
| C13 retention/disposition/restore          | Q47-C09–C10,C19              |
| C14 accessible permanent recovery          | Q47-C15–C16                  |
| C15 budgets/rollout/proof                  | Q47-C18–C20; B01–B09/O01–O09 |

Every one of this note's 39 prospective proof groups remains covered:

| Independent proof | Consolidated proof coverage         |
| ----------------- | ----------------------------------- |
| P01               | Q47-P01                             |
| P02               | Q47-P02–P03                         |
| P03               | Q47-P08,P21                         |
| P04               | Q47-P18,P24                         |
| P05               | Q47-P05–P07                         |
| P06               | Q47-P04,P29–P30                     |
| P07               | Q47-P09–P11                         |
| P08               | Q47-P10,P15–P16                     |
| P09               | Q47-P21–P22                         |
| P10               | Q47-P23,P25                         |
| P11               | Q47-P20,P26                         |
| P12               | Q47-P21,P23–P24                     |
| P13               | Q47-P27                             |
| P14               | Q47-P24,P26,P29–P30                 |
| P15               | Q47-P11,P20,P31                     |
| P16               | Q47-P12–P14                         |
| P17               | Q47-P12,P28,P36                     |
| P18               | Q47-P13,P27                         |
| P19               | Q47-P15–P16                         |
| P20               | Q47-P06–P07,P17–P18,P27–P28         |
| P21               | Q47-P19                             |
| P22               | Q47-P08,P16,P36 and L01–L02/J03–J04 |
| P23               | Q47-P10,P17,P31                     |
| P24               | Q47-P20,P42                         |
| P25               | Q47-P02,P41–P42                     |
| P26               | Q47-P40–P41                         |
| P27               | Q47-P39–P41                         |
| P28               | Q47-P39–P40                         |
| P29               | Q47-P21–P22,P35–P36                 |
| P30               | Q47-P31,P35                         |
| P31               | Q47-P32                             |
| P32               | Q47-P32, exact C14 and B08          |
| P33               | Q47-P33                             |
| P34               | Q47-P38 and exact C18               |
| P35               | Q47-P38 and B01–B09                 |
| P36               | Q47-P42,P44–P45                     |
| P37               | Q47-P34–P35,P37                     |
| P38               | Q47-P30,P35–P36                     |
| P39               | Q47-P39,P43–P46                     |

The consolidated extra proof groups make actor/policy, serving, cycle, compatibility and trace distinctions more explicit; none drops the independent obligations. Root owns canonical/status recording and any later formal publication. This closure approves the reviewed proposal's completeness at the exact hashes above, pending Conrad's ratification and future native activation evidence; it does not ratify Q47, implement a feature, authorize provider activity or ask Q48.
