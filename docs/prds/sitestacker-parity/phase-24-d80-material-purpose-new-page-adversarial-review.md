# Phase 24 D80 — Material-purpose new Page adversarial review

**Decision date:** 2026-08-31

**Founder answer reviewed:** Option 3 — create a new Page identity and route
when staff explicitly declare that an affected Page now serves a different
public subject, substantive purpose, or intended visitor task.

**Repository status:** planning authority only; no runtime, schema, migration,
Supabase policy, Vercel configuration, OpenSpec delta, ticket, deployment, or
production state changed.

## Final disposition

**Accept with required amendments.** A genuinely different public purpose
should become a genuinely different Web resource. This is the strongest
permanent answer for donor expectations, staff comprehension, Page history,
canonical URLs, cached redirects, and Core's existing Phase 23/24 authority
boundaries.

The raw option must be narrowed in five ways:

1. It applies universally after the authorized D79 **changes what this Page is
   for** judgment. Core removes the proposed direct-only in-place exceptions;
   redirect history can prove risk but cannot prove that every external cache,
   bookmark, search result, printed link, or visitor expectation is safe.
2. It creates a fresh **private** Page identity plus an explicitly reviewed D2
   placement/path claim. It does not publish a route, advance the old Page's
   continuity version, or transfer D78 history.
3. It reuses the finite Phase 23 D23 transfer compiler internally, with one
   narrow same-Site policy profile. It does not widen **Copy to another Site**,
   expose generic duplicate, or trust Payload's document clone.
4. The exact candidate must be Page-owned and separable. A shared/global source
   change that would still alter the old Page blocks the handoff and returns to
   that owner's existing **Make a local copy** or equivalent action; D80 does
   not invent a dependency-fork engine.
5. The old Page's public state remains unchanged. ADR-0202/D81 preserves the
   exact private candidate as a protected source checkpoint and atomically
   appends clean source successors from the exact D1 public pins while creating
   the target; it never leaves an ordinary publishable duplicate or destroys
   history.
6. ADR-0203/D82 permits only the exact sealed source **Draft-only Path Claim**
   to be atomically superseded by a fresh target claimant-ownership occurrence/
   version in that same
   transaction. This is not route identity transfer: complete positive D2
   history, one canonical compiler, current source ownership, fresh target
   identity, one database winner, and private-History retention are required.

No current standard literally prescribes this exact CMS workflow. The result is
a bounded Core product judgment supported by W3C resource/URI consistency, HTTP
permanent-redirect semantics, current Google corresponding-URL guidance,
mainstream independent-draft behavior, and the repository's accepted D78/D79
meaning promise. That distinction is important: the evidence supports the
boundary, while Core owns the exact command, receipt, and UX.

## Exact corrected decision to record

> When an authorized publisher selects **This update changes what this Page is
> for** in D79's existing D1 consequence review, Core SHALL NOT publish that
> candidate through the existing Page identity or any current/historical route
> associated with it. Core SHALL offer one contextual **Move saved changes to new Page draft**
> continuation. The rule applies to every explicit material change of public
> subject, substantive purpose, or intended visitor task; there is no direct-
> only in-place exception, route-history heuristic, or staff override.
>
> The continuation uses one exact acknowledged Page-owned candidate and the
> existing finite transfer-manifest compiler to create one independent private
> `general_page` in the same exact Tenant, environment, Site, and locale. It
> creates fresh Page, locale-lineage, Page-local block/anchor, Working Revision,
> and D2 Placement identities; requires a staff-reviewed title, parent/Top-
> level placement, and an available path or ADR-0203's exact eligible Draft-
> only Path Claim; and records inert provenance,
> repairs, durable audit/outbox, and one semantic-idempotency receipt. It copies
> no route/predecessor history, D78 relation, Page Purpose Continuity Version,
> Navigation, schedule, publication, search/cache/sitemap/analytics, lifecycle,
> owner, permission, provider, operational, or money authority.
>
> The source Page's published release, canonical/historical routes, public
> generation, continuity head, D78 relations, Navigation, and donor experience
> remain unchanged. D80 creates or advances no source continuity version. The
> target starts with no D78/D79 state and has no public route or canonical until
> a later independent D1 publication succeeds. In the same transaction, D81
> checkpoints the exact source candidate, appends necessary clean source
> Working successors from the same D1-pinned public generation, advances those
> private heads, and fences every old lease in the sealed source Editorial/
> Placement pair.
>
> One short expected-head transaction creates the complete target private draft
> and D81 protected-checkpoint/clean-source result or creates neither. Unknown
> transfer members, nonseparable shared changes, unacknowledged work, an active
> schedule for the candidate, stale heads, permission/lease drift, route
> collision, provider/schema skew, or any failure preserves the source and
> creates no target. Exact replay returns the same authorized result; changed
> input under the key conflicts. No network/provider call occurs in the
> transaction, and D80 adds no general clone tool, workflow, semantic
> classifier, redirect engine, Vercel mutation, or donor-facing transition.

## Fact classification

- **Verified repository facts:** current `develop` Pages are Tenant-scoped
  Payload records with mutable slug and page type, broad Tenant access, provider
  drafts, log-oriented audit, and latest-published reads. Current code has no
  accepted Site/locale stable Page, D2 placement, D1 generation, D76/D78
  relation, D79 continuity, or D80 transaction. The current template endpoint
  is not a safe D80 seam.
- **Verified proposed-repository facts:** proposed Phase 23 ADR-0145 separates
  stable Page, locale Editorial Revision, Placement Revision, and immutable
  Public Site Generation; ADR-0150 explicitly permits a released semantic
  correction through create-and-replace; ADR-0156 supplies acknowledged Working
  Revisions/leases/CAS; ADR-0167 specifies a finite transfer manifest and fresh
  independent private target for cross-Site copying. Those documents remain
  proposed in blocked PR #1340, not current runtime.
- **Verified external facts:** W3C ties persistent URI behavior to consistent
  resource representation and user expectations; RFC 9110 makes permanent
  redirects heuristically cacheable; Google requires corresponding replacements
  and warns against irrelevant redirects; current WordPress and Contentful
  products create separate drafts/entries when content is duplicated; Payload
  exposes generic duplication but also supports disabling it.
- **Repository requirement:** D78/D79 historical-address trust may not move to a
  different public meaning. D1/D2/D12/D23/Phase 12 owners may not be bypassed.
- **Product judgment:** an explicit material-purpose assertion is the clean
  resource-identity boundary. The universal rule is safer and simpler than a
  conditional direct-only branch.
- **Assumption requiring evidence:** representative ministry publishers can
  understand the old/new Page comparison and treat a candidate as one unit
  without expecting Core to split mixed edits. Moderated usability proof is an
  activation gate.
- **Resolved product judgment:** repository evidence does not establish how
  often ministry drafts mix routine old-Page corrections with new-purpose work.
  D81 therefore moves the complete admitted candidate, preserves the exact
  source checkpoint, explicitly tells staff to separate any source correction
  before moving, and performs no semantic field merge.

## Current repository and intended-model reconciliation

| Concern        | Current `develop`                                  | Proposed predecessor model                                                                        | Permanent D80 path                                                                                                 |
| -------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Page identity  | Tenant-only Payload row; mutable slug/type         | ADR-0145/0150: stable Site-owned identity, immutable family, exact locale lineage                 | Fresh same-Site/locale `general_page`; no interim Payload clone                                                    |
| Draft/public   | Payload autosave/status                            | ADR-0156: acknowledged Working Revision, lease, expected revision; D1 immutable public generation | Exact acknowledged candidate in; one private target out; no public head                                            |
| Placement      | Scalar slug                                        | ADR-0146: separate hierarchical Placement Revision and normalized route claim                     | Explicit D2-eligible parent or top-level-under-root plus local segment; D2 validates                               |
| Copy           | Template/layout copy and provider duplicate shapes | ADR-0167: exact-revision finite transfer plan to another Site                                     | Reuse compiler internals with narrow same-Site D80 policy; no generic duplicate                                    |
| Continuity     | None                                               | D78 relation plus sparse D79 continuity version                                                   | Source head/relations unchanged; target inherits none                                                              |
| Shared content | Mutable layout/content relationships               | ADR-0152: explicit shallow Site/locale Reusable Section owner                                     | Materialize in target; nonseparable shared candidate blocks D80                                                    |
| Navigation     | Tenant-level provider record/static fallbacks      | ADR-0148: separate Navigation Revision under D1                                                   | Never copy or mutate; later authorized D1/D4 action only                                                           |
| Schedule       | Provider behavior only                             | ADR-0157: exact revision appointment                                                              | Never copy; unresolved source-candidate appointment must be cancelled first                                        |
| Authorization  | Broad Tenant staff checks                          | ADR-0174/Phase 12: one actor-bound operations boundary                                            | Exact source release/Editorial edit/conditional Placement supersede plus target create/edit/placement; no new role |
| Audit          | Application log hook                               | Durable proposed receipts/audit/outbox                                                            | Append-only D80 business receipt without copied content                                                            |
| Public runtime | Latest published row by slug                       | D1 compiled generation plus Phase 5 adverse-first reader                                          | Zero D80 public effect; later target D1 only                                                                       |
| Provider       | Payload and Vercel mechanisms visible in prototype | Providers are qualified adapters, never authority                                                 | Disable Payload duplicate; no Vercel/DNS/TLS/Stripe call                                                           |

## Current primary evidence and bounded interpretation

| Primary source                                                                                                                                                                                                                                | Verified finding                                                                                                                                       | D80 use                                                                                        | Rejected overreach                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| [W3C Web Architecture](https://www.w3.org/TR/webarch/#URI-persistence)                                                                                                                                                                        | URI persistence depends on consistent, predictable representations with user expectations considered                                                   | Treat a genuinely new purpose as a new Web resource                                            | W3C does not define Core Page-purpose fields or UI                                                                                 |
| [RFC 9110 301](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4.2) and [308](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4.9)                                                                                              | Permanent redirects assert a permanent URI and are heuristically cacheable                                                                             | Do not claim origin-side route changes recall every external association                       | Do not claim every redirect is cached forever                                                                                      |
| [Google Site Moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) and [soft 404 guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors#soft-404-errors) | Map old URLs to corresponding replacements; irrelevant destinations confuse people and may be soft 404s; use true 404 when no clear replacement exists | Keep unrelated old and new purposes separate; never redirect merely because content was copied | Google does not decide ministry equivalence or authorize D78                                                                       |
| [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)                                                                                                                                       | Canonicals consolidate duplicate/very similar URLs                                                                                                     | A new materially different Page later emits its own self-canonical                             | A canonical tag is not a resource migration or authorization control                                                               |
| [Payload collection config](https://payloadcms.com/docs/configuration/collections), [Local API](https://payloadcms.com/docs/local-api/overview), and [access control](https://payloadcms.com/docs/local-api/access-control)                   | Generic duplicate is disableable; transaction context must be threaded; Local API bypasses access by default unless constrained                        | Keep native duplicate disabled and use an actor-bound Core command                             | `duplicateFromID`, hooks, or server location do not prove Core scope/safety                                                        |
| [WordPress copy](https://wordpress.com/support/copy-a-post-or-page/) and [permalinks](https://wordpress.com/support/permalinks-and-slugs/)                                                                                                    | Copy produces a new draft; Page URLs must be unique                                                                                                    | Use familiar independent-draft UX and explicit distinct address                                | WordPress's copied fields and silent numeric suffix are not Core authority                                                         |
| [Contentful entries](https://www.contentful.com/help/content-and-entries/)                                                                                                                                                                    | Duplicate creates a separate entry; edits remain unpublished until Publish                                                                             | Separate identity and later ordinary publication                                               | Generic entry duplication does not solve Core route/tenant/reference rules                                                         |
| [Blackbaud nonprofit CMS Page copy](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/content_pagebuilder2_pages_copying_existing_page_use_as_model.html)                                                                 | Copy creates a new uniquely named inactive Page but may inherit versions, attributes, security category, wrapper, and other properties                 | Nonprofit staff benefit from a private modeled Page without re-entry                           | Core must not copy permissions, presentation, versions, syndication, or owner authority merely because an older nonprofit CMS does |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                                                                                         | Grants and RLS both matter; insert uses `WITH CHECK`; update needs old/new-state checks; service roles bypass                                          | Least grants, old/new scope proof, privileged-path parity                                      | RLS cannot be claimed to secure a bypassing Payload connection                                                                     |
| [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)                                                                                                                                                        | Unique/composite referential constraints enforce structural integrity under concurrency                                                                | Same-scope keys and database-decided route/idempotency uniqueness                              | UI preflight/read-before-write alone is not reservation                                                                            |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                                                                                                               | Predictable input, programmatic status, labelled errors, and 320-CSS-pixel reflow are testable                                                         | One inline review, no selection-side mutation, durable/error-focused status                    | Accessibility does not require a warning modal or confirmation on every save                                                       |
| [Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache) and [Next.js redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)                                                                              | Redirect status responses can be cached; permanent Next.js redirects use 308                                                                           | Keep D80 out of Vercel and do not promise recall                                               | D80 does not need a Vercel redirect inventory or API call                                                                          |

## Strongest alternative and no-build comparison

The strongest alternative is Option 1 from the original D80 question: publish
the new purpose in place and make all unrequalified historical addresses
not-found for fresh Core requests. It has fewer private authoring steps and
leaves Page identity stable. It fails the harder resource problem: the current
canonical URL itself changes meaning, and cached predecessors may bypass the
fresh Core route decision. A direct-only proof branch would add durable history
comparison and UI eligibility without eliminating bookmarks, search signals, or
visitor expectations. Option 2 adds even more blocking work and still reuses the
canonical identity.

The strongest no-build answer is to keep D79's material candidate permanently
blocked and ask staff to create a Page manually. It is structurally safe but
needlessly forces re-entry and clipboard copy, loses exact source provenance,
and makes reference repair less reliable. The bounded independent-draft command
is justified because Phase 23 already requires almost all of its transfer
mechanics for D23.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern exists — Critical / High.** **What could go wrong:** Core
could solve only historical-address routing while leaving the canonical Page
identity free to acquire unrelated meaning, or build route-history exceptions
for a problem that resource separation eliminates. **Why it matters:** donors
trust URLs and Page context, and staff need a durable distinction between
editing a resource and creating a different one. **Evidence:** W3C consistency,
Google corresponding-target guidance, D78/D79's exact visitor-meaning test, and
Phase 23's stable Page model. **Decision effect:** validates Option 3 but makes
it universal and private-first. **Permanent fix:** D80-R1-R4 and R23-R26;
AC1-AC8, AC42-AC50.

### 2. Brittleness

**Material concern exists — Critical / High.** **What could go wrong:** raw JSON
copy carries old IDs, anchors, path, shared relationships, status, schedules, or
unsupported blocks; route-history branching depends on incomplete records; a
shared dependency continues changing the old Page. **Why it matters:** the new
draft may look correct but be coupled, broken, or publicly unsafe. **Evidence:**
ADR-0167 already requires exhaustive transfer classification; Payload generic
duplicate is document-shaped; D1 includes indirect dependencies. **Decision
effect:** narrows D80 to a separable Page-owned candidate and finite compiler.
**Permanent fix:** D80-R4, R8-R11, R18-R20; AC9-AC23, AC32-AC40.

### 3. Technical debt

**Material concern exists — High / High.** **What could go wrong:** D80 becomes
a second clone framework, duplicate route allocator, target-search tool,
purpose taxonomy, access workflow, or provider-specific endpoint. **Why it
matters:** each adds migrations, adapters, UI, tests, operating cost, and future
provider lock-in. **Evidence:** D23/D2/D12/Phase 12 already own those seams;
current template code is a temporary bridge. **Decision effect:** eliminates
generic duplicate and reuses owner ports. **Permanent fix:** D80-R3, R6-R8,
R17-R18, R25-R26; AC4, AC11-AC17, AC28-AC34, AC47-AC50.

### 4. Edge cases

**Material concern exists — Critical / High.** **What could go wrong:** source
is root or has children; candidate mixes routine and new-purpose edits; only one
locale changes; a schedule exists; Reusable Section/global content changed;
self-links and anchors reference the old identity; Media becomes unsafe; target
path collides; source/target enters Trash; capability/lease/head changes; replay
arrives after purge. **Why it matters:** all are realistic CMS operations and
can create wrong routing, lost work, or mixed authority. **Evidence:** proposed
D1-D3, D8, D12-D13, D21-D23 assign each fact separately. **Decision effect:**
adds exact guards and D81. **Permanent fix:** D80-R4-R13, R18-R25; AC5-AC40,
AC43-AC50.

### 5. Footguns

**Material concern exists — Critical / High.** **What could go wrong:** staff
think **Create** publishes, the source material draft remains publishable, Core
silently appends a URL suffix, automatically moves Navigation, copies a
schedule, or hides results in a toast/desktop Inspector. **Why it matters:** one
ordinary later click could recreate the unsafe in-place publication; donors may
see partial or undiscoverable content. **Evidence:** current Inspector is hidden
below `lg`; WordPress may suffix duplicate slugs; D79 selection alone must not
mutate. **Decision effect:** requires an inline old/new comparison, explicit
path, private result, and source-draft safety. **Permanent fix:** D80-R6-R7,
R12-R16, R22-R23; AC14-AC31, AC36-AC46.

### 6. Tenant safety

**Material concern exists — Critical / Medium.** **What could go wrong:** a
client supplies another Tenant/Site/locale, sees restricted Page/route details,
retains a cross-scope Media/reference, or cache/query state mixes target
identity. **Why it matters:** ministries can expose confidential operational
structure or publish another organization's content. **Evidence:** current
Pages are only Tenant-scoped; D23 and Phase 12 require exact Site scope and
non-enumeration. **Decision effect:** makes same exact scope structural and
server-derived. **Permanent fix:** D80-R4-R7, R17-R21, R24; AC5-AC7,
AC12-AC13, AC28-AC40, AC45-AC50.

### 7. Database, RLS, and authorization safety

**Material concern exists — Critical / High if implemented conventionally.**
**What could go wrong:** caller-controlled actor/scope, nullable keys, cross-
scope FKs, read-before-write path checks, cascading proof deletion, update
`USING` without result `WITH CHECK`, exposed plan/receipt DML, unsafe views/RPCs,
or Payload/service-role bypass creates or reassigns forbidden rows. **Why it
matters:** the result is a durable Page/route claim and audit history. **Evidence:**
Supabase documents grants plus policies and service-role bypass; PostgreSQL
constraints arbitrate concurrency; Payload Local API overrides access by
default. **Decision effect:** requires one trusted command and structural
integrity. **Permanent fix:** D80-R17-R21, R25; AC28-AC40, AC47-AC50.

### 8. Overengineering

**Material concern exists in the raw conditional design — High / High; no
material concern remains in the corrected D80 scope.** **What could go wrong:**
a direct-only exception requires route-effect history adapters, eligibility
branching, and staff explanations; a generic dependency fork or clone engine
solves speculative cases. **Why it matters:** complexity grows without proving
better donor safety. **Evidence:** universal new identity removes the branch;
D23 already provides the bounded compiler. **Decision effect:** simplifies the
answer materially. **Permanent fix:** D80-R1-R3, R8, R10, R26; AC1-AC4,
AC11-AC17, AC48-AC50.

### 9. UX/UI and user friction

**Material concern exists — High / High.** **What could go wrong:** a wizard,
nested modal, repeated confirmation, technical redirect language, ambiguous
old/new state, extra Site/locale/family choices, weak mobile layout, focus jumps,
or optimistic weak-network success causes abandonment or mistakes. **Why it
matters:** small ministry teams need to finish consequential work quickly and
donors must see no transition machinery. **Evidence:** current Web Studio uses
one Page-first workspace; Phase 23 uses concise consequence-first actions;
WCAG requires predictable input/status/reflow. **Decision effect:** defines one
inline continuation with three target inputs and no donor UI. **Permanent fix:**
D80-R14-R17, R23-R24; AC14-AC31, AC41-AC46, AC50.

### 10. Source of truth, ownership, and domain invariants

**Material concern exists — Critical / High.** **What could go wrong:** copy
provenance becomes a live sync/successor relation; Payload status becomes public
truth; target inherits continuity/Navigation/schedule; D80 owns route or Media
safety; a read model writes authority. **Why it matters:** dual ownership makes
future edits and failures ambiguous. **Evidence:** Phase 23/24 already assigns
Page, placement, working, publication, route, Navigation, D78/D79, and source
facts. **Decision effect:** creates only a coordinating receipt and fresh Page
facts. **Permanent fix:** D80-R2, R5-R13, R18-R23; invariants I1-I22;
AC4-AC13, AC20-AC43.

### 11. Hidden coupling

**Material concern exists — High / High.** **What could go wrong:** new and old
Pages share Reusable Sections unexpectedly, target runtime dereferences source
provenance, D80 depends on Payload version retention, target publication cleans
source draft, or Vercel redirects become authority. **Why it matters:** later
changes or provider pruning can break an apparently independent Page. **Evidence:**
D8 and D23 explicitly bound reuse; D1 public projection is provider-neutral.
**Decision effect:** materializes shared content, makes provenance inert, keeps
creation/publication separate, and adds no provider calls. **Permanent fix:**
D80-R8-R13, R18, R23-R26; AC9-AC23, AC32-AC50.

### 12. Failure modes

**Material concern exists — Critical / High.** **What could go wrong:** target
exists without repairs/receipt, source is cleaned without target, lost response
creates two Pages, route is stolen after preflight, provider/network stalls under
lock, or UI declares success before reconciliation. **Why it matters:** partial
authoring state is confusing and can later publish incorrectly. **Evidence:**
D12/D23 require expected revisions, short transactions, and idempotent receipts.
**Decision effect:** makes all-or-none local command and uncertain-result state
mandatory. **Permanent fix:** D80-R18-R24; AC24-AC46, AC48-AC50.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists — Critical / High.** **What could go wrong:** draft
selection mutates; schedule publishes old candidate; two tabs create two
targets; source publish/lease takeover/D78 renewal races D80; replay resurrects
a purged target; rollback re-enables in-place material publication. **Why it
matters:** individually valid actions can jointly violate identity and work
preservation. **Evidence:** frequent autosave and separate D1/D12/D13/D78 heads
make races expected. **Decision effect:** adds explicit states, expected-head
winner, semantic replay, schedule block, and forward-only recovery. **Permanent
fix:** D80-R4, R12-R13, R18-R25; AC5-AC10, AC20-AC40, AC47-AC50.

### 14. Data integrity risks

**Material concern exists — Critical / Medium.** **What could go wrong:** target
reuses Page/block/anchor identity, path has two claimants, provenance points
cross-scope, repair items detach, receipt duplicates, source history is lost, or
target acquires inherited public/continuity rows. **Why it matters:** corrupted
history and route claims are hard to repair safely. **Evidence:** D2/D23 require
fresh identities, exact plan digest, and database uniqueness. **Decision effect:**
adds invariants and append-only evidence. **Permanent fix:** D80-R5-R13,
R18-R22, R25; AC8-AC13, AC20-AC40, AC47-AC49.

### 15. Security and privacy risks

**Material concern exists — Critical / Medium.** **What could go wrong:** Page
bodies/URLs leak into logs or receipts, restricted route occupants are named,
source-owner capability is copied, open redirects appear, service roles bypass
scope, or sensitive missionary/location content is duplicated into a broader
Page. **Why it matters:** public-looking CMS data can still contain sensitive
ministry context. **Evidence:** D78 excludes protected owners and arbitrary URLs;
Supabase service roles bypass RLS; D23 revalidates references. **Decision effect:**
minimizes provenance/audit, retains owner safety, and excludes protected/money
routes. **Permanent fix:** D80-R4, R9-R11, R17-R24, R26; AC5-AC13,
AC20-AC46, AC50.

### 16. Scalability and performance risks

**Material concern exists — High / Medium.** **What could go wrong:** deep graph
copy, per-block/provider calls, N+1 reference validation, long transaction,
unbounded repair rows, or route scans degrade large Pages/Tenants. **Why it
matters:** a private convenience can contend with publication and staff editing.
**Evidence:** D23 already bounds one revision, depth-zero relationships,
batched validation, and short transactions. **Decision effect:** inherits that
bounded-linear envelope and adds no route-history inventory. **Permanent fix:**
D80-R8-R10, R18-R20, R24-R25; AC9-AC13, AC32-AC40, AC44-AC50.

### 17. Operational burden

**Material concern exists — High / Medium.** **What could go wrong:** staff must
clean duplicate drafts, repair database rows, decide HTTP status, retype content,
or ask developers to resolve collisions/unknown manifests. **Why it matters:**
small nonprofit teams cannot carry a specialist migration process. **Evidence:**
bounded copy removes re-entry; D2/D23 give cause-owned repair paths. **Decision
effect:** one self-service review, no provider/redirect knobs, and D81 avoids
permanent cleanup debt. **Permanent fix:** D80-R6-R16, R18-R26; AC14-AC31,
AC36-AC50.

### 18. Observability and auditability gaps

**Material concern exists — Critical / High.** **What could go wrong:** logs say
"created" but cannot prove source revision, target, route, manifest, actor effect,
repairs, source-private disposition, or public no-effect; staff cannot explain
uncertain success. **Why it matters:** support and safe correction need durable
business history, not traces. **Evidence:** current audit hook is log-oriented;
D23/D79 require receipts. **Decision effect:** requires minimal append-only
receipt plus correlated telemetry and staff timeline. **Permanent fix:**
D80-R18-R25; AC24-AC50 and named monitors.

### 19. Dependency and integration risks

**Material concern exists — High / Medium.** **What could go wrong:** a Payload
upgrade changes duplicate/version behavior, Vercel route config diverges, Media
or dynamic provider outage blocks under lock, or shared-owner schema changes
silently omit content. **Why it matters:** providers can change independently
and shared-project behavior can cross tenants. **Evidence:** Payload exposes
provider-specific duplicate/access/transaction semantics; Core ADRs make it an
adapter. **Decision effect:** native duplicate stays disabled, schema drift
fails closed, remote proof completes before transaction, and D80 is Vercel-
neutral. **Permanent fix:** D80-R8-R11, R18-R26; AC9-AC13, AC32-AC50.

### 20. Migration, rollout, and upgrade risks

**Material concern exists — Critical / High.** **What could go wrong:** D80 is
built on current Tenant-only Pages, old writers publish without D79, new code
sees old schema, route constraints are absent, rollback deletes targets, or a
manifest version becomes unreadable. **Why it matters:** mixed versions can
violate the identity invariant before monitoring notices. **Evidence:** all
required Phase 23/24 substrate is absent/current PRs are blocked. **Decision
effect:** prohibits implementation now and requires additive reader/compiler-
first rollout. **Permanent fix:** D80-R3, R18-R26; AC4, AC32-AC40,
AC47-AC50.

### 21. Testability, traceability, and proof

**Material concern exists — High / High.** **What could go wrong:** tests assert
a copied row rather than public/source invariants; materiality remains vague;
pre-amendment ADRs said D80 advances continuity; OpenSpec, tickets, UI, and
receipts can use different terms; authorization/concurrency/a11y negatives may
be omitted. **Why it
matters:** implementation can pass unit tests while serving unrelated content
or losing work. **Evidence:** this review found and corrected the deferred D80-
advance placeholder in ADR-0200 and downstream docs; the trace scan prevents
regression. **Decision effect:** adds exact language, cross-doc reconciliation,
ACs, and production proof. **Permanent fix:**
D80-R1-R26; AC1-AC50 and proof suite.

### 22. Other development hazards

**Material concern exists — High / Medium.** **What could go wrong:** staff
interpret new Page as a required legal/content approval, assume old Page will be
retired, expect Navigation/incoming links to move, or use copy provenance as
D78 successor proof; direct-only logic may return later under support pressure.
**Why it matters:** UI promises can create unsafe policy and cleanup work.
**Evidence:** copied content is not semantic equivalence; Phase 23 keeps
Navigation/lifecycle independent. **Decision effect:** makes non-effects explicit
and forbids provenance authority. **Permanent fix:** D80-R1-R2, R11-R16,
R23-R26; AC1-AC4, AC14-AC23, AC41-AC50.

## Required specification language

### D80-R1 — Universal new-resource boundary

After D79 records **changes what this Page is for**, the candidate SHALL NOT
publish through the existing Page identity. Every such candidate continues as a
new Page; no redirect-history/direct-only/traffic/cache/staff-override branch is
permitted.

### D80-R2 — No continuity advance or inheritance

D80 SHALL NOT create or advance the source Page Purpose Continuity Version and
SHALL NOT mutate/transfer any D78 relation. The source head remains current; the
fresh target starts without D78/D79 state.

### D80-R3 — Required substrate and current-runtime prohibition

D80 SHALL depend on accepted Phase 23 D1/D2/D6/D8/D12/D13/D21/D23/D33 and Phase
24 D76-D79/Phase 12/Phase 5 contracts, plus ADR-0202's accepted D81 source
checkpoint/clean-successor/lease-fence contract in the same atomic boundary.
Today's Tenant-only Payload Page, template endpoint, or provider duplicate SHALL
NOT serve as an interim implementation.

### D80-R4 — Exact source and scope

The command SHALL bind one exact acknowledged Page-owned D12 Working Revision
and effective dependency digest for one `general_page` under the same trusted
Tenant/environment/Site/locale. Caller input SHALL NOT select authoritative
scope, family, actor, source revision, continuity, or owner state.

### D80-R5 — Fresh private target identity

The result SHALL have fresh Page, exact-locale lineage, Page-local block/anchor,
Working Revision, and Placement identities and explicit `_status: draft`/
provider-neutral private state. It SHALL have no public-generation head.

### D80-R6 — Small explicit target input

The existing review SHALL show/edit only target Page title, explicit eligible
Parent Page (with **Top level** meaning directly under the current Site root),
and local web-address segment. Site, domain, locale, family, source, and old URL
remain fixed read-only context. D80 SHALL NOT create, replace, or reassign the
Site root/Home Page.

ADR-0205/D84 adds one read-only **Page tree position** consequence, not another
editable input. D2 resolves Parent Page/Top level from trusted state, preserves
a positively proved tagged start/between/end/only boundary, or resolves a
positively recorded append-last default against the same post-D81/D82/D83 final
baseline. Missing/unknown provenance and stale explicit boundaries use ordinary
D2 position review. The target gets a fresh order representation; no source/
provider rank transfers, and D84 causes no pre-existing Page parent/order write
beyond the sealed predecessor effects.

### D80-R7 — D2 route claim

D2 SHALL normalize and validate the complete proposed address. Commit-time
structural uniqueness SHALL cover active, historical, reserved, protected,
unrelated draft-claimed, Trash-retained, and source-owned route classes.
ADR-0203/D82 is the sole exception: D2 may supersede the exact current sealed
source Draft-only Path Claim and append one fresh target claimant-ownership
occurrence/version for the same
canonical key inside D80/D81's transaction after complete positive route-
effect proof. Private source Revision History remains immutable and is not a
claim. Core SHALL NOT overwrite or silently suffix a collision. Source root
status and descendant ownership remain unchanged and do not copy/reparent.
ADR-0204/D83 may atomically establish one exact qualified source-owned derived
draft-path/breadcrumb closure while preserving every child's direct Placement
inputs and History. Every incompatible, stale, inaccessible, protected, or
over-capacity closure blocks and uses ordinary D2 cleanup first.

### D80-R8 — One reused transfer compiler

D80 SHALL reuse D23's versioned finite transfer compiler, exact plan digest,
owner adapters, repair classification, atomic creation, and receipt. It SHALL
add only a narrow same-Site policy profile, not a general clone abstraction or
broader **Copy to another Site** UI.

### D80-R9 — Exhaustive content handling

Every field/node/block/package/reference SHALL be classified as copy,
materialize/remap, review after creating, or never copy. Unknown/incompatible
members SHALL block rather than disappear. Page-local identity/anchors SHALL be
fresh; self-references SHALL remap; eligible other references SHALL revalidate.

### D80-R10 — Shared dependency separability

Reusable Sections SHALL materialize into fresh Page-local target content. A
material candidate caused by a shared/global/source-owned change that would
still change the old Page SHALL block D80 and link to the existing owner action;
D80 SHALL NOT fork, publish, reset, or clone another owner's working state.

### D80-R11 — Authority never copies

Path/route history, Navigation/incoming-link ownership, folders, Topics, views,
leases, comments, approvals, schedules, publication, continuity/D78, audience/
Reach/safety, public/search/cache/sitemap/analytics, Trash, Site, provider,
operational, financial, and actor facts SHALL NOT transfer as target authority.

### D80-R12 — Source public invariance

Source published release, canonical/historical routes, public generation,
continuity head, D78 relations, Navigation, search/cache, and donor-visible
bytes/effects SHALL remain unchanged. Later source lifecycle work SHALL be a
separate explicit owner command.

### D80-R13 — Source private-draft safety

The source material candidate SHALL remain one logical protected handoff event
grouping independently resource-scoped D12 checkpoint pins and SHALL NOT remain
an unlabelled ordinarily publishable draft. ADR-0202 SHALL append changed source
axes from the exact public pins, advance their Working heads, and fence every
old lease generation in the sealed Editorial/Placement pair in the same
transaction.

### D80-R14 — One inline continuation

Selecting D79 **changes** SHALL reveal one main-column old/new Page panel inside
the existing D1 consequence review. Selection alone SHALL NOT mutate, navigate,
open a modal, move focus, or submit.

### D80-R15 — Plain consequences and actions

The panel SHALL say the current Page stays live as-is, the new Page is a private
draft, and Navigation/incoming links/schedules/public search/historical addresses
stay unchanged. It SHALL also show that the moved Page-owned changes leave the
source draft, separately managed content stays unchanged, and exact History
remains. Primary SHALL be **Move saved changes to new Page draft**;
secondary SHALL be **Back to editing**. No confirmation, destructive style,
HTTP/provider vocabulary, or donor interstitial is allowed.

### D80-R16 — Complete accessible states

Save-required, checking, ready, repair, blocker, route collision, drift,
permission loss, moving, uncertain result, failure, and success SHALL have
persistent textual state, accessible error/focus behavior, retained input, and
no toast/color/icon/motion-only meaning. The surface SHALL meet Core keyboard,
screen-reader, touch, focus, forced-color, reduced-motion, reflow, zoom,
long/CJK/RTL, bidi-URL, and weak-network contracts.

### D80-R17 — Existing authority only

Preflight and commit SHALL require D79's exact source release-decision effect,
source Editorial read/edit, source Placement edit/supersede whenever that axis
differs, target Page create/edit/placement effects, and current pair lease/
revision authority. Target Placement authority cannot mutate source Placement.
Every current lease in the sealed source pair must be unowned or held by the
initiating authorized session; otherwise D12's existing explicit return/
takeover flow runs first. Missing authority SHALL preserve work and use existing
cause-owned access guidance; D80 SHALL add no permission, invite, assignment,
approval, or support override.

### D80-R18 — Sealed preflight

Preflight SHALL produce an expiring immutable digest over trusted actor/effect,
scope, source/placement/effective revisions, public/continuity/D78/lease heads,
manifest/adapter/policy generations, target inputs/path claim, repairs, D81
checkpoint/clean-successor inputs, and semantic idempotency identity. Commit SHALL re-prove every
mutable input.

### D80-R19 — Atomic semantic-idempotent commit

One short authoritative transaction SHALL create complete target identity,
locale/Working/Placement revisions, content/remaps, repairs, inert provenance,
receipt, protected source checkpoint, necessary clean successors/head advances,
source lease fences, and audit/outbox or none. No network/provider call
may occur under it. Exact replay SHALL return the same authorized target;
changed input under the key SHALL conflict.

### D80-R20 — Structural integrity and indexes

Same-scope composite keys/FKs, restrictive delete/tombstone rules, non-null
owner/version pins, fresh-identity constraints, unique normalized route claim,
unique semantic command identity, and equality-leading indexes SHALL prevent
cross-scope, duplicate, orphan, overwrite, and resurrection states.

### D80-R21 — Grants, RLS, and privileged parity

Browser/Data API roles SHALL have no direct DML over D80 or owner truth.
Applicable exposed tables SHALL use least grants, ENABLE/FORCE RLS, appropriate
`USING` and `WITH CHECK`, safe views/functions, and hostile allow/deny tests.
Payload/service/owner/worker/import/migration/support paths SHALL repeat the
same exact scope/effect/head validation; RLS SHALL NOT be claimed to constrain a
bypassing privileged connection.

### D80-R22 — Lifecycle, schedule, and concurrency

Selection/save/preview/preflight SHALL be private. An unresolved appointment
for the exact source candidate SHALL block with D13's **Cancel scheduled
publication** action; D80 SHALL not copy/cancel it implicitly. Concurrent save,
lease, publish, D76-D79, route, lifecycle, capability, or deploy drift SHALL have
one expected-head winner and no partial target. Replay SHALL never resurrect a
trashed/purged target.

### D80-R23 — Zero public, Vercel, and money effect

D80 creation SHALL publish/unpublish/redirect/canonicalize/rewrite/reassign
nothing; change no D1/Phase 5/cache/search/sitemap/social/Navigation output; and
send no Vercel/DNS/TLS/domain/deployment/Stripe/bank/currency/gift/ledger/form/
email operation. The private target becomes public only through later D1.

### D80-R24 — Bounded performance, operations, and observability

Before private-cohort activation, Phase 23 D33 governance SHALL ratify a new
Production Capacity Profile version and matching exact Vercel Qualification
Attachment whose Minimum, Typical, and Measured maximum cohorts include one
named **D80 material-purpose Page handoff** scenario. Page and CMS Platform
owners SHALL supply its functional bounds and evidence. Separate numeric cells
SHALL cover admitted transfer members/bytes, repair items, reference-validation
mix, concurrency/contention, preflight and commit latency/tails, reconciliation
age, database rows/locks/connections, recovery, and unit cost; each cell SHALL
include its exact value/distribution or mix, growth horizon, and evidence date.
One Capacity Evidence Package SHALL prove those cells against the exact build.
The attachment maps the active profile without becoming product authority. An
empty D80 cell or missing evidence means the profile is not active. Transfer
SHALL remain one revision, depth-zero, batched, and bounded-linear within the
active profile version. Repair projection SHALL be bounded and not a work-
management store. Durable business history and privacy-safe cause-coded
telemetry SHALL distinguish preflight, rejection, commit, replay, uncertain
result, target lifecycle, and later independent publication.

### D80-R25 — Migration, rollout, and recovery

Rollout SHALL be additive reader/compiler/constraint/native-action-suppression/
shadow/preflight/private-cohort/commit activation. Old writers SHALL be fenced
from in-place material publication. Mixed versions fail closed. Rollback SHALL
disable new creation while retaining targets, receipts, and history; recovery
SHALL roll forward rather than delete/rewind.

### D80-R26 — Traceability and non-goals

The exact corrected terms and invariants SHALL flow through ADR-0200/0201,
glossary, Phase 2/5/12/23/24 docs, living spec, roadmap, proposed OpenSpec,
design, tasks, tickets, implementation, tests, and release evidence. D80 SHALL
not add materiality AI/diff, purpose schema, generic duplicate, redirect UI,
workflow, bulk migration, synchronization, or a larger critical-owner inventory.

## Domain invariants

1. **I1:** a D79 material candidate never publishes through its current Page
   identity.
2. **I2:** source and target Page identities differ permanently.
3. **I3:** target shares exact Tenant/environment/Site/locale and
   `general_page` family with the source.
4. **I4:** target Page/locale/block/anchor/Working/Placement identities are
   fresh.
5. **I5:** target proposed normalized route is explicit, distinct, structurally
   unique, and not publicly active before D1.
6. **I6:** source published release, route effects, generation, continuity head,
   D78 relations, and Navigation do not change in D80.
7. **I7:** D80 creates/advances no source continuity version; target inherits no
   D78/D79 state.
8. **I8:** exact acknowledged Page-owned candidate is the sole content source;
   no mutable latest/provider selection occurs.
9. **I9:** every transfer member has one exhaustive versioned disposition;
   unknown means no target.
10. **I10:** Reusable Section content becomes Page-local; nonseparable shared
    owner change blocks.
11. **I11:** Navigation, incoming-link authority, schedule, publication, search,
    analytics, lifecycle, permission, safety, provider, operational, and money
    truth never copy.
12. **I12:** provenance explains creation but never implies equivalence,
    succession, synchronization, routing, or resurrection.
13. **I13:** the exact source candidate remains a protected meaningful
    checkpoint; D81 prevents it becoming an unlabelled publishable footgun.
14. **I14:** target creation, source checkpoint, clean successors/head advances,
    and sealed-pair lease fences commit together or neither happens.
15. **I15:** selection, save, preview, preflight, repair, and collision have zero
    public effect.
16. **I16:** exact semantic replay returns one target/receipt; changed input
    conflicts; terminal target state never recreates.
17. **I17:** authoritative actor/scope/heads come from trusted server context.
18. **I18:** route availability is decided under database concurrency, not UI
    observation.
19. **I19:** public runtime never reads D80 plans/provenance/receipts.
20. **I20:** no remote/provider call occurs inside the authoritative transaction.
21. **I21:** no Vercel/domain/DNS/TLS/Stripe/money mutation exists in D80.
22. **I22:** correction is forward-only; history and committed targets are never
    destructively rewritten by rollback.

## Lifecycle and valid transitions

| State                                  | Action                               | Result                                                          | Public effect                  |
| -------------------------------------- | ------------------------------------ | --------------------------------------------------------------- | ------------------------------ |
| D79 review, no choice                  | Save/preview/leave                   | Candidate remains private                                       | None                           |
| D79 **keeps**                          | Ordinary valid D1 Publish            | Existing Page release may advance on current continuity version | Existing D79 path only         |
| D79 **changes** selected               | Reveal D80 continuation              | No mutation; old/new summary and target inputs                  | None                           |
| Candidate unacknowledged               | Save now / wait                      | Exact D12 receipt required                                      | None                           |
| Shared/nonseparable or scheduled       | Use owner repair/cancel action       | D80 blocked; candidate preserved                                | None                           |
| D80 preflight ready                    | Edit title/parent/segment            | Prior plan expires; new plan validates                          | None                           |
| D80 commit succeeds                    | Create target + D81 append-and-clean | One private target; clean source; protected checkpoint/receipt  | None                           |
| D80 exact replay                       | Reconcile receipt                    | Same authorized target                                          | None                           |
| D80 drift/collision/permission/failure | Repair/review                        | No target; source unchanged                                     | None                           |
| Target later passes D1                 | Publish new Page                     | Target route/self-canonical becomes public                      | Ordinary target D1 effect only |
| Source later moves/retires             | Separate owner command               | Existing D2/D3/D78/D79/lifecycle rules apply                    | That separate command only     |
| Target enters Trash/purge              | Replay old key                       | Authorized terminal disposition; no resurrection                | None                           |

Forbidden transitions include source material publication, source continuity
advance, D78/Navigation/schedule inheritance, target public activation during
D80, target creation without the D81 checkpoint/clean-source/lease-fence result, exact replay creating a
second Page, rollback deletion, and provider/route repair outside the owner
commands.

## Logical data and authority shape

D80 does not require a generic clone/workflow model. It reuses Page/locale/
Working/Placement revisions, D2 route claims, D23 transfer manifests/repairs,
and existing audit/outbox infrastructure. The only D80-specific durable fact is
one append-only **Material-purpose Page Handoff Receipt** (exact physical name
remains design-owned) containing trusted scope; exact source identity,
Editorial/Placement candidate revisions and effective dependency digest;
source public/continuity/D78-set/lease heads; target identity/revisions/path
claim; transfer manifest/adapter/policy and repair digests; D81 source checkpoint,
clean successors/heads, and lease fences; actor effect/capability epoch;
semantic command/input digests; outcome;
and server time. It stores no Page body, copied block tree, purpose prose,
restricted URL list, Media bytes, secret, or provider token.

Same-store relationships use same-scope composite keys/FKs; cross-owner/store
evidence uses typed immutable IDs/digests and owner commands, never a fictional
foreign key. Receipt-linked identities use restrictive lifecycle/tombstones so
proof cannot disappear through cascade or `SET NULL`. Purpose-shaped indexes
start with equality scope and support idempotency, source-revision history,
target lookup, current route claim, and repair retrieval. Exact physical schema
is implementation-design work; the invariants, not a prematurely frozen table
layout, are binding.

## Staff UX specification

### Main review

> **This update needs a new Page**
>
> Keep **About** at its current address for its current purpose, and create a
> separate private Page draft for this new purpose. Nothing will be published
> now.

> **Current Page · Stays live as-is**<br>
> About<br>
> `https://hoperelief.org/about`
>
> **New Page draft · Not live**<br>
> Main Website · English (US)

Fields:

- **Page title** — prefilled from the acknowledged candidate, editable;
- **Parent Page** — searchable authorized list with **Top level** meaning under
  the current Site root, never a new root;
- **Web address** — editable local segment with complete domain/path preview.

> **What happens**
>
> - A new independent private draft is created from these saved changes.
> - About, its public address, and its historical addresses stay unchanged.
> - Navigation, existing incoming links, schedules, and public search stay
>   unchanged.
> - Any copied items that need attention will appear in the new draft.

Primary: **Move saved changes to new Page draft**.

Secondary: **Back to editing**.

### Exact visible states

| State                      | Staff copy/behavior                                                                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Candidate not acknowledged | **Save these changes first** — use D12 **Save now** or await save                                                                                                                                       |
| Preflight                  | **Checking the new Page and About...**; stable layout; no preview dependency                                                                                                                            |
| Ready                      | **Ready to move · Nothing will be published** with complete proposed URL                                                                                                                                |
| Reviewable repairs         | **Review after moving · N** only with aggregate authority                                                                                                                                               |
| Blocking transfer          | **Fix N items before moving**, linked to exact fields/blocks                                                                                                                                            |
| Nonseparable shared owner  | **Make this content local first**, using existing owner action                                                                                                                                          |
| Scheduled candidate        | **Cancel scheduled publication first**, using D13 action                                                                                                                                                |
| Route collision            | **That web address is already in use. Choose another.** Occupant only if authorized                                                                                                                     |
| Source/head drift          | **About changed since this review. Review the latest saved version. Nothing was moved.**                                                                                                                |
| Permission drift           | **Your access changed. Nothing was moved.**                                                                                                                                                             |
| Commit                     | **Creating the new Page and removing these Page changes from About's active draft...**, announced busy state, one submission                                                                            |
| Lost acknowledgement       | **Checking whether the changes were moved...** before retry                                                                                                                                             |
| Definite failure           | **We couldn't move these changes. About and its saved draft are unchanged. No new Page was created.** Inputs retained                                                                                   |
| Success                    | After fresh target read/edit + lease, navigate/focus target and persist exact Site/domain/locale/**Draft - not live**, moved-source result, repairs, **Open About**; otherwise detail-free confirmation |

### Donor experience

There is no D80 donor surface. Before later target D1 publication, donors see
only the existing tenant-native Page and current historical-address behavior.
They never see Asym/Vercel/Tenant/Site, transition banners, purpose language,
drafts, redirects, partial content, or an extra hop because of D80.

## Acceptance criteria

1. **AC1:** selecting D79 **changes** cannot publish the candidate through the
   source Page identity.
2. **AC2:** no route-history/direct-only condition can enable in-place material
   publication.
3. **AC3:** D79 **keeps** remains the ordinary in-place lane and D80 adds no
   prompt to unaffected Pages.
4. **AC4:** current Tenant-only Payload/template/duplicate seams cannot execute
   D80.
5. **AC5:** source and target use different Page IDs under exact same trusted
   Tenant/environment/Site/locale and `general_page` family.
6. **AC6:** caller-supplied Tenant/Site/locale/family/actor/source-head values
   cannot change authoritative scope.
7. **AC7:** wrong-Tenant/Site/locale/family and unauthorized discovery return
   non-enumerating denial and create nothing.
8. **AC8:** target Page/locale/block/anchor/Working/Placement identities are
   fresh.
9. **AC9:** every admitted transfer member has one exhaustive manifest class;
   unknown/incompatible members block.
10. **AC10:** self-references/anchors remap; qualified other references and Media
    revalidate; nothing silently disappears.
11. **AC11:** Reusable Sections materialize locally and no source-target live
    content relationship remains.
12. **AC12:** a nonseparable shared/global/source-owner material change blocks
    and exposes only the existing owner action.
13. **AC13:** transfer is depth-zero/batched/bounded-linear with no recursive or
    N+1 graph walk and no remote call under transaction, and passes every cohort
    of the active D33 named D80 scenario.
14. **AC14:** selecting D79 **changes** reveals the inline panel without
    mutation, navigation, modal, focus move, or submit.
15. **AC15:** the panel stacks current and target summaries and states old live/
    new private consequences in plain language.
16. **AC16:** only title, D2-eligible parent/**Top level under Site root**, and
    local segment are editable; full target tenant URL is visible/copyable and
    source root/children/breadcrumbs never transfer.
17. **AC17:** title-derived segment is a suggestion only and no collision is
    overwritten or silently suffixed; ADR-0203's exact Draft-only Path Claim
    uses atomic source supersession plus a fresh target claimant-ownership
    occurrence/version, never transfer of a source Revision/claimant-
    ownership-occurrence identity.
18. **AC18:** Navigation, incoming links, schedules, search, historical
    addresses, and old Page lifecycle are explicitly unchanged.
19. **AC19:** actor without target create/edit/placement effect preserves work,
    sees existing access guidance, and gains no new workflow/permission.
20. **AC20:** source current/historical routes, public generation, continuity
    head, D78 relations, Navigation, and donor result are unchanged after D80.
21. **AC21:** D80 creates/advances no source continuity version and target has no
    inherited D78/D79 state.
22. **AC22:** target inherits no schedule, publication/first-live timestamp,
    search/cache/sitemap/analytics, lifecycle, approval, permission, owner, or
    provider authority.
23. **AC23:** provenance is immutable/minimal and cannot drive editing, routing,
    D78 equivalence, synchronization, or resurrection.
24. **AC24:** unacknowledged/offline/pending/failed/conflicted candidate blocks
    with D12 recovery.
25. **AC25:** unresolved exact source schedule blocks with D13 cancel action and
    is never copied/cancelled implicitly.
26. **AC26:** preflight plan binds all required exact heads, versions, target
    input, repairs, policy, actor effect, D81 checkpoint/clean inputs, and semantic key.
27. **AC27:** any preflight-to-commit drift invalidates the plan and creates no
    target.
28. **AC28:** one short transaction creates complete target, protected source
    checkpoint, necessary clean successors/head advances, lease fences,
    receipt/audit/outbox or none.
29. **AC29:** failpoints cannot produce target-with-wrong-source-state or source-
    changed-without-target.
30. **AC30:** exact lost-response replay returns the same authorized target;
    changed input conflicts; later unauthorized replay leaks no details.
31. **AC31:** double click, refresh, two tabs, and retry cannot create a second
    Page.
32. **AC32:** database constraints arbitrate normalized route and semantic-
    command races rather than read-before-write logic; exact D82 replay returns
    its receipt before treating the target-owned key as a collision.
33. **AC33:** same-scope composite integrity rejects cross-Tenant/Site/locale
    owner references.
34. **AC34:** restrictive lifecycle rules retain proof and prevent cascade/
    `SET NULL` erasure or replay resurrection.
35. **AC35:** equality-leading indexes cover route claim, semantic replay,
    source receipt, target, and repair retrieval, with passing query-plan/load/
    contention evidence through the active D33 Profile version's Measured
    maximum D80 handoff cohort and its Minimum/Typical floors.
36. **AC36:** browser/anon/authenticated roles have no direct D80/owner DML;
    grants and RLS test both permitted old row and resulting new row.
37. **AC37:** views, RPCs, security-definer, service/BYPASSRLS, Payload Local
    API, worker/import/migration/support/repair paths pass hostile parity tests.
38. **AC38:** privileged functions use least owner, qualified names, pinned empty
    `search_path`, and no caller actor/scope authority.
39. **AC39:** source save, lease takeover, publish, D76-D79 renewal, route claim,
    Trash, locale/Site, capability, and deploy races have one safe winner.
40. **AC40:** replay after target Trash/purge returns only authorized terminal
    state and never recreates.
41. **AC41:** target is private/no-store/noindex, preview is exact authorized
    context, and D80 creates no public route/canonical.
42. **AC42:** D80 produces no D1 head/cache/search/sitemap/social/Navigation
    change and no Vercel/domain/DNS/TLS/deployment/Stripe/money/form/email call.
43. **AC43:** later target publication uses ordinary independent D1 and source
    retirement/move remains a separate owner action.
44. **AC44:** status/error/success are textual/persistent, input survives error,
    uncertain outcome reconciles before retry, and success is not toast-only.
45. **AC45:** keyboard/screen reader/visible focus/touch/forced colors/reduced
    motion and meaningful status announcements work without mouse/hover/color.
46. **AC46:** old/new summaries, fields, long URLs, repairs, and actions reflow at
    320 CSS pixels/400% zoom and support long/CJK/RTL/bidi content.
47. **AC47:** old writers cannot publish a D79 material candidate; mixed code/
    schema/manifest versions fail closed.
48. **AC48:** rollback disables new D80 creation but retains committed target,
    receipt, provenance, repairs, and history; it never re-enables in-place
    material publication.
49. **AC49:** durable history names actor effect, exact source/target revisions,
    route/manifest/repair digests, D81 checkpoint/clean result, outcome, and time without
    storing Page body or sensitive detail.
50. **AC50:** ADRs, glossary, PRDs, OpenSpec, design, tasks, tickets,
    implementation, tests, and release evidence use the corrected universal
    new-Page/no-continuity-advance terminology and representative ministry staff
    complete the full journey without coaching before activation.

## Required proof suite

- **Positive/domain:** exact candidate creates one private Page with fresh
  identities, proposed D2 path, expected content/remaps, repairs, receipt, and
  D81 protected-checkpoint/clean-source result; source public facts are unchanged.
- **Negative/boundary:** unacknowledged source, Article/Phase 22/Giving/form/API/
  auth/protected owner, cross-scope input, same/old/reserved route except the
  exact ADR-0203-qualified source Draft-only Path Claim, unknown
  transfer member, unsafe Media/reference, nonseparable shared dependency,
  active schedule, and missing effect create nothing.
- **Authorization/RLS:** allow/deny across browser, actor port, wrong scope,
  revoked membership/capability, aggregate/detail non-enumeration, views/RPCs,
  security definer, Payload Local API, service role, worker/import/migration/
  support/repair, and both update old/new state.
- **Concurrency/idempotency:** save/lease/publish/D76-D79/route/Trash/Site/locale/
  capability/deploy races; double click; exact replay; same-key/different-input;
  lost acknowledgement; terminal replay; deterministic lock order.
- **Failure:** inject before/after each authoritative write and prove no partial
  target/source result; audit/outbox replay; transaction rollback; remote proof
  timeout before transaction; uncertain UI reconciliation.
- **Provider:** exact admitted Payload build with duplicate/copy-to-locale
  disabled, actor plus `overrideAccess: false`, `overrideLock: false`, no fallback, shared transaction
  request, explicit draft, depth zero, schema/manifest compatibility; Vercel and
  Stripe mocks prove zero calls.
- **Migration/deployment:** clean empty database, additive schema, constraint/
  index validation, old/new compatibility, old-writer fence, shadow/preflight,
  cohort/kill switch, rollback/roll-forward, retained reader/receipt behavior.
- **Performance:** Minimum/Typical/Measured maximum D80 handoff cohorts;
  bounded repair counts; query plans/indexes; no recursive/N+1/network-under-
  lock; contention and fairness within the active D33 Profile version's named
  scenario.
- **UX/accessibility:** exact Hope Relief flow, mixed-edit warning, shared block,
  schedule, collision, permission loss, uncertain response, repairs, refresh/
  back, mobile, keyboard/screen reader, touch, 320px/400%, forced colors,
  reduced motion, long/CJK/RTL/bidi, weak/interrupted network, error/success
  focus, and donor public-no-change observation.
- **Traceability:** machine-check D80-R1-R26 and AC1-AC50 IDs through consolidated
  OpenSpec/design/tasks/tickets/test names and release evidence; scan out stale
  normative `D80 advances continuity` and conditional direct-only language while
  retaining clearly labelled historical alternatives in the decision record.

## Named monitors and required responses

| Signal                                       |                                                                                                                                                                                      Threshold | Owner                             | Required response                                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `d80_existing_page_material_publish_total`   |                                                                                                                                                                                            Any | D1/Public Site Generation on-call | Disable D80/D79 material lane, adverse-fence result, investigate bypass, roll forward safe generation |
| `d80_source_public_fact_changed_total`       |                                                                                                                   Any source route/generation/D78/D79/Nav change in D80 receipt reconciliation | Page domain owner                 | Stop cohort, quarantine command, reconcile from immutable heads, fix owner port                       |
| `d80_target_favorable_before_d1_total`       |                                                                                                                                                                                            Any | Phase 5/D1 owner                  | Adverse-disable target, investigate reader/compiler bypass, require release evidence before resume    |
| `d80_partial_handoff_total`                  |                                                                                                                                                                                            Any | CMS Platform on-call              | Disable command, preserve source, reconcile transaction/receipt, roll forward; no manual row patch    |
| `d80_duplicate_semantic_target_total`        |                                                                                                                                                                                            Any | CMS Platform on-call              | Stop retries/cohort, inspect idempotency/constraint, merge nothing destructively, repair forward      |
| `d80_inherited_authority_total`              |                                                                                                                               Any route/D78/D79/Nav/schedule/public/provider/money inheritance | Page owner plus affected owner    | Quarantine target, block D1, correct manifest and prove full cohort                                   |
| `d80_route_collision_rate`                   |                                                                                                                                   More than 5% after at least 50 eligible attempts in a cohort | Site Product owner                | Review path suggestion/context and collision classes; never auto-suffix or weaken constraint          |
| `d80_nonseparable_or_manifest_block_rate`    |                                                                                                                                              More than 10% after at least 30 eligible attempts | CMS Product plus D8/D23 owners    | Research top cause with staff; add only a proven bounded owner action, not fallback copy              |
| `d80_eligible_abandonment_rate`              |                                                                                                      More than 20% after at least 30 eligible starts, excluding auth/conflict/network failures | Web Studio Product/Design         | Observe representative sessions, improve copy/field order; do not remove invariant or add auto-choice |
| `d80_unresolved_outcome_age`                 | Any receipt older than the exact reconciliation-age cell for its cohort in the active D33 Profile version's named D80 handoff scenario; no cohort may activate with that cell/evidence missing | CMS Platform on-call              | Pause submission, reconcile authoritative receipt, alert, and keep source/target state non-optimistic |
| `d80_privileged_scope_denial_mismatch_total` |                                                                                                                                               Any actor-path deny that privileged path permits | Security/Authorization owner      | Disable privileged writer, investigate grant/RLS/port parity, rotate/contain if exposure occurred     |
| `d80_vercel_or_money_call_total`             |                                                                                                                                                                                            Any | Platform Integrations owner       | Stop command, remove dependency, inspect unintended external effect, replay only after proof          |

The collision, block, and abandonment thresholds are explicit pilot product-
judgment triggers, not claims about industry norms. Safety/isolation/provider-
boundary thresholds are zero by invariant. Performance thresholds come only
from the active D33 Profile version's named D80 scenario and separately proved
numeric cohort cells, not values invented in grooming.

## Ruthless synthesis — strongest path forward

### Resolved before recording D80

1. Accept the founder's new-Page direction.
2. Remove Options 1/2 as runtime branches after a D79 material judgment; routine
   evolution remains in D79 **keeps**.
3. Correct D79/ADR-0200: D80 never advances source continuity and target inherits
   none.
4. Define the result as private same-Site/same-locale `general_page` creation
   with explicit D2 placement and no public route.
5. Reuse the D23 compiler internally while keeping its cross-Site command and
   source-preserving semantics distinct.
6. Block nonseparable shared-owner changes and active schedules rather than
   creating dependency/schedule coupling.
7. Place one old/new continuation in the main Publish review with excellent
   accessibility and no donor/provider UI.

### Required in the consolidated spec/design before implementation

1. Carry D80-R1-R26, I1-I22, AC1-AC50, the state table, logical receipt, exact
   visible copy, proof suite, and monitors.
2. Amend ADR-0199/0200, D77-D79 references, Phase 2/5/12/24, living spec,
   roadmap, proposed Phase 23/OpenSpec/design/tasks/tickets, and glossary.
3. Define the narrow transfer policy profile and exhaustive manifest without a
   generic clone abstraction.
4. Prove the authoritative transaction includes target creation, D81's source
   checkpoint/clean successors/head advances, and lease fences; otherwise D80
   remains unavailable.
5. Name the exact existing Phase 12 effects and D8/D13 owner actions; add no
   access or workflow product.

### Implementation safeguards required before activation

1. Land the accepted Phase 23 Page/locale/placement/working/generation/transfer
   substrate; never retrofit D80 onto current mutable Page rows.
2. Implement database constraints/indexes, semantic idempotency, durable
   receipts/audit/outbox, and hostile privileged-path parity first.
3. Suppress Payload duplicate/copy-to-locale and fence old writers.
4. Shadow compiler/preflight, run complete negative/failure/concurrency/provider/
   migration/performance/accessibility/usability proof, then activate one
   private cohort with kill switch.
5. Keep D80 public/Vercel/money-neutral and later target publication wholly
   ordinary D1.

### Monitor rather than build now

- Do not build semantic diff/AI, purpose metadata, direct-only history branch,
  route resolver, generic clone, bulk replacement, synchronization, workflow,
  or automated old-Page retirement.
- Monitor only the named signals above. Each has a threshold, owner, and
  response; none authorizes weakening identity, tenant, route, or public-safety
  invariants.

## Traceability and repository status

The permanent architectural record is
[ADR-0201](../../adr/0201-material-purpose-changes-create-independent-pages.md).
D80 directly amends the deferred D80 placeholder in
[ADR-0200](../../adr/0200-stable-page-identity-with-purpose-continuity-versions.md):
no source continuity advance occurs. Proposed Phase 23 ADR-0145/0146/0150/0152/
0156/0157/0167/0174/0177 and the proposed `add-web-studio-cms` OpenSpec must be
reconciled on their reviewed PR head before implementation.

Freshly verified repository state remained `HEAD == origin/develop ==
7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; Phase 22 PR #1323 remained
`OPEN/BLOCKED` at `70c50e8c97556c43be5543332fb0993b468b90ab`, and Phase 23
PR #1340 remained `OPEN/BLOCKED` at
`9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`. No runtime, schema, migration,
Supabase policy, OpenSpec delta, ticket, Vercel/DNS/Stripe request, deployment,
or production state changed.

## D84 resolution and branch closure

ADR-0205/D84 settles the fresh target's initial sibling position through D2's
general closed-boundary-or-known-append-last contract against one locked final
baseline. Unknown provenance and a stale explicit boundary require ordinary D2
review. D84 causes no additional source/descendant parent/order write beyond
the sealed D81/D82/D83 effects, preserves the final cohort's relative order,
and changes no Navigation or public result. The D80-D84 handoff branch has no
further founder-level Placement decision. The next action is Phase 24 coverage
and OpenSpec/PRD synthesis, not a D84-specific ordering question.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](../../adr/0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](./phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](../../adr/0204-atomic-source-tree-draft-path-rederivation.md)
- [Phase 24 D83 adversarial review](./phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](../../adr/0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [Phase 24 D82 adversarial review](./phase-24-d82-atomic-draft-path-adoption-adversarial-review.md)
- [ADR-0202 - Atomic material Page handoffs](../../adr/0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [Phase 24 D81 adversarial review](./phase-24-d81-atomic-material-page-handoff-adversarial-review.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](../../adr/0201-material-purpose-changes-create-independent-pages.md)
- [ADR-0200 - Stable Page identity with purpose-continuity versions](../../adr/0200-stable-page-identity-with-purpose-continuity-versions.md)
- [ADR-0199 - Owner-qualified exact ordinary Page succession](../../adr/0199-owner-qualified-exact-ordinary-page-succession.md)
- [Proposed ADR-0167 - Exact Site-owned content and Copy-to-Site drafts](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [Proposed ADR-0177 - Provider-neutral Production Capacity Profile](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0177-provider-neutral-production-capacity-profile-and-vercel-qualification.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Proposed ADR-0152 - Reusable Sections](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0152-family-qualified-semantic-reusable-sections.md)
- [Proposed ADR-0150 - Page families and Page Starters](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed ADR-0145 - Public Site Generations](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [W3C Web Architecture](https://www.w3.org/TR/webarch/#URI-persistence)
- [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Google Site Moves](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google soft 404 guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors#soft-404-errors)
- [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Payload collection config](https://payloadcms.com/docs/configuration/collections)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [WordPress.com Page copy](https://wordpress.com/support/copy-a-post-or-page/)
- [WordPress.com permalinks](https://wordpress.com/support/permalinks-and-slugs/)
- [Contentful entries](https://www.contentful.com/help/content-and-entries/)
- [Blackbaud nonprofit CMS Page copy](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/content_pagebuilder2_pages_copying_existing_page_use_as_model.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Vercel CDN cache](https://vercel.com/docs/caching/cdn-cache)
- [Next.js redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
