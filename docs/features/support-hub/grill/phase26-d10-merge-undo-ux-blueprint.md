# Phase 26 D10 — Merge and Undo without losing context

11 September 2026. Founder selected C and explicitly requested **Undo merge**, intuitive mistake prevention and a clean interface. **This full UX amendment package is fully founder-ratified, 11 September 2026, including all adopted amendments, additions, adjustments, changes and updates.** D1–D9 remain ratified. It accompanies the [25 requirements, 23 categories and 39 proof groups](phase26-d10-adversarial-review.md) and [evidence register](phase26-d10-evidence.md). No rendered product, usability study or implementation success is claimed.

## The interaction model

Staff review two confirmed duplicates, choose where to continue, and merge once. They then work in one familiar conversation with both original histories available. **Undo merge…** remains reachable in the merge history and separates that particular merge using a preview of the current result. New messages and staff work are kept.

This is deliberately more useful than an irreversible merge or a toast that disappears before the mistake is noticed. It also avoids an unpredictable Undo that sometimes restores old state and sometimes fails because someone replied. One preview-and-confirm flow works immediately and later. This applies established user-control and consequence-review principles to shared Support work; it is an Asym design judgment, not a measured universally optimal interaction. [NN/g user control](https://www.nngroup.com/articles/user-control-and-freedom/), [confirmation guidance](https://www.nngroup.com/articles/confirmation-dialog/).

## 1. Start quietly from the conversation

Example: Maya sends two separate emails about the same missing receipt. Staff confirm they represent one request. This is an illustrative scenario, not evidence about tenant volume or donor behavior.

Use **More → Merge duplicate…** in the existing Support detail. Do not place a large Merge button beside Send, add duplicate-score badges everywhere, or infer duplication from email/subject/CRM matches. No mandatory Party link or account exists just to merge ordinary support work.

The dialog searches for one other qualified conversation. Results include permitted subject, stable reference, sender observations, current work and date, enough to distinguish similar items. An inspection action opens actual content while preserving the selection. Search results and counts never reveal protected candidates. The launch scope is two current work components in the same inbox; use normal authorized Move first when appropriate. A safe eligibility reason can say **Keep these conversations separate** without revealing hidden inbox or classification details.

Selecting a result only stages it. No email, assignment, status or database link changes yet. Existing private draft text remains the worker's own.

## 2. Review the exact result once

Two compact cards are side by side where comfortable and stacked on narrow screens. Label the choice **Continue in**. The current conversation is visibly proposed; the worker may change it. Avoid “master,” “winning customer” or a hidden most-messages/latest-updated rule.

Conceptual layout using the shared Maia components, not a new visual system:

```text
Merge duplicate conversations

Continue in
(●) #1042  Missing receipt       Open · Alex
( ) #1079  Receipt question      Waiting for requester · Shared

After merge
#1042 · Open · Alex
Follow-up: Fri 18 Sep, 09:00 [displayed time zone]

Both histories stay available. No email will be sent.
You can undo this merge.

                         Cancel   Merge conversations
```

Dates and identities above are illustrative display values, not product defaults. Real previews show exact current data. Include priority when the result changes meaningfully; retain ordinary label/context detail behind a small disclosure rather than a field-by-field winner table. The staff subject follows the explicitly chosen continuing conversation; original email subjects do not change.

The **After merge** summary comes from the server-qualified result: one current work meaning, handling and follow-up. Open takes precedence for actual action/review; mixed waits follow D3. The proposed priority uses the two current work components, not dormant source values. Effective labels and Related records retain their original provenance rather than being copied to the root.

Only show extra choices when there is a real conflict:

| Situation                                                               | Focused interaction                                                                                                                                 |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| One applicable current reminder                                         | Show the exact retained due time.                                                                                                                   |
| Two reminders, including equal times with different purposes            | Show both original purposes/dates and require one explicit shared plan. Suggesting the earlier date does not silently cancel a distinct obligation. |
| Follow-ups are actually separate commitments that one plan cannot cover | Keep the requests separate; do not offer a misleading successful merge.                                                                             |
| Current handler cannot handle the result                                | Choose a currently eligible handler or qualified Shared handling through existing assignment controls.                                              |
| D8 review or D7 Keep is required                                        | Show the existing qualified action; settle it explicitly if the worker has authority, otherwise return through the ordinary review path.            |
| A relied-on source/permission/work fact changed                         | Retain selection and say **This conversation changed. Review the updated result.**                                                                  |

No typed confirmation phrase, required essay or second generic “Are you sure?” is needed. A precise preview and clear action label supply the review. Moving focus or selecting a search result never activates Merge.

## 3. One continuing place to work

After durable success, open the continuing conversation with the existing composer, work status, reminder, assignment and CRM navigation. The source no longer occupies a second independently worked queue row. It is not relabeled as a successful resolution merely to remove it from a list.

Show a quiet system event such as **Conversation #1079 merged into this conversation**, with who/when and permitted **View original** / **Undo merge…** actions. It is internal audit/provenance, not a public reply or CRM Communication entry. An optional success message helps orientation but is not the only route to Undo.

One chronological staff history contains current permitted source messages and notes. Their original timestamps, authors, recipients and evidence remain intact. Use subtle provenance on source transitions/details rather than a bright source badge on every message. Original-history inspection remains available, including through stable links. The view must not imply that the two original email threads were always one.

The composer retains a specific target message and exact reviewed recipients. Incoming updates from either source participate in the same collision protection. Drafts opened from different original URLs cannot race through separate send guards. An admitted send remains the original effect even if a merge or Undo changes where staff now handle it.

The donor can reply normally to either original route while the work is combined. Asym resolves the qualified source and current work; it does not ask the donor to log in or select the “correct” ticket. Their email client may still display two old threads. No claim is made to retroactively combine Gmail/Outlook history.

## 4. Undo is persistent and specific

Both **Undo merge…** in success feedback and the persistent action on the merge event open the same current-result preview. There is no arbitrary expiry, requirement to act before any new message, or latest-merge-only restriction.

The preview names the actual two resulting work items and their current content boundaries. Its primary action is **Undo merge**; Cancel leaves work unchanged. It does not say “restore everything exactly.”

```text
Undo merge

These conversations will be handled separately.

#1042  Missing receipt
Current work: Waiting for requester · Alex

#1079  Receipt question
Current work: Open for review · Alex

New replies stay with their original email conversation.
Notes and links added to #1042 stay there.
Sent emails and completed actions are kept.

                              Cancel   Undo merge
```

The original-source names above remain illustrative. Actual cards must reflect current topology and authority. The detached side defaults to Open for review; the continuing side retains only a still-valid current plan. A current eligible handler may be proposed for the detached side as a **new** reviewed assignment; the old pre-merge assignee is never silently restored. Current coverage/review rules still apply.

If a still-active combined reminder applies to both results, add one exceptional **Follow-up** row: **Keep for both** or **Choose separately**, showing the exact due time. This choice is explicit. A Waiting result may keep its reviewed wait and reminder; an Open result with a future reminder is an intentional Open-and-remind plan, not hidden deferral. A time already due becomes Open/Follow-up due. An old canceled or completed timer is not revived.

This is one short correction flow, not a manual reconstruction form. The system knows original messages, current source membership, actual link/label origins and current reminder scope. It asks only for current work choices that cannot safely be inferred.

## What happens to later activity

| Activity after the merge                                       | Result of Undo                                                                                                                             |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Maya replies to a message originally in #1079                  | It stays with #1079's original thread/component.                                                                                           |
| Staff replies to that specific message                         | The reply, recipients, attachments and delivery evidence stay with that source.                                                            |
| Staff adds a general note from continuing #1042                | It stays with #1042. Text mentioning #1079 is not an instruction to move it.                                                               |
| Staff adds a new related Party or label from #1042             | It stays on #1042's original endpoint. Adding something already effective is a no-op, not a hidden root copy.                              |
| Staff removes a Related link contributed by #1079              | It stays removed; Undo merge does not restore the old set.                                                                                 |
| Staff changes current work or completes an owner-domain action | That history remains. Undo creates current work plans and cannot undo a refund or contact change.                                          |
| A provider reports a late failure                              | The original send owns the fact; its current component receives qualified review work once.                                                |
| New input races with Undo                                      | The atomic current-state boundary determines which preview/result includes it. It cannot disappear or create duplicate work on both sides. |

If the original source cannot be established safely, the existing durable thread-review path retains the input. The system does not guess based on the current root, the message text, the newest update or matching CRM email.

## Later merges remain understandable

The implementation retains narrow merge relationships, not a graph editor exposed to staff. For example, #1079 is merged into #1042, then #1042 is merged into #1100. **Undo the first merge** separates #1079 and its still-attached originals; #1042/#1100 remain combined. **Undo the second merge** separates the #1042 group from #1100.

The preview shows actual current membership. A source already separated earlier stays separate; another conversation added later to #1100 stays with #1100. Staff do not need to understand trees or database edges. A concise expanded explanation is available when a merge includes more than two original sources.

An ended merge shows **Already undone** and safe current navigation. Re-merging later is a new action; replaying an old Undo cannot reverse it. Current routes must be resolved again rather than permanently cached to an old destination.

## CRM and database consequences users can trust

Original conversation IDs, messages, D9 links, label origins and actual communication events are retained. A versioned Support relationship changes current handling. Undo ends that relationship and creates current resulting work plans. There is no transcript-copy synchronization between Support and CRM.

CRM **Support conversations** resolves each qualified original relevance/correspondence basis to current handling, then deduplicates. While combined, a Party sees one row where permitted. After Undo it may see two, but only when it independently relates to both results. **Activity → Communication** continues to show genuine source-owned messages; Merge/Undo adds no email, contact metric or ordinary Activity marker.

The combined Related records view is a deduplicated current union with retained origin. Remove ends the exact current contributing links under permission and revision checks; it does not erase source correspondence. Undo a context edit remains its own exact-delta action and cannot undo or recreate a conversation merge. Existing gift/document/CRM actions always use their owning permissions and exact target.

The normal combined work view requires current qualified access across the source conversations; fields, notes, attachments and CRM records may have stricter policies. Same inbox alone proves nothing about authorization. When rights change, current protection applies immediately. A safe source-only view or owner recovery must not disclose hidden members or root metadata.

## Errors, accessibility and visual restraint

While committing, show **Merging…** or **Undoing merge…** and prevent repeat submission. After an ambiguous response, say **Checking result…** and reconcile the original action. Do not tell the worker to retry a new opposite action before knowing whether the first committed. Leaving the UI after admission is not a server rollback.

Distinguish no eligible match, source unavailable, current denial, changed result, already combined and already undone. Keep important recovery information after transient feedback disappears. Existing allowed CRM details remain usable when an optional projection fails; stale cached data never grants authority.

Use the established base-maia/Base UI dialog, search and action components with semantic tokens. Keep a clear reading order, restrained hierarchy and comfortable targets. Preserve keyboard operation, meaningful labels, initial/contained/restored focus, safe Escape/Cancel and programmatic outcome announcements. No hover-only explanation, color-only state or decorative motion is needed. On mobile, cards stack; long international names wrap or reveal their full permitted form accessibly. Dates use the existing locale/time-zone controls. [W3C error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html).

## Proof required before activation

Run the full D10-P01–P39 suite at real source/database/authorization/routing and UI boundaries. Include a representative worker finding the right pair, understanding Continue in, handling a reminder conflict, replying through an original route, navigating CRM, and discovering/using Undo after later activity. Verify keyboard, screen reader, narrow screen, zoom and low-bandwidth recovery manually as well as through applicable automated tests.

The full review supplies eight residual signal/threshold/owner/response entries. It requires Merge and Undo to activate together, with safe disabling of new merges that preserves existing routing and correction. This is the complete founder-ratified UX contract; physical UI implementation and real usability validation remain explicit future-stage proof obligations.
