# Tasks: Public Ministry Pages

## Live Implementation Graph

Parent specification issue:
[#1281](https://github.com/Asymmetric-al/core/issues/1281). The approved delivery
graph is published as 41 behavior-led native child issues, P22-01 through
P22-41 / #1282–#1322, connected by 116 native blocking relationships.
P22-01/#1282 alone among the 41 implementation children is the current
`ready-for-agent` frontier. Native GitHub blocking relationships are the live
execution-order authority.

Implement through the confirmed `PublicMinistryPagesService` application
boundary. The unchecked items below are capability-proof checkpoints that the
41 tracer-bullet issues satisfy in dependency order; they are not a second set
of implementation tickets and are not file-by-file work. Completion requires
the assigned tracer bullet to cross the public API, authorization and tenant
scope, canonical persistence, projections, and the applicable staff,
contributor, or visitor surface.

The dependency order is: contract and scope foundation; Page identity and
assignments; editorial release; locale and presentation composition; public
runtime and giving; updates and responses; discovery, measurement, and writing
assistance; adoption and operations; then production certification.

### Approved tracer-bullet issue index

| Ticket |                                               GitHub issue | Behavior                                                             |
| ------ | ---------------------------------------------------------: | -------------------------------------------------------------------- |
| P22-01 | [#1282](https://github.com/Asymmetric-al/core/issues/1282) | Fail closed at the Public Ministry Page boundary                     |
| P22-02 | [#1283](https://github.com/Asymmetric-al/core/issues/1283) | Reject unsupported Page-family presentation semantics                |
| P22-03 | [#1284](https://github.com/Asymmetric-al/core/issues/1284) | Create one exact typed Public Ministry Page                          |
| P22-04 | [#1285](https://github.com/Asymmetric-al/core/issues/1285) | Manage distinct Ministry Assignment, display, and contributor grants |
| P22-05 | [#1286](https://github.com/Asymmetric-al/core/issues/1286) | Choose an immutable Site-family presentation profile                 |
| P22-06 | [#1287](https://github.com/Asymmetric-al/core/issues/1287) | Edit and save an immutable Page successor                            |
| P22-07 | [#1288](https://github.com/Asymmetric-al/core/issues/1288) | Recover and reuse editorial work without database churn              |
| P22-08 | [#1289](https://github.com/Asymmetric-al/core/issues/1289) | Resolve requested and effective Publication Reach                    |
| P22-09 | [#1290](https://github.com/Asymmetric-al/core/issues/1290) | Let a represented person stop public exposure immediately            |
| P22-10 | [#1291](https://github.com/Asymmetric-al/core/issues/1291) | Publish automatically after mandatory checks                         |
| P22-11 | [#1292](https://github.com/Asymmetric-al/core/issues/1292) | Review and release an exact candidate                                |
| P22-12 | [#1293](https://github.com/Asymmetric-al/core/issues/1293) | Create an attributed staff successor revision                        |
| P22-13 | [#1294](https://github.com/Asymmetric-al/core/issues/1294) | Preview an exact candidate under current authorization               |
| P22-14 | [#1295](https://github.com/Asymmetric-al/core/issues/1295) | Serve admitted Missionary and Project Pages                          |
| P22-15 | [#1296](https://github.com/Asymmetric-al/core/issues/1296) | Author and release independent locale variants                       |
| P22-16 | [#1297](https://github.com/Asymmetric-al/core/issues/1297) | Activate presentation changes across the complete locale cohort      |
| P22-17 | [#1298](https://github.com/Asymmetric-al/core/issues/1298) | Apply source-qualified route and lifecycle dispositions              |
| P22-18 | [#1299](https://github.com/Asymmetric-al/core/issues/1299) | Handoff every Give action to one exact Designation                   |
| P22-19 | [#1300](https://github.com/Asymmetric-al/core/issues/1300) | Render selected source-authoritative support progress                |
| P22-20 | [#1301](https://github.com/Asymmetric-al/core/issues/1301) | Prepare private public-ministry media safely                         |
| P22-21 | [#1302](https://github.com/Asymmetric-al/core/issues/1302) | Release immutable safe media derivatives                             |
| P22-22 | [#1303](https://github.com/Asymmetric-al/core/issues/1303) | Release a canonical Ministry Update to the public audience           |
| P22-23 | [#1304](https://github.com/Asymmetric-al/core/issues/1304) | Release and withdraw a supporter Update projection                   |
| P22-24 | [#1305](https://github.com/Asymmetric-al/core/issues/1305) | Enable bounded Like and I prayed responses                           |
| P22-25 | [#1306](https://github.com/Asymmetric-al/core/issues/1306) | Add bounded one-level supporter comments                             |
| P22-26 | [#1307](https://github.com/Asymmetric-al/core/issues/1307) | Moderate responses with append-only adverse actions                  |
| P22-27 | [#1308](https://github.com/Asymmetric-al/core/issues/1308) | Browse the tenant-selected ministry directory topology               |
| P22-28 | [#1309](https://github.com/Asymmetric-al/core/issues/1309) | Publish exact-release Page search and sharing manifests              |
| P22-29 | [#1310](https://github.com/Asymmetric-al/core/issues/1310) | Publish reach-qualified Update permalinks and sharing                |
| P22-30 | [#1311](https://github.com/Asymmetric-al/core/issues/1311) | Collect and seal privacy-safe ministry measurements                  |
| P22-31 | [#1312](https://github.com/Asymmetric-al/core/issues/1312) | Show contributor insights only when permitted                        |
| P22-32 | [#1313](https://github.com/Asymmetric-al/core/issues/1313) | Suggest bounded writing improvements                                 |
| P22-33 | [#1314](https://github.com/Asymmetric-al/core/issues/1314) | Offer a caution-labelled English translation suggestion              |
| P22-34 | [#1315](https://github.com/Asymmetric-al/core/issues/1315) | Operate Pages from one quiet derived workspace                       |
| P22-35 | [#1316](https://github.com/Asymmetric-al/core/issues/1316) | Complete first setup with exactly three questions                    |
| P22-36 | [#1317](https://github.com/Asymmetric-al/core/issues/1317) | Manage ongoing settings in four clear groups                         |
| P22-37 | [#1318](https://github.com/Asymmetric-al/core/issues/1318) | Build the complete legacy-surface census and adoption plan           |
| P22-38 | [#1319](https://github.com/Asymmetric-al/core/issues/1319) | Adopt legacy Pages through resumable private batches                 |
| P22-39 | [#1320](https://github.com/Asymmetric-al/core/issues/1320) | Reconcile a production-shaped private shadow                         |
| P22-40 | [#1321](https://github.com/Asymmetric-al/core/issues/1321) | Materialize the immutable go-live authorization manifest             |
| P22-41 | [#1322](https://github.com/Asymmetric-al/core/issues/1322) | Perform the generation-fenced public-surface cutover                 |

P22-24 through P22-26 implement only D12-authenticated, purpose-authorized
Supporter Engagement Spaces. Anonymous public comments and reactions remain
out of scope.

## 1. Contract And Dependency Foundation

- [ ] 1.1 Record the Phase 22 ownership map and dependency assertions so the
      runtime refuses to start when required base Phase 5, 9, 10, 12, or 13
      contracts are unavailable or incompatible, while Phase 16 commitment
      metrics and Phase 21 support/AI contracts gate only the exact optional
      capability that selected them and never base Page authoring or serving.
- [ ] 1.2 Establish `PublicMinistryPagesService` as the only supported
      application boundary for every authenticated revision, attestation, review,
      preview, release, assignment, settings, operations, adoption, and recovery
      action and for exact public serving; add architecture tests that reject direct
      browser access to private Phase 22 tables, Payload override access, or
      alternate public readers.
- [ ] 1.3 Define stable, typed identifiers and composite scope keys for Tenant,
      Legal Entity, environment, Site, verified host set, Page Family, Page,
      locale, subject, Designation, release, profile generation, and assignment.
- [ ] 1.4 Add contract tests proving Phase 22 references rather than copies
      owning-phase operational, financial, identity, safety, and communication
      truth, and never treats a projection or CMS document as authority.

## 2. Page Identity Subjects Assignments And Access

- [ ] 2.1 Deliver creation of exactly one Missionary Ministry Page or one
      Project/Campaign Page for an eligible typed subject, with structural
      same-scope foreign keys, duplicate prevention, and immutable subject history.
- [ ] 2.2 Deliver a pre-first-release subject correction and a post-release Page
      succession flow, including CAS conflicts, prohibited fuzzy substitution, and
      an understandable staff consequence review.
- [ ] 2.3 Deliver CRM-authoritative, organization-owned Ministry Assignments
      with versioned participant membership while keeping D1 public display and
      Page contribution, the optional finance-authored Phase 21 Support Binding,
      current Phase 12 Support Workspace grants and history floors,
      responsibility, and notification preferences as independently owned and
      revocable facts with no relationship inference.
- [ ] 2.4 Prove immediate revocation, cross-tenant denial, stale-token denial,
      and action-specific authorization at the server boundary and RLS layer for
      every Page, assignment, support, update, and response operation.

## 3. Editorial Revision Review And Release

- [ ] 3.1 Deliver one private, coalesced, non-semantic Payload recovery buffer
      per exact Page and locale beneath the expected working head, using the
      code-owned two-second debounce and fifteen-second maximum wait without
      advancing a semantic head, candidate, audit, notification, or outbox. Suppress
      digest-equal writes, permit at most one in-flight write for an exact expected
      working-head generation, and fence a late response from a superseded
      generation into a recoverable checkpoint instead of replacing current work;
      explicit Save draft seals one attributed immutable successor through CAS.
- [ ] 3.2 Deliver one final-intent candidate flow whose existing `Submit for
review` or `Publish changes` action atomically binds the exact revision,
      digest, actor, complete scope, action, and code-owned D26 statement. Show
      exactly `By submitting, you confirm you’re allowed to share the words and
images on this page publicly.` or `By publishing, you confirm you’re allowed to
share the words and images on this page publicly.` beside that action; upload,
      autosave, preview, and unchanged approval do not attest.
- [ ] 3.3 Deliver the tenant-selected publish-after-checks path, including all
      release-time safety and dependency reproofs and an honest published outcome.
- [ ] 3.4 Deliver the tenant-selected staff-review path through one quiet D4/D5
      queue with exact diff and preview, `Approve & publish`, and `Request changes`
      with a bounded actionable reason, plus a deliberately secondary terminal
      `Reject` action requiring a bounded reason and explicit plain-language
      consequence confirmation for work that must not remain actionable, without a
      second workflow or staff override mutation.
- [ ] 3.5 Deliver staff-authored successor revisions while preserving every
      author, candidate, and attestation fact. Materially superseding active or
      submitted contributor work requires one short contributor-visible reason;
      if the coherent head advanced, offer only `Continue from latest draft`
      (recommended) or `Start from submitted version`, while both append from and
      CAS-advance the exact current head without merge, rewind, or overwrite.

## 4. Presentation Locale Reach And Release Composition

- [ ] 4.1 Deliver the two small code-owned semantic block catalogs and one
      versioned Site-and-family presentation profile for Missionary and
      Project/Campaign layouts, including bounded Ministry Update placement.
- [ ] 4.2 Deliver independently authored and released locale content under one
      Site-scoped Page identity, with exact-locale serving and no automatic prose
      fallback or per-locale layout exception.
- [ ] 4.3 Deliver D27 all-or-nothing compatible family-profile activation across
      the complete current locale-release cohort, fenced by epoch and release-head
      digest, while ordinary locale edits continue through D2 release history.
- [ ] 4.4 Deliver the exact `Not public`, `Shared by link — public`, and `Listed
publicly` reach labels with `Not public` as the honest fail-safe until an
      authorized tenant default is deliberately saved. Re-prove the Phase 10 hard
      ceiling at candidate creation, release, directory/search compilation, cache
      admission, and every serve without calling a shared public link private.
- [ ] 4.5 Deliver every currently displayed participant's quiet `Stop showing me
publicly` action, which immediately invokes smallest-scope containment
      without staff hoops. Restoration requires a newly admitted release, and the
      UI never promises recall of third-party copies, caches, or search results.

## 5. Public Runtime Giving Progress Routes And Media

- [ ] 5.1 Deliver exact current-release public serving through D18 gate-before-
      cache composition, including positive freshness classes, no-store failures,
      adverse-first invalidation, and no stale safety fallback.
- [ ] 5.2 Deliver exactly one Phase 13 Designation binding for every released
      Page while allowing incomplete private preparation, and preserve Site,
      exact CTA/link `source_code`, locale, currency, Page, exact D2 release, exact
      Page Giving Binding, and Designation context through the Phase 5 handoff with
      action-time reproof before cart and provider mutation. When the
      tenant supplies it, a separately labelled fresh general-giving link may be
      shown without inheriting Page destination, amount, cadence, source, or return
      context and never as fallback or substitution.
- [ ] 5.3 Deliver optional per-Page typed support progress that reads only
      certified source projections, omits missing/stale/incompatible facts, and
      never invents zero, currency conversion, or payment truth.
- [ ] 5.4 Deliver a source-qualified route and lifecycle case in which cause
      opens work but never chooses the outcome: continue, a through-dated
      transition-notice release, same-Page Listed-only permanent redirect, or
      privacy-safe 404. A transition notice retains D7's exact binding and renders
      the independently current Phase 13 Giving state; D8 never manufactures an
      intentional no-Giving posture or infers a replacement fund. Prove every
      permanent redirect is one hop, has a currently eligible destination, and
      cannot create a self-loop or cycle.
- [ ] 5.5 Deliver Phase-29-owned private byte custody and processing behind
      Phase-22-owned public media identity, placement, release eligibility, and
      withdrawal. Launch accepts JPEG, PNG, and still WebP only; rejects SVG,
      animation, video, audio, and documents; expires bounded raw intake and
      discards source names; and proves metadata-free, opaque, release-bound public
      derivatives with accessible alt text while originals remain unservable.
- [ ] 5.6 Deliver exact-version authenticated preview with every-request
      authorization, no bearer URLs, no-store/noindex behavior, and all consequential
      public actions disabled.

## 6. Ministry Updates And Supporter Responses

- [ ] 6.1 Deliver one canonical immutable Ministry Update with exact audience,
      correction, withdrawal, and independently releasable Page-placement
      projections for public and authenticated supporter audiences. Every
      placement uses an exact D3 Feed Binding to one source and purpose set;
      Project/Campaign placement additionally requires its exact canonical
      project/purpose and is never inferred from participants, contributors,
      relationships, Designations, or Support Assignments. Preserve `My Feed`
      only as a migration, search, and help alias for Ministry Updates, never as
      a second feed, route, release, audience, or copied-post authority.
- [ ] 6.2 Deliver the prospective tenant response profile with persisted
      `Responses off`, `Like + I prayed`, or `Like + I prayed + comments`, starting
      Off and recommending acknowledgement-only in guided setup. Bind each
      Engagement Space to one exact current D11 supporter projection and complete
      source, purpose, audience, safety, authorization, profile, and operation
      generations; allow per-Update narrowing or immediate evidence-preserving
      closure, permit reopening only through D4/D5 review and release, and re-prove
      current authenticated purpose-authorized access on every protected operation.
- [ ] 6.3 Deliver reversible, idempotent, audience-local Like and I-prayed
      acknowledgements plus, when enabled, bounded plain-text comments with safe
      links, immutable self-edits, withdrawal/tombstones, one reply level, and the
      tenant's explicit `Right away, with reporting` or `After review` posture
      using one existing authorized moderation group. Include exact pending,
      posted, held, closed, and failed states; keyset pagination; inspect-before-
      retry for uncertain writes; typed deduplicable response occurrences;
      rebuildable audience-local counts; and append-only report, hold, hide,
      restore, redaction, comment-lock, and smallest-scope restriction occurrences
      without staff rewriting supporter words or Phase 22 owning notification delivery.
- [ ] 6.4 Prove Page rendering never leaks supporter-only update content or
      responses, and that response or moderation failure cannot corrupt the Page,
      Update, gift, or financial source of truth.

## 7. Discovery Search Sharing Measurement And Writing Assistance

- [ ] 7.1 Deliver one scoped directory corpus with tenant-selectable combined or
      separate Missionary and Project views, bounded filters/search, keyset
      pagination, and Phase 10/List-only compilation. Re-prove current D2 release,
      Phase 10 ceiling, and Listed admission for every returned result at query time;
      adverse narrowing excludes the result before asynchronous index cleanup.
- [ ] 7.2 Deliver distinct release-bound Search and Share presentations with
      canonical, robots, sitemap, structured-data, Open Graph, and safe social
      media. Listed content is discoverable and shareable; `Shared by link —
public` retains bounded release-exact share metadata and a deliberate Share
      action while remaining noindex and absent from directories, navigation,
      sitemaps, public-feed discovery, and locale discovery; stricter content emits
      no content-specific anonymous share or search projection. For a Ministry
      Update permalink used by more than one Page placement, compute reach across
      the complete current placement union: any admitted Listed placement makes it
      Listed, otherwise every admitted Shared-by-link placement makes it public
      noindex, and no admitted placement makes it absent.
- [ ] 7.3 Deliver the bounded first-party measurement profile with only the four
      approved POST interactions, 24-hour occurrence retention, sealed daily
      aggregates, suppression-safe contributor reporting, and total failure
      isolation from visitor and giving flows. Persist no raw request identity and
      no durable visitor or session identifier; retain deduplication/idempotency
      material only with the bounded occurrence and for no more than 24 hours.
- [ ] 7.4 Deliver tenant-off, source-bounded writing suggestions through Phase
      21 D10's exact `public-profile drafting` binding and the closed launch catalog:
      Start from guided answers, Fix spelling & grammar, Improve clarity, Shorten,
      Add detail only from explicitly selected or newly supplied facts, `Warm and
personal`, `Clear and direct`, or `Professional`, one length-bounded same-source
      instruction under More, and Translate to English. Send only the exact selected
      source package and require compare-before-apply, short-lived output, and
      current-draft CAS.
- [ ] 7.5 Deliver Translate to English only for an independently certified source
      language and already-created exact Phase 24 English locale draft. It must not
      create a locale, route, fallback, translation status, or release, and every
      result must show: `Check this translation. AI translation can make mistakes
or miss context. Review this English draft carefully before using it.` plus
      `What should I check?` with `Check names, dates, numbers, quotations,
Scripture, ministry terms, relationships, and cultural meaning. For important
content, ask a fluent English reader to review it. This is not a certified
translation.` Before provider egress, name the exact Phase 24 source and English
      target locales, show the provider-detected source language for actor
      confirmation rather than treating it as truth, and require a mixed-language
      selection to be split or explicitly confirmed.

## 8. Adoption Cutover Operations Settings And Recovery

- [ ] 8.1 Deliver private, chunked, resumable complete-surface adoption for one
      exact Tenant, Legal Entity, environment, Site, verified-host-set, and
      Phase-24-enabled locale cohort. Census every legacy, mock, static, generic,
      or copied route/alias; Page, draft, autosave, version, template, block, global
      dependency, and former profile editor; subject, identity, Designation, fund,
      campaign, locale, source code, CTA hint, Update, legacy `My Feed` alias,
      media original/derivative/
      URL/metadata/source name, preview, directory/search/sitemap/canonical/robots/
      social presentation, cache namespace/variant, Giving handoff, API, reader,
      fixture, test, and import path. Give every item exactly one source-valid,
      non-overlapping certified-release, compatible-legacy-release, D8 disposition,
      private-reference/export, quarantine/Not-public, or proved-retirement outcome;
      then run a production-shaped, structurally side-effect-dark full-surface
      shadow covering every inclusion, exclusion, visitor result, locale, and
      restricted-worker outcome with no production authority.
- [ ] 8.2 Deliver the one CAS-guarded public-reader cutover. When a shared
      artifact crosses the proposed cohort and lacks an atomically selectable,
      generation-pinned partition, require every dependent case to join one
      coordinated shared-authority CAS. Prove crash recovery, concurrent attempts,
      legacy-reader rejection, and no dual write, dual reader, destructive rollback,
      or lost in-flight Page edit. The cutover pins the immutable Adoption Plan and
      Coverage Manifest stable identifiers and content digests and re-proves those
      exact inputs inside the CAS; it never resolves a floating `latest` version.
- [ ] 8.3 Deliver one quiet derived Public Pages operations workspace with `To
review`, `Needs attention`, and `All pages`, cause-owned impact grouping,
      owner-specific actions, protected restricted counts, and no duplicated task or
      health authority.
- [ ] 8.4 Deliver first setup with exactly three foreground choices: `Who can find
new Missionary pages?`, `Who can find new Project pages?`, and `Should staff
review contributor changes?`. Show missing reach as `Safe fallback — not yet
chosen`/Not public and missing review as review-required, use the built-in D3
      family designs, and keep optional capabilities collapsed instead of forcing
      additional setup decisions.
- [ ] 8.5 Deliver ongoing settings in exactly four calm groups: `Visibility and
publishing`, `Page appearance and discovery`, `Optional features`, and
      `Chosen on each page`. Derive current source-owned profile versions, label
      owner/default/off/unavailable states honestly, preview consequences, and send
      each change through one owner-specific CAS and authoritative readback without
      a settings database, universal Save, or retroactive bulk apply.
- [ ] 8.6 Deliver action-specific D25 recovery only for unreleased D1 working
      content and D4/D5 candidates. Derive currently permitted View submission,
      Request changes, Reject, Withdraw, Edit page, Review saved changes, or Use as
      starting point actions from current owner facts; name the exact owner cause
      instead of a generic `stale` status, treat age as display-only, preserve
      referenced evidence, and add no D25 task/status/retention database.

## 9. Verification Security Accessibility And Release Gates

- [ ] 9.1 Add unit, property, contract, RLS, concurrency, and fault-injection
      tests for exact scope, immutable succession, one-current-head invariants,
      release/profile composition, adverse convergence, idempotency, and retention.
- [ ] 9.2 Add end-to-end journeys for missionary editing and publication, staff
      review, public viewing and giving, Ministry Updates and supporter responses,
      family-profile activation, and complete-surface adoption/recovery.
- [ ] 9.3 Prove WCAG 2.2 AA keyboard, focus, announcement, reflow, contrast,
      reduced-motion, image-alternative, and equivalent-table behavior across
      desktop, mobile, slow network, and assistive technology paths.
- [ ] 9.4 Run tenant-isolation, Phase 10 restriction, cache/CDN, preview, media,
      XSS/HTML sanitization, CSRF, rate-limit, SSRF, search-disclosure, and
      contributor-revocation adversarial suites against production-shaped data.
- [ ] 9.5 Certify 5,000-Page adoption and public-serving load, bounded queue and
      rebuild fairness, observability cardinality/redaction, backup/export and
      restore, operational runbooks, kill switches, and named rollback-by-successor
      procedures before production authorization.
- [ ] 9.6 Re-run strict OpenSpec validation and the repository-required lint,
      type, unit, integration, browser, accessibility, and build gates. For every
      implementation slice that changes `packages/ui`, run
      `bunx @shadscan/cli@0.1.1 ./packages/ui --json --no-interactive` before and
      after the slice, record both scores and the configured floor in the release
      evidence manifest, and reject unassessed or below-floor output. Retain the
      manifest and owner sign-offs for every D1-D27 production gate; Shadscan is
      supplementary and never substitutes for accessibility or browser proof.
