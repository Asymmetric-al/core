# Phase 27 D13 — start honestly when the stage is not yet assessed

2026-10-10. **D13 explicitly ratified; review disposition: Accept.** Research against
Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`, the working D1–D12 decisions
and freshly retrieved primary sources. The founder additionally requires
appropriate tenant flexibility and excellent, clear UX, including next steps and
later changes. This is a completed decision review within the continuing interview,
not a formal PRD/OpenSpec, shipped feature, release qualification or donor-contact
authorization.

The founder subsequently instructed, “Yes, ratify this amended D13,” and asked
to continue the Phase 27 session. This explicitly ratifies the exact D13 decision
and its reviewed safeguards on 2026-10-10. The status update adds no new scope,
permission, default or implementation claim.

## Exact decision ratified

> **D13 — Allow “Not yet assessed” when needed.** An authorized person may
> deliberately start otherwise-valid partnership work without recording a
> cultivation stage when they cannot yet make an appropriate assessment. They
> may instead choose an appropriate eligible stage immediately when it is known.
> Neither path requires a guessed stage or a new organization-configured placeholder.
>
> “Not yet assessed” means that this partnership work has no recorded stage;
> it is not a stage in the organization's list, a judgment about the supporter,
> paused work, or permission to omit responsibility and normal follow-up. Keep
> the work visible in its ordinary authorized work views. Show the absence plainly,
> explain it briefly, and provide an obvious **Set stage** action where authorized;
> after assessment, provide **Change stage** through the same clear source action.
>
> Preserve D10's flexible organization stage definitions and D11/D12's advisory
> guidance and direct selection. A stage is optional at this deliberate start;
> identity, scope, current authority, accountability and applicable next work are
> not. This choice creates no compulsory assessment task, deadline, warning,
> approval, additional permission or workflow engine.
>
> Preserve existing recorded stages on reuse and reopening. The first later
> assessment records the actual accepted choice and time without invented prior
> stages or backdating. Distinguish genuine source absence from hidden, failed,
> unloaded, retired or unresolved data on every relevant path.

**No material amendment to A is required.** These safeguards make the offered
[Q13](phase27-q13-initial-stage.md) and inherited decisions precise; they do not
introduce a new product choice requiring repeated ratification. Initial suggestions
or defaults, clearing/correcting an existing assessment, preset assignment/switching,
detailed work policy and metric formulas remain separate interview decisions. No
answer to them is inferred. In particular, “flexible” does not silently introduce
a tenant setting that reverses A by requiring an initial stage, nor does it waive
existing source safeguards. Existing architecture covers this choice; no new ADR
is necessary to restate optional data and source ownership.

## Evidence, facts and limits

| Evidence                                                               | Verified scope                                                                                                                                                  |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d13-evidence/ownership.md)                                 | Governing ADR/OpenSpec/P27/P28, D3/D4/D9–D12, Tasks Hub, notifications, DON-14 and reporting ownership.                                                         |
| [Authorization](d13-evidence/authorization.md)                         | Current P12 boundaries, effective grants/RLS, optional references, trusted attribution, old/new states, replay and restore; official PG17 and Supabase sources. |
| [Current implementation and mechanics](d13-evidence/implementation.md) | Bounded source inspection and an isolated PostgreSQL experiment; exact artifacts and proof limits.                                                              |
| [UX and comparative products](d13-evidence/ux.md)                      | Core shared UI, state distinctions, group review, accessible recovery and fresh CRM/CMS/WCAG documentation.                                                     |
| [Missions practice](d13-evidence/ministry.md)                          | Primary MPDX, TntConnect and ministry evidence; strongest alternative and limits on workflow assumptions.                                                       |

**Repository facts / intended behavior.** ADR-0001 makes Asym Postgres the CRM
source of truth. P27 owns cultivation, P28 consumes it, and P9/P12 retain identity,
work and permission responsibilities. P13/P14/P16 own contribution, recognition
and commitment facts; P6/P17 own communication eligibility and delivery. D4/D10/D12
explicitly reserved initial assessment. The retained phrase “enrollments carrying
cultivation stage” is not evidence that this unresolved field was mandatory.
D13 resolves admission without stage; it does not rewrite other owners' contracts.

**Current behavior inspected.** The current admin donor board derives “Unknown”
columns from loaded lifecycle-status data. Shared controls can collapse unmatched
values to a placeholder or `N/A`, and a generic cell can emit `null` to clear.
The missionary donor form supplies a status fallback. These are useful UI precedents
but describe different subjects and incomplete source semantics. They do not
qualify P27 optional assessment, total portfolio counts, safe clearing, current
permission or durable acceptance. Bounded searches found no P27 implementation in
the inspected paths; that is not a deployed-system absence claim.

**External facts.** [MPDX's active contact list](https://help.mpdx.org/article/1275-contacts-list-view)
explicitly includes contacts with no selected status. [TntConnect's phase guide](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx)
provides the counterpressure: a default n/a should be resolved into a meaningful
phase. Neither proves a universal missions admission policy or assessment deadline.
[HubSpot's current default rules](https://knowledge.hubspot.com/object-settings/manage-how-lifecycle-stages-sync-between-objects)
document some creation paths assigning the first displayed stage even with the
creation-default switch off. Thus an optional UI field alone cannot prove all-path
omission. These products' contact/lifecycle statuses are not Core's ministry-specific
stage. Their automatic defaults or mixed consent/financial meanings are not adopted.

**Product judgment / reasonable inference.** Honest incomplete knowledge is better
than a guessed assessment. A staff member may know an existing church partnership
well enough to take responsibility while needing more information to choose its
stage. That is an illustrative possibility, not observed agency frequency. The
accepted architecture already provides accountability; another assessment queue
would duplicate it without evidence of benefit.

**Unresolved evidence.** No missions-staff usability study, production workload
measurement, live Supabase inspection, real Core RLS/browser test or migration
qualification was performed. A good design is not proof of excellent usability.
Those are explicit release gates below, not reasons to pretend this decision is
unanswerable. No success rate, latency, maximum stage count or assessment-age SLA
is invented. Formal phase readiness remains separate from this completed review.

## Alternatives and minimum sufficient design

**Strongest alternative B:** require an actual appropriate organization stage at
admission, perhaps an honestly defined discovery stage. It gives immediate
classification and simpler stage-only queries. A permits that useful choice
already. B's additional restriction can block deliberate useful work or encourage
a label selected solely to satisfy validation. There is no inspected governing
requirement or practitioner evidence that justifies imposing that tradeoff.

**Mandatory placeholder stage:** an organization might define a genuine discovery
stage. That remains valid. Forcing every tenant to add “Needs assessment” merely
to store absent knowledge mixes two meanings, complicates retirement and history,
and creates avoidable configuration. Do not ban labels; distinguish actual selected
stage identity from the system's absence condition.

**No-build alternative:** existing donor lifecycle/status cannot identify this
ministry/purpose's understanding and history. A generic note would be hard to find,
query and update reliably. Reuse the shared source/UI patterns, not the wrong fact.

The smallest sound implementation candidate is one optional current-stage
reference on an otherwise valid source record, with independently enforced required
scope and the already-required protected history/commands. A normal nullable
Postgres relationship is sufficient in principle; no new stage-status boolean,
sentinel UUID, per-tenant schema, JSON workflow language, assessment service or
full event-sourcing rewrite is justified. This is an engineering candidate, not
founder-selected DDL. The constraints must prove the guarantees in R05/R06.

## Concrete UX and realistic edge cases

Use Core's shared Maia/Base UI components and semantic tokens. The emphasis is
clear hierarchy, calm spacing, meaningful labels and a nearby action. Do not copy
another platform's visual system or freeze an untested widget into this decision.

In the existing deliberate-start flow, request only missing/materially changed
information. Display the permitted supporter, identified ministry and purpose,
responsible person and applicable next work. For the stage:

```text
Stage (optional)
Choose a stage

Not sure yet? You can start without a stage and set it later.
```

There is one deliberate admission action. No extra “I accept missing information”
checkbox, compulsory skip click, justification, red error or second confirmation.
A user may choose a stage, change their unsaved mind and leave this new draft
unassessed; that is not a permission to clear a saved stage. The actual recorded
result is then clear:

```text
Stage: Not yet assessed
No stage has been recorded.
Set stage

Responsible: [the permitted lead]
Next: [the actual source-owned work and due date, or owned exception]
```

The bracketed items are actual authorized source facts, never fabricated default
work. **Set stage** opens the D12 contextual editor with eligible choices, concise
meanings, Save stage and Cancel. After saving, show the accepted stage and **Change
stage**. A read-only user sees only permitted information and actual available
recovery options; do not imply that being the lead or a missionary grants editing.
Starting internal work does not mean the supporter has agreed to a partnership.

| Situation                                                                                         | Required understandable behavior                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Valid unassessed start                                                                            | Admit normally with honest stage absence and intact responsibility/work. Stay in ordinary authorized work views.                                                                                                                                           |
| Appropriate stage already known                                                                   | Permit it in the same start flow; do not force an unassessed interval or another save.                                                                                                                                                                     |
| Later first assessment                                                                            | Choose any eligible stage directly; record its real acceptance once. No invented intermediate stage or earlier assessment date.                                                                                                                            |
| Organization stage happens to be named “Not yet assessed”                                         | Differentiate the actual organization stage from **No stage recorded**, using concise help/grouping in context. IDs, not labels, determine identity. Do not silently reserve arbitrary names or expose UUIDs as normal UI.                                 |
| Saved stage retired                                                                               | Retain the recorded value and its retired explanation. Do not display absence; no forced replacement.                                                                                                                                                      |
| Current-stage source unavailable, field withheld, broken reference or uncertain legacy provenance | Do not infer that no stage is recorded. Present only the permitted loading/error/unavailable state and real recovery; do not disclose protected existence through the wording.                                                                             |
| Stage options loading/fail                                                                        | Preserve any independently authoritative, authorized current-stage value or absence and the draft. Offer retry; do not invent a choice. Options retrieval is not itself an admission prerequisite when the source can validate all independent conditions. |
| Explicitly selected stage becomes retired/invalid before save                                     | Reject that selected intent clearly; preserve recoverable draft and offer current eligible choices. Never silently admit as unassessed. A deliberate revised no-stage intent is a different submitted intent.                                              |
| Authoritative source catalog has no selectable stage                                              | Configuration is invalid under D10; do not use omission to bypass catalog repair. An empty permitted list, no search match or failed options request does not prove this catalog defect.                                                                   |
| Existing ordinary journey found during start/group retry                                          | Use D4's permitted reuse outcome. Never clear its stage, owner or work, and never expose a hidden duplicate.                                                                                                                                               |
| Two people set the first stage                                                                    | Accept according to current revision/authority; the stale editor receives safe conflict feedback and current information only when allowed.                                                                                                                |
| Lost response after acceptance                                                                    | Show outcome as unconfirmed until reconciled. Do not confuse “we do not know if saved” with “no stage assessed.”                                                                                                                                           |
| Stage is set from an unassessed-filtered list                                                     | Explain success and why the row no longer matches; keep usable focus and access to its authorized result. No disappearing row masquerading as save failure.                                                                                                |
| Board includes an unassessed group                                                                | Treat it as a grouping condition, not a configurable stage or drop target that clears an existing stage. Offer non-drag controls. A board layout is not required.                                                                                          |
| Mixed reviewed group                                                                              | Preserve each member's reviewed known/absent intent and D4 partial results. No per-member acknowledgment ceremony or expanding live query.                                                                                                                 |
| Paused/closed/reopened work                                                                       | Absence does not change lifecycle. Apply D6–D9; reopening does not invent assessment or reactivate ended child work.                                                                                                                                       |

Show full distinguishable stage names and explanations with long translations,
RTL and mixed-direction names. Retain international supporter naming/address
patterns; do not add address/profile requirements to this narrow action. Display
actual timestamps using existing localization/time-zone conventions; absence
creates no date or change to D6's review date. Use visible focus, accessible labels,
error/status relationships and Core's 44 CSS-pixel touch convention. Check 200%
text resizing and 320 CSS-pixel effective reflow separately, including mobile soft
keyboards. Color, position, animation or drag cannot be the only way to understand
or operate the choice. Low bandwidth requires truthful pending/recovery and safe
intent retention, not an unqualified offline-write queue.

## Exact requirements to carry forward

**R01 — Honest optional admission.** The deliberate new-work command SHALL permit
no recorded stage when all other source conditions are satisfied, and SHALL permit
an appropriate eligible stage when supplied. It SHALL NOT infer one from rank,
giving, contact history, related people or an unqualified default. D13 adds no
compulsory stage, reason, approval or tenant setting that makes this option unavailable.
Existing usable-catalog requirements remain. Suggestions/defaults require their
separate qualification; they cannot silently redefine no-stage intent.

**R02 — One meaning, bounded flexibility.** The no-recorded-stage condition SHALL
be distinct from every catalog stage, life/work state and source-error/permission
state. Its display SHALL be localized and scoped to the stage. Tenant labels are
not identifiers; a colliding label SHALL remain understandable without changing
source meaning or requiring a new customization/translation engine. D10/D11
configuration remains available without turning absence into a tenant stage.

**R03 — Accountability and domain independence.** Stage absence SHALL preserve
D4 admission, exact ministry/purpose, D5 responsibility and the applicable dated
next task or owned actionable exception. Absence itself SHALL NOT satisfy that
exception or create a compulsory task, review date, grace period, reminder, contact,
approval or pause. Financial, communication, participation and supporter-response
facts SHALL remain with their existing authorities. Optional Studio/DON-14 SHALL
NOT gate native admission; accepted enrollment is its own occurrence, not a
fabricated stage transition. Downstream required facts remain individually qualified.

**R04 — Accessible contextual action and true read states.** Every offered start
path SHALL make the optional choice understandable and later Set stage discoverable
where authorized. Reuse D11/D12's current/proposed/accepted distinction, one clear
save, narrow validation, status/conflict/unknown-outcome recovery and shared Core
UI. Genuine source absence, present/retired stage, loading/failure, withheld fields
and unresolved provenance SHALL NOT be collapsed. Options retrieval failure SHALL
NOT erase independently authoritative stage knowledge or become a new admission
gate; a filtered empty option list SHALL NOT imply an invalid source catalog. Do not expose a protected value
or its existence to explain an unavailable action. No new donor/public flow follows.

**R05 — Required identity survives an optional reference.** Required Tenant,
applicable entity/source, ministry/purpose and applicable catalog relationships
SHALL remain non-null and independently valid when stage is absent. A present
stage SHALL belong to its qualified scope/catalog. If nullable composite stage
references are used, default MATCH SIMPLE's skipped lookup SHALL NOT be the only
validation of required scope; blanket MATCH FULL SHALL NOT reject legitimate
mixed-null optional stage keys. Checks SHALL handle SQL unknown explicitly.
Stage absence SHALL NOT weaken ordinary-journey uniqueness. Definition deletion
SHALL NOT set an existing assessment to null; retirement preserves identity/history.
No money representation or new currency rule is introduced.

**R06 — Current authority at every database boundary.** Resolve the actor and
current P12 authorization context from trusted server context. Caller-selected
owner/target IDs are proposals whose eligibility and scope SHALL be validated,
not authority or audit attribution. Re-prove exact tenant/entity/source, capability,
processing purpose, field/history/result, residency and epoch for all commands,
reads, counts, exports and deferred execution. Stage-null SHALL NOT create an OR
permission bypass. Qualify effective grants, nonowner RLS USING and WITH CHECK,
views, RPC ownership/search path, privileged paths and old-to-new transitions;
omitted WITH CHECK may inherit USING and is not itself proof of bypass. Raw source
and history writes SHALL NOT become browser-authorized because a column is nullable.

**R07 — Atomic admission and preserved reuse.** Each accepted D4 member SHALL
atomically preserve required source facts, history, durable result and applicable
work/exception. A no-stage start SHALL create no fabricated stage visit. Admission
with a known stage SHALL record that initial choice and its actual acceptance
provenance atomically, without a fabricated prior unassessed interval. Existing
journey reuse SHALL preserve its stage and later changes. Missing-stage input SHALL
have explicit command semantics: absence on a new start is permitted; omission in
an update is not a clearing instruction. Invalid, stale or inaccessible selected
stages SHALL NOT be coerced into a successful unassessed start.

**R08 — First assessment and durable replay.** The first later stage assignment
to an existing unassessed journey SHALL use current authority, target eligibility
and the expected source revision, with
null-aware comparison and atomic current value, actual history and required result.
Business-intent identity SHALL include command kind/scope and distinguish changed
payloads. Two contenders SHALL NOT both overwrite the same revision. A replayed
start or no-op result SHALL NOT clear a newer stage, repeat effects or reset clocks;
disclose its historical result separately from currently authorized current state.
Precommit failure rolls back required writes; failure after authoritative commit
uses reconciliation. No external request occurs inside the transaction. Required
secondary intent uses existing durable-dispatch/recovery patterns.

**R09 — Truthful history, clocks and correction boundary.** Record admission and
first later assessment as their actual different source occurrences. Preserve
lawful provenance; ordinary product edits SHALL NOT rewrite earlier accepted
history. Qualified retention/redaction remains separate from changing that history
through a stage edit. Do not backdate assessment to admission or invent a catalog
visit for absence. Before first assessment there is no stage-entry time to age. Unknown historical
assessment dates SHALL remain unknown; do not invent timestamps to satisfy a
constraint or report.
Where offered, a measure of time without an assessment SHALL identify its actual
clock/population separately from time in a recorded stage. Clearing, historical
correction and backdating remain outside D13; generic PATCH/upsert/delete/replay
SHALL NOT introduce them. D9 reopening retains authoritative recorded understanding.

**R10 — Visible work and honest reports.** Ordinary authorized work views SHALL
account for unassessed admitted work; an explicit stage-only filter may exclude
it only with clear meaning. Required scope, access and coverage SHALL be applied
before grouping/counting. Do not equate failed/partial/withheld data with no
assessment or zero. Counts and denominators SHALL describe their population;
COUNT(stage) is not an all-journey count. Stage-less work SHALL NOT disappear
through inner joins or active-definition filters. Offered exports SHALL distinguish
source absence from omitted/unknown fields in their qualified contract. No ranking,
probability, acquisition, donor-worth or financial meaning follows from absence.
P33 owns qualified metric semantics; no new report store or dashboard is required.

**R11 — Privacy and bounded operations.** No compulsory explanatory narrative
SHALL be collected. Existing minimization, retention, redaction/erasure and current
history/result disclosure SHALL apply to source history, caches, logs, exports and
backups. Operational telemetry SHALL prefer opaque scoped identifiers, operation
and result codes; do not copy names, sensitive ministry locations or narrative.
Durable business history and security audit SHALL remain distinguishable from
technical logs. Repair/reconciliation SHALL use qualified source operations,
with visible authorized outcomes, not routine direct database edits.

**R12 — Compatibility, migration and restore.** Before enabling no-stage admission,
qualify every relevant reader/writer, schema and projection version. Census legacy
blanks separately from proved no-assessment; preserve uncertainty/provenance and
never fabricate default assessments. Reject or gate old writers that require or
silently assign a stage. Imports SHALL not automatically admit work; map actual
known data by stable identity under a separately qualified migration contract.
No-data-loss rollback SHALL preserve admitted stage-less work and history; prefer
a safe roll-forward over filling guessed values. Before restored paths activate,
reconcile authoritative revisions, current access/redaction and consumed-effect
fences. Hold affected paths when those facts cannot be recovered. Activation SHALL
not run retrospective outreach or invent admission/assessment effects.

**R13 — Performance, proof and traceability.** Qualify tenant/scope-leading access,
absence-filter and relevant FK indexes from actual queries; avoid per-row option
lookups, unbounded client scans and loading an entire portfolio to count it.
Use authorized server filtering/pagination and bounded batch execution already
required by their sources. Record representative tenant size, stage/history counts,
null share, selectivity, concurrent users, query plans and p50/p95 measurements in
milliseconds before choosing limits/SLOs. D13 → glossary → later ADR disposition,
OpenSpec requirements/design/tasks → authorized issues → implementation/tests →
release evidence SHALL retain these requirement and acceptance IDs. No performance
claim, implementation test or phase readiness follows from documentation checks.

## Full category review

Every category was evaluated independently. Severity describes consequence;
likelihood is conditional engineering judgment before safeguards, not a measured
incident rate. **Critical** means isolation/disclosure failure; **High** means lost,
false or inaccessible authoritative work; **Medium** means significant confusion,
maintenance or performance burden. Evidence abbreviations: **O** ownership,
**A** authorization, **I** implementation/mechanics, **U** UX, **M** ministry
appendices above. Exact fixes are the normative R clauses and AC proofs below.
No row changes the founder's A; “clarifies” makes its offered meaning enforceable,
“narrows reuse” rejects an unsafe implementation, not a selected product capability.

| Category                                                      | Material concern, impact and evidence                                                                                                                                                                                                                                                                                                  | Severity / likelihood                                | Effect on A; permanent prevention and exact change                                                                                                                           |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity, alternatives                  | **Yes.** A generic donor status or forced placeholder records the wrong fact; compulsory classification can produce guesses. O/M compare a truthful discovery stage, B and no-build alternatives; none is proved universally best for agencies.                                                                                        | Medium / plausible                                   | Retain A; clarify genuine optional admission and existing scope, R01–R03, AC01/02. No unsupported ministry-workflow claim.                                                   |
| 2. Brittleness                                                | **Yes.** Missing joined/loaded/retired/hidden data can all render as “unassessed,” while reordered first options silently supply defaults. Current controls and HubSpot all-path exception demonstrate the danger (I/U/A).                                                                                                             | High / likely if copied                              | Narrow reuse; R02/R04/R07 require explicit read/intent semantics across paths; AC02/03/07.                                                                                   |
| 3. Technical debt                                             | **Yes.** A sentinel stage, second boolean/status or bespoke assessment queue duplicates state and configuration. O/A/I show ordinary source ownership can represent absence.                                                                                                                                                           | Medium / plausible                                   | Retain A with one source meaning, R02/R03/R05/R13; AC01/05. No new engine or schema per tenant.                                                                              |
| 4. Edge cases                                                 | **Yes.** Colliding labels, no usable stages, retired selections, mixed groups, reopened work and reused assessed journeys can be misclassified or reset (O/A/U/M).                                                                                                                                                                     | High / plausible                                     | Clarify exact edge behavior in the UX table and R02/R07–R09; AC02–AC04/07/08.                                                                                                |
| 5. Footguns                                                   | **Yes.** Generic clear, blind upsert, first-option fallback or invalid-input-to-null coercion silently changes intent or erases knowledge (I/A/U).                                                                                                                                                                                     | High / likely if copied                              | Narrow reuse; R01/R07–R09 require command-specific omission and prohibit implicit clearing; AC03/07–AC10.                                                                    |
| 6. Tenant safety                                              | **Yes.** Null scope checks, OR-null RLS, wrongly keyed caches/options/counts or selected-owner trust can cross tenant/entity boundaries (A/I).                                                                                                                                                                                         | Critical / plausible                                 | Retain A with existing isolation; R05/R06/R10, AC05/06/12. Missing stage never weakens scope.                                                                                |
| 7. Database, RLS, authorization safety                        | **Yes.** Nullable composite FK can skip required catalog validation; MATCH FULL can reject correct rows; an allowed update or privileged writer can create forbidden scope/state. PG mechanics support these specific risks (A/I).                                                                                                     | Critical / plausible                                 | R05–R08 enforce independent required references, old/new authority, constraints, trusted actor and effective grants. AC05/06/09/10. No money schema change required.         |
| 8. Overengineering                                            | **Yes.** Tenant force-B switches, mandatory assessment queues/deadlines, configurable routing or a custom workflow service add policy and maintenance without evidence (O/U/M).                                                                                                                                                        | Medium / plausible                                   | Keep A small; R01–R03/R13 and AC01/04 forbid implicit new machinery while preserving real stage customization.                                                               |
| 9. UX/UI and user friction                                    | **Yes.** A blank field, unknown “N/A,” hidden next action, mandatory skip ceremony or disappearing filtered row makes users unsure what happened/what comes next (U/M).                                                                                                                                                                | High / likely without explicit design                | R04/R10; concrete start/Set stage/Change stage, state table and AC11/12/16/17. Shared visual system, accessible recovery, mobile/localized proof.                            |
| 10. Source of truth, ownership, invariants                    | **Yes.** A projected absence can become write authority, null can weaken dedupe, or “unassessed” can replace accountable work/consent facts (O/A).                                                                                                                                                                                     | High / plausible                                     | R02/R03/R05/R07/R10 preserve source identity, work, cardinality and domain separation; AC01/04/05/08.                                                                        |
| 11. Hidden coupling                                           | **Yes.** P11 required fields, a stage-only reader, donor lifecycle or DON-14 can turn valid admission into a hidden gate or fabricated transition (O/I/U).                                                                                                                                                                             | High / plausible                                     | R01/R03/R04/R12, AC01/04/13/14. Qualify exact native source seams; no dependency on optional execution.                                                                      |
| 12. Failure modes                                             | **Yes.** Failed options can be treated as omission; failed responses can repeat admission or overwrite current assessment; committed source and stale projection can disagree (A/I/U).                                                                                                                                                 | High / plausible                                     | R04/R07/R08/R11; AC03/09–AC11/13. Distinguish precommit abort from postcommit uncertainty, preserve intent, reconcile durable result.                                        |
| 13. Lifecycle, temporal correctness, concurrency, idempotency | **Yes.** Competing first assessments, stale null receipts, retirement/revocation and backdated stage clocks can corrupt history/current understanding (A/I/O).                                                                                                                                                                         | High / plausible                                     | R07–R09/R12; AC08–AC10/15. Expected revision, current eligibility, atomic history, durable intent and actual time.                                                           |
| 14. Data integrity                                            | **Yes.** Repeated starts, omitted update fields, nullable-key uniqueness, dropped rows and legacy blank mapping create duplicates or false assessment data (A/I/M).                                                                                                                                                                    | High / plausible                                     | R05/R07/R09/R10/R12; AC05/07/08/12/14/15. Preserve identity and explicit mapping/coverage semantics.                                                                         |
| 15. Security and privacy                                      | **Yes.** Unassessed filters/counts, old receipts, exported history or debug payloads disclose private people/ministries; mandatory reasons collect avoidable sensitive information (A/U).                                                                                                                                              | Critical / plausible                                 | R04/R06/R10–R12; AC06/12/15/18. Current disclosure, minimal telemetry, retention and restore fences; no added missionary/public entitlement.                                 |
| 16. Scalability and performance                               | **Yes.** Client-only counting, per-row lookups and unindexed absence queries degrade with skewed tenants/null fractions/history. Current loaded-row board cannot prove total scale (I/U). No measured limit supports a capacity claim.                                                                                                 | Medium / plausible as data grows                     | R13 and AC17 require actual production-shaped plans/measurements, scoped pagination and validated indexes before SLOs.                                                       |
| 17. Operational burden                                        | **Yes.** An unseen unassessed backlog or automatic nag queue creates cleanup; unrecoverable partial results force direct SQL repairs (O/U/A).                                                                                                                                                                                          | High / plausible                                     | R03/R04/R10/R11, AC04/11–AC13. Keep normal work visible, source-linked repair and clear outcomes; no compulsory assessment-age threshold.                                    |
| 18. Observability and auditability                            | **Yes.** Logs alone cannot explain whether admission/first assessment occurred, who acted, or why a result is stale; excessive logs expose narrative (A/I/O).                                                                                                                                                                          | High / plausible                                     | R07–R09/R11; AC09/10/13/18. Durable business provenance/results, separate security evidence and minimal correlated technical failures.                                       |
| 19. Dependency and integration                                | **Yes.** Import/provider nulls, creation-path defaults and optional enrollment/stage triggers can disagree with Core meaning or generate duplicate effects (O/U/M). No new provider is needed.                                                                                                                                         | High / plausible                                     | R01/R03/R07/R08/R12; AC07/13/14. Core owns admission/assessment; qualified adapters map facts and durable intent, reconcile mismatches and preserve native operation.        |
| 20. Migration, rollout, upgrade                               | **Yes.** Required-stage old clients, inner-join readers, guessed backfills or rollback after null data can lose work/history; restore can revive obsolete facts/effects (A/I/M).                                                                                                                                                       | High / plausible                                     | R12; AC14/15. Census, compatible reads/writes, gated activation, reversible switches with retained data and restore proof; no guessed-stage rollback.                        |
| 21. Testability, traceability, proof                          | **Yes.** A nullable-column test or beautiful mockup can be mistaken for complete admission, permission, recovery or usability proof; terms may drift across artifacts (all).                                                                                                                                                           | High / likely without declared limits                | R13 plus AC01–AC18 and evidence section. Carry stable IDs; distinguish experiment, actual source test and release gate. No formal spec/issues before workflow authorization. |
| 22. Other development hazards                                 | **No additional material concern identified.** Checked financial precision, provider spend, AI/scoring, new public/donor checkout surfaces, offline queue, custom translation service and irreversible infrastructure. D13 requires none. Unselected defaults/correction/preset policy must not slip in as implementation convenience. | No independent new risk; adjacent risks above remain | Scope boundaries in R01–R04/R09/R13 are sufficient. No speculative subsystem or extra approval added.                                                                        |

## Acceptance criteria and release proof

These are falsifiable future product requirements, not claims that P27 passes them.
Tests must exercise the real source/API, actual roles and shared surfaces where
specified; the isolated experiment below proves only named mechanics.

- **AC01 — Two valid starts.** From each offered native/API/reviewed-group admission
  path, valid known-stage and valid no-stage intent both succeed under D4. One
  deliberate commit suffices; no mandatory placeholder, note, extra confirmation
  or invented stage event. Required work/accountability and usable catalog remain.
- **AC02 — Flexible meanings.** Add, rename, reorder and retire organization stages
  under D10. Omission remains understandable/available, known assessment remains
  selectable, and rank supplies no default. A real stage labeled like the absence
  label is unambiguously distinct. Zero-selectable catalog remains invalid.
- **AC03 — Distinct states.** Verify real absence, known/retired stage, hidden field,
  options loading/failure, bad reference, partial source and legacy uncertainty.
  Independently verified stage knowledge survives an options-only failure; an empty
  filtered list is not proof of invalid catalog. None is silently converted to
  another; a rejected selected stage does not become
  an unassessed success. No private existence leak through explanation/counts.
- **AC04 — Work and domains.** Unassessed active work has appropriate existing dated
  work/owned exception; missing accountability is still actionable. Absence alone
  creates zero new tasks/reminders/contact attempts and changes no giving, consent,
  participation, pause/close or completed-work fact. Optional Studio unavailable
  does not prevent qualified native operation.
- **AC05 — Real relational integrity.** Actual migrations/constraints accept valid
  no-stage scope and reject missing/foreign required scope and wrong-tenant/preset
  stage. Verify FK deletion actions, null/check semantics, required indexes and
  dedupe independent of stage. A known stage is not erased on definition retirement.
- **AC06 — Actual authorization.** Nonowner and real service/API/RPC tests cover
  SELECT/INSERT/UPDATE/UPSERT/DELETE/RETURNING, WITH CHECK/new-state escape, extra
  permissive policies, field/history/count/export authority, revocation and trusted
  actor/owner validation. Null stage grants no capability. Hidden duplicate reuse
  reveals no protected record and creates no duplicate ordinary journey.
- **AC07 — Omission is command-specific.** New-start omission is allowed. Updating
  another field does not clear a stage. Generic clear/delete/upsert and explicit
  null cannot introduce an unselected clearing feature. Known-stage intent from
  one reviewed member is not replaced by group fallback/default.
- **AC08 — Start/reuse collision.** Concurrent known-stage and unassessed starts
  for the same ordinary journey produce the permitted single identity and accurate
  accepted/reused outcomes. An unassessed replay cannot erase the winning stage;
  different member outcomes remain independently recoverable.
- **AC09 — First assignment concurrency.** Competing stage assignments with the
  same expected revision produce one accepted change and a safe stale result.
  Retirement, revocation and closed-state changes before acceptance are checked.
  Same accepted intent replays without a new event; a different normalized payload
  under the same intent key conflicts. A genuinely new deliberate intent uses its
  own identity and current expected revision; a missing required revision is not
  treated as an unconditional update.
- **AC10 — Atomicity and history.** Inject failure before commit at each required
  write: no partial source/history/result/work. After commit/lost response, recover
  the original result separately from current state. No-stage admission creates no
  stage visit; later assignment uses its own accepted time and null-to-stage fact;
  known-stage admission creates no invented prior unassessed duration.
- **AC11 — Understandable recovery.** Cancel, slow connection, offline failure,
  denied capability, expired access, stale revision and uncertain response retain
  truthful permitted state/intent. Late callbacks cannot restore null over an
  accepted stage. Staff can identify whether to retry/reconcile or choose again.
- **AC12 — Complete authorized views.** Compare pagination, list, offered board,
  filters, counts and exports for the same declared scope with unassessed, assessed,
  retired, denied and failed-coverage fixtures. No implicit stage join drops work;
  unknown/partial totals are not zero. After first assessment, a filtered row's
  removal has truthful success and usable focus. A board cannot clear a stage by
  dragging back to its unassessed group.
- **AC13 — Secondary effects and repair.** Accepted enrollment without stage is a
  real enrollment event, never a fake stage transition. Duplicate/delayed/out-of-order
  dispatch and projection failure preserve source truth and consumed-effect fences;
  optional systems do not block it. Authorized operators can diagnose/reconcile via
  the source without private narrative in logs or routine direct SQL repair.
- **AC14 — Mixed versions and imports.** Qualify all supported old/new client/API/
  schema combinations before activation. Census/map legacy blanks and known stages
  without invented assessments. Reject unknown selected IDs with clear permitted
  repair. Imports do not automatically admit work or trigger retrospective contact.
  Disabled feature/rollback preserves new stage-less rows/history without guessed fills.
- **AC15 — Restore and lifecycle.** Restore a snapshot before assessment/revocation/
  redaction; reconcile source revisions/current disclosure/effect fences before
  activating. No stale null overwrites current truth, erased text returns, or task/
  outreach replays. Pause/close/reopen preserve D6–D9 and truthful stage provenance.
- **AC16 — Browser accessibility and clarity.** Exercise both start paths and later
  Set/Change stage with keyboard, screen reader and touch, 200% text resize, 320 CSS
  px reflow, long translated names, RTL, zoom, reduced motion and mobile keyboard.
  All actions, full distinctions and recovery remain accessible; no color/drag-only
  interaction. Automated checks supplement manual tasks, not replace them.
- **AC17 — Measured scale and staff pilot.** Declare workload dimensions and agreed
  release budgets before testing production-shaped data; retain query plans and
  p50/p95 timings with units. Representative tenant staff and appropriately authorized
  missionaries must demonstrate both start choices, who acts next, later stage change
  and recovery without moderator rescue for a critical action. Record actual devices,
  participant context, failures and changes; any reproduced critical confusion blocks
  expansion. No invented sample-size, success-rate or “beautiful UI” claim substitutes
  for evidence. Phase-wide full journey pilot remains required.
- **AC18 — Evidence chain and privacy.** Trace each accepted effect to actual source,
  trusted actor, time, operation/intent and permitted result; independently inspect
  current-history access, security audit and minimal technical telemetry. Reconcile
  D13 terminology/IDs through glossary and subsequent authorized formal artifacts.
  Retention/export/restore tests honor qualified minimization and erasure.

## Evidence actually executed

Five focused research appendices checked current local contracts/source and fresh
primary documentation. A new disposable **PostgreSQL 17.11** experiment exercised
null-specific counterexamples and first-assignment mechanics. Its exact source,
15 check results, execution metadata and cleanup are retained in
[initial-assessment-probe](d13-evidence/initial-assessment-probe/README.md).

**15/15 checks passed**, meaning the named broken-design counterexamples reproduced
and the positive fixture mechanics met their assertions. These include optional
composite-reference behavior, independently required scope, a fixed-tenant
nonowner RLS fixture, JSON missing/null distinction, read/count traps, actual first
assignment, safe old admission receipt, atomic rollback and a controlled competing
first-assessment schedule. The experiment does not contain Core P12, actual
Supabase API/grants, production source work, browser flows, migration/restore or
scale qualification. The fixture pairs present stages with known assessment
timestamps; that check is not a migration rule for legacy known stages whose
assessment date is unknown. Prior D10/D11/D12 results were not rerun or relabeled as D13
proof. Final documentation checks passed: Prettier on all touched Markdown,
`git diff --check`, 133 local links across 11 Markdown files, exactly 22 category
rows, 13 requirements, 18 acceptance criteria and all seven requested adversarial
headings. Input hashes and Python syntax were verified, container absence was
independently rechecked, and decision/question/log status is consistent. These
checks verify the artifacts, not product behavior.

Independent consolidated ownership, authorization and UX review found no material
change to A. Three precision fixes were incorporated: later assignment needs an
existing source revision while known-stage admission records its initial fact in
one commit; a changed payload conflicts under the same intent key, not merely
because a new legitimate intent has another key; and failed options retrieval
neither erases independently verified current-stage knowledge nor proves an invalid
catalog. No user research or shipping claim is substituted for these reviews.

## Synthesis and ordering

1. **Before recording this answer:** resolve absence versus real stage, appropriate
   tenant flexibility, visible accountable work, known-stage start, first assessment
   history and preserved reuse. R01–R10 resolve these within A. Primary sources and
   the bounded null experiment support a proportionate implementation; there is no
   unresolved material product amendment requiring another vote.
2. **Capture in later specification/design:** carry D13/R01–R13 and AC01–AC18 into
   the glossary and decision log now, then the formal OpenSpec/design/task chain only
   after `/to-prd`. The next genuine interview choices include initial suggestions/
   defaults, preset applicability, correction and detailed work/report semantics.
   P27 owns these interfaces with P9/P12/P28/P33; absent qualification cannot become
   an implicit default, clearing operation or shadow authority. They do not prevent
   recording D13, and they do prevent declaring the whole phase ready.
3. **Require implementation safeguards:** P27 source with P9/P12 first qualifies
   nullable-reference integrity, current read/mutation authority, command semantics,
   single-journey reuse, atomic history/result/work and durable first-assignment
   replay. Then qualify readers/counts/exports and shared accessible UX against that
   contract. Work/notification/optional adapters consume source facts afterward;
   they neither invent assessments nor gate qualified native work. No ticket or
   production implementation is created by this review.
4. **Before release:** complete actual authorization/concurrency/API/browser proof,
   compatibility/census/restore, production-shaped measurements and staff pilot.
   Activation follows compatible data and code; hold unsafe old writers/readers,
   with source/data preserved under disable/roll-forward. A nullable column or a
   successful mockup alone is not a release gate.
5. **Monitor only residual operational risk after qualification:** use the explicit
   proposed signals below. These thresholds are design requirements, not observed
   rates or new product SLAs. Monitor only permitted minimal metadata. Source safety
   and unknown access boundaries are release gates, never “watch and hope.”

| Signal                                                                  | Threshold                                                                             | Accountable owner                              | Response                                                                                                                               |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Valid no-stage admission blocked or silently defaulted                  | Any confirmed reproduction on a supported path                                        | P27 product/source owner                       | Fix or disable the affected path while preserving accepted work; add all-path regression evidence.                                     |
| Eligible unassessed work missing from an ordinary view/declared total   | Any confirmed mismatch for identical authorized scope/coverage                        | P27 read-model owner; P33 for metric semantics | Correct source-derived query/projection, reconcile affected views, preserve provenance; do not relabel records to hide the error.      |
| Cross-scope/field existence disclosure through absence/read/count       | Any confirmed disclosure                                                              | P12/security owner with P27                    | Contain affected exposure immediately, preserve minimal incident evidence, require negative authorization proof before reactivation.   |
| Old null intent overwrites a recorded stage or duplicates its effect    | Any confirmed instance                                                                | P27 source engineering owner                   | Stop affected writer/replay path, reconcile from durable evidence through qualified repair, restore only after race/retry tests.       |
| Admission/assessment remains unconfirmed after attempted reconciliation | One completed reconciliation attempt still cannot determine the authoritative result  | P27 operations/source owner                    | Keep outcome explicitly unresolved, inspect durable intent/result and source revision; do not issue a new effect blindly.              |
| Critical user cannot identify outcome, next action or Set/Change stage  | Any reproducible critical task failure in pilot/support                               | P27 product/design and accessibility owners    | Fix/test the interaction; block expansion of affected flow, preserve a qualified accessible alternative.                               |
| Query breaches its approved measured release budget                     | Three consecutive measurements within 15 minutes for the same declared workload slice | P27 engineering/operations                     | Inspect plan/load/coverage, reduce affected rollout or repair query/index; do not drop unassessed/unauthorized distinctions for speed. |

No maximum “time unassessed,” compulsory cleanup campaign or auto-escalation is
approved. Such a policy would be another product decision, not operational
monitoring of correctness.

## Adversarial check

### What could go wrong with this answer?

An optional field can still default silently, disappear from queries, weaken
scope references, erase a reused stage or misrepresent failed/hidden data. Exact
source/read semantics and real-role/concurrency proof address these risks without
adding another workflow.

### What hidden assumptions are we making?

We infer that useful deliberate work can precede a reliable stage assessment.
Primary missions tools support visible missing classification, not an Asym agency
frequency or universal workflow. The UI and workload assumptions require actual
staff/browser/performance qualification; no empirical outcome is claimed.

### How does this affect the whole product?

P27 supplies honest source absence, P28 consumes it, P9 work stays accountable,
P12 protects every projection, and P33 keeps report coverage truthful. Gifts,
commitments, participation and consent remain independent. Optional automation
consumes accepted enrollment or actual assessment rather than inventing either.

### How does this affect the end-user experience?

Staff can start without guessing, see “No stage has been recorded,” continue real
follow-up and use a nearby Set stage action later. Known stages are just as easy
to choose immediately. Clear state/recovery prevents blank-field anxiety and
hidden data loss; no donor checkout or public flow acquires a new step.

### Does this follow modern best practices?

Yes within the evidence's limits: meaningful optional labels, honest missing-value
semantics, source-owned commands, relational integrity, current authorization and
accessible feedback. Primary CRM/CMS examples reveal caveats rather than universal
rules. Fresh PostgreSQL mechanics support the narrow storage candidate, not the
complete future feature.

### Does this fit Asym’s existing repo and product direction?

Yes. It preserves deliberate ministry-specific admission, flexible tenant stages,
advisory guidance, direct selection, shared UI/work, native functionality and
Postgres/P12 authority. Existing generic Unknown/N/A/fallback/clear patterns are
not preserved where they would contradict those decisions.

### Should we adjust the recommendation?

**Accept.** Record A with the exact safeguards above. No material product/permission
amendment or repeated ratification is necessary. This completes the D13 review;
it does not imply the unasked defaults/correction/preset decisions or declare the
entire Phase 27 implementation ready.
