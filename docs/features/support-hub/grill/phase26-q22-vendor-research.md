# Q22 conversation-search coverage — refreshed independent evidence

**Historical Q22 evidence: A and the complete D22 amendments were fully founder-ratified on 12 September 2026.** Earlier unanswered/proposed/no-ADR language below describes the question stage only. [Full accepted record](phase26-d22-adversarial-review.md) and [Email Studio seam](phase26-d22-email-studio-integration.md) govern current acceptance.

**Historical question material.** On 12 September 2026 the founder selected A and expressly reserved broader/AI search for future scope. The [complete D22 review](phase26-d22-adversarial-review.md) records proposed amendments pending ratification. Earlier unanswered wording describes the question stage only.

**Checked: 12 September 2026.** D21 is ratified. This file supports the next unanswered scope question; it neither records an answer nor extends Phase26 into AI, a new search platform, document management or global CRM search. Root and the independent gap review qualify the actual Core capability/phase owners. The earlier research in `work/search-coverage-research.md` is retained as historical groundwork.

## One meaningful scope choice

**What should staff be able to search when finding a Support conversation?**

| Choice                                                                             | Included coverage                                                                                                                              | What it helps staff do                                                                                                    | Main tradeoff                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Conversation details, messages and internal notes; attachments by filename** | Permitted conversation IDs/subjects/participant details, retained admitted message and internal-note text, and permitted attachment filenames. | Find a request from what was actually said, then open the relevant source; locate a file when its name is known.          | A term that exists only inside a file is not found. Body and note indexing still needs real authorization, freshness, redaction and retention guarantees.                                                                     |
| **B — Conversation details only**                                                  | Permitted IDs/subjects/participant details, alongside the existing work filters.                                                               | Retrieve a known conversation from a reference, subject or person’s details with the smallest searchable content surface. | Staff who remember only wording must locate candidates using other clues and inspect them. Filename/message/note-only terms do not locate the conversation.                                                                   |
| **C — A plus text inside supported attachments**                                   | Everything in A, plus extracted text from explicitly supported, eligible file formats.                                                         | Find requests from wording or references contained only in attached documents.                                            | Requires safe extraction, documented supported formats, processing/failure states and full source-permission/redaction/expiry treatment for another derivative. Unsupported, encrypted or image-only files still have limits. |

**Single recommendation: A.** A search box called conversation search should normally help staff recover a request from its actual discussion, including the team’s admitted internal notes. It gives a meaningful improvement over metadata lookup while keeping attachment contents a separate deliberate scope expansion. Help Scout explicitly documents subject/body/notes plus attachment-filename coverage, providing a particularly close comparison. The recommendation remains a reasoned product judgment, not an established ministry-user study result or an assertion that all vendors ship exactly this boundary.

**Illustrative example:** Alex remembers a requester wrote “mailing address” but cannot remember the subject. A can find that message and make the match visible; B needs a reference or other clue first. If the only remembered term is printed inside an attached PDF, C adds genuine value. A filename such as `address-details.pdf` can be found under A; a generic `scan.pdf` containing those words cannot. This example distinguishes the choices without inventing a workflow fact.

The alternatives vary searchable source coverage, not basic correctness or permissions. Every choice preserves existing authorized search/filtering and D20 views. Message/Note controls can narrow A; that does not require a second founder decision about every filter default. C does **not** inherently include OCR, image recognition, audio transcription, AI answers, arbitrary file parsing or a general document-search product. Do not burden it with those unrelated additions to make A seem stronger.

## Refreshed primary evidence

### Help Scout: a close documented comparison for A

[Search in Help Scout](https://docs.helpscout.com/article/771-search-in-help-scout), **updated 13 November2025**, refreshed directly **12 September2026**, explicitly searches email subjects, bodies, notes and attachment filenames. Its broader search groups conversation, customer and Docs results separately. Conversation results support preview and then opening the full conversation, with keyboard navigation. Administrators/Users search permitted inboxes; Account Owners can search all inbox data. Exact subscription entitlement is not stated on the page.

**Fit:** strong direct evidence for A’s useful bounded content coverage, including filenames. Do not infer from this article that attachment contents are never searchable through any other Help Scout feature. Adopt conversation/source scope and preview-to-full navigation selectively; do not import its account-owner visibility, cross-object global search, browser-bookmark saved-search mechanism or raw query text in URLs. Asym keeps D20’s shared saved-view capability and current field/source restrictions.

### Front: substantial conversation search and a bounded attachment-content feature

[How to search in Front](https://help.front.com/en/articles/2131), **edited 31 July2026**, directly documents subjects, body, comments, recipient fields and scope choices including current inbox and all inboxes. Its message-only filter requires all query terms within one message; comments and attachment matches can be selected separately. Attachment-content search is explicitly email-only and limited to **PDF, CSV, XLS, XLSX, DOCX and TXT**. Attachment contents from channel integrations are not searchable. Spam/Trash need explicit inclusion. Exact phrases, stemming and prefix syntax have documented differences. Exact subscription entitlement is not established by this article.

**Fit and cost:** this is strong evidence that actual discussion search is useful and that C is a real product capability. It also demonstrates why a blanket “search everything” promise is misleading. Adopt clear field/scope meaning; do not transplant Front’s query language, channel list, protected BCC visibility, archive semantics or format set as Core authority. Filename indexing is **not explicitly established by this Front page**; Help Scout above independently documents that part of A.

### Front: finding the conversation is different from finding its exact message

[How to use the Find shortcut](https://help.front.com/en/articles/2415), **19 March2026**, separately documents searching the currently open conversation, including comments, highlighting matches and moving between them. It explicitly distinguishes this from the cross-conversation search bar.

**Fit:** keep the two steps coherent: identify the matching conversation, then open the relevant permitted message/note without making staff manually hunt through a long thread. A visible Find-in-conversation affordance and accessible next/previous navigation can use the existing shared interaction pattern. Browser Find over only rendered/loaded messages is not proof of whole-conversation coverage.

### HubSpot Help Desk: message/note search and source-specific previews

[Search for tickets in help desk](https://knowledge.hubspot.com/help-desk/search-for-tickets-in-help-desk), **13 February2026**, **Service Hub Professional/Enterprise**, documents ticket name/ID/description, specified associated-contact fields, and ticket messages/comments. A matching message/comment preview appears in results. Ticket name, Message and Note quick filters narrow the term’s source; quoted exact phrases and relevance sorting are documented.

**Fit:** strongest direct evidence for a simple A workflow: searchable discussion and a reason the result matched. Adapt the behavior to Asym conversations, not HubSpot ticket cardinality. Associated CRM fields require actual Core owning-domain permission; no unrestricted person/company expansion follows. This article establishes neither attachment-content search nor filename search. Do not copy its globally shared column settings into D20’s personal preference contract.

### Zendesk: full text with explicit visibility and completeness limits

[Searching Zendesk Support data](https://support.zendesk.com/hc/en-us/articles/4408894221594-Searching-Zendesk-Support-data), **8 June2026** as indexed, refreshed directly on 12 September, says ticket results match subjects/comments and agents see only tickets/users within their permissions. It documents **64 words per query**, **first 1,000 results**, ordinary indexing delay of a few minutes and **10–12 minutes** for newly created messaging conversations.

**Fit:** supports permitted text retrieval and explicit result scope. Do not adopt its administrator-read-all model or copy those numbers as Asym budgets. Index delay must remain distinct from source admission and read availability. A no-match screen cannot imply everything was searched when the promised source coverage is incomplete.

[Zendesk Support search reference](https://support.zendesk.com/hc/en-us/articles/4408886879258-Zendesk-Support-search-reference), refreshed **12 September2026**, documents comment/subject/requester fields and attachment presence. Description is the first public or internal comment. Only the **first 500 comments** are searched. Attachment presence is not attachment-text retrieval.

**Fit:** tests must cover long conversations and the exact declared source population, not only loaded first pages. No Asym 500-comment exclusion is justified here. Internal-note support must mean currently authorized note text, not unrestricted internal collaboration.

### Zendesk: search, retained history and privacy are not interchangeable

[About ticket archiving](https://support.zendesk.com/hc/en-us/articles/4408887617050-About-ticket-archiving), **1 May2026**, states archived tickets remain searchable but are excluded from views and some context surfaces. [Privacy guidance](https://support.zendesk.com/hc/en-us/articles/4408823195930-Complying-with-Privacy-and-Data-Protection-Law-in-Zendesk-Support), refreshed **12 September2026**, warns that images, attachments and recordings may contain personal information not discoverable by text search.

**Fit:** define eligible retained coverage explicitly and preserve D17’s expiry. Avoid contradictory CRM-history/view/search stories. Neither an empty keyword result nor an attachment index proves that all sensitive copies were found. These pages do not establish current search-index removal timing; do not invent a vendor deletion SLA or import other old redaction instructions as Core policy.

### Intercom: distinguish versions and text matching from structured filters

[Inbox search and filter](https://www.intercom.com/help/en/articles/6516006-inbox-search-and-filter), refreshed **12 September2026**, dynamically says “updated over a week ago.” It distinguishes global Inbox and current-view message-text search, describes exact-phrase quoting and says keywords are optimized for English. It points React Inbox users to separate documentation. It also describes differences between keyword search and text-property filter matching.

The [React Inbox search article](https://www.intercom.com/help/en/articles/16393491-search-and-filter-conversations-in-the-react-inbox), refreshed **12 September2026**, dynamically says “updated over 3 weeks ago.” It documents keyword/email/ID retrieval, visible filter chips and Match all/Match any for filters; Boolean keyword syntax is not supported. Its access description differs from the original article’s Lite-seat exclusion. Exact plan/seat applicability therefore remains qualified, not universal.

**Fit:** show scope and searchable field meaning in ordinary language. Do not silently change keyword behavior when opening a saved view, or treat English-specific stemming as adequate international support. Neither inspected page establishes a precise internal-note index or attachment-content index; Front and HubSpot are stronger sources for those aspects.

### Kustomer: message body predicates exist, but global object search is broader

[Use search](https://help.kustomer.com/en_us/categories/use-search-r1ihHrvcge), official indexed content refreshed **12 September2026**, documents **Message → Body → Contains** alongside conversation status/team/date conditions. It distinguishes Customer, Conversation, Message and other object queries. Direct article extraction remains empty; exact plan and internal-note/attachment indexing coverage are not established. The same indexed category aggregates contradictory legacy/new refresh descriptions, so no refresh cadence is adopted.

**Fit:** structured work filters and message matching can cooperate. Do not import its customer-centric search model or assume arbitrary CRM/custom-object fields belong inside Asym Support. Current user-entered email lookup must not become identity verification, link creation, CRM mutation or an automatic new-person prompt.

## UX scope that makes A useful without noisy controls

This is a proposed direction to examine after the founder answers, not an already accepted interface specification.

1. **A readily visible conversation search field.** Use the existing Support list/search surface alongside the known view and filters. A short discoverable hint explains “Search conversation details, messages, internal notes and attachment names.” Avoid claiming “all content” when file contents are excluded.
2. **Visible current scope.** Keep the active inbox/view/status filters visible. An explicit **Search all Support conversations** affordance may broaden to current authorized ordinary Support scope; it must not silently clear a CRM record anchor or restricted scope. The phrase “all” never means all tenant data.
3. **Relevant results with matching evidence.** Show one continuing conversation per authorized D10 grouping, a short qualified matching excerpt, its source type and date where helpful. **Internal note** is distinguishable from a requester message. Opening the result lands at the source or provides its exact in-conversation navigation; preserve list position and permitted CRM return context.
4. **Narrow without rebuilding.** Familiar D20 filters and optional Message/Note/Subject/Filename refinements help reduce noise; selection does not mutate conversations. Do not make staff learn vendor modifiers before ordinary search works. Precise phrase/token/Unicode semantics and sorting still require a qualified later contract, rather than this scope question freezing a parser.
5. **Honest empty and incomplete states.** Distinguish no matches in the displayed scope, unavailable source coverage and temporary indexing/processing delay. Offer a meaningful narrower/broader search action without silently changing scope or promising erased material remains retrievable.
6. **Quiet keyboard/touch behavior.** Preserve focus while results update; avoid moving the selected result under a click. Handle IME composition, long/non-Latin/right-to-left text, punctuation and mobile keyboards. Meaningful status changes are announced without a noisy alert for every keypress. Existing query budgets and paging must still govern.

## Established Asym boundaries to carry forward under every option

- **Current authorization precedes all observable results.** Matches, snippets, counts, ranks, facets, filenames, previews and deep links must reflect the actual current source/field permissions. A note or protected BCC field cannot leak merely because a conversation shell is visible. Searchability never grants identity, membership, CRM, financial, care, export or send authority.
- **Admitted discussion only.** Ordinary conversation search is separate from D19 held intake and technical recovery, personal drafts, reusable Email Studio library content, knowledge-base search and global CRM search. “Internal notes” here means retained admitted Support notes the actor may currently inspect.
- **Source retention remains authoritative.** D16 redaction and D17 expiry remove eligibility for derived matching and snippets, including cached and restored-index paths. Search copies cannot keep a longer independent body-retention clock. Index lag is not permission lag; a current serving fence is required even when physical cleanup is asynchronous.
- **Attachment names are also sensitive metadata.** A includes only names already eligible for this actor/source purpose. It neither downloads a file nor bypasses malware/attachment-access restrictions. C adds controlled extraction derivatives; it does not make unsupported or unsafe files readable.
- **One current query meaning.** D20 owns shared saved-view identity and declared criteria; D21 label Any/All/No labels semantics remain unchanged. Qualify the supported text predicate through existing query/search owners, rather than creating separate browser/API/report interpretations or silently scanning a capped cache.
- **Original identities remain intact.** Merge/Undo uses source provenance and returns the current eligible continuing conversation without multiple duplicate cards. Related conversations remain separate. Opening a match preserves the authorized source and return context; no CRM record or related-record link is created.
- **No provider or Email Studio operation on search.** Search reads the qualified Asym source. It does not issue a provider search, publish a Saved Section, prepare a new email, restart D13 acknowledgement, copy a note into an external draft or invoke Resend. Actual reply preparation/admission/delivery keeps the already ratified seam.

## Strongest counterarguments and decision discipline

**B’s smaller surface is valuable** if users nearly always have a reliable reference or participant clue. It reduces the content eligible for text matching, though complete current filtering and permissions are still required. Its cost is real extra inspection when the memorable information exists only in the discussion. Staff cannot be expected to predict perfect subjects or labels on intake merely to compensate.

**C’s retrieval value is real** when attached documents carry important reference text absent from the conversation. A supported-format text extractor can be bounded; it need not become AI/OCR. The additional costs are more than storage: malicious/unreadable files, extraction failures, revised/redacted source material, eligibility changes, output provenance and explicit completeness. No evidence here establishes that Asym’s frequent search failures primarily arise from document-only text. That missing demand evidence is why A is the strongest current recommendation, not a claim C is excessive in every product.

**A also needs hard proof.** Message/note search cannot be “best practice” merely because several vendors provide it. It must meet the existing source/retention/query boundaries and show people the correct match without extra disclosure. Current provider documentation does not independently prove Core’s implementation or tenant usability.

No live vendor tenant, representative ministry user study, production-shaped query benchmark, indexed attachment test, permission transition experiment or redaction timing test was performed. Source facts above are documented product behavior; usability direction and relative scope judgments are clearly identified inferences. Root must reconcile Core Phase29/40/shared capability ownership before presenting final architectural implications. No new database engine, full-text implementation, external indexing vendor, parser package, retention duration or performance number is selected by this research.
