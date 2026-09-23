# Phase 23 D22 research — localization-ready ordinary content and missing-translation behavior

**Status:** Founder-ratified and adversarially hardened as **Phase 23 D22
C-prime-R** on 2026-08-23.

## Decision to make

Phase 23 must choose how ordinary Pages and Articles become localization-ready
without either shipping an English-only storage dead end or adopting a large
translation-management product before Phase 24. The coupled product question is:

> What is the bounded localized-content boundary, who owns per-locale release,
> and what may the public site show when an exact translation is unavailable?

This is one architectural decision because storage shape, editor behavior,
publication authority, fallback, routes, search, metadata, and migration safety
must agree. It does not decide which locales a Site enables or let Phase 23
become Phase 24.

## Settled boundaries that D22 must preserve

- **D1 / ADR-0145:** one stable Site-scoped Page has subordinate BCP-47 locale
  lineages. One locale Editorial Revision owns its localized title, typed
  Page-local composition, and editorial SEO; one locale Page Placement Revision
  owns its path. Ordinary publication advances one exact Tenant × environment ×
  Site × locale Public Site Generation.
- **D2 and D3:** paths and route continuity are locale-exact. D22 cannot infer a
  cross-locale redirect or steal a path.
- **D10:** the only bounded cross-locale transaction is Site Presentation
  activation. Ordinary content publication remains single-locale.
- **D21:** Trash applies to the whole Page or Article identity and all locale
  variants. Locale-only withdrawal is a release action, not locale Trash.
- **Phase 24:** enabled locales, default locale, Site fallback-chain
  configuration, translation-status management UX, and per-locale system-message
  overrides belong to Phase 24. D22 must provide compatible seams, not a second
  locale-management authority.

## Current Core and exact-provider facts

### Current Core is not localization-ready yet

- `apps/admin/payload.config.ts` has no Payload `localization` configuration.
- `apps/admin/src/cms/collections/pages.ts` stores scalar `title`, `slug`,
  `summary`, `content`, and layout fields and has one ordinary draft `_status`.
- The current collection has Tenant scope but not the D1 Site/environment/locale
  lineage. Shipping that scalar model as the durable Phase 23 contract would
  create a later content migration.
- Core pins Payload and its adapters to
  `4.0.0-internal.1f9ae9a`; generic Payload 3 or public stable-version behavior
  cannot be assumed.

### Payload provides useful mechanics, not the complete product contract

The pinned Payload source and documentation establish that:

- localization is configured globally but applied at field level with
  `localized: true`;
- provider fallback is enabled by default unless disabled or overridden;
- localizing a top-level array or blocks field localizes its whole nested set;
- converting an existing field to or from `localized: true` changes its stored
  shape and requires a deliberate migration to avoid data loss;
- `localizeStatus` can represent per-locale draft/published state, but it is
  explicitly experimental, requires a global flag and per-collection opt-in,
  and has dedicated up/down migration machinery;
- the pinned stock Publish control supports both active-locale and all-locale
  behavior and defaults to all locales unless another provider option is set;
  that is not D1's ordinary publication contract; and
- tenant-filtered locale selectors are provider UI assistance, not structural
  authorization. The current docs also warn that their root-level result may
  require an explicit router refresh when tenant locale configuration changes.

The safe conclusion is not to reject Payload localization. It is to place its
field storage, selector, and query features behind a version-qualified adapter
while Asym owns exact scope, revision identity, readiness, release, and public
fallback semantics.

## Current comparable-CMS evidence

- Payload documents field-level localization, per-request fallback controls,
  locale filtering, and experimental per-locale status.
- Sanity distinguishes field-level localization, which naturally publishes a
  document's languages together, from document-level localization, which allows
  independent language publishing and works well for language-specific rich
  content. This supports D1's independent locale lineages.
- Contentful treats governance, asynchronous locale publication, and fallback as
  separate design dimensions. Its locale-based publishing lets editors release
  languages independently and exposes per-locale Draft, Published, and Changed
  status.
- Contentstack creates an independent version after localization and gives that
  version its own history and publication state. It also demonstrates why
  fallback must be explicit: preview, delivery, empty fields, old localized
  copies, and referenced content can otherwise disagree.
- Google recommends separate locale URLs, explicit links between language
  variants, and reciprocal `hreflang`; it advises against automatic
  language-based redirects that prevent users or crawlers from reaching another
  version. Only actual public variants belong in `hreflang` sets.
- W3C requires a valid BCP-47 `lang` value that describes the language actually
  rendered. A Spanish URL that silently renders an English body must not claim
  that the body is Spanish.

## Ministry scenario

A ministry has an English disaster-response Article live. Spanish is enabled,
but its translation is still a draft. Staff correct a location name and a
security-sensitive paragraph in English.

The safe, understandable result is:

1. the last valid English release changes only after English Publish;
2. the Spanish draft is marked **Out of date** against the exact English source
   revision from which it began;
3. the public Spanish route never becomes a field-by-field mixture of Spanish
   and new English;
4. if no Spanish revision has ever been released, Spanish discovery does not
   pretend one exists;
5. an exact missing Spanish route fails closed and offers the complete eligible
   English release only as an explicit language alternative at its real English
   URL, with no automatic redirect, field merge, fake Spanish search result, or
   `hreflang` claim; and
6. current Phase 10 safety may withdraw an older Spanish release immediately if
   it is no longer safe. Translation staleness alone is not permission to mutate
   or republish it.

## Options

### Option A — Keep English scalar fields now and retrofit localization in Phase 24

**What it does:** Phase 23 ships the current scalar shape and adds locale storage,
status, and migration only when multiple languages are enabled.

**Benefit:** Lowest immediate implementation cost and no locale controls for an
English-only launch.

**Cost:** It knowingly creates the destructive migration the roadmap says to
avoid. Existing rich text, blocks, paths, versions, references, schedules, and
public generations would all require conversion under live data.

### Option B-prime — Make Payload localization and `localizeStatus` the product model

**What it does:** Mark broad public fields localized, use Payload's locale
selector and beta per-locale `_status`, and accept provider fallback/publish
behavior with limited customization.

**Benefit:** Reuses the most provider UI and storage behavior.

**Cost:** Provider defaults can publish all locales or silently mix fallback
fields, top-level localized blocks duplicate nested operational data, and the
beta status migration becomes product authority. It conflicts with D1's exact
Asym generation and release semantics and makes provider upgrades risky.

### Option C-prime — One bounded Localized Editorial Profile over D1 locale lineages, with explicit translation starts and no silent field fallback

**What it does:** Keep one stable shared Page/Article identity and use a
code-owned, versioned Localized Editorial Profile to identify the audience-facing
fields and block facets owned by each exact locale Editorial Revision. Persist
ordinary rich content at D1's exact locale-lineage grain from the start rather
than making one mutable Payload document carry every language. Payload remains a
qualified authoring/persistence adapter; its field localization may be used only
where an exact profiled field truly needs it and never defines the D1 locale
lineage. Asym owns locale revision, readiness, review evidence, and D1 release;
Payload `_status`, fallback, publish-all behavior, and experimental
`localizeStatus` are not product authority.

An editor explicitly chooses **Start translation**, then either **Start blank**
or **Copy from <exact source locale>**. A copy creates a private target-locale
working revision and records the exact source pin for provenance and staleness;
it is a snapshot, not live inheritance, runtime fallback, or proof of
translation. Public reads disable provider field fallback. D22 fails closed when
an exact locale release is absent. Phase 24 may later configure only a bounded,
explicit whole-page alternative to another complete, currently eligible released
locale. It must lead to that release's real canonical URL and actual language,
never build a mixed-language Page or invent a translated route, search document,
canonical, social card, or `hreflang` variant.

**Benefit:** Matches the already-ratified locale lineage, prevents both a later
English-scalar retrofit and a provider-localized multilingual-document dead end,
keeps independent publishing safe, and preserves a replaceable Payload boundary.
One-locale tenants still see an ordinary one-locale interface.

**Cost:** Requires a small Asym exact-locale revision/readiness adapter and a
locale-aware editor header rather than delegating the product to Payload's beta
status UI.

## Recommended bounded field policy under Option C-prime

### Locale-owned audience presentation

- title, summary, rich text, editorial SEO title and description;
- the exact locale composition of typed blocks and their authored headings, body
  copy, CTA labels, and other presentation facets admitted by the block contract;
- audience-facing alt text, captions, and transcripts while media identity and
  binary lifecycle remain with Phase 29; and
- block-specific audience copy and presentation choices explicitly admitted by
  the versioned block contract.

The D2 locale Page Placement Revision—not D22—continues to own the localized
parent and path segment. D4 continues to own Navigation labels; form and system
message owners continue to own their copy. Those owners must honor the same
exact-locale/no-mixing rule without moving their authority into this profile.

### Shared or source-owned facts that are not translations

- stable Page/Article, Tenant, environment, Site, and Page-family identity;
- capabilities, authorship/audit events, release receipts, and provider keys;
- folder placement and Topic assignment already owned by D18/D19;
- designation, operational source identity, integration IDs, and independently
  live source facts;
- media binary identity, legal/permission evidence, and safety authority; and
- code-owned block/source keys and contract versions.

A locale composition may pin a stable reference as configuration, but translation
does not copy or mutate the referenced operational record. Translation tooling
receives only the allowlisted audience-facing content, never source keys, private
facts, or executable configuration.

If a source composition references a D1 Reusable Section, translation start may
not carry that source-locale relationship into the target. The target must select
or explicitly create a target-locale section through the section owner's bounded
flow; until then readiness names the missing dependency. Stable source-owned
dynamic references may carry only when their contract permits the target locale
and D1 revalidates current public safety.

## Staff UX under Option C-prime

- A one-locale Site shows no language switcher, translation dashboard, fallback
  setting, or empty status column.
- Once Phase 24 enables more than one locale, the existing Page header gains one
  compact language control beside status—not a field-by-field wall of flags.
- The control uses language names in their own script, optional region, and a
  detailed BCP-47 code; flags are never the only identifier. It exposes two
  small, derived facts rather than one misleading status: public state
  (**Not live** or **Live**) and editorial attention (**Not started**, **Draft**,
  **Needs review**, **Approved**, or **Source changed**). A live translation may
  therefore honestly say **Live · source changed**. Review facts appear only when
  an existing owner requires them; D22 creates no workflow engine.
- Switching locale first resolves D12 save/conflict state. The canvas then edits
  one language at a time; an optional read-only source comparison helps without
  making two full editors fight for space.
- **Start Spanish…** offers **Start blank** or **Copy from English…**, names the
  exact source revision, and explains that later source edits will request review
  but will not overwrite the target. Copy never claims that the result is
  translated or ready.
- The primary action says **Publish Spanish**, not an ambiguous **Publish all**.
  Other languages and their public state remain unchanged.
- Preview names both language and state. When Spanish is not live, it says so and
  offers an explicit preview of an eligible English alternative at its own
  language/canonical context; it never looks like a Spanish release.
- Missing, conflict, stale source, access denial, locale disabled, invalid path,
  fallback blocked, release failure, and success remain persistent and
  programmatically announced, not toast-only.
- Source comparison is optional and read-only. On wide screens it may appear
  beside the target; on narrow screens it becomes a clearly labelled toggle, not
  two competing editable canvases. A translator who cannot read the source is not
  granted it through this feature.

## Derived readiness, not a second workflow table

The staff projection can derive the prompt's required indicators from existing
facts:

- **Not started / Missing:** no target working revision;
- **Draft:** a private target revision exists;
- **Needs review / Approved:** existing review evidence when required;
- **Live / Published:** an exact target locale revision is pinned by the current
  D1 generation;
- **Out of date / Source changed:** its recorded source pin precedes an
  allowlisted translation-affecting source change. Unrelated audit, folder,
  Topic, operational-source, or provider-key changes do not create false
  translation work; and
- **Fallback shown:** the public resolver served one whole eligible released
  fallback under the active Phase 24 policy.

These are projections over immutable revision, review, release, source-pin, and
future Phase 24 alternative-resolution facts. A translator may explicitly
confirm that the target remains current against a newer source revision, with
actor/time/reason evidence, without copying or republishing it. D22 does not add
seven mutable booleans, a generic state machine, or one database row per field.

## Preliminary adversarial precheck

- **Brittleness / migration:** predeclare the bounded localization profile,
  persist ordinary rich content at D1's exact locale-lineage grain, and use
  expand-backfill-verify activation; never toggle `localized` on live fields or
  collapse independently versioned locales into one provider document casually.
- **Tenant safety:** derive Site and enabled locales server-side; provider locale
  filtering is not authorization. Test wrong Tenant/Site/environment/locale and
  non-enumerating errors.
- **Data integrity / concurrency:** unique Page × locale lineages, immutable
  source pins, D12 expected revisions, D1 CAS release, route collision proof, and
  no last-write-wins locale switch.
- **Security / privacy:** fallback and translation export must re-prove current
  Phase 10 eligibility and strip private/source-owned data. Restricted content
  can prohibit fallback entirely.
- **UX:** progressive disclosure, one active locale, explicit verbs, actual
  language names rather than flags alone, keyboard/screen-reader/reflow/RTL/CJK
  testing, and no silent mixed-language preview.
- **SEO / discovery:** only exact public variants enter locale search,
  navigation, sitemap, canonical, social metadata, and reciprocal `hreflang`.
  A missing locale offers explicit links to eligible alternatives at their real
  canonical URLs; it is never misrepresented as a translation.
- **Performance / operations:** index exact scope and locale; compile released
  projections instead of joining mutable provider localization at request time;
  observe stale translation counts, fallback use, invalid locale references,
  release failures, and deletion lag without logging content.
- **Dependency risk:** exact-pin conformance tests cover Payload storage,
  versions, locale queries, migration, selector refresh, publish controls, and
  fallback disabled. Provider upgrade cannot advance Asym release authority.
- **Overengineering:** no translation vendor, machine translation, translation
  memory, per-field assignments, all-locale release, tenant schema builder, or
  Phase-24 locale-management UI in D22.

## Recommendation

Choose **Option C-prime**. It is the smallest model that preserves the D1
architecture and avoids a known later storage migration while keeping the launch
quiet for one-language ministries. The adversarial review rejects one important
implementation shortcut inside the preliminary option: ordinary Page/Article rich
content must not use one broad field-localized Payload document as the locale
lineage. The permanent fix is the bounded profile over D1's sparse exact-locale
revisions, not either an English-only scalar shortcut, a provider-beta status
model, or a general translation platform.

The complete independent category-by-category review is recorded in
[Phase 23 D22 independent adversarial review](./phase-23-d22-localization-independent-adversarial-review.md).

## Exact proposed Phase 23 D22 C-prime-R formulation

The founder ratified the following exact formulation as **Phase 23 D22** on
2026-08-23. It is the binding D22 decision boundary.

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

## Ruthless synthesis

### Must be fixed by this decision

1. Keep the D1 locale lineage—not a multilingual Payload document—as the storage,
   version, autosave and release grain.
2. Freeze the finite profile classification and authority matrix, including D2
   path ownership and the D4/Phase 17/22/29/source-owner exclusions.
3. Make translation start explicit, attributable and private; offer only Blank or
   exact-source Copy, with no automatic merge or publish.
4. Permanently forbid silent field fallback and mixed-locale Page assembly across
   editor, preview, compiler, routes, search, Navigation, metadata and public
   runtime.
5. Keep publication single-locale and status derived from D1/D12/review/source-pin
   facts; do not enable Payload's beta `localizeStatus`.
6. Require sparse exact scope, composite tenant integrity, migration proof,
   fail-closed public behavior and an exact-pin adapter before a second locale can
   become usable.

### Address in implementation planning immediately after ratification

- define the profile manifest for Page, Article and every D7/D9 block version;
- implement the one exact-locale port and make raw fallback-capable provider reads
  impossible at ordinary call sites;
- design the explicit legacy-to-one-locale migration, hostile tenant matrix,
  concurrency/failure suite and privacy-safe health projection; and
- validate the quiet single-locale editor and the Blank/Copy/compare/publish flow
  with representative ministry staff before enabling a second locale.

### Phase 24 authority, not D22 work

- Site locale create/enable/disable/default lifecycle and the global translation
  coverage dashboard;
- locale-specific assignments, richer approvals, vendor exchange, machine
  translation, translation memory and glossary operations;
- fallback-chain administration, visitor preference/negotiation, public language
  selector and `x-default`; and
- broader Site, domain, currency, shell and system-message localization.

### Monitor without building speculative machinery

- future exact Payload `localizeStatus` maturity and provider upgrade behavior;
- measured locale-version storage, autosave and source-compare cost;
- real tenant demand for side-by-side editing, vendor connectors or machine
  translation; and
- language-specific D17 search analysis needs that cannot be met by the current
  public-search adapter.

## Decision status

The founder ratified the exact C-prime-R block above as **Phase 23 D22** on
2026-08-23. Ratification establishes planning authority only and authorizes no
implementation, schema, migration, provider adoption, issue publication,
release activation, deployment, or production change.

## Evidence inventory

### Repository and pinned source

- `docs/adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md`
- `docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md`
- `docs/adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md`
- `docs/adr/0154-complete-cohort-site-presentation-activation-through-d1.md`
- `docs/adr/0165-asym-owned-reference-aware-recoverable-trash.md`
- `docs/prds/sitestacker-parity/roadmap.md`
- `apps/admin/payload.config.ts`
- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/package.json`
- `vendor/payload-upstream/docs/configuration/localization.mdx`
- `vendor/payload-upstream/docs/versions/drafts.mdx`
- `vendor/payload-upstream/packages/payload/src/config/types.ts`
- `vendor/payload-upstream/packages/payload/src/versions/migrations/localizeStatus/`
- `vendor/payload-upstream/packages/ui/src/elements/PublishButton/index.tsx`
- `vendor/payload-upstream/packages/ui/src/elements/UnpublishButton/index.tsx`
- `vendor/payload-upstream/test/localization/`

### Primary external documentation

- [Payload Localization](https://payloadcms.com/docs/configuration/localization)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Sanity Localization](https://www.sanity.io/docs/studio/localization)
- [Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)
- [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/)
- [Contentful GraphQL locale handling](https://www.contentful.com/developers/docs/references/graphql/locale-handling/)
- [Contentstack localization](https://www.contentstack.com/docs/headless-cms/about-localization)
- [Storyblok internationalization](https://www.storyblok.com/docs/concepts/internationalization)
- [Storyblok language-based workflows](https://www.storyblok.com/docs/manuals/workflows)
- [Phrase review workflow and source-change handling](https://support.phrase.com/hc/en-us/articles/5784094755484-Review-Workflow-Strings)
- [Google multilingual and multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Google localized versions and `hreflang`](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [W3C language tags](https://www.w3.org/International/articles/language-tags/index.en)
- [W3C declaring page language](https://www.w3.org/WAI/WCAG21/Techniques/html/H57.html)
- [W3C internationalization quick tips](https://www.w3.org/International/quicktips/index)
- [W3C guidance against flags as language identifiers](https://www.w3.org/International/questions/qa-link-lang.en)
- [W3C Language of Parts](https://www.w3.org/WAI/WCAG21/Understanding/language-of-parts.html)
- [Unicode Locale Data Markup Language](https://www.unicode.org/reports/tr35/)
- [UNHCR accessible community communication guidance](https://www.unhcr.org/resettlement-handbook/2-managing-resettlement-activities/2-4-communication-with-communities-about-resettlement/)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Supporting D22 review

- [Independent 17-category adversarial review](./phase-23-d22-localization-independent-adversarial-review.md)

The repo-scoped Nia resource lookup returned an internal 404 in this turn, so
repository evidence was gathered through `rg` and direct reads of the current
Core and exact vendored Payload source.
