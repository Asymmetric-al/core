# Phase 29 Q29 comparative research — reading two versions and detected text changes

2026-10-22, Asia/Bangkok. Q01–Q28 are ratified. Q29 remains unselected. This is bounded question research, not an implementation, a selected comparison engine or a completed adversarial review. Official product documentation was checked live; no authenticated vendor product or intended-user test was performed.

## Recommendation and the fair alternative

Recommend **A — paired reading of two exact versions using their qualified previews** for this Phase29 increment. Offer a clear older/newer pair, their source-owned statuses and coverage, and a comfortable way to inspect each while remaining in the review task. On a suitable screen they can be adjacent; a labeled single-column view or explicit version switch must work on narrow screens and with assistive technology. This selects an initial product scope, not a permanent prohibition on additional comparison tools.

The strongest **B** is **A plus detected-text highlighting and previous/next-change navigation for expressly qualified text-comparison profiles**. Both readable versions remain available. This is a useful, credible aid for locating a changed date, amount or sentence in long, mostly stable text. Its strongest case is reducing manual search and the chance of overlooking a small textual edit. Those benefits are plausible product judgments, not measured Asym results.

B should not be weakened into an impossible every-format promise. It adds a real, bounded text-comparison capability with declared input/coverage rules, visible unavailable/incomplete outcomes and anchored detected changes. Visual or pixel comparison, OCR, AI summaries, contract interpretation and legally meaningful agreement comparison are outside this specific choice. An existing preview profile is not automatically a qualified text-comparison profile.

A has a material cost: people still have to find differences themselves, which can be slow and fallible in a long document. Its advantage is a coherent inspection journey across the already-declared preview set without first adding another extraction/alignment result that users may overread. B is stronger if representative actual requests show enough long textual revisions, and a narrowly scoped comparator can be qualified for those inputs. The inspected sources establish neither Asym file frequencies nor a time-saving or accuracy result. They do not establish an industry consensus for either option.

## Settled local context

Repository paths in this section are relative to `/home/conrad/code/core`. Current owner/runtime evidence and remote drift belong to the accompanying owner/runtime research; this note does not equate the local checkout with current hosted behavior.

| Evidence                                                                                                            | Consequence for Q29                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder brief `C:\Users\Conrad\.codex\attachments\f7bc3300-0e34-4add-8ec0-286eba5d6c58\Pasted text.txt:191–207`     | Separately qualify extraction; preserve evidence originals; distinguish paired viewing, text difference, visual difference and legal comparison. Derivatives carry exact inputs, processing profile and coverage. Preview failure does not authorize download or an external service.                                                              |
| `docs/features/files-documents/docs/adr/0003-recipient-corrections-and-exact-review-lineage.md:18–47`               | Correction admission fences the predecessor as current candidate; staff keep their exact reading context and receive a correction notice. The earlier version must not silently become current or approved. Correction grants no general previous-version archive.                                                                                 |
| Ratified Q21 decision, current working copy `outputs/phase29-q21-decision.md`, acceptance and inspection paragraphs | Acceptance concerns exact current item/requirement/evidence/purpose. Partial preview, OCR/AI, filename or viewing telemetry cannot establish review of omitted content. Comparison is an inspection aid, not a substitute for the source's acceptance decision.                                                                                    |
| `docs/features/support-hub/docs/adr/0032-broader-attachment-previews-and-source-owned-renditions.md:9,37–49`        | Reuse qualified reading mechanics and their exact constraints. DOCX reading omits revision markup/comments; PPTX omits declared hidden/media/notes content; XLSX shows bounded visible saved values without recalculation; TXT/CSV remain literal. These are declared reading limits, not proof of complete original-document difference coverage. |

The founder explicitly directs reuse of the narrow reading capability with **current source access**, not Support conversation authority. A pair requires current permitted access to both exact versions and their representations. Retained bytes, a previous acceptance or permission to read the current candidate does not independently grant access to every earlier version. Existing P23 Media current-versus-candidate comparison under ADR-0171, and other existing editorial comparison contracts, remain with their owners; this Q29 choice must not remove, defer or reinterpret them.

## Current primary comparative evidence

### Adobe Acrobat: direct paired comparison and explicit text-only scope

[Adobe Compare two versions of a PDF file](https://helpx.adobe.com/acrobat/using/compare-documents.html), updated 2026-02-26, documents a comparison result with old/new files, a summary, side-by-side or individual-file views, and previous/next change navigation. Text-only mode ignores graphics. Other modes handle continuous text, matched pages/slides, or scanned-page pixels; annotation, formatting and background differences are hidden by default until enabled.

This directly supports B's useful interaction: inspect a detected text change in context and move to the next one. It also explains why a text result must say what it covers. A scan, signature image, moved graphic or changed layout is not certified unchanged by an empty text result. Adobe's richer scanning/visual product is evidence that those are separate capabilities; it is not a requirement to include them in B. No Adobe engine, cloud upload or permission model is selected.

### Microsoft Word: selected text differences, separate result and revision semantics

[Word Compare document differences using the legal blackline option](https://support.microsoft.com/en-us/word/compare-document-differences-using-the-legal-blackline-option) applies to current supported desktop Word for Windows. Users select original/revised documents, comparison categories and character/word granularity. The default produces a third result document; choosing an original/revised output instead modifies that document. Existing tracked changes receive special handling.

The useful precedent is explicit pair selection and navigable, scoped text differences. Its product name does not establish legal assurance, and its editing/revision actions should not be imported into a read-only evidence viewer. D32's DOCX rendition omits revision markup/comments without accepting revisions. Reusing that rendition cannot promise comparison of those omitted source features.

### SharePoint and OneDrive: distinguish version history from file-content comparison

[OneDrive/SharePoint version history](https://support.microsoft.com/en-us/onedrive/restore-a-previous-version-of-a-file-stored-in-onedrive) describes viewing/restoring older versions across file types. The broad file-type statement concerns history and restoration; it does not demonstrate broad automated content comparison.

[SharePoint file history](https://support.microsoft.com/en-us/sharepoint/data-and-lists/view-the-version-history-of-an-item-or-file-in-a-list-or-library) documents selecting versions and, in its Office application example, comparing a selected version with the current version. Its server-era examples should not be presented as proof of a current browser-native arbitrary-file comparator.

[SharePoint page comparison](https://support.microsoft.com/en-us/sharepoint/sites-pages/compare-page-versions-in-sharepoint) highlights changed web parts in authored modern pages/news posts. This is a valid structured-content precedent, but it is a different representation and ownership problem from comparing arbitrary uploaded evidence. The same separation applies to existing CMS field/text diffs: their success does not qualify PDF extraction, scans, Office omissions or source-private byte access.

### Box: useful version-local preview without a verified universal diff claim

[Box Accessing Version History](https://support.box.com/hc/en-us/articles/360043697054-Accessing-Version-History) places each version in the preview sidebar, with version-specific preview and other permission-dependent actions. It identifies comparing current/older content as a use of prior previews, while documenting limitations for non-current Excel previews and watermarked files. Opening an old preview starts at its first page.

This supports making exact history and prior inspection discoverable, and treating version availability separately from current preview support. The cited page does not establish an automated side-by-side text/visual difference engine. Box's folder, restore, share and download permissions are not Asym source-review permissions.

### Dropbox: limited corroboration, not another document-diff proof

[Dropbox version history](https://help.dropbox.com/en-us/delete-restore/version-history-overview) describes retained changes, viewing/restoring history and exclusions. Its general reference to comparison does not specify a text-change algorithm or completeness contract.

[Dropbox Replay video comparison](https://help.dropbox.com/view-edit/dropbox-replay-compare-video-versions?fallback=true) directly documents older-left/newer-right paired viewing and shared playback controls, but for versions of the same video. It is only an interaction analogue for clear pair labels, not evidence of a Phase29 document comparator or a reason to add video support. DocSend performance comparisons concern audience metrics, not document content. No sufficiently direct DocuSign primary evidence was needed for this bounded fork; no DocuSign product claim is used.

## Practical comparison of the two options

|                  | A: paired exact-version reading                                                                                                                                | B: A plus qualified text-change aid                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Main task        | Keep the relevant two versions available in the review context.                                                                                                | Also help the reviewer locate detected text additions, removals and changes.                                                                                                                                  |
| Best case        | Short corrections, revised scans/images, mixed previewable formats, or a reviewer who needs the full represented page.                                         | Long, substantially similar text with small meaningful edits in a supported comparison profile.                                                                                                               |
| Real cost        | More manual work; subtle changes can be overlooked. Pair selection, current access, responsive presentation and version stability still require qualification. | Additional extraction/normalization/alignment fidelity, result provenance, workload bounds, accessible change presentation and failure recovery. An unhelpful result can distract or create false confidence. |
| Honest absence   | There is no automated detected-change result in this Phase29 increment.                                                                                        | Distinguish unsupported input, processing failure, incomplete comparison and no detected text changes within the declared scope.                                                                              |
| Source decisions | Neither viewing both versions nor returning to current automatically accepts evidence.                                                                         | Neither highlighted changes nor an empty result establishes adequacy, authenticity, signature validity, legal equivalence or approval.                                                                        |

A does not mean two browser windows, forced downloading, a permanently split screen or requiring the reviewer to lose their task. B does not require an AI summary, mandatory comparison before acceptance, a new approval stage, annotations or an office editor. Both are compatible with source-owned deliberate acceptance and the existing correction fence.

## UX consequences to pressure-test after selection

1. **Keep the pair explicit.** Show human-readable exact-version identity, source status and relevant time/attribution where permitted. Do not label the older file accepted merely because it is older, or the newer file current merely because it was uploaded later. An exact pair remains stable while a new correction arrives; offer a deliberate move to the new candidate instead of silently replacing content.
2. **Preserve useful context.** Return to the same item, notes, reading position and focus. Allow independent navigation when pagination differs. A shared page number or synchronized scroll must not imply that two pages are semantically corresponding unless that relationship is actually established.
3. **Make both versions usable at narrow widths.** Provide a clearly labeled single-column or explicit toggle alternative, logical focus order and preserved positions. Two squeezed panes are not an accessible comparison. Controls alone do not make inaccessible document content accessible.
4. **Expose coverage where it matters.** The pair retains each preview's omitted-content disclosure. For B, explain its text scope alongside results; keep insertions/deletions understandable without relying only on color. The complete qualified text scope, not only visible/loaded pages, must underlie a claim of no detected text change.
5. **Represent partial unavailability truthfully.** One missing, denied, expired or failed version does not turn the other into a complete comparison. Keep any independently authorized usable version readable where source policy allows, while marking the pair incomplete. No automatic external viewer, provider URL or original download.
6. **Bind B's result to its actual pair.** Both exact inputs, comparison profile/options, extraction coverage and relevant restrictions govern the result. It must not survive an input swap as if still applicable or expand either source's retention/access. Do not add exportable comparison reports by implication.
7. **Qualify the composed reading load.** Existing D32 per-file bounds remain binding; opening a pair must not silently double allowed resource consumption or imply that two maximum-sized previews can run concurrently within an untested capacity. Qualify the paired presentation and scheduling as a bounded composition, with clear waiting/recovery behavior. This question selects no new numeric limits.

These are design consequences and later proof obligations, not claims of implemented controls. Actual representative-file, mobile, keyboard, screen-reader, language/reading-order, long-document and correction-during-review checks remain necessary. Selecting a vendor interaction does not select its technology, authorize egress, copy its roles or qualify Asym's current source permissions.

## Suggested question framing

“When staff need to review a corrected file against an earlier version, should this Phase29 increment provide **paired reading of the two exact versions**, or **also highlight detected text changes for expressly supported comparison profiles**?”

Recommend A with its manual-review cost stated plainly. Present B as a real additional convenience with a narrow text-only meaning. Keep visual comparison, OCR, legal comparison, broader file support, version-access grants and existing owner-specific comparison outside this single decision.

## Independent final question check — 2026-10-22

Read the complete `work/phase29-q29-question.md` after preparation, including its research table, journeys, owner boundaries and proof limits. The material question passes this comparative/UX check: A has a concrete useful journey and candid manual missed-change cost; B adds expressly qualified text additions/deletions and navigation without expanding to visual/OCR/legal comparison; the recommendation is limited to this Phase29 increment and is not an industry-consensus claim or permanent prohibition. Exact version/status labels, current authority over both inputs, stable opened pairs, source-owned acceptance and correction, unavailable-result honesty, single-column/version-switching alternatives and preserved P23 Media requirements are present. D32 per-file rules and separately measured composed-pair load are preserved without selecting new limits.

Independently opened the additional [Microsoft Word side-by-side guide](https://support.microsoft.com/en-us/word/view-and-compare-documents-side-by-side) live. It documents paired reading and optional synchronous scrolling, with a separate link to the Compare feature. The question's source characterization is accurate; synchronized scrolling does not establish semantic alignment.

Two small wording corrections were sent to the parent; they do not change the A/B decision:

1. At the checked line 67, “existing Base UI/base-maia reader” can sound like a qualified reader already exists, conflicting with the question's explicit implementation limits. Prefer “Use the established Base UI/base-maia design system for the reader in source context.”
2. At the checked lines 52–53, a blanket prohibition on horizontal page manipulation can be read as excluding needed zoom/pan for fixed-page or wide qualified content. State that the paired layout must not force two cramped panes or horizontal navigation between panes, while preserving usable per-document reading controls and the single-column alternative.

No root question, canonical document, product or provider file was edited by this check. This is document-level review; no browser/AT, intended-user, parser, SQL/RLS or workload qualification is implied.

### Final closure after wording corrections

Re-read the corrected question's mobile/AT and design-system paragraphs. Both findings are resolved: the text now prohibits a forced two-pane horizontal layout while retaining per-document zoom/pan for fixed pages or wide content, and names the established Base UI/base-maia design system without asserting an existing implemented reader. **Final comparative/UX question disposition: Pass.** No further material issue is identified within this review's scope. Q29 remains unselected; this closure does not constitute the post-selection adversarial review or runtime qualification.
