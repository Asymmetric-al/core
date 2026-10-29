# Phase 29 Q45 — How should staff point to a location in a review comment?

**Status:** Conrad fully ratified Q45 A+B, all required amendments and Document
Review Comment on2026-10-25, Asia/Bangkok. The
[complete review](phase29-q45-adversarial-review.md) and
[ADR-0045](../docs/adr/0045-exact-version-review-comments-and-visual-locations.md)
record the adopted package. Q01–Q45 are ratified with27 glossary terms. Earlier
question preparation and selected-answer review below are dated history.
Q46 research is authorized; no Q46 answer, implementation or formal publication
is implied.

## Historical question preparation — 2026-10-25

2026-10-25, Asia/Bangkok. **Q01–Q44 are fully ratified. Q45 is researched and unselected.** Recommendation: **A — Exact-version comments with supported location references.** This is one founder-level interaction choice, not whether required comments should exist. No Q45 ADR, glossary term, formal specification, implementation, provider change or message is authorized by this question.

The complete [owner/contracts research](phase29-q45-owner-research.md), [runtime research](phase29-q45-runtime-research.md) and [comparative UX research](phase29-q45-comparative-research.md) support this question. Their findings distinguish source requirements, current code, documented external patterns and product judgment. Neither a library package nor an attractive viewer proves the native feature exists.

## The question

**For staff reviewing ordinary request evidence, should comments use supported page/location references, or also offer visual pins on qualified PDF/image previews?**

- **A — Exact-version comments with supported location references. Recommended.** A comment belongs to the exact source use, file version and business purpose. Staff can leave a whole-version comment or attach a supported page, slide, sheet/cell or line reference, with navigation where the qualified reader can faithfully resolve it. Text can further describe the detail. This is a complete baseline, not a version-only note that omits the founder's location requirement.
- **B — Add optional visual pins on qualified PDFs and images.** Keep everything in A, and let staff place an optional point or bounded region on supported static PDF/image representations. A comment list and readable location description remain available. This improves precision when words and a page number are cumbersome, but adds coordinate/representation mapping, zoom/rotation, mobile and accessibility qualification.

B does not require general text-selection anchoring, freehand drawing, PDF editing, redaction, a new real-time collaboration service or a third-party document platform. A does not prohibit a separately chosen future enhancement; it selects a useful complete scope now. Neither choice removes existing source-specific annotation obligations or rewrites original files.

## Practical context

Illustrative example, not an observed ministry workflow: Elena reviews version2 of an ordinary submitted document and writes, “Please check the date beside the signature,” attached to page3. Another authorized staff member opens the comment and can navigate to that exact page while its qualified representation remains available. The comment never becomes a remark on page3 of a later corrected version merely because that version is now current.

Under A, Elena describes the precise detail in text. Under B, she can additionally mark the relevant area on that page. B is more useful when a scanned page has several similar dates or an image has no useful textual landmarks. A remains more uniform across PDF, Office reading renditions, saved-value spreadsheets, literal text and files whose preview is unavailable.

This is internal source-qualified review context. Sending instructions or a question to the participant remains the deliberate Q23/Q30 source action; an internal comment is not made outward by a visibility toggle. Commenting, viewing, marking a discussion resolved or locating a page does not approve evidence, fulfill a request or create a new recipient permission.

## Why this is the next meaningful decision

The founder brief §10 already requires useful review comments bound to the intended version, business purpose and page/location where supported. Q29 settled paired version reading without automated differences; Q30 settled participant item questions and deliberately left staff version comments distinct. Q38/Q42/Q43 settled discovery, organization and shared views; Q44 settled the ordinary bulk-delivery shape. None settled whether the ordinary reader needs visual location markers.

The choices are therefore supported-location comments versus those comments plus visual anchoring. “No comments,” “put everything in an item conversation,” or “version-only notes with no supported location” would remove baseline requirements and are not fair alternatives. The question is scoped to the ordinary request-evidence source already being developed. It does not commandeer Support conversations, official receipts, expense decisions, public CMS review or every future document consumer.

Other source/custody/retention/public-media/consumer coverage remains part of the wider Phase29 session. Advancing this genuine unresolved interaction does not declare the entire phase complete or make a future office editor a prerequisite.

## Practical comparison and recommendation

| Dimension                             | A — Supported references                                                                                             | B — References plus optional visual pins                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Typical action                        | Write a comment; optionally attach a location the reader actually supports.                                          | Same action, with optional point/region selection on eligible PDF/image views.                             |
| Finding the detail                    | Jump to the supported exact page/slide/cell/line and read the description.                                           | Jump to the exact supported representation and show the marked spot/region.                                |
| Strongest benefit                     | Consistent useful feedback across the existing format scope, with fewer interaction modes and mapping dependencies.  | Less ambiguous spatial feedback on dense forms, scans, photographs or diagrams.                            |
| Main cost                             | More descriptive typing and manual locating within a page; comments can still be vague.                              | Additional representation identity, coordinate mapping, keyboard/non-drag alternatives and device testing. |
| Preview unavailable                   | A currently authorized whole-version note or meaningful textual reference remains possible; no fabricated page jump. | Falls back to A; absence of a canvas cannot eliminate ordinary comments.                                   |
| Later correction or changed rendition | Keep exact original target; navigate only if the qualified reference still resolves.                                 | Same rule plus exact marker-basis handling; never move a pin by guesswork.                                 |
| Mobile and assistive technology       | Shared semantic comment list, optional location control and normal text entry.                                       | Same list plus accessible equivalent marker creation, discovery and navigation.                            |
| Source/output consequences            | Original bytes, acceptance and participant rights unchanged.                                                         | Identical; a review overlay is not editing, redaction or an annotated export.                              |
| Evidence limitation                   | No measured Asym typing/time/error improvement is established.                                                       | No measured Asym prevalence, licensing need, performance or ROI is established.                            |

**Recommend A.** It delivers the already-required exact-version/location feedback across the complete declared reader scope and keeps the normal task straightforward. It accepts a real tradeoff: visual detail may require more descriptive text. Choose B if precise spatial feedback is important enough to justify its additional supported-reader and accessibility work. Current products demonstrate that B can be valuable; they do not establish that every ordinary nonprofit document request needs it.

This recommendation is not based merely on missing current code. A also needs real source commands, protected comment storage, faithful location resolution and composed user proof. Both choices must be implemented properly. Neither receives a free/cost-neutral guarantee or a guessed delivery estimate.

## Current primary research

Primary pages were read on2026-10-25. Documentation demonstrates the stated product behavior, not authenticated hands-on testing, Asym user feedback or implementation qualification.

| Source / edition / date                                                                                                                                                                                                           | Verified lesson                                                                                                                                           | Core consequence and limits                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Box web Annotations](https://support.box.com/hc/en-us/articles/360048016153-Annotating-Documents), current page; no usable publication date shown                                                                                | Activity-pane comments can carry page navigation, region/text annotations and version distinctions; annotations are overlays separate from file contents. | Strong evidence for B's spatial usefulness and readable comment-list companion. Do not import Box's roles, email defaults, sharing, edit/delete rules or current-version-only page marker behavior.                |
| [Dropbox file comments](https://help.dropbox.com/view-edit/commenting), current page shows Oct10,2023                                                                                                                             | Whole-file and specific-part comments coexist; its specific-part section limits that interaction to images/PDF.                                           | Supports progressive optional precision with a baseline comment path. Do not infer all formats, adopt “file access grants comments,” import reactions/export/notifications, or promise automatic marker migration. |
| [Submittable submission notes](https://submittable.help/en/articles/923669-how-do-i-attach-a-note-to-a-submission-who-will-be-able-to-see-it), Nov16,2023                                                                         | Internal review notes are distinct from messages sent to submitters.                                                                                      | Domain-near evidence for the staff/participant distinction. Its submission-level note modes and administrator visibility do not establish Core's exact-version model or audience policy.                           |
| [W3C Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)                                                                                                                                     | Equivalent single-pointer operation without dragging is required for drag functionality; keyboard alone is a different requirement.                       | B needs an equivalent non-drag marker operation as well as keyboard/AT access; simply offering a less precise text comment is not proof of equivalent functionality.                                               |
| [W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) | Narrow controls, meaningful programmatic status and predictable input matter to the complete task.                                                        | Both use Core Base UI/base-maia, stable focus, deliberate Post and honest recovery; no hover-only authoring, input-triggered submission or claim of passed accessibility.                                          |

The recommendation does not borrow a document vendor's broad access model, account types, unsolicited notifications or edit/delete permissions. New Core review comments also remain distinct from annotations already embedded in an original and shown, if eligible, by the existing static reading profile.

## Repository requirements and source ownership

| Source checked                                                                                                         | Binding requirement / scope                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder attachment §10, lines209–217; §11 current-access/capability rules                                              | Version, supported location and purpose anchoring are required. Comment authority is independent; mentions cannot grant access and comments cannot become a Support inbox or private-care repository.                                                                                    |
| Q02/Q03/Q21/Q23/Q28 ordinary source review/correction contracts                                                        | Exact submitted evidence and source acceptance/currentness remain independent of preview or commentary. Q28 origin/target-use restrictions survive reuse.                                                                                                                                |
| Q29 ratified paired reading, complete decision                                                                         | Two exact permitted versions have independent reader state and source meaning. Pane focus does not choose an acceptance target. No new annotation suite or automatic cross-version alignment was selected.                                                                               |
| Q30 ratified item questions/replies, complete applicable decision                                                      | Participant-visible exchanges are deliberately source-owned outward acts; internal review comments and drafts cannot be toggled into shared messages. The existing mandatory staff-comment outcome was not removed.                                                                      |
| P9 CRM depth:786–803 and existing source/task discussion boundary                                                      | P9 rejects threaded CRM-note comments because tasks own discussion. Surface ordinary source-owned exact-version review context through compatible existing work/reader seams; do not repurpose Party notes or create a universal cross-use document thread.                              |
| Full D32 ADR and current published Support requirement/UX/data/integration clauses, with active OpenSpec incorporation | Read-only static/semantic coverage, exact source/version/profile/options/restriction identity, original page/slide/sheet coordinates, current private reads and dispensable technical generations remain binding. Historical grooming headers do not supersede later formal publication. |
| Published D32 R14/R28                                                                                                  | Displaying supported annotations already embedded in an original is not authoring new Core markers. D32 adds no annotation/redaction canvas. B would be an explicit bounded ordinary-source addition, not an already activated reader feature.                                           |
| P12 current authorization and P3 identity; Phase29 roadmap and owner constraints                                       | One fine-grained source/PDP, exact validated context, coarse Tenant RLS, current metadata/byte access, source-owned business meaning/retention. Storage, folder, title, reviewer role or same digest is not comment authority.                                                           |
| P18/P21/P22/P23/P26 specialist ownership; Q38/Q41/Q42/Q43/Q44                                                          | Do not merge official artifacts, financial collaboration, CMS/media review, Support occurrences, body search, external sharing, organization or original-file ZIP outputs into this staff discussion. Existing source-specific obligations remain.                                       |

Complete paths, actual incorporated source bodies and current code evidence are retained in the three research notes. The published Support normative volume—not an invented `openspec/contracts/support-hub.md` path—contains the full incorporated D32 detail. Its24-hour Ready and15-minute scratch bounds govern technical copies, not staff-comment retention or universal access duration.

## Current implementation versus intended capability

Current inspected code includes post-bound comments and a ministry-update comment dialog, plus PDF Studio template editing/rendering. These provide limited adjacent UI/data examples. Their post identity, audience, role assumptions, demo paths or template-editor behavior do not establish an ordinary source-use/version comment model, faithful page/cell references or optional visual markers.

Prepared capability infrastructure likewise does not prove this source's comment permission or current byte/metadata enforcement is wired. Tests of those adjacent paths do not establish exact-version review, real-role RLS, concurrency, marker fidelity, native device accessibility or current-source retention. The permanent path is the actual ordinary source/P12 command and shared qualified reader/UI seam, not repurposing public posts or installing an office editor.

Fresh live develop is **e483673725cbdc26a49eacb71f7bc22d0e41008e**, unchanged from Q44; local HEAD remains **3d85897ebf1515008ef5c676b1c58a15422fb9ab**. No pull, code/schema/provider mutation, hosted SQL/private-data inspection or native feature test is claimed. Any eventual writer/reader dependency and finite workload must be qualified; no provider or library is selected by this interaction question.

## Boundaries preserved under both options

1. **Exact source context:** comments bind the actual ordinary source use, file version and business purpose. Equal-byte reuse does not share comments or rights. The comment's current audience and the document/representation's current audience are independently enforced.
2. **Supported locations are real:** references use source/representation meanings, not a browser's incidental wrapping or “page3 of latest.” Whole-version feedback remains valid where no location is needed. A typed explanatory reference is not mislabeled as a machine-verified jump target.
3. **No automatic migration:** a new upload or changed renderer/profile cannot silently reattach old comments to new content. Navigation requires the exact qualified mapping; otherwise show lawful context with an honest unavailable location. Do not retain dispensable previews forever to preserve comments.
4. **No forced preview:** when source comment/context authority remains valid, a whole-version note such as “I cannot inspect this file” need not require successful preview. That grants no access to hidden original content, stale excerpts or history.
5. **No extra source effect:** a comment or marker is not evidence acceptance, Request changes, fulfillment, signature verification or a new task. Internal comments are not participant messages and are not embedded into the original or Q44 ZIP. Any deliberate outward action retains its owning workflow.
6. **Current authorization at every real door:** create/read/recover/location-navigation, counts, author identity, snippets and links require actual current authority. No broad file-read-implies-comment rule, role union, raw provider URL or private telemetry fallback follows. Current restrictions also govern retained drafts/late responses.
7. **Safe recovery and history:** lost responses reconcile the same deliberate write; changed intent cannot silently retarget another version. Source-required attribution, correction/moderation and retention need actual owner adoption; no vendor edit/delete mode, permanent unread state or discussion-resolution gate is selected here.
8. **Complete interaction:** ordinary text entry, optional location control, deliberate Post, persistent actual outcome, stable focus, narrow layouts, international text/IME and keyboard/AT/non-drag paths remain required. B additionally needs equivalent marker functionality, not only a text fallback.
9. **Bounded data and readers:** inherit existing qualified format/coverage/lifecycle limits. Measure comment-list and any marker workload without loading entire histories or adding a body-search index. No new notification purpose, mention-based access, archive export, workflow/office suite or broad preview-format expansion follows.

These are inherited constraints and bounded option definitions, not an unselected Q45 decision or a substitute for its full adversarial review after Conrad answers. They avoid concealing a second founder choice inside the recommendation.

## Complete affected journeys checked for question readiness

| #   | Journey                                        | Shared baseline and difference between A/B                                                                                                  |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| J01 | Staff leaves whole-file feedback               | Exact version/purpose comment; no mandatory location. Both support it.                                                                      |
| J02 | PDF page reference                             | Supported exact page and navigation; A describes detail, B may mark it spatially.                                                           |
| J03 | Presentation has hidden slides                 | Preserve original visible-slide coordinates and omissions; no numbering shift or hidden-content inference. B adds no new Office canvas.     |
| J04 | Spreadsheet cell needs discussion              | Qualified sheet/cell coordinates and saved-value meaning; no formula execution or recalculation.                                            |
| J05 | Literal text/CSV location                      | Faithful supported source references; browser wrapping or inferred headers/types cannot retarget a comment.                                 |
| J06 | DOCX/static rendition has limited coverage     | Refer only to the actual qualified representation; no claim about omitted revisions/comments. B is not a general Office annotation editor.  |
| J07 | Image lacks textual landmarks                  | A uses description; B may provide a qualified point/region with readable description and equivalent controls.                               |
| J08 | Scanned page has repeated visual details       | B can reduce ambiguity; A requires more precise wording. Neither supplies OCR, authenticity or automatic interpretation.                    |
| J09 | Preview unavailable but comment permitted      | Preserve a lawful whole-version/context note; no fabricated location, forced download or external viewer.                                   |
| J10 | New corrected version arrives during writing   | Original target remains explicit; any new-target choice is deliberate and currently qualified. No inherited approval or automatic reanchor. |
| J11 | Technical rendition expires or profile changes | Comment retention is separate; navigate only through an exact currently qualified mapping. Missing mapping is visible and not guessed.      |
| J12 | Comment or file access is lost                 | Deny affected content and clear affected stale representations; independent lawful source work can remain.                                  |
| J13 | Tenant/assignment/reader pane switches         | Prevent late results/drafts/actions from targeting or exposing another context/version.                                                     |
| J14 | Post response is lost or connection fails      | Truthful pending/unknown/committed result with semantic retry; no duplicate note or silent target replacement.                              |
| J15 | Two versions are read together                 | Comment target is explicit per version/purpose, not implied by scroll/focus or current acceptance state.                                    |
| J16 | Keyboard, AT, voice or non-drag pointer user   | Complete baseline task; B also supplies equivalent location-marker creation/navigation, not pointer-only canvas controls.                   |
| J17 | Phone, zoom, long names, RTL or IME            | Readable comment list and location context with predictable text entry, focus and narrow controls.                                          |
| J18 | Low bandwidth or large history                 | Bounded loading and recoverable input; no entire-file/history fetch merely to list permitted comments.                                      |
| J19 | Staff needs participant clarification          | Use deliberate Q23/Q30 source action; no internal visibility toggle, copied private thread or automatic email.                              |
| J20 | Request closes or source retention changes     | Apply actual staff comment/history authority; no universal participant clock, preview TTL or retained-equals-readable rule.                 |
| J21 | Support/operator investigates stale location   | Scope-safe evidence and owner repair; no plaintext/body grant, SQL workaround, original mutation or automatic approval.                     |

## Q44 ratification and question readiness

Q44 A and every required amendment are fully ratified. Its sixteen-paragraph product decision,44 proof groups and217 substantive review-table rows are preserved; only one stage sentence now states ratification. All26 glossary definitions are byte-preserved and391 other-file hashes passed ratification checks. Q44 remains ratified planning intent, not native release evidence.

**Independent whole-question reviews are closed** for owner/contracts, runtime/data and comparative UX. Each reviewer read the complete question, both practical options, recommendation and tradeoffs, source/runtime/evidence boundaries and all21 journeys. The final P9 owner row was read against actual source and verified as the only addition after initial full review. No unresolved material issue remains.

The exact reviewed pre-closure question SHA-256 is `46bcc6dc43e9717eca2f31a08c0d66027ecd804e84701e2d03cbb4392a6be48f`. The research notes retain complete source trace, precise current-code limits and the34-to-21 comparative journey crosswalk. Root read the complete notes and reconciled the required-location baseline, meaningful B benefit, typed representation semantics, separate source comment retention and internal/outward boundary.

This closure insertion and later Markdown formatting alter whole-file hashes without choosing an answer or changing the reviewed options. Deterministic checks verify option/journey coverage, links, ratified Q44 decision/table preservation, unchanged glossary/prior files and canonical/export parity. This establishes question readiness only; it is not the full selected-answer adversarial review, native qualification or founder selection.

No Q45 answer, ADR or new glossary term is inferred. The full selected-answer adversarial review follows Conrad's choice. Formal canonical-owner/OpenSpec publication remains `/to-prd`; implementation tickets remain `/to-issues`. This question chooses how staff locate feedback, not a database schema, coordinate API, provider or notification policy.

## Historical selected answer and review — before ratification, 2026-10-25

Conrad selected **A+B — Exact-version comments with supported location
references and optional visual pins on qualified PDFs/images**, requesting
deep research, excellent UX and complete adversarial review with particular
attention to Supabase database health. Disposition: **Accept with required
amendments**. The [complete review](phase29-q45-adversarial-review.md) and
[ADR-0045](../docs/adr/0045-exact-version-review-comments-and-visual-locations.md)
record the exact20-paragraph decision, Q45-C01–C20/P01–P42, all22 categories,
30 lifecycle distinctions,49 journeys,nine finite budget families and nine
operating controls. The full package and one new glossary term await
ratification. Q01–Q44 and all26 existing glossary definitions are unchanged.

One ordinary source-owned staff comment targets an immutable evidence
use/version/purpose/Tenant/environment and trusted author. Its current revision
has bounded nonblank plain text and at most one supported typed location or
qualified static PDF/image point/rectangle. A concise observation suffices;
no required title, essay or semantic classifier. General comments need no
preview. P9 work ownership, P12 current rights, Q28 origin restrictions and
D32 reading coverage remain binding. New Core markers are an explicit narrow
D32 authoring addition; existing embedded annotations or Office pixels do not
automatically qualify new marker cohorts. No post_comments/Party-note reuse,
task-per-note, reply tree, Resolve gate or new inbox is selected.

Location identity uses the exact source/version and trusted compatible
representation/geometry basis, not mutable latest, raw screen pixels, filename,
page-count/hash equality or solely an expiring generation. Finite closed shapes
are checked before and after canonicalization. Qualify actual rotation, crop,
orientation, zoom and device scale. New versions never inherit comments/pins.
Incompatible or unavailable mapping shows Location unavailable; no guessed
reanchor, silent deletion, automatic download or indefinite preview retention.

Post/Save/Withdraw/Restore use one authoritative source command with exact
current rights, expected revision, semantic identity and coherent text/location,
history, affected-review basis and outcome. Original-operation reconciliation
precedes new-work eligibility under current disclosure. Separate same-text
follow-ups stay distinct. No-op saves/maintenance cause no fake Edited revision
or review invalidation after current checks. Pointer, typing and zoom state
remain local with no database writes. No mandatory Realtime, CRDT or presence
is introduced; raw public-post subscriptions cannot carry private reviews.

Authors can deliberately correct their own text/location on the same target,
withdraw, and Restore the exact current withdrawn revision's latest lawfully
retained content under current permission. Wrong targets require withdrawal
and a new correct-target comment. Text-only edits/Restore may keep unchanged
unavailable anchors without forcing preview. Scoped operators act with their
own attribution, never rewriting another author's prose. Governed restrictions,
redaction/disposal/source ending and prior operation identities cannot be
bypassed; no new Trash platform or universal recovery timer is created.

Structurally affected uncommitted review context must be revalidated after a
real relevant comment change. A comment cannot undo committed review, alter
instructions, add a Q22 fulfillment condition, accept evidence, require a reply
or communicate outward. Q23/Q30 communication remains separately deliberate;
Q38 body search, Q41 recipient access and Q44 annotated ZIP output are not added.
Current comment/history/author/count/location permissions remain distinct from
byte access. Source retention, security audit, technical logs and disposable
preview lifetimes stay separate; general diagnostics omit private payloads.

Use a small relational record, native same-scope keys/constraints and effective
all-role/all-writer grants/RLS/PDP proof. Missing literal WITH CHECK is evaluated
using actual PostgreSQL defaults/composition. Bounded stable-keyset lists,
page-marker/author batches and measured indexes avoid N+1, whole-history JSON,
all-Tenant loads and hot counters. Preserve P12's actual logical governed-read
budget/carve-outs. No spatial extension, vendor or unchanged-bill claim follows.

One semantic list/composer and deliberate Comment here support equivalent
keyboard/AT and single-pointer non-drag point/region operations. Touch pan stays
separate; provisional location and text commit together. Short text, narrow
screens, RTL/IME, overlap, focus, weak connections, unknown saves and lawful
draft recovery are included. Text fallback is useful but does not complete B.
Actual finite database/client/retention/cost profiles and composed intended-user
proof are activation requirements. Mixed clients preserve or reject unfamiliar
anchors; additive rollout/restore and scoped recovery avoid SQL repair.

Proposed term: **Document Review Comment:** A source-owned staff observation
about an exact document use and file version, optionally associated with a
supported location. It is distinct from comments embedded in the original,
a participant message and a review decision. The canonical glossary is not
changed until ratification.

Independent owner/runtime/UX whole-package reviews are closed. Current primary
Box/Dropbox/Adobe/Submittable/W3C/PostgreSQL/Supabase/Mozilla research supports
the scoped path while rejecting incompatible vendor defaults. The96-case
in-memory geometry/cursor probe illustrates transforms, rounding and tied-order
hazards; it proves no native viewer, RLS, database performance, user result or
bill neutrality. Fresh live source remains e483673 and local3d85897 stays
distinct. Exact parity, all-category/proof coverage, links, formatting and prior
file preservation are verified separately. Formal owner/OpenSpec publication
remains /to-prd, tickets /to-issues. Q46 is not asked or inferred.

## Full ratification — 2026-10-25

Conrad explicitly instructed on2026-10-25: “Yes, fully ratify Q45 A+B with all
required amendments, including the new glossary term. Record it and move to
the next question in this Phase 29 grill-with-docs session, with research,
practical options, and your recommendation.”

The full20-paragraph decision, Q45-C01–C20/P01–P42, all22 category outcomes,
30 lifecycle distinctions,49 journeys,nine finite budget families and nine
operating controls are adopted. Only stage/glossary-adoption language changes;
all substantive product requirements and proof obligations are preserved.
Document Review Comment is now the27th canonical glossary term, using the
exact ratified two-sentence definition; all26 preceding definitions are
unchanged. Q01–Q45 are fully ratified grooming intent.

One source-owned ordinary staff comment has an immutable evidence use/version,
purpose/Tenant/environment and trusted author; bounded nonblank text and at
most one optional supported typed location. Qualified static PDFs/images add
point/rectangle placement. A general note needs no preview; no essay or semantic
classifier. P9 work ownership, P12 authority and D32 coverage remain intact;
new Core markers are an explicit narrow authoring addition, not an Office/chat
platform, public-post reuse or task-per-comment engine.

Exact compatible source/representation geometry, finite pre/post-conversion
validation and no automatic reanchor preserve location meaning. Unavailable
mapping stays honest; comments do not extend or inherit preview lifetimes.
Post/Save/Withdraw/Restore coherently record the intended revision/history/
outcome with current authority, expected revision and durable semantic identity.
Original operations reconcile first; stale expected revisions conflict and
no-op maintenance fabricates no edit or review-basis change. Pointer/typing
state stays local. Own correction, qualified latest-state Restore and scoped
operator attribution cannot rewrite targets or bypass governed disposal.

Relevant structural changes fence affected uncommitted review only. Comments
do not undo committed decisions, add fulfillment predicates or communicate
outward. Comment/history/location permissions and byte access remain distinct.
Use small relational records, native same-scope invariants, effective all-role
RLS/PDP and every-door proof, bounded keyset pages/marker-author batches and
measured indexes. No required Realtime/CRDT, spatial extension, whole-history
JSON rewrite, zero-cost claim or provider mutation follows.

Complete keyboard/AT and equivalent single-pointer non-drag geometry, semantic
lists, concise text, narrow/RTL/IME/touch/low-bandwidth recovery, coherent unknown
saves and safe mixed-version restore are required. Text fallback does not
complete B. All measured native database, reader, workload, cost, user and
accessibility obligations remain activation gates; the synthetic geometry/
cursor probe and document checks are not native release proof.

Independent owner/runtime/UX full-package reviews are closed, including the
P12-prescribed RLS wording correction. Formal canonical-owner/OpenSpec
publication remains /to-prd; ticket publication remains /to-issues. Research
and one Q46 question are authorized, but no Q46 decision is inferred.
