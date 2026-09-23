# D37 — My drafts from first words to a finished reply

**Current ratification — 14 September 2026:** The founder has fully ratified D37 A and all amendments, additions, adjustments, changes, updates and final corrections. D1–D37 and all amendments are fully ratified. The [complete ratification](phase26-d37-full-ratification.md) incorporates this record in full, including all supporting prose. Earlier proposed/pending/intent-only and no-Q38 wording below is historical and creates no repeat approval gate. Evidence and unexecuted runtime-proof limits remain unchanged.

This is the complete proposed UX for the founder-selected private My drafts view. [D37-R01–R28](phase26-d37-adversarial-review.md) govern the exact behavior; this blueprint is a design artifact, not a rendered or tested product. Existing base-maia/Base UI remains the visual system.

## Begin in the conversation

Maya opens a Support request from its permitted CRM context and begins an answer. Opening Reply alone creates no draft. Once she makes a meaningful author change, the same composer quietly saves the complete private candidate. A small status line below the editing area says Saving, then Saved only when her newest eligible work is acknowledged. Ordinary successful saves do not create toast noise or move focus. Save now is available for deliberate checkpointing; an actual failure exposes Retry save.

She can write incomplete text, leave a required fill-in unfinished or still be choosing recipients. Saving preserves that incomplete work safely; sending requires the full validated reply. Unknown canonical content or forbidden source material is not treated as harmless incompleteness. An unfinished file upload has its own explicit status: saved text does not imply the file bytes are saved. Before navigation would destroy those local bytes, preserve the qualified existing transfer, wait for completion, or explicitly offer Leave without this unfinished attachment. Saved text survives; the missing file remains honestly pending/failed rather than falsely restored from a manifest. Combine this consequence with any unsaved-text/unknown-save warning in the same guard. No Send, internal note, task or CRM Activity results from saving.

If Maya consults CRM context without unmounting the composer, writing stays exactly where it is. If navigation would unmount it, the owner completes current IME input and saves the latest bundle. Routine success continues without a dialog. A known failure offers Retry/Stay or explicit Leave without saving these changes; an uncertain result is checked under its original operation before the UI can claim failure. If checking cannot complete, offer Stay or explicit Leave with **The earlier save may still finish; your latest unacknowledged changes may be lost**. Preserve its minimal scoped recovery handle; do not trap the person indefinitely or claim leaving canceled the write. Browser crash/close cannot guarantee the newest unsaved keystrokes; the UI must never claim otherwise.

## A predictable place to return

**My drafts** remains a visible entry in the existing Support work navigation, even when empty. No badge count, urgent colour or forced landing page is needed. The page starts with the title My drafts and a short explanation: **Your saved replies across your accessible inboxes.** Product access is private to their author; separately qualified infrastructure/privacy custody remains governed by its owner rather than becoming an admin draft browser.

A restrained conceptual layout:

```text
My drafts
Your saved replies across your accessible inboxes.

[Search conversation titles…]   [Inbox: All accessible inboxes] [Refresh]

Receipt question                         Donor care
Alex · Saved 12 minutes ago                          [More]

Travel document question                 Member services
Original request B · Review needed · Saved yesterday [More]

[Load more]
```

Names and requests are illustrative, not ministry research or proof of record authority. Row identifiers come from currently permitted source metadata. There is no body snippet, quote text, recipient list or thumbnail to accidentally expose private writing or trigger asset fetches. A visible requester is conversation context, not a promise they remain the draft's exact recipient. If current target and immutable draft origin differ through deliberate merged-source work, display their distinction clearly enough to resume the intended draft.

Use regular readable type, shared spacing, semantic muted metadata and clear focus/selected state. Avoid a card wall, avatar crowd, count dashboard or custom motion. On mobile, rows stack rather than force horizontal table scrolling; the full title/context remains available through wrapping or deliberate disclosure.

## Find without reconstructing the old work view

The page initially covers all currently accessible Support inboxes and ordinary D3 work statuses. A draft on a Resolved conversation still appears while its own current authority permits it. Assignment and following are not ownership. A merged handling view does not merge private drafts: one row remains one stable draft from its original working slot.

Maya can filter to one inbox or search permitted conversation titles. The search label makes its scope clear; searching a private phrase typed only inside a draft does not return it. This preserves D22's indexing boundary. Unknown/failed permission or source reads are not empty results. Existing source labels are not rebuilt from unrestricted CRM facts.

Results sort by the last accepted meaningful author edit, newest first with a stable tie-break. Merely opening, selecting text, checking permissions or saving identical content does not move a row. Pages initially load20rows, bounded to50per request, with Load more to reach all eligible work. No recent-only cutoff or misleading total. While someone uses a row/menu, background data changes cannot move another row under the pointer. A quiet Results changed/Refresh control reconciles order while preserving identity and focus.

## Resume directly, with the correct context

Selecting a row opens the same conversation and existing composer with the exact saved bundle. There is no intermediate Edit draft screen and no separate document editor. Authorize the private owner and source before returning the body; do not mount a blank/default editor that is then overwritten. The saved target, audience, signature, quotations, attachment selections and pending shortcut changes come back together.

If new input or a material source/audience change requires review, show it in the normal conversation. Opening the draft does not reopen, reassign, contact anyone or execute a staged Resolve. If two original draft slots deliberately target the same B message, keep both identities and D10's B-source reply affinity; never silently combine them. Current component-wide collision review and any merge Undo destination review still apply before Send.

On desktop, focus the resumed editing context after current loading when this follows the explicit user action. On mobile, reveal the conversation and recipients first; do not force the virtual keyboard over them. Returning to My drafts restores the same-session query/filter/scroll/selected row where available. Cross-device restoration preserves acknowledged content and context, not an exact cursor position.

## Keep editing through failures

The normal save state is quiet. Not saved means the latest local work is not durably confirmed; Saved never describes just an older server snapshot while new text exists. A slow network can show Saving; a lost response can show Checking save. The original operation is recovered rather than resubmitted with a new identity.

If another tab saves first, preserve the current permitted local candidate and explain **This draft changed elsewhere**. A safe current saved version can be reviewed without replacing the local editor. Staff deliberately reload the saved version or reapply their changes against the new revision. No blind overwrite, automatic text merge or live collaboration product is introduced.

If permissions/source restrictions changed, current safety wins: clear or withhold affected content and explain only allowed facts. A stale row is not permission. The system keeps independently safe authored work only where the existing privacy/retention owner can prove separation. It must not offer copying forbidden content as recovery.

## Discard with one clear decision

More → **Discard draft** opens one concise shared confirmation, identifying the conversation and stating that the saved reply and its pending draft-only changes will be removed; the conversation remains. **Keep draft** cancels, **Discard draft** confirms. No typed magic phrase, extra reason, expiring Undo toast or hidden trash product is needed.

Confirm acts on the exact reviewed revision. If another tab has changed it, do not delete the newer work; return a clear changed-draft state and require review again. A successful discard removes the row and stops old autosaves from resurrecting it. Discard failure/unknown result stays visible until the original operation is resolved. A possibly admitted Send cannot be canceled by this action; follow its existing recovery state instead.

An existing draft whose text has been cleared remains saved until an explicit lifecycle action; it may say No reply text yet. This prevents implicit deletion of its audience, files or pending work. The zero-effort open/signature baseline never creates that row in the first place.

## Send and return to work

Send stays inside the existing conversation review. The complete latest candidate is validated and prepared through P17, then admitted with the permitted D4 work intent. Admission consumes that exact draft generation atomically. The draft disappears as active writing only when consumption is established, not optimistically because the button was clicked.

Queued is not Delivered. An accepted reply whose transport fails is an existing send needing owner recovery; it does not return as a fresh editable draft that can accidentally be sent again. An uncertain admission keeps an operation-recovery path under the original identity. Source constraints, signature/quote provenance and immutable prepared material cannot be reset by reopening My drafts.

Support retains source/private-draft/save/admission ownership. Email Studio provides canonical authoring/schema/presentation and prepares the complete reviewed outgoing message. P6 handles actual dispatch and reconciliation. CRM uses the same source and actual outcome, with no duplicated private draft or fabricated receipt/refund/contact action. This is one connected journey across authorized surfaces.

## Empty and exceptional states

| State                                       | Useful response                                                                                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| No saved replies                            | “No saved replies yet. Replies you start in a conversation will appear here after saving.” Link back to Support conversations; no forced setup. |
| No title matches / inbox filter empty       | State the current filter and offer Clear search/All accessible inboxes. Do not imply all personal drafts are gone.                              |
| Initial loading                             | Lightweight row skeleton without private title/body placeholders; no false zero count.                                                          |
| Read failure                                | “Couldn't load your drafts” and Retry. A prior permitted list may say Out of date only while current authorization permits it.                  |
| Save failed                                 | Keep current permitted editor work; Retry save and direct failure detail. Do not reset the editor.                                              |
| Save status unknown                         | Checking save / Save status unknown with original-operation recovery; no fabricated latest Saved state.                                         |
| Conflict                                    | Preserve local work and offer deliberate current-version review/reapply; no overwrite shortcut.                                                 |
| Source review needed                        | Resume allowed content; normal source/audience review before Send. No automatic recipient refresh.                                              |
| Source/schema no longer usable              | Qualified unavailable/read-only repair state; no stale cache, stripped-body save or empty new draft.                                            |
| Discard pending or send admission uncertain | Original operation recovery. Neither disappearance nor a new row proves no send occurred.                                                       |

## Accessibility and validation

Use Base UI shared menu/dialog semantics, labelled inputs/controls and actual row links/buttons. Keyboard navigation into the list never triggers Send. Discard restores focus to the originating row or a predictable next row/page heading if removed. Do not move focus from routine save/status refresh; concise material status is available to assistive technology without announcing each keystroke. Test IME, screen-reader editing, keyboard-only search/open/discard, touch menus, mobile keyboard,320CSS-pixel reflow,200% text resizing,400% zoom-equivalent layout, long names, Thai/RTL and timezone dates.

The [required proof](phase26-d37-proof-and-operations.md) includes real intended-staff find/resume/recover tasks and actual source/database/editor/send paths. Official vendor documentation informs placement and behavior. Browser image inspection was unavailable in this turn, so no screenshot-quality or authenticated vendor walkthrough claim is made; this blueprint must still be rendered and tested during implementation.

## Full founder ratification — 14 September 2026

This entire record is accepted as part of [D37 full ratification](phase26-d37-full-ratification.md), reconciled by final D37-R01–R28 and F01–F06. All 23 category outcomes, C01–C14, T01–T14, P01–P32, O01–O05, full journeys, source/authorization/data/editor/CRM/Email Studio seams, limits and qualification obligations are incorporated. The 32 runtime groups remain required and unexecuted; prior source/library/document checks remain limited evidence. Q38 is a separate prospective decision and is not answered here.
