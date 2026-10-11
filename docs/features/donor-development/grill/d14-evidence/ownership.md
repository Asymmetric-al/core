# D14 — additional stage lists: owner boundaries and unresolved lifecycle

2026-10-10. The founder selected **A: additional organization-approved stage
lists**, with excellent, understandable configuration and everyday UX. Research
against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and the working-tree
ratified D1–D13 decisions. This appendix is not a formal specification, implementation,
activation or evidence that the complete Phase 27 is ready.

**Recommended disposition: Accept A with inherited safeguards.** D14 adds list
creation; D10 previously authorized changing stages within lists. No additional
product amendment is necessary to accept this capability. Whole-list lifetime,
applicability/defaults, copying and switching remain expressly reserved by Q14.
They must be resolved before affected product behavior ships, not silently supplied
by an engineer. In particular, list lifecycle must be qualified before additional
list creation is released as a complete, operable tenant feature.

## Evidence and authority

| Ref | Exact anchor                                                                                                                                                                                                                                                                                                                            | Established scope                                                                                                                                                                                                                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| E1  | [Q14:25–49](../phase27-q14-additional-stage-lists.md:25), [78–95](../phase27-q14-additional-stage-lists.md:78)                                                                                                                                                                                                                          | Add organizational lists for different processes; one applicable list/current stage per journey. Configuration authority, not new approval ceremony. Applicability, defaults, whole-list lifecycle and later switching expressly reserved. |
| E2  | [D10 R01–R05:135–181](../phase27-d10-adversarial-review.md:135)                                                                                                                                                                                                                                                                         | Flexible stages; stable identity/meaning; **stage** retirement/restoration; usable available lists; no implicit default, executable guidance or business effects. R04 expressly did not authorize list creation.                           |
| E3  | [D10 R06–R10:183–236](../phase27-d10-adversarial-review.md:183)                                                                                                                                                                                                                                                                         | Current P12 catalog authority differs from journey mutation/disclosure; scoped references; atomic configuration, revisions and durable retries; no automatic journey migration.                                                            |
| E4  | [D10 R11–R13:238–263](../phase27-d10-adversarial-review.md:238)                                                                                                                                                                                                                                                                         | Shared source identities across consumers; equal labels/ranks do not prove equivalence. Supplied-template adoption is deliberate and cannot overwrite tenant choices. Simple shared settings UX.                                           |
| E5  | [D11:162–191](../phase27-d11-adversarial-review.md:162); [D12:266–279](../phase27-d12-adversarial-review.md:266); [ratified D13:18–48](../phase27-d13-adversarial-review.md:18)                                                                                                                                                         | Advisory stage guidance, direct eligible movement and optional initial assessment. Appropriate due work/owned exception remains mandatory. Configuration cannot silently reinstate mandatory assessment or infer stage-driven tasks.       |
| E6  | [P27:4087–4103](../../../../prds/sitestacker-parity/roadmap.md:4087); [P28:4163–4183](../../../../prds/sitestacker-parity/roadmap.md:4163); [retained constraints:17–59](../../../../prds/program-roadmap/owner-constraints.md:17)                                                                                                      | P27 owns one cultivation model; P28 consumes it. Staff, support-raising and church use cases; P9/P12, finance and communications retain their owners. Legacy P28 labels do not move consent/participation/lifecycle into editable stages.  |
| E7  | [D3:20–43](../phase27-d3-adversarial-review.md:20); [ADR-0183:18–48](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:18)                                                                                                                                                                                   | A different preset does not justify another ordinary journey. Configuration alone creates no required human task or executor-owned business fact.                                                                                          |
| E8  | [DON-14:1651–1677](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1651); [Studio OpenSpec:19–31](../../../../../openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:19), [79–87](../../../../../openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:79) | Trigger is accepted enrollment or transition, not list creation. Optional execution requires qualified source bindings/current authority and remains disabled until qualified.                                                             |
| E9  | [P33:4604–4610](../../../../prds/sitestacker-parity/roadmap.md:4604), [4636–4646](../../../../prds/sitestacker-parity/roadmap.md:4636); [platform boundaries:13–25](../../../../../openspec/specs/platform-boundaries/spec.md:13)                                                                                                       | Governed report meaning/access/coverage and shared business logic across surfaces. Additional catalogs are not additional source models or analytics authorities.                                                                          |

These establish accepted intent, not live implementation. The prior bounded D13
source inspection ([implementation:18–25](../d13-evidence/implementation.md:18))
found no cultivation implementation in its searched paths; that is prior evidence,
not a new exhaustive code or deployed-system claim. This appendix adds no runtime,
usability, workload or external-vendor proof.

## Concerns and exact clauses

Severity describes prospective impact; likelihood is conditional judgment, not an
observed rate. Each proof below is a future acceptance obligation.

### O1 — New lists become personal pipelines or duplicate relationships

**High; plausible when copying a CRM pipeline feature.** E1/E6/E7/E9.
**Requirement:** “An additional list is organization-governed configuration on the
same cultivation model. It does not create a new journey, independent relationship
purpose, private access boundary or second stage for another viewer.” Staff and
missionaries may have different permitted controls, but share the same underlying
journey's recorded understanding. Do not impose a new purpose registry or require
D3's independent-journey justification merely to create a list.

**Proof/effect:** two authorized surfaces resolve the same applicable list/stage;
adding a list leaves journey count, responsibility and history unchanged. A list
used by only one ministry is not automatically prohibited; personal ownership or
permission bypass is the prohibited shortcut. Preserves A without forcing a list
for every team or approving automatic team-based assignment.

### O2 — “Approved” invents an approval workflow or broad grant

**Critical for access failure; plausible with an Admin-label shortcut.** E1/E3.
**Requirement:** “Creation uses current qualified P12 authority over the actual
organization catalog. Creation/configuration rights neither grant journey access
nor select a list for someone else's work. Caller-provided tenant, actor, owner or
team references are not authority.” Exact named capabilities still require owner
qualification; no new per-list ACL system follows.

**Proof/effect:** a partnership lead without configuration authority cannot create;
an authorized catalog administrator gains no hidden journey/history/count access.
Revocation, replay and deferred operations recheck their current contracts. Do not
add a committee, second approver, request queue or mandatory rationale essay.

### O3 — Creation produces partial, empty or duplicate accepted configuration

**High; likely if list and stages are independently saved.** E2/E3.
**Requirement:** “Creation accepts a finite validated configuration with stable
tenant/list-qualified stage meaning, required configuration evidence and durable
result atomically. A list available for new work has at least one selectable stage.
Retries recover the same created identity; changed input under the same intent
conflicts. A create request must not overwrite an existing list.”

**Proof/effect:** inject failure between header/stages/history/result; no partial
usable catalog appears. Lost response and retry do not create two lists. Duplicate
names do not authorize merging or updating by label. Existing-list edits retain
D10's expected-revision protocol; do not require a nonexistent prior list revision
for a genuinely new creation. An empty unsaved form is fine; persisted drafts or
a publish step are not implied. No global catalog lock or unique-name policy is
selected by this requirement.

### O4 — Configuration becomes admission, assessment, work or default

**High; plausible through broad event handlers or automatic first-option use.** E2/E5/E7/E8.
**Requirement:** “Creating a list changes configuration only. It does not assign
or switch journeys, change current stages, reset clocks, set a default, enroll
supporters, manufacture task obligations, send messages or activate a recipe.”
The source may require configuration projection reconciliation; that is not a
cultivation event. Existing normal work and consent restrictions remain intact.

**Proof/effect:** creation emits no enrollment/transition, donor communication or
task; existing ongoing/paused/closed/unassessed work remains unchanged. DON-14's
editable preset parameter does not automatically bind a newly created list.
Applicability/defaults remain separately qualified, including any legitimately
supported broad selector. Preserves A without an optional-workflow dependency.

### O5 — List creation silently chooses copying, inheritance or template upgrades

**High; plausible with a convenient Duplicate button.** E1/E2/E4.
**Requirement:** “D14 does not require a clone facility or live inheritance. If
copying is separately offered, it must create independent scoped configuration
identities from the permitted configuration, preserve relevant source provenance,
and copy no journeys, assessment history, access grants or consumed effects.”
Equivalent text is not the same list/stage identity. Supplied-template updates
retain D10's deliberate-adoption boundary.

**Proof/effect:** source/template edits never rewrite the new list or tenant
history; destination edits never mutate another tenant. Do not infer default,
applicability or workflow-binding copying. Creation can be implemented through
a simple editor; blank-start versus copy-start affordances remain design choices
only when they do not add unselected cross-list behavior.

### O6 — Stage retirement is incorrectly promoted to whole-list lifetime

**High; plausible because the words “stage” and “list” are conflated.** E1/E2/E3.
**Requirement now:** “Creation and later ordinary configuration cannot destroy,
orphan or silently remap referenced list/stage/history facts. List addition does
not withdraw another list or reclassify its journeys.” These are integrity and
ownership safeguards, not a chosen lifecycle UI.

**Still a product choice:** whether/how an entire list stops new admissions;
whether existing journeys may continue choosing its remaining stages; whether
reopening counts as new use; unused-list deletion; restoration; and any draft,
published, retired or archived states. D10 R03 governs **stage** retirement.
It cannot establish those whole-list behaviors by analogy. Studio definition
publication/archive rules concern executable workflows, not this configuration.

**Proof/effect:** creation preserves all existing references; no cascade/delete
or silent substitution. Before release, qualify a practical treatment for
accidental and obsolete lists, with existing work/history preserved and clear
authorized recovery. That gate applies to releasing additional-list creation as
an operable feature, not merely to implementing a future Retire button. Do not
ship permanent unusable clutter while claiming lifecycle was reviewed.

A minimum proposal to “withdraw from new admissions while existing work continues
normal stage use” is reasonable but **not uniquely compelled** by these sources.
It is the strongest recommendation for the subsequent lifecycle question: it can
limit future use without forcing historical work to migrate or become unreadable.
Existing operations would remain source-governed, and detailed reopening/default
consequences would need explicit resolution. This recommendation is **not adopted**.
Adding that behavior or Restore now would be a material amendment to Q14's reserved
scope, requiring explicit founder ratification. Otherwise keep it a subsequent
decision and record the release dependency. Neither approach requires physical
state names to be fixed now.

### O7 — Additional catalogs silently change reports or method meaning

**High; likely if aggregation joins only by stage text or ordinal.** E4/E6/E9.
**Requirement:** “Reads and reports retain list/stage identity and applicable
historical meaning. Equal names, positions or stage counts do not establish
cross-list progress equivalence, probability, donor value or financial outcomes.”
Normal authorized views must account for existing records across applicable lists;
an explicit narrower filter may exclude them with clear meaning.

**Proof/effect:** identically named stages in two lists remain distinguishable;
report scope/coverage and authorized counts reconcile. Adding a catalog does not
reclassify old history or improve conversion rates. P33 owns any separately
qualified equivalence/metric, not a new P27 mapping engine. P28's financial/prayer,
terminal and suppression vocabulary still requires reconciliation with D3/D6–D13
and source owners; custom lists do not ratify that legacy text as one final enum.

## Scope, alternative and disposition

B is simpler: one supplied list per supported approach, with stages/guidance and
direct choices accommodating variations. The founder chose additional lists;
that can avoid confusing combined vocabularies. No inspected evidence proves a
required number of lists or that more always improves ministry outcomes. Retain
useful supplied lists and organizational configuration, not mandatory proliferation.

Conclusive now: bounded creation, source ownership, usable available configuration,
stable scoped identity, atomic durable acceptance, unchanged journeys/effects,
current authority and clear creation/edit outcomes. Optional stage assessment and
direct movement remain available under D11–D13.

Still to resolve: whole-list lifecycle; exact applicability and how a journey gets
its list; default/suggestion policy; copying/inheritance if offered; later switching
and mapping; named report meaning. The accepted D14 answer does not require
reratification merely to preserve those explicit reservations. It also does not
qualify any dependent implementation or the full Phase 27 for release. Resolving
those product choices, then exact source contracts and real user/source proof,
is the permanent path; an invented lifecycle engine is not.
