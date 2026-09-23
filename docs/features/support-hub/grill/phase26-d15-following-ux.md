# Phase 26 D15 — Following conversations in everyday work

11 September 2026. **Complete fully founder-ratified UX for selected A, 11 September 2026.** This accompanies the [full D15 decision](phase26-d15-adversarial-review.md). It defines the intended product experience and template content; it is not a rendered prototype, implemented interface or tested accessibility result.

## The ordinary journey

Alex handles Maya's receipt question. Sam adds an internal note and wants to see Maya's response. Sam chooses **Follow conversation**. Alex keeps the assignment. Maya sees no new recipient, message or follower identity.

```text
Receipt question                         Follow conversation
Open · Assigned to Alex

[The existing conversation history and composer]
```

After the command is durably confirmed:

```text
Receipt question                         Following ▾
Open · Assigned to Alex

Following options
  Stop following conversation
  View followed threads                 [only when useful]
  Notification preferences
```

Keep the control compact and in the existing conversation action area. The primary reply workflow stays visually dominant. Use Core's shared base-maia/Base UI controls, semantic tokens, spacing and typography. Do not introduce a new palette, card-heavy panel, avatar strip or read-surveillance display.

The concise helper is available without hover:

> Get updates about this conversation. Assignment stays with Alex.

For Shared handling, use the current responsible inbox. Additional help describes the four update types, not generation counters or internal APIs. Start and Stop need no routine confirmation dialog; they are personal reversible choices with explicit current-state commands. Pending state remains **Following…** or **Stopping…** until the original operation is reconciled. A request timeout must not create a second toggle.

Replying, posting a note, being mentioned or receiving assignment never turns Follow on. A directed request for attention remains separate. This makes it safe for Sam to help once without an unwanted subscription.

## What updates Sam receives

Use meaningful, permission-safe labels. In the shared notification center, ordinary follower information appears in **All** under the existing policy. It does not become Needs attention simply because Sam has not read it.

| Activity                                  | Useful presentation                                               | Important limit                                                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Qualified human incoming message          | **New reply in a conversation you follow**                        | Preserve actual original receipt time; recovered older input is not labelled sent just now. Unqualified/quarantined material is not previewed.                                    |
| Human Support reply accepted for delivery | **Staff reply accepted for delivery**                             | Qualified P6 evidence only. Partial recipient outcomes remain truthful; delivery/read is not implied. A late confirmation distinguishes actual reply time from confirmation time. |
| Published human internal note             | **New internal note**                                             | Only current authorized source detail. A private-note event is not an external reply or an excuse to quote its contents into email.                                               |
| Deliberate human ending or reopening      | **Follow-up ended — [actual reason]** / **Conversation reopened** | Preserve No response, Continued and other truthful Support meanings; do not claim Finance completed the request.                                                                  |

The in-product item may show the source-authorized topic/actor context permitted by its qualified preview contract. Recheck current access and exact source restrictions; if a safe topic cannot be shown, use the generic label. No notification includes content from an unselected merged original just to produce a richer preview. Clicking opens the relevant source contribution or outcome in current permitted handling, preserving the user's return path.

Routine assignment, coverage, Waiting, labels and CRM changes simply update the current conversation display. D14 target/reminder ticks, provider tracking, scan/retry progress and Follow/Stop themselves generate no optional follow notice. A requester reply that reopens work appears once with useful context. Actual required assignment/custody/assistance/recovery meanings use their own qualified attention contracts.

Sam's own trusted note, reply or deliberate ending does not create an optional FOLLOW notice to Sam. Send confirmation and failures remain visible through the existing sender/work flow even if Sam never follows. A background result or another colleague's input is not suppressed merely because Sam is the assignee.

One actual update may qualify through several personal reasons. The shared owner avoids a duplicate delivery only where source, purpose and channel are genuinely equivalent. Separate required actions remain independently discoverable. This is not a new topic-by-topic settings matrix or a promise that every fact must collapse into one bell item.

## Find and manage followed work

Add **Following** to the existing Support list/view filters. Start with **All statuses**, so a resolved conversation Sam still follows does not vanish unexpectedly. Existing explicit filters, saved views and normal authorized actions remain available; this is not a separate limited extension page.

```text
Support Hub
Filters: Following · All statuses       Sort: Latest followed update

Conversation         Shared status       Handler       Latest followed update
Receipt question     Open                Alex          Maya replied · 10:12
Account question     Resolved            Donor care    Follow-up ended · Tue
```

Rows and counts represent current continuing conversations. A merged row can contain several original sources Sam follows; detail explains that scope when needed. **Latest followed update** uses activity relevant to Sam's selected sources, so a new unrelated merged thread does not quietly bump the row. The list is not a second unread counter or personal Open/Waiting state machine. P17's badge continues to mean unread authorized groups.

An empty state says **You aren't following any conversations yet**, with a short explanation of Follow in conversation actions. If another explicit filter hides results, explain that filter rather than reporting that no follows exist. Loading, unavailable and permission-unknown states are distinct from a true empty result.

Provide **Stop following selected** in the existing bounded selection flow for one's own selected scope. Show the actual current selected conversations; do not operate on hidden filtered rows or every possible search match without explicit review. Each result remains identifiable if current scope changes or a command fails; retry only unresolved/failed operations with their original identities. No bulk enrollment of a team or another person is introduced.

After Stop removes a row from Following, preserve the open draft and move keyboard focus predictably to an adjacent result or list control. Do not send the user to another conversation automatically. The same conversation still has its ordinary Follow action when opened from authorized search/history.

## Stop and follow again

The stop action says **Stop following conversation**, with:

> Stops optional updates for you. It does not change who handles the conversation or stop required attention.

Stop removes the selected personal interest from future optional selection. It ends unread treatment for those follow-only updates without claiming Sam read them; authorized recent history can remain. Separately qualified mentions or work attention retain their own meaning. Email already sent or in flight cannot be recalled. Unstarted email is still checked before sending. No shared status, reminder, recipient, task or CRM change accompanies Stop.

Offer **Follow again** when useful. It begins with future qualified updates and does not restore old unread items or unsent emails. Avoid a misleading Undo label that promises to restore a prior notification history. A transient toast may confirm the result, but it is not the only route back to the persistent control.

D11's **Stop following this work** stays on the delegated-work card. That action affects the conversation's interest in the delegated outcome. The full labels and placement distinguish it from Sam's personal conversation following.

## Merged and continued conversations

When Sam followed A before B was merged into it, show **Following selected threads** in the combined view. Opening following options shows only currently permitted sources and explains:

> You receive updates from the threads selected here. Merging another thread does not add it automatically.

The action **Follow all current threads** means the authorized threads shown in that panel. Its supporting copy says exactly that. It keeps already-active starts and adds only missing shown sources. No hidden original count or future merged source is implied.

If Sam follows both A and B and B is later separated by Undo, both personal interests remain with their original conversations. A later Stop on B stays stopped; Undo never restores an old follower list. New notes and replies retain their actual original affinity. A whole-work outcome can apply to several selected sources without duplicating the same qualified update.

If A's work is deliberately Continued in B under D12, A's outcome can say:

> Follow-up continues in another conversation. Open it to follow updates there.

Show **Open continued conversation** only when authorized. Following A does not automatically follow B, even when a B reply fulfills work originally transferred from A. The destination offers its own Follow action. A colleague with only access to a minimal internal-work brief sees only that brief; following is never a request for automatic full-transcript access.

## Current access and unexpected failures

After genuine access loss, remove protected following state, source previews and recent notification presentation. Do not leave a subject, donor name, hidden count or stale cached preview. A safe self-owned cleanup action can stop remaining personal intent without displaying the inaccessible source. After later regrant, Follow is a new deliberate choice; old unread history does not return.

If authorization is temporarily unavailable, show a neutral retryable unavailable state. Do not tell Sam their access was revoked or permanently stop their intent based on a failed lookup. Preserve the current draft safely and revalidate on return. Tenant/role switching clears the previous surface's visible personal data and re-queries the new scope.

When the notification pipeline is delayed, the Follow control remains the truthful source state and Following remains a source-backed finder. Shared work and required review stay discoverable. A shared service status may explain delayed updates; do not create a follower notification about every failed notification or pretend an email arrived. An ambiguous command displays its pending/recovery state until the original result is known.

## Preferences and optional email

In existing personal notification preferences, add the one qualified meaning:

```text
Conversations I follow

In Asym
Updates appear in All in your notification center while you follow.
Required work uses its own attention rules.

Email updates for conversations I follow       Off
Optional. Uses your authorized staff email and the tenant's message settings.
```

This is proposed copy, not a new Support preferences page or permission to pick another agent. The email default for this new topic is Off. Starting a Follow changes neither that setting nor any other topic. The tenant can govern the optional email step through P17; show **Email disabled by your organization** or **Email unavailable** when relevant, without disabling useful in-product following or offering a sender-configuration shortcut.

Channel enablement applies to future source activity. Turning email on after an event cannot email that old event, even if its first notification admission was delayed. Off/on cycles do not revive earlier email eligibility. Turning email Off does not stop follows, in-product information or independently required attention. Reading one channel is not assumed to complete the other.

Optional email usefulness ends at seven days from first qualified source availability, with every earlier applicable stop. A late prepared artifact cannot renew that period. In-product unread/history is also limited by the source's original 30/90-day cutoffs as well as P17's own limits. This is background correctness, not a countdown to display to ordinary users. Old newly projected history is not shown as freshly unread; actual receipt/availability times remain honest.

## Email Studio starter: Followed conversation update

Add this narrowly governed source meaning to P17's catalog and the canonical Email Studio starters before enabling email. Use the existing staff/service-compatible layout and qualified staff-operation sender/reply identity. The new prepared-material class is **prepared.optional_support_follow_update_7d@1**; it does not broaden the old class or turn information into required action.

**Protected default content:**

```text
Subject: Update to a conversation you follow
Preheader: Open Support Hub to view the update.

There is an update to a conversation you follow in [tenant display name].

[View conversation]

Open Support Hub to read the update or respond.
You can manage optional updates in Following or Notification preferences.

[Manage following]
```

The HTML and plain-text versions express the same short pointer. The notification intentionally contains no note excerpt, transcript, attachment, financial record, missionary location, requester email or sensitive subject. The in-product destination supplies currently permitted context after authentication. The default can remain generic across E1–E4 so delayed or changed shared status is not falsely described as current work completion in delivered email.

| Permitted fact                | Authority and use                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant display name / brand   | Existing qualified tenant message profile; escaped text and approved presentation only.                                                |
| View conversation destination | Server-issued typed recipient/source destination, resolved against current access/root on opening; URL possession grants no authority. |
| Manage following destination  | Authenticated personal current-scope settings/action surface. GET never executes Stop.                                                 |
| Fixed optional-help wording   | Protected purpose-compatible text; does not add a public promise or claim successful delivery/read.                                    |

No CRM merge field, free-form source body, automatic quote, all-followers audience, arbitrary redirect or caller-selected sender is in the default contract. Template publication, translation, fallback and variable validation reuse P17. Preview uses synthetic source cases and must match approved HTML/text/envelope; test sending is not an ordinary Support send path and is not performed during grooming.

The shared P6 occurrence creates in-product availability independently from the optional email sibling. Resend dispatch uses the existing immutable submission, verified sender identity, provider correlation and reconciliation. A staff notification is not inserted into the requester thread or counted as a donor interaction, human Support reply or resolved request. Replying to its email does not publish an internal note or send a requester response; staff use the protected Support destination.

## Accessibility and verification

Use Base UI command/menu semantics for the sketches above. A control whose action label changes must not also expose misleading aria-pressed semantics; a true pressed toggle requires a stable label. Verify visible focus, Tab/Shift+Tab, Enter/Space, arrow/Escape menu behavior, scope-panel focus containment/return and polite async result messages. All explanations and stops must work without hover.

At 320 CSS pixels and 200% zoom, maintain useful labels and actions without mandatory horizontal tables. Support RTL, long international names and locale/timezone-specific dates. Keep touch hit areas from the shared system, preserve its reduced-motion behavior, and avoid notification sounds or motion that the existing presentation contract does not authorize.

Verify normal/partial following, currently resolved work, Follow again, bulk Stop, access loss/outage, missing identity/channel, CRM return, merge/Undo/continuation, notification click and offline/reconnect. Exercise exact role/source permissions and current data, not just screenshots or mocked success. [D15-P01–P54](phase26-d15-adversarial-review.md#required-proof-groups) are mandatory later proof; none is claimed executed by this blueprint. **The complete D15 amendments remain proposed pending founder ratification.**

## Founder ratification — 11 September 2026

> Yes, I ratify this, including all the amendments, additions, adjustments, changes, and updates you’ve made. Record the ratified decision and all changes in full for this grill-with-docs session.

The founder fully accepts D15 and every adopted amendment, addition, adjustment, change and update: the exact corrected decision; D15-R01–R26; D15-P01–P54; all 23 adversarial category outcomes with impact, severity, likelihood, evidence, decision effect and permanent corrections; the complete normal/partial/Stop/Following-list/CRM/preferences/accessibility and Email Studio blueprint; all twenty-seven adopted independent corrections; the four glossary concepts and domain boundaries; all nine operational signal/threshold/owner/response entries; and every implementation, migration, activation, compatibility and proof obligation.

This includes self-only deliberate enrollment; original-source scopes and following generations; future-only Follow again; exact Stop without erasing permitted history or suppressing required work; confirmed access loss versus lookup failure; the four useful activity classes; purpose/channel-aware dedupe; native All-statuses Following with source-relevant ordering; D10 merge/Undo and D12 no-inheritance; actual recipient/source/CRM boundaries; shared Information presentation; the explicit P6/P17 independent member applicability extension and complete bounded all-before-any release; the new closed prepared.optional_support_follow_update_7d@1 class and safe Email Studio pointer; optional email default Off and historical channel-enable guards; exact source-usefulness narrowing of 30/90-day presentation and seven-day email utility; and all current-authorization, retention, recovery and safe rollout rules.

**Accept with required amendments** remains the historical review disposition; all adopted amendments are now accepted in full. The complete substantive review, clauses, event/category/proof tables, operational controls and UX body remain verbatim. Stage-only proposed/pending/no-next-question wording inside those preserved historical blocks describes the prior review stage and is superseded as to acceptance and advancement by this explicit ratification. No requirement is weakened or newly inferred. D1–D14 remain fully ratified and unchanged. Continue to the next single researched question; do not request repeat D15 approval.

The [ratification and next-question validation](d15-ratification-q16-validation.json) verifies accepted status and preservation separately from the historical D15 review validation. This is ratified local grooming authority, not a formal specification, running implementation, provider publication or production-readiness claim. No runtime/schema, tickets, GitHub/provider/DNS/credential changes or real messages are authorized by this recording.
