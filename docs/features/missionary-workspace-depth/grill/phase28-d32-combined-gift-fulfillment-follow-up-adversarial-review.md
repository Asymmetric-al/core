# Phase 28 D32 — one follow-up for a gift and fulfilled commitment

**Disposition: Accept with required amendments.**

**The corrected decision and required amendments were explicitly ratified on October 18, 2026 UTC.**
Reviewed October 18, 2026 UTC against
`9cada8f3d8ab59db391d3fd20df77fcadeb09813` and the working tree.
D31 remains ratified. This is a research/grill decision record under the
[founder boundary](phase28-founder-brief.md:21), not a formal specification,
implementation, source qualification or release approval. The next researched
question is [Q33](phase28-q33-missionary-offline-gift-report-research.md).

## Exact corrected decision to record

> **D32 — One follow-up showing both purposes, with an organization choice.**
> When the same eligible received gift independently qualifies for D20-compatible
> personal gift follow-up and contributes to a source-confirmed fixed-commitment
> fulfillment milestone, compatible unfinished work may appear in one ordinary
> follow-up. Maya sees both purposes, reviews their permitted facts and may finish
> both once or deliberately finish only the work she handled. Each purpose keeps
> its own identity, source evidence and completion record.
>
> Authorized staff choose **Combine compatible follow-ups** or **Keep separate**
> in one organization-wide setting. Keeping them separate turns off combination;
> it does not disable either required follow-up. The choice reorganizes only
> eligible unfinished work through its existing owner. It preserves completed
> history, dates, notes, prepared communication and independent promises, and
> never creates duplicate obligations. Incompatible work stays separate.
>
> Combining is the recommended initial choice for a newly activated organization.
> Existing separate work is preserved during upgrade until authorized staff
> deliberately choose combining. No missionary/project exceptions, arbitrary
> merge rules or separate gift-plus-fulfillment inbox are introduced.
>
> A fulfillment purpose requires the financial owner's evidence that accepted
> money applications completed the whole applicable fixed promise, including all
> designation lines and undated capacity. A paid installment, reduced or released
> balance, ended promise, last scheduled date or ended recurring plan is not that
> proof. One continuing fixed commitment has one automatic fulfillment-follow-up
> purpose; corrections and later revisions do not restart handled celebration.
> A genuinely new fixed commitment has its own purpose.
>
> Later arrivals are never silently included in an earlier reviewed action.
> Source corrections affect only the relevant unfinished purpose and retain
> history. Finishing follow-up does not change financial truth, issue a receipt,
> record a conversation or send a message. Communication remains a separate
> deliberate decision under its existing authority.

The founder explicitly selected **one organization-wide setting** in the
[scope clarification](d32-evidence/scope-clarification.md). No missionary/project
exceptions follow. Current unfinished-work treatment, migration defaults and the
one-purpose-per-continuing-commitment boundary were explicit recommended
amendments, not facts inferred from the original A answer or the scope reply.
The founder subsequently ratified the complete corrected decision and amendments.

## Evidence, authority and what is actually known

| Evidence class              | Finding and practical limit                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder-selected outcome    | A selects shared handling with separate evidence/completion. Tenant customization and Off were explicitly requested. Off is interpreted as turning off combination, consistent with retaining required native work.                                                                                                                                                                                                                                   |
| Governing task contract     | [D20 C01–C15](phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:177) already supplies gift grouping, exact reviewed coverage, corrections, current-group reconciliation and tenant safety. It explicitly reserves fulfillment as a distinct obligation unless shared coverage is owner-qualified. D32 supplies that narrow ratified future amendment.                                                                                  |
| Closed completion authority | [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622) makes Independent follow-up a human deliverable. Completion authority is code-owned, never a Tenant preference. Combine/Separate controls organization of work, not source completion authority.                                                                                                                                                            |
| Native outcomes             | [Founder brief](phase28-founder-brief.md:165) and [owner constraints](../../../prds/program-roadmap/owner-constraints.md:74) require qualified gift follow-up and commitment celebration. Off cannot silently repeal either outcome. D22 and D30 retain their own separately ratified optional reason policies.                                                                                                                                       |
| Financial meaning           | [P16 M2–M3](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1378) distinguishes fulfilled, ended, released and expected amounts. [O9](../../../prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:1757) describes reversible derived fulfillment progress, not a durable celebration occurrence. The exact milestone producer below is a required owner extension, not existing runtime behavior.           |
| Platform governance         | [Document authority](../../../ai/document-authority.md), [OpenSpec index](../../../../openspec/project.md), [principles](../../../../openspec/specs/platform-principles/spec.md), [boundaries](../../../../openspec/specs/platform-boundaries/spec.md) and [contribution operations](../../../../openspec/specs/contribution-operations/spec.md) preserve source ownership, permission-first behavior, one task hub and separate correction purposes. |
| Active change               | [Recurring-giving proposal](../../../../openspec/changes/add-recurring-giving/proposal.md) and [delta](../../../../openspec/changes/add-recurring-giving/specs/donation-lifecycle/spec.md) supersede legacy pledge/subscription topology. Their existence proves intended work, not deployed source qualification.                                                                                                                                    |
| Current code                | Static inspection of missionary task POST/PATCH/DELETE and organization settings found reusable manual UI, but not native per-purpose coverage or a qualified D32 policy boundary. Generic completion/reopening/deletion and the settings handler's demo Tenant target cannot be reused as this contract. No deployed exploit or production behavior was tested.                                                                                      |
| Current external evidence   | Official Givebutter, TntConnect, Blackbaud, HubSpot, GOV.UK and W3C documentation supports distinct facts, understandable task context and explicit action outcomes. No reviewed vendor establishes Core's exact joint-coverage contract, tenant semantics or missionary preference.                                                                                                                                                                  |
| Product judgment            | One visible work item reduces repeated handling when the same human work serves both purposes. A two-choice organization setting and bounded unfinished-work reorganization are clearer than an enduring mixture of old and new grouping policies. These are reasoned recommendations, not measured fundraising benefits.                                                                                                                             |
| Unproved evidence           | Real financial producers, SQL/RLS/grants, races, live upgrades, performance and assistive/mobile behavior still need release qualification. No missionary interview or authenticated competitor test was conducted; this record cannot substitute for those results.                                                                                                                                                                                  |

Independent evidence: [financial lifecycle](d32-evidence/financial-fulfillment-lifecycle.md),
[governance/policy](d32-evidence/governance-and-policy.md),
[database/authorization](d32-evidence/database-authorization.md),
[UX research](d32-evidence/ux-and-primary-research.md) and
[comparable products](d32-evidence/comparable-products.md).
The [original Q32](d32-evidence/q32-before-answer.txt) is preserved.

**The strongest alternative is separate follow-ups.** It keeps two ordinary
work units and avoids composition changes; one real interaction can still serve
both if deliberately evidenced. Its cost is repeated review/handling for a common
illustrative case, not necessarily two messages. It remains the tenant option
and the fallback for incompatible work. Manual-only handling would remove an
already required native outcome, so it is not an equivalent no-build solution.

A prospective-only combination setting is also technically possible. It would
need an exact new-pair boundary, not task creation date, because D20 tasks can
keep gaining gifts. Existing combinations would survive Off. That is a coherent
alternative with less rearrangement, but a less direct user promise. The proposed
current-pending rule avoids policy epochs, grandfathered mixed arrangements and
an extra per-pair policy ledger. Its required reconciliation is bounded to these
two purpose families and reuses the task owner's existing correction machinery.

**External conflicts are resolved explicitly.** Givebutter's broad staff task
visibility and reopen controls do not override P12/D20. TntConnect's task-update
precedent does not prove cross-purpose coverage. Blackbaud distinguishes receipt
and acknowledgment states; neither is Core's personal action. HubSpot documents
send-only versus send-and-complete; Asym retains its independently deliberate
sending and does not import automatic completion. GOV.UK disclosure guidance
informs hierarchy, not a replacement component system.

## Source ownership and the necessary milestone boundary

| Fact                                                                              | Authority                                                      | Invariant                                                                                                                                |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Received contribution, allocation, reversals and exact currency                   | P13 / qualified financial correction owners                    | Task placement and handling never post, apply, refund or alter money.                                                                    |
| Exact Party and permitted recognition/recipient context                           | P14 and source identity owners                                 | A shared name, household, email, soft credit or provider customer is not a common follow-up Party.                                       |
| Fixed promise, term/line set, lawful applications and fulfillment milestone proof | P16                                                            | Whole-promise fulfillment is source-qualified; a portal balance or task status cannot establish it.                                      |
| Native gift/fulfillment task and audience purpose admission                       | P28 consuming qualified source evidence and D19–D31 boundaries | Fulfillment does not itself manufacture a special-gift reason. D19 first-support and other obligations are outside this new combination. |
| Work placement, reviewed human coverage, history and interaction linkage          | P9/shared task owner with D20                                  | One active placement per purpose effect, one compatible current gift group, exact durable per-purpose outcomes.                          |
| Tenant configuration and current action/disclosure authority                      | Existing Tenant settings owner and P12                         | One trusted Tenant policy; no role label, service credential or user-supplied ID widens rights.                                          |
| Draft/content/recipient authorization and actual dispatch                         | P17/P6; D15 where applicable                                   | A task update cannot send, enlarge a draft's scope or assert delivery.                                                                   |

**The P16 extension must prove causation, not just a green status.** The accepted
D11 application or lawful linked-coverage command must certify a positive
money-derived delta that takes the applicable whole fixed promise from not fully
money-fulfilled to fully money-fulfilled under one bound term/line set. Every
relevant designation line, named expectation and undated amount must be accounted
for under P16's conserved fold. A surplus on one line cannot cover another by
arithmetic; money cannot count twice through recurring-to-fixed linked coverage.
The exact completing contribution/application set must be retained, including
multiple portions accepted together. Gift date or webhook arrival order cannot
choose a fictional final gift.

The before/after comparison uses the same valid accepted terms, not old terms
before and reduced terms after. For example, reducing a 100 promise to 80 when
80 is already fulfilled does not create a milestone. Reducing it validly to 90
and then applying a genuinely received 10 may complete that amended promise.
A zero-amount promise cannot qualify merely through vacuous line comparison.

A zero remaining balance can also result from donor ending, internal release or
term reduction. A scheduled final installment can still be unpaid. These facts
are insufficient. Unknown, disputed or stale source evidence withholds the
fulfillment purpose; it does not suppress an independently valid gift purpose,
stop received-money posting or force Maya into financial repair.

The stable automatic purpose is the source-owned continuing fixed-pledge identity
plus fulfillment-follow-up purpose, scoped to its qualified Party/context. It is
not a term version, current status, task ID, event ID or completing-gift ID.
**One automatic celebration purpose per continuing fixed pledge is a ratified
product amendment**, chosen to avoid repeated celebrations from revised plans,
refund/reapply cycles and target expansion. A genuine new source-owned pledge
has a new purpose. Later gifts still retain their independent gift reasons and
manual follow-up remains available. A future policy for repeated celebrations
of expanded promises would require an explicit new product decision; this review
does not disguise one as a technical counter.

Freeze the actual milestone's applicable terms, line set, causal money evidence
and revisions. An ordinary later donor expansion does not erase the historical
achievement; the pending purpose may truthfully say **“The earlier commitment
was fulfilled; its terms have since changed.”** Current progress still uses
current terms. A source correction or reversal can invalidate that original
proof, including a dependency on an earlier gift whose own task did not change.
Withhold or withdraw only affected unhandled work. A lawful restoration reuses
the same still-unhandled purpose and preserves correction lineage. If new money restores fulfillment, retain the original achievement and identify
the current restoring contribution set accurately; the new gift is not rewritten
as the historical final gift. Ordinary expiry/consumption of an instruction does
not undo its lawfully accepted application; current commands and disclosure
still require current authority. Completed
human history remains recorded; a correction is not a new celebration or a
claim that a past interaction never happened.

Whole pledges spanning incompatible ministries, Entities, Party/recipient or
responsibility contexts cannot be flattened into Maya's local group. P16/P9 must
supply an independently permitted actionable fulfillment scope; until then this
combination is unavailable. One gift can complete multiple distinct commitments,
but each needs its own whole-commitment proof and compatibility. Where all qualify,
one action may cover the exact displayed purposes; no generic arbitrary-task
merge feature follows.

## The complete journey

**Staff configure one understandable choice.** In the existing follow-up settings,
show a radio group titled **Gift and commitment follow-up**:

- **Combine compatible follow-ups** — “Show eligible gift thanks and commitment
  fulfillment together when they can be handled by the same person.”
- **Keep separate** — “Keep both follow-ups, with separate handling.”

Help text: **“Changes how unfinished follow-ups are organized. Completed history
stays unchanged. This does not send messages or change giving records.”** One
Save action, an inline saved state and ordinary accessible error handling are
enough. A permitted impact summary may identify affected unfinished work; it
must not reveal otherwise inaccessible supporter counts. No required explanation,
workflow editor, per-project override or second confirmation ceremony is needed.
Policy save must report accepted configuration separately from any pending
reorganization. An old client cannot successfully finish a newly forbidden joint
set while repair catches up.

**Maya sees one calm, factual card in her existing queue.** For the exact-two case:

```text
Follow up with Grace                              Next due: 22 Oct
Maya's ministry

Gift follow-up
Received 18 Oct · USD 100.00
Reason: Meets your organization's gift amount rule

Commitment fulfilled
USD 1,200.00 commitment fulfilled with this gift

[Finish both follow-ups]   Choose what to finish
Why this follow-up?        Contact options
```

These are illustrative values and copy, not test data or fixed USD assumptions.
Show only independently permitted identity, amount and scope. Essential purposes
and the exact action scope remain visible; expandable explanation holds detailed
source evidence. Do not imply the gift was “extra,” that Grace is organization-new,
that the whole pledge is an additional gift amount, or that a receipt was sent.
A mixed gift/milestone total would double-count money and must not appear.

**The ordinary action is one step.** After handling both purposes, Maya uses
**Finish both follow-ups**. For a larger D20 group, the label and adjacent text
state the exact reviewed gifts and fulfillment purposes. No per-purpose checkbox
ritual or narrative report is compulsory. Secondary **Choose what to finish**
allows a deliberate nonempty subset. Finishing just the gift leaves fulfillment
pending, with an honest scoped result. Existing Not needed and qualified Undo
retain their D20 meaning; they do not silently become all-purpose suppression.

**Contact and actual interaction remain distinct.** Contact options use current
P6 eligibility. Preparing or sending a message does not finish tasks implicitly;
finishing tasks does not send. One real conversation is recorded once, with
explicit eligible purpose coverage if the user chooses that linkage. A later
purpose never silently claims that the earlier conversation covered it. Maya
may deliberately associate a genuinely relevant earlier interaction where the
existing owner permits it; she is not forced to send a duplicate message or
invent a new conversation merely to handle later work.

**Changes are explained without making the user police the system.** A newly
arriving purpose stays outside the existing reviewed set. A material change to a
selected purpose asks Maya to refresh, preserving preparation. An unrelated new
gift does not invalidate her valid review. After a partial finish: **“Gift
follow-up finished. Commitment follow-up remains.”** After uncertain transport:
**“Checking whether your change was saved…”**, then recover the actual receipt;
never optimistically claim success or resend a message. No hidden count or
inaccessible source detail appears in these outcomes.

**Switching the organization setting is reversible for unfinished placement.**
The canonical D20 gift group remains the anchor while it contains eligible
pending gift work. Combining attaches only
compatible unresolved fulfillment work; keeping separate places it in its
qualified ordinary fulfillment task. Each purpose has exactly one active
placement. Empty former containers are superseded, not falsely marked Done.
Existing links retain authorized history and resolve current work without
rewriting its historical coverage. Notes and prepared communication keep their original
ownership and scope; they are not copied to a new audience or silently attached
to new purposes. Independent promises stay open until their own work is handled.
Incompatible obligations need not combine just because the setting says Combine.

**Dates stay truthful.** The queue's Next due is the earliest permitted due date
among pending work. Detail preserves differing purpose planning dates; completing
one recomputes the remaining Next due. Grouping never postpones work, resets its
age or substitutes a financial milestone date for a task deadline. No new default
deadline is invented here. Source dates retain source meaning; action times use
the selected time zone.

**Donors and coaches get no new automatic disclosure.** Grace encounters no extra
checkout question or notification from grouping. Existing receipts continue
under their owner. D26 coach sharing remains an explicitly approved summary;
regrouping cannot expand its wording, reveal source purposes, share a successor
task automatically or report a superseded shell as completed work.

Use Core's exact `base-maia`, Base UI and shared semantic Zinc tokens. Stack
purpose rows on phones, retain readable international names/currency precision,
support bidirectional text and 320 CSS-pixel reflow, visible focus and keyboard
operation. Use text alongside status color. WCAG 2.2 AA target sizing is 24 CSS
pixels or its exceptions; 44 CSS pixels is a comfortable design aim, not a false
universal AA requirement. Announce scoped outcomes without focus theft. Keep
status in the detail/history as well as a transient toast. Low-bandwidth users
must be able to retry an uncertain command without double handling.

## Exact required decision and design clauses

These amendments are ratified future requirements for later owner integration.
They specify outcomes and invariants, not physical table or component names.

**C01 — Bounded shared coverage.** The only new combination SHALL be independently
qualified D20-compatible gift-follow-up and fixed-commitment fulfillment-follow-up
purposes causally related by the exact completing gift/application evidence.
D19 first-support, care, receipts, financial exceptions and unrelated promises
SHALL NOT be absorbed. No purpose SHALL be inferred merely from another's presence.

**C02 — Tenant choice.** Authorized staff SHALL choose one trusted organization-wide
Combine/Separate policy through the existing settings owner. Separate SHALL turn
off combination only. Tenant policy SHALL NOT change closed completion authority,
source qualification, financial facts or permission boundaries. No exceptions or
rule-builder are introduced by D32. Invalid/missing policy SHALL not authorize joint
handling; independent qualified work remains available.

**C03 — Current pending placement.** The current policy SHALL govern new and
unfinished eligible composition. Policy acceptance SHALL atomically record the
new revision, semantic command receipt, required audit and durable repair intent. P9 SHALL atomically reconcile each affected
bounded scope, preserving one active placement per purpose and the D20 gift-group
anchor. Only unresolved fulfillment placement may move under D32. Joining requires
current compatibility; lost compatibility requires separate source-owned placement
or applicable source withholding/withdrawal, never continued joint authority.
Covered effects, independent undertakings, source identity and history SHALL not
be rewritten.
Empty containers SHALL be superseded, not completed. Current policy SHALL fence
joint commands immediately even if projection repair is asynchronous. A stale worker SHALL recheck current effective mode/capability, selected source and placement after
waits; an older Combine job cannot undo a newer Separate choice or an active platform
kill switch. Effective joint permission requires both qualified feature
availability and the current Tenant Combine choice; unavailable capability
forces safe Separate behavior without rewriting the saved Tenant preference. No giant
organization-wide transaction, duplicate task or per-policy-epoch gift group is allowed.

**C04 — Qualified whole fulfillment.** P16 SHALL expose a durable milestone proof
from an accepted positive money-derived application/linked-coverage delta crossing
the whole applicable fixed promise to money-fulfilled. Before/after SHALL use the same valid accepted terms and a positive promised
amount; an amended promise completed by later new money remains eligible. All
term/designation lines, named and undated capacity, exact currency and conserved application evidence
SHALL agree. Ending, release, term reduction, a paid installment, recurring end or
zero displayed remaining alone SHALL not qualify. The accepted source command SHALL record the milestone and intent; the P16
pure evaluator SHALL remain side-effect free. Missing source proof SHALL gate
only this affected purpose/path.

**C05 — Stable milestone purpose.** One continuing source-owned fixed pledge SHALL
have one automatic fulfillment-follow-up purpose. Source revisions, plan/term
changes, new task placement, duplicate events, refunds and reapplications SHALL
not mint another. A genuinely new fixed pledge SHALL have its own identity. A replacement database ID, reassignment, alias or identity repair SHALL not
by itself reset that semantic purpose; ambiguous Party/coverage correction
requires source-owner resolution. Freeze
the actually achieved terms and causal evidence; preserve ordinary later amendments
as current context, and distinguish corrections that invalidate the original proof.

**C06 — Compatibility.** Joining SHALL require the same Tenant, exact typed P9
ministry/project subject, Legal Entity, qualified follow-up Party, compatible
responsibility, disclosure and closed Independent follow-up authority. P16 SHALL
identify the completing contribution/application relationship. Same names, dates,
emails, household/credit membership, assignee or UI proximity are insufficient.
Multi-line/multi-commitment cases SHALL prove each scope, not guess from totals.
New joint placement SHALL include at least one currently unhandled gift member
in the milestone's qualified completing/restoring set. An already handled gift
cannot be reopened merely to attach a late milestone to unrelated pending gifts.
After partial handling, fulfillment-only residue may retain its container but
SHALL not keep the current gift-group slot or automatically accept unrelated new
gifts; D20 resolves their next compatible current group.

**C07 — Source intent and replay.** P16 milestone acceptance SHALL durably record
its identifier-only source intent in the same owner transaction. P28 source-qualified
task/audience-purpose admission and its identifier-only shared-task projection
intent SHALL commit atomically at their own boundary. Neither SHALL depend on
successful task materialization before financial truth can commit.
Semantic effect identity SHALL deduplicate across retries, native/workflow paths,
regrouping and transport keys. History-only import/backfill SHALL not become new
live work. Delayed repair of an originally live unconsumed purpose SHALL retain
that lineage and current eligibility; it SHALL not backdate handling.

**C08 — Exact review.** A disposition SHALL bind a nonempty exact set of purpose
and gift-member identities, relevant source/dependency versions, responsibility,
current placement/authority and intended outcome. Server-derived proof SHALL
validate caller selections. Both purposes and action scope SHALL be clearly
presented and inspectable; hidden or unloaded members SHALL never be silently selected.

**C09 — Atomic handling and concurrency.** The owner SHALL validate selected facts,
current mode for joint work and current authority at final acceptance, including
after lock waits. Expiring authority SHALL use actual current time at final
acceptance, never transaction-start time. A material selected change, incompatible placement or overlapping
concurrent coverage SHALL reject the entire new disposition; no best-effort partial
success. An unrelated addition SHALL neither invalidate valid selected work nor
be consumed. Single-purpose handling unaffected by reorganization need not conflict.

**C10 — Separate durable outcomes.** One accepted command SHALL atomically record
per-purpose/per-member coverage, semantic disposition receipt, exact outcome,
actor/time, required audit/history and resulting task state/revision. A deliberate subset SHALL leave all unhandled required residue available.
Task closure SHALL follow authoritative residue, never a count of visible rows.
No authorized actionable residue for a viewer means removal of that current queue
projection, not disclosure of hidden work or a false claim that it is all complete.

**C11 — Human work only.** Done/Not needed SHALL declare only the selected human
work outcome. They SHALL not fulfill a pledge, alter received money, send, issue
a receipt, create consent, enroll a contact or fabricate an interaction. One actual
interaction SHALL be stored once under its owner and linked only to deliberately
qualified coverage. No mandatory narrative report or new channel is required.

**C12 — Correction and Undo.** Corrections SHALL withdraw/revalidate only the
affected unfinished purpose/reason, preserving human and source history and
independent promises. Restoration SHALL reuse the same unhandled purpose with an accurate current
completing/restoring contribution set and retained original history. Handled
purposes SHALL not restart. D20 conditional Undo SHALL reconcile through current
policy and current placement without reopening a second copy, undoing a send or
changing money. A stale source review SHALL have a usable refresh/repair path.

**C13 — Policy-change and retry ordering.** Policy save, placement reconciliation
and disposition SHALL use explicit version/claim fences at their authoritative
boundaries. Either legitimate serialization order may win; the result SHALL match
that order. An accepted disposition survives a later mode change. Identical retry
SHALL recover its receipt without re-executing; changed payload under the same key
SHALL conflict. Recovery disclosure SHALL still require current rights.

**C14 — Tenant-aware persistence.** Required Tenant, actor, purpose, owner, source,
subject, Entity and audit attribution SHALL derive from trusted server context.
Use tenant-aware references, non-null identities, closed valid states and
uniqueness for effects, active placement and current gift groups wherever expressible.
Cross-row invariants SHALL be enforced by one qualified mutation boundary with
bounded deterministic locks. Mutable projections SHALL be distinguishable from
append-only coverage/source evidence; deletion SHALL not cascade away that history.

**C15 — RLS, grants and all writers.** Coarse tenant RLS SHALL backstop P12, not
replace it with a second permission engine. Qualify SELECT, INSERT, old-row UPDATE
USING and new-row WITH CHECK, grants, views, RPC EXECUTE, function ownership/search
paths, storage and supported service-role paths together. Generic PATCH/DELETE,
browser and alternate writers SHALL not relabel, move, reopen, retarget or directly
cover native work. Actor/tenant/scope changes SHALL require explicit qualified
owner commands. No claim is made that an unrestricted database superuser is constrained.

**C16 — Current disclosure.** APIs, counts, notifications, exports, caches, Realtime,
source links and retained history SHALL enforce current field/record rights at
release. Responses from an older tenant/actor/context generation SHALL be rejected
and protected client state cleared on revocation/switch. Grouping SHALL not reveal
hidden member existence or enlarge D26 coach sharing. Bytes already lawfully
released cannot be recalled; minimize content in logs and derivatives accordingly.

**C17 — Planning and independent context.** Reorganization SHALL preserve purpose
planning dates, actual source dates, retained notes, independent promised work
and P6 preparation ownership/scope. Next due MAY project the earliest permitted
pending due date but SHALL not rewrite underlying deadlines. Existing note or
communication content SHALL not be copied, newly shared or counted as new coverage.
Old task links SHALL resolve authorized history/current placement truthfully.

**C18 — Simple accessible interaction.** Show both purposes, concise factual reason
and exact scoped action in the existing queue. Offer one ordinary full-reviewed-set
action and a quiet deliberate-subset option. Support current Core design-system,
mobile/reflow, keyboard/screen reader, international text/currency/dates, honest
loading/conflict/retry and no color-only meaning. No new inbox, mandatory report,
workflow DSL, personal override or double-confirmation ritual is introduced.

**C19 — Bounded scale and money.** Reuse owner-qualified amounts/currency, checked
minor-unit transport and exact source precision; never add gift and pledge totals
or currencies. Index tenant/current placement/effect and reconciliation cursors;
avoid whole-history scans and per-row source N+1 requests. Review, mutation, paging,
worker batches and retries SHALL have declared numerical resource bounds and
boundary behavior qualified before release. Partial load SHALL not silently narrow
coverage or create false absence.

**C20 — Recovery and operations.** Durable intent, claims and semantic receipts
SHALL recover source/projection and disposition/notification failures independently.
Provider or executor failure SHALL not own financial/task meaning. Failed repair
SHALL remain visible to the existing authorized operational owner with replay and
reason codes; no routine direct-database repair or private-body logging. Stale joint
projection SHALL not authorize action while reconciliation is pending.

**C21 — Retention and audit.** Business history SHALL retain exact source-purpose
references, achieved terms, relevant revisions, reviewed set, disposition and
correction lineage separately from technical traces. Policy changes SHALL record
trusted actor, before/after and effective revision. Retention/anonymization, exports,
backups and restore SHALL follow existing owners and reconcile retained semantic
receipts so old covered work cannot reappear. Required history SHALL not require
indefinite retention of private message bodies.

**C22 — Rollout and compatibility.** New qualified activations MAY start Combine;
existing separate work SHALL remain Separate until staff deliberately change it.
Deploy source/membership/receipt protections before exposing joint actions; old
writers SHALL be fenced. Unmapped legacy task status SHALL not be invented into
per-purpose coverage or new native admission; retain its historical/manual truth
until the owner can qualify the exact mapping. Mixed-version clients/workers SHALL fail safely on
unsupported policy/coverage rather than interpret missing fields as authority.
The feature kill switch SHALL disable joint actions and reconcile pending work to
Separate while preserving both qualified purposes and history. Rollback SHALL not
return to generic native-task edits after new receipts exist.

**C23 — Traceability and proof.** Later authorized formal work SHALL carry these
exact amendments into P16, P9/shared tasks, P28 and owning settings/P12 contracts,
then their canonical OpenSpec projections, design, tests and release evidence.
No independently authored competing spec or premature ticket graph SHALL be created.
The acceptance cases below are required outcomes; documentation models SHALL never
be reported as actual source, SQL/RLS, concurrency, migration or UX qualification.

**C24 — Accountability.** The named functional owners in the synthesis SHALL own
signals, thresholds and responses. Permission, duplicate coverage and false
financial-milestone defects SHALL be prevented and release-tested, not merely
monitored. An actual responsible maintainer and tested operational runbook SHALL
be assigned before activation; unresolved exact source gates SHALL block only
the dependent capability.

## Consolidated adversarial findings

Severity is potential impact before safeguards. Likelihood is qualitative
engineering judgment under a naive implementation, not measured incident frequency.
Every finding changes or narrows the original short answer; none requires replacing
its core one-follow-up choice.

| ID  | What could go wrong and why it matters                                                                                                          | Severity / likelihood and evidence                                                                                                                | Decision effect, permanent fix and exact change                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F01 | Off suppresses a required celebration or becomes a tenant-configurable financial completion rule.                                               | High / likely if represented by a generic enable flag. Founder native outcomes and ADR-0183's closed authority conflict with that interpretation. | Narrow customization to one Combine/Separate organization policy; C01–C03, P01–P03.                                                                         |
| F02 | Remaining zero, the last installment or a term reduction creates a false “fulfilled” celebration.                                               | High / likely with current projection reuse. P16 M2/O9 explicitly separate these states.                                                          | Require a causal whole-promise money milestone, including every line/undated capacity; C04–C05, P04–P08.                                                    |
| F03 | Same name/assignee hides different Party, ministry, Entity or responsibility; one user closes another's work.                                   | Critical / plausible with display-based grouping. D20 C02 and P12 prohibit it.                                                                    | Exact typed compatibility and one source relationship; C06/C14–C16, P09–P10.                                                                                |
| F04 | One task status loses separate purpose evidence, or refund/reapply/task recreation generates repeated celebration.                              | High / likely with status/event IDs. P16 progress reverses; D20 effects survive replay.                                                           | Stable purpose identity, separate coverage and one continuing-pledge purpose; C05/C07/C10/C12, P11–P13.                                                     |
| F05 | A lifetime-open old group ignores Off, or switching silently erases work/notes and marks empty shells done.                                     | High / plausible. D20 admits later gifts and retains independent promises.                                                                        | Reconcile only current pending placement around the canonical gift anchor, keep history/dates/context, supersede shells; C03/C17/C22, P14–P17.              |
| F06 | “Finish” silently covers late/hidden purposes or forces an unfinished purpose to be declared done.                                              | High / likely with whole-task UPDATE. D20 requires exact reviewed membership.                                                                     | Visible exact scope, deliberate subset, atomic per-purpose outcome and truthful residue; C08–C10/C18, P18–P21.                                              |
| F07 | Concurrent partial/full actions, policy changes or expired rights yield a partially committed or unauthorized completion.                       | Critical / plausible under normal concurrent use. Current generic handlers do not bind purpose proofs.                                            | Current selected-source/placement/policy/authority fences after waits and all-or-nothing reviewed coverage; C09/C13–C15, P22–P25.                           |
| F08 | A lost response, second request key or worker retry handles twice; stale result recovery reveals protected facts.                               | High / likely without durable semantic receipts. ADR-0183 requires domain idempotency.                                                            | Durable effect uniqueness, same-command recovery, conflicting-payload rejection and current disclosure; C07/C13/C16/C20, P23/P26.                           |
| F09 | Generic PATCH/DELETE or demo-scoped settings bypass the new model; a permitted row is transformed into a forbidden one.                         | Critical / plausible reuse hazard, not a demonstrated exploit. Fresh static task/settings inspection.                                             | Fence all native writers; trusted Tenant policy and old/new-row checks, qualified RPC/service paths; C02/C14–C15/C22, P27–P29.                              |
| F10 | Regrouping, follow-up completion or a receipt fabricates conversation/sending, expands a draft, or shares with a coach.                         | High / plausible UI coupling. D15/D26, P6 and separate acknowledgment semantics disagree.                                                         | Keep sending/interaction/disclosure independent; preserve original preparation and approved summary scope; C11/C16–C18, P30–P31.                            |
| F11 | A reversal or correction to an earlier contribution leaves a stale milestone actionable, or erases real past work.                              | High / plausible. P16 inverses and D20 correction lineage require dependency-aware proof.                                                         | Bind dependencies and achieved terms; withdraw only affected unfinished work; retain completed history and qualified restoration; C04–C05/C12, P07/P12/P24. |
| F12 | Multi-currency/split-line totals double-count money; group due date delays earlier work.                                                        | High / plausible with convenient totals/flattened metadata. P16 conservation, ADR-0208 and distinct planning facts.                               | No gift-plus-pledge sum, exact owner values, retain individual due dates and truthful Next due; C04/C17/C19, P08/P10/P16.                                   |
| F13 | A polished card hides essential purposes, inaccessible detail blocks understanding, or ambiguous success creates repeat effort.                 | Medium / likely without scoped interaction design. Current primary disclosure/status-message guidance.                                            | Visible purposes, plain reason, one clear action/subset and accessible durable feedback; C08/C18, P18–P21/P32.                                              |
| F14 | Reconciliation requires huge transactions, N+1 queries, repeated history scans or silent truncation.                                            | High / plausible as tenants grow; no actual capacity measurement exists.                                                                          | Bounded tenant-scoped work, indexed active effects, explicit review limits and production-shaped boundary proof; C03/C19–C20, P33.                          |
| F15 | Worker/provider outage loses qualified work or requires manual SQL repair; logs expose supporter details while still lacking business evidence. | High / plausible. Source intent and human receipts have distinct failure points.                                                                  | Durable independent repair, protected audit versus minimized telemetry and explicit ownership; C07/C20–C21/C24, P26/P34.                                    |
| F16 | Migration backfills create a celebration flood, old code undoes new receipts, rollback duplicates work.                                         | High / plausible during deployment. Active change supersedes legacy pledge/task behavior.                                                         | Preserve live lineage, conservative upgrade setting, additive guards before actions, safe separate mode/roll-forward; C07/C22, P35.                         |
| F17 | Custom policies, universal merge engines, source mirrors or invented milestone generations create debt without solving the selected job.        | Medium / likely if “customizable” is unbounded. Current owners already supply tasks, source commands and corrections.                             | Two choices, one scoped composition rule, one stable pledge purpose and no new dependency/ledger; C01–C06/C18/C23, P01/P11/P36.                             |
| F18 | A research document is mistaken for ratified authority, implemented safety or proven missionary benefit.                                        | High / plausible in a developing spec. Founder transition boundary and OpenSpec current/intended distinction.                                     | Label selected versus proposed/ratified/runtime, preserve evidence, exact downstream trace and release gates; C23–C24, P36.                                 |

## Every requested review category

| Category                                                      | Material concern? | Independent result and exact prevention                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | **Yes**           | Shared handling solves duplicated human review only when both purposes independently exist. Separate remains strongest alternative; manual-only would drop native work. Customization must not suppress either purpose. F01/F17; C01–C03. |
| Brittleness                                                   | **Yes**           | Displayed balances, task-row age, latest event and current terms are fragile proxies for cause and scope. F02/F05/F11; C03–C07/C12.                                                                                                       |
| Technical debt                                                | **Yes**           | Reusing generic task flags/settings or building a second coverage/money store produces competing authority. F04/F09/F17; C05/C14–C15/C23.                                                                                                 |
| Edge cases                                                    | **Yes**           | Split lines, multiple commitments, delayed second purpose, partial completion, later amendment, refund/restoration and incompatible audiences require distinct behavior. F02–F06/F11/F12; P04–P21.                                        |
| Footguns                                                      | **Yes**           | Bare Off, whole-task complete, unrestricted Undo/delete and silent regrouping can lose or misstate work. F01/F05/F06/F09; C02–C03/C08–C12/C17.                                                                                            |
| Tenant safety                                                 | **Yes**           | Policy, joins, notifications, caches and service paths can mix tenant or role contexts. F03/F08/F09; C02/C06/C14–C16.                                                                                                                     |
| Database, RLS, and authorization safety                       | **Yes**           | Direct writers, caller-controlled trusted fields, inadequate WITH CHECK and stale authority can bypass coverage. F07/F09; C09/C13–C15; all supported write paths must be proved.                                                          |
| Overengineering                                               | **Yes**           | Per-workspace overrides, arbitrary merge criteria and repeat-milestone engines exceed the job. Bounded reorganization is justified by a truthful current setting. F17; C01–C06/C18.                                                       |
| UX/UI and user friction                                       | **Yes**           | Hidden action scope, checkbox ceremony, ambiguous results and lost preparation undermine trust. F05/F06/F10/F13; C08/C17–C18.                                                                                                             |
| Source of truth, ownership, and domain invariants             | **Yes**           | A reversible financial projection or one task boolean can become false authority. F02/F04/F11/F12; C04–C05/C10–C12/C14.                                                                                                                   |
| Hidden coupling                                               | **Yes**           | Task completion can be coupled to sending, coach summaries, money or provider events. F10/F15; C07/C11/C16–C20.                                                                                                                           |
| Failure modes                                                 | **Yes**           | Source commit before projection, disposition before response and repair failure need different recovery. F07/F08/F15; C07/C09/C13/C20.                                                                                                    |
| Lifecycle, temporal correctness, concurrency, and idempotency | **Yes**           | Policy flip, overlapping reviewed sets, late purposes, reversal and changed terms cannot share one lifecycle flag. F04–F08/F11; C03–C13.                                                                                                  |
| Data integrity risks                                          | **Yes**           | Duplicate purpose/placement, cross-line money reuse, stale coverage and destructive correction can corrupt history. F02–F05/F11/F12; C04–C07/C10/C12/C14.                                                                                 |
| Security and privacy risks                                    | **Yes**           | Group metadata, existence counts, old deep links, logs, exports and coach summaries can broaden disclosure. F03/F08–F10/F15; C14–C17/C21.                                                                                                 |
| Scalability and performance risks                             | **Yes**           | Unbounded organization recomposition and inspectable review need explicit tested limits. No unsupported throughput claim is accepted. F14; C03/C19–C20/P33.                                                                               |
| Operational burden                                            | **Yes**           | Endless updating states, manual task cleanup and direct SQL repair are unacceptable permanent workflows. F05/F15; C03/C20/C24/P34.                                                                                                        |
| Observability and auditability gaps                           | **Yes**           | Technical success logs do not prove which human purposes were handled or why placement changed. F04/F08/F15; C10/C13/C20–C21.                                                                                                             |
| Dependency and integration risks                              | **Yes**           | Raw webhooks, legacy pledge counters and executor-only dedup cannot own milestone/task meaning. Vendor UI examples are not contracts. F02/F08/F15/F17; C04/C07/C20.                                                                       |
| Migration, rollout, and upgrade risks                         | **Yes**           | Old writers, default Combine over existing work, historical replay and unsafe rollback can multiply or erase obligations. F16; C07/C22/P35.                                                                                               |
| Testability, traceability, and proof                          | **Yes**           | A mock, evidence note or model can be mistaken for production proof or an owner amendment. F18; C23–C24 and P01–P36.                                                                                                                      |
| Other development hazards                                     | **Yes**           | Unstated repeated-fulfillment semantics, protected-data retention, ownership gaps and premature formal artifacts remain hazards. F04/F15/F17/F18; C05/C21/C23–C24.                                                                        |

## Acceptance criteria and release proof

These are independently falsifiable domain/user outcomes. The bounded research
model covers only a synthetic subset; actual tests must exercise real owner
commands, deployment roles and surfaces.

| ID  | Required outcome                                                                                                                                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | Combine produces one ordinary compatible work item with distinct gift and fulfillment purposes; Separate preserves both in separate handling. Neither changes source money or suppresses native eligibility.                                                                                                                                                                                      |
| P02 | Only authorized current-Tenant staff can save the organization policy. Missing/invalid policy cannot authorize joint work. No missionary/project exception or custom completion authority appears.                                                                                                                                                                                                |
| P03 | Saving a mode shows its unfinished-work effect and independent saved/reorganizing states; no hidden counts, compulsory rationale or accidental sends.                                                                                                                                                                                                                                             |
| P04 | A positive accepted money delta completing every line of the full fixed promise qualifies; merely paying one installment does not.                                                                                                                                                                                                                                                                |
| P05 | Remaining zero through release, donor end, reduction alone, zero-amount promise, final schedule date or recurring termination produces no money-caused milestone. Valid reduction 100→90 at 80 fulfilled followed by a new applied 10 may qualify under the same accepted terms.                                                                                                                  |
| P06 | Stale, unknown or disputed milestone proof withholds only that affected purpose; valid gift work and received-money posting remain available.                                                                                                                                                                                                                                                     |
| P07 | Ordinary later target expansion preserves the earlier milestone's historical wording/current context; a factual correction or reversal of supporting money revalidates that proof.                                                                                                                                                                                                                |
| P08 | One line's surplus cannot satisfy another, named plus undated capacity is complete, linked recurring coverage does not double-count money, and exact currency/overflow boundaries follow the financial owner.                                                                                                                                                                                     |
| P09 | Same display name/assignee across Tenant, Party, Entity, typed subject or responsibility cannot combine or leak another context.                                                                                                                                                                                                                                                                  |
| P10 | One gift completing multiple compatible fixed commitments preserves distinct proofs; incompatible or incompletely visible whole-pledge scope cannot be flattened. No gift-plus-pledge total is shown.                                                                                                                                                                                             |
| P11 | Revision/event/task IDs and refund/reapply do not duplicate the same continuing pledge's purpose. A genuinely new pledge has distinct work; later expansion of the same pledge does not restart handled celebration.                                                                                                                                                                              |
| P12 | Correction invalidates only affected unfinished work; qualifying restoration uses its old semantic purpose and accurate current restoring gifts, never rewriting a new gift as the original final gift. Handled history and real interaction remain intact.                                                                                                                                       |
| P13 | Delivery of originally live unhandled work can recover late; history-only import, backfill, alias merge or criterion-version change cannot manufacture new coverage or celebration.                                                                                                                                                                                                               |
| P14 | Combine→Separate→Combine preserves one gift anchor, one active placement per unresolved effect and all completed receipts; empty containers are superseded, never falsely Done.                                                                                                                                                                                                                   |
| P15 | Independent undertaking on an old task remains open; old links expose only authorized retained history/current work; moving native fulfillment does not finish the undertaking.                                                                                                                                                                                                                   |
| P16 | Different due dates survive grouping/splitting, earliest permitted pending date drives Next due, and finishing one cannot postpone the other by changing its original deadline.                                                                                                                                                                                                                   |
| P17 | Notes, prepared content/recipient scope and shared summaries are not copied, expanded or lost during placement repair; unsupported/incompatible context stays separate.                                                                                                                                                                                                                           |
| P18 | Exact-two case requires one deliberate ordinary handling action with both purposes visible; no forced checkbox/report ceremony.                                                                                                                                                                                                                                                                   |
| P19 | Choosing only gift work records only that purpose and leaves fulfillment actionable. Empty selection is rejected; Not needed affects only the declared reviewed set.                                                                                                                                                                                                                              |
| P20 | A late unrelated purpose/gift does not expand or invalidate a still-valid reviewed subset; unseen work is never silently handled. A late milestone whose causal gift was handled remains its own work; fulfillment-only residue cannot indefinitely absorb unrelated new gifts.                                                                                                                   |
| P21 | Hidden/unloaded residue is neither counted publicly nor silently handled. No actionable visible residue removes that viewer's current projection without claiming global completion.                                                                                                                                                                                                              |
| P22 | Interleave policy save/recomposition with a joint disposition in both orders, and delay an old Combine worker past a newer Separate save. Policy revision and repair intent commit together; stale workers cannot restore obsolete placement. Only a currently allowed valid joint command can newly commit; an earlier accepted outcome survives. An unaffected gift-only command need not fail. |
| P23 | Interleave {gift, fulfillment} and {gift} under different keys. The winner is applied once; a now-overlapping larger set conflicts without newly covering its other purpose.                                                                                                                                                                                                                      |
| P24 | Change selected source/dependency/placement/authority, revoke access or let authority expire while a command waits. Final acceptance rechecks actual current state/time, not transaction-start time, and commits no new subset on conflict.                                                                                                                                                       |
| P25 | Qualified Undo reconciles into the current permitted placement under current authority and intervening-handling checks; it cannot create another current group or undo money/sending.                                                                                                                                                                                                             |
| P26 | Lose response after commit, retry under a changed policy, deliver duplicate jobs and change payload under the same command key. Recover the original authorized receipt or conflict; no duplicate work or protected result after revocation.                                                                                                                                                      |
| P27 | Exercise authenticated SELECT/INSERT/UPDATE/DELETE, RPC, view, storage where used and supported service paths across two tenants and multiple scopes; old/new-row and field policies prevent native-work mutation escapes.                                                                                                                                                                        |
| P28 | Attempt caller-controlled Tenant/actor/owner/Party/Entity/purpose/approval fields, donor retargeting, generic complete/reopen/delete and contract-kind changes. No supported path can bypass the native owner.                                                                                                                                                                                    |
| P29 | Switch tenant/revoke access before result release, during client navigation and before idempotent recovery. Caches, Realtime, exports, logs and stale response generations preserve current disclosure boundaries.                                                                                                                                                                                |
| P30 | Finish both without interaction/send, send without finishing, record one real interaction then deliberately cover exact purposes, and receive a late purpose. No fabricated or duplicate activity/message occurs.                                                                                                                                                                                 |
| P31 | D26 approved summaries do not inherit newly visible purpose text, new task recipients or source details; superseded containers are not shown as completed human work.                                                                                                                                                                                                                             |
| P32 | Keyboard/screen reader, 320-pixel reflow, large text, international names/RTL, locale/time-zone/currency and low-bandwidth retry convey exact scope/outcome. Observe users distinguishing gift receipt, pledge fulfillment and personal handling; resolve any critical confusion before activation.                                                                                               |
| P33 | Declare actual page/review/batch/retry limits and units; test each at limit−1, limit and limit+1 with skewed tenants, concurrent policy/coverage and correction load. Record query plans, p95/p99 latency and memory against approved budgets; no truncation, N+1 or cross-tenant work starvation. No synthetic capacity claim substitutes for this evidence.                                     |
| P34 | Fault source→intent, projection, claim, disposition→response and secondary-notification boundaries. Authorized operators recover exact effects without SQL edits; logs omit protected bodies and business history explains source/policy/coverage lineage.                                                                                                                                        |
| P35 | Mixed old/new code and schema cannot bypass receipts; migration preserves current Separate work and historical handled state. Kill-switch activation immediately prevents joint acceptance and stale Combine workers from rejoining even when the saved Tenant preference is Combine. Roll-forward retains source truth, both purposes and history without duplicate tasks or unsafe downgrade.   |
| P36 | Reconcile D32 decision, conceptual glossary, P16/P9/settings/P12/P28 amendments, canonical OpenSpec, later design/tickets and release evidence only at authorized transitions. Each C/P ID remains traceable and no document/model is labelled implementation or activation.                                                                                                                      |

## Ruthless synthesis and ordering

1. **Resolve before recording the answer as a settled amendment:** retain A and
   the explicitly selected organization-wide scope. Define Off as Separate and
   current unfinished-work reorganization; state the causal whole-pledge source
   proof and one-purpose-per-continuing-pledge boundary. The remaining amendments
   were concrete recommendations, subsequently explicitly ratified by the founder.
   The earlier scope reply alone did not ratify those amendments.
2. **Carry into the later authorized spec/design:** integrate C01–C24 into the
   owning contracts. P16 must expose the milestone; P9 must qualify shared coverage
   and placement reconciliation; settings/P12 must qualify the Tenant command and
   all writers; P28 must consume those contracts. Preserve existing P27 E7/C-01 and
   other exact source gates only for paths that depend on them. Gift work can
   remain useful while a particular fulfillment producer is unavailable.
3. **Require before activation:** source causation and durable intent, semantic
   identity/coverage constraints, current authority and policy fences, safe bounded
   recomposition, generic-writer closure, exact feedback, migration/rollback and
   P01–P36 evidence. Roll out behind the existing supported feature control, with
   Separate as the safe upgrade posture. No dependency, new workflow platform or
   generic merge subsystem is justified.
4. **Monitor residual operational/usability risks after prevention is proved:**
   use the following owner/signal/threshold/response contract. Thresholds are
   proposed operational triggers, not measured current reliability or capacity.

| Owner                                    | Named signal                                                                                            | Threshold                                                                                                    | Required response                                                                                                                                                         |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared Tasks maintainer                  | Duplicate active placement or duplicate semantic coverage                                               | Any 1 confirmed occurrence                                                                                   | Stop affected joint handling, preserve receipts, investigate invariant breach, repair through owner command and add the failing interleaving regression before re-enable. |
| P12 security maintainer                  | Unauthorized policy/coverage acceptance or cross-context disclosure                                     | Any 1 confirmed occurrence                                                                                   | Invoke incident response, disable affected route, contain exposure and requalify all related entry points. This is not an acceptable steady-state risk.                   |
| P16 financial-domain maintainer          | Fulfillment purpose lacking a valid whole-promise money milestone                                       | Any 1 confirmed occurrence                                                                                   | Withhold affected fulfillment path, reconcile source lineage and preserve valid gift work; correct producer and prove counterexample before restore.                      |
| Shared Tasks operations owner            | Oldest accepted placement-repair intent without progress                                                | Over 15 minutes, or a dead-lettered intent immediately                                                       | Investigate/replay bounded owner repair; retain immediate policy fence and show honest updating. Do not rerun human dispositions.                                         |
| Shared Tasks operations owner            | Repeated repair failure for same semantic scope                                                         | 3 consecutive failed attempts                                                                                | Route to existing operational exception, stop noisy retries, diagnose with minimized references and recover through the qualified command.                                |
| Missionary Workspace product owner       | Users reporting they thought Separate cancelled follow-up, or thought Finish sent a message             | Any 1 critical misunderstanding in release testing; 3 independent reports in a rolling 30 days after release | Block release or review copy/flow promptly, reproduce with representative staff/missionaries and ship the smallest correction with comprehension evidence.                |
| Missionary Workspace accessibility owner | Inability to perceive/select the exact purpose scope or complete/recover with supported assistive input | Any 1 reproducible blocking failure                                                                          | Block activation for the affected flow, fix through shared UI and repeat the failing accessible journey.                                                                  |

Assign actual maintainers to these named ownership roles before activation.
Ordinary numerical capacity budgets must be recorded from the implemented service
and release workload, not invented in a research decision. This does not defer
basic correctness: duplicate effects, privacy and financial misclassification have
zero tolerated confirmed occurrences and are prevention/release gates.

## Evidence and verification limits

The fresh research notes separate repository facts, current-code observations,
primary documentation and product judgments. A new bounded semantic model and
independent root reproduction exercise **18 counterexample families, 7 positive
controls and 137 outcome assertions**; their precise
counts and limitations are in [model notes](d32-evidence/model-readme.md) and
[reproduction](d32-evidence/root-reproduction.json). They are not financial-source,
SQL/RLS, actual lock/concurrency, provider, accessibility, performance or user-study
proof. Independent challenges and final resolutions are recorded in
[cross-review resolution](d32-evidence/cross-review-resolution.md).

[Documentation verification](d32-evidence/review-verification.json) checks required
categories/clauses/proofs, status, links and preservation hashes. Nineteen D31
evidence files remain unchanged; no earlier model, probe or verifier was rerun.
No application/schema/dependency, formal PRD/ADR/OpenSpec/ticket, live data,
provider, supporter communication or GitHub state was changed. The finished
review disposition remains **Accept with required amendments**; the founder has
now ratified the corrected decision and all required amendments above.

## Explicit ratification

On October 18, 2026 UTC, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”** This
ratifies the exact corrected decision, C01–C24, P01–P36 and operational controls
as future requirements. It includes the organization-wide Combine/Separate
choice, current eligible unfinished-work reorganization, new-activation and
upgrade defaults, one purpose per continuing fixed pledge, causal source proof,
exact independent coverage and all authority, correction and migration safeguards.
It does not qualify a source producer, implementation, permission or release.

All 21 preexisting D32 evidence files and the exact pre-ratification review are
preserved in the [ratification manifest](d32-evidence/ratification-evidence-sha256.json).
The [new ratification verification](d32-evidence/ratification-verification.json)
checks status, exact decision/clauses/proofs, links and preserved evidence. The
original verification remains historical evidence; no earlier verifier, model or
probe was rerun. [Q33](phase28-q33-missionary-offline-gift-report-research.md) is
the next unanswered product choice.
