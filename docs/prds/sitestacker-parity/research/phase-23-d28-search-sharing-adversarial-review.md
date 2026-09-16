# Phase 23 D28 Search and Sharing Ruthless Adversarial Review

**Status:** Complete hardening review supporting the founder-ratified Phase 23
D28 C-prime-R decision. Ratification authorizes no implementation, schema,
dependency or provider adoption, migration, issue, deployment, D1 activation,
or release.

**Date:** 2026-08-23

**Ratified:** 2026-08-24

## Reviewed proposition

> **Option C-prime — Versioned Site Search & Sharing Profile with generated
> defaults, three bounded Page overrides, and D1 compiler ownership.**

The review tested this proposition against:

- ratified D1–D27 and specialized Phase 22 D14 authority;
- current repository metadata, JSON-LD, routing, Site configuration, and cache
  seams;
- current Google, Bing, IndexNow, Open Graph, W3C Web Share, Next.js, Payload,
  and CMS UX guidance; and
- realistic nonprofit ministry use by multilingual communications staff,
  missionaries, administrators, reviewers, safeguarding staff, and operators.

Supporting evidence:

- [D28 decision brief](./phase-23-d28-search-sharing-authority-decision-brief.md)
- [Primary-source and repository research](./phase-23-d28-search-sharing-primary-source-research.md)
- [Staff UX and CMS benchmark](./phase-23-d28-search-sharing-ux-benchmark.md)

## Rating method

Severity describes plausible impact before prevention:

- **Critical:** cross-Tenant or private disclosure, unsafe public metadata,
  release corruption, or broad security compromise.
- **High:** materially wrong live output, inaccessible publishing, sustained
  discovery failure, or costly recovery.
- **Medium:** bounded staff confusion, support burden, external lag, or
  repairable degradation.
- **Low:** minor inconvenience with obvious safe recovery.

Likelihood is **Certain**, **Likely**, **Possible**, or **Unlikely** under a
naive implementation or extension of current Core. Every category has at least
one material concern. That is not alarmism: public metadata is a cross-cutting
compiler boundary, and the permanent controls deliberately keep the residual
product small.

## 1. Brittleness

**Material concern: Yes.**

### B1 — Competing mutable metadata authorities

- **What could go wrong:** Payload fields, a root Next layout, file metadata,
  Page `generateMetadata`, JSON-LD helpers, and D1 each emit part of the public
  head. A Page change or framework precedence rule then leaves mixed Site,
  locale, reach, or generation values.
- **Why it matters:** A visually correct Page can publish the wrong canonical,
  index state, social card, or organization identity, and the failure is hard
  to see in the editor.
- **Severity / likelihood:** **High / Certain without cutover.**
- **Evidence / reasoning:** Current Core already has a hard-coded root metadata
  object, Page-local partial metadata, global helpers, and global JSON-LD.
  Next.js nested metadata merges shallowly and file metadata can override code.
- **Permanent prevention:** One complete immutable ordinary Page/Article D1
  Search & Sharing Manifest and one route adapter, without absorbing Phase 22
  D14; inventory and remove/quarantine every competing source during an explicit
  Site × locale cohort cutover; rendered-head contract tests prove precedence.

### B2 — Persisted generated values become stale

- **What could go wrong:** A Site name, title pattern, Page summary, or default
  image changes, but Pages keep copied “generated” values from an earlier
  moment.
- **Why it matters:** Staff cannot tell which Pages follow defaults, bulk repair
  becomes necessary, and profile revisions stop being deterministic.
- **Severity / likelihood:** **High / Likely.**
- **Evidence / reasoning:** CMS SEO plugins commonly materialize generated
  fields; the selected option explicitly has Site-wide defaults and Page
  customization, making copied values a natural but dangerous shortcut.
- **Permanent prevention:** Persist only three explicit override deltas. Resolve
  `override ?? generated` at candidate compilation under pinned source/profile/
  compiler versions. Reset deletes the override.

## 2. Technical debt

**Material concern: Yes.**

### T1 — SEO field and serializer proliferation

- **What could go wrong:** Separate Google, Bing, Facebook, LinkedIn, X,
  messaging, canonical, robots, hreflang, schema, sitemap, and keyword fields
  accumulate across Page families.
- **Why it matters:** The same meaning is copied into many shapes, upgrades
  become migrations, and occasional staff face a specialist console.
- **Severity / likelihood:** **High / Likely without a closed contract.**
- **Evidence / reasoning:** Comparable CMS/plugin surfaces expose many technical
  options; current Core already duplicates metadata and structured-data logic.
- **Permanent prevention:** Exactly three Page-locale overrides, one shared
  search/social text lane, one closed typed serializer catalog, and
  compiler-derived technical fields. New semantic families require an explicit
  additive decision and conformance fixtures.

### T2 — Payload/Next provider shape becomes domain shape

- **What could go wrong:** Product records mirror `@payloadcms/plugin-seo`
  groups or Next `Metadata`, so a provider version change dictates data
  migration and UI architecture.
- **Why it matters:** Core is pinned to preview/internal framework lines and
  must remain portable across Payload, Next, storage, and rendering changes.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Stable Payload is still 3.x while Payload 4 is a
  canary/active redesign; the repository pins an internal 4.0 build and does
  not install the SEO plugin.
- **Permanent prevention:** Asym-owned versioned domain manifest and three
  deltas; exact-pin provider adapters; plugin components are optional editor
  assistance only; unknown adapter/manifest versions fail closed.

## 3. Edge cases

**Material concern: Yes.**

### E1 — Sparse, unusual, or multilingual copy

- **What could go wrong:** A Page has no summary, a duplicate Site suffix, an
  extremely long title, CJK without spaces, RTL text, combining characters,
  emoji, control characters, or a source locale but no target-locale text.
- **Why it matters:** Naive truncation, fallback, or concatenation can corrupt
  meaning, expose another language, create duplicate titles, or generate
  malformed output.
- **Severity / likelihood:** **High / Likely across many tenants.**
- **Evidence / reasoning:** Missions organizations are multilingual; D22
  explicitly permits sparse locale lineages and forbids silent fallback.
  Search engines do not provide fixed character limits.
- **Permanent prevention:** Exact locale with fallback disabled; Unicode-safe
  validation; locale-aware pattern/punctuation; duplicate suppression;
  description omission when absent; advisory rather than destructive length
  handling; CJK/RTL/long-text test corpus.

### E2 — Route, reach, and media change during preparation

- **What could go wrong:** The path moves, reach changes to Shared by link, a
  locale is withdrawn, a share image loses qualification, or the Site profile
  advances while a candidate/schedule is compiling.
- **Why it matters:** The final head, card, sitemap, and status can describe
  different versions or leak a now-disallowed fact.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** D2/D3/D13/D22/D24/D27 have independent valid
  lifecycles; a mutable-latest query cannot prove their atomic relationship.
- **Permanent prevention:** Pin the exact dependency closure and digest;
  compare-and-swap/fenced preparation; re-prove compatibility at activation;
  stale schedules become **Needs attention**; adverse media handling fails
  closed and invokes D27 containment.

### E3 — Unavailable, moved, or deleted URLs

- **What could go wrong:** A 404/410/redirect response inherits the root Site's
  indexable metadata or the old Page's social card, while the URL remains in the
  sitemap.
- **Why it matters:** Search engines receive contradictory signals and social
  sharing can expose stale or sensitive copy after withdrawal.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** The current public route returns only an alternate
  title for unavailable/not-found metadata and relies on broad root defaults.
- **Permanent prevention:** Explicit status-specific complete metadata policy;
  no content-specific card/structured facts for unavailable routes; immediate
  sitemap removal; D3 owns permanent moves and 404/410 policy owns removals;
  synthetic status/head tests.

## 4. Footguns

**Material concern: Yes.**

### F1 — Editable technical SEO controls

- **What could go wrong:** Staff enter another Site's canonical, no-index an
  important Page, create nonreciprocal hreflang, inject raw JSON-LD, use an
  unqualified remote image, or send crawler notifications for an unreleased
  URL.
- **Why it matters:** One innocent setting can leak identity, remove discovery,
  create security issues, or contradict D1/D2/D22/D24/D27.
- **Severity / likelihood:** **Critical / Likely if exposed broadly.**
- **Evidence / reasoning:** These controls are easy to add with generic SEO
  plugins but require cross-domain knowledge ordinary ministry staff should not
  need.
- **Permanent prevention:** Keep canonical, robots, hreflang, sitemap,
  structured type, raw head, verification, notification, and external image
  controls compiler-owned. Show read-only outcomes and cause-owned actions.

### F2 — Misleading reset, score, and preview behavior

- **What could go wrong:** Reset copies a generated value and silently freezes
  it; a traffic-light score pressures awkward keyword copy; or a branded
  preview is mistaken for guaranteed Google/social output.
- **Why it matters:** Staff lose trust, create stale copy, and spend time
  optimizing a proxy rather than the public ministry story.
- **Severity / likelihood:** **Medium / Likely.**
- **Evidence / reasoning:** Google may rewrite titles/snippets, has no fixed
  limits, and social services cache cards. Generated CMS fields often obscure
  provenance.
- **Permanent prevention:** Reset deletes the delta with undo; resolved values
  always show provenance; examples carry persistent uncertainty copy; no score,
  keyword density, hard folklore limit, or ranking promise.

### F3 — Blank overrides and share/copy success are misrepresented

- **What could go wrong:** Empty or whitespace-only text persists as a custom
  override, clearing an image suppresses the safe default, Clipboard denial
  leaves no usable path, or native-share cancellation is reported as success.
- **Why it matters:** Staff can unknowingly publish malformed metadata or be
  told a public action succeeded when nothing happened.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Null, empty, cleared, and generated are distinct
  implementation states unless normalized; Web Share and Clipboard are
  capability/permission dependent.
- **Permanent prevention:** Normalize Unicode whitespace/control input; blank
  title/description and cleared image delete the override; no description-
  suppression state at launch; selected/read-only manual URL fallback;
  clipboard success only after confirmed write; share cancellation is neutral.

## 5. Tenant safety

**Material concern: Yes.**

### TS1 — Host-header or cache-key cross-Tenant leakage

- **What could go wrong:** A forged/misrouted `Host` or incomplete cache key
  causes Tenant A's Page to emit Tenant B's canonical, Site name, image, or
  structured identity.
- **Why it matters:** This is public cross-Tenant disclosure and can poison
  search/social caches for long periods.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current helpers use one global URL/config, while the
  desired system supports many Tenant Sites and hosts. Host-derived cache
  routing is a known multi-Tenant boundary.
- **Permanent prevention:** Phase 24-verified host is stored release input;
  request headers are lookup hints only. Cache identity includes Tenant,
  environment, Site, verified host, locale, route, D24's exact `public`
  audience, generation, manifest, and renderer. Synthetic host-spoof and
  cache-poison tests are release gates.

### TS2 — Weak relational scope or RLS enumerates another Site

- **What could go wrong:** A Page override references another Site's profile or
  media, an affected-Page query crosses Sites, or an admin API returns names and
  statuses outside current membership.
- **Why it matters:** Metadata can reveal private organizational identity,
  locales, unreleased Page names, or media even before public release.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Application filters alone are insufficient in a
  Supabase multi-Tenant system; Page, profile, locale, media, and Site each
  carry scope.
- **Permanent prevention:** Composite structural Tenant/environment/Site/locale/
  exact-`public` constraints and indexes; current-membership/capability RLS on
  every exposed relation; narrow audited server compiler; wrong-scope operations
  fail without enumeration; service-role credentials never reach the client.

## 6. Overengineering

**Material concern: Yes.**

### O1 — Building an enterprise SEO suite

- **What could go wrong:** D28 adds AI copy, keyword research, rank tracking,
  competitor analysis, live provider scraping, tenant crawler DSLs, custom
  schema builders, dynamic social-image rendering, or per-platform variants.
- **Why it matters:** These speculative systems add vendors, cost, privacy
  questions, UI noise, migrations, and ongoing SEO-maintenance work without
  improving the core release contract.
- **Severity / likelihood:** **High / Likely under “feature rich” pressure.**
- **Evidence / reasoning:** The three editorial decisions already cover the
  meaningful Page-level variance; external platforms do not guarantee exact
  display or ranking.
- **Permanent prevention:** Explicit launch exclusions and measured expansion
  triggers. Add a feature only when real tenant research proves the existing
  shared lane cannot complete a frequent task.

### O2 — Premature sitemap, search, and event infrastructure

- **What could go wrong:** Per-Site sharded sitemaps, an external search index,
  per-bot queues, or a second workflow engine ship before URL volume or load
  requires them.
- **Why it matters:** Operations must maintain distributed state and recovery
  paths for hypothetical scale.
- **Severity / likelihood:** **Medium / Possible.**
- **Evidence / reasoning:** Standard sitemap thresholds are generous; current
  Phase 23 scope can use D1's existing generation and one optional Phase 22
  convergence adapter.
- **Permanent prevention:** One host sitemap and set-based compile by default;
  threshold instrumentation; reuse D1 activation outbox; partition/adopt an
  external service only after measured capacity evidence and a decision.

## 7. UX/UI and user friction

**Material concern: Yes.**

### UX1 — “Search” is ambiguous and the form is too technical

- **What could go wrong:** Staff confuse D28 with D17 on-site Site search or
  face canonical/robots/schema/provider fields they cannot safely interpret.
- **Why it matters:** Occasional editors either avoid the surface, make
  accidental changes, or require training/support for routine publishing.
- **Severity / likelihood:** **High / Likely.**
- **Evidence / reasoning:** Modern CMS products distinguish Site search from
  search listing/SEO. The repository serves nonprofit users, many of whom are
  not digital-marketing specialists.
- **Permanent prevention:** Label the surface **Search engines & sharing**;
  generated output first; exactly three progressive-disclosure controls;
  technical results read-only; plain-language source/provenance and one direct
  action per cause.

### UX2 — Locale, mobile, and accessibility failures

- **What could go wrong:** All locales appear in a dense grid, previews squeeze
  forms on mobile, status is color-only, keyboard users cannot select/reset an
  image, or screen readers hear every keystroke.
- **Why it matters:** Mission staff frequently work multilingual, remotely, and
  on mobile; inaccessible publication tooling blocks their work.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** WCAG 2.2 requires reflow, focus, target size, labels,
  and exposed status; CMS side-by-side previews often degrade at narrow widths.
- **Permanent prevention:** One clearly named selected editing/release locale
  while multiple locale heads may remain live independently; 320px/400% reflow;
  form-first single column; persistent labels; programmatic help/errors; text
  plus icon; keyboard/touch media and reset; polite debounced announcements;
  CJK/RTL/weak-network usability tests.

### UX3 — External lag looks like an Asym failure

- **What could go wrong:** A valid release does not immediately change Google,
  Bing, LinkedIn, or messaging previews, so staff repeatedly republish, edit
  correct metadata, or open support requests.
- **Why it matters:** External crawling and caching are normal but invisible;
  false certainty erodes confidence.
- **Severity / likelihood:** **Medium / Likely.**
- **Evidence / reasoning:** Search engines choose crawl/index timing and can
  rewrite display; social networks cache cards; IndexNow acceptance is not
  indexing.
- **Permanent prevention:** Ordinary editors see candidate/live state and the
  lag disclosure. Operators see timestamped, object-specific internal facts such
  as **Public HTML verified** and typed provider observations such as **Google
  Search Console reported sitemap fetched for {host/object}** or **Bing
  Webmaster Tools report received for {host/object}**. No generic “externally
  observed” or inferred **Indexed** claim; operator diagnostics do not burden
  the Page form.

### UX4 — Readiness, provenance, lifecycle, and URLs are conflated

- **What could go wrong:** One badge says **Ready — generated** even though the
  candidate is unsaved, or a customized Page that needs attention cannot express
  both facts. A live Page with a newer saved candidate is forced into one false
  lifecycle value. During a D2 move, staff copy/open the planned URL believing it
  is a live link or candidate Preview.
- **Why it matters:** The most important release and sharing decisions become
  ambiguous at the point of action.
- **Severity / likelihood:** **High / Likely in a naive summary.**
- **Evidence / reasoning:** Generated/customized is provenance, Ready/Needs
  attention is validation, Editing/Saving/Saved is candidate durability, and
  Live/Not live is publication. D2 can stage a candidate path beside a current
  live path, while D25—not the planned address—owns candidate viewing.
- **Permanent prevention:** Display all four facts independently; label
  **Planned public URL** and **Current public URL**; explain that candidate
  changes appear there only after release; show D3 continuity; use D25
  **Preview Site** for candidate content; offer Share/Copy only for the live
  generation; never use **Ready** as a synonym for released/live.

### UX5 — Capability-blind controls and noisy low-value warnings

- **What could go wrong:** Reviewers see dead Customize buttons, users without
  media permission get unusable recovery actions, valid description omission
  or the exact Site × locale D27-qualified default social-card placement
  produces warning noise, and similar-copy checks fire on every keystroke.
- **Why it matters:** Staff stop trusting **Needs attention** and cannot complete
  the task in their actual role.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Viewing, Page override editing, Site-profile editing,
  and releasing are different capabilities; valid omission and approved
  defaults are normal states, not defects.
- **Permanent prevention:** Capability-specific read-only/edit/release surfaces;
  exact responsible-role guidance; preserve/focus the exact locale Page title,
  summary, relevant override, representative Page placement, or exact
  Site × locale D27 default placement when resolving; reserve **Needs
  attention** for actionable problems; keep normal provenance informational and
  similar-copy analysis aggregate.

## 8. Hidden coupling

**Material concern: Yes.**

### HC1 — Metadata inferred from presentation or DOM structure

- **What could go wrong:** A custom D9 package changes heading order, block
  layout, crop, or visible labels and silently changes D28 title, description,
  breadcrumb, or schema semantics.
- **Why it matters:** Presentation packages must remain replaceable and cannot
  become hidden content authority.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Search engines may inspect visible content, but D1
  needs deterministic source ownership across certified custom packages.
- **Permanent prevention:** Compile from typed Page/Placement/identity/media
  facts, not rendered DOM scraping. D9 renderer consumes the manifest and
  visible semantics; package conformance tests prove alignment without granting
  authority.

### HC2 — Schedules and Site-profile revisions silently rebase

- **What could go wrong:** D13 schedules Page revision 12, then a Site profile,
  path, media, or serializer changes; execution publishes different search/share
  output from what was reviewed.
- **Why it matters:** Scheduled ministry communications require exact approval
  and may contain time-sensitive or safeguarding-sensitive language/images.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** A global mutable profile is tempting to resolve at
  execution time, but D13 already rejects mutable latest content.
- **Permanent prevention:** Schedule pins the exact compiled manifest or
  reviewed dependency closure; execution re-proves compatibility; meaningful
  drift becomes **Needs attention**, never a silent rebase.

## 9. Failure modes

**Material concern: Yes.**

### FM1 — Release proof and post-release host convergence are conflated

- **What could go wrong:** D1 activates before the ordinary manifest and its
  required serving artifact are proven, or operators treat normal
  post-activation sitemap/robots/cache projection lag as a partial database
  release and attempt to reverse a valid locale head.
- **Why it matters:** The first case can expose an unreadable or mixed ordinary
  Page generation. The second confuses derived host-artifact lag with release
  corruption and can create a worse split.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** The locale-exact ordinary manifest and required
  serving artifact are D1 preparation proof, while verified-host sitemap,
  robots, and cache projections combine independently current locale/D14 heads
  after activation and cannot be one database transaction.
- **Permanent prevention:** Before CAS, prove the sealed ordinary manifest,
  serializer, route, media, and required serving artifact; failed proof leaves
  prior live intact. After CAS, run host sitemap/robots/cache convergence from a
  durable idempotent outbox with lag, reconciliation, and synthetic checks.
  Projection lag never redefines D1 activation; recovery is a newly proven
  forward successor.

### FM2 — External convergence or notification fails

- **What could go wrong:** IndexNow returns 429/5xx, a crawler misses the
  sitemap, a social service retains stale cache, or an outage hides a deletion
  for longer than expected.
- **Why it matters:** Staff need to know whether Asym output is correct and
  whether a third party simply has not converged.
- **Severity / likelihood:** **Medium / Likely.**
- **Evidence / reasoning:** External services offer best-effort crawling and
  cache behavior; notification receipt does not guarantee action.
- **Permanent prevention:** Non-blocking durable outbox, idempotent bounded
  retries/backoff, reconciliation, deletion-health age, exact-host synthetic
  fetches, and honest external-observation state. Never roll back a valid
  release because a crawler is unavailable.

## 10. Data integrity risks

**Material concern: Yes.**

### DI1 — Mixed profile, override, path, reach, and media versions

- **What could go wrong:** A manifest records the Page title from one revision,
  the override from another, and a later host/image/reach state.
- **Why it matters:** The output is neither the reviewed candidate nor any
  coherent source state, and it may expose wrong facts.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** These inputs are independently editable and
  commonly fetched from mutable heads.
- **Permanent prevention:** Immutable version IDs, composite scope constraints,
  one dependency closure/digest, transactional candidate record, expected-
  version compare-and-swap, and activation-time proof.

### DI2 — Ambiguous profile authoring head or inaccurate sitemap timestamps

- **What could go wrong:** Concurrent edits create two “current” Site-profile
  authoring revisions, an implementation treats that authoring head as one
  Site-global public head and silently advances every locale, or `lastmod`
  changes on every deployment/build and causes noisy crawling.
- **Why it matters:** Candidate meaning becomes ambiguous and search engines
  learn that timestamps are untrustworthy; independently released locale heads
  can also be overwritten outside D1.
- **Severity / likelihood:** **High / Likely without constraints.**
- **Evidence / reasoning:** Site-wide fan-out invites mutable singleton records;
  build time is an easy but incorrect `lastmod` shortcut.
- **Permanent prevention:** Immutable profile versions plus one fenced, inert
  authoring head; uniqueness/composite constraints and expected-version
  commands; every exact locale's D1 successor independently pins a profile
  version with no global public head or D10 shortcut; derive significant public
  `lastmod` from source changes with fixture-tested rules.

### DI3 — Custom drift cannot be proven or acknowledged

- **What could go wrong:** The UI guesses that a custom title/description is
  stale, nags forever, misses a meaningful source change, or clears an override
  without knowing what the editor affirmed.
- **Why it matters:** False warnings train staff to ignore genuine issues and
  make generated/custom behavior non-deterministic.
- **Severity / likelihood:** **Medium / Likely without basis data.**
- **Evidence / reasoning:** A custom value intentionally stops following its
  source; drift is knowable only relative to the source revision/digest the
  editor last accepted.
- **Permanent prevention:** Store the contributing source revision/digest as
  non-editorial override provenance; **Keep custom value** reaffirms the basis;
  **Use generated …** deletes the override. Basis data is not a fourth
  editorial control.

## 11. Security and privacy risks

**Material concern: Yes.**

### SP1 — Private, draft, or sensitive facts leak in the head

- **What could go wrong:** A draft title, restricted missionary identity,
  precise location, withdrawn photo, internal filename, private preview URL, or
  contact fact appears in metadata/JSON-LD even though the visible Page blocks
  it.
- **Why it matters:** Bots, unfurlers, logs, and browser previews collect head
  content; a small metadata leak can be permanent and dangerous in missions
  contexts.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Current global/person/location helpers are not
  release-qualified; robots is not authorization; social unfurlers fetch
  anonymously.
- **Permanent prevention:** Compile only D1-released public visible facts under
  Phase 10, D24 exact-`public`, and D27 proof; Preview/private no-store and no
  public artifacts;
  closed schema catalog; no filenames/private URLs; adverse withdrawal removes
  card media and content-specific facts through the exact containment path.

### SP2 — Unsafe structured-data or metadata serialization

- **What could go wrong:** Hostile title/description text closes a script tag,
  injects markup/control characters, creates invalid headers, or poisons a
  social parser.
- **Why it matters:** Raw JSON-LD is executable-script context and metadata is
  reflected into public HTML.
- **Severity / likelihood:** **Critical / Unlikely after proper controls.**
- **Evidence / reasoning:** Current serialization escapes `<`, which is useful
  but not a complete product-level typed validation/encoding contract.
- **Permanent prevention:** Typed object construction; schema and Unicode/control
  validation; context-safe JSON serialization; CSP; no raw HTML/JSON-LD;
  hostile-input/property-based tests against rendered HTML and headers.

## 12. Scalability and performance risks

**Material concern: Yes.**

### SC1 — Site-profile changes create unbounded fan-out

- **What could go wrong:** Editing one Site default synchronously renders every
  Page × locale, times out the request, overloads Postgres, or blocks staff.
- **Why it matters:** Larger tenants can have thousands of Pages and multiple
  locales; generated defaults make profile impact real.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** The change is intentionally Site-wide; an eager
  row-per-field rewrite would amplify load and create stale copies.
- **Permanent prevention:** Immutable profile revision, delta-only Page storage,
  indexed set-based Page-locale-field impact query, cursor-paginated summaries,
  bounded D1 preparation work, idempotent retries, and measured concurrency. No
  synchronous Page rewrite; impact distinguishes fields that stay custom from
  fields whose generated value changes.

### SC2 — Request-time metadata/database work and bot storms

- **What could go wrong:** Every crawler/card request queries Payload and joins
  mutable Page/profile/media/locale tables; bursts exhaust connections or serve
  inconsistent results.
- **Why it matters:** Bots and unfurlers are bursty and do not share normal user
  traffic patterns.
- **Severity / likelihood:** **High / Likely at scale.**
- **Evidence / reasoning:** The selected D1 architecture already provides an
  immutable serving artifact; bypassing it adds both load and inconsistency.
- **Permanent prevention:** Serve activated manifests/generation-addressed
  artifacts; complete cache keys; bounded cache-control by artifact type;
  request budgets/rate protection; synthetic load tests; no request-time
  Payload/plugin/social-image rendering.

## 13. Operational burden

**Material concern: Yes.**

### OB1 — Staff become SEO operators

- **What could go wrong:** Tenant staff must manage canonicals, robots, schema,
  webmaster tokens, social-cache debuggers, or per-engine submission keys.
- **Why it matters:** Ministries have limited specialist capacity; the system
  creates tribal knowledge and support dependency.
- **Severity / likelihood:** **High / Likely if technical controls ship.**
- **Evidence / reasoning:** Correctness depends on several settled authorities,
  not on editorial preference, and external platforms cannot be controlled
  through a form.
- **Permanent prevention:** Three editorial controls, generated-first UX,
  compiler-owned technical results, centralized verified-domain operations,
  cause-owned actions, and role-appropriate operator diagnostics.

### OB2 — Manual sitemap/cache repair and per-Tenant provider setup

- **What could go wrong:** Operators hand-edit sitemaps, purge URLs, rotate
  IndexNow keys per Page, or reconcile stale cards from spreadsheets.
- **Why it matters:** Manual processes are slow, error-prone, and do not scale
  across many Sites.
- **Severity / likelihood:** **Medium / Possible.**
- **Evidence / reasoning:** Release and external convergence are separate and
  failures are inevitable; without automation the burden becomes recurring.
- **Permanent prevention:** Derived host artifacts, platform-managed verified
  exact-host optional IndexNow adapter, idempotent outbox/reconciliation,
  deletion-health dashboards, documented cause codes, and no provider key UI
  in Page settings.

## 14. Observability gaps

**Material concern: Yes.**

### OG1 — Internal correctness is conflated with external indexing

- **What could go wrong:** A dashboard says “SEO succeeded” when only D1
  released, or says “failed” because Google has not indexed a valid Page.
- **Why it matters:** Teams take the wrong corrective action and cannot tell an
  Asym defect from expected crawler behavior.
- **Severity / likelihood:** **High / Likely.**
- **Evidence / reasoning:** Crawling, indexing, ranking, snippet selection, and
  social cache refresh are independently controlled by third parties.
- **Permanent prevention:** Separate telemetry/state for compiled proof,
  activation, sitemap/cache convergence, optional notification receipt, and
  external observation. Never infer indexing from a fetch or provider 200.

### OG2 — Deletion, wrong-host, or stale-card failures are invisible

- **What could go wrong:** A withdrawn URL still returns content/card data, a
  canonical points to another host, or an old rendition remains fetchable with
  no alert.
- **Why it matters:** Privacy/safety and Tenant errors have the highest impact
  precisely when normal Page traffic is low.
- **Severity / likelihood:** **Critical / Possible.**
- **Evidence / reasoning:** Cache/CDN/social convergence is asynchronous and
  route removals can be missed by success-only monitoring.
- **Permanent prevention:** Exact-host synthetic status/head/HTML/image tests;
  sitemap-versus-generation reconciliation; deletion/takedown age; wrong-host
  invariant alerts; redacted trace/cause IDs. Broad metrics exclude raw query,
  Page copy, private URLs, and unbounded Tenant labels.

## 15. Dependency and integration risks

**Material concern: Yes.**

### DR1 — Framework and CMS version churn changes behavior

- **What could go wrong:** A Next preview upgrade changes metadata precedence or
  route output; a Payload internal/canary upgrade changes localization,
  generated fields, Admin components, or plugin integration.
- **Why it matters:** Silent behavior changes can alter every tenant's public
  head even though product records are unchanged.
- **Severity / likelihood:** **High / Likely over time.**
- **Evidence / reasoning:** Core pins `next@16.3.0-preview.9` and
  `payload@4.0.0-internal.1f9ae9a`; stable Payload remains 3.x and the SEO
  plugin is not installed.
- **Permanent prevention:** Exact pins, Asym domain/adapters, no speculative v4
  dependency, rendered conformance fixtures, provider upgrade graduation, and
  fail-closed unknown versions.

### DR2 — External engines and IndexNow are treated as transactional

- **What could go wrong:** Release waits on or rolls back for a provider outage,
  429, ownership failure, or changed crawler behavior; a notification 200 is
  recorded as indexed.
- **Why it matters:** Public availability becomes coupled to an external
  best-effort service and creates unnecessary cost/failure surface.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** IndexNow explicitly acknowledges receipt rather than
  indexing; Google has no general URL submission API; search/social behavior
  changes independently.
- **Permanent prevention:** Sitemap is complete baseline; optional IndexNow is
  post-activation, idempotent, host-qualified, debounced, rate-limited,
  non-blocking, and accurately labelled. No release dependency or general
  Google submission integration.

## 16. Migration and upgrade risks

**Material concern: Yes.**

### MU1 — Dual authority during migration

- **What could go wrong:** Some routes use D28 while root metadata/helpers or
  Phase 22 serializers still override part of the head, producing mixed values
  that pass object-level tests.
- **Why it matters:** The migration can look complete while crawlers receive
  contradictory public output.
- **Severity / likelihood:** **High / Certain without explicit cutover.**
- **Evidence / reasoning:** Current metadata is distributed across root layout,
  route functions, shared configuration, helpers, JSON-LD, and specialized
  surfaces.
- **Permanent prevention:** Full source inventory, shadow compile and rendered
  diff, authority-preserving typed references to independently current Phase 22
  D14 manifests, explicit Tenant × environment × Site × locale cohort cutover,
  no dual reader/writer authority, unresolved-input quarantine, and bounded
  prior-reader recovery only.

### MU2 — Manifest/profile evolution strands old generations

- **What could go wrong:** A new serializer or profile schema cannot interpret
  retained active/history manifests, preventing recovery, audit, export, or
  upgrade rollback.
- **Why it matters:** D1's exact release and forward-recovery model depends on
  knowing what prior generations meant.
- **Severity / likelihood:** **High / Possible over time.**
- **Evidence / reasoning:** Search/social standards, framework adapters, and
  structured-data catalogs evolve; stored records outlive one deployment.
- **Permanent prevention:** Explicit manifest/profile/catalog versions,
  append-only migrations/adapters, backward fixtures for retained generations,
  exportable provider-neutral data, upgrade rehearsal, and no in-place semantic
  reinterpretation.

## 17. Other development hazards

**Material concern: Yes.**

### DH1 — Concurrency and deployment skew

- **What could go wrong:** Two editors update a profile/Page override, an old
  worker compiles with a new schema, or mixed application versions promote a
  manifest another renderer cannot understand.
- **Why it matters:** Lost work or a partially interpretable public generation
  can affect an entire Site.
- **Severity / likelihood:** **High / Possible.**
- **Evidence / reasoning:** Site-profile edits have broad fan-out, and D1 work
  can outlive a request/deployment.
- **Permanent prevention:** Expected-version compare-and-swap, immutable
  revisions, fenced work claims, compiler/renderer compatibility matrix,
  deployment generation skew gates, idempotent activation, and unknown-version
  refusal.

### DH2 — Tests validate objects but not crawler-visible behavior

- **What could go wrong:** Unit tests approve a `Metadata` object while rendered
  HTML omits/replaces fields, bots receive different status/cache behavior,
  JSON-LD is invalid, or Share/Copy link is inaccessible.
- **Why it matters:** Framework and browser semantics are the actual public
  seam.
- **Severity / likelihood:** **High / Likely with unit-only testing.**
- **Evidence / reasoning:** Next metadata precedence/serialization is not fully
  represented by object snapshots; crawlers and unfurlers commonly run without
  client JavaScript.
- **Permanent prevention:** Rendered HTML/head/status/cache snapshots for each
  Page family/reach/locale/status; no-JavaScript and bot-UA tests; validators;
  sitemap/robots fetches; Web Share capability/fallback tests; manual plus
  automated accessibility; denied-Clipboard/manual-copy and neutral-cancellation
  tests; load/fault/forward-recovery drills.

## Ruthless synthesis

The selected direction survives review, but “Site profile plus Page fields” is
not sufficient. The permanent design is a generated-first editorial delta over
one exact D1 artifact.

### Must be fixed now in the D28 decision

1. **One ordinary authority:** D1 compiles one complete immutable ordinary
   Page/Article Search & Sharing Manifest; no root, plugin, helper, or
   request-time fallback truth, and no absorption of Phase 22 D14.
2. **Three deltas only:** title portion, shared description, qualified share
   image. Generated values stay computed and locale-exact.
3. **Separate consequences:** search eligibility, anonymous shareability,
   access, release correctness, and external convergence are distinct typed
   facts.
4. **Derived technical truth:** verified host/canonical, D3 status, D22
   alternates, D2 reach inside D24's exact `public` audience, route
   sitemap/robots dispositions, closed schema, and exact D27 placement-backed
   media are not editor inputs; host projections preserve Phase 22 D14 authority
   by reference.
5. **Safe staff/product UX:** quiet **Search engines & sharing**, provenance,
   reset-as-delete, honest examples, plain status, mobile/accessibility, and no
   score or provider theater.
6. **Operational integrity:** composite Tenant scope, complete cache identity,
   safe serialization, pinned schedules, fail-closed activation, forward
   recovery, and redacted reconciliation are launch contracts.
7. **Explicit exclusions:** no enterprise SEO suite, per-platform copy, raw
   schema/head, AI generation, arbitrary images, tenant crawler rules,
   request-time cards, ranking promises, or general URL submission.

### Must be addressed during implementation before any Site activates

1. Inventory current metadata/JSON-LD/root/file/sitemap/robots/Phase 22 seams;
   build a shadow rendered-output comparison.
2. Design provider-neutral manifest/profile schemas with exact versions,
   constraints, RLS, CAS, and backward fixtures.
3. Build exact-pin Next and optional Payload adapters and prove rendered
   no-JavaScript behavior.
4. Implement Site impact analysis, D1 preparation/CAS, post-activation host
   sitemap/robots/cache projection, optional notification convergence, and
   synthetic deletion/host checks.
5. Run the complete Page family/reach/status/locale/schedule/Preview/Trash/media/
   migration/fault/load/accessibility suite, including exact-`public`
   discrimination and anonymous/authenticated-session/crawler output invariance.
6. Conduct task-based usability research with multilingual occasional ministry
   staff and fix copy/grouping before adding features.
7. Cut over one explicit Site × locale cohort with no dual authority and a
   proven forward-recovery path.

### Monitor after activation without expanding scope

1. Profile fan-out, compile time, sitemap size, bot load, cache hit rate, and
   reconciliation age before introducing partitions or new infrastructure.
2. Search-engine crawl/index/snippet behavior and social-card cache lag as
   external observations, not SLAs or release truth.
3. Optional IndexNow receipts, retries, and outcomes; disable safely without
   changing release correctness.
4. Payload 4 stable/API maturity and Next upgrade behavior through exact-pin
   conformance—not announcements.
5. Real tenant evidence for any additional title pattern, structured-data
   family, platform-specific copy, or writing assistance before a new decision.

## Final adversarial verdict

**Proceed with the exact C-prime-R candidate in the decision brief.** It is
architecturally sound, Tenant-safe, locale-exact, understandable, and modern
when the 28 clauses are treated as one indivisible contract. Removing the D1
manifest, delta-only storage, D2 reach, D24 exact-`public` audience, D22/D27
derivations, D14 reference boundary, complete migration cutover, or staff/
external-state distinction would reintroduce the highest-risk failure modes.
Adding a larger SEO suite would add debt without improving the core user task.
