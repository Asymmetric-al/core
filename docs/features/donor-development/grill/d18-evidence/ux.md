# D18 evidence — deliberately changing a saved stage list

2026-10-10. **UX recommendation: retain A.** The founder selected deliberate
changes on the same partnership work, preserving its history. Research against
Core HEAD `225c02e9499bd6c0d493223cd4b1a4120ff787e3` and
[Q18](../phase27-q18-changing-saved-list.md). This is a proposed interaction and
qualification boundary, not a shipped screen, final widget specification or user
study. In particular, **the resulting stage policy remains unanswered**.

## Decision and strongest alternative

A allows both correcting a mistaken current list and deliberately adopting a more
appropriate process later. The supporter, identified ministry, continuing purpose
and journey identity stay the same. A different list is not a new partnership,
achievement, donor response or instruction to change giving or follow-up.

The strongest B allows mistake correction but keeps an originally correct process
binding. That makes longitudinal interpretation simpler and avoids some transition
decisions. It also prevents legitimate process evolution unless people falsely
classify it as an error. A better fits the selected flexibility, provided the
before/after meaning and actual historical change remain readable. Neither answer
justifies deleting/recreating work or rewriting old events. No measured agency
frequency or preference supports a quantitative comparison.

Q18 lines 38–40 and 75–92 expressly reserve stage handling and several adjacent
policies. D18 can be accepted while those decisions remain open; **implementation
must not ship an ambiguous stage result**. D13's permission to start unassessed
does not authorize clearing an existing assessment. D16's unsaved dependent-field
reset is not a policy for saved work. Whether an eligible target stage is required,
or whether deliberately becoming unassessed is permitted, needs a subsequent
decision. A same-labelled or same-ranked target stage is not an equivalent stage.

Paused/closed operations, historical corrections, bulk migration and cross-scope
moves are not implied. Do not turn those unknowns into a compulsory migration,
extra role, waiting period, narrative field or permanent prohibition through copy.

## Fresh primary comparison and accessibility evidence

These primary pages were retrieved/read **2026-10-10**. Applications were not
exercised; current documentation is not a deployed-version or usability claim.

| Source                                                                                                                                                                                                                                                                                                                                         | Useful evidence and exact boundary                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [GOV.UK: check answers](https://design-system.service.gov.uk/patterns/check-answers/)                                                                                                                                                                                                                                                          | Shows readable values with specific accessible Change links and preserves information when users return to edit. Its transaction review-page pattern supports inspectable intent; it does not require adding a separate page or confirmation wizard to this short Core change.                         |
| [IBM Carbon: forms](https://www.carbondesignsystem.com/building-blocks/core/patterns/forms)                                                                                                                                                                                                                                                    | Recommends concise labels, field-adjacent error guidance, clear server-error recovery and pending feedback that prevents duplicate submissions. Its layout rules and numeric widget thresholds are not Core mandates; source acceptance is not established by disabling a button.                      |
| [Base UI: Dialog](https://base-ui.com/react/components/dialog)                                                                                                                                                                                                                                                                                 | Documents controlled open state, a form example closing after awaited submission, and final-focus control. This supports separating popup dismissal from acceptance. It does not prove cancellation or receipt recovery. Current docs advertise **1.9.0**; the inspected Core dependency is **1.8.0**. |
| [React: preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)                                                                                                                                                                                                                                                | Keys/type/position can preserve or recreate component state. Remounting because options or defaults changed can discard input. A component reset is not a source rollback or a safe way to resolve a stale saved-list command.                                                                         |
| [WCAG 2.2 Error Prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html)                                                                                                                                                                                                                            | Describes reversible, checked or reviewable/confirmable submissions in its scope, and expressly does not demand a confirmation for every simple record save. Reviewable consequences support this design; WCAG is not a reason for an additional acknowledgment or an unselected Undo feature.         |
| [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Waiting/results/errors need appropriate accessible exposure; sticky UI can obscure focus; narrow effective viewports and usable targets matter. WCAG's 24px minimum has exceptions; Core's touch convention is 44px. These references do not themselves prove accessibility.                           |

## Current reusable source and limits

The exact `base-maia`, Base UI and Zinc semantic-token configuration was rechecked.
Compose shared controls under [`packages/ui/AGENTS.md`](../../../../../packages/ui/AGENTS.md);
do not introduce an app-local picker or alternate design system.

- [`SelectCell`](../../../../../packages/ui/components/shadcn/data-table/cell-variants/select-cell.tsx:38)
  invokes `onValueChange`, closes and calls `onEditComplete` synchronously. Lines
  126–132 display N/A if the current value is absent from the offered options.
  Reusing this callback as “saved” would be insufficient; an excluded old list must
  not look like missing source data. This is a reuse constraint, not a proven defect
  in a particular existing consumer.
- [`SearchableSelect`](../../../../../packages/ui/components/shadcn/searchable-select.tsx:90)
  exposes accessible attributes, but lines 102–105 resolve its selected label from
  current items or use a placeholder. Lines 112–127 contain English search/empty
  strings; lines 104 and 135 truncate text. A selected ID and display fallback are
  not enough to express saved/current, proposed or unavailable data.
- [`TanStack form composition`](../../../../../packages/ui/components/primitives/tanstack-form.tsx:142)
  associates help/error IDs. Lines 531–535 ignore null select callbacks; lines
  640–674 expose pending submit text and disable submission. Those mechanisms do
  not decide saved-stage clearing, freeze accepted intent or reconcile uncertainty.
  Its [existing pending-submit test](../../../../../tests/unit/packages/ui/tanstack-form-accessibility.test.tsx:91)
  was inspected, not rerun; it is a UI contract, not server idempotency proof.
- [`Dialog`](../../../../../packages/ui/components/shadcn/dialog.tsx:44) has
  optional scrolling and a default close control; title/description wrappers appear
  at lines 125–150. A composed short editor may use it, but callers still own its
  pending/dismissal semantics and complete narrow-layout behavior. A dialog is not
  mandatory; inline editing or another Core surface can satisfy the same contract.
- [`SettingsToolbar`](../../../../../apps/admin/features/support-hub/components/settings/SettingsToolbar.tsx:37)
  distinguishes dirty/saved text and disables Save/Discard while saving. The shown
  status is a plain span, not an explicit live status region. A D18 composition
  needs its own accessible truthful result handling; cleanliness alone is not proof
  of acceptance.
- [`Generic table mutation`](../../../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-mutation.ts:89)
  updates by a configurable match column, merges optimistic rows at lines 127–165,
  restores a previous query snapshot at 167–170, and invalidates at 176–178.
  This does not supply a coherent saved-list/stage/history command or protect a
  newer view from an old optimistic rollback. No unsafe deployed P27 caller was
  established by reading the helper.

**Prior proof reused, not rerun:** the dated
[D16 real-selector probe](../d16-evidence/source-probe/README.md), **1/1**, showed
that replacing options leaves the caller's unmatched controlled ID while displaying
a placeholder; it does not rebind by label or clear source state. The
[D17 selector/form probe](../d17-evidence/source-probe/README.md), **4/4 final**,
showed initial-only uncontrolled defaults, preservation of a user-selected identity,
and form-wide untouched/default-update behavior. Its first warning-expectation
failure and correction remain recorded. These ran on Node 24.19.0, Vitest 4.1.4,
React 19.2.3, Base UI 1.8.0 and TanStack Form 1.28.6 in a scoped jsdom harness.
Manifest versions for Vitest/React/Form differ; Bun was unavailable and the earlier
root-config Sentry export failure was not rerun. They prove no saved-list command,
receipt, network race, permission or real-browser flow. No new UI probe was justified
for D18: the new risks are source acceptance and unresolved stage semantics, not
another execution of already observed selector behavior.

## Minimal before/after interaction

On existing work, keep the actual list name and current recorded stage readable
where independently permitted. Otherwise qualify the minimum meaningful current/
effect projection under P12; do not require full protected labels/history or expose
them to make the edit convenient. Hidden metadata is not a missing binding or an
unassessed stage, and an operation without a safe meaningful projection is unavailable.
An authorized **Change stage list** action should be discoverable in that context,
not disguised as changing a stage or the organization's default. Choosing another
process is a normal deliberate operation, so avoid destructive red treatment,
warning walls and approval language.

The smallest reviewable composition has three parts in one place:

1. **Current:** independently permitted saved list/stage or minimum effect context; show unassessed only when actual absence is known and disclosable. Restricted or failed metadata is not absence.
2. **Proposed:** the selected eligible target list, with optional approved guidance
   and actual stage preview. Show the exact prospective stage outcome under the
   forthcoming stage policy, clearly distinguished from the recorded stage.
3. **Action:** one **Change stage list** submission and an ordinary way to discard
   the unsent proposal. A compact consequence such as **History will be kept** can
   help; no acknowledgment checkbox, reason essay or intermediate Apply is needed.

For example, current **Missionary support / Conversation** and proposed
**Church partnerships** make the list change concrete. The form must not invent
the missing after-stage. If the next decision permits staff to choose a target
stage, a reviewed result could show **Church partnerships / Relationship building**
only after that deliberate choice. This is a conditional illustration, not adopted
stage policy or a required tenant vocabulary. A product must never ship a placeholder
such as “stage outcome TBD.” Settle that outcome policy before enabling submission.

Do not select a new target from the usual-list setting or merely because only one
alternative remains: D17 initializes new work, not this saved-work operation.
Showing the current value as current is appropriate. Previewing B does not commit
B. Selecting the existing list alone is no list change and must not manufacture a
transition/history event; this editor must not become an accidental same-list
stage-change shortcut. Clearing an unsent target selection does not clear the
saved binding. A target change within the proposal invalidates incompatible proposed
stage choices without touching the saved assessment.

## Concrete state and recovery requirements

| State                                                                   | Required meaning and next action                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Current data loading/failed                                             | Do not present a proposed value as the saved one. Offer appropriate retry; unavailable source assessment is not “Not yet assessed.” Keep only independently known authorized facts visible.                                                                             |
| Targets loading/failed or search empty                                  | Separate these states. Retry failed options; clear an empty search. Neither erases the known current list/stage or proves the organization has no eligible alternatives.                                                                                                |
| No eligible different target                                            | Explain that no other list is currently available to this user/context. Leave valid existing work usable; offer only an actual permitted repair. Do not force a migration or disclose hidden names/counts.                                                              |
| Current list withdrawn                                                  | Show it as current, with availability context only if relevant. D15 permits continued use; it remains distinct from fresh target options. The editor is optional, not a mandatory replacement prompt.                                                                   |
| Current stage retired or unassessed                                     | Preserve the actual current condition and historical meaning. Target-stage handling follows the future policy; retirement must not turn the old stage into a blank or automatic mapping.                                                                                |
| Target withdrawn, stage retired or permission revoked before acceptance | Revalidate at the source, reject/reconcile incompatible intent and explain a permitted remedy. Keep safe unrelated proposal input. Never silently substitute a default, another target or unassessed result.                                                            |
| Another editor changes list/stage or other relevant source state        | Show a conflict and refresh permitted current facts alongside the preserved safe proposal. Ask for deliberate renewed submission after review; do not auto-retry against a new revision unseen by the user.                                                             |
| Pending                                                                 | Keep the submitted proposal identifiable and stop duplicate dispatch. “Changing stage list…” must not appear as success. Closing the surface does not prove cancellation; provide access to the eventual outcome without implying a new offline/background-job feature. |
| Known rejection                                                         | Show an inline, actionable error and retain safe inputs. Do not claim the entire partnership is unchanged if someone else may have edited it; distinguish this rejected attempt from current source state.                                                              |
| Lost/uncertain response                                                 | Say that the result could not yet be confirmed and reconcile the same attempt. Do not roll back current truth or submit a fresh change merely because a spinner timed out.                                                                                              |
| Accepted                                                                | Show the accepted list/stage outcome with a reachable current-work view. If a list filter removes the row, explain why it left that view and offer a permitted route to it; disappearance is not failure.                                                               |
| Delayed success after newer state                                       | The receipt describes that prior accepted attempt. Do not overwrite newer current data/proposals with it or label its historic result as the current binding. Refresh current authorized state separately.                                                              |

Preserve exact submitted intent across retry; default changes, sorting, renames,
late responses and fresh object instances must not retarget it. Display names may
refresh without changing identity, but conflicting source changes cannot be hidden
behind matching labels. Permission loss may restrict both current detail and the
receipt; a prior render is not continuing authority to expose them.

Before submission, Cancel/Discard can abandon only the proposal. After dispatch,
do not label dismissing a panel as cancellation unless the source actually proves
that result. After acceptance, returning to the previous list is another deliberate
currently authorized change with its own stage outcome and history. Historical use
does not make a now-withdrawn list or retired stage selectable again. A dedicated
Undo feature is not selected; if later offered, it cannot be a blind rollback that
erases an intervening edit or bypasses current eligibility.

## History, accessibility and visual clarity

History should allow an authorized reader to understand that the list changed,
who made the accepted change and when, and the actual before/after meaning under
the eventual stage policy. Keep old assessments associated with their original
context; do not replay them as progress through the new list. Use a neutral
**Stage list changed** event rather than “Promoted,” “Restarted” or “Failed.” A
prospective correction of the current binding does not backdate or erase its
earlier recorded history. Attribution need not require a compulsory motive selector.

Prefer one clear reading order: current context, proposed choice, consequence,
action. On narrow layouts stack those parts; do not require side-by-side comparison
or horizontal panning. Full long/localized names must remain obtainable without
hover. Distinguish coincident labels using permitted list/stage context, not raw
UUIDs or hidden catalog details. Preserve D13's distinction between a real tenant
stage named “Not yet assessed” and the system's no-recorded-stage condition.

Keep shared semantic tokens, appropriate text contrast, focus indicators and Core
touch targets. If a dialog is used, expose its title/description, operate the
nested selector by keyboard, return focus sensibly and avoid trapping the user in
unresolvable pending state. Sticky actions and virtual keyboards must not obscure
the focused field or recovery control. Announce meaningful pending/result/error
states without turning every option preview into a disruptive alert. Keep text
and semantics sufficient without color or animation; respect reduced motion and
test mixed RTL/LTR names and translated action/error strings.

## Proposed acceptance proof and priority

These are falsifiable release requirements, not passed product tests. Severity
and likelihood are prospective judgments; no real incident rate was measured.

- **High impact; plausible reuse error — stage meaning.** With assessed, unassessed
  and retired-stage source fixtures, choose targets with same-labelled stages and
  targets with different stages. Assert current state remains unchanged while
  drafting and the reviewed final pair exactly follows the subsequently ratified
  stage policy. No name/order mapping, automatic clearing or invented progress.
- **High impact; plausible concurrent use — stale and uncertain results.** Exercise
  a concurrent stage change, another list change, an A→B→A intervening sequence,
  target withdrawal and lost response. Assert source acceptance/history/receipt
  coherence and visible conflict/recovery. Replaying the original successful
  request after newer work returns its historical outcome without changing current
  truth. Test older replies against a newer open draft, not only database rows.
- **High impact; plausible permission change — safe recovery.** Revoke source or
  target access after rendering. Verify both source rejection and safe current/
  history/result projection; no cached hidden names or invented access workflow.
  Test actual callers, not only hiding the change action.
- **Medium impact; common state ambiguity — usable next actions.** Independently
  exercise current-read error, options error, no search match, no alternative,
  withdrawn current list, target withdrawn mid-edit, known rejection and unresolved
  outcome. Every state has its truthful permitted next action. Cancelling an unsent
  proposal writes no event; same-list selection creates no fake transition. A
  successful change leaving the current filter remains discoverable and understood.
- **Medium impact; known shared-control seams — browser accessibility.** At 320
  CSS-pixel effective width and 200% text size, test long names, translated text,
  RTL, touch/virtual keyboard and slow responses. Verify readable current/proposed
  values, full-name access, keyboard selection/dismissal, focus return, non-obscured
  controls and screen-reader result/error feedback. A jsdom pass or screenshot
  alone does not satisfy this criterion.
- **UX quality remains unproved.** In the implemented Core flow, ask representative
  staff to correct a mistaken list and adopt a different suitable process, then
  explain what will change, what remains current before acceptance and where to
  find the result/history. Include a conflict and a filtered-out success. Record
  mistaken stage assumptions, accidental submissions and dead ends; refine their
  concrete causes. Do not infer beauty, clarity or a numerical success rate from
  this document. No extra wizard or acknowledgment is presumed necessary.

Only this evidence appendix was written for the UX review. No new test, application
code, product configuration, migration or real data was changed.
