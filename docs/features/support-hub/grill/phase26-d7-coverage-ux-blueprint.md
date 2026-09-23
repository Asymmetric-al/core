# Phase 26 D7 — A clear Start, Manage and End coverage journey

Recorded 11 September 2026 after research on 10–11 September. The founder selected B: transfer current Open work, then cover later Open work. **This complete UX amendment package is fully founder-ratified, 11 September 2026, including every adopted amendment, adjustment, change and update.** D1–D6 remain ratified. The [full review](phase26-d7-adversarial-review.md) contains 20 exact clauses, all 23 category findings and 24 proof groups; the [evidence](phase26-d7-evidence.md) records source and research limits. This is a grooming blueprint, not a built interface or formal specification.

## The experience to deliver

Maria deliberately starts coverage in the Support inboxes she chooses. Her Open conversations return to those same shared queues. Quiet Waiting conversations stay assigned until relevant replies, follow-ups or other qualified work require review. An old Resolved conversation reopening during coverage is included. Daniel takes a shared item with the normal Assign to me action. It remains his when Maria returns.

The interface explains three facts at the point they matter: **which inboxes are covered; which work transfers; what happens when coverage ends.** It does not ask staff to assemble separate reply, reminder and reopened-ticket automations. It also does not imply that an active setting proves every handoff succeeded or every shared item was answered.

Reuse the existing Support navigation, person controls, assignment menu, list/detail and recovery surfaces. Use the shared Base UI/base-maia components and Zinc semantic tokens. Beauty comes from aligned content, restrained typography/spacing, useful hierarchy and stable interaction. No app-local component fork, colorful status wall or holiday dashboard is needed.

## What each control means

| Control / fact                      | Meaning                                                                   | What it does not mean                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Receive new Support assignments** | Saved per-person/tenant preference for new automatic intake               | Existing-work coverage, attendance, permissions or a holiday schedule.                 |
| **Absence coverage**                | Explicit current episode for this person and selected tenant inboxes      | Every current/future inbox, a public availability notice or global Receive rewrite.    |
| **Start coverage**                  | Activate the reviewed policy and start durable current-Open handoffs      | Every transfer completed immediately, a message sent, or all quiet waits reassigned.   |
| **Coverage active**                 | The scoped policy is effective now                                        | All handoffs finished or someone has answered every request.                           |
| **Needs coverage / Transfers held** | A particular handoff remains incomplete and needs the explained recovery  | The assignee is already empty or the request is resolved.                              |
| **Keep with Maria during coverage** | Deliberate handling of this conversation by Maria for the current episode | A second owner, a permanent exception, a permission grant or a new Receive preference. |
| **End coverage**                    | Stop future coverage effects and remove its new-assignment restriction    | Undo transfers, reclaim Daniel's work or restore an old preference.                    |

The stored Receive preference stays untouched. Effective eligibility in a covered inbox includes the coverage restriction. An On preference can remain valid in other inboxes and becomes relevant again when coverage ends. A staff member changing Receive during coverage changes that saved preference, not the active coverage restriction. This avoids a hidden tenant-wide side effect from a selected-inbox operation.

## 1. Start from the existing Support context

Place **Absence coverage** near the worker's existing Support receiving controls. An authorized administrator can reach the same operation from the relevant person-management view. The target person and tenant are visible; there is no impersonation or “do as Maria” mode.

Open **Set up coverage** in the shared modal/drawer pattern. Start is **Now**. End initially reads **Until I end coverage**, with **Set end time** revealing one date/time/zone control. Do not guess a return date or require a calendar entry. Future-start scheduling, recurring shifts and HR integration are outside this bounded capability.

The scope review shows actual selected inbox names, prefilled from the subject's qualified current Support scope the actor may manage. **Change** lets the actor narrow or explicitly extend that selection within current rights. New inboxes and later permission grants are not silently included. If the scope is partial or some information is unavailable, say so without exposing hidden names/counts.

Illustrative content, with synthetic names/counts:

```text
Start coverage
Maria · Northside Mission

Inboxes     Donor Care, General Enquiries       Change
Start       Now
End         Until I end coverage                Set end time

6 Open conversations will return to their shared queues.
4 Waiting for requester and 2 Waiting on our side stay with you
until they need review.                         Review work

Open conversations with a future reminder keep that reminder.
New automatic assignments to you pause in these inboxes.
Your Receive setting stays On and still applies elsewhere.
No email will be sent to requesters.

                                      Cancel   Start coverage
```

Counts are an as-of preview, not a frozen portfolio. Current control and permissions are checked again per effect. **Review work** opens the existing authorized list/detail pattern with Open, both waiting sides and follow-ups. It does not force opening every item or adding notes. A specific authorized handoff can be made there when a quiet waiting conversation needs early transfer; refresh the review rather than pretending its old count remains exact.

For an optional end, show the actual date, time and named zone. Supporting copy: **“At this time, coverage stops. New assignments then follow your current Receive setting. Conversations already transferred stay where they are.”** An ambiguous/nonexistent DST choice requires clear correction before submission. Time-zone display changes do not alter the accepted instant.

## 2. Make gaps visible before and after activation

Show each material issue beside the affected inbox, not a global red wall of warnings:

- **Automatic assignments paused:** “Transfers are held in Donor Care while automatic assignments are paused.”
- **No other qualified coverage:** “This inbox needs another authorized person to cover it.”
- **Required context unavailable:** “We could not verify handoff readiness for this inbox.”

The person's own roster membership does not count as independent cover. A colleague whose receiving preference is Off may still be a legitimate shared reviewer; a colleague also on active absence coverage for that inbox cannot be counted merely to make setup look ready. No automatic assignment limit or presence dot proves actual attendance.

Coverage can start with clearly disclosed incomplete inboxes while others proceed. If every selected inbox is blocked, use the specific action **Start coverage with unresolved handoffs** and preserve the warning in the result. This records the operational arrangement and its scoped new-assignment restriction without pretending the handoff succeeded. Keep blocked conversations in safe current ownership/custody with Needs coverage; provide the authorized existing manual/recovery path. Never silently grant rights, move private work to a broad queue or pick a fallback administrator.

This exceptional longer button is used only when its consequence matters. Normal setup has one ordinary Start action and no second blanket confirmation. A zero/unknown readiness count cannot silently become “Everything covered.”

## 3. Show actual progress, then stay quiet

Before server admission: **Starting coverage…**. On a lost response: **Checking whether coverage started…**. Reconcile the original command; do not manufacture another Start or reset the form as if nothing happened.

After episode admission: **Coverage active · Transferring current work**. The policy is effective, while current-work transfers may still be processing. An illustrative result is:

```text
Coverage active
Donor Care, General Enquiries · Until you end coverage

4 returned to shared queues
1 already reassigned
1 needs attention                       View details
```

Success means the individual assignment was cleared through the qualified boundary. It does not mean Daniel accepted or replied. **Already reassigned** is a valid intervening human result, not a failure to force back to the preview. Held, denied, failed and indeterminate outcomes remain distinguishable through permitted details. Retry acts only on unresolved eligible items after reconciling unknowns.

Closing the panel after Start is not cancellation. Coverage remains active after initial catch-up completes so later qualifying work is included. End stops future effects and does not undo the transfers already committed. The same durable outcomes remain reachable after a toast disappears.

In the ordinary Support view, use one compact persistent line: **“Absence coverage: 2 inboxes · Until you end coverage”** with **Manage**. If needed beside Receive: **“Coverage pauses new automatic assignments in 2 selected inboxes.”** Keep the stored On/Off value honest. Unrelated CRM/missionary/public surfaces do not acquire absence banners.

If material held, failed or unknown handoffs remain, the same compact line retains that fact after details close: **“Absence coverage: 2 inboxes · 1 needs attention · Manage.”** Details may stay behind Manage; the unresolved problem may not disappear into a toast. Use no additional banner or repeated dialog for the same state.

## 4. Receiving and handling covered work

A transferred conversation shows the ordinary **Unassigned** label, its real D3 work status and any valid reminder. A permitted history entry explains, for example, **“Returned to Donor Care because Maria has absence coverage.”** Do not add several redundant badges or a donor-facing absence label. A short cause/detail disclosure is available where useful; the current owner remains authoritative even if a reason projection is delayed.

Daniel chooses **Assign to me** using the existing command. A concurrent claim has one winner; the other worker sees current ownership with their draft retained. Assignment changes no recipient, template, note visibility, work status or CRM/financial result.

If Maria had already admitted a reply that is still sending or has uncertain delivery, Daniel sees the existing permitted message/recovery state. Handoff cannot resend, cancel or change its author/material. Maria's private unsent draft remains private; Daniel composes his own authorized reply. Normal D1/D2/D4 collision and audience checks still apply.

Opening a CRM record preserves permitted conversation selection and drafting context. The CRM/owner surface independently checks Daniel's rights. Coverage does not transfer Maria's permission to view giving details, approve a refund, change a contact or handle private member-care information. Return navigation preserves place unless current access has been revoked.

## 5. Deliberately keeping one conversation

Coverage must not force staff to end an entire absence merely to handle one known request. In the existing assignment flow, choosing the covered person reveals a focused consequence before commit:

> Maria has absence coverage. This conversation will stay with her during this coverage, including later replies and follow-ups.

Use a concrete final action such as **Assign to Maria** with that explanation, or **Keep with Maria during coverage** when she is already the current assignee. Selecting a name alone does not silently commit a complex handoff. The same-owner Keep is a coverage-control decision, not a fabricated reassignment or an assignment-notification event.

Keep is bound to the current episode and current assignment/control generation. It persists through that conversation's valid waiting/resolution/reopening while the same assignment remains. It is not a permanent skip flag. When work goes to another person, leaves the relevant covered scope or the episode ends, the exception ceases to apply. A later new coverage episode does not inherit it. Explicitly removing Keep rechecks current Open work through the normal coverage path.

The conversation detail can quietly show **“Kept with Maria during coverage”** with the permitted action to change that handling. Do not require a reason essay or build an exception-management dashboard. Ordinary reading, notes, Send, work-state edits and own unsnooze do not secretly express Keep intent or demand an assignment choice.

If moving a conversation would retain Maria inside an active covered destination, the move review resolves the same handling choice. It must not appear to retain her and then silently strip her with an old job. Moving outside coverage stops the old scope's authority without inventing new intake. Normal moves involving an uncovered eligible assignee remain unchanged.

## 6. Manage changes, Pause and returning

**Manage coverage** shows current inbox scope, effective end and unresolved handoffs. Scope/end edits have their own expected-version Save and effect summary. Adding an inbox starts current-Open catch-up there; removing one stops future coverage effects, ends its Keep exceptions and removes its new-assignment restriction, without reclaiming work. Re-adding requires current review; changing only an end time preserves valid Keep choices. An unrelated new inbox never enrolls automatically.

Inbox **Pause automatic assignments** still holds automatic coverage releases. Coverage remains active, with a concise per-inbox held explanation and available authorized manual handoff. Resume catches up all still-eligible covered Open work, including items that became Open during Pause; another donor reply is not required. An ended episode or removed scope cannot revive on Resume.

**End coverage** uses one compact consequence review:

```text
End coverage

Future coverage handoffs will stop in Donor Care and General Enquiries.
Conversations already transferred will stay with their current team or person.

Receive new assignments is On.
New automatic assignments can resume where you are otherwise eligible.

                                       Cancel   End coverage
```

If Receive is currently Off, say **“New automatic assignments remain paused by your Receive setting.”** Do not copy a value from the Start snapshot, automatically turn On, or imply End takes Daniel's work back. A scheduled end has the same declared effect; its current-time guard does not wait for a punctual background callback. A late outcome response cannot replace newer assignment state.

If unresolved handoffs remain at End, show that fact and keep them in ordinary authorized review/current ownership. End does not claim they succeeded. Receiving eligibility and unresolved existing work are separate. Retaking a selected conversation later is an ordinary explicit current assignment action.

## Scenario walkthroughs

These are synthetic test fixtures, not assertions about ministry prevalence.

| Situation                                                           | Expected staff/requester experience                                                                                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Open receipt question at Start                                      | Returns to its current shared inbox when qualified; responsible team and valid future reminder stay intact.                                  |
| Waiting for requester, no reply while Maria is away                 | Keeps current assignee/status; no unnecessary transfer or chaser message.                                                                    |
| Waiting on our side, reminder becomes due                           | D3 makes due review Open and clears its due deferral correctly; coverage then handles the resulting Open work. No requester email is needed. |
| Old Resolved/No response thread receives a relevant reply           | Same canonical thread reopens under D3 and becomes eligible for active coverage; no portal/new-ticket hoop.                                  |
| Already-Open thread receives fresh relevant input                   | Coverage considers the new D3 review cause even though the status string did not change.                                                     |
| Authorized staff explicitly choose Open for a retained conversation | The normal D3 command also triggers coverage evaluation unless Keep applies. It creates no Keep and requires no extra requester email.       |
| Another colleague takes the work before a coverage worker runs      | Current control wins; no bounce back to Unassigned and no duplicate handoff.                                                                 |
| Maria explicitly keeps one case                                     | That conversation stays with her for this episode under the visible Keep intent; ordinary cover continues elsewhere.                         |
| Covering team has no qualified independent handler                  | Coverage is visibly incomplete; current safe custody remains, no permission grant or arbitrary substitute.                                   |
| Maria changes Receive Off while coverage is active                  | Stored preference changes through D6. It stays Off after coverage ends; no restoration of the earlier On value.                              |
| A sender's old-dated email is first admitted after coverage ends    | D3 still creates relevant review, but sender time does not resurrect an expired absence policy.                                              |
| Maria returns while Daniel is handling a transferred request        | Daniel keeps it. Maria can deliberately take over through a new current assignment; there is no automatic handback.                          |

## Accessibility and visual discipline

The setup/End surfaces use proper modal semantics only when modal, meaningful labels, contained keyboard focus and logical focus return. Rich review content should be navigable as content rather than announced as one enormous description. Status/progress changes are programmatically conveyed without taking focus. These behaviors follow the applicable shared controls and current accessibility guidance. [W3C dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

Use text with restrained icons; color is supplementary. Keep scope, effective end and actual result legible at narrow widths. Names wrap without becoming identifiers or fixed English-length assumptions. Date/time input displays its zone. Touch users can open explanations without hover; errors persist where they can act. Reduced motion avoids unnecessary queue movement, and background updates never automatically jump the selected detail to another request.

For slow connections, show pending/reconciling at the action, preserve form/draft state, and keep actual errors available. Cached display data does not authorize a coverage command. Account/tenant changes fence old responses and inaccessible content. No optimistic “All handed off” state is shown before durable evidence.

No visual mockup, browser journey or assistive-technology test was executed in this review. The [D7-P01–P24 acceptance groups](phase26-d7-adversarial-review.md) require those real outcomes later. The blueprint supplies a coherent, pressure-tested design without pretending its interface is already implemented.
