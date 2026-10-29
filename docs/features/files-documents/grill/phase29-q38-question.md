# Phase 29 Q38 — How deeply should staff File Manager search?

**Status:** Historical researched question prepared2026-10-23, Asia/Bangkok.
Conrad selected Q38 A and fully ratified every required amendment on2026-10-23.
The delegated conditional document-text addition remains excluded because its
cost and simplicity conditions were unproved. Q01–Q38 are ratified grooming
intent; all24 glossary definitions are unchanged. Earlier preparation/review
entries below are dated history. No implementation, activation or formal
owner/OpenSpec publication follows.

## Historical question and alternatives

**Should general staff File Manager discovery search approved names, metadata
and source context, or also search inside eligible documents?**

Folders, labels, filters, recent work, saved views and search are already part
of the promised File Manager. This question selects its search depth. It does
not reopen whether those discovery tools should exist, replace an owning
domain's existing search, or create a personal/general drive.

| Option                                                                    | Practical behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Main tradeoff                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Search approved names, metadata and source context (recommended).** | Find files through source-permitted display names, labels, document type, related record, relevant dates and other qualified fields. Keep context, useful filters and recent work readily available. Open a qualified reader and use its existing Find capability where supported. Match only approved metadata/source fields; do not inspect document bodies to select or rank general File Manager results through an index, direct scan or preview-text fallback. | Covers record/context-led retrieval with fewer processing and lifecycle obligations. A phrase that occurs only inside a file will not locate that file; the user may need to narrow candidates and inspect them.                                                                                                             |
| **B — Also search qualified document text.**                              | Add cross-document keyword/phrase retrieval for a declared, useful set of source-approved document uses, formats, versions and text coverage. Preserve all A discovery paths. Explain content matches and actual coverage without claiming every file or every part was searched.                                                                                                                                                                                    | Helps when staff remember wording but not the filename or record. Adds text extraction, restricted-index storage, current authorization, version/withdrawal handling, coverage states and operating responsibility. This is feasible bounded work, not automatically OCR, AI, a new vendor or an enterprise search platform. |

**Recommendation: A for the general File Manager.** This is a scope judgment
for Core, not a claim that modern products avoid document-content search.
Core's required source context, typed metadata, filters and recent work already
provide useful discovery; its files span independently governed financial,
care, Support, Media and other uses. The repository does not yet establish a
general source-qualified body-search capability, and this session has no
observed staff retrieval evidence showing that body-only clues justify adding
that entire lifecycle here. A keeps the committed discovery experience complete
within an honest boundary. B is the stronger choice if finding documents from
remembered internal wording is an important required workflow; it should then
be built and qualified as a real capability, not a disabled placeholder.

A does not remove an existing separately qualified source search, prevent a
later explicit capability decision, or imply that attachment bodies are safe
to search when renamed as metadata. B does not obtain authority from download
permission, preview availability or a tenant administrator's generic toggle.

## Concrete example

Illustrative retrieval task, not evidence of a ministry's actual workflow:

Elena needs a document attached to an Asym record. She remembers the record,
that it was received in September, and its document type, but not its filename.
Both options let her use that permitted context and filters to find it without
renaming or tagging every upload by hand.

If instead she remembers only the words **“annual calibration”** inside a file
named `scan-017.pdf`, A cannot find it from those words alone. She must narrow
the candidate set and inspect a permitted reader. B can find the phrase only
when that exact document use/version and its relevant text are admitted and
successfully covered. An image-only scan, unsupported language, protected file,
not-yet-processed version or omitted content must not be represented as a
negative content match. No OCR or all-format completeness is implied by B.

This example makes A's user cost explicit. Neither option makes search evidence
that a request was satisfied, a receipt accepted or an official version current.

## Current primary research and competing evidence

Research retrieved 2026-10-23. Published documentation establishes product
patterns, not observed Asym usage, measured time savings or production proof.

- [Blackbaud Grantmaking's document guide](https://help.blackbaud.com/docs/0/assets/grantmaking/content/manage-documents.html)
  distinguishes a document record from its file and supports finding Document
  records and navigating related documents, with names, tags and dates attached
  to the record. It does not specify which of those fields its query indexes.
  This is a relevant nonprofit comparison for
  context-led retrieval; the page does not establish that Blackbaud lacks body
  search or that metadata alone meets every nonprofit's needs.
- [Box's search guide](https://support.box.com/hc/en-us/articles/360043696314-Search-for-Files-Folders-and-Content)
  supports content search alongside names and filters, but documents indexed-text,
  version, language and indexing-delay limits. Its ordinary search documentation
  excludes OCR. This supports B's useful capability and the need for honest
  coverage; it does not establish Core formats, limits or access rules.
- [ShareFile search](https://docs.sharefile.com/en-us/sharefile/sharefile-app/sharefile-web/search)
  offers a titles-only filter alongside content search. Its
  [full-text guide](https://docs.sharefile.com/en-us/sharefile/sharefile-app/sharefile-web/full-text-search)
  describes processing delay and size/storage exclusions. These are meaningful
  alternatives, not proof that one mode fits every task; do not import its
  limits or awkward query syntax into Core.
- [SharePoint's search eligibility and permissions guidance](https://learn.microsoft.com/en-us/sharepoint/make-site-content-searchable)
  separates inclusion in the index from the permission to see a result. Its
  [search limits](https://learn.microsoft.com/en-us/sharepoint/search-limits)
  acknowledge partial processing. Core requires its own current source-purpose
  controls, including metadata, counts and snippets; a copied provider ACL or
  delayed cleanup alone is insufficient.
- [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  explains accessible search progress/result announcements without moving focus.
  It supports composed interaction proof; it does not certify an unbuilt UI.

The evidence supports content search as a proven product capability. It does
not make universal content indexing a default requirement or prove A is
universally better. The recommendation weighs Core's admitted purposes and
current scope against a real but unmeasured body-only retrieval need.

## Repository reconciliation and scope boundaries

The [owner research](phase29-q38-owner-research.md) and
[runtime research](phase29-q38-runtime-research.md) retain exact source paths,
applicable full requirements, current implementation evidence and limitations.

1. **Source-owned discovery.** Founder brief §8 requires authorization before
   search, facets, counts, autocomplete, ordering, duplicate warnings, pagination
   and serialization. Q02 retains source-purpose File Manager discovery without
   choosing a general search/OCR/AI service. Phase29 custody is not authority
   over document meaning, currentness or discovery eligibility.
2. **Metadata is protected too.** Use approved display names and source labels;
   original filenames or metadata can be forbidden, sensitive or discarded.
   Preserve P22 original-name rules and P23 Media's neutral metadata boundary.
   Do not expose other linked uses merely because one use is visible. No new
   permissions arise from folder membership, upload ownership or staff rank.
3. **Keep existing source search intact.** Support conversation search,
   separately qualified Staff guide or public-page search retain their exact
   owners and scopes under either option. Support D32's in-rendition Find is
   not a cross-document attachment corpus. P23 Media/public-site search is not
   generic file-content authorization. No consumer phase silently supersedes
   these exclusions.
4. **If B is selected, qualify actual useful coverage.** Source approval for
   extraction/indexing/search and current reader disclosure are separate.
   Bind derived text to the exact source use, immutable version and extraction
   coverage; the index is a replaceable projection, never a business authority.
   Source exclusions remain excluded unless an explicit owner amendment is
   separately adopted. Do not claim success with every useful cohort disabled.
   Limit extraction/parser work, private persistence and retention; no new OCR,
   semantic/AI answers, automatic translation, provider or arbitrary corpus is
   chosen by this question.
5. **Currentness and honest availability.** Source-selected versions, access
   withdrawal, quarantine, deletion/redaction and current restrictions govern
   results and subsequent reads. Delayed projection updates must not authorize
   stale disclosure. Show actual query/coverage failure instead of a successful
   empty result. Do not expose hidden-document counts when explaining coverage.
6. **Keep authority and design proportional.** Reuse existing native API,
   source-purpose, metadata/view and shared UI boundaries where suitable.
   Neither answer mandates a new index vendor, universal permission model,
   query builder, whole Workflow Studio, duplicated Media library or schema
   designer. Neither is qualified by generic search code already existing.

The [Q37 ratified decision](../docs/adr/0037-versioned-ordinary-item-instructions.md)
and its exact glossary addition remain unchanged. Added/revised-work participant
awareness remains an explicitly unresolved communication choice under Q36/Q37;
existing email purposes cannot be relabeled to supply it. Reusable request
structures and particular File Manager organization details are other possible
frontiers. A separate unable-to-provide state must not be invented merely to
duplicate Q30 clarification and Q33 authorized resolution. This question was
chosen because it settles a substantive shared discovery boundary, not because
every request edge case must precede File Manager work.

## User journeys and acceptance direction

These are constraints for either answer and research inputs for its subsequent
adversarial review; Q38 itself remains unselected.

| Journey                                         | Required result                                                                                                                                                                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff knows the related record or request       | Search/filter in that lawful context, preserve the return location and show meaningful permitted source labels. No mandatory tagging exercise for basic retrieval.                                                                             |
| Staff remembers only words inside a document    | A clearly searches names/approved fields and offers useful narrowing. B searches only its actual qualified coverage. Neither claims a body-only phrase was absent from an unsearched file.                                                     |
| Staff has several roles, tenants or linked uses | Each query and serialized result has current permitted context; a late response or cached history from another context cannot appear. A visible use does not reveal the others.                                                                |
| A sensitive or revoked file formerly matched    | No forbidden title, snippet, count, suggestion or existence hint. Opening a formerly visible result rechecks current authority with a safe explanation.                                                                                        |
| Recently received or corrected file             | Valid source metadata remains discoverable under its own authority. Receipt, safety processing, search coverage and acceptance remain separate; B must not attribute old text to the new version.                                              |
| Source metadata is sparse                       | Use existing type/date/context/recent-work affordances. Do not require staff to paste confidential body text into labels or rename original evidence to compensate.                                                                            |
| Empty result, failure or partial coverage       | Distinguish a completed search with no matches in its stated scope from failure/unavailability. State scope in ordinary language, with permitted coverage detail only.                                                                         |
| Mobile, keyboard or assistive technology        | Responsive controls, visible removable filters, sensible focus/return behavior and result-status announcements; no hover/color-only meaning or focus theft. Reuse exact Core base-maia/Base UI patterns.                                       |
| International names, dates or mixed scripts     | Preserve original Unicode names and use source-approved normalization/search behavior; no ASCII/English-only assumption. Localized date filters have explicit time-zone meaning. Exact matching and language support need real fixtures.       |
| Slow network or shared device                   | Keep useful permitted query/filter state for the current session, truthful retry/loading and stale-response fences. No mandatory download of many files, sensitive offline library or raw private-query analytics.                             |
| Donor, missionary or external recipient         | No new global library, search grant, scope expansion or extra upload step follows. Their existing source-specific journeys and finite access remain unchanged.                                                                                 |
| Administrator or operator                       | A keeps the existing source-discovery controls; B additionally needs visible eligible coverage/failure recovery and a way to stop affected indexing/serving without changing document truth. Neither requires manual SQL as ordinary recovery. |

Useful proof is actual staff retrieval with representative authorized records,
ambiguous names and sparse metadata, plus negative tenant/source/field-level
cases, stale/current-version behavior, accessibility and realistic latency.
B additionally needs real extraction/coverage/withdrawal/replay/retention and
parser-boundary proof. Neither needs tests that merely mirror a new table.
No numerical latency, capacity, vendor quota or benefit estimate is invented
here; native design must declare and prove the selected supported workload.

## Current implementation and evidence limits

Local Core HEAD remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; freshly
reviewed live develop is `0026bcbe8b601586c29bba422675ce5889edd7b1`.
Local and live are distinct. The owner/runtime notes document relevant source
inspection; existing navigation, CRM or Support search is not proof of native
File Manager discovery or exact file-text qualification. Prior scoped drift
records are dated evidence, not proof of complete runtime equivalence.

No deployed query, private document, user interview, extraction benchmark,
actual-role SQL/RLS test, provider operation, browser/AT test, runtime change,
pull, commit or publication occurred for this question. Official docs were
read, not vendor accounts exercised. Recommendation confidence is sufficient
to put this scope tradeoff to Conrad; actual task frequency and performance
remain unknown and must not be reported as validated.

## Historical preparation scope and snapshot

Independent full-question checks are closed. Owner, runtime and UX reviewers
read the complete question. The resolved findings distinguish Blackbaud's
documented record metadata from unproved indexed fields and make A's boundary
apply to actual body-based matching/ranking, including direct-scan and preview
fallbacks. Independent Q37 checks confirm the exact decision, all137 table rows
and the prior23 glossary definitions are preserved; the exact24th term is added.
Deterministic recording checks cover research links, file preservation and the
absence of a Q38 decision. These checks establish record integrity, not native
behavior or release qualification.
Conrad chooses A or B; the chosen answer receives its own full adversarial review.
Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.

## Historical founder answer and review — before ratification, 2026-10-23

Conrad selected **A — Search approved names, metadata and source context**,
while delegating the addition of qualified document text only if it is low
complexity and does not increase either provider's bill. The
[full review](phase29-q38-adversarial-review.md) gives **Accept with required
amendments**. The [feature ADR](../docs/adr/0038-purpose-qualified-file-discovery.md)
records the exact corrected decision. C01–C12/P01–P28, all22 categories,
15 lifecycle distinctions,20 journeys,8 measurement rows and7 operating controls
form the complete reviewed package. No new glossary term is proposed; all24
definitions and Q01–Q37 are unchanged.

Final delegated assessment: keep A; do not add general body search. Native
Postgres FTS/GIN needs no separate vendor, but does not supply a qualified
general text producer/currentness/privacy/disposition path or prove no extra
bill. Supabase provisioned compute is not charged per query; disk/egress and
capacity matter. Vercel CPU/memory and actual plan terms matter. Account metadata
confirms Supabase Pro/PG17.6 and Core projects, not workload headroom or invoice
neutrality; the Vercel billing query returned404 Plan not found. No inevitable
B increase, zero-cost A, cross-provider offset or unlimited-future guarantee is
claimed. There is no hidden quota-based B switch, new cost governor or speculative
pipeline. A later expansion is a separate evidence-backed decision, not required
unfinished work for Q38.

A limits information participating in general search, not the metadata-index
technology. Match only exact source-approved names/fields/relationships and
source-selected current or qualified historical references. Preserve authorized
catalog descriptions and separately qualified Support/Staff-guide/public-page
search and reader Find. No body ranking/matching via direct scan, preview text,
client extraction, copied summaries or relabeled instructions/comments. Neither
download nor display permission alone makes a field searchable.

Trusted tenant/actor/source context and current restrictions govern every hit,
rank/count/facet/suggestion/group/page/result contribution before disclosure.
Shared bytes do not union rights or reveal other uses. Metadata discovery and
byte-readiness/action rights remain separate. Search is a derived view, never
source/currentness/acceptance authority. Restrictions fence serving before purge;
late events/replay/restore cannot revive old scope. Source writes survive optional
projection failure with durable qualified recovery.

The UI states names/file-details scope and supports source/type/date/recent work,
visible filters, lawful return state, multilingual names, keyboard/AT/mobile and
low-bandwidth use. Sparse metadata does not force tagging, rename, reupload or
body copying. A body-only clue cannot match here. Definite policy exclusion stays
undisclosed; required authorization/coverage failure is not a complete zero.
Use real current read/serving boundaries and documented pagination consistency,
without a global lock or recall promise for already delivered information.
Protect sensitive queries/views/URLs/logs/caches and all later actions.

Require effective relational/grants/RLS USING/WITH CHECK/all-door proof, bounded
server queries and measured indexes, exact recovery, finite workload/resource
budgets and mixed-version/backfill/restore safety before activation. No whole
Studio, new approval/notification/financial workflow or general search provider
is selected. Current code snippets and public docs do not prove native behavior.

Independent full-report/ADR owner/runtime/UX reviews are closed with proof and
journey crosswalks. Local3d85897/live4e31ff33 remain distinct. Complete5-commit/
6-path live drift from0026 changes CI/docs/tests only; full tree checks preserve
product runtime and governing owner/OpenSpec scopes. No pull, hosted SQL/private
document, paid resource, real message or implementation change occurred. Only
read-only account discovery/billing attempt and document checks were performed;
no native query/RLS/provider/load/race/restore/browser/AT/user test ran.

Q38 A is selected and reviewed and its conditional B assessment is final for
this scope. Full amendment ratification remains separate; Q39 is not asked.
Formal owner/OpenSpec publication `/to-prd` and tickets `/to-issues` remain later
authorized stages.

## Full ratification — 2026-10-23

Conrad explicitly instructed on2026-10-23: “Yes, fully ratify Q38 A with all
required amendments. Record it and move to the next question in this Phase 29
grill-with-docs session, with research, practical options, and your recommendation.”
The exact corrected decision, C01–C12/P01–P28, all22 categories,15 lifecycle
distinctions,20 journeys,8 measurement rows and7 operating controls are adopted
without substantive change. All24 glossary definitions are byte-preserved;
no term is added or refined. Q01–Q38 are fully ratified grooming intent.

Preserve the approved-metadata information boundary, permissible native metadata
indexes, independently qualified source search/Find, current source/field
authorization, honest coverage, private query state, exact source identity and
bounded recovery. The conditional general document-text addition remains
excluded; neither free A nor inevitable B invoice growth is claimed. No hidden
quota-based activation or new cost governor follows. Review source/account
snapshots remain dated evidence; Q39 research records current freshness.
Native qualification and formal owner/OpenSpec publication remain separate.
Q39's answer is not inferred. Publication `/to-prd`; tickets `/to-issues`.
