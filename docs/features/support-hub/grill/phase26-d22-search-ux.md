# Support search: a clear, quiet path to the right conversation

Fully founder-ratified D22 UX, 12 September 2026, accompanying [R01–R26](phase26-d22-adversarial-review.md). A is selected; broader/AI search is a future direction outside current scope. This is an interaction contract and required proof, not a tested screen.

## Start in the existing workspace

Keep one **Search conversations** field in the existing list toolbar. Replace donor-only copy with **Search conversations…**. Short help explains **“Search details, messages, internal notes and attachment names. File contents aren’t searched.”** Do not add an AI button, new global search destination or a separate query builder.

Keep the active inbox/view and any CRM/report context visible. Place the familiar Status, Assignee and Labels controls beside search; other qualified D20 filters remain under **Filters**. Search in is a compact refinement, default **All searchable content**, with Details, Messages, Internal notes, Staff context and Attachment names. Its nondefault choice becomes a visible chip. Do not display six permanent source buttons or count every source/facet before the person searches.

**Person or email**, inside Filters, matches permitted Support participant/detail facts. It is useful for an explicit request such as “messages containing receipt in conversations involving Alex.” It does not search the whole CRM, verify identity or create a contact. Keep labels as D21's existing filter with Any/All/No labels; do not invent a competing label matcher or a date filter with ambiguous Updated semantics.

Searching retains current work filters. A resolved conversation outside an Open view stays outside it even for an exact ID. For wider retrieval in a Support list, the explicit action is **Search all my accessible Support conversations**. Describe its effect beside the action: **“Keeps your text and Search in choice; removes the current work filters.”** The current permissions and source exclusions remain. From CRM/report context, use **Open in Support Hub** before broader search, preserving return context; no automatic anchor removal.

## Search text that behaves predictably

Ordinary terms are literal fragments, all required in one eligible source item. A source item is one message, note, filename, Staff context item or individual detail field. **receipt address** may find one message containing both, but not a name in one field plus receipt in an unrelated message. Fragments can match inside a word, so receipt can find receipts. Case is ignored under the shared Unicode contract; spelling, accents, punctuation and short words are not silently removed or interpreted as AI meaning.

Concise help says **“Use quotes for an exact phrase. To combine a person with message wording, use Person or email.”** Support normal straight quotes and paired typographic double quotes from mobile keyboards. No Boolean/wildcard/regex syntax or second Match-mode control. The [data contract](phase26-d22-data-contract.md) fixes the exact parser and escape behavior, including repairable unfinished quotes. Operators such as OR, NOT, `%` and `_` remain literal text.

Retain 200ms debounced typing as the initial setting, with IME-aware behavior, Enter and an accessible Search action to run immediately. Do not submit mid-composition. Show the executed query's results separately from unfinished input; while updating, preserve last-known authorized rows with a quiet **Updating…** state rather than announcing them as matches for the new text. Cancel/fence stale requests. Keyboard focus and an opened conversation remain stable when new results arrive.

The accepted query ceiling is 256 Unicode scalar values, 1,024 UTF-8 bytes and 16 parsed fragments/phrases. The input explains exceeded bounds without discarding text. Single-character input is allowed; a genuinely too-broad query can ask for more text or narrower scope without pretending no matches exist. These are product/technical bounds, not an assertion about optimal human query length.

## Sorting, clearing and returning

Preserve an explicit saved/user sort. For an otherwise unconfigured text search, **Best match** means exact full references first, then the newest qualifying source match—not an AI score or term-frequency contest. Source timestamps are original admitted/created facts; index rebuild and label edits do not make old content new. Unknown source time sorts last and is not replaced with now.

The automatically selected search order does not change the underlying queue/view order. **Clear search** removes only the entered query and the transient automatic search order; other filters stay. A deliberately changed work sort remains. **Clear filters** removes ordinary work/source refinements while leaving text and mandatory context. **Reset view** uses D20's saved definition. Label actions and old query replies cannot erase typed text or reset unrelated filters. Clearing invalid input is a deliberate action, not a parser fallback to All.

With blank text, Search in retains its preference but contributes no predicate; clearing a filename search must not become a hidden has-attachment filter. Clear filters explicitly returns Search in to All searchable content, clears ordinary work/person/label refinements, and retains the current inbox boundary, view identity as Modified where applicable, text and mandatory CRM/report context. Exact-reference priority applies only to a complete one-atom reference query, not a reference fragment among other terms.

Back from a result restores the qualified query, visible scope, scroll position and focus. D20 query-state handles keep sensitive literals out of URLs/referrers. An expired private handle yields **This search is no longer available. Enter your search again.** It does not open All conversations or expose another user's query. No recent-search history or raw-query analytics feature is added.

## Results show the reason for the match

Use the shared conversation list with one row per current continuing conversation. Show current subject, work/handler context and a short qualified matching excerpt or filename. Identify the reason as **Subject**, **Detail**, **Message**, **Internal note**, **Staff context** or **Attachment name**. An automated message and a queued/failed/uncertain reply retain truthful provenance/state. Never describe a note as a requester-visible reply or a queued message as delivered.

Emphasize exact matched text using escaped display text and trusted markup, not raw email HTML. Multiple separated excerpts from the same item are clearly separated, not fused into a quotation. No redaction placeholder is a search hit; hidden gaps cannot create new phrase adjacency. Internal-note excerpts stay within current authorized staff scope and are not announced wholesale through a global live region.

Opening a text result lands at the exact original source within the current eligible conversation. It never silently picks a nearby replacement if the original changed. A filename result reveals its authorized attachment row, without opening/downloading the file. The ordinary file action separately checks current byte access and hygiene. A matching filename does not mean the file's contents were searched.

Offer **Find in conversation** in the open conversation, with next/previous matches across its declared eligible retained sources—not only mounted DOM elements. Preserve the narrower CRM/report source basis. The Find field uses the same parser and current eligibility; it is distinct from the broad list search. Do not take over browser Ctrl/Cmd-F by default; use Core's available qualified shortcut convention and a visible action. Actual shortcut mapping is tested against existing bindings before release.

Empty Find clears highlights and disables next/previous; it does not enumerate every source as a match.

## Honest states without noisy warnings

| State                        | Treatment                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Successful no matches        | **No matches in this scope.** Keep active filters visible and offer explicit clear/narrow/widen actions. Do not promise nothing exists outside permitted/indexable coverage.         |
| Incomplete projection        | **Search is still updating. Available matches are shown.** Show no exact total/rank-completeness claim; retry/refresh is available. Do not disclose how many hidden items may match. |
| Temporary search failure     | **Search couldn’t finish. Try again.** Keep query/filters and ordinary conversation handling available.                                                                              |
| Budget exhausted             | **This search is too broad. Add more text or narrow the filters.** Distinct from zero and from a permissions refusal.                                                                |
| Unfinished/malformed phrase  | **Close the quote to search a phrase.** Preserve input and previous executed-query context; do not run a broader query.                                                              |
| Result changed/removed       | **This match is no longer available.** Use current source-safe detail, refresh and retain allowed return context. Never render the old snippet.                                      |
| Privacy/source scope changed | Remove forbidden results/actions immediately and use the existing unavailable-context treatment. No inaccessible result count or reason exposing hidden source data.                 |
| Valid blank search           | Return the current qualified filtered list with underlying sort; do not clear view/CRM/report anchors.                                                                               |

Exact totals appear only when the full query and coverage justify them. Otherwise show truthful displayed-page/progress states. Do not make a row jump under the pointer when index work completes; show **Results changed — Refresh** when a deliberate refresh is needed. Existing explicit selected IDs remain the action targets. Search never automatically selects all matches, saves a view or sends/labels/follows anything.

## Accessibility, mobile and product consistency

Preserve exact Core base-maia/Base UI and semantic CSS-variable tokens; reuse existing responsive list, popover/filter, status and empty-state components. Avoid tiny source toggles, color-only distinctions and hover-only context. Text input has a visible/accessible name, Clear has an explicit name, active chips have named removal, and result links have meaningful source labels. Focus, selection and loading announcements remain separate.

Test keyboard-only search/refine/clear/open/Find/back, screen-reader announcements, IME composition, non-Latin/RTL/combining text, mobile keyboard overlap, touch targets, 200%/400% zoom/reflow, high contrast, reduced motion and slow/reconnecting networks. Respect WCAG2.2 target-size requirements and exceptions. A screenshot or automated score alone does not establish a good staff journey. [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Representative staff must distinguish a note match from a sent reply, find an old source beyond the mounted page, recognize current search scope, understand filename-only coverage, recover from malformed/incomplete results and return to CRM without losing context. Future AI gets no visible placeholder or hidden operation. The [independent UX evidence](phase26-d22-ux-research.md) documents the relevant vendor patterns and the recall tradeoff of matching one item instead of scattered conversation text.

## Ratification and Email Studio clarification

The founder fully ratified D22 and every adopted amendment, definition, UX/data/evidence correction and required proof on 12 September 2026. The [Email Studio integration record](phase26-d22-email-studio-integration.md) makes the accepted source/search/authoring/preparation/delivery boundary explicit. Historical proposed/pending/no-Q23 wording is superseded only as to acceptance and advancement. [Ratification validation](d22-ratification-q23-validation.json) preserves historical evidence separately; implementation proof remains unexecuted.
