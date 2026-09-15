# ADR-0022: Source-qualified conversation text and filename search

**Status: Fully founder-ratified, 12 September 2026.** The founder selected conversation text and attachment filenames and explicitly reserved broader/AI search for future scope. D1–D21 remain fully ratified. This is exploratory grooming, not formal specification or implementation authority.

Accept A with fully ratified D22-R01–R26, all 23 category findings, complete UX/data/evidence and adopted independent corrections, P01–P40, O01–O05 and four ratified glossary definitions. Keyword search should retrieve actual discussion through familiar filters and explainable source matches. Details-only is smaller; attachment-content search helps document-only clues but is expressly future scope with AI/OCR/extraction absent now.

The durable boundary is index eligibility plus current source/field/context authority, not merely readable data. Phase10 restricted-tier exclusions and ADR0031's Recent-copy exclusion remain hard floors. One item-scoped literal/phrase contract searches admitted qualified Support text/details/filenames, preserves original source/revision and D9 CRM source basis before D10 root grouping, and never indexes a copied survivor transcript or a second CRM. Queued/failed/automated replies, Notes and Staff context remain truthful source kinds.

Use one shared API/list/query owner with a private rebuildable Asym Postgres projection, qualified candidate retrieval and exact verification. Current serving gates precede asynchronous physical purge. Durable projection/revision control, complete pre-text-scope coverage, bounded queries and private query handles prevent false zero and stale disclosure. Unicode/punctuation semantics, safe highlights, Find beyond mounted messages and explicit scope/clearing keep the user journey understandable. Supported old query versions stay inside the same owner; no silently broadened saved-search meaning or parallel engine.

Future broader/AI retrieval reuses original source identity, current eligible projection/revision, coverage/mode and provenance through later Phase29/40/shared AI qualification. No vectors, model/provider calls, new keys, attachment extraction, generic plugin framework or AI placeholder UI is added now. Search creates no CRM, label, work, template, follow or communication effect; actual replies retain P17 preparation, Support admission and P6 tenant Resend delivery.

- [Exact decision, all categories, 40 proof groups and five controls](../../grill/phase26-d22-adversarial-review.md)
- [Complete staff/filter/result/Find/CRM UX](../../grill/phase26-d22-search-ux.md)
- [Source/query/DB/lifecycle/future-extension contract](../../grill/phase26-d22-data-contract.md)
- [Evidence and independent synthesis](../../grill/phase26-d22-evidence.md)
- [Source hashes](../../grill/phase26-d22-source-evidence.json)
- [Limited existing-matcher experiment](../../grill/phase26-d22-source-experiments.json)
- [Preservation and consistency validation](../../grill/phase26-d22-validation.json)

All 40 runtime/database/RLS/index/privacy/concurrency/migration/restore/capacity/browser/accessibility/staff proof groups remain required and unexecuted. The isolated matcher expression/algebra and documentary validation are not production readiness. The complete amendment package is fully founder-ratified. Continue to Q23 as an unanswered researched question. No formal specification, implementation, ticket, external mutation or real message is inferred.

## Founder ratification — 12 September 2026

> Yes, I ratify this, including all the amendments, additions, adjustments, changes, and updates you’ve made. Record the ratified decision and all changes in full for this grill-with-docs session. Make sure the seam and role of the email studio is well documented.

The founder fully ratifies **A — Conversation text and attachment filenames** and every adopted amendment, addition, adjustment, change and update in the D22 package. Acceptance includes **D22-R01–R26**, all **23 category findings** and their severity, likelihood, evidence, decision effects and permanent corrections; the complete UX and data/query/lifecycle/CRM contracts; every adopted independent correction and source qualification; the **four glossary definitions**; **P01–P40**; and **O01–O05**, including their signals, thresholds, owners and responses. The substantive review and companions remain preserved in full. This acceptance does not replace them with a summary.

### Accepted source coverage and permanent boundaries

Current keyword search covers eligible Support details, admitted messages and internal notes, qualified D12 Staff context and permitted attachment filenames. Source kind and delivery state remain truthful: an admitted queued, failed or uncertain reply is not labelled Sent or Delivered. Search never substitutes a combined transcript or arbitrary CRM properties for original source identities and revisions.

Index eligibility is separate from read permission. Phase10 restricted-tier and P9 care/finance-provenance exclusions remain governing floors. There is no direct-scan bypass for data whose indexing is forbidden. Private drafts, unadmitted prepared candidates, raw MIME/headers/provider bodies, D19-held intake, Email Studio reusable sources and P6/P17 Recent copies are outside the corpus. ADR0031's prohibition on using Recent as search authority remains explicit.

Broader search and AI-assisted conversation search are recorded as the founder's future direction, outside current scope. No attachment extraction, OCR, semantic answers, embeddings, provider/model calls, speculative vector columns or disabled AI controls are authorized now. Later qualification reuses typed original source/revision, eligibility, coverage, mode and provenance through the appropriate Phase29/40/shared AI boundaries.

### Accepted matching, filters and complete user journey

One item-scoped literal fragment/quoted-phrase contract requires all atoms within an eligible original source item. It permits partial-word fragments, preserves punctuation and uses versioned Unicode NFC/full casefold/whitespace normalization. It adds no stemming, accent stripping, implicit Boolean language, wildcard, regex or fuzzy meaning. Straight and paired curly quotes, escaping, incomplete-input guidance and literal apostrophes follow the complete companion contract. Bounds remain 256 Unicode scalar values, 1,024 UTF-8 bytes and 16 atoms. A single-character query is valid; an actual resource limit calls for Refine search, never a false zero or falsely complete capped result.

Redacted or hidden gaps cannot create substring/phrase adjacency. Unquoted atoms may occupy separate permitted visible runs of the same source item; different fields or messages cannot jointly satisfy an item match. The explicit Person or email filter supplies permitted cross-field refinement without turning email into identity or disclosure authority.

The existing search field, Status/Assignee/Labels and qualified Filters remain the primary interface. Search in adds a compact source refinement with All, Details, Messages, Notes, Staff context and Attachment names. The initial 200ms debounce is IME-aware and cancellable, with Enter immediate; it is not a latency promise. Existing explicit user/saved sort survives. A new unconfigured text search uses the exact-reference-first, then original-source-recency Best match order with unknown time last and stable ties; no occurrence-frequency score. Transient search ordering does not overwrite saved queue ordering.

Clear search retains filters and makes Search in dormant when text is blank. Clear filters keeps text, resets Search in and ordinary refinements, preserves inbox/view identity as Modified and mandatory CRM/report context. Reset view remains distinct. Search all my accessible Support conversations explicitly broadens ordinary work scope while retaining query/Search in and all access boundaries; leaving a mandatory CRM/report context requires explicit Open in Support Hub with return context. An exact ID is not a scope bypass.

One current root result follows original-source authority and exact matching before D10 grouping, count and pagination. Safe excerpts identify their source kind and navigate to the current qualified original source/revision. Filename lookup never automatically fetches bytes. Find in conversation searches the complete eligible retained source population rather than mounted DOM and preserves CRM/report basis; an empty Find clears highlights/navigation. Loading, indexing/incomplete coverage, errors, Refine search, true no matches and changed results remain distinguishable.

### Accepted database, privacy, concurrency and recovery contract

One shared API/list/query owner uses a private rebuildable Asym PostgreSQL projection, qualified candidate retrieval and exact verification. No external search engine or parallel legacy engine is introduced. pg_trgm remains subject to actual extension/index/plan qualification. Candidate or chunk boundaries cannot alter match truth. Pre-text eligible scope determines completeness; completeness is not inferred only from returned candidates.

Current tenant/source/field/context gates apply before hits, rank, count and snippets and again at navigation. D9 CRM association with one original source does not expose another through merge; D12 related conversations remain independent. Tenant-aware references, private grants, both RLS USING/WITH CHECK, immutable attribution, parameterized queries and service/definer/worker paths must enforce the same boundaries. No query/result action mutates Party identity, ownership, CRM records, giving or care data.

Source admission and a durable projection intent or discoverable gap commit atomically. Revision-ordered, idempotent jobs reread current sources without body copies in events. Index failure cannot prevent otherwise qualified authoritative source admission. Immediate serving restrictions at redaction, expiry or reclassification precede bounded physical cleanup; restore barriers prevent resurrection. No instantaneous-erasure claim is made.

Complete predicates precede count/page limits. Continuations bind the current query/scope and revisions; changed live results require truthful Refresh semantics rather than an invented snapshot. Highlighting escapes current source text and maps normalized offsets to original graphemes. Query handles are authenticated and bounded; raw queries do not enter URLs, referrers, telemetry or a new recent-search archive. Cache generations include tenant, principal, scope and relevant versions.

Saved coverage/parser/normalizer versions preserve supported meaning inside the same owner or require reviewed reconciliation. There is no silent broadening on upgrade. D21 component-first report cohorts remain exact through drilldown rather than substituting a root-createdAt filter. Finite source/derived retention, body-free diagnostics, durable lifecycle receipts and current permissions extend across caches, exports, backups and restores.

### Email Studio, delivery and acceptance evidence

The [explicit Email Studio integration record](../../grill/phase26-d22-email-studio-integration.md) documents the accepted seam: P17 owns reusable authoring, qualified presentation and exact preparation; Support owns source eligibility, search, current draft/recipients and admission; Phase6 owns actual delivery/evidence using the tenant's qualified Resend connection. Search itself does not prepare, publish or send, requires no new Email Studio template and never searches the library or Recent as a fallback. Later human replies retain their independently authorized P17 → Support → P6 path. D13's Support request received template and eligibility remain separate. Search cannot trigger a confirmation, follow, label, CRM interaction or business action.

Additive inventory/backfill, original timestamps and explicit unknown history, old-writer/URL/fixture fencing, stop controls, safe roll-forward and restore barriers remain required. All 40 proof groups remain required and unexecuted: documentary/source checks and the isolated existing-matcher experiment do not prove the new parser, SQL, RLS, capacity, browser, accessibility or operational implementation.

**Accept with required amendments** remains the historical adversarial disposition; all adopted amendments are now fully accepted. Earlier proposed/pending/no-Q23 wording in preserved substantive evidence is superseded as to acceptance and advancement only. D1–D21 remain fully ratified and unchanged. Continue to one researched Q23 with real alternatives and one recommendation, without repeat D22 approval. The [ratification validation](../../grill/d22-ratification-q23-validation.json) records preservation and current status separately from the unchanged historical D22 validation. This remains grooming, not formal specification, implementation, tickets, GitHub/provider/DNS/credential changes or permission to send real messages.
