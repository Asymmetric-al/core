# Phase 26 D3 — Independent evidence and bounded proof

Research checked 10 September 2026. [The synthesized D3 review](phase26-d3-adversarial-review.md) and [UX blueprint](phase26-d3-ux-blueprint.md) are the current founder-ratified corrected record. D1/D2 are fully ratified; the founder selected B for D3 and explicitly ratified all its amendments, changes and updates on 10 September 2026. This is grooming evidence, not implementation or release proof.

## Ratification status

D3, all D3-R01–R15 clauses, P01–P16 proof groups and the complete UX blueprint are now fully founder-ratified. Original independent reports below retain their earlier proposed/pending wording as historical review evidence. Those references do not supersede the current ratified synthesized record. No runtime readiness is implied.

## Evidence hierarchy and limits

Current worktree and live develop: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Open proposed heads were refreshed: #1335 `e1c86e1a30f479363960eeb35500112665e16bb3`, #1336 `3b2827ffcf184bf767664018efedda317c7da03c`, #1564 `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1`. They were not substituted for develop.

Root and three independent reviewers inspected relevant source/ADRs/OpenSpec/skills and primary current product documentation. The reports below retain each reviewer's original candidate wording. The synthesized D3-R01–R15 clauses resolve those proposals; no original suggestion is an alternate authority. In particular, the final behavior is due current reminder -> Open for follow-up, with prior waiting reason preserved, not Waiting plus a competing actionable status.

Final independent QA corrections incorporated:

- Open means a substantive next step or due review/follow-up is owed; the option to send a courtesy progress update does not end a genuine wait.
- Waiting-side-only changes preserve current reminders. Explicit Open clears deferral even when already Open. Repeated Resolve remains a genuine no-op.
- An early callback retains its pending reminder and durable due/recovery attempt; it cannot be marked applied and strand future work.
- Ambiguous old Pending/Snoozed gets a valid Open-for-migration-review projection with original evidence retained; its review is not hidden by a retained deferral.
- Original command outcome is distinct from current state. Late/lower-revision response snapshots cannot overwrite newer work in the cache or UI.
- Recovery remains discoverable independently of current filters; nonmatching rows are not inserted into a filtered queue.
- Existing tenant-aware FKs, both broad RLS predicates, coarse-pointer touch-height protection and partial bulk counts were verified and not falsely reported absent. Uniform same-tenant staff MVP access is not itself an invented per-inbox policy defect.

No current app, hosted database, real mail, provider integration, assistive technology, deployed timer or benchmark was exercised. Source probes and the model below have narrower stated limits. Existing credentials and `.env.local` remained opaque and unchanged. All changes are local grooming documents and work artifacts; no code, formal OpenSpec, migration, issue or GitHub mutation occurred.

## Independent reports

---

# D3 independent lifecycle, timer and concurrency review

Checked 10 September 2026. Founder-selected behavior: **Open / Waiting for requester / Waiting on our side / Resolved**, presented clearly and effortlessly. This is a bounded evidence/recommendation report for the root's full 23-category review. It does not ratify new material amendments, create a formal specification or authorize implementation.

**Disposition: Accept with required amendments.** Four fixed labels can express the requested difference without a case-management platform. The permanent design needs exact next-action meanings, one current work state, separate timer and delivery evidence, and a single authoritative mutation boundary. Current source does not implement the selected behavior safely. None of the verified gaps requires rejecting the founder's four labels.

## Evidence and authority

The execution directory was reverified as `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10` in Ubuntu-24.04. HEAD remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. The parent freshly checked the same live develop head and unchanged open PR #1335/#1336/#1564 heads. Existing D1/D2 local documentation was preserved. Read root/scoped API/Supabase guidance, backend/test rules, ratified D1 requirements, D2/Q3 records, current adapter/routes/schema/UI/selectors/tests, shared workflow claims, inbound recovery and move paths. No runtime, provider, database, browser or test execution occurred in this review.

Evidence labels: **source fact** means inspected current code, not deployed behavior; **governing intent** means merged platform requirements or ratified D1/D2; **inference** means a named counterexample or conditional failure; **product judgment** means proposed deterministic semantics needing confirmation; **external documentation** means official published behavior, not a live account test.

### Exact source anchors

- **E1 — Current enum and temporal storage.** [SQL:198-249](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260515025814_support_hub_core_modules.sql#L198) permits Open/Pending/Snoozed/Resolved; has nullable resolved/snooze timestamps but no state/timer relationship constraint. Tenant-composite keys and FKs do exist and must not be falsely reported missing. [Collection:16-21](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/collections/support-hub.ts#L16) mirrors these values.
- **E2 — Unconditional state setters.** [setStatus/snooze/unsnooze:837-868](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L837), [updateById:186-199](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L186), [schema:32-44](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L32): no expected review/version/idempotency input. SetStatus rewrites resolved_at on every Resolve. Snooze leaves an existing resolved_at intact; generic Snoozed can have no time.
- **E3 — Inbound and outgoing coupling.** [bumpConversationAfterMessage:632-666](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L632) increments counters from a previous snapshot, overwrites latest timestamps, reopens only Resolved on inbound, and clears Snoozed on a non-draft outbound email. [Reply creation:909-920](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L909) starts Queued, so that row already sets first response/direction. Note type does not enter the email-only response branch; do not falsely allege that it does.
- **E4 — Derived waiting and incomplete work lists.** [selectors:17-83](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/selectors.ts#L17) defines active as Open/Pending and infers waiting side from last direction. Unassigned/past-due/escalated exclude Snoozed. [reports:262-282,346-405](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/report-aggregations.ts#L262) use different waiting subsets and distinguish expired snoozes in a report without changing their state. [list:671-724](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L671) caps at 2,000 before some filtering.
- **E5 — Timer UI is not a scheduler.** [StatusMenu:68-77](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/ConversationStatusMenu.tsx#L68) can select Snoozed without time. [SnoozeMenu:35-41,76-85](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/ConversationSnoozeMenu.tsx#L35) implements Tomorrow morning as +16 hours. [business-hours:33-63](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/lib/business-hours.ts#L33) explicitly treats schedules as UTC despite a stored timezone. A scoped workflow/Support source search found no timed wake worker; this is not a claim about unseen production jobs.
- **E6 — Partial intake recovery.** [Inbound recovery:313-370](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L313) finds a prior Support message and repairs the bridge, then returns already_routed. It does not repair every lost conversation bump/state effect. [bridge write:429-445](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/adapters/inbound-email.ts#L429) happens after routing. Durable source-message deduplication and lifecycle-effect completion are different guarantees.
- **E7 — Move preserves semantics but needs shared atomicity.** [move:100-106](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/move-service.ts#L100) promises status/snooze retention. [177-232](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/move-service.ts#L177) updates inbox then writes audit separately; [327-345](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/move-service.ts#L327) obtains bulk move claims. Existing D1 already requires single/bulk/retry consistency; do not present this as a novel D3 permission.
- **E8 — Existing claims are leases, not final-write fences.** [claims:7-37](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/workflows/claims.ts#L7) defaults to 300 seconds; [SQL claim:47-98](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260611181000_workflow_work_claims.sql#L47) expires claims and grants a new active one. Acquisition does not itself condition a later Support UPDATE on the current timer/version. A stale worker after lease expiry is a conditional counterexample, not an observed production overlap.
- **E9 — Alternate lifecycle callers.** [macro mutation:52-99](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/mutations/run-macro.ts#L52) calls the same current setters sequentially and generates snooze from Date.now. Label/UI fixes alone cannot enforce lifecycle consistency across commands/macros/replays.
- **E10 — Limited tests.** [fixture Resolve:67-78](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/unit/packages/api/admin/support-hub/reads-mutations.test.ts#L67) tests the in-memory fixture; [selector split:112-137](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/unit/apps/admin/features/support-hub/selectors.test.ts#L112) checks direction-based waiting; [inbound test:54-74](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/unit/packages/api/admin/support-hub/inbound-router.test.ts#L54) mocks persistence; [smoke:68-75](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/e2e/support-hub.smoke.spec.ts#L68) checks the status URL. These do not prove durable wake, real status authorization or races.

### Governing decisions and technical evidence

Merged [platform surfaces:16-29](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/platform-surfaces/spec.md#L16) places Support Hub in Mission Control. Merged [workflow orchestration:76-101](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/workflow-orchestration/spec.md#L76) requires shared dispatch, product work claims, recoverable handoffs and rollback-safe records. Product timers must use that capability; no new scheduler is justified.

Ratified D1 R7/R9/R12/R13 (local feature grill copy:542-569,588-603) requires reviewed atomic effects, permanent semantic dedupe, independent work/timer/delivery/domain facts, visible incoming and failure work, audit/recovery, and existing domain owners. D2 retains draft target/audience across changes but blocks stale sends after relevant new input. D3 can make a timer trigger a work transition while keeping timer and work-state facts distinct. It cannot change recipient or protected-action authority.

[PostgreSQL 17 isolation](https://www.postgresql.org/docs/17/transaction-iso.html) explains that ordinary reads are snapshots and concurrent UPDATE predicates are rechecked; a read then unconditional patch is not business-level compare-and-set. [Locking](https://www.postgresql.org/docs/17/explicit-locking.html) supplies appropriate transaction controls. These support a short authoritative transaction with expected-state/effect constraints, not mandating Serializable everywhere or holding a database transaction during provider I/O. [Date/time types](https://www.postgresql.org/docs/17/datatype-datetime.html) distinguishes timestamps and zone interpretation; an instant alone does not preserve the user's named-zone context.

[Help Scout Snooze](https://docs.helpscout.com/article/1572-snooze) documents status-preserving snooze and activation on customer reply. That is a credible alternative pattern, not authority for Asym. Given D3's definition of Open as useful next action, the root and this reviewer agreed a due **explicit follow-up** should open for review while preserving its prior wait reason in history. Snooze creation itself still preserves status. This is the single recommended rule below; it does not claim the awaited input arrived.

## Exact recommended semantics

These clauses are proposed amendments to record after review. They establish behavior without freezing a physical schema, status builder, SLA policy, reminder duration or Send-button default.

**L01 — Four fixed work meanings.** “Open means Support has useful next action to take now: read/review newly admitted input, reply, investigate, arrange a handoff, or perform a due follow-up. Waiting for requester means an input has actually been requested from an admitted requester-side participant and the work is blocked on that input. Waiting on our side means Support has sought necessary input from a colleague, owner process or outside service and is awaiting that dependency; the tenant remains responsible for obtaining it. Resolved means the Support obligation was concluded after review, with no hidden promised or required Support action. None of these labels grants access, sends email or changes owner-domain truth.”

**L02 — One primary state, no task graph.** “If any useful independent Support action can proceed now, use Open. Otherwise, if both requester-side and tenant-owned inputs are outstanding, use Waiting on our side until the tenant-owned dependency is answered or otherwise disposed of; do not present the requester as the sole remaining blocker. Waiting for requester applies when requester input is the remaining controlling blocker. Preserve the other outstanding context in the existing internal note or authorized owner reference, not a mandatory parallel task/dependency system. A status change should expose a concise existing reason or allow a short note when needed; do not demand repetitive form filling or fabricate a reason from email direction.” This deterministic mixed-wait precedence is a product amendment to make explicit. It does not claim software can infer all unstated obligations.

**L03 — Incoming correspondence creates review work, not automatic conclusions.** “The first canonical admission of an eligible incoming human conversation message makes the conversation Open and removes its current snooze deferral, including from either Waiting state or Resolved. Admission and relevance follow the qualified intake/thread/participant contract; message identifiers alone do not prove identity. A replay of the same admitted input, known automated response, quarantined/unrelated message or already-applied repair does not create another work transition. Staff review—not an assumed AI classifier—determines whether the input completes what was awaited.” Ordinary human thanks can legitimately create a small review; automatic courtesy suppression is not selected by D3.

**L04 — Arrival order is not sender date.** “Use durable input identity and server admission/review ordering for lifecycle effects. A message first admitted after resolution requires review even when its untrusted sender Date or provider occurrence time is older than resolution. Preserve event/receipt/admission times separately where material. An already-applied old message does not reopen on replay. Late processing cannot regress last-event facts, lose counters or erase earlier resolution evidence.”

**L05 — Snooze creation and due transition.** “Snooze is an explicit time-bound deferral of attention for unfinished work; creating or rescheduling it preserves the current work status and why the work is waiting. It requires one validated concrete future instant and records the displayed time/zone context. At or after that instant, the current qualified reminder generation consumes its due effect, clears the deferral and sets Open for follow-up/review. Show Follow-up due and retain prior wait context; do not imply an input arrived or a business action finished. Manual Wake now performs the same attention-return transition for the current deferral. D3 creates no automatic reminder for every wait.”

**L06 — Timer generations and cancellation.** “Only the current active reminder associated with the current unfinished work cycle can wake it. Reschedule, explicit cancellation, resolution, explicit Open and a qualifying incoming message invalidate the prior timer generation atomically with the work change. A change between the two Waiting meanings preserves the valid current reminder and due instant; a work revision is not the reminder generation. When that reminder fires it records the current prior wait meaning, not a stale meaning captured before the change. Explicit Open clears an active deferral even when work status is already Open; that is a real attention-return effect, not an unchanged-state no-op. Old, duplicated, early or cancelled wake jobs do not change current status, timestamps, assignment or a replacement reminder. Resolving cancels its active unfinished-work reminder; an already recorded required promise cannot be erased merely by hiding the timer. A new deliberate follow-up after resolution is new work and first reopens through review. Timer wake is a system effect attributed separately from the staff member who scheduled it.”

**L07 — Correct calendar handling.** “Calendar words such as Tomorrow morning resolve in a named displayed operational time zone using calendar rules, not a fixed elapsed duration. Validate against trusted server time, show the actual chosen date/time/zone, and preserve its instant after device/tenant zone changes. Nonexistent or ambiguous local-time input must resolve explicitly and visibly. Persisted overdue reminders after outage remain due and recover in bounded order; neither client clock nor inactive browser tab owns execution.” D3 does not select the default time zone, morning time, business-day calendar or hours policy; these must be specified when configuring the narrow timer UI.

**L08 — One authoritative transition command.** “Manual state changes, Resolve/Reopen, Wake, timer effects, admitted input, qualified owner results, single/bulk/macro operations and recovery obey one Support mutation contract. It derives actor/scope, rechecks current rights and expected review/state generation, locks or conditionally updates the authoritative state, records the unique business effect and append-only transition evidence, and creates/cancels required durable dispatch work atomically or leaves explicit complete repair evidence. No provider call is made while a database transaction is held. A shared work-claim lease reduces concurrent work but cannot replace the final generation/version predicate.”

**L09 — Stale commands cannot hide new work.** “A staff Resolve/Wait/Snooze decision applies only to the conversation information they reviewed. If a qualifying input or other relevant change wins first, reject the stale command with current context and preserve draft/input. If resolution commits first, a subsequently admitted eligible input reopens. Staff can deliberately resolve after reviewing the new information; a database serialization retry must not silently rebase stale human approval. Independent read-state or preference refreshes need not cause false work-status conflicts.”

**L10 — Idempotency and resolution episodes.** “A retried command with the same identity and immutable meaning returns/reconciles the original result. Conflicting reuse is rejected. Repeating an already achieved Resolve without new reviewed work is a no-op, not a new completion timestamp. A real later reopen and resolution are separate historical transitions in the same conversation, preserving earlier reasons, actors and times. Current-status projection and current resolution time may change, but historical episodes and their source evidence cannot be rewritten by ordinary staff. No blanket Closed/immutable-ticket phase, timed auto-close, requester courtesy acknowledgment requirement or physical event-sourcing architecture is introduced.”

**L11 — Sending and delivery remain independent.** “A reply's existence, direction or provider acceptance does not automatically choose Waiting for requester, Waiting on our side or Resolved. An ‘I am investigating’ update can leave Open; only a deliberate qualified work transition expresses who supplies the next necessary input. Saved drafts, automatic acknowledgments and failed questions do not count as substantive human response evidence. A send-and-status shortcut, if later chosen, must use the same reviewed atomic local admission and explicit delivery-failure reconciliation; D3 selects no default Send action.”

**L12 — Adverse delivery evidence is causal.** “Every newly actionable failed or indeterminate delivery creates visible recovery/review work, without rewriting provider evidence or fabricating a resend. If that evidence invalidates the reviewed communication basis of a Waiting or Resolved decision, set Open through the same causal transition contract and retain the prior decision history. An already-reviewed, superseded or duplicate old failure is not a new work transition. When new evidence has unknown causal relevance requiring staff investigation, set Open for that owned review and retain the prior decision history; do not silently dismiss it or claim all work completed. This expresses a review obligation, not proof that the original resolution was wrong. Per-recipient D2 truth still applies: one member failure cannot rewrite other members.” The permanent design needs minimal reviewed source/effect references sufficient to establish this causality, not a generic dependency graph or text-similarity inference.

**L13 — Owner-domain results and access loss.** “Only a qualified, same-tenant result for the currently awaited owner reference may create new Open review work; it never resolves Support or mutates the owner record. An older superseded owner result remains history, not a stale work reset. Revoked staff access denies their future reads and commands, invalidates affected cached detail, and never cancels accepted team responsibility. Timers continue under the product/system authority into an authorized team or unassigned recovery surface. A worker's absence or inbox move must not strand a reminder, disclose owner-restricted details or resurrect a prior assignee.”

**L14 — Move and visibility continuity.** “An inbox move preserves the current work meaning, exact reminder instant/generation and resolution history; only eligibility-driven assignment handling changes under the existing move contract. It cannot restart a waiting period or trigger a resolution. Current destination access is checked when the effect applies, and both locations retain the authorized audit markers. All unfinished waits remain findable and counted as unfinished, including unassigned waits. Due reminders and actionable delivery issues appear in actionable queues even if status/filter caches are stale; counts/queues derive from the same authorized business definitions and do not silently truncate.”

**L15 — Migration and compatibility.** “Inventory current records, clients, macros, saved filters, board/report definitions and old jobs before activation. Pending is not proof of either waiting side, and Snoozed is not proof of the underlying work reason. Where history cannot establish the new meaning, retain original values/provenance and put the item in visible Open review for classification, preserving any valid follow-up instant without letting that deferral hide migration review. Do not mass-send, resolve or invent historic reasons during backfill. Qualify additive schema, versioned readers/writers and an old-writer fence before enabling four-state writes; after new facts exist, rollback must preserve/read them or pause new commands while continuing accepted-work recovery.”

## Findings and consequences

Severity is conditional: **High** threatens lost work, incorrect lifecycle evidence, disclosure or duplicate effects; **Medium** threatens repeated confusion, friction or maintenance cost. Likelihood describes trigger conditions and is not an invented production percentage.

| ID  | Concern, impact and evidence                                                                                                                                                | Severity / likelihood                                    | Effect on answer                          | Permanent prevention and exact clauses                                                     |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------ |
| F1  | Waiting side inferred from outbound direction labels an investigation as requester delay; current selectors do exactly that (E3/E4).                                        | High; ordinary progress-update workflow                  | Preserve four labels, change semantics    | L01/L02/L11; explicit reviewed waiting fact                                                |
| F2  | Both sides waiting or multiple matters can hide actionable work behind one label. This is a design counterexample, not evidence Asym needs task graphs.                     | Medium; realistic when handoffs overlap                  | Narrow meaning                            | L02 priority; Open whenever independent action exists, own-side wins unresolved mixed wait |
| F3  | New incoming message leaves Pending/Snoozed unchanged and can stay out of active queues (E3/E4).                                                                            | High; expected once those states are used                | Required change                           | L03/L08/L09; admitted input atomic Open review and deferral invalidation                   |
| F4  | Old dates or replay can falsely reopen, or suppress truly unseen late correspondence. Snapshot latest timestamps regress (E3/E6).                                           | High; normal delays/replays                              | Required temporal amendment               | L04/L10; admission identity/order and monotonic projections                                |
| F5  | Snoozed has no time, timer only appears in reports, or a stale scheduled wake overwrites a newer decision (E1/E2/E5).                                                       | High; direct UI path and future timer race               | Required change                           | L05/L06/L08; finite current generation, due consumption, durable recovery                  |
| F6  | Tomorrow morning at +16 hours and UTC-only business schedule violates visible time intent (E5).                                                                             | Medium-to-High; ordinary evening/multi-zone/DST usage    | Required correctness, no new SLA policy   | L07; explicit named-zone calendar resolution and exact instant                             |
| F7  | Concurrent Resolve and inbound/Wait/Snooze blindly overwrite because server update matches tenant/id only (E2).                                                             | High; concurrent staff or delayed input                  | Required change                           | L08/L09, expected review and one transaction                                               |
| F8  | Claim lease expires while old worker still runs; acquiring a claim is mistaken for final-write fencing (E8).                                                                | High; conditional slow worker/recovery                   | Required implementation safeguard         | L08, current generation predicate at effect commit                                         |
| F9  | Reply row already sets first-response time before delivery, and sender direction is confused with workflow completion (E3).                                                 | High; deterministic existing queued path                 | Required correction; retain chosen labels | L11/L12 plus D1/P6/P17 evidence rule                                                       |
| F10 | Late bounce reopens every case regardless of whether resolved with another reply; or is ignored because status says Resolved.                                               | High; conditional delayed/partial group outcomes         | Required causal amendment                 | L12, reviewed source/effect lineage and visible owned review                               |
| F11 | Repeat Resolve changes completion date; reopen destroys prior resolution evidence; snooze creates contradictory resolved timestamp (E1/E2).                                 | High; normal retries and manual toggles                  | Required change                           | L06/L10, no-op replay and append-only real episodes                                        |
| F12 | Message exists but crashed state bump never repaired; recovery considers bridge sufficient (E6).                                                                            | High; fault between real separate writes                 | Required completion guarantee             | L08/L03, atomic local effect or explicit complete repair                                   |
| F13 | Permission loss strands a timer under former worker or leaks restricted awaited-domain context. Move resets state or old job restores old inbox/assignment (E7; inference). | High; ordinary reassignment/move/departure               | Required boundary                         | L13/L14, system authority and current destination/access recheck                           |
| F14 | Status macros/bulk/saved views bypass semantic contracts; all-history audits and product code diverge (E9).                                                                 | High; alternative caller path exists                     | Required uniformity                       | L08/L15; one command, old-writer fence, versioned migration                                |
| F15 | Pending→requester and Snoozed→Open backfills invent historical meaning; queued jobs reintroduce obsolete state.                                                             | High; migration dependency, not proven record prevalence | Required rollout amendment                | L15, evidence-preserving review and compatible rollback                                    |
| F16 | Counts disagree and cap hides due/unassigned work (E4).                                                                                                                     | High at affected size; exact source cap 2,000            | Required query/UX correction              | L14/L15; complete authorized definitions, bounded indexed due queue                        |
| F17 | One extra label expands into custom statuses, automatic closing, mandatory every-wait timers, SLA pauses or a task engine.                                                  | Medium; avoidable scope temptation                       | Narrow decision, keep four fixed labels   | L01/L02/L11 and explicit exclusions below                                                  |
| F18 | Current tests give confidence in enums/fixtures but not real lifecycle outcomes (E10).                                                                                      | High if used as release proof                            | Required proof obligation                 | Real command/DB/worker/UI matrix below                                                     |

These concerns map into the parent review's categories independently: necessity (F1/F2/F17), brittleness (F3-F8), debt (F9/F14/F15), edge cases (F2/F4/F10/F13), footguns (F5/F6/F11), tenant/authorization (F13/F14), database (F5/F7/F8/F11/F12), overengineering (F17), UX (F1/F2/F5/F6/F16), ownership (F9/F10/F13), CRM continuity (F13), coupling (F9/F14), failures (F10/F12), lifecycle (F3-F12), integrity (F4/F11/F15), privacy (F13), performance (F16), operations (F5/F12/F13), audit (F10/F11), integrations (F8/F10/F13), migration (F15), proof (F18). No additional independent development hazard was found in this bounded slice; broad security/database/vendor categories are independently reviewed by the other agents.

## Transition and proof matrix

These are required falsifiable tests, not executed results. They should exercise canonical command seams and real isolated PostgreSQL/worker behavior where indicated, not merely mocks reproducing implementation.

| Case                                                             | Required result                                                                                                                                        |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Start new admitted conversation                                  | Open with accountable inbox/team/unassigned visibility; no automatic fake Party or direct financial action.                                            |
| Send progress update “I am checking”                             | Work stays according to deliberate reviewed choice; outgoing direction alone cannot set requester waiting.                                             |
| Ask requester for necessary input                                | Deliberate requester-wait choice possible; queued/failed question remains truthful with actionable issue, not proof of receipt.                        |
| Ask colleague/service for result                                 | Waiting on our side only when actually awaiting input; Support remains responsible and restricted owner context stays protected.                       |
| Requester and own side both outstanding                          | If independent work exists Open; otherwise own-side waiting with remaining requester context preserved.                                                |
| Relevant input from either waiting state                         | One new Open review, current deferral invalidated, stable D2 draft/audience preserved; participant can be an admitted copied person.                   |
| Human courtesy reply after resolution                            | New admitted reply is visible Open review, not auto-dropped on text guess; deliberate review may resolve without sending another message.              |
| Automatic response/quarantine/duplicate                          | Intake records appropriate disposition; no new human lifecycle effect merely from a header.                                                            |
| Delayed first admission with old sender date                     | Still Open review; original chronological evidence preserved, latest markers not regressed.                                                            |
| Replay already applied message after resolution                  | No new open episode/counter increment; same effect recognized.                                                                                         |
| Save Snooze from each unfinished state                           | Work status unchanged, future instant/generation valid, visible date/zone, no mandatory automatic message.                                             |
| Change waiting side with an active reminder                      | Existing due instant/generation survives; firing uses the current waiting reason and opens once.                                                       |
| Explicit Open when already Open but snoozed                      | Current deferral clears once with a real recorded attention-return effect; another unchanged Open is a no-op.                                          |
| Due at exact instant                                             | Current timer consumed once, Open with Follow-up due; waiting history retained. Before instant no wake.                                                |
| Reschedule then deliver old wake                                 | Old generation no-op; new reminder untouched.                                                                                                          |
| Resolve then old wake                                            | No reopening; resolution and timer invalidation atomic.                                                                                                |
| Incoming reply then old wake                                     | Reply already creates owed work once; old timer cannot create another episode or overwrite newer snooze.                                               |
| Manual Wake with two concurrent callers                          | One effect/no duplicate history; later replay returns current outcome without destructive reset.                                                       |
| Snooze/Resolve versus new incoming in both commit orders         | Incoming-first blocks stale human close/wait/defer; human-first permits later incoming to reopen; no lost work.                                        |
| Lease expiry and slow previous worker                            | Only current generation/fenced writer can commit; duplicate work claim alone not accepted as proof.                                                    |
| Failure at every intake state/audit/dispatch boundary            | Retry repairs all required effects exactly once; message-row existence is not completion.                                                              |
| Duplicate Resolve same key/same meaning                          | Existing result/no new completion timestamp.                                                                                                           |
| Same key with changed target status/reason                       | Hard idempotency conflict, no silent reinterpretation.                                                                                                 |
| Reopen then genuinely resolve again                              | Prior episode remains; new resolution clearly distinct and actor-attributed.                                                                           |
| New failure invalidates last resolving reply                     | Open recovery/review via exact source cause; per-member evidence retained, no automatic duplicate send.                                                |
| Duplicate/reviewed/superseded old failure                        | No status thrash or overwrite of later resolution; historical adverse evidence preserved.                                                              |
| Unknown causal late provider event                               | Visible owned review, no fabricated success or blind status erasure; ambiguity resolved before unsafe retry.                                           |
| Currently awaited owner result arrives                           | Open staff review; no automatic Support resolution/CRM mutation/disclosure.                                                                            |
| Superseded owner result arrives                                  | Old result history only; current wait/source context unchanged.                                                                                        |
| Permission revoked before command                                | Denied; no caller-supplied tenant/actor bypass, no leaked response context.                                                                            |
| Original scheduler/assignee removed                              | Current team/unassigned queue receives due work; no stranded reminder or restored former assignment.                                                   |
| Move concurrent with wake/status update                          | Current inbox/eligible assignment and state each preserved correctly; audit matches committed order.                                                   |
| DST boundary / changed browser zone / server skew                | Chosen instant and declared calendar intent agree; invalid/ambiguous local input handled visibly, not +16-hour approximation.                          |
| Worker outage across many due reminders                          | Bounded catch-up, fair tenant processing, no silent drop; active/current generation only. No invented throughput target substitutes for qualification. |
| Counts/filter combinations at and beyond current cap             | Complete authorized counts/results, including unfinished unassigned waits and due actions; no 2,000-row blindness.                                     |
| Legacy ambiguous Pending/Snoozed and old queued jobs             | Preserve history, make review visible, retain validated instant, no fabricated wait reason; old writers/jobs cannot restore obsolete combinations.     |
| Keyboard/mobile/screen-reader state change with delayed response | Current canonical state announced without losing draft, focus or CRM return position; old response cannot overwrite new selection.                     |

## Genuine later choices, not excuses to defer this decision's guarantees

D3 does **not** choose mandatory reminders for every wait, reminder duration, default operational time zone/morning time, business hours, SLA pause/start/stop policy, automated reminders/acknowledgments, automatic no-response closure, Send-and-close/Send-and-wait default, custom statuses, formal task graphs, AI intent classification, or separate immutable Closed. These are independent product policies and should remain explicitly unchosen until asked. Their absence does not prevent precise safe behavior for an explicit status or explicit reminder now.

Already required safeguards are not later optional choices: no lost accepted input, visible unfinished waiting, qualified new-reply reopening, exact timer generation, truthful delivery, immutable historical evidence, current actor/tenant/owner access, stable drafts, all mutation callers sharing one contract, and safe migration/rollback. No missing safeguard belongs in monitor-only status.

## Synthesis

1. Record the chosen four meanings with L01/L02 and the root-agreed current-timer→Open behavior. Surface mixed-wait priority and failure/owner causal review as amendments; do not silently claim the founder independently selected these details.
2. During authorized spec/design, define one reviewed Support transition boundary, source-effect identity and historical transition evidence; qualify timer generation and causal messaging/owner references. Use existing dispatch/claim and P6/P17 owners; avoid unrelated platform redesign.
3. Require implementation to replace unconditional setters, direction-derived waiting and snapshot lifecycle bumps; fence alternate callers and historical jobs; add complete due/unfinished query semantics and a small clear UI for status and explicit snooze.
4. Before activation, demonstrate the matrix with real isolated transactions, worker faults, provider event fixtures, migration rehearsal and staff/accessibility journeys. Do not count current helper/smoke coverage as proof of these behaviors.
5. Residual monitoring: any lost/duplicate lifecycle effect, stale timer mutation, wrong-scope transition or resolution-history rewrite is an invariant breach owned by Support/platform on-call (security owner for exposure): fence affected writer, preserve evidence, repair through explicit lineage and prove the regression before re-enable. Every actionable failed/unknown delivery is owned by the responsible Support queue with messaging operations for evidence reconciliation. Numerical latency/SLA thresholds require release workload qualification; no invented target is supplied here.

The outcome remains four understandable labels, one explicit optional return time, and one truthful history of what happened. The hidden machinery protects those simple facts; it does not turn Support Hub into a second CRM or a generalized workflow product.

---

# Phase 26 D3 — independent database, authorization, owner-boundary and lifecycle audit

10 September 2026. Founder selected **Open / Waiting for requester / Waiting on our side / Resolved**. Read-only source audit, verified WSL directory `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`, HEAD `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. The parent refreshed live develop and relevant open PRs at the same baseline. Read root/scoped instructions, backend/data boundary, Supabase and Postgres skills, identity/platform/contribution/workflow OpenSpec, Q3 evidence and existing D1/D2 records. No production DB, migration, application implementation, provider or GitHub mutation occurred.

## Disposition

**Accept with required amendments.** Keep the four work meanings. The permanent implementation is a small authoritative conversation work-state mutation boundary with durable transition evidence, a separately versioned follow-up timer, and authorized owner-domain references. It is not a second CRM, generic workflow builder, task graph, SLA implementation, or message-delivery state machine.

The central invariant is that **work state says which support action is needed; it cannot certify delivery, financial completion, identity, authorization or absence of outstanding work merely because a label changed**. In particular, the current `pending` value and last-message direction do not safely encode either new waiting meaning.

## Findings with exact prevention language

Severity/likelihood are engineering judgments conditional on using the current or naïvely extended path; no deployed incident rate is claimed. “High” here means lost/unseen work, unauthorized mutation/disclosure, or materially false history. “Medium” means operational/UI inconsistency or maintainability risk.

### DB1 — staff can bypass the lifecycle command, version and audit

**What/why:** Current schema grants authenticated SELECT/INSERT/UPDATE/DELETE on conversations, messages and audit rows. RLS has tenant/staff checks, but direct status updates need not call the lifecycle command or record evidence. This makes a polished UI insufficient to enforce D3.

**Severity:** High. **Likelihood:** high if broad DML remains and correctness relies only on the new API; misuse need not be malicious.

**Evidence:** `supabase/migrations/20260515025814_support_hub_core_modules.sql:524–573` enables RLS, grants authenticated DML/service-role ALL, defines all four broad policies. Both UPDATE `USING` **and** `WITH CHECK` exist; the issue is their breadth, not their absence. `packages/api/src/admin/support-hub/adapter/supabase.ts:73–86` uses the privileged admin client and requires tenant context. `apps/admin/app/api/admin/support/conversations/[id]/status/route.ts:11–28` validates route/body match and passes only body to mutation. `packages/api/src/admin/support-hub/route-helpers.ts:31–74` checks the coarse current staff/admin role and tenant.

**Effect on B:** mandatory implementation narrowing; four labels remain sound.

**Permanent fix / exact clause:** “All human, macro, bulk, timer and admitted-event changes to work state pass the same canonical Support transition command. It derives tenant, human actor/profile and current authorized resource scope server-side. Revoke direct client mutations that bypass work-state, timer, audit or history invariants. Keep RLS enabled and least-privilege grants on every exposed table; any approved browser read policy applies the same relevant tenant/access scope. Privileged service-role paths enforce that scope themselves. No new permissive policy may leave a broader alternate write path.”

Do not incorrectly label uniform same-tenant staff access a new per-inbox authorization bug by itself: `openspec/specs/identity-and-access/spec.md` explicitly describes the current uniform staff-subrole MVP posture. D3 must reuse actual authorization and respect finer owner-domain access without inventing a new ACL product. If later scoped inbox/care restrictions apply, the shared read/mutation boundary must enforce them, not just the menu.

### DB2 — stale writes overwrite a new reply, new snooze or resolution

**What/why:** Current setters update by tenant+conversation ID only. A reply, status change, delayed timer, move and second worker can each act on an old snapshot and collectively erase new work. A duplicated resolve also refreshes `resolved_at` as if newly completed.

**Severity:** High. **Likelihood:** plausible ordinary concurrent/multi-tab use; deterministic under the conflicting ordering.

**Evidence:** `adapter/supabase.ts:837–866` sets status/timestamps directly; `:632–666` calculates counters and status from a prior conversation snapshot; `schemas.ts:32–40` has no expected work revision or command identity. `move-service.ts:177–181` also updates by ID without version. `use-support-mutations.ts:188–235` supplies only existing setter payloads.

**Effect:** required amendment.

**Clause:** “Each work transition validates the reviewed conversation/work revision and its allowed cause against current state, atomically updates the state/revision and required evidence, and returns the canonical result. A stale command cannot overwrite newly admitted work; preserve the draft and request review of the updated conversation. Retrying the same transition identity returns/reconciles the same result; it does not create another completion timestamp or audit event. A new deliberate action has a new identity. Timer changes carry their own generation so an old timer cannot undo a newer cancellation, reschedule or resolution.”

Use a row lock or conditional revision update inside one transaction at the existing data layer. Do not require a distributed lock service. A lock only helps if every writer follows the same boundary; legacy direct DML must be fenced.

### DB3 — lifecycle state, waiting side and reminder fields admit contradictions

**What/why:** Existing `snoozed` can have null date; `snooze()` can leave an old `resolved_at` intact. The database checks enum membership but does not enforce relationships between state and timestamps. Replacing Pending with two labels without structural constraints repeats the problem.

**Severity:** High when unfinished work disappears; otherwise Medium. **Likelihood:** current UI can deterministically create a snoozed/null-date state.

**Evidence:** migration `:203,220–221,244–249`; `schemas.ts:32–40` only min-length checks for time strings; `ConversationStatusMenu.tsx:68–77` sends Snoozed without a date; `adapter/supabase.ts:854–858` sets status/date but not `resolved_at`.

**Effect:** required amendment, not a demand to freeze physical enum design now.

**Clause:** “Persist exactly one authoritative current work meaning. If storage separates a base Waiting state from waiting side, enforce requester/our-side discriminator exactly when Waiting and no contradictory discriminator otherwise. Reminders are separate from the four work meanings, have a finite due instant and generation when scheduled, and cannot silently make resolved work look unfinished or unfinished work look resolved. Valid state combinations are enforced structurally, not only by UI convention. A reset or cancellation preserves evidence of what changed.”

For implementation: non-null canonical state; same-tenant conversation FKs from transition/reminder records; positive/monotonic revisions; bounded typed transition causes; UTC `timestamptz` instants; finite timer time; server-validated due input. Do **not** add a time-moving DB CHECK such as `due_at > now()` as a lifetime row invariant: an otherwise valid scheduled reminder becomes due naturally. Validate future scheduling at the command, and evaluate due time at execution. Dates displayed in local time must not re-interpret a stored instant when a timezone preference changes.

### DB4 — current last-message logic cannot determine the waiting side

**What/why:** Outbound “I'm investigating” currently makes waiting-on-donor selectors match, while a queued outbound row sets first response metadata. Incoming mail only reopens Resolved, leaving Pending/Snoozed unchanged. D3 requires human work meaning rather than raw direction.

**Severity:** High for forgotten work and false response records. **Likelihood:** common/ordinary message patterns if unchanged.

**Evidence:** `apps/admin/features/support-hub/lib/selectors.ts:17,68–83`; `adapter/supabase.ts:632–658`; `:904–939` constructs queued message then bumps conversation. Scope Q3 document explicitly defines Open as useful staff next action, waiting for requester as awaited participant input, our-side waiting as already sought dependency.

**Effect:** required amendment.

**Clause:** “The four work labels derive from admitted Support intent and relevant causal events, never merely message direction, delivery status or CRM association. A progress update may leave Open; a required requester question may justify Waiting for requester; a dependency already requested from a colleague/owner process/service may justify Waiting on our side. Queued, bounced, suppressed or indeterminate mail cannot be treated as proven requester receipt. Relevant admitted incoming human activity must return the conversation to staff attention without silently retargeting the D2 draft. Automatic/duplicate/quarantined/unrelated events do not qualify as human work merely because they contain thread headers.”

A provider failure can require attention even for Resolved work; do not overload the work state with delivery failure codes. Preserve truthful recipient evidence under D1/D2 and provide a durable visible recovery path. Exactly which send convenience selects a work state remains a later explicit policy; D3 is not authorization for send-and-resolve defaults.

### DB5 — history is currently mutable, incomplete and erasable

**What/why:** Current status writes append no lifecycle audit. `resolved_at` is overwritten/replaced and cleared on reopening, so current-row reports forget prior resolution episodes. Broad DML and cascade deletes can remove messages and their audit history along with an inbox/conversation.

**Severity:** High. **Likelihood:** deterministic history drift under resolve/reopen; deletion exposure conditional on authorized row deletion.

**Evidence:** `adapter/supabase.ts:837–846,643–649`; `audit.ts:34–45` is a separate append helper used by moves, not status setters. Migration `:228–231` cascades inbox deletion to conversation; `:487–490` cascades conversation deletion to audit; `:548` allows authenticated DML; `report-aggregations.ts:319–342` counts current `resolvedAt` only. `move-service.ts:206–232` writes paired audit markers after the move already committed, proving its append helper does not create a transaction with earlier mutations.

**Effect:** required safeguard inherited from D1, now precise for D3 history.

**Clause:** “A work transition commits its before/after work meaning, cause, canonical human/system actor, server-recorded time and causal reference together with the current state. Preserve each resolution/reopening/wait episode; current status is a current-state fact and is not sufficient historical reporting evidence. Ordinary clients cannot update/delete transition history, and routine inbox/conversation removal must not cascade away required evidence. Owner-governed redaction and retention are explicit operations, not hard-delete shortcuts. Status changes do not themselves create a duplicate external communication event.”

Use current row plus append-only transition history, not wholesale event sourcing. Record occurrence time separately from server acceptance/order when needed; late events must not rewrite the original causal order or replace a later correction. Null human actor is valid for a system cause, not for anonymous human attribution.

### DB6 — copying existing workflow actor or claim conventions can be unsafe

**What/why:** Shared workflow infrastructure is reusable, but neither Inngest runtime state nor an expiring claim is the timer's business authority. A worker whose claim expired may still run after another worker has acted. Copying the workflow nil-UUID actor into a Support profile FK can fail or fabricate identity.

**Severity:** High for stale execution/history; Medium for failed timer audit. **Likelihood:** conditional on naïve reuse during recovery/crashes.

**Evidence:** `openspec/specs/workflow-orchestration/spec.md` requires product-owned facts, shared ledger/claims, identifier-only envelopes and rollback-safe recovery. `supabase/migrations/20260611181000_workflow_work_claims.sql:8–29,45–99` implements expiring per-tenant claims; `:125–133` locks down privileged RPC execution. `packages/api/src/workflows/events.ts:17–22` documents its nil system actor specifically for audit table without FK; Support audit actor_profile_id has profiles FK at migration `:480`. Scoped source finds no registered durable Support snooze wake executor.

**Effect:** qualification requirement; no new orchestration product.

**Clause:** “The product-owned reminder identity, generation and current work state decide whether a due callback may act. Shared workflow dispatch/claims deliver attempts only; every attempt revalidates the exact live generation, due condition, tenant and work eligibility atomically. Cancelled/replaced/resolved reminders make old callbacks idempotent no-ops. Timer creation/cancellation and dispatch/recovery intent are durably linked. Use identifier-only workflow envelopes. System transitions have an explicit system cause and no fabricated human profile; human transitions derive the true acting profile, not an assumed equality with auth user ID.”

Current `move.ts:60,119` labels `ctx.userId` as actorProfileId while `packages/auth/context.ts:297–303` returns userId/profileId separately. This is a normalization risk for reuse, not evidence that current production rows have mismatched IDs. For D3 use the correct trusted profile field. Do not insert `WORKFLOW_SYSTEM_ACTOR_ID` into a Support profile FK by convention.

### DB7 — queue counts and waiting reports can hide older outstanding work

**What/why:** List queries apply a 2,000-row cap before search/label filters; counts read that capped list. Older unfinished work can disappear or totals become falsely complete. Current waiting and historical metrics infer meaning from direction/current timestamps; business-hours toggles do not actually implement those calculations.

**Severity:** High for lost operational work; Medium for reporting trust. **Likelihood:** deterministic at the cap/filter boundary, workload prevalence unknown.

**Evidence:** `adapter/supabase.ts:671–724`: tenant/inbox/status/assignee filter occurs SQL-side, but cap `:689–695` precedes text/label filter `:707–723`. `apps/admin/app/api/admin/support/counts/route.ts:16–25` counts that list. `selectors.ts:39–56` excludes Snoozed from unassigned/past-due; `report-aggregations.ts:262–282` defines waiting by last inbound direction; `:319–342` current resolution; `:417–430` identical calendar calculation whether business hours supplied; `:462–470` ignores `_businessHours`.

**Effect:** required completion of existing D1 read-model debt; B makes the new categories useful only if accurate.

**Clause:** “Status, waiting-side, unassigned, due and recovery views and their counts use the same authorized complete query predicate before pagination. Outstanding work remains discoverable even when snoozed, unassigned, old, moved or beyond one page. Filters/counts do not treat a truncated array as the dataset. Current-state counts and historical waiting/resolution metrics are labelled separately and derive from the appropriate facts. No business-hours/SLA claim is made until its calendar and episode calculation are implemented and proved.”

Use deterministic keyset pagination/tie-breaker where appropriate, same-tenant indexes chosen from the actual filtered/due query, and bounded recovery scans. Existing status/inbox/assignee indexes (migration `:252–259`) are useful starting evidence, not proof of capacity. A composite due-index should align with unresolved+active reminders; benchmark realistic oldest outstanding cases and skew, not just recent fixtures. Do not preselect speculative scale targets or invent measured performance.

### DB8 — Waiting on our side can become a shadow CRM/finance workflow

**What/why:** A generic “handoff complete” flag could copy financial state, let ordinary donor-care staff execute unauthorized operations, or prematurely resolve support. A linked Party/email does not authorize data exposure. Current Support contact links are a prototype, not a finished owner integration.

**Severity:** High. **Likelihood:** conditional on shortcut implementation; actual direct support-to-finance completion path not found.

**Evidence:** `openspec/specs/contribution-operations/spec.md:13–28,88–103,122–141` gives shared Contribution Operations ownership and granular capability/reason/audit obligations. `packages/api/src/admin/contribution-operations/permissions.ts:51–82,85–101,128–165` enforces capability policy, e.g. manage_receipts/run_refunds. `route.ts:77–87` accepts supported actions with expected revision/idempotency, and `:112–135` produces owner detail. `types.ts:26–35` lists source surfaces without a Support-specific one. `ConversationCrmLinks.tsx:67–128` merely builds CRM/contributions query links from `contact_ref`; `adapter/supabase.ts:454–457` casts that JSON, and schema `:210` has no relational target constraint. A populated label/link is not a proved handoff.

**Effect:** preserve B; require narrow actual owner integration.

**Clause:** “Waiting on our side records Support's awaited dependency and follow-through responsibility. It neither creates nor completes the owning business action. Display only owner-authorized context and links; invoking any CRM/giving/document/care action uses that owner's admitted command, capabilities, validation, approval and audit. Record only stable same-tenant authorized owner references and allowed outcome projections. Linking, assignment, status, matching email or a timer grants no new access. A source outcome may signal Support to review the outstanding obligation, but does not silently send mail or resolve work.”

No generic handoff registry is assumed available. Where Core already provides a qualified command, reuse it. Where Support source attribution/reference capture is absent, narrowly extend the owning contract during authorized specification/implementation rather than use an “api” label to conceal provenance or invent a copied action record. An unavailable/revoked target reads as a restricted/unavailable dependency, not completed and not deleted history. CRM deletion/merge cannot rewrite original support observations.

### DB9 — mixed-version rollout misclassifies old Pending/Snoozed

**What/why:** Current Pending has no reason; Snoozed is mutually exclusive with Pending. A migration that classifies from the latest email invents waiting-side history. Old clients and macros can continue writing old values or bypassing atomic transition rules; rollout disablement can lose due work if coupled to the new UI.

**Severity:** High. **Likelihood:** plausible at any nontrivial migration; deterministic if guessed backfill is used.

**Evidence:** migration `:203,221,244`; current source constants `packages/database/collections/support-hub.ts:16–21`, route schema `schemas.ts:32–40`; `mutations/run-macro.ts` accepts existing set_status/snooze actions; legacy `packages/api/src/admin/support` remains separate. Existing new work contract is not implemented.

**Effect:** required migration clause, no founder label change.

**Clause:** “Add compatible work-state/history/reminder contracts before activation; inventory and fence every old status writer. Backfill only known facts. Preserve ambiguous legacy state and mark it for bounded staff review without falsely assigning requester/our-side waiting from message direction. Keep old due timestamps and history evidence; never recalculate past wait periods as if the new meanings had always applied. Old clients incapable of preserving the new contract cannot write through a legacy bypass. Disabling new writes leaves accepted-message recovery, due-work visibility and durable history usable; roll forward corrections rather than rewriting evidence.”

An operational legacy-review marker is not a fifth normal founder work state. The conversion policy must be explicit and visible; it cannot quietly drop pending work or endlessly require database repair. No destructive automatic reset of historical timers or sent/delivery records is justified.

### DB10 — current tests are not proof of safe state transitions

**What/why:** Query-spy tests can pass despite permissive grants, races, missing audit and capped counts. In-memory current selectors encode the old direction inference; preserving their expectations would preserve D3's defect.

**Severity:** High for release confidence. **Likelihood:** high if existing green tests alone are called completion.

**Evidence:** `tests/unit/packages/api/support-hub-supabase-adapter.test.ts:269–306` verifies status query builder calls; `tests/unit/apps/admin/features/support-hub/selectors.test.ts:131–134` asserts direction-based waiting sets. None establishes deployed PostgreSQL or concurrent business outcomes. No DB runtime tests were executed for this read-only audit.

**Effect:** proof requirement.

**Clause:** “Before activation, independently prove API authorization and real PostgreSQL grant/RLS constraints, atomic state/evidence transitions, duplicate/stale event and timer races, complete authorized queue/count predicates, ambiguous legacy migration, and owner-command handoffs. Assert user-visible/domain outcomes, not merely method calls. Each new work label and invariant traces to D3, later authorized specification, implementation and release evidence.”

## Schema/access review checklist — findings and intentional nonfindings

- **Tenant primary/foreign keys:** current conversation PK is `(tenant_id,id)` and inbox/assignee/team/SLA FKs include tenant (`migration:227–243`). This is correct existing structure; not missing. New transition/reminder/owner-reference relationships must retain it. Independent raw UUID profile/CRM references require server scope validation or a suitable composite owner relation, not assumption from JSON.
- **Nullability/defaults:** Open default exists; assignee/team are nullable intentionally for unassigned work. Do not “fix” missing ownership by manufacturing an agent. New waiting side must be unambiguous when selected; timer scheduling metadata is required for an actual scheduled timer, not for every wait.
- **Unique/check constraints:** enum and nonnegative counts exist; status/timestamp combos, transition idempotency and timer generation are unimplemented requirements. No money types are added by D3, so financial precision changes are unnecessary.
- **Delete/history:** present cascades and DML are unsafe for required audit longevity. Define owner-governed archival/redaction and preserve necessary durable evidence, not blanket eternal storage.
- **RLS USING/WITH CHECK:** both current predicates exist, with broad same-tenant staff scope. Remove bypass DML; if any mutable client path remains, prove both pre/post scope plus immutable tenant/identity, rather than assume a restrictive-looking new permissive policy overrides the old one.
- **Views/RPCs/service role:** no production view policy was inspected. A new read view must be security-invoker with appropriate grants or not client-exposed; all RPCs need least-privilege execution and safe search path. The current shared workflow claim RPCs explicitly revoke public/client execution. Service role bypass means application checks are indispensable.
- **Indexes/backfills:** current status/inbox/assignee indexes exist. Due-work scanning needs its actual query/index proof; adding four labels does not justify premature partitioning, caches or a new search engine. Migration must not infer historical wait side.
- **Actor ownership:** server auth exposes userId/profileId separately. Human authorship and system timer cause are distinct. Never borrow assignee identity for the person changing state or invent a profile for a workflow.

## Specific falsifiable acceptance evidence

1. Authorized worker changes each state; unauthorized tenant/role/resource, forged actor and direct-table mutation all fail without partial state/history write. Both sides of any admitted RLS mutation are tested; actual returned/changed rows are asserted, not success-with-zero-rows.
2. State update + transition audit + due-work intent either all commit or all remain unchanged. Lost response can be read back by stable command identity. Repeated resolve does not create a new resolution episode.
3. Resolve vs newly admitted reply; wait-side change vs two workers; resnooze/cancel vs old due callback; move vs callback; callback after claim expiry and new worker: exact expected final state/history with no silent lost work.
4. Reminder outage after durable scheduling is discoverable/recoverable from product-owned facts. Generation mismatch is a no-op. Shared tenant worker envelopes contain no body/attachments/CRM payloads. Current owner/tenant state still authorizes the effect.
5. Progress email remains Open when staff owe work; requester question waiting is not inferred merely from queue insertion; bounce/indeterminate send stays actionable; auto-reply/duplicate/quarantine does not fabricate human work. D2 recipients and drafts remain untouched.
6. A requester + finance multi-wait scenario retains all outstanding context and support accountability without claiming one label is a complete dependency graph. Active support next action has priority over a blocking label. Authoritative action completion cannot be inferred from Resolved.
7. 2,001+ conversations with the oldest matching wait/label, unassigned snoozed work, identical timestamps across pages, tenant skew and restricted records: no false zero or missing operational work; exact counts equal the full authorized predicate.
8. Resolve→reopen→resolve reports current state separately from two historical episodes. Wait duration does not restart on progress email/CRM relink/inbox move. Calendar/business-time metrics are not conflated.
9. A worker who may answer support but not refund/view protected details can use the allowed handoff surface without bypassing Contribution Operations. Restricted target metadata is not exposed through status/reason/notifications. Target deletion/merge/revocation never claims completion.
10. Migration old Pending/unknown timer evidence, mixed-version writers, old macro, rollback fence and accepted-effect recovery preserve data and make uncertainty visible without forced invented history.

## Ordered synthesis

1. Record the four founder meanings with the boundary that work, delivery, assignment, follow-up time and owner outcome remain distinct. State what happens when several inputs are outstanding; do not use arbitrary email direction to choose a side. This semantic rule is required before D3 is called fully settled.
2. In later authorized design, specify canonical transition input/result, trusted actor, current-work version, timer generation, transition evidence and safe owner-reference/projection contracts. Choose the smallest schema that enforces the valid combinations; avoid generic workflow/task machinery.
3. Close the direct-write and historical-audit gaps, then implement atomic transition/timer recovery using shared Core ledger/claims with generation fencing. Fix current work/count queries and their bounds before advertising four reliable queues.
4. Qualify actual owner-domain handoffs; preserve their capabilities, audit and source attribution. Finish mixed-version migration and tests before inbox activation. Existing real commands are reused; absent Support wiring is not represented as complete.
5. Residual monitoring only after proof: one confirmed lost transition/audit, stale timer state overwrite, cross-tenant access or false owner-completion claim is an invariant breach owned by Support/platform engineering (plus security/owning domain where relevant): fence affected writer, preserve evidence, reconcile and prove regression before re-enable. Every failed lifecycle command gives its worker an immediate honest result and retained work; every due item unhandled after its qualified execution/recovery deadline is owned by the workflow operations owner, visible in recovery, and retried under the same identity. Do not invent an unqualified latency deadline or page for every harmless retry; qualify scheduling/recovery deadline with the shared workflow owner before release.

No known correctness/authentication/history concern is relegated to monitoring. No timer durations, SLA pauses, automatic no-response closure, Send-and-close defaults or new financial behavior are selected by this DB audit.

## Current primary technical references

- [PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html): grants/policies, privileged bypass, old/new row scope and permissive policy combination; queried earlier in this session and matched local configured major 17.
- [PostgreSQL 17 explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html): transactions/row locks support a single conditional transition rather than read-modify-write spread over separate requests.
- [PostgreSQL 17 constraints](https://www.postgresql.org/docs/17/ddl-constraints.html): relational/unique/check constraints express valid row relationships; they cannot replace trusted actor authorization or a correctly scoped command.
- [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security): current guidance distinguishes grants from row policies, requires RLS for exposed tables, warns service role bypass and default view behavior, and calls for explicit allow/deny database tests.

The Supabase changelog markdown fetch was attempted but web extraction rejected its markdown content type; no Supabase implementation/API change depended on that fetch. Database enforcement/runtime capacity and the new D3 design have not been exercised in a live environment. The report's permanent path is architectural/grooming language with explicit proof obligations, not a production readiness claim.

---

# D3 — Staff lifecycle and restrained interface evidence

Checked 10 September 2026. Founder selection: **Open / Waiting for requester / Waiting on our side / Resolved**, with clear, easy, attractive UX. This independent input pressure-tests semantics and interaction behavior. It is grooming evidence and proposed amendments, not a formal specification, implementation, or claim of completed accessibility/usability testing. No mail, inbox, DNS, database, or account mutation was performed.

**Disposition: Accept with required amendments.** Four work labels are proportionate if they explain the next responsibility and do not become four competing workflows. A single current status, a separate scheduled reminder, preserved assignment, truthful message delivery, and an authorized owner-domain handoff are enough. Do not expand D3 into a generic ticketing framework, customer portal, SLA product, new design system, or new per-user preference hierarchy.

## Pressure-tested meaning

| Work label                | Exact proposed meaning                                                                                                                                           | What it must not imply                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Open**                  | Support has an actionable next step now, including reviewing a newly admitted message or a follow-up that is due.                                                | “Unread,” “unassigned,” or “the staff member currently has the browser open.”                                                              |
| **Waiting for requester** | Support has requested needed information or action from the people seeking support, and that is the only currently blocking input.                               | The original CRM contact is the only person who can respond; a matching email proves authority; an undelivered question was received.      |
| **Waiting on our side**   | The next necessary input/action belongs to a colleague, owning Asym domain, or third party. Support retains accountability and will follow up when needed.       | Support is actively performing the next step itself; ownership transferred to another domain; a refund or other business action completed. |
| **Resolved**              | Staff have deliberately completed the support obligation under the agreed resolution rules, with no outstanding support follow-up being represented as finished. | Read/archived, successfully delivered/read by everyone, deleted, or underlying CRM/financial/care action executed.                         |

“Our side” is a useful short staff-facing phrase, but not self-explanatory. Give it the concise description **“Waiting for a colleague, another team, or an outside party.”** Explain it in the menu, not in permanent instructional chrome. The expected actor may be outside the tenant; “our side” means Support's responsibility to obtain that input, not an assertion about their employment or permissions.

For **mixed waiting**, use a deterministic rule instead of a fifth state: if Support itself has an actionable step now, use Open. Otherwise, if an active dependency on our side remains, use Waiting on our side, even when requester input is also outstanding; brief existing notes/owner links explain both. Use Waiting for requester only when the active blocking input is entirely requester-side. Future hypothetical steps are not active dependencies. A progress update may still be sent while waiting; that alone need not change the state. This is proposed Asym behavior, not an inferred industry standard.

The strongest alternative remains Open/Waiting/Resolved. Front and Help Scout make it credible. B retains its advantage only if staff can classify these examples reliably without constantly adding mandatory fields. Do not add required custom reason dictionaries, a blocker graph or a separate team-assignment workflow solely to justify four labels.

## Current Core UI evidence

Read-only inspection verified execution in `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`. Root/admin/UI instructions, frontend/testing rules, canonical accessibility-review skill and touch/accessibility reference were read. `packages/ui/components.json` confirms `base-maia`, Base UI and Zinc-oriented semantic CSS variables. Source facts below are not deployed-browser observations.

- `apps/admin/features/support-hub/components/detail/ConversationStatusMenu.tsx:26–37` still presents Open/Pending/Snoozed/Resolved and hardcodes palette utilities. D3 needs meaningful labels while retaining shared primitives and moving touched status styling to the existing semantic-token approach. Current trigger text supplies a readable button name; do not falsely call it unnamed.
- That menu's `:71–88` uses ordinary action items and a visual Check for the active option. The proposed picker should expose current selection using the existing shared primitive's appropriate checked/selected semantics. This is a concrete improvement requirement; no browser/assistive-tech conformance result was produced.
- `ConversationHeader.tsx:55–81,120` presents a raw status breadcrumb, a separate Resolve action, and a status picker. `:62` exposes the internal raw status string. New longer labels should come from one presentation mapping and fit without awkward uppercase microtext or duplicated status chrome. The close-detail button is correctly labelled at `:88`; it must remain a navigation action, not resolution.
- `ConversationSnoozeMenu.tsx:37–41,80–84` calls a fixed sixteen-hour offset **Tomorrow morning**. That is a deterministic semantic defect: the result depends on the current hour and can be afternoon or the same calendar date. The menu also ties snooze display to `status === "snoozed"` at `:49`, contrary to the new separation. Use explicit intended local date/time and display the resolved time/zone; relative-duration actions should be named as durations.
- `hooks/use-support-mutations.ts:161–168,188–202` invalidates data on status success, while the header/menu direct mutation paths do not themselves provide contextual pending/conflict/error feedback. A global error facility, if any, would not prove the proposed retained-context recovery behavior. Do not claim every error is globally silent without inspecting the complete provider.
- `lib/bulk-mutations.ts:1–20` already uses `Promise.allSettled` and counts partial failures. `components/table/bulk-actions.tsx:68–84` correctly distinguishes success, partial success and all-failed toasts. **Do not report a false all-success defect.** The result only retains counts and first error, losing the failed conversation IDs needed for precise review/retry.
- `components/SupportInbox.tsx:93–108` computes next/previous from the filtered list and falls to a list boundary when the selected item is absent. `:110–124` invokes resolve/snooze with no local catch; `openSnoozeMenu` is wired to an immediate 24-hour mutation at `:134`. Label/action parity and selected-list anchoring require proof. This review did not exercise focus or assert an observed jump.
- `components/board/SupportBoardView.tsx:82–88` submits drag/drop status changes through the same mutation hook. Preserve the same rules for menu, keyboard and board paths; provide a nondrag action. Source review alone does not prove drag/drop accessibility.
- `ConversationCrmLinks.tsx:73–127` provides CRM/giving query links. It does not itself establish permission-aware record results or draft/queue return continuity. D1/D2's owner-boundary and return-context requirements remain necessary.
- **False positive avoided:** despite local `h-8` classes, `packages/ui/styles/globals.css:375–391` already applies the shared 44px minimum height for coarse-pointer buttons/menu items. Do not assert every such button has a 32px touch height. Width, effective spacing, focus and actual viewport behavior still need browser checks.

## Primary comparison evidence beyond status names

All pages were checked on 10 September 2026. These are documented product behaviors, not vendor runtime experiments or empirical proof of Asym usability.

| Source / version context                                                                                                                                                                              | Documented behavior                                                                                                                                                                | Adopt, simplify or reject                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Front: changing status](https://help.front.com/en/articles/2134), edited 2026-06-30                                                                                                                  | The conversation header exposes status actions and indicates affected inboxes/sections. A shared-inbox change affects shared views; follower sections can retain individual state. | Adopt visible scope and a header-level work control. **Simplify** to one authoritative Support work status; do not import personal follower status copies as competing business truth.               |
| [Front: personal preferences](https://help.front.com/en/articles/2033), edited 2026-07-08                                                                                                             | A selection-direction preference chooses the conversation above, below or based on navigation direction after the current item disappears.                                         | Confirms post-action navigation needs an explicit behavior. Asym can choose stable detail by default and explicit Next; no new preference matrix is needed for D3.                                   |
| [Front: ticket statuses](https://help.front.com/en/articles/1300288), edited 2026-04-22; latest Starter+                                                                                              | Open/Waiting/Resolved are available in shared-inbox controls, send actions and filters. Resolved may include awaiting customer information where no follow-up is planned.          | Adopt a small lifecycle and consistent surfaces. **Reject that broader Resolved meaning for silently labelling an unfinished obligation as solved.** Founder labels require explicit Asym semantics. |
| [Front: mass actions](https://help.front.com/en/articles/2188), edited 2026-04-16                                                                                                                     | Bulk actions show progress; Stop does not reverse already applied work. Rule execution differs between small/large selection methods; mass Undo is unavailable.                    | Adopt truthful progress/stop semantics. Reject selection-size-dependent business behavior. Do not copy its 10,000 selection cap or promise a universal batch Undo.                                   |
| [Zendesk: Play mode](https://support.zendesk.com/hc/en-us/articles/9186492658714-Using-Play-mode-to-quickly-work-through-tickets), edited 2026-05-01; Guided mode specifically Enterprise/Enterprise+ | Explicit Play mode advances through available tickets after Submit; staff can select Stay on ticket. It uses the view's ordering.                                                  | Adopt intentional, predictable advancement. Do not silently jump to another donor after a simple status edit or implement Guided mode for parity.                                                    |
| [Zendesk: accessing views](https://support.zendesk.com/hc/en-us/articles/4408829483930-Accessing-your-views-of-tickets), current documented agent view                                                | Submit navigation options include Close tab, Next ticket in view, and Stay on ticket.                                                                                              | Separates changing work from navigating. This does not establish the proposed Asym default or prove accessibility of the implementation.                                                             |
| [Help Scout: status/icons](https://docs.helpscout.com/article/11-understand-conversation-icons-and-colors), updated 2026-05-01                                                                        | Header status and assignment controls are distinct. The fixed Active/Pending/Closed vocabulary appears in ordering and visual treatment.                                           | Adopt one consistent presentation/meaning across header and queues; use text as well as color. The three-state alternative is legitimate, not weak design by definition.                             |
| [Help Scout: keyboard navigation](https://docs.helpscout.com/article/419-keyboard-shortcuts), updated 2025-09-27                                                                                      | Direct status/next/previous shortcuts coexist with visible controls and an accessible text shortcut list.                                                                          | Adopt discoverable keyboard operation; do not copy shortcut letters without Core scope/typing/IME protections.                                                                                       |
| [Help Scout: mobile](https://docs.helpscout.com/article/1601-use-the-help-scout-mobile-app), current iOS/Android article                                                                              | Mobile exposes status/assignment in conversation controls and status/snooze in bulk actions. Its manual-workflow behavior differs from web by not permitting pre-send edits.       | Adopt first-class touch control; reject using desktop familiarity to excuse missing mobile review or recipient/content protections.                                                                  |
| [Help Scout: snooze](https://docs.helpscout.com/article/1572-snooze), updated 2026-02-17; all current plans/users                                                                                     | A snooze time does not change work status; reply/expiry restore Active and assignment remains.                                                                                     | Supports separating reason/status from a timer. Asym need not reproduce both persistence modes or automatically clear reminders on moves.                                                            |
| [HubSpot: managing Help Desk tickets](https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk), updated 2026-07-20; Service Hub Professional/Enterprise                                   | Table/split/board views share tickets. Status/owner are editable at the top; associated records and history appear in the side panel. Viewing is permission-limited.               | Adopt in-context work controls and relevant CRM links. Do not copy automatic contact creation, arbitrary sidebar customization or a second CRM.                                                      |
| [Zoho: ticket work modes](https://help.zoho.com/portal/en/kb/desk/ticket-management/work-modes/articles/ticket-work-modes), undated current page                                                      | Status mode groups tickets into columns; bulk actions can change status. CRM-specific Handshake mode requires a separate Zoho CRM integration.                                     | Adopt scannable status groups where useful; do not recreate synchronization or CRM segmentation just to support four work labels.                                                                    |
| [Zoho: On hold](https://help.zoho.com/portal/en/kb/desk/ticket-management/ticket-status/articles/understanding-the-onhold-ticket-state), undated current page                                         | On hold can represent waiting for requester/third party and pauses response/resolution SLA clocks/escalations.                                                                     | **Reject automatic SLA-pause inference.** Work state and service promise calculation need a separate owner rule; snooze is not a blanket excuse to stop measuring responsibility.                    |
| [Kustomer: status](https://help.kustomer.com/en_us/change-status-HkvUsVS8W), last update July 2026; plan availability linked separately                                                               | Open/Snoozed/Done and sub-statuses; marking Done can surface the next routed conversation. Email replies can reopen Done with valid threading.                                     | Adopt explicit wake/reopen and preserve reply continuity. Do not copy tasks-as-conversations or configurable sub-statuses for D3.                                                                    |
| [Freshdesk: details enhancements](https://support.freshdesk.com/support/solutions/articles/50000013902-ticket-details-enhancements), modified 2026-05-25; Unified Inbox prerequisites                 | Quick-list context and drafts are preserved; secondary actions are moved into menus; To/Cc/Bcc remain clear.                                                                       | Adopt progressive disclosure for secondary tools, not for important status/audience information. This article does not prove exact keyboard focus behavior.                                          |
| [Intercom: snooze](https://www.intercom.com/help/en/articles/6564538-snooze-a-conversation), current page marked updated over a week ago                                                              | Fixed/custom follow-up times, visible snoozed views and automatic waking are supported. Tomorrow maps to 09:00 workspace time; other reopen triggers vary by settings.             | Adopt exact visible timing; reject copying 09:00, automatic wake from every internal edit, or arbitrary nonresponse closure.                                                                         |
| [Front: undo send](https://help.front.com/en/articles/2035), edited 2025-11-06                                                                                                                        | Undo send delays sending and cancels within that interval; it cannot recall after send.                                                                                            | Distinguish status correction from transport cancellation. A status Undo must never imply it retracts a sent email, reverses giving, or erases audit history.                                        |

### Nonprofit context where relevant

[Bloomerang's task views](https://help.bloomerang.com/en/articles/12632464-view-tasks) expose related tasks both in a work list and on constituent timelines, with due/status details and explicit completion/interaction actions. The undated current page is evidence for context continuity, not a reason to copy a fundraising task system into Support. [Blackbaud for Outlook](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/outlook/content/bb-outlook-add-in.html) supplies constituent context beside mail and restricts creating actions to users with that permission. Its page is undated; current version-wide availability is not established here. Reuse the principles of nearby context and authorized action, not unrestricted gift summaries, a second history writer, or synchronization inside Asym.

### Feedback and empirical limits

A [Zoho community complaint](https://help.zoho.com/portal/en/community/topic/tickets-with-zoho) objects to tickets being closed after requests for more information. Date, version, sample size and resolution are not exposed in the retrieved text. Treat it as a real reported confusion pattern, not proof of current default Zoho behavior or measured prevalence. It supports testing whether staff/requesters interpret Resolved truthfully. Vendor docs and source inspection do not establish that these proposed labels are beautiful, effortless, understood by every ministry team, or accessible in a deployed browser. Those are falsifiable acceptance requirements below.

## Exact restrained interaction clauses

**UX1 — One visible work control.** “Display the canonical work status as one text-labelled status picker in the conversation header, close to assignment. Offer the four labels in a consistent order, with the current option programmatically selected. Show concise secondary descriptions within the picker when needed. Do not add four permanent buttons, duplicate status breadcrumbs, a fifth Mixed status, or a required explanation dialog for ordinary changes. Reuse `@asym/ui`, exact base-maia geometry and semantic tokens; do not replace Core's design system.”

**UX2 — Clear state versus action.** “Open means Support has a step to act on now. Waiting for requester means needed requester input is the only active blocker. Waiting on our side means a colleague/owner-domain/third-party dependency remains; Support retains accountability. Resolve is an explicit staff action under resolution eligibility, not an automatic consequence of reading, sending, adding a note, snoozing, or finishing a finance/CRM UI.”

**UX3 — Mixed waiting without extra machinery.** “If Support can act now, use Open. Otherwise, simultaneous requester and our-side blockers use Waiting on our side; an existing note or permitted owner reference can explain the requester dependency. Do not create a generic dependency graph, mandatory custom-reason taxonomy or separate customer/team state machine solely for this distinction. A staff member may send a progress update while retaining a waiting status.”

**UX4 — Keep work in place.** “An ordinary status change preserves the selected conversation, current draft, scroll context and keyboard focus. Update queue membership/counts from confirmed state without pretending a filtered-out conversation still matches. If necessary, show a small in-place indication that it moved to another view, with a link there. New incoming rows and background refresh do not move the item under a pending pointer/keyboard action or select another person's conversation. Next/previous navigation is explicit; any deliberate advance flow is clearly identified and acts only after the update result is known.”

**UX5 — Honest feedback and correction.** “Expose the pending operation without freezing unrelated reading/composition. On success, show the confirmed status and concise accessible feedback. On known failure, retain work and show the current canonical state with an inline retry path; on uncertain outcome, reconcile before retrying. On a version conflict, retain the draft and explain that the conversation changed. Offer a status correction/Undo only as a new authorized, conflict-checked action. It must not overwrite later human/inbound/timer changes, erase audit events, recall mail, or reverse an owner-domain effect. A temporary toast is never the only access to failure details or correction.”

**UX6 — Reminder remains separate.** “Present the scheduled follow-up independently of the four work labels. Show the actual due date, time and relevant zone. A duration action states a duration; a calendar-relative action resolves in its stated zone and displays the result. Do not call a fixed sixteen-hour offset Tomorrow morning. Reminder creation/edit/removal preserves assignment and draft; its due/wake behavior follows the explicit lifecycle contract. Ordinary waiting does not silently pause an SLA or hide unresolved work from the shared team's accountability view.”

**UX7 — Delivery and owner context remain truthful.** “A message's pending/retrying/failed/indeterminate recipient result remains visible independently of work status. A failure requiring staff recovery appears in an actionable view even if the conversation was previously resolved or waiting. Support's status does not assert the requester received the message. The CRM/context panel shows only authorized relevant facts and navigates to owner commands with return context preserved. It cannot grant access or silently create/complete a financial, CRM, identity or care action.”

**UX8 — Same meaning everywhere.** “List, board, command palette, detail menu, keyboard shortcuts, API-backed batch operations and CRM projections share the same four labels and transition validation. A drag/drop operation has a keyboard/touch alternative. The close-detail navigation action does not resolve the conversation. No rule behaves differently merely because the same conversations were selected by a different UI method or batch size.”

**UX9 — Restrained bulk experience.** “For existing supported bulk status operations, show the selected count and target state before execution. Resolve each eligible item through the same authorization/version boundary. Report confirmed changed, skipped/conflicted and failed item counts and provide authorized per-item details. Preserve/reselect failed items for safe retry rather than resending successful operations or reverting unrelated newer state. Stopping a batch stops unstarted work; it is not rollback of committed work. No silent all-matching expansion, blanket success toast, or unqualified Undo promise.”

**UX10 — Accessibility and responsive behavior.** “Use the shared picker/menu's native selected/checked semantics, accessible name, descriptions and focus restoration. Support Tab/Shift+Tab, Enter/Space, relevant arrow keys and Escape without relying on hover. Character shortcuts are disabled, remappable or confined to a focused context as appropriate, and never fire while typing or during IME composition. Status is legible as text, not color alone. Longer localized labels wrap without truncating the distinction; touch targets use Core's existing tokens. Keep focused controls unobscured by sticky composers and menus. Screen readers receive meaningful state/error/reminder updates without focus theft. Preserve zoom/reflow, RTL text handling, reduced motion and mobile list/detail return context.”

These accessibility requirements are grounded in [WAI menu patterns](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [WCAG character shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), and [on-input predictability](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), alongside Core's stronger touch/token conventions. No new ARIA replica or primitive package is required.

**UX11 — Optional combined sending stays explicit.** “Changing status alone never sends an email. If a combined Send and set status action is exposed, its label states both effects; it uses the shared D1/D2 admission contract and provides truthful partial/uncertain outcomes. The ordinary Send action must not silently learn or inherit a resolution choice from the previous conversation. D3 does not introduce another per-user default-setting hierarchy.”

## Material UX concerns with consequences

| Concern                               | What could go wrong / why it matters                                                                                                                              | Severity and conditional likelihood                                                         | Effect on D3 and permanent prevention                                                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ambiguous “our side” or mixed waiting | Staff use it for active work, hide a team obligation under requester waiting, or add inconsistent custom labels.                                                  | Medium workflow harm; high if it suppresses required action / plausible without definitions | **Amend**, keep B. UX2–UX3; menu description plus classification scenarios. No empirical misclassification rate is claimed.                                            |
| False resolution                      | Reading, sending, or lack of response is mistaken for completion; donor gets a closed request while help is still owed.                                           | High trust/work-loss harm / plausible if archive semantics copied                           | **Amend** Resolved eligibility and explicit action; keep no-response/withdrawn/duplicate dispositions distinguishable through later authorized policy. UX2, UX7, UX11. |
| Unstable list/focus                   | Status update removes row and jumps to another donor while staff are composing or clicking, losing context or applying the next action to the wrong conversation. | High wrong-action/draft harm / plausible in filtered live lists                             | **Amend** stable selection and explicit advancement; snapshot action target and retain draft/focus. UX4–UX5.                                                           |
| Time lies                             | “Tomorrow morning” computes a fixed offset or timezone shifts mislead a field worker; overdue follow-up disappears.                                               | Medium follow-up harm / **deterministic existing source counterexample** for fixed +16h     | **Change** reminder presentation/calculation. UX6; exact timezone/calendar boundary tests.                                                                             |
| Cosmetic-only statuses                | New labels appear in one menu while board/hotkey/bulk still write Pending or Snoozed; counts/reports contradict.                                                  | High integrity harm / likely if changed as text-only UI                                     | **Require shared mapping and canonical transitions**, including migration tests. UX8; no silent old-state guessing.                                                    |
| Silent or overstated update feedback  | UI claims Saved/Resolved before confirmation, uncertain network result is retried twice, or all failures disappear in a toast.                                    | High incorrect-state risk; medium friction / plausible network conditions                   | **Amend** pending/uncertain/conflict/known-failure behavior. UX5; authoritative readback and versioned correction.                                                     |
| Bulk loses failed identities          | Counts show partial failure but staff cannot know what remains or safely retry; a batch operation hides unexpected scope.                                         | Medium to High / **source-confirmed reporting limitation**, effects depend on failures      | **Amend** per-item correlated results and explicit selection. UX9. Existing allSettled/count correctness should be preserved.                                          |
| Accessibility or density regression   | Longer labels overflow, checkmarks have no selected semantics, shortcuts trigger during text input, sticky composer obscures focus.                               | High exclusion/wrong-action risk / conditional until browser tests                          | **Amend** shared primitive/token and UX10 requirements; do not falsely assert current blanket WCAG failure or 32px touch height.                                       |
| CRM/owner handoff confusion           | Staff sees “Waiting on our side” and assumes another team owns the Support request or that an owner action completed.                                             | High domain/trust harm / plausible ambiguous UI                                             | **Preserve D1/D2** permission-aware context and distinct authoritative outcomes. UX2, UX7; no copying business state into Support.                                     |
| Overbuilt UI                          | Four states add reason forms, multiple permanent buttons, automatic SLA behavior, personal status copies and settings hierarchies.                                | Medium recurring complexity/friction / preventable design temptation                        | **Narrow** one picker, one shared current work state, optional brief note/reminder, shared primitives. UX1, UX3, UX6, UX11.                                            |

## Falsifiable acceptance criteria

1. Representative donor-care staff classify: actionable Support work; missing requester information; finance/another-domain dependency; third-party dependency; mixed requester/our-side wait; and completed support. They can explain the difference between Open and Waiting on our side. Any inconsistent interpretation that hides responsibility requires wording/interaction correction and retest. This is formative task evidence, not a population error-rate claim.
2. An admitted participant who is staff/missionary/church contact can be the requester-side input source; labels do not depend on a “donor” CRM type. A copied participant's legitimate reply does not bypass admission or protected-record authorization.
3. Change status in a filtered list with an unsent reply. The selected conversation/draft/focus remain; counts and membership update truthfully; Next navigates predictably without losing the filter/anchor. Concurrent new rows and another user's status change do not retarget an action already initiated.
4. Menu, keyboard, board nondrag action and bulk command yield the same allowed state and evidence. Invalid/revoked/conflicting changes explain the problem and preserve work; no inaccessible record details leak in a bulk result.
5. A successful status correction restores only the eligible status through a new event. If a newer admitted reply, actor change or reminder wake occurred, stale Undo cannot hide it or overwrite its state. Undo does not change sent message history or a CRM/giving outcome.
6. A batch with 2 success, 1 stale conflict and 1 permission failure reports those outcomes accurately and exposes permitted affected IDs. Retry targets only currently eligible unresolved items. Stop does not claim committed successes were undone. The numbers are a synthetic test fixture, not production limits.
7. “Tomorrow morning” is tested before/after midnight and the intended morning, across zones and DST changes; the chosen actual date/time is shown before commitment. Reminder state never becomes a fifth work label and waiting never implicitly changes SLA semantics.
8. Failed/indeterminate outbound delivery remains visible beside work status and in recovery attention. Marking Resolved cannot remove known recovery work from all actionable views. A receipt/refund remains governed and evidenced by its owning domain.
9. Keyboard/screen-reader/touch users can inspect, select, cancel and correct status; know the selected value; access failure details after a toast disappears; and return from CRM context to the same draft/queue. Test 320 CSS-pixel reflow, 200% text zoom, long translations/RTL, coarse-pointer targets, IME, sticky-composer focus and reduced motion. Axe alone is insufficient.
10. No status change creates a CRM identity, changes email recipients, sends a message, changes another person's private draft, or bypasses tenant/owner permissions. Any explicit combined operation has separately tested admission, delivery and status outcomes.

No new feature implementation, browser run, benchmark, usability session or assistive-technology test was performed for this input. The finished contribution is the researched proposed interaction contract, concrete source findings, and proof obligations. All material safeguards are pre-release requirements; none is relegated to a vague monitoring promise.

## Executed current-source probe

The program extracts actual pure selector function declarations and the actual reminder preset literal from the verified source revision. It does not bootstrap Core or load environment files. The rows are synthetic fixtures, and the timer arithmetic demonstrates the current literal, not the behavior of a deployed worker.

```json
{
  "kind": "current-source pure-function and literal probe",
  "sourceRevision": "7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd",
  "waitingSelectorIds": [
    "staff-progress-update",
    "request-for-requester-input"
  ],
  "unassignedSelectorIds": [],
  "tomorrowMorning": {
    "literalHours": 16,
    "start": "2026-09-10T20:00:00+07:00",
    "endInBangkok": "11/09/2026, 12:00"
  },
  "interpretation": [
    "Current direction-based selector cannot distinguish a progress update from an actual request for input.",
    "Current unassigned selector excludes a Snoozed unassigned row.",
    "Current Tomorrow morning preset gives noon when chosen at20:00 in Bangkok."
  ],
  "limitations": "No hosted database, React UI, API mutation, provider, authorization or durable timer exercised."
}
```

```javascript
// Isolated extraction of current pure source. No environment loading, app bootstrap or network.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const repo = "/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10";
assert.equal(process.cwd(), repo);
const ts = require(path.join(repo, "node_modules/typescript"));
const relative = "apps/admin/features/support-hub/lib/selectors.ts";
const source = fs.readFileSync(path.join(repo, relative), "utf8");
const ast = ts.createSourceFile(relative, source, ts.ScriptTarget.Latest, true);
const wanted = new Set([
  "isActiveStatus",
  "selectWaitingOnAgent",
  "selectWaitingOnDonor",
  "selectUnassigned",
]);
const fragments = [];
for (const node of ast.statements) {
  if (ts.isFunctionDeclaration(node) && wanted.has(node.name?.text))
    fragments.push(node.getText(ast));
  if (
    ts.isVariableStatement(node) &&
    node.declarationList.declarations.some(
      (d) => d.name.getText(ast) === "ACTIVE_STATUSES",
    )
  )
    fragments.push(node.getText(ast));
}
assert.equal(fragments.length, 5);
const js = ts.transpileModule(fragments.join("\n"), {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
  },
}).outputText;
const context = vm.createContext({ exports: {} });
vm.runInContext(js, context, { timeout: 1000 });
const probe = context.exports;
const rows = [
  {
    id: "staff-progress-update",
    status: "open",
    lastMessageDirection: "outbound",
    assignee: { id: "maria" },
  },
  {
    id: "request-for-requester-input",
    status: "open",
    lastMessageDirection: "outbound",
    assignee: { id: "maria" },
  },
  {
    id: "snoozed-unassigned",
    status: "snoozed",
    lastMessageDirection: "inbound",
    assignee: null,
  },
];
const waiting = Array.from(probe.selectWaitingOnDonor(rows), (r) => r.id);
const unassigned = Array.from(probe.selectUnassigned(rows), (r) => r.id);
assert.deepEqual(waiting, [
  "staff-progress-update",
  "request-for-requester-input",
]);
assert.deepEqual(unassigned, []);

const snoozePath =
  "apps/admin/features/support-hub/components/detail/ConversationSnoozeMenu.tsx";
const snoozeSource = fs.readFileSync(path.join(repo, snoozePath), "utf8");
const snoozeAst = ts.createSourceFile(
  snoozePath,
  snoozeSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
let tomorrowHours;
for (const node of snoozeAst.statements) {
  if (!ts.isVariableStatement(node)) continue;
  for (const decl of node.declarationList.declarations) {
    if (decl.name.getText(snoozeAst) !== "QUICK_SNOOZE_OPTIONS") continue;
    assert(ts.isArrayLiteralExpression(decl.initializer));
    for (const item of decl.initializer.elements) {
      assert(ts.isObjectLiteralExpression(item));
      const props = Object.fromEntries(
        item.properties
          .filter(ts.isPropertyAssignment)
          .map((p) => [p.name.getText(snoozeAst), p.initializer]),
      );
      if (
        ts.isStringLiteral(props.label) &&
        props.label.text === "Tomorrow morning"
      ) {
        assert(ts.isNumericLiteral(props.hours));
        tomorrowHours = Number(props.hours.text);
      }
    }
  }
}
assert.equal(tomorrowHours, 16);
const start = "2026-09-10T20:00:00+07:00";
const end = new Date(new Date(start).getTime() + tomorrowHours * 3600000);
const inBangkok = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Bangkok",
  dateStyle: "short",
  timeStyle: "short",
  hour12: false,
}).format(end);
assert.match(inBangkok, /12:00/);
const result = {
  kind: "current-source pure-function and literal probe",
  sourceRevision: "7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd",
  waitingSelectorIds: waiting,
  unassignedSelectorIds: unassigned,
  tomorrowMorning: {
    literalHours: tomorrowHours,
    start,
    endInBangkok: inBangkok,
  },
  interpretation: [
    "Current direction-based selector cannot distinguish a progress update from an actual request for input.",
    "Current unassigned selector excludes a Snoozed unassigned row.",
    "Current Tomorrow morning preset gives noon when chosen at20:00 in Bangkok.",
  ],
  limitations:
    "No hosted database, React UI, API mutation, provider, authorization or durable timer exercised.",
};
fs.writeFileSync(
  path.join(__dirname, "d3-source-probe-result.json"),
  JSON.stringify(result, null, 2) + "\n",
);
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
```

## Executed proposed logical model

This is an in-memory sequential design experiment with injected permission/admission. It is not an actual API, PostgreSQL, worker, UI or provider test. The named cases test only the encoded rules and orderings; unmodeled snooze command replay and real locks/authorization/durability remain required proof.

```json
{
  "kind": "proposed logical design only",
  "checks_passed": 15,
  "checks": [
    "primary wait rules and no inferred resolution",
    "work status does not readdress a draft",
    "both orderings of resolve versus new reply preserve review work",
    "repeat resolution and same-identity retry do not fabricate a cycle",
    "changed command payload cannot reuse identity",
    "abstract tenant/permission denial leaves state unchanged",
    "timer preserves wait on creation and opens once at exact due boundary",
    "superseded timer cannot fire after reschedule",
    "resolution cancels old timer atomically in the model",
    "old timer cannot undo resolution following newer input",
    "first late-admitted reply creates review without erasing past resolution",
    "duplicate and unadmitted mail cannot reopen",
    "past/equal reminder and reminder on resolved need explicit correction",
    "waiting-side change preserves follow-up and records current side at wake",
    "explicit Open clears a deferral even when work was already Open"
  ],
  "limitations": "Assertions encode an in-memory sequential abstraction. They do not prove SQL atomicity, actual concurrent locks, RLS, provider mapping, accessible UI, real timezones or durable worker recovery. Snooze-command replay is not modeled. Authorization/admission are supplied booleans. review_required is an unresolved classification outcome, not a fifth work status."
}
```

```python
"""Proposed D3 logical transitions. No Core imports, database, env or network.
This tests examples of the proposed contract, not production correctness.
"""
from dataclasses import dataclass, field
from copy import deepcopy
from pathlib import Path
import json

STATES = {'open','waiting_requester','waiting_our_side','resolved'}

@dataclass
class Conversation:
    tenant: str = 't1'
    state: str = 'open'
    revision: int = 0
    generation: int = 0
    reminder: dict | None = None
    resolutions: list = field(default_factory=list)
    events: list = field(default_factory=list)
    applied: set = field(default_factory=set)
    commands: dict = field(default_factory=dict)
    draft_audience: tuple = ('sarah@example.invalid','james@example.invalid')

def side(actionable, requester_blocked, our_side_blocked):
    if actionable: return 'open'
    if our_side_blocked: return 'waiting_our_side'
    if requester_blocked: return 'waiting_requester'
    return 'review_required'  # Never infer resolution from absence of a blocker.

def command(c, key, expected, target, tenant='t1', allowed=True):
    if not allowed or tenant != c.tenant: return 'denied'
    payload = (expected,target)
    if key in c.commands:
        return 'replayed' if c.commands[key] == payload else 'identity_conflict'
    if expected != c.revision: return 'stale'
    if target not in STATES: return 'invalid'
    c.commands[key] = payload
    if c.state == target and not (target == 'open' and c.reminder is not None): return 'unchanged'
    before = c.state
    c.state, c.revision = target, c.revision+1
    # A waiting-side-only change preserves its promised follow-up.
    # Explicit Open and Resolve cancel the deferral, even Open -> Open.
    if target in ('open','resolved'):
        c.generation += 1
        c.reminder = None
    if target == 'resolved': c.resolutions.append({'at_revision':c.revision})
    c.events.append({'kind':'work_changed','before':before,'after':target,'revision':c.revision})
    return 'changed'

def snooze(c, due, now, expected):
    if expected != c.revision: return 'stale'
    if due <= now or c.state == 'resolved': return 'invalid'
    c.generation += 1
    c.revision += 1
    c.reminder = {'generation':c.generation,'due':due,'previous_wait':c.state}
    c.events.append({'kind':'reminder_set','generation':c.generation})
    return 'scheduled'

def fire(c, generation, now):
    r=c.reminder
    if r is None or r['generation'] != generation or c.state == 'resolved': return 'obsolete'
    if now < r['due']: return 'early'
    before=c.state
    c.state='open'; c.revision+=1; c.generation+=1; c.reminder=None
    c.events.append({'kind':'follow_up_due','before':before,'after':'open','generation':generation})
    return 'opened_for_followup'

def inbound(c, source_id, admitted=True, sender_timestamp=0):
    if not admitted: return 'not_admitted'
    if source_id in c.applied: return 'duplicate'
    c.applied.add(source_id)
    before=c.state
    c.state='open'; c.revision+=1; c.generation+=1; c.reminder=None
    c.events.append({'kind':'new_admitted_reply','before':before,'after':'open','source':source_id})
    # sender_timestamp deliberately does not veto first-time server admission.
    return 'opened_for_review'

checks=[]
def check(name, fn):
    fn(); checks.append(name)

def check_wait_priority():
    assert side(True,True,True)=='open'
    assert side(False,True,True)=='waiting_our_side'
    assert side(False,True,False)=='waiting_requester'
    assert side(False,False,False)=='review_required'
check('primary wait rules and no inferred resolution',check_wait_priority)

def check_status_only():
    c=Conversation(); original=c.draft_audience
    assert command(c,'s1',0,'waiting_our_side')=='changed'
    assert c.draft_audience==original
check('work status does not readdress a draft',check_status_only)

def check_atomic_race():
    c=Conversation(); old=c.revision
    inbound(c,'in1')
    assert command(c,'resolve1',old,'resolved')=='stale' and c.state=='open'
    c=Conversation(); command(c,'resolve1',0,'resolved'); inbound(c,'in1')
    assert c.state=='open' and len(c.resolutions)==1
check('both orderings of resolve versus new reply preserve review work',check_atomic_race)

def check_repeat_resolve():
    c=Conversation(); command(c,'r1',0,'resolved'); old=deepcopy(c.resolutions)
    assert command(c,'r1',0,'resolved')=='replayed'
    assert command(c,'r2',c.revision,'resolved')=='unchanged'
    assert c.resolutions==old
check('repeat resolution and same-identity retry do not fabricate a cycle',check_repeat_resolve)

def check_conflict():
    c=Conversation(); command(c,'c1',0,'waiting_requester')
    assert command(c,'c1',0,'resolved')=='identity_conflict'
check('changed command payload cannot reuse identity',check_conflict)

def check_auth():
    c=Conversation(); old=deepcopy(c)
    assert command(c,'x',0,'resolved',tenant='t2')=='denied'
    assert command(c,'y',0,'resolved',allowed=False)=='denied'
    assert c==old
check('abstract tenant/permission denial leaves state unchanged',check_auth)

def check_timer():
    c=Conversation(state='waiting_requester'); assert snooze(c,100,10,0)=='scheduled'
    g=c.generation; assert c.state=='waiting_requester'
    assert fire(c,g,99)=='early'
    assert fire(c,g,100)=='opened_for_followup' and c.state=='open'
    assert c.events[-1]['before']=='waiting_requester'
    count=len(c.events); assert fire(c,g,101)=='obsolete' and len(c.events)==count
check('timer preserves wait on creation and opens once at exact due boundary',check_timer)

def check_reschedule():
    c=Conversation(state='waiting_our_side'); snooze(c,100,0,0); g=c.generation
    snooze(c,200,10,c.revision)
    assert fire(c,g,300)=='obsolete' and c.state=='waiting_our_side'
check('superseded timer cannot fire after reschedule',check_reschedule)

def check_resolved_timer():
    c=Conversation(state='waiting_requester'); snooze(c,100,0,0); g=c.generation
    command(c,'r',c.revision,'resolved')
    assert fire(c,g,100)=='obsolete' and c.state=='resolved'
check('resolution cancels old timer atomically in the model',check_resolved_timer)

def check_inbound_timer():
    c=Conversation(state='waiting_requester'); snooze(c,100,0,0); g=c.generation
    inbound(c,'in1'); command(c,'r',c.revision,'resolved')
    assert fire(c,g,100)=='obsolete' and c.state=='resolved'
check('old timer cannot undo resolution following newer input',check_inbound_timer)

def check_late_reply():
    c=Conversation(); command(c,'r',0,'resolved')
    assert inbound(c,'late',sender_timestamp=-100)=='opened_for_review'
    assert c.state=='open' and len(c.resolutions)==1
check('first late-admitted reply creates review without erasing past resolution',check_late_reply)

def check_duplicate():
    c=Conversation(); inbound(c,'one'); command(c,'r',c.revision,'resolved'); old=deepcopy(c)
    assert inbound(c,'one')=='duplicate' and c==old
    assert inbound(c,'untrusted',admitted=False)=='not_admitted' and c==old
check('duplicate and unadmitted mail cannot reopen',check_duplicate)

def check_invalid():
    c=Conversation(); assert snooze(c,0,0,0)=='invalid'
    command(c,'r',0,'resolved'); assert snooze(c,100,0,c.revision)=='invalid'
check('past/equal reminder and reminder on resolved need explicit correction',check_invalid)

def check_wait_change():
    c=Conversation(state='waiting_requester'); snooze(c,100,0,0); reminder=deepcopy(c.reminder)
    command(c,'w',c.revision,'waiting_our_side')
    assert c.reminder==reminder
    assert fire(c,reminder['generation'],100)=='opened_for_followup'
    assert c.events[-1]['before']=='waiting_our_side'
check('waiting-side change preserves follow-up and records current side at wake',check_wait_change)

def check_open_clear():
    c=Conversation(); snooze(c,100,0,0); generation=c.generation
    assert command(c,'wake',c.revision,'open')=='changed'
    assert c.reminder is None and fire(c,generation,100)=='obsolete'
check('explicit Open clears a deferral even when work was already Open',check_open_clear)

result={'kind':'proposed logical design only','checks_passed':len(checks),'checks':checks,
        'limitations':'Assertions encode an in-memory sequential abstraction. They do not prove SQL atomicity, actual concurrent locks, RLS, provider mapping, accessible UI, real timezones or durable worker recovery. Snooze-command replay is not modeled. Authorization/admission are supplied booleans. review_required is an unresolved classification outcome, not a fifth work status.'}
Path(__file__).with_name('d3-lifecycle-model-result.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))

```

## Final synthesis verification

Independent final checks found the corrected lifecycle, database and UX clauses
materially consistent. The final blueprint also shows actual To/Cc addresses as
D2 requires and distinguishes scheduled reminder due time from processing time.
The main review incorporates all identified corrections rather than leaving them
only in an appendix.

Structural verification passed: 23 categories, 15 exact D3-R clauses, 16 acceptance
groups, 15 named logical-model scenarios and 19 local document links. D1/D2 output
and canonical snapshots remain unchanged by this D3 recording. D3 review, blueprint,
evidence and historical Q3 output snapshots match their canonical files. Formatting
and git whitespace checks passed for the local grooming changes. These checks do
not establish implemented UI, authorization, database, provider or worker behavior.
