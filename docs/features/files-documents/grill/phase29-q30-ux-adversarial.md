# Phase 29 Q30 — UX and product adversarial review

2026-10-22, Asia/Bangkok. **Disposition: Accept A with required amendments.**
Conrad's selected scope permits item questions and replies during an ordinary
unfinished request while the source authorizes that participant and purpose.
This note reviews that selection; it does not ratify it, create a formal
specification, change a canonical file or claim implementation.

## Evidence and method

Read the canonical Q30 question and comparative research under
`docs/features/files-documents/grill/`, the requested feature ADRs 0021, 0022,
0023, 0024, 0026, 0027 and 0029, and the relevant founder-brief requirements.
Workspace Q30 counterparts differ from canonical files only in normalized
Markdown table formatting, as verified in this pass. Historical question
headers remain pre-answer provenance; the parent's explicit selected-A task
is the basis of this review. Current repository source contracts outrank
vendor behavior. The grill-with-docs/grilling discipline was read and applied;
no further founder choice is inferred.

All web sources below were opened on 2026-10-22. These are public documentation
facts, not authenticated product testing, observations of Asym staff, runtime
qualification or proof of a universal best practice. No private data, vendor
account, real message, code, provider or permission was changed. No browser,
assistive-technology, native-role/database/race or intended-user test was run.
This pass did not freshly verify GitHub heads and does not repeat historical
HEAD strings as current evidence.

### Primary-source register and strongest alternatives

| Source, visible date and scope                                                                                                                                                                                              | Documented fact                                                                                                                                                                                                          | Product inference and limit                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Content Snare comments](https://contentsnare.com/help/knowledge-base/comments/), updated 2024-03-24                                                                                                                        | A separate field thread supports client questions, replies and internal comments. Its internal-comment control changes the action in the same stream.                                                                    | Strong A precedent for item context. Core should preserve contextual usefulness while avoiding a remembered privacy toggle as its safety boundary. Do not inherit automatic rejection comments or notification behavior.                                                                                                           |
| [Content Snare client experience](https://contentsnare.com/help/knowledge-base/test-your-clients-experience/), updated 2025-10-29                                                                                           | The client flow offers Ask a question beside the work; owners receive comment email.                                                                                                                                     | Discoverability before a useful answer/upload is valuable. Neither vendor engagement claims nor its automatic email prove Asym task success or select Core notification policy.                                                                                                                                                    |
| [FileInvite portal messaging](https://help.fileinvite.com/articles/messaging-in-the-client-portal), current undated edition-specific guide                                                                                  | Contacts can send messages without selecting privacy; contacts cannot message each other. The guide grants the lending team broad message visibility and permits sender-selected contacts.                               | Participant simplicity is useful. All-team visibility, All Contacts, its character cap and mixed-stream privacy indicators are not Core permissions or chosen design. The page redirects another login-host cohort to a different knowledge base.                                                                                  |
| [Submittable messaging](https://submittable.help/en/articles/2489806-how-does-submittable-s-messaging-feature-work), dated 2026-09-16                                                                                       | Submission-context messaging distinguishes disabled submitter initiation from still-permitted replies to an organization's message. Initiation and reply also have different documented email routing.                   | Strong **B** evidence. Staff-invited clarification is coherent and can limit unsolicited native traffic. It still requires external writes, safe history, current authority, operating responsibility and recovery; it is not a cheap staff-only comment feature. Do not copy email ingestion, attachments or recipient expansion. |
| [Submittable Next applicant FAQ](https://next.support.submittable.com/hc/en-us/articles/41242987982231-Applicant-FAQs), updated 2026-08-19                                                                                  | Applicants/awardees have no in-platform inbox. Email and a configured Program Inbox/program contact provide communication; automated no-reply messages are distinguished.                                                | Strong **C** evidence. A capable existing communication route can be a deliberate product choice. Next is a separate product/edition from the preceding source. This does not prove a generic contact link is sufficient for a restricted Asym request.                                                                            |
| [HubSpot updated help-desk editor](https://knowledge.hubspot.com/help-desk/use-the-updated-reply-editor-in-help-desk), updated 2026-09-17; explicitly beta                                                                  | Documents outward replies, internal notes, saved drafts, contact mentions that add email recipients, and combined send/status changes.                                                                                   | Relevant CRM counterexample: a broad communications editor contains behaviors Core must not accidentally inherit. No recipient expansion by mention, no message-driven request acceptance/completion, no assumed cross-session draft store. The beta label and edition are retained.                                               |
| [GOV.UK textarea](https://design-system.service.gov.uk/components/textarea/) and [error message](https://design-system.service.gov.uk/components/error-message/), current guidance                                          | Textareas have persistent labels; copy/paste is allowed. Input errors retain values. Permission, eligibility and service-capacity problems need appropriate explanation and a next route, rather than blaming the input. | Use a modest labeled composer and preserve permitted drafts. Distinguish an empty message from expired access or unavailable service. Core keeps its own Base UI/base-maia controls; this is behavioral guidance, not a component-library substitution.                                                                            |
| [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), WCAG 2.2 AA understanding guidance                                                                                                 | Displayed status changes must be programmatically identifiable; excessive live announcements can become disruptive.                                                                                                      | Announce sending/result/failure once and retain the result. A whole conversation need not repeatedly announce itself or create a new real-time channel.                                                                                                                                                                            |
| [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), AA understanding guidance                      | Content/function must survive the specified reflow conditions; author-created content cannot wholly hide keyboard focus.                                                                                                 | Test the composed reader/question workflow at narrow widths and zoom with the keyboard open. No three-cramped-pane requirement. Accessible primitives alone do not establish composed conformance.                                                                                                                                 |
| [W3C structural RTL guidance](https://www.w3.org/International/questions/qa-html-dir), current guidance                                                                                                                     | Runtime text direction can be detected through semantic direction attributes; logical layout supports RTL.                                                                                                               | Test mixed-direction names, item labels, URLs and messages. Do not use punctuation/direction to visually imply a different audience or target. This adds no translation service.                                                                                                                                                   |
| [W3C Timeouts](https://www.w3.org/WAI/WCAG22/Understanding/timeouts.html), AAA understanding guidance, updated 2026-09-06; [Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html), Level A | Inactivity-related data-loss warnings and timing accessibility have distinct requirements and exceptions.                                                                                                                | Known session timeout and fixed request authority expiry must be explained separately. Do not import the AAA 20-hour example as Core retention, automatic access extension or a permission to preserve private text after revocation. Assess actual session timers before release.                                                 |
| [OWASP XSS prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), current primary guidance                                                                           | Context-appropriate encoding, safe rendering sinks and URL validation are separate controls.                                                                                                                             | Plain text is the smallest useful scope. Pasted HTML/Markdown is not executable formatting; links need qualified handling and cannot become automatic remote previews or evidence.                                                                                                                                                 |

**Why keep A:** a participant can be stuck before staff has any evidence to
review. Contextual questions avoid an artificial replacement file or a forced
handoff to another channel. **Why B remains strong:** a review-led program may
prefer deliberate staff initiation; it avoids open initiation but still has
most messaging qualification costs and leaves early questions on the approved
help route. **Why C remains strong:** an organization with an effective owned
contact route avoids operating another external text surface. Its real cost is
context transfer and potentially fragmented explanation history. None means
no help. No Asym volume, cost, response-time or success study establishes A as
universally superior.

## Adversarial check

### What could go wrong with this answer?

A composer can look complete while questions disappear into unattended work.
Staff can mistake a shared reply for an internal note or treat a message as
formal resolution. A late send can land against changed evidence or after
closure. A copied secret can escape through link previews, diagnostics or
the wrong recipient. A network failure can erase useful text or duplicate a
committed question. A handoff can leave a question with a departed reviewer.

These are plausible product failure paths, not observed native defects. A
fully functional small exchange must include source-owned receipt/routing,
audience clarity, current authority and recovery—not only a textbox.

### What hidden assumptions are we making?

We have no evidence that all staff regularly monitor Core, that all recipients
can use email, or that every source has the same response team or policy.
Q24 review responsibility is not automatically the clarification route.
Accepted evidence does not necessarily mean the entire request is fulfilled.
A message about an older file does not grant old-file access. A contact name
does not establish legal identity. Text may contain sensitive information even
when attachments are absent. A staff answer can affect a real decision without
itself being the qualified source decision.

### How does this affect the whole product?

The feature belongs to the ordinary request and its source, not to reusable
bytes, a global file discussion, the Support inbox or a new CRM timeline.
P6/P17 can provide existing communication mechanics only under explicit native
purpose/audience/retention bindings. Donors, applicants and missionaries need
the narrow request experience; finance, care and other specialist sources keep
their stronger rules. Staff comments, formal guidance, business review and
clarification remain distinguishable. A conversation does not turn a receipt,
payment, application, attestation or care decision into a document status.

### How does this affect the end-user experience?

The useful normal flow is **Ask a question → write → Send question → received
confirmation → return to the item**, and **read a safe staff response → reply**.
The participant sees whom the exchange is for without choosing staff, privacy
levels or contacts. Staff see a clearly outward reply action and the relevant
item/version context without another required pane, claim or checkoff.

Known send success remains visible even if a secondary refresh fails. A draft
survives a recoverable failure only while its context remains permitted.
Expired access has a useful source-approved next route. No chat availability,
typing presence, read receipt or immediate-response promise is implied.

### Does this follow modern best practices?

Current collection products support contextual questions, but B/C show that
native initiation is a product choice. Accessible form/error/status practices
support a small asynchronous exchange. Broad help-desk patterns also expose
the risks of mention-driven audiences, implicit privacy modes and combined
send/status commands. Core should borrow the useful interaction and avoid
unrelated capabilities. Vendor documentation is not proof of accessibility,
confidentiality, user preference or the necessary native operating route.

### Does this fit Asym’s existing repo and product direction?

Yes, if the extension is explicit and bounded. Feature ADR-0023:69–71 expressly
excluded recipient text-only replies; Q30 must supersede only that reservation
for this cohort. ADR-0021's exact staff acceptance, ADR-0022's complete source
predicate, ADR-0023's same-evidence reassessment and competent help route,
ADR-0024:45–75's separation of responsibility/contact/permission, ADR-0026:34–57
and ADR-0027:35–84's distinct notice meanings, and ADR-0029:58–83's comfortable
reading and current-disclosure behavior remain durable boundaries.

The founder brief's sections 10, 16 and 18 require exact-purpose review,
confidential comments, useful recovery and explicit return of material scope
changes. Existing support/editor examples are useful adjacent precedents,
not permission to reuse their audiences or declare request messaging shipped.

### Should we adjust the recommendation?

Keep A, with the ten amendments below. None requires a chat platform or routine
completion labels. The accepted-item edge deserves explicit wording: an item
being accepted does not itself disable clarification when the request is still
unfinished and the source still allows it. Conversely, a question cannot keep
the request open after its actual qualified requirements have been satisfied.
Current relevant information still goes through the real source review process.

## Required amendments

### UX-C01 — Item context and useful bounded history

Provide Ask a question in the relevant requested item before upload as well as
after eligible submission. Do not require a file, version, portal enrollment,
review invitation or new request to ask about an already-authorized item.
Show the item and relevant safe instructions while writing; attach a version
only when that is the actual subject. Preserve enough currently authorized
shared exchange to understand replies. Do not expose internal notes, other
participants, unrelated source uses, old file content or all retained history.
The same bytes reused elsewhere do not carry this exchange into that use.

### UX-C02 — Audience visible, never selected by accident

Use a persistent plain-language audience label based on the safe source
identity, such as the approved request-team display. Do not promise a private
one-to-one exchange if several authorized staff can read it. Participants do
not select recipients or privacy. Staff use a distinctly labeled outward
composer/action and separate internal-note action. Navigation tabs can organize
these views, but cannot publish an internal thread, move an internal draft into
an outward composer or reinterpret a prior message. Mentions, quoted names,
CC-like text, folder access and staff assignment never add recipients.

### UX-C03 — Actual source work even with email off

A received question has a durable, discoverable route to currently authorized
staff in the source's existing work experience, with an accountable recovery
owner. Qualify question triage separately from review responsibility; reuse the
same destination when the source actually permits it. Temporary staff absence
is not proof that the route has ceased to exist. Reassignment must preserve
pending work without per-member task copies, a personal claim or a new inbox.

Email Off, bounced email or provider failure cannot hide accepted source work.
If the system cannot establish the required durable acceptance/route, retain
the permitted draft and explain the actual send/recovery condition; do not
claim staff received it. Independently lawful uploads/review remain usable.
No new reply-notification default, bell, digest, SLA, reminder or escalation
policy is selected. Q26 Request changes and Q27 document-actionability notices
do not automatically apply to free-text exchanges.

### UX-C04 — Receipt, relevance and decisions stay distinct

Use truthful receipt language without suggesting human reading, response time,
formal acceptance or delivery through an unselected external channel. A simple
confirmation is sufficient; do not append a mandatory legalistic status
disclaimer to every message. Keep the existing item/request statuses visible
where they actually help the user understand remaining work.

Messages cannot accept evidence, clear Request changes, waive instructions,
change requiredness, submit bytes or fulfill the request. Staff must consider
material new information through existing qualified review/remediation. A
participant pointing out a page already in the PDF can lead to deliberate
Q21 same-evidence acceptance under Q23; no invented replacement file is needed.
Neither any unread question nor a conversation-resolved label becomes a new
universal completion predicate. No automatic unaccept/reopen follows a late
assertion. Actual source obligations and later adverse facts remain meaningful.

### UX-C05 — Changed context and finite access

Correction, guidance change, acceptance, fulfillment, expiry, revocation and
recipient replacement are different events. Recheck the actual current
authority and relevant subject before committing or exposing a reply. Preserve
permitted draft text/context on a recoverable conflict and show what changed;
never silently retarget a draft to a successor file, item, recipient or purpose.
No blanket lock on all item questions merely because a version changed is
needed if the original item question remains lawful and meaningful.

An accepted item can still have clarification when the request is unfinished
and the source authorizes it. Completion ends this ordinary exchange; completed
read-only access does not acquire discussion rights. Staff may retain lawful
independent review/records access after the participant loses access, but cannot
present an outward reply as available to a participant when that is not true.
Use only an existing approved help/recovery route; no automatic email fallback,
new access grant, reopened request, recycled clock or post-completion archive.

### UX-C06 — Draft and send recovery without private offline persistence

Keep a permitted draft and its exact context through correctable input errors,
transient network failure and ordinary navigation within the qualified active
workflow. Distinguish **not sent**, **sending**, **commitment unknown** and
**received**. Recover the same committed message after a lost response instead
of making another. A later refresh failure does not change known send success.

Do not automatically send on reconnect or add device persistence, autosave
across sessions, cross-device drafts or indefinite retention by implication.
Do not erase an otherwise permitted draft merely because connectivity is slow.
On denied/unknown required current authority, clear affected protected content
and late results under the disclosure model; do not promise preservation that
conflicts with revocation. Warn about known inactivity/data-loss behavior and
show the real request end without suggesting writing extends it. The source's
fresh-access route remains separate. Warn before a deliberate discard where
there is unsent text; no confirmation is needed for an empty composer or every
ordinary send. Draft storage details remain qualification work, not a new policy.

### UX-C07 — Plain text and safe links

Use a labeled multiline field and explicit Send question/Send reply action.
Enter remains a newline; keyboard/IME composition cannot accidentally submit.
Copy/paste remains available. Render pasted markup as text unless an existing
qualified supported renderer is deliberately selected; no rich-text editor,
attachments, embedded image or document annotation engine is required.

Plain URLs can remain text or use existing qualified safe link handling with
an understandable destination. Never execute unsafe schemes, fetch thumbnails,
unfurl remote content or silently follow a link. Do not imply the destination
is safe or approved evidence. Actual files use qualified intake; a link cannot
bypass it. Names/URLs and long unbroken text wrap without losing meaning.
Sensitive body/link/query text stays out of general diagnostics, analytics and
unselected notification payloads. Applicable content/records owners govern
storage and redaction; no universal new retention number is selected.

### UX-C08 — Mistakes and redaction are honest

Before sending, the audience/item and action label make the consequence clear.
An authorized user can send a corrective follow-up within the still-permitted
exchange. This does not select self-edit, delete or unsend of committed messages.
For a mistaken disclosure, provide the existing governed privacy/records
restriction or redaction route and keep protected content out of subsequent
ordinary display where that owner requires it. Do not promise that already
seen/copied text can be recalled. Preserve lawful minimal attributable history
without retaining prohibited raw content or granting ordinary access to redacted
text. A new edit/delete product would be a separate decision, not small hardening.

### UX-C09 — Comfortable composed access

Use shared Base UI/base-maia and the existing bounded request layout. Preserve
item/reader position and return focus. Staff paired reading can switch to or
open the relevant exchange without requiring three simultaneous panes. On
mobile/zoom, use a readable stacked or explicit switching equivalent. Labels,
audience, errors, chronological order and the deliberate Send action must be
available to keyboard, screen reader and non-drag pointer users.

Test long/international names, large text, supported RTL/bidirectional input,
IME, virtual keyboard, focus visibility, status announcements and historical
pagination. Avoid color-only private/public meaning and placeholder-only labels.
Announce meaningful results without replaying the whole history, stealing focus
or scrolling someone away from what they are reading. Load bounded text/context
before optional heavy readers; the question must remain useful on slow links.
No accessibility or language coverage is established merely by library reuse.

### UX-C10 — Bounded work and release evidence

Use finite measured message-size/history/rate/recovery budgets appropriate to
representative source use, safe abuse controls and fair tenant work. Do not
copy a vendor character cap or invent a maximum clarification-attempt quota.
Tell the user the actual relevant limit before losing text and provide a safe
route for legitimate needs outside it. Expected recovery cannot require raw
SQL, provider consoles or repeatedly telling participants to upload again.

Before activation prove source bindings, current authorization, exact subject,
durable receipt/routing/replay, safe content, retention/redaction, lifecycle
races and composed user journeys. A receiving route is an operational promise;
name its actual owner and qualify workload/absence/handoff behavior. Observing
age/backlog uses minimized metadata, not a new body-search analytics feed.

## Journey coverage and required proof

| Journey                                            | Required observation before release                                                                                                                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Confused before uploading                       | Recipient finds Ask a question beside the item, knows the audience, sends without a file/account enlargement and returns to instructions.                                                          |
| 2. Explanation of already-submitted evidence       | Staff reaches the exact permitted evidence and deliberately re-assesses; reply alone does not satisfy the item and no fake replacement is demanded.                                                |
| 3. Question while checking/preview unavailable     | Text work does not depend on preview readiness; no automatic download, inaccessible viewer or upload failure is invented.                                                                          |
| 4. Guidance requires a real correction             | Reply and file correction remain separate; the participant understands the actual remaining action.                                                                                                |
| 5. Accepted item, request still unfinished         | Current source-authorized questions remain possible; acceptance is not silently undone and no extra review is forced.                                                                              |
| 6. Staff drafts internal and outward text          | Keyboard navigation, switching views and stale restores cannot send an internal draft externally or expose earlier internal text.                                                                  |
| 7. New correction during composition               | Original subject/version stays exact; the user sees relevant change and can recover permitted work without silent retargeting.                                                                     |
| 8. Guidance/requirement changes during composition | Current instructions are distinguishable; obsolete wording cannot silently override the new source rule.                                                                                           |
| 9. Fulfillment races with send                     | Both source orders have truthful outcomes; no late write into completed access or universal unanswered-message completion lock.                                                                    |
| 10. Participant expires before staff answers       | Staff sees the actual outward availability; recipient sees only currently permitted state and approved help, with no access extension.                                                             |
| 11. Revocation/recipient/tenant/purpose switch     | Drafts, messages, counts, error details and delayed responses do not cross contexts or remain exposed under lost authority.                                                                        |
| 12. Fresh unfinished access                        | Only the newly authorized current shared context is exposed; expiry is not a historical-message entitlement or clock reset by reading.                                                             |
| 13. Email off or unavailable                       | Authorized staff can discover the received question in real source work; receipt does not depend on email or imply human acknowledgment.                                                           |
| 14. Person/team absence or handoff                 | One logical source work route survives and reaches currently qualified staff; no all-admin fallback or private roster disclosure.                                                                  |
| 15. Double-click, retry or lost response           | Exactly one semantic question is received; original attribution/context survives; known success remains after a failed refresh.                                                                    |
| 16. Slow/disconnected transport                    | Composer/context remain useful when permitted; unknown commitment is reconciled, not labeled failed or auto-posted later.                                                                          |
| 17. Mistaken sensitive text                        | Corrective follow-up and qualified privacy/records route work; no unsend guarantee, unsafe audit replay or rewritten decision history.                                                             |
| 18. Paste, malicious markup and links              | No executable content, remote preview fetch, hidden audience expansion, credential leakage or linked-evidence bypass.                                                                              |
| 19. Mobile/zoom/keyboard/AT/RTL                    | Audience, field, error, send result and return focus work with actual composed controls, long names and mixed direction.                                                                           |
| 20. Two readers plus discussion                    | Staff retains exact version identity and position; a narrow-screen equivalent avoids a forced third pane and context loss.                                                                         |
| 21. Long exchange/high workload                    | Bounded pagination and fair rates preserve item context and readability; finite limits have useful recovery and do not silently drop work.                                                         |
| 22. Material late information                      | Staff can route a genuine concern to the owning review/remediation process, preserving previous acceptance/fulfillment history without pretending text is irrelevant or automatically dispositive. |

Use representative staff and limited participants, including intermittent staff,
people using assistive technology and realistic slow/mobile conditions. Observe
whether they can find the action, correctly identify audience, distinguish
received from accepted, understand the changed basis and recover without duplicate
sends. Measure task success, wrong-audience attempts, recovery success and
practical interaction/time; establish release thresholds from the intended
cohort instead of inventing numbers here. These are required proof objectives,
not performed tests or a mandatory new analytics platform.

## Risks, likelihood and operations

Likelihoods below are qualitative exposure judgments derived from the described
flows, not measured incidence or discovered production defects.

| Risk                                                 | Expected likelihood / impact                                        | Necessary prevention and evidence                                                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unattended questions when email is off               | Plausible, especially with intermittent staff / high service impact | Durable source work, actual staffed/recovery owner, off/absence/handoff pilot. Monitor oldest pending work and failed routing under source-approved metadata and thresholds. |
| Internal content sent outward                        | Plausible mode error / high confidentiality impact                  | Separate composers/actions, persistent audience, no draft transfer or mention expansion; keyboard and adversarial audience tests.                                            |
| Receipt confused with acceptance                     | Plausible wording error / high task impact                          | Accurate acknowledgment and existing distinct item state; participant comprehension test with same-evidence clarification.                                                   |
| Reply races with evidence/closure/expiry             | Expected under concurrency / high correctness and privacy impact    | Exact current source checks and both-order proof; preserve only permitted drafts and truthful committed outcome.                                                             |
| Retry duplicates or loses text                       | Expected on unreliable networks / medium-to-high impact             | Stable semantic send identity, reconcile unknown outcomes, maintain known success; failure injection and real slow-network journey.                                          |
| Sensitive text/link leaks through secondary surfaces | Plausible / high confidentiality impact                             | Minimal safe projection, no automatic previews, current disclosure, body-free diagnostics and governed redaction; inspect all surfaces.                                      |
| Accessibility or localization blocks completion      | Plausible without composed testing / high exclusion impact          | Actual content/control testing across supported AT, zoom, mobile and direction, not component-library assertions.                                                            |
| Unlimited discussion creates hidden operational cost | Unmeasured / medium-to-high impact                                  | Pilot workload, finite fair budgets, existing source triage and owned recovery. No speculative chatbot, SLA engine or queue proliferation.                                   |

## Product unknowns and ratification boundary

The Q30 scope extension itself is material and must be explicitly ratified:
participant writes plus the bounded participant-visible exchange replace Q23's
no-native-reply reservation for the selected ordinary cohort. The accepted-item
clarification in UX-C05 preserves the selected unfinished-request condition; it
must not be silently narrowed to unaccepted items or broadened past fulfillment.

No additional founder choice is necessary merely to select textbox sizing,
layout, storage representation, existing component reuse, indexed pagination,
measured limits or technical race handling. The scoped native source must
nevertheless establish exact clarification permissions, audience, useful history,
staff route, retention/redaction and draft-disclosure behavior before activation.
Unknown owner bindings are qualification blockers for the affected capability,
not permission to invent a universal policy.

The following would be genuine later product choices: post-completion exchange;
new email/SMS/bell defaults or reply-ingestion; self-edit/delete/unsend;
cross-session/cross-device saved drafts; richer attachments/annotations;
tenant-wide enablement defaults or broader specialist participation. None is
selected here or needed to turn A into a general chat product. A response-time
commitment also needs a real operating model before it can appear in the UI.

No new glossary definition is required by this UX review. Preserve the twenty-one
existing definitions and the distinctions between source request, evidence,
acceptance, fulfillment, responsibility, clarification and delivery.

## Review conclusion

Accept A with UX-C01–C10 and the listed proof/operating obligations. The product
should make it easy to ask about the right item, understand who can see the
exchange, obtain a real staff response and recover from failure. It must not
grant broader access, pretend every message changes a review result, or create
extra completion ceremony. B and C remain credible alternatives whose costs
and benefits are documented honestly. Ratification, native qualification,
implementation and later authorized publication remain separate.

## Independent consolidated-draft check — 2026-10-22

Read **all 396 lines** of `work/phase29-q30-adversarial-review.md`, including
the evidence/alternatives, complete corrected decision, C01–C12, inherited
limits, 22 categories, all 15 lifecycle distinctions, 18 journeys, P01–P24,
seven operational controls, synthesis, exact owner reconciliation and evidence
limits. This is a review of the complete proposed package, not a selected
excerpt or claim of native qualification.

**Disposition: Pass subject to one precise input-method wording correction.**
The exact decision currently states: “Enter inserts a newline, including during
input-method composition.” During an active IME composition, Enter commonly
confirms a candidate. Requiring a newline at that moment would disrupt native
text entry. Replace that sentence with:

> Enter preserves normal multiline and input-method behavior; confirming an
> IME composition never submits the message.

C08 and P18 already state the correct behavioral rule: no accidental send.
This refinement preserves the selected simple multiline composer and changes
no product scope. It is needed to avoid contradicting normal IME behavior in
the exact decision used for implementation.

Two nonmaterial editorial refinements were also sent to the parent:

- Change the evidence row's “demonstrated product patterns” to “documented
  product patterns,” matching the explicit no-authenticated-product-test limit.
- Narrow C08's no-mandatory-confirmation wording to **no routine send
  confirmation**. This preserves the low-friction send while avoiding an
  accidental prohibition on a useful warning before discarding unsent text.

All other reviewed UX requirements pass. In particular:

- The decision explicitly includes pre-upload initiation, replies, fresh
  source-qualified unfinished access and independently permitted accepted-item
  discussion without changing correction or acceptance rights.
- C04/P09/P10 distinguish admitted relevant information before an affected
  uncommitted human decision from information after the final human decision
  while Q22 follow-through is deferred. The former uses source currentness;
  the latter does not create another final approval or completion predicate.
  No universal unread/resolved checkbox, forced reply or repeated inspection
  is introduced. Actual source remediation remains meaningful.
- Shared-text context is current-source disclosure, not prior authorship,
  file-history access, a new-person archive or an internal-thread toggle.
  Separate outward acts/drafts and non-expanding mentions are explicit.
- Durable source-work receipt remains independent of optional email, staffing
  presence and secondary projection. Receipt does not promise reading,
  availability, a response time or business resolution.
- Expiry/closure-first and send-first outcomes are explicit; staff may handle
  admitted work but cannot pretend a late outward answer is available to an
  expired participant. No implicit completed-message archive or renewed clock.
- Recovery preserves only permitted drafts and known success. Unknown
  commitment is reconciled. Context changes, stale responses and denied
  authority cannot cross audience boundaries. No private offline persistence
  or automatic reconnect/fresh-grant replay is added.
- Plain text/safe links, no unfurling or evidence bypass, governed redaction,
  no ordinary unsend/edit/delete, long names/RTL, narrow reflow/AT and no
  mandatory third pane are covered with falsifiable proofs.
- Q26/Q27 notification meanings remain exact. No new tenant mode/settings
  platform, bell, email default, read receipt or general chat scope is inferred.
  B/C remain credible and evidence limits remain candid.

The consolidated package adds one concise Document Request Clarification term.
My earlier statement that no new term was necessary was a minimization
recommendation, not a prohibition. The proposed distinction is consistent with
the source-owned act and does not freeze a new thread aggregate/table, so it
creates no UX objection; preserve the preceding twenty-one definitions.

Only this independent note was edited. Final closure awaits the exact decision
wording readback. No canonical, runtime, provider, authentication, private-data
or real-message action occurred.

### Final focused closure — 2026-10-22

Verified the revised consolidated draft at lines 24, 107–113, C08 (line 145)
and P19 (line 279). All three observations are closed: product behavior is
described as documented; the exact decision preserves normal multiline/IME
behavior and never sends on composition confirmation; C08 allows a targeted
warning before discarding unsent permitted text while excluding empty-composer
warnings and routine send confirmations. P19 explicitly proves that recovery
behavior. The revised language agrees with C08/P18 and changes no selected
access, notification, completion or audience policy.

**Final UX/comparative disposition: Pass. No unresolved material finding.**
The preceding complete-draft review remains applicable. This closure is focused
readback of the corrected lines, not another runtime, browser/AT, user or
authenticated-vendor test. Q30's full package still awaits founder ratification;
implementation and activation remain separate. Only this note was edited.
