# Phase 27 D18 — deliberate changes to a saved partnership's stage list

2026-10-10 UTC. **Reviewed D18 explicitly ratified; review disposition: Accept.** Review against
Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`, current source and the
accepted/ratified D1–D17 decisions. This is a completed review of the selected
capability, not an implemented feature, formal specification or release claim.

The founder subsequently instructed, “Yes, ratify this amended D18.” The exact
decision and reviewed safeguards below are explicitly ratified on 2026-10-10,
without substantive change. [Q19](phase27-q19-stage-on-list-change.md) subsequently
selected A; [D19](phase27-d19-adversarial-review.md) settles optional destination assessment.

## Exact decision recorded

> **D18 — Allow deliberate changes.** An authorized person may deliberately change
> the approved stage list used by the same continuing partnership work, either to
> correct a mistaken choice or to adopt a better-fitting process going forward.
> Keep the same journey, supporter, identified ministry, continuing purpose and
> source scope. Another stage list is not another partnership.
>
> The destination must be eligible for a new attachment in the current context.
> Past use of that list, possession of its ID or a later organization-default change
> grants no exception. Existing work may keep its withdrawn list under D15; no
> migration is forced. A deliberate return to an earlier list is another authorized
> change, not restoration of an old state or deletion of intervening history.
>
> Show the permitted current context and proposed destination clearly, with the actual
> stage consequence resolved visibly under its separately agreed policy before
> saving. Accept a coherent list/stage result and its required history/result
> together. Never silently carry an old-list stage into the new list, map by name
> or position, clear an assessment, or infer a fresh assessment from this answer.
>
> Preserve the actual previous and accepted meanings in lawful, authorized history.
> A correction made now does not pretend that a different choice was recorded in
> the past. Keep unrelated facts and obligations intact. A list change does not
> create an enrollment, reopen work, prove a supporter action, grant access or
> independently send a message or move money.
>
> Use one clear deliberate save with truthful success, conflict and uncertain-result
> handling. Preserve exact submitted intent through retries; an old successful
> receipt is not permission to reapply the change over newer work. No mandatory
> explanatory narrative, extra approval role or generic migration wizard follows.

**Accept, without a material new product amendment.** This makes the selected A
precise within existing source, history and permission rules. The founder's
[Q18](phase27-q18-changing-saved-list.md) expressly reserved current-stage treatment;
D18 does not silently answer it. A valid resulting stage or explicitly authorized
absence is a **blocking product/implementation dependency before this operation
is exposed**. Initial-stage absence under D13 does not settle clearing an existing
assessment. Behavior while paused/closed, historical correction, bulk migration
and cross-scope moves are also not selected here. The founder has now explicitly
ratified the reviewed D18 capability and safeguards without selecting those policies.
This paragraph records the D18 review boundary: D19 now supplies intentional absence
for an actual different-list change. Other reserved branches and implementation
qualification remain open; the ratified D18 decision above is unchanged.

## Evidence and current reality

| Evidence                                         | What it establishes; limit                                                                                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Ownership](d18-evidence/ownership.md)           | Governing ADR/OpenSpec/phase owners, identity/history/work/reporting boundaries and the expressly reserved stage policy. Intended contracts, not implementation.                      |
| [Authorization](d18-evidence/authorization.md)   | Current P12 context, distinct revealing operations, old/new-state authorization, effective database and service-path requirements. No live-policy proof.                              |
| [Implementation](d18-evidence/implementation.md) | Fresh bounded source inspection, relational/concurrency risks and new isolated mechanics evidence. No production schema or command qualification.                                     |
| [UX](d18-evidence/ux.md)                         | Shared controls, form and asynchronous-result limitations; primary accessibility/product guidance; concrete interaction and recovery. No completed browser or agency usability study. |
| [Comparable practice](d18-evidence/practice.md)  | Official CRM/CMS comparisons, freshness limitations and ministry-specific product judgment. No invented ministry workflow or measured demand.                                         |

**Repository intent.** ADR-0001 makes Asym Postgres authoritative. P27 owns
cultivation and P28 consumes its shared source model. P9 owns Party identity,
assignments, the record shell and shared work; P12 owns authorization. P13/P14/P16
own contributions, recognition and commitments; P6/P17 own communication eligibility
and delivery. D3 makes continuing purpose central to journey identity, D10 retains
stage meaning, D12 records actual stage changes, and D15 distinguishes retained
use from fresh attachment. These are governing boundaries, not vendor preferences.

D14 R07's prohibition on ordinary create/update remapping is still a protection
against generic field edits. D18 supplies a specifically qualified deliberate
operation; it does not make the list an unrestricted patch field. D16/D17's refusal
to infer switching from initial choice also remains intact. Any later formal prose
that treats the binding as absolutely immutable must be reconciled to this precise
owner decision during `/to-prd`, not left alongside a contradictory switch rule.

**Current implementation.** Fresh bounded searches did not identify a P27 saved
stage-list mutation in API/database/migration/admin/missionary paths. Existing donor
lifecycle/status editors, generic grid mutation and personal CRM views describe
other facts. An editor that closes before asynchronous acceptance, a placeholder
for an unavailable option, or two individually valid FK references cannot establish
a safe saved-list switch. Existing code remains evidence to inspect, not a model
to copy uncritically. No claim about a deployed system's absence is made.

**Primary evidence and conflict resolution.** Current HubSpot board documentation
supports editing existing records' pipeline; older indexed instructions describe
choosing pipeline and stage together, but the old URL now redirects. The older
dialog is not claimed as verified current runtime. HubSpot's automation documentation
also demonstrates why stage-entry effects must be considered. Salesforce record-type
and picklist constraints are comparative evidence of incompatible choices, not a
reason to impose sales opportunity rules on ministry partnerships. The practice
appendix records the exact sources, dates and limits; it provides no missions-tool
source establishing general switching between organization-approved lists.

PostgreSQL's [locking documentation](https://www.postgresql.org/docs/17/explicit-locking.html)
requires attention to conflicting row operations and consistent acquisition order;
no transaction should stay open while staff consider a form. Its
[constraints documentation](https://www.postgresql.org/docs/17/ddl-constraints.html)
distinguishes structural references from mutable eligibility and cross-row rules.
[WCAG 3.3.4](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)
permits checking/correction or review before finalizing; it does not require a
second confirmation dialog on every database edit. These practices fit Core's
source-owned command and exact shared UI system. They do not create new owners.

**Inference and unknowns.** The founder has selected flexibility. It is reasonable
to support evolving processes on a continuing record, but no frequency of switching,
agency error rate or universally correct stage treatment has been measured. No
practitioner interviews, live Supabase inspection, real application accessibility
exercise or production benchmark was performed. Required release evidence below
makes those limits explicit rather than presenting a polished document as a tested
product.

## Problem validity, strongest alternative and minimum sufficient solution

The real product problem is a saved partnership becoming tied to an unsuitable
process despite still representing the same relationship and purpose. Correction
of a mistaken choice is already required; A also supports a valid later change of
working process. It avoids duplicate ordinary journeys and dishonest “mistake”
labels used just to bypass a correction-only rule.

**Strongest alternative B:** correct mistakes but preserve an originally correct
list for that journey. It gives simpler continuity and fewer transitions to explain
or report. It may be appropriate for a truly immutable program enrollment, but no
inspected owner requirement makes this continuing cultivation record that kind of
enrollment. It also requires distinguishing a real error from a changed preference.
A accepts that reporting and history need precision without imposing that gate.

**Simpler/no-build alternatives:** keep the current list when it still fits; rename
or clarify same-meaning stages under D10; use existing tasks/asks for an isolated
activity; customize the appropriate list where that should apply to all its users.
Those are useful choices, but a global list edit is not a substitute for changing
one partnership's process, and a note cannot reliably update its governed list.
Do not build another journey, a clone-and-close workflow or an external CRM sync.

The minimum permanent implementation is one narrow, shared, source-owned operation
on the existing journey, with a coherent resulting list/stage binding, protected
change history and durable result. Reuse qualified source/API/UI mechanisms. No
per-tenant schema, stage-mapping engine, parallel active binding, generic workflow
builder, migration approval queue or full-CRM event-sourcing conversion is justified.
The schema is not being fixed by this review; its invariants are.

## Source of truth and invariants

| Fact                                         | Authority and invariant                                                                                                                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Journey identity and continuing purpose      | P27 using P9/identified-ministry source facts. A list change preserves the same identity, parties, ministry, purpose and source scope. It creates no second ordinary journey.                                                              |
| Approved list/stage meaning and availability | P27 governed catalog with stable scoped identities and retained meaning. Availability, current use and permission are distinct facts.                                                                                                      |
| Current list and recorded stage              | One coherent authoritative journey binding. Current stage must belong to that current list, or absence must be expressly allowed by the applicable policy. Required tenant/source/list scope never becomes null because stage is optional. |
| Proposal and pending command                 | Unaccepted draft or exact submitted intent. Neither UI state, default, report, cache nor job becomes authority over the saved binding.                                                                                                     |
| Accepted change history/result               | Source-owned durable evidence of the actual before/after, sequence, trusted actor and recorded time. A receipt proves that effect, not that it is still the current state.                                                                 |
| Tasks, asks, assignment, consent and money   | Existing domain owners retain their facts and durable purpose identities. Choosing a list is not task completion, reassignment, new enrollment, permission or financial fulfillment.                                                       |
| Reports and projections                      | Derived from authorized source facts, explicit historical/current interpretation and coverage. Same labels/order in different lists are not comparable progress or financial probability.                                                  |

Further invariants: no invalid intermediate pair is externally authoritative;
ordinary mutations cannot rewrite prior accepted history; no accepted new attachment
to a withdrawn target; no duplicate effect from transport retry; a newer source
change cannot be overwritten merely because the current value again matches an
old screen. Historical retention remains subject to lawful redaction and privacy
policy, not unrestricted permanent storage of missionary context.

## State, time and edge-case contract

| Situation                                       | Required meaning and handling                                                                                                                                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Existing list still fits                        | Leave it alone. Changes to catalog order, label, usual default or availability do not force a switch.                                                                                                                        |
| Current list withdrawn                          | Existing attached work retains D15 use. A permitted deliberate move may target another currently eligible approved list; merely having a withdrawn current list is not an error.                                             |
| Target withdrawn before acceptance              | Reject the fresh attachment with a permitted actionable explanation; preserve safe draft input. Prior use of the target is not an exception.                                                                                 |
| Change accepted before target withdrawal        | It is attached existing work at the ordered withdrawal boundary. D15 retained-use rules then apply; this is not a request-time grandfathering shortcut.                                                                      |
| Current stage belongs to old list               | Preserve its lawful past meaning. Do not carry it into the new list, silently clear it or choose a same-name/first stage. The next stage-policy decision must determine the valid visible prospective result before release. |
| No current stage                                | Show genuine absence distinctly from loading, denial or an unmatched ID. D18 does not choose the target-stage policy for this case either.                                                                                   |
| Same list selected                              | No list change or invented new list history. A different stage proposal cannot use this path to evade stage/correction rules.                                                                                                |
| A → B → A over time                             | Two real accepted changes with current eligibility each time; not undo, lost history or continuous residence in A. The same label/ID does not make an old revision current.                                                  |
| Concurrent stage or list edit                   | Revalidate the relevant source revision/state; reject stale intent safely and show permitted current facts. Do not overwrite the intervening assessment or perform a list-only partial save.                                 |
| Target rename/reorder or unrelated catalog edit | Stable identity/meaning governs. Do not infer invalidity from cosmetic order or an unrelated global revision; revalidate changes material to the proposed result.                                                            |
| Target stage retired while editing              | Validate actual selected stage eligibility at acceptance under the eventual stage policy. No automatic replacement or false success. Post-acceptance retirement follows D10 retained meaning.                                |
| Lost response after acceptance                  | Reconcile the existing durable command/result; do not create another switch. If subsequent work changed again, distinguish the historical accepted receipt from the current source.                                          |
| Permission/context changes                      | Current authority governs save and result disclosure. Expired permission never becomes valid through an old preview or receipt; no protected details in errors.                                                              |
| Mistake discovered after a later change         | A new authorized correction cannot blindly restore a stale before-image. Preserve intervening work and source history; retrospective history editing is not authorized.                                                      |
| Unrelated open tasks, ask or commitment         | Retain their owner facts. No blanket blocker for unrelated obligations, no automatic cancellation/recreation. Only actual qualified source dependencies may require a visible permitted disposition.                         |
| Paused/closed work or bulk/cross-scope request  | D18 alone does not define that operation. Do not silently reopen, broaden scope or expose an unqualified command. These remain explicit follow-on boundaries.                                                                |

Use source sequence and authoritative recorded time for acceptance and historical
ordering. Travel, locale, local midnight and a caller-supplied date cannot grant
eligibility or alter the actual order. Do not introduce backdating, default-change
schedules or a timezone-dependent switch rule. Display recorded times in the
qualified viewer context while preserving the source instant.

## Concrete UX/UI contract

Use Core's `@asym/ui`, Base UI primitives and exact base-maia semantic tokens.
Place the action in the existing partnership context so staff can recognize the
supporter, identified ministry and current process through permitted information.
Protected current metadata remains distinct from absent source data; R07 requires
an independently permitted minimum meaningful effect projection, not unrestricted
old-list labels or history. Use **Change stage list**;
avoid “migrate pipeline,” “reenroll,” “start over” or a generic unlabeled Edit.

An illustrative layout, not final stage-policy selection:

```text
Change stage list
[Recognizable supporter and identified ministry]

Current list: [Permitted current list/effect context]
Current stage: [Recorded stage and meaning, when permitted]

New stage list
[Choose an approved list                                  ▾]
[Short permitted purpose guidance]             View stages

[Prospective stage result — governed by the next decision]

This keeps the same partnership and its history.

Change stage list                                      Cancel
```

The prospective stage area is a design dependency, not a literal placeholder to
ship. The finished form must plainly show the actual accepted result before save.
A staff member may inspect alternative list meanings/stages without committing a
change. The organization's usual list does not preselect a destination for this
saved-work command. D17 is an initializer for new work, not a switch recommendation.

Keep this a short focused edit with one deliberate save. No mandatory reason essay,
duplicate “I confirm” checkbox or manager approval follows from choosing A.
Optional existing note capabilities may remain optional. A source-required warning
should explain the particular material consequence rather than recite database
rules. Do not use click-to-select as immediate persistent mutation.

| User state                                    | Required feedback and next step                                                                                                                                                                                                    |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No change proposed                            | Show current facts; avoid pretending that reopening the editor creates a new assessment.                                                                                                                                           |
| Looking at alternatives                       | Keep current and proposed identities distinct; expose purpose guidance and target stages without committing. Cancel leaves the saved record unchanged.                                                                             |
| Target-stage consequence unresolved           | Do not submit an invalid/guessed pair. The agreed stage UX must explain the needed choice or allowed absence without silently resetting recorded understanding.                                                                    |
| Saving                                        | Show a truthful pending state and prevent accidental duplicate intent. Closing the view does not cancel a commit already accepted.                                                                                                 |
| Accepted                                      | Show the actual source result and a discoverable history entry. If the changed row leaves the current filtered view, explain that and offer a permitted route to the work. Do not report success merely because a dropdown closed. |
| Stale input                                   | Explain that the work changed, show permitted current facts and let staff revise their proposal. Preserve safe unrelated input; no silent resubmit.                                                                                |
| Target no longer usable                       | Explain the permitted issue, leave this attempt unapplied and show current authorized state plus actual alternatives. Another actor may already have changed the saved binding. No fallback destination.                           |
| Unconfirmed outcome                           | Explain that the save could not yet be confirmed and reconcile/retry the same intent. Do not offer another switch as “retry.”                                                                                                      |
| No permitted target/current effect projection | Show a truthful, safe unavailable state with an existing permitted recovery route. No invented access-request workflow or hidden list inventory.                                                                                   |
| Later correction/return                       | Offer only the qualified current operation. Do not promise unconditional Undo or restore an old stage/list irrespective of current eligibility.                                                                                    |

Visible labels, associated help/errors, readable full names, text beyond color,
keyboard/focus behavior, touch targets and screen-reader status announcements are
required. Test 320 CSS-pixel reflow, 200% text resize, RTL/translation, long names,
mobile keyboard, reduced motion and slow/out-of-order connections independently.
Avoid hover-only explanations, color-only change cues, clipped essential names and
transient-toast-only failure. No new address, donor checkout, public screen or
persistent offline queue is introduced. Use the existing shared record-shell and
history patterns rather than adding a second staff inbox.

## Exact requirements to carry into formal specification

**R01 — Bounded same-work change.** P27 SHALL own deliberate changes of a saved
journey's list within the same supporter, identified ministry, continuing purpose
and qualified source scope. Preserve identity and no-duplicate ordinary-work rules.
The operation SHALL NOT create/clone/re-enroll/close/reopen a journey or move it
across scopes. Catalog customization and new independent purposes remain distinct.

**R02 — Eligible destination and retained source.** A different destination SHALL
satisfy current approved new-attachment eligibility and permitted use at source
acceptance. Current source-list withdrawal does not force migration. Historical
target use, an old preview, imported ID or restored availability cannot bypass D15.
Order acceptance against withdrawal/retirement; validate actual material predicates,
not superficial label/order equality or unrelated configuration edits.

**R03 — Coherent stage policy is required before exposure.** The same source
operation SHALL accept a valid target-list/current-stage result or explicitly
qualified absence. D18 SHALL NOT supply an implicit clear, label/order mapping,
first-stage default or required fresh assessment. Resolve the expressly reserved
stage-treatment product decision and its proof before implementing/exposing this
operation. No generic list-ID patch may leave an invalid pair, even temporarily.

**R04 — Atomic current state, history and result.** Accept the exact normalized
intent against the relevant source revision/state. Commit the coherent new binding,
actual change history and durable result together, or none. Required secondary
intent, if a qualified owner requires it, must be durable at the same acceptance
boundary; external delivery is not part of the database transaction. A same-list
selection creates no list-change history or reset. Do not turn it into a hidden
stage-change/correction escape.

**R05 — Concurrency and durable retry.** Competing list/stage edits, target withdrawal
and relevant identity/lifecycle changes SHALL have a qualified acceptance order.
Detect stale A→B→A intent by revision/occurrence, not old/new value equality alone.
Exact retry returns/reconciles the accepted outcome without reapplying it; same-key
changed intent conflicts. A later return is a new deliberate change. Use consistent
lock/protocol ordering and bounded transactions; never hold a lock across user input.
Retry aborted transactions safely without repeating an accepted business effect.

**R06 — Historical truth and correction.** Record actual old/new scoped identities,
meaning/provenance, trusted actor, recorded time and source ordering sufficient to
understand the accepted change. Do not relabel all previous stages using the current
list, erase an intervening period, fabricate contact/progress or rewrite old accepted
records when fixing today's binding. Retained references and governed definition
history must preserve meaning without unrestricted copies of sensitive text. Any
retrospective correction/backdating requires its own owner-qualified policy.

**R07 — Minimum current authority and disclosure.** Qualify mutation of the existing
journey, permitted current-effect projection, target discovery/use, any actual
required dependent disposition, and result/history disclosure separately under
P12. Do not infer powers from list configuration, default management, assignment,
record visibility or historical access. Do not require unrelated private history
or full catalog settings just to change an otherwise permitted binding. When the
minimum before/after effect cannot safely be disclosed, use a uniform safe outcome;
raw FK/constraint names, counts, lookup timing or result variants must not reveal
protected old/target relationships.

**R08 — Relational and all-door enforcement.** Use required tenant/source/list keys,
complete same-scope and stage-membership references, appropriate unique/check
constraints and delete restrictions. Optional stage must not null out required
scope or bypass parent/list integrity. Mutable target eligibility needs the qualified
concurrency boundary, not a cross-row CHECK or FK alone. Prevent ordinary retargeting
of tenant/subject/purpose/actor/owner and mutation/deletion of accepted history.
Qualify grants, exposed schemas, real nonowner RLS USING/WITH CHECK, views, RPC
owners/search paths, SELECT/RETURNING, imports, jobs and service/repair paths through
the shared API. Derive trusted tenant/context/actor/audit attribution server-side;
IDs/revisions are validated proposals. Omitted WITH CHECK may inherit USING; actual
roles and policies, not syntax inspection alone, establish effective protection.

**R09 — Truthful draft, failure and context handling.** Distinguish current binding,
proposal, pending intent, accepted receipt and current source after later work.
Scope queries/caches/drafts/callbacks to relevant tenant/assignment/source/policy
context; same user ID is insufficient. Late replies or optimistic rollback cannot
restore an obsolete context or overwrite newer source state. Preserve safe draft
input after rejection; resolve uncertain acceptance through the original intent.
No read model, cache or browser form becomes a write authority.

**R10 — Preserve other owners and qualify actual effects.** List change alone SHALL
NOT alter consent, finance, designation, recognition, commitments, ask response,
assignment, completed/open work or contact history. It is not enrollment or proof of
a supporter action. Preserve native next-work accountability. Actual source-defined
blocking obligations require only their authorized disposition; unrelated work is
not a blanket blocker. Expose only accurately qualified development events; do not
simulate exit/re-entry to reuse enrollment automation. Stage reassessment and any
source-purpose follow-up depend on their accepted policies. Consumers/retries share
the authoritative effect identity; optional Workflow Studio is not required for
native correction, and switching does not activate disabled DON recipes.

**R11 — Clear shared user experience.** Provide contextual Change stage list with
readable current/proposed facts, permitted purpose guidance/alternatives and the
resolved prospective stage result. One normal explicit save is sufficient when its
meaning is clear and validation is effective. No forced narrative, additional
approval role, second confirmation or wizard without a separate governing need.
Support the state/recovery/accessibility table above in shared Core UI. Ordinary
selection is not a save; history and current qualified correction are discoverable.

**R12 — Reporting, privacy and evidence.** Preserve list-specific historical meaning
and distinguish current grouping, recorded transitions and any governed correction.
A list change is not new supporter acquisition, financial conversion, meaningful
contact or proof of stage progress. Do not compare list ranks as universal progress
or let current definitions rewrite old measures. Qualify stage-age/assessment-time
semantics with the stage policy. Minimize exports, caches, logs and documents;
retention/redaction and backup/restore controls still apply to sensitive ministry
context. Technical diagnostics, durable business history and security audit are
separate, correctly attributed evidence.

**R13 — Bounded implementation and rollout.** Reuse one shared command and narrow
indexed reads/writes; no per-option journey/history scan, table-wide migration or
per-tenant schema is needed. Measure plans, rows examined, payload bytes, latency
in milliseconds, contention and tenant/history skew before declaring capacity.
Inventory and fence old writers, generic patches, imports and readers that cannot
represent switched history. Expand compatibly, validate actual data before backfill,
then activate qualified paths. No invented old list/stage history or guessed mapping.
Contain faulty switching without hiding existing work or rolling accepted facts
back to old code's assumptions. Rehearse forward repair, mixed versions and restore.

**R14 — Explicit scope and release dependencies.** Complete the current-stage
handling decision before this command is exposed. Qualify correction mechanics,
capabilities/source scope and the actual supported lifecycle states; paused/closed,
bulk, cross-scope and historical-rewrite operations are not inferred from A. Do not
ship a broken generic editor while calling the missing policy future refinement.
Keep the reviewed capability and the still-unanswered product choices distinct in
Q18/log/glossary and later authorized formal artifacts.

**R15 — Traceable proof and monitoring.** Carry D18/R01–R15/AC01–AC24 through the
question/log/glossary and, only when authorized, `/to-prd` canonical owner/spec/design/
tasks and `/to-issues`, implementation tests and release evidence. Reconcile actual
conflicts at their owner; no new ADR merely restates CRM ownership. Prove user/domain
outcomes with real roles, source paths and browser use. The monitor table below has
explicit signals/thresholds/owners/responses; monitoring cannot substitute for an
unresolved product policy, authorization, integrity or accessibility gate.

## Full category review

Severity and likelihood are prospective judgments, not measured production
incidents. Each row independently states the concern, consequence, evidence,
impact on A and exact permanent fix/proof. “Accept” accepts this capability under
its inherited boundaries; it does not assert that unimplemented paths are safe.

| Category                                                         | Material concern and consequence                                                                                                                                                                                                                | Evidence; severity / likelihood; effect and exact fix                                                                                                                                                                                                                                                           |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Problem validity, necessity and alternatives                  | **Yes.** An extra switching feature can duplicate global list customization or isolated task work; correction-only could be sufficient for some organizations. Conversely immutable binding can force duplicate journeys or false error claims. | Q18, D3/D10 and comparative CRM evidence. **Medium / plausible. Narrows A:** same-purpose prospective change with keep/customize/task alternatives, no clone. R01/R14; AC01/02/23. B is simpler but does not meet the selected flexibility.                                                                     |
| 2. Brittleness                                                   | **Yes.** Same-name stages, list position, default changes and a presumed valid cached pair break when definitions, availability or staff context change.                                                                                        | D10/D15/D17 and inspected selector behavior. **High / likely if generic edits are reused. Narrows:** stable identity, coherent result, current validation, preserved exact intent. R02–R05/R09; AC03–08/13/15.                                                                                                  |
| 3. Technical debt                                                | **Yes.** Separate staff/missionary switch logic, writable stage snapshots or parallel bindings create competing truths and permanent repair logic.                                                                                              | ADR-0001/shared boundaries and absent P27 source path. **High / plausible. Preserves:** one shared command/current binding with protected history, no event-sourcing or mapping-engine expansion. R01/R04/R08/R13; AC01/09/17/24.                                                                               |
| 4. Edge cases                                                    | **Yes.** Withdrawn current list, retired target stage, missing assessment, A→B→A, hidden metadata, closed work and uncertain results can lose understanding or mislead staff.                                                                   | State table, D13/D15 and source review. **High / plausible. Narrows:** explicit eligibility/result states and stage/lifecycle gates. R02/R03/R05/R07/R09/R14; AC03–08/12–16/20.                                                                                                                                 |
| 5. Footguns                                                      | **Yes.** Immediate dropdown persistence, an implicit clear or optimistic Undo can overwrite assessments, mutate the wrong work or conceal a saved mistake.                                                                                      | Actual generic editor behavior and D12/D16. **High / plausible. Narrows:** visible current/proposed result, deliberate atomic save and qualified new correction. R03–R06/R11; AC04/08/10/13/21.                                                                                                                 |
| 6. Tenant safety                                                 | **Yes.** Cross-tenant/source IDs, stale assignments, same-user cache reuse and late results can disclose or alter another context's partnership.                                                                                                | P12 and API/cache boundaries. **Critical / plausible. Preserves:** complete scoped references plus trusted contextual reads/writes/results and cache isolation. R07–R09; AC15–17.                                                                                                                               |
| 7. Database, RLS and authorization safety                        | **Yes.** Independent valid IDs can form a wrong-list pair; null can bypass composite validation; an allowed old row can be changed into forbidden state or history written separately.                                                          | PostgreSQL constraints/policies, current privilege patterns and new mechanics. **Critical / plausible. Preserves:** required scope, membership references, effective old/new authority and one acceptance transaction. R03–R08; AC04–12/16/17. No new money type is needed; money remains outside this command. |
| 8. Overengineering                                               | **Yes.** Flexibility can expand into a migration wizard, mapping DSL, supervisor approval, reason taxonomy or per-list access scheme without evidence.                                                                                          | The bounded Q18 fork and D11/D16. **Medium / plausible. Narrows:** one focused operation with existing qualified capabilities and history. R01/R07/R11/R13/R14; AC21/23/24.                                                                                                                                     |
| 9. UX/UI and user friction                                       | **Yes.** Staff may confuse changing the process with starting over, miss the stage consequence, believe a closed picker means success or be unable to recover on mobile.                                                                        | Shared source limitations, primary accessibility guidance and UX analysis. **High / plausible. Narrows:** concrete before/after, one save, truthful state recovery and actual accessible/user proof. R03/R09/R11; AC13/14/20/21/23.                                                                             |
| 10. Source of truth, ownership and invariants                    | **Yes.** A new list can become a new journey, reports can rewrite the past, or stage/default/workflow projection can acquire mutation authority.                                                                                                | Owner table, D3/D12/D17 and P27/P28. **High / plausible. Preserves:** same identity, coherent single binding, distinct history/projection/independent owner facts. R01/R04/R06/R10/R12; AC01/02/09/18/19.                                                                                                       |
| 11. Hidden coupling                                              | **Yes.** Switching may trigger enrollment/stage automations, cancel tasks, move ownership or alter financial forecasts through reused vendor/status code.                                                                                       | DON-14 source binding remains unresolved; comparative automation facts. **High / plausible. Narrows:** truthful qualified events and unchanged independent obligations, no exit/re-entry. R10/R12; AC18/19/24.                                                                                                  |
| 12. Failure modes                                                | **Yes.** List update may commit before history, receipt or required effect intent; a lost response or failed refresh may cause another switch.                                                                                                  | Transaction/result contracts and new mechanics. **High / plausible. Preserves:** atomic required facts, durable intent/result, explicit uncertain UI and safe retries. R04/R05/R09/R10; AC09–14/18.                                                                                                             |
| 13. Lifecycle, temporal correctness, concurrency and idempotency | **Yes.** Concurrent stage edits/withdrawal, ABA and old accepted retries can overwrite newer work; backdating can fabricate eligibility or time in stage.                                                                                       | D12/D15 and new controlled schedules. **High / plausible. Preserves:** current ordered acceptance, revision/occurrence, no replay writes or retrospective inference. R02/R04–R06/R14; AC05–12/20.                                                                                                               |
| 14. Data integrity                                               | **Yes.** Two-step edits, name-based mapping, guessed imports or unconditional history rollback can leave broken pairs and false reporting.                                                                                                      | PostgreSQL relationship semantics and D10/D13/D16. **High / plausible. Narrows:** exact pair in one boundary, validated imports, preserved old meaning and no invented backfill. R03/R04/R06/R08/R13; AC04/09/17/19/22.                                                                                         |
| 15. Security and privacy                                         | **Yes.** A before/after panel, availability error, raw FK message, receipt or export may reveal protected missionary/partner/list information; unrestricted history retention compounds exposure.                                               | Current P12 minimum disclosure and source-history obligations. **Critical / plausible. Preserves:** independently permitted effect/result/history projection, minimized evidence and governed retention. R06–R09/R12; AC15–17/22.                                                                               |
| 16. Scalability and performance                                  | **Yes.** Full history/catalog scans, broad locks or per-option effects can make a small edit costly and contend with ordinary stage updates.                                                                                                    | Query/locking reasoning; no production benchmark. **Medium / plausible with scale. Narrows:** bounded indexed operations, consistent ordering, real workload budgets and no lock during user input. R05/R13; AC07/08/24. No fabricated list-size/latency promise.                                               |
| 17. Operational burden                                           | **Yes.** An uncorrectable selection, hidden failed effects, unsupported Undo or old writer can require SQL repair or repeated staff cleanup.                                                                                                    | D16/D17 recovery gates and source failure analysis. **High / plausible. Narrows:** qualified correction/result recovery, source-owned repair and compatible writer fencing. R05/R09/R13/R14; AC10–14/22.                                                                                                        |
| 18. Observability and auditability                               | **Yes.** A generic “updated” event cannot explain changed process; retry may duplicate history or historical receipt be mistaken for current state; technical logs may leak detail.                                                             | D12/source receipt rules and new replay checks. **High / plausible. Preserves:** durable actual before/after/actor/sequence, explicit receipt/current distinction and minimized diagnostics. R04–R06/R09/R12/R15; AC09–14/19/22.                                                                                |
| 19. Dependency and integration risks                             | **Yes.** Vendor-required stages/automations or UI defaults may be copied as policy; integrations may write fields separately or treat a list change as enrollment.                                                                              | Current/dated comparator distinctions, actual shared control behavior and API ownership. **High / plausible. Narrows:** one exact source command, version qualification and owner-defined events; no vendor sync authority. R03/R08/R10/R13; AC04/17/18/24.                                                     |
| 20. Migration, rollout and upgrade risks                         | **Yes.** Old code may assume a lifetime list, flatten history or replay a restored command; rollback may erase accepted switches.                                                                                                               | Current source gap and source ownership. **High / plausible. Preserves:** compatible readers/writers, no guessed history, activation sequencing and forward repair/restore proof. R06/R13/R14; AC11/19/22/24.                                                                                                   |
| 21. Testability, traceability and proof                          | **Yes.** “Preserve history” and “eligible list” are too vague without source/result/stage semantics; a passing toy fixture can be mistaken for actual authorization or usable delivery.                                                         | Q18 reservations, owner evidence and bounded probes. **High / certain qualification gap before release. Narrows:** exact requirements/AC, explicit stage dependency, real-path proof and canonical trace. R03/R14/R15; AC01–24.                                                                                 |
| 22. Other development hazards                                    | **No additional distinct material concern found.** Provider billing, currency conversion, public checkout, new infrastructure and persistent offline behavior were checked for accidental scope growth and are not introduced.                  | Existing hazards—unsafe rollback, unsupported lifecycle states, sensitive history and repair—are addressed individually above. R10/R13/R14 bound the operation; no new hazard justifies another subsystem.                                                                                                      |

## Acceptance criteria and proof

These are required future outcome checks, not claims that the product has passed.
New research mechanics cover only the specific cases described in their evidence.

| ID   | Falsifiable acceptance criterion                                                                                                                                                                                                                                                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC01 | Change A to eligible B for the same authorized continuing partnership: journey ID, supporter, ministry, purpose, source scope and independent facts remain unchanged; there is one current binding and no second enrollment.                                                                                                                                             |
| AC02 | Keep A, customize a same-meaning stage, or add an isolated task without changing the list. D18 never forces a switch because a default or catalog label/order changed. A genuinely different purpose cannot be smuggled into this command.                                                                                                                               |
| AC03 | Existing work on withdrawn A remains usable under D15. Moving to eligible B succeeds only under the qualified policy. Moving back to withdrawn A rejects even if A was used before; restoring A does not automatically move work.                                                                                                                                        |
| AC04 | Before exposure, the stage-policy decision specifies and proves every supported resulting stage/absence case. Wrong-list stage, unknown/retired target and absent required scope cannot be saved. Same labels/order do not map; D13 alone cannot authorize clearing a prior assessment.                                                                                  |
| AC05 | Target withdrawal and switch execute in both controlled orders: acceptance first yields retained attached work; withdrawal first rejects new attachment. A pending form/job or historical target use cannot create an exception.                                                                                                                                         |
| AC06 | Relevant target-stage retirement or permission/lifecycle/source change before acceptance is handled by actual current policy, without silent substitution. Cosmetic rename/order or unrelated catalog change alone does not invalidate an otherwise valid proposal.                                                                                                      |
| AC07 | Concurrent stage update versus list switch in both orders preserves the winning accepted result and rejects/resolves stale intent; neither can leave a mismatched pair or lose a recorded assessment.                                                                                                                                                                    |
| AC08 | Two switches, opposing A↔B changes and stale A→B→A views preserve serial source meaning without lost updates or indefinite waits. An old matching value does not bypass relevant revision checks; failures are visible and retryable by the qualified protocol.                                                                                                          |
| AC09 | Failure before required history/result or required effect intent commits leaves no partial current change. Independent readers see an old or new coherent committed binding/history/result. No caller observes an authoritative intermediate pair.                                                                                                                       |
| AC10 | Same-list no-op, exact accepted retry, failed-before-acceptance retry and same-key changed payload have distinct truthful outcomes. No duplicate history, stage assessment, enrollment or follow-up is created.                                                                                                                                                          |
| AC11 | After A→B and later B→C, retry the old A→B command: return only the permitted historical result without changing C. UI does not overwrite current C with the old receipt. A desired return to B is a fresh eligible command.                                                                                                                                             |
| AC12 | A corrective change made now preserves earlier actual recorded choices and intervening periods. No ordinary user input backdates acceptance or rewrites accepted history. A return is not an undo of independent tasks/finance/consent.                                                                                                                                  |
| AC13 | Pending, rejection, accepted-but-refresh-failed and lost-response states preserve exact submitted intent and distinguish unconfirmed from unsaved. Closing/reopening the UI cannot accidentally repeat the effect. If successful switching removes the row from the current filter, explain its movement and preserve a permitted route to the saved work.               |
| AC14 | Options/default/refetch/context changes and late responses cannot replace the submitted target or restore an obsolete source state. Safe unrelated draft input survives rejection; Cancel before submission makes no source mutation.                                                                                                                                    |
| AC15 | Compare readable journey/hidden current-list metadata, permitted target/forbidden target, absent target, lost mutation power and lost result visibility. Only independently permitted effect facts are revealed; no raw constraint/name/count/history/timing oracle.                                                                                                     |
| AC16 | Actual nonowner INSERT/UPDATE/UPSERT/RETURNING/RPC/view paths and allowed-old/forbidden-new mutations preserve complete tenant/source/list/stage scope, actor attribution and history immutability. Test NULL stage separately from NULL required scope.                                                                                                                 |
| AC17 | Import, API, job, privileged service and repair paths use equivalent current authority and invariants. Same-user tenant/assignment changes, stale tabs and revocation cannot reuse old cached choices or reveal old receipts.                                                                                                                                            |
| AC18 | A switch emits no false enrollment/contact/consent/financial event and does not cancel or regenerate unrelated tasks/asks. Any genuinely required owner effect uses one durable purpose identity through native/optional consumers and retries.                                                                                                                          |
| AC19 | Current grouping and historical reporting retain distinct meanings across rename, switch and return. No new-donor count, stage progression, forecast probability or old time-in-stage result is fabricated from list rank or current labels. The future stage policy defines any new assessment/time origin.                                                             |
| AC20 | The offered lifecycle states match a ratified policy. Neither correction nor process change on paused/closed work is accidentally exposed through a generic patch or made to reopen work. Bulk/cross-scope/historical commands are not inferred from this feature.                                                                                                       |
| AC21 | Keyboard, screen reader, touch, 320 CSS-pixel reflow, 200% text, RTL, long labels and slow mobile conditions expose current/proposed state, actual stage result, save/cancel and durable recovery. Essential errors are not toast-only; selection does not persist immediately.                                                                                          |
| AC22 | Old/new readers and writers, interrupted rollout, restore, containment and forward repair preserve accepted identity/history/receipts and current permissions. Logs/exports/backups obey protected-context and retention rules; no guessed backfill or stale-command revival.                                                                                            |
| AC23 | Representative missions staff can explain what changes and what stays, inspect alternatives, make/correct a choice and recover from conflict/uncertain save. Believing it starts another partnership, erases history or guarantees a suitable assessment blocks that flow's release until corrected and retested. Record actual observations, not an invented pass rate. |
| AC24 | At declared production-shaped tenant sizes/history skew and concurrency, record query plans, rows examined, query counts, payload bytes, latency units and contention/aborted retries. No per-option history scan, long human-held transaction, duplicate per-app mutation or optional vendor requirement.                                                               |

## Executed evidence and limits

The new [isolated PostgreSQL experiment](d18-evidence/list-change-probe/README.md)
passed **8/8 on its first attempt**. It exercised:

- A deterministic late receipt failure and independently observed precommit state:
  current binding, history and receipt commit together or roll back.
- Stage edit versus list switch in both controlled orders: the stale loser cannot
  overwrite the accepted list/stage understanding.
- Target withdrawal versus list switch in both controlled orders: new attachment
  rejects after withdrawal; already accepted attachment retains D15 use.
- A→B→A stale revision, old accepted replay and changed-payload conflict: returning
  to the same IDs does not make an old screen fresh, and replay does not reapply.
- Retained old references/recorded meaning after catalog rename, and the same
  journey/Party/ministry/purpose/scope across all seven seeded journeys.

Four lock waits were verified using the exact PostgreSQL backend IDs and
`pg_blocking_pids`, not inferred from elapsed time. Execution used PostgreSQL
**17.11**, **read committed**, Docker **28.4.0** and the pinned image in the
[metadata](d18-evidence/list-change-probe/run-metadata.json), from 16:01:53 to
16:01:59 UTC on 2026-10-10. Network was disabled; no ports, bind mounts, attached
volumes, Core migration, provider credentials or production data were used. The
exact temporary container was removed and its absence verified. Three executed
input hashes and all observed results are retained.

The fixture uses an explicit valid target stage solely to test atomic mechanics.
It does **not** select the product stage policy. It runs as database owner and
proves no P12/RLS/nonowner authorization, actor/timestamp audit, protected projection,
actual source effect, full history immutability, migration, real browser behavior
or performance budget. The FK test protects one historical reference; absent
external-owner tables cannot prove no real external effects. The emitted `40001`
is an explicit stale-revision error, not a claim of Serializable execution. Actual
same-list no-op, opposing simultaneous switches, all lifecycle states and full
interleavings remain release proofs; none is relabeled as passed by these cases.

D16/D17 component/form tests were inspected and reused as dated evidence, not rerun
or counted as fresh D18 checks. No new UI test was justified for an unimplemented
saved-list command with stage semantics still open. Installed/manifest version and
scoped-harness limits remain in those evidence packets and the D18 UX appendix.
No application source, migration, live database, tenant configuration, formal
PRD/OpenSpec, ticket or external message is changed.

## Independent synthesis and document verification

An independent read-only review of the decision, five appendices and experiment
supported **Accept** without a material capability amendment. Two corrections
were incorporated: the visible current/effect explanation uses only independently
permitted metadata rather than demanding or revealing protected old-list details;
and current CRM/CMS comparisons are distinguished from ministry-specific judgment
without claiming an uncited missions-tool switching precedent. The stage-treatment
release gate, source history/identity and retry boundaries remain intact.

The [integrated verification record](d18-evidence/review-checks.json) preserves the
completed pre-ratification status, alignment, category/contract, link, formatting and
experiment-evidence checks. It is a dated snapshot, not a current hash manifest after
status edits. The [D18 ratification/Q19 verification](d18-ratification-q19-validation.json)
checks updated records and unchanged exact decision/evidence. These checks qualify
research documentation, not application or release. Original D17 review/ratification
checks also remain dated snapshots after explicit continuation-pointer edits.

## Synthesis, order and accountability

1. **Record now — P27/founder intent:** accept A with the exact same-work, eligible
   destination and history boundaries. Preserve the expressly open stage question;
   neither generic form behavior nor a comparator supplies its answer.
2. **Resolve before formal design is complete — founder/P27, with P12/P9/P28:**
   settle the prospective stage consequence and the supported lifecycle/correction
   cases needed for a usable flow. Qualify actual source scope, minimum capabilities
   and effect/history projection. No generic saved-list editor is releasable first.
3. **Capture through the authorized documentation workflow — P27 and affected
   owners:** carry R01–R15/AC01–AC24, source ownership, exact event/metric meanings,
   UX states and rollout. Reconcile canonical prose during `/to-prd`; no formal
   artifacts or tickets are published in this interview.
4. **Implement and prove before activation — source/API/database/shared UI owners
   with QA/design:** one narrow command, coherent pair/history/result, current
   authorization, controlled concurrency, durable retry and accessible recovery.
   Test real roles and all doors, owner effects, actual browser/user outcomes and
   production-shaped data. No passing isolated fixture substitutes for that proof.
5. **Monitor residual failures — accountable roles below:** assign concrete team
   routes in release evidence. Unresolved authorization, stage or lifecycle policy
   is a gate to resolve, not a risk to watch after shipping.

| Signal                                                                                                  | Threshold                                                  | Owner                                                         | Response                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accepted mismatched list/stage, changed journey identity/purpose or duplicate enrollment from a switch  | Any confirmed occurrence                                   | P27 source engineering/on-call                                | Contain the switching writer, preserve evidence/current safe reads, reconcile affected work through authorized source repair and regression-test all affected doors. |
| Protected old/target/history/context disclosed through UI, errors, cache, export or logs                | Any confirmed event                                        | P12 security incident owner                                   | Contain revealing path, use existing incident process and verify minimum projection/context isolation before re-enabling.                                            |
| Old accepted retry overwrites newer binding, or one intended change duplicates history/required effects | Any confirmed occurrence                                   | P27 API/on-call with affected owner                           | Stop defective mutation/replay consumer, reconcile by durable intent and source ordering; fix and retest concurrency/retry.                                          |
| Accepted change has missing required owner effect or unresolved source-result reconciliation            | Any confirmed invariant failure                            | P27 source owner and shared work/delivery owner as applicable | Recover the existing durable effect, never issue a replacement enrollment; diagnose acceptance/consumer seam before resuming affected path.                          |
| Staff cannot explain stage consequence or mistake the change for starting over/erasing history          | Any validated support report or observed usability failure | P27 product/design owner                                      | Reproduce, correct copy/interaction and resulting records through qualified recovery; retest with representative users.                                              |

Metrics must not record protected descriptive list or missionary information.
Performance budgets are declared and proved during qualification, not substituted
with a vague monitoring promise. No new admin queue or blanket notification stream
is required by these signals.

## Adversarial check

### What could go wrong with this answer?

A harmless-looking list edit could destroy stage meaning, grant an invalid target,
repeat enrollment effects or rewrite newer work on retry. The coherent source
boundary, exact intent, disclosure rules and stage gate address those seams.

### What hidden assumptions are we making?

We judge that organizations benefit from flexibility; no observed frequency or
universal missions process is asserted. In particular, an appropriate new stage
cannot be inferred from an old label or from the founder's permission to change lists.

### How does this affect the whole product?

P27 retains one authoritative journey used by authorized staff/missionary surfaces.
History, reports and event consumers must recognize a genuine process change without
acquiring authority over identity, finance, consent, assignments or shared work.

### How does this affect the end-user experience?

Staff can adapt the same partnership rather than create duplicates. They see the
current process, proposed result and one clear save, with recoverable conflicts and
truthful uncertain outcomes. The stage consequence must be decided before that form
can be implemented coherently.

### Does this follow modern best practices?

It uses existing-record change, visible editable proposals, stable identities,
protected history and current authorization. Comparable CRM automation and stage
constraints are examined instead of copied; accessibility does not become another
unnecessary confirmation ritual.

### Does this fit Asym's existing repo and product direction?

Yes as intended behavior under ADR-0001, shared API/UI and P27/P28 ownership.
Existing generic status editing is not assumed to implement this source contract.
The research distinguishes accepted policy, present code and missing release proof.

### Should we adjust the recommendation?

**Accept.** No material amendment to the capability is required. Record the exact
D18 and its required safeguards. Keep current-stage treatment and the other expressly
reserved operations visible as real follow-on decisions; do not invent their answers
or mistake completion of this review for completion of Phase 27.
