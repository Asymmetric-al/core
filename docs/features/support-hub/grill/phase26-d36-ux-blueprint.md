# D36 — The complete quotation journey

**Current status — full founder ratification, 14 September 2026:** D36 A and every amendment, addition, adjustment, change and final correction are fully ratified. This includes R01–R26, all23category outcomes, the complete C01–C15/ES01–ES10 prose as reconciled by F01–F03, two glossary terms,30required release groups and five operating controls. D1–D36 including D29-X01 are fully ratified. Earlier proposed/pending/no-Q37 wording is historical. The [full ratification](phase26-d36-full-ratification.md) is incorporated in full; actual runtime proof remains required and unexecuted.

This is the proposed UX contract for the founder-selected **New reply only; add a quote when useful**. Read with [R01–R26](phase26-d36-adversarial-review.md). It specifies behavior and acceptance intent, not a rendered or implemented product. Exact Base UI/base-maia remains mandatory; vendor screenshots are interaction evidence, not a replacement skin.

## The ordinary reply remains ordinary

Maya, a hypothetical tenant support worker, opens a donor's email asking which period a receipt covers. She writes a self-contained answer. The composition area shows the existing From/To/Cc and reply-target context, her answer, managed signature/footer and Send. No quoted history is present; no setting, checkbox or prompt asks her to decide every time. Opening the same conversation through its authorized CRM context provides the same composition experience and preserves the CRM return path. The example demonstrates communication only: neither sending nor quoting proves a receipt was changed.

The optional action belongs beside the current reply context because it refers to that email. It should not compete with Send or be hidden in global preferences. **Add quote** is quiet secondary text with an optional quote icon; its description identifies the email by permitted sender/date. Use **Quote message** in an individual message's actions. That distinction lets an earlier email provide context without changing who receives the reply.

Illustrative information hierarchy, not a pixel-perfect component implementation:

```text
Reply to Alex · 14 Sep, 09:42                         Add quote
To: Alex                           [existing recipient controls]

Your reply…

│ Excerpt from Alex · 14 Sep 2026, 09:42 ICT       Remove quote
│ Which period does this receipt cover?

Continue your answer…

[Managed signature — existing controls]
[Required footer — governed content]

[Send]                                         [existing actions]
```

The border uses logical start so RTL layouts work. The quote body uses ordinary readable text, not a wall of muted italics. Metadata is secondary but legible. Existing Maia spacing/radii, semantic tokens, focus ring and touch targets define visual geometry; no custom palette, deep card nesting or new toolbar system. A recipient's actual email uses the qualified email renderer, not interactive composer controls.

## Add context in one action

Maya invokes Add quote. That one action requests the exact currently identified email's safe body. The action shows a small loading state if qualification takes time; the rest of the answer remains editable. With a valid remembered caret, the quote lands at a safe block boundary there. Otherwise it lands after authored content and before the managed signature. It never replaces highlighted answer text or enters the signature block. The new block starts expanded, and a normal paragraph after it supports continuing the answer.

The insertion is one undoable edit. Double activation during the same pending action creates one block; a later deliberate action may create another. No global history picker, new draft, second editor, mandatory preview or “Are you sure?” screen intervenes. One source is read per action; quote processing does not recursively retrieve a thread. Any existing authored answer, ordinary files and other quotes remain intact.

Focus must follow the user's action, not a late network response. If Maya stayed in the same editing context, reveal the new block and place the caret after it. If she continued typing elsewhere, do not steal focus or move her scroll; announce Quote added and provide a deliberate way to locate it. A stale/incompatible insertion anchor never overwrites work. If she switched conversations, canceled or removed the pending action, its result cannot insert later.

## Quote only the useful passage

If Maya selects one sentence within an eligible email, the same message action can become Quote selected text. It captures the selection before a menu changes focus and verifies the exact canonical source range. Only that excerpt is inserted. This is an accelerator; keyboard, screen-reader and touch users can quote the message and trim when it fits, or use Choose excerpt without precision text selection.

Selection across two emails, a stale representation or unqualified DOM mapping produces a concise message, **That selection couldn't be added. Choose an excerpt from the message.** No hidden full email appears as the result of a selected-text action. Repeated identical passages require exact positions; Thai combining marks, emoji and RTL are not split. Meaningful tables cannot be flattened into misleading text. If a safe excerpt cannot be represented, preserve the existing answer and allow reading the source without pretending a quote was added.

**Choose excerpt** is the exceptional accessible path when the whole message is too long or browser text selection is unsuitable. It stays in the existing source reader. **Start here** beside a permitted paragraph selects that paragraph, ready to add; **Extend through here** on a later block extends the contiguous selection. The selected range/count is visible above **Add excerpt** and **Cancel**. The controls have ordinary keyboard/touch/screen-reader operation; Shift-drag or precision selection is never required. One small paragraph from a long email can be quoted even when the whole email would exceed the draft budget. The source/revision/block mapping remains authoritative and the normal Add quote still has no picker. A list/table that would lose meaning is indivisible; an individually oversized or unsupported block gets an honest limitation rather than automatic truncation. Cancel leaves the draft untouched.

## Edit without a specialist workflow

Maya removes irrelevant lines directly in the normal editor and writes her explanation below. The source identity stays fixed; because the quotation's meaning-bearing content changed, the visible and outgoing attribution becomes **Edited excerpt from Alex …**. This rule applies to changes in text, ordered content, meaningful list/table structure and link destinations, including trimming. Qualified presentation-only formatting is exempt. Changing a link destination while keeping its visible words is an edit and must be labelled. The comparison uses a canonical semantic projection, not an AI judgment about what the author meant. It avoids a deletion-versus-rewriting classifier and avoids attributing Maya's changed words verbatim to Alex. A freshly source-selected excerpt starts unchanged and does not need the Edited label.

She can format text with the qualified Reply tools, use safe links, move a quotation, remove it or undo. Each known transformation retains its source dependency. The source-bound block is not a new reply type or an internal note. Ordinary handwritten blockquote formatting is still available, but it cannot fabricate a verified source attribution. The quotation is editable content; its source metadata is the narrow protected semantic unit. Source-attribute tokens, editor-purpose IDs and admin links never become public markup.

## Long messages and media stay honest

A source email may already contain nested history, a previous signature or addresses embedded in its body. The action shows the actual qualified representation. It does not pretend a visual fold reliably identifies the newest authored paragraph. Maya can remove unwanted parts. After inspecting a quote she may collapse its display if that existing editor behavior is qualified; the visible label remains **Quoted text — included in email**. Collapse is never removal, and the product does not need a new collapsed-history preference.

Text quotation does not add files or load remote images. A concise **Images and attachments aren't included** notice appears when relevant and safe to disclose. For an image-only source with no useful permitted text, no empty “success” block is inserted. Staff can attach a file separately only through the existing file-use authority. Private links, expiring action URLs and signed object URLs cannot sneak through as harmless text hyperlinks. Required governed signature images are unaffected.

If the exact shared document limit would be exceeded, the quote is not partially inserted. Explain the applicable limit with its real units and offer a smaller selected excerpt. The answer remains usable. No folklore Gmail clipping threshold or competitor attachment cap is adopted as an Asym limit.

## Change recipients or target without surprises

Quoting an earlier email never changes To/Cc, Reply-all or the selected reply target. If Maya deliberately adds a new recipient afterward, the application rechecks whether this quote may be disclosed to that audience. Eligible content gets one inline **Recipients changed — review quoted text** notice, with the quote expanded. Any D2 review already covering this exact quote/audience satisfies the same requirement; no duplicate modal. Ineligible material must be removed or the audience corrected. Acknowledgment is not permission override.

Merely removing a recipient rechecks eligibility but does not normally need another acknowledgment. If Maya explicitly retargets the reply, keep the authored answer and existing source-labelled quotes; use D2's target/context review. Do not replace a quote with the newest incoming message. If merge/unmerge/source restrictions remove eligibility, withhold only affected content when separable. Current source access determines which explanation can be shown.

## Remove, undo, leave and return

Remove quote deletes only that block. There is no confirmation dialog because ordinary current-authorized Undo can reverse it. It does not delete the incoming email or its files, edit history, change recipients or send a notification. A pending add is canceled without a late resurrection. Known retained copies keep their dependency; a source dependency can disappear only when no derived material remains.

D4 owns private draft persistence and conflict recovery. The same draft, version and source manifest are saved together; opening history/CRM and returning must not invent another draft. Browser tab loss or offline delivery is not newly promised by this feature. Unsaved/saving/saved/unknown remain honest. Logout, tenant/account change or privacy loss clears forbidden editor/cache/undo material, even if a dirty-navigation prompt would otherwise preserve it. An older saved quote does not restore an expired source.

## Send, receipt and reply continuity

Maya sends through the existing action. A routine valid quote adds no extra Send confirmation. The visible reviewed answer, quotations, honest attribution, signature/footer and independently authorized attachments form one canonical message. Support validates source and audience, P17 compiles/prepares the complete message, and P6 seals/dispatches it with its existing identity. No later template adds the thread, no provider expands “original message,” and literal brace tokens remain literal.

If a quote is still loading, the user must finish or cancel that pending inclusion before Send; an optional quote cannot silently vanish during sending. If extraction alone is down, a new reply without a quote still works when its own prerequisites pass. If current source permission/privacy changed, targeted repair preserves independently safe answer text. If the provider outcome is unknown, the already accepted send follows P6 reconciliation; removing a quote cannot turn it into a fresh resend. Delivered email remains historical fact.

The recipient sees the new answer and only deliberately included context. Their client may group or collapse messages differently; Asym cannot guarantee that presentation. A donor replying from a normal email client does not need a Core/CRM account. Support keeps its canonical conversation; CRM shows only authorized communication context and the existing actual-send outcome. Neither quote nor send updates giving records or confirms an underlying business action.

## State and recovery inventory

These are UI states over existing source/draft/send owners, not a second persisted workflow state machine.

| State                  | Visible behavior                                                              | Valid exit / forbidden transition                                             |
| ---------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| No quote               | Ordinary answer; Add quote when exact eligible source exists                  | Deliberate Add; no auto-inclusion                                             |
| Choosing excerpt       | Existing source reader with labelled start/extend controls and selected range | Add qualified excerpt or Cancel; no source edit or forced full quote          |
| Adding                 | Local action busy; answer remains editable; cancel available                  | Qualified insert, cancel or useful failure; no late cross-draft insertion     |
| Included               | Expanded source-attributed editable quote                                     | Edit, remove, optional collapse, normal Send                                  |
| Edited excerpt         | Same block with honest semantic-change attribution                            | More edits, Undo, remove, valid Send; no falsified original-author words      |
| Collapsed              | Included-in-email label remains                                               | Expand/remove; collapse never removes transmitted text                        |
| Audience review        | Current eligible quotes expanded and targeted notice                          | Single qualified review, audience correction or remove; no access override    |
| Unavailable/restricted | Only permitted control facts; safe answer preserved                           | Remove/reapply current permitted source; no stale preview/Undo recovery       |
| Draft conflict/unknown | Existing D4 conflict/result recovery                                          | Exact operation reconciliation; no blind overwrite                            |
| Prepared/unsubmitted   | Frozen complete message and current owner fences                              | Identical eligible execution or owner-qualified repair; no in-place body edit |
| Submission possible    | P6 actual accepted/rejected/unknown state                                     | Exact reconciliation; no new key/rerender or claimed recall                   |

## Accessibility and usability proof

Test the normal send, add/trim/remove, earlier-message quote, invalid selection, changed recipient and source-expiry journeys using mouse, keyboard, screen reader, touch and a narrow viewport. Include IME input while an extraction response arrives, browser zoom, long international names, Thai/RTL/mixed scripts, large nested messages and a visible mobile keyboard. Source/quote/answer ordering must agree between DOM, focus, visual display and sent plain text. Menu dismissal restores focus; no quote body is automatically spoken as a status announcement. Maintain at least the existing compliant contrast and focus tokens.

Release proof must demonstrate source-selected quotation without a mandatory modal, ordinary removal without a confirmation, no answer loss or unintended recipient/file changes, and discovery without coaching. A small purposive usability study identifies task failures; it is not population evidence that all ministries prefer A. The exact research protocol, failures, fixes and retest evidence belong to P28 in the [proof record](phase26-d36-proof-and-operations.md).

## Full founder ratification — 14 September 2026

The founder explicitly ratifies this complete substantive record and every adopted amendment, addition, adjustment, change and final correction, as reconciled by [the full D36 ratification](phase26-d36-full-ratification.md). R01–R26, all23category consequences, complete source/data/editor/UX/CRM/Email Studio/privacy/retention/recovery/migration contracts, F01–F03, two unchanged terms, P01–P30 and O01–O05 are accepted. Preliminary alternatives and text-only attribution shorthand are resolved by the final clauses; evidence remains evidence rather than a mandatory vendor feature.

Support retains private source/draft/target/audience authority. P17/Email Studio prepares the complete reviewed canonical reply and P6 owns immutable dispatch/reconciliation. No draft/quote edit sends, publishes a template, adds hidden history/recipients/files, creates CRM truth or rewrites sent evidence. The actual41prior documentary checks and four-assertion source counterexample remain preserved; all30runtime release groups remain required and unexecuted. Continue to one genuinely unresolved researched next question without reopening D36. This ratification creates no formal spec, tickets, implementation or external mutation.
