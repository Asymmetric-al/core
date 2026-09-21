# Tasks: Web Studio CMS

## Execution Contract

These unchecked items are high-level capability and proof checkpoints for the
complete Phase 23 D1-D36 contract. They are not GitHub tickets, file-by-file
instructions, or permission to reopen ratified decisions. Future tracer-bullet
tickets may combine adjacent checkpoints into independently verifiable vertical
slices, but they may not omit requirements, owner boundaries, negative cases,
or closure evidence from this change.

Implementation order is: authority and compiler foundation; private revision
and exact public generation; Page structure and semantic authoring; presentation
and release; discovery and Library operations; locale, Preview, forms and media;
portability and operations; then capacity, provider admission, clean cutover and
formal evidence closure.

## 1. Authority And Contract Foundation

- [ ] 1.1 Add the `web-studio-cms` capability and preserve the exact D1-D36
      vocabulary, ownership, constraints, and prohibited shortcuts.
- [ ] 1.2 Add the thin Web Studio Operations boundary with feature-owned typed
      commands/queries, trusted actor context, registered service-command
      context, discriminated outcomes, and explicit owner/provider ports.
- [ ] 1.3 Prove every route, server action, job, hook, migration, importer,
      rebuilder, repair tool, and provider callback delegates through an
      admitted command/query rather than writing Phase 23 truth directly.
- [ ] 1.4 Preserve Supabase Auth as sole human identity/session/MFA authority
      and Phase 12 as sole capability decision point; keep Payload Principal
      Link attribution-only.
- [ ] 1.5 Define exact Tenant, environment, Site, locale, resource, purpose,
      expected revision, lease generation, idempotency, receipt, and privacy-
      safe failure contracts for human and service operations.
- [ ] 1.6 Add structural closure guards against public Payload Admin, auth,
      REST, GraphQL, Local API, raw drafts/versions, mutable latest reads,
      provider-side publication, service-role bypass, and alternate public
      readers.
- [ ] 1.7 Extend the sole-public-entry verifier so public code can use only
      `PublishedContentReader` and qualified immutable public-media routes.

## 2. D1 Public Generation And D12 Private Revision Foundation

- [ ] 2.1 Add stable Site-owned ordinary Page identity with immutable Page or
      Article family and sparse exact-locale Editorial/Placement lineages.
- [ ] 2.2 Add independent typed Working Revisions, expected Source Revisions,
      semantic checkpoints, receipts, and restore-as-new-draft behavior for
      every admitted editable resource.
- [ ] 2.3 Add one atomically unique Active Editor Lease per exact resource,
      actor/session ownership, monotonic Lease Generation fencing, renewal,
      expiry, takeover, displaced-session interruption, and compare/copy
      recovery.
- [ ] 2.4 Add bounded coalesced autosave, explicit Save now, honest status,
      lost-acknowledgement receipt lookup, stale comparison, auth refresh, and
      immediate revocation behavior without offline-first or last-write-wins.
- [ ] 2.5 Define the deterministic D1 compiler input manifest, exhaustive
      validation, provider-neutral Public Presentation View Model and artifacts,
      immutable Public Site Generation, and content-addressed digests.
- [ ] 2.6 Add one exact locale serving head with expected-head compare-and-swap,
      receipt-idempotent activation, prior-generation preservation, and
      independently durable downstream convergence intent.
- [ ] 2.7 Add the bounded `PublishedContentReader` query contract and prove
      public requests never compile, migrate, call providers, traverse mutable
      relationships, or read private/editorial records.

## 3. D2-D6 Structure Routes Navigation And Families

- [ ] 3.1 Add Page Placement Revision parent, normalized segment and sibling
      order; deterministic paths and breadcrumbs; cycle, depth, reserved-claim,
      uniqueness, normalization and same-scope invariants.
- [ ] 3.2 Add small and high-fan-out move/rename impact preparation, searchable
      resumable descendant review, atomic branch activation, and 2,000-
      descendant qualification without request-time descendant writes.
- [ ] 3.3 Add permanent same-Page predecessor reservations and direct current-
      route resolution without chains or mutable request-time traversal.
- [ ] 3.4 Add the one exact historical-path repair lane with stable same-Site/
      locale ordinary target identity, strict conflict proof, and no patterns,
      external targets, query transforms, priorities or schedules.
- [ ] 3.5 Add explicit unpublish replacement/not-found behavior and privacy-safe
      public GET/HEAD resolution.
- [ ] 3.6 Add versioned semantic Navigation Revisions, Page-aware assistance,
      stable managed destinations, Live/Draft distinction, and coherent D1
      selection without duplicate Page truth.
- [ ] 3.7 Add exactly Primary and Footer purposes; terminal Links; one-level
      non-navigating Groups; one bounded Primary Prominent action; code-owned
      Site destinations; HTTPS external targets; and safe group removal.
- [ ] 3.8 Add semantic accessible Navigation rendering with native links,
      lists, disclosures and current-location behavior and no `menubar` or N+1
      public resolution.
- [ ] 3.9 Add immutable `general_page` and `article` family behavior, clear
      creation entries, Article leaf/date semantics, and released-family
      replacement or qualified migration.
- [ ] 3.10 Add exact family-compatible Page Starters with inert version/digest
      provenance, fresh seeded identities, no propagation, and explicit Phase
      22 family exclusion.

## 4. D7-D11 Semantic Content Reuse Presentation And Rich Text

- [ ] 4.1 Add the exact launch semantic section catalog and family admission
      profiles with flat ordering, lineage-local identities, typed schemas,
      accessible movement, recoverable removal, and Hero constraints.
- [ ] 4.2 Add type-specific semantic/reference validation, editorial-only
      Impact Statistics, typed Media/Call-to-Action references, and additive
      catalog-version migration/retained-reader contracts.
- [ ] 4.3 Reject generic nested builders, dormant rows/columns/children,
      arbitrary style fields, unknown public rendering, and provider block
      catalogs outside explicit evolution.
- [ ] 4.4 Add exact-scope one-leaf Reusable Sections, explicit create/select,
      fresh placement identities, View uses, Change every use, Make a local
      copy, coherent shared release, retirement, and reference-safe retention.
- [ ] 4.5 Add source-controlled Site-bound Presentation Package manifests,
      first-party qualification, public view-model/capability-island isolation,
      human ownership, supply-chain evidence, accessibility/performance/no-JS
      proof, and last-known-good failure containment.
- [ ] 4.6 Add staff actual-content package preview and design-intent approval
      without package source, dependency, CSP or deployment controls.
- [ ] 4.7 Add complete current-locale-cohort Site Presentation Activation
      Manifests, all-or-none head changes, design-only consequences,
      idempotent receipt recovery, and restore-as-new-successor.
- [ ] 4.8 Add the versioned Rich Text Profile and exact grammar/tooling for
      semantic prose, typed links, safe paste, exhaustive server validation,
      provider-neutral compilation, plaintext/search/export, and migration.
- [ ] 4.9 Add typed YouTube/Vimeo video identity, accessible title and caption/
      equivalent-text proof, click-to-load privacy-conscious rendering,
      sandbox/referrer/CSP restrictions, no autoplay/metadata fetch, and
      accessible provider fallback.

## 5. D13-D17 Scheduling Lists Windows And Search

- [ ] 5.1 Add exact one-time publish and unpublish Scheduled Publication
      Appointments with civil/IANA time proof, exact revision pins, at most one
      unresolved appointment of each kind per Page/locale, publish-before-
      unpublish ordering, immutable successors, idempotency, and no recurring or
      latest binding.
- [ ] 5.2 Add Core-owned long-horizon reconciliation and the bounded six-day
      identifier-only Inngest execution horizon; re-prove current authority and
      D1 inputs at due time and preserve prior Live on failure.
- [ ] 5.3 Add Page scheduling controls and one Scheduled changes workspace with
      Upcoming, Needs attention and History using product language.
- [ ] 5.4 Add one code-owned Dynamic Source Catalog contract with source-
      discriminated semantic Selection Intent, certified owner adapters,
      deterministic bounded resolution, compatibility/migration, and narrow
      source failure containment.
- [ ] 5.5 Admit Article at launch and keep every Phase 22 or future source
      unavailable until its owner publishes and certifies the required public
      projection.
- [ ] 5.6 Add exactly automatic, featured-first and fully chosen curation with
      stable identities, bounded exclusions/selections, deterministic
      deduplication, adverse suppression and recoverable strategy changes.
- [ ] 5.7 Add one Public Page Window profile and opaque placement browse handle
      supporting Show one set, Page links, Load more and bounded Auto-load over
      the same server-rendered anchors.
- [ ] 5.8 Add one URL-named placement-handle/ordinal lane, bounded ephemeral
      state for other lists, canonical validation, malformed-input rejection
      before source work, button-led enhancement over a real anchor, accessible
      focus/history/announcements, JavaScript-off behavior, bounded DOM, one-
      auto-list maximum, and an explicit prohibition on button-only discovery.
- [ ] 5.9 Add one derived exact-public Site/locale search projection, versioned
      Search Documents, launch Postgres FTS adapter, deterministic ranking and
      bounded result windows.
- [ ] 5.10 Add synchronous current admission, adverse priority deletion,
      resurrection fences, durable upsert/delete reconciliation, shadow rebuild
      and atomic derived-head switch, public outage degradation, and staff lag/
      deletion health.
- [ ] 5.11 Verify D17's measured launch objectives for zero ineligible results,
      first-request adverse containment, 60-second p99 removal/addition, a
      warning after 60 seconds, owner action at five minutes, five-minute p99.9
      addition and repair scans, 24-hour reconciliation, zero known adverse/
      orphan drift, and at most 0.1 percent general drift without exposing them
      as Tenant controls or public promises.

## 6. D18-D23 Content Library Locale And Copy

- [ ] 6.1 Add one optional five-level Content Library folder tree plus Unfiled,
      stable opaque identity, same-scope uniqueness and atomic create/rename/
      move/remove/rehome commands.
- [ ] 6.2 Prove folder facts cannot affect Page hierarchy, URL, Navigation,
      Topics, permission, lifecycle, release, search, cache, safety, retention,
      storage path, RLS scope or public output.
- [ ] 6.3 Add one bounded versioned Site Topic Profile, eight-set/500-Topic/
      three-level/20-assignment limits, stable identities, explicit direct
      nonlocalized assignment snapshots shared by every locale lineage, exact-
      locale labels, and release-bound compatibility.
- [ ] 6.4 Add Topic rename/reparent/retire/replace impact and retained-history
      behavior without implicit ancestry, eligibility, route, Navigation or
      permission effects.
- [ ] 6.5 Add bounded personal and Site-shared Saved Library Views with typed
      allowlisted filters/sorts/columns, ownership-copy semantics, CAS conflict
      recovery, 20 personal/five actor-local favorite/20 shared limits, and
      current record reauthorization.
- [ ] 6.6 Add whole-identity non-cascading Trash, exact impact proof, adverse
      public suppression, active-editor fencing, private restore, 90-complete-
      day policy, separately authorized purge and no Empty Trash.
- [ ] 6.7 Add exact BCP-47 Localized Editorial lineages, Start blank/Copy from
      provenance, Source changed comparison, exact-locale authoring/resolution,
      provider fallback disabled, and independent locale release/unpublish/
      Trash/recovery.
- [ ] 6.8 Add manifest-driven Copy to another Site preflight and commit,
      exhaustive copy/materialize/remap/review/never classification, fresh
      identities, explicit repairs, one private target draft, and no authority
      transfer or synchronization.

## 7. D24-D28 Public Audience Preview Forms Media And Sharing

- [ ] 7.1 Add exact code-owned `public` to every public context/artifact and
      prove normalized public output is invariant across authentication, role,
      cookie, campaign, referrer, geography, experiment, device and crawler.
- [ ] 7.2 Keep Listed and Shared by link as reach dispositions, hand private
      tasks to app-owned authenticated routes, and structurally prohibit public
      compiler/package imports of auth or personalization context.
- [ ] 7.3 Add quick acknowledged Page Preview, exact pinned preview and complete
      immutable Whole-Site Preview Candidate preparation with deliberate
      revision inclusion, bounded compilation, CAS seal and no partial browse.
- [ ] 7.4 Add per-request Preview reauthorization, candidate-local route graph,
      private/no-store/noindex responses, expiry/revocation invalidation, side-
      effect-dark dependencies, and no live fallback or candidate promotion.
- [ ] 7.5 Add versioned purpose-bounded public Form Definitions and released
      Route Plans with exactly one certified Primary Outcome and bounded Tenant
      presentation customization; build the five-step staff journey on the
      version-pinned shared `useAsymForm` adapter while public submission stays
      native, no-JavaScript capable and exactly server-authoritative.
- [ ] 7.6 Add one atomic transaction for Form Submission Occurrence, exact Route
      Plan, Primary work, every child intent and corresponding product-owned
      workflow-dispatch/outbox request before **Received**, plus independent
      notification and acknowledgement recovery, same-Tenant verified
      destinations, body-safe evidence, retention, abuse bounds and accessible
      validation.
- [ ] 7.7 Add identifier-only post-commit Inngest form execution and qualified
      Email Studio/Resend owner ports: separate compatible Live publications,
      no raw Resend template authority, independent recipient intents, product
      idempotency beyond 24 hours, verified/deduplicated monotonic webhook
      evidence and distinct accepted/delivered/bounced/suppressed/complained/
      failed facts. Keep uncertified domain outcomes, payments, uploads and raw
      Payload submissions unavailable.
- [ ] 7.8 Add one Tenant-wide public-still-image Media catalog with opaque
      logical identity, append-only revisions, neutral metadata, protected
      provenance, and exact D27 logical/evidence/qualification/placement versus
      Phase 29 physical byte/quarantine/rendition/provider-copy/hold/disposition
      authority. Add private upload grants, hostile-file verification, certified
      deterministic rendition processing, and provider-neutral custody ports.
- [ ] 7.9 Add current rights/consent/safeguarding/Phase-10/Site qualification,
      expiry, placement-local accessibility and crop/art direction, exact D1
      byte proof, non-enumerating safety-restricted visibility with audited
      reveal/verdict, active/delivery-retained/recovery-retained delivery
      classes, expiry-capped cache/retention and immediate adverse origin denial.
- [ ] 7.10 Add complete rebuildable Used in evidence, media folders, duplicate
      suggestion without auto-merge, bounded tags, permitted-neutral-only
      search, and a separate optional five-level private Tenant-wide Media-only
      folder tree plus Unfiled with no authority effects. Add non-cascading
      Media Trash, strictest-wins retention/holds, no launch purge, backup/
      restore/export, provider exit, redacted health and cost budgets.
- [ ] 7.11 Add one versioned Site Search & Sharing Profile with locale-exact
      generated defaults, verified-host proof, exactly title/description/share-
      image Page overrides, crawler/reach semantics, accessible share, and
      separately observed delivery/provider status.

## 8. D29-D32 Portability Authority Health And Accessibility Assistance

- [ ] 8.1 Add formula-safe non-reimportable spreadsheet exports and one
      versioned neutral Asym Content Package over a sealed authorized snapshot.
- [ ] 8.2 Add private encrypted opaque export artifacts, bounded retention,
      per-download current reauthorization, expiry/revocation and receipt.
- [ ] 8.3 Add certified import adapters, hostile archive/path/formula/script/
      provider rejection, and one saved full-page **Source → Destination → Match
      content → Check and resolve → Review plan** preparation journey. Make
      **Check the import** zero-write and seal plans with exact **Must fix before
      creating drafts**, **Needs review before release**, **Will not be
      imported** and **Information** totals plus plan expiry.
- [ ] 8.4 Add fresh privileged import commit through owner commands that creates
      private D12 revisions only as a separate command after Review plan, with
      idempotency, post-commit results, partial/resume/reconcile/reversal truth
      and no direct public or downstream effects.
- [ ] 8.5 Add deliberate Site/locale context switching, acknowledged-work
      preservation through auth expiry, current revocation and non-enumerating
      denial across every Web Studio surface.
- [ ] 8.6 Add incident-bound read-only Engine Diagnostics with current incident,
      fresh AAL2, least-disclosure scope, ledger-before-read, bounded duration,
      immediate revocation, redacted output and zero repair mutation.
- [ ] 8.7 Add the versioned Content Health issue-family registry, rebuildable
      projection, stable issue identity, exact Needs your action/Being handled
      automatically/Needs platform attention/Recently resolved views, separate
      Health check incomplete coverage notice, code-owned 30-day resolved
      presentation window, contextual and central views, source-proof resolution
      and quiet healthy state.
- [ ] 8.8 Add rare registered direct-recovery commands with separate capability,
      exact target, expected-state fence, idempotency, bounded effect, read-back
      and receipt; prohibit generic Retry/Replay/Force and provider consoles.
- [ ] 8.9 Add the three Accessibility Assistance classes, contextual
      nonblocking suggestions, bounded Keep as written, common D1 check path,
      unavailable-evidence honesty and no scores/certification/policing or D32-
      created release blockers.

## 9. D33-D36 Production Qualification Clean Cutover And Closure

- [ ] 9.1 Define a complete provider-neutral Production Capacity Profile with
      numeric Minimum, Typical and Measured maximum workload, UX, correctness,
      freshness, recovery, fairness, headroom and unit-cost outcomes.
- [ ] 9.2 Add one exact Vercel Qualification Attachment covering public routes,
      staff/Preview functions, build/cache/transform behavior, Postgres
      connections, queues/retries, costs, overload and optional-work shedding.
- [ ] 9.3 Prove field Core Web Vitals across representative routes, devices,
      networks, locales, packages, cache and adverse states and preserve D1
      publication independence from application deployment.
- [ ] 9.4 At implementation start and release freeze, inspect official current
      Payload v4 npm, GitHub release/tag/source/security/issue and migration
      evidence and select one coherent supported stable cohort when available.
- [ ] 9.5 If no stable cohort qualifies, record and qualify one exact coherent
      prerelease with accountable residual-risk owner, expiry, upgrade and
      retirement plan; reject floating/mixed/forced-peer/v3/stock-Admin/dual-
      authority alternatives.
- [ ] 9.6 Produce one immutable Payload cohort qualification record covering
      lockstep packages/plugins, lockfile, generated artifacts, runtime,
      migrations, Tenant/access/editor/public/a11y/capacity/backup/recovery
      proof and requalification triggers.
- [ ] 9.7 Prove exact nonproduction/disposable scope and perform the D35 read-
      only repository plus hosted row/object census with discard, transform,
      regenerate and unresolved/block classifications.
- [ ] 9.8 Build D1-D34 from an empty database, execute only qualified neutral-
      DTO retained-state transformations, verify control totals/checksums/
      constraints, and quarantine or block ambiguity.
- [ ] 9.9 Perform one bounded one-authority switch for all writers, readers,
      Preview, compiler, scripts and tests; remove every legacy or temporary
      collection/schema/route/flag/fallback/fixture/adapter/transform.
- [ ] 9.10 Prove fresh-clone/empty-database reproducibility, safe rollback only
      before authority switch, and mandatory stop/new decision for production
      or customer-relied-upon destructive work.
- [ ] 9.11 Complete every closure-checklist proof, preserve frozen D1-D35 owner
      seams, and record Built, Live and Confirmed evidence independently.

## 10. Cross-Cutting Verification

- [ ] 10.1 Add pure command/compiler/projection contract suites for exact
      manifests, digests, migrations, CAS, idempotency, stale/conflict/revoked/
      unknown outcomes, and last-safe-public continuity.
- [ ] 10.2 Add real disposable-Postgres tests for same-scope composite
      relationships, constraints, forced RLS/grants, lease/CAS races, outbox,
      claims, hostile values and cross-Tenant/environment/Site/locale denial.
- [ ] 10.3 Extend the strict non-skipping Supabase Auth + Payload + Postgres +
      Playwright tracer from staff edit through acknowledged save, Preview,
      activation and exact visitor artifact, including forced compile/activate
      failure with byte-stable prior public output.
- [ ] 10.4 Add feature-level tracer evidence for every D2-D32 observable user
      story through the same Web Studio Operations and PublishedContentReader
      seams.
- [ ] 10.5 Add negative matrices for IDOR, provider/API bypass, draft/Preview/
      Trash/restricted leaks, cache/host poisoning, hostile files/packages,
      revoked artifacts, diagnostics disclosure, telemetry leakage, stale jobs,
      delayed replay and adverse-public races.
- [ ] 10.6 Run Axe and manual keyboard, focus, screen-reader, touch, 320px
      reflow, 400% zoom, forced colors, reduced motion, RTL/CJK, weak-network,
      suspended-tab and expired-session proof for every critical staff and
      visitor journey.
- [ ] 10.7 Run production-shaped hierarchy, search, Content Library, Preview,
      form, media, compilation, cache, database, queue, build, deployment,
      reconciliation, fault, cost and fairness evidence against D33.
- [ ] 10.8 Validate this OpenSpec change, the PRD, decision log, ADRs, closure
      checklist, and eventual implementation/ticket traceability as one
      congruent D1-D36 evidence package.
