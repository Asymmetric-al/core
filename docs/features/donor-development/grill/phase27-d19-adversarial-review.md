# Phase 27 D19 — no current stage after a deliberate list change

2026-10-10 UTC. **Reviewed D19 explicitly ratified; disposition: Accept.** Review against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`, current source and the accepted/ratified
D1–D18 decisions. Research and interview only: no formal PRD/OpenSpec, ticket,
product implementation, activation or practitioner-study claim.

The founder subsequently instructed, “Yes, ratify this amended D19.” The exact
reviewed decision and safeguards below are explicitly ratified on 2026-10-10,
without substantive change. [Q20](phase27-q20-clearing-current-stage.md) subsequently
selected A; [D20](phase27-d20-current-stage-clearing-review.md) separately permits
deliberate absence without changing lists. The exact D19 decision remains unchanged.

## Exact decision recorded

> **D19 — Allow “Not yet assessed” when changing lists.** When an authorized person
> deliberately changes existing partnership work to another currently eligible
> approved stage list, they may choose an appropriate eligible stage on that list,
> or save with no current stage on that list. Show the intended result clearly
> before the ordinary deliberate save. Do not require a guessed assessment, a
> second acknowledgment or an explanatory narrative.
>
> “Not yet assessed” describes the absence of a current stage on the destination
> list. It does not mean the partnership has never been assessed. Preserve earlier
> list choices and assessments in lawful, authorized history, including when
> returning to a previously used list. Do not carry, match or restore an earlier
> stage automatically, and do not turn absence into an organization-defined stage.
>
> Accept the actual destination and its selected stage or intentional absence
> coherently on the same partnership, with the required history and result.
> Missing input, unavailable information, lost permission and conflicting edits
> are not intentional absence. Preserve current scope, responsibility, normal
> next work, contact restrictions and all other owners' facts.
>
> When saved without a stage, show the current list and “Not yet assessed,” with a clear
> **Set stage** action where authorized. Keep the partnership visible in its
> ordinary permitted work views. A later assessment records the actual choice
> and time. This creates no new assessment deadline, task, approval, donor message
> or automatic workflow activation.
>
> This decision applies to an actual change to another list under D18. It does
> not authorize clearing a saved stage while remaining on the same list,
> rewriting historical assessments, or silently changing work on reuse/reopening.

**Final disposition: Accept.** The selected A supplies the missing D18
stage-outcome policy. The founder has now explicitly ratified the reviewed decision.
The safeguards above apply inherited source/history/permission
rules; they add no material new product choice. The strongest alternative is B,
requiring a destination stage before saving: it gives complete current categorization
but can force guessing or delay a legitimate process change. Neither comparative
CRM convention nor tenant flexibility overrides the founder's selected optionality.
A tenant setting that silently requires a stage would reverse this decision.

## Evidence and current reality

| Evidence                                         | What it establishes and does not establish                                                                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Owner contracts](d19-evidence/ownership.md)     | Governing ADR/OpenSpec/phase boundaries; D13 versus D18/D19; source, work, workflow and reporting meaning. Intended contracts, not activation.                  |
| [Authorization](d19-evidence/authorization.md)   | P12 context and disclosure, null-sensitive schema/policy hazards and all mutation paths. No live Supabase inspection or production-role proof.                  |
| [Implementation](d19-evidence/implementation.md) | Current code, relational and command mechanics, bounded new PostgreSQL experiment with retained provenance. No P27 implementation qualification.                |
| [UX](d19-evidence/ux.md)                         | Actual shared controls, accessible clear interaction, primary guidance and bounded component evidence. No completed end-to-end browser or missions-staff study. |
| [Comparable practice](d19-evidence/practice.md)  | Official external examples, strongest alternative, applicability and limits. No invented missions workflow, preference survey or conversion-rate claim.         |

**Repository facts and intent.** ADR-0001 makes Asym Postgres the CRM authority.
P27 owns cultivation; P28 reuses its source model. P9 owns Party/assignment/shared
work; P12 owns permission and protected projections. D13 already accepts genuine
stage absence on initial work; D18 expressly reserves the current-stage result of
changing a saved list. This answer settles that reservation. D9 still preserves
the authoritative current stage state on reopening, including known absence under
D13/D19; it does not retrieve the latest historical non-null assessment. D15 still distinguishes retained use of a
withdrawn list from eligibility to attach to it again. D17's usual starting list
is not a saved-stage default.

**Current behavior.** Bounded source inspection has not identified a qualified P27
saved-list command. Existing donor status editors and generic list/grid controls
handle different subjects. An unmatched selected value can appear as a placeholder;
a form adapter can ignore a null select callback. Neither behavior proves deliberate
no-stage selection. Existing role helpers and migration policies are not proof of
P12 capability or protected-field authorization for this operation. These are
current implementation gaps, not findings of an exploited production P27 defect.

**Primary facts.** PostgreSQL's [composite foreign-key rules](https://www.postgresql.org/docs/17/ddl-constraints.html)
allow a nullable component to skip a `MATCH SIMPLE` reference check. Consequently,
the required tenant/source/list relationship must remain independently constrained.
Its [aggregate rules](https://www.postgresql.org/docs/17/functions-aggregate.html)
distinguish counting rows from counting non-null stage values; absence can disappear
from careless portfolio reports. [Null comparisons](https://www.postgresql.org/docs/17/functions-comparison.html)
also require deliberate treatment. Current official Blackbaud guidance permits an
uncertain opportunity status to remain blank, while MPDX includes no-status contacts
in its active list; neither establishes this exact list-switch workflow. Salesforce
requires Opportunity Stage in its financial forecasting model, a credible alternative
with a different domain purpose. Exact URLs, dates and limits are in the practice
appendix. [WCAG labels and instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
require understandable input purpose and instructions, not another acknowledgment
checkbox. External practices are evaluated in the appendices, not adopted wholesale.

**Product judgment and unknowns.** Staff may know which process fits before knowing
its appropriate stage. That is a reasonable possibility supported by the selected
flexibility, not measured agency frequency. No claim is made that every mission
organization works this way. There is no verified usability success rate, production
latency, stage/list-count ceiling, live policy result or actual migration census.
These are qualification needs for implementation, not reasons to invent a more
restrictive product answer. No new architectural decision record is necessary:
this is a bounded domain policy within existing ownership and optional-assessment
architecture.

## Minimum sufficient solution and source invariants

The permanent solution is one optional current stage on the existing source-owned
binding, plus the history already required for deliberate changes. No shadow
unassessed enrollment, fake stage, separate assessment workflow, per-list snapshot
restoration engine or duplicate partnership is needed. Keeping the current list
is always the no-write alternative; organization-wide stage customization remains
an alternative when the process itself needs adjustment. Neither substitutes for
the chosen ability to change one partnership's process honestly.

| Authoritative fact                                | Owner and invariant                                                                                                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Journey identity, ministry and continuing purpose | Existing P27/P9 source relationship; list change does not alter these or create another enrollment. D3's exact lifetime/collision policy is not settled by this review.                    |
| Current list and optional stage                   | One P27 current binding. Required list remains valid in the exact source scope; a present stage belongs to that list. Absence is a current fact, not a catalogue item or authority bypass. |
| Organization list/stage definitions               | Source-approved configuration under D10/D14–D17; stable identity, current new-attachment eligibility and independently authorized read/use. Display order and names are not equivalence.   |
| Accepted change and prior assessments             | Source-owned durable lawful history. Preserve actual old/new meanings, trusted attribution, ordering and acceptance time. A mutable label or current projection cannot rewrite history.    |
| Work and reminders                                | Existing next-task-or-owned-exception and P9/shared-work contracts. No independent assessment cadence or reset.                                                                            |
| Giving, commitments, contact permission, access   | Their existing owners. Neither list nor stage absence changes these facts. No money field or currency operation is introduced.                                                             |
| Views, filters, counts, exports and receipts      | Authorized projections. Receipts describe an accepted operation; current state is read separately when it has changed. These are not write authorities.                                    |

At every committed state: exactly one current list for this work, zero or one
current stage belonging to that list, unchanged partnership identity/scope, and
no accepted change lacking its required durable history/result. No required key
becomes optional merely because stage is optional. History is retained under the
owner's privacy/retention rules, not an unlimited-personal-data exception.

## State, time and edge cases

| Situation                                                      | Required outcome                                                                                                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Assessed A → eligible B, no target stage chosen                | A's actual assessment stays in history; accepted B has no current stage. This is a list change, not a new assessment.                                                                |
| Already unassessed A → eligible B, no target stage             | Preserve genuine absence and list history; no repeated acknowledgment or invented assessment event.                                                                                  |
| A → eligible B with an eligible B stage                        | Accept coherent B/stage together with actual history. No intermediate guessed stage or invented progression.                                                                         |
| Accepted A → B → A, now choosing no stage                      | A is a fresh attachment requiring current eligibility. Preserve earlier A/B assessments; restore none automatically. Cycles are not forbidden.                                       |
| Unsaved draft selects B, then returns to current A             | Do not accidentally clear A's saved stage. Treat the list change as canceled/no change; show current A state. A separate same-list stage edit remains governed by its own operation. |
| Another person changed list/stage after the form opened        | Do not convert stale intent into a same-list clear or overwrite. Explain a conflict using permitted current context and preserve recoverable input for deliberate review.            |
| Target stage is retired before save                            | Reject that now-invalid selection; never fall back silently to no stage. Offer current permitted choices, including deliberate absence for a valid different-list change.            |
| Target list is withdrawn before save                           | No-stage does not bypass target eligibility. Revalidate at acceptance; preserve source on failure.                                                                                   |
| Source list is withdrawn or stage retired                      | Historical/retained state is real, not missing. D15 governs retained use; authorized departure may target an eligible list without rewriting that history.                           |
| Target definition missing, unauthorized, unloaded or failed    | Never present these as a known empty assessment or infer an eligible target from an empty option page.                                                                               |
| Destination has no valid stage catalogue under its owner rules | Optional assessment does not make an otherwise-invalid list eligible. Repair configuration under its existing authority.                                                             |
| Retry after lost response; later staff work already exists     | Recover the original operation's permitted receipt; never reapply it over newer work. Distinguish that receipt from current state.                                                   |
| Paused/closed work, bulk change or cross-scope move            | D19 adds no authorization for these reserved D18 branches. Unsupported operations must not be exposed. This review does not silently select their policies.                          |
| Close and reopen after an accepted no-stage list change        | Preserve authoritative current absence; do not restore the latest historical non-null stage. This does not authorize changing lists while closed.                                    |
| No current stage, but prior assessed history                   | Current state says “Not yet assessed”; brief helper explains no current stage on this list. Historical assessment remains separately visible only where permitted.                   |
| Later stage chosen after an unassessed interval                | Record the real accepted assessment; do not backdate it to the list change or count the unassessed interval as time in that stage.                                                   |

Time of source acceptance is not the time a supporter acted. List-change time is
not last-contact time, and absence is not a fresh assessment timestamp. Where
historical durations are supported, their owner must distinguish prior stage
intervals, the no-current-stage interval and later stage entry. D19 does not select
P33 conversion formulas, a new assessment-age SLA or business-calendar behavior.
Localize displayed times without reinterpreting source ordering.

## Concrete UX/UI contract

Use the shared CRM record shell and exact `@asym/ui`, Base UI, **base-maia** design
language. A narrow form/sheet can do the job; do not introduce another visual
system, personal pipeline or migration wizard. The following is an interaction
specification, not a shipped or usability-tested screen.

```text
Change stage list

Current list: [permitted current list]
Current stage: [permitted current assessment or absence]

New stage list
[ Church partnerships                             ▾ ]

Stage on this list (optional)
[ Not yet assessed                                ▾ ]
No current stage will be recorded on this list.
You can choose a stage now or set one later.

Earlier assessments stay in history.

[ Cancel ]                              [ Save change ]
```

Only render current values/history details when independently permitted. Access
to the change action is not authority to reveal every old label. Supply the minimum
permitted consequence description needed for an informed action; when that cannot
be provided, explain the unavailable action without exposing hidden details.

- Make **Not yet assessed** a readable explicit outcome, distinguishable from
  “Choose…”, loading, unavailable data and an error. It is an application-facing
  option that represents absence, not a persisted organization stage or sentinel
  foreign key. A technical UI token, if needed, stays inside the adapter.
- For a genuine different-list proposal, do not silently reuse the old stage,
  select the first destination stage, match equal names or revive historical
  assessments. A plainly shown no-stage outcome plus ordinary Save expresses
  deliberate intent; no extra checkbox, reason or forced dropdown interaction is
  needed. D19 chooses optionality, not a new stage recommendation/default engine.
- Choosing an eligible stage replaces that proposed outcome visibly. Before
  saving, staff can choose **Not yet assessed** again within the same different-list
  proposal. Do not accidentally broaden this into clearing the current saved
  stage without a list change. Changing the draft destination invalidates
  incompatible draft stages without hiding what will be saved.
- If a real organization stage is also named **Not yet assessed**, distinguish it
  from the system **No current stage** outcome through visible context and accessible
  names. Do not reserve names, require renaming or present raw IDs as the remedy.
- Keep list and stage visible together. Present guidance when useful without
  making it a gate. With long labels or many choices, support accessible search
  and sufficient permitted context; do not manufacture short truncated identities.
- Save only when the proposed operation is sufficiently resolved and valid.
  A failed optional stage-options read alone must not block an independently valid,
  clearly intended no-stage proposal. Keep that error separate; do not infer target
  eligibility from failure or replace a selected stage with absence.
  During save, show pending state and prevent accidental duplicate action while
  the source still handles retries. Success follows authoritative acceptance;
  a closed editor or optimistic placeholder is not evidence of success.
- When accepted without a stage: show **Stage list: Church partnerships**; **Stage: Not yet
  assessed**; brief helper **“No current stage is recorded on this list.”**; and
  **Set stage** where authorized. Keep the existing owner and next action clear.
  When a stage was chosen, show that accepted stage instead.
  If history is available, make it reachable without putting old/current stages
  in one ambiguous badge. A later actual assessment uses normal **Change stage**.
- Cancel before submission leaves saved state untouched. A lost response shows
  a truthful “Checking whether your change was saved” or recoverable uncertain
  result. Canceling a request after submission does not promise server rollback.
  A stale/configuration conflict preserves recoverable choices and explains the
  next valid action; it never silently substitutes absence.
- Error text is attached to the relevant control and summary as appropriate;
  focus returns logically. Announce pending/result/error status, support keyboard
  operation and screen-reader names, and never rely only on color, hover or drag.
  Verify the shared 44px target convention, mobile reflow and zoom; do not confuse
  that convention with WCAG's distinct minimum-size rules and exceptions.
- Long international names and translated labels must remain distinguishable;
  logical placement must support localization and RTL where Core supports it.
  No name/address re-entry is required. Low bandwidth preserves the visible draft
  and reliable recovery; D19 introduces no offline write queue. Donor/public
  surfaces receive no new internal-stage disclosure or contact step.

“Beautiful” is judged through coherent spacing, typography, semantic colors,
visible hierarchy and a quiet, clear next action in the existing design system.
It is not established by a text mockup. Representative staff/missionary usability,
keyboard/screen-reader and mobile qualification remain release evidence.

## Exact requirements for the developing specification

These are research decision requirements to carry into the canonical owner package
when `/to-prd` is invoked. They are not prematurely created OpenSpec or tickets.

**R01 — Scope and meaning.** The source MUST permit deliberate D18 changes to an
eligible different list with either an eligible destination stage or genuine no
current stage. Absence MUST mean only no current stage on that binding, never
never-assessed, inactive, unsupported, hidden or no responsibility. The operation
MUST preserve journey/Party/ministry/purpose/source scope and earlier lawful history.
A setting MUST NOT silently make assessment mandatory for this supported operation.

**R02 — Authority at every boundary.** Every read, preview, mutation, retry result,
history, count, export and notification MUST obey current P12 source/context,
capability, field and existence rules. Validate both the current row and proposed
state. Tenant, actor, audit time and attribution MUST come from trusted context;
caller-selected target references require authorization/validation. Null stage
MUST NOT widen tenant/scope predicates, bypass list use authority or grant access.
Effective grants/RLS `USING`/`WITH CHECK`, views, functions/RPCs and service paths
MUST preserve the same boundary; omission/inheritance of policy expressions is
not proof without actual-role negative tests. Definer functions require hardened
search path and narrow execution grants. No public/anonymous fallback is permitted.

**R03 — Complete deliberate intent.** The submitted operation MUST unambiguously
identify the destination and either a stage or intentional absence. Omitted,
malformed, incompatible or unreadable stage data MUST NOT normalize to absence.
A required nullable field or tagged choice is sufficient; do not require a new
persisted assessment-state machine. Resolve intent against the authoritative
current binding and revision, not caller-supplied previous IDs. A now-same-list
request MUST NOT clear a saved stage. Choosing the same current list is no list
change. No stage mapping by text, order or earlier use is allowed.

**R04 — Relational integrity.** Keep tenant, required source keys and list binding
non-null and independently valid. Enforce a present stage's membership in that
same source/list through tenant-aware relationships. A nullable composite FK alone
MUST NOT substitute for the required list relationship. Stable IDs are authoritative;
no fake stage ID, label enum or redundant writable assessedness flag is needed.
Deletion MUST NOT orphan current work or destroy required history; use the existing
retirement/retention contract and restrictive references or equivalent owner-safe
mechanism. Do not infer financial types, money fields or a new lifetime-uniqueness
rule from this choice. Exact physical names/indexes belong to validated design.

**R05 — Atomic acceptance, concurrency and replay.** The coherent binding, required
before/after history, source revision and durable operation result MUST succeed or
fail together; include durable required secondary-effect intent in that acceptance
boundary where its owner contract requires it. Concurrent stage/list edits and
configuration changes MUST produce a valid serial outcome or visible conflict,
never silent loss. Recheck current target eligibility within acceptance. Bind
idempotency to durable semantic intent, including absence versus a concrete stage;
a changed payload is not a replay. Repeated delivery creates no duplicate history.
An old receipt MUST NOT reapply or overwrite newer state. No transaction stays open
while a person considers the form; qualify bounded retries and lock ordering.

**R06 — Clear, minimal interaction.** Show the permitted current context and exact
proposed list/stage-or-absence before one deliberate Save. Label the optional stage
and genuine absence, provide eligible stage choice, Cancel, truthful pending/result
and recoverable errors, then an obvious authorized Set stage. No mandatory reason,
extra approval, extra acknowledgment or repeated input for already-unassessed work
is introduced. Distinguish the system no-current-stage outcome from a real tenant
stage with the same name, visibly and accessibly. A failed optional choices read
MUST NOT block an otherwise independently validated, clearly intended no-stage
change; it cannot establish target eligibility or erase an explicit choice.
Reverting an unsaved target to the current list MUST NOT cause a
same-list clear. Preserve the shared UI system and qualify accessibility/mobile/
localization/low-bandwidth behavior on real reached paths.

**R07 — Read and reporting semantics.** APIs, views, boards, filters, totals and
exports MUST distinguish source-known no-current-stage from hidden, unresolved,
failed, retired and not-yet-loaded data. Preserve valid no-stage work in ordinary
permitted views. Counts MUST state their authorized population and coverage; no
inner join, `count(stage_id)`, null inequality, missing option page or presentation
fallback may silently omit or misclassify work. Unknown/restricted aggregate
coverage MUST NOT be presented as zero or disclose concealed records. Where all
assessments are authorized, assessed plus unassessed counts reconcile to the same
population; otherwise do not assert that complete partition. Supported historical
measures MUST NOT credit the no-stage interval to a real stage or invent progress.

**R08 — Historical and temporal truth.** Preserve actual previous and accepted
list/stage-or-absence meanings with trusted actor, acceptance time and sequence.
A no-stage list change MUST NOT record a new stage assessment, first-time status,
contact, supporter response or backdated stage entry. Returning to an earlier list
restores no earlier assessment automatically. A later stage assignment records its
actual accepted choice/time. Closing/reopening preserves authoritative current
stage or known absence; never restore a historical non-null value as a fallback. Qualify historical label retention/versioning and
lawful redaction; append corrections through the existing source contract instead
of rewriting accepted history. Event names/payloads MUST distinguish list change
and actual assessment for consumers without creating a second truth store.

**R09 — Other owners and effects.** Keep responsibility, next-task-or-owned-exception,
review dates, native attention, contact restrictions, consent, financial facts,
assignments and permissions intact merely because assessment is absent. Any genuine
change in work applicability needs its actual source owner’s qualified disposition;
unrelated tasks are not a blanket blocker or a new dependency wizard. No new assessment task/deadline/contact or
independent enrollment/reopening/DON-14 activation follows from absence. Inventory
actual native/configurable effects; only owner-qualified accepted occurrences may
cause them, with durable effect identity and reconciliation. Unknown source state
blocks dependent action, not silently downgrades it to unassessed. Core remains
usable without optional Workflow Studio.

**R10 — Bounded reads and measured performance.** Use one current binding, bounded
choice/history reads and source-scoped access paths. Validate indexes and query
plans for actual tenant, list, null-stage, authorization and history predicates;
PostgreSQL does not automatically index every referencing FK. Avoid scanning all
history or all tenant rows to render one change form. Before release, record the
representative cohort sizes, concurrency, query plans and measured latency against
the owning surface's agreed budget. No new numerical capacity or latency claim is
accepted without measurement; do not add a cache/service merely because null exists.

**R11 — Integrations and projections.** Source commands remain the only business
write authority. A full snapshot's known absent stage and a partial update's
omitted/unavailable field MUST remain distinguishable through serialization,
imports, event schemas, export and restore. A mismatch MUST be reconciled or
rejected, never mapped to a first stage. Imported historical facts use their
qualified import path; this operation does not backdate them. Out-of-order events
must not restore an earlier projection over a newer source version. Providers own
their delivery receipts; Core owns the accepted partnership result. Do not restore
Twenty, introduce bidirectional vendor stage ownership or copy vendor automations.

**R12 — Migration and rollout.** Census reached data and consumers before changing
schema/semantics. Never backfill a guessed assessment or infer intentional absence
from failed reads. Expand compatible readers/serializers first; fence incompatible
writers; qualify source command, real policies, projections and UI together before
enabling saved-list changes. A kill switch stops new changes while preserving
lawful reads, receipts and correction support. After new no-stage results exist,
rollback MUST NOT reinstall a mandatory-stage consumer or destructive backfill;
use compatible roll-forward repair. Restore/export/mixed-version tests are required
for reached paths, not a mandate for a new universal migration framework.

**R13 — Simplicity and supported lifecycle.** Reuse optional current stage, existing
source history, permissions, work and shared controls. Do not add a placeholder
catalogue stage, dual assessedness state, mapping engine, per-list assessment
revival, routine approval, reason taxonomy or separate review queue. Same-list
clearing, paused/closed switching, bulk operations, cross-scope movement and
historical rewriting are not selected by D19. Keep unsupported paths unavailable;
settle any such policy before exposing that path, without claiming D19 decides it.

**R14 — Falsifiable proof and traceability.** Carry this decision and AC01–AC24
through the glossary and session log into the canonical PRD/design/OpenSpec/tasks,
then authorized tickets, implementation and exact release evidence. Preserve D18
ratification and label its former stage-policy gap as settled specifically by D19.
Use actual source services, non-owner database roles and real interfaces for release
proof. Synthetic SQL and jsdom tests establish only their recorded seams, never
actual RLS, usability, production performance or deployed feature existence.

**R15 — Diagnosis and correction.** Staff history must explain the accepted list
change and current absence where permitted; technical logs alone are insufficient.
Record minimal operation/source version/result/error references for diagnosis,
without unrestricted list/ministry/person names or arbitrary free text. Recovery
uses exact receipts and source-owned operations, not routine direct SQL repair.
Maintain the monitoring ownership/threshold/response below. Treat a discovered
invariant or disclosure breach as a correctness issue, not an acceptable monitor-only
risk. Retention, anonymization, backup and export follow their owning contracts.

## Full category review

All severity/likelihood assessments are prospective judgments, not measured incident
rates. Each category independently states whether a material concern exists. An
exact R reference above supplies the required spec text; AC references below provide
falsifiable proof. “Narrows” below tightens execution of A without changing its
selected optionality.

| Category                                                         | Material concern, consequence and evidence                                                                                                                                                                                                                                                                                              | Severity / likelihood; effect on A; permanent prevention                                                                                                                                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** Requiring an assessment can produce guessed stages or block a suitable list change; optionality without accountability can hide unfinished work. Q19, D13/D18 and comparative evidence establish the actual policy fork, not measured demand. B offers complete categorization; keep-current-list is the no-write alternative. | **Medium / plausible. Accept, scoped:** record honest current absence while keeping normal responsibility/work. No new workflow subsystem. R01/R09/R13; AC01/02/18.                                                               |
| 2. Brittleness                                                   | **Yes.** Equal names, cached selections, missing option pages and defaults can be mistaken for compatible stage state. Actual selector behavior and D10/D15/D17 show these are unsafe assumptions when definitions or access change.                                                                                                    | **High / likely if generic editors are copied. Narrows:** stable IDs, distinct unresolved state, full semantic intent and current validation. R03/R06/R07; AC03–06/11/14.                                                         |
| 3. Technical debt                                                | **Yes.** A fake unassessed stage, writable assessedness flag, staff/missionary divergence or copied list history creates redundant truth and later repair work. ADR-0001 and shared P27/P28 source ownership oppose this.                                                                                                               | **High / plausible. Preserves A:** one optional stage and shared source operation, protected history/read projections. R04/R08/R13; AC01/20/24.                                                                                   |
| 4. Edge cases                                                    | **Yes.** A→B→A may revive an obsolete assessment; canceled draft switching may clear A; an already-unassessed source may get pointless prompts; a retired target may silently become null. D13/D15/D18 delimit these realistic cases.                                                                                                   | **High / plausible. Narrows:** state matrix and actual-current-binding validation, no automatic restore/substitute, minimal ordinary save. R01/R03/R05/R06/R08; AC02–06/10/11.                                                    |
| 5. Footguns                                                      | **Yes.** Omitted JSON, a null callback, a generic patch or “Cancel” after submission may unintentionally clear state or falsely promise rollback. Actual UI adapters and command inspection show that optional form fields are insufficient.                                                                                            | **High / likely without explicit contract. Narrows:** explicit result choice, source command, truthful pending/recovery, no same-list clear. R03/R05/R06; AC04–10/21.                                                             |
| 6. Tenant safety                                                 | **Yes.** Null stage can skip a composite FK or become an OR predicate that bypasses tenant/source checks; caches/counts can mix or reveal scopes. PostgreSQL semantics and P12 apply even with globally unique IDs.                                                                                                                     | **Critical / plausible implementation error. Preserves:** independently required scope/list relationship and contextual authorization everywhere. R02/R04/R07; AC12–14/20.                                                        |
| 7. Database, RLS and authorization safety                        | **Yes.** Allowed current rows can be transformed into forbidden proposed bindings; owner/service roles can bypass policy; history may be orphaned. Null-safe input alone proves neither grants nor effective USING/WITH CHECK. P12 and PG/Supabase guidance are controlling evidence.                                                   | **Critical / plausible. Narrows:** composite membership plus required parent references, trusted attribution, narrow privileged paths, old/new validation and actual-role tests; no new money fields. R02–R05/R08; AC04–14/20/24. |
| 8. Overengineering                                               | **Yes.** Another queue, required explanation, nullable-state microservice, mapping/version restoration engine or tenant “require stage” override adds cost and can contradict A. Existing work/history and optional-stage decisions already solve the need.                                                                             | **Medium / plausible. Preserves:** reuse source state and one clear save; no speculative machinery or policy reversal. R01/R06/R09/R13; AC02/18/23.                                                                               |
| 9. UX/UI and user friction                                       | **Yes.** A placeholder can appear to mean “Not yet assessed” while submitting an old ID; the phrase can imply no prior assessment; invisible effects, long labels and poor focus can confuse staff. Real component evidence, WCAG and comparative form guidance support explicit meaning.                                               | **High / likely if unresolved states are collapsed. Narrows:** concrete UI contract, helper/current/history separation, Set stage, accessible localized mobile/pending recovery. R06/R07/R14; AC14/15/21–23.                      |
| 10. Source of truth, ownership and invariants                    | **Yes.** A current blank may be mistaken for deleted history or give reports authority to restore stages. D13/D18, ADR-0001 and phase boundaries separate current binding, accepted history and projections.                                                                                                                            | **High / plausible. Preserves:** required identity/list, optional coherent stage, atomic history/result, owner-qualified projections. R01/R04/R05/R07–R09; AC01/03/07/16–18.                                                      |
| 11. Hidden coupling                                              | **Yes.** List changes may reset next action, contact recency, owner, review date, money/access or trigger DON-14 by generic “updated” handling. Roadmap and disabled/unqualified DON-14 binding prohibit inferring these effects.                                                                                                       | **High / plausible. Narrows:** explicit event/effect inventory, unchanged independent obligations, no auto activation. R08/R09/R11; AC16–18/24.                                                                                   |
| 12. Failure modes                                                | **Yes.** List-only commit, history failure, lost response or failed secondary delivery can leave ambiguous success or duplicate effects. Existing source transaction/replay contracts and new mechanics checks address these independently of product defaults.                                                                         | **High / plausible. Preserves:** atomic durable acceptance, exact receipt recovery, required effect intent/reconciliation, safe UI conflict states. R05/R06/R09/R15; AC07–10/18/21.                                               |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** A stale A→B(null) after another accepted A→B(stage) can erase that assessment; ABA or old receipt can overwrite newer work; list-change time can become false assessment time. This is a durable business-effect race, not just duplicate HTTP delivery.                                                                       | **High / plausible under concurrent work. Narrows:** authoritative revision/current binding, explicit-null intent, one serial outcome, no receipt reapplication or historical restoration. R03/R05/R08; AC05/08–11/16.            |
| 14. Data integrity                                               | **Yes.** Inner joins, null comparisons, omitted serialized fields and placeholder fallbacks can silently lose no-stage records or fabricate assessments. PG aggregate/comparison rules and actual selector behavior establish concrete mechanisms.                                                                                      | **High / likely with ordinary non-null assumptions. Narrows:** qualified absent versus unknown states, complete source/list references, coherent read/report/import contracts. R03/R04/R07/R11; AC04/13/14/17/20.                 |
| 15. Security and privacy                                         | **Yes.** Old stage/list history or raw error/result/log payloads may reveal protected missionary/ministry context; absence can be inferred from hidden-field fallbacks. P12 governs each disclosure and lawful history separately.                                                                                                      | **Critical / plausible. Preserves:** minimal permitted effect/result, no hidden-to-null normalization, protected history/exports/logs/backups and owner retention. R02/R07/R08/R15; AC12–15/20/24.                                |
| 16. Scalability and performance                                  | **Yes.** Fetch-all catalogues/history or unindexed tenant/null-stage filters can degrade as tenant/history size grows. PG count/index behavior establishes the risk; no production-scale measurements exist.                                                                                                                            | **Medium / plausible as volume grows. Preserves:** bounded indexed current reads, measured real query plans and representative cohorts; no invented capacity/latency numbers. R10/R14; AC17/23/24.                                |
| 17. Operational burden                                           | **Yes.** Inconsistent nulls or ambiguous saves could require manual stage repair; orphaned assessment tasks add recurring cleanup. Existing source correction and normal next-work ownership offer a simpler permanent path.                                                                                                            | **Medium / plausible. Preserves:** routine Set stage, exact operation recovery, clear history, no dedicated assessment queue/direct SQL runbook dependency. R06/R09/R12/R15; AC08/15/18/20.                                       |
| 18. Observability and auditability                               | **Yes.** “Updated” or “never assessed” cannot explain what changed; overwritten labels or technical-only logs lose staff evidence; logs can overexpose it. Source history and P12 require separate business and diagnostic views.                                                                                                       | **High / plausible. Narrows:** actual before/after meaning, trusted sequence/time, current-versus-receipt separation and minimized correlation. R05/R08/R15; AC07/08/16/24.                                                       |
| 19. Dependency and integration risks                             | **Yes.** Component null handling, serialization defaults and sales-CRM required-stage rules can change semantics; external partial events may clear state. Installed-vs-documented UI versions and comparative product constraints require qualification.                                                                               | **High / plausible. Preserves:** explicit adapter/source intent, version-qualified tests, source-owned integration reconciliation; no provider authority. R03/R06/R11/R14; AC04/14/20–24.                                         |
| 20. Migration, rollout and upgrade risks                         | **Yes.** Old consumers may assume a stage, omit no-stage rows or fill the first stage; rollback can overwrite accepted absence/history. Current implementation gaps mean compatibility must be proved before exposure.                                                                                                                  | **High / plausible. Narrows:** consumer census, compatible schema/readers then writers, gated activation, no guessed backfill, safe kill switch/roll-forward. R12/R14; AC19/20/24.                                                |
| 21. Testability, traceability and proof                          | **Yes.** “May save without stage” alone omits deliberate intent, identity, concurrent state and absence meaning; toy success could be reported as live safety. Q19 and current code/evidence limits make precise outcome tests necessary.                                                                                               | **High / certain qualification gap before release. Narrows:** exact R01–R15, AC01–AC24, source-to-release trace and honest test limits. R14; AC01–24.                                                                             |
| 22. Other development hazards                                    | **No additional distinct material concern found.** Checked money precision, new public giving/checkout fields, name/address capture, new provider/billing/storage infrastructure and offline synchronization: D19 introduces none. Unsupported lifecycle/repair/rollback risks are already evaluated above, not ignored.                | No separate severity/likelihood assignment is justified without another mechanism. R09/R12/R13 prevent scope creep; no new subsystem or donor friction follows.                                                                   |

## Acceptance criteria and proof

These criteria describe required user/domain outcomes. A checked synthetic seam
below does not mark its broader product criterion implemented.

| ID   | Falsifiable outcome                                                                                                                                                                                                                                                                                                                       |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | Authorized assessed A → eligible B with intentional absence preserves identity/scope and accepted old assessment; current B has no stage and ordinary work remains visible.                                                                                                                                                               |
| AC02 | Already-unassessed A → B succeeds through the same clear Save with no extra acknowledgment, reason, assessment task or fabricated stage entry.                                                                                                                                                                                            |
| AC03 | A → B with a valid B stage accepts the pair; equal names/order cannot make an A stage a valid B stage.                                                                                                                                                                                                                                    |
| AC04 | Omitted, malformed, incompatible, hidden or unresolved stage input never becomes intentional absence. Explicit absence and explicit stage are valid distinguishable intent.                                                                                                                                                               |
| AC05 | Same-current-list selection, including an unsaved B-then-back-to-A draft, cannot clear A's saved stage. A stale A→B(null) after another A→B(stage) cannot clear B.                                                                                                                                                                        |
| AC06 | Accepted A→B→A with intentional absence requires current A eligibility, retains all actual prior assessments and restores none automatically.                                                                                                                                                                                             |
| AC07 | Inject failure between binding/history/result writes: no partial accepted result. An independent observer sees coherent committed states only.                                                                                                                                                                                            |
| AC08 | Lost response plus exact retry yields one accepted history/result; changed absence/stage payload fails. Old receipt after later work reports earlier acceptance without overwriting current work.                                                                                                                                         |
| AC09 | Concurrent stage edit/list change and competing list changes preserve one valid sequence or visible conflict; prove relevant orders on actual source boundary.                                                                                                                                                                            |
| AC10 | Revisions protect ABA and stale same-list transformations; repeat delivery cannot cause a second business effect even through another transport request.                                                                                                                                                                                  |
| AC11 | Target withdrawal/stage retirement or permission change between preparation and acceptance cannot yield an invalid result or silent no-stage fallback.                                                                                                                                                                                    |
| AC12 | Actual authenticated non-owner roles cannot cross tenant/source, mutate unauthorized work, forge actor/tenant/audit fields or gain access by choosing absence; test direct DML and reached privileged paths.                                                                                                                              |
| AC13 | With null stage, invalid/missing/cross-scope list references still fail; with present stage, wrong-list/stale reference fails. Deletion cannot orphan required current/history relationships.                                                                                                                                             |
| AC14 | A truthful no-stage display is distinguishable from loading, denied data, unavailable labels, retired actual stages, failed read and incomplete option coverage or a real same-named stage; no unseen stale value is submitted. An independent stage-options failure does not prevent an otherwise validated intentional no-stage change. |
| AC15 | Permitted current/history/result labels appear correctly; restricted details remain concealed in UI, API, history, errors, counts, exports and logs. Set stage is present only where permitted.                                                                                                                                           |
| AC16 | History identifies actual list change and stage-or-absence; no false assessment/contact/progress time; close/reopen preserves current absence rather than restoring historical non-null state. Later stage assignment preserves the unassessed interval and records real accepted time.                                                   |
| AC17 | Authorized mixed assessed/unassessed portfolio fixtures reconcile counts and pagination at exact boundaries; restricted/incomplete coverage is truthfully represented, and supported measures exclude fabricated stage duration.                                                                                                          |
| AC18 | List-change absence preserves owner/next work/review date/consent/financial facts and produces no independent task/contact/enrollment/activation. Qualified required effects survive retries/outages without duplication.                                                                                                                 |
| AC19 | Retained-data census/backfill can distinguish valid absence from unknown; no prior assessment or historical gap is fabricated.                                                                                                                                                                                                            |
| AC20 | Full snapshots, partial imports/events, export/restore and mixed-version clients preserve absent-versus-omitted semantics; disabled writes/rollback retain new no-stage data and lawful recovery.                                                                                                                                         |
| AC21 | Keyboard and screen reader can choose stage or explicit absence, understand current/proposed states, save/cancel and recover from pending/conflict/lost response without hidden changes or focus loss.                                                                                                                                    |
| AC22 | Real reached controls/adapters preserve explicit absence and stage choices through rerenders/refetch, target changes and server result; verify installed dependency versions, not only latest docs.                                                                                                                                       |
| AC23 | Representative staff/missionary pilot can explain current absence versus prior history, change a list without guessing, find Set stage, and recover from conflict on mobile/low bandwidth; measured layout and query budgets pass.                                                                                                        |
| AC24 | Decision, glossary, canonical requirements/design/tasks, authorized tickets, real tests and cohort release evidence agree on optionality, authority, history and supported lifecycle. No research artifact is presented as shipped proof.                                                                                                 |

## Executed evidence and independent challenge

**New PostgreSQL probe: 8/8 passed, first runtime attempt.** The
[isolated experiment](d19-evidence/no-stage-probe/README.md) ran PostgreSQL 17.11
at read committed, 16:24:55.984787–16:25:01.491395 UTC, using the pinned image in
its metadata. Cases covered the nullable composite-FK parent trap; explicit null
versus omitted/invalid intent; atomic binding/history/result and late fault rollback;
exact replay versus changed disposition; return without historical restoration;
a controlled competing assessment versus stale-absence switch; unavailable target;
and null-sensitive counts/joins/comparisons. The waiting backend and exact blocker
were observed, rather than inferred from a delay. The deliberately unsafe FK insert
is a successful counterexample, not a hidden failed test.

The fixture is owner-executed, synthetic and has no Core/P12 RLS, real actor/time
history contract, permissions, task/financial/workflow owners or user interface.
Its deliberate `40001` is revision rejection, not Serializable isolation. One
schedule is not exhaustive concurrency testing. It proves the named mechanics,
not that all requirements are implemented. Source/schema/test/runner hashes and
exact isolated-container cleanup are retained and independently checked.

**New actual shared-selector probe: 1/1 passed, first test run.** The
[unmocked Select test](d19-evidence/source-probe/README.md) shows that choosing a
rendered null-valued option emits null once and displays its label rather than a
generic placeholder. This proves an installed primitive capability; it does not
prove a P27 form, nullable higher-level form adapter, API serialization, database
write or user comprehension. The higher adapter still has string/null limitations.
Installed Node 24.19.0, Vitest 4.1.4, React 19.2.3, Base UI 1.8.0 and jsdom 26.1.0
are recorded; manifest/upstream differences are explicit. Bun was unavailable.
The scoped harness is not the full normal suite, CI or a real-browser/a11y test.
A metadata collection initially named a nonexistent source path; correcting that
file list did not change or rerun the passed test. Evidence hashes cover listed
inputs, not the full dependency tree.

Earlier D13/D16/D17/D18 experiments remain dated supporting evidence, were not
rerun here and are not counted in these new results. Root inspected all five
appendices, the new SQL schema/cases/runner and actual selector test. No live
Supabase project, real data or provider mutation was used.

**Independent adversarial synthesis:** a separate reviewer recommended Accept and
found four precision issues, now corrected: no-stage success copy applies only to
the no-stage path; optional option-loading failure is not itself an assessment gate;
reopening preserves current absence rather than restoring a historical non-null
stage; and a same-named real stage must be distinguishable from system absence.
These improve the selected behavior without imposing another founder decision.
A second read verified those corrections without another substantive finding.
No extra acknowledgment, guessed stage, automatic mapping or new task survived
synthesis.

[Pre-ratification review verification](d19-evidence/review-checks.json) records category,
requirement and acceptance coverage, document/status/glossary alignment, local links,
formatting, probe results/input hashes, exact container absence and preservation of
D18's ratified decision and evidence. It is documentation/evidence validation, not
product qualification. Current continuation pointers intentionally change; older
verification artifacts remain dated snapshots. The initial link check ran before
its own linked output file existed; that [initial result](d19-evidence/review-checks-initial.json)
is retained. The output now exists and is checked on the final pass. This ordering
issue changed no product decision or executed probe. The later
[ratification/Q20 verification](d19-ratification-q20-validation.json) checks the
updated continuation documents while preserving the exact decision and prior evidence.

## Synthesis, implementation order and monitoring

1. **Before recording the answer:** settle current absence meaning, its actual
   different-list scope, honest UI, old-history preservation and strongest B
   alternative. Check inherited contracts and primary evidence; pressure-test
   null/FK, input intent and actual control assumptions. Record A only after this
   review. No further founder permission is needed for inherited safeguards.
2. **Capture in the specification/design:** R01–R15 and AC01–AC24, glossary/session
   alignment, one coherent optional binding, no-stage versus unknown projection,
   exact source authorization/effects and compatible consumers. D19 specifically
   settles D18's stage-optionality dependency. It does not settle paused/closed,
   bulk, same-list clearing, historical or cross-scope policies; prohibit unselected
   paths and decide a branch before that branch is exposed. Do not create competing
   current canonical prose or a redundant ADR.
3. **Require in implementation:** actual schema/source command and all-path policy
   proof first; then history/receipts/projections and exact event/effect adapters;
   then shared accessible interface and routine recovery; then migration/restore
   and production-shaped qualification. Identity/access/work owner dependencies
   cannot be replaced by a generic grid update. Test source and UI as one feature.
4. **Before activation:** complete actual-role, concurrency, compatibility,
   accessibility and representative staff pilot gates. Define measured surface
   budgets from the real workload. Gate new writes until all reached consumers
   preserve absence. Keep lawful reads/history and repair available if disabled.
5. **Monitor only residual operation/UX signals below.** These are proposed
   ownership and response commitments for release, not monitors installed now.
   Correctness/privacy criteria are gates as well as zero-tolerance runtime signals.

| Signal                                                                                                   | Threshold                                                                                                                                  | Named owner                               | Response                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Accepted binding/history/result inconsistency, invalid scope/list pair, or duplicate accepted occurrence | Any confirmed instance                                                                                                                     | P27 source owner / on-call                | Stop affected writes, preserve receipts/evidence, diagnose and repair through source; requalify before enabling.                           |
| Unauthorized disclosure, hidden-as-unassessed classification or cross-tenant result                      | Any confirmed instance                                                                                                                     | P12 security owner with P27 owner         | Contain affected route/projection, follow incident procedure, correct policy and re-run actual-role negative proofs.                       |
| Portfolio reconciliation mismatch for the same fully authorized population and source version            | Any non-zero unexplained difference                                                                                                        | P33 reporting owner with P27 source owner | Mark affected measure unavailable; fix projection/null semantics and rebuild from source without altering assessments.                     |
| A required effect accepted but not reconciled, or an operation result persistently unresolved            | Beyond the existing owning effect/recovery contract's deadline; if none exists, that reached effect cannot be enabled until one is defined | Shared work/effect owner and P27 on-call  | Reconcile by durable intent, show owned exception, do not replay the business change or create duplicate work.                             |
| Confirmed staff confusion causing unintended no-stage save, lost draft, or inability to find Set stage   | Any reproduced user-impacting case in pilot/support                                                                                        | P27 product/design owner                  | Inspect the actual flow, correct wording/state/controls and re-run affected usability/accessibility scenarios; no automatic guessed stage. |
| Surface/query latency or error-budget violation                                                          | The explicit measured budget agreed for that surface before release                                                                        | API/UI performance owner                  | Inspect scoped query plans/cohort and regression, repair access path/rendering; no speculative cache or loosening authorization.           |

No monitor is proposed for “too many unassessed partnerships” or automatic aging
escalation: that would smuggle in a new required assessment policy. Normal next-work
attention already governs accountability.

## Seven adversarial questions

### What could go wrong with this answer?

A visible empty control could conceal an old value or turn missing input into data
loss. Null could bypass parent relationships, stale intent could clear another
person's assessment, and reports could drop valid work. R02–R08 address the actual
mechanisms; optionality alone is insufficient.

### What hidden assumptions are we making?

That staff sometimes know the appropriate process before its stage is a product
judgment, not measured frequency. That generic shared controls correctly handle
absence is an implementation assumption requiring actual-source tests. That all
prior labels can be shown is false under P12. No unsupported ministry convention
or production performance number is treated as fact.

### How does this affect the whole product?

It extends D13's honest absence to D18's changed saved binding. Shared staff and
missionary views must agree; reports/events distinguish current absence from past
assessments. Giving, public content, consent, work, access and financial ownership
remain governed by their own sources.

### How does this affect the end-user experience?

Staff can choose the suitable list without guessing a stage, see exactly what
will be saved, and find Set stage later. They keep ordinary follow-up and can
understand prior history. Clear failure/recovery states matter more than adding
confirmation steps. The design must still prove itself with real users/devices.

### Does this follow modern best practices?

Explicit optional values, source-owned atomic changes, truthful history and
accessible recoverable forms fit primary technical guidance. Sales systems that
require stages provide the strongest counterexample, not a universal missions
rule. Their automation/default policies are not imported into Asym.

### Does this fit Asym's existing repo and product direction?

Yes within its source/permission/shared-work boundaries and exact shared UI system.
Existing generic editors are not sufficient proof; a qualified source operation
and adapters remain necessary. No alternative CRM authority or redundant task
system is introduced.

### Should we adjust the recommendation?

Keep A. Make intentional current absence and its visibility precise, preserve
history, and prove all paths. Requiring a destination assessment or another
acknowledgment would add a policy the founder did not choose.
