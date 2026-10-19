# D13 UX evidence — a clear start without a guessed stage

2026-10-10. Review of selected **A: allow “Not yet assessed” at admission**.
Research only against Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3`;
no product edits, schema selection, live qualification or usability study.
Core UI/accessibility guidance and current shared controls were reviewed. D11's
three existing selector tests remain earlier primitive evidence, not D13 proof.

## Recommendation and strongest alternative

Keep A with an explicit, readable absence of assessment. An authorized person can
choose a suitable stage when known, or admit otherwise-valid partnership work
without one. This is not a universal first stage, an unhealthy-work exemption or
a requirement that every new journey begin unassessed. [Q13:27–43](../phase27-q13-initial-stage.md#L27)
and [D4:23–61](../phase27-d4-adversarial-review.md#L23) preserve responsibility,
follow-up, deliberate admission, safe reuse and truthful per-member outcomes.

The strongest B requires an actual suitable stage at admission, with an
organization-defined early stage whose meaning honestly fits limited knowledge.
It gives fully classified new work and can simplify some views. A already permits
that accurate early choice. Requiring an administrator to manufacture a placeholder
merely to satisfy a required field adds configuration and mixes missing assessment
with assessed-stage history. An invented first value is not better information.
The founder chose A; do not introduce an “allow unassessed” tenant switch,
acknowledgement, waiver, assessment queue or grace-period policy. These are product
judgments, not measured claims about ministry behavior.

Flexibility remains where it helps: organizations define stage meanings and lists
under D10; staff choose any eligible meaning under D12 when they can assess it;
either a known stage or honest omission can accompany admission. A does not choose
defaults/suggestions, clearing an existing stage, bulk reassessment, new grants,
historical correction or a configurable workflow engine. No tenant must create,
rename or delete a catalog stage to make omission possible.

## Fresh primary comparison

Retrieved **2026-10-10**; documentation was read, products were not exercised.

| Primary source                                                                                                                                                                                              | Supported fact and limit                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HubSpot lifecycle defaults/sync](https://knowledge.hubspot.com/object-settings/manage-how-lifecycle-stages-sync-between-objects), updated 2026-09-09, “Manage lifecycle stage pipeline rules”              | Turning off its creation default can leave a lifecycle value blank, but the page expressly describes index/associated-record and form paths that still assign the first displayed stage unless overridden. This is a useful counterexample: an “optional” setting does not prove omission survives all writers. Core must not import those first-stage or automatic-association exceptions; HubSpot lifecycle is a different subject. |
| [HubSpot lifecycle customization](https://knowledge.hubspot.com/object-settings/create-and-customize-lifecycle-stages), updated 2026-03-30                                                                  | Catalog customization, segmentation and automatic-setting features are distinct capabilities. It does not establish Asym's initial-assessment policy or imply every tenant needs another toggle.                                                                                                                                                                                                                                      |
| [Contentful default values](https://www.contentful.com/help/fields/use-default-values-for-entries/), “What are default values?”                                                                             | Defaults are stored values applied at entry creation through web/API/developer tools, while remaining editable. A displayed omission label is not such a default. No Core default engine or CMS publication semantics follows.                                                                                                                                                                                                        |
| [Contentful field configuration](https://www.contentful.com/help/fields/configure-a-field/), configuration tabs                                                                                             | Help text/appearance, validation and defaults are separately configured. This supports separating explanation from a stored value or blocking requirement, without importing a general field engine.                                                                                                                                                                                                                                  |
| [WCAG 2.2 SC 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) and [WAI form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/), tutorial updated 2024-05-13 | Optional fields still need meaningful labels/instructions; placeholders do not replace labels. Helpful instructions should remain concise. These sources support understandable controls, not a mandatory extra confirmation for omission.                                                                                                                                                                                            |

Contentful pages were freshly retrieved but do not establish a pinned deployed
edition or reliable last-change date. No source proves improved missions outcomes
from either A or B. HubSpot's blank-field behavior is not claimed as universal.

## A lean interaction with an obvious next action

Reuse the contextual admission action already qualified by D4. **Start partnership**
is illustrative copy for starting internal work, not evidence of supporter agreement.
Do not add a second setup wizard merely to ask about assessment. A compact form or
equivalent shared composition can make both valid paths apparent:

| Content in existing context | Recommended presentation                                                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Partnership being started   | Authorized supporter, identified ministry and purpose already understood; ask only for missing/materially changed information.                                                                                    |
| Assessment                  | **Stage (optional)** with access to eligible choices and short approved meanings. If none supplied, readable adjacent text: **Not yet assessed** · “Choose a stage if you know it. You can set it later.”         |
| Accountability              | The chosen responsible lead and the applicable next dated work or owned actionable exception, as allowed by their sources. Reuse existing information; do not ask for a duplicate task.                           |
| Commit                      | One **Start partnership** action and ordinary Cancel. Omission alone does not disable admission or cause a warning/confirmation. A genuine missing mandatory source requirement gets a specific permitted remedy. |
| Accepted result             | **Partnership work started** with the authoritative stage or **Not yet assessed**, plus the existing next work. If authorized, **Set stage** is an obvious nearby action for unassessed work.                     |

“Not yet assessed” describes the intended/recorded absence; it is not a secretly
selected catalog value. Do not require clicking an “I don't know” option before
an otherwise valid start. Conversely, keep choosing a known stage equally easy;
do not hide all choices behind a separate assessment workflow. Before admission,
staff can revise an **unsaved** stage choice back to omission through a clearly
labelled draft action. That is not permission to clear an existing recorded stage.
Exact widget/placement remains an implementation choice; the meaning must survive
keyboard, mobile and translated layouts.

After starting, **Set stage** uses the shared D11/D12 deliberate editor: show the
current unassessed state, the proposed eligible meaning, Save and Cancel. Its
accepted result is the first recorded assessment, not movement out of a fabricated
stage zero. Present truthful accepted time/provenance without inventing an earlier
assessment or contact. If a colleague already assessed the journey, reconcile the
current source revision; do not overwrite it because an old screen was unassessed.
Once assessed, use the ordinary **Change stage** action. Do not offer “return to
Not yet assessed,” drag back into that group, or clear-stage controls on existing
records based on D13.

The next work and **Set stage** serve different needs. Make both discoverable
without pretending assessment is always the immediate next task. D13 neither
creates an assessment deadline/task nor replaces a real promise with a generic
“assess” chore. A missing assessment can coexist with healthy owned follow-up;
unowned/undated work retains its existing exception treatment.

Keep Core's `base-maia`, Base UI and semantic tokens, with a calm hierarchy:
partnership identity, current facts, next work and the relevant action. Use a
neutral readable label, not a red failure badge, faint blank or percent-complete
meter. Guidance is secondary; do not put an essay, warnings or configuration links
on every ordinary start. See [UI rules](/workspace/core/packages/ui/AGENTS.md:26)
and [accessibility review](/workspace/core/docs/ai/skills/accessibility-review/SKILL.md:33).

## States that must remain distinct

Severity is consequence if misimplemented; likelihood is a qualitative reuse risk,
not a deployed incident rate. Each mitigation retains A.

| State; impact/likelihood                                                  | Presentation and permanent acceptance safeguard                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authoritative absence of assessment; high/high                            | Show **Not yet assessed**, not blank, dash, `N/A`, “Unknown donor” or “Stage 0.” Only the authoritative admitted state supports this claim.                                                                                                                                                                                                                                                                               |
| Initial current-stage load; medium/high                                   | Show a labelled loading state. Do not briefly claim unassessed or zero before authoritative current-stage data arrives.                                                                                                                                                                                                                                                                                                   |
| Current-stage read failure; high/medium                                   | Show a retryable error and retain only currently permitted prior information with its stale status. Do not interpret missing response fields as a fresh omission.                                                                                                                                                                                                                                                         |
| Choices loading or failing while current-stage data is known; high/medium | Show the options request's own loading/retry state; preserve independently authorized source-qualified stage or absence and recoverable draft intent. Options failure does not prove missing assessment, invalidate a known absence or silently discard a selected destination. It adds no client-side options-fetch prerequisite to otherwise valid no-stage admission; all independent source requirements still apply. |
| Restricted/withheld information; critical/medium                          | Follow the permitted unavailable/redacted presentation or deny the view. Never call withheld data unassessed, offer a write from that inference, or reveal hidden existence/values through an explanation.                                                                                                                                                                                                                |
| Retired recorded stage; high/high                                         | Keep its authorized label/meaning and retired indication. It is an assessment whose definition is unavailable for new selection, not an unassessed journey.                                                                                                                                                                                                                                                               |
| Legacy missing/ambiguous stage; high/medium                               | Use its source-qualified treatment. A missing old field does not prove nobody assessed the relationship; do not automatically classify a migration discrepancy as newly unassessed.                                                                                                                                                                                                                                       |
| Empty permitted choice list or no search match; medium/high               | Distinguish no matches from no eligible options and failed loading, with the permitted remedy for that actual state. None proves the authoritative catalog has zero selectable stages. Missing a choice does not invent a stage. Starting without one remains available only when all other admission/source requirements are satisfied.                                                                                  |
| Authoritative catalog has zero selectable stages; high/medium             | Apply D10's usable-catalog requirement and permitted configuration-repair route. Omission cannot bypass actual source invalidity; do not infer that invalidity from a filtered, permission-limited or failed options response.                                                                                                                                                                                            |
| Stale or newly retired proposed destination; high/medium                  | Reject/reconcile the explicit selected intent. Do not silently fall back to admitting unassessed merely because stage is optional. Let staff deliberately revise the draft.                                                                                                                                                                                                                                               |
| Save pending or response lost; high/high                                  | Show starting/saving or unconfirmed outcome; recover the original authorized receipt. Do not count queued work as started or invite a blind duplicate start. Closing a view does not undo a commit.                                                                                                                                                                                                                       |
| Reused or reopened journey; high/high                                     | Preserve its recorded stage, work and history under D4/D9. An omitted stage on this new admission attempt is not a patch clearing the reused record. Reopening existing work is not a fresh unassessed start.                                                                                                                                                                                                             |
| Newly assessed item leaves an unassessed filter; medium/high              | Show the accepted result and known filter explanation, preserve an authorized way to review it and restore meaningful focus. Disappearance must not read as deletion or failed save.                                                                                                                                                                                                                                      |

## Lists, filters and boards

Where offered, list cells should render the explicit source-qualified absence and
make **Set stage** available only to an authorized editor. Provide a meaningful
filter for the unassessed condition alongside actual stage filters; its internal
predicate is an assessment condition, not a fake stage ID or nullable UI shortcut.
The same meaning must survive saved views, search, exports and reporting under
their source/disclosure contracts.

If an actual approved stage is named **Not yet assessed**, distinguish it from
the system condition with context such as **Stage: Not yet assessed** versus
**No stage recorded (Not yet assessed)**. Include that distinction in accessible
names and filter/group labels wherever both appear; a color or icon alone is not
enough. Determine the condition from authoritative assessment state, never from
the label string. This needs no reserved tenant name, forced rename, displayed
UUID or additional customization control.

A board may group such journeys under **Not yet assessed** so they are not dropped
by a join or hidden from work. Make it visually understandable as an assessment
group, not a configurable catalog stage, first ranked step or backwards destination.
Do not require a new board or dragging for D13. Existing D12 non-drag pointer and
keyboard routes apply if a board is offered. A card in an unassessed group can
initiate an authorized assessment through the same editor; an assessed card cannot
be dropped there to clear history under this decision.

Counts need honest coverage: **0** is a verified count for the stated permitted
scope, **Loading** is not zero, **Unavailable** is not zero, and **N shown** is not
the whole portfolio. Do not count inaccessible or ambiguously migrated records as
unassessed. Avoid zero stage age, zero progress or synthetic conversion from this
group. Any aging/report denominator needs its own source definition; no default
formula, overdue threshold or escalation is selected here.

## Reviewed groups without per-person ceremony

Use D4's finite reviewed manifest. In the existing review, make the proposed
assessment legible per member or through a truthful homogeneous summary, with
drill-down for differences: a known chosen stage, no assessment supplied, or an
existing journey whose state will be preserved. A shared choice, if expressly part
of that reviewed operation, must not overwrite member-specific intent or reused
state. D13 does not authorize a new bulk-stage-edit capability.

Do not force opening every member merely to acknowledge absence. Show only
missing/materially changed information requiring action, while responsibility and
next work retain per-member source validity. Submission reports accepted, reused,
unaccepted and unresolved outcomes using D4's current-disclosure limits; a selected
count or an unassessed preview count is not an admitted count. Partial success and
receipt recovery must not transform an explicit known-stage choice into omission,
clear a reused assessment or expand to newly matching rows.

## Accessibility, mobile and recovery proof

Use visible **Stage (optional)** and associated concise instructions; do not rely
on placeholder-only labels. Shared controls should expose names, values, error
relationships and saving status. [SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
supports programmatically exposed status messages without unnecessarily moving
focus. Do not announce omission as a validation error, or keep announcing an
unchanged unassessed label as if an operation just completed.

Test both start paths and later assessment with keyboard, screen reader and
tap/click. [SC 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
requires a non-drag single-pointer alternative independently of keyboard access
when dragging is used. Keep Core's 44-pixel touch convention, visible focus,
contrast and reduced motion. At **320 CSS px** effective width and zoom conditions
from [SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), labels,
stage meanings, next work and action buttons must remain readable/reachable.
Long translated labels and RTL/mixed-direction names need full distinctions and
logical reading order; no meaning may depend on leftmost position. A soft keyboard
must not obscure the only action/recovery control. Slow/disconnected operation
requires truthful status and safe retained intent, not a new offline queue or SLA.

Proposed measurable release proof, **not yet executed for P27**:

1. From each offered admission path, complete a valid known-stage start and a valid
   omitted-stage start with one deliberate admission commit. The latter has an
   explicit unassessed read result, zero invented assessment/stage-visit events,
   and intact responsibility/next-work accounting. No compulsory omission click,
   stage default, note or extra confirmation occurs.
2. Exercise every state above. Omission, loading, failure, withheld data, retired
   value and legacy ambiguity never collapse to the same semantic state. Explicit
   selected-stage rejection never silently becomes omitted-stage acceptance.
   Independently verified absence remains visible when options fail; a no-match or
   empty permitted options response never becomes proof of an invalid catalog.
   Actual zero-selectable catalog invalidity still enforces D10's source rule.
3. Set the first stage later; cancel once, then save once. Cancel records nothing;
   the accepted assessment records the actual actor/time/meaning once. Concurrent
   assessment, lost response and reuse leave no duplicate/reset/overwrite.
4. Verify unassessed filter/group inclusion and exclusion with permission changes,
   pagination and refresh. An authoritative zero, partial loaded count and failed
   query have distinct outputs; leaving a filter after assessment has understandable
   success and usable focus.
5. Review a mixed finite group with known/omitted/reused/failed/unresolved members.
   Compare the submitted member intent to each permitted receipt; unchanged members
   need no redundant confirmation, and retry does not expand or rewrite intent.
6. In actual accessible browser tasks and representative staff/missionary review,
   participants can identify both admission options, what will be saved, who owns
   the next work, how to set/change the stage later and what to do after uncertainty.
   Record device/assistive-technology versions and observed errors; no invented
   success-rate or task-time claim substitutes for testing.

## Current-source reuse limits

The bounded fresh search for `Not yet assessed`/`unassessed` in packages, apps and
migrations found no runtime match. That is not a repository-wide absence proof or
a live-system audit. Existing source makes several dangerous shortcuts plausible:

- The donor edit model fills a missing status with `Active`
  ([edit-donor-form-model.ts:61–73](/workspace/core/apps/missionary/app/donors/edit-donor-form-model.ts:61)).
  It is donor status, not P27. Do not copy its fallback into an initial assessment.
- `SelectCell` renders unmatched values as `N/A`; its generic clear action emits
  `null` ([select-cell.tsx:47,126](/workspace/core/packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx:47)).
  Neither defines D13 absence or permits clearing recorded state.
- `SearchableSelect` resolves both missing/no-matching values to its placeholder
  ([searchable-select.tsx:102–106](/workspace/core/packages/ui/components/shadcn/searchable-select.tsx:102)).
  The form select ignores `null` callbacks
  ([tanstack-form.tsx:531–535](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:531)).
  Explicit unsaved-omission control and authoritative read-state composition need
  their own review; a generic nullable callback is not the source policy.
- Current CRM board maps missing lifecycle status to `Unknown`, counts loaded rows
  and alphabetizes headings
  ([kanban-view.tsx:29–64](</workspace/core/apps/admin/app/(app)/crm/kanban-view.tsx:29>)).
  Its status filter treats missing values as passing the local predicate
  ([columns.tsx:182–191](</workspace/core/apps/admin/app/(app)/crm/columns.tsx:182>)).
  These are concrete source behaviors, not a qualified unassessed board/filter.
- The grid retains earlier query data during refetch
  ([admin-crm-infinite.ts:192–207](/workspace/core/packages/database/hooks/admin-crm-infinite.ts:192));
  current `nextTaskSummary` is always null in the row builder
  ([model.ts:58–59](/workspace/core/packages/api/src/admin/crm/model.ts:58)).
  Neither proves fresh assessment state or absent next work.

Shared form description/error association remains useful
([tanstack-form.tsx:142–170](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:142)).
The earlier [D11 test appendix](../d11-evidence/source-probe/README.md) qualifies
only three selector behaviors under jsdom, not admission, omission, browser
layout, authorization, group execution or D13 semantics. No product boundary for
this decision exists here to justify pretending a new synthetic UI is its proof.
