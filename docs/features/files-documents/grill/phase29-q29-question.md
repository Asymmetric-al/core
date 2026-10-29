# Phase 29 Q29 — Paired version reading or automated text differences

**Status:** Historical researched question prepared 2026-10-22, Asia/Bangkok.
Conrad selected Q29 A and fully ratified every required amendment: paired exact-
version reading without new generic automated differences, under the complete
source, coverage, lifecycle, privacy and usability boundaries. Q01–Q29 are
ratified grooming intent; all twenty-one glossary definitions remain unchanged.
The original question and dated preparation/review entries below are historical.
No implementation or activation follows.

## Historical question and alternatives

**For Phase 29's general staff version-review experience, should Core provide
paired reading of exact versions, or also highlight detected text changes?**

Both choices provide a useful contextual way to inspect two source-related,
independently authorized exact versions using their qualified reading views.
Both preserve already-required source-specific comparisons, including P23
Media's current-versus-candidate comparison. The additional choice is automated
text-difference assistance, not whether version history or comparison should exist.

| Option                                                                             | Practical experience                                                                                                                                                                                                                                            | Benefits                                                                                                                                                              | Costs and boundaries                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A — Provide paired version reading without automated differences (recommended)** | Staff open two permitted exact versions with clear version/status labels, independent reading controls and a preserved return to the source work. Use two panes where space permits and a usable single-column/version-switching presentation on small screens. | A coherent comparison flow built on the already-selected readers, useful for qualified documents and images without pretending a machine has identified every change. | Staff must find changes themselves and can miss a small but important edit, especially in long text. Paired viewing is not proof of complete review or unchanged content.                                                            |
| **B — Also include qualified text-change highlighting**                            | Add detected text additions/deletions and navigation through changes for explicitly qualified text-comparison profiles. The paired views remain available, and the result names its exact inputs and text coverage.                                             | Can direct attention to small wording edits in long text and reduce manual searching; reviewers can inspect the corresponding source content.                         | Requires separately qualified extraction, alignment, rendering, privacy and failure behavior. It does not cover every previewable format or establish that images, formatting, hidden content, formulas or signatures are unchanged. |

**Recommend A for this Phase 29 scope.** The founder has already selected
broader read-only previews with deliberate limits. Paired exact-version reading
can make those views useful together while keeping the source, version and
review target clear. Automated text comparison is a distinct product promise,
not a free consequence of showing two previews or finding a diff dependency.

B is a credible alternative when repeated review of long text is an important
actual workflow. Its benefit is assistance in finding changes, not a guarantee
of complete comparison. No Asym usage study establishes the volume of such
reviews or a measured error/time advantage for either option. A is a bounded
product-scope judgment, not a permanent ban on a later deliberately qualified
comparison capability or permission to remove existing owner requirements.

## Practical example and journeys

Illustrative example, not observed ministry research: Elena is reviewing Nora's
corrected document. The source allows Elena to inspect both the earlier exact
version and the current candidate. The source's current acceptance target is
the candidate, not whichever pane Elena happens to focus.

- With **A**, Elena opens **Compare versions**, sees both exact versions and
  their actual source statuses, and checks the represented content. Page/zoom/
  find controls stay usable without losing the request, notes or reading position.
  No Changed/Unchanged badge is manufactured by the layout.
- With **B**, Elena can additionally navigate detected text changes when that
  exact pair/profile is qualified. If a scanned signature or image changed,
  text-only output cannot certify that it did not. Missing or incomplete
  extraction is **Comparison unavailable/limited**, never **No changes**.
- On mobile or with assistive technology, use clear version labels and a usable
  single-column or version-switching view. Do not force a two-pane horizontal
  layout or color-only meaning; preserve usable per-document zoom/pan for fixed
  pages or wide content. Any synchronized scrolling
  is optional, truthful about alignment and subordinate to usable independent reading.
- If a newer correction arrives, keep the opened pair stable while currently
  permitted and explain that the source review basis changed. Do not silently
  load newer bytes, accept the historical pane or lose the staff member's notes.
  Current source review/correction guards remain authoritative.
- If one version becomes restricted or unavailable, stop its content and any
  derived comparison that depends on it. Keep independently permitted reading
  available where the source allows, with honest failure/next-action information.
  Do not automatically download the original or open a third-party service.
- A participant's history summary or current-file permission does not create a
  right to inspect old contents. This staff comparison feature does not extend
  Q05 participant readback, completed-access scope or another source's history rights.

Use the established Base UI/base-maia design system for the shared qualified
reader in source context. Comparison is optional assistance, never a mandatory compare/scroll/
dwell step before acceptance. Actual accessible document inspection still matters;
accessible pane controls alone cannot qualify inaccessible or omitted content.

## Research and strongest counterevidence

Primary documentation checked on 2026-10-22. These are documented product patterns,
not proof of Core implementation, universal ministry preference or measured benefit.

| Primary source                                                                                                                                                        | What it establishes                                                                                                                                                                                                                     | Application and limit                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Microsoft Word: view documents side by side](https://support.microsoft.com/en-us/word/view-and-compare-documents-side-by-side), current guide                        | Documents a paired reading mode and optional synchronous scrolling separately from its Compare feature.                                                                                                                                 | Paired reading is a legitimate useful interaction in its own right. Core still needs exact source authorization, immutable versions and accessible composition; matching scroll positions do not prove matching content.                         |
| [Microsoft Word: compare document differences](https://support.microsoft.com/en-us/word/compare-document-differences-using-the-legal-blackline-option), current guide | Offers chosen text/format/comment scope and word/character granularity, normally in a separate result. Tracked changes and alternative output destinations have special behavior.                                                       | Strong B precedent for focused change navigation. Do not copy document mutation, accepting tracked changes, merge/edit powers or imply legal meaning for Core's technical comparison.                                                            |
| [Adobe Acrobat: Compare Files](https://helpx.adobe.com/acrobat/using/compare-documents.html), updated February 26, 2026                                               | Distinguishes continuous text, page/slide matching and scanned-pixel comparison; text-only ignores graphics. Results support paired/single views and next/previous change navigation. Some difference categories are hidden by default. | Supports B's utility and the need to name coverage. Core does not select visual/pixel difference, OCR, a legal comparison, all-format fidelity, provider egress or Adobe as a dependency. A quiet text result is not whole-document equivalence. |
| [Box: version history](https://support.box.com/hc/en-us/articles/360043697054-Accessing-Version-History), current undated guide                                       | Prior-version previews aid comparison without downloading; version actions depend on permissions. The guide documents limitations for non-current Excel and watermarked previews.                                                       | Supports contextual exact-version inspection and honest unavailable states. Do not import overwrite-by-filename, Make Current, generic history rights or Box version-retention limits. History does not prove automatic diff support.            |

The strongest case for B is finding a subtle wording change that manual reading
misses. The strongest case for A is predictable inspection across the deliberately
qualified reading scope without adding a false impression of complete difference
detection. Neither choice makes reviewers infallible, proves authenticity or
replaces actual source review. External Word/Acrobat export is not a safe default
fallback for confidential material; qualified download remains its own action.

## Why this remains open and what both choices preserve

The [owner research](phase29-q29-owner-research.md),
[runtime research](phase29-q29-runtime-research.md) and
[comparative research](phase29-q29-comparative-research.md) contain exact anchors.

1. **Explicitly open product scope.** The founder brief's Read-only preview and
   comparison section distinguishes side-by-side, extracted-text difference,
   visual difference and legally meaningful agreement comparison, and requires
   deliberate Phase 29 scope. Q02/Q03/Q21/Q28 preserve exact versions, review
   and qualified inspection; they do not select general automated text diff.
2. **Existing comparison obligations remain.** P23 ADR-0171 already requires
   current-versus-candidate Media comparison. Existing official-document,
   editorial/semantic and specialized owner comparisons retain their own scope.
   Q29 cannot remove those or turn a generic reader into another source writer.
3. **Reuse D32 without expanding its claims.** D32 covers qualified images,
   static PDF, DOCX/PPTX reading renditions, XLSX visible saved values and literal
   TXT/CSV. Its DOCX revision/comment, PPTX hidden/media/notes, image animation and
   spreadsheet saved-value limits remain. Preview qualification is not text-diff
   qualification. A pair's omitted content cannot be declared absent or unchanged.
4. **Both inputs need independent authority.** Current source permission applies
   to exact versions, source context and required processing/output. The result
   must not expose a denied predecessor through changed text, thumbnails, counts,
   search, cached results or metadata. Q05 current-only participant content and
   P18 canonical-artifact serving are not silently widened by staff comparison.
5. **Keep exact source work separate.** Viewing, comparing or seeing a difference
   is not acceptance, adoption, correction, publication, fulfillment or new
   evidence. Selected inputs stay exact; later source changes preserve Q03/Q21
   guards and Q28 provenance. No generic Make Current, accept-changes, merge or
   edit command is introduced. Source relationship/status labels stay truthful.
6. **Resource and coverage limits still apply.** Carry existing D32 input/profile/
   retention/current-access rules. Two readers do not automatically qualify
   doubled memory/concurrency or a new latency promise. The composed pair needs
   bounded measured qualification. B additionally requires a named finite text
   comparison profile with exact inputs, extraction/alignment coverage and
   honest incomplete/error handling; no copied per-file budget proves that work.
7. **Keep this choice narrow.** Neither option selects OCR, AI summaries, visual
   pixel difference, legal agreement analysis, editor/merge, comparison export,
   a new provider, generic cross-source file pairing or expanded historical access.
   No mandatory review ceremony, new notification or whole future Studio dependency.

## Current implementation and proof limits

Bounded source inspection found adjacent rich-text, Support metadata, CMS version
diff and generated-document preview/qualification paths. Those do not establish
a native generic private-file version reader or comparison service. A transitive
diff library, CMS field-diff component or P18 visual-raster qualification protocol
does not qualify uploaded private evidence comparison. Existing required readers
also still need their real implementation/qualification; A is not already shipped.

Local HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; fresh live develop
remains `7df55820eee8a1e0076dea489f3836e8d15d7c69`, with no new drift or pull.
This is researched planning evidence and independent question review. No native
converter/diff, provider, SQL/RLS, browser/AT or intended-user test was performed.
No files were sent to an external comparator and no package/provider was changed.

## Historical preparation scope and snapshot

Q01–Q28 and all twenty-one definitions are fully ratified. Q29 is a researched
A/B question, recommends A and has no selected answer. No feature ADR-0029 or
new glossary term is created. The selected answer receives the full adversarial
review before amendment ratification. Wider File Manager, resources, custody,
disposition and other unresolved Phase 29 scope are not declared complete.

Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.
This question changes no implementation, schema, permissions or provider state.

## Historical founder answer and review — before ratification, 2026-10-22

Conrad selected **A — Paired version reading without automated differences**,
requesting deep research, every adversarial category, excellent UX/UI, flexibility
and no overengineering. The [complete review](phase29-q29-adversarial-review.md)
recommends **Accept with required amendments**. The
[feature ADR](../docs/adr/0029-paired-exact-version-reading.md) records its exact
corrected decision. Q29-C01–C12, Q29-P01–P24, sixteen journeys, fourteen lifecycle
distinctions, fourteen inherited-limit rows and six controls form the package.

Keep the normal flow contextual: open the lawful source-defined pair, read with
independent controls, then return to the same task. Preserve readable adjacent
views and an equally usable narrow-screen/accessible alternative. Each exact
input and their joint purpose need current authority under one validated context;
no role/assignment union, historical permission inference or new Compare engine.
Stable displayed inputs remain separate from the source's current evidence-set
and acceptance target. No compare/dwell ceremony or Changed/Unchanged claim.

Full D32 representation, coverage, processing, custody and numeric obligations
remain, as do P18 canonical artifacts and P22/P23 specialist comparisons. Current
input failure, unresolved required authority and loss of joint purpose have
distinct outcomes; standalone inspection requires its own valid source scope.
Closing a view cannot cancel/delete or renew a shared generation. The pair uses
transient references, not a stored Pair entity or combined derivative. Qualify
aggregate scheduling/device/network load without guessing doubled capacity or
halving valid input limits. No new domain term is needed.

The [owner](phase29-q29-owner-adversarial.md),
[runtime](phase29-q29-runtime-adversarial.md) and
[UX](phase29-q29-ux-adversarial.md) reviews independently checked the full draft;
all material findings and the bounded-loading wording refinement are resolved.
Current primary research supports paired reading and candidly preserves B's
useful text-change navigation. No Asym timing/error-rate/user study is invented.
Local3d85897/live7df55820 remain distinct; full relevant live incorporated owner
clauses were read. No native/runtime/provider/browser/AT/user qualification,
implementation or formal publication is implied. The complete amendments await
ratification. Q30 is not asked or selected.

## Full ratification — 2026-10-22

Conrad fully ratified Q29 A and all required amendments: the corrected decision,
Q29-C01–C12, Q29-P01–P24, sixteen journeys, fourteen lifecycle distinctions,
fourteen inherited-limit rows and six controls. Earlier pending question/review
wording is dated provenance; ADR-0029 and the full review record current adoption.
Q01–Q29 are ratified and all twenty-one definitions remain unchanged. Q30's
answer, native qualification, implementation and publication are not inferred.
