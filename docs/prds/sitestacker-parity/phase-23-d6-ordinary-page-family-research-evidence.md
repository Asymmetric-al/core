# Phase 23 D6 Ordinary Page Families — Research and Adversarial Evidence

- **Status:** Founder-ratified Phase 23 D6 B-prime-R; research and adversarial
  hardening complete.
- **Date:** 2026-08-21
- **Authority:** Supporting evidence for the founder-ratified Phase 23 D6
  decision recorded in the Phase 23 decision log and ADR-0150. This document
  does not authorize implementation or migration or change production behavior.

## Decision seam

Founder-ratified D1 established one stable Site-scoped Page identity with an
immutable semantic family, Page-local composition, bounded Reusable Sections,
and one coherent Public Site Generation. D2–D5 then closed ordinary Page
hierarchy, automatic same-Page route continuity, Navigation publication, and
the bounded Primary/Footer Navigation grammar.

D6 must now decide the smallest durable catalog of **ordinary** Page families.
It must not reopen those decisions, pre-decide D7's exact block catalog, or
absorb the specialized Missionary, Project/Campaign, and Ministry Update
families owned by Phase 22.

The founder selected:

> **Option B-prime — Two semantic ordinary families with template-led starts.**

The question for this review is whether B-prime remains the correct choice
after current CMS, repository, UX, security, multi-tenant, scale, failure, and
migration evidence is applied.

## Verdict

**Keep B-prime, but ratify only the amended-and-hardened B-prime-R at the end
of this document.** Two ordinary families are the smallest model that captures
a genuine behavioral difference without creating a universal conditional form
or a family for every layout.

No fatal concern was found. The original wording nevertheless needed six
material corrections:

1. Staff should see **Page** and **Article**; `general_page` is an internal
   contract value, not user-facing jargon.
2. Page should mean individually placed, non-stream ordinary content—not
   necessarily “timeless.” A Page may be temporary, frequently updated, or
   scheduled without becoming an Article.
3. The creation aid should be called a **Page Starter**. “Template” means
   incompatible things across modern CMSs. The Phase 23 mechanism is an exact,
   versioned, one-time seed with no live inheritance.
4. Family is immutable in ordinary editing, but an explicit proof-gated
   migration or create-and-replace correction remains possible. The contract
   must not make the false claim that conversion can never occur.
5. D6 defines two logical product families; it does not decide whether Payload
   persists them in one collection or two.
6. Article receives release-ordered editorial semantics, but D6 does not
   silently ship or own a public feed, archive, taxonomy, search, SEO,
   scheduling, or byline model.

These changes reduce ambiguity and provider coupling without widening the
family catalog or introducing a rules engine.

## Evidence discipline and current-source result

The companion
[modern CMS primary-source review](./phase-23-d6-modern-cms-primary-source-research.md)
records each external claim as **FACT** or **INFERENCE**, pins the reviewed
Payload source commit, and covers Payload, WordPress, Drupal, Contentful,
Sanity, Webflow, Neon One, and Givebutter.

The cross-product pattern is strong:

- WordPress distinguishes hierarchical, non-chronological Pages from
  chronological Posts and uses About, Contact, Privacy, and legal content as
  Page examples rather than separate types.
  [WordPress Pages](https://wordpress.org/documentation/article/create-pages/)
- Drupal's current standard installation exposes **Basic page** and
  **Article**, demonstrating that two plain semantic choices remain usable in
  a mature CMS.
  [Drupal content administration](https://www.drupal.org/docs/administering-a-drupal-site/managing-content)
- Payload's official website template separates Pages and Posts while sharing
  drafts, preview, publication, SEO, and typed layouts. This proves the
  semantic split is viable, not that Asym must copy its physical collections.
  [Payload website template](https://github.com/payloadcms/payload/blob/d4bdb1f9df709480e3f874307344a67bd3c176a6/templates/website/README.md)
- Sanity Initial Value Templates prepopulate a named schema type, and Sanity's
  current Canvas guidance describes templates as reusable starting points.
  That supports one-time, family-compatible starts.
  [Sanity Initial Value Templates](https://www.sanity.io/docs/studio/initial-value-templates),
  [Sanity templates](https://www.sanity.io/docs/canvas/templates)
- Webflow exposes both one-time static Page templates and live Collection Page
  templates. This is direct evidence that the bare word “template” is
  ambiguous and that Asym should name its one-time mechanism **Page Starter**.
  [Webflow static Page templates](https://help.webflow.com/hc/en-us/articles/33961218842387-Create-static-page-templates),
  [Webflow Collection pages](https://help.webflow.com/hc/en-us/articles/33961277976467-Structure-and-style-Collection-pages)
- Neon One's nonprofit-focused website product presents separate Pages and
  Posts, showing that the distinction is familiar in the target market.
  [Neon One Inspire](https://support.neonone.com/hc/en-us/articles/4407398356621-Managing-your-Inspire-Website)

The important Payload-specific finding is negative: current Payload 4
documentation exposes default values and document duplication, while the
broad document/block/field Templates API located in first-party material is an
RFC, not a released contract. Asym must own and qualify Page Starter semantics
instead of assuming Payload ships them.
[Payload Local API](https://payloadcms.com/docs/local-api/overview),
[Payload Templates API RFC](https://github.com/payloadcms/payload/discussions/16515)

Repo-scoped Nia discovery was attempted first as required but returned a
resource-not-found response for the Core and subscribed documentation sources.
The review therefore used narrow `rg`, complete local source reads, live
GitHub state, and direct first-party documentation. No product fact is inferred
from a search snippet alone.

## Terms that must remain separate

| Term                         | D6 meaning                                                                                                    | It must not become                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Page family**              | One of two closed, code-owned semantic contracts on the stable D1 Page identity: `general_page` or `article`. | A theme, layout, URL prefix, tenant-authored schema, arbitrary label, or mutable dropdown.                     |
| **Page Starter**             | An exact-version, family-compatible, one-time seed copied into one new independent draft.                     | Live inheritance, shared reuse, a hidden family discriminator, or a provider template ID consulted at runtime. |
| **Typed block**              | One bounded unit of Page-local composition; D7 owns the exact catalog.                                        | An untyped JSON escape hatch or a hidden family.                                                               |
| **Reusable Section**         | D1's explicit one-level shared-content mechanism with visible impact.                                         | A Page Starter or implicit nested inheritance.                                                                 |
| **Editorial label/taxonomy** | A later bounded discovery aid within a family when evidence requires it.                                      | Schema, permission, route, or publication authority.                                                           |
| **Presentation profile**     | Later code-owned rendering/layout behavior selected through the owning release contract.                      | Page family or content truth.                                                                                  |

The durable test is **behavior, not appearance**. Landing, About, Contact,
Legal/Policy, and Resource/Report are starts or editorial purposes. FAQ is a
block or section. None earns a permanent family merely because its first
layout differs.

## Hardened semantic boundary

### General Page — staff label: Page

- Durable value: `general_page`.
- Individually placed ordinary content that does not join a chronological
  editorial stream by default.
- Appropriate for About, Contact, policy, information, resource/report, and
  standalone landing content.
- May serve as the Site root or as a structural parent under D2.
- May still be temporary, scheduled, frequently revised, or date-labelled;
  those traits do not turn it into an Article.

### Article — staff label: Article

- Durable value: `article`.
- Repeatable dated tenant editorial content with explicit release-order and
  chronological-discovery semantics.
- A leaf in the ordinary Page hierarchy: it may be placed beneath an eligible
  Page, but it does not become the Site root or a parent of other Pages.
- Eligible for a later bounded article listing, feed, taxonomy, or search
  experience; eligibility is not automatic publication into any such surface.
- Audit actor, optional approved public byline, editorial display date,
  first-live release time, latest-live update time, and technical timestamps
  are separate facts. D6 does not choose the later field model.

### Phase 22 exclusion

A missionary story update, project update, prayer update, or designation-backed
campaign is not a D6 Article or Page merely because it looks similar. Phase 22
remains authoritative for Missionary, Project/Campaign, and Ministry Update
families, subject assignment, public reach, safety, giving, support progress,
responses, lifecycle, and contributor access.

The creation UI should provide a quiet helper when relevant:

> Writing an update for a missionary or project? Use Ministry Updates.

Phase 10's publication-safety ceiling still applies to ordinary Pages and
Articles that mention restricted people or locations. D6 creates no alternate
public identity lane.

## Current repository findings

- [`page-builders.ts`](../../../apps/admin/src/cms/collections/page-builders.ts)
  currently mixes `standard`, `missionary_giving`, and `project` through a
  mutable `pageType` selector while exposing the same general block catalog.
  That is rollout-era compatibility, not the durable Phase 23 model.
- The current standard-Page creation path accepts `standard`,
  `missionary_giving`, or `project` template values before creating in the
  generic `pages` collection. The gallery narrows `pageType` in the client,
  while the command reads provider draft/latest state independently. A filtered
  UI therefore does not prove family ownership or exact starter version.
- [`page-templates.ts`](../../../apps/admin/src/cms/collections/page-templates.ts)
  and
  [`create-from-template-endpoint.ts`](../../../apps/admin/src/cms/create-from-template-endpoint.ts)
  copy `defaultLayout` into a new Page. This is useful precedent for a seed,
  but the current whole-layout copy can retain provider block IDs and embedded
  relationships. A mutable template relationship or raw clone is not
  sufficient provenance, tenant proof, or fresh-instance integrity.
- [`public-page.ts`](../../../packages/lib/cms/public-page.ts) exposes
  `pageType` as an open string and `content`/`layout` as `unknown`.
- The two current public serializers do not share one exhaustive block
  contract: one can drop unknown blocks while the other emits a fallback
  shape. D1/D6/D7 require one canonical fail-closed compilation seam.
- The current public selector orders candidates by `-updatedAt`. That may be a
  rollout lookup convenience, but it cannot become Article chronology or D2
  route authority.
- Current Payload tenant access narrows Collection operations, but Payload's
  Local API skips access control and document locks by default unless callers
  explicitly set `overrideAccess: false` and `overrideLock: false` when acting
  for a user. D6 commands cannot inherit those unsafe defaults.
  [Payload Local API access](https://payloadcms.com/docs/local-api/access-control),
  [Payload document locking](https://payloadcms.com/docs/admin/locked-documents)
- The repo pins Payload `4.0.0-internal.1f9ae9a`, an internal build rather than
  a stable public release. Provider behavior must remain behind an Asym-owned
  adapter and qualification suite.

## Exact staff UX/UI contract

The authoring experience should be calm enough for occasional nonprofit staff
and efficient for frequent editors:

1. **One Content workspace.** Do not create separate mini-apps. A global
   **New** action asks **What are you creating?** only when context has not
   already established the family.
2. **Two plain choices.** Use accessible controls—not decorative cards—with:
   - **Page:** “A standalone page such as About, Contact, a landing page, or a
     policy.”
   - **Article:** “A dated story, news item, or other update that belongs in an
     article list.”
3. **Skip redundant decisions.** **New Page** and **New Article** actions from
   family-filtered views go directly to the matching start.
4. **Small compatible starter set.** After Page, show only authorized Page
   Starters for the exact Site and family, including a blank start when
   allowed. After Article, skip the gallery when only one standard start is
   available. Do not present a sprawling marketplace or carousel.
5. **Explain the effect once.** Use: “This gives you a starting layout. You can
   change this page afterward without changing the starter or other pages.”
6. **Focused editors.** Page and Article editors show only relevant controls.
   The family appears as a quiet read-only chip, not a disabled technical
   select.
7. **Recoverable work.** Show clear **Saving**, **Saved**, conflict, lock,
   unpublished-draft, and save-failed states. A failed save retains recoverable
   input; restoring a version creates a draft and never silently changes the
   live D1 generation.
8. **Accessible everywhere.** Text labels carry the meaning; keyboard and
   screen-reader users can select, preview, and create without drag or hover;
   the layout reflows to one column on narrow screens; important asynchronous
   status changes are programmatically announced. This follows WCAG 2.2's
   labels/instructions, target-size, non-drag, and status-message guidance.
   [WCAG labels and instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions),
   [WCAG 2.2](https://www.w3.org/TR/WCAG22/),
   [WCAG status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)

Conditional display can make the editor quieter, but it is never the schema,
permission, or tenant boundary.

## Ruthless adversarial review

Severity and likelihood below describe the credible risk **without** the named
permanent control. “Concern: Yes” does not mean B-prime should be rejected; it
means the concern is real enough to bind the hardened decision. After the
controls, no category has a residual reason to prefer A or C.

### 1. Brittleness — Concern: Yes

- **What could go wrong:** Family behavior could be inferred from a mutable
  starter name, layout, URL, optional fields, or client-only conditions. A
  renamed/retired starter or new renderer could then change meaning or make an
  existing record undecodable.
- **Why it matters:** Content would work only while today's conventions and
  template records remain unchanged; imports and migrations would guess.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Persist one closed family on stable Page identity; use an
  exhaustive code-owned catalog across commands, validation, compiler,
  projection, renderer, import, and migration. Apply an exact compatible Page
  Starter once and retain inert provenance. Unknown family, starter, or
  contract generation fails the candidate while the prior D1 generation stays
  live.

### 2. Technical debt — Concern: Yes

- **What could go wrong:** One universal form could accumulate `if article`,
  `if landing`, `if template`, and Phase 22 branches in UI, hooks, serializers,
  search, and tests. Alternatively, separate duplicated implementations could
  drift.
- **Why it matters:** Two clear families would become an implicit many-family
  system whose behavior exists only in scattered conditionals.
- **Severity:** High.
- **Likelihood:** High.
- **Permanent fix:** Define one small provider-neutral discriminated family
  contract with family-focused schemas/forms and exhaustive shared
  compilation. Reuse shared primitives deliberately; do not build a plugin
  registry, tenant schema DSL, or type-per-layout abstraction.

### 3. Edge cases — Concern: Yes

- **What could go wrong:** Staff may create a frequently updated Page, an
  evergreen Article, an annual report with a date, an Article without a public
  byline, a Page visually styled like an Article, or a draft whose starter is
  later retired. Copying, locale gaps, restored versions, and mistaken family
  selection add further ambiguity.
- **Why it matters:** Appearance, recency, or field presence cannot safely
  determine semantics.
- **Severity:** Medium.
- **Likelihood:** High.
- **Permanent fix:** Explain the choice by behavior; validate the closed family
  explicitly; let retired starters leave existing drafts valid because the
  seed is already local; duplicate into a new identity while preserving
  family; keep restore within the same family. Before the first release, a
  mistaken draft may be discarded and recreated with safe route-reservation
  transfer. After release, use the proof-gated conversion lane.

### 4. Footguns — Concern: Yes

- **What could go wrong:** An editable family dropdown, “change template,”
  destructive “start over,” permissive import, or privileged hook could
  silently discard content or change hierarchy, discovery, and public
  behavior. A stale browser could apply an obsolete starter.
- **Why it matters:** The controls look cosmetic while changing durable
  meaning and release consequences.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Family is read-only after identity creation; no ordinary
  action recasts it. Creation uses an idempotency key and exact starter-version
  proof. Restart produces a recoverable new draft, never an implicit overwrite.
  Conversion is a named, previewed, permissioned migration/create-and-replace
  command with D2/D3 route and reference impact proof.

### 5. Tenant safety — Concern: Yes

- **What could go wrong:** A browser-supplied tenant ID, starter, default,
  media relationship, public byline, preview, version, or related-content
  picker could reference another Tenant or Site. A privileged Payload Local
  API call could bypass normal access rules.
- **Why it matters:** Cross-tenant content, identity, draft, or branding
  disclosure is a serious isolation failure.
- **Severity:** Critical.
- **Likelihood:** Medium before server enforcement; Low after it.
- **Permanent fix:** Every operation derives and reproves the immutable
  operational Tenant UUID plus environment, Site, locale, actor membership,
  permission, family, starter version, and every referenced dependency on the
  server. User-context Payload calls set `overrideAccess: false` and
  `overrideLock: false`, or a trusted command boundary performs equivalent
  explicit checks. Never claim Supabase RLS protects Payload's privileged
  direct-Postgres connection.

### 6. Over-engineering — Concern: Yes

- **What could go wrong:** “Flexible templates” could expand into tenant-built
  schemas, nested inheritance, a universal content graph, synchronization
  rules, a workflow engine, or a family for every staff label.
- **Why it matters:** That recreates a low-code platform, increases onboarding
  and upgrade cost, and makes the simple Page/Article choice harder to operate.
- **Severity:** Medium.
- **Likelihood:** High without an explicit boundary.
- **Permanent fix:** Exactly two code-owned families; one-level D1 reuse; a
  small compatible Page Starter surface; no tenant-authored schema, nested
  template inheritance, automatic classifier, event store, or speculative
  archive/feed/search framework. Add a family later only when materially
  different behavior is proved.

### 7. UX/UI and user friction — Concern: Yes

- **What could go wrong:** “General Page” sounds technical; a long type menu or
  template gallery causes choice paralysis; repeated family prompts waste
  time; a combined form shows irrelevant controls; unclear autosave/publish
  states cause duplicate work.
- **Why it matters:** Occasional nonprofit staff will guess, abandon tasks, or
  publish the wrong shape; frequent staff lose speed.
- **Severity:** High.
- **Likelihood:** High.
- **Permanent fix:** Use **Page** and **Article**, examples and short behavioral
  descriptions, family-aware create shortcuts, one recommended starter,
  focused editors, a visible read-only family chip, accessible preview, and
  explicit save/draft/release status. Keep Articles quiet for tenants that do
  not use them; no tenant-global enable matrix is required.

### 8. Hidden coupling — Concern: Yes

- **What could go wrong:** Article could become synonymous with `/blog`, one
  theme, Navigation placement, indexing, a Payload collection, or a feed.
  Page could become synonymous with the Site root or one block layout.
- **Why it matters:** A route, theme, provider, or discovery change would then
  force a domain migration.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Family owns semantic validation only. D2/D3 own paths and
  continuity; D4/D5 own Navigation; D1 owns coherent release; D7 owns blocks;
  Phase 22 owns ministry families; later decisions own presentation, search,
  taxonomy, feed, SEO, and scheduling. D6 does not choose one versus two
  Payload collections.

### 9. Failure modes — Concern: Yes

- **What could go wrong:** Page Starter application could partially create a
  Page; autosave could fail; two editors could overwrite each other; restore
  could unintentionally go live; compile or cache refresh could fail after
  authoring succeeds.
- **Why it matters:** Staff may believe work is saved or public when it is not,
  and public visitors could see incomplete content.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Create the draft and copied starter content atomically and
  idempotently; use lock/CAS conflict protection; retain local recoverable work
  on save failure; make restore create a new draft; compile a complete
  candidate before D1 activation. Candidate failure leaves the prior live
  generation intact and exposes a clear cause-owned recovery action.

### 10. Data integrity risks — Concern: Yes

- **What could go wrong:** Open strings, duplicate serializer logic, partial
  starter copies, stale media references, or conflated timestamps and authors
  could create records that render differently across surfaces or sort and
  attribute Articles incorrectly.
- **Why it matters:** Public chronology, provenance, attribution, migration,
  and reporting would be untrustworthy.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Use one closed family union and canonical compiler;
  regenerate instance IDs when seeding; validate all references; retain
  immutable starter ID plus exact version/digest as non-authoritative
  provenance. Keep audit actor, approved public byline, editorial display date,
  first-live release, latest-live update, and technical timestamps separate.
  Never derive public chronology from `createdAt`/`updatedAt`.

### 11. Security and privacy risks — Concern: Yes

- **What could go wrong:** Draft previews, versions, starter content, media, or
  inferred bylines could leak private material or a staff/restricted-worker
  identity. Logs might capture full page bodies. Client-only conditions could
  expose fields the server never approved.
- **Why it matters:** Public identity disclosure can create real safety harm,
  especially for Phase 10-protected people.
- **Severity:** Critical for a restricted-identity or cross-tenant leak;
  otherwise High.
- **Likelihood:** Medium before controls; Low after them.
- **Permanent fix:** Draft and preview access is authorized and scope-bound;
  public projection is an allowlisted, released, Phase-10-cleared artifact.
  Default public byline to none or an approved organization identity—never the
  logged-in editor. Log only privacy-safe IDs, generations, digests, and cause
  codes, never page body or private draft content.

### 12. Scalability and performance risks — Concern: Yes

- **What could go wrong:** Articles can outnumber Pages by orders of magnitude;
  unbounded versions, full scans, N+1 relationships, mutable inheritance, and
  offset-heavy lists may work in demos and degrade at tenant scale.
- **Why it matters:** Slow editorial lists, builds, and releases reduce staff
  trust and increase database and cache cost.
- **Severity:** Medium.
- **Likelihood:** Medium.
- **Permanent fix:** Index the eventual access path on exact scope, family,
  status/release fact, and stable ordering; use cursor pagination and bounded
  selects; cap/consolidate autosave versions; batch relationship proof; compile
  flat D1 public projections; never fan a starter edit across existing Pages.
  Prove representative Article-volume query plans and release times.

### 13. Operational burden — Concern: Yes

- **What could go wrong:** Each tenant could demand custom families and dozens
  of bespoke starters; staff could repeatedly certify defaults; support could
  need developer intervention for every stale template.
- **Why it matters:** Routine onboarding and content work become a services
  project rather than a product.
- **Severity:** Medium.
- **Likelihood:** High without catalog limits.
- **Permanent fix:** Provide a small approved starter catalog with prospective
  Site defaults and self-explanatory previews. Existing Pages never change
  when availability/defaults change. Surface only cause-owned exceptions;
  normal creation and editing remain quiet.

### 14. Observability gaps — Concern: Yes

- **What could go wrong:** Support may not know which family/contract/starter
  generation produced a failure, why a candidate was blocked, whether a save
  was rejected, or how many legacy records remain unclassified.
- **Why it matters:** Failures become slow to diagnose and unsafe to retry.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Emit stable privacy-safe cause codes for unknown family,
  stale/incompatible starter, scope denial, lock/CAS conflict, incompatible
  block, compile failure, and migration ambiguity. Include exact Tenant/Site,
  family, schema/release generation, and starter digest in diagnostic metadata;
  provide staff-readable recovery and migration/release counts by disposition.

### 15. Dependency and integration risks — Concern: Yes

- **What could go wrong:** Core behavior could depend on an unshipped Payload
  Templates API, unstable custom Admin UI, provider IDs, Local API bypass
  defaults, or provider-specific serialized shapes.
- **Why it matters:** A Payload upgrade or adapter change could break creation,
  access, migration, and public rendering.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Keep family and Page Starter contracts Asym-owned,
  provider-neutral, versioned, and exportable. Qualify exact Payload primitives
  behind adapters and public-seam contract tests. Pin the family schema and
  compatible renderer into D1 release proof; never make raw Payload runtime
  data public authority.

### 16. Migration and upgrade risks — Concern: Yes

- **What could go wrong:** Existing `standard`, `missionary_giving`, `project`,
  `ministry_update`, open `pageType`, mutable template relationship, legacy
  layout, and divergent serializer facts could be guessed into the wrong
  family or left under dual authority.
- **Why it matters:** Silent fallback could misclassify or publicly expose
  Phase 22 content and make future schema/provider changes harder.
- **Severity:** Critical for cross-owner misclassification; otherwise High.
- **Likelihood:** High without an explicit census.
- **Permanent fix:** Build a complete, dry-runnable, idempotent, resumable
  migration manifest with exactly one disposition per legacy record.
  `standard` may map to Page only after proof; Phase 22 values stay Phase 22;
  unknowns quarantine for staff review. Never infer from title, slug, starter,
  URL, or blocks. Shadow-compile representative and complete-cohort counts,
  cut over one authority, and retain append-only evidence—no dual write.

### 17. Other development hazards — Concern: Yes

- **What could go wrong:** Double-clicks could create duplicate Pages; a stale
  tab could use an obsolete starter; background imports could bypass locks;
  concurrent release and conversion could race; tests could cover only happy
  browser paths.
- **Why it matters:** These ordinary races produce duplicates, lost edits,
  invalid releases, and hard-to-reproduce incidents.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent fix:** Idempotent creation keys, exact starter-version and
  expected-revision CAS, enforced locks/optimistic concurrency, transactional
  command boundaries, safe retry semantics, and rollback by preserving the
  prior D1 serving head. Test concurrency, duplication, restore, migration,
  stale clients, negative scope, serializer parity, accessibility, mobile, and
  production-shaped volume—not just the happy path.

## Ruthless synthesis: the best path forward

### Reject the two tempting alternatives

- **Do not collapse to A.** One universal Page makes Article behavior a web of
  optional fields, template conventions, and inferred discovery rules. That
  is simpler only on the first schema diagram; it is more expensive in every
  editor, validator, query, serializer, and migration afterward.
- **Do not expand to C.** Landing, About, Contact, Policy, Report, FAQ, and
  Announcement do not yet prove distinct lifecycle or discovery contracts.
  Making them families would multiply forms, permissions, renderers, tests,
  migrations, and user choices without durable product value.

### Build in this order after a later implementation authorization

1. **Lock the product boundary.** Define the closed `general_page | article`
   union, the Page/Article behavioral distinction, Phase 22 exclusions, and
   owning-decision map before changing Payload schema.
2. **Specify one Asym-owned creation contract.** Prove actor and exact scope;
   validate a family-compatible exact Page Starter revision; copy it atomically
   into one idempotently created draft; record inert provenance.
3. **Deliver the quiet vertical UX.** One Content workspace, contextual Page
   or Article creation, a small accessible starter surface, focused editors,
   explicit save/draft/release states, and recoverable conflict handling.
4. **Close server enforcement.** Enforce tenant/site/locale/source ownership,
   permissions, locks/CAS, family immutability, preview/version access, and
   Phase 10 public projection. Do not trust UI hiding.
5. **Unify compilation.** One exhaustive family-aware compiler and public
   serializer emits only D1 release-bound projections; unknown or incompatible
   input blocks the candidate and leaves the prior generation live.
6. **Migrate by evidence.** Census every current value and relationship,
   assign one non-overlapping disposition, shadow-compile, then perform one
   authority cutover without dual write or heuristic classification.
7. **Prove operation at scale.** Negative tenant tests, family-mutation tests,
   starter races, duplicate-submit tests, serializer parity, accessibility,
   restore/release behavior, Article-volume query plans, telemetry, and
   runbooks must pass before shipping.

This sequence builds one narrow end-to-end behavior at a time and prevents UX,
database, or Payload convenience from silently becoming product authority.

## Required proof gates

Before D6 can be considered implemented, all of the following must be
observable:

1. Only `general_page` and `article` pass the ordinary-family boundary;
   unknown values fail closed across commands, compiler, renderer, import, and
   migration.
2. Family cannot change through ordinary UI, API, Local API, import, hook, or
   duplicate flow. An explicit conversion is separately permissioned and
   impact-proved.
3. Page Starter creation proves exact actor, Tenant, environment, Site, locale,
   family, starter version/digest, media/reference scope, schema generation,
   idempotency key, and expected state.
4. Starter retirement or edit never mutates an existing draft or released
   Page; provenance remains visible only for audit/support.
5. Phase 22 Missionary, Project/Campaign, and Ministry Update records cannot
   enter the Phase 23 ordinary-family lane.
6. Public byline is never inferred from the editor; technical timestamps are
   never treated as Article chronology.
7. User-context Payload Local API operations respect access and locks, and
   trusted service operations reproduce the equivalent explicit proofs.
8. Cross-Tenant, cross-Site, cross-locale, stale starter, stale lock, stale
   generation, and incompatible-block tests fail with stable causes and no
   public side effect.
9. Candidate compile or activation failure preserves the prior D1 live
   generation and the recoverable draft.
10. Migration totals reconcile exactly; every legacy fact has one disposition;
    no heuristic fallback or lasting dual authority remains.
11. Creation, editing, preview, save failure, conflict, restore, and family
    context pass keyboard, screen-reader, mobile-reflow, touch-target, and
    status-announcement tests.
12. Production-shaped Article lists use indexed, cursor-paginated access and
    bounded version retention without full collection scans or N+1 proof.

## Exact founder-ratified formulation

<!-- prettier-ignore -->
> **B-prime-amended-and-hardened (B-prime-R) — Two code-owned semantic
> ordinary Page families with bounded, auditable Page Starters:**
> Phase 23 owns exactly **General Page** (`general_page`, presented to staff as
> **Page**) and **Article** (`article`, presented as **Article**) under D1's one
> stable Site-scoped Page and coherent Public Site Generation contract. Family
> is selected by durable behavior rather than appearance, is immutable in
> ordinary editing, and never absorbs Phase 22-owned Missionary,
> Project/Campaign, or Ministry Update content; Phase 10 remains the
> publication-safety ceiling for every ordinary Page and Article. Page owns individually
> placed, non-stream ordinary content and may be a Site root or hierarchy parent;
> Article owns repeatable dated editorial content, is a hierarchy leaf, and is
> eligible—but not automatically entitled—for later chronological discovery,
> while its exact fields, taxonomy, listing, feed, scheduling, SEO, search, and
> public metadata remain with later bounded decisions. One quiet Content
> workspace asks **Page or Article?** only when context has not already
> established the family, uses short behavioral examples, follows with only a
> small accessible set of exact family-compatible Site-authorized **Page
> Starters**, skips redundant choices, keeps family visibly read-only, and
> exposes focused family-specific editors with clear saving, draft, conflict,
> preview, and release states. A Page Starter is an Asym-owned, provider-neutral,
> exact-version one-time seed applied atomically and idempotently to one
> independent draft after actor, Tenant, environment, Site, locale, family,
> permission, schema, D2 placement/path reservation, starter, and
> referenced-dependency reproof; its typed content receives fresh Page-local instance IDs;
> immutable starter ID plus exact version/digest remains inert provenance, and
> later starter edits or retirement never mutate existing Pages. D1 release proof
> pins the closed family contract and compatible compiler/renderer; unknown,
> stale, cross-family, cross-scope, or incompatible input fails the candidate
> with a cause-owned exception while the prior public generation and
> recoverable draft remain intact. Audit actor, approved public byline,
> editorial display date, first-live release time, later-live update time, and
> technical timestamps remain distinct; no editor identity is made public and
> no chronology is derived from `createdAt` or `updatedAt`. Every authoring,
> preview, version, restore, copy, import, export, conversion, migration, and
> public-projection operation is server-enforced for exact scope and current
> authority; Payload Local API bypass defaults are never treated as security,
> Supabase RLS is never claimed to protect Payload's privileged direct-Postgres
> connection, and D6 does not decide one versus two provider collections. A
> mistaken unreleased draft may be discarded and safely recreated; a released
> family correction requires an explicit permissioned, impact-proved migration
> or create-and-replace operation. Legacy Pages, templates, drafts/versions,
> serializers, references, and Phase 22-shaped rows receive one complete,
> non-overlapping adopt/transform/quarantine/retire disposition, shadow proof,
> and one authority cutover. Unknowns quarantine; no title, slug, date, layout,
> or starter is used to infer family. The design includes no open family strings,
> tenant-authored schemas, a family per layout, mutable starter inheritance,
> client-only validation, silent fallback or block dropping, destructive
> restart, ordinary-edit family conversion, editor-derived public authorship,
> dual Phase 22 authority, dual public heads, heuristic migration, or
> speculative feed/search/workflow infrastructure.

## Explicit non-decisions

D6 does not choose:

- the exact D7 block catalog;
- the exact Page Starter catalog, tenant starter-authoring rights, or starter
  visual designs;
- the exact Article fields, byline source, taxonomy, listing, feed, search,
  SEO, scheduling, or notification behavior;
- forms, dynamic lists, media handling, or page-level analytics;
- one versus two Payload collections or the final Postgres table topology;
- the detailed conversion or migration implementation; or
- implementation, ticket publication, deployment, or production cutover.

The formulation above was explicitly founder-ratified as Phase 23 D6 on
2026-08-21. Ratification authorizes no implementation, migration, provider
adoption, issue publication, deployment, or production change.
