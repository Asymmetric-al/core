# Phase 26 D3 — Staff work-status UX blueprint

Founder-ratified interaction and visual direction accompanying the [D3 adversarial review](phase26-d3-adversarial-review.md). The founder selected four work meanings. The founder ratified this blueprint and all D3 review amendments on 10 September 2026. This is a documented design, not an implemented UI or a claim of tested usability/accessibility.

## The experience

Staff should understand the conversation's next responsibility at a glance, change it in one familiar control, and continue working without losing their place. The visual hierarchy puts the request and people first, then work status/assignment, then follow-up time and other tools. The design uses Core's existing base-maia/Base UI system and semantic tokens; it adds no visual system or navigation product.

The ordinary interaction is **open the status picker → choose one of four meanings**. There is no required reason form, extra save button or confirmation modal on every change. Server confirmation, pending/conflict feedback and safe correction make this small interaction dependable. A status edit never sends an email or changes reply recipients.

## Four labels, one selection

| Label                     | Short description inside the menu              | Everyday example                                                              |
| ------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------- |
| **Open**                  | Ready for the next support step                | Maria needs to investigate or review Sarah's new reply.                       |
| **Waiting for requester** | Need input from the people asking for help     | Sarah or an admitted participant needs to identify the gift.                  |
| **Waiting on our side**   | Waiting for a colleague, team or outside party | Maria has requested a Finance check and awaits its result.                    |
| **Resolved**              | Support work is complete                       | Maria has completed the support obligation without hiding promised follow-up. |

“Our side” describes who is responsible for obtaining the next input; an outside party is not thereby a tenant member. Optional progress updates remain possible while waiting. Open takes precedence when a substantive next step or due follow-up is owed; otherwise an active our-side blocker takes precedence over simultaneous requester input. Existing notes and authorized owner links explain extra context without a fifth Mixed label.

Use stable sentence case, readable shared typography, a small familiar icon and an explicit selection indicator. The selected option is exposed programmatically using the shared menu's radio/selection semantics, not only a drawn checkmark. Descriptions appear in the menu, not as permanent instructions around the conversation.

## Desktop composition

This schematic shows information order; spacing, typography, surfaces and control geometry come from Core's shared system. It is not a pixel specification or an interactive prototype.

```text
Receipt question                                           [More …] [Close detail]
Sarah Chen · sarah@example.invalid

[ Waiting on our side ▾ ]  [ Assigned to Maria ▾ ]  [ Follow up 11 Sep, 09:00 ▾ ]
                                                    Time zone: Asia/Bangkok
─────────────────────────────────────────────────────────────────────────────
Conversation                                         Relevant CRM context
                                                     (authorized information)
Sarah: I have identified the gift.                    View related record ↗
Maria: I am checking with our finance team.

Work history: Maria changed status to Waiting on our side.
─────────────────────────────────────────────────────────────────────────────
[ Reply all ▾ ]       To: Sarah <sarah@example.invalid>
                     Cc: James <james@example.invalid>

Draft text stays here when status, views or authorized CRM context change.
                                                          [Send]
```

The date/time is an illustrative explicit staff selection, not an adopted 09:00 preset. The large-screen arrangement may place CRM context beside the conversation using existing surfaces. A narrow viewport puts secondary context behind an accessible disclosure and returns to the same conversation/draft. It does not hide the current status or external audience.

The header has one primary work picker. Replace repeated raw-status breadcrumbs and competing status representations with this single visible current value. Close detail remains clearly labelled navigation. Keep less-used macros, labels and administrative actions in the existing secondary tools. D3 does not dictate a default combined Send-and-status workflow; any later such action must clearly name and qualify both effects.

## Visual craft

- **Hierarchy:** a readable subject and participant identity, one compact row of work controls, then conversation content. Avoid uppercase microtext as the main status label, repeated badges and nested card borders around every fact.
- **Color:** use existing semantic tokens in both themes. Most interface chrome remains quiet. Both Waiting states belong to the same calm family; their text/icons distinguish them. Ordinary waiting is not a warning or error. Stronger attention styling belongs to actual due/recovery conditions and still includes text.
- **Shape and spacing:** preserve base-maia radii, spacing, density variants and shared button/menu geometry. Do not shrink touch targets to make longer labels fit. Allow descriptions and translations to wrap rather than inventing cryptic abbreviations.
- **Motion:** routine high-frequency status selection stays immediate. Any shared popup/feedback motion uses Core tokens and reduced-motion handling. Do not animate rows away, bounce badges or move the next target beneath a pointer to make the interface appear lively.
- **Stability:** reserve enough control space for pending feedback and use existing tabular-number treatment for changing counts. Preserve subject/draft layout while an update is in flight. Do not replace failed data with a confident Open or a zero count.

Core's global coarse-pointer rules already provide a 44px minimum height; local h-8 classes alone do not prove touch-height failure. Effective width, spacing, overlap and browser behavior still require measurement. Core's recommended larger touch token may be appropriate where available space permits. No new hardcoded palette or global sizing changes are proposed.

## Queue behavior

The inbox row shows the same work label as detail. Assignment/unread indicators retain their separate existing purposes. Show a scheduled follow-up or actual failure cue only when relevant; do not surround every row with empty metadata badges.

Provide discoverable **All unfinished** and status-filtered views, including both waiting meanings. Unassigned and due/recovery entry points remain visible and use complete authorized data. This does not require four permanent board columns, a new dashboard or a replacement for Mission Control navigation.

Changing a selected item's status updates filtered membership and counts after confirmation. The detail pane stays on the same conversation with its draft and focus intact. If it no longer belongs in the list, a quiet message can say **“Now in Waiting on our side”**, with a link to that view. The row is not falsely left as a matching result, and another person's conversation does not suddenly replace the open draft.

**Next** is explicit. It uses a stable queue anchor and conversation ID, not a mutable array index. Incoming rows, another worker's status update or background refresh cannot retarget a pending click. Active recovery remains discoverable through a visible recovery/due entry or indicator independent of the selected filter; nonmatching recovery items are not injected into a filtered Waiting list.

## Follow-up interaction

Keep **Remind…** separate from work status. If a reminder exists, the control shows its actual local date/time; accessible detail exposes the zone and exact instant. Choose an explicit time through shared date/time controls. Relative-duration actions say “In 1 hour”; calendar actions resolve a displayed wall-clock value rather than adding a fixed number of hours.

Scheduling preserves the current status. A waiting-side-only change preserves the reminder. Explicit Open clears deferral, including Open→Open; Resolve cancels the active reminder. On resolved work, the action is explicitly **Reopen and remind**, or staff reopen before scheduling—there is no hidden future timer on a supposedly finished request.

When the current reminder is processed at or after its due instant, the conversation becomes **Open** with **Follow-up due** context and the prior waiting reason in history. This means staff should review/follow up. It does not say Sarah replied or Finance finished. Preserve the original scheduled due time and expose any actual processing delay. A reminder that fires early remains durably pending for its actual due instant; obsolete callbacks do not change the screen or create another notification.

Reminder preset defaults, mandatory follow-up timing and SLA pause policy are separate founder choices. Nothing in this blueprint silently chooses them.

## Feedback and correction

| Situation                      | Visible behavior and copy                                                                                                                                                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status change in flight        | Show the chosen action as pending at the control, for example **“Changing status…”**. Keep reading/composition available; prevent competing status submissions locally while the server still enforces idempotency. Do not remove the row as completed before acceptance. |
| Confirmed success              | Show the canonical value and a concise accessible confirmation, e.g. **“Waiting on our side”**. Keep focus on the status control; no navigation or full-pane reload.                                                                                                      |
| Definite rejection             | Show **“Status wasn’t changed”** with the qualified reason and current authorized state. Retain the draft and provide a nearby retry/review action.                                                                                                                       |
| Ambiguous response             | Show **“Couldn’t confirm the status change. Checking…”** and reconcile the original command. Do not promise that the old value is unchanged if the update may have committed.                                                                                             |
| Newer work conflicts           | Show **“This conversation changed. Review the latest update.”** Preserve the draft and display the current higher-revision state. A successful old operation result is not the current state.                                                                             |
| Access revoked                 | Follow shared access handling, remove restricted content and offer a safe return path. No leaked title, person or owner-action detail appears in the error.                                                                                                               |
| Safe status correction         | Offer **Undo** only for a still-reversible status/reminder operation. Apply a new authorized conditional correction with history. Never erase events, recall mail or reverse financial work.                                                                              |
| Undo encounters later work     | Keep the newer state and say it changed; offer current review. Do not overwrite a new reply, timer wake, classification or owner result.                                                                                                                                  |
| Undo restores a prior reminder | Re-arm with a new generation if still future. If now due, open for follow-up and explain that the reminder is due. Do not resurrect an obsolete callback.                                                                                                                 |

Important errors and correction access remain available after transient feedback disappears. A toast alone is insufficient. Lower-revision same-conversation responses and old-tenant responses cannot overwrite a newer UI/cache snapshot. A refresh fetches current authorized state separately from the original command receipt.

## Bulk and alternate controls

Existing bulk, keyboard and board entry points retain the same work rules and side-effect boundaries. A drag action has a visible nondrag alternative. Shortcuts are scoped to the active surface and inactive while typing/composing/using IME as appropriate; a shortcut named “Open reminder picker” opens the picker rather than silently selecting a day.

Bulk feedback uses exact selected IDs and per-item outcomes. For a synthetic four-item example: **“2 updated · 1 changed since selection · 1 unavailable”**, with permitted details and targeted recovery. Do not expose forbidden record names, retry successful items or pretend Stop reverses completed work. The existing partial-success counts are useful; add correlated identities for the unresolved items rather than replacing them with an all-or-nothing claim.

Ordinary single-record status edits need no blanket confirmation. Existing consequential move/private-content disclosures remain governed by D1/D2 and their applicable flow; D3 does not remove those safeguards.

## CRM continuity and privacy

The support worker can see permitted context beside the request and follow an authorized link without losing the selected conversation, filter or draft. The owner surface authorizes each action. The Support label does not make a receipt accessible, authorize a refund, verify a represented organization or grant care access.

The currently awaited owner action can supply a safe result signal that opens Support review; it does not complete Support automatically. If the target becomes restricted, unlinked, deleted or merged, retain permitted historical linkage and a safe unavailable indication instead of claiming completion. Avoid sensitive team/missionary/care details in general waiting descriptions or notifications. Optional internal notes follow the conversation's actual access policy and are never added to the external reply.

## Accessibility and resilience acceptance

- The shared picker exposes its name, expanded state and selected value. Enter/Space, arrow navigation and Escape behave consistently; focus returns to the initiating control. The current option is not conveyed only through color or a decorative checkmark.
- Screen readers announce meaningful confirmation/failure without repeatedly reading every live queue-count change. Inline error relationships remain available; status messages use the appropriate shared live feedback.
- At 320 CSS-pixel reflow and 200% text zoom, the header wraps without covering the subject, status, recipient controls or keyboard focus. Long translations and right-to-left names do not scramble left-to-right email addresses.
- Touch can inspect/change status, reminders and authorized context without hover; targets respect existing shared coarse-pointer sizing and do not overlap. Opening a status menu does not summon the mobile keyboard unnecessarily.
- Sticky composer/header elements do not obscure focused controls. Focus remains stable when the item leaves a filter, a menu closes or the worker returns from CRM.
- Both themes retain text/nontext contrast. Reduced motion disables unnecessary transition effects. The UI stays usable during slow/offline recovery, loading, empty, forbidden and partial-failure states.
- Data that is unavailable does not appear as a made-up status or complete zero count. A pending operation cannot mutate another tenant's cached conversation.

Actual browser, assistive-technology and representative staff task tests are required to prove these outcomes. Automated axe checks alone cannot establish usability, semantic clarity, focus quality or complete WCAG conformance.

## Research supporting the design

This design uses documented header/status/context patterns and deliberate navigation from [Front](https://help.front.com/en/articles/2134), [Help Scout](https://docs.helpscout.com/article/11-understand-conversation-icons-and-colors) and [HubSpot Help Desk](https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk), with the simpler alternatives and vendor-specific limits in the main review. [Zendesk's waiting distinction](https://support.zendesk.com/hc/en-us/articles/4408843029658-About-open-vs-pending-and-on-hold-tickets) informs semantics, not an enterprise feature checklist.

Interaction behavior uses existing Core primitives, supported by [Base UI radio menu items](https://base-ui.com/react/components/menu), [WAI-ARIA menu-button guidance](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/), [WCAG status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [focus-not-obscured guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html). Source/version qualifications, independent critiques and proof limits are in [D3 evidence](phase26-d3-evidence.md).
