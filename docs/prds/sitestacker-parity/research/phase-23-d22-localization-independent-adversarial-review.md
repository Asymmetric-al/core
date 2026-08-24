# Phase 23 D22 independent adversarial review — localized editorial readiness

**Decision state:** Founder-ratified and adversarially hardened as **Phase 23 D22
C-prime-R** on 2026-08-23.

**Selected direction under review:** one bounded Localized Editorial Profile over
D1's exact locale lineages, explicit translation starts, and no silent field
fallback.

This note is research and adversarial hardening only. It does not amend the Phase
23 decision log, create an ADR, authorize implementation, or take locale activation
and translation-management authority from Phase 24.

## Bottom line

C-prime is the right architecture, but only after four precision hardenings:

1. **Exact locale lineages, not a multilingual mutable document, remain product
   truth.** The stable Page or Article identity is nonlocalized; each canonical
   BCP-47 locale has its own independently versioned D1 Editorial and Placement
   lineage. Payload may persist editorial data, but Payload localization,
   `_status`, fallback, and publish controls cannot become release authority.
2. **The Localized Editorial Profile is a small, code-owned classification
   contract.** It says which semantic values belong to a locale revision and which
   facts remain stable. It is not a tenant field builder, translation workflow,
   locale matrix, or second schema system.
3. **A translation begins only through an attributable author action.** Staff
   choose **Start translation**, then **Start blank** or **Copy from <source
   language>**. A copy is a private draft with source-revision provenance; it is
   never runtime fallback, never auto-published, and never silently overwritten.
4. **Phase 23 fails closed for missing locale content.** Public compilation,
   preview, search, navigation, SEO, and routes request one exact locale and disable
   Payload field fallback. A missing locale variant is absent until Phase 24 later
   adopts an explicit, whole-experience-safe fallback policy. No request may
   assemble English title, Spanish body, and fallback metadata into a mixed page.

These rules meet the roadmap's real goal—avoid a destructive localization retrofit
later—without adopting Payload's beta per-locale status or exposing translation
administration before Phase 24.

## Why D1 already determines the storage grain

[ADR-0145](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
already establishes one stable Site-scoped Page with subordinate BCP-47 locale
Editorial and Placement lineages, and one public serving head per exact Tenant ×
environment × Site × locale. [ADR-0146](../../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
makes placement and path locale-exact. [ADR-0147](../../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
keeps predecessor continuity in the same Site and locale. D22 therefore must not
collapse all languages into one latest draft or introduce a second locale release
system.

D10 is the sole narrow cross-locale exception: [ADR-0154](../../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
may all-or-none activate one presentation package across existing public locale
heads, but explicitly cannot advance translation content. D12 keeps the active
editor and recovery fence on one exact locale resource
([ADR-0156](../../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md));
D13 schedules one exact locale revision
([ADR-0157](../../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md));
D17 searches one exact locale
([ADR-0161](../../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md));
and D21 trashes every locale of the stable identity together while keeping
locale-only withdrawal a publication action
([ADR-0165](../../../adr/0165-asym-owned-reference-aware-recoverable-trash.md)).

Phase 24 retains Site locale enablement, complete translation-status management,
fallback policy, domain, currency, and broader multi-Site settings. D22 may provide
the storage and provenance that Phase 24 will consume, but cannot ship a competing
locale administration console.

## Current Core and exact Payload qualification

### Current Core gap

- The admin pins Payload and its first-party packages to
  `4.0.0-internal.1f9ae9a`
  ([`apps/admin/package.json`](../../../../apps/admin/package.json)).
- [`apps/admin/payload.config.ts`](../../../../apps/admin/payload.config.ts) has no
  Payload `localization` configuration or `experimental.localizeStatus` flag.
- The current [`Pages` collection](../../../../apps/admin/src/cms/collections/pages.ts)
  has Tenant, title, slug, summary, layout, and rich text with drafts/autosave, but
  no Site, locale, or `localized: true` field. No ordinary Phase 23 Article
  collection exists yet. Current rows therefore need a deliberate default-locale
  backfill; pretending the code is already localization-ready would be false.

### What current Payload does well

Payload's current documentation provides field-level localization, locale objects
with `rtl`, a server-side `filterAvailableLocales`, exact-locale API reads,
`fallbackLocale: false`, and `locale: 'all'`
([Payload localization](https://payloadcms.com/docs/configuration/localization)).
The exact pinned test suite exercises Spanish creation, small-screen publication
controls, locale-specific publish, and locale-specific unpublish when localized
status is enabled
([exact-pin localization E2E](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/localization/e2e.spec.ts)).
Those are valuable provider primitives and test cases.

### Why raw Payload localization cannot be D22 authority

- Payload localization is field-level, not document-level. Localizing a parent
  blocks/array field localizes the entire nested set, and changing an existing
  field to or from `localized: true` changes storage shape and can lose data unless
  migrated
  ([current Payload localization](https://payloadcms.com/docs/configuration/localization)).
- Payload fallback defaults to `true`. Its locale filter controls which locales
  appear in the Admin selector and is evaluated at the root UI level; it is not
  record authorization or Site-locale release proof
  ([current Payload localization](https://payloadcms.com/docs/configuration/localization)).
- Payload versions store a full copy of a document. A single field-localized Page
  therefore snapshots every locale together, which is a poor fit for D1's
  independently edited and released locale lineages
  ([Payload versions](https://payloadcms.com/docs/versions/overview)).
- `localizeStatus` remains experimental/beta and requires both a global
  experimental flag and per-collection enablement. Without it, one `_status`
  string represents the latest status across locales
  ([Payload localization](https://payloadcms.com/docs/configuration/localization),
  [Payload drafts](https://payloadcms.com/docs/versions/drafts)).
- At the exact pin, the ordinary publish action sends `publishAllLocales: true`
  when localized status is enabled, and publishing the active locale is the
  secondary path unless `defaultLocalePublishOption` is explicitly set to
  `active`
  ([exact-pin PublishButton](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/PublishButton/index.tsx),
  [exact-pin active-locale UI test](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/admin/e2e/document-view/e2e.spec.ts)).
  That default conflicts directly with D1's ordinary single-locale publication.
- The exact-pin SQL migration can create one status row for every configured
  locale and copy the same old status to all of them. Its down migration collapses
  per-locale status back to the configured default locale, necessarily discarding
  differences once locales diverge
  ([exact-pin up migration](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/versions/migrations/localizeStatus/sql/up.ts),
  [exact-pin down migration](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/versions/migrations/localizeStatus/sql/down.ts),
  [exact-pin migration tests](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/localization/localizeStatus.int.spec.ts)).

Payload can therefore be an adapter and authoring engine, but D22 should not enable
beta localized status or treat provider fallback, locale UI filtering, versions,
or buttons as product truth.

## Modern CMS evidence

The selected design is not exotic. Sanity's current localization guidance says
field-level localization publishes languages together, while document-level
localization creates one document per language and permits independent publishing;
it recommends choosing based on content and workflow
([Sanity localization](https://www.sanity.io/docs/studio/localization)). Contentful
likewise documents both field- and entry-level localization and identifies
asynchronous per-locale publishing, governance, fallback, and editing experience as
the decision criteria
([Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)).
D1 already requires asynchronous locale publication, so document/lineage-level
editorial variants are the congruent model.

Webflow's current locale UX puts the locale switcher in the editor's top context,
lets secondary locales have independent publication status, and treats localized
page name, slug, SEO, and Open Graph metadata as locale content
([manage locales](https://help.webflow.com/hc/en-us/articles/53682971927571-Manage-your-site-s-locales),
[localize page settings](https://help.webflow.com/hc/en-us/articles/33961235760531-Localize-page-settings),
[locale-specific drafts](https://help.webflow.com/hc/en-us/articles/38304883216403-Set-individual-static-pages-to-draft-status-in-specific-locales)).
This supports obvious locale context and independent status, but not copying
Webflow's provider semantics wholesale.

Google recommends distinct URLs for language versions and `hreflang` between the
actual alternates
([multilingual sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites),
[localized versions](https://developers.google.com/search/docs/advanced/crawling/localized-versions)).
BCP 47 is the standards basis for language tags
([RFC 5646](https://www.rfc-editor.org/info/rfc5646/)), and WCAG requires the page's
predominant human language to be programmatically determinable so assistive
technology can pronounce and render it correctly
([WCAG 2.2 Language of Page](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page)).

## Hardened Localized Editorial Profile

The profile should classify semantics, not duplicate every collection schema.

| Profile class                              | Included examples                                                                                                                                                                                                                                               | Rule                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Locale editorial content                   | title, summary/dek, rich text, Page-local block selection/order, authored headings and body copy, CTA/button labels, captions, quote attribution display, usage-level alt text, editorial SEO title/description, Open Graph copy, and the D2 local path segment | Lives in one exact locale Editorial or Placement revision; may legitimately differ in structure and meaning by locale.         |
| Stable nonlocalized identity and authority | stable Page/Article ID, Tenant/environment/Site, family, block type and schema-version keys, permissions, audit/actor IDs, provider IDs, D1 heads, lifecycle/Trash, folder placement, D19 Topic assignments, and source-contract identities                     | Never translated, copied as prose, or inferred from a fallback. Changes only through its owning authority.                     |
| Locale-scoped but non-translated semantics | typed operational references inside a locale composition, schedules for an exact locale, parent Page reference, route history, source-selection IDs, media identity, and publication evidence                                                                   | Carries exact locale scope where required but remains a typed reference/fact, not localizable text. The server revalidates it. |
| Other-owner localized content              | D4 navigation labels, form copy when forms are decided, Phase 22 ministry content, system messages, and public media metadata owned elsewhere                                                                                                                   | Uses the same no-mixing principle through its owner; D22 does not seize or duplicate it.                                       |

Localizing the top-level Page composition is intentional because D1 permits a
locale to change block structure, not merely strings. Stable IDs and operational
references inside that revision remain typed. This avoids the brittle alternative
of forcing every language to preserve the same paragraph/block topology.

## NGO ministry scenario

Hope Missions begins with one `en-US` public Site. Its communications coordinator
creates “Flood recovery in Honduras.” Because only one content locale is enabled,
the editor shows no locale selector or translation dashboard.

Later, Phase 24 enables `es-HN`. On the Page, an authorized translator chooses
**Start Spanish (Honduras)** and then **Copy from English (United States)**. The
system creates a private Spanish revision pinned to the exact English source
revision. The translator changes the title, reorganizes two blocks, localizes the
CTA and image alt text, and chooses a Spanish slug. The designation reference,
media identity, Page identity, Topic assignments, and audit history do not become
translated strings. English remains live while Spanish is drafted and reviewed.

If English changes later, Spanish is not overwritten. Web Studio says **English
changed after this translation was started** and links to comparison; Phase 24 may
later deepen assignment and translation-status workflows. Until Spanish is
published through its own D1 locale generation, Spanish navigation, search,
metadata, sitemap, `hreflang`, and route compilation omit the Page. A request does
not silently show the English Page under a Spanish URL. D21 still moves the stable
Page and both languages to Trash together.

## Staff UX/UI contract

### Quiet one-locale launch

- Do not show a language selector, translation percentage, seven-state matrix, or
  empty-locale tabs when a Site exposes one editable content locale. The locale is
  trusted Site context, not an author choice on every field.
- Keep the normal D12 Edit → saved/preview → Publish flow. Generated previews and
  public compilation still carry the exact locale internally.
- Never hardcode “English” as the architecture. The sole visible locale is the
  Site's canonical default locale supplied by Phase 24/Phase 2 context.

### When Phase 24 enables another locale

- Put one persistent context control near the Page title: **Spanish (Honduras) ·
  Draft**. Use a language name, optional region, and code in detailed views; never
  use a flag alone because a locale identifies language and optional region, not
  nationality.
- For an absent variant, show one action: **Start Spanish (Honduras)**. The next
  sheet offers **Start blank** and **Copy from English (United States)** with one
  sentence explaining each. Do not auto-copy when a locale is enabled.
- A copy is saved as a private working revision and visibly says **Copied from
  English version published <date> — review before publishing**. This is calm
  provenance, not a legal warning. A later source edit produces a durable
  comparison notice, not a toast and not an automatic merge.
- Before switching locales, D12 must finish the current autosave or offer explicit
  recovery. The selector must not discard unsaved text, move the active-editor
  lease to another language, or make the selected locale look published because a
  sibling is live.
- With multiple locales, use literal actions such as **Publish Spanish
  (Honduras)** and **Unpublish Spanish (Honduras)**. Never expose ordinary
  **Publish all languages**; D10's all-locale presentation activation is a
  separate Website design action and cannot advance content.
- Show only actionable derived states: **Not started**, **Draft**, **Ready** when an
  owning review decision exists, **Live**, and **Needs attention**. Phase 23 stores
  revision/provenance facts; Phase 24 owns richer translation-status management.
- All controls require keyboard parity, visible focus, screen-reader names, 320 CSS
  pixel reflow, zoom, long labels, CJK, RTL, forced colors, and reduced-motion
  verification. The public document emits the exact `lang` and direction for the
  released locale.

### No silent fallback

- Every public/provider read passes one exact locale and `fallbackLocale: false`.
  The compiled D1 projection is rejected if a required localized value is absent.
- Optional localized values may be deliberately omitted only when the typed block
  contract defines an accessible omission. They never inherit field-by-field from
  another language.
- Missing locale Page means no favorable route, navigation target, search result,
  sitemap URL, social card, or `hreflang` alternate for that locale. Previously
  released content follows D1/D3 adverse and continuity rules; it is not replaced
  with a sibling language.
- `hreflang` is emitted only for mutually eligible, actually released locale URLs
  of the same stable identity. `x-default`, browser-language routing, and explicit
  whole-page fallback remain Phase 24 decisions.
- **Copy from language** is an editorial draft operation. It must never share code
  or semantics with runtime fallback.

## Supabase/Postgres and tenant-safety implications

1. **Sparse exact-locale rows.** Create a locale lineage only when the default
   content is migrated or a translation is explicitly started. Do not pre-create
   empty content rows for every configured locale.
2. **Canonical scope and integrity.** Every locale revision and head carries the
   canonical BCP-47 tag plus complete Tenant × environment × Site × stable identity
   scope. Composite foreign keys/unique constraints prevent a child, source copy,
   placement, or head from crossing scope; locale is never accepted from an
   untrusted browser field as authority.
3. **Purpose-shaped indexes.** Index the exact read/write keys used by editor
   lookup, active working revision, released head, path uniqueness, migration
   census, and health scans. Do not add an index for every localized leaf field.
4. **Layered authorization.** Payload's direct Postgres connection and server Local
   API can run with elevated access; Payload access functions and Asym commands
   must therefore validate actor, Tenant, Site, locale, capability, and expected
   revision even when database RLS is present. Supabase documents that service and
   secret roles bypass RLS, while grants and policies are separate layers
   ([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
   [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)).
   Public apps never read raw Payload locale documents; they consume the compiled
   D1 public projection.
5. **RLS defense in depth.** Asym-owned publication, provenance, and operational
   relations exposed through the Data API use least-privilege grants plus RLS with
   both `USING` and `WITH CHECK` semantics. PostgreSQL notes that table owners may
   bypass row security and that row-security policy is distinct from ordinary
   privileges
   ([PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)).
6. **No beta status migration.** Do not enable Payload `localizeStatus` for D22.
   D1 serving heads and D12 working revisions provide the independently scoped
   facts. If a future Payload release becomes useful, it must pass exact-version
   qualification behind the same adapter without rewriting D1 semantics.

## Migration and upgrade contract

- Inventory every current Page, its Tenant-to-Site mapping, effective canonical
  default locale, versions, paths, and public state before changing shape.
- Backfill each existing Page into **exactly one** default-locale lineage. Never
  clone English content or `_status` into every allowed/future locale; absence must
  remain honest **Not started**.
- Preserve the existing stable Page identity and attribution. Create explicit
  successor editorial/placement revisions and D1 heads rather than treating a
  provider row conversion as publication.
- Use an expand/verify/cutover/contract migration with row counts, scoped
  uniqueness checks, content/version checksums, path collision proof, cross-tenant
  negative tests, and restartable batches. Keep the old read shape until the new
  exact-locale read path is proven.
- A down migration must not collapse divergent locale content or statuses into the
  default locale. Once a second locale exists, rollback means a forward-compatible
  adapter or new successor migration, not destructive provider down-conversion.
- Exports retain stable identity, exact locale, revision/provenance, and explicit
  missing variants. Imports pass the same Site/locale/profile validator; they do
  not smuggle unknown locale tags, cross-Site parents, or fallback-populated text.

## Full ruthless adversarial review

| Category                          | Material concern? | What could go wrong and why it matters                                                                                                                                                                                                                        | Severity | Likelihood  | Evidence/reasoning                                                                                                                                                    | Permanent prevention                                                                                                                                                                                                                       |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Brittleness                       | **Yes**           | A mutable multilingual document, default-enabled fallback, or UI locale selector can appear correct in one-language tests but mix locales, snapshot unrelated drafts, or publish more than intended when a second locale arrives.                             | Critical | High        | Payload defaults fallback to true, versions copy the full document, and the exact-pin primary action can publish all locales; D1 requires exact independent lineages. | Keep provider-neutral exact-locale lineages, disable field fallback at every seam, qualify exact provider behavior, and test one-to-many-locale transitions before launch.                                                                 |
| Technical debt                    | **Yes**           | Adding locale only after content exists forces destructive shape conversion; conversely, duplicating a translation-status engine now creates two owners with Phase 24.                                                                                        | High     | High        | Payload warns that toggling `localized` changes shape and can lose data; Phase 24 already owns status management.                                                     | Add required exact locale and provenance from the first migrated revision, keep one small code-owned profile, and store facts from which Phase 24 can derive status.                                                                       |
| Edge cases                        | **Yes**           | A locale may be added, disabled, renamed/canonicalized, missing, RTL, partially translated, copied from stale source, independently scheduled, trashed, restored, or released while another locale changes. Slugs and parents can collide only in one locale. | Critical | High        | D1/D2/D3/D12/D13/D17/D21 deliberately give these facts separate owners; modern CMSs support locale-specific draft/public states.                                      | Define an explicit state/race matrix, canonicalize BCP-47 tags, use exact-revision CAS, never auto-create translations, and exercise missing/RTL/CJK/stale-copy/route/schedule/Trash cases.                                                |
| Footguns                          | **Yes**           | Staff can edit the wrong language, mistake copied English for translated content, click generic Publish, or trust a fallback preview that differs from public output. Developers can omit `fallbackLocale: false` or use Local API access bypass defaults.    | Critical | High        | Payload's defaults and exact-pin buttons make these realistic, not hypothetical.                                                                                      | Persistent locale context, locale-named actions, one explicit translation-start flow, shared exact-locale reader, access wrappers that require fallback/access arguments, and static/contract tests banning raw reads.                     |
| Tenant safety                     | **Yes**           | A global locale list, forged Site/locale field, relationship population, service-role query, or incomplete key can expose another tenant's draft or bind a variant to a foreign Site.                                                                         | Critical | Medium–High | Payload locale filtering is selector filtering, not authorization; Supabase privileged roles bypass RLS.                                                              | Trusted server scope, composite scope FKs and uniqueness, Payload access plus command authorization, least privilege/RLS defense in depth, `depth: 0` public adapters, and hostile cross-scope fixtures.                                   |
| Overengineering                   | **Yes**           | Translation assignments, vendor connectors, machine translation, translation memory, per-field status, arbitrary fallback graphs, locale permissions, and a full locale dashboard would burden ministry staff and duplicate Phase 24.                         | High     | High        | The selected need is readiness and safe independent locale content; Phase 24 owns the broader product.                                                                | Launch with one quiet locale, one profile, one explicit start action, minimal provenance, no beta status, and named exclusions. Add only measured Phase 24 workflows.                                                                      |
| UX/UI and user friction           | **Yes**           | Empty tabs, flags, percentages, provider vocabulary, multi-column locale fields, and hidden source staleness make occasional nonprofit staff uncertain about what they are editing or publishing.                                                             | High     | High        | Webflow and other CMSs keep locale in persistent editor context; D12 already requires recoverable one-editor semantics.                                               | Hide locale controls for one locale; later use one named locale context, progressive disclosure, Blank/Copy choices, durable provenance/staleness, literal publish copy, mobile/a11y tests, and representative ministry usability studies. |
| Hidden coupling                   | **Yes**           | Locale storage can accidentally own route fallback, navigation labels, search membership, schedules, topics, presentation activation, Trash, or Phase 22 content.                                                                                             | Critical | High        | Ratified D1–D21 decisions assign those authorities separately.                                                                                                        | Publish an authority matrix, typed ports, exact revision pins, and negative tests proving D22 cannot advance or rewrite other owners.                                                                                                      |
| Failure modes                     | **Yes**           | Translation creation may save content but lose provenance; publish may advance content but not route/search; source comparison may fail; a timeout may prompt duplicate variants. Silent fallback can mask every failure.                                     | Critical | Medium–High | D1 intentionally distinguishes saved, activated, cached, searchable, and visible; exact-locale operations cross multiple boundaries.                                  | Transactional source facts, idempotency keys, expected-revision CAS, receipt read-back after unknown outcomes, prior-generation continuity, cause-coded health, retryable convergence, and no guessed fallback.                            |
| Data integrity risks              | **Yes**           | Duplicate variants, noncanonical locale aliases, mixed-scope parents, copied mutable references, status drift, slug theft, or destructive rollback can corrupt history and public meaning.                                                                    | Critical | High        | Payload's status up/down migrations demonstrate lossy collapse risk; D2/D3 require locale-exact route uniqueness/history.                                             | Canonical tag registry, stable identities, structural composite constraints, immutable revisions/provenance, source-reference validation, exact-scope route constraints, checksummed migration, and non-destructive forward recovery.      |
| Security and privacy risks        | **Yes**           | An unpublished translation may contain names, locations, or operational details unsafe for another audience; fallback can expose it under the wrong locale. Preview and copy endpoints may enumerate drafts.                                                  | Critical | Medium–High | Mission content can be safety-sensitive, and provider access/fallback defaults are broader than D1 public eligibility.                                                | Current authorization on every read/write, enumeration-safe responses, short-lived exact-scope preview, no raw provider DTOs, fail-closed fallback, Phase 10 adverse-first proof, audit without sensitive content, and security fixtures.  |
| Scalability and performance risks | **Yes**           | Dense locale rows, full-document autosave snapshots, unindexed scope queries, all-locale joins, and rebuilding every translation can multiply storage and latency by Pages × locales × versions.                                                              | High     | Medium      | Payload versions store full document copies; field-localized blocks can duplicate nested sets.                                                                        | Sparse started variants, one-locale working documents, bounded versions/autosave from D12, purpose-shaped indexes, exact-locale queries, structural reuse in D1, pagination, and production-shaped locale/version benchmarks.              |
| Operational burden                | **Yes**           | Staff or engineers may manually discover missing translations, repair mixed statuses, reconcile route/search gaps, or remember which API calls disable fallback.                                                                                              | High     | Medium–High | Without one enforced port, Payload permits several query modes and Phase 23 has multiple derived consumers.                                                           | One exact-locale editorial/public port, automated readiness and convergence health, cause-owned actions, migration/reconciliation jobs, runbooks, and quiet healthy-state UI.                                                              |
| Observability gaps                | **Yes**           | A provider row can be “published” while D1 is not live, or a Page can be live in one locale but absent/stale in another. Aggregate tenant metrics can hide one unsafe Site.                                                                                   | High     | High        | D1 and D17 explicitly separate authority from downstream convergence; Payload `_status` is not sufficient.                                                            | Metrics and traces keyed by privacy-safe Tenant/Site/locale/identity/revision, blocked-fallback counters, per-locale release/search/route health, source-copy staleness, invariant scans, and actionable alerts.                           |
| Dependency and integration risks  | **Yes**           | Payload beta behavior, schema generation, admin UI defaults, database adapter changes, or a future v4 update can change localization tables and buttons. Translation vendors could later demand a different model.                                            | High     | Medium–High | Exact-pin code differs materially from a generic “Payload supports localization” claim.                                                                               | Pin and qualify Payload, isolate it behind an adapter, maintain provider conformance tests, avoid beta status, preserve provider-neutral export/provenance, and require a new decision before vendor/MT integration.                       |
| Migration and upgrade risks       | **Yes**           | Turning current fields into localized fields can lose data; cloning current status to all locales fabricates translations; rolling back per-locale status can erase divergence.                                                                               | Critical | High        | Payload documents shape loss and the exact-pin migrations copy/collapse status. Current Core rows have no locale.                                                     | One-default-locale backfill only, expand/contract migration, checksums and hostile fixtures, no automatic future-locale clones, N/N-1 readers, and forward restoration rather than lossy down migration.                                   |
| Other development hazards         | **Yes**           | Concurrent locale start, autosave, source edit, route move, schedule, D10 activation, Trash, permission revocation, and deploy skew can create duplicate or incompatible revisions; tests may accidentally cover only `en-US`.                                | Critical | Medium–High | These races join already-ratified independent owners, while internal Payload v4 and Next.js deployments can change concurrently.                                      | Deterministic lock/CAS order, idempotent commands, compatible schema generations, failpoints and multi-connection tests, RTL/CJK/long-label fixtures, retained-reader compatibility, and explicit ownership for every invariant.           |

No category is safely dismissible. The important proportional response is not more
workflow; it is fewer authorities, exact scope, a shared fail-closed port, and
tests at the boundaries where the simple model can otherwise lie.

## Ruthless synthesis and order of work

### Must be fixed in the D22 contract before ratification

1. Ratify exact locale lineages and the stable/nonlocalized identity boundary.
2. Ratify the code-owned field classification above, including locale-specific
   composition and stable typed references.
3. Ratify one quiet single-locale launch and explicit Blank/Copy translation start
   for future Phase 24 activation.
4. Ratify no silent field fallback, no mixed-locale public output, and exact-locale
   omission across route, navigation, search, sitemap, SEO, social, and `hreflang`.
5. Ratify D1/D12—not Payload `_status` or `localizeStatus`—as working/public truth,
   and prohibit ordinary all-locale content publication.
6. Ratify sparse storage, canonical BCP-47 scope, one-default-locale migration,
   non-destructive rollback, tenant constraints, and exact-provider qualification.

### Address in implementation planning immediately after ratification

- Map the profile to Page, Article, D4 navigation, D7 blocks, D11 rich text, D2
  placement, SEO/social metadata, and typed source/media references without
  duplicating their owners.
- Design the Payload adapter and Postgres integrity keys; generate an explicit
  migration inventory and rollback proof before changing fields.
- Build the exact-locale read/write contract, fallback-ban tests, hostile scope
  matrix, concurrency/failpoint suite, and one ministry usability study around the
  Hope Missions scenario.
- Add privacy-safe per-locale authority and convergence observability before a
  second locale can be enabled.

### Phase 24, not D22

- Site locale creation/enable/disable/default changes;
- translation assignments, approval/status dashboards, coverage goals, vendors,
  machine translation, translation memory, and import/export workflow;
- explicit whole-page fallback, browser negotiation, public language selector, and
  `x-default` policy; and
- broader Site/domain/currency/staff-shell localization.

### Monitor rather than build now

- Payload `localizeStatus` maturity and exact future version behavior;
- measured version/storage growth by started locales;
- real tenant demand for side-by-side editing, vendor connectors, or machine
  translation; and
- public search relevance for languages whose stemming/tokenization may later
  require a D17 provider change.

## Independent hardening draft — synthesized by the canonical D22 brief

The following draft was the independent reviewer's input. The single exact
ratification candidate is the later, reconciled block in
[the canonical D22 readiness brief](./phase-23-d22-localization-readiness-research.md#exact-proposed-phase-23-d22-c-prime-r-formulation).

> **C-prime-R — One bounded, code-owned Localized Editorial Profile over D1's
> exact locale lineages, with explicit translation starts and fail-closed public
> locale resolution.** One stable Site-scoped ordinary Page or Article identity
> remains nonlocalized and owns subordinate canonical BCP-47 Editorial and
> Placement lineages. Each locale revision independently owns its localized title,
> summary, bounded typed composition, rich text, usage-level accessible media copy,
> editorial SEO/social copy, and D2 local path segment, while stable identity,
> family, scope, permissions, audit, lifecycle, folder and Topic assignments,
> schema/source keys, typed operational references, media identity, publication
> heads, and provider links remain nonlocalized or with their existing owner. The
> profile is one versioned code contract, not tenant-created schema or per-field
> workflow.
>
> A one-locale Site receives the ordinary Page editor with no locale noise. After
> Phase 24 explicitly enables another locale, an authorized actor starts one
> variant with **Start blank** or **Copy from <exact source locale>**. Copy creates
> a private working revision pinned to the exact source revision and records calm
> provenance; it never creates public fallback, publication, approval, or an
> automatic merge. Later source change produces a durable comparison/staleness
> fact without overwriting the translation. Locale switching waits for acknowledged
> D12 save/recovery, all actions name the active language, and ordinary publication
> advances only that locale through D1. D10 remains the sole presentation-only
> cohort exception, and D21 still moves the whole identity and every locale to
> Trash together.
>
> Phase 23 public and preview reads resolve one exact locale with Payload fallback
> disabled. Missing required locale content blocks the candidate or yields
> privacy-safe absence; optional typed content may omit only by contract. No route,
> navigation, search, sitemap, metadata, social card, `hreflang`, schedule, or
> public Page may mix, infer, clone, or silently serve fields from another locale.
> `hreflang` names only mutually eligible released variants. Whole-page fallback,
> locale enablement/default changes, public language selection, translation-status
> management, vendor/MT workflow, and broader multi-Site localization remain Phase
> 24 authority.
>
> Payload `4.0.0-internal.1f9ae9a` remains a qualified persistence/authoring
> adapter only: its global locale selector, field localization, versions,
> `_status`, experimental `localizeStatus`, default fallback, publish-all UI, and
> migrations are not authorization, translation readiness, or public release
> truth. Phase 23 shall not enable beta localized status. Storage is sparse by
> started locale, uses canonical tags and complete composite Tenant/environment/
> Site/identity/locale integrity, layers server authorization with least-privilege
> grants and applicable RLS, and indexes exact access paths. Existing content is
> checksummed and backfilled into exactly one proven default-locale lineage—never
> cloned into every configured locale—through expand/verify/cutover migration;
> rollback may not collapse divergent locale content.
>
> Acceptance requires exact-pin provider tests, cross-Tenant/Site/locale hostile
> fixtures, fallback-ban and mixed-language tests, migration/rollback and
> locale-add/disable tests, D1/D2/D3/D10/D12/D13/D17/D21 race/failure tests,
> per-locale observability, RTL/CJK/long-label/mobile/keyboard/screen-reader/reflow
> proof, and representative ministry staff correctly starting, editing,
> comparing, previewing, publishing, withdrawing, and restoring a translation
> without coaching. This decision records product architecture only and authorizes
> no implementation, schema, migration, provider adoption, issue publication,
> release activation, or production change.

## Decision status

The founder ratified the canonical readiness brief's exact C-prime-R formulation
as **Phase 23 D22** on 2026-08-23. This independent review remains supporting
analysis and does not compete with or expand that single binding formulation.
