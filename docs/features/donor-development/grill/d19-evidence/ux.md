# D19 evidence — an optional current stage when changing lists

2026-10-10. **UX recommendation: retain A**, selected after
[Q19](../phase27-q19-stage-on-list-change.md). Research against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. This resolves D18's stage-outcome
policy for an actual change to another list; it does not establish a shipped
interaction or a new ability to clear an assessment while staying on the same list.

## Meaning, simplicity and strongest alternative

Staff may choose an eligible stage on the destination list or save with no current
stage there. The latter is a valid **Not yet assessed** outcome, visibly understood
before the same deliberate save. It means there is no current assessment after
this change, not that the partnership has never been assessed. A destination may
have been used before. Prior list choices and assessments remain in lawful history.

The strongest B requires an eligible destination stage before changing lists. It
gives immediately categorized current work and fewer unassessed records, but may
delay a sound process change or pressure staff to guess. A records uncertainty
honestly. Neither answer establishes a tenant-specific default stage, automatic
mapping, assessment reminder/deadline or new permission. No measured staff
preference, error rate or ministry software workflow is asserted.

**Minimal proposed interaction:** when staff deliberately choose a different target
list and have not chosen a stage for that proposal, visibly show the intended
no-current-stage outcome. Ordinary Save expresses that reviewed intent. This is
not a hidden fallback and not an automatically guessed assessment. Do not require
a second acknowledgment, a reason narrative or a needless click on “Not yet
assessed” when that outcome is already clear. An already-unassessed source does
not justify additional ceremony.

## Fresh primary evidence

Sources below were retrieved/read **2026-10-10**. Website documentation and code
examples are not observed application behavior or full accessibility qualification.

| Primary source                                                                                                                                                                                                                                                                                                       | Relevant evidence and limit                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Base UI Select](https://base-ui.com/react/components/select), “Placeholder values”                                                                                                                                                                                                                                  | Distinguishes a placeholder from an actual null-valued list item that can be selected to clear a value. A placeholder alone is not a selectable empty option. Current docs advertise **1.9.0**; the new local probe checks installed **1.8.0** rather than assuming parity. Neither chooses Core's business meaning for null. |
| [W3C form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/)                                                                                                                                                                                                                                        | Explains that placeholder text does not replace labels and disappearing instructions impair review. A visible destination outcome needs a persistent label/context. The tutorial's historical browser-support discussion is not a claim about present Core browser support.                                                   |
| [WCAG Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) and [Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)                                                                                                                     | Support an understandable optional control whose selected value and state are exposed to assistive technology. Neither a blank, a tooltip alone nor internal null satisfies that meaning by itself.                                                                                                                           |
| [GOV.UK select](https://design-system.service.gov.uk/components/select/)                                                                                                                                                                                                                                             | Allows defaults for settings but cautions against preselecting answers to questions. This strengthens the case against guessing a substantive stage. D19's visible no-current-stage proposal is the selected optionality policy, not evidence that default bias disappears. Its widget choices do not override Core.          |
| [Error Suggestion](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion.html), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Support actionable errors, accessible result/pending feedback, predictable control changes and narrow-layout operation. They do not demand announcing every menu option twice, adding a modal acknowledgment or treating a valid optional outcome as an error.                                                                |

## Actual Core controls and new bounded proof

The shared Base UI, exact `base-maia` and Zinc semantic-token configuration was
rechecked. Preserve [`packages/ui/AGENTS.md`](../../../../../packages/ui/AGENTS.md)
and Core's accessibility/touch guidance; compose shared controls instead of making
a parallel primitive or app-local fork.

- [`Select`](../../../../../packages/ui/components/shadcn/select.tsx:11) forwards
  the primitive props and value renderer. Lines 129–152 wrap real items, text and
  selection indicators. Trigger styling at line 38 distinguishes placeholder state
  and clamps displayed text; semantic source absence must not be inferred from
  a CSS placeholder attribute or truncation.
- [`AsymSelectField`](../../../../../packages/ui/components/primitives/tanstack-form.tsx:77)
  defines string-valued options; lines 531–535 explicitly ignore a null callback
  and pass the current field value. Dropping a nullable option into this higher
  wrapper is not demonstrated support for an optional business outcome. Its error
  relationships at lines 142–170 and pending submit handling at 640–674 remain
  useful mechanics, not domain acceptance proof.
- [`SearchableSelect`](../../../../../packages/ui/components/shadcn/searchable-select.tsx:102)
  uses a placeholder when the controlled value cannot be found in current items.
  D16's **1/1** [dated probe](../d16-evidence/source-probe/README.md) proved the old
  caller ID can remain while that placeholder is displayed. It does not mean a
  current assessment was cleared or a no-stage outcome chosen.
- [`InboxSettingsForm`](../../../../../apps/admin/features/support-hub/components/settings/inbox/InboxSettingsForm.tsx:96)
  demonstrates a useful different-domain distinction: an explicit “No default
  signature” UI value maps to null while incidental null callbacks are ignored
  (lines 98–107); equivalent policy/hours choices appear at 118–156. The
  [consumer test](../../../../../tests/unit/packages/ui/searchable-select-consumer-null-policy.test.tsx:269)
  checks these cases using a callback-boundary injection and real option clicks.
  It was inspected, not newly run here; it does not show that loading/search emits
  null, or dictate a P27 sentinel/schema. The form's draft reset at lines 31–42
  is not automatically suitable for concurrent saved-list editing.
- [`SelectCell`](../../../../../packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx:38)
  closes synchronously after callbacks and can emit null through Clear at lines
  47–51. Neither picker closure nor that generic clear operation is a D19 save;
  lines 126–132's N/A must not be used for a known no-current-stage outcome.

**New result: 1/1 first-run pass** in the
[actual shared-selector probe](source-probe/README.md). Starting with a stage-like
string value, selecting a rendered null-valued option emits null once and displays
that option's label instead of the generic placeholder. No component was mocked.
This proves a primitive capability, not support in `AsymSelectField`, serialized
API intent, a P27 form or a need for an extra user gesture. Distinguish the
caller-controlled business state from incidental callback/display states.

The test ran in jsdom with Node 24.19.0, Vitest 4.1.4, React 19.2.3 and Base UI
1.8.0 using a scoped harness. The manifests request newer Vitest/React versions;
installed TanStack Form is 1.28.6 versus requested 1.33.5. Bun was unavailable.
The earlier root-config Sentry export failure was not repeated. Adjacent exact
inputs, result/output and metadata preserve provenance and limits. D17's **4/4**
[default/form tests](../d17-evidence/source-probe/README.md) are reused as dated
evidence, not rerun or counted as new. No database, network, authorization, complete
browser or source-command safety was qualified by this UX test.

## A clear normal flow

Keep the D18 composition short: current list/stage, proposed target and actual
stage outcome, ordinary Save/Cancel. For example:

| Current                           | After this change                      |
| --------------------------------- | -------------------------------------- |
| Missionary support · Conversation | Church partnerships · Not yet assessed |

These are hypothetical tenant names, not required vocabulary. A compact helper
such as **No current stage will be recorded. Earlier assessments stay in history.**
explains the optional result. Show **Stage after change (optional)** with the
current proposal and an obvious **Choose a stage** action or equivalent shared
control. A specific widget or a permanently duplicated comparison table is not
required; a stacked composition is preferable on narrow screens.

Staff can inspect eligible stages, select one, change it, or return the unsent
proposal to Not yet assessed. Make that return path reachable without erasing
the target list or restarting the editor. The absence is a system condition, not
a real stage added to every tenant catalog. Do not rely on a disappearing
“Select…” hint, an X icon with ambiguous meaning, an empty cell or N/A. Conversely,
do not style this permitted outcome as missing required work, failure or a warning.

If an actual tenant stage is also named **Not yet assessed**, visibly distinguish
the system condition with **No current stage** context and the real stage with
its stage/list context, including accessible names. Do not reserve arbitrary stage
names, require a rename or display raw IDs. Stable IDs and an explicit outcome
representation must preserve the difference through submission.

Only a deliberate Save accepts the final list plus selected stage or explicit
no-current-stage outcome. An omitted property, failed lookup or incidental null
callback cannot decide that result. Keep transport details out of the product;
the source contract must preserve the semantic distinction. Do not add a new
acknowledgment just to compensate for unclear field state.

## Two different returns to the original list

**Unsaved detour:** source A/Conversation → draft B/Not yet assessed → target A
again, without any accepted list change. Show the authoritative A/Conversation
state again and recognize that no list change remains. Do not submit the intermediate
empty stage as a same-list clearing command. If another person changed A while
the editor was open, refresh/reconcile that current source version; do not blindly
restore an old local snapshot. Cancel before dispatch likewise abandons only the
proposal. These are not new stage events.

**Historical return:** accepted A/Conversation → accepted B → deliberate change
back to eligible A. This is a new D18 change. Show its current proposed outcome;
without a stage choice, that is Not yet assessed. Do not resurrect Conversation
from history, remap B's current stage by matching text or reopen an old stage period.
Staff may explicitly choose a currently eligible A-stage under the ordinary rule.
If that stage or A itself is now retired/withdrawn, prior use supplies no exception.
All accepted transitions remain understandable in history.

## Distinct states and recovery

| Situation                                    | Required presentation and next action                                                                                                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Valid changed target, no stage chosen        | Clearly show Not yet assessed as the intended result. Permit the same normal Save when all other source conditions hold; do not require visiting the stage menu first.                                                                                                                                       |
| Stage choices loading/failed                 | Describe the options state separately from the intended stage outcome. Do not infer absence from failed data or silently replace an explicit stage choice. A choices-read failure alone must not block an independently valid, clearly intended unassessed result; source eligibility/authority still apply. |
| Current assessment unavailable/denied        | Do not call it unassessed. Show permission-safe current context and qualify operation authority separately. Previously rendered details are not perpetual disclosure permission.                                                                                                                             |
| Empty search versus invalid catalog          | Offer clear-search for no matches. It does not prove no eligible stages exist. D19 does not bypass D15's usable-list requirement; a genuinely invalid target needs source repair, not a guessed or no-stage workaround.                                                                                      |
| Selected target stage retired or access lost | Reconcile/reject that explicit choice with a clear remedy. Do not silently fall back to unassessed merely because the alternate outcome is allowed. Choosing no stage remains a deliberate visible proposal.                                                                                                 |
| Staff choose another unsaved target          | Remove incompatible proposed stage identity and visibly show the new target's no-current-stage outcome unless staff choose a valid stage. Keep source current state intact; handle return to the original source list as above.                                                                              |
| Source conflict                              | Keep safe proposal input distinct from refreshed source facts. Review relevant changes before a new deliberate submission; do not update the version and retry unseen.                                                                                                                                       |
| Pending                                      | Preserve the exact submitted outcome, show understandable busy feedback and prevent duplicate dispatch. Picker closure or form cleanliness is not success. Dismissing the surface does not prove cancellation.                                                                                               |
| Known failure or uncertain response          | Distinguish a rejected attempt from acceptance not yet confirmed. Retain safe intent, offer actual recovery and reconcile the original attempt before making another. Do not restore stale query snapshots over newer work.                                                                                  |
| Accepted, possibly filtered out              | Show the accepted result and a permitted route to current work/history. If it leaves a stage filter or board column, explain its new current grouping; disappearance is not a failed save.                                                                                                                   |

A late response must not overwrite a newer draft or current binding. An old
successful receipt proves that prior acceptance, not permission to repeat it over
subsequent work. Low bandwidth does not justify an implicit offline queue, skipped
source checks or an invented deadline. Default changes never choose a stage here.

After acceptance, the ordinary **Set stage** action should remain easy to find
when permitted. Keep current lead and next work usable; do not add an assessment
task, require a date or initiate donor communication. Current-stage views/grouping
must distinguish the unassessed condition from a real stage and from unknown data.
History preserves previous assessments in their original list context. Do not label
the transition as regression, failure, a fresh enrollment or evidence of ministry
engagement. Reporting must not present old stage tenure as current tenure or treat
unknown/unassessed as a measured zero.

## Acceptance requirements and limits

These are proposed release checks. Severity and likelihood are qualitative reuse
judgments, not measured incident probabilities.

1. **High impact; plausible null-handling error.** Save changed-target/no-stage
   directly from the clearly displayed outcome without opening another control;
   then repeat with an explicitly selected eligible stage. Inspect actual requests,
   accepted source pairs and history. No generic omission keeps the old-list stage,
   and no sentinel becomes a catalog stage. Choosing a stage and returning the
   unsent proposal to no-stage must serialize the intended result.
2. **High impact; plausible return-path error.** Test unsaved A→B→A with a recorded
   A-stage and with authoritative unassessed A. No same-list clearing or transition
   is accepted. Separately test accepted A→B→A: no old assessment is restored unless
   staff deliberately select an eligible stage. Include concurrent edits and
   retired old stages/withdrawn lists; verify actual history, not only labels.
3. **High impact; plausible races.** Retire a selected target stage, withdraw its
   list, revoke authority or concurrently change the source stage before acceptance.
   No explicit selection silently becomes unassessed. Lose an accepted response,
   make later legitimate work, then retry: exact receipt recovery does not reapply
   an old change or replace a newer draft. These require source/UI integration proof.
4. **Medium impact; known display ambiguity.** Separately test initial no-stage
   intent, loading, read failure, denial, empty search, invalid source catalog and
   a real stage called Not yet assessed. A user and screen reader can distinguish
   every state, identify the result and use the permitted next action. There is no
   second acknowledgment or reason requirement for a valid optional outcome.
5. **Medium impact; shared-control/browser gap.** Exercise keyboard selection and
   return to no-stage, focus on cancellation/error/success, 320 CSS-pixel effective
   width, 200% text size, long translated names, RTL/mixed text, touch/virtual
   keyboards and slow responses. Keep complete labels accessible without hover,
   visible focus unobscured, outcomes meaningful beyond color and status messages
   appropriately exposed. Core's 44px touch convention and semantic tokens apply.
6. **Usability still requires observation.** In the rendered Core flow, ask staff
   to change process while unsure of stage, revise the proposed stage, cancel an
   unsaved detour and return to a historically used list. Before Save they should
   identify the actual result; afterward they should locate current work, Set stage
   and retained history. Record unintended clearing/restoration, confusing options
   and dead ends, then fix those causes. No beauty claim, invented user quote or
   arbitrary pass-rate target follows from the single primitive test.

Paused/closed operations, bulk change, cross-scope moves, historical backdating and
clearing a saved stage without changing lists remain outside D19. Only this
appendix and the adjacent research probe were written; no product code,
configuration, migration, production test or real data was changed.
