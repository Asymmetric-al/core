# Phase 26 Q4 — Independent Send-action evidence

Research checked 10 September 2026. D1, D2 and D3 are fully founder-ratified with
all amendments. [The current Q4 question](phase26-q4-send-action.md) proposes A =
Send preserving current work/reminder, B = Send and wait for requester, and C =
Send and resolve, with explicit alternatives under each choice. A is the single
recommendation. No D4 decision is ratified or implemented.

## Source hierarchy and synthesis

The three independent reports below preserve their exact source findings and
candidate reasoning. Temporary references to root updating D3 headers describe
their initial read during the ratification update; D3 is now fully recorded.
Final Q4 option letters are consistent across the reports and question.

Live worktree/develop were checked at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.
Open proposed heads remained #1335 `e1c86e1a30f479363960eeb35500112665e16bb3`,
#1336 `3b2827ffcf184bf767664018efedda317c7da03c`,
#1564 `0624ca3841ea98e618fed0e2c490d24c0ef1d9c1`.
No proposed branch replaced current source.

Important reconciliation: Front plain Send maps to Open, not preservation of an
existing wait/reminder. Zendesk explicitly describes retaining the current status
with Submit as that status. Help Scout recommends Closed as a starting inbox
default, making C a strong real alternative. Help Scout publication dates differed
across indexed/direct snapshots; the root's latest direct page displayed 9 September
2026 and reconfirmed the same Default Status text. The comparison uses current
checked behavior, not a claimed settled publication date. Zoho documents a case
of send succeeding while requested closure fails; Asym must not silently copy that
partial-admission behavior.

Preserving status means no work transition, never restoring an old snapshot.
Local combined admission is atomic under the existing D1/D2/D3 boundary; a provider's
later external outcome is a separate fact. No status preference, assignment change,
auto-close period, scheduled-send feature, reminder preset or new automation engine
is inferred from this question. No verified universal remember-last-send-action
behavior was found. No Asym reply-mix or staff-usability study establishes a globally
optimal default; A remains an explicit product judgment with candid costs.

This research changed only local grooming records. No app, database, provider,
real message, formal specification, implementation ticket or GitHub state was
mutated. Current UI/source observations are not runtime or usability proof.

---

# Q4 — Ordinary Send behavior and explicit combined work actions

Read-only Core evidence, 10 September 2026. The founder has ratified D3 in full; the root is updating its records. This report proposes the next question only. No Q4 choice, new default, implementation, formal specification, GitHub mutation or provider operation is authorized by it.

Execution directory verified in Ubuntu-24.04 at `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`. The parent freshly confirmed develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` and unchanged open PR #1335/#1336/#1564 heads. Local documents being ratified were read without editing them. Existing ADR header still temporarily said proposed during root's recording step; the user's new ratification, communicated by the parent, takes precedence. Source anchors below use the exact develop hash.

## Recommended next question

**When staff finish writing an ordinary email reply, what should the main Send button do by default?**

Illustrative comparison: Maria may send “I am checking with Finance,” “Which gift do you mean?” or “Here is the answer.” These are all valid normal emails but imply different work conclusions. We must let her complete either action efficiently without the system guessing her intent from text or from the fact she sent mail.

| Choice                                                     | Main action                                                                                                                                    | Benefit                                                                                                                                             | Cost                                                                                                                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Send reply; keep current work status — recommended** | Admit the reply and preserve the reviewed current work state and valid reminder. Explicit named Send-and-status alternatives remain available. | Stable meaning across progress updates, questions and final answers; no accidental resolution or requester obligation from a routine Send/shortcut. | When the reply changes what happens next, staff must choose the appropriate combined alternative or change status separately.                                                 |
| **B — Send and wait for requester**                        | Admit reply and explicitly set Waiting for requester when that transition is eligible. Other named actions remain available.                   | One primary action for replies that ask for necessary requester input.                                                                              | An investigation update, an own-side dependency or a final answer requires another choice. Default is unsuitable if staff do not actually need requester input.               |
| **C — Send and resolve**                                   | Admit reply and explicitly resolve eligible Support work, cancelling its current reminder under D3. Other named actions remain available.      | One primary action for replies that conclude the Support obligation.                                                                                | Progress updates, outstanding questions and active promises require another choice; premature resolution has a larger consequence than leaving a completed conversation Open. |

All three choices are credible product designs if the action visibly states both effects and obeys D1/D2/D3. B/C are explicit staff actions, not forbidden text inference, when the user intentionally activates the labelled button. No evidence establishes which reply type predominates in Asym or nonprofit missions teams. Vendor comparators can establish familiar supported patterns, not usage prevalence or the safest default for Asym.

**Recommend A.** The four-state model was chosen precisely because outgoing mail can mean different things. A stable Send meaning lets the staff member decide which change their particular reply supports. The benefit of B/C can be retained with compact, explicitly named alternatives, such as Send and wait for requester, Send and wait on our side, and Send and resolve. A current-state shortcut must not silently become tomorrow's new default. Avoid adding another personal/team/inbox default hierarchy unless the founder expressly asks for it; D2's personal audience preference does not automatically authorize a personal post-send work policy.

This question need not select exact split-button mechanics, shortcut combinations, long-term customization or provider transport. The user-facing promise is stable default versus explicitly named combined actions. A compact secondary action menu is plausible; whether selection immediately executes or stages the primary action should be settled and tested consistently during the answer's UX review, not hidden as two conflicting interaction conventions.

## Why Q4 before assignment

Q4 is the next natural dependency: D1 established ordinary email; D2 established recipient intent; D3 established work meaning and timers. Q4 determines how one everyday staff action joins or deliberately keeps those two effects separate. Its result affects command atomicity, button wording, keyboard behavior, default persistence, recipient review and recovery. Asking it now gives the composer a complete coherent basic contract.

Assignment remains important, but manual/team/unassigned accountability and current rights already constrain the reply path. Configuring round-robin, availability and routing is not needed to decide whether Send also resolves. Do not smuggle automatic assignment to sender, assignee impersonation, or status-based access changes into Q4. Assignment can follow once the basic response action is settled.

## Current source facts

| Source                                                                                                                                                                                                                                                                                                                        | Verified current behavior                                                                                                                                                                       | Implication                                                                                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ComposerActions:42-48,73-96](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/ComposerActions.tsx#L42)                                                                                                                         | Reply primary label is Send reply; note mode is Add note. Save draft is separate. No combined work-status action exists in this component.                                                      | Current UI resembles A superficially but does not prove correct preservation or delivery. Note submission must remain separate.                                                                                     |
| [use-composer-hotkeys:23-28](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-composer-hotkeys.ts#L23)                                                                                                                      | Cmd/Ctrl+Enter invokes the active primary callback. No isComposing or repeat/pending check appears here. The visible helper text says Cmd+Enter even though Ctrl also works.                    | The eventual shortcut must match the visible selected action and respect current safety/IME/pending rules. Disabled button alone is not a command boundary. This is a source gap, not an exercised browser failure. |
| [send hook:146-155,199-220](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/detail/composer/use-conversation-composer.ts#L146)                                                                                                                 | Checks actor/body, calls sendReply with mode send, then says Reply sent and resets current draft. Recovery retries the closure. No post-send work choice or durable command identity is passed. | The current local path does not provide D1/D2 admission, truthful provider state or stale-response-safe draft clearing. Those were already ratified safeguards.                                                     |
| [reply schema:80-85](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/schemas.ts#L80); [input type:91-105](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/types.ts#L91) | Input has conversation, caller-supplied author, send/draft mode and body; no reviewed audience, source-message target, work action, version or idempotency key.                                 | Q4 needs one explicit typed combined-effect contract if such actions are exposed; not two browser requests assumed atomic.                                                                                          |
| [reply write:904-939](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L904)                                                                                                                                                        | Creates a Queued row and invokes message bump; headers target the conversation contact.                                                                                                         | No real outbound completion is proved. User-visible Send cannot mean delivered or read. D2's group audience remains unchanged by Q4.                                                                                |
| [message bump:651-658](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L651)                                                                                                                                                       | A non-draft outgoing email sets first response/direction, clears snooze and changes Snoozed to Open.                                                                                            | “Keep current work status” must also preserve the valid reminder; current code is not a correct permanent implementation of A. Ordinary progress mail cannot silently cancel follow-up.                             |
| [status setters:837-868](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/admin/support-hub/adapter/supabase.ts#L837)                                                                                                                                                     | Independent status and snooze operations lack D3's reviewed transaction/identity contract.                                                                                                      | A client Send then status PATCH can partially succeed or race; do not build combined Send from that sequence without a canonical local admission boundary.                                                          |
| [inbox auto-resolve UI:187-200](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/admin/features/support-hub/components/settings/inbox/InboxSettingsForm.tsx#L187)                                                                                                                     | Existing UI exposes a days-based auto-resolve setting.                                                                                                                                          | This is inactivity policy, not a main Send action default, and D3 expressly leaves automatic no-response closure unchosen. Its existence cannot settle Q4 or ratify 14-day fixture defaults.                        |

No governing merged Support Send-default requirement was found in the scoped source/doc search. Existing `mode: send|draft` default concerns persistence mode; it does not decide whether work status should change after a reply.

## Already governed; not offered as optional alternatives

- **D1:** Normal external email remains accountless and useful; public reply admission uses reviewed content, exact recipients, genuine actor, collision protection and permanent effect identity. Phase17 prepares; Phase6 owns dispatch/evidence/history. One local operation cannot promise atomic rollback of an already externalized email.
- **D2:** Reply-all/sender preference initializes audience only. A Send action never readdresses from CRM, previous participants, another staff member or a changed default. Audience preference and post-send work choice are separate concepts. Notes cannot become public replies by changing the work action.
- **D3 R02/R08:** Direction, text, provider acceptance, notes and progress mail do not infer Waiting/Resolved. A labelled deliberate combined action can encode staff intent. Resolve cannot hide known outstanding obligations or required recovery; requester waiting must actually mean necessary requester input. Optional courtesy updates can preserve a genuine wait.
- **D3 R03/R05:** Typed allowed cause, current rights, reviewed versions, atomic local state/history/reminder/dispatch intent, immutable command result and separate current snapshot. Later incoming/owner/adverse events may legitimately supersede a combined action's state; retry cannot reapply the old post-send status over newer work.
- **D3 R06:** Explicit Resolve cancels the current reminder. Waiting-side changes preserve its valid due time. Plain Send is not explicit Open/Wake and must not silently clear a deferral. A fresh due timer or qualifying input still applies its own causal work transition.
- **D3 R08/R10:** Pending delivery is separate and recoverable; fresh actionable failure/uncertainty can reopen for review, including after resolution. Status correction never recalls email. Context/draft/focus remain stable; ordinary work updates do not silently advance to another conversation.
- **D3 explicitly open:** Main Send default, automatic no-response closure, SLA policy and reminder presets were not selected. This question can settle the main Send default without expanding the others.

Canonical local anchors: `docs/features/support-hub/grill/phase26-d3-adversarial-review.md:29-43,83-91`, `docs/features/support-hub/docs/adr/0003-explicit-waiting-and-dependable-follow-up.md:35-58,73-75`, and the complete ratified D1/D2 review records. The parent is updating ratification headers during this task; no old header overrides the user's express confirmation.

## Pressure tests to carry into the answer's review

1. **Current wait and future reminder:** ordinary Send progress update preserves them; explicit Send-and-resolve cancels under D3; no implicit Wake caused by queueing.
2. **Local admission failure:** for a combined action, no work transition may commit without its required durable reply intent/evidence, and no admitted reply may lose its required local work/audit result. A provider's later failure is a subsequent fact with causal recovery, not a fictitious rollback.
3. **Incoming reply races with Send-and-resolve:** the same reviewed version/collision boundary protects both effects. Incoming-first rejects stale approval; combined-first admits reply/resolution, then new input reopens. Replay returns original outcome without overwriting current Open state.
4. **Menu and keyboard:** primary label names actual effect, shortcut activates the same eligible reviewed action, IME/repeat/pending cannot bypass safety. No sticky action inherited from a previous conversation without an explicit new product decision.
5. **Recipient change:** changing reply-all to sender changes reviewed approval; old combined action cannot send stale recipients or reuse old identity after a content/audience change.
6. **Known own-side blocker:** Send-and-wait-for-requester is ineligible while D3's active own-side blocker remains. A system cannot infer that blocker from prose alone; existing typed facts and deliberate staff assertion define eligibility.
7. **Known promised next step:** Send-and-resolve cannot hide it. The UI must explain a real eligibility conflict without introducing routine modal confirmation for every normal completed answer.
8. **Reply on currently Resolved work:** do not automatically require a fake waiting/resolution cycle. The explicit action must be appropriate to the actual remaining obligation, current reviewed conversation and D3 resolution rules; repeat Resolve is a no-op rather than a new historical episode. Any truly new follow-up obligation is explicitly Open.
9. **Privilege change, unknown response or partial recipient failure:** preserve command identity and current access checks; do not resend successful members, restore revoked access, falsely announce Sent or restore an older work snapshot.
10. **No side effects outside the decision:** selecting a post-send action does not auto-assign staff, change CRM records, create a reminder duration, apply a marketing preference or start a new automation engine.

## Conclusion

Q4 is the appropriate next founder decision. Recommend a stable **Send reply** primary action that preserves current reviewed work and reminder facts, with explicit named combined alternatives for cases that change what happens next. The recommendation is a practical product judgment, not a claim of measured dominance or a new ratified default. The root should combine this Core evidence with the independent official vendor UX research before presenting the question.

---

# Q4 — Ordinary Send behavior and explicit send-plus-status actions

Research checked 10 September 2026. D1 email continuation, D2 audience defaults and D3 work-state amendments are ratified. This note prepares the next founder question; no Q4 default, new preference or implementation is accepted by this artifact. No account, message, inbox, provider, GitHub or product-code mutation occurred.

## Recommendation

**Recommend ordinary Send preserves the current work status, with explicit Send and set status actions in its adjacent menu.** This is a narrow Asym product judgment based on D3's carefully distinguished meanings, not a universal industry rule or a claim that the existing Core send implementation is sound.

A message can ask for information, provide an update while Finance is still checking, or give a complete answer. Its direction alone cannot distinguish those purposes. A stable Send action avoids changing responsibility merely because staff send an update. It costs an extra explicit choice when the reply genuinely changes the work state; the adjacent send-plus-status actions remove the need to send and then find another control.

“Preserve” means **do not perform a work-state transition**, not write the status captured when composition began back over current state. The shared D1/D2 send review still detects relevant concurrent changes. Plain Send must not undo a new reply's Open transition, clear a reminder as if explicit Open were chosen, or revive an old Resolved snapshot. Status-preserving Send and explicit Send-and-Open differ when an active deferral exists under D3.

## Strong current product comparisons

| Product / precise applicable source                                                                                                                                                                                                                        | Documented behavior                                                                                                                                                                                                                                                             | What it supports and does not establish                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Front — Sending options](https://help.front.com/en/articles/2431), edited 28 July 2026; composer, no relevant edition gate stated on this page                                                                                                            | Adjacent arrow offers Send, Send & archive, Send later, Send & snooze. Personal Preferences selects the default for that account; a different option can be used before each send.                                                                                              | Strong precedent for a compact split-button and explicit personal configuration. **Front plain Send means the thread remains Open**, not preserve-any-current-status. Do not miscite it as Asym's exact proposed behavior.                                               |
| [Front — ticket statuses](https://help.front.com/en/articles/1300288), edited 22 April 2026; latest Starter+                                                                                                                                               | Send preference maps to Send as open; Send & archive maps to Send as resolved; Send & snooze remains snooze/Waiting. A custom status cannot be selected as the default send status.                                                                                             | Demonstrates that product work semantics and available default actions are intentionally constrained. It does not prove all custom states are valid defaults or that every action is remembered from last use.                                                           |
| [Front — mobile app](https://help.front.com/en/articles/4907072), current page; new experience mandatory since 1 September 2026                                                                                                                            | Tapping Send offers sending choices; changing the default send button is listed as unavailable on mobile.                                                                                                                                                                       | Mobile and desktop configuration capabilities can differ. Asym must test its own touch/keyboard behavior rather than assume web docs describe every app. D4 does not need a mobile app or copy Front's offline autosending.                                              |
| [Help Scout — Inbox Settings](https://docs.helpscout.com/article/1267-mailbox-settings), current page checked 10 September 2026; Account Owner/Administrator settings                                                                                      | Inbox Default Status determines status after a reply. The page recommends Closed for teams starting out because incoming replies return Active; Active or Pending are alternatives.                                                                                             | The strongest contrary recommendation to Asym's proposed Send-preserves-state. Its default is **inbox-level**, not personal. It optimizes a different working convention; copying it would need deliberate agreement with D3 resolution meaning.                         |
| [Help Scout — Reply editor](https://docs.helpscout.com/article/69-respond-to-conversations), updated 23 July 2025                                                                                                                                          | Staff can override status/assignment defaults before sending. The defaults come from the inbox. The dropdown next to Send documented here controls after-send redirection.                                                                                                      | Shows available per-reply status overrides. Do not conflate a navigation dropdown with a personal status default or claim that Send's label necessarily names all effects.                                                                                               |
| [Zendesk — Updating and solving tickets](https://support.zendesk.com/hc/en-us/articles/4408832151834-Updating-and-solving-tickets), edited 1 May 2026; standard/custom ticket status options depend on account/form configuration                          | Submit applies comments and changes. To retain status, use Submit as [current status]; the arrow selects another status. Ticket status can also change without a new comment.                                                                                                   | Direct support-product precedent for preserving status or explicitly selecting an alternative. This is a combined ticket-update model, not proof of Asym's transaction/transport semantics or an automatic remembered-last-state feature.                                |
| [HubSpot — Help Desk updated composer](https://knowledge.hubspot.com/help-desk/use-the-updated-reply-editor-in-help-desk), updated 21 August 2026; **beta**, Service Hub Professional/Enterprise                                                           | Staff can use Send or choose a status from the adjacent dropdown; choosing that option sends and updates status, after required properties where applicable. The documentation discusses altering email-triggered status automation to avoid reversion.                         | Strong precedent for fully labelled send-plus-status commands. Plain Send's ultimate status may also depend on configured automation; the page does not establish a universal status-preserving default or last-action memory.                                           |
| [HubSpot — pipeline email automation](https://knowledge.hubspot.com/object-settings/set-up-pipeline-automations-for-objects), current documentation checked 10 September 2026; Service Hub Starter/Professional/Enterprise for associated-email automation | Email sent from a ticket and replies can be configured to change status; emails from the contact record do not trigger the same change.                                                                                                                                         | Warns of hidden competing writers and surface-dependent effects. Asym's single Support transition boundary should not be silently overridden by a separate email-direction rule.                                                                                         |
| [Zoho Desk — Actions while replying](https://help.zoho.com/portal/en/kb/desk/ticket-management/actions-in-tickets/articles/actions-available-while-replying-to-a-ticket), undated current page                                                             | Send-and-update is enabled by default and can be disabled from preferences. Staff select the desired status before Send. Permissions/blueprint/validation affect availability. If parent closure is blocked by open children, mail can still send while status stays unchanged. | Strong combined-action precedent and a concrete partial-success caution. Do not claim all such operations are atomic externally or copy silent fallback. The page does not establish the target default status, all persistence scopes, or automatic last-used behavior. |

**Source date discrepancy:** Help Scout Inbox Settings search output labelled the page updated 8 September 2026, while the directly retrieved footer said 19 May 2025. Both returned the same relevant Default Status text. Cite it as current page checked on the research date and preserve this discrepancy rather than selecting a convenient publication date. No vendor account was tested.

### Remembering a last action is a different feature

The official pages above clearly establish configured defaults and explicit alternatives. This research did not verify a universal behavior where the last send action silently becomes the next reply's default. Do not claim Front, Help Scout, Zendesk, HubSpot or Zoho all do so. Front documents an explicit personal setting; Help Scout documents an inbox setting; Zendesk describes retaining the ticket's current status. Those are different scopes.

D2's personal **Reply all / Reply to sender** preference answers _who receives this reply_. It does not select work status, timer behavior, after-send navigation, or assignment. Reusing a settings screen or persistence primitive is possible in implementation, but the accepted D2 preference does not authorize another product behavior by implication.

No Asym reply-mix study establishes the proportions of final answers, requests for information or progress updates. The comparisons demonstrate viable alternatives, not measured nonprofit superiority. Donors continue normal email under every option and acquire no portal or acknowledgement requirement.

## Three defensible defaults

Each option retains the other actions explicitly. The question is which action occupies the ordinary primary button, not whether staff can ever perform another outcome.

| Default                                      | Intended benefit                                                                                                                            | Strongest cost / realistic failure                                                                                                                                                                                                       |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Send; keep work status — recommended** | No new work meaning is inferred. Progress updates keep the existing wait, and explicit combined actions cover changed responsibility.       | Staff must deliberately classify a completed answer or a newly requested input; otherwise an Open item may stay actionable unnecessarily. A clear nearby menu and D3 status control reduce that friction.                                |
| **B — Send and wait for requester**          | Fast when a large share of replies genuinely requests the missing input. The button explicitly tells staff which outcome they are choosing. | A progress update or complete answer can be misclassified; it must not override an active our-side blocker. There is no Asym evidence that this is the dominant reply pattern.                                                           |
| **C — Send and resolve**                     | Fast for complete answers; keeps a high-volume actionable queue short. Help Scout's recommendation makes this a credible alternative.       | Staff must notice and change it for questions, promised follow-up, active owner dependencies or unreviewed recovery. If they forget, unfinished work can appear complete and reporting becomes misleading. D3 eligibility still applies. |

A labelled default combined action is explicit staff intent, so B/C are not automatically forbidden by D3. But the default remains a convenience, never permission to skip current authorization, eligibility, reviewed revisions, or recovery. Neither B nor C should secretly appear on a button labelled only Send. All choices preserve D2's reviewed audience and the established owner-domain boundaries.

## Best narrow interaction recommendation

Use the existing Base UI/base-maia split-button pattern or shared equivalent: primary **Send** and an adjacent **More send options** menu. There is no toolbar with five permanent actions and no required modal after a normal send.

The action menu can offer:

- **Send — keep status**
- **Send and set Open**
- **Send and wait for requester**
- **Send and wait on our side**
- **Send and resolve**

These are commands, not ambiguous labels such as “Pending” or “Done” beside a Send button. Selecting a fully labelled command can submit it directly after normal validation; opening/navigating the menu does not submit. If the implementation instead stages a selection before the final click, its primary label must visibly change and remain attached to that draft. Pick one interaction model and prove it consistently across keyboard/touch; do not mix immediate-send options with silent staging.

For the recommended narrow model, menu commands act only on this reply, and primary Send remains the next draft's stable default. Do not silently remember the last combined action, introduce personal/team/inbox status-default hierarchies, infer intent from AI/text classification, or add a new after-send navigation preference. Those are separate product choices if a real need emerges.

The header continues to show current work status; the composer continues to show actual D2 To/Cc addresses. Choosing a combined action must not readdress the draft, mutate CRM facts, assign a new person or alter a reminder beyond the ratified transition semantics. Plain Send does not act as explicit Open and therefore does not cancel a current deferral. Choosing Send-and-Open intentionally does; choosing Resolve cancels an eligible current reminder under D3. Waiting-side changes preserve it.

The ordinary keyboard shortcut performs the primary visible action, including the same review/collision checks. It must not use yesterday's combined action or bypass the current draft audience. Menu shortcuts must not fire while typing/IME is active. Focus, draft, queue and current-state handling stay as D2/D3 define them.

## Combined effects and truthful feedback

Before admitting a combined send, validate both sending authority and the requested work transition. Known failure or a stale reviewed conversation should not silently downgrade a requested Send-and-resolve into Send-only. Retain the draft and explain the blocked combination; staff may explicitly choose an eligible alternative.

Admission of the approved message, work intent and required durable effects uses the existing shared command/transaction/intent model. The database cannot atomically commit a remote provider's final delivery. After admission, provider delay/failure remains a distinct messaging outcome; D3's qualified failure-review behavior applies. A success message must distinguish **accepted/queued** from provider-confirmed results and not imply every recipient received the reply.

Retries reconcile the same immutable approved content, audience and action identity; they do not resend the message merely to retry a status update. An older successful operation receipt cannot replace a newer canonical work snapshot. Correction does not recall mail or reverse an owner-domain action. These are inherited D1/D2/D3 constraints specialized to the combined UI, not a new sender or workflow engine.

No new Send-later, Send-and-snooze preset, automatic close email, requester courtesy acknowledgement, default reminder interval or SLA rule is selected by this question. Existing qualified capabilities remain separate. In particular, a fixed send default cannot decide the open no-response/withdrawal/duplicate closure policies.

## Proof focus after the founder chooses

Test three synthetic replies with identical sender direction but different intent: asking Sarah which gift; updating Sarah that Finance is still checking; and giving a complete ordinary answer. Verify that the explicit action, not the presence of outbound text, selects work outcome.

For A, plain Send on each supported work state performs no work transition and preserves applicable reminders. Explicit Send-and-Open clears deferral according to D3; each waiting action and Resolve observes the ratified meaning and eligibility. A stored draft and a newly initialized draft do not inherit a one-off combined action invisibly.

For B/C, prove the primary label names the combined effect, staff can readily choose another action, and known incompatible obligations block the combination without silently sending anyway. Also test exact audience persistence, authorization loss, a new incoming reply during composition, duplicate click, lost admission response, uncertain provider success, late bounce, and current-state versus operation-receipt ordering.

Usability testing must establish whether representative staff can identify what pressing the main button will do, pick the correct combined action, and recover from a conflict without coaching or losing work. There is no current empirical basis for a fixed speed improvement or a claim that more automation means fewer errors.

## Proposed next founder question

**When staff press the main send button, should it only send the reply, or also change the conversation's work status by default?**

Sarah's receipt question illustrates why this matters. “Which gift do you mean?” calls for requester input. “Finance is still checking” leaves work on our side. A complete answer can resolve the support request. All are ordinary outgoing emails.

Offer A/B/C from the table above, recommending **A — Send preserves the current work status**, with explicit adjacent **Send and wait… / Send and resolve** actions. Explain the tradeoff candidly: A requires an intentional status choice when responsibility changes; it avoids making every progress update a request or a completion. Modern products support combined actions, but their defaults differ. Help Scout recommends Closed, while Zendesk supports updating without changing status, and Front exposes configured personal send actions. Cite the exact scoped sources rather than asserting an industry consensus.

This question does not ask the founder to choose provider ordering, a transaction shape or UI component API. The evidence and inherited safeguards make those implementation consequences reviewable after the product choice.

---

# Q4 independent challenge — the default reply action is the next useful decision

Read-only preparation, 10 September 2026. Repository directory verified as `/home/conrad/code/core-worktrees/grill-with-docs-2026-09-10`, baseline `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Parent reports D3 and amendments have just been ratified and is updating records; the initially read disk log still contained the prior pending marker. D1/D2/D3 are treated as the current accepted direction. No implementation, formal specification, provider action, production operation or GitHub mutation occurs here.

## Highest-value next question

**Choose the primary email reply action next.** D2 establishes whom a reply addresses; D3 establishes the work meaning. The composer now needs to connect those accepted concepts without making every reply accidentally change the kind of work. This is an immediate user-flow decision affecting every staff reply.

Assignment ownership is important, but does not block this choice: a send must already use the authenticated actor and correct authorization; D3 permits unassigned work to remain visibly unassigned and separates assignment from status. Q4 must not quietly add “replying claims the conversation.” No-response closure comes after the accepted waiting meanings and involves a different question—when the Support obligation can be considered finished without a reply. It should not be smuggled into a Send default.

## Proposed single founder question

**“What should the main reply button do by default: send while keeping the current work status, send and wait for the requester, or send and resolve the request?”**

Use one concrete comparison. Maria may be sending Sarah a progress update, a question requesting missing information, or the final answer. Those are different work outcomes even though all three are outgoing email. D3 already defines how each should be classified; Q4 chooses which action gets the primary position, with clearly named alternatives available.

| Option                                       | Main button / meaning                                                                                                                                                                                                                             | Strongest benefit                                                                                                                         | Real cost                                                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Send; keep work status — recommended** | **Send reply** sends the reviewed draft and leaves current work status/reminder as they are. Explicit **Send and wait for requester**, **Send and wait on our side**, and **Send and resolve** remain available through one adjacent action menu. | Stable behavior works for progress updates, ongoing investigations and already-correct waiting states without quietly reclassifying them. | Staff completing a request or asking for required information make one deliberate alternate-action selection; otherwise completed work may remain Open until explicitly resolved.                                    |
| B — Send and wait for requester              | **Send and wait for requester** is primary; Send only and the other combined outcomes remain available.                                                                                                                                           | Fast when most replies request the external participant's next input.                                                                     | Wrong for progress updates, final answers and our-side waits; no measured Asym workload establishes this as the dominant pattern.                                                                                    |
| C — Send and resolve                         | **Send and resolve** is primary; Send only and both waiting outcomes remain available.                                                                                                                                                            | Fast for one-answer support and keeps the active queue focused. Mature help desks support this workflow.                                  | A progress update used habitually with the primary button can falsely complete an outstanding promise and cancel its reminder under D3. The prominent button must always state Resolve, never hide it behind “Send.” |

**Recommendation A is a product judgment, not a universal help-desk best practice.** It best preserves D3's meaning and gives the staff member a predictable send path; C is the strongest alternative where final-answer replies predominate. No traffic study proves that A minimizes clicks overall. Its practical advantage is that it avoids guessing message intent and works with the status staff already deliberately set.

Do not force a fourth option that chooses status through AI/content inference. Do not add a required outcome questionnaire for every send; the clear combined actions make the necessary choice available at the action itself. The primary choice is not a decision to omit productive one-action combinations.

## Adversarial pressure test

### “Send only” is not always Open

Current work can be Waiting on our side while Maria sends a reassurance or progress update. D3 expressly preserves such a genuine wait. A must retain the exact current work meaning and valid reminder; it cannot silently implement Front's documented Send-as-open mapping. A staff member sending a substantive next-step request that changes the blocker should select the corresponding combined action. If current work changed after the draft was reviewed, stale-review checks apply; “keep” must not freeze an old state over new work.

### Default Resolve is a credible alternative, not necessarily unsafe

Help Scout recommends Closed as an initial inbox default after a reply, and Front supports Send-and-archive/Send-as-resolved. In a workflow dominated by complete answers, C can reduce clicks and queue cleanup. It is compatible with D3 only when **the staff action visibly says Resolve and is used as an explicit completion decision**. It must not be inferred from the act of emailing or equated with provider delivery. The risk is habitual misuse on progress requests, not that the labeled combined action is inherently invalid.

### Default Wait-for-requester is conditional, not evidence-based here

An outgoing reply may ask for required information; then the named combined Waiting action is useful. But selecting Waiting by default for every email assumes a response is required. D3 already rejects treating courtesy acknowledgement, progress mail, and ministry-owned work as requester obligations. B remains a viable product choice if Conrad expects an exchange-driven default, but the available evidence does not make it the strongest recommendation.

### Atomicity means durable admission, not a transaction with the mail provider

One reviewed combined action must admit the immutable reply and chosen work transition together in the product boundary, including required history, recipient authorization and reminder effects. It must not call two unrelated mutations where either one can succeed alone. It also cannot promise an ACID transaction with Resend or wait for a webhook before returning a usable staff result.

The local success is **the combined action was durably accepted**. The message displays its actual queued/sending/delivery evidence separately. A definitely rejected send admission applies no chosen status transition. A lost response is reconciled by the same operation identity. A later qualified delivery failure creates D3 Open review work through its causal boundary without erasing the original action or claiming the provider never accepted it. Existing D1/D2 group-member, collision, idempotency and protected-content gates remain intact.

### D3 reminder consequences must be visible and preserved correctly

With A, send alone does not cancel a valid reminder. A combined waiting-side-only change preserves its reminder under D3. Send-and-resolve cancels the current reminder atomically; that consequence should be explained where it matters, without a mandatory confirmation popup for every ordinary final answer. An explicit Open transition clears deferral under D3, but A is not an implicit Open transition. Do not conflate future-send scheduling with a follow-up reminder.

### A personal default is not automatically authorized by D2

D2's personal preference concerns Reply versus Reply all—audience initialization. It does not already authorize a second per-user default for work status. Front demonstrates that personal send defaults are feasible, but adding one now adds another remembered dimension beside audience, note mode, target and work status. Recommend a single product primary action with per-draft named alternatives for Q4; no sticky “last used,” automatic learning, or hidden per-conversation behavior.

If Conrad expressly asks for a personal action default, apply the same tenant/user scope, explicit setting, once-per-new-draft initialization, honest loading/failure and immutable admission rules as D2. The visible button must state the effective action each time; preference changes cannot modify an in-progress draft's staged combined action. That is a further explicit preference choice, not a reason to complicate today's menu by default.

### Keyboard and interface contract

Use one clearly labelled primary button and one adjacent action menu with full action labels. The current effective action must be visible at the point of sending. Keyboard submission must execute the same displayed action and same validated command, with IME protections. Avoid keyboard Send silently preserving status while mouse Send resolves, or vice versa.

Per-email action selection is local to this draft and preserves body, attachments, audience and context. A note remains Add internal note, without borrowing external reply actions. Sending or changing status does not auto-advance the conversation; D3 already keeps ordinary changes in place with explicit Next. Do not add a second permanent status toolbar or duplicate the header's status picker just to expose combined actions.

## Current Core source

- `apps/admin/features/support-hub/components/detail/composer/ComposerActions.tsx:42–48,86–97` renders Send reply / Add note and one send handler. It does not offer combined status actions. Current uppercase styling and “Send reply to donor” accessible name are not proof of the future inclusive polished UI.
- `use-conversation-composer.ts:199–208` submits `{conversationId,authorAgentId,payload,mode:'send'}` then reports Reply sent and resets. There is no chosen post-send work action.
- `packages/api/src/admin/support-hub/schemas.ts:80–85` has no source/audience/revision/combined-action input; `adapter/supabase.ts:904–939` queues a message and updates the conversation separately.
- `adapter/supabase.ts:632–658` clears snooze and may set Open after any non-draft outgoing email. Therefore current “Send reply” does not actually preserve work/timer semantics. This is D3 debt, not a reason to redefine A as “whatever existing code does.”
- D3-R02/R08 keep message direction, queued state and Support obligation separate; D3-R03 requires atomic trusted conditional effects; D3-R06 defines reminder preservation and cancellation; D3-R10 preserves detail/context after actions. Q4 must compose these ratified rules rather than reopen them.

## Current primary comparisons

- [Front sending options](https://help.front.com/en/articles/2431), edited 28 July 2026, documents Send, Send & archive, Send later and Send & snooze, plus a personal preferred send button. With ticket statuses, Send maps to Send as open and archive maps to resolved. It supports clearly named combinations; it **does not establish that Send preserves an existing Waiting status**. Omit its unrelated scheduled-send/shared-draft behaviors from Q4.
- [Front ticket statuses](https://help.front.com/en/articles/1300288), edited 22 April 2026, documents those personal-preference mappings and says a default custom status cannot be selected. Do not claim unlimited custom default outcomes are a proven Front capability.
- [Help Scout inbox settings](https://docs.helpscout.com/article/1267-mailbox-settings), updated 8 September 2026, documents an inbox Default Status after reply and recommends Closed initially, with Active/Pending alternatives. This is the strongest evidence against pretending the conservative default is universal. Its Default Assignee and auto-BCC settings are separate; Q4 must not import those effects.
- [Help Scout status meanings](https://docs.helpscout.com/article/11-understand-conversation-icons-and-colors), updated 1 May 2026, distinguishes Active/Pending/Closed and reopening on customer replies. Its Pending includes time needed to gather information; that is not identical to Asym's requester-only wait.
- [Zendesk public reply and Submit](https://support.zendesk.com/hc/en-us/articles/4408881925786-Lesson-1-From-support-requests-to-tickets), current official lesson, documents public reply submission with selected status. It supports showing the chosen outcome with the action. Do not import New/assignment/locked Closed semantics into Asym.

Search checked 10 September 2026. No vendor account experiment, staff usability study, actual DB transaction or provider delivery was performed. The evidence establishes behavior and alternatives, not undocumented vendor architecture or quantified Asym workload prevalence.

## Proof obligations once the founder chooses

One atomic approval identity; current actor/resource/recipient and D3 eligibility checks; exact named status effect; no client/provider split success; no false Sent/Delivered claim; preservation/cancellation of the right reminder generation; failure-induced causal Open review; identical keyboard/mouse semantics; no cross-draft remembered outcome; lower-revision response cannot overwrite newer work; owner-domain action remains independent; note and assignment semantics unchanged. These are sufficient bounded safeguards—no new automation engine, broad preference hierarchy, task system or no-response closure policy is necessary.
