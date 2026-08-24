# Phase 23 CMS / Site Planner Dynamic Content Parity — Grooming Decision Log

**Phase:** 23 (`web-studio-cms`)
**Status:** Grooming closed — D1–D36 founder-ratified; specification synthesis
and parent-issue publication authorized; implementation and tickets pending
**Last updated:** 2026-08-24

This is the active decision record for the Phase 23 `web-studio-cms`
`grill-with-docs` session. It is not a PRD, implementation specification,
issue set, provider approval, or authorization to build. Founder-ratified
decisions remain binding unless a later numbered decision explicitly amends
them; later decisions must not silently weaken an earlier ruling.

- **Grooming status:** formally closed by D36; D1–D4 founder-ratified on
  2026-08-15, D5–D11
  founder-ratified on 2026-08-21, D12–D16 founder-ratified on 2026-08-22,
  D17–D27 founder-ratified on 2026-08-23, and D28–D35 founder-ratified on
  2026-08-24; D36 and formal closure founder-ratified on 2026-08-24; no Phase
  23 grooming decision remains unresolved.
- **Predecessor status:** Phase 22's founder-ratified D1–D27 planning contract
  is carried by [PR #1323](https://github.com/Asymmetric-al/core/pull/1323),
  which is open and review-blocked as of this decision. Phase 23 must remain
  congruent with those accepted founder decisions without claiming that Phase
  22 is merged or implemented.
- **Implementation status:** the founder's separate `$to-spec` invocation
  authorizes specification synthesis and parent-spec-issue publication only.
  No Phase 23 runtime implementation, migration, provider qualification,
  release activation, tracer-ticket publication, deployment, or production
  change is authorized by this log.

## D1 — Page-local composition, bounded reuse, and coherent serving generations

**Status:** Ratified and adversarially hardened on 2026-08-15.

> **C-prime-amended-and-hardened (C-prime-R) — one quiet, Page-first
> authoring model with page-local typed composition, deliberate bounded reuse,
> and coherent Site-and-locale serving generations.** One stable Site-scoped
> Page identity has an immutable page family and subordinate BCP-47 locale
> lineages consisting of a separately versioned Editorial Revision—localized
> title, bounded typed page-local composition, and editorial SEO—and a
> separately versioned Page Placement Revision—parent, order, and canonical
> normalized path. Page Placement is a narrow structural Site Plan concept,
> not a staff-visible second document, arbitrary many-to-many graph, or
> requirement for one database row per local block; Web Studio presents one
> accessible Edit → Preview → Publish Page experience. Navigation remains
> independently versioned and references stable Pages rather than copied URLs;
> the page tree does not silently define menus.
>
> Ordinary blocks remain local. A Reusable Section exists only through an
> explicit author action, is code-typed, scoped to the exact Tenant × Site ×
> BCP-47 locale during Phase 23, independently versioned, limited to one reuse
> level, visibly reports every use and consequence, offers plain Change every
> use or Make a local copy behavior, and cannot be destructively removed while
> referenced. A changed Reusable Section alters nothing public until an exact
> successor generation selects that revision. Cross-Site reuse, recursive
> reusable items, arbitrary inheritance, and per-placement workflow are
> excluded.
>
> Every ordinary Publish action quietly prepares an immutable,
> content-addressed successor Public Site Generation for the exact Tenant ×
> environment × Site × BCP-47 locale from the current generation plus only the
> affected dependency closure. It validates current actor authority, scope,
> exact Phase-23-owned revisions, routes and reservations, hierarchy,
> references, renderer compatibility, reach and safety contracts, and required
> artifacts; structurally reuses unchanged versions; compiles bounded public
> projections; and idempotently CAS-advances one small serving head only after
> the complete candidate is ready. One release means one coherent serving
> generation—not a giant mutable Site Plan, full-site rewrite, tenant-global
> lock, cross-locale or Legal-Entity transaction, distributed cache/search
> transaction, manual dependency census, Publish All ceremony, or review of
> unchanged Pages.
>
> Typed dynamic blocks and Phase 22 missionary/project Pages remain references
> to their source owners. Phase 23 may pin their compatible binding, contract,
> and adapter generations, but never copies operational facts, advances a
> source-owned release, freezes independently live Ministry Updates, or
> supersedes Phase 10/22 authority. Current safety, withdrawal, and lifecycle
> narrowing remains immediate and adverse-first. Candidate failure leaves the
> previous generation serving; cache, search, sitemap, CDN, and crawler
> convergence remain separately observable facts; recovery creates a newly
> validated successor from retained safe versions rather than mutating
> history. Saved, scheduled, compiled, activated, cached, searchable, publicly
> visible, and source-authoritative are never treated as the same fact.

### Binding interpretation

- A **Page** is the stable Site-scoped presentation identity. Its page family
  is immutable. A slug, parent, order, locale revision, or public route is not
  the Page's identity.
- One locale's **Editorial Revision** owns localized author-written Page
  meaning, bounded typed local composition, and editorial SEO. It owns no
  route, navigation, operational source fact, or live-serving authority.
- One locale's **Page Placement Revision** owns only the candidate parent,
  order, and canonical normalized path needed by the structural Site Plan. It
  is a semantic version axis behind one Page experience, not a second record
  staff must manage.
- Ordinary blocks are stored locally with the Editorial Revision. Phase 23
  does not create a generic placement graph or a row, independent workflow, or
  version head for every local block.
- A **Reusable Section** is an explicit, shallow exception to local ownership.
  The editor must be able to see where it is used, understand that a shared
  edit affects every use, or detach one use as a local copy. Releases pin exact
  Reusable Section versions; public rendering never resolves a mutable
  `latest` reference.
- A **Public Site Generation** is the immutable, compiled, exact-version
  serving closure for one Tenant × environment × Site × BCP-47 locale. A
  normal one-Page publish remains one ordinary action even though the system
  proves the complete affected closure behind it.
- Activation changes only one small serving head after complete proof. Search,
  sitemap, cache, CDN, and crawler state converge separately and are observed
  honestly; none is the activation authority.
- Navigation is an independently versioned presentation structure using stable
  Page references. Page hierarchy may inform staff, but it does not silently
  create or rearrange a menu.

### Source-of-truth boundaries

| Owner                 | Owns in or across D1                                                                                                                                                        | Does not become                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Phase 23              | General Page identity, Editorial and Page Placement Revisions, Reusable Sections, affected dependency closure, compiled Public Site Generation, and serving-head activation | Operational identity, money, Phase 22 release authority, arbitrary workflow engine, or downstream convergence claim                 |
| Payload adapter       | Qualified content-engine persistence, drafts, versions, and authoring primitives selected by the Phase 23 implementation contract                                           | Public-runtime authority, tenant authorization, Site Plan semantics, or proof that an internal/canary build is production-qualified |
| Phase 22              | Missionary/Project Page identity, release, presentation-family, contributor, reach, subject, and lifecycle contracts                                                        | A generic Phase 23 Page copied into a second workflow                                                                               |
| Phase 10              | Current publication ceiling, restricted-ministry safety, withdrawal, and adverse containment                                                                                | A historical release-time setting that Phase 23 may ignore                                                                          |
| Source-owning domains | Current operational facts exposed through typed, bounded dynamic contracts                                                                                                  | Copied CMS truth or content that Phase 23 may silently freeze                                                                       |
| Public runtime        | Serving only the active compiled, safety-bounded public projection                                                                                                          | Recursive Payload graph traversal, draft resolution, or mutable provider document reads                                             |

### Adversarial hardening

- Route, hierarchy, reference, renderer, scope, locale, safety, and permission
  proof must be structural and machine-verifiable. Read-before-write checks or
  newest-row-wins queries are not integrity controls.
- Reusable Sections are same-Tenant, same-Site, same-locale and one-level only
  in Phase 23. Cross-Site reuse, nested reusable items, arbitrary inheritance,
  and recursive public population are excluded until a later explicit decision
  proves a real need.
- Concurrent candidates compile against expected immutable inputs. Exactly one
  compatible successor may advance the current serving head; stale candidates
  remain inert and must be re-prepared.
- Candidate preparation may be chunked and resumable, but public visibility is
  never partial. Failure preserves the prior safe generation.
- High-fan-out reuse uses bounded impact calculation and structural sharing.
  Adverse safety containment cannot wait behind an ordinary positive rebuild.
- Rollback is a newly validated successor from retained safe versions, never a
  destructive rewrite or unconditional restoration of obsolete Phase 10/22
  content.
- The public boundary consumes a flat, allowlisted compiled projection. Raw
  Payload REST, GraphQL, Admin, relationship depth, plugin hierarchy, or Local
  API defaults cannot become a second public or authorization path.
- Provider qualification, migrations, capacity limits, accessibility, and
  production-shaped race/failure tests remain release gates. D1 selects the
  provider-neutral product contract, not an exact Payload version.

### UX contract

- Ordinary staff see one Page editor with **Edit**, **Preview**, and
  **Publish**, not separate content, placement, dependency, or release records.
- Local edits stay local. Creating or editing reuse is a deliberate action with
  a plain affected-Page count, exact previews, **Change every use**, and **Make
  a local copy**.
- The Site Plan supports a non-drag alternative and correct keyboard/focus
  behavior. Drag-and-drop may enhance, never own, movement or ordering.
- Healthy one-Page publication stays quiet. Only actual blockers or wider
  shared/structural consequences open an accessible, consequence-first review;
  unchanged Pages are not manually re-approved.
- Failure says what remained live, what did not change, the exact cause owner,
  and the next safe action. It never reports `published` merely because a CMS
  draft saved or a provider hook ran.

### Rejected alternatives and prohibited shortcuts

- one Page record that collapses content, route, navigation, publication, and
  operational truth;
- a universal content-item/placement node-and-edge graph;
- one giant mutable Site Plan document or full-site rewrite for every edit;
- nested reusable content, cross-Site reuse, per-block workflow, or manual
  dependency census;
- a tenant-global or cross-locale publication lock;
- an attempted distributed transaction across CMS, search, cache, CDN, and
  operational sources;
- runtime `latest` relationship resolution or raw Payload population;
- tree movement that silently edits menus;
- copying Phase 22 Pages or operational facts into Phase 23; and
- equating saved, scheduled, compiled, activated, cached, searchable, public,
  or source-authoritative state.

### Required proof inherited by the eventual specification

1. A local edit affects exactly one Page; a shared edit identifies and previews
   every affected Page before activation.
2. Making one shared use local preserves its content and removes future shared
   impact; in-use reuse cannot be silently deleted.
3. Missing, draft-only, wrong-Tenant, wrong-Site, wrong-locale, incompatible,
   cyclic, route-conflicting, or reach-ineligible dependencies cannot activate
   or disturb the current generation.
4. Concurrent candidates produce one CAS winner and a clear stale result;
   retry of the winner is idempotent.
5. Public route resolution reads only the exact active compiled generation and
   does not recursively populate provider relationships.
6. Ordering and movement are possible with keyboard and named controls, with
   focus, announcements, previews, and error navigation verified.
7. High-fan-out publication is capacity-tested, observable by generation ID,
   and unable to delay adverse containment.
8. Migration accounts for every source item as local content, explicit reuse,
   owning-domain dynamic reference, redirect, intentional exclusion, or
   quarantined unknown; it never invents collision winners.
9. Restoring retained content cannot restore an obsolete route, withdrawn
   source fact, or now-restricted Phase 22 material without fresh proof.

### Evidence and architectural record

- [D1 official research and full adversarial review](./phase-23-d1-page-local-composition-adversarial-research-evidence.md)
- [Opening CMS/provider benchmark evidence](./phase-23-opening-cms-provider-benchmark-research-evidence.md)
- [ADR-0145 — Page-local composition, bounded reuse, and coherent Public Site Generations](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The shorter candidate wording preserved in the adversarial evidence is
supporting analysis. The complete founder-ratified wording above is the D1
authority.

The canonical Phase 23 nouns in this D1 record are **Page**, **Editorial
Revision**, **Page Placement Revision**, **Site Plan**, **Reusable Section**,
and **Public Site Generation**. Root `CONTEXT.md` synchronization is held until
Phase 22 PR #1323 merges or this work becomes an explicit stack on its reviewed
head, because #1323 already changes the same shared glossary extensively. That
base discipline prevents a develop-based Phase 23 patch from dropping accepted
Phase 22 language; it does not make the terms above provisional.

### Phase 23 D10 precision amendment — 2026-08-21

Founder-ratified D10 is the sole narrow exception to D1's exclusion of
cross-locale transactions. It permits only one already-prepared Site
Presentation Activation to CAS-advance the exact current public-locale head
cohort in one short PostgreSQL transaction. It does not weaken D1's
single-locale rule for ordinary Page, route, Navigation, content, or locale
publication and creates no Site-global serving head. See
[D10](#d10--complete-cohort-all-or-none-site-presentation-activation) and
[ADR-0154](../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md).

## D2 — Staged hierarchical public paths under the D1 serving generation

**Status:** Ratified and adversarially hardened on 2026-08-15.

> **C-prime-amended-and-hardened (C-prime-R) — one locale-exact staged
> hierarchical Public Path model for Phase-23-owned ordinary Pages, activated
> only inside D1’s coherent Public Site Generation.** For one exact Tenant ×
> environment × Site × BCP-47 locale, each candidate Page Placement Revision
> owns one stable parent-Page reference, one bounded local web-address segment,
> sibling order, and the canonical normalized path deterministically derived
> from its candidate ancestor chain under one pinned
> canonicalization-and-reservation contract. A full path is never a separately
> editable truth; Page identity never changes with its address; sibling
> reordering changes no address; and Content Library folders never become
> public URL ancestors.
>
> A move or web-address edit has no public effect until Web Studio proves the
> complete affected descendant closure against the expected active generation:
> current actor and exact scope, parent existence, acyclicity, root validity,
> bounded depth and path limits, same-scope normalized-path uniqueness,
> reserved application routes, typed source-owned route claims, compatible
> references and renderers, and current Phase 10/22 admission. Candidate
> preparation may be private, bounded, resumable, and asynchronous, but remains
> non-authoritative and side-effect-free; the previous complete generation
> keeps serving unless one finished compatible successor idempotently
> compare-and-swaps D1’s sole serving head.
>
> Web Studio presents one quiet Page-tree experience: optional drag-and-drop
> plus equivalent **Move Page**, searchable parent selection, and named ordering
> controls; the current public address remains primary; an after-publish address
> appears only when different; reorder-only work stays quiet; and path-changing
> work receives proportional consequence disclosure—exact old-to-new paths,
> affected-descendant count, continuity status, collisions or reservations, and
> direct owner-labelled repair—without asking staff to inspect generation
> machinery or reapprove unchanged descendants. Large moves may prepare in
> resumable chunks and expose a searchable impact review, but become public all
> at once.
>
> The released hierarchy determines ordinary canonical paths and ordinary
> breadcrumbs. Navigation remains independently versioned and is never
> repositioned or source-mutated by a tree move; stable Page references resolve
> through the successor generation, while literal or unavailable references
> are reported. D2 emits an immutable exact route delta and dependency impact,
> but does not choose redirect type, destination, retention, chain policy,
> tombstone, menu publication, locale enablement or fallback,
> search/sitemap/cache completion, or safety truth. A path-changing activation
> requires the applicable owner’s already-valid route disposition; D2 never
> invents one.
>
> Phase 5 alone resolves and serves the active mapping through the sole
> public-content boundary; Phase 2 supplies Site scope; Phase 24 supplies
> enabled locale, domain, and fallback truth; Phase 10 current safety and
> adverse containment always outrank ordinary release cadence. Phase 22 Public
> Ministry Page routes remain typed, source-owned claims visible but read-only
> to the generic tree: a Phase 23 move cannot rename, redirect, retire, reuse,
> or widen them and instead routes staff to their owning workflow. Phase 29
> continues to own media bytes and file identity, and Phase 30 owns migration
> transport and staging while Phase 23 alone validates and activates target
> Page/path truth.
>
> Migration begins from a complete Site-and-locale census of Page identities,
> current paths, candidate ancestry, reserved and source-owned routes, literal
> links, menu references, and prior route history. Duplicate,
> Unicode-equivalent, ambiguous, missing-parent, cyclic, or source-owned
> conflicts are explicitly resolved or quarantined—never ordered by newest
> row, fuzzy-matched, silently redirected, or activated through dual authority.
>
> This is achieved without live provider-tree authority, arbitrary full-path
> overrides, application-only uniqueness, implicit cross-locale fallback,
> tree/menu conflation, recursive live descendant mutation, manual dependency
> census, giant Site Plan documents, Tenant-global locks, distributed
> transactions, mutable `latest` public reads, cache-as-authority, unsafe
> restricted-route continuity, or destructive rollback.

### Binding interpretation

- A **Page Placement Revision** owns the candidate parent Page, local
  web-address segment, sibling order, and its deterministically derived
  canonical path for one exact locale. Editors never maintain a second full
  path by hand.
- “Site Plan release” names the structural effect inside one D1 Public Site
  Generation. D2 creates no separate release record, serving head, approval
  state, or distributed publication transaction.
- Sibling order is URL-neutral. A parent or web-address change is public only
  when the complete affected descendant closure activates atomically at the
  serving-head boundary.
- D2's exact route delta identifies every changed path and dependency. It does
  not itself decide whether the valid effect is a redirect, transition,
  tombstone, or deliberate absence.
- Ordinary breadcrumbs follow the released hierarchy. Navigation remains a
  separate presentation model: stable Page references may resolve to the new
  route in the successor projection, but the tree never repositions or mutates
  menu source content.
- Content Library organization, Page hierarchy, menus, operational source
  records, and media/file folders remain different concepts even when Web
  Studio presents them coherently.

### Source-of-truth boundaries

| Owner                     | Owns in or across D2                                                                                                                                                | Does not become                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Phase 23 D2               | Ordinary Page placement, hierarchical canonical path derivation, ordinary breadcrumbs, affected descendant closure, exact route delta, and structural release proof | Redirect-policy owner, menu publisher, locale administrator, safety authority, media hierarchy, or migration transport |
| D1 Public Site Generation | The one complete successor generation and sole CAS serving-head activation                                                                                          | A second Site Plan release head or distributed transaction                                                             |
| Phase 5                   | Host/Site resolution and sole governed public route/content reader                                                                                                  | Authoring tree, redirect-policy source, or mutable Payload reader                                                      |
| Phase 10                  | Current publication ceiling, withdrawal, and adverse containment                                                                                                    | A release-time snapshot D2 may override                                                                                |
| Phase 22                  | Specialized Public Ministry Page identity, reach, lifecycle, and route dispositions                                                                                 | A generic Phase 23 Page whose route the ordinary tree may rewrite                                                      |
| Phase 24                  | Enabled Site, locale, domain, and fallback truth                                                                                                                    | An implicit locale fallback invented by D2                                                                             |
| Phase 29                  | Media bytes, file identity, and file organization                                                                                                                   | Public Page path hierarchy                                                                                             |
| Phase 30                  | Import/upload, parsing, mapping, staging, and resumability                                                                                                          | Target Page/path validation or activation authority                                                                    |

### UX contract

- Web Studio shows one Page tree and one **Move Page** action. Drag-and-drop is
  optional; searchable parent selection, keyboard operation, and named order
  controls are equivalent first-class paths.
- A sibling reorder stays quiet because it changes no URL. A slug or parent
  change shows **Currently live** and **After publish** only when different.
- A small move gets one concise, consequence-specific review. A high-fan-out
  move gets a resumable, searchable impact view with exact counts and
  old-to-new paths. Neither requires approval of unchanged descendants.
- Blockers identify the conflicting Page or reservation, its source owner, and
  the exact repair action. Failure says that nothing was published and the
  current Site remains live.
- Single-locale tenants see no locale machinery. A source-owned Phase 22 Page
  routes the editor to its own lifecycle workflow rather than failing silently
  or exposing generic route controls.
- Success reports only the activated Site change. Cache, search, sitemap, CDN,
  and crawler convergence are never presented as already complete.

### Adversarial hardening

- Route normalization and reservations are version-pinned. Same-scope route
  uniqueness and parent scope require structural database guarantees; a
  read-before-write check or newest-row winner is not sufficient.
- The complete candidate cohort is checked for missing parents, cross-scope
  references, cycles, invalid root state, depth and path budgets, normalized
  collisions, source-owned claims, stale inputs, and current safety before
  activation.
- Large descendant fan-out is computed in private bounded chunks while the
  prior generation serves. Activation changes one small authority head, not
  thousands of live route rows.
- Candidate preparation is side-effect-free. External cache, search, sitemap,
  and crawler work cannot run while the authority transaction is held and
  cannot make a partial candidate public.
- Current Phase 10/22 adverse facts are re-proved at activation and deny first
  at the serving boundary. An older generation never resurrects restricted or
  withdrawn content.
- Recovery prepares a newly validated successor from retained versions. It
  does not destructively rewind placement history or restore an obsolete route
  disposition.

### Rejected alternatives and prohibited shortcuts

- a staff-editable full path independent of Page identity and ancestry;
- provider nested-document hooks as live public route authority;
- recursive mutation of every live descendant on a parent move;
- path uniqueness enforced only in application code;
- a second Site Plan publication head or giant mutable Site Plan document;
- tree movement that also rearranges or source-mutates navigation;
- implicit cross-locale fallback or cross-Site ancestry;
- arbitrary tenant route-policy DSLs or reserved-route overrides;
- generic Phase 23 mutation of Phase 22 ministry routes;
- manual descendant census or manual URL-continuity checklists;
- public `latest` reads, cache-as-authority, or partial public activation; and
- rollback that rewrites history or revives an unsafe route.

### Required proof inherited by the eventual specification

1. Canonicalization property tests cover Unicode equivalence, case policy,
   malformed and nested encoding, separators, dot segments, slash policy,
   locale normalization, and bounded lengths.
2. Graph tests reject self-parenting, multi-node cycles, orphans, cross-Site
   parents, invalid root cohorts, excessive depth, and missing exact-locale
   ancestry.
3. Concurrent editors cannot both claim one same-scope normalized path; stale
   candidates remain inert and retries are idempotent.
4. A preparation or activation failure leaves exactly the prior complete
   generation public. Post-activation convergence failures remain repairable
   without reverting the serving head destructively.
5. A 2,000-descendant move has bounded memory, deterministic output, resumable
   preparation, indexed public lookup, and a short activation transaction.
6. Cross-Tenant, cross-Site, cross-environment, and cross-locale parents,
   claims, reads, and commands fail structurally and through authorization.
7. Phase 10 withdrawal and Phase 22 route ownership outrank a generic move and
   cannot be bypassed by a compiled generation, redirect, cache, or restore.
8. Non-drag movement, keyboard/focus behavior, screen-reader announcements,
   mobile parent selection, and blocker navigation pass manual and automated
   accessibility verification.
9. Migration accounts for every current Page, path, literal internal link,
   menu reference, and route history as mapped, retired, or quarantined; no
   collision winner is inferred.

### Evidence and architectural record

- [D2 official research and full adversarial review](./phase-23-d2-page-tree-public-path-authority-research-evidence.md)
- [ADR-0146 — Staged hierarchical public paths under coherent Public Site Generations](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D2 authority.
The research evidence remains supporting analysis and does not independently
expand the decision.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head, because #1323
already changes the same shared glossary. The canonical D2 meaning is recorded
here and in ADR-0146 without overwriting accepted Phase 22 terms.

## D3 — Automatic generation-bound ordinary Page route continuity

**Status:** Ratified and adversarially hardened on 2026-08-15.

> **C-prime-amended-and-hardened (C-prime-R) — automatic,
> generation-bound same-Page continuity with one bounded exact-path repair
> lane.** For one exact Tenant × environment × Site × BCP-47 locale, every
> eligible previously released canonical path of the same immutable Phase-23
> ordinary Page becomes durable code-owned permanent navigation continuity to
> that Page's latest eligible path when the path-changing D2 candidate
> activates inside the same immutable D1 Public Site Generation; all
> Asym-controlled predecessors compile directly to the final stable Page
> reference, remain reserved, and neither expire nor become reusable merely by
> age. Authorized staff see no checkbox, numeric HTTP status, rule priority, or
> second publication: ordinary moves say that old links will keep working,
> branch moves receive one proportional consequence review, and retirement
> defaults honestly to the tenant-branded Page-not-found outcome unless staff
> deliberately choose one currently public, genuinely relevant ordinary Page.
> One quiet **Old web addresses** / **Fix an old web address** lane may bind one
> exact normalized unused source to one stable, eligible ordinary Page
> reference in the same Site and locale; it accepts no arbitrary or external
> URL, wildcard, regex, schedule, query rule, status choice, cross-scope target,
> inferred homepage/sibling/similar successor, reserved application path, or
> Phase-22-owned route. The code-owned permanent response applies only to
> public `GET` and `HEAD`; incoming query parameters are preserved but never
> participate in route identity or destination choice, and fragments are
> outside server claims. Every source has exactly one typed released route
> effect under structural scoped uniqueness and authorization/RLS defense in
> depth; candidates prepare privately, one expected-head CAS activates Page
> paths and continuity together, Phase 10 adverse truth can suppress a
> positive result immediately, Phase 22 D8 remains exclusive, and Phase 30
> only transports exact legacy mappings through the same validator. Payload's
> current v4 redirect plugin is not the product or public-route authority and
> may be used only behind a qualified Asym adapter. Proof or CAS failure leaves
> the current generation live, an ineligible target becomes privacy-safe
> absence, an authority outage emits no guessed permanent outcome, and
> correction advances through a newly proved successor generation—without
> dual route truth, hook-as-publication, redirect chains, open redirects,
> pattern DSLs, automatic homepage fallback, age cleanup, partial activation,
> destructive rollback, full-list request scans, or claims that Asym
> activation means external cache, sitemap, Google, or Bing completion.

### Plain-language product rule

D3 gives staff three—and only three—ordinary Page outcomes:

1. **Move or rename a Page:** old links keep working automatically when the
   same Page's new path is published.
2. **Stop publishing a Page:** visitors see the Site's Page-not-found screen
   unless staff deliberately select a genuinely appropriate replacement Page.
3. **Fix an old web address:** specifically authorized staff may connect one
   exact unused old address to one currently eligible ordinary Page in the
   same Site and locale.

This is not a general redirect console. Staff do not configure redirect
statuses, chains, patterns, priorities, schedules, external URLs, query
transformations, or source-owned routes.

### Route and lifecycle contract

- Every normalized path in one active Tenant × environment × Site × locale
  generation has exactly one typed effect: ordinary canonical Page, automatic
  same-Page continuity, deliberate ordinary-Page repair/replacement,
  privacy-safe absence, reserved/code-owned claim, or source-owned claim.
- The same versioned D2 canonicalizer governs authoring, structural
  uniqueness, migration, candidate compilation, and Phase 5 lookup. Malformed
  input fails validation; no raw-string fallback becomes another identity.
- Automatic continuity is derived only from eligible released canonical paths
  of the same immutable Page. Drafts, autosaves, Payload hooks, newest-row
  selection, and cache events cannot create public route lineage.
- Every Asym-controlled predecessor resolves directly to the current eligible
  destination for fresh requests. D3 intentionally creates no redirect chain
  and never promises that external browsers or crawlers have forgotten an
  older cached permanent response.
- Predecessor paths remain reserved. D3 includes no automatic expiry,
  age-based deletion, reclamation, or reversal that could conflict with an
  externally cached permanent result.
- The manual source is one exact normalized path. Its destination is a stable
  ordinary Page reference—not an editable URL string—within the same scope.
  If that Page later moves, a newly compiled generation resolves the repair to
  its new eligible route. If it retires, becomes unpublished, or becomes
  unsafe, the repair becomes privacy-safe absence rather than following an
  inferred successor transitively.
- A retirement replacement is deliberate editorial meaning. No homepage,
  sibling, newer event, or similar Page is selected automatically. **No
  replacement** is a real not-found outcome, not a soft-not-found redirect.
- Only public navigation `GET` and `HEAD` requests participate. Incoming query
  parameters are preserved unchanged for same-origin navigation but cannot
  select a target and are excluded from broad route telemetry. Mutation
  methods never receive CMS continuity. URL fragments are not received by the
  server and have no D3 guarantee.
- The exact numeric permanent HTTP status is code-owned and provider-qualified;
  staff never choose it. The public effect must remain a server-side permanent
  navigation response compatible with the Phase 5 runtime contract.

### Source-of-truth and provider boundaries

| Owner                     | Owns in or across D3                                                                                                        | Does not become                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Phase 23 D3               | Ordinary same-Page predecessor lineage, exact ordinary repairs/replacements, reservations, and released route effects       | General redirect programming platform, domain-move owner, or Phase 22 route owner                 |
| D1 Public Site Generation | Complete Page/path/continuity candidate and one CAS serving-head activation                                                 | Mutable redirect table, second publication head, or distributed cache transaction                 |
| D2                        | Stable Page identity, candidate hierarchy, canonicalization, complete path delta, and collision/reservation proof           | Redirect-policy owner or public activation by itself                                              |
| Phase 5                   | Sole governed public resolution and code-owned permanent navigation response                                                | Editor, Payload collection browser, or fallback to ambiguous legacy content                       |
| Phase 10                  | Current safety ceiling, immediate withdrawal, and adverse-first containment                                                 | Release-time snapshot that D3 may override                                                        |
| Phase 22 D8               | Specialized Public Ministry Page route lifecycle and privacy-safe dispositions                                              | Generic ordinary Page target/source editable through **Old web addresses**                        |
| Phase 30                  | Exact legacy-map transport, parsing, staging, and resumability                                                              | Target validation, wildcard authority, or activation owner                                        |
| Payload                   | Optional editor persistence, relationships, drafts/versions, and adapter extension points after exact-version qualification | Public resolver, automatic continuity authority, tenant authorization brain, or release authority |

The current Payload redirects plugin is not adopted as the product contract.
Its default global source uniqueness, public reads, custom URL target, optional
status selector, and frontend-owned enforcement do not satisfy Asym's scope,
safety, or generation invariants. Any Payload-backed adapter must remove or
override those defaults, respect authenticated user context with access
enforcement, and feed the same Asym-owned compiler and validator.

### UX contract

- A Page's **Web address** area shows **Current public address**, **After
  publish**, and **Old links will keep working automatically.** There is no
  redirect checkbox, second dialog, or separate redirect publication.
- A branch move shows the exact number of addresses that will change,
  representative mappings, blockers first, and **View all changes**. Large
  sets prepare privately and receive one searchable consequence review; staff
  never approve descendants one by one.
- Unpublishing a released Page states exactly that visitors will see the
  tenant-branded Page-not-found screen. **Choose another Page instead** is a
  secondary, deliberate action; it never defaults to the homepage.
- **Old web addresses** stays out of routine work. **Fix an old web address**
  fixes the Site/locale prefix, accepts one path, and offers a searchable
  eligible ordinary-Page picker by title and current address. Healthy
  automatic predecessors are inspectable as **Protected automatically** but
  not editable or deletable.
- Removing or changing a staff-added repair goes through the same consequence
  review and successor-generation activation. The UI says which old address
  will become not-found; it does not pretend to recall externally cached
  responses.
- Errors name the conflicting address, its current source owner, and the next
  valid action. A stale review requires refresh/rebase, preserves the draft,
  and never silently publishes against a newer generation.
- Dragging is never the only control. Keyboard, touch, screen-reader, 200%
  zoom, focus preservation, responsive layouts, labelled Page selection,
  error summaries, and concise status announcements are release requirements.
- Success reports only the Asym activation. It never claims that CDN caches,
  internal links, sitemaps, search indexes, Google, Bing, bookmarks, or
  previously cached permanent responses have converged.

### Adversarial hardening

- Structural scoped uniqueness and composite references prevent canonical
  Pages, predecessors, repairs, reserved application paths, and Phase 22
  claims from competing for one normalized path. UI read-before-write checks
  remain explanatory only.
- Candidate preparation is private, bounded, resumable, and
  non-authoritative. Page paths and continuity effects activate together
  through D1's expected-head CAS; a loser rebases and revalidates visibly.
- Reserved auth, checkout, API, preview, media, asset, application, and
  source-owned routes cannot become tenant-authored sources or destinations.
  Arbitrary or external destinations are excluded, preventing a general open
  redirect surface.
- Operational route facts remain outside anonymous browser access. Any
  Supabase-exposed storage uses RLS, narrow grants, indexed scope predicates,
  and matching `USING`/`WITH CHECK`; public reads occur only through the
  existing server-owned choke point.
- A high-fan-out move prepares in chunks but activates once. Public resolution
  is one indexed exact lookup, never a per-request full-list scan. Bloom
  filters, Edge Config, pattern engines, table partitioning, or distributed
  route services require measured evidence before adoption.
- Proof or CAS failure leaves the previous complete generation serving. A
  current target-safety failure yields privacy-safe absence. Resolver/authority
  failure never guesses a redirect, canonical Page, cross-system fallback, or
  cacheable not-found result.
- Observability records generation identity, manifest checksum/counts,
  cause-coded validation failures, CAS conflicts, serving-head mismatch,
  route-result class, downstream lag, and bounded high-hit retired-path
  diagnostics. Query strings and protected path histories are not emitted to
  broad telemetry.
- Recovery advances through an append-only, newly proved successor. It never
  destructively deletes route history, rewrites an activated generation, or
  restores an obsolete/unsafe route set.

### Rejected alternatives and prohibited shortcuts

- a redirect checkbox or manual choice for every ordinary Page move;
- automatic homepage, sibling, similar-Page, or newest-event fallback;
- a general redirect collection exposed directly to tenant staff;
- raw/external destination URLs, regexes, wildcards, schedules, priorities,
  status pickers, query rules, transition pages, or pattern precedence;
- Payload plugin records, collection hooks, autosave, draft state, or newest
  row as route/publication authority;
- public route-table reads or Payload Local API calls that bypass access;
- cross-Tenant, environment, Site, locale, or route-family targeting;
- generic mutation, disclosure, redirection, or reuse of Phase 22 routes;
- redirect chains, transitive replacement chasing, path expiry, or accidental
  predecessor reuse;
- full redirect-list scans, static deployment-owned tenant maps, speculative
  distributed routing infrastructure, or cache-as-authority;
- dual write, partial activation, destructive rollback, or silent generation
  rebase; and
- success claims that collapse activated, cached, indexed, discoverable, or
  crawler-converged into one fact.

### Explicit non-decisions

D3 establishes no temporary traffic override, domain-migration redirect,
verified external-destination product, root/home replacement, transition Page,
Page trash/deletion policy, or deliberate old-path reclamation flow. It also
does not select the numeric permanent HTTP status or make cache, sitemap,
search, internal-link, Google, or Bing convergence part of route authority.
Those outcomes cannot appear as implicit defaults; their owning later decision
must preserve D1–D3 and the applicable Phase 10/22/24 boundaries.

### Required proof inherited by the eventual specification

1. One canonicalizer produces equivalent results in authoring, database,
   migration, candidate compilation, and public resolution for Unicode, case,
   separators, dot segments, malformed/nested encoding, query, fragment,
   scheme, protocol-relative, root, and bounded-length inputs.
2. Structural tests reject collisions among canonical Pages, automatic
   predecessors, staff repairs, reserved/application routes, and Phase 22
   claims while allowing the same path safely in another exact scope.
3. Cross-Tenant, environment, Site, and locale reads, writes, Page-ID
   substitution, Payload Local API calls, and anonymous route-table access
   fail through both structural and authorization/RLS enforcement.
4. Three consecutive moves produce direct fresh continuity to the final
   eligible route; chain, loop, reversal, and path-reclamation attempts fail.
5. A repair target may move normally, then become unpublished, retired, or
   unsafe without creating transitive successor inference or protected-data
   disclosure.
6. `GET` and `HEAD` receive the code-owned permanent response; `POST`, `PUT`,
   `PATCH`, and `DELETE` do not. Queries are preserved without participating
   in routing or broad telemetry.
7. Two concurrent route claims and two candidates from one base yield one CAS
   winner; the loser remains inert, preserves its work, and receives a visible
   rebase/review path. Retries are idempotent.
8. A 2,000-descendant move has bounded private preparation, deterministic
   direct mappings, one short activation, and one indexed public lookup with
   no partial public state or full-list request scan.
9. Resolver outage, candidate failure, cache/search/sitemap failure, and stale
   downstream convergence do not change authority or emit a false success;
   recovery is forward-only.
10. Current Phase 10 withdrawal and Phase 22 ownership outrank every ordinary
    route effect, including stale cached predecessor responses landing on the
    destination.
11. Migration gives every existing/static/legacy route exactly one canonical,
    same-Page predecessor, deliberate repair, reserved/source-owned, retired,
    or quarantined disposition; wildcards, external targets, loops, chains,
    ambiguity, and source-owned collisions never import silently.
12. Nontechnical, keyboard-only, screen-reader, touch-only, zoomed, and
    narrow-screen participants complete rename, branch move, retirement, and
    repair; they correctly predict the visitor outcome without understanding
    the word “redirect.”

### Evidence and architectural record

- [D3 current Payload v4 research and full adversarial review](./phase-23-d3-ordinary-page-route-continuity-research-evidence.md)
- [ADR-0147 — Generation-bound automatic ordinary Page route continuity](../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [D2 decision and ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D3 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, migration,
provider adoption, issue publication, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head, because #1323
already changes the same shared glossary. The canonical D3 meaning is recorded
here and in ADR-0147 without overwriting accepted Phase 22 terms.

## D4 — Curated Navigation Revisions with Page-aware assistance under D1

**Status:** Ratified and adversarially hardened on 2026-08-15.

> **C-prime-amended-and-hardened (C-prime-R) — Curated, provider-neutral
> Navigation Revisions with Page-aware assistance under D1:** for one exact
> Tenant × environment × Site × BCP-47 locale, every later-ratified Navigation
> purpose has one stable identity and an immutable semantic revision lineage.
> A Navigation Revision is the provider-neutral content snapshot and digest
> selected by D1—not a mandatory new table, event store, duplicate of Payload
> history, per-item lifecycle, or independently advancing public head—and its
> exact purpose catalog, item vocabulary, destination behavior, and nesting
> limit remain D5 decisions. Navigation alone owns visitor-menu membership,
> menu-local copy, purpose, grouping, and order; D2 Page hierarchy alone owns
> canonical paths and breadcrumbs; D3 owns ordinary Page route continuity; and
> each source phase alone owns whether its destination is eligible for the
> exact public context. Managed internal Page destinations use stable eligible
> references rather than copied URLs, so a Page move can reuse the same
> Navigation Revision while a successor D1 generation resolves the new path
> without silently moving or relabelling the item. The Page workspace exposes
> one scoped, derived Navigation-usage summary and authorized **Add to
> navigation** / **Edit placement** commands into the same expected-revision
> Navigation draft used by the Navigation workspace; it stores no Page-owned
> menu flag, label, parent, position, reverse-placement authority, hook-synced
> copy, or second mutation path. Saving and autosave remain private; exact
> real-renderer preview compiles the candidate; and a Navigation-only change or
> related Page-and-Navigation change becomes public through one ordinary
> Publish action, D1's complete dependency and permission proof, one immutable
> successor Public Site Generation, and one CAS-guarded serving-head advance.
> Planned Page retirement or ordinary unpublish must remove or deliberately
> replace affected Navigation references in that candidate, while current
> Phase 10/22 adverse safety truth suppresses an unsafe public item immediately
> without mutating authored or released history. The public runtime reads only
> the bounded, deterministic, pre-resolved Navigation projection pinned to the
> active generation—never Payload `latest`, raw provider documents, recursive
> request-time population, or N+1 eligibility checks. Exact scope is enforced
> structurally and re-proved through authorization, access control, and the D1
> compiler; expected-revision conflicts retain staff work; failures leave the
> prior complete generation live; recovery is a forward successor; and legacy
> CMS Navigation rows, static header configuration, hard-coded footer links,
> and other public consumers receive a complete exact disposition before one
> surface-authority cutover. Payload Drafts, Versions, relationships,
> validation, and locks may serve as qualified private authoring adapters but
> never define domain release or public truth. Staff receive one quiet ordered
> workspace, Page-aware shortcuts, clear **Live** versus **Draft changes**,
> cause-owned repair actions, responsive exact preview, named non-drag movement
> controls, preserved focus, and one consequence-first Publish action—without
> a Page-tree-generated menu, duplicate Page menu fields, copied managed
> internal URLs, dual writes or reads, provider hooks as publication, a second
> revision system, a second public head, per-item workflow/schedule/audience
> rules, tenant-defined schemas, arbitrary presentation data, unbounded graph
> composition, CRDT machinery, fuzzy migration, partial activation,
> destructive rollback, or a claim that activation proves downstream cache,
> search, sitemap, crawler, or third-party convergence.

### Plain-language product rule

- The Page tree determines where an ordinary Page lives and what its
  breadcrumb means. Navigation determines which eligible destinations staff
  deliberately present, how those items are grouped and ordered, and what
  menu-local wording visitors see.
- **Add to navigation** from a Page is a shortcut into the same Navigation
  draft and command used by the full Navigation workspace. It is not a Page
  toggle, second source of truth, or hook-driven synchronization feature.
- Saving affects only private work. One ordinary Publish action previews and
  activates the exact Page and Navigation consequences through D1 or changes
  nothing publicly.

### Authority and ownership boundaries

| Owner                      | Owns in or across D4                                                                                                                | Does not become                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Navigation Revision        | Menu membership, menu-local copy, later-ratified purpose, grouping, order, stable item identity, and target dependency declarations | Page hierarchy, path owner, safety owner, theme/CSS document, item workflow, or public serving head |
| Page workspace             | Derived scoped usage summary and authorized commands into the canonical Navigation draft                                            | Owner of `showInMenu`, menu labels, parents, positions, or reverse-placement truth                  |
| D1 Public Site Generation  | Exact Page/Navigation/source closure, deterministic compiled projection, preview identity, and one serving-head CAS                 | Giant mutable Site document, second Navigation release, or downstream convergence claim             |
| D2 and D3                  | Ordinary Page hierarchy/path and same-Page route continuity respectively                                                            | Menu membership, label, order, or Navigation publication                                            |
| Phase 10 and source phases | Current public eligibility, adverse safety truth, and source-family reach                                                           | Menu editor or fact copied into Navigation                                                          |
| Payload                    | Optional qualified persistence for private relationships, drafts, versions, validation, and locks                                   | Domain revision definition, authorization shortcut, public reader, or release authority             |

### UX contract

- A Page shows one quiet **Navigation** summary such as **Shown in
  navigation**, **Not in navigation**, **Navigation change ready to publish**,
  or one exact blocker. Healthy state does not expose provider IDs,
  generation IDs, scope keys, or redundant badges.
- **Add to navigation** opens the smallest focused placement flow allowed by
  D5. **Edit placement** opens the exact canonical item. Both use one
  expected-revision application command and preserve work on conflict.
- The Navigation workspace is an ordered previewable outline rather than a
  database table. Dragging may supplement but never replace named movement
  actions; focus remains on the moved item and the result is announced once.
- Preview uses the actual public renderer for the exact candidate Site and
  locale, including desktop and mobile behavior. Publish review says what will
  change and provides direct repair actions for blocked targets.
- Ordinary failure says that nothing was published and the current Site
  remains live. A stale edit says the work is safe and offers comparison; it
  never exposes CAS, provider, or HTTP terminology.
- Public Site navigation uses semantic navigation/list/link/disclosure
  behavior, visible current-location semantics, predictable keyboard and focus
  behavior, reflow, and non-drag controls rather than an application-style
  `menubar` unless a later presentation decision separately justifies and
  fully implements that pattern.

### Adversarial hardening

- Navigation identity and target resolution are exact to Tenant × environment
  × Site × BCP-47 locale. Picker filtering is usability help only;
  authorization, structural/database constraints, access/RLS defense in
  depth, source-owned eligibility, and D1 activation reproof remain mandatory.
- A semantic Navigation Revision is one immutable provider-neutral snapshot
  selected by D1. It does not require an event ledger, a second application
  revision table beside authoritative Payload history, per-item records, or a
  separate release state machine.
- Page-aware assistance reads a derived reverse-placement view and invokes one
  canonical command. It never writes Page-owned menu state or uses Page hooks
  to mutate Navigation.
- Managed internal destinations use stable eligible references. Public paths
  are resolved from the exact candidate generation, so an ordinary Page move
  does not require a menu edit and cannot silently change menu placement.
- The public request path reads only the active generation's bounded compiled
  projection. Provider recursion, `latest` selection, raw document reads, N+1
  eligibility checks, and full-history scans are prohibited.
- Planned retirement or ordinary unpublish must repair the candidate's
  affected references. Current source-owned adverse truth suppresses an unsafe
  item immediately without rewriting authored or released history.
- Expected-revision writes preserve conflicting staff work; deterministic
  compilation and one D1 CAS prevent partial activation. Ordinary failure
  keeps the prior generation serving, and recovery creates a newly proved
  successor.
- Current CMS rows, static navbar configuration, hard-coded footer links, API
  consumers, preview, search, sitemap, and other Navigation readers require a
  complete exact migration disposition and shadow comparison before one
  public authority cutover. No permanent compatibility fallback or dual read
  survives cutover.
- Operational evidence correlates privacy-safe generation and Navigation
  revision identity, exact scope and purpose, compile/CAS outcome, projection
  health, and source-owned suppression cause. Broad telemetry does not receive
  restricted subjects or private draft labels.

### Rejected alternatives and prohibited shortcuts

- Page-tree-generated Navigation as the general product;
- Page `showInMenu`, menu-label, menu-parent, position, or copied-path fields;
- Page hooks, bidirectional synchronization, or separate mutation logic;
- raw managed internal URLs, provider `latest` reads, or static configuration
  as a public fallback;
- a second Navigation revision store, event stream, workflow, publish button,
  serving head, or release ceremony beside D1;
- runtime recursive provider population or request-time eligibility graphs;
- per-item status, schedule, audience expressions, tenant-authored schemas,
  arbitrary presentation/CSS, unbounded recursion, or generic graph editing;
- CRDT or automatic list-merge infrastructure without measured need;
- fuzzy title/slug migration, silent exclusion, partial activation,
  destructive rollback, or indefinite dual authority; and
- success language that collapses activated, cached, indexed, discoverable,
  crawled, or third-party-converged into one fact.

### Explicit non-decisions

D4 does not select the exact Navigation purpose catalog, item type catalog,
destination behavior, duplicate-placement policy, menu-label seeding/divergence
rule, nesting depth, presentation emphasis, external-link/new-context behavior,
locale-copying assistance, or desktop/mobile visual pattern. Those form the
next bounded D5 founder decision. D4 also does not authorize a Payload version,
schema, migration, PRD, ticket, implementation, deployment, or production
change.

### Required proof inherited by the eventual specification

1. Internal destinations survive Page slug and ancestor moves without a
   Navigation edit, while Page hierarchy and menu placement remain visibly
   independent.
2. Page-context and Navigation-context actions invoke one authorized command
   and invariant set; no Page menu field, reverse-owned placement, or hook is
   required.
3. Wrong-Tenant, environment, Site, locale, source family, draft, retired,
   restricted, and incompatible destinations fail through Web Studio,
   application commands, Payload REST/GraphQL/Local API, compilation, and
   public delivery.
4. Navigation drafts, autosaves, provider statuses, restored provider
   versions, raw APIs, static configuration, and stale caches cannot change
   public Navigation.
5. A related Page and Navigation change activates together or not at all; a
   Navigation-only successor can structurally reuse all unchanged D1 inputs.
6. Compile, projection, permission, source, or CAS failure preserves private
   work and leaves the prior complete generation live; repair and rollback are
   forward-only.
7. Planned retirement blocks until references are repaired, while current
   Phase 10/22 adverse truth suppresses unsafe output before ordinary positive
   convergence without disclosing protected details.
8. Concurrent editors receive one successful expected-revision write and one
   clear recoverable stale result; two activation attempts produce one D1 CAS
   winner.
9. Keyboard, screen-reader, touch, zoom, reflow, focus, drag-alternative,
   preview, validation, mobile-navigation, current-location, and disclosure
   behavior pass the repository accessibility gates.
10. Exact installed-Payload adapter tests cover drafts, versions,
    relationships, localization fallback, access, Local API override defaults,
    locks, migrations, and generated integration behavior.
11. Production-shaped capacity proves bounded candidate compilation, derived
    usage lookup, projection size, and public reads without runtime recursion,
    N+1 queries, or whole-history scans.
12. Migration accounts for every CMS Navigation row, item, static header or
    footer fact, and public consumer through exact mapping, intentional
    exclusion, or quarantined exception before one authority cutover.

### Evidence and architectural record

- [D4 current CMS/Payload research and full adversarial review](./phase-23-d4-navigation-publication-research-evidence.md)
- [ADR-0148 — Curated Navigation Revisions under coherent Site generations](../../adr/0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [D3 decision and ADR-0147](../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [D2 decision and ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)

The complete quoted formulation above is the founder-ratified D4 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, migration,
provider adoption, issue publication, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head, because #1323
already changes the same shared glossary. The canonical D4 meanings are
recorded here and in ADR-0148 without overwriting accepted Phase 22 terms.

## D5 — Two bounded Public Navigation purposes with Link-or-Group composition

**Status:** Ratified and adversarially hardened on 2026-08-21.

> **Option B-prime-amended-and-hardened (B-prime-R) — Two scope-exact,
> code-owned Public Navigation purposes with bounded Link-or-Group
> composition:** for each exact Tenant × environment × Site × canonical BCP-47
> locale, **Primary Navigation** and **Footer Navigation** are the only Phase 23
> purposes, and each has D4's one stable identity and immutable,
> provider-neutral semantic revision lineage selected by exact digest into
> D1's one Public Site Generation—never an independently advancing public head.
> One structurally discriminated, ordered, capacity-bounded grammar permits
> only a stable-item-identity **Link** or **Group**. A Link has one trimmed,
> Unicode-normalized visitor label, no children, and exactly one typed
> destination: an eligible stable managed reference qualified by source family
> and complete scope, a small code-owned Site destination resolved by its
> owning capability, or a validated absolute HTTPS external website. A Group
> has a visitor label, no destination, and terminal Links only; Groups cannot
> nest, reference another Navigation, or exceed two visible levels. Primary
> alone permits one optional prominent-action role on a normal top-level Link;
> this is semantic emphasis, not a third item type or tenant styling system.
> Legal links remain ordinary Footer content, while social profiles, search,
> account chrome, breadcrumbs, language switching, in-page anchors, dynamic
> queries, and Phase 22 giving bindings remain source-owned outside D5. The same
> authored labels, grouping, order, and destinations drive desktop and mobile.
> Selecting a managed target seeds **Navigation label — shown to visitors**
> once; later source-title or path changes never overwrite curated copy, while
> the editor shows current target context and offers an explicit **Use current
> page title** action. Duplicate detection uses conservative stable destination
> identity: the same destination is blocked twice within one purpose, except
> that one ordinary Primary Link and its single prominent action may share a
> destination after a quiet warning and explicit confirmation; reuse once in
> each different purpose remains valid. External links open in the same context
> by default; an advanced external-only new-tab choice provides visible and
> assistive warning plus `noopener noreferrer`, and no save or release path
> performs a network fetch. Code-owned limits for top-level items, Group
> children, Footer Groups, total items, labels, and URLs are proved against the
> actual responsive shell, longest supported localized labels, reflow, and
> 200% zoom; they are visible before the limit and are neither copied blindly
> from another product nor exposed as tenant schema knobs. Incomplete items and
> empty Groups may exist only in private drafts; release blocks them with exact
> repair actions. Removing a nonempty Group offers **Move links to top level**
> when capacity permits, consequence-confirmed removal of the Group and Links,
> or cancel—never silent cascading deletion. Planned retirement or ordinary
> unpublish blocks the affected candidate until the reference is repaired or
> deliberately replaced; a later adverse source-safety change immediately
> suppresses the affected public Link and any newly empty Group without
> mutating authored or released history, and creates one cause-owned repair
> exception. Staff use one quiet Navigation workspace with continuously visible
> Tenant, Site, locale, environment, and Draft/Live context; Primary and Footer
> sections; plain-language **Page or site destination**, **External website**,
> and **Group** choices; server-paginated scoped pickers; compact rows showing
> visitor label, destination, resolved path or host, live difference, and one
> exact issue; real desktop/mobile preview; drag as an optional accelerator;
> named Move up/down/into/out controls; retained focus, announcement, and undo;
> and unmistakable **Saved privately**, **Draft changes**, and **Live** states.
> The Page-aware shortcut and full workspace invoke one canonical server
> command that authenticates the actor, reads current authoritative membership,
> resolves the immutable operational Tenant UUID to exactly one CMS tenant,
> re-proves explicit environment, Site, locale, purpose, capability, expected
> revision, structure, capacity, and every target under the complete scope, and
> atomically appends the winning revision or retains the losing draft on a CAS
> conflict. A mutable tenant slug, visible tenant selector, stale token claim,
> Payload role, picker filter, or client-supplied scope never authorizes the
> command; super-admin work still names and audits one exact scope. Payload
> remains a private authoring adapter in the non-exposed `cms` schema, with user
> Local API operations explicitly setting `overrideAccess: false` and mutations
> also setting `overrideLock: false`; Asym does not claim Supabase RLS protects
> a table owner, `service_role`, or `BYPASSRLS` connection. Any future table or
> view deliberately exposed through the Supabase Data API instead receives
> least-privilege grants, indexed exact-scope RLS with explicit read (`USING`)
> and write (`WITH CHECK`) policies, and security-invoker access; anonymous
> visitors read only D1's bounded, pre-resolved active-generation projection.
> D1 re-proves membership, targets, renderer compatibility, revision digests,
> and complete dependency closure immediately before its one serving-head CAS;
> ordinary save, compile, concurrency, or activation failure leaves the prior
> complete generation live and private work recoverable, while recovery is a
> forward successor. Privacy-safe structured evidence distinguishes validation,
> authorization, conflict, compilation, suppression, activation, and
> projection/cache convergence without logging restricted identities or private
> Navigation copy. Current CMS rows, static Header/CTA facts, hard-coded
> Footer/legal facts, placeholders, broken paths, duplicates, and every public
> consumer receive one exact mapped, excluded, or quarantined disposition, a
> production-shaped shadow compile and comparison, and one surface-authority
> cutover—without a Utility purpose, tenant-created purpose or item schemas, raw
> managed-internal URLs, fragments, protocol-relative or credential-bearing
> URLs, fake `#` headings, link-plus-disclosure ambiguity, recursive or
> menu-to-menu graphs, separately authored mobile truth, per-item
> workflow/audience/schedule, arbitrary icon/CSS controls, synchronous
> external-link crawling, public authoring-table reads, per-request relationship
> traversal, Payload `latest` or native Publish as public authority,
> last-write-wins, CRDT/event-sourcing machinery, dual authority, fuzzy
> migration, partial activation, destructive rollback, or a claim that
> activation proves downstream convergence.

### Plain-language product rule

- Tenant staff configure only **Primary navigation** and **Footer navigation**.
  They do not create menu types or manage separate desktop and mobile menus.
- An item is either a visitor Link or a non-clickable Group of Links. If a
  Group needs an overview Page, staff add that Page as an explicit first Link.
- Internal Pages are selected by identity, not pasted by URL. Page moves and
  title changes therefore do not silently break or rewrite curated Navigation.
- Saving preserves a private draft. D1's one ordinary Publish action is the
  only path that can make the exact Navigation revision public.

### Canonical vocabulary and grammar

| Term                             | Binding meaning                                                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primary Navigation**           | The code-owned main visitor-navigation purpose, including at most one semantically prominent top-level Link.                                       |
| **Footer Navigation**            | The code-owned footer-navigation purpose; legal destinations are ordinary Footer Links rather than a special purpose or item type.                 |
| **Navigation Link**              | A stable ordered item with one visitor label and one typed managed, Site-owned, or external HTTPS destination; it has no children.                 |
| **Navigation Group**             | A stable ordered, non-navigating label containing terminal Links only; it has no destination and cannot contain another Group.                     |
| **Managed destination**          | A stable, source-qualified, complete-scope reference whose current public eligibility and resolved route remain owned by its source capability.    |
| **Code-owned Site destination**  | A small registered Site action resolved by its owning capability, not a raw tenant-authored internal path.                                         |
| **Prominent action**             | A presentation role available to one normal top-level Primary Link; it is not an item type, CSS field, workflow, or second destination.            |
| **Navigation capacity envelope** | The versioned, code-owned limits proved for the exact responsive renderer, labels, locale expansion, zoom, reflow, item counts, and nesting depth. |

The terms above are canonical in the Phase 23 record. Root `CONTEXT.md`
synchronization remains held while Phase 22 PR #1323 is open because that PR
modifies the same shared glossary.

### Authority and tenant boundary

| Owner or boundary           | Owns in or across D5                                                                                                                            | Does not become                                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Navigation purpose revision | Purpose-local ordered Link/Group snapshot, visitor labels, stable item identities, grouping, duplicate intent, and exact destination references | Page hierarchy, route owner, source eligibility owner, arbitrary theme data, per-item workflow, or serving head |
| Source-owning capability    | Stable target identity, route resolution, exact public eligibility, and adverse safety truth                                                    | Menu membership, label, grouping, order, or D1 release authority                                                |
| Canonical server command    | Current membership and capability proof, exact scope, structural validation, target reproof, expected revision, atomic append, and audit        | Client-trusted scope, Payload role authority, picker-only authorization, or last-write-wins                     |
| Private Payload adapter     | Qualified authoring persistence, relationship UI, drafts, versions, and locks with explicit override behavior                                   | RLS-protected public API, authorization brain, public truth, or independent Publish authority                   |
| Supabase Data API and RLS   | Least-privilege grants and indexed `USING`/`WITH CHECK` policies for any deliberately exposed future table or view                              | Protection for a table owner, `service_role`, `BYPASSRLS`, or Payload's privileged direct connection            |
| D1 generation/compiler      | Exact revision selection, complete dependency and renderer proof, bounded projection, and one serving-head CAS                                  | Payload `latest`, partial activation, or proof of downstream cache/search/crawler convergence                   |

The immutable operational Tenant UUID is the tenant bridge. A mutable slug,
visible context selector, client-supplied scope, stale token claim, Payload
role, or relationship filter is never authorization. Every ordinary staff and
super-admin mutation names one exact Tenant × environment × Site × locale ×
purpose scope and rechecks current authoritative membership.

### UX and accessibility contract

- One Navigation workspace shows a persistent scope header and only Primary
  and Footer sections. Healthy state stays quiet.
- **Add item** offers **Page or site destination**, **External website**, and
  **Group**. Foreign-scope targets never appear; same-scope invalid references
  appear only when necessary to repair existing intent.
- A compact row shows visitor label, item kind, target title/type, resolved
  path or external host, draft/live difference, and one exact issue. Provider
  IDs and implementation terminology stay hidden.
- Selecting a managed target seeds the visitor label once. Current source title
  and path remain visible context, and **Use current page title** is always an
  explicit action rather than background synchronization.
- Dragging may accelerate ordering but never owns it. Named movement controls,
  retained focus, one accessible announcement, and undo work with keyboard,
  touch, and pointer input.
- Group controls render as accessible disclosures in Primary and as headings
  in Footer. Links remain native anchors, current location uses `aria-current`,
  and ordinary website Navigation never adopts ARIA `menu`/`menubar` behavior.
- Private incomplete items receive direct repair guidance. Removal of a
  nonempty Group never silently removes its children.
- Preview uses the actual candidate compiler and responsive shell. Status copy
  distinguishes **Saved privately**, **Draft changes**, and **Live**.

### Failure, recovery, and observability

- Exactly one expected-revision writer wins. A stale editor keeps their work
  and receives a structured comparison/reapply path; there is no silent merge
  or last-write-wins.
- Planned target retirement or ordinary unpublish blocks the incompatible
  candidate. A post-release adverse safety change suppresses the affected Link
  and any newly empty Group before ordinary positive convergence without
  mutating authored or released history.
- Save, validation, compile, permission, dependency, renderer, or serving-head
  failure leaves the prior complete generation public and private work
  recoverable. Recovery is an audited forward successor.
- Structured, privacy-safe evidence distinguishes scope denial, validation,
  revision conflict, compilation, suppression, activation, projection lag, and
  cache convergence. Broad telemetry contains no private Navigation copy,
  external URL details, tokens, or restricted identities.

### Rejected alternatives and prohibited shortcuts

- a Utility purpose or tenant-created purpose catalog without a proven later
  workflow;
- recursive Groups, menu-to-menu references, mega-menu graphs, arbitrary icons
  or CSS, or tenant-configured capacity limits;
- a Group that both navigates and expands, fake `#` headings, or raw internal
  paths and fragments;
- separately authored desktop/mobile Navigation or device-specific visibility;
- per-item workflow, approval, schedule, audience, or dynamic-query behavior;
- synchronous external-site health checks, request-time provider traversal, or
  arbitrary URL fetching;
- Payload `latest`, native Publish, relationship filters, roles, or access
  defaults as domain or public authority;
- direct anonymous authoring-table reads or a claim that RLS protects privileged
  bypass connections;
- duplicate event sourcing, CRDT/OT machinery, silent auto-merge, fuzzy
  migration, dual authority, partial activation, or destructive rollback; and
- treating activation, caching, indexing, sitemap generation, crawler discovery,
  or third-party convergence as the same fact.

### Required proof inherited by the eventual specification

1. The domain type, server command, import path, compiler, and public renderer
   all reject a Group destination, Link children, nested Group, menu reference,
   unsupported purpose, unsafe URL, or over-capacity candidate.
2. Wrong-Tenant, environment, Site, locale, purpose, source family, draft,
   retired, restricted, revoked-member, and stale-token attempts fail through
   Web Studio, Page-aware commands, Payload APIs, compilation, and public reads.
3. Tenant slug rename or collision cannot alter the immutable operational
   Tenant-to-CMS mapping; missing or ambiguous mappings fail closed.
4. Same-purpose destination duplicates are rejected except for the explicitly
   confirmed ordinary-plus-prominent Primary case; one Primary and one Footer
   use remain valid; external URL equivalence stays conservative.
5. Page title, slug, parent, and path changes preserve stable Navigation intent
   and never silently relabel it; current context and explicit relabeling remain
   available.
6. Incomplete private drafts, nonempty Group removal, target retirement, and
   adverse suppression each preserve history and provide direct, accessible,
   cause-owned repair.
7. Two concurrent editors produce one expected-revision winner and one
   recoverable stale result; concurrent activation produces one D1 CAS winner.
8. Exact desktop/mobile, keyboard, pointer, touch, screen-reader, focus, current
   location, disclosure, 200% zoom, reflow, long-label, and supported-locale
   behavior passes the repository gates.
9. Server-paginated pickers and exact membership/scope queries use production
   indexes; compilation batches the complete closure; public delivery performs
   bounded projection reads with no recursion or N+1 provider population.
10. Payload adapter tests pin user operations to `overrideAccess: false`,
    mutations to `overrideLock: false`, and provider behavior to the qualified
    installed version without treating these settings as the Asym authorization
    model.
11. Privacy-safe operational evidence differentiates denial, validation,
    conflict, compilation, suppression, activation, projection lag, and cache
    convergence without leaking content or protected identity.
12. Migration accounts for every CMS Navigation row, Header/CTA fact,
    Footer/legal fact, placeholder, duplicate, broken path, and public consumer
    through exact mapping, exclusion, or quarantine before a production-shaped
    shadow comparison and one complete authority cutover.

### Evidence and architectural record

- [D5 primary-source research and full adversarial review](./phase-23-d5-navigation-catalog-and-depth-research-evidence.md)
- [ADR-0149 — Bounded Public Navigation purpose and item grammar](../../adr/0149-bounded-public-navigation-purpose-and-item-grammar.md)
- [D4 decision and ADR-0148](../../adr/0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)

The complete quoted formulation above is the founder-ratified D5 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, migration,
provider adoption, issue publication, deployment, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. The canonical D5
terms are preserved here and in ADR-0149 without overwriting accepted Phase 22
language.

## D6 — Two semantic ordinary Page families with bounded Page Starters

**Status:** Ratified and adversarially hardened on 2026-08-21.

> **B-prime-amended-and-hardened (B-prime-R) — Two code-owned semantic
> ordinary Page families with bounded, auditable Page Starters:**
> Phase 23 owns exactly **General Page** (`general_page`, presented to staff as
> **Page**) and **Article** (`article`, presented as **Article**) under D1's one
> stable Site-scoped Page and coherent Public Site Generation contract. Family
> is selected by durable behavior rather than appearance, is immutable in
> ordinary editing, and never absorbs Phase 22-owned Missionary,
> Project/Campaign, or Ministry Update content; Phase 10 remains the
> publication-safety ceiling for every ordinary Page and Article. Page owns
> individually placed, non-stream ordinary content and may be a Site root or
> hierarchy parent; Article owns repeatable dated editorial content, is a
> hierarchy leaf, and is eligible—but not automatically entitled—for later
> chronological discovery, while its exact fields, taxonomy, listing, feed,
> scheduling, SEO, search, and public metadata remain with later bounded
> decisions. One quiet Content workspace asks **Page or Article?** only when
> context has not already established the family, uses short behavioral
> examples, follows with only a small accessible set of exact family-compatible
> Site-authorized **Page Starters**, skips redundant choices, keeps family
> visibly read-only, and exposes focused family-specific editors with clear
> saving, draft, conflict, preview, and release states. A Page Starter is an
> Asym-owned, provider-neutral, exact-version one-time seed applied atomically
> and idempotently to one independent draft after actor, Tenant, environment,
> Site, locale, family, permission, schema, D2 placement/path reservation,
> starter, and referenced-dependency reproof; its typed content receives fresh
> Page-local instance IDs; immutable starter ID plus exact version/digest
> remains inert provenance, and later starter edits or retirement never mutate
> existing Pages. D1 release proof pins the closed family contract and
> compatible compiler/renderer; unknown, stale, cross-family, cross-scope, or
> incompatible input fails the candidate with a cause-owned exception while
> the prior public generation and recoverable draft remain intact. Audit actor,
> approved public byline, editorial display date, first-live release time,
> later-live update time, and technical timestamps remain distinct; no editor
> identity is made public and no chronology is derived from `createdAt` or
> `updatedAt`. Every authoring, preview, version, restore, copy, import, export,
> conversion, migration, and public-projection operation is server-enforced for
> exact scope and current authority; Payload Local API bypass defaults are
> never treated as security, Supabase RLS is never claimed to protect Payload's
> privileged direct-Postgres connection, and D6 does not decide one versus two
> provider collections. A mistaken unreleased draft may be discarded and
> safely recreated; a released family correction requires an explicit
> permissioned, impact-proved migration or create-and-replace operation. Legacy
> Pages, templates, drafts/versions, serializers, references, and Phase
> 22-shaped rows receive one complete, non-overlapping
> adopt/transform/quarantine/retire disposition, shadow proof, and one authority
> cutover. Unknowns quarantine; no title, slug, date, layout, or starter is used
> to infer family. The design includes no open family strings, tenant-authored
> schemas, a family per layout, mutable starter inheritance, client-only
> validation, silent fallback or block dropping, destructive restart,
> ordinary-edit family conversion, editor-derived public authorship, dual Phase
> 22 authority, dual public heads, heuristic migration, or speculative
> feed/search/workflow infrastructure.

### Binding interpretation

- `general_page` and `article` are the complete Phase-23-owned ordinary-family
  catalog at launch. Staff see **Page** and **Article**, never internal keys or
  a tenant-authored content-type selector.
- A **Page** is individually placed, non-stream ordinary content. It may be
  temporary, scheduled, dated, or frequently revised and may act as the Site
  root or a D2 hierarchy parent; none of those traits makes it an Article.
- An **Article** is repeatable dated editorial content with release-order and
  chronological-discovery semantics. It is a hierarchy leaf. D6 creates no
  automatic archive, feed, taxonomy, search, SEO, schedule, notification, or
  public-byline model.
- Family is a required closed fact on D1's stable Page identity and is
  immutable in ordinary editing. A never-released mistaken draft may be
  discarded and safely recreated; a released correction uses a separately
  authorized migration or create-and-replace lane with D2/D3 impact proof.
- A **Page Starter** is a family-compatible, exact-version one-time seed that
  creates an independent draft. Starter ID plus exact version/digest is inert
  provenance for audit and support, not a mutable relationship or source of
  future propagation.
- Landing, About, Contact, Legal/Policy, Resource/Report, and similar purposes
  remain Page Starters or later bounded editorial classifications. FAQ remains
  a block/section unless later evidence proves a distinct lifecycle.
- Missionary, Project/Campaign, and Ministry Update families remain wholly
  Phase 22-owned. A visual resemblance, date, or Page Starter cannot move them
  into Phase 23, and a Phase 22 contributor assignment grants no ordinary
  Article capability.
- Phase 10 remains the current publication-safety ceiling for every ordinary
  Page and Article, including content that mentions restricted people,
  ministries, or locations.
- D6 specifies two logical product families but deliberately leaves one versus
  two Payload collections and the final Postgres topology to implementation
  architecture and migration proof.

### Source-of-truth boundaries

| Owner           | Owns in D6                                                                                                                                                   | Does not become                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Phase 23 D6     | Closed ordinary-family semantics, ordinary family immutability, Page Starter seed contract, family-specific authoring boundary, and migration classification | Exact blocks, Article fields, feed/search/taxonomy, provider collection topology, or Phase 22 family authority |
| D1–D5           | Stable Page identity, local/reusable composition boundary, placement/path, continuity, Navigation, complete Public Site Generation, and one serving head     | A family inferred from route, Navigation, or presentation                                                      |
| Phase 22        | Missionary, Project/Campaign, and Ministry Update identity, contributor, safety, release, audience, giving, progress, and lifecycle truth                    | An ordinary Page or Article selected through a Phase 23 starter                                                |
| Phase 10        | Current publication-safety ceiling and adverse containment                                                                                                   | A one-time release check that ordinary content may later ignore                                                |
| Page Starter    | Exact allowed initial values copied into one independent draft                                                                                               | Live inheritance, shared reuse, family authority, or a second public head                                      |
| Payload adapter | Qualified persistence, drafts, versions, locking, and authoring primitives                                                                                   | Product taxonomy, tenant authorization, public runtime, or an assumed shipped Templates API                    |

### UX contract

- One Content workspace asks **What are you creating?** only when context has
  not already established the family. Family-filtered **New Page** and **New
  Article** actions skip the redundant choice.
- The two choices use plain behavior and examples: **Page — A standalone page
  such as About, Contact, a landing page, or a policy**; **Article — A dated
  story, news item, or other update that belongs in an article list**.
- Only exact family-compatible Site-authorized Page Starters appear. When only
  one sensible Article start exists, creation proceeds directly instead of
  presenting a ceremonial gallery.
- Starter copy explains that it supplies a starting layout and that later
  edits affect neither the starter nor any other Page. There is no ordinary
  “change template” action that implies live inheritance or family conversion.
- Family-specific editors hide irrelevant controls but server validation owns
  integrity. Existing records show one quiet read-only family chip rather than
  a disabled technical select.
- Saving, Saved, save failure, lock, stale conflict, draft-newer-than-live,
  preview, and release states are visibly distinct and programmatically
  announced. Restore creates a new draft and never silently changes live
  content.
- Choice and starter controls are text-labelled, keyboard complete,
  screen-reader comprehensible, non-hover-dependent, touch usable, and
  one-column on narrow screens.

### Adversarial hardening

- Family is never inferred from starter name, block set, title, slug, URL,
  date, visual layout, provider collection, or technical timestamp. Unknown or
  ambiguous input fails closed.
- Page Starter application is one canonical, atomic, idempotent server command
  proving current actor, immutable operational Tenant UUID, environment, Site,
  locale, family, permission, D2 placement/path reservation, exact starter
  version/digest, schema compatibility, and every referenced dependency.
- Seeded typed content receives fresh Page-local instance IDs; provider block
  IDs and stale/cross-scope references are not copied blindly.
- User-context Payload Local API operations explicitly respect access and
  locks where applicable. Payload roles, UI filters, mutable tenant slugs, and
  browser-supplied scope do not authorize commands, and ordinary Supabase RLS
  is not misrepresented as protection for a privileged Payload connection.
- One exhaustive family-aware compiler/public DTO boundary replaces open
  `pageType` strings, `unknown` layouts, divergent serializers, silent fallback,
  and unknown-block dropping. D1 pins a compatible family contract and
  renderer generation before activation.
- Audit actor, optional approved public byline, editorial display date,
  first-live release, latest-live update, and technical creation/update facts
  remain distinct. No staff login identity becomes public by default and
  `createdAt`/`updatedAt` never owns Article chronology.
- Candidate, save, compile, permission, lock, starter, reference, or activation
  failure retains recoverable private work and the prior complete D1 public
  generation. Recovery is a newly proved forward successor.
- Article-scale operations use exact-scope indexes, cursor pagination, bounded
  selects and relationship proof, bounded version retention, and flat compiled
  projections rather than full trees, N+1 population, or mutable inheritance.
- Privacy-safe telemetry carries stable cause code, exact scope, family,
  contract/release generation, starter digest, and correlation identity—not
  page bodies, private drafts, or restricted identities.

### Rejected alternatives and prohibited shortcuts

- one universal optional-field Page whose Article behavior is inferred from
  templates or conventions;
- a family for Landing, About, Contact, Policy, Report, FAQ, Announcement, or
  every visual layout;
- tenant-authored schemas, family strings, template inheritance, nested reuse,
  or a generic low-code content-type builder;
- an ordinary-edit family selector, bulk family mutation, cross-family copy,
  destructive restart, or silent default to Page;
- treating a provider collection slug, Payload role, picker filter, Local API
  default, or native Publish state as product or authorization authority;
- editor-derived public authorship or chronology derived from provider audit
  timestamps;
- generic Articles as a Phase 22 Ministry Update, missionary/project Page, or
  contributor-permission bypass;
- automatically shipping archives, feeds, search, taxonomy, SEO, scheduling,
  notifications, or workflows merely because Article exists;
- heuristic migration, unknown-block dropping, dual serializers, dual public
  heads, dual Phase 22 authority, partial activation, or destructive rollback.

### Required proof inherited by the eventual specification

1. Only `general_page` and `article` pass every ordinary authoring, compile,
   public DTO, import, export, and migration boundary; unknown values fail with
   one stable cause and no public side effect.
2. Family mutation fails through Web Studio, Payload REST/GraphQL/Local API,
   bulk operations, hooks, restore, duplicate, and import. The explicit
   correction lane proves all route, reference, locale, and release effects.
3. Starter application proves exact actor, scope, capability, family, schema,
   starter version/digest, D2 placement/path reservation, references,
   idempotency key, and expected state before creating one independent draft.
4. Starter update, withdrawal, or deletion changes no existing Page; seeded
   content has fresh instance identities and inert exact provenance.
5. Phase 22 families and contributor assignments cannot enter or authorize the
   ordinary-family lane; Phase 10 restrictions can suppress ordinary public
   output without mutating authored history.
6. Public author/byline and Article ordering use later approved source facts,
   never current editor identity or `createdAt`/`updatedAt`.
7. Wrong-Tenant, environment, Site, locale, family, starter, media/reference,
   permission, lock, generation, and provider-contract requests fail through
   every API and UI seam.
8. Unknown or incompatible family/block input blocks candidate compilation;
   the prior public generation and draft remain available, and recovery is
   actionable.
9. Creation, family choice, starter selection, editor context, saving,
   conflicts, restore, preview, and release pass keyboard, screen-reader,
   target-size, mobile-reflow, and status-announcement verification.
10. Article-volume lists use indexed cursor pagination and bounded version
    retention with production-shaped skewed-Tenant query and release proof.
11. Every legacy Page, `pageType`, template, draft/version, block/reference,
    serializer, fixture, route, and Phase 22-shaped row receives one exact
    adopt/transform/quarantine/retire disposition, shadow proof, and one
    authority cutover with no heuristic inference or dual write.
12. The exact Payload cohort is qualified for access, locks, drafts, versions,
    migrations, generated types, and adapter behavior without assuming an RFC
    Templates API or treating the internal build as production-approved.

### Evidence and architectural record

- [D6 modern CMS primary-source research](./phase-23-d6-modern-cms-primary-source-research.md)
- [D6 full adversarial review and proof gates](./phase-23-d6-ordinary-page-family-research-evidence.md)
- [ADR-0150 — Two semantic ordinary Page families with bounded Page Starters](../../adr/0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D6 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, migration,
provider adoption, issue publication, deployment, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. The canonical D6
terms are preserved here and in ADR-0150 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D6 do not decide the exact block catalog; templates and inherited regions;
rich-text and embed contract;
draft/version/autosave/locking details; scheduled publication; dynamic lists;
public search; folders, taxonomies, and trash; forms; generalized media seam;
SEO; locale rollout; multi-Site readiness; audience/cache policy; preview
tokens; exact permission matrix; migration/cutover UX; operational-health
product; production capacity budgets; or exact qualified Payload version. Those
remain founder decisions or evidence-backed implementation proofs and will be
resolved one decision at a time.

## D7 — Small semantic ordinary section catalog with an additive bounded-composition seam

**Status:** Ratified and adversarially hardened on 2026-08-21.

> **B-prime-amended-and-hardened (B-prime-R) — One small, code-owned,
> versioned Semantic Ordinary Section Catalog with closed Page and Article
> profiles and a deliberately minimal additive path to bounded future
> composition:** ordinary Phase 23 content is one provider-neutral versioned
> Composition Document whose initial format has one implicit root and a flat,
> Page-local ordered sequence of sections from Hero, Rich Text, Media, Gallery,
> Call to Action, Cards, FAQ, Quote, and Impact Statistics. Pages receive the
> full qualified catalog; Articles receive only Rich Text, Media, Gallery,
> Quote, and Call to Action. Hero is Page-only, first, and at most one;
> same-kind repeaters are bounded; every launch section, including Rich Text,
> is a leaf; and D1 Reusable Sections remain distinct, visibly shared,
> same-scope, root-only, one-level, and non-recursive references.
>
> Each local section has one opaque instance identity that survives editing
> and movement within its Page/locale revision lineage but is regenerated on
> duplication or cross-Page copy and never becomes authorization, public URL,
> or cross-locale identity; one stable code-owned semantic type; one explicit
> schema version; and typed content. One modular provider-neutral ordinary
> catalog and exhaustive candidate compiler own or prove equivalence across
> family and placement eligibility, server validation, Tenant/Site/locale
> scope, dependency extraction, accessible authoring and rendering, preview,
> public serialization, locale and export behavior, deprecation, direct
> historical migrations, diagnostics, and D1-pinned composition/profile/
> catalog/compiler/renderer compatibility. UI filtering and provider clipboard
> compatibility are assistance only: commands, imports, copy/paste, restores,
> privileged operations, and release compilation reprove the exact actor,
> scope, family, version, references, and cardinality, and copies never carry
> an unproved dependency.
>
> Authors receive one family-filtered chooser with a thumbnail, plain name,
> and purpose-first description for each eligible section; starter-led
> defaults; derived outline labels; synchronized desktop and narrow previews;
> local repair guidance plus one linked issue summary; and drag as an optional
> enhancement alongside accessible Move up, Move down, and Move to actions,
> focus preservation, status announcements, and undo. At the launch catalog's
> size, the chooser adds no categories, favorites, or search. The composition
> layer owns outer width, spacing, grid behavior, heading structure, one
> meaningful DOM and responsive order, and code-owned presentation; section
> content stores no viewport breakpoints, column coordinates, CSS classes,
> parent-specific layout, arbitrary style data, or alternate mobile order. CTA
> uses a typed source-qualified destination, media consumes only its owner's
> privacy-filtered public projection, and Impact Statistics are explicitly
> staff-authored editorial claims with optional public source/as-of context,
> never operational, financial, giving, or accounting truth.
>
> Option C is an intentional but separately researched and ratified evolution:
> a later composition-format and catalog generation may add only a small set of
> named code-owned container node types with explicit family, placement,
> allowed-child, maximum-depth, total-node, responsive-order, accessibility,
> migration, and release contracts. Existing version-1 root sections remain
> valid and are never silently wrapped, reparented, or rewritten. Unknown,
> future-version, family-ineligible, unsafe, unresolved, oversized, or
> renderer-incompatible content blocks only the candidate with an exact
> cause-owned repair path while the prior immutable public generation, raw
> candidate data, and recoverable draft remain intact; released history is
> never migrated on read, and deprecation removes a section from new insertion
> without making qualified existing content disappear. D7 creates no generic
> `children`, parent-pointer or independent-section database tree, rows,
> columns, arbitrary nesting, recursive Reusable Sections, style or breakpoint
> bag, dormant container flag, nested editor, tenant schema builder, plugin
> API, raw HTML/CSS/JavaScript, arbitrary iframe/embed or query surface, copied
> operational truth, silent unknown-block dropping, preview/public divergence,
> public original filenames or metadata, drag-only editing, destructive
> rollback, or promise that current Payload internals are permanent product
> architecture.

### Binding interpretation

- The complete launch catalog is exactly Hero, Rich Text, Media, Gallery, Call
  to Action, Cards, FAQ, Quote, and Impact Statistics. Page receives all nine;
  Article receives only Rich Text, Media, Gallery, Quote, and Call to Action.
- Hero is Page-only, first, and singular. Same-kind repeaters are bounded and
  remain leaf-owned. Rich Text and every launch section remain leaves.
- D1 Reusable Sections are a separate visible, root-level, same-scope,
  one-level, non-recursive reference. They are not ordinary local sections and
  do not introduce nested reuse.
- Version 1 is one flat ordered composition under an implicit root. This is a
  deliberate permanent-valid representation, not a scattered provider-array
  assumption or an accidental promise that composition can never evolve.
- Each local section has stable lineage-local identity, stable semantic type,
  explicit schema version, and typed content. Duplicate or cross-Page copy
  creates a fresh identity and re-proves every reference.
- Impact Statistics are staff-authored editorial claims with optional public
  source/as-of context. They are never live CRM, giving, ledger, financial, or
  accounting truth.
- CTA and media remain references to their owning typed public contracts.
  D7 neither copies operational truth nor exposes raw provider records,
  original filenames, or private metadata.

### Provider and release boundaries

- One provider-neutral ordinary catalog and exhaustive candidate compiler own
  or prove equivalence across provider schema, commands, validation,
  dependencies, preview, public serialization, rendering, export, migrations,
  diagnostics, and tests.
- Payload Blocks, contextual filters, clipboard compatibility, drafts, and
  versions are qualified implementation mechanisms—not Tenant authority,
  public truth, family truth, or D1 release authority.
- UI filtering is assistance only. Every command, API, Local API, import,
  copy/paste, restore, migration, preview, export, and release path enforces
  family, placement, cardinality, exact scope, permissions, versions, and
  dependencies on the server.
- D1 pins one compatible composition format, family profile, catalog,
  compiler, renderer, and migration generation. Unknown or incompatible input
  blocks only the candidate and leaves the prior complete public generation
  live.
- Released history is immutable. Migration creates a proved successor draft;
  it never mutates released content during a read.

### Authoring and accessibility contract

- Page has a nine-choice contextual section chooser; Article has five choices.
  Each has a plain name, representative thumbnail, and one purpose-first “Use
  this to…” description.
- A nine-item catalog does not justify categories, favorites, recents, or
  search. Irrelevant family choices are absent rather than disabled.
- One flat outline provides derived labels, insertion locations, selected and
  issue states, local/shared status, and linked repair guidance. Technical type
  IDs, schema versions, compiler generations, and future containers remain out
  of routine staff UI.
- Dragging is optional. Move up, Move down, and Move to remain keyboard, touch,
  and single-pointer operable with focus preservation and status announcements.
  Removal is recoverable through undo/version history.
- Desktop and narrow previews use the same candidate compiler and public
  renderer or prove semantic equivalence. Code owns meaningful DOM order,
  responsive reflow, headings, outer spacing, and layout.

### Future Option C evolution contract

- Future Option C is intentional but not implemented by D7. It requires a
  separately researched and founder-ratified composition-format/catalog
  generation.
- Only named, code-owned container types may be added, each with explicit
  family, placement, child allowlist, maximum depth, total-node budget,
  responsive/DOM order, accessibility, migration, and release proof.
- Existing version-1 root sections remain valid without automatic wrapping,
  reparenting, destructive conversion, or public-history mutation.
- D7 introduces no generic `children`, parent rows, independent section table,
  recursive storage model, rows/columns, arbitrary style or breakpoint bag,
  nested editor, dormant container flags, plugin API, or tenant schema builder.

### Proof and migration contract

- The catalog must prove exhaustive duplicate-free type, version, serializer,
  renderer, migration, and test coverage.
- Family, Hero placement/cardinality, repeater bounds, scope, identity-copy,
  reference, rich-text allowlist, public-media privacy, and deprecation rules
  must hold across every mutation and read path.
- Preview/public parity, cross-scope denial, stale clients, concurrent edits,
  dependency races, idempotency, release CAS, maximum-shape performance,
  accessibility, and prior-generation recovery are release gates.
- Legacy Hero, Rich Text, Media Feature, CTA, FAQ, Impact Statistics, and
  Testimonial rows receive one explicit transform or quarantine disposition;
  Phase 22 rows remain Phase 22. Source and target control totals must
  reconcile before D1 activation.
- Unknown data is retained privately and explained. It is never guessed,
  defaulted, or silently dropped.

### Rejected alternatives and prohibited shortcuts

- freezing the current shared seven-block prototype as product architecture;
- exposing rows, columns, groups, spacers, wrappers, arbitrary nesting, or a
  presentation block for every visual treatment;
- allowing all Page sections in Articles or inferring family eligibility from
  current content;
- raw HTML, CSS, JavaScript, React, iframe/embed code, arbitrary URLs, plugins,
  generic queries, tenant-authored schemas, or copied operational facts;
- assuming chooser filters, provider clipboard checks, Payload Local API
  defaults, or Supabase RLS protect every Payload path;
- silent unknown-block removal, preview/public divergence, public source
  filenames or metadata, migration-on-read, destructive rollback, drag-only
  editing, or automatic future reparenting; and
- promising that the current internal Payload v4 representation is permanent
  Asym product architecture.

### Evidence and architectural record

- [D7 full research, adversarial review, and proof gates](./phase-23-d7-ordinary-page-block-catalog-research-evidence.md)
- [ADR-0151 — Semantic ordinary section catalog with an additive bounded-composition seam](../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D6 decision and ADR-0150](../../adr/0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D7 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, migration,
provider adoption, issue publication, deployment, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D7's canonical
terms are preserved here and in ADR-0151 without overwriting accepted Phase 22
language.

### Phase 23 D14 additive catalog amendment — 2026-08-22

D14 is the first ratified use of D7's additive catalog-evolution seam. It adds
exactly one source-discriminated **Dynamic Content List** semantic leaf, shown
to ordinary staff as **Content list**, without adding a generic container,
query language, provider record surface, or second catalog authority. The leaf
remains flat in the version-1 implicit root, family-qualified by D7, compiled
through D1, and governed by D14's versioned Dynamic Source Catalog. See D14 and
ADR-0158 for its exact source, intent, public-projection, UX, safety, migration,
and proof contract.

### Remaining grooming coverage

D1–D7 do not decide the complete Rich Text and embed contract; detailed
Reusable Section eligibility, change-impact, and inheritance UX; broader
layout/default inheritance; draft/version/autosave/locking details; scheduled
publication; dynamic lists; public search; folders, taxonomies, and trash;
forms; generalized media; SEO; locale rollout; multi-Site readiness;
audience/cache policy; preview tokens; exact permission matrix;
migration/cutover UX; operational-health product; production capacity budgets;
or exact qualified Payload version. Those remain founder decisions or
evidence-backed implementation proofs and will be resolved one at a time.

## D8 — Family-qualified exact semantic Reusable Sections

**Status:** Ratified and adversarially hardened on 2026-08-21.

> **B-prime-amended-and-hardened (B-prime-R) — Family-qualified exact semantic
> Reusable Sections with presentation-neutral sharing and expressive Page-local
> composition:** every family-qualified D7 leaf except Hero may become one
> explicit, independently versioned Reusable Section containing exactly one
> typed semantic leaf, including its bounded same-kind repeater where defined,
> and bound to one stable subject, exact Tenant × environment × Site × BCP-47
> locale, qualified family/type/catalog/schema generation, and immutable
> revision. A Page may deliberately interleave local and shared leaves in any
> D7-valid order and may use the same subject in more than one valid placement;
> every placement retains fresh stable Page-local identity, and consequence
> views distinguish distinct Pages from exact placements.
>
> The Reusable Section owns shared semantic content and typed source-owner
> references only—never route, SEO, Navigation, Site chrome, Page hierarchy,
> multi-section structure, layout inheritance, style data, or copied
> operational truth—and does not impose one fixed tenant-neutral skin. D8
> preserves a separate versioned presentation-resolution seam: an exact Page
> placement may later select only a compatible named code-owned presentation
> variant permitted by the separately ratified Site Presentation Profile and
> Section Variant contract, without becoming a semantic-content override,
> independent placement workflow, or approval authority. D8 itself creates no
> token catalog, arbitrary style field, CSS/JavaScript lane, tenant component
> schema, or promise that any imagined design is safe no-code configuration.
> D6 Page Starters provide expressive multi-section beginnings as one-time
> local copies, Page-local composition provides selection and order, and D7's
> separately ratified bounded-container evolution remains the only path to
> richer local composition.
>
> Ordinary insertion remains local by default. **Save this section for reuse**
> and **Reuse existing** are deliberate actions. Saving an existing local leaf
> for reuse atomically creates the shared draft and replaces only that exact
> local placement with its reference under one expected-revision command;
> failure leaves the original local leaf intact. Every shared placement is
> visibly labelled with type, Site, locale, exact live/draft state, and separate
> current-public-Page, draft-only-Page, and placement counts; selecting it
> offers exactly **Change every use**, **Make a local copy**, and **View uses**.
> **Change every use** enters one focused accessible shared editor rather than
> casual inline global editing. **Make a local copy** atomically materializes
> the exact selected shared revision as a fresh local D7 section and replaces
> only that reference, permanently removing that placement from future shared
> propagation; failure preserves the reference. Staff without shared-content
> management authority may inspect consequences and make a local copy on an
> otherwise authorized Page but cannot change every use.
>
> A shared draft changes nothing public. Ordinary **Publish Page** pins the
> current released shared revision unless inclusion of a new shared revision is
> explicit; it never promotes another author's unrelated shared draft.
> Creating a Page's first use of a never-released shared subject may offer one
> explicit **Publish Page and shared section** action rather than requiring two
> disconnected publications.
> **Publish shared changes** shows one proportional accessible consequence
> review with exact current public Pages and placements, draft-only uses,
> responsive previews in the actual Site presentation, and cause-owned
> blockers. It compiles the exact successor shared revision with the active
> qualified Page revisions—preserving unrelated Page drafts—inside one
> non-authoritative D1 candidate. Final activation re-proves actor, permission,
> complete scope, locale without unauthorized fallback, family/cardinality,
> exact section and Page revisions, schema/catalog/compiler/renderer/
> presentation compatibility, assets and source projections, current safety,
> complete affected closure, manifest digests, and expected serving head before
> one idempotent CAS. Every qualified public use changes coherently or none
> does; public rendering consumes one flattened exact-version projection and
> never traverses mutable provider relationships.
>
> Retirement removes a shared subject from new selection while preserving
> qualified uses and immutable history; a referenced or ever-released subject
> is not destructively deleted through ordinary UI. Missing, incompatible,
> cross-scope, unsafe, or restored historical references remain explicit
> candidate errors with repair paths, never silent omission, substitution, or
> locale fallback. Restoration and rollback create newly proved successor
> candidates; candidate or provider failure leaves the prior safe generation
> live; Phase 10 adverse privacy/reach containment remains immediate and
> independently authoritative. The public-use graph is owned by D1 manifests;
> indexed reverse-use data is a rebuildable authoring/diagnostic projection.
> Payload Blocks, Relationships, Joins, Versions, drafts, locks, and Local API
> remain qualified adapter mechanisms rather than Tenant, access, scope,
> dependency, or release authority.
>
> D8 therefore creates no shared Hero, narrow arbitrary type subset,
> multi-section shared subject, synchronized Page subtree, recursive reuse,
> cross-Tenant/Site/locale reuse, per-placement semantic override, wrapper or
> folder inheritance, live `latest` reference, partial fan-out, copied Page
> draft, manual dependency census, giant release transaction, repeated Page
> approval, raw HTML/CSS/JavaScript or unqualified embed, inferred legacy
> sharing, destructive rollback, or claim that shared content, Page Starter,
> presentation profile, section variant, Site chrome, or public release are the
> same fact. C-prime remains a future separately researched option only if
> measured demand proves that an exact multi-section assembly must remain one
> synchronized editorial fact across Pages; visual uniqueness alone is not
> that evidence.

### Binding interpretation

- Every family-qualified D7 leaf except Hero is eligible. One Reusable Section
  owns exactly one typed semantic leaf, including its bounded same-kind
  repeater; it is never a synchronized multi-section assembly.
- A Reusable Section is presentation-neutral. Tenant differentiation remains
  available through Page-local composition, D6 one-time Page Starters,
  source-owned media, and a separately ratified Site Presentation Profile and
  compatible code-owned Section Variant contract.
- A Page may place the same shared subject more than once. Every placement has
  fresh stable Page-local identity, while consequence views distinguish Pages
  from placements.
- Shared subjects are exact Tenant × environment × Site × BCP-47 locale
  resources. Cross-scope relationships, fallback, and inferred sharing are
  invalid, not convenience features.

### Authoring and release contract

- Ordinary content remains local by default. Reuse requires an explicit
  **Save this section for reuse** or **Reuse existing** action.
- A selected shared placement exposes the plain-language actions **Change every
  use**, **Make a local copy**, and **View uses**. Global edits use a focused
  shared editor; detachment is atomic and gives the local replacement fresh
  identity.
- Public and draft-only Page counts and exact placement counts are separate.
  Shared-content authority is distinct from otherwise authorized Page editing.
- A shared draft has no public effect. Page publication pins the current
  released shared revision unless inclusion of a new shared revision is
  explicit. The first release may use one explicit combined Page-and-section
  action.
- **Publish shared changes** prepares one D1 candidate from the active Page
  revisions, preserves unrelated Page drafts, proves the complete affected
  closure, and activates every qualified public use coherently through the D1
  expected-head CAS or activates none.

### Safety, lifecycle, and provider boundary

- Retirement prevents new selection but preserves valid references and
  immutable history. Referenced or ever-released subjects are not destructively
  deleted in ordinary UI.
- Missing, incompatible, unsafe, historical, or cross-scope references block
  only the candidate with exact repair guidance. The prior safe generation
  remains live, and recovery produces a newly proved successor.
- D1 manifests own the authoritative public-use graph. Any reverse-use index is
  rebuildable authoring and diagnostic data, never release authority.
- Phase 10 adverse privacy and reach containment remains immediate and
  independently authoritative.
- Payload Blocks, Relationships, Joins, Versions, drafts, locks, and Local API
  are qualified adapter mechanisms only. They do not own Tenant isolation,
  scope, access, dependency closure, or release truth.

### Rejected alternatives and prohibited shortcuts

- a narrow arbitrary allowlist that excludes otherwise family-qualified D7
  leaves;
- live multi-section shared assemblies, synchronized Page subtrees, nested or
  recursive reuse, wrapper or folder inheritance, or per-placement semantic
  overrides;
- embedding route, SEO, Navigation, Page hierarchy, layout inheritance, style
  data, or copied operational truth in the shared subject;
- live `latest` references, partial fan-out, copied Page drafts, manual
  dependency censuses, repeated Page approvals, giant release transactions,
  destructive rollback, inferred legacy sharing, or provider-owned release
  authority; and
- treating visual uniqueness as evidence for synchronized multi-section
  content. C-prime requires a later, separately researched decision supported
  by measured atomic-sharing demand.

### Evidence and architectural record

- [D8 full research, adversarial review, and proof gates](./phase-23-d8-reusable-section-scope-and-propagation-research-evidence.md)
- [ADR-0152 — Family-qualified exact semantic Reusable Sections](../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D7 decision and ADR-0151](../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D8 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D8 terms are
preserved here and in ADR-0152 without overwriting accepted Phase 22 language.

### Remaining grooming coverage

At D8 ratification, D1–D8 had not decided the Site Presentation Profile or
compatible Section Variant catalog and tenant authoring UX; D9 now resolves
that seam. The complete Rich Text and embed contract; broader layout/default
inheritance; draft/version/autosave/locking details; scheduled publication;
dynamic lists; public search; folders, taxonomies, and trash; forms;
generalized media; SEO; locale rollout; multi-Site readiness; audience/cache
policy; preview tokens; exact permission matrix; migration/cutover UX;
operational-health product; production capacity budgets; and exact qualified
Payload version remain founder decisions or evidence-backed implementation
proofs and will be resolved one at a time.

## D9 — Certified Site-bound custom Presentation Packages

**Status:** Ratified and adversarially hardened on 2026-08-21.

> **C-prime-amended-and-hardened (C-prime-R) — Certified, Site-bound custom
> Presentation Packages over portable semantic content and platform-owned
> capability islands:** launch one managed custom-development lane in which Asym
> or an explicitly qualified partner—including AI-assisted development under a
> named human maintainer—may create genuinely bespoke Tenant presentation code
> for an exact environment × Site: custom public chrome, DOM and responsive
> composition, components, D7/D8-compatible section renderers and variants,
> typography, styling, art direction, motion, transitions, progressive loading,
> and native-scroll presentation. Any pre-admission execution of imported or
> AI-produced code is confined to an isolated, disposable nonproduction
> environment without production data or secrets; sandbox success never equals
> certification. Each immutable package version is admitted only from reviewed
> source through a deterministic build and a content-addressed artifact whose
> manifest binds the exact Tenant/Site scope, source commit, provenance, SBOM,
> licenses, pinned dependencies, owner/support window,
> platform/SDK/catalog/compiler compatibility, Page families/locales, component
> registry, public assets/origins, budgets, fallback behavior, and complete
> security, privacy, tenant-isolation, accessibility, reduced-motion,
> responsive/locale, no-JavaScript, visual, performance, donation-handoff, and
> failure-recovery evidence. Package code receives only one versioned serialized
> Public Presentation View Model containing D7/D8 semantic content and
> Phase-5/10-qualified public projections plus narrow canonical platform
> capabilities for privileged interactions; it never receives operational
> records, Supabase/Payload clients, auth, secrets, arbitrary network or server
> authority, money or checkout truth, restricted-worker decisions, or a private
> release head. Radically different visual implementations are permitted, but a
> new semantic content purpose must first enter through D7's separately governed
> additive catalog seam, preserving content portability and a qualified standard
> fallback. Phase 22's Site × specialized-family consistency remains intact,
> Phase 24 alone owns complete Site/package selection and settings UX, and Phase
> 29 alone owns media bytes and qualified public renditions. Tenant staff use a
> quiet brief → actual-content preview/compare → exception resolution →
> design-intent approval flow and see only compatible purpose-named choices in
> ordinary editing; they do not certify code or manage packages. D1 alone pins
> and CAS-activates the exact deployed package, profile, content, assets, and
> code/schema generation; failures preserve the current public generation, and
> fixes, revocations, fallbacks, and rollbacks occur by smallest-scope containment
> and an immutable proven successor. This launches bespoke brand expression
> without runtime code/CSS upload, `eval`, URL modules, arbitrary HTML or
> unreviewed/package-managed third-party scripts, tenant npm/plugin installation,
> a marketplace or production tenant-code sandbox, Payload plugins as isolation,
> package inheritance mazes, package-specific content silos, self-certification,
> direct-model-to-production publication, scroll hijacking, fake loading delays,
> inaccessible motion, obscured giving, silent package substitution, mutable
> production package pointers, or any second public truth or release authority.

### Binding interpretation

- A **Presentation Package** is source-controlled presentation code admitted as
  first-party platform code only after qualification. It is not untrusted
  tenant code, CMS document data, a Payload plugin selected at runtime, a remote
  module, or an executable archive uploaded through Web Studio.
- A package may make Sites genuinely different in chrome, DOM composition,
  components, responsive behavior, typography, styling, art direction, motion,
  progressive loading, and native-scroll presentation. It may supply bespoke
  renderers and compatible named variants for D7/D8 semantic content.
- A package consumes one versioned, serialized Public Presentation View Model
  plus narrow platform capability islands. It never receives Payload,
  Supabase, raw provider or operational records, authentication, secrets,
  arbitrary fetch/server authority, or privileged source truth.
- “Custom components and blocks” means bespoke implementation components and
  renderers over ratified semantic contracts. A new authorable semantic meaning
  requires D7's separately governed additive catalog evolution; opaque
  package-owned content is invalid.
- The package is exact Tenant × environment × Site bound. Cross-Site or
  cross-Tenant reuse requires a separate explicit compatible binding and proof;
  it is never inferred or wildcarded.
- The package version is immutable and content-addressed. No active or retained
  historical generation resolves `latest`, a database-held import path, a
  remote URL, or mutable package code.

### Package authority and protected platform capabilities

A qualified package may own:

- Site chrome and public Page presentation;
- custom React renderers, markup, typography, styling, visual composition,
  responsive behavior, and package-private presentational components;
- compatible renderers and variants for D7/D8 semantic sections;
- distinctive accessible motion, transitions, honest progressive loading, and
  native-scroll enhancements; and
- manifest-qualified fonts/assets and references to Phase-29-qualified public
  renditions.

The package may not own or directly access:

- Tenant resolution, authentication, authorization, Payload or Supabase data
  access, secrets, cookies, filesystem/process APIs, arbitrary network clients,
  server actions, or operational writes;
- money, designation, cart, checkout, consent, receipting, accounting,
  restricted-worker publication, route, canonical, SEO, or source truth;
- raw database or provider models, private staff data, or unfiltered
  person/missionary/project records;
- a new semantic content schema hidden in presentation; or
- an independent publish, deploy, rollback, activation, or serving head.

Canonical platform capability islands own privileged behavior such as Give,
checkout handoff, consent, and qualified forms. A package may compose and
present them but may not copy, replace, obscure, or weaken their authority.

### Manifest, source, and dependency contract

Every package candidate closes over:

- immutable package ID/version, artifact digest, source repository and commit,
  deterministic build identity, and provenance attestation;
- exact Tenant × environment × Site audience and compatible Page families and
  locales;
- named platform steward, maintainer, support class/window, lifecycle state,
  compatibility range, retirement path, and emergency contact;
- exact platform, Public Presentation SDK, semantic catalog, compiler,
  renderer, schema, and Site Presentation Profile generations;
- component and Section Variant registry, public capability requests, assets,
  fonts, reviewed origins, and CSP requirements;
- locked dependencies, SBOM, licenses, and dependency provenance;
- JavaScript, CSS, font, image, route, Core Web Vitals, and motion budgets;
- standard/degraded fallback and no-JavaScript behavior; and
- complete content-fixture, browser, responsive, locale, accessibility,
  privacy, isolation, security, performance, visual, and recovery evidence.

Imports are statically analyzable and restricted to package-local code,
approved presentation APIs, and reviewed pinned dependencies. Package settings
store only bounded validated values against an exact settings schema—never
source, JSX, CSS, JavaScript, executable paths, dependency manifests, or remote
modules. Platform-provided pinned dependencies are preferred; every exception
requires necessity, size, maintenance, license, provenance, vulnerability, and
browser/server-boundary review.

### AI-assisted development contract

- AI may assist design and source authoring, but the named human maintainer must
  understand, review, and own the result.
- Imported or generated code executes before admission only in an isolated,
  disposable nonproduction environment using synthetic or already-public-safe
  fixtures, no production secrets/data, and restricted egress.
- Sandbox success, compilation, preview, or model confidence is not
  certification. AI cannot certify, approve, merge, deploy, or activate code.
- AI-assisted source receives the same type, lint, test, security, dependency,
  license, accessibility, browser, performance, and human-review gates as any
  other source.
- Evidence may record that AI assisted without publishing prompts, private
  tenant material, or model transcripts.

### Accessibility, motion, loading, and public UX contract

- WCAG 2.2 AA, keyboard operation, visible focus, semantic/DOM order, contrast,
  touch targets, zoom/reflow, forced-colors resilience, and reduced-motion
  behavior are platform floors rather than tenant preferences.
- Native document scrolling remains intact. Optional scroll-linked storytelling
  is progressive, preserves keyboard/static access, and never intercepts or
  traps wheel, touch, keyboard, focus, or browser history.
- Essential content, Navigation, and Give are meaningful server-rendered output
  and remain usable when decorative JavaScript, motion, fonts, or assets fail.
- Motion never carries the only meaning, hides LCP content, delays critical
  feedback, changes focus order, or blocks a donation action. Reduced-motion is
  a designed calm state, not indiscriminate zero-duration breakage.
- Loading presentation represents a real wait. It never manufactures delay or
  hides already-ready content behind an ornamental splash screen.
- Public Sites may look and feel radically different, but designation, Give,
  and checkout remain understandable, trustworthy, accessible, and tied to
  canonical platform authority.

### Staff experience and release contract

- Staff enter **Custom-built website experience** for the exact Site and see a
  plain request → brand brief → actual-content preview/compare → exception
  resolution → design-intent approval flow. They do not manage source,
  packages, npm, CSP, or build evidence.
- The private preview identifies exact Site, candidate, affected Page families
  and locales, freshness, desktop/narrow behavior, and reduced-motion behavior.
  Staff approve design intent; platform reviewers certify code and proof.
- Ordinary Page editing remains semantic and quiet. It exposes only compatible,
  demonstrated, purpose-named choices supplied by the active package.
- Deployment makes an admitted package available but not public. D1 alone pins
  the exact deployed package, profile, content, assets, public projections, and
  code/schema generations in a Public Site Generation and activates through
  expected-head CAS after final reproof.
- Unknown, missing, revoked, incompatible, wrong-Site, over-budget, or
  digest-mismatched inputs block the candidate. The system never guesses or
  silently substitutes a package.
- Candidate failure preserves the current public generation. Containment is
  smallest-scope and adverse-first; fixes, revocation, fallback, and rollback
  use an immutable proved successor rather than pointer mutation.

### Certification and observability contract

Every immutable package version must prove at minimum:

1. manifest, schema, exact scope, component registry, owner, support, and
   compatibility closure;
2. deterministic locked build, artifact digest, SBOM, provenance, licenses,
   secret/vulnerability/dependency review, and production source-map posture;
3. forbidden-import and capability boundaries, CSP compatibility, sanitized
   rendering, and declared egress/origin behavior;
4. every declared semantic type and variant across empty, minimum, maximum,
   invalid, historical, missing-media, failed-asset, and no-JavaScript states;
5. cross-Tenant/Site/environment denial and cache-key isolation;
6. Phase-10 negative proof that restricted facts are absent before renderer
   invocation and from HTML, RSC/JSON, metadata, OG output, logs, and evidence;
7. keyboard, focus, screen-reader, contrast, touch, semantic order,
   zoom/reflow, forced-colors, and reduced-motion behavior;
8. long, CJK, RTL where supported, locale-enable-later, missing-translation,
   responsive, mobile, and lower-end device behavior;
9. SSR/SEO/share metadata, deterministic hydration, Navigation, media, Give,
   designation, attribution, and checkout-capability integrity;
10. versioned JavaScript, CSS, font, image, render, LCP, INP, and CLS budgets in
    production-shaped lab evidence and package/generation-tagged field
    monitoring;
11. actual-content preview/public parity and current Phase-22 family-profile
    compatibility without exact-Page or locale presentation forks; and
12. stale candidates, concurrent release, code/deployment skew, package/asset
    failure, revocation, containment, and last-known-good successor recovery.

Errors, Web Vitals, CSP reports, release events, and qualification evidence use
safe opaque Tenant/Site/package/version/digest/generation identifiers without
PII, restricted identity, or rendered content. Certification is exact evidence
for one package artifact and compatible platform generation—not a reusable
badge or claim that built, previewed, qualified, deployed, selected, activated,
cached, or public mean the same fact.

### Rejected alternatives and prohibited shortcuts

- runtime tenant uploads of JavaScript, CSS, React, executable archives,
  component schemas, plugins, remote modules, or npm dependencies;
- `eval`, `new Function`, URL imports, database-held module paths, arbitrary raw
  HTML, unrestricted embeds/scripts/network, direct Payload/Supabase access, or
  package-owned operational writes;
- using Payload plugins, Local API defaults, UI filtering, TypeScript, lint, or
  CSP as a claim of tenant-code isolation;
- a package marketplace, production tenant-code sandbox, self-service plugin
  installation, arbitrary schema builder, package inheritance graph, or
  per-tenant application fork at launch;
- package-specific semantic content silos, mutation-on-read, mutable `latest`
  resolution, silent compatibility fallback, or removal of code still required
  by an active or retained generation;
- direct model-to-production publication, AI self-certification, or treating
  sandbox/build/preview success as correctness;
- scroll hijacking, blank splash screens, fake waits, inaccessible motion,
  LCP-hidden content, obscured giving, or decorative failure that removes
  essential content; and
- any package-owned Site, content, public, checkout, privacy, or release truth.

### Evidence and architectural record

- [D9 full research, adversarial review, UX, architecture, and proof gates](./phase-23-d9-site-presentation-profile-and-section-variants-research-evidence.md)
- [ADR-0153 — Certified Site-bound custom Presentation Packages](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D7 decision and ADR-0151](../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [D8 decision and ADR-0152](../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D9 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D9's canonical
terms are preserved here and in ADR-0153 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

At D9 ratification, D1–D9 had not decided how one Site-scoped Presentation
Profile change becomes coherent across several locale-specific D1 Public Site
Generations; D10 now resolves that seam. The complete Rich Text and embed
contract; broader layout/default inheritance; draft/version/autosave/locking
details; scheduled publication; dynamic lists; public search; folders,
taxonomies, and trash; forms; generalized media; SEO; locale rollout;
multi-Site readiness; audience/cache policy; preview tokens; exact permission
matrix; migration/cutover UX; operational-health product; production capacity
budgets; and exact qualified Payload version remain founder decisions or
evidence-backed implementation proofs and will be resolved one at a time.

## D10 — Complete-cohort, all-or-none Site Presentation Activation

**Status:** Ratified and adversarially hardened on 2026-08-21.

> **C-prime-amended-and-hardened (C-prime-R) — one complete-cohort, all-or-none
> D1 Site Presentation Activation:** for one exact Tenant × environment × Site,
> prepare from the exact current-serving D1 Public Site Generation of every
> locale in one source-owned, revision-pinned public-locale census exactly one
> immutable successor generation that structurally preserves every current
> public Page, translation, Page Placement, route, Navigation membership and
> destination, editorial SEO, designation and giving handoff, Phase-22
> specialized Page release, and source-owned dynamic fact while selecting the
> same exact D9 Presentation Package, Site Presentation Profile Version,
> content-addressed assets/artifacts, and compatible code/schema generation.
> Bind the ordered expected and successor head sets, complete Tenant/Site/locale
> scope, Phase-24 enabled-locale census, proof-only disposition for each enabled
> locale without a public head, package/profile/artifact and deployment digests,
> actor and capability inputs, revocation and Phase-10 ceiling inputs,
> idempotency fingerprint, and production-shaped locale, Page-family,
> accessibility, reduced-motion, no-JavaScript, performance, restricted-safety,
> and exact give-handoff evidence in one immutable content-addressed Site
> Presentation Activation Manifest. Preparation is private, chunked, resumable,
> bounded-concurrency, structurally reused, and non-authoritative; an enabled
> non-public locale is proved but never published, and a Site with no public
> locale gains no public state.
>
> D10 is the sole narrow precision exception to D1's exclusion of cross-locale
> transactions: after every traffic-serving runtime proves it can render both
> the current and candidate closures, one short idempotent transaction on the
> single PostgreSQL primary re-proves and locks the exact Site census fence,
> current actor/capability, Phase-10 safety, D9 admission/revocation, artifact and
> deployment compatibility, manifest, and expected heads in documented stable
> order; proves two-way cohort set equality; CAS-advances every exact existing
> locale head to its sealed successor and verifies the exact returned set; and
> writes one immutable activation receipt plus deduplicated downstream-
> convergence intent—or rolls back all of them. Expensive compilation, Payload
> resolution, user interaction, HTTP/provider calls, deployment promotion,
> cache/search work, and other external effects never occur while locks are held.
> Transient database aborts retry the whole transaction only after bounded fresh
> reproof; semantic staleness requires a new manifest; and a timeout or lost
> acknowledgement is resolved by receipt/vector read-back before retry.
>
> Staff receive one quiet, accessible **Website design** compare-and-review flow
> over exact current public content, with locale/Page-family/device/reduced-motion
> preview, one plain consequence card, cause-owned hard blockers, one
> confirmation, and one **Publish website design** action. Locale controls inspect
> the complete proof but never select a partial rollout; design publication
> cannot copy, publish, reset, discard, or otherwise advance any content or
> translation draft, route, Page visibility, Navigation destination, SEO copy,
> designation, giving destination, locale enablement, or source-owned release.
> The interface distinguishes authoritative **Published** from **Finishing public
> delivery checks**, handles unknown outcomes by inspection, returns healthy
> Sites to a quiet state, and restores an earlier presentation only by preparing
> a newly proved complete successor over today's public content.
>
> The PostgreSQL commit makes D1 authority coherent, not every cache or visitor
> simultaneously current: one request pins one complete generation closure;
> content-addressed assets never mutate; complete old cached responses may remain
> briefly while domain, deployment, CDN/ISR/data/image cache, search, sitemap,
> crawler, and client convergence are separately observed and repaired. Vercel
> Rolling Releases, Skew Protection, deployment rollback, Payload draft/localized
> status, cache invalidation, and provider hooks remain subordinate delivery,
> authoring, or code facts—never participants in or substitutes for D1 authority.
> D9 package revocation and Phase-10 adverse safety remain independently
> immediate and may invoke the pre-qualified safe/degraded presentation and a new
> smallest-scope successor without waiting for an ordinary positive cohort. This
> provides a truthful Site-wide design release without a Site-global presentation
> pointer, second serving head, super-generation, distributed transaction,
> tenant-global lock, per-locale partial apply, manual locale certification,
> mutable readiness flag, runtime `latest`, force-publish path, blind retry,
> destructive rollback, mutable asset replacement, hidden draft side effect, or
> claim that prepared, activated, deployed, cached, searchable, publicly
> verified, and seen by every visitor are the same fact.

### Binding interpretation

- A **Site Presentation Activation Manifest** is an immutable preparation and
  audit closure. Its normalized membership contains one expected head and one
  sealed successor for every exact currently public locale plus one proof-only
  disposition for each enabled non-public locale. It is not a serving head,
  mutable workflow document, Page body store, or readiness flag.
- The **public-locale census fence** is one small Site-scoped coordination
  revision changed by first publication, retirement, or serving-membership
  change. It prevents a new or retired locale from becoming a phantom during
  cutover. It is not public presentation or content authority.
- **Complete-cohort** means exact two-way set equality against the current
  public-locale census, not a hand-maintained checklist, count-only test, or all
  platform locales.
- **All-or-none D1 activation** means one PostgreSQL transaction changes every
  exact expected locale head or commits none. It does not mean simultaneous
  cache, CDN, search, crawler, browser, or worldwide visitor visibility.
- One immutable **activation receipt** makes lost acknowledgements inspectable.
  The same scoped idempotency fingerprint returns the same committed result;
  reuse with different inputs fails.
- **Downstream-convergence intent** is an atomically recorded instruction for
  cache, sitemap, search, and delivery observation after commit. It is not a
  distributed transaction or evidence that those consumers have converged.

### Source-of-truth boundaries

| Owner                             | Owns in or across D10                                                                                                       | Does not become                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| D1 / Phase 23                     | Immutable per-locale generations, expected-head CAS, exact cohort cutover, activation receipt, and request-coherent serving | Site-global presentation pointer, content draft publisher, or claim of worldwide simultaneous visibility |
| Phase 24                          | Enabled-locale configuration and complete Site/locale setup authority referenced by the census proof                        | D1 serving head, presentation release, or reason to auto-publish an enabled locale                       |
| D9                                | Exact package/profile admission, artifact, compatibility, revocation, and qualified safe/degraded presentation              | A serving pointer, runtime `latest`, or authority to bypass D1/Phase 10                                  |
| Phase 10                          | Current public ceiling, withdrawal, and adverse-first containment                                                           | A positive-cohort blocker or historical release-time setting that D10 may freeze                         |
| Payload adapter                   | Drafts, versions, localization, preview, and qualified authoring persistence                                                | Tenant authorization, cohort truth, public head mutation, or release success                             |
| Deployment/cache/search providers | Compatible code availability and separately observed delivery/convergence facts                                             | Participant in the PostgreSQL commit or substitute for D1 authority                                      |
| Public runtime                    | One exact generation closure pinned once per request                                                                        | Mixed old/new closure, raw provider graph, or mutable package/profile lookup                             |

### Adversarial hardening

- Every head, generation, manifest member, package/profile admission, receipt,
  and downstream intent carries complete Tenant × environment × Site scope and
  locale where applicable. Composite unique/foreign keys, exact predicates,
  returned-set proof, explicit grants/RLS, and cross-scope negative tests are
  mandatory.
- Browser roles receive no direct head DML. Current actor, canonical capability,
  Phase-10 safety, D9 admission/revocation, artifact, deployment compatibility,
  census, and expected heads are re-proved at final cutover.
- Candidate compilation, preview, provider calls, network work, and user waits
  happen before locks. The final transaction touches only bounded indexed proof
  rows, the census fence, exact heads, receipt, and downstream intent.
- All multi-row commands use the same documented lock order. Deadlock or
  serialization abort may retry the whole transaction after bounded fresh
  reproof; a changed cohort/head/permission/package is semantic staleness that
  requires a new manifest.
- A lost response is resolved by receipt and active-vector read-back. Sequence
  gaps, wall-clock order, job completion, or provider callbacks are never
  treated as commit proof.
- Every traffic-serving deployment must render current and candidate closures.
  Expand-compatible code ships before activation; old support retires only
  after no active generation or retained client depends on it.
- One request pins one generation closure. HTML/RSC/data and immutable assets
  use complete scope plus generation/package/profile/artifact/runtime identity.
  Complete old and new responses may coexist during convergence; mixed
  generation rendering is invalid.
- Phase-10 and D9 adverse containment remains independently immediate. Restore,
  fallback, and rollback prepare a newly proved successor over current public
  content; no old content, route, permission, or source fact is resurrected.

### UX contract

- Staff see **Website design**, **Current**, **New**, **Review website design**,
  and **Publish website design**—not manifest, cohort, CAS, head, package, or
  deployment administration.
- Preview uses exact current public content and the sealed candidate renderer.
  Locale, representative Page-family, desktop/mobile, and reduced-motion
  controls navigate evidence but never select a partial rollout.
- One consequence card names the Site/domain and affected public-language and
  Page counts, what presentation changes, and that Page text/translations,
  drafts, visibility, URLs, Navigation destinations, SEO copy, designations,
  giving destinations, locale enablement, and publication dates do not change.
- Automatic proof covers the complete cohort. Healthy evidence stays quiet;
  every hard blocker names one plain cause, exact locale/Page family, preview,
  owner, and repair action. There is no force-publish path or repeated locale
  approval.
- Persistent accessible status distinguishes **Published** from **Finishing
  public delivery checks**. Stale failure says nothing changed publicly;
  unknown outcome disables retry while authority is inspected.
- **Restore previous design** means a newly proved presentation successor over
  today's public content. It never restores or discards old drafts, routes,
  Navigation, SEO, designations, or source facts.

### Rejected alternatives and prohibited shortcuts

- locale-by-locale positive design activation, locale selection checkboxes, or
  a partial-apply/**Publish anyway** escape hatch;
- a Site-global presentation head, mutable package/profile pointer,
  super-generation, second public truth, or runtime combination of independent
  heads;
- a distributed transaction, two-phase commit, tenant-global lock, generic
  workflow/flag matrix, provider rollout, or cache invalidation as authority;
- Payload `latest`, private draft content, locale fallback disguised as proof,
  count-only cohort validation, raw client head writes, or caller-supplied actor
  authority;
- compiling, rendering, provider/network work, user interaction, or cache/search
  activity while database locks are held;
- blind retry, sequence/time inference, destructive rollback, mutable asset
  replacement, silent presentation substitution, or deletion of retained audit
  and compatibility artifacts; and
- claiming that prepared, activated, deployed, cached, searchable, publicly
  verified, and seen by every visitor are the same state.

### Required proof inherited by the eventual specification

1. Zero-, one-, typical-, and measured-maximum-locale cohorts either activate
   the exact complete set or leave the complete old set serving.
2. Missing, duplicate, extra, stale, wrong-scope, incompatible, private-source,
   revoked, or permission-ineligible members cannot activate.
3. Concurrent D10 candidates and races with Page publication, first
   publication/retirement, locale change, permission/package revocation, and
   adverse containment produce one safe winner or a typed stale result.
4. Injected failure after the first, middle, or last head update rolls back the
   complete transaction; disconnect and lost-acknowledgement cases are resolved
   through receipt/vector inspection.
5. Anonymous, cross-Tenant, unrelated, insufficient, stale, and revoked actors
   cannot read private candidates or mutate serving authority.
6. Every database snapshot and public request consumes either one complete old
   closure or one complete new closure; delivery/cache failure cannot produce a
   mixed generation or rewrite authority.
7. Base, canary, N-1, cache, search/sitemap, missing-artifact, revocation, and
   successor-recovery behavior is production-shaped and observable by safe
   opaque manifest/generation/deployment identifiers.
8. RTL, CJK, long content, reflow/zoom, keyboard/focus/status, reduced motion,
   no JavaScript, failed assets, restricted publication, and exact
   designation/source/locale/currency giving handoff pass.
9. Page, translation, route, Navigation, SEO, designation, giving, locale,
   Phase-22, and source-owned drafts/releases remain unadvanced by D10.

### Evidence and architectural record

- [D10 full research, adversarial review, UX, database/RLS, deployment/cache, and proof gates](./phase-23-d10-site-presentation-activation-cohort-research-evidence.md)
- [ADR-0154 — Complete-cohort Site Presentation Activation through D1](../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D9 decision and ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D10 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D10's canonical
terms are preserved here and in ADR-0154 without overwriting accepted Phase 22
language.

## D11 — Bounded CMS Rich Text and typed video embeds

**Status:** Ratified and adversarially hardened on 2026-08-21.

> **B-prime-amended-and-hardened (B-prime-R) — one bounded, versioned CMS Rich
> Text Profile with qualified Lexical authoring and typed video embeds:** one
> code-owned, provider-neutral CMS Rich Text Profile Version is the sole
> ordinary Phase-23 Page/Article prose contract. Its version-1 grammar contains
> only root, paragraph, line break, H2–H4, bounded ordered/unordered lists,
> block quote, text with bold/italic, typed internal/HTTPS/email/phone links,
> and one atomic typed YouTube or Vimeo video; it excludes H1/H5/H6, author
> color/font/size/alignment/indentation, underline/strike/sub/sup/code/highlight,
> checklist, table, code block, footnote, rule, manual anchor, upload/image/file,
> arbitrary relationship/provider/embed, generalized Payload block catalog or
> nested composition, reusable section, form/query,
> HTML/Markdown/MDX/CSS/JavaScript, and tenant custom nodes. Rich
> Text remains one D7 semantic leaf, stores no operational or presentation
> truth, and gains new capability only through an additive, separately
> qualified profile version rather than a tenant feature matrix.
>
> The exact-qualified Payload `@payloadcms/richtext-lexical` adapter is the sole
> CMS authoring engine, but Payload features, Lexical JSON, current docs,
> canary/internal v4 behavior, and Tiptap are not public or durable product
> authority. One profile definition governs field features, TypeScript shape,
> backend validation, paste/import, D1 compilation, preview/public render,
> plaintext/search/export, and migration; client controls are guidance, never
> enforcement. Payload/Lexical JSON remains private editable source, while D1
> revalidates the exact source revision and profile, resolves complete-scope
> references, proves the whole-Page outline and package/runtime compatibility,
> and seals one immutable provider-neutral semantic projection pinned with its
> profile/compiler/source/target digests. Tiptap remains purpose-separated and
> never dual-writes or round-trips the same CMS content.
>
> Staff receive one calm keyboard-accessible toolbar—Style, Bold, Italic, Link,
> List, Quote, Video—with semantic labels, responsive controls, undo, inline
> cause-owned repair, and exact final-Package Page preview. Internal links use
> stable eligible same-Tenant/environment/Site/locale Page or Article IDs;
> HTTPS, email, and phone are typed; same-context is default; only external
> HTTPS exposes an advanced new-tab choice; rel/safety output is code-owned;
> empty text, unsafe schemes, raw fragments, wrong-scope/private/retired targets,
> and request-time remote health claims fail. Cosmetic paste cleanup is quiet
> and undoable, while tables, images, embeds, footnotes, code, or other
> meaning-bearing unsupported input is explicitly reviewed before a truthful
> supported-text/plain-text/cancel outcome—never silently deleted, stored as
> unsafe HTML, or logged.
>
> Add video accepts documented YouTube/Vimeo URL shapes but stores only exact
> provider, canonical public resource ID, bounded start time, visible accessible
> title, and a required captions-or-clearly-labeled-equivalent-nearby-text
> disposition; it
> performs no author-URL server fetch and accepts no iframe, script, arbitrary
> query, provider response, token, autoplay, or mutable embed HTML. Public video
> is one responsive code-owned click-to-load component with a local placeholder,
> descriptive title, no autoplay, minimal CSP/sandbox/permissions/referrer
> authority, YouTube privacy-enhanced or Vimeo DNT mode, honest third-party
> privacy copy, and accessible provider-failure fallback; prepared, published,
> loaded, available, captioned, consented, and cookie-free are never conflated.
>
> Backend and D1 proof enforce measured byte/node/depth/list/link/video bounds,
> exact node/mark/attribute grammar, complete Tenant/environment/Site/locale
> scope, current permission and Phase-10 ceiling, safe protocols, whole-Page
> heading structure, accessibility dispositions, and compatible retained
> readers. Unknown, stale, malformed, oversize, unsupported, or newly revoked
> source blocks the affected successor with one repair cause while the last
> compatible public generation continues; read never mutates source, defensive
> fallback prevents a route-wide failure, and correction creates an explicit
> audited successor. Profile or provider change uses pure idempotent
> previewable migration with source/target control totals and never
> auto-publishes. Production adoption requires exact Payload/Lexical version
> qualification and expand-compatible old/new-reader proof—without Payload
> defaults as policy, stable-v4 pretense, raw public Lexical pass-through,
> unsafe HTML sanitizer dependency, SSRF metadata fetch, eager tracking iframe,
> normalized node tables, per-tenant plugins/toggles, generic AST platform,
> blind conversion, destructive migration, dual editor truth, or claim that
> saved, valid, compiled, released, rendered, indexed, remotely available, and
> accessible are the same fact.

### Binding interpretation

- The **CMS Rich Text Profile Version** is the code-owned semantic grammar and
  compatibility contract. It is not a tenant-selectable toolbar matrix,
  generalized block platform, presentation profile, or Payload configuration
  treated as product truth.
- Version 1 is deliberately small and closed. Capability grows through a new
  additive, separately qualified profile version whose readers coexist with
  retained versions; unknown syntax never receives best-effort public meaning.
- Payload/Lexical JSON is private editable source only. The public, preview,
  search, plaintext, and export seams consume one exhaustive provider-neutral
  compiled projection bound into D1—not raw provider JSON or `unknown` values.
- Typed internal links store stable eligible source identity and resolve their
  public route during exact-scope compilation. Typed external, email, and phone
  links carry only the semantics allowed by the profile.
- A typed video is semantic content data, not stored iframe markup, arbitrary
  oEmbed state, uploaded media custody, a provider-health assertion, or consent
  proof. YouTube and Vimeo are the complete initial provider catalog.
- Heading correctness is proved over the complete compiled Page. The Page title
  owns H1; an isolated Rich Text leaf cannot decide document-outline validity.
- Phase 22 Ministry Pages, Project/Campaign Pages, and Ministry Updates keep
  their own D20 content catalogs and no-embed boundary. D11 does not widen or
  migrate those specialized authoring contracts.

### Source-of-truth boundaries

| Owner                   | Owns in or across D11                                                                                                                | Does not become                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| D11 / Phase 23          | Ordinary Page/Article prose grammar, typed links/video, semantic validation, provider-neutral compilation, and profile compatibility | Presentation styling, operational truth, arbitrary embeds, generalized media, or a second release authority |
| D1                      | Exact source/profile/compiler proof, complete reference resolution, immutable public projection, serving generation, and release CAS | Rich Text editor state, provider JSON authority, or request-time content compiler                           |
| D7/D8                   | Family-qualified semantic leaf admission and bounded local/reusable placement                                                        | Nested Rich Text composition, provider node grammar, or an embed marketplace                                |
| D9                      | Qualified Presentation Package rendering of the semantic projection                                                                  | Rich Text meaning, source persistence, or permission to reinterpret unknown nodes                           |
| Phase 10                | Current public ceiling, restricted-ministry safety, withdrawal, and adverse containment                                              | Historical setting frozen by an editor save or D11 profile                                                  |
| Phase 22                | Specialized Ministry Page, Project/Campaign Page, and Ministry Update content/release authority                                      | Ordinary Phase-23 Rich Text widened by D11                                                                  |
| Phase 24                | Site locale lifecycle and translation status                                                                                         | Rich Text grammar, automatic fallback, or cross-locale source copying                                       |
| Phase 29                | Generalized file/media custody and transformation                                                                                    | D11 external video identity or arbitrary Rich Text upload lane                                              |
| Payload/Lexical adapter | Qualified authoring persistence, editing primitives, source JSON, and provider migrations                                            | Public semantic contract, tenant authorization, final validation, or public renderer                        |
| YouTube/Vimeo           | Remote video delivery after visitor action                                                                                           | Stored source truth, accessibility proof, availability guarantee, or public-page authority                  |

### UX contract

- The default authoring surface shows only **Style**, **Bold**, **Italic**,
  **Link**, **List**, **Quote**, and **Video**, with semantic labels, keyboard
  operation, responsive disclosure, undo, and exact final-Package Page preview.
- Paste preserves supported meaning. Purely cosmetic cleanup may be quiet and
  undoable; tables, images, embeds, code, footnotes, or other unsupported
  meaning require one explicit supported-text, plain-text, or cancel choice.
- Internal links use a scoped Page/Article picker instead of raw public paths.
  External HTTPS, email, and phone are clearly distinguished; unsafe or
  ineligible destinations receive one cause-owned repair message.
- **Add video** accepts a YouTube or Vimeo URL and asks only for the visible
  accessible title, optional start time, and truthful captions or nearby-text
  disposition. It never asks staff to paste embed code or understand CSP.
- Public video reserves responsive space, remains inert until visitor action,
  does not autoplay, explains the third-party privacy boundary honestly, and
  preserves a useful accessible outbound-link fallback when playback fails.
- Healthy documents remain quiet. Unsupported or stale content blocks only the
  affected successor, preserves the live generation, and identifies the exact
  leaf and repair rather than failing the whole route without explanation.

### Rejected alternatives and prohibited shortcuts

- unqualified global Payload `lexicalEditor()` defaults, a full toolbar, or a
  tenant-by-tenant Rich Text feature matrix;
- raw Lexical JSON or Payload block configuration as the public contract;
- Tiptap and Lexical dual-writing, round-tripping, or editing the same source;
- arbitrary iframe/oEmbed/HTML/Markdown/MDX/script/CSS, generic Payload Blocks,
  custom tenant nodes, or request-time metadata fetch;
- uploaded video bytes, generalized file handling, or Phase-29 custody hidden
  inside Rich Text;
- path-stored internal links, blind provider availability checks, autoplay,
  eager tracking players, mutable embed HTML, or claims of cookie-free delivery;
- UI-only restrictions, silent meaning loss on paste, unknown-node fallback,
  read-time mutation, destructive migration, or auto-publication after convert;
  and
- per-node relational normalization, a generic AST platform, plugin marketplace,
  or generalized real-time collaboration system introduced by D11.

### Required proof inherited by the eventual specification

1. Every permitted node, mark, attribute, link, and video round-trips through
   authoring, backend validation, D1 compilation, preview/public render,
   plaintext, search, export, and migration with identical meaning.
2. Every disallowed, malformed, unknown, oversize, unsafe, stale, revoked, or
   wrong-scope value fails through UI, API, import, fixture, and migration with
   one typed cause and cannot enter a public generation.
3. Internal references reject cross-Tenant, environment, Site, locale, private,
   retired, and missing targets; safe external schemes reject smuggling and
   control-character variants.
4. Word, Google Docs, LibreOffice, plain-text, malformed, huge, RTL, CJK, emoji,
   table, image, embed, code, and footnote paste fixtures preserve supported
   meaning, expose unsupported meaning, remain undoable, and never log content.
5. YouTube/Vimeo URL variants, lookalike hosts, start-time bounds, captions or
   equivalent-text dispositions, CSP/sandbox/referrer controls, no autoplay,
   no JavaScript, provider failure, keyboard, screen-reader, reflow, and reduced
   motion pass.
6. Exact minimum, typical, and measured-maximum documents meet edit, autosave,
   compile, render, extraction, search, migration, bundle, and Core Web Vital
   budgets without eager player cost.
7. Profile migration is pure, idempotent, previewable, control-totalled, and
   successor-only; retained old/new readers preserve drafts and the last public
   generation through rollback and deployment skew.
8. Anonymous, unrelated, wrong-Tenant, insufficient, stale, and revoked actors
   cannot read or mutate source; server-side Payload access never silently
   defaults to privileged override.
9. Phase-22 specialized content, operational facts, presentation styling,
   generalized media, locale status, and public serving authority remain with
   their owning decisions.

### Evidence and architectural record

- [D11 full research, adversarial review, UX, security, migration, and proof gates](./phase-23-d11-rich-text-and-typed-video-embed-research-evidence.md)
- [D11 Payload/Lexical primary-source qualification note](./phase-23-d11-payload-lexical-primary-source-research.md)
- [ADR-0155 — Bounded, versioned CMS Rich Text Profile and typed video embeds](../../adr/0155-bounded-versioned-cms-rich-text-profile-and-typed-video-embeds.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D7 decision and ADR-0151](../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [D9 decision and ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D11 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D11's canonical
terms are preserved here and in ADR-0155 without overwriting accepted Phase 22
language.

## D12 — Bounded editorial working revisions and recoverable active editor

**Status:** Ratified and adversarially hardened on 2026-08-22.

> **B-prime-amended-and-hardened (B-prime-R) — one quiet, bounded,
> server-acknowledged Editorial Working Revision contract with one recoverable
> active editor:** every D12-admitted Phase-23 editable resource has exactly one
> private server-authoritative Working Revision, one renewable Active Editor
> Lease enforced as the one atomically unique current lease for the exact
> Tenant × environment × Site × BCP-47 locale × typed resource, with actor and
> editing session as its owner and one monotonically changing Lease Generation
> as its fencing token, and one opaque expected Source Revision. The current
> lease generation is required by every renewal, save, takeover, restore, and
> other mutation so a displaced or expired session cannot act through an old
> token. A short explicit platform-owned idle debounce serializes and coalesces
> autosave into at most one rolling recovery version; every UI, REST, Local
> API, import, migration, AI-accept, restore, or cause-owned system mutation
> re-proves exact scope, current actor and permission, current Phase-10 ceiling
> where
> applicable, lease or explicit audited override authority, schema/profile and
> reference compatibility, idempotency key, expected revision, and acknowledged
> content identity before atomically advancing the Working Revision and
> returning one exact revision receipt. A lease coordinates people but never
> replaces CAS; same-user tabs remain distinct sessions; no stale write, raw
> provider call, blind retry, or last-write-wins path is allowed.
>
> Working Revision is a shared behavioral contract, not one fused document:
> Page/Article Editorial source, D1 Page Placement, D4 Navigation, D8 Reusable
> Section, and any other admitted source-owned resource retain separate revision
> identities, permissions, leases, commands, and publication dependencies. A
> prose autosave never moves a Page, rewrites Navigation, changes a shared
> section, switches a D9 package, or changes Phase-22 operational or specialized
> content truth implicitly.
>
> Ordinary Web Studio authoring exposes one persistent accessible status control
> beside Preview and D1's publication action—**Unsaved changes**, **Saving…**,
> **Saved just now**, **Published · Unpublished changes**, or one
> cause-owned failure—rather than technical cards, version counts, provider
> vocabulary, or success toasts. **Saved** means the server acknowledged the
> exact candidate and revision; queued, browser-only, in-flight, or
> outcome-unknown work is never called saved. Routine editing autosaves
> automatically, while **Save now** and `Ctrl`/`Cmd` + `S` flush without
> publishing. Preview, release preparation, and intentional navigation await
> the exact acknowledgement or block clearly; D1 selects and publishes only
> that immutable reviewed revision, while any later autosave remains private.
>
> A second editing session opens the current acknowledged draft read-only with
> bounded tenant-visible editor identity and last activity. It may return later
> or, only with distinct current authority, confirm **Take over editing**. The
> server uses one transaction that first re-proves current scope, permission,
> lease owner/generation, and expected revision, then creates a cause-labelled
> pre-takeover checkpoint and atomically transfers ownership under a new Lease
> Generation; failed proof changes nothing. The displaced editor is interrupted
> once, becomes read-only, retains unsent work only in that tab, and receives
> truthful compare/copy recovery. A visible authenticated editor renews while
> the person is actively using or reading it even without typing; lease renewal
> stops for hidden, suspended, crashed, or abandoned sessions. Those sessions
> cannot preserve authority indefinitely, and resume re-proves lease generation,
> revision, and permission before another write.
>
> Save failure distinguishes not-sent or rejected, committed-with-lost-
> acknowledgement, and stale-revision outcomes. The first preserves the local
> candidate and exact repair cause; the second performs bounded automatic retry
> with backoff using the identical command and idempotency key, then pauses with
> **Try again** and receipt lookup before any successor write if the outcome
> remains unknown; the third stops automation and preserves **Started from**,
> **Current draft**, and **Your unsaved work** for semantic comparison. Session
> expiry reauthenticates without clearing the editor and then re-proves all
> authority; permission, membership, Site, locale, lifecycle, reference, or
> Phase-10 revocation stops writes immediately and is never treated as a login
> problem. D12 promises no persistent offline-first synchronization or recovery
> after tab/device loss for work the server never acknowledged.
>
> History uses one normally hidden rolling autosave plus explicit bounded
> immutable meaningful checkpoints for deliberate saves, D1 release selection
> and publication markers, pre-takeover/conflict recovery, restore, and
> qualified import or migration. Each visible checkpoint carries actor, exact
> time, cause, Site/locale, source/profile schema, public relationship, and a
> semantic summary; autosave is a side-effect-dark recovery cause and never
> emits ordinary notifications, integration effects, cache/search/publication
> work, or per-keystroke permanent audit rows. Version reads, comparisons,
> lock-holder identity, checkpoints, and restores have explicit tenant- and
> resource-bounded authorization; a document or version ID alone grants
> nothing. **Restore as a new draft** compares first, checkpoints the current
> draft, repeats current scope/permission/lease/revision/compatibility proof,
> and appends a private successor—never rewriting history, publishing,
> unpublishing, changing D1's serving head, or exposing raw Payload restore.
>
> Payload drafts, coalesced autosave, and versions may implement this contract
> only after exact-build qualification with explicit access,
> `overrideAccess: false` and `overrideLock: false` for actor-scoped Local API
> use, explicit timing and semantic retention, restore wrapping, and
> N/N+1/rollback proof. Payload's current user-bound generated lock collection
> is advisory only: it cannot own D12's authoritative lease unless a qualified
> adapter proves exact resource-scope uniqueness, session ownership, monotonic
> fencing generation, and current authorization; otherwise one small Core-owned
> lease boundary provides only those facts and stores no content. Launch
> qualification begins near a two-second idle debounce, five-minute inactive
> lease, one rolling recovery autosave, and a platform target of 100 ordinary
> unpinned history entries while active/recovery/D1-required checkpoints remain
> protected, tuned only by measured platform evidence rather than tenant
> settings. Production activation
> requires cross-tenant version and lease denial, same-user/different-user race,
> lost-acknowledgement replay, takeover, auth/revocation, restore-as-draft,
> migration, load, audit-volume, mobile, and accessibility proof—without
> CRDT/OT, live cursor or presence streams, automatic field/block merge,
> multiple working branches, persistent offline
> queue, tenant autosave/lock matrices, second version engine, mutable public
> draft head, destructive rollback, or any claim that changed, queued, saved,
> valid, previewed, reviewed, selected, compiled, released, serving, indexed,
> notified, or integrated are the same fact.

### Binding interpretation

- **Working Revision** is the server-authoritative private editable state for one
  exact typed resource. It is not the public generation, an entire-Site branch,
  a browser queue, or a fused Page/Navigation/Placement document.
- **Active Editor Lease** coordinates people; expected-revision CAS and the
  monotonically changing **Lease Generation** fence every mutation. A lock icon
  or provider lock row alone never proves write authority.
- Actor and editing session own the lease but are not part of its uniqueness
  scope. Exactly one current lease may exist for each exact Tenant × environment
  × Site × locale × typed resource.
- **Saved** means the server acknowledged the exact content identity and Source
  Revision. Browser-only, queued, in-flight, lost-acknowledgement, previewed,
  selected, compiled, released, and serving are separate facts.
- Routine autosave creates one rolling recovery cause. Meaningful history is
  bounded, semantic, immutable, and append-only; restore always creates a new
  private draft.
- Payload drafts, autosave, versions, and locks are qualified implementation
  primitives only. D12 does not expose their raw access, retention, restore, or
  concurrency behavior as product authority.
- D1 remains the sole ordinary public release authority. D12 neither publishes
  nor changes a serving generation, Page Placement, Navigation, Presentation
  Package, or Phase-22 specialized content implicitly.

### Source-of-truth boundaries

| Owner           | Owns in or across D12                                                                                                                            | Does not become                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| D12 / Phase 23  | Private Working Revision behavior, save receipts, active-editor coordination, meaningful checkpoints, compare/recovery, and restore-as-new-draft | Public release authority, one fused Site document, real-time collaboration, or operational truth |
| D1              | Exact reviewed-revision selection, complete compile/proof, immutable Public Site Generation, release CAS, and serving head                       | Autosave state, browser recovery, edit lease, or mutable draft head                              |
| D4 / D8         | Navigation and Reusable Section semantic revisions and publication dependencies                                                                  | Hidden side effects of Page prose autosave                                                       |
| D9 / D10        | Qualified Presentation Packages and complete-cohort Site-presentation activation                                                                 | Draft persistence or permission to reinterpret source                                            |
| Phase 10        | Current public and contributor safety ceiling, revocation, and adverse containment                                                               | Historical edit permission frozen into a lease                                                   |
| Phase 22        | Specialized Ministry Page, Project/Campaign Page, and Ministry Update workflows                                                                  | Ordinary Phase-23 editorial state redefined by D12                                               |
| Payload adapter | Qualified private draft/version/autosave primitives behind explicit access and compatibility controls                                            | Tenant authorization, authoritative lease without proof, public truth, or raw product semantics  |

### UX contract

- Healthy editing shows one quiet persistent status beside **Preview** and D1's
  publication action: **Unsaved changes**, **Saving…**, **Saved just now**, or
  **Published · Unpublished changes**. It does not emit a toast per autosave.
- **Save now** and the standard keyboard shortcut flush the current candidate
  without publishing. Preview and intentional navigation wait for the exact
  acknowledgement or explain the blocking cause.
- A second session opens read-only with bounded editor identity and last
  activity. Only a distinctly authorized actor sees **Take over editing**; the
  confirmation explains that the first editor will become read-only.
- Network, session, permission, stale-revision, and outcome-unknown failures use
  different copy and recovery. The editor preserves unsent work long enough to
  retry, compare, or copy it without claiming it is saved.
- History stays behind progressive disclosure, labels semantic causes rather
  than provider internals, and restores only through **Restore as a new draft**.
- Mobile, keyboard, screen-reader, reflow, localization, and reduced-motion
  behavior receive the same truthful status and recovery path.

### Rejected alternatives and prohibited shortcuts

- explicit-save-only authoring as the ordinary experience;
- true simultaneous multi-editor CRDT/OT, live cursors, automatic semantic
  merge, multiple branches, or an offline-first queue at launch;
- provider locks without exact-resource uniqueness, session ownership,
  monotonic fencing, current authorization, and CAS;
- actor ID as the lease uniqueness key, or one lock shared across unrelated
  resource axes;
- last-write-wins, blind retry, mutable “latest draft” publication, raw Payload
  restore, destructive rollback, or UI-only access controls;
- per-keystroke permanent version/audit rows, ordinary autosave notifications,
  tenant-configurable timing/lock matrices, or a second version engine; and
- any wording that conflates changed, queued, saved, valid, previewed, reviewed,
  selected, compiled, released, serving, indexed, notified, or integrated.

### Required proof inherited by the eventual specification

1. Same-user tabs, different-user sessions, expiry, renewal, takeover, resume,
   and simultaneous CAS races yield one authoritative lease generation and no
   stale write.
2. Lost acknowledgements replay the identical idempotent command without
   duplicate versions; receipt lookup distinguishes committed from uncommitted
   outcomes before a successor write.
3. Anonymous, cross-Tenant, wrong-environment/Site/locale/resource,
   insufficient, stale, and revoked actors cannot read private versions,
   lock-holder identity, comparisons, or mutate any Working Revision.
4. Page/Article Editorial, Placement, Navigation, Reusable Section, and other
   admitted resources cannot advance one another implicitly.
5. Debounce/coalescing, rolling recovery, semantic checkpoints, protected
   retention, pruning, restore-as-draft, migration, and deployment skew preserve
   exact revision identity and the last public generation.
6. Offline, tab/device loss, auth expiry, permission loss, deleted references,
   malformed or stale schema, browser crash, and server failure preserve honest
   recovery choices without claiming unavailable durability.
7. Minimum, typical, and measured-maximum content and concurrency cohorts meet
   editor latency, database write, audit-volume, storage, and history-query
   budgets.
8. Keyboard, focus, screen-reader announcements, reflow/zoom, mobile, RTL, CJK,
   long identity, localization, and reduced-motion behavior pass.
9. Exact-qualified Payload behavior proves explicit access, actor-scoped Local
   API safeguards, bounded autosave/version semantics, wrapped restore,
   N/N+1/rollback compatibility, and either an adequate authoritative lock
   adapter or the small content-free Core lease boundary.

### Evidence and architectural record

- [D12 full decision brief, adversarial review, UX, synthesis, and proof gates](./phase-23-d12-draft-version-autosave-and-edit-conflict-decision-brief.md)
- [D12 Payload editorial-lifecycle primary-source research](./phase-23-d12-payload-editorial-lifecycle-primary-source-research.md)
- [D12 current Core repository adversarial audit](./phase-23-d12-core-repository-adversarial-audit.md)
- [D12 editorial recovery UX benchmark](./phase-23-d12-editorial-recovery-ux-benchmark.md)
- [ADR-0156 — Bounded Editorial Working Revisions and recoverable active editor](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D1 decision and ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D4 decision and ADR-0148](../../adr/0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [D8 decision and ADR-0152](../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D12 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D12's canonical
terms are preserved here and in ADR-0156 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D12 do not yet decide broader layout/default inheritance; scheduled publication;
dynamic lists; public search; folders, taxonomies, and trash; forms;
generalized media; SEO; locale rollout; multi-Site readiness; audience/cache
policy; preview tokens; exact permission matrix; migration/cutover UX;
operational-health product; production capacity budgets; or exact qualified
Payload version. Those remain founder decisions or evidence-backed
implementation proofs and will be resolved one at a time.

## D13 — Exact-revision Scheduled Publication Appointments through D1

**Status:** Ratified and adversarially hardened on 2026-08-22.

> **C-prime-amended-and-hardened (C-prime-R) — exact-revision, product-owned Scheduled Publication Appointments executed exclusively through D1:** authorized staff may create a one-time `publish` or `unpublish` appointment for one exact Tenant × environment × Site × BCP-47 locale × typed Page, with at most one unresolved appointment of each action kind, no recurrence, and a mandatory publish-before-unpublish order when both exist. A publish appointment binds the exact server-acknowledged D12 revision and every directly reviewed immutable semantic dependency; an unpublish appointment binds stable Page identity and the exact route, Navigation, redirect/lifecycle, designation, giving, and visitor consequence. Both bind completed review and organization-owned authorization with initiator attribution, responsible ownership, civil date/time, IANA timezone, chosen offset, resolved UTC not-before instant, timezone-data generation, schema version, appointment generation, and immutable idempotency fingerprint. Later autosaves, mutable `latest`, provider state, cache state, and unrelated Site releases never alter scheduled intent; Change and Replace create attributable immutable successors rather than rewriting history.
>
> Core’s product records, D1 generation, and execution receipt remain authoritative. Far-future appointments remain in Core; within a six-day handoff horizon the shared dispatch ledger sends one identifier-only future-`ts` event through the existing shared Inngest runtime. Inngest supplies delayed delivery, bounded transient retry, and load control only—never publication truth. One due function invokes the same idempotent D1 release command as Publish now in one durable step. Product claims, appointment-generation fencing, D1’s expected-head CAS, and receipt lookup provide correctness across duplicate delivery, cancellation, rescheduling, crashes, and lost acknowledgements. Stale delayed events safely no-op, while one platform-wide overdue reconciliation path supplies bounded-staleness recovery without tenant cron jobs or minute polling.
>
> At execution, D1 re-proves current appointment validity and explicit invalidation, Tenant/Site/locale scope, Phase 10 safety, route and reference integrity, current compatible renderer and presentation generations, and every pinned semantic source; prepares a content-addressed successor from the then-current D1 generation while preserving unrelated public content; and atomically activates it with the immutable execution receipt and deduplicated downstream-convergence intent. Unrelated concurrent publication permits bounded reprepare only while scheduled meaning and every semantic pin remain unchanged. Exact already-satisfied intent records a no-op receipt; materially changed, incompatible, unauthorized, or newer/different target content becomes one cause-owned Needs attention exception and never silently rebases or downgrades. Cache, CDN, sitemap, search, and crawler convergence remain separate observable facts.
>
> Publish now remains primary and Schedule… secondary. One accessible dialog shows action, exact scheduled revision, Site/path/locale, Site timezone and viewer conversion, later-edits exclusion, preview, and literal public consequence. Healthy Pages show one quiet scheduled sentence with Preview, Change, and Cancel; later drafts clearly say they are not included. Same-target manual publication requires an explicit keep-or-cancel decision. The centralized Publishing schedule contains only Upcoming, Needs attention, and History. Routine initiator offboarding does not silently erase an organization-owned completed authorization, while explicit security, governance, safety, appointment, Site, locale, or source invalidation blocks execution.
>
> D13 includes no Payload scheduling authority, Payload Jobs runner, long-lived sleeping run as truth, recurring schedule, arbitrary condition builder, release graph, partial D10 presentation activation, tenant retry configuration, auto-revert, force path, public-request execution, destructive rollback, or claim that scheduled, prepared, activated, cached, indexed, visible, and source-authoritative are the same fact. Phase 10 adverse withdrawal remains immediate, and D10 remains the sole complete-cohort Site Presentation activation.

### Binding interpretation

- A **Scheduled Publication Appointment** is one immutable, attributable,
  product-owned future instruction for one exact Page and locale. It is not a
  mutable date field, Payload job, Inngest run, entire-Site release, or public
  serving head.
- A publish appointment selects one exact server-acknowledged D12 revision plus
  every directly reviewed semantic dependency that determines its meaning. It
  does not freeze unrelated Pages or the complete locale generation.
- An unpublish appointment selects stable Page identity and the exact route,
  Navigation, redirect/lifecycle, designation, giving, and visitor consequence.
- At most one unresolved publish and one unresolved unpublish exist per Page
  and locale. When both exist, publish precedes unpublish; repeated cycles and
  recurrence are outside D13.
- Change, Replace, reschedule, and Cancel append attributable lifecycle facts.
  They never mutate or erase the prior appointment.
- Completed authorization belongs to the organization and remains attributable
  to the initiator and responsible owner. Routine offboarding does not silently
  cancel it; an explicit security, governance, safety, Site, locale, source, or
  appointment invalidation does.
- D1 prepares from the then-current serving generation, preserves unrelated
  releases, and permits bounded reprepare only while the scheduled target and
  all semantic pins remain identical. Material change becomes **Needs
  attention**.

### Source-of-truth boundaries

| Owner                                | Owns in or across D13                                                                                                                       | Does not become                                                             |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| D13 / Core product records           | Appointment intent, immutable generation and successor history, schedule evidence, ownership, lifecycle, and execution receipt relationship | Public serving authority, provider job state, or a general automation graph |
| D1                                   | Current proof, exact candidate preparation, expected-head CAS, immutable Public Site Generation, and serving receipt                        | Schedule storage, mutable latest selection, or provider retry state         |
| D12                                  | Server-acknowledged private revision selected by a publish appointment; later autosaves remain private                                      | Scheduled target substitution or public release                             |
| D9 / D10                             | Current compatible presentation generations and sole complete-cohort Site Presentation activation                                           | Partial scheduled package switch or ordinary Page schedule authority        |
| Phase 10 / 22                        | Current public safety ceiling and source-owned public/lifecycle facts                                                                       | Historical permission frozen into a provider event                          |
| Dispatch ledger / Inngest            | Durable not-before handoff, delayed wake-up, bounded transient retry, and load control                                                      | Appointment, authorization, idempotency, receipt, or publication truth      |
| Cache, CDN, sitemap, search, crawler | Independently observed downstream convergence                                                                                               | Proof that D1 activated the intended generation                             |

### UX contract

- **Publish now** remains primary and **Schedule…** is the adjacent secondary
  action.
- One dialog shows publish or unpublish, exact revision, Site/path/locale, Site
  timezone and viewer conversion, Preview, later-edits exclusion, and the
  literal public consequence. Its confirmation says **Schedule publish** or
  **Schedule unpublish**, never **Save**.
- The Page shows one quiet sentence with **Preview**, **Change**, and **Cancel**.
  A later draft says plainly that it is not included and offers **Replace
  scheduled version…** through the applicable review and D1 proof.
- Same-target manual publication requires an explicit keep-or-cancel choice.
  Exact already-satisfied intent completes with a no-op receipt; different or
  newer content never silently downgrades.
- The central Publishing schedule contains only **Upcoming**, **Needs
  attention**, and **History**. Routine success is quiet, while every exception
  identifies cause, owner, consequence, and one safe next action.
- Typed date/time entry, keyboard-complete picker behavior, associated format
  help and errors, focus restoration, screen-reader announcements, reflow,
  mobile, localization, RTL/CJK, and daylight-saving cases are required.

### Rejected alternatives and prohibited shortcuts

- mutable `latest`-at-execution scheduling, Payload `_status`, Payload Jobs,
  Inngest run state, or provider deduplication as product truth;
- two competing schedulers, tenant cron jobs, minute polling, public-request
  execution, or one long sleeping run per far-future appointment;
- recurring schedules, multiple unresolved actions of the same kind, arbitrary
  conditions, release graphs, auto-revert, tenant retry matrices, or force
  execution;
- in-place reschedule, silent target substitution, material automatic rebase,
  last-write-wins, blind retry, exact-second promises, or destructive rollback;
- whole-Site/locale head pinning for an ordinary Page or partial reproduction of
  D10; and
- any claim that scheduled, prepared, activated, cached, indexed, visible, and
  source-authoritative are the same fact.

### Required proof inherited by the eventual specification

1. Appointment, successor, cancellation, action-kind uniqueness, ordering,
   semantic pins, stable unpublish consequence, idempotency, generation, and
   receipt constraints hold under concurrent commands.
2. Anonymous, cross-Tenant, wrong-environment/Site/locale/Page, insufficient,
   stale, and explicitly invalidated actors or appointments cannot read or
   execute private schedule authority.
3. Civil time, IANA zone, chosen offset, resolved UTC, timezone-data generation,
   DST gap/fold, database clock, near-now, and no-before execution are correct.
4. Horizon handoff, missed dispatch, stale event, duplicate delivery beyond
   provider deduplication, worker crash, lost acknowledgement, provider outage,
   transient retry, and overdue reconciliation converge through product truth.
5. Publish now and scheduled work use the same D1 command; current-head
   preparation preserves unrelated work; CAS, safe already-satisfied no-op,
   bounded compatible reprepare, and material-conflict refusal are proved.
6. Later autosave, Replace, Cancel, manual publish, Page trash, Site/locale
   disablement, route conflict, renderer/profile incompatibility, source or
   permission invalidation, initiator offboarding, and Phase 10 adverse action
   have deterministic outcomes.
7. Cache, CDN, sitemap, search, and crawler convergence retry independently and
   never create a second publication or rewrite D1 truth.
8. Account-wide Inngest usage, quotas, backlog, bursts, alerting, N/N+1
   event/schema compatibility, rollback, retained-worker behavior, accessibility,
   and staff usability pass production-shaped gates.

### Evidence and architectural record

- [D13 full decision brief, adversarial review, UX, synthesis, and proof gates](./phase-23-d13-scheduled-publication-operations-decision-brief.md)
- [D13 Inngest scheduling, cost, CMS, and UX research](./research/phase-23-d13-inngest-scheduling-cost-research.md)
- [ADR-0157 — Exact-revision Scheduled Publication Appointments through D1](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D10 / ADR-0154](../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Workflow orchestration specification](../../../openspec/specs/workflow-orchestration/spec.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D13 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D13's canonical
terms are preserved here, in the decision brief, and in ADR-0157 without
overwriting accepted Phase 22 language.

### Remaining grooming coverage

D1–D13 do not yet decide broader layout/default inheritance; dynamic lists;
public search; folders, taxonomies, and trash; forms; generalized media; SEO;
locale rollout; multi-Site readiness; audience/cache policy; preview tokens;
exact permission matrix; migration/cutover UX; operational-health product;
production capacity budgets; or exact qualified Payload version. Those remain
founder decisions or evidence-backed implementation proofs and will be resolved
one at a time.

## D14 — Versioned Dynamic Source Catalog and source-discriminated Content List

**Status:** Ratified and adversarially hardened on 2026-08-22.

> **C-prime-amended-and-hardened (C-prime-R) — One code-owned, provider-neutral and versioned Dynamic Source Catalog behind one source-discriminated Dynamic Content List semantic leaf, introduced only through D7’s additive catalog evolution and published only through D1’s complete-cohort Site Plan release. Ordinary staff see a single, accessible “Content list” block—not catalog, provider, or query terminology—and choose an available source first, after which the editor reveals only that source’s plain-language presets, bounded typed filters, safe ordering choices, item limits, compatible D9 presentation variants, heading/CTA and empty-state choices, human-readable configuration summary, and actual current public-safe preview. Each immutable source contract has a stable never-reused key, owning phase and owner, contract version, Tenant/Site/locale/Page-family availability, public-list DTO and stable item identity, permitted filters/operators/sorts/limits and presentation capabilities, deterministic total ordering and null handling, preview/empty/unavailable/adverse-safety behavior, query/index/cost and batching bounds, cache and invalidation dimensions, migration and retirement rules, observability, and a shared conformance suite. The Page revision stores only the semantic source key, exact source-contract version, canonical validated source-specific selection intent, approved semantic presentation variant, and bounded localized editorial copy; it never stores matching records, operational objects, browser-supplied Tenant/Site/locale authority, provider collection or table names, database fields, private identifiers, arbitrary field selections, SQL, GraphQL, GROQ, raw JSON operators, formulas, executable code, CSS, or cross-source joins. D1 validates and releases the exact configuration and pins compatible catalog, compiler, adapter, and renderer generations, including reproof at D13 scheduled execution, but never freezes matching records or replaces the source owner’s independently current publication, lifecycle, eligibility, or Phase 10 safety authority; changing list configuration requires a Page release, while matching public membership may change without one. Preview and public delivery use the same provider-neutral public-projection seam and trusted server-resolved Tenant, environment, Site, locale, audience, and source authority; Payload-backed reads use explicit access enforcement, exact projection and `depth: 0`, while Supabase-backed reads use least privilege, exact tenant predicates and applicable RLS without treating a service-role read as proof of isolation. Cache identity includes the complete trusted scope, source and contract version, canonical intent hash, publication/safety version, and relevant release and renderer generations; adverse safety narrowing invalidates first. Legitimate empty results, unavailable sources, incompatible contracts, permission failures and transport failures remain structurally distinct; failures preserve the rest of the Page, expose only safe public fallback behavior, and create one cause-owned private operational exception, while stale output may be reused only when current safety can still be independently proven. Source changes explain exactly which source-specific settings reset, require confirmation, preserve recovery through D12, and support undo; unknown or incompatible versions block the candidate release while the prior public generation remains intact, and migrations create explicit successor drafts rather than mutating content during reads. Article is the required Phase 23 source; Missionary, Project/Campaign and Ministry Update sources become available only through their certified Phase 22 public projections; Event and Opportunity wait for Phase 37; every other source requires the same owner-supplied qualification. New sources remain code-owned qualifications, never tenant-created schemas or runtime plugins. The catalog reserves typed capability seams for the separately ratified curation and pagination decisions without presuming or implementing their outcomes, and it expressly excludes arbitrary query builders, nested Boolean expression editors, random or unbounded result modes, tenant-authored operators, cross-source aggregation, personalization and AI-generated queries.**

### Binding interpretation

- The **Dynamic Source Catalog** is one provider-neutral, code-owned, versioned
  registry of qualified public-list source contracts. It is not a tenant table,
  Payload collection list, Supabase schema browser, plugin registry, or staff
  query language.
- A **Dynamic Source Contract** is one immutable versioned promise from an
  owning phase/domain. Its stable key is never reused. It declares source
  availability, public-list DTO, safe filter and sort capabilities, bounded
  work, ordering, presentation compatibility, failure behavior, cache causes,
  migration, retirement, diagnostics, and conformance proof.
- A **Dynamic Content List** is one D7 semantic section leaf whose stored
  source-discriminated selection intent names exactly one source contract. The
  ordinary authoring label is **Content list**.
- **Selection Intent** is the normalized, validated editorial request for what
  public records should match and how an approved semantic list variant should
  present them. It is neither a copied result set nor source-owned publication
  or eligibility truth.
- **Public List Item DTO** is the minimum source-owned, public-safe semantic
  item that a compatible D9 Presentation Package may render. It is not a raw
  Payload document, Supabase row, operational object, or permission-bearing
  record.
- D14 adds one source-discriminated D7 leaf, not one block family per source.
  Source-specific implementations may remain separate modules behind the one
  catalog interface so neither a giant optional-field object nor a giant switch
  becomes the architecture.
- When family-qualified under D7, a Content list may become a Reusable Section
  only through D8/ADR-0152's existing exact-version, scope, propagation, and
  recovery contract. Reuse stores and shares Selection Intent, never matching
  source records, and D14 creates no second reuse or inheritance system.

### Catalog and stored-intent contract

Every registered source version declares at minimum:

- stable never-reused source key, owning phase/domain, named owner, and contract
  version;
- compatible Page families plus exact Tenant, environment, Site, locale,
  audience, publication, and public-projection availability behavior;
- one allowlisted public-list DTO, stable item identity, and safe public route;
- bounded source-specific filters, value types/providers and operators; safe
  sorts; default and maximum result limits; and compatible semantic D9 variants;
- deterministic total ordering with a stable tie-breaker and explicit null
  handling;
- preview, legitimate-empty, unavailable, incompatible, transport-failure, and
  adverse-safety behavior;
- query/index/cost, batching, request-deduplication, maximum-work, and
  concurrency expectations;
- complete cache dimensions and invalidation causes;
- explicit migration, retirement, retained-version, export, diagnostics,
  telemetry, and conformance-test requirements.

The Page revision stores only the source key, exact source-contract version,
canonical validated source-specific selection intent, approved semantic
presentation variant, and bounded localized heading, CTA, or empty-state copy.
It stores no source results, operational records, scope authority, provider
collection/table names, private identifiers, database fields, raw queries,
arbitrary operators, executable expressions, code, or style data.

### Source-of-truth boundaries

| Owner                       | Owns in or across D14                                                                                                                | Does not become                                                                                     |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Source-owning phase/domain  | Current public projection, item identity, eligibility, lifecycle, publication, safety, deduplication, and source invalidation        | Page composition, D1 release, D9 presentation, or a generic query service                           |
| D14 Dynamic Source Catalog  | Stable semantic source contract, safe capabilities, bounds, compatibility, migration/retirement, and conformance proof               | Source record storage, tenant-authored schema, or live result membership                            |
| D7 / Page revision          | One Content list leaf and exact canonical editorial Selection Intent                                                                 | Copied operational truth, arbitrary query, or public authority                                      |
| D1                          | Exact configuration validation, immutable generation compilation, compatible-generation pins, expected-head CAS, and serving receipt | Frozen dynamic membership or source-owned publication/safety truth                                  |
| D9 Presentation Package     | Rendering a catalog-approved semantic variant from the public list view model                                                        | Source, field, filter, query, access, or release authority                                          |
| Phase 10 / Phase 22         | Current public safety ceiling and the exact Missionary, Project/Campaign, and Ministry Update public projections                     | General CMS query or D1 publication authority                                                       |
| Payload / Supabase adapters | Qualified provider-specific execution behind the public-projection seam                                                              | Product authority, browser-selected scope, or proof of tenant isolation by provider privilege alone |
| Cache/CDN                   | Bounded acceleration and independently observed convergence                                                                          | Safety, authorization, source truth, or proof that D1 activated                                     |

### Release, preview, cache, and failure semantics

- Saving or autosaving under D12 changes only a private Page revision. D1 alone
  validates and releases its exact Content list configuration.
- D1 pins compatible catalog, source-contract, compiler, adapter, and renderer
  generations. It does not pin the matching source records. A source-owned
  public item can become eligible, publish, retire, or be withdrawn without a
  Page republish.
- D13 scheduled execution re-proves the exact configuration and current
  compatibility. It never substitutes mutable `latest`, silently migrates the
  intent, or freezes later source membership into the appointment.
- Preview combines the draft list configuration with only current published,
  public-safe source data through the same public-projection contract used by
  public rendering. Staff access never makes private source data previewable.
- Runtime scope is resolved from trusted server context. Browser-provided
  Tenant, environment, Site, locale, audience, source authority, filter IDs, or
  cache dimensions never become authoritative.
- Payload-backed adapters use explicit access enforcement, exact field
  selection, `depth: 0`, bounded predicates, and public DTO serialization.
  Supabase-backed adapters use least privilege, exact tenant predicates and
  applicable RLS; service-role privilege is never accepted as isolation proof.
- Cache identity includes the exact trusted Tenant, environment, Site, locale,
  audience/reach, source key and contract, canonical intent hash,
  publication/safety version, and relevant release and renderer generations.
  Invalidation tags accelerate convergence but never supply authorization or
  tenant isolation.
- Current adverse safety narrowing or withdrawal wins over ordinary cache
  freshness. Last-known-safe output may be used only when the source contract
  can independently prove that it remains currently safe; otherwise the section
  uses its approved omission or public-safe fallback.
- Legitimate empty, unavailable, incompatible, unauthorized, timeout, and
  transport-failure states are distinct. A failed list does not blank the rest
  of the Page, expose a raw error, or masquerade as zero matches. Staff receive
  one cause-owned exception; the public receives only approved safe behavior.
- Unknown or incompatible contract versions block the candidate release and
  preserve the prior public generation. Migration creates an explicit
  attributable successor draft; no read-time mutation or guessed downgrade is
  permitted.

### Authoring UX contract

- The block library says **Content list — Show published content that updates
  automatically.** It does not expose Dynamic Source Catalog, adapter, DTO,
  provider, or query-plan terminology.
- A small launch catalog uses accessible source cards. Only sources certified
  for the exact Tenant, Site, locale, Page family, public projection, and
  editor authority are selectable. An administrator who can resolve an
  unavailable source may receive one disabled reason and one cause-owned action;
  ordinary editors do not see a wall of technical disabled choices.
- After source selection, progressive disclosure shows only that source's
  plain-language presets, bounded filters, approved sorts and result limits,
  compatible D9 visual variants, and bounded editorial copy. It never exposes
  arbitrary fields, nested Boolean groups, raw operators, or dozens of
  untested presentation micro-toggles.
- The collapsed block remains legible, for example **Articles · Newest first ·
  Up to 6 · Story cards**.
- **Current public results** renders actual safe items and identifies Site,
  locale, freshness, and the fact that matching membership updates
  automatically. It does not issue or announce a request on every keystroke.
- A configured source change names exactly which filters, order, and
  presentation choices will reset, requires confirmation, leaves the public
  Site unchanged until D1 publication, and remains recoverable through D12 and
  undo.
- Loading, no matches, preview failure, unavailable source, permission loss,
  and required migration have distinct copy and exact safe actions. A preview
  failure never destroys saved configuration.
- Visible labels, grouped native or established accessible controls, keyboard
  completion, focus restoration, polite settled-result status messages,
  320-CSS-pixel reflow, touch targets, localization, long labels, RTL/CJK, and
  no color/hover/toast/drag-only meaning are required.

### Qualified source availability

- **Article** is the required Phase 23 tracer and launch source.
- **Missionary, Project/Campaign, and Ministry Update** appear only when their
  exact Phase 22 public projection and activation contract is certified for the
  Site.
- **Event and Opportunity** wait for Phase 37.
- Every later source requires its owner to supply the same public projection,
  lifecycle, query, safety, cost, migration, observability, and conformance
  contract before it enters the code-owned catalog.
- Source retirement removes the source from new insertion while retaining every
  safe contract version still referenced by an active or retained generation.
  It never silently rewrites historical Page intent.

### Rejected alternatives and prohibited shortcuts

- separate provider-specific Page block families, a Payload collection picker,
  or direct Supabase table/column selection;
- generic SQL, GraphQL, GROQ, raw JSON/Where, arbitrary field, nested Boolean,
  formula, relationship/join, schema-builder, or executable-code authoring;
- tenant-created source definitions, per-tenant source code, runtime plugins,
  cross-source blends, personalization, recommendations, or AI-generated
  queries;
- copied source snapshots, Page revision as list-membership truth, private staff
  preview, browser-provided scope, provider privilege as isolation proof, or
  cache tags as authorization;
- random order, unbounded **Show all**, silent clamping, silent source-setting
  loss, read-time migration, guessed version fallback, blind retry, raw public
  errors, exact counts without a safe and cheap owner contract, or stale content
  after current safety can no longer be proved; and
- allowing custom D9 packages to add sources, fields, filters, queries, access,
  or release behavior.

### Required proof inherited by the eventual specification

1. Every source key, version, discriminated intent, normalization, DTO,
   compatibility, migration, retirement, and export rule passes the same
   catalog conformance harness.
2. Anonymous, cross-Tenant, wrong-environment/Site/locale/Page-family/audience,
   private, restricted, draft, retired, and forged-filter requests fail closed
   without observable cross-scope differences.
3. Preview and public rendering use the same exact public projection and
   semantic view model; staff access never expands preview data.
4. Stable identity, deterministic total ordering, ties, nulls, owner-defined
   deduplication, fewer-than-limit, zero-result, missing-media, self-reference,
   and later pagination boundaries behave deterministically.
5. Legitimate empty, unavailable, incompatible, permission, timeout, transport,
   and adverse-safety states remain distinct and preserve the rest of the Page.
6. Cache keys include every trusted scope and generation dimension; cross-scope
   cache poisoning is denied; ordinary invalidation converges; adverse
   withdrawal suppresses first; stale reuse requires independent current-safety
   proof.
7. Payload adapters prove explicit access, exact selection and depth; Supabase
   adapters prove tenant predicates, applicable RLS/grants and least privilege;
   raw provider objects never reach public renderers or D9 packages.
8. Query plans, indexes, item/block/concurrency bounds, duplicate-intent request
   deduplication, source outage, fan-out, exact-count avoidance, and worst-case
   Page composition meet production capacity budgets.
9. D12 autosave/recovery, configured-source change/reset/undo, D1 release,
   D13 scheduled execution, source updates, renderer/package rollout, current
   safety withdrawal, CAS conflict, rollback, and retained-version races have
   deterministic outcomes.
10. Article proves the complete tracer path before each Phase 22 source is
    qualified independently; Event/Opportunity cannot appear before Phase 37.
11. Keyboard, screen reader, focus, status announcements, touch, 320-pixel
    reflow, zoom, mobile, localization, RTL/CJK, and short/very-long content pass
    production-shaped testing with representative tenant staff.
12. Source/version/generation/result-state/latency/cache/correlation telemetry
    detects cause without recording public content, private filter values, or
    PII; operations shows one owner, consequence, and safe next action.

### Evidence and architectural record

- [D14 primary-source research, UX contract, adversarial review, and proof gates](./research/phase-23-d14-dynamic-source-catalog-research.md)
- [ADR-0158 — Versioned Dynamic Source Catalog and source-discriminated Content List](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D7 / ADR-0151](../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [D8 / ADR-0152](../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [D9 / ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D13 / ADR-0157](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D14 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D14's canonical
terms are preserved here and in ADR-0158 without overwriting accepted Phase 22
language.

## D15 — Three bounded Content-list curation strategies

**Status:** Ratified and adversarially hardened on 2026-08-22.

> **C-prime-amended-and-hardened (C-prime-R) — Three bounded, list-instance-owned Content-list curation strategies, Page-local by default, under D14’s one-source contract and D1’s sole Site Plan release.** Each Content list stores exactly one versioned, source-discriminated `curation@1` branch inside D14’s canonical Selection Intent: **Updates automatically**, using the source’s bounded filters, deterministic sort and limit plus optional bounded exact exclusions applying only to this list; **Featured first**, using that same active query and exclusions plus one bounded ordered set of currently matching featured identities followed by the deterministic, deduplicated automatic tail; or **Choose every item**, using only one bounded ordered set of exact source-qualified identities with no filters, automatic sort, exclusions, substitution, or automatic tail. The Page Editorial Revision owns the intent for an ordinary list; if the list is inside a D8 Reusable Section, that exact Reusable Section revision is the sole owner and D8’s “change every use” or “make a local copy” consequences apply.
>
> One provider-neutral server resolver derives the exact Tenant, environment, Site, locale, audience, Page family, source and source-contract version from trusted context; re-proves current source-owned publication, routeability, Phase 10 safety and filter eligibility; applies exclusions; emits surviving featured identities in saved order; appends the deterministic automatic remainder; deduplicates by stable never-reused public identity; and applies the configured limit. D16 may later paginate only this final logical order and may neither reinterpret membership nor repeat featured items on every page.
>
> Staff may initially choose only items exposed through the current public-safe candidate projection. References select identity and order, never copied titles, routes, media, publication state or financial/operational facts. Save and release reject duplicates, forged, unknown, wrong-source or wrong-scope references, feature/exclusion overlap, unsupported strategy fields, excessive selections and featured counts exceeding the list limit. Malformed retained data fails safely; exclusions win defensively, while an invalid candidate release is blocked and the prior public generation remains live.
>
> A legitimately withdrawn, unpublished, untranslated or newly restricted reference remains inactive editorial intent but is suppressed immediately. Automatic and Featured-first lists refill deterministically when possible; Choose-every-item shrinks without substitution. Reappearance is allowed only for the same non-terminal source identity under current eligibility. Runtime reads never rewrite editorial history.
>
> Web Studio asks one plain-language question—**How should items be chosen?**—and then reveals only the controls relevant to that answer. Automatic is the visible recommended default. Pickers are bounded, searched, server-paged and public-safe. Preview uses the same resolver as public rendering. Reordering has Move up, Move down and Move to position controls, with drag only as an optional enhancement. Strategy changes explain the exact consequences, request confirmation only when populated settings would be discarded, preserve the prior D12 revision and undo path, and remain private until D1 publication.
>
> D15 creates no global `featured`, `sticky` or `hidden` source field; no per-item curation table or backreference; no multiple-source union, nested collection, weighting, boosting, arbitrary query language, personalization, recommendation or AI ranking; no copied source content; no private-candidate enumeration; and no pagination or SEO policy. Friendly **Latest** copy is permitted only when the exact source contract defines an authoritative public-release timestamp descending plus a stable-identity tie-breaker. Ratification records the product decision only and authorizes no implementation, schema, migration, provider adoption, issue publication, deployment or production change.

### Binding interpretation

- A **Curation Strategy** is the one active `curation@1` branch inside D14's
  source-discriminated Selection Intent. It is editorial membership and order
  intent, not a source query language, copied result set, authorization fact,
  or second publication state.
- **Updates automatically** retains D14's qualified filters, deterministic sort
  and result limit. Its sole exception lane is a bounded set of exact identities
  hidden from this list only; later eligible matches refill available capacity.
- **Featured first** retains the same query and optional list-local exclusions,
  promotes a bounded ordered subset that still matches that query, and fills the
  remainder from the deterministic query tail without duplicates. It never
  force-includes an out-of-filter or ineligible item.
- **Choose every item** contains one bounded ordered set of exact identities and
  no query filters, automatic sort, exclusion set, automatic tail, or
  substitution. Current eligible items appear once in saved order; the list
  shrinks when an identity cannot currently render.
- **List-instance-owned** means the ordinary Page Editorial Revision owns the
  curation branch. The sole exception is an exact D8 Reusable Section revision;
  its placements share the same intent and cannot override it. D15 creates no
  second reuse or inheritance mechanism.
- An **Inactive Curation Reference** is retained same-scope editorial intent
  whose identity is not currently public, eligible, translated, routeable, or
  filter-matching. It is suppressed publicly, shown privately only through a
  safe source-owned disposition, and never repaired by runtime mutation.
- Friendly **Latest** is an authoring label, not a timestamp guess. It is
  permitted only when the source contract defines the exact authoritative
  public-release instant, descending order, null policy, and stable-identity
  tie-breaker.

### Canonical intent and resolution contract

Exactly one branch is stored:

```text
curation@1 =
  | automatic {
      d14QueryIntent,
      hiddenItemRefs[]
    }
  | featuredFirst {
      d14QueryIntent,
      orderedFeaturedItemRefs[],
      hiddenItemRefs[]
    }
  | chooseEveryItem {
      orderedItemRefs[]
    }
```

Every identity is opaque, source-qualified, stable, never reused, and bounded
by the exact source contract. The owning revision stores no raw provider ID,
title, route, media, publication flag, operational record, or copied public
card. A source advertises a strategy only after its complete capability and
conformance proof; unsupported strategies are absent rather than exposed as
half-working generic controls.

The one canonical resolver performs, in order:

1. derive the trusted Tenant, environment, Site, locale, audience, Page family,
   source, contract, owning revision, and current publication/safety scope;
2. obtain the current source-owned public-safe candidate universe and apply the
   exact D14 filters and deterministic total order where the strategy uses a
   query;
3. remove exact list-local exclusions;
4. for Featured first, intersect saved featured identities with the surviving
   active query and emit them in saved order;
5. append the deterministic automatic tail, excluding identities already
   emitted;
6. defensively deduplicate by stable identity and apply the configured total
   limit; or, for Choose every item, resolve the bounded batch, suppress
   ineligible identities, and preserve the surviving saved order without
   substitution; and
7. provide D16 one final logical sequence. D16 may slice that sequence but may
   not change D15 membership, feature precedence, exclusions, suppression,
   deduplication, or exact-choice order.

Automatic and Featured-first refill when hidden or inactive records leave
capacity and the source can do so within its certified maximum-work contract.
Choose-every-item deliberately shrinks. A featured identity counts toward the
same final limit and appears only once at the head of the logical sequence.

### Validation, lifecycle, and failure semantics

- Picker prevention is convenience; server commands and D1 compilation reject
  duplicate identities, feature/exclusion overlap, unknown or malformed roles,
  unknown versions, wrong source or scope, unsupported strategy fields,
  excessive arrays, and featured counts above the result limit.
- Contradictory candidate intent does not publish. A malformed retained record
  fails safely with exclusion winning defensively, creates a repairable private
  disposition, and never expands public behavior.
- Candidate references are selected from the current public-safe projection.
  Staff authentication, Payload privilege, Supabase service role, or a D13
  appointment does not create future-public or cross-scope selection authority.
- A legitimate same-scope reference that later becomes unpublished, retired,
  untranslated, restricted, out-of-filter, or otherwise ineligible remains in
  immutable editorial intent but is suppressed immediately. The source owner
  decides whether the same non-terminal identity may later return.
- An unknown, forged, wrong-source, or wrong-scope reference fails closed with
  a non-enumerating error and blocks the candidate release. The prior public
  generation remains live.
- A picker, preview, or source failure preserves the configuration and draft.
  Legitimate empty, all-hidden, partially inactive, unavailable, unauthorized,
  incompatible, and transport-failed states remain distinct. Public failure is
  contained to the affected list under D14's approved safe behavior and one
  cause-owned private exception.
- Runtime resolution never cleans, clamps, migrates, or rewrites the owning
  revision. Migration creates an attributable successor draft and retains every
  reader needed by active or rollback generations.

### Staff authoring UX contract

After source selection, Web Studio asks only **How should items be chosen?**
using one labelled, mutually exclusive choice:

- **Updates automatically — Recommended:** _Show matching items and keep this
  list current. You can hide specific items from this list._ Show only filters,
  order, number shown, a secondary **Hide specific items** disclosure, and the
  actual current public-safe preview.
- **Featured first:** _Choose matching items to show first. The rest continue to
  update automatically._ Show the same query controls plus one searched,
  bounded featured picker and ordered list. Editor-only preview chrome may label
  items **Featured** or **Automatic**; D15 creates no public badge.
- **Choose every item:** _Only the items you choose can appear, in this order._
  Show only searched Add items, the exact ordered selected list, count/cap, and
  preview—never filters, automatic sort, exclusions, or automatic-tail controls.

Pickers are bounded, server-paged, exact-scope, and restricted to the current
public-safe candidate projection. Rows use safe distinguishing metadata, retain
stable identity through reordering, and provide **Move up**, **Move down**, and
**Move to position**. Pointer drag is an optional enhancement, never the only
operation. Focus remains on the affected row, settled results and moves receive
polite status announcements, and keyboard, screen reader, touch, zoom,
320-CSS-pixel reflow, forced colors, long labels, localization, RTL/CJK, and
reduced motion require production-shaped proof.

Collapsed summaries remain literal, for example:

- **Articles · Updates automatically · Newest first · Up to 6 · 1 hidden**;
- **Projects · Featured first · 2 featured, then newest · Up to 6**; or
- **Testimonials · Choose every item · 4 selected · Manual order**.

Preview uses the same provider-neutral resolver and public-safe item DTO as
public rendering, identifies the current scope and freshness, and explains why
items are Featured, Automatic, hidden, inactive, or omitted without exposing
private facts. It distinguishes no selection, no current matches, all hidden,
partial manual resolution, inactive feature, source unavailable, invalid
selection, and permission loss. Preview failure never clears saved work.

Strategy changes name the exact settings or selections that cease to apply,
show the resulting preview, and request confirmation only when populated intent
would be discarded. Automatic and Featured first preserve their common query
and hidden set when switching between them. Converting to Choose every item may
start empty or snapshot the current preview's identities and order at a named
freshness watermark without copying item facts. Converting back requires an
explicit query and never silently turns all prior choices into features. D12
keeps the previous revision and real undo; D1 alone makes the successor public.

### Data, provider, scale, and observability boundaries

- D15 needs no global curation table, per-item backreference, source-record
  flag, database trigger fan-out, or placement override. Its bounded canonical
  branch lives inside the immutable owning revision.
- Payload relationship or array fields may be adapter primitives only. Product
  validation, exact contract versions, access enforcement, exact selection,
  shallow depth, compilation, and public serialization remain authoritative.
- Supabase-backed sources use least-privilege grants, exact indexed Tenant
  predicates, and applicable RLS; service-role success is not isolation proof.
- Choose-every-item resolves in one bounded batch. Candidate search is
  server-paged. Automatic exclusions and Featured-first promotion use one
  coherent source plan, with only certified bounded over-fetch when the provider
  cannot apply an exclusion directly. N+1 reads, giant browser option sets,
  unbounded `NOT IN`, deep population, and exact counts by default are barred.
- Cache identity inherits every D14 trusted scope and generation dimension plus
  the canonical curation-intent hash. Current adverse withdrawal wins over
  ordinary cache freshness.
- PII-free private telemetry records source and contract, strategy, safe
  configured/resolved/featured/hidden/inactive/deduplicated counts, intent
  digest, owning revision/generation correlation, latency, result state, cause,
  owner, and recovery outcome. It never records content, titles, private filter
  values, raw provider data, or PII.

### Rejected alternatives and prohibited shortcuts

- one undifferentiated optional-field bag, implicit hybrid combinations, or
  dormant inactive-strategy settings;
- global `featured`, `sticky`, `hidden`, weight, boost, priority, or Page-use
  fields on source records;
- out-of-filter feature bypass, silent substitution in Choose every item,
  copied item facts, raw provider references, or runtime cleanup of history;
- multiple sources, unions, joins, nested collections, slot rules, arbitrary
  interleaving, formulas, tenant query languages, personalization,
  recommendations, or AI-selected membership;
- selecting private, draft, cross-scope, or merely future-scheduled items before
  the owning source supplies a separately certified public-reference contract;
- drag-only ordering, desktop-only transfer controls, silent strategy/source
  reset, last-write-wins array-index mutation, exact total counts by default,
  unbounded result/selection/exclusion sets, or generic public errors; and
- allowing D9 rendering, D8 placements, Payload/Supabase privilege, caches, or
  D16 pagination to reinterpret D15 membership or source-owned safety.

### Required proof inherited by the eventual specification

1. `curation@1` normalization, serialization, strict unknown-field/version
   rejection, export, migration, and retained-reader behavior pass for every
   qualified source and active or rollback generation.
2. Resolver property and conformance tests cover all three strategies,
   exclusions, feature ordering, automatic tail, exact-choice order, final
   limit, duplicate identities, contradictory roles, ties, nulls, lifecycle
   changes, locale differences, refill, shrinkage, and no substitution.
3. Picker, command, preview, compiler, runtime, cache, Payload, and Supabase paths
   deny cross-Tenant/environment/Site/locale/audience/source and forged IDs
   without observable existence differences.
4. Current publication, Phase 10 safety, routeability, filter eligibility,
   withdrawal, retirement, deletion, republish, missing locale, route change,
   title collision, and source outage preserve the exact safe behavior and
   inactive-reference evidence.
5. D12 expected revision, active-editor fencing, simultaneous reorder,
   strategy/source conversion, lost acknowledgement, autosave, undo, restore,
   and conflict resolution preserve stable identity and never apply a stale
   array index to another item.
6. D1 and D13 reproof, incompatible contract, candidate block, prior-generation
   continuity, source-version upgrade, successor migration, rollback, and cache
   races have deterministic outcomes.
7. Choose-every-item batch resolution, automatic exclusions, Featured-first
   promotion, bounded refill, candidate search, worst-case Page composition,
   query plans, indexes, latency, request deduplication, source outage, and
   concurrent Tenant load meet production budgets without N+1 behavior.
8. Keyboard, focus, screen reader, touch, single-pointer non-drag ordering,
   320-pixel reflow, zoom, forced colors, long labels, localization, RTL/CJK,
   reduced motion, and settled status announcements pass automated and manual
   testing.
9. Representative nonprofit staff complete newest-list, urgent-feature,
   list-local-hide, exact-testimonial-order, unavailable-item-repair, shared-list
   consequence, strategy-conversion, undo, and release-review tasks without an
   unresolved critical misunderstanding.
10. D16 consumes the final deterministic D15 sequence and proves that no page,
    cursor, load-more, infinite-scroll, cache, or SEO behavior repeats features,
    changes membership, leaks scope, or changes source-owned safety.
11. Structured telemetry and operational views distinguish intentional empty,
    all-hidden, inactive, invalid, unavailable, incompatible, unauthorized, and
    failed outcomes without content or PII and identify one cause owner and safe
    next action.

### Evidence and architectural record

- [D15 primary-source research, staff UX, adversarial review, edge cases, and proof gates](./research/phase-23-d15-content-list-curation-research.md)
- [ADR-0159 — Three bounded Content-list curation strategies](../../adr/0159-three-bounded-content-list-curation-strategies.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D7 / ADR-0151](../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [D8 / ADR-0152](../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [D9 / ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D13 / ADR-0157](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D15 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, release
activation, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D15's canonical
terms are preserved here and in ADR-0159 without overwriting accepted Phase 22
language.

## D16 — Link-native Public Page Windows and bounded list discovery

**Status:** Ratified and adversarially hardened on 2026-08-22.

> **C-prime-amended-and-hardened (C-prime-R) — Multiple independently browsable, Page-local Content-list channels with tenant-selected presentation over one source-authoritative, link-native Public Page Window contract under D1’s sole Site Plan release.** D16 accepts only D15’s final deterministic, currently public sequence and slices it into bounded ordinal windows; it never changes membership, order, featured precedence, exclusions, source safety, public projection, or release authority. Each qualified list stores one versioned `windowing@1` profile in its existing Page or Reusable Section revision—**Show one set**, **Page links** (recommended), **Load more**, or **Auto-load while scrolling** (advanced)—plus one compatible code-bounded items-per-window choice. D1 assigns and preserves one stable, public-safe, Page-placement browse handle that is distinct from every D7 internal section identity, D8 reusable identity, source key, provider/document/record identity, and authorization fact; duplication receives a new handle, removal retires it, and D1 rejects collisions, unsupported source/profile combinations, incompatible presentation packages, and Page-wide work-budget breaches before release. D16 creates no per-visitor database state, result snapshot, pagination table, or second activation state.
>
> The clean Page URL renders every list’s first window. Every valid later window is server-rendered, reachable through real sequential `<a href>` links, and self-canonical at a bounded URL such as `?browse=<public-handle>&page=<positive-ordinal>#<focus-target>`; the fragment assists focus and scroll only and is never identity. One public URL carries at most one exact browse handle and ordinal. Duplicate parameters, arrays, multiple simultaneous list positions, unknown or retired handles, arbitrary limits, non-canonical aliases, and excessive ordinals are rejected before cache or source work. Multiple list regions may still operate independently in the current browser session, and History state may restore bounded secondary presentation state, but refresh, copy, share, crawl, and no-JavaScript behavior guarantee only the one channel named by the URL. An appended view is ephemeral: direct access reopens that channel’s exact ordinal window rather than replaying every previously appended window. A tenant needing several simultaneously durable deep archives uses ordinary D2 archive Pages rather than a combinatorial URL.
>
> Page links use the server URLs directly. **Load more** is button-led but not technically button-only: a real next-window anchor may be styled as a button and progressively enhanced to append the same server result. **Auto-load while scrolling** observes that same anchor and may append only a small code-owned number of windows before pausing for explicit continuation; it uses native scrolling, never hijacks motion or focus, preserves a visible manual Load more fallback, Pause and Skip-past-list actions, footer access, reduced-motion behavior, bounded DOM and request budgets, and ordinary link behavior when JavaScript, observers, or enhancement fail. At launch, no Page may contain more than one automatic-loading list; other lists may independently use Page links or Load more.
>
> One provider-neutral resolver validates trusted Tenant, environment, Site, locale, audience, D1 generation, Page and placement, source-contract version, D14 Selection Intent, D15 curation revision, fixed window size, browse handle, and ordinal; re-proves current source-owned publication and Phase 10 safety; and emits one public DTO window with previous/next state and an optional exact count only when the source certifies that count as safe, current, and cheap. Payload page/limit, database offset or keyset, and upstream cursors remain private replaceable adapter mechanics. Cache identity includes every trusted input; invalidation tags are never isolation; adverse safety narrowing converges first. A list failure is contained to that list, preserves already safe content and a working link fallback, never blind-retries, and emits one cause-owned private diagnostic. Dynamic source changes may move later windows; accumulated presentations suppress duplicate public identities but never freeze or replay content whose present safety can no longer be proved. Tenant presentation packages may vary controls, loading treatment, motion, layout, and visual composition, but never window semantics, access, URL, canonical, cache, limits, or failure policy.

### Binding interpretation

- A **Public Page Window** is one bounded ordinal slice of D15's final current
  sequence. It is a public presentation result, not a stored result set,
  provider page, cursor, authorization fact, Page identity, or release state.
- A **Public Browse Handle** is one D1-issued, public-safe identity for an exact
  Page placement. D1 preserves it across that placement's lineage, assigns a
  new handle on duplication, retires it on removal, and collision-checks the
  complete candidate. It is never a D7 section identity, D8 Reusable Section
  identity, Payload/document/source ID, or permission token.
- **One active browse channel per URL** means the URL may name one exact handle
  and positive ordinal. It does not prevent several list regions from operating
  independently in the current session; it prevents their positions from
  becoming a combinatorial public URL and cache matrix.
- **Link-native** means every valid continuation is server-rendered and
  reachable through a real sequential anchor. Load more and automatic loading
  progressively enhance that link; neither becomes the sole discovery or
  recovery mechanism.
- **Button-led, not button-only** means the control may look and behave like a
  Load more button when enhancement succeeds while retaining anchor semantics,
  a working `href`, and ordinary navigation when enhancement does not run.
- **Bounded automatic loading** means native scrolling, no focus or scroll
  hijacking, one automatic list per Page at launch, a small code-owned automatic
  append allowance, periodic pause, visible manual continuation, Pause and Skip
  actions, footer access, reduced-motion behavior, and finite request/DOM work.
- **Current, not snapshot-frozen** means publication, withdrawal, restriction,
  or source changes may move later results. Accumulated presentations may
  suppress duplicate public identities but never retain content whose present
  safety cannot be proved.

### Canonical intent and public URL contract

The owning Page or Reusable Section revision stores presentation intent only:

```text
windowing@1 = {
  presentation:
    | showOneSet
    | pageLinks
    | loadMore
    | autoLoadBounded,
  itemsPerWindow: one compatible code-owned choice
}
```

D1's compiled Page placement separately owns `publicBrowseHandle`. The clean
Page URL renders each list's first window. A later window uses one bounded
shape such as:

```text
?browse=<publicBrowseHandle>&page=<positiveOrdinal>#<focusTarget>
```

The fragment is only a focus and scroll aid. It never participates in server
identity, canonical identity, access, or cache scope. Direct access renders the
named ordinal itself; it does not replay every prior appended window. Unknown,
retired, duplicate, array, combined, malformed, non-canonical, zero, negative,
fractional, or excessive values are rejected before cache or source work.

### Resolution, safety, and provider boundary

The one resolver performs, in order:

1. derive trusted Tenant, environment, Site, locale, audience, D1 generation,
   Page, exact placement, source contract, D14 Selection Intent, and D15
   curation revision;
2. validate the released `windowing@1` profile, fixed size, handle, ordinal,
   Page-wide cost budget, and presentation-package compatibility;
3. re-prove current source-owned public publication and Phase 10 safety;
4. slice D15's final deterministic sequence without changing membership,
   Featured precedence, exclusions, deduplication, exact-choice order, or
   lifecycle behavior; and
5. return one provider-neutral public window containing items, ordinal,
   previous/next state, and an exact count only when the source certifies it as
   safe, current, and cheap.

Payload numeric pages, database offsets or keysets, and external cursors remain
private adapter mechanics. Public configuration and URLs contain none of them.
Every trusted input participates in cache identity; invalidation tags are never
tenant isolation. Current adverse withdrawal or safety restriction outruns
ordinary favorable cache freshness.

### Staff and public UX contract

Web Studio asks **How visitors browse more** and exposes only qualified choices:

- **Show one set:** show the configured maximum without a continuation control;
- **Page links — Recommended:** clear Previous, Next, and qualified compact
  page-number links for precise archive navigation;
- **Load more:** append the next set without losing place while preserving the
  same ordinary next-window link; or
- **Auto-load while scrolling — Advanced:** append a few sets, then pause for
  explicit continuation while preserving Pause, Skip, Load more, and footer
  access.

Staff see compatible **Items per set** choices and the actual-data preview for
first, middle, final, empty, slow, failure, mobile, keyboard, reduced-motion,
and multiple-list states. They never configure cursors, query strings,
canonical tags, cache controls, observer thresholds, automatic-load counts, or
provider paging. If another list owns the one automatic slot, Web Studio
explains why and offers **Use automatic loading here instead** rather than
silently changing the other list.

Page-link controls use labelled navigation, real anchors, full Previous/Next
text, current-page semantics, visible focus, practical touch targets, and
responsive number collapse. Load more announces appended results, focuses the
first new item after explicit activation, retains existing content on failure,
and offers Try again plus Open the next page. Automatic loading never steals
focus, throttles announcements, exposes busy state, periodically pauses, and
falls back to link navigation before DOM or request growth becomes unbounded.

### Failure, data, scale, and observability boundaries

- Empty, exhausted, invalid, denied, stale-generation, unavailable, aborted,
  and transport-failed are distinct typed outcomes. One list cannot blank an
  otherwise safe Page.
- Superseded work is aborted or ignored by exact request identity. Retry is
  manual, idempotent, and deduplicated; observers and hydration cannot append a
  window twice.
- D16 creates no per-visitor row, result snapshot, public cursor, mandatory
  count, arbitrary limit, placement override, copied item, second active head,
  or runtime mutation of editorial history.
- Page-wide source, count, prefetch, image, concurrency, response, ordinal, and
  accumulated-DOM budgets are code-owned and D1-validated. Deep paging may use
  a qualified private keyset or cursor without changing the public contract.
- Private PII-free telemetry distinguishes list, mode, ordinal, latency, cache,
  append depth, empty, exhausted, invalid, denied, stale, aborted, unavailable,
  and failed outcomes without donor identity, content, raw query strings, or
  provider tokens.

### Rejected alternatives and prohibited shortcuts

- true button-only or scroll-only discovery, synthetic metadata standing in
  for real anchors, or JavaScript as the only continuation path;
- independent pager, Load-more, and automatic-scroll data engines;
- simultaneous durable query parameters for every list, public provider
  cursors, public database offsets, position-derived keys, or reusable-section
  identity as browse identity;
- unbounded automatic appends, several automatic lists per Page at launch,
  scroll hijacking, focus-stealing passive loads, unreachable footers, hidden
  manual fallbacks, or blind retries;
- tenant-controlled arbitrary page size, auto-load count, prefetch policy,
  canonical behavior, cache identity, or provider implementation;
- visitor-position tables, result snapshots, pagination tables, exact counts by
  default, or a generic feed/personalization framework; and
- letting D16 change D15 membership, D2/D3 route identity, D9 presentation
  authority, Phase 10 safety, source truth, or D1 publication state.

### Required proof inherited by the eventual specification

1. `windowing@1` normalization, serialization, strict unknown-field/version
   rejection, export, migration, and retained-reader behavior pass for every
   qualified source and active or rollback generation.
2. Resolver property and conformance tests prove every mode traverses the same
   D15 sequence without gaps, duplicate identities, repeated Featured items,
   changed exclusions, or altered exact-choice order.
3. Parser and authorization tests reject malformed, duplicate, array, combined,
   excessive, forged, unknown, retired, cross-scope, and non-canonical inputs
   before cache or provider calls and without existence or count leakage.
4. Rendered-HTML and no-JavaScript tests prove every later window and item is
   reachable through sequential anchors with correct self-canonicals and
   Page-one normalization.
5. Browser tests cover several independent lists, direct links, copy/share,
   Back/Forward, refresh, hydration, cancellation, retry, removal, final
   windows, source drift, and accumulated-view deduplication.
6. Keyboard, focus, screen reader, touch, 320-pixel reflow, zoom, forced colors,
   localization, RTL/CJK, reduced motion, Pause, Skip, status announcements,
   no-JavaScript traversal, and footer reach pass automated and manual proof.
7. Cross-Tenant, environment, Site, locale, audience, generation, Page,
   placement, source, intent, curation, cache, count, timing, and poisoning tests
   prove fail-closed behavior.
8. Production-shaped Pages containing several lists meet source, query, count,
   prefetch, image, concurrency, latency, response, ordinal, and DOM budgets
   without N+1 reads or request storms.
9. D1 candidate validation, D13 execution reproof, adverse withdrawal,
   stale-generation rejection, active-generation continuity, source-adapter
   replacement, rollback, and cache races have deterministic outcomes.
10. Structured telemetry and operational views distinguish every typed outcome,
    identify one cause owner and safe next action, and contain no content, raw
    provider value, donor identity, or PII.

### Evidence and architectural record

- [D16 primary-source research, staff/public UX, adversarial review, and proof gates](./research/phase-23-d16-dynamic-list-pagination-research.md)
- [ADR-0160 — Link-native Public Page Windows and bounded list discovery](../../adr/0160-link-native-public-page-windows-and-bounded-list-discovery.md)
- [D15 / ADR-0159](../../adr/0159-three-bounded-content-list-curation-strategies.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [D2 / ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D3 / ADR-0147](../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [D7 / ADR-0151](../../adr/0151-semantic-ordinary-section-catalog-and-additive-bounded-composition-seam.md)
- [D8 / ADR-0152](../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [D9 / ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D16 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, provider adoption, issue publication, deployment, D1 activation,
release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D16's canonical
terms are preserved here and in ADR-0160 without overwriting accepted Phase 22
language.

## D17 — Derived Public Site Search Projection and adverse-first convergence

**Status:** Ratified and adversarially hardened on 2026-08-23.

> **C-prime-amended-and-hardened (C-prime-R) — One exact-scope, version-fenced, derived Public Site Search Projection under D1, compiled from qualified source-owned public projections through one versioned, public-safe Search Document contract into one Tenant × environment × Site × locale × public-audience × active-D1-generation index behind a provider-neutral Public Search port.** Search membership, rank, visibility, and removal are derived discovery facts only; Pages, publication, routes, redirects, subjects, permissions, consent, Phase 10 safety, designations, and financial facts remain source-authoritative. Draft, private, restricted, retired, orphaned, merely configured, or otherwise ineligible content is never indexed first and filtered afterward.
>
> Launch uses PostgreSQL weighted full-text search with GIN indexing, `websearch_to_tsquery`, deterministic total ordering, and narrowly bounded `pg_trgm` assistance for safe titles and approved tags only. A dedicated search provider is adopted only after measured relevance, language, scale, latency, or operational evidence proves Postgres inadequate. Payload’s Search Plugin may become a qualified CMS-source adapter, but only after exact-version testing and only through the same Search Document contract; it never becomes the publication firewall, public API, or unified cross-source authority.
>
> Every authoritative source transition advances one bounded Public Search Convergence Target containing the newest desired disposition—`present` or `absent`—and its source, publication, safety, D1-generation, and content-version fences. Core’s existing durable dispatch ledger, identifier-only Inngest envelope, product claim, retry, recovery scan, and dead-letter path execute that target; D17 creates no second queue, scheduler, generic workflow engine, or duplicated retry ledger. Workers always reload current desired state and use idempotent compare-and-set effects. Dispatch acceptance, worker completion, provider acceptance, query visibility, containment, physical absence, reconciliation, cache convergence, and external-crawler removal remain separate facts.
>
> Withdrawal, unpublish, consent loss, route loss, retirement, source removal, or Phase 10 reclassification receives adverse-first handling. The public resolver performs one bounded, set-based admission/version proof against compact source-owned current public heads for the complete candidate batch—never one remote call per result—and suppresses every withdrawn, unknown, failed, or version-mismatched hit before responding. This containment is effective independently of asynchronous cleanup. Priority deletion then removes the derived row, exact-key verification proves absence, and a durable version watermark prevents a delayed older upsert from resurrecting it. “Deletion confirmed” means absent from D17’s active index; it does not claim removal from backups, browser caches, archives, Google, Bing, or another independently owned surface.
>
> Incremental idempotent updates are normal. Full or source-specific rebuilds use bounded shadow generations, checkpoints, safe expected-versus-actual identity/version proof, mass-deletion anomaly guards, and an atomic derived-head switch only after validation. A failed rebuild leaves the prior safe generation serving, still subject to current admission proof. D1 remains the sole Site activation and rollback authority.
>
> Visitors receive a simple accessible submitted-search experience: labeled field, explicit Search action, shareable `?q=` URL, normal links, safe excerpts, a small optional content-family filter, D16 link-native result windows, distinct zero-results and unavailable states, and a polite result-status announcement. Suggestions are optional progressive enhancement. Search-result URLs are omitted from sitemaps and marked `noindex`. Raw search phrases are not placed in ordinary logs, donor profiles, metrics, or default analytics.
>
> Ordinary staff see one quiet derived status—**Search is up to date**, **Updating search**, **Safety update in progress**, **Some content may be missing**, **Search needs attention**, or **Rebuilding search**—with only the cause-owned action that can actually help. Platform operations receive privacy-safe lag distributions, oldest pending age, dead letters, suppression counts, drift classifications, deletion proof, reconciliation age, and rebuild progress. Tenant and Site identifiers remain in authorized operational records rather than unbounded metrics labels. Healthy Sites remain quiet; only containment failure, cross-scope exposure, verified unsafe results, or unresolved adverse failures page an operator.
>
> Phase 23 owns this general Public Site Search Projection and its purge convergence. Phase 22’s ministry directory and Phase 40’s governed global or AI search remain independently authoritative.

### Binding interpretation

- A **Public Site Search Projection** is one disposable, exact-scope discovery
  index compiled only from qualified source-owned public projections. It is not
  content, publication, route, consent, permission, safety, designation,
  financial, Site activation, or external-crawler truth.
- A **Search Document** is the one provider-neutral, versioned, public-safe DTO
  a qualified source may emit. It never contains raw Payload documents, private
  bodies, operational records, legal identity, provider credentials, or fields
  retained only so unsafe records can be filtered after indexing.
- A **Public Search Convergence Target** is one bounded newest desired-versus-
  verified state for an exact public identity. It is the D17 product-effect
  proof, not a queue, scheduled job, publication record, or replacement for the
  shared workflow dispatch ledger.
- **Search Freshness** measures favorable `present` convergence. Lag may cause
  a temporary safe false negative but never authorizes an older or unsafe hit.
- **Search Removal Containment** means the current public resolver suppresses a
  withdrawn, unknown, failed, or version-mismatched candidate before response.
  It is independent of physical derived-row cleanup.
- **Search Deletion Confirmation** proves exact absence from the active D17
  index. It does not claim source-history, backup, browser, archive, Google,
  Bing, ministry-directory, or Phase 40 deletion.
- A **Search Generation** is a rebuildable derived index generation switched
  only after validation. It never becomes a second D1 Site Plan release or
  rollback authority.

### Operational and UX consequences

- Launch is Postgres-first: weighted FTS, GIN, deterministic ranking, and
  bounded `pg_trgm`. Payload is an optional qualified feeder; a hosted provider
  requires measured exit evidence.
- The writer reuses Core's shared dispatch, identifier-only envelope, product
  claim, retry, five-minute recovery, and dead-letter paths. It adds no search
  queue, scheduler, per-tenant cron, generic workflow framework, or duplicate
  handoff state.
- Every public response applies one set-based current admission/version proof
  to the candidate batch. There is no per-hit remote N+1 and no stale cache or
  provider response may bypass reproof.
- Favorable delivery is incremental. Adverse changes suppress first, priority-
  delete second, verify exact absence third, and retain a version watermark
  until replay and reconciliation can no longer resurrect removed content.
- Full and source-specific rebuilds use bounded shadow generations,
  checkpoints, safe set/version proof, mass-deletion anomaly guards, and atomic
  derived-head switching; failure preserves the prior safe generation.
- Visitors receive one submitted-search baseline with shareable `?q=`, normal
  links, D16 windows, safe excerpts, a small optional family filter, distinct
  zero/unavailable states, polite result announcements, optional progressive
  suggestions, and `noindex` search-result URLs.
- Ordinary staff see only **Search is up to date**, **Updating search**,
  **Safety update in progress**, **Some content may be missing**, **Search needs
  attention**, or **Rebuilding search**, plus the exact useful cause-owned
  action. They never configure engines, index generations, rank math,
  thresholds, workflow runs, provider tasks, SQL, or RLS.
- Raw search phrases are absent from ordinary logs, metrics, donor profiles, and
  default analytics. Operational metrics use bounded dimensions; authorized
  Tenant/Site drill-down uses restricted records and opaque correlation.

Initial engineering objectives are zero returned ineligible hits; first-request
adverse containment; p99 `absent` target to verified index absence within 60
seconds with warning after 60 seconds and action at five minutes; p99 `present`
visibility within 60 seconds and p99.9 within five minutes; shared handoff
recovery by the next existing five-minute scan; one complete rotating
authoritative reconciliation within 24 hours; zero known adverse/orphan
visibility drift; and an initial general-drift objective at or below 0.1%.
These are code-owned, production-shaped validation objectives to calibrate from
evidence, not tenant controls, contractual SLAs, or provider guarantees.

### Rejected alternatives and prohibited shortcuts

- Payload Search Plugin as the complete public-search product, direct per-
  request UNION across operational sources, or a dedicated hosted provider at
  launch without measured need;
- insert-then-filter indexing, raw Payload or operational records, draft sync,
  unrestricted trigram/body search, database-produced trusted HTML snippets,
  arbitrary tenant query languages, SQL, filters, ranking formulas, or public
  provider cursors;
- one remote source call per result, a D17 queue/scheduler/retry ledger, per-
  tenant cron, manual index-row editing, broad destructive repair, or provider-
  console operations for ordinary staff;
- treating source commit, dispatch, worker completion, HTTP/provider
  acknowledgement, cache purge, index visibility, containment, physical
  absence, reconciliation, and crawler removal as one state;
- full rebuild per edit, unexplained empty snapshot or mass deletion, partial
  generation switch, unsafe old-generation rollback, or D17 as a second D1
  activation; and
- vector/semantic search, personalization, popular-query dashboards, raw-query
  analytics, voice/geo search, tenant-managed synonyms, arbitrary weights, or
  cross-locale search before measured product evidence.

### Required proof inherited by the eventual specification

1. Search Document and Public Search Convergence Target contracts pass strict
   normalization, versioning, serialization, export, retained-reader,
   successor-migration, unknown-field, and unknown-version tests.
2. Cross-Tenant, environment, Site, locale, audience, D1 generation, source,
   identity, provider, and cache tests reject forged, duplicate, array, stale,
   mismatched, and non-canonical inputs before unsafe work.
3. Draft, private, restricted, retired, orphaned, and disallowed data are absent
   from index rows, snippets, suggestions, facets, counts, logs, analytics,
   errors, timing buckets, and operational alerts.
4. Publish, update, route change, unpublish, consent withdrawal, Phase 10
   reclassification, valid republication, duplicate/late delivery, D1
   activation, rollback, and replay beyond Inngest's duplicate-event window
   converge idempotently with newest state winning.
5. Failure injection at source commit, target write, dispatch, work claim,
   provider acceptance, provider visibility, exact verification, cache
   convergence, reconciliation, and dead-letter recovery proves no lost target,
   false success, unsafe hit, resurrection, or duplicate effect.
6. Empty-source snapshots, mass-delete anomalies, old delete versus valid
   republication, expired claims, generic recovery backlog, provider timeout
   after success, and manual replay fail closed and retain sufficient evidence.
7. Full/source rebuilds prove bounded progress, safe identity/version sets,
   adverse absence, resumability, atomic derived-head switch, and continuity of
   the prior safe generation on failure.
8. PostgreSQL plans and production-shaped synthetic load prove GIN use, bounded
   trigram/suggestion work, deterministic ranking, query and window limits,
   concurrent rebuild behavior, no result-time N+1, and recovery capacity.
9. Server HTML, no-JavaScript, keyboard, screen-reader, touch, 320-pixel reflow,
   zoom, RTL/CJK, reduced-motion, Back/Forward, zero-result, unavailable,
   canonical-query, status-announcement, and `noindex` tests pass.
10. Low-cardinality telemetry separately proves favorable lag, adverse
    containment, physical absence, retries/dead letters, suppressions, drift,
    reconciliation, and rebuild progress with quiet healthy Sites and one
    actionable cause owner.

### Evidence and architectural record

- [D17 primary-source research, visitor/staff UX, adversarial review, health objectives, and proof gates](./research/phase-23-d17-public-site-search-research.md)
- [ADR-0161 — Derived Public Site Search Projection and adverse-first convergence](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D16 / ADR-0160](../../adr/0160-link-native-public-page-windows-and-bounded-list-discovery.md)
- [D15 / ADR-0159](../../adr/0159-three-bounded-content-list-curation-strategies.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Workflow orchestration specification](../../../openspec/specs/workflow-orchestration/spec.md)
- [Workflow dispatch ledger](../../../supabase/migrations/20260611134500_workflow_dispatch_ledger.sql)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D17 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D17's canonical
terms are preserved here and in ADR-0161 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D17 do not yet decide broader layout/default inheritance;
folders, taxonomies, and trash; forms; generalized media; broader SEO; locale
rollout; multi-Site readiness; audience/cache policy; preview tokens; exact
permission matrix; migration/cutover UX; operational-health product;
production capacity budgets; or exact qualified Payload version. Those remain
founder decisions or evidence-backed implementation proofs and will be resolved
one at a time.

## D18 — Purpose-bounded, authority-free Content Library folders

**Status:** Ratified and adversarially hardened on 2026-08-23.

> **C-prime-amended-and-hardened (C-prime-R) — one optional, private,
> purpose-bounded Content Library Folder contract over an exact-qualified,
> replaceable Payload hierarchy adapter:** D18 gives each exact Tenant ×
> environment × Site one staff-only organizational tree for stable D6 ordinary
> Page and Article identities only. Each eligible identity has one
> nonlocalized, non-editorial Library Placement in exactly one folder or the
> null-backed **Unfiled** state; folders have opaque stable identity, one
> editable display label, one optional same-scope parent, normalized
> case-insensitive sibling-label uniqueness, and a code-owned launch maximum of
> five named levels. Existing content starts Unfiled without inferred or
> mass-written placement.
>
> A folder supplies no Page ancestry, public path or breadcrumb, Navigation,
> Site, locale, Editorial Working Revision, active-editor lease, authorship,
> chronology, saved/reviewed/scheduled/published/activated/cached/searchable
> state, D1 generation, Phase 10 safety, permission, taxonomy, D14 source/list,
> D15 curation, D16 window, D17 public-search eligibility, lifecycle,
> retention, Trash, ownership, media custody, or operational truth. Folder
> create, rename, move, reparent, and remove are structurally side-effect-dark
> to every public projection and never advance last-content-edit time, public
> content digest, or a product Editorial Revision. Folder identity, label, and
> ancestry never enter public serializers, URLs, metadata, sitemaps, search
> documents, cache keys, telemetry, or unprivileged errors. Phase 22 records,
> Reusable Sections, Page Starters/Templates, Navigation, media, and
> operational records are excluded.
>
> Web Studio—not stock Payload Admin—is the product boundary. One quiet
> **Content Library** opens on **All content**, preserves **Unfiled**, labelled
> search with **This folder / All content** scope, type/status/assignment
> filters, and a paginated content list; it uses a collapsible semantic
> disclosure folder navigator on desktop and a searchable Core Sheet/picker on
> narrow screens. The item control is **Folder — staff organization only**;
> website address and Site Plan parent remain separate read-only facts.
> **Move to folder** is the first-class touch, keyboard, voice, and screen-
> reader path, with “This will not change the page address or what is
> published”; optional drag-and-drop can only invoke the same command. Single
> moves avoid redundant confirmation; bounded bulk moves show one exact count;
> loading, empty-folder, empty-search, permission, conflict, unavailable, and
> success states preserve context and report the next safe action through
> visible and programmatic status, never toast alone.
>
> Every create, rename, item move, bounded all-or-none bulk move, folder move,
> and remove passes through one server command boundary that re-proves actor,
> source-owned capability, immutable Tenant, environment, current Site,
> eligible family and record, folder and parent, expected generation,
> normalized-label uniqueness, cycle, and depth; uses one idempotency key, a
> short exact-scope serialized PostgreSQL transaction, compare-and-set fences,
> and one privacy-safe audit receipt; threads and awaits the same authenticated
> Payload request with user, overrideAccess false, and overrideLock false; and
> admits all effects or none. Same-scope parentage and placement, stable IDs,
> one-folder membership, normalized sibling uniqueness, and referential
> integrity are structurally enforced. Payload's privileged connection is
> never described as RLS-protected, browser filters never authorize, and raw
> folder mutations are unavailable to ordinary users.
>
> **Remove folder** never invokes Payload's recursive populated-hierarchy
> deletion. After an accessible exact consequence preview and fresh generation
> proof, one transaction moves directly filed content to the selected folder's
> parent or Unfiled, reparents immediate child folders to that parent or the
> root while preserving every descendant, blocks on collision, scope, depth,
> permission, or stale consequence, and deletes only the now-empty selected
> folder. It never deletes, trashes, unpublishes, or publicly moves content.
> Retry returns the same receipt and recovery is a newly validated forward
> command, not destructive rollback.
>
> Activation requires authoritative Site scope; additive Unfiled migration and
> provider-neutral export/rollback proof; exact-pin schema, access, lock,
> version, transaction, hierarchy and deletion conformance; authority-dark,
> tenant-isolation, concurrency, failpoint, capacity, mobile, keyboard,
> screen-reader, focus, zoom, touch and reduced-motion tests; and privacy-safe
> integrity and adapter-drift health. This introduces no per-folder ACL or
> inheritance, multi-folder membership, arbitrary folder type, tenant workflow
> or depth matrix, smart folder, public folder, closure table, event-sourced
> hierarchy, background propagation, second release state, media-folder
> authority, or second generic folder engine.

### Binding interpretation

1. **Content Library is a private organizational lens.** It may group only the
   stable D6 ordinary Page and Article identities within one exact Tenant ×
   environment × Site. It does not organize Phase 22 ministry records,
   Navigation, Reusable Sections, Page Starters/Templates, media, or operational
   records.
2. **Library Placement is one non-editorial fact per eligible identity.** It is
   either one opaque folder identity or null-backed Unfiled. It does not live on
   an Editorial Revision, vary by locale, or alter authorship, chronology,
   public digests, paths, releases, caches, or search.
3. **The hierarchy is deliberately small.** A folder has stable identity,
   display label, and an optional same-scope parent. The code-owned five-level
   launch ceiling, normalized case-insensitive sibling uniqueness, same-scope
   constraints, cycle rejection, and referential integrity are invariants—not
   tenant workflow settings.
4. **Payload is a qualified implementation adapter, not product authority.**
   Web Studio owns commands and UX. Exact provider behavior must pass
   conformance; ordinary users cannot mutate the raw provider folder surface.
5. **Every mutation is one atomic command.** Actor and scope reproof,
   idempotency, expected-generation comparison, a short serialized PostgreSQL
   transaction, Payload access and lock preservation, and the audit receipt
   succeed together or not at all.
6. **Removal means rehome, then remove only the empty folder.** It never means
   recursive content deletion, Trash, unpublish, archive, or a public move.
   Changed consequences, collisions, depth, scope, or permission block the
   command before partial state exists.
7. **Healthy operation is quiet and private.** Integrity, rejection, conflict,
   transaction, latency, and adapter-drift health may be observed without
   exposing private labels or ancestry in public output or unbounded metrics.

### Source-of-truth boundaries

| Fact                                                                         | Authority after D18                             | D18 rule                                                                                 |
| ---------------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Ordinary Page and Article identity                                           | D6 / qualified Payload content model            | Folders reference the stable identity; they never copy it.                               |
| Library Folder identity, label, and parent                                   | D18 private Content Library contract            | Exact Tenant × environment × Site scope; no public or permission semantics.              |
| Library Placement                                                            | D18 private Content Library contract            | One folder or null-backed Unfiled per eligible identity; nonlocalized and non-editorial. |
| Page ancestry, path, breadcrumb, and route continuity                        | D2–D3 Site Plan and route contracts             | A folder move cannot change any of these facts.                                          |
| Navigation                                                                   | D4–D5 Navigation revisions                      | Folder ancestry never creates or reorders Navigation.                                    |
| Editorial content, autosave, lease, version, and chronology                  | D11–D12                                         | Filing never creates or advances a product Editorial Revision or edit time.              |
| Publication, scheduling, activation, and rollback                            | D1 and D13                                      | No folder operation publishes, schedules, activates, or rolls back content.              |
| Dynamic sources, curation, and public windows                                | D14–D16                                         | Folder membership is not a public source, filter, ordering, or pagination fact.          |
| Public search eligibility and convergence                                    | D17                                             | Folder identity, label, and ancestry are absent from Search Documents and ranking.       |
| Safety, permission, taxonomy, lifecycle, retention, Trash, and media custody | Their owning phases or later Phase 23 decisions | Folder presence or ancestry never grants or infers them.                                 |

### UX and operational consequences

- Staff enter one **Content Library** that defaults to **All content**. Unfiled
  is always visible; staff do not have to construct a folder tree before doing
  useful work.
- Desktop uses a collapsible semantic folder navigator and paginated content
  list. Narrow screens use a searchable Core Sheet/picker rather than forcing a
  compressed tree.
- Search visibly offers **This folder** and **All content**. Type, status, and
  assignment filters remain content filters, not hidden authorization.
- The field label **Folder — staff organization only** and the separate
  read-only website address and Site Plan parent prevent the most consequential
  mental-model error.
- **Move to folder** is the authoritative action for pointer, touch, keyboard,
  voice, and screen-reader users. Drag-and-drop is optional enhancement only.
- A single move is direct and reversible by a later move. A bounded bulk move
  shows the exact item count and commits all-or-none. Folder removal shows fresh
  exact consequences and destination before execution.
- Empty folder, empty search, loading, permission, stale conflict, unavailable,
  and success states keep the user's scope and provide a cause-owned next step.
  Important outcomes are visible and programmatically announced, never toast
  only.
- Staff never need Payload vocabulary, provider hierarchy fields, recursive
  deletion behavior, transaction concepts, or implementation health metrics to
  complete an ordinary filing task.

### Rejected alternatives and prohibited shortcuts

- using the D2 Site Plan, public paths, breadcrumbs, menus, tags, permissions,
  or lifecycle as a folder tree;
- tenant-global folders, nullable-Site fallback, cross-environment ancestry, or
  copying folder values into each Editorial Revision or locale;
- media folders, Phase 22 records, Reusable Sections, templates, Navigation,
  operational records, arbitrary folder types, or multi-folder membership at
  launch;
- raw stock Payload Admin as Web Studio, direct browser/provider mutation,
  service-user `overrideAccess`, ignored locks, browser filters as authority, or
  claiming Payload's privileged connection is protected by Supabase RLS;
- drag-only filing, automatic filing guesses, forced folders, hidden Unfiled,
  recursive eager trees/counts, toast-only outcomes, or confirmation on every
  ordinary move;
- recursive populated-folder deletion, partial bulk moves, blind retry,
  mutable consequence previews, destructive rollback, background subtree
  propagation, or manual database repair;
- per-folder ACL/inheritance, smart folders, public folders, tenant-configured
  depth/workflow matrices, closure tables, event-sourced hierarchy, or a second
  generic folder engine; and
- sending folder identity, labels, ancestry, or search terms to public DTOs,
  metadata, URLs, sitemaps, search documents, cache keys, public telemetry, or
  unprivileged errors.

### Required proof inherited by the eventual specification

1. Existing Page and Article identities appear in Unfiled with no inferred
   placement, mass content update, Editorial Revision, chronology change, or
   public effect.
2. One item and one bounded selection move atomically; a duplicate retry or
   lost response returns the same privacy-safe receipt without duplicate work.
3. Folder create, rename, item move, folder move, and remove change no D1–D17
   authority, public content digest, Page path, Navigation, cache tag, public
   response, or product last-content-edit time.
4. Wrong-Tenant, wrong-environment, wrong-Site, wrong-family,
   permission-hidden, stale-generation, forged, and raw-provider requests
   cannot read, count, search, select, or mutate forbidden folder facts.
5. Stable identity, one-folder membership, same-scope ancestry and placement,
   Unicode/case-normalized sibling uniqueness, five-level depth, cycle
   prevention, and referential integrity hold under concurrency.
6. Removing leaf, populated, root-level, and nested folders preserves every
   content and descendant-folder identity, rehomes direct content and immediate
   children exactly as previewed, and deletes only the selected empty folder.
7. Move-versus-move, move-versus-remove, changed consequences, collision,
   capability revocation, audit failure, database failure, provider timeout,
   and retry fail with prior truth intact or the same committed receipt.
8. Exact pinned Payload schema, hierarchy, access, lock, version, hook,
   transaction, pagination, deletion, and upgrade behavior passes a replaceable
   adapter conformance suite before activation and after every upgrade.
9. Production-shaped skewed tenants prove indexed lazy expansion, labelled
   search scope, paginated lists, bounded bulk operations, mutation latency,
   absence of recursive count/path N+1 work, and safe capacity limits.
10. Server-rendered, mobile, 320-pixel reflow, keyboard, touch, voice,
    screen-reader, zoom, focus restoration, reduced-motion, drag fallback,
    empty/error/conflict, and status-announcement flows pass automated and
    manual accessibility verification.
11. Provider-neutral export/import round-trips stable folder identity, exact
    scope, parentage, labels, and content placement, while rollback disables
    actions and preserves inert data until an authorized complete census.
12. Privacy-safe integrity and adapter-drift health detect orphans, scope,
    cycle, depth, collision, rollback, retry, conflict, and latency failures
    without exposing private folder content or noisy healthy-state alerts.

### Evidence and architectural record

- [D18 primary-source research, staff UX, adversarial review, and proof gates](./research/phase-23-d18-content-library-folder-authority-research.md)
- [ADR-0162 — Purpose-bounded, authority-free Content Library folders](../../adr/0162-purpose-bounded-authority-free-content-library-folders.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D6 / ADR-0150](../../adr/0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [D2 / ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D18 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D18's canonical
terms are preserved here and in ADR-0162 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D18 do not yet decide content tags and taxonomies; Query Presets; Trash,
restore, retention, and permanent deletion; broader layout/default inheritance;
forms; generalized media; broader SEO; locale rollout; multi-Site readiness;
audience/cache policy; preview tokens; exact permission matrix;
migration/cutover UX; operational-health product; production capacity budgets;
or exact qualified Payload version. Those remain founder decisions or
evidence-backed implementation proofs and will be resolved one at a time.

## D19 — Versioned, release-bound Site Topic Profile and controlled Topic Sets

**Status:** Ratified and adversarially hardened on 2026-08-23.

> **C-prime-amended-and-hardened (C-prime-R) — one exact-scope, versioned and
> D1-release-bound Site Topic Profile with a small tenant-named catalog of
> controlled, public-safe Topic Sets:** D19 gives each exact Tenant ×
> environment × Site at most one stable Site Topic Profile identity with
> immutable versions, at most eight active Topic Sets, 500 active Topics across
> the profile, three single-parent levels including the root, and 20 direct
> Topic assignments per eligible stable D6 Page or Article. The optional setup
> starter copies roughly three editable sets—such as Ministry focus, Audience,
> and Resource theme—and 15–20 ordinary terms into that Site's private working
> profile; staff may instead start empty. Set names and terms are tenant-owned,
> assignment remains optional, and these code-owned ceilings are guardrails,
> not targets, plan controls, or tenant-configurable matrices. Phase 22
> Missionary Ministry Pages, Project/Campaign Pages, Ministry Updates,
> directories, and all specialized Phase 22 records remain excluded.
>
> Each Topic Set and Topic has one opaque stable never-reused identity and
> immutable Tenant × environment × Site scope. A Set has one localized
> preferred label, short purpose, Page/Article/both applicability, deterministic
> position, and active/retired state. A Topic has one immutable Set, one
> optional same-set parent, localized preferred label and short scope note,
> bounded localized staff-search alternate labels, deterministic sibling
> position, and active/retired/replaced state. Preferred and alternate label
> tokens are NFKC-, whitespace-, and Unicode-case-normalized and remain unique
> within exact Site × Set × locale across active, retired, and replaced
> identities; punctuation and diacritics remain meaningful. The Site default-
> locale label is required. Another public locale may supply its own label or
> one explicit visible use-default acknowledgement; with neither, the Topic is
> omitted from that locale's public projection and reported as missing-label
> health without blocking otherwise eligible content—never silent fallback.
> IDs, not labels, paths, slugs,
> Payload fields, or provider virtual paths, bind assignments, D14 filters,
> D17 projections, releases, audit, and migration.
>
> One stable Page or Article owns one immutable, versioned and nonlocalized
> Topic Assignment Snapshot containing direct stable Topic IDs. The observed
> profile generation is only a CAS/validation precondition, not assignment
> meaning, so a label-only profile change does not churn assignments. The editor
> says **Topics help people find related content;
> they do not change this page's address, menu, permissions, or publication;
> topics apply to all languages**, lets authors choose only existing active
> Topics through a search-first grouped picker, groups selected chips by Set,
> explains scope and breadcrumbs, preserves explicit parent and child choices,
> and provides no inline creation, free tags, comma import, or AI classification.
> D19 owns ancestry and direct assignments only: a child never automatically
> assigns, displays, filters, or searches its ancestors. D14 may explicitly
> qualify direct-only or include-descendants behavior in its own versioned
> contract; launch D17 consumes approved direct labels only.
> A D9 presentation may deliberately show a bounded direct-label row, but no
> Topic automatically becomes a public badge, facet, route, archive, SEO page,
> sitemap item, Navigation item, or publicly enumerable catalog.
>
> Site-wide classification creates no cross-locale transaction or Site-global
> serving head. Each exact Tenant × environment × Site × BCP-47 locale D1
> Public Site Generation independently pins the eligible content revision, the
> exact nonlocalized assignment snapshot, exact compatible Site Topic Profile
> structure revision, exact locale label revision or acknowledged default label
> when one is used, and current Phase-10-safe direct Topic projection plus only
> consumer-qualified ancestry semantics, then CAS-advances only that locale's
> serving head. A profile or assignment change may prepare every affected
> public locale, but Web Studio reports **Ready**, **Live**, or **Needs
> attention** per locale and may truthfully say **Live in 2 of 3 languages**;
> it never extends D10's presentation-only cohort exception, claims atomic
> all-locale activation, or silently rewrites locale Editorial Revisions. D13
> re-proves every exact pin at execution, and failure leaves each prior safe
> locale generation serving.
>
> A Topic supplies no Page/Article identity, route, slug, hierarchy,
> breadcrumb, redirect, Navigation, Dynamic Content List, publication,
> permission, audience access, workflow, review, ownership, lifecycle,
> retention, content family, donor/CRM segment, operational geography,
> financial fact, search eligibility, Phase 22 authority, or Phase 10 safety.
> The complete Page-or-Article projection—including direct Topic labels, any
> ancestry semantics explicitly requested by a qualified owning consumer, and
> their combination with copy and source facts—must pass
> current Phase 10 proof before favorable release; no starter People Group or
> exact Geography set is supplied, no catalog is automatically public, and
> adverse containment outranks ordinary D1/D17 convergence. D14 consumes only
> compatible stable Topic IDs and exact profile versions. D17 consumes only
> released, public-safe directly assigned labels through its Search
> Document contract; staff alternate labels remain private and do not enter
> public search, URLs, metadata, analytics, metrics, or logs. Public delivery
> reads one flat allowlisted compiled DTO, never Payload or a recursive mutable
> Topic graph.
>
> Web Studio owns one calm **Settings → Topics** manager and Core-consistent
> Page/Article picker. Setup offers **Start with examples** or **Start empty**;
> the overview shows plain-language Set purpose, family, active and usage
> counts, search, draft changes, and honest per-locale release health. Desktop
> uses a search/list-first two-pane workspace with disclosure/breadcrumb
> hierarchy and detail; a full ARIA tree is used only if a tested Core primitive
> exists. Narrow layouts use a full-height searchable Core Sheet and Core's
> comfortable 44-pixel controls. Search is primary in the content picker;
> browse-by-set is secondary. Named Move controls are authoritative and
> optional drag invokes the same command. Rename and draft edits stay quiet;
> reparent, replace/retire, and D1 **Publish site changes** show exact affected
> content, D14/D17, safety, label, and locale consequences. Loading, empty,
> no-match, read-only, missing-label, retired-selection, conflict, unavailable,
> unsafe, preparation-failure, partial-locale, and success states remain visible,
> focus-safe, recoverable through D12, and programmatically announced—never
> toast only.
>
> Every add, rename, reorder, move, replace, retire, discard-unused-draft,
> assignment, and release command re-proves authenticated actor and capability,
> immutable exact scope, eligible family and identity, expected profile and
> assignment generations, localized labels, same-set parentage, three-level
> acyclicity, normalized uniqueness, bounds, uses, D14/D17 compatibility, and
> Phase 10 consequence; uses one idempotency key, compare-and-set fence, short
> exact-profile serialized PostgreSQL transaction, awaited effects, and
> privacy-safe audit receipt; and threads the same authenticated Payload request
> with access and locks enforced. Structural composite foreign keys, unique
> label tokens, never-reused IDs, referential history, assignment ceilings, and
> supporting indexes back the command proof. Payload's privileged connection is
> never called RLS-protected, browser filters never authorize, and raw
> hierarchy create/delete/relationship mutations are unavailable to ordinary
> users.
>
> Rename preserves identity; released or assigned Topics are never deleted;
> reparenting previews changed ancestry and qualified consumer meaning; same-set
> Replace and retire stages one explicit successor profile plus explicit owner-
> specific Page/Article Assignment Revisions and D14 intent revisions under the
> same D1 candidate, never mutates live/history, and blocks on unresolved or
> incompatible uses; retirement without replacement blocks
> until assignments and filters are resolved; a Set retires only after its
> Topics; and only an unused never-released draft may be discarded. Old
> immutable generations remain readable, recovery is a newly proved forward
> version, and raw Payload recursive deletion is forbidden. Activation requires
> additive no-inference migration with existing content unassigned; explicit
> provenance-bearing import review; provider-neutral export and retained-reader
> proof; exact 4.0.0-internal.1f9ae9a schema, hierarchy, folder-coexistence,
> hook/delete/path, UI, access, lock, version, localization, transaction,
> migration and rollback conformance; tenant, race, failpoint, D1/D12/D13/D14/
> D17, Phase 10, capacity, mobile, keyboard, screen-reader, focus, zoom, touch
> and reflow tests; and privacy-safe per-locale, label, assignment, safety,
> projection, invariant and adapter-drift health. D19 introduces no universal
> ontology, polyhierarchy, per-topic ACL, workflow tag, public/private matrix,
> cross-Site/global vocabulary, tenant-authored schema, automatic archive,
> auto-tagging, semantic vector, personalization, or second release engine.

### Binding interpretation

1. **D19 is optional public-discovery classification.** It applies only to stable
   D6 Page and Article identities in one exact Tenant × environment × Site.
   Phase 22 Missionary, Project/Campaign, Ministry Update, directory, reach, and
   lifecycle records remain excluded.
2. **Stable product identity outranks provider presentation.** One Site Topic
   Profile owns immutable structure and locale-label revisions. Topic Set and
   Topic IDs are opaque, never reused, and never derived from labels, slugs,
   paths, or Payload identifiers.
3. **Launch bounds are code-owned invariants.** Eight active Topic Sets, 500
   active Topics, three levels including root, one optional same-set parent, and
   20 direct assignments per eligible identity are ceilings, not tenant
   configuration matrices.
4. **Assignment is nonlocalized and direct.** One immutable Topic Assignment
   Snapshot records direct Topic IDs for a stable Page or Article across its
   locales. Its observed profile generation is a CAS precondition, not
   assignment meaning; label-only changes do not churn assignments.
5. **Ancestry has no implicit consumer effect.** An assigned child never implies
   an assigned, displayed, searched, or filtered ancestor. D14 alone may choose
   direct-only or include-descendants semantics; launch D17 consumes approved
   direct labels only.
6. **Every locale releases independently through D1.** Each exact locale
   generation pins content, assignment, compatible structure, exact locale
   labels or acknowledged default, consumer semantics, and Phase 10 proof. D19
   creates no Site-global head or cross-locale transaction.
7. **Missing optional labels omit safely.** A missing locale label omits only
   that Topic from that locale's public projection unless a qualified consumer
   explicitly requires it. It never silently falls back or blanket-blocks
   otherwise eligible content.
8. **Topics confer no adjacent authority.** They do not own routes, Navigation,
   publication, permission, workflow, lifecycle, operational or financial
   facts, Phase 22 records, search eligibility, or safety. Every public use is
   explicit and complete-projection Phase 10 proof remains mandatory.
9. **Web Studio owns the product experience.** It owns the manager, picker,
   commands, impact previews, and D1 **Publish site changes** action. Stock
   Payload hierarchy and Admin behavior are not product authority.
10. **Lifecycle is forward-only and reference-safe.** Rename preserves identity;
    referenced or released Topics are never deleted; replace and retire are
    explicit, impact-proved, and coordinated with every owning revision
    contract.

### Source-of-truth boundaries

| Fact                                                                                    | Authority after D19         | D19 rule                                                                                        |
| --------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| Site Topic Profile, Topic Set, Topic, localized labels, ancestry, order, and lifecycle  | D19                         | Stable Site-scoped identities and immutable revisions; provider paths and fields are not truth. |
| Direct Page/Article Topic Assignment Snapshot                                           | D19                         | One optional nonlocalized snapshot of direct stable Topic IDs per eligible identity.            |
| Ordinary Page/Article identity and Editorial Working Revision                           | D6, D11, and D12            | Topics reference stable identity and never copy or advance editorial content.                   |
| Exact-locale activation and serving head                                                | D1                          | Each locale independently pins compatible D19 revisions; D19 creates no release head.           |
| Scheduled execution                                                                     | D13                         | Re-proves every exact D19 pin and safety consequence at execution.                              |
| Dynamic filtering and descendant semantics                                              | D14                         | Explicit compatible direct-only or include-descendants contract; D19 does not infer it.         |
| Public search eligibility, projection, and convergence                                  | D17                         | Only released public-safe direct labels enter launch Search Documents.                          |
| Private staff filing                                                                    | D18                         | Folders remain private organization and never become Topics.                                    |
| Publication-safety ceiling                                                              | Phase 10                    | Proves the complete content-and-Topic combination; adverse containment wins.                    |
| Page paths, breadcrumbs, redirects, and Navigation                                      | D2–D5                       | Topic changes cannot create or alter them.                                                      |
| Missionary, Project/Campaign, Ministry Update, directory, reach, and lifecycle records  | Phase 22                    | Specialized records remain excluded; no inferred ordinary-content conversion.                   |
| Operational geography, people groups, donor segments, designations, and financial facts | Their source-owning domains | D19 may not copy or infer them as operational truth.                                            |

### UX and operational consequences

- Setup offers **Start with examples** or **Start empty**. The optional starter
  copies only a small editable ministry-oriented vocabulary into that Site's
  private working profile.
- Staff use **Settings → Topics**, plain-language Topic Set purposes, search-
  first management, optional disclosure/breadcrumb hierarchy, exact usage and
  impact counts, and honest draft/live/per-locale health.
- Authors see why Topics exist and that assignments apply across languages but
  do not change address, menu, permission, or publication. Search is primary;
  browse-by-set is secondary.
- Existing active Topics are the only choices. There is no inline creation, free
  tag, comma import, or automatic AI classification.
- Desktop uses the Core two-pane pattern; narrow screens use a full-height
  searchable Sheet with comfortable 44-pixel controls. Named controls remain
  authoritative; optional drag invokes the same command.
- Rename remains quiet. Reparent, replace, retire, and D1 release show exact
  content, consumer, locale, and safety effects before commit.
- Loading, empty, no-match, read-only, missing-label, retired-selection,
  conflict, unavailable, unsafe, preparation-failure, partial-locale, and
  success states remain visible, focus-safe, recoverable, and programmatically
  announced rather than toast-only.
- **Publish site changes** remains the only favorable release action. Staff
  never need Payload hierarchy, provider paths, RLS, transaction, or revision-
  pin terminology to complete ordinary work.

### Rejected alternatives and prohibited shortcuts

- generic or free-form tags, inline term creation, comma import, automatic AI
  tagging, or inferred migration from strings;
- label, slug, path, hierarchy text, provider ID, or newest-record lookups as
  durable identity;
- tenant-global, cross-Site, universal missions, operational, exact-geography,
  or people-group starter vocabularies;
- polyhierarchy, arbitrary depth, per-Topic ACL/workflow/public matrices,
  tenant-authored schema, RDF infrastructure, semantic vectors, or
  personalization;
- automatic ancestor assignment, display, filtering, or search behavior;
- automatic public catalog enumeration, routes, archives, facets, SEO pages,
  sitemaps, Navigation, or a second release engine;
- copying content family, language, author, operational geography, people group,
  designation, donor segment, permission, workflow, or financial facts into
  Topics;
- duplicate per-locale assignments, silent locale fallback, Site-global
  activation, or extending D10's presentation-only cohort;
- raw Payload hierarchy administration, inline provider relationship mutation,
  recursive deletion, service-user access bypass, or claiming the privileged
  CMS connection is protected by Supabase RLS;
- in-place replacement, cascade rewrite, destructive rollback, manual database
  repair, or deletion of released or referenced identities; and
- absorbing Phase 22 specialized records, D18 folders, D14 filter authority, or
  D17 search authority into D19.

### Required proof inherited by the eventual specification

| Gate                    | Required evidence                                                                                                                                                                                                                                                                              | Rejects                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Authority darkness      | Topic-only changes do not alter routes, Navigation, permissions, workflow, content family, Phase 22 records, operational facts, public eligibility, or unsafe public facet counts                                                                                                              | Generic tags as hidden authority                                      |
| Exact scope             | Wrong Tenant, environment, Site, Topic Set, family, and role cannot read, count, search, assign, parent, or mutate                                                                                                                                                                             | Request-filter-only isolation                                         |
| Exact Payload pin       | Schema, relationship depth/population, hierarchy, after-read path leakage, hooks, parent/topic delete on has-many assignments, omitted access/lock overrides, UI inline creation, localization, transaction, folder coexistence, migration, and rollback conformance at 4.0.0-internal.1f9ae9a | Public-doc or v3 snapshot assumptions                                 |
| Stable identity         | Rename, translation, reorder, reparent, replacement, retained-reader, and export/import preserve opaque IDs and exact versions                                                                                                                                                                 | Labels, slugs, and provider IDs as truth                              |
| Label integrity         | NFKC/casefold/space collisions across preferred and alternate labels; missing locale; explicit default-label acknowledgement; punctuation/diacritic preservation                                                                                                                               | Silent fallback and duplicate vocabulary                              |
| Hierarchy               | Self/cross-set/cross-scope parent, cycle, depth four, inverse concurrent move, and stale parent fail atomically                                                                                                                                                                                | Read-before-write ancestry only                                       |
| Assignment              | Optional selection, 20 cap, exact parent/child direct choices, duplicate rejection, family applicability, stale retirement, D12 conflict and recovery                                                                                                                                          | Free tags, inline create, inferred ancestors, locale copies           |
| D1 locale release       | Each locale pins exact profile structure, assignment, label, compiler, and safety versions; missing optional labels omit safely; locale A may activate while locale B stays on its prior safe generation                                                                                       | Site-global head, cross-locale atomic claim, or blanket content block |
| Phase 10 safety         | Direct labels and only consumer-qualified ancestry semantics are proved with the complete public projection; adverse change suppresses before ordinary convergence                                                                                                                             | Per-term safety badges or publish-then-filter                         |
| D13 scheduling          | Scheduled execution re-proves exact profile, assignment, label, safety, D14, and public eligibility                                                                                                                                                                                            | Mutable latest at execution                                           |
| D14 integration         | Filters store stable Topic IDs plus exact compatible contract/profile versions; direct-only and explicit include-descendants modes are separately deterministic                                                                                                                                | Automatic ancestry, label/path filters and runtime provider graph     |
| D17 integration         | Only released public-safe directly assigned labels enter launch Search Documents; retired/unsafe labels contain, delete, and cannot resurrect                                                                                                                                                  | Private aliases, implicit ancestors, raw tags, stale upsert           |
| Lifecycle               | Rename, reparent, same-set replace, retire, set retirement, discard-unused-draft, retry, and lost response preserve history and exact impact                                                                                                                                                   | Raw delete, cascade, cross-set merge                                  |
| Concurrency/failure     | Duplicate retry, simultaneous normalized rename, inverse move, rename/retire/replace versus assignment/publish, stale profile/assignment CAS, audit/database/provider failure, and locale partial activation produce no partial product truth                                                  | Last-write-wins and false success                                     |
| Migration/export        | Existing content stays unassigned; mapped imports require review/provenance; exact neutral round trip and retained readers pass                                                                                                                                                                | AI/string inference and provider lock-in                              |
| Performance             | Indexed plans, lazy/paginated management, set-based impacts, bounded fan-out, flat public DTO, no public N+1 under production-shaped load                                                                                                                                                      | Whole-tree/public recursive reads                                     |
| Accessibility/usability | Ministry staff complete setup, assignment, move, replacement and release on desktop/mobile with keyboard, screen reader, touch, zoom and 320-pixel reflow                                                                                                                                      | Jargon, drag-only, toast-only, tree-only UI                           |
| Observability           | Per-locale release, label gaps, invalid references, safety, D14/D17, invariant and adapter health are actionable and privacy-safe                                                                                                                                                              | One generic CMS sync status                                           |

### Evidence and architectural record

- [D19 primary-source research, nonprofit UX, adversarial review, and proof gates](./research/phase-23-d19-site-topic-profile-research.md)
- [ADR-0163 — Versioned, release-bound Site Topic Profile and controlled Topic Sets](../../adr/0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md)
- [D18 / ADR-0162](../../adr/0162-purpose-bounded-authority-free-content-library-folders.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D13 / ADR-0157](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D6 / ADR-0150](../../adr/0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D19 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D19's canonical
terms are preserved here and in ADR-0163 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D19 do not yet decide Query Presets; Trash, restore, retention, and permanent
deletion; broader layout/default inheritance; forms; generalized media; broader
SEO; locale rollout; multi-Site readiness; audience/cache policy; preview
tokens; exact permission matrix; migration/cutover UX; operational-health
product; production capacity budgets; or exact qualified Payload version.
Private staff-only tags remain explicitly outside D19 and require evidence of a
separate need rather than expansion of the public Topic contract. These areas
remain founder decisions or evidence-backed implementation proofs and will be
resolved one at a time.

## D20 — Bounded personal and Site-shared Saved Library Views

**Status:** Ratified and adversarially hardened on 2026-08-23.

> **C-prime-R — Bounded personal and Site-shared Saved Library Views over
> current authority.** Phase 23 shall provide one staff-only **Saved Library
> View** capability for the D18 Content Library, scoped to exactly one `Tenant ×
environment × Site × Content Library surface`. `Query Preset` is provider
> terminology and shall not appear in ordinary staff UX. A Saved Library View
> is only a reusable live lens over content the current actor may already read;
> it grants no record, field, family, folder, Topic, Site, locale, tenant,
> workflow, publication, export, bulk-action, or public-site authority and
> creates no operational or publication truth.
>
> The surface shall contain one protected code-owned **All content** view,
> actor-owned **My views**, and exact-Site-owned **Shared views**. **All
> content** means all Content Library records currently readable by the actor,
> never all tenant records. Authorized Content Library staff may create,
> rename, update, favorite, and delete their own views and may apply or save a
> personal copy of a shared view. One Phase 12 source-owned capability—not a
> role string or a view-defined ACL—shall be registered to govern shared-view
> create, rename, update, and delete; no exact capability exists today, so D20
> cannot infer one from broad staff roles. Shared views retain creator and
> last-editor attribution but remain Site-owned through staff offboarding.
> There shall be no team,
> role, individual-user, public-link, cross-Site, cross-environment, or
> tenant-global sharing matrix at launch.
>
> Each persisted view shall have an opaque never-reused identity, normalized
> scoped name, personal or Site ownership, semantic contract version, current
> compare-and-set revision, immutable creator attribution, last-editor
> attribution, and a typed provider-neutral definition. That definition shall
> reuse the Content Library's own supported filter surface rather than invent a
> second query builder: conditions are combined with `AND`; a typed condition
> may offer a bounded `any of` value set; arbitrary nested Boolean expressions,
> regular expressions, raw Payload `Where`, GraphQL, SQL, JSONPath, custom
> code, tenant-supplied operators, and provider field or column paths are
> forbidden. A view may save at most 10 filter conditions, at most 20 values in
> one `any of` condition, one stable allowlisted sort plus identity tie-breaker,
> and at most 12 ordered visible semantic columns. Stable D18 folder and D19
> Topic identities may be operands only after their owning contracts exist and
> are qualified.
> Source-owned relative-date tokens may be saved only with deterministic
> server-side Site-time-zone semantics.
> A shared view may contain only operands explicitly classified
> `site_shareable` by their source-owned catalog. The share dialog shall make
> clear that its name and saved choices become visible to authorized Site staff,
> even though underlying content access does not change.
>
> A definition shall never persist matching rows, record IDs, result counts,
> cursors, offsets, the current page, selected rows, pending commands, editor
> state, bulk actions, groupings, permissions, or free-text search. Applying a
> view clears pagination, selection, pending actions, and ephemeral search so
> one-off state cannot change its apparent meaning. The resulting status shall
> say when search was cleared. Staff may then use a
> visibly separate **Search within this view** refinement; it does not mark the
> view changed and is never saved. The save dialog shall say when a present
> search term will not be included.
>
> Every apply shall resolve the opaque view server-side from trusted actor and
> exact scope, validate its semantic version and operands, compile it through
> one provider adapter, and run the resulting list under current record and
> field authorization. Sharing a view never shares access. Names, operands,
> available choices, counts, previews, exports, and actions receive the same
> authorization treatment as results. URLs may contain only an opaque view ID
> and separately allowlisted safe list state—never the view name, free text,
> raw filters, or provider query—and private or wrong-scope links shall return
> one generic unavailable response without confirming existence.
>
> Invalid membership-affecting conditions, inaccessible operands, and unknown
> semantic versions shall fail narrow: show **Needs attention**, disclose no
> inaccessible name, and return no rows until repaired or reset. A removed
> presentation-only column may be omitted with the same visible warning, and an
> invalid sort may fall back to the explicit stable default sort, because
> neither changes membership. No invalid element may be silently dropped. Old
> supported versions shall remain readable through deterministic migrations;
> unsupported definitions shall be quarantined, never guessed.
>
> UX shall use one calm `View: <name>` selector beside Search and Filters—not a
> row of tabs. Its grouped, searchable picker shall show **Built in**, **Shared
> with <Site>**, and **My views**, with actor-local favorites first and no
> organization-wide reordering. Selection and per-view management actions
> shall be separate accessible controls. Desktop shall use Core's established
> Base UI popover/combobox pattern; narrow or highly zoomed layouts shall expose
> the same content in a dialog or sheet. **Save current view** shall show a
> compact human-readable summary, require a name, default to **Just me**, and
> show **Shared with <Site>** only to a shared-view manager with plain copy that
> sharing does not grant content access. No `scope`, `ACL`, `visibility`,
> `workspace`, or provider jargon shall be exposed.
>
> A changed saved definition shall show explicit text **View changed** and
> shall never auto-save. Personal actions are **Update my view**, **Save as a
> new view**, and **Reset changes**. Ordinary staff changing a shared view
> receive **Save as my view** and **Reset changes**; a manager additionally
> receives **Update shared view** with a compact change summary and the quiet
> warning that it updates the view for everyone who can use it. Shared updates
> use idempotency and compare-and-set. A conflict offers **Load latest** or
> **Save as my view** and never silently merges or reports last-write-wins as
> success. A newer shared definition shall not replace an actor's current
> results mid-task.
> Personal and shared ownership shall never convert in place. Sharing a
> personal view creates a new Site-owned copy; saving a shared view privately
> creates a new actor-owned copy. The source view remains unchanged unless the
> actor separately performs an authorized update.
>
> Applying a view shall preserve or restore focus on the selector, mark the
> result region busy while loading, atomically replace results on success, and
> announce a concise result or error status without moving focus into the list.
> Escape shall close the picker without applying the merely highlighted view.
> Save, update, clone, repair, reset, favorite, and delete shall work by
> keyboard, screen reader, touch, 200% zoom, and 320-CSS-pixel reflow with
> visible focus and Core touch targets. Loading, no-match, provider failure,
> invalid-definition, capability denial, cap, conflict, and success states
> shall be visually and programmatically distinct and never toast-only.
>
> Launch shall allow at most 20 personal views per actor per exact scope, 20
> shared views per exact scope, and five actor-local favorites across personal
> and shared views; code-owned views consume no quota. Limits shall be explained
> before exhaustion and link to one **Manage saved views** surface. Deleting a
> view deletes only the convenience lens and shall say plainly that no Page or
> Article is changed. Switching Site or environment resets to **All content**;
> no view or condition crosses scope. D20 adds no view descriptions,
> notifications, automatic seed rows, automatic defaults, drag ordering,
> per-view result badges, immutable view-history subsystem, D1 release step,
> public index, or conversion into D14 Dynamic Content Lists or D17 search.
>
> The product boundary shall be an Asym-owned typed Saved Library View store,
> semantic query compiler, command service, and custom Core UI. Payload Query
> Presets may be used only as a replaceable persistence implementation behind
> that provider-neutral adapter after the exact pinned build proves complete
> exact-scope CRUD, current-user
> authorization including `overrideAccess: false` where Local API acts for a
> user, scope-and-ownership filtering before pagination or limit, visible error
> handling, transaction and retry behavior, query compilation, migration,
> neutral export, and upgrade
> conformance. Direct exposure of `payload-query-presets`, its raw endpoints,
> its stock **Only Me / Everyone / Specific Users** constraint matrix, or its
> silent-failure UI is forbidden. The adapter shall emit privacy-safe
> cause-coded health for invalid definitions, scope denials, capacity,
> truncation, conflicts, query cost, and migrations without logging names,
> operands, search text, or raw definitions.

### Binding interpretation

1. **A Saved Library View is a convenience lens only.** It creates no access,
   content, folder, Topic, workflow, publication, release, public search,
   public-page, export, bulk-action, or operational authority.
2. **Scope is exact and immutable.** Every view belongs to one Tenant,
   environment, Site, and D18 Content Library surface. Switching Site or
   environment resets to the protected **All content** view.
3. **Launch has three quiet groups.** Code owns **All content**; an actor owns
   **My views**; the exact Site owns **Shared views**. The shared-view manager
   capability comes from Phase 12 and is not inferred from role strings.
4. **Sharing copies rather than converts.** A personal-to-shared action creates
   a new Site-owned view; a shared-to-personal action creates a new actor-owned
   view. The source remains unchanged.
5. **Definitions are typed and bounded.** The saved contract stores stable
   semantic filters, one stable sort plus identity tie-breaker, and ordered
   semantic columns. It never stores raw provider query state or volatile
   results, search, pagination, selection, commands, or permissions.
6. **Current access always wins.** Applying or previewing a view resolves it
   server-side under trusted scope and current record and field authorization.
   Shared visibility never grants content access or confirms hidden operands.
7. **Invalidity is impact-classified.** Membership-affecting invalidity fails
   narrow with no rows; missing presentation columns may be visibly omitted;
   an invalid sort may visibly use the stable default. Nothing is silently
   dropped, widened, guessed, or overwritten.
8. **Collaboration is explicit.** Definitions never autosave. Shared mutation
   uses idempotency and compare-and-set, with **Load latest** or **Save as my
   view** recovery instead of silent merge or last-write-wins.
9. **The UI remains one quiet control.** A grouped selector beside Search and
   Filters owns applying and finding views; management actions remain separate
   accessible controls and adapt to a dialog or sheet on narrow layouts.
10. **Payload is replaceable machinery.** Asym owns the store contract,
    semantic compiler, commands, authorization, UX, migration, and proof.
    Stock Payload Query Preset records, ACL choices, endpoints, and UI are not
    the product contract.

### Downstream no-authority boundaries

| Fact                                                                                           | Authority after D20           | D20 rule                                                                |
| ---------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| Saved Library View identity, ownership, bounded semantic definition, version, and CAS revision | D20                           | Provider-neutral exact-scope convenience state.                         |
| Current record, field, count, preview, export, and action eligibility                          | Existing authorization owners | Re-proved on every apply; never copied into a view.                     |
| Ordinary Page and Article identity and content                                                 | D6, D11, and D12              | Views reference live authorized content without becoming content truth. |
| Private staff filing and folder lifecycle                                                      | D18                           | Stable folder IDs may be qualified operands; D20 does not own folders.  |
| Topic identity, lifecycle, and shareable classification                                        | D19                           | Stable Topic IDs may be qualified operands; D20 does not own Topics.    |
| Shared-view management capability                                                              | Phase 12                      | One source-owned capability; no role-string or view-defined ACL.        |
| Dynamic public lists                                                                           | D14                           | No Saved view converts to or updates a Dynamic Content List.            |
| Public Site Search Projection                                                                  | D17                           | No Saved view enters public search or changes search eligibility.       |
| Site generations, releases, scheduling, and safety                                             | D1, D13, and Phase 10         | D20 has no release head, scheduled action, or public effect.            |
| Missionary, Project/Campaign, Ministry Update, directory, reach, and lifecycle records         | Phase 22                      | Specialized records remain outside the D18/D20 launch surface.          |
| Payload Query Preset schema and endpoints                                                      | Payload adapter               | Replaceable implementation detail after exact-pin conformance only.     |

### UX and operational consequences

- Ministry staff can save recurring personal work lenses and use a small set of
  Site-owned shared lenses without learning provider terminology.
- Sharing remains understandable: everyone with Site Content Library access may
  see and apply a shared definition, but each receives only currently authorized
  rows, fields, counts, previews, and actions.
- Staff see one grouped **View** selector rather than a noisy tab strip or
  separate dashboard. Save defaults to **Just me**; shared changes state their
  impact and never autosave.
- Search remains a visibly separate ephemeral refinement. Applying a view clears
  volatile state, announces what changed without stealing focus, and preserves a
  stable recovery path.
- Broken membership filters fail narrow. Presentation-only degradation remains
  visible without unnecessarily hiding otherwise authorized results.
- Site ownership lets shared views survive staff offboarding; personal views
  follow the actor lifecycle and are never transferred.
- The 20-personal, 20-shared, five-favorite, 10-condition, 20-any-of, one-sort,
  and 12-column ceilings prevent an accidental general query platform while
  leaving ordinary ministry workflows flexible.
- Exact-scope, privacy, authorization, concurrency, query-cost, migration,
  accessibility, and provider-drift proof become activation prerequisites.

### Adversarial disposition

| Category                          | Material concern? | What could go wrong and why it matters                                                                                                                                                                                   | Severity    | Likelihood without hardening | Evidence/reasoning                                                                                                                                                                | Permanent prevention                                                                                                                                                            |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**           | Raw provider field paths, removed folders/Topics, or changed operators can make a Saved view fail or—worse—silently broaden.                                                                                             | High        | High                         | Payload stores provider-shaped `where` and columns; D18/D19 references have independent lifecycles.                                                                               | Store versioned semantic keys and stable IDs; validate on save/apply; fail narrow with repair UX; retain old readers.                                                           |
| Technical debt                    | **Yes**           | Turning on `enableQueryPresets` and exposing the generated record would spread Payload JSON, stock UI assumptions, and ACL semantics through product code.                                                               | High        | High                         | Current Core only plumbs the dormant UI seam; provider rows lack exact Site/environment scope, semantic version, CAS, and persisted sort.                                         | One Asym-owned typed store/command/compiler boundary, custom Core UI, conformance tests, and no raw provider imports outside the adapter.                                       |
| Edge cases                        | **Yes**           | Offboarded owners, duplicate normalized names, private deep links, retired operands, column/sort removal, ownership conversion, concurrent edits, cap exhaustion, and Site switches can confuse or corrupt expectations. | Medium–High | High                         | Comparable products expose ownership, cloning, sharing, and orphan-cleanup behaviors; D18/D19 add real operand lifecycles.                                                        | Site-own shared views; actor-own personal views; copy rather than convert; normalization, CAS, caps, generic unavailable state, tiered invalidity, and exhaustive state tests.  |
| Footguns                          | **Yes**           | “Everyone” sharing, per-operation ACLs, silent shared updates, raw query editing, or ambiguous Delete can expose definitions, overwrite team workflows, or be mistaken for deleting content.                             | High        | Medium–High                  | Payload defaults include Everyone/Specific Users separately for read/update/delete; modern products warn that view deletion is non-content deletion.                              | Only Just me/Site; capability-gated shared mutation; explicit impact and delete copy; clone path; no raw JSON or ACL builder.                                                   |
| Tenant safety                     | **Yes**           | A provider query scoped only by related collection can leak another tenant/Site's view name, filters, counts, Topic IDs, or content.                                                                                     | Critical    | Medium                       | Generated Payload Query Presets have no native Tenant/environment/Site columns; current Pages lack final D1 Site scope.                                                           | Trusted server-derived exact scope, structural same-scope constraints, negative isolation tests, privacy-safe errors, and no activation before D1/D18 authority.                |
| Overengineering                   | **Yes**           | Team/role/user sharing, per-operation ACLs, D1 releases, immutable view histories, arbitrary grouping, and cross-Site libraries create more administration than value.                                                   | Medium      | High                         | Payload can express a much broader matrix; enterprise comparables expose many options, but the ministry need is personal reuse plus a few shared queues.                          | One default + personal + Site-shared model; one capability; no release, groupBy, cross-Site, or per-view ACL matrix at launch.                                                  |
| UX/UI and user friction           | **Yes**           | “Query Preset” jargon, crowded tabs, hidden unsaved overrides, forced focus jumps, unexplained limits, and toast-only failure make staff distrust or abandon the feature.                                                | High        | High                         | HubSpot/Contentful/Contentstack use saved-view language and explicit clone/update patterns; Dynamics exposes modified state; WAI guidance supports status without focus movement. | One grouped `View: <name>` picker; explicit **View changed**; separate actions; responsive sheet; preserve selector focus; persistent recovery; ministry-staff usability tests. |
| Hidden coupling                   | **Yes**           | A Saved view could accidentally become a permission, workflow queue, Dynamic List, publication candidate, or public search definition.                                                                                   | High        | Medium                       | The same filter language can look reusable across D14, D17, permissions, and staff lists even though those have different authorities and safety obligations.                     | Explicit authority-negative contract; separate consumer types; no conversion or shared storage with D14/D17; current-access evaluation every time.                              |
| Failure modes                     | **Yes**           | Provider fetch/save/delete may fail silently, a stale view may open blank, a transient apply may erase useful results, or a lost response may duplicate a row.                                                           | High        | Medium–High                  | The exact pinned Payload UI catches failures without Core's required recovery and fetches a bounded list.                                                                         | Keep last valid results on transient apply failure with Retry; use visible states, idempotency, CAS, timeout telemetry, and fail-narrow membership errors.                      |
| Data integrity risks              | **Yes**           | Duplicate names, invalid operands, orphaned ownership, in-place ownership conversion, partial scope writes, and ambiguous migrations can create misleading views.                                                        | High        | Medium                       | Provider JSON is weakly semantic; multiple source-owned lifecycles can invalidate references; personal and Site ownership have different command rights.                          | Normalized scoped uniqueness, typed validation, copy-not-convert ownership, Site-owned shared records, atomic writes/audit, and explicit contract migrations.                   |
| Security and privacy risks        | **Yes**           | Even when records remain protected, a saved name, URL, operand, filter, restricted Topic/folder, staff name, workflow state, or content count can reveal sensitive ministry facts.                                       | High        | Medium                       | Contentful explicitly separates view visibility from record permissions; metadata itself can leak meaning through UI, analytics, referrers, and logs.                             | Same access on definitions/results, allowlists, opaque-ID URLs, generic unavailable state, privacy-safe telemetry, no raw URL/log data, and no saved search text.               |
| Scalability and performance risks | **Yes**           | Unlimited views and expensive predicates can overwhelm discovery, exceed provider limits, let another scope consume a 50-row fetch, or trigger slow counts and relationship joins.                                       | Medium–High | Medium                       | The pinned Payload UI requests 50 before Core has exact Site semantics; list count badges and broad relationship filters multiply query cost.                                     | Filter exact scope/owner before pagination or limit; 20+20 caps, 5 favorites, indexed predicates, stable sort, bounded columns, no per-view counts, budgets, and plan tests.    |
| Operational burden                | **Yes**           | Shared-view clutter, role-linked orphan records, stale filters, and unclear ownership create periodic administrator cleanup.                                                                                             | Medium      | High                         | Contentful documents stale role associations; broad sharing systems require ownership transfer and management.                                                                    | Site ownership, one manager capability, invalid/unused health, one simple Manage saved views surface, delete/repair actions, and no role/user sharing graph.                    |
| Observability gaps                | **Yes**           | Silent adapter errors, truncation, invalid semantic versions, or cross-scope denials may look like “no content.”                                                                                                         | High        | Medium–High                  | Pinned provider UI catches failures; empty and unavailable states are otherwise visually similar.                                                                                 | Cause-coded metrics and audit receipts, invalid-view health, cap/truncation alarms, privacy-safe scope-denial telemetry, and distinct UI states.                                |
| Dependency and integration risks  | **Yes**           | Payload internals can drift; current docs and exact pinned source already differ on sort, while the pin lacks exact scope/CAS and uses a 50-row, `lockDocuments: false`, partly silent UI path.                          | High        | High over upgrades           | Core uses an internal commit build; official current docs describe more than the pinned type/UI stores.                                                                           | Custom Core UI, exact-pin qualification, adapter-only imports, provider-neutral export, upgrade contract tests, and no reliance on undocumented stock behavior.                 |
| Migration and upgrade risks       | **Yes**           | Raw `Where` and provider columns become unreadable after schema renames or a CMS/provider change.                                                                                                                        | High        | Medium–High                  | Provider state names implementation fields, not stable product semantics.                                                                                                         | Versioned semantic DTO, old-reader retention, deterministic migration, quarantine on unknown keys, complete neutral export/import proof.                                        |
| Other development hazards         | **Yes**           | Two managers can overwrite a shared view; retries can duplicate; tests may prove only happy-path personal use; browser state can disagree with persisted state.                                                          | High        | Medium                       | Collaborative view editing and URL/persisted state create ordinary concurrency races.                                                                                             | CAS and idempotency, explicit dirty/base revision, negative and failpoint tests, no false success, and one command owner.                                                       |

No category is dismissed as impossible. The findings do not justify a general
query platform; they justify the small contract above.

### Rejected alternatives and prohibited shortcuts

- no Saved views, forcing staff to recreate repeated work;
- personal-only views, which force ministries to document or manually reproduce
  common queues;
- tenant-global, cross-Site, cross-environment, team, role, individual-user, or
  public-link sharing;
- using a saved view as permission, workflow, ownership, publication, release,
  public list, public search, folder, Topic, operational, or financial truth;
- raw Payload `Where`, provider paths, GraphQL, SQL, JSONPath, regex, formulas,
  scripts, arbitrary operators, or nested Boolean query builders;
- persisting rows, IDs, snapshots, counts, cursors, pages, selections, pending
  commands, bulk actions, free-text search, permissions, or editor state;
- personal/shared ownership conversion in place, shared definition autosave,
  implicit merge, or last-write-wins;
- silent removal of invalid conditions, silent sort fallback, provider-failure
  empty states, toast-only feedback, focus jumps, tab overflow, or mouse-only
  controls;
- per-view descriptions, notifications, result badges, custom shared ordering,
  full immutable view history, D1 release, or a second operational dashboard;
- direct exposure of `payload-query-presets`, its raw endpoints, stock sharing
  constraint editor, or silent-failure UI; and
- assuming Payload's privileged connection is Supabase-RLS-protected or using
  browser filters as authorization.

### Required proof inherited by the eventual specification

Implementation remains unauthorized by this ADR. A future authorized change
must prove at minimum:

1. Wrong-Tenant, wrong-environment, wrong-Site, wrong-actor, wrong-surface, and
   wrong-capability attempts cannot read or infer names, definitions, operands,
   counts, existence, previews, results, or mutations.
2. Two actors applying one shared view receive only their currently authorized
   records, fields, counts, previews, exports, and actions.
3. The bounded semantic grammar, stable IDs, normalized scoped names, old
   readers, deterministic migrations, neutral export, invalid quarantine, and
   rollback survive source rename, retirement, adapter replacement, and upgrade.
4. Membership-affecting invalidity fails narrow; missing columns and invalid sort
   degrade only as specified and visibly; no provider failure becomes a false
   empty result or widened query.
5. Personal and shared create, rename, apply, favorite, copy, update, repair,
   reset, delete, offboarding, cap, retry, lost-response, capability-revocation,
   and private-link paths are idempotent and correctly scoped.
6. Concurrent shared edits use compare-and-set, expose one recoverable conflict,
   never auto-replace an actor's in-progress results, and never report
   last-write-wins or partial work as success.
7. Trusted scope and authorization are applied before pagination and limits;
   allowlisted filters use indexed plans, stable sort and pagination, bounded
   relationship resolution, timeouts, and no N+1 behavior under production-
   shaped load.
8. URLs, referrers, analytics, logs, metrics, audit, and health contain no view
   names, free text, hidden operand labels, or raw definitions; wrong-scope and
   private IDs remain indistinguishable.
9. The exact pinned Payload schema, CRUD access, Local and REST behavior, UI
   fetch bound, error handling, query compilation, transaction, retry,
   migration, neutral export, and upgrade behavior pass a replaceable adapter
   conformance suite.
10. Applying, saving, sharing, updating, or deleting a view changes no content,
    access, workflow, folder, Topic, public list, release, cache, search
    projection, or public page.
11. Ministry staff complete apply, search-within, save, share, copy, update,
    conflict recovery, repair, reset, favorite, and delete on desktop and narrow
    layouts with keyboard, screen reader, touch, 200% zoom, 320-CSS-pixel
    reflow, visible focus, and non-toast status feedback.
12. Privacy-safe cause-coded health distinguishes scope denial, invalid
    membership, presentation degradation, provider failure, cap, truncation,
    conflict, query cost, and migration without creating a new launch
    operations dashboard.

### Exact conformance matrix

| Gate                     | Required evidence                                                                                                                                                                                                                                         | Rejects                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Authority darkness       | Applying, sharing, updating, or deleting a view changes no content, access, workflow, folder, Topic, release, public search, cache, or public page.                                                                                                       | Saved view as permission, workflow, D14, or release authority.                     |
| Exact scope              | Wrong Tenant, environment, Site, actor, surface, and capability cannot read names, definitions, counts, apply, clone, update, or delete.                                                                                                                  | Browser filters and related-collection-only isolation.                             |
| Current access           | Two actors applying the same shared view receive only their currently readable records/fields/counts/actions.                                                                                                                                             | Shared view granting or leaking content.                                           |
| Semantic stability       | The 10-condition/20-any-of/one-sort/12-column grammar round-trips; folder/Topic rename preserves stable-ID meaning; membership invalidity fails no-rows; missing columns and invalid sort degrade only as visibly specified; unknown versions quarantine. | Silent condition drop, widened results, provider path as truth, guessed migration. |
| Payload exact pin        | Schema, CRUD/access, Local/REST, UI fetch bound, error handling, sort/search behavior, transaction, migration, and upgrade conformance pass at `4.0.0-internal.1f9ae9a`.                                                                                  | “Payload supports presets” as sufficient evidence.                                 |
| Personal lifecycle       | Create, rename, apply, favorite, clone, update, delete, actor offboarding, cap, retry, and private deep-link tests pass.                                                                                                                                  | Orphan or cross-user private visibility.                                           |
| Shared lifecycle         | Site ownership, manager capability, copy-not-convert sharing, ordinary Save as my view, shared CAS conflict, attribution/audit, delete copy, offboarding, and cap tests pass.                                                                             | Everyone/role/user ACL matrix, ownership conversion, and last-write-wins.          |
| Failure containment      | Provider/database/audit failure, timeout, lost response, invalid membership, presentation degradation, and scope-before-limit behavior are visible, retry-safe, and never return widened results or false success.                                        | Silent empty list, cross-scope truncation, and duplicate records.                  |
| Performance              | Allowlisted filters use indexed production-shaped plans, stable pagination/sort, bounded columns, timeouts, and no N+1 relationship resolution.                                                                                                           | Arbitrary queries and unbounded counts.                                            |
| Migration/export         | Provider-neutral round trip, old-reader retention, explicit semantic migration, invalid quarantine, and rollback pass.                                                                                                                                    | Raw `Where` lock-in.                                                               |
| Accessibility/usability  | Ministry staff complete save, share, clone, repair, reset, and delete on desktop/mobile with keyboard, screen reader, touch, zoom, and reflow; apply preserves selector focus while busy/status semantics communicate change.                             | Jargon, tab overflow, forced focus jump, toast-only, mouse-only interaction.       |
| URL and metadata privacy | URLs contain only opaque IDs and safe allowlisted state; names, free text, operands, and raw definitions stay out of URLs, referrers, analytics, and logs; wrong-scope/private IDs are indistinguishable.                                                 | Saved-view metadata or existence leaking across scopes.                            |
| Observability            | Cause-coded scope denial, invalid view, adapter failure, cap/truncation, migration, and query-cost health are actionable and privacy-safe.                                                                                                                | One generic CMS error or raw query logging.                                        |

### Evidence and architectural record

- [D20 primary-source research, exact-provider audit, nonprofit UX, adversarial review, and proof gates](./research/phase-23-d20-saved-library-views-research.md)
- [ADR-0164 — Bounded personal and Site-shared Saved Library Views over current authority](../../adr/0164-bounded-personal-and-site-shared-saved-library-views.md)
- [D19 / ADR-0163](../../adr/0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md)
- [D18 / ADR-0162](../../adr/0162-purpose-bounded-authority-free-content-library-folders.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D13 / ADR-0157](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D6 / ADR-0150](../../adr/0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Payload Query Presets](https://payloadcms.com/docs/query-presets/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload Query Preset types at Core's exact pin](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/payload/src/query-presets/types.ts)
- [Payload Query Preset UI at Core's exact pin](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/packages/ui/src/elements/QueryPresets/QueryPresetBar/index.tsx)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D20 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D20's canonical
terms are preserved here and in ADR-0164 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D20 do not yet decide Trash, restore, retention, and permanent deletion;
broader layout/default inheritance; forms; generalized media; broader SEO;
locale rollout; multi-Site readiness; audience/cache policy; preview tokens;
exact permission matrix; migration/cutover UX; operational-health product;
production capacity budgets; or the exact qualified Payload version. Private
staff-only tags remain separate from D19 Topics and D20 Saved views and require
evidence of a distinct need. These areas remain founder decisions or evidence-
backed implementation proofs and will be resolved one at a time.

## D21 — Asym-owned, reference-aware recoverable Trash

**Status:** Ratified and adversarially hardened on 2026-08-23.

> **C-prime-R — Asym-owned, reference-aware recoverable Trash with private
> restoration and proof-gated purge.** Phase 23 shall provide one recoverable
> Trash lifecycle for each stable ordinary `Page` or `Article` identity in one
> exact Tenant × environment × Site. Trash applies to the whole identity and
> every locale variant together. Locale-specific withdrawal remains a release
> or publication action, not a second Trash model. Phase 22 specialized public
> ministry pages and Phase 29 media-binary disposal remain outside D21.
>
> Trash, unpublish, archive, and permanent purge shall remain visibly and
> semantically distinct. **Unpublish** removes a release from public service
> while leaving the identity in ordinary editorial work. **Archive** is a
> recoverable editorial classification when an owning decision defines it.
> **Move to Trash** removes the identity from ordinary work and starts its
> recovery lifecycle. **Permanently delete** irreversibly removes eligible
> content bodies and versions while preserving only the minimal non-content
> tombstone, route disposition, and audit evidence required by their owners.
> Trash shall never be presented as a synonym for unpublish or archive.
>
> A successful **Move to Trash** command shall atomically establish the source
> fact that the identity is trashed and therefore immediately ineligible for
> favorable public service. Existing D1 owners shall then remove or suppress
> every affected public release, locale, route, public Navigation target, Dynamic
> Content List result, public search document, sitemap entry, cached
> projection, social preview, and scheduled publication adverse-first. A
> downstream failure shall leave the source safely trashed, expose cause-coded
> **Removal needs attention** health, and remain retryable. It shall never keep
> serving content, resurrect it, or report full completion merely because the
> provider row acquired `deletedAt`.
> Adverse suppression shall not rewrite a D4 authored or released Navigation
> Revision. It preserves the stable target reference and creates cause-owned
> repair debt; the next favorable Site Plan release must resolve or deliberately
> remove that reference before activation.
>
> Moving content to Trash shall not cascade into referenced or child Pages,
> Articles, folders, Topics, navigation definitions, schedules, media records, or media
> binaries. Before the command, Asym shall derive a bounded impact preview from
> current source owners. For an unpublished and unreferenced draft, the action
> may complete directly with a persistent **Moved to Trash — Undo** status. For
> anything public, scheduled, linked, or otherwise consequential, one calm
> confirmation shall name the content, say **This takes every language version
> offline**, and summarize current routes, navigation, schedules, and other
> affected surfaces. Its actions shall be **Cancel** and **Take offline and move
> to Trash**. Unknown or truncated impact blocks the command; it is not treated
> as no impact. A required Site root/home replacement or D2 hierarchy repair
> also blocks ordinary Trash and names the existing cause-owned next action;
> D21 never fabricates a replacement, reparents child Pages, or leaves an
> invalid Site generation. At launch, each command handles one identity; there is no bulk
> move, bulk restore, bulk purge, select-all-across-results, or **Empty Trash**.
> The command shall also respect D12's active-editor fence: it requires a clean,
> saved expected revision and cannot remove an identity held by another valid
> editor lease. The actor is directed to coordinate or use the separately
> authorized unpublish path for urgent public withdrawal; Trash never discards
> unsaved work or overrides an active editor by guessing that a lease is stale.
>
> Trash shall be a quiet staff-only Content Library destination, not another
> permanent navigation hierarchy. Ordinary lists, D20 Saved Library Views,
> public queries, and favorable release builders exclude trashed identities by
> construction. The dedicated Trash list shall show only identities the current
> actor may currently inspect in the exact Site and shall provide search plus
> bounded family/status filters. Each row shall show title, Page or Article,
> who moved it, when, a plain recovery message, and one derived status:
> **Recoverable**, **Removal needs attention**, **Review required**, or
> **Eligible for permanent deletion**. A simple draft shall say **Protected from
> permanent deletion until <date>**, never falsely promise deletion on that
> date. Ever-released, referenced, held, or unresolved content shall instead say
> **No automatic deletion — review required**. A detail
> view shall be read-only but retain authorized versions, locale coverage,
> references, public-removal health, route disposition, and audit history.
> **Undo** appears only for the direct move of a never-released private draft and
> means restoring that draft privately. An ever-released identity never offers a
> generic Undo that could imply republication; its action is always **Restore as
> draft**.
>
> Every identity shall have one code-owned minimum recovery window of 90 complete
> days from the authoritative server timestamp. Tenant administrators cannot
> shorten it, and daylight-saving or browser clocks cannot change it. After the
> window, automatic purge may process only a never-released, currently
> unreferenced, unheld draft whose exact scope, identity revision, access-neutral
> purge policy, references, route state, schedules, and deletion convergence are
> all re-proven at execution. A failed or uncertain proof leaves it in Trash as
> **Review required**. Ever-released, referenced, held, or deletion-debt-bearing
> content is never automatically purged. D21 creates no tenant retention matrix,
> general legal-hold product, or promise that backups are synchronously erased;
> policy-specific retention or erasure remains with its source owner.
>
> **Restore as draft** shall preserve the stable content identity, attribution,
> versions, locale content, folder and Topic assignments, and surviving
> references, but shall create or select a private working revision. Restore
> shall never republish, reschedule, recache, reindex, recreate a social preview,
> or reinsert navigation. It shall not imply that previous public-removal debt is
> repaired. The former path remains governed by D2/D3 route authority. D3
> historical path reservation normally prevents a collision. If legacy or
> corrupt data, or an explicitly authorized route transfer, nevertheless creates
> one, restore blocks as an exceptional repair with **Choose a new path** or the
> authorized route-resolution flow; the system never steals a path, silently
> changes a slug, or restores under an invented URL.
> Restoring while another actor changed, purged, or restored the identity fails
> safely and offers **Refresh status**.
> The minimal route claim/disposition survives permanent content purge and the
> stable identity is never recycled, so a later Page cannot silently inherit the
> old URL or history.
>
> **Permanently delete** shall be a separate Phase 12 semantic capability and
> an Asym-owned command, not Payload's ordinary delete checkbox. It shall appear
> only after the minimum window and current eligibility proof, and only to a
> capability holder. One irreversible confirmation shall state exactly what
> content and version history will be removed, what minimal evidence remains,
> and that restoration will no longer be possible. Focus starts on **Cancel**;
> the destructive action is labeled **Permanently delete**. D21 shall not require
> typing a title or `DELETE` at launch: authorization, eligibility proof, clear
> consequences, separated action placement, and confirmation provide protection
> without ritual friction. Purge shall never reuse the stable identity, infer a
> redirect, delete shared media, or erase required audit and route evidence.
> Current stable references, a required Site root/home role, unresolved hierarchy,
> or any adverse-convergence debt shall block purge until its owning workflow
> resolves the cause.
> Permanent purge also blocks until every current source reference—including
> authored Navigation repair debt—is resolved by its owner; purge cannot make a
> dangling reference disappear by deleting its evidence.
>
> Every Trash command shall derive Tenant, environment, Site, actor, capability,
> identity, expected revision, and authoritative time on the server; use
> idempotency and compare-and-set; recheck current authorization and lifecycle;
> and append immutable cause attribution. Provider Local API calls acting for a
> user shall preserve that user context and shall not use privileged access as
> product authorization. A wrong-Site, wrong-Tenant, wrong-environment, missing,
> or unauthorized identity returns one non-enumerating unavailable result. Trash
> visibility, counts, references, audit projections, job payloads, logs, traces,
> and alerts shall not expose content or cross-scope existence.
>
> Payload 4 Trash may supply `deletedAt`, trashed-document querying, read-only
> provider views, and provider persistence only behind this replaceable product
> boundary. The stock permanent-delete bypass, **Empty Trash**, bulk permanent
> deletion, one coarse `delete` access decision, raw Trash endpoints, and stock
> UI shall not become Asym authority. Repository and provider upgrades must pass
> contract tests proving non-trash queries exclude trashed identities, all
> locale data survives move and private restore, versions cannot be restored
> while trashed, provider access cannot bypass Asym commands, and provider
> errors never become false success.
>
> The staff experience shall use plain ministry language, progressive
> disclosure, Core semantic colors and components, comfortable touch targets,
> and no legalistic or frightening copy. Established shared Base UI primitives
> shall own dialog, menu, focus, and keyboard behavior; D21 shall not invent ARIA
> replicas or an app-local component system. Reversible move/restore results shall
> be persistent and programmatically announced without stealing focus.
> Consequential and irreversible dialogs shall follow the modal-dialog pattern:
> keyboard focus contained inside, Escape and visible Cancel available before
> commitment, initial focus on the least destructive action, and logical focus
> restoration after completion. Loading, impact unavailable, permission denial,
> conflict, path collision, downstream-removal debt, restore success, purge
> eligibility, purge failure, and purge success shall each be visually and
> programmatically distinct and never toast-only. The complete flow shall work
> with keyboard, screen reader, touch, 200% zoom, 320-CSS-pixel reflow, reduced
> motion, slow networks, and session expiry.
>
> D21 shall not add a generic lifecycle engine, customizable Trash stages,
> tenant-set retention rules, recycle-bin folders, approval workflow, restore
> wizard, Trash-aware Saved Views, content-body tombstone archive, or media
> garbage collector. It authorizes no implementation. Activation requires the
> proof matrix below and production-shaped usability testing with both frequent
> communications staff and occasional ministry administrators.

### Binding interpretation

1. **Trash is a whole-identity lifecycle.** One ordinary Page or Article and
   all of its locale variants move together inside one exact Tenant ×
   environment × Site. Locale-only withdrawal remains publication work.
2. **The source fact fails safe.** Once moved, the identity is immediately
   ineligible for favorable service; every public projection converges
   adverse-first and exposes retryable debt instead of false completion.
3. **Trash never cascades.** Child and referencing content, Navigation
   history, schedules, folders, Topics, media records, and media binaries keep
   their own authority and lifecycle.
4. **Four verbs remain distinct.** Unpublish, archive, Move to Trash, and
   permanently delete have separate meaning, copy, authorization, and audit
   causes.
5. **Recovery is protected for 90 days.** Only a re-proven never-released,
   unreferenced, unheld private draft may purge automatically afterward.
   Consequential or uncertain content requires explicit review and authority.
6. **Restore is private.** Restore as draft preserves identity and history but
   never republishes, reschedules, reindexes, recaches, or repairs references
   by implication.
7. **Purge is exceptional.** It requires a distinct Phase 12 capability,
   current proof, one irreversible confirmation, resolved references, and a
   minimal non-content tombstone and route disposition.
8. **Scope and authorization are server-derived.** Every view, count, impact
   preview, command, job, audit projection, and result rechecks current exact
   scope without privileged Local API becoming product authority.
9. **Payload remains replaceable machinery.** Its `deletedAt` persistence may
   be used behind an Asym adapter; its stock bypass, Empty Trash, bulk
   permanent deletion, raw endpoints, coarse delete access, and UI are not
   product authority.
10. **Launch remains intentionally bounded.** One-item commands, one quiet
    Trash surface, four derived statuses, no tenant retention matrix, no
    generic lifecycle engine, no restore wizard, and no media garbage
    collector.

### Downstream no-authority boundaries

| Fact                                                                                                                    | Authority after D21               | D21 rule                                                                                                                       |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Ordinary Page or Article Trash source state, recovery timing, private restore, purge eligibility, and minimal tombstone | D21                               | Stable exact-scope lifecycle; no provider or projection may invent it.                                                         |
| Public Site Generation and favorable/adverse service                                                                    | D1 and Phase 10                   | D21 makes content ineligible; existing owners withdraw adverse-first and prove convergence.                                    |
| Hierarchy, current and historical paths, replacements, redirects, and 404/410 disposition                               | D2 and D3                         | Trash cannot reparent, steal, recycle, silently mutate, or invent a path.                                                      |
| Authored and released Navigation revisions                                                                              | D4                                | Public targets suppress adverse-first; authored history remains and unresolved repair debt blocks favorable release and purge. |
| Working revision, autosave, active editor, and conflict fencing                                                         | D12                               | Trash requires a clean expected revision and respects the active-editor lease.                                                 |
| Scheduled publication appointments                                                                                      | D13                               | Trash invalidates favorable execution; schedules cannot resurrect the identity.                                                |
| Dynamic Content List and public-search membership                                                                       | D14 and D17                       | Trashed identities are absent; deletion lag is visible and reconciled.                                                         |
| Content Library folders, Topics, and Saved Library Views                                                                | D18, D19, and D20                 | They organize, classify, or filter; none owns or expands Trash lifecycle.                                                      |
| Media records and binaries                                                                                              | Existing media owner and Phase 29 | D21 never cascades into or garbage-collects media.                                                                             |
| Capabilities and current access                                                                                         | Phase 12 and Phase 10             | Move, restore, and purge remain distinct and visibility ceilings continue to apply.                                            |
| Payload `deletedAt`, queries, versions, and provider views                                                              | Payload adapter                   | Replaceable persistence detail after exact-pin conformance only.                                                               |

### UX and operational consequences

- Occasional ministry staff receive the familiar everyday sequence **Move to
  Trash → inspect → Restore as draft**, while irreversible deletion remains
  rare, separate, and capability-gated.
- A simple private draft can be recovered immediately with private Undo;
  public, scheduled, or referenced content receives a calm current-impact
  review without exposing a dependency graph.
- Staff never receive a green success state while a public projection is still
  silently favorable; unresolved removal appears as a truthful, cause-owned
  status with a recovery path.
- All locale variants move together, preventing partially deleted identities
  and eliminating a second locale-level Trash model.
- Ninety protected days fit intermittent nonprofit staffing without creating a
  tenant-configurable retention product. The date is a minimum protection
  boundary, not a promise of deletion.
- Restore cannot surprise staff or donors by republishing, rescheduling,
  indexing, caching, or reinserting Navigation.
- Stable references, routes, and minimal evidence survive purge, preventing
  identity reuse, dangling-reference erasure, and invented redirects.
- The operational cost is concentrated in bounded reconciliation and proof;
  routine staff do not maintain jobs, repair database rows, or interpret
  provider internals.
- Exact-scope, concurrency, accessibility, migration, provider-drift, and
  production-capacity proof become activation prerequisites.

### Adversarial disposition

| Category                          | Material concern? | What could go wrong and why it matters                                                                                                                                                                                                                              | Severity | Likelihood without hardening | Evidence or reasoning                                                                                                                                           | Permanent prevention                                                                                                                                                                                                              |
| --------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**           | A single `deletedAt` flag can appear safe while navigation, schedules, caches, search, or a locale still serves the identity. Restore can also fail after a path transfer or schema change.                                                                         | Critical | High                         | Payload models provider Trash, while D1/D2/D3/D13/D17 own separate serving facts and adverse convergence.                                                       | Treat Trash as a source lifecycle command with adverse-first projections, explicit route ownership, retryable health, stable identity, and contract tests across every consumer.                                                  |
| Technical debt                    | **Yes**           | Enabling stock Trash would spread provider verbs, one coarse delete permission, raw endpoints, and cleanup assumptions through product code. A custom general workflow engine would create the opposite debt.                                                       | High     | High                         | Current Pages use broad `tenantScopedDeleteAccess`; pinned Payload exposes stock bypass and Empty Trash.                                                        | Keep one small Asym command/DTO/capability boundary over Payload primitives; prohibit raw provider product surfaces; add no generic lifecycle engine or tenant rule builder.                                                      |
| Edge cases                        | **Yes**           | Staff can trash the last homepage, a multi-locale identity, a page under active edit, a scheduled revision, a referenced Page, an item already trashed/restored, an item whose route was transferred, or an item during Site activation.                            | Critical | High                         | These are ordinary consequences of D1 Site Plan releases, D2/D3 routes, D12 active editor, D13 schedules, D14 lists, D17 search, and D18/D19 relationships.     | Explicit lifecycle matrix, current preflight, CAS, idempotency, whole-identity semantics, schedule invalidation, route conflict handling, and race/failpoint tests.                                                               |
| Footguns                          | **Yes**           | Ambiguous Delete copy, a nearby permanent checkbox, bulk Empty Trash, browser-clock countdowns, or silent cascade can destroy content or mislead staff.                                                                                                             | Critical | High                         | Payload's stock UI exposes the checkbox and Empty Trash; W3C treats irreversible deletion as confirmation-worthy.                                               | Exact verbs, private restore, server time, no launch bulk/Empty Trash, no cascade, least-destructive initial focus, one explicit purge confirmation, and no false completion.                                                     |
| Tenant safety                     | **Yes**           | A privileged Local API call, caller-supplied Site ID, related-record filter, count, reference preview, or audit detail could expose another Tenant/Site or authorize a cross-scope action.                                                                          | Critical | Medium–High                  | Current Payload connection is privileged and current Page access is Tenant-only, not exact Site/environment capability authority.                               | Server-derived exact scope, structural constraints, capability checks, `overrideAccess: false` for user-bound Local API, non-enumerating errors, and negative cross-scope tests for every read/count/action.                      |
| Overengineering                   | **Yes**           | Custom retention matrices, recycle-bin folders, approval stages, legal-hold UI, restore wizards, granular locale Trash, and Trash-aware Saved Views would burden staff and database before evidence exists.                                                         | High     | Medium–High                  | The founder asked for safety without needless complexity; current comparable CMSs use simple dedicated recovery surfaces.                                       | One code-owned 90-day window, four derived statuses, one detail view, one capability for purge, and explicit launch exclusions. Add only measured needs later.                                                                    |
| UX/UI and user friction           | **Yes**           | Occasional staff may confuse unpublish, archive, Trash, and purge; dense dependency graphs, confirmation on every draft, toast-only results, hidden Trash, or ritual title typing can cause mistakes and abandonment.                                               | High     | High                         | CMS comparables use dedicated Trash; W3C distinguishes reversible recovery from irreversible confirmation and requires accessible focus/status behavior.        | Four fixed verbs, progressive preflight, direct reversible draft move with Undo, consequence-based public-content dialog, plain statuses, quiet Trash entry, persistent recovery, and ministry-staff usability tests.             |
| Hidden coupling                   | **Yes**           | Trash logic embedded separately in navigation, schedules, search, sitemap, cache, media, and route handlers will drift; a provider upgrade can change query inclusion.                                                                                              | Critical | High                         | D1 already centralizes release authority and the pinned provider implements non-Trash filtering internally.                                                     | One lifecycle event/source fact and registered consumer contracts; owners derive projections; adapter conformance tests; no consumer writes lifecycle state back.                                                                 |
| Failure modes                     | **Yes**           | Database commit may succeed while withdrawal, audit, or job dispatch fails; a lost response may cause retry; purge may partially remove versions; restore may return success while remaining invisible or conflicted.                                               | Critical | Medium–High                  | Distributed projections are not transactionally identical to the source write; pinned stock count handling can hide errors.                                     | Source-first safe state, outbox/idempotency, CAS, state-specific receipts, no false success, retry/reconciliation, purge transaction or compensating quarantine, and staff-visible health.                                        |
| Data integrity risks              | **Yes**           | Identity reuse, orphan versions, duplicate restore, stale references, slug theft, partial locale survival, or recursive deletion can corrupt meaning and reporting.                                                                                                 | Critical | Medium–High                  | Payload retains versions/locales but route/reference semantics belong to Asym; Contentstack documents dependency-sensitive restore scenarios.                   | Never-reused identity, route ledger, whole-identity move, non-cascade, reference proof, exact-revision commands, private working restore, tombstone, and integrity constraints/tests.                                             |
| Security and privacy risks        | **Yes**           | Trash can become a covert archive of sensitive ministry content; unauthorized staff may discover titles, routes, history, references, thumbnails, or actor identities after losing access. Logs may retain content.                                                 | Critical | Medium                       | Payload can include Trash through `trash: true`; history/detail remain accessible subject to provider access; restricted ministry content needs current policy. | Reapply current Phase 10 and Phase 12 access to every projection, omit thumbnails/snippets unless authorized, non-enumerating failures, privacy-safe telemetry, audit projection rules, and prompt revocation effects.            |
| Scalability and performance risks | **Yes**           | Preflight can fan out across locales, references, schedules, indexes, and cached surfaces; indefinite complex Trash and unindexed `deletedAt` queries can slow lists and jobs.                                                                                      | High     | Medium                       | D21 crosses several bounded owners; provider stock count queries all Trash; public consequential content may remain indefinitely.                               | Bounded summary queries, indexed scope/lifecycle/time keys, count ceilings, stable pagination, batched reconciliation, no N+1 references, purge backpressure, and production-shaped plans.                                        |
| Operational burden                | **Yes**           | Staff or developers could manually reconcile stuck removals, explain opaque purge blockers, clean abandoned drafts, or restore from backups. A noisy Trash badge can create unnecessary work.                                                                       | High     | Medium–High                  | Downstream convergence and reference changes are expected; backups are not an editor recovery UX.                                                               | Automatic retry/reconciliation, derived blocker text with one owner/action, safe automatic purge only for simple drafts, quiet attention badge, runbook, and no routine developer database edits.                                 |
| Observability gaps                | **Yes**           | Teams may not know content is still cached/indexed, purge is blocked, a job stalled, or cross-scope probes are occurring. A zero count could mean provider failure.                                                                                                 | Critical | High                         | D17 already identifies deletion health as operationally important; pinned Empty Trash converts fetch failure to zero.                                           | Cause-coded metrics and traces for source age, projection lag, retries, blockers, scope denials, and purge outcomes; staff-facing status separated from operator detail; no content in telemetry.                                 |
| Dependency and integration risks  | **Yes**           | Payload may change Trash access arguments, query defaults, UI routes, version behavior, or Local API semantics; search/CDN integrations may acknowledge before actual removal.                                                                                      | High     | Medium                       | Core runs an internal Payload v4 pin; current behavior differs from a complete Asym lifecycle.                                                                  | Exact-pin tests plus upgrade conformance, adapter boundary, no stock UI authority, consumer acknowledgements with reconciliation, and neutral lifecycle export.                                                                   |
| Migration and upgrade risks       | **Yes**           | Adding `deletedAt` can change default queries and indexes; existing hard-deleted records have no recovery history; rollback can accidentally expose trashed rows; future CMS migration can lose tombstones.                                                         | Critical | Medium                       | Payload appends non-Trash filters when enabled; this is a material query semantic change.                                                                       | Expand/backfill/verify/activate migration, dual-read darkness tests, explicit rollback behavior that keeps Trash ineligible, neutral export/import of lifecycle/tombstones, and no inferred recovery for historical hard deletes. |
| Other development hazards         | **Yes**           | Double clicks, two actors, auto-purge racing restore, stale eligibility, session expiry, job replay, clock skew, partial deploy, or weak tests can delete or resurrect the wrong identity. Ownership between product, search, route, and operations may be unclear. | Critical | Medium–High                  | Every destructive asynchronous lifecycle has ordinary concurrency and rollout races.                                                                            | Server time, idempotency keys, expected revision, transactional lock/lease for purge, deployment kill switch, explicit owner matrix, race/failpoint/property tests, and reversible activation.                                    |

Every category has a material concern because D21 coordinates a destructive source
state with several independently owned public projections. The result is not a
reason to add more workflow. It is a reason to keep the product contract narrow
and make its few boundaries exact.

### Ratified synthesis

#### Must be fixed before activation

1. **Establish exact scope and source authority.** Ordinary Page and Article
   identities must carry exact Tenant × environment × Site ownership, stable
   identity, revision, Trash lifecycle, and server timestamps before any UI is
   enabled.
2. **Separate the four lifecycle verbs.** Define source-owned unpublish, archive,
   Move to Trash, and permanent purge semantics and enforce their labels across
   list, editor, commands, audit, API, and support tooling.
3. **Build the Asym command boundary.** Separate move, restore-as-draft, and purge
   capabilities; add server-derived scope, current access, CAS, idempotency,
   cause attribution, non-enumerating errors, and no Local API bypass.
4. **Wire adverse-first consequences through existing owners.** D1/D2/D3/D13/
   D14/D17/navigation/cache/sitemap/social consumers must suppress safely,
   acknowledge, retry, and expose unresolved debt without being allowed to
   resurrect the identity.
5. **Prove non-cascade and reference safety.** Trash cannot delete folders,
   Topics, references, schedules, or media. Preflight must be bounded, current,
   and blocking when unknown. Route collision and replacement behavior must use
   existing route authority.
6. **Deliver the calm Core-owned UX.** Direct reversible draft move, impact-aware
   consequential confirmation, quiet Trash list, read-only detail, Restore as
   draft, rare separated purge, persistent statuses, responsive accessibility,
   and no stock checkbox/Empty Trash.
7. **Implement the bounded retention policy.** Use the authoritative 90-day window;
   auto-purge only re-proven never-released simple drafts; keep consequential or
   uncertain content for explicit review; preserve tombstones.
8. **Qualify the exact Payload pin and migration.** Prove query exclusion,
   locales, versions, access, restore, failure, schema/index plans, rollback
   darkness, and upgrade conformance at `4.0.0-internal.1f9ae9a`.
9. **Test the dangerous races before release.** Purge-versus-restore,
   trash-versus-publish, schedule-versus-trash, Site activation, path transfer,
   lost response, job replay, partial projection failure, cross-scope probes,
   and staged-deploy rollback must all fail safe.

#### Address soon after activation

- Conduct moderated task tests with frequent communications staff, occasional
  ministry administrators, and a restricted-ministry reviewer. Measure whether
  they choose unpublish versus Trash correctly, understand private restoration,
  locate a removed item, interpret removal debt, and stop an accidental purge.
- Review blocked-purge age and causes, route conflicts, restore completion,
  accidental-move Undo use, and support contacts before changing retention or
  enabling any bulk action.
- Add an operator runbook for stuck adverse convergence and eligibility repair;
  staff UX should expose only the consequence and next action.

#### Monitor without adding launch complexity

- move/restore/purge command latency, conflict, retry, and idempotent replay;
- age from source Trash to removal acknowledgement by projection owner;
- counts and oldest age for **Removal needs attention** and **Review required**;
- automatic-purge candidates, successes, proof failures, and queue backpressure;
- path collisions, schedule invalidations, and unexpected reference growth;
- cross-scope and unauthorized attempts without content or existence details;
- Trash volume, list/query plans, retention storage, and provider drift; and
- accessibility/usability regressions, Undo rate, and wrong-action support cases.

### Rejected alternatives and prohibited shortcuts

- direct permanent deletion with no recovery;
- exposing Payload Trash, its stock permanent-delete bypass, Empty Trash, bulk
  permanent deletion, raw endpoints, or one coarse delete capability as the
  Asym product;
- treating `deletedAt` as proof that routes, Navigation, schedules, search,
  sitemap, caches, social previews, and every locale have converged;
- using one ambiguous Delete action for unpublish, archive, Trash, and purge;
- restoring to the previously published state, schedule, cache, search index,
  Navigation placement, or social preview;
- cascading Trash or purge into child/referencing content, folders, Topics,
  schedules, Navigation history, media records, or binaries;
- locale-only Trash, homepage or child reparenting by implication, path theft,
  automatic homepage redirects, identity recycling, or silent slug mutation;
- browser-clock retention, timer-only purge, blanket age-based purge, or
  claiming that backup erasure is synchronous;
- tenant-defined retention matrices, recycle-bin folders, approval stages,
  legal-hold UI, restore wizards, Trash-aware Saved Views, or a generic
  lifecycle engine at launch;
- bulk move, bulk restore, bulk purge, select-all-across-results, or Empty
  Trash at launch;
- toast-only success, false zero counts, destructive initial focus, ritual
  title typing, graph-first impact UI, or mouse-only actions; and
- privileged Local API, client-supplied scope, related-record filtering, or
  logs containing content as authorization or isolation.

### Required proof inherited by the eventual specification

Implementation remains unauthorized by this decision. A future authorized
change must satisfy every gate below.

| Gate                       | Required evidence                                                                                                                                                                                                                | Rejects                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Semantic darkness          | Unpublish, archive, Trash, restore, and purge produce distinct source states, copy, commands, audit causes, and UI; no alias or fallback conflates them.                                                                         | One overloaded Delete/Status field or provider semantics as product truth.           |
| Exact isolation            | Wrong Tenant, environment, Site, actor, role/capability, and revoked-access tests cannot view Trash existence, counts, title, references, history, previews, audit, or act.                                                      | Client scope, Tenant-only filter, related-record inference, or privileged Local API. |
| Adverse-first service      | On move, every locale becomes immediately ineligible; route, navigation, dynamic list, search, sitemap, cache, social, and scheduled-release tests converge or show retryable debt.                                              | `deletedAt` success while public content remains silently favorable.                 |
| Active-editor safety       | Own dirty state, autosave in flight, another valid editor lease, expired lease, session loss, and urgent-unpublish tests prove Trash never discards unsaved work or overrides D12.                                               | Stale browser action trashing another editor's work.                                 |
| Navigation history         | A trashed target disappears from public Navigation adverse-first while the D4 authored/released revision and stable reference remain; the next favorable release blocks until repair, and purge blocks on unresolved references. | Silent mutation of authored history or purge erasing repair debt.                    |
| Non-cascade                | Moving, restoring, and purging cannot delete or mutate child/referencing Pages, folders, Topics, navigation, references, schedules, media records, or binaries outside their owner's explicit command.                           | Database cascade or hook side effects as lifecycle policy.                           |
| Impact preflight           | Simple draft bypass, consequential summary, unknown/truncated block, changing references, and permission-redacted detail behave as specified under bounds.                                                                       | Empty impact inferred from timeout, truncation, or denied reads.                     |
| Restore privacy            | Restore preserves identity/locales/history/assignments but yields private working state; it does not publish, schedule, index, cache, navigate, or clear unrelated debt.                                                         | “Return to original state” causing surprise republication.                           |
| Route safety               | Trashed path claim/disposition, legitimate replacement, 301, 404/410, transfer, collision, and restore conflict obey D2/D3 without homepage redirect, theft, or silent slug mutation.                                            | Trash inventing route authority.                                                     |
| Retention and purge        | Server-time 90-day boundary, DST/clock skew, simple-draft proof, ever-released block, reference/hold/debt block, lost response, retry, concurrent restore, partial failure, and tombstone pass.                                  | Timer-only hard delete, blanket purge, or false completion.                          |
| Payload exact pin          | `trash: true`, default exclusion, query opt-in, localized drafts, read-only detail, versions, differentiated provider access, schema/indexes, stock UI bypass suppression, and Local/REST behavior pass at the exact pin.        | Documentation alone or stock UI treated as sufficient.                               |
| Migration and rollback     | Existing rows remain active, Trash queries/indexes are production-safe, activation is reversible, rollback cannot re-expose Trash, and neutral export/import preserves stable lifecycle/tombstones.                              | One-step schema/UI enablement.                                                       |
| Accessibility              | Keyboard, screen reader, touch, 200% zoom, 320px reflow, reduced motion, slow connection, and session-expiry tests pass; dialog focus and persistent live status behave as specified.                                            | Mouse-only rows, toast-only outcome, destructive initial focus, inaccessible modal.  |
| Ministry usability         | Representative staff correctly choose unpublish vs Trash, understand every-language withdrawal and private restore, locate and recover an item, read blockers, and safely complete/abort purge without coaching.                 | Expert-only provider vocabulary or graph-first impact UI.                            |
| Failure containment        | Database, audit, outbox, worker, search, CDN, and provider failpoints preserve safe source state, local context, retryability, and truthful receipts; no duplicate or resurrected identity.                                      | Partial success hidden behind one green toast.                                       |
| Performance and capacity   | Production-shaped indexes, bounded preflight, stable pagination, non-Trash query regression, queue backpressure, purge batch, and no-N+1 reference proof pass at forecast scale.                                                 | Full-graph scans, unbounded counts, or synchronous fan-out on button press.          |
| Observability and recovery | Cause-coded staff health, operator metrics/traces, oldest-age alerts, reconciliation, and runbook recover each simulated fault without logging content.                                                                          | Generic CMS error, count-zero-on-failure, or manual database repair as routine.      |

### Evidence and architectural record

- [D21 primary-source research, exact-provider audit, nonprofit UX, adversarial review, and proof gates](./research/phase-23-d21-trash-restore-retention-research.md)
- [ADR-0165 — Asym-owned, reference-aware recoverable Trash with private restoration and proof-gated purge](../../adr/0165-asym-owned-reference-aware-recoverable-trash.md)
- [D20 / ADR-0164](../../adr/0164-bounded-personal-and-site-shared-saved-library-views.md)
- [D18 / ADR-0162](../../adr/0162-purpose-bounded-authority-free-content-library-folders.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D13 / ADR-0157](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D4 / ADR-0148](../../adr/0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [D3 / ADR-0147](../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [D2 / ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Payload Trash](https://payloadcms.com/docs/trash/overview)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Pinned Payload Trash tests](https://github.com/payloadcms/payload/blob/1f9ae9ab37bd7a69894762c833fad3e65124c314/test/trash/e2e.spec.ts)
- [Contentstack Trash](https://www.contentstack.com/docs/headless-cms/about-trash)
- [HubSpot deleted-record recovery](https://knowledge.hubspot.com/records/restore-deleted-records)
- [Google removed-page guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)
- [W3C confirmation technique G168](https://www.w3.org/WAI/WCAG22/Techniques/general/G168)
- [WAI-ARIA modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D21 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D21's canonical
terms are preserved here and in ADR-0165 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D21 do not yet decide broader layout/default inheritance; forms;
generalized media; broader SEO; locale rollout; multi-Site readiness;
audience/cache policy; preview tokens; the exact permission matrix;
migration/cutover UX; the broader operational-health product; production
capacity budgets; or the exact qualified Payload version. These areas remain
founder decisions or evidence-backed implementation proofs and will be
resolved one at a time.

## D22 — Bounded Localized Editorial Profile over exact locale lineages

**Status:** Ratified and adversarially hardened on 2026-08-23.

> **C-prime-amended-and-hardened (C-prime-R) — One bounded, code-owned and
> versioned Localized Editorial Profile over D1's sparse exact-locale lineages,
> with explicit translation starts, independently releasable locale revisions,
> and fail-closed public locale resolution.** One stable Site-scoped ordinary
> Page or Article identity remains nonlocalized and owns subordinate canonical
> BCP-47 Editorial and D2 Placement lineages. Each locale Editorial Revision
> independently owns localized title, summary, bounded typed Page-local
> composition, rich text, authored headings/body/CTA copy, usage-level alt text,
> captions and transcripts, and editorial SEO/social copy; D2 independently owns
> that locale's parent and normalized path segment. Stable identity, Tenant,
> environment, Site, family, capabilities, attribution, audit, lifecycle and
> Trash, D18 folder and D19 Topic assignments, block/source/contract keys, typed
> operational references, media binary identity and legal evidence, provider
> links, schedules, release heads and receipts remain nontranslated or with their
> already-ratified owner. D4 Navigation, forms, system messages, Phase 22 public
> ministry content, safety, and every independently live source retain their own
> localization and release authority. The profile classifies the finite
> translatable facets of ordinary families and every certified D7/D9 block
> version. Each canonical family/block contract co-locates its typed localization
> manifest, while the profile pins and validates those manifests as one compatible
> version; there is no separately hand-maintained duplicate field list. It is not
> a tenant schema builder, reflection-driven second schema, per-field workflow, or
> database row per field.
>
> Ordinary Page/Article rich content is persisted and versioned at D1's exact
> locale-lineage grain from the first migrated revision, not as one mutable
> provider document whose versions snapshot every language. Locale rows are
> sparse: enabling a Site locale does not clone content or create favorable
> routes. A one-locale Site receives the normal D12 editor with no language
> selector, percentage, empty tabs, or translation dashboard, while exact locale
> remains explicit internally. After Phase 24 enables another locale, an
> authorized actor chooses **Start <target language>**, then **Start blank** or
> **Copy from <authorized exact source language>**. The operation is idempotent,
> scope-checked, and pinned to an exact source revision. A copy creates only a
> private target working revision, copies only profile-allowlisted editorial
> values and permitted stable references, and records calm provenance; it is not
> proof of translation, approval, publication, runtime fallback, or permission
> to expose the source. Cross-locale Reusable Section references never carry
> silently: the target selects or explicitly creates an eligible target-locale
> section through its existing owner.
>
> A later translation-affecting source change creates a derived **Source
> changed** fact and an exact read-only comparison; it never overwrites, merges,
> unpublishes, or republishes the target. An authorized editor may update the
> target or attest with actor/time/reason that it remains current against the new
> source pin. Nonsemantic audit, folder, Topic, provider-key, and independently
> live source changes do not manufacture translation work. Current Phase 10
> safety or lifecycle narrowing remains adverse-first and may make any locale
> ineligible immediately; ordinary staleness alone does not rewrite an existing
> release.
>
> The multi-locale editor keeps one active locale in persistent Page-header
> context, labels it with its language in the language's own script plus optional
> region rather than a flag alone, and derives two honest facts: public state
> (**Not live** or **Live**) and editorial attention (**Not started**, **Draft**,
> **Needs review**, **Approved**, or **Source changed**). The roadmap's missing,
> draft, needs-review, approved, published, stale and future fallback-used
> indicators are projections over immutable revision, review, source-pin, D1
> release and future Phase 24 resolver receipts—not mutable status booleans or a
> new workflow engine. Required-field and contract completeness is mechanically
> validated; semantic translation completeness is one calm, Page-level human
> confirmation, plus existing review evidence when policy requires it, because
> software cannot safely infer accuracy merely from field presence or differences
> from the source. Locale switching first completes or explicitly recovers
> D12 autosave/conflict state. Optional source comparison is read-only and
> responsive. Preview and every favorable action name the locale—**Preview
> Spanish**, **Schedule Spanish**, **Publish Spanish**, **Withdraw Spanish**—and
> ordinary **Publish all languages** does not exist. D13 schedules one exact
> locale revision; D10 remains the sole presentation-only cross-locale cohort
> exception; D21 still moves the stable identity and all locale variants to Trash
> together while locale-only withdrawal remains release authority.
>
> Every authoring, preview, compiler and public read requests one exact locale
> through one shared provider-neutral port with provider field fallback disabled.
> Missing required locale content blocks the candidate; optional content may be
> absent only when its typed contract defines a safe and accessible omission. A
> missing exact release creates no favorable route, Navigation destination,
> search document, sitemap URL, canonical, social card, schedule target or
> `hreflang` alternate, and never assembles mixed-language fields. Direct missing
> locale resolution fails honestly under the D2/D3/Phase 10 route contract and
> may offer explicit links to eligible released alternatives at their own real
> canonical URLs and actual `lang`; it does not automatically redirect or render
> another language under the requested locale URL. Phase 24 may later own a
> bounded, disclosed whole-page alternative policy, language preference and
> `x-default`, but can select only one complete currently eligible release and
> may never weaken the no-field-fallback invariant. Reciprocal `hreflang` names
> only actual mutually eligible released variants of the same stable identity.
>
> Public output uses UTF-8, the canonical BCP-47 `lang`, correct base direction,
> and language-of-parts markup where the content contract admits deliberate
> mixed-language passages. It supports text expansion, long labels, CJK, RTL,
> bidirectional isolation, local fonts and formats, logical layout properties,
> normalized/collision-checked locale paths, and user-controlled language links.
> Translation status, preview, comparison and public-alternative surfaces remain
> keyboard operable, screen-reader named and announced, focus-correct, touch
> usable, and proven at 320 CSS pixels and 400 percent zoom without relying on
> color, flags, hover, toast-only feedback, or motion.
>
> Payload `4.0.0-internal.1f9ae9a` remains a qualified authoring/persistence
> adapter only. Its global locale list, `localized: true` storage, full-document
> versions, `_status`, experimental `localizeStatus`, default field fallback,
> locale-filtered selector, publish-all controls and provider migrations are not
> authorization, readiness, lineage, or public release truth. Phase 23 does not
> enable beta localized status. Provider field localization may be used only for
> a separately profiled bounded field where exact-pin tests prove it appropriate;
> it cannot replace D1's ordinary locale revision. All privileged Local API and
> database paths re-prove current actor capability and trusted server-derived
> Tenant × environment × Site × stable identity × locale scope. Composite
> foreign keys, uniqueness, expected-revision fences, applicable grants/RLS,
> purpose-shaped indexes, `depth: 0` public adapters, non-enumerating errors and
> hostile cross-scope fixtures prevent client-selected locale or elevated
> provider access from becoming authority.
>
> Migration inventories every current Page, Tenant-to-Site binding, explicitly
> proven canonical default locale, revision, path, schedule and release before
> changing shape. It uses restartable expand → backfill → checksum/constraint/
> route verification → shadow-read → cutover → contract stages, backfills each
> legacy Page into exactly one locale lineage, and never fabricates future
> translations by cloning content or status across configured locales. Old
> revisions remain readable through a bounded compatibility adapter until cutover
> proof passes. Rollback may not collapse divergent locale data into one default
> locale or depend on Payload's lossy localized-status down migration; recovery
> is a forward-compatible adapter or a new explicit successor migration. Profile
> evolution is additive and version-pinned, with deterministic migrators and
> retained readers rather than in-place mutation during reads.
>
> Acceptance requires exact-pin Payload storage/query/version/admin-control/
> migration conformance; profile and certified-custom-block localization
> manifests; cross-Tenant/Site/environment/identity/locale authorization and
> relationship tests; fallback-ban, mixed-language, missing-required and public
> eligibility tests; BCP-47/Unicode/path collision, locale add/disable and
> migration/rollback fixtures; idempotency, concurrent Start translation,
> autosave, source-change, route, schedule, D10, Trash, permission-revocation and
> deploy-skew failpoints; exact D1/D2/D3/D12/D13/D17/Phase 10 convergence proof;
> privacy-safe per-locale health for missing, stale, blocked, released, indexed
> and alternative-use facts; and representative ministry staff completing blank
> and copied translation starts, comparison, preview, review, publish, withdraw
> and recovery without coaching across desktop/mobile, keyboard/screen reader,
> long/CJK/RTL content and slow or interrupted networks. This decision records
> architecture only and authorizes no implementation, schema, migration,
> provider adoption, issue publication, release activation or production change.

### Binding interpretation

1. **D1's exact locale lineage is the ordinary-content localization grain.**
   One stable nonlocalized Page or Article identity owns sparse subordinate
   BCP-47 Editorial and D2 Placement lineages. A multilingual provider document
   is not the version, autosave, review, schedule, or release authority.
2. **The profile is finite, code-owned, and versioned.** Canonical family and
   certified-block contracts co-locate typed localization manifests; one
   compatible profile version pins and validates them. There is no tenant schema
   builder, reflection-driven second schema, per-field workflow, or field row.
3. **Translation starts are explicit.** An authorized actor starts a target
   locale blank or copies allowlisted editorial material from one authorized
   exact source revision. The result is a private working revision with immutable
   provenance, never a translation, approval, release, or access proof.
4. **Source change is advisory, not destructive.** Translation-affecting source
   changes derive **Source changed** and an exact comparison. They never
   overwrite, merge, withdraw, or republish the target; an actor may update it or
   attest that it remains current against the new source pin.
5. **Single-locale Sites stay simple.** Staff see the normal D12 editor without
   empty language tabs, percentages, or a translation dashboard. Phase 24 locale
   enablement is the condition for exposing multi-locale controls.
6. **Public and editorial state remain separate.** Public state is **Not live**
   or **Live**. Editorial attention is **Not started**, **Draft**, **Needs
   review**, **Approved**, or **Source changed**, derived from existing immutable
   facts rather than stored as another workflow-state machine.
7. **Every favorable action names one locale.** Preview, schedule, publish, and
   withdraw act on one exact locale revision. Ordinary **Publish all languages**
   does not exist; D10 remains the sole presentation-only cohort exception.
8. **Silent field fallback is permanently prohibited.** Authoring, preview,
   compiler, discovery, metadata, and public reads request one exact locale
   through one port with provider fallback disabled. Missing content never
   produces mixed-language Pages or favorable discovery artifacts.
9. **Missing means honestly unavailable.** A missing exact release receives no
   route, Navigation target, search document, sitemap entry, canonical, social
   card, schedule, or hreflang claim. Staff may link to eligible released
   alternatives at their actual URLs; no automatic redirect or borrowed-language
   render occurs under the missing locale URL.
10. **Internationalization is semantic and accessible.** Canonical BCP-47
    language, truthful lang/direction, language-of-parts, Unicode, CJK/RTL,
    bidirectional isolation, text expansion, logical layout, responsive reflow,
    keyboard/screen-reader/touch operation, and language names rather than flags
    are activation requirements.
11. **Payload is replaceable machinery.** Core's exact internal Payload v4 pin
    may supply qualified storage/editor mechanics, but its localized field shape,
    full-document versions, default fallback, beta localizeStatus, global locale
    selector, and publish-all UI are not Asym authority. Phase 23 does not enable
    beta localized status.
12. **Migration creates one proven locale, not invented translations.** The
    restartable migration inventories and backfills legacy content into one
    explicitly proven canonical locale, verifies checksums, constraints, paths,
    schedules and releases, retains old readers through cutover, and uses
    forward-compatible recovery rather than lossy locale collapse.
13. **Exact scope is structural.** Tenant, environment, Site, stable identity and
    locale are server-derived and constrained; privileged provider or database
    access never substitutes for current capability, scope, applicable RLS, CAS,
    non-enumerating errors, or hostile isolation proof.
14. **Phase 24 remains intact.** Enabled/default locale lifecycle, global
    translation coverage, richer assignments and approvals, vendor exchange,
    machine translation, translation memory, fallback-chain administration,
    visitor preference, language selection, x-default, and broader Site/system
    localization are not D22 authority.

### Source and no-authority boundaries

| Fact                                                                     | Authority after D22               | Binding rule                                                                                           |
| ------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Stable ordinary Page/Article identity and exact locale Editorial lineage | D1 plus D22 profile               | Stable identity remains nonlocalized; each sparse exact locale versions its own editorial content.     |
| Locale hierarchy and path                                                | D2                                | D22 cannot infer, copy, redirect, transfer, or steal a path.                                           |
| Route continuity                                                         | D3                                | Continuity is same identity and same locale; no cross-locale inference.                                |
| Navigation labels and structure                                          | D4                                | Navigation retains its own localized revisions and D1 release participation.                           |
| Block grammar, reusable sections, and presentation packages              | D7, D8, and D9                    | Their contracts co-locate manifests; D22 pins and validates but does not seize ownership.              |
| Cross-locale presentation activation                                     | D10                               | Remains the sole all-or-none presentation-only cohort transaction.                                     |
| Working revisions, autosave, conflicts, and active editor                | D12                               | Locale switching and translation start respect D12 fencing and recovery.                               |
| Scheduled publication                                                    | D13                               | One appointment binds one exact locale revision and re-proves eligibility.                             |
| Dynamic lists and public search                                          | D14–D17                           | Consume only exact eligible releases; D22 cannot create favorable discovery.                           |
| Folders, Topics, and Saved Library Views                                 | D18–D20                           | Remain nontranslation organizational facts unless their own owner says otherwise.                      |
| Trash and purge                                                          | D21                               | Whole stable identity and all locale variants move together; locale withdrawal stays publication work. |
| Specialized public ministry pages/content                                | Phase 22                          | Retains its own localization, revision, review, release, privacy, and media owners.                    |
| System messages and broader localization management                      | Phase 17 and Phase 24             | D22 supplies compatible seams only.                                                                    |
| Media binary identity and custody                                        | Existing media owner and Phase 29 | Only usage-level alt/caption/transcript copy is locale editorial content.                              |
| Public safety and current eligibility                                    | Phase 10 and each source owner    | Safety narrowing remains adverse-first and can make any locale ineligible immediately.                 |
| Payload localization and status primitives                               | Payload adapter                   | Provider mechanics only after exact-pin qualification; never authorization or release truth.           |

### UX and operational consequences

- Occasional ministry editors see no localization machinery until their Site has
  more than one enabled locale.
- Starting a translation is one understandable choice: **Start blank** or **Copy
  from <language>**. Copying never claims that translation work is complete.
- One active language remains visible in the Page header. Language labels use
  their own script and optional region, not flags alone.
- Staff see separate live and editorial-attention facts rather than an ambiguous
  percentage or one overloaded Published status.
- Locale switches finish or recover autosave first, preventing work from being
  silently attached to the wrong lineage.
- Every preview, schedule, publish, and withdrawal action names the affected
  language, eliminating a hidden publish-all footgun.
- Source comparison is exact, read-only, optional, and responsive. A source edit
  cannot erase a translator's legitimate localized decisions.
- A missing translation fails honestly and offers actual released alternatives;
  donors never receive a mixed-language Page assembled from fallback fields.
- The operational burden is concentrated in deterministic derivation,
  reconciliation, and cause-coded health rather than manual status upkeep.
- Representative ministry staff, assistive-technology users, long-text, CJK,
  RTL, slow-network, interrupted-save, and conflict scenarios are release gates.

### Adversarial disposition

Every required review category has a material concern: brittleness, technical
debt, edge cases, footguns, tenant safety, overengineering, UX/UI friction,
hidden coupling, failure modes, data integrity, security/privacy, scalability,
operational burden, observability, dependency risk, migration/upgrade risk, and
other concurrency/deployment hazards. The permanent response is the bounded
contract above: sparse exact locale lineages, one generated profile, explicit
private starts, immutable provenance, locale-named commands, no field fallback,
provider-neutral exact-locale reads, structural scope, safe migration, and
production-shaped proof—not a translation-management platform or new workflow
engine. The complete category-by-category evidence remains binding supporting
analysis in the D22 research records.

### Required proof inherited by the eventual specification

Implementation remains unauthorized by this decision. A future authorized
change must prove at minimum:

1. The profile and every qualified Page, Article, D7/D9 block, and certified
   custom-package manifest have exactly one compatible version; unknown or
   incompatible versions fail closed without mutating old content during reads.
2. Wrong-Tenant, wrong-environment, wrong-Site, wrong-identity, wrong-locale,
   wrong-actor, revoked-access, relationship, count, preview, comparison,
   translation-start, schedule, publish, withdraw, and health probes disclose
   nothing and cannot mutate content.
3. Authoring, preview, compiler, route, Navigation, dynamic list, search,
   sitemap, canonical, social, and hreflang paths all request one exact locale
   with provider field fallback disabled and cannot assemble mixed languages.
4. Blank and exact-source Copy starts are idempotent, CAS-fenced,
   scope-authorized, provenance-complete, private, retry-safe, and correct under
   double click, lost response, concurrent source/target edit, permission
   revocation, and deployment skew.
5. Source-change derivation distinguishes translation-affecting dependencies
   from unrelated audit/folder/Topic/provider changes, preserves target work,
   and supports attributable remain-current attestation without false freshness.
6. One-locale UX remains the ordinary D12 editor; multi-locale switching,
   autosave, comparison, status, preview, review, publish, withdraw, and recovery
   work without coaching on desktop and narrow layouts with keyboard, screen
   reader, touch, 400% zoom, 320-CSS-pixel reflow, long text, CJK, and RTL.
7. Exact BCP-47 normalization, Unicode/path collision, truthful lang/direction,
   language-of-parts, bidirectional isolation, and reciprocal actual-release
   hreflang tests pass.
8. D1/D2/D3/D4/D10/D12/D13/D14–D17/D21 and Phase 10 race/failpoint tests prove
   that a locale operation cannot advance, restore, redirect, index, cache, or
   withdraw another owner by implication.
9. The exact pinned Payload storage, query, version, admin-control, access,
   fallback, migration, beta-status exclusion, upgrade, and failure behavior
   pass a replaceable adapter conformance suite.
10. Migration inventories every existing Page/Site/locale/revision/path/schedule/
    release, backfills one proven locale only, verifies checksums and structural
    constraints, shadow-reads through cutover, survives restart, and cannot lose
    divergent locale data on recovery or rollback.
11. Sparse locale storage, D12 version retention, exact-scope indexes,
    comparisons, status derivation, compiler reads, releases, search convergence,
    and reconciliation meet production-shaped latency, plan, queue, and storage
    budgets without N+1 or cross-locale scans.
12. Privacy-safe cause-coded health distinguishes missing, draft, review,
    approved, source-changed, blocked, released, indexed, alternative-offered,
    provider failure, migration debt, and convergence lag without logging
    content, source text, inaccessible labels, or cross-scope existence.

### Evidence and architectural record

- [D22 primary-source research, exact-provider audit, localization UX, ruthless synthesis, and proof gates](./research/phase-23-d22-localization-readiness-research.md)
- [D22 independent 17-category adversarial review](./research/phase-23-d22-localization-independent-adversarial-review.md)
- [ADR-0166 — Bounded Localized Editorial Profile over D1 exact locale lineages](../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [D21 / ADR-0165](../../adr/0165-asym-owned-reference-aware-recoverable-trash.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D13 / ADR-0157](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D10 / ADR-0154](../../adr/0154-complete-cohort-site-presentation-activation-through-d1.md)
- [D4 / ADR-0148](../../adr/0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [D3 / ADR-0147](../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [D2 / ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Payload Localization](https://payloadcms.com/docs/configuration/localization)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Sanity localization](https://www.sanity.io/docs/studio/localization)
- [Contentful localization strategies](https://www.contentful.com/help/localization/field-and-entry-localization/)
- [Contentful locale-based publishing](https://www.contentful.com/help/localization/locale-based-publishing/)
- [Google multilingual site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Google localized versions and hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [W3C language tags](https://www.w3.org/International/articles/language-tags/index.en)
- [W3C language-link guidance](https://www.w3.org/International/questions/qa-link-lang.en)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D22 authority.
The research evidence remains supporting analysis and does not independently
expand the decision. Ratification authorizes no implementation, schema,
migration, dependency or provider adoption, issue publication, deployment, D1
activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D22's canonical
terms are preserved here and in ADR-0166 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D22 do not yet decide broader layout/default inheritance; forms; generalized
media; broader SEO beyond locale editorial metadata; Phase 24 locale lifecycle
and fallback administration; multi-Site readiness; audience/cache policy;
preview tokens; the exact permission matrix; migration/cutover UX; the broader
operational-health product; production capacity budgets; or the exact qualified
Payload version. These areas remain founder decisions or evidence-backed
implementation proofs and will be resolved one at a time.

## D23 — Exact Site-owned ordinary content with independent Copy-to-Site drafts

**Status:** Ratified and adversarially hardened on 2026-08-23.

> **B-prime-amended-and-hardened (B-prime-R) — Exact Site-owned ordinary
> content with one-time, exact-revision independent Copy-to-Site drafts.** Every
> ordinary Page and Article identity belongs to one required exact Tenant ×
> environment × Site; its locale variants remain D22's subordinate exact
> lineages, and missing Site, a Site array, or implicit Tenant-global ordinary
> content is forbidden. Navigation, Reusable Sections, folders, Topics, saved
> views, Trash, presentation packages, Site chrome, Phase 22 specialized
> content, and dynamic or operational facts retain their already-ratified
> owners. Page Starters remain Asym-owned code templates. Media remains
> tenant-wide only under Phase 2 and current target-use safety proof. The
> canonical Phase 2/D1 Site registry, host-to-Site-to-Tenant resolver, required
> Site ownership, per-Site path constraints, and exact-Site authorization are
> hard prerequisites; no tenant-only interim duplicate is permitted.
>
> An authorized **Copy to another Site...** command may copy exactly one Page
> or Article from one exact visible acknowledged source revision into one
> different target Site within the same exact Tenant and environment. It is a
> governed starting action, never sharing, inheritance, synchronization,
> recursive distribution, merge, overwrite, or migration. It creates a fresh
> target stable identity, one explicit target locale lineage, fresh Page-local
> block and anchor identities, a separately selected D2 placement/path draft,
> and an independent private working revision explicitly stored as **Draft —
> not live**. It never mutates the source. Later source edits, publication,
> withdrawal, Trash, permission changes, or deletion never propagate to or
> impair the target. Protected immutable provenance supports audit and help but
> is not a relationship dereferenced by editing, preview, release, public
> reads, search, Trash, or recovery.
>
> The action is available only after D12 has one acknowledged saved source
> revision; pending or failed autosave, offline work, and unresolved conflict
> block it with a direct recovery action. Server-derived scope and the sole
> permission resolver must prove exact-source-revision read authority plus
> target-Site create/edit authority both at preflight and commit. Only eligible
> target Sites are listed, each with Site name and primary domain; a client
> cannot assert Tenant, environment, Site, locale, or favorable state. A target
> locale defaults only when the identical normalized locale is enabled. Any
> different-locale start explicitly branches through D22, labels copied prose
> as untranslated source material, and never performs silent locale fallback
> or treats `en-US` and `en-GB` as equivalent.
>
> A versioned, code-owned, family-qualified transfer manifest classifies every
> eligible field, rich-text node, semantic block, certified custom block, and
> relationship as **copy**, **materialize/remap**, **review after copying**, or
> **never copy**. Unclassified or incompatible catalog members fail preflight.
> Compatible editorial content and bounded SEO copy may copy. A D8 Reusable
> Section materializes as fresh Page-local target content. Page-local IDs and
> internal anchors are remapped. Target references, embeds, dynamic-source
> bindings, absolute source-domain links, and tenant-wide Media are revalidated
> against target authority, availability, rights, rendition, metadata, and
> current Phase 10/29 safety. An internal Page link maps only through an
> explicit eligible target selection; it never remains a dangling source-Site
> relationship. Unsupported structural content blocks creation; intentionally
> repairable omissions are disclosed before commit, represented in a bounded
> actionable repair manifest, and block D1 release when required. Nothing
> silently disappears, falls back, rewrites, or becomes safe merely because the
> source was live.
>
> Source path/placement and Navigation, folder, Topic, saved-view,
> active-editor, comments, review/approval, schedule, publication, D1
> generation, canonical, search, cache, sitemap, analytics, Trash/retention,
> presentation, Site-settings, audit, operational, and Phase 10/22 eligibility
> facts never copy as authority. The source slug is only a visible suggestion.
> The target domain and complete proposed address remain explicit; D2 validation
> and a database uniqueness constraint reject collisions at commit. The command
> never overwrites an existing Page or silently appends a suffix.
>
> Preflight creates an immutable, expiring plan digest bound to actor, exact
> source identity/revision/locale and schema/catalog generation, target Site and
> locale, proposed D2 path, copied/remapped content, disclosed repairs, excluded
> facts, and idempotency key. Commit re-proves current authorization, source
> head and non-Trash lifecycle, target ownership/active state/locale, catalog
> compatibility, reference and Media safety, and path claim. One short atomic
> transaction, with every nested provider operation awaited under the same
> request/transaction, creates target identity, locale draft, placement,
> repair manifest, protected provenance, durable audit/outbox fact, and unique
> idempotency receipt together or creates none. Remote provider or network checks
> complete before that short transaction; commit rechecks their durable
> version/safety facts and never holds a database transaction open across remote
> I/O. The unique receipt stores the canonical request digest and qualified
> adapter generation. An identical lost-response replay resolves the same
> receipt; reuse of the key with different source, target, revision, locale,
> path, or options fails as an idempotency conflict with no mutation. A later
> unauthorized caller receives a non-enumerating unavailable result rather than
> receipt details. A replay after the target entered Trash or was purged returns
> only its currently authorized terminal disposition and never resurrects it;
> a deliberate new copy requires a new key. Best-effort metric delivery cannot
> roll back an already committed target, but its delivery debt remains
> observable.
>
> The occasional action lives in the Page/Article **More actions** menu only
> when an eligible target exists and opens one responsive dialog or sheet—not a
> wizard, dashboard, bulk tool, or alarming confirmation. It fixes the visible
> source context; requires an explicit destination when several exist; shows
> exact language and target address; states **Creates an independent draft on
> `<Site>`. Future edits will not stay in sync. Nothing will be published.**;
> and summarizes **Ready to copy / Review after copying / Stays with
> `<source Site>`**. The final action reads **Create independent draft on
> `<target Site>`**.
> While running it shows an announced busy/reconciliation state and prevents a
> second submission. Success navigates in the same tab to the target editor,
> focuses its heading, and persistently shows **`<Site> · <domain> · <locale> ·
Draft — not live`**, calm independent-copy provenance, and release-blocking
> repairs before review-only items. Every repair links to the affected field or
> block; no essential state exists only in a toast, color, icon, hover, or
> motion. Cancel restores focus and submitted errors retain input, expose a
> linked summary, and follow Core keyboard, screen-reader, touch, reflow, zoom,
> and reduced-motion contracts.
>
> Public host resolution remains host-to-Site-to-Tenant before every exact-scope
> query. Preview names Site, domain, locale, and target revision and remains
> private, `no-store`, and `noindex`. Copy produces no route, Navigation entry,
> canonical, social card, sitemap/search document, cache invalidation result, or
> public output. Only the target Site and locale's later complete D1 release may
> make it public; repair blockers and all current adverse safety facts win.
> Copy is bounded to one existing ordinary revision, depth-zero relationship
> reads, batched validations, existing Page/block size limits, and retained
> safe Media references rather than byte duplication. It never starts recursive
> graph work, queue, workflow engine, or background synchronization system. Its
> compact repair projection is not a second work-management database; D1 always
> recomputes current blockers from authoritative target facts.
>
> Payload `4.0.0-internal.1f9ae9a` remains a qualified persistence and authoring
> adapter only. Ordinary Page/Article collections set `disableDuplicate` and
> `admin.disableCopyToLocale`; stock duplicate UI/API, `duplicateFromID`,
> provider locale fallback, plugin tenant cleanup, provider latest-version
> selection, and elevated Local API defaults are not product authority. The
> Asym port passes authenticated user context, `overrideAccess: false`, exact
> Site predicates, `fallbackLocale: false`, the shared transaction request, and
> explicit `_status: 'draft'` through an exact-pin conformance suite. Every
> custom package declares compatible transfer behavior; provider/schema drift
> fails closed.
>
> Migration uses restartable expand, one proven default-Site backfill per legacy
> identity, checksum/constraint and shadow-read verification, cutover, then
> contract before enabling copy. Transfer manifests and source/target catalog
> generations evolve additively with deterministic qualified migrators and
> retained readers; no read-time mutation or lossy down migration may collapse
> Site or locale distinctions. Acceptance requires exhaustive manifest coverage;
> native-action suppression; exact-scope authorization and non-enumeration;
> generic-provider conformance; source-save/conflict, permission-revocation,
> Trash, inactive-Site/locale, schema-skew, path-race, incompatible-block,
> reference/Media, transaction, audit/outbox, lost-response, duplicate-retry,
> deploy-skew, adapter-generation, migration, rollback, preview, and
> public-no-effect fixtures; pure transfer-plan compiler tests; exact Payload
> plus real PostgreSQL constraint tests; proof that same-key/different-request
> conflicts mutate nothing and that old receipts never resurrect trashed or
> purged targets; bounded-linear maximum-Page load tests with no recursive or
> N+1 traversal; plus
> representative ministry staff completing the Hope-to-Relief flow and
> explaining source revision, destination, independence, repair, and release
> consequences without coaching across keyboard, screen reader, touch, 320 CSS
> pixels, 400 percent zoom, long/RTL labels, and slow or interrupted networks.
> This decision records architecture only and authorizes no implementation,
> schema, migration, provider adoption, issue publication, release activation,
> deployment, or production change.

### Binding interpretation

1. **Ordinary content is exactly Site-owned.** Every Page and Article belongs to
   one required Tenant × environment × Site. Locale remains D22's subordinate
   exact lineage; missing Site, a Site array, and implicit Tenant-global
   ordinary content are forbidden.
2. **Copy is a one-time start, not a live relationship.** **Copy to another
   Site...** creates a new private target identity and working revision from one
   acknowledged exact source revision. Later source changes, publication,
   withdrawal, Trash, or deletion never propagate.
3. **The Site substrate comes first.** Phase 2/D1 Site identity, host resolution,
   structural scope, path constraints, and authorization are prerequisites.
   There is no tenant-only interim duplicate.
4. **Source and destination authority are re-proved.** Preflight and commit both
   require source-revision read authority and target-Site create/edit authority.
   Tenant, environment, Site, locale, and favorable lifecycle state are
   server-derived, never client assertions.
5. **Transfer behavior is finite and typed.** A versioned code-owned manifest
   classifies every eligible field, rich-text node, block, custom block, and
   relationship as copy, materialize/remap, review, or never copy. Unknown or
   incompatible content fails closed.
6. **Authority never hitchhikes.** Paths, Navigation, assignments, review,
   schedules, release, search, cache, sitemap, analytics, Trash, safety,
   eligibility, Site settings, presentation, audit, and operational facts remain
   with their ratified owners. Target paths and references are separately
   selected and validated.
7. **The command is atomic and replay-safe.** One expiring immutable preflight
   plan, expected-revision fences, one short transaction, database uniqueness,
   an idempotency receipt, protected audit/outbox evidence, and
   authorization-aware reconciliation prevent partial, duplicate, overwritten,
   or resurrected targets.
8. **The UX says exactly what will happen.** The occasional More-actions command
   names the target Site/domain/locale, states that future edits will not stay in
   sync and nothing will publish, exposes copied/review/not-copied facts, and
   lands staff in a persistent **Draft — not live** target context with
   field-linked repairs.
9. **Copy has no public effect.** It creates no route, Navigation entry,
   canonical, social card, sitemap/search document, cache result, or public
   output. Only the target Site and locale's later complete D1 release can make
   the target public.
10. **Payload remains replaceable machinery.** Native duplicate and
    Copy-to-Locale controls are disabled for ordinary content. The Asym port uses
    authenticated exact-scope access, fallback-free reads, explicit draft
    creation, one shared transaction, and exact-pin conformance.
11. **Migration and activation are proof-gated.** Restartable Site backfill,
    constraints, checksums, shadow reads, additive catalog evolution, retained
    readers, provider qualification, hostile-scope tests, failure injection,
    bounded-linear load proof, and representative ministry usability/accessibility
    evidence precede activation.

### Source and no-authority boundaries

| Fact or operation                                   | Authority after D23            | Binding rule                                                                                            |
| --------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Ordinary Page/Article identity                      | D1 plus D23                    | Exactly one Tenant × environment × Site; never shared ownership.                                        |
| Locale Editorial and Placement lineages             | D22 and D2                     | Copy creates one explicit target locale draft and separately validates placement/path.                  |
| Reusable Sections                                   | D8                             | Materialize eligible content into fresh Page-local target content; never retain a cross-Site reference. |
| Page Starters                                       | D6                             | Remain Asym-owned code templates and instantiate fresh target-local content.                            |
| Navigation, folders, Topics, saved views, and Trash | D4 and D18–D21                 | Retain Site ownership and never copy as authority.                                                      |
| Presentation packages and Site chrome               | D9/D10 and Site owner          | Target compatibility is re-proved; source activation and settings do not transfer.                      |
| Media                                               | Phase 2/current Media owner    | May remain tenant-wide only after current target-use rights and safety proof; bytes are not duplicated. |
| Specialized ministry content                        | Phase 22                       | Excluded from this ordinary Page/Article command.                                                       |
| Public release and discovery                        | D1 and D14–D17                 | Copy creates no favorable public fact; target release later projects independently.                     |
| Safety and operational truth                        | Phase 10 and each source owner | Recomputed adverse-first; source favorable state never transfers.                                       |
| Payload duplicate/localization mechanics            | Qualified adapter              | Disabled or bounded behind the Asym command; never product authority.                                   |

### UX and operational consequences

- Staff use one calm **Copy to another Site...** dialog or sheet, never a
  wizard, bulk distributor, synchronization dashboard, or merge tool.
- Only authorized eligible Sites appear, identified by Site name and primary
  domain. The source revision and exact target locale are explicit.
- A source slug is a suggestion only. Staff see the complete proposed target
  address, and a collision never overwrites or silently invents a suffix.
- The outcome is always an independent private draft. Persistent Site, domain,
  locale, draft, provenance, and repair context replaces toast-only feedback.
- Repair items link to their affected fields or blocks and block D1 release when
  required; intentionally review-only items remain distinct.
- One stable receipt lets support and the user distinguish validation rejection,
  commit failure, uncertain response, successful reconciliation, and a later
  unrelated release without logging tenant content.
- The implementation remains a bounded synchronous command over one revision,
  depth-zero relationships, batched validation, and existing Page-size limits;
  it does not create a queue, recursive graph copier, or second work database.

### Adversarial disposition

Every required category has a material concern: brittleness, technical debt,
edge cases, footguns, tenant safety, overengineering, UX/UI friction, hidden
coupling, failure modes, data integrity, security/privacy, scalability,
operational burden, observability, dependency/integration risk,
migration/upgrade risk, and concurrency/deployment hazards. The permanent
response is the exact contract above: structural Site scope, an exhaustive typed
transfer manifest, explicit no-authority boundaries, current authorization,
atomic idempotent creation, repair-first private UX, D1-only public activation,
provider qualification, safe staged migration, and production-shaped proof—not
live cross-Site sharing or a general content-distribution platform.

### Required proof inherited by the eventual specification

Implementation remains unauthorized by this decision. A future authorized change
must prove at minimum:

1. Every ordinary field, rich-text node, D7/D9 block version, relationship, and
   qualified custom package has one exhaustive compatible transfer disposition;
   unknown content fails closed.
2. Wrong-Tenant, wrong-environment, wrong-Site, wrong-locale, wrong-actor,
   revoked-access, forged-target, receipt-probe, and inaccessible-reference tests
   disclose nothing and cannot mutate content.
3. Pending/failed autosave, conflict, offline state, source-head change, source
   Trash, target disablement, locale disablement, and permission revocation are
   re-proved between preflight and commit.
4. Concurrent copies, path races, double submit, same-key/same-request replay,
   same-key/different-request conflict, lost response, transaction failure,
   outbox failure, deployment skew, and adapter-generation skew never create a
   partial, duplicate, overwritten, or resurrected target.
5. Reusable Sections materialize, Page-local/anchor IDs remap, internal links and
   dynamic sources receive explicit target treatment, and Media rights/safety are
   re-proved without recursive or N+1 traversal.
6. Copy never creates or changes a route, Navigation item, release head,
   schedule, canonical, social card, search/sitemap record, cache result,
   analytics identity, review/approval, Trash, presentation activation, safety,
   or operational truth.
7. Exact pinned Payload duplicate suppression, Local API access, drafts,
   fallback, transaction propagation, hooks, versions, migrations, and upgrade
   behavior pass a replaceable adapter conformance suite.
8. Site backfill and contract migration are restartable, checksummed,
   constraint-verified, shadow-read, exportable, and recoverable without
   collapsing Site or locale distinctions.
9. Maximum-size Pages remain bounded-linear with depth-zero/batched reads, short
   transactions, no remote I/O inside transactions, safe retry budgets, and
   privacy-safe cause-coded telemetry.
10. Representative ministry staff complete the Hope-to-Relief copy, collision,
    repair, uncertain-response, and release-handoff scenarios without coaching
    across keyboard, screen reader, touch, 320-CSS-pixel reflow, 400% zoom,
    long/RTL labels, and slow or interrupted networks.

### Evidence and architectural record

- [D23 primary-source research, exact-provider audit, UX, ruthless review, and proof gates](./research/phase-23-d23-multisite-content-scope-decision-brief.md)
- [ADR-0167 — Exact Site-owned ordinary content with independent Copy-to-Site drafts](../../adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [D22 / ADR-0166](../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [D21 / ADR-0165](../../adr/0165-asym-owned-reference-aware-recoverable-trash.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D9 / ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D8 / ADR-0152](../../adr/0152-family-qualified-semantic-reusable-sections.md)
- [D2 / ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Payload collection configuration](https://payloadcms.com/docs/configuration/collections)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Storyblok multi-space orchestration](https://www.storyblok.com/docs/manuals/multi-space-orchestration)
- [Contentful cross-space references](https://www.contentful.com/developers/docs/references/content-management-api/cross-space-references/)
- [Sanity cross-dataset references](https://www.sanity.io/docs/studio/cross-dataset-references)
- [Phase 22 specification PR #1323](https://github.com/Asymmetric-al/core/pull/1323)

The complete quoted formulation above is the founder-ratified D23 authority. The
research evidence remains supporting analysis and does not independently expand
the decision. Ratification authorizes no implementation, schema, migration,
dependency or provider adoption, issue publication, deployment, D1 activation,
release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D23's canonical
terms are preserved here and in ADR-0167 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D23 do not yet decide broader layout/default inheritance; forms; generalized
media; broader SEO beyond ordinary editorial metadata; Phase 24 Site and locale
management; audience/cache policy; preview tokens; the exact permission matrix;
migration/cutover UX; the broader operational-health product; production
capacity budgets; or the exact qualified Payload version. These areas remain
founder decisions or evidence-backed implementation proofs and will be resolved
one at a time.

## D24 — One exact public audience with app-owned authenticated surfaces

**Status:** Founder-ratified on 2026-08-23 after primary-source research,
independent UX/security review, and a complete 17-category adversarial review.

### Exact ratified formulation

> **A-prime-amended-and-hardened (A-prime-R) — one exact, code-owned `public`
> audience for every Phase 23 Web Studio public representation, with app-owned
> authenticated surfaces, auth-invariant public delivery, and quiet
> consequence-first UX.** `public` means accessible without authentication and
> identical for every visitor at the same trusted Tenant, environment, Site,
> locale, canonical resource/path, active D1 Site Plan generation, renderer and
> contract generation, and current source-qualified public state. A present or
> expired session, donor/missionary/staff role, account history, cookie,
> authorization header, query or campaign parameter, referrer, geography,
> experiment, analytics state, device, crawler, HTML/RSC/prefetch mode, or
> browser navigation history never changes the CMS-authored body, Primary or
> Footer Navigation, Dynamic Content List membership/order, public media,
> metadata, canonical, robots disposition, sitemap, social presentation, or D17
> search document/admission. Site and locale are exact scope, not audiences;
> D2 `Listed publicly` and `Shared by link — public` are reach/discovery
> dispositions inside the one public audience; D13 exact whole-Page publication
> appointments govern when that public representation is active; and current
> Phase 10/source safety may narrow or withdraw it. None becomes a request-time
> visibility condition.
>
> Web Studio stores and exposes no tenant-authored audience field, table,
> catalog, role list, conditional-region expression, visitor simulator,
> disabled future selector, or per-block/menu/list schedule. Its existing
> Page-first workspace shows the quiet read-only fact **Visibility: Public
> website** and **Anyone can view this page after it is released**. Draft and
> preview remain clearly not public. The publish or schedule consequence names
> the exact Site, locale, resolved path, immutable revision, and D2 reach: a
> Listed release says it can be viewed, shared, and may appear in search; a
> Shared-by-link release says anyone with the link can view and reshare it, while
> Asym omits it from public discovery and requests no indexing without promising
> external secrecy or erasure. Later drafts stay private until separately
> released. One durable **Released**, **Updating public site**, **Live**, or
> cause-owned **Needs attention** state remains after transient feedback. The
> same truth is available on mobile and to keyboard, screen-reader, touch,
> zoomed, forced-colors, reduced-motion, RTL, bidirectional, CJK, and long-label
> users; it is never confined to color, an icon, hover text, a toast, or a
> desktop inspector.
>
> Preview remains the exact-version, currently authorized, private editorial
> capability already bounded by Phase 22 D10 or its owning Phase 23 successor;
> it says **Preview — not public. This is what anyone will see after release**,
> is private, no-store and noindex, uses the public compiler/renderer without
> becoming a public cache variant, and never grants authority or proves release.
> Donor Portal, Missionary Workspace, and Mission Control own their private
> content, DTOs, routes, permissions, search, caching, failure handling, and
> authorization on every request. Public Sites use stable task-named actions
> such as **Donor portal** or **Missionary portal**; the destination app handles
> authentication and safe return routing. No protected content, identity,
> balance, assignment, entitlement, token, or account result enters public HTML,
> RSC/data, prefetch, media, metadata, search, sitemap, social, analytics, logs,
> errors, or shared caches. Phase 22 D11's independently authorized Supporter
> Ministry Update projection remains source- and app-owned; only its separately
> qualified public projection may enter D1 public output. D24 neither widens nor
> collapses those audiences.
>
> The server derives the public scope and exact `public` discriminant; no client
> may supply or widen either. Candidate closure and every public artifact pin the
> same D1 generation and reject missing, nullable, unknown, mixed, or unsupported
> audience/schema values while preserving the prior complete safe generation.
> Cache identity includes every trusted dimension that can change bytes—Tenant,
> environment, Site, locale, canonical resource/path, active generation,
> artifact/renderer/contract, and exact `public`—whereas cache tags are bounded
> invalidation handles only, never tenant or audience isolation. Public
> composition and every D9 certified package are structurally unable to import
> cookies, sessions, authorization, roles, CRM segments, geography,
> experimentation, personalization, or browser-supplied audience state.
> Authenticated apps deny by default and reauthorize each request; `private` or
> `no-store` delivery is defense in depth, not authorization.
>
> Auth failure never changes or takes down ordinary public content. Unknown
> public scope, incomplete closure, dependency skew, or incompatible audience
> blocks the candidate and retains the prior safe generation; Phase 10/source
> adversity suppresses positive public output first; private-app failure never
> falls back to a privileged or user-specific public variant. Privacy-safe
> observability distinguishes release authority, cache and public-runtime
> convergence, D17 search deletion/lag, suppression, resolver ambiguity, and
> output-invariance failure without recording content or user identity.
> Migration inventories every legacy condition: only independently proven
> public-safe records migrate to `public`; private, conditional, restricted,
> unknown, or unresolvable records are quarantined rather than defaulted public.
> Completion requires exact-pin Next.js/Payload/Vercel and D9 package
> conformance, hostile cross-tenant/cache tests, identical normalized public
> artifact hashes across anonymous and authenticated request classes, complete
> absence of protected data from every public byte surface, exact
> release/withdrawal/race/rollback proof, and representative mobile,
> accessibility, localization, and ministry-staff usability evidence. A second
> audience requires a new founder decision and a complete owner, route,
> authorization, release, preview, cache, search, migration, observability, and
> incident contract; Phase 23 creates no dormant personalization substrate.

### Binding interpretation

1. **`public` is one exact product contract, not a default.** It is required in
   the provider-neutral public context, immutable D1 generation artifacts,
   derived public projections, cache/search identity, and conformance tests.
   Missing, null, unknown, or caller-supplied values fail closed.
2. **Authentication cannot alter Web Studio public output.** Public body,
   Navigation, dynamic lists, media, metadata, canonical, robots, sitemap,
   social output, and search remain semantically identical for anonymous,
   donor, missionary, staff, expired-session, crawler, HTML, RSC, and prefetch
   requests at the same exact public scope.
3. **Reach and time remain separately owned.** D2 distinguishes Listed from
   Shared-by-link public reach; D13 changes active public visibility only by
   exact D1 activation; Phase 10 and source owners may suppress public output.
   None authorizes visitor-conditioned rendering.
4. **Authenticated content stays app-owned.** Donor Portal, Missionary
   Workspace, Mission Control, and Phase 22 D11's protected Supporter projection
   use separate authorized routes and DTOs. Public links may open those apps,
   but private facts never enter the public representation or cache.
5. **The UX explains consequence without adding controls.** There is no
   audience field, rule builder, simulator, disabled selector, or repetitive
   warning. Page details, private preview chrome, and release confirmation give
   exact visibility, reach, Site, locale, path, revision, and durable outcome
   language across mobile and accessible interaction modes.
6. **Preview remains private while representing public truth.** It is exact-
   version and currently authorized, says **Preview — not public**, uses the
   public compiler/renderer, remains `no-store` and `noindex`, and never becomes
   authority or a shared public cache variant.
7. **Cache and tenant isolation are explicit.** Trusted server resolution owns
   Tenant, environment, Site, locale, resource/path, active generation,
   contract/renderer, and exact `public`. Cache tags invalidate only. Public
   composition and certified packages cannot read auth or personalization
   context.
8. **Failure preserves safety and coherence.** Unknown or incompatible closure
   blocks the candidate and retains the prior complete safe generation; adverse
   source/safety proof suppresses first; auth or private-app failure never
   changes ordinary public content or creates a privileged fallback.
9. **Legacy ambiguity never broadens access.** Only independently proved
   public-safe content migrates to `public`; conditional, private, restricted,
   unknown, or unresolvable content is quarantined.
10. **A second audience is a new product decision.** It requires its own owner,
    route, authorization, release, preview, cache, search, migration,
    observability, and incident contract. D24 creates no dormant
    personalization platform.

### Adversarial disposition

The full review checked brittleness, technical debt, edge cases, footguns,
tenant safety, overengineering, UX/UI friction, hidden coupling, failure modes,
data integrity, security/privacy, scalability, operational burden,
observability, dependency/integration risk, migration/upgrade risk, and other
concurrency/deployment hazards. A-prime-R removes inherent audience-cardinality
and audience-operations risk, but enforcement remains mandatory: exact public
scope, auth-invariant artifacts, separate private DTOs/routes, provider-neutral
cache identity, migration quarantine, adverse-first convergence, static package
boundaries, negative byte-surface tests, and accessible consequence-first UX.

### Required proof inherited by the eventual specification

1. Exact `public` is required and unknown/missing audiences fail closed in every
   public contract and artifact.
2. The complete D1 Tenant × environment × Site × locale × resource/path ×
   generation × contract/renderer × `public` context replaces transitional
   bridge identity before D24 may claim completion.
3. Static dependency checks prevent public compiler, renderer, Navigation,
   D9 packages, D14 sources, metadata, sitemap, robots, social, and D17 search
   paths from importing auth/session/segment/personalization inputs.
4. Warm-cache A→B→A tests prove isolation across Tenant, environment, Site,
   locale, host alias, generation, artifact, HTML, RSC, prefetch, direct/client
   navigation, crawler, and authenticated/anonymous request classes.
5. Normalized public output hashes remain identical across anonymous, donor,
   missionary, staff, expired/malformed session, and crawler requests; qualified
   CTA attribution cannot alter representation or authority.
6. Protected donor, missionary, staff, preview, restricted, token, identity,
   assignment, and provider facts are absent from every public HTML, RSC/data,
   prefetch, media, metadata, search, sitemap, social, analytics, log, cache, and
   error surface.
7. Preview, D13 scheduling, release, unpublish, Phase 10/source suppression,
   Tenant/Site disablement, search deletion, cache purge, dependency outage,
   deployment skew, rollback, and stale-job resurrection pass fail-safe and
   adverse-first tests.
8. Migration performs a complete condition census, quarantines ambiguity,
   rejects mixed old/new unknown values, preserves prior safe generations, and
   rehearses expand/migrate/contract plus rollback.
9. Operators can observe privacy-safe generation, convergence, suppression,
   resolver ambiguity, output-invariance failure, and search deletion/lag
   without recording content or user identity.
10. Exact target-branch Next.js, Payload, Vercel, search, and D9 package behavior
    is requalified from matching bundled docs/source and deployed black-box
    tests; current preview/internal pins are not treated as stable authority.
11. Representative ministry staff correctly distinguish draft, private preview,
    Released, Updating, Live, Listed, Shared-by-link, and app-owned private
    destinations across mobile, keyboard, screen reader, touch, 320 CSS pixels,
    400 percent zoom, forced colors, reduced motion, RTL, bidirectional, CJK,
    long labels, slow networks, and cause-owned recovery.

### Evidence and architectural record

- [D24 decision brief and exact formulation](./research/phase-23-d24-public-audience-visibility-and-cache-policy-decision-brief.md)
- [D24 cache/security exact-version and primary-source research](./research/phase-23-d24-public-audience-cache-security-primary-source-research.md)
- [D24 independent 17-category adversarial review](./research/phase-23-d24-public-audience-independent-adversarial-review.md)
- [D24 staff and visitor UX benchmark](./research/phase-23-d24-public-audience-ux-benchmark.md)
- [ADR-0168 — One exact public audience with app-owned authenticated surfaces](../../adr/0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D13 / ADR-0157](../../adr/0157-exact-revision-scheduled-publication-appointments-through-d1.md)
- [D9 / ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D5 / ADR-0149](../../adr/0149-bounded-public-navigation-purpose-and-item-grammar.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html)
- [Vercel Cache-Control](https://vercel.com/docs/caching/cache-control-headers)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [Drupal cache contexts](https://www.drupal.org/docs/develop/drupal-apis/cache-api/cache-contexts)
- [Google technical requirements](https://developers.google.com/search/docs/essentials/technical)

The complete quoted formulation above is the founder-ratified D24 authority.
Supporting research does not independently expand it. Ratification authorizes
no implementation, schema, migration, dependency or provider adoption, issue
publication, deployment, D1 activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D24's canonical
terms are preserved here and in ADR-0168 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D24 do not yet decide broader layout/default inheritance; forms; generalized
media; broader SEO beyond ordinary editorial metadata; Phase 24 Site and locale
management; the complete Phase 23 Preview and Live Preview product; the exact
permission matrix; migration/cutover UX; the broader operational-health product;
production capacity budgets; or the exact qualified Payload version. These
areas remain founder decisions or evidence-backed implementation proofs and
will be resolved one at a time.

## D25 — Immutable whole-Site Preview Candidates over sealed Site Plan inputs

**Status:** Founder-ratified on 2026-08-23 after Payload/Next primary-source
research, whole-Site staff-UX and Supabase/Postgres review, and a complete
17-category adversarial review.

### Exact ratified formulation

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — one exact, immutable Whole-Site
> Preview Candidate for one Tenant × environment × Site × BCP-47 locale and one
> sealed Site Plan input vector over D1’s public compiler, paired with B-prime’s
> bounded Page-local Preview page and Open exact preview cadences.** The ordinary
> Page-first **Preview page** action may show one optional wide-screen pane, or
> the same top-level full-screen view on narrow/zoomed screens, for the one
> active D12 editor; it advances only after an exact Working Revision is
> server-acknowledged, keeps the last still-authorized exact frame while work is
> unsaved, saving, conflicted, taken over or outcome-unknown, fences and discards
> late results, and never turns Payload form state, mutable `latest`, a browser
> message or a Draft Mode cookie into saved, reviewable or releasable truth.
>
> A deliberate **Prepare site preview** action in the Site Plan/release workspace,
> available only to a principal with current Site-wide preview capability,
> flushes that principal’s active editor and then freezes one explicit,
> server-fenced input vector selected by that cause-owned D1 preparation intent:
> the exact current D1 base generation—or D1’s code-owned empty genesis before a
> first release—the deliberately included D12-acknowledged Site-locale Working
> Revisions, and all exact Page Editorial, Placement, Navigation, route/redirect,
> Reusable Section, rich-text, topic, Dynamic Source, curation/windowing,
> media-rendition, presentation-package/profile, compiler/renderer/schema,
> deployment and safety-contract dependencies. It never sweeps all current
> drafts or other users’ browser-only work. Whole Site means every eligible
> route in that one exact locale; another locale is a separately sealed
> candidate, never silent fallback or a mixed cross-locale closure. Phase 22
> specialized families enter through the current D1 public projection or a
> separately authorized exact source-owned preview candidate, never by scanning
> mutable source drafts, copying operational records or widening source
> authority. A Page-scoped contributor, missionary, reviewer or named recipient
> remains on Phase 22 D10’s exact Page-local preview; D25 does not mask
> unauthorized routes and call the remainder a whole-Site candidate.
>
> Candidate preparation captures identifiers in one short stable database
> snapshot, performs compilation, Payload/source reads and artifact work outside
> locks with bounded concurrency, exact-version reads and idempotent
> content-addressed reuse, then re-proves complete scope, current authority,
> lifecycle/safety, dependency and runtime compatibility and seals one immutable
> manifest and receipt through a short CAS finalization. A candidate becomes
> **Ready** only if the complete route and render closure succeeds; partial work
> is never browsable. Later saves never move it: staff see **Newer saved changes
> available**, and **Prepare updated preview** creates an immutable successor.
> Failure leaves the last still-authorized exact candidate visibly unchanged;
> authorization or adverse-safety failure removes protected output, and no path
> falls back to live, generic presentation, another locale/Site/Tenant, raw
> provider data or favorable stale truth.
>
> The candidate executes the same provider-neutral public Presentation View
> Model, D1 compiler, D9 certified Site package and semantic renderers as public
> delivery, with exact candidate-only paths, Navigation, deep links, back/forward,
> 404s and bounded D3 redirects. Internal links remain inside the candidate;
> missing targets never escape to live. D14 source configuration is exact while
> intentionally dynamic membership is the current qualified public-safe
> projection, labelled **Live public data · as of …** and narrowed adverse-first.
> Giving, forms, subscriptions, notifications, analytics, tracking, prefetch,
> external embeds and consequential downloads remain dark; safe chrome may
> explain the qualified live destination without executing it or leaking a
> preview referrer.
>
> One quiet accessible preview chrome persistently says **Site preview · Not
> public**, names Site and exact locale, prepared time and included saved-change
> count, distinguishes current, newer, stale, blocked, expired and session-ended
> states, and provides **Back to editor**, permissioned **Edit this page**,
> **Prepare updated preview** and separately labelled **View live site**. Exact
> dependency ids remain behind details. Loading never steals focus or erases a
> still-safe frame; readiness opens only after a user action; status changes are
> programmatically announced; and the full journey must work at 320 CSS pixels,
> 400% zoom, keyboard, screen reader, touch, forced colors, reduced motion,
> RTL/bidirectional/CJK text, long localization, slow networks and suspended
> mobile tabs.
>
> Every HTML, RSC/data, route, redirect, asset, source and management request
> reauthorizes the current principal and server-derived exact scope. A URL,
> opaque candidate id, prior success, Payload login, cookie, iframe or popup is
> never authority; copied deep links work only for an independently authorized
> principal and no bearer/password/anonymous/public sharing exists. Preview
> responses are `private, no-store`, noindex/nofollow/noarchive and absent from
> public cache, canonical, hreflang, social, sitemap, search and analytics.
> Protected artifacts and assets stay behind the authenticated private server
> boundary; a public bucket or expiring signed URL never supplies candidate
> authority. Embedded Page Live Preview uses exact allowed origins,
> source-window equality, typed protocol version, session nonce and revision
> sequence. Privacy-safe observability records hashes, sizes, timings and cause
> codes—not content, route text, personal names or secrets.
>
> Supabase/Postgres stores only the compact scoped preparation/candidate
> manifest, immutable receipt and bounded normalized membership needed for
> integrity, route lookup, authorization and cleanup; compiled content-addressed
> artifacts live behind the private server boundary. Exposed rows use RLS, least
> grants, structural Tenant/environment/Site/locale integrity and indexes proven
> against actual policy and lookup shapes; privileged workers receive
> identifier-only jobs and independently validate complete scope. There is no
> copied Page/CRM/source corpus, database write per Page view or browser
> heartbeat history, Supabase Branch, cloned database, Realtime presence,
> per-Tenant retention matrix or service credential in the client. Preparation
> and serving use pooled short connections, set-based reads,
> bounded depth/concurrency, measured query/compile/artifact budgets, backpressure, idempotent
> cleanup and privacy-safe health alerts.
>
> A code-owned bounded renderable lifetime and exact package/compiler/deployment
> compatibility keep candidates recoverable without becoming permanent staging
> Sites. Expiry never redirects to live and ordinary Trash/safety changes may
> invalidate a candidate immediately. D1 alone performs fresh authority,
> compatibility, route, reference and safety proof and CAS-activates a new
> Public Site Generation; it may reuse independently qualified content-addressed
> work but can never promote a Preview Candidate, switch an environment alias or
> treat preview approval as publication. D25 creates no mutable staging head,
> cloned environment, permanent preview deployment/domain, arbitrary revision
> branch, release/approval/schedule authority, visual editing overlays, comments,
> presence, CRDT/OT, per-keystroke Site builds, tenant-defined preview settings,
> partially masked whole-Site view, destructive rollback or second source of
> public truth. Ratification records this product boundary only and authorizes no
> implementation, schema, migration, provider adoption, issue publication,
> deployment, release activation or production change.

### Binding interpretation

1. **There are three clear tasks, not three architectures.** **Preview page** is
   fast acknowledged-save feedback, **Open exact preview** is pinned Page/review/
   schedule truth, and **Prepare site preview** is deliberate complete-Site
   review. All use one public-safe compiler and safety contract.
2. **Selection is explicit and reproducible.** One candidate binds one current
   D1 generation—or D1’s code-owned empty genesis before first release—one exact
   locale, one Site Plan input vector, and its complete dependency/version
   closure. It never sweeps every current draft or resolves request-time latest.
3. **Ready means complete.** A candidate is immutable, candidate-local for every
   route/link/404/redirect, all-or-none, and replaced only by an explicit
   successor. Partial output and live fallback are forbidden.
4. **Current authority always wins.** Site-wide capability is required for the
   whole candidate and rechecked on every continuation. Page-limited users stay
   on exact Page preview; a locator, login, cookie, signed URL, or worker role is
   never viewer authority.
5. **Public parity has one owner.** D1’s compiler, D9’s exact certified package,
   D24’s public-safe representation, D22 locale lineage, D14 current public-safe
   dynamic membership, and Phase 10/21 adverse safety remain authoritative.
6. **Preparation is short-transaction and idempotent.** Exact identifiers are
   captured in a short snapshot; compilation and artifact work happen outside
   locks; short CAS finalization prevents stale workers and partial readiness.
7. **Preview is private and side-effect-dark.** Giving, forms, notifications,
   analytics, tracking, external embeds, prefetch, and consequential downloads
   cannot execute. Preview is no-store/noindex and absent from every public
   cache, crawler, search, sitemap, social, canonical, and analytics surface.
8. **Supabase is not the preview corpus.** It stores compact scoped receipts and
   bounded integrity membership, protected by structural scope, RLS, grants,
   and actual query-plan indexes; private content-addressed artifacts remain
   behind the authenticated server boundary.
9. **Preview never becomes release.** D1 freshly re-proves all current release,
   routing, dependency, compatibility, and safety facts. It can requalify safe
   artifact work but cannot promote a Preview Candidate or flip an alias.
10. **The UX explains truth without operational jargon.** Persistent chrome
    names Site, locale, prepared time, included changes, and **Not public**;
    separate actions return to editing, update the candidate, or visit live.
11. **Failure is cause-owned and adverse-first.** Newer work, blocked builds,
    expiry, revocation, safety changes, deployment skew, and source failures are
    distinct and observable without content, route text, personal names, or
    secrets in telemetry.
12. **The boundary is intentionally small.** D25 creates no cloned environment,
    staging head, share system, release workflow, comments/presence, visual
    editing, per-keystroke Site builds, arbitrary revision stacks, or tenant-
    configurable preview lifecycle.

### Adversarial disposition

The complete review found a material unmitigated concern in every required
category: brittleness, technical debt, edge cases, footguns, tenant safety,
overengineering, UX/UI friction, hidden coupling, failure modes, data integrity,
security/privacy, scalability/performance, operational burden, observability,
dependency/integration risk, migration/upgrade risk, and other concurrency and
deployment hazards. C-prime-R retains the valuable complete-Site journey while
removing the literal environment, mutable latest, all-drafts sweep, second
renderer/head, bearer sharing, cloned database, active side effects, and direct
promotion that caused the largest permanent risks.

### Required proof inherited by the eventual specification

1. Candidate identity equals one exact Tenant × environment × Site × locale ×
   sealed input vector × compiler/package/safety contract and cannot mutate on
   reload, later save, retry, concurrent preparation, or deployment.
2. First-release empty genesis and current-generation bases both produce exact,
   complete, candidate-local route graphs with no live fallback.
3. Wrong-Tenant/Site/locale/candidate/Page/revision/media/artifact identifiers,
   expired or revoked sessions, and Page-limited principals fail non-enumeratingly
   under cold and warm caches.
4. RLS, grants, structural constraints, worker scope reload, service-key
   isolation, and production-shaped indexed query plans are proven together.
5. Save, selection, revision removal, duplicate request, lost acknowledgement,
   serialization retry, stale worker, cancellation, cleanup, successor, and
   deployment-skew races preserve one exact receipt and no partial state.
6. Navigation, deep links, query strings, 404s, reserved paths, redirect chains/
   loops/open redirects, browser history, and locale changes remain candidate-
   local and exact.
7. Standard and every D9 certified package render from the same D1 view model;
   unknown blocks, generic fallback, raw provider JSON, and incompatible package
   or compiler generations fail closed.
8. Dynamic-source configuration remains exact, current public-safe membership is
   freshness-labelled, and adverse withdrawal suppresses immediately without
   cross-Tenant or private-data leakage.
9. Giving, forms, subscriptions, notifications, analytics, tracking, prefetch,
   embeds, downloads, referrers, public cache, crawlers, search, sitemap, social,
   canonical, and analytics tests prove zero unintended effects or discovery.
10. Expiry, Trash, permission loss, safety change, package invalidation, artifact
    loss, cleanup, mixed N/N+1 readers/workers, rollback, and old-route retirement
    never redirect, resurrect, or expose protected output.
11. Preparation latency, closure size, artifact reuse, database time, queue delay,
    failure causes, cleanup lag, and per-Site cost meet bounded budgets without
    impairing D1 public release.
12. Representative ministry staff can distinguish saved, candidate, and live;
    identify Site/locale/included changes; prepare, browse, update, recover, and
    return without coaching across keyboard, screen reader, touch, 320 CSS
    pixels, 400 percent zoom, forced colors, reduced motion, RTL/CJK/long labels,
    slow networks, and suspended mobile tabs.

### Evidence and architectural record

- [D25 decision brief and exact formulation](./research/phase-23-d25-preview-and-live-preview-decision-brief.md)
- [D25 complete adversarial review](./research/phase-23-d25-whole-site-preview-adversarial-review.md)
- [D25 whole-Site staff UX benchmark](./research/phase-23-d25-whole-site-preview-ux-benchmark.md)
- [D25 Supabase/Postgres research](./research/phase-23-d25-whole-site-preview-supabase-postgres-research.md)
- [D25 Payload/Next primary-source research](./research/phase-23-d25-payload-preview-live-preview-primary-source-research.md)
- [D25 current-contract and repository audit](./research/phase-23-d25-preview-contract-and-repository-audit.md)
- [D25 Page Preview UX/security benchmark](./research/phase-23-d25-preview-ux-security-benchmark.md)
- [ADR-0169 — Immutable whole-Site Preview Candidates](../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
- [D24 / ADR-0168](../../adr/0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
- [D22 / ADR-0166](../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D14 / ADR-0158](../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md)
- [D12 / ADR-0156](../../adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [D9 / ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Payload Live Preview](https://payloadcms.com/docs/live-preview/overview)
- [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode)
- [Sanity Content Releases](https://www.sanity.io/docs/user-guides/content-releases)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

The complete quoted formulation above is the founder-ratified D25 authority.
Supporting research does not independently expand it. Ratification authorizes
no implementation, schema, migration, dependency or provider adoption, issue
publication, deployment, D1 activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D25’s canonical
terms are preserved here and in ADR-0169 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D25 do not yet decide forms and submission ownership; generalized public CMS
media beyond the Phase 22/29 seam; broader SEO beyond ordinary editorial
metadata; the exact permission matrix; content import/export and migration/
cutover UX; the broader operational-health product; production capacity
budgets; or the exact qualified Payload version. These areas remain founder
decisions or evidence-backed implementation proofs and will be resolved one at
a time.

## D26 — Purpose-bounded Public Form Definitions with domain-owned routing

**Status:** Founder-ratified on 2026-08-23 after repository and primary-source
research, Resend/Email Studio and domain-ownership review, focused Inngest and
TanStack Form qualification, staff/visitor UX and accessibility analysis, and
a complete 17-category adversarial review.

### Exact ratified formulation

<!-- prettier-ignore -->
> **B-prime-amended-and-hardened (B-prime-R) — Purpose-bounded Public Form
> Definitions with one purpose-qualified Primary Outcome and independently
> governed notification deliveries.**
>
> 1. **One purpose-bounded definition.** Each public form belongs to one small,
>    code-owned, versioned Public Form Purpose Profile. The profile fixes stable
>    semantic field meanings, required domain mappings, sensitivity ceiling,
>    consent, retention, eligible Primary Outcomes, compatible message
>    contracts, and abuse bounds. Unknown versions fail closed.
> 2. **Safe tenant customization, not executable tenant logic.** Staff may edit
>    translated presentation copy, labels, help, options, order, approved
>    optional fields, confirmation copy, and a bounded catalog of ordinary
>    supplemental questions. They cannot change protected semantics,
>    classification, retention, consent meaning, required owner fields,
>    recipients from visitor data, arbitrary code/webhooks, or domain
>    authority. Supplemental answers never silently populate domain fields.
> 3. **One Primary Outcome.** Every released Route Plan names exactly one
>    operational owner. Support Hub-only means a Support Hub conversation is
>    truth. Email-only means one action-qualified Verified Email Destination
>    with durable, short-retained Asym delivery evidence and no second staff
>    inbox; its member deliveries remain independently observable. Mobilize,
>    subscription, event, workflow, care, or other destinations remain
>    unavailable until their owning phase certifies an exact adapter. There is
>    no multi-master fan-out.
> 4. **Independent secondary effects.** A Route Plan may add zero or more staff
>    Notification Deliveries and zero or one Visitor Acknowledgement. A
>    successful Primary Outcome is never rolled back because a notification
>    fails. Each child has its own idempotency, state, evidence, retry, and
>    recovery.
> 5. **Verified email destinations.** Tenant administrators manage reusable,
>    same-Tenant destinations with accountable owner, action/notification use,
>    active/verified status, monitored-address attestation, and sensitivity
>    ceiling. They may resolve eligible teams, users, single external
>    addresses, or distribution addresses. Resolution freezes exact recipients
>    per submission; each member receives a separate intent and addresses are
>    never exposed to one another. An email-only handoff completes only when
>    every frozen required member is transport-accepted; later adverse evidence
>    raises **Needs attention**. Browser input never controls recipients.
> 6. **Email Studio is the content authority.** Staff select compatible Phase 17
>    message contracts and Live Email Studio publications for staff
>    notification and visitor acknowledgement separately. D26 stores no raw
>    Resend template authority. At preparation, Phase 6/17 freezes the exact
>    publication, locale, facts, sender/reply identity, consent/suppression
>    result, provider connection, and recipients. Later Email Studio or
>    email-destination changes affect future submissions only.
> 7. **Resend is bounded transport.** Every recipient is an independent
>    communication intent; provider batch APIs are an optimization only. Asym's
>    durable semantic idempotency outlives Resend's 24-hour provider window.
>    Accepted, receiving-server delivered, bounced, suppressed, complained,
>    and failed remain distinct facts; opened/clicked telemetry is non-
>    authoritative. Duplicate/out-of-order webhooks are verified, deduplicated,
>    and reduced monotonically.
> 8. **Minimal and safe email content.** Staff notifications default to a
>    bounded safe summary and authenticated product link. Visitor receipts are
>    transactional and never echo arbitrary free text, sensitive answers, or
>    internal routing. No answer can control sender, recipient, subject,
>    template, headers, reply behavior, tracking, or redirect; no raw
>    `all_fields` merge exists.
> 9. **Durable server-side acceptance.** The public browser posts only to an
>    Asym server boundary. The server derives scope from trusted host/current
>    D1 generation, validates the exact released schema and limits, and
>    transactionally records one immutable Form Submission Occurrence, exact
>    Route Plan, Primary Outcome work item, child intents, and corresponding
>    product-owned workflow-dispatch requests before saying **Received**. The
>    transaction commits all of them or none of them. Direct anonymous writes
>    to domain, route, or delivery tables are forbidden.
> 10. **No ownerless submissions database.** The occurrence envelope is
>     delivery/recovery truth, not a generic CMS inbox. Staff work in Support
>     Hub, Mobilize, or the certified purpose owner. Email-only content is
>     encrypted, available only to a narrow repair capability, retained for a
>     fixed short purpose-bound period, and purged while body-free evidence
>     remains.
> 11. **Exact release behavior.** D1 releases the form definition and Route Plan
>     as one Site-locale generation. Page placements cannot override delivery.
>     Route changes require a Site release. Source-owned recipient membership
>     and Email Studio publications re-resolve for future occurrences; current
>     authorization, consent/suppression, integration readiness, and adverse
>     safety revocation are re-proved before an effect crosses its boundary.
>     Historical completed evidence never drifts.
> 12. **Calm five-step UX.** The default workflow is **Purpose**, **Questions**,
>     **Delivery**, **Confirmation**, and **Review & publish**. Delivery is split
>     into **Where the work goes**, **Who should be notified**, and **What the
>     visitor receives**. The UI uses a numbered plain-language outcome summary,
>     not a node graph; shows owner, included data, retention, recipients,
>     templates, readiness, and failure meaning; and blocks release on required
>     Not Ready dependencies.
> 13. **Purpose-aware product handoffs.** Donation uses Phase 13 Giving rather
>     than a generic form. Applications use Phase 34/37's future certified
>     definition and Mobilize adapter. Classified care/crisis uses Phase 38.
>     Uploads wait for Phase 29. Newsletter consent/confirmation uses the
>     Phase 32 subscription owner through Phase 3's consent seam. Disabled
>     choices state the exact setup action; D26 does not invent placeholder
>     records.
> 14. **Accessible visitor journey.** Forms are short, predominantly single-
>     column, visibly labeled, grouped, mobile/zoom safe, and server validated.
>     Errors preserve answers, focus and link an accessible summary, appear at
>     fields, and never silently remap stale-schema answers. Confirmation says
>     what was durably accepted and what happens next without promising inbox
>     delivery or response time the tenant cannot meet.
> 15. **Layered abuse and privacy controls.** Trusted host/generation proof,
>     replay/idempotency tokens, allowlist validation, field/request/byte bounds,
>     per-purpose and multi-dimensional rate limits, honeypot/timing signals,
>     backpressure, and accessible risk-based challenges protect ingress. No
>     personal or answer data enters URLs, logs, analytics, traces, metric
>     labels, or provider tags. Launch includes no arbitrary redirects,
>     JavaScript, payments, uploads, or generalized conditional workflows.
> 16. **Tenant and permission safety.** Every identifier and adapter lookup is
>     structurally bound to Tenant × environment × Site and checked server-
>     side. Operational tables are server-only or protected by least grants,
>     RLS, matching indexes, and denial tests; service-role credentials never
>     reach clients. Form editors cannot grant themselves Support Hub,
>     Mobilize, Email Studio, recipient, or sensitive-answer access.
> 17. **Partial failure is explicit and recoverable.** Primary and child work
>     execute asynchronously with stable work claims and stale-result fencing.
>     Transient failures retry within bounded policy; indeterminate provider
>     outcomes reconcile before resend; permanent invalid configuration fails
>     closed; successful steps are not repeated. Email-only forms with no safe
>     recoverable destination show an approved alternate contact.
> 18. **Quiet operational health.** Form health exposes redacted actionable
>     counts, oldest pending age, route/template/recipient/provider readiness,
>     exact step receipts, sustained alerts, and bounded reconcile/retry. It
>     never becomes a second content inbox or reveals answers beyond the
>     purpose owner's permissions.
> 19. **Side-effect-dark Preview and explicit tests.** D25 Preview permits visual
>     interaction and validation but creates no occurrence, owner record,
>     message, or conversion. Authenticated **Check routing** performs a no-write
>     plan; **Send test email** uses synthetic data, an authorized test
>     recipient, and visible TEST labeling. Production proof covers purpose,
>     owner, locale, tenant isolation, races/replays, partial failure,
>     provider/webhook behavior, privacy, retention, abuse, accessibility,
>     performance, cost, recovery, and upgrade conformance.
> 20. **Payload is optional machinery, never authority.** Payload may provide a
>     version-qualified authoring adapter only behind this provider-neutral
>     contract. Its native Form Submissions, dynamic email, payment, upload,
>     fallback-recipient, and unrestricted redirect paths stay disabled or are
>     replaced. D26 adds no general workflow graph, arbitrary adapter runtime,
>     duplicated Support/Mobilize inbox, or second template system.
> 21. **Inngest is the bounded post-commit executor.** D26 reuses Core's existing
>     shared Inngest runtime only after Clause 9's transaction commits. One
>     identifier-only event points to each independently recoverable destination
>     intent; product records, permanent idempotency, fenced work claims, owner
>     outcomes, and the shared dispatch ledger/recovery scan remain authority.
>     Tenant-keyed concurrency and owner-qualified queued throttling may delay
>     accepted work but never discard it. D26 adds no per-Tenant app or
>     scheduler, puts no answers or personal data in workflow events, and
>     delegates all recipient-level email execution to Phase 6/17.
> 22. **TanStack Form is the bounded staff interaction adapter.** The complex
>     five-step staff builder reuses an accessibility-proven, version-pinned
>     shared `useAsymForm` adapter for local edit state, fields, arrays, cross-
>     field feedback, and server-error reconciliation. The Asym-owned released-
>     definition compiler and server commands remain authority. The launch
>     public form uses semantic HTML with browser-native submission, a no-
>     JavaScript path, and exact server validation; D26 adds no generic JSON-form
>     engine, client-authoritative validation, hidden browser autosave, or new
>     meta-framework form package.

### Binding interpretation

1. **One purpose defines the safe envelope.** A small code-owned, versioned
   Purpose Profile owns semantic meanings, domain mappings, classification,
   consent, retention, compatible outcomes/messages, and abuse bounds. Tenant
   customization changes presentation and approved supplemental questions,
   never executable authority.
2. **Every form has one operational owner.** Exactly one Primary Outcome is
   truth. Support Hub, one bounded verified-email handoff, or a separately
   certified domain adapter owns staff work; several systems never become
   competing masters.
3. **Notifications are children, not ownership.** Staff notifications and one
   optional visitor acknowledgement have independent idempotency, evidence,
   retry, recovery, consent, and failure meaning. Their failure never rolls
   back a successful Primary Outcome.
4. **Email destinations are governed resources.** Accountable same-Tenant
   destinations freeze eligible recipients per occurrence, keep member
   outcomes independent, conceal addresses from one another, and never accept
   recipient authority from browser answers.
5. **Email Studio and Phase 6/17 remain authoritative.** Exact compatible Live
   publications, facts, locale, identity, consent/suppression, connection, and
   recipients freeze at preparation. Resend is transport only; provider
   acceptance, delivery, bounce, suppression, complaint, and failure remain
   distinct evidence.
6. **Acceptance is atomic and server-owned.** One trusted Asym boundary derives
   exact scope and validates the released definition. The occurrence, exact
   Route Plan, complete outcome/child intent set, and product-owned workflow-
   dispatch requests commit together before the visitor sees **Received**.
7. **There is no ownerless form inbox.** The occurrence is narrow recovery
   truth, not a generic submissions workspace. Staff work in the purpose-
   owning product; email-only sensitive content is encrypted, narrowly
   repairable, short-retained, and purged while body-free evidence remains.
8. **D1 releases definition and delivery together.** Page placement cannot
   override routing. Future route changes require release, mutable owner
   membership re-resolves only for future occurrences, and current safety and
   authorization are re-proved before each effect crosses its boundary.
9. **The UX is guided and consequence-first.** Staff use **Purpose**,
   **Questions**, **Delivery**, **Confirmation**, and **Review & publish**,
   with a plain-language outcome summary rather than a workflow graph. Public
   forms are semantic, native, accessible, mobile-safe, server-validated, and
   honest about what was received and what happens next.
10. **Future domains stay disabled until certified.** Giving, applications,
    subscriptions, uploads, care, events, and generalized workflows retain
    their owning phases. D26 neither manufactures placeholder records nor
    makes email a substitute for missing domain commands.
11. **Anonymous ingress is hostile by default.** Trusted host/generation proof,
    durable idempotency, allowlists, byte/field/rate/backlog limits, adaptive
    abuse controls, structural Tenant/Site scope, server-only credentials,
    least grants, RLS where exposed, and denial tests are mandatory.
12. **Partial failure is product-visible and recoverable.** Stable work claims,
    stale-result fencing, bounded retries, unknown-outcome reconciliation,
    monotonic provider evidence, redacted Form health, and cause-owned repair
    keep successful effects from repeating or disappearing.
13. **Existing libraries remain replaceable adapters.** Inngest executes only
    committed identifier-referenced intents through the shared ledger and
    recovery scan; permanent product idempotency remains authority. TanStack
    Form powers the accessibility-proven staff builder, while the launch
    public form keeps browser-native submission and exact server validation.
14. **Payload is optional authoring machinery.** Its native submissions, direct
    mail, payment, upload, fallback-recipient, and unrestricted redirect
    behavior do not become D26 authority. There is no general workflow graph,
    second template system, or duplicate Support/Mobilize inbox.

### Adversarial disposition

The complete review found a material concern in every required category:
brittleness, technical debt, edge cases, footguns, tenant safety,
overengineering, UX/UI friction, hidden coupling, failure modes, data
integrity, security/privacy, scalability/performance, operational burden,
observability, dependency/integration risk, migration/upgrade risk, and other
concurrency/deployment hazards. The decisive additional finding was a crash
gap between a committed product occurrence and later creation of its shared
workflow-dispatch row. B-prime-R closes that gap with one atomic PostgreSQL
acceptance transaction, then uses the existing shared executor and recovery
scan without making Inngest or its 24-hour deduplication product truth.

### Required proof inherited by the eventual specification

1. Every code-owned Purpose Profile, field kind, supplemental-question bound,
   exact released compiler version, destination compatibility, locale, and
   classification combination passes definition and server-validation tests.
2. Occurrence, complete destination-intent set, and workflow-dispatch rows
   commit or roll back together; a crash immediately after commit recovers
   without visitor resubmission.
3. Duplicate HTTP requests, clicks, events, retries, manual repair, concurrent
   workers, and replay after provider deduplication windows produce one exact
   business effect.
4. Support Hub-only, verified-email-only, owner-plus-email, acknowledgement,
   empty/revoked recipient, and every not-yet-certified domain combination
   has exact readiness, success, failure, and safe-alternative behavior.
5. Phase 6/17 freezes compatible publication, facts, sender/reply identity,
   consent/suppression, connection, and recipients; per-recipient Resend and
   duplicate/out-of-order webhook outcomes reconcile monotonically.
6. Forged Tenant, environment, Site, locale, generation, form, route, owner,
   inbox, recipient, template, and intent identifiers fail non-enumeratingly
   under grants, RLS where exposed, service-role containment, and worker reload.
7. Workflow envelopes reject answers, addresses, bodies, rendered content,
   recipients, uploads, consent text, secrets, and tokens; stored/logged
   failures use bounded safe codes and product-owned outcomes.
8. Request, field, byte, fan-out, rate, backlog, retention, purge, encryption,
   hostile input, abuse challenge, privacy export/deletion, and operator-access
   behavior meets purpose-qualified limits.
9. Stale form releases, option changes, ambiguous responses, suspended tabs,
   D1 release races, D25 side-effect-dark Preview, rollback, and adverse safety
   preserve exact truth without silent answer remapping or favorable fallback.
10. Native no-JavaScript submission, autofill, mobile input modes, preserved
    values, linked error summary, field focus, keyboard, screen reader, touch,
    zoom/reflow, forced colors, reduced motion, RTL/CJK, and slow networks pass.
11. Inngest disabled, unavailable, quota-exhausted, retried, or upgraded leaves
    accepted work safe and recoverable; Tenant fairness, queue age, recovery
    drain time, executions per occurrence, and account-wide cost meet budgets.
12. Migration and mixed-version tests quarantine unknown purpose/route/provider
    states, preserve completed evidence, keep old releases readable, and prove
    adapter replacement and rollback without reviving Payload/provider truth.

### Evidence and architectural record

- [D26 decision brief and exact formulation](./research/phase-23-d26-public-form-definitions-and-routing-decision-brief.md)
- [D26 complete adversarial review](./research/phase-23-d26-public-forms-adversarial-review.md)
- [D26 Resend and email-routing primary-source research](./research/phase-23-d26-resend-email-routing-primary-source-research.md)
- [D26 Inngest and TanStack Form fit research](./research/phase-23-d26-inngest-and-tanstack-form-fit-research.md)
- [ADR-0170 — Purpose-bounded Public Form Definitions](../../adr/0170-purpose-bounded-public-form-definitions-and-domain-owned-routing.md)
- [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)
- [Phase 17 system messages and template management](./phase-17-system-messages-template-management.md)
- [Email Studio](../../guides/features/email-studio.md)
- [Resend integration](../../guides/features/resend-integration.md)
- [D25 / ADR-0169](../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)

The complete quoted formulation above is the founder-ratified D26 authority.
Supporting research does not independently expand it. Ratification authorizes
no implementation, schema, migration, dependency or provider adoption, issue
publication, deployment, D1 activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until Phase 22 PR #1323 merges
or Phase 23 becomes an explicit stack on its reviewed head. D26's canonical
terms are preserved here and in ADR-0170 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D26 do not yet decide generalized public CMS media beyond the Phase 22/29
seam; broader SEO beyond ordinary editorial metadata; the exact permission
matrix; content import/export and migration/cutover UX; the broader
operational-health product; production capacity budgets; or the exact
qualified Payload version. These areas remain founder decisions or evidence-
backed implementation proofs and will be resolved one at a time.

## D27 — Tenant-wide Public Media Catalog with Site-use qualification and immutable custody

**Status:** Founder-ratified on 2026-08-23 after Payload 4 and repository
research, Supabase/Postgres/Storage custody and RLS analysis, nonprofit missions
media-workflow and ethical-communications research, complete UX/accessibility
design, a 17-category adversarial review, and an independent final consistency
audit.

### Exact ratified formulation

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

### Binding interpretation

1. **D27 is a bounded public-still-image DAM, not the universal file system.**
   One Tenant-wide Media catalog serves public Page, Article, missionary,
   project, SEO/social, and certified-package presentation. The launch kind is
   closed; private documents, arbitrary files, PDFs, animation, uploaded audio/
   video, remote URL import, and enterprise creative operations remain outside.
2. **Logical media and historical bytes never drift.** One stable asset owns
   append-only revisions; every source and rendition has an immutable identity,
   digest, exact profile/processor version, and private provider copy. Re-upload,
   filename, folder, provider key, or a Payload document version is never
   historical custody.
3. **D27, Phase 10, Phase 29, and D1 have separate authority.** D27 owns the
   public-media catalog, media evidence/review, current Site qualification,
   Used in, purpose retention, hold requests, and disposition authorization.
   Phase 10 remains the strictest publication-safety and adverse-containment
   ceiling. Phase 29 owns byte/rendition custody, quarantine, access audit,
   backup, hold/disposition execution, and provider mechanics. D1 alone makes
   an exact generation publicly reachable.
4. **Intake is private, Tenant-bound, and hostile by default.** Server-authorized
   upload sessions, closed type and resource limits, exact object finalization,
   signature/decode inspection, malware/sandbox policy, sensitive-metadata
   removal, deterministic safe re-encoding, idempotency, and reconciliation are
   mandatory. Uploaded never means Ready or Public.
5. **Rights, consent, and ministry safety are current facts.** Site qualification
   is reason-coded and version-qualified beneath Phase 10. Uncertainty and stale
   or missing proof fail closed. Crossing a governing rights, consent, or safety
   expiry automatically denies current origin; time-bounded media uses controlled
   delivery whose cache freshness, stale allowances, and delivery retention
   cannot cross that expiry.
6. **Presentation meaning belongs to the exact use.** Site, locale lineage,
   accessibility treatment, localized alt/caption, credit display, action,
   crop/art direction, and any equivalent content belong to the placement.
   Ordinary text is HTML-first; essential images of text require exact text;
   complex images require concise alt plus a visible or linked full equivalent.
   Incomplete required equivalents block D1.
7. **Release, cached-request continuity, recovery, and takedown stay exact.**
   D1 privately prepares and proves an immutable generation before one serving-
   head transaction creates first anonymous reachability. A bounded delivery-
   retained prior generation may serve still-safe cached/in-flight Page requests;
   private recovery retention alone grants no anonymous read. Recovery is a new
   validated successor, never destructive rollback. Current adverse facts deny
   active and delivery-retained origin without silent substitution.
8. **Versioning, references, folders, and Trash cannot become hidden authority.**
   Add new version never auto-activates. Used in is complete, rebuildable, and
   freshness-qualified across draft, candidate, scheduled, active, delivery-
   retained, and recovery-retained owners. The optional five-level Media Folder
   tree and bounded tags organize only. Trash is non-cascading and recoverable;
   there is no Empty Trash.
9. **Retention and disposition are explicit and strictest-wins.** An append-only,
   effective-dated Public Media Purpose Retention Policy defaults to retain until
   explicit review and never auto-purges. Holds, governing minimum floors, backup
   state, reference health, actor authority, and source-owned required-disposition
   obligations are re-proved. A conflict becomes urgent legal/records review;
   Phase 29 executes only an exact owner-authorized outcome.
10. **Tenant safety, execution, search, health, and durability are structural.**
    Operational Tenant UUIDs, composite Tenant keys/FKs, indexed deny-by-default
    RLS, protected custody tables, service-worker reauthorization, one existing
    Inngest execution seam, typed Postgres facts, GIN search, keyset pagination,
    privacy-safe health, cost budgets, independent byte backup, restore proof,
    and provider-neutral migration are launch requirements.
11. **The Media experience is specialized, calm, and accessible.** Four built-in
    views, grid/list browse, optional folder rail, progressive detail, resilient
    bulk/mobile upload, a Page-local Ready-for-this-Site picker, safe uncertainty,
    impact-first restriction/Trash/version journeys, keyboard/touch/screen-reader
    crop alternatives, 320-pixel reflow, zoom, forced colors, reduced motion,
    RTL/CJK, and constrained-network behavior are measured release contracts.
12. **Payload and every provider remain replaceable machinery.** Payload may
    supply qualified metadata, relationship, folder, upload, and Admin seams,
    but native re-upload/delete, direct public storage, global alt, unrestricted
    Local API override, and announced-but-unshipped DAM behavior are not product
    authority. AI/faces/similarity, shares/portals, arbitrary workflows/schemas/
    transforms, external search, Realtime, partitioning, cross-Tenant sharing,
    and per-Tenant buckets are excluded until separately justified.
13. **No Tenant activates on partial proof.** The complete security, content,
    concurrency, release/cache/expiry, Phase 10, reference, retention, backup,
    migration, scale, accessibility, and representative nonprofit cohort gates
    in Clause 36 are binding. D27 owns an all-or-none Tenant × environment Media
    cutover and disables mutable legacy writers in that cutover; D10 is not
    widened.

### Adversarial disposition

Every required category contains a material baseline concern: brittleness,
technical debt, edge cases, footguns, tenant safety, overengineering, UX/UI
friction, hidden coupling, failure modes, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependency/
integration risk, migration/upgrade risk, and other concurrency/deployment
hazards. The final 45-risk review found that the direction remains sound only
with immutable identity, private qualified intake, explicit cross-phase
authority, automatic expiry, exact D1 delivery admission, complete reference
health, fail-closed retention, independent byte durability, and the measured
purpose-built UX captured above.

The independent final audit corrected and re-proved cached-generation delivery,
D20 saved-view scope, Phase 29 retention ownership, D10 cutover ownership, the
D18 Media-folder seam, live restriction capability, Phase 10 precedence,
effective-dated retention and required-disposition conflicts, automatic active-
route expiry, image-of-text/complex-image equivalents, and adverse-state public-
route tests. No actionable inconsistency remained after correction.

### Required proof inherited by the eventual specification

1. Inventory and migrate every legacy Media row, provider object, byte digest,
   Page/locale/SEO/package reference, retained public route, and exception
   without relabeling mutable history as immutable.
2. Prove the private upload grant, hostile/malformed/oversize/animation/HEIC
   corpus, decode and decompression budgets, malware policy, EXIF/GPS removal,
   deterministic renditions, and no public raw/candidate path.
3. Prove wrong-Tenant, inactive, insufficient, stale, service-worker, relationship,
   object, search/count/thumbnail, direct-route, and timing denials under grants,
   RLS, structural constraints, and current command reauthorization.
4. Crash and replay every object-before-DB, DB-before-dispatch, callback,
   concurrent version, work-claim, rendition, copy, projection, Trash, retention,
   hold, disposition, and cleanup seam; each must converge without duplicate
   semantic effects or orphaned public bytes.
5. Prove D1 private preparation, first reachability, exact active pins, G-to-G+1
   cached/in-flight coherence, bounded delivery retention, private recovery
   retention, forward-successor recovery, candidate-failure preservation,
   current adverse denial, and honest cache/purge convergence.
6. Prove time-bounded rights/consent uses controlled delivery whose freshness,
   stale allowance, and delivery retention stop before the earliest expiry; at
   expiry active and delivery-retained origin deny automatically without a new
   release or human action.
7. Prove D27 restriction with exact same-Tenant authority, Phase 10 clearance
   floors, wrong-Tenant and stale/revoked denial, Phase 10 independent adverse
   action, exact impact, no silent substitution, and no claim of Internet-wide
   erasure.
8. Rebuild Used in exactly across draft, Preview, scheduled, active, delivery-
   retained, recovery-retained, reusable, Navigation, profile, D7, migration-
   legacy Rich Text, SEO/social, and package owners; stale/rebuilding state
   cannot say Unused or authorize disposal.
9. Prove folder rehome, duplicate suggestion without semantic auto-merge,
   non-cascading Trash/restore, retain-until-explicit-review, policy strengthening/
   shortening, hold and source-required-disposition conflicts, execution-time
   reproof, disposition tombstones, and restore suppression.
10. Restore database metadata and independent encrypted bytes by digest inside
    declared RPO/RTO; expose missing bytes safely; migrate providers without
    changing asset/revision/rendition/D1 identities or reviving disposed media.
11. Meet 25,000-item search, 50-item upload, keyset/index/RLS plans, weak-mobile,
    processing/concurrency, storage/egress/backup, queue/reconcile, and oldest-
    age health budgets with redacted telemetry and synthetic public/cache probes.
12. Pass the complete keyboard, screen-reader, touch-without-drag, zoom/reflow,
    forced-color, reduced-motion, RTL/CJK/long-translation, complex-image,
    no-JavaScript/public-render, and constrained-network matrix.
13. Complete two moderated rounds with at least 24 participants from six
    nonprofit missions organizations and the exact task/comprehension thresholds,
    including zero belief that upload publishes or Restore republishes.
14. Admit only a complete D27 Tenant × environment cohort after all rows, bytes,
    references, retained routes, compatibility readers, exceptions, exact Payload
    pin, and provider behavior pass; disable old mutable writers atomically and
    never reuse D10 as Media cutover authority.

### Evidence and architectural record

- [D27 exact formulation and decision brief](./research/phase-23-d27-public-media-authority-decision-brief.md)
- [D27 complete 17-category, 45-risk adversarial review](./research/phase-23-d27-public-media-adversarial-review.md)
- [D27 Payload 4 DAM primary-source research](./research/phase-23-d27-payload-4-dam-primary-source-research.md)
- [D27 Supabase custody, storage, RLS, and domain-model research](./research/phase-23-d27-supabase-byte-custody-and-rls-research.md)
- [D27 nonprofit DAM UX, workflow, and measurable acceptance research](./research/phase-23-d27-nonprofit-dam-ux-and-workflow-research.md)
- [ADR-0171 — Tenant-wide Public Media Catalog](../../adr/0171-tenant-wide-public-media-catalog-and-immutable-custody.md)
- [D25 / ADR-0169](../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
- [D22 / ADR-0166](../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [D18 / ADR-0162](../../adr/0162-purpose-bounded-authority-free-content-library-folders.md)
- [D9 / ADR-0153](../../adr/0153-certified-site-bound-custom-presentation-packages.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Payload Uploads](https://payloadcms.com/docs/upload/overview)
- [Payload Folders](https://payloadcms.com/docs/folders/overview)
- [Supabase Storage schema](https://supabase.com/docs/guides/storage/schema/design)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [W3C Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [Dóchas Guide to Ethical Communications](https://dochas.ie/resources/ethical-communications/guide-to-ethical-communications/)

The complete quoted formulation above is the founder-ratified D27 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, SQL/schema/
RLS, bucket or object creation, migration/backfill, dependency or provider
adoption, issue publication, deployment, D1 activation, release, or production
change.

Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack. D27's canonical
terms are preserved here and in ADR-0171 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D27 do not yet decide broader SEO and metadata beyond existing Phase 22
public-page presentation; the exact permission matrix; content import/export
and migration/cutover UX; the broader operational-health product; production
capacity budgets; or the exact qualified Payload version. These areas remain
founder decisions or evidence-backed implementation proofs and will be resolved
one at a time.

## D28 — Versioned Site Search & Sharing Profile with generated defaults and D1 compiler ownership

**Status:** Founder-ratified on 2026-08-24 after current search, social,
Payload, Next.js, and repository research; exact cross-phase authority
reconciliation; complete nonprofit-staff UX design; a 17-category, 40-risk
adversarial review; and independent search-authority and UX consistency
audits.

### Exact ratified formulation

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — One versioned Site Search &
> Sharing Profile with deterministic locale-exact generated defaults, exactly
> three bounded ordinary-Page overrides, and one complete D1 release-bound
> compiler-owned ordinary Page/Article Search & Sharing Manifest.**
>
> 1. **One bounded launch product.** D28 owns search-engine presentation,
>    social-link presentation, crawler-facing route dispositions, host
>    sitemap/robots projection semantics, and accessible public share actions
>    for ordinary Phase 23 Pages and Articles. It does not own D17 on-site
>    search, domain verification, redirects, Page visibility, presentation
>    packages, media custody, analytics, advertisements, custom head scripts,
>    or authenticated app surfaces. Phase 22 D14 remains content authority for its specialized
>    Missionary, Project/Campaign, and public Ministry Update identities.
> 2. **One exact ordinary-content authority chain.** Source-owned approved Site
>    identity, visible Page-locale facts, D2/D3 route and reach, D22 locale
>    lineage, D24's exact server-derived `public` audience, D27 qualified media,
>    and a versioned D28 Site profile are compiler inputs. D1 alone compiles and
>    activates one immutable complete **ordinary Page/Article Search & Sharing
>    Manifest** inside that exact locale's Public Site Generation. Phase 22 D14
>    independently owns and releases its specialized immutable manifests; D28
>    and D1 neither recompile, advance, freeze, nor reinterpret those source
>    releases. Payload fields/plugins, Next layouts/file metadata, database
>    rows, request-time code, caches, crawlers, and social services are adapters
>    or observations, never parallel authority.
> 3. **Versioned Site profile, not duplicated identity.** Each exact
>    Tenant × environment × Site profile version references the verified public
>    host, Phase 24 locale census, source-owned exact-locale Site name/short name
>    and identity, one small code-owned title-pattern key, and an exact
>    Site × locale D27 default social-card placement. That placement preserves
>    usage purpose, locale, usage-local alt, crop/art direction, displayed
>    credit, policy/qualification, exact revision, rendition, and proof. A safe
>    qualified default placement is an activation gate for every locale that
>    releases eligible routes. Homepage description comes from the exact-locale
>    homepage's visible summary or its ordinary Page description override and is
>    otherwise omitted; the Site profile owns no hidden homepage-copy fallback.
>    It never copies mutable organization, domain, locale, path, rights, or Page
>    facts into a second truth. A distinct public Site name is promised only for
>    a distinct verified host or subdomain, never for a tenant-branded
>    subdirectory on a shared host. A profile revision is inert authoring truth:
>    each named locale's independent D1 successor explicitly pins it. D28 creates
>    no Site-global public profile head, **Publish all languages** action, or D10
>    presentation-cohort shortcut.
> 4. **Small title-pattern catalog.** Launch supports only code-owned,
>    accessible patterns such as **Page title · Site name** and
>    **Site name · Page title**, plus the Site homepage form. Patterns receive
>    locale-aware punctuation, whitespace, duplicate-name suppression, and
>    hostile-length handling from the compiler. There is no tenant-authored
>    formatting DSL, arbitrary placeholder, HTML, or raw head template.
> 5. **Computed defaults remain computed.** A Page stores no copied generated
>    title, description, or image. At candidate compilation the resolved value
>    is `exact Page-locale override ?? deterministic generated value` under the
>    pinned profile/compiler version. A Site-profile or source change therefore
>    affects only each exact locale's separately reviewed D1 successor candidate;
>    it does not create stale per-Page copies, mutate live output, or advance
>    another locale.
> 6. **Exactly three Page-locale overrides.** An ordinary Page/Article locale
>    revision may persist only: (a) the semantic Page portion of the shared
>    search/share title, (b) one shared search/share short description, and
>    (c) one D27-qualified share-image placement. Search and social use the same
>    title and description at launch. Reset deletes the override and restores
>    generation; it never copies the current generated value. Opening a control
>    without an effective change creates no override. Input normalization
>    rejects control-only text and treats blank/Unicode-whitespace-only title or
>    description and a cleared image as **Use generated**; a custom title must
>    otherwise be nonblank, and launch has no separate “suppress generated
>    description” state. Each created or explicitly reaffirmed text override
>    records the contributing source revision/digest as non-editorial provenance,
>    not a fourth override. A later source change can therefore show one
>    deterministic **Review custom value** advisory with **Keep custom value**
>    or **Use generated …**, rather than nagging or guessing.
> 7. **Deterministic generated values.** The title uses the visible exact-locale
>    Page title and pinned Site pattern. The description uses the Page-specific
>    visible exact-locale summary/excerpt and is omitted when no meaningful
>    summary exists; the compiler never scrapes arbitrary Rich Text, invents
>    copy, repeats one generic Site paragraph across Pages, or falls back to
>    another locale. The image uses a semantically representative D27-qualified
>    Page placement when one is explicitly eligible, otherwise the exact
>    Site × locale profile-default D27 placement and all of its usage proof.
>    Selection is deterministic during candidate compilation. It never uses an
>    arbitrary URL or silently selects an unrelated asset, and a later adverse
>    withdrawal never triggers an unreviewed fallback substitution in a live
>    generation.
> 8. **Exact locale or no artifact.** All editor reads, previews, generation,
>    metadata, cards, structured data, alternates, and sitemap entries use one
>    explicit BCP 47 locale lineage with Payload fallback disabled. Missing or
>    unreleased exact-locale content is represented as missing. Locale switching
>    names the active locale and scope; it never presents inherited source
>    content as completed translation.
> 9. **Searchability and shareability are separate typed results.** The
>    compiler derives independent `SearchPresentation` and
>    `SharePresentation` results from one manifest. Anonymous visibility does
>    not imply discovery; no-index does not imply privacy; and successful
>    release does not imply external indexing, ranking, snippet selection, or
>    refreshed social caches.
> 10. **D2 reach inside D24's exact `public` audience is decisive.**
>     **Listed publicly** Pages render an
>     anonymous 200 response, self-canonical metadata, search/share presentation,
>     and eligible sitemap/locale discovery. **Shared by link — public** Pages
>     remain anonymously viewable and reshareable with coherent link cards but
>     carry no-index directives and are excluded from sitemap, on-site discovery,
>     and locale discovery. Draft, private, Preview, review, authenticated-only,
>     withdrawn, trashed, unavailable, or unresolved content emits no
>     content-specific anonymous search/share artifact.
> 11. **Canonical and status are compiler-derived.** One absolute HTTPS
>     self-canonical URL derives only from the Phase 24-verified Site host, D2
>     Placement, D3 route state, and D22 locale. Request `Host`/forwarded headers,
>     Page text, plugin fields, stale aliases, and arbitrary editor input never
>     choose it. A moved route uses D3's permanent continuity behavior; a removed
>     route with no replacement returns the exact 404/410 policy. Redirects and
>     unavailable routes leave the sitemap and do not emit the old Page's card
>     or structured facts.
> 12. **One reciprocal locale-alternate representation.** D1 emits absolute,
>     self-inclusive, reciprocal hreflang links only for mutually eligible,
>     released, Listed exact-locale variants. Launch uses one compiled
>     HTML-head `<link rel="alternate" hreflang="…">` representation rather
>     than independently maintaining HTML, header, and sitemap copies.
>     `x-default` ships only after Phase 24 names a genuine Site selector/default
>     contract; D28 does not infer it.
> 13. **Truthful route dispositions and host sitemap projection.** Each
>     locale-exact ordinary D1 manifest seals whether its route is sitemap-
>     eligible, its self-canonical URL, and its source-owned significant public
>     `lastmod`. After activation, one durable idempotent convergence worker
>     derives the verified-host sitemap from current active locale heads plus a
>     typed union of references to independently current Phase 22 D14 manifests.
>     A D14 member is never copied or reinterpreted: the reference preserves its
>     Legal Entity, source release/binding/coverage versions, safety ceiling,
>     digest, canonical disposition, and source-owned `lastmod`. The host
>     sitemap contains only current anonymous 200, self-canonical, Listed URLs;
>     never uses deployment or projection-build time; emits no `priority` or
>     `changefreq`; and partitions only when measured URL/byte thresholds demand
>     it. Projection lag is visible and repairable, not a partial D1 activation.
> 14. **Robots is derived public guidance, never access control.** Each ordinary
>     D1 manifest seals its exact route index/crawl disposition. After
>     activation the same convergence seam derives one deterministic verified-
>     host robots artifact and sitemap reference from current active heads and
>     host policy. No tenant per-bot DSL ships. Pages that must communicate
>     no-index remain crawlable enough for that directive to be seen. Private
>     and Preview surfaces depend on authorization, no-store, nonpublic
>     delivery, D24's `public` invariant, and D25—not robots text. Host artifact
>     lag is observed and reconciled without changing locale release authority.
> 15. **Closed, visible-fact structured data.** One code-owned, versioned
>     serializer catalog may emit `WebSite` on the canonical homepage,
>     `NGO`/`Organization` on the appropriate Site identity Page,
>     `WebPage` for ordinary Pages, `Article`/`BlogPosting` only for true
>     Articles with visible exact authors/dates, and `BreadcrumbList` only from
>     the visible D2 hierarchy. Stable `@id` values derive from the canonical.
>     Unsupported or unproven properties are omitted. Editors cannot enter raw
>     JSON-LD, schema types, `Person`, `DonateAction`, `SearchAction`, FAQ,
>     ItemList, tracking markup, or invisible claims. A generic branded Site-
>     default image can complete a social card but is not emitted as an
>     `Article`/`BlogPosting` structured-data image unless it is genuinely
>     representative of that Article.
> 16. **Complete social-link metadata.** The manifest emits one coherent Open
>     Graph presentation—title, description or omission, canonical `og:url`,
>     correct `website`/`article` type, Site name, exact locale and eligible
>     alternates, and exact D27 rendition with absolute HTTPS URL, MIME type,
>     dimensions, and usage-local image alt—plus a derived Twitter-compatible
>     card from the same facts. There are no provider-specific copy fields or
>     request-time image renders. Protocol serializers deterministically map
>     D22's canonical BCP 47 locale to each protocol's required syntax,
>     including Open Graph's locale form, without creating a second locale
>     authority; an unsupported mapping is omitted rather than emitted malformed.
>     The shared rendition meets the strictest launch consumer size budget; D27
>     withdrawal invokes adverse-first public containment rather than a silent
>     image substitution.
> 17. **Accessible first-party sharing.** Every anonymously public eligible
>     Page offers one clearly labelled **Share** action. On direct user
>     activation it may invoke the secure-context Web Share API when supported;
>     a keyboard- and screen-reader-accessible first-party **Copy link** path is
>     always available. If Clipboard API access is absent or denied, the exact
>     URL appears in a selected/read-only manual-copy control. Success is
>     announced only after a confirmed clipboard write; native-share cancellation
>     is neutral. Bounded click-only outbound share links may be used as explicit
>     fallbacks. D28 loads no passive third-party social SDK, discloses no contact
>     list or chosen share target, and never claims a downstream post completed.
> 18. **Quiet Page UX.** Staff see one compact **Search engines & sharing**
>     section in Page settings, not a separate SEO dashboard. Its summary keeps
>     four independent facts visible: candidate durability (**Editing**,
>     **Saving**, or **Saved**), publication (**Live** or **Not live**), candidate
>     validation (**Ready** or **Needs attention — cause**), and provenance
>     (**Generated** or **Customized — n of 3**). It shows the exact locale,
>     reach/discovery state, and explicitly labelled **Planned public URL** with
>     **Candidate changes appear here only after release**. If a live generation
>     exists, it separately shows **Current public URL**—or that the same address
>     currently serves the prior live generation—and D3's planned continuity
>     result. **Preview Site** opens D25 candidate content. The planned URL is
>     neither a public Preview nor share/copy target; only the live generation
>     offers **Copy current public link**. Resolved
>     values appear first with provenance such as **Generated from Page title**
>     or **Using Site default image**. **Customize** reveals only the three
>     controls; each custom value offers **Use generated …** and undo.
> 19. **Honest, minimal previews.** The section has only
>     **Search result — example** and **Shared link — example** views using the
>     exact candidate locale and planned public URL. Persistent copy says that search engines
>     and social services may rewrite or cache what people see. D28 does not
>     imitate every provider, scrape live results, promise rank/index/card
>     refresh, or duplicate D25's whole-Site Preview. Character guidance is
>     advisory—**May be shortened in some results**—with no SEO score,
>     keyword-density meter, traffic light, or hard folklore limit.
> 20. **Excellent occasional-staff usability.** Persistent labels, plain-language
>     help, text-plus-icon status, visible focus, programmatic descriptions and
>     errors, polite debounced announcements, target sizing, keyboard media
>     selection, touch support, 320-CSS-pixel reflow, 400% zoom, CJK/RTL/long
>     text resilience, and reduced motion are launch requirements. Mobile uses a
>     form-first single column with a collapsible preview. Locale changes always
>     repeat the exact scope, for example **Editing Spanish (Mexico) — changes
>     apply only to Spanish (Mexico)**, beside controls and examples.
> 21. **Cause-owned messages and proportional gates.** Release blocks only
>     correctness or safety failures such as wrong scope, unverified host,
>     missing required visible title, canonical collision, exact-locale mismatch,
>     unsafe serialization, unqualified required media with no exact safe
>     fallback, or incomplete manifest closure. A valid omitted description and
>     exact Site × locale D27-qualified default social-card placement are normal
>     informational provenance, not
>     **Needs attention**. Likely shortening is inline advice; similar-copy
>     detection belongs in a bounded aggregate Site-quality view, not a
>     per-keystroke Page warning. A known placeholder, family-specific quality
>     failure, or source/custom basis change may be an actionable warning;
>     external crawl/cache lag is an operator observation. Actions preserve
>     pending edits and focus/open the exact locale Page title, summary,
>     relevant override, or exact D27 placement according to the cause; users
>     lacking the capability see who can resolve it, not a dead button. Color is
>     never the only signal.
> 22. **Simple Site-profile UX and impact review.** Site settings expose plain
>     exact-locale Site identity references, the small title-pattern choice, and
>     exact Site × locale D27-qualified default social-card placement—never raw
>     canonical, robots, hreflang, sitemap, JSON-LD, verification token, or
>     provider controls. Candidate changes report Page-locale-field impact, not
>     only Page counts—for example **Title stays custom**, **Description
>     changes**, and **Image changes**—plus exact causes, Pages needing action,
>     and representative current-versus-candidate examples through a bounded
>     filterable list. Editing a profile never mutates live Pages or
>     synchronously renders every Page. Impact may summarize all locales, but
>     every favorable release action names and advances one exact locale; D10
>     remains presentation-only.
> 23. **Exact schedules and Preview.** D13 appointments pin the exact reviewed
>     Page revision and D28 dependency closure or compiled candidate. Execution
>     re-proves current compatibility and fails to **Needs attention** rather
>     than silently rebasing to a changed profile, path, locale, reach, media,
>     or serializer. D25 privately previews the exact candidate output and
>     staff explanations while emitting no public canonical, alternates,
>     sitemap membership, share card, indexing signal, analytics, or public
>     cache entry.
> 24. **Complete ordinary D1 artifact and framework adapters.** The immutable
>     ordinary Page/Article manifest pins Tenant, environment, Site, Page
>     identity/family, locale lineage, exact `public` audience, Page/Placement/
>     D2-reach/profile/media revisions, three Editorial Revision override deltas,
>     override source-basis provenance, compiler/serializer/catalog versions,
>     resolved outputs, and digest. The Next adapter emits complete route-level
>     nested `openGraph`, `twitter`, `robots`, and `alternates` objects and
>     safely serialized JSON-LD; it never relies on shallow layout inheritance
>     or conflicting file metadata.
>     Payload's SEO plugin may later supply exact-qualified editor components
>     behind an Asym adapter, but it is neither installed nor required by this
>     decision and can never own release truth.
> 25. **Tenant safety, RLS, and concurrency.** The Site profile owns one inert
>     revision lineage; the three override fields/deltas remain inside the
>     D1/D22 exact-locale Editorial Revision, structurally scoped by stable Page
>     identity. Neither has a separate public head outside D1. Profile revisions
>     and Editorial Revision fields carry structural Tenant/environment/Site/
>     locale/`public` identity with composite constraints and indexes.
>     Browser-visible data uses current
>     membership/capability RLS; privileged compilation is an audited narrow
>     server command, not a client service-role path. Host is verified data,
>     never request authority. Profile authoring revisions and Editorial
>     Revisions use
>     expected-version compare-and-swap so concurrent changes cannot mix
>     generations or overwrite staff work. Capabilities independently govern
>     viewing resolved output, editing Page overrides, editing the Site profile,
>     and releasing a D1 candidate. Reviewers and non-editors receive the exact
>     candidate and provenance read-only, without misleading or dead
>     customization controls.
> 26. **Bounded performance and cache identity.** Public rendering reads the
>     activated immutable generation/manifest, not Payload or multiple mutable
>     tables per request. Caches include Tenant, environment, Site, verified
>     host, locale, canonical route, exact `public` audience, generation,
>     manifest, and renderer version.
>     Profile impact analysis and compilation use bounded set-based work and
>     indexed cursors. Bot traffic, card scrapers, sitemap generation, and
>     optional notifications receive explicit budgets; no external search
>     service or speculative sharding ships without measured need.
> 27. **Failure, recovery, convergence, and observability.** Before CAS, an
>     ordinary-manifest preparation, validation, serialization, route, media, or
>     required serving-artifact proof failure blocks that locale successor and
>     leaves its prior live generation intact. Recovery is a newly proven
>     forward successor. After CAS, host sitemap/robots/cache convergence and
>     optional exact-host IndexNow notification run idempotently from a durable
>     activation outbox. They never gate, roll back, or redefine the locale
>     release, and IndexNow never replaces the sitemap. Ordinary editors see
>     candidate/live state and
>     the external-lag disclosure, not crawler operations. The operator surface
>     distinguishes timestamped, object-specific facts such as **Released**,
>     **Sitemap current**, and **Public HTML verified** from typed provider facts
>     such as **Bing IndexNow notification accepted for {host}**, **Google Search
>     Console reported sitemap fetched for {host/object}**, or **Bing Webmaster
>     Tools report received for {host/object}**. Every observation carries its
>     provider, exact host/object, and observation time; none is labelled
>     **Indexed** unless that named external report explicitly says so, and even
>     then it remains an observation rather than release truth.
>     Redacted cause codes, lag, reconciliation, synthetic HTML/head/status
>     checks, deletion health, and bounded retry state are observable without
>     leaking Page copy, private URLs, or high-cardinality Tenant data into broad
>     metrics. An adverse withdrawal or deletion bypasses ordinary cache
>     freshness and invokes the exact D27/D1 containment and reconciliation
>     path.
> 28. **Migration, upgrades, proof, and exclusions.** Implementation must
>     inventory and shadow-compare every hard-coded layout/site setting,
>     metadata helper, JSON-LD helper, Page metadata route, file metadata,
>     sitemap/robots behavior, specialized Phase 22 manifest, and cache seam;
>     cut over one explicit Tenant × environment × Site × locale migration
>     cohort with no dual read/write authority and quarantine unresolved inputs.
>     Exact Payload,
>     Next, provider, and serializer pins require conformance fixtures before
>     upgrade; stable manifests remain migratable/exportable through explicit
>     version adapters. Launch proof covers every Page family/reach/status/
>     locale, no-fallback and reciprocal alternates, host spoofing and
>     cross-Tenant isolation, canonical collisions and D3 moves, D13 schedules,
>     D21 Trash, D25 Preview, D27 withdrawal, 404/410 behavior, sitemap diff and
>     truthful `lastmod`, exact `public` discrimination and anonymous/session/
>     crawler output invariance, hostile JSON-LD, no-JavaScript bot output,
>     share fallbacks, accessibility, cache isolation, load, forward recovery,
>     and external failure simulation. D28 deliberately excludes editable
>     technical SEO,
>     meta keywords, per-platform copy, raw schema/head markup, arbitrary image
>     URLs, AI copy generation, tenant crawler rules, Page-local indexing
>     switches outside the settled D2 reach inside D24's exact `public`
>     audience, SearchAction, general Google URL submission,
>     ranking promises, passive social SDKs, and request-time card generation.

### Binding interpretation

1. **D28 is the ordinary Page/Article lane, not a new universal SEO authority.**
   It owns one release-bound Search & Sharing Manifest for Phase 23 ordinary
   Pages and Articles. Phase 22 D14 continues to own and independently release
   specialized Missionary, Project/Campaign, and public Ministry Update
   manifests; host projections reference those manifests without copying,
   recompiling, advancing, freezing, or reinterpreting them.
2. **One inert Site profile and exactly three Page-locale deltas are sufficient.**
   Generated title, description, and image values stay computed under pinned
   source/profile/compiler versions. Editors may override only the semantic
   title portion, one shared description, and one D27-qualified share-image
   placement. Reset deletes the delta. Every exact locale pins the profile
   through its own D1 successor; there is no global public profile head,
   Publish-all-languages action, or D10 shortcut.
3. **Settled owners remain decisive.** D2 owns Listed/Shared-by-link reach;
   D24 owns the exact server-derived `public` audience; D2/D3/D22/Phase 24 own
   path, continuity, locale, and verified host; D27 owns media identity,
   qualification, renditions, and usage proof; D13 and D25 retain exact
   schedule and private candidate Preview authority.
4. **D1 owns ordinary release truth.** Canonical, status, alternates, route
   discovery disposition, complete social metadata, visible-fact structured
   data, and exact serving output are sealed in one immutable ordinary
   Page/Article manifest. Payload fields, Next layouts/file metadata, plugins,
   database rows, caches, crawlers, and social services never become parallel
   authority.
5. **Host artifacts converge after activation without redefining activation.**
   Durable, idempotent work projects sitemap, robots, cache state, and optional
   exact-host IndexNow notification from current locale heads plus
   authority-preserving D14 references. Before-CAS serving proof can block a
   successor; after-CAS projection or external-provider lag cannot roll back,
   partially activate, or redefine the exact locale release.
6. **The staff experience is generated-first and unambiguous.** Candidate
   durability, publication, validation, and provenance are four independent
   facts. Planned public URL is not a Preview or live share target; D25 Preview
   Site shows candidate content, while only the current live generation offers
   Copy current public link. Exact locale scope, cause-owned recovery,
   accessibility, mobile/reflow, and honest approximate examples are binding.
7. **Tenant safety and privacy are structural.** Exact Tenant, environment,
   Site, verified host, locale, route, D24 `public`, generation, manifest, and
   renderer identity belong in scope and cache keys. Composite constraints,
   current-membership/capability RLS, narrow audited server compilation,
   context-safe serialization, and auth-invariant anonymous/session/crawler
   output prevent wrong-Tenant or private metadata leakage.
8. **The launch boundary stays small.** No editable canonical/robots/hreflang/
   sitemap/schema/head, SEO score, hard folklore length limit, per-platform
   copy, arbitrary image URL, AI metadata, tenant crawler DSL, passive social
   SDK, request-time card generation, ranking promise, or general search-engine
   submission service enters D28 without a separate evidence-backed decision.

### Adversarial disposition

All 17 required categories contain material baseline concerns: brittleness,
technical debt, edge cases, footguns, Tenant safety, overengineering, UX/UI
friction, hidden coupling, failure modes, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependency and
integration risk, migration/upgrade risk, and other concurrency/deployment
hazards. The complete 40-risk review found that C-prime remains sound only
with the exact 28-clause hardening above.

The independent final audits corrected and re-proved D2 reach versus D24
`public` ownership, Phase 22 D14 reference-only integration, exact-locale
profile activation, exact Site × locale D27 defaults, pre-CAS proof versus
post-CAS host convergence, candidate-versus-live URL behavior, independent
durability/publication/validation/provenance facts, provider-qualified
observations, and title/description source-basis recovery. No material
authority or UX contradiction remained after correction.

### Required proof inherited by the eventual specification

1. Inventory and shadow-compare every root/layout/file metadata source, Page
   adapter, JSON-LD helper, sitemap/robots route, cache seam, and Phase 22 D14
   host-projection reference before one Site × locale authority cutover.
2. Prove one versioned provider-neutral ordinary manifest, inert Site-profile
   lineage, three delta fields inside the exact Editorial Revision, composite
   scope, RLS, CAS, source-basis provenance, safe serialization, and retained-
   version adapters.
3. Prove rendered no-JavaScript HTML/head/status/cache behavior across every
   family, reach, route, locale, unavailable state, move, schedule, Trash,
   Preview, media withdrawal, and structured-data type—not only metadata
   object snapshots.
4. Prove D2 reach inside D24 exact `public`, anonymous/session/crawler output
   invariance, verified-host authority, host spoof/cache poisoning denial,
   reciprocal exact-locale alternates, and no silent locale fallback.
5. Prove D27 Page-placement/default-placement qualification, immutable
   rendition facts, usage-local alt/crop/credit proof, adverse withdrawal,
   and no silent unrelated-image substitution.
6. Prove pre-CAS preparation failure preserves prior live; post-CAS sitemap/
   robots/cache/IndexNow work is durable, idempotent, bounded, observable, and
   forward-recoverable without becoming release truth.
7. Prove truthful significant-change `lastmod`, sitemap membership/removal,
   404/410/redirect behavior, deletion health, exact provider/object/time
   observations, and no inference that receipt/fetch means indexed.
8. Pass keyboard, screen-reader, touch, 320-pixel reflow, 400% zoom, RTL/CJK/
   long-text, reduced-motion, weak-network, Clipboard-denial, Web-Share
   cancellation, and current-versus-planned URL tests.
9. Complete representative multilingual occasional-staff task studies for
   generated understanding, one override/reset, reach comprehension, Site
   impact, missing translation, media recovery, planned/live URL distinction,
   and internal-versus-external status comprehension.

### Evidence and architectural record

- [D28 exact formulation and decision brief](./research/phase-23-d28-search-sharing-authority-decision-brief.md)
- [D28 complete 17-category, 40-risk adversarial review](./research/phase-23-d28-search-sharing-adversarial-review.md)
- [D28 primary-source and repository research](./research/phase-23-d28-search-sharing-primary-source-research.md)
- [D28 nonprofit-staff UX and CMS benchmark](./research/phase-23-d28-search-sharing-ux-benchmark.md)
- [ADR-0172 — Versioned Site Search & Sharing Profile](../../adr/0172-versioned-site-search-sharing-profile-and-d1-compiler-ownership.md)
- [D27 / ADR-0171](../../adr/0171-tenant-wide-public-media-catalog-and-immutable-custody.md)
- [D25 / ADR-0169](../../adr/0169-immutable-whole-site-preview-candidates-over-sealed-site-plan-inputs.md)
- [D24 / ADR-0168](../../adr/0168-one-exact-public-audience-and-app-owned-authenticated-surfaces.md)
- [D22 / ADR-0166](../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
- [D17 / ADR-0161](../../adr/0161-derived-public-site-search-projection-and-adverse-first-convergence.md)
- [D3 / ADR-0147](../../adr/0147-generation-bound-automatic-ordinary-page-route-continuity.md)
- [D2 / ADR-0146](../../adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [D1 / ADR-0145](../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [Google Search title-link guidance](https://developers.google.com/search/docs/appearance/title-link)
- [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Open Graph protocol](https://ogp.me/)
- [W3C Web Share API](https://www.w3.org/TR/web-share/)
- [Payload SEO plugin](https://payloadcms.com/docs/plugins/seo)
- [Next.js `generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

The complete quoted formulation above is the founder-ratified D28 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, schema/
RLS, migration/backfill, dependency or provider adoption, issue publication,
deployment, D1 activation, release, or production change.

Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack. D28's
canonical terms are preserved here and in ADR-0172 without overwriting
accepted Phase 22 language.

## D29 — Governed content portability and private-draft imports

**Status:** Founder-ratified on 2026-08-24 after current Payload, Supabase,
Inngest, portability, migration, security, and repository research; a complete
nonprofit-staff journey and accessibility design; and a 17-category, 34-risk
adversarial review.

### Exact ratified formulation

> **B-prime-amended-and-hardened (B-prime-R) — One Asym-owned Content
> Portability workspace with purpose-qualified governed staff exports and
> capability-separated, source-qualified, no-write-planned, private-draft-only
> imports, implemented through a versioned content contract and one durable
> product ledger while Phase 30 owns the reusable migration workbench and D1
> remains the sole public-release authority.**
>
> 1. **One bounded product and vocabulary.** Web Studio exposes one quiet
>    **Content portability** workspace with two jobs: **Export content** and
>    **Move content into Asym**. Ordinary staff copy says what is in scope,
>    whether anything has changed, what is happening, and what to do next. It
>    never exposes raw Payload collections, `create`/`update`/`upsert`, schema
>    paths, provider jobs, or migration-engine jargon as the product.
> 2. **Explicit authority split.** Phase 23 owns the versioned Asym Content
>    Package, source-neutral content vocabulary, semantic compatibility rules,
>    exclusion/repair dispositions, export compiler, import-plan validator,
>    and typed D12 private-revision command. Phase 30 owns reusable migration
>    sessions, private upload transport, parsing, mapping UI/mechanics, staged
>    rows, issue-grid mechanics, chunked execution, and reversal-workbench
>    mechanics. Each source family and destination domain retains its own
>    meaning and invariants. No raw table load is ever an import.
> 3. **Capability-separated participation, not role names.** Governed export,
>    draft-inclusive export, migration request, import preparation, plan view,
>    plan commit, repair/resume, reversal preparation, artifact download, and
>    exceptional operations are independently authorizable actions. Staff
>    without preparation or commit authority can request a migration, name an
>    owner, follow status, answer content questions, and review results. Small
>    organizations may grant several capabilities to one trusted person;
>    launch does not impose a needless two-person approval ritual. Publishing
>    is never implied by any D29 capability.
> 4. **Asym owns every product boundary.** UI, commands, status derivation,
>    authorization, Tenant/Site/locale binding, audit, idempotency,
>    reconciliation, and artifact access are Asym-owned. Payload's exact-pin
>    plugin may provide qualified parsing/serialization mechanics behind an
>    adapter, but its generated collection UI, routes, default limits,
>    match-field choices, status defaults, Jobs Queue, and partial-write result
>    are not product authority. Raw plugin routes remain inaccessible unless
>    independently required and secured for an operator-only adapter seam.
> 5. **Exports begin with purpose, not format.** **Review in a spreadsheet**
>    creates a readable governed CSV that is explicitly non-reimportable.
>    **Archive or move content** creates a versioned, checksummed Asym Content
>    Package whose destination compatibility must still be checked. Neither is
>    described as a complete website, account, disaster-recovery, source-code,
>    analytics, user, workflow, credential, or database backup.
> 6. **Exact export scope and one coherent snapshot.** The user sees and
>    confirms the exact Tenant, environment, Site, locale set, eligible content
>    families, selection/filter scope, publication state, draft inclusion,
>    estimated item count, exclusions, and media behavior. Published-only is
>    the default and resolves from the exact active D1 generation and its pinned
>    owner-source revisions; draft export requires its separate capability and
>    uses only exact acknowledged D12 working revisions. The server re-proves
>    row and field authorization and seals exact source revision IDs under one
>    coherent database snapshot before background rendering. Moving offset
>    pagination, latest-row reads, or client-visible table rows never define the
>    package. Specialized families contribute only through their owner-qualified
>    export adapters; D29 never reinterprets or advances their source releases.
> 7. **One egress-governance path.** Spreadsheet and package exporters consume
>    the same Phase 3 field/projection policy and D29 content allowlist. Private,
>    safeguarding, care, security, credential, session, payment, provider,
>    signed-URL, quarantine, audit-internal, and implementation-only fields are
>    absent by construction. CSV uses the shared `csvSafeCell`, UTF-8 BOM,
>    RFC 4180 quoting, and CRLF contract. Audit stores identifiers, scope,
>    field-policy/package versions, counts, digest, and outcome—not exported
>    content bodies.
> 8. **Versioned neutral package, not Payload documents.** An Asym Content
>    Package has a canonical manifest, package/schema/compiler versions,
>    creation purpose and time, source identity, exact scope, item and relation
>    counts, per-file digests, source and Asym stable identities, locale
>    lineages, semantic family/block/profile versions, typed relationships,
>    internal-link targets, path proposals, portable D28 override deltas,
>    media references/status, explicit omissions/losses, and compatibility
>    declaration. Payload row shapes, storage keys, signed URLs, internal user
>    IDs, and provider job state are never the interchange contract. Readers
>    reject unknown major versions and preserve unknown optional additions for
>    diagnosis rather than guessing.
> 9. **Media is referenced and separately admitted.** Exports include stable
>    D27 asset/revision references plus usage-local alt, crop/art direction,
>    displayed credit, purpose, locale, qualification, and disposition. Media
>    bytes are included only by a separately authorized D27/Phase 29 export
>    contract; otherwise the package includes an explicit media-status report.
>    Imports place bytes or remote candidates into Phase 29 private intake and
>    D27 qualification. A source URL, Payload upload, checksum match, or
>    successful download never makes media publicly eligible.
> 10. **Private, short-lived export artifacts.** Export artifacts use private
>     custody, opaque generated object keys, encryption in transit/at rest,
>     bounded retention, and authenticated app download. Every download
>     re-proves current capability and exact object scope, records an audit
>     receipt, and fails closed after revocation or expiry. A UI link may
>     resolve to a short-lived transport URL only after that check; the durable
>     product record never treats a bearer URL as authority. Expired artifacts
>     are recreated from current authorized content, never silently
>     resurrected.
> 11. **Certified sources plus an honest qualification lane.** The source
>     selector lists only certified adapter and source-version combinations as
>     ready. **Other CMS or custom site** always exists as a request/approved-
>     sample lane, not a claim of universal compatibility. Each adapter provides
>     a versioned source checklist, accepted artifacts, size/shape limits,
>     snapshot/cutoff guidance, media behavior, known exclusions, and golden
>     fixtures. Unknown versions, custom plugins, or changed exports pause for
>     qualification rather than running a best-effort production import.
> 12. **The destination is exact and continuously visible.** Server-authorized
>     choices establish one Tenant × environment × Site × exact locale mapping
>     and eligible destination families. Every import step and run page repeats
>     that scope, the Site's public domain for orientation, and **Live impact:
>     None — private drafts only**. The target is frozen into the plan and
>     re-proved before every mutation. A browser value, file value, source
>     tenant, guessed default Site, or stale operator context can never choose
>     the destination.
> 13. **Private quarantine before parsing.** Source artifacts use resumable
>     private upload where size/network conditions warrant it and record exact
>     Tenant, Site, actor, purpose, filename-for-display, generated object key,
>     MIME/signature evidence, byte count, digest, adapter version, and expiry.
>     Admission enforces file-count, compressed and decompressed size, entry,
>     nesting, row/node, field, string, relation, image, and processing budgets;
>     rejects traversal and ambiguous/polyglot content; scans applicable bytes;
>     never executes macros, HTML, JavaScript, templates, or archive contents;
>     and deletes or isolates rejected/expired artifacts through a recorded
>     lifecycle.
> 14. **Credentials and external retrieval are bounded.** Staff never paste
>     source credentials, API keys, cookies, or bearer links into notes or
>     arbitrary fields. Any future connected-source adapter uses a dedicated
>     secret authority and least-privilege, revocable source grant. Remote
>     media retrieval permits only qualified HTTPS sources, resolves and pins
>     public addresses safely, blocks private/link-local/metadata networks and
>     redirects to them, limits bytes/time/content type, and moves the result
>     into Phase 29 intake. The durable event and audit record contains safe
>     identifiers, not source content, URLs with secrets, or bytes.
> 15. **Adaptive mapping with no destructive guessing.** Exact adapter-known
>     mappings are collapsed as **Matched**. Deterministic aliases may be
>     suggested; heuristic/AI/fuzzy mappings are labelled **Suggested — review
>     required**, show representative source values, and require a human
>     decision. Required, Suggested, Unmapped, and Excluded views make the
>     unresolved work explicit. Ordinary staff never select arbitrary database
>     fields or match keys. External content never updates by title, slug,
>     email, path, position, or fuzzy resemblance.
> 16. **Source-neutral semantic admission.** The adapter produces typed neutral
>     content candidates rather than Payload writes. It preserves source IDs
>     and attribution; maps Pages/Articles only to compatible D6-D11 semantic
>     families and versions; routes specialized Missionary, Project/Campaign,
>     Ministry Update, form, and media facts through their owner adapters; and
>     classifies every field, block, relationship, internal link, embed,
>     author, locale, folder, topic, path, SEO override, publication/schedule
>     fact, and source omission as admitted, transformed, needs review,
>     excluded, or blocked. Source authors never become users automatically;
>     scripts, trackers, payment widgets, source forms, and unsupported embeds
>     never execute or silently migrate.
> 17. **A real semantic no-write check is mandatory.** Staff action **Check the
>     import** performs parsing, mapping validation, full semantic validation,
>     stable-identity lookup, relationship/link closure, locale completeness,
>     block/profile compatibility, media intake/qualification disposition,
>     D2/D3 path and continuity impact, D28 override compatibility,
>     authorization, quota, and destination-version checks without invoking
>     any target mutation command. Payload preview, sample rows, client
>     validation, or a transaction that is intentionally rolled back is not
>     this contract.
> 18. **Four precise issue classes.** Results are grouped as **Must fix before
>     creating drafts**, **Needs review before release**, **Will not be
>     imported**, and **Information**. Each issue has a stable code, plain-
>     language consequence, affected item/field/reference, repair action, and
>     downloadable formula-safe report. There is no ambiguous catch-all
>     warning, hidden skipped-row total, or green **completed with warnings**
>     state. Every source item receives an explicit disposition and control
>     totals must reconcile.
> 19. **One immutable sealed Import Plan.** A successful check seals the source
>     artifact digest, adapter/mapping/content-contract versions, exact target,
>     destination schema/catalog/profile versions, authorized stable-identity
>     matches, item/relation/media/path dispositions, expected source and
>     destination revisions, exclusions, blockers, counts, cost/size budget,
>     and deterministic plan digest. The review begins **No content has
>     changed** and shows exact creates, authorized updates-as-new-revisions,
>     conflicts, omissions, unresolved work, path/redirect impact, private-
>     draft outcome, and zero publication. A source, mapping, permission,
>     target, catalog, or relevant destination change makes the plan stale and
>     requires **Check import again**.
> 20. **Commit is a separate privileged command.** The plan viewer and commit
>     executor re-prove a distinct current capability, exact Tenant/Site/
>     locale, immutable plan digest, expected destination versions, budgets,
>     and one explicit acknowledgement. The consequence-named CTA is **Create
>     {count} private drafts** when every item is new, or names both consequences
>     exactly—for example **Create 170 Pages and add 16 private revisions**—not
>     **Run**, **Import**, **Publish**, or a typed organization-name ceremony. A
>     request or prepared plan gives no mutation authority. Capability
>     revocation before the next write stops safely and records the exact
>     disposition.
> 21. **Only owner commands create private revisions.** Each admitted item flows
>     through its owning typed service and D12 expected-revision/idempotency/
>     lease-or-audited-override contract. New external content creates new
>     private identities and working revisions. An exact authorized native
>     Asym identity may append a private successor revision; it never rewrites
>     a released revision in place. Import never publishes, activates D1,
>     changes a serving head, activates navigation/redirects/schedules/forms,
>     creates users, sends messages, fires ordinary automations, updates public
>     search, or emits public media. Batch-origin suppression prevents side-
>     effect fan-out while required audit/outbox facts remain durable.
> 22. **Stable identity and repeatable semantics.** Every run has a semantic
>     idempotency key derived from Tenant/Site, source system/snapshot,
>     artifact digest, plan digest, target adapter version, and intended
>     command—not from an ephemeral provider event ID. Duplicate submission
>     returns or links to the prior run. Only a package carrying an exact,
>     authorized Asym identity and lineage can propose an update; otherwise
>     possible duplicates are review information and the safe default is a new
>     private identity. A later source delta is a new checked plan with explicit
>     create/update/conflict dispositions, never blind upsert.
> 23. **Bounded writes and two-pass closure.** The sealed plan has deterministic
>     chunks and a dependency order. Pass one creates or appends eligible
>     private identities/revisions; pass two connects relationships and
>     internal links only after targets exist. Each item or inseparable locale
>     lineage is transactionally atomic, with explicit run-item receipts and
>     before/after revision IDs. The overall run is resumable rather than one
>     giant transaction. Missing targets, cyclic relationships, uniqueness
>     races, or lost acknowledgements pause/reconcile the affected cohort; they
>     never silently produce broken links or half-localized success.
> 24. **Locale outcomes are exact.** Every imported locale maps explicitly to
>     one enabled D22 lineage. There is no default-locale guessing or field
>     fallback. A locale candidate is either complete, an explicitly incomplete
>     private draft with named release blockers, excluded with reason, or
>     blocked. Base-locale success cannot mask a failed localized write, and no
>     other locale is advanced by the import.
> 25. **Concurrency is deliberately narrow.** Only one committing content-
>     portability run may own a Site write cohort at a time; other preparation
>     and export work may continue when safe. Commit rechecks D12 active-editor
>     state and destination versions. It never overwrites unacknowledged edits;
>     affected items pause for review or use a narrowly audited migration
>     override that creates a visible private checkpoint. Advisory/application
>     locks and database uniqueness constraints protect identity and path
>     races; UI disablement is never the lock.
> 26. **One durable executor and one product ledger.** A product-owned
>     Content Portability Run and per-item receipt ledger are the recovery and
>     business truth. The existing Core workflow-orchestration seam dispatches
>     one Inngest function with safe identifiers, bounded chunk steps,
>     Tenant-keyed concurrency/fairness, retry policy, heartbeats, dead-letter
>     state, and reconciliation. Payload Jobs is not a second orchestrator.
>     Inngest's temporary idempotency, run history, and step state do not
>     replace permanent product idempotency or receipts. Product rows retain
>     only bounded identifiers, dispositions, digests, counts, and revision
>     references; staged content bodies and verbose issue/result artifacts stay
>     in Phase 30 private staging/custody. No row-sized content, file bytes,
>     secret URLs, or huge arrays ride database receipts, events, or step state.
> 27. **Truthful progress and interruption.** Run detail survives navigation,
>     session renewal, browser closure, and weak networks. It reports factual
>     phases—checking plan, preparing destination media, creating private
>     drafts, connecting relationships, verifying results—and exact processed/
>     verified/remaining counts. Unknown progress is indeterminate; there are
>     no fabricated percentages or time promises. Before writes, **Cancel
>     import** can guarantee no changes. After durable writes begin, the action
>     is **Stop after the current safe batch** and explains that verified
>     private drafts remain for reconciliation.
> 28. **Partial outcomes are first-class and recoverable.** The terminal model
>     distinguishes stopped-before-changes, paused-after-partial-write,
>     verifying-unknown-acknowledgement, completed-review-needed, completed,
>     failed, and dead-lettered. A verifier reconciles source/plan control
>     totals with per-item receipts and destination revisions before completion.
>     Retry/resume reuses the same plan and idempotency records; it never starts
>     a competing run. Each item shows created/advanced/not-created/blocked/
>     excluded/unknown and the next safe action. Provider logs alone can never
>     turn a run green.
> 29. **Reversal is a checked plan, not undo theatre.** **Prepare reversal**
>     computes which still-private, unedited, unreleased, unreferenced results
>     can move through D21's governed Trash or receive a private successor
>     restoring a before-image. Edited, referenced, scheduled, included in a D1
>     candidate/generation, released, externally observed, or owner-domain
>     protected facts block automatic reversal and name the required owner
>     correction. Reversal has separate capability, immutable plan, idempotency,
>     receipts, audit, and truthful partial handling. Nothing public is deleted,
>     rolled back, or unpublished implicitly.
> 30. **Durable audit, observability, and bounded cost.** Product records capture
>     actor, delegation, capabilities proved, exact scope, source/adapter/
>     contract/plan versions and digests, counts by disposition, item receipt
>     IDs, authorization changes, artifact lifecycle/downloads, retries,
>     reconciliation, reversal, and correlation IDs while redacting content,
>     secrets, signed URLs, and bytes. Staff see actionable next steps;
>     operators see queue age, oldest run, plan staleness, upload/scan failures,
>     throughput, retries, unknown acknowledgements, dead letters, orphan
>     artifacts, count/digest mismatches, Tenant fairness, and per-run provider
>     usage/cost. Explicit size, step, concurrency, retention, and time budgets
>     fail before commit rather than creating an unbounded bill or database
>     outage.
> 31. **Exceptional, accessible staff experience.** Every screen answers five
>     questions: exact scope, included/changed facts, whether anything has
>     changed, current activity, and next action. Import is a saved full-page
>     five-step journey—Source, Destination, Match content, Check and resolve,
>     Review plan—with an ordered accessible stepper, native file input plus
>     optional drop zone, labelled combobox mappings with samples, persistent
>     linked error summary, responsive issue table/list, keyboard and screen-
>     reader completion, text-plus-icon statuses, exact civil times/timezones,
>     polite milestone announcements, truthful progress, 400% reflow/touch
>     support, and reduced motion. Completion repeats **Nothing was published**
>     and points to imported drafts and a later D25/D1 review path.
> 32. **Qualification and evolution gates.** Launch requires exact-pin Payload
>     adapter contract tests, versioned package reader/writer round trips,
>     golden fixtures for every certified source/version, malicious/oversized
>     file tests, RLS/object-authorization and cross-Tenant matrices, stale-plan/
>     concurrency/lost-ack/duplicate/resume/reversal fault tests, relationship/
>     locale/media/path fixtures, accessibility tests, and moderated usability
>     proof with nonprofit communications staff, multilingual editors, small-
>     organization administrators, migration specialists, and media/safety
>     reviewers. A provider, schema, adapter, content catalog, or package major
>     upgrade remains dark until dual-version compatibility, rollback, export,
>     and recovery evidence passes. Unknown future source flexibility comes
>     from additive adapters and versioned contracts, not a tenant scripting
>     language or generic Phase 23 importer.

### Binding interpretation

1. Web Studio owns one quiet **Content portability** product, not a raw Payload
   import/export or provider-job surface.
2. Exports are purpose-qualified and compile one coherent source snapshot:
   human review CSV is deliberately non-reimportable, while the versioned Asym
   Content Package is the governed machine-portable contract.
3. Phase 23 owns content semantics, qualification, validation, and typed
   private-revision commands; Phase 30 owns the reusable migration workbench;
   every adjacent owner domain keeps its own authority.
4. Participation is capability-separated. Planning is a no-write operation;
   committing an immutable sealed plan is a distinct privileged command.
5. Every source artifact enters private Tenant-scoped quarantine. A sealed plan
   records exact source, destination, mapping, compatibility, conflicts,
   exclusions, and digests before any destination write occurs.
6. A successful commit may create only private D12 revisions through owner
   commands. It cannot publish, alter navigation or routes, schedule content,
   send messages, qualify public media, index search, or advance D1.
7. One product-owned idempotency/run/item ledger and one durable executor own
   progress, retry, resume, partial outcomes, checked reversal, and permanent
   receipts; Payload and Inngest remain qualified adapters behind that contract.
8. Tenant isolation, honest source qualification, calm five-step UX,
   accessibility, golden-fixture compatibility, failure recovery, and
   moderated nonprofit-staff usability evidence are release requirements.

### Adversarial disposition

All 17 required categories contain material baseline concerns: brittleness,
technical debt, edge cases, footguns, Tenant safety, overengineering, UX/UI
friction, hidden coupling, failure modes, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependency and
integration risk, migration/upgrade risk, and other concurrency/deployment
hazards. The complete 34-risk review found B-prime sound only with the exact
32-clause hardening above.

The hardened formulation rejects both unsafe extremes: opaque operations-only
migration and universal tenant-authored upsert. It preserves a transparent
staff journey while keeping mutation privileged, planned, private, bounded,
idempotent, recoverable, and subordinate to owner-domain authority.

### Required proof inherited by the eventual specification

1. Prove versioned package reader/writer round trips and golden fixtures for
   every certified source and source version.
2. Prove the semantic no-write check performs zero destination mutations and
   the sealed plan becomes stale rather than silently rebasing.
3. Prove Tenant-scoped RLS, private Storage authorization, artifact expiry,
   malicious/oversized file handling, capability separation, and cross-Tenant
   denial.
4. Prove stable identity, two-pass relationship closure, locale-exact outcomes,
   media/path dispositions, repeat/resume behavior, partial commits, lost
   acknowledgements, duplicate delivery, reversal planning, and recovery.
5. Prove only D12 private revisions can result and that no D1, navigation,
   redirect, schedule, form, message, public-media, or search side effect occurs.
6. Pass keyboard, screen-reader, touch, 320-pixel reflow, 400% zoom, reduced-
   motion, weak-network, interruption, stale-plan, progress, and recovery tests.
7. Complete moderated task studies with nonprofit communications staff,
   multilingual editors, small-organization administrators, migration
   specialists, and media/safety reviewers.

### Evidence and architectural record

- [D29 exact formulation and decision brief](./research/phase-23-d29-content-portability-authority-decision-brief.md)
- [D29 complete 17-category, 34-risk adversarial review](./research/phase-23-d29-content-portability-adversarial-review.md)
- [D29 primary-source and repository research](./research/phase-23-d29-content-portability-primary-source-research.md)
- [D29 nonprofit-staff UX and portability benchmark](./research/phase-23-d29-content-portability-ux-benchmark.md)
- [ADR-0173 — Governed content portability and private-draft imports](../../adr/0173-governed-content-portability-and-private-draft-imports.md)
- [Phase 30 migration-workbench boundary](./roadmap.md#phase-30--imports--migration-tools-imports-migration)

The complete quoted formulation above is the founder-ratified D29 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, schema/RLS,
migration/backfill, dependency or provider adoption, plugin installation, issue
or specification publication, deployment, D1 activation, release, production
data access, or source-system migration.

Root `CONTEXT.md` synchronization remains held until the Phase 22
documentation stack is merged or Phase 23 becomes an explicit reviewed stack.
D29's canonical terms are preserved here and in ADR-0173 without overwriting
accepted Phase 22 language.

### Remaining grooming coverage

D1–D29 do not yet decide the exact staff identity, authorization, and raw
Payload Admin boundary; migration/cutover UX beyond the decisions already
made; the broader operational-health product; production capacity budgets; or
the exact qualified Payload version. These remain founder decisions or
evidence-backed implementation proofs and will be resolved one at a time.

## D30 — Single staff access authority and governed engine diagnostics

**Status:** Founder-ratified on 2026-08-24 after current Payload, Supabase
Auth/session/RLS, security-standard, accessibility, privileged-access, and
repository research; complete staff, support, and operator journey design; and
a 17-category, 34-risk adversarial review.

### Exact ratified formulation

> **C-prime-amended-and-hardened (C-prime-R) — One Supabase-authenticated Asym
> Staff Access Authority with Phase 12 as the sole permission brain, a
> non-authoritative Payload Principal Link, an Asym-owned product-only Web
> Studio, deny-by-default provider and API boundaries, and one incident-bound,
> short-lived, read-only Engine Diagnostics Session; typed Asym commands own
> every repair.**
>
> 1. **One boundary and plain vocabulary.** The product calls the ordinary
>    experience **Web Studio**, the provider adapter record a **Payload
>    Principal Link**, rare operator inspection an **Engine Diagnostics
>    Session**, and a corrective product action a **Repair command**. Tenant
>    staff never need to understand Payload users, collections, access
>    overrides, JWTs, RLS, GraphQL, or service roles. “Admin” in a Payload API
>    is never presented as an Asym job title or permission.
> 2. **Identity and permission authority are explicit and singular.** Supabase
>    Auth is the sole authority for a human's immutable subject, credential,
>    authentication ceremony, session, sign-out, recovery, and authentication
>    assurance. Phase 12 is the sole authority for Active Tenant Assignment,
>    Tenant/Site/purpose scope, capabilities, delegation, safety floors,
>    governance epoch, expiry, decision explanation, and authorization audit.
>    Payload authenticates or authorizes nothing independently; it adapts and
>    enforces an Asym decision.
> 3. **No second human account lifecycle.** Local Payload password login,
>    password reset, first-user creation, registration, email verification,
>    API-key issuance, provider token refresh, and independent account editing
>    remain unavailable to staff and operators. One Asym sign-in and sign-out
>    governs Mission Control and Web Studio. A direct provider URL never falls
>    through to a Payload login form or asks for another credential.
> 4. **The Payload Principal Link is attribution plumbing, never a grant.** One
>    global link is keyed by the immutable Supabase subject and may carry only
>    the stable Payload record identifier plus non-authoritative display/email
>    snapshots needed for attribution, locks, preferences, and provider
>    compatibility. It stores no authoritative Tenant, Site, role, capability,
>    clearance, purpose, or operator eligibility. Staff cannot edit it. Email
>    or name changes reconcile without changing identity; suspension or
>    offboarding fences new actions while historical attribution remains inert
>    and readable only where separately authorized.
> 5. **Tenant and Site linkage is provisioned, stable, and non-defaulting.** Any
>    Payload-internal Tenant/Site mapping binds an immutable Asym identifier
>    through an idempotent onboarding/reconciliation command with uniqueness
>    and duplicate quarantine. Authentication never creates or repairs a
>    Tenant, maps by mutable slug, picks the first membership, writes a role, or
>    falls back to a demo/default Tenant. A missing, duplicate, stale, or
>    inactive link fails closed with a repairable operator state, not invented
>    access.
> 6. **One exact server-only authorization context per request.** After
>    verifying the Supabase identity, the server resolves the current Phase 12
>    context containing principal, Active Tenant Assignment, environment,
>    Tenant, Site, locale/object scope where relevant, purpose, exact operation,
>    capabilities/decision digest, composed safety floor, governance epoch, and
>    expiry. The full context and capability inventory never enter `req.user`,
>    browser props, URLs, client storage, logs, or shared caches. Payload's
>    minimal user shape identifies the actor; a server-only request context
>    carries the decision and exposes only safe action booleans to UI.
> 7. **Multi-organization context is deliberate and request-bound.** A person
>    with several assignments chooses an exact organization/Site; a deep link
>    may request but never silently switch it. Every request, tab, autosave,
>    upload, Preview, cache key, query, mutation, and background handoff proves
>    that exact context. Switching clears old-scope client/query/upload state
>    before rendering the new scope. Two tabs may use different legitimate
>    contexts without one mutable profile field or browser singleton changing
>    the other's authority.
> 8. **Capabilities enforce; labels and visibility only explain.** Phase 12
>    capabilities—not `staff`, `admin`, `super_admin`, collection membership,
>    route visibility, record ownership, or possession of an ID—authorize each
>    read and command. Payload `access.admin` adapts only the exact
>    `web_studio.enter`-style decision needed to render an allowed product
>    route; it is not a provider-admin grant. Create, read, update, delete,
>    version read/restore, unlock, Preview, release, export, purge, diagnostics,
>    and repair remain independently provable actions, with field and
>    relationship floors applied strictest-wins.
> 9. **Every entry point and access operation denies by default.** The central
>    policy covers product routes, direct provider routes, Admin server
>    functions, REST, GraphQL, Local API, hooks, relationship traversal,
>    versions, uploads, jobs, Realtime-triggered refetches, and generated auth
>    operations. Missing, expired, stale, wrong-purpose, wrong-environment,
>    wrong-Tenant, wrong-Site, or unrecognized operation context returns no
>    access. Every Supabase table exposed to `anon` or `authenticated` API
>    roles has RLS with stable exact scope predicates; Payload-private tables
>    are unreachable to those roles or use compatible RLS proved by tests. RLS
>    is structural enforcement, not a second policy brain, and never trusts
>    `user_metadata` or copied capability arrays. No
>    collection/global/auth/version operation inherits Payload's generic
>    `Boolean(user)` default as product policy.
> 10. **One safe actor Local API port.** Every human-initiated Payload read or
>     mutation goes through a typed Asym adapter that requires the authenticated
>     request, minimal actor user, server-only authorization context, exact
>     Tenant/Site predicates, `overrideAccess: false`, and the same transaction
>     request. Editorial writes additionally require `overrideLock: false`, an
>     expected D12 revision/lock proof, and commit-time epoch reauthorization.
>     The call cannot compile without these arguments; ad hoc Local API calls
>     from product handlers are forbidden.
> 11. **A separate, narrower service-command port.** Non-interactive release,
>     projection, reconciliation, and repair work uses a named Phase 12 service
>     principal and one registered command, never a staff user or diagnostics
>     session. Each invocation binds exact Tenant, Site, environment, purpose,
>     resource/version, operation, idempotency key, authorization epoch, and
>     mandatory scope predicates. Any necessary `overrideAccess: true`,
>     service-secret, table-owner, or `BYPASSRLS` mechanism is explicit inside
>     this port, justified in a reviewed registry, reauthorized before a
>     consequential commit, and incapable of serving a user-initiated call.
> 12. **Overrides are a governed exception inventory, not conventions.** CI
>     inventories every `overrideAccess`, `overrideLock`, `user`, `req`, direct
>     Payload Local API call, generated provider route, and privileged database
>     client. Actor calls must prove the safe port; service calls must name the
>     registry entry, command, predicates, reason, owner, tests, and audit.
>     Unknown or inline bypasses fail architecture checks. Exact Core Payload
>     pin tests qualify `access.admin`, version access, route resolution,
>     serialization, Local API defaults, and lock behavior before every
>     provider upgrade.
> 13. **Ordinary staff receive only the Asym-owned product surface.** The
>     production staff route allowlist contains Web Studio product pages and
>     required same-origin product operations—never the raw dashboard,
>     collection/global CRUD screens, CMS-user/account screens, first-user or
>     password flows, access inspector, version browser outside product UX,
>     GraphQL playground, or arbitrary plugin/custom views. Direct or guessed
>     provider routes return a product-owned safe destination or
>     existence-safe not-available response. Hiding navigation is only UX; the
>     server route and operation gates are enforcement.
> 14. **Fallbacks cannot reopen the provider.** A Web Studio feature flag,
>     component error, import-map failure, unavailable native page, or rollback
>     may select an explicitly approved prior Asym surface or a truthful
>     unavailable state. It never reveals stock Payload UI, broadens a route
>     allowlist, changes the authorization source, or converts a product outage
>     into raw provider access.
> 15. **Provider APIs are private implementation seams.** GraphQL and its
>     playground are disabled at launch because D30 has no qualified consumer.
>     Payload's broad generated REST surface and auth/access endpoints are not
>     externally exposed; only exact same-origin operations needed by Web
>     Studio may pass through an Asym route/command allowlist with verified
>     context, origin/CSRF protection, bounded depth/select/pagination/upload,
>     rate and abuse controls, and response projections. They are not Phase 31,
>     not supported tenant integrations, and cannot be used for D29 bulk
>     portability.
> 16. **Public read, Preview, Trash, and purge never collapse.** D24 public read
>     can return only the active public projection. D25 Preview requires its
>     separate exact-candidate capability and context. D21 restore remains
>     recoverable lifecycle work. Permanent purge requires a stronger fresh
>     capability, reference/hold/retention proof, explicit consequence review,
>     and typed command. Authentication, diagnostics, or provider access grants
>     none of them.
> 17. **One-login entry is calm and explicit.** From Mission Control or a safe
>     same-origin deep link, staff enter Web Studio with their existing
>     Supabase session. Before any mutation, the shell identifies the active
>     organization, Site, and environment. One eligible Site opens directly;
>     several eligible Sites produce a short, accessible chooser. Safe return
>     routes carry no grant token or protected state, and authenticated
>     responses are never shared/publicly cached.
> 18. **The interface explains usable access without exposing machinery.** Hide
>     an entire area when it is irrelevant; keep a normally expected but
>     unavailable action visible only when its explanation helps complete the
>     workflow. **My access** and **Request access** use plain actions and exact
>     organization/Site scope, never role picking or capability keys. Approval
>     does not auto-replay the denied content action. Tenant access management
>     stays in Phase 12 rather than becoming a second CMS permission screen.
> 19. **Denial states are safe and actionable.** The UI distinguishes **Your
>     session ended**, **Web Studio is not in your current access**, **You
>     cannot do that action**, **Page not available**, **Your access changed**,
>     and **We cannot verify access right now**. Missing and non-disclosable
>     cross-Tenant resources share one neutral state. Each screen names the
>     active safe context, truthful saved/mutation outcome, one next action,
>     and an optional privacy-safe correlation code; it never prints provider
>     errors or suggests retrying a real denial.
> 20. **Expiry and revocation preserve truth, not authority.** A known session
>     expiry receives one quiet warning and an accessible **Stay signed in**
>     path. If identity, assignment, capability, safety floor, or epoch changes,
>     new saves/uploads stop; optimistic success rolls back; the UI names the
>     last server-acknowledged D12 revision; protected queues/caches clear; and
>     only D12-approved bounded recovery remains. Reauthentication can restore
>     identity but never a revoked grant, and stale mutations are not replayed.
> 21. **Support starts with product evidence, not privileged access.** Staff
>     share a privacy-safe support receipt with organization/Site, product
>     route, action, time, saved-work state, denial/outage class, and
>     correlation identifier—never tokens or protected body content. Support
>     first uses Asym diagnostics and Phase 12's audited, read-only **View as**
>     projection under the lesser of support and target access. View-as never
>     impersonates identity, mutates, switches Tenant silently, or unlocks
>     provider routes.
> 22. **There is one bounded Engine Diagnostics lane.** It is an Asym-owned,
>     operator-only, read-only route set used only when product diagnostics
>     cannot answer an open incident. It is neither the complete stock Payload
>     Admin nor another content editor. It may reuse an exact-pin-qualified
>     provider read view only behind the same central route allowlist,
>     field/scope projection, and server-enforced mutation denial. There is no
>     standing raw-admin role, shared break-glass account, impersonation, or
>     discoverable tenant navigation entry.
> 23. **A diagnostic request is exact and justified.** The requester must hold
>     a separately registered Phase 12 operator capability and bind an open
>     incident, immutable actual operator, exact environment/Tenant/Site,
>     allowlisted diagnostic operation family, plain-language question,
>     sensitivity classification, and requested duration. Wildcards, “all
>     tenants,” freehand Tenant IDs, copied grant URLs, vague “debugging,” and
>     role-name eligibility are rejected. Restricted/safeguarded projections
>     retain every existing floor and any policy-required independent approval.
> 24. **Activation uses the same identity with fresh strong assurance.** The
>     operator reauthenticates through Supabase Auth and satisfies Phase 12's
>     current operator-assurance policy; Payload credentials cannot satisfy it.
>     Activation completes a new supported MFA challenge/verification, records
>     its successful time server-side, and requires a current Supabase `aal2`
>     session; an older `aal2` claim alone is insufficient. Phase 12 may raise
>     that floor to a qualified
>     phishing-resistant method when stable provider support and recovery have
>     been proved; D30 does not make Supabase's current experimental passkey API
>     a production dependency. The launch default is 15 minutes, with a
>     60-minute hard maximum measured from first activation, server-enforced
>     expiry, no automatic renewal, and no client-controlled duration. Standard
>     read-only activation needs no universal second-person ceremony; higher
>     sensitivity follows the existing safety policy.
> 25. **Diagnostic disclosure is minimum necessary.** Start with health,
>     configuration identity, schema/adapter version, release linkage, query
>     shape, counts, digests, and safe metadata. Content fields, historical
>     versions, media, identities, and relationships appear only when the exact
>     incident purpose, operator capability, projection, and safety floor admit
>     them. Bulk browse/export/download, secrets, credentials, signed URLs,
>     restricted-worker existence, and unrelated Tenant/Site navigation are
>     unavailable. Every request revalidates scope; URL possession grants
>     nothing.
> 26. **The elevated mode is impossible to overlook or retain accidentally.**
>     Before start, the UI summarizes organization, Site, environment,
>     read-only mode, purpose, incident, and expiry. Every diagnostic route has
>     a persistent accessible banner with those facts, meaningful countdown
>     updates, and a keyboard/mobile-reachable **Exit**. Duplicate tabs share
>     the same grant. Extension re-proves the open incident, capability, floor,
>     and remaining hard maximum and writes a new receipt; expiry, exit,
>     incident closure, capability revocation, or sign-out fences every tab,
>     stream, poll, cache, and copied URL.
> 27. **Diagnostics can never repair by mutation.** UI, REST, GraphQL, Local
>     API, server functions, hooks, and direct-route tests deny create, update,
>     delete, restore, unlock, publish, purge, upload, and configuration change
>     under a diagnostic grant. A discovered defect returns to an Asym-owned
>     typed Repair command with exact targets/preconditions, dry-run or
>     before/after explanation, current capability, commit-time
>     reauthorization, idempotency, bounded blast radius, transaction or
>     compensation, rollback, validation, and receipt. Any future raw-write
>     emergency lane requires a separate founder decision; D30 does not leave
>     a hidden toggle for it.
> 28. **Audit is durable, attributable, minimized, and visible to the right
>     people.** The authoritative ledger records authentication/authorization
>     outcome classes, actual/effective actor separation, diagnostic request,
>     grant/denial, scope, reason, incident, start, allowlisted read operation
>     class/target, extension, mutation attempt, exit, expiry, revocation,
>     typed repair reference, and closure. It records no credential, cookie,
>     raw token, full claims, or unnecessary content. A diagnostic read is not
>     returned unless its ledger append succeeds; an external telemetry-sink
>     outage may queue from that ledger without losing evidence. Tenant access
>     administrators receive a quiet current/recent support-access receipt when
>     policy permits, without operational or protected-content leakage.
> 29. **Failure is closed and differentiated.** Invalid identity, missing
>     mapping, unavailable Phase 12 resolution, stale epoch, database failure,
>     audit-ledger failure, route-policy mismatch, or diagnostics expiry never
>     falls back to a Payload role, cached allow, default Tenant, stock UI, raw
>     API, or service credential. Staff see an outage rather than a false
>     denial; operators return to the incident with a correlation receipt. The
>     last valid public D1 generation remains independently servable, and no
>     protected mutation claims success without its durable commit/audit proof.
> 30. **Observability detects authority drift without collecting content.**
>     Monitor authorization latency/error/deny classes, cross-Tenant/Site
>     attempts, stale epochs, duplicate/missing Principal Links and Tenant
>     mappings, direct raw-route probes, override-registry drift, actor-port
>     violations, diagnostic grants/expiry/extensions/post-expiry use,
>     mutation attempts, orphan grants, audit-ledger health, and exact-pin
>     conformance. Alerts group expected user denials and protect identifiers;
>     they escalate scope leakage, bypasses, failed revocation, or active grants
>     without open incidents.
> 31. **Performance optimizes computation, never scope.** Resolve and memoize
>     Phase 12 once per request/context where possible; compile capabilities
>     into bounded action booleans and exact Payload `Where` constraints; index
>     immutable principal, Tenant/Site, mapping, grant-expiry, incident, and
>     audit-correlation fields; and select minimum fields/depth. No
>     cross-request allow cache, global mutable Tenant, full capability payload
>     in browser cookies, per-field network resolver loop, or unrestricted
>     diagnostic query is permitted. Revocation and context switching evict all
>     affected product caches.
> 32. **Cutover removes, rather than synchronizes, the old authority.** Before
>     enabling D30, inventory every route/call as public, actor, service,
>     support, or diagnostic; provision stable links; quarantine duplicates and
>     default/slug-linked mappings; remove role/Tenant authority from Payload
>     users; replace global `super_admin` bypass; gate generated routes; and
>     convert calls through the two ports. A comparison phase may log old/new
>     decisions but never unions them or widens live access. Each product
>     surface cuts over only when direct-route, API, version, and rollback
>     tests prove that Phase 12 is its only brain; fallback cannot restore the
>     legacy path.
> 33. **Launch requires authorization, failure, exact-pin, accessibility, and
>     human proof.** Automated matrices cover every principal/context/action,
>     Tenant/Site pair, direct URL, REST/GraphQL/local call, relationship,
>     version, field, Preview/public/purge split, service command, missing/stale
>     context, two-tab switch, revocation race, session refresh, diagnostics
>     lifecycle, copied URL, mutation probe, outage, and audit failure. Static
>     architecture tests enforce the override/route registry. Exact-pin
>     contract tests precede Payload upgrades. Representative ministry staff,
>     access administrators, support, operators, keyboard-only, screen-reader,
>     mobile, zoom, and low-confidence users must complete the benchmark
>     journeys with zero second logins, provider leakage, wrong-Site actions,
>     cross-Tenant disclosure, or diagnostic mutation.
> 34. **Explicit non-goals keep this bounded.** D30 does not build a general IAM
>     product, duplicate Phase 12, put fine-grained capability arrays into
>     Supabase JWTs, expose Payload as Phase 31, create a universal operator
>     SQL console, add a raw-write break-glass lane, replace D12 locks, replace
>     D21 Trash, replace D25 Preview, or create another audit system. It adds
>     one Payload Principal Link adapter, one authorization-enforcement
>     boundary, one actor port, one service port, one product route policy, and
>     one rare read-only diagnostics lifecycle because each removes an existing
>     ambiguity rather than adding speculative flexibility.

### Binding interpretation

1. Supabase Auth alone owns human identity, sessions, recovery, sign-out, and
   MFA; Phase 12 alone owns permission decisions.
2. The Payload Principal Link is attribution-only. Tenant/Site mappings are
   stable, provisioned, and non-defaulting rather than created or guessed at
   sign-in.
3. Human operations use the safe actor port; registered non-interactive work
   uses the separately bounded service-command port.
4. Ordinary staff receive only Asym Web Studio. Raw Payload Admin and broad
   provider APIs are not product surfaces and direct access fails closed.
5. Staff UX always exposes exact organization, Site, and environment, and
   distinguishes denial, expiry, revocation, and authorization outage.
6. Support begins with privacy-safe product receipts and bounded read-only
   **View as**, not engine access or impersonation.
7. Engine Diagnostics is incident-bound, freshly AAL2-authenticated, read-only,
   15 minutes by default, 60 minutes maximum, minimum-disclosure, and durably
   audited.
8. Diagnostics never repairs; independently authorized typed Repair commands
   do. Cutover removes legacy Payload authority rather than synchronizing or
   unioning it.

### Adversarial disposition

All 17 required categories contain material baseline concerns: brittleness,
technical debt, edge cases, footguns, Tenant safety, overengineering, UX/UI
friction, hidden coupling, failure modes, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependency and
integration risk, migration/upgrade risk, and other concurrency/deployment
hazards. The complete 34-risk review found C-prime sound only with the exact
34-clause hardening above.

The current runtime is not compliant with that contract. Ratification selects
the permanent replacement architecture; it does not approve existing
Payload-local role/Tenant authority, ambient bypasses, raw provider routes, or
implicit Local API defaults.

### Required proof inherited by the eventual specification

1. Prove the exact Payload pin with a generated provider-route, operation, and
   override inventory; unknown or newly exposed seams must fail closed.
2. Prove stable Principal Link and Tenant/Site mapping invariants, request-bound
   multi-organization context, RLS/object authorization, and cross-Tenant
   denial across primary rows, versions, relationships, errors, caches, and
   parallel tabs.
3. Prove every human operation uses the actor port with `req`, current user,
   access and lock enforcement, transaction context, and D12 evidence; prove
   every service command is registered, narrower, idempotent, scoped, and
   audited.
4. Prove raw Admin, provider auth, generated REST, and GraphQL boundaries cannot
   become fallback product surfaces, including direct-route, rollback, and
   feature-flag tests.
5. Pass complete accessible staff journeys for entry, exact context, switching,
   denial, access request, session expiry, revocation, authorization outage,
   preserved work, and support handoff under keyboard, screen reader, touch,
   reflow, reduced-motion, weak-network, and concurrency conditions.
6. Prove Engine Diagnostics requires an open incident and a fresh current AAL2
   event; enforces exact scope, least disclosure, 15-minute default and
   60-minute maximum, bounded extension, immediate revocation, fail-closed
   durable audit, and zero mutation through every seam.
7. Prove typed Repair commands are outside the diagnostic grant, independently
   authorized, idempotent, and receipted; prove cutover and rollback never union
   or revive legacy Payload authority.
8. Measure authorization latency, request-local memoization, query budgets, and
   diagnostics cost with production-shaped Tenant and content volumes before
   launch.

### Evidence and architectural record

- [D30 exact formulation and decision brief](./research/phase-23-d30-staff-authorization-payload-diagnostics-decision-brief.md)
- [D30 complete 17-category, 34-risk adversarial review](./research/phase-23-d30-staff-authorization-payload-diagnostics-adversarial-review.md)
- [D30 primary-source and repository research](./research/phase-23-d30-staff-authorization-payload-diagnostics-primary-source-research.md)
- [D30 staff and operator UX benchmark](./research/phase-23-d30-staff-authorization-payload-diagnostics-ux-benchmark.md)
- [ADR-0174 — Single staff access authority and governed engine diagnostics](../../adr/0174-single-staff-access-authority-and-governed-engine-diagnostics.md)

The complete quoted formulation above is the founder-ratified D30 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, code,
schema/RLS, data repair, migration/backfill, dependency or provider adoption,
plugin installation, issue or specification publication, Git publication,
deployment, production access, diagnostic activation, D1 activation, or
release.

Root `CONTEXT.md` synchronization remains held until the Phase 22
documentation stack is merged or Phase 23 becomes an explicit reviewed stack.
D30's canonical terms are preserved here and in ADR-0174 without overwriting
accepted Phase 22 language.

### Remaining grooming coverage

D1–D30 do not yet decide migration/cutover UX beyond the behaviors already
settled in D29 and D30; the broader operational-health product; production
capacity budgets; or the exact qualified Payload version. These remain founder
decisions or evidence-backed implementation proofs and will be resolved one at
a time.

## D31 — Derived exception-first Content Health with cause-owned recovery

**Status:** Founder-ratified on 2026-08-24 after current primary-source and
repository research, complete staff-journey design, and ruthless 17-category
adversarial review.

### Exact ratified formulation

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — One quiet, derived,
> exception-first Content Health Workspace and contextual Health Status over
> source-owned product facts, with evidence-freshness truth, visitor-impact and
> responsibility clarity, cause-owned typed Recovery Commands, and D30-governed
> operator diagnostics; never a second workflow, audit, provider, or publication
> authority.**
>
> 1. **One boundary and plain vocabulary.** The staff destination is **Content
>    health**, one currently actionable condition is a **Health issue**, a
>    source's minimal typed observation or receipt is **Health evidence**, the
>    rebuildable read model is the **Content Health Projection**, and a
>    corrective effect is a source-owned **Recovery command**. Staff-facing copy
>    uses the affected content, visitor impact, responsibility, and next action;
>    it does not require knowledge of Payload, Supabase, Inngest, queues, jobs,
>    webhooks, RLS, caches, indexes, adapters, or provider error codes.
> 2. **D31 derives and explains; it never becomes truth.** Publication,
>    withdrawal, navigation, schedule, search, media, form, localization,
>    import, safety, and configuration facts remain with their settled owners.
>    D31 may read their current product records, desired-state targets, receipts,
>    and bounded probes through typed adapters, then project a staff explanation.
>    Editing, deleting, acknowledging, snoozing, rebuilding, or losing the
>    projection cannot change content, public state, desired intent, permissions,
>    or an owning domain's recovery lifecycle.
> 3. **The issue-family registry is small, code-owned, and versioned.** Every
>    admitted family names its owner, source facts, exact scope, subject type,
>    safe summary template, visitor-impact evaluator, evidence-freshness budget,
>    responsibility rule, contextual destination, optional allowlisted Recovery
>    command, resolution proof, redaction policy, and tests. Launch covers the
>    Phase 23 operational families already required—release/unpublish,
>    schedules, routes/redirects/references, cache delivery, search convergence,
>    media processing, orphaned placement, Site/locale validity, forms, and
>    migration validation. Tenants cannot create arbitrary health rules,
>    scripts, thresholds, SQL, or provider mappings.
> 4. **Every issue has exact, non-defaulting scope and stable identity.** An
>    issue key binds contract version, environment, Tenant, optional affected
>    Site and locale, owner domain, issue family, subject type and immutable
>    subject identity, plus the desired-state generation or intent epoch whose
>    outcome is being checked. Missing, ambiguous, default, slug-derived,
>    cross-environment, or unproved scope fails closed. A Tenant-level issue may
>    appear in an affected Site's workspace, but the interface never silently
>    unions Sites or switches context.
> 5. **The projection stores the minimum current explanation, not a shadow
>    domain.** It may retain the issue key, safe labels, disposition, impact,
>    responsibility, source pointers/digests, evidence and transition times,
>    contextual/recovery references, safe correlation code, and bounded recent
>    resolution metadata. It stores no copied content body, form submission,
>    donor or missionary sensitive data, provider payload, raw log, stack trace,
>    credential, signed URL, arbitrary JSON state, or independent retry history.
>    Source receipts and the existing audit remain authoritative history.
> 6. **Fresh evidence is required for a favorable claim.** Each issue family has
>    one documented, testable code-owned freshness and overdue policy based on
>    visitor risk and the owning domain's delivery promise. **No issues need your
>    attention** appears only when every required family has supplied a current
>    successful watermark for the selected scope. Missing, stale, contradictory,
>    or unavailable evidence becomes **Health check incomplete**; it never
>    becomes zero, healthy, completed, or silently omitted.
> 7. **Resolution requires source-owned outcome proof.** Queue acceptance,
>    dispatch, worker completion, provider acceptance, cache invalidation,
>    notification delivery, or a user clicking an action is not resolution.
>    The owning adapter closes an issue only after current desired intent and
>    exact source/version/readback evidence prove the required outcome. A newer
>    intent supersedes the older issue; an old event or late receipt cannot close
>    or resurrect the wrong generation. No user-facing **Mark fixed** control
>    exists.
> 8. **Four active dispositions answer who acts next.** **Needs your action**
>    means an authorized tenant staff action is now required; **Being handled
>    automatically** means a bounded recovery is active and staff should wait;
>    **Needs platform attention** means Asym owns the next step and staff should
>    not experiment; **Health check incomplete** means Asym cannot currently
>    make a fresh favorable claim. Resolved issues move to **Recently resolved**
>    for a code-owned 30-day presentation window, which is not an audit or data-
>    retention promise.
> 9. **Impact, responsibility, progress, and urgency are separate facts.** A
>    source adapter evaluates confirmed or reasonably bounded public impact,
>    such as no confirmed visitor impact, content at risk, limited degradation,
>    public content unavailable, or privacy/safety risk. It separately identifies
>    **Your team**, **Automatic recovery**, or **Asym** as the next responsible
>    party. Presentation order uses safety and current visitor impact first,
>    then breached deadline, staff actionability, breadth, and age; a frightening
>    color or raw failure count never substitutes for those facts.
> 10. **Job states map through product meaning, not one universal lookup.**
>     Queued, running, retrying, completed, failed, dead-lettered, cancelled,
>     and overdue execution facts remain available in source receipts. Context
>     may show queued/running/completed progress after a staff action. The central
>     workspace includes in-progress work only when it is user-visible, long-
>     running, approaching a promise, or already an exception; routine fast work
>     stays silent. Failed, dead, cancelled, and overdue facts are classified by
>     current impact and next owner—not all labelled urgent and never all given
>     the same Retry button.
> 11. **Exception-first means quiet, not hidden.** Normal completed operations,
>     transient retries inside their proven recovery budget, passed checks, and
>     low-level provider events do not fill the default view or notification
>     stream. Active adverse public safety, staff-action, overdue, exhausted,
>     materially degraded, and incomplete-evidence conditions remain visible.
>     Automatic work is summarized by stable cause, not by attempt. Staff can
>     deliberately open Recently resolved or contextual receipts without a
>     permanent green-check dashboard.
> 12. **Grouping is causal and lossless.** Duplicate deliveries and repeated
>     observations update one stable issue. Multiple resources may group only
>     when they share the same owner, root cause, disposition, recovery, and
>     scope; the group shows an accurate count and a bounded affected-resource
>     preview with an accessible full list. Similar wording, time proximity, or
>     provider error alone cannot group issues. A worsened, reopened, differently
>     owned, or independently recoverable condition separates or reopens visibly.
> 13. **The workspace has one calm information architecture.** In the exact
>     active organization, environment, and Site context, the header shows
>     **Content health**, the scope, and **Last verified** time. Four ordinary,
>     link-native, URL-preserved views are **Needs your action**, **Being handled
>     automatically**, **Needs platform attention**, and **Recently resolved**;
>     no custom tab state or horizontal-only control is required. A privacy/safety
>     risk or broad current public harm appears first regardless of disposition;
>     otherwise **Needs your action** is the default. Health-check incompleteness
>     is a scoped coverage notice, not a fifth work view; any useful next step is
>     listed under the staff or platform view that owns it. It is always placed
>     before a favorable summary. Search and a small
>     set of URL-preserved filters cover content/type, locale, impact, and
>     disposition; launch has no configurable dashboard, widgets, scoring,
>     charts, saved-health views, or rule builder.
> 14. **Every issue row answers seven questions without opening diagnostics.**
>     It states: what happened; which content and exact Site/locale are affected;
>     what visitors may experience; who acts next; what is happening now; when
>     it was last verified and what deadline or next check applies; and the one
>     best available action. A stable status label, icon, and text—not color
>     alone—convey disposition. Provider codes and correlation identifiers live
>     under progressive detail or a Copy support details action, not in the
>     primary sentence.
> 15. **Central and contextual status are the same issue, not synchronized
>     copies.** A Page, navigation item, schedule, media item, form, search
>     profile, import, or other source surface may show one compact Health Status
>     chip and plain explanation resolved from the same issue key. It links to
>     the URL-addressable Content Health detail. The central issue's source action
>     returns to the exact authorized object and location. Fixing either view is
>     reflected by source proof everywhere; there is no manual dual update.
> 16. **Detail uses progressive disclosure and preserves orientation.** Launch
>     uses one canonical, full, URL-addressable issue page at every breakpoint;
>     it does not duplicate state and focus behavior across a desktop drawer and
>     mobile page. The route preserves heading, browser history, return path,
>     keyboard order, and deep links. Its first screen gives impact,
>     responsibility, next step, affected resources, and a plain timeline. A
>     secondary **Technical details for support** section may reveal safe evidence
>     times, versions/digests, transition classes, and a correlation code only
>     where authorized. Raw provider logs and D30 diagnostics never appear there.
> 17. **No-issue and unavailable states are truthful and useful.** After complete
>     fresh evidence, the empty state says **No issues need your attention**,
>     names the selected scope and verification time, and quietly links to recent
>     resolutions; it does not promise that every external service, crawler,
>     browser cache, or future operation is healthy. During initial calculation
>     it says **Checking content health**. Partial failure retains known active
>     issues, replaces unreliable counts with an unknown marker, identifies the
>     categories not freshly checked in plain language, and offers one safe next
>     step without suggesting repeated refreshes.
> 18. **The primary staff journey is discover, understand, act once, and verify.**
>     Navigation shows a numeric action count only for active **Needs your
>     action** issues. A separate plain, nonnumeric indicator may call attention
>     to privacy/safety risk, broad current public harm, or a materially
>     incomplete check that staff must understand; routine automatic work and
>     unchanged platform detail never badge the navigation. Opening an indicator
>     lands on the exact context and the highest-impact relevant issue. Staff
>     read one sentence, follow one cause-owned action, make the correction in
>     its familiar source surface, and return to **Verifying the fix**. The issue
>     resolves automatically only after proof; unknown outcomes show the last
>     acknowledged state and do not invite duplicate action.
> 19. **Onboarding from another CMS is staged and non-alarming.** D29 remains
>     import and migration authority. First use gets one dismissible compact
>     explanation above real current status—not a modal tour or coach-mark
>     carousel—and a persistent **What is being checked?** disclosure. Before an
>     imported draft is eligible for
>     D1 activation, D31 explains **Checking imported content**, then derives
>     migration-validation exceptions by familiar objects—Page, image, link,
>     locale, form, or navigation—not legacy provider tables or codes. Each issue
>     links to D29's exact validation or source editor. Existing public content
>     is not represented as changed merely because a health scan is running, and
>     no celebratory all-clear appears until required evidence is complete.
> 20. **Notifications follow transitions and responsibility, not retries.** The
>     quiet in-product workspace is the default. One deduplicated notification
>     may occur when a new issue first needs the recipient's action, materially
>     worsens, reopens, crosses its code-owned deadline, or changes responsibility.
>     Privacy/safety or broad current public harm follows the existing urgent
>     incident policy. Automatic attempts, unchanged reminders, successful
>     routine checks, and provider flapping do not notify. Delivery channel,
>     digest, and escalation remain with the existing notification capability;
>     D31 creates no email or paging engine.
> 21. **Acknowledgement, reminders, and resolution cannot be confused.** A
>     bounded shared **Reviewed** receipt may state which authorized staff member
>     saw the issue and when; it changes no disposition, impact, responsibility,
>     ordering, count, source fact, or release gate. D31 launches without shared
>     assignment, ownership claiming, approval, comments, due dates, or a **Mark
>     fixed** workflow. If an issue family permits **Remind me later**, it is a
>     personal presentation preference bounded by a code-owned maximum and never
>     extending beyond a source deadline when one exists. It never hides the issue from the shared
>     workspace, contextual status, or another user's view; it is unavailable for
>     privacy/safety or currently urgent issues and is cancelled by worsening,
>     reopening, responsibility change, or access change. Reviewed and reminded
>     issues resolve only through clause 7's source proof.
> 22. **The default action is a source-owned destination, not mutation.** Labels
>     are specific—**Open Page**, **Review navigation**, **Open schedule**,
>     **Review media**, **Review form route**, or **Review import**—and carry no
>     authority token. They open only an authorized exact-scope object and never
>     disclose an inaccessible object's existence. If the user cannot perform
>     the action, the interface truthfully says which kind of authorized staff
>     member is needed or that Asym is handling it; it does not offer a doomed
>     or privilege-escalating control.
> 23. **Direct recovery exists only as a registered typed command.** A source
>     owner may expose one narrowly named command only when reopening the source
>     editor would not solve the operational cause. The command contract binds
>     owner and command version, actual actor or service principal, exact
>     Tenant/environment/Site/locale/subject, current desired generation or
>     intent epoch, expected source state/version, authorization epoch,
>     idempotency key, bounded effect, outcome/readback proof, and receipt.
>     Generic **Retry**, **Replay**, **Force**, arbitrary job cancellation, raw
>     SQL, provider console links, and free-form repair payloads are forbidden.
> 24. **Recovery is current-state fenced and safe under concurrency.** Before
>     dispatch and consequential commit, the owner reloads current intent,
>     capability, safety floors, object lifecycle, references, and existing
>     receipt; it acquires the appropriate product work claim and compare-and-
>     set fence. Duplicate clicks, two tabs, automatic recovery, delayed events,
>     lost acknowledgements, or a newer edit produce the same receipt, a truthful
>     in-progress state, or a safe stale/conflict no-op—never a repeated or older
>     public effect. A command failure leaves source truth intact and reports the
>     next owner.
> 25. **Authorization is enforced at every read and action.** D30/Phase 12
>     current identity, Active Tenant Assignment, environment, Tenant, Site,
>     purpose, exact operation, capability, safety floor, governance epoch, and
>     expiry govern workspace entry, counts, issue detail, affected-resource
>     lists, support detail, contextual chips, source links, reminder preferences,
>     and Recovery commands. Filtering, navigation visibility, possession of an
>     issue ID, a Payload user, or a provider role grants nothing. Revocation
>     clears protected caches and blocks new action without rewriting historical
>     attribution.
> 26. **Tenant isolation is structural and testable.** The projection is private
>     and server-only by default. If any view or table is intentionally exposed
>     to Supabase API roles, it has RLS, explicit grants, stable exact-scope
>     predicates, and security-invoker behavior where a view is used. Projector
>     and recovery service access goes only through D30's registered service-
>     command port with mandatory Tenant/Site predicates. Cache, count, cursor,
>     search, deep-link, Realtime, export, support-detail, and error paths are
>     cross-Tenant tested; no service key, client-supplied scope, or default Site
>     reaches the browser contract.
> 27. **Privacy and safeguarding are adverse-first.** Staff summaries carry only
>     the minimum safe content label and impact explanation. Restricted-worker
>     existence, form answers, donor data, media URLs, private filenames,
>     unpublished prose, recipient addresses, IPs, provider responses, and raw
>     errors are omitted or policy-redacted. A user without permission receives
>     an existence-safe state. Privacy, consent, withdrawal, or safeguarding
>     uncertainty follows the owning source's immediate containment rule before
>     asynchronous cleanup; D31 reports that containment without leaking why to
>     an unauthorized audience.
> 28. **Providers remain implementation details and D30 owns deep diagnosis.**
>     Staff never browse Payload Jobs, Inngest runs/replays, Supabase tables,
>     Storage objects, logs, raw metrics, queues, or third-party consoles from
>     Content Health. The projection translates stable product evidence into
>     product language. If product evidence cannot explain an incident, an
>     authorized operator may follow the D30 incident-bound, short-lived,
>     read-only diagnostics lifecycle; diagnostics cannot mutate or satisfy a
>     Health issue, and any repair returns through a typed source command.
> 29. **Projection failure is visible but cannot block or counterfeit source
>     work.** Source editing, safety containment, D1 release rules, automatic
>     recovery, and authoritative receipts continue independently if D31 is
>     delayed or unavailable. The workspace retains still-valid known issues,
>     labels them with evidence age, shows **Health check incomplete**, and
>     withholds favorable counts. It never silently clears issues, blocks a safe
>     source action solely because its read model is down, or falls back to a raw
>     provider UI. Recovery of the projector uses replay-safe source facts and a
>     bounded reconciliation scan.
> 30. **The architecture is incremental, bounded, and fair.** Source transitions
>     normally advance the projection through Core's existing durable dispatch,
>     claims, idempotency, retry, recovery, and dead-letter seams; code-owned
>     reconciliation detects missed or stale evidence. Reads use indexed current
>     issue rows, bounded cursor pagination, set-based joins, selected columns,
>     and no request-time provider calls or per-row source queries. Reconciliation
>     is partitioned and checkpointed with per-Tenant fairness, concurrency and
>     rate controls, jittered backoff, cost budgets, and mass-close anomaly
>     guards. A rebuild proves expected-versus-actual scope before atomic
>     projection replacement.
> 31. **Operational observability measures whether D31 can be trusted.** Operators
>     receive low-cardinality metrics and privacy-safe traces for projection lag
>     and oldest watermark by family, stale/incomplete scope count, open issue
>     age and disposition, duplicate suppression, reopen and false-resolution
>     rate, recovery-command outcome/latency, reconciliation drift, backlog and
>     dead letters, notification volume, provider-adapter errors, per-Tenant
>     fairness, and query latency. Sustained privacy/safety containment failure,
>     cross-Tenant probe failure, false favorable status, or unreconciled
>     deletion pages immediately; ordinary subcritical drift creates operator
>     work, not staff alarm noise. Tenant IDs and content never become unbounded
>     metric labels.
> 32. **Accessibility, responsive behavior, and calm interaction are release
>     gates.** Content Health uses Core's PageShell, typography, spacing, Maia/
>     Zinc semantics, focus indicators, and shared responsive patterns rather
>     than a provider skin. Every route and action is keyboard and touch
>     reachable at every breakpoint; the hidden desktop rail has an equivalent
>     mobile entry. Rows reflow to cards without horizontal dependency, touch
>     targets remain adequate, headings and landmarks are ordered, text and
>     icons accompany color, and zoom/reflow do not hide scope or action. Polite
>     `role="status"` announces progress and verification; assertive alerts are
>     reserved for genuinely urgent changes; focus moves only for navigation or
>     a user-opened dialog, messages do not auto-dismiss, and motion respects
>     reduced-motion preferences.
> 33. **Language and time eliminate guesswork.** Copy starts with the affected
>     object and consequence—**Your About page is still public at its old
>     address**—rather than **redirect job failed**. It distinguishes **Saved**,
>     **Scheduled**, **Released**, **Visible**, **Updating**, **Contained**,
>     **Verified**, and **Resolved** instead of collapsing them into **Published**
>     or **Done**. Dates show a clear local absolute time and zone with relative
>     time only as support; deadlines and next checks never rely on color,
>     animation, or vague **soon**. Explanations answer **What this means** and
>     **What happens next** without blame, legal alarm, or infrastructure jargon.
> 34. **Contract, security, resilience, accessibility, and usability proof are
>     mandatory.** Tests cover every issue family and disposition, source-state
>     mapping, stale/missing/contradictory evidence, duplicate/out-of-order/late
>     events, generation supersession, concurrent and lost-ack recovery,
>     projector kill points, reconciliation and rebuild, permission revocation,
>     two-tab and context-switch behavior, RLS and direct-route cross-Tenant
>     isolation, redaction snapshots, provider exact-pin behavior, pagination
>     and load budgets, notification suppression, keyboard/screen-reader/reflow/
>     contrast/reduced-motion behavior, and rollback to last known good.
>     Task-based research with representative nonprofit communications staff,
>     occasional editors, translators, ministry leaders, and support operators
>     must prove that users can identify impact, responsibility, and the correct
>     next action without provider knowledge; launch-blocking ambiguity is fixed,
>     not documented as training debt.
> 35. **Delivery follows a safe tracer order.** First ratify vocabulary, source-
>     family registry, scope and freshness contracts, redaction, authorization,
>     and proof fixtures. Next prove a read-only staff-correctable tracer such as
>     a broken Page/navigation reference from source evidence through contextual
>     status, central issue, source edit, verification, and resolution; pair it
>     with one automatic/platform tracer such as D17 search lag to prove quiet
>     recovery, deadline transition, and no staff replay. Then add the exception-
>     first workspace, truthful incomplete/no-issue states, mobile/keyboard
>     parity, and operator observability. Add each other family only with its
>     owner adapter and tests. Enable source destinations
>     before direct commands; enable each Recovery command only after its
>     current-state fence, claim, idempotency, receipt, failure, and usability
>     proof pass. Backfill/rebuild in shadow, compare, then switch one read head;
>     never dual-author health truth.
> 36. **Explicit non-goals keep D31 small and maintainable.** D31 does not build
>     generic observability, incident management, an uptime/status page, content
>     scoring, SEO auditing, analytics, data stewardship, arbitrary validation,
>     assignments, approvals, comments, chat, a support inbox, tenant-defined
>     automations, provider administration, a second notification engine, a
>     workflow designer, a queue browser, bulk replay/cancel, direct database
>     repair, an external public-health API, or a second audit/retry/publication
>     authority. It ships one source-derived projection, one quiet staff
>     workspace, the same contextual status, and only proven cause-owned actions.

### Binding interpretation

1. **Content health is a derived explanation, never a new authority.** It
   projects current source-owned facts, desired-state targets, receipts, and
   evidence freshness without replacing publication, scheduling, search,
   forms, media, imports, permissions, audit, or provider truth.
2. **One small code-owned issue-family registry governs meaning.** Stable
   family identifiers, responsibility, impact, evidence requirements,
   source-owned resolution proof, safe actions, and permitted copy are
   versioned and tested; Tenants cannot invent executable health rules.
3. **The workspace is quiet and exception-first.** It opens on actionable
   conditions grouped by cause, while healthy, unavailable, incomplete, and
   recently resolved states remain truthful and visually distinct.
4. **Impact, responsibility, progress, and urgency are separate facts.** Staff
   can tell who is affected, who must act, whether automation is already
   working, and when attention is genuinely time-sensitive without decoding
   provider or queue terminology.
5. **Context and destination share one issue identity.** Page, schedule,
   navigation, form, media, import, and other source surfaces show the same
   compact Health Status and route to one canonical full issue page; there is
   no second drawer workflow or duplicated recovery state.
6. **Recovery is cause-owned and typed.** The default action returns staff to
   the authoritative source surface. Direct Recovery Commands exist only for
   proven causes with exact targets, current-state and authorization fencing,
   idempotency, bounded effects, validation, receipts, and safe retry.
7. **D30 owns deep diagnostics and Phase 12 owns permission.** Raw providers,
   job attempts, database repair, and operator detail never leak into ordinary
   staff health UX. Every read and action remains exact-scope, adverse-first,
   least-disclosing, and structurally Tenant-safe.
8. **The projection may fail without harming source workflows.** Source
   publication, recovery, and authoritative receipts continue independently;
   stale, incomplete, rebuilding, or unavailable health evidence is stated
   plainly and never rendered as green.

### Complete staff-journey contract

The ratified journey is **discover → understand → act once → verify**. Staff
may enter from one quiet Web Studio destination, a source-owned contextual
status, a transition-deduplicated notification, or D29 import onboarding. Every
issue page answers what happened, visitor impact, responsibility, what is
already happening, the safest next action, evidence age, and how resolution is
proved. **Reviewed**, **Remind me later**, and **Resolved** remain different
states; reminders never change source truth, suppress safety work, or create a
shared assignment system.

The workspace must provide truthful no-issue, evidence-incomplete, rebuilding,
unavailable, wrong-scope, no-access, superseded, resolving, failed-recovery,
and recently resolved journeys across keyboard, screen reader, touch, reflow,
zoom, reduced motion, weak networks, concurrent tabs, and long-running work.
Routine status does not use interruptive alerts; urgent announcement is
reserved for a real, time-sensitive state change.

### Adversarial disposition

Every required category contains a material baseline concern: brittleness,
technical debt, edge cases, footguns, Tenant safety, overengineering, UX/UI
friction, hidden coupling, failure modes, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependency and
integration risk, migration/upgrade risk, and other concurrency/deployment
hazards. The complete review found C-prime sound only with the exact 36-clause
hardening above.

Ratification therefore does not approve a raw job dashboard, success-derived
green status, generic retry button, provider-coupled vocabulary, staff-visible
provider logs, custom Tenant health-rule builder, shared assignments, or a
second workflow/audit/publication authority.

### Required proof inherited by the eventual specification

1. Define and contract-test the exact issue-family registry, stable identity,
   source evidence, resolution proof, freshness budgets, dispositions, impact,
   responsibility, progress, urgency, safe copy, and action ownership.
2. Prove exact Tenant/Site/environment/locale/resource scoping and Phase
   12/D30 enforcement across primary records, versions, relationships,
   projections, caches, URLs, errors, receipts, recovery commands, and parallel
   tabs; cross-scope existence must remain undisclosed.
3. Prove projection lag, stale evidence, missing receipts, reconciliation
   drift, rebuild, partial outage, and projector failure can never create false
   green or interrupt authoritative source workflows.
4. Prove contextual status and the central workspace resolve to the same stable
   issue identity and canonical issue page, with no duplicate state or
   contradictory action.
5. Prove every typed Recovery Command is current-state fenced, independently
   authorized, idempotent, bounded, observable, and validated against
   source-owned resolution proof; stale or superseded commands no-op safely.
6. Pass complete accessible staff journeys for quiet success, actionable
   issue, automation in progress, platform attention, incomplete evidence,
   recently resolved, reminder, notification, source navigation, recovery,
   denial, outage, concurrency, and import onboarding.
7. Measure projection lag, reconciliation convergence, issue/query volume,
   grouping cost, load fairness, notification deduplication, recovery outcome,
   false-resolution/reopen rate, and task-completion time with
   production-shaped multi-Tenant data.
8. Ship in tracer order: registry and one source-owned issue family; exact
   scoped projection and freshness truth; contextual status and canonical
   issue page; central exception workspace; then notifications, reminders, and
   direct recovery only when evidence proves their value.

### Evidence and architectural record

- [D31 exact formulation and decision brief](./research/phase-23-d31-content-health-decision-brief.md)
- [D31 complete 17-category adversarial review](./research/phase-23-d31-content-health-adversarial-review.md)
- [D31 primary-source and repository research](./research/phase-23-d31-content-health-primary-source-research.md)
- [D31 staff journey and UX benchmark](./research/phase-23-d31-content-health-ux-benchmark.md)
- [ADR-0175 — Derived exception-first Content Health and cause-owned recovery](../../adr/0175-derived-exception-first-content-health-and-cause-owned-recovery.md)

The complete quoted formulation above is the founder-ratified D31 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, code,
schema/RLS, data repair, migration/backfill, dependency or provider adoption,
plugin installation, issue or specification publication, Git publication,
deployment, production access, D1 activation, or release.

Root `CONTEXT.md` synchronization remains held until the Phase 22
documentation stack is merged or Phase 23 becomes an explicit reviewed stack.
D31's canonical terms are preserved here and in ADR-0175 without overwriting
accepted Phase 22 language.

### Remaining grooming coverage

D1–D31 establish accessibility as a non-overridable platform floor but do not
yet decide its exact authoring-assistance, human-review, and D1 release-gate
contract. They also do not yet decide production capacity budgets or the exact
qualified Payload version. Any additional migration/cutover proof not already
settled by D29-D31 remains an evidence-backed implementation obligation rather
than an implicit new product authority. Remaining founder decisions will be
resolved one at a time.

## D32 — Tenant-autonomous Accessibility Assistance with source-owned release invariants

**Status:** Founder-ratified on 2026-08-24 after current primary-source and
repository research, complete quiet staff-journey design, and ruthless
17-category adversarial review.

### Exact ratified formulation

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — One quiet,
> tenant-autonomous Accessibility Assistance Contract with
> accessible-by-construction Asym surfaces, contextual author choices,
> non-blocking editorial suggestions, narrow source-owned D1 release
> invariants, D9 package certification, and D31 platform-regression recovery.**
>
> 1. **One bounded assistance contract, not a compliance product.** D32 adds
>    one shared Accessibility Assistance contract to Web Studio and D1. It does
>    not create an accessibility department, approval workflow, legal review,
>    policy engine, issue tracker, crawler, score, certification product, or
>    second publication authority.
> 2. **The non-policing responsibility line is explicit.** Asym guarantees the
>    accessibility of Web Studio and the mechanics, components, compiler output,
>    capability islands, and certified package code that Asym generates or
>    admits. Tenants retain responsibility and final judgment for their message,
>    prose, imagery, brand, and other editorial choices. Assistance informs;
>    it does not grade, shame, approve, or police those choices.
> 3. **Settled authority remains intact.** D1 remains the exact Site Plan
>    compiler and release authority; D9 owns Presentation Package admission and
>    generated public behavior; D11 owns typed Rich Text, links, and Video; D22
>    owns exact locale lineages; D27 owns usage-local media meaning; D29 owns
>    staged imports; D30 owns staff authority and diagnostics; and D31 owns
>    verified operational regressions. D32 neither weakens nor silently expands
>    their ratified gates.
> 4. **One precise domain vocabulary.** The technical contract uses
>    **Accessibility Assistance**. Ordinary Page UI labels the entry point
>    **Accessibility help** and explains it as “Small checks that help more
>    people use this page.” This helpful label is not a separate state or
>    authority and does not collide with D24's public-versus-authenticated access
>    vocabulary.
> 5. **Exactly three ordinary finding classes.** A finding is one of
>    **Details to finish** for missing structured input already required to
>    produce an operable result, **Suggestion** for contextual human judgment,
>    or **Technical issue** for an Asym/package-owned defect. An unavailable or
>    stale check is stated separately and is never converted to a favorable
>    result.
> 6. **Web Studio itself is accessible.** The complete create, compose, reorder,
>    configure, review, Preview, Publish, error, and recovery journey meets the
>    D9 WCAG 2.2 AA floor with keyboard operation, visible and unobscured focus,
>    semantic reading order, accessible names, clear errors, touch, 320-pixel
>    reflow, 400% zoom, forced colors, reduced motion, and no drag-, hover-,
>    tooltip-, color-, or desktop-only action.
> 7. **Accessible by construction comes before checking.** Standard components,
>    starters, templates, forms, navigation, heading choices, token pairings,
>    generated identifiers, focus behavior, DOM order, responsive behavior,
>    status semantics, and reduced-motion behavior prevent platform defects
>    wherever Asym can know the answer. Healthy authors are not asked to repair
>    what the product can guarantee automatically.
> 8. **Creative freedom remains broad.** Tenants may choose radically different
>    brand expression, layouts, imagery, wording, animation style, loading
>    treatment, and certified custom presentation under D9. D32 does not enforce
>    a house aesthetic, content opinion, reading level, theology, campaign
>    message, or preferred prose.
> 9. **Editorial quality is never an automated gate.** Alternative-text quality,
>    link-copy quality where a meaningful name exists, plain-language quality,
>    complex-image description quality, caption accuracy, uncertain visual
>    contrast over content, and other human-judgment matters remain Suggestions.
>    They do not disable D1 or become a claim of noncompliance.
> 10. **Details to finish are narrow and source-owned.** This class applies only
>     when an already-ratified semantic contract or ordinary component validity
>     requires an explicit choice or value for truthful, operable output—such as
>     an action name/destination, D11 Video disposition, or D27 placement and
>     required-equivalent branch. Authors may choose any permitted value; Asym
>     does not second-guess the truth or quality of that editorial choice.
> 11. **D32 cannot create blockers by catalog update.** A new D32 rule cannot
>     become release-blocking merely because it is deterministic or a scanner
>     calls it serious. New source invariants require the owning domain's
>     explicit governance and proof; D32 only presents and rechecks the exact
>     blocking facts already owned elsewhere.
> 12. **Work is never held hostage.** Save, autosave, undo, recovery, copy,
>     version comparison, and D25 Preview remain available for all three finding
>     classes. Only an exact successor release can be refused for a pre-existing
>     source invariant or unproved platform/package contract, and the current
>     public generation remains live.
> 13. **Assistance appears at the decision, not as interruption.** Cheap checks
>     run after insertion, blur, save, or a short idle boundary—not every
>     keystroke. Guidance appears beside the affected field or block, begins
>     with the likely visitor consequence, offers one clear next action, and
>     keeps decision help collapsed. It never uses a toast or auto-opening modal.
> 14. **One quiet Page summary.** **Accessibility help** opens an in-flow,
>     reflow-safe section under the existing document state rather than a new
>     dashboard or desktop-only Inspector. It groups Details to finish,
>     Suggestions, Technical issue, and collapsed Previously reviewed. Passed
>     checks and technical detail remain collapsed.
> 15. **No score, grade, badge, or conformance claim.** D32 never shows a
>     percentage, red/green grade, Tenant ranking, legal status, `WCAG passed`,
>     `100% accessible`, or other implication that automated checks establish
>     accessibility or compliance. An empty list says only that no current
>     suggestions were found.
> 16. **Locate and repair preserve author context.** **Go to field** and
>     **View in preview** identify the exact source or rendered component,
>     preserve revision and undo state, scroll it clear of sticky chrome, move
>     focus only after intentional activation, expose the relationship
>     programmatically, and provide a reliable return path.
> 17. **Suggestions never add publication ceremony.** Suggestions keep the
>     ordinary Publish action and release review unchanged. Staff may open
>     **Accessibility help** from the Page workspace when they choose, but
>     Suggestions add no release-review row, `Publish anyway`, extra
>     confirmation, attestation, justification, waiver, reviewer approval, or
>     legal disclosure.
> 18. **Keep as written is bounded continuity, not waiver.** An author may choose
>     **Keep as written** without a reason. The exact suggestion moves under
>     collapsed Previously reviewed only while its rule-declared semantic
>     inputs, locale, and check-meaning version remain unchanged. Package or
>     compiler identity participates only when that rule explicitly depends on
>     it. The disposition is shared with the exact revision, reversible, and
>     proves neither accessibility nor compliance.
> 19. **There is no broad suppression surface.** D32 provides no `Ignore
>     forever`, `Dismiss all`, bulk approval, Tenant-wide disabled rule,
>     per-role policy matrix, or user preference that makes assistance
>     undiscoverable. Relevant edits or rule-meaning changes invalidate only the
>     affected continuity; unrelated edits do not resurrect it.
> 20. **Media choices remain contextual and humane.** At each D27 placement and
>     locale, staff answer “How does this image help the page?” with bounded
>     informative/decorative and already-ratified functional, image-of-text, or
>     complex branches as applicable. A meaningful use reveals its description
>     or equivalent field. The catalog may suggest prior text but never owns or
>     silently completes placement meaning.
> 21. **Links and actions use ordinary product language.** Components ask for
>     their visible label or accessible name and typed destination/action as
>     normal fields. A nameless or destinationless action is incomplete data;
>     a merely generic but meaningful phrase is a Suggestion. Icon-only and
>     bespoke visual treatments remain allowed when the author supplies the
>     action's name.
> 22. **Rich Text, headings, and media retain their owners.** D11's bounded
>     editor prevents unsupported structure and owns Video disposition; D7/D9
>     own semantic section output; and D1 evaluates the complete outline.
>     Questionable but still operable structure is advisory unless an owning
>     ratified contract already makes it invalid. Tables remain outside D11 v1
>     and enter this assistance contract only through a later, separately
>     ratified table-capable semantic component.
> 23. **Design choices are assisted, not homogenized.** Certified token and
>     component combinations provide safe defaults and immediate contrast/
>     motion/responsive feedback. Reliably detected platform or package defects
>     return to D9 ownership. Context-dependent color, imagery, prose, or visual
>     taste remains a Suggestion and cannot force every Tenant into the same
>     design.
> 24. **AI can suggest but never decide.** Any later separately qualified AI
>     assistance is explicit, private, locale-aware, labeled as a suggestion,
>     and requires accept, edit, or reject. It never inserts filenames or
>     generic strings, bulk-approves content, marks human review, publishes,
>     sends private candidates to an unapproved model, or claims conformance.
> 25. **D1 reviews the exact compiled candidate.** D1 derives the final typed
>     result over the exact Site, locale, Page, reusable dependencies,
>     Navigation, dynamic inputs, media placements, forms, public metadata,
>     capability islands, Presentation Package, compiler, and rule versions.
>     Page-local UI state and a scanner report are never final authority.
> 26. **No authoring path bypasses the contract.** UI, REST, GraphQL, Local API,
>     imports, schedules, reusable content, dynamic content, package activation,
>     and migration tooling cannot assert a passing result from client form
>     state. Authorization and exact-candidate validation remain server-derived;
>     suggestions remain non-blocking consistently on every path.
> 27. **Locale meaning never silently carries.** Each D22 locale lineage owns
>     its content guidance and Keep-as-written fingerprint. Source-language,
>     copied, AI-generated, or machine-translated descriptions are labeled for
>     target-locale review and never silently mark that locale reviewed. Counts
>     remain locale-specific and understandable.
> 28. **Reusable and dynamic findings route to the real owner.** A reusable
>     source issue appears once at that source with an authorized affected-Page
>     summary; Page-local placement meaning stays on the Page; dynamic or
>     package findings name their responsible owner. D1 still checks complete
>     closure so a referencing Page cannot appear falsely clear.
> 29. **Package defects are not editor blame.** D9 owns keyboard, focus,
>     semantic DOM, responsive, token, motion, no-JavaScript, capability-island,
>     and generated-code proof for custom packages. Staff see that their content
>     is saved and Asym or the maintainer owns the update; they never repair
>     React, CSS, DOM, ARIA, compiler, or package code.
> 30. **Failure is truthful and bounded.** Advisory-check unavailability is
>     disclosed, never shown as passed, and fails open for publication. Failure
>     to prove an already-mandatory source or platform invariant fails only the
>     exact successor closed. Unknown publication outcome is reconciled from D1
>     receipts; retry never guesses or publishes a different revision.
> 31. **Findings are derived, not a second workflow database.** One small,
>     versioned, code-owned catalog emits stable rule ID, class, source owner,
>     location, visitor-centered copy key, repair intent, affected semantic
>     digest, and check version. Only bounded exact-revision continuity and D1
>     proof are stored; there is no mutable issue truth, compliance history,
>     assignment graph, or unbounded finding ledger.
> 32. **Tenant safety and privacy are adverse-first.** Every check, count,
>     preview link, source jump, continuity record, and receipt is bound to the
>     authenticated actor's current Tenant, environment, Site, permission,
>     locale, and exact candidate. Unauthorized content is not enumerable.
>     Private candidates are not sent to external scanners or models by default,
>     and logs/metrics contain no rendered content, PII, or restricted facts.
> 33. **Performance and cost remain bounded.** Editing uses cheap local semantic
>     checks and digest reuse; D1 performs one bounded exact-candidate pass with
>     measured concurrency and budgets. D32 adds no request-time crawl,
>     per-keystroke whole-Site scan, remote release dependency, tenant-specific
>     scan schedule, or high-cardinality evidence stream.
> 34. **D31 receives regressions, not editorial debt.** Accepted or unchanged
>     Tenant Suggestions never become Content Health issues, notifications,
>     assignments, red debt, or operational scores. D31 receives only verified
>     platform/package regressions or adverse source-owned facts and routes them
>     to their cause owner. Safe aggregate D32 telemetry improves rule quality
>     without ranking Tenants or staff.
> 35. **Launch requires real human and technical proof.** Activation requires
>     exact-pin Payload adapter tests; UI/API/import/schedule/reuse/dynamic/
>     locale/package parity; automated accessibility tests; manual keyboard,
>     focus, screen-reader, touch, 320-pixel, 400%-zoom, forced-colors, and
>     reduced-motion verification; fault/race/bypass/load tests; and moderated
>     tasks with disabled and occasional nonprofit ministry staff. A clean axe
>     run alone is insufficient.
> 36. **Scope remains deliberately closed.** D32 ships no accessibility overlay,
>     legal-advice surface, public certification badge, Tenant compliance
>     report, staff surveillance, policy builder, custom WCAG profile, generic
>     rules engine, crawling service, third-party scanning dependency, approval
>     queue, accessibility inbox, generalized waiver system, or duplicate D1,
>     D9, D11, D27, D30, or D31 authority. Ratification authorizes documentation
>     only—not code, schema/RLS, migration, dependencies, provider adoption,
>     issue/spec publication, Git publication, deployment, production access,
>     D1 activation, or release.

### Binding interpretation

1. **Accessibility Assistance is bounded help, not a compliance product.** Asym
   owns the accessibility of Web Studio and the mechanics, components,
   compiler output, capability islands, and certified packages it generates or
   admits. Tenants retain final judgment over message, prose, imagery, brand,
   and other editorial choices.
2. **Exactly three finding classes preserve the responsibility line.**
   **Details to finish** presents structured input already required by a
   source-owned contract, **Suggestion** supports contextual human judgment
   without blocking release, and **Technical issue** identifies an
   Asym/package-owned defect.
3. **Accessible by construction comes before checking.** Standard components,
   starters, templates, token pairings, generated identifiers, focus, semantic
   DOM, responsive behavior, and reduced motion prevent knowable defects
   without transferring platform repair work to authors.
4. **D32 cannot invent release authority.** D1 remains exact-candidate release
   authority, and a new D32 catalog rule cannot become blocking without
   explicit ratification by the source domain that owns the invariant.
5. **Editorial suggestions stay quiet and non-policing.** They add no score,
   compliance claim, attestation, waiver, approval, warning wall, notification
   stream, or extra publication ceremony; exact unchanged choices may remain
   collapsed through bounded Keep-as-written continuity.
6. **Every authoring path resolves the same exact candidate.** UI, API, imports,
   schedules, reusable content, dynamic content, locales, and package
   activation cannot bypass server-derived authorization or D1 validation.
7. **Failure, privacy, cost, and continuity are adverse-first and bounded.**
   Unavailable advisory checks fail open without claiming success; mandatory
   source/platform proof fails only the exact successor closed; private content
   is not exposed to unauthorized users, scanners, models, logs, or metrics.
8. **D31 receives regressions, not editorial debt.** Accepted or unchanged
   Suggestions never become Content Health issues. Only verified platform or
   package regressions and adverse source-owned facts route to their cause
   owner through D31.

### Complete staff-journey contract

The ratified experience is quiet by default. Accessible components prevent
knowable defects; contextual decisions appear where the author owns meaning;
and **Accessibility help** opens one in-flow, reflow-safe Page summary only when
staff choose it. **Go to field** and **View in preview** locate the exact source
and rendered result without discarding revision, focus, undo, or return
context.

Suggestions publish through the ordinary D1 journey and may be kept as written
without justification. Details to finish use the existing validation summary
while Save, recovery, and Preview remain available and the current public
generation stays live. Technical issues tell staff that Asym or the package
maintainer owns repair. Locale, reuse, imports, APIs, schedules, collaboration,
stale checks, denied access, and package failures preserve exact ownership,
scope, and truthful status across keyboard, screen reader, touch, narrow
reflow, zoom, forced colors, and reduced motion.

### Adversarial disposition

Every required category contains a material concern: brittleness, technical
debt, edge cases, footguns, Tenant safety, overengineering, UX/UI friction,
hidden coupling, failure modes, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependency and
integration risk, migration/upgrade risk, and concurrency/deployment hazards.
The complete review found C-prime sound only with the exact 36-clause
non-policing hardening above.

Ratification therefore does not approve a universal accessibility blocker,
score, grade, compliance claim, editorial approval, warning wall, broad
suppression surface, third-party scanning dependency, issue ledger, Tenant
ranking, staff surveillance, or duplicate release/workflow authority.

### Required proof inherited by the eventual specification

1. Contract-test the three finding classes, stable rule identity, source owner,
   semantic digest, check-meaning version, visitor-centered copy, repair intent,
   and exact source-owned release-invariant boundary.
2. Prove Web Studio and Asym-generated output across keyboard, focus, screen
   reader, touch, 320-pixel reflow, 400% zoom, forced colors, reduced motion,
   no-JavaScript behavior where required, and non-pointer alternatives.
3. Prove D1 evaluates the exact compiled candidate across UI, REST, GraphQL,
   Local API, imports, schedules, reuse, dynamic content, locales, packages,
   compilers, and capability islands without a client-state or scanner bypass.
4. Prove Suggestions remain non-blocking and interruption-free, Keep-as-written
   continuity invalidates only on declared semantic changes, and no catalog
   update silently creates a release blocker.
5. Prove exact Tenant, environment, Site, permission, locale, revision, and
   candidate scoping; unauthorized content must remain non-enumerable and
   private candidates must not reach unapproved scanners or models.
6. Prove unavailable/stale checks, candidate races, concurrent editors, lost
   acknowledgements, package failures, unknown publication outcomes, rollback,
   and current-public-generation preservation.
7. Measure bounded editing and D1-check cost, digest reuse, concurrency, load,
   and privacy-safe telemetry without per-keystroke whole-Site scans, remote
   release dependencies, or high-cardinality content evidence.
8. Complete moderated create, edit, locate, repair, Preview, Publish, locale,
   reuse, package-defect, and recovery tasks with disabled and occasional
   nonprofit ministry staff; fix launch-blocking ownership or blocker confusion
   rather than recording it as training debt.

### Evidence and architectural record

- [D32 exact formulation and decision brief](./research/phase-23-d32-accessibility-assistance-decision-brief.md)
- [D32 complete 17-category adversarial review](./research/phase-23-d32-accessibility-authoring-adversarial-review.md)
- [D32 primary-source and repository research](./research/phase-23-d32-accessibility-authoring-primary-source-research.md)
- [D32 complete quiet staff UX journey](./research/phase-23-d32-accessibility-authoring-ux-journey.md)
- [ADR-0176 — Tenant-autonomous Accessibility Assistance and source-owned release invariants](../../adr/0176-tenant-autonomous-accessibility-assistance-and-source-owned-release-invariants.md)

The complete quoted formulation above is the founder-ratified D32 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, code,
schema/RLS, data repair, migration/backfill, dependency or provider adoption,
plugin installation, issue or specification publication, Git publication,
deployment, production access, D1 activation, or release.

Root `CONTEXT.md` synchronization remains held until the Phase 22
documentation stack is merged or Phase 23 becomes an explicit reviewed stack.
D32's canonical terms are preserved here and in ADR-0176 without overwriting
accepted Phase 22 language.

### Remaining grooming coverage

D1–D32 do not yet decide production capacity budgets or the exact qualified
Payload version. Any additional migration/cutover proof not already settled by
D29–D32 remains an evidence-backed implementation obligation rather than an
implicit new product authority. Remaining founder decisions will be resolved
one at a time.

## D33 — Versioned Production Capacity Profile with Vercel qualification

**Status:** Founder-ratified on 2026-08-24 after current Vercel, Next.js,
Supabase, Payload, Inngest, and Web Vitals primary-source research, a complete
UX/service-journey contract, and a ruthless 17-category adversarial review.

### Exact ratified formulation

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — One versioned,
> provider-neutral Production Capacity Profile with one version-pinned Vercel
> Qualification Attachment for the intended launch host, evidence-calibrated
> workload cohorts, exact-generation cache ownership, public-experience and
> staff-workflow floors, Tenant-fair admission and backpressure, bounded unit
> cost, and quiet cause-owned degradation; never provider settings as product
> truth, an automatic shutdown policy, or a speculative multi-cloud platform.**
>
> 1. **One product contract and plain vocabulary.** The **Production Capacity
>    Profile** is Core's versioned product contract for supported workload,
>    experience, correctness, freshness, fairness, resource, recovery, and
>    unit-cost outcomes. A **Capacity cohort** is one evidence-calibrated workload
>    shape. A **Capacity Evidence Package** proves one exact profile against one
>    exact system build. The **Vercel Qualification Attachment** maps that
>    profile to the intended launch host. These are engineering and operations
>    artifacts; ordinary staff, missionaries, donors, and public visitors never
>    need provider vocabulary to use the product.
> 2. **D33 governs nonfunctional outcomes; settled owners keep authority.** D1
>    remains the only Site Plan compiler, validator, activation, serving-head,
>    and content-rollback authority; D9 owns package certification; D13
>    scheduling; D17 search convergence; D25 Preview Candidate identity; D27
>    media custody and renditions; D30 authorization and privileged diagnostics;
>    D31 staff-facing Content Health; and D32 accessibility release invariants.
>    D33 may require those owners to meet budgets and safe degraded behavior,
>    but it cannot edit their truth, bypass their gates, or create a second
>    release, retry, audit, authorization, or incident authority.
> 3. **The launch implementation is Vercel-native without making Vercel domain
>    truth.** Core deliberately uses qualified Vercel CDN, Vercel Functions,
>    framework caching, build, Preview-protection, observability, and protection
>    capabilities when they fit the contract. Product records and Tenant-facing
>    APIs never store a Vercel plan, SKU, region code, cache state, spend amount,
>    deployment ID, or provider receipt as product authority. Launch builds no
>    generic cloud control plane, active-active multi-cloud runtime, or
>    lowest-common-denominator adapter; portability comes from D1's immutable compiled
>    projections, standard artifacts and protocols, provider-separated evidence,
>    and explicit qualification boundaries.
> 4. **One active profile version is qualified by one exact Vercel attachment.**
>    Every promoted application artifact and Capacity Evidence Package
>    identifies the immutable Production Capacity Profile version and exact
>    Vercel Qualification Attachment digest. Each D1 generation receipt
>    identifies only provider-neutral profile, projection-schema, compiler,
>    package, and renderer-compatibility versions. A separate
>    deployment-qualification record proves which Vercel attachment may serve that
>    generation. Changing a rate card or non-compatibility provider setting
>    never rewrites or invalidates a content receipt. The attachment records
>    exact Next, React, Payload, adapter, Presentation Package, and runtime pins;
>    Vercel plan/projects/environments, effective fluid-compute state, regions,
>    Function memory/duration and configuration provenance; cache, image, build,
>    telemetry, protection, and spend settings; Supabase compute/region/pooler
>    contract; Inngest execution contract; rate-card evidence date; and
>    qualification result. Supported non-secret settings are code-owned where
>    practical and otherwise snapshotted and drift-checked. A material pin,
>    topology, setting, provider-limit, or pricing change triggers scoped
>    requalification; it never silently weakens a product budget.
> 5. **Three numeric cohorts replace vague labels.** **Minimum** proves a small
>    realistic Tenant, cold-path safety, and absence of a fixed-cost or latency
>    cliff. **Typical** represents the measured design-partner distribution and
>    normal target experience. **Measured maximum** is the largest advertised
>    supported envelope that passes sustained, burst, recovery, and headroom
>    proof. Every cell names an exact value, distribution or mix, growth horizon,
>    and evidence date. Payload/Vercel defaults, a warm-cache demo, or “thousands”
>    are not cohort values; no maximum is advertised before the matrix is filled.
> 6. **The cohort matrix covers the whole CMS and public estate.** It includes
>    Tenants, Sites, domains, locales, Pages and tree depth, ordinary and
>    source-owned records, navigation and redirects, versions/autosaves, reusable
>    sections, topics, forms, saved views, Trash, presentation packages and
>    variants, D27 media items/bytes/pixels/renditions, dynamic sources and list
>    fan-out, search corpus, imports/exports, concurrent editors and tabs,
>    previews, releases, schedules, background reconciliation, public sessions,
>    geographic/device/network mix, and every previously ratified numeric bound.
>    A later decision may raise a bound only with a new profile and evidence; it
>    may not silently lower an earlier ratified floor.
> 7. **Named workload scenarios avoid both idealized tests and a Cartesian
>    explosion.** Each cohort has reproducible warm, cold, cache-miss,
>    deployment, migration, sustained, burst, correlated-peak, noisy-neighbor,
>    bot/abuse, downstream-slow, partial-outage, recovery, and rollback
>    scenarios. High-risk dimensions are tested alone and in realistic
>    combinations; D33 does not require every theoretical combination. A
>    numeric reserve for safety, adverse containment, and recovery remains
>    outside ordinary measured-maximum consumption. Cohorts are support and
>    engineering envelopes—not aesthetic policing, automatic Tenant billing
>    tiers, or permission to delete, hide, or degrade a Tenant's content.
> 8. **Every surface receives its own measurable budget.** The profile assigns
>    numeric latency, tail, throughput, queue-age, freshness, error, availability,
>    storage-growth, database, and unit-cost budgets to Web Studio lists/tree/
>    search/open/save/autosave/history/Preview/Release; D1 validate/prepare/
>    activate/rollback and downstream convergence; D17 query/reindex; D13
>    scheduling; D27 ingest/rendition/delivery; D26 form acceptance/routing;
>    public routes; and operational recovery. No aggregate Lighthouse score,
>    average response time, cache-hit ratio, database pool size, or monthly bill
>    can stand in for those outcomes.
> 9. **Measurement conventions make results comparable.** Every result records
>    the profile/attachment/build and fixture digests, exact environment and
>    provider topology, Tenant mix, route/package/generation class, warm/cold
>    and cache state, sustained rate, burst, concurrency, duration, sample size,
>    median and relevant tail percentiles, errors, retries, queue depth,
>    resource/cost measures, uncertainty, and known limitations. Field and lab,
>    client and server, and production and Preview are reported separately. A
>    test run against `next dev`, one Lighthouse pass, an unsegmented average,
>    or a successful idle Tenant does not qualify production.
> 10. **Public experience has a fixed modern floor and representative route
>     coverage.** At launch, field Core Web Vitals pass at the 75th percentile,
>     segmented at least by mobile and desktop, with **LCP ≤ 2.5 seconds, INP ≤
>     200 milliseconds, and CLS ≤ 0.1**. Higher percentiles remain visible for
>     diagnosis. Production-mode mobile and desktop lab evidence covers landing,
>     missionary/project, campaign/article, search/list, form/contact, public
>     giving entry and handoff—not checkout, payment completion, or receipt,
>     which retain their owning capacity and outcome contracts—
>     redirect/not-found, and package/locale families, including slow-network and cold-cache
>     paths. Sparse field cohorts show uncertainty rather than a false green
>     result.
> 11. **The public path sends useful, stable content before optional
>     interactivity.** Public pages consume D1's bounded pre-resolved projection,
>     use Server Components/static shells and route/package code splitting,
>     reserve media geometry, limit third-party work, respect reduced motion,
>     and keep navigation, ministry information, and the giving/contact entry
>     point usable without waiting for decorative animation or a large client
>     bundle. Streaming and prefetching may improve continuity only where the
>     exact Next/Vercel pin proves correct focus, state, transfer, and cost
>     behavior; they cannot hide a blocked origin behind an endless skeleton.
> 12. **Staff responsiveness is task-based and honest.** The profile separately
>     budgets first useful Web Studio render, list/tree/search interaction,
>     document open, input acknowledgement, save/autosave confirmation, Preview,
>     Release, scheduling, and recovery. Local interaction responds immediately;
>     **Unsaved changes**, **Saving**, and **Saved at _local time and zone_**
>     reflect browser, request, and exact server-acknowledgement facts. Longer
>     release work may show **Waiting to prepare. Your live site is unchanged—no
>     action is needed**, **Preparing release**, **Released · verifying public
>     update**, and **Public update verified** only from the owning receipt and
>     readback. An unknown outcome says **We could not confirm what happened. We
>     are checking now**, names the last acknowledged state, and never offers a
>     blind Retry. No fake percentage, guessed finish time, blank screen,
>     infinite spinner, repeated-submit invitation, or infrastructure code
>     substitutes for truth.
> 13. **Correctness, privacy, safety, accessibility, and current intent outrank
>     speed and cost.** Capacity tuning cannot bypass authorization, RLS,
>     validation, the narrow source-owned accessibility invariants already
>     ratified under D1, D9, D11, D27, and D32—while editorial Suggestions
>     remain non-blocking—exact-revision selection, source ownership,
>     idempotency, receipts, or D1's all-or-none activation. A last-known-good
>     generation may serve during favorable regeneration failure only while
>     current intent still permits it. Unpublish, consent withdrawal, rights
>     expiry, restriction, safeguarding, and privacy changes take the shortest
>     qualified containment path and cannot wait behind cache warmth,
>     background throughput, cost savings, or favorable releases.
> 14. **Vercel Functions perform bounded request work, not whole-Site jobs.**
>     The attachment measures each request family across wall duration, Active
>     CPU, Provisioned Memory, invocations, external I/O, errors, concurrency,
>     and downstream pressure. Memory and duration remain bounded below provider
>     maxima; a high `maxDuration` is not a capacity strategy. Whole-Site
>     compilation, reindexing, media processing, import, reconciliation, and
>     release fan-out leave the donor/staff request and use the owning durable
>     workflow. Fluid compute is enabled, disabled, sized, or changed only by
>     exact measured evidence; instance concurrency never implies Tenant or
>     database fairness.
> 15. **Compute topology follows data and compliance, while public delivery
>     remains global.** Database-touching Functions use one qualified primary
>     region close to the authoritative Supabase data path unless globally
>     replicated read semantics have separately passed correctness, lag, cost,
>     and failover proof. Every configured or provider-supplied Function
>     failover region is separately qualified for data residency, Supabase
>     reachability, end-to-end latency, connection pressure, correctness, and
>     degraded behavior. Compute failover never implies database failover or
>     permission to serve from an unproved data path. Region choice considers
>     end-to-end latency, data residency, provider rate, and recovery—not the
>     cheapest rate alone. The CDN serves immutable/static public material near
>     visitors. D33 does not add multi-region database writes, read replicas, or
>     active-active compute before evidence demonstrates a real need.
> 16. **Postgres connections are a shared finite budget.** The attachment names
>     the exact direct/session/transaction pooler lanes and proves Payload
>     transactions, prepared-statement behavior, migrations, advisory/locking
>     behavior, and workers against them. Application pools are initialized and
>     reused safely, have bounded acquisition/idle/query time, and cannot
>     multiply unboundedly with Function instances. The total budget reserves
>     room for Supabase Auth/Storage/Realtime and operations, then accounts for
>     Web Studio, public misses, Payload, Inngest, migrations, and diagnostics.
>     Pool growth is never the first or sole fix: query plans, rows scanned,
>     indexes, lock time, transactions, and queueing must prove capacity.
> 17. **Request data shape is bounded before infrastructure is enlarged.**
>     Public requests read only D1's flat selected projection and never recurse
>     through Payload, resolve mutable `latest`, or issue per-block/per-item
>     queries. Staff and operator reads use exact Tenant/Site predicates,
>     selected columns, low relationship depth, bounded cursor/server paging,
>     indexed filters/order, and set-based joins. Dynamic lists, Page-tree
>     expansion, navigation, search, versions, reverse references, and Content
>     Health cannot perform full-corpus request-time scans or N+1 provider calls.
> 18. **Content release is independent of application deployment.** D1 prepares
>     and validates one exact candidate asynchronously, writes immutable
>     projections/artifacts, and CAS-advances one small serving head only after
>     proof. Ordinary Page, locale, navigation, topic, form, media, search, or
>     schedule changes do not start a Vercel build per object, Site, Tenant, or
>     Preview. A code/Presentation Package deployment makes a compatible
>     renderer available but never publishes content. Function timeout,
>     duplicate delivery, or lost acknowledgement resolves through current-state
>     fences, idempotency, readback, and receipts—not a second activation.
> 19. **Shared cache identity is structural and generation-scoped.** Every
>     public cache key/tag and canonical response varies by every authority
>     dimension that can change the output: environment, Tenant, Site/domain
>     mapping, locale, audience, canonical path, D1 generation, Presentation
>     Package/version, and relevant projection/schema version. Missing,
>     ambiguous, default-Site/default-locale, slug-only, request-header-only, or
>     cross-environment scope fails closed. Cache entries are derivative and
>     disposable; they never become content truth or choose a generation.
> 20. **Only deterministic public success enters a shared cache.** Authenticated
>     or personalized responses, Preview Candidates, diagnostics, form
>     submissions, permission results, unknown domains, invalid scope,
>     unexpected fallback, redirects derived from unproved state, and error
>     bodies remain private/no-store or use a separately proven short negative
>     policy. Public cache profiles are explicit and code-owned for the exact
>     Next pin. Browser, CDN, ISR/framework, Runtime, and media caches each have
>     a named owner, purpose, identity, lifetime, invalidation, rollback, and
>     observability rule; hidden overlapping caches are a qualification failure.
> 21. **Revalidation is precise, event-led, bounded, and adverse-aware.** Normal
>     publication uses generation/source tags and qualified on-demand
>     invalidation rather than short time polling, per-edit whole-project purge,
>     or unbounded path fan-out. Stale-while-revalidate is allowed only where a
>     slightly stale favorable result remains valid under current intent; staff
>     read-your-own-writes and adverse containment use their exact immediate
>     semantics. Non-deterministic output, broad tags, global purge, repeated
>     invalidation, and cache-bypass storms are tested and rejected. Global
>     purge remains a privileged incident tool, not the ordinary publish path.
> 22. **Cold misses, builds, and Preview cannot create a stampede or cost
>     avalanche.** The Vercel attachment uses production-shaped build and
>     request evidence to choose the bounded routes, if any, that are
>     pre-rendered or prewarmed and those generated on first request. It qualifies
>     request collapsing and cache shielding wherever relied upon, but neither
>     requires the full Page × locale × Site × package Cartesian product at
>     build time nor mandates an on-demand long tail before measurement.
>     Automatic monorepo skipping of unaffected projects—and any separately
>     qualified remote build cache—plus production-build priority, machine
>     choice, concurrency, and retention are measured rather than assumed. D25
>     Preview Candidates remain private, protected, expiry-bounded product
>     artifacts; they do not require one Vercel deployment per candidate or
>     count as public field evidence.
> 23. **Bespoke Presentation Packages stay genuinely flexible without shipping
>     every Tenant's code to every visitor.** D9 packages are reviewed, pinned,
>     built, code-split, and certified before D1 selection; they cannot install,
>     compile, fetch executable modules, or run arbitrary code on a public
>     request. The profile measures package-catalog build impact, route chunks,
>     JavaScript/CSS/font/image/third-party/motion budgets, cache cardinality,
>     and field results for each active package family. Only the selected exact
>     package chunks and assets reach a visitor. Launch creates no per-Tenant
>     application fork or Vercel project, and one slow package cannot weaken the
>     common public floor or silently fall back to another design.
> 24. **D27 owns immutable bytes and renditions; each public image has one
>     transform owner.** Qualified digest-addressed renditions normally travel
>     directly from object/CDN custody instead of through a Vercel Function. If
>     Vercel Image Optimization transforms a source, the attachment bounds
>     source patterns, widths, qualities, formats, pixels, TTLs, cache-key
>     combinations, and transformation/read/write usage. If D27 already
>     supplies the final responsive variant, the adapter avoids an unnecessary
>     second transformation while preserving `sizes`, density selection, visual
>     stability, alt semantics, rights/withdrawal, and responsive quality.
>     Author-controlled query parameters can never create unbounded variants.
> 25. **Lists and search scale through their ratified projections, not public
>     database fan-out.** D14's source catalog, D15's three curation strategies,
>     D16's link-native windows/multiple pagers/discovery modes, and D17's public
>     search projection retain stable ordering, cursor/link state, bounded page
>     sizes, field selection, and independent convergence. Search reindex,
>     deletion, and lag never block a public page request or become a recursive
>     Payload query; stale/incomplete search follows D17/D31 truth. Tests cover
>     deep pages, repeated/back navigation, sparse results, several independent
>     pagers, cold search, deletion, and reindex under Tenant-fair load.
> 26. **Forms and giving-adjacent journeys never trade durability for a fast
>     illusion.** Cacheable form definitions and public content remain separate
>     from dynamic, authorized, rate-bounded, domain-owned submission effects.
>     A user sees success only after one durable idempotent acceptance receipt;
>     timeout, retry, duplicate click, email/provider delay, or downstream Hub
>     outage cannot lose or duplicate a submission. During overload the current
>     screen preserves entered state where privacy policy permits, explains one
>     safe next step, and never asks a donor/applicant to guess whether the form
>     was received. Giving handoff and app-owned authenticated surfaces remain
>     outside public CMS caching and keep their own security/capacity contract.
> 27. **Required background effects preserve each settled execution boundary
>     and are never lossy-rate-limited.** D13, D17, D26, and D27 continue to use
>     Core's already-ratified shared Inngest runtime, dispatch-ledger, claim,
>     retry, dead-letter, and reconciliation seams. D1 and D31 use only the
>     durable execution seam owned by the actual source domain; D31 may project
>     and verify source-owned recovery but never executes it as an independent
>     owner. D33 may qualify, budget, and observe these seams, but it cannot
>     substitute another executor or create a second workflow authority. Across
>     those settled seams, idempotent steps, exact intent/generation fencing,
>     receipts, Tenant-keyed concurrency, a global downstream cap, and
>     throttling protect noisy-neighbor and shared Supabase/provider capacity. A
>     required publish, withdrawal, redirect, schedule, index deletion, or
>     recovery effect is never silently skipped by a lossy rate limit. Queue
>     age, attempt age, lateness, backlog, dead letters, and recovery remain
>     within the owning domain's budget.
> 28. **Admission and priority preserve safety, interactive work, and Tenant
>     fairness.** Capacity is reserved first for privacy/safety containment and
>     current-public correctness, then bounded interactive save/submission
>     acknowledgement and already-accepted release work, with Preview,
>     regeneration, bulk import/export, reindex, reconciliation, deep
>     diagnostics, and other optional work deferrable by explicit policy.
>     Per-Tenant and global claims, bounded batches, jittered retry, queue caps, and
>     anti-starvation aging prevent one large Tenant or package from consuming
>     the shared system. Priority changes affect execution order, never
>     authorization or truth.
> 29. **Overload fails deliberately before Vercel or Postgres collapses.** The
>     system admits, queues, or rejects new work with one stable idempotency key
>     before exhausting Function duration/memory, database connections/locks,
>     provider quotas, or worker backlogs. Public requests continue the last
>     safe current D1 generation where valid; no mixed or partial generation is
>     exposed. **Saved** appears independently only after exact server
>     acknowledgement. Accepted release work shows **Waiting to prepare. Your
>     live site is unchanged—no action is needed**. A breached delay shows
>     **Release is taking longer than usual. Your live site is unchanged; Asym
>     is checking it**, or the exact cause-owned action. Staff never see `429`,
>     `504`, serverless-capacity language, repeated-refresh advice, or a
>     disappearing draft. If no safe public response is possible, one
>     accessible, Tenant-branded, provider-neutral unavailable page says **This
>     site is temporarily unavailable. We are working to restore it.** It may
>     show only a public, source-authoritative status or contact destination
>     proven outside the same failure blast radius. It never serves unproved
>     stale content, unverified contact details, provider identifiers, guessed
>     recovery times, or repeated automatic refresh.
> 30. **Cost is measured per product outcome, not hidden in a monthly total.**
>     Provider-neutral units include a thousand public page views, cold public
>     generation, typical staff editing session, Site release at each cohort,
>     Preview session, scheduled action, search index/reindex, form acceptance,
>     media ingest/rendition/delivery, package build, and recovery. The Vercel
>     attachment maps them to current CDN Requests (displayed as Edge Requests
>     in Vercel billing), Fast Data Transfer, Fast Origin Transfer, Function
>     Active CPU/Provisioned Memory/invocations, ISR/Runtime Cache units, image
>     transformations/cache, build, observability, storage, and protection
>     meters, plus Supabase/Inngest and other external cost. Each unit has a
>     measured baseline, budget, variance threshold, and owner; exact dollar
>     rates remain dated attachment evidence, never a permanent product schema.
> 31. **Spend and abuse controls protect access instead of policing Tenants.**
>     Where the qualified Vercel plan supports them, usage notifications and
>     Spend Management are configured with named billing and incident owners.
>     At least one tested operator escalation path—such as dashboard/email
>     notification, SMS, or webhook—is required; no specific provider channel
>     is product authority. Because provider spend checks are periodic and an
>     optional pause can stop all production projects, blanket automatic pause
>     is not the normal bill-control action. Source-owned circuit breakers first
>     stop or defer optional high-cost work while preserving safe public/giving
>     access. DDoS/WAF/bot/rate controls are narrow, observable, and tested in
>     log/challenge/enforcement stages against legitimate donors, assistive
>     technology, weak devices, staff, verified crawlers, and webhooks. Tenants
>     receive no surprise quota, aesthetic restriction, or public shutdown
>     without a separately ratified product and continuity policy.
> 32. **Observability joins product truth to provider evidence without becoming
>     another data warehouse in Supabase.** Low-cardinality telemetry covers
>     route/package/generation classes, field Core Web Vitals, cache hit/miss/
>     stale/error, origin latency, Function CPU/memory/duration/invocations,
>     transfer, cache/image/build/Preview/telemetry usage, D1 latency and
>     convergence, Inngest queue age/outcomes, Postgres query/lock/connection/
>     storage health, per-Tenant fairness, errors, and unit-cost drift. Secure
>     correlations join traces, receipts, and provider evidence; Tenant IDs,
>     slugs, URLs, form data, donor/missionary details, Preview tokens, and
>     content never become metric labels. Field URLs are route-templated,
>     query/ID-redacted, allowlisted, sampled, retention-bounded, and measured
>     for their own client and billing overhead.
> 33. **The ordinary UX is quiet, clear, responsive, and provider-free.** There
>     is no Tenant capacity dashboard, Vercel settings page, cost chart, quota
>     meter, or green “all systems healthy” ceremony. Healthy work is silent;
>     the source surface shows the current save/release/public-verification fact
>     and one best next action. A meaningful delay that still needs no staff
>     action remains contextual; a breached promise or actionable exception
>     enters D31 once with visitor impact, next owner, last verified time, and
>     cause-owned recovery. D30 alone exposes privileged provider diagnostics.
>     Public visitors see no capacity UI unless an actual component or service
>     impairment affects them. Task-specific messages remain contextual; at
>     most one neutral service-wide banner appears for genuine broad impact.
>     Material delay, failure, unknown-outcome, and outage messages persist
>     until authoritative proof changes or safe dismissal is available; routine
>     success labels update quietly. Every status uses text, icon, and semantics
>     rather than color alone, remains keyboard/touch/mobile/reflow accessible,
>     announces only meaningful transitions without stealing focus, and
>     respects reduced motion.
> 34. **Failure and rollback remain layered, compatible, and testable.** A
>     Vercel application rollback, D1 content-generation rollback, package
>     rollback, cache invalidation, Supabase recovery/migration, search rebuild,
>     and workflow replay are distinct operations. Before promotion or rollback,
>     the compatibility matrix proves the binary can read the active D1
>     projection/schema, package manifest, environment contract, and database
>     state; Vercel rollback cannot be assumed to restore environment variables,
>     database/CMS state, or current content. Provider/cache/database/queue/
>     telemetry failure retains exact known truth and receipts, fails closed on
>     incompatibility, and follows the affected source or domain owner's
>     rehearsed RTO/RPO, communication, restore, and verification runbook. D30
>     may expose privileged diagnostics and D31 may derive the resulting
>     staff-facing health status; neither becomes incident, recovery, communication,
>     or rollback authority.
> 35. **Qualification is production-shaped, reproducible, and required before
>     activation.** The Capacity Evidence Package combines deterministic bound/
>     cache/tenant/receipt contracts; production-mode browser lab runs;
>     privacy-reviewed field data; database query plans and load;
>     sustained/burst/noisy-neighbor/bot tests; fault injection at Function, Supabase, Inngest, search,
>     cache, media, and telemetry seams; cost-meter normalization; application/
>     content/package rollback drills; keyboard/screen-reader/reflow/
>     reduced-motion checks; and task-based research with nonprofit communications staff,
>     occasional editors, ministry leaders, translators, package developers,
>     donors, and support operators. The tested configuration is diffed against
>     the promoted one. A profile with an empty numeric cell, missing route/
>     cohort, stale provider evidence, unproved rollback, or failed invariant is
>     **not active** and cannot support a launch or scale claim.
> 36. **Delivery and evolution stay bounded.** First ratify the profile schema,
>     authority map, cohort dimensions, cache/overload invariants, evidence
>     format, and Vercel attachment. Then fill numeric cells from design-partner
>     distributions and current ratified bounds, build one public cache-hit/
>     miss/adverse tracer plus one Web Studio save-to-release tracer, prove
>     Tenant fairness and Supabase pressure, add field/cost evidence, and
>     qualify the exact dependency/deployment candidate before promotion. Each
>     billing cycle reviews observed usage and drift; dependency, provider,
>     topology, volume, price, or budget changes trigger proportionate
>     requalification. D33 does **not** add active-active multi-cloud, a custom
>     CDN/cache, per-Tenant application forks/projects, speculative sharding or
>     replicas, an autonomous capacity optimizer, a Tenant billing/quota engine,
>     arbitrary performance-rule builders, raw provider consoles for staff, or
>     a second workflow/health/incident platform.

### Binding interpretation

1. **One product contract, one provider proof.** The Production Capacity
   Profile owns stable product outcomes. The Vercel Qualification Attachment
   proves one exact host configuration without becoming Tenant configuration or
   publication truth.
2. **Capacity is an evidence-backed support envelope, not a Tenant quota.**
   Minimum, typical, and measured-maximum cohorts remain incomplete until every
   numeric cell has design-partner and production-shaped evidence.
3. **D1 and each source owner retain truth.** Caches, builds, deployments,
   workers, provider dashboards, and D33 budgets cannot publish content,
   authorize work, or invent recovery authority.
4. **Performance proof is journey-specific.** Public experience, Web Studio,
   release, search, schedules, media, forms, database work, and recovery each
   receive their own budgets, percentiles, failure cases, and unit-cost evidence.
5. **Shared infrastructure is Tenant-fair and adverse-first.** Per-Tenant and
   global admission, concurrency, queue, connection, memory, transform, and cost
   bounds protect current public truth and safety work before optional activity.
6. **The public path is generation-safe and bounded.** D1's compiled projection,
   structural cache identity, deterministic-success-only caching, precise
   revalidation, and one media-transform owner prevent request-time graph fan-
   out, cache collision, and variant explosion.
7. **Normal UX remains quiet and provider-free.** Staff see exact saved,
   preparing, released, verifying, verified, delayed, or failed facts with the
   last safe state and one cause-owned action. Visitors see no capacity UI unless
   a real component or service impairment affects them.
8. **Cost protection preserves access.** Provider meters map to product
   outcomes, optional work sheds first, and a provider-wide production pause is
   never the ordinary automatic bill-control response.
9. **Failure and rollback remain layered.** Application, content-generation,
   package, cache, database, search, and workflow recovery keep separate owners,
   compatibility proof, receipts, and rehearsed verification.
10. **No capacity claim precedes proof.** An empty cohort cell, stale provider
    attachment, missing route or failure scenario, unproved rollback, or failed
    invariant prevents activation and any launch or scale claim.

### Complete service-journey contract

Ordinary editors retain the familiar Page, Preview, and Release journeys with
receipt-derived save and publication states. Slow or overloaded work names the
last safe revision or live generation, explains whether work was durably
accepted, remains URL-addressable after navigation, and offers no blind Retry.
Infrastructure vocabulary, cost, provider controls, and comparative Tenant
activity remain absent from ordinary Web Studio.

Public visitors receive useful server-rendered content, native links, stable
media geometry, responsive behavior, reduced-motion respect, and source-owned
giving/form outcomes. Optional component failure stays local. A full public
failure uses one accessible Tenant-branded, provider-neutral unavailable page
with no provider identifier, unverified contact detail, guessed recovery time,
or automatic refresh loop.

Support starts from D30-safe product receipts and D31's derived impact, owner,
freshness, and recovery state. Only an authorized incident-bound operator may
inspect deeper Vercel evidence. Package developers receive exact artifact,
fixture, device/network, percentile, budget, and fallback evidence without
access to Tenant operations or production secrets.

### Adversarial disposition

Every required category contains a material concern: brittleness, technical
debt, edge cases, footguns, Tenant safety, overengineering, UX/UI friction,
hidden coupling, failure modes, data integrity, security/privacy,
scalability/performance, operational burden, observability, dependency and
integration risk, migration/upgrade risk, and concurrency/deployment hazards.
The complete review found C-prime sound only with the exact 36-clause hardening
above.

Ratification therefore does not approve provider settings as product truth,
unmeasured scale claims, cache or deployment authority, automatic production
shutdown, Tenant quotas or rankings, per-Tenant Vercel projects, active-active
multi-cloud, speculative replicas/sharding, a second workflow/health/incident
platform, or raw provider controls for ordinary staff.

### Required proof inherited by the eventual specification

1. Fill every minimum, typical, and measured-maximum cohort cell from current
   ratified bounds, design-partner distributions, and production-shaped data;
   record fixture, growth horizon, evidence date, and safety reserve.
2. Create the exact Vercel Qualification Attachment with effective plan,
   topology, regions/failover, Function, cache, image, build, telemetry,
   protection, spend, Supabase, Inngest, dependency, and configuration-drift
   evidence.
3. Prove D1 generation-safe public reads, structural cache identity,
   deterministic-success-only caching, precise adverse-aware invalidation, and
   absence of private/error/cross-Tenant shared-cache leakage.
4. Prove bounded Function, Postgres, Payload, Inngest, search, media, import,
   schedule, and publication work under sustained, burst, cold, correlated-peak,
   noisy-neighbor, bot, partial-outage, recovery, and rollback scenarios.
5. Prove per-Tenant and global fairness, finite connection and memory budgets,
   bounded queries/batches/variants, non-lossy required effects, and deliberate
   overload before provider or database collapse.
6. Establish production-mode public and staff lab evidence, privacy-reviewed
   field Core Web Vitals, sparse-sample handling, higher-tail diagnostics,
   accessibility proof, and complete donor/staff/recovery moderated journeys.
7. Normalize Vercel, Supabase, Inngest, database, storage, and external-provider
   usage to bounded product outcomes; establish evidence-backed budgets,
   variance thresholds, alerts, owners, and tested response paths.
8. Prove layered application/content/package/cache/database/search/workflow
   rollback compatibility and recovery without rewriting product history or
   treating provider recovery as content truth.

### Evidence and architectural record

- [D33 exact formulation and decision brief](./research/phase-23-d33-production-capacity-envelope-decision-brief.md)
- [D33 Vercel primary-source research](./research/phase-23-d33-vercel-capacity-primary-source-research.md)
- [D33 complete 17-category adversarial review](./research/phase-23-d33-production-capacity-adversarial-review.md)
- [D33 complete UX and service journey](./research/phase-23-d33-production-capacity-ux-journey.md)
- [ADR-0177 — Provider-neutral Production Capacity Profile with Vercel qualification](../../adr/0177-provider-neutral-production-capacity-profile-and-vercel-qualification.md)

The complete quoted formulation above is the founder-ratified D33 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, code,
schema/RLS, data repair, migration/backfill, dependency or provider change,
Vercel setting, telemetry activation, issue or specification publication, Git
publication, deployment, production access, D1 activation, or release.

Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack. D33's canonical
terms are preserved here and in ADR-0177 without overwriting accepted Phase 22
language.

### Remaining grooming coverage

D1–D33 do not yet decide the exact qualified Payload version or the complete
current-implementation migration and cutover posture from section 46. Any
additional migration/cutover proof not already settled by D29–D33 remains an
evidence-backed implementation obligation rather than an implicit new product
authority. Remaining founder decisions will be resolved one at a time.

## D34 — Payload v4 major-line commitment and production admission

**Status:** Founder-ratified on 2026-08-24 after official npm and Payload
GitHub/documentation research, an implementation-time discovery and
qualification contract, repository-seam inspection, and a ruthless 17-category
adversarial review.

### Exact ratified formulation

<!-- prettier-ignore -->
> **B-prime-R — Payload v4 major-line commitment with live release discovery,
> exact-cohort qualification, and release-bound production admission**
>
> 1. **Payload v4 major line.** Phase 23 commits the Web Studio content-engine
>    boundary to Payload major version 4.
> 2. **Bounded major.** D34 authorizes neither a temporary Payload v3 production
>    detour nor an unreviewed jump to v5.
> 3. **No timeless numeric pin.** D34 does not permanently select a numeric
>    Payload version on the ratification date.
> 4. **Current pin is evidence only.** Core's current
>    `4.0.0-internal.1f9ae9a` cohort remains development-spike evidence, not an
>    automatically admissible production baseline.
> 5. **Work may proceed.** Implementation may continue against one exact pinned
>    v4 prerelease while its production qualification remains pending.
> 6. **Two live discoveries.** Every implementing agent must rediscover Payload's
>    current v4 release state when the task starts and again immediately before
>    dependency lock or production promotion.
> 7. **Official-source research.** Discovery must use live official npm registry
>    metadata; Payload GitHub releases, tags, source, security information,
>    applicable issues and pull requests; the exact candidate's source identity;
>    and current official v4 release and migration documentation. Model memory,
>    old ticket text, this dated snapshot, and the existing lockfile are not
>    current-release evidence.
> 8. **Labels are hints.** `latest`, `canary`, `beta`, `next`, `internal`, GitHub
>    tag names, and documentation branch names are discovery inputs, never
>    dependency specifications or approval.
> 9. **Stable definition.** A stable v4 candidate is an installable npm `4.x`
>    artifact with no SemVer prerelease component, reviewable source provenance,
>    and the complete required first-party package family.
> 10. **Stable supersedes prerelease.** If any supported stable v4 exists, the
>     prerelease lane closes and the newest eligible stable v4 becomes the first
>     candidate. If that patch has a demonstrated applicable blocker, the next
>     supported stable may be selected with the reason recorded.
> 11. **Prerelease order.** Only when stable v4 does not exist may the newest
>     coherent, officially published and documented public v4 release candidate,
>     beta, or canary be considered, in that maturity order.
> 12. **Internal-build exception.** An `internal`, debug, commit-preview, or
>     unadvertised build is never preferred because Core already uses it. It
>     requires a named upstream defect it uniquely fixes, reproducible source
>     identity, complete closure, explicit release-owner exception, full
>     qualification, and automatic expiry when an official public candidate
>     contains the fix.
> 13. **Tag is not artifact.** A GitHub tag without an installable matching npm
>     artifact and complete cohort is not a production candidate.
> 14. **Artifact is not enough.** An npm artifact without reviewable source
>     identity and coherent official release evidence is not a production
>     candidate.
> 15. **Exact immutable selection.** Manifests, lockfiles, builds, deployments,
>     and runtimes use exact versions. Floating tags, ranges, forced peers, mixed
>     channels, and inferred commit mappings are prohibited.
> 16. **Lockstep first-party cohort.** `payload` and every required first-party
>     package—including Postgres, Next, UI, Lexical, email, storage, and their
>     Payload peers—must form one complete matching version/channel tuple.
> 17. **Artifact identity record.** The qualification record captures exact
>     versions, publication time, deprecation/support state, tarball and integrity,
>     signatures/provenance when available, source ref, release/migration notes,
>     license/advisory disposition, engines, peers, dependencies, and lockfile
>     digest.
> 18. **Release-time concern.** Candidate discovery is a release process, not a
>     runtime version selector, automatic upgrade service, Tenant choice, or
>     ordinary staff setting.
> 19. **Freeze during proof.** Qualification freezes one exact candidate so new
>     upstream publishing cannot mutate an in-progress proof.
> 20. **Promotion recheck.** Immediately before promotion, the release owner
>     rechecks stable availability, artifact availability, deprecation/withdrawal,
>     advisories, source provenance, and material official guidance. A new release
>     never causes automatic deployment.
> 21. **Stable still qualifies.** Stable status reduces upstream churn but waives
>     none of Core's qualification gates.
> 22. **Prerelease admission.** If no stable candidate exists at promotion, one
>     exact public prerelease may be promoted only after the same complete
>     qualification and with residual support/churn risk, owner, approver, expiry,
>     review date, security path, stable-upgrade trigger, and retirement plan
>     recorded.
> 23. **Fail closed.** A failed candidate blocks promotion. It never silently
>     falls back to Payload v3, the old internal spike, stock Payload Admin, mixed
>     packages, or dual authority.
> 24. **Whole runtime qualifies.** The exact Node, Bun/package-manager, React,
>     Next, TypeScript, GraphQL, Postgres/Drizzle, Supabase, Vercel, Lexical,
>     email, storage, and plugin closure is part of qualification.
> 25. **Generated artifacts qualify.** Payload types, import map, resolved config,
>     database schema, migration files, and their reproducible digests are
>     qualification artifacts.
> 26. **Gap-led plugins.** Every plugin or adapter must close a proven product
>     gap and undergo the same schema, security, migration, performance, UX, and
>     removal qualification. Version alignment alone does not admit it.
> 27. **Payload remains machinery.** Asym domain terms, identifiers, permissions,
>     workflow state, public contracts, and audit meaning never become Payload-
>     specific authority.
> 28. **D1 remains public authority.** D1's immutable Site generation remains
>     the only public-content authority; no version upgrade restores mutable
>     Payload reads to the public request path.
> 29. **Supabase/Asym remain staff authority.** Supabase Auth and Asym
>     authorization remain authoritative; Payload roles, sessions, access
>     defaults, and raw Admin never become staff authority.
> 30. **Explicit user-context operations.** User-context Local API and equivalent
>     operations explicitly state access, lock, Tenant, locale, draft, fallback,
>     `select`, `depth`, sort, limit, and pagination behavior rather than inheriting
>     provider defaults.
> 31. **Negative tenant and privacy proof.** Qualification includes fail-closed
>     cross-Tenant, draft/version, Preview, restricted-media, raw-endpoint,
>     diagnostic, REST/GraphQL, hook, job, plugin, and Local API negative tests.
> 32. **Data and restore proof.** Clean installation and every retained
>     predecessor upgrade must pass on production-shaped data with control totals,
>     relationship closure, Tenant ownership, locale/version lineage, rich-text/
>     media reconciliation, and complete row-plus-byte backup restoration.
> 33. **Serialized safe migrations.** Production migrations use one authority,
>     Postgres advisory locking, immutable applied files, content hashes,
>     execution receipts, and expand/migrate/verify/activate/contract stages.
>     Destructive `down`, `refresh`, `reset`, and `fresh` are not ordinary
>     recovery.
> 34. **Product-shaped qualification.** The candidate passes D33 capacity, cost,
>     failure, and recovery cohorts plus real Web Studio journeys: autosave,
>     conflict/reconnect recovery, history, Preview, release, localization,
>     schedules, media, forms, search, Trash, keyboard/screen-reader use,
>     accessibility, reflow, mobile, and restoration of prior context.
> 35. **Quiet ordinary UX.** Ordinary staff receive no Payload version setting,
>     channel badge, migration dashboard, provider log, compatibility matrix, or
>     upgrade ceremony. Healthy engine qualification is invisible.
> 36. **Calm affected UX.** If authoring is actually affected, staff receive one
>     calm Site-scoped notice with the exact local maintenance state,
>     confirmation that the public Site remains live on its last safe D1
>     generation and acknowledged work is protected, no guessed progress or
>     provider jargon, one cause-owned recovery path, and automatic return to the
>     same Web Studio context after success. Privileged evidence remains in D30;
>     only actionable product health appears through D31.

### Binding interpretation

1. **The durable promise is Payload v4, not today's prerelease.** Numeric
   versions in current research are dated facts. Future agents must rediscover
   live official state and must qualify stable v4 if it exists.
2. **One exact release cohort earns admission.** An npm package name, dist-tag,
   GitHub tag, release note, or successful build cannot qualify production by
   itself; artifact, source, documentation, runtime, first-party package, plugin,
   generated-artifact, schema, migration, and security evidence must agree.
3. **Discovery happens twice, but upgrades are never automatic.** Task-start
   discovery chooses the candidate. Release-freeze discovery catches stable
   availability, withdrawal, deprecation, advisory, provenance, or guidance
   changes without creating an endless moving-target upgrade loop.
4. **Payload remains replaceable machinery.** D1, Supabase Auth, Asym
   authorization, source-owned product state, public projections, and audit
   meaning remain authoritative.
5. **Migration and product cutover remain separate.** D34 qualifies the engine;
   D35 must still classify hosted state and govern transformation, shadow proof,
   write pause, activation, rollback retention, and compatibility retirement.
6. **Production proof is whole-product proof.** Tenant isolation, drafts,
   versions, Preview, localization, media, forms, search, schedules, imports,
   D1 equivalence, Web Studio accessibility, D33 capacity/cost, and row-plus-byte
   recovery all qualify the exact cohort.
7. **Failure preserves the last safe state.** No failed candidate, migration, or
   promotion restores Payload v3, the current internal spike, raw Admin, mutable
   public reads, or dual authority.
8. **Ordinary staff never manage an engine upgrade.** Healthy operation is
   invisible; actual bounded authoring impact receives one calm, truthful,
   Site-scoped notice and return to prior context.

### Future-agent contract

Every implementation specification and ticket must tell a fresh agent that its
recorded version strings may be stale. At task start and release freeze, the
agent must inspect official npm metadata and bytes plus Payload's GitHub
releases, tags, exact source, security evidence, applicable issues/pull requests,
and exact-version v4 migration/release documentation. It must create one
immutable Payload Engine Qualification Record, prefer stable v4 whenever
available, pin the complete exact cohort, run strict no-skip qualification, and
stop rather than guess when official evidence is ambiguous or incomplete.

### Adversarial disposition

Every required category contains a material concern under literal Option B:
brittleness, technical debt, edge cases, footguns, Tenant safety,
overengineering, UX/UI friction, hidden coupling, failure modes, data integrity,
security/privacy, scalability/performance, operational burden, observability,
dependency/integration risk, migration/upgrade risk, and other development
hazards. The exact 36 clauses make the direction sound without creating a
runtime upgrade service, permanent multi-version abstraction, or additional
staff dashboard.

### Evidence and architectural record

- [D34 exact formulation and decision brief](./research/phase-23-d34-payload-v4-production-admission-decision-brief.md)
- [D34 primary-source research](./research/phase-23-d34-payload-v4-production-admission-primary-source-research.md)
- [D34 complete 17-category adversarial review](./research/phase-23-d34-payload-v4-production-admission-adversarial-review.md)
- [D34 future-agent discovery and qualification contract](./research/phase-23-d34-payload-v4-future-agent-discovery-and-qualification-contract.md)
- [ADR-0178 — Payload v4 major-line commitment and release-bound production admission](../../adr/0178-payload-v4-major-line-commitment-and-release-bound-production-admission.md)

The complete quoted formulation above is the founder-ratified D34 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no implementation, dependency
change, schema/RLS work, migration/backfill, data repair, issue/specification
publication, Git publication, deployment, hosted-data access, production
promotion, D1 activation, or release.

Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack. D34's canonical
terms remain preserved here and in ADR-0178 without overwriting accepted Phase
22 language.

### Remaining grooming coverage

D35 must resolve section 46's current-state census and replacement boundary:
what existing hosted Payload/Supabase rows and objects are fixtures, retained
content, configuration, generated state, secrets, or unsafe accidents; how
retained state is transformed and reconciled; how old/new reads and writes are
shadowed; when one bounded write pause is allowed; which authority activates;
how rollback preserves current product safety without reviving the old CMS; and
when compatibility is proven dead and removed. This remains one founder
decision at a time.

## D35 — Census-gated clean target and one-authority pre-production replacement

**Status:** Founder-ratified on 2026-08-24 after current implementation and
provider-source research, a complete operator/staff/public journey, three
independent engineering/source/UX audits, and a ruthless 17-category
adversarial review.

### Exact ratified formulation

<!-- prettier-ignore -->
> **C-prime-amended-and-hardened (C-prime-R) — census-gated clean target with
> selective retained-state transformation and one-authority cutover.**
>
> 1. Core is pre-production at this decision point. D35 is not a live-customer
>    migration; if any environment becomes production or receives real
>    customer reliance before replacement, destructive work stops and D35's
>    cutover posture must be revalidated rather than silently reusing this
>    simplified procedure.
> 2. “Cutover” means one intentional repository, schema, writer, reader, and
>    public-authority replacement before launch—not a public traffic migration
>    or Tenant-operated event.
> 3. The current Payload/Web Studio implementation is useful evidence and
>    prototype learning, but it is not target product authority and creates no
>    obligation to preserve obsolete names, shapes, IDs, routes, flags, or
>    provider defaults.
> 4. The only target is the ratified D1–D34 model running on the exact Payload
>    v4 cohort admitted under D34; D35 may not weaken any prior ownership,
>    release, locale, route, media, form, search, health, or authorization
>    contract to simplify conversion.
> 5. Before any destructive action, one read-only census covers current source
>    code, CMS migrations, generated artifacts, fixtures, public readers, and
>    provider-stored workspace preferences or recent-item references that encode
>    legacy IDs, plus each explicitly named local or shared non-production
>    database and object store in scope.
> 6. Every command identifies the exact project, environment, database, schema,
>    and storage target; dry-run is the default, and unknown, ambiguous, or
>    production-classified targets are refused.
> 7. Every discovered item receives one plain disposition: discard confirmed
>    fixture/demo state, transform explicitly retained state, regenerate
>    derived state, or unresolved. Unresolved state blocks destructive action
>    only for the environment it could affect; it does not create a permanent
>    quarantine subsystem.
> 8. Retention is explicit and opt-in. Age, apparent realism, a familiar name,
>    a non-empty table, or an existing identifier never silently makes
>    prototype state authoritative.
> 9. Real donor, applicant, missionary, staff, authentication, session, token,
>    secret, or other sensitive state may not be promoted into repository
>    fixtures or committed exports. Synthetic identities are used for the
>    permanent development baseline.
> 10. Supabase Auth and Asym authorization remain the only identity and
>     permission authority. Payload users, roles, sessions, and credentials are
>     never migrated as competing authority; required CMS users are regenerated
>     as bounded projections.
> 11. An environment—or a narrowly isolated CMS namespace—proven disposable is
>     rebuilt directly from the clean target migrations and deterministic
>     target fixtures. A database-wide fresh/reset command is allowed only when
>     the whole target database is proven disposable; otherwise D35 changes only
>     its owned namespace. Neither path receives compatibility code or
>     per-record receipts for regenerated fixtures.
> 12. If deliberately retained non-production content exists, it is exported
>     before reset to an encrypted, git-ignored, short-lived manifest with
>     source identity, intended disposition, counts, relationships, byte
>     checksums where applicable, and a reviewed target interpretation.
> 13. The target model is designed cleanly from D1–D34. Legacy physical IDs are
>     preserved only when a ratified semantic identity or external route
>     obligation actually requires them; otherwise an ephemeral deterministic
>     old-to-new map is sufficient.
> 14. Before launch, the isolated Payload `cms` schema receives one reviewed,
>     clean v4 baseline that can build from an empty database. Obsolete CMS
>     baseline history may be replaced because it is pre-production; unrelated
>     Supabase application schemas and migrations are not rewritten.
> 15. Payload versions, drafts, relationship depth, access behavior, document
>     locking, and other behavior- or schema-affecting defaults are configured
>     explicitly for each target collection or global rather than inherited
>     accidentally from a prerelease or future v4 default.
> 16. Payload development schema push is limited to a proven disposable local
>     sandbox and is never mixed with committed migration execution. Every
>     shared environment uses reviewed migrations with schema push disabled.
> 17. Exactly one serialized actor applies migrations or the one-time transform
>     to a shared environment; concurrent agents and deployments may verify but
>     may not race authority-changing operations.
> 18. Retained state crosses a narrow, versioned semantic DTO boundary. A
>     disposable source exporter may know legacy Payload tables, but the target
>     importer consumes domain meaning and may not depend on legacy physical
>     schema.
> 19. The retained-state transformer exists only when the census proves a real
>     need. It is deterministic, idempotent, restartable from a clean target,
>     bounded by measured volume, and deleted after all named environments are
>     rebuilt and verified.
> 20. Imports use supported Payload/application and storage APIs. Transactional
>     nested writes pass the Payload request context; elevated system behavior
>     is explicit; notification, email, revalidation, search, and other external
>     side effects are suppressed narrowly and rebuilt deliberately—not skipped
>     through a blanket bypass.
> 21. Every retained record resolves through the canonical semantic keys
>     required by its ratified owning contract: Tenant and environment where
>     applicable, and Site, BCP-47 locale, page-family, or source owner only
>     when the entity is actually scoped by them. D27 Tenant-wide Media remains
>     Tenant-owned and its Site-use qualification remains a relationship, not
>     invented Site ownership. Cross-Tenant, cross-environment, cross-Site, or
>     cross-locale relationships fail closed unless a ratified contract
>     explicitly permits them.
> 22. Duplicate or case-colliding paths, ambiguous navigation links, missing
>     relationships, unsupported block or Lexical nodes, orphaned versions,
>     incomplete locale lineages, and draft/public ambiguity produce named,
>     actionable failures; conversion never invents a winner or silently falls
>     back.
> 23. Missionary, project, ministry-update, contribution, form-submission, and
>     other source-owned facts remain owned by their established domains.
>     Retained CMS state becomes references or editorial presentation under the
>     ratified contracts, never copied operational authority.
> 24. Drafts, versions, schedules, locale lineages, routes, redirects, and
>     navigation are retained only when explicitly selected and representable
>     without weakening D1–D34. Anything that cannot be represented is resolved
>     before execution, not hidden in a compatibility field.
> 25. Fixture media is regenerated. Retained media requires both metadata and
>     verified bytes, transferred through supported provider APIs under D27;
>     database rows, backups, or storage metadata alone are not proof of
>     custody.
> 26. Search projections, renditions, Used-in references, Content Health,
>     caches, sitemaps, generated public artifacts, and D1 Public Site
>     Generations are rebuilt from target authority rather than copied as
>     retained truth.
> 27. Target fixtures contain data only, use deterministic Tenant/Site/locale/
>     source/route identities and relationships, distinguish minimal invariant
>     fixtures from optional demos, and have explicit reset-only or genuinely
>     idempotent rerun semantics.
> 28. Payload types, JSON Schema, import maps, migration manifests, and other
>     generated artifacts are regenerated from the admitted exact cohort and
>     target config; CI proves regeneration produces no uncommitted drift.
> 29. Replacement occurs offline against disposable or deliberately prepared
>     non-production environments. There are no application dual writes, two
>     editable CMS authorities, or public traffic shadow paths.
> 30. D35 builds no CDC, logical replication, final-delta reconciler,
>     per-Tenant CAS authority pointer, live-editor drain, maintenance
>     countdown, permanent migration dashboard, generic ETL registry, or
>     horizontally scalable migration worker without measured evidence and a
>     new production decision.
> 31. Preparatory target-only changes may land without acquiring runtime
>     authority. One final bounded integration sequence switches every Web
>     Studio writer, public reader, Preview path, compiler input, script, and
>     test to the target, then removes the current mutable public readers,
>     stock-Admin fallbacks, collection-specific native flags, literal-path
>     authority, and legacy content fallback before D35 closes. Provider recent-
>     item and workspace preferences are discarded or re-keyed only by an exact
>     surviving semantic identity—never a fuzzy match. UI flags never define
>     canonical authority.
> 32. Before target acceptance, failure recovery is export preservation where
>     needed, clean reset, deterministic rerun, and re-verification. A partially
>     rebuilt environment is never marked usable, and recovery never requires
>     resurrecting a second runtime authority.
> 33. Ordinary staff never see D35's internal repository-replacement concepts,
>     retain manifests, physical mapping tables, maintenance controls,
>     compatibility screens, or provider jargon; D29's separate governed staff
>     portability journey remains intact. Staff encounter only the polished
>     target Web Studio: purposeful empty states or correctly retained content,
>     template-led starts, clear draft/save/publish meaning, equivalent desktop
>     and mobile navigation, accessible feedback, and no mystery about what is
>     public.
> 34. Shared test environments quietly and persistently identify themselves as
>     resettable; operator output uses named stages, exact counts, actionable
>     exceptions, and accessible status announcements rather than noisy alerts,
>     fake percentages, or guessed completion times. Console output, machine
>     reports, and CI artifacts are access-bounded, short-lived, and redacted;
>     they never emit content bodies, personal data, secrets, credentials,
>     tokens, or signed URLs.
> 35. Acceptance proves empty-database boot, deterministic fixtures, any
>     selected transform, Tenant and permission isolation, draft exclusion,
>     route and locale correctness, relationship closure, media bytes and
>     checksums, generated-artifact cleanliness, D1 compilation, public output,
>     final Web Studio journeys, equivalent desktop/mobile task completion,
>     keyboard and focus behavior, screen-reader status, reflow, touch targets,
>     reduced motion, and D33 performance/recovery budgets.
> 36. D35 is complete only when a fresh clone plus empty database can produce
>     the complete target system and every legacy schema, collection, route,
>     reader, writer, flag, fallback, adapter, fixture contract, transform, and
>     runtime dependency has zero use and is removed. Git history and compact
>     evidence remain; legacy runtime architecture does not.

### Binding interpretation

1. **This is a pre-production replacement, not a live migration product.**
   Core spends rigor on the permanent target and on proving safe destruction,
   not on simulating production continuity that does not exist.
2. **Current implementation is evidence, not authority.** Prototype collections,
   IDs, routes, flags, tests, preferences, and provider defaults survive only
   when a ratified semantic or external-route obligation actually requires it.
3. **Census precedes destruction and retention is opt-in.** Confirmed fixtures
   regenerate, derived state rebuilds, deliberately retained state transforms
   once, and unresolved state blocks only its affected environment.
4. **D1–D34 remain intact.** D34 qualifies the exact engine; D1 owns public
   generations; Supabase Auth/Asym authorization own staff access; source
   domains own operational truth; D27 owns Tenant-wide Media custody and Site-
   use qualification.
5. **One target authority finishes the work.** Preparatory target-only changes
   cannot acquire runtime authority. One bounded final sequence switches every
   seam and removes all legacy and temporary runtime paths before D35 closes.
6. **Safety is explicit but temporary machinery is minimal.** Exact target
   identity, dry-run, redacted output, supported APIs, deterministic rerun, and
   complete verification are mandatory; CDC, dual writes, migration dashboards,
   generic ETL, and compatibility platforms are prohibited.
7. **The replacement is invisible to ordinary staff.** D29 portability, D30
   diagnostics, and D31 health remain separate. Staff receive only the final
   accessible, responsive, provider-free Web Studio.
8. **The non-production premise is revalidated.** If production or real customer
   reliance appears before execution, destructive work stops and the cutover
   posture is decided again.

### Future-agent contract

Every implementation specification and ticket must tell a fresh agent to
revalidate environment status and identity, run D34's live Payload v4 discovery,
perform the read-only census, classify every material artifact/state, and build
the clean D1–D34 target from an empty database. It may create a one-time semantic
transformer only for a reviewed non-empty retain manifest. It must use supported
Payload/application/storage APIs, preserve ratified scope and ownership, rebuild
derived projections, switch authority once, delete every legacy/temporary path,
and prove fresh-clone reproducibility plus the complete security, UX,
accessibility, capacity, and recovery gates. It must stop rather than guess when
environment identity, ownership, sensitivity, relationships, routes, locale
lineage, or byte custody is unresolved.

### Adversarial disposition

The literal direction exposed material concerns in brittleness, technical debt,
edge cases, footguns, Tenant safety, overengineering, UX/UI friction, hidden
coupling, failure modes, data integrity, security/privacy, operational burden,
observability, dependency/integration risk, migration/upgrade risk, and other
development hazards. The one-time replacement mechanism has no material
scalability concern after hardening; measured retained media is streamed and
bounded while permanent runtime scale remains D33's responsibility. The exact
36 clauses close the material risks without introducing a live migration
platform.

### Evidence and architectural record

- [D35 exact formulation and decision brief](./research/phase-23-d35-current-implementation-replacement-decision-brief.md)
- [D35 current implementation and primary-source research](./research/phase-23-d35-current-implementation-census-and-cutover-research.md)
- [D35 complete 17-category adversarial review](./research/phase-23-d35-current-implementation-replacement-adversarial-review.md)
- [ADR-0179 — Census-gated clean target and one-authority pre-production replacement](../../adr/0179-census-gated-clean-target-and-one-authority-pre-production-replacement.md)

The complete quoted formulation above is the founder-ratified D35 authority.
The binding interpretation and supporting research explain it but do not
independently expand it. Ratification authorizes no runtime implementation,
dependency change, schema/RLS change, reset, migration, data export/import,
hosted-data access, issue/specification publication, Git publication,
deployment, D1 activation, or production promotion.

Root `CONTEXT.md` synchronization remains held until the Phase 22 documentation
stack is merged or Phase 23 becomes an explicit reviewed stack. D35's canonical
terms remain preserved here and in ADR-0179 without overwriting accepted Phase
22 language.

### Remaining grooming coverage

The post-D35 completeness audit maps every substantive source-prompt decision
area in sections 17–46 to D1–D35 and confirms the named downstream seams without
adding a generalized integration surface. Source-prompt sections 66–67 remain
mandatory testing and evidence input for the eventual specification, translated
through the ratified decisions rather than copied as conflicting legacy
architecture. Their complete durable carry-forward is the
[Phase 23 closure testing, evidence, and issue-readiness checklist](./research/phase-23-closure-testing-evidence-and-issue-readiness-checklist.md).

The founder ratified the formal Phase 23 closure and scope freeze as D36. The
complete exact authority follows. Phase 23 grooming is no longer active.

## D36 — Formal Phase 23 decision closure and evidence-gated handoff

**Status:** Founder-ratified on 2026-08-24 after the complete D1–D35 coverage,
downstream-ownership, scenario, failure, testing, evidence, and issue-readiness
audit.

### Exact ratified formulation

<!-- prettier-ignore -->
> **A-prime-R — formal Phase 23 decision closure with frozen D1–D35 authority, owner-bounded downstream seams, and evidence-gated handoff.**
>
> 1. Phase 23 D1–D35 are the complete founder-ratified product and architecture contract for Web Studio/CMS grooming.
> 2. D1–D35 are frozen at closure; only a later explicit numbered founder amendment may change, supersede, or reopen them.
> 3. The original Phase 23 prompt remains discovery and evidence input, but a ratified decision controls wherever an option, assumption, example, or old recommendation conflicts with D1–D35.
> 4. Every substantive source-prompt decision area in sections 17–46 is classified as ratified through D1–D35; no CMS feature decision remains silently unresolved.
> 5. Features assigned to later phases are explicitly deferred to those owners and are not missing Phase 23 scope.
> 6. Phase 22 specialized public ministry records retain their ratified source, revision, locale, review, privacy, and release authorities; Phase 23 consumes only their exact qualified public projections and presentation seams.
> 7. Phase 24 retains full Site, host, locale, fallback-policy, and currency settings UX; Phase 23 remains Site- and locale-ready through the exact contracts already ratified.
> 8. Phase 25 retains donor-private and authenticated donor experiences; D24's one exact public audience remains the Phase 23 launch boundary.
> 9. Phase 26 retains Support Hub conversation and intake truth; D26 may invoke only a certified domain-owned destination and never creates a second inbox.
> 10. Phase 27 retains appeal, cultivation, and Source Code truth, and Phase 28 retains missionary-workspace ownership; public references or proposals never transfer those authorities into Payload.
> 11. Phase 29 retains generalized file-byte and document lifecycle ownership while D27 retains only the bounded public-media catalog and Site-use qualification already ratified.
> 12. Phase 30 retains the general import and migration product; D29 remains the bounded content-portability and private-draft contract.
> 13. Phase 31 retains public API, connector, webhook, and external-integration governance; raw Payload REST, GraphQL, Local API, hooks, or database access never become Asym downstream contracts.
> 14. Phase 33 may consume only governed, purpose-minimal read models and receipts; reporting never becomes content, permission, or publication truth.
> 15. Phase 34 retains configurable workflow ownership; Phase 23 ships only the fixed editorial, release, schedule, and cause-owned recovery lifecycles already ratified.
> 16. Phases 36 and 37 retain fundraiser, event, opportunity, application, lifecycle, and moderation truth; Phase 23 may later render only certified public-safe source projections through D1, D9, D14, and D26.
> 17. Phase 38 restricted/member-care content remains unavailable to ordinary Pages, generic blocks, public search, public forms, and public caches.
> 18. Phase 39 may later add bounded offline resilience, but publication, release, permission, and destructive CMS actions remain online and server-confirmed.
> 19. Phase 40 may create evidence-linked suggestions, but no AI or Payload MCP process writes, approves, or publishes directly; a human-authorized action must invoke a freshly authorized typed Asym command.
> 20. A later phase activates only the smallest versioned, purpose-qualified owner contract needed by a real consumer; Phase 23 creates no speculative universal integration catalog, event bus, workflow DSL, BI layer, AI writer, placeholder tables, or dormant staff controls.
> 21. Healthy downstream machinery stays quiet; when Web Studio consumes a certified owner capability available in the current scoped context, it uses plain task language and a clear permission-aware handoff to its owning Asym surface when needed, while setup, credentials, mappings, lifecycle, and raw diagnostics remain with that owner.
> 22. An uncertified capability is absent; an unauthorized capability is existence-safe and absent; a certified capability that an authorized user may configure but that is not ready may appear truthfully unavailable with a clear owner-native next action. None is simulated, silently degraded, or exposed as provider jargon, and public visitors see only released safe behavior or the task-specific fallback already ratified by the owning decision.
> 23. D35 completely classifies the repository and current-source patterns as evidence or legacy implementation to retire—never target authority; each named target's hosted row/object state remains an implementation-time qualified-review gate requiring a read-only census and explicit disposition before destructive action.
> 24. D34 closes the decision contract for future live implementation-time discovery and production admission: no Payload v4 cohort is selected or qualified by grooming, and implementation must prefer stable v4 when available, pin and qualify one exact cohort, enforce the upgrade and plugin policy, preserve the last safe D1 public state when qualification or admission fails without restoring v3, internal, or dual authority, and prove enterprise-feature independence.
> 25. Source-of-truth closure is complete for content, Pages, placement, hierarchy, Navigation, redirects, schedules, dynamic sources/lists, search, forms, media, authorization, audit evidence, public serving, health, and replacement.
> 26. The ordinary Page, landing Page, Article, Reusable Section, Phase 22 Page, multisite, multilocale, move, slug, Navigation, redirect, schedule, dynamic list, search, form, Trash/restore, Preview, media, and emergency-action scenarios are all bound to named ratified decisions.
> 27. Every state-changing implementation ticket must preserve its ratified source owner, exact scope, current capability reproof, expected revision or sealed input, idempotency, partial-failure posture, retry/repair path, audit/receipt boundary, and adverse-first public safety.
> 28. The repo-tracked [Phase 23 closure testing, evidence, and issue-readiness checklist](./phase-23-closure-testing-evidence-and-issue-readiness-checklist.md) preserves source-prompt section 66 as mandatory testing input for the eventual spec, translated through D1–D35 rather than copied as conflicting legacy architecture.
> 29. D35 testing proves clean-target reproducibility and any census-selected temporary retained-state transform, when required; it does not reintroduce an in-place production upgrade, shadow cutover, permanent ETL framework, or second authority.
> 30. D22 localization tests prove explicit translation starts and no silent field fallback; D1 release tests prove the ratified capability/review evidence and activation rules without inventing a configurable approval engine.
> 31. Future-owner integration tests run only after a real certified owner contract exists; an absent future product remains unavailable rather than mocked or claimed complete.
> 32. The same repo-tracked checklist preserves source-prompt section 67 as mandatory evidence input, including isolation, draft-leak, access, accessibility, performance, recovery, editor-usability, operator-repair, known-limitations, deferred-feature, and vendor-qualification proof.
> 33. Built, Live, and Confirmed remain separate evidence states; no documentation, schema, unit test, fixture, preview, or provider capability alone may claim the Phase 23 product complete or live.
> 34. The future specification and tracer-bullet tickets must preserve the exact decision terminology, clause-level authorities, dependencies, negative cases, UX journeys, testing seams, and evidence gates without asking implementation agents to redesign the product.
> 35. This closure authorizes no runtime implementation, dependency change, schema/RLS change, reset, migration, hosted-data access, issue publication, Git publication, deployment, D1 activation, production promotion, or root `CONTEXT.md` overwrite.
> 36. After ratification, the grill-with-docs session stops as complete and waits for an explicit founder invocation of `$to-spec`; any later contradiction requires a new explicit founder amendment rather than a silent documentation edit.

### Binding interpretation

1. **The decision set is complete and frozen.** D1–D35 are the complete founder
   contract for Phase 23 and change only through an explicit numbered founder
   amendment.
2. **Later owners remain later owners.** Phase 23 consumes only certified,
   purpose-qualified public projections, commands, and receipts. It creates no
   generic integration, workflow, reporting, AI, or provider-facing control
   plane.
3. **Unavailable stays honest and quiet.** Uncertified and unauthorized
   capabilities are existence-safe and absent. An authorized but unready
   certified capability may provide only a clear owner-native next action.
4. **D34 and D35 remain implementation-time gates.** Grooming selected no exact
   Payload cohort and inspected no hosted target state. Qualification, census,
   and disposition must still happen before implementation or destruction.
5. **Testing and evidence are binding inputs.** The durable closure checklist
   preserves the source prompt's full test, evidence, and issue-readiness
   package, translated through D1–D35.
6. **Documentation is not deployment evidence.** Built, Live, and Confirmed are
   distinct, and no spec, fixture, schema, unit test, or provider feature alone
   proves a live capability.
7. **Closure does not authorize implementation.** Runtime, dependency,
   schema/RLS, migration, hosted-data, deployment, and production actions
   require later explicit authority.
8. **The next workflow is separately authorized.** The founder invoked
   `$to-spec` in the same message that ratified D36. That invocation authorizes
   specification synthesis and issue publication only.

### Evidence and architectural record

- [D36 exact formulation and closure brief](./research/phase-23-d36-formal-decision-closure-brief.md)
- [D36 decision completeness and closure research](./research/phase-23-d36-decision-completeness-and-closure-research.md)
- [Phase 23 closure testing, evidence, and issue-readiness checklist](./research/phase-23-closure-testing-evidence-and-issue-readiness-checklist.md)
- [ADR-0180 — Formal Phase 23 decision closure and evidence-gated handoff](../../adr/0180-formal-phase-23-decision-closure-and-evidence-gated-handoff.md)

The complete quoted formulation above is the founder-ratified D36 authority.
The binding interpretation and supporting research explain it but do not expand
it. Phase 23 grooming is formally complete. The founder's separate explicit
`$to-spec` invocation starts specification synthesis and issue publication; it
does not weaken any D36 runtime prohibition.
