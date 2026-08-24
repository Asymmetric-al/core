# Phase 23 D28 Search and Sharing Primary-Source Research

**Status:** Complete supporting evidence for the founder-ratified Phase 23 D28
C-prime-R decision. It qualifies current standards, providers, and repository
seams without independently expanding the ratified authority or authorizing
implementation.

**Date:** 2026-08-23

**Ratified:** 2026-08-24

## Research question

What modern, durable search-engine and social-sharing contract should Phase 23
use for ordinary Public Pages and Articles when D1 already owns coherent public
generation release, D22 forbids silent locale fallback, D24 separates public
audience from authenticated surfaces, D2 owns public reach/discovery
dispositions, D27 owns qualified media, and Phase 22 D14 already owns
specialized Missionary/Project/Update search and sharing presentation?

The answer must work for a multi-Tenant nonprofit platform without giving
occasional staff a fragile technical SEO console or binding product truth to a
Payload/Next/provider implementation detail.

## Sources and current-version posture

### Search-engine sources

- Google Search Central:
  [title links](https://developers.google.com/search/docs/appearance/title-link),
  [snippets](https://developers.google.com/search/docs/appearance/snippet),
  [canonical consolidation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls),
  [localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions),
  [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap),
  [robots overview](https://developers.google.com/search/docs/crawling-indexing/robots/intro),
  [robots meta](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag),
  [HTTP/network errors](https://developers.google.com/search/docs/crawling-indexing/http-network-errors),
  [structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies),
  [Site names](https://developers.google.com/search/docs/appearance/site-names),
  [Organization](https://developers.google.com/search/docs/appearance/structured-data/organization),
  [Article](https://developers.google.com/search/docs/appearance/structured-data/article),
  [Breadcrumb](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb),
  and [Indexing API limits](https://developers.google.com/search/apis/indexing-api/v3/using-api).
- Google feature-change evidence:
  [Sitelinks Search Box retirement](https://developers.google.com/search/blog/2024/10/sitelinks-search-box)
  and [FAQ/HowTo result changes](https://developers.google.com/search/blog/2023/08/howto-faq-changes).
- Bing:
  [Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a),
  [robots directives](https://www.bing.com/webmasters/help/robots-meta-tags-and-attributes-that-bing-supports-5198d240),
  [robots.txt](https://www.bing.com/webmasters/help/how-to-create-a-robots-txt-file-cb7c31ec),
  [sitemaps](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed),
  and [content removal](https://www.bing.com/webmasters/help/bing-content-removal-tool-cb6c294d).
- IndexNow:
  [protocol](https://www.indexnow.org/documentation) and
  [operational FAQ](https://www.indexnow.org/faq).

### Social and browser sources

- [Open Graph protocol](https://ogp.me/)
- [W3C Web Share API](https://www.w3.org/TR/web-share/)
- [LinkedIn Post Inspector and cache behavior](https://www.linkedin.com/help/linkedin/answer/a6269011)

### Framework and CMS sources

- The exact installed Next `16.3.0-preview.9` bundled documentation under
  `node_modules/next/dist/docs/` was read for Metadata ordering/merging,
  file-metadata precedence, `metadataBase`, sitemap, robots, and Open Graph
  behavior. The public links below are convenient external references; the
  bundled exact-pin text is implementation authority for this repository.
- Next.js:
  [Metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images),
  [`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata),
  [sitemap convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap),
  [robots convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots),
  and [OG/Twitter image convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).
- Payload:
  [SEO plugin](https://payloadcms.com/docs/plugins/seo),
  [localization](https://payloadcms.com/docs/configuration/localization),
  [field components](https://payloadcms.com/docs/fields/overview), and
  [Admin preferences](https://payloadcms.com/docs/admin/preferences).
- Current Payload release posture:
  [npm versions](https://www.npmjs.com/package/payload?activeTab=versions) and
  [Payload 4 direction](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more).

### Exact repository evidence

- [`apps/donor/app/(public)/(solid)/[...cmsSlug]/page.tsx`](../../../../apps/donor/app/%28public%29/%28solid%29/%5B...cmsSlug%5D/page.tsx)
  emits only title and summary for a found CMS Page and only a title for
  unavailable/not-found results.
- [`apps/donor/app/layout.tsx`](../../../../apps/donor/app/layout.tsx)
  supplies one global Site metadata object, including canonical, indexable
  robots, Open Graph, Twitter, and verification values.
- [`packages/config/site-shared.ts`](../../../../packages/config/site-shared.ts)
  is one hard-coded GiveHope identity with one URL, locale, image, social set,
  and keyword list.
- [`packages/lib/seo/metadata.ts`](../../../../packages/lib/seo/metadata.ts)
  concatenates one global Site URL, uses one global fallback image, equates
  image alt with a title in the general helper, and exposes manual per-call
  no-index behavior.
- [`packages/lib/seo/json-ld.tsx`](../../../../packages/lib/seo/json-ld.tsx)
  emits global Organization/WebSite/Page/Breadcrumb/FAQ/ItemList/Worker facts,
  including the retired `SearchAction`, a broad `DonateAction`, and generic
  `Person`/location claims.
- [`apps/donor/next.config.ts`](../../../../apps/donor/next.config.ts)
  sets a 24-hour public max-age plus 12-hour stale-while-revalidate window for
  `/sitemap.xml` and `/robots.txt`, but repository inspection found no complete
  host-qualified public sitemap or robots implementation. A future D28
  activation and adverse-removal path cannot depend on that TTL expiring.
- Root [`package.json`](../../../../package.json) pins
  `next@16.3.0-preview.9` and `payload@4.0.0-internal.1f9ae9a`; no
  `@payloadcms/plugin-seo` dependency is present.

## Findings

### 1. Search result text is an input, not a display guarantee

Google constructs title links from several sources—including `<title>`, the
visible main title, heading text, and Open Graph title—and may rewrite the
result. Snippets primarily come from visible Page content and may use the meta
description when it better describes the Page. Google documents no fixed title
or description character limit.

**D28 consequence:** use unique, concise, visible-fact text; make length advice
advisory; call previews examples; and never display an SEO score or promise the
shown title/snippet will appear verbatim.

Programmatic descriptions are valid when they are Page-specific and useful.
Repeating one Site description on every Page is not. When no meaningful exact-
locale summary exists, omission plus a cause-owned staff action is safer than
scraping arbitrary Rich Text or falling back to another locale.

### 2. Canonical, route status, sitemap, and internal links must agree

Google treats redirects, canonical annotations, sitemap entries, and internal
links as related canonicalization signals. A canonical is a hint, not
authorization or a substitute for a moved/deleted response. Only canonical
URLs should be in the sitemap. A moved Page needs D3 continuity; a removed Page
with no replacement needs a 404/410 result and immediate sitemap removal.

**D28 consequence:** staff never edit canonicals. D1 derives the absolute HTTPS
URL from the verified Site host plus D2/D3/D22 state. The locale-exact ordinary
manifest seals metadata, public rendering, alternates, route status, and sitemap
eligibility. A durable post-activation host projection combines current
ordinary locale heads with typed references to independently current D14
manifests; it does not copy or reinterpret either source. The request `Host`
header cannot be authority in a multi-Tenant system.

### 3. Locale alternates are exact release facts

Google requires localized alternates to be fully qualified, reciprocal, and to
include the current Page. It accepts HTML, HTTP-header, and sitemap forms and
does not prefer one. Maintaining several independent representations adds no
ranking value and creates more opportunities for mismatch.

**D28 consequence:** compile one representation at launch from released,
mutually eligible D22 lineages: HTML-head alternate links are the launch
representation. Never use Payload's default locale fallback. Do not infer
`x-default`; Phase 24 must first define a real selector/default contract.

Google supports one Site name per domain or subdomain, not a separate Site name
per subdirectory. A tenant that requires independent search identity therefore
needs an independently verified host/subdomain; a shared-host path cannot be
presented as a separate Google Site identity.

### 4. Reach and discovery are distinct from access control

Robots instructions are public crawler guidance. They do not protect content,
and blocking crawl can prevent a crawler from seeing a no-index instruction.
Private and Preview routes require authorization, no-store semantics, and no
public artifacts. Public shared-by-link Pages can be crawlable enough to expose
no-index while remaining absent from sitemap and discovery.

**D28 consequence:** D24 remains authority for the exact, server-derived
`public` audience and auth-invariant public representation. D2 remains
authority for **Listed publicly** versus **Shared by link — public** reach and
discovery. D28 derives search eligibility, share presentation, robots, sitemap
inclusion, and locale discovery from those settled inputs and uses honest copy:
public-by-link is not secret.

### 5. Sitemaps should be simple and truthful

Google and Bing support the standard URL/byte thresholds and sitemap indexes.
Google ignores `priority` and `changefreq`; `lastmod` is useful only when it
tracks a significant public change. Both engines expect exact-host URLs and
make crawl/index decisions independently.

**D28 consequence:** one host-qualified sitemap is the default; partition only
at measured thresholds. Include only current 200 self-canonical Listed URLs.
Use a significant public-change timestamp, not deployment or sitemap-generation
time. Keep D17 on-site search-result Pages out and no-indexed.

### 6. Structured data must be typed, visible, and conservative

Google recommends JSON-LD but requires markup to describe visible Page content
accurately. Correct markup does not guarantee a rich result. Site-name
`WebSite` data belongs on the homepage; Organization data belongs on the home
or an appropriate identity Page; Article data belongs only to a real Article;
and breadcrumb markup must follow a visible user path.

Google retired the Sitelinks Search Box in November 2024, so emitting
`SearchAction` is obsolete. FAQ rich results are heavily restricted and should
not be a generic product promise. The Google Indexing API remains limited to
eligible `JobPosting` and live-stream `BroadcastEvent` Pages.

**D28 consequence:** use a small code-owned serializer catalog, stable
canonical-derived `@id` values, safe JSON serialization, and omission when a
visible fact is unavailable. No editor-supplied schema type, raw JSON-LD,
SearchAction, general Google submission, or invisible nonprofit claim.

### 7. One coherent social card is sufficient at launch

Open Graph requires title, type, image, and URL, and recommends description,
Site name, locale, and image details including alt. Twitter-compatible cards
can be derived from the same title, description, canonical, and D27 rendition.
Social platforms can cache cards and may not update immediately.

**D28 consequence:** the share image resolves from an explicitly eligible,
semantically representative Page placement or the exact Site × locale D27
default social-card placement. Its media identity, public rendition, MIME,
dimensions, usage-local alt, crop/art direction, displayed credit, policy/
qualification, exact revision, and proof all remain D27 facts. Image alt
describes the image rather than copying the Page title. No per-platform fields
or arbitrary remote URL. Bound the common rendition to the strictest launch
consumer budget; use one materialized public rendition rather than request-time
card rendering. Map the canonical D22 BCP 47 tag through typed protocol
serializers—Open Graph uses its own locale syntax—rather than storing a second
social locale.

### 8. Accessible sharing is a user action, not surveillance

The Web Share API requires a secure context and transient user activation; the
browser/OS controls available targets. A site does not learn which target was
chosen, and successful handoff does not prove a completed post.

**D28 consequence:** call Web Share only from an explicit accessible control,
test support/capability, always provide first-party Copy link, and never load a
passive social SDK or report a downstream post as completed.

### 9. Next.js is an adapter with merge and precedence hazards

Next's Metadata API is appropriate for server-rendered public metadata.
However, nested metadata fields merge shallowly: defining a Page-level
`openGraph` object replaces the inherited one rather than deeply merging
properties. The exact bundled docs also state that file-based metadata has
higher priority and overrides both static `metadata` and `generateMetadata`.
Metadata route conventions can generate sitemap and robots output, but their
framework behavior is not the product contract.

**D28 consequence:** the route adapter must emit complete nested metadata from
one manifest and inventory conflicting root/file metadata during cutover. Test
rendered HTML and status rather than testing TypeScript objects alone.

### 10. Payload SEO is optional editor machinery, not authority

The current Payload SEO plugin supplies title/description/image fields,
generation callbacks, live preview, and character indicators. The frontend
still must render them. Its automatic tab integration is sensitive to document
field shape and order; Payload recommends direct fields for more complex
structures. Payload localization allows fallback unless explicitly disabled.

As of 2026-08-23, npm lists Payload 3.88.0 as stable `latest` and Payload 4 on a
canary path, while this repository uses an internal Payload 4 pin. Payload's
own Payload 4 announcement describes an Admin redesign in active development.

**D28 consequence:** do not adopt the plugin or a Payload 4 Admin interaction
as part of ratification. If later exact-pin qualification shows value, import
or adapt only the necessary editor components behind an Asym contract. Persist
the three D28 override deltas in source-owned Page locale revisions, disable
fallback, and keep D1 as the only public authority.

### 11. Optional IndexNow is convergence acceleration, never release truth

IndexNow accepts host-verified URL change notifications and supports bounded
batches. An accepted response means receipt, not crawling or indexing. Rate
limits and provider failures are possible. Google does not provide a general
equivalent URL-submission API.

**D28 consequence:** D28 may reuse Phase 22's exact-host optional adapter after
D1 activation. Events come from a durable activation outbox, are idempotent and
debounced, include meaningful create/update/move/delete changes, retry bounded
transient failures, and never block/roll back release or replace the sitemap.

## Repository corrections required by a future implementation

1. Replace the public catch-all's partial metadata with a complete manifest
   adapter for the exact activated generation.
2. Remove root-layout public metadata as a fallback authority for D28-managed
   routes; preserve only truly app-global, non-conflicting fields.
3. Replace global `siteConfig` SEO identity use with exact activated Site
   references.
4. Retire or quarantine duplicate hard-coded metadata/page maps and manual
   no-index switches during explicit Site × locale cohort cutover.
5. Remove retired/unsupported structured-data output from D28-managed Pages and
   qualify every remaining serializer against visible exact-locale facts.
6. Implement one exact-host robots projection and one truthful sitemap
   projection from current activated locale heads, with lag and reconciliation
   observable independently of D1 activation.
7. Reference independently current Phase 22 D14 specialized manifests through
   a typed, authority-preserving host-projection member; never copy, recompile,
   advance, freeze, or reinterpret their fields in D28 ordinary Page records.
8. Inventory file metadata and root inheritance so no conflicting values win
   through framework precedence.
9. Include D24's exact `public` audience in ordinary manifest, structural scope,
   and cache identity; prove exact-`public` discrimination plus anonymous,
   authenticated-session, and crawler output invariance.

## Research conclusion

The modern best-practice shape is not a larger SEO form. It is a small
editorial delta over a deterministic, locale-exact, release-bound compiler:

- one inert versioned Site profile with exact-locale identity and an exact
  Site × locale D27 default social-card placement, no Site-global public head,
  and no D10 shortcut, independently pinned by each locale's D1 successor;
- exactly three Page-locale overrides;
- one complete ordinary Page/Article D1 Search & Sharing Manifest that does not
  absorb Phase 22 D14;
- closed technical serializers and derived crawler artifacts;
- one honest, accessible staff and public-share experience; and
- separate observability for internal correctness and external convergence.

That shape provides broad compatibility without per-provider duplication,
keeps Tenant and locale correctness mechanically enforceable, and leaves
future CMS/provider changes behind stable adapters.
