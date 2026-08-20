# ADR-0126: Release-bound Public Ministry Media Assets

**Status:** Accepted (founder ruling, Phase 22 grill session - D9)

## Context

Public ministry photos can expose a missionary even when the visible image seems
safe. Original filenames, EXIF GPS coordinates, device and author metadata,
embedded thumbnails, auxiliary frames, provider URLs, and mutable storage keys
can disclose identity or location, bypass a later safety decision, or silently
change the media pinned by an already released page. Browser MIME checks,
generic CMS media records, provider transformation defaults, and a successful
upload do not prove that public bytes are safe, immutable, tenant-scoped, or
approved for a particular page context.

Phase 22 must own what an image means on a Missionary Ministry Page or
Project/Campaign Page and which exact media is included in a Page Release. It
must remain compatible with Phase 29's later ownership of common byte custody,
processing, access, retention, and disposal rather than building a second
digital-asset platform. Media also has to use D4/D5's existing review and
release path so ordinary uploads do not create another staff workflow.

## Decision

> **C-prime-amended-and-hardened (C-prime-R) — one release-bound,
> Phase-29-compatible Public Ministry Media Asset contract separating
> short-lived private, non-authoritative Upload Intakes from immutable
> Sanitized Media Master Versions and bounded placement-specific Public Media
> Derivative Manifests; with one server-minted single-object Upload Intent,
> opaque application-owned immutable identities, and exact Tenant, Legal
> Entity, Site, subject or purpose, Page, Page Family, locale, placement,
> actor, safety/consent, environment, and processor-generation scope. Every
> qualifying still image passes an allowlist; declared-type, extension-hint,
> signature, and decoder agreement; sandboxed complete bounded one-frame
> decode; malware/sandbox disposition; orientation application; controlled
> sRGB pixel reconstruction; complete re-encoding; and an independent
> post-encode reparse proving exact type, dimensions, digest, frame count, and
> absence of source-derived EXIF, GPS, IPTC, XMP, maker notes, comments,
> embedded thumbnails, auxiliary images, sensitive source profiles, and
> original-name data. The raw intake expires after a bounded retry/quarantine
> interval, and the source filename is discarded after local selection by
> default; any separately proved private retention exception is
> Phase-29-governed and never public. No source filename may enter a durable
> identity, storage key, provider ID/display name, delivery URL/query/header,
> public
> serializer/API/HTML, Open Graph, JSON-LD, sitemap, alt-text default, log,
> analytic, error, export, or generated derivative. Each context-owned Public
> Ministry Media Placement Version pins one semantic role, focal point/crop,
> contextual alt-or-explicit-decorative decision, caption/attribution, exact
> master and derivative manifest, and responsive/card/social variants; D3 owns
> the typed placement, D4/D5 own the sole tenant-selected review/release lane,
> and an immutable Page Release Manifest atomically pins only certified
> derivatives after fresh D2 and Phase 10 reproof. Replacement preserves the
> coherent old live release until the new release succeeds; scope-safe reuse
> has exact where-used evidence; remove-from-this-page is a normal draft;
> urgent remove-everywhere is smallest-scope Phase 10 containment. One
> Asym-controlled opaque resolver rechecks current release and safety before
> selecting private-origin bytes, serves correct typed no-sniff responsive
> output, and records targeted purge/provider outcomes without claiming recall
> from caches, screenshots, downloads, archives, or third parties. Phase 22
> owns public-media meaning, placement, release eligibility, and withdrawal
> intent; Phase-29-compatible custody owns bytes, scans, transforms, copy
> inventory, access, retention, and disposal evidence; providers prove only
> exact operations. Contributors receive one accessible
> choose-check-focus-describe-save flow with honest processing states, while
> healthy media creates no second staff queue—without public originals, raw
> provider URLs, mutable
> overwrite/upsert, MIME/client/provider-default trust, unbounded decode,
> arbitrary transforms or remote fetches, SVG, animation or silent frame
> selection, cross-tenant deduplication, generic Payload Media authority,
> filename-derived title or alt text, AI safety authority, duplicate
> publication authority, or any claim that selected, uploaded, scanned,
> transformed, ready, reviewed, released, cached, withdrawn, deleted, or
> externally forgotten are the same fact.**

## Consequences

- Public media identity is application-owned and immutable. Original filenames
  are discarded by default and can never appear in public bytes, identifiers,
  URLs, headers, serialization, metadata, telemetry, errors, or exports.
- Public serving uses an Asym-controlled opaque resolver backed by private
  origin bytes. A raw Payload, Supabase, Cloudinary, Vercel Blob, or other
  provider URL is neither page truth nor an authorized public delivery path.
- Uploading, validating, scanning, transforming, saving a placement, reviewing,
  releasing, cache propagation, withdrawal, provider deletion, and external
  forgetting remain independently authoritative facts with honest UI states.
- A contributor handles one still-image flow: choose, wait for the safety check,
  set the focal point, provide contextual alt text or explicitly mark the use as
  decorative, and save the page draft. Keyboard-operable focal-point controls
  and responsive, card, and social previews are required. Clean media enters no
  media-specific approval queue.
- Alt text, cropping, caption, attribution, and decorative status belong to the
  placement rather than the reusable asset because the same pixels can serve a
  different purpose in another context.
- Replacing an image cannot partially change a live page. The prior coherent
  release remains live until a new Page Release Manifest atomically pins a
  certified derivative set.
- Removing one placement and urgently containing an asset everywhere are
  separate operations. Phase 10 containment wins races, while exact where-used
  evidence identifies the smallest affected scope.
- Withdrawal can stop Asym from serving the asset and can drive targeted cache
  and provider cleanup, but the product must not promise recall from downloads,
  screenshots, archives, third-party caches, or other external copies.
- The initially certified surface is bounded to qualifying still raster images.
  SVG, animation, silent frame selection, arbitrary transformations, remote
  source fetching, and unproved formats require a later explicit capability
  decision and production certification.
- Existing public filename-bearing serializers, direct provider URLs, mutable
  upload/upsert paths, and generic CMS media records require explicit migration;
  they are not grandfathered as D9 safety or release evidence.

## Considered options

- **Publish the uploaded original through the CMS or storage provider.** Rejected
  because filenames, metadata, parser behavior, mutable provider state, and raw
  URLs can bypass Phase 10 and Page Release authority.
- **Rely on client checks or provider transformation defaults.** Rejected
  because MIME declarations and extensions are untrusted, defaults can change,
  metadata-preserving options exist, and successful transformation is not
  independent proof of the emitted bytes.
- **Keep the source filename but hide it in visible page copy.** Rejected
  because it can still leak through object keys, URLs, response headers,
  serializers, social metadata, logs, analytics, errors, and exports.
- **Create an independent media-review queue.** Rejected because D4/D5 already
  own the tenant-selected semantic page review and release lane; a second queue
  would add conflicting authority and routine staff work.
- **Build all Phase 29 asset management inside Phase 22.** Rejected because
  Phase 22 needs only the public-ministry semantic and release contract. Shared
  byte custody and lifecycle mechanics remain Phase-29-compatible ownership.

## Later Phase 22 D26 qualification

Selecting, uploading, sanitizing, or placing media does not create the Public
Content Sharing Attestation and never proves ownership or person consent. Only
the actual authorized actor's final D4/D5 candidate action records D26 evidence;
D9 media eligibility and adverse withdrawal remain independently authoritative.

## Related decisions

- [ADR-0027 - Transport-agnostic public content reader](./0027-transport-agnostic-public-content-reader.md)
- [ADR-0029 - Reference-not-copy CMS-to-operational](./0029-reference-not-copy-cms-operational.md)
- [ADR-0118 - Typed Public Ministry Pages with explicit contributor assignments](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119 - Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0120 - Family-certified Public Page Presentation Profiles](./0120-family-certified-public-page-presentation-profiles.md)
- [ADR-0121 - Tenant-chosen Public Content Review and Release Profiles](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [ADR-0122 - Simple Public Page Review with quiet Phase 10 eligibility](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0125 - Source-qualified Public Page Route Dispositions](./0125-source-qualified-public-page-route-dispositions.md)
- [Phase 5 public website runtime contract](../prds/sitestacker-parity/phase-05-public-website-runtime-contract.md)
- [Phase 10 sensitive-data safety](../prds/sitestacker-parity/phase-10-sensitive-data-safety.md)
- [Phase 22 decision log](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md)
- [Phase 29 file and document management](../prds/sitestacker-parity/roadmap.md#phase-29--file-manager--document-management-files-documents)
