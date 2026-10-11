# D19 — current assessment may be absent after a deliberate list change

2026-10-10. Founder selected Q19 **A: Allow “Not yet assessed”** when deliberately
switching saved partnership work to another eligible approved list. Targeted owner
review against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and working-tree
ratified D1–D18. This appendix changes no formal specification, issue, product code
or live configuration. Root owns the consolidated decision and glossary.

**Recommendation: Accept A; no additional material amendment identified.** D19
answers D18's reserved product question: the destination stage may be intentionally
absent. It does not grant generic same-list clearing, historical repair or automatic
stage selection. Current authority, coherent acceptance, truthful history and
independent source obligations remain mandatory.

## Evidence and current-versus-intended status

- **E1 — Selected policy:** [Q19:22–36](../phase27-q19-stage-on-list-change.md:22)
  offers optional current assessment on the destination, including a previously used
  list. [74–94](../phase27-q19-stage-on-list-change.md:74) preserves history, one
  deliberate save, explicit resulting meaning and the remaining scope exclusions.
  The current founder answer selects A; this is intended behavior, not activation.
- **E2 — Parent capability:** [D18:15–42](../phase27-d18-adversarial-review.md:15),
  [R03–R06:269–298](../phase27-d18-adversarial-review.md:269) require same-work
  identity, current target eligibility, coherent list/stage acceptance, source
  revision, durable result and retained actual history. D19 supplies the previously
  missing permission for prospective absence on this specific operation.
- **E3 — Earlier optionality is narrower:** [D13:18–40](../phase27-d13-adversarial-review.md:18),
  [R07/R08:257–274](../phase27-d13-adversarial-review.md:257) concern deliberate
  initial admission, genuine absence and first later assessment. They preserve
  existing values on reuse and distinguish omitted updates from clearing.
  [D16 R05:231–240](../phase27-d16-adversarial-review.md:231) only permits visible
  resolution of incompatible unsaved input. Neither independently granted D19.
- **E4 — Structural and temporal truth:** [D14 R02/R07:234–240](../phase27-d14-adversarial-review.md:234),
  [298–306](../phase27-d14-adversarial-review.md:298) require one current list and
  a stage belonging to it when present. [D12:174–197](../phase27-d12-adversarial-review.md:174)
  distinguishes real changes, unchanged-value no-ops and historical truth.
  [D15:182–198](../phase27-d15-adversarial-review.md:182) distinguishes a new
  attachment from continuing retained use; reopening is not automatic reassessment.
- **E5 — Product owners:** [P27:4087–4105](../../../../prds/sitestacker-parity/roadmap.md:4087)
  gives P27 cultivation history and normal next-work discipline, while P9 owns
  identity/assignments/shared tasks and financial/communication owners retain their
  facts. P28 consumes that shared source, not another stage truth
  ([4181–4183](../../../../prds/sitestacker-parity/roadmap.md:4181)).
- **E6 — Tasks, review and attention:** [ADR-0183:18–48](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:18)
  requires a concrete source action before work is projected. [ADR-0027:50–65](../../../../adr/0027-one-notification-presentation-and-engagement-model.md:50)
  keeps source, task and attention state distinct. [D6 R02:146–153](../phase27-d6-adversarial-review.md:146),
  [R08:214–222](../phase27-d6-adversarial-review.md:214) bind review scheduling and
  completion to its actual pause/review occurrence and authorized source action.
- **E7 — Workflow and shared implementation:** [DON-14:1651–1677](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1651)
  has accepted enrollment/stage-transition triggers, default disabled and unresolved
  source bindings. [Studio source/conditional rules:19–37](../../../../../openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:19)
  distinguish source facts and unknown/inaccessible input. [Workflow orchestration:13–32](../../../../../openspec/specs/workflow-orchestration/spec.md:13)
  makes execution non-authoritative; [platform boundaries:13–25](../../../../../openspec/specs/platform-boundaries/spec.md:13)
  require shared business meaning across surfaces.
- **E8 — Authorization and metrics:** [P12:2846–2858](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846)
  requires current exact context on reads/mutations/jobs. [P33:4604–4610](../../../../prds/sitestacker-parity/roadmap.md:4604),
  [4636–4646](../../../../prds/sitestacker-parity/roadmap.md:4636) assigns governed
  metric meaning, time basis, completeness and original-versus-derived facts.

Fresh primary-document review establishes these governing boundaries. This pass
does not claim a deployed nullable-stage switch command, production permission
proof, browser qualification or measured agency preference. Actual source/runtime
evidence must remain separately labeled in the consolidated implementation review.
The requested grill-with-docs skill, its grilling/domain-modeling instructions and
repository authority rules were read; the user's one-question/research-only scope
controls over broader interview or formal-document defaults.

## Findings, precise clauses and acceptance evidence

### O1 — “Not yet assessed” falsely means never assessed

**High impact; likely with reused initial-admission labels.** E1/E2/E3/E4.
**Requirement:** “Absence describes the current assessment on the current destination
list binding. Preserve earlier assessments and their list-specific meaning. Do not
create an Unassessed catalog stage, infer that no assessment ever occurred, or
restore an old assessment because the destination was used before.”

**Proof:** A/X → B/absence → A/absence retains X and both real list changes in lawful
history, but X is not current. A/absence → B/absence is still a real list change;
equal null stage values do not make the operation a no-op. This changes current
assessment availability, not partnership identity or historical truth.

### O2 — Optionality becomes silent clearing or a malformed accepted pair

**High impact; plausible with a generic nullable update.** E1–E4.
**Requirement:** “Accept one visible target-list outcome: an eligible stage of that
exact list, or intentional no-current-stage under this qualified switch operation.
Required list/scope remain valid. Commit the resulting binding, actual history and
required result together. Do not derive clearing from a dropped field, failed read,
inaccessible stage or generic list-only patch.”

**Proof:** A/X → B/Y records the actual combined choice without a fabricated B/absence
interval. A/X → B/absence records the actual absence disposition without inventing a
stage visit or fresh assessment. A submitted Y that becomes invalid fails safely;
the server cannot convert it into successful absence. Explicit command semantics
are required, not a new mandatory UI acknowledgment or prescribed wire encoding.

### O3 — The switch path becomes a same-list clearing escape

**High impact; plausible with stale source IDs or permissive no-op handling.** E1/E2/E4/E8.
**Requirement:** “D19 absence requires an actual accepted change to another list,
validated against authoritative current binding and expected source revision. A
same-list request cannot clear an existing assessment through this operation.”

**Proof:** An editor observes A/X; another actor accepts B/Y; stale A→B/absence cannot
clear Y. A same-list no-op preserves the recorded assessment. Genuine later A→B→A
changes remain possible with current eligibility, separate intent and preserved
history; do not invent a cycle ban. Retry of an earlier absent result after a later
assessment recovers history without reapplying absence.

### O4 — Absence creates chores or erases normal accountability

**High impact; plausible with null-as-exception automation.** E1/E5/E6.
**Requirement:** “No current assessment neither fulfills nor independently violates
the normal next-work obligation. Preserve appropriate dated work or its owned
actionable exception. D19 creates no compulsory assessment task, queue, deadline,
reminder, warning, approval or pause; actual source obligations retain their owners.”

**Proof:** An existing due call remains due after the list change. Absence alone does
not enqueue a second task or create a missing-next-action exception. D6 review
date, completion and notification engagement cannot be changed by a nullable stage
write. This does not decide permission to switch while paused. Only genuine,
already-qualified work applicability changes receive source-owned disposition;
unrelated tasks are not a blanket blocker or a reason for a dependency wizard.

### O5 — Consumers mistake absence for progress or an unresolved fact

**High impact; plausible with legacy stage-required workflow predicates.** E2/E5/E7.
**Requirement:** “Expose the actual accepted list/assessment outcome without
inventing enrollment, supporter action, stage progress or assessment evidence.
Qualified consumers must distinguish known current absence from hidden, failed or
unknown data. Any follow-up effect needs its own source condition and purpose.”

**Proof:** A no-stage switch activates no disabled DON recipe and sends no donor
message. It is not automatically DON-14 admission or a fabricated stage visit.
The selected target-stage path records a real assessment through its source contract;
its event and effects need exact owner qualification. Optional Studio cannot make
an otherwise valid native absence fail as though a required source fact were missing.
No finance, consent, participation, responsibility or lifecycle fact is inferred.

### O6 — Old stage age survives as current age or becomes artificial zero

**Medium/high impact; plausible with current-only joins and null coercion.** E2/E4/E8.
**Requirement:** “Where presented, distinguish no current stage from past assessments
and real stage visits. Preserve actual accepted ordering/time evidence; do not keep
the old stage clock running as a current stage, fabricate a new stage-entry date
for absence, or present absence as zero time in a real stage.”

**Proof:** Historical X remains reportable under its qualified basis; current B has
no current stage. A subsequent explicit B/Y assignment records its real accepted
choice/time, not a backdated date from X. The ordinary views still include authorized
unassessed work; null cannot silently drop it from counts or boards. D19 does not
select duration formulas, absence-aging metrics, conversion denominators or an SLA.
Those derived meanings remain P33/source qualifications, not extra workflow policy.

### O7 — Supposed flexibility silently reinstates required assessment

**Medium/high impact; plausible with per-tenant required-field controls.** E1/E3/E8.
**Requirement:** “Allow the selected optional-stage path when its source conditions
are met; do not add a tenant-required-stage override, compulsory narrative or second
confirmation under the guise of configuration. Show the actual prospective outcome
before the ordinary save, and preserve current authority and clear recovery.”

**Proof:** An already-unassessed source can use the clearly shown absence outcome
without another meaningless acknowledgment. A hidden/loading/unresolved value is
never labeled intentional absence. Destination-stage suggestions/defaults are not
selected here; actual controls must express both supported outcomes clearly without
guessing a stage or restoring one from history.

## Disposition and remaining limits

B's strongest benefit is immediate destination categorization, at the cost of
delaying a legitimate process change until staff can assess it. A preserves an
honest absence without relaxing current source authority or accountability. No
additional founder-policy amendment is required for O1–O7.

D19 resolves D18's product requirement for a permissible absent target stage; it
does not itself prove safe switching or finish Phase 27. Reconcile older
initial-only absence wording during the authorized formal specification, keeping
its scope clear. Generic same-list clearing, historical correction/backdating,
automatic mapping/restoration, target-stage suggestion/default policy, paused/closed
operations, bulk change and cross-scope behavior remain unselected. Qualify actual
command authority, nullable-state/history/event consumers, concurrent acceptance,
accessible shared UI, recovery and affected metrics before release. No new engine,
formal ADR or invented workflow is needed to express this decision.
