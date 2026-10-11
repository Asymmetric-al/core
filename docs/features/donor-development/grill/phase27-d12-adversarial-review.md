# Phase 27 D12 — direct, truthful and understandable stage changes

2026-10-10. **D12 explicitly ratified; review disposition: Accept.** The founder
selected direct choice of the appropriate stage and explicitly required clear UX/UI
including edge cases. Research against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3` and the working D1–D11 decisions.
This is a decision review, not a formal PRD/OpenSpec, product implementation,
deployment qualification or authorization to contact donors.

The founder subsequently instructed, “ratify this amendment to this discission,”
and asked to continue the Phase 27 session. This explicitly ratifies the exact D12
decision and its reviewed safeguards on 2026-10-10. The review found no material
change to A; recording this confirmation does not add scope or reopen prior choices.

## Exact decision ratified

> **D12 — Choose the appropriate stage directly.** Where authorized to update a
> partnership's recorded stage, staff may choose any currently eligible stage in
> its approved preset, including skipping stages or returning to an earlier one.
> Organizations explain and customize their stages under D10/D11; they do not add
> mandatory sequences or restrictions on these ordinary stage moves. Eligibility
> continues to enforce the existing source scope, permissions and stage availability,
> not a hidden progression rule.
>
> Record only the actual accepted change. Preserve earlier lawful history; do not
> invent intermediate stages. A later return to a stage is a new recorded change,
> while choosing the unchanged stage or retrying the same accepted change creates
> no additional transition. A stage update does not undo earlier work, reopen the
> partnership, prove a supporter action or alter another domain's facts.
>
> Show the current stage, proposed choice and short stage meaning in the partnership's
> context. Offer one clear, accessible save with truthful pending, success, conflict
> and unconfirmed-outcome feedback. Do not present backward movement as failure,
> require an explanation, or force people through unused stages. Keep mandatory
> source safeguards and accountable next work intact.

These safeguards explain the choice already offered in [Q12](phase27-q12-stage-movement.md),
D10/D11 and the governing owners. They do not grant new powers, add an approval
step or select the remaining correction, initial-stage or preset-switch policies.
No material amendment or repeat ratification was required; explicit founder
ratification is now recorded above. The existing accepted
architecture covers this decision; a new ADR would duplicate it rather than
resolve a new cross-domain architectural tradeoff.

## What is established, and what is not

**Repository facts and intended behavior.** ADR-0001 makes Asym Postgres the CRM
authority. P27 owns the shared cultivation journey; P28 consumes it. P9 owns Party
identity and shared work, P12 authorization, P13 contributions, P14 recognition,
P16 commitments, and P6/17 communications. Other participation facts retain their
own authoritative relationship/purpose source. Stage is not
Party lifecycle, ask state, task state, consent or a workflow run. D10 makes order
presentation-only, D11 makes guidance advisory. None of these documents proves
the future P27 feature has shipped.

**Current implementation.** Inspected donor/status forms, board grouping, generic
table mutation and shared selectors provide useful UI or plumbing precedents.
They do not establish an authoritative P27 stage command. In particular, status
labels, a whole donor form, immediate selector close, a new HTTP request ID or a
whole-cache rollback are insufficient substitutes for stage identity, narrow
validation, accepted history, durable retry or concurrent-edit protection.

**External evidence.** Primary CRM documentation supports both direct stage
selection and optional movement restrictions. CMS workflow controls solve a
different publication/governance problem. Neither establishes a requirement for a
Christian missions organization to force every relationship through a ladder.
The dated MPDX examples distinguish useful ministry practice from universal fact.
The recommendation is a product judgment, not a measured Asym staff preference.

**Proof limits.** No staff usability study, live Supabase inspection, production
authorization test, application browser flow or release qualification is claimed.
The mechanics evidence below is limited to its declared experimental scope. This review
does not freeze an untested latency target, maximum catalog size or reporting formula.

| Evidence                                         | Scope                                                                               |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [Ownership](d12-evidence/ownership.md)           | Governing ADR/OpenSpec/P27/P28, D1–D11, work and reporting boundaries.              |
| [Authorization](d12-evidence/authorization.md)   | Supabase/Postgres, tenant references, current authority, recurrence and replay.     |
| [Implementation](d12-evidence/implementation.md) | Current source, reuse risks and precisely bounded fresh mechanics proof.            |
| [UX and comparisons](d12-evidence/ux.md)         | Shared Core design, interaction states, accessibility and primary product examples. |
| [Ministry practice](d12-evidence/ministry.md)    | Missions fit, source limits, repeated stages and misleading acquisition metrics.    |

## The smallest sound design

Use a narrow source-owned stage-change operation over the existing shared journey,
stable stage definitions and protected change history. Keep the current stage as
the source's current value, transactionally consistent with accepted history;
neither a client cache nor a report becomes another write authority. Reuse the
established command, authorization and durable-dispatch patterns where qualified.
This does not require a configurable state-machine engine, per-tenant schemas,
a new workflow service, a waiver queue, or event-sourcing the entire CRM.

**Strongest alternative:** tenant-configured allowed moves can standardize a
genuinely required process. It also needs exception handling, policy versioning,
retirement/reorder semantics and all-path enforcement. For this continuing
partnership model, no verified unmet requirement justifies that added machinery.
The founder selected direct updates. Process guidance remains available; a future
source-owned approval or financial rule still governs its own action, not the
relationship's label. A no-build use of current donor status is also rejected:
it describes the wrong subject and cannot provide this history or scope.

**Pattern classification:** shared Maia/Base UI, current P12 authority, native
source commands and source-owned shared work are durable patterns. Existing
selector/form/cache components are useful precedents requiring correct composition.
Prototype donor/lifecycle boards are temporary UI evidence, not the cultivation
model. Treating transport IDs as business idempotency or direct patches as complete
history would conflict with the accepted design, even if some existing code does it.

## Concrete user experience

The baseline is a compact **Change stage** editor reached from the partnership
record, list or board. The same source action and meanings serve authorized staff
and missionary surfaces; visible details follow each person's permission.

1. Show the permitted supporter/ministry context and **Current stage**. Preserve
   that recorded value even when retired; explain its retired status without
   pretending it is blank or forcing an immediate replacement.
2. Label the choice **New stage** and show concise guidance for the proposed choice.
   A neutral sentence can explain, “Choose the stage that best describes this
   partnership now. You can skip stages or return to an earlier stage.” Do not
   number choices as compulsory steps or show a rank-derived completion percentage.
3. Use **Save stage** and **Cancel**. Browsing or focusing choices does not save.
   No mandatory note, extra confirmation or different ceremony for a backward move.
   An unchanged choice can show **No change selected**; it creates no new history.
4. While submitting, keep the distinction between recorded and proposed values,
   prevent duplicate submission from that editor, and announce **Saving stage…**.
   After acceptance show **Stage updated** and the authoritative value. Keep failures
   and remedies beside the action, not only in a disappearing toast.
5. History describes actual changes: **Stage changed from [X] to [Y]**, with allowed
   actor and recorded time. No “demoted,” “lost donor,” “new partner” or “undo” meaning
   follows from the move. Returning later to X leaves the earlier X and Y events intact.

Exact widget placement remains a design implementation choice. Core's shared
`base-maia`, Base UI and semantic Zinc tokens govern typography, spacing, focus,
contrast and feedback. Favor a calm hierarchy: partnership context, current stage,
choice/meaning, then primary action. Essential meaning is visible, never hover-only.
Do not add a diagram, celebration animation or configuration detour to routine edits.

| Situation                                              | Clear behavior and recovery                                                                                                                                                                                                                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Skip from X to Z                                       | Save one X→Z change. No synthetic Y, checklist or warning merely for skipping.                                                                                                                                                                                                       |
| Return X→Y→X                                           | Preserve both changes. The latest X is a new recorded occurrence, not removal of Y.                                                                                                                                                                                                  |
| Choose X while X remains current                       | Explain that nothing changed; do not reset timestamps or issue stage effects.                                                                                                                                                                                                        |
| Existing current stage is retired                      | Display the allowed recorded value with a retired label; offer active choices separately. Keeping it is not a new selection.                                                                                                                                                         |
| Target retired while the editor is open                | Reject the fresh selection; refresh permitted choices and explain that it is no longer available. Do not move to a replacement automatically.                                                                                                                                        |
| Same-meaning label/guidance updated                    | Keep stable selection identity and refresh presentation. Do not turn a benign rename into a different stage or silently substitute a new-meaning stage.                                                                                                                              |
| A saved card leaves the current filter                 | Confirm the accepted stage and, where known and disclosable, explain that it no longer matches this view. Restore useful focus; do not imply deletion or use loaded-card counts as portfolio totals.                                                                                 |
| Two staff change the same journey                      | The losing stale proposal gets a conflict and permitted current state. Staff can review and deliberately submit a new intent; no silent retry overwrites the winner.                                                                                                                 |
| Old view says X; source changed X→Y→X                  | It is still stale despite the matching label. Resolve against the source revision and explain that the record changed.                                                                                                                                                               |
| Save response is lost                                  | Show **We couldn't confirm whether this saved** and an authorized **Check status** path. Recover the same intent; do not silently create another change.                                                                                                                             |
| Original save succeeded, but the journey changed again | Distinguish **Your earlier change was saved** from **Current stage**. An old receipt must not make the UI revert.                                                                                                                                                                    |
| Choices fail to load or search has no matches          | Preserve current/proposed state as permitted; distinguish loading/error from an empty search. Do not clear the stage or create a stage from the search box.                                                                                                                          |
| A legacy record has no recorded stage                  | Show that absence truthfully. Do not choose the first option automatically or settle the separate initial-stage policy through this editor.                                                                                                                                          |
| No eligible new choice remains                         | Show the permitted reason and authorized recovery route. Do not expose hidden choices, fabricate a default or grant configuration rights.                                                                                                                                            |
| Access changes while editing                           | Reauthorize submission and displayed results. Do not retain or reveal newly forbidden context to explain the failure.                                                                                                                                                                |
| Board interaction                                      | In each offered view, editable journeys have an operable non-drag stage action. If drag is provided, it proposes a destination through the same qualified interaction; it is never the sole touch/pointer or keyboard route. Read-only cards do not gain edit controls or authority. |
| Work is paused or closed                               | Selecting a stage never resumes/reopens it. Apply its existing source lifecycle authority; D12 adds no closed-work editing or correction permission.                                                                                                                                 |
| Source save succeeds but a projection lags             | Show saved source truth and truthful refresh status; recover the projection without asking staff to repeat the source change.                                                                                                                                                        |

## Exact requirements to carry forward

These requirements complete D12's meaning. They supplement, rather than duplicate
or weaken, D10 R01–R18 and D11 R01–R14. They enter formal artifacts only when the
founder invokes the separately reserved specification workflow.

**R01 — Direct choice, bounded by real source eligibility.** An otherwise valid
ordinary update SHALL allow any currently eligible stage in the journey's approved
preset, regardless of its display position or previously visited stages. No tenant
setting, hidden trigger, importer, board or optional workflow SHALL enforce a
mandatory sequence or backward/skip prohibition on that action. Existing source
scope, authorization, stage availability and lifecycle action boundaries remain
mandatory. Guidance SHALL not become an executable gate. No new role/grant follows.

**R02 — One current truth and accurate repeated history.** Each accepted change
to a different stage SHALL atomically preserve its actual prior/target stable
identities, accepted meaning/provenance, source revision and trusted actor/recorded
time with the resulting current value and durable result. Skipped stages SHALL
not acquire invented visits. A later return SHALL be a distinct accepted change.
Ordinary operations SHALL not rewrite/delete past accepted history. Selecting the
unchanged current value SHALL be a semantic no-op, not a new assessment, stage entry,
meaningful contact or downstream occurrence. A stale same-value command still needs
current authorization and revision resolution; equality alone cannot prove safety.

**R03 — Source facts stay separate.** A stage change SHALL not establish or reverse
contact, prayer/financial participation, ask response, commitment, received money,
consent, closure, reopening or task completion. Neither a gift, score, label, rank,
provider update nor changed configuration SHALL silently advance the stage. The
financial owners retain exact Legal Entity/currency/money meaning; D12 adds no
money field, rounding rule or attachment requirement.

**R04 — Honest current editing, not historical correction.** Normal direct selection
records the newly accepted understanding; it SHALL not claim when an external
conversation or relationship change actually occurred. Preserve unknown historical
dates as unknown, immutable valid closures and D9's unchanged-stage return.
Returning to a prior value does not undo the intervening period or revive ended
work. Correction/backdating and initial/preset choices retain separate source
contracts; ordinary selection SHALL not masquerade as those commands.

**R05 — Deliberate, accessible and neutral interaction.** Use the current/proposed/
accepted distinction and states above. No forced information, second confirmation,
“regression” warning, progress percentage or rank-derived success/failure styling
SHALL be introduced for skipping/backward movement. Provide non-drag single-pointer
and keyboard alternatives, associated guidance/errors, meaningful focus and status
announcements. Core's 44-CSS-pixel touch target convention, contrast and reduced
motion apply. Prove 200% text resize separately from reflow at an effective
320-CSS-pixel viewport, including 1280 pixels at 400% zoom; test long Unicode/RTL
labels, localization and soft keyboards. No fixed desktop table width or hover-only
information may prevent completion.

**R06 — Current authority on every path.** Resolve tenant, actor, source/legal-entity
scope, capability, processing purpose, field/history/result floors, residency and
policy epoch from trusted current P12 context. Validate caller-selected references;
never accept caller-asserted role, owner, author, approval, tenant or attribution as
authority. Configuration/responsibility does not imply journey-edit or history
access. API, import, job, RPC, repair, export, cache and replay paths SHALL preserve
the same boundaries, with appropriate human versus admitted service context.
Revocation/retirement acceptance cannot be a precheck followed by an unconditional
privileged write. Conflicts/errors SHALL not reveal hidden identities, stages,
counts or actors beyond allowed observation.

**R07 — Database integrity and mutation confinement.** Tenant-owned records SHALL
have stable non-null identity and complete required scope/key components, with
tenant-aware relationships to their journey, applicable preset, stage and history.
Optional references, if separately admitted, must not use partial-null composite
keys to evade integrity; D12 does not decide whether an initial stage is required.
Preserve relevant Legal Entity/source bindings;
do not invent entity-specific stage catalogs if the owner catalog is tenant-wide.
Prevent mutable-scope reassignment, orphaned references, deletion cascades into
history, invalid current/history combinations and ordinary history overwrite.
Use suitable keys/FKs/checks/unique constraints for row invariants and the one
authoritative transaction for cross-row current-eligibility/history invariants.
Do not impose lifetime uniqueness on journey-plus-stage or stage-pair: repeats are
valid. Separate stable IDs from labels, order and timestamps; timestamps alone are
not identity or total event order. DDL must prove grants and RLS for old-row `USING`
and new-row `WITH CHECK`, actual roles, views, RPC/functions and privileged paths;
RLS does not replace grants or trusted command validation. No broad browser patch.

**R08 — Concurrency and durable retry.** Compare the expected journey/enrollment
revision, not merely the current stage value or catalog revision. Serialize/check
the source and target-eligibility authorities sufficiently to give retirement,
revocation and updates an unambiguous accepted order; a later retirement may retain
an earlier valid selection under D10. Each new deliberate intent has a durable
scope-bound identity, bound to command kind, exact journey/scope and normalized
intent; retries preserve original trusted attribution and recover the currently
authorized result rather
than create another event. Changed input under the same identity is rejected.
Same-value no-op results also cannot be replayed later as a new mutation. Repeating
a stage later is a new intent/occurrence, not a duplicate of the first visit.
An abort before the source transaction commits rolls back its current-value,
required-history, receipt and required-intent writes together. A response,
projection or downstream execution failure after commit preserves the accepted
source result and follows authorized reconciliation. No unique key based solely
on transport request or target.

**R09 — Truthful recovery and projection ordering.** Distinguish not submitted,
pending, accepted, rejected/conflict and unconfirmed outcome. Dismissing an editor
after submission SHALL not claim cancellation of a committed or still executing
request. A lost response SHALL retain/recover the same intent before proposing a
new one. An authorized historical receipt proves that operation's result, not the
current stage. Late responses/events SHALL not regress source or displayed state;
projections reconcile by source identity/revision and applicable current policy,
not arrival time. Refresh detail, list/board and authorized history coherently;
do not restore an entire stale list snapshot over newer changes. Missing projection
data is unknown/stale, never fabricated success or zero.

**R10 — Existing work and effect identity.** Active work SHALL keep appropriate
dated next work or its owned actionable exception. Preserve obligations and surface
source-permitted recovery; do not presume every old task remains appropriate, nor
complete, cancel, duplicate or restart it merely because the stage changed.
Separately qualified source applicability and disposition rules still apply.
Evaluate only effects
required by the admitted source action; do not add a closure-wide review ceremony
to every stage edit. A stage occurrence alone does not prove a new actionable task
is required. Any qualified effect needs its own source condition and purpose;
native and optional execution share that business-effect identity. Repeated stages
must not revive consumed effects, and lifetime deduplication must not suppress
genuinely new source work. Recheck current authority/applicability before deferred
execution. Core owns acceptance and intent; an executor/provider owns only its
execution evidence. Unresolved external success is reconciled, not blindly resent.

**R11 — History, privacy and reporting meaning.** Where reported, distinguish
recorded transitions, unique journeys and repeated stage occurrences; D12 does
not require three new reports. A repeated
stage SHALL not count as a new supporter, renewed gift, completed activity or
financial acquisition without the separate authoritative fact. Order cannot define
probability, percent complete, donor value or success. Duration reporting SHALL
declare whether it describes the current recorded stay, a completed stay or multiple
stays and its clock/coverage; do not collapse gaps/returns, fabricate zero-duration
visits for skipped stages, treat unknown coverage as zero or silently backfill
unknown history. Exact formulas remain reporting-owner
work. Lawful history is subject to current access, redaction/anonymization and
retention, not a perpetual permission to retain sensitive narrative. Use minimal
identifier-based operational events/logs, independently governed exports and caches;
do not copy private notes or protected ministry locations into general audit.

**R12 — Bounded performance and operational recovery.** Keep the ordinary action
bounded to its journey, target, authorization and required affected source records;
no full-history replay, whole-tenant scan or external CRM call on each save.
Index tenant/scope/current lookups, history pagination and authorization predicates
using actual query plans. History grows by real accepted changes, not clicks/retries.
Use deterministic pagination/order under timestamp ties; bound catalog rendering,
search and result sizes. Qualify actual maximum supported volumes, concurrency,
timeouts and latency budgets in numbers with units before release. Do not claim
scale from an isolated fixture. Provide authorized receipt/reconciliation and
source-owned repair paths instead of routine direct SQL repair; historical
correction remains separately governed under R04.

**R13 — Safe migration and activation.** Census retained stage/status data and its
meaning before mapping; ambiguous source values need explicit reviewed treatment,
never label/rank guessing. No fabricated intermediate events or migration-triggered
outreach. Preserve event identities, authoritative revisions, consumed effects,
current privacy/revocation state and retention fences through backfill and restore.
Use additive compatible deployment, verify all writers/consumers, then activate by
qualified cohort. Old clients lacking the accepted command/revision contract must
not silently overwrite new data. A kill switch may stop new writes/effects while
preserving reads and recovery; rollback must not erase accepted history or revive
old restrictive behavior over data it cannot represent. Prefer roll-forward repair
after incompatible new records exist. Native operation remains usable without
optional Studio or unrelated providers.

**R14 — Proof and traceability.** Trace this answer and terminology through owner
requirements, any warranted durable ADR, OpenSpec/design/tasks, tickets,
implementation, outcome-based tests and release evidence, respecting `/to-prd`
and `/to-issues`. This review creates no formal spec or tickets. Require actual
database/API-role, race, migration/restore, accessible browser and representative
staff-task evidence. Component tests, isolated SQL, documents and vendor examples
cannot stand in for those gates. No broad compatibility/configuration engine may
be added merely to anticipate unselected future choices.

## Full category review

Severity is consequence if the flaw is introduced: **Critical** means a privacy,
authority or source-integrity boundary failure; **High** materially corrupts
history/work or blocks reliable operation; **Medium** harms usability,
maintenance or interpretation. Likelihood is qualitative engineering judgment,
not observed incident frequency. Each row identifies a material concern in the
proposed implementation space, not a claim of a deployed P27 defect. Exact fixes
are the normative R clauses; AC rows below make them falsifiable.

| Category                                                         | Material concern; failure and why it matters; severity / likelihood                                                                                                         | Evidence, effect on answer, permanent requirement and proof                                                                                                                                                         |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** Reusing donor status solves the wrong subject; a transition builder adds control without demonstrated need. Medium / plausible.                                    | Q12, D1–D3 and ownership evidence. **Retain A** over bounded allowed-move policy; keep a focused continuing-journey update. R01–R03/R14; AC01/AC13.                                                                 |
| 2. Brittleness                                                   | **Yes.** Label/rank-based logic breaks on rename/reorder, retirement or repeated stages. High / likely if prototype status patterns are copied.                             | D10 and current selectors/boards; **clarify A's stable meaning**, not its scope. R02/R07–R09; AC02–AC05.                                                                                                            |
| 3. Technical debt                                                | **Yes.** Duplicated portal logic, whole-record forms or a generic patch bypass force later replacement. High / plausible.                                                   | Implementation inventory and server/shared-UI boundaries. **Retain A**; one narrow command and shared composition. R05–R09/R14; AC08/AC13.                                                                          |
| 4. Edge cases                                                    | **Yes.** Retired current values, repeated visits, stale same-value screens and response loss can yield misleading history or UI. High / plausible.                          | D9–D11 plus recurrence reasoning; **clarify A**, do not block direct moves. R02/R04/R08/R09; AC02–AC07.                                                                                                             |
| 5. Footguns                                                      | **Yes.** Accidental selection, “Undo,” drag-only change, hidden required reasons or automatic replacement can record unintended work. High / plausible.                     | UI source/comparables and D11. **Retain A** with explicit commit and neutral recovery. R01/R04/R05/R09; AC01/AC10/AC11.                                                                                             |
| 6. Tenant safety                                                 | **Yes.** Cross-tenant/preset references or mixed caches/receipts can expose or change another partnership. Critical / plausible absent structural checks.                   | ADR-0001/P12 and authorization evidence. **Retain A**, never broaden scope. R06–R09/R11; AC08/AC09.                                                                                                                 |
| 7. Database, RLS and authorization safety                        | **Yes.** Broad updates, stale privileged prechecks or history-only partial writes can turn an allowed row into forbidden state. Critical / plausible.                       | PostgreSQL/Supabase evidence; grants, effective old/new checks, view/function role limits. **Retain A**; constrained authoritative transaction. R06–R08; AC06–AC09. Money/storage changes checked: none introduced. |
| 8. Overengineering                                               | **Yes.** Graph editors, tenant state machines, waiver approvals or universal event sourcing exceed the choice. Medium / plausible.                                          | Strongest-alternative analysis and original no-arbitrary-workflow requirement. **Retain A**, eliminate unused machinery. R01/R12/R14; AC01/AC13.                                                                    |
| 9. UX/UI and friction                                            | **Yes.** A visual ladder, “regression” stigma, vanished retired values or ambiguous success defeats accurate low-friction editing. High / likely without a state contract.  | Core design/accessibility and fresh CRM/WCAG sources. **Retain A**; contextual, neutral, accessible one-save flow. R04/R05/R09; AC01/AC10–AC12.                                                                     |
| 10. Source of truth, ownership and invariants                    | **Yes.** A stage can be mistaken for donor agreement, money, consent or task completion; a report can overwrite truth. Critical / plausible.                                | P27/P28, D1–D11, finance/communication/work owners. **Retain A** with independent facts and actual history. R02–R04/R10/R11; AC02/AC13/AC14.                                                                        |
| 11. Hidden coupling                                              | **Yes.** Stage ranks, optional Studio or unrelated fields become implicit prerequisites; a revisit re-fires old work. High / plausible.                                     | DON-14, P11 and ADR-0183. **Retain A**; source eligibility and purpose-owned effects, native independence. R01/R03/R10/R13; AC01/AC13/AC14.                                                                         |
| 12. Failure modes                                                | **Yes.** Commit succeeds but response/audit/projection fails; retry duplicates history or the UI reports failure as no write. High / plausible.                             | Nearby separate note/audit writes and network-failure reasoning. **Retain A**; atomic required source records, durable result and unconfirmed state. R08–R10; AC06/AC07/AC14.                                       |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** X→Y→X defeats stage-equality checks; lifetime dedupe suppresses valid returns; old events overwrite current truth. High / likely with value-based equality/dedupe. | New D12 recurrence consequence; Postgres concurrency evidence. **Clarify A** with revision and intent/occurrence identity. R02/R04/R08–R10; AC02–AC07.                                                              |
| 14. Data integrity                                               | **Yes.** Imports, same-value saves, duplicate requests or migrations create false intermediate history and drift. High / plausible.                                         | D10 historical import distinction and D12 source contract. **Retain A**; actual transitions, immutable meaning, all-writer checks. R02/R07–R09/R13; AC02/AC06/AC15.                                                 |
| 15. Security and privacy                                         | **Yes.** History, reasons, stage labels, export or receipt replay leaks sensitive ministry context after access changes. Critical / plausible.                              | P12, protected missionary context and current note-log reuse caution. **Retain A**; minimal classified evidence and current disclosure. R06/R11/R13; AC08/AC09/AC15.                                                |
| 16. Scalability and performance                                  | **Yes.** Full history scans, broad invalidation or unbounded choices degrade saves and mobile use. Medium–High / plausible with growth.                                     | Current cache/table precedents; no production benchmark. **Retain A**, bound queries and qualify actual numeric budgets. R09/R12; AC12/AC16.                                                                        |
| 17. Operational burden                                           | **Yes.** Staff must repair ambiguous saves, fake stages or repeated task creation manually. High / plausible if recovery is omitted.                                        | Source/work contracts and explicit failure states. **Retain A**; self-contained permitted recovery plus operator correlation. R09/R10/R12/R13; AC07/AC14/AC15.                                                      |
| 18. Observability and auditability                               | **Yes.** Technical logs cannot explain distinct returns or distinguish an old receipt from current truth. High / plausible.                                                 | Original expected-version/history requirements and privacy boundary. **Retain A**; durable minimal business history, distinct technical traces and protected security audit. R02/R06/R08/R11/R12; AC03/AC07/AC09.   |
| 19. Dependency and integration risks                             | **Yes.** Delayed optional consumers infer a new partner, bypass eligibility, resend outreach or become a save dependency. High / plausible.                                 | Workflow OpenSpec, DON-14 and MPDX reporting comparison. **Retain A**; current source-qualified effects and consumer reconciliation. No new vendor required. R03/R09/R10/R13; AC13/AC14.                            |
| 20. Migration, rollout and upgrade                               | **Yes.** Old writers overwrite revisions; stage/rank mapping invents history; restore replays consumed effects. High / plausible.                                           | D10/D11 and current-source gap. **Retain A**; compatibility census, cohort gates, preserved identities, roll-forward repair. R13; AC15/AC16.                                                                        |
| 21. Testability, traceability and proof                          | **Yes.** “Can move back” tests only a dropdown, missing authority, recurrence and actual usability. High / likely without explicit outcome gates.                           | No shipped P27 flow; bounded evidence cannot prove it. **Retain A**; AC matrix and honest trace chain. R14; AC01–AC16.                                                                                              |
| 22. Other development hazards                                    | **Yes.** This answer silently settles correction/backdating, initial stage, bulk changes or all task policy, or prompts needless reratification. Medium / plausible.        | Q12 explicitly retains those choices. **Retain A**, close its meaning and preserve the remaining frontier. R01/R04/R10/R14; AC04/AC13.                                                                              |

## Acceptance criteria and release proof

| ID   | Independently testable outcome                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC01 | An authorized otherwise-valid direct skip/backward update succeeds with one deliberate commit, no intermediate clicks, compulsory note, acknowledgment, approval or unrelated profile field. Ineligible/unauthorized targets still fail. Display reorder does not change allowed ordinary moves.                                                                                                                                                                                                                 |
| AC02 | Starting at X, accept X→Z: exactly that change exists, with no Y visit. Then Z→X: both changes remain with distinct source revisions/occurrences. No new supporter, gift, consent, closure, contact or completed task is inferred.                                                                                                                                                                                                                                                                               |
| AC03 | A same-value save creates no new stage history, entry/assessment time or effect. Retry an earlier accepted mutation and an earlier no-op after intervening changes: each returns only its currently disclosable historical result and cannot mutate or overwrite the current value.                                                                                                                                                                                                                              |
| AC04 | Given an editor at revision n/X and source changes X→Y→X at n+2, its stale write is rejected/reconciled despite matching X. Reopen retains the last authoritative stage under D9, including retired/unknown history, without a fabricated new assessment.                                                                                                                                                                                                                                                        |
| AC05 | Interleave target retirement/restoration, rename and reorder with selection. An accepted-before-retirement reference is retained; retirement-first rejects fresh admission. A same-meaning rename preserves identity. No fallback selection, cross-preset target or implicit history rewrite occurs.                                                                                                                                                                                                             |
| AC06 | Interleave competing updates at one revision; at most one conflicting intent wins. Duplicate simultaneous deliveries of one intent yield one effect. Changed payload under that key fails. Inject failure after source writes but before source commit: current value, required history/result/effect intent roll back atomically.                                                                                                                                                                               |
| AC07 | Lose the accepted response, close/reopen the editor, deliver old responses after newer changes and interrupt secondary refresh. UI distinguishes unconfirmed, historical accepted and current state; reconciliation reuses intent and never regresses the journey or another list row. A saved change that removes an item from the current filter remains understandable, with the known permitted reason, an authorized way to locate it and useful focus. Post-commit failure never undoes source acceptance. |
| AC08 | Exercise actual authenticated, unauthenticated, limited missionary/staff, configuration-only, revoked and admitted service/operator paths. Cross-tenant/entity/preset, forged attribution and mutable-scope attempts fail; direct table/RPC/view routes cannot bypass the source. Prove effective USING/WITH CHECK and grants with real nonowner roles, plus privileged-path safety.                                                                                                                             |
| AC09 | Hidden/absent targets and forbidden history/receipt cases reveal only permitted observations. Revoke access while previewing/submitting/replaying/exporting and restore a backup: no stale cache, actor, protected label/note or restored authority leaks. Audit retains lawful minimal attribution separately from technical logs.                                                                                                                                                                              |
| AC10 | Through the actual browser, complete and cancel from every offered entry point with keyboard, screen reader, touch and a non-drag single-pointer path. Browsing/Escape before submission does not save. Focus, names, help, pending/error/conflict and success announcements are correct. No color/toast/hover-only essential information or edit affordance implying authority on a read-only journey.                                                                                                          |
| AC11 | Current retired value, no choice, no matches, long/duplicate/localized labels, changed guidance and failed loading remain distinguishable. No accidental blank/default value or fabricated new stage. Participants identify current vs proposed vs saved and understand that moving back keeps history.                                                                                                                                                                                                          |
| AC12 | Verify exact shared design-system composition, contrast, Core touch targets, text resize, reflow, RTL and mobile soft keyboard. On a declared low-bandwidth/high-latency/disconnection profile, no false saved state, duplicate effect or inaccessible recovery. Do not claim offline save support without separate qualification.                                                                                                                                                                               |
| AC13 | Test the same authorized source meaning on staff and missionary projections, with native operation when optional Studio/providers are unavailable. Stage change does not resume/close work, alter assignments, waive contact suppression, certify participation or become a financial transaction. Initial stage/preset/correction/bulk capabilities are not smuggled in.                                                                                                                                        |
| AC14 | Preserve applicable existing next work without duplicate chores; expose the owned actionable exception when appropriate. A repeat stage does not revive ended/consumed work. Deliver duplicate/out-of-order native/Studio events and ambiguous provider outcomes: current source applicability and one purpose identity control recovery.                                                                                                                                                                        |
| AC15 | Dry-run retained-data mapping and mixed-version/rollback/restore with repeated stages, retired identities, unknown historical dates, current revocation/redaction and consumed effects. No fictional intermediate history, unsafe old writer, duplicate outreach or dropped valid history; reconcile discrepancies before cohort activation.                                                                                                                                                                     |
| AC16 | Publish tested numeric workload/query/latency/concurrency limits and execute production-shaped queries under real authorization. A representative staff/missionary usability pilot can identify the correct partnership, change directly, cancel, interpret return history and recover conflict without coaching or unsafe workaround. Critical failures block expansion.                                                                                                                                        |

## Evidence actually executed

The [fresh isolated PostgreSQL experiment](d12-evidence/stage-visit-probe/README.md)
passed **14/14 checks on PostgreSQL 17.11**. The retained source, raw observations,
input hashes, pinned image and cleanup metadata make its scope reviewable:

- A bad lifetime journey-plus-target unique key demonstrably drops a legitimate
  second visit; the alternative preserves A→B→A→B as distinct accepted changes.
- A new stale intent after A→B→A fails despite the visible stage again being A.
  Same-value selection does not reset the recorded clock or add a transition.
- Retrying an old accepted change or no-op returns its historical result separately
  from current state. Changed intent under one key conflicts; A→D creates no B/C.
- Transaction abort before commit rolls back the toy current value, history and
  receipt. Two controlled concurrency schedules verify the exact blocking backend
  before release: a stale contender rejects and a duplicate returns the original result.

The first successful 13-case run is retained; independent root inspection requested
the explicit same-visible-value stale-editor case, then the extended run passed.
Both containers were removed and removal verified. Root inspected fixture SQL,
runner/test logic, results and hashes. This is an owner-only synthetic relational
experiment, not Core source, P12/RLS, Supabase/PostgREST, UI, task/notification,
historical correction, migration or performance proof. Its isolated functions and
schema are one mechanical demonstration, not the selected production design.
Earlier D10 PostgreSQL and D11 selector tests remain dated evidence; none was rerun
or relabeled as fresh D12 application proof.

Five evidence appendices were reconciled, then ownership, authorization and UX
reviewers independently checked the consolidated draft. Their corrections limited
rollback to pre-commit failure, kept report obligations conditional, avoided new
historical-correction scope, qualified offered/editable UI surfaces, covered
filtered-out success and preserved source-qualified work dispositions. A fourth
readback matched the final draft to the mechanics evidence. These are engineering
reviews, not ministry-user feedback or a production-readiness certification.

## Synthesis and ordering

1. **Resolved before recording final:** reconciled accepted D1–D11, the source-owner boundaries,
   actual code and primary evidence; explicitly distinguish same intent from a new
   return and display order from permitted movement. The consolidated review
   accepts A with inherited safeguards, now explicitly ratified; no product
   amendment is awaiting approval.
2. **Capture in later spec/design:** the exact decision, R01–R14, AC01–AC16 and
   compact editor/recovery contract. No transition engine or extra approval flow.
   Complete separate initial-stage, preset, historical-correction and detailed
   existing-work decisions before implementing their affected behavior.
3. **Require during implementation:** stage/source identities and scoped constraints
   first; current authority plus atomic revision/receipt/history operation next;
   then shared editor, projections/history/report consumers and durable recovery.
   No UI-only guarantee or unqualified service-role fallback.
4. **Require before activation:** real source-role/concurrency proof, retained-data
   migration and restore evidence, accessible browser tasks, measured supported
   workload limits and representative staff evaluation. Name actual people for the
   accountable roles below. Documentation acceptance does not activate a feature.
5. **Monitor only residual qualified behavior:** use these concrete triggers.
   None substitutes for proving privacy, integrity or accessibility before release.

| Signal                                                                                                            | Threshold                                                                                   | Accountable owner                   | Response                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Valid direct skip/backward change blocked by sequence, mandatory note or approval                                 | Any reproducible case                                                                       | P27 product/source owner            | Remove the unintended gate and rerun AC01 on every affected entry point.                                                   |
| Synthetic intermediate visit, duplicate event, stale overwrite or old receipt presented as current                | Any confirmed case                                                                          | P27 source engineering owner        | Stop affected writes/consumer, preserve evidence, reconcile source history and fix ordering before re-enable.              |
| Unauthorized cross-scope/history/receipt disclosure                                                               | Any confirmed case                                                                          | Security/P12 owner                  | Contain affected routes/caches/exports and invoke security incident response.                                              |
| Repeated stage counted as new supporter/money or revives consumed work                                            | Any confirmed case                                                                          | P27 owner with reporting/work owner | Disable affected derived metric/effect, repair from authoritative facts, replay safely after proof.                        |
| Unconfirmed command remains unresolved after one completed reconciliation attempt                                 | Any such result                                                                             | P27 operations owner                | Keep result unconfirmed, correlate the durable intent and repair the read/recovery path; never request a blind new change. |
| Same source slice has repeated timeout/deadlock errors                                                            | Three in 15 minutes per tenant/source slice; proposed operating trigger, not a measured SLO | Platform performance owner          | Inspect lock/query plans, bound affected traffic and repair; validate against qualified budgets.                           |
| Participant cannot distinguish current/proposed/saved, change without drag or understand preserved return history | Any reproducible critical task failure in pilot/support evidence                            | P27 product/accessibility owner     | Fix interaction/copy, rerun affected tasks and block rollout expansion until resolved.                                     |

## Adversarial check

### What could go wrong with this answer?

The system could store a truthful label but fabricate the journey behind it,
duplicate effects on a return or overwrite newer work after a delayed response.
Stable occurrences, expected source revisions, atomic receipts and honest UI
states prevent those specific failures without adding process gates.

### What hidden assumptions are we making?

Direct selection is judged a better fit for continuing missions partnerships than
a forced ladder. Published product behavior supports feasibility, not universal
staff preference. Exact presets, history-correction policy and supported workloads
are not established by this answer; their separate owners/qualification remain explicit.

### How does this affect the whole product?

The shared journey serves staff and missionary contexts while keeping consent,
participation, finance, tasks, lifecycle and communications independent. Reports and
optional consumers must understand repeated stages rather than treating every
return as a new relationship or repeated outreach instruction.

### How does this affect the end-user experience?

Staff can record the appropriate stage in context with one deliberate save.
Current and proposed stages are clear; moving back receives no punitive treatment.
Retired choices, conflicts and uncertain saves have specific understandable states.
Mobile, keyboard and assistive-technology users retain the same completion path.

### Does this follow modern best practices?

Direct contextual stage changes and separate optional pipeline restrictions both
exist in current CRM documentation. WCAG requires independently usable non-drag
and keyboard paths and understandable status. Those practices support this design;
vendor bypass rules, automatic status effects and CMS publication gates do not
override Core's own authority or prove missions demand.

### Does this fit Asym’s existing repo and product direction?

Yes: native Postgres truth, source-owned commands, current P12 authority, shared
Maia/Base UI, independent source work and optional orchestration all align.
Prototype status controls are not reused as the domain model. D10 flexibility and
D11 advisory guidance remain intact.

### Should we adjust the recommendation?

**Accept A.** The safeguards preserve the selected direct movement and make its
history, authorization, retries and UX precise. No new product-scope amendment,
permission or ratification loop is needed. The decision review is complete;
the actual feature must pass the specified source, browser and release gates
before anyone calls the implementation qualified or the UX proven.
