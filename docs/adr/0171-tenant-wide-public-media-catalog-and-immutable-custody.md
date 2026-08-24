# ADR-0171: Tenant-wide Public Media Catalog with Site-use qualification and immutable custody

**Status:** Accepted (founder-ratified Phase 23 D27 C-prime-R, 2026-08-23)

## Context

Phase 23 must give nonprofit missions staff one excellent place to upload,
find, qualify, reuse, replace, restrict, and recover still imagery used across
Public Pages, Articles, missionary and project presentation, SEO/social cards,
and certified Site packages. That experience must remain understandable to a
small communications team on weak mobile connections while protecting people,
children, workers, locations, consent, rights, and cross-Tenant confidentiality.

Payload's upload collections, relationships, folders, Admin components, and
storage adapters are useful authoring machinery, but native re-upload and
delete behavior, provider paths, document versions, and announced future DAM
features do not establish immutable historical custody. Supabase provides
Postgres, RLS, and private object-storage primitives, but its service role
bypasses RLS, the Storage schema is not an application contract, and database
backup does not include stored objects. Neither product can silently become
the public-media domain authority.

The surrounding authority is already divided. Phase 10 remains the strictest
publication-safety and adverse-containment ceiling. D1 alone activates an exact
Public Site Generation. D22 owns exact locale lineages, D25 owns private whole-
Site Preview, and D9 owns certified presentation packages without owning media
custody. Phase 29 will own generalized immutable byte-and-rendition custody,
quarantine, provider copies, access audit, backup, holds, and physical
disposition. D27 therefore needs a complete useful DAM now while preserving a
compatible, non-duplicative seam for Phase 29.

The deciding risks are mutable bytes under stable URLs, public-on-upload paths,
stale rights or consent, contextual accessibility copied as global metadata,
incomplete reference discovery, destructive delete, wrong-Tenant enumeration,
mixed-generation cache delivery, and a database-only recovery plan. The user
experience must make the safe path the easy path without exposing a generic
ACL engine, storage-provider concepts, or an enterprise creative-workflow suite.

## Decision

<!-- prettier-ignore -->
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

## Consequences

- D27 is one bounded Tenant-wide DAM for reusable public still imagery, not a
  universal file manager. Launch has one closed, code-owned
  `public-still-image` kind and explicitly excludes documents, arbitrary files,
  animation, uploaded audio/video, package sources, and private form evidence.
- A stable logical Media item owns append-only immutable revisions. Every
  source and rendition is digest-addressed and records the exact validation,
  profile, processor, dimensions, format, and private storage-copy facts.
  Filename, folder, provider path, Payload document version, and mutable URL
  never become identity.
- Upload is an exact, short-lived, server-authorized, Tenant-bound private
  session. Completion is independently finalized, decoded, inspected, bounded,
  stripped of sensitive metadata, safely re-encoded, and reconciled before any
  item can be considered ready.
- Current rights, consent, safeguarding, Phase 10 safety, and Site qualification
  are reason-coded facts. Missing, stale, unknown, withdrawn, or expired proof
  fails closed. Governing expiry automatically denies active and delivery-
  retained origin access and bounds cache freshness; it does not wait for a
  human edit or another release.
- Accessibility and presentation meaning belong to the exact Site × locale ×
  placement. The placement owns treatment, localized alt/caption, credit,
  crop, action, and required image-of-text or complex-image equivalents. D1
  blocks incomplete required equivalents; asset descriptions are suggestions.
- D1 privately proves and atomically activates the complete Page-and-media
  generation. Anonymous delivery uses only Asym-owned immutable release routes.
  Bounded delivery retention supports coherent cached/in-flight Pages, while
  private recovery retention never grants public read. Recovery is a validated
  forward successor, not mutation or destructive rollback.
- Add new version, Used in, Media Folders, bounded tags, duplicate suggestions,
  and recoverable Trash improve staff work without acquiring permission,
  retention, release, provider-path, or deletion authority. Used in is complete,
  freshness-qualified, and rebuildable; stale state cannot claim **Unused**.
- Public Media Purpose Retention Policy versions are append-only and effective-
  dated. The launch default is retain until explicit review, never automatic
  purge. Holds, governing floors, source-required disposition, backup state,
  reference health, and current actor authority are re-proved before Phase 29
  executes any irreversible disposition.
- Tenant isolation is structural: operational Tenant UUIDs, composite Tenant
  keys and foreign keys, indexed deny-by-default RLS where exposed, protected
  custody tables, server-side reauthorization, and one certified Payload-to-
  operational-Tenant mapping. Restricted media cannot leak through counts,
  thumbnails, search, errors, direct routes, duplicates, or timing.
- Core's existing idempotent Inngest execution, dispatch, claims, dead-letter,
  and recovery seams handle post-commit object work. Postgres owns typed facts,
  bounded GIN search, keyset browse, and derived usage. No second queue, external
  search engine, Realtime dependency, per-Tenant bucket topology, or provider
  folder authority is introduced.
- The product exposes a quiet purpose-built Media workspace, Ready-for-this-
  Site picker, resilient upload tray, progressive detail, impact-first version/
  restriction/Trash flows, accessible crop alternatives, and privacy-safe
  health. The full mobile, keyboard, screen-reader, zoom/reflow, forced-color,
  reduced-motion, RTL/CJK, constrained-network, and representative nonprofit
  cohort thresholds are release contracts.
- Independent encrypted object backup, digest manifests, DB/object
  reconciliation, restore exercises, tombstones, restore suppression, declared
  RPO/RTO, and provider-neutral copy/verify/switch migration are launch
  requirements. A database-only restore cannot mark missing bytes ready.
- Payload, Supabase Storage, Vercel Blob, processors, scanners, and CDNs remain
  replaceable adapters behind exact qualified versions and conformance tests.
  Their native convenience behavior cannot widen the ratified authority.

## Ratified synthesis

### Must be fixed before implementation

- Establish the stable asset/revision/byte/rendition/qualification/placement
  authority split and the D1, Phase 10, Phase 29, D22, D25, and D9 boundaries.
- Keep all intake and candidate bytes private; define exact upload grants,
  content qualification, immutable output, current evidence, adverse denial,
  release admission, retention, disposition, and Tenant-isolation contracts.
- Design the specialized staff journeys and cause-owned actions before exposing
  Payload's generic upload collection UI or any provider storage behavior.

### Must be proven before activation

- Satisfy every Clause 36 gate: legacy inventory, hostile corpus, tenant and
  worker denial, fault injection, D1 cache/recovery/withdrawal, automatic expiry,
  Phase 10 restrictions, accessibility equivalents, usage rebuild, Trash,
  effective-dated retention and disposition conflicts, byte backup/restore and
  provider migration, production-shaped scale/cost, full accessibility, and
  representative nonprofit usability.
- Admit only a complete Tenant × environment Media cohort after every row, byte,
  reference, retained route, compatibility reader, and exception is accounted
  for, then disable mutable legacy writers in that same cutover.

### Address only after stable launch evidence

- Consider a bounded IPTC subset or C2PA preservation/validation only after
  measured nonprofit need, privacy review, exact provider qualification, and a
  compatible profile decision.
- Add another public-media kind or provider only through the additive versioned
  catalogs and the same security, durability, UX, and migration proof.

### Monitor; do not prebuild

- Track catalog size, weak-network behavior, processing and reconciliation age,
  storage/egress/backup cost, public route and cache health, restriction/expiry
  convergence, search latency, reference freshness, restore exercises, and
  staff comprehension. Do not prebuild AI tagging, faces, visual similarity,
  arbitrary workflows, public share portals, external search, partitioning, or
  cross-Tenant sharing without evidence.

## Rejected alternatives

- **Payload's native Media collection as product and custody authority:**
  rejected because mutable re-upload/delete, document versions, provider paths,
  incomplete references, Local API override behavior, and evolving DAM features
  cannot guarantee immutable history, adverse-first safety, or D1 coherence.
- **A universal tenant file manager:** rejected because public imagery, private
  documents, form attachments, package sources, and future generalized files
  have different owners, access, retention, safety, processing, and UX needs.
- **Mutable global replacement or provider URL identity:** rejected because it
  changes historical releases and cached pages without an explicit successor.
- **Public-on-upload, public buckets, or raw/signed provider URLs as delivery:**
  rejected because candidate bytes, hidden metadata, expired proof, and private
  history could become reachable outside D1 and current adverse controls.
- **One global alt text, caption, crop, or credit:** rejected because meaning is
  contextual by Site, locale, placement, action, layout, and audience.
- **Provider folders, per-Tenant buckets, or a generic folder engine as
  authority:** rejected because organization must not control identity,
  permission, retention, provider path, release, or disposition.
- **A second queue, external search service, or Realtime dependency:** rejected
  because the existing executor and bounded Postgres catalog meet the launch
  need with fewer authorities and recovery paths.
- **Enterprise DAM scope at launch:** AI tagging, faces, similarity, public
  shares, arbitrary schemas/workflows/transforms, annotations, stock systems,
  and cross-Tenant sharing are rejected until evidence justifies their privacy,
  accessibility, cost, operational, and migration burden.

## Activation boundary

Ratification records architecture only. A future authorized implementation
must satisfy the complete Clause 36 proof and the decision log's inherited
verification matrix before any Tenant activates. D27 owns its all-or-none
Tenant × environment Media cutover; D10 is not widened. Partial migration,
legacy mutable writers, missing bytes, stale references, unqualified providers,
unresolved exceptions, incomplete accessibility, or unproven adverse/cache/
expiry behavior blocks activation.

## References

- [Phase 23 D27 exact formulation and decision brief](../prds/sitestacker-parity/research/phase-23-d27-public-media-authority-decision-brief.md)
- [Phase 23 D27 complete adversarial review](../prds/sitestacker-parity/research/phase-23-d27-public-media-adversarial-review.md)
- [Phase 23 D27 Payload 4 DAM research](../prds/sitestacker-parity/research/phase-23-d27-payload-4-dam-primary-source-research.md)
- [Phase 23 D27 Supabase custody and RLS research](../prds/sitestacker-parity/research/phase-23-d27-supabase-byte-custody-and-rls-research.md)
- [Phase 23 D27 nonprofit DAM UX and workflow research](../prds/sitestacker-parity/research/phase-23-d27-nonprofit-dam-ux-and-workflow-research.md)
- [Phase 23 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md)
- [ADR-0145 — Page-local composition and coherent Site generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [ADR-0151 — Semantic ordinary section catalog](./0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [ADR-0153 — Certified Site-bound custom presentation packages](./0153-certified-site-bound-custom-presentation-packages.md)
- [ADR-0155 — Bounded CMS Rich Text](./0155-bounded-versioned-cms-rich-text-profile-and-typed-video-embeds.md)
- [ADR-0162 — Purpose-bounded Content Library folders](./0162-purpose-bounded-authority-free-content-library-folders.md)
- [ADR-0164 — Personal and Site-shared Saved Library Views](./0164-bounded-personal-and-site-shared-saved-library-views.md)
- [ADR-0165 — Reference-aware recoverable Trash](./0165-asym-owned-reference-aware-recoverable-trash.md)
- [ADR-0166 — Exact localized editorial lineages](./0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [ADR-0168 — One exact public audience](./0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
- [ADR-0169 — Immutable whole-Site Preview Candidates](./0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
- [Payload Uploads](https://payloadcms.com/docs/upload/overview)
- [Payload Folders](https://payloadcms.com/docs/folders/overview)
- [Supabase Storage schema](https://supabase.com/docs/guides/storage/schema/design)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [W3C Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [Dóchas Guide to Ethical Communications](https://dochas.ie/resources/ethical-communications/guide-to-ethical-communications/)

Ratification of this planning decision authorizes no implementation, schema,
SQL/RLS policy, bucket or object creation, migration/backfill, dependency or
provider adoption, issue publication, deployment, D1 activation, release, or
production change.
