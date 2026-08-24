# Phase 23 D6 — Modern CMS Primary-Source Research

- **Status:** Supporting evidence for founder-ratified Phase 23 D6 B-prime-R;
  this file does not independently expand D6, authorize implementation, or
  choose a physical Payload/Postgres schema.
- **Research date:** 2026-08-21
- **Question:** Does a bounded **General Page + Article** semantic catalog with
  template-led starts reflect current CMS practice, and what must be amended
  so it remains clear, durable, and provider-independent?

## Evidence discipline

- **FACT** means the linked first-party documentation or source states or
  demonstrates the behavior.
- **INFERENCE** means a Phase 23 design conclusion drawn from one or more
  facts. An inference is not attributed to a vendor.
- Product examples are evidence about useful boundaries and failure costs;
  they are not architecture-by-imitation.
- The installed Core dependency is Payload
  `4.0.0-internal.1f9ae9a`, as pinned in
  [`apps/admin/package.json`](../../../apps/admin/package.json). The Payload
  source review below also pins upstream `main` at commit
  [`d4bdb1f9df709480e3f874307344a67bd3c176a6`](https://github.com/payloadcms/payload/tree/d4bdb1f9df709480e3f874307344a67bd3c176a6)
  so later upstream changes cannot silently rewrite this evidence.

## Executive finding

**B-prime is directionally sound and should remain two logical ordinary
families.** WordPress, Drupal, Payload's official website template, Sanity
examples, Webflow, and the nonprofit-focused Neon One website product all
preserve a practical distinction between individually placed/static Pages and
repeatable dated Posts or Articles. Current sources do not support a family
per layout, purpose label, or starter.

It should, however, be hardened in five ways:

1. **Use “Page” in the staff UI and `general_page` only as the durable internal
   value.** “General Page” is useful contract language but unnecessary user
   jargon.
2. **Define the semantic difference by behavior, not the word “timeless.”** A
   Page is an individually placed ordinary item that does not participate in a
   chronological editorial stream by default. An Article is repeatable dated
   editorial content with explicit chronological and discovery semantics. A
   Page may still be temporary, scheduled, or frequently updated.
3. **Call the authoring aid a “Page Starter,” not merely a “template.”** Modern
   CMSs use _template_ for at least three different mechanisms: one-time
   initial values, a live shared rendering template, and a deployable content
   model. The Phase 23 mechanism must be an auditable one-time seed, never
   hidden ongoing authority.
4. **Keep family immutable in ordinary editing, but do not claim conversion is
   impossible.** A deliberate conversion is an explicit migration or
   create-and-replace operation with route, reference, content, and release
   impact proof. No ordinary family dropdown is exposed after creation.
5. **Do not let D6 dictate Payload collection topology.** The product contract
   has two logical families. Whether they use one collection with a closed
   discriminator or two provider collections is an implementation decision
   that must preserve D1 identity, route, release, access, and migration
   invariants.

## Primary-source findings

### 1. Payload CMS 4

#### Semantic schemas and the official website template

- **FACT:** Payload defines a Collection as documents sharing one schema; each
  Collection can have distinct access control, hooks, and Admin options.
  Payload names Pages and Posts as ordinary examples.
  [Payload Collections](https://payloadcms.com/docs/configuration/collections)
- **FACT:** Payload's current official website template implements **Pages**
  and **Posts** as separate collections while giving both drafts, preview,
  publication, slugs, and SEO. The Page schema uses a hero and a typed layout
  builder. The Post schema adds editorially meaningful fields and behavior:
  article content, hero image, related posts, categories, authors, and a
  publication date.
  [official template overview](https://github.com/payloadcms/payload/blob/d4bdb1f9df709480e3f874307344a67bd3c176a6/templates/website/README.md),
  [Pages source](https://github.com/payloadcms/payload/blob/d4bdb1f9df709480e3f874307344a67bd3c176a6/templates/website/src/collections/Pages/index.ts),
  [Posts source](https://github.com/payloadcms/payload/blob/d4bdb1f9df709480e3f874307344a67bd3c176a6/templates/website/src/collections/Posts/index.ts)
- **FACT:** Payload Blocks are code-configured typed schemas. Each saved block
  carries a `blockType`, and Payload refuses a cross-field paste when that
  block type is not configured for the target field.
  [Payload Blocks field](https://payloadcms.com/docs/fields/blocks)
- **INFERENCE:** A Page/Article distinction is not merely inherited publishing
  jargon. It creates a clean place for genuinely different validation,
  authoring, discovery, and projection behavior while allowing both families
  to share bounded blocks, SEO, previews, and release infrastructure.
- **INFERENCE:** Payload's official use of two collections proves that separate
  schemas are viable, not that Phase 23 must use two collections. D1's stable
  Page identity and one Public Site Generation contract must decide topology,
  not an upstream example.

#### Starts, templates, and provider risk

- **FACT:** Current Payload documentation exposes field `defaultValue` for
  prefilling missing values and `duplicateFromID` when creating a document.
  [Payload field defaults](https://payloadcms.com/docs/fields/overview#default-values),
  [Payload Local API create](https://payloadcms.com/docs/local-api/overview#create)
- **FACT:** The first-party item found for a general document/block/field
  Templates API is an upstream **RFC** proposing that such an API be added;
  its wording describes a proposed capability, not a documented released
  contract.
  [Payload Templates API RFC #16515](https://github.com/payloadcms/payload/discussions/16515)
- **INFERENCE:** Phase 23 must not depend on an assumed shipped Payload 4
  template subsystem. A Page Starter should be an Asym-owned product contract
  implemented using qualified provider primitives. The starter application
  must validate and copy family-compatible content into the new revision; raw
  `duplicateFromID` alone is not the product-level proof.
- **INFERENCE:** A provider feature can later implement the contract if it is
  qualified, but its IDs, mutable records, access defaults, or runtime
  resolution cannot become public authority.

#### Change and recovery cost

- **FACT:** Payload requires explicit migrations when relational schema shape
  changes and recommends testing database-shape changes through its migration
  workflow.
  [Payload migrations](https://payloadcms.com/docs/database/migrations)
- **FACT:** Payload Versions preserve history, diffs, restoration, drafts, and
  publication state for documents in a version-enabled collection.
  [Payload Versions](https://payloadcms.com/docs/versions/overview),
  [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- **INFERENCE:** Family changes have migration and projection consequences;
  treating family as a casual mutable select would conceal those consequences.
  Ordinary immutability plus an explicit conversion lane is proportionate—not
  an assertion that the underlying database can never transform a record.

### 2. WordPress

- **FACT:** WordPress describes Posts as reverse-chronological blog entries and
  Pages as non-chronological content. Pages can be hierarchical and can use
  Page templates. Its Page examples include About, Contact, Privacy Policy,
  Copyright, Disclosure, Legal Information, and Accessibility Statement rather
  than defining each as a separate content type.
  [WordPress Pages](https://wordpress.org/documentation/article/create-pages/)
- **FACT:** WordPress documents Posts and Pages as distinct post types. Posts
  normally participate in reverse time order and feeds; Pages can be
  hierarchical and traditionally do not use categories and tags.
  [WordPress post types](https://wordpress.org/documentation/article/what-is-post-type/)
- **INFERENCE:** About, Contact, Legal, Landing, and similar names are good
  starter or editorial-purpose labels, not immutable families. Chronological
  stream behavior is a stronger semantic boundary.

### 3. Drupal

- **FACT:** Drupal's current standard installation offers two default content
  choices: **Basic page** and **Article**.
  [Drupal content administration](https://www.drupal.org/docs/administering-a-drupal-site/managing-content)
- **FACT:** Drupal's glossary defines Article as time-sensitive material such
  as news, press releases, or blog posts, and Basic page as typically static
  content that may be linked into navigation.
  [Drupal glossary](https://www.drupal.org/docs/glossary)
- **FACT:** Drupal explains that a content type supplies the same field set to
  all content items of that type; separate types are justified when their
  field structures and uses differ.
  [Drupal content entities and fields](https://www.drupal.org/docs/user_guide/en/planning-data-types.html)
- **INFERENCE:** Two clear create choices are familiar to CMS staff and can
  lead to focused forms. The existence of tenant-extensible Drupal content
  types is not evidence that Asym tenants need schema-authoring power; that
  would multiply migrations, rendering contracts, and support burden beyond
  the selected scope.

### 4. Contentful

- **FACT:** Contentful says a content model is the total of the content types
  in a space and that content types define content structure and consistency.
  Each type owns explicit fields.
  [Contentful content models](https://www.contentful.com/help/content-models/),
  [Contentful data model](https://www.contentful.com/developers/docs/concepts/data-model/)
- **FACT:** An editor creates an entry of a specific content type, and the
  fields shown in the entry editor come from that type.
  [Contentful web app and entry editor](https://www.contentful.com/help/getting-started/contentful-web-app-overview/)
- **FACT:** Contentful recommends making and testing content-model changes in
  a development environment, promoting them through a release environment,
  persisting migration files, and retaining a rollback route.
  [Contentful content-type deployment](https://www.contentful.com/developers/docs/tutorials/general/create-and-deploy-content-type-changes/)
- **FACT:** Contentful's **content model templates** are versioned bundles of
  schema/content types deployed across spaces and environments. They are not
  ordinary document starters.
  [Contentful content model templates](https://www.contentful.com/help/reuse-content-structures/content-model-templates/)
- **INFERENCE:** Every extra family has durable schema, editor, migration, and
  release cost. Contentful also demonstrates why the bare word “template” is
  unsafe in a cross-provider product contract: it may mean schema deployment,
  not starting content.

### 5. Sanity

- **FACT:** Sanity's current page-building guide recommends modeling content
  for meaning rather than presentation. It warns that colors, floats, and
  other presentation concerns add implementation complexity and more things
  for editors to track. Its example models one Page document with a bounded
  array of predefined modules.
  [Sanity structured page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building)
- **FACT:** Sanity Initial Value Templates apply to a named schema type and
  prepopulate a new document with specified values. Templates have a title and
  optional description for the creation UI.
  [Sanity Initial Value Templates](https://www.sanity.io/docs/studio/initial-value-templates),
  [Initial Value Templates API](https://www.sanity.io/docs/studio/initial-value-templates-api)
- **FACT:** Sanity's current template guidance describes a template as a
  reusable starting point whose content and structure carry into a newly
  created document; the resulting document remains independently editable.
  [Sanity Canvas templates](https://www.sanity.io/docs/canvas/templates)
- **INFERENCE:** A bounded starter gallery can reduce staff effort without
  turning visual variants into families. The schema family must be selected
  before or with the starter, and the starter must not be consulted to infer
  family later.
- **INFERENCE:** Sanity also shows that mutable type-changing tools can exist
  in an upstream authoring product. It therefore does **not** prove universal
  family immutability. Phase 23's immutability is an Asym integrity rule tied
  to routes, references, releases, and migrations, and should be described
  honestly as such.

### 6. Webflow

- **FACT:** A Webflow CMS Collection represents one content type with one
  schema. Collection items are recurring entries such as blog posts, recipes,
  or help articles.
  [Webflow CMS Collections](https://help.webflow.com/hc/en-us/articles/33961244391059-Manage-CMS-Collections)
- **FACT:** A Webflow Collection page is a **live shared presentation
  template**: changing it changes the layout for every item in the Collection.
  [Webflow Collection pages](https://help.webflow.com/hc/en-us/articles/33961277976467-Structure-and-style-Collection-pages)
- **FACT:** A Webflow static Page template is a creation aid. A newly created
  Page inherits its design and settings, after which staff can override the
  new Page's settings and edit its allowed content.
  [Webflow static Page templates](https://help.webflow.com/hc/en-us/articles/33961218842387-Create-static-page-templates),
  [Webflow Page building](https://help.webflow.com/hc/en-us/articles/33961210206483-Page-building)
- **INFERENCE:** “Template” has two materially different meanings even inside
  one CMS. Phase 23 should use **Page Starter** for one-time seeded content.
  D1 Reusable Sections and released presentation profiles own deliberate
  continuing shared effects; a Page Starter must not become a second reuse
  mechanism.

### 7. Nonprofit-focused products

#### Neon One Inspire websites

- **FACT:** Neon One's nonprofit-focused Inspire website product is based on
  WordPress and presents separate admin areas for **Pages** and **Posts**.
  Pages are described as typically static, with About and Contact as examples;
  Posts are regularly updated blog content gathered on a Blog Page and may use
  categories. Overall appearance and a Page Builder are separate concerns.
  [Neon One — Managing your Inspire Website](https://support.neonone.com/hc/en-us/articles/4407398356621-Managing-your-Inspire-Website)
- **INFERENCE:** Nonprofit staff already encounter the Page-versus-repeatable
  editorial-content distinction. The simplest Asym copy is **Page** and
  **Article**, with examples under each—not a taxonomy lecture or a long type
  dropdown.

#### Givebutter campaigns

- **FACT:** Givebutter, an all-in-one nonprofit fundraising and CRM product,
  distinguishes Page and Event campaigns by operational capability. Events
  add ticketing, livestreaming, check-in, and promo-code behavior even though
  the public layouts are related.
  [Givebutter product overview](https://help.givebutter.com/en/articles/1726586-what-is-givebutter-and-how-does-it-work),
  [Givebutter Page campaigns](https://help.givebutter.com/en/articles/3688273-how-to-configure-a-page-campaign)
- **INFERENCE:** A separate semantic family is justified by different
  behavior, not appearance. It also reinforces the boundary: designation-
  backed Project/Campaign and Missionary pages remain Phase 22 content, not
  Phase 23 General Pages or Articles.

## Cross-source synthesis

### The Page/Article boundary is durable—but should be stated precisely

The sources repeatedly distinguish:

| Family           | Durable semantic behavior                                                                                                                       | Not sufficient by itself                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **General Page** | Individually placed ordinary content; participates in Page hierarchy and Navigation through D2–D5; no chronological editorial stream by default | Looking like a landing page, being temporary, having a hero, containing an FAQ, or using a particular starter |
| **Article**      | Repeatable editorial item with an explicit editorial date and chronological/discovery semantics                                                 | Merely containing long text, being updated recently, or using an “article-looking” layout                     |

**INFERENCE:** Replace “timeless Page” in binding wording with “individually
placed, non-stream ordinary Page.” “Timeless” is an understandable shorthand,
but it breaks on annual appeals, campaign landing pages, announcements, and
scheduled institutional Pages.

### “Template” must be disambiguated

Current products use the word for at least three contracts:

| Mechanism                               | Current example                                               | Ongoing authority?                             |
| --------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| One-time initial values / creation seed | Sanity Initial Value Templates; Webflow static Page templates | No hidden live content authority should remain |
| Shared presentation for every item      | Webflow Collection Page template                              | Yes, by design                                 |
| Deployable schema bundle                | Contentful content model templates                            | Yes, over model deployment                     |

**INFERENCE:** The D6 authoring mechanism should be named **Page Starter** in
product copy and contracts. Applying a starter should atomically:

1. prove actor, Tenant, Site, family, locale, referenced media/content, and
   starter-version compatibility;
2. copy the allowed initial values and regenerate all instance identifiers;
3. record starter ID and exact version as provenance for support and migration;
4. produce an ordinary independent draft; and
5. create no live subscription to future starter changes.

If staff need later shared change, they use D1's explicit Reusable Section or a
future presentation-profile decision with visible impact—not a starter.

### Family immutability is a product integrity rule, not vendor folklore

- **FACT:** CMS families/content types define schemas, forms, APIs, access,
  hooks, discovery, and migrations in the reviewed systems.
- **FACT:** Vendors differ on whether an authoring tool can change a type or
  campaign category.
- **INFERENCE:** D1's immutable family remains the correct ordinary-edit rule
  because Asym's family affects hierarchy, routes, references, release
  projections, and migration. The honest permanent rule is:

> Family is selected at creation and is read-only afterward. A real correction
> uses a separately authorized conversion that proves every affected fact and
> either migrates atomically or creates a replacement; it is not an ordinary
> editor toggle.

This avoids both extremes: a dangerous dropdown and a false claim that data
can never be converted.

### Logical families do not settle physical storage

- **FACT:** Payload supports separate collections with distinct schemas and
  the official template uses that structure for Pages and Posts.
- **FACT:** WordPress stores multiple post types in one broader persistence
  model while preserving semantic post-type behavior.
- **INFERENCE:** Both physical patterns are modern and legitimate. D6 should
  specify two closed logical families and their invariants, leaving the exact
  Payload/Postgres layout to the implementation architecture and migration
  proof. Choosing topology in a UX decision would create unnecessary coupling.

## Editor experience implied by the evidence

The smallest clear creation flow is:

1. **Create** opens one choice titled **What are you creating?**
2. Two accessible options appear with text, not icon-only meaning:
   - **Page** — “A standalone page such as About, Contact, a landing page, or a
     policy.”
   - **Article** — “A dated story, news item, or other update that belongs in
     an article list.”
3. After **Page**, show only compatible tenant-approved Page Starters; include
   **Blank page**. After **Article**, show only compatible Article Starters or
   proceed directly when there is only one sensible start.
4. Clearly say, “This gives you a starting layout. You can change the new page
   without changing the starter or other pages.”
5. Create the independent draft, then open the focused family-specific editor.
6. On an existing record, show the family as quiet read-only context. Do not
   display a disabled technical dropdown or surface internal values.

**INFERENCE:** Do not ask staff to choose “General Page,” “Landing,” “Article,”
“News,” “Resource,” “FAQ,” “Announcement,” “Legal,” and “Dynamic List” in one
menu. Most of those are starter, block, listing, or editorial-classification
decisions and would turn normal creation into schema selection.

## Adversarial implications for the D6 review

| Risk                                        | What current evidence exposes                                                      | Permanent prevention                                                                                      |
| ------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Family inferred from starter name or blocks | Templates and presentation change; semantic schema remains the stable contract     | Persist a closed family value selected before the starter and validate every block against it             |
| Starter changes mutate existing Pages       | “Template” sometimes means live shared presentation                                | Use explicit one-time Page Starter semantics; retain provenance but no runtime binding                    |
| Assuming Payload ships the product contract | Current docs expose primitives; the broad Templates API located is still an RFC    | Put the contract behind an Asym boundary and qualify any provider implementation                          |
| Type sprawl                                 | Every content type creates fields, forms, APIs, migrations, and editor choices     | Keep exactly Page and Article until materially different behavior is proved                               |
| One giant optional-field schema             | Pages and Articles need different editorial and discovery behavior                 | Keep family-focused validation and authoring surfaces even if persistence is shared                       |
| Misclassifying Phase 22 content             | Missionary updates and campaigns may look article- or landing-like                 | Enforce typed source ownership; Phase 22 families are unavailable in the D6 creation lane                 |
| Misleading immutability                     | Vendors and databases can perform explicit transformations                         | Prohibit ordinary mutation while defining a proof-gated conversion/migration path                         |
| Cross-Tenant starter leakage                | Provider duplication/default APIs do not themselves express Asym Tenant/Site rules | Reprove actor, Tenant, Site, locale, family, and every referenced dependency during starter application   |
| Stale or incompatible starter               | Schemas and block catalogs evolve                                                  | Version starters; reject or migrate incompatible versions before copying; never “best effort” drop blocks |
| Unknown imported family                     | Open strings and legacy values can bypass focused validation                       | Closed code-owned values; complete migration disposition; unknowns quarantine and fail closed             |

## Recommended B-prime amendments

The selected option should be hardened with all of the following, without
expanding its family catalog:

1. **Exactly two Phase-23-owned logical ordinary families:**
   `general_page` and `article`. UI labels are **Page** and **Article**.
2. **General Page:** individually placed ordinary Page content that does not
   join a chronological editorial stream by default. Landing, About, Contact,
   Legal/Policy, Resource/Report, FAQ-bearing, and other layouts remain
   starters, blocks, or later bounded classifications.
3. **Article:** repeatable dated editorial content with explicit chronological
   and discovery semantics. The exact field list, authorship source, taxonomy,
   feeds, scheduling, and listing UX remain later bounded decisions.
4. **Page Starter:** a versioned, family-compatible, Tenant/Site-bounded
   one-time seed. It creates an independent draft and retains inert provenance;
   later starter edits never mutate that draft or its published successors.
5. **Closed ownership:** Missionary, Project/Campaign, and Ministry Update
   families remain Phase 22 source-owned and cannot enter or be inferred by the
   Phase 23 ordinary-family lane.
6. **Ordinary immutability with exact correction:** family is selected at
   creation and read-only afterward. Conversion is an explicit proof-gated
   migration or create-and-replace operation, never a field edit.
7. **Provider neutrality:** D6 does not decide one versus two Payload
   collections, and it does not require an unshipped Payload Templates API.
8. **Fail closed:** unknown family, starter version, block, source owner,
   Tenant/Site scope, or migration disposition cannot save, compile, activate,
   import, or silently fall back to General Page.

## Evidence that was not found—and must not be invented

- No reviewed current source supports creating a durable family for every
  visual layout or staff label.
- No reviewed current source establishes tenant-authored schemas as necessary
  for this product.
- No reviewed source makes a one-time starter and continuing shared reuse the
  same concept.
- Current Payload docs/source reviewed here do not establish a shipped
  first-class document-template subsystem that Phase 23 can safely assume.
- The reviewed products do not establish family immutability as a universal
  CMS law; that safeguard comes from D1 and Asym's own route/reference/release
  invariants.
- The evidence does not decide the exact Article fields, Page Starter catalog,
  physical table/collection layout, taxonomy, feeds, search, SEO, scheduling,
  forms, block catalog, or migration implementation.

## Bottom line

Keep B-prime's two-family catalog. Harden the language around semantics,
starter behavior, correction, ownership, and provider neutrality. That gives
staff the familiar **Page or Article** choice, gives each editor only relevant
fields, preserves room for useful tenant-approved starts, and avoids both the
conditional-field swamp of one universal type and the permanent maintenance
cost of a family per use case.
