# Phase 23 D17 Public site search research

- **Status:** Founder-ratified Phase 23 D17 supporting research.
- **Date:** 2026-08-23
- **Authority:** Research and decision support only. This document does not
  authorize implementation, schema work, migration, dependency or provider
  adoption, issue publication, deployment, D1 activation, or production
  change.
- **Scope:** The donor-facing search product for one tenant Site: eligible
  sources, index input, Postgres and Payload roles, query and ranking behavior,
  typo assistance, facets, result UX, privacy, reindexing, takedown convergence,
  observability, migration seams, and Web Studio operations.
- **Inherited boundary:** D1-D16, Phase 10, Phase 22, and each source-owning
  phase remain authoritative for the facts they own. D17 may derive a public
  discovery index and return canonical public links. It may not become Page,
  publication, route, subject, permission, or financial truth.

## Executive finding

Phase 23 D17 resolves public site search. It is
separate from Web Studio document search, Mission Control command search, CRM
search, and Phase 40 governed global search.

The strongest bounded option is:

> **C-prime-amended-and-hardened (C-prime-R) — One exact-scope, version-fenced, derived Public Site Search Projection under D1, compiled from qualified source-owned public projections through one versioned, public-safe Search Document contract into one Tenant × environment × Site × locale × public-audience × active-D1-generation index behind a provider-neutral Public Search port.** Search membership, rank, visibility, and removal are derived discovery facts only; Pages, publication, routes, redirects, subjects, permissions, consent, Phase 10 safety, designations, and financial facts remain source-authoritative. Draft, private, restricted, retired, orphaned, merely configured, or otherwise ineligible content is never indexed first and filtered afterward.
>
> Launch uses PostgreSQL weighted full-text search with GIN indexing, `websearch_to_tsquery`, deterministic total ordering, and narrowly bounded `pg_trgm` assistance for safe titles and approved tags only. A dedicated search provider is adopted only after measured relevance, language, scale, latency, or operational evidence proves Postgres inadequate. Payload’s Search Plugin may become a qualified CMS-source adapter, but only after exact-version testing and only through the same Search Document contract; it never becomes the publication firewall, public API, or unified cross-source authority.
>
> Every authoritative source transition advances one bounded Public Search Convergence Target containing the newest desired disposition—`present` or `absent`—and its source, publication, safety, D1-generation, and content-version fences. Core’s existing durable dispatch ledger, identifier-only Inngest envelope, product claim, retry, recovery scan, and dead-letter path execute that target; D17 creates no second queue, scheduler, generic workflow engine, or duplicated retry ledger. Workers always reload current desired state and use idempotent compare-and-set effects. Dispatch acceptance, worker completion, provider acceptance, query visibility, containment, physical absence, reconciliation, cache convergence, and external-crawler removal remain separate facts.
>
> Withdrawal, unpublish, consent loss, route loss, retirement, source removal, or Phase 10 reclassification receives adverse-first handling. The public resolver performs one bounded, set-based admission/version proof against compact source-owned current public heads for the complete candidate batch—never one remote call per result—and suppresses every withdrawn, unknown, failed, or version-mismatched hit before responding. This containment is effective independently of asynchronous cleanup. Priority deletion then removes the derived row, exact-key verification proves absence, and a durable version watermark prevents a delayed older upsert from resurrecting it. “Deletion confirmed” means absent from D17’s active index; it does not claim removal from backups, browser caches, archives, Google, Bing, or another independently owned surface.
>
> Incremental idempotent updates are normal. Full or source-specific rebuilds use bounded shadow generations, checkpoints, safe expected-versus-actual identity/version proof, mass-deletion anomaly guards, and an atomic derived-head switch only after validation. A failed rebuild leaves the prior safe generation serving, still subject to current admission proof. D1 remains the sole Site activation and rollback authority.
>
> Visitors receive a simple accessible submitted-search experience: labeled field, explicit Search action, shareable `?q=` URL, normal links, safe excerpts, a small optional content-family filter, D16 link-native result windows, distinct zero-results and unavailable states, and a polite result-status announcement. Suggestions are optional progressive enhancement. Search-result URLs are omitted from sitemaps and marked `noindex`. Raw search phrases are not placed in ordinary logs, donor profiles, metrics, or default analytics.
>
> Ordinary staff see one quiet derived status—**Search is up to date**, **Updating search**, **Safety update in progress**, **Some content may be missing**, **Search needs attention**, or **Rebuilding search**—with only the cause-owned action that can actually help. Platform operations receive privacy-safe lag distributions, oldest pending age, dead letters, suppression counts, drift classifications, deletion proof, reconciliation age, and rebuild progress. Tenant and Site identifiers remain in authorized operational records rather than unbounded metrics labels. Healthy Sites remain quiet; only containment failure, cross-scope exposure, verified unsafe results, or unresolved adverse failures page an operator.
>
> Phase 23 owns this general Public Site Search Projection and its purge convergence. Phase 22’s ministry directory and Phase 40’s governed global or AI search remain independently authoritative.

This is deliberately not “Algolia built in Postgres.” It is one small public
search contract with a capable default engine, one future replacement seam,
and no second CMS, security model, or publication workflow.

## Why D17 was the next decision

The Phase 23 prompt places public site search immediately after D14's Dynamic
Source Catalog, D15's curation, and D16's public result-window contract. It
requires one public-search product spanning Pages, articles/resources, Phase 22
missionary/project pages, and only later public families when their owning
phases ship. It explicitly rejects inserting drafts or restricted data and
filtering them later.

The settled decisions already supply most prerequisites:

- D1 owns one coherent Site Plan release and release generation.
- D2-D3 own public paths and continuity.
- D9 owns certified presentation packages, not source eligibility.
- D10 requires complete-cohort activation.
- D13 owns exact-revision scheduled D1 operations.
- D14 owns source descriptors and source-qualified public DTOs.
- D15 owns one deterministic curated sequence only inside a Content-list
  placement; it does not define search ranking.
- D16 owns link-native public result windows and presentation; D17 should reuse
  that URL/pagination behavior rather than invent a second paging engine.
- Phase 10 structurally excludes restricted-tier data from search indexes and
  emits the purge-required trigger that the owning search phase must consume.
- Phase 22 owns the approved public projections for missionary and project
  pages; D17 references those projections and never copies operational
  identity.

The repo has no unified public-search index or public search endpoint today.
`apps/admin/payload.config.ts` uses the Payload Postgres adapter with schema
`cms` and lists CMS/ministry collections, but configures no Search Plugin. The
root package pins Payload and its Postgres adapter to
`4.0.0-internal.1f9ae9a`; no `@payloadcms/plugin-search` dependency is present.
Existing `tsvector` migrations serve unrelated products. Phase 9's planned CRM
`pg_trgm` surface is private CRM search and must not be reused as D17's public
authorization or data plane.

## Primary-source findings

### Payload Search Plugin: useful adapter, insufficient authority

Payload's current official Search Plugin documentation says the plugin creates
a separate indexed collection containing static copies of selected
search-critical fields, maintains those records from collection lifecycle
hooks, supports collection/all reindex, and can customize fields and pre-sync
mapping. `syncDrafts` defaults to false, `deleteDrafts` defaults to true,
`skipSync` can decide per locale/document/collection/request, and the default
reindex batch size is 50.

Those features are valuable for CMS collection maintenance. Two documented
properties prevent the plugin from being the whole D17 product:

1. it is configured around selected Payload collections, while D17 must accept
   source-owned public projections that include Phase 22 and later families;
2. static search records deliberately bypass hooks on their original
   documents when queried. That is a speed benefit, but it means the search
   record itself must already be the complete safe public projection.

Therefore `skipSync` is defense in depth, not the publication firewall. A
plugin hook that reads raw documents and strips fields locally would duplicate
Phase 10 and source-owner rules. The durable seam is a single Search Document
compiler used by every adapter.

### Postgres is sufficient for the launch shape

Current PostgreSQL and Supabase documentation supports the proposed bounded
engine:

- `tsvector`/`tsquery` provide natural-language matching and GIN provides an
  inverted index suitable for full-text search;
- `websearch_to_tsquery` accepts ordinary user text, quotes, `or`, and negative
  terms without requiring users to construct strict `to_tsquery` syntax;
- `setweight` and `ts_rank`/`ts_rank_cd` support field weighting and relevance;
- text-search configurations and dictionaries support stemming, stop words,
  synonyms, and language-specific behavior;
- `pg_trgm` adds indexed text similarity and PostgreSQL explicitly documents
  its use alongside full-text search to recognize misspellings.

These are primitives, not a finished product. D17 still needs bounded input,
stable ranking, locale mapping, quality fixtures, result DTOs, safe snippets,
operations, and public UX. PostgreSQL also warns that `ts_headline` output is
not safe for direct web inclusion and may be slow because it reads original
text. D17 should render the already-approved plain excerpt and escape any
highlighting rather than emit database-generated HTML.

### Accessibility supports a simple submitted-search baseline

W3C Technique G161 treats an accessible search form or link to a search Page as
a useful additional way to find site content. It specifically notes that spell
checking, stemming, and synonyms can improve search accessibility. W3C's
search-results status example uses `role="status"` so the result count or zero
result message is announced without moving focus to an alert.

This supports a reliable server-submit baseline. Typeahead, command-palette
behavior, voice search, or semantic AI search are not prerequisites. Optional
suggestions must preserve normal form submission and keyboard behavior.

### Search-result SEO is separate from result-target SEO

Google documents `noindex` as the supported page-level mechanism for excluding
a URL from Google Search, and notes the URL must remain crawlable for the rule
to be seen. D17 search-result URLs should therefore be omitted from sitemaps
and return a visible `noindex` rule rather than relying on `robots.txt`.
Canonical Pages and posts remain governed by D2/D3 and their source-owned SEO.

### Public input must stay bounded

OWASP's current REST guidance says not to trust input and to validate length,
range, format, and type, reject unexpected content, and bound request size.
For D17 this means a maximum normalized query length, a minimum for suggestions
and trigram work, a small allowlisted filter catalog, one ordinal window, rate
and concurrency limits, timeouts, and no direct interpolation of user text into
SQL or ranking configuration.

### Durable delivery must reuse Core's current workflow seam

The current checkout already ships the infrastructure D17 needs. It is not a
future architecture assumption:

- `workflow_dispatch_requests` is a service-role-only shared handoff ledger
  with a Tenant-scoped idempotency key, retry eligibility, attempt count,
  bounded safe context, failed/dead-letter states, and recovery indexes;
- `requestWorkflowDispatch` persists or reuses the ledger request and attempts
  immediate delivery through the existing Inngest client;
- the five-minute dispatch recovery scan repairs stored-but-undelivered
  handoffs with bounded batches and product work claims;
- the strict workflow envelope carries identifiers and small safe scalars, not
  source bodies or Search Documents;
- `workflow_work_claims` prevents manual replay, recovery, and workflow retries
  from applying one Tenant-scoped product effect concurrently; and
- the merged workflow-orchestration specification explicitly says the ledger
  proves a handoff, while product records and idempotency own the outcome.

Creating `public_search_jobs`, a second generic outbox, another scheduler, or a
search-specific retry state machine would duplicate those capabilities and
become immediate technical debt. D17 still needs one small product-owned
convergence target because “Inngest accepted the event” is not “the index now
contains the right row.” That target records the newest desired search state
and verification receipt; it does not copy the shared ledger's pending,
dispatched, failed, or dead-letter facts.

AWS's transactional-outbox guidance explains the dual-write failure this must
close: a source write can commit while notification fails, or notification can
escape while the source transaction rolls back. Where the source transition
and D17 target share one database transaction, they should commit together.
Where an owning source cannot share that transaction, its durable release
receipt plus reconciliation must make the gap discoverable. Dispatch is then
at-least-once in practice, so the consumer must remain idempotent.

Inngest's current documentation reinforces two limits. Event `id` prevents a
duplicate trigger for only 24 hours, and retries require idempotent side
effects. Core therefore correctly treats its deterministic event ID as
handoff-level defense in depth, not permanent product idempotency. Inngest also
supports keyed concurrency and priority; D17 may use a code-owned safe urgency
class to protect provider capacity and favor adverse work, but only through the
existing runtime. Correctness work must not use Inngest rate limiting, which
discards events over the limit; keyed concurrency or throttling can delay work
without intentionally dropping it. D17 must not add one queue, cron, or
function per tenant.

Payload can participate in a database transaction when nested hook operations
pass the request transaction context and are awaited. Any qualified Payload
adapter must prove that behavior at the exact pinned version; an unawaited hook
or operation that omits the request context is not an atomic release-to-target
handoff.

One current limitation must be explicit: the shared recovery scan orders due
handoffs by `next_attempt_at`, 25 at a time, and does not currently prioritize
adverse search deletion. Immediate dispatch and live fail-closed suppression
preserve public safety, but physical-deletion objectives must be load-tested
against worst-case ledger backlog. If that objective cannot be met, add one
small code-owned urgency field/order to the shared ledger rather than a D17-only
queue.

### Provider acceptance is not convergence proof

Algolia's official documentation is a useful comparable-system warning: index
writes are asynchronous, return a task ID, and are not complete until task
status becomes `published`. Its atomic-reindex guidance similarly separates
building replacement data from making it active. Elasticsearch aliases show
the same mature generation pattern: several alias actions can switch the
active index atomically, with a `must_exist` guard when partial success would be
unsafe.

The provider-neutral D17 writer must therefore return a typed receipt:

- Postgres: the exact scoped transaction committed at the expected
  version/hash, followed by an exact-key membership/absence check;
- future asynchronous provider: accepted task ID, terminal provider status,
  and exact scoped membership/absence verification; or
- retryable/permanent failure with a code-owned safe reason.

An HTTP 2xx, event send ID, provider task ID, cache purge acknowledgement, or
worker completion alone is not verified search convergence.

### Observe freshness as a user and safety outcome

Google’s SRE guidance recommends quantitative service indicators, latency
distributions rather than averages alone, and symptom-level alerts that are
actionable instead of pages for every internal component. Applied here, the
useful signals are convergence latency by `present` versus `absent`, oldest
unverified target, dead letters, reconciliation drift, result-time suppressions,
and rebuild-generation progress. Provider calls and Inngest runs remain drill-
down evidence; they are not the staff-facing definition of health.

OpenTelemetry's metrics guidance also makes cardinality an operational design
constraint rather than a cleanup task. Tenant IDs, Site IDs, raw paths, query
text, titles, and public identities belong in an authorized operational read
model or sampled restricted trace—not in unbounded metric attributes. Metrics
use only small code-owned dimensions such as operation class, source family,
health state, and safe failure family, with opaque correlation IDs joining to
restricted evidence when an operator is authorized to investigate.

## Options considered

### A — Payload Search Plugin is the public-search product

This is the smallest CMS-only implementation and provides useful reindex UI.
It fails the cross-source contract, over-couples public search to one engine,
and tempts locally reimplemented safety rules around static document copies.
It is acceptable only as a qualified CMS feeder under C-prime-R.

### B — Query every source directly and union results at request time

This avoids a derived index but creates per-source query/rank/pagination logic,
couples public latency to operational systems, makes cross-source relevance
inconsistent, and gives every request another chance to omit a Tenant or Phase
10 predicate. It also makes reindex/deletion proof impossible because there is
no index contract. Reject.

### C-prime-R — One public-safe projection and rebuildable index — Recommended

This gives all sources one exact, testable egress contract; starts with the
database already operated by Asym; contains Payload behind an adapter; and
retains a clean future provider seam. Its search projection and one bounded
convergence target are justified because they eliminate duplicated safety and
ranking logic. Delivery reuses Core's shipped workflow ledger, claims, Inngest
runtime, retries, recovery, and dead-letter path instead of inventing another
job platform.

### D — Dedicated hosted search provider at launch

This can offer sophisticated typo tolerance, analytics, language support, and
operations, but introduces another processor, credential boundary, billing
model, vendor index, deletion surface, and tenant-isolation obligation before
real volume or quality evidence exists. Preserve the adapter seam; do not adopt
the dependency yet.

## Exact ownership and boundary

| Fact or behavior                                  | Authority                   | D17 behavior                                                                                |
| ------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| Page/post/project/missionary content              | Owning source phase         | References only the approved public projection.                                             |
| Party identity and restricted-worker safety       | Phase 9/10                  | Accepts only the Phase 10-safe public subject; never reads locked-room identity.            |
| Public route and redirect continuity              | D2/D3 and source lifecycle  | Stores the current canonical public URL and consumes route withdrawal; does not mint paths. |
| Site presentation                                 | D8/D9                       | Renders one certified result component; presentation cannot change eligibility or rank.     |
| Site release and rollback                         | D1                          | Binds to the active generation; no search enable bit or second activation.                  |
| Scheduled release                                 | D13 through D1              | Re-proves exact Search Document inputs when the scheduled generation activates.             |
| Dynamic source descriptor                         | D14                         | Declares whether and how a family can emit public Search Documents.                         |
| Curated list order                                | D15                         | Unrelated to search rank unless a later explicit rank feature is ratified.                  |
| Result pagination                                 | D16                         | Reuses the Public Page Window contract; D17 supplies a deterministic ranked sequence.       |
| Search membership, rank, and general search purge | D17                         | Derived, public-only, Site/locale-scoped discovery behavior and its verified convergence.   |
| Ministry directory search                         | Phase 22                    | Independently owned bounded directory; D17 does not silently replace or reinterpret it.     |
| Staff/CRM/global search                           | Phase 9/40 and their owners | Separate endpoints, projections, permissions, indexes, logs, and UI labels.                 |

## Search Document contract

Each source adapter emits one versioned, provider-neutral Search Document. A
reasonable logical contract is:

```text
SearchDocumentV1
  tenant_id                 trusted scope
  environment               production/preview boundary
  site_id                   exact Site
  site_generation           D1 release generation
  locale                    exact released locale
  audience                  public reach only
  source_family             code-owned public family
  source_contract_version   D14 descriptor contract
  source_public_id          stable, never-reused public identity
  canonical_url             current D2/D3-owned public URL
  safe_title                approved public plain text
  safe_excerpt              approved public plain text
  safe_search_text          bounded approved public plain text
  approved_public_tags      code-bounded public tags only
  published_at              source-owned public date when applicable
  updated_at                source-owned safe display date when applicable
  projection_version        source public-projection version
  safety_generation         Phase 10/publication proof generation
  content_hash              content-addressed idempotency input
```

The physical table may add `search_vector`, normalized title/tags, index
generation, convergence-target identity, verification receipt, and timestamps.
It must not add:

- raw Lexical or Payload JSON;
- unpublished body content or internal notes;
- legal names, precise locations, original filenames, EXIF, internal IDs, or
  private aliases;
- designation, ledger, contribution, commitment, donor, or financial facts
  that are not already an approved public source projection;
- access-control flags intended to filter unsafe rows after indexing;
- provider credentials, provider-native URLs, or provider-native identity;
- free-form tenant SQL, weighting expressions, synonyms, or filters.

The composite uniqueness and every lookup start with Tenant, environment,
Site, locale, source family, and stable public identity. Browser-supplied
Tenant, Site, or locale values are never trusted: the server resolves host,
active Site, environment, locale, and D1 generation before query work. The
index belongs in a server-owned schema/data-access boundary; a public web
request does not receive table access merely because every indexed field is
intended for public display.

## Index lifecycle and convergence

### One bounded convergence target, not another queue

For each exact Tenant, environment, Site, locale, audience, source family, and
stable public identity, D17 retains only the newest convergence target:

```text
PublicSearchConvergenceTargetV1
  exact scoped public identity
  desired_disposition          present | absent
  site_generation              exact D1 generation
  projection_version           source-owned monotonic/versioned fact
  safety_generation            Phase 10/publication proof generation
  content_hash                 required for present; explicit null for absent
  target_recorded_at           convergence-latency origin
  last_verified_disposition    present | absent | unknown
  last_verified_version/hash   provider-independent verification fence
  last_verified_at             null until exact verification
  safe_failure_code            null or code-owned reason family
```

The target is a current desired-state/tombstone record and can be rebuilt or
compacted only after source-owned history and a complete reconciliation prove
that doing so cannot resurrect removed content. An `absent` tombstone survives
at least the maximum workflow retry/replay horizon plus one successful complete
reconciliation; physical provider deletion alone is not a safe stale-write
fence. The shared dispatch ledger owns handoff status; the target owns
desired-versus-verified search state. The UI derives one health view from both.
Neither record becomes publication truth.

The target's unique key and compare-and-set fence reject an older source,
safety, or D1 generation. A newer target supersedes older work without deleting
its audit evidence. One product work claim is scoped to the same exact public
identity so an old delete and a new upsert cannot execute concurrently. Before
every side effect, the worker reloads the current target; after any wait or
provider task, it checks the fence again before recording convergence.

### Incremental delivery

1. The source owner commits its authoritative release and advances the scoped
   convergence target in the same transaction where available. Otherwise, the
   source's durable release receipt is the reconciliation anchor.
2. The application creates or reuses one request in Core's shared workflow
   dispatch ledger. The event contains only Tenant, target ID, exact subject,
   workflow/schema version, and a safe `adverse` or `ordinary` urgency class.
3. The worker acquires the exact product work claim, reloads the newest target,
   and batch-reproves current publication, routeability, Site, locale, audience,
   consent, and Phase 10 safety through the source-owned public seam.
4. The writer compares the expected source/safety/D1 version and content hash,
   then performs one scoped upsert or delete. A replay is harmless and older
   work cannot overwrite or erase a newer projection.
5. The adapter waits for the Postgres commit or a future provider's terminal
   task result, verifies exact scoped presence/absence, and records the receipt
   only if the target fence is still current.
6. Retryable failure remains visible through the existing Inngest and dispatch
   ledger paths. Permanent/exhausted failure becomes a cause-owned exception;
   no user can “mark complete” without verification.
7. Bounded reconciliation compares durable source/target state with the active
   index and creates or reuses missing dispatch requests. This closes crash
   gaps without one tenant-specific poller or blind full rebuild.

### Adverse-first behavior

Unpublish, trash, retirement, consent withdrawal, lost routeability, security
reclassification, source withdrawal, or tenant/Site/locale removal is a
new `absent` target. The resolver performs one bounded set-based admission and
version proof against compact source-owned current public heads for the whole
candidate batch; it does not make one remote source call per hit. It suppresses
every failed, unknown, withdrawn, or version-mismatched candidate before the
response and never relies on a public-safe field copied into the index as
current permission. This is the containment boundary while the priority
physical delete converges.

A late adverse worker reloads the target before deleting. If a later legitimate
republication has advanced the target to `present`, the old delete is a no-op;
if delete already completed, the later upsert restores only the newly approved
version. Product claims, target fencing, and idempotent provider identity work
together—none is sufficient alone.

Cache invalidation follows, but cache tags are not isolation and a purge
acknowledgement is not row-absence proof. D17 must never cache an un-reproved
provider response as a public result. Any later D18 response cache must include
the source/public-safety generation or equivalent adverse epoch and preserve
this fail-closed resolver.

### Rebuild and deletion proof

Full and source-specific rebuilds create a new index generation from current
public projections. Operations show:

- generation and source family;
- expected/processed/upserted/deleted/skipped/failed counts, only where counts
  are safe and non-enumerating;
- current cursor or batch without exposing document identity;
- oldest unverified target and the separately owned handoff state;
- failure reason family and cause-owning source;
- source-qualified set/hash comparison;
- exact completion and D1-bound atomic generation switch;
- post-switch proof that removed identities are absent.

A failed rebuild leaves the active generation unchanged. Retry resumes from a
bounded cursor and is idempotent. Rebuild never republishes a source record,
changes a Page, broadens reach, or rewrites source truth.

Reconciliation is bounded and layered:

1. **Due-target repair:** find targets whose desired and verified fences differ;
   create/reuse their shared dispatch request.
2. **Source-family reconciliation:** compare one source's current qualified
   identity/version set with the active index using bounded cursors.
3. **Full generation proof:** build a shadow generation, validate safe counts,
   exact identity/version digests and adverse absence, then ask D1 to bind the
   validated generation.

The first two are normal repair; the third is reserved for contract/rank/index
changes, broad drift, migration, or an explicit authorized rebuild. This avoids
turning routine delivery into expensive full scans.

An unexplained empty source snapshot or an anomalously large set-difference
blocks a generation switch and opens a cause-owned exception. It never blocks
an exact, direct, versioned adverse target: known unpublish/consent/safety
removals continue immediately. This guard prevents a broken importer or missing
credential from converting “could not read the source” into “delete the public
index.”

## Postgres query and rank design

### Normal search

- One weighted vector gives title the highest weight, public tags and safe
  subject a bounded secondary weight, and excerpt/body lower weights.
- `websearch_to_tsquery` parses normalized user text with a locale-qualified
  text-search configuration.
- Rank is deterministic: text relevance, an exact normalized-title boost,
  optionally a bounded title-prefix boost, a modest source-owned recency factor
  only for families where recency is meaningful, then source family and stable
  public identity as total-order tie-breakers.
- Rank profile is code-owned and versioned. Tenants may choose a small
  presentation/search-source profile, but not arbitrary formulas.
- D16 slices the final total order into bounded link-native windows. No public
  database offset, keyset value, provider token, or raw rank leaks.

### Typo and suggestion behavior

`pg_trgm` is not applied indiscriminately to every body. It is limited to a
small normalized corpus such as safe titles and approved public tags, with:

- a minimum query/token length;
- indexed similarity operators;
- a qualified threshold by locale;
- a small candidate and response cap;
- a query timeout and real query-plan proof;
- full-text-first behavior, or activation only when ordinary results are below
  a small threshold;
- no spelling suggestion that reveals a hidden term or count.

PostgreSQL's documented auxiliary-word-table spelling pattern does not need to
ship at first release. If quality testing proves title similarity insufficient,
it may be added as another rebuildable projection, not a manually maintained
dictionary.

### Locale behavior

One code-owned mapping chooses a qualified Postgres text-search configuration
for each supported locale. Unsupported or mixed-language content uses the
`simple` configuration honestly rather than pretending English stemming is
correct. Locale variants are independent Search Documents under D27/Phase 22
and D1 release rules; search never silently falls back to another locale if
that would expose or misroute content. Cross-locale search is a separate future
product decision.

## Visitor UX/UI

### Default flow

1. A clearly visible or plainly labeled Search link opens the Site's Search
   Page. A header field may submit to the same Page.
2. The input has a persistent visible label or an accessible name that does
   not rely only on placeholder text. The action is labeled **Search**.
3. Enter or the button performs a normal GET, producing a shareable bounded
   URL such as `/search?q=clean+water`.
4. The result heading repeats the human-readable query and the status region
   announces a concise result message.
5. Each result is one ordinary canonical link with title, safe excerpt,
   code-owned content-type label, and only a source-approved date/context.
6. D16 provides Page links or the tenant-selected compatible progressive
   presentation. Search itself does not invent infinite scroll.

### Filters and categories

Launch should default to **All** plus, only when useful for the Site, a small
code-owned set of source-family choices such as Pages, Stories/Articles,
Resources, Missionaries, and Projects. The D14 descriptor declares the public
label/icon and whether a family participates. A tenant may hide an entire
eligible family prospectively through one versioned Site search profile, but
cannot include an unqualified source or private field.

Filters are rendered only from the same safe index/result contract. Facet
counts are omitted by default. If later shown, they count only currently
eligible public documents inside the exact Tenant/Site/locale/audience scope;
unknown, restricted, draft, or other-locale records do not contribute even as
zero-vs-nonzero inference.

### Suggestions

Suggestions are optional progressive enhancement, not a launch gate. When
enabled they:

- wait until at least a small code-owned number of normalized characters;
- debounce and cancel superseded requests;
- return a tiny result set from the same public-safe index;
- use an accessible combobox/listbox pattern with keyboard and touch support;
- never auto-submit, steal focus, or replace the visible query without an
  explicit choice;
- retain the ordinary Search action and no-JavaScript behavior;
- show no popularity, hidden-result, or cross-tenant counts.

### Zero, empty, invalid, and failed states

| State                          | Public behavior                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| No query                       | Explain what can be searched; keep focus in the field; do not run an empty broad query.                             |
| Too short/long or invalid      | Preserve safe user text, explain the bound plainly, and make correction easy.                                       |
| No matches                     | “No results for …”; offer spelling help if qualified, clear the filter, and link to ordinary navigation or contact. |
| Some source family unavailable | Return only independently proven safe results and omit unsafe/unknown families; do not claim completeness.          |
| Search service unavailable     | Say search is temporarily unavailable and provide normal navigation; never render an empty-results lie.             |
| Stale/withdrawn hit            | Suppress it before response; do not expose that a restricted or removed record existed.                             |

### Accessibility, mobile, and trust

- Native form controls, headings, lists, and links are the baseline.
- Result updates use one polite `role="status"`; no alert storm and no focus
  jump on each keystroke.
- Keyboard, screen-reader, touch, 320 CSS-pixel reflow, 200%/400% zoom, RTL,
  visible focus, reduced motion, and no-JavaScript behavior are tested.
- Query and filter state survive Back/Forward and refresh through canonical URL
  parameters; duplicate/array/unknown parameters are normalized or rejected.
- Search does not imply endorsement, donation eligibility, current financial
  need, or an exhaustive directory. Result copy says what it is, not what a
  donor might infer.

## Web Studio and operations UX

Search setup should be quiet because ordinary tenants should not need to tune
an engine. In the D23-style setup workspace, show one **Site search** card:

- **Search:** Off / On. It is a D1 Site Plan change, not an immediate global
  flag.
- **Included content:** a short checklist of currently qualified public source
  families, with the recommended set selected and unavailable families
  explained in place.
- **Results style:** the compatible D16 profile, if the tenant may choose it.
- **Preview:** a released-content preview with sample queries and explicit
  locale/Site context; preview does not mutate or activate the index.
- **Impact summary:** number of currently eligible public documents by source
  only when those counts are safe, plus warnings for a source with no public
  projection or a pending D1 release.

Do not expose Postgres configuration names, trigram thresholds, vector weights,
reindex batch size, provider credentials, table names, RLS, cache keys, index
generation IDs, or raw error traces to ordinary staff.

Ordinary staff receive one derived, exception-first status, not separate
provider, Inngest, ledger, and index dashboards:

| Staff state                     | Copy and behavior                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Search is up to date**        | Healthy default; show last checked quietly and no action.                                                                                         |
| **Updating search**             | Normal short-lived favorable convergence; published Pages remain public and navigation still works.                                               |
| **Safety update in progress**   | Affected result is already hidden while physical removal is verified; disclose no removed title, subject, path, or reason to unauthorized staff.  |
| **Some content may be missing** | Favorable work exceeded its objective; search remains safe but may be incomplete. Show the cause-owning source and one qualified action.          |
| **Search needs attention**      | Dead letter, verified drift, invalid generation, or breached adverse-removal objective; show safe reason, correlation ID, owner, and next action. |
| **Rebuilding search**           | Continue serving the prior validated generation and show bounded progress; never imply the rebuild changed publication.                           |

Actions are cause-owned and appear only when useful: **Retry update** for a
retryable handoff, **Reconcile source** for source drift, or **Rebuild search**
for a generation/contract fault. Each action reuses the same idempotent path,
requires scoped authority and consequence copy, and cannot change source
publication or D1 release state. There is no direct row edit, provider-console
link for ordinary staff, “force success,” or generic button that guesses at the
cause.

Platform operations can drill into active generation, desired/verified target
fences, handoff status, workflow/run correlation, provider receipt, source
family, oldest lag, and safe failure code. Content, queries, aliases, titles,
precise paths, and restricted identities remain absent from ordinary metrics
and alerts.

### Initial measurable health objectives

These are code-owned launch objectives to prove under synthetic production-
shaped load and failure injection, then baseline for the first two to four
weeks. They are not tenant controls, provider guarantees, or contractual SLAs:

| Indicator                             | Initial objective and health transition                                                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unsafe-result containment             | **Zero returned ineligible hits.** Any miss is a release-blocking security incident; index lag must still fail closed at result reproof.          |
| `absent` target to verified absence   | p99 at or below 60 seconds; warning for any target older than 60 seconds, **needs attention** at 5 minutes.                                       |
| `present` target to verified presence | p99 at or below 60 seconds and p99.9 at or below 5 minutes over 30 days; **some content may be missing** for any target older than 5 minutes.     |
| Shared handoff recovery               | Oldest due search handoff below the existing five-minute recovery interval; **needs attention** if it remains due after the next completed scan.  |
| Retry and terminal failure            | Retried targets below 1%; terminal failures below 0.01%; first unowned dead letter immediately becomes **needs attention**.                       |
| Reconciliation                        | One complete authoritative pass per 24 hours at launch, drift at or below 0.1%, and zero known adverse/orphan visibility drift.                   |
| Rebuild                               | Checkpoint advances within its bounded batch budget; no switch until every qualified source completed and identity/version/deletion proof passed. |

The exact percentiles and intervals must be revisited from evidence, but the
distinction is permanent: containment, handoff, provider acceptance,
provider/index visibility, and reconciliation are separate clocks.

Required privacy-safe telemetry is:

- pending target count and oldest age by `present`/`absent` and source family;
- target-to-handoff, handoff-to-run, run-to-provider, and end-to-end latency
  histograms, including high percentiles rather than averages alone;
- retries, dead letters, safe failure families, provider task age, and
  verification mismatches;
- result-time suppression count, which indicates contained stale-index drift;
- source/index drift classified as missing, stale, orphaned, or unexpectedly
  visible after removal; and
- last complete reconciliation, duration, checkpoints, and active/shadow
  generation progress.

Tenant/Site/source drill-down belongs in an authorized operational read model,
not as unbounded high-cardinality labels in the metrics backend. Healthy Sites
remain quiet; alerts fire on user/safety symptoms and breached objectives, not
every retried worker step.

## Privacy, security, and abuse controls

- Host/site context is resolved server-side before any index or cache access;
  caller-supplied Tenant/Site IDs are rejected.
- Query, filter, locale, and D16 window parameters are strongly parsed and
  bounded before cache/database work.
- Prepared queries/RPCs are used; user text never becomes SQL, `regconfig`,
  sort expression, table/column, or raw regex.
- Public endpoint, suggestion endpoint, and rebuild endpoint have separate
  rate, concurrency, timeout, and authorization policies.
- Result DTOs are exact allowlists. Safe snippets are escaped plain text.
  `ts_headline` output is never inserted as trusted HTML.
- Ordinary logs contain query length/range bucket, result/failure bucket,
  source-family aggregate, duration, and request correlation—not raw query,
  donor identity, result title, subject, or canonical URL.
- Query analytics are purpose-limited and tenant-visible only after a later
  retention/privacy decision. “No raw query analytics at launch” is the safe
  default, not a hidden product limitation.
- Negative tests prove no cross-Tenant/Site/environment/locale/audience/
  generation/source cache collision and no restricted-term, title, facet,
  timing, suggestion, log, or error leakage.

## Failure contract

| Condition                                        | Required outcome                                                                                                              | Recovery owner                       |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Invalid query/filter/window                      | Reject before work with a clear public correction; no provider call.                                                          | D17 parser/UI                        |
| Index query timeout                              | Typed unavailable response; preserve navigation; no blind retry.                                                              | D17 search operations                |
| Source commits but immediate dispatch fails      | Durable target remains discoverable; create/reuse shared ledger request and recover.                                          | Source owner plus shared dispatcher  |
| Ledger handoff succeeds but worker fails         | Existing bounded Inngest retry resumes the failed idempotent step; exhausted work is visible, never silently complete.        | Shared workflow plus D17 delivery    |
| One source projection fails                      | Do not invent/retain a document; record a source-qualified exception.                                                         | Source owner plus D17 delivery       |
| Incremental target is delivered twice            | Target/content-hash/version idempotency produces no duplicate row or effect.                                                  | D17 projection writer                |
| Older upsert/delete arrives late                 | Reload newest target and compare source/safety/D1 fences before any side effect.                                              | D17 projection writer                |
| Old delete races valid republication             | Exact product work claim serializes effects; stale delete no-ops and newest approved target wins.                             | D17 convergence owner                |
| Provider accepts asynchronous write              | Keep target unverified until terminal task status and exact read-back/membership proof.                                       | D17 provider adapter                 |
| Phase 10/publication reproof fails or is unknown | Suppress hit immediately and confirm adverse target/delete without enumeration.                                               | Phase 10/source owner plus D17 purge |
| Recovery backlog delays physical deletion        | Result remains hidden; measure breached absence objective and escalate cause, then prove shared-ledger capacity/priority.     | Shared workflow plus D17 operations  |
| Full rebuild fails                               | Keep old validated generation active; show private exception and resume/restart safely.                                       | D17 search operations                |
| Source snapshot is empty or delete delta spikes  | Block unexplained generation switch; preserve current index and investigate, while direct versioned adverse deletes continue. | Source owner plus D17 operations     |
| Provider adapter fails after future migration    | Same typed unavailable behavior; no operational-table fallback.                                                               | D17 provider adapter                 |
| D1 rollback occurs                               | Rebind to prior complete compatible index generation or rebuild; never rewrite sources.                                       | D1 plus D17 generation binding       |

## Ruthless adversarial review

Every category has a material concern. This does not reject C-prime-R; it
explains why its constraints are necessary and proportionate.

The most consequential amended finding is that Core already owns durable
workflow dispatch. Rebuilding that machinery inside search would be technical
debt, but using the shared ledger as proof of index convergence would be a
correctness error. C-prime-R reuses handoff mechanics and adds only the bounded
desired-versus-verified target D17 uniquely needs.

| Category                         | Concern? | What could go wrong and why it matters                                                                                                                                                                           | Severity / likelihood  | Evidence or reasoning                                                                                                              | Permanent fix or prevention                                                                                                                                                                         |
| -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                      | **Yes**  | Source hooks, locale maps, route changes, rebuilds, and live safety can drift; a plugin-only solution works only while all sources are Payload documents.                                                        | High / Medium-high     | Phase 22 and future sources cross collection/domain boundaries; Payload documents collection-scoped sync.                          | One Search Document contract, adapter conformance, current visibility reproof, generation rebuild, and source-qualified tests.                                                                      |
| Technical debt                   | **Yes**  | Per-source queries/ranking or a D17 queue, scheduler, retry ledger, and dead-letter model would duplicate both search logic and Core's shipped workflow platform.                                                | High / High            | The repo already has `workflow_dispatch_requests`, strict envelopes, claims, Inngest 4.5.1, recovery, and summaries.               | One projection/query port and bounded convergence target; reuse shared dispatch and keep handoff versus outcome facts separate.                                                                     |
| Edge cases                       | **Yes**  | Empty/stop-word/emoji/RTL queries, removed locale, duplicate/24-hour-late event, provider timeout after acceptance, old delete racing republication, empty source snapshot, and rollback can mislead or regress. | Critical / High        | Search delivery is at-least-once and future providers can apply writes asynchronously and out of order.                            | Explicit parser, total order, newest-target reload, product claim, version/hash/D1 CAS, provider completion/read-back, durable tombstones, and race/failure tests.                                  |
| Footguns                         | **Yes**  | Enabling draft sync, indexing raw body JSON, trusting a Site parameter, arbitrary weights, broad wildcard/trigram queries, or rendering `ts_headline` HTML can leak data or exhaust the database.                | Critical / Medium-high | Payload exposes `syncDrafts`; PostgreSQL warns about `ts_headline` XSS and trigram full scans.                                     | Safe projection only, code-owned profiles, trusted context, input/work bounds, escaped snippets, and compiler rejection.                                                                            |
| Tenant safety                    | **Yes**  | An omitted Tenant/Site/locale/generation predicate or cache dimension can return another organization's content.                                                                                                 | Critical / Medium      | Multi-tenant search is a classic composite-scope failure; Payload tenant filtering is configurable, not magic.                     | Resolve scope from host/session, composite keys/indexes, exact cache identity, server-only table access, FORCE RLS where applicable, and cross-scope negative tests.                                |
| Overengineering                  | **Yes**  | A dedicated vendor, second outbox/queue, per-tenant cron, vector search, synonym CMS, personalization, or arbitrary tuning would add cost and states without evidence.                                           | High / High            | Postgres covers launch search and Core already operates one durable workflow seam.                                                 | Postgres-first contract, one small convergence target, platform-wide bounded reconciliation, optional suggestions, and measured provider exit criteria.                                             |
| UX/UI and user friction          | **Yes**  | Search-as-you-type can distract, inaccessible results can be silent, filters can overwhelm, and zero/error states can look identical. Admin engine knobs create guesswork.                                       | High / High            | W3C supports a simple form baseline and status announcement; donor/public users need predictable navigation.                       | Explicit submitted search, small optional filters, progressive suggestions, useful zero/error states, D16 windows, and quiet Web Studio defaults.                                                   |
| Hidden coupling                  | **Yes**  | Search could accidentally own D2 routes, D14 source semantics, D15 curation, D16 paging, Phase 10 safety, Payload hooks, or provider scores.                                                                     | High / Medium-high     | All are adjacent but separately authoritative contracts.                                                                           | Ownership table, provider-neutral DTO/port, source-owned URL/eligibility, and conformance tests across adapters.                                                                                    |
| Failure modes                    | **Yes**  | A committed source change can lose its dispatch, accepted async writes can remain invisible, a stale delete can erase a valid republish, and an empty failed snapshot can trigger mass deletion.                 | Critical / Medium      | AWS documents the dual-write gap; Inngest retries; Algolia documents queued writes; Core's ledger proves handoff only.             | Atomic durable target/source receipt, shared ledger recovery, exact work claim, provider terminal/read-back proof, fail-closed reproof, anomaly-gated shadow generation, and no broad fallback.     |
| Data integrity risks             | **Yes**  | Duplicate projections, stale paths, locale collisions, old events, expired tombstones, partial rebuilds, and unstable ties can repeat, omit, resurrect, or misroute results.                                     | Critical / Medium-high | At-least-once delivery and multi-source ranking require stable identity, durable ordering, and absence proof.                      | Composite identity, newest-target reload, monotonic source/safety/D1 fences, durable tombstone, total order, exact set/version proof, and atomic generation switch.                                 |
| Security and privacy             | **Yes**  | Restricted names can leak through title, suggestion, facet count, snippet, logs, analytics, timing, or error traces even if result cards look safe. Search queries can themselves contain sensitive data.        | Critical / Medium-high | Phase 10 identifies search as a secondary leak vector; public query input is untrusted.                                            | Index-only safe projections, current firewall reproof, no raw-query logging by default, non-enumerating telemetry, strict DTO, limits/rate controls, and leak tests.                                |
| Scalability and performance      | **Yes**  | Unindexed FTS, broad trigram scans, expensive ranking/highlighting/counts, deep windows, suggestion storms, or multi-Site rebuilds may saturate Postgres.                                                        | High / Medium          | PostgreSQL documents index/ranking costs and trigram degeneration when no useful trigrams exist.                                   | GIN indexes, minimum lengths/thresholds, candidate/window caps, timeouts, no default facets or `ts_headline`, query-plan/load gates, incremental rebuild, and provider exit criteria.               |
| Operational burden               | **Yes**  | Manually repaired rows, duplicate dashboards, per-tenant tuning/crons, or always-visible repair controls create tribal knowledge and accidental damage.                                                          | High / Medium          | Search spans sources plus shared dispatch and eventual provider/index state.                                                       | One derived exception-first staff view, cause-owned actions, fixed profiles, platform-wide reconciliation, runbook, and no direct row/provider editing.                                             |
| Observability gaps               | **Yes**  | Source commit, target, handoff, run, provider acceptance, visibility, containment, and reconciliation can collapse into one misleading “success”; averages can hide tail lag.                                    | Critical / High        | Core and vendor docs separate handoff from business outcome; SRE guidance favors quantitative distributions and symptom alerts.    | Separate timestamps/receipts, p99/p99.9 objectives, oldest-age/dead-letter/drift/suppression metrics, privacy-safe correlation, and cause-owned alerts.                                             |
| Dependency and integration risks | **Yes**  | The internal Payload build may differ from public plugin/transaction docs; future providers have async completion, ACL, version, and deletion semantics; Inngest event dedupe expires after 24 hours.            | High / Medium          | Repo pin is internal; official vendor docs expose these semantics explicitly.                                                      | Exact-version qualification, awaited Payload transaction context, least-privilege adapter, durable product idempotency/tombstones, task read-back, contract fixtures, and no provider-native truth. |
| Migration and upgrade risks      | **Yes**  | Changing search engine, rank profile, locale config, Search Document schema, or source family can reorder results or strand unsafe provider data.                                                                | High / Medium          | Relevance indexes are derived but provider formats and scores are incompatible.                                                    | Version every contract/profile, dual-build/shadow compare, rebuild from source projections, atomic generation switch, deletion/export proof, and provider-independent IDs/URLs.                     |
| Other development hazards        | **Yes**  | Kill points around transaction/dispatch/provider acknowledgement, generic recovery backlog, stale caches, unsafe rollback, real-data fixtures, and mass-delete automation can survive happy-path QA.             | Critical / Medium      | D1/D13 concurrency, a 25-row/five-minute generic recovery scan, and Phase 10 safety make timing and negative behavior first-class. | Failure injection at every boundary, capacity/priority proof, adverse fail-closed reproof, delete anomaly guard, synthetic fixtures, rollback suites, and named ownership.                          |

## Ruthless synthesis and ordered path

### Must be fixed in the decision and specification now

1. **Freeze authority.** D17 is a derived public discovery surface; source
   projections and D1 remain authoritative.
2. **Adopt one safe Search Document contract.** No source-specific index shape
   and no insert-then-filter model.
3. **Use Postgres first, behind a port.** Weighted FTS plus bounded trigram
   fallback meets launch needs without a new vendor; a provider seam prevents
   lock-in.
4. **Contain Payload.** The official plugin may maintain CMS inputs only after
   exact-version qualification and through the same safe projection; it cannot
   be the public security/product boundary.
5. **Bind every row and cache entry to complete trusted scope.** Tenant,
   environment, Site, locale, audience, D1 generation, source family, public
   identity, and contract versions are non-optional.
6. **Reuse Core's durable workflow seam.** Record only D17's bounded convergence
   target, then use the shared dispatch ledger, identifier-only envelope,
   product claim, Inngest retries, recovery, and dead letter. Do not add a
   search queue, scheduler, or duplicate handoff statuses.
7. **Separate every proof.** Source/target commit, workflow handoff, provider
   acceptance, exact search visibility/absence, containment, and reconciliation
   are distinct evidence. No one success flag may collapse them.
8. **Make takedown adverse-first.** Batch-reprove current public eligibility at
   result time, fail closed on unknown, priority-delete stale rows, retain a
   versioned tombstone, and prove physical absence without enumeration.
9. **Keep visitor UX simple.** Submitted GET search, normal links, small
   optional filters, D16 windows, progressive suggestions, useful zero/error
   states, accessible announcements, and `noindex` result URLs.
10. **Keep staff UX quiet and measurable.** Show one derived state, safe owner,
    oldest lag, and only the cause-owned retry/reconcile/rebuild action—no
    database/provider tuning or unsafe identity in telemetry.
11. **Specify rebuild as a generation change.** Shadow build, verify, anomaly-
    gate unexplained mass deletion, atomically switch, retain the prior active
    generation on failure, and bind rollback to D1.
12. **Protect query privacy and database capacity.** Bounded parsing, prepared
    queries, rate/concurrency/time limits, no raw-query logging by default, and
    load-tested indexes are ship gates.

### Must be proven before shipping

1. Every participating source emits only its exact approved public fields;
   restricted/draft/private/retired/orphaned fixtures are absent from rows,
   suggestions, filters, counts, logs, analytics, errors, and timing buckets.
2. Cross-Tenant, environment, Site, locale, audience, generation, source, and
   cache tests fail closed even with forged/duplicate/array query parameters.
3. Publish, edit, redirect, unpublish, consent withdrawal, Phase 10
   reclassification, late/duplicate/out-of-order events, rebuild, provider
   outage, D1 activation, and rollback converge idempotently.
4. Failure injection at source commit, target write, ledger creation, event
   acceptance, worker start, provider acceptance, provider visibility, and
   verification proves no lost target, false success, unsafe hit, or duplicate
   effect—including replay after Inngest's 24-hour event-dedupe window.
5. Old delete versus valid republication, recovery backlog, empty source
   snapshot, mass-delete anomaly, expired claim, provider timeout after success,
   and dead-letter/manual replay preserve the newest target and fail closed.
6. Full and source-specific rebuilds prove current membership, progress,
   resumable failure, deletion, atomic switch, and preservation of the prior
   active generation on failure.
7. Relevance fixtures cover exact title, phrase, stemming, stop words,
   punctuation, accents, typo fallback, safe subject/tags, recency policy,
   deterministic ties, unsupported locales, and no-match behavior.
8. `EXPLAIN (ANALYZE, BUFFERS)` and production-shaped synthetic load prove
   index use and latency/cost budgets for normal, short, broad, malicious,
   filtered, suggested, and later-window queries plus concurrent rebuilds and
   the shared ledger's 25-row/five-minute worst-case recovery backlog.
9. Server HTML, no-JavaScript, keyboard, screen-reader, touch, 320 CSS-pixel,
   zoom, RTL, reduced-motion, Back/Forward, refresh, canonical parameter,
   status-announcement, zero/error, and search-result `noindex` tests pass.
10. Exact pinned Payload/plugin qualification proves draft deletion,
    locale/Site skip behavior, awaited transaction/request propagation, access
    posture, hooks, reindex, failure, and upgrade behavior before adoption.

### Address soon after launch

- Measure aggregate query latency, result/zero/error buckets, index lag,
  source-family participation, suggestion acceptance, filter use, D16 window
  depth, rebuild duration, deletion SLO, and database cost without retaining
  sensitive query text.
- Review real anonymized query-quality sessions with tenants before changing
  rank weights, enabling custom synonyms, or adding source-family facets.
- Define numeric exit criteria for a hosted engine: sustained corpus/query
  volume, measured Postgres contention, unmet language relevance, required typo
  quality, or operational SLO—not sales claims or hypothetical scale.

### Monitor; do not prebuild

- Semantic/vector search, personalization, “popular searches,” voice search,
  geo search, donor-specific ranking, federated multi-Site search, raw-query
  dashboards, arbitrary tenant weights, custom query builders, and external
  provider adoption.
- Public search over Opportunities, Events, or later families until their own
  phases expose qualified public Search Documents.
- Cross-locale search and tenant-managed synonym dictionaries until real
  language evidence shows the code-owned configuration is inadequate.

## Founder decision — ratified as Phase 23 D17

**How should one tenant Site search all currently approved public content
without making Payload, Postgres, or a future vendor the publication and safety
authority?**

- **A — Payload Search Plugin as product:** smallest CMS path, but incomplete
  across operational public projections and too coupled to static Payload
  copies.
- **B — Direct source UNION at request time:** avoids an index, but duplicates
  ranking/safety/paging and couples public reliability to operational stores.
- **C-prime-R — One source-owned public-safe Search Document contract and
  rebuildable index — Recommended:** Postgres FTS plus bounded `pg_trgm` behind
  one provider-neutral port; one bounded desired-versus-verified convergence
  target reuses Core's shared workflow execution seam; Payload may feed CMS
  sources only; dedicated service only after measured need.
- **D — Dedicated hosted engine now:** most features, but unjustified external
  cost, processing, deletion, isolation, and vendor complexity at current
  evidence.

The founder ratified the exact C-prime-R formulation in the Executive finding
as Phase 23 D17 on 2026-08-23. The Phase 23 decision log and ADR-0161 are the
durable decision authorities; this document remains supporting research and
does not independently expand the decision.

## Primary and repository sources

- [Payload — Search Plugin](https://payloadcms.com/docs/plugins/search)
- [Payload — Collection access control](https://payloadcms.com/docs/access-control/collections)
- [Payload — Multi-Tenant Plugin](https://payloadcms.com/docs/plugins/multi-tenant)
- [PostgreSQL 18 — Controlling text search](https://www.postgresql.org/docs/current/textsearch-controls.html)
- [PostgreSQL 18 — `pg_trgm`](https://www.postgresql.org/docs/current/pgtrgm.html)
- [PostgreSQL 18 — Text-search dictionaries](https://www.postgresql.org/docs/current/textsearch-dictionaries.html)
- [Supabase — Full Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [W3C WAI — G161: Providing a search function](https://www.w3.org/WAI/WCAG21/Techniques/general/G161.html)
- [W3C WAI — `role=status` search-results example](https://www.w3.org/WAI/WCAG21/working-examples/aria-role-status-searchresults/)
- [Google Search Central — Block search indexing with `noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [OWASP — REST Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
- [AWS Prescriptive Guidance — Transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
- [Inngest — Handling idempotency](https://www.inngest.com/docs/guides/handling-idempotency)
- [Inngest — Error handling and retries](https://www.inngest.com/docs/guides/error-handling)
- [Inngest — Flow control](https://www.inngest.com/docs/guides/flow-control)
- [Inngest — Rate limiting](https://www.inngest.com/docs/guides/rate-limiting)
- [Payload — Transactions](https://payloadcms.com/docs/database/transactions)
- [Algolia — Index operations are asynchronous](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/in-depth/index-operations-are-asynchronous)
- [Algolia — Handling concurrency with versioning](https://www.algolia.com/doc/guides/sending-and-managing-data/send-and-update-your-data/in-depth/handling-concurrency-with-versioning)
- [Elasticsearch — Aliases and atomic index switch](https://www.elastic.co/guide/en/elasticsearch/reference/current/aliases.html)
- [Google SRE — Monitoring distributed systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Google SRE — Service level objectives](https://sre.google/sre-book/service-level-objectives/)
- [OpenTelemetry — Metrics](https://opentelemetry.io/docs/concepts/signals/metrics/)
- [OpenTelemetry — Metrics SDK cardinality limits](https://opentelemetry.io/docs/specs/otel/metrics/sdk/)
- [Elasticsearch — Near real-time search](https://www.elastic.co/docs/manage-data/data-store/near-real-time-search)
- [Phase 10 — Sensitive data safety](../phase-10-sensitive-data-safety.md)
- [Phase 23 decision log](../phase-23-web-studio-cms-decision-log.md)
- [Phase 23 D14 research](phase-23-d14-dynamic-source-catalog-research.md)
- [Phase 23 D15 research](phase-23-d15-content-list-curation-research.md)
- [Phase 23 D16 research](phase-23-d16-dynamic-list-pagination-research.md)
- [Workflow orchestration specification](../../../../openspec/specs/workflow-orchestration/spec.md)
- [Workflow dispatch ledger migration](../../../../supabase/migrations/20260611134500_workflow_dispatch_ledger.sql)
- [Workflow work-claims migration](../../../../supabase/migrations/20260611181000_workflow_work_claims.sql)
- [Workflow dispatch ledger implementation](../../../../packages/api/src/workflows/ledger.ts)
- [Workflow recovery implementation](../../../../packages/api/src/workflows/recovery.ts)
- [Identifier-only workflow envelope](../../../../packages/api/src/workflows/events.ts)
- [D13 scheduled publication ADR](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [Payload configuration](../../../../apps/admin/payload.config.ts)
- [API package manifest with Inngest 4.5.1](../../../../packages/api/package.json)
- [Repository package manifest](../../../../package.json)
