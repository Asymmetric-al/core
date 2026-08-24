# Phase 23 D27 Supabase Byte Custody and RLS Research

**Status:** Complete supporting evidence for the founder-ratified Phase 23 D27
C-prime-R decision. This document does not independently expand the ratified
authority and is not an implementation authorization, provider selection,
schema, or migration.

**Date:** 2026-08-23

## Question answered

Can Supabase safely support a high-quality, multi-tenant Public Media Catalog,
and where must its authority stop so that Phase 23 does not create a second
file platform before Phase 29?

## Short answer

Yes, with strict boundaries. Supabase Postgres is a sound home for typed
catalog, qualification, reference, audit, and processing-control records.
Supabase Storage can be one qualified byte provider. Neither
`storage.objects`, a bucket path, an object URL, an ETag, a Payload media ID,
nor a Vercel Blob ID may become the logical asset identity, release truth,
rights authority, or retention authority.

The durable split is:

- D27 owns the public-media semantic catalog, immutable catalog revisions,
  target-Site qualification, media-specific evidence/review, versioned public-
  media purpose-retention policy, and a rebuildable **Used in** projection.
- Phase 10 owns the current publication ceiling, restricted-ministry safety,
  source reclassification, withdrawal, and adverse containment. D27
  qualification is subordinate input and cannot widen Phase 10 output.
- Phase 29 owns opaque immutable byte identity, storage copies, quarantine,
  malware/file hygiene, qualified rendition identity, access audit, holds,
  retention execution, and physical disposition.
- D1 alone pins exact qualified renditions into an immutable Public Site
  Generation and changes what the public sees.
- The provider stores bytes. Its tables, keys, URLs, and callbacks are adapter
  evidence rather than product truth.

## Current repository findings

The current code is migration input, not the D27 target:

1. [`media.ts`](../../../../apps/admin/src/cms/collections/media.ts) is a
   Tenant-scoped but versionless Payload upload collection. It has only two
   fixed image sizes and one required global alt value.
2. [`payload-runtime-integrations.ts`](../../../../apps/admin/src/cms/payload-runtime-integrations.ts)
   gives every authenticated Payload user a Vercel Blob client-upload lane and
   places all objects below one `web-studio/media` prefix. Authentication alone
   is not target Tenant, capability, kind, size, or upload-session proof.
3. [`public-read.ts`](../../../../apps/admin/src/cms/access/public-read.ts)
   documents that hosted media bytes are publicly readable to anyone holding
   the Blob URL. That is unsuitable for raw intake, quarantine, or candidates.
4. [`serializer.ts`](../../../../packages/api/src/cms/public/serializer.ts)
   emits original filenames. Original names can contain a person's name,
   location, campaign detail, or device convention and do not belong in the
   public projection.
5. The legacy `profiles` and `document-uploads` Supabase buckets are public,
   accept INSERT from any authenticated user, and use `storage.objects.owner`.
   Current Supabase documentation deprecates `owner` in favor of `owner_id` and
   explicitly says ownership by itself is not authorization. These policies
   must never be copied into D27.
6. Payload's tenant document ID and the operational Supabase Tenant UUID are
   distinct identifiers. Every adapter must translate them through one
   certified mapping; no field or worker may guess that they are interchangeable.
7. Core already has one Inngest client, an identifier-only tenant event
   envelope, dispatch-ledger behavior, work claims, retries, concurrency, and
   dead-letter/recovery patterns under `packages/api/src/workflows`. D27 should
   extend that one executor boundary if implementation is later authorized,
   not add Supabase Queues as a competing orchestrator.

## Supabase primary-source findings

### Storage is metadata plus an object provider, not one transactional store

Supabase says `storage.buckets` and `storage.objects` contain metadata while
the bytes live in an object provider. It instructs applications to treat the
Storage schema as read-only and perform upload, copy, move, and delete through
the Storage API. Deleting metadata directly can orphan billed bytes.

**D27 consequence:** a database write and an object write are not one ACID
transaction. Finalization, promotion, and disposal need an idempotent saga plus
reconciliation; a hook that assumes both succeeded is not sufficient.

Source: [Supabase Storage schema](https://supabase.com/docs/guides/storage/schema/design).

### Private and public buckets have materially different semantics

Private buckets apply RLS to download operations and can issue time-limited
URLs. Public bucket retrieval bypasses access control; anyone with the URL can
read the object. Upload, move, and delete still require authorization.

**D27 consequence:** raw intake, originals, quarantined bytes, processing
candidates, and authenticated preview bytes are never placed in a public
bucket. Only an exact qualified rendition copied for a D1 generation may enter
public delivery.

Source: [Supabase Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals).

### Signed URLs are bearer capabilities, not revocable authorization sessions

Storage signed URLs use a signing key distinct from Auth keys. Rotating Auth
keys does not invalidate them, and they remain valid until expiry. Smart CDN
cache can outlive token expiry; deleting the object is the documented way to
cut off cached signed access, and invalidation can still take about a minute.

**D27 consequence:** Preview uses an app-owned authenticated delivery route
with `no-store`, current authorization, and exact candidate scope. It does not
hand staff a long-lived, freely shareable signed URL. A signed URL may be a
short internal transport detail, never the Preview or permission record.

Sources:

- [Serving Storage assets](https://supabase.com/docs/guides/storage/serving/downloads)
- [Supabase Smart CDN](https://supabase.com/docs/guides/storage/cdn/smart-cdn)

### Uploads can be resilient, but the grant must be exact

Supabase recommends standard upload for files no larger than 6 MB and TUS
resumable upload when files are larger or the network is unstable. TUS supports
progress and resume, and a unique upload URL prevents two clients from writing
the same session concurrently. Signed upload URLs become usable without
further authentication after issuance.

**D27 consequence:** the server first records one expiring upload session and
derives a provider path, actor, Tenant, kind profile, maximum size, expected
content family, and idempotency key. A browser gets only that exact grant. No
broad authenticated INSERT policy and no upsert/overwrite is permitted.

Sources:

- [Supabase resumable uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)
- [Supabase standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
- [Create a signed upload URL](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl)

### Bucket restrictions are useful admission controls, not content proof

Buckets can constrain allowed MIME types and maximum file size. Global and
per-bucket limits exist, and per-bucket limits should be lower than the global
ceiling. Browser MIME and filename remain untrusted.

**D27 consequence:** provider limits reject obvious mistakes early, while the
worker independently sniffs content, safely decodes it, enforces pixel and
decompression budgets, scans it, removes sensitive metadata, and re-encodes
launch image types. A bucket allowlist cannot establish safety.

Source: [Supabase Storage file limits](https://supabase.com/docs/guides/storage/uploads/file-limits).

### Dynamic image transformation is not release authority

Supabase Image Transformations have supported-format, 25 MB source, 50 MP, and
2,500-pixel dimension limits and incur transformation usage/cost. A query
parameter describes the transform; it is not an Asym-qualified rendition
identity or processor-version proof.

**D27 consequence:** D1 pins materialized immutable outputs from a small,
versioned rendition-profile catalog. Provider transforms can be evaluated as a
preview or delivery optimization behind the adapter, but arbitrary dimensions
and dynamic transforms are not a launch contract.

Source: [Supabase image transformations](https://supabase.com/docs/guides/storage/serving/image-transformations).

### Storage backups require an independent byte recovery plan

Supabase database backups and PITR contain Storage metadata, not Storage
objects. Restoring the database does not restore bytes deleted after the
backup. Supabase's S3 compatibility does not provide full S3 parity or object
versioning.

**D27 consequence:** before activation, operations must prove a byte RPO/RTO,
encrypted independent object export or replication, checksum manifests,
least-privilege restore by digest, DB/object reconciliation, and durable
disposition tombstones that suppress intentionally destroyed bytes during
restore. “Supabase backs up the database” is not a DAM recovery plan.

Sources:

- [Supabase database backups](https://supabase.com/docs/guides/platform/backups)
- [Download Storage objects](https://supabase.com/docs/guides/storage/management/download-objects)
- [Supabase S3 compatibility](https://supabase.com/docs/guides/storage/s3/compatibility)

### RLS must be structural and indexed

Supabase recommends RLS on exposed tables, an index on every policy predicate,
and `(select auth.uid())` where the value is statement-stable so Postgres can
use an init plan. Service-role and S3 credentials bypass RLS. Storage's
`owner_id` can participate in a policy, but ownership alone grants nothing.

**D27 consequence:** staff-facing product tables are deny-by-default and use
current membership/capability helpers. Custody, quarantine, provider copy, and
access-log tables live in a non-exposed schema with revoked privileges and RLS
as defense in depth. Browser code never receives a service role or S3 key.
Server commands reauthorize and derive Tenant scope even when a worker is
trusted.

Sources:

- [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage ownership](https://supabase.com/docs/guides/storage/security/ownership)

### Current changelog items that affect this design

The 2026-08-23 changelog review found no reason to weaken the contract. Relevant
current changes include automatic Data API exposure becoming opt-in, a new RLS
tester in preview, Postgres 14 support ending, Supabase JavaScript clients
dropping Node 20, and changes to logs endpoints. Core's Node 24 baseline is
compatible, but API/schema exposure and observability integrations must remain
explicit and version-checked.

Source: [Supabase changelog](https://supabase.com/changelog.md).

## Recommended domain model

Names below are conceptual, not authorized SQL.

### D27 semantic records

| Record                                     | Owns                                                                                                                                | Does not own                                                       |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `PublicMediaAsset`                         | Stable Tenant-wide logical identity, neutral staff title, kind profile, lifecycle state                                             | Provider path, public URL, usage-local alt, physical deletion      |
| `PublicMediaRevision`                      | Immutable successor number, source/capture provenance, rights-evidence reference, exact custody byte reference                      | Mutable overwrite or “latest URL”                                  |
| `PublicMediaSiteQualification`             | Exact Site, asset revision, rights version, safety profile, rendition profile, result/reason codes, expiry/supersession             | Public activation                                                  |
| `PublicMediaUsageProjection`               | Rebuildable reverse lookup for Site, locale, owner type/id/version, field/block path, draft/candidate/live class                    | Source relationship truth                                          |
| `PublicMediaPurposeRetentionPolicyVersion` | Append-only Tenant policy profile/version, effective time, minimum keep interval, approved source reference, actor and reason       | Arbitrary rule graph, automatic purge, legal/safeguarding override |
| `PublicMediaRetentionResolution`           | Rebuildable evaluation of minimum-keep floors, exact source-owned required-disposition reference/due time, conflict and eligibility | Legal/records source authority or automatic conflict resolution    |
| `PublicMediaDispositionAuthorization`      | Exact asset/revision, evaluated policy version and facts, authorization actor/time/reason, state and supersession fence             | Physical byte deletion or immunity from current reproof            |

### D1 delivery-admission facts

D1—not the provider—owns whether an immutable route is anonymously readable:

- **active** means the current generation admits the exact route;
- **delivery-retained** means a replaced generation still admits the exact
  read-only route until a code-owned deadline computed from the maximum
  published response/cache lifetime plus a bounded clock-skew margin, so an
  in-flight or cached Page can finish one coherent generation closure; and
- **recovery-retained** means retained only as private input to a future
  validated successor and never grants public route access by itself.

The admission row pins Tenant, environment, Site/locale, generation, route,
exact byte/rendition, delivery class, state, and `retain_until`. A current Phase
10 or other source-owned adverse fact denies origin access immediately in any
public admission state. Delivery retention expires without extending recovery
retention, and a generic “retained” flag is prohibited because it would confuse
cache continuity with recovery authority.

### Phase-29-compatible custody records

| Record                 | Owns                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `UploadSession`        | Exact Tenant, actor, kind/limits, provider key, expiry, state, idempotency                            |
| `ByteObject`           | Opaque immutable ID, SHA-256, verified byte length/type, provenance and inspection state              |
| `StorageCopy`          | Provider, container/key, copy state, checksum verification and preferred-read state                   |
| `Rendition`            | Source byte, closed profile/version, processor/version, output byte                                   |
| `CustodyAccessEvent`   | Authorized retrieval/download decision and outcome without broad content                              |
| `Hold` / `Disposition` | D27 owner-policy/request reference, applied hold state, authorized Phase 29 physical action and proof |

Every Tenant-owned child carries `tenant_id`. Composite unique keys and foreign
keys include Tenant, such as `(tenant_id, asset_id)` and
`(tenant_id, site_id)`. This makes a wrong-Tenant relationship impossible even
if application filtering fails. Hot/security facts use typed columns and
constraints; JSONB is limited to versioned provider diagnostics and rare
technical metadata.

## Provider-neutral custody port

One qualified adapter must implement, at minimum:

1. create an exact bounded upload grant;
2. finalize and HEAD the expected object;
3. privately stream an object to an authorized processor;
4. write an immutable object at a deterministic key;
5. prepare an exact verified immutable byte in a private delivery class;
6. delete an authorized copy through the provider API;
7. list by cursor for reconciliation; and
8. emit provider diagnostics without exposing secrets, names, or bytes.

Provider capabilities are tested, not assumed. One custody class uses one
primary provider at a time. Supabase Storage and Vercel Blob are candidates;
D27 does not ratify either as the permanent provider.

## Upload and processing protocol

1. **Authorize.** A server command checks active Tenant membership and exact
   media capability, validates the selected closed kind profile and budget, and
   records `UploadSession` with an idempotency key and short expiry.
2. **Upload privately.** The browser sends bytes directly to the provider using
   only the server-generated opaque path. It can pause/resume and report local
   progress, but cannot choose a Tenant path or mark an asset Ready.
3. **Finalize.** A callback is a wake-up, not proof. A reconciler also discovers
   lost callbacks. The worker HEADs the expected object and uses compare-and-
   swap to claim the exact session.
4. **Inspect.** The worker computes digest, sniffs the type, applies byte/pixel/
   decompression limits, safe-decodes, scans/sandboxes or CDRs by kind, removes
   EXIF/GPS, and re-encodes supported public images. A failed or unknown result
   remains private and blocked.
5. **Render.** The worker creates only the outputs in the pinned closed rendition
   profile. Each output has a new immutable byte identity and deterministic,
   non-user-controlled key.
6. **Commit.** A short database transaction advances the immutable revision and
   copy records and appends one unique workflow dispatch/reconciliation fact.
   No file or network operation occurs inside the transaction.
7. **Qualify.** Current rights, safety, Site, kind, and rendition evidence
   produces an explicit result. Ready-to-select, candidate-previewable, and
   releasable are separate facts.
8. **Release.** D1 prepares or resolves the exact qualified rendition in a
   private, publicly unroutable delivery copy, verifies HEAD/digest, then uses
   the serving-head transaction to activate both the generation and its exact
   Asym-owned release-qualified media routes. Those routes—not provider object
   URLs—create first anonymous reachability and can be edge cached by delivery
   class. On successor activation, the replaced generation's still-safe routes
   become delivery-retained only for the bounded cache-convergence window;
   recovery retention alone stays private. Failure leaves the live generation
   unchanged and the prepared byte private.

All steps are retry-safe. Deterministic outputs, unique idempotency keys,
expected-state updates, work claims, and a sweeper heal “byte written before DB”
and “DB committed before dispatch” failures. A second queue is unnecessary.

## Storage classes and delivery

| Class                               | Addressability                                                                                                                               | Cache                                                                                                      | Examples                                                                      |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Raw intake / original               | Private, processor-only                                                                                                                      | No public cache                                                                                            | Newly uploaded phone photo, rejected file                                     |
| Candidate / qualified rendition     | Private, authorized app route                                                                                                                | Preview `no-store`; internal bounded cache only                                                            | Crop/rendition under review                                                   |
| Prepared ordinary delivery copy     | Private provider copy; no anonymous route before D1 activation                                                                               | No public cache before activation                                                                          | Verified candidate hero/card image                                            |
| Released ordinary media route       | Asym-owned immutable route admitted by an active or unexpired, still-safe delivery-retained D1 generation; never by recovery retention alone | Long-lived immutable only when no governing fact is time-bounded                                           | Activated hero/card image or cached prior-generation closure                  |
| Released revocation-sensitive route | Asym-owned controlled route admitted by D1 and current adverse-state ceiling                                                                 | Explicit and purgeable; time-bounded rights/consent freshness and stale allowances end before exact expiry | Time-bounded license/consent or restricted-worker media needing prompt denial |

The last class is not security theater: a byte already downloaded cannot be
recalled. Crossing the earliest current rights, consent, or safety expiry is an
automatic adverse transition that denies origin without waiting for a new
release or manual action. The cache TTL, stale directives, and delivery-retained
deadline must end before that expiry after the clock-skew margin. The UI must
state that withdrawal or expiry blocks future release/retrieval and triggers
takedown; it cannot promise erasure from visitor devices or third-party caches.

## Search, pagination, and reference health

- Catalog search starts with a stored `tsvector` plus GIN over neutral title,
  tags, credit, and permitted source terms. No external search service is
  justified at launch.
- Browse uses keyset pagination on `(updated_at, id)`, not deep OFFSET.
- Index every composite FK and RLS predicate. Candidate indexes include
  `(tenant_id, lifecycle_state, updated_at desc, id desc)`, partial processing/
  error indexes, tenant-scoped digest lookup, and reverse usage by Tenant,
  asset, Site, and usage class.
- A usage projection is replaced atomically per exact source version or D1
  generation pointer. It is never maintained by parsing opaque Payload JSON in
  database triggers.
- Provider `listV2` or prefix listing is an operations/reconciliation tool, not
  the staff catalog query path.

## Duplicate handling

Digest equality produces a same-Tenant warning and **Reuse existing** option.
It does not auto-merge logical assets because two uses of identical bytes can
have different source, consent, rights, withdrawal, title, and retention facts.
Cross-Tenant deduplication is invisible and deferred; it must never reveal that
another ministry holds the same byte or couple their legal/retention lives.

## Trash, retention, and recovery

- D21-style catalog Trash is reversible and immediately removes an asset from
  new selection. It does not delete bytes or cascade through uses.
- D27 stores one append-only `PublicMediaPurposeRetentionPolicyVersion` per
  Tenant adoption. Its bounded inputs are code-owned profile/version,
  `effective_at`, minimum keep interval after the later of Trash entry or last
  required public/Preview/scheduled/delivery-retained/recovery-retained use, an
  approved policy reference, actor, and reason. Only the exact retention-
  management capability may append a version.
- Missing approved policy resolves to the code-owned **retain until explicit
  review** floor. Launch has no automatic purge. Current legal, consent,
  safeguarding, incident, hold, source-retention, and D27 purpose floors
  compose strictest-wins.
- A source-owned required-disposition or erasure obligation is a separate exact
  reference with owner, version, and due time—not a shorter retention floor. If
  it conflicts with a current hold or minimum-keep rule, the resolution is an
  urgent **Needs attention** item for the named legal/records owner; the
  executor never chooses a winner or destroys bytes automatically.
- A reduction never mutates an earlier evaluation or disposes media. A stronger
  version or hold immediately fences pending authorization. Every disposition
  authorization pins the evaluated version/facts and Phase 29 re-proves the
  current effective policy and all blockers before physical execution; a
  concurrent policy change makes stale work a safe no-op requiring review.
- Physical disposition remains Phase 29 and is blocked by draft, candidate,
  scheduled, active, delivery-retained, recovery-retained, package, SEO/social,
  reusable-section, hold, and retention references.
- The Storage API performs deletion. A database DELETE against
  `storage.objects` is forbidden.
- Encrypted byte backup/export, checksum inventory, RPO/RTO, least-privilege
  restore, durable disposition tombstones/restore suppression, and a restore
  exercise are launch gates. A DB-only restore must surface missing bytes rather
  than mark them Ready. No restored copy becomes selectable or deliverable until
  current holds, adverse state, and disposition history are reconciled.
- Provider migration is copy + checksum + register secondary copy + switch the
  preferred read + observe + later dispose the old copy. Logical asset IDs and
  D1 references never change.

## Observability and cost controls

Track, per Tenant and kind profile:

- upload count, bytes, age, cancellation, resume, and orphan rate;
- scan/decode/rendition latency and failure reason;
- workflow queue age, retries, claim expiry, dead letters, and recovery;
- quarantine age and staff-visible unresolved blockers;
- DB record without provider byte, provider byte without DB record, digest
  mismatch, and missing rendition coverage;
- D1 media blockers, failed private delivery-copy/HEAD verification, and
  release-route activation mismatches, delivery-retention expiry/overrun, and
  mixed-generation/old-route 404 probes;
- storage, transform, egress, cache-hit, operation, and backup/export usage;
- denied cross-Tenant or stale-capability attempts; and
- public 404/5xx and revocation/takedown convergence.

Logs correlate opaque Tenant, asset, revision, byte, upload-session, and
workflow IDs. They never contain upload tokens, signed URLs, original
filenames, extracted EXIF/GPS, consent documents, or image content.

Launch budgets cap source bytes, decoded pixels, rendition count/dimensions,
per-Tenant concurrent processing, retained candidates, and storage/egress.
Partitioning, an external search engine, Realtime status streaming, and dynamic
arbitrary transforms wait for measured need.

## Required tests

### Tenant and authorization

- guessed wrong-Tenant asset/revision/Site IDs fail at command, RLS, and
  composite-FK layers;
- inactive membership and missing capability fail closed;
- service-role workers still validate event Tenant against claimed records;
- null-owner service-created provider objects are never user-readable; and
- Payload tenant IDs cannot be substituted for operational Tenant UUIDs.
- `public_media.restrict` and `public_media.retention.manage` allow only the
  exact current actor/Tenant/capability combination; wrong-Tenant, stale-
  membership, revoked-capability, or forged-source attempts fail without
  enumeration; and
- restricted-person/ministry media additionally requires Phase 10
  `security_clearance`, and a current Phase 10 denial wins over every D27 allow.

### Upload and content safety

- arbitrary, expired, replayed, and upserted upload paths fail;
- MIME spoof, double extension, polyglot, malformed image, decompression bomb,
  excessive pixels, oversized file, active PDF, malware, and scanner timeout
  remain private and blocked;
- EXIF/GPS and original filename never reach a public rendition or serializer;
- cancel/resume and lost callback converge through reconciliation.

### Durability and release

- double finalize, reordered duplicate event, claim expiry, and concurrent
  replacement are idempotent;
- crash after object-before-DB and DB-before-dispatch heals without duplicate
  logical revisions;
- missing/unready/wrong-Site/expired-rights media blocks D1;
- private-copy, HEAD, digest, route, or compiler failure leaves live unchanged
  and no candidate provider URL is anonymously fetchable;
- while a prior generation remains active it serves its old exact byte; after a
  successor activates, its still-safe exact routes remain readable only through
  bounded delivery-retention long enough for cached/in-flight Page closure,
  then expire; recovery-retained bytes remain private and can be re-admitted
  only through a newly validated successor;
- current Phase 10/adverse restriction immediately denies active and delivery-
  retained origin reads without claiming third-party cache erasure; and
- a new immutable path prevents cache mutation.

### Trash, backup, and migration

- Trash preserves every referenced byte and Restore recovers selection;
- missing Tenant retention policy resolves to retain-until-explicit-review and
  never auto-purges;
- append-only effective-dated policy strengthening, shortening, and concurrent
  change versus disposition preserve exact history; a stronger/current hold
  fences pending work, and shortening requires a new explicit authorization;
- a source-owned required-disposition deadline conflicting with a hold or
  minimum floor produces one cause-owned exception and no automatic deletion;
- disposition remains blocked by any exact use—including delivery/recovery
  retention—hold, incident, legal/source rule, or current purpose-retention
  floor;
- DB-only restore identifies missing objects and cannot claim Ready;
- byte restore by digest and provider copy verification succeed;
- disposition tombstones suppress physically disposed bytes even when an older
  backup still contains them;
- and provider migration changes copies, not logical or release IDs.

### Performance and operations

- RLS plans use indexes at representative Tenant volumes;
- keyset pagination remains stable during concurrent inserts/updates;
- bulk/TUS concurrency respects Tenant and processor budgets;
- synthetic missing object, stalled scan, and dead letter produce alerts and a
  calm staff-facing **Needs attention** state; and
- logs and metrics contain no tokens or sensitive media metadata.

## Decision implications

1. Supabase is qualified as a platform capability, not selected as permanent
   custody provider by D27.
2. The existing public buckets and direct upload component are explicitly not
   the D27 implementation template.
3. The immutable catalog/revision/custody boundary is required now because
   adding it later would require a byte and reference rewrite.
4. Independent byte backup and restore proof is a launch requirement.
5. One existing durable executor is enough; D27 does not add Supabase Queues,
   a second workflow ledger, or provider callbacks as authority.
6. Phase 10 denial, D1 active/delivery-retained admission, D27 private recovery
   retention, and D27 effective-dated purpose-retention policy are distinct
   product facts; no Storage bucket, object row, URL, or cache flag may collapse
   them.

This document authorizes no implementation, schema, migration, dependency,
bucket, provider, queue, credential, deployment, D1 activation, or release.
