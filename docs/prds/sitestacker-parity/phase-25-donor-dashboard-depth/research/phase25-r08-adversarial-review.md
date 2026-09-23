> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 08 — Receipts & statements: dedicated entry, dependable retrieval

> **Explicitly founder-ratified, 7 September 2026.** Conrad accepted Question08's corrected execution, including the calm overview and C01–C22. Historical proposal/ratification wording below is answered; do not re-ask it. Implementation and release proof remain separate.

**Phase 25 grooming review · 7 September 2026 · Disposition: Accept with required amendments.**

Conrad selected **A — Dedicated Receipts & statements entry**. Keep that decision. The corrected execution requirements below are recommended for explicit ratification; they are not silently treated as accepted because A was selected. Questions 01–07 remain ratified. This remains Question 08 until its review is resolved.

This is a research and decision record, not a PRD, formal specification, ticket set, implementation or release certification. No repository implementation, GitHub state, hosted database or live provider was changed. The existing five-file setup change was preserved. New experiments used actual source with synthetic dependencies and a fresh, network-isolated PostgreSQL container, subsequently removed.

## The corrected decision to record

> Give the Donor Portal a clearly named **Receipts & statements** destination in its ordinary desktop and mobile navigation. Preserve receipt links from individual gifts and exact permitted document links through authentication. All entrances resolve the same source-owned logical documents and protected access services.
>
> On neutral entry, present a calm overview with **Annual statements**, followed by **Individual receipts**. Show bounded recent document groups/entries and an obvious path to older documents, without forcing a first year/type choice or applying a global current-year filter. Preserve deliberate document/year links and safe return context. This overview/default is a proposed execution refinement, not something inherited merely from choosing A.
>
> Annual statements retain Phase 19's yearly organization: official documents first, and an optional qualified **Support overview — Not a tax document** second. Individual receipts retain their actual source-defined purpose and coverage; a gift does not automatically imply a receipt, and a year does not imply exactly one official statement. Keep legitimate separate documents distinct without listing every artifact, retry or delivery as another document.
>
> Donors can recognize, view, download and locally print currently authorized, source-qualified documents without asking staff, triggering generation or sending another copy. Show concise, truthful availability and correction context, with safe help when needed. A failed request is not an empty account, and an absent document is not zero giving.
>
> Use exact Maia/Base UI/shared design tokens and accessible, readable mobile controls. Keep current document authority, recipient rights, immutable bytes, issuer/period/currency facts and records rules with Phases 7/18/19 and their existing identity, projection, authorization and communication owners. The portal adds no competing archive, issuer, renderer, financial total, consent rule, public file link, household grant or staff repair console.

The new overview/default and C01–C22 below are the concrete amendments offered for ratification. The navigation choice itself needs no change to ADR-0001 or the accepted source-of-truth boundaries. Exact pixels, URL spelling and batch size remain engineering/design choices within these outcomes; unsupported exports, new delivery policies and new legal or guest-assurance rules are not added.

## Adversarial check

### What could go wrong with this answer?

A convincing document page could expose another person's records, invent a statement from empty gifts, download mutable historical text or hide old documents when new issuance is paused. The current code and isolated schema observations demonstrate why the new entry must use the full owner path rather than merely reuse existing download URLs.

### What hidden assumptions are we making?

Not every gift has an individual receipt; not every year has an annual statement; an annual summary in another vendor may mean something different. Legal donor, signed-in person and delivery recipient are different roles. Generation readiness, retained existence, current validity, access and delivery are separate facts. Public documentation supports the recommended pattern, but no comparative Asym donor study proves it is universally best.

### How does this affect the whole product?

Asym Postgres remains CRM truth under ADR-0001. Mission Control owns authorized staff operations; the Donor Portal retrieves permitted documents; missionary/public surfaces gain no document access. Phase 7 owns receipt facts, Phase 18 documents/bytes/access, Phase 19 statements, and Phases 17/6 outbound messages. Phase 24 supplies qualified portal host/brand context without rewriting issuer history.

### How does this affect the end-user experience?

The donor sees the named task, recognizes the document and uses an ordinary action. They need not remember transaction dates to find a statement, understand PDF generation, request an email to get a download, or decipher a staff error. Clear local failures preserve usable results and give a relevant retry/help path.

### Does this follow modern best practices?

Yes, as a reasoned direction. Current donor products provide direct document navigation and gift-level access. Native browser viewing, meaningful labels, bounded lists and accessible status feedback are durable patterns. We reject vendor-specific generation, identity, ZIP/export and automatic-reissue behavior where it conflicts with Core. No retention or conversion statistic is asserted.

### Does this fit Asym’s existing repo and product direction?

Yes, with owner completion. Existing document-purpose code is useful but does not implement the target document inventory or serving path. Some current text routes, schema comments and older tickets conflict with accepted contracts. Source evidence must be preserved; conflicting shortcuts must not become the permanent donor experience.

### Should we adjust the recommendation?

Keep A and adopt the corrected execution requirements. Make the overview/default explicit for ratification. Do not add another domain, renderer, file manager, generic support system or notification workflow. Activation requires the existing owners' real authorization, integrity and accessible journey proof.

## Evidence and its limits

**Repository facts:** current develop/worktree `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; root and scoped instructions, ADR-0001, ownership matrix, CONTEXT, platform/OpenSpec intent, relevant Phase 7/18/19 contracts and current routes/migrations/components were inspected. Phase 24 PR #1558 remains active at `ab1a1703a725be454376990a7fe68aef2e048026`; its accepted D57 is active specification, not merged/runtime proof. PR #872 is merged; its implementation children remain open.

**New executed source observations:** 13 passed. Actual current TypeScript ran under Node 24.15.0 with synthetic auth/database/Next dependencies in a networkless VM. Five observations establish empty/future-year text output, mutable same-URL content, current Range behavior and absent explicit cache headers. Eight positively check generation-purpose qualification gates and metadata-only admission. These are not Next/browser/provider/artifact integration tests.

**New executed database observations:** the repository's native verifier applied all 76 forward migrations to a new PostgreSQL 17.10 container with no network, published ports, application credentials or existing database connection. Nineteen observations tested actual receipt-table grants, constraints, privileged mutations/deletes and concurrent duplicate insertion. The container was removed. This validates the named legacy-table behavior, not target document schemas, hosted grants or complete current-head access races.

**Prior evidence:** Q05 source/SQL observations and Q06/Q07 auth/cache observations are reused only with fresh source checks and their original limits. They are not counted as new Q08 tests. Current UI source was inspected; no donor browser, PDF accessibility, Vercel/CDN, renderer or usability study was run. The first database harness attempt stopped before migrations because of a Windows line-ending transport error; its container was removed, the harness was corrected, and the successful independent run is recorded.

The [proof record](phase25-r08-proof-evidence.md) and [Historical bundle inventory: phase25-r08-proof-bundle.zip](README.md#historical-verification-bundles) separate observations, source inspection, inferred risks and required future proof.

## External patterns: what to adopt and what to reject

<!-- prettier-ignore -->
| Evidence | Classification and useful lesson | Limit for Asym |
| --- | --- | --- |
| [Fundraise Up donor portal](https://fundraiseup.com/docs/donor-portal-experience/) | **Useful precedent:** a named Receipts desktop/mobile destination with individual and annual documents and contextual access | Not comparative usability evidence. Its automatic updates and bulk ZIP behavior are not adopted. |
| [Fundraise Up annual summary FAQ](https://fundraiseup.com/support/annual-summary-receipt/) | **Useful precedent with a material terminology warning:** its annual summary covers one recurring plan and excludes installments already receipted | It is not evidence for Asym's organization-wide annual statement population or legal rules. |
| [Church Center giving](https://help.planningcenter.com/en/140951-manage-your-giving-information.html) | **Useful precedent:** Statements is distinct from Donation history within My giving, with available-year retrieval | Not a top-level application Statements menu; its receipt-email policies do not become Core policy. |
| [Blackbaud giving statements](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/rcptmgr-giving-statements.html) | **Useful precedent for strongest B:** giving history contains a statement action | Its informational emailed statement is not Asym's exact-current official artifact. |
| [Givebutter summaries](https://help.givebutter.com/en/articles/5860605-how-to-send-end-of-year-giving-summaries) | **Useful precedent:** recipient links support viewing, printing and saving | Staff distribution documentation does not establish donor menu hierarchy or authorize new sends here. |
| [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | **Durable patterns:** readable reflow, operable controls and meaningful nonintrusive feedback | A shared component or automated accessibility pass alone does not prove a usable journey. |
| [Supabase private downloads](https://supabase.com/docs/guides/storage/serving/downloads) | Private storage is a **Durable pattern**; a raw signed URL is a **Conflict with Core's current-access contract** as the donor transport | Signed storage URLs can remain valid after Auth key changes. Use Core's reauthorizing byte boundary, not possession of a storage URL. |

Strongest alternative B would keep a prominent document tab inside History, preserving all the same rights, links and services. Its smaller menu is a genuine advantage. A better serves the explicitly chosen recognizable self-service job; merely renaming a Home shortcut would not give the requested persistent destination. Neither option justifies a second data store. Existing source-owned access/correction/annual grouping are **Durable patterns**. Existing mutable text downloads, gift-derived availability and legacy receipt snapshots are **Implementation accidents** and prototype/removal targets under Phase18 D17. Preserve their evidence through owner disposition; they are not compatibility bridges or canonical artifact migration sources.

## The recommended experience, worked through

The examples below are illustrative test scenarios, not invented observations of actual ministry users.

**Maria needs last year's statement.** She opens Receipts & statements from the readable donor menu. The current organization and personal/represented context follow Q04. She sees recent available annual groups without first choosing the current year, recognizes the approved document type/period and chooses View statement or Download PDF. The year group can contain more than one legitimate official document; a qualified Support overview appears separately and is expressly non-tax. No summary total adds overlapping documents, unlike currencies or recognition credit.

**Alex needs one receipt.** Alex can enter from the gift detail or the Individual receipts section. Both resolve the same logical document. A concise receipt entry carries enough approved context to recognize it: document type/reference, properly labelled gift and issuance/correction dates, and safe gift context or amount/currency when appropriate. Do not force an amount onto a noncash document or disclose a whole gift to someone whose document rights are narrower. Multiple delivery attempts, artifact repairs and recipient copies do not become duplicate receipt rows.

**Keep the page quiet.** Annual statements and Individual receipts are clear sections, not competing dashboards. Bound the initial content and offer older-document continuation or a clear year selector. An absent annual section must not push usable receipts below a large empty illustration. Do not manufacture cards for every year. No unread badges, downloaded counters, donation CTA, marketing panel, folder system, bulk ZIP, custom PDF viewer, new search engine or receipt-email preference is added.

**Make actions plain.** Use View statement/receipt, Download PDF, local Print, source-qualified Send another copy and Help as applicable. Normal retrieval needs no confirmation dialog. Native browser/device viewing, save and print are sufficient; use a brief device-specific hint only when necessary. The portal may report that it is opening a file, but cannot claim the person saved it, read it or printed it. The HTML status/detail view is not a second official document or regenerated accessible substitute for the current PDF.

**Make partial failure local.** If statements fail to load but receipts succeed, retain the safe receipt section. If older items fail, preserve the existing list and retry that continuation. A document read timeout retries the read, not issuance or copy delivery. Unsupported/terminal source problems route to safe help instead of an endless Retry loop. An unavailable document is explained only as far as current permission permits; do not reveal hidden subjects, years or denial causes.

**Keep corrections understandable.** A still-valid current predecessor may remain downloadable while a successor is pending or failed. If the owner has withdrawn it, it is unavailable even if a replacement is not ready. Once promotion succeeds, resolve the current document and safe correction context; do not present predecessor files as peer choices or silently alter their bytes. A profile change, gift refund or pending help request is not itself a document-replacement command.

**Preserve the task through sign-in.** An ordinary protected document link returns to its exact permitted target after authentication. A guest capability is a separate purpose-qualified doorway, not a login identity or general portal grant. Its public GET/HEAD must remain scanner-safe and inert; authorized artifact GET/HEAD is a different operation. Ordinary links and IDs grant no access. A valid guest capability authorizes only its exact purpose-permitted document/session after exchange and current checks; it proves possession, not civil identity, so forwarding cannot be claimed incapable of exposing that bounded document. No redundant document challenge is added to already sufficient current signed-in access.

**Respect actual Maia semantics.** Use the existing shared components and semantic tokens, not a new preset. Mobile entry needs visible words, an accessible name and current-location state; adding another unlabeled icon to today's narrow navigation is insufficient. Page/section titles need actual heading semantics. The installed SelectLabel is an option-group label, not a label for the trigger. Use the supported installed composition, prove focus/labels, and avoid announcing every ordinary row as an alert. A Load more command is a button; route navigation is a link. No automatic upgrade is proposed because current documentation examples use a newer Base UI version.

## Full category review

Severity describes consequence if the defect occurs, not a claim of a deployed incident. **High** means materially wrong official history, serious access/integrity risk or a core blocked journey; **Moderate** means substantial confusion, maintenance or reliability cost. Likelihood is explicitly observed, conditional or unknown; no invented incident percentages are used. Every C-number is exact proposed execution language for the later specification, still within grooming.

### 01 — Problem validity, necessity, and alternatives

**Material concern: Yes — an entrance alone does not complete the retrieval job.**

**What/why:** A new menu item pointing to existing History would preserve the forced detour and misleading download assumptions. Conversely, a full file-management product would solve more than the donor asked for. **Severity:** Moderate. **Likelihood:** Conditional; the current Home Tax Receipt link already points to History, but no Asym comparative task study was conducted. **Evidence:** current `DonorSubNav`, Home and History; external A/B precedents above. **Effect on A:** strengthens execution, does not invalidate it.

**Permanent prevention — C01:** “Receipts & statements is a directly addressable, clearly named donor destination. Neutral entry shows a compact Annual statements/Individual receipts overview without a mandatory initial year/type gate. It preserves exact links and gift-level receipt access to the same owner resources. Older documents remain reachable through bounded continuation; do not add a file-management product.”

**Acceptance evidence:** From an ordinary signed-in home, find last year's available statement and a particular receipt without visiting transaction history, contacting staff or reconstructing gift dates. Validate selected A through retrieval and comprehension tasks. The documented B comparison informs the tradeoff; a second implementation or comparative study is not a release requirement. Return for an explicit amendment only if material evidence contradicts A.

### 02 — Brittleness

**Material concern: Yes — browser years, enabled purposes and loaded gifts are fragile inventory proxies.**

**What/why:** January can open empty despite an available prior-year statement; a five-year list can hide older documents; turning off new generation can hide retained valid files. **Severity:** High for missing records, Moderate for navigation. **Likelihood:** Existing five-year/current-year/capped-history assumptions are inspected facts; misuse of the newer purpose catalog is conditional. **Evidence:** History lines83–90, service205–215, executed P01–P08 and owner clauses on historical access. **Effect:** narrows permissible data wiring.

**Permanent prevention — C02:** “Inventory, safe year options, counts, availability and continuation come from scoped document-owner projections. Do not derive them from a device clock, payment status, loaded gift page, template list or new-generation purpose gate. Preserve source-known safe unavailable states without fabricating a document for every period.”

**Acceptance evidence:** New-year rollover, older than five years, 250/251+ gifts, no individual receipt, paused issuance, inactive pack with still-authorized history, and unavailable inventory all produce truthful distinct outcomes.

### 03 — Technical debt

**Material concern: Yes — multiple apparent receipt authorities already exist.**

**What/why:** Reusing donor text routes, snapshot tables or staff on-demand PDF generation creates competing historical truth and a second repair path. **Severity:** High. **Likelihood:** Observed source alternatives; accidental reuse is conditional. **Evidence:** donor receipts/statements, staff `receipt-pdf.ts`, two legacy receipt migrations, Phase18 D17. The staff route has real capability/no-store controls; it is not inherently an exposed donor endpoint. **Effect:** requires owner completion and explicit retirement/adoption, not a new domain.

**Permanent prevention — C03:** “The donor destination, gift links and document deep links use one owner-qualified list/access implementation in packages/api. Do not call live-text, read-triggered renderer or raw snapshot paths as fallback. Reconcile each legacy caller and stored record through the existing owner plan; do not promote it by naming it an archive.”

**Acceptance evidence:** Dependency/caller inventory and negative route tests prove that every donor entrance reaches the qualified service and no rejected compatibility fallback remains reachable after cutover.

### 04 — Edge cases

**Material concern: Yes — a uniform card can conceal materially different document meanings.**

**What/why:** Joint/represented giving, offline/imported records, split gifts, noncash acknowledgments, multiple official documents or overlapping annual/individual coverage can be mislabeled or double-counted. **Severity:** High. **Likelihood:** Supported domain cases, not a claimed frequency. **Evidence:** Phase7/18 purposes, Phase19 subject/year groups and Q05. **Effect:** narrows presentation inference, keeps A.

**Permanent prevention — C04:** “List source-qualified logical documents with their actual type, issuer, subject, period, coverage and current state. One gift need not equal one receipt; one subject/year need not equal one document. Do not sum document rows into giving or deductible totals. Keep optional Support overview distinct; show original source currency and correct minor units only where the document purpose supplies money.”

**Acceptance evidence:** Separate legal subjects sharing a year/email; legitimate multiple official documents; split/offline/imported/noncash gifts; no artifact; currency and date-boundary fixtures; source-authorized zero-value document versus no document. No fabricated file or deduced legal treatment.

### 05 — Footguns

**Material concern: Yes — “get a copy” can accidentally become an outbound or generation command.**

**What/why:** Developers may wire a download failure to resend, invoke a renderer on GET or update a “read” flag. Donors can unintentionally send duplicates or change official records. **Severity:** High. **Likelihood:** Current staff PDF generation on request is a concrete reuse hazard; no such target donor send was executed. **Evidence:** Phase19 direct/copy distinction; source staff renderer and donor routes. **Effect:** strengthens execution.

**Permanent prevention — C05:** “View, download, local print, list, refresh and read retries create no generation, issuance, financial, delivery, consent or human-read effect. Required access/security audit and disposable projection maintenance remain permitted. Send another copy is a separate deliberate owner-authorized operation; do not trigger it automatically or offer an arbitrary address.”

**Acceptance evidence:** Repeated GET/HEAD/range, refresh and duplicate clicks leave business effect counts unchanged. Confirmed copy uses its own durable occurrence; failed copy does not remove valid direct access. UI never claims device save/read/print completion from an HTTP response.

### 06 — Tenant safety

**Material concern: Yes — the page combines sensitive information across Sites and giving contexts.**

**What/why:** A cache, selector, breadcrumb or list keyed only by user/year can mix organizations or represented subjects, even if byte authorization is correct. **Severity:** High privacy impact. **Likelihood:** Conditional target risk; current personal guards and logout/user-switch cleanup are real positive controls. **Evidence:** Q04, Phase3/12/19/24, current service166–191 and collection/cache source. **Effect:** requires full-context composition.

**Permanent prevention — C06:** “Derive Tenant/environment and current authorized subject/recipient context server-side. Scope list, metadata, counts, years, help payloads, caches and late responses as well as bytes. A Site/host, shared email, household, provider Customer or selected context creates no document grant. Context loss clears protected content; late results cannot repopulate the wrong scope.”

**Acceptance evidence:** Two Tenants, two Sites in one Tenant, same-user represented-context switches, shared email, logout/sign-in and late-response races disclose zero unauthorized content. Document-only authority works without granting broad financial history.

### 07 — Database, RLS, and authorization safety

**Material concern: Yes — comments and enabled RLS do not establish enforced historical integrity.**

**What/why:** Fresh actual-schema tests deny ordinary donor reads/writes, but service_role can mutate/delete legacy snapshots and create cross-Tenant receipt/gift references. One-per-gift uniqueness also conflicts with the comment describing corrections as new rows. **Severity:** High. **Likelihood:** Deterministic under the tested privileged role; this is not a live donor exploit. **Evidence:** 76 migrations, 19 observations, catalog/grants/constraints in proof pack. **Effect:** prevents using these legacy tables as the target authority.

**Permanent prevention — C07:** “Complete the existing owners' required non-null scope, kind-correct same-scope foreign keys, semantic uniqueness, protected current head, immutable promoted facts/artifact identity and owner-governed delete/records transitions. Inspect effective table/schema/function grants, RLS USING and resulting-row WITH CHECK behavior, views, security-definer/search-path and owner/BYPASSRLS paths. Trusted context supplies actor/issuer/recipient attribution; clients cannot rewrite tenant, ownership, currentness, issuance or audit fields.”

PostgreSQL may reuse USING as WITH CHECK when the latter is omitted; omission alone is not proof of a vulnerability. FORCE RLS does not restrain a BYPASSRLS role. The observed privileged mutations, not a keyword scan, support the finding. [PostgreSQL policy semantics](https://www.postgresql.org/docs/17/sql-createpolicy.html)

**Acceptance evidence:** Actual target PostgreSQL, separate app roles, allowed and forbidden row transformations, scoped relationships, held-record deletes, privileged writer paths, unique current-head races and real storage access. No broad browser grants, second portal-document table or assumed security from synthetic role tests.

### 08 — Overengineering

**Material concern: No additional architecture is needed; speculative additions would create avoidable risk.**

Checked the strongest minimal solution: a named entrance, scoped owner projections, shared presentation and existing actions. A generic document manager, per-donor archive, PDF search, new microservice, cache-coordination platform, notification queue or custom viewer is unnecessary for this decision. The existing document owners still require their accepted integrity/access machinery; removing that would not be simplification.

**Scope guard — C08:** “Compose the existing document domain. Add no new truth store, renderer, file-sharing product, bulk ZIP/export, delivery engine, unread ledger or generic support workflow through Q08.” Future evidence may justify a separately groomed capability; vendor feature lists alone do not.

### 09 — UX/UI and user friction

**Material concern: Yes — simply appending an icon undermines the chosen clear entrance.**

**What/why:** Current narrow navigation hides labels. Unlabeled year controls, title divs, duplicate responsive controls, hidden actions or assertive alerts can obstruct mobile and assistive use. **Severity:** High if a donor cannot complete the task; otherwise Moderate. **Likelihood:** Inspected composition risks, not executed accessibility failures. **Evidence:** DonorSubNav46–69; shared Card/Empty/Select/Alert wrappers; current W3C guidance. **Effect:** strengthens the selected UX.

**Permanent prevention — C09:** “Use exact base-maia/Base UI/shared tokens with readable desktop/mobile navigation, actual accessible names/current location, semantic headings, labelled filters and ordinary links/buttons. Keep View/Download discoverable; secondary help/copy actions remain reachable. Preserve focus and Back position safely; meaningful async feedback is local and appropriately announced. Do not require horizontal scrolling to connect essential labels and actions.”

**Acceptance evidence:** Real mobile/desktop keyboard and screen-reader journeys, 320 CSS-pixel reflow/400% zoom equivalent, text enlargement, long translations, reduced motion, visible focus and touch operation. WCAG2.2 AA target-size/spacing requirements are a minimum; apply comfortable existing design-system sizing rather than claiming 44px is the universal AA rule.

### 10 — Source of truth, ownership, and domain invariants

**Material concern: Yes — a document directory can become a shadow issuer.**

**What/why:** Recomputing current profile/gift values, choosing the newest file or using Stripe execution evidence as an official receipt changes historical truth. **Severity:** High. **Likelihood:** Mutable text behavior is executed; target inference risk is conditional. **Evidence:** D01–D03, ADR0001, ownership matrix, Phase18 manifest332–340. **Effect:** requires strict source preservation.

**Permanent prevention — C10:** “Phase7 supplies official facts/eligibility/corrections; Phase18 supplies logical documents, immutable artifacts, currentness/access/records; Phase19 supplies annual population/operations;17/6 supplies outbound evidence. Portal metadata is disposable display data. A current head has at most one eligible artifact per declared slot; successful render, filename, timestamp, payment or message state never elects it.”

**Acceptance evidence:** Projection rebuild, current profile edits and repeated reads preserve artifact hashes and official facts. Source correction/supplement transitions alone change the lawful current document. No second CRM/provider synchronization or portal-owned issuance fact appears.

### 11 — Hidden coupling

**Material concern: Yes — new-generation readiness can be confused with historical access.**

**What/why:** Turning off a pack, renderer or email channel could hide valid retained documents; a History outage could block unrelated downloads. **Severity:** High. **Likelihood:** The tested generation catalog intentionally goes dark/absent; no deployed retained-artifact hiding defect is claimed. **Evidence:** P01–P08; Phase18 manifest349–351/477; Phase19 current access. **Effect:** separates responsibilities.

**Permanent prevention — C11:** “Independently resolve document existence/currentness, current recipient access, records restrictions, artifact health and new-generation qualification. Issuance pause, absent new-purpose catalog entry, outbound opt-out/failure or History filters do not alone remove otherwise valid document access. Conversely, a supported purpose or retained file never proves a donor has access.”

**Acceptance evidence:** Valid old document during paused generation, failed email, inactive optional pack and History outage; independent access withdrawal still denies it. No hidden automatic issuance when readiness returns.

### 12 — Failure modes

**Material concern: Yes — partial failure can masquerade as success or missing history.**

**What/why:** Whole-page error handling, silent empty arrays, partial streams or lost responses can hide usable files and push donors to staff. **Severity:** High for integrity, Moderate for recoverable friction. **Likelihood:** Network/owner failures are expected conditions; current target path is unimplemented. **Evidence:** D01, current helper/error limits, owner streaming contract. **Effect:** requires honest local recovery.

**Permanent prevention — C12:** “Distinguish initial load, partial section failure, continuation failure, no authorized documents, safe not-yet-available state, revoked access and unavailable artifact. Preserve only still-authorized usable content. Retry the failed read/continuation safely; terminal owner outcomes offer appropriate help. Never substitute zero history, a stale PDF, mutable text, a provider link or automatic outbound copy.”

**Acceptance evidence:** Inject failures before/after inventory, during continuation, before headers and midstream. Detect truncated/incorrect bytes; no success/download-completed claim after failure. Restore safe focus and selected context; do not endlessly poll a terminal state.

### 13 — Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes — checking once does not cover correction, revocation and transfer races.**

**What/why:** A list can be current before a replacement or grant withdrawal; independently ranged requests can splice generations; retries can duplicate outbound copies. **Severity:** High. **Likelihood:** Normal lifecycle concurrency; target races remain unproved. **Evidence:** Phase18 manifest379/442–455, #950/#952, Phase19 copy contract; legacy duplicate-insert proof covers only its unique key. **Effect:** strengthens source execution, not portal-owned state machines.

**Permanent prevention — C13:** “Re-prove current authority/head/health and object metadata before each full/HEAD/range response starts; bind one exact immutable generation, digest and length throughout that response. Never splice a successor. New requests use current authority. Owner promotion/withdrawal uses atomic fenced transitions. A pending correction does not invalidate a still-valid predecessor; a withdrawn predecessor cannot be used while its successor is pending. Deliberate outbound copies dedupe the durable business occurrence, including unknown handoff recovery.”

Revocation prevents newly admitted access; it cannot recall bytes already delivered or saved. Do not hold a database lock while a donor reads a page. Implement the existing single-range/multi-range contract rather than inventing a universal distributed lock or multipart engine.

**Acceptance evidence:** Two-session target PostgreSQL races for promotion, revocation, duplicate copy and stale revision; pre-stream versus in-stream changes; full/range byte equality and HTTP boundary tests. Replay/out-of-order events cannot resurrect withdrawn access or corrupt current-head lineage.

### 14 — Data integrity risks

**Material concern: Yes — empty snapshots, duplicate projections and deletion can corrupt a plausible archive.**

**What/why:** The tested legacy tables accept empty content and inconsistent scope under privileged writes; mutable snapshots and cascading deletes contradict durable records needs. A directory could duplicate each artifact or recipient. **Severity:** High. **Likelihood:** Observed legacy structural behavior; target defect conditional. **Evidence:** database proof, Phase18 records/identity contracts, #927 logical-document list. **Effect:** requires governed identities and adoption.

**Permanent prevention — C14:** “Use stable logical identity and source-qualified revision/artifact/coverage references. Deduplicate display by declared logical document, not filename, delivery, artifact attempt or payment row. Preserve immutable historical evidence and record-class-specific correction/disposal. Validation and database constraints enforce meaningful version/content/scope and exact source relationships; no client-side repair or inferred backfill of missing official facts.”

**Acceptance evidence:** Multiple versions/copies/recipients yield correct distinct documents; replay/rebuild does not duplicate rows; mismatched scope/invalid content fails at the owner; restore/disposal cannot resurrect an ineligible artifact. Do not impose global receipt-number uniqueness where the purpose defines issuer-scoped serials.

### 15 — Security and privacy risks

**Material concern: Yes — the link, response and page metadata are all disclosure surfaces.**

**What/why:** Public/signed object URLs, cached denials/metadata, filenames, external viewers or forwarded capabilities can bypass current controls or leak sensitive identities. **Severity:** High. **Likelihood:** Conditional target risk; public document-uploads policies exist by source inspection, but current donor text routes do not use them and no live PDF leak is claimed. **Evidence:** Phase18/ADR0037, Supabase docs, source-only storage inspection. **Effect:** constrains transport and metadata.

**Permanent prevention — C15:** “Use the existing private Asym artifact boundary, safe filenames/fixed media type/nosniff and exact required browser/CDN no-store/no-transform headers for protected success, error and redirect responses. No raw/public/signed storage URLs or third-party document viewer. Reauthorize before metadata/length/range disclosure. Minimize logs/diagnostics and remove sensitive identities, bearer material and protected URLs from analytics, referrers and help payloads.”

**Acceptance evidence:** Real deployed browser/CDN, direct storage negative tests, unauthorized HEAD/range/conditional requests, bad filenames/header injection, wrong Tenant/subject and scanner/guest cases. Records retention, privacy deletion and access revocation remain distinct; local downloaded files cannot be remotely revoked.

### 16 — Scalability and performance risks

**Material concern: Yes — a document destination must not fetch or render an entire giving history.**

**What/why:** Unbounded lists, per-row provider checks, PDF thumbnail generation and overlapping authorization queries can slow seasonal statement access and noisy tenants. **Severity:** Moderate, High for complete outage. **Likelihood:** Conditional; current capped/unpaged source shapes show shortcuts but no target load result exists. **Evidence:** service205–215/279–300, Phase18 bounded module and Phase19 reader. **Effect:** requires bounded owner reads.

**Permanent prevention — C16:** “Use indexed, scope-aware document projections with deterministic continuation and bounded payload/work. Do not load all gifts, generate previews, render PDFs or call providers once per row. Access checks remain current; performance shortcuts cannot authorize stale content. Choose page/work limits from production-shaped measurements and record exact units/fixtures before release, not from arbitrary vendor caps.”

**Acceptance evidence:** Boundary fixtures across pages, many revisions/subjects and the measured largest supported Tenant; query plans and memory/payload measurements; bounded concurrent downloads and fair resource limits. No invented SLA or claim that a 250-row cap proves scale. Reading more documents must not be a paid/quota-gated donor action.

### 17 — Operational burden

**Material concern: Yes — unresolved document problems can become permanent manual database work.**

**What/why:** Staff may have to email PDFs, reconstruct receipts or inspect provider queues for routine access. A donor help panel could expose technical repair choices instead of reducing that burden. **Severity:** Moderate to High. **Likelihood:** Conditional owner integration risk, not measured current ticket volume. **Evidence:** Phase19 Help and #1024/#1025, current renderer/route divergence. **Effect:** requires source-routed assistance.

**Permanent prevention — C17:** “Keep current view/download first. Donor Help expresses the problem and resolves to a permitted owning action or safe organization help path. Preserve separate view/copy/destination/source capabilities; never copy the staff repair panel wholesale. Operators diagnose and repair through the existing owner tools, not arbitrary database edits or donor-visible provider commands.”

**Acceptance evidence:** View-only donor, authorized representative, unavailable document, wrong/missing giving and failed copy cases find the correct next step without widened powers. Routine transient failures recover without staff; source-authority problems are escalated to the correct owner with minimal safe context.

### 18 — Observability and auditability gaps

**Material concern: Yes — successful HTTP transfer is not issuance, delivery, human reading or printing.**

**What/why:** False engagement/fulfillment facts mislead staff, while vague errors make current-head or storage faults hard to diagnose. **Severity:** High for false official/operational evidence; Moderate for support cost. **Likelihood:** Conditional; no target telemetry was verified. **Evidence:** Phase18 access/checkpoint and Phase19 no-read/copy-inventory rules. **Effect:** requires bounded, separate evidence.

**Permanent prevention — C18:** “Record source-required security/access and technical outcome evidence with trusted actor, scope, logical document/current generation and safe cause/correlation. Keep it distinct from immutable issuance/correction/fulfillment history. Do not create a donor download count, read flag, missionary notification or copied message merely from retrieval. Do not log PDF contents or bearer secrets.”

**Acceptance evidence:** Operators can distinguish denied access, missing owner, integrity failure, generation change and transfer failure using permitted diagnostics. Failed audit/checkpoint handling follows its owning contract; no blanket new fail-open/fail-closed rule is invented. Monitoring owners/thresholds/actions appear below.

### 19 — Dependency and integration risks

**Material concern: Yes — open owner work and provider examples can be mistaken for ready services.**

**What/why:** A purpose catalog or merged planning PR can be called a complete document feature; newer Base UI examples can be copied into incompatible wrappers. **Severity:** High for false release readiness, Moderate for UI regressions. **Likelihood:** Current implementation gaps are verified. **Evidence:** P01–P08; #927/#950/#951/#952/#997/#1017/#1023/#1024/#1025; installed BaseUI1.5.0 versus current docs1.8.0. **Effect:** requires exact adoption, no speculative upgrade.

**Permanent prevention — C19:** “Complete and qualify the exact owning list/identity/access/stream/annual/help/copy seams before activating dependent paths. Keep optional guest or jurisdiction functionality subject to its own contract, while respecting actual build blockers. Treat provider execution as evidence only, not official donor truth. Use installed supported components and adapters; do not select a renderer, upgrade a library or change Stripe/provider configuration through Q08.”

**Acceptance evidence:** Current issue/body/graph reconciliation and source-to-stored-artifact-to-donor proof. PR872's merge resolves its publication checkpoint, not open implementation. Live provider, renderer and connected-account tests were not run or needed to ratify navigation; any later exact relevant integration must supply its required authorized qualification.

### 20 — Migration, rollout, and upgrade risks

**Material concern: Yes — enabling a new menu can spread old URLs and unsafe fallbacks.**

**What/why:** Mixed clients/schemas can route to incompatible text/PDF paths, reconstruct legacy artifacts, lose bookmarks or restore prohibited byte access on rollback. **Severity:** High. **Likelihood:** Conditional cutover risk. **Evidence:** current donor text/staff renderer paths, inspected callback behavior and Phase18 D17's explicit removal boundary. **Effect:** requires explicit owner rollout, not migration by convenience.

**Permanent prevention — C20:** “Inventory every old donor document caller/URL and legacy record class; record its owner-approved disposition. Implement compatible source/API/consumer sequencing and exact-target safe routing without reviving prohibited legacy/foreign dual reads or manufacturing artifacts. Qualify the full supported path before activation. A rollback/kill switch contains unsafe serving while preserving valid records and supported access; it cannot re-enable text regeneration, stale signed links or forbidden bytes.”

**Acceptance evidence:** Clean install, source-approved existing-data adoption/disposition, old/new client and schema combinations, deep links, cancelled deployment, rollback after accepted records and recovery. Optional unsupported purposes remain truthful; do not claim Phase25 complete with mandatory document paths still fake. No destructive migration is authorized in this grooming turn.

### 21 — Testability, traceability, and proof

**Material concern: Yes — green mocked cards can falsely stand in for document safety and usability.**

**What/why:** Tests can reproduce implementation details but miss actual PostgreSQL permissions, correction races, storage generations, CDN behavior or user task failure. **Severity:** High. **Likelihood:** Current test-seeded receipt URLs and absent target path make the risk concrete. **Evidence:** source harness limits, actual DB proof limits, owner acceptance clauses. **Effect:** requires end-to-end evidence, not more cosmetic tests.

**Permanent prevention — C21:** “Trace Q08/C01–C22 to canonical terms, accepted owner clauses, later OpenSpec/design/tasks, exact existing dependencies, implementation and release evidence after the appropriate publication command. Require positive/negative/boundary/currentness/concurrency/migration/accessibility proofs at real public seams. Record what was executed, source-inspected, simulated, unqualified or not run; mock/fixture counts are never release certification.”

**Acceptance evidence:** The P01–P14 proof matrix below is completed against the target implementation, with actual artifacts, roles, failures and supported devices. No current purpose/generation, grant or provider state is inferred from documentation alone.

### 22 — Other development hazards

**Material concern: No additional independent concern after the preceding boundaries.**

Checked accidental financial actions, newsletter/preferences coupling, Ministry Updates disruption, additional mandatory authentication, household access, new My Campaigns/Support Hub scope, hidden taxonomy changes and declarations of perfect UX without user evidence. C05/C06/C08/C11/C15/C19/C20 already prevent these; inventing another mechanism adds no protection.

**Scope guard — C22:** “Keep Question08 limited to the dedicated retrieval experience and its necessary owner integration. Preserve ratified navigation priorities and unrelated capabilities. Do not add new legal, receipt-delivery, guest-assurance, export, notification, future-phase or financial authority. A material proposed change to a ratified owner decision requires a named amendment and founder decision.”

## Database and service setup: the permanent direction

There is no reason to create a new authoritative `donor_documents` system for this menu. The logical shape is the existing owner chain: **source-approved facts and subject → logical document → current eligible artifact**, with independent **recipient/access/records** checks. A presentation group or list cursor is disposable. Source facts, money, consent, delivery and legal donor are not copied into another writable truth.

The two sampled legacy tables have real positive protection: anon/authenticated reads and mutation attempts were denied. `gift_receipt_records` restricts deleting its referenced donation and its unique donation index allowed only one concurrent insert. Those positives do not make it the target immutable chain: privileged updates/deletes, unconstrained same-scope relationships, empty snapshots and correction-row incompatibility remain. The tested snapshots table cascades with donation deletion. No hosted exploit or target repair is claimed.

The owner implementation must enforce required scope and cross-record references, actual serial/semantic key domains, immutable promoted facts/artifacts, a uniquely fenced current head, source-qualified history and records transitions, and current access independent of generation. JSON may contain a validated immutable Facts Package; it must not replace relational scope/identity constraints or be filled from caller-controlled donor/actor fields. Money stays in owner-defined exact types/minor units; this portal needs no money mutation.

A current access request resolves a coherent head/recipient/records basis, verifies exact object generation/length/hash and rechecks before streaming. Locks/transactions remain short and source-owned. Full/range responses never mix generations; later requests reauthorize. This is the existing document contract, not a new distributed transaction held across storage or a human reading session.

## Required proof before release

These are future acceptance obligations, not tests claimed completed by this review.

<!-- prettier-ignore -->
| ID | Falsifiable outcome | Proof seam |
| --- | --- | --- |
| P01 | Neutral mobile/desktop entry finds available prior-year statement and individual receipt without History detour; direct links preserve intent | Real donor navigation, source data, native PDF action; moderated task validation |
| P02 | Years/receipts remain complete across bounded pages; no invented document from empty/failed/pending/imported gift or unsupported purpose | Actual document projection with boundary and partial-failure fixtures |
| P03 | Cross-Tenant/subject/issuer/environment/recipient requests reveal neither bytes nor metadata; document-only rights need no broad gift access | Real PostgreSQL grants/RLS/functions plus authenticated API/storage negatives |
| P04 | Two concurrent promotions yield one lawful current head; stale revision cannot overwrite it | Two real target PostgreSQL sessions, exact owner commands |
| P05 | Correction pending/failure preserves only a still-valid current predecessor; withdrawal denies it; no newest-file election | Source correction → current head → portal → stored bytes |
| P06 | Revocation before stream denies newly admitted access; in-flight bytes never splice; next request reauthorizes | Real authorization/HEAD/range/full service races and object-generation instrumentation |
| P07 | PDF media type, safe filename, byte length/hash, range/error behavior and cache headers survive the actual deployment | Real storage and Vercel/CDN/browser; no transform or raw signed/public URL |
| P08 | Signed-in and purpose-qualified guest flows retain exact target, resist scanners and don't create account/general grants | Actual auth callback, guest exchange and browser; expired/wrong-context/host-loss cases |
| P09 | View/download/local print/refresh have no issuance/send/financial/read-claim effect; intentional copy dedupes and recovers unknown handoff | Actual owner records/outbox with provider-contract fake or authorized sandbox as relevant |
| P10 | Paused new generation, outbound failure or History outage does not alone remove valid historical access | Independent qualification/access/records fixtures and real source calls |
| P11 | Section/page failures preserve safe usable content; no error-as-empty, duplicate continuation or endless terminal retry | Real API errors, slow/offline browser and focus/state checks |
| P12 | Accessible names, headings, keyboard/focus, touch, reflow/zoom, long translations and meaningful status feedback work; PDFs meet their purpose profile | Real supported browser/screen-reader/device journeys plus automated checks and actual PDF validation |
| P13 | Existing-data disposition, mixed versions, route cutover and rollback preserve evidence and never restore forbidden fallback | Native migrations, target owner adoption, browser old links and staged release drills |
| P14 | Bounded queries/payloads/stream resources sustain the declared supported workload, and failures are diagnosable without sensitive logs | Production-shaped dataset/load/query-plan evidence, documented numeric operating envelope and safe diagnostics |

No numerical conversion gain or generic “best results” is established. Donor usability validation should include occasional statement retrieval, frequent receipt retrieval, represented/document-only access, mobile/assistive use, and a missing/error case. Any critical inability to find/retrieve the correct permitted document is a release failure, not something to average away in a satisfaction score. Larger analytics or research programs are not added by this decision.

## Dependency and conflict register

<!-- prettier-ignore -->
| Item | Resolution and owner |
| --- | --- |
| A selected; overview/default not previously settled | Keep A. Present overview and C01–C22 for explicit Q08 ratification. Do not claim prior P19 settled the per-gift layout. |
| Current text endpoints and gift-derived availability conflict with target | Complete P7/18/19 services; retire/adopt callers under D17. No fallback renderer or invented receipt. |
| Legacy receipt immutability comments conflict with effective constraints/grants | Preserve evidence; owner persistence/adoption must resolve before target activation. Do not repair with browser grants or invent a parallel ledger. |
| Staff list versus donor projection | #927 is staff current-first groundwork, not permission to expose its timeline/repair UI. #1023 owns donor yearly access. |
| Access and bytes | #950 exact authorization; #951 purpose-qualified guest exchange; #952 exact streaming/CDN proof. Native #952 blockers include #950/#951; product-level optional guest use does not authorize silently removing build edges. |
| Annual integration and subject separation | #997 annual recipient/artifact integration; #1017 subject separation; #1023 blocked by #997/#950 in the refreshed graph. |
| Copies and help | #1024 bounded outbound-copy fulfillment; #1025 contextual Help and separate capabilities. Do not conflate their scopes. |
| Late facts/currentness | #1022 owner late-fact obligations and Phase18 promotion/withdrawal; portal observes permitted currentness rather than minting corrections. |
| Historical accesses versus new generation | Existing artifact authorization remains distinct from catalog readiness/issuer pause, under current source/records rules. |
| Older #583 wording | Household shortcuts, live-cache/dual-read/permanent-link/superseded-picker implications cannot override accepted later document/identity contracts. Reconcile before implementation. |
| PR872 | Already merged from `codex/docs-sitestacker-phase-17`, head `b886c2eb2fe4c98cc8723a232d860138c86b10c2`; stale unresolved publication-gate prose is not a current blocker. Open children still need implementation. |
| Active P24 host/brand contract | D57 at PR1558 head `ab1a1703a725be454376990a7fe68aef2e048026` governs intended qualified donor-host entry; not deployed proof. No unsafe host/provider fallback or shell-driven rewriting of frozen document facts. |

The fresh owner lane inspected #927/#951/#952/#997/#1022/#1024 bodies; the preceding Q08 pass refreshed #1017/#1023/#950/#1025. Exact refresh provenance/native versus body edges is retained in the bundled lane notes. No GitHub edge was changed, and no duplicate ticket is proposed.

## Ruthless synthesis: what to do, in order

1. **Before recording the reviewed answer as ratified:** preserve A and explicitly accept or adjust the proposed overview/default plus C01–C22. The historical/currentness/help/generation distinctions are resolved above; none requires a new business owner. No additional founder question is hidden in the navigation decision.
2. **Capture in the later specification/design:** the calm neutral overview, contextual/direct entries, annual hierarchy, receipt meaning, all availability/failure states, scope/rights, no-business-effect retrieval, and source-owned help. Preserve exact owner references and glossary meaning. This review does not invoke `/to-prd`.
3. **Complete the prerequisite owners and permanent integration:** resolve exact logical-document inventory, subject/access/current-head/bytes/records seams and their actual ticket blockers. Add the thin donor surface only against qualified paths. Do not release a fake complete feature first and promise to replace its truth later.
4. **Require implementation safeguards and proof:** enforce target PostgreSQL scope/immutability/current-head rules, exact-generation streaming, deployed cache behavior, safe auth return and real accessible end-to-end journeys. Retire prohibited callers under the owner migration plan; validate rollback without resurrecting them.
5. **Monitor ordinary regressions after those gates pass:** use the small operational table below. Security/integrity correctness and core task completion remain release gates; monitoring is not their replacement.

<!-- prettier-ignore -->
| Monitored signal | Threshold | Owner | Response |
| --- | --- | --- | --- |
| Unauthorized metadata/byte disclosure or artifact digest/generation mismatch | One confirmed event | Platform security + Phase18 owner/on-call | Immediately contain affected serving path, preserve evidence, revoke the affected access path where required, and repair/requalify; never continue with fallback bytes |
| Supported exact-document synthetic retrieval | Two consecutive failures for the same qualified fixture after one ordinary read retry per run | Phase18 operations/on-call | Investigate access versus artifact/deployment cause; route source fault correctly; recover and rerun probe before closing incident |
| Document projection completeness | One confirmed missing authorized item, duplicate logical row or false empty state in a fixture/reported case | Phase25 donor experience + owning projection team | Correct source/query/continuation or UI cause; add regression proof and assess affected scopes |
| Released document journey accessibility | One confirmed blocker preventing keyboard/assistive/mobile retrieval | Shared UI + Phase25 donor experience owner | Prioritize correction and verify affected journey before broadening rollout |

These are proposed operational response thresholds, not vendor statistics or a new universal SLA. Implementation release evidence must name the actual responsible team/on-call mapping and declare the measured workload envelope. No background donor tracking, engagement scoring or extra notifications are required to obtain these signals.

## Coverage and record status

All 22 requested categories were evaluated individually; 20 have material execution concerns and two have no additional independent concern. C01–C22 provide exact recommended wording, with P01–P14 future proof groups, ownership/conflict resolution and named monitoring. Sources, test limits, no-build alternatives, lifecycle, migration and failure recovery are explicit. The review is complete; the target product is not yet certified.

**Final disposition: Accept with required amendments.** Keep the dedicated entry and adopt the corrected execution as a narrow completion of the selected self-service job. This creates no new legal, financial, document or communication authority. The next question is **Question08 — Review ratification**, not Question09.

**Do you ratify Question 08’s corrected execution requirements, including the calm overview and the safeguards in C01–C22?**

## Primary repository references

All develop links below pin the inspected commit; active P24 remains separately identified above.

- [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), [ownership matrix](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md), [CONTEXT](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/CONTEXT.md).
- [Phase18 purpose/authority manifest](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-18-document-purpose-authority-manifest.md):332–340,349–351,379,442–477; [Phase18 PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-18-receipt-pdf-template-system.md):234–258,320–345,519.
- [Phase19 PRD](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-19-year-end-statement-operations.md):258–264,866–937; [statement operations OpenSpec](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/add-statement-operations/specs/statement-operations/spec.md):694–731; [donor self-service contract](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/changes/add-donor-self-service/specs/donation-lifecycle/spec.md):155–215.
- [Current statement route](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/statements.ts), [receipt route](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/receipts.ts), [service](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/donor-portal/service.ts), [purpose qualification](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/generated-documents/purpose-catalog/availability.ts).
- [Receipt-record migration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260704120000_gift_receipt_records.sql), [receipt snapshots migration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260611140000_contribution_receipt_delivery.sql), [current donor navigation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/DonorSubNav.tsx).
