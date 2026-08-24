# Phase 23 D14 Dynamic Source Catalog research

- **Status:** Founder-ratified Phase 23 D14 C-prime-amended-and-hardened
  (C-prime-R) on 2026-08-22.
- **Date:** 2026-08-22
- **Authority:** Research and decision support only. The exact ratified authority
  is preserved in the Phase 23 decision log and ADR-0158. This document does not
  authorize implementation, schema work, migration, provider adoption, issue
  publication, deployment, release activation, or production change.

## Decision context

D14 decides how an ordinary Phase 23 Page can present a changing list of
source-owned public content without copying operational records into Payload or
turning Web Studio into an arbitrary database query builder.

The candidate is **one versioned Dynamic Source Catalog behind one
source-discriminated Dynamic Content List block**. The design must be useful to
small nonprofit teams, expressive enough for distinct tenant Sites, safe across
Tenant/Site/locale boundaries, and intentionally smaller than a general-purpose
query language.

## Repository evidence and constraints

- Phase 23 D1 already requires typed dynamic blocks to remain references to
  their source owners. Phase 23 may pin compatible contracts and adapters but
  may not copy operational facts, advance a source-owned release, or weaken
  Phase 10/22 authority. See
  `docs/prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md`, D1,
  especially lines 67-77 and 110-145.
- D7 owns one provider-neutral, versioned Semantic Ordinary Section Catalog and
  rejects generic queries, tenant-authored schemas, raw provider records, and
  preview/public divergence. D14 therefore needs an explicit compatible D7
  catalog addition rather than a Payload-only block. See the same decision log,
  D7, lines 1440-1617.
- D8 makes every family-qualified D7 leaf except Hero eligible for same-scope
  reuse. If the new list leaf is reusable, it inherits D8's exact-version,
  consequence-review, and non-recursive rules; D14 must not create a second
  sharing system.
- D9 permits certified Site-bound Presentation Packages to render compatible
  semantic variants, but packages receive only the public presentation view
  model and cannot gain Payload, Supabase, source-query, authorization, or
  release authority. See the decision log, D9, lines 1843-2087.
- The current public reader in `packages/api/src/cms/public/reader.ts` is the
  correct public choke-point pattern. Its current `getUpdates` operation accepts
  only a bounded `limit`, so it is a useful primitive, not a generalized D14
  implementation.
- The current implementation in
  `apps/admin/src/cms/public/published-content-reader.ts` requires the resolved
  tenant, applies tenant plus published predicates, uses
  `overrideAccess: false`, and emits allowlisted serialized results. Its shared
  `findPublic` helper does not yet set `depth: 0` or an exact `select`, however;
  D14 must not simply parameterize collection, field, and sort strings through
  this helper.
- `packages/api/src/cms/public/context.ts` reserves a Site dimension, but the
  current type does not yet carry locale and describes `siteId` as a future
  seam. A production D14 query must require the exact D1 Tenant, environment,
  Site, and BCP-47 locale rather than assuming today's implicit Site.
- `packages/api/src/public-giving/types.ts` deliberately defines PII-minimized
  public missionary/update DTOs. That public-projection approach is the model
  for every operational D14 source; the CMS must never ask for private fields.
- `apps/admin/src/cms/collections/page-builders.ts` currently contains a small
  static block catalog and source-specific validation. It has no dynamic-list
  block and should not be generalized into an open provider query object.
- Phase 37 owns opportunities/events and explicitly anticipates their later use
  in Phase 23 dynamic lists. They cannot become a D14 launch source before that
  owner supplies a certified public projection. See
  `docs/prds/sitestacker-parity/roadmap.md`, Phase 37, lines 3824-3846.

## Current primary-source CMS evidence

### WordPress Query Loop

The official [WordPress Query Loop documentation](https://wordpress.org/documentation/article/query-loop-block/)
exposes a content type, source-appropriate filters, ordering, item count,
layout, optional pagination, and a no-results state. It also starts authors from
a pattern or a blank configuration. This supports a source-first editor with
progressive disclosure, actual-result preview, and an explicit empty state.

The lesson to adopt is the authoring sequence, not WordPress's entire nested
Post Template model. D7 already owns Asym's semantic leaf and presentation
contracts.

### Shopify dynamic sources

Shopify's official [Sections and blocks documentation](https://help.shopify.com/en/manual/online-store/themes/theme-structure/sections-and-blocks)
exposes a dynamic-source selector only where the source and setting are
compatible. This supports hiding unavailable or incompatible choices instead of
showing a universal field/query picker.

### Drupal Views

Drupal's current [Views documentation](https://www.drupal.org/docs/user_guide/en/views-parts.html)
separates display, format, fields, filters, sorts, contextual filters,
relationships, and output. This demonstrates the breadth possible in a mature
listing engine, but also shows why D14 should not reproduce a general View
builder for ordinary nonprofit staff. One source, bounded operators, and
source-owned presets cover the immediate need with far less cognitive and
operational cost.

### Payload fields, queries, and access

- Payload [Blocks](https://payloadcms.com/docs/fields/blocks) support typed
  block configurations and conditional availability.
- Payload [Relationship fields](https://payloadcms.com/docs/fields/relationship)
  can use `filterOptions` both to limit the editor UI and to validate selected
  relationships.
- Payload's [Local API access documentation](https://payloadcms.com/docs/local-api/access-control)
  states that Local API operations bypass access control by default; user-scoped
  calls must explicitly pass the user and `overrideAccess: false`.
- Payload's [Depth documentation](https://payloadcms.com/docs/queries/depth)
  documents a default relationship-population depth of two and the performance
  impact of population. Dynamic list reads should use `depth: 0` unless an exact
  source adapter proves a narrower need.
- Payload's [Select documentation](https://payloadcms.com/docs/queries/select)
  recommends selecting only required fields to reduce query work and response
  size.

These are useful adapter primitives. They are not Tenant isolation, source
authority, the product query contract, or D1 release authority.

### Query-language and security evidence

Sanity's current [GROQ documentation](https://www.sanity.io/docs/querying-content-with-groq)
shows that a developer query language can express arbitrary filters and
projections. Its [parameter documentation](https://www.sanity.io/docs/specifications/groq-parameters)
correctly distinguishes literal values from query expressions. D14 should keep
the expression itself in code and accept only validated literal values for
catalog-declared operators.

OWASP's [SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
recommends parameterized queries and code-owned allowlist mappings where table,
column, or sort identifiers cannot be bound. Tenant input must never become a
provider field, collection, operator, or sort expression.

### Ordering, pagination, cache, and accessibility

- PostgreSQL warns that `LIMIT`/`OFFSET` produces inconsistent subsets without
  predictable ordering. Its current [index-ordering guidance](https://www.postgresql.org/docs/current/indexes-ordering.html)
  explains why an index matching `ORDER BY ... LIMIT` can avoid sorting the
  complete result. Every catalog sort needs a stable tie-breaker and a
  production-proved index/cost contract.
- Next.js's current [`use cache` documentation](https://nextjs.org/docs/app/api-reference/directives/use-cache)
  explains that serializable function arguments enter the cache key. D14 must
  pass Tenant, Site, locale, source, normalized query intent, and safety/source
  generation as arguments; tags are for invalidation and do not replace scope
  in the key.
- W3C's [WCAG status-message guidance](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)
  specifically covers loading, result-count, and no-results changes that should
  be announced without moving focus. The editor preview should use polite,
  concise status announcements rather than noisy alerts.

## Product comparison synthesis

Modern CMSs converge on a useful set of list capabilities: choose a source,
apply bounded filters, choose a stable order, bound the number of items, select
a presentation, preview actual results, and define empty behavior. Their
general-purpose query builders also demonstrate the risk of exposing fields,
relationships, and operators indiscriminately.

For Asym, feature richness should come from source-qualified capabilities and
certified presentation variants:

- an Article source can offer newest/oldest/title order and approved editorial
  filters;
- a Missionary source can offer only Phase-10/22-approved public filters and
  profile-card variants;
- a Project source can offer only its source-owned public lifecycle and
  presentation facts;
- a Ministry Update source can expose its independently authoritative public
  release stream without freezing updates into a Page revision; and
- future sources appear only after their owning phase supplies the same public
  contract.

This is materially more flexible than one hard-coded Article list and
materially safer and simpler than Drupal-style relationships, raw Payload
`Where`, GraphQL, SQL, or GROQ.

## Founder-ratified C-prime-R interpretation

The exact founder-ratified formulation is preserved verbatim in the Phase 23
decision log and ADR-0158. The following is its evidence-backed binding
interpretation; it does not independently expand that authority.

Adopt one code-owned, provider-neutral, versioned **Dynamic Source Catalog** and
one source-discriminated **Dynamic Content List** semantic leaf through D7.

Each source descriptor declares:

- stable never-reused source key, owning phase/domain, owner, and contract
  version;
- compatible Page families and exact Site/locale/publication behavior;
- one public-list item DTO with stable identity and safe public route;
- allowed typed filters, literal filter values, sorts, item limits, later
  pagination capabilities, and semantic card/view variants;
- deterministic secondary stable-ID order and explicit null handling;
- preview, zero-result, unavailable, and adverse-safety behavior;
- query/index/cost, batching, maximum-result, and maximum-concurrency contract;
- cache dimensions and invalidation causes;
- migration, retirement, diagnostics, telemetry, and conformance tests.

The block stores only normalized, validated editorial query intent plus the
exact source-contract version. It never stores matching records, raw provider
queries, operational columns, private identifiers, SQL, GraphQL, GROQ, raw JSON
operators, formulas, code, CSS, or arbitrary presentation fields.

One descriptor must drive or prove equivalent behavior across:

- authoring controls and plain-language summaries;
- server validation and normalization;
- D1 candidate compilation and compatibility proof;
- public source-adapter query planning;
- DTO serialization and presentation-package input;
- migration/export/diagnostics; and
- source conformance tests.

This avoids a central optional-field bag and avoids separately maintained UI,
API, compiler, and renderer rules. Source implementations may live in separate
modules behind the shared interface so the catalog does not become one giant
switch statement.

### Release and runtime semantics

- D1 pins and releases the exact Page revision, normalized query intent,
  source-contract/catalog/compiler/adapter compatibility, and presentation
  variant. Payload save or preview is not publication.
- Matching public records remain owned by the source and may change without a
  Page republish. The Page does not promise an immutable list membership.
- Preview uses the draft list configuration with current published,
  public-safe source data only. Staff authentication does not grant private
  operational preview data.
- Runtime scope is resolved server-side from the trusted host and active
  generation. Tenant, environment, Site, locale, source authority, and current
  Phase 10/owner safety are never accepted from browser-controlled intent.
- Public adapters use parameterized queries, exact allowlisted projection,
  `depth: 0` and exact `select` where Payload is involved, stable ordering,
  bounded work, and closed result types.
- Current adverse withdrawal or safety narrowing suppresses affected content
  immediately. A stale cache is never served when current safety cannot be
  proved.
- Source failure preserves the rest of the Page and uses an approved omission
  or non-sensitive empty/degraded state. It emits a private, cause-owned
  operational exception while public responses remain generic.
- D9 packages may render only catalog-approved semantic variants from the
  serialized public list view model. They cannot add sources, fields, filters,
  joins, or query authority.

### Launch availability

- **Article** is the required Phase 23 source.
- **Missionary, Project/Campaign, and Ministry Update** become selectable only
  when the exact Phase 22 public projection and activation contract is
  certified for the Site.
- **Event/Opportunity** waits for Phase 37.
- Other sources remain absent until their owning phase provides a qualified
  public projection, lifecycle, query, safety, and card contract.

Unavailable sources should be absent from ordinary authoring rather than
displayed as a wall of disabled technical options.

## Authoring UX contract

Present the section to staff as **Content list**, not Dynamic Source Catalog.

1. **What should this section show?** Present only compatible, Site-available
   sources with plain names, a short purpose sentence, and a representative
   preview.
2. **Choose what appears.** Apply a useful source-specific default, then reveal
   **Filter results** only when needed. Display only filters and values supported
   by the selected source.
3. **Choose the presentation.** Offer a small set of purpose-named variants
   compatible with the active Site package, such as Story cards, Compact list,
   or Profile cards. Do not expose CSS, provider fields, or device coordinates.
4. **See the actual result.** Render the actual safe public projection through
   the same compiled view model used publicly, identify preview freshness, and
   state that membership updates automatically.

The editor should continuously summarize intent in plain language, for example:

> Showing up to 6 newest public Articles tagged Global Ministry. Previewed from
> public content at 3:42 PM. This section updates automatically.

Further UX safeguards:

- Use sensible source-specific defaults for sort, limit, display, heading, CTA,
  and empty behavior.
- Hide irrelevant controls instead of disabling them.
- Do not issue a total-count query merely to show “6 of 5,482”; report the
  number shown unless the source provides a cheap, safe count.
- Changing source after configuration names the incompatible settings that will
  reset, requires confirmation, and supports undo. It never silently discards
  staff work.
- Zero results explain why in ordinary language and offer the smallest safe
  next action; transient failure is distinct from zero eligible content.
- Preview refresh announces a concise loading/result/no-result status politely,
  preserves focus, and does not become chatty.
- Public output uses meaningful heading/list/card semantics, resilient missing
  media, accessible links and CTAs, and the same desktop/narrow semantic order.

## Adversarial risk register

| Category                | Concern                                                                                                                                       | Severity | Likelihood              | Permanent prevention                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Brittleness             | Source keys, DTOs, filters, or owners can change underneath released Pages.                                                                   | High     | Medium                  | Stable keys, explicit versions, compatibility ranges, direct migrations, and retained adapters for active generations.       |
| Technical debt          | One block can become a giant optional-field bag with duplicated validation.                                                                   | High     | High                    | Discriminated source schemas generated from one descriptor and a shared conformance harness.                                 |
| Edge cases              | Empty/fewer results, tied or null sorts, missing media, withdrawn records, locale gaps, self-listing, and scheduled-result drift are routine. | High     | High                    | Closed result states, stable tie-breakers, null policy, card DTOs, freshness labels, and source-owned eligibility.           |
| Footguns                | Huge limits, random/all modes, arbitrary operators, or silent source-change resets can cause outages and surprise.                            | High     | Medium-high             | Server caps, finite presets, no random/all launch mode, named consequence confirmation, and undo.                            |
| Tenant safety           | Missing scope or cache dimensions can mix organizations, Sites, or locales.                                                                   | Critical | Medium without controls | Trusted server-resolved scope, exact adapter predicates, complete cache keys, and cross-scope negative tests.                |
| Over-engineering        | “Flexible” can become a tenant query language, schema builder, joins, formulas, or plugin platform.                                           | High     | High                    | One certified source per block, finite operators, no arbitrary expressions, and owner-gated source admission.                |
| UX/UI friction          | Exposing all capabilities at once recreates a developer query builder.                                                                        | High     | High                    | Source-first progressive disclosure, defaults, intent summary, actual preview, and quiet exception-first guidance.           |
| Hidden coupling         | Provider collection/column/render fields in Page data make future changes unsafe.                                                             | High     | Medium-high             | Semantic keys and DTOs behind provider adapters; D1 pins compatibility.                                                      |
| Failure modes           | A timeout may blank a Page or stale data may expose a newly restricted person.                                                                | High     | Medium                  | Bounded reads, closed failures, approved omission/fallback, adverse-first safety, and a cause-owned exception.               |
| Data integrity          | Unstable order, duplicate output, copied snapshots, or guessed unknown versions corrupt what visitors see.                                    | High     | Medium                  | Stable IDs and total order, owner-defined deduplication, intent-not-results, and fail-closed compatibility.                  |
| Security/privacy        | Query injection, relationship overpopulation, PII, count inference, or raw errors can expose protected facts.                                 | Critical | Medium                  | Parameterized allowlisted plans, public DTOs, exact select/depth, no count by default, and sanitized errors/telemetry.       |
| Scalability/performance | Multiple blocks can create N+1 reads, unindexed filters, exact-count work, cache explosion, or fan-out.                                       | High     | Medium-high             | Per-source cost/index proof, batching/deduplication, bounded blocks/items/concurrency, and complete cache dimensions.        |
| Operational burden      | Bespoke source integrations and tenant-specific settings create tribal knowledge.                                                             | Medium   | Medium                  | One registration checklist, named owner, generated diagnostics, shared tests, and no per-tenant source code.                 |
| Observability gaps      | Zero matches and an outage can look identical; cache/projection failures can remain silent.                                                   | High     | Medium                  | Source/version/generation/result-state/latency/cache telemetry plus private scoped exceptions without PII.                   |
| Dependency/integration  | Payload access/depth defaults and current internal v4 builds may change; source APIs will evolve.                                             | High     | Medium                  | Provider-neutral adapters, explicit `overrideAccess: false`, exact projection/depth, and version qualification.              |
| Migration/upgrade       | Renamed keys or migration-on-read can break retained history and exports.                                                                     | High     | Medium                  | Never-reused keys, successor-draft migrations, quarantine unknowns, semantic export, and retained compatibility.             |
| Other hazards           | Preview, schedule execution, source updates, safety revocation, cache invalidation, and package deployment can race.                          | High     | Medium-high             | D1 pins intent rather than results, execution reproofs compatibility, adverse safety wins, and production-shaped race tests. |

## Scope exclusions for D14

D14 should define the authority, typed source contract, block semantics, UX,
safety, compatibility, and proof seams. It should not decide or implement:

- pinning, exclusion, manual ordering, or manual-plus-dynamic blending;
- the exact page-number, cursor, load-more, infinite-scroll, or SEO policy;
- public-site search;
- folders or taxonomies;
- a concrete cache provider, TTL, or broad cache implementation;
- tenant-authored sources, schemas, fields, operators, formulas, joins, plugins,
  code, or arbitrary query languages;
- cross-source aggregation, recommendation, personalization, or AI-generated
  queries;
- source-owned operational fields, lifecycle rules, or private preview;
- uncertified future Event/Opportunity/Resource sources; or
- a Payload upgrade/provider decision.

The catalog may reserve typed capability seams for later choices, but it must
not smuggle those unresolved product decisions into D14 defaults.

## Required proof before shipping

1. Every registered source passes one conformance suite proving stable unique
   key/version, complete UI/validation/compiler/adapter/serializer/renderer
   coverage, deterministic sort, exact null policy, limits, and all closed
   result states.
2. Wrong-Tenant, environment, Site, locale, role, source, filter value, record
   reference, contract version, and Phase 10/owner reach are denied across UI,
   commands, imports, preview, public rendering, cache, and custom packages.
3. Raw Payload/Supabase reads cannot enter public rendering outside the
   qualified source boundary; Payload tests prove `overrideAccess: false`,
   exact `select`, bounded depth, and allowlisted serialization.
4. Preview renders draft configuration with only current published public-safe
   data, clearly labels freshness/automatic membership, and matches public
   semantics across standard and D9 package renderers.
5. Zero, one, fewer-than-limit, maximum, tied sort, null sort, missing media,
   missing locale, retired, withdrawn, disabled-source, transient-failure, and
   stale-contract fixtures produce deterministic safe behavior.
6. Multiple list blocks, repeated identical intents, maximum filter shapes,
   high-cardinality tenants, slow/unavailable sources, and large eligible
   cohorts meet bounded query, cache, response-size, and render budgets without
   N+1 behavior or total-count dependence.
7. Cache tests prove every scope and normalized intent dimension is part of the
   key, invalidation is cause-scoped, and current adverse safety cannot be
   bypassed by stale content.
8. D1 tests prove exact config/contract/adapter compatibility, current source
   availability, expected-head CAS, stale candidate refusal, previous-generation
   preservation, and newly validated successor recovery.
9. D12/D13 tests prove autosave and scheduled publication preserve the exact
   query-intent revision while accurately communicating that matching source
   records remain dynamic.
10. Accessibility tests cover source selection, progressive disclosure,
    validation, changed-result status, keyboard/touch operation, focus
    preservation, zoom/reflow, and public semantic list/card output.
11. Migration tests cover every existing/unknown block and source version by
    direct transform, retained compatibility, quarantine, or retirement; no
    released history is mutated or migrated on read.
12. Operational evidence distinguishes empty, unavailable, unsafe, stale,
    incompatible, and over-budget outcomes by opaque scope/source/generation
    identifiers without logging content, PII, or restricted identity.

## Recommendation

Proceed with C-prime only in the hardened form above. It provides tenants with
meaningful source filters, sorting, bounded item counts, future pagination
capabilities, Site-specific presentation variants, real safe previews, empty
states, headings, CTAs, and automatic source updates while keeping one simple
authoring pattern.

Its permanent simplification is the boundary: **one source-qualified intent per
block, one public-safe source adapter, and no user-authored query language**.
That boundary preserves nonprofit staff usability, Tenant safety, provider
portability, and future source growth without creating a second CRM, search
engine, or database administration product inside Web Studio.
