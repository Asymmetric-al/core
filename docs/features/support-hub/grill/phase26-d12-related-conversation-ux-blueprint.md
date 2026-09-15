# Phase 26 D12 — Related conversation, new email and correction journey

11 September 2026. **D12 and its complete UX/amendment package are fully founder-ratified, 11 September 2026.** D1–D11 remain ratified. The [full review](phase26-d12-adversarial-review.md) owns the exact requirements and proof. This is a concrete design blueprint, not an implemented or usability-tested UI.

## The experience to deliver

Maya replies to an answered receipt exchange: “Thanks, that’s sorted. I also can’t sign in.” Staff can give the sign-in request its own follow-up, without asking Maya to repeat it. The receipt email remains where it actually arrived. The new work starts with clearly labelled source context, and an independent email happens only when staff deliberately send it.

This example tests known product boundaries; it is not measured ministry demand or authorization to change Maya's account. A receipt check needed to answer the receipt question stays D11 internal work. A duplicate request stays D10 Merge. Two brief questions that one person can answer coherently may simply stay together.

| Staff intent                                                         | Clear action                     | What it does                                                             |
| -------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Give a genuinely separate request independent handling               | **Create related conversation…** | Creates new work and permitted source context; sends nothing.            |
| Pass a later relevant old-thread update to existing independent work | **Refer to conversation…**       | Shares exact internal context and creates current review; sends nothing. |
| Respond independently about the new request                          | **Start email thread**           | Opens a new-topic email draft with a visibly reviewed audience.          |
| Correct mistaken organization                                        | **Review creation…**             | Shows current facts and only eligible correction actions.                |

Existing Reply, Internal note, Ask for help, assignment and Merge remain familiar and distinct. No extra persistent toolbar or new case-management area is needed.

## 1. Create from the actual request

Put **Create related conversation…** in the incoming message's contextual menu. Also expose it in the related-context area; that entry visibly selects the actual triggering incoming message. Do not silently choose the most recent message, act on a CRM activity or require precision text selection. Keyboard and touch users get the same action.

The panel uses one column, one primary action and two compact current-work summaries:

```text
Create related conversation                                  Close
Handle a separate request with its own follow-up.

Separate request       [Help signing in                         ]
Details                [Optional useful staff summary           ]

Source context         Maya's email · 11 September, 10:15
                       Review context to share

New conversation       Open · Donor care · Alex
                       Change handling
Original conversation  Open · Donor care · Alex
                       Keep current work                       ▾

Related CRM records    None selected                         Add…

No email is sent when you create this conversation.
Cancel                                      Create conversation
```

The timestamp/name are illustrative. Actual display uses current permitted names and localized time with an explicit zone available. The destination is a visibly reviewed new assignment; it is not copied authority or creator ownership. Shared remains Shared. Other eligible inboxes/handlers can be chosen without moving the original or granting its full transcript access.

Keep the mandatory input small: a meaningful new-request title and a valid destination/work plan. Details are necessary only when the topic and authorized source context are insufficient. Avoid mandatory contact, category, priority, SLA, custom type, hierarchy or workflow fields. A source brief must actually be usable and permitted for the destination; a denied deep link alone is not a useful handoff.

When relevant existing conversations are visible, show their topic/status and **View** / **Refer to this conversation…** nearby. The latter opens the referral review described below; only its final **Refer update** commits the reviewed context, destination and source work plan. Do not force an empty search wizard or display hidden candidate names. Similar subjects are a hint for staff, not automatic duplication proof. The same original email can legitimately support two independently handled requests.

## 2. Make the source and two work plans understandable

**Review context to share** separates the original reference, staff summary and any explicitly permitted excerpt/attachment. The summary is labelled staff context. Do not copy every email, internal note, CRM link, recipient or attachment into the new conversation. A cross-inbox release must be permitted for the actual content and purpose.

The new conversation defaults to Open. The original defaults to its unchanged valid plan. No routine second confirmation is needed. Exception controls appear only when existing reminders, work/review or destination permissions require a choice.

If the remaining original obligation is now genuinely handled by the new conversation, staff can explicitly choose **Continued in another conversation**. The panel explains the consequence: **“This request will continue in ‘Help signing in’. The original conversation has no other follow-up remaining.”** This choice is unavailable while other promises, required reviews or recovery remain, and it does not mean the sign-in problem was solved.

A continuation must leave real unfinished work in a distinct qualified destination. It cannot point to itself or allow two conversations to end by pointing at each other. A required handling review follows the actual affected work; creation cannot bypass that review by inventing a new record.

If a promised reminder belongs with the new request, show where that follow-up will happen and the actual due time. Never clear the only reminder unnoticed or copy it onto unrelated work. D11 assistance can be deliberately connected through its existing-work control, retaining one task and explicit current interests. Do not present a general dependency wizard.

**Create conversation** commits the reviewed work once. Closing beforehand commits nothing. An ambiguous response says **Checking creation…** and reconciles the same receipt. After success, a modest confirmation says **“Conversation created. No email sent.”** Closing afterward does not undo creation.

## 3. The new conversation starts with context, not a fake email

```text
Help signing in                       Open · Donor care · Alex

From another conversation
Maya mentioned a sign-in problem in the receipt exchange.
Source email · 11 September, 10:15                  View original

No email has been sent in this conversation.
Start email thread

Related conversations
Receipt question                     Continued in another conversation
```

Render staff context with quiet neutral treatment, distinct from actual incoming/outgoing message bubbles. Show actual native correspondence counts and dates only when it exists. The original source's received time is context/request evidence, not the new conversation's native last-message time. A new Open work item can legitimately have no native mail.

Related navigation shows only permitted current topics/work states and preserves the return path. Under D10 merges, group by current continuing conversation; hide self-links without deleting source relations. A later Undo reveals only still-valid active relationships. No graph view, parent/child grouping or recursive CRM association is introduced.

## 4. Send a clear, deliberate new-topic email

**Start email thread** opens the usual shared composer in explicit new-thread mode. A quiet cue states **“Starts a new email thread”**, with the editable meaningful subject and visible To/Cc. Initial recipient candidates come from the exact reviewed source email using D2's saved preference once; they are not copied from all related records or all past messages. Staff review whether those recipients fit the new topic. The source selection never grants consent or private-data disclosure.

An example opening is: **“Hi Maya, I can help with the sign-in problem you mentioned.”** Avoid internal ticket mechanics or “Please submit a new request.” Do not quote the entire receipt discussion, internal notes or staff summary automatically.

Eligible Email Studio templates and D4's content-only saved reply wording/presentation use existing published versions, variables, safe facts and preview. Inserting or preparing content executes no work-changing macro actions. Missing Party data cannot force creation of a contact or silently select a “main” record. The final **Send email** uses the qualified shared preparation and delivery flow and preserves the conversation's status, just as D4 requires. Later native messages use ordinary Reply/Send reply.

Provider headers and IDs stay out of this user flow. Internally, new-thread mode establishes a genuine new lineage and reply route; changing the displayed title is insufficient. The donor's mail client may group messages differently, so do not promise to rewrite their mailbox. The first actual send/reply is what populates native correspondence, with truthful pending/delayed/failed delivery states.

If staff instead choose **Reply in original conversation**, navigate to that actual original/current composer with its normal permissions, audience and draft. Do not post a new-conversation message using the old thread's headers or count one send in both conversations.

## 5. Handle a donor replying to the old thread without extra donor work

Maya may keep replying to whichever email is convenient. The email first arrives in its genuine original/current conversation under D1/D10. The system must not guess the topic or silently copy it into every related conversation.

Staff use **Refer to conversation…** on that update. When there is one obvious currently permitted related target, it can be offered for review; the relationship is a navigation hint, not topic-routing authority. The compact panel shows:

- The exact source update and a minimal scope/summary, with current sharing permission.
- The destination topic and qualified current handling.
- The source's remaining work plan, unchanged by default or explicitly Continued in another conversation when valid.

**Refer update** commits current destination review and the reviewed source outcome. The destination gets a **Referred update — review** context card, not an incoming-mail bubble or forwarded email. The source shows **Referred to Help signing in**. A repeated exact operation reports **Already referred** rather than creating more messages or attention.

The destination worker can review the input and reply in the new native thread when appropriate. Staff never require Maya to resend. If the new information affects both requests, each actual obligation remains serviceable; the one source message can be explicitly referenced in both without duplicating P6 facts.

## 6. CRM remains a coherent record, not another inbox

The creation panel can offer optional **Related CRM records**, initially unselected. Staff add only relevant permitted Parties using D9's existing controls. No contact is auto-created or required. A related-conversation link does not propagate all CRM associations from the original.

If Maya's CRM record has valid context/correspondence bases for both requests, its **Support conversations** area may show:

| Conversation     | Current work                      | Basis                                                                      |
| ---------------- | --------------------------------- | -------------------------------------------------------------------------- |
| Receipt question | Continued in another conversation | Its actual qualified correspondence/context                                |
| Help signing in  | Open                              | Explicitly added Related context, or later native qualified correspondence |

Before the new conversation has its own eligible context/correspondence, it remains available through Support related navigation; the source citation alone does not claim Maya emailed that new conversation. Clicking either row preserves CRM position and returns cleanly after authorized inspection. Hidden work cannot leak through relationship titles or counts.

CRM Activity keeps actual source-owned communication and its P6 recipient facts. Creation, referral, continuation and correction do not generate fake donor interactions, last-contact changes, financial status or account-reset authority. The same D11 task can serve both requests only through explicit qualified interests, not duplicated tasks.

## 7. Correct the actual mistake, with persistent access

Keep **Review creation…** in the creation history/context menu, not only in a disappearing toast. It shows what exists now and offers only actions that are actually valid:

| Situation                                         | Honest correction                                                         | Meaning                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Two valid conversations are incorrectly related   | **Remove relationship**                                                   | Removes navigation relation, not conversations, mail or work. Required provenance/valid citations may remain. |
| Source summary/citation is wrong                  | **Correct context**                                                       | Corrects/retracts the exact current context and qualifies any result/work that relied upon it.                |
| Erroneous creation is still entirely unused       | **Cancel unused conversation**                                            | Returns still-owed work to a current authorized home before retiring unused tracking; no snapshot restore.    |
| Later messages, effects or independent work exist | Current work/context review; **Merge** only if genuinely the same request | Keeps real history. No promise to recall mail or reverse every effect.                                        |

When a displayed relationship combines several original links after a merge, removal reviews all contributors represented by that row and changes exactly that set. New unseen links or changed topology require a refreshed review, not partial removal disguised as completion.

The unused-cancellation preview names the destination for any restored current follow-up, such as **“Continue the sign-in request in the original conversation.”** It cannot retire the only live home for an obligation. Native/admitted/possibly submitted mail, later independent work, owner effects, merge/continuation/referral dependencies or a protected draft block that shortcut. Explain the current reason without exposing inaccessible details.

The canceled record remains an administrative creation-in-error history item under the existing end-of-work category, with separate retirement control; it is not a successfully resolved donor issue or a fifth everyday status. A retry of the old Create does not resurrect it. An unexpected later legitimate reply remains visible in routing recovery rather than disappearing.

## Visual, keyboard and mobile acceptance

Use the actual Asym shell and shared base-maia/Base UI components, semantic Zinc-oriented tokens, existing typography and spacing. Emphasize the request title, current owner/work and next action. Keep evidence and relation history secondary. Text labels accompany status color; avoid celebratory solved styling for a continuation or administrative cancellation.

No automatic notification/toast accompanies every related-state change. Required new work/referred review remains visible even if optional notification delivery fails. Background updates preserve focus; screen-reader status regions announce meaningful results. Source snippets never become public just because they render in a related context card.

Test keyboard selection, focus return, multiline Enter, Escape and pointer/touch equivalence. Public Send shortcuts cannot fire behind a creation/referral/correction panel. Closing after admission is not cancellation; lost responses preserve the same qualified private draft and reconcile the original receipt. Do not improvise a broad local-storage offline cache for sensitive content.

Test 400% reflow, narrow/mobile layouts, long international names, translated labels, explicit time zones, reduced motion and slow/interrupted connections. Use full-height mobile panels with clear returns rather than nested cramped sidebars. No hover-only context or icon-only consequential action.

## Required realistic validation

Representative staff must complete these journeys without being told which action to choose: a quick internal check; a genuinely independent request; two topics in one initial email; an old-thread reply after new-thread sending; an inaccessible source/different destination; a mistaken unused creation; a correction after real mail; and CRM inspection/return. Record task completion, wrong transfers, mistaken sends/closures/cancellation, lost context and comprehension. Unsafe misunderstanding blocks release. Report timing and friction without inventing a performance gain.

Controlled Gmail/Outlook/Apple Mail exercises must verify actual source/reply routing and document mailbox display limits. These client, accessibility and ministry usability checks are required future proof, not results claimed by this blueprint. All detailed cases map to D12-P01–P45 in the [full review](phase26-d12-adversarial-review.md).
