# Phase 28 D21 — Explicit qualifying facts, useful history and deliberate follow-up

Review date: **October 17, 2026 (Asia/Bangkok; October 17 UTC)**.
Repository baseline: `9cada8f3d8ab59db391d3fd20df77fcadeb09813`.
Status: **Corrected decision and required amendments explicitly ratified on October 17, 2026 UTC.**
Disposition: **Accept with required amendments.**

This is a completed decision review in the grill notebook. It is not a formal
PRD, owner/ADR/OpenSpec amendment, implementation or release qualification.
D19 and D20 remain ratified. No Q22 was posed in the initial review;
subsequent ratification and continuation are recorded below.

## Exact corrected decision to record

> **A — Explicit qualifying facts only.** A gift being larger than the supporter's
> earlier gifts does not, by itself, create automatic missionary follow-up or an
> equivalent unusual-giving suggestion, attention badge, priority or notification.
> Permitted giving history remains available as factual context, and Maya can
> deliberately add ordinary follow-up. Required native special-gift and
> above-commitment follow-up continue when their owning domains establish the
> exact qualifying facts. A saved flag or label is not proof of qualification.
>
> Show a clear factual reason for qualified automatic work. Otherwise show the
> ordinary gift and its permitted history, with **Add follow-up** or an existing
> relevant **Open follow-up** action. Do not imply that no automatic task means
> no follow-up is needed. Manual work does not classify the gift or manufacture
> financial facts, consent, communication or automatic-purpose coverage. Keep
> D20's exact reviewed-gift handling and D19's legitimate first-support history.

This preserves the founder's product choice. The required amendments make its
meaning consistent across source admission, UI, optional automation and repair.
They do not select a monetary threshold, history window, new special-gift flag,
rule builder, new permission or additional settings switch.

**One unresolved boundary is explicit:** the inspected governing material does
not yet settle every native special-gift criterion. D21 rejects one proposed
basis; it does not define all remaining eligible cases. Product must resolve the
missing meaning with the financial/task owners before the affected producer's
activation; engineering must prove that exact contract. These are distinct
obligations. Required native work cannot be permanently replaced by manual tasks,
optional workflows or an indefinite placeholder. No threshold is silently chosen
in this review to disguise that gap.

## Evidence, current behavior and intended direction

| Evidence class                    | Finding and practical limit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder decision                  | A expressly retains history, qualified native work and missionary initiative. B would also create possible-change review work; simply changing its label does not turn B into A.                                                                                                                                                                                                                                                                                                                                                                  |
| Governing repository intent       | [Owner constraints](../../../prds/program-roadmap/owner-constraints.md:74), [founder brief](phase28-founder-brief.md:165), [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622), and ratified [D19](phase28-d19-first-support-follow-up-adversarial-review.md) / [D20](phase28-d20-grouped-special-gift-follow-up-adversarial-review.md) require native work, exact source purpose, independent human tasks, current permission, correction and durable coverage.                                            |
| Financial authority               | P13 owns effective received money; P14 owns recognition and its independent corrections; P16 owns commitment/application/health meaning. A current excess after reducing a commitment can exist with **no new gift**. A missing visible commitment is not a zero expected amount. Exact inspected sections are in the [financial review](d21-evidence/qualifying-facts-and-financial-truth.md#exact-source-evidence).                                                                                                                             |
| Other repository purposes         | P13 posting-risk thresholds, P16 explained matching suggestions/health, P27 staff-only optional financial ratings and P35 future recipes retain their separate purposes. None supplies permission to copy a historical anomaly into missionary attention. D19 firstness still requires qualified history.                                                                                                                                                                                                                                         |
| Current static source             | The generic manual POST is strict and sets `is_auto_generated: false`; it does not currently accept a caller's `explicit` flag as a source contract. Legacy browser task writes conflict with later browser-grant revocation. Capped donor/gift reads and null-to-zero/false conversions cannot prove complete history or absence of a commitment. These are source findings, not a hosted exploit or runtime test. See [current-source review](d21-evidence/current-source-and-ux.md) and [database review](d21-evidence/database-lifecycle.md). |
| Current primary external evidence | MPDX documents contact-context Donations/Tasks and manual creation; Bloomerang documents labeled actions and filterable timelines; Blackbaud distinguishes giving-history inclusion/status; Carbon distinguishes empty, filtered, permission and system states; W3C specifies table/status semantics. The [UX evidence register](d21-evidence/history-context-ux.md#fresh-primary-research-and-explicitly-reused-evidence) gives retrieval/publication dates and limits.                                                                          |
| Technical facts                   | Fresh October 17 PostgreSQL/Supabase readback confirms grants, RLS, function privileges and trusted commands must work together. Omitted UPDATE `WITH CHECK` inherits `USING`; its omission alone is not a vulnerability. Service/BYPASSRLS authority still requires the application owner's authorization. [Fresh sources and hashes](d21-evidence/database-lifecycle.md#fresh-supabasepostgresql-evidence).                                                                                                                                     |
| Reasoned design judgments         | Contextual manual work, restrained presentation and exact known-task reuse are the smallest coherent solution. They are supported by comparable documented patterns, not measured Core user satisfaction or a proven donor-retention improvement.                                                                                                                                                                                                                                                                                                 |
| Executed evidence                 | Eighteen finite semantic counterexamples expose ambiguous shortcuts. D20's retained PostgreSQL experiment established bounded mechanics with seeded qualification; it did not prove real source facts. Neither is UI, production-capacity or actual Core qualification.                                                                                                                                                                                                                                                                           |

Six bounded research workstreams are retained: [UX](d21-evidence/history-context-ux.md),
[financial truth](d21-evidence/qualifying-facts-and-financial-truth.md),
[owner boundaries](d21-evidence/owner-boundaries.md),
[current source](d21-evidence/current-source-and-ux.md),
[database/lifecycle](d21-evidence/database-lifecycle.md), and
[counterexamples](d21-evidence/decision-counterexamples.md).
Four independent reviews and their exact corrections are retained in the
[cross-review reconciliation](d21-evidence/cross-review-reconciliation.md).
The historical DOCX remains big-picture context under the earlier
[reconciliation](phase28-legacy-dashboard-context.md), not authority for an old
stack, dependency or inferred classification.

Three concrete current-source gaps matter before reusing the existing journey:

- The donor API returns `score`, including in anonymous stats, while the field-policy
  declaration marks it unreadable to missionaries; the inspected successful-response
  wrapper does not project it away. This is a source/contract conflict, not proof
  that deployed values are real P27 ratings or that a production incident occurred.
- The donor Tasks component ignores its hook error and can display **No tasks yet**
  after an initial failure. Its mounted browser dialog also conflicts with the
  later server-only grant declaration. A good-looking Add action must actually use
  the qualified shared task path and show honest recovery.
- Stored At Risk/Lapsed statuses drive a Needs Attention card, and the settings
  screen's At-Risk Donor Alert Save is local state only. No history classifier or
  durable preference is proved by those labels. Inventory their actual purposes;
  do not delete all status-based work or present a phantom D21 configuration.

## Problem validity and strongest alternative

The known product need is useful stewardship without noisy automatic work or
false financial meaning. The founder supplies that direction; no new missionary
interview is claimed. A lets Maya notice and respond to a meaningful gift without
having to prove that it qualifies as a system-generated special gift.

The strongest alternative is an **explained possible-change review**, with no
claim that a gift is definitely extra. It could help with supporters who have no
commitment, but still needs complete comparable history, a justified comparison,
privacy boundaries, correction and an additional source-purpose lifecycle. The
available vendor documentation establishes examples, not Core-specific benefit,
accuracy or an acceptable false-positive rate. The founder declined that product.
A neutral history view plus deliberate action solves the selected need with fewer
moving parts. Hiding history or requiring staff to create every follow-up would
unnecessarily remove useful existing capabilities.

“Explicit” must mean **source-qualified for this purpose**, not “raw rather than
derived” or “a Boolean exists.” P13 effective totals, P14 recognition, P16 health
and D19 firstness may legitimately be derived. Conversely, a persisted history
ratio, AI label or imported `special` value remains the rejected inference.
Adding `received = true` does not supply an independent qualifying basis.

## The complete user journey

1. **Maya opens Grace's ministry context.** The existing giving view identifies
   the permitted ministry, dates, currency and gift meaning. A larger gift looks
   like an ordinary gift. No alarm, donor-value label, special inbox, ranking or
   mandatory classification appears because of its size relative to history.
2. **She understands the evidence.** A gift row opens its permitted details.
   Filters stay visible; partial, updating, unavailable and empty states remain
   distinct. Do not label a capped page “complete history” or absent visible
   commitment “No commitment.” Neutral charts and deliberate report sorting
   remain useful; no automatic instruction is smuggled into them.
3. **She chooses an action.** A contextual **Add follow-up** opens the normal task
   form in the same surface. If the owner already knows an authorized compatible
   pending follow-up, show **Open follow-up**. Do not infer compatibility from
   a shared donor, date, title or amount, and do not reveal hidden work. Maya can
   still create genuinely different work under ordinary permissions.
4. **She saves once.** Show safe contact/ministry context, the intended work and
   ordinary optional task details. No special-gift questionnaire, compulsory
   note, duplicate confirmation or source-classification field. Use qualified
   references instead of copying private financial facts into unrestricted prose.
   Successful creation has a persistent result; a timeout recovers the original
   command rather than blindly creating another task.
5. **Qualified automatic work has an explanation.** The same shared task surface
   states the exact source-backed reason and lists D20's included gifts. An
   above-commitment explanation must name the actual permitted comparison, not
   guess from the current pledge or historical average. It creates no message.
6. **She handles the work.** Ordinary task Done records personal work. Actual
   communication remains a separate deliberate action; interaction logging is
   voluntary and audience-aware. D20 handling covers only the reviewed members.
   A generic completed manual task does not silently pre-consume future native
   coverage. Qualified source changes and independent promises retain their
   separate histories.

| Situation                                  | Appropriate concise presentation                                                                      | Avoid                                                                                                   |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Ordinary gift, no admitted automatic work  | Gift facts; **Add follow-up** when permitted                                                          | “Not special,” “No follow-up needed,” anomaly highlighting or a disabled automatic-task placeholder     |
| Exact compatible permitted work exists     | **Open follow-up**, with honest purpose/status                                                        | “Already thanked,” merging different promises, exposing a hidden task/count                             |
| Qualified automatic work                   | Plain source reason; permitted gift list; normal task actions                                         | Financial jargon as the main action, invented criteria, Done implying a sent message                    |
| No rows match selected filters             | **No gifts in this view** and **Clear filters** when useful                                           | “No giving history” or “No support”                                                                     |
| Known partial history                      | Qualified coverage description; **Some history is unavailable** if that is all the source establishes | Inferring the coverage start from the first loaded row or disclosing hidden records                     |
| Known source refresh                       | **Gift details are updating**                                                                         | Claiming task creation is pending without a durable admitted intent                                     |
| Fetch failure                              | **Gift details are unavailable right now. Try again.**                                                | Zero totals, no commitment or an empty success state                                                    |
| Save outcome cannot yet be confirmed       | **We couldn't confirm whether the follow-up was created. Check status.**                              | A false failure/success, fresh automatic retry with a different identity                                |
| User has read but no task-create authority | Readable context and existing standard permission explanation where useful                            | An enabled control that fails after entry, a wall of disabled controls or a new access request workflow |

Optional contextual help: **“Automatic follow-ups use qualifying gift facts. A
change from earlier giving alone does not create one. You can add your own
follow-up.”** Show the final sentence and Add action only when current task-create
authority permits them. Use only where helpful; do not put a disclaimer on every gift or
claim the unimplemented producer is ready.

Use Core's shared Base UI components, semantic tokens and normal task/list
patterns. On phones preserve date, amount/currency, meaning and action labels in
a readable list; no horizontal spreadsheet or hover dependency. Keep keyboard
order, visible focus, focus return, zoom/reflow, RTL/long names and localized
unambiguous dates. Source financial dates keep their own meaning; viewer timezone
only formats applicable timestamps. Material status messages have appropriate
assistive-technology semantics. Core's 44-pixel touch guidance is distinct from
WCAG 2.2 AA's 24-CSS-pixel minimum and its exceptions. No conformance or aesthetic
user validation is claimed before an actual interface is tested.

## Required clauses for later specification

**C01 — Excluded automatic purpose.** P28 SHALL NOT create unusual/special-gift
attention whose deciding qualifying basis is a comparison with prior giving.
The exclusion covers tasks, group admission, unsolicited follow-up suggestions,
attention badges, default work prioritization and notifications, including
possible-change review wording. Holding qualified source facts, authority,
provenance and user intent fixed, changing only nonauthoritative comparison
context SHALL NOT change those effects. Authorized charts and explicit user
sorting are not prohibited effects.

**C02 — Independent qualification.** An automatic qualifier SHALL come through
the exact owning-domain contract for the accepted purpose, with source occurrence,
scope, evidence and relevant revisions. A flag, tag, imported field, score, memo,
source name, hash or received-gift conjunct SHALL NOT launder the rejected
comparison into qualification. This decision SHALL create no generic special
marker or new classifier.

**C03 — Preserve required work and scope the remaining decision.** Qualified
native first/special/above-commitment/fulfillment/permitted recurring-attention
work SHALL continue independently of optional workflows. D19 firstness, P13/P14
folds, P16 health/matching suggestions and separately governed staff purposes
retain their own contracts. P27 ratings SHALL remain staff-only. Before reusing reached donor/history
projections, remove forbidden legacy score egress and placeholder-driven financial
conclusions; unrelated authorized staff analysis remains intact. Missing material
native criteria SHALL be explicitly resolved with their owners before affected
activation; D21 SHALL NOT invent a threshold, staff flag, non-recurring rule or
replace required work with a permanent manual-only fallback.

**C04 — Unknown is not zero.** A visible empty/capped/filtered list, unmatched
money or unavailable source SHALL NOT establish no commitment, no support,
firstness or nonqualification. Even source-certified absence of a commitment
SHALL NOT itself classify every gift as special or extra. An above-commitment
criterion SHALL bind the exact live gift/application, comparison target, terms
and currency. Catch-up, advance coverage, reduced terms or current excess without
new money SHALL NOT independently manufacture a new special-gift occurrence.

**C05 — Exact financial and identity meaning.** Qualification SHALL retain exact
Tenant, Legal Entity, typed ministry subject, business contribution, permitted
relevant allocation, qualified follow-up Party and purpose. Recognition is not
money or contact authority. Multiple relevant lines/credits SHALL NOT multiply a
single business-gift effect. Source-owned money precision/currency/date rules
remain authoritative; no float comparison, silent FX, mixed-currency total,
household/DAF/church-member fan-out or changed gift date follows from D21.

**C06 — Current owner command.** Every native, workflow, import, repair or
privileged automatic caller SHALL use the same current source-purpose admission
and P12 authorization. Tenant/actor/author/owner/audit attribution SHALL be
derived or resolved from trusted context and owner-validated references, not
accepted as authority from caller input. Qualification and accepted effect intent
SHALL be durable together; task materialization SHALL be recoverable without
making financial posting wait for a human task.

**C07 — Database backstops.** Effective grants, coarse Tenant RLS, old-row `USING`,
proposed-row `WITH CHECK`, views/RPC ownership, exposed schemas, function EXECUTE
ACLs and trusted search paths SHALL be qualified together. Omitted checks follow
PostgreSQL inheritance rules. Tenant-aware keys/references and owner constraints
SHALL prevent cross-scope links and mutable generated provenance. Generic writes
SHALL NOT relabel manual work as qualified native work or rewrite source/coverage
receipts. No second SQL fine-grained permission engine or new physical schema is
selected here. Reached privileged/storage/export paths retain the same owner
boundaries; no new file or export feature is required.

**C08 — Factual context and honest states.** Show authorized history with its
known basis, scope, date, currency and currentness. Preserve distinct filtered,
known absent, incomplete, updating, error and denied states without leaking hidden
existence. Absence of an automatic task SHALL NOT be presented as no follow-up
needed. No mandatory negative classification or audit record of every history
view is introduced; required P12 access audit still applies.

**C09 — Deliberate manual follow-up.** Maya SHALL be able to add ordinary follow-up
from eligible context under existing permissions, without certifying a financial
fact, requiring a note or fabricating native admission/coverage. Keep the normal
form, one Save and recoverable outcome. Display existing known compatible work
only when authorized; preserve genuinely different intended work. Do not infer
contact/send permission from gift visibility or task creation.

**C10 — Same work, same owner.** Manual/native coordination SHALL use the existing
shared task owner's exact intended-action, current responsibility and source
coverage contract. Opening or linking a task SHALL NOT admit native members. A
later qualified occurrence may reuse proved compatible pending work through that
owner. Generic manual Done SHALL NOT suppress native work. Any recognition of
already-performed exact work requires attributable scope evidence and the owner's
qualified reconciliation, retaining original action time and later source lineage.
No title/NLP matching, same-donor suppression, new intent registry or mandatory
missionary reconciliation queue is introduced.

**C11 — Reviewed scope and current authorization.** When a task carries admitted
D20 special-gift membership, that membership and its disposition SHALL retain
D20's exact reviewed member/revision scope, immutable outcome receipt,
unhandled new arrivals, source-correction behavior and conditional personal
correction. Ordinary manual tasks and other native purposes retain their own
completion contracts. Recheck current permission at commands/results; hidden members,
counts, history or residue SHALL NOT leak through task status, filters, errors or
cached responses. No automatic grouping or context link expands access.

**C12 — Correction and historical origin.** Relevant source changes SHALL
requalify or withdraw only affected generated requirements, preserving prior
human outcomes and independently accepted work. Original live unconsumed
occurrences may be delayed or restored through their qualified lineage; event
arrival, new policy, backfill or historical import SHALL NOT make old history a
new live gift. Consumed purpose coverage SHALL NOT recur. Financial, occurrence,
recording and task dates remain distinct.

**C13 — Retry and failure.** Accepted source work SHALL survive failed task
materialization and be replayable by stable business effect identity. Same-command
manual retries SHALL resolve the original result, under current disclosure rights.
Atomic acceptance/audit failure SHALL not leave partial authoritative state.
Ambiguous save/transport outcomes SHALL remain unknown until reconciled; no blind
new task, financial rollback or sent-message claim follows.

**C14 — No inference through adjacent features.** Optional workflow, connected
email, AI, calendar, notifications, coaching, reports and exports SHALL not bypass
this purpose boundary or inherit financial access from a task/context link.
Existing separately authorized owner operations remain valid. Manual creation and
Done SHALL not send, subscribe, consent, classify generosity or invent interaction.
No new external service, model or vendor is required for D21.

**C15 — Simple accessible interaction.** Use the existing history/shared-task
surfaces and component system, clear text labels, factual reasons and contextual
Add/Open actions. Preserve mobile reflow, keyboard/focus behavior, status feedback,
international content and low-bandwidth recovery. Do not add an anomaly panel,
mandatory report, approval per gift or new policy configuration for excluded work.
Ordinary independently permitted manual work SHALL remain usable when an unrelated
history/qualification projection is unavailable.

**C16 — Bounded performance.** Use indexed exact tenant/subject/source/task lookups,
existing source revisions and paginated history. No full-history scan is required
merely to enforce the excluded purpose. Qualification SHALL measure real query
plans, authorized pagination, current-revision races and tenant isolation at the
approved workload profile. This decision claims no numerical capacity or latency
and selects no additional storage/index framework.

**C17 — Safe rollout and retained data.** Inventory all reached writers and
projections before enabling this behavior. Stop unsupported automatic admission
before reconciling retained solely inferred reasons; do not mark them human-done.
Preserve financial truth, completed history and independent promises/P27 duties.
Unknown provenance needs owner review, not destructive guessing. Mixed versions,
replay and rollback SHALL not restore the excluded producer or bypass new source
checks; source reads/manual work/qualified native work keep their own controls.

**C18 — Audit and diagnosis.** Reuse durable owner evidence for source/criterion
revision, scope, accepted intent, human actor/action and exact coverage receipt.
Technical telemetry SHALL distinguish denied/incomplete admission, materialization
failure and unknown save outcome without logging donor prose or protected facts.
Do not invent a donor score or per-nonqualifying-gift ledger. Preserve required
retention/anonymization and current audit disclosure through existing owners.

**C19 — Traceability and release proof.** Preserve accurate D21 selection and
ratification status, its initial review history and the narrower D19/D20 decisions. Later authorized
formalization SHALL map these clauses and proofs to exact owner requirements,
OpenSpec scenarios/design/tasks and release evidence; create tickets only when
that transition is authorized. Tests SHALL prove both absent prohibited attention
and present qualified/manual work. Static inspection, competitor documentation and
isolated fixtures SHALL NOT substitute for actual Core/P12/source/UI proof.

**C20 — Operational ownership.** The source/task owners SHALL own replay and
correction through their existing commands. The bounded monitors below SHALL have
an accountable role, explicit signal/threshold and response. No access violation,
forged eligibility or loss of required native work is accepted merely as a
monitored risk. A named release assignee is required for each owner role before
activation; no real employee or numerical baseline is invented here.

## Source of truth and invariants

| Fact                                                                     | Authoritative owner / invariant                                                                                                                            |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actual contribution, effective amount/allocation, financial correction   | P13, with P7's applicable date policy. Append-only financial correction; tasks neither edit nor replace it.                                                |
| Recognized supporter and related permission-safe history                 | P14. Recognition may lag money and has its own amendments; it is neither cash nor a recipient grant.                                                       |
| Commitment terms, exact application, expected/current support health     | P16. History can suggest matching under its existing contract; only qualified authority applies money. Current excess is not necessarily a new occurrence. |
| Native task purpose/qualification                                        | P28 consumes accepted exact source criteria. An importer, workflow, UI field or static chart is not an alternative financial authority.                    |
| Actual task, human disposition, reviewed membership/coverage and receipt | P9/shared-task owner under ADR-0183 and D19/D20. A reference is not admission, Done is not communication, and one gift's identity survives grouping.       |
| Current actor/scope/field rights                                         | P12 plus source ceilings and coarse database protection. List visibility, a cached receipt and a service credential are not independent rights.            |
| User-visible history/charts/help                                         | Derived authorized projections. Read models cannot authorize source mutations or invent completeness.                                                      |
| Communications and actual interactions                                   | Existing P6/D15/P9 owners. Permission, deliberate action and actual outcome remain separate from task lifecycle.                                           |

The cardinality invariant is one compatible current native follow-up for its
qualified scope under D20, not one lifetime task per donor or one task for every
possible manual intention. Money conservation and identity remain source-owned.
No new amount column, pledge field, special Boolean, uniqueness rule on names,
nullable authorization field or cascade-delete scheme is selected by this review.
When implemented, source/task references must be tenant-aware and cannot cascade
away required evidence; existing allowed retention/anonymization still applies.

## Lifecycle and failure decisions

| Transition / race                                                | Required result                                                                                                                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| History-only large gift arrives                                  | Ordinary authorized facts may update; zero additional automatic unusual/special attention. No new negative-classification state required.                                |
| Source evidence is incomplete or conflicting                     | Do not assert eligibility or known nonqualification. Recover source processing through existing owner; manual work remains independent.                                  |
| Genuine qualified live gift arrives                              | Admit durable exact effect once; materialize/reuse current shared work under D20, even without optional workflow tooling.                                                |
| Manual Add races native admission                                | Proved same intended pending action coordinates through one task owner; distinct or unproved intent is not silently merged/suppressed. No blind double-click duplicates. |
| Generic manual Done precedes qualified admission                 | No inferred prior native coverage. Only the qualified owner can recognize separately proved exact prior work; otherwise native work remains due.                         |
| New G3 arrives after reviewing G1/G2                             | D20's immutable G1/G2 outcome does not consume G3; compatible pending residue stays on current work.                                                                     |
| Relevant gift/attribution/commitment/right changes during review | Recheck current exact evidence/rights. Material selected changes require refresh; unrelated eligible arrivals do not invalidate an otherwise safe reviewed disposition.  |
| Source becomes invalid after actual human work                   | Preserve the actual action/history; remove only the generated requirement. Do not erase a promised call, send or real interaction.                                       |
| Lost response after accepted save                                | Recover the same receipt under current rights; no second effect from retry. UI does not pretend success/failure is known.                                                |
| Historical import, rule change or restore                        | No new historical follow-up or repeat consumed effect. Originally live unconsumed repair retains lineage and is separately qualified.                                    |
| Permission revoked or user changes tenant                        | Remove protected projection/cached details and reject further commands/results; do not reveal hidden task existence or preserve access through a link.                   |
| Rollback after a new accepted task                               | Preserve evidence and use compatible owner commands; never restore an old unsupported writer/classifier or erase human history.                                          |

## Consolidated concerns and exact prevention

Likelihoods are conditional design judgments, not measured production incidence.
Severity reflects consequences. Every row states failure/importance, evidence,
severity/likelihood, effect on A, permanent prevention and exact clauses/proofs.

| ID  | What could go wrong and why it matters                                                                                                                                                                                               | Severity / likelihood                                                                | Evidence and reasoning                                                                                                          | Effect on A; permanent fix and exact language                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| F01 | “Explicit” means any saved flag, or comparison plus Received is accepted. The declined inference returns as task, badge or priority and changes donor treatment without a qualified reason.                                          | High / plausible unless every producer uses the semantic boundary                    | Q21 A/B; financial QF21-02; counterexamples D01/D05–D09; a Boolean says nothing about provenance                                | Clarifies A across equivalent effects. Enforce C01–C02/C14; prove P01–P03/P22.                                                  |
| F02 | A blanket ban on derived/history facts disables firstness, matching or required special/above-commitment work; alternatively an arbitrary threshold is invented. Either loses the promised product or silently makes a new decision. | High / likely with an overly broad shortcut                                          | Founder brief; D19/D20; P16; P13 risk/P35 binding distinctions; QF21-01/03/05                                                   | Narrows exclusion; retains missing exact criterion as a specific product/source gate. C03–C04/C19; P04–P07/P26.                 |
| F03 | Empty/capped history means no commitment or zero; catch-up, reduced terms, currency or recognition are mistaken for extra money. Incorrect tasks and misleading donor-facing language follow.                                        | High / plausible in current legacy projections                                       | Current-source null fallbacks/caps; P16 reduction; P14 recognition; finite D02–D04/D11–D12                                      | Changes qualification/display requirements, not A. Exact source meaning and honest unknowns: C04–C05/C08; P05–P09.              |
| F04 | UI-only controls leave privileged/import/workflow writers or editable provenance; broad grants or cross-scope references bypass rights. Protected financial/missionary data can leak or be relabeled.                                | Critical for unauthorized disclosure / plausible until reached paths are qualified   | Current privileged wrapper/direct-writer conflict; P12; fresh PostgreSQL grant/RLS/function rules; DB21-F1/F2                   | Requires owner command plus database backstops, no parallel PDP. C06–C07/C11/C14; P10–P12/P21/P27.                              |
| F05 | Add follow-up creates duplicate work, title matching merges a promise, or generic manual Done suppresses later qualified work. Maya loses trust and either repeats or misses actual work.                                            | High / plausible with independent manual/native writers                              | ADR-0183; D20; owner OC03–OC05; counterexamples D13–D15                                                                         | Adds exact existing-owner coordination while preserving distinct intent. C09–C11; P13–P16.                                      |
| F06 | Stale criteria, corrections, event timing or policy replay create false/current tasks or repeat old gifts. Source-only retirement erases independently promised work.                                                                | High / plausible during normal asynchronous correction                               | P13/P14 independent revisions; P16 changes; D20 restoration; counterexamples D16–D17                                            | Retains current evidence and original origin; preserve human truth. C06/C11–C12/C17; P17–P20/P25.                               |
| F07 | A task is lost after source acceptance or a timeout creates another task; successful finance is rolled back because task projection failed. Actual outcome is ambiguous and repair is unsafe.                                        | High / plausible under ordinary network/job failure                                  | ADR-0183 durable intent; D20 receipt mechanics; strict generic current task path lacks this source contract                     | Requires atomic local acceptance and recoverable owner delivery, not distributed exactly-once claims. C06/C13/C18; P16/P20/P23. |
| F08 | “No follow-up needed,” false zero/empty, hidden-control confusion or a noisy anomaly panel misleads Maya. Poor keyboard/mobile behavior makes the simple action harder than necessary.                                               | Medium; High for false financial conclusions / likely if views reuse legacy defaults | Current source; MPDX contextual tasks; Carbon states; W3C; H01–H08                                                              | Refines the journey through factual context and Add/Open. C08–C09/C15; P08–P09/P24/P28.                                         |
| F09 | History/task links expose another tenant's gift, hidden task, donor score, sensitive missionary context or protected data in AI/calendar/logs. A task mistakenly implies permission to contact.                                      | Critical / plausible without derivative checks                                       | P12, P14 anonymity/recipient rules, P27 staff-only ratings; current score projection requires qualification, not assumed safety | Requires current authorized derivatives and minimal references. C05/C07–C11/C14/C18; P10–P12/P21–P22.                           |
| F10 | Enforcing an absent classifier creates a new rules registry, negative ledger, full-history scan or configuration UI. Complexity and cost rise without solving the selected problem.                                                  | Medium / plausible overengineering                                                   | No new mechanism in A; existing source/task contracts; owner OC09                                                               | Narrows implementation to established owners and exact lookups. C01–C03/C08/C15–C16; P03/P26/P28.                               |
| F11 | Old writer/version/restore reintroduces inferred tasks, or cleanup deletes useful retained work. No safe repair ownership makes staff depend on direct database edits.                                                               | High / plausible for mixed-version retained data                                     | Browser writer vs revoked grants; D20 current-source limitations; owner OC06/09                                                 | Requires a bounded inventory/retirement and roll-forward path, preserving manual/native work. C12–C13/C17/C20; P25/P27.         |
| F12 | Documentation is mistaken for a qualified producer; isolated PG or toy examples are cited as real financial/UX proof. Missing source binding and failures remain invisible.                                                          | High / likely if evidence classes are merged                                         | D20 seeds eligibility/origin; no real-user/Core D21 tests; unresolved exact special predicate                                   | Changes release evidence and traceability, not product selection. C18–C20; P23/P26–P28; explicit owners/monitors below.         |

## All 22 categories assessed individually

“No additional material concern” means no new hazard beyond the named inherited
boundary was found in this scoped review; it is not universal proof of safety.

| #   | Category                                                  | Material concern?                  | What was checked and consequence                                                                                                                                                                                  |
| --- | --------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01  | Problem validity, necessity, alternatives                 | **Yes — F01/F02**                  | Compared A with explained unusual-gift review, manual-only and hidden-history alternatives. Keep useful context/native work; reject inferred attention, not all derivation.                                       |
| 02  | Brittleness                                               | **Yes — F01/F03/F06**              | Capped history, missing commitments, changed source facts, stored flags and asynchronous corrections cannot supply stable qualification.                                                                          |
| 03  | Technical debt                                            | **Yes — F04/F10/F11**              | Generic/direct writer conflict, score projections and duplicated authority are qualification gaps. Reuse owners and retire conflicting reached paths; no new engine.                                              |
| 04  | Edge cases                                                | **Yes — F03/F05/F06/F07**          | Catch-up, advance, no commitment, split allocation, DAF/households, multiple currencies, delayed live gifts, corrections and lost responses need exact treatment.                                                 |
| 05  | Footguns                                                  | **Yes — F01/F04/F05/F08**          | Special tags, editable provenance, misleading Done/zero, title matching and retry can silently invent facts or consume work.                                                                                      |
| 06  | Tenant safety                                             | **Yes — F04/F09**                  | Tenant/Legal Entity/typed ministry/Party, permission caches, hidden task reuse and derivative outputs must remain scoped through current owners.                                                                  |
| 07  | Database, RLS and authorization safety                    | **Yes — F04/F06/F09**              | Effective grants, USING/WITH CHECK inheritance, RPC/view ownership, service bypass, trusted attribution, immutable evidence and scoped references checked. No new money schema needed.                            |
| 08  | Overengineering                                           | **Yes — F10**                      | A needs no anomaly classifier, rule builder, second ledger, special checkbox, mandatory review queue or all-history negative audit.                                                                               |
| 09  | UX/UI and friction                                        | **Yes — F05/F08**                  | Full view→Add/Open→Save→handle journey, honest states, mobile, focus, international/currency/date context and permission truthfulness reviewed. Real-user validation remains required.                            |
| 10  | Source of truth, ownership, invariants                    | **Yes — F01/F02/F03/F05**          | Financial/recognition/commitment/native purpose/shared-task authority separated; read models and manual intention cannot become source truth.                                                                     |
| 11  | Hidden coupling                                           | **Yes — F02/F05/F09/F10**          | P13 risk, P16 matching, P27 staff analysis, optional P35/AI/calendar and manual task coverage must not silently depend on or expand this purpose.                                                                 |
| 12  | Failure modes                                             | **Yes — F06/F07/F08**              | Failed materialization, unknown save, stale source, revoked rights and unavailable projections need safe honest recovery.                                                                                         |
| 13  | Lifecycle, temporal correctness, concurrency, idempotency | **Yes — F05/F06/F07**              | Manual/native races, D20 reviewed set/new arrivals, source revisions, completion, correction/restoration, historical replay and original command receipts checked.                                                |
| 14  | Data integrity                                            | **Yes — F03/F05/F06**              | No inferred amounts/firstness/coverage, duplicate effect from credit rows, stale commitment classification or rewritten human/financial history.                                                                  |
| 15  | Security and privacy                                      | **Yes — F04/F09**                  | Anonymity, restricted financial/location context, consent/contact separation, logs, exports, caches, retention/restore and source-linked task access reviewed.                                                    |
| 16  | Scalability and performance                               | **Yes — F10**                      | Existing capped views are not complete history; avoid repeated whole-history scans and N+1 source resolution. Actual plans/load must qualify capacity; no invented throughput claim.                              |
| 17  | Operational burden                                        | **Yes — F07/F10/F11**              | Keep source/task repair and writer retirement owned; avoid a missionary exception queue or recurring direct database cleanup.                                                                                     |
| 18  | Observability and auditability                            | **Yes — F07/F12**                  | Distinguish source admission, task projection, human receipt, financial meaning and technical failure; no unnecessary negative-gift ledger.                                                                       |
| 19  | Dependency and integration risks                          | **Yes — F01/F04/F09**              | Existing optional workflow/import/service/AI paths can bypass policy even with no new vendor. Provider labels are not source authority; D21 adds no dependency.                                                   |
| 20  | Migration, rollout and upgrades                           | **Yes — F06/F11**                  | Mixed writers, retained inferred work, unknown provenance, backfill/restore, safe disablement and rollback after new human work require qualification.                                                            |
| 21  | Testability, traceability and proof                       | **Yes — F02/F12**                  | Positive/negative exact cases, owner destinations, selection/ratification, real-runtime gaps and old probe limits stated. No fabricated tickets/tests or blanket OpenSpec completion.                             |
| 22  | Other development hazards                                 | **No additional material concern** | Reviewed rollback ownership, dependency additions, historical-doc authority and hidden scope expansion. The material hazards found are already F01–F12 with exact controls; none is dismissed as merely unlikely. |

## Acceptance evidence required before affected release

These are falsifiable future requirements, not claims that these tests already ran.
Use actual source commands and user-visible/domain outcomes; do not merely seed an
`eligible` Boolean and test that it is read back.

**P01.** A larger gift with unchanged qualified facts creates no unusual/special
attention across task, group, badge, priority, suggestion and notification paths.
Changing only nonauthoritative history changes no such effect.

**P02.** Persist that comparison as flag/tag/AI/import/source label, or combine
it with Received; every automatic entry point still rejects its claimed basis.
A real independently qualified derived source fact remains valid.

**P03.** Authorized charts/filtering/user sorting still work. No new classifier,
settings switch, model call, hidden score or per-view negative ledger is introduced.

**P04.** Required first/special/above-commitment/fulfillment/recurring tasks still
work through accepted criteria without optional workflows; D19 qualified history
and P16 explained matching remain valid, with no missionary P27 rating projection.

**P05.** Missing, denied, capped, unmatched and known-absent commitments stay
semantically distinct; none independently classifies a gift as extra/special.

**P06.** A commitment reduction yielding current excess without new money does
not create a new special-gift occurrence. Catch-up/advance and exact source terms
are handled through the approved predicate rather than gift-minus-current-pledge.

**P07.** The actual native special criterion is recorded, owner-approved and
implemented with positive/negative/boundary cases before activation. No unspecified
staff marker or financial posting-risk threshold supplies the missing definition.

**P08.** A filtered/partial history screen never claims complete history, zero
support, no commitment or no follow-up needed; errors remain visible and recoverable.

**P09.** Multi-currency, long/RTL/international names, source date versus viewer
timezone, recognition versus money and same-gift multiple allocation/credit cases
retain correct meaning without hidden allocations or doubled contributions.

**P10.** Cross-Tenant/Legal Entity/ministry/Party source and task references are
rejected across APIs, workers, imports, views/RPCs and every reached alternate path.

**P11.** Actual deployed-role grants/RLS, old-row/proposed-row checks, function
ACL/search path/ownership and privileged commands deny forged actor, source,
owner, qualification and coverage changes. Test a permitted row becoming forbidden.

**P12.** Revocation, tenant switch and shared cached response/receipt races reveal
no stale protected facts, hidden task count or access inherited through a link.

**P13.** Add follow-up reuses exact known compatible authorized pending work;
opening it admits no new native member. Distinct promises remain independently usable.

**P14.** Manual work without a native qualifier saves normally but creates no
financial fact or native coverage. Done sends no message and records no interaction
automatically; required task history/audit remains.

**P15.** Generic manual Done before native admission never silently suppresses
required work. Qualified exact prior-work reconciliation retains attribution,
original action time and later source lineage; title matching is insufficient.

**P16.** Concurrent manual/native creation in both orders, double click and lost
response preserve one proved same intended effect, while distinct intent survives.
Same-command retry resolves the original receipt without consuming later gifts.

**P17.** D20 G1/G2 handling leaves new G3 unhandled; selected material changes
require refresh, unrelated additions do not; hidden residue is not exposed.

**P18.** P13 correction, independently changed P14 recognition and P16 terms can
each invalidate relevant evidence; source truth persists and stale admission fails.

**P19.** Source-only withdrawal preserves independent promised work and real
interaction. Qualified restoration of originally live unconsumed work uses retained
lineage; consumed work stays consumed.

**P20.** Historical import, criterion/policy changes, delayed event, duplicate
webhook/job and restore do not turn historical acquisition into new live work.
Delayed originally live qualification remains distinguishable and recoverable.

**P21.** Gift read access alone grants no recipient/send/coach/AI/export/calendar
rights. Current tasks and history never expose staff-only financial ratings or
restricted recognition, source or missionary information.

**P22.** Optional workflow/AI/import paths cannot re-create the declined unusual-
giving purpose, while separately authorized staff analysis and source operations
remain functional under their own contracts.

**P23.** Crash before/after source acceptance, audit failure, task materialization
failure and lost UI response produce correct durable state and bounded replay;
no finance rollback, duplicate effect or false successful-send claim occurs.

**P24.** Keyboard/screen-reader/touch/reflow journeys support reading context,
Add/Open, Save, unknown/error recovery and correct focus/status. No hover-only
primary action or disappearing-toast-only outcome; ordinary manual tasks work
when unrelated history is unavailable and their own validation succeeds.

**P25.** Retained inferred tasks lose only unsupported automatic reasons, without
false human Done or deletion of promises/history. Unknown provenance is safely
reviewed by the owning team. Replay/rollback does not resurrect the classifier.

**P26.** Real indexed query plans and approved production-shaped profiles show
bounded exact resolution, paginated truthful history, no repeated full-history
negative checks, no cross-tenant cached result and no false claim from capped data.

**P27.** Mixed versions and every current writer are reconciled: the old browser
writer and privileged generic paths cannot overwrite generated provenance or
bypass source commands. Controls disable affected admission without corrupting
accepted work or disabling unrelated manual/qualified work.

**P28.** The actual UI is validated with at least six representative participants:
two new support raisers, two established missionaries and two staff/support users,
including at least two overlapping mobile/low-bandwidth or accessibility-use cases.
All must correctly explain no automatic task versus no action needed and Done
versus communication; each must complete Add/Open without moderator rescue.
Any critical misunderstanding or inaccessible required path blocks release of
that journey, is corrected, and is retested with fresh comparable participants.
This is an initial qualitative release target, not a statistical benefit claim.

## Ruthless synthesis: order, dependencies and ownership

1. **Before recording this review's outcome:** settle the semantic boundary and
   counterexamples, distinguish qualified derivations from flags, preserve native
   obligations and D19/D20, and document selection versus ratification. This review
   does that. It records the unresolved native-criterion meaning explicitly rather
   than choosing it by implication. At review completion the founder had selected A; its amendments were
   proposed. The subsequent explicit ratification is recorded below.
2. **Capture in later authorized spec/design:** P28 C01–C05/C08–C15 and the exact
   missing special-gift criterion; P9/ADR-0183 manual/native coordination; financial
   source evidence/currentness; P12 reached rights; truthful UI states. Reuse
   existing governed contracts. The [owner-destination map](d21-evidence/owner-boundaries.md#exact-later-amendment-destinations)
   identifies precise seams. No broad ADR rewrite, new platform or upstream phase
   dependency is invented.
3. **Before implementing/activating affected behavior:** qualify the source
   predicate and reached commands, then writer/grant inventory and C06–C07/C17.
   Build the small Add/Open/history journey on those contracts. Implement exact
   task/receipt recovery and retained-data correction; source posting remains
   independent of task availability. Required P12/source gates are scoped to the
   affected operation, not excuses to block unrelated native features indefinitely.
4. **Before release:** execute P01–P28 against real reached owners/roles and actual
   UI; prove both rejected inference and retained useful work. Retain exact
   implementation/test/release references. No tickets or release claim are created
   by this grill session. Qualitative and load targets are design judgments until
   validated, and no load number is asserted here without an approved profile.
5. **After release:** monitor only residual operational signals below. Correctness,
   authority and accessibility failures remain release blockers, not risks accepted
   by monitoring. Existing owner repair remains the response; no manual SQL cleanup
   becomes normal product operation.

| Signal                                                                                                                              | Initial threshold                                                         | Accountable role                              | Response                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Confirmed automatic unusual/special attention whose only deciding basis is historical comparison                                    | **Any one** confirmed effect                                              | P28/task owning engineer and product owner    | Stop affected admission path, inspect lineage, withdraw only unsupported generated reasons and preserve human/financial history; repair and requalify before re-enabling.                   |
| Cross-scope/hidden-data disclosure or forged source/coverage acceptance                                                             | **Any one** confirmed occurrence                                          | Security/P12 owner with affected source owner | Disable affected route/derivative, follow incident process, contain disclosure and qualify rights before restoring it; never merely alert and continue.                                     |
| Admitted source intent fails bounded retry/dead-letters, or manual same-command receipt remains unreconciled after retry exhaustion | **Any one** exhausted item                                                | Shared-task operations owner                  | Reconcile exact durable effect and current authority through owner command; surface actionable status. Time thresholds inherit the approved task runtime SLO, not an invented D21 duration. |
| Duplicate tasks for one proved same intended effect, or missed required work due to unsupported coverage                            | **Any one** confirmed case                                                | Shared-task owner with P28 product owner      | Inspect receipts/provenance; repair through qualified owner without merging distinct promises or erasing history; add the actual case to regression evidence.                               |
| Confirmed user interprets no task as no follow-up needed, or Done as message sent                                                   | **Any one** reproducible report                                           | Missionary experience design owner            | Reproduce the exact journey, correct misleading copy/state/action, and run targeted comprehension/accessibility checks before broader rollout of that change.                               |
| Reached query/API violates its approved shared-task/history latency or error budget                                                 | Existing approved SLO alert threshold; **no D21-specific capacity claim** | Runtime/database owner                        | Inspect exact tenant-scoped plan and contention; bound or repair the expensive path without weakening permissions or replacing unknowns with zeros.                                         |

Before release, map each accountable role to the actual responsible person and
verify operational routing. Existing SLO and retry ceilings must be known in the
release evidence; absent definitions block that operational qualification rather
than silently meaning unlimited retries or no monitoring.

## Proof performed and honest limits

- Primary technical and comparable-product sources were inspected with dates and
  limitations recorded in the six workstream notes. No authenticated competitor
  test, missionary/staff interview or usability experiment occurred.
- [Eighteen finite counterexamples](d21-evidence/decision-counterexamples.md#executed-counterexamples-and-limits)
  were reproduced. These demonstrate ambiguity/contradiction in named shortcuts;
  several are deliberately constructed examples, not empirical distributions or
  tests of the proposed Core implementation.
- The retained [D20 PostgreSQL probe](d20-evidence/postgres-probe/README.md) recorded
  **38/38 outcomes and nine observed concurrent lock races** on isolated PostgreSQL
  17.11. Its artifact hashes were rechecked, not rerun. It seeds eligibility,
  provenance and authorization; it proves no real D21 criterion, Core/P12 producer,
  hosted Supabase, conditional Undo, complete source lifecycle, UI or capacity.
  No new near-identical database fixture was warranted for this semantic choice.
- Current code was statically traced. No application test was claimed; the earlier D19
  attempted suite failed during Sentry package collection before tests ran,
  and that unchanged failure was not pointlessly repeated here.
- [Documentation verification](d21-evidence/review-verification.json) records
  links, clause/category/proof coverage, selection status, unchanged founder brief,
  retained prior evidence and the independent semantic rerun. These are documentation
  and provenance checks, not runtime certification.

There is no new implementation, schema, dependency, owner/ADR/OpenSpec mutation,
provider operation, live database query, ticket or external communication. The
finished result is a ratified decision contract and review ready for later
formalization—not a claim that the corresponding product has shipped.

## Subsequent explicit ratification

On October 17, 2026 UTC, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”**

This explicitly ratifies the corrected D21 decision and C01–C20/P01–P28 as future
requirements. Automatic history-comparison-only unusual/special attention is
excluded across equivalent outputs; factual history, independently qualified native
work and deliberate manual follow-up remain. Source meaning, current permissions,
existing-owner coordination, honest UX, correction and evidence boundaries are
retained. Initial qualitative recruitment and monitoring targets are ratified design
judgments, not measured user benefit or production performance.

The missing exact native criterion remains explicit. Ratification selects no
amount threshold, new special flag, financial classification or additional access.
The 18/18 finite counterexamples and retained D20 38/38 PostgreSQL outcomes/nine
races keep their stated limits; no implementation, actual source/P12, hosted
Supabase, user, accessibility or capacity qualification follows. Initial verification
is preserved separately. No application/schema, formal owner/ADR/OpenSpec,
dependency, provider operation, ticket or external contact changed. The founder
brief remains unchanged.

The next researched choice is [Q22: amount-based native follow-up](phase28-q22-amount-based-gift-follow-up-research.md).
It asks whether an organization-selected fixed amount may independently qualify
personal follow-up, distinct from comparing a supporter with their past giving.
It does not assume the answer or reopen D21.
