# Phase 23 D7 Ordinary Page Block Catalog — Decision Brief and Research Evidence

- **Status:** Founder-ratified Phase 23 D7 B-prime-R on 2026-08-21 after full
  adversarial review.
- **Date:** 2026-08-21
- **Authority:** Research and decision support only. This document does not
  authorize implementation, migration, issue publication, deployment, or a
  production change.

## Decision seam

D1 established Page-local typed composition, explicit one-level Reusable
Sections, and one coherent Public Site Generation. D6 established exactly two
ordinary semantic families—Page and Article—and one-time Page Starters. D7
must now choose the smallest durable ordinary block catalog and the amount of
composition freedom staff receive inside those families.

D7 must not:

- reopen D1's local-versus-reusable content decision;
- turn Page Starters into live inheritance;
- absorb Phase 22 Missionary, Project/Campaign, or Ministry Update semantics;
- invent a tenant schema builder or plugin platform;
- pre-decide the later rich-text, media-storage, forms, dynamic-source, SEO,
  workflow, or visual-theme contracts; or
- treat Payload's current provider schema as product authority.

## Plain-language question

Should staff assemble ordinary Pages and Articles from a small set of
meaningful sections, or should Web Studio expose lower-level rows, columns,
wrappers, and nested layout controls?

The real choice is not “flexible versus inflexible.” It is where flexibility
lives:

- in reusable, meaning-based sections that the product can render safely on
  every screen; or
- in layout machinery that every staff member must understand and every
  future redesign must continue supporting.

## Concrete staff example

A staff member creates **About Our Work** from an About Page Starter and sees
one vertical Page outline:

1. **Hero** — title, short introduction, and approved image.
2. **Rich Text** — the organization's story.
3. **Media** — a photograph beside a short program explanation.
4. **Impact Statistics** — three current, staff-entered editorial figures.
5. **Quote** — an attributed ministry-partner quotation.
6. **Call to Action** — a typed link to Give or Contact.

They may add, remove, duplicate, and reorder eligible sections. They never
choose CSS classes, pixel spacing, breakpoints, grid coordinates, device-only
visibility, or a separate mobile order. The public renderer owns the visual
layout and stacks the content in the same meaningful reading order at narrow
width and high zoom.

An **Article** receives a quieter catalog: Rich Text, Media, Gallery, Quote,
and Call to Action. Its title, public byline, editorial date, and Article
header remain family-level facts rather than draggable sections. Page-only
sections do not appear in its chooser and cannot be injected through an API,
copy/paste, import, or privileged provider hook.

## Current repository findings

The current code is useful prototype evidence, but it is not a safe D7
contract:

1. [`page-builders.ts`](../../../apps/admin/src/cms/collections/page-builders.ts)
   defines one seven-block palette—Hero, Rich Text, Media Feature, Call to
   Action, FAQ, Impact Statistics, and Testimonial—and reuses it for ordinary
   Pages, Page Templates, Missionary Giving Pages, and Project Pages. That
   conflicts with Phase 22's separate code-owned semantic page families.
2. [`pages.ts`](../../../apps/admin/src/cms/collections/pages.ts) retains a
   mutable legacy `pageType`, a mutable template relationship, block layout,
   and a second legacy rich-text content channel. It does not enforce D6's
   immutable `general_page | article` boundary.
3. Block knowledge is repeated across provider schema, handwritten endpoint
   payload shapes, public DTOs, two serializers, preview, public renderers, and
   tests. There is no one exhaustive catalog contract.
4. [`serializer.ts`](../../../packages/api/src/cms/public/serializer.ts)
   silently drops unknown blocks, while
   [`serialize-published-page.ts`](../../../apps/admin/src/cms/public/serialize-published-page.ts)
   emits a generic base record for an unknown block. Preview and public output
   can therefore disagree.
5. Authenticated preview renders all seven known blocks, while the current
   donor route renders legacy rich text plus only selected media-bearing block
   content. An author can approve a preview that the public surface cannot
   reproduce.
6. The generic Call to Action serializer contains hidden
   Missionary/Project-checkout behavior selected by mutable `pageType`.
   Operational giving ownership is therefore coupled into a nominally generic
   editorial block.
7. Payload enables broad default Lexical behavior, but the public renderer
   supports only a smaller undocumented node subset. Unsupported semantics can
   be lost without a release-blocking error.
8. There is no explicit block schema version, family capability profile,
   catalog/renderer compatibility proof, content migration contract, or
   zero-unknown release census.

These are migration inputs, not reasons to preserve the prototype structure.

## Current first-party evidence

### Payload CMS

Payload's current Blocks field stores an ordered mixed array of typed objects.
Each block persists the code-configured block slug as `blockType`; the field
supports server and Admin validation, row limits, localization, labels,
groups, icons, thumbnails, reusable block configuration references, and
contextual block filtering. Payload also supports block copy/paste and
regenerates block and nested-array IDs after checking target-schema
compatibility.
[Payload Blocks field](https://payloadcms.com/docs/fields/blocks)

This proves that a typed, approachable section chooser is compatible with the
provider. It does **not** prove Asym's product rules. Chooser filtering is
authoring assistance, not server authorization; provider `blockType` alone is
not Asym's schema lineage; and copy/paste still requires complete Tenant,
Site, locale, family, media, destination, and reusable-reference reproof.

Payload can also place Blocks inside Lexical rich text. That flexibility is a
reason to set a boundary, not an obligation to use it. Exposing the same layout
sections both at Page level and inside Rich Text would create two composition
paths, deeper nesting, duplicated rendering, and more difficult migrations.
[Payload Lexical Blocks](https://payloadcms.com/docs/rich-text/blocks)

Core currently pins Payload `4.0.0-internal.1f9ae9a`. Current public
documentation is directional evidence only until every relied-on behavior is
qualified against that exact internal build or a later production-approved
cohort.

### WordPress / Gutenberg

WordPress's current editor guidance explicitly combines patterns, block
locking, global design constraints, filters, and selective feature removal to
open useful authoring paths while curating accidental layout damage. Patterns
provide named, discoverable compositions; they do not require exposing every
low-level control.
[WordPress — Curating the Editor Experience](https://developer.wordpress.org/block-editor/how-to-guides/curating-the-editor-experience/),
[WordPress block patterns](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-patterns/)

WordPress block deprecation guidance also warns that old block versions do not
form an automatic sequential migration chain and recommends fixtures for every
supported old form. The transferable lesson is that D7 needs explicit version
fixtures and direct compatibility proofs rather than “migrate on read.”
[WordPress block deprecation](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/)

### Sanity

Sanity's current structured page-builder guidance recommends modeling what
content **means**, not how it is positioned. It uses an ordered array of
predefined objects or references, recommends previews and grouping for
findability, and leaves presentation to frontend code so content survives a
redesign.
[Sanity — Structured content for page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building)

That supports semantic concepts such as FAQ, Quote, and Call to Action. It
cuts against presentation-only records such as Three Columns, Big Blue
Section, Spacer, or Desktop-only Row.

### Accessibility standards

W3C's Authoring Tool Accessibility Guidelines distinguish two obligations:
the editor itself must be accessible, and it must help authors produce
accessible output. The block chooser, reordering, validation, media prompts,
and preview therefore require accessibility by construction rather than a
late checklist.
[W3C ATAG overview](https://www.w3.org/WAI/standards-guidelines/atag/)

WCAG 2.2 Reflow requires ordinary content to retain information and
functionality at a 320 CSS-pixel equivalent viewport, including the common
1280-pixel desktop at 400% zoom case. A single meaningful DOM order with
code-owned responsive stacking is safer than allowing authors to create
different visual and reading orders.
[W3C Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## Options

### Option A — Freeze a minimal seven-section catalog

Keep the prototype concepts: Hero, Rich Text, Media Feature, Call to Action,
FAQ, Impact Statistics, and Testimonial. Add versions and validation, but add
no Cards or Gallery.

**Benefits**

- Smallest migration and implementation surface.
- Easy chooser with few decisions.
- Covers a basic brochure Page.

**Problems**

- Cards and galleries are ordinary nonprofit communication needs; staff would
  force them into rich text, clone awkward layouts, or need a developer.
- Testimonial is narrower than the reusable semantic concept Quote.
- Freezing today's generic palette would preserve some prototype coupling
  instead of designing the two D6 family profiles deliberately.
- A too-thin catalog tends to create one-off Page Starters and rich-text hacks,
  which is technical debt rather than simplicity.

### Option B-prime — One small semantic catalog with closed family profiles

Use one code-owned, versioned ordinary catalog. Page and Article share genuine
content primitives and one canonical compiler/renderer implementation, but
each family receives a closed capability profile.

#### Recommended launch catalog

| Semantic section      |                    Page | Article | Bounded purpose                                                                                                                 |
| --------------------- | ----------------------: | ------: | ------------------------------------------------------------------------------------------------------------------------------- |
| **Hero**              | Yes; at most one, first |      No | Introduce one Page with a heading, short copy, approved media, and an optional typed action.                                    |
| **Rich Text**         |                     Yes |     Yes | Structured prose using the later approved leaf-formatting contract; never a nested layout builder.                              |
| **Media**             |                     Yes |     Yes | One approved media reference with an explicit alt/decorative decision, optional caption/credit, and optional supporting copy.   |
| **Gallery**           |                     Yes |     Yes | A bounded same-kind set of approved media references with per-item accessibility treatment and code-owned reflow.               |
| **Call to Action**    |                     Yes |     Yes | Short copy plus a bounded typed destination; no copied giving truth or raw internal route.                                      |
| **Cards**             |                     Yes |      No | A bounded same-kind collection of related summaries with optional approved media and typed destinations.                        |
| **FAQ**               |                     Yes |      No | A bounded question-and-answer collection with one accessible public disclosure treatment.                                       |
| **Quote**             |                     Yes |     Yes | Quoted text with explicit public attribution when applicable; testimonial is a use, not another schema.                         |
| **Impact Statistics** |                     Yes |      No | A bounded set of clearly editorial values, labels, explanations, and optional public source notes—not live operational metrics. |

The catalog is a flat ordered sequence. FAQ entries, cards, gallery items, and
statistics are bounded homogeneous lists inside their owning section; they do
not contain arbitrary blocks. Rich Text is a leaf. D1's one-level Reusable
Section reference appears as a distinct, visibly shared insertion, not an
ordinary block and never a nested reusable reference.

Do **not** add ordinary Section, Row, Columns, Grid, Group, Spacer, Divider,
Accordion, Testimonial, or Logo Layout types. Those describe presentation,
repeat an existing meaning, or invite nested wrapper growth. Necessary visual
differences are code-owned responsive treatments or a few named semantic
variants; Page Starters compose larger starting arrangements.

Also exclude these capabilities until their owning decisions qualify them:

- giving or designation behavior;
- forms;
- source-backed dynamic lists, related content, or operational metrics;
- arbitrary video/embed URLs or iframe code;
- announcement automation; and
- raw HTML, CSS, JavaScript, React, plugins, or data queries.

**Benefits**

- Covers the dominant nonprofit editorial jobs without a noisy block drawer.
- Gives Articles a focused writing experience and Pages enough composition
  freedom.
- Stores meaning that survives a redesign rather than today’s grid structure.
- Flat composition is easier to understand, validate, migrate, preview,
  serialize, render accessibly, and cache coherently.
- A governed extension lane prevents both permanent stagnation and an open
  low-code platform.

**Tradeoff**

- A genuinely new semantic need requires an engineered catalog addition.
  That is intentional design-system governance, not missing tenant
  flexibility.

### Option C — Bounded nested layout builder

Add Section, Row, Columns, and Group primitives and permit ordinary blocks
inside them up to a fixed depth.

**Benefits**

- More direct control over bespoke desktop marketing layouts.
- Fewer immediate requests for new semantic presentation variants.

**Problems**

- Even shallow nesting adds wrapper selection, drag/drop targets, outline
  navigation, copy/paste rules, responsive order, keyboard reordering,
  migration, focus restoration, and preview complexity.
- Authors must reason about containers and breakpoints rather than their
  message.
- Mobile visual order can diverge from DOM and assistive-technology reading
  order.
- Stored layout structure couples content to the current Site theme and makes
  redesigns more expensive.
- It recreates much of a visual site builder before Asym has evidence that
  tenants need that burden.

## Preliminary recommendation

Choose **Option B-prime**.

This is the smallest design that is both genuinely useful and durable. It
adds only two unmet common concepts—Gallery and Cards—to the prototype,
generalizes Testimonial to Quote, preserves familiar nonprofit sections, and
removes presentation-only controls. It does not require a block row per
database table, arbitrary nesting, tenant schemas, or an extension marketplace.

## Permanent contract if B-prime is selected

### One provider-neutral registry

Every ordinary section definition owns:

- stable code-owned type ID and explicit content-schema version;
- plain staff label, one-sentence purpose, accessible icon/thumbnail, and
  concise outline summary;
- Page-family eligibility, position/cardinality rules, allowed same-kind
  children, and bounded item counts;
- typed fields plus complete server validation and reference extraction;
- locale behavior and exact Tenant/Site/locale dependency proof;
- accessible editor, preview, and public renderer behavior;
- deterministic public serializer and compatibility range;
- direct migration fixtures from every supported historical version;
- deprecation state, export behavior, and forward-migration path; and
- privacy-safe cause codes and recovery instructions.

Payload config, generated provider types, Admin filtering, serializer unions,
preview, public DTOs, renderers, migrations, and tests derive from or prove
equivalence to that registry. No handwritten fallback silently invents a
partial block.

### Release and migration behavior

- D1 pins the exact catalog/profile/compiler/renderer generation selected by
  a candidate Public Site Generation.
- Family eligibility, source scope, and schema compatibility are enforced by
  the command and candidate compiler, not merely by hiding chooser options.
- Unknown types, future schema versions, family-ineligible sections,
  unsupported rich-text nodes, bad references, or renderer incompatibility
  block only the candidate. The prior public generation and recoverable draft
  remain intact.
- Deprecation removes a section from **Add section** but does not make existing
  content disappear. Its qualified old form remains readable, editable,
  exportable, previewable, and renderable until an explicit forward migration
  prepares a successor draft.
- Released history is immutable. Migrations never rewrite old releases or
  happen silently during a read.
- A catalog addition is code release, not tenant configuration. It requires a
  proved editorial need that no existing section, safe variant, preset, or
  Page Starter serves, plus schema, migration, security, accessibility,
  locale, preview, export, renderer, and release evidence.

### Quiet authoring experience

- One **Page content** outline shows each section's plain name, useful summary,
  issue state, and local/shared status.
- **Add section** opens a small context-aware chooser filtered to the current
  family, with plain descriptions and thumbnails. Search appears only when
  the qualified catalog is large enough to need it.
- Insertion is available between sections. The complete catalog is not an
  always-visible wall of choices.
- Dragging is optional. Keyboard- and touch-operable Move up, Move down,
  Duplicate, and Remove actions remain available with focus restoration and
  status announcements.
- Removal is recoverable through draft undo/version recovery. Destructive
  consequences are stated before the action, not hidden after it.
- Validation appears on the affected section and in one Page-level issue
  summary. Healthy Pages remain quiet.
- The authoring tool prompts for accessible content decisions such as image
  meaning, heading coherence, link purpose, and quotation attribution without
  exposing WCAG jargon as routine form copy.
- Desktop and narrow/reflow preview use the same candidate compiler and public
  renderer. Provider previews cannot approve a representation the live surface
  will not serve.
- Schema versions, catalog generations, provider IDs, and migration internals
  stay out of ordinary staff UI. They appear only in cause-owned diagnostics.

## What D7 would still not decide

Selecting B-prime would not yet choose:

- the complete Rich Text toolbar and embed allowlist;
- exact media storage, upload, transformation, safety, or Phase 29 handoff;
- the exact reusable-section eligibility and inherited-region UX beyond D1's
  one-level boundary;
- dynamic-source adapters, Forms, related content, or giving capabilities;
- Site theme, typography, color, or presentation-profile controls;
- exact numeric capacity and version-retention budgets, which need
  production-shaped proof before specification; or
- implementation, tickets, migration execution, deployment, or cutover.

## Adversarial review map after the founder chooses

The chosen option will be checked individually for brittleness, technical
debt, edge cases, footguns, Tenant safety, over-engineering, UX friction,
hidden coupling, failure behavior, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependencies,
migration/upgrade risk, and other development hazards. The highest-risk seams
already identified are:

1. chooser-only family restrictions bypassed by API, import, copy/paste, or a
   privileged Payload operation;
2. schema evolution without an explicit block version and direct fixture;
3. silent unknown-block omission or preview/public divergence;
4. presentation variants growing into arbitrary styling controls;
5. same-kind repeaters becoming unbounded mini-builders;
6. responsive layouts changing DOM reading order;
7. Article slowly accumulating every Page-only section;
8. private media metadata, unrestricted URLs, or source-owned facts leaking
   through a generic serializer;
9. catalog/compiler/renderer versions deploying out of step with D1 release
   proof;
10. large block counts, relationship depth, or repeaters causing oversized
    projections and N+1 reads;
11. deprecation mutating history or stranding recoverable drafts; and
12. duplication retaining local IDs or copying cross-scope relationships
    without reproof.

## Original founder decision and selection

> **Option B-prime — One small, code-owned Semantic Ordinary Section Catalog
> with closed Page and Article profiles — Recommended:** ordinary Phase 23
> content is one flat, Page-local ordered sequence from nine launch sections:
> Hero, Rich Text, Media, Gallery, Call to Action, Cards, FAQ, Quote, and Impact
> Statistics. Articles receive only Rich Text, Media, Gallery, Quote, and Call
> to Action; Pages receive the full qualified catalog. Same-kind repeaters are
> bounded, Rich Text is a leaf, D1 Reusable Sections remain a distinct
> one-level reference, and responsive layout stays code-owned. Each section
> has a stable type and explicit schema version, complete server validation,
> family eligibility, accessible preview/public rendering, locale and
> dependency rules, direct migration fixtures, and D1-pinned
> catalog/compiler/renderer compatibility. Unknown or incompatible content
> blocks only the candidate while preserving the prior live generation and
> recoverable draft. New section types require a proved unmet editorial need
> and complete migration, security, accessibility, preview, locale, export,
> and release evidence—without arbitrary nesting, tenant-defined schemas,
> raw HTML/CSS/JavaScript, generic queries, silent block dropping, or a block
> for every visual treatment.

**Founder question:** Choose A, B-prime, or C for Phase 23 D7.

**Founder selection:**

> Option B-prime — Small semantic catalog with closed family profiles, but
> building it in mind we will eventually want to move to option C.

## Selection verdict

The selection survives adversarial review. B-prime is the sound launch
architecture, and the future Option C intent requires one deliberate additive
evolution seam. It does **not** justify building a recursive layout engine,
parent/child storage, rows and columns, arbitrary style data, or nested editing
controls before any such user need has been specified and proved.

The durable interpretation is:

1. version 1 is one flat ordered composition under an implicit root;
2. every local section is a stable, versioned semantic leaf independent of
   outer layout;
3. one provider-neutral catalog/compiler boundary proves every authoring,
   preview, public, migration, and release consumer is compatible;
4. a later, separately researched and ratified composition generation may add
   a small set of named, code-owned, bounded container nodes; and
5. existing version-1 root sections remain valid forever and are never
   silently wrapped, reparented, or rewritten.

This is evolution-ready architecture, not speculative infrastructure.

## Current-source research update after selection

Payload's Blocks field remains a suitable provider mechanism for an ordered
typed launch catalog. It supports code-owned block slugs, validation, row
limits, contextual availability, thumbnails, groups, and schema-compatible
copy/paste. Payload regenerates block and nested-array IDs on paste, but its
compatibility check does not prove Asym Tenant, Site, locale, family, media,
destination, or Reusable Section scope. Native cross-document clipboard
behavior therefore must be disabled or wrapped by an Asym command that creates
fresh local identities and reauthorizes every dependency.
[Payload Blocks](https://payloadcms.com/docs/fields/blocks)

Payload can technically express nested fields later, so D7 does not need a
custom relational tree now. Its Local API also bypasses access control by
default unless the caller deliberately supplies and enforces user context.
Provider filtering and copy compatibility are therefore usability aids, never
Tenant or release authority.
[Payload fields](https://payloadcms.com/docs/fields/overview),
[Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)

Sanity's current structured-content guidance recommends meaning-first modules
rather than persisted visual position. WordPress separately documents the
allowed-child, parent/ancestor, focus, mover, and migration concerns introduced
by nested blocks. Shopify similarly advises choosing only the flexibility a
theme needs and warns that overly granular blocks increase editor and code
complexity. Its own nested theme-block model has explicit type and depth
limits. These are strong reasons to keep B-prime visibly flat now and treat
future C as a separately bounded grammar rather than generic recursion.
[Sanity structured page building](https://www.sanity.io/docs/developer-guides/how-to-use-structured-content-for-page-building),
[WordPress nested blocks](https://developer.wordpress.org/block-editor/how-to-guides/block-tutorial/nested-blocks-inner-blocks/),
[Shopify sections and blocks](https://shopify.dev/docs/storefronts/themes/best-practices/templates-sections-blocks),
[Shopify theme-block schema](https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/schema)

WordPress's deprecation contract confirms that historical block
representations cannot be assumed to migrate through a reliable sequential
chain; every supported old form needs a direct fixture and migration path.
Payload likewise expects explicit database migrations for schema changes.
That supports versioned successor drafts and shadow compilation, never
mutation during a public read.
[WordPress block deprecation](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-deprecation/),
[Payload migrations](https://payloadcms.com/docs/database/migrations)

For the editor, W3C ATAG requires both an accessible authoring tool and help
creating accessible output. WCAG 2.2 requires a single-pointer alternative to
dragging and meaningful reflow. The practical contract is a flat accessible
outline, a small contextual chooser, visible move controls, synchronized
preview, local repair guidance, and undo—not a canvas-only or drag-only
builder.
[W3C ATAG](https://www.w3.org/WAI/standards-guidelines/atag/),
[W3C Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements),
[W3C Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

## Ruthless adversarial review

### 1. Brittleness — Concern: Yes

- **What could go wrong:** A flat Payload array becomes hard-coded separately
  in provider configuration, preview, public serializers, DTOs, renderers,
  migration code, and CSS. A later container then requires rewriting every
  consumer and released Page.
- **Why it matters:** Option C would become a high-risk replacement project,
  and ordinary catalog changes could make valid content disappear on only one
  surface.
- **Severity:** High.
- **Likelihood:** High if the current duplicated prototype is extended.
- **Permanent prevention:** Define version 1 as a provider-neutral Composition
  Document with one implicit root and an ordered flat sequence. Keep leaf
  fields layout-neutral and route compatibility through one exhaustive
  catalog/compiler boundary. Do not add recursive storage now.

### 2. Technical debt — Concern: Yes

- **What could go wrong:** Section knowledge is duplicated across handwritten
  switches, or the future-C rider triggers a generic AST, tree framework, and
  plugin system before any container exists.
- **Why it matters:** Both extremes multiply change cost: duplicated switches
  drift, while a speculative framework imposes permanent abstractions nobody
  yet needs.
- **Severity:** High.
- **Likelihood:** High without a deliberate boundary.
- **Permanent prevention:** Use small modular code-owned section definitions
  assembled into one ordinary catalog. Derive artifacts where that remains
  clear; otherwise require exhaustive conformance tests. Build only the stable
  envelope, versions, profiles, and compiler seam required today.

### 3. Edge cases — Concern: Yes

- **What could go wrong:** A stale client submits a retired type; Hero is
  duplicated or moved; an Article receives a Page-only section; copy/paste
  retains another Page's identity or Tenant's references; a CTA or media
  target retires; a locale is incomplete; an old version is restored; or a
  later container tries to wrap an ineligible root-only reference.
- **Why it matters:** These are ordinary editing, restoration, localization,
  and evolution scenarios, not theoretical anomalies.
- **Severity:** High.
- **Likelihood:** Medium-high.
- **Permanent prevention:** Enforce immutable family, closed profiles,
  position/cardinality rules, explicit versions, fresh identities on copy,
  exact reference reproof, and locale readiness on every command and release.

### 4. Footguns — Concern: Yes

- **What could go wrong:** Developers mistake chooser filtering for
  authorization; a privileged Payload Local API call bypasses access; staff
  paste raw URLs or executable markup; deprecating a type strands content;
  drag becomes the only reorder control; or removal irreversibly destroys work.
- **Why it matters:** A harmless-looking editor or maintenance action could
  publish unsafe content, bypass family rules, or cause data loss.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Route writes through scope-aware server commands,
  explicitly enforce access for user-context Local API calls, use typed
  destinations, separate new-insertion availability from support for existing
  content, provide non-drag move controls, and preserve draft undo/version
  recovery.

### 5. Tenant safety — Concern: Yes

- **What could go wrong:** Clipboard, import, restore, relationship
  population, Reusable Sections, or privileged operations carry media,
  destinations, or content across Tenant, environment, Site, locale, or family
  boundaries.
- **Why it matters:** On a public CMS surface, an isolation error becomes an
  external disclosure and may expose restricted missionary information.
- **Severity:** Critical.
- **Likelihood:** Low-medium with complete controls; materially higher if
  provider bypass paths remain.
- **Permanent prevention:** Reprove exact actor, Tenant, environment, Site,
  locale, family, and every referenced owner inside add, paste, duplicate,
  restore, preview, export, migration, and release commands. Treat provider
  access and Supabase RLS as separate boundaries and test every privileged
  path negatively.

### 6. Over-engineering — Concern: Yes

- **What could go wrong:** “Ready for C” becomes parent-pointer rows, generic
  `children`, nullable container fields, arbitrary nesting, responsive
  matrices, style JSON, a tenant schema builder, or dormant nested-editor
  controls.
- **Why it matters:** Staff, developers, tests, migrations, and the database
  pay Option C's cost before the actual layout grammar or user need is known.
- **Severity:** High.
- **Likelihood:** High unless explicitly prohibited.
- **Permanent prevention:** Preserve only the minimal additive seam: one
  composition-format version, stable versioned leaves, closed placement
  profiles, layout-neutral content, and one compiler. Future C requires its
  own evidence and ratification.

### 7. UX/UI and user friction — Concern: Yes

- **What could go wrong:** Nine sections appear as a jargon-heavy wall;
  irrelevant Page sections appear in Articles; users must drag; errors appear
  only at release; schema and migration terms leak into everyday work; or a
  canvas obscures keyboard and mobile authoring.
- **Why it matters:** Infrequent nonprofit editors need to recognize the job a
  section performs and recover confidently without learning a layout system.
- **Severity:** Medium-high.
- **Likelihood:** High without deliberate curation.
- **Permanent prevention:** Page shows exactly nine eligible choices and
  Article exactly five. At this size, use no categories, favorites, or search.
  Each choice has a thumbnail, plain name, and one “Use this to…” sentence.
  Provide insertion at the intended position, derived row labels, a flat
  outline, local errors plus one linked summary, desktop/narrow preview, Move
  up/down/Move to controls, focus restoration, announcements, and undo. Hide
  implementation versions and future containers from routine UI.

### 8. Hidden coupling — Concern: Yes

- **What could go wrong:** CTA behavior depends on mutable `pageType`; ordinary
  and Phase 22 page families share provider schemas; media embeds raw provider
  records; leaf CSS assumes root placement; or Payload `blockType` and
  `published` state become product authority.
- **Why it matters:** Giving, media, Phase 22, theme, or provider changes could
  break unrelated ordinary Pages or bypass D1's release contract.
- **Severity:** High.
- **Likelihood:** High in the current prototype.
- **Permanent prevention:** Keep ordinary and Phase 22 catalogs distinct. Use
  typed destination adapters and privacy-filtered media projections. Separate
  semantic leaf rendering from composition framing, and keep D1 as the only
  public generation authority.

### 9. Failure modes — Concern: Yes

- **What could go wrong:** An unknown type or future version disappears;
  preview and public output disagree; compiler and renderer deploy out of
  sequence; or a failed migration replaces a healthy public Page.
- **Why it matters:** Silent partial publication misleads staff and visitors
  and is harder to detect than a blocked candidate.
- **Severity:** Critical.
- **Likelihood:** Medium; silent-drop behavior already exists in the
  prototype.
- **Permanent prevention:** Unknown, incompatible, unsafe, unresolved, or
  oversized content fails only the candidate with an exact cause. Preserve raw
  draft data and the prior immutable public generation. Preview and public
  presentation must use the same compiler/renderer or prove byte-semantic
  equivalence.

### 10. Data integrity risks — Concern: Yes

- **What could go wrong:** Duplicate section IDs, index-based identity, broken
  references, missing values silently becoming zero, stale editorial
  statistics, lossy migrations, or read-time mutation corrupt composition and
  history.
- **Why it matters:** Reorder, restore, duplicate, diff, and migration must
  preserve meaning and remain explainable.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Keep one opaque section identity stable within its
  Page/locale revision lineage and regenerate it on duplicate or cross-Page
  paste; never authorize by that ID or use array position as identity. Require
  explicit type versions, typed values, immutable releases, direct migrations,
  and editorial source/as-of labels where Impact Statistics need context.

### 11. Security and privacy risks — Concern: Yes

- **What could go wrong:** Rich text, raw URLs, embeds, uploaded filenames,
  EXIF, private media fields, relationship population, or preview data become
  executable or public.
- **Why it matters:** These Pages are internet-facing and may concern
  restricted missionaries.
- **Severity:** Critical.
- **Likelihood:** Medium without an allowlisted public boundary.
- **Permanent prevention:** Allowlist supported rich-text nodes and typed
  destinations; prohibit raw HTML, CSS, JavaScript, iframes, queries, and
  arbitrary executable content; consume only approved privacy-filtered public
  media projections; strip original filenames and metadata from public
  output; sanitize by output context; and test preview/public authorization.

### 12. Scalability and performance risks — Concern: Yes, bounded but real

- **What could go wrong:** Unbounded section counts, repeaters, galleries,
  rich text, media relations, relationship depth, autosave versions, or later
  recursive traversal create large documents, N+1 reads, slow previews, and
  expensive releases.
- **Why it matters:** A design that feels fast on a demo Page may fail on large
  tenant Sites and complicate future C.
- **Severity:** Medium-high.
- **Likelihood:** Medium.
- **Permanent prevention:** Establish production-shaped maximum total-node,
  repeater-item, payload, media, relationship-depth, and compile-time budgets
  before shipping; batch dependency resolution; compile one bounded D1 public
  artifact; use transformed media; and benchmark qualified maximum-shaped
  Pages. Choose numeric limits from evidence, not arbitrary guesses in D7.

### 13. Operational burden — Concern: Yes

- **What could go wrong:** Every section change requires unrelated manual
  edits; tenants receive bespoke catalogs; migrations need developer rescue;
  or deprecation removes old content from staff reach.
- **Why it matters:** A nine-type catalog is simple only if it has one
  repeatable lifecycle.
- **Severity:** Medium.
- **Likelihood:** Medium-high.
- **Permanent prevention:** Maintain one ordinary section-definition contract,
  conformance-test kit, deprecation state, direct migration-fixture pattern,
  readiness census, and repair guidance. Keep catalogs code-owned rather than
  tenant-defined and retain qualified old content until a successor is ready.

### 14. Observability gaps — Concern: Yes

- **What could go wrong:** Support cannot tell whether a candidate failed
  because of family eligibility, section type/version, illegal position,
  unsafe content, reference scope, migration, or renderer incompatibility.
- **Why it matters:** Generic “publish failed” errors invite blind retries,
  support escalation, and risky manual edits.
- **Severity:** High.
- **Likelihood:** High under the current silent-drop path.
- **Permanent prevention:** Emit privacy-safe structured cause codes carrying
  Tenant/Site/page/candidate identifiers, section identity, type/version, and
  structural path. Provide quiet readiness counts and alerts for unknown,
  migration, dependency, and parity failures without logging authored content.

### 15. Dependency and integration risks — Concern: Yes

- **What could go wrong:** Current public Payload behavior differs from the
  pinned internal v4 build; clipboard, filters, migrations, references, or
  serialization change on upgrade; source-owned media and destinations evolve
  independently.
- **Why it matters:** Provider details could accidentally redefine the product
  or make an upgrade strand content.
- **Severity:** Medium-high.
- **Likelihood:** Medium.
- **Permanent prevention:** Put Payload behind a provider adapter, qualify each
  relied-on behavior against the exact pinned build, keep provider types out of
  public artifacts, and require upgrade conformance plus migration rehearsals.

### 16. Migration and upgrade risks — Concern: Yes

- **What could go wrong:** Existing seven-block documents lack explicit
  versions; `testimonial` to Quote or `media-feature` to Media loses meaning;
  raw CTA strings cannot become safe typed destinations; a future flat-to-tree
  change rewrites history; or Phase 22 content is accidentally absorbed.
- **Why it matters:** Migration is already necessary even if Option C never
  ships.
- **Severity:** High.
- **Likelihood:** High.
- **Permanent prevention:** Complete a zero-unknown census and direct fixtures:
  Hero maps only when its singular/position rules pass; Rich Text only when its
  node set is supported; Media Feature only after media/privacy proof; CTA only
  after typed-destination mapping; FAQ directly; Impact Statistics as explicit
  editorial claims with source/as-of semantics; Testimonial to Quote; Phase 22
  stays Phase 22; everything unknown is quarantined. Prepare successor drafts,
  shadow-compile, reconcile counts, and activate through D1. Treat version-1
  flat content as a permanent valid implicit-root form.

### 17. Other development hazards — Concern: Yes

- **What could go wrong:** Concurrent autosaves or reorders overwrite edits; a
  dependency changes after validation; stale browser code submits an obsolete
  schema; catalog/compiler/renderer/database generations deploy out of order;
  or rollback destructively rewrites content.
- **Why it matters:** These races occur precisely at the high-consequence
  release boundary.
- **Severity:** High.
- **Likelihood:** Medium.
- **Permanent prevention:** Use optimistic revision/CAS guards, idempotent
  commands, exact-version client refresh handling, and final permission,
  dependency, schema, and compatibility reproof inside D1's generation
  release. Roll back by serving the prior immutable generation. Test
  concurrency, stale clients, copy/import/restore, accessibility, maximum
  shape, and release recovery.

## Ruthless synthesis: the best path forward

1. **Ratify the semantic product catalog, not the prototype.** Keep exactly the
   nine Page and five Article choices and their closed profiles.
2. **Lock the minimum future-C seam.** Version the composition envelope, treat
   the flat sequence as an implicit root, give every section a stable identity
   and schema version, and keep every leaf independent of outer layout. Build
   no tree now.
3. **Create one ordinary catalog/compiler contract.** Provider config,
   commands, family/placement validation, dependency extraction, preview,
   public projection, rendering, export, diagnostics, and migrations must
   derive from it or prove exhaustive equivalence.
4. **Enforce the contract on the server.** Reprove actor and complete scope for
   UI, API, Local API, copy/paste, duplicate, import, restore, migration,
   preview, export, and release paths.
5. **Ship the quiet accessible editor.** Use a family-filtered purpose-first
   chooser, flat outline, useful derived labels, direct non-drag movement,
   synchronized previews, local repair messages, focus preservation, and undo.
6. **Migrate through successor drafts.** Census all existing documents, retain
   direct fixtures, preserve raw content, shadow-compile, reconcile every
   disposition, and keep the current public generation live until D1 proves
   the replacement.
7. **Prove production shape before release.** Gate release on cross-scope
   negative tests, family/cardinality enforcement, unknown-version behavior,
   preview/public parity, accessibility, stale-client and concurrency tests,
   migration reconciliation, maximum-shape performance, and prior-generation
   recovery.
8. **Move to C only as an additive, separately governed evolution.** When
   evidence supports it, add a few named containers with explicit allowed
   children, maximum depth and node budgets, one meaningful DOM/mobile order,
   and complete migration/accessibility/release proof. Existing flat Pages
   remain valid; no forced reparenting is needed.

## Required proof gates before implementation can ship

1. The code-owned catalog has exhaustive, duplicate-free type and renderer
   coverage.
2. Page/Article eligibility, Hero placement/cardinality, and repeater bounds
   hold through UI, command, API, import, paste, restore, migration, and
   privileged Local API paths.
3. Section identities survive edit/reorder and regenerate on duplicate and
   cross-Page paste without becoming authorization or public identity.
4. Tenant, environment, Site, locale, family, and every dependency pass
   positive and cross-scope negative tests.
5. Preview and public presentation use the same compiler/renderer or prove
   semantic equivalence for every type and version.
6. Unknown, future-version, family-ineligible, unresolved, unsafe, oversized,
   and renderer-incompatible content fails only the candidate, preserves raw
   draft content, and leaves the prior public generation live.
7. D1 pins one compatible composition format, family profile, catalog,
   compiler, renderer, and migration generation.
8. The legacy census maps or explicitly quarantines every section and
   relationship, with source and target control totals equal.
9. Public links, rich text, media fields, filenames, and metadata pass
   allowlist, privacy, XSS, and restricted-worker tests.
10. Unsupported rich-text nodes fail visibly rather than being dropped or
    flattened silently.
11. Chooser, fields, outline, move controls, errors, previews, and undo pass
    keyboard, focus, announcement, touch, reflow, and screen-reader checks.
12. Evidence-based qualified maximums pass payload-size, dependency-count,
    media, compile-time, render-time, and relationship-depth budgets.
13. A deprecated type disappears from new insertion while qualified existing
    content remains readable, editable, exportable, previewable, and renderable
    until explicit successor migration.
14. Stale-client, concurrent edit/reorder, dependency-race, idempotency, CAS,
    and prior-generation recovery tests pass.
15. Version-1 implicit-root Pages remain valid under the future composition
    compatibility seam, while current schema, database, and UI contain no
    latent generic-tree or container machinery.

## Ratified formulation

> **B-prime-amended-and-hardened (B-prime-R) — One small, code-owned,
> versioned Semantic Ordinary Section Catalog with closed Page and Article
> profiles and a deliberately minimal additive path to bounded future
> composition:** ordinary Phase 23 content is one provider-neutral versioned
> Composition Document whose initial format has one implicit root and a flat,
> Page-local ordered sequence of sections from Hero, Rich Text, Media, Gallery,
> Call to Action, Cards, FAQ, Quote, and Impact Statistics. Pages receive the
> full qualified catalog; Articles receive only Rich Text, Media, Gallery,
> Quote, and Call to Action. Hero is Page-only, first, and at most one;
> same-kind repeaters are bounded; every launch section, including Rich Text,
> is a leaf; and D1 Reusable Sections remain distinct, visibly shared,
> same-scope, root-only, one-level, and non-recursive references.
>
> Each local section has one opaque instance identity that survives editing
> and movement within its Page/locale revision lineage but is regenerated on
> duplication or cross-Page copy and never becomes authorization, public URL,
> or cross-locale identity; one stable code-owned semantic type; one explicit
> schema version; and typed content. One modular provider-neutral ordinary
> catalog and exhaustive candidate compiler own or prove equivalence across
> family and placement eligibility, server validation, Tenant/Site/locale
> scope, dependency extraction, accessible authoring and rendering, preview,
> public serialization, locale and export behavior, deprecation, direct
> historical migrations, diagnostics, and D1-pinned composition/profile/
> catalog/compiler/renderer compatibility. UI filtering and provider clipboard
> compatibility are assistance only: commands, imports, copy/paste, restores,
> privileged operations, and release compilation reprove the exact actor,
> scope, family, version, references, and cardinality, and copies never carry
> an unproved dependency.
>
> Authors receive one family-filtered chooser with a thumbnail, plain name,
> and purpose-first description for each eligible section; starter-led
> defaults; derived outline labels; synchronized desktop and narrow previews;
> local repair guidance plus one linked issue summary; and drag as an optional
> enhancement alongside accessible Move up, Move down, and Move to actions,
> focus preservation, status announcements, and undo. At the launch catalog's
> size, the chooser adds no categories, favorites, or search. The composition
> layer owns outer width, spacing, grid behavior, heading structure, one
> meaningful DOM and responsive order, and code-owned presentation; section
> content stores no viewport breakpoints, column coordinates, CSS classes,
> parent-specific layout, arbitrary style data, or alternate mobile order. CTA
> uses a typed source-qualified destination, media consumes only its owner's
> privacy-filtered public projection, and Impact Statistics are explicitly
> staff-authored editorial claims with optional public source/as-of context,
> never operational, financial, giving, or accounting truth.
>
> Option C is an intentional but separately researched and ratified evolution:
> a later composition-format and catalog generation may add only a small set of
> named code-owned container node types with explicit family, placement,
> allowed-child, maximum-depth, total-node, responsive-order, accessibility,
> migration, and release contracts. Existing version-1 root sections remain
> valid and are never silently wrapped, reparented, or rewritten. Unknown,
> future-version, family-ineligible, unsafe, unresolved, oversized, or
> renderer-incompatible content blocks only the candidate with an exact
> cause-owned repair path while the prior immutable public generation, raw
> candidate data, and recoverable draft remain intact; released history is
> never migrated on read, and deprecation removes a section from new insertion
> without making qualified existing content disappear. D7 creates no generic
> `children`, parent-pointer or independent-section database tree, rows,
> columns, arbitrary nesting, recursive Reusable Sections, style or breakpoint
> bag, dormant container flag, nested editor, tenant schema builder, plugin
> API, raw HTML/CSS/JavaScript, arbitrary iframe/embed or query surface, copied
> operational truth, silent unknown-block dropping, preview/public divergence,
> public original filenames or metadata, drag-only editing, destructive
> rollback, or promise that current Payload internals are permanent product
> architecture.

## Explicit non-decisions preserved

D7 still does not select the complete Rich Text toolbar or embed allowlist;
media upload, transformation, safety, retention, or Phase 29 transport;
source-backed forms, giving, lists, related content, or operational metrics;
Site theme controls; exact evidence-derived capacity limits; the future Option
C container catalog or depth; implementation; tickets; migration execution;
deployment; or cutover.

## Ratification

On 2026-08-21, the founder ratified the exact B-prime-R formulation above as
**Phase 23 D7**. The formulation is recorded without substantive change in the
Phase 23 decision log and ADR-0151. Ratification authorizes no implementation,
migration, provider adoption, issue publication, deployment, or production
change.
