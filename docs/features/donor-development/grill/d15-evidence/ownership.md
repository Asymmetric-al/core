# D15 — whole-list withdrawal, continuing work and bounded recovery

2026-10-10. Founder selected **A: existing work continues using a list withdrawn
from new work**, and requested full adversarial review. Research against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3` and working-tree ratified D1–D14.
No product code, formal specification, live data or external state was changed.
The clauses marked **proposed material amendment** are recommendations, not ratified
policy. This appendix provides ownership evidence; it does not claim implementation
or complete Phase 27 readiness.

**Recommendation: Accept A with explicit required amendments** covering retained
bindings on return, reversible new-use availability, usable retained catalogs and
deliberate withdrawal of the last new-use option. These resolve the consequential
cases Q15 expressly reserved. Do not present them as already settled by D10.

## Evidence and settled boundaries

| Ref | Exact anchor                                                                                                                                                                                                                                                                                                                                               | Established fact or intended contract                                                                                                                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1  | [Q15:22–45](../phase27-q15-retiring-stage-lists.md:22), [78–101](../phase27-q15-retiring-stage-lists.md:78)                                                                                                                                                                                                                                                | A stops new partnership use while ongoing work can choose available stages. Individual retired stages remain unavailable. Return/default/restoration/switching/unused-list cases were reserved for review or subsequent decisions.    |
| E2  | [D8:15–33](../phase27-d8-reopening-review.md:15); [D9:10–31](../phase27-d9-recorded-stage-review.md:10); [D6:88–103](../phase27-d6-adversarial-review.md:88)                                                                                                                                                                                               | Same journey on genuine return; recorded stage/history preserved without compulsory assessment. Existing pause review remains source-owned. These alone did not decide later stage choice on a withdrawn whole list.                  |
| E3  | [D10:142–173](../phase27-d10-adversarial-review.md:142), [210–258](../phase27-d10-adversarial-review.md:210)                                                                                                                                                                                                                                               | Stable meanings; **stage** retirement/restoration; at least one selectable stage in a list available for new work; current revisions/receipts; no silent migration, remapping or template overwrite.                                  |
| E4  | [D13:18–48](../phase27-d13-adversarial-review.md:18); [D12:166–197](../phase27-d12-adversarial-review.md:166)                                                                                                                                                                                                                                              | First assessment may occur later; direct eligible stage choice and truthful history remain. Optional assessment cannot replace required source context or accountability.                                                             |
| E5  | [D14:234–269](../phase27-d14-adversarial-review.md:234), [383–394](../phase27-d14-adversarial-review.md:383)                                                                                                                                                                                                                                               | Shared source list; configuration authority differs from journey and name-availability disclosure; qualified canonical naming; whole-list lifecycle required before creation release, but not previously selected.                    |
| E6  | [D4:37–69](../phase27-d4-adversarial-review.md:37); [D7:55–80](../phase27-d7-adversarial-review.md:55)                                                                                                                                                                                                                                                     | Finite reviewed admission checks current eligibility per atomic member; prior review is not permanent authority. Migration preserves evidenced existing work separately from new admission. Closure/task outcomes remain independent. |
| E7  | [P12:1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464), [2846–2858](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846); [P27/P28:4101–4105](../../../../prds/sitestacker-parity/roadmap.md:4101), [4181–4185](../../../../prds/sitestacker-parity/roadmap.md:4181) | Current trusted context/capability/purpose/scope/history/epoch applies to every path. P27 owns cultivation, P28 consumes it; identity, work, finance and communication retain their authorities.                                      |
| E8  | [ADR-0183:18–48](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:18); [ADR-0027:50–65](../../../../adr/0027-one-notification-presentation-and-engagement-model.md:50); [DON-14:1651–1677](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1651)                                                                  | Configuration alone creates no task/notification or cultivation occurrence. Child work and attention cannot be revived by a catalog operation. Optional Studio still requires exact qualification.                                    |
| E9  | [platform boundaries:13–25](../../../../../openspec/specs/platform-boundaries/spec.md:13); [workflow OpenSpec:13–30](../../../../../openspec/specs/workflow-orchestration/spec.md:13); [P33:4636–4646](../../../../prds/sitestacker-parity/roadmap.md:4636)                                                                                                | One shared source across surfaces; executor is not authority; reports/import history require declared source meaning, access and coverage.                                                                                            |

These are source intent and prior decisions. No deployed retirement behavior was
inspected or tested here. The prior D14 create-list experiment expressly did not
qualify withdrawal, return or restoration; it is not D15 proof.

## Proposed permanent policy and adversarial consequences

Severity concerns prospective impact; likelihood is conditional engineering judgment,
not an observed incident rate. Proofs below are future acceptance obligations.

### O1 — Active-only grandfathering strands paused or returning work

**High; plausible with lifecycle-filtered eligibility.** E1/E2/E4.
**Proposed material amendment M1:** “Continued use follows the journey's current
retained list binding, including an otherwise permitted resume or genuine reopening
of that same journey. Preserve its recorded stage or unassessed condition; allow
ordinary first/later assessment using currently available stages under the same
source rules. List withdrawal alone does not require moving or reassessing it.”

This extends A beyond its expressly offered ongoing-work case. It does not grant
ordinary stage editing while a journey is closed, waive source prerequisites for
return, or revive old tasks/reviews/attention. An independently retired stage stays
unavailable for fresh selection, while its existing reference remains interpretable.

**Proof/effect:** assessed and unassessed journeys pause/close before withdrawal,
then validly return without a new list requirement. First later assessment remains
possible. Retirement does not cancel the D6 review or close D7 work. Staff and
missionary projections agree under their independent visibility.

### O2 — Historical use, old dates or queued requests bypass withdrawal

**High; likely with checks on creation date or past stage history.** E1/E3/E6.
**Proposed boundary accompanying M1:** “Ordinary new attachment to a withdrawn list
is unavailable. Existing use means the current authoritative retained binding,
not any historical association, client timestamp or old approved request.”
This also constrains any later qualified switch: switching away gives no permanent
right to switch back while the list is withdrawn. It does not itself add switching.

**Proof/effect:** list withdrawal and new admission have a definite accepted order;
admission accepted first remains existing work, withdrawal accepted first blocks
unaccepted members without retargeting. D4 group partial results remain truthful.
Current-bound safe reuse succeeds where otherwise permitted; an old journey on
another list cannot claim historic eligibility. An earlier accepted receipt remains
historical evidence and cannot recreate or switch current work.

### O3 — Accidental withdrawal has no safe recovery, or Restore revives history

**High; plausible without an explicit inverse action.** E1/E3/E5/E8.
**Proposed material amendment M2:** “An authorized configuration action may make
the same retained list available for new work again. Preserve its identity and
append truthful configuration history. Revalidate current authority, revision,
usable stages and applicable naming/default constraints. Do not restore independently
retired stages, former defaults/grants, old bindings or ended work.”

This is a new whole-list capability, not D10's stage restoration. Same-meaning
repair keeps identity; materially different stage meanings still use D10 identities.
Do not roll back definitions to a historic snapshot or restore erased content.
D15 adds no destructive deletion, archive framework or persistent draft/publish
process; lawful retention/erasure remains separately governed.

**Proof/effect:** withdraw → make available → withdraw records three real states
without stale replay undoing the latest choice. Restore after actor revocation
fails. A current canonical-name conflict receives permitted explicit resolution
or rejection, never silent rename, identity merge or permission leakage. Naming
scope/reuse must satisfy D14's qualified policy; no new cross-tenant namespace or
automatic retired-name reuse is inferred.

### O4 — A retained list loses its last selectable stage

**High; plausible because D10's literal minimum covered new-work lists.** E3/E4.
**Proposed material amendment M3:** “Every list offered for new use or retained for
continued existing-work use must retain at least one selectable stage. Withdrawing
new use neither retires its stages nor permits invalidating that minimum.”

This extends the usable-catalog rule; no hidden journey-usage count is needed to
decide whether removing the last choice is safe. Under the proposed minimal model,
retained lists remain usable definitions, including for future permitted return.
Stage edits continue under D10 rather than being silently frozen by withdrawal.

**Proof/effect:** two concurrent edits retiring different last choices cannot leave
zero. A first assessment on a withdrawn list remains possible. Existing malformed
legacy zero-stage data stays visible, with source-authorized configuration repair;
do not erase a recorded stage, fabricate a placeholder, or block unrelated follow-up,
history reads or lifecycle actions merely to force repair. A stage change still
needs a real eligible target. D13's unassessed condition is not a repair bypass.

### O5 — The last new-use option creates a hidden enrollment shutdown or fallback

**High; plausible with visible-row counts, partial applicability or first-list defaults.** E1/E3/E5/E7.
**Proposed material amendment M4:** “An organization may deliberately withdraw the
last list available for new work in the owner-qualified applicability scope, provided
the resulting configuration is valid. New admissions lacking an eligible list are
unavailable with truthful permitted recovery until one becomes eligible. Existing
retained work continues; no hidden fallback, guessed list or unassessed bypass.”

Allowing zero new-use options is a new choice. The credible stricter alternative
requires a valid replacement before withdrawing the last option; it reduces
accidental blockage but forces continued new-use availability. M4 better preserves
deliberate tenant control without adding a separate enrollment enable/disable system.
Explain the actual permitted consequence within the action; do not add a routine
second approval/confirmation or treat the actor's visible count as authoritative.

**Conditional default requirement:** “Where a separately qualified default rule is
affected, accept withdrawal only with explicit authorized valid treatment in the
same accepted change, or reject with a permitted repair. Never substitute the first
list or silently revive a removed default when availability returns.” Valid removal
versus replacement depends on that owner rule; D15 creates no default feature.
Zero is not valid if an independently required default remains invalid.

**Proof/effect:** last-list retirement intentionally blocks only affected new work;
other qualified scopes and existing work continue. A hidden or incompatible list
is not a substitute. Simultaneous withdrawals/default changes converge on valid
configuration. Uncertain applicability is not proof of zero. Resolve exact
applicability before activating dependent commands, not by a tenant-wide count.

### O6 — Withdrawal is confused with configuration ownership or business outcome

**Critical disclosure / High integrity; plausible.** E5/E7/E8/E9.
**Inherited clause:** “List availability is configuration, not journey lifecycle,
stage assessment, responsibility, consent, financial outcome or actionable work.
Authorize the exact catalog operation independently of journey/usage/history and
name-availability disclosure. Shared surfaces consume the same source eligibility.”

**Proof/effect:** no current journey/stage/date or source task/notification changes
from withdrawal/availability restoration alone; no DON-14 occurrence is invented.
Visible configuration history uses trusted actor/time and current disclosure.
Reports retain withdrawn-list records in their declared populations and preserve
history; filtering new-use options must not become a global filter hiding existing
work. Do not expose private journey counts to justify retirement.

### O7 — Imported history, stale clients or repairs manufacture existing use

**High; plausible with all-path inconsistency.** E3/E6/E7/E9.
**Inherited clause:** “Normal admission, APIs, jobs and repairs enforce current
new-use eligibility. A separately qualified migration may preserve an evidenced
pre-existing journey/list binding with actual provenance; it may not turn a client
claim, matching label or backdated timestamp into grandfathered authority.”

**Proof/effect:** reject stale fresh selection, including optional automation;
preserve correctly mapped evidenced history without pretending to accept a new
enrollment or assessment. Imports remain outward-effect-dark. Known binding,
unknown provenance and current denial remain different; errors disclose only what
the actor may know. A collision follows D2/D3/D4 reuse/correction owners and does
not create a duplicate journey or choose a replacement by name. Exact migration
and switching operations still need their own qualification.

## Minimum solution and remaining frontier

Use source-owned new-use availability, current retained bindings, D10 stage
eligibility and existing finite configuration commands/history. Two deliberate
availability directions suffice; no catalog snapshots per journey, per-person
grandfather grants, generic successor graph, transition-rule engine or new task
scheduler is justified. Exact controls should say what changes for **new work**
and distinguish list withdrawal from an individually retired stage.

M1–M4 are proposed material amendments and require explicit ratification if adopted.
They are not established by documentation publication or a fixture test. They
resolve return/recovery/usability consequences without choosing preset applicability,
initial suggestions/default rules, general switching/mapping, historical correction,
unused-list erasure or metric formulas. Those dependencies must be qualified before
their affected paths ship. D14's creation release gate and the full Phase 27
source/API/browser/migration/usability proof remain; this review alone clears none.

## Consolidated review disposition

The [completed D15 review](../phase27-d15-adversarial-review.md) reconciles this
research into an exact amended decision, including return, reversible
availability with saved-list retention, usable retained catalogs and zero-new-list
treatment. The founder explicitly ratified that decision and its safeguards on
2026-10-10. Earlier proposed labels and reservations here record the evidence-stage
scope, not a competing current recommendation. The full
review defines the owner-native dependency, naming-conflict and release-proof
requirements. No product implementation follows from publication of this appendix.
