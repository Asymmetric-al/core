# D17 — usual-list initialization and source ownership

2026-10-10. Founder selected Q17 **A**: visibly prefill the sole currently eligible
list; with several choices, use an optional eligible organization-usual list or
ask the person to choose. Preserve an established valid choice. Targeted research
against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and working-tree
ratified D1–D16. This appendix changes no implementation, formal specification,
issue or live configuration.

**Recommendation: Accept; no material amendment identified.** The new capability
is a bounded optional initializer, not authoritative assignment. Set, replace and
unset follow from choosing an optional usual list. The findings below specify
inherited source/permission/intent safeguards. They do not introduce another
configuration lifecycle, approval system or default hierarchy.

## Evidence and status

- **E1 — Selected policy:** [Q17:23–43](../phase27-q17-initial-list-choice.md:23),
  [80–101](../phase27-q17-initial-list-choice.md:80). Visible initialization,
  optional usual choice, no stage inference, preserved established intent and
  finite reviewed groups. The question file records the offered policy; the
  current founder answer selects A. Selection is intended behavior, not activation.
- **E2 — Shared source and separate powers:**
  [D16 R01–R04:193–228](../phase27-d16-adversarial-review.md:193),
  [D14 R02/R03:234–250](../phase27-d14-adversarial-review.md:234).
  One exact source list, stable scoped identities, independently qualified
  discovery/use/admission/configuration, no extra process-specific restrictions.
- **E3 — Draft, admission and retry:**
  [D16 R05–R08:230–269](../phase27-d16-adversarial-review.md:230),
  [D4:29–61](../phase27-d4-adversarial-review.md:29).
  Preserve valid input; accept exact source intent; reject relevant invalidity,
  not unrelated catalog changes; atomic per-member outcomes and durable recovery.
- **E4 — Withdrawal and restoration:**
  [D15 R04–R06:200–237](../phase27-d15-adversarial-review.md:200).
  Withdrawal requires valid explicit treatment of actual default dependencies;
  restoration never silently restores removed references. Zero new-use lists is
  permitted, but fresh admission without a valid list is not.
- **E5 — Owning domains:**
  [P27:4087–4103](../../../../prds/sitestacker-parity/roadmap.md:4087) gives P27
  enrollment meaning and preserves P9 identity/assignments/tasks and the financial
  and communication owners. [Retained constraints:17–21](../../../../prds/program-roadmap/owner-constraints.md:17)
  and [platform boundaries:13–25](../../../../../openspec/specs/platform-boundaries/spec.md:13)
  require one shared model across staff/missionary surfaces.
- **E6 — Current authorization:**
  [P12:1464–1468](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1464),
  [2846–2858](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846).
  Trusted current context, purpose, scope, capabilities, disclosure floors and
  epoch govern every read/write/job. Names and cached state are not authority.
- **E7 — Effects and execution:**
  [ADR-0183:18–48](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:18),
  [orchestration:13–32](../../../../../openspec/specs/workflow-orchestration/spec.md:13),
  [DON-14:1651–1677](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1651).
  Configuration is not a task predicate or enrollment event; execution owns no
  product fact. DON-14 remains disabled/unqualified pending its exact bindings.
- **E8 — Stage remains separate:**
  [D13:18–40](../phase27-d13-adversarial-review.md:18) permits absence of an initial
  assessment and preserves existing recorded stages. A list default supplies no
  stage, assessment date, financial forecast or lifecycle change.

These are current governing documents and selected product intent. They are not
evidence that P27 defaults, catalog authorization or admission services already
exist or have passed runtime verification. A targeted source search did not
identify a matching cultivation/stage-list implementation; that search alone is
not exhaustive proof of absence. No new issue, deployment or practitioner study
was necessary to settle the owner boundary.

## Concerns, exact requirements and proof

### O1 — A preference becomes a moving assignment

**High impact; likely if admission stores “use the default” instead of a list.**
E1/E2/E3. **Requirement:** Resolve the initializer into one visible concrete list
proposal. Once valid intent is established, changing/removing the usual setting
must neither retarget that proposal nor make it invalid while its selected list
remains eligible. Admission validates that selected list, not whether it is still
usual or still the sole choice.

**Proof/effect:** Prefill A; change usual choice to B or unset it; submit A
successfully if otherwise valid. Adding eligible B after A was the sole choice
also preserves A. No global default revision equality check becomes an admission
prerequisite. Relevant list withdrawal or permission loss still blocks that target.

### O2 — Optional setting grows an authorization or precedence system

**High impact; plausible with app-local settings or role-name shortcuts.** E1/E2/E6.
**Requirement:** Permit an authorized configurator to set, replace or unset one
optional usual-list reference in the actual owner-qualified catalog scope. Validate
stable same-scope identity and new-use availability. Unsetting requires no replacement.
Qualify configuration authority separately from discovery/use and journey admission.

**Proof/effect:** A configuration-only actor can configure within its authority
without receiving journey access; a starter can use permitted lists without gaining
configuration power. Creator departure does not destroy organization-owned settings.
No personal-memory, surface, ministry, team, Party-type, inherited fallback or
priority hierarchy is introduced. Exact capability names and physical scope remain
owner qualifications, not a new tenant-wide or Legal Entity partition chosen here.

### O3 — Withdrawal and default removal are confused

**High impact; plausible during configuration cleanup.** E1/E4.
**Requirement:** Withdrawal of a defaulted list explicitly removes, replaces or
disables its actual dependent entry configuration under D15 before withdrawal is
accepted. Setting or replacing a default must not race into a withdrawn/invalid
target. Removing only the default does not withdraw the list. Restoring list
availability does not recreate its former usual setting.

An ordinary withdrawal action may expressly include clearing its matching usual
reference, with both powers validated. Accept them together where the qualified
owner boundary supports that operation; otherwise preserve D15's prior repair and
revalidation path. Clear only the actual matching reference, never a concurrently
selected replacement. Explain included consequences without requiring another wizard.

**Proof/effect:** Default A → unset leaves A available for explicit new selection
and existing valid drafts. Withdraw A → stale fresh admission to A fails without
substituting B. Restore A → no resurrected default; selecting it as usual again
requires an authorized real configuration change. Use existing owner commands and
ordered acceptance, not a cross-domain repair engine.

### O4 — Configuration writers lose changes or replay old settings

**Medium/high impact; plausible with simultaneous editors or lost responses.** E2/E3/E4.
**Requirement:** Default configuration mutations revalidate current authority and
expected configuration state, preserve actual change history and recover their
accepted result without reapplying a stale mutation over a successor. Keep this
configuration concurrency protection separate from admission's list validation.

**Proof/effect:** Editor 1 replaces A with B while editor 2 unsets observed A: one
stale write cannot silently erase the other. A lost-response retry of accepted B
after a later authorized unset returns the permitted original result rather than
restoring B. A no-op need not fabricate a change. No additional approval, revision
browser or event-sourcing platform follows.

### O5 — Incomplete options or inaccessible defaults become false certainty

**High impact; likely with paginated/search results or cached context.** E1/E2/E6.
**Requirement:** Prove complete current authorized zero/one/many coverage before
applying cardinality behavior. Resolve default usability within current permitted
source context; disclose no hidden default identity/name. Never infer unset from
failed/unknown lookup or choose the first returned item as fallback.

**Proof/effect:** One search hit among several choices does not trigger sole-option
prefill. Late data from a previous tenant/context cannot populate the new form.
An indeterminate default read is not “no default,” but an independently authorized
explicit selection can proceed when its source intent is fully validated: an
optional convenience read is not new admission authority or a blanket dependency.

### O6 — Reinitialization overwrites staff intent or carries a wrong stage

**High impact; plausible with reactive forms or background refresh.** E1/E3/E8.
**Requirement:** Initialize unresolved input without overwriting established valid
choice on refresh/default changes. A deliberate unsaved list revision uses D16's
visible resolution of an incompatible proposed stage and preserves unrelated input.
No server fallback may silently replace a submitted invalid list or stage.

**Proof/effect:** Staff change prefilled A to B; later A/default callbacks do not
restore A. A's stage cannot accompany B by matching label. Final intentional
absence remains allowed by D13. No picker click creates stage history or requires
a separate save, mandatory preview or acknowledgement ceremony.

### O7 — Reviewed groups follow later defaults or uncertain results reset work

**High impact; plausible with deferred execution.** E1/E3.
**Requirement:** Bind the finite reviewed operation's actual list/stage intent per
member; do not resolve “usual at execution” or infer all scope from its first row.
Recheck each unaccepted member's current eligibility, preserve independent atomic
outcomes and recover accepted/unconfirmed results before proposing different work.

**Proof/effect:** A group reviewed with A retains A after default B is configured.
Withdrawal of A blocks remaining fresh admissions; previously accepted members
remain. A lost response followed by default B never switches accepted A or creates
a duplicate ordinary journey. Existing reuse/return preserves its current binding,
including retained withdrawn-list use qualified by D15.

### O8 — Default initialization leaks into other source-owned facts

**High impact; plausible if reused as an enrollment event.** E5/E7/E8.
**Requirement:** Default configuration and visible prefill alone create no journey,
stage assessment, task, reminder, workflow enrollment, money fact, participation,
consent or message. Actual deliberate admission retains D4's normal dated work or
owned actionable exception and source-purpose effect identity.

**Proof/effect:** Opening, changing or cancelling a starting form emits no DON-14
enrollment. Staff and missionary views consume the same accepted binding; their
different permission contexts do not create separate usual-list business truth.
Optional Workflow Studio is neither required nor a second configuration authority.

## Disposition and remaining qualification

The strongest simpler alternative is B: force explicit selection when several
lists exist, avoiding organization-default configuration and overlooked prefills.
The founder selected A's optional convenience; an organization can still leave its
usual setting unset. Do not silently choose B through repeated confirmation or
require a default to exist. Actual error-rate benefits remain unmeasured.

Carry O1–O8 into the later formal owner contract and implementation acceptance.
They are precision within Q17 and D4/D14–D16, not additional founder choices.
Before release, qualify actual catalog scope, capabilities, configuration storage/
history/concurrency, authorized option coverage, role/context behavior and browser
recovery. Safe correction of a mistaken accepted list remains D16's separate
release prerequisite; D17 authorizes no saved switching or correction policy.
No phase-ready or implemented claim follows from accepting this decision.
