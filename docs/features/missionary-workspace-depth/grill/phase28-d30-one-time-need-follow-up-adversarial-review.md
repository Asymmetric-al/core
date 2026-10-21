# Phase 28 D30 — gifts for a specific one-time need

**Disposition: Accept with required amendments.**

**Status: the corrected decision and required amendments were explicitly ratified on October 18, 2026 UTC.**
Reviewed **October 18, 2026 UTC**, against `9cada8f3d8ab59db391d3fd20df77fcadeb09813`
and the current working tree. The founder subsequently ratified this decision
and its amendments, including one organization-wide On/Off setting, initially
Off. D29 remains ratified. This is a research/grill
artifact within the [founder's boundary](phase28-founder-brief.md:21), not a
formal PRD, ADR, OpenSpec change, implementation or release qualification.

## Exact corrected decision to record

> **D30 — Recognize gifts for a specific one-time need, with optional tenant control.**
> An exact source-qualified received monetary gift, or precisely identified
> portion, qualifies for personal follow-up when its donor-accepted purpose is
> a specific, documented one-time need. It need not also be additional support,
> exceed a commitment or meet an amount threshold. A payment made once, internal
> appeal tag, campaign end date or default designation alone does not establish
> that purpose.
>
> Authorized staff can turn this native reason on or off for the organization.
> The proposed initial state is Off, with one organization-wide setting and no
> per-need overrides. Turning it on applies prospectively to qualified live
> receipts; turning it off stops new admission through this reason. Already
> accepted follow-up, its eventual appearance, legitimate corrections and other
> independently qualifying reasons remain intact. Re-enabling does not replay
> gifts from an earlier interval or from while the rule was off.
>
> Reuse qualified purpose evidence from its source. Where a human confirmation
> is needed, authorized staff and missionaries may confirm the exact purpose
> when the organization permits that specific action and scope. One contextual
> save is sufficient; do not require another approver, a new donor checkbox,
> an appeal, a financial edit or a second task list.
>
> Maya sees a factual reason in her existing compatible follow-up: for example,
> **“Gift for vehicle repairs”** if that detail is permitted, or **“Gift for a
> one-time need”** if the category may be disclosed but the detail may not.
> Each gift retains its own source evidence and D20 reviewed-group coverage.
> Several reasons or several needs do not multiply the same gift's follow-up.
> A need becoming funded or closed does not by itself invalidate the purpose
> of a received gift. Sending and recording an actual interaction remain
> separate deliberate actions.
>
> This rule never changes received money, accepted financial designation,
> recognition, commitment application, receipts, contact permission or the
> truth of an underlying purpose record. Unknown evidence is not false evidence.
> Actual corrections affect only the invalid reason and preserve completed
> human history, permanent handling coverage and independent work.

**Customization settled by ratification:** the initial clarification offered
organization-wide On/Off versus per-need overrides and received no separate
reply. The completed review recommended organization-wide On/Off, initially Off.
The founder's subsequent explicit ratification accepts that recommendation and
closes the clarification. No per-need or per-missionary control follows. Wording
inside the quoted decision and C01–C24 retains the original reviewed proposal;
those choices and obligations are now ratified for their stated scope.

**Ratified governing amendment:** the founder brief requires native qualified
special-gift work. D30 now makes this specific criterion tenant-optional, with
one organization-wide setting initially Off. This is a narrow **D30-only**
exception, not authority to disable other required native reasons. D22 supplies
the temporal precedent without changing D29 or other reasons. Optional Workflow
Studio is not an implementation dependency for this native capability.

## Evidence and limits

| Class                                              | Verified finding or explicit limitation                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder fact                                       | A was selected: confirmed specific one-time need is sufficient without an additional-support statement; tenant customization and excellent UX are requested.                                                                                                                                                                                                                                                                                                  |
| Repository intent                                  | The [founder brief](phase28-founder-brief.md:165), D19–D22, [D29](phase28-d29-additional-gift-purpose-adversarial-review.md), [P28 owner constraints](../../../prds/program-roadmap/owner-constraints.md:57), and [ADR-0183](../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md) separate native source facts from task projections and durable handling.                                                                              |
| Source owners                                      | P13 owns money/legal gift purpose; P14 recognition; P16 commitment application; P27 Request/appeal coordination; P28 this operational purpose/admission; P9 ordinary tasks/interactions; P12 authorization/disclosure. [ADR-0206](../../../adr/0206-immutable-posted-financial-facts-and-owner-operational-state.md) forbids mutable operational purpose on posted financial rows.                                                                            |
| Repository conflict resolved by ratified amendment | [P27 F83–F84](../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:818) rejects task-per-link/response and fences new solicitation after closure. A qualified received-gift purpose is a separate occurrence; closure does not revoke independent gift stewardship. [E7](../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:41) remains a gate for adapters dependent on unresolved temporal attribution. |
| Current implementation, statically inspected       | The existing org-settings handler still uses a fixed tenant ID despite its PATCH role check. Manual task creation is explicitly non-automatic; generic task mutations do not prove D20 coverage. No qualified D30 policy/purpose implementation was established. These are reuse hazards, not a claim of an executed exploit or deployed D30 defect.                                                                                                          |
| Current primary evidence                           | TntConnect campaign semantics; MPDX exact gift attribution; Givebutter funds, appeals and tasks; HubSpot workflow-Off consequences; W3C accessibility; current PostgreSQL/Supabase authorization guidance. Sources, retrieval dates and limits are in the evidence notes below.                                                                                                                                                                               |
| Product judgments                                  | One organization setting, initially Off, plain reason text, one contextual confirmation, existing grouped tasks and no new Need registry are now ratified design judgments. No claim is made that these choices were empirically optimized with Core missionaries.                                                                                                                                                                                            |
| Unknowns requiring release proof                   | Production actor/source adapters, policy ordering, real SQL/RLS, source repair, capacity, accessibility and field usability remain unqualified. Public documentation is neither user feedback nor authenticated product testing. No synthetic check establishes those outcomes.                                                                                                                                                                               |

Detailed evidence: [governance](d30-evidence/governance-and-policy.md),
[need/financial lifecycle](d30-evidence/need-purpose-and-financial-lifecycle.md),
[database and authorization](d30-evidence/database-and-policy-authorization.md),
[UX and primary research](d30-evidence/ux-and-primary-research.md).
The [original question](d30-evidence/q30-before-answer.txt) is preserved.

**Strongest alternative:** leave this purpose as context and require another
already-qualified reason or deliberate manual follow-up. It has a smaller
source contract and generates less automatic work, but fails the selected
sufficient case. Keep manual follow-up for uncertain or out-of-cohort gifts;
do not make it the permanent implementation of A. A generic customizable
workflow builder would offer more combinations but add configuration and
support burden without evidence of need. Reuse one native evaluator and the
ordinary task system.

**What the comparables actually establish.** TntConnect campaigns can concern
one-time gifts or recurring increases; campaign membership is not purpose proof.
MPDX says users may be prompted to choose the exact processed appeal gift.
Givebutter allows preselected funds and persistent recurring designations;
accepted default terms may be valid, but a default alone is insufficient.
Its appeals can automatically tag transactions and are internal attribution,
not donor choice. HubSpot's documented Off behavior illustrates why consequences
must be explicit; its workflow behavior is not Core's contract. Broad staff
visibility in another CRM does not override P12. These examples support precise
attribution and understandable controls, not a claim about Core ministry demand.

## Complete journey and UI

**Staff configure one understandable rule.** In the existing organization
stewardship settings, show **One-time-need follow-up**, a saved On/Off state,
and a short explanation: **“Create personal follow-up for eligible gifts given
for a specific one-time need.”** The initial setting is Off. An inert example
shows **Gift for vehicle repairs → personal follow-up**. It is not a live donor
preview and requires no additional gift-reading permission.

Turn on uses the existing automation activation boundary: current scoped
management authority, a declarative preview, an inert test through the actual
evaluator and an activity record, composed into one clear action. Show the
prospective effective time after acceptance. Do not create a separate workflow
studio, approval wizard, arbitrary script, condition builder or per-gift test.
If the source is unqualified, show **Setup unavailable** with its owned repair
route, not a misleading functional Off switch or a false promise of activation.

Before staff turn Off, show concise inline consequences: **“Stops new follow-up
from this rule. Existing follow-ups remain. Work already accepted may still
appear or be corrected.”** Re-enabling explains **“Applies to new eligible gifts;
previously unhandled gifts are not added automatically.”** No forced modal is
needed for a non-destructive prospective switch. Current state must survive
refresh/retry; a stale editor gets the current saved setting and retains its
intended change without overwriting another staff member silently. Turning Off
must remain available independently of a failed activation test.

**The donor uses the ordinary giving journey.** This decision introduces no
checkout question, coercive additional-support declaration, acknowledgement
or receipt. The existing source may qualify acceptance of visible concrete need
terms, including a valid accepted default. An internal appeal label or free-text
note without attributable accepted purpose does not qualify. Need closure follows
its existing solicitation rules; D30 must never reopen a giving invitation.

**Record purpose once, from the exact gift.** Reuse already qualified evidence
without asking staff or Maya to confirm it again. Otherwise, an eligible recorder
uses **Record one-time purpose** in the authorized gift context. Show the exact
gift or relevant portion, ministry, date, currency and permitted attribution.
Reuse the bounded need context if it exists. For a direct donor statement, allow
a concise concrete purpose such as **Vehicle repairs**, with attributable
statement provenance and the trusted recorder's affirmation. Do not force an
appeal, project, financial allocation, transcript, screenshot or second approver.

The form says: **“Record the purpose accepted for this gift. This does not change
the gift or its commitment application.”** If only a portion is covered, display
that scope explicitly using owner-qualified amounts; never default a partial
statement to the whole gift. A source-qualified selection may avoid manual
amount entry entirely. Current financial corrections retain their own owner.

One **Save purpose** records the qualified operational fact. Confirm **“Purpose
recorded.”** Add **“Follow-up is being updated”** only when an accepted effect
is still projecting, and **“Added to the current follow-up”** only once it is
available. Explain **“This gift has already been handled”** or **“This gift is
outside the rule's active period”** when that is the authorized actual result.
Show **“This follow-up rule is off”** only when permitted and causally accurate;
an accepted pre-Off effect may still appear. If acceptance is uncertain, recover
the same command result; do not suggest repeated new saves. Policy Off does not
prohibit recording a valid purpose fact. If the recorder cannot see downstream
work, confirm only the permitted purpose result.

**Maya works in her normal list.** The existing card shows the supporter only
when permitted, the existing due state, and a plain reason. A single gift uses
**Gift for vehicle repairs** when allowed. A grouped task can show **2 gifts to
review**, with each permitted gift and its own reason on opening. Preserve
D20's clear reviewed group; a later gift does not silently become covered by a
completion Maya already reviewed. No new “special donors” score, urgent badge,
extra inbox or duplicate progress tally is added.

Maya can use ordinary task controls for due date, priority, permitted notes,
completion and Not needed. Those controls do not alter gift purpose or financial
facts. The reason detail explains **“Recorded purpose: vehicle repairs”** and
source/date only within current permission. Correcting the purpose routes to
its owner; a task title is not the correction interface. When a source correction
removes this reason, preserve other reasons and human history. Unknown source
availability shows an honest pending/recheck state without erasing valid history.

**Coaches, donors and public surfaces gain no access.** D26's separately selected
summary sharing remains its own boundary; this task reason, gift evidence and
need label do not automatically enter it. Notifications and logs must not leak
need names, private correspondence, donor identity, location or reason existence.
A generic category is allowed only if that category itself is disclosable.

**Visual and interaction quality.** Reuse Core's shared `packages/ui`, base-maia,
Base UI and semantic Zinc tokens. Use a calm vertical layout, descriptive labels,
plain status text and one primary contextual action. Keep technical lineage in
restricted support views. On mobile, present gift details as readable rows/cards;
keep the save action reachable without covering focused inputs. Announce save
results without moving focus unnecessarily, preserve input after recoverable
errors, and provide keyboard operation, visible focus and non-colour status.
Meet WCAG 2.2 AA, including reflow and target-size requirements; Core's touch
pattern may be more generous. Test long international names, translated labels,
RTL where supported, zero/three-decimal currencies, explicit local dates/time
zones and low bandwidth. This feature adds no address form or donor checkout
step, so it must not introduce those friction points.

## Required decision and design language

### D30-C01 — Exact sufficient purpose

The system SHALL recognize a specific documented one-time need only from an
attributable donor-accepted purpose tied to an exact qualified received monetary
gift or portion. “One-time” describes the bounded need, not payment frequency,
number of gifts, campaign duration, donor status or inferred generosity. An
additional-support statement or monetary threshold SHALL NOT be required. When
On and all current source, authority and live-interval conditions hold, P28 SHALL
admit the reason through D20's durable path without a separate manual Add step.

### D30-C02 — Bounded context, no new financial authority

P28 SHALL own the operational assertion and admission. It SHALL consume qualified
existing purpose context when available, including an exact P27 Request/appeal
context where that entity genuinely exists. A direct qualified assertion may
identify a concrete need without inventing an appeal. No universal Need registry,
need balance, financial allocation or parallel purpose ledger is authorized.
Financial accepted-purpose disagreements SHALL route to P13; operational evidence
cannot override financial designation or donor restrictions.

### D30-C03 — Exact confirmation capability

The proposed actor class is authorized staff and missionaries when the organization
permits the exact one-time-purpose confirmation action and scope. P12 SHALL
qualify that action before activation; D29's existing additional-purpose capability
SHALL NOT silently grant it. Gift visibility, task editing, role name, authorship
or need-management access is insufficient. Trusted server context SHALL derive
tenant, actor and recording attribution. No routine second approval is required.

### D30-C04 — Evidence and captured meaning

The producer SHALL preserve source origin, exact gift/portion, bounded purpose
terms/version, donor or authorized representative acceptance, trusted recorder
and correction lineage. Evidence SHALL be an owner-qualified structured accepted-purpose fact, or a
permitted recorder's attestation of directly received or reviewed donor/authorized
representative evidence. Preserve acceptance occurrence with its supported
precision separately from trusted recorded-at time. Model inference, hearsay
and relabelled protected notes are not substitutes. No mandatory private-body
copy is introduced.
A changed title, closed campaign, imported tag or relabelled Request SHALL NOT
retroactively manufacture accepted one-time purpose. Legitimate owner corrections
must identify their evidence and preserve the prior meaning.

### D30-C05 — Original scope and current money

Original assertion scope SHALL remain distinct from source-qualified surviving
support. P13/P14 SHALL certify exact current positive support for the relevant
Party/typed subject and applicable gift/portion after reversals, with exact
currency/precision. Do not use floating point, FX, fee/net settlement, promises,
noncash valuation or unreceived gifts as substitutes. A wholly purpose-bound
gift may retain qualifying positive support after a partial reversal when its
owner proves that fact; an ambiguous mixed-gift reversal SHALL hold only the
affected reason. No invented pro-rata or min/max allocation is permitted.

### D30-C06 — One native tenant policy

The proposed policy SHALL be one organization-wide On/Off setting, initially Off,
managed through current P12-qualified automation management authority. There
SHALL be one authoritative current state and immutable referenced policy history.
This is a narrow D30 exception to native required work, not a disable switch for
other reasons. No per-need, per-missionary, donor or currency override, custom
formula, label-based qualifier or Workflow Studio dependency is introduced.

### D30-C07 — Safe activation and honest state

Activation SHALL satisfy the [platform automation guard](../../../../openspec/specs/platform-boundaries/spec.md:428):
declarative trigger/condition/action, applicable run mode and review/failure
policy, current `automation:manage` mapping, preview, inert evaluator test and
activity evidence. Compose this within one deliberate Turn on. Tests SHALL NOT
create gifts, tasks, messages or external calls. Missing/unqualified/error state
SHALL differ from deliberate Off; no-op save/retry SHALL NOT open a new interval.

### D30-C08 — Prospective original live boundary

Use the original owner-certified eligible live received/support occurrence,
independent of downstream worker, confirmation and task delay, as the policy
boundary. A genuine later source finality event may be that first occurrence;
transport arrival, imported history, an edited date or reclassification may not.
First valid later confirmation may admit an otherwise eligible, unhandled gift
only while the same enabled interval covering that original boundary continues.
Unknown lineage requires owned qualification, not assumed eligibility or zero.

### D30-C09 — Off and re-enable

Off SHALL serialize against new reason admission: admission first preserves the
accepted reason/intent; Off first rejects the unadmitted effect. Already accepted
work may materialize afterward. Re-enable begins a new prospective interval;
never-admitted old-interval candidates and Off-period receipts SHALL NOT replay.
Purpose recording, other reasons and manual work remain independent. No automatic
cancel, completion, bulk deletion or notification follows the setting change.

### D30-C10 — Closure and source correction

Actual owner closure SHALL apply its qualified planning/solicitation fence.
Funding/goal attainment or archive alone SHALL NOT close coordination, create
a new fence or invalidate genuine received-gift purpose. A genuine late receipt
may qualify only if its financial/purpose source accepts it and the D30 live
interval permits admission; D30 cannot override an ineligible designation or
silently redirect funds. Actual source invalidity withdraws
only this reason; missing availability is not invalidity. A genuine repair of
previously admitted, still-unconsumed work may restore the same identity under
current authority, even while Off. It SHALL NOT revive handled/Not needed work
or never-admitted candidates. If no valid reason remains, use the existing
source-owned withdrawal of unstarted work; do not mark it Done. Correction must
not reopen the appeal.

### D30-C11 — Stable business identity and grouping

Reuse D20's contribution/Party/typed-subject/special-purpose identity and reviewed
group coverage. Need IDs, policy versions, reasons, recorders, financial line
replacements and delivery IDs SHALL NOT mint another handling opportunity for
the same member. Multiple needs may retain precise reason/portion evidence on
that member. Distinct qualified gifts remain distinct members, normally in one
compatible current task. No arbitrary per-need dedup window is introduced.

### D30-C12 — Atomic admission and recovery

At the authoritative acceptance boundary, current source/evidence, policy interval,
authority and unconsumed identity SHALL be checked in a single serialized decision
with durable reason/intent and command result. Each accepted local policy,
purpose or admission mutation SHALL co-commit its required state/revision,
minimal audit, command receipt and any required projection intent. If owners commit separately, use
the existing versioned source protocol and durable intents; do not pretend one
transaction spans finance and tasks. Recheck after waits with current time and
current revisions. Financial posting SHALL NOT wait on human purpose review.
Projection failure SHALL retry the same business effect; lost responses SHALL
recover the original result rather than create a new command effect.

### D30-C13 — Database invariants

Use tenant-aware keys/relationships for policy, assertion, contribution, permitted
Party, exact financial Legal Entity, typed subject, source version, intent and
task coverage. Require explicit
valid states, non-null identity/version fields, exact types, uniqueness for the
current policy and durable effect, and indexes matching authorized lookups.
Forbid changes to identity/tenant/author/audit attribution through generic updates.
Referenced policy/evidence SHALL NOT cascade-delete completed history; lawful
source-owned disposition and minimal tombstones must preserve required identity.
No mutable purpose column belongs on a posted financial row.

### D30-C14 — Equivalent authorization at every entry

Grants, RLS, RPCs, views, storage, exports, jobs and service-role paths SHALL
preserve the same action, tenant, row and field boundaries. Test UPDATE `USING`
and `WITH CHECK`, INSERT/DELETE, prohibited row transformations, table/column
grants and invoker/definer behavior. RLS is not column authorization, and a service
credential is not a user permission. Default/implicit PostgreSQL policy behavior
must be tested accurately. Privileged functions require a fixed safe search path,
restricted execution and explicit current scope; no unrestricted bypass client
may qualify a caller-controlled tenant or actor.

### D30-C15 — Current safe projection

At final authorized release, recheck current identity, privacy/anonymity, purpose
category and detail permissions. Use an approved specific label only if permitted;
a generic label requires category disclosure permission. Hidden label is not
hidden existence. Apply the same boundary to lists, search, task history,
notifications, exports, caches, command recovery and coaching projections.
No raw private correspondence is embedded in tasks. Already released bytes cannot
be recalled; cancellation/revocation must fence subsequent releases.

### D30-C16 — One contextual recording journey

Reuse qualified source facts without duplicate confirmation. Manual confirmation
SHALL use one compact exact-gift/portion form with clear factual purpose,
provenance and deliberate save, no required transcript or extra approver. Saving
purpose and admitting follow-up SHALL report their distinct outcomes truthfully.
Show recorded, being updated, available, already handled, outside active period
or Off only when that result is established and disclosable; do not label every
successful purpose save as new follow-up.
When no evidence exists, do not manufacture a mandatory exception queue for every
gift; ordinary absence is not a defective import or a donor deficiency.

### D30-C17 — Existing task journey

Maya SHALL see a plain factual reason and permitted individual gift evidence in
the existing compatible task. Existing due/priority/Not needed/interaction controls
remain. Group handling SHALL cover only the exact reviewed authorized member set. An
unrelated new gift SHALL remain pending without invalidating a still-current
reviewed subset; a material change to a reviewed member or its authority SHALL
reject stale completion and require refreshed review.
No automatic send, receipt, interaction, completion, coach share or donor ranking
follows admission. A reason correction SHALL not overwrite human notes/history.

### D30-C18 — Accessible, resilient presentation

Use existing Core components and semantic tokens, labelled state/actions,
keyboard/focus support, non-colour status and accessible error/status announcements.
Preserve authorized input on recoverable failure. Reflow and touch behavior must
meet WCAG 2.2 AA; test actual screen-reader/mobile/low-bandwidth journeys. Display
currency and occurrence precision honestly with localized date/time context.
Do not use optimism that claims a committed policy or saved purpose before proof.

### D30-C19 — Audits and minimal retention

Keep durable policy/admission/correction/handling evidence distinct from technical
logs. Record trusted actor, scope, policy/source version, reason, effect/result
and correction lineage without copying donor bodies or private need labels into
telemetry. Purpose evidence, source bodies and financial history retain their
own owner schedules; D28 preparation retention does not apply. Minimize backups,
exports and derived caches and enforce current disclosure on recovery.

### D30-C20 — Bounded operations and capacity

Use indexed exact source/policy/identity lookups and bounded, resumable projections
with tenant fairness. Do not scan all giving history on each save or activation.
Preserve existing delivery infrastructure rather than introducing a new event
store or scheduler. Qualify deployment batch, queue and latency limits against
representative production-shaped load before enabling; no unmeasured capacity
or completion-time claim is approved by this review.

### D30-C21 — Owner-specific integration qualification

Each source adapter SHALL prove actual received support, captured accepted
one-time purpose, original live provenance, correction ordering and current
field audience. Imported/default/appeal metadata alone is insufficient. E7 or
another unresolved contract blocks only adapters that depend on it; independently
qualified purpose paths need not wait for unrelated reporting. No new connector
or third-party workflow vendor is required. Source drift must not silently admit
work using guessed mappings.

### D30-C22 — Additive rollout and safe rollback

Keep new admission Off until exact owner/action/schema/projection contracts and
release proofs pass. Deploy compatible schema/reader/writer changes in the
supported order; old writers must be fenced from new immutable identities and
coverage. Do not backfill task admission from historical labels. A kill switch
stops new admission while preserving durable accepted work, lawful correction
and reads. Rollback must not drop evidence or revive consumed work; use an
additive roll-forward if old code cannot safely interpret new state.

### D30-C23 — Falsifiable proof and traceability

Carry D30 and C01–C24/P01–P32 into the eventual glossary/owner reconciliation,
formal specification, design, tasks, tickets, tests and release evidence only
through the authorized promotion workflow. Every proof below SHALL be demonstrated
against real boundaries before release. Link the source/policy/actor contract
versions; a document model or source search is not implementation qualification.

### D30-C24 — Customization boundaries and feedback

Tenant customization SHALL change this reason's prospective availability, not
financial truth, purpose meaning, privacy, confirmation rights, permanent coverage
or other native reasons. In the proposed scope, staff set On/Off and Maya uses
ordinary task controls. Do not add overrides, arbitrary labels or extra policy
axes without a separately evidenced need. Validate staff comprehension and Maya's
full journey with representative users; monitor only named residual signals
under the responsibilities below.

## Consolidated adversarial findings

Severity describes credible impact without safeguards. Likelihood is a qualitative
engineering assessment, not measured incidence. Every material finding changes
or narrows the implementation contract; none invalidates the selected sufficient
purpose once amended. IDs below give exact normative language and release proof.

| ID  | What can go wrong and why it matters                                                                                                                  | Severity / likelihood                            | Evidence or reasoning; effect on answer                                                                                                      | Permanent fix and exact change                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| F01 | An appeal tag, one-time payment or renamed campaign becomes donor intent, generating false follow-up and inaccurate explanations.                     | High / likely if heuristics reused               | Comparator semantics differ; P27 F83 and D21 prohibit these inferences. Narrows qualifying evidence.                                         | Captured exact accepted purpose; C01–C04, C21; P01–P04, P26.                                                                   |
| F02 | A mutable “special” field modifies posted money or a new Need ledger becomes a competing financial authority.                                         | High / plausible                                 | ADR-0206 and P13/P14/P16 ownership; no universal canonical Need evidenced. Changes placement, not A.                                         | Bounded P28 assertion, source-owned money, no invented appeal/ledger; C02, C05, C13; P05–P07.                                  |
| F03 | Tenant customization silently disables required native work, becomes a complex workflow builder, or implies new editing/confirmation powers.          | High / plausible                                 | Founder native-work requirement and platform automation guard conflict with an unbounded interpretation. Requires explicit narrow amendment. | D30-only orgwide On/Off proposal and qualified separate actions; C03, C06–C07, C24; P08–P10.                                   |
| F04 | Off races admission; re-enable replays old receipts; late evidence selects today's policy. Staff lose predictable control and receive backlog floods. | High / likely without version/order contract     | D22 temporal precedent; async delivery cannot determine business effective time. Changes lifecycle.                                          | Original live boundary, uninterrupted interval, serialized Off, no-op stability; C08–C12; P11–P15.                             |
| F05 | Closing/funding the need erases valid gift care or an earlier need is reopened merely to allow follow-up.                                             | Medium / plausible                               | P27 F84 separates solicitation closure from late facts/independent obligations. Narrows closure effects.                                     | Preserve valid purpose; never reopen solicitation; C10, C21; P16.                                                              |
| F06 | Partial-purpose gifts/refunds classify unrelated money; DAF/household roles or multiple needs multiply gifts.                                         | High / plausible                                 | Original assertion and surviving support differ; P14 attribution and D20 identity govern. Narrows monetary eligibility.                      | Exact owner-qualified surviving portion, no guessed allocation or per-need member; C05, C11; P06–P07, P17.                     |
| F07 | Fixed-tenant settings, caller IDs, broad task rights or service-role jobs cross tenant/action/field boundaries.                                       | Critical / plausible if adjacent code copied     | Current org-settings fixed tenant; RLS alone does not grant field/action safety. Changes mandatory implementation boundary.                  | Trusted context, tenant-aware relationships, exact commands, all grants/policies tested; C03, C13–C15; P18–P20.                |
| F08 | “Vehicle repairs” exposes a sensitive location/context; a generic label still reveals a protected purpose.                                            | High / plausible                                 | Core missionary privacy and P12 purpose disclosure; labels/search/history can leak independently of body. Narrows projection.                | Separate category/detail permission at final release across every surface; C15, C19; P21–P22.                                  |
| F09 | Retried confirmation, out-of-order correction or response loss creates duplicate work; source success precedes failed task projection.                | High / likely under failures                     | Durable effects span owners; transport idempotency alone is insufficient. Changes acceptance/recovery.                                       | Stable business identity, atomic intent/result, repair same effect, current fences; C10–C12; P13–P15, P23.                     |
| F10 | A new gift joins a task while Maya completes it and is silently treated as reviewed; title edits consume native coverage.                             | High / plausible                                 | D20 reviewed membership is stronger than generic current task completion. Changes reuse requirements.                                        | Existing exact reviewed set and permanent coverage; no generic title-based binding; C11, C17; P17, P24.                        |
| F11 | Staff must create appeals, copy donor messages or approve every gift twice; Maya sees a second queue or technical states.                             | Medium / likely if source proof becomes extra UI | Comparable exact selection and simple accessible forms support contextual work, not duplicated administration. Changes journey.              | Reuse qualified evidence, one minimal save, existing tasks, distinct truthful outcomes; C16–C18; P25, P28–P30.                 |
| F12 | Disabling the feature deletes facts or audits; retained snapshots preserve sensitive content forever; correction rewrites completed history.          | High / plausible                                 | Off is policy, not erasure; source/audit/privacy schedules differ. Changes retention/correction.                                             | Owner disposition, minimal metadata, immutable prior meaning, current reads; C04, C10, C13, C19; P22, P27.                     |
| F13 | Automation preview/test sends messages or creates work, while a failing test prevents emergency Off.                                                  | High / plausible                                 | Platform guard must be translated into a native bounded control, not copied blindly. Narrows activation.                                     | Inert actual-evaluator test, one deliberate activation, independent Off; C07, C09; P09–P10.                                    |
| F14 | Full-history scans, noisy retries or a large tenant starve others; unlimited metrics become costly or reveal source data.                             | Medium / plausible at scale                      | Exact event/identity lookups suffice; no measured deployment capacity established. Changes operational design.                               | Bounded indexed/fair projection, production-shaped qualification, metadata metrics; C19–C20; P31.                              |
| F15 | Generic source outage looks like Off/false purpose; unresolved E7 causes either guessed attribution or an unnecessary global blockade.                | High / plausible                                 | Owner-specific missing facts differ from invalidity and intentional policy. Narrows failure/dependency behavior.                             | Distinct states, owned repair, exact adapter qualification, independent work continues; C08, C10, C21; P23, P26.               |
| F16 | Mixed-version deployment bypasses identity safeguards or historical backfill creates hundreds of old tasks; rollback loses evidence.                  | High / plausible                                 | Adjacent manual handlers do not implement D30; persistent new facts outlive code rollback. Changes rollout.                                  | Additive gated deployment, no label backfill, fence old writers, preserve accepted work; C22; P32.                             |
| F17 | Logs show successful requests but cannot explain admission, correction or missing tasks; support needs direct database repair.                        | Medium / plausible                               | Transport success differs from durable business result and human handling. Changes observability/operations.                                 | Correlated minimal policy/source/effect receipts, owned retry/correction UI and monitor response; C12, C19–C20; P23, P27, P31. |
| F18 | Public vendor docs or synthetic checks are presented as verified Core UX/security; terms drift across the developing spec.                            | High / plausible                                 | No production D30 or Core user study was established. Changes claims and promotion gates.                                                    | Explicit evidence classes, stable clauses/proofs, representative usability and boundary tests; C23–C24; P28–P32.               |

## Every requested category evaluated

All categories were independently assessed. A shared finding may affect several
categories; the exact correction is defined once rather than duplicated.

| Category                                                          | Material concern?                  | Result, evidence and required response                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity, and alternatives                  | **Yes**                            | A addresses the selected exact-purpose case, but product value is a judgment, not measured ministry demand. Manual-only and a general rule builder lose to bounded native work for this selection. F01–F03/F18; C01–C07/C24; P01/P08/P28–P30.                               |
| 2. Brittleness                                                    | **Yes**                            | Appeal/frequency/default semantics, current titles and worker arrival are fragile substitutes for accepted terms and live lineage. F01/F04/F15; C04/C08/C21; P02–P04/P11/P26.                                                                                               |
| 3. Technical debt                                                 | **Yes**                            | Copying hard-coded settings/manual task handlers, inventing Need storage or duplicating coverage creates permanent conflicting paths. F02/F07/F09/F16; C02/C11–C14/C22; P05/P18/P23/P32.                                                                                    |
| 4. Edge cases                                                     | **Yes**                            | Mixed portions, refunds, repeated gifts to one need, accepted defaults, late confirmation, closed/funded needs and multiple reasons need explicit outcomes. F01/F04–F06/F09–F10; C01/C05/C08–C12/C17; P03/P06–P07/P11–P17/P24.                                              |
| 5. Footguns                                                       | **Yes**                            | Mark-special shortcuts, hidden On state, replay after toggling, live activation tests and silent completion expansion are easy mistakes. F03–F04/F10/F13; C06–C09/C17; P08–P15/P24.                                                                                         |
| 6. Tenant safety                                                  | **Yes**                            | Policy can be orgwide while each source/read/effect remains exact tenant and subject scope; caches/jobs/settings must not use fixed or caller-supplied tenant. F07–F08; C13–C15; P18–P22.                                                                                   |
| 7. Database, RLS, and authorization safety                        | **Yes**                            | Keys, grants, UPDATE old/new row scope, column mutability, privileged paths and actor derivation need real proof. Current adjacent code is insufficient. F02/F07/F09; C03/C12–C14; P05/P18–P20/P23.                                                                         |
| 8. Overengineering                                                | **Yes**                            | Per-need overrides, arbitrary formulas, new registries, second approvals and another task queue solve unverified needs. F02–F03/F11; C02/C06/C16–C18/C24; P08/P25/P28–P30.                                                                                                  |
| 9. UX/UI and user friction                                        | **Yes**                            | Confusing purpose versus additionality, policy consequences, inaccessible save feedback and duplicate entry undermine trust. Whole staff/donor/Maya/mobile journey is specified above; no new public/address flow. F04/F08/F11/F13; C15–C18; P09/P21/P25/P28–P30.           |
| 10. Source of truth, ownership, and domain invariants             | **Yes**                            | Operational purpose, received money, accepted legal purpose, policy, task projection and reviewed coverage must not acquire dual owners. F01–F02/F06/F09–F10; C01–C05/C11–C14; P01–P07/P17/P23–P24.                                                                         |
| 11. Hidden coupling                                               | **Yes**                            | Need closure can wrongly cancel gift work; task edits can rewrite source facts; optional workflows can become a native dependency. F02–F05/F10/F15; C02/C06/C10/C17/C21; P05/P08/P16/P24/P26.                                                                               |
| 12. Failure modes                                                 | **Yes**                            | Lost responses, accepted-but-unprojected work, unavailable source, denied final reads and Off races require visible, safe recovery. F04/F07–F09/F15/F17; C08–C12/C15–C20; P13–P15/P21–P23/P27.                                                                              |
| 13. Lifecycle, temporal correctness, concurrency, and idempotency | **Yes**                            | Original live boundary, policy interval, current correction, permanent coverage and final authorization are distinct clocks/states. F04–F06/F09–F10; C08–C12/C17; P11–P17/P23–P24.                                                                                          |
| 14. Data integrity risks                                          | **Yes**                            | Changed source IDs/need names, overlapping reasons and partial reversals can duplicate or misclassify work and rewrite historical meaning. F01–F02/F06/F09–F10/F12; C04–C05/C10–C13; P04–P07/P17/P23–P24/P27.                                                               |
| 15. Security and privacy risks                                    | **Yes**                            | Sensitive labels, category existence, raw bodies, retained caches and role overreach need current field-specific protections. F07–F08/F12; C03/C13–C15/C19; P18–P22/P27.                                                                                                    |
| 16. Scalability and performance risks                             | **Yes**                            | History scans and unbounded cross-tenant queues are avoidable; real capacity is unknown. No invented throughput target is approved. F14/F17; C20; P31.                                                                                                                      |
| 17. Operational burden                                            | **Yes**                            | Mandatory exception queues, duplicate source entry, manual task repair and opaque settings would make a simple feature costly. F11/F15/F17; C16/C19–C21; P23/P25–P27/P31.                                                                                                   |
| 18. Observability and auditability gaps                           | **Yes**                            | Request logs alone cannot explain which policy/source admitted or withdrew a reason, nor whether Maya handled it. F12/F17; C04/C12/C19; P23/P27.                                                                                                                            |
| 19. Dependency and integration risks                              | **Yes**                            | Financial/source adapters can mis-map accepted purpose and temporal lineage; vendor semantics are not Core ownership. No new external runtime dependency is needed. F01/F15/F18; C21/C23; P26/P32.                                                                          |
| 20. Migration, rollout, and upgrade risks                         | **Yes**                            | Old handlers, historical-label backfills and destructive rollback can bypass coverage or lose history. F16; C22; P32.                                                                                                                                                       |
| 21. Testability, traceability, and proof                          | **Yes**                            | Existing code, official documentation and finite models do not prove integration; exact acceptance traces must survive promotion. F18; C23; P01–P32.                                                                                                                        |
| 22. Other development hazards                                     | **No additional material concern** | Checked arbitrary code execution, new checkout fields, tax-receipt changes, financial reporting, new vendor lock-in and unrelated coaching rights: none is authorized. Known defaults, rollback, maintainability and repair hazards are already covered by F01–F18/C01–C24. |

## Precise release proofs

These are required independently testable outcomes, not claims that the current
application already passes them. Test user-visible/domain effects, including
negative paths and realistic concurrency, not only helper implementation.

| ID  | Required outcome                                                                                                                                                                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | An exact eligible live gift with confirmed specific one-time purpose qualifies while On without additionality, a minimum, excess or firstness.                                                                                                                                                                 |
| P02 | Payment-once, campaign end date, internal tag, imported label and mere Request/working-list membership each fail to qualify by themselves.                                                                                                                                                                     |
| P03 | Owner-qualified donor acceptance of concrete visible default terms can qualify; default alone cannot. Recurring payment frequency neither proves nor disproves the purpose.                                                                                                                                    |
| P04 | Renaming/reclassifying a need never changes captured donor-accepted meaning; a genuine evidenced source correction does so with prior history intact.                                                                                                                                                          |
| P05 | Direct legitimate need evidence can qualify without manufacturing an appeal/Need ledger or updating any posted financial row; conflicting financial designation routes to its owner.                                                                                                                           |
| P06 | Exact partial purpose affects only its portion; owner-qualified partial/full reversals and ambiguous mixed reversals produce the specified independent-reason outcomes.                                                                                                                                        |
| P07 | Recognition roles, currencies, unrelated allocations, commitments, noncash, fee/net amounts and gift-in-hand cannot manufacture or multiply qualifying support.                                                                                                                                                |
| P08 | Initial Off, missing/unqualified state and On are distinguishable; only the exact authorized organization action changes the policy. Other native reasons continue while D30 is Off.                                                                                                                           |
| P09 | Activation preview/test exercises actual policy evaluation but produces no task, gift, send or external effect; one accepted activation has one durable policy result.                                                                                                                                         |
| P10 | Off works during evaluator/setup failure; concurrent/stale settings edits do not silently overwrite; no-op/retry does not create another interval.                                                                                                                                                             |
| P11 | Original eligible live boundary, true later source finality, late transport, history acquisition and first later purpose confirmation select the correct policy interval.                                                                                                                                      |
| P12 | Off-period and old-interval never-admitted gifts do not replay after On; first later confirmation within the uninterrupted original interval may qualify.                                                                                                                                                      |
| P13 | Real Off/admission race has one order: accepted intent survives or unadmitted effect loses. A stale On cache cannot admit after Off.                                                                                                                                                                           |
| P14 | Accepted intent may materialize after Off without new admission; source repair restores only the same admitted unconsumed member, not handled/Not needed work.                                                                                                                                                 |
| P15 | Purpose/source correction, actor revocation, policy change and lock waits are rechecked at final acceptance with current revision/time.                                                                                                                                                                        |
| P16 | Funded-but-open is not automatically closed or fenced; actual closure preserves its owner-defined fence. Test independently eligible and source-ineligible late receipts: only the former may qualify within D30's live interval, without reopening solicitation or redirecting funds.                         |
| P17 | Two different gifts retain two members; one gift with several needs, reasons, actors, policy/source versions or retries has one D20 member/handling opportunity.                                                                                                                                               |
| P18 | Two tenants with overlapping users/IDs cannot read, alter, join, cache, export or project each other's settings, assertions or gift effects through any entry path; wrong Legal Entity or financial scope also fails within one tenant.                                                                        |
| P19 | Ordinary staff/missionary/task editor, source viewer, suspended actor and wrong-subject actor cannot confirm/manage without the exact current action; tenant/author/actor spoofing fails.                                                                                                                      |
| P20 | Actual grants/RLS/RPC/storage/service paths reject forbidden INSERT/UPDATE/DELETE and tenant/identity transformations; both UPDATE predicates and column privileges behave as intended.                                                                                                                        |
| P21 | Hidden category/detail/anonymity is preserved in task list/detail/history/search/export/notification/cache/recovery and separately shared coaching summaries.                                                                                                                                                  |
| P22 | Revocation before final release blocks later content; retained snapshots/old policy history cannot grant access. No promise is made to recall already disclosed bytes.                                                                                                                                         |
| P23 | Duplicate/reordered events, failed projection, commit-then-lost-response and retry preserve one durable effect/result and recover without manual database repair.                                                                                                                                              |
| P24 | A still-current reviewed subset may complete while an unrelated new gift remains pending. Material changes to reviewed facts/authority reject stale completion; manual title matching and generic patch/delete cannot bypass native coverage.                                                                  |
| P25 | Existing qualified evidence requires no re-entry; one contextual save records valid human evidence without extra approval, body copy or fake appeal. No-evidence gifts do not fill a mandatory exception queue.                                                                                                |
| P26 | Each enabled adapter proves purpose, source money, privacy and live lineage; unsupported mapping/E7 dependency blocks only that adapter/reason with an owned diagnostic.                                                                                                                                       |
| P27 | Authorized support can explain admission/correction/Off/coverage from minimal durable evidence; source disposition and backup/export handling preserve required identity without indefinite private-body retention.                                                                                            |
| P28 | Representative authorized staff can explain On, Off, re-enable and already accepted work accurately and perform settings/correction without expert guidance. Any wrong expectation of retroactive cancellation/replay blocks rollout.                                                                          |
| P29 | Representative missionaries can identify the actual reason and exact reviewed gifts, handle once and understand recorded, pending projection, available, already handled, outside-period and Off outcomes without false new-work promises. Any false financial/additionality/sending inference blocks rollout. |
| P30 | Real keyboard/screen-reader/mobile/reflow/low-bandwidth tests preserve focus, input and truthful status; international names, labels, date/time precision and supported currencies remain understandable.                                                                                                      |
| P31 | Production-shaped load establishes a documented tenant-fair batch/queue/latency envelope; retries and repair recover within the declared operational budget without full-history scans or private telemetry.                                                                                                   |
| P32 | Mixed-version rollout, rejected old writes, no historical-admission backfill, admission kill switch and rollback/roll-forward preserve source facts, permanent coverage and already accepted work.                                                                                                             |

## Ruthless synthesis and execution order

**Ratified decision basis:** A, the single organization-wide control, initial
Off state, narrow native-work exception and exact temporal behavior were
explicitly accepted on October 18, 2026 UTC. The scope clarification is closed
by that ratification. No amount, blanket role grant, new financial owner or
per-need override is selected. Ratification establishes intended behavior, not
permission to implement, a deployed actor grant or release qualification.

**Capture in the eventual spec/design:** first define the precise purpose and
source/actor adapter contracts (C01–C05/C21); then the policy and effective-time
contract (C06–C10); then stable admission/coverage and current disclosure
(C11–C15). This order prevents a pleasant settings UI from promising a qualifier
that lacks trustworthy money, purpose or permission. Reuse D22's temporal
semantics and D20's grouping where sound; do not duplicate their engines.

**Implementation safeguards required before activation:** qualify exact P12
capabilities and source adapters; add constrained policy/assertion storage and
atomic admission/intent/recovery; prove real RLS and races; integrate the existing
task journey; finish accessible configuration/confirmation/correction; exercise
mixed-version rollout and source-owned retention. Pass P01–P32 and publish the
operating envelope/runbook. Additive deployment remains Off until those gates
pass. No financial write or donor-facing message is needed for this review.

**Residual monitoring only after those gates pass:** the following operational
thresholds are ratified response rules, not measured current performance or
privacy tolerances. Zero-tolerance invariant failures are release blockers as
well as production incident signals. Named owners are repository domain roles;
a responsible person/on-call mapping must exist before activation.

| Signal                                                                            | Threshold                                                                                       | Owner                                                   | Required response                                                                                                                                     |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-tenant/forbidden purpose disclosure or successful unauthorized mutation     | Any confirmed occurrence                                                                        | P12 security owner with P28 on-call                     | Stop the affected path, preserve minimal evidence, investigate scope and remediate before re-enable.                                                  |
| Duplicate member/coverage or new admission after Off wins                         | Any confirmed invariant violation                                                               | P28 admission owner with P9 task owner                  | Stop new D30 admission, reconcile by stable identity without deleting handled history, fix and requalify race/replay tests.                           |
| Accepted projection intent aging or correction backlog                            | Oldest item exceeds the documented P31 processing budget, or dead-letter count exceeds zero     | P28 operations owner                                    | Alert, inspect source/policy/result metadata, recover same intent; isolate failing adapter/tenant workload rather than replay history.                |
| Source contract/version drift                                                     | Any unqualified version or required field/lineage mismatch                                      | P13/P14 source integration owner with P28 adapter owner | Hold only dependent qualification, repair mapping/evidence, rerun adapter tests; no guessed fallback.                                                 |
| Users misunderstand Off or think one-time purpose proves additional money/sending | Any verified misleading-copy case in pre-release tests or support                               | P28 product/UX owner                                    | Correct copy/interaction, add regression scenario; pause expansion if affected users cannot act accurately.                                           |
| Avoidable task noise from this reason                                             | Three independently verified false-positive/duplicate reports for the same cause within 30 days | P28 product owner with source owner                     | Diagnose source/identity defect; disable affected admission if correctness is at risk. Do not weaken evidence or add arbitrary thresholds to mask it. |

The last threshold is a ratified triage trigger, not a defect allowance: any
confirmed privacy, identity or authorization failure uses the immediate rows.
Low adoption alone does not prove the decision is wrong; examine evidence of
usefulness and friction with willing users before adding controls.

## Final pressure test

**What could still be wrong?** The term “documented need” may hide weak acceptance
or source provenance; Off may be misunderstood; hidden labels may still reveal
the category. The exact contracts and negative proofs address these. They cannot
be replaced by a generic checkbox, UI-only validation or existing code trust.

**Hidden assumptions:** suitable source evidence and exact permission can be
qualified; missionaries value this follow-up; one organization policy is enough.
The first two require owner integration and representative feedback respectively;
the last is now a ratified product scope, whose usability still needs validation. No
ministry workflow, interview or adoption rate has been invented.

**Whole-product consequences:** the change adds one sufficient source reason and
one bounded tenant control. It preserves financial ownership, task coverage,
communication deliberateness, source privacy and the donor's current journey.
It does not settle remaining D21 special/above-commitment criteria or unrelated
retention choices.

**End-user test:** staff should be able to say what On/Off affects; Maya should
be able to say which gift needs follow-up and why, then handle it once. If either
requires understanding event versions or database state, the UI has failed.

**Modern practice versus repository authority:** exact attribution, progressive
disclosure, safe saves and accessibility are useful external lessons. Competitor
appeal semantics, broad task audiences and workflow Off behavior are not imported
over Core ownership. The D30 native optionality exception is identified openly.

**Adjustment required:** accept the selected purpose with C01–C24 and P01–P32,
not the unqualified original sentence. Keep the solution small while making its
meaning, ordering and permissions precise.

## Verification and completion boundary

Independent governance, finance, authorization and UX findings are reconciled in
[cross-review resolution](d30-evidence/cross-review-resolution.md). The bounded
[counterexample model](d30-evidence/model-readme.md), separate root reproduction
and [document verification](d30-evidence/review-verification.json) provide limited
semantic/provenance evidence. They do not prove real SQL/RLS, production races,
financial adapters, accessibility, capacity or user satisfaction.

Twenty D29 evidence artifacts are pinned and unchanged. Earlier models and
probes were not rerun. This review changes only research/session/glossary records.
No application, schema, dependency, live data, external communication, formal
PRD/ADR/OpenSpec/ticket or GitHub state changed. **No Q31 was posed during the
initial answer review.** Subsequent ratification and continuation are recorded
below.

## Subsequent explicit ratification and continuation

On October 18, 2026 UTC, the founder instructed: **“Ratify this decision and
amendment. Then continue with this phase 28 grill-with-docs session.”** This
accepts the corrected decision, organization-wide On/Off scope and initial Off
state, narrow D30 native-work exception, exact confirmation actor class,
C01–C24, P01–P32 and monitoring responsibilities as future requirements. It closes
the earlier customization clarification without inventing a separate reply.
No per-need override, blanket permission, implementation or activation follows.

The [original review](d30-evidence/d30-before-ratification.txt) and fifteen initial
evidence artifacts are preserved in the
[ratification manifest](d30-evidence/ratification-evidence-sha256.json).
The [ratification verification](d30-evidence/ratification-verification.json) is
separate from the initial verification result, which retains its original
unratified/no-Q31 state. No prior model or database probe was rerun.

Continuation remains within the one-question-at-a-time research boundary in the
[session](phase28-session.md). No formal PRD/ADR/OpenSpec, ticket, GitHub change,
live-data operation or supporter communication is authorized by this ratification.
