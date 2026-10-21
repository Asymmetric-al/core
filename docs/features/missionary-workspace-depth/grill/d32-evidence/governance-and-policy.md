# D32 governance and organization policy

Reviewed **October 18, 2026 UTC**, against commit
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the working tree. The founder selected
Q32 A: one follow-up showing gift acknowledgment and fixed-commitment fulfillment,
with distinct evidence/completion for each, and requested organization control.
The founder subsequently explicitly chose one organization-wide setting; see
[scope clarification](scope-clarification.md). Defaults and temporal behavior
below remain **proposed amendments**, not ratified requirements. This note
does not implement or qualify a producer. Only this new research file is changed;
no previous evidence, model or database probe is rerun or edited.

## Conclusion and exact policy meaning

**Accept with required amendments.** The smallest coherent organization control
is **Together / Separate** for the specific qualified gift-plus-fulfillment
combination. Separate is the requested Off behavior: both independently required
follow-ups still exist. It does not turn stewardship off, change financial truth,
or let a tenant select completion authority.

The recommended default is **Together for a newly activated organization**,
consistent with the selected product experience. An upgrade with existing separate
work preserves **Separate until authorized staff deliberately choose Together**.
This is an explicit migration/default recommendation, not a claim that the founder
has separately chosen it. The founder explicitly selected one organization-wide
value, without per-missionary or per-project exceptions. No per-need or custom-purpose
overrides are proposed.

The setting applies to **currently unfinished eligible work**, including future
admission. It uses bounded source-owned recomposition: keep the canonical D20
gift group as the anchor and attach/detach only eligible unhandled fulfillment
membership. Preserve each source-purpose identity, coverage, history and
independently owned undertaking. This is not a general task-merge framework.

Suggested setting help: **“Changes how unfinished follow-ups are organized.
Completed history stays unchanged.”** No provider call, donor message, financial
mutation or new donor consent follows from changing it.

## Repository evidence and authority

| Source                                                                                                                                                                                                                                                                                                              | Verified meaning and D32 consequence                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder brief](../phase28-founder-brief.md:123)                                                                                                                                                                                                                                                                    | Low-friction completion must preserve actual outcomes; task completion must not invent a call, message or donor response.                                                                                                          |
| [Required native work](../phase28-founder-brief.md:167) and [program owner constraints](../../../../prds/program-roadmap/owner-constraints.md:74)                                                                                                                                                                   | Gift follow-up and fulfillment celebration are required independently. An optional composition setting cannot suppress either purpose.                                                                                             |
| [D20 C01](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:177)                                                                                                                                                                                                                                  | Distinct purposes remain distinct unless the owner explicitly qualifies shared coverage of an actual action. D32 is a bounded extension at that reserved boundary, not permission to combine all tasks.                            |
| [D20 C02–C04](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:184)                                                                                                                                                                                                                              | One current compatible gift group, exact Tenant/Legal Entity/typed subject/Party/responsibility/completion contract, stable business identities and separate source authority. A policy version cannot create a second gift group. |
| [D20 C05–C09](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:216)                                                                                                                                                                                                                              | Durable intent, exact reviewed membership, relevant-change fences, atomic coverage, truthful residual work and semantic retries. Unrelated additions do not invalidate the selected set or get silently covered.                   |
| [D20 C10–C13](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:266)                                                                                                                                                                                                                              | Human Done/Not needed is not financial truth. Corrections preserve independent promises; conditional Undo reconciles through the current-group owner rather than creating duplicate tasks; communication stays deliberate.         |
| [D20 actual-action boundary](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:483)                                                                                                                                                                                                               | A real interaction may satisfy compatible obligations only with explicit qualified evidence. Grouping does not close unrelated first-support, financial, care or receipt work.                                                     |
| [ADR-0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)                                                                                                                                                                                                                        | Independent follow-up owns a human deliverable. Completion authority is closed and code-owned, explicitly not a Tenant preference. Durable projection and reconciliation must survive the executor being absent.                   |
| [ADR-0183 migration boundary](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:651) and [platform boundary](../../../../../openspec/specs/platform-boundaries/spec.md:403)                                                                                                              | Existing contribution, prototype admin and missionary tasks are migration inputs. One shared task engine must preserve domain-specific authority; linked records alone cannot prove shared coverage.                               |
| [P9 queue ownership](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:512) and [pointer-grade links](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:812)                                                                                        | P9 surfaces the shared engine. A Party link is not a foreign-key-backed financial or completion authority; the D32 binding needs qualified typed source identities.                                                                |
| [P16 fixed-pledge meaning](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1037), [resolution fold](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1378) and [O.9](../../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1763) | Fulfilled is reversible source-derived progress, separate from promise lifecycle, donor ending and internal release. Current status is not a durable celebration occurrence; a source-qualified stable milestone is required.      |
| [P12 authorization spine](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1542) and [egress](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1643)                                                                                            | Exact policy-management, source-purpose handling and disclosure rights remain distinct. A staff policy permission does not disclose every affected task, and a task alias grants no read or mutation authority.                    |

### Current code versus intended behavior

The inspected [missionary task creation schema](../../../../../packages/api/src/missionary-portal/tasks.ts:30)
accepts ordinary title, description, status, priority and due date. Its
[insert](../../../../../packages/api/src/missionary-portal/tasks.ts:81) writes
`missionary_tasks`, sets `is_auto_generated: false`, and derives completion time
from that manual status. This is not a D32 composition/admission/coverage command.
The owner documents do not make these legacy task fields authoritative source
bindings. No hosted schema, deployed RLS, runtime producer or actual migration
behavior was qualified in this governance review.

## Temporal choice: current unfinished work

Two implementations were considered explicitly.

1. **Prospective exact pair decisions:** apply the setting when an exact gift and
   fulfillment pair first becomes eligible; retain previously accepted Together
   arrangements after Off and do not sweep old Separate decisions after On. This
   is coherent if communicated precisely. It is not equivalent to using the
   creation date of a task row: a D20 gift group can stay open and accept new gifts.
2. **Current unfinished-work recomposition — recommended:** changing the mode
   changes the arrangement of affected unfinished work while completed evidence
   remains historical. This matches a straightforward user-visible setting and
   avoids a long-lived mixed set of grandfathered arrangements.

The second approach is adopted for this proposed amendment. The first is a viable
rejected alternative, not a second simultaneous policy contract. The extra work
is bounded placement reconciliation for these two purpose classes; the proposal
does not create custom merge rules, per-task policy generations for users, or
another task store.

### Exact composition boundary

- **Together:** a qualified unhandled fulfillment occurrence may join the current
  compatible D20 gift group only through a source-qualified association to the
  independently qualifying gift that completes that exact fixed commitment.
  Already admitted compatible work may be reconciled into this arrangement;
  no historical fulfilled status is itself new work.
- **Separate:** the D20 gift group retains its gift memberships. Only unfinished
  fulfillment membership moves to its qualified standalone current placement.
  Neither purpose becomes Done, suppressed or newly eligible because it moved.
- **One active placement:** each source-purpose occurrence has at most one active
  actionable placement. Composition commands atomically establish its current
  placement, old placement disposition and durable reconciliation evidence.
  A retry may recover that result but cannot duplicate the obligation.
- **Keep the gift anchor:** the D20 group's stable identity and one-current-group
  invariant survive both directions. Do not split its gifts by policy epoch,
  create another group per viewer or replay covered gifts. A source implementation
  may preserve a suitable existing task identity without freezing physical tables.
- **Do not move unrelated work:** independently promised action, first-support,
  receipt, care, approval, finance exception, workflow source action or different
  responsibility remains governed separately. A shell containing such work stays
  live for that work; it is not an empty shell merely because D32 membership moved.
- **Empty old shells:** source-reorganization disposition is not human completion.
  Retain lawful history and safe current-placement navigation; old links, aliases
  or notifications are pointers, never new action or audience grants.

### Immediate authority, bounded reconciliation

The organization policy command accepts one current version and durable
reconciliation intent; it does not require one giant transaction over all tasks.
Each affected placement is reconciled under its owning scope and expected-current
fences. Current Separate mode blocks new joint acceptance immediately, including
an old combined screen or a command waiting for a lock. Projection delay may be
shown honestly as updating. It cannot grant a stale joint action, hide required
separate work indefinitely or force staff to repair rows manually.

Switching Together does not make an unsupported pair compatible or manufacture a
financial milestone. A still-valid separately reviewed single-purpose action
must remain usable through its source-purpose identity even if physical placement
is changing. A joint reviewed command whose relevant policy/composition changes
must refresh without losing the draft. Unrelated gifts or an unrelated policy
change do not invalidate otherwise unchanged selected work.

### Dates, notes, preparation and retained links

Preserve purpose-specific due dates, source dates, responsibility and provenance.
A combined queue may show the next relevant due date, but it cannot overwrite both
deadlines with the earliest, last-edited or preferred task date. Separating restores
the same unfinished-purpose dates, not a newly invented deadline. Changing mode
does not reschedule a promised action.

Keep notes, attachments and drafts in their existing governed source/audience.
Use qualified links rather than copying an old combined note into a new task with
broader access. Shared preparation with ambiguous purpose scope stays in its
original authorized context until a qualified action determines placement; it is
not discarded or silently assigned to both purposes. Preserve in-progress message
text and choices while requiring only the necessary scope review; regrouping must
not change recipients, message content, consent or send state. A retained link
must re-resolve current access and cannot become a back door to the old context.

## Findings requiring exact amendments

Severity and likelihood are qualitative judgments, not measured incidents.

| Concern | What goes wrong and why it matters                                                                                                         | Severity / likelihood                        | Evidence, effect and permanent fix                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G-F01   | Off suppresses native fulfillment or gift work, or Together changes source-controlled financial completion into a generic checkbox.        | High / likely with an ambiguous switch.      | Founder native duty and ADR0183 prohibit this. Narrows customization to G01/G02: arrangement only, code-owned independent human coverage.                                          |
| G-F02   | Task-row-age or frozen policy epochs keep stale combinations indefinitely or create two current gift groups.                               | High / plausible during mode changes.        | D20 C02/C09. Changes temporal design to G03/G04: current pending recomposition, stable gift anchor and one placement.                                                              |
| G-F03   | A policy change drops purpose membership, clones completion, calls a moved shell Done, or swallows an unrelated promise.                   | High / plausible during non-atomic movement. | D20 C08/C11/C12. G04/G08 retain exact source IDs, active placement, history and independent work under atomic scoped reconciliation.                                               |
| G-F04   | An old screen completes both purposes after Separate is accepted, or a blanket task revision blocks unrelated valid work.                  | High / plausible with concurrent handling.   | D20 C06/C07 and P12 queued-authority rules. G05/G06 fence the relevant current policy/composition and selected purpose versions, preserving unrelated and single-purpose work.     |
| G-F05   | A later purpose is silently covered by an earlier thank-you, or partial handling falsely completes both.                                   | High / likely without distinct coverage.     | D20 C08–C10. G06/G07 require independently recorded per-purpose dispositions and truthful residue; no inferred interaction or unseen-purpose coverage.                             |
| G-F06   | Reversible Fulfilled status, a refund/reapplication or a term version manufactures another celebration or erases completed human work.     | High / plausible.                            | P16 O9 and D20 C11. G08 requires the qualified durable fulfillment occurrence/correction contract and stable purpose identity; no status-derived or version-derived minting.       |
| G-F07   | Regrouping changes due dates, loses notes/drafts or copies private preparation into broader task access.                                   | High / plausible.                            | D20 C04/C14 and P12 egress. G09 preserves original source/audience, dates and safe links, with no copied permission or message mutation.                                           |
| G-F08   | Organization policy management exposes hidden task counts or authorizes handling across tenants, Entities or role scopes.                  | Critical / plausible.                        | D20 C02 and P12 spine. G02/G05/G10 separate policy authority, exact compatibility and each read/command; safe consequence preview does not require a global task roster.           |
| G-F09   | Upgrade silently merges old work or treats current historical fulfillment as a newly live occurrence.                                      | High / plausible.                            | D20 C05/C09, ADR0183 migration boundary. G03/G11 preserve Separate for existing deployments until deliberate activation and reconcile only admitted unfinished purpose identities. |
| G-F10   | A generic linked-record/task-status implementation is called complete without proving source admission, composition, recovery and history. | High / plausible.                            | Current manual task source and owner contracts differ. G12 requires source-shaped release proof; no current runtime qualification is claimed.                                      |

## Exact candidate clauses

**G01 — Selected outcome and bounded setting.** When independently qualified gift
acknowledgment and fixed-commitment fulfillment are compatible under the closed
source contract, Together SHALL present one follow-up permitting deliberate
coverage of both. Separate SHALL present their required unfinished work separately.
Neither mode SHALL disable a native purpose, modify money or make a source-owned
business transition completable through task status.

**G02 — One organization policy; no authority customization.** The proposed policy
SHALL contain only Together/Separate for this purpose combination, managed through
one exact P12 organization capability. It SHALL NOT grant source read, contact,
financial, completion, coach or task-handling rights, choose completion authority,
or introduce per-person/project/need overrides or a custom-purpose rule builder.
The founder explicitly selected this organization-wide scope. The rest of the
corrected amendment still awaits ratification.

**G03 — Explicit defaults and existing-work effect.** Recommend Together when this
capability is first activated for an organization with no existing separate D32
work. Existing separate deployments SHALL retain Separate until deliberate
authorized activation. Saving a mode SHALL clearly explain that affected
unfinished work will be rearranged; completed history remains unchanged. Preview
only currently permitted consequences, with no hidden counts or required broader
roster access. Policy change does not re-admit historical or handled work.

**G04 — Stable identity and current placement.** Recomposition SHALL retain the
canonical D20 gift group and distinct source-purpose occurrences. Move only
unhandled fulfillment membership through its owning boundary; enforce at most one active
placement for each occurrence and at most one current compatible gift group.
Joining requires current compatibility. A previously combined purpose whose
compatibility is lost SHALL leave joint placement through its qualified separate
route or the applicable source withholding/withdrawal; loss of compatibility is
not a reason to prevent safe detachment. A container surviving only for
fulfillment or another independent undertaking SHALL NOT remain the current D20
gift group by virtue of its old anchor role. Future gifts resolve the current
compatible gift group under D20 C02, without automatically joining that shell.
Scoped placement, old-shell disposition and reconciliation history SHALL be atomic
and semantically idempotent. Superseded empty shells SHALL NOT be marked Done;
retained independent work SHALL remain live under its own authority.

**G05 — Current policy and compatibility fence.** Joint acceptance SHALL recheck
current Together policy, qualified pair identity, Tenant, Legal Entity, typed
subject, follow-up Party, responsibility, completion contract and current P12
action/projection after any wait. Separate SHALL prevent new joint acceptance
immediately even during bounded placement projection. Permission or source
incompatibility overrides arrangement. A policy-management grant does not grant
any affected task or financial projection.

**G06 — Exact reviewed coverage.** One human command SHALL specify the actual
reviewed purposes and intended disposition for each; it SHALL atomically record
their separate coverage and local task result or reject the materially stale
selected set without partial hidden completion. Separate evidence is not two
invented interactions. Unrelated new members SHALL neither be covered nor alone
invalidate an unchanged reviewed set. Current single-purpose handling remains
possible when its source/authority is valid; physical regrouping alone grants no
reason to force another donor interaction.

**G07 — Partial work and late purposes.** Handling one purpose SHALL leave the
other genuinely unfinished and visible through its qualified current placement.
A purpose arriving later SHALL NOT be absorbed into prior completed coverage or
silently added to an open review. It may join current compatible unfinished work
under the current mode, with both purposes then deliberately presented. Evidence
of a previously recorded actual interaction remains distinct from the command
needed to record qualified coverage; no retrospective assumption is permitted.

**G08 — Source correction and conditional repair.** A source correction SHALL
withdraw or restore only its affected valid/unconsumed purpose, preserving other
work and completed human history under D20. Reapplying money, undoing a refund,
revising a plan, renaming a task or changing policy SHALL NOT mint another
fulfillment occurrence. The P16/P28 owner must publish the actual stable milestone
contract; a current Fulfilled flag or term-version ID is insufficient. Conditional
Undo SHALL restore eligible coverage through the current mode/placement owner,
never by reopening a duplicate old task or changing money or an actual message.
As an explicit proposed product amendment, one continuing fixed pledge SHALL
have one automatic fulfillment-follow-up purpose; later ordinary amendments,
including increased promises, SHALL NOT restart handled celebration. A genuinely
new source-owned pledge has a distinct purpose. Preserve the achieved historical
terms and distinguish their later amendment from correction of the original
milestone evidence; current financial progress remains independently current.

**G09 — Preserve dates and governed preparation.** Mode changes SHALL preserve
purpose-specific dates, original notes/attachments/preparation, responsibility
and audience. A combined due-date summary is a projection, not a write to every
purpose. Preserve drafts and safe original-context links; do not copy restricted
material into a new task, infer purpose scope, change message recipients/content,
or use an old alias as read/action authority.

**G10 — No disclosure by organization-wide control.** Policy audit and effect
preview SHALL use their own permitted scope. Counts, titles, gift amounts,
milestones, old task links, notifications, exports and recovered receipts remain
currently authorized projections; compatible grouping cannot union permissions
or reveal hidden residual work. Trusted server context derives organization,
actor and audit attribution.

**G11 — Bounded durable reconciliation.** Policy acceptance SHALL durably record
the policy version and reconciliation intent. Apply affected placement changes in
bounded scoped commands, preserving exact identity and accepted receipts; no
tenant-wide database transaction, blocking provider call or all-history sweep is
required. During delay, reject stale joint acceptance and show truthful state;
keep permitted single-purpose paths usable. Recovery and rollback preserve
coverage, notes, evidence and current authority, not legacy task-status shortcuts.

**G12 — Required proof.** Qualify both mode transitions with partial handling,
late purpose, source correction, responsibility/privacy change, missed response,
duplicate dispatch, lock-wait policy change, concurrent D20 gifts, stale old links,
retained independent promises, note/draft/date preservation, migration and bounded
load. Demonstrate one actionable placement and no second current gift group
through the actual owner/database boundaries. No finite model, documentation link
check or generic manual-task endpoint proves this implementation.

## Lifecycle examples and proof obligations

| Scenario                                                               | Required outcome                                                                                                                                              |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Both purposes eligible; Together                                       | One compatible follow-up; both meanings visible; each receives its own reviewed disposition evidence.                                                         |
| Both eligible; Separate                                                | Gift group and fulfillment work remain separately actionable; neither is suppressed.                                                                          |
| Together to Separate while both unfinished                             | Retain gift group; move only unhandled fulfillment membership; reject a stale joint submission; preserve drafts/history/dates.                                |
| Separate to Together with both unfinished and compatible               | Reconcile into existing gift anchor without new source occurrences, duplicate current gift groups or lost original-context notes.                             |
| Gift acknowledgment already handled; fulfillment unfinished            | Only fulfillment remains actionable. Changing mode cannot reopen the gift or falsely label it unhandled.                                                      |
| Fulfillment already handled; another eligible gift arrives             | Admit the gift under D20; do not reopen celebration or use a retained fulfillment-only shell as an unqualified new gift group.                                |
| Late fulfillment purpose after an earlier gift action                  | The new purpose remains uncovered until deliberately handled; no automatic second donor message and no inferred past coverage.                                |
| One of two selected purposes becomes invalid during the command        | Reject the materially stale reviewed command atomically; refresh to permitted remaining work with draft preserved.                                            |
| New unrelated gift arrives after review                                | Keep it uncovered; do not invalidate otherwise unchanged selected purpose coverage solely due to its arrival.                                                 |
| Financial correction withdraws celebration but gift remains received   | Remove only invalid unhandled celebration work; preserve lawful gift acknowledgment and actual interaction/history.                                           |
| Policy flips twice while reconciliation is queued                      | Each scoped command resolves the current desired mode and expected placement; superseded work cannot restore an obsolete arrangement or duplicate membership. |
| Old task contains an independently promised action                     | Move only D32 membership; retain the independent action, dates and current source rules. No shell-wide Done or generic cascade.                               |
| Staff can manage policy but cannot see all affected tasks              | Save through the exact policy capability; show no hidden roster/counts and use trusted source-scoped reconciliation.                                          |
| Client retries an already accepted joint completion after mode changes | Recover the same accepted receipt under current disclosure, not execute again or reinterpret it as new single-purpose coverage.                               |

## Remaining ownership work

The coordinated root and financial review explicitly recommends **one automatic
fulfillment-follow-up purpose per continuing fixed pledge**. This is a new
bounded product amendment awaiting ratification, not inherited P16 behavior or
an engineering consequence of the join key. Ordinary donor amendment, including
an increased promise on the same pledge, does not mint another automatic
celebration. A genuinely new source-owned fixed pledge has its own purpose;
independent gift reasons and deliberate manual follow-up remain available.

P16/P28 must still qualify the actual whole-promise, positive money-caused
milestone and its stable purpose identity. Freeze the genuinely achieved term
and line set with its evidence. An ordinary later amendment does not erase that
historical milestone; pending work must explain changed current terms without
claiming the current expanded promise is fulfilled. Actual money/source
corrections may invalidate or restore the same still-unhandled purpose; handled
coverage never replays. Current financial progress continues to follow current
owner terms. No generic milestone-generation engine or per-version task identity
is introduced.

Promote this research only through the later authorized canonical P9/P28/ADR0183
shared-coverage amendment, P12 policy/command projections and exact P16 source
contract. No source owner, provider or optional workflow is replaced. These are
implementation/release requirements; none was demonstrated by writing this note.
