# ADR-0231: Core holds media bytes in private custody, and whether a use is live is derived on every request

**Status:** Accepted on 2026-11-17 by the owner's instruction to implement the
CRM, CMS and database plan ([AL-2688](https://github.com/Asymmetric-al/core/issues/2688)).

This records target intent. It does not say that anything is built; see the
[implementation record](../audits/core-crm-cms-database-implementation-record.md).

## Context

Web Studio uploads go from the browser to Vercel Blob, the current image
transform only resizes, missionary and care images go to a public bucket, the
donor app marks any path ending in an image extension as immutable for a year,
and the Next image optimizer keeps a 30-day minimum cache that nothing connects
to withdrawal (audit NR-07, NR-15, NR-40). ADR-0126 and ADR-0171 ask for
release-bound media with evidence of where an asset is used and for bounded
derivatives Core produces itself. The plan's decision 9 (section 11.2) chose
private immutable bytes, synchronous sanitizing and a Core route.

## Decision

1. **Core owns the bytes and a custody record.** `public.media_assets` holds the
   tenant, the content hash and the status. Bytes sit in a private Supabase
   Storage bucket under an immutable, content-addressed key prefixed by tenant.
   Payload's `media` collection keeps editorial metadata only (alt text, credit,
   folder) under the same ID; it is a plain collection, not an upload collection.
2. **Upload is a Core command, then a finalize step.** The command records the
   asset as uploading and issues a one-object signed upload to a temporary key,
   within limits on bytes, pixel count and type (proposed: 15 MB, 25 megapixels;
   JPEG, PNG or WebP). Finalize decodes the image in process, applies its
   orientation, re-encodes it deterministically without metadata or source
   filename, hashes the sanitized bytes, writes the object once under the
   content-hash key, produces each bounded variant the same way, re-reads every
   stored object to confirm no metadata remains, and marks the asset ready. Only
   then is the editorial record created in Payload through the service port.
3. **A media use is an append-only where-used fact.** It names the asset, the
   kind of use and the release, profile revision, update, care note or care-thread
   message that uses it. It is written once, by publish fulfilment, by approval of
   a revision or an update, by a submit under an automatic policy, or by the care
   save. It is never updated or ended and carries no audience flag.
4. **Whether a use is live is derived by one SQL predicate,** shared by the media
   route, the delete check and the purge: a release use is live while its release
   is the live head; a profile-revision or update use while it is the approved one
   its own read serves now; a care use while its note or message exists. The
   audience comes from the using record, read on each request. A care use is never
   public.
5. **One Core media route serves the bytes.** Its paths carry no file extension.
   The public gets bounded variants only, and each request is admitted as a page
   is: the asset must not be contained and must have a live public use whose page
   or record passes admission. A signed-in caller whose own token can read the
   using record, the author before approval, and a staff editor for any CMS asset
   of their tenant are served on the signed-in path. Responses carry
   `Cache-Control: private, no-cache` and an ETag of the content hash, are never
   shared-cached and never hand out a storage address. Public media does not go
   through the Next image optimizer.
6. **Containment and deletion.** Containment marks an asset denied everywhere,
   with a reason. Deletion is refused while a live use exists; once allowed it
   tombstones the custody record, and a purge through the storage module follows
   after a delay longer than the database recovery window, keeping the object
   while another undeleted asset of the tenant shares its content hash.
7. **One storage module holds the service key** for the media, receipt and import
   buckets, as a named platform-lane entry; none of those buckets has a Storage
   policy for signed-in or anonymous users.

## Consequences

- Payload's storage and image-transform plugins and the direct browser-to-Blob
  upload go.
- Sandboxed decoding, a malware disposition and a separate sanitizing worker and
  derivative pipeline are deferred until uploads need more (ADR-0126 and ADR-0171
  amendments of 2026-11-17). If finalize cannot fit a function's time and memory
  limits at the admitted sizes, the worker comes forward.
- Each public image request is a function call with an admission read and no
  shared cache answers it. Its cost is unmeasured until the burst proof before
  WP7 (council record C.8, reservation 10).
- Care images move into custody in WP4b, after WP7's media-use table exists.

## Source

- [Plan, section 6.6](../audits/core-crm-cms-database-target-architecture.md#66-publishing-preview-versions-and-media)
  and [section 8.5](../audits/core-crm-cms-database-target-architecture.md#85-backup-and-restore)
- Work packages WP6, WP7 and WP4b
- Related: [ADR-0126](0126-release-bound-public-ministry-media-assets.md),
  [ADR-0171](0171-tenant-wide-public-media-catalog-and-immutable-custody.md),
  [ADR-0229](0229-per-page-releases-and-two-publish-commands.md)
