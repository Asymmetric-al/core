# Phase 23 D27 Payload 4 DAM Primary-Source Research

**Status:** Complete supporting evidence for the founder-ratified Phase 23 D27
C-prime-R decision. It qualifies provider capabilities and gaps only; it does
not independently expand the ratified authority or authorize implementation,
package movement, schema, migration, storage, deployment, D1 activation, or
release.

**Date:** 2026-08-23

## Verdict

Payload's upload collection may provide catalog authoring, metadata,
relationships, folders, and the Admin shell. It must not become the immutable
byte-custody or public-delivery authority.

Core pins Payload and its Vercel Blob adapter to
`4.0.0-internal.1f9ae9a`. The exact commit describes its Payload package as
`4.0.0-beta.0`; Payload main currently describes itself as a canary, while the
latest published stable line remains Payload 3. Payload's June 2026 announcement
also says file versioning, usage references, localized files, richer previews,
and several other DAM features are still being shaped. These are useful
directional signals, not D27 launch contracts.

The exact pin can support a polished Asym DAM authoring surface only behind four
explicit layers:

1. stable Tenant-owned logical media identity;
2. append-only immutable byte revisions;
3. immutable renditions keyed by the exact byte revision and a code-owned
   rendition-profile version; and
4. current target-Site qualification plus exact D1 release pins.

Sources:

- [Exact Payload commit `1f9ae9a`](https://github.com/payloadcms/payload/commit/1f9ae9a)
- [Exact commit package version](https://raw.githubusercontent.com/payloadcms/payload/1f9ae9a/packages/payload/package.json)
- [Payload releases](https://github.com/payloadcms/payload/releases)
- [Payload 4 announcement](https://payloadcms.com/posts/blog/payload-40-admin-ui-redesign-tanstack-mcp-and-more)

## Current Core evidence

### Media collection

[`apps/admin/src/cms/collections/media.ts`](../../../../apps/admin/src/cms/collections/media.ts)
currently defines:

- one Tenant-scoped Payload Upload collection;
- `versions: false`;
- one globally required `alt` and one optional global caption;
- raster MIME choices that include animated GIF; and
- only two fixed image sizes.

This is a useful migration source. It cannot represent immutable replacement,
usage-local accessibility, current Site eligibility, rights/safety, complete
references, or release continuity.

### Direct upload and storage

[`apps/admin/src/cms/payload-runtime-integrations.ts`](../../../../apps/admin/src/cms/payload-runtime-integrations.ts)
grants a direct Vercel Blob client upload when `Boolean(req.user)` is true and
uses one fixed `web-studio/media` prefix. The grant is not bound to an
operational Tenant UUID, asset/revision, purpose, allowed input profile, maximum
bytes, idempotency key, or short-lived upload-session record.

The exact adapter performs the public Blob upload before the Payload document
is successfully submitted, leaves `onUploadCompleted` empty, refetches the
object, and materializes the full `arrayBuffer` for Payload processing.
Cancelled, failed, or incomplete creates can therefore leave public orphans,
and direct browser upload does not eliminate server-memory or Sharp pressure.

Exact installed evidence:

- `apps/admin/node_modules/@payloadcms/storage-vercel-blob/dist/getClientUploadRoute.js`
- `apps/admin/node_modules/@payloadcms/storage-vercel-blob/dist/client/VercelBlobClientUploadHandler.js`
- `apps/admin/node_modules/payload/dist/utilities/addDataAndFileToRequest.js`
- `apps/admin/node_modules/@payloadcms/storage-vercel-blob/dist/index.d.ts`
- `apps/admin/node_modules/@payloadcms/storage-vercel-blob/dist/index.js`

The adapter's exact defaults are unsuitable as custody truth: public access,
random suffix off by default, long cache, optional prefixes, and behavior that
can disable the adapter when credentials are absent. Production DAM writes
must fail closed rather than fall back to ephemeral local storage.

### Public delivery gap

Payload generates file URLs such as `/api/media/file/example.jpg`. Its file
endpoint applies the upload collection's `read` access. Core's public read path
requires an internal `asymPublicRead` request context that an anonymous browser
file request does not carry, while the storage hook preserves the Payload URL
unless access control is disabled. The public serializer still returns that
Payload URL shape.

Evidence:

- `apps/admin/node_modules/payload/dist/uploads/generateFilePathOrURL.js`
- `apps/admin/node_modules/payload/dist/uploads/endpoints/getFile.js`
- `apps/admin/node_modules/payload/dist/uploads/checkFileAccess.js`
- [`apps/admin/src/cms/access/public-read.ts`](../../../../apps/admin/src/cms/access/public-read.ts)
- `node_modules/.bun/@payloadcms+plugin-cloud-storage@4.0.0-internal.1f9ae9a+91375a1a7d57da73/node_modules/@payloadcms/plugin-cloud-storage/dist/hooks/afterRead.js`
- [`packages/api/src/cms/public/serializer.ts`](../../../../packages/api/src/cms/public/serializer.ts)
- [`tests/unit/cms/serialize-published-page.test.ts`](../../../../tests/unit/cms/serialize-published-page.test.ts)

Current tests prove string serialization, not that an anonymous visitor can
fetch an exact released image while an unqualified candidate remains private.
D27 therefore requires an explicit release-qualified delivery URL plus real
anonymous-fetch and denial tests.

### Admin experience

Current Media list/edit routes are thin wrappers around generic collection UI:

- [`MediaNativeListView.tsx`](../../../../apps/admin/src/cms-ui/web-studio/media/list/MediaNativeListView.tsx)
- [`MediaNativeEditView.tsx`](../../../../apps/admin/src/cms-ui/web-studio/media/document/MediaNativeEditView.tsx)

The shared collection shell is useful, but generic document rows cannot explain
upload recovery, processing, rights/safety, target-Site qualification, usage,
candidate versions, or reference-aware Trash. D27 needs a purpose-built Media
workspace using public Payload customization seams and shared Core UI—not a
fork of Payload internal Admin components.

## Capability matrix

| Capability                                                                            | Exact-pin status                             | D27 conclusion                                                                                                                                                                  |
| ------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upload collections                                                                    | Available                                    | Useful intake/catalog primitive; not immutable custody                                                                                                                          |
| MIME restrictions and content inspection                                              | Available but incomplete                     | Keep as early admission; add independent signature, size/pixel/decompression, scan, privacy, and processing policy                                                              |
| Static `imageSizes`                                                                   | Available                                    | Useful prototype; qualified outputs still need immutable identity and a rendition-profile version                                                                               |
| Crop, focal point, resize                                                             | Available                                    | Useful authoring controls; recrop creates new renditions and never mutates a released URL                                                                                       |
| Payload document versions                                                             | Available                                    | Metadata snapshots only; not file versioning                                                                                                                                    |
| Physical file versioning                                                              | Not available in the exact pin               | Asym immutable byte revisions are mandatory                                                                                                                                     |
| Trash                                                                                 | Available                                    | Potential UI/metadata primitive; not reference-aware release or disposition authority                                                                                           |
| Folders/hierarchy                                                                     | Available in the pin and evolving            | Organization only; never security, storage path, identity, Site qualification, retention, or publication                                                                        |
| Usage references                                                                      | Partial through explicit relationships/joins | Cannot prove every D7 Media/Gallery placement, quarantined legacy Rich Text media reference, locale, SEO/social, package, schedule, candidate, live, or retained generation use |
| Field localization                                                                    | Available                                    | Neutral metadata may use it; usage-local alt/caption belongs to exact locale lineages with no fallback                                                                          |
| Client/direct uploads                                                                 | Available                                    | Must be replaced by an exact Tenant/session/profile/size/idempotency grant                                                                                                      |
| Storage adapters                                                                      | Available                                    | Provider adapter only; exact Vercel adapter is public-only and not private-original/quarantine custody                                                                          |
| File access                                                                           | Partial                                      | Payload can gate its endpoint; disclosed provider URLs can bypass it                                                                                                            |
| Custom Admin UI                                                                       | Available                                    | Correct seam for an Asym-owned Media workspace                                                                                                                                  |
| REST, GraphQL, Local API                                                              | Available                                    | Every user-derived Local API call uses `overrideAccess:false`; locks/capabilities remain explicit                                                                               |
| Hooks and transactions                                                                | Partial                                      | DB operations may share `req`; database and object storage are not one transaction, so reconciliation is mandatory                                                              |
| Re-upload/delete                                                                      | Destructive                                  | Forbidden as release behavior                                                                                                                                                   |
| PDF preview, video/audio, localized files, share links, true file versions/references | Announced or incomplete                      | No D27 dependency; future typed profiles only after certification                                                                                                               |

## Exact destructive-version finding

Payload document versions do not preserve prior uploaded bytes. In the exact
installed source, update deletes the old original and generated sizes, performs
the database change, and records document-version metadata. The cloud hook also
acknowledges that re-uploading a matching filename can overwrite in place.

Evidence:

- `apps/admin/node_modules/payload/dist/collections/operations/utilities/update.js`
- `apps/admin/node_modules/payload/dist/uploads/deleteAssociatedFiles.js`
- `node_modules/.bun/@payloadcms+plugin-cloud-storage@4.0.0-internal.1f9ae9a+91375a1a7d57da73/node_modules/@payloadcms/plugin-cloud-storage/dist/hooks/afterChange.js`

Consequently, `versions: true` can preserve a historical metadata record whose
file has been deleted or replaced. It is categorically not D1 release identity,
forward-successor recovery, or immutable custody.

## Upload defaults that must be overridden

The exact root upload configuration defaults include `abortOnLimit: false`,
which can truncate rather than return a clean 413. Safe filename behavior is
not a complete default custody policy. Defining collection MIME types can also
bypass Payload's generic restricted-file verification, making independent
content verification essential.

Evidence:

- `apps/admin/node_modules/payload/dist/config/types.d.ts`
- [`apps/admin/payload.config.ts`](../../../../apps/admin/payload.config.ts)
- [Payload Uploads](https://payloadcms.com/docs/upload/overview)

A later implementation must explicitly reject oversize input, generate opaque
names, validate at both grant and finalization, and create neither a durable
catalog revision nor public object for a rejected file.

## Safe Payload responsibility

Payload may own or render:

- neutral catalog title and ordinary searchable metadata;
- source/credit and protected evidence references subject to field access;
- a replaceable persistence/UI adapter for D27's separate Tenant-wide Media
  Folder and tag relationships—not D18's Site Content Library tree or a generic
  folder engine;
- relationship editors and Page-local Media picker integration;
- current staff-facing derived health/readiness labels;
- version and usage projections read from Asym domain services; and
- Core-consistent custom list, inspector, upload tray, and repair UI.

Payload must not own:

- mutable provider filename as byte identity;
- the only copy of an immutable original or rendition;
- scan/quarantine or physical-disposition truth;
- direct public addressability;
- current Site rights/safety proof;
- usage-local accessibility/crop/caption semantics;
- release activation or forward-successor recovery;
- complete Used-in/deletion authority; or
- provider migration identity.

## Exact kind and image-processing implications

The installed `sharp@0.34.5` is a useful raster processor, but its current
prebuilt binaries support JPEG, PNG, WebP, AVIF, TIFF, GIF, and SVG input—not
general HEIC camera decoding. Sharp documents metadata removal as its default
output behavior, but D27 still requires proof on exact generated outputs and
must not re-enable EXIF/XMP accidentally.

Sources:

- [Sharp installation and prebuilt formats](https://sharp.pixelplumbing.com/install/)
- [Sharp output and metadata behavior](https://sharp.pixelplumbing.com/api-output/)
- [Sharp input metadata](https://sharp.pixelplumbing.com/api-input/)

D27's launch kind profile is therefore a **public still image**, not “anything
Sharp can open.” It admits JPEG, PNG, WebP, AVIF, and common HEIC/HEIF camera
input only through a separately certified safe-decoder adapter. It rejects
multi-frame/animated input, SVG, uploaded video/audio, PDFs, fonts, and other
files instead of flattening or silently changing them. Qualified output uses a
small versioned materialized profile, not arbitrary staff/provider transforms.

## Required adapter architecture

One provider-neutral Payload/DAM boundary must:

1. create or edit logical catalog metadata without accepting browser authority
   over Tenant/custody state;
2. request an exact server-authorized upload session from the custody owner;
3. display durable session and processing facts without treating provider
   callbacks as truth;
4. select only exact target-Site-qualified revisions/renditions;
5. render only Asym-owned release-qualified URLs admitted by D1 as active or
   bounded delivery-retained—not merely recovery-retained—rather than
   Payload's mutable file URL or a raw provider URL, while current Phase 10 or
   other adverse state always denies origin;
6. read a complete source-qualified Used-in projection;
7. create candidate revisions rather than invoke Payload re-upload;
8. move/restore semantic Trash without physical delete; and
9. present D27's append-only, effective-dated purpose-retention policy and exact
   disposition blockers without using Payload Trash TTL as authority; and
10. fail closed on unknown Payload pin, missing storage, stale qualification,
    current Phase 10 denial, or incompatible profile.

No D27 code may import unpublished Payload internal Admin components. Public
custom component APIs and black-box provider behavior are the supported seam.

Official sources:

- [Payload Custom Components](https://payloadcms.com/docs/custom-components/overview)
- [Payload Custom List View](https://payloadcms.com/docs/custom-components/list-view)
- [Payload Access Control](https://payloadcms.com/docs/access-control/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload versions](https://payloadcms.com/docs/versions/overview)
- [Payload Trash](https://payloadcms.com/docs/trash/overview)
- [Payload Join field](https://payloadcms.com/docs/fields/join)
- [Payload localization](https://payloadcms.com/docs/configuration/localization)

## Mandatory qualification tests

### Pin and provider behavior

- Exact package tuple, migrations, generated types/import map, typecheck,
  production build, unit, integration, and browser smoke all pass.
- Unknown or changed provider behavior fails the graduation suite before
  deployment.
- Missing production storage/custody configuration fails closed; there is no
  silent local-disk fallback.

### Upload grant and content

- Anonymous, donor, wrong-Tenant, inactive-member, and insufficient-capability
  grants are denied.
- Exact Tenant, asset/revision, kind profile, maximum bytes, expiry, path, and
  idempotency are enforced.
- Extension/MIME mismatch, polyglot, malformed file, malware test fixture,
  EXIF/GPS, excessive pixels, decompression bomb, animation, and oversize input
  fail privately.
- Oversize returns a clear rejection and leaves no catalog revision or enduring
  public object.
- Failed, cancelled, or abandoned direct uploads reconcile after a bounded TTL.

### Immutability and release

- Same filename across Tenants/concurrent uploads cannot collide or overwrite.
- New version leaves the old D1 generation URL and checksum unchanged.
- Recrop/profile change leaves all old release renditions unchanged.
- Repeated callbacks/retries produce one logical revision and deterministic
  outputs.
- Object-before-DB and DB-before-dispatch crashes recover deterministically.
- Only approved immutable renditions receive an Asym-owned release delivery URL,
  and first anonymous reachability occurs in the D1 serving-head transaction.
- Every currently admitted URL from the active generation or an unexpired,
  still-safe delivery-retained generation succeeds anonymously only while no
  current adverse fact denies it; serialization in immutable history alone
  grants no access. Pre-activation provider paths, candidates, originals,
  recovery-only history, expired routes, and blocked items remain inaccessible.
- When G+1 replaces G, a still-safe G route remains origin-readable only through
  bounded D1 delivery retention for cached/in-flight response coherence;
  recovery retention alone is private, and current adverse restriction denies
  both active and delivery-retained origin access.

### Reference and disposition

- Projection rebuild exactly reproduces draft/candidate/scheduled/live,
  delivery-retained, and private recovery-retained uses.
- Trash/restore cannot cascade, publish, or remove a retained generation byte.
- Missing policy resolves to retain-until-explicit-review; append-only policy
  strengthening/shortening and a change racing disposition never auto-delete or
  permit stale execution.
- A source-owned required-disposition deadline conflicting with a hold or
  minimum floor becomes a named legal/records exception; Payload Trash cannot
  choose precedence or delete automatically.
- Retention, Phase 10/source safety, hold, and usage block physical disposal.
- Provider deletion failure stays visible and retryable; database state cannot
  claim disposal prematurely.

### Tenant and API surface

- Cross-Tenant REST, GraphQL, Local API, upload, direct object, search, Trash,
  restore, and disposal attempts all fail without enumeration.
- Same-Tenant authorized restriction succeeds only with
  `public_media.restrict`; restricted-person/ministry action also requires
  Phase 10 `security_clearance`. Wrong-Tenant, stale membership, revoked
  capability, and a Phase 10 denial all fail without enumeration.
- A trusted worker re-proves event Tenant against every claimed record.
- Service-role credentials never reach a browser and never replace command
  authorization.

### Scale and experience

- Large-catalog pagination/filter indexes, bulk memory, processor concurrency,
  egress, and thumbnail budgets pass production-shaped fixtures.
- Keyboard, screen reader, mobile, focus recovery, status announcements,
  protected previews, and per-file failure recovery pass the D27 UX matrix.

## Current test gap

[`tests/unit/cms/payload-runtime-integrations.test.ts`](../../../../tests/unit/cms/payload-runtime-integrations.test.ts)
and [`tests/unit/cms/collection-contracts.test.ts`](../../../../tests/unit/cms/collection-contracts.test.ts)
currently cover basic adapter/prefix and MIME/image-size configuration. They do
not prove Tenant-bound upload grants, content limits, immutable replacement,
orphan recovery, private originals, real anonymous release delivery, deletion,
rendition determinism, reference-aware Trash, or release continuity.

That gap is evidence for the D27 qualification suite, not a reason to patch the
current mutable model incrementally.
