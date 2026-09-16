# Phase 23 D25 — Whole-Site Preview Supabase/Postgres Research

**Status:** supporting evidence for founder-ratified Phase 23 D25 C-prime-R; not an implementation plan  
**Researched:** 2026-08-23  
**Scope:** the minimum production-grade Supabase/Postgres contract for a private, complete, whole-Site candidate preview that remains subordinate to Phase 23 D1 and D9–D24

## Executive conclusion

`C-prime` is sound only if “Preview environment” means a **logical, immutable candidate compiled by D1**, not a second mutable Site head, a copied database, a Supabase branch, or a query over every current draft.

The permanent design should be:

> One immutable, complete, private **Whole-Site Preview Candidate** for one exact `Tenant × environment × Site × locale`, compiled by D1 from an explicit vector of exact, server-acknowledged revisions over the current public generation—or D1’s code-owned empty genesis before a first release. It is browsable only by currently authorized Site staff through the private Studio experience; is complete or unavailable; has no activation authority; creates no public cache, search, analytics, or transactional side effects; and never mutates as editors keep working. A newer exact selection creates or reuses a successor candidate. Release remains a separate D1 operation that revalidates all current authority, safety, dependency, and compatibility conditions.

That contract gives staff the confidence of navigating the proposed Site without introducing another source of truth. It also fits Supabase well: a small tenant-scoped receipt, immutable private artifacts, current database-backed authorization, short idempotent transactions, compare-and-swap finalization, bounded expiry, and observable cleanup.

## What D25 inherits and must not redefine

D25 is an experience over settled Phase 23 contracts, not a new publishing architecture.

- **D1:** one immutable, content-addressed Public Site Generation and one small serving head per exact `Tenant × environment × Site × locale`; compilation happens before a short all-or-none activation transaction. D25 must reuse that compiler and graph model but must never become another serving head.
- **D9–D10:** the candidate pins a certified Site presentation-package version and uses complete-cohort rules where those rules apply. It cannot load arbitrary tenant code or partially activate a package cohort.
- **D11–D12:** rich text and editor state enter the candidate only as exact, server-acknowledged revision IDs. Unsaved browser state and a mutable “latest draft” query are not candidate inputs.
- **D13:** a scheduled appointment still releases its exact revision through D1. A preview receipt is not schedulable or releasable.
- **D14–D15:** dynamic-list configuration and Page-local curation are pinned exactly. Operational dynamic membership intentionally remains the current public-safe projection and must be labelled with an “as of” time; safety suppression remains adverse-first.
- **D16–D17:** candidate navigation uses link-native Page windows, while candidate content is excluded from the public search projection, sitemaps, canonical feeds, and discovery analytics.
- **D18–D21:** folders and saved views confer no authority; Trash remains reference-aware and adverse-first. A trashed, disabled, or newly unsafe resource cannot remain visible merely because an older candidate named it.
- **D22:** a whole-Site candidate has exactly one BCP-47 locale lineage. Locale switching selects or prepares another complete candidate; there is no silent field fallback or mixed-locale candidate.
- **D23:** the candidate covers CMS-owned public Site routes only. Host resolution remains `host → Site → Tenant`, and ordinary content remains Site-owned.
- **D24:** the candidate is a currently authorized private Studio surface, not a new public audience. Authenticated donor, missionary, and staff application surfaces remain app-owned.

## Canonical terms

Use these terms consistently in database records, APIs, telemetry, UI copy, and tests:

- **Whole-Site Preview Candidate:** one immutable, complete, private D1-compiled candidate for one exact Site and locale.
- **Candidate selection:** the exact acknowledged revision and dependency vector requested for the candidate.
- **Base generation:** the current public D1 generation structurally reused for unchanged resources.
- **Preview workspace:** the authenticated Studio UI that creates and browses candidates.
- **Preview receipt:** the small database record proving candidate scope, inputs, build outcome, compatibility, and expiry.

Avoid “preview site,” “preview head,” “staging database,” and “latest preview.” Those phrases imply mutable authority that the contract does not have.

## Exact candidate semantics

### Whole Site means one exact Site and one locale

A candidate contains a complete, navigable route graph for one exact `Tenant × environment × Site × locale`. It must not silently cross Site, tenant, environment, or locale boundaries. Links to a route inside that graph preserve the exact candidate context. A route absent from the candidate returns a candidate-scoped 404; it never falls through to the live route.

Locale switching is explicit. The UI can offer another available locale, but selecting it opens or prepares that locale's own candidate and clearly names the locale. This preserves D22's exact locale lineage and avoids content assembled from incompatible translations.

### The selection is explicit, not “all current drafts”

From a Page editor, the safest default selection is:

1. wait for the current D12 save acknowledgement;
2. select that exact Page revision;
3. add the exact required dependency closure;
4. reuse the active public D1 generation for unchanged resources, or D1’s
   code-owned empty genesis before a first release; and
5. show a concise “Included changes” summary before or while the candidate builds.

Navigation, path, removal, presentation-package, topic-profile, curation, and other Site-wide changes enter only when explicitly present in the selection receipt. The builder must not sweep mutable “latest drafts” across the tenant. Such a sweep is non-repeatable, can include another editor's unfinished or unauthorized work, and makes the preview impossible to explain.

If the candidate starts from a review, scheduled publication, or future release-plan selection, it uses that already-exact selection instead. An identical normalized selection under the same compiler and package contracts should reuse the same ready candidate while it remains safe and unexpired.

### Dynamic content remains honestly dynamic

D14 intentionally pins the Dynamic Content List configuration but not every matching operational row. D25 must preserve that contract. Candidate copy should say, for example, “Dynamic results use currently eligible public data · updated 14:32,” rather than promising a fully frozen Site snapshot.

The resolver used by preview and public output must be the same public-safe resolver. A current safety or visibility change suppresses a row immediately, even if the candidate was built earlier. No preview convenience can override the adverse-first rule.

## Minimal persistence model

Prefer reusing D1's candidate-manifest and artifact machinery. D25 should add only a narrow preview-purpose receipt or purpose discriminator where the D1 design genuinely requires it. Do not duplicate Page bodies, rich-text trees, navigation records, source records, user permissions, or the public generation in a preview schema.

The logical `PreviewCandidateReceipt` needs only:

- opaque `candidate_id`;
- `tenant_id`, `environment`, `site_id`, and normalized locale;
- fixed purpose `whole_site_preview`;
- normalized `request_digest` and `selection_digest`;
- exact `base_generation_id`;
- compiler-contract, schema-envelope, catalog, and presentation-package versions;
- immutable manifest hash and private artifact locator after success;
- creator, created, ready/failed, and fixed expiry timestamps;
- bounded state: `preparing`, `ready`, or `failed`;
- a monotonically increasing build attempt/generation used for compare-and-swap;
- safe failure-code enum, artifact count, and total bytes; and
- cleanup markers required by the existing retention/replay pattern.

`expired` should normally be derived from `expires_at`; it does not require a write on first access. `purged_at` may remain on a small, retention-bounded receipt after artifact deletion if operations need proof. Do not add a database row per visitor, navigation, route view, or refresh.

If D1 already stores a relational member manifest, every child relationship must carry or constrain the full scope (`tenant_id`, environment, `site_id`, `candidate_id`) and have matching indexes. Otherwise, keep the full immutable manifest in private content-addressed object storage and store only its verified hash and bounded summary in Postgres. A bare foreign key is not a tenant boundary: PostgreSQL documents that integrity checks can bypass row security and therefore can create covert channels if scopes are not structurally constrained ([PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).

### Required uniqueness and query shapes

Use constraints rather than read-then-insert logic:

- one canonical candidate per exact scope plus normalized request digest and compatible compiler/package contract;
- one idempotency key per tenant-scoped candidate request, with the original request digest stored so replaying the key with different input is a conflict;
- one immutable manifest hash per ready receipt; and
- composite tenant/Site scope constraints on every candidate relationship.

PostgreSQL's unique indexes and `INSERT ... ON CONFLICT` provide atomic duplicate handling under concurrency ([unique indexes](https://www.postgresql.org/docs/current/indexes-unique.html), [`INSERT`](https://www.postgresql.org/docs/current/sql-insert.html)). A reasonable index set follows actual hot queries rather than indexing every field:

- unique equality lookup by exact scope and request digest;
- bounded cleanup lookup by state/expiry, preferably a partial index over unpurged receipts;
- exact candidate lookup constrained by tenant, environment, Site, locale, and ID; and
- all foreign-key support indexes used by deletion and cleanup.

Validate the final shapes with `EXPLAIN (ANALYZE, BUFFERS)` on representative maximum-Site data and `pg_stat_statements`; indexes speed reads but add write and storage cost ([PostgreSQL indexes](https://www.postgresql.org/docs/current/indexes.html)).

## Authorization and tenant isolation

### One Site-wide preview capability

A whole-Site candidate can reveal routes, navigation, unpublished copy, filenames, and relationships far outside the Page the editor began on. Therefore the entry capability must authorize whole-Site preview for the exact tenant, environment, Site, and locale. A Page-only editor receives a Page-local exact preview, not a partially redacted whole-Site candidate. Partial redaction both leaks graph shape and creates a misleading “complete” preview.

The system must recheck current authorization on every candidate request. Candidate ID possession, a copied URL, creator identity, a stale JWT claim, folder membership, or previous access is not authority. After sign-in, another currently authorized staff member may follow a copied internal URL; an unauthorized user learns no candidate details.

Supabase JWTs are intentionally self-contained and remain valid until expiry, so claims can be stale after membership or permission changes ([Supabase JWT guide](https://supabase.com/docs/guides/auth/jwts)). For this sensitive draft surface, use `auth.uid()` to identify the actor and query the current Phase 12 membership/capability source. Do not rely solely on `app_metadata`, a client-provided tenant, or the candidate creator.

### Server boundary first; RLS as defense in depth

The repo's data-access boundary should own preview creation and rendering. Browser code must not query preview tables or Storage directly as its primary integration. Even in a private schema, tenant-scoped preview records need Row Level Security and least-privilege grants as defense in depth.

The RLS contract is:

- enable RLS on every preview/candidate table reachable by an API role;
- default deny when no exact policy applies;
- require an explicit row predicate for tenant, environment, Site, and current membership/capability;
- index policy filter columns;
- scope policies to named roles and operations rather than a broad `authenticated` catch-all;
- wrap fixed authentication helpers as scalar subqueries where the planner benefits, as Supabase recommends; and
- place any `SECURITY DEFINER` helper in a non-exposed schema, use an empty/fixed `search_path`, revoke broad execution, and keep it narrowly scoped.

Supabase stresses that grants and RLS policies work together, recommends indexing policy columns and `(select auth.uid())`-style fixed helpers, and notes that the `service_role` bypasses RLS ([Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security)). PostgreSQL likewise notes that table owners and `BYPASSRLS` roles normally bypass policies; `FORCE ROW LEVEL SECURITY` is available when owner behavior must be constrained ([PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).

### Privileged worker rule

A background compiler may need a server-only privileged role. RLS does not make that role safe. The worker must receive only an opaque, already-created candidate request ID; reload the authoritative receipt; bind every read and write to its stored scope; validate expected state and attempt; and never accept tenant/Site/locale values from an event as independent authority. Keep service keys server-side.

This follows the repo's existing idempotent request/outbox posture and prevents a forged or malformed delivery event from becoming a cross-tenant compiler command.

## Candidate construction and finalization

### 1. Authorize and acknowledge

The server checks the exact Site-wide capability and current Site/locale lifecycle. When launched from an editor, it waits for the exact D12 acknowledgement and displays the acknowledged revision before preparing the candidate.

### 2. Create or reuse an idempotent receipt

Normalize the selection, compiler contract, presentation package, base generation, and locale into a request digest. Atomically insert or reuse one `preparing`/`ready` receipt. Reusing an idempotency key with different input is a visible conflict, never an overwrite.

### 3. Seal the exact input vector in a short transaction

If all selection roots already name immutable revisions, validate and record those IDs directly. If several mutable relationship reads must be reconciled, capture the resulting immutable IDs in one short repeatable-read or equivalent receipt transaction. PostgreSQL `READ COMMITTED` can observe different committed states across statements, whereas repeatable read gives a stable transaction snapshot ([transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)).

Do not render, call external APIs, upload objects, or traverse the full graph while holding the transaction open. A stable receipt, not a long lock, is the consistency boundary.

### 4. Compile and upload outside the transaction

Use the D1 compiler and the exact D9 presentation package. Build with bounded per-Site and global concurrency. Store candidate-only output under opaque, tenant/Site-scoped, content-addressed private keys. Upload resources first and an immutable manifest last.

### 5. Finalize all-or-none with compare-and-swap

After verifying the manifest hash, required artifact count, storage presence, compatibility versions, and current build attempt, update the receipt to `ready` in a short conditional transaction only when:

- the row is still `preparing`;
- the expected attempt/generation matches;
- the candidate has not expired or been cancelled; and
- no current adverse safety condition makes the candidate invalid.

Stale and out-of-order workers lose the compare-and-swap and may only schedule orphan cleanup. No public serving head changes. Missing artifacts leave the candidate failed/unavailable, never partially browsable.

### 6. Browse an exact immutable candidate

The authenticated preview URL names the opaque candidate ID and route, but the URL is not a bearer credential. Every request resolves host/Site/Tenant, rechecks current authority and safety, loads the exact ready/unexpired compatible receipt, and renders through the same D1 public compiler contract.

Internal links retain candidate context. The workspace shows candidate locale, build time, included-change summary, and a quiet “Newer saved changes are available” notice when appropriate. It never silently advances the current browsing session to another candidate.

### 7. Release separately through D1

“Publish” never flips a preview candidate into public service. D1 creates/revalidates a release candidate from the exact intended selection and current authority, safety, path, package, dependency, and locale state. Qualified content-addressed artifacts may be reused after reproof; the preview receipt itself has no activation authority.

## Private artifact and HTTP contract

Use a private Storage bucket or the existing private D1 candidate store. Supabase private buckets require an authenticated request subject to `storage.objects` RLS or a server-generated signed URL, while public buckets bypass read access controls ([Storage access control](https://supabase.com/docs/guides/storage/security/access-control), [bucket fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals)).

For D25:

- prefer a server-authorized streaming/render route or authenticated Storage request with current authorization;
- do not use a signed URL as the sole long-lived authority and do not expose list permission;
- never place candidates in a public bucket;
- treat opaque object names as identifiers, not authorization;
- scope keys and metadata to the exact tenant/environment/Site/locale/candidate;
- send `Cache-Control: private, no-store`, `X-Robots-Tag: noindex, nofollow, noarchive`, and an appropriate restrictive referrer policy on preview responses;
- omit canonical, sitemap, feed, Open Graph crawler, and public search registration; and
- ensure logs, errors, and telemetry never record preview content or secret-bearing URLs.

Immutable artifact bytes can be reused server-side by verified content hash. Candidate HTML/API responses must not enter a shared public CDN cache. A cache key that omits tenant, Site, locale, candidate, package, or safety version is a cross-tenant disclosure risk.

## Production-data and side-effect safety

Whole-Site preview reads the same current public-safe operational projections needed to render realistic pages; it does not clone production data. It must not write production business data.

- Forms, comments, subscriptions, likes, prayer responses, checkout creation, and other mutations are disabled in candidate context with calm explanatory copy.
- A giving or authenticated-app CTA may provide an explicit “Open live experience” escape that exits preview context; it must not quietly perform a live transaction from inside preview.
- Candidate browsing creates no per-view database writes, public analytics events, public search updates, donor events, or automation triggers.
- Preview-only diagnostics use bounded operational telemetry, not application records masquerading as test data.

A Supabase Branch is the wrong primitive. It is an environment-level database branch intended for development workflows, not a tenant/Site candidate. Per-candidate branches would copy or expose too much data, complicate migrations and secrets, create cost and cleanup hazards, and still would not solve D1 exact revision selection.

## Expiry, cleanup, and cost controls

Use a simple code-owned policy rather than tenant-configurable lifecycle machinery:

- fixed ready-candidate TTL (seven days is a reasonable initial product default, subject to the repo's retention policy);
- a much shorter build lease for abandoned `preparing` receipts;
- rebuild on demand after expiry;
- no `last_accessed_at` write on every route request;
- one in-flight build per exact request digest, with bounded per-Site and global concurrency;
- explicit maximum route, artifact, byte, and compile-time budgets with actionable failure copy; and
- structural reuse of unchanged active-generation artifacts where safety and access permit.

Cleanup must be bounded and idempotent. Workers claim a small ordered batch, ideally using the repo's existing dispatch/outbox pattern and `FOR UPDATE SKIP LOCKED` where multiple cleanup workers compete. Delete private objects, confirm or retry deletion, then mark or remove the receipt according to retention policy. Track orphan objects, deletion lag, bytes awaiting purge, and repeated failures. Never cascade from Page/Site deletion into an unbounded synchronous Storage purge.

For serverless/edge access, Supabase recommends the transaction pooler; transaction mode does not support prepared statements, so the database client must be configured accordingly ([connecting to Postgres](https://supabase.com/docs/guides/database/connecting-to-postgres)). Apply statement and lock timeouts, keep transactions short, and make retries idempotent.

## Failure behavior

| Failure                                                                      | Safe, user-visible behavior                                                     | Recovery                                                          |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Save has not been acknowledged                                               | “Saving your changes…”; candidate creation waits                                | Resume after exact D12 receipt                                    |
| Compile or Storage upload fails                                              | No partial candidate; public Site and previous exact candidate remain untouched | Retry same idempotent receipt/attempt or prepare a successor      |
| Newer save occurs during build                                               | Candidate remains the labelled exact older selection                            | Offer, never force, “Preview newer changes”                       |
| Permission or membership is revoked                                          | Candidate becomes inaccessible immediately                                      | Reauthorize through the current authority source; no cached grant |
| Site, locale, package, or referenced content becomes unsafe/disabled/trashed | Fail closed or suppress adverse-first; never fall back live                     | Rebuild from a currently valid exact selection                    |
| Candidate expires while open                                                 | Clear expired state; never redirect to live or another candidate silently       | One action prepares/reuses a current candidate                    |
| Worker finishes out of order                                                 | Stale compare-and-swap fails; artifacts are orphan-cleanup candidates           | Current attempt continues unaffected                              |
| Artifact is absent or hash mismatches                                        | Candidate is unavailable, not partially rendered                                | Mark failure, alert operations, rebuild                           |
| Reader/compiler/package version is incompatible after deploy                 | Block with precise compatibility state                                          | Retained N/N+1 reader or rebuild with current contract            |
| Candidate route does not exist                                               | Candidate-scoped 404 with navigation back to candidate home                     | Correct selection/path and build a successor                      |
| Database, pooler, or authorization dependency is unavailable                 | Private preview is temporarily unavailable; public head is unaffected           | Retry with bounded backoff; surface request correlation ID        |

## Observability contract

Record bounded, non-content telemetry keyed by opaque correlation IDs:

- queue age, build duration, manifest-seal duration, and finalization duration;
- candidate created versus deduplicated/reused;
- safe failure-code counts and retry counts;
- route/resource/artifact counts, bytes, and structural-reuse ratio;
- object-orphan count, expired backlog, deletion lag, and bytes awaiting purge;
- exact candidate route misses and incompatible-reader blocks;
- authorization denials and post-creation revocations without titles, names, copy, or raw URLs;
- database query count/latency, lock/statement timeouts, pool saturation, and RLS denials; and
- first candidate-render latency and candidate render-error rate.

Use `pg_stat_statements`, query plans, and Supabase Database Advisors to detect expensive queries, missing foreign-key indexes, and unsafe RLS/search-path configuration ([Database Advisors](https://supabase.com/docs/guides/database/database-advisors)). Do not make operations depend on optional connection logs or a deprecated aggregate log endpoint. Supabase has announced migration away from the Management API `logs.all` analytics endpoint and has disabled `log_connections` by default for new projects and many existing Free/Pro projects ([logs endpoint migration](https://supabase.com/changelog/48235-migration-of-supabase-management-api-logs-all-analytics-endpoint-to-logs-endpoint), [`log_connections` change](https://supabase.com/changelog/47197-log-connections-is-to-be-turned-off-by-default-for-new-projects-and-existing-free-pro-projects)).

## Migration and rollback

The safe introduction is additive:

1. deploy the versioned receipt/envelope reader and private artifact support with candidate creation disabled;
2. validate RLS, grants, storage policies, query plans, cleanup, and N/N+1 manifest readers;
3. enable candidate creation for a bounded internal/tenant cohort without changing any D1 serving head;
4. shadow-check preview and public compiler parity on qualified fixtures;
5. expand gradually with cost and failure budgets; and
6. contract old envelope readers only after all retained candidates using them have expired or migrated.

No content backfill or public-head migration is required. Rollback disables new candidate creation, keeps compatible existing candidates private until expiry, and continues cleanup. It must not delete source revisions, mutate public generations, or require a lossy schema downgrade.

Version the manifest/envelope explicitly and test the deployed application against both the current and next supported PostgreSQL/Payload contracts. Use portable PostgreSQL features and expand/check/shadow/cutover/contract migrations rather than version-specific cleverness.

## Ruthless adversarial assessment

Every requested category was checked. “Material concern” below means the naive interpretation of C-prime creates a meaningful risk; the permanent contract above is the prevention.

| Category                          | Material concern? | What could go wrong and why it matters                                                                                                                       | Severity / likelihood  | Evidence or reasoning                                                                                          | Permanent prevention                                                                                                                                  |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**           | A mutable “latest drafts” candidate changes underneath the viewer, mixes saves, and becomes irreproducible.                                                  | High / High            | D12 exact acknowledgements and PostgreSQL statement-snapshot behavior make mutable multi-read assembly unsafe. | Seal exact immutable revision IDs and compiler/package versions; successor candidate for new saves.                                                   |
| Technical debt                    | **Yes**           | A second preview renderer, copied content schema, or preview head drifts from D1 and doubles every future publishing change.                                 | Critical / Medium      | D1 already owns graph compilation and serving generations.                                                     | Reuse D1 compiler/manifest/artifact primitives; add only a narrow purpose receipt.                                                                    |
| Edge cases                        | **Yes**           | Locale switches, trash/disable during build, dynamic membership changes, route removals, and out-of-order workers can produce mixed or misleading output.    | High / High            | D14, D21, and D22 deliberately require current safety and exact locale semantics.                              | One locale per candidate, adverse-first reproof, explicit dynamic “as of,” candidate 404, attempt CAS.                                                |
| Footguns                          | **Yes**           | “Preview everything” can expose coworkers' drafts; a preview form can create real donations or messages; a URL can be mistaken for a share token.            | Critical / Medium-High | Whole-Site closure is broader than Page authority and production data is live.                                 | Exact included-change summary, Site-wide capability, inert mutations, explicit live exit, URL never authority.                                        |
| Tenant safety                     | **Yes**           | An incomplete tenant predicate, cache key, Storage policy, worker event, or foreign-key relationship can cross tenants or Sites.                             | Critical / Medium      | Supabase service roles bypass RLS; PostgreSQL constraints can bypass RLS checks.                               | Full-scope constraints and cache keys, current membership check, explicit RLS/grants, opaque receipt reload in privileged jobs, negative tests.       |
| Overengineering                   | **Yes**           | Per-candidate Supabase branches, copied databases, per-viewer sessions, or a general lifecycle engine create cost and cleanup without improving correctness. | High / Medium-High     | Candidate correctness comes from exact immutable inputs, not infrastructure cloning.                           | One small receipt plus private artifacts, three stored states, fixed TTL, no per-view writes.                                                         |
| UX/UI and user friction           | **Yes**           | Staff cannot tell what is included, whether saves landed, which locale they see, or why preview differs from live. Silent refresh destroys trust.            | High / High            | Exact revision selection is technical unless translated into calm, visible status.                             | Save acknowledgement, included-change summary, locale/build labels, persistent preview frame, explicit newer-version action, precise recovery states. |
| Hidden coupling                   | **Yes**           | Preview tied to current Payload admin renderer, public cache, search, or mutable Page schemas breaks on upgrades and leaks draft behavior into release.      | High / Medium          | D1 and D9 provide the stable compilation boundary; D17 is public-generation derived.                           | Versioned public presentation view model and manifest envelope; no public cache/search side effects.                                                  |
| Failure modes                     | **Yes**           | Storage and DB cannot commit atomically, so partial uploads or stale finalizers can be marked ready.                                                         | Critical / Medium      | Object storage is outside the PostgreSQL transaction.                                                          | Manifest-last upload, verification, short CAS finalize, no partial render, bounded orphan cleanup.                                                    |
| Data integrity risks              | **Yes**           | Read-then-insert races duplicate builds; broad cascades lose evidence; selection drift corrupts the candidate's claimed identity.                            | High / Medium          | Concurrent editor and worker activity is normal.                                                               | Unique constraints/atomic upsert, request digest, immutable receipt, idempotency, no synchronous unbounded cascade.                                   |
| Security and privacy risks        | **Yes**           | Stale JWT claims, long-lived signed URLs, public buckets, crawler metadata, or service-role misuse expose unpublished ministry material.                     | Critical / Medium      | Supabase documents JWT staleness, private/public bucket behavior, and RLS bypass.                              | Current DB-backed capability on every request, private bucket/server route, no bearer sharing, noindex/no-store, least privilege, audit.              |
| Scalability and performance risks | **Yes**           | Every click rebuilds/writes, N+1 closure reads, long transactions, unbounded concurrency, or too many indexes exhaust Postgres/Storage budgets.              | High / Medium-High     | Whole-Site graphs can be large; serverless connection budgets are finite.                                      | Content-hash reuse, request dedupe, no navigation writes, bounded queues, short transactions, transaction pooler, measured indexes and budgets.       |
| Operational burden                | **Yes**           | Expired objects and failed multipart builds accumulate; support cannot distinguish saving, building, expired, unauthorized, or incompatible states.          | Medium-High / High     | Storage cleanup is compensating work, not a database cascade.                                                  | Fixed TTL/lease, idempotent batched cleanup, bounded state/failure codes, clear UI and runbook.                                                       |
| Observability gaps                | **Yes**           | Silent lag, orphan growth, authorization denials, and pool saturation appear only as “preview broken.”                                                       | High / Medium          | Candidate creation spans DB, compiler, Storage, and rendering.                                                 | Correlation IDs and the bounded metrics above; Advisors, query plans, alerts, privacy-safe failure codes.                                             |
| Dependency and integration risks  | **Yes**           | Payload/package/reader changes make retained candidate artifacts unreadable; optional Supabase logs disappear.                                               | High / Medium          | D9 pins code; Supabase has announced log endpoint/default changes.                                             | Pin compatibility versions, retain N/N+1 readers, block/rebuild incompatible candidates, own product telemetry.                                       |
| Migration and upgrade risks       | **Yes**           | A flag rollout writes receipts old code cannot read or cleanup; rollback strands private content.                                                            | Medium-High / Medium   | Candidate TTL crosses deployments and DB/Payload upgrades.                                                     | Versioned envelope, additive rollout, shadow parity, expand/contract, rollback that leaves cleanup running.                                           |
| Other development hazards         | **Yes**           | Out-of-order retries, expired-build races, missing rollback, raw-error logging, and unclear ownership produce leaks or stuck work.                           | High / Medium          | Distributed build/finalize/cleanup cannot rely on exactly-once delivery.                                       | Attempt generations and CAS, idempotent handlers, safe error enums, explicit ownership/SLOs, chaos and concurrency tests.                             |

## Required verification before shipment

### Authorization and isolation

- Anonymous, donor, missionary, Page-only editor, Site-wide editor, tenant admin, and privileged-worker matrices across two tenants, two Sites, two environments, two locales, and colliding IDs.
- Current membership/capability revocation takes effect on the next request even while the JWT and candidate remain otherwise valid.
- Candidate URL copying reveals nothing to an unauthorized user; login return preserves route only after a successful recheck.
- PostgREST/Data API and direct Storage negative tests prove default deny, no list access, exact download scope, and no cross-tenant inference.
- A malicious worker event containing a different tenant/Site cannot override the stored receipt scope, including under `service_role`.

### Exactness and concurrency

- Candidate waits for D12 acknowledgement and contains the displayed exact revision.
- Later saves do not mutate an open candidate; preparing the same exact selection deduplicates; a different selection produces a successor.
- Same idempotency key/same digest replays safely; same key/different digest conflicts visibly.
- Concurrent creators, duplicate deliveries, out-of-order finalizers, expiry during build, and cleanup during finalization never mark partial content ready.
- Missing object, hash mismatch, incompatible package, and incompatible manifest reader fail closed.
- Dynamic D14 results use the current public-safe resolver and show freshness; safety removal suppresses immediately.

### No side effects or authority bleed

- Candidate creation and navigation never change a D1 serving head, schedule D13 work, enter D17 search/sitemap/feed output, or emit public analytics.
- All mutation controls are inert in candidate context; deliberate live exits cannot retain preview-only routing state.
- Trash, Site disable, locale disable, package revocation, and current safety-policy changes are adverse-first.
- Folder placement and saved views never change candidate authority.

### Database, Storage, and load

- RLS/grant policy tests run for every operation, and Supabase Advisors report no unintended exposed table, unsafe definer search path, or missing policy.
- Query plans use the intended equality/partial/FK indexes at representative maximum tenant/Site sizes.
- Maximum supported route/artifact/byte candidate, repeated identical builds, and concurrent different-Site builds stay within DB query, pool, compiler, Storage, and first-render budgets.
- Transaction-pool configuration is tested without prepared statements; pool exhaustion and statement/lock timeout paths return actionable, retry-safe failures.
- Expiry/purge worker tests cover retries, orphan repair, rate limits, partial object deletion, and bounded batches.

### Upgrade and rollback

- Current and next manifest-envelope readers can browse all retained supported candidates.
- A deployment rollback disables creation but retains safe browsing and cleanup for compatible candidates.
- Additive migration, shadow parity, feature cohort expansion, and final contraction are exercised without changing or backfilling public serving heads.

## Decision-ready contract

The following is the concise formulation supported by this research:

> **C-prime-R — One immutable, complete, private Whole-Site Preview Candidate for one exact Tenant × environment × Site × locale.** D1 compiles it from an explicit vector of exact D12-acknowledged revisions over the current public generation—or D1’s code-owned empty genesis before first release—using the exact certified D9 presentation package and the same public-safe resolvers. Current Site-wide authority and adverse safety are rechecked on every request. The candidate is all-or-none, URL possession grants nothing, mutations are inert, responses are private/no-store/noindex, and no public head, cache, search, schedule, analytics, or business record changes. It has no activation authority and is never a copied database or Supabase branch. A small RLS-protected receipt plus private content-addressed artifacts, idempotent creation, short snapshot/CAS transactions, bounded build concurrency, fixed expiry, observable orphan-safe cleanup, and versioned N/N+1 readers provide the durable operational contract. New saves create an explicit successor; release separately revalidates through D1. D14 operational membership remains current and freshness-labelled; D21/D22/D24 remain adverse-first, exact-locale, and app-authority boundaries respectively.

## Primary sources consulted

- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) — policies, grants, policy performance, auth helpers, service-role bypass.
- [Supabase JWTs](https://supabase.com/docs/guides/auth/jwts) — claim lifetime and freshness limitations.
- [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control) and [bucket fundamentals](https://supabase.com/docs/guides/storage/buckets/fundamentals) — private bucket/RLS and public bucket behavior.
- [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres) — serverless transaction-pool guidance and prepared-statement limitation.
- [Supabase Database Advisors](https://supabase.com/docs/guides/database/database-advisors) — security and performance checks.
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) — default deny, owner/BYPASSRLS behavior, constraint and race caveats.
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html) — statement versus stable transaction snapshots.
- [PostgreSQL `INSERT`](https://www.postgresql.org/docs/current/sql-insert.html), [indexes](https://www.postgresql.org/docs/current/indexes.html), and [unique indexes](https://www.postgresql.org/docs/current/indexes-unique.html) — atomic conflict handling and index/constraint behavior.
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html) and [`SELECT`](https://www.postgresql.org/docs/current/sql-select.html) — row locking and `SKIP LOCKED` worker behavior.
- [Supabase `logs.all` migration notice](https://supabase.com/changelog/48235-migration-of-supabase-management-api-logs-all-analytics-endpoint-to-logs-endpoint) and [`log_connections` default change](https://supabase.com/changelog/47197-log-connections-is-to-be-turned-off-by-default-for-new-projects-and-existing-free-pro-projects) — avoid brittle dependence on optional/deprecated platform log surfaces.

All sources were checked on 2026-08-23. Product wording and schema names above remain conceptual until D25 is ratified and sliced; the contract intentionally does not authorize runtime or migration changes.
