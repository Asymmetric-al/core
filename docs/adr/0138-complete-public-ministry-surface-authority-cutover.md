# ADR-0138: Complete Public Ministry Surface Authority Cutover

**Status:** Accepted (founder ruling, Phase 22 D21, 2026-08-14)

## Context

Phase 22 may prepare existing missionary and project Pages incrementally, but a
public Site cannot safely mix mock/static routes, raw Payload publication, new D2
releases, old Giving bindings, and independently stale directory, media, search,
or cache behavior. The existing `/workers` experience remains mock-backed, the
two Payload Page collections use generic blocks and soft source references, and
several public readers and serializers can disagree. A page-by-page public
feature flag or long-lived legacy fallback would therefore create two public
authorities and could expose a restricted worker or misdirect a gift.

## Decision

Adopt the complete Phase 22 D21 C-prime-R ruling:

> **C-prime-amended-and-hardened (C-prime-R) — one privately prepared,
> complete-surface Public Ministry authority adoption for each exact Tenant ×
> Legal Entity × environment × Site × verified-host set × locale, composed from
> one immutable-scope Public Ministry Surface Adoption Case, one prospective
> immutable Adoption Plan Version, one content-addressed complete Adoption
> Coverage Manifest, and one short idempotent CAS-guarded Surface Authority
> Cutover. Page preparation may proceed incrementally in private, additive,
> chunked, resumable, non-authoritative staging, but public authority changes once
> for the complete scoped surface; “complete” means every discovered item has
> exactly one proved disposition, not that every old page must become public.**
>
> **The manifest exhaustively covers every legacy, mock, static, generic, or
> copied route and alias; Page, draft, autosave, and version; template, block,
> global dependency, and former profile editor; subject, identity, Designation,
> fund, campaign, locale, source-code, and CTA hint; Ministry Update; media
> original, derivative, URL, metadata, and source filename; preview; directory,
> search, sitemap, canonical, robots, and social presentation; cache namespace
> and variant; Giving handoff; API, reader, fixture, test, and import path. Every
> item receives exactly one source-family-valid, non-overlapping disposition: a
> certified typed D2 release; a frozen, read-only, version-pinned compatible-
> legacy D2 release served only through the new gateway; an exact D8 successor,
> transition, redirect, tombstone, or terminal disposition; private reference-
> only preservation and export; quarantine or Not public; or proved retirement.
> No mock or synthetic fact becomes tenant truth, no missing fact becomes safe or
> zero, and no name, title, URL, `fundId`, profile row, free CTA, or visual
> similarity may infer identity, Designation, publication, progress, media,
> Update, or Giving authority.**
>
> **Compatible-legacy presentation is permitted only where D20 already allows
> it, as an immutable certified D2 release inside the same new reader. It may
> preserve safe editorial presentation but cannot infer or own managed identity,
> restricted-worker reach, Designation, Giving, progress, media, Updates, routes,
> search, or measurement. It is never continued raw Payload publication, a
> generic fallback reader, or a second editing system. Later improvement of that
> Page uses ordinary D1–D20 release and succession commands without another
> migration mode.**
>
> **Exact candidates may be machine-prepared, but staff review only genuine
> exceptions and the complete visitor consequences. The production-shaped D10
> shadow proves every included and excluded route, current/new presentation,
> subject, Giving destination, progress posture, Ministry Updates, media,
> directory/search membership, metadata, sitemap, social presentation, redirect
> or terminal response, locale, cache variant, and restricted-worker outcome
> without public side effects. The selected candidate versions remain immutable;
> newer missionary drafts remain safely saved and visibly outside the prepared
> release rather than being lost or silently substituted.**
>
> **The final cutover re-proves inside one short transaction the current actor
> and Phase 12 authority; complete scope and verified hosts; plan, manifest,
> source census, and content digests; Phase 10 safety and D2 reach; D3/D20 catalog
> and renderer generations; D7 Giving binding; D8 route dispositions; D9 media;
> D11 Updates; D13 discovery; D14 search/share; D17 subjects and Phase 9/D19
> participant associations; locale, code, schema, environment, revocation, current heads,
> and in-flight changes. It records the immutable receipt and transactional D18
> convergence cause and advances the one-time pre-/post-Phase-22 serving
> boundary through compare-and-swap. D21 owns only adoption coverage and cutover
> evidence; it creates no second Page release, route, safety, subject, Giving,
> progress, media, Update, discovery, search/share, measurement, or cache
> authority.**
>
> **The database authority transition is atomic; distributed cache, sitemap,
> media, search, social, and external crawler convergence is not. Immediately
> after cutover, the Phase 5/D18 gateway is the sole reader for that exact
> surface, and D18’s request-time current-admission gate prevents superseded
> positive bytes from regaining authority while idempotent, tenant-fair,
> residual-only convergence proceeds. Failure before the CAS has no public
> effect. Failure after the CAS leaves the new authority truthful and opens only
> the remaining convergence work; it never falls back to mock data, raw Payload
> publication, an old cache namespace, or the legacy reader.**
>
> **Recovery may use only “Restore a previous safe version”: a previously
> certified, generation-compatible D2 release re-proved against current Phase
> 10, route, subject, Designation, media, and code safety. If no currently safe
> release exists, the affected scope becomes privacy-safe absent, redirected,
> transitioned, or neutrally unavailable under its owning policy. A Vercel
> deployment rollback is never content-authority rollback.**
>
> **Tenant staff receive one quiet, accessible, exception-first “Prepare public
> pages” experience scoped visibly to the exact website and language, with only
> “Ready to use,” “Needs a decision,” and “Will not be public”; automatic
> preparation of healthy items; cause-owned plain-language actions; an exact
> responsive current/prepared preview and semantic change list; one complete
> consequence review; and one literal “Start using these prepared pages” action.
> There is no repeated page-by-page certification, technical migration
> vocabulary, ambiguous Publish All, high-risk bulk approval, typed confirmation
> phrase, force-live path, or second D4/D5 editorial approval.**
>
> **Missionaries continue using their ordinary Public Pages dashboard and may
> keep editing while preparation occurs. They see only calm, truthful states such
> as Preparing for launch, Ready for launch, In review, Live, or Changes
> requested, plus notice when a newer draft is not part of the prepared site.
> They never choose operational subjects, Designations, redirects, safety
> classifications, or cutover scope. Donors see no migration interface or mixed
> authority: each request resolves wholly through the old coherent surface
> before cutover or the new coherent surface afterward, and Phase 5/13
> revalidates any existing cart or copied Giving action without silently changing
> its Designation.**
>
> **There is no tenant-global enable bit, page-by-page public authority toggle,
> mixed reader, dual read or write, fuzzy adoption, mutable readiness truth,
> silent exclusion, inferred redirect, blanket homepage or organization-fund
> redirect, unrestricted compatibility renderer, traffic-split content canary,
> giant transaction, browser service key, blind retry, destructive rollback,
> legacy restoration, or claim that prepared, mapped, approved, released,
> reachable, served, cached, converged, crawled, indexed, share-cached,
> gift-ready, donated, or externally forgotten are the same fact.**

The historical labels inside that ratified quote are interpreted only through
the canonical status planes below. **Will not be public** is not a Page state,
and the quoted launch wording is passive communication rather than a new D5 or
D18 status vocabulary.

The immutable adoption cohort is one Tenant × Legal Entity × environment × Site
× verified-host set × locale. Incremental work is private preparation only. Every
source and effect receives one non-overlapping disposition before a single
surface-level authority transition. Once that transition succeeds, the Phase
5/D18 gateway is the sole public reader and later Page work uses ordinary D1–D20
commands. The final transaction compares precomputed census/content roots,
authority epochs, heads, and generation pins; it does not rescan or rewrite the
cohort. The cutover advances one cohort reader-generation boundary, not a second
D2 Page head or tenant-global flag. Until it succeeds, Phase 10, D2 containment,
D8 lifecycle dispositions, and D9 media withdrawal continue to govern the
currently serving surface; preparation never freezes or delays an adverse owner
fact. **Old coherent surface** means every remaining pre-cutover request is still
behind the sole Phase 5/Phase 10/D8 safety choke point and resolves through one
internally consistent authority set, or fails safely unavailable. It is not an
assumption that current legacy records or readers are coherent merely because
they are already in production.

The tuple is the minimum complete discriminator, not permission to divide an
indivisible public artifact. The Adoption Case MUST close over every route map,
directory/search projection, sitemap, canonical or alternate-locale graph,
cache generation, or other controlled artifact affected by the switch. A shared
artifact may cross a cohort boundary only when its owner provides a proved,
generation-pinned, atomically selectable partition for that exact cohort.
Otherwise the dependent cases cannot become **Ready to use** independently and
must participate in one coordinated CAS over the shared authority head. The
verified-host set is itself immutable and digest-pinned for the case.

The tenant-scoped Adoption Coverage Manifest enumerates tenant records, routes,
artifacts, and source-family dispositions. Code-global readers, serializers,
imports, fixtures, and tests are covered through a content-addressed reference to
the exact code/schema certification generation; they are not copied into every
tenant manifest or admitted as tenant facts. A sealed exact source range may
cover many inert historical drafts or versions only when membership, count,
digest, and one common preservation disposition are proved. Grouping can reduce
rows but can never hide an omission or mixed disposition. Adoption Plan Versions
and Adoption Coverage Manifests are immutable successors. Every preparation or
cutover attempt selects exactly one Plan Version and one Manifest by stable ID
and digest; any correction creates a successor version, never an in-place edit or
a pointer that floats to latest.

### Status planes

D21 adds no missionary Page status. Its staff-only readiness projection and
cutover receipt remain separate from D5 editorial workflow and D18 serving
truth. The wording in the ratified quote is interpreted through this table:

| Plane                       | Canonical visible terms                                                                                                    | Normative meaning                                                                                                                                                                                                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D5 editorial workflow       | **Draft**, **Waiting for review**, **Changes requested**, **Published**                                                    | Ordinary authoring/review labels only. Detailed D4 machine facts may map into these labels. **Published** does not prove current public serving.                                                                                                                                          |
| D18 serving and convergence | **Public**, **Updating**, **Not public**                                                                                   | The only contributor-visible Page or Ministry Update serving states. D21 MUST NOT add **Preparing for launch**, **Ready for launch**, or **Live** as Page states.                                                                                                                         |
| D21 staff readiness         | **Ready to use**, **Needs a decision**, **Not moving as a current ministry page**                                          | A disposable, staff-only preparation projection. It is not D2 reach, D7 Giving readiness, release approval, or a persisted readiness truth. The last group may contain an exact D8 redirect, transition, terminal result, private preservation, or retirement and must state that result. |
| D21 cutover receipt         | **Could not start — current site still in use**, **Started — public copies updating**, **Started — prepared pages in use** | Exact command/convergence consequences, never a durable Page status and never the word **Live**.                                                                                                                                                                                          |

Missionaries may receive one passive banner that their organization is preparing
updated public pages and one exact notice when a newer saved draft is outside the
pinned prepared release. Those messages create no task or status and never
replace the D5 or D18 labels.

### Preview and shadow boundaries

D10 remains an authenticated, currently authorized, exact-Page-and-version
human preview. D21 separately owns a production-shaped, non-authoritative,
side-effect-dark full-surface shadow for route, directory, search, sitemap,
social, cache, and other cohort proof. The shadow may consume the same certified
compiler and renderer contracts, but it is not a D10 preview, D2 release, D18
convergence observation, or public endpoint.

Current/prepared human comparisons use D10 for each exact candidate. They MUST
remain private, actor-authorized, and public-egress-safe: no raw blocked identity,
original media, source filename, EXIF, hidden operational identifier, private
Update, support access, or other value omitted by Phase 10/D9 may appear merely
because it existed on the old surface. Staff without authority see redacted
counts and outcomes that do not disclose a restricted Page's existence.

### Compatible legacy boundary

A **Compatible Legacy Page Release** is an immutable D2 Page Release Manifest
served only by the sole Phase 5/D18 gateway. A one-time certified compatibility
adapter normalizes the proved-safe legacy editorial payload into a
release-frozen, family-qualified public DTO. The manifest pins the exact D20
family catalog, D3 profile, compatibility-renderer, content, locale, brand, and
managed-reference generations plus every other mandatory D2 owner fact. The
gateway never reads a raw or mutable legacy/Payload row at request time.
Unknown, unmappable, wrong-family, or unsafe semantic input cannot receive this
disposition. After that cohort's cutover no new Compatible Legacy Page Release
may be created; the next editorial change creates an ordinary current-catalog
successor while the prior certified release remains immutable history.

| Reader or renderer behavior                                                             | Allowed? | Rule                                                                                                  |
| --------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| Phase 5/D18 gateway reads one current D2 manifest                                       | Yes      | It is the sole post-cutover reader and performs current admission before positive serving.            |
| Release-pinned compatibility renderer consumes the normalized immutable DTO             | Yes      | It is code-certified, same-family, bounded to safe editorial presentation, and owns no managed truth. |
| Request-time read of raw Payload, generic blocks, a mutable legacy row, or a legacy API | No       | That is a second reader and bypasses D2/D20 pins.                                                     |
| Old reader, old cache namespace, mock/static fallback, or deployment fallback           | No       | D18 prohibits fallback or dual public authority.                                                      |
| Legacy editor or a newly created compatible-legacy release after cutover                | No       | Legacy compatibility is release preservation, not a continuing builder or migration mode.             |
| Ordinary D1–D20 typed successor                                                         | Yes      | It is the only change path after cutover.                                                             |

### Role consequences

**Public Ministry Surface Adoption Authority** is a current, exact-scope Phase 12
capability to execute the final cohort CAS. It is distinct from Page Release
Authority and grants no owner-domain mutation.

| Actor                                | May do                                                                            | Must not gain from D21                                                                                                |
| ------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Adoption-authorized staff            | Review complete redacted consequences and execute the one exact-scope cutover     | D4/D5 approval, D7 Designation choice, D8 lifecycle authority, Phase 10 override, D9 approval, or support-data access |
| D4/D5 reviewer                       | Review or decide the exact candidate already within their capability              | Cohort cutover authority merely because they review content                                                           |
| Finance/Designation owner            | Resolve the D7 Giving binding through the D7 command                              | Editorial, subject, route, reach, or cutover authority                                                                |
| Phase 10 or owning safety actor      | Narrow or block current public behavior immediately                               | A requirement to wait for D21 preparation or cutover                                                                  |
| D1 contributor                       | Continue ordinary assigned-Page editing, submission, and exact D10 preview        | Subject, Designation, redirect, reach, safety, cohort, or cutover choice                                              |
| Spouse, teammate, or D19 participant | Only the separately assigned D1/D19 rights of their own principal                 | Inferred Page editing, preview, publication, adoption, or support access                                              |
| Donor or visitor                     | Receive one coherent admitted surface and a final-boundary-reproved Giving action | Migration UI, mixed authority, or silent Designation substitution                                                     |
| Support/operator                     | Inspect permissioned evidence and perform fenced residual operations              | Force live, direct owner-data repair, safety override, or legacy restoration                                          |

An exception action is enabled only for an actor who also holds the owning
capability. Otherwise the row names the responsible function in plain language,
for example **Finance needs to choose the Giving destination**, without granting
that authority through the adoption workspace.

## Consequences

- A tenant may prepare Pages over several sessions and explicitly keep unsafe or
  unresolved Pages non-public without exposing a partially migrated site.
- The staff experience is one exception-first **Prepare public pages** task and
  one complete consequence review, not a general migration console or duplicate
  editorial approval queue.
- Missionaries keep editing in their normal dashboard; a pinned adoption
  candidate is not silently replaced by a newer draft.
- Public requests before and after cutover remain coherent, and existing Giving
  actions re-prove the exact Phase 13 Designation rather than inheriting a new
  destination from routing or migration.
- A bounded compatible-legacy renderer may preserve safe editorial presentation
  only through a frozen D2 release inside the new gateway. It is not a fallback
  reader, managed-truth adapter, or continuing editing authority.
- The database authority transition and D18 delivery cause are atomic locally;
  controlled-surface convergence remains asynchronous and separately observed.
- Google/Bing indexing and social-network refresh remain only D14/D18 external
  observations. A cutover, provider acceptance, cache response, sitemap fetch,
  or elapsed time never proves crawl, indexing, share-cache refresh, recall, or
  removal.
- Recovery never revives mock/static data, raw Payload publication, unsafe media,
  an old cache namespace, or a pre-Phase-22 reader.
- D21's user-facing **Restore a previous safe version** means selecting a
  generation-compatible prior D2 release as a newly current, fully re-proved
  release successor. It never means rewinding D1 editorial history, invoking
  Payload native restore, or bypassing D25's append-only recovery contract.
- Production certification includes a production-shaped cohort of at least
  5,000 Pages to exercise pagination, tenant fairness, resumability, and the
  short final transaction. That number is a minimum test fixture, not a product
  limit, service guarantee, supported-tenant maximum, or substitute for measured
  capacity testing.

## Considered options

### Page-by-page public cutover

Rejected. It would let one directory, route namespace, Site, or visitor session
cross incompatible identity, safety, Giving, search, media, and cache authority.

### One giant synchronous migration

Rejected. It creates long transactions, lock and timeout risk, poor recovery,
and forces staff to complete every exception in one session.

### Incremental private preparation with one complete-surface cutover

Accepted. It gives tenants resumable, low-noise preparation while preserving one
public authority and one coherent visitor experience.

## Later Phase 22 D26 qualification

D21 must classify legacy candidate-attestation coverage honestly. A safe
pre-D26 release with no exact evidence is **not captured**, never fabricated as
attested and never removed solely for that historical absence. The next
editorial, cloned, imported, translated, or reach-widening candidate follows
D26 and receives a fresh actual-actor attestation.

## Later Phase 2/24 verified-host qualification

The ratified `verified-host set` is not a hostname list resolved at cutover. It
means one immutable, enumerated Phase 2/24 host-membership generation and digest
pinned identically by the Adoption Case, selected Plan Version, production-shaped
shadow, and Coverage Manifest. A hostname string, wildcard, request header,
deployment domain, previously verified host, or mutable `all current hosts` query
cannot define or widen the adoption cohort.

The final CAS compares both pinned host-membership coordinates to the current
Phase 2/24 owner head. Adding, removing, transferring, canonicalizing, or
reverifying any host after preparation invalidates that evidence and aborts the
cutover with no public effect; the case must prepare a successor rather than
silently reinterpret the selected manifest.

## Related decisions

- [ADR-0118](./0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md)
- [ADR-0119](./0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md)
- [ADR-0121](./0121-tenant-chosen-public-content-review-and-release-profiles.md)
- [ADR-0122](./0122-simple-public-page-review-with-quiet-phase-10-eligibility.md)
- [ADR-0124](./0124-one-exact-page-giving-binding-for-phase22-mvp.md)
- [ADR-0125](./0125-source-qualified-public-page-route-dispositions.md)
- [ADR-0126](./0126-release-bound-public-ministry-media-assets.md)
- [ADR-0127](./0127-authenticated-exact-version-public-ministry-preview.md)
- [ADR-0130](./0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md)
- [ADR-0131](./0131-release-bound-public-search-and-sharing-presentation.md)
- [ADR-0135](./0135-release-bound-public-ministry-runtime-composition.md)
- [ADR-0136](./0136-organization-owned-ministry-assignments-and-separated-support-access.md)
- [ADR-0137](./0137-two-bounded-page-family-semantic-catalogs.md)
- [ADR-0142](./0142-derived-editorial-actionability-and-bounded-recovery.md)
- [Phase 22 D21 decision](../prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md#d21--how-does-a-tenant-replace-the-legacy-public-ministry-surface-without-exposing-mixed-authority)
- [Phase 22 D21 research](../prds/sitestacker-parity/phase-22-public-ministry-pages-research-evidence.md#44-ratified-d21-research--complete-public-ministry-surface-authority-cutover)
