> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Phase 25 R02 — Start reading, with optional ministry filtering

> **Founder-ratified, 7 September 2026:** Conrad explicitly accepted this decision and its amendments/recommendations. The review disposition below is retained as its historical assessment; the corrected decision and execution safeguards are now ratified. Implementation/release proof remains outstanding.

Founder decision and adversarial research record. Reviewed 6–7 September 2026; consolidated 7 September. **Disposition: Accept with required amendments.**

Conrad selected: “Yes, do A: start reading, with optional ministry filtering.” A remains the right direction. The amendments below make that choice precise and prevent unsafe or misleading implementation; they do not add audience rights, new social features or a new content system. This is a grooming record and wording to carry forward when authorized, **not a PRD, formal specification, implementation plan or published ticket**. No repository, GitHub or live-provider state was changed for this review.

## The exact corrected decision to record

> Ministry Updates opens directly into one calm reading list of the updates the current donor is authorized to see. A visible, optional ministry filter narrows that list without changing access, giving, follows, notifications or communication preferences. Each entry clearly identifies its permitted ministry and date. The existing content owner supplies the exact audience-safe content, media, stable ordering and complete continuation; the portal creates no competing feed or permission truth. Readers can deliberately load older updates, refresh for newer ones and return without losing their valid place. Empty, unavailable, failed and complete results are explained truthfully. The ordinary organization-shared Updates link takes each opener to their own authorized destination, through sign-in when necessary. Use the exact shared shadcn base-maia/Base UI system. Keep it quiet: no forced setup, engagement ranking, autoplay, reading pressure or extra configuration.

The contractual qualifications are C01–C16 below. “All” is a friendly label for **the reader's permitted set**, never the whole organization's posts. A source projection means the content owner’s approved version for this audience, language and purpose—not a copied post the portal can edit. A continuation is the owner's bounded instruction for getting the next part of that same reading view.

**What changes for people:** donors start reading immediately and can focus on one ministry; missionaries publish once through their existing tools; staff have one source to inspect when something is wrong; editors retain existing release authority; public visitors acquire no protected access from a shared link. Finance, gifts, statements and consent facts are unaffected.

**Honest tradeoff:** frequent publishers occupy more space. A grouped ministry overview is the strongest alternative because it can distribute initial attention more evenly. It also introduces a selected digest and another layer before full history. For the ratified effortless entry, clear ministry labels and a filter are the simpler answer. Equal exposure, ranking or a ministry-balanced digest would be a separate product decision, not a hidden safeguard.

## Adversarial check

### What could go wrong with this answer?

An apparently simple combined list could expose too much, hide older content, move while someone reads, or report a failed operation as complete. Source inspection found an unqualified service-role post reader, alternate raw interaction reads, unstable offset paging, a false “caught up” message and a comment demo-success response. These are concrete implementation concerns; no hosted donor exposure was tested. The 22-category review and F01–F16 explain the conditions and consequences.

### What hidden assumptions are we making?

We cannot infer audience from giving, following, household membership or a generic donor role. We cannot assume that a source appearing in the first batch represents the complete history, that a short page is the end, or that a rendered item was read. We also have no measured Asym donor feedback proving this layout increases retention or reduces support. The founder's stated need is verified; the proposed interaction quality remains a product judgment to test.

### How does this affect the whole product?

It changes entry presentation, not domain ownership. Phase 22 retains Update/release/response meaning; identity, relationship and safety owners retain current access; Phase 24 retains the account host and brand. The home preview, full list, details, media, authentication return and reachable legacy channels must agree. A display filter cannot silently alter the missionary's support view, donor consent or a public page.

### How does this affect the end-user experience?

Start reading, see who an update is from, optionally focus, and deliberately get older content. Keep the current place steady. Offer a clear local retry when loading fails and a clear return to All when a selection becomes unavailable. Do not show hidden source names, fake zeroes, unexplained disappearance, endless spinners or unsupported successful participation. Necessary sign-in should return the reader to the intended page.

### Does this follow modern best practices?

Yes as a restrained inference: current primary sources support source-focused reading, explicit feed choices, stable reading position and accessible continuation. Social platforms' discovery algorithms, custom-feed marketplaces and notification coupling are not evidence that Asym needs them. Semantic articles and a clear Load more control avoid taking on an infinite-feed accessibility contract without a demonstrated need. Vendor documentation is not donor usability proof.

### Does this fit Asym’s existing repo and product direction?

Yes against intentional ownership and the active Phase 22/24 contracts. Current source behavior does not yet satisfy that direction. Exact base-maia, Base UI, shared semantic tokens and code-owned account structure remain durable choices; a theme name alone does not prove accessible composition. The active specification branches remain distinct from merged contracts and verified runtime.

### Should we adjust the recommendation?

**Keep A; accept with required amendments C01–C16.** No additional founder-level authority or scope change is needed to record this reading choice. Do not call the overall Phase 25 specification or the runtime complete: source integration, real proof and the other Phase 25 journeys remain required work. This report completes this decision's adversarial review, not those implementations.

## Exact safeguards to carry forward

These clauses are decision qualifications and later specification inputs. They are not instructions to implement or publish now. Architectural owner contracts take precedence over examples of portal wording; any material conflict must be surfaced as an amendment rather than silently reinterpreted.

### C01 — Reader scope

Open the combined list immediately in the current authenticated account context. “All” means only the union of the content owner's currently admitted Supporter Release Projections for this reader, purpose and history rights. Donation, follow, household, author, Site, filter, URL or generic login role grants no additional access. No new grant or tenant-wide feed is created.

### C02 — One owner and one identity

Phase 22 supplies canonical Update identity, the exact current audience/locale projection, stable ordering and continuation, corrections, withdrawals and media references. Render each admitted entry once by its owner-defined identity; never deduplicate by text/title, merge audience variants, pick the richest version, or substitute creation time, donations or engagement as order. If the owner contract is unavailable, do not fabricate it in the portal.

### C03 — A view-only ministry filter

Default to All on an unfiltered entry. Offer a clearly named optional single-ministry filter using only owner-disclosable source options for the current reader/purpose. Options, names, images and any counts are protected projections, not a raw directory or the sources on the first loaded page. Filter the authorized source query before pagination. Selecting or clearing a filter changes no follow, consent, notification, giving, audience or history authority.

### C04 — Filter transitions

Changing the filter starts a new continuation window and cancels/ignores obsolete responses. Keep the selected scope visible and provide a clear return to All. Malformed, stale or no-longer-disclosable selection cannot silently broaden the result or reveal a hidden source; show a neutral selection-unavailable state with an explicit All action. Back navigation may restore the prior view only within the same freshly authorized context. No cross-session saved-filter database is required.

### C05 — Complete, bounded reading

Use finite source-qualified batches and explicit Load more through Phase 22's stable, opaque continuation contract. The server enforces bounded input/work/response sizes, filters before limiting and supplies continuation/exhaustion evidence. Concurrent repeated Load more cannot append duplicates. A short page or client-filtered empty page is not proof of exhaustion. Say end of currently available results only when the owner proves it; never infer read completion or add a read/unread ledger.

### C06 — Stable reading with current safety

Do not insert new positive content above the reader automatically. Use deliberate refresh; if the existing freshness mechanism proves newer content, offer one quiet Show new updates action. No dedicated realtime service is required for that notice. Preserve a valid reading anchor and filter on return. Current withdrawal, safety and authorization take priority over position restoration. No blur, stale title, placeholder or cached media may disclose forbidden content.

### C07 — Authorization, cache and races

Derive tenant/environment, principal/represented subject, purpose, history and locale context from trusted server authorities. Bind query identity, continuation and response generation to every relevant owner-defined scope/version. Re-prove current admission before positive cache reuse and every governed content, detail, media, option, continuation or engagement request. Discard old-context responses even if cancellation fails. Revocation wins requests admitted after the owning revocation boundary; already admitted/delivered bytes cannot be recalled. Tags and session validity are not authorization.

### C08 — Database and alternate read paths

The owning schema and command boundary must enforce non-null authoritative scope, same-scope keys/references, stable identities, immutable released versions and restrictive historical deletion. Evaluate grants, RLS, invoker/owner views, functions, RPCs, raw Data API and Realtime as well as app routes. Apply USING to existing-row eligibility and WITH CHECK to proposed-row eligibility where the operation supports them; privileged commands must enforce equivalent checks. INSERT uses WITH CHECK, DELETE uses USING, and UPDATE generally needs both. Read-only tables need no write policy. Privileged/bypass paths must enforce equivalent current audience/tenant rules. R02 adds no monetary columns or writable financial facts.

### C09 — Protected media and sanitized content

Serve permitted text, previews, author display, thumbnails and full media through the exact source-approved projection and protected media authority. No raw/public storage or image-optimizer fallback for protected assets. Recheck sanitization and admitted links/embeds through the content owner; do not render raw CMS HTML or create a new sanitizer/copy. Anonymous previews disclose only approved neutral portal branding. Public variants and public share links remain separately admitted.

### C10 — Existing engagement only

Reading and display filtering create no engagement, subscription or consent fact. If existing response controls are exposed, the exact source Response Profile/Engagement Space and mutation-time authority govern them independently. Derive actor and scope server-side, preserve the owner's durable idempotency, and show persisted success only after the owner confirms. Demo no-ops, local bookmarks, unsupported reports/follows or transport success cannot appear as completed actions. This decision creates no new engagement scope.

### C11 — Links, host and locale

Preserve the normal organization-shared, non-credential Updates URL on Phase 24's verified portal host, and the authorized destination through sign-in/recovery. Every opener resolves their own content. Exact card links are owner-supplied and purpose-specific. A public permalink never substitutes for a protected link. Use bounded allowlisted navigation state without names, emails, grants or financial identifiers; do not export confidential filter context to tracking/referrers. No browser-language guess, unsafe locale fallback, Site reskin or unverified host fallback.

### C12 — Quiet accessible UI

Use exact shared base-maia/Base UI and semantic tokens, visible labels, source/date context, concise source-approved previews, semantic articles/lists, proper focus and polite status. Use progressive disclosure, no forced setup, autoplay audio/video, engagement ranking, reading streaks or default unread pressure. Distinguish initial loading, no available updates, valid filter with no results, partial unavailability, load failure and proven exhaustion. Errors are local and recoverable; show no false zero, false success or unproved all-clear. Apply existing mobile, reflow, target-size, contrast and reduced-motion rules.

### C13 — Bounded failures and recovery

Expose typed owner outcomes, validate response envelopes and retain only content still admitted for the current context. If older-item loading fails, preserve the valid earlier list and allow bounded retry of the same read; malformed success is an error, not empty data. If the owner can prove a safe partial result, label it incomplete and preserve its continuation; otherwise do not claim a complete combined list. Authorization ambiguity cannot fall back to broader/raw data. No unbounded automatic retry or direct database repair path.

### C14 — Capacity and diagnostics

Reuse existing source services, query infrastructure, request deadlines, rate controls and batched enrichment; no per-ministry browser/provider fan-out, new search engine, copied-post store or custom feed framework. Bound page/filter/cursor/media work and verify actual selected numeric limits against production-shaped data and existing platform budgets before activation. Diagnostics use minimized request/owner/cause/generation references, not bodies, private labels, raw URLs or read-inference analytics. Security evidence and durable domain history remain separate from technical logs.

### C15 — One-authority adoption

Inventory list/detail/filter/media/raw-table/Realtime/engagement/callback/old-link consumers. Reconcile existing Phase 22/24 issue ownership before implementation; do not duplicate predecessor tickets. Qualify the complete target reader and protected paths before switching the affected cohort. Preserve legitimate historical identities/links through owner mappings. Retire unsafe legacy readers/grants and fake controls, reject incompatible cursors/envelopes, and roll forward through owners after durable source writes. Containment may make the affected path unavailable; it cannot revive an unsafe fallback.

### C16 — Required proof and traceability

Map R02 and C01–C15 to the later authorized specification and exact owner requirements, existing tickets, tests and release evidence. Require real owning-service/PostgreSQL grant/RLS/concurrency tests, provider/media contract tests where relevant, and accessible authenticated end-to-end journeys with adverse cases. Synthetic experiments and mocked mappings cannot close release proof. No new ADR is necessary merely for the entry layout; use an explicit amendment only if accepted ownership or audience rules actually change.

## Independent category review

All **22 requested categories** were evaluated separately. “Material” means an actionable concern for faithful implementation, not a verified live incident. A conditional concern is labeled as such. Shared findings are referenced rather than repeated with different severity in each category. Each F entry below includes what fails, why it matters, severity, likelihood, evidence, effect on the answer, permanent prevention and exact change references.

Severity uses the credible impact of the stated trigger: Critical for possible protected-boundary disclosure, High for substantial privacy/integrity/operability failure, and Medium for friction or avoidable complexity. Likelihood is qualitative and conditional; no unsupported incident probability is claimed.

### 1. Problem validity, necessity, and alternatives

**Material concern: No material concern in the selected product direction.**

The founder explicitly wants an easy reading destination. The existing Updates route and generic organization link establish a concrete workflow; source-first selection adds a mandatory step. The strongest alternative is a grouped ministry overview, which gives quieter publishers more initial space but adds a selected digest and another layer before complete reading. A plus an optional filter serves both general and focused visits with less machinery. Actual donor preferences have not been measured; do not claim proven retention or support reduction. Exact card dimensions, batch size, breakpoint and transport remain implementation choices, not frozen product law.

**Concern register:** F09, F15, F16. **Required language/proof:** C01–C06, C12, C14, C16.

### 2. Brittleness

**Material concern: Yes.**

The present reader assumes a nonempty first batch means completion, creation timestamps are sufficient order, and a valid session/profile role is enough scope. Filters, late responses and locale/subject changes break those assumptions. A must consume typed owner contracts and treat stale selections and ambiguous authority explicitly.

**Concern register:** F01, F03–F05, F11, F14. **Required language/proof:** C02–C07, C11, C13.

### 3. Technical debt

**Material concern: Yes.**

The shared hook and batched enrichment are reusable structure; mutable raw posts, an unqualified privileged reader, local Saved state and demo-success comments are not permanent contracts. Replacing only the screen would retain duplicate authority and incompatible read/write behavior. Repair through the existing owners and retire affected legacy paths as one adoption effort.

**Concern register:** F01, F07, F08, F12, F15. **Required language/proof:** C02, C08, C10, C14–C16.

### 4. Edge cases

**Material concern: Yes.**

Checked zero/one/many permitted ministries; unequal publishing frequency; a ministry absent from page one; long/renamed names; equal dates; duplicate placements; valid empty versus unavailable filters; withdrawn/corrected updates; missing translations; expired sessions; two tabs; delayed requests and invalid cursors. These require complete filtering, stable owner paging and truthful distinct states, not additional setup or ranking.

**Concern register:** F03–F06, F08, F09, F11, F14. **Required language/proof:** C02–C07, C09, C11–C13.

### 5. Footguns

**Material concern: Yes.**

Dangerous shortcuts include accepting caller tenant/actor fields, fetching all tenant posts then hiding them, treating a filter as a follow or consent operation, using a public link for protected content, passing raw media URLs, and reporting a transport no-op as success. Source commands derive authority and attribution; presentation cannot expand them.

**Concern register:** F01–F03, F06, F07, F11, F15. **Required language/proof:** C01, C03, C07–C11.

### 6. Tenant safety

**Material concern: Yes.**

Reviewed same/different tenant and environment, cross-Site continuity, same-user represented-subject switches, purpose/history rights, cache identity and host/locale generation. Tenant scoping alone is insufficient: two donors in the same organization can have different permitted content. Options, media and late responses need the same isolation as cards.

**Concern register:** F01, F03, F05, F06, F11. **Required language/proof:** C01–C04, C07–C09, C11.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

Reviewed source schema, grants, public-parent SELECT policies, service-role RPCs, view execution, Realtime and storage. The synthetic PostgreSQL check demonstrates owner/bypass and WITH CHECK behavior, not Core qualification. Source adoption must prove non-null trusted tenant/owner attribution, same-tenant foreign keys, exact update/revision/placement cardinality, uniqueness, permitted states, indexed scope, immutable release lineage and restrictive historical deletion. Read-only tables do not need write policies merely to satisfy a checklist. Existing reaction uniqueness and service-only RPC grants are useful controls. R02 adds no money types or financial write path.

**Concern register:** F01, F02, F05–F08, F12, F16. **Required language/proof:** C02, C07–C10, C15, C16.

### 8. Overengineering

**Material concern: Yes — avoidable scope risk.**

Social ranking, fairness quotas, saved multi-feed configurations, read/unread tables, extra notification preferences, a custom feed engine and tenant layout builders are unsupported additions. No-build reuse of the existing source-qualified reader and query stack is preferred wherever it can satisfy the audited contract. A simple filter and bounded continuation need no social-platform integration.

**Concern register:** F15. **Required language/proof:** C01–C06, C10, C12, C14.

### 9. UX/UI and user friction

**Material concern: Yes.**

Immediate reading removes compulsory selection. Frequent publishers still occupy more space; visible ministry labels and focused filtering are the honest remedy. Preserve the reading position, reachable navigation and current filter. Use exact Maia/Base UI with localized labels/dates, long-name support, explicit loading/retry and no surprise movement or autoplay. International name order must not be inferred by splitting a display name; addresses and financial forms are untouched. Existing auth-return and hidden mobile-label problems directly impair the chosen journey.

**Concern register:** F03, F04, F09, F11, F14. **Required language/proof:** C03–C06, C11–C13.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

Postgres and source services retain business facts. Phase 22 owns the canonical Update, separate release projections, current heads, ordering, correction/withdrawal and response authority; 3/10/12 and relationship owners govern current admission/history. Phase 24 supplies the verified account host/brand context. UI filter, page position and cached cards are derived transient state. One entry cannot acquire broader rights, a richer audience variant, new revision truth, consent or giving effects by appearing in the combined list.

**Concern register:** F01, F03, F07, F08, F15. **Required language/proof:** C01–C03, C07, C08, C10, C11.

### 11. Hidden coupling

**Material concern: Yes.**

The home preview and reading page share a hook; changing it can affect both. Public-post prechecks and privileged supporter reads currently disagree. Authentication callbacks, host resolution, image optimization and client caches are part of this journey even though they live elsewhere. Filter selection must remain independent of email consent, follow state, contribution eligibility and future missionary support views.

**Concern register:** F05–F07, F11, F12, F15. **Required language/proof:** C03, C07–C11, C14, C15.

### 12. Failure modes

**Material concern: Yes.**

A malformed success currently becomes empty data. Timeout, partial owner failure, media denial, expired continuation and lost responses require distinct bounded outcomes. A failed older-items request should preserve still-authorized earlier content and offer local retry; permission ambiguity must never trigger raw/public fallback. This reading decision has no new authoritative write/secondary-effect saga. Existing visible responses use the source command's readback/idempotency instead of retrying blindly.

**Concern register:** F05–F07, F13, F14. **Required language/proof:** C05, C07, C09, C10, C12–C14.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

Reviewed initial load, ready/empty, filter transition, loading more, exhaustion, recoverable failure, context change and access loss. Source release/correction/withdrawal and history eligibility remain separate from those UI states. Publication during paging, timestamp ties, duplicate requests, source corrections and revocation races cannot change the selected scope or duplicate entries. Mutation-time owner admission and durable effect identity remain necessary for existing response controls; loading or filtering creates no write to deduplicate.

**Concern register:** F04, F05, F07, F08, F14. **Required language/proof:** C02, C04–C08, C10, C13.

### 14. Data integrity risks

**Material concern: Yes.**

Checked duplicate placement/card identity, unstable offset continuation, dropped older results, audience variant mixing, mutable history and stale context. Display deduplication cannot repair an invalid source relationship. Same-scope constraints and source revision/continuation contracts are the permanent prevention; no copied portal post table or financial reconciliation is introduced.

**Concern register:** F03–F05, F08, F12, F14. **Required language/proof:** C02–C08, C13, C15.

### 15. Security and privacy risks

**Material concern: Yes.**

Reviewed raw data channels, protected identities/media, anonymous previews, cache reuse, malicious content/link handling, shared URLs, logs and stored browser state. No new export, read-tracking dataset or donor-public sharing right is authorized. Retention, anonymization, backups and source deletion remain under existing owners; a portal cache may not become a surviving unauthorized copy. Do not advertise recall of content already lawfully delivered.

**Concern register:** F01–F03, F05–F07, F11, F13. **Required language/proof:** C01, C03, C07–C11, C14, C15.

### 16. Scalability and performance risks

**Material concern: Yes — capacity remains unproved.**

Existing bounds of 1–100 posts and offset 0–10000 are observed input guards, not certified capacity. The target must use bounded indexed owner reads, protected options, batched enrichment and bounded media; it must avoid one browser request per ministry or downloading all history. Existing public-home/login performance tests do not establish authenticated Updates latency. Selected numeric limits, workload and relevant existing budgets must pass before activation; no invented donor cardinality or p95 claim is used.

**Concern register:** F04, F10, F16. **Required language/proof:** C05, C14, C16.

### 17. Operational burden

**Material concern: Yes.**

Parallel readers, unexplained denied reactions, fabricated sharing URLs, false empty/success states and custom per-tenant behavior would create recurring staff intervention. One owner service, normal links, local retry, typed reasons and a complete affected-path cutover reduce support work. No content-balancing operator, manual feed curation, separate support queue or direct SQL repair workflow is justified.

**Concern register:** F07, F11–F15. **Required language/proof:** C10–C15.

### 18. Observability and auditability gaps

**Material concern: Yes.**

Technical traces must identify the request, owner, normalized failure and compatible generation without storing private content/labels. Content release and response command history are durable owner facts; cache/fetch logs are not human-reading evidence. The monitor table gives concrete invariant thresholds, responsible domain owners and containment. No current observability coverage is claimed merely because these requirements are recorded.

**Concern register:** F07, F13, F14, F16. **Required language/proof:** C10, C13, C14, C16.

### 19. Dependency and integration risks

**Material concern: Yes.**

Phase 22/24 owner contracts and source issues remain open; host preparation is not host activation. The target requires their actual admitted projection/media/host services, not their phase numbers. Exact installed Base UI/shadcn contracts govern implementation; current vendor examples may use newer APIs. Social products are research references, not dependencies. R02 introduces no Stripe call, provider financial action, social webhook or synchronization job.

**Concern register:** F06, F11, F12, F15, F16. **Required language/proof:** C02, C09, C11, C12, C14–C16.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

A new page with old table grants, media paths or callbacks still reachable is an incomplete adoption. Inventory affected consumers and predecessor bodies; prove mixed-version envelope/cursor rejection, owner-qualified historical mappings, safe activation and restrictive fallback. Backfills need source authority, repeatability and preserved IDs, not inferred new audience. After durable owner migration, roll forward or contain; do not reactivate obsolete readers.

**Concern register:** F02, F06–F08, F11, F12, F16. **Required language/proof:** C08–C11, C15, C16.

### 21. Testability, traceability, and proof

**Material concern: Yes.**

Current mapper/fetch tests and the isolated database experiment do not prove the target service, RLS, media, concurrency, usability or deployment. The proof matrix below links this decision to current owners and later authorized artifacts. Require real negative/positive boundary outcomes, not snapshots of the new code. There is no new term or ADR solely because a page defaults to a combined list.

**Concern register:** F16; all findings require mapped proof. **Required language/proof:** C16 and T01–T12.

### 22. Other development hazards

**Material concern: No additional material concern after the scoped review.**

Checked accidental expansion into money, statements, consent classification, campaigns, public discovery, provider configuration and a separate publishing product. None is needed or authorized by A. Build/rollback, dependency drift, unsupported raw-source assumptions and maintainability are already material findings above, with named prevention; no extra framework or generalized remediation program is warranted.

**Concern register:** F12, F15, F16 (already classified). **Required language/proof:** C01, C03, C10, C14–C16.

## Concern register — evidence, consequence and permanent prevention

### F01 — Combined is not tenant-wide

**What could go wrong:** Reusing GET /api/posts admits published protected content without current supporter-purpose/history/safety checks; compatibility profile roles can remain admitted after membership removal.

**Why it matters:** The list can disclose ministry information to a signed-in person who has no right to that audience.

**Severity:** Critical

**Likelihood:** High if the demonstrated legacy path is reused with protected published rows; no hosted exposure was tested.

**Evidence and reasoning:** S01 posts/index.ts:50–72,85–137; S03 permissions.ts:84–92; S10 ADR-0128:29–78. Actual helper returned donorAllowed=true for synthetic donor profile with no memberships.

**Effect on the answer:** Qualifies A; does not invalidate combined reading.

**Permanent prevention:** Use the source's current purpose-authorized projections and fail closed when authority resolution fails; no new permission system.

**Exact change:** C01, C07, C08

### F02 — Raw and alternate data channels bypass the UI

**What could go wrong:** Public interaction-table grants expose user IDs/comment bodies for public-parent rows; direct queries, views, RPCs or Realtime can bypass a carefully filtered screen.

**Why it matters:** An HTML-only fix leaves other disclosure paths and mixed public/supporter semantics intact.

**Severity:** High; potentially Critical if a disclosed interaction identifies a restricted worker or relationship

**Likelihood:** High under the inspected grants and populated public interactions; hosted migrations and data were not inspected.

**Evidence and reasoning:** S02 June25 migration:83–87,131–150,280–299 and initial schema:140–171; S10 Phase22 D12. PostgreSQL experiment E01 showed an owner view/bypass role defeating an invoker's row scope.

**Effect on the answer:** Requires the adoption inventory to cover alternate channels; no new donor feature.

**Permanent prevention:** Enforce equivalent row and field projections at each reachable channel, and retire broad legacy grants during the owner cutover.

**Exact change:** C08, C09, C10, C15

### F03 — Filter completeness and confidentiality

**What could go wrong:** Filtering only the current batch can falsely say no updates; a tenant-wide options directory can reveal hidden ministries. A stale selection can silently fall back to All.

**Why it matters:** The user either misses content or learns a relationship/source they may not see.

**Severity:** High

**Likelihood:** Observed local batch filtering exists; protected-option leak is conditional on a naive future implementation.

**Evidence and reasoning:** S04 feed client:395–430; S05 hook:49–103; E01 loaded-slice filter returned 0 while the source-filtered query returned 1; S10 audience rule.

**Effect on the answer:** Narrows implementation meaning of optional filtering without changing the chosen option.

**Permanent prevention:** Obtain source-qualified options independently of the loaded page; filter before paging, make scope visible, and handle unavailable selection explicitly.

**Exact change:** C03, C04

### F04 — Unstable paging and false exhaustion

**What could go wrong:** Offset paging can repeat/skip items when content changes; non-unique timestamps do not form a stable order. The current screen says caught up after one nonempty batch.

**Why it matters:** Donors cannot trust that they reached the available history; small or irregular ministries may be missed.

**Severity:** High

**Likelihood:** High with concurrent publication if current offset reader is extended unchanged; false message is deterministic.

**Evidence and reasoning:** S01:60–61; S04:518–526; S05 discards continuation metadata; E01 reproduced one duplicate with offset and none with a stable keyset boundary; P01 PostgreSQL LIMIT guidance.

**Effect on the answer:** Adds mandatory continuation/exhaustion semantics; A stands.

**Permanent prevention:** Consume owner-provided stable order/window/continuation; no local comparator or read-status inference; explicit bounded Load more.

**Exact change:** C02, C05

### F05 — Stale scope and late responses

**What could go wrong:** A cached positive result or late response from the previous filter/Party/locale can populate the new view; revocation can leave old positive cache entries reusable.

**Why it matters:** Cross-subject disclosure and misleading filter results are possible even when each original request was valid.

**Severity:** Critical

**Likelihood:** Conditional on switches/narrowing and cache reuse; missing scope/generation is observed, not an executed leak.

**Evidence and reasoning:** S01:19–45; S05:49–63,90–103; S03 client-session.ts:64–82 clears on user change but does not prove all same-user transitions; S10 current egress rule.

**Effect on the answer:** Implementation safeguard; no new identity model.

**Permanent prevention:** Use complete query identity and generation fencing, cancellation plus late-result rejection, owner current admission and revocation boundaries.

**Exact change:** C04, C06, C07

### F06 — Images and previews can leak independently

**What could go wrong:** A protected card can reference a publicly cached thumbnail, original or optimizer URL; shared metadata can reveal titles or identities before authentication.

**Why it matters:** Protecting text does not protect sensitive location, identity or relationship evidence in media.

**Severity:** Critical

**Likelihood:** Conditional on protected assets using the observed raw/public paths; no live asset was inspected.

**Evidence and reasoning:** S05:161–165; S06 next.config.ts:65–100; S02 initial storage rules:460–505; S10 D11 media scope and issue1302.

**Effect on the answer:** Requires exact media/access adoption; preserves easy reading.

**Permanent prevention:** Use the owning protected-media manifest/delivery, sanitized source previews and neutral anonymous metadata; no public optimizer fallback.

**Exact change:** C07, C09, C11, C15

### F07 — Reading and responding disagree or fake success

**What could go wrong:** The privileged list can return protected posts that cookie-client reaction prechecks cannot read; mutation checks can go stale before RPC; comments POST reports a demo success without persistence.

**Why it matters:** Donors encounter inexplicable failures or believe they participated when nothing was saved.

**Severity:** High

**Likelihood:** No-op success is certain on current POST; protected reaction failure/race is conditional on current data/policies.

**Evidence and reasoning:** S07 reaction-route-utils.ts:39–47, reaction-route-handlers.ts:49–64; S02 RPC:78–98; S08 comments.ts:38–43.

**Effect on the answer:** Does not authorize new engagement. Existing displayed controls must meet their owner's contract.

**Permanent prevention:** Use the exact response profile and mutation-time checks, server-derived attribution and durable idempotency; never label unsupported/no-op work successful.

**Exact change:** C10, C13, C15

### F08 — Mutable content and duplicated projections corrupt reading history

**What could go wrong:** Mutable updates/deletes can rewrite a released item; combining public/supporter variants or multiple placements can duplicate or mix content; sorting by edit time can silently promote old posts.

**Why it matters:** The reader sees inconsistent meaning and history, while privacy changes can be misapplied.

**Severity:** High

**Likelihood:** Observed legacy mutability; mixing is a plausible future error if the owner contract is ignored.

**Evidence and reasoning:** S02 update/delete RPC:480–489,535–539; S10 separate projection heads/identity/history and ordering ownership.

**Effect on the answer:** Constrains A to owner-selected entries; not a second release model.

**Permanent prevention:** Keep immutable owner revisions, current selected audience projection and owner correction/withdrawal behavior; deduplicate only exact entry identity.

**Exact change:** C02, C05, C06, C08

### F09 — A moving or noisy feed defeats effortless use

**What could go wrong:** New insertions shift reading position, endless scrolling obstructs navigation, hidden labels and heavy animations impair mobile/accessibility, and unread pressure invents obligations.

**Why it matters:** Users lose their place, cannot reach controls, or receive avoidable cognitive burden.

**Severity:** Medium–High

**Likelihood:** Likely if conventional social-feed mechanics or current presentation are copied uncritically; no Asym usability study was run.

**Evidence and reasoning:** S04 animations/type filters/local Saved; S09 mobile hidden labels and shared controls; P05 Mastodon Slow Mode; P09 W3C feed pattern/caveats.

**Effect on the answer:** Adds quiet interaction safeguards, not a new feature.

**Permanent prevention:** Stable current window, deliberate refresh, explicit continuation, ordinary semantic articles, visible filters, source-safe state restoration and exact Maia components.

**Exact change:** C04, C05, C06, C12

### F10 — Bounded input does not prove scalable aggregation

**What could go wrong:** Per-source browser fan-out, full-history downloads, offset scanning and heavy images can make one large account slow or starve others.

**Why it matters:** Poor performance turns a simple UX into repeated waiting and creates operational cost.

**Severity:** High

**Likelihood:** Conditional at higher cardinalities; current code has input bounds but no R02 capacity qualification.

**Evidence and reasoning:** S01 offset query; S11 limit1–100 and offset0–10000 are legacy guards; P01 offset work; existing performance tests cover home/login, not authenticated Updates.

**Effect on the answer:** Implementation/capacity requirement; no speculative infrastructure justified.

**Permanent prevention:** Use indexed owner queries with bounded continuation and batched enrichment; validate selected numeric limits and existing budgets using representative workloads before activation.

**Exact change:** C05, C14

### F11 — Link/host/locale handling can misroute or disclose

**What could go wrong:** Current share URL is fabricated; auth callback prefers role home; unqualified filters or public locale routes can redirect, disclose or change account context.

**Why it matters:** The shared link fails its purpose or takes the donor to the wrong authority/audience.

**Severity:** High

**Likelihood:** Current URL/callback mismatch is observed; unsafe-host/filter outcomes are conditional if inherited.

**Evidence and reasoning:** S04:112–129; S03 callback.ts:17,35–41; S12 ADR0185; existing safeNextParam is a positive precedent.

**Effect on the answer:** Carry R01 through A; no new public-sharing scope.

**Permanent prevention:** Preserve validated destination and verified Tenant host, use owner links, keep public and protected purposes distinct, and minimize URL/referrer state.

**Exact change:** C04, C11

### F12 — A partial cutover leaves two authorities

**What could go wrong:** The new list can coexist with old media/raw-table/Realtime/comment paths; rollback after source writes can reactivate obsolete interpretation or destroy lineage.

**Why it matters:** Fixes become bypassable and upgrades/repair become unsafe.

**Severity:** High

**Likelihood:** High if adoption is scoped only to the visible page.

**Evidence and reasoning:** S01–S08 path inventory; S10 Phase22 adoption rules; source issues1302/1303/1304/1310 and Phase24 bridges remain open. Their complete runtime qualification has not been established.

**Effect on the answer:** Adds owner-scoped adoption/reconciliation gates; no new migration engine.

**Permanent prevention:** Complete inventory and exact owner mapping, compatible envelopes/cursors, cohort qualification, legacy retirement and safe roll-forward/containment.

**Exact change:** C08, C15, C16

### F13 — Diagnostics can be either inadequate or invasive

**What could go wrong:** Generic errors and raw URLs/content in logs make failures hard to repair or leak private context; opening/rendering can be mistaken for reading.

**Why it matters:** Operators lack reliable evidence while donors acquire unnecessary tracking risk.

**Severity:** High

**Likelihood:** Conditional new-design risk; current response envelope and error handling lack the target proof.

**Evidence and reasoning:** S05 malformed {} currently becomes empty; S08 raw error.message; S10 separates released/visible/delivered/read; initial audit lacks donor-specific proof.

**Effect on the answer:** Implementation/operational safeguard.

**Permanent prevention:** Use typed causes and minimized restricted evidence references; technical traces are not domain history or human-read evidence. Apply explicit invariant signals and responses.

**Exact change:** C12, C13, C14, C16

### F14 — Failure and partial-result ambiguity

**What could go wrong:** An unavailable source can look like no updates or a complete list; repeated retries can duplicate appended content; restoring stale content can defeat withdrawal.

**Why it matters:** Users receive a false explanation and staff cannot distinguish absence from failure.

**Severity:** High

**Likelihood:** Observed permissive empty-envelope mapping; other cases are conditional under owner outages and lost responses.

**Evidence and reasoning:** S05 transport/parser and test:193–202; S10 per-owner ambiguity/partial outcome rules; E01 current visibility removed a revoked fixture while continuing remaining results.

**Effect on the answer:** Clarifies truthful outcomes; no compensating business transaction is needed for a read.

**Permanent prevention:** Require typed response/exhaustion/partial evidence, local bounded read retry, same-window deduplication and fresh access; no broad/raw fallback.

**Exact change:** C05, C07, C13

### F15 — The filter grows into a new social product

**What could go wrong:** Saved filters, rankings, fairness quotas, follows, newsletter choices, automatic reading marks and per-Tenant page builders can become hidden dependencies of a simple reading page.

**Why it matters:** Maintenance and support grow while intentional phase ownership is weakened.

**Severity:** Medium–High

**Likelihood:** Conditional scope-creep risk, not an existing necessity.

**Evidence and reasoning:** User R01/R02; S10 no separate feed/follower/audience owner; P05–P08 social features are optional precedents, not requirements.

**Effect on the answer:** Keep the selected answer narrow; reject unrelated additions.

**Permanent prevention:** Use transient view state and existing owners. No new social-provider dependency, durable filter/read ledger, ranking or notification side effect.

**Exact change:** C01–C04, C10, C14

### F16 — Evidence can be mistaken for completed product proof

**What could go wrong:** Mocked mapping, source strings, a synthetic database or vendor help page can be reported as proving actual donor safety, usability or scale.

**Why it matters:** The project can activate an unsafe feature under an inaccurate readiness claim.

**Severity:** High

**Likelihood:** Likely without explicit evidence labels; existing tests lack the target coverage.

**Evidence and reasoning:** S13 tests inventory; E01 is explicitly synthetic; current owner PRs remain open; no hosted donor journey or visual test executed.

**Effect on the answer:** Does not change A, but controls recording and release claims.

**Permanent prevention:** Maintain exact requirement-to-test/owner links; require actual schema/service/browser/provider proofs before runtime readiness; keep assumptions and measurements explicit.

**Exact change:** C14, C15, C16

## Ownership, invariants and states

<!-- prettier-ignore -->
| Fact or state | Authority | Invariant / consequence for R02 |
| --- | --- | --- |
| Authentication, principal and represented subject | Existing identity/Party and authorization owners, Phases 4/9/12 | A valid session proves login, not access to all content or another person's account. Caller fields cannot choose authority. |
| Current supporter purpose, history and sensitive exposure | Existing relationship/projection/safety owners, Phases 3/9/10/12 and the accepted Phase 22 seam | Inclusion is proved for this reader and purpose. Donation/follow/household/source selection is not a grant. |
| Canonical Update, revision and audience release | Phase 22 | One canonical identity; separate source-selected audience heads. Immutable released evidence is not overwritten by a portal edit or blended into a richer version. |
| Ordering, selected projection and continuation | Phase 22 D11 | The same owner supplies a stable admitted reading window. The public released-time/opaque-ID comparator is not automatically the supporter comparator. No Phase 25 cursor/order authority is created. |
| Safe media and previews | Phase 22 plus its media/safety dependencies | Text admission alone cannot admit raw originals, optimizer URLs, filenames or share metadata. |
| Reactions/comments, if available | Existing Response Profile/Engagement Space owner | Reading and responding are separate operations. Actor attribution, current response rights and durable effect identity are checked at the authoritative command. |
| Host, brand, Site entry and locale context | Phase 24 with source content locale rules | One verified donor account host/brand across Sites; no Site re-skin of account truth or arbitrary credential fallback. |
| Filter, loaded items, current position | Transient presentation state | These are not grants, consent, a publishing record or a read ledger. A context change invalidates obsolete presentation state. |
| Giving, receipts, statements, consent and support health | Existing Phases 7/13/16/18/19/3/6/17 | R02 changes none of these facts. No money aggregation, new accounting precision or financial command is involved. |

The presentation needs only ordinary states, not a persistent workflow engine:

<!-- prettier-ignore -->
| Current situation | Valid behavior | Forbidden shortcut |
| --- | --- | --- |
| First entry / context changed | Establish current scope, show bounded loading, then admitted results or a typed outcome | Flash the previous subject's cards while authorizing |
| Ready, more available | Keep current items; load the next owner-qualified batch on request | Fetch the whole archive or infer completion from list length |
| Filter changed | Start a new query/window; visible selection; reject old responses | Apply local filtering to one loaded batch, reuse the old cursor, silently change follow/consent |
| Older-items request failed | Keep only still-admitted earlier items; local retry | Turn failure into empty/exhausted or duplicate appended items |
| New eligible publication | Keep a stable reading window; deliberate refresh | Insert above the current position automatically or invent unread debt |
| Correction, withdrawal, access narrowing | Apply the source-defined current outcome at its admission boundary; discard content when the client learns it is no longer admitted | Prefer position restoration over known safety, or claim already delivered bytes can be recalled |
| Lost response to an existing response command | Source outcome/readback and durable idempotency govern retries | Treat a demo response as persistence or blindly create the business effect again |
| Proven exhaustion | Neutral end of currently available results | “You have read everything” without a separately authorized and proved read mechanism |

The list is not promised to discover a remote revocation continuously without a request or source signal. Every new governed request and positive cache reuse must satisfy the owner's current admission boundary. Once a narrowing is known, the client may not knowingly restore forbidden content. A response admitted before a committed revocation may already be in flight; that is distinct from incorrectly admitting a later request. The two-connection proof must identify that boundary explicitly.

## Patterns accepted and rejected

<!-- prettier-ignore -->
| Pattern | Classification before reuse | Reason |
| --- | --- | --- |
| Source-owned business truth, current authorization and separate product surfaces | **Durable pattern** | Explicit governing architecture prevents shadow truth and cross-surface disclosure. |
| Shared Maia/Base UI components and semantic tokens | **Durable pattern** | Intentional common product language; compose and test the installed wrappers instead of creating a parallel theme. |
| Shared donor hook, batched enrichment, safe-next helper and logout cache clearing | **Useful precedent** | Reuse structure and positive controls, but complete audience/context/callback behavior must still be proved. |
| Legacy raw post reader and mutable post storage | **Temporary bridge** | They show where current consumers connect, but do not implement the target release and current-admission contracts. |
| Fabricated share URL, demo-success comment, discarded continuation and false caught-up message | **Implementation accident** | These cannot be defended as durable product decisions merely because the UI contains them. |
| Tenant-wide protected reads, public protected-media fallback, filter-as-permission, engagement ranking as ministry importance | **Conflict with first principles** | They disclose or invent meaning outside the owning domain and make a simple page harder to trust. |
| Social source filters, stable reading position and explicit chronology choices | **Useful precedent** | Transfer interaction lessons; do not transfer social audience, ranking, retention or notification assumptions. |

## Research from comparable products

Primary documentation was read on 6–7 September 2026. Publication dates are shown when available. This is documentation evidence, not current account-specific UI testing. No claim is made that a documented pattern caused donor retention or that it is universally optimal.

<!-- prettier-ignore -->
| Source | What is useful for this decision | What not to import |
| --- | --- | --- |
| [Patreon: finding creator posts](https://support.patreon.com/hc/en-us/articles/360039998431-How-to-find-a-creator-s-posts-and-Quips), updated July 2026; [member network](https://support.patreon.com/hc/en-us/articles/45256719857293-How-Patreon-s-network-works-for-members), updated August 2026 | Combined membership reading with direct creator-focused access supports immediate reading plus optional focus. | Paid membership identity and discovery recommendations do not decide Asym audience. |
| [Feedly: getting started](https://docs.feedly.com/article/523-getting-started-with-feedly); [sorting](https://docs.feedly.com/article/260-how-can-i-sort-by-popularity), 2025 documentation | Multiple sources can share a reading place; explicit chronological and popularity modes are different products. | AI ranking, team-feed infrastructure or an unlabeled selected digest. |
| **P05** [Mastodon preferences](https://docs.joinmastodon.org/user/preferences/), updated July 2026 | Slow Mode lets the reader choose when newly arrived items enter the timeline. Its accessibility settings reinforce restraint. | Extra columns, extensive preferences and language-detection filtering are not needed for A. |
| **P06** [Reddit custom feeds](https://support.reddithelp.com/hc/en-us/articles/360043043412-What-is-a-custom-feed-and-how-do-I-make-one), October 2025; [recommendations](https://support.reddithelp.com/hc/en-us/articles/23511859482388-Reddit-s-Approach-to-Content-Recommendations), April 2026; [muting](https://support.reddithelp.com/hc/en-us/articles/9810475384084-What-is-community-muting) | Source aggregation and recency are understandable choices. | Recommendation scoring and coupling display muting with notification state would conflict with Asym's independent owners. |
| **P07** [Instagram/Meta feed choices](https://about.fb.com/news/2024/11/introducing-recommendations-reset-instagram/), November 2024 | Following is documented as a recent-first alternative to recommendations. | Favorites also influence ranking. Do not infer current limits, persistence or account-specific UI from this dated explanation. |
| **P08** [Bluesky welcome](https://bsky.social/about/blog/09-04-2024-welcome), September 2024; [later product assessment](https://bsky.social/about/blog/09-19-2025-building-healthier-social-media), September 2025 | Following and optional feeds show the value of deliberate focus; the later assessment acknowledges limitations. | No custom-algorithm marketplace, engagement optimization or hidden fairness quotas for ministry visibility. |
| **P09** [W3C Feed Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/) and [example caveats](https://www.w3.org/WAI/ARIA/apg/patterns/feed/examples/feed/) | Dynamic infinite feeds carry keyboard/focus/loading duties; the example requires actual accessibility testing. Ordinary semantic articles plus explicit continuation are a proportionate choice here. | The product word “feed” does not require an ARIA feed role or automatic endless loading. |
| **P10** [USWDS pagination](https://designsystem.digital.gov/components/pagination/) | Reachable controls and understandable position matter for article/history collections. | This does not mandate Load more or prove all infinite scrolling is wrong. The selected control is an Asym judgment. |
| **P11** [shadcn theming](https://ui.shadcn.com/docs/theming) and [Base UI Dialog](https://base-ui.com/react/components/dialog) | Semantic theme variables and correct focus/composition support the inherited design system. | Current upstream Base UI documentation showed 1.8.0; the inspected repo pins 1.5.0. Do not copy newer APIs or silently upgrade. |

The earlier R01 review also evaluated official donor/subscription journeys from Planning Center/Church Center, Pushpay, Fundraise Up, Givebutter and comparable account products. Those support easy self-service navigation, not an automatic inference about private ministry audiences. This review concentrates new research on the reading/filtering decision. Current Facebook help could not be reliably read because it redirected to a login/block response; no claim relies on it.

## Source register and authority checkpoints

Runtime source was inspected at `develop` **7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd**, rechecked unchanged during this review. The Phase 22 snapshot is **70c50e8c97556c43be5543332fb0993b468b90ab**; Phase 24 is **ab1a1703a725be454376990a7fe68aef2e048026**. These are source facts, not runtime certification.

<!-- prettier-ignore -->
| ID | Immutable source / relevant lines | Evidence classification |
| --- | --- | --- |
| S00 | [ADR-0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), [ownership matrix](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-01-source-of-truth-ownership-matrix.md), CONTEXT/OpenSpec and prior-phase record | Governing ownership; earlier research follows predecessor decisions through Phase 24. |
| S01 | [posts/index.ts](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/posts/index.ts#L19), cache19–45, reader50–72, route85–137 | Observed source: service-role tenant/status query, creation-time/offset order, batched interaction enrichment and positive draft guard. |
| S02 | [initial schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20250101000000_init_schema.sql#L119); [June RLS/Realtime migration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260625002117_canonical_tanstack_db_realtime_rls.sql#L83); [atomic RPC migration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/supabase/migrations/20260223170000_atomic_rpc_and_donation_saga.sql#L78) | Schema/grants/policies/functions inspected; not an assertion that every migration or fixture is live. Raw interaction policy131–150; Realtime280–299; mutable post update480–489/delete535–539; RPC grants1359–1375. |
| S03 | [auth context](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/auth/context.ts#L281), [permissions](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/auth/permissions.ts#L84), [client session](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/auth/client-session.ts#L64), [callback](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/auth/callback.ts#L17) | Source and one synthetic actual-helper evaluation. Empty memberships with compatibility donor profile returned donorAllowed=true; no authenticated hosted account test. Safe-next sanitization and cache clearing are positive controls; callback still prefers role home. |
| S04 | [feed page client](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/feed/page-client.tsx#L395) | Source: client type/Saved filtering395–430; fake sharing112–129; image315–328; caught-up518–526. |
| S05 | [donor feed hook](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/database/hooks/donor-feed-posts.ts#L49) | Source: transport49–77, cache90–103, media161–165. Continuation is not preserved; scope/AbortSignal proof is missing. |
| S06 | [donor Next configuration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/next.config.ts#L65) | Broad image origins and 30-day minimum image cache TTL are source observations; no protected live image leak was tested. |
| S07 | [reaction utilities](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/posts/reaction-route-utils.ts#L39), [reaction handlers](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/posts/reaction-route-handlers.ts#L49) | Cookie-client preflight differs from privileged reader; service-role RPC checks do not establish exact release/response authority. |
| S08 | [comments route](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/posts/comments.ts#L38) | POST returns demo-success without persistence. This corrects any earlier interpretation of the UI's “transport-backed persistence” comment. |
| S09 | [DonorSubNav](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/features/donor/components/DonorSubNav.tsx#L18), [UI configuration](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/ui/components.json), [UI instructions](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/ui/AGENTS.md) | Exact shared theme/base contract; mobile labels hidden at68. Source review, not browser/a11y certification. |
| S10 | [Phase22 ADR-0128](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/adr/0128-canonical-ministry-update-audience-release-projections.md), [D11 decision log1776–1916](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#L1776), [OpenSpec505–580](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/openspec/changes/add-public-ministry-pages/specs/public-ministry-pages/spec.md#L505), [PRD495–518](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/prds/sitestacker-parity/phase-22-public-ministry-pages.md#L495) | Active founder-ratified planning, still open PR. Current membership/history1830–1839; races1874–1886; ordering owner1895–1897. Public D12 and supporter D11 are distinct. |
| S11 | [posts schema](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/packages/api/src/schemas/posts.ts#L9) | Observed numeric legacy bounds, not target performance evidence. |
| S12 | [Phase24 ADR-0185](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/adr/0185-tenant-owned-donor-portal-host.md), [host/context PRD347–371](https://github.com/Asymmetric-al/core/blob/ab1a1703a725be454376990a7fe68aef2e048026/docs/prds/sitestacker-parity/phase-24-multi-site-management.md#L347) | Active planning; one verified account host and stable brand. Not host activation proof. |
| S13 | [hook tests](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/unit/packages/database/donor-feed-posts.test.ts#L193), [performance tests](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/tests/e2e/performance.spec.ts) | Mapping/transport mocks and public/login performance checks are insufficient for the R02 owner/browser contract. No target runtime tests were run. |

Repository instruction/skill review included grill-with-docs, the governing repo and domain instructions, frontend/testing rules, exact UI configuration and accessibility guidance. Installed Next data-security/cache documentation was checked for current authorization and key semantics. Source excerpts were read from immutable Git snapshots; no source edit was needed.

### GitHub dependencies and status meaning

- [PR465](https://github.com/Asymmetric-al/core/pull/465), branch `docs/sitestacker-parity-phase-0`, head `9a44396d6c6b57f12ebb7144ed9c99f0fa73d85a`, merged 15 July; [PR872](https://github.com/Asymmetric-al/core/pull/872), branch `codex/docs-sitestacker-phase-17`, head `b886c2eb2fe4c98cc8723a232d860138c86b10c2`, merged 27 July. They are historical/merged contracts, not blanket implementation evidence.
- [PR1323](https://github.com/Asymmetric-al/core/pull/1323), `codex/phase-22-public-ministry-pages-grill`, head `70c50e8c97556c43be5543332fb0993b468b90ab`, **open**; [PR1340](https://github.com/Asymmetric-al/core/pull/1340), `codex/phase-23-web-studio-cms-spec`, head `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`, **open**, parent [1339](https://github.com/Asymmetric-al/core/issues/1339); [PR1558](https://github.com/Asymmetric-al/core/pull/1558), `codex/phase-24-multi-site-management-spec`, head `ab1a1703a725be454376990a7fe68aef2e048026`, **open draft**, parent [1431](https://github.com/Asymmetric-al/core/issues/1431). Phase22→23→24 reconciliation remains relevant. API non-draft status of1340 disagrees with its stale draft wording. Phase24 D1–D18/D57–D84 govern; D19–D55 are cross-phase evidence, not launch gates.
- Bodies of [1302](https://github.com/Asymmetric-al/core/issues/1302) media, [1303](https://github.com/Asymmetric-al/core/issues/1303) public Update, [1304](https://github.com/Asymmetric-al/core/issues/1304) supporter Update, [1310](https://github.com/Asymmetric-al/core/issues/1310) public permalink, [1481](https://github.com/Asymmetric-al/core/issues/1481) host preparation, [1443](https://github.com/Asymmetric-al/core/issues/1443) specialized routes and [1548](https://github.com/Asymmetric-al/core/issues/1548) cache coherence were inspected; all were **open**. Issue1481 explicitly prepares a host, not activates it. The public permalink ticket does not own a protected-reader grant.
- Phase16 [811](https://github.com/Asymmetric-al/core/issues/811)–[813](https://github.com/Asymmetric-al/core/issues/813) and Phase19 [1017](https://github.com/Asymmetric-al/core/issues/1017)/[1023](https://github.com/Asymmetric-al/core/issues/1023) remain tracked in the Phase25 notebook. A reading-filter decision does not replace their recurring or document responsibilities.

States were checked during the 6–7 September research window; develop and the high-impact1323/1558 heads were refreshed in this review. The other historical checkpoints come from the immediately preceding research, not a new assertion that every issue/PR was polled at document creation. Recheck volatile heads and actual blockers at authorized implementation/publication. An open issue is not proof that no related code exists; no duplicate tickets are proposed here.

## Tests actually performed and their limits

**E01: 11 assertions passed in an isolated synthetic PostgreSQL17.10 experiment.** It used a new network-disabled container, temporary synthetic tables/roles, no ports and no Core/env/provider data. The exact created container was verified and removed. This tested assumptions about paging, filter placement and database privilege semantics. It did **not** load Core migrations, reproduce hosted exposure, test actual source concurrency or certify the target reader.

<!-- prettier-ignore -->
| Check | Observed result | What it establishes |
| --- | --- | --- |
| New publication between offset pages | 1 repeated item | A concrete counterexample to extending the offset reader unchanged. |
| Same fixture with stable key boundary | 0 repeated items | Stable owner continuation can avoid that counterexample; this is not proof for every source transition. |
| Target ministry filtered from loaded slice | 0 results | A first-page local filter can lie about available history. |
| Target ministry filtered at source before limit | 1 result | Filtering before paging finds the otherwise hidden fixture. |
| Visibility narrowed before a fresh authorized query | Only IDs2,1 remained | Current filtering removes the withdrawn fixture; this does not prove cache or concurrent admission. |
| Restricted role reads across tenant scope | 0 foreign-tenant rows | Fixture RLS applied to the invoker. |
| Same role through an owner view | 1 foreign-tenant row | View owner semantics can defeat assumed caller row scope. |
| Same role through an invoker view | 0 foreign-tenant rows | Invoker semantics preserve the fixture's caller RLS. |
| Owner/bypass direct read | 1 foreign-tenant row | RLS cannot be assumed to constrain bypass execution. |
| Forbidden-row UPDATE | 0 changed rows | Fixture USING restricts eligible existing rows. |
| Allowed-row UPDATE to forbidden tenant | Rejected by WITH CHECK | Mutation outcome needs a destination-state guard as well as old-row eligibility. |

Primary technical support: **P01** [PostgreSQL17 LIMIT/OFFSET](https://www.postgresql.org/docs/17/queries-limit.html), **P02** [row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html), **P03** [view security semantics](https://www.postgresql.org/docs/17/sql-createview.html). The [experiment evidence](phase25-r02-postgres-evidence.md) and [exact synthetic SQL](phase25-r02-postgres-assumptions.sql) are saved separately with explicit limitations.

The actual permission helper was also evaluated with a synthetic donor profile and no memberships, returning donorAllowed=true. That confirms that helper's compatibility behavior; it does not prove that every application route admits such a person or that a real account is affected.

**Not performed:** hosted SQL inspection; real donor account/provider mutations; full Core RLS/concurrency harness; protected-media delivery test; browser/a11y test; donor interview/usability study; performance/load test; production verification. No unrun test is described as passed. An implementation-ready decision qualification is different from implemented, tested release readiness.

## Falsifiable proof required for the later implementation

This is the evidence the recorded decision will require, not a claim that it exists. Use the real owning service and schema with source-approved fixtures; mocks can supplement transport/error tests but cannot close authority or concurrency gates.

<!-- prettier-ignore -->
| ID | Outcome and adverse cases | Pass criterion and owner linkage |
| --- | --- | --- |
| T01 — Complete access matrix | Same/different tenant/environment; same-tenant different donors; represented subject; purpose; current/revoked/later-added supporter; history restrictions; safety narrowing; public-only versus supporter release | Zero unauthorized row/field/option/media/detail/count responses across list, cache, detail, joins, raw Data API, views, RPCs and Realtime. Direct channel tests must use real database roles/grants. Phase3/9/10/12/22; C01,C07–C10. |
| T02 — Filter truth and isolation | Zero/one/many eligible sources; target source absent from first batch; long/renamed/restricted source; valid empty selection; forged/stale/hidden source; filter change during fetch | Every admitted matching item is reachable through the source-filtered result; no option/name/count oracle; no silent broadening. Before/after authoritative follow, consent, giving and audience facts are unchanged. C03,C04. |
| T03 — Stable complete continuation | More than three selected batch sizes; equal ordering values; duplicate placements; repeated/parallel Load more; inserted/corrected/withdrawn source; expired/tampered/cross-filter/cross-subject cursor | For a stable owner-defined window, each admitted logical entry appears once with no omission and exact source order. Adverse changes produce the owner's explicit outcome; no false exhaustion or endless continuation. Comparator, cursor authenticity and expiry belong to Phase22. C02,C05. |
| T04 — Actual concurrency and stale response proof | Two real DB connections coordinate release/narrowing/mutation boundaries; browser/network latches hold old responses through subject/tenant/purpose/locale/filter switches; cache-hit revocation; Back/bfcache/reload | Document the owning admission boundary. Requests admitted after committed narrowing cannot return forbidden positives. Zero obsolete-context renders after a completed switch. Cancellation failure is included. Already admitted bytes are not called recalled. C04,C06,C07,C10. |
| T05 — Exact content and media | Public/supporter variants, current revision, corrections, attachments/thumbnail/original, optimizer copy, anonymous preview, unauthorized copied URL, malicious markup/link, source locale mismatch | Only the admitted source projection and its certified media are served. No public/cache fallback or hidden metadata. Test actual media/provider boundary in authorized test scope where required. Phase22 media owner; C02,C09,C11. |
| T06 — Truthful states and retry | Initial load, empty, no filter matches, unavailable selection, partial projection,429/timeout/5xx, invalid envelope, media failure, lost older-page response and owner outage | Distinct accessible outcomes; no fake empty/success/all-clear. Retry is bounded and preserves only currently admitted earlier content; no duplicate append. Incomplete results require owner evidence and honest labeling. C05,C12,C13. |
| T07 — Shared-link journey | Generic org Updates link opened signed in/out, expired session, recovery, malicious external next, wrong/unverified host, long localized destination and public/protected card link | Correct verified account host, own permitted list, retained safe destination through auth, no sender-specific grant or private preview. Existing public share scope remains separate. Phases4/22/24; C11. |
| T08 — Accessible reading and comprehension | Keyboard and screen reader on actual supported mobile/desktop combinations; 320 CSS-pixel reflow and text zoom; long international/RTL labels; touch targets, contrast, reduced motion, weak network, open/back, filter and Load more | No horizontal loss of required content; visible names/current scope; no focus trap or viewport jump above reader; operable retry/continuation and clear result announcement. Existing WCAG2.2/core rules must pass. Representative donors complete read, find-one-ministry and return tasks without coaching; observed failures are corrected/retested, not averaged away. No retention inference from this small qualification. C04–C06,C12. |
| T09 — Existing response commands | Protected/public reader, responses disabled, current response profile, withdrawal after precheck, duplicate submission, lost success response and reload | Server-derived actor/owner attribution; mutation-time authority; one durable effect; persisted state agrees after reload/readback. A no-op/demo response cannot pass. No new engagement capability is required by R02. C10. |
| T10 — Schema and adoption | Trusted non-null scope; same-scope FK/uniqueness/check/delete constraints; current view/RPC/storage grants; mixed versions; historical owner mappings/backfills; old links/consumers; cohort activation and containment | Invalid cross-scope/forbidden-state writes fail at owner DB/command boundary. Backfill is repeatable, preserves source identity/history and grants nothing by inference. All affected legacy channels have an owner-approved disposition; rollback cannot resurrect unsafe data paths. C08,C15. |
| T11 — Measured capacity | Selected numeric maximum batch/options/cursor/media limits, representative maximum source/history cardinality and concurrent tenants; cold/warm caches; slow source/media dependencies | Before activation record real numeric configuration, fixture sizes and existing relevant service/browser budgets; prove the target meets them, has bounded database/work/bytes and no per-ministry browser fan-out. Public-login tests do not satisfy this. Do not create a new registry/framework solely for this gate. C05,C14. |
| T12 — Evidence and diagnostics | Trace one failed read, denied media and successful existing response through allowed diagnostics; inspect logs/URLs/referrers for sensitive content; map every C clause | Staff can identify the owning cause using restricted evidence without private bodies/names/credential URLs or inferred reading records. R02→C→existing owner requirement→later authorized OpenSpec/design/ticket→test→release result is complete. Any actual ownership amendment is explicit; no new ADR or term just for layout. C14–C16. |

Unknown numeric batch/option/work limits and actual provider/media behavior are implementation qualification gates. They are **not deferred product decisions** and are not placed into a vague “monitor” bucket. Choose values within existing owner budgets, test their exact boundaries and document the result before activation. There is no evidence for inventing a new fixed donor count, notification interval, cancellation limit or performance percentile in this reading decision.

## Ruthless synthesis — the permanent path and its order

**1. Record the founder choice now, with the exact meaning above.** R02 is selected. C01–C16 are scope-preserving requirements needed to execute it faithfully. Record that combined never means tenant-wide, filtering has no side effects and the content owner retains source truth. Correct the earlier comment-persistence interpretation. Nothing here requires another founder answer before this choice can be recorded.

**2. Resolve owner readiness before implementation is claimed ready.** Reconcile the exact Phase22 supporter projection/order/media/response contracts and Phase24 host/callback dependencies with the open bodies. The owner must supply any missing supporter comparator, continuation, disclosable options and typed outcomes. Phase25 must not invent those locally. This is required implementation work within existing ownership, not permission to bypass unavailable dependencies. Follow authorized source/ticket workflows later; publish nothing during grooming.

**3. Capture one coherent journey in the later authorized specification/design.** Carry the entry, view-only filter, protected options, complete explicit continuation, stable reading position, normal direct link and distinct loading/error/empty/end states. Preserve exact Maia and existing account navigation. Keep responsive placement, batch size and transport flexible until actual composition and capacity proof. Do not add rankings, saved-feed management, follow/consent controls or a second publishing surface under this decision.

**4. Require owner and data protections before relying on the screen.** Use the one current source-qualified read boundary. Prove same-scope relationships, current access, cache/generation behavior, safe content/media and reachable raw channels. Correct the affected legacy reader/grants/response paths through their owners. Positive controls already present should be retained where valid. This prevents a polished screen masking an unsafe service.

**5. Qualify the actual user journey and adoption together.** Run T01–T12 against the target schema/services and authenticated browser. Include related home preview, callback, old links, protected media and existing response controls. Close every observed critical task failure; record exact performance limits/workload. Activate only the complete owner-qualified cohort, with safe containment and source-preserving roll-forward. Do not roll back to a known unsafe reader after new source facts exist.

**6. Monitor only defined invariants after proof.** Monitoring cannot substitute for missing access, paging or usability evidence. Reuse existing operational channels, with domain responsibility assigned to the current service/on-call owner. No new monitoring platform or individualized reading analytics is required.

<!-- prettier-ignore -->
| Signal | Threshold | Responsible owner | Required response |
| --- | --- | --- | --- |
| Confirmed unauthorized content, option, metadata or media egress; cross-scope/generation mixture | **1 confirmed occurrence** | Phase22 reader owner with Phase10/12 security owner; Phase24 host owner when host-related | Immediately contain the smallest affected path/cohort/generation, preserve restricted evidence, repair and requalify. Never use a broader legacy fallback. |
| Old-context positive content rendered after a completed context switch | **1 confirmed occurrence** | Donor Portal client owner with Phase22 reader owner | Contain the affected switch/reader path and repair generation isolation before reactivation. Expected discarded late responses are not incidents. |
| Duplicate or missing eligible identity in a verified stable owner reading window, or claimed exhaustion with reachable eligible entries | **1 confirmed invariant violation** | Phase22 ordering/continuation owner | Disable incorrect continuation/end assertion, diagnose window/cursor semantics and requalify T03/T04; preserve safe reading where the owner can prove it. Legitimate withdrawal is not counted as omission. |
| Malformed successful envelope or contradictory completeness state accepted by a deployed reader | **1 occurrence** | Phase22 service owner and Donor Portal adapter owner | Return typed failure, stop the unproved all-clear, investigate compatibility and repair. Preserve only current authorized content; retry within existing bounds. |
| Raw private content/labels or credential-bearing URLs found in diagnostics | **1 confirmed occurrence** | Security/privacy owner with logging producer | Stop the offending field emission, restrict the affected evidence and apply the established data-handling process; repair and recheck T12. |

Service latency and usage dashboards remain under existing measured service objectives. This record does not invent new thresholds or declare unspecified ones adequate. If the owner has no applicable numeric budget, T11 must establish one before activation; that absence cannot be hidden behind “monitor after launch.”

## Final disposition and completeness boundary

**Accept with required amendments.** Keep immediate combined reading with optional ministry filtering. The corrections preserve the founder's intent while addressing actual legacy mismatches and foreseeable boundary failures. Every requested category has an explicit result; each concern has evidence, severity, likelihood, answer effect, prevention and exact clause references. The decision can now be recorded without another layout question.

The review did not establish a complete implemented donor portal, current provider readiness, real Core RLS/concurrency success or donor usability. Those are explicit acceptance gates, not claimed accomplishments. The wider Phase25 grooming remains open for its remaining journeys. No PRD, OpenSpec change, implementation issue, code change or live-provider modification was produced.
