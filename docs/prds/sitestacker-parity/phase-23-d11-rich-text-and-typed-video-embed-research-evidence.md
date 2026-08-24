# Phase 23 D11 CMS Rich Text and Typed Video Embeds — Decision Brief and Research Evidence

- **Status:** Founder-ratified Phase 23 D11 —
  B-prime-amended-and-hardened (B-prime-R), after adversarial hardening.
- **Date:** 2026-08-21
- **Authority:** Research and decision support only. This document does not
  authorize implementation, schema work, data migration, provider adoption,
  issue publication, deployment, release activation, or a production change.

## Decision seam

Phase 23 D7 makes Rich Text one semantic Page/Article leaf and forbids it from
becoming a nested layout builder. D1 compiles exact provider-owned revisions
into immutable public generations. D9 permits qualified presentation packages
to style semantic content without owning it. D1–D10 do not yet decide the
editor grammar, stored source encoding, link representation, paste behavior,
video provider contract, accessibility proof, migration path, or compatibility
policy.

The decision is therefore:

> Can Asym give ordinary Page and Article authors one familiar, capable rich
> text editor—including safe video inside prose—without exposing Payload's
> whole default feature set, binding public content to an unstable Payload v4
> encoding, creating a second rich-text system, or silently damaging pasted
> content?

## Executive verdict

**Keep B-prime, but harden its authority boundary.** The sound permanent design
is one small, code-owned and versioned **CMS Rich Text Profile**. Payload's
Lexical integration is the sole qualified CMS authoring adapter, but neither
the Payload feature list nor Lexical JSON is the public product contract. The
D1 compiler validates the exact profile and produces one provider-neutral
semantic projection for preview, public rendering, plaintext, search, export,
and migration. Tiptap remains a separate editor for its already-owned product
purposes and never reads, writes, or round-trips the same CMS field.

The important correction is version posture. As of 2026-08-21, Payload's
latest stable npm release is `3.88.0`; `4.0.0-canary.28` is canary and
`4.0.0-internal.af6aad0` is internal. Payload's own June 2026 announcement
describes 4.0 as work in progress and targets a beta in a future quarter. The
repo pins the older `4.0.0-internal.1f9ae9a` family and Lexical `0.41.0`.
Consequently, D11 must not promise a Payload v4 API or serialized shape as
stable. The eventual adapter must qualify one exact version and be replaceable
without rewriting D11 or the public runtime.

## Settled predecessor boundaries

D11 inherits and may not weaken these decisions:

- D1 remains the sole ordinary public-serving authority. Rich Text publication
  occurs only inside an exact immutable Public Site Generation selected by its
  serving head.
- D7 owns the ordinary semantic section catalog. Rich Text remains one leaf;
  it may contain typed prose nodes but no Payload block nesting, columns,
  galleries, forms, arbitrary widgets, or recursive layout composition.
- D8 reusable sections may wrap one complete Rich Text leaf, but Rich Text may
  not contain reusable-section references.
- D9 presentation packages style the semantic projection. Author-entered font,
  size, color, alignment, margins, HTML, CSS, and animation are not content.
- D10 Site Presentation activation does not publish or rewrite Rich Text.
- Phase 10 remains the public ceiling and can suppress adverse content without
  waiting for an ordinary positive release.
- Phase 22 continues to own specialized Missionary Ministry and
  Project/Campaign Page content and Ministry Updates. D11 does not silently
  convert those workflows into ordinary CMS Rich Text.
- Phase 24 will own locale lifecycle and translation status. D11 stores and
  validates one exact locale revision; it creates no translation automation or
  fallback truth.
- Phase 29 will own generalized media. D11's video node is only a bounded
  external provider reference and does not become a video DAM or upload
  pipeline.

## Current repository evidence

The current code is a useful prototype but too broad to be the D11 contract:

- `apps/admin/payload.config.ts` installs one root `lexicalEditor()` with no
  explicit feature profile. Payload therefore supplies its opinionated default
  feature set.
- `apps/admin/src/cms/collections/pages.ts` contains a legacy Page `content`
  rich-text field, while `apps/admin/src/cms/collections/page-builders.ts`
  contains the newer Rich Text section `body` plus a legacy fallback path.
- `apps/admin/src/cms/public/published-content-reader.ts` intentionally passes
  Lexical JSON through after replacing populated upload/relationship documents
  with IDs.
- `packages/api/src/cms/public/serializer.ts` likewise passes Page `content`
  and Rich Text `body` values without an exact node, mark, or attribute
  allowlist.
- `packages/api/src/cms/public/serialized.ts` consequently types public Rich
  Text as `unknown`. Existing serializer/reader tests prove pass-through and
  relationship-value reduction, not an exhaustive semantic grammar.
- `packages/lib/cms/public-page-renderer.tsx` is a second permissive interpreter:
  it accepts `unknown`, has its own weaker URL sanitizer, supports H1–H6, and
  silently converts an unrecognized node with children to a generic `div` or
  drops a leaf. That behavior is useful prototype tolerance but invalid release
  semantics because content loss can look successful.
- Page templates and Phase-22 Ministry Updates also currently use generic Rich
  Text fields. D11 therefore needs field/source-family profile binding; it must
  not widen Phase 22 D20's embed prohibition or migrate specialized content by
  collection-name coincidence.
- Current CMS media custody is image-oriented. D11 must not turn it into a
  video-byte store merely to support external typed video; Phase 29 remains the
  owner of generalized media.
- The repo also contains a shared Tiptap editor for other product surfaces.
  Reusing it for CMS merely because it exists would create two competing CMS
  source formats and a permanent conversion burden.
- Root dependencies pin Payload and `@payloadcms/richtext-lexical` to
  `4.0.0-internal.1f9ae9a`; `bun.lock` pins Lexical `0.41.0`. These are exact
  implementation facts, not durable product semantics.

The permanent fix is not another rich-text table or a second document head. It
is one field-level profile adapter, one server validation/compiler boundary,
and one generated public projection over the existing D7 leaf.

## Current primary-source research

### Payload and Lexical

Payload allows a field to replace or prune every root/default Lexical feature.
That is necessary here because Payload's defaults include underline,
strikethrough, subscript, superscript, inline code, H1–H6, alignment,
indentation, checklists, arbitrary relationships, uploads, and horizontal
rules—far more than D11 needs. Payload also labels its table feature
experimental and warns that it may receive breaking changes even within a
stable Lexical release.

Payload supports server feature validation, hooks, and converters for custom
nodes, and its rich-text field accepts backend validation. These are useful
adapter seams, not a reason to expose provider defaults or let the browser
toolbar become policy.

- [Payload Rich Text overview](https://payloadcms.com/docs/rich-text/overview)
- [Payload official Rich Text features](https://payloadcms.com/docs/rich-text/official-features)
- [Payload custom Rich Text features and validation](https://payloadcms.com/docs/rich-text/custom-features)
- [Payload Rich Text field](https://payloadcms.com/docs/fields/rich-text)
- [Payload Rich Text blocks](https://payloadcms.com/docs/rich-text/blocks)
- [Payload 4.0 early-look announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more)
- [Payload releases](https://github.com/payloadcms/payload/releases)
- [Payload npm package versions](https://www.npmjs.com/package/payload?activeTab=versions)

The exact-package and source inspection supporting these conclusions is
preserved separately in the
[D11 Payload and Lexical primary-source note](./phase-23-d11-payload-lexical-primary-source-research.md).

Lexical deliberately treats Editor State rather than DOM/HTML as source truth,
creates immutable serializable snapshots, and reconstructs nodes by stable
type. Its current serialization documentation recommends optional fields and
defaults, warns that a single inherited flat `version` property does not
compose safely, and says a genuinely incompatible representation should use a
new node type. HTML import is explicitly the interoperability and paste seam,
not the durable content contract.

This supports an exact source grammar and explicit adapters. It does not
support storing arbitrary HTML, accepting unknown JSON, or assuming a Lexical
node's internal `version` field is enough for Asym's long-lived schema policy.

- [Lexical Editor State](https://lexical.dev/docs/concepts/editor-state)
- [Lexical Nodes](https://lexical.dev/docs/concepts/nodes)
- [Lexical serialization and versioning](https://lexical.dev/docs/serialization/)
- [Lexical node transforms](https://lexical.dev/docs/concepts/transforms)

### Comparable modern structured-content systems

Sanity Portable Text and Contentful Rich Text both store structured JSON,
separate meaning from presentation, allow an exact configured set of marks and
nodes, model internal links as references, and require explicit renderers for
embedded semantic objects. Contentful exposes node-type and linked-content
validations. Sanity explicitly supports different bounded profiles and paste
handlers. These are strong evidence for a small profile and typed video node,
not arbitrary HTML or every possible formatting control.

- [Sanity Block Content and Portable Text](https://www.sanity.io/docs/studio/block-content)
- [Sanity Portable Text Editor configuration](https://www.sanity.io/docs/studio/portable-text-editor-configuration)
- [Contentful Rich Text concepts](https://www.contentful.com/developers/docs/concepts/rich-text/)
- [Contentful Rich Text validation](https://www.contentful.com/developers/docs/tutorials/general/getting-started-with-rich-text-field-type/)

### Security, privacy, and accessibility

OWASP warns that React does not make `javascript:` or `data:` URLs safe and
that `dangerouslySetInnerHTML` remains an escape hatch. It recommends
context-appropriate encoding, validation, safe sinks, and sanitization when
HTML authoring is unavoidable. D11 avoids the harder problem by never storing
or rendering author HTML and by generating every element and iframe from
typed data.

The video insertion flow performs no server-side fetch of an author-supplied
URL. This removes the primary SSRF path. If a future product retrieves remote
metadata, it must be separately qualified with exact provider endpoints,
redirect denial, DNS/IP reproof, response/time limits, and no private-network
reachability.

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

W3C guidance supports a logical heading hierarchy, captions for prerecorded
audio in synchronized video, and descriptive iframe titles. These checks must
be made in the complete Page preview because one isolated Rich Text leaf cannot
know the headings contributed by surrounding semantic sections or a qualified
presentation package.

- [W3C heading structure guidance](https://www.w3.org/WAI/tutorials/page-structure/headings/)
- [WCAG 2.2 prerecorded captions](https://www.w3.org/WAI/WCAG22/Understanding/captions-prerecorded.html)
- [W3C iframe title technique](https://www.w3.org/WAI/WCAG22/Techniques/html/H64)

YouTube offers privacy-enhanced embedding, while Vimeo documents that its
`dnt` parameter prevents nonessential new cookies but cannot prevent the
browser from sending pre-existing Vimeo cookies and still permits essential
security cookies. Neither feature means “no third-party request” or “no
tracking.” A click-to-load treatment is therefore the clearest truthful
default.

- [YouTube privacy-enhanced embeds](https://support.google.com/youtube/answer/171780)
- [Vimeo player cookies and DNT](https://help.vimeo.com/hc/en-us/articles/26080940921361-Vimeo-Player-Cookies/)
- [Vimeo player parameters](https://help.vimeo.com/hc/en-us/articles/12426260232977-About-Player-Parameters)

## Proposed CMS Rich Text Profile Version 1

### Exact semantic grammar

Profile version 1 permits only:

- a document root;
- paragraphs and explicit line breaks;
- headings H2, H3, and H4—Page/Article title remains the sole H1;
- ordered and unordered lists with a measured code-owned maximum nesting
  depth;
- block quotes;
- text with bold and italic emphasis;
- one typed internal, external HTTPS, email, or phone link annotation; and
- one atomic typed YouTube or Vimeo video node.

The launch profile excludes:

- H1, H5, and H6;
- underline, strike-through, subscript, superscript, inline code, highlight,
  font, size, color, alignment, indentation, or arbitrary inline style;
- checklists, tables, code blocks, footnotes, horizontal rules, manual anchors,
  arbitrary relationships, inline uploads, images, files, galleries, forms,
  queries, arbitrary Payload block entries or nested composition, reusable
  sections, custom tenant nodes, raw HTML/Markdown/MDX, iframe/embed code,
  scripts, CSS, and arbitrary providers.

This is not a claim that excluded features are universally bad. Tables need a
real header/caption/mobile-editing contract; footnotes need stable identities
and backlinks; code is not a common nonprofit authoring need; and inline media
duplicates D7 Media/Gallery and Phase 29. Each can be added later as a new
profile version only after its complete semantics, UX, migration, public
renderer, and accessibility proof exist.

### Links

The author chooses one plain purpose rather than editing a raw relationship:

1. **Page on this website** — stable typed reference to one eligible ordinary
   Page or Article in the exact Tenant × environment × Site × locale.
2. **Web address** — normalized absolute HTTPS URL.
3. **Email address** — normalized `mailto:` destination.
4. **Phone number** — normalized `tel:` destination.

Version 1 stores the normalized email address or phone number itself, not an
arbitrary `mailto:` header/query bag or provider-specific dialing script.

Internal targets always open in the current context. External HTTPS links also
open in the current context by default. An advanced **Open in a new tab**
choice is allowed only for external HTTPS links; the renderer supplies the
safe `rel` behavior and a visible/assistive indication. Authors never type
`rel` tokens.

Every link requires meaningful non-whitespace text. The server rejects unsafe
or disguised schemes, control characters, malformed hosts, wrong-scope
internal IDs, and ineligible/private/retired internal targets. Remote URL
availability is not checked synchronously and is never a release claim.
Manual same-page anchors are excluded from version 1 because heading-text
fragments are brittle and Lexical node keys are not durable public IDs. A
future stable-anchor capability must store a source-owned semantic anchor ID,
not a generated fragment or raw DOM selector.

### Typed video

Authors see one **Add video** flow:

1. Paste a YouTube or Vimeo share/watch URL.
2. The client parses only documented exact host/path shapes into a provider
   enum and canonical public resource ID. It performs no remote fetch.
3. Confirm the visible video title.
4. Choose **Captions are available** or **This video is a clearly labeled media
   alternative to equivalent text on this Page**. The release is blocked when
   neither is true.
5. Review one responsive, keyboard-operable preview and insert.

Stored video data contains only the profile/node kind, exact supported provider,
canonical resource ID, optional bounded start time, author-supplied accessible
title, accessibility disposition, and any source-owned approved local poster
reference that an owning media phase later permits. It never stores iframe
HTML, arbitrary URL/query parameters, provider scripts, mutable oEmbed output,
cookies, tokens, account IDs, autoplay, or a provider response blob.

Public rendering is code-owned and initially shows a neutral local placeholder,
title, provider, and **Play video** action. Only an intentional action loads the
provider iframe. The renderer uses YouTube's privacy-enhanced host or Vimeo
`dnt=1`, a descriptive iframe title, no autoplay, a minimal permissions policy,
the narrowest workable sandbox, an explicit referrer policy, responsive aspect
ratio, CSP `frame-src` allowlisting, and an accessible fallback link. The UI
must not claim that either provider mode is cookie-free.

Removed, private, region-blocked, or temporarily unavailable provider content
does not break the Page. The typed node remains intact and renders a clear
fallback. Provider availability is a separately observed integration fact, not
CMS publication truth.

At the exact-qualified Payload adapter seam, this single block-level product
node should use one closed code-owned `BlocksFeature` definition when that
version's supported API satisfies the contract. Payload itself recommends that
seam before a bespoke Lexical feature. This does not admit a generalized
Payload block drawer, nested D7 composition, or provider-shaped public data;
the source compiler accepts only the one exact video block and emits the same
provider-neutral semantic node.

### Paste and import behavior

Paste is a staged transformation, never “accept arbitrary HTML and clean it
later.”

- Supported semantic structure is preserved.
- Font, color, size, margins, tracking attributes, classes, comments, hidden
  content, event handlers, and unsafe HTML are discarded before content enters
  editor state.
- A cosmetic-only cleanup inserts the result immediately and shows one quiet,
  undoable **Formatting cleaned** notice. It does not interrupt routine work.
- Meaning-bearing unsupported content—such as a table, image, iframe, footnote,
  or code block—is not silently dropped. A concise review identifies the exact
  unsupported items and offers only **Convert to plain text**, **Keep the
  supported text**, or **Cancel paste** where those outcomes are truthful.
- Malformed or excessively large clipboard input fails safely without changing
  the document. The existing draft remains recoverable.
- The product never claims perfect fidelity: browsers and source applications
  may omit semantics from the clipboard before Asym receives it.

Word, Google Docs, LibreOffice, plain text, RTL, CJK, emoji, combining marks,
zero-width characters, nested lists, large selections, and adversarial HTML
need a versioned fixture corpus. Clipboard bodies and authored prose are never
written to telemetry.

### Authoring UX

The default editor is intentionally calm:

- one visible toolbar with **Style**, **Bold**, **Italic**, **Link**, **List**,
  **Quote**, and **Video**;
- text labels or accessible tooltips, visible keyboard focus, announced state,
  and complete keyboard operation;
- paragraph/H2/H3/H4 choices named by meaning, not by visual size;
- contextual drawers for links and video, not raw JSON or provider fields;
- undo/redo, predictable selection restoration, autosave status inherited from
  the later document-lifecycle decision, and no destructive cleanup on load;
- a whole-Page preview in the exact D9 presentation package for heading order,
  reflow, links, video, reduced motion, and locale direction; and
- inline errors attached to the exact item, with one plain repair action.

The editor may offer slash commands as a convenience, but the slash menu is
never the only way to discover or operate a feature. Phone-sized editing must
remain usable, but the product should not force a desktop toolbar into an
unusable horizontal strip.

### Validation and compilation

One code-owned **CMS Rich Text Profile Version** is the sole semantic authority.
The Payload feature adapter, TypeScript types, server validator, paste
transformer, D1 compiler, preview/public renderer, plaintext extractor, search
projector, exporter, and migration tools consume that same authority. They may
have purpose-specific code, but they may not maintain contradictory hand-written
grammars.

Validation occurs at three complementary seams:

1. **Editor guidance** prevents routine invalid input and explains repair.
2. **Payload/backend validation** rejects unknown/disallowed nodes, marks,
   attributes, protocols, scopes, counts, depth, malformed JSON, and invalid
   typed-video data regardless of client.
3. **D1 release compilation** revalidates source revision and profile version,
   resolves typed internal references, validates the complete Page heading
   outline and presentation/package compatibility, and emits a sealed
   provider-neutral semantic projection.

The D1 generation pins the source revision, CMS Rich Text Profile Version,
compiler/runtime compatibility, resolved internal targets, and projection
digest. Preview, public rendering, plaintext, search, sitemap/metadata snippets,
export, and accessibility tests use the same semantic projection or a
provably-equivalent converter. Public routes never interpret raw HTML or query
mutable Payload `latest` content.

Payload/Lexical JSON remains private authoring source. The compiled projection
is derived and never independently edited. This avoids both provider lock-in
and a second content truth.

### Versioning and compatibility

- The profile carries its own code-owned schema identity outside Lexical node
  inheritance; D11 does not rely on Lexical's flat node `version` field as the
  product migration authority.
- Additive optional fields use explicit defaults. An incompatible node shape
  receives a new semantic node kind or profile version and an explicit pure,
  idempotent migration.
- Saved source is never mutated merely because it was read or rendered. A
  migration produces an explicit successor revision, preview, proof report,
  and audit record and never auto-publishes.
- Every traffic-serving runtime remains able to render every active/retained
  profile generation. Expand-compatible code ships before a new profile is
  published; old readers retire only when no active generation or retained
  client depends on them.
- An unknown or unsupported node blocks only the affected successor release
  with a stable repair cause. The last compatible public generation keeps
  serving. A defensive runtime fallback prevents a whole-route 500 and emits a
  content-safe incident, but it is not treated as successful rendering.
- Any Payload v4 adapter is qualified against one exact package build. Canary,
  internal, main-branch, announcement, or current-doc behavior is not accepted
  merely because it is named v4. The product contract stays usable with a
  supported stable Payload release or a later qualified v4 build.

### Bounds without arbitrary database machinery

Version 1 uses measured code-owned limits for document characters, serialized
bytes, total nodes, tree depth, list depth, link count, and video count. Exact
numbers are implementation evidence derived from production-shaped authoring,
compile, render, search, and migration tests; they are not tenant-editable
knobs or hidden database rows.

Rich Text remains JSON inside the owning Payload revision and a semantic leaf
inside D1. There are no normalized per-node tables, node-level RLS policies,
plugin-per-tenant schemas, rich-text workflow engine, second draft head, or
separate mutable “current profile” row. Public generations may contain a
compiled projection and indexes appropriate to D1; those are derived artifacts,
not authoring truth.

## Adversarial review

### 1. Brittleness — concern: **Yes**

- **What could go wrong:** The editor toolbar, backend validator, public
  renderer, paste converter, and search/plaintext converter accept different
  node sets; a Payload/Lexical upgrade then silently changes stored or rendered
  behavior.
- **Why it matters:** One accepted draft can fail at release, lose content in
  public output, or become unreadable after an upgrade.
- **Severity:** High.
- **Likelihood without controls:** High; the current root editor uses Payload's
  broad defaults while the public path passes JSON through.
- **Permanent prevention:** One versioned semantic profile consumed by every
  adapter; exact package qualification; compatibility fixtures; fail-closed D1
  compilation; retain old readers and public generations.

### 2. Technical debt — concern: **Yes**

- **What could go wrong:** Asym duplicates allowlists in several packages,
  introduces ad hoc video nodes, or converts between Tiptap, Lexical, HTML, and
  Markdown during normal editing.
- **Why it matters:** Every feature and upgrade becomes a multi-format migration
  with inconsistent security and accessibility behavior.
- **Severity:** High.
- **Likelihood without controls:** High because both editor ecosystems already
  exist in the repo.
- **Permanent prevention:** Lexical is the sole CMS authoring adapter; Tiptap
  remains purpose-separated; one provider-neutral compiled projection; no
  live dual-write or round-trip; one registry and test corpus.

### 3. Edge cases — concern: **Yes**

- **What could go wrong:** Empty roots, malformed JSON, enormous pastes,
  unsupported Word tables, deep lists, RTL/CJK text, emoji/combining marks,
  duplicate links, video URL variants, removed videos, wrong-locale internal
  targets, or an old node shape can break save, release, or render.
- **Why it matters:** These are normal real-world authoring inputs, not exotic
  attacks, and silent flattening can change meaning.
- **Severity:** High.
- **Likelihood without controls:** High.
- **Permanent prevention:** Versioned fixture corpus, measured structural
  bounds, parser fuzz/property tests, explicit unsupported-paste review, typed
  fallback states, and old-generation continuity.

### 4. Footguns — concern: **Yes**

- **What could go wrong:** A developer spreads Payload `defaultFeatures`, adds
  arbitrary `BlocksFeature` entries or `UploadFeature`, renders arbitrary HTML,
  accepts any iframe, fetches pasted URLs server-side, or treats client toolbar
  restrictions as authorization.
- **Why it matters:** One small configuration change could expose scripts,
  private relationships, operational documents, or uncontrolled presentation.
- **Severity:** Critical.
- **Likelihood without controls:** Medium-high; all are easy extension paths in
  modern rich-text frameworks.
- **Permanent prevention:** Explicit feature array from the profile, backend
  structural validation, code-owned safe renderers, no raw HTML/iframe, no
  insertion-time fetch, lint/contract tests, and review ownership for profile
  changes.

### 5. Tenant safety — concern: **Yes**

- **What could go wrong:** An internal link or populated Payload relationship
  carries a valid ID from another Tenant, Site, environment, or locale; a Local
  API call runs with access override; a public projection leaks the populated
  document.
- **Why it matters:** Rich Text is public content, so a scope mistake becomes a
  direct cross-tenant disclosure.
- **Severity:** Critical.
- **Likelihood without controls:** Medium; the current reader strips populated
  documents but does not establish D11's complete reference grammar.
- **Permanent prevention:** Exact composite scope on internal reference
  resolution, `overrideAccess: false` for actor-scoped Local API use, canonical
  permission checks, ID-only source records, provider-neutral public
  projection, and cross-scope negative tests.

### 6. Over-engineering — concern: **Yes**

- **What could go wrong:** The response becomes a generic document AST
  platform, per-tenant plugin system, normalized node database, arbitrary embed
  registry, or universal bi-directional editor converter.
- **Why it matters:** It would turn a small authoring need into a new CMS engine
  and make ordinary writing harder to operate.
- **Severity:** High.
- **Likelihood without controls:** Medium because Lexical and Payload are
  extremely extensible and D9 supports bespoke presentation packages.
- **Permanent prevention:** One closed launch grammar, two video providers, no
  tenant node/plugin configuration, no per-node rows, and additive profile
  versions only for demonstrated needs. The provider-neutral projection stays
  deliberately smaller than Lexical, not more general.

### 7. UX/UI and user friction — concern: **Yes**

- **What could go wrong:** Payload's full default toolbar overwhelms ministry
  staff; silent paste cleanup loses tables/images; errors appear only at
  publication; video privacy/accessibility fields read like legal or technical
  jargon; mobile controls overflow.
- **Why it matters:** Staff will paste screenshots, fight formatting, or avoid
  the editor, while donors receive inconsistent or inaccessible Pages.
- **Severity:** High.
- **Likelihood without controls:** High.
- **Permanent prevention:** Small labeled toolbar, semantic style names, quiet
  reversible cosmetic cleanup, review only for meaningful paste loss, typed
  Page/link/video flows, exact inline repair, responsive keyboard-accessible
  controls, and whole-Page final preview.

### 8. Hidden coupling — concern: **Yes**

- **What could go wrong:** Rich Text assumes D9 package headings, Phase 24
  fallback, Phase 29 media, Phase 22 specialized records, search extraction, or
  a current Payload renderer without declaring the dependency.
- **Why it matters:** A change in another phase can alter published semantics or
  make a stored document invalid.
- **Severity:** High.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Explicit ownership table; D1 manifest pins exact
  profile/compiler/package compatibility; Rich Text owns only prose and typed
  external video; complete Page compilation validates cross-section headings;
  dependent projections are derived.

### 9. Failure modes — concern: **Yes**

- **What could go wrong:** Save succeeds but compile fails; the browser closes
  during cleanup; an embed provider disappears; a new runtime cannot read an
  old node; a converter throws and returns a route-wide 500.
- **Why it matters:** Unclear partial success can lose editorial work or take a
  public Page down.
- **Severity:** High.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Draft preservation, typed save/release outcomes,
  no read-time mutation, prior-generation continuity, provider fallback,
  compatibility gates, section-level defensive containment, and one repair
  action per stable cause.

### 10. Data integrity risks — concern: **Yes**

- **What could go wrong:** Unsupported nodes are silently dropped, internal
  links become stale raw URLs, node migrations mutate published source, or
  plaintext/search disagrees with the public renderer.
- **Why it matters:** Public meaning, search results, exports, and revision diffs
  stop matching what the author approved.
- **Severity:** High.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Stable typed references, explicit successor
  revisions, source/target migration control totals, no lossy automatic
  conversion, one sealed projection, and equivalence tests across render,
  plaintext, search, and export.

### 11. Security and privacy risks — concern: **Yes**

- **What could go wrong:** XSS through raw HTML or unsafe protocols, SSRF through
  metadata lookup, tracking before video consent, overly broad iframe
  permissions, leaked tokens in URLs/logs, or public rendering of a private
  relationship.
- **Why it matters:** This is a high-reach public surface used by tenants and
  potentially safety-restricted ministries.
- **Severity:** Critical.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** No raw HTML/iframe, typed safe React rendering,
  scheme/host validation, no remote fetch on insert, click-to-load embeds,
  privacy-enhanced/DNT provider modes with honest copy, CSP/sandbox/permissions
  policy, content-free telemetry, and Phase-10 projection enforcement.

### 12. Scalability and performance risks — concern: **Yes**

- **What could go wrong:** Huge JSON trees, deep lists, synchronous provider
  calls, eager iframe/player JavaScript, and repeated conversions make editing,
  compilation, search, or public Pages slow.
- **Why it matters:** A feature that works on one short Page can degrade admin
  autosave, release batches, Core Web Vitals, and mobile donor experience.
- **Severity:** Medium-high.
- **Likelihood without controls:** Medium.
- **Permanent prevention:** Measured byte/node/depth/count bounds, linear
  validators/converters, no provider call in save/release, click-to-load video,
  lazy code, production-shaped p95/p99 budgets, and compiler caching by source
  plus profile digest.

### 13. Operational burden — concern: **Yes**

- **What could go wrong:** Staff need developers to repair JSON, re-paste every
  migrated document, identify broken provider URLs, or understand Lexical and
  Payload version terms.
- **Why it matters:** Small nonprofit teams cannot carry hidden CMS specialist
  work for routine edits.
- **Severity:** Medium-high.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Plain cause-owned repair UI, automated exact
  census/migration where lossless, bounded manual exception queue, provider
  fallback, version qualification runbook, and no raw-data editing path.

### 14. Observability gaps — concern: **Yes**

- **What could go wrong:** Operators see “rich text failed” without knowing the
  profile, node kind, stage, source revision, affected Page, or whether the old
  public generation remains healthy.
- **Why it matters:** Diagnosis becomes content inspection or database surgery,
  both slow and privacy-invasive.
- **Severity:** High.
- **Likelihood without controls:** High.
- **Permanent prevention:** Stable safe cause codes; opaque Tenant/Site/Page,
  source/profile/compiler/generation IDs; stage and node-kind counts; paste,
  compile, migration, renderer, and provider-fallback metrics; no prose,
  clipboard body, email, phone, full URL, token, or restricted identity logs.

### 15. Dependency and integration risks — concern: **Yes**

- **What could go wrong:** A Payload internal/canary feature changes, Lexical
  serialization or paste behavior drifts, YouTube/Vimeo URL/player policy
  changes, or Tiptap is accidentally made a second CMS writer.
- **Why it matters:** D11 could become coupled to packages and providers that
  evolve faster than retained public content.
- **Severity:** High.
- **Likelihood without controls:** High; Payload 4 is explicitly active work and
  the repo's internal build already differs from the current internal tag.
- **Permanent prevention:** Provider-neutral product contract, exact version
  qualification, adapter fixtures, SBOM/security review, expand-compatible
  rollout, provider parsers/renderers behind a tiny interface, synthetic
  monitors, and explicit Tiptap purpose separation.

### 16. Migration and upgrade risks — concern: **Yes**

- **What could go wrong:** Existing broad-default Lexical JSON contains nodes
  excluded by profile v1; legacy Page `content`, layout Rich Text `body`, and
  specialized Phase-22 content are conflated; a migration flattens or
  auto-publishes content.
- **Why it matters:** Tenant meaning, links, accessibility, and revision history
  can be lost at cutover.
- **Severity:** High.
- **Likelihood without controls:** High for a brownfield CMS.
- **Permanent prevention:** Exact source-family census, node/mark/attribute
  inventory, lossless auto-map only, explicit exception disposition, retained
  source snapshots, source/target control totals and content digests,
  previewable successor revisions, no auto-publication, rollback rehearsal,
  and old-reader retention.

### 17. Other development hazards — concern: **Yes**

- **What could go wrong:** Concurrent edits overwrite each other; asynchronous
  Lexical updates are persisted before reconciliation; profile changes race
  release compilation; package deployment removes an old converter; tests cover
  the toolbar but not direct API writes or malicious JSON.
- **Why it matters:** Correct UI behavior alone cannot protect the stored and
  published contract.
- **Severity:** High.
- **Likelihood without controls:** Medium-high.
- **Permanent prevention:** Later D12 document conflict/lock decisions,
  revision/CAS save semantics, discrete/headless conversion discipline where
  required, immutable profile versions, manifest-pinned compiler compatibility,
  server and API negative tests, property/fuzz tests, and deployment rollback
  that preserves old readers.

## Ordered permanent path

1. **Freeze the product contract before choosing APIs.** Ratify one exact
   profile, grammar, link types, two video providers, paste behavior, and
   ownership boundaries. Do not make Payload 4 internals part of the decision.
2. **Inventory before migration or editor replacement.** Census every current
   rich-text field and every node/mark/attribute by source family and scope;
   separate ordinary Page/Article source from Phase-22 specialized content.
3. **Build one semantic profile authority.** Make field configuration, server
   validation, compiler, renderers, extraction, export, and migration consume
   one versioned definition. Keep it small enough to test exhaustively.
4. **Qualify the exact Payload/Lexical adapter.** Prove the pinned build's
   authoring, paste, validation, serialization, hooks, accessibility, security,
   and upgrade behavior. Stable v3 or a later qualified v4 remains an
   implementation choice; an internal tag is not accepted on its name alone.
5. **Deliver the thinnest complete tracer.** Paragraph + emphasis + internal
   and HTTPS link must save, preview, compile, publish, render, extract, search,
   export, migrate, and recover through the real D1 seam before adding the
   remaining profile nodes.
6. **Add typed video as data, not iframe content.** Prove URL corpus parsing,
   accessibility disposition, click-to-load privacy, CSP/sandbox behavior,
   provider outage fallback, and no-fetch SSRF posture for YouTube and Vimeo.
7. **Make paste honest and recoverable.** Run the production fixture/adversarial
   corpus; permit quiet cleanup only when meaning is preserved; require a user
   choice before lossy conversion.
8. **Migrate by evidence.** Auto-convert only exact lossless cases, route
   unsupported source to a cause-owned queue, create successor drafts, and keep
   current public generations unchanged until normal D1 publication.
9. **Ship expand-compatible and observe.** Deploy old-and-new readers first,
   then publish profile-v1 content. Monitor safe cause codes and public/provider
   fallback; retire old compatibility only after no active or retained
   generation depends on it.

## Required verification inherited by the eventual specification

1. Every allowed node/mark/attribute round-trips through authoring source,
   backend validation, D1 compilation, preview/public render, plaintext,
   search, export, and migration without semantic disagreement.
2. Every disallowed/unknown/malformed node, mark, attribute, scheme, provider,
   scope, count, depth, or byte limit fails with a typed cause and cannot enter
   a successor public generation through UI, API, import, or direct test
   fixture.
3. Malicious HTML, event handlers, unsafe URLs, Unicode/control-character
   tricks, iframe payloads, provider-lookalike hosts, query injection, and
   populated relationships cannot execute, fetch private networks, or leak
   source data.
4. Internal references reject cross-Tenant, environment, Site, locale,
   private, retired, missing, and stale targets; an eligible target resolves
   from its stable source ID without storing its current path.
5. Word, Google Docs, LibreOffice, plain text, malformed, huge, RTL, CJK, emoji,
   combining-mark, nested-list, table, image, iframe, code, and footnote pastes
   preserve supported meaning, surface unsupported meaning, remain undoable,
   and never log clipboard content.
6. YouTube/Vimeo URL variants, lookalike hosts, removed/private/blocked videos,
   captions/equivalent-text states, start times, CSP, sandbox, permissions,
   referrer policy, no autoplay, no-JavaScript, provider outage, keyboard,
   screen-reader, reflow, and reduced-motion behavior pass.
7. Heading validation uses the complete compiled Page, preserves one H1,
   rejects skipped forward structure, and does not mistake presentation size
   for semantic rank.
8. Exact-minimum, typical, and measured-maximum documents meet edit, autosave,
   compile, public render, extraction, search, migration, bundle, and Core Web
   Vital budgets without eager third-party player cost.
9. Profile migrations are pure/idempotent, produce explicit successor drafts,
   maintain source/target counts and digests, preserve history, never
   auto-publish, and leave the previous public generation renderable.
10. Exact pinned Payload/Lexical N, candidate N+1, old/new reader, unknown-node,
    rollback, failed compilation, failed provider, and failed deployment cases
    preserve drafts and the last compatible public generation.
11. Anonymous, unrelated, wrong-Tenant, insufficient, stale, and revoked actors
    cannot read or mutate source Rich Text; actor-scoped Payload Local API calls
    enforce access rather than defaulting to override.
12. Toolbar, link/video drawers, paste review, error repair, focus restoration,
    announcements, touch targets, zoom/reflow, high contrast, and mobile editing
    pass automated accessibility tests plus keyboard and screen-reader review.

## Exact proposed Phase 23 D11 formulation

> **B-prime-amended-and-hardened (B-prime-R) — one bounded, versioned CMS Rich
> Text Profile with qualified Lexical authoring and typed video embeds:** one
> code-owned, provider-neutral CMS Rich Text Profile Version is the sole
> ordinary Phase-23 Page/Article prose contract. Its version-1 grammar contains
> only root, paragraph, line break, H2–H4, bounded ordered/unordered lists,
> block quote, text with bold/italic, typed internal/HTTPS/email/phone links,
> and one atomic typed YouTube or Vimeo video; it excludes H1/H5/H6, author
> color/font/size/alignment/indentation, underline/strike/sub/sup/code/highlight,
> checklist, table, code block, footnote, rule, manual anchor, upload/image/file,
> arbitrary relationship/provider/embed, generalized Payload block catalog or
> nested composition, reusable section, form/query,
> HTML/Markdown/MDX/CSS/JavaScript, and tenant custom nodes. Rich
> Text remains one D7 semantic leaf, stores no operational or presentation
> truth, and gains new capability only through an additive, separately
> qualified profile version rather than a tenant feature matrix.
>
> The exact-qualified Payload `@payloadcms/richtext-lexical` adapter is the sole
> CMS authoring engine, but Payload features, Lexical JSON, current docs,
> canary/internal v4 behavior, and Tiptap are not public or durable product
> authority. One profile definition governs field features, TypeScript shape,
> backend validation, paste/import, D1 compilation, preview/public render,
> plaintext/search/export, and migration; client controls are guidance, never
> enforcement. Payload/Lexical JSON remains private editable source, while D1
> revalidates the exact source revision and profile, resolves complete-scope
> references, proves the whole-Page outline and package/runtime compatibility,
> and seals one immutable provider-neutral semantic projection pinned with its
> profile/compiler/source/target digests. Tiptap remains purpose-separated and
> never dual-writes or round-trips the same CMS content.
>
> Staff receive one calm keyboard-accessible toolbar—Style, Bold, Italic, Link,
> List, Quote, Video—with semantic labels, responsive controls, undo, inline
> cause-owned repair, and exact final-Package Page preview. Internal links use
> stable eligible same-Tenant/environment/Site/locale Page or Article IDs;
> HTTPS, email, and phone are typed; same-context is default; only external
> HTTPS exposes an advanced new-tab choice; rel/safety output is code-owned;
> empty text, unsafe schemes, raw fragments, wrong-scope/private/retired targets,
> and request-time remote health claims fail. Cosmetic paste cleanup is quiet
> and undoable, while tables, images, embeds, footnotes, code, or other
> meaning-bearing unsupported input is explicitly reviewed before a truthful
> supported-text/plain-text/cancel outcome—never silently deleted, stored as
> unsafe HTML, or logged.
>
> Add video accepts documented YouTube/Vimeo URL shapes but stores only exact
> provider, canonical public resource ID, bounded start time, visible accessible
> title, and a required captions-or-clearly-labeled-equivalent-nearby-text
> disposition; it
> performs no author-URL server fetch and accepts no iframe, script, arbitrary
> query, provider response, token, autoplay, or mutable embed HTML. Public video
> is one responsive code-owned click-to-load component with a local placeholder,
> descriptive title, no autoplay, minimal CSP/sandbox/permissions/referrer
> authority, YouTube privacy-enhanced or Vimeo DNT mode, honest third-party
> privacy copy, and accessible provider-failure fallback; prepared, published,
> loaded, available, captioned, consented, and cookie-free are never conflated.
>
> Backend and D1 proof enforce measured byte/node/depth/list/link/video bounds,
> exact node/mark/attribute grammar, complete Tenant/environment/Site/locale
> scope, current permission and Phase-10 ceiling, safe protocols, whole-Page
> heading structure, accessibility dispositions, and compatible retained
> readers. Unknown, stale, malformed, oversize, unsupported, or newly revoked
> source blocks the affected successor with one repair cause while the last
> compatible public generation continues; read never mutates source, defensive
> fallback prevents a route-wide failure, and correction creates an explicit
> audited successor. Profile or provider change uses pure idempotent
> previewable migration with source/target control totals and never
> auto-publishes. Production adoption requires exact Payload/Lexical version
> qualification and expand-compatible old/new-reader proof—without Payload
> defaults as policy, stable-v4 pretense, raw public Lexical pass-through,
> unsafe HTML sanitizer dependency, SSRF metadata fetch, eager tracking iframe,
> normalized node tables, per-tenant plugins/toggles, generic AST platform,
> blind conversion, destructive migration, dual editor truth, or claim that
> saved, valid, compiled, released, rendered, indexed, remotely available, and
> accessible are the same fact.

## Ratification boundary

The exact quoted B-prime-R formulation above was founder-ratified as **Phase 23
D11** on 2026-08-21. It is the accepted product authority for this decision;
the surrounding research remains supporting evidence and does not independently
expand the ruling. Ratification authorizes no implementation, schema, migration,
provider adoption, issue publication, deployment, release activation, or
production change.

Root `CONTEXT.md` remains intentionally untouched while Phase 22 PR #1323 is
open. D11's durable authority is recorded in the Phase 23 decision log and
ADR-0155; glossary synchronization remains held until the existing Phase-22
documentation stack is reconciled.
