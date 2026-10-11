# D12 UX review — direct, truthful stage changes

2026-10-10. Research and review of selected **A**, not a shipped flow, formal
PRD or permission grant. Core source HEAD:
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. No product files were edited and no
new experiment was needed to repeat D11's primitive checks. The recommendations
below require future verification in the actual P27 flow.

## Decision fit and strongest alternative

Keep A. Staff can directly select an eligible stage in the applicable approved
list, including a nonadjacent or previously used stage. The ordinary interaction
should describe the relationship accurately with one deliberate save. D10's
display order does not become a required sequence; D11's guidance does not become
a prerequisite. See [Q12:28–34](../phase27-q12-stage-movement.md#L28),
[ratified D11](../phase27-d11-adversarial-review.md), and the governing separation
of stage, lifecycle and authority at
[owner-constraints.md:45](/workspace/core/docs/prds/program-roadmap/owner-constraints.md:45).

The strongest B is a **bounded, explicitly configured allowed-move policy** for
organizations with genuine process dependencies. It could reduce accidental or
inconsistent handoffs; a minimal directed set of permitted moves need not imply an
arbitrary workflow language. Its costs still include exceptions when reality does
not match the sequence, administration, comprehensible blocked-state explanations,
and all-command enforcement. These are product tradeoffs, not measured ministry
outcomes. The founder selected A; do not retain a dormant rules builder or a
“skip with reason” waiver flow. Separate authoritative approvals, consent and
financial controls remain in their own sources under either choice.

Fresh primary documents, retrieved **2026-10-10**, show credible approaches without
making any vendor a Core contract:

| Primary source                                                                                                                                                                                                                      | Narrow evidence and limits                                                                                                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Salesforce Trailhead: Path and Kanban](https://trailhead.salesforce.com/content/learn/modules/leads_opportunities_lightning_experience/visualize-success-with-path-and-kanban), “Track a Deal with Path” and “Move an Opportunity” | Describes choosing a previous or skipped status and committing the selected status; also describes board dragging. Useful interaction precedent. Sales completion labels, celebration, probability and commercial semantics are not imported. No vendor UI was exercised. |
| [HubSpot: pipeline rules](https://knowledge.hubspot.com/object-settings/set-up-pipeline-rules), updated 2026-09-09                                                                                                                  | Separately configures skip/backward restrictions and distinguishes required properties. Describes enforcement contexts and bypasses; these do not establish uniform enforcement or desirable Core exceptions. Supports B's credibility, not its necessity.                |
| [Contentful: multiple workflows](https://www.contentful.com/help/ai-automations/workflows/workflows-management/multiple-workflows-to-content-types/), “Using multiple workflows in an entry”                                        | Describes choosing a destination from all steps and a destination-named commit. Its workflow/comment/restart model is not cultivation history. The page alone does not prove comments are optional.                                                                       |
| [Contentful: roles and permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-roles-and-permissions/), “Change between workflow steps”                                                                     | Distinguishes permission to move from a one-step-at-a-time option. This supports separating authorization from sequencing, without importing administrator exemptions.                                                                                                    |
| [Contentful: configure a field](https://www.contentful.com/help/fields/configure-a-field/), configuration tabs                                                                                                                      | Distinguishes appearance/help text from validation. Supports contextual explanation without a blocking requirement. No new Core generic field engine follows.                                                                                                             |

Salesforce/Contentful retrieved pages are current documentation without a pinned
product edition or verified last-change date. We gathered no ministry interviews,
observational task timings or measured usability preferences.

## Recommended ordinary interaction

**Change stage** remains a compact action inside the particular partnership's
permitted context. Show the identified supporter/ministry, **Current stage**, the
available choices and the selected choice's short approved meaning. Let the user
choose directly and **Save stage**, or **Cancel** before submitting. No intermediate
stage clicks, separate configuration visit, mandatory note or second confirmation.
This continues D11's baseline; it does not freeze select versus popover versus
sheet. An equivalent shared composition may meet the same outcomes.

Three facts must stay visually distinct: **current recorded stage**, **proposed
choice**, and **accepted result**. A selected option's checkmark means “chosen in
this editor,” not “saved” or “stage completed.” Browse with arrows/search without
changing the recorded stage. Use neutral **Change stage** language, including for
earlier destinations; avoid “Undo,” “Demote,” “Regressed,” “Failed” or “Advance” as
the ordinary action. A return to a prior stage is today's assessment, not erasure
of the intervening relationship history or evidence that someone failed.

Use Core's existing `base-maia`/Base UI and semantic tokens
([components.json:3](/workspace/core/packages/ui/components.json:3),
[UI ownership](/workspace/core/packages/ui/AGENTS.md:26)). The stage label and one
primary action should dominate; meaning, lawful provenance and optional detail
are secondary. Give selected, focused and unavailable states distinct text/shape
as well as color. Avoid numbered progress steps, percentages, filled-in skipped
stages, supporter-value colors, confetti or long explanatory warnings on the
ordinary path. Display exceptional feedback when relevant. Meaning is readable
beside the choice; essential distinctions must not depend on hover, truncation or
a distant help page. Do not invent missing organization guidance.

**Board/list parity.** A board card's **Change stage** control and the detail view
must use the same destination list, authority, command and outcome semantics. It
must be possible to jump directly to a far-away column without dragging across
intermediate columns. If dragging is later offered, a recommended conservative
composition uses the drop to propose the destination in the same compact editor,
then one Save; do not add a second confirmation. This is a recommendation, not a
requirement to ship dragging or a new board. A drag must never be the only way to
operate, and transient visual positioning must not masquerade as acceptance.

After acceptance, a card may leave a filtered view. Say that the stage was saved
and that the item no longer matches the view, where that is the known reason;
return focus to a meaningful remaining control. Do not report disappearance as
deletion or failure. Do not claim filtered/partially loaded board counts are total
portfolio counts.

## Edge-case contract

Severity is the consequence if mishandled; likelihood is qualitative for a naive
implementation, not measured current incidence. All proposed fixes preserve A.

| Case; severity/likelihood                                  | Clear behavior and acceptance result                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing selected; medium/medium                            | Keep the recorded stage visible. Do not select the first or “next” option merely because data loaded. Save needs a distinct eligible proposed destination; opening, browsing and Cancel produce zero source changes. A genuinely missing recorded value is represented truthfully, without settling the still-open initial-stage policy. |
| Same stage; medium/high                                    | Identify it as current. Choosing it does not produce a new assessment, transition, fresh date or task event. Save can be unavailable with an understandable reason, or the editor can finish as unchanged. A source race still requires authoritative reconciliation.                                                                    |
| Skip or move back; high/medium                             | Present every eligible destination equally; no ordinal warning or additional reason requirement. One acceptance records only actual prior/new stage, with no invented visits to intermediate stages. Existing tasks, pause/closure, consent and money retain their source facts.                                                         |
| A → B → A on separate accepted occasions; high/medium      | The later return is a new stage change with its own lawful history. It is not deduplicated against an old target value, backdated or marketed as Undo. Historical correction and destructive rollback remain separate, unresolved operations.                                                                                            |
| Retired recorded stage; high/high                          | Keep its authorized meaning and retired indication readable while offering eligible new destinations. Reopening/unchanged retention does not require replacing it. Retired does not mean unknown, failed, inaccessible or deleted.                                                                                                       |
| Destination retired during editing; high/medium            | Reject that new selection at source acceptance, preserve safe intent and show the permitted current reason with updated choices. Do not silently substitute a neighbor, infer success, or revive the stage.                                                                                                                              |
| Rename/reorder/long or duplicate labels; medium/high       | Bind selection by stable identity, not label/index. Show approved current wording while retaining lawful historical meaning. Reorder alone does not alter eligibility. Provide readable authorized distinctions for ambiguous labels; do not invent new stage meanings or expose internal IDs as normal UI.                              |
| Empty search versus failed options load; medium/high       | “No matching stages” permits clearing the search. A failed load offers retry and retains the recorded value. “No available stages” is a different source state with only the permitted remedy. Never turn any of these into a blank stage save.                                                                                          |
| Saving, repeated clicks, slow connection; high/high        | Keep current/proposed distinguishable, show saving status, and prevent accidental duplicate submission. A spinner cannot be the sole status. No claim of offline saving or hidden delayed submission. Preserve safe in-memory intent while the user remains authorized.                                                                  |
| Known rejection or stale revision; high/medium             | Preserve a safe draft; show a durable nearby reason and a clear review/retry route. Reveal only permitted current values/provenance. Do not overwrite the newer accepted stage or silently refresh-and-reapply an earlier intent.                                                                                                        |
| Outcome unknown after connection loss; high/medium         | Use wording such as “We could not confirm the update” and **Check update**. Recover the original authorized receipt; a matching current stage alone does not prove this command succeeded. A transport retry preserves intent/identity; a deliberately new assessment is separate.                                                       |
| Another user already chose the proposed stage; high/medium | Show the current authorized result without attributing it to this user or fabricating another change. Do not convert a stale command into success merely because the labels now match.                                                                                                                                                   |
| Close/cancel after submission; high/medium                 | Closing the editor or aborting a fetch does not promise to cancel or undo an accepted write. Preserve a discoverable permitted outcome in the originating surface; late responses must not update a different journey/editor.                                                                                                            |
| Access revoked or hidden destination/history; high/medium  | Remove disallowed cached detail and deny the operation without disclosing hidden alternatives, actors or records. Error recovery does not grant access or copy private history into a toast.                                                                                                                                             |

## Accessibility, mobile and localization

[WCAG 2.2 SC 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
requires a non-drag single-pointer way to achieve dragging functionality, subject
to its stated exceptions. Keyboard operability is a separate requirement: a
keyboard-only shortcut does not substitute for the tap/click alternative. The
normal **Change stage** action should support both. Follow the chosen shared
control's interaction pattern rather than attaching a competing custom keyboard
handler; the [WAI-ARIA combobox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
explains focus, option selection and Escape behavior.

Use a labelled control and associated guidance/error text. Expose changing save
status programmatically without unnecessarily moving focus, as described by
[SC 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).
Keep essential feedback in the editor/originating surface rather than relying on
a transient toast. [SC 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
supports predictable context changes; it is not a blanket ban on autosave. Here,
the deliberate save follows the accepted Core interaction, not an invented WCAG
rule. Focus must remain visible and unobscured by overlays or sticky actions;
[SC 2.4.11](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)
sets a minimum of not entirely hiding the focused component. Aim for the stronger
usable outcome, including with a soft keyboard.

On narrow screens, use a readable single-column editor with natural scrolling;
the user should not have to traverse a wide board to find the destination. Test
the ordinary editor at **320 CSS px** and the corresponding zoom conditions of
[SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), preserving
information and controls. This does not claim all two-dimensional data layouts
are forbidden. Core specifies **44 × 44 CSS px** touch hit areas
([touch guidance](/workspace/core/docs/ai/skills/emil-design-engineering/touch-accessibility.md:44),
[shared token/utilities:144,586](/workspace/core/packages/ui/styles/globals.css:144));
WCAG [SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
has a different 24 × 24 minimum with exceptions. Do not conflate the two.

Use locale-aware date presentation, readable translated action strings and full
stage distinctions. Test long labels and mixed Arabic/Hebrew with Latin names;
respect writing direction and meaningful reading order. Stage meaning cannot
depend on “left means earlier,” a left arrow or a numeric position. Popovers,
portals, checkmarks and focus must work in RTL. Respect Core reduced motion;
movement is not required to understand acceptance. Low bandwidth gets truthful
loading and retry states, not a new persistence/offline product or an invented SLA.

## What current source proves—and does not

- The current CRM board alphabetizes loaded donor lifecycle labels and opens
  cards; it is not a P27 stage-move implementation
  ([kanban-view.tsx:29–78](</workspace/core/apps/admin/app/(app)/crm/kanban-view.tsx:29>)).
- `SelectCell` invokes its callback and closes synchronously; missing options
  render `N/A`
  ([select-cell.tsx:38,126](/workspace/core/packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx:38)).
  It cannot alone supply save confirmation or retained retired-stage display.
- `SearchableSelect` supplies accessible-name/description hooks, stable values,
  disabled options and an empty state, but derives its display from current items
  and truncates labels
  ([searchable-select.tsx:90–140](/workspace/core/packages/ui/components/shadcn/searchable-select.tsx:90)).
  Shared form controls connect guidance/errors
  ([tanstack-form.tsx:146,537](/workspace/core/packages/ui/components/primitives/tanstack-form.tsx:146)).
- Shared Select source still uses physical `pr/pl/right` for option geometry
  ([select.tsx:138–145](/workspace/core/packages/ui/components/shadcn/select.tsx:138)).
  This is a specific RTL review target, not proof of a rendered defect. Core's
  coarse-pointer rule sets minimum height (`globals.css:417–434`); complete target
  width/layout still needs inspection. Do not infer complete mobile conformance.
- The [earlier D11 evidence](../d11-evidence/source-probe/README.md) passed three
  existing real-control tests in jsdom: stable-ID keyboard selection/focus return,
  empty-search retention, disabled choice/label refresh. It did not test saving,
  drag, RTL, browser layout, real assistive technology or P27. Installed Base UI
  was 1.8.0; the freshly retrieved [Base UI accessibility documentation](https://base-ui.com/react/overview/accessibility)
  currently advertises 1.9.0 and explicitly leaves application styling/labels/
  testing responsibilities. Do not mistake latest docs for installed behavior.

## Measurable acceptance before calling the whole experience excellent

These are proposed release proofs, not results obtained in this review:

1. With illustrative available IDs A/B/C, perform A → C and C → A through both
   detail and board/list entry points. Each accepted update has exactly one true
   transition, no intermediate events and no extra prerequisite. Reordering the
   catalog leaves those moves available.
2. A → B → A produces two accepted changes; repeating the same submission produces
   one original outcome. Same-stage, opening, search and pre-submit cancellation
   create zero stage changes. Check authoritative history, not only the badge.
3. For every tabled exceptional state, verify the shown current/proposed/outcome
   and available recovery. Inject a delayed/lost response, competing save and
   permission loss. No false success, silent overwrite, leaked hidden context,
   duplicate effect or automatic replay of new intent is acceptable.
4. Complete the same destination changes by keyboard alone and by tap/click
   without dragging. Verify focus entry/return, Escape, meaningful labels, help
   and save/error announcements with browser and screen-reader checks; run the
   relevant automated accessibility suite as supporting evidence.
5. At narrow/zoomed widths, long translated labels and RTL, every stage can be
   distinguished, selected and saved without clipped essential content or blocked
   actions. Measure hit areas, inspect light/dark contrast and reduced motion;
   record devices/browser/assistive-technology versions actually exercised.
6. In usability review, staff can identify which partnership they are editing,
   the recorded and proposed values, whether a save was accepted, and the next
   recovery action without coaching. Record observed misunderstandings and task
   outcomes; no success rate or task-time claim is made before such observation.

The remaining owner decisions—initial stage, preset switching, historical
correction/backdating and detailed work treatment—must not be smuggled into this
UI review. D12 establishes direct appropriate movement, not those additional
product capabilities.
