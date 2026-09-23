# Q22 — What should Support conversation search look through?

**Historical Q22 evidence: A and the complete D22 amendments were fully founder-ratified on 12 September 2026.** Earlier unanswered/proposed/no-ADR language below describes the question stage only. [Full accepted record](phase26-d22-adversarial-review.md) and [Email Studio seam](phase26-d22-email-studio-integration.md) govern current acceptance.

**Historical question material.** On 12 September 2026 the founder selected A and expressly reserved broader/AI search for future scope. The [complete D22 review](phase26-d22-adversarial-review.md) records proposed amendments pending ratification. Earlier unanswered wording describes the question stage only.

**Q22 is unanswered.** Prepared 12 September 2026 after full founder ratification of D21 and every adopted amendment. This question chooses searchable source coverage. It does not select a search engine, file parser, AI capability or performance promise.

## The practical decision

Staff do not always remember a conversation's subject or reference. They may remember a phrase from a message, something a colleague recorded in an internal note, or a filename. D20 provides saved views and correct filtering; D21 provides optional labels. Neither decision establishes which conversation content the search field should examine.

For example, Alex remembers **“corrected mailing address”** in a conversation titled **“A quick question.”** Searching its discussion could find the request even without its subject or sender. If the phrase appeared only inside an attached PDF, attachment-content search would add value. This is an illustrative retrieval task, not an assertion about ministry workload frequency.

## Three genuine options

| Option                                                      | Searchable coverage                                                                                                             | Strongest benefit                                                                               | Main tradeoff                                                                                                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Conversation text and attachment filenames**          | Permitted conversation details, admitted message/internal-note text that remains available, and permitted attachment filenames. | Staff can find work from what was discussed or a remembered file name.                          | A phrase found only inside an attachment will not match. Text indexing still requires current permission, freshness and privacy guarantees.           |
| **B — Conversation details only**                           | Permitted reference/ID, subject and requester/participant details, alongside existing work filters.                             | Smallest searchable content surface; useful when staff have a reference or person/subject clue. | Staff must inspect candidate conversations to find remembered message, note or file-only wording.                                                     |
| **C — Conversation text and supported attachment contents** | Everything in A, plus extracted text from an explicitly supported, eligible set of attached document formats.                   | Finds requests when useful wording or identifiers exist only inside documents.                  | Adds safe extraction, format/size limits, processing/error states and retention/permission controls for extracted text. Not every file is searchable. |

These are alternative product choices, not three configuration modes to implement. C does not automatically include OCR, image recognition, audio transcription, compressed archives, arbitrary formats, AI answers or global CRM/document search. It is a legitimate broader option, not a disguised enterprise-platform rebuild.

## Single recommendation: A

**Choose conversation text and attachment filenames.** A normal conversation search should help staff retrieve the actual discussion without requiring perfect subjects or labels. A preserves that everyday value while keeping document extraction a deliberate additional scope decision.

Help Scout directly documents subject, body, notes and attachment-filename search—a close comparison for this boundary. HubSpot Service Hub Professional/Enterprise documents message/comment searching, Message/Note refinements and a matching-source preview. These establish workable product patterns, not a measured universal optimum for Asym. [Help Scout search](https://docs.helpscout.com/article/771-search-in-help-scout), [HubSpot help-desk search](https://knowledge.hubspot.com/help-desk/search-for-tickets-in-help-desk).

**B is strongest when staff normally have a reliable reference or sender clue** and text-based retrieval is rare. It keeps the searchable content surface smaller, but creates extra inspection when the remembered words are only in the discussion. Correct authorized filtering remains required even for B.

**C is strongest when staff frequently need information contained only in attachments.** Front documents attachment-content search for a supported set of email file types, with channel and format limitations. The extra value is real; so are the extraction and source-lifecycle obligations. No reviewed Asym workload or qualified extraction capability establishes that document-only retrieval is the dominant unmet need here. [Front search coverage](https://help.front.com/en/articles/2131).

## The proposed A journey

Keep conversation search in the existing list surface, with the current inbox/view/filter scope clearly visible. Explain the coverage through short discoverable help: **“Search conversation details, messages, internal notes and attachment names.”** Do not call it search everything.

Results should show why a conversation matched: a short permitted excerpt or filename, identified as **Message**, **Internal note**, **Subject** or **Attachment name** as appropriate. Open at the matching source or provide direct in-conversation match navigation. A note match must never imply that the requester saw that text. Keep one continuing conversation result under D10, preserving original match attribution and current permissions.

Allow useful source refinements without requiring staff to learn a query language first. Preserve search, list position and authorized CRM return context. A visible Find-in-conversation control solves locating another match after opening a long conversation; ordinary browser Find over only loaded messages is not whole-conversation search. Front documents that distinction explicitly. [Front Find](https://help.front.com/en/articles/2415).

Distinguish **No matches in this scope** from unavailable/incomplete indexing. Broader search is deliberate; it must not silently clear a CRM record anchor or show inaccessible-match counts. Exact query/phrase/Unicode/ranking/pagination and accessible interaction behavior belong in the selected-answer review rather than being silently frozen by this coverage question.

## Boundaries already decided

- Current source permissions govern matches, snippets, counts, ranking contributions, previews and filenames. Search never grants CRM, financial, missionary or member-care access.
- D16 redaction and D17 expiry remove content's eligibility to contribute matches. A derived index cannot retain independent authority or leak removed text while awaiting cleanup. Private drafts, raw transport evidence and D19-held intake remain outside ordinary conversation search.
- A remembered email address is a lookup clue, not proof of identity, representation or permission. Results do not create/link a CRM Party, label, interaction or business action.
- D20 saved queries retain exact source-coverage/version meaning. Expanding ordinary search must not silently reinterpret an old details-only saved query as a body/attachment query.
- C would use a qualified Phase29-compatible file/byte/extraction/access seam while Support retains conversation semantics. Neither Phase29's roadmap nor Phase40's global-search plans prove that extraction is already available. Domain-local search does not require a new global engine.
- Email Studio's reusable library and private/prepared drafts are separate from admitted conversation history. Running search publishes nothing, prepares no email and calls no Resend service. An actual later reply keeps the accepted P17 → Support admission → P6 tenant Resend path.

The [evidence register](phase26-q22-evidence.md), [independent gap challenge](phase26-q22-gap-review.md) and [refreshed primary research](phase26-q22-vendor-research.md) preserve the source facts, alternatives and limits.

**No ADR0022 or new accepted search term is created.** A is the recommendation; B and C remain genuine alternatives. The selected answer will receive the full adversarial review. No formal specification, implementation, ticket, provider mutation or real message is authorized by this question.
