# Phase 23 D11 — Payload and Lexical Primary-Source Research

- **Status:** Decision support for the founder-selected Phase 23 D11 Option
  B-prime. This document does not ratify D11, authorize implementation, choose
  a final video-provider catalog, or change any Payload, Lexical, database, or
  public-serving behavior.
- **Research date:** 2026-08-21
- **Question:** Is one bounded, versioned CMS Rich Text Profile with typed video
  embeds a sound contract for Phase 23, given Core's exact Payload and Lexical
  versions and the current direction of Payload 4?

## Evidence discipline

- **FACT** means the linked first-party documentation, repository source, npm
  artifact, or Core source directly supports the statement.
- **INFERENCE** means an Asym architectural conclusion drawn from those facts.
- The exact lockfile-resolved npm artifact outranks current online Payload examples
  when the APIs differ. Core is pinned to an internal Payload 4 build, not the
  current stable Payload release.
- Current Lexical documentation is useful for concepts, but an API introduced
  after Lexical 0.41 cannot be prescribed for Core until the dependency is
  upgraded and qualified.
- “Payload CRM” in the question is treated as **Payload CMS**. Payload can back
  CRM-adjacent products, but its relevant role here is the CMS authoring
  adapter; it is not Phase 23's public release authority.

## Executive conclusion

**B-prime is technically sound and is the lowest-complexity durable choice if
the profile is Asym-owned, code-defined, and explicitly versioned.** It should
not be implemented as an unconfigured `lexicalEditor()` default, a mutable
tenant toolbar, a raw-HTML field, or a custom iframe node.

The permanent shape is:

1. one small **ordinary-content Rich Text Profile Version** that explicitly
   lists every permitted semantic feature;
2. one code-owned Payload `BlocksFeature` entry for a typed `videoEmbed`, rather
   than arbitrary embed HTML or a bespoke Lexical node;
3. authoritative server validation plus a deterministic compiler from the
   accepted source tree into a provider-neutral public presentation
   projection;
4. a release manifest that pins the product profile, compiler, Payload build,
   and Lexical build together; and
5. an explicit qualification and migration process whenever any one of those
   versions changes.

This keeps authoring simple while insulating D1 Public Site Generations,
certified Presentation Packages, search, accessibility, and later migrations
from Payload-internal JSON churn.

## Verified version and authority matrix

| Surface                                       | Version verified on 2026-08-21                             | What it means for D11                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Core `payload`                                | `4.0.0-internal.1f9ae9a`                                   | This is an internal/prerelease build, not a stable Payload 4 contract. It must stay exactly pinned and qualified. |
| Core `@payloadcms/richtext-lexical`           | `4.0.0-internal.1f9ae9a`                                   | Its packaged code is the authority for the feature APIs Core can actually call.                                   |
| Lexical bundled by that rich-text package     | exact `0.41.0` dependencies                                | Lexical 0.41 serialization and import behavior is the compatibility baseline.                                     |
| Current stable Payload / rich-text package    | `3.88.0`                                                   | Stable online examples cannot be assumed to describe Core's internal v4 build exactly.                            |
| Current stable Lexical                        | `0.49.0`                                                   | Current Lexical docs may describe APIs newer than Core's 0.41 dependency.                                         |
| Checked-in `vendor/payload-upstream` snapshot | Payload `3.77.0`; rich-text package using Lexical `0.35.0` | It is useful historical context, but it is not matching source for Core's resolved internal v4 package.           |

Core's pins are visible in
[`package.json`](../../../package.json),
[`apps/admin/package.json`](../../../apps/admin/package.json), and
[`bun.lock`](../../../bun.lock). The vendor snapshot identifies itself in
[`vendor/payload-upstream/package.json`](../../../vendor/payload-upstream/package.json)
and
[`vendor/payload-upstream/packages/richtext-lexical/package.json`](../../../vendor/payload-upstream/packages/richtext-lexical/package.json).
The live npm registry metadata for the exact internal rich-text package also
declares the Lexical 0.41 dependency tuple:
[`@payloadcms/richtext-lexical@4.0.0-internal.1f9ae9a`](https://registry.npmjs.org/@payloadcms%2frichtext-lexical/4.0.0-internal.1f9ae9a).
The stable-version observations come from the dated live registry checks for
[`payload`](https://registry.npmjs.org/payload/latest),
[`@payloadcms/richtext-lexical`](https://registry.npmjs.org/@payloadcms%2frichtext-lexical/latest),
and [`lexical`](https://registry.npmjs.org/lexical/latest).

Payload's June 2026 first-party preview said Payload 4 was in active
development and presented its Admin redesign and Lexical work as upcoming.
The current upstream main package is a v4 canary, while npm's stable release
line remains v3. Consequently, a public “Payload 4” example is directional
evidence—not proof that an API exists in Core's exact build.

- [Payload 4 early-look announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more)
- [Payload upstream main package manifest](https://github.com/payloadcms/payload/blob/main/packages/payload/package.json)
- [Payload npm package](https://www.npmjs.com/package/payload)
- [Lexical npm package](https://www.npmjs.com/package/lexical)

## Current Core behavior

Core currently configures Payload with `editor: lexicalEditor()` and no
explicit `features` list in
[`apps/admin/payload.config.ts`](../../../apps/admin/payload.config.ts). In the
exact resolved rich-text artifact, omitting `features` selects Payload's broad
default editor feature set. That is a useful demonstration default, but it is
not the bounded D11 contract.

The exact artifact's default set includes:

- paragraph and headings H1 through H6;
- bold, italic, underline, strikethrough, subscript, superscript, and inline
  code;
- text alignment and indentation;
- unordered, ordered, and checklist lists;
- links, relationships, uploads, blockquotes, and horizontal rules; and
- the inline toolbar.

**INFERENCE:** Leaving that default in place creates silent product-scope
drift. A future Payload change could add or alter an editor feature without a
Phase 23 decision, and a tenant could store semantics that a certified public
package, search projection, or migration does not understand. D11 should build
the feature list explicitly and test its serialized grammar.

Exact artifact paths inspected inside the published npm tarball include:

- `package/dist/lexical/config/server/default.js`
- `package/dist/utilities/editorConfigFactory.js`
- `package/dist/lexical/config/server/sanitize.js`
- `package/dist/features/typesServer.d.ts`

## Payload findings

### 1. Payload supports a bounded editor profile directly

- **FACT:** Payload's `lexicalEditor` accepts an explicit feature list. A
  feature callback may also receive `defaultFeatures` and `rootFeatures`, and
  official examples demonstrate removing, replacing, and configuring
  features. [Payload Rich Text overview](https://payloadcms.com/docs/rich-text/overview)
- **FACT:** The exact internal package's `editorConfigFactory` uses its default
  feature set only when the configuration does not provide `features`.
- **FACT:** `HeadingFeature` accepts `enabledHeadingSizes`; its package default
  is H1 through H6.
- **FACT:** server features can register node validation, hooks, nested
  subfields, GraphQL population, type-generation changes, and output
  converters. The rich-text validator traverses nodes and invokes the
  configured node validators.

**INFERENCE:** D11 needs an explicit code-owned profile factory. It should not
spread `defaultFeatures` or `rootFeatures`, because that makes the persisted
grammar dependent on mutable provider configuration outside the profile.
Toolbar placement may vary for usability, but the toolbar must expose only
features in the same semantic allowlist.

### 2. The useful ordinary-content grammar is intentionally small

The evidence supports an initial profile containing only:

- paragraphs;
- H2, H3, and H4 headings;
- bold and italic;
- ordered and unordered lists;
- blockquotes;
- separators;
- bounded links; and
- exactly the typed video block described below.

It should omit H1, H5/H6, underline, strikethrough, subscript, superscript,
inline code, alignment, indentation, checklist, generic relationships,
generic uploads, arbitrary blocks, raw HTML, and tables unless a later
decision adds a semantic need and migration plan.

This is not merely UI simplification:

- H1 belongs to the Page or Article presentation contract, not free-form body
  content.
- alignment, indentation, and ad hoc visual formatting couple editorial data
  to a particular package's styling and degrade responsive consistency;
- generic relationship and upload nodes enlarge the authorization,
  projection, and migration surface; and
- Payload currently labels its Table feature experimental and warns it may
  break in a minor release.

- [Payload official feature catalog](https://payloadcms.com/docs/rich-text/official-features)

### 3. Typed video should use Payload's existing BlocksFeature seam

- **FACT:** Payload's `BlocksFeature` takes code-configured block definitions
  and stores their typed fields in a Lexical block node. It supports embedded
  content such as video, participates in Payload validation and type
  generation, and requires an explicit frontend converter.
  [Payload rich-text blocks](https://payloadcms.com/docs/rich-text/blocks)
- **FACT:** Payload's custom-feature guidance says to prefer BlocksFeature
  where it satisfies the use case and to create a custom Lexical feature only
  when it does not. [Payload custom rich-text features](https://payloadcms.com/docs/rich-text/custom-features)
- **FACT:** The exact internal package registers the block's Payload fields,
  validation wrapper, hooks, population rules, and generated types. Its block
  node has an explicit node version and imports its prior representation.

**INFERENCE:** A block-level `videoEmbed` is the correct seam. An inline video,
raw `<iframe>`, arbitrary URL-to-oEmbed record, or custom decorator node adds
complexity without a demonstrated D11 need.

A minimal durable source shape is conceptually:

```text
blockType: "videoEmbed"
provider: <one value from a small code-owned provider catalog>
providerResourceID: <canonical provider ID, not a URL or HTML>
accessibleName: <required human-readable title>
captionDisposition: <profile-defined accessibility review value>
startSeconds: <optional non-negative integer only if the provider adapter supports it>
```

The exact initial provider enum remains a D11 implementation-spec decision;
this research does not silently choose vendors. Each admitted provider needs
one reviewed adapter that owns ID parsing, canonicalization, embed URL
construction, CSP/frame policy, public rendering, and removal behavior.
Tenant-authored HTML, script, query-string bags, player parameters, and iframe
attributes are not data fields.

### 4. Payload links require narrower authoritative validation

- **FACT:** Payload's Link feature can expose custom URLs and internal document
  relationships. Its enabled internal collections derive from collection
  configuration unless explicitly bounded.
- **FACT:** The exact packaged Lexical Link node recognizes `http:`, `https:`,
  `mailto:`, `sms:`, and `tel:` on the client and sanitizes some invalid DOM
  output. It also contains node-shape migrations for prior serialized
  versions.
- **FACT:** Payload exposes feature and field validation on the server.

**INFERENCE:** Client link handling is a convenience, not the security or
product contract. D11 should explicitly allow only:

- stable internal D1 references to admitted public Page/Article identities;
- same-Page fragments that resolve to release-projected section IDs; and
- a small server-validated URI-scheme catalog chosen by the product contract.

No internal collection should become linkable merely because it happens to be
visible in Payload Admin. Public compilation must resolve internal references
through the same tenant, Site, locale, reach, lifecycle, and generation rules
as the rest of D1; it must not publish Payload document IDs or preview URLs.

Exact artifact paths inspected include:

- `package/dist/features/link/server/baseFields.js`
- `package/dist/features/link/nodes/LinkNode.js`

### 5. Public output should be compiled, not stored as duplicate mutable HTML

- **FACT:** Payload provides on-demand converters from Lexical JSON to JSX,
  HTML, plain text, and Markdown, and exposes `editorConfigFactory` for using
  the exact field configuration during conversion.
  [Payload converters](https://payloadcms.com/docs/rich-text/converters)
- **FACT:** Payload recommends on-demand HTML conversion and warns that a
  separate stored HTML field creates extra API work. It also requires explicit
  handling for images during HTML-to-Lexical conversion rather than silently
  uploading external content.
  [Payload HTML conversion](https://payloadcms.com/docs/rich-text/converting-html)

**INFERENCE:** D1 should compile a validated Rich Text Profile revision into a
neutral semantic public projection as part of the immutable Public Site
Generation. Certified tenant packages render that projection; they do not
interpret raw Payload/Lexical JSON themselves. Search/plain-text extraction,
SEO summaries, previews, and public rendering must use the same registered
compiler so their understanding of content cannot drift.

The projection must preserve semantics—heading level, list structure,
blockquote, link disposition, and typed video identity—without preserving
Payload implementation fields, editor-only node IDs, arbitrary class names,
or executable markup.

## Lexical findings

### 1. Lexical JSON is structured data, but not a durable product API by itself

- **FACT:** Lexical editor states are JSON-serializable, and custom nodes
  implement `exportJSON`, `importJSON`, and usually `updateFromJSON`.
- **FACT:** serialized nodes carry a string `type` and numeric `version`, but
  Lexical's documentation says the flat node `version` property is generally
  not recommended as the main evolution mechanism because versions do not
  compose safely across class inheritance. It recommends optional properties
  with defaults for backward-compatible changes and a new node type for an
  incompatible representation.
- **FACT:** Lexical does not guarantee runtime validation for every serialized
  property; TypeScript types do not validate untrusted persisted JSON.

- [Lexical 0.41 serialization documentation](https://github.com/facebook/lexical/blob/v0.41.0/packages/lexical-website/docs/concepts/serialization.md)
- [Lexical 0.41 node type definitions](https://github.com/facebook/lexical/blob/v0.41.0/packages/lexical/src/LexicalNode.ts)

**INFERENCE:** D11's Rich Text Profile Version must be external to Lexical's
per-node `version`. The profile owns the admitted node/field grammar and its
compiler. A compatible field addition should be optional with a deterministic
default. An incompatible video representation should receive a new block
slug/type or an explicit product migration, not an overloaded old node with a
meaning-changing version number.

### 2. Paste is an import boundary, not an exception to the profile

- **FACT:** In Lexical 0.41, HTML paste/import is implemented through DOM
  conversion maps and `@lexical/clipboard` / `@lexical/html`. Node-level
  `importDOM` and editor-wide HTML import/export configuration can influence
  the conversion.
  [Lexical 0.41 serialization and HTML import](https://github.com/facebook/lexical/blob/v0.41.0/packages/lexical-website/docs/concepts/serialization.md#html-property-for-import-and-export-configuration)
- **FACT:** Current Lexical documentation additionally describes extension
  APIs for DOM and clipboard import. Those newer APIs cannot be assumed to
  exist in Core's 0.41 dependency merely because they appear on the current
  website. [Current Lexical serialization docs](https://lexical.dev/docs/serialization/)

**INFERENCE:** Word, Google Docs, email, and website paste should flow through
one deterministic profile importer that keeps admitted semantics and removes
unsupported visual styling. The authoritative server validator then walks the
resulting tree; client normalization alone is insufficient.

The UX should be quiet but honest:

- harmless styling cleanup succeeds automatically and remains undoable;
- unsupported consequential content—images, iframes, tables, unknown embeds,
  or unrepresentable structure—does not disappear silently;
- the editor explains what could not be imported and offers plain-text paste
  where appropriate; and
- paste never performs an implicit upload or server-side fetch.

### 3. Custom-node power is not needed for the initial video feature

- **FACT:** Lexical supports custom Element, Text, and Decorator nodes. Custom
  node data must be JSON-serializable and requires import/export behavior and
  registration. A DecoratorNode can host rich React UI such as a video player.
  [Lexical node concepts](https://lexical.dev/docs/concepts/nodes)
- **FACT:** Lexical transforms run during updates before DOM reconciliation.
  They must be preconditioned and idempotent to avoid repeated transforms or
  update waterfalls. [Lexical transforms](https://lexical.dev/docs/concepts/transforms)

**INFERENCE:** A bespoke video node and a transform-based cleanup subsystem
would duplicate capabilities already supplied by Payload BlocksFeature and
would increase engine-upgrade cost. Use the provider block and ordinary
boundary validation. Reserve a custom node for a later proven interaction
that BlocksFeature genuinely cannot express.

## Recommended D11 product contract

### Profile identity and release binding

Define one immutable code-owned profile such as
`ordinary_rich_text@1`. The specific identifier is illustrative; the accepted
spec should choose the canonical name. Each persisted revision records its
profile version, and each D1 generation pins an exact tuple:

```text
Rich Text Profile Version
Payload package build
Lexical package build
rich-text compiler version
typed-video provider-catalog version
```

That tuple is evidence, not five independent tenant settings. Staff see one
simple content editor. Tenant users cannot add features, providers, nodes,
HTML, or plugins to the grammar through mutable configuration.

### Authoritative validation

Before preview or release compilation, one server-side validator must prove:

- the exact profile version is recognized;
- every node type and child relationship is admitted;
- heading levels and formatting marks are in the allowlist;
- tree depth, node count, total text, link count, and block count are within
  documented operational limits;
- every link passes tenant/Site/locale/reach and URI-policy validation;
- every block is exactly the admitted `videoEmbed` shape;
- provider IDs and optional fields pass the selected provider adapter;
- accessibility-required fields are complete; and
- no raw HTML, script, unknown field, unknown node, or unknown provider reaches
  public compilation.

Invalid or future-version content stays recoverable in its draft. It is never
silently truncated, “repaired” by dropping unknown nodes, or published using a
best-effort fallback.

### Revision and migration rules

- A profile revision is immutable once content or a public generation refers
  to it.
- Removing a toolbar button does not migrate existing JSON. Stored nodes must
  be inventoried and migrated explicitly before their feature is no longer
  accepted.
- Payload exposes `upgradeLexicalData`, which traverses documents and re-saves
  rich-text values so automatic node conversions run.
  [Payload rich-text migration](https://payloadcms.com/docs/rich-text/migration)
- Because that utility re-saves documents, **INFERENCE:** it is a migration
  mechanism, not a safe production startup hook. Any use needs a tenant- and
  collection-bounded plan, dry run, backup/restore proof, resumable checkpoints,
  content hashes, hook/side-effect review, idempotence proof, and before/after
  fixture comparison.
- The stale checked-in Payload vendor snapshot must not be used to design or
  debug internal-v4 behavior. Dependency upgrades should either inspect the
  exact published artifacts or deliberately refresh a source snapshot with an
  identified upstream commit.

### Public rendering boundary

The public compiler rejects a source revision unless its entire profile tuple
is recognized. It then emits deterministic semantic projection data. The
certified package receives that projection plus code-owned renderer contracts.
It cannot:

- fetch arbitrary author-supplied URLs during compilation;
- execute source HTML or script;
- weaken link, iframe, CSP, or accessibility rules;
- invent a second source of video truth;
- reinterpret an unknown node; or
- query mutable “latest editor content” outside the pinned D1 generation.

## Adversarial technical findings and permanent guardrails

| Concern                              | What could go wrong                                                                                                       | Severity / likelihood          | Permanent prevention                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Default-feature drift                | `lexicalEditor()` admits formatting, uploads, relationships, or later defaults that the product never decided to support. | High / likely without a change | Explicit feature list; serialized-grammar fixtures; no spread of provider defaults.                               |
| Prerelease dependency drift          | Internal Payload v4 or current online docs change API or storage behavior.                                                | High / medium                  | Exact pins and lock integrity; inspect exact artifacts; upgrade qualification gate.                               |
| Stale source mismatch                | Developers reason from the 3.77/0.35 vendor tree while production uses internal v4/0.41.                                  | High / likely                  | CI/documented version tuple; matching-source rule; fail reviews that cite the stale snapshot as exact.            |
| Raw Lexical coupling                 | Every package, search job, and export learns provider-specific JSON and drifts independently.                             | High / medium                  | One validated neutral compiler/projection; packages consume only that contract.                                   |
| Flat node-version misuse             | An incompatible change reuses a node type and old content is interpreted under new semantics.                             | High / medium                  | External profile version; additive defaults; new type or explicit migration for incompatible changes.             |
| Paste data loss                      | Complex pasted content is silently dropped or produces nodes outside the profile.                                         | Medium / high                  | Deterministic importer, authoritative tree validation, visible consequential omissions, undo/plain-text fallback. |
| Arbitrary video embed                | Author-supplied iframe/HTML enables tracking, spoofing, XSS, broken CSP, or provider lock-in.                             | Critical / medium              | Code-owned provider enum and adapter; canonical resource ID only; no HTML, script, or arbitrary oEmbed.           |
| Client-only link safety              | DOM sanitization differs from stored data or internal relationships bypass public reach.                                  | High / medium                  | Server allowlist and D1 reference resolution; compiler-generated public URLs.                                     |
| Duplicate mutable HTML               | Source JSON and stored HTML disagree after edits, migration, or converter changes.                                        | Medium / medium                | One canonical source tree and immutable release projection; no authoritative mirror HTML field.                   |
| Unknown-node destruction             | A downgrade or profile change loads content it cannot understand and saves it back without data.                          | High / low-to-medium           | Block edits/releases on unknown versions; preserve raw draft; require explicit migration.                         |
| Bulk-resave side effects             | A Lexical upgrade job triggers hooks, revisions, timestamps, notifications, or partial migration.                         | High / medium                  | Offline rehearsal, bounded resumable migration, side-effect inventory, hashes, idempotence, rollback.             |
| Table/editor-feature experimentation | A seemingly convenient feature introduces unstable schema and rendering obligations.                                      | Medium / medium                | Exclude experimental features until separately decided and migration-qualified.                                   |

## Qualification and test evidence required before shipping

### Exact-version contract tests

- Assert the installed Payload, rich-text, and Lexical versions and the
  expected feature catalog.
- Fail if the default feature catalog leaks into the bounded profile.
- Generate types and prove `videoEmbed` has the expected closed field shape.
- Keep golden serialized fixtures for every admitted node and video provider.

### Import and adversarial validation tests

- Paste fixtures from Word, Google Docs, common HTML, plain text, and malformed
  HTML.
- Exercise H1/H5, tables, images, iframe, script, unsupported protocols,
  cross-tenant relationships, unknown blocks, unknown node versions, excessive
  depth/size, duplicate editor IDs, and deliberately malformed JSON.
- Prove API and Local API writes cannot bypass the same server validation used
  by Admin.
- Prove rejected content remains recoverable and does not alter the current D1
  public generation.

### Compiler and presentation tests

- Golden-test Lexical source → neutral projection → public HTML/plain text for
  every admitted semantic feature.
- Prove deterministic output from the same source/profile/compiler tuple.
- Run each certified Presentation Package against the same conformance corpus.
- Verify headings, lists, quotes, link focus/keyboard behavior, accessible video
  names, captions/transcript disposition, responsive embeds, reduced motion,
  CSP/frame policy, and failure placeholders.

### Upgrade and migration tests

- Re-run the complete corpus before any Payload, rich-text, or Lexical upgrade.
- Test N → N+1 and rollback/read-only behavior with old and new profile data.
- Compare content hashes and semantic projections before and after an upgrade;
  explain every intended change.
- Exercise interrupted, resumed, repeated, and failed migrations without
  duplicate revisions or external side effects.

## Decision-ready formulation supported by this evidence

The research supports the following hardening of B-prime:

> **B-prime-amended-and-hardened (B-prime-R) — one bounded, code-owned and
> immutable CMS Rich Text Profile Version for ordinary Page and Article body
> content, explicitly admitting only paragraphs, H2–H4, bold, italic, ordered
> and unordered lists, blockquotes, separators, source-qualified links, and one
> typed block-level video embed whose small provider catalog stores canonical
> resource identity rather than URL, iframe, HTML, script, or arbitrary oEmbed
> state; authoring through Core's exactly pinned Payload
> `4.0.0-internal.1f9ae9a` / Lexical `0.41.0` adapter with quiet deterministic
> paste cleanup, visible consequential omissions, authoritative server tree
> validation, and recoverable invalid or unknown-version drafts; compiling the
> accepted source through one versioned neutral semantic projection for D1
> Public Site Generations, search, preview, export, accessibility, and every
> certified Presentation Package, while pinning the exact profile, compiler,
> provider catalog, Payload build, and Lexical build in release evidence and
> qualifying every dependency or grammar change with corpus, migration,
> rollback, and public-render conformance proof—without Payload defaults as
> product policy, tenant-authored plugins or HTML, raw Lexical JSON in public
> packages, duplicate mutable HTML truth, implicit uploads or network fetches,
> client-only validation, experimental tables, silent node loss, or a bulk
> re-save masquerading as a routine startup upgrade.**

This formulation is evidence-supported but remains unratified until the
founder accepts it in the Phase 23 grill.

## Primary sources

### Core and exact resolved artifacts

- [`package.json`](../../../package.json)
- [`apps/admin/package.json`](../../../apps/admin/package.json)
- [`apps/admin/payload.config.ts`](../../../apps/admin/payload.config.ts)
- [`bun.lock`](../../../bun.lock)
- [`web-studio-living-spec.md`](../../guides/architecture/web-studio-living-spec.md)
- [npm registry metadata for the exact internal rich-text artifact](https://registry.npmjs.org/@payloadcms%2frichtext-lexical/4.0.0-internal.1f9ae9a)
- [npm tarball for the exact internal rich-text artifact](https://registry.npmjs.org/@payloadcms/richtext-lexical/-/richtext-lexical-4.0.0-internal.1f9ae9a.tgz)
- [`vendor/payload-upstream/package.json`](../../../vendor/payload-upstream/package.json)
- [`vendor/payload-upstream/packages/richtext-lexical/package.json`](../../../vendor/payload-upstream/packages/richtext-lexical/package.json)

### Payload first-party documentation

- [Rich Text overview](https://payloadcms.com/docs/rich-text/overview)
- [Official features](https://payloadcms.com/docs/rich-text/official-features)
- [Rich-text blocks](https://payloadcms.com/docs/rich-text/blocks)
- [Custom features](https://payloadcms.com/docs/rich-text/custom-features)
- [Converters](https://payloadcms.com/docs/rich-text/converters)
- [HTML conversion](https://payloadcms.com/docs/rich-text/converting-html)
- [Migration](https://payloadcms.com/docs/rich-text/migration)
- [Payload 4 early-look announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more)

### Lexical first-party documentation and source

- [Lexical 0.41 serialization](https://github.com/facebook/lexical/blob/v0.41.0/packages/lexical-website/docs/concepts/serialization.md)
- [Lexical 0.41 node source](https://github.com/facebook/lexical/blob/v0.41.0/packages/lexical/src/LexicalNode.ts)
- [Lexical node concepts](https://lexical.dev/docs/concepts/nodes)
- [Lexical transforms](https://lexical.dev/docs/concepts/transforms)
- [Current Lexical serialization documentation](https://lexical.dev/docs/serialization/)
