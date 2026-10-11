# D18 — changing the process without changing the partnership

2026-10-10. Founder selected Q18 **A: allow deliberate saved-list changes** and
requested the full adversarial review. This ownership appendix reads current Core
HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and working-tree accepted/ratified D1–D17 decisions.
It changes no formal specification, issue, product code or live configuration.

**Disposition: Accept A as the bounded capability; no material amendment is needed.**
The current-stage treatment is a required product decision before exposing saved-list
changes, not an implementation detail or optional follow-up. This review can finish
the capability's ownership boundary without claiming a complete transition policy
or release qualification. Selecting a stage-handling or reserved lifecycle policy
inside this review would require an additional founder decision.

## Evidence and authority

- **E1 — Exact selected scope:** [Q18:21–40](../phase27-q18-changing-saved-list.md:21)
  permits another eligible approved list on the same partnership, preserving history.
  [Q18:75–93](../phase27-q18-changing-saved-list.md:75) expressly reserves current-stage
  handling, paused/closed behavior, bulk operations, cross-scope moves, historical
  correction and automatic mapping. The founder's answer selects the offered A;
  the question's examples are hypothetical, not observed agency practice.
- **E2 — Identity and independent facts:** [D2:20–61](../phase27-d2-adversarial-review.md:20),
  [D3:20–53](../phase27-d3-adversarial-review.md:20).
  Party, source ministry, continuing purpose and exact Tenant/Legal Entity identify
  the work. A different preset alone cannot justify another ordinary journey.
  Source identity repairs, participation, responsibility, consent and finance remain
  independently owned.
- **E3 — Catalog versus record state:** [D14 R02/R03:234–250](../phase27-d14-adversarial-review.md:234),
  [R07:298–306](../phase27-d14-adversarial-review.md:298).
  One applicable list and its valid current stage/qualified absence; stable scoped
  identities and source-qualified permissions. Configuration power is not journey
  mutation/history power. Earlier blanket ordinary-update restrictions require a
  specifically qualified switch command, not a generic patch bypass.
- **E4 — Target eligibility and return:** [D15 R01–R05:176–222](../phase27-d15-adversarial-review.md:176).
  Current retained binding supports continued withdrawn-list use. Switching away
  and back is a new attachment, never inherited eligibility. Resume/reopen preserves
  the retained list/stage; withdrawal does not force migration.
- **E5 — Draft and saved distinctions:** [D16 R05–R08:231–269](../phase27-d16-adversarial-review.md:231)
  separates local draft revision, accepted work and uncertain outcome. Its permission
  to visibly resolve an incompatible unsaved stage does not authorize clearing a
  saved assessment. [D17:20–37](../phase27-d17-adversarial-review.md:20) makes initial
  defaults prospective convenience, not continuing assignment.
- **E6 — Mutation and reporting safeguards:** [D12 R08–R11:238–294](../phase27-d12-adversarial-review.md:238)
  requires source revision, truthful retry, real occurrences and current disclosure;
  preserves source-owned work and qualifies report interpretation. [D10 R11:238–247](../phase27-d10-adversarial-review.md:238)
  rejects label/rank equivalence and retroactive reclassification.
- **E7 — Product owners:** [P27:4087–4105](../../../../prds/sitestacker-parity/roadmap.md:4087),
  [P28:4163](../../../../prds/sitestacker-parity/roadmap.md:4163),
  [4181–4183](../../../../prds/sitestacker-parity/roadmap.md:4181).
  P27 owns cultivation meaning; P28 uses its shared source. P9, P12, finance and
  communications retain their facts. The legacy P28 mixed labels do not grant
  consent, participation, financial or lifecycle effects to a list change.
- **E8 — Work and execution:** [ADR-0183:38–100](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:38),
  [DON-14:1651–1677](../../../../prds/workflow-studio/07-core-workflow-catalog.md:1651),
  [Studio source authority:19–31](../../../../../openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:19),
  [semantic effects:339–347](../../../../../openspec/changes/add-workflow-studio-program-contracts/specs/workflow-studio/spec.md:339).
  The source owns applicability/end/recurrence; Studio invokes qualified commands.
  DON-14 is disabled and its exact source bindings unresolved.
- **E9 — Authority and measurement:** [P12:2846–2858](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:2846)
  requires current context and exact applicable scope. [P33:4604–4610](../../../../prds/sitestacker-parity/roadmap.md:4604),
  [4636–4646](../../../../prds/sitestacker-parity/roadmap.md:4636) distinguish source
  facts from governed query meaning, historical basis and completeness.

These are governing intent and source boundaries, not proof of a shipped switch
service. This pass performs targeted contract review, not a fresh production audit,
browser test or agency study. Current implementation qualification belongs to the
actual source/API/UI evidence in the consolidated review.

## Graded concerns and exact clauses

### O1 — Switching becomes duplicate admission or a scope transfer

**High impact; plausible with reuse of a create/upsert flow.** E1/E2/E3.
**Clause:** “The operation changes the current stage-list binding on the same
authorized journey. Preserve supporter, ministry, continuing purpose and source
scope; do not close/re-enroll, clone, merge or transfer work as an implementation
shortcut. A separately proposed source identity/purpose change uses its own owner.”

**Proof/effect:** A→B preserves journey identity, admission history, responsibility
and linked asks. A changed ministry/Legal Entity cannot be smuggled into the switch
payload. Choosing a different list neither cures hidden duplicate work nor confers
visibility. D18 adds no purpose registry or generalized migration engine.

### O2 — An unresolved current-stage decision is silently implemented

**High impact; likely if only the list foreign key is updated.** E1/E3/E5.
**Clause:** “Before exposing saved-list changes, decide and qualify the visible
current-stage treatment. The accepted target-list/current-stage disposition must
be coherent in one authoritative source acceptance with its required history and
result. D18 does not choose clearing, mandatory reassessment, retention as a foreign
current stage, first-stage defaults or label/order mapping.”

**Proof/effect:** A/Stage A→B cannot leave Stage A as B's current stage; it also
cannot silently become unassessed or Stage B. Previous assessment evidence remains
historical. D13's initial absence and D16's draft clearing do not supply the missing
policy. Do not redefine A as an unassessed-only feature to avoid deciding the main
case. Atomic coherence is mandatory; the resulting stage policy remains open.

### O3 — Correcting the present rewrites what was previously recorded

**High impact; plausible when “correction” is treated as unrestricted edit.** E1/E3/E6.
**Clause:** “Record a real accepted list change and retain the earlier list/stage
meaning, source attribution and ordering under lawful current disclosure. A
prospective correction changes the present; it does not pretend the erroneous
earlier record never existed or change accepted asks, contacts or financial facts.”

**Proof/effect:** Staff may describe the original choice as mistaken without that
description authorizing backdating, historical remapping or target-eligibility
bypass. A genuine earlier A selection remains evidence of what was recorded, not
proof that A was the correct business assessment. Historical correction needs its
separately qualified source contract. No compulsory narrative, new reason taxonomy
or additional approval role follows merely from preserving truthful history.

### O4 — Past use or default preference bypasses target eligibility

**High impact; plausible with cached choices and switch-back shortcuts.** E4/E5/E9.
**Clause:** “Re-prove current record-mutation authority, permitted target discovery
and target new-attachment eligibility at acceptance. Retained use of a withdrawn
current list does not make it eligible as a fresh target. The organization-usual
list never changes or chooses a saved-work target on the actor's behalf.”

**Proof/effect:** A→B→A is allowed only if A is then eligible for a new attachment.
Withdrawing A while it remains attached neither forces switching nor ends normal
retained use. Restoring A/default changes do not move saved work. Permission loss
or target withdrawal yields permitted recovery, not guessed substitution. Exact
capabilities and catalog scope require qualification; no per-list ACL is invented.

### O5 — Repetition, races and lost responses overwrite accepted history

**High impact; plausible with simultaneous stage edits or late retries.** E3/E5/E6.
**Clause:** “Use current source revision and qualified target-eligibility ordering;
bind each deliberate switch intent to exact journey/scope/target and the later
qualified stage disposition. Atomically preserve accepted state, required history
and receipt. Recover retries without repeating effects or overwriting successors.”

**Proof/effect:** A→B→A can be separate real occurrences; lifetime uniqueness on
journey/list must not suppress the return. A stale editor observing an earlier A
cannot overwrite the later A occurrence merely because the value matches. A lost
response for accepted B followed by another change recovers B's original result
without asserting B is still current. Same-list no-op is not a new assessment or
configuration revision. No generic transition graph or event-sourcing platform is
needed to enforce these inherited invariants.

### O6 — List change restarts work or manufactures another owner's facts

**High impact; plausible if treated as an enrollment/stage trigger.** E2/E7/E8.
**Clause:** “Changing lists alone neither enrolls again nor completes, cancels,
duplicates, revives or reassigns tasks, reviews or reminders. Preserve unrelated
work; evaluate only genuinely affected, already qualified source predicates and
their owner-controlled dispositions. Active work retains appropriate dated work
or its explicit owned actionable exception.”

**Proof/effect:** A due call remains due unless its own source condition changes;
no new welcome/ask is sent. A future qualified assessment may have its own source
meaning, but a bare list-change receipt is not automatically DON-14 admission or
stage transition. Native/Studio effects share source-purpose identity. No global
dependency wizard is required. Participation, consent, giving, commitments, asks,
lead responsibility and lifecycle do not change merely because a list changes.

### O7 — Reports imply progress or rewrite historical categorization

**Medium/high impact; plausible with current-list joins or ordinal funnels.** E6/E7/E9.
**Clause:** “Preserve historical list/stage identities and meaning. Where reported,
distinguish the current grouping from the recorded historical basis; describe
coverage and time interpretation. Equal names/ranks across lists prove neither
equivalence nor progress. P33 owns separately qualified formulas and derived views.”

**Proof/effect:** Moving between equally named stages is not a new supporter,
conversion, gift or completed activity. A current-list board may show B without
relabeling prior A events. D18 does not decide time-in-stage reset, attribution,
conversion denominator or cross-list equivalence, nor require several new reports.
Privacy/retention/redaction remain current-owner rules, not unlimited historical
access or a perpetual sensitive-copy requirement.

## Strongest alternative and remaining gates

B avoids routine list transitions when the original choice was sound, simplifying
continuity and interpretation. It still needs real mistaken-choice recovery and
therefore does not eliminate the stage/history challenge. A better matches the
selected flexibility while retaining the same partnership; no measured frequency
or efficiency claim follows.

Accept the bounded capability with O1–O7 as inherited precision. The immediate
next product dependency is current-stage treatment. Paused/closed operation,
bulk migration, cross-scope moves, automatic mapping and historical correction
remain unselected, not silently granted or permanently forbidden. Expose no
unsupported path. The already-required mistaken-choice recovery must be qualified
before the starting-choice flow ships; D18's capability answer alone does not
complete that gate. Actual source permissions, concurrency, reader compatibility,
shared staff/missionary UI, affected work projections and reporting consumers
require proof before activation. No phase-ready claim or new ADR is justified here.
