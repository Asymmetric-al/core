# D22: Conversation text and filename search — independent UX and semantic review

**Research date: 12 September 2026.** The founder selected A: permitted conversation details, admitted messages/internal notes and attachment filenames. Attachment-content extraction, OCR, broader search and AI are out of scope now. This report is independent design/research input for root’s adversarial synthesis; it does not record ratification, select infrastructure or implement code.

**Disposition for the selected scope: accept with required amendments.** The value is locating a real conversation from remembered discussion and opening its actual source. The main UX risk is not lack of advanced syntax; it is a search whose scope, matching rules, result evidence or completeness silently changes.

## Primary evidence: what is verified and what remains a product choice

| Product/source                                                                                                                       | Date/version/edition and verified behavior                                                                                                                                                                                                                                       | Fit and tradeoff for Asym                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Help Scout Search](https://docs.helpscout.com/article/771-search-in-help-scout)                                                     | Updated 13 November 2025; refreshed 12 September 2026. Explicit subject/body/notes/attachment-filename coverage. Conversation preview then Open Conversation, keyboard selection and inbox-based access. Search also returns customer/Docs categories. Exact plan not specified. | Closest evidence for A’s coverage and preview-to-source journey. Do not import cross-object search, account-owner unrestricted visibility, raw query URLs or browser bookmarks as the saved-view system. |
| [Help Scout operators](https://docs.helpscout.com/article/47-search-filters-with-operators)                                          | Current retrieved article documents quoted phrases, AND/OR/NOT and wildcards; leading wildcards need a narrowing filter. Subject examples distinguish phrase and all-terms matching.                                                                                             | Quoted phrases are familiar. Other operators are optional vendor capability, not an Asym requirement. Avoid a large query language and its escaping/performance burden.                                  |
| [Front search](https://help.front.com/en/articles/2131)                                                                              | 31 July 2026; exact entitlement unspecified. Current-inbox/all-inboxes scopes; body/comments and detail fields; `in:messages` requires all terms inside one message. Quoted phrases, stemming and limited wildcard behavior differ.                                              | Supports source-specific matching and explicit scope. Front does not establish one universal all-source default. Its attachment-content feature remains excluded from D22.                               |
| [Front Find shortcut](https://help.front.com/en/articles/2415)                                                                       | 19 March 2026. Find within the open conversation includes comments, highlights matches and supports next/previous; distinct from cross-conversation Search.                                                                                                                      | A second search engine is unnecessary, but complete in-conversation navigation is useful. Browser Find over only mounted messages is insufficient proof.                                                 |
| [HubSpot Help Desk search](https://knowledge.hubspot.com/help-desk/search-for-tickets-in-help-desk)                                  | 13 February 2026; Service Hub Professional/Enterprise. Message/Note/Ticket-name refinement, matching-source preview, quoted phrases and relevance sorting. Also searches specified associated-contact fields.                                                                    | Strong support for clear match evidence and simple source refinement. Preserve Core’s independent field-use/CRM authority instead of importing all associated-contact fields.                            |
| [Zendesk search reference](https://support.zendesk.com/hc/en-us/articles/4408886879258-Zendesk-Support-search-reference)             | Edited 4 August2026 according to current indexed source. Case-insensitive default AND across terms, quoted phrases and prefix matching. It documents only the first 500 comments searched.                                                                                       | All-terms/phrase semantics are established patterns. Prefix/whole-word choices vary; no arbitrary500-comment exclusion or vendor grammar follows.                                                        |
| [Zendesk searching Support data](https://support.zendesk.com/hc/en-us/articles/4408894221594-Searching-Zendesk-Support-data)         | 8 June2026 indexed date; refreshed directly. Search reflects accessible tickets/users. It documents first 1,000 result cap and indexing delay, potentially10–12minutes for new messaging conversations.                                                                          | Useful negative evidence: a healthy zero and complete coverage are not interchangeable. These limits are not proposed Core targets or permission-delay allowances.                                       |
| [Intercom original Inbox search](https://www.intercom.com/help/en/articles/6516006-inbox-search-and-filter)                          | Dynamic “updated over a week ago,” retrieved12 September 2026. Returns most query words, usually ignores punctuation, uses similarity matching, supports quoted phrases and says optimized for English. Current-view search keeps view filters.                                  | Shows why “modern search” does not identify a single deterministic standard. Do not copy most-words/stopword behavior or English assumptions into Asym’s promised exact contract.                        |
| [Intercom React Inbox search](https://www.intercom.com/help/en/articles/16393491-search-and-filter-conversations-in-the-react-inbox) | Dynamic “updated over3weeks ago,” retrieved12 September 2026. Distinct version, visible filter chips and Match all/any filters, keyword/ID/email retrieval, quoted phrases and relevance sort. Boolean keyword syntax is unsupported.                                            | Keep structured filters separate from text interpretation. Do not mix original/React seat or filter behavior into a universal product claim.                                                             |

Source-specific interpretations below are **Asym product judgments**, not claimed vendor consensus. No vendor documentation inspected proves exact real-time index deletion, source-field authorization correctness in Core, universal Unicode quality, or representative ministry usability.

## Proposed minimum exact requirements

### U01 — Access search where the work already is

Use the existing Support conversation-list search field, visibly labelled **Search conversations**. Keep current view/inbox, work filters and sort visible. A short discoverable help line explains coverage: **“Search conversation details, messages, internal notes and attachment names.”** State in help that file contents are not searched. Do not add knowledge-base, Email Studio library, CRM-wide or AI tabs to this surface.

Searching is a read action. It does not claim/unassign work, mark a business action complete, change labels, follow a conversation or send anything. Reading/opening results should retain the existing qualified read-state behavior rather than invent another activity source.

### U02 — The current scope stays visible and predictable

Typing into an existing view searches within that view’s current explicit inbox/status/assignee/label and other qualified filters. This means an Open view will not silently start finding Resolved conversations. Show that scope; never diagnose this as a missing-result bug without checking it.

Provide a deliberate broadening action using an exact name. **Search all inboxes** changes only inbox scope while retaining visible other filters. **Search all Support conversations** means terms retained and ordinary view/work constraints cleared into the qualified ordinary Support population, including eligible Resolved work; state that effect and update the scope display. Choose the one existing navigation contract supports; do not expose both nearly identical controls merely to satisfy this wording. In a CRM record, its record anchor stays fixed until explicit Open in Support Hub. Neither broadening can enter held intake, restricted recovery or another tenant.

### U03 — Clear text, clear filters and reset view are different actions

**Clear search** removes the query text only and cancels pending results for that text. It preserves current inbox/view/filters and sort, returning the corresponding ordinary list. **Clear filters** affects ordinary removable filters, not tenant/source authorization or a CRM anchor. **Reset to saved view** restores the current eligible D20 definition, including its saved text if any. Clearing saved text marks a temporary Modified view; it does not overwrite Shared or silently stop showing its identity.

Opening another saved view follows D20’s complete-query contract, not old-search carryover. Back from a matched source restores permitted query/scroll context, with current authorization. Closing Find inside a conversation removes only its highlight/navigation state.

### U04 — One small matching contract, not parallel systems

Recommend **all entered literal fragments within one eligible source item**, with quoted phrases for order/adjacency. An unquoted whitespace-separated query produces required fragments in any order; each must occur in the same eligible text item. A phrase must occur contiguously after the declared whitespace/case/Unicode normalization, within that same item. Repeated unquoted fragments do not imply occurrence counts; quoting supplies repeated exact wording when needed.

The source item is one admitted message, one admitted internal note, one attachment filename or one qualified detail field—not concatenated messages, participant plus body, or unrelated merged originals. A conversation matches if at least one eligible item matches. Group current continuing conversations only after source matching. Do not manufacture an apparent phrase by joining two messages or a filename to a body.

This deliberately favors explainable evidence and precision. It will not find `Alex receipt` when Alex exists only in participant details and receipt only in a message. For a permitted who-plus-what search, use the separately qualified participant/detail filter together with text, or refine the text; do not broaden semantics silently. The strong alternative is all terms anywhere in a conversation, which increases recall but also creates scattered false matches in long and merged histories. If that alternative is chosen, the UI must show its actual multiple-source evidence rather than a misleading single snippet.

### U05 — Quotes are enough; avoid a redundant Match mode

Prefer the familiar quoted-phrase convention rather than both a Match dropdown and a second quote parser. A concise help example is **`"mailing address"` finds those words together**. A UI shortcut to wrap selected text in quotes may use that same contract if useful; it must not create another matching implementation.

Specify valid phrase delimiters, unfinished quotes and literal quote/backslash handling in the qualified parser contract. Paired typographic double quotes from mobile keyboards should be supported consistently or translated by the same visible phrase-insertion control. A malformed phrase receives a repairable validation state; it is not treated as zero, silently rewritten or broadened. Keep punctuation-bearing references/emails intact. Do not interpret OR, NOT, minus, percent, parentheses, regex or wildcard-looking text as hidden commands. Any minimal escape needed for literal quote text is documented and versioned; do not turn it into a general language.

### U06 — Match the visible source without altering its meaning

Apply one versioned Unicode NFC/casefold and whitespace treatment to queries and permitted searchable text. Preserve diacritics and punctuation rather than strip them to infer identity or synonyms. No stemming, synonym expansion, fuzzy correction, translation or stopword dropping is required. Search fragments can occur within text without pretending to understand linguistic word boundaries. This supports scripts without spaces as literal text and avoids silently dropping words such as **not** from an operational query.

Preserve hard gaps at redacted, hidden or expired spans. Removing one span must not make formerly separated fragments appear adjacent as a phrase. If policy treats the rest of a partly redacted item as searchable, search only its permitted retained segments under the exact gap rule. HTML markup, hidden attributes, raw MIME, tracking URLs and non-disclosable derived text are not visible source text merely because they occur in storage.

NFC/casefold can change length or expand characters. Highlight maps must return to the original visible graphemes; do not apply normalized-index offsets directly to rendered text. A query cannot create unsafe markup in highlights.

### U07 — Simple field refinement and existing work filters

Keep common work filters (existing status, assignee and D21 labels) accessible and other D20 filters under **Filters**. Text-source narrowing may use one **Search in** control with All searchable text, Details, Messages, Internal notes and Attachment names; no separate tab hierarchy or second result model is necessary. If the existing shared pattern uses fewer controls, preserve these semantics with progressive disclosure.

Do not add a date filter solely because competitors have one. If a demonstrated search task needs dates, the label states the real fact—such as **Matching message date**—and covers only compatible sources. It must not ambiguously mean last conversation edit, original start, label change or provider callback time. Local dates map to the displayed timezone and half-open period bounds under the owning query contract.

### U08 — Submit and update without stealing focus

Typing edits the query; Enter/Search runs it, outside active IME composition. This explicit submission is a defensible minimal default consistent with Help Scout/HubSpot. If the existing qualified shared search supports debounced results, retain that affordance only with equivalent freshness/interaction protection: never make a stale response appear to answer a newer string and never navigate/open a result while someone is composing text.

Handle compositionstart/end and the platform’s actual key events. The current [W3C UI Events working draft](https://www.w3.org/TR/uievents/) describes composition and `isComposing`; it is a work in progress, not a browser certification. Test supported browser/OS combinations because the final IME-acceptance Enter sequence differs. Escape cancels the active popup/Find predictably; it does not discard the conversation draft.

### U09 — Results explain why a conversation matched

Each ordinary result identifies the permitted current continuing conversation and gives one short real matching excerpt or filename with source kind and useful source time. Use explicit **Internal note** versus message wording; do not imply a note was sent to the requester. A filename result identifies the filename and parent message without opening/downloading the file automatically. Details-only matches identify that field rather than fabricate a message preview.

When several sources match, show one stable best eligible match and an unobtrusive route to additional current matches. No synthetic stitched summary, excerpt from another conversation or hidden-match count. The parent conversation’s title/context is separately authorized; a valid snippet does not grant all context fields.

### U10 — Open the matching source and preserve the return path

Opening a result should take the user to its still-authorized matching source and highlight it, or provide a direct **Show match** action if the established UI opens a conversation overview first. Preserve the list query/position and CRM return context where applicable. Never silently redirect to a different source if the exact match became unavailable; explain the current state without showing removed content.

An exact conversation-ID hit still obeys visible scope and permissions. It must not auto-open resolved/out-of-scope content or clear work filters. Offer the existing explicit broader-navigation path when appropriate without confirming the existence of inaccessible records.

### U11 — Find in conversation covers the declared retained conversation

Expose **Find in conversation** with visible previous/next actions and a close control, using the same text normalization/matching profile and current source checks. Seed it from the selected search match when meaningful. Loading older messages must not silently limit Find to the first mounted page; either cover the declared current source population or make incomplete loading explicit. A next/previous action opens the actual matched source, not an offset in a stale merged timeline.

Only intercept a browser Find shortcut when the qualified application focus contract makes that expected; retain a visible touch path. Match highlighting never modifies the canonical message, draft or retention clock. Do not represent matches hidden by authorization or expiry in match totals.

### U12 — Sorting should aid retrieval without overruling explicit work order

Expose the current sort. Preserve a user’s explicit saved-view/working sort during scoped search under D20. A dedicated all-Support retrieval context can default to a deterministic **Most relevant** order, with an existing chronological alternative. Relevance needs a small explainable source-owned rule (for example exact identifier/phrase evidence before weaker fragment matches, with stable tie-breakers); it is not a learned ranking system or behavioral tracking requirement.

If search activation temporarily changes sort, it must display that change and correctly restore the prior non-search sort on Clear; do not silently rewrite Shared defaults. Either design can work, but there must be one tested consistent contract. Avoid adding every vendor sort or automatic personal ranking.

### U13 — Live results must not change the action target

Bind active query, scope, source mode, sort and cursor to the request/result identity. Cancel or ignore outdated responses. Keep a selected row stable; new results can be announced with **Results changed · Refresh** rather than moving the target under pointer/keyboard action. Current privacy revocation removes forbidden content immediately even if ordinary freshness is relaxed.

A later refresh is a new current evaluation, so merge/Undo, redaction, new messages or labels can change results. Count rows as current eligible conversations, not matching messages or original contributions. Search does not authorize new bulk mutations over a moving result set; existing actions retain exact selected IDs and current reauthorization.

### U14 — Distinguish no matches from incomplete search

| State                                        | Recommended treatment                                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| No entered text                              | Corresponding ordinary current list; no decorative “no search” dead end.                             |
| Query editing after last run                 | Keep the committed result/query association clear; do not present old rows as the new text’s answer. |
| Running                                      | Quiet progress; preserve allowed context/focus and cancel or replace obsolete requests.              |
| Complete valid zero                          | **No conversations match in [visible scope].** Offer refining terms or explicit scope broadening.    |
| Invalid phrase/unsupported contract          | Specific repair guidance; no fallback broader query and no zero-result claim.                        |
| Query failure                                | **Search couldn’t finish. Retry.** Preserve safe input; do not label old results current.            |
| Known incomplete projection                  | Disclosed partial/unavailable state under the source policy; withhold a complete total.              |
| Source expired/redacted/revoked after result | Current unavailable treatment; clear forbidden snippet/reference information as required.            |

“Some recent content may not be searchable yet” is useful only when the source actually knows that limitation and can disclose it. Do not show boilerplate uncertainty forever, invent an index clock, or expose hidden record counts. Indexing delay cannot justify delayed permission enforcement.

### U15 — Privacy is part of everyday UX

Do not place raw sensitive query text in durable URLs, general analytics, automatic recent-search history or notification messages without the shared owner’s explicit qualified purpose. D20’s deliberate Save view already makes stored search text visible for review. Shared view creation reviews the text and audience; ordinary search must not auto-publish it.

No results/snippets/facets/rank changes may depend on inaccessible source text in a way that reveals it. Searches over admitted Support notes remain staff-only source behavior, not donor/missionary portal access. Classification, CRM field authorization and relationship scope are not inferred from participant email matches. Customer-facing message preparation is a separate action with its existing boundary.

### U16 — Accessible and mobile behavior is required proof

Use Core’s existing components/tokens. A plain labelled search field and button suffice; do not assign combobox semantics unless actual selectable suggestions exist. If suggestions exist, follow the qualified [W3C combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) and preserve normal text-editing keys. Keyboard focus, visual active row and result selection are different states.

Announce meaningful result/progress/error changes using [status-message semantics](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) without stealing focus or repeatedly interrupting each keystroke. Updating results in place must not cause unexpected navigation or a change of context merely from input; [WCAG On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) provides the relevant distinction.

Test narrow mobile widths, virtual keyboards, 200%/400% zoom/reflow, long/RTL/Thai/CJK/combining-character text, punctuation-bearing IDs/emails, keyboard-only selection and screen-reader match navigation. No inferred universal language quality follows from a vendor’s English-focused documentation. Reuse existing page/payload/query budgets with visible bounds rather than inventing a minimum Latin-word length or an unlimited instant-search promise.

## Concrete semantic proof examples

These are acceptance examples for later implementation proof, not tests executed here.

| Case                                                                | Required visible/domain result under the recommended profile                                                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `mailing address` occurs in one message, reversed order in another  | Both can match unquoted required fragments; only matching phrase order qualifies for the quoted phrase.                                       |
| `mailing` occurs only in message1 and `address` only in message2    | No all-fragments source-item match; never fabricate a combined excerpt.                                                                       |
| `Alex` only in participant details, `receipt` only in body          | Combined free text is not a same-item match; an independently qualified participant filter plus body text can express the intended condition. |
| `not [redacted span] received`                                      | Redaction cannot manufacture the phrase `not received` by joining the gap.                                                                    |
| Punctuation-bearing reference `AB-12`, email `a+b@example.org`, `%` | Literal qualified matching; no parser/filter injection or stripped punctuation.                                                               |
| Query contains only stopword-like text, or Thai/CJK without spaces  | Apply the declared literal rule; do not silently drop the query to an unfiltered search.                                                      |
| Casefold expands a character; combining sequences differ            | Matching uses the same normalization; highlighting maps back to intact original visible graphemes.                                            |
| User changes query before a slow response arrives                   | Older response cannot replace the newer query’s state.                                                                                        |
| Result source loses eligibility before opening                      | Current safe unavailable result; no cached body/name leak and no automatic sibling-source fallback.                                           |
| Two originals merge then Undo while Find is open                    | Current source identity/matches are requalified; no duplicate conversation cards or wrong offset jump.                                        |
| Filename matches but content is a protected attachment              | Name is shown only if independently permitted; search does not open/download or infer permission to file contents.                            |
| Content-index coverage is incomplete                                | No complete-zero or complete-count claim; ordinary authorized work remains reachable.                                                         |

## What this review rejects and what remains unverified

Reject a general query language, fuzzy/AI search, attachment extraction, hidden source concatenation, stopping after a vendor-derived comment cap, automatic scope expansion, ranking driven by restricted content, uncontrolled recent-search retention, and a parallel Email Studio/provider search. These exclusions preserve the selected scope and existing ownership; they are not claims such features are never valuable elsewhere.

No current vendor account was operated. No representative ministry user study, browser/assistive-technology test, search-quality measurement, database plan, production capacity or privacy-transition test was performed. The vendor facts above are current retrieved documentation; the exact semantic and UX recommendations are explicit product judgments to reconcile with Core’s governing query/source capabilities. Root’s synthesis must select one matching/scope/sort contract and record its limits, not leave conflicting alternatives as implementation freedom.
