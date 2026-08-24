# ADR-0155: Bounded, versioned CMS Rich Text Profile and typed video embeds

**Status:** Accepted (founder-ratified Phase 23 D11 B-prime-R, 2026-08-21)

## Context

Phase 23 D7 admits Rich Text as one semantic Page/Article leaf, D1 compiles
private content revisions into immutable public generations, and D9 permits
qualified tenant Presentation Packages to render semantic content. The current
CMS prototype instead enables broad Payload Lexical defaults, passes serialized
Rich Text as `unknown`, and interprets provider JSON directly in public code.
That is too permissive, provider-bound, and difficult to migrate safely.

The product needs familiar prose authoring and bounded YouTube/Vimeo support
without turning Rich Text into another Page builder, exposing arbitrary HTML or
iframes, creating a second Tiptap truth, or assuming Payload 4 prerelease
behavior is a durable contract.

## Decision

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

## Consequences

- Product semantics remain independent of Payload/Lexical serialization. One
  profile definition must drive the editor allowlist, server validation,
  compiler, renderers, extraction, export, and migrations.
- Payload/Lexical JSON remains private editable source. D1 stores and serves a
  pinned provider-neutral projection; public APIs do not expose raw Lexical
  JSON or best-effort unknown nodes.
- Version 1 stays deliberately small. New syntax requires a new qualified
  profile with compatible readers and explicit migration, not tenant toggles.
- The Page title owns H1, while the complete D1 Page compiler proves H2–H4
  outline structure across all Rich Text leaves.
- Video stores bounded provider identity and accessibility disposition, not
  iframe HTML, provider responses, uploaded bytes, or availability claims. The
  public component is code-owned, click-to-load, non-autoplaying, and retains a
  safe accessible outbound-link fallback.
- Phase 22 specialized content profiles remain unchanged. Tiptap remains a
  separate editor for its existing purposes and never shares CMS source truth.
- Unsupported or stale source blocks only its successor and preserves the last
  compatible public generation. Migration creates previewable successor drafts
  and never rewrites on read or auto-publishes.
- The exact Payload/Lexical artifact must be qualified before production use;
  neither stable-v4 naming nor canary/internal behavior is assumed.

## Rejected alternatives

- broad Payload Lexical defaults, tenant feature matrices, or UI-only limits;
- raw Lexical JSON as a public or durable semantic contract;
- arbitrary iframe, oEmbed, HTML, Markdown, MDX, script, CSS, uploaded video,
  provider fetch, or generalized Payload block catalog;
- Tiptap/Lexical dual-writing or round-tripping of one source;
- silent unsupported-node or paste-content loss, best-effort public fallback,
  read-time mutation, destructive migration, or auto-publication;
- path-based internal links, eager tracking players, autoplay, or provider
  availability/caption/privacy claims inferred from a saved URL; and
- per-node relational normalization, custom editor fork, generic AST platform,
  plugin marketplace, or generalized real-time collaboration introduced here.

## Implementation proof gates

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

- exact allowlisted grammar and identical authoring, validation, compile,
  preview/public, plaintext, search, export, and migration semantics;
- hostile unknown/oversize/malformed JSON, unsafe protocol, Unicode/control
  character, cross-scope reference, iframe, and provider-lookalike rejection;
- honest, undoable paste handling for Word, Google Docs, LibreOffice, plain
  text, tables, images, embeds, code, footnotes, RTL, CJK, emoji, and huge input;
- stable same-scope internal reference resolution and complete Page heading
  proof;
- YouTube/Vimeo canonicalization, accessibility disposition, privacy-enhanced
  click-to-load rendering, CSP/sandbox/referrer policy, failure fallback,
  keyboard, screen-reader, reflow, reduced-motion, and no-JavaScript behavior;
- deterministic bounded compilation and render performance at minimum, typical,
  and measured-maximum content sizes without eager third-party player cost;
- pure idempotent successor-only migrations with counts/digests, retained
  old/new readers, failed-upgrade rollback, and no public-generation mutation;
  and
- denial for anonymous, unrelated, wrong-Tenant, insufficient, stale, and
  revoked actors, including qualified Payload Local API access behavior.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

## References

- [Phase 23 D11 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d11--bounded-cms-rich-text-and-typed-video-embeds)
- [Phase 23 D11 research and adversarial evidence](../prds/sitestacker-parity/phase-23-d11-rich-text-and-typed-video-embed-research-evidence.md)
- [Phase 23 D11 Payload/Lexical primary-source research](../prds/sitestacker-parity/phase-23-d11-payload-lexical-primary-source-research.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0151 — Semantic ordinary section catalog and additive bounded composition seam](./0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)
