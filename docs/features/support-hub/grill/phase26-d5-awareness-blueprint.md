# Phase 26 D5 — Clear awareness when follow-up ends

**Fully founder-ratified D5 grooming blueprint, 10 September 2026.** The founder accepted explicit staff ending, the [complete corrected decision and review](phase26-d5-adversarial-review.md), this blueprint and every adopted amendment, adjustment, change and update. D1–D4 remain ratified. This is intended behavior and exact interaction guidance, not an implemented screen. [Evidence](phase26-d5-evidence.md) distinguishes current code, primary documentation, practitioner reports and executed source checks.

## What users need to understand

Staff need to know **why follow-up is ending, what changes, whether a reminder is cancelled, and whether anyone is being emailed**. The requester needs understandable correspondence and an effortless way to continue when they choose. These are related needs, but they are not the same state change.

No response means clearly requested information still needed by Support has not arrived at the current reviewed point. It does not mean the person sent no earlier messages, did something wrong, received every email or had the problem solved. Staff may retain an unanswered part after reviewing a partial reply; there is no mandatory extra chaser to satisfy the software. An explicit refusal, inability to provide the information, withdrawal or a new clarification question is actual input to handle, not an excuse to pretend nobody answered.

Maria's example: Sarah asked about a receipt. Maria requested the gift date. A reminder returns the conversation to Open; Maria reviews it and sees that the date is still missing, no promised Support action remains and delivery recovery has been handled truthfully. She may deliberately end this follow-up. The example illustrates the interaction; it does not establish a ministry response deadline or normal workload.

## The staff flow

The header keeps D3's single work-status control. An infrequent **End follow-up…** action sits with the existing completion tools, clearly distinct from closing the detail pane. Selecting it opens one compact review surface. It does not itself end work.

```text
End follow-up — No response

Still needed
Gift date for the receipt question
View the request and latest replies

No further proactive follow-up is planned.
A relevant reply or new actionable information
returns this request for review.

Reminder: Tomorrow, 9:00 AM (Bangkok) will be cancelled.
No email will be sent.

Cancel          Write final reply          End follow-up
```

The text above is a content hierarchy, not a new component system or fixed pixel specification. The requested-information summary comes from existing permitted context and explicit review, not an AI promise parser. Reference the actual message; do not require staff to paste a private email into a new notes field. If a harmless short summary is needed to disambiguate a partial request, preserve it under Support's access/retention policy. Avoid long mandatory prose and checkbox declarations that falsely imply every hidden obligation is machine-proved.

Use the existing **base-maia / Base UI / `@asym/ui`** components and semantic tokens. One quiet surface, clear text, readable spacing and a restrained status treatment are sufficient. On narrow screens the actions may wrap or stack while keeping each full label clear. No tiny uppercase instructions, repeated green success indicators, hover-only definitions, decorative animation or app-local design system.

If no reminder exists, omit the cancellation row; do not claim a timer was cancelled. If a relevant obligation or recovery blocks ending, show the permitted reason and a direct authorized path to review it. A unavailable required check says review is unavailable and keeps the action uncommitted. The dialog must not leak a private Finance/member-care record through its error wording. An unrelated optional CRM panel outage does not become a new barrier to an otherwise qualified action.

**Before submission**, Cancel, Escape or dismissal preserves the draft, audience, selected conversation, status and reminder. **After submission**, dismissing UI is not cancellation: the command may already have committed. Its pending outcome remains discoverable and reconciles under the same identity. Do not offer a misleading Cancel that only closes the window while promising to undo work.

## Two explicit paths

| Path                              | Staff action                                                                                          | Actual effect                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| End without email                 | Click **End follow-up** in the review                                                                 | Atomically record the No response ending, history and applicable reminder cancellation. No external message or communication event is created. Preserve unsent drafts. |
| Send a final human update and end | Click **Write final reply**, review/edit the existing composer, then click **Send and end follow-up** | Opening the draft has no work effect. The exact ready reply and ending are admitted together under D4. Delivery then proceeds asynchronously through P6/P17/Resend.    |

The optional path does not require a new template, editor, provider sender or system-message catalog key. Eligible saved wording still follows the ratified Email Studio content/preparation contract. It cannot supply recipients, run a macro, expose private notes or claim a receipt/refund action completed.

While the optional intent is staged, **After sending** explicitly shows **End follow-up — No response** as the current contextual choice alongside ordinary D4 choices. The primary button says **Send and end follow-up**. Choosing Keep current status or another ordinary D4 action clears the No response reason and incompatible review binding. Plain Send reply and ordinary Send and resolve do not silently carry it. A new draft still starts with Send reply.

Do not replace an existing composed reply with canned closing text. Preserve the draft and let staff edit it. If they add a fresh question, a new commitment or a deadline, the remaining work must be reviewed; a generic “reply later with the already requested detail” invitation does not create a fresh proactive chase promise. An unsent sole first request cannot manufacture the historical basis for No response. A previously qualified wait can, however, end while its optional final courtesy email is queued, with truthful later delivery recovery.

Before combined admission, server validation and compilation must be complete and match the reviewed draft/audience/action/dependencies. A known invalid combination admits neither work nor send. After combined admission, retire only that exact admitted reply draft; preserve newer edits, note drafts and recovery evidence. No second status-triggered closing email or survey is sent.

## Requester awareness without administrative friction

The local-only review says **No email will be sent** because that is what actually happens. A requester who receives no message is not claimed to have been informed about the internal ending. Staff see the option to write a useful final update at the decision point. A previously promised update remains a commitment, so ending alone cannot waive it.

Suitable optional wording, to edit for the actual situation:

> We still need the gift date to check this. We’ll leave it here for now. If you’d like us to continue, reply to this email with that detail.

Avoid “Your issue has been resolved,” “You failed to respond,” an invented deadline, or instructions to create another ticket/log in. Do not add a closing notice after every ordinary Resolve, force an administrative message when nothing useful needs saying, or make the person understand the internal four-state model. A direct reply path and clear information request are the valuable user experience.

This policy is deliberate. Zoho documents independently controlled closing notifications, and HubSpot exposes configured ticket-stage emails; neither establishes a universal automatic-notice requirement. Zendesk's solved-notification recipe warns that other triggers must be adjusted to avoid duplicate emails. The design therefore makes actual sending explicit rather than trusting a hidden default. [Zoho notification rules](https://help.zoho.com/portal/en/kb/desk/customization/notifications/articles/managing-notification-rules-triggers-in-zoho-desk), [HubSpot pipeline actions](https://knowledge.hubspot.com/object-settings/set-up-pipeline-automations-for-objects). The complete evidence contains the Zendesk source and dated qualifications.

Ending adds no permanent reply lock, token-expiry rule or deletion. A later relevant admitted reply returns the retained canonical conversation to review. Existing owner retention/privacy rules still apply: do not promise perpetual body retention or resurrect a redacted record to preserve a cosmetic thread. If lawful retention removed linkage, safe intake must still avoid silent loss or a fabricated historical association.

## Durable awareness after the click

```text
Receipt question                     Resolved · No response

Maria ended follow-up — No response
10 September, 9:42 PM
Requested information: Gift date
This action sent no email.

[View history]                              [Undo, if eligible]
```

The timestamp is illustrative; the real view uses the recorded server instant and viewer display zone. Show the actual actor rather than the current assignee. If an optional reply was included, show its real pending/delivery evidence separately—for example **Reply queued · Follow-up ended**—not “requester notified” or “delivered” from a local success response.

The result persists after a toast disappears. Screen-reader feedback is concise and does not move focus unnecessarily. Detail and permitted history carry the reason; a report filter can distinguish No response endings. A filtered list should truthfully remove an item that no longer matches without destroying the selected detail or jumping to another person. Returning from permitted CRM context preserves the same conversation and draft.

If new input wins a race before ending, reject the stale command and retain the draft for review. If ending commits first and new relevant input follows, the current header is Open with a new-review explanation; history still shows the earlier ending. A late success response must not restore Resolved. A reopened conversation does not carry No response as its current label merely because an older episode had that reason.

## Correction, uncertainty and truthful history

Undo is conditional and records a new change. It cannot erase the prior event, recall a sent message, undo a giving action or overwrite newer staff work. Restoring a reminder uses a new generation; if the previous time is already due, return to Open review. If Undo is no longer applicable, offer the current authorized work action with explanation rather than pretending the old state can be restored safely.

Correcting a mistaken reason is different from reopening. A correction targets the exact historical episode and expected revision, preserves original endedAt and actor evidence, and records who corrected it and when. It does not re-close current work or disturb a later reminder/assignment. If it reveals an outstanding obligation, create/reconcile D3 review. A real later response and completion create new history; they do not rewrite No response into a retrospectively successful outcome.

Unknown delivery remains Unknown after review when it cannot be proved. No response is never proof of successful contact or reading. A solely drafted/definitely unsubmitted request is not a qualified unanswered request; an honestly reviewed possibly submitted request need not remain open forever just because the provider cannot prove human receipt. Pending actionable recovery still remains work.

Operational reporting distinguishes ended episodes, current resolved conversations, ordinary Support completion, No response and legacy reason-not-recorded. None alone proves a confirmed fix or customer satisfaction. Reopening must not erase an earlier ending, and current-assignee reporting must not be labelled historical ending credit. A safe CRM projection references the same Support fact; a local-only ending is not another outbound communication.

## Accessible and failure-state acceptance

| State or interaction                    | Expected experience                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Review opening/loading                  | Clear title/progress, current context retained, no premature mutation                                          |
| Missing necessary review information    | Specific permitted explanation and source navigation; no fake eligible success                                 |
| Known owed Support action               | Ending blocked; direct authorized route to the real obligation                                                 |
| No reminder                             | No misleading cancellation message                                                                             |
| Pre-submission dismissal                | No effects; restore focus/context without discarding work                                                      |
| Submitted, response pending/lost        | Checking outcome with durable pending identity; dismissal does not claim cancellation                          |
| Stale new input                         | New information to review, draft retained; no hidden ending                                                    |
| Ended without email                     | Persistent reason/history and explicit action-level no-email fact                                              |
| Combined reply admitted                 | Reply queued and work ended shown separately; only exact admitted draft retired                                |
| Fresh adverse outcome                   | D3 review with causal explanation; earlier history remains honest                                              |
| Permission revoked                      | Protected data/action stops across UI, cache, history and links; no stale-submit bypass                        |
| Keyboard/touch/IME/screen reader        | Clear focus/labels/targets; picker input or composition cannot accidentally submit; concise live announcements |
| Narrow viewport, zoom, localization/RTL | Required meanings and action labels wrap/read correctly; no hidden recipient or consequence                    |
| Later reopening/correction              | Current work and historical ending remain distinct; no stale No response badge                                 |

Use shared dialog/popover/mobile presentation behavior rather than building custom focus handling. The review surface has one purpose; no extra generic confirmation follows it. NN/g cautions that overused confirmation dialogs create interruptions and habituation, while W3C requires appropriate programmatic exposure of status messages. These guide the design; actual accessibility and comprehension must still be tested. [NN/g](https://www.nngroup.com/articles/confirmation-dialog/), [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

The full review defines P01–P18 and named monitoring responses. This blueprint creates no new CRM, automation platform, mandatory outreach policy, fifth work state or permanent Closed stage. It supplies a complete, reviewable interaction for the one selected decision.
