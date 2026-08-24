# ADR-0161: Derived Public Site Search Projection and adverse-first convergence

**Status:** Accepted (founder-ratified Phase 23 D17 C-prime-R, 2026-08-23)

## Context

Phase 23 needs one donor-facing search product across qualified CMS Pages and
source-owned public projections without making Payload, PostgreSQL, a future
provider, or the index itself publication or safety authority. The difficult
trade-off is preserving useful eventually consistent discovery while ensuring
that a withdrawal or Phase 10 restriction stops being discoverable immediately,
even when dispatch, indexing, deletion, caches, or an external provider lag.

## Decision

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

## Consequences

- D17 owns one disposable public discovery projection, public query/ranking
  contract, and purge-convergence proof. It never becomes content, publication,
  path, subject, consent, permission, Phase 10, designation, or financial truth.
- Launch remains PostgreSQL-first. Payload may feed CMS sources only through the
  same safe contract, and a dedicated provider requires measured exit evidence.
- One Public Search Convergence Target records newest desired versus verified
  state. Existing shared dispatch, claims, retries, recovery, and dead letters
  execute it; D17 does not create parallel workflow infrastructure.
- Favorable discovery lag may temporarily omit new content. Adverse changes
  fail closed at one bounded batch admission proof before asynchronous physical
  deletion and reconciliation finish.
- A deletion receipt proves exact absence from the active D17 index only. It
  makes no claim about source history, backups, browsers, archives, or external
  crawlers.
- Normal updates are incremental. Shadow generations are reserved for broad
  rebuild, contract, ranking, migration, or provider changes and never create a
  second Site activation authority.
- Search-result telemetry excludes raw query text, public content, restricted
  identity, and unbounded Tenant/Site metric labels. Authorized operations use
  restricted correlation and one exception-first health view.
- Phase 22 ministry-directory search and Phase 40 global or AI search retain
  independent contracts, endpoints, permissions, indexes, and lifecycle facts.

## Rejected alternatives

- Payload Search Plugin as the complete public-search product, because it is
  collection-oriented, copies source fields, and cannot safely own cross-source
  membership or Phase 10 authority;
- querying every source directly and unioning results per public request,
  because it duplicates ranking, pagination, failure, scope, and safety logic
  while coupling public latency to operational stores;
- adopting a dedicated hosted search provider at launch without measured
  language, quality, scale, latency, or operational need;
- inserting draft or restricted records and filtering them after retrieval;
- per-result remote source calls, a D17 queue or scheduler, per-tenant cron,
  manual index-row repair, arbitrary tenant SQL/ranking, raw-query analytics,
  vector search, personalization, or tenant-managed synonym infrastructure;
- treating event acceptance, provider acknowledgement, cache invalidation, or
  worker completion as proof of query visibility or deletion; and
- binding a derived search generation as a second D1 activation or restoring an
  older generation without current admission and safety proof.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- strict Search Document and Public Search Convergence Target normalization,
  versioning, serialization, export, retained-reader, and successor migration;
- exact Tenant, environment, Site, locale, audience, D1 generation, source,
  identity, provider, and cache isolation with forged and duplicate inputs;
- absence of draft, private, restricted, retired, orphaned, and disallowed data
  from rows, snippets, suggestions, facets, counts, logs, analytics, errors, and
  timing side channels;
- idempotent publish, update, route change, unpublish, consent withdrawal,
  Phase 10 reclassification, republish, duplicate/late delivery, D1 activation,
  rollback, and replay beyond Inngest's duplicate-event window;
- failure injection at source commit, convergence-target write, dispatch,
  worker claim, provider acceptance, provider visibility, exact verification,
  cache convergence, reconciliation, and dead-letter recovery;
- newest-state victory for old delete versus valid republication, durable
  watermark behavior, safe empty-source handling, and mass-deletion anomaly
  guards;
- bounded set-based admission proof with no per-hit source N+1, indexed query
  plans, production-shaped load, malicious input, suggestions, later windows,
  concurrent rebuilds, and shared-recovery backlog;
- full/source rebuild checkpoints, safe identity/version comparison, adverse
  absence proof, atomic derived-head switch, and prior-safe-generation
  continuity on failure;
- server HTML, no-JavaScript, keyboard, screen-reader, touch, 320-pixel reflow,
  zoom, RTL/CJK, reduced motion, Back/Forward, zero-result, unavailable,
  canonical query, status-announcement, and `noindex` behavior; and
- low-cardinality quantitative health for favorable lag, adverse containment,
  physical absence, retry/dead-letter, drift, reconciliation, and rebuilds,
  with quiet healthy Sites and actionable cause-owned escalation.

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

## References

- [Phase 23 D17 primary-source research, UX, adversarial review, and proof gates](../prds/sitestacker-parity/research/phase-23-d17-public-site-search-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and Content List](./0158-versioned-dynamic-source-catalog-and-content-list.md)
- [ADR-0159 — Three bounded Content-list curation strategies](./0159-three-bounded-content-list-curation-strategies.md)
- [ADR-0160 — Link-native Public Page Windows and bounded list discovery](./0160-link-native-public-page-windows-and-bounded-list-discovery.md)
- [Workflow orchestration specification](../../openspec/specs/workflow-orchestration/spec.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
