# ADR-0166: Bounded Localized Editorial Profile over D1 exact locale lineages

**Status:** Accepted (founder-ratified Phase 23 D22 C-prime-R, 2026-08-23)

## Context

Phase 23 must make ordinary Pages and Articles localization-ready without
shipping a scalar-content dead end, silently mixing languages, or prematurely
building Phase 24's locale-management and translation-operations product. D1
already established one stable Site-scoped identity with subordinate exact
BCP-47 Editorial and Placement lineages, while D2, D3, D4, D10, D12, D13, D17,
D21, Phase 10, Phase 22, and Phase 24 retain distinct authority over paths,
continuity, Navigation, presentation activation, working revisions, schedules,
search, Trash, safety, specialized public ministry content, and locale
configuration.

Core currently has scalar Page fields and no Payload localization configuration.
It pins Payload to `4.0.0-internal.1f9ae9a`. At that pin, Payload's
`localized: true` changes field storage shape, fallback is enabled by default,
versions may snapshot a multilingual provider document, `localizeStatus`
remains experimental, and provider publication controls can offer all-locale
behavior. Those mechanics are not a sufficient product authority for sparse,
independently releasable, tenant-safe locale lineages.

Modern CMS practice supports independently versioned rich-content locale
documents when locales require asynchronous editorial work and publication.
Search and accessibility guidance also requires truthful language declarations,
actual locale URLs, explicit alternatives, and no invented translated
representations. The founder therefore selected a bounded exact-locale model
with explicit starts and permanently prohibited silent field fallback.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — One bounded, code-owned and
> versioned Localized Editorial Profile over D1's sparse exact-locale lineages,
> with explicit translation starts, independently releasable locale revisions,
> and fail-closed public locale resolution.** One stable Site-scoped ordinary
> Page or Article identity remains nonlocalized and owns subordinate canonical
> BCP-47 Editorial and D2 Placement lineages. Each locale Editorial Revision
> independently owns localized title, summary, bounded typed Page-local
> composition, rich text, authored headings/body/CTA copy, usage-level alt text,
> captions and transcripts, and editorial SEO/social copy; D2 independently owns
> that locale's parent and normalized path segment. Stable identity, Tenant,
> environment, Site, family, capabilities, attribution, audit, lifecycle and
> Trash, D18 folder and D19 Topic assignments, block/source/contract keys, typed
> operational references, media binary identity and legal evidence, provider
> links, schedules, release heads and receipts remain nontranslated or with their
> already-ratified owner. D4 Navigation, forms, system messages, Phase 22 public
> ministry content, safety, and every independently live source retain their own
> localization and release authority. The profile classifies the finite
> translatable facets of ordinary families and every certified D7/D9 block
> version. Each canonical family/block contract co-locates its typed localization
> manifest, while the profile pins and validates those manifests as one compatible
> version; there is no separately hand-maintained duplicate field list. It is not
> a tenant schema builder, reflection-driven second schema, per-field workflow, or
> database row per field.
>
> Ordinary Page/Article rich content is persisted and versioned at D1's exact
> locale-lineage grain from the first migrated revision, not as one mutable
> provider document whose versions snapshot every language. Locale rows are
> sparse: enabling a Site locale does not clone content or create favorable
> routes. A one-locale Site receives the normal D12 editor with no language
> selector, percentage, empty tabs, or translation dashboard, while exact locale
> remains explicit internally. After Phase 24 enables another locale, an
> authorized actor chooses **Start <target language>**, then **Start blank** or
> **Copy from <authorized exact source language>**. The operation is idempotent,
> scope-checked, and pinned to an exact source revision. A copy creates only a
> private target working revision, copies only profile-allowlisted editorial
> values and permitted stable references, and records calm provenance; it is not
> proof of translation, approval, publication, runtime fallback, or permission
> to expose the source. Cross-locale Reusable Section references never carry
> silently: the target selects or explicitly creates an eligible target-locale
> section through its existing owner.
>
> A later translation-affecting source change creates a derived **Source
> changed** fact and an exact read-only comparison; it never overwrites, merges,
> unpublishes, or republishes the target. An authorized editor may update the
> target or attest with actor/time/reason that it remains current against the new
> source pin. Nonsemantic audit, folder, Topic, provider-key, and independently
> live source changes do not manufacture translation work. Current Phase 10
> safety or lifecycle narrowing remains adverse-first and may make any locale
> ineligible immediately; ordinary staleness alone does not rewrite an existing
> release.
>
> The multi-locale editor keeps one active locale in persistent Page-header
> context, labels it with its language in the language's own script plus optional
> region rather than a flag alone, and derives two honest facts: public state
> (**Not live** or **Live**) and editorial attention (**Not started**, **Draft**,
> **Needs review**, **Approved**, or **Source changed**). The roadmap's missing,
> draft, needs-review, approved, published, stale and future fallback-used
> indicators are projections over immutable revision, review, source-pin, D1
> release and future Phase 24 resolver receipts—not mutable status booleans or a
> new workflow engine. Required-field and contract completeness is mechanically
> validated; semantic translation completeness is one calm, Page-level human
> confirmation, plus existing review evidence when policy requires it, because
> software cannot safely infer accuracy merely from field presence or differences
> from the source. Locale switching first completes or explicitly recovers
> D12 autosave/conflict state. Optional source comparison is read-only and
> responsive. Preview and every favorable action name the locale—**Preview
> Spanish**, **Schedule Spanish**, **Publish Spanish**, **Withdraw Spanish**—and
> ordinary **Publish all languages** does not exist. D13 schedules one exact
> locale revision; D10 remains the sole presentation-only cross-locale cohort
> exception; D21 still moves the stable identity and all locale variants to Trash
> together while locale-only withdrawal remains release authority.
>
> Every authoring, preview, compiler and public read requests one exact locale
> through one shared provider-neutral port with provider field fallback disabled.
> Missing required locale content blocks the candidate; optional content may be
> absent only when its typed contract defines a safe and accessible omission. A
> missing exact release creates no favorable route, Navigation destination,
> search document, sitemap URL, canonical, social card, schedule target or
> `hreflang` alternate, and never assembles mixed-language fields. Direct missing
> locale resolution fails honestly under the D2/D3/Phase 10 route contract and
> may offer explicit links to eligible released alternatives at their own real
> canonical URLs and actual `lang`; it does not automatically redirect or render
> another language under the requested locale URL. Phase 24 may later own a
> bounded, disclosed whole-page alternative policy, language preference and
> `x-default`, but can select only one complete currently eligible release and
> may never weaken the no-field-fallback invariant. Reciprocal `hreflang` names
> only actual mutually eligible released variants of the same stable identity.
>
> Public output uses UTF-8, the canonical BCP-47 `lang`, correct base direction,
> and language-of-parts markup where the content contract admits deliberate
> mixed-language passages. It supports text expansion, long labels, CJK, RTL,
> bidirectional isolation, local fonts and formats, logical layout properties,
> normalized/collision-checked locale paths, and user-controlled language links.
> Translation status, preview, comparison and public-alternative surfaces remain
> keyboard operable, screen-reader named and announced, focus-correct, touch
> usable, and proven at 320 CSS pixels and 400 percent zoom without relying on
> color, flags, hover, toast-only feedback, or motion.
>
> Payload `4.0.0-internal.1f9ae9a` remains a qualified authoring/persistence
> adapter only. Its global locale list, `localized: true` storage, full-document
> versions, `_status`, experimental `localizeStatus`, default field fallback,
> locale-filtered selector, publish-all controls and provider migrations are not
> authorization, readiness, lineage, or public release truth. Phase 23 does not
> enable beta localized status. Provider field localization may be used only for
> a separately profiled bounded field where exact-pin tests prove it appropriate;
> it cannot replace D1's ordinary locale revision. All privileged Local API and
> database paths re-prove current actor capability and trusted server-derived
> Tenant × environment × Site × stable identity × locale scope. Composite
> foreign keys, uniqueness, expected-revision fences, applicable grants/RLS,
> purpose-shaped indexes, `depth: 0` public adapters, non-enumerating errors and
> hostile cross-scope fixtures prevent client-selected locale or elevated
> provider access from becoming authority.
>
> Migration inventories every current Page, Tenant-to-Site binding, explicitly
> proven canonical default locale, revision, path, schedule and release before
> changing shape. It uses restartable expand → backfill → checksum/constraint/
> route verification → shadow-read → cutover → contract stages, backfills each
> legacy Page into exactly one locale lineage, and never fabricates future
> translations by cloning content or status across configured locales. Old
> revisions remain readable through a bounded compatibility adapter until cutover
> proof passes. Rollback may not collapse divergent locale data into one default
> locale or depend on Payload's lossy localized-status down migration; recovery
> is a forward-compatible adapter or a new explicit successor migration. Profile
> evolution is additive and version-pinned, with deterministic migrators and
> retained readers rather than in-place mutation during reads.
>
> Acceptance requires exact-pin Payload storage/query/version/admin-control/
> migration conformance; profile and certified-custom-block localization
> manifests; cross-Tenant/Site/environment/identity/locale authorization and
> relationship tests; fallback-ban, mixed-language, missing-required and public
> eligibility tests; BCP-47/Unicode/path collision, locale add/disable and
> migration/rollback fixtures; idempotency, concurrent Start translation,
> autosave, source-change, route, schedule, D10, Trash, permission-revocation and
> deploy-skew failpoints; exact D1/D2/D3/D12/D13/D17/Phase 10 convergence proof;
> privacy-safe per-locale health for missing, stale, blocked, released, indexed
> and alternative-use facts; and representative ministry staff completing blank
> and copied translation starts, comparison, preview, review, publish, withdraw
> and recovery without coaching across desktop/mobile, keyboard/screen reader,
> long/CJK/RTL content and slow or interrupted networks. This decision records
> architecture only and authorizes no implementation, schema, migration,
> provider adoption, issue publication, release activation or production change.

## Why this boundary

1. **It follows D1 instead of creating a competing localization model.** Exact
   locale lineage already is the Page editing and release grain. Persisting all
   languages in one provider document would couple unrelated drafts, versions,
   schedules, and publication.
2. **It removes a known migration trap.** Scalar content is not a durable
   localization shape, while switching broad fields to provider localization
   later changes stored structure. Sparse exact locale resources permit
   controlled expand/backfill/cutover without fabricating translations.
3. **It makes public behavior honest.** No fallback field can silently turn a
   partially translated Page into a mixed-language release or favorable SEO,
   Navigation, search, social, or hreflang claim.
4. **It preserves staff judgment.** Copying a source is a starting convenience,
   not machine proof of translation. Source changes inform rather than erase
   intentional localization, and semantic completion remains a bounded human
   confirmation.
5. **It keeps the experience quiet.** One-locale ministries retain their current
   editor. Multi-locale Sites gain one active-language context, two explicit
   start choices, clear separate live/attention facts, and locale-named actions.
6. **It prevents provider lock-in.** Payload can provide qualified mechanics
   behind a provider-neutral port, but Asym retains scope, provenance,
   readiness, release, migration, failure, and public-resolution truth.
7. **It protects Phase 24.** The decision creates compatible lineages and health
   facts without prebuilding locale enablement, assignment, vendor, machine
   translation, memory, fallback administration, or visitor-preference products.

## Binding interpretation

- One stable ordinary Page or Article identity is nonlocalized; its sparse exact
  BCP-47 Editorial and D2 Placement lineages version and release independently.
- The code-owned Localized Editorial Profile pins co-located typed manifests for
  Page, Article, every qualified D7/D9 block, and every certified custom
  package. It is neither a tenant schema nor a second hand-maintained field list.
- Localized editorial ownership includes authored text, composition, rich text,
  editorial SEO/social copy, and usage-level media descriptions. Stable scope,
  identity, operational references, assignments, contracts, binary custody,
  schedules, lifecycle, and release receipts remain nontranslated or with their
  existing owner.
- Translation starts only by an authorized explicit Blank or exact-source Copy
  command. Copy creates a private target working revision and immutable source
  pin; it cannot prove translation, approval, release, safety, or source access.
- Translation-affecting source change derives **Source changed** and an exact
  comparison. It does not overwrite, merge, withdraw, or republish the target.
- Public and editorial-attention states are derived separately from immutable
  revision, review, source-pin, release, safety, and future resolver facts.
- Preview, schedule, publish, and withdraw act on one named locale. Ordinary
  publish-all is prohibited.
- Every read uses one exact locale and disables provider field fallback. Missing
  exact releases fail honestly and create no favorable discovery or metadata.
- Phase 24 may later define a disclosed whole-page alternative, but may only
  select one complete eligible release and can never weaken no-field-fallback.
- Payload localized fields, provider statuses, locale selectors, migrations, and
  controls remain adapter details. Beta `localizeStatus` is not enabled by
  D22.
- Migration proves and backfills one existing locale only, verifies before
  cutover, retains old readers, and never rolls divergent locales into one
  lossy row.
- All actor, Tenant, environment, Site, identity, locale, relationship, compare-
  and-set, RLS/grant, query, preview, health, and error behavior is exact-scope
  and non-enumerating.

## Authority boundaries

| Concern                                        | Authority                     | Consequence of D22                                                                           |
| ---------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------- |
| Stable identity and locale Editorial revisions | D1 plus D22 profile           | D22 classifies locale-owned ordinary editorial facets; D1 remains release authority.         |
| Locale hierarchy and path                      | D2                            | Translation cannot copy, infer, transfer, redirect, or steal a path.                         |
| Route continuity                               | D3                            | Same identity and same locale only; missing translation creates no cross-locale continuity.  |
| Navigation                                     | D4                            | Retains its own localized revision and release participation.                                |
| Presentation cohort activation                 | D10                           | Remains the sole bounded all-locale presentation-only transaction.                           |
| Draft/autosave/conflict/active editor          | D12                           | Locale switching and translation start obey its fences and recovery.                         |
| Schedule                                       | D13                           | Appointment binds one exact locale revision.                                                 |
| Lists and public search                        | D14–D17                       | Consume exact eligible public projections and cannot invent a translation.                   |
| Folders, Topics, Saved Library Views           | D18–D20                       | Remain organization and classification facts, not translated Page content.                   |
| Trash                                          | D21                           | Whole identity and all locale variants move together; locale withdrawal is publication work. |
| Specialized ministry content                   | Phase 22                      | Keeps its own localized-content, privacy, review, release, and media decisions.              |
| Safety and eligibility                         | Phase 10/source owners        | Can narrow any locale adverse-first without D22 approval.                                    |
| Locale lifecycle and fallback administration   | Phase 24                      | D22 provides compatible exact lineages and derived health only.                              |
| Media binaries and legal custody               | Existing media owner/Phase 29 | D22 owns only usage-level locale editorial descriptions.                                     |
| Payload localization                           | Qualified adapter             | Never authorization, readiness, lineage, release, or public truth.                           |

## Consequences

### Positive

- Ordinary content has a durable localization shape before a second locale is
  enabled, avoiding a later English-only schema rewrite.
- Locales can be drafted, reviewed, scheduled, released, withdrawn, restored,
  searched, and observed independently without unrelated language churn.
- Donors receive one truthful language representation, never mixed fallback
  fields or false translated SEO/discovery.
- Ministry staff get a small, literal workflow that does not expose translation
  machinery on one-locale Sites.
- Source provenance and staleness are exact without treating one language as a
  permanent authority over another.
- Provider replacement and upgrade remain bounded by one exact-locale port and
  conformance suite.
- Tenant isolation, migration integrity, accessibility, CJK/RTL, and operational
  health become explicit activation gates.

### Costs and trade-offs

- Separate locale lineages create more resource identities, versions, indexes,
  migration work, and reconciliation than a single localized provider document.
  Sparse creation and one-locale queries bound that cost.
- Copy-start and source comparison require provenance and deterministic
  translation-affecting dependency classification.
- Staff cannot publish all ordinary languages with one click and cannot rely on
  automatic field fallback. This deliberate friction prevents wrong-language
  and partial-language publication.
- Existing scalar content requires a proved expand/backfill/shadow-read/cutover
  migration before multi-locale activation.
- Richer translation operations remain unavailable until Phase 24 rather than
  leaking in as scattered Phase 23 features.

### Risks controlled by the decision

The adversarial review found material concerns in every required category:
brittleness, debt, edge cases, footguns, tenant safety, overengineering, UX,
hidden coupling, failure, integrity, privacy, scale, operations, observability,
dependencies, migration, and concurrency/deployment hazards. The decision
controls them with sparse exact lineages, finite generated manifests, explicit
private starts, immutable source pins, named single-locale commands,
fallback-free reads, structural scope, CAS/idempotency, fail-closed public
resolution, safe staged migration, provider qualification, and
production-shaped proof. It deliberately rejects a general translation platform
as the remedy.

## Rejected alternatives and prohibited shortcuts

- shipping scalar English-only content as the durable Phase 23 model;
- one broadly field-localized Payload document as ordinary Page/Article release
  and version authority;
- enabling experimental Payload `localizeStatus` or exposing provider
  publish-all controls as Asym truth;
- silently enabling provider fallback in authoring, preview, compiler, route,
  metadata, discovery, or public reads;
- composing one Page from fields belonging to several locales;
- automatically cloning content, paths, status, review, approval, release, or
  eligibility when a Site locale is enabled;
- claiming copied source prose is translated, reviewed, approved, or safe;
- overwriting or unpublishing a target because its source changed;
- flags as the sole language identifier, percentage-complete as semantic proof,
  editable side-by-side forms, or a permanent translation dashboard for a
  one-locale Site;
- client-supplied scope, privileged Local API/database access, browser filters,
  provider status, or relationship population as authorization;
- automatic locale redirects, invented cross-locale route continuity, favorable
  missing-locale SEO, or hreflang for an unavailable variant;
- tenant-authored localization schemas, database rows per field, per-field
  workflow, arbitrary fallback graphs, translation vendor exchange, machine
  translation, translation memory, or generic approval workflow in D22; and
- one-step destructive field conversion, cloning into every configured locale,
  read-time mutation, or lossy rollback of divergent locale history.

## Required evidence before activation

A future authorized implementation must satisfy the complete D22 proof matrix,
including:

1. profile and certified-package manifest version compatibility and old-reader
   behavior;
2. hostile cross-Tenant/environment/Site/identity/locale/actor/capability and
   revoked-access proof for all reads, writes, counts, comparisons, health, and
   relationships;
3. fallback-disabled exact-locale tests across authoring, preview, compiler,
   routes, Navigation, D14–D17 discovery, sitemap, canonical, social, and
   hreflang;
4. idempotent concurrent Blank/Copy, autosave, source-change, attestation,
   schedule, publish, withdraw, Trash, safety, permission-revocation,
   lost-response, and deploy-skew failpoints;
5. BCP-47, Unicode, normalization, path collision, language, direction,
   language-of-parts, CJK, RTL, bidirectional isolation, long-copy, and local-
   format coverage;
6. exact pinned Payload storage/query/version/admin/access/fallback/migration/
   upgrade conformance with beta status excluded;
7. restartable inventory, one-proven-locale backfill, checksums, constraints,
   shadow read, cutover, export, restart, and non-lossy recovery proof;
8. purpose-shaped query plans, sparse storage, version retention, compiler/
   comparison/reconciliation capacity, and no cross-locale N+1 scans;
9. privacy-safe cause-coded health and runbook recovery for missing, stale,
   blocked, released, indexed, provider-failed, migration, and convergence
   states; and
10. representative ministry staff completing translation start, comparison,
    preview, review, publish, withdrawal, and recovery without coaching on
    desktop/mobile, keyboard, screen reader, touch, 400% zoom, 320px reflow,
    long/CJK/RTL content, and slow/interrupted networks.

## References

- [Phase 23 D22 primary-source research, exact-provider audit, localization UX, ruthless synthesis, and proof gates](../prds/sitestacker-parity/research/phase-23-d22-localization-readiness-research.md)
- [Phase 23 D22 independent 17-category adversarial review](../prds/sitestacker-parity/research/phase-23-d22-localization-independent-adversarial-review.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0146 — Staged hierarchical public paths](./0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [ADR-0147 — Generation-bound automatic route continuity](./0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [ADR-0148 — Curated Navigation Revisions](./0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [ADR-0154 — Complete-cohort Site Presentation activation](./0154-complete-cohort-site-presentation-activation-through-d1.md)
- [ADR-0156 — Bounded editorial working revisions and recoverable active editor](./0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [ADR-0157 — Exact-revision scheduled publication appointments](./0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [ADR-0161 — Derived Public Site Search Projection](./0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [ADR-0165 — Asym-owned recoverable Trash](./0165-asym-owned-reference-aware-recoverable-trash.md)
- [Payload Localization](https://payloadcms.com/docs/configuration/localization)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Sanity localization](https://www.sanity.io/docs/studio/localization)
- [Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)
- [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/)
- [Google multilingual site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Google localized versions and hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [W3C language tags](https://www.w3.org/International/articles/language-tags/index.en)
- [W3C language-link guidance](https://www.w3.org/International/questions/qa-link-lang.en)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

Ratification of this planning decision authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.
