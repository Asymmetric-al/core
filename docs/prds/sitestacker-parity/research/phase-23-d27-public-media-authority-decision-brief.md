# Phase 23 D27 Public Media Authority Decision Brief

**Status:** Founder-ratified exact C-prime-R on 2026-08-23 after primary-source
research, repository audit, nonprofit workflow design, Supabase/Postgres/
Storage review, and complete all-category adversarial hardening.

**Date:** 2026-08-23

## Original selected direction

The founder first selected the following direction for a complete,
launch-bounded public-ministry DAM:

> **C-prime — One bounded Tenant-wide Public Media Catalog with Site-use
> qualification over a Phase-29-compatible immutable byte-and-rendition custody
> contract.**

This is a DAM-grade **Media** product for public still imagery used by Web
Studio. It is not a general file manager, private-document store, form-
attachment product, package compiler, uploaded-video platform, or enterprise
creative-operations suite.

That selected sentence was then adversarially hardened. The exact 36-clause
C-prime-R block below is the sole founder-ratified D27 authority; this original
sentence preserves decision lineage but does not compete with or expand it.

## Why the original sentence needed hardening

The sentence chose the correct authority shape but left consequential questions
implicit:

- whether “media” means arbitrary files or one exact kind profile;
- whether Payload versions preserve uploaded bytes;
- when an uploaded object becomes selectable or public;
- how HEIC phone photos, animation, active content, EXIF/GPS, malware, and
  decompression bombs behave;
- who owns rights, consent, safety, alt text, crop, renditions, Site eligibility,
  live release, withdrawal, Trash, and physical disposal;
- how object storage and Postgres recover from partial failure;
- whether Supabase is product authority, provider, or both;
- how Used-in remains complete enough for replacement and disposal;
- what “perfect UX” means for a missionary on weak mobile data, an occasional
  office admin, a Page editor, translator, safety reviewer, publisher, and
  operator; and
- which tests and measurable outcomes block launch.

The C-prime-R text below closes those questions without importing enterprise DAM
bloat.

## Settled authority preserved

1. **D1** alone activates one exact Public Site Generation and leaves live
   unchanged when preparation fails.
2. **D7** owns semantic Media/Gallery/Page composition, not bytes; public output
   excludes original filenames and private metadata.
3. **D9** certified packages may consume exact qualified public media but do not
   become byte custody.
4. **D11** owns typed external YouTube/Vimeo video; Rich Text is not an upload
   lane.
5. **D18** Content Library folders exclude Media entirely; any Media organizer
   is a separate D27-owned, Tenant-wide, authority-free contract rather than an
   extension of the Site-scoped Page/Article tree or a generic folder engine.
6. **D20** Saved Library Views remain scoped to D18's exact Site Content Library
   surface and do not silently extend to Tenant-wide Media.
7. **D21** Page/Article Trash never cascades into Media.
8. **D22** exact locale lineages own usage-local alt/caption meaning with no
   silent field fallback.
9. **D23** permits Tenant-wide Media only when the current target Site is
   qualified; content copy reuses references rather than bytes.
10. **D24** has one public audience; protected operational/safety artifacts stay
    in authenticated app-owned surfaces.
11. **D25** Preview renders exact authorized candidates and does not create a
    public URL.
12. **D26** public form attachments remain excluded.
13. **Phase 10** remains the current publication ceiling and owner of
    restricted-ministry safety, source reclassification, withdrawal, and
    adverse containment. D27 may add media-specific evidence and review but
    cannot weaken or replace that firewall.
14. **Phase 29** owns immutable byte/rendition custody, quarantine, storage,
    access audit, hold/disposition mechanics, and physical execution under the
    exact owner-supplied policy; D27 retains public-media purpose-retention and
    disposition authority.

## Evidence-led corrections to the current implementation

- [`media.ts`](../../../../apps/admin/src/cms/collections/media.ts) is one
  versionless image collection with one required global alt value and two fixed
  sizes. It is migration input, not D27 authority.
- The exact installed Payload update path deletes old associated files; Payload
  document versions are not file versions.
- [`payload-runtime-integrations.ts`](../../../../apps/admin/src/cms/payload-runtime-integrations.ts)
  issues a Vercel client-upload grant to any authenticated Payload user beneath
  one shared prefix. It is not Tenant/session/profile/size/idempotency proof.
- The current Vercel adapter is public-only. Direct upload occurs before the
  Payload document is durable and can leave public orphans.
- [`serializer.ts`](../../../../packages/api/src/cms/public/serializer.ts)
  returns provider-shaped file data and original filenames, while current tests
  do not prove a real anonymous released fetch.
- Legacy Supabase public buckets and ownership policies are unsuitable: object
  ownership is not authorization, and service-created objects can have no user
  owner.
- Supabase database backups do not restore Storage bytes, and its S3 interface
  does not provide object versioning. Independent object backup/restore proof is
  a launch gate.
- Core already has one shared Inngest executor, dispatch ledger, work claims,
  retries, concurrency, and recovery path. D27 does not create another queue or
  workflow authority.

Full evidence:

- [Payload 4 DAM primary-source research](./phase-23-d27-payload-4-dam-primary-source-research.md)
- [Supabase byte custody and RLS research](./phase-23-d27-supabase-byte-custody-and-rls-research.md)
- [Nonprofit DAM UX and workflow research](./phase-23-d27-nonprofit-dam-ux-and-workflow-research.md)
- [Ruthless adversarial review](./phase-23-d27-public-media-adversarial-review.md)

## Alternatives disposed

### A-prime — Payload Media is the complete authority

**Reject.** It is initially smaller but makes an internal/canary provider pin,
destructive re-upload, public storage behavior, incomplete references, global
alt text, and mutable file URLs into product truth. It contradicts D1, D9, D22,
D23, and Phase 29.

### B-prime — Defer every usable public-media improvement to Phase 29

**Reject.** It preserves one future custody owner but leaves Phase 23 unable to
provide secure, usable public media and forces staff to keep the current
versionless/public/provider-shaped model. Phase 29 needs the same boundary
regardless.

### C-prime — Bounded Public Media Catalog over immutable custody

**Proceed with the hardened formulation.** It fixes the irreversible identity,
tenant, release, recovery, and UX boundaries now, while limiting launch to one
complete public-still-image product and deferring speculative enterprise DAM
features.

## Exact founder-ratified C-prime-R formulation

> **C-prime-amended-and-hardened (C-prime-R) — One bounded Tenant-wide Public
> Media Catalog with current Site-use qualification over a Phase-29-compatible
> immutable byte-and-rendition custody contract.**
>
> 1. **One bounded public-media product.** D27 delivers one Tenant-wide **Media**
>    catalog for reusable still imagery used by Public Pages, Articles,
>    missionary/project presentation, SEO/social presentation, and certified
>    Site packages. It is DAM-grade within that public-publishing purpose, not a
>    general file manager, private document store, form-attachment system,
>    package source repository, or enterprise creative-operations suite.
> 2. **Exact authority split.** D27 owns stable logical media identity, neutral
>    catalog metadata, revision lineage, current target-Site qualification, and
>    the derived Used-in experience. Exact Page/locale placements own contextual
>    accessibility, caption, credit display, crop, and action meaning. D27 also
>    owns the public-media rights/safety evidence, media-specific review record,
>    purpose-retention policy/reference, hold requests, and disposition
>    authorization without superseding the named legal, consent, safeguarding,
>    or records source. Phase 10's current publication ceiling,
>    restricted-ministry safety, source reclassification, withdrawal, and
>    adverse containment always outrank D27; Phase 29 owns immutable byte
>    identity, private intake,
>    quarantine, inspection, renditions, provider copies/access, access audit,
>    application of exact owner-requested holds, and physical disposition
>    mechanics. It never invents or weakens retention. D1 alone activates an
>    exact public generation;
>    recovery is a newly validated forward successor selecting retained safe
>    versions, never mutation or destructive rollback. Payload, Supabase Storage,
>    Vercel Blob, processors, scanners, and CDNs are replaceable adapters, never
>    product authority.
> 3. **One closed launch kind profile.** Launch admits one code-owned,
>    versioned `public-still-image` profile. It accepts JPEG, PNG, WebP, AVIF,
>    and common HEIC/HEIF camera sources only through a certified safe decoder
>    and deterministic re-encoding path. It rejects multi-frame/animated input,
>    SVG or other active content, arbitrary files, PDFs, uploaded video/audio,
>    fonts/icons, and unknown formats with calm pre-transfer or private failure
>    guidance; it never silently flattens or changes meaning.
> 4. **Additive future compatibility, not speculative implementation.** D27's
>    asset-kind and placement-capability catalogs and Phase 29's input-validator,
>    processor, rendition-profile, and delivery-class catalogs are small,
>    code-owned, and versioned under their respective owners. A future certified
>    public-document or audiovisual profile can reuse stable asset/revision/
>    qualification/usage/D1 identity without a data rewrite, but no unselected
>    processor, transcription, PDF certification, or arbitrary tenant-defined
>    kind ships now. Unknown versions fail closed.
> 5. **Stable assets and immutable revisions.** A logical Media item has one
>    opaque stable Tenant-owned identity. **Add new version** creates a new
>    append-only revision with an exact custody byte reference; it never
>    overwrites a provider pathname or mutates historical bytes. Titles,
>    folders, original filenames, Page paths, and provider keys are not
>    identity. Existing D1 generations retain their exact revision and
>    rendition until an authorized successor generation changes them.
> 6. **Phase-29-compatible custody now.** Every accepted source has an opaque
>    immutable byte ID, SHA-256 digest, verified type/size/dimensions, inspection
>    state, private storage-copy record, and provenance facts. Every rendition
>    names the exact source byte, code-owned rendition profile/version,
>    processor/version, output digest, dimensions/format, storage copy, and
>    readiness. Originals, quarantine, candidates, hidden names, EXIF/GPS,
>    consent artifacts, and diagnostic metadata are never public delivery.
> 7. **Provider-neutral byte operations.** One qualified custody port creates
>    exact upload grants, finalizes and verifies objects, privately streams to
>    processors, writes immutable outputs, prepares a verified private delivery
>    copy, deletes an authorized copy through the provider API, cursor-lists for
>    reconciliation, and emits redacted diagnostics. Product references never
>    store a raw provider or signed URL or depend on provider folder semantics.
>    A provider outage or missing production configuration fails new writes
>    private and closed; it never falls back silently to public or ephemeral
>    local storage.
> 8. **Exact server-authorized upload sessions.** The server derives a short-
>    lived grant from the authenticated actor's active Tenant membership,
>    capability, selected kind profile, expected asset/revision, maximum bytes,
>    allowed content family, opaque provider key, expiry, and idempotency key.
>    The browser cannot choose Tenant scope, object identity, public access,
>    readiness, or overwrite behavior. Anonymous, donor, wrong-Tenant, inactive,
>    replayed, expired, or broader grants fail without enumeration.
> 9. **Resilient private transfer.** Bytes land in private intake. Bounded direct
>    and resumable upload may optimize weak mobile networks, with truthful
>    progress, pause/cancel/retry, navigation recovery, and one persistent
>    upload tray. Provider completion callbacks are wake-ups, not proof; lost,
>    duplicated, reordered, cancelled, and abandoned sessions converge through
>    idempotent finalization and reconciliation without duplicate logical media
>    or public orphans.
> 10. **Independent content qualification.** Finalization HEADs the exact object,
>     computes its digest, verifies signature and decoded type, enforces byte,
>     pixel, frame, decompression, CPU/memory, and wall-time budgets, applies the
>     current scan/sandbox policy, safely decodes, normalizes orientation/color,
>     removes sensitive metadata, and deterministically re-encodes public
>     outputs. Extension, browser MIME, bucket MIME rules, or Payload acceptance
>     never establish safety. Unknown, timed-out, malformed, active, or infected
>     input remains private and blocked with a reason and recovery action.
> 11. **Small materialized rendition profiles.** D9 presentation packages and
>     D7 semantic slots request named outcomes such as Hero, Card, Square,
>     Portrait, or Social; ordinary staff never enter arbitrary pixels or
>     transformations. Phase 29's code-owned profile materializes only its
>     pinned compatibility matrix—normally one modern AVIF or WebP output plus a
>     JPEG-or-PNG fallback as appropriate—with width/height and stable cache
>     identity. A recrop, focal change, processor change, or profile change
>     creates new immutable renditions and cannot mutate a released URL.
> 12. **Independent facts, derived calm labels.** Upload/processing, editorial
>     completeness, rights, safety, Site qualification, Trash, and D1 usage are
>     separate facts rather than one giant lifecycle enum. The UI derives
>     **Uploading**, **Preparing for the web**, **Needs details**, **Under
>     review**, **Ready to use**, **Unavailable for this Site**, **Could not
>     process**, **Blocked for safety**, or **In Trash**, and always exposes the
>     cause and next safe action. **Uploaded** and **Ready to use** never mean
>     public.
> 13. **Purposeful catalog metadata.** The asset stores a neutral staff title,
>     bounded source/credit facts, ordinary organizational folder/tags, and
>     privileged original-name/provenance references. Search indexes only
>     permitted neutral terms. Sensitive person, location, consent, review, or
>     evidence data stays in protected fields/owners and never enters ordinary
>     search, URLs, analytics, logs, traces, metrics, provider tags, public
>     projection, or unprivileged exports.
> 14. **Rights, consent, and ministry safety are current evidence.** A small
>     versioned policy profile records the rights basis, evidence reference,
>     required credit, permitted Sites/territories/purposes, expiry, consent and
>     safeguarding state, reviewer, and reason codes. Contributors choose plain
>     source options and answer one calm question about people, children,
>     workers, locations, documents, badges, screens, or ministry activity;
>     **Not sure** is safe and routes to review. Uncertainty, expiry, withdrawal,
>     or missing evidence never defaults to public eligibility. D27's
>     media-specific result is only an input beneath Phase 10's strictest-
>     applicable publication firewall; it cannot publish a restricted person,
>     ministry, identity, location, or relationship that Phase 10 withholds.
> 15. **Protected visibility is narrow.** Ordinary Tenant media and a single
>     safety-restricted visibility class replace arbitrary per-asset ACL
>     matrices. Unauthorized users cannot enumerate a restricted record through
>     search, count, title, thumbnail, duplicate result, direct URL, error, or
>     timing. Authorized safety reviewers explicitly reveal protected previews;
>     every reveal and verdict is audited. Sensitive evidence is referenced,
>     not copied into the catalog.
> 16. **Reason-coded current Site qualification.** For an exact Tenant, Site,
>     asset revision, policy version, rights/safety evidence, and rendition
>     profile, D27 derives **Allowed**, **Needs review**, or **Blocked** plus
>     stable reason codes and expiry/supersession facts. Tenant-wide does not
>     mean every Site. Qualification invalidates and recomputes when any
>     governing fact changes. Crossing the earliest governing rights, consent,
>     or safety expiry is an automatic adverse transition for current
>     qualification and origin authorization; it does not wait for a user edit,
>     a new release, or a best-effort cleanup job. Stale or unknown proof fails
>     closed for selection, release, retrieval, replacement impact, and disposal.
> 17. **Usage-local presentation meaning.** Every Page/Article/SEO/social/
>     package placement pins the exact logical asset revision and required
>     rendition profile while owning its Site, locale lineage, slot/purpose,
>     informative/decorative/functional/image-of-text/complex-image treatment,
>     localized alt and caption, displayed credit, link/action semantics, any
>     Page-owned visible or linked equivalent content, and usage-local crop or
>     art direction. An asset-level visual description is suggestion-only; it
>     never silently overwrites or completes a placement.
> 18. **Exact localization and accessibility.** Reusing a byte across locales is
>     allowed; reusing apparently completed text is not. Every locale lineage
>     starts explicitly under D22, shows source and translation status, and has
>     no silent field fallback. AI-generated or machine-translated descriptions,
>     if later enabled, remain clearly labelled suggestions requiring human
>     review. Public output follows the exact placement's informative,
>     decorative, functional, image-of-text, and complex-image decision. The
>     common picker keeps three plain-language choices and reveals one bounded
>     **Contains essential text or detailed information** branch only when
>     needed. Authors are guided to recreate ordinary text as HTML. An essential
>     logo or faithful source artifact used as text requires its exact textual
>     equivalent; a chart, map, diagram, or other complex image requires concise
>     alt plus a Page-owned visible or linked full equivalent. Missing required
>     equivalent content blocks D1 rather than hiding information in long alt.
> 19. **D1 release is the only publication event.** D1 prepares one exact
>     generation that closes over qualified asset revisions, placements,
>     rendition outputs, and proof snapshots. It re-proves current membership,
>     capability, Site qualification, rights/safety, rendition/copy health, and
>     adverse state; prepares or resolves the exact immutable delivery bytes in
>     private, publicly unroutable custody; verifies existence and digest; then
>     atomically activates the generation and its exact release-qualified media
>     routes in the same serving-head transaction. Candidate preparation never
>     creates anonymous reachability. Any pre-CAS media, compiler, copy, route,
>     or proof failure leaves the prior generation live. After activation,
>     cache/CDN convergence is separately observable and repairable; it neither
>     changes the serving head nor rewrites activated history.
> 20. **Private Preview and explicit delivery classes.** D25 Preview uses an
>     app-owned authenticated, exact-candidate, `no-store` path and never turns a
>     signed provider URL into permission or sharing. Anonymous visitors receive
>     only an Asym-owned, release-qualified, immutable URL whose resolver proves
>     one of two exact D1 admission facts: the route belongs to the current
>     active generation, or it belongs to a **delivery-retained** generation
>     whose code-owned cache-convergence deadline has not passed. Delivery
>     retention is created only when an active head is replaced, is bounded by
>     the maximum published response/cache lifetime plus clock-skew margin, and
>     grants read-only route continuity so a cached or in-flight Page never
>     assembles a mixed generation. It is not recovery retention, does not make
>     private history public, and expires automatically. Phase 10 or another
>     current adverse source denies origin access immediately in either state;
>     recovery-retained bytes alone are never anonymously readable. Raw provider
>     URLs are never serialized. The resolver emits the allowlisted image
>     `Content-Type`,
>     `X-Content-Type-Options: nosniff`, non-user-controlled inline disposition,
>     and bounded CORS/resource policy. Ordinary released media uses long-lived
>     content-addressed edge/browser caching only when no governing fact is
>     time-bounded. Any media with time-bounded rights or consent is necessarily
>     revocation-sensitive and uses controlled delivery whose cache freshness,
>     stale allowances, and delivery-retention deadline cannot cross the earliest
>     governing expiry after the configured clock-skew margin. Other separately
>     qualified revocation-sensitive media uses controlled delivery or bounded
>     cache TTL and tested purge. UI copy promises prompt future block/takedown,
>     not impossible erasure from already-downloaded devices or third-party
>     caches.
> 21. **Candidate versioning, never global replacement.** **Add new version**
>     inherits only still-valid neutral metadata, shows current-versus-candidate
>     comparison, processing and qualification, affected Pages/Sites, and
>     **Include in next release**. It never auto-activates. Current live,
>     delivery-retained, scheduled, Preview, and recovery-retained references
>     stay exact until their owning workflow deliberately selects a qualified
>     successor.
> 22. **Adverse-first withdrawal is cause-owned.** A current Phase 10 source
>     reclassification/withdrawal or an actor resolving D27's narrow
>     `public_media.restrict` capability may create the applicable adverse fact;
>     restricted-person or restricted-ministry action additionally requires the
>     Phase 10 `security_clearance` floor. Ordinary staff may report a concern
>     but cannot issue a restriction. The command re-proves current actor,
>     Tenant, capability, source ownership, and exact asset revision; a wrong-
>     Tenant, stale, revoked, or insufficient actor fails without enumeration.
>     Current rights/safety withdrawal or the governing clock crossing an exact
>     rights, consent, or safety expiry immediately blocks new selection,
>     candidate preparation, release, and origin authorization—including active
>     and delivery-retained routes—raises exact affected live, scheduled,
>     candidate, draft, package, SEO/social, and retained uses, and invokes the
>     existing cause-owned takedown/purge contract. Expiry is a deterministic
>     policy transition and needs no human restriction capability; changing or
>     waiving it requires a newly authorized source fact, never a mutable clock
>     override. Controlled origin retrieval denies immediately, while CDN/
>     browser convergence follows the tested delivery-class TTL and purge
>     behavior and remains visibly measured. D27 never silently substitutes
>     another image, mutates source content, or claims cached, downloaded, or
>     third-party copies were erased.
> 23. **Complete, rebuildable Used in.** One source-qualified derived projection
>     covers draft Pages, exact Preview candidates, schedules, active,
>     delivery-retained, and recovery-retained generations, reusable content,
>     Navigation,
>     missionary/project profiles, D7 Media/Gallery section placements,
>     migration-only quarantined legacy Rich Text upload/image references,
>     SEO/social fields, and certified packages. It groups authorized results by
>     Site and Live/Scheduled/Draft/Retained class and links to exact owners. Payload Join
>     fields may assist known relationships but are never deletion authority.
>     A stale/rebuilding projection cannot say **Unused** or permit disposal.
> 24. **Media organization, tags, and duplicates never become authority.** D18
>     remains Page/Article-only. D27 separately owns one optional, private,
>     Tenant-wide **Media Folder** tree for Media only: opaque stable folder
>     identity, one label, one optional same-Tenant parent, at most five levels,
>     and one asset placement or **Unfiled**. It is not a shared/generic folder
>     engine. Create, rename, move, and remove use one authorized, idempotent,
>     expected-state command; removing a folder visibly rehomes direct assets to
>     its parent or Unfiled and reparents immediate children without deleting,
>     trashing, unpublishing, or moving provider bytes. Folders and bounded tags
>     help staff find media but never control Tenant, permission, identity,
>     storage path, Site qualification, retention, release, or deletion. Same-
>     Tenant digest equality defaults to **Use existing** but never auto-merges
>     distinct rights/consent/retention meanings. Cross-Tenant duplicates are
>     invisible. Phase 29 may later show or adapt this owner-supplied Media
>     placement inside generalized file tooling but cannot absorb, reinterpret,
>     or silently replace it with a provider/file hierarchy; any unified-folder
>     migration requires a separate compatibility decision.
> 25. **Recoverable Trash and independent disposition.** Moving Media to Trash
>     stops new selection, records actor/reason, and shows impact but never
>     cascades through live, retained, scheduled, draft, SEO/social, package, or
>     Page records. Restore makes it available to authorized staff without
>     republishing or reviving expired proof. There is no **Empty Trash**.
>     D27's bounded, append-only **Public Media Purpose Retention Policy
>     Version** records Tenant, code-owned profile version, effective time,
>     minimum keep interval measured from the later of Trash entry or last
>     required public/preview/scheduled/delivery/recovery use, approved policy
>     reference, actor, and reason. A Tenant without an approved version uses
>     the code-owned **retain until explicit review** floor; launch never
>     auto-purges. Only `public_media.retention.manage` may append a version;
>     arbitrary conditions, retroactive mutation, and silent shortening are
>     forbidden. All current minimum-keep floors—legal/records, consent evidence,
>     safeguarding/incident, hold, source retention, and D27 purpose—compose
>     strictest-wins. A source-owned required-disposition/erasure obligation is
>     tracked separately with its exact owner, version, and due time; it never
>     silently defeats a hold or minimum floor. A conflict becomes one urgent,
>     cause-owned legal/records review rather than an automatic choice. A shorter
>     policy never disposes anything automatically, while a longer policy or new hold
>     immediately fences pending authorization. D27 may authorize one explicit
>     disposition only after current policy version/effective-time evaluation,
>     reference health, delivery- and recovery-retention, requested hold,
>     incident, backup, and actor-authorization gates agree; execution re-proves
>     all current facts so a policy-change race invalidates the stale request.
>     Phase 29 alone applies the hold/disposition mechanics and verifies provider
>     deletion.
> 26. **One quiet, purpose-built Media workspace.** Core's `StudioLayout`,
>     `PageShell`, fields, filters, dialogs/drawers, responsive tables, Base UI
>     controls, tokens, and feedback patterns remain the design system. **All
>     media**, **Needs attention**, **Recently used**, and **Trash** lead to
>     grid/list results, restrained search/filters, optional folder rail, and an
>     ordered detail inspector: Preview/status, Details, Rights & safety, Can be
>     used on, Used in, Versions, Activity, and collapsed Technical details.
>     Provider jargon and positive-status noise stay out of ordinary work. D27
>     launches only its four built-in views and transient URL-addressable Media
>     filters; it neither reuses nor widens D20's Site Content Library saved-view
>     store. A future Media-specific saved-view decision requires measured need
>     and a separately qualified Tenant-wide ownership/sharing contract.
> 27. **Fast Page-local selection and resilient contribution.** **Choose media**
>     defaults to kind-compatible **Ready for this Page and Site**, with Library
>     and Upload tabs, actual slot preview, contextual accessibility choice,
>     usage crop, explicit confirmation, and focus return. Authorized users may
>     reveal unavailable items with exact reasons; unauthorized users see no
>     existence. Bulk upload preserves per-file success, reports truthful
>     progress/failure, supports review-next and safe common-field edits, and
>     works on weak mobile connections without losing Page edits or duplicating
>     media.
> 28. **Accessible, responsive operation is a release contract.** Media remains
>     complete by keyboard, screen reader, touch, pointer without drag, 320 CSS-
>     pixel reflow, 200–400% zoom, forced colors/high contrast, reduced motion,
>     RTL, CJK, long translations, and constrained networks. Grid/list semantics,
>     44×44 targets, visible/unobscured focus, dialog focus restoration, error
>     summaries, bounded polite progress announcements, named menus/checkboxes,
>     non-color status, and click/directional/numeric crop alternatives are
>     mandatory. Results use explicit pagination or **Load more**, not infinite
>     scroll or an unqualified ARIA grid/feed.
> 29. **Capability and Tenant safety are structural.** Separate capabilities
>     cover contribution, ordinary management, media-specific rights/safety
>     review, live restriction, exact Site use, D1 publication, purpose-
>     retention policy management, custody operation, and disposal
>     authorization. Phase 10 `security_clearance` remains an additional
>     strictest-wins floor for restricted-person/ministry media. Every
>     Tenant-owned child carries the operational Tenant UUID; composite Tenant
>     keys/FKs prevent cross-Tenant relationships; RLS and matching indexes are
>     deny-by-default; protected custody tables are non-exposed; server commands
>     reauthorize even with a service role. Payload tenant IDs are translated
>     through one certified mapping and never guessed equivalent.
> 30. **One idempotent post-commit execution path.** D27 reuses Core's existing
>     shared Inngest client, dispatch ledger, work claims, retries, concurrency,
>     dead-letter, and recovery seams; it adds no Supabase Queue or second
>     workflow authority. Database transactions record product state and
>     identifier-only dispatch requests, never perform object/network work.
>     Deterministic keys, expected-state transitions, fenced claims, and sweeps
>     heal object-before-DB, DB-before-dispatch, stale callback, duplicate event,
>     and partial rendition/copy/deletion outcomes without repeating success.
> 31. **Typed, indexed, bounded catalog operations.** Postgres product tables own
>     typed security/hot facts; JSON is limited to versioned provider diagnostics.
>     Neutral search uses a stored text vector/GIN plus typed filters; browse uses
>     keyset pagination; every composite FK and RLS predicate is indexed. Catalog
>     reads never list provider objects or fetch originals. Reference projection
>     updates atomically per exact source version/generation rather than parsing
>     opaque Payload JSON in database triggers.
> 32. **Quiet health, privacy-safe telemetry, and cost control.** Authorized
>     staff see actionable counts and oldest age for upload, processing,
>     rights/safety, qualification, projection, rendition/copy, release, Trash,
>     and takedown problems plus bounded retry/reconcile. Operations track
>     throughput/latency/error/orphan/digest/public-fetch/cache/storage/egress/
>     backup facts and denied cross-Tenant attempts using opaque correlation IDs.
>     Tokens, signed URLs, filenames, EXIF/GPS, evidence, titles, people, and
>     content never enter events, logs, traces, analytics, metrics, or tags.
>     Per-Tenant source-byte, pixel, batch, concurrency, rendition, retained-
>     candidate, storage, transform, egress, and backup budgets bound cost.
> 33. **Object durability and provider exit are launch requirements.** Database
>     backup is not byte backup. Before activation, operations prove encrypted
>     independent object export/replication, digest manifests, DB/object
>     reconciliation, declared RPO/RTO, least-privilege restore, disposition
>     tombstones/restore suppression, and a restore exercise. Provider migration
>     is copy, checksum, register secondary, switch preferred read, observe, then
>     later dispose; logical asset/revision/rendition and D1 identities never
>     change. A DB-only restore surfaces missing bytes and cannot mark them Ready;
>     no restored object becomes selectable or deliverable until reconciliation
>     reapplies current holds, adverse state, and verified disposition history.
> 34. **Payload is authoring machinery, not custody.** The exact qualified
>     Payload pin may provide collection metadata, relationships, folder UI,
>     custom components, and adapter calls behind this contract. Native re-
>     upload/delete, document versions as file versions, direct public storage,
>     global required alt, provider filenames, generic list/edit UI, incomplete
>     references, unrestricted Local API override, and announced-but-unshipped
>     Payload 4 DAM features are not D27 authority. Exact-pin migrations, types,
>     import map, build, access, upload, public-fetch, and Admin UX conformance
>     tests gate every upgrade.
> 35. **Deliberate exclusions and evidence-triggered expansion.** Launch adds no
>     AI tagging, face recognition, visual similarity, background removal,
>     comments/annotation, creative approval graph, public share portal, stock
>     integration, arbitrary tenant metadata/workflow/transform code, cross-
>     Tenant sharing, external search, database partitioning, Realtime
>     dependency, per-Tenant buckets, destructive global replace, or second
>     release head. IPTC subset import/export and C2PA preservation/validation
>     may follow as bounded evidence features; new kinds/providers require
>     measured need, primary-source qualification, privacy/cost review, and an
>     explicit compatible profile decision.
> 36. **No Tenant activation without proof.** Launch gates cover migration
>     inventory, malicious/oversize/HEIC/animation corpus, metadata removal,
>     tenant/RLS/service-worker isolation, idempotency/races/fault injection,
>     orphan reconciliation, exact D1 copy/fetch/cache/delivery-retention/
>     forward-recovery/withdrawal, automatic active-route expiry with cache
>     freshness capped before the earliest governing expiry, Phase 10
>     restriction allow/deny/wrong-Tenant/stale-authorization, contextual
>     informative/decorative/functional/image-of-text/complex-image completion
>     and equivalent-content release blocking, usage rebuild, Trash/restore,
>     retention-policy version/effective-time/
>     fail-closed default/strengthening/shortening/required-disposition conflict/
>     disposition races, object
>     backup/restore/provider
>     migration, 25,000-item search, 50-item bulk upload, constrained mobile,
>     processor/cost budgets, and the full accessibility matrix. Representative
>     nonprofit cohorts must meet the documented completion/comprehension
>     targets, including zero users believing upload publishes or Restore
>     republishes. D27's own Tenant × environment Media cutover admits only a
>     complete migration cohort after every row, byte, reference, retained public
>     route, compatibility reader, and exception is accounted for; the old
>     mutable writers are disabled in the same cutover. D10's Site Presentation
>     activation is not reused or widened.

## Adversarial result by required category

| Category                  | Material concern? | Highest baseline risk | Hardened result                                                        |
| ------------------------- | ----------------- | --------------------- | ---------------------------------------------------------------------- |
| Brittleness               | Yes               | Critical              | Immutable identities, provider ports, exact-pin graduation             |
| Technical debt            | Yes               | High                  | Separated authorities and one executor/search/design system            |
| Edge cases                | Yes               | Critical              | Closed kind, safe decode, idempotent concurrency and reproof           |
| Footguns                  | Yes               | Critical              | Private intake, precise copy, candidate versions, fail-closed config   |
| Tenant safety             | Yes               | Critical              | Operational Tenant keys, composite FKs, RLS, non-enumeration           |
| Overengineering           | Yes               | High                  | Complete still-image scope and explicit anti-bloat line                |
| UX/UI and friction        | Yes               | High                  | Specialized progressive workflow with measurable task gates            |
| Hidden coupling           | Yes               | Critical              | Typed phase ownership and exact references                             |
| Failure modes             | Yes               | High                  | Saga/reconciliation, adverse delivery, honest recovery                 |
| Data integrity            | Yes               | Critical              | Append-only bytes/renditions and healthy projections                   |
| Security/privacy          | Yes               | Critical              | Private originals, protected evidence/preview, redacted telemetry      |
| Scale/performance         | Yes               | High                  | Bounded processing/renditions, indexes, keyset, budgets                |
| Operational burden        | Yes               | High                  | Automated health, expiry, reconciliation, runbooks                     |
| Observability gaps        | Yes               | High                  | Custody/release/projection metrics and synthetic fetches               |
| Dependencies/integrations | Yes               | High                  | Thin adapters, exact pins, official-source upgrade qualification       |
| Migration/upgrades        | Yes               | High                  | Inventory, requalification, dual-read compare, provider-neutral IDs    |
| Other hazards             | Yes               | Critical              | Seam tests, fault injection, no dual writers, D27-owned cohort cutover |

The complete what/why/severity/likelihood/evidence/permanent-fix analysis is in
the [D27 adversarial review](./phase-23-d27-public-media-adversarial-review.md).

## Ratification and activation boundary

The quoted 36-clause C-prime-R block is the complete founder-ratified D27
authority. Supporting research explains it but does not independently expand
it.

Ratification authorizes documentation of the decision only. It does not
authorize implementation, SQL/schema/RLS, bucket/object creation, provider or
dependency adoption, migration/backfill, issue publication, Git publication,
deployment, D1 activation, or production release.

Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack. D27's canonical
terms are preserved here, in the
[Phase 23 decision log](../phase-23-web-studio-cms-decision-log.md), and in
[ADR-0171](../../../adr/0171-tenant-wide-public-media-catalog-and-immutable-custody.md)
without overwriting accepted Phase 22 language.
