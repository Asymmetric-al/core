# D17 evidence — a clear, changeable starting list

2026-10-10. **UX recommendation: retain A**, as selected in the interview after
[Q17](../phase27-q17-initial-list-choice.md). Research against Core HEAD
`225c02e9499bd6c0d493223cd4b1a4120ff787e3`. This appendix proposes precise
interaction requirements and future acceptance proof; it does not establish
implemented P27 behavior or measured staff preferences.

## Policy and strongest alternative

When no valid list is already established, visibly prefill the sole eligible list.
With multiple eligible lists, prefill the organization's optional usual list only
if it is currently eligible and permitted; otherwise ask staff to choose. Preserve
the selected name and the opportunity to change it before the normal deliberate
start. A prefill does not select a stage, admit a journey, create follow-up or
contact anyone. D13's optional assessment remains separate.

The strongest B has the same sole-option behavior but requires a choice whenever
multiple options exist. It reduces the chance that staff overlook a mismatched
preselection, especially for mixed processes, at the cost of repeated selection.
A can serve that situation by leaving the usual list unset. An optional default
and a legible chosen value are a simpler answer than per-team, Party-type, surface,
personal-history or AI defaults. No actual error rate was measured. Saved-choice
correction remains a separate decision; do not make a mistaken draft permanent
by hiding its list, or invent a saved-list switching facility here.

## Current primary documentation and source limits

The following primary sources were retrieved/read **2026-10-10**. Current website
documentation is not proof of the exact installed or deployed version.

| Primary source                                                                                                                                                                                                                                                                                                                                                                                                                                     | Relevant fact and limit                                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Base UI Combobox](https://base-ui.com/react/components/combobox)                                                                                                                                                                                                                                                                                                                                                                                  | Describes `defaultValue` as the uncontrolled selection on initial render and `value` as controlled selection. Stable IDs preserve matching when refetched objects change. The current documentation advertises Base UI **1.9.0**; Core's installed/manifest version is **1.8.0**. The local probe, not the newer documentation alone, establishes the observed mechanics. |
| [Base UI forms](https://base-ui.com/react/handbook/forms)                                                                                                                                                                                                                                                                                                                                                                                          | Distinguishes labels for input controls from trigger-based controls and supplies description/error relationships. These support a readable selected value with correctly associated guidance; integration examples do not implement Core admission or source authorization.                                                                                               |
| [React select reference](https://react.dev/reference/react-dom/components/select)                                                                                                                                                                                                                                                                                                                                                                  | Distinguishes initial uncontrolled defaults from controlled current values and warns against switching modes. Native selects also select their first option unless handled otherwise. This is not authority to select the first approved list or to replace Core's Base UI primitive.                                                                                     |
| [TanStack Form async initial values](https://tanstack.com/form/latest/docs/framework/react/guides/async-initial-values)                                                                                                                                                                                                                                                                                                                            | Its current v1 guide combines query data with form defaults and a loading state. The basic example does not decide D17's established-draft, delayed response or immutable submission rules. Installed React Form/core **1.28.6** differs from Core's requested **1.33.5**.                                                                                                |
| [React preserving/resetting state](https://react.dev/learn/preserving-and-resetting-state)                                                                                                                                                                                                                                                                                                                                                         | Component position/type/key govern state preservation. Remounting to force a new default can also destroy local input; a changing default is not a reason to indiscriminately key-reset the whole draft.                                                                                                                                                                  |
| [WCAG 2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html), [Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), [Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Support predictable input behavior, avoiding redundant information entry, readable labels/values and accessible asynchronous feedback. They do not require a prefill acknowledgment, an extra Apply step or automatic admission.                                                                                                                                          |

The shared [`SearchableSelect`](../../../../../packages/ui/components/shadcn/searchable-select.tsx:28)
forwards `value`, `defaultValue` and callbacks. Lines 73–79 derive stable identities;
lines 102–105 resolve the visible name from current options or show a placeholder.
That fallback cannot distinguish loading, stale values, explicit clearing or source
absence. Lines 112–127 include constructed/hardcoded English strings; lines 104 and
135 truncate names. Default selection alone does not resolve localization and
complete-name access. D16's prior options-replacement proof remains applicable and
was not rerun.

Core's [`form select`](../../../../../packages/ui/components/primitives/tanstack-form.tsx:531)
ignores a null callback and passes the controlled field value. This is an existing
consumer policy, not a D17 clear operation. The same file's lines 640–674 provide
pending submit labeling and disable the submit control; lines 705–721 compose the
real TanStack hook. Those conveniences do not freeze a command payload or reconcile
a lost response. The existing
[`pending-submit test`](../../../../../tests/unit/packages/ui/tanstack-form-accessibility.test.tsx:91)
asserts suppression of duplicate UI submissions; it was inspected, not rerun, and
cannot prove server idempotency.

**New, bounded proof: 4/4 checks passed** in the
[actual selector/form probe](source-probe/README.md):

- A late uncontrolled `defaultValue` does not initialize an unresolved selector.
- An initial prefill is visible without a change callback; staff can select another
  item, and subsequent default/options refresh preserves that identity.
- Changed `defaultValues` replace an untouched value in the real `useAsymForm` hook.
- Touching an unrelated field suppresses that form-wide defaults update, leaving
  a missing choice unresolved even when a new default arrives.

Installed form-core `src/FormApi.ts:1479–1502` gates changed defaults on the
whole form's `!isTouched`; `:1523–1542` explicitly resets values and field metadata.
Exact installed paths/hashes are in the probe metadata. This is useful library
behavior, but neither a frozen visible proposal nor a reliable per-list initializer.
No P27-specific command was proved. The final run used Node 24.19.0, Vitest 4.1.4,
React 19.2.3, Base UI 1.8.0 and TanStack 1.28.6, with a scoped harness because of
the earlier root-config Sentry export failure. Bun is unavailable. The manifests
request newer Vitest/React/Form versions. The probe records an initial warning-
expectation failure and its correction; it is not a clean first-attempt claim or
an application fix. No real browser, network, source authorization or P27 flow was
tested.

## Minimal everyday and configuration experience

Keep the existing Core `base-maia` hierarchy and shared controls. In the ordinary
start context, show **Stage list** and its selected readable name, next to the
separate optional **Stage**. With a prefill, the selected value should look selected,
not like placeholder text. With no eligible default among multiple choices, use
**Choose a stage list**. With one proven eligible option, show it selected without
requiring a redundant opening, checkmark click or confirmation. Do not offer a
change control that implies unavailable alternatives.

Give the normal list control an obvious way to choose another eligible list when
there is a choice. Keep D16's optional purpose guidance and stage preview available
without putting them between every user and Start. The visible name ordinarily
does most of the work; one short explanatory line can help when needed. Avoid a
stack of “Suggested,” “Default,” “Prefilled,” “Approved” and “Selected” badges.
If an origin/current-default hint is shown, make its meaning accurate: a choice
originally prefilled from A remains A when the organization's usual list becomes B,
but must not falsely claim that A is still the current default. Do not interrupt
staff just because that configuration changed.

For an authorized configurator, a concise **Default for new work** choice with
**None** is sufficient within the existing catalog settings. Explain that staff
can change the prefilled choice, and that None asks them to choose when several
lists are eligible. None does not suppress the sole-option policy. Do not require
a default, auto-enable one on list creation/restoration or add a justification
field. Show saved versus unsaved/pending configuration truthfully. Withdrawing the
matching default should state that its default selection will also be removed;
the ordinary action need not demand a replacement. No new configuration privilege
or public visibility follows from this control.

## Draft ownership and timing requirements

1. **Resolve a proposal only for a pristine missing list.** Use authoritative
   eligibility/cardinality and the optional eligible default in the actual scope.
   This can be a source-resolved result; it does not require downloading/rendering
   every option. One search result, first page, failed fetch or hidden option is
   not evidence that there is exactly one eligible choice.
2. **Establish the visible choice once.** A resolved prefill becomes the draft's
   selected identity. Later option/default refresh must not replace it while it
   remains eligible, even if the user has not touched that field. New alternatives
   may be shown. Conversely, edits to an unrelated note must not prevent safe
   initial resolution of a still-pristine list. Neither a truthy-value fallback
   on every render nor whole-form dirty state expresses these rules.
3. **Respect explicit staff intent.** Preserve a changed list. If the eventual
   control supports clearing, distinguish that deliberate empty draft from one
   never initialized and do not refill it on refetch. This does not require adding
   a Clear button, make a list optional at admission or clear a saved binding.
   Search text clearing is not list-selection clearing.
4. **Apply D16 on intentional list changes.** A stage from the former list must
   not silently accompany the new list or be rebound by label. Explain the visible
   dependent draft reset, leaving assessment optional. A late default response
   cannot initiate this stage reset. Source invalidation must instead reconcile
   the explicit intent, not silently downgrade it to an unassessed admission.
5. **Bind the normal submitted intent.** Snapshot the selected list and optional
   stage actually presented for Start. Changing configuration after that point
   cannot retarget the command, group members or retry. Validate current admission
   eligibility independently. Disable or clearly separate changes to an in-flight
   attempt; a later edited draft must not silently mutate its request/receipt.
   These are observable requirements, not a mandated client state-machine schema.

## Honest states and recovery

| Situation                                                      | What staff should see and be able to do                                                                                                                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proposal/options still loading                                 | A localized loading state, no guessed list. Preserve authorized known information. A late result may initialize only the still-pristine missing list.                                                                              |
| Default lookup failed; choices independently known             | Distinguish lookup failure from a known-unset default. Permit deliberate choice from independently validated available options; an optional convenience failure must not unnecessarily block valid admission.                      |
| Multiple choices; usual list unset, withdrawn or not permitted | Ask for a choice without revealing a hidden default's name or existence. Do not silently take the first list. A separately proven sole eligible option still follows A.                                                            |
| Authoritatively zero eligible choices                          | Follow D15's legitimate zero-new-use state and actual permitted repair. Do not use a withdrawn default, an unassessed stage or a synthetic list as a substitute. Existing work remains usable under its rules.                     |
| Options error or search has no matches                         | Provide retry or clear-search respectively. Neither means the source catalog has no choices; neither automatically clears an independently known authorized selection.                                                             |
| Selected identity renamed                                      | Refresh its permitted readable name without changing its identity or assessment. Support full-name access despite truncation.                                                                                                      |
| Selected list loses eligibility/access or scope changes        | Prevent invalid admission and reconcile current permitted options. Preserve safe unrelated input. Do not silently replace the established choice with the new sole/default list or reveal withdrawn access details.                |
| Response lost or a newer draft exists                          | Distinguish unresolved acceptance from failure; reconcile the original intent/receipt. Do not create again using today's default. An old response must not overwrite a newer draft's controls or misstate which attempt succeeded. |

For reviewed groups, make common selected intent readable and exceptions inspectable
without repeating unnecessary questions. Bind each reviewed member's actual choice;
default changes during execution cannot alter later members. Preserve D4's separate
accepted/reused/rejected/unresolved outcomes and deliberate retry. Existing-journey
reuse keeps its source list even if the new draft's prefill differs.

## Falsifiable acceptance and remaining UX proof

These are release criteria, not reported product passes. Severity/likelihood are
prospective engineering judgments, not observed incident rates.

- **High impact, plausible generic-form reuse:** open with sole A or usual A, then
  change the configured default and refresh options before touching the field.
  The visible/submitted choice remains A if eligible. Repeat after choosing B,
  editing an unrelated field, and explicitly clearing if supported. Inject delayed
  responses in both orders; no late response replaces established intent or binds
  an incompatible stage. Check actual requests and accepted source values.
- **High impact, plausible race:** submit reviewed A, change the default to B and
  lose the response. Recovery identifies A's original attempt and no duplicate or
  B-retargeted admission occurs. Separately withdraw A before acceptance: the
  authoritative boundary rejects/reconciles it rather than using B. Repeat with
  group members and existing-journey reuse; primitive tests cannot supply this proof.
- **Medium impact, common loading ambiguity:** exercise complete one/many/zero
  source choices, partial pages, search narrowing, unset versus failed default
  reads, restricted defaults, renames and scope changes. Each yields the precise
  state above, with safe permitted recovery. A default-fetch failure does not block
  an independently valid manual choice; one displayed result does not prove sole
  eligibility. Correct hints do not linger after their supporting fact changes.
- **Medium impact, real shared-control seams:** keyboard and screen-reader tests
  identify the visible selected name and distinct optional stage, allow changing
  the list, expose material loading/error/reset/pending outcomes and preserve
  logical focus. At 320 CSS-pixel effective width and 200% text size, long localized
  names remain obtainable and essential controls remain usable. Test RTL/mixed
  scripts, touch and slow responses; use Core's target/semantic-token conventions.
  No hover-only explanation, color-only choice or invisible default is acceptable.
- **UX judgment, not yet validated:** in a real rendered Core pilot, give staff
  routine work, a church-supporting-a-missionary overlap, a different intended
  process and missing defaults. Before submission, they should correctly identify
  the chosen list, explain how to change it and understand that no stage/work has
  yet been recorded. Record mistaken defaults, accidental stages and dead ends;
  revise their causes. No compulsory acknowledgment or added wizard is the default
  remedy. Judge visual hierarchy, spacing and action clarity at mobile and desktop
  sizes; four source checks cannot establish an intuitive or beautiful experience.

Only this appendix and adjacent research evidence were written. Application code,
dependencies, migrations, configuration and real data were not changed.
