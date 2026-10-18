# D19 — First support for the ministry/project

Review date: October 16, 2026 (Asia/Bangkok). Repository baseline:
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`, branch `work`.

**Disposition: Accept with required amendments; subsequently ratified.** The
founder has now explicitly ratified the corrected decision and required amendments,
as recorded below. This is a research/decision record, not an implemented
producer, formal owner amendment, OpenSpec change, ticket or release qualification.

The product choice is sound: Grace's existing support elsewhere in the
organization should not suppress eligible personal follow-up for her first
qualifying support of Maya's ministry. The permanent solution is one ordinary,
explainable follow-up task, backed by qualified source facts and the existing
shared task contract. It needs neither a second CRM nor a special thank-you app.

## Exact corrected decision to record

> **A — First support for the ministry/project.** Create an eligible native
> personal-follow-up task for the beginning of a supporter's qualifying recorded
> monetary support of the exact ministry/project, even when that supporter gives
> elsewhere in the organization. “First” is established by the financial and
> recognition owners from complete qualified recorded history for the canonical
> supporter and stable ministry/project, not by the missionary's visible list,
> a new recurring plan, a new worker or a new designation label.
>
> Use the existing **Independent follow-up task** contract for this human
> deliverable. Show the ministry and a clear reason, offer only currently
> permitted contact actions, and let the responsible missionary manage and
> finish the task simply. Task completion records completion of the task; an
> actual interaction, provider sending outcome, financial fact and receipt each
> retain their own authority. No notes or shared relationship reporting are
> mandatory merely to clear the task.
>
> One intended first-support obligation has one durable purpose identity across
> retries, financial corrections, identity reconciliation, reassignment and
> future workflow activation. Native and optional automation cannot duplicate
> the same work. Distinct qualified purposes remain distinct. History-only
> imports establish the baseline and do not generate a retrospective task flood.
>
> Current tenant, subject, responsibility, privacy and contactability rules apply
> at admission, display and action. The task creates no new access, consent,
> cultivation enrollment, coaching visibility or automatic donor message. It
> does not expose Grace's other giving. Anonymous or otherwise ineligible
> recipient paths do not become named contact tasks through this feature.
>
> Missing history or disputed source attribution must not be presented as
> verified first support. Corrections remove invalid unhandled work from the
> actionable queue without erasing actual task history or recorded interactions.
> A previously completed first-support obligation is not created again because
> the underlying source is replayed or corrected. Source repair and subsequent
> live qualification preserve the original provenance and existing task lifecycle.

## Evidence, certainty and governing decisions

The [original Q19 frontier](phase28-q19-first-support-follow-up-research.md)
preserves the choice. Six independent workstreams examined source truth, owner
contracts, actual code, UX comparisons, event/history counterexamples and database
mechanics. Their findings are reconciled here, rather than all adopted verbatim.

| Evidence                                                                     | What it establishes and its limit                                                                                                                                                  |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Financial truth](d19-evidence/first-support-financial-truth.md)             | P13/P14/P16 qualification, P9 subject identity, historical coverage, recognition, split allocations and corrections. Owner requirements are not proof that a producer is deployed. |
| [Owner boundaries](d19-evidence/owner-boundaries.md)                         | Existing independent versus source-controlled task contracts, P27 coordination and P6/P17/P35 boundaries. No new task closure engine is justified.                                 |
| [Current code and UX](d19-evidence/current-source-and-ux.md)                 | Bounded static read of actual portal, task writers, migrations and display limits. It does not establish hosted schema or production behavior.                                     |
| [Stewardship UX research](d19-evidence/stewardship-ux-research.md)           | Primary product documentation and accessibility guidance, publication/access dates and limitations. No authenticated competitor trial or missionary interview was performed.       |
| [History counterexamples](d19-evidence/event-and-history-counterexamples.md) | Explicit examples that disprove viewport minima, transport dedupe and arrival order as sufficient first-support authority. Synthetic tests do not certify financial policy.        |
| [Database/lifecycle review](d19-evidence/database-lifecycle.md)              | Primary PostgreSQL/Supabase references, coarse RLS/current-command boundary and isolated mechanics. It does not qualify actual Core or hosted Supabase.                            |

**Repository facts.** The [founder brief](phase28-founder-brief.md:165) already
requires native qualified gift follow-up. [P28 owner constraints](../../../prds/program-roadmap/owner-constraints.md:74)
assign task purpose to P28 while money, recognition, communication and shared tasks
retain their owners. [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
explicitly allows an Independent follow-up task whose human deliverable can finish
while its linked source remains open. Source-controlled correction work is a
different contract; the task type cannot be a tenant-configurable closure switch.

The [CRM OpenSpec](../../../../openspec/specs/crm-core/spec.md:185) keeps CRM
truth in Asym Postgres; [workflow OpenSpec](../../../../openspec/specs/workflow-orchestration/spec.md:13)
keeps execution separate from product truth. P12's sole resolver and qualified
commands remain the fine authorization boundary, with coarse tenant RLS as the
database backstop. A new SQL-only second permission engine would conflict with
that decision even if marketed as a generic Supabase best practice.

**Current behavior.** The portal has manual `thank_you` tasks, generic task
completion and a donation snapshot capped at 250 rows. Its historical donor-level
minimum is not the required ministry-specific, settlement-qualified history.
The mounted TaskDialog still contains direct browser writes while a later
migration revokes browser task-table access. This is a source/migration conflict
to retire, not proof of an exploitable deployed endpoint. The current Mission
Control task adapter is Finance Operations work; its separate insert/link/event
requests do not establish the proposed first-support transaction. No qualified
end-to-end native first-support producer was demonstrated by this bounded review.

**External evidence.** TntConnect and MPDX document support-team follow-up;
Bloomerang distinguishes task completion, interaction recording and archiving.
These support clear task semantics, not Asym's first-support algorithm. Virtuous
documents thank-you language in receipts, so a receipt must not be described as
incapable of thanking a donor. It still does not prove Maya performed a separate
personal follow-up. DonorElf's old indexed article returned 404 and is weak
historical context only. No vendor is a new dependency.

**Product judgments.** Ministry-specific first support is more relevant to this
selected job than organization-wide first support. A quiet existing task queue,
plain reason, few actions and voluntary interaction detail are the recommended
experience. No retention lift, giving increase, user preference percentage or
production throughput is claimed.

**Unproven before release.** Actual owner-projection availability, imported-history
certification, full merge/unmerge reconciliation, hosted authorization, complete
journey usability, accessibility and production load require the proofs below.
Those are explicit release gates with owners, not reasons to invent a financial
shortcut or to describe the decision as already implemented.

## The missionary journey

The everyday experience uses the existing task list and one detail surface.
Do not ask Maya to configure the first-support algorithm or resolve finance
history to do ordinary relationship work.

| Moment               | Intended presentation and behavior                                                                                                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Discover             | A normal My tasks row: **Follow up with Grace**. Secondary line: **First qualifying gift to Maya's ministry**. Show the exact ministry/project name, responsible person and any actual due date. Do not label Grace a new organizational donor or disclose other ministries.                                               |
| Understand           | The detail explains: “Created because Grace's first qualifying recorded gift to this ministry is ready for follow-up.” A small “Why this task?” section shows authorized source date and amount/currency when useful. No ledger jargon or mandatory full gift drilldown.                                                   |
| Act                  | Offer the available permitted actions, such as Call or Write email, with the correct contact method. D15 connected sending is an optional route. Starting a call, opening an email app or reading a notification changes no completion or interaction fact.                                                                |
| Finish               | **Mark done** records “Task completed.” Optional **Record interaction** lets Maya deliberately record what actually happened through P9, showing its actual audience before saving eligible new context. No required note, rating, coaching report or “thank-you sent” claim. Task completion alone shares no interaction. |
| Correct a mistake    | **Undo** corrects the latest personal Done or Not needed disposition only while it is safely reversible under the current task state. It appends a correction on the same task; it never recalls an email, reverses a gift or deletes an interaction.                                                                      |
| Defer                | **Change date** uses the existing task date/reminder model; a chosen date is not a forecast of donor behavior. A missing date is “No date,” not overdue. No automatic two-day pledge or donor-value ranking is introduced.                                                                                                 |
| Not required         | A deliberate **Not needed** disposition can end this follow-up without manufacturing an interaction; an optional reason may be recorded under the ordinary permitted task context. It must not delete the source or task history.                                                                                          |
| Wrong responsibility | **This needs someone else**, where the source responsibility contract permits it, routes through authorized responsibility resolution. It grants no access and does not silently choose any administrator. The prior and new assignee do not retain competing active copies.                                               |
| Source changed       | Unhandled work that is no longer qualified leaves the actionable list with a truthful, authorized history explanation. Actual past interaction remains. A stale open screen cannot complete or send against authority it has lost.                                                                                         |
| Interrupted          | Pending/failed/unknown responses remain distinct. Recover the existing command result before resubmitting; keep safe unsaved input while the session remains authorized. Never promise an offline send or task completion.                                                                                                 |

Use the shared Maia/Base UI primitives and current design tokens. Primary action,
reason and ministry should have clear visual hierarchy without a dashboard of
badges. Mobile uses the same labels and a narrow single-column detail view;
essential facts do not depend on hover, color, a map or animation.
An empty queue says “No follow-up tasks to show,” never “All supporters thanked”
or “No first gifts.” A missing email or one blocked channel does not establish
global contact ineligibility: show only independently permitted useful methods.
Preserve international names verbatim, support locale-aware amounts and dates, and make
the task timezone explicit when a time is selected. Names are not forced into a
Western first/last-name assumption.

Keyboard operation, visible unobscured focus, readable contrast, 200% text zoom,
320 CSS-pixel reflow, reduced motion and announced status/error feedback are
acceptance requirements. Meet WCAG 2.2 AA target-size requirements (24 by 24 CSS
pixels or its defined spacing/other exceptions); prefer 44-pixel touch controls
where the layout allows. Forty-four is a design target, not a false statement of
the AA minimum. A persistent status must supplement any brief success toast.
The [W3C current guidance](https://www.w3.org/WAI/WCAG22/Understanding/), checked
October 16, 2026, supports these criteria; a mockup alone cannot prove them.

## Exact requirements, subsequently ratified

These clauses are the complete bounded amendment. They specify outcomes and
owner boundaries; they do not freeze physical table names, a queue vendor or a
second authorization framework.

**C01 — Scope and language.** P28 SHALL define this native purpose as personal
follow-up for first qualifying recorded monetary support of an exact ministry
subject. Support elsewhere in the tenant SHALL NOT disqualify it. Public and
missionary copy SHALL NOT assert “new donor to the organization” or “first-ever
support of any kind.” Manual follow-up remains available under its own authority.

**C02 — Stable subject.** The subject SHALL be an owner-qualified P9 Ministry
Assignment or Ministry Project, with its exact Tenant and Legal Entity. Worker,
spouse, login, display label, year, currency, public Page and designation code
SHALL NOT create a new first-support identity. Multiple designations mapping to
one subject share its history; unrelated subjects do not collapse by name.

**C03 — Qualified support evidence.** P13/P14 SHALL certify the positive,
subject-attributed monetary support fact and its current state under the actual
tender/settlement policy. A pledge, attempt, failed payment, unqualified pending
ACH, valuation, zero or negative correction SHALL NOT independently trigger it.
The default missionary-support projection remains settled-only where P13 so
requires. D19 SHALL NOT introduce an amount threshold, FX sum or balance formula.

**C04 — Complete recorded history.** First-support proof SHALL include the
source-certified history coverage, canonical supporter, subject, effective
history and coherent current financial, recognition, attribution and identity
revisions. A capped list, 365/730-day roster, empty
result, current missionary visibility or incomplete import SHALL NOT prove first.
Equal-time evidence SHALL produce one first-support purpose without inventing an
ordering from ingestion time. Unknown coverage SHALL hold automatic admission and
remain visible to the independently authorized source operations owner.

**C05 — Recognition and recipient distinction.** Legal donor, qualifying
supporter recognition and permissible recipient SHALL be separately qualified.
Only a P14-certified supporter path may establish recognized support; solicitor,
organization-contact, tribute and household membership alone SHALL NOT do so.
Header recognition on a split gift SHALL NOT be copied or proportionally allocated
to a ministry by P28. The exact subject-attributed projection must exist.
Member-attributed remittance credits SHALL NOT supply member contact authority;
the church's own qualified contribution and a member's independently qualified
direct support remain separate. Prior source-qualified support across admitted
paths remains part of first-support history even when that path could not
authorize contact; later direct support does not reset firstness. No spouse/
household fan-out or mediated thanks is implied.

**C06 — Current admission and responsibility.** A concrete first-support human
deliverable SHALL be admitted only with qualified source evidence and current
responsibility, visibility and purpose eligibility. A support assignment,
membership or gift alone grants no contact rights. One accountable authorized
assignee is shown for the ordinary journey; additional permitted collaborators
do not get independent duplicate obligations. Indeterminate or ownerless work
releases no guessed recipient and remains recoverable by authorized source staff.

**C07 — Existing independent task contract.** D19 SHALL use the closed,
code-owned Independent follow-up task profile in the shared task system.
Completing it SHALL NOT clear a financial exception, alter a gift, complete a
different source obligation or fabricate an interaction. It SHALL NOT be modeled
as a second source-controlled review ledger merely because a gift triggered it.
Tenant configuration SHALL NOT change its completion-authority class.

**C08 — Durable purpose coverage.** Source-certified canonical supporter ×
typed ministry subject × first-support purpose, within the exact tenant/entity
scope, SHALL retain durable semantic coverage. Qualifying source event IDs and
earliest supporting gift evidence are lineage, not the complete dedupe key.
Retries, simultaneous gifts, optional workflows and responsibility changes SHALL
yield at most one active obligation for this purpose. Human-handled coverage
SHALL prevent automatic repeat first-support work. Distinct intended purposes
SHALL retain their own identity and completion evidence.

**C09 — Source admission and materialization.** The authoritative admission
commit SHALL atomically retain its purpose claim and identifier-only projection
intent/receipt. Task materialization MAY be asynchronous through the existing
product-owned dispatch/reconciliation contracts; no cross-service transaction
is presumed. Durable reconciliation SHALL repair a committed intent with no
task. Provider or worker job IDs SHALL NOT own product idempotency.

**C10 — Activation and imported history.** Historical import/backfill/redesignation
repair SHALL establish history without retrospective personal-follow-up tasks.
An originally live, unconsumed occurrence may qualify after owner repair, and a
late-delivered live event SHALL NOT be discarded merely because delivery was late.
The source SHALL preserve activation cohort, import/live provenance and current
eligibility; processing timestamp or caller event labels cannot establish them.
Activation SHALL establish the complete baseline for the affected producer and
population before enabling its live admission. One unresolved history slice
SHALL NOT block independent qualified subjects.

**C11 — Corrections and terminal history.** Source invalidation SHALL remove
only the solely source-generated first-support requirement from actionability
without recording a human completion. A separately deliberately accepted call,
promise or other qualified undertaking SHALL remain actionable through its existing
owner, on the same shared task where that contract permits; do not duplicate a
chore merely to preserve it. If this task supplied P27's next-action requirement,
reconcile that requirement to another valid task or an owned actionable exception.
Opening, claiming, commenting or changing a reminder alone SHALL NOT establish
an independent undertaking. Actual
past task/interaction history remains and gains the permitted correction context.
An unresolved held occurrence may qualify after repair on the same identity.
Correcting an erroneous source withdrawal MAY restore that same independent task
only through an explicit owner-qualified correction: original live admission is
proven, no human Done/Not needed disposition intervened, current source/recipient
eligibility passes, and a correction receipt is retained. Gift replay alone SHALL
NOT reopen work. This repair is not source-controlled recurrence; do not invent a
successor engine. An invalid, unhandled admission SHALL NOT permanently consume
first-support coverage: if owner correction proves the supposed earlier support
never belonged to this subject/person, a later genuinely live, source-certified
first support MAY re-admit the same purpose/task identity through a qualified
command, preserving invalidation history. No human handling, independent
undertaking or genuine prior qualifying support may contradict that proof.
Genuine prior support followed by a refund SHALL NOT restart a welcome purpose.
Historical repair alone never produces catch-up work. Refunds, reallocation and
returns remain owner facts; separately qualified other follow-up remains possible.

**C12 — Identity reconciliation.** P4-approved canonical identity reconciliation
SHALL reconcile first-support coverage, source aliases and active task projection
before releasing new work. A match suggestion SHALL NOT merge people. If both
identities already have actual completed interactions, preserve both histories
without creating a third first-support task. Collision/unmerge repair SHALL use
the owner contract and current authorization, not unsafe task-row relabeling.

**C13 — Honest personal completion.** Mark done SHALL record task completion only.
Not needed SHALL be a distinct deliberate task disposition, not deletion or a
thank-you claim. Record interaction SHALL be optional and use P9's actual outcome
contract. Opening/dialing, provider acceptance, delivery, receipt generation,
notification read and human reply SHALL remain distinct facts. No notes, contact
attempt, message send or coaching report SHALL be required solely to clear work.
Record interaction SHALL show its actual audience before save and admit only
eligible new context under P27's voluntary shared-context contract.
Conditional Undo of a mistaken personal Done or Not needed disposition SHALL
check current authority, the expected latest human disposition and absence of
conflicting source/task changes,
then append a correction on the same identity. It SHALL NOT erase history or undo
a financial fact, actual interaction or communication. Recording an actual
interaction and explicitly finishing this task MAY be one user action where the
existing owner commands can preserve both distinct truthful effects and recovery.

**C14 — No implied outreach or access.** Task creation SHALL send no donor message,
subscribe nobody, enroll no cultivation relationship and create no coach/CRM/
financial access. Anonymous, prohibited or contact-ineligible recognition paths
SHALL NOT produce actionable named-contact work. Existing safe financial awareness
may remain under its own authority. A permanently disabled Contact button is not
the substitute for correct eligibility. Every offered contact action SHALL pass
applicable current purpose/channel restrictions, including Never Ask where its
owning policy applies. D15/P6 sender and recipient checks remain mandatory for
Asym-mediated sends. Opening an external email or phone application does not
promise enforcement or outcome knowledge outside Asym.

**C15 — Clear shared presentation.** My tasks, missionary detail and any staff
projection SHALL use the same task identity, subject, current responsibility and
truthful status. Show a plain first-support reason, exact ministry and only
authorized source facts. Other organizational giving SHALL NOT be disclosed to
justify the rule. Task comments, list titles, search, counts, exports, notification
previews and analytics SHALL not copy protected source payloads by default.

**C16 — Simple dates and attention.** Reuse shared task date/reminder and P17/ADR-0027
attention behavior. No new arbitrary urgency deadline, all-staff alert, escalation
ladder or automatic donor-value ranking is introduced. Date changes SHALL NOT
change first-support history. No due date SHALL display as No date, not overdue.
Notifications and task engagement SHALL NOT count as outreach or completion.

**C17 — Command and database safety.** All writes SHALL pass current qualified
commands with trusted tenant/actor derivation and source-bound subject, owner,
purpose and audit attribution. Caller input SHALL NOT relabel these fields.
Tenant-composite foreign keys, appropriate uniqueness, state/check constraints,
non-null identifiers and explicit safe delete rules SHALL protect the effects.
Browser base-table writes remain revoked; coarse tenant RLS and both effective
USING/WITH CHECK behavior SHALL be tested. Views, RPCs, functions, storage,
service-role workers and every alternate writer SHALL preserve the same boundary.

**C18 — Current authority and stale commands.** P12 SHALL authorize list/count/
detail/action against current source and permission state. An authorized update
cannot transform an allowed task into a foreign-tenant, foreign-subject, forged-
owner or different-purpose task. Expected-head commands SHALL reject conflicting
source/responsibility changes with a safe refresh path. Shared-task assignment
never grants source visibility. Cache keys and invalidation SHALL retain tenant,
actor/purpose and relevant authorization version; stale display is not permission.

**C19 — Recovery without false success.** Lost responses SHALL recover the durable
effect/command receipt. Repeated valid completion SHALL not duplicate history;
competing completion and correction SHALL have an explicit serialized result.
Failures before commit SHALL show no committed effect; secondary projection
failure after commit SHALL be recoverable without repeating source admission.
An access-loss response SHALL remove protected content rather than preserve it
in a stale error panel. No network timeout is evidence of a sent thank-you.

**C20 — Audit and minimization.** Preserve source qualification reference/revision,
purpose coverage, actual task commands and responsible actor attribution under
the relevant owner's retention policy. Security logs and worker traces SHALL be
separate from business task/interaction history and contain no unnecessary donor
amounts, contact details or message bodies. Deletion/anonymization SHALL preserve
only the lawful minimal dedupe evidence required to avoid unintended replay;
retention/restore SHALL not resurrect source eligibility or recipient access.

**C21 — Accessible, resilient journey.** The journey SHALL meet the keyboard,
focus, reflow, contrast, status, international-name, locale/timezone and mobile
requirements above using existing shared components. Slow/interrupted operation
SHALL expose clear status and recoverable saved results. Do not require every
task to open the financial ledger or a separate reporting form. Actual users must
understand task completion versus recorded contact without reading documentation.

**C22 — Bounded execution.** Use indexed incremental source qualification and
keyset-paginated permitted task reads, not per-card lifetime-history scans.
Workers SHALL use bounded batches, fair tenant scheduling and current claims;
no web request loads all gifts. Quantitative load and latency limits SHALL be
recorded and tested with the release cohort before activation; synthetic small
fixtures SHALL NOT be called production scalability evidence.

**C23 — Safe rollout.** Ship additive owner contracts and constrained storage,
qualify baseline and alternate writers, then enable materialization for the exact
cohort. Existing generic/manual thank-you tasks SHALL NOT silently become proof
of first support or actual contact; reviewed migration distinguishes manual,
legacy-generated and qualified-native provenance. A kill switch pauses new
admission/materialization while preserving source truth, existing tasks and
recovery. Rollback SHALL never delete accepted history or re-enable unsafe writers.

**C24 — Traceability and proof.** At the authorized formalization transition,
trace this answer through the glossary, P28 purpose, P9 task profile, P13/P14
source projection, P12 authority, affected ADR/OpenSpec requirements, design,
implementation tasks, tests and release evidence. Release SHALL satisfy P01–P30
below. Optional AI, workflows, email connections, calendar and newsletter features
SHALL NOT be prerequisites for native task discovery and ordinary completion.

## Material concerns and permanent resolution

Severity describes the consequence before the amendment. Likelihood is a reasoned
engineering assessment, not a measured incidence rate. Each row identifies what
fails, why it matters, supporting evidence, the effect on A and its exact remedy.
The referenced C clauses above are the ratified requirement language, not shorthand
that a later implementer must reconstruct.

| Concern                                          | Failure and consequence                                                                                                                                                                                           | Severity / likelihood                                                  | Evidence                                                                                                  | Effect on A; permanent fix and exact text                                                                                                                                                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 Scope and identity                           | Organization-first omits the selected ministry moment; worker/designation/year-first repeatedly calls the same supporter new. This produces missed or embarrassing duplicate follow-up.                           | High / likely if “first gift” is left undefined                        | Q19; P9 stable Tenant/Legal Entity subjects; P16 new-arrangement initial payment; financial/history notes | Preserve A, narrow its meaning. Use the typed lasting ministry and canonical supporter, with honest recorded-monetary language. **C01–C03, C08**.                                                         |
| F02 Incomplete or premature history              | Capped/730-day views, pending ACH or imported rows look like first received support; arrival order chooses a false earliest gift. Staff lose confidence in tasks and may thank for failed support.                | High / likely with current snapshot reuse                              | Actual 250-row service; P14 time-bounded roster; P13 finality; 20 synthetic counterexamples               | Preserve A, require qualified owner evidence and history coverage, equal-time convergence and import/live provenance. Unknown is held, not zero. **C03–C04, C10**.                                        |
| F03 Wrong recognized person or allocation        | Household fan-out, solicitor credit or a header credit on a split gift becomes a person's ministry support or contact permission. A private person can be exposed or wrongly approached.                          | Critical for disclosure / plausible                                    | P14 roles, allocation projections, church-member exclusion; finance and governance notes                  | Narrow eligible source/recipient paths without excluding valid independently authorized direct support. Require exact recognition attribution and purpose qualification. **C05–C06, C14**.                |
| F04 Wrong task authority and mandatory reporting | A second P28 review ledger or generic source closure is built; Done pretends a call happened or forces a narrative. Tasks become misleading and cumbersome.                                                       | High / likely if gift-origin is equated with source-controlled closure | ADR-0183 independent-task exception; P27 voluntary history; Bloomerang/MPDX distinctions                  | Change implementation direction to the existing independent task profile. Keep completion, Not needed, actual interaction and source correction distinct; allow conditional Undo. **C07, C11, C13, C21**. |
| F05 Tenant/actor/responsibility escape           | Client-controlled scope/owner fields, broad worker service role or leaked counts cross tenant/source boundaries; assignment is mistaken for permission. Allowed updates can relocate work into a forbidden state. | Critical / plausible without complete command coverage                 | P12/P9; current direct browser writer versus revoking migration; ADR-0183 assignment grants no access     | Preserve A only with qualified commands, tenant-aware constraints, coarse RLS, alternate-path parity and current resolver checks. **C06, C17–C18**.                                                       |
| F06 Duplicate or rewritten lifecycle             | Two first gifts, redelivery, Party merge, reassignment, correction or workflow enablement duplicate work; refund deletes completed human history; a user mistake cannot be safely corrected.                      | High / likely without semantic coverage                                | Workflow OpenSpec; P35; P4; ADR/task distinctions; history counterexamples                                | Durable canonical purpose coverage, distinct source evidence, exact correction and conditional Undo, merge reconciliation. No automated replay of human-ended work. **C08, C10–C13, C19**.                |
| F07 Confusing or inaccessible daily UX           | “New donor” copy, dead contact buttons, mandatory forms, ambiguous dates or disappearing rows leave Maya unsure what happened. Small touch targets or hidden focus exclude users.                                 | High / likely unless actual journey tested                             | Fresh primary task documentation, W3C, source/UX review; no real-user evidence claimed                    | Keep the compact journey, truthful status, authorized actions, visible ministry/reason, optional logging and accessible recovery. **C13–C16, C19, C21**.                                                  |
| F08 Partial/ambiguous success                    | Source commit succeeds but task creation fails, completion response is lost, or email result is unknown. Naive retries lose work or produce duplicate tasks/messages.                                             | High / plausible during normal failures                                | ADR-0183 projection intent; workflow dispatch contract; D15; current multi-request task helper            | Same-transaction intent, recoverable asynchronous materialization, expected-head effect receipts and independent send truth. **C09, C18–C19**.                                                            |
| F09 Unbounded work                               | Each card scans lifetime gifts; big imports flood tasks; one tenant monopolizes workers. Latency and incomplete results produce poor UX and operational load.                                                     | High / plausible with growth; capacity unmeasured                      | Current caps are display limits, not scale proof; PG indexing/constraints; source projection contract     | Incremental source qualification, indexed identities, bounded workers/pages and no historical effects. Require production-shaped quantitative release proof. **C04, C10, C22**.                           |
| F10 Privacy beyond the row                       | Name/amount leaks through notification title, search/counts, logs, exports, cache or retained backup after access changes; copied financial bodies create shadow state.                                           | Critical / plausible                                                   | ADR-0183 minimized source references; P10/P12/P14; notification boundary                                  | Reauthorize every projection, minimize references and logs, preserve lawful minimal dedupe evidence, test retention/restore. **C14–C15, C18, C20**.                                                       |
| F11 Unsafe rollout and old writers               | Old generic tasks are mislabeled as source-qualified; mixed code bypasses new gates; rollback drops history and later replays it.                                                                                 | High / plausible given concrete current writer/grant conflict          | Source trace, migration order, legacy MIN backfill, workflow rollback requirement                         | Additive phased activation, reviewed provenance reconciliation, close alternate writers, preserve durable facts on pause/rollback. **C17, C23**.                                                          |
| F12 Unowned failures and misleading audit        | Missing responsibility/history silently hides eligible work; staff use SQL repair; technical logs are treated as proof Maya thanked someone.                                                                      | High / plausible if no owner/repair evidence                           | ADR-0183 proved-zero/indeterminate distinction; source/task receipts; actual source gaps                  | Authorized source repair with clear owner/reason, durable business history distinct from logs, observable intent recovery. **C04, C06, C09, C19–C20, C24**.                                               |
| F13 Hidden product/provider coupling             | Native work depends on optional workflow/email/AI, or Stripe is used as the direct first-support oracle. A vendor outage or extra receipt completes unrelated tasks.                                              | High / plausible if current plumbing reused without boundaries         | P28/P35, workflow OpenSpec, Stripe delivery ordering, P6/P17 and D15                                      | Native source admission plus shared task completion remain independent; send/outreach outcomes and distinct purposes retain owners. **C07–C09, C13–C14, C24**.                                            |
| F14 Unverifiable promises and trace drift        | A polished mockup or synthetic SQL fixture is reported as complete Supabase/UX qualification; owner/glossary/spec states disagree. The implementation follows an invented guarantee.                              | High / likely without explicit evidence labels                         | Bounded inspected source; existing tests failed before collection; no user/provider test; authority model | Separate fact, judgment and proof. Trace exact clauses and independently falsifiable cases at formalization; block release on missing gates. **C21–C24, P01–P30**.                                        |

## Every requested category

Each category was evaluated independently. Shared concerns are referenced rather
than inflating the solution with one mechanism per category.

| Category                                                        | Material concern?                        | Result and checked boundary                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 01 Problem validity, necessity, alternatives                    | **Yes — F01, F04**                       | This solves the selected ministry-specific stewardship job. Strongest alternative B reduces first-support tasks but misses Grace's new ministry relationship. Manual-only work fails the already-required native task outcome. Avoid freezing table names or inventing a new task ledger. C01/C07 resolve the level and scope. |
| 02 Brittleness                                                  | **Yes — F02, F06**                       | Viewport minima, timing order, changing labels and first recurring payment are fragile proxies. Qualified history, stable identity and original provenance replace them.                                                                                                                                                       |
| 03 Technical debt                                               | **Yes — F04, F05, F11**                  | Current dual task writers, finance-specific adapter reuse and duplicated source state would entrench inconsistent authorization and closure. Retire bypasses in the affected path and use shared owners.                                                                                                                       |
| 04 Edge cases                                                   | **Yes — F02, F03, F06, F07**             | Tested/reasoned cases cover equal-time gifts, multiple subjects/currencies, incomplete history, anonymous/recognized support, missing assignee, changed authority, returns, corrected first evidence and accidental completion.                                                                                                |
| 05 Footguns                                                     | **Yes — F03–F08**                        | One click must not share protected history, send email, invent contact or change money. Purpose-specific labels, current commands and conditional correction prevent easy harmful mistakes.                                                                                                                                    |
| 06 Tenant safety                                                | **Yes — F05, F10**                       | Tenant/entity/typed-subject scope must cover relationships, claims, recipients, counts, jobs, caches and reports. A correct detail-page check alone is insufficient.                                                                                                                                                           |
| 07 Database, RLS and authorization safety                       | **Yes — F05, F06, F08**                  | Checked key/cardinality/nullability/default/state/delete/grant/RLS/view/function/RPC/service-role concerns. C17–C19 require effective USING/WITH CHECK and immutable attribution. No new money column or floating-point arithmetic belongs in this task model.                                                                 |
| 08 Overengineering                                              | **Yes — F04, F13**                       | A parallel review ledger, workflow builder, settings for “first,” successor engine or notification escalation system is unnecessary. Existing independent tasks plus source qualification and durable coverage suffice.                                                                                                        |
| 09 UX/UI and user friction                                      | **Yes — F07**                            | Whole journey reviewed from quiet discovery to action, defer, finish, correction and recovery; primary CRM examples and current accessibility guidance used. Real comprehension and mobile/AT proof remain release gates.                                                                                                      |
| 10 Source of truth, ownership and invariants                    | **Yes — F01–F06, F08**                   | Finance/recognition own support and coverage; P28 defines purpose; P9 shared tasks own personal work; P4 identity, P12 authority and P6/P17 communications retain their facts. Task snapshots are not money/consent truth.                                                                                                     |
| 11 Hidden coupling                                              | **Yes — F04, F13**                       | Gift-origin must not force source-controlled task closure; task completion must not mutate gifts or enroll cultivation; optional integrations cannot own native work.                                                                                                                                                          |
| 12 Failure modes                                                | **Yes — F08, F12**                       | Before-commit, after-commit, materialization, lost response, unavailable source and provider ambiguity have distinct safe recovery paths and owners.                                                                                                                                                                           |
| 13 Lifecycle, temporal correctness, concurrency and idempotency | **Yes — F02, F06, F08**                  | Stable purpose, current source revisions, live/import provenance, independent task outcomes and exact repair/Undo constrain races. No inferred success or automatic revival of human-ended work.                                                                                                                               |
| 14 Data integrity risks                                         | **Yes — F02, F03, F06**                  | Canonical identity, attribution, complete history, split allocations and durable effects avoid duplicate people/tasks, wrong first dates and historical drift.                                                                                                                                                                 |
| 15 Security and privacy risks                                   | **Yes — F03, F05, F10**                  | Contactability, anonymity, restricted ministry context and every derivative/export/log/restore path remain protected. No external contact or new data access follows from this choice.                                                                                                                                         |
| 16 Scalability and performance risks                            | **Yes — F09**                            | No all-history scans per page, offset-driven partial proof or unbounded catch-up. Volume/latency qualification is explicit; current 250/730 limits are not asserted capacity.                                                                                                                                                  |
| 17 Operational burden                                           | **Yes — F11, F12**                       | Missing history/responsibility and stalled intents need ordinary authorized repair and exact outcome evidence, not recurring direct-database cleanup.                                                                                                                                                                          |
| 18 Observability and auditability gaps                          | **Yes — F08, F10, F12**                  | Task history, actual interaction, security attribution and transport logs are different. Source intent/task mismatch and invalid duplicate coverage need observable evidence.                                                                                                                                                  |
| 19 Dependency and integration risks                             | **Yes — F13**                            | Providers can duplicate, delay or reorder events. Owners reconcile money first; native tasks survive optional vendor unavailability and workflow changes. No dependency is added.                                                                                                                                              |
| 20 Migration, rollout and upgrade risks                         | **Yes — F11**                            | Historical baseline, old manual/generated provenance, mixed writers, feature activation and rollback after writes need C23's sequence and P26–P27.                                                                                                                                                                             |
| 21 Testability, traceability and proof                          | **Yes — F14**                            | Exact C/P IDs, source links, falsifiable cases, bounded evidence and formalization destinations prevent “beautiful/secure/scalable” from remaining untestable adjectives.                                                                                                                                                      |
| 22 Other development hazards                                    | **No additional material concern found** | Checked unsafe defaults, numerical precision, deletion, stale documentation, dependency introduction, deployment control and difficult repair; the material risks are already explicitly covered by F01–F14/C01–C24. No extra speculative subsystem is warranted.                                                              |

## Lifecycle and ownership synthesis

This is a small set of meanings on existing owners, not a new configurable state
machine. The physical schema may project these meanings without storing duplicate
booleans or a second ledger.

| Meaning                                                 | What may happen next                                                                                                         | Forbidden inference                                                           |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Source proof unknown/incomplete                         | Owner repair establishes complete eligible or ineligible evidence; manual independent relationship work remains possible     | Unknown becomes zero, first, consent or discarded work                        |
| Source-qualified live first support, projection pending | Durable intent materializes the one admitted task; replay recovers it                                                        | A missing task row means the source transaction did not commit                |
| Open independent follow-up                              | Authorized action, date change, task-only Done, Not needed, explicit interaction or responsibility correction                | Open means nobody has ever contacted the person; assignment grants permission |
| Temporarily held                                        | Current proof/authority can be restored; unauthorized readers see no protected facts                                         | A timeout is proved withdrawal, or the user has completed the task            |
| No longer required after proved source invalidation     | Preserve history; correct erroneous withdrawal only under C11's original-live/no-human-terminal/current-authority conditions | Deletion, automatic fresh acquisition or a manufactured human completion      |
| Done / Not needed                                       | Remain covered across source replay and workflow activation; mistaken personal completion may be corrected under C13         | Completed task proves a call, donor reply or delivered email                  |
| Real interaction exists                                 | P9 retains actual interaction and permitted corrections regardless of task/source changes                                    | Task Undo deletes/repeats the interaction or recalls communication            |

One currency never silently absorbs another. One gift split over two independently
qualified ministry subjects may produce distinct personal obligations; the UI
labels both subjects and does not silently mark both done. If a single actual
action deliberately satisfies compatible work, its owner records the exact
covered tasks. The organizational receipt and Maya's personal work may coexist;
the same intended personal obligation cannot be recreated by staff automation.

Source ownership is explicit: P13 controls contributions, lines, monetary states
and financial corrections; P14 controls recognition and subject-filtered supporter
paths; P16 controls commitments and fulfillment; P9 controls typed ministry and
shared task/interaction contracts; P4 controls canonical identity reconciliation;
P28 defines this follow-up purpose and projection; P12 controls current field/
action permission; P6/P17 control actual message eligibility/content/dispatch;
ADR-0027 controls attention presentation. Neither the workflow runtime nor the
portal snapshot becomes a write authority for any of these facts.

## Independently testable acceptance evidence

All P cases are future Core release obligations unless separately identified as
executed bounded research below. Tests must assert user-visible/domain outcomes,
not merely that the implementation invoked its own helper.

**P01. Ministry scope:** Grace has prior qualified support of ministry B and her
first qualified support of A; exactly one eligible A task appears, with no B
history disclosed. A later gift to A creates no second first-support task.

**P02. Stable subject:** Worker/spouse/login/label/year/currency/designation changes
for the same typed subject preserve coverage. Two distinct Tenant/Legal Entity
subjects with the same label do not share it. Cross-entity continuity is not guessed.

**P03. Monetary qualification:** Pledge, failed attempt, zero/negative evidence and
return-exposed unqualified ACH produce no first-support task. The source-approved
settled/provisional treatment follows the owning financial profile, including
reversion; noncash valuations do not qualify as monetary support for this purpose.

**P04. History coverage:** A qualifying gift outside the 250-row viewport or
730-day roster prevents false first classification. Incomplete imported history
holds admission with an authorized actionable source reason; no unavailable value
is displayed as zero. Complete coverage can be independently reconciled.

**P05. Equal time and multiple arrivals:** Concurrent equal-effective-time gifts,
split lines and reordered events produce one intended task with retained source
lineage. Event ordering does not manufacture a precise first-gift chronology.

**P06. Recognition:** Direct, qualified disclosed DAF and other admitted supporter
paths use exact owner evidence. Solicitor/org-contact/tribute and household-only
paths cannot trigger personal support; split-header recognition without subject
attribution is blocked. No proportional allocation is invented.

**P07. Recipient distinction:** Church-member attribution alone, anonymous support
and prohibited contact expose no named task, preview, count or contact affordance.
An independently eligible direct-support path is not blanket-banned because that
person also has church history. No recognition source grants consent.

**P08. Responsibility:** One qualified owner sees one task; collaborators do not
get duplicate obligations. Missing/ambiguous assignment produces no fallback
admin alert with donor data. Authorized source staff can diagnose and repair it.

**P09. Current authority:** Test same-tenant wrong-subject, foreign-tenant,
foreign-entity, restricted ministry, revoked actor, expired authority and stale
task link against list/count/detail/search/export/action and notification paths.
All denied projections are body-safe and no task assignment creates rights.

**P10. Every write path:** Browser REST/table calls, RPC/view/function paths,
service-role jobs, workflow retries and permitted APIs cannot set or transform
tenant, subject, owner, purpose or attribution from caller input. Exercise
effective USING and WITH CHECK behavior, grants, constraints and privilege parity.

**P11. Durable effect race:** Two sessions claim the same source-qualified purpose;
one stable effect/task results. Changed immutable input under the same intent
conflicts. Retry after the transport dedupe window still creates no duplicate.

**P12. Atomicity and projection:** Inject failure before source commit, after
commit before enqueue, after materialization before acknowledgement and after
receipt before response. Replay converges on the same truth and truthful status.

**P13. Personal Done:** One explicit Mark done completes only the task, requires
no note and creates no call, send, reply, financial edit, consent or cultivation
enrollment. Repeated command/retry creates no duplicate completion evidence.

**P14. Actual interaction:** Optional Record interaction records only the actual
selected outcome under P9. Explicitly finishing with that action avoids duplicate
entry while retaining separate effect receipts. Dialer opening or provider
acceptance alone cannot become a personal exchange or completed donor response.

**P15. Conditional Undo:** Undo a mistaken Done or Not needed disposition on the same task under
current authority; preserve the original history. Competing source invalidation,
reassignment or subsequent outcome rejects stale Undo safely. No email, gift or
actual interaction is undone or resent.

**P16. Correction races:** Test return/refund/reallocation before task projection,
before and racing completion, and after actual interaction. Invalid unhandled
automatic work stops; independently promised work and P27's next-action/owned-
exception requirement survive where applicable; completed history remains;
replay does not create new first-support. A later gift after genuine prior support
and refund does not restart this first-support purpose.

**P17. Hold and erroneous withdrawal:** Temporary unknown is not terminal invalidity.
Qualified repair of original live unhandled work may restore that same task under
C11. Separately test an initially misattributed, unhandled admission correctly
withdrawn, followed by the subject's actual first live support: source-certified
re-admission uses the same purpose/task identity and preserves invalidation history.
Historical repair alone, human-ended coverage or stale authority cannot do so.

**P18. Imports and activation:** Load history before enabling native admission;
old history generates zero outreach tasks. Late actual live delivery and repair
of blocked original live evidence still converge appropriately. Neither caller
event type nor processing timestamp can falsify provenance.

**P19. Identity merge/unmerge:** Use real P4 owner commands for duplicate Parties,
including both with active tasks and both with completed interactions. Reconcile
coverage before releasing new work, preserve actual histories and verify unmerge
does not automatically manufacture acquisition or disclose formerly hidden data.

**P20. Reassignment/departure:** Authorized handoff preserves identity and genuine
history, revokes old actions and exposes only independently permitted context to
the new assignee. Departure does not restart first support or silently drop work.

**P21. Distinct purposes:** Native and workflow callers for the same purpose converge;
organization receipt and distinct special-gift/other ministry obligations retain
their own meaning. One action covers multiple tasks only when explicitly qualified.

**P22. Contact and send safety:** Never Ask/do-not-contact/channel/purpose rules are
tested in their exact owned meanings; no thanking label routes around a restriction.
Current D15/P6 sending permission and unknown-send recovery remain intact. No
task creation, read or completion sends a message.

**P23. Accessible mobile journey:** Actual keyboard/screen-reader/touch tests cover
discovery, reason, authorized contact, defer, Done, Not needed and Undo at narrow
viewport/zoom. Check focus after row removal, status announcements, long/RTL names,
noncolor states, reduced motion, localization and ambiguous/DST date behavior.

**P24. Comprehension and usefulness:** Observe at least five participants across
missionary and authorized staff roles on the Grace scenario, no-contact path,
wrong owner, correction and interrupted save. Require zero critical misunderstanding
that Done sends thanks, that Grace is new to the whole organization or that a task
grants contact permission. Resolve discovered critical friction and repeat affected
cases. Five is an initial qualitative recruitment target, not statistical proof;
include field/low-bandwidth experience and accessible-user validation.

**P25. Production-shaped load:** Record cohort tenants, largest qualified history,
supporter/subject/task counts, concurrency, batch/page bounds, query plans, p95/p99
latency and recovery throughput. Test the largest launch cohort plus twice its
measured expected peak admission rate; no N+1 lifetime scans, cross-tenant starvation
or data truncation may decide eligibility. Baseline and limits are signed release
evidence, not invented universal capacity.

**P26. Mixed-version rollout:** With old code/new schema and new code/old schema,
unqualified writers cannot bypass permission/coverage or silently succeed. Review
legacy manual/generated task mapping; do not assume the old boolean or first date
proves source qualification. Safe unavailability is preferable to false admission.

**P27. Pause, recovery and restore:** Disable new admission/materialization after
accepted writes, reconcile outstanding intents and roll forward without deleting
history or replaying handled purposes. Restore backup with current revocations,
retention and dedupe reconciliation before releasing any task or notification.

**P28. Audit and privacy:** Distinguish business disposition, actual interaction,
actor security audit and worker traces. Inspect logs, notifications, comments,
search, caches, export and retained artifacts for forbidden donor/source data;
verify lawful erasure/anonymization cannot leak or recreate work.

**P29. Optional systems unavailable:** Disable workflow pack, AI, connected email,
calendar and newsletters; native task admission/discovery/ordinary completion and
source recovery remain functional. Provider outages never mutate support truth.

**P30. Trace consistency:** Check glossary → selected D19/corrected clauses →
source-owner amendments → ADR/OpenSpec → tasks → implementation → tests → release
evidence for exact identity, eligibility, lifecycle and authority terms. No claim
of founder ratification, implementation or proof may precede its actual evidence.

## Ordered path forward and monitoring

**Before recording the answer as final:** resolve the first-support subject and
recorded monetary basis, choose the existing independent task contract, preserve
recognition/contact exclusions, and make lifecycle/import semantics explicit.
This review supplied those decisions and exact wording. The founder subsequently
ratified A's corrected wording and required amendments; ratification does not
establish implementation or release qualification.

**At the authorized spec/design transition:** first add C01–C06/C08/C10 to the
P28 purpose and P13/P14/P9 source contracts; then register the independent task
profile and P12 command/projection matrix, including C11–C13 correction/Undo.
Define baseline coverage and source repair responsibility before task UI plumbing.
Reuse ADR-0183 rather than replacing it. If an actual implementation requires a
different closure contract, that conflict requires an explicit scoped ADR change.
The [owner note](d19-evidence/owner-boundaries.md) identifies exact owner and
OpenSpec destinations. Formal owner documents are not silently edited in this grill.

**Implementation sequence:** qualified source projection and canonical purpose
coverage → transactional intent/current commands/constraints → shared task and
authorized repair projection → simple missionary/staff UX → baseline and old-writer
migration → role/concurrency/recovery/UX/load proof → exact-cohort activation.
Source attribution and recognition gates block only the affected profiles; do
not use the P27 E7 source-code-to-campaign attribution gate to block unrelated
properly qualified ministry facts. No new provider, CRM, workflow or UI dependency
is needed. Optional send/log integration consumes established contracts later
without changing native task meaning.

**Required safeguards, not monitoring substitutes:** permission/tenant isolation,
no unqualified first claims, no automatic messages, source/purpose uniqueness,
truthful completion and historical preservation must be enforced before activation.
Do not “monitor” a known authorization bypass or knowingly false first-support rule.

The following initial operating policies were subsequently ratified. Thresholds are
explicit product/operations judgments, not measurements or provider promises.
Owners are accountable product roles; assign a named on-call person at release.

| Signal                                                                                                            | Threshold                                                                         | Owner                                                | Required response                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Forbidden tenant/source/recipient disclosure or action                                                            | Any confirmed occurrence                                                          | Security incident owner + P12 owner                  | Stop affected projection/action cohort, contain, investigate all alternate paths and requalify before resuming.                               |
| More than one active task for the same admitted first-support purpose, or automatic repeat after human completion | Any confirmed invariant violation                                                 | P9 task owner + P28 product engineer                 | Pause affected admission, reconcile canonical coverage and preserved receipts; never bulk-delete actual history.                              |
| Committed eligible intent without a materialized/reconciled task                                                  | Oldest unexplained age exceeds 15 minutes                                         | P9/workflow operations owner                         | Inspect claim/dispatch health and safely replay existing intents; no fresh-purpose retries.                                                   |
| Unknown history/recognition or unassigned source work with no accountable repair                                  | Any item unowned after the next staffed daily review                              | P13/P14 data operations owner; P9 for responsibility | Assign authorized repair, expose permitted cause, fix source proof or record valid ineligibility. No missionary-facing guessed task.          |
| Repeated access/stale-head rejection on ordinary task actions                                                     | More than 1% of eligible attempts in 24 hours, minimum 100 attempts               | P28 product engineer + P12 owner                     | Inspect stale UI/cache/responsibility causes, improve refresh/recovery; never relax permission checks to reduce the rate.                     |
| p95 task read/command server latency or intent recovery backlog                                                   | Exceeds the signed P25 release envelope for 15 minutes                            | Platform operations owner                            | Bound/pause affected workers, inspect plans/locks/tenant fairness and restore within the measured envelope.                                   |
| User confuses Done with message sent/new organizational donor/access grant                                        | Any critical misunderstanding observed in P24 or reported with reproducible steps | P28 UX/product owner                                 | Correct copy/flow and retest affected journey before release; after release prioritize correction and notify support with body-safe guidance. |

## Executed evidence and limits

Six source/research workstreams and independent cross-review informed the decision.
The [history probe](d19-evidence/history-probe/results.json) reproduced **20/20
synthetic counterexamples** to unsafe shortcuts. These are tests of explicit
synthetic examples, not financial eligibility certification or Core runtime tests.

The current source workstream attempted focused existing tests; collection failed
on the local Sentry package export before tests ran. No install or speculative
workaround was used. This failure is retained in the evidence and is not counted
as a product test pass.

The [isolated PostgreSQL 17.11 probe](d19-evidence/postgres-probe/README.md) passed
**35/35 outcomes**, including **eight actual two-session races** with observed
transaction lock waits. It exercised seeded qualified source signals, semantic
coverage, current authority/assignee fences, atomic outcome/audit and no fabricated
downstream effects. Eight nonsuperuser/non-BYPASSRLS roles and thirteen forced
coarse-RLS tables were inspected. Final container/volume absence was verified at
16:24:17 UTC. Two earlier passing fixture versions are retained with the added
read-handoff and history-hold assertions explained, rather than overwritten.

That fixture does not calculate financial or recognition eligibility, certify
history, implement the exact typed subject/entity profile, exercise actual
asynchronous task materialization, or prove full merge/unmerge. Conditional
personal Undo, erroneous-withdrawal repair, later true-first re-admission after
invalid attribution, independently promised work, actual Core/P12 commands,
hosted Supabase, real-user/accessibility and production performance remain explicit
P-case obligations. No larger claim follows from a passing disconnected fixture.

Independent cross-review changed the design in material ways: use the existing
independent task rather than a new review ledger; keep recognition history distinct
from contact rights; correct mistaken Not needed as well as Done; show optional
interaction audience; preserve independent promised work; and do not permanently
consume a true first-support opportunity with a prior invalid attribution.
These changes are incorporated above, not left as unresolved reviewer notes.

No live Supabase, donor data, provider send, new dependency, application/schema
change, formal owner/OpenSpec edit or GitHub mutation was performed. The immutable
founder brief and previously ratified D18 decision remain unchanged. The
[verification record](d19-evidence/review-verification.json) records structural,
local-link, status and retained-evidence checks separately from product proof.

## Subsequent explicit ratification

On October 16, 2026 UTC, the founder instructed: “Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”

This ratifies the [exact corrected D19 decision](#exact-corrected-decision-to-record),
C01–C24 and P01–P30 as future acceptance obligations. It includes ministry/project
first-support scope, qualified recorded monetary history, the existing Independent
follow-up task, durable purpose coverage, voluntary interaction recording,
conditional Done/Not needed correction, preserved independent undertakings and
qualified repair/re-admission after invalid attribution. Initial operating monitor
thresholds and qualitative recruitment/load targets are ratified design judgments,
not observed production capacity or demonstrated user outcomes.

The original 35/35 PostgreSQL outcomes with eight observed races and 20/20 history
counterexamples retain their bounded meaning. Conditional correction, complete
financial/recognition/P12/Core integration, full identity reconciliation, hosted
Supabase, actual accessibility/usability and performance remain release obligations.
The [initial verification](d19-evidence/review-verification-initial.json) and its
[checker](d19-evidence/verify-review-initial.py) preserve pre-ratification status.
No application/schema, dependency, formal owner/ADR/OpenSpec, ticket, live provider
operation or external communication follows from this ratification. The founder
brief remains unchanged. Continue with one independently researched product choice.
