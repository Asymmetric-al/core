> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Q20 A1–A5/J01–J16/V01–V10/C01–C22, Maia presentation and10-minute reviewed admission/separate10-minute accepted preparation/24-hour file/30-day minimized correlation. ReUI is additionally the reference for all Asym/Core grids, adapted to shared Maia components and governing source/product boundaries. T01–T18 remain required target proof. Earlier provisional wording below is historical; ratification is not implementation or publication.

# Question 20 — Clear filters and a complete giving-history download

8 September 2026. Phase 25 `donor-portal-depth`, Grill with Docs. **A is selected. Corrected execution awaits ratification.** Q01–Q19 remain fully ratified. This is a completed research review and proposed execution contract, not a published PRD/OpenSpec change, implementation ticket, dependency upgrade or shipped exporter.

**Disposition: Accept with required amendments.** Start from the donor's currently applied History filters, show that scope plainly, and make it easy to change for this download alone. Use the requested TanStack stack and direct ReUI filtering inspiration within Core's shadcn/Base UI Maia boundary. The permanent implementation must use the complete governed source result; the current browser table exporter is not suitable.

The review found three concrete implementation gaps: the source-governed export request/artifact lifecycle is not complete; current client filters/exporters can operate on only loaded rows; and the running local Supabase database is substantially behind the checked-in migrations. These findings change execution and proof requirements, not the selected donor experience.

## Corrected decision to record

> Opening **Download history** copies the currently applied, source-resolved History filters once into an independent, editable download proposal. The donor sees the current giving context, exact date period and every narrowing choice, with **Change filters** and **Download CSV**. Editing this proposal does not alter History. Unapplied edits, virtual rows and later changes in another tab do not alter it.
>
> The request covers every currently authorized matching record available from the declared source, including records never scrolled into view. It uses the existing P3 export policy/serializer, P12 current authorization/egress controls and History's source-owned financial meanings. A denied predicate is rejected, never silently removed. A CSV is an informational history extract; official receipts and statements remain in their existing destination.
>
> One narrow P3-owned export-request lifecycle prepares a coherent, complete private file before making it available through a current-authenticated download endpoint. Small and large requests share this journey. Retries recover the same request/result; relevant access loss invalidates the prepared file. No report center, saved report builder, export-ready email/bell, new ledger or direct browser financial-table access is added.

### A1 — Preserve the donor's expressed scope

Adopt A with explicit separation between the applied History query, an unfinished editor draft, the one-off download proposal and the accepted request. Reuse Q10's filter meanings and all-available default. Show complete applied values, not just a filter count. All available remains the current authorized giving context and source coverage, not all Tenant data or a lifetime-completeness claim.

### A2 — Adopt ReUI's useful composition within Maia

Use compact text-labeled controls, visible removable values, searchable fund choices, a clear reset and local loading/error feedback. Retain Q10's Date/Fund/Gift amount, simple secondary filters, continuous scrolling and accessible continuation. Do not import ReUI's administrative operator builder, numbered pages, row editing, bulk actions or raw URL/saved-view synchronization. The source—not ReUI's fixture row model—filters the complete result.

### A3 — Give the requested libraries separate jobs

Use Store for the small in-memory download draft, Query for transport/cache and operation status, DB for a bounded read-only materialization of admitted History records, shared Table v9+ for presentation, and Virtual for long-list rendering. One shared Query transport feeds the DB adapter; no duplicated fetch or three-way writable state synchronization. Adopt a then-current compatible locked release set through the shared boundaries, with actual migration proof before activation.

### A4 — Add the missing narrow P3 execution contract

Explicitly extend the existing governed export owner with accepted-request identity, coherent source extraction, complete private artifact preparation, exact authorized readback/download, current access reproof, bounded retries/cancellation, and cleanup. It is not already proved by `emitGovernedCsv`, a generic Table helper or a Storage bucket. Complete it with the existing #491/#493/#495/#496 and History/P12 owners, not a new export policy service.

### A5 — Ratify finite availability and truthful recovery

Proposed product defaults: a server-issued reviewed admission envelope is valid for **10 elapsed minutes from issuance**; an accepted export has a separate **10 elapsed minutes from acceptance** to prepare; a Ready artifact is available for **24 hours**; minimized request/outcome correlation lasts **30 days from acceptance**. Attempts, download, refresh and reauthentication do not renew these original clocks. The admission envelope prevents an old submission from creating fresh work after correlation cleanup; it does not replace authentication or cancel work already accepted within its window. Temporary rows, manifests, sensitive filter payload and CSV bytes follow the short payload lifetime; durable security/egress audit keeps its independently governed retention and holds. These are proposed Asym defaults, not Supabase, IRS or industry requirements. Their exact enforcement and release proof are below.

## The seven Grill with Docs checks

### What could go wrong with this answer?

A forgotten filter can make a narrow download look complete; an unfinished edit can change it unexpectedly; a virtual-window export can silently omit older gifts; a split can duplicate money; a private URL can outlive permission; a retry can prepare different data. The corrected journey exposes scope and binds one accepted request to a complete, exact, currently authorized result.

### What hidden assumptions are we making?

We do not have Asym donor usability results or production-shaped export benchmarks. The hypothesis is that many donors download the records they just found; a visible Change action handles a different task. Ten minutes/24 hours/30 days are bounded product choices to ratify and qualify, not measured optima. A coherent source snapshot and current policy reproof require owner implementation; a cursor or timestamp alone does not supply them.

### How does this affect the whole product?

P3 gains a small governed request/result capability, and its shared serializer needs precise numeric/text handling. P12 and History remain authoritative. Staff exports may reuse qualified shared infrastructure, but donor scope must not inherit staff privileges. P18/P19 document generation, financial commands, communications and the CMS remain outside this action. No new CRM provider or shadow ledger is justified.

### How does this affect the end-user experience?

The normal task is one short review and a download request. Changes open familiar filters inside the same task. Preparation is local and calm; returning retrieves the same result. No duplicate acknowledgements, output-column wizard, mandatory account setup or unsolicited notifications are needed. Scope, failures and expiration remain understandable without technical vocabulary.

### Does this follow modern best practices?

Direct donor precedent supports year/fund filtering before CSV download; consumer-finance products also demonstrate fresh export scope, so B is credible. ReUI and current applied-filter research support visible values and easy removal. Their staff operators, row windows and vendor delivery limits are not donor requirements. Primary TanStack and Supabase documentation support the technical seams, but do not certify Core's integration.

### Does this fit Asym’s existing repo and product direction?

Yes, after the explicit P3 lifecycle and shared serializer amendments. ADR-0001 puts CRM truth in Asym Postgres; Q05/Q10 retain whole-gift source semantics; P3/P12 control exportable data and egress; ADR-0027/Q17 do not admit a new generic file-ready notification. P23/P24 reserve private account layout/navigation/forms/security to Core. These owners prevail over library demos and external conventions.

### Should we adjust the recommendation?

Keep A. The strongest alternative—choose dates/scope anew for each download—reduces accidental carryover but repeats useful work. The visible scope summary and independent Change action preserve B's benefit without imposing the extra choice on everyone. Replace neither A nor the ratified no-pagination History journey; require the concrete execution below.

## Evidence: verified facts, current behavior and intended behavior

Research HEAD and current develop were checked at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Active P22/P23/P24 source branches and current owner issue bodies were read during this Q20 research cycle. They are developing authority, not claims that implementation is deployed.

<!-- prettier-ignore -->
| Evidence class | Verified finding | Consequence |
| --- | --- | --- |
| Repository governing fact | [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) places CRM truth in Asym Postgres and retires Twenty. | No provider read-through or synchronization system for filters/export. |
| Repository governing fact | P3 `phase-03-minimum-permission-role-scoped-projection-foundation.md:186–212,267–274` owns the shared policy/CSV/consent/audit path; P12 `:168,199–214,232` governs current projection, allowed predicates and metered egress. | Visible fields are not automatically exportable; self-download is not outbound contact. |
| Existing ratification | Q05/Q10 define full declared scope, whole gifts, original supported-gift amount, source dates, current access, bounded continuation and no numbered pagination. Q08 separately owns document entry. | Q20 refines continuity and execution, not financial meaning or document architecture. |
| Developing P23/P24 authority | P24 D58 in the [decision log, lines11695–11704](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/prds/sitestacker-parity/phase-24-multi-site-management-decision-log.md#L11695) keeps private account layout/navigation/forms/security Core-owned; P23 preserves authenticated product owners. | Use existing bounded brand inputs and Maia product composition, not a tenant CMS dashboard/filter builder. |
| Repository/OpenSpec fact | Current contribution-operations OpenSpec `spec.md:252–265` describes staff bulk-action results, not donor export default or permission. P3's later all-history-default prohibition at436 belongs to the Missionary Support Feed amendment. | Neither is a conflict with this donor All available proposal. |
| Current implementation | Donor History `page-content.tsx:192–241` has statement/year UI; bounded search did not find a complete donor governed CSV action. | Do not claim this feature is implemented. |
| Current implementation | `packages/ui/components/shadcn/data-table/utils/export.ts:57–112` serializes local selected/filtered/core rows and visible columns. | A plausible CSV can be incomplete and unauthorized if reused unchanged. |
| Current implementation | Shared facets use local table rows; date presets use browser dates; donor-history DB collection is an eager transitional collection with capped source/key/schema limitations. | Reuse the shared boundaries while replacing these reached assumptions with source-qualified contracts. |
| Current local CLI fact | Windows Supabase CLI2.115.0 queried six metadata sets; PostgreSQL17.6 has only10 recorded migrations, through20260227060000. | This local database cannot certify current target security or exporter behavior. |
| Verified external capability | ReUI's live Base UI demos have compact editable filter values; the expanded FAQ explicitly says they filter fixture data in memory. | Adopt visual composition; use Core's source for actual filtering. |
| Product judgment | Start from applied scope; keep changes independent; use proposed finite lifecycle defaults. | Requires ratification and later falsifiable target proof, not invented donor feedback. |

### Supabase CLI findings and their exact limit

The requested Supabase skill was read, actual CLI help inspected, and `supabase db query --local` used against the identified local stack. One attempted multi-statement read-only transaction was rejected by the prepared-query interface; six subsequent single-statement metadata SELECTs succeeded. No business rows, hosted data, secrets or Storage contents were read; no migration/reset/start/upgrade/remediation ran.

Locally, `donors`, `donations` and `donor_pledges` have RLS enabled, FORCE false, anon/authenticated SELECT and a public-read `USING(true)` policy. Direct authenticated financial INSERT/UPDATE/DELETE privileges were absent on these three. Seven email/outbox tables have RLS disabled with actual anon/authenticated SELECT and at least one DML privilege. April/June hardening exists in source but is not applied in this local migration history. These are concrete **stale local catalog findings**, not a claim of production exposure or an executed exploit.

The CLI refreshed one tracked generated version-cache file; only that CLI-created change was restored. The five pre-existing setup changes remain preserved. A sanitized evidence appendix is in the bundle. Current Supabase docs distinguish grants, RLS, exposure, views and effective definer privileges. An omitted `WITH CHECK` can inherit `USING`; `SECURITY DEFINER` does not universally bypass every policy merely by its spelling. Check actual owner/BYPASSRLS/FORCE/grants and the resulting mutation states. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html).

The current [Data API grant rollout](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically) does not retroactively remove existing permissive grants. Explicit migration grants and effective-policy tests remain necessary. Private Storage supports several access methods; for this file, current-authenticated application admission is preferred over an exposed reusable signed URL whose validity can outlive changed account rights. [Private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals), [download behavior](https://supabase.com/docs/guides/storage/serving/downloads).

## Donor journey J01–J16

Example names, dates and amounts below are illustrations, not observed donor records.

<!-- prettier-ignore -->
| ID | Donor experience | Required behavior |
| --- | --- | --- |
| J01 | Maria opens Giving history. | Keep Q10's current context/default/return anchor. Date, Fund and Gift amount are easy to find. Unknown, unavailable and zero results are distinct. Download does not depend on having scrolled all rows. |
| J02 | She chooses 2025. | A discrete date preset may apply immediately. Source resolves its exact date meaning. Custom From/To dates use one Apply action; typing or opening a calendar has no effect until applied. |
| J03 | She chooses School project and USD25–100. | Search permitted funds, select several with OR within Fund; other categories combine with AND. One compact Apply for multi-select or related amount/currency inputs. No operator builder. |
| J04 | She can see why these gifts are showing. | Visible values identify every active category, including secondary filters. Remove one value or Clear filters deliberately changes the applied query. Incomplete inputs and neutral All available do not count as applied narrowing. |
| J05 | She filters on a phone. | One named Filters sheet stages related changes in one form with Apply filters. Applied values remain visible outside it. Clear inside the editor changes its draft only; closing/Escape discards unsubmitted edits. |
| J06 | She selects Download history. | Copy the applied source-resolved query once. Do not apply an unfinished History edit, capture visible rows or subscribe this proposal to subsequent History changes. |
| J07 | She reviews a short summary. | Show current giving context, exact dates and all narrowing values. Explain all matching available records are included. Show a count only if qualified; no costly mandatory count or fake estimate. |
| J08 | She changes the download to all funds. | Change filters reveals familiar controls within the same task. Apply updates only the download proposal. Removing Fund keeps Date/Amount unless explicitly changed; Clear all download filters resets only this proposal within its authorized context. |
| J09 | She corrects a mistaken range. | Keep typed invalid values and local guidance. Never silently swap bounds, truncate decimals, choose another currency or discard a forbidden filter. Requalification offers privacy-safe current choices. |
| J10 | She selects Download CSV. | Current server admission freezes the exact accepted request. No extra consent checkbox for ordinary own-record download. Duplicate clicks/lost acceptance responses recover that same request. Opening the summary alone creates no export. |
| J11 | She sees Preparing your file. | Keep scope visible and local progress truthful. No invented percent or completion time. Close leaves accepted work running; a separately labeled Cancel file preparation cancels only this export. |
| J12 | Her file becomes ready. | The initiating gesture may complete a browser download when supported; otherwise show Download CSV. Never auto-download on rerender, return, replay or another tab's completion. Ready means available, not saved to the donor's device. |
| J13 | She leaves and returns later. | Opening Download history still starts with the CURRENT applied filters as the primary proposal. If a retained active/recent request exists for this exact initiator/context, show a separately labeled compact View preparation/View previous file item. Opening that item recovers its result, not a new proposal. Show its exact scope only while the private payload is retained and currently authorized; after erasure, show permitted minimal outcome/time/reference and offer a new current proposal. One-active-preparation admission may require finishing/canceling existing work before another request, but never replaces the new scope invisibly. No export center is added. |
| J14 | Her connection fails during download. | Retry the same exact ready file while permitted and unexpired. If preparation's outcome is uncertain, read the same request before offering a new one. Terminal failure/expiry uses a fresh reviewed request, not an automatic wider extraction. |
| J15 | She opens the spreadsheet. | Each qualified History root appears once; split matches do not multiply the original gift amount. Show source date/state/currency and distinct original/requested/adjustment meanings. A quiet Receipts & statements link serves official-document intent. |
| J16 | She returns to History or changes account context. | Preserve History filters and safe logical position. Logout/context loss retires protected drafts/caches and late responses. Reauthentication recovers only a currently authorized owned request, without renewing its dates or scope. |

### Filter meanings and behavior

<!-- prettier-ignore -->
| Control | Exact donor meaning | Important boundaries |
| --- | --- | --- |
| Date | All available; This year so far/YTD; Last year; a source-qualified available year; Last12months; custom inclusive range. | Use Q10's source date kind/civil timezone. The copied resolved interval stays fixed even across midnight; data-as-of is separate. Unknown dates remain reachable under All available. Calendar is optional convenience; typed dates work. |
| Fund | Permitted missionary/project/designation facts from the full authorized source scope, with safe historical/archived labels where admitted. | OR within selection, AND across categories. Match at least one permitted allocation, return the whole qualified root once. Duplicate names require a safe disambiguator, never a private location/staff label. Facets do not depend on loaded rows. |
| Gift amount | Original positive non-fee-cover supported-gift amount before refunds, in one explicit original currency. Exact or inclusive From/To. | Blank means unbounded, not zero. Only source-proven comparable requested amounts can match pre-posting records, labeled Requested amount. Unknown/noncash/forbidden values are not fabricated as zero. No float/FX/fee/net/deductible reinterpretation. |
| Currency | The source currency of the compared amount; meaningful independently when no numeric bounds are present. | One known permitted currency can prefill visibly. Multiple currencies require a deliberate choice for amount comparison. Currency and bounds form one coherent input group. Removing/changing currency must visibly handle dependent bounds; never silently convert or drop them. |
| More filters | Existing source-qualified History status, giving type, permitted payment-method descriptor, Site and other Q10-approved fields. | Hide unsupported choices. History status differs from active/paused recurring terms. Unknown classification is not One-time. A Site filter is not a Tenant or legal-donor switch. No arbitrary provider IDs, internal notes, location or CRM field search. |
| Find a gift | Optional bounded search over source-approved donor-facing reference/wording. | Search the declared authorized source, not the virtual window. Server allowlist/length/complexity rules apply; browser Find is not full-history search. |

**Amount example:** a USD100 gift has USD40 to School and USD60 to another permitted project, plus USD3 fee cover. School matches the gift once. Gift amount USD100 matches; USD40 and USD103 do not. A matched-allocation value can explain USD40, while the original supported gift remains USD100. Neither hidden siblings nor a forbidden parent amount may influence visible matches, counts, summaries or CSV values. A user is not forced to understand these mechanics: concise labels distinguish Gift amount, Requested amount and matched-fund amounts only when relevant.

**Reset semantics:** outside a form, Remove/Clear filters applies a new History query. Inside a form, Clear dates/Clear selection edits that draft until Apply. Inside Download, all edits remain download-only. Removing currency while numeric limits exist offers an explicit supported replacement or removal of the amount constraint in the same form; no invisible dependency cascade. On a zero-result response, keep the actual filters and offer Change/Clear. A query failure is never zero results.

## Reviewed Maia presentation defaults V01–V10

<!-- prettier-ignore -->
| ID | Presentation rule |
| --- | --- |
| V01 | Reuse exact shared shadcn/Base UI Maia components/tokens. A quiet text-labeled filter toolbar and readable table/mobile rows fit the existing account shell; no new visual theme or staff-style action rail. |
| V02 | Show applied values with contextual Remove names. Prefer visible wrapping for this small controlled vocabulary; longer permitted selections may use a clearly named disclosure. A count is supplementary, never the only indication of scope. |
| V03 | Use ordinary fields, searchable checked fund choices and plain date/amount labels. No `is any of`, nested AND/OR tree, arbitrary operators or empty-condition rows in the donor interface. |
| V04 | Desktop uses compact contextual forms; mobile uses one accessible Filters sheet. Do not nest a modal sheet over another modal to edit a download; use its same content area and a clear return to summary. |
| V05 | Download opens a short scope summary with one primary Download CSV and secondary Change filters. Preserve every effective narrowing choice. Large titles, charts, warning banners and mandatory acknowledgements add no value here. |
| V06 | Resolve relative dates into readable localized ranges; display original currency unambiguously. Long names/diacritics and ambiguous dollar symbols remain readable at zoom. Do not expose the internal query, source IDs or authorization vocabulary. |
| V07 | Local validation keeps entered values, associates an error with the affected field, and offers a concrete correction. Submission failure has an accessible summary where useful; no toast-only error or focus theft during ordinary typing. |
| V08 | Preparing/Ready/No matches/Unavailable/Expired are distinct local states. Show accepted scope and source as-of only while retained and currently authorized, and availability expiry where relevant. After payload erasure, a minimal terminal summary does not reconstruct private filter values from audit. No invented progress bar, urgency, unread badge or congratulatory financial-success message. |
| V09 | Use an ordinary semantic table/list, visible focus, contextual controls, keyboard escape/return, sufficient touch targets and reduced-motion treatment. Virtual rows retain logical identity; a small filter form/three-row preview is not virtualized. |
| V10 | Filename is neutral, such as giving-history-2026-09-08.csv, with safe collision suffix if needed. It excludes donor email, private ministry/search terms and raw provider IDs. A brief supporting line explains the extract; Receipts & statements stays an ordinary link. |

The normal example can read:

> **Download giving history**  
> **Dates:** 1 January–31 December 2025  
> **Fund:** School project  
> **Gift amount:** USD25–100  
> Includes all matching gifts available in your current giving account.  
> **Change filters** · **Download CSV**

If the owner cannot make that exact gift/account claim for a represented or mixed record type, use its qualified record/context wording. Copy is an illustrative presentation default, not permission to hide qualifications.

## TanStack: current releases and one source of each fact

The following npm `latest` releases were checked on8September2026. **Stable Table9.2.4 was already documented in ratified Q10 and is reconfirmed here**; it is not a newly discovered resolution of an alleged earlier stable-release gap. No package was installed or upgraded.

<!-- prettier-ignore -->
| Package family | Current verified release | Core inspected state | Required role |
| --- | --- | --- | --- |
| Table | react-table/table-core **9.2.4** |9.0.0-beta.9| Shared semantic presentation; source-owned filtering/sorting disables competing client processing. |
| DB | db **0.8.7**, react-db **0.3.7**, query-db-collection **1.2.12** |0.6.4 /0.1.82 /1.0.35| Bounded normalized read-only materialization of admitted History rows. |
| Query | react-query/query-core **5.102.8** |5.99.0| One network/cache owner for source traversal and export request/status. |
| Store | store/react-store **0.11.1** |0.11.0 at shared Table;0.9.3 also through older Form| Scoped in-memory export/filter interaction draft only. |
| Virtual | react-virtual **3.14.11**, virtual-core **3.17.9** |3.13.23| Long-list rendering, stable keys/measurement/focus; not source pagination or memory policy. |

Peer metadata admits current React19.2.3 and the candidate adapter/core set. This is **metadata compatibility, not a passing upgrade**. Keep exact reviewed lockfile resolutions, the shared `tanstack.ts` boundary, and compatibility proof across all reached consumers. Do not force old Form's Store to deduplicate into an incompatible version or require unrelated TanStack products to share a version number.

Current official [Query Collection documentation](https://tanstack.com/db/latest/docs/collections/query-collection) supports on-demand subsets and wrapped response extraction. Preserve the owner's cursor/currentness envelope and distinguish full-snapshot replacement from incremental subsets. One existing QueryClient backs the collection; do not simultaneously run an independent infinite loader and an auto-fetching collection for the same traversal. [Table server-processing guidance](https://tanstack.com/table/latest/docs/guide/client-side-vs-server-side) does not make a local filtered row model a full-source result.

Scope Query keys, DB materialization and Store instances by the exact current actor/Tenant/giving context and relevant query/version. Current [Store React guidance](https://tanstack.com/store/latest/docs/framework/react/quick-start) supports focused selectors; its global-store examples do not authorize a shared SSR singleton holding private donor drafts. DB cleanup alone is insufficient: unloaded subset keys can remain cached, ignored aborts can finish and other observers can keep a key alive. Cancel/remove the protected Query prefix, dispose the scoped materialization/draft, and independently reject late generations.

Bound transport size, retained Query envelopes, DB rows/subsets, concurrent work and Virtual DOM separately, preserving Q10's qualified backward/anchor recovery. The [Virtual API](https://tanstack.com/virtual/latest/docs/api/virtualizer) helps rendering; it does not fetch everything, authorize data, produce full counts or implement CSV. No new browser financial-table realtime subscription is needed.

## Source, database and export execution contract

### Ownership and minimum logical model

<!-- prettier-ignore -->
| Fact | Authoritative owner | Client/artifact meaning |
| --- | --- | --- |
| Tenant, human actor, current personal/represented subject and grants | Existing identity/context + P12 PDP | Derived from trusted current context; submitted IDs are proposals, never grants. |
| Gift/occurrence/adjustment, date, original amounts/currency, safe allocation representation | Existing History sources, including P13 and applicable recurring/identity owners | Read-only projection; do not recalculate financial truth from current labels, cart or Stripe. |
| Allowed filter grammar/facets/order/coverage | History source under P12 | One typed query contract reused for browsing/export; export's stricter field/purpose floor still applies. |
| Exportable census, accepted scope, request/result and egress evidence | P3 governed export owner using P12 | A narrow operational record, not a financial transaction or official document. |
| Completed exact file | Private Storage, associated by P3 request/object identity | Temporary immutable extract, never a source ledger or receipt. |
| Draft controls / transport / working rows / presentation | Store / Query / DB / Table+Virtual respectively | Disposable UI state or caches; no permission, money or durable-result authority. |

Use one source-owned request/result record plus existing worker claim/outbox and private object metadata. Persist only what is required to recover and enforce the accepted request: immutable context/purpose, typed normalized scope/date semantics, schema/census version, idempotency digest, accepted/deadline timestamps; state/revision; exact artifact identity/hash/size/row count/as-of/coverage; original ready/expiry timestamps; minimized result/correlation. Temporary extraction/row-field manifests are permitted only to prove consistent output/current access, remain private and expire with the payload. Purpose-driven payload erasure creates a minimal terminal tombstone; it cannot reinterpret or reassign the accepted request. Do not add a second grant table or copy the financial ledger.

Requirements for the owning schema/mutations:

- Required non-null context and explicit source types; no default/global Tenant, email-as-identity or arbitrary polymorphic ID relationship. Same-Tenant composite relationships and exact subject/actor ownership must be enforced. Legal Entity remains a financial owner fact, not a filter-driven reassignment.
- Unique durable semantic request identity within the trusted initiating scope; identical retries return its outcome, conflicting payload under that identity rejects. New admission additionally requires a server-issued, tamper-evident review envelope bound to that identity, normalized scope/census, trusted initiating context and an absolute expiry. It can be issued statelessly with the existing review, without starting export. Verify expiry even when no old correlation row exists; an arbitrary aged idempotency key is not sufficient new admission. One active preparation per exact initiating context is a proposed concurrency default; reuse an existing same-scope active request or make Cancel/new scope explicit. P12 per-principal/purpose/Tenant metering remains authoritative.
- One completed artifact per request; Ready requires complete verified bytes and its required metadata. Check valid state/timestamp combinations; use expected revision/claim fencing for transitions. Context/scope/census/as-of are immutable once accepted/frozen; no permitted update can reassign ownership or replace Ready bytes.
- Source money stays integer minor units or its existing exact numeric type with explicit currency exponent. Serialize exact decimal text; no JavaScript floating-point round-trip, locale-grouped input stored as money or blanket two-decimal assumption.
- Least-privilege table/function/Storage grants, required ENABLE+FORCE RLS under Core's isolation contract, safe views (`security_invoker` where exposed), narrow function EXECUTE and fixed safe search paths. Inspect USING and effective WITH CHECK and column mutability. Donors do not directly write state, audit, manifests or storage objects.
- Server commands derive actor/Tenant/subject/purpose/audit attribution; an internal worker/service role still re-proves the original request's current authority. RLS cannot replace field-level projection or current business authorization. Privileged paths and invoker paths must enforce the same result.
- Index actual scoped selection/order and request identity/state/deadline/expiry operations. Choose fund/allocation and amount/date indexes from representative EXPLAIN evidence; do not add every speculative filter combination or create a long transaction across human interaction.
- Purging a temporary request/file never cascades to gifts, receipts, people or grants. Minimal audit retains its own source references/purpose rules. Required holds can retain restricted custody without leaving the expired donor download available.

### Complete preparation, access and temporal correctness

The accepted scope freezes the reviewed concrete interval and filter semantics. Before new admission, the server verifies the reviewed envelope's signature/binding/expiry and current authority. An expired envelope cannot start another export even after the 30-day correlation record has been purged. Refreshing a proposal deliberately for a new request produces a new current envelope/identity; a transport retry must never silently do so. Existing accepted work can still be read/recovered through its current-authenticated operation endpoint after envelope expiry. Keep the envelope out of URLs, persistent browser storage and logs; it is neither a download capability nor a new authentication system.

Source extraction then establishes an explicit coherent **data-as-of** view. A maximum timestamp/sequence or keyset cursor alone cannot prove this under late commits, corrections or backdated imports. Use the simplest supported bounded consistent extraction (or an existing source-version snapshot that proves equivalent membership/values), and record that evidence. A bounded read-only repeatable-read extraction over canonical Postgres projections is a concrete suitable starting point; close it before final publication or human download. A manifest records its proof but cannot make independently inconsistent reads coherent. Do not maintain a database snapshot across donor scrolling/review or make per-row provider calls while holding locks.

Prepare in private. All selected roots and allowed columns must be serialized successfully before Ready. Record exact byte hash/size, emitted record count, schema/census and source as-of/coverage. Upload success alone is insufficient: publication is an atomic/fenced association after completeness, current policy, cancellation and deadline checks. Unknown uploads reconcile through exact request/object identity; an unclaimed object cannot become a donor download.

<!-- prettier-ignore -->
| State or transition | Valid behavior |
| --- | --- |
| Proposal → preparing | Deliberate current-authorized admission freezes one request; local draft is not a persisted financial instruction. |
| Preparing → ready | Complete immutable artifact plus current access/completeness proof before the absolute deadline. |
| Preparing → empty | Successful complete query has no eligible matches; show no matches, no fabricated failed-query zero file. |
| Preparing → blocked/failed/canceled/expired | Typed safe outcome, no late Ready; retryable internal attempts remain within the same original deadline. |
| Ready → downloaded | Download is an access event, not a terminal source state. Same immutable result remains Ready while current and unexpired. |
| Ready → invalidated/expired/canceled | Deny further bytes; remove temporary material under cleanup policy. Cancellation here means discard this file, never cancel giving. |
| Terminal → new request | Requires a deliberate newly reviewed current proposal. Old attempts cannot resurrect the terminal request. |

Before first bytes, freshly prove current request ownership/context, field/row access, artifact identity and expiry. Continue under P12's existing bounded egress/stream-token renewal rules; relevant authority loss prevents future admitted chunks. A relevant row/field/sensitivity/legal-subject contraction invalidates the whole artifact, rather than silently removing content from the reviewed file. Unrelated policy changes and ordinary later gifts/corrections do not rewrite a truthful as-of extract. Once bytes have reached a donor, the system cannot recall them; audit must not claim otherwise.

Use an authenticated application download endpoint with private/no-store responses and neutral attachment headers; never expose a reusable bearer Storage URL, raw object path or service credential. Status/read GET cannot create a new export. Any supported retry/range access must name and authorize the same exact artifact; it cannot splice generations. Reauthentication restores current admission, not old permissions or a renewed expiry. Returned errors do not reveal another account's request existence.

**Finite proposed defaults:** queue time is included in the 10-minute preparation deadline. Artifact expiry is 24 hours after the first Ready; reading does not renew it. Failed/incomplete preparation payload expires no later than 24 hours after acceptance; canceled/invalidated payload is queued for prompt deletion. Access denial is immediate at the boundary even if physical purge is delayed. Minimized operational correlation expires 30 days after acceptance; no sensitive filter values or row manifest remains just to help deduplicate. Existing durable security/egress evidence and holds retain their own policy. After payload erasure, a later Create again shows a new current scope proposal; it cannot pretend to recover deleted original filter details. A stale retry after correlation has expired cannot automatically mint a new export; return refresh/new-review-required. A narrow current/recent result summary is enough for return—no permanent download library.

These fixed deadlines are execution/availability limits, not target waiting times. A normal small file should become ready promptly under the qualified workload. If a review has sat open beyond its admission window, retain its safe draft, say the review needs refreshing and let the donor refresh/confirm it; do not silently discard choices, advance relative dates or submit a newly minted operation as a transport retry.

### CSV grain, fields and spreadsheet behavior

**One row per owner-qualified Q05/Q10 History root**, not one per allocation, attempt or provider event. A pending/failed source record may be included only under History's qualified record model; it must not pretend an issued Contribution exists. An import/recognition/noncash record keeps its distinct meaning. Payer-of-record/legal donor versus program attribution remains governed by [ADR-0003](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0003-payer-of-record-is-the-legal-donor.md).

P3 and History must adopt a versioned fixed donor field census before activation. Recommended base: donor-safe Record reference; source Date and Date basis; Record/giving type; source Status as of extraction; Currency; original supported Gift amount when known/authorized; distinct Requested amount for an admitted pre-posting record; safe Funds/allocation summary; and source-proven material changes/refund summary where applicable. A fund-filtered file preserves separate whole-gift and matched-allocation meanings where permitted. Do not repeat a parent total for each line, combine unlike currencies, infer deductible/net totals, invent an original date, or leak hidden siblings through totals/summary placeholders. An unknown value is not zero; a prohibited value is not recoverable through a filter/count. Final technical column spellings may be localized/versioned through the owner; the meanings and single-root grain above are requirements.

Use the one shared P3 serializer. Current `packages/lib/csv.ts` has useful quoting/BOM/CRLF infrastructure but ordinary numeric -5 currently becomes apostrophe-prefixed text, and full-width formula triggers are not covered. Refine the shared typed-cell contract: validated **source-generated canonical finite decimal** cells can use numeric serialization; arbitrary strings, labels, dates and identifiers remain protected text. Never let a caller mark an arbitrary formula as numeric. Preserve sign, currency exponent and exact minor-unit value without rounding.

Current [OWASP CSV guidance](https://owasp.org/www-community/attacks/CSV_Injection) covers full-width leading formula characters and warns that save/reopen can defeat common escaping. No universal safety claim for every spreadsheet/roundtrip is justified. [Microsoft documents Excel's15 significant digits](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers): values beyond the supported numeric contract require exact protected text, not silent rounding. UTF-8 BOM/CRLF and robust quoting should be exercised with long names, commas/newlines/quotes and supported Excel/Sheets import paths. No donor encoding/delimiter/security-settings wizard is needed. Do not invent a second donor serializer or XLSX scope solely to hide the existing shared requirement.

## Individual adversarial category review

Severity is qualitative impact if the failure occurs; likelihood describes the observed or plausible conditions, not measured production incident rates. Exact quoted C requirements below are intended execution language. Repeated cross-domain concerns are evaluated independently because their failure mechanisms differ.

### C01 — Problem validity, necessity, and alternatives

**Material concern:** Yes—scope continuity is useful, but hidden carryover can export the wrong subset. **Severity:** Moderate for wrong task result; high if mistaken for complete giving. **Likelihood:** Plausible when a donor forgets an old filter; no Asym frequency measurement.

**Evidence/reasoning:** Church Center supports filter→CSV; Monzo supports fresh scope. Q05/Q10 already reject loaded-row exports. A clearer default plus Change handles both workflows; no-build/current statement entry does not supply a complete filtered spreadsheet.

**Effect:** Accept A with visible scope; do not replace it with B or freeze a reporting platform. **Permanent prevention:** Preserve applied intent and review the one-off scope.

**Required language:** “C01 — Initialize Download from the currently applied source-resolved History query once. Show all effective narrowing and allow independent edits before deliberate request. Neither opening Download nor changing its draft changes History or starts export.”

### C02 — Brittleness

**Material concern:** Yes—draft/applied/accepted scope can drift with midnight, another tab, stale rows or old cursor responses. **Severity:** High. **Likelihood:** Realistic browser/network conditions; current date/local-row patterns are source-confirmed.

**Evidence/reasoning:** Applied relative periods already have a source meaning; ReUI can count incomplete conditions. Browser input/display state is not the source query or accepted request.

**Effect:** Narrow execution to immutable accepted semantics. **Permanent prevention:** Separate draft state, resolved query and request; reject late generations and unsafe stale continuation.

**Required language:** “C02 — Copy only complete applied predicates and their resolved date semantics. Later browsing, provider events or worker retries cannot silently alter the proposal/accepted scope. Unsupported, stale or forbidden predicates return typed refresh/correction outcomes, never silent removal or widening.”

### C03 — Technical debt

**Material concern:** Yes—forked filters/serializers and duplicate TanStack state would multiply policy and upgrade work. **Severity:** High. **Likelihood:** Likely if current browser exporters or independent loader examples are copied unchanged.

**Evidence/reasoning:** Core has a shared Table boundary, P3 CSV helper and transitional DB collection; five library names do not mean five sources of truth.

**Effect:** Adopt the requested stack with explicit roles and one shared owner extension. **Permanent prevention:** Reconcile current helper deficiencies centrally; migrate reached shared consumers with proof.

**Required language:** “C03 — Reuse shared Maia/Table/filter/CSV boundaries. Query owns transport, DB bounded admitted materialization, Store ephemeral draft and Virtual rendering. No donor-only policy/serializer fork, duplicate fetch engine, shadow ledger or incompatible forced Store deduplication is permitted.”

### C04 — Edge cases

**Material concern:** Yes—undated imports, hidden/archived funds, multiple currencies, malformed ranges, pending ACH, split gifts and empty results can mislead. **Severity:** High for money/access; moderate for input friction. **Likelihood:** Realistic supported data, not a hypothetical new ministry workflow.

**Evidence/reasoning:** Q05/Q10 distinguish original/requested/unknown amounts and source dates; pre-posting success is not received giving. Export fields must preserve those distinctions.

**Effect:** Specify filter dependencies and file meanings. **Permanent prevention:** Shared typed source predicates and truthful unknown/denied/empty states.

**Required language:** “C04 — Preserve source date kind, exact inclusive ranges, original currency precision and Gift versus Requested amount. Unknown data is not zero. Fund matches whole qualified roots once. Currency/bounds, invalid input and removed options require visible deliberate correction; no implicit conversion or dropped constraints.”

### C05 — Footguns

**Material concern:** Yes—Download can accidentally mean current page, export-on-open, or an old result under new filters. **Severity:** High. **Likelihood:** Current Table helper would produce a loaded subset if used directly.

**Evidence/reasoning:** Generic onlyFiltered/selected/visible-column behavior is not full-source governance; automatic download on rerender can surprise a donor on a shared device.

**Effect:** Require deliberate request and exact result identity. **Permanent prevention:** Source exporter and distinct local result summary.

**Required language:** “C05 — Donor CSV cannot use a client selected/filtered/core row model as its dataset or visible columns as its field census. No automatic export on filter/open/GET, and no automatic download on re-entry, rerender or replay. An old result displays its own retained permitted scope/as-of; after erasure it shows only minimized terminal details and never reconstructs deleted private scope.”

### C06 — Tenant safety

**Material concern:** Yes—cache keys, copied scope, manifests and private artifacts can cross Tenant/actor/represented context. **Severity:** Critical. **Likelihood:** Plausible; current transitional collection keys are insufficient target evidence.

**Evidence/reasoning:** R04 separates human initiator and giving subject; Site/query context does not grant access. Abort alone cannot stop late cache admission.

**Effect:** Preserve exact current context throughout execution. **Permanent prevention:** Trusted scoped identity, composite references, cache/materialization disposal and generation fences.

**Required language:** “C06 — Query, facets, counts, request identity, artifact, audit and byte access bind to the trusted Tenant, initiating human and exact personal/represented giving scope. Context loss retires protected client state and rejects late responses. No scope copy, Site filter or shared email can widen authority.”

### C07 — Database, RLS, and authorization safety

**Material concern:** Yes—RLS labels and service-role routes can hide effective exposure or allow request reassignment/Ready forgery. **Severity:** Critical. **Likelihood:** Conditional on implementation; permissive stale-local metadata is observed, not hosted proof.

**Evidence/reasoning:** CLI checked grants and policies separately; new target tables/services are not implemented in that stack. USING may supply implicit WITH CHECK, but row scope alone does not freeze protected columns.

**Effect:** Require owner schema/privilege proof before activation, not blanket grooming remediation. **Permanent prevention:** Constrained state/context, default-deny direct writes and equivalent privileged authorization.

**Required language:** “C07 — Enforce non-null trusted context, same-Tenant relationships, durable semantic uniqueness, immutable ownership/scope and valid state/artifact combinations. Audit effective grants, RLS USING/new-row checks, views, RPC EXECUTE/search_path and Storage paths. No client write may set actor, purpose, state, artifact or audit attribution; internal bypass paths re-prove current source authority.”

### C08 — Overengineering

**Material concern:** Yes—advanced builders, five competing state managers or an export/report center would enlarge a small task. **Severity:** Moderate to high maintenance cost. **Likelihood:** Plausible given recent ReUI capabilities and multi-library examples.

**Evidence/reasoning:** ReUI advertises nested Boolean trees and staff actions; none follows from a donor choosing a year/fund. Durable completion needs a small operation, not a new platform.

**Effect:** Accept only the bounded roles/lifecycle. **Permanent prevention:** Reuse existing owners and deliberately limit UI vocabulary.

**Required language:** “C08 — Add only the small P3-governed request/result lifecycle needed for a complete recoverable download. No saved reports, schedules, arbitrary columns/operators, tenant-configurable duration engine, new notification family, second workflow framework or virtualization of small forms.”

### C09 — UX/UI and user friction

**Material concern:** Yes—count-only filters, unclear Clear/Apply, nested overlays, endless progress or download ambiguity cause uncertainty. **Severity:** High for unusable accessibility; moderate for ordinary friction. **Likelihood:** Common interface failure modes, with incomplete-count/local-facet examples directly observed.

**Evidence/reasoning:** ReUI gives compact composition, Baymard supports visible applied values, Carbon distinguishes instant/batch filtering, WAI requires actionable feedback. No donor outcome statistics were obtained.

**Effect:** Adopt J01–J16/V01–V10. **Permanent prevention:** Visible scope, one form per task, local state feedback and actual accessibility/comprehension proof.

**Required language:** “C09 — Expose actual applied values and contextual removal; apply related multi-input changes together, preserve invalid edits, and distinguish Close from Cancel file preparation. Maia desktop/mobile paths remain keyboard/touch/AT usable with readable localization, no nested-modal trap, focus theft, toast-only error or forced horizontal discovery.”

### C10 — Source of truth, ownership, and domain invariants

**Material concern:** Yes—a CSV, client collection or prepared file can become a shadow financial source. **Severity:** Critical for privacy/money integrity. **Likelihood:** Plausible without explicit grain/census contracts.

**Evidence/reasoning:** ADR-0001 and P13 own facts; P3 owns egress; current helper reflects presentation. The file is an as-of extract, not receipt/statement or new contribution.

**Effect:** Require the owner matrix and versioned donor field census. **Permanent prevention:** Source-complete root selection and immutable exact artifact.

**Required language:** “C10 — One CSV row represents one qualified History root. Preserve source original/requested/current-change distinctions and exact currency, with no repeated parent totals, inferred deductibility, hidden-sibling arithmetic or financial mutation. P3 owns the export request/census; History owners own all facts; caches/artifacts remain derived.”

### C11 — Hidden coupling

**Material concern:** Yes—download can depend on current browser rows, display columns, marketing consent, Stripe availability or statement generation. **Severity:** High. **Likelihood:** Plausible from existing helpers and similar vendor journeys.

**Evidence/reasoning:** P3 explicitly allows self at contact-consent gate; providers execute/source financial events but need not be queried per export row. P18 is a different document purpose.

**Effect:** Decouple only through established owners, not another abstraction layer. **Permanent prevention:** Typed source proposal and purpose-aware export path.

**Required language:** “C11 — Authenticated self-download is not outbound contact and is not blocked solely by marketing opt-out. It still obeys all export/row/field/purpose gates. Export does not depend on loaded/visible columns, a live per-gift provider call, receipt generation, newsletter state or another role's capability.”

### C12 — Failure modes

**Material concern:** Yes—serialization/upload/finalization loss can produce partial bytes, orphan files or false success. **Severity:** High. **Likelihood:** Realistic distributed failures.

**Evidence/reasoning:** An uploaded object does not prove source completeness or an accepted Ready transition; browser saving cannot be observed reliably by the server.

**Effect:** Require complete private preparation and recoverable exact outcomes. **Permanent prevention:** Stable request/object identity, fenced promotion and safe retry.

**Required language:** “C12 — Expose Ready only after complete serialization, verified artifact metadata and current authorization/finalization. Partial/unknown uploads remain private and reconcile by exact identity. Failed reads are not empty results. Lost responses recover the same request/file; audit says prepared/admitted/served, never guaranteed saved or read.”

### C13 — Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern:** Yes—duplicate clicks, late workers, permission changes or independent page reads can alter scope/results. **Severity:** Critical for egress; high for incorrect files. **Likelihood:** Realistic races.

**Evidence/reasoning:** Source cursor stability differs from coherent as-of extraction; retries and permission tokens have separate lifetimes. Existing worker claims can fence finalization.

**Effect:** Adopt A4/A5 and the explicit state transitions. **Permanent prevention:** Semantic idempotency, coherent extraction, expected revision/current authority and absolute limits.

**Required language:** “C13 — Same accepted identity/scope returns one result; a conflicting scope rejects. New admission requires the server-issued scope/context/identity-bound review envelope within its original10-minute validity, including after old correlation cleanup. Freeze reviewed date semantics and certify coherent data-as-of membership/values. Retries/leases do not extend deadlines or silently mint a new admission identity. Cancel/expiry/access contraction fences late publication and future egress; terminal requests never resurrect automatically.”

### C14 — Data integrity risks

**Material concern:** Yes—join multiplication, backdated correction drift and float/CSV interpretation can corrupt the donor's perceived totals. **Severity:** High. **Likelihood:** Conditional but credible; negative numeric text handling is source-confirmed.

**Evidence/reasoning:** Q10 whole-root/fund amount semantics and currency precision are already ratified; a single loaded row test misses these errors.

**Effect:** Require typed schema/serializer and source reconciliation proof. **Permanent prevention:** Root-first selection, exact decimal serialization and supported-consumer qualification.

**Required language:** “C14 — Verify emitted root membership/count and every monetary field against the qualified source. No allocation fan-out duplicates parent amounts, no mixed-currency arithmetic, false zero, date invention or silent rounding. Validate numeric cells by trusted source type/grammar; all arbitrary strings retain shared text-safety protection.”

### C15 — Security and privacy risks

**Material concern:** Yes—CSV formulas, unrestricted file links, sensitive names in filenames/URLs, long-lived copies or excessive logs expose data. **Severity:** Critical for sensitive ministry data; high for formula execution. **Likelihood:** Known general mechanisms, not an observed attack here.

**Evidence/reasoning:** OWASP qualifies CSV mitigations; private signed URLs are bearer capabilities; record visibility can contract after preparation.

**Effect:** Require current-authenticated bytes, minimized payload lifetime and qualified shared serialization. **Permanent prevention:** No-store authorized endpoint, source-safe fields, opaque storage references, current reproof and verified cleanup.

**Required language:** “C15 — Do not expose reusable bearer Storage URLs, raw private predicates, provider identifiers or donor labels in filenames/logs/analytics. Enforce current row/field/subject access before bytes and during inherited egress renewal. Relevant contraction invalidates the complete artifact. Temporary payload expires independently of minimal audit; no claim can recall already downloaded bytes or guarantee universal spreadsheet safety.”

### C16 — Scalability and performance risks

**Material concern:** Yes—Virtual can hide unbounded client data; lifetime exports/facets/counts can monopolize source resources. **Severity:** High. **Likelihood:** Larger histories/Tenants and concurrent requests are realistic; target capacity is unmeasured.

**Evidence/reasoning:** DB/Query cache lifetime differs from DOM size; exact counts are not free. P12 already supplies egress metering/fairness rather than a new unlimited endpoint.

**Effect:** Require bounded source/browser work and meaningful largest-shape qualification. **Permanent prevention:** Source indexes/plans, coherent bounded extraction, separate client budgets and fair admission.

**Required language:** “C16 — Use bounded authorized traversal and source facets, never full-history browser loading to filter/count/export. Qualify transport/cache/DB/DOM/concurrency bounds independently. Complete the full declared result within the proposed10-minute deadline on the supported release workload; timeout cannot silently truncate or impose a hidden history cap.”

### C17 — Operational burden

**Material concern:** Yes—manual file repair, cleanup, duplicate exports or donor-support interpretation can become routine. **Severity:** High recurring cost. **Likelihood:** Plausible without exact result/expiry ownership.

**Evidence/reasoning:** Local stale migrations already demonstrate environmental proof drift; cloud jobs need ordinary bounded recovery instead of developer data repair.

**Effect:** Require source-owned recovery and declared operational ownership. **Permanent prevention:** Automated exact orphan/purge handling, protected status lookup and fail-closed activation.

**Required language:** “C17 — Preparation, cancellation, same-result retry, expiry and private-object cleanup have one owning lifecycle and support reference. Operators diagnose/reconcile exact requests under existing permissions; no direct donor financial-table repair or routine developer intervention is the normal recovery path. Stale local environments cannot satisfy release gates.”

### C18 — Observability and auditability gaps

**Material concern:** Yes—logs may say success before Ready, count retries as new exports or retain sensitive filter content unnecessarily. **Severity:** High. **Likelihood:** Plausible common instrumentation mismatch.

**Evidence/reasoning:** Artifact publication, byte admission, transport completion and user reading are different events. Existing P3/P12 audit differs from temporary UI status and P17 notifications.

**Effect:** Require accurate evidence with minimized retention. **Permanent prevention:** Correlated source/request/artifact identities and separate attempt/result/access records.

**Required language:** “C18 — Record trusted initiating actor, exact request/result correlation, source/census/as-of evidence, emitted root count and artifact hash/size without raw private rows/filter values in general telemetry. Distinguish attempt, Ready, access admitted, bytes served and failure. Durable audit follows its owner policy;30-day minimized recovery metadata is not a replacement.”

### C19 — Dependency and integration risks

**Material concern:** Yes—current docs copied into older packages, eager subset replacement or casual provider API grants can break behavior. **Severity:** High. **Likelihood:** Concrete version/API differences are observed.

**Evidence/reasoning:** Core Table beta differs from stable; DB0.x adapters have exact dependencies; current cleanup limitations are documented. ReUI demos are client fixtures. Supabase grant defaults are changing.

**Effect:** Require exact shared-boundary compatibility and no casual platform changes. **Permanent prevention:** Lock a coherent release set, qualify adapter semantics and explicit API/grant contracts.

**Required language:** “C19 — Adopt then-current reviewed compatible TanStack adapter/core versions with a locked shared migration, not floating runtime latest or pasted beta-incompatible examples. Preserve source envelopes/subsets/currentness and explicit grants/RLS. ReUI source adoption requires its applicable license and shared Base UI/Maia compatibility; inspiration alone adds no dependency.”

### C20 — Migration, rollout, and upgrade risks

**Material concern:** Yes—new UI can reach old raw export/schema paths; rollback can resurrect a bypass or expose new artifacts. **Severity:** Critical for egress; high for reliability. **Likelihood:** Plausible mixed-version deployment.

**Evidence/reasoning:** Existing #491/#493/#495/#496 remain open; local catalog lacks later hardening. Package metadata is not N/N-1 or endpoint proof.

**Effect:** Block target activation until owner and migration proof, keep current safe document paths. **Permanent prevention:** Additive schema/contracts, qualified consumers, deny-by-default flags and safe kill switches.

**Required language:** “C20 — Deploy owner schema/grants/source/serializer/request/download contracts before enabling the donor action. Prove N/N-1 compatibility and forward migrations; deny unsupported versions. Disable new preparation and artifact egress independently when needed, while cleanup/audit continue. Rollback must never re-enable raw client export or broaden protected file access.”

### C21 — Testability, traceability, and proof

**Material concern:** Yes—documentation, fixture demos, latest-version lists or stale-local RLS checks can be mistaken for end-to-end proof. **Severity:** High. **Likelihood:** Material risk given current incomplete target.

**Evidence/reasoning:** This review performed real metadata queries and ReUI interactions, but no Core donor exporter, supported spreadsheet roundtrip or production-shaped workload test exists from this session.

**Effect:** Require falsifiable T proof families and explicit artifact status. **Permanent prevention:** Trace Q20→terms→owner amendments→OpenSpec/design/tasks→existing issues→implementation/release evidence only when publication is authorized.

**Required language:** “C21 — Preserve the distinction between selected direction, ratified execution and shipped proof. Each C/J requirement maps to source/API/SQL/interaction or operational acceptance outcomes. Source inspection, registry metadata, local CLI catalogs and external demos cannot substitute for target authorization, concurrency, completeness, accessibility and migration tests.”

### C22 — Other development hazards

**Material concern:** No additional independent hazard found after checking financial side effects, authentication scope, document/legal meaning, CMS/private-page boundaries, license/import assumptions and rollback/repair paths. Existing unresolved dependencies still matter. **Severity:** No new independent impact rating; inherited hazards retain their ratings. **Likelihood:** No separate claim of absence in uninspected future implementation.

**Evidence/reasoning:** CSV preparation need not mutate giving, send newsletters, issue tax documents or add an auth flow. Q14 G01 remains an unresolved native identity-linking contract, not merely missing tests; this export decision cannot solve or waive it.

**Effect:** Keep scope bounded and retain existing gates. **Permanent prevention:** Source-purpose boundaries and traceability, not speculative extra infrastructure.

**Required language:** “C22 — Q20 creates only the reviewed history-filter/download capability. It does not mutate financial facts, official documents, identity linking, communications or private CMS ownership. Preserve Q14 G01 and all relevant prior owner gates; do not turn this ratification into implementation or publication authorization.”

## Proof required before activation: T01–T18

These are independently testable acceptance outcomes, **not tests run during grooming**. Reuse the repository's real harness and reached shared seams rather than tests that merely restate this document.

<!-- prettier-ignore -->
| ID | Falsifiable outcome |
| --- | --- |
| T01 | With2025/FundA applied and a2026 editor draft open, opening Download proposes2025/FundA; changing it to All funds leaves History unchanged. Another tab/preset/midnight cannot alter the accepted request. |
| T02 | Date boundaries cover leap day, month/year rollover, source timezone/DST and undated imports; currency0/2/3-decimal bounds, blank/zero/reversed values and currency-removal dependencies produce exact source matches and clear UI. |
| T03 | A result larger than the old250-row cap and the retained/virtual window exports every qualified root exactly once. Fund/amount/split/refund/pending/import/recognition cases match the reviewed meanings, without hidden sibling inference. |
| T04 | Own-record self-download succeeds despite marketing opt-out when otherwise allowed; anonymous, other actor/Tenant, wrong represented scope, restricted field/predicate and over-budget cases deny without existence/count leaks. |
| T05 | Real migrated database catalog/pgTAP/API tests verify composite references, immutable ownership, uniqueness, legal state combinations, USING/effective new-row checks, grants, views/RPCs/service paths and private Storage denial. The10-migration local stack is not that fixture. |
| T06 | Same-key concurrent admission/double-click/lost-response delivery produces one request/result; different scope under same identity conflicts. Both cancel-versus-ready and expire-versus-late-worker race orders preserve the invariant. |
| T07 | Insert, backdate, refund, merge and source correction during extraction yield one coherent as-of result or explicit retry-required, never a union of inconsistent pages. No sequence-max timestamp assumption passes as snapshot proof. |
| T08 | Relevant permission/field/sensitivity/subject contraction before preparation, Ready, first bytes and stream renewal prevents future egress and invalidates the artifact. An unrelated policy change does not unnecessarily rewrite a valid as-of result. |
| T09 | Fault injection at serialization, upload, object verification, database finalization and response loss never exposes partial success; exact orphan/result recovery works without a second financial/export effect. |
| T10 | Download retry/range if supported returns the exact same qualified bytes/hash. Browser blocking/background/reload/re-auth never auto-starts a replacement or claims saved-to-device. |
| T11 | Trusted fixed-clock boundary tests distinguish10-minute review-envelope validity from10-minute accepted preparation, enforce24-hour Ready availability, failed payload deadline and30-day minimized correlation. After deleting the old correlation, replaying its expired admission envelope creates no request. Reads/retries cannot renew clocks; envelope expiry does not erase accepted work. Expired byte access denies even during purge failure/hold. After private scope erasure, the UI never reconstructs it from audit. |
| T12 | Shared serializer vectors include negative exact amounts, large precision/IDs, quotes/newlines/separators, international names, leading whitespace/full-width formula characters and supported Excel/Sheets opening/import. Record save/reopen limitations honestly; no silent rounding or formula execution in supported paths. |
| T13 | Shared Table stable migration, Store selectors/SSR isolation, Query↔DB subset replacement, eviction/unloaded-key cleanup, ignored abort and cross-context late responses pass public-seam tests on the locked compatible set. |
| T14 | Keyboard and supported screen readers complete filter→review→edit→prepare→download→Back, including mobile sheet, focus return, zoom/reflow/reduced motion and long labels. Virtual continuation/backward recovery remains Q10-compliant. |
| T15 | Production-shaped source plans/load tests record actual largest supported history/currency/fund mix, tenant skew, concurrent admissions, resource usage and completion within deadline. Zero silent truncation; P12 fair metering and cancellation bound pressure. |
| T16 | Audit traces distinguish attempt/Ready/admission/served/failure with trusted actor/scope and minimal data. No private filters/emails/provider IDs appear in logs, URLs, filenames, analytics or notification bodies. |
| T17 | Additive migration/backfill/N/N-1/feature-activation/kill-switch/roll-forward tests cannot reach old raw exporter or grant broad access. Source rollback preserves audit and cleanup for already accepted requests. |
| T18 | Donor comprehension sessions verify users can identify date/fund/amount scope, change only the download, distinguish no matches from failure and Ready from saved, and understand gift versus allocation amount. Any misunderstanding that causes wrong-scope export is a release-blocking UX defect; do not label this research as completed user feedback. |

## Ruthless synthesis: order, dependencies and monitoring

### Resolve before recording the corrected answer

The user selected A; retain it. Record the explicit owner extension, all-five-library role split, ReUI adaptation, complete-source file semantics and proposed duration defaults as **awaiting ratification**. The draft-as-applied ambiguity, Table stability claim, local/hosted database distinction, self-contact gate and misapplied Missionary Feed rule are resolved by the evidence above. No additional independent product question is needed before presenting this corrected Q20 decision.

### Capture in the developing spec/design when publication is authorized

1. **Authority first:** reconcile P3/P12/History field/filter census, source snapshot and exact scoped request/artifact lifecycle through existing #491/#493/#495/#496 and relevant History owners. Fix semantic money/text serialization centrally. This precedes a donor button that could otherwise export a plausible unsafe file.
2. **Source and storage next:** adopt the minimal schema/grants/current-authority/worker/finalization/download/purge contract and timing defaults. Establish snapshot completeness and current reproof without a shadow ledger or long human-held transaction.
3. **Shared client boundary:** qualify current compatible TanStack releases, one Query/DB adapter, scoped Store draft, manual source Table processing, Virtual bounds and reachable accessibility continuation. Core's exact Maia/private-product authority remains.
4. **Donor composition:** implement J/V behavior using that shared source, one local download workspace and small return summary. No new email/bell/report destination.
5. **Prove, then activate:** T01–T18 and existing owner gates precede target activation. Stage by the existing feature mechanism, keep safe official-document navigation available, and retain separately controllable preparation/egress shutdown with cleanup and audit running.

No canonical ADR/OpenSpec/issue body was changed during this grooming review. Later authorized publication must map Q20 A/J/V/C IDs into the owner amendment(s), glossary, requirements/scenarios, design/tasks, current issue bodies and release evidence. Existing issue text is reconciled with later authority before implementation; no duplicate issue is needed solely because a gap was found. Q14 G01 remains independently unresolved and cannot be bypassed for affected social-login activation.

### Risks that may be monitored after the hard gates pass

These are proposed initial operating thresholds, not observed rates or substitutes for release proof. Role owners must be assigned to actual people in the release roster. An access leak or corrupt/incomplete CSV is never accepted merely because its observed rate is low.

<!-- prettier-ignore -->
| Signal | Threshold | Named accountable owner | Response |
| --- | --- | --- | --- |
| Cross-context/forbidden row-field egress or Ready/source completeness mismatch | Any confirmed occurrence | P3 export owner + security incident owner | Disable affected export egress/preparation, contain private artifacts, investigate exact request/census/source evidence and require regression proof before restoring. |
| Preparation deadline failures | Two for the same Tenant in24h, or more than1% of at least100 admitted requests in rolling24h | P3 export service owner | Inspect source/queue plans and fairness; roll forward the bottleneck or keep affected preparation unavailable. Never truncate or tell donors to split scope as the permanent fix. |
| Expired/canceled/invalidated payload still physically present | Any object overdue by more than15minutes beyond its scheduled purge time | P3 storage/operations owner | Access stays denied; retry exact deletion/orphan reconciliation, investigate worker failures and verify disposal. A lawful hold routes to restricted custody under its owner. |
| Donor filters/download interaction performance | p75 exceeds the good Web Vitals boundary: INP200ms, LCP2.5s or CLS0.1, in a rolling7-day window with at least100 valid samples per metric/device class | Phase25 frontend owner | Inspect the reached bundle, selectors, source wait, layout and render window; fix regressions. Below minimum samples, report insufficient data, not green. Thresholds use standard Web Vitals; observation window/sample minimum are proposed product defaults. |
| Verified scope/amount misunderstanding in support or usability feedback | Any case where a donor exports unintended scope because of our labeling/control behavior | Phase25 product/UX owner | Reproduce the exact journey, correct copy/control semantics and rerun the relevant comprehension case before treating the defect as resolved. No financial or private payload in analytics. |

No new routine notification is required to observe these signals. Existing operational/security channels receive material service events under their owners; donor communications remain within Q17's admitted families.

## Current research and proof limits

The evidence bundle contains the root Chrome note, independent owner/UX/stack reviews, sanitized Supabase CLI evidence, exact npm/installed-version observations and documentary validation. Actual work included source/docs/issue inspection, read-only local catalog queries and live ReUI demo interactions. It did **not** include a Core exporter implementation, target migrated RLS proof, spreadsheet compatibility run, donor usability study, provider call, hosted audit or production load test. The review is finished; those release gates are real implementation work, not claimed successes.

Current external evidence used, with transfer limits:

- [Church Center giving history](https://help.planningcenter.com/en/140951-manage-your-giving-information.html): donor year/fund filtering before CSV; supports continuity, not every modal/file behavior.
- [Monzo transaction export](https://monzo.com/help/budgeting-overdrafts-savings/exporting-my-transactions): independent date-range export is a credible alternative; bank-statement legal meaning does not transfer.
- [HubSpot exports](https://knowledge.hubspot.com/import-and-export/export-records), [Fundraise Up exports](https://fundraiseup.com/docs/exports/), [Givebutter exports](https://help.givebutter.com/en/articles/2219206-how-to-export-download-transaction-details), [Shopify exports](https://help.shopify.com/en/manual/fulfillment/managing-orders/exporting-orders): useful view/scope continuity, but staff fields, page selection, schedules, email links and retention limits are not donor requirements.
- [ReUI filtering blocks](https://reui.io/blocks/data-grid/filtering): directly inspected in Chrome; compact values/forms and local feedback are adopted, fixture filtering and administrative features are not authority.
- [Baymard applied-filter overview](https://baymard.com/blog/how-to-design-applied-filters), updated13May2026, and [Carbon filtering](https://carbondesignsystem.com/patterns/filtering/): visible applied values and appropriate instant/batch application support the chosen controls. Retail evidence is not Asym donor outcome data.
- [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) and [table/grid subset semantics](https://www.w3.org/WAI/ARIA/apg/practices/grid-and-table-properties/): concrete guidance for errors/status and honest partial rendering; implementation must still be tested.
- [Core Web Vitals thresholds](https://web.dev/articles/vitals): performance observation reference, not a measured result of this session.

**Final disposition: Accept with required amendments.** A1–A5, J01–J16, V01–V10 and C01–C22 are the corrected execution to ratify. T01–T18 and the named rollout gates remain required proof before activation. Do not advance to Question21 until this Q20 execution decision is settled.
