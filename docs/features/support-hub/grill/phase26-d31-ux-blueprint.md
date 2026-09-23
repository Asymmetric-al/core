# D31 — Follow-up time chooser UX

**Fully founder-ratified, 13 September 2026.** D31 A and every amendment, addition, adjustment, change and update are accepted in full. D1–D31 remain fully ratified. Earlier selected/proposed/pending/no-Q32 passages are preserved historical evidence and create no repeat ratification gate. The full ratification appendix below supersedes their status only; all substantive requirements and proof limits remain intact.

**Historical opening (superseded status, preserved substance):** **A selected; detailed design amendments proposed, 13 September 2026.** The [corrected decision and R01–R24](phase26-d31-adversarial-review.md) govern this blueprint. It describes intended behavior, not a running prototype or completed usability test.

## Job and entry

Maya is handling an inquiry for a tenant's donor-care team. She needs to check it again after receiving information. This is an illustrative task to test the experience, not a claim about all ministries' work hours or donor processes. She already has the conversation open, possibly from its CRM record, and may have an unsent reply.

Use the visible **Follow up** control alongside existing status/assignment. A clock icon can support the label, never replace it. With an accepted reminder, show **Follow up · Mon, 14 Sep, 14:30** and its timezone detail in the opened control. Use the same component and command from CRM-entered Support detail; viewing the CRM record does not itself grant access. The label is an internal work reminder, not a promise to send an email.

One compact popover is appropriate on a desktop. The title is **Set follow-up** or **Change follow-up**. Display the timezone once above the list, with **Change** available; display an offset per row where the target offset differs or is needed for clarity. Each row's accessible name includes its full actual date/time/zone. The shared layout wraps long text rather than truncating essential timing.

An example at Sunday, 13 September 2026, 14:30 in Bangkok:

| Choice                | Actual result shown before activation |
| --------------------- | ------------------------------------- |
| In 1 hour             | Sun, 13 Sep 2026 · 15:30              |
| In 4 hours            | Sun, 13 Sep 2026 · 18:30              |
| Tomorrow at 14:30     | Mon, 14 Sep 2026 · 14:30              |
| In 1 week at 14:30    | Sun, 20 Sep 2026 · 14:30              |
| Choose date and time… | Opens Custom                          |

The common zone line reads **Bangkok · UTC+07:00**, mapped to `Asia/Bangkok`; the IANA identifier is available without hover in the zone control. The example intentionally includes Sunday: a week is seven local dates, not the next presumed business week. Exact formatting follows the active locale; dates never rely on ambiguous slash notation alone. The operational noun remains Support Hub; this does not create a new Support Studio domain.

## Quick journey, step by step

1. **Open.** Load the authorized current reminder and trusted reference needed for exact offers. Keep the conversation, recipients, draft, filters and return path intact. If a save is still of unknown outcome, show reconciliation instead of treating the record as unscheduled.
2. **Read.** Show four resolved choices and Custom. The visible zone initially uses the tenant's valid default. Staff can deliberately change it for this use. No hidden browser/requester/location inference occurs.
3. **Choose.** Click or keyboard-activate a row once. Its exact displayed instant is the intended mutation; no second modal or separate Save button appears for a normal quick choice. Hover/focus performs no write. If the row needs DST disambiguation, its action says **Review time** and opens the focused Custom state instead.
4. **Save.** Show one pending action with appropriate accessible status and prevent duplicate local intention. Actual duplicate protection is the command receipt, not the disabled button. Keep the old accepted reminder authoritative until the server admits replacement.
5. **Return.** Show **Follow-up set for Mon, 14 Sep at 14:30 · Bangkok**. Keep the accepted value persistently accessible in detail. If the conversation no longer belongs to the current queue, say so without unexpectedly closing the detail or jumping to another record.

The common path is two deliberate activations from detail: open, select. This is a designed interaction count, not measured completion time. A placeholder, loading row or unverified browser calculation must not pretend to be the exact server-qualified result.

Quick offers remain bound to their original reference. Do not recalculate under the pointer or while a screen reader is reading. When wording ages, show **1 hour from 14:30**, or an actual weekday/date after rollover; offer **Refresh choices**. An explicitly reviewed future Custom/absolute candidate does not expire after an arbitrary minute. Past or contradictory values are corrected in place. Refresh makes new offers; retry preserves the original candidate.

## Custom journey, step by step

1. **Open the same focused surface.** Choose date and time replaces the list with the form, with Back returning to the list without mutation. It does not create stacked modals or another composer.
2. **Date.** Use the existing shared calendar and a labelled directly editable date field. A new Custom value begins on today's date in the chosen zone; month/year navigation and text entry avoid endless calendar paging. An explicit candidate or existing reminder takes precedence over this initial date.
3. **Time.** Start empty for a fresh Custom value. A clearly labelled time input supports typing and the locale's 12/24-hour convention. The person supplies the intended minute. Do not default to midnight, nine or an unselected hidden hour. The field's selected value, not mere focus, controls the candidate.
4. **Timezone.** Keep the named zone visible beside/below these fields. Change is available through searchable zone selection; search by a supported city/name, and display the IANA identity when names could be confused. Result offsets are computed for the chosen date, not today's date. Within Custom, changing the zone keeps the entered date/time and resolves a new candidate in that zone. Show the changed result, including old/new values when editing. Nothing changes until Set/Update. A read-only display-zone change outside this form merely converts the same instant.
5. **Review in place.** Show the full combined result immediately below valid inputs: **Follow up Monday, 14 September 2026 at 09:15 · New York (UTC−04:00)**. No internal implementation details are shown. If the time has two possible offsets, require the explicit occurrence choice here. If it does not exist, retain it and offer valid nearby times or manual correction; none is pre-committed.
6. **Set follow-up.** The one primary action saves that exact candidate through the shared command. Selecting a calendar day, changing a month or choosing a zone never saves. Cancel/Escape returns without changes before submission. Errors preserve values and focus; accepted-but-unknown outcomes reconcile the command identity.

New values are minute-granular. Existing reminders may have seconds: merely opening the form never rewrites them. While an old value remains unchanged, display its exact seconds in the existing-value detail and keep Update inactive. Deliberately changing its date, time or input zone creates a new minute-granular replacement; show old/new exact values before Update, including the original seconds. Cancel preserves the accepted original. Saved provenance distinguishes original input from present-day display.

## Edit, remove and work now

Open the accepted reminder to inspect **Current follow-up**, its actual time, zone and permitted author/history. The same surface offers quick replacement choices, **Change date and time**, and **Remove reminder**. Editing starts from the original instant/recorded zone; a later tenant-zone change does not shift it.

Remove reminder conditionally cancels the current generation and removes deferral. It preserves the work status and does not cancel a CRM task, send an email or remove due review already admitted. A stale remove cannot delete a newer replacement. Staff use the existing **Open / Work now** action when they mean to return to active review now. Those two intentions have distinct labels and effects.

No destructive-style full-screen confirmation is needed for this reversible reminder cancellation. Show the admitted result and retain the normal correction path. Do not provide a fake Undo that restores an old generation after intervening input, expiry or another staff member's edit.

Resolved work requires explicit reopening. The control explains **Reopen this conversation to set a follow-up** and links to the existing authorized status action; an already-qualified, explicitly reviewed **Reopen and remind** action remains permitted under D3. The chooser never hides a timer on resolved work and adds no new compound command or Reopen-and-send operation.

## Returning through CRM and working with another person

Maya can enter the same Support detail from an authorized CRM Support list, review the reminder, make an authorized change and return to the originating CRM record. There is one due instant and one Support history. No copied CRM task or Activity event is generated merely by this action.

Another authorized worker sees the same reminder; its creator does not acquire exclusive ownership. If that worker changes it while Maya edits, Maya receives a focused conflict showing the currently authorized value. Her proposed input is retained for an explicit new decision; it does not automatically overwrite the newer value. Replayed older receipts remain receipts, not current state.

A CRM person merge does not move a reminder onto a new person record or create a second one. A Support conversation merge must retain D10's explicit resulting reminder plan; competing reminders are not silently reduced to earliest/latest. Unlinking a CRM association does not cancel Support work, and access revocation removes unauthorized context immediately on subsequent authorized reads/actions.

## Other accepted entry points

The existing keyboard or command-palette action opens this chooser on the explicit target, rather than applying an invisible twenty-four-hour value. Global shortcuts respect text-input focus, especially TipTap. Datepicker arrow keys remain local to the calendar and cannot navigate or modify the conversation accidentally.

Existing qualified bulk actions use exact selected IDs, a visible count and one exact candidate in one visible zone. They retain D3/D7's per-item results. No silent per-inbox timezone recalculation occurs. If a batch takes long enough that the candidate becomes past before a new item's admission, that item requires correction; successful items stay saved. A batch recap may stay available while rows leave a filter, so disappearance is not mistaken for failure.

Choosing a reminder while composing is a separate D3/D4 work action. It does not send, prepare, schedule, rewrite or discard the email. D24 shortcut contents cannot store reminder choices. The ordinary TipTap editor and its recipient/attachment/signature review remain untouched.

## Due and failure journey

At or after the accepted instant, the current qualified reminder returns the conversation to **Open** with **Follow-up due**, retaining the previous reason for waiting. The timer does not directly choose an assignee; D7's applicable coverage evaluation still runs and may reassign work under its own rules, including after the original scheduling worker leaves. Underlying CRM/giving/task outcomes do not change. The selected time is a review time, not evidence an awaited answer arrived. Staff can find due work through existing follow-up/recovery views and D30's independent navigation.

| State                   | What the person sees and can do                                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Preview loading         | Stable small surface and loading feedback; no fabricated exact result. Custom entry can remain available.                                 |
| Validation error        | Inline error attached to the field and values preserved. Correct an invalid date, missing time or past value.                             |
| Ambiguous local time    | Two explicitly labelled offsets/occurrences; no default selection.                                                                        |
| Nonexistent local time  | Explanation of the clock change, original input retained and valid alternatives offered for explicit choice.                              |
| Save pending            | One pending operation; closing the surface does not falsely cancel an admitted request.                                                   |
| Definitely not admitted | Keep input and show the actionable error. Retrying follows the command's known outcome.                                                   |
| Outcome unknown         | “We’re checking whether your follow-up was saved.” Check status reconciles the same identity.                                             |
| Conflict                | Show current authorized state and preserve the proposed value for deliberate review.                                                      |
| Offline                 | Preserve permitted in-memory input, show connectivity state and confirm nothing until server admission. No browser alarm or silent queue. |
| Due processing delayed  | Display original due time, pending/failed recovery honestly and the actual eventual processing time. Never slide the due time forward.    |
| Permission revoked      | Stop reading/writing the restricted detail; give a nonsensitive explanation and safe return navigation.                                   |

The copy is proposed product wording. There is no routine extra reason field, required internal note, assignment wizard or calendar settings trip. A real Support promise can already be documented through the existing authorized conversation tools.

## Visual and accessibility specification

Use the exact Core `base-maia` geometry and shared Base UI primitives. Reuse semantic background, foreground, muted text, border, focus and accent tokens in both themes. Use sentence case and normal readable text. Main choices align consistently; the actual date/time is supporting text with enough contrast to be read, not a low-contrast tooltip. One subtle divider separates Custom; another separates existing-reminder removal. Focus and selected state are clear without relying on color alone.

On narrow screens, use the shared responsive dialog/sheet pattern with one column, the same four choices and a compact Custom form. Keep the primary action visible above the virtual keyboard or reachable by normal scrolling. No horizontal scrolling at 320 CSS pixels; long translations and zone names wrap. Primary action rows target at least 44 CSS pixels. Shared compact calendar cells must meet WCAG 2.2 AA target/spacing requirements and pass real touch testing; the AA standard is not falsely described as requiring 44 everywhere.

Use the primitives' correct button/list or dialog/form semantics. A composite form must not be embedded as if it were a single menu item. Focus moves into the appropriate form field, returns to the trigger on dismissal and stays recoverable after errors. Keyboard calendar navigation, direct text entry, visible format hints, full accessible date names and associated error messages are required. Announce meaningful resolved/saved/error changes politely, not a ticking countdown. Respect reduced motion and high-contrast settings.

[W3C's datepicker example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) supports the focus/input principles but warns that production and mobile assistive-technology testing are necessary. [GOV.UK date guidance](https://design-system.service.gov.uk/patterns/dates/) distinguishes choosing a future date from recalling a known date; use both calendar and direct entry here, not a copied birth-date form. No vendor screenshot is treated as proof that the final Maia composition works.

## Maintenance journey and proof

There is no tenant preset editor, publication workflow or personal preset list. Product/shared-UI maintainers change one definition and run conformance checks across detail, keyboard, bulk and CRM entry. Existing reminders never change when a menu label or default changes. A tenant administrator can correct the existing tenant timezone through its authorized settings owner; the picker does not quietly edit it. Previously saved instants remain fixed.

Use the [P01–P32 proof and six operating controls](phase26-d31-proof-and-operations.md). Real staff tests must establish that workers can pick the intended time, identify its zone, correct it and explain its shared work/no-email effect. Until those tests and real browser/accessibility checks run, this is a complete reviewed design, not a proven perfect UI.

## Full founder ratification — 13 September 2026

The founder explicitly ratifies **D31 A — Consistent quick choices plus Custom**, including every amendment, addition, adjustment, change and update in **D31-R01–R24**; all **23 individually evaluated categories**, their findings, consequences, severity/likelihood assessments and permanent fixes; the full quick/Custom/edit/remove/CRM/mobile/accessibility/maintenance journeys; all source, data, Supabase/RLS, privacy, concurrency, recovery, migration and integration safeguards; the independent final corrections; **two glossary terms**; **P01–P32** required release proof groups; and **O01–O06** operating controls with named owner responsibilities, signals, thresholds and responses. **D1–D31 and every adopted amendment are fully ratified.**

The four accepted quick choices are In 1 hour, In 4 hours, Tomorrow at the displayed time and In 1 week at that time, with visible exact date/year/time/zone and a first-class Choose date and time path. Elapsed targets add 3,600/14,400 seconds then round the target upward to a minute by less than sixty seconds. Calendar choices use the actual reference-local date plus one/seven and displayed HH:mm; reference rounding cannot skip an extra date. No universal 9 AM, Monday or service-calendar assumption is introduced. These are accepted product choices, not claims of universal ministry working hours or measured optimality.

The validated tenant default timezone, visible UTC fallback/owned configuration issue and explicit per-use IANA override are accepted. Custom input-zone changes retain the entered wall date/time and visibly propose a new candidate; a read-only display-zone change preserves the instant. Opening/cancel preserves original seconds and provenance; an explicit date/time/input-zone edit creates a new reviewed minute-granular candidate with old/new exact values shown. Gap/overlap handling, legacy unknown provenance, finite supported civil-year range 0001–9999 intersected with future UTC, stable reviewed instant and no arbitrary preview TTL are accepted. Prior command receipt reconciliation precedes fresh past/stale validation; retry never renews the delay.

D3 retains one source-owned shared reminder, exact current generation, atomic command/history/required intent, due Open review, preservation/cancellation and provider-horizon recovery. D7 required coverage-evaluation intent commits with due-created Open and qualified assignment consequences remain available. D3's already-qualified reviewed Reopen-and-remind path is preserved alongside explicit reopen-first. D10's reviewed resulting merge/Undo reminder plan is preserved. CRM uses the same currently authorized Support record; no duplicated person, task, due field or Activity event is created. Support expiry/resolution does not prove an underlying giving, financial, contact or delegated action completed.

The **Email Studio seam is fully ratified**: preview/set/change/remove/expiry has no new message preparation, template/catalog activation, provider call, scheduled send or reminder email. Support owns reminder/work truth; shared workflow infrastructure executes product-owned intent; **P17 / Email Studio** owns governed email content and preparation; **P6** owns actual delivery and reconciliation. D4 ordinary Send preserves the current valid reminder; its already-qualified explicit work actions retain D3 semantics. The current outgoing-message writer that clears reminders is an accepted implementation conflict to repair before activation. D24 shortcuts cannot store or apply reminder presets. TipTap remains rich-text authoring; date/time fields use shared form controls. Existing independently qualified owner/workflow failure escalation retains its separate authority and is not suppressed.

All visual/interaction and operational bounds are ratified, including no hard preview expiry, minute precision for newly selected times, the proposed-to-now-accepted 44-CSS-pixel primary touch targets, the 100-staff/50-tenant/100,000-active-reminder qualification fixture with 80% tenant skew and server p95≤2s, the 5,000-due-in-one-minute healthy-load recovery gate, and all six named controls. These remain engineering/product qualification requirements, not observed production capacity or customer execution promises. The 32 real release groups remain required and unexecuted.

Ratification does not convert nineteen independent timing checks plus four source-derived observations, three independent document reviews or structural validation into actual SQL/RLS, worker, provider, browser, accessibility or participant usability proof. Original source/probe/validation and independent review evidence is preserved. The historical **Accept with required amendments** disposition is now fully accepted with every amendment. No repeat approval is required. Continue the one-decision-at-a-time grill; this ratification does not authorize implementation, formal OpenSpec/PRD, tickets, GitHub/provider/DNS/inbox mutation or real messages.
