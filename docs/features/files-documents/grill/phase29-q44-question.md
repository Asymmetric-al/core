# Phase 29 Q44 — How should selected files download?

**Status:** Conrad fully ratified Q44 A and all required amendments on 2026-10-25, Asia/Bangkok. The [complete review](phase29-q44-adversarial-review.md) and [ADR-0044](../docs/adr/0044-bounded-private-zip-downloads-for-ordinary-request-files.md) record the adopted package. Q01–Q44 are ratified; all26 glossary definitions remain unchanged. Earlier preparation and selected-answer review sections below are dated history. No implementation, activation or formal owner/OpenSpec publication is claimed.

## Historical question preparation — 2026-10-25

**Status:** Researched question prepared 2026-10-25, Asia/Bangkok. Conrad fully ratified Q43 A and all required amendments. Q01–Q43 and all26 glossary definitions remain governing. Q44 is unselected; no Q44 ADR or new glossary term follows. This is grooming research, not implementation, activation, formal owner/OpenSpec publication or provider qualification.

## One decision

**When authorized staff download several selected ordinary request files, should Core prepare one ZIP containing the eligible exact files, or provide a prepared list of individual downloads?**

A ZIP is one downloadable container that a person opens to extract the files. A manifest is its contents/outcome list: which permitted exact files were included and which intended work remains incomplete. The founder already requires finite authorized bulk download, exact versions, integrity evidence, a manifest, private temporary staging and truthful partial results. We are choosing the delivery experience, not whether bulk download or those protections exist.

| Option                                                         | What staff experience                                                                                                                                                                                                                   | Main tradeoff                                                                                                                                                                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — One ZIP for the selected eligible files (recommended).** | Select a finite set, review its permitted scope, prepare the collection, then deliberately download one ZIP with the manifest and exact admitted originals. Normal single-file Download remains available.                              | Keeps a collection together and avoids assembling many separate downloads. Adds archive preparation and extraction; large/slow transfers, staging cost and current authorization still need qualification.              |
| **B — A prepared list of individual downloads.**               | Select the same finite set and obtain the same manifest/outcome record, then deliberately download each eligible exact original from the prepared list. No archive is generated and the browser is not forced to launch every download. | Avoids ZIP preparation/extraction and lets staff retrieve or retry one file at a time. More clicks and manual collection management; manifest, current permission, finite scope and recovery still need implementation. |

**Recommend A.** A selected collection is easier to keep together when it arrives as one clearly identified download. That is a practical product judgment supported by comparable document/submission products, not measured Asym staff research. Keep ordinary individual Download and deliberate smaller selections available; do not add automatic multipart splitting, a sync client, new connector or archive-format menu to this question. B is strongest when users mostly need a few files independently or frequently work with large files, constrained device storage or weak connections.

A is not a zero-cost claim. It requires archive construction and short-lived private handling, and can increase compute/storage/egress. Actual limits and resource impact must be measured on Core's existing qualified infrastructure. Choosing a provider, queue technology, compression library or numeric file limit is engineering qualification, not the founder question.

## Concrete example and scope

Illustrative situation, not an asserted ministry workflow: Elena has six permitted ordinary request-evidence files selected in Mission Control and needs local copies. With A, she receives one ZIP plus its contents list. With B, she sees the six exact download entries and retrieves them individually, keeping the same contents/outcome record. She can still choose one file through normal Download under either option.

If one selected file becomes unavailable or loses download authorization while preparation is underway, neither option can present an apparently complete collection or use an earlier permission check to disclose it. Core must expose the current safe outcome and a supported recovery route. An available archive is not itself proof that every requested file is present, and starting a browser download does not prove it was saved successfully or transferred into verified external custody.

Preparation and delivery are distinct facts, not necessarily separate clicks or a required second confirmation. A qualified simple ZIP case may honor one deliberate Download action for the same reviewed set under current authority; slow or returning cases expose Ready and Download. A changed selection or permission outcome still requires truthful recovery, not treating the original intent as approval of different contents. B remains deliberate individual retrieval, not automatic launching of the whole list.

The proposed first cohort is a finite explicit selection of ordinary request-source evidence contributions/uses with exact source-approved original versions and current staff download/export authority. Q28-supplied evidence remains subject to its originating source's restrictions. A file appearing in a shared view, a home folder or search does not qualify it for download. A later correction does not silently substitute newer bytes into the selected collection. This is not all matches in a live view, every object in a folder, automatic recursive export, a cross-domain file dump or a new public/external share.

This question does not redefine Phase21's already-ratified Records Export Package, Phase18 official artifacts, donor receipt retrieval, Q04 participant access or Q41 verified external sharing. It chooses an ordinary staff browser-delivery shape. Staff can use it only when the relevant source authorizes the exact files and purpose.

## Current primary research and strongest counterevidence

Sources were read on 2026-10-25. Product documentation demonstrates behavior and limitations, not actual Asym usability, licensing, runtime, performance or billing proof.

| Primary evidence                                                                                                                                                                      | Demonstrated behavior                                                                                                                                                                                          | Lesson and limit for Core                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Microsoft: Download files and folders](https://support.microsoft.com/en-gb/onedrive/download-files-and-folders-from-onedrive-or-sharepoint)                                          | Multiple selected files/folders download as ZIP in OneDrive, SharePoint in Microsoft365 and Subscription Edition. The page distinguishes older Server2019 and documents file-type/security-related exclusions. | A is a familiar collection-delivery pattern. Do not copy implicit whole-folder download, enormous vendor limits, silent omissions or all-edition parity claims.                                                                        |
| [Submittable July2026 release](https://submittable.help/en/articles/16192739-release-notes-july-31-2026)                                                                              | The release adds an individual submission PDF plus its associated files in a ZIP.                                                                                                                              | A relevant submission-collection precedent. Core's proposed ordinary bundle preserves exact eligible originals; it does not generate submission PDFs, turn evidence into official documents or copy Submittable's authorization model. |
| [Box downloading limitations](https://support.box.com/hc/en-us/articles/360044196153-Common-Issues-with-Downloading-Files)                                                            | Folder download uses ZIP; Box explicitly notes that zipping can be slower than downloading individual files and requires extraction.                                                                           | Strong counterevidence to claims that A is always faster or simpler for every device. B's direct per-file retrieval is credible. Vendor quotas and troubleshooting suggestions are not Core requirements.                              |
| [Box ZIP status](https://developer.box.com/reference/get-zip-downloads-id-status) and [creation](https://developer.box.com/reference/post-zip-downloads)                              | Status distinguishes skipped files; its example can say succeeded while reporting skips. Creation exposes filename conflicts separately.                                                                       | Preparation, transfer and intended-set completeness are different facts. Current rights, name handling and truthful manifest/outcomes matter under either option. Box URLs/timeouts are not Core's private access contract.            |
| [Dropbox downloads](https://help.dropbox.com/sync/download-entire-folders)                                                                                                            | Documents separate downloaded local copies, folder ZIPs and browser/network difficulties with large collections; smaller selections are a documented recovery strategy.                                        | Keep finite qualified work and practical smaller/single-file routes. No sync client, offline replica, inherited size limit or download-as-custody assertion follows.                                                                   |
| [Apple ZIP support](https://support.apple.com/en-hk/102532)                                                                                                                           | Current iPhone/iPad Files guidance supports opening ZIPs and extracting their contents.                                                                                                                        | Do not claim mobile cannot use A. Extraction still adds device work/storage and must be tested with representative mobile users.                                                                                                       |
| [W3C Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) | Progress/outcomes need programmatically available status; drag actions need non-drag pointer alternatives.                                                                                                     | Use persistent progress, readable partial/unknown state, keyboard and pointer selection and predictable focus. No noisy announcement of every byte or fake completed status.                                                           |

Comparable systems support both the convenience of A and the situations favoring B. There is no verified Asym workload or user-study result proving the frequency of bulk retrieval, common collection sizes, ZIP familiarity or faster completion. Those are release-research obligations, not invented nonprofit facts. No connector account or private customer file was exercised.

## Governing boundaries and why this is open

The [owner research](phase29-q44-owner-research.md), [runtime research](phase29-q44-runtime-research.md) and [comparative research](phase29-q44-comparative-research.md) contain the complete source/evidence trace and limits.

| Governing source                                                            | What is already settled                                                                                                                                                                                                                   | What Q44 may choose                                                                                                                                                               |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Founder §§8,11,15–16                                                        | Finite selected scope, per-item current permission/version, source custody, manifest, integrity, safe private staging, truthful partial outcomes, accessible recovery and complete native browser workflows.                              | One archive download versus a prepared individual-file list. Bulk existence, integrity and permissions are not optional.                                                          |
| P12/P3 and platform boundaries                                              | Current trusted tenant/assignment/source/field/purpose and governed egress determine actual download/export, step-up, metering and disclosure. View/read rights alone cannot widen these.                                                 | Neither option creates a new access grant or bypasses existing approval/currentness. Exact technical adoption is later source qualification.                                      |
| Q38/Q42/Q43                                                                 | Discovery is approved metadata, views are live definitions, home placement is organization and shared-view access does not grant file/export rights.                                                                                      | A frozen finite selected set for this command; no dynamic view membership or creator-rights execution. Q42's all-or-none Move does not dictate remote-download outcome semantics. |
| Q04 and Q28                                                                 | Q04's participant retrieval scope explicitly excludes staff/other-person files and bulk export. Q28 preserves the origin's authority when evidence is reused.                                                                             | Reuse compatible mechanics only. Ordinary staff bulk authority must be independently qualified; it cannot be inferred from participant access or a reused evidence link.          |
| Phase21 D26, ADR-0115 and full incorporated contract `77cd5cfeb49f60f5f709` | Purpose-owned, per-Legal-Entity, source-watermarked complete Records Export Packages with canonical formats, omissions, parts, retrieval and custody semantics already have an owner. Phase29 supplies physical private custody/delivery. | No change to that package product or its required formats. Ordinary request-file collection delivery is a separate scope, not a competing records exporter.                       |
| Phase18 official-document contracts and Q41 external shares                 | Exact generated artifact/currentness/access and exact external-recipient terms remain source-owned.                                                                                                                                       | No receipt regeneration, blanket history, new external audience, official report, retention restart, source disposal or proof of verified transfer.                               |

Required staff exact-version comments remain in the coverage map. Their page/location interaction is a separate genuine future decision, already distinguished from Q30 participant item questions. Q44 does not remove or settle it. Rename identity requirements are also already present; neither becomes a precondition for this delivery-shape question.

## Journeys and acceptance direction

These are common consequences/qualification directions, not a prematurely ratified Q44 specification. The selected answer will receive its full adversarial review and exact amendments.

| Journey                                                           | Required safe and usable behavior under either option                                                                                                                                         |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff selects several visible entries                             | Show explicit finite selection and actual eligible scope; no all-matching or recursive-folder expansion.                                                                                      |
| Staff only needs one original                                     | Normal currently authorized individual Download stays available.                                                                                                                              |
| Selection crosses source restrictions                             | Qualify each exact use/version/action; an ordinary evidence link does not launder origin rights.                                                                                              |
| A filename repeats or has long/international characters           | Safe unique delivery names and permitted provenance mapping preserve distinct files; no overwrite, path traversal or unsafe member path.                                                      |
| A newer version appears after selection                           | Preserve the exact selected basis and current source rules; no silent latest-version substitution.                                                                                            |
| A selected item becomes denied/unavailable                        | Prevent its disclosure, protect restricted details and show truthful permitted incompleteness/recovery. No false complete or empty claim.                                                     |
| ZIP already prepared when rights change                           | Preparation is not a continuing grant; current included bytes/metadata must remain authorized at delivery and subsequent applicable reads.                                                    |
| Network response is lost or staff double-clicks                   | Reconcile the same preparation/outcome; no duplicated work or unexplained new selection. A user retry is not proof the previous transfer failed.                                              |
| Transfer starts then fails                                        | Keep preparation, transfer and actual completeness distinct; provide supported retry for the same exact intended work/current rights. No claim of saved or read based only on response start. |
| Prepared result expires or is canceled                            | End affected private delivery/temporary work safely; preserve required restricted outcome and source evidence. No source deletion or automatic access extension.                              |
| User has a slow connection or limited device storage              | Show permitted count/size and progress, allow deliberate smaller selections/individual retrieval; no unsupported resume or cost guarantee.                                                    |
| Keyboard/AT/touch/mobile user                                     | Complete non-drag selection, consequence review, preparation status, download and recovery without clipped controls or lost focus.                                                            |
| Tenant/assignment changes or cached response arrives late         | Fence old context, manifests, controls and protected results. A cached ZIP URL cannot stand in for current source authority.                                                                  |
| System approaches resource limits                                 | Bound bytes/count/preparation/concurrency/retention/egress; reject or explain oversized work before uncontrolled processing. No invented vendor-sized launch promise.                         |
| Staff sees a partial result                                       | Describe only permitted actual included/blocked/failed/not-started outcomes; neither HTTP success nor valid ZIP proves the intended set is complete.                                          |
| Donor, applicant or external Q41 recipient uses an old/staff link | Their own source-qualified flows remain; no staff browser export or audience expansion.                                                                                                       |
| Operator handles staging/cleanup failure                          | Supported current-authorized recovery; source records and admitted copies remain governed. No routine SQL/provider-console repair.                                                            |
| An external handoff is desired                                    | This question adds no email/cloud destination; future qualified destination delivery stays with Phase31 and the relevant owner.                                                               |

For A, engineering must qualify bounded ZIP construction, safe member paths/names, exact bytes and integrity, private staging/current delivery, incompatible/partial outcomes and cleanup without turning the browser into a whole-library ZIP processor. For B, engineering must qualify the same finite manifest/outcome and current per-file commands without an automatic browser-download storm or a status that implies files were saved when they were merely offered. Both use the source-aware server boundary and Core's shared UI.

No source-byte conversion, PDF merge, office execution, recursive ZIP extraction, archive browsing product, password-distribution workflow, cloud connector or new public link is selected. The particular preparation/streaming mechanism and finite numeric budgets follow qualification of current native infrastructure; this question does not require another provider or promise unchanged billing.

## Current implementation and freshness

Initial research independently confirmed live **6ac594d96a061924df4bda98adcd9fff04595c04**. Final readback found develop advanced to **e483673725cbdc26a49eacb71f7bc22d0e41008e** through PR2319. The complete compare contains23 commits ahead,0 behind and8 changed paths with every patch present: donation REST/GraphQL reads and replay/error handling, one API export-map addition and their tests. Owner/runtime reviewers classified this delta; no governing document, ordinary-file source, inspected download/staging route, dependency version or package-building capability changed. The API package now has blob `4fdc6f523f93d0c96e3aa532f9fe8b17178aed14`; its sole change is the donation-select export. The researched A/B question and source boundaries remain unchanged. Local HEAD remains **3d85897ebf1515008ef5c676b1c58a15422fb9ab**. No pull, product-file overwrite or native test occurred.

Inspected adjacent mechanisms include CRM generated CSV/report export, a client table-CSV Blob helper, a single-PDF receipt snapshot response and owner-scoped temporary artifact staging/signed retrieval. They provide useful mechanics, not an ordinary source-qualified exact-original ZIP/list product. A visible Export button, signed URL, typed capability registry or SQL-text/stub test is not activation evidence. Neither an archive dependency nor its absence alone settles the product choice.

Vercel's documented buffered response limit must not be misreported as the limit for qualified streaming responses; streaming still has duration/resource/access constraints. A short Supabase signed URL is not proof of immediate source revocation. These current technical distinctions inform later qualification, not a founder-selected file-size cap, provider or safety shortcut. Exact official references and code evidence are retained in the runtime note.

## Q43 ratification and question preparation

Q43 A and every required amendment are fully ratified. Its fourteen-paragraph product decision,36 proof groups and179 substantive review-table rows are preserved; only its closing stage sentence now states ratification. All26 glossary definitions are byte-preserved, and382 other-file hashes passed ratification checks. Q43 remains planning intent, not native release proof.

**Independent whole-question reviews are closed** for owner/contracts, runtime/data/authorization and comparative UX. Each reviewer read the entire question, both practical options, the scope/evidence limits and all18 journeys. The final one-intent ZIP wording was reread: separate preparation/delivery facts do not impose a routine second click, while changed contents/current authority still require truthful recovery. No unresolved material finding remains in the question package.

Their reviewed pre-closure question SHA256 is `c4efd85e75af994556235a552d61affa84eb9946643d7cae47d62ede46583a50`; detailed current-source and journey/boundary crosswalks are retained in the research notes. Closure insertion and Markdown formatting change the whole-file hash without changing the researched question. Deterministic preservation, option/journey, relative-link and formatting checks cover the final record. The final repository-drift addendum was independently classified and recorded without changing the options or source boundaries. This establishes question readiness only; the selected-answer adversarial review remains to follow Conrad's answer.

No Q44 answer, ADR, new glossary term, formal owner/OpenSpec publication, implementation ticket, code/schema/provider mutation, private upload or actual message is inferred. Formal publication remains `/to-prd`; tickets remain `/to-issues`. Conrad chooses A or B before the full selected-answer adversarial review.

## Historical selected answer and review — before ratification, 2026-10-25

Conrad selected **A — One ZIP for the selected eligible files** and requested
deep research and the complete adversarial review. Disposition: **Accept with
required amendments**. The [complete review](phase29-q44-adversarial-review.md)
and [ADR-0044](../docs/adr/0044-bounded-private-zip-downloads-for-ordinary-request-files.md)
record the exact16paragraph decision, Q44-C01–C16/P01–P44, all22 categories,
24lifecycle distinctions,44journeys,eight finite qualification budgets and eight
operating controls. The full package awaits ratification. Q01–Q43 and all26
glossary definitions remain unchanged; no new term is required.

One private bounded ZIP serves a finite explicit selection of ordinary
request-source exact original evidence uses/versions. Actual staff source/P12
download/export authority is independent of Read, preview, acceptance, review,
folder/view membership, Q04 participant rights and Q41 external shares. Q28
origin restrictions survive. No universal unfinished/accepted/preview-ready
predicate or fresh scan is invented. P18/P21 official artifacts and D26 Records
Export Packages remain separate; no acceptance, fulfillment, custody transfer,
source deletion, email or recipient grant follows.

The original intended set, evaluated outcomes, admitted members, one immutable
sealed result and transfer attempts are distinct. Exact duplicates normalize;
equal-byte distinct uses do not merge. Whole-command or restricted-segment
denial/unknown blocks instead of silently shrinking scope. With independently
proved partial authority, unavailable/failed/denied/unknown members can remain
not included. Complete means all intended bindings, not all source records.
Partial requires a nonempty set, a privacy-safe intelligible account and
deliberate Download available files. Zero included originals gives no success
ZIP. Every intended binding has one outcome; every included binding one member.

Prepare privately and verify exact source bytes/digests, actual member mapping,
contents manifest and complete archive before Ready. One readable UTF-8 text
manifest accompanies unchanged originals with safe flat Unicode-aware names,
deterministic collision handling and protected provenance/outcomes. No nested
unpacking, generated report, password archive, multipart platform or extra
format menu is selected. Whole-ZIP integrity belongs in the external protected
result record, avoiding an embedded self-hash.

Prepared results are bound to the initiating staff principal/exact assignment.
Every applicable disclosure/transfer rechecks current scope; all included bytes
and embedded manifest facts must remain permitted before any archive headers
or bytes. No raw bearer URL/public fallback. A newly forbidden fact blocks the
old whole ZIP; changed contents require a new deliberate preparation. Temporary
unavailability can recover an unchanged still-valid result within its original
end, but cancellation/expiry/actual terminal source withdrawal cannot revive.
Every distinct egress/range attempt has actual current budget/audit admission.

Semantic retries reconcile original outcomes before new work. Private candidate
publication, source-copy/read protection, cancel/expiry/cleanup/hold fences and
mixed-snapshot restore prevent duplicate effects or late resurrection. End
equality uses current trusted admission time; credential validity is separate
from material availability. Actual held/candidate/orphan/failed-cleanup bytes
remain capacity-accounted. Retention does not extend access, and a source hold
does not automatically retain every optional archive. Unknown cleanup authority
requires scoped repair, not destructive guessing.

One deliberate Download may prepare/deliver the same complete reviewed set.
Slow/returning users get persistent Ready and deliberate Download; partials
require the reduced-set choice. Existing individual Download remains useful
without implementing B's full batch product. Core Base UI/base-maia, all44
keyboard/AT/mobile/international/low-bandwidth/operator journeys, truthful
transfer observations and safe diagnostics are required. No archive center,
new provider, general export engine or invented cost-neutral promise follows.

Independent owner/runtime/UX full-report/ADR reviews are closed. Current primary
Microsoft/Submittable/Box/Dropbox/Apple/HTTP/ZIP/Postgres/Supabase/Vercel/W3C
research supports this bounded path and identifies contrary vendor shortcuts.
A single in-memory Python3.12.3 probe, largest fixture369bytes, showed CRC can
pass despite missing/duplicate/unsafe member names. It is not native feature,
provider, workload, browser/AT, real-role RLS, user-feedback or billing proof.
Fresh live remains e483673; local3d85897 remains distinct. Current CSV/PDF/Eve
paths are adjacent mechanisms, not a qualified ordinary ZIP product.

Exact decision/report parity, category/proof coverage, links, formatting and
prior decision/glossary/unrelated-file preservation are verified separately.
Formal canonical-owner/OpenSpec publication remains /to-prd; tickets remain
/to-issues. Native activation requires the incorporated evidence and finite
profiles. Q45 is not asked or inferred.

## Full ratification — 2026-10-25

Conrad explicitly instructed on 2026-10-25: “Yes, fully ratify Q44 A with all required amendments. Record it and move to the next question in this Phase 29 grill-with-docs session, with research, practical options, and your recommendation.”

The complete sixteen-paragraph product decision, Q44-C01–C16/P01–P44, all22 category outcomes,24 lifecycle distinctions,44 user journeys,eight qualification budgets and eight operating controls are adopted. All substantive decision language and review tables are preserved. Only the decision's stage sentence changes from selected/pending to fully ratified. Q01–Q44 are ratified grooming intent; all26 glossary definitions remain byte-preserved and no new term is needed.

One bounded private ZIP contains exact eligible ordinary request-evidence originals and one readable contents manifest. The intended set, actual included/not-included outcomes, one verified immutable result and individual transfer attempts stay distinct. Exact duplicate selections normalize; independent equal-byte uses do not merge. Whole-command/source/P12 denial or uncertainty cannot be evaded through filtering. Partial output requires independently established authority, a nonempty set, intelligible permitted incompleteness and a deliberate Download available files choice; no empty-success ZIP.

Exact source-original identity/integrity, safe collision-resistant member names, complete container/manifest verification and coherent private sealing precede Ready. Current authority covers every included original and embedded manifest fact before all applicable artifact headers/bytes/range/conditional recovery. No raw bearer URL/public fallback, in-place redaction/resealing, latest-version substitution or new shared audience follows. Every distinct transfer has its actual audit/egress admission.

Replay reconciles the durable original intent/result before treating a request as new. Package cancellation/expiry and terminal source withdrawal cannot revive; temporary source/credential blocks may recover only an unchanged still-valid result under actual rules. Current trusted admission time and exact deadline equality apply. Source-copy/read/build/cleanup/hold fences protect real copies without extending source rights; retained candidate/orphan/held/failed-cleanup bytes remain capacity-accounted. Source evidence, actual hold scope and required history remain independent of download or staging expiry.

One deliberate action may prepare/deliver the unchanged complete set. Slow/returning users get persistent status and deliberate Download; partials require the reduced-set choice. Existing individual Download remains, with no full second batch interface, archive center, multipart/password platform, new provider, email or general export engine. All44 accessible/mobile/international/low-bandwidth/operator journeys and the finite workload/cost gates are adopted. Q04 participant rights, Q28 origin restrictions, Q41 external shares, P18 official artifacts and P21 Records Export Packages remain separate.

Independent owner/runtime/UX whole-package reviews are closed, including the exact P12-reference and no-macro-execution corrections. The isolated Python ZIP probe is limited format evidence; native source/database-role/provider/race/restore/workload/device/AT/user/billing qualification remains required before activation. Ratification does not claim implementation or deployment. Formal canonical-owner/OpenSpec publication remains /to-prd; tickets remain /to-issues. Q45 research and one next question are authorized; no answer is inferred.
