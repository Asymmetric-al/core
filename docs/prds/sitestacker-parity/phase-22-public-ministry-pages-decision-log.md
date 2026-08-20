# Phase 22 Public Ministry Pages — Grooming Decision Log

This is the scope-frozen decision record for the completed Phase 22
`grill-with-docs` session. It supports the canonical
[Phase 22 PRD](./phase-22-public-ministry-pages.md) and active
[`add-public-ministry-pages` OpenSpec change](../../../openspec/changes/add-public-ministry-pages/proposal.md);
it is not itself the implementation specification, issue set, or authorization
to build.

- **Grooming status:** closed and scope-frozen at founder-ratified D1–D27 on
  2026-08-14; no D28 is opened.
- **Specification status:** `/to-spec` and `/to-tickets` were subsequently
  completed. The linked PRD/OpenSpec package is implementation-ready planning,
  and parent specification issue
  [#1281](https://github.com/Asymmetric-al/core/issues/1281) owns the approved
  41-ticket graph, #1282–#1322, with 117 native blocking relationships.
  P22-01/#1282 alone among the 41 implementation children is the current
  `ready-for-agent` frontier. Phase 22 is not implemented, deployed, or live;
  the live issue graph does not alter any historical decision recorded below.

## D1 — Typed Public Ministry Pages and dashboard-native contribution

**Status:** Ratified and adversarially hardened on 2026-08-03.

> **C-prime-amended-and-hardened (C-prime-R) — two tenant-owned typed Public
> Ministry Page families under one shared, versioned Publication contract:
> Missionary Ministry Pages and Project/Campaign Pages; with canonical Page
> Subject Bindings separated from non-authoritative Display Participants,
> explicit page-scoped Public Page Contributor Assignments, independently
> authoritative Page Release Authority, and exact Designation Bindings; where
> one tenant-confirmed operation assigning an eligible authenticated missionary
> as an editable ministry subject atomically materializes that person's
> contributor assignment so every and only authorized page appears in one quiet
> dashboard-native Public pages workspace; contributors may edit only bounded
> presentation content, propose safe media and updates, autosave, preview exact
> revisions, submit or withdraw changes, and respond to review feedback, while
> identity, safety, Designation and checkout, progress truth, Tenant, Legal
> Entity, Site, locale, route, contributor, publication-policy, and lifecycle
> controls remain tenant-governed; with separate logins for every contributor,
> immutable live and review revisions, one coherent working draft,
> current-assignment and base-version reproof, concurrency-safe recovery,
> immediate evidence-preserving revocation, tenant-policy-controlled release,
> and non-waivable Phase 10 enforcement across every draft, preview, asset,
> metadata, notification, cache, restore, and publication path—without
> subject-derived runtime permission, display-participant access, shared
> accounts, broad missionary CMS roles, direct Payload-admin access, direct live
> mutation, financial-access inheritance, cross-tenant references, or
> contributor-controlled publication.**

### Binding interpretation

- A Missionary Ministry Page and a Project/Campaign Page remain distinct typed
  families while sharing one publication lifecycle and collaboration contract.
- A Page Subject Binding states what the page represents. A Display Participant
  may appear publicly but receives no page authority.
- The ordinary editable-subject setup writes both the subject fact and an
  explicit Public Page Contributor Assignment in one authorized operation. All
  later authorization checks evaluate the current Public Page Contributor
  Assignment, never the subject relation itself.
- Party, household, team, project, Support Assignment, finance, notification,
  donor-attribution, and Designation relationships do not infer page access.
- Each contributor retains a separate Party and authenticated principal. Shared
  credentials and a tenant-global `missionary_editor` role are prohibited.
- Page contributors work through one missionary-dashboard Public pages surface,
  not Payload Admin or the current operational-profile endpoint.
- Contributor fields are a bounded allowlist. Identity, safety, destination,
  progress, site/locale, route, grants, release policy, and lifecycle remain
  protected tenant controls.
- A Page Subject Binding, Display Participant, Contributor Assignment, spouse,
  household, teammate, project, Support Assignment, or Designation relationship
  never infers D6 visibility, metric, source, goal, currency, or period and never
  selects D7's exact Page Giving Binding.
- Save, submit, approve, publish, public visibility, checkout readiness, and
  cache propagation remain different facts even when summarized in one UI.

**D19 precision.** A Missionary Ministry Page's subject is one CRM-owned
Ministry Assignment, not the eligible missionary Party. Its ordinary setup may
explicitly create the subject binding, selected Party's Ministry Assignment
Participant Membership, Display Participant, and Public Page Contributor
Assignment in one authorized local operation, but none is inferred from
another. Only the current Contributor Assignment grants bounded editing. A
Project/Campaign Page continues to use D17's separately typed subject arms.

### Adversarial hardening

- Exact Tenant, Legal Entity, Site, page, principal, capability, effective
  interval, status, and revocation scope is mandatory before enumeration or
  mutation.
- Revocation blocks future reads, drafts, previews, uploads, submission,
  notifications, and queued work while preserving attributed history and
  quarantining unfinished work for authorized disposition.
- Published revisions and submitted review snapshots are immutable. Concurrent
  work uses locks plus current base-version comparison; no silent last-write
  wins or unsafe restore is permitted.
- Payload Local API calls from the collaboration boundary must carry the
  authenticated actor and enforce access and document locks. A service role or
  Payload default is not user authority.
- Phase 10 safety applies to every visible and hidden publication egress,
  including drafts, previews, assets, metadata, social output, notifications,
  caches, restored revisions, and public rendering.
- Phase 3/10/12 authorization and projection foundations are release gates. The
  current direct profile save, name-derived worker URL, copied CMS profile
  fields, and raw anonymous public projection are not migration authorities.

### Source-of-truth boundaries

- **Phase 22:** page families, subject/display relations, contributor-facing
  collaboration, revision/review state, and the shared Publication contract.
- **Phase 9:** Ministry Assignment and Ministry Project identity/lifecycle and
  Ministry Assignment Participant Membership.
- **Phase 12:** principal-bound authorization and current permission decision.
- **Phase 10:** public-safe identity, content, consent, and publication verdict.
- **Phase 13:** Designation eligibility, checkout handoff, and contribution
  truth.
- **Phase 5/Payload:** public runtime and presentation content/version storage,
  consumed through the governed reader and serializer.
- **Phase 21:** Support Assignment participation and Field Account truth; an
  optional D19 same-scope binding references that context without granting page
  or financial access or becoming public progress truth.

### Rejected alternatives

- one person-owned page per Party;
- one arbitrary CMS page with polymorphic relationships;
- subject-, spouse-, household-, team-, project-, or Support-Assignment-derived
  edit access;
- direct missionary access to Payload Admin or live CMS documents;
- shared contributor credentials or one fictional page owner;
- contributor control of Designation, progress, safety, route, publication, or
  lifecycle; and
- mutable published truth, silent overwrites, or revocation that destroys
  evidence.

**Architectural record:**
[ADR-0118](../../adr/0118-typed-public-ministry-pages-and-explicit-contributor-assignments.md).

## D2 — Tenant-defaulted, Phase-10-ceiling-resolved Publication Reach

**Status:** Ratified and adversarially hardened on 2026-08-03.

> **C-prime-amended-and-hardened (C-prime-R) — one tenant-owned,
> prospective, immutable-versioned Publication Reach Policy scoped exactly by
> Tenant, Legal Entity, Site, and typed Page Family, with a fail-safe Not-public
> fallback until the tenant intentionally saves a default; exactly three honest
> outcomes—Listed publicly, Shared by link — public, and Not public—and one
> resolved reach request per immutable page release, sourced from either the
> exact tenant-policy version or an explicit authorized page request. One
> deterministic strictest-wins resolver bounds that request at release time by
> the exact Phase 10 public-safe projection, consent, do-not-publish rule,
> security ceiling, and review verdict, then bounds every current public
> response again by the latest locally authoritative Phase 10 ceiling and
> append-only containment, permitting immediate narrowing while every widening
> requires a newly proofed release. Each release preserves exact Tenant, Legal
> Entity, Site, page family, page, locale, participant, CMS revision and digest,
> policy, safety evidence and generation, requested and effective reach, Page
> Release Authority, route generation, actor, and time coverage; it becomes
> current only through an idempotent CAS-guarded activation with immutable route
> bindings and permanent tombstones. Supabase holds these exact operational
> facts behind explicit grants, indexed RLS, structural tenant isolation,
> server-command-owned writes, and privacy-minimized disposable runtime
> projections, while anonymous traffic reaches only the Phase 5
> host/site/tenant choke point and never raw missionary, fund, CMS, policy,
> evidence, operational-identifier, or Realtime records. One accessible, quiet
> experience gives staff prospective defaults, consequence previews, separate
> Content, Public reach, and Giving truth, exception-first review, and
> permission-safe explanations; gives contributors clear reach status and
> requests without release authority; and gives every displayed participant
> immediate smallest-scope self-protection. Route entropy, crawler directives,
> metadata, sanitized gated media, directory and sitemap inclusion, cache
> generations, telemetry redaction, purge, and recovery are derived
> automatically; Phase 13 remains independently authoritative for Designation
> and checkout, and external search, social, CDN, and copied-link removal remain
> independently observed best-effort outcomes—without mutable visibility
> flags, arbitrary audience or SEO matrices, “private” claims for shared links,
> identity-derived restricted routes, implicit public backfill, direct browser
> publication, dual public reads, permissive missing data, stale-cache
> authority, destructive history, or any claim that drafted, approved,
> CMS-published, publicly reachable, discoverable, gift-ready, purged, or
> externally removed are the same fact.**

### Binding interpretation

- Publication Reach has one strict order: **Not public** is stricter than
  **Shared by link — public**, which is stricter than **Listed publicly**.
- Shared-by-link pages are anonymously public and reshareable. They are omitted
  from Asym directories, site search, navigation, sitemaps, public feeds, and
  locale discovery and receive derived crawler controls, but are never called
  private, confidential, authenticated, or secure.
- A missing tenant policy means new pages remain Not public. The first setup
  makes the tenant choose deliberately and does not pretend the fail-safe was a
  tenant decision.
- A policy is prospective for one exact Tenant × Legal Entity × Site × Page
  Family scope. Changing it does not mutate, republish, widen, narrow, rotate,
  or withdraw an existing release.
- An exact release records whether requested reach came from its pinned policy
  version or an explicit authorized request. The release-time result is the
  strictest of that request and the exact Phase 10 ceiling.
- Current serving is bounded again by the immutable release-time result, the
  latest locally authoritative Phase 10 ceiling, and active append-only
  containment. A known local denial or an intentionally missing tenant policy
  produces the applicable Not-public/privacy-safe absence. If the runtime
  cannot resolve current authority at all, it returns a neutral no-store
  unavailable response rather than minting a Not-public fact or serving stale
  positive content.
- Exposure may narrow immediately. A safety improvement or resolved hold never
  widens a page automatically; widening requires a newly reviewed and proofed
  release.
- Content approval, Public reach, and Giving readiness remain visibly and
  structurally separate. A public page can have giving unavailable, and a valid
  Designation does not make a page public.
- Public-progress visibility/readiness is a fourth independent fact. D2's one
  release head selects the exact D6 Hidden disposition or profile and metric-
  contract generation; D6 creates no second active-configuration head and can
  neither grant reach nor widen Phase 10.
- The same release head pins D7's one exact Page Giving Binding. A later
  Designation-eligibility failure may contain only Giving without rewriting the
  release or changing Live Publication Reach; D2 does not infer or substitute a
  destination.
- A represented person's immediate self-protection authority comes from that
  person's verified identity and the applicable Phase 10 consent control, not
  merely from being a Display Participant or Public Page Contributor.

### Public-runtime and data hardening

- Anonymous requests use the Phase 5 host → Site → Tenant boundary and a
  privacy-minimized Phase 10-safe runtime projection. Raw missionary, fund,
  Party, CMS, policy, evidence, contributor, or operational-ID rows are not a
  public API.
- Immutable policy versions, release evidence, route bindings, route
  tombstones, and containment facts are operational truth. A small current
  pointer and disposable runtime projection may accelerate reads but cannot
  rewrite that history or grant exposure.
- Release activation re-proves actor, scope, assignment, Page Release Authority,
  Phase 10 evidence, content revision, participants, route, and current base,
  then advances the current release through an idempotent compare-and-swap.
- Local request denial is the safety boundary. Cache, CDN, sitemap, search,
  social, and copied-link cleanup are separately observed best-effort outcomes;
  a delayed purge cannot authorize serving.
- Public media must be sanitized and bound to an eligible release. A permanent
  public object URL that remains readable after withdrawal is not an acceptable
  revocable media boundary.
- Old direct-link routes are permanently tombstoned and never redirect to a
  replacement. Restricted routes and shared-link routes are opaque and never
  identity-derived.
- D8 consumes this route class and release truth. It may move only an originally
  Listed-public route to a new eligible canonical Route Generation for the same
  immutable Page; it cannot make a Shared-by-link or restricted/direct-link
  history redirectable after later widening.

### UX and operational hardening

- Staff configure one consequence-labelled native radio group in **Settings →
  Public ministry pages → Publication reach**, scoped by Site and Page Family.
  The interface derives a plain-language discovery footprint rather than
  exposing crawler, cache, or visibility switches.
- Staff page summaries show separate **Content**, **Public reach**, and
  **Giving** states. Requested and effective reach appear separately only when
  Phase 10 changed the outcome, with a permission-safe explanation.
- Contributors see what supporters can currently see, may request wider reach,
  and never gain release authority from edit access.
- An affected participant can immediately stop their own public presentation
  through the smallest safe containment. Restoring exposure is a new release,
  not an undo operation.
- Healthy pages remain quiet. Staff attention is reserved for blocked proof,
  widening requests, containment, drift, or failed external cleanup.

### Source-of-truth boundaries

- **Phase 22:** requested Publication Reach, immutable release-time resolution,
  route generations and tombstones, current-release selection, and containment
  composition.
- **Phase 10:** public-safe projection, publication consent, do-not-publish
  rules, security ceiling, review verdict, and current safety reduction.
- **Phase 12/D1:** current actor, contributor assignment, review capability, and
  Page Release Authority.
- **Phase 5/Payload:** exact presentation revision and public runtime, consumed
  only through the governed reader and serializer.
- **Phase 13:** Designation, giving eligibility, cart/checkout validation, and
  contribution attribution.
- **Phase 21:** Support Assignment participation, authenticated Support
  Workspace access, and Support Workspace Publication Profiles; none grants,
  defaults, or widens Phase 22 anonymous reach.
- **External search, social, storage, and CDN systems:** observed cleanup and
  propagation outcomes, never Asym reach authority.

### Rejected alternatives

- a mutable `public`, `private`, `unlisted`, or `published` flag;
- Payload `_status` as anonymous-reach authority;
- a password page, arbitrary audience graph, tenant-authored precedence matrix,
  or editable SEO/security switches in Phase 22;
- `noindex`, an opaque URL, a login-looking label, or possession of a URL as a
  confidentiality guarantee;
- default changes that retroactively widen existing pages;
- missing Phase 10 truth interpreted permissively;
- raw anonymous operational reads, client-owned publication writes, or
  service-role possession treated as actor authority;
- stale cached output as current serving authority;
- direct-link rotation that redirects the old route to the new route; and
- migration that infers any legacy page is eligible to be public.

**Architectural record:**
[ADR-0119](../../adr/0119-tenant-defaulted-phase-10-ceiling-resolved-publication-reach.md).

## D3 — Family-certified Public Page Presentation Profile Versions

**Status:** Ratified and adversarially hardened on 2026-08-03.

> **C-prime-amended-and-hardened (C-prime-R) — two
> non-interchangeable, family-certified Public Page Presentation Profile
> Version families—Missionary Ministry Page and Project/Campaign Page—under
> D1's shared Publication contract; with one built-in accessible default and
> one guided prospective tenant default resolved exactly by Tenant, Legal
> Entity, Site, and Page Family, and exactly one compatible immutable profile
> version, block-catalog generation, renderer generation, locale policy, and
> referenced brand version pinned by every D2 Page Release Manifest. Each
> family owns its own certified shell, zones, required managed blocks, bounded
> optional blocks, cardinalities, contributor-editable semantic slots,
> accessibility and performance contract, and deterministic failure behavior
> while sharing only governed rendering primitives; activated versions never
> mutate, cascade, cross families, or silently rewrite live pages, and page
> exceptions select a complete certified family-compatible profile rather than
> layered free-form overrides. Every block declares release-frozen editorial,
> independently authoritative managed-projection, or independently released
> feed semantics plus its exact source, edit authority, safety ceiling, locale
> behavior, and empty or unavailable outcome. The Missionary Ministry profile
> includes a tenant-controllable, capability-gated Ministry Updates section
> that references—never copies—canonical independently versioned Ministry
> Updates through an exact Ministry Update Feed Binding; every item retains
> independent authorship, moderation, visibility, Phase 10 proof, locale,
> release, withdrawal, and communication truth and must satisfy both page and
> update authority, while project/campaign consumption additionally requires
> an exact canonical project/purpose binding and is never inferred from
> subject, contributor, spouse, team, or Support Assignment relationships. One
> quiet visual staff setup and one family-specific missionary editor provide
> exact responsive preview, plain ownership labels, connected but separate
> update authoring, accessible non-drag-only controls, explicit
> draft-versus-live truth, and prospective impact-reviewed migration—without a
> generic cross-family template, mutable inherited defaults, arbitrary block
> or workflow DSLs, raw HTML/CSS/JavaScript, arbitrary forms, URLs, embeds or
> queries, copied operational truth, direct Payload authority, silent
> invalid-block omission, destructive restore, unbounded feeds, cross-tenant
> references, unsafe locale fallback, or any claim that profile activation,
> page save, update approval, content release, public reach, Giving readiness,
> cache propagation, notification delivery, or external discovery are the same
> fact.**

### Binding interpretation

- Missionary Ministry and Project/Campaign pages have non-interchangeable
  semantic catalogs and certified shells. They share governed rendering and
  publication primitives, not one condition-heavy universal page schema.
- One built-in accessible family default keeps ordinary tenant setup quiet. A
  tenant may activate one prospective complete profile version for each exact
  Tenant × Legal Entity × environment × Site × Page Family scope. Reusable
  profile-version content remains distinct from the environment-scoped
  activation head.
- Historical D3 rule, superseded by D27: a Page-specific exception could select
  another complete certified profile of the same family; Phase 22 ships no such
  exception. Profiles do not inherit fragments, deep-merge patches, accept
  page-authored schemas, or cross Page Families.
- Every D2 Page Release Manifest pins one exact compatible profile version,
  block-catalog and renderer generation, locale policy, referenced brand
  version, resolved layout digest, and content revision. Existing releases do
  not change when a tenant activates a later default.
- Each Presentation Block Contract declares its family, semantic role, source
  authority, edit authority, placement, cardinality, safety ceiling, locale
  behavior, accessibility/performance limits, and deterministic empty,
  unavailable, or invalid outcome.
- D3 owns only the optional progress block's certified placement, responsive
  rendering, and accessible visual contract. D6 alone selects Hidden versus one
  compatible metric/source; a D3 page exception cannot override that choice.
- D3 likewise owns CTA placement and accessible rendering only. D7 owns the one
  page-wide destination, and no profile, block, responsive variant, or
  contributor can introduce another Designation.
- Block content is explicitly one of release-frozen editorial content, an
  independently authoritative managed projection, or an independently
  released feed. Contributors cannot replace a managed block with an editorial
  imitation.

### Ministry Updates and page-family behavior

- A Ministry Update remains one independently versioned, moderated, released,
  and retired cross-surface record. It is neither copied into a page revision
  nor re-created as a page-owned post.
- A Ministry Update Feed Binding selects the exact canonical source stream or
  source set eligible for one page. No subject, Display Participant,
  contributor, spouse, team, project, Support Assignment, or generic author
  relationship implies inclusion.
- A page release pins the feed contract and bounded presentation, not a frozen
  list of update items. Each served item must independently satisfy its current
  release, visibility, locale, Phase 10, containment, and the page's Live
  Publication Reach.
- Public ordering is deterministic and bounded. An empty feed collapses
  quietly; the contributor workspace presents a useful update-authoring action.
- A Project/Campaign page may consume a Ministry Update only when the canonical
  update authority supplies an exact project/purpose binding. A later
  project-update source may implement the same feed projection contract without
  redefining Ministry Update.
- Public posting and notification or communication delivery remain separate
  facts and failure domains.

### Runtime, data, and UX hardening

- Payload owns bounded authoring content, drafts, and editor machinery. It does
  not own operational profile activation, actor authorization, D2 reach,
  release selection, or public serving authority.
- Immutable profile versions, exact prospective activation, page-profile
  bindings, sparse typed exceptions, compatibility/impact manifests, and D2
  release pins live behind the operational Postgres/service boundary with
  structural scope, explicit grants, indexed RLS, server-owned writes, and
  compare-and-swap activation.
- Payload Local API calls carry the authenticated actor and explicitly enforce
  access and document locks. A service role, Payload `_status`, field
  `readOnly`, or mutable template is not product authority.
- Unknown, invalid, or family-incompatible blocks prevent a new release and
  preserve the last certified release. An unavailable optional projection may
  omit only its section and open a cause-owned exception; missing identity or
  safety truth invokes D2 containment.
- Rich content uses a bounded safe AST; URLs and approved media use server-side
  validation and Phase 29-compatible processing. Raw code, unrestricted embeds, arbitrary
  forms, external scripts, and tenant-authored query expressions are absent.
- Staff use two plain-language family design surfaces with Required, Optional,
  and Missionaries may edit sections, exact responsive preview, affected-page
  impact evidence, and prospective draft rollout. Contributors use one
  family-specific Public pages editor with only editable controls, clear
  draft-versus-live state, connected separate update authoring, accessible
  non-drag controls, anchored review feedback, and one submit action.
- Profile, page, locale, update-feed, and safety cache identities and
  invalidations are exact and narrow. Feeds are bounded and indexed, media is
  responsive and budgeted, public rendering ships no editor JavaScript, and
  autosave evidence is coalesced separately from immutable review and release
  snapshots.

### Migration and certification

- Existing generic layouts, arbitrary CTA URLs, soft missionary/fund IDs,
  copied identity, mutable templates, and tenant-wide or mutable-public update
  stores are staging evidence only. They confer no D1 binding, D2 release, D3
  profile, or Phase 10 public eligibility.
- Migration privately classifies every legacy page, template, block, profile,
  and update as adopt, transform, quarantine, retain under a compatible legacy
  renderer, or retire. Shadow compilation and exact reconciliation precede any
  deliberate new D2 release.
- Activation proof covers family separation, required managed blocks,
  contributor field allowlists, exact tenant/site/legal-entity scope,
  immutability and single-winner resolution, CAS and restore behavior,
  old-release stability, unknown-generation containment, preview/live renderer
  parity, exact feed binding and pagination, Phase 10 across every egress,
  rich-content/media/link safety, cache isolation, accessibility, and
  production-scale performance for every certified variant.
- The repository's exact internal Payload 4 prerelease is certified through
  adapter and contract tests against installed behavior; undocumented internals
  do not become the Phase 22 contract.

### Source-of-truth boundaries

- **Phase 22/D3:** family profile contracts, immutable profile versions,
  prospective profile selection, block semantics, release presentation pins,
  Ministry Update Feed Bindings, and presentation rollout evidence.
- **Phase 22/D1:** Page Subject Bindings, Display Participants, contributor
  assignments, proposal workflow, and Page Release Authority.
- **Phase 22/D2:** requested, release-time, and live Publication Reach, route
  generations, Page Release Manifest activation, and containment.
- **Phase 10:** current public-safe identity, content, consent, media ceiling,
  and update/page publication verdicts.
- **Phase 5/Payload:** bounded page and update authoring revisions plus the
  governed public runtime substrate.
- **Phase 13:** Designation, contribution eligibility, progress inputs, and
  checkout handoff.
- **Phase 29-compatible boundary:** governed media intake, transformation, metadata removal, and
  release-safe asset variants.
- **Communication-owning phases:** notification audience, delivery intent,
  provider acceptance, and delivery outcomes.

### Rejected alternatives

- one generic mutable template or freely sortable cross-family block list;
- unrestricted per-page builder, raw code, arbitrary embeds, forms, links, or
  tenant-authored queries;
- mutable inheritance cascades, deep-merged profile fragments, or per-page
  schema forks;
- profile activation that silently rewrites or widens live releases;
- copied operational identity, progress, Giving, safety, or legal truth;
- Ministry Updates embedded or duplicated as page content;
- update inclusion inferred from tenant, author, subject, display, contributor,
  spouse, team, project, or Support Assignment membership;
- Payload template, `_status`, `readOnly`, Local API default, or service-role
  possession treated as product authority; and
- silent unknown-block omission, unsafe locale fallback, destructive restore,
  unbounded feed, or whole-tenant cache purge.

**Architectural record:**
[ADR-0120](../../adr/0120-family-certified-public-page-presentation-profiles.md).

## D4 - Tenant-chosen Public Content Review & Release Profile Versions

**Status:** Ratified and adversarially hardened on 2026-08-03.

> **C-prime-amended-and-hardened (C-prime-R) - one prospective,
> immutable, tenant-owned Public Content Review & Release Profile Version
> scoped exactly by Tenant, Legal Entity, Site, Page Family, environment, and
> publication path, giving the tenant one honest choice between `Review before
publishing` and `Publish after checks` for Missionary Ministry Page
> revisions, Project/Campaign Page revisions, and Ministry Updates through
> progressive customization; with a disclosed manual-review fallback until
> deliberate tenant activation, private autosave, explicit contributor release
> intent, and one immutable Public Content Release Candidate pinned to the
> exact live base, normalized content, complete canonical semantic diff and
> public-egress manifest, locale, actor and contributor assignment,
> profile/catalog/renderer generations, media, feed, safety, reach, and
> managed-reference facts. In review mode an authorized staff member decides
> that exact candidate; in automatic mode every contributor-editable candidate
> that passes all current owning-phase and structural proofs releases without
> an invented human gate - including an initial content release when the
> tenant's managed page, route, reach, and safety setup is already valid. Phase
> 10 `needs_review` follows its authorized human-review path and `blocked`
> cannot release; unknown public egress or missing, stale, contradictory, or
> unavailable non-substitutable proof preserves the candidate in a cause-owned
> exception that ordinary review cannot override. Both modes use D2's sole
> idempotent CAS-guarded release command with current actor, assignment,
> profile, safety, reach, dependency, and generation reproof, immutable
> decision/release evidence, exact current-head activation, and transactional
> outbox; automatic release is system execution of standing tenant-owned
> release authority, never generic contributor authority or AI judgment.
> Profile changes are prospective, tightening stops queued automation,
> loosening never publishes an old backlog, restore creates a new draft, and
> scheduling only wakes the same current-proofed command. Draft saved,
> submitted, human-approved, automatically eligible, released, publicly
> reachable, cache-propagated, Giving-ready, Ministry-Update-released,
> supporter-notification-requested/delivered, search-indexed, and externally
> discovered remain independently authoritative; one accessible mode-honest
> missionary editor and quiet exception-first staff workspace expose exact
> previews, semantic diffs, causes, and next actions - without workflow DSLs,
> per-field matrices, broad human-review floors contradicting the tenant's
> automatic choice, author-declared risk, AI release authority,
> autosave-to-live, moving-target approval, fictional dual control, email-click
> approval, mutable restore, blind retry, stale approval, automatic backlog
> publication, or Payload `_status`, Admin, Local API, scheduler, bulk,
> service-role, cache, or notification authority over public truth.**

### Binding interpretation

- Each exact Tenant x Legal Entity x Site x Page Family x environment x
  publication-path scope resolves one active immutable profile version.
  Ordinary setup starts with one organization choice; `Customize` reveals only
  Missionary Ministry Page revisions, Project/Campaign Page revisions, and
  Ministry Updates that the tenant uses.
- The two modes are exactly `Review before publishing` and `Publish after
checks`. The latter is a genuine no-staff-review path for any D3
  contributor-editable candidate that passes every current required proof; it
  is not limited to copy edits, and it may govern the first content release
  after the staff-owned page, route, reach, profile, and safety setup is valid.
- Until deliberate tenant activation, Asym exposes `Review before publishing`
  as its fallback rather than misrepresenting it as a tenant selection.
- Tightening an active profile stops queued automatic work at current-policy
  reproof. Loosening never reinterprets or releases an existing review backlog;
  staff may decide the existing candidate or the contributor may submit a new
  candidate under the new profile.
- Phase 10 remains the publication-safety ceiling: `allowed` can follow the
  tenant's mode, `needs_review` follows Phase 10's authorized human-resolution
  path, and `blocked` cannot release. Missing or unavailable proof that its
  owning contract does not permit humans to substitute remains a cause-owned
  exception, not a reviewer override.
- D1/D3 managed identity, route, reach, Giving, D7 Page Giving Binding,
  Presentation Profile, feed, lifecycle, Public Support Progress Profile, and
  financial fields never become contributor-editable merely because automatic
  release is enabled.

### Candidate, review, and release truth

- Autosave is always private. One deliberate `Submit for review` or `Publish
changes` action freezes a Public Content Release Candidate containing the
  exact normalized revision and digest, live base and pointer generation,
  scope, locale, actor and contributor assignment, governing profile/catalog/
  renderer versions, media and feed references, complete semantic diff and
  public-egress manifest, and current owning-domain evidence.
- The semantic compiler covers every visible and hidden public consequence,
  including rich-text AST, links, block order, alt text, captions, media
  identities and derivatives, locale fallback, metadata, canonical URLs, OG,
  JSON-LD, and feed behavior. A raw field or JSON patch is insufficient.
- A protected D6 profile change is compiled into that same exact candidate,
  preview, proof plan, and release command. Source-owned value advancement or
  correction under an unchanged compatible profile is not editorial work and
  creates no candidate or second review path.
- Every D3 field, block, attribute, and renderer egress has an exhaustive
  code-owned proof plan. Unknown egress quarantines the affected release
  generation until certified; staff cannot review around a consequence the
  product cannot construct. AI may suggest or flag content but never supplies
  safety or release authority.
- A staff review decision is append-only and bound to the exact candidate,
  digest, base, profile, actor, and evidence inspected. It is single-use
  evidence, not publication and not approval of whatever draft is latest.
- Manual and automatic paths invoke D2's one idempotent release command. At
  execution it re-proves current actor/system authority, contributor
  assignment, reviewer/releaser capability where applicable, target head,
  profile and renderer compatibility, Phase 10, D2 reach and containment,
  media, locale, links, feed, exact D6 profile/metric compatibility, and every
  managed dependency before one
  compare-and-swap transaction records the immutable Page Release Manifest,
  advances the current head, and writes the outbox event.
- Automatic release is system execution of the tenant's standing Page Release
  Authority. It is not generic missionary publication permission or evidence
  that a human reviewed the candidate.

### Failure, recovery, and truth separation

- The prior certified public release remains live unless and until the new
  release transaction commits. A stale base requires rebase and resubmission;
  last-write-wins publication is prohibited.
- Payload Admin, `_status`, REST, GraphQL, Local API, bulk operations,
  service-role scripts, restore, and native scheduled publishing cannot create
  D2 release truth. Restore creates a new draft and candidate; a schedule only
  wakes the same release command for full execution-time reproof.
- Idempotency and inspect-before-retry resolve ambiguous execution. Cache,
  search, sitemap, CDN, or notification consumers recover only their residual
  outbox effects and never rewrite release truth.
- Draft save, submission, human review, automatic eligibility, release commit,
  live anonymous reach, Giving readiness, Ministry Update release, cache/search
  propagation, supporter communication intent/delivery, and external discovery
  are separate facts and failure domains. Current Phase 10 containment always
  wins over cached output.

### UX, accessibility, and tenant operation

- Staff configure one guided choice under `Settings -> Public ministry pages ->
Review and publishing`. A consequence preview identifies affected paths and
  existing review backlog; profile activation never releases that backlog.
- Contributors always see that autosave is private. Review mode uses `Submit
for review`; automatic mode uses `Publish changes`; a production-rendered
  consequence preview precedes either submission.
- Missionary states use exact truth: Draft saved, Checking your changes, In
  review, Changes requested, Publishing, Live, Needs attention, Superseded, or
  Live page changed - review and resubmit. `Approved`, `Done`, and `Published`
  are not used before those exact facts exist.
- Staff receive one quiet exception-first Public page reviews workspace with
  exact scope, author, age, safe reason, semantic diff, mobile-first public
  preview, field-anchored feedback, and the next authorized action. Healthy
  automatic releases remain absent and silent.
- One-person tenants are not subjected to fictional dual control. When one
  staff principal legitimately holds both review and release capability, the
  interface may collapse the flow to `Review and publish` while recording that
  no independent review occurred. Distinct-person review is optional only when
  the tenant or an owning phase requires it and eligible capacity plus an
  escalation path are proved.
- Diffs use textual Added/Removed/Changed semantics rather than color alone and
  support keyboard and screen-reader operation, logical focus, concise status
  announcements, text errors, 320-pixel reflow, non-drag alternatives, and
  adequate touch targets. Publishing a Ministry Update and notifying supporters
  remain separate choices and outcomes.

### Data, migration, and certification

- Immutable profiles, candidates, diffs, decisions, release operations,
  manifests, current pointers, and outbox records repeat exact Tenant, Legal
  Entity, Site, target, and publication-path scope where applicable and use
  same-scope keys, explicit grants, indexed RLS, and narrow server-owned
  commands. Browser principals cannot mutate release truth directly.
- Payload remains the version-pinned authoring adapter. Its publish, restore,
  scheduling, Local API defaults, and jobs are contract-tested but do not
  become Phase 22 authority.
- Legacy `_status = published` pages undergo a complete census, exact scope and
  dependency resolution, shadow compilation, and immutable seed-manifest
  preparation before one CAS-guarded reader cutover. Old drafts and reviews are
  never automatically released; dual public authority is prohibited.
- Certification covers both modes across both Page Families and Ministry
  Updates; first and later releases; every field, block, locale, metadata,
  media, and hidden egress; Phase 10 outcomes; concurrent contributors;
  assignment, policy, safety, reach, and dependency revocation; every Payload,
  service-role, restore, scheduling, and direct-database bypass; tenant RLS;
  ambiguous retries and downstream failures; one-person tenants; accessibility;
  and production-scale performance.

### Source-of-truth boundaries

- **Phase 22/D4:** prospective Review & Release Profile Versions, immutable
  Release Candidates, semantic/public-egress proof, exact review decisions, and
  invocation evidence for manual or automatic release.
- **Phase 22/D1:** subjects, display participants, contributor assignments, and
  Page Release Authority.
- **Phase 22/D2:** requested/release/live Publication Reach, Page Release
  Manifests, current head, route generation, and containment.
- **Phase 22/D3:** family Presentation Profile/block contracts, contributor
  slots, renderer/catalog generations, and Ministry Update Feed Bindings.
- **Phase 10:** publication safety, consent, human-review meaning, blocking, and
  current public-content ceiling.
- **Phase 5/Payload:** bounded content authoring, autosave, drafts, and CMS
  provenance, never product release truth.
- **Phase 13:** Designation, Giving readiness, progress-source truth, and
  checkout handoff.
- **Phase 29-compatible boundary:** governed media intake, transformation, metadata removal, and
  safe derivatives.
- **Communication-owning phases:** notification audience, intent, provider
  acceptance, and delivery outcomes.

### Rejected alternatives

- universal staff review or a hidden platform-defined routine-only automatic
  lane that contradicts the tenant's selected posture;
- autosave, Payload `_status`, Admin, Local API, job, bulk, restore, scheduler,
  cache, notification, or service-role possession as publication authority;
- mutable approval of the latest draft, blind last-write-wins publication,
  destructive restore, or automatic release of an old backlog;
- tenant-authored workflow DSLs, per-field rule matrices, arbitrary approver
  graphs, author-declared safety, or AI moderation/release authority;
- broad super-admin or per-user bypass lists and email-click approval;
- universal maker-checker rules or false claims of independent review for
  one-person tenants;
- staff override of unknown egress or mandatory missing proof; and
- conflation of release, reach, Giving, cache, communication, or discovery
  outcomes.

### Later D11 authority qualification

The ratified D4/D5 candidate and review lane remains shared, but its release
command is owner-specific. A Page invokes D2 and records an immutable Page
Release Manifest; a Ministry Update invokes D11 for the deliberately selected
audience and records its Audience Release Manifest and projection head. Neither command or
manifest may substitute for the other, and every automatic or reviewed action
re-proves the selected Update audience where applicable.

**Architectural record:**
[ADR-0121](../../adr/0121-tenant-chosen-public-content-review-and-release-profiles.md).

## D5 - Simple tenant-controlled review with quiet Phase 10 eligibility

**Status:** Ratified and adversarially simplified on 2026-08-03.

> **C-prime-amended-and-simplified - one tenant-controlled Review & Release
> choice with quiet Phase 10 safety enforcement: D4 alone determines whether
> deliberately submitted changes to Missionary Ministry Pages,
> Project/Campaign Pages, and Ministry Updates require staff review or may
> publish after checks; review-mode staff judge the exact rendered candidate
> and choose Approve & publish, Request changes, or a deliberately secondary
> terminal rejection, while automatic-mode candidates that pass every current
> check remain absent from the review queue; one organization default may be
> progressively customized only by the content paths the tenant uses; and the
> sole release command quietly pins and reproves Phase 10's current eligibility
> as a non-overridable safety ceiling - without a second approval product,
> per-person/per-field/per-asset permission matrix, routine evidence-upload
> burden, parallel queue, relationship-derived permission, Approve-anyway
> escape hatch, mutable-draft approval, or surprise publication of an existing
> review backlog.**

### Binding interpretation

- D5 does not introduce another workflow. D4's Public Content Review & Release
  Profile Version remains the sole tenant choice between `Review before
publishing` and `Publish after checks`.
- Setup presents one plain organization default. `Customize` progressively
  reveals separate choices only for Missionary Ministry Page revisions,
  Project/Campaign Page revisions, and Ministry Updates that the tenant uses.
  It does not expose per-user, per-page-field, participant, asset, or arbitrary
  rule-builder configuration.
- Review mode freezes one exact D4 Public Content Release Candidate. Staff see
  its production-equivalent rendered preview and concise semantic diff, then
  normally choose **Approve & publish** or **Request changes** with a short,
  actionable reason. A secondary terminal rejection is reserved for a
  submission that must not continue; it preserves the candidate and reason and
  never deletes publication history or the contributor's independent draft.
- Staff judgment owns the editorial decision. It does not manufacture missing
  identity authority, change a Phase 10 verdict, widen D2 Publication Reach,
  alter D3 managed fields, select/repair D6 financial truth, replace or validate
  D7's Page Giving Binding, or prove Giving readiness.
- Automatic mode is genuinely quiet. A healthy candidate does not enter a
  staff review queue. A cause-owned safety or structural exception appears as
  **Needs attention**, clearly distinguished from an editorial review because
  no staff action can approve around a non-substitutable hard block.
- Phase 10 remains the sole current public-eligibility ceiling. D1's explicit
  Display Participant relation is necessary for an additional represented
  spouse, teammate, or leader, but subject, household, team, employment,
  authorship, contributor, and staff-review relationships never imply or widen
  Phase 10 publishing permission.

### Candidate and release safety

- A staff decision is append-only and bound to the exact candidate ID, content
  digest, live-base generation, review-profile version, reviewer, scope, and
  evidence inspected. Any later content edit creates a new candidate; approval
  never floats to the latest draft.
- **Approve & publish** is one staff intention but two independently truthful
  facts. The decision first records approval of that exact candidate, then D2's
  sole compare-and-swap release command re-proves actor authority, candidate
  head, profile, Phase 10, reach, renderer, dependencies, and current
  containment. The UI reports the actual release result and never labels a
  failed or pending release `Published`.
- Phase 10 `blocked` can never release. A Phase 10 `needs_review` outcome follows
  only Phase 10's defined human-resolution path; ordinary editorial approval
  cannot substitute for evidence that Phase 10 says is mandatory.
- Missing, incompatible, stale, or suppressed D6 source proof omits the optional
  widget and becomes a cause-owned **Needs attention** exception. Staff cannot
  approve around it, and an owning-source refresh or correction never enters the
  editorial review queue.
- The D2 Page Release Manifest pins the exact Phase 10 verdict/version used at
  release. D5 adds no parallel Public Presentation Authorization Coverage
  Manifest or second consent database.
- Review-profile changes are prospective. Tightening stops affected new
  automatic release at current-policy reproof; loosening never publishes an
  already-waiting candidate. Staff may decide it under its pinned profile or
  the contributor may deliberately submit a new candidate.

### UX and accessibility

- The ordinary missionary workflow has four primary labels: **Draft**,
  **Waiting for review**, **Changes requested**, and **Published**. Checking,
  publishing, stale-base, superseded, withdrawn, and safety-exception facts are
  concise secondary messages shown only when relevant, not extra routine steps
  the contributor must learn.
- The action label is mode-honest: **Submit for review** in review mode and
  **Publish changes** in automatic mode. Autosave remains visibly private in
  both modes.
- Staff work from one quiet **Public page reviews** surface. Each item shows the
  page or update, author, age, exact public preview, meaningful changed content,
  and one next action. Safety exceptions carry a different label and explain
  the cause and permitted remedy rather than presenting **Approve**.
- Request feedback is field-anchored when possible, concise, available in plain
  text, and delivered inside the missionary workspace; email may notify but is
  never the approval or review record.
- Review, diff, and action controls remain keyboard-operable, screen-reader
  named, non-color-dependent, reflow-safe at 320 CSS pixels, and protected from
  accidental activation with an explicit consequential-action confirmation.

### Source-of-truth boundaries

- **Phase 22/D4:** the only Review & Release Profile, immutable candidates,
  semantic/public-egress proof, and review or automatic release lane.
- **Phase 22/D5:** the deliberately simple staff/contributor interaction and the
  prohibition on a second approval or public-presentation permission product.
- **Phase 22/D2:** the sole release command, immutable Page Release Manifest,
  current head, reach resolution, and containment.
- **Phase 22/D1:** subjects, Display Participants, contributor assignments, and
  Page Release Authority.
- **Phase 10:** current publishing permission, do-not-publish, restricted-person
  projection, `allowed | needs_review | blocked` meaning, and non-overridable
  safety outcomes.
- **Phase 5/Payload:** authoring, drafts, and source provenance, never approval,
  release, or public-eligibility authority.

### Rejected alternatives

- a blanket person-level switch that conflates page participation, editorial
  review, and public eligibility;
- the earlier semantic-scope permission grid or asset-by-asset approval model
  as an ordinary staff or missionary workflow;
- a second Phase 22 consent store, evidence-upload ceremony, coverage manifest,
  review queue, or workflow state machine duplicating D4, D2, or Phase 10;
- `Approve anyway`, broad administrator bypass, reviewer-created safety proof,
  relationship-derived permission, or staff judgment that overrides Phase 10;
- placing healthy automatic candidates into a review or FYI queue; and
- applying a newly loosened policy to old submissions or treating approval as
  proof that release completed.

**Architectural record:**
[ADR-0122](../../adr/0122-simple-public-page-review-with-quiet-phase-10-eligibility.md).

## D6 - Page-resolved, source-authoritative Public Support Progress

**Status:** Ratified and adversarially hardened on 2026-08-03.

> **C-prime-amended-and-hardened (C-prime-R) - one explicit, prospective,
> immutable, page-resolved tenant-owned Public Support Progress Profile Version
> for every released page, selecting `Do not show public progress` or exactly
> one primary source-authoritative compatible metric for each individual
> Missionary Ministry Page and Project/Campaign Page; with Page-Family-guided
> but not Page-Family-determined presets for Phase 13 corrected gross-received,
> exact-period, and typed-count projections or a compatible Phase 16
> active-commitment projection against one exact Phase 13 campaign goal or
> Phase 28 Support-Raising Goal Version; tenant/page-family defaults that seed
> new drafts only and never govern existing pages at runtime; exact Tenant,
> Legal Entity, Site, page, subject/Designation or campaign coverage, metric,
> period, timezone, goal, evaluator, and source-watermark scope plus one ISO
> currency for monetary metrics; one bounded public disclosure choice, an exact
> visitor preview, and a clear source/period/through-date explanation;
> disposable correction-aware public projections; proof-gated offline
> inclusion; privacy-before-aggregation and small-cell suppression;
> server-enforced hidden state; accessible over-goal truth; smallest-scope
> widget omission and cause-owned staff exception when truth is not safely
> computable; and independently controlled Giving - without mandatory or
> tenant-global progress, live default inheritance, Page-Family fundraising
> assumptions, arbitrary formulas, commitment-and-receipt blending, unverified
> manual totals, writable counters, floating-FX aggregation, Field Account or
> available-funds claims, retroactive goal rewriting, automatic metric
> fallback, stale zeroes, hidden-data egress, double counting, stale `Live`
> claims, or public access to source tables.**

### Binding interpretation

- Every released Public Ministry Page resolves one explicit progress posture:
  `Do not show public progress` or `Show one compatible public progress
metric`. A missing legacy binding is fail-safe hidden; it is never runtime
  inheritance from a tenant setting.
- Tenant and Page-Family defaults are creation conveniences only. They seed a
  new draft and preserve their source policy for provenance, but the page
  materializes its own choice. Changing a default cannot mutate, republish,
  widen, or change the meaning of any existing page.
- Page Family supplies compatibility boundaries and recommended presets, not a
  fundraising-shape assumption. A missionary page is not necessarily monthly;
  a project page is not necessarily finite; either may intentionally show no
  public progress.
- One page has at most one primary progress metric. A metric requiring a source
  contract that the owning phase has not certified remains unavailable with a
  clear next action; Phase 22 never approximates or manufactures it.
- D3 owns placement, responsive presentation, and accessible rendering of the
  optional managed block. D6 owns whether that page exposes progress and which
  financial meaning it references. Neither authority may rewrite the other.

### Metric and source truth

- The closed initial catalog may offer, when exact source contracts permit:
  **Active monthly commitments toward support goal**, **Gross support received
  for an exact period toward support goal**, **Cumulative gross gifts received
  toward campaign goal**, **Gross gifts received during an exact recurring or
  fixed period toward a compatible goal**, or one compatible Phase 13
  `supporter_count`, `gift_count`, or `recurring_supporter_count` goal.
- Labels state the fact exactly: `committed`, `received`, the governed period,
  and the ISO currency where applicable. `Raised`, `monthly support`, and
  `funded` are prohibited when they would conceal whether the source is a
  commitment, posted money, a count, or a period-specific measure.
- Phase 13 owns corrected posted-effective gross Designation/campaign amounts
  and canonical typed distinct counts. Refunds, returns, chargebacks, NSF,
  corrections, and redesignations update those metrics through its append-only
  effective fold.
- Phase 16 owns active-commitment identity, cadence normalization, and the
  narrower anonymous-public-safe commitment projection. Phase 28 owns the
  missionary Support-Raising Goal Version. Phase 22 references these facts and
  never recomputes them from rows or provider objects.
- Phase 15 offline gifts join a received metric only after its governed commit
  has produced a Phase 13 posted-effective fact. Unverified, staged, deposited-
  only, manually estimated, imported-only, and unfulfilled evidence cannot
  inflate public progress.
- Gross received progress excludes separately stated fee-cover and is not
  reduced by processor costs, Phase 21 assessments, internal support-credit
  policy, expenses, compensation, or accounting treatment. Phase 20 settlement
  and accounting, Phase 21 Field Account/availability/payment truth, and Phase
  33 reporting conversion are structurally ineligible numerators or fallbacks.
- Monetary progress has exactly one ISO currency and exponent. No profile or
  renderer creates an authoritative converted or cross-currency grand total.
  Goal, period, hierarchy, currency, coverage, or metric changes create a
  prospective successor profile and normal page release rather than rewriting
  an existing release's meaning.

### Projection, release, and failure behavior

- A Public Support Progress Projection is disposable, rebuildable, correction-
  aware, and source-watermarked. It carries the exact metric, source and goal
  versions, period/timezone, currency, numerator, denominator, evaluator,
  coverage, through-time, freshness, eligibility, and privacy/suppression
  result; it is not a CMS field or mutable counter.
- D2's Page Release Manifest pins the exact D6 profile and metric-contract
  generation, not a copied numeric result. Source-owned gifts, commitments, and
  corrections may advance the current compatible projection without editorial
  republishing; changing the public meaning or scope uses D2's sole release
  path.
- `Hidden`, `not configured`, `not computable`, `updating`, `stale`,
  `suppressed`, `source unavailable`, and authoritative zero remain distinct.
  An unsafe or incomplete result omits only the optional widget and creates one
  cause-owned staff exception. It never becomes `0%`, last-known truth, or an
  automatic fallback to another metric.
- Progress failure does not take down the story or independently eligible Give
  action. Reaching or exceeding a goal likewise does not close Giving; those
  remain independently authoritative D7/Phase 13/lifecycle decisions. Every
  eligible Give action uses D7's one released destination.
- Hidden means no public source evaluation or egress. The runtime emits no
  progress markup, metadata, structured data, client payload, anonymous API
  result, Realtime record, or cache artifact. CSS hiding and client-side
  filtering are prohibited.
- The visual fill may stop at 100 percent, but exact visible and assistive text
  preserves over-goal truth. A meter has a programmatic name, understandable
  value text, non-color-only meaning, reduced-motion-safe behavior, and usable
  mobile/reflow presentation.

### Staff and contributor experience

- One compact **Support progress** card starts with **Don't show progress on
  this page** or **Show progress on this page**. When shown, staff see only
  compatible named choices, the exact source/currency/period/through-date
  explanation, a bounded amount-plus-percentage or percentage-only disclosure
  choice, and the literal public preview.
- The card says **This page only**. It exposes no formula editor, source-column
  picker, condition tree, inheritance stack, arbitrary period language, or
  Page-Family mode matrix.
- Unavailable choices appear only when a concise explanation and direct next
  action help, such as **Set a public support-raising goal** or **Commitment
  tracking is not enabled**. Healthy hidden pages create no setup warning or
  empty public block.
- D1 contributors may see the selected meaning and exact preview and may edit
  surrounding contributor-owned explanatory content. Progress visibility,
  metric, goal, currency, period, and source scope remain protected tenant
  controls.
- A protected progress-setting change enters the existing exact page candidate
  and D2 release path. D6 creates no second review queue, approval workflow,
  public configuration head, or monthly staff publication chore.

### Data, isolation, migration, and certification

- Profile versions and disposable projections carry exact Tenant, Legal
  Entity, Site, page, Page Family, subject/purpose, source, currency, and
  revision scope with same-scope references, explicit grants, indexed RLS, and
  server-owned writes. Anonymous users never query ledger, commitment, goal,
  profile, binding, or internal projection tables.
- The current anonymous `missionaries`/`funds` SELECT policies and `funds`
  Realtime publication are explicit replacement targets. A forward migration
  revokes the obsolete grants, policies, and publication membership for the
  replaced public path without rewriting historical migrations; certification
  applies the entire migration chain and asserts the final privilege state.
- The current D2 Page Release head remains the sole public configuration
  selector. Projection advancement is CAS-guarded so an old source watermark or
  concurrent metric switch cannot attach a result to the wrong release.
- Cache identity includes the resolved tenant/site/page, route and release
  generation, D6 profile version, projection digest, and Phase 10/reach safety
  epoch. Tags invalidate but never isolate. Adverse correction, hiding,
  retirement, and safety narrowing expire the affected scope immediately.
- Existing pages migrate hidden. A complete census may prepare only source-
  provable profile candidates and production-shaped shadow projections; normal
  D2 release is the only activation path. Mutable legacy `current_funding`,
  `funding_goal`, `current_amount`, mock annualized support, or client-computed
  percentages are replacement targets, never migration evidence.
- The existing `packages/api` public-giving projection that reads those mutable
  fields, assumes 100 minor units, rounds to whole units, and clamps at 100%
  must be retired behind the same public seam. D6 uses exact ISO exponents and
  preserves visible and assistive over-goal truth.
- Certification covers both Page Families; hidden and every supported metric;
  one-time, recurring-period, and over-goal cases; zero/missing/incompatible
  goals; offline posting and adverse corrections; mixed currency; source
  outage/recovery; small-cell and Phase 10 suppression; concurrent source/
  profile changes; cross-tenant poisoning; anonymous egress; caches;
  accessibility; and production-volume recomputation.

### Source-of-truth boundaries

- **Phase 22/D6:** the exact page-resolved public-progress posture, metric
  binding, bounded disclosure choice, visitor preview, and public rendering.
- **Phase 22/D2-D4:** the sole Page Release Manifest/head and release path,
  family Presentation Block Contract, and existing review/automatic lane.
- **Phase 13:** corrected posted-effective gross and typed-count projections,
  campaign goals, hierarchy scope, provisional-public eligibility, and Giving.
- **Phase 15:** governed offline entry and the commit that may create Phase 13
  posted-effective truth; no direct public-progress source.
- **Phase 16:** commitment/cadence truth and the certified public-safe aggregate.
- **Phase 28:** Support-Raising Goal Versions; no page visibility authority.
- **Phase 10:** public eligibility, privacy-before-aggregation, small-cell
  suppression, and current safety ceiling.
- **Phase 20/21/33:** accounting, Field Account/payment, and analytical-
  conversion truth respectively; none may substitute for D6 sources.

### Rejected alternatives

- mandatory meters, one tenant-global visibility flag, or goal-presence-implies-
  public-display;
- live inheritance from tenant or Page-Family defaults and silent bulk mutation;
- missionary-equals-monthly or project-equals-finite metric selection;
- tenant-authored formulas, manual starting amounts, hidden offsets, mixed
  commitments and receipts, cross-currency totals, or Phase 21 balances;
- mutable CMS/current counters, request-time source-table aggregation, public
  source access, CSS-only hiding, or cache keys without profile/safety scope;
- missing/stale source becoming zero, last-known-value fallback, or silent metric
  substitution; and
- progress completion controlling Giving or progress failure taking down the
  otherwise safe page.

**Architectural record:**
[ADR-0123](../../adr/0123-page-resolved-source-authoritative-public-support-progress.md).

## D7 — One exact Page Giving Binding per released page for the MVP

**Status:** Ratified and adversarially hardened on 2026-08-04.

> **B-prime-amended-and-hardened (B-prime-R) — Phase 22 MVP requires every
> released Missionary Ministry Page and Project/Campaign Page to pin one
> immutable, released-page-owned Page Giving Binding to exactly one Phase 13
> Designation under the exact Tenant, Legal Entity, Site, environment, and
> currency lane; carried through Phase 5's server-resolved plain-parameter
> handoff and revalidated at cart/checkout entry and immediately before provider
> execution against the current D2 release, Phase 10-safe public eligibility and
> donor-visible labels, exact binding and Designation eligibility, Settlement
> Account Binding, issuer, currency, supported cadence, registered attribution,
> and allowlisted internal return path. Every CTA placement shares that one
> destination while source code, copy, suggested amount, and suggested frequency
> may vary only as independently validated context or bounded suggestions;
> destination replacement is prospective, staff-controlled, consequence-
> previewed, and released through D2's sole path. A stale, forged, cross-scope,
> paused, or otherwise ineligible binding receives immediate affected-CTA
> containment with a calm page-visible/Giving-unavailable state and, when the
> tenant supplies it, one separately labelled fresh general-giving path that
> carries no inherited destination — without a Phase 22 MVP fund picker,
> contributor-controlled destination, mutable CMS checkout URL, source-code or
> UTM routing authority, stale-cache authority, cross-tenant or cross-entity
> selection, automatic fallback, adjacent-purpose substitution, or any claim
> that a page, CTA click, cart line, Checkout Session, provider acceptance, or
> attribution fact proves a contribution.**

### Binding interpretation

- Every released Phase 22 page has exactly one Page Giving Binding and exactly
  one Phase 13 Designation. Draft preparation may be incomplete, but D2 cannot
  release a page until the binding and all current owning-domain proofs pass.
- The MVP has no `No Giving` configuration posture and no page-level list of
  Designations. If an exact binding later becomes ineligible, the safe page may
  remain publicly reachable under D2 while only Giving becomes unavailable.
  This is a failure/containment state, not a second configured destination.
- A D8 Transition Notice Release remains a released page under this same rule.
  It cannot suppress an otherwise eligible Give action; it renders the exact
  current D7/Phase 13 state and may explain that recurring support is managed
  separately without changing it.
- Missionary and Project/Campaign pages use the same one-destination rule. A
  campaign's Phase 13 `expected designations` remains staff intent and a future
  product seam; it does not create, enumerate, or authorize a Phase 22 MVP
  public picker.
- All hero, body, sticky-mobile, Ministry Update, and other CTA placements on
  one page resolve the same released binding. A block or contributor may vary
  bounded copy, a registered source code, or supported amount/frequency
  suggestions, but cannot name or encode another financial destination.
- The donor may deliberately use Phase 13's separate **Add another
  designation** action after the page-origin line enters the cart. That is a new
  donor choice and never rewrites the page's origin, Designation, attribution,
  or immutable cart-line evidence.
- `source_code`, UTM values, locale, entry method, referrer, and return path are
  untrusted context. They neither choose nor override the Designation, Legal
  Entity, Settlement Account Binding, currency, cadence, charge, or issuer.
- A Page Giving Binding is not a contribution, restriction, commitment,
  settlement, Field Account allocation, receipt, Accounting Release, or payment
  fact. Phase 13 alone creates contribution truth after its own acceptance
  contract succeeds.

### Handoff, revalidation, and failure behavior

- Phase 5 carries opaque identifiers and presentation context through the
  already ratified plain-parameter handoff. A signed page token is not required
  because no client parameter, cached fragment, CMS value, or provider object is
  authority.
- The server resolves the trusted host to Site and Tenant, then re-proves exact
  same-scope Tenant, Legal Entity, current D2 release, live Phase 10 ceiling,
  Page Giving Binding, Designation, donor-visible alias/label, current Phase 13
  public-giving eligibility, Settlement Account Binding, environment, ISO
  currency, cadence capability, attribution registration, and internal return
  path before cart mutation or checkout rendering.
- The final Phase 13 acceptance boundary repeats all financial and safety facts
  that may have changed before any provider-side object is created or reused.
  A previous successful page render or cart add cannot authorize a later
  provider operation.
- A stale, missing, forged, ambiguous, cross-tenant, cross-Site, cross-Legal-
  Entity, wrong-environment, unsupported-currency, or ineligible binding fails
  closed. The system never searches for a nearby Designation or silently routes
  to the organization fund, another worker, another project, or a former
  destination.
- Current destination revocation or adverse eligibility change expires the
  affected CTA cache scope immediately while request-time gates remain
  authoritative. A transient checkout/provider outage degrades only the Giving
  action and does not automatically withdraw an otherwise safe page.
- The public state uses named explanatory text such as **Giving is temporarily
  unavailable**, not a dead disabled button. If an independently configured
  **Explore other ways to give** link is shown, it starts a fresh general-giving
  choice with no inherited Designation, amount, cadence, or claim of continuity.
- Repeated taps, navigation retries, and provider retries reuse Phase 13's cart-
  line/session idempotency. A CTA click alone writes no contribution or donor
  record.

### Staff, contributor, and donor experience

- Staff see one quiet **Giving** card with the exact donor-visible destination,
  receiving Legal Entity, ISO currency, supported one-time/recurring choices,
  source attribution summary, and one honest state: **Ready**, **Giving
  unavailable**, or **Staff action needed**.
- Changing the destination is a protected tenant action. Staff select one exact
  eligible Designation, preview the resulting public label, issuer, currency,
  cadence, and affected CTA placements, then submit the normal D4/D5 candidate
  for D2 release. No mutable live dropdown or in-place CMS URL edit exists.
- Healthy pages create no review chore. One cause-owned exception identifies the
  exact failed proof and the smallest authorized next action when a binding is
  unavailable or has drifted.
- Contributors see the current read-only destination summary and exact visitor
  preview. They may edit allowed CTA copy or suggestions where the Presentation
  Profile permits, but cannot select, replace, disable, or repair the binding or
  alter issuer/currency/eligibility truth.
- Donors see the ministry purpose they selected, exact Phase 10-safe destination
  label, receiving organization, currency, amount, and cadence before
  confirmation. They are not forced through a universal fund directory on the
  primary path.

### Data, isolation, migration, and certification

- The immutable binding and release pin carry exact Tenant, Legal Entity, Site,
  page, Page Family, Designation, environment, currency lane, source revision,
  actor, effective interval, and release generation with composite same-scope
  constraints, indexed RLS, explicit grants, and server-command-owned writes.
- The D2 Page Release Manifest remains the sole current page configuration head.
  D7 creates no second active pointer, checkout authority, mutable CMS mirror,
  or donor-visible database endpoint.
- Anonymous clients never enumerate or directly query Page Giving Bindings,
  Designations, settlement bindings, internal IDs, or restricted labels. The
  Phase 5 server choke point returns only the minimum Phase 10-safe serialized
  presentation needed for the current page.
- Existing mock worker/fund IDs, soft CMS references, hand-built checkout URLs,
  and arbitrary CTA destinations are migration evidence only. Existing pages
  remain Not public until one exact binding is mapped, shadow-resolved, and
  deliberately released; uncertainty never becomes a general-fund fallback.
- D7 implements the singular MVP contract directly rather than a dormant
  polymorphic offer DSL or hidden feature-flagged picker. Phase 13's campaign
  intent data remains intact so a later separately ratified public-choice
  contract can be added prospectively without redefining historical bindings.
- Certification covers both Page Families, every CTA placement, one-time and
  recurring suggestions, source-code variation, Phase 10 aliases, paused and
  retired Designations, settlement/currency/environment drift, forged and
  replayed parameters, stale page/cart/cache races, duplicate taps, provider
  outage, destination replacement, tenant/Site/Legal-Entity isolation,
  migration from legacy URLs, privacy-safe observability, mobile/reflow,
  keyboard and screen-reader behavior, and production-volume resolution.

### Source-of-truth boundaries

- **Phase 22/D7:** the exact released page-to-Designation binding, protected
  replacement workflow, page-level CTA consistency, public readiness summary,
  and affected-action containment.
- **Phase 22/D2-D5:** the sole release manifest/head, current public reach,
  presentation placement, candidate/review path, and mandatory safety checks.
- **Phase 5:** host/site resolution, server-only public reader, plain-parameter
  transport, public cache boundary, and checkout resolver interface.
- **Phase 10:** current public eligibility and safe donor-visible identities,
  labels, media, and metadata.
- **Phase 13:** Designation, Settlement Account Binding, cart-line identity,
  contribution eligibility and acceptance, charge partitioning, provider
  execution, and contribution truth.
- **Phase 16:** independently authoritative recurring authorization and cadence
  semantics after the donor elects a supported recurring option.
- **Phase 20/21:** accounting/settlement and Field Account/payment truth; neither
  selects, replaces, or validates a public Giving destination.

### Rejected or deferred alternatives

- the universal Designation chooser as the page's primary CTA;
- a bounded same-campaign public picker in the Phase 22 MVP — Phase 13's intent
  seam remains, but public multi-choice requires a later explicit decision;
- an intentional `No Giving` configuration posture for these two MVP page
  families;
- mutable tenant/CMS checkout URLs, client-trusted IDs, signed-token-as-
  authority, source/UTM-driven routing, or contributor-selected destinations;
- multiple destinations hidden behind different page sections or responsive
  CTA variants;
- automatic general-fund, successor, adjacent-project, or same-campaign
  substitution; and
- treating page reach, a CTA click, cart mutation, Checkout Session, provider
  acceptance, or attribution capture as contribution truth.

**Architectural record:**
[ADR-0124](../../adr/0124-one-exact-page-giving-binding-for-phase22-mvp.md).

## D8 — Source-qualified route and lifecycle dispositions

**Status:** Ratified and adversarially hardened on 2026-08-04.

> **C-prime-amended-and-hardened (C-prime-R) — one source- and
> cause-qualified, append-only Public Page Route Disposition Case for every
> canonical-route change or terminal Missionary Ministry Page or
> Project/Campaign Page transition, preserving D2 Publication Reach, D7's one
> exact Page Giving Binding, Phase 10 safety and concealment, Phase 13
> Designation and source-purpose-succession truth, and Phase 16 recurring-
> support truth as independently authoritative. Each case binds the exact
> Tenant, Legal Entity, Site, locale, Page Family, immutable Page identity,
> origin Route Generation, source family and version, cause, actor, effective
> time, release heads, and effect manifest, and offers only currently proved
> outcomes: continue the current release; publish a substantive, coverage-aware
> Transition Notice Release whose every claim is through-dated and proof-gated;
> permanently move an eligible Listed-public address only to the same immutable
> Page's already released, currently eligible new canonical Route Generation;
> or remove it through the same privacy-safe real `404` and `noindex` response as
> an unknown page. A different eligible, proved same-purpose successor
> presentation may appear only as a separately labelled fresh link from a
> transition notice, with no inherited Designation, amount, cadence, source code,
> query, return path, or recurring-support action; it is never an automatic
> redirect. Shared-by-link and restricted/direct-link rotations retain D2's
> non-redirecting tombstones, and unknown, ambiguous, stale, or unavailable
> resolution never becomes a cached move or removal. Supabase keeps normalized,
> never-reused immutable route and disposition facts in a non-browser operational
> boundary with explicit grants, indexed defense-in-depth RLS, externally unique
> Site × locale × canonical-path identity, composite same-scope foreign keys,
> deterministic locking, semantic idempotency, and D2-head CAS activation; Phase
> 5 performs indexed one-hop request-time resolution, rechecks target eligibility,
> and returns the exact `200`, `308`, `404`, or transient no-store `503` result.
> One accessible, mobile-ready staff page asks what supporters should see,
> previews the literal visitor result and independent Page, new-Giving,
> recurring-gift, discovery, and external-cache consequences, and requires only
> one final confirmation for permanent move or removal. Effects use an idempotent
> outbox and immutable manifest for origin response, scoped cache invalidation,
> internal links, canonical and structured metadata, social metadata, and
> sitemap membership; external cleanup remains observed best effort — without
> automatic departure-to-retirement inference, a separate `410` behavior,
> redirect chains, raw or external URLs, cross-scope targets, destructive
> deletion or rollback, path reuse, mutable CMS route authority, contributor-
> controlled lifecycle, general-fund or adjacent-ministry fallback, untrusted
> parameter forwarding, silent recurring changes, or any claim that worker
> departure, page transition, route movement, Designation closure, recurring
> termination, cache purge, search removal, and donor transition are the same
> fact.**

### Binding interpretation and four outcomes

- A qualifying lifecycle or route source fact opens work and supplies evidence;
  it never selects a disposition. Source families and versions are typed rather
  than collapsed into one `departed`, `archived`, or `closed` status.
- **D19 precision:** Ministry Assignment retirement or source succession is one
  such source-qualified cause for a Missionary Ministry Page. Participant
  membership, spouse/team relationship, public display, contributor access, or
  Ministry Assignment Support Binding change does not itself retire, redirect,
  or repoint the Page. After first public release, representing a different
  Ministry Assignment requires a new Page identity and this D8 succession path.
- **Continue current release** is available only while the exact D2 release and
  current Phase 10 ceiling still permit it. D7 independently decides whether its
  Giving action works. Choosing it closes the cause-owned case without appending
  a redundant route disposition.
- **Publish transition notice** creates a normal immutable D2 release with D3-
  certified content at the existing route. It may publish before Phase 13/16
  transition work completes, but every statement is through-dated and states
  open work as open. It is a substantive `200` document with self-canonical
  metadata, not a soft `404` or redirect interstitial. It retains the exact D7
  binding and renders its current Phase 13-owned Giving state; D8 cannot create
  an intentional no-Giving posture.
- **Move this address** is available only for a Listed-public origin and an
  already released, currently eligible canonical Route Generation belonging to
  the same immutable Page. It produces one direct `308`; it never follows or
  builds a redirect chain. Only navigation-safe `GET` and `HEAD` requests may
  receive it; mutating methods never receive a method-preserving permanent
  redirect.
- **Remove this address** returns the same tenant-branded real `404` with
  `noindex` used for an unknown page. The internal disposition preserves exact
  history, but the public response does not disclose whether a route once
  existed. Phase 22 does not add a separate `410` surface.
- A different page can be a Phase 13-proved same-purpose successor presentation,
  but never a redirect target. A transition notice may offer a clearly labelled
  link only while that target is currently released and eligible. The fresh
  navigation carries no inherited financial or recurring intent.
- A permanent redirect is externally sticky. The consequence review says that
  browsers, intermediaries, search systems, and copied links may retain it and
  that Asym cannot recall every external copy. Later safety narrowing still
  makes local target serving fail closed.

### Route, data, and request-time contract

- A Public Page Route Generation binds one normalized path to an exact Tenant,
  Legal Entity, Site, locale, Page Family, immutable Page, D2 release, and
  versioned code-owned canonicalizer. Ambiguous percent encoding, case or
  trailing-slash collisions, dot/control segments, and noncanonical forms are
  rejected rather than resolved by database collation or request order. The
  canonicalizer also enforces byte/segment limits, canonical locale, safe ASCII
  Listed slugs, high-entropy opaque direct-link keys, deterministic `C`
  collation, and reserved application namespaces such as API, `_next`, preview,
  checkout, sitemap, and robots.
- The public-address uniqueness key is exactly Site × locale × canonical path
  key: it must not include Legal Entity, Page Family, or Page, because those
  hidden dimensions cannot make the same externally resolved URL unique.
  Composite foreign keys and `NOT NULL` constraints separately preserve Tenant,
  Legal Entity, Site, locale, Page Family, Page, and route-generation scope.
- A path identity is never reused after tombstoning. A same-page `308` target
  must match Tenant, Legal Entity, Site, locale, Page Family, and immutable Page
  identity structurally.
- Route generations, dispositions, source evidence, and tombstones are append-
  only operational facts. One small derived current projection accelerates
  lookup but grants no authority. Mutable CMS slugs, Payload redirect rows, CDN
  rules, or Next configuration are not parallel truth.
- Operational tables are unexposed/server-only by construction with explicit
  grants, indexed defense-in-depth RLS, and no anonymous/authenticated browser
  read or write, Realtime publication, or default function execution. Privileged
  helpers live in the private schema with a fixed safe search path and explicit
  actor/scope checks. Service credentials are treated as RLS-bypassing and must
  still pass the server command's own scope checks. Integrity conflicts return
  authorized non-enumerating domain errors because PostgreSQL constraint checks
  themselves can cross RLS boundaries. Anonymous requests receive only the
  minimum Phase 10-safe domain result from the Phase 5 host/site/tenant boundary.
- A single command re-proves actor, permission, source version, D2/Phase 10/D7
  state, current origin and target release heads, path availability, and pinned
  preview; locks route/page heads in deterministic order; appends the
  disposition; and advances D2's authority head through one idempotent CAS.
  Concurrent or stale work blocks with a refreshed consequence review. No
  Payload, cache, crawler, or other network call runs while database locks are
  held.
- Request-time resolution is one indexed hop. Before a `308`, Phase 5 rechecks
  the exact target generation's current D2/Phase 10 eligibility. If the target
  becomes unsafe, the origin returns the same privacy-safe `404` and one cause-
  owned exception opens.
- When an already moved same-page route moves again, the controlled command
  appends superseding dispositions for its active inbound predecessor routes so
  fresh requests resolve directly to the latest eligible target. Previously
  cached external redirects may still chain and cannot be recalled; Asym claims
  only that it no longer issues the chain.
- Every request performs a fresh server-only current route/safety guard before
  selecting immutable cached release content. Cache keys include exact route,
  release, disposition, and safety generations; invalidation speeds convergence
  but never authorizes serving.
- Resolver, storage, or authoritative-proof unavailability never becomes a
  cached redirect or false `404`. The runtime returns a neutral tenant-branded
  `503` with `Retry-After` and `Cache-Control: no-store`; known local safety
  denial continues to return its authoritative privacy-safe `404`.
- Redirect responses drop query strings and fragments by default. Only
  allowlisted, revalidated, non-routing attribution may survive, and it can
  never select a Designation, locale, successor, amount, cadence, return path, or
  other behavior.

### Staff, contributor, and visitor experience

- Healthy routes are silent. A cause-owned exception opens one responsive page
  titled **What should supporters see at this address?** with the source event,
  effective/as-of time, old address, current reach, title/alias, D7 Giving state,
  and real visitor preview.
- The interface shows only eligible outcome cards and recommends the safest
  reversible result. If an expected choice is unavailable, **Why can't I move
  this page?** names the missing proof without exposing restricted details.
- A plain-language consequence table separates **Page**, **New gifts**,
  **Existing recurring gifts**, and **Search and shared links**. The preview
  supplements rather than replaces that text.
- Exact actions are **Keep page**, **Publish transition page**, **Move this
  address**, and **Remove this address**. Only move and removal receive one final
  confirmation naming the exact consequence; there is no slug-typing ritual or
  repeated certification.
- Focus order and reading order remain logical on desktop and one-column mobile;
  all actions have adequate touch targets; explanatory content is not hover-
  only; color/icons are not the sole signal; cancel is the least-destructive
  initial confirmation action; and success/failure is announced without losing
  the user's selection.
- Missionary contributors see the current read-only disposition summary and
  visitor preview inside their page workspace. They cannot select or edit a
  route, target, source purpose, financial result, or recurring disposition.
- Visitors receive exactly one honest local result: current page, substantive
  transition notice, same-page one-hop move, or privacy-safe not found. A
  removed page may retain ordinary site navigation and a separately labelled
  contact or fresh general-giving link when independently configured, but never
  inherits a destination.

### Failure, effects, migration, and certification

- One immutable Public Page Route Effect Manifest covers the origin response,
  scoped cache invalidation, internal links, canonical metadata, structured
  data, social metadata, and sitemap membership. An idempotent outbox performs
  these effects with bounded retry, age/error telemetry, and dead-letter repair;
  partial failure never changes the locally authoritative disposition.
- Search, browser, CDN, social-preview, QR, and copied-link state remains an
  observed external outcome. Telemetry distinguishes local authority from each
  cleanup result and promises neither immediate removal nor special search
  treatment from the not-found response.
- Privacy-safe observability covers resolution outcomes, latency, collision,
  cycle/cross-scope attempts, stale targets, cache/metadata divergence, and
  effect retries. Synthetic probes exercise old and target routes without
  logging restricted paths, names, queries, or operational evidence.
- Recovery is append-only: inspect the current domain and effect state, then
  append a correcting disposition or residual effect request. There is no blind
  retry, destructive rollback, route reuse, or edit of a cached `308` promise.
- Bulk lifecycle work orchestrates exact per-page commands and cannot bypass
  outcome eligibility, Phase 10, concurrency, or consequence proof.
- Migration begins with a complete Tenant/Site/locale/path census of mock IDs,
  name-derived routes, mutable CMS slugs, existing redirects, and copied public
  links. Only exact, reviewed, collision-free mappings enter production-shaped
  shadow resolution; no legacy page is inferred public, no unsafe name route is
  redirected, and no history is fabricated.
- Certification covers route normalization, each Page Family and reach class,
  locales, same-page move, successor link, target withdrawal, recurring work
  still open and later complete, stale previews, concurrent release/disposition,
  replay/digest conflict, repeated moves, non-`GET`/`HEAD` requests, partial
  effects, external-cache persistence, tenant/Site/Legal-Entity isolation,
  anonymous/authenticated/service-role/function-grant matrices, constraint-error
  enumeration resistance, privacy/timing, exact-index production-volume lookup,
  keyboard, screen reader, mobile/reflow, and append-only recovery.

### Source-of-truth boundaries

- **Phase 22/D8:** route-generation and disposition semantics, source-qualified
  case, transition notice, same-page move eligibility, removal outcome,
  never-reused tombstone, consequence UX, and effect manifest.
- **Phase 22/D2-D7:** sole current release/reach authority, presentation,
  candidate/review path, progress, and exact Page Giving Binding. D8 references
  and never recreates them.
- **Phase 5:** host/site/tenant resolution, public reader, exact HTTP serving,
  scoped cache integration, and minimal public serialization.
- **Phase 10:** current safety, public identity, and existence concealment.
- **Phase 13:** Designation, new-Giving eligibility, and accepted source-purpose
  succession. Its proof may qualify a successor link but never moves a route,
  contribution, or recurring gift.
- **Phase 16:** recurring authorization, transition, continuation, stop, and
  successor facts. D8 mutates none of them.
- **Phase 23/Payload:** general CMS route infrastructure and ordinary redirect
  UI. It may effect but cannot authorize Phase 22 semantic dispositions.
- **External browsers, caches, search, social, and copied links:** observed
  propagation only, never local truth or completion authority.

### Rejected alternatives

- always remove every terminal page, or keep stale fundraising copy until every
  downstream transition completes;
- a tenant-authored lifecycle DSL, arbitrary status matrix, generic redirect
  editor, raw URL, external target, or client-selected successor;
- an automatic redirect to another worker, project, campaign, organization fund,
  homepage, or merely similar/same-purpose page;
- redirect chains, query/fragment passthrough, locale fallback, cross-scope
  movement, path reuse, or mutable target slugs;
- a CMS/Payload row, Next static configuration, CDN rule, crawler result, or
  Search Console state as route authority;
- a separate public `410`, soft `404`, cached permanent outcome from missing
  proof, or promise that local removal proves external deletion;
- page retirement that pauses, cancels, redirects, or re-designates a recurring
  commitment or contribution; and
- destructive deletion, rollback, replay, or repeated manual certification.

**Architectural record:**
[ADR-0125](../../adr/0125-source-qualified-public-page-route-dispositions.md).

## D9 — Release-bound Public Ministry Media Assets

**Status:** Ratified and adversarially hardened on 2026-08-05.

> **C-prime-amended-and-hardened (C-prime-R) — one release-bound,
> Phase-29-compatible Public Ministry Media Asset contract separating
> short-lived private, non-authoritative Upload Intakes from immutable
> Sanitized Media Master Versions and bounded placement-specific Public Media
> Derivative Manifests; with one server-minted single-object Upload Intent,
> opaque application-owned immutable identities, and exact Tenant, Legal
> Entity, Site, subject or purpose, Page, Page Family, locale, placement,
> actor, safety/consent, environment, and processor-generation scope. Every
> qualifying still image passes an allowlist; declared-type, extension-hint,
> signature, and decoder agreement; sandboxed complete bounded one-frame
> decode; malware/sandbox disposition; orientation application; controlled
> sRGB pixel reconstruction; complete re-encoding; and an independent
> post-encode reparse proving exact type, dimensions, digest, frame count, and
> absence of source-derived EXIF, GPS, IPTC, XMP, maker notes, comments,
> embedded thumbnails, auxiliary images, sensitive source profiles, and
> original-name data. The raw intake expires after a bounded retry/quarantine
> interval, and the source filename is discarded after local selection by
> default; any separately proved private retention exception is
> Phase-29-governed and never public. No source filename may enter a durable
> identity,
> storage key, provider ID/display name, delivery URL/query/header, public
> serializer/API/HTML, Open Graph, JSON-LD, sitemap, alt-text default, log,
> analytic, error, export, or generated derivative. Each context-owned Public
> Ministry Media Placement Version pins one semantic role, focal point/crop,
> contextual alt-or-explicit-decorative decision, caption/attribution, exact
> master and derivative manifest, and responsive/card/social variants; D3 owns
> the typed placement, D4/D5 own the sole tenant-selected review/release lane,
> and an immutable Page Release Manifest atomically pins only certified
> derivatives after fresh D2 and Phase 10 reproof. Replacement preserves the
> coherent old live release until the new release succeeds; scope-safe reuse
> has exact where-used evidence; remove-from-this-page is a normal draft;
> urgent remove-everywhere is smallest-scope Phase 10 containment. One
> Asym-controlled opaque resolver rechecks current release and safety before
> selecting private-origin bytes, serves correct typed no-sniff responsive
> output, and records targeted purge/provider outcomes without claiming recall
> from caches, screenshots, downloads, archives, or third parties. Phase 22
> owns public-media meaning, placement, release eligibility, and withdrawal
> intent; Phase-29-compatible custody owns bytes, scans, transforms, copy
> inventory, access, retention, and disposal evidence; providers prove only
> exact operations. Contributors receive one accessible
> choose-check-focus-describe-save flow with honest processing states, while
> healthy media creates
> no second staff queue—without public originals, raw provider URLs, mutable
> overwrite/upsert, MIME/client/provider-default trust, unbounded decode,
> arbitrary transforms or remote fetches, SVG, animation or silent frame
> selection, cross-tenant deduplication, generic Payload Media authority,
> filename-derived title or alt text, AI safety authority, duplicate
> publication authority, or any claim that selected, uploaded, scanned,
> transformed, ready, reviewed, released, cached, withdrawn, deleted, or
> externally forgotten are the same fact.**

### Binding interpretation

- Phase 22 owns the semantic asset, page- and locale-specific placement,
  release eligibility, exact release pin, where-used meaning, and withdrawal
  intent. Phase 29-compatible custody owns private bytes, scanning,
  transformation mechanics, copy inventory, access, retention, quarantine,
  holds, and disposal evidence. A provider proves only its exact operation.
- A private Upload Intake is temporary and non-authoritative. The durable
  reusable source is an immutable Sanitized Media Master Version, and only a
  certified placement-compatible derivative may enter a Page Release Manifest.
- The original filename may be visible only in the user's local file picker.
  It is discarded after selection by default and may never reach a durable key,
  public response, metadata surface, telemetry, error, export, or generated
  derivative. Metadata removal does not prove that visible pixels are safe;
  Phase 10 still controls faces, children, uniforms, signs, location clues, and
  all other public-safety meaning.
- Launch certification is limited to qualifying one-frame JPEG, PNG, and WebP
  still images. A format such as HEIC, HEIF, or AVIF requires exact production
  certification before enablement. SVG, animation, silent frame selection,
  arbitrary remote fetch, and unbounded transformations are rejected.
- Alt text or an explicit decorative choice, crop/focal point, caption,
  attribution, locale, semantic role, and rendition needs belong to the
  placement because the same image can mean something different elsewhere.
  Filename-derived title or alt text is forbidden.
- D4/D5 remain the only content review and release lane. A clean image follows
  the page's existing tenant-selected path and creates no media-specific staff
  queue. Replacement keeps the previous coherent live release until the new
  candidate is certified and atomically released.
- **Remove from this page** creates an ordinary page draft. **Remove everywhere
  now** invokes smallest-scope Phase 10 containment over exact where-used
  evidence. Asym may deny future local delivery and record observed purge
  results, but cannot promise recall from screenshots, downloads, archives,
  third-party caches, or other external copies.
- The public renderer uses an opaque Asym-controlled reference over a private
  origin and freshly rechecks the exact release, D2 reach, and Phase 10 safety.
  A raw CMS, Supabase, CDN, transformation-provider, or storage URL is never
  publication authority.
- Structural Tenant, Legal Entity, Site, Page, Page Family, locale, placement,
  subject/purpose, actor, environment, processor-generation, and safety scope
  is mandatory. RLS is defense in depth; server-side authorization remains
  required for privileged paths. Cross-tenant observable deduplication is
  forbidden.

### Quiet UX contract

Contributors use one accessible **choose → check → focus → describe → save**
flow inside the existing page draft. The surface shows honest processing,
ready, needs-attention, and retry states; provides keyboard-operable focal-point
controls; requires contextual alt text or an explicit decorative choice; and
previews responsive, card, and social crops. Security mechanics, metadata,
storage providers, processing generations, and filenames create no tenant
configuration burden and no routine staff work.

### Failure, recovery, and certification

- Declared type, extension hint, byte signature, and full decoder result must
  agree. Processing is bounded, sandboxed, one-frame, and fail-closed.
- Readiness requires complete decode, orientation application, controlled sRGB
  pixel reconstruction, complete re-encode, and independent reparse proving
  exact type, dimensions, digest, frame count, and absence of every prohibited
  source-derived field and auxiliary image.
- Jobs are idempotent and generation-pinned. Stale, superseded, ambiguous, or
  partially completed work cannot become ready or overwrite an immutable
  object. Orphan and missing-release-derivative monitoring is mandatory.
- Processor, decoder, encoder, provider-mode, threshold, transform-recipe,
  output-format, storage, resolver, or cache-policy changes invalidate only the
  affected capability certificate prospectively; history is never rewritten.
- Production authorization requires the adversarial corpus and concurrency,
  cross-scope, accessibility, public-response-crawl, performance, outage,
  withdrawal, and cache-convergence tests enumerated in the D9 evidence record.

### Source and phase boundaries

- **Phase 10:** current publication ceiling, public-field eligibility,
  emergency containment, and safety meaning. D9 cannot weaken or override it.
- **Phase 22 D2–D5:** reach, presentation placement, review mode, staff judgment,
  and the sole Page Release command. Media processing is not publication.
- **Phase 29:** shared byte custody and lifecycle mechanics. It must preserve
  D9's source-name, private-origin, immutable-generation, access, and disposal
  invariants rather than reinterpret public-ministry meaning.
- **Payload/CMS and storage/CDN providers:** authoring or byte infrastructure
  only; their media rows, status, URL, cache, transformation, or delete result
  is not Asym release, safety, withdrawal, or forgetting truth.

### Rejected alternatives

- publicly serving uploaded originals, original names, raw provider URLs, or
  mutable provider objects;
- trusting MIME, extension, browser checks, CMS validation, or provider defaults
  without full decode, reconstruction, and output proof;
- a generic tenant transform builder, arbitrary remote URL, SVG/animation
  launch surface, cross-tenant deduplication, or universal media capability;
- filename-derived labels, AI as safety authority, public Payload Media rows,
  or a second publication/review workflow;
- destructive replacement, deleting history, provider deletion as withdrawal
  completion, or claiming that Asym can make already copied public media
  externally forgotten.

**Architectural record:**
[ADR-0126](../../adr/0126-release-bound-public-ministry-media-assets.md).

## D10 — Authenticated exact-version Public Ministry Preview

**Status:** Ratified and adversarially hardened on 2026-08-06.

> **A-prime-amended-and-hardened (A-prime-R) — one
> authenticated-and-currently-authorized, exact-version Public Ministry
> Preview with no bearer preview access.**

### Binding interpretation

- Authentication is mandatory and insufficient. A current D1 Public Page
  Contributor may preview only one explicitly selected, coherently saved
  working revision of an assigned Page. Authorized staff editors and D4/D5
  reviewers may preview only the exact immutable candidate covered by their
  current capability.
- A tenant may give one existing verified tenant principal an exact page- and
  candidate-scoped Phase 12 `public_pages.preview` named grant, with reason,
  provenance, current state, authorization epoch, and expiry. This supports a
  spouse, field leader, coach, or adviser without granting edit, submit, review,
  approval, release, publication, CMS, operational, or financial access.
- No anonymous, bearer, password, guest-token, shareable-preview-link, or
  preview-specific identity, invitation, or directory system exists. A person
  without an account uses the ordinary verified identity and tenant-membership
  onboarding path; invitation alone grants nothing.
- Every HTML, RSC/data, media, refresh, and session-continuation request
  re-proves the exact Principal, non-anonymous session, Active Tenant
  Assignment, Tenant, Legal Entity, Site, Page Family, Page, locale, saved
  revision or immutable candidate, purpose, current applicable Public Page
  Contributor Assignment/capability/grant
  and expiry, authorization epoch, environment, Phase 10 ceiling, D3 profile/
  renderer generation, and D9 media coverage.
- URL or opaque-id possession, a Payload user, role name, Supabase
  `authenticated` role, Draft Mode cookie, CMS secret, subject/spouse/team/
  participant relationship, Support Assignment, Designation Binding, prior
  successful request, or service role is never preview authority.
- Phase 5 owns the one production-equivalent reader and renderer plus guarded
  Draft Mode plumbing; D9's opaque resolver supplies only eligible media. Draft
  Mode selects a read perspective and never grants permission.
- An open preview stays pinned when newer work is saved. The UI may state **A
  newer version is available** and offer a deliberate **Preview latest saved
  version** action; it never silently follows `latest`.
- Preview uses the current Phase 10 public-safe projection. Raw blocked content
  belongs only in a separately authorized diagnostic/editor surface and cannot
  be exposed by weakening preview.

### Quiet UX and accessibility contract

Missionary and staff editors expose one **Preview** action and no **Share** or
**Copy review link** action. Preview shows a persistent **Preview — not public**
banner with the page, locale, exact version, state, and saved/through time;
provides responsive desktop, tablet, and phone views; and labels **View live
page** separately only when a current release exists. Give controls, forms,
embeds, notifications, tracking, analytics, and every consequential action are
visually representative but inert and announced unavailable.

The surface is keyboard and screen-reader operable, meets reflow/zoom/focus/
contrast/touch-target requirements, and announces loading, saved, stale,
unavailable, and newer-version states without moving focus unexpectedly.
Session expiry uses one allowlisted same-origin login continuation and then
reauthorizes the exact target. Authentication supports password managers,
paste, autofill, and a non-memory-only completion path.

### Failure, privacy, recovery, and certification

- Responses are private, `no-store`, non-indexable, non-archivable,
  referrer-suppressed, and absent from sitemaps, canonical/social metadata,
  public analytics, and discovery output.
- Unauthorized, revoked, expired, missing, and wrong-scope requests return the
  same non-enumerating **Preview unavailable** envelope. The exact cause is
  available only through an independently authorized diagnostic surface.
- Revocation, tenant switching, grant expiry, authorization-epoch change,
  Phase 10 narrowing, and D9 withdrawal win the next affected request. Pixels
  already rendered, copied, downloaded, or screenshotted cannot be recalled.
- Owner-store, authorization, renderer, generation, or media ambiguity fails
  closed and never falls back to raw Payload content, mutable `latest`, the live
  page, or a public route.
- Production authorization requires actor-matrix, cross-Tenant/Legal-Entity/
  Site/Page/locale/version substitution, copied-URL, anonymous-Supabase,
  revocation/expiry, concurrent-save, exact-version, renderer-parity, inert-
  effect, D9 media, response-header/crawler, session-continuation,
  accessibility, outage, and load/rate-fairness tests.
- Preview remains separate from reviewed, approved, released, published, live,
  Giving-ready, delivered, payable, and paid truth.

### Source and phase boundaries

- **Phase 22 D10:** exact preview target, experience, version pinning, inert
  effects, and non-equivalence to release truth.
- **Phase 12 and D1:** current Principal authorization, contributor assignment,
  staff/reviewer capabilities, named grants, expiry, epoch, and revocation.
- **Phase 10:** current public-safe projection ceiling and affected-scope safety
  withdrawal.
- **Phase 5:** guarded HTTP/Draft Mode plumbing and the production-equivalent
  reader/renderer; neither creates authority.
- **D3 and D9:** compatible renderer/profile generation and exact safe preview
  media. Raw CMS/storage/provider URLs remain ineligible.

### Rejected alternatives

- all authenticated users, a Payload role, or Draft Mode as authority;
- anonymous, bearer, expiring-link, password, guest-token, or forwarded-link
  review access;
- a preview-specific account, invite, directory, or permission product;
- staff-only preview that prevents contributors from checking their own work;
- mutable `latest` preview, an approval that floats to a newer save, or a
  separate renderer;
- active Give/forms/embeds/notifications/analytics inside preview; and
- any claim that a preview proves review, approval, release, public serving,
  provider completion, or payment.

D10 closes Phase 5's reserved shareable non-staff preview-token seam. D2's
**Shared by link — public** outcome remains anonymous and reshareable only for
an already released page; it is not preview and is unchanged.

**Architectural record:**
[ADR-0127](../../adr/0127-authenticated-exact-version-public-ministry-preview.md).

## D11 — Canonical Ministry Update audience release projections

**Status:** Ratified and adversarially hardened on 2026-08-06.

> **C-prime-amended-and-hardened (C-prime-R) — one canonical,
> source-scoped, independently and immutably versioned Ministry Update with one
> exact Audience Release Manifest and independently authoritative Public Page
> and authenticated purpose-authorized Supporter Release Projections; composed
> through D1 contributor authority, D3's exact Ministry Update Feed Binding,
> D4/D5's sole Review & Release lane, D2's current Publication Reach, Phase
> 10's per-egress safety ceiling, Phase 12's current authorization, Phase 24
> locale truth, and D9/Phase 29-certified media; using one quiet accessible
> Ministry updates experience—formerly My Feed only as a migration/search/help
> alias—with autosave and version recovery, separate Save draft, a
> tenant-seeded `Supporters`, `Public page`, or `Public page and supporters`
> choice, exact audience previews, an optional explicitly authored public-safe
> variant, one consequence review, and independently truthful outcomes. Every
> projection pins the exact Tenant, Legal Entity, environment, canonical
> source/purpose, Update Revision, audience contract, locale, safety and
> authorization epochs, release occurrence, renderer/profile generation, and
> media manifest, plus exact Site, Page, Feed Binding, and reach for public
> display; current protected membership is re-proved on every content, media,
> pagination, engagement, and deep-link request, while only communication
> dispatch freezes exact recipients. Public release, supporter visibility,
> supporter relationship, notification intent, recipient selection, consent,
> suppression, cadence, provider delivery, engagement, and Giving remain
> separate truths; a deliberate `Publish & notify supporters` occurrence may
> reuse the same final review but routes through Phase 28, Phase 17, and Phase
> 6, including recipient preferences and secure notification-only email where
> required. Corrections, narrowing, withdrawal, and privacy-safe tombstones are
> append-only and audience-specific; partial outcomes preserve prior-good
> heads and recover only residual work; engagement never widens access or leaks
> identities across audiences; and migration uses one complete disposition
> manifest and one authority cutover—without copied page/email posts, mutable
> visibility or released content, generic partners, blanket security levels,
> `publicMirror`, tenant-wide feeds, inferred audience or contact permission
> from a gift, follow, subject, author, spouse, teammate, project, page, or
> Support Assignment, raw-table/CMS/provider authority, destructive delete,
> hidden auto-email, unsafe locale/media fallback, dual write, or any claim that
> released, visible, notified, delivered, opened, clicked, liked, prayed,
> understood, relationally connected, or gave are the same fact.**

### Binding interpretation

- **Ministry Update** is canonical. **My Feed** is only a legacy route, search,
  migration, or help alias and cannot create a second record, feed, or release
  path.
- One stable Update has immutable Revisions. A submitted D4/D5 candidate and
  every released projection pin an exact Revision; later autosaves never alter
  content already under review or released.
- The immutable Audience Release Manifest records the exact requested public
  and/or supporter consequences. Public Page and Supporter projections have
  separate idempotent occurrences, current heads, outcomes, containment, and
  recovery.
- The Supporter projection pins an owner-domain audience contract and history
  rule, not a permanent person list. Current purpose-authorized membership,
  Phase 12 authorization, and Phase 10 safety are re-proved on every protected
  content, media, pagination, engagement, and deep-link request.
- Only a communication dispatch freezes exact recipients. Notification intent,
  eligible recipient selection, consent, suppression, cadence, provider
  delivery, and engagement remain independently authoritative facts.
- D3's exact Ministry Update Feed Binding selects public page inclusion. Page,
  author, subject, spouse, teammate, project, Support Assignment, Designation,
  gift, or follow relationships never infer inclusion or audience.
- An optional public-safe variant is deliberately authored and reviewed within
  the same canonical Revision. Automatic truncation, redaction, translation,
  or AI summarization cannot manufacture public-safe content.

### Quiet UX and accessibility contract

The missionary uses one mobile-first **Ministry updates** composer with
autosave, version recovery, D9-certified media, alt-text support, and a separate
**Save draft** action. The tenant seeds one of three plain-language audience
choices: **Supporters**, **Public page**, or **Public page and supporters**.
Only currently supported choices appear. Exact audience preview tabs and an
optional collapsed **Use a different public-safe version** control precede one
consequence review.

The existing D4/D5 profile decides whether the candidate goes to one staff
review or releases after mandatory checks. Staff inspect one diff and public/
supporter previews; D11 creates no parallel review queues. Where all
communication prerequisites are ready, the final surface may offer deliberate
**Publish** and **Publish & notify supporters** actions. **Save draft** and
**Publish** never hide an email side effect.

Afterward the product shows independent calm results such as **Public page:
Live**, **Supporters: Available to authorized supporters**, and
**Notification: Scheduled for weekly digest**. It never collapses these into
one `Published` badge. The authoring and review experience must meet WCAG 2.2 AA
and help authors produce accessible output through captions, alternative-text
prompts, semantic structure, keyboard operation, reflow, visible focus, status
announcements, and recoverable errors.

### Failure, recovery, and certification

- If one audience projection succeeds and another fails, the successful result
  remains; the failed audience keeps its prior-good head and exposes only its
  residual idempotent recovery work.
- Corrections, narrowing, withdrawal, and removal from current presentation use
  append-only successor projections and privacy-safe tombstones. Already sent,
  copied, downloaded, or screenshotted content cannot be recalled.
- Current Phase 10 narrowing and supporter-access revocation win the next
  governed request. Protected metadata, media, comments, reactions, counts,
  caches, and deep links receive the same decision and do not become existence
  or identity oracles.
- A queued communication remains pinned to its exact Revision. If cancellation
  remains possible, Phase 6 may suppress it after reproof; if already sent, a
  correction is a new authorized occurrence rather than a rewritten delivery.
- Cache, provider, owner-store, locale, authorization, media, or projection
  ambiguity blocks only the affected new positive action and never falls back
  to raw CMS data, a broader audience, unsafe locale, or blind resend.
- Production authorization requires complete cross-scope, actor, audience,
  later/revoked-supporter, Phase 10, mixed-outcome, retry/concurrency, cache,
  media, locale, engagement, consent, delivery, cursor, accessibility, abuse,
  load, tenant-fairness, dependency-outage, migration, and deployment-skew
  tests.

### Source and phase boundaries

- **Phase 22 D11:** Update identity and Revision; Audience Release Manifest;
  Public Page and Supporter release projections; correction, withdrawal,
  tombstone, feed ordering, and the notification-request occurrence.
- **D1, D3, D4/D5, D2:** contributor authority, page Feed Binding, the sole
  review/release lane, and current public reach respectively.
- **Phases 10 and 12:** per-egress safety ceiling and current principal/
  capability authorization. Neither can be weakened by an audience selection.
- **Phases 9/28:** supporter relationship, purpose, audience contract, and
  history eligibility; Phase 22 does not build a follower network or segment
  language.
- **Phases 24, 25, 17, and 6:** locale, preference-center UX, governed
  notification rendering/sender profile, and consent/suppression/dispatch/
  provider evidence respectively.
- **D9/Phase 29:** media admission, derivatives, delivery, retention, and
  disposal. **D7/Phase 13:** page Giving action and financial truth.

### Rejected alternatives

- one mutable `public/partners/private` field, `publicMirror`, or blanket
  security level;
- copied public-page, protected-feed, or email posts;
- automatic email as an implicit publication consequence;
- gift-, follow-, relationship-, subject-, author-, participant-, page-, or
  Support-Assignment-derived audience access;
- arbitrary tenant segment expressions or a second Phase 22 follower network;
- mutable release content, destructive delete, unsafe locale/media fallback,
  tenant-wide feeds, dual publication authority, or dual write; and
- treating released, visible, notified, delivered, opened, clicked, liked,
  prayed, understood, connected, or gave as interchangeable facts.

**Architectural record:**
[ADR-0128](../../adr/0128-canonical-ministry-update-audience-release-projections.md).

## D12 — What bounded response experience may purpose-authorized supporters use on a Ministry Update?

**Status:** Ratified and adversarially hardened on 2026-08-06.

> **C-prime-amended-and-hardened (C-prime-R) — one prospective, immutable,
> tenant-owned Supporter Response Profile Version, initially `Responses off` and
> then choosing exactly one of `Responses off`, `Like + I prayed`, or
> `Like + I prayed + comments`, with acknowledgement-only recommended in guided
> setup; acting only as a ceiling over exact D11 Supporter Release Projection-bound
> Engagement Spaces, each structurally carrying Tenant, Legal Entity, environment,
> canonical source and purpose, Update ID and immutable Revision, Release Projection
> and version, audience, safety and authorization epochs, Response Profile Version,
> and operation generation; with per-update narrowing, immediate evidence-preserving
> closure, and reopening only through D4/D5's existing exact Review & Release
> authority. Current authenticated purpose-authorized access is re-proved on every
> count, list, react, unreact, comment, reply, edit, withdraw, report, moderate,
> export, stream, and notification-deep-link request before any elevated command.
> Like and I prayed are two fixed, reversible, idempotent, audience-local
> acknowledgements; optional comments are bounded plain text with safe links,
> audience-safe identity preview, immutable self-edit revisions, self-withdrawal
> and privacy-safe tombstones, one same-space reply level, keyset pagination, and
> exact pending, posted, held, closed, and failed states. Enabling comments
> progressively reveals one tenant-selected Right away, with reporting or After
> review posture and one existing authorized moderation group; one quiet
> exception-first lane provides report, reversible hold/hide/restore, immediate
> source-authorized safety hiding, reasoned privacy/safety redaction, prospective
> comment lock, and smallest-scope actor restriction without staff rewriting a
> supporter's words. Counts are rebuildable audience-local projections, never
> mutable canonical Update facts; Phase 22 emits typed, deduplicable response and
> moderation occurrences only, while Phases 17/6 independently own recipient,
> consent, suppression, cadence, batching, dispatch, and provider outcome and
> D7/Phase 13 alone own the adjacent Give action and every checkout, gift,
> settlement, and attribution fact. Anonymous Public Releases remain read-only and
> contain no protected count, identity, comment, cursor, cache fragment, metadata,
> hydration state, or realtime event; existing releases never change silently;
> uncertain writes never appear posted; safety narrowing fails closed at the
> smallest scope; and activation requires production-shaped cross-scope,
> concurrency, abuse, failure, migration, privacy, accessibility, and load proof—
> without public or anonymous writing, cross-audience totals, arbitrary reactions,
> rich or media comments, mentions, direct messages, social graphs, unbounded
> threads, gamification, donation-derived authority, trusted-user safety bypass,
> AI-only judgment, raw profile/table/realtime exposure, mutable post counters as
> truth, destructive ordinary deletion, hidden per-response email, blind retry,
> dual write, reinterpretation of legacy demo love/prayer/fire or comment data as
> certified truth, or any claim that viewed, opened, liked, prayed, commented,
> notified, delivered, relationally connected, started checkout, gave, settled,
> or paid are the same fact.**

### Binding interpretation

- Every tenant begins with **Responses off**. Guided setup recommends
  **Like + I prayed**; comments appear only after the tenant deliberately enables
  them and chooses one plain-language publication posture and an already
  authorized moderation group.
- The immutable Supporter Response Profile Version is a prospective tenant
  ceiling. Existing releases do not change silently. An exact update may narrow
  or close responses; reopening uses D4/D5's existing review and release authority.
- Every Engagement Space is bound to one exact D11 Supporter Release Projection
  and carries the complete Tenant, Legal Entity, environment, purpose, Update,
  Revision, projection, audience, safety/authorization epoch, profile version,
  and operation-generation identity. Responses never move between spaces.
- Current authenticated purpose-authorized access and Phase 10 safety are
  re-proved on every protected operation. A gift, follow, page relationship,
  Support Assignment, prior access, authenticated role, or service execution
  never grants or preserves response authority.
- `Like` and `I prayed` are fixed, reversible, idempotent acknowledgements.
  `I prayed` records only the supporter's acknowledgement and proves neither
  reading nor any spiritual, relational, communication, or financial outcome.
- Comments are bounded plain text with safe links, audience-safe identity
  preview, append-only self-edit revisions, self-withdrawal, privacy-safe
  tombstones, and one reply level. Rich/media comments, mentions, direct
  messages, social graphs, arbitrary reactions, and unbounded threads remain out.
- Moderation is exception-first. Authorized staff may hold, hide, restore,
  restrict, or apply reasoned privacy/safety redaction, but never rewrite a
  supporter's words in place. Evidence is retained under its exact scope.
- Counts and viewer state are rebuildable audience-local projections over typed,
  deduplicable occurrences. They are not mutable fields on the canonical Update.

### Quiet UX, failure, and accessibility contract

The default public page remains read-only and contains no response controls or
protected response data. In the authenticated supporter experience, the exact
enabled actions sit beneath the update as quiet secondary controls. A supporter
gets immediate, reversible feedback for `Like` and `I prayed`; comment states
use explicit, non-color-only labels such as **Pending review**, **Posted**,
**Held**, **Responses closed**, and **Couldn't post**. Retrying an uncertain
write inspects the existing operation before creating anything new.

Healthy acknowledgement activity creates no staff work. When comments are
enabled, one compact queue shows only items needing attention, with the exact
comment and context, why it is present, the reversible action, and the visible
consequence. Keyboard operation, visible focus, accessible names, minimum target
sizes, status announcements, reflow, error recovery, and reduced-motion behavior
must meet the project's WCAG 2.2 AA contract.

Ambiguity, stale authorization, safety narrowing, profile closure, dependency
failure, or concurrency conflict blocks only the affected new positive action.
It never fabricates a posted response, widens an audience, destroys history, or
falls back to a public/raw-table path. A successful occurrence remains true;
residual recovery is append-only and idempotent.

### Source and phase boundaries

- **Phase 22 D12:** Response Profile Versions, projection-bound Engagement
  Spaces, fixed acknowledgement semantics, comment/reply lifecycle, response and
  moderation occurrences, rebuildable response projections, and the quiet
  authenticated interaction/moderation experience.
- **D11:** canonical Update/Revision, Audience Release Manifest, Supporter
  Release Projection, and current protected audience contract. D12 cannot widen it.
- **D4/D5:** the sole authority for reopening an update's closed response scope.
- **Phases 10 and 12:** current per-egress safety and principal/capability
  authorization. D12 re-proves both and cannot create a trusted-supporter bypass.
- **Phases 17 and 6:** recipient selection, consent, suppression, cadence,
  batching, dispatch, and provider outcomes for any response-related
  communication. A Phase 22 occurrence is not a sent or delivered notification.
- **D7 and Phase 13:** the adjacent Give action and all checkout, gift,
  settlement, and attribution truth. Engagement is never financial evidence.

### Rejected alternatives

- comments or arbitrary reactions enabled for every tenant;
- public or anonymous responses, public protected counts, or cross-audience totals;
- mutable Update counters, in-place staff edits, or destructive ordinary deletes;
- access inferred from donations, follows, assignments, relationships, or prior access;
- rich/media comments, mentions, direct messaging, social graphs, or gamification;
- raw table/profile/Realtime exposure, hidden per-response email, AI-only
  moderation, blind retry, dual write, or reinterpretation of demo data as truth; and
- treating viewed, liked, prayed, commented, notified, delivered, gave, settled,
  or paid as interchangeable facts.

**Architectural record:**
[ADR-0129](../../adr/0129-bounded-supporter-response-profiles.md).

## D13 — How do supporters safely discover listed Missionary and Project pages?

**Status:** Ratified and adversarially hardened on 2026-08-06.

> **C-prime-amended-and-hardened (C-prime-R) — one versioned, exact Tenant,
> Legal Entity, environment, Site, and locale-scoped Public Ministry Discovery
> Profile choosing exactly one active presentation topology—Together by quiet
> built-in default or tenant-selected Separate by Page Family—over one
> source-complete, generation-bound Public Ministry Directory Projection, one
> bounded server query contract, and one family-typed public card contract.
> Membership is derived only from the exact current D2 `Listed publicly` Page
> Release after current Phase 10 ceiling and containment proof; combined and
> separate presentations never create independent membership, index, search,
> cache, card, or inclusion authority, and every separate route applies its
> family constraint server-side. The projection preserves exact release,
> reach, safety, route, media, optional progress, optional Giving-capability,
> profile, locale, source, coverage, and as-of generations while exposing and
> indexing only approved public card fields; it uses deterministic ordering,
> explicitly pinned locale search behavior, bounded allowlisted filters without
> hidden facet counts, tenant-fair limits, generation-bound opaque keyset
> cursors and cache keys, complete-cohort shadow rebuilds, atomic current-head
> activation, and affected-positive-first adverse removal. One accessible,
> quiet Directory setup lets staff choose Together or Separate, preview exact
> routes, labels, cards, mobile behavior, current included pages, and privately
> explained source-owned exclusions, while Listed pages enter automatically and
> healthy tenants perform no page-by-page maintenance. Visitors receive
> scope-honest labelled GET search, persistent queries, semantic typed results,
> polite status messages, stable empty/error states, and optional D6 progress
> or D7 Give actions only by current reference; a topology change alters neither
> page reach nor safety, review, content, progress, Giving, external indexing,
> or removal truth. Phase 5 remains authoritative for public request resolution,
> D8-compatible route dispositions and one non-conflicting canonical/sitemap
> manifest govern topology changes, and external crawler removal remains an
> observed best-effort outcome—without concurrent combined and separate
> catalogs, a second visibility switch, per-page directory toggles, client-side
> scope or filtering authority, raw operational/CMS/`locations` reads,
> anonymous raw tables or Realtime, separate family indexes, arbitrary search
> fields, taxonomy or query DSLs, predictive autocomplete, fuzzy or hidden
> synonym expansion, maps or exact coordinates, hidden-result placeholders or
> counts, popularity/financial/progress/urgency ranking, OFFSET pagination,
> unsafe locale or source fallback, mutable current rows, destructive rebuild,
> dual-read migration, or any claim that released, listed, searchable,
> Giving-ready, externally indexed, locally removed, and externally de-indexed
> are the same fact.**

### Binding interpretation

- Each exact Tenant × Legal Entity × environment × Site × locale scope has one
  immutable Discovery Profile Version and exactly one active topology. **Together**
  is the quiet built-in default; **Separate by Page Family** creates distinct
  Missionaries and Projects views over the same projection and query authority.
- A separate family route supplies its family constraint on the trusted server
  boundary. A request parameter, route segment, cursor, opaque ID, browser cache,
  or client component never establishes or broadens Tenant, Site, locale, family,
  membership, or safety authority.
- D2's exact current `Listed publicly` Page Release after current Phase 10
  ceiling and containment proof is the sole ordinary directory membership rule.
  `Shared by link — public`, `Not public`, missing-locale, withdrawn, retired,
  contained, or otherwise ineligible releases have no public directory row.
  Directory setup contains no second visibility or page-by-page inclusion switch.
- One complete immutable projection generation contains exactly one typed row
  for every eligible release and zero rows for every ineligible release. A
  private exclusion ledger may explain source-owned causes to authorized staff;
  it never creates a public placeholder, result, facet, count, or existence hint.
- Public search indexes only the approved public card fields admitted by current
  release and Phase 10 proof. Operational identities, legal names, exact
  locations, internal Party/worker/fund/Designation identifiers, donor/support
  facts, raw CMS documents, and private diagnostics never enter the public
  search document, response, metadata, cache payload, or telemetry.
- A topology change is a versioned presentation and route consequence only. It
  changes neither page reach nor safety, review, released content, D6 progress,
  D7 Giving, crawler state, nor removal truth, and it never runs combined and
  separate catalogs as concurrent authorities.

### Quiet UX, search, and accessibility contract

Staff receive one two-choice setup under the exact Site and locale. It previews
the exact routes, navigation labels, typed cards, desktop/mobile composition,
current included pages, and privately explained exclusions. It states plainly
that topology does not change visibility, safety, review, progress, or Giving.
Healthy scopes require no per-page maintenance or recurring certification.

Visitors receive **Search ministries** in Together mode and **Search
missionaries** or **Search projects** in Separate mode. Search is a labelled,
URL-backed GET form with a retained value and explicit submit action. Results use
semantic lists, visible Page Family labels, unique linked public titles, and only
currently admitted D9 media, D6 progress, and D7 Give references. Result, empty,
no-match, degraded, and failure states remain stable, honest, keyboard-operable,
screen-reader announced, and usable at the project's WCAG 2.2 AA reflow and
target-size baseline. No state discloses that withheld records exist.

Default browse ordering is eligible featured cards, then locale-appropriate
public title with an opaque stable tie-breaker. Search uses code-owned textual
relevance over admitted fields with the same stable tie-breaker. Financial
amount, donor count, support progress, urgency, recency, popularity, internal
priority, exact geography, and random order never rank results. Only bounded,
code-owned, Phase 10-approved filters may appear; predictive autocomplete,
hidden facet counts, maps, arbitrary taxonomies, fuzzy or hidden synonyms, and
tenant-authored query languages remain out.

### Data, failure, recovery, and certification

- Internal projection and search objects remain outside anonymous raw-table and
  Realtime access. One narrow server query validates current host scope and
  allowlisted topology, family, locale, query, filter, limit, and cursor inputs,
  with explicit grants, indexed RLS defense, and no service credential in the
  public client.
- Each locale pins an explicit PostgreSQL text-search configuration or declared
  literal-token mode. Search normalizes and bounds input, parses it as plain
  text, and never interpolates raw SQL or `tsquery`. Unsupported locale or
  missing translation never falls back to a legal name, unsafe source language,
  or cross-locale record.
- Count, cards, and next cursor come from one immutable generation. Opaque signed
  keyset cursors and cache keys bind the complete scope, topology/family, query
  and filter digest, sort contract, current profile/reach/safety generations,
  and projection generation. Stale or substituted cursors restart safely and
  never broaden scope; OFFSET pagination is not authoritative.
- A complete next generation is built in non-authoritative shadow, reconciled
  against the complete eligible/ineligible release census, and activated by one
  idempotent CAS current-head change after route, canonical/sitemap, locale,
  profile, reach, and safety proof. No mock, Payload, Party, Designation,
  `locations`, old cache, or partial generation becomes a fallback authority.
- D2 or Phase 10 narrowing, containment, withdrawal, or route invalidation
  removes the affected positive row before or atomically with wider rebuilding
  and invalidates every matching cache generation. A failed rebuild preserves
  proved absence and the last independently proved safe browse result.
- If search alone fails while current browse authority remains proved, the
  directory may retain that browse projection and say search is temporarily
  unavailable. If current authority is uncertain, it returns a safe no-store
  unavailable state. Missing D6 progress or D7 Giving removes only that optional
  capability and cannot invent or remove directory membership.
- Production authorization requires complete cross-scope and coverage tests;
  safety/removal/rebuild/cache races; locale and adversarial-query fixtures;
  HTML, RSC/JSON, metadata, sitemap, cache, log, trace, metric, accessibility-tree,
  and image privacy-egress tests; WCAG and no-JavaScript journeys; canonical and
  route-disposition proof; tenant-fair load tests; and failure, containment,
  migration, and recovery exercises.

### Source and phase boundaries

- **Phase 22 D13:** Discovery Profile Versions, the complete Public Ministry
  Directory Projection, the bounded server query and public card contracts,
  topology-specific visitor/staff experiences, projection activation,
  directory-specific containment, and privacy-safe directory observability.
- **D2 and Phase 10:** current public reach and the per-egress safety ceiling.
  D13 consumes their exact evidence and cannot weaken, duplicate, or override it.
- **D1, D3–D5, and D9–D12:** contributor authority, presentation/feed/review,
  certified media, protected preview, Ministry Updates, and responses. None
  independently creates directory membership.
- **D6 and D7/Phase 13:** independently authoritative optional progress and
  Giving capabilities. Searchability, progress visibility, Giving readiness,
  checkout, contribution, settlement, and attribution remain separate facts.
- **D8 and Phase 5:** route lifecycle/canonical dispositions and public request
  resolution. D13 supplies the active topology manifest but does not become the
  route or host authority.
- **Phase 24:** locale truth and fallback policy. D13 pins that authority rather
  than inventing translation or source-language fallback.
- External search engines, CDNs, and archives remain independently observed.
  Local removal never proves purge, de-indexing, or deletion elsewhere.

### Rejected alternatives

- independently maintained Missionary and Project catalogs, indexes, search
  services, card contracts, inclusion toggles, or cache authorities;
- concurrent indexable Together and Separate full-catalog presentations;
- page-by-page directory switches or membership inferred from CMS, Party,
  `locations`, contributor, Designation, Giving, progress, or Field Account data;
- raw anonymous table/view/Realtime access, client-side scope or filtering,
  service-role browser access, or exact-coordinate map discovery;
- arbitrary search fields, filters, taxonomies, synonyms, autocomplete, fuzzy
  matching, popularity or financial ranking, OFFSET pagination, or external
  search authority at launch;
- unsafe locale/source fallback, mutable current rows, destructive rebuild,
  dual-read migration, stale-positive fallback, or hidden-record counts; and
- treating released, listed, searchable, Giving-ready, externally indexed,
  locally removed, and externally de-indexed as interchangeable facts.

**Architectural record:**
[ADR-0130](../../adr/0130-scoped-public-ministry-discovery-with-tenant-chosen-topology.md).

## D14 — How are eligible public pages and Ministry Updates presented to search engines and social sharing?

**Status:** Ratified and adversarially hardened on 2026-08-06.

> **C-prime-amended-and-hardened (C-prime-R) — one immutable,
> release-bound, locale-exact Public Search & Sharing Presentation Manifest
> containing non-interchangeable Search Presentation and Share Presentation
> results for every exact current Phase-10-safe D2 Page Release and D11 Public
> Page Ministry Update Release; structurally scoped by Tenant, Legal Entity,
> environment, Site, verified host, locale, Page Family or canonical Update
> identity, D3 Presentation/Feed Binding, D4/D5 release occurrence, D2 reach,
> D8-compatible route and effect generation, D9 media manifest, D11 Revision
> and audience/placement coverage, Phase 10 safety and containment, Phase 24
> domain/locale truth, and exact renderer, compiler, and release generations;
> using people-first generated defaults plus only bounded locale-specific title,
> description, and D9-certified share-image selection inside D3/D11 and
> D4/D5's sole edit, review, and release lane. A current `Listed publicly` Page
> Release is server-rendered, internally crawlable, self-canonical, exact-host
> sitemap- and reciprocal-locale-eligible, locally search-index eligible, and
> publicly shareable; `Shared by link — public` remains anonymously reachable
> and publicly reshareable but emits `noindex` and remains absent from
> directories, navigation, sitemaps, public-feed discovery, and locale
> discovery; Not-public, draft, authenticated-preview, supporter-only,
> contained, withdrawn, retired, and tombstoned truth emits no content-specific
> anonymous metadata, card, or share projection. Every canonical Ministry
> Update receives exactly one stable opaque public permalink per Site and locale
> rather than a feed fragment, query identity, raw id, or copied page-owned post;
> complete current placement coverage makes that permalink Listed only when at
> least one exact safe admitted placement is independently Listed, public but
> `noindex` when every admitted placement is Shared-by-link, and uniformly
> absent when no admitted public placement remains. One code-owned compiler
> produces complete initial HTML/head, exact crawler directives, canonical and
> reciprocal alternate links, significant-release `lastmod`, host-scoped
> sharded sitemap coverage, visible-fact structured data, Open Graph and
> compatible social-card metadata, and one content-addressed same-origin
> D9-certified social derivative with contextual image alternative text; every
> HTML, metadata, JSON-LD, media, sitemap, and share-payload fact resolves the
> same immutable release coverage and current safety ceiling while Search and
> Share outcomes remain distinct. One quiet accessible `Search & sharing`
> section shows generated defaults, approximate search/link previews, current
> Site, locale, clean URL, and honest search eligibility, with optional Reset to
> generated and no editable canonical, robots, sitemap, `hreflang`, schema,
> keyword, provider, route, or arbitrary-image controls; it creates no second
> review queue or routine tenant work. Every anonymously public Page and public
> Update permalink receives one accessible secondary Share action using
> user-initiated native Web Share when supported and first-party Copy link plus
> bounded click-only outbound fallbacks otherwise, with no passive third-party
> SDK, iframe, tracker, draft/preview URL, secret, supporter identity, query-
> derived text, hidden attribution, automatic post, or claim that Asym knows the
> selected target or completed share. Phase 5 serves exact public HTML and
> assets; D2 owns reach, D8 route dispositions/effects, D9/Phase 29 media, D11
> Update/audience truth, Phase 10 safety, Phase 24 domain/locale truth, and D13
> on-site discovery remain independently authoritative. Automatic canonical
> sitemaps, crawler-accessible links, public-response probes, optional exact-
> host IndexNow acceleration, and cause-owned exception monitoring make Google,
> Bing, and other standards-compatible crawlers able to discover and evaluate
> eligible releases, while external crawling, indexing, ranking, title/snippet
> choice, social fetching, cache refresh, sharing, and de-indexing remain
> independently observed best-effort outcomes. Unknown or adverse proof removes
> positive local search/share output first and recovery is append-only — without
> a second SEO/social publication head, page-level indexing switch, shared-link
> secrecy claim, client-side or bot-only content authority, raw CMS/CRM/storage
> reads, inherited root or cross-Site/unsafe-locale fallback, original filename
> or source metadata, arbitrary JSON-LD or remote media, generic `Person`,
> `SearchAction`, `DonateAction`, Google Indexing API misuse, third-party share
> widget, query-variant indexing, request/build-time freshness, mutable current
> truth, destructive rollback, blind provider retry, or any claim that released,
> reachable, listed, search-ready, sitemap-included, submitted, crawled, indexed,
> ranked, share-opened, shared, cached, refreshed, removed, and externally
> forgotten are the same fact.**

### Binding interpretation

- One immutable manifest contains a typed **Search Presentation** result and a
  typed **Share Presentation** result. They resolve the same release and safety
  coverage but are never interchangeable: a Shared-by-link release is
  shareable while intentionally not search-index eligible.
- D2 remains the sole ordinary reach authority. A current Phase-10-safe
  `Listed publicly` Page Release is locally search-index eligible and publicly
  shareable. `Shared by link — public` is anonymously reachable and shareable
  but `noindex` and absent from directories, navigation, sitemaps, public-feed
  discovery, and locale discovery. Anything stricter emits no content-specific
  anonymous search or share projection.
- Every canonical Ministry Update has one stable opaque public permalink for
  each exact Site and locale. Its posture is derived from complete current
  public placement coverage: any safely Listed placement makes the permalink
  Listed; only safely Shared-by-link placements make it public and `noindex`;
  no admitted public placement makes it uniformly absent.
- Search-ready is a proved local Asym fact: the current public release has
  coherent server-rendered content, canonical and alternate links, crawler
  directives, sitemap disposition, structured data, media, and public-response
  behavior. It is not evidence of crawling, indexing, ranking, chosen snippet,
  social fetch, completed sharing, cache refresh, de-indexing, or forgetting.
- Every artifact carries the complete Tenant, Legal Entity, environment, Site,
  verified host, locale, content identity, presentation/feed, release, reach,
  route/effect, media, safety/containment, compiler, renderer, and coverage
  coordinates needed to prevent cross-scope fallback or mixed generations.
- The manifest references owning facts and never recreates page, Update,
  identity, safety, media, route, locale, directory, or audience authority.

### Quiet authoring, visitor, and accessibility contract

The existing page or Ministry Update editor contains one collapsed **Search &
sharing** section. Healthy generated output requires no tenant action. The
section shows the current Site, locale, clean public URL, honest eligibility
state, generated title and description, approximate search and link previews,
an optional bounded locale-specific title and description, an optional current
D9-certified share image, and **Reset to generated**. It exposes no editable
canonical, robots, sitemap, `hreflang`, schema, keyword, provider, route, remote
image, or arbitrary JSON-LD control and creates no second review queue.

Every anonymously public page and public Update permalink has one quiet
secondary **Share** action. It prefers user-initiated native Web Share when
available and always retains a first-party **Copy link** path plus bounded
click-only outbound fallbacks. No third-party widget, iframe, passive tracker,
provider request, or automatic post occurs before the visitor chooses an
action. The clean canonical URL contains no draft token, preview secret,
supporter identity, query-derived text, or hidden attribution. Cancellation is
not an error; copy success or failure is announced accessibly and a selectable
URL remains available. Visible text, keyboard operation, focus, target size,
reflow, contrast, and status announcements meet the project's WCAG 2.2 AA
contract.

### Data, effects, failure, and certification

- One code-owned compiler produces complete initial HTML/head, crawler
  directives, self-canonical and reciprocal admitted-locale links, significant-
  release `lastmod`, host-scoped sharded sitemap entries, visible-fact structured
  data, Open Graph and compatible social metadata, and one content-addressed,
  same-origin, metadata-stripped D9-certified derivative with contextual alt text.
- HTML, metadata, JSON-LD, card media, sitemap membership, link previews, and
  share payloads resolve one immutable coverage digest and current Phase 10
  ceiling. Partial mixed-generation output is never a valid fallback.
- External submission and observation are best-effort idempotent effects that
  never block publication or become the publication head. Optional IndexNow is
  exact-host scoped; Google's restricted Indexing API is not used for these pages.
- Unknown or adverse reach, safety, media, route, locale, host, placement, or
  coverage proof removes the affected positive local search/share output first.
  Recovery is append-only and stale jobs cannot overwrite a newer manifest.
- Staff see cause-owned exceptions such as missing safe media, sitemap conflict,
  canonical mismatch, or crawler-response failure, not a routine SEO checklist.
  Provider crawl, index, rank, cache, and removal observations remain separate.
- Production authorization requires the complete reach/audience matrix,
  cross-tenant/host/locale isolation, exact permalink and multi-placement
  coverage, metadata and public-egress privacy, JSON-LD serialization, route and
  redirect succession, cache and deployment skew, stale-job/concurrency,
  sitemap scale, bot-load fairness, no-JavaScript rendering, native-share/copy
  fallback, WCAG, failure, containment, migration, and append-only recovery proof.

### Source and phase boundaries

- **Phase 22 D14:** the immutable Public Search & Sharing Presentation Manifest,
  typed Search and Share results, the code-owned compiler, stable public Update
  permalink presentation, bounded authoring UX, public Share action, local
  readiness proof, external-effect observations, and cause-owned exceptions.
- **D2:** requested, release-time, and live Publication Reach. D14 has no second
  index switch and cannot make Shared-by-link content Listed.
- **D3–D5 and D11:** the only content, editorial override, review, release,
  Revision, placement, and audience authorities. D14 creates no parallel editor
  or release head.
- **D8 and Phase 5:** canonical route/effect disposition and exact public HTML
  and asset serving. D8's Public Page Route Effect Manifest may reference D14
  artifacts but remains a distinct route-consequence record; neither is a
  release head. The stable Update permalink collision-proves its path through
  the shared Site × locale route registry. D14 compiles presentation for those
  routes but does not own host, route, Update, or Revision truth.
- **D9 and Phase 29:** admitted public media and certified derivatives. D14
  cannot use raw storage, original filenames/metadata, or arbitrary remote media.
- **D13:** on-site directory/search membership and query behavior. D14 owns
  external-search presentation, not local discovery membership.
- **Phase 10 and Phase 24:** current egress safety and exact domain/locale truth.
  D14 consumes their evidence without weakening or duplicating it.
- Google, Bing, social platforms, browsers, CDNs, archives, and recipients own
  their crawl, index, rank, snippet, fetch, cache, share, and removal outcomes.
- **Phase 22 D15:** D15 may measure only its four fixed, independently governed
  first-party interactions after resolving the exact current immutable release.
  Its activation, objection, collection, delay, outage, suppression, or
  correction never changes D2 reach, D8 routing, D11 audience/release truth,
  D14 Search or Share Presentation, or any Page, Update, Share, Give, cart, or
  checkout behavior. D14 artifacts may supply immutable release coordinates,
  but D15 facts never enter metadata, JSON-LD, Open Graph output, sitemap
  membership, `lastmod`, canonical URLs, or share payloads.
- D14's prohibition on passive widgets, trackers, and provider requests bars
  third-party Share-path egress and share-completion inference; it neither
  authorizes nor prohibits D15. Only a separately active, production-gated D15
  profile may emit its fixed same-origin occurrence, which never becomes part
  of Share Presentation or an external-share result.

### Rejected alternatives

- a second mutable SEO or social publication record, a page-level indexing
  toggle, or independent page and Update metadata authorities;
- treating Shared-by-link as secret or search eligible, or emitting content-
  specific metadata/cards for private, preview, supporter-only, contained,
  withdrawn, retired, or tombstoned truth;
- client-only or bot-only content, raw CMS/CRM/Storage reads, inherited root
  metadata, cross-Site or unsafe-locale fallback, query-variant indexing, or
  request/build-time freshness;
- editable canonical/robots/sitemap/`hreflang`/schema/provider controls,
  arbitrary JSON-LD, remote images, original filenames/metadata, generic
  `Person`, `SearchAction`, or `DonateAction` claims;
- passive third-party share widgets, automatic posting, hidden attribution,
  draft/preview links, supporter-bearing URLs, or claims that share opening
  proves a completed share;
- Google Indexing API misuse, blind provider retry, external provider success as
  a release gate, destructive rollback, mutable current truth, or stale-positive
  fallback; and
- treating released, reachable, listed, search-ready, sitemap-included,
  submitted, crawled, indexed, ranked, share-opened, shared, cached, refreshed,
  removed, and externally forgotten as interchangeable facts.

**Architectural record:**
[ADR-0131](../../adr/0131-release-bound-public-search-and-sharing-presentation.md).

## D15 — How may tenants measure public Page and Ministry Update activity, and who may see it?

**Status:** Ratified and hardened on 2026-08-06.

### Decision

> **C-prime-amended-and-hardened (C-prime-R) — one prospective, versioned, Tenant × Legal Entity × Site Public Ministry Measurement Profile with a persisted Off state and one guided choice of Staff only (recommended) or Staff + current assigned Public Page Contributors; measuring exactly four first-party, immutable-release-bound, fixed-schema interactions—qualified visible Page loads, full Ministry Update opens, Share-menu opens, and Give-CTA selections—through best-effort post-render or explicit-action POSTs that never arise from GET, HEAD, render, RSC/prefetch, preview, sitemap, crawler, social-card, scanner, monitor, or provider fetch and never block Page, Update, Share, Give, cart, or checkout behavior. D15 owns only delayed aggregate service-improvement measurement: it never claims unique people, supporters, reach, sessions, journeys, completed shares, carts, conversions, gifts, recurring agreements, settlements, payments, or attribution; D7/D14 and Phase 13 remain independently authoritative, and any separately displayed Phase 13 aggregate retains its own label, authorization, and through-date with no person/session join. Ephemeral request signals may support abuse control, bounded source classification, and conservative known-machine exclusion, but raw IP, user agent, URL/query, referrer, location, fingerprint, cookie or local-storage identifier, persistent visitor/session identifier, supporter/donor/legal identity, free-form property, replay frame, and cross-site/device link never enter durable measurement; unlinked idempotent occurrences are private, aggregate into exact Tenant, Legal Entity, environment, Site, verified host, locale, Page or canonical Update, immutable release, Page Family, metric, bounded source, day, profile, metric-schema, and classifier-generation facts, and are deleted with idempotency material within 24 hours, while sealed daily aggregates use append-only corrections and one code-owned 24-month retention. Every staff or contributor read/export re-proves current Phase 12 or exact D1 page-assignment authority in the server boundary and RLS, with complete structural isolation, immediate revocation, no JWT/user-metadata or relationship inference, no browser/raw-event access, and code-owned disclosure controls; contributors receive only suppression-safe exact-page totals and trends, never tenant-wide, source, identity, event, sparse-cell, or financial drill-down. One quiet setup consequence preview, one accessible Public page activity report, 7/30/90 complete-day presets, fixed plain-language definitions, an equivalent HTML table, Data complete through coverage, honest Complete/Delayed/Partial/Unavailable/Suppressed/Zero states, and cause-owned diagnostics keep administration and missionary use simple. Production activation is proof-gated on replay-free public ministry and giving routes, query/body/DOM-safe independent operational telemetry, truthful notice plus the applicable simple objection or stricter consent path, fixed-schema same-origin intake, tenant-fair rate and size limits, exact release re-resolution, cross-scope and concurrency proof, suppression-differencing proof, retention proof, accessibility proof, and failure isolation. Phase 31 alone may later expose a separately certified external analytics adapter with exact purpose, fields, consent/objection, egress, retention, deletion, provider, region, and observed-versus-modeled proof—without per-page analytics switches, custom metrics or events, report builders, visitor timelines, unique-visitor hashes, funnels, heatmaps, session replay, ad pixels, tag managers, arbitrary scripts, provider API-key fields, raw-log or Sentry backfill, generic analytics payloads, premature event warehousing or partitioning, destructive correction, silent zero-filling, blind retry, or any claim that enabled, collected, queued, received, classified, aggregated, complete, viewed, human, shared, selected, converted, donated, settled, paid, or externally reported are the same fact.**

### Binding interpretation

- The persisted default is **Off**. An authorized tenant actor may prospectively
  choose **Staff only** (recommended) or **Staff + current assigned Public Page
  Contributors** after a plain-language consequence preview; there are no
  per-page measurement switches or custom events.
- D15 measures exactly four fixed interactions. A qualified visible Page load is
  not a unique person or verified human; an Update open is not supporter reach;
  a Share-menu open is not a completed share; and a Give-CTA selection is not a
  cart, conversion, contribution, settlement, or payment.
- A formal Share-menu-open occurrence means the visitor directly activated
  D14's **Share** control and Asym invoked the native chooser or visibly
  presented its first-party fallback. Its report label is **Share options
  opened**. Copy-link or destination selection, outbound navigation, Web Share
  resolution or rejection, and completed posting are neither separate D15
  metrics nor proof that a share occurred.
- Every occurrence has exactly one typed measurement subject: one immutable
  Page Release or one immutable Public Ministry Update Release. A **Full update
  open** requires the exact full Update content to become visible; a teaser,
  feed-card impression, render, prefetch, crawler fetch, or social-card fetch
  does not count. A canonical-permalink occurrence without exact admitted page-
  placement provenance stays staff-only; D15 never fans it across placements or
  infers Update-wide contributor access.
- Only same-origin, fixed-schema, best-effort post-render or explicit-action
  `POST` intake may create a measurement occurrence. All fetch, render,
  preview, crawler, scanner, social-card, sitemap, monitor, and provider paths
  remain measurement-effect-free, and measurement failure never blocks the public or giving
  journey.
- The local Share or Give behavior runs first. Measurement never consumes
  transient user activation or delays native Share, Copy link, fallback
  navigation, Give, cart, or checkout; any occurrence is emitted without
  awaiting it and failure is visible only through D15 coverage diagnostics.
- Transient occurrences are private and unlinked. Raw identity, request, URL,
  referrer, location, fingerprinting, persistent visitor/session, free-form,
  replay, and cross-site/device data never become durable measurement. The
  occurrences and their idempotency material expire within 24 hours; sealed
  daily aggregates retain for one code-owned 24-month period and corrections
  are append-only.
- Every report read and export re-proves current Phase 12 staff authority or
  exact D1 Public Page Contributor Assignment at the server boundary and in
  RLS. Revocation is
  immediate. Contributors see only suppression-safe totals and trends for
  currently assigned exact pages, never tenant-wide, source, identity, raw
  occurrence, sparse-cell, or financial detail.
- The accessible **Public page activity** report uses fixed 7-, 30-, and 90-day
  complete-day presets, fixed definitions, an equivalent HTML table, an exact
  `Data complete through` disclosure, and distinct Complete, Delayed, Partial,
  and Unavailable coverage states. Every result is either a disclosed number,
  including proved zero, or **Not enough activity to show safely**. Suppression
  never means zero, incomplete coverage never renders as zero, and the report is
  deliberately separate from financial Analytics and D12 Engagement.
- Activation is prospective and requires production-shaped proof of replay-free
  public ministry and giving routes, independently safe operational telemetry,
  truthful notice and the applicable objection or consent path, intake limits,
  exact release re-resolution, isolation, concurrency, suppression,
  retention, accessibility, and failure isolation. These are product safeguards,
  not a universal legal-compliance claim.

### Source and phase boundaries

- **Phase 22 D15** owns the Measurement Profile, four metric meanings, private
  transient occurrence and idempotency contract, sealed daily aggregate and
  correction meaning, coverage state, and Public page activity projection.
- **D1, D2, D7, D10, D11, D13, D14, and Phase 12** retain contributor
  assignment, reach, Giving binding, preview, Update, discovery, search/share,
  and authorization truth. D15 references immutable releases and current
  authority; it does not recreate them.
- **Phase 13** alone owns Source Code attribution, carts, contributions,
  recurring agreements, settlement, and payment. A separately shown Phase 13
  aggregate keeps its own label, authorization, and through-date and is never
  joined to a person or session through D15.
- Operational telemetry remains independently purposed and cannot be backfilled
  into D15. Any future external analytics provider is a separately certified
  **Phase 31** adapter, not a Phase 22 script, key, pixel, or tag-manager field.
- D15's bounded source classification describes only a later qualified load. It
  is neither a D14 crawl/index/share result nor Phase 13 attribution, adds no
  parameter to D14's clean permalink, and cannot make Shared-by-link truth
  Listed. D14 **Search ready** and D15 **Data complete through** remain
  independently authoritative and never advance one another.

### Rejected alternatives

- no useful activity feedback at all;
- staff-only measurement as the sole tenant choice;
- default-on, per-page, custom-event, visitor/session, funnel, heatmap, replay,
  pixel, tag-manager, arbitrary-script, or provider-key analytics;
- treating requests, counters, source logs, Sentry, CDN data, or external
  provider results as D15 truth or historical backfill;
- browser/raw-occurrence access, contributor permission lists, identity or
  relationship inference, sparse drill-down, destructive correction, silent
  zero-filling, blind retry, or measurement failure that affects serving or
  Giving; and
- equating any enabled, collected, aggregated, complete, viewed, human, shared,
  selected, converted, donated, settled, paid, or externally reported state.

**Architectural record:**
[ADR-0132](../../adr/0132-bounded-public-ministry-measurement-and-contributor-visibility.md).

## D16 — What AI writing help may a Public Page contributor use, including translation to English?

**Status:** Ratified, amended, and hardened on 2026-08-06.

### Decision

> **C-prime-amended-and-hardened (C-prime-R)** — one quiet, tenant-off-by-default,
> source-bounded, suggestion-only Public Page Writing Assistant that consumes
> and never duplicates Phase 21 D10's exact `public-profile drafting` AI control
> plane; appears only to a currently authorized D1 contributor or separately
> authorized staff Page editor inside one eligible D3 narrative field, block,
> or within-block selection of one saved D1 working revision; and offers one
> small code-owned, Page-Family-, block-, locale-, and capability-certified
> catalog comprising Start from guided answers, Fix spelling & grammar, Improve
> clarity, Shorten, Add detail only from explicitly selected or newly supplied
> facts, three bounded neutral tones, one length-bounded same-source
> transformation instruction under More, and an explicit **Translate to
> English** action only for an independently certified source-language → exact
> Phase-24-owned English BCP 47 locale pair. Translation pins and visibly names
> the authoritative or actor-confirmed source language and exact target such as
> `en-US` or `en-GB`; provider detection is only a confirmable hint; materially
> mixed-language passages require explicit separation or confirmation; and one
> translation invocation preserves meaning without simultaneously rewriting,
> shortening, changing tone, localizing dates, amounts, currencies, or units, or
> adding facts. D16 never creates an English locale, locale variant, route,
> translation status, fallback, release, or certified-translation fact.
>
> Every invocation visibly states **What AI will use** and freezes one minimum-
> data Public Page Writing Source Package containing the exact Tenant, Legal
> Entity, environment, Site, Page Family, Page, source and target locale and
> direction, actor and current edit authority, authorization epoch, working
> revision, semantic target and selection descriptors and digests, author
> answers, individually selected Phase-10-admitted facts, protected-span and
> mixed-language disposition, action/prompt/schema generation, AI Egress
> Manifest, idempotency identity, and exact D10 provider connection, credential
> revision, product/tier/model/region, pair-specific capability, retention/
> training posture, and budget envelope. Source text and answers remain
> untrusted data; tenant BYOK never waives Phase 10; and the certified server-
> side adapter receives no whole-page or hidden context, cross-page memory,
> tools, URLs, browsing, retrieval, RAG, embeddings, tenant search, supporter,
> donor, communication, receipt, expense, financial, progress, Giving, secret,
> or cross-purpose data.
>
> One validated attempt may create only one private immutable Public Page
> Writing Suggestion Version with typed normalized text, source and invocation
> provenance, warnings, output digest, and, for translation, exact source/target
> language and direction, protected-term handling, disclaimer-copy version, and
> `machine_suggested` state—never model-generated HTML, Markdown, links,
> scripts, editor-native authority, factuality, confidence, safety, bilingual
> review, certified translation, review, or publication truth. Its separately
> encrypted content body expires within 24 hours and is erased sooner on Use,
> Discard, source supersession, or revocation, while body-free invocation and
> outcome evidence remains.
>
> The original draft remains unchanged until the actor reviews one accessible
> exact original-versus-suggestion presentation and deliberately chooses
> **Replace selected text** or **Insert draft**. Translation instead shows the
> independently language- and direction-labelled source and proposed English,
> permits editing, uses the precise action **Use English draft**, and keeps this
> warning beside every result: **“Check this translation. AI translation can
> make mistakes or miss context. Review this English draft carefully before
> using it.”** Its expandable **What should I check?** detail says: **“Check
> names, dates, numbers, quotations, Scripture, ministry terms, relationships,
> and cultural meaning. For important content, ask a fluent English reader to
> review it. This is not a certified translation.”** Use freshly reauthorizes
> the actor, exact source and target revisions and digests, D10 capability and
> revocation state, and Phase 10 ceiling, then creates at most one CAS-guarded
> ordinary successor D1 working revision with application provenance. A stale
> source or target never overwrites concurrent work; Try again creates a
> successor suggestion; partial or ambiguous output is never accept-ready; and
> accepted text still follows D4/D5's sole tenant-chosen submit, review/check,
> and release lane.
>
> Manual authoring remains complete and quiet through disablement, missing
> credentials, prohibited egress, unsupported or uncertified language pair,
> mixed-language ambiguity, provider outage, timeout, rate limit, budget
> exhaustion, revocation, malformed output, or capability drift—without
> unsolicited prompting, background or per-keystroke generation, destructive
> replacement, an extra staff-review requirement, public AI badge, provider
> jargon for missionaries, arbitrary endpoint/model/system prompt, chatbot,
> agent, retrieval corpus, silent retry or fallback, cross-tenant cache, raw
> prompt/output telemetry, fictional fact-checking, or AI-authored identity,
> testimony, quotation, Scripture, location, result, beneficiary, doctrine,
> financial claim, donor-pressure language, legal copy, safety verdict,
> Designation, progress, Giving, reach, Ministry Update, locale, translation
> status, submission, approval, release, or publication. Translation success,
> author Use, staff approval, competent bilingual review, release, publication,
> and certified translation remain independently authoritative facts.

### Binding interpretation

- The persisted tenant posture is **Off**. D16 appears only after the tenant has
  prospectively activated the exact D10 `public-profile drafting` Capability
  Binding and the current actor is independently authorized to edit the exact
  D1 working revision and semantic target. No D16-specific key, provider picker,
  credential, billing surface, or permission system is created.
- One visible **Help me write** control sits inside an eligible narrative block.
  A selection narrows the same control to that exact within-block range. No
  selection means the current semantic field or block, never the whole Page.
  Empty fields use short Page-Family- and block-specific guided questions rather
  than an open chatbot.
- The primary transformation actions are **Fix spelling & grammar**, **Improve
  clarity**, **Shorten**, and **Add detail**. Add detail first asks for or lets
  the actor select facts; it cannot manufacture material. **Warm and personal**,
  **Clear and direct**, and **Professional** are the only initial tone choices.
  Page-Family-specific help remains under **More**.
- The editor-neutral target is the exact working revision, semantic field/block
  path, target digest, and optional within-block selection. D16 never persists
  Tiptap positions, Lexical node identities, DOM offsets, Payload `_status`, or
  a mutable `missionaries.bio` row as authority.
- A suggestion remains separate from the draft. Use creates an ordinary D1
  successor revision only after current authorization, safety, source, target,
  capability, and concurrency proof. It cannot autosave, submit, approve,
  release, publish, alter reach, select Giving, change progress, or create a
  Ministry Update.

### Binding English-translation rider

- **Translate to English** is progressively disclosed under **More** and appears
  only when one eligible source and one exact Phase 24-created English-locale
  target draft exist, the actor may edit both required scopes, and D10 certifies
  the exact source-language → target-locale pair for the pinned provider,
  product, tier, model, region, prompt, and schema generation. It does not create
  the target locale or retrieve an arbitrary foreign Page.
- The source may be the selected current text or one deliberately selected
  same-Page source-locale revision already admitted by Phase 10 and current
  contributor authority. The invocation names both languages—for example,
  **Translate from Thai to English (United States)**—before any egress. When the
  source locale is unavailable or conflicts with the selected text, detection
  is displayed as a suggestion and the actor must confirm it.
- A materially mixed-language passage is never silently flattened into one
  source language. D16 asks the actor to confirm or separate the affected
  ranges. Proper names, quotations, Scripture, acronyms, transliterations, and
  established ministry terms may be protected without being misclassified as
  a second language.
- Translation is one operation. It does not simultaneously improve clarity,
  shorten, lengthen, change tone, localize dates or money, or make fundraising
  copy more persuasive. A later rewrite is a fresh explicit D16 invocation with
  its own exact source package and provenance.
- Source and proposed English are rendered in separate labelled regions with
  independent BCP 47 `lang` and semantic `dir`; mixed-direction tokens receive
  bidi isolation. Desktop may use a side-by-side comparison; mobile uses
  stacked regions. Differences, warnings, and actions never rely on color,
  animation, hover, or direction alone.
- The exact check-work warning is always visible beside the translation and is
  code-owned and localized in the actor's interface language—not translated by
  the same model call. If the actor attempts Use without engaging the comparison,
  the warning is presented again without a legalistic acknowledgement checkbox.
- **Use English draft** may mark `actor_edited` and `used_as_draft` only from
  actual evidence. Neither that action nor an ordinary staff approval may mark
  `competent_bilingual_reviewed`, verified, official, or certified. D16 retains
  private provenance but adds no public AI badge or provider attribution.

### Data, failure, and production-certification contract

- The server derives Tenant and actor scope and reloads authorized source text;
  browser requests and background jobs carry opaque identifiers, not prose,
  credentials, or broad source records. Composite Tenant, Legal Entity, Site,
  Page, locale, and revision relationships plus RLS provide defense in depth.
- Provider output is strict typed text. Unknown fields, HTML, Markdown, links,
  scripts, invalid Unicode, oversized output, wrong locale, unsupported editor
  nodes, or field-contract violations fail closed without silent truncation or
  draft mutation. Partial streaming output never becomes a suggestion.
- An invocation and application are independently idempotent. Provider timeout
  or ambiguity is inspected before retry. Retry creates a successor suggestion;
  it never changes provider, credential, model, region, pair, source, prompt,
  schema, or budget silently.
- Production authorization requires cross-Tenant and cross-scope negative tests;
  prohibited-egress/no-cost proof; exact target/CAS and duplicate-use proof;
  manual continuity; secret/content-safe telemetry; keyboard, screen-reader,
  zoom, reflow, focus, status-message, RTL/LTR, and mobile proof; and provider-
  drift containment.
- Each enabled translation pair additionally requires representative missionary
  and project prose reviewed by competent bilingual people familiar with the
  source culture, ministry vocabulary, and target audience. Fixtures cover
  names, places, organizations, relationships, negation, dates, numbers, money,
  units, quotations, Scripture, doctrine, prayer language, idioms, honorifics,
  cultural meaning, omissions, additions, gender/pronouns, bias, unsafe location
  detail, mixed languages, code switching, short text, RTL/LTR, bidi controls,
  Unicode confusables, and unsupported or experimental languages. Automated
  scores and a provider's generic language-support list cannot authorize a pair.

### Source and phase boundaries

- **Phase 21 D10** owns AI Provider Connections, Credential Revisions,
  purpose-specific Capability Binding Versions, Egress Manifests, Invocation
  Evidence, provider adapters, budgets, and revocation. D16 consumes those facts
  and owns only Public Page writing-source, suggestion, application, warning,
  and authoring semantics.
- **Phase 22 D1/D3** own working revisions, semantic edit targets, Page Family,
  contributors, and presentation contracts. **D4/D5** remain the only submit,
  review/check, and release lane. **D2/D6/D7/D9/D11/D14/D15** remain independent
  reach, progress, Giving, media, Update, search/share, and measurement truth.
- **Phase 10** classifies every proposed source and resulting public egress. A
  model cannot decide that text is safe; translated or polished language cannot
  restore material Phase 10 denied.
- **Phase 12** owns current capabilities to manage D10 configuration, invoke and
  apply D16 suggestions, and edit exact Pages. D1 assignment remains necessary
  Page scope and never grants provider-management or broad AI authority.
- **Phase 24** owns enabled Site locales, exact BCP 47 identity, locale draft and
  translation-status lifecycle, fallback, and release context. D16 targets an
  existing exact English-locale draft and creates no locale, fallback, route,
  alternate, translation-complete, or publication fact.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                  | Severity | Likelihood  | Permanent prevention                                                                                                                                           |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Provider drift, weak language detection, mixed-language prose, long selections, or editor changes could return bad output or target the wrong text.                                   | Critical | High        | Pin exact generations and source/target pair; use semantic paths plus digests; require confirmation and complete manual continuity.                            |
| Technical debt                    | Yes      | Separate AI logic in the missionary textarea, Tiptap, Lexical, and Payload would duplicate prompts, authorization, retries, and acceptance.                                           | High     | High        | One D10 execution foundation, one D16 domain service, and thin editor-specific presentation adapters.                                                          |
| Edge cases                        | Yes      | Blank fields, cross-block selections, code switching, RTL/LTR text, short-language detection, stale drafts, revoked actors, partial output, and unsupported pairs are ordinary cases. | High     | High        | One-block targets, exact pair certification, explicit conflict outcomes, Unicode/bidi fixtures, and no guessing or truncation.                                 |
| Footguns                          | Yes      | Generic Lengthen, combined translate-and-polish, free-form prompts, whole-page context, or one-click replacement can invent facts and erase voice.                                    | Critical | High        | Guided Add detail, one operation per invocation, visible sources, explicit comparison/Use, and revision-backed undo.                                           |
| Tenant safety                     | Yes      | A client or service-role path could substitute another tenant's Page, credential, source locale, or suggestion.                                                                       | Critical | Medium-high | Server-derived scope, same-scoped composite keys, invoke-and-apply authorization, strict grants/RLS, and cross-tenant negative tests.                          |
| Over-engineering                  | Yes      | Chat, RAG, embeddings, translation memory, tenant prompt builders, scores, or per-Page AI matrices would turn a writing aid into an unsafe platform.                                  | High     | High        | Closed action/source catalogs, one purpose binding, no memory/tools/retrieval, and progressive disclosure.                                                     |
| UX/UI and user friction           | Yes      | Sparkle noise, provider jargon, lost mobile selections, unclear replacement, or a legalistic warning could discourage writing or cause accidental use.                                | High     | High        | One quiet Help me write control, contextual More menu, plain source preview, accessible comparison, precise actions, and short actionable warning.             |
| Hidden coupling                   | Yes      | Binding AI to mutable profile fields, Payload status, editor-native nodes, D4 review state, or Phase 24 translation status makes upgrades unsafe.                                     | Critical | High        | Editor-neutral semantic target; D16 creates only an ordinary D1 draft successor; owning phases remain independent.                                             |
| Failure modes                     | Yes      | Timeout after provider billing, disconnect, ambiguous response, duplicate retry, stale source, or capability revocation could double spend or falsely report success.                 | High     | Medium-high | Idempotent attempts, inspect-before-retry, immutable outcomes, target CAS, explicit normalized errors, and manual fallback.                                    |
| Data integrity risks              | Yes      | A late or duplicated result could overwrite newer prose, use the wrong locale, or be mistaken for canonical content.                                                                  | Critical | High        | Immutable suggestions, exact source/target digests, one application occurrence, atomic draft advancement, and no suggestion-as-content reads.                  |
| Security and privacy risks        | Yes      | Drafts may contain exact locations, vulnerable people, relationships, hidden instructions, or secrets; prompts and output can leak through jobs or telemetry.                         | Critical | High        | Phase 10 pre-egress gate, minimum-data manifest, no tools/retrieval, opaque jobs, strict validation, encrypted short-lived bodies, and content-free telemetry. |
| Scalability and performance risks | Yes      | Per-keystroke calls, whole pages, retries, or one tenant exhausting quota can inflate cost and starve others.                                                                         | High     | Medium-high | Explicit bounded calls, size limits, per-purpose budgets/rates, tenant-fair backpressure, and no cross-user result cache.                                      |
| Operational burden                | Yes      | Bespoke prompts, unbounded language pairs, and model-specific debugging would require constant staff intervention.                                                                    | High     | Medium-high | Code-owned actions, pair-specific certification, normalized health/errors, expiry, and no custom system prompts.                                               |
| Observability gaps                | Yes      | Staff could not distinguish safety denial, bad configuration, unsupported pair, provider failure, invalid output, or stale application without logging private prose.                 | High     | High        | Opaque correlated IDs, purpose-safe outcome codes, latency/usage/acceptance/conflict metrics, and protected content-free diagnostics.                          |
| Dependency and integration risks  | Yes      | Providers may change models, retention terms, pair coverage, regional availability, or structured output behavior.                                                                    | High     | High        | Exact versioned bindings, adapter contracts, certification expiry, drift checks, explicit reactivation, and no silent fallback.                                |
| Migration and upgrade risks       | Yes      | Auto-processing legacy bios or old suggestions, or persisting editor offsets, could corrupt content or make private text public.                                                      | High     | High        | No AI backfill, semantic versioning, current compatibility at Use, explicit migration cutover, and legacy data as non-authoritative input only.                |
| Other development hazards         | Yes      | Prompt injection, XSS, output bombs, CSRF/replay, stale authorization epochs, selection races, and live-provider test flakiness remain.                                               | Critical | Medium-high | Treat text as data, no tools/URLs, protected mutations, strict schemas/limits, idempotency/CAS, fake-adapter CI, and separately certified production probes.   |

### Rejected alternatives

- a generic chatbot, whole-Page coauthor, model-authored Page, per-keystroke
  assistant, automatic correction, inline quality score, or unsolicited prompt;
- one tenant key or model that enables every AI feature, a D16-specific provider
  store, arbitrary endpoint/model/system prompt, browser provider call, or silent
  fallback;
- broad CRM/CMS retrieval, supporter or donor context, receipt or financial
  access, cross-Page memory, RAG, embeddings, browsing, tools, links, or URLs;
- generic Lengthen, persuasive/fundraising/spiritual tone, fact-check, SEO,
  safety, doctrine, prayer-request, testimony, impact, or legal-copy generation;
- automatic language detection as authority, generic `English`, combined
  translation and rewriting, cross-locale overwrite, machine-generated warning,
  or provider support as pair certification;
- replacing the source before comparison, applying to changed text, silent
  truncation, raw streamed insertion, blind retry, destructive undo, or
  suggestion-as-canonical-content reads; and
- treating configured, invoked, returned, fluent, used, staff-approved,
  bilingual-reviewed, certified, submitted, released, or published as the same
  fact.

**Architectural record:**
[ADR-0133](../../adr/0133-source-bounded-public-page-writing-assistance.md).

## D17 — What exact subject may a Project/Campaign Page represent?

**Status:** Ratified, amended, and adversarially hardened on 2026-08-06.

### Decision

> **C-prime-amended-and-hardened (C-prime-R) — for every Project/Campaign Page, one immutable-versioned, exact Page Subject Binding to exactly one code-owned and owner-certified subject kind: one canonical CRM-owned Ministry Project, one Phase 13 Giving Campaign, or one separately public-subject-eligible Phase 13 Designation presented as “Fund or designated purpose”; with the missing minimal CRM Ministry Project identity and lifecycle contract established in the operational ownership layer and every subject kind unavailable until production-certified; exact Tenant, Legal Entity, environment, Site, Page Family, source identity, source version, lifecycle, actor, reason, and effective-time scope; structurally enforced kind-matched composite foreign keys, deletion restriction, duplicate prevention, release-time source and Phase 10 reproof, and a privacy-safe subject snapshot pinned into every immutable release. Page subject, D7 Page Giving Binding, D6 progress, D1 contributor and display participation, D2 reach and release, D8 route/lifecycle disposition, D9 media, D11 Ministry Updates, D13 discovery, and D14 search/share remain independently authoritative. A pre-first-release correction creates a CAS-guarded successor binding; after the first public release, a different subject requires a new Page identity and explicit D8 succession. Staff receive one quiet, accessible “What is this page about?” setup followed by exact eligible-record search and a plain-language consequence review; missionaries receive a read-only “About this page” summary; donors see only approved public presentation—without a generic `subject_type + subject_id`, arbitrary CRM custom objects, inferred operational projects, fund-as-project relabeling, inferred permissions, inferred Giving or progress, copied operational identity, raw public source access, mutable released subjects, destructive deletion, fuzzy migration, silent substitution, dual authority, or exposed internal identifiers.**

### Binding interpretation

- A Project/Campaign Page is about exactly one certified source record of one
  closed kind: **Ongoing ministry or project**, **Fundraising campaign**, or
  **Fund or designated purpose**. Tenants cannot add arbitrary kinds or map an
  arbitrary CRM collection into the contract.
- **Ongoing ministry or project** references one canonical CRM-owned Ministry
  Project. **Fundraising campaign** references one Phase 13 Giving Campaign.
  **Fund or designated purpose** references one Phase 13 Designation only after
  Phase 13 explicitly certifies it for public-subject use and Phase 10 supplies
  a safe public presentation.
- The Ministry Project source is a deliberately minimal operational record:
  stable opaque identity, exact Tenant and Legal Entity, source-owned type and
  lifecycle, internal label, optional dates, immutable version,
  retirement/successor meaning, external-source references where applicable,
  and audit provenance. It is not a CMS Page, Designation, Giving Campaign,
  accounting project, task board, budget, progress counter, or workflow engine.
- A Page Subject Binding says only what the Page is about. The D7 Page Giving
  Binding separately says where gifts go; D6 separately says whether and how
  progress appears; D1/Phase 12 separately says who may contribute; D2/Phase 10
  separately says what may release and serve. Even if subject and Giving both
  reference the same Designation, neither relationship is inferred from the
  other.
- A source lifecycle change supplies a cause-owned input to D8. It does not
  automatically unpublish or redirect the Page, select a successor, alter
  Giving or progress, or transfer permissions.

### Structural, authorization, and release contract

- Operational Postgres owns Page identity and the Page Subject Binding.
  Payload owns authored presentation revisions referencing the opaque Page ID;
  it cannot own a polymorphic subject relationship or copy source identity into
  public content as authority.
- Every binding carries non-null Tenant, Legal Entity, environment, Site, Page
  Family, Page, subject kind, exact source identity/version, lifecycle evidence,
  actor, reason, effective interval, authorization epoch, and binding version.
  Exactly one kind-matched source reference is structurally enforced through
  typed subtype records or a closed discriminator plus exactly-one constraint.
- Same-scope composite foreign keys include Tenant and Legal Entity. Source
  deletion is restricted; retirement or succession preserves identity.
  Type-specific partial uniqueness prevents two current Pages for the same
  exact subject, Site, Page Family, and applicable locale strategy while
  preserving retired history.
- Browsers never write Page or subject rows. One idempotent server command
  re-proves actor authority, derives scope server-side, locks the exact
  source/Page scope, validates source kind, eligibility, lifecycle, and Phase 10
  safety, creates or returns the canonical private Page and binding, and emits
  audit/outbox facts. Operational truth commits first; Payload draft creation is
  idempotent and release remains blocked until cross-store reconciliation.
- Anonymous users, contributors, service-role defaults, Payload authentication,
  source ownership, Display Participants, project leads, campaign owners, fund
  managers, Party relationships, and Support Assignments grant no binding or
  Page authority. Public traffic consumes only D2's immutable release-pinned
  privacy-safe subject snapshot through the Phase 5/10 projection choke point.
- Release re-proves the exact source version, current lifecycle and eligibility,
  same-scope integrity, Phase 10-safe public presentation, D1 contributor state,
  and every independently required D2/D6/D7/D8/D9/D11/D13/D14 fact. A valid
  subject does not make any other fact valid.

### UX and accessibility contract

- Staff encounter one guided question: **What is this page about?** The UI shows
  only source-kind choices currently certified and allowed for that Tenant and
  Legal Entity. Unsupported kinds do not lead to dead or empty pickers.
- After a kind is selected, an asynchronous, indexed, cursor-paginated eligible-
  record search shows safe labels, kind, source status, Legal Entity, meaningful
  dates, and whether a current Page already exists. Raw UUIDs, GL codes,
  restricted details, and internal-only names are not primary labels or public
  output.
- Selecting a record that already has a current Page opens it. Stale,
  unavailable, cross-scope, or ineligible records show **Needs staff attention**
  with source-owned repair guidance; the public and contributor experiences do
  not reveal the internal cause.
- One consequence review keeps these rows visibly separate: **This Page is
  about**, **Gifts go to**, **Progress shown**, **Who can edit**, **Public
  reach**, and **Review before publishing** or **Publish after checks**. If the
  same Designation is appropriate for subject and Giving, the UI may offer a
  convenience to select it again, but the server records and proves two
  independent bindings.
- **Start private Page** creates only the private setup/draft path. It does not
  publish, mint an anonymously reachable route, enable Giving, or imply that the
  source itself is public. Missionaries see a read-only **About this page**
  summary; donors see approved title/content only, never internal kind, ID,
  status, source configuration, or financial setup.
- The kind chooser, search, status/error messages, consequence review, and
  actions meet keyboard, screen-reader, focus, zoom/reflow, forced-color,
  reduced-motion, mobile, and no-color-only requirements.

### Lifecycle, migration, and portability

- Before the first public release, staff may correct a mistaken subject only
  through a protected CAS-guarded command that appends a successor binding,
  preserves the prior attempt, re-proves consequences, and invalidates stale
  previews. It never overwrites history.
- After the first public release, changing the subject requires a new Page
  identity. D8 then governs the old Page's explicit transition, successor link,
  route disposition, and tombstone behavior. The old URL, releases, Updates,
  measurement, search/share, attribution, and donor expectations are never
  rewritten to describe another subject.
- Every legacy Project Page and `fundId` is staged privately and classified by
  exact source kind and stable ID/external key. A legacy `fundId` is only a
  candidate for **Fund or designated purpose** after Phase 13/10 proof; names,
  titles, copied descriptions, or fuzzy similarity never classify a record.
- The migration manifest assigns every legacy Page exactly one disposition:
  adopted, explicitly transformed, quarantined, retained as inert evidence, or
  retired. Missing, duplicate, inactive, cross-Tenant, cross-Legal-Entity, or
  ambiguous sources remain quarantined and cannot silently become a Ministry
  Project, General Fund, or public Page.
- A complete custody export preserves stable Page and source identities, subject
  kind, exact scope, binding versions/effective coverage, lifecycle and
  succession evidence, privacy-safe historical snapshots/digests, tombstones,
  and D7 Giving Bindings as separate records. Import round trips use typed
  manifests and never depend on names, row order, or undocumented provider
  fields.

### Source and phase boundaries

- **CRM operational layer / Phase 9 seam:** Ministry Project identity,
  source-owned type/status/version/lifecycle, and project relationships.
- **Phase 13:** Giving Campaign and Designation identity/lifecycle, explicit
  Designation public-subject eligibility, goals and financial facts, and D7's
  independently selected Giving destination.
- **Phase 22 D17:** Page Subject Binding versions, binding correction semantics,
  release-pinned privacy-safe subject snapshot, and setup/consequence UX.
- **D1/Phase 12:** contributors and current capabilities. **D2/Phase 10:**
  release, reach, safe public projection, and containment. **D6:** progress.
  **D8:** Page/route lifecycle. **D9:** media. **D11:** Ministry Updates.
  **D13:** public discovery. **D14:** search/share presentation. None is implied
  by the subject.
- **Payload/Phase 23:** authored presentation only. **Phase 5:** controlled
  public serving only. Neither source owns the operational subject or binding.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                  | Severity | Likelihood  | Permanent prevention                                                                                                                      |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Source schemas, status vocabularies, or adapters change; an unavailable Project owner or stale source could leave a Page pointing at fiction.                                         | Critical | High        | Closed owner adapters, immutable source versions, production certification, release-time reproof, and unavailable-until-proved kinds.     |
| Technical debt                    | Yes      | Generic type/ID fields, Payload soft references, copied identity, and duplicated validators become unenforceable and expensive to migrate.                                            | High     | High        | One canonical typed binding contract, composite FKs, generated schemas/types, and one server command.                                     |
| Edge cases                        | Yes      | Same names, merged or retired sources, reopened Campaigns, multiple Sites/locales, duplicate creation, one Designation in two roles, and post-release correction can corrupt meaning. | Critical | High        | Exact IDs/versions, uniqueness and locking, restricted deletion, independent bindings, typed lifecycle cases, and adversarial fixtures.   |
| Footguns                          | Yes      | Staff can confuse what the Page is about with where gifts go, progress, ownership, or access.                                                                                         | Critical | High        | Plain-language kinds, scoped search, separate consequence rows, explicit confirmation, and immutable released subjects.                   |
| Tenant safety                     | Yes      | A simple UUID FK or client-supplied scope can cross Tenant or Legal Entity boundaries.                                                                                                | Critical | Medium-high | Server-derived context, same-scope composite keys, explicit grants/indexed RLS, and hostile two-tenant tests.                             |
| Over-engineering                  | Yes      | A tenant-authored ontology, universal polymorphic registry, or project-management subsystem adds complexity without authority.                                                        | High     | Medium      | Exactly three code-owned kinds and one minimal CRM Project source; no custom-kind DSL or arbitrary objects.                               |
| UX/UI and user friction           | Yes      | Internal object terms, 200-row dropdowns, raw IDs, dead options, and ambiguous actions make the correct setup hard.                                                                   | High     | High        | Capability-aware choices, indexed accessible search, open-existing behavior, plain summaries, and precise **Start private Page** copy.    |
| Hidden coupling                   | Yes      | Subject selection can accidentally choose Giving, progress, contributors, routes, copied content, or public identity.                                                                 | Critical | High        | Explicit independent owner-domain bindings and release pins; no derivation between them.                                                  |
| Failure modes                     | Yes      | Source state can change during setup/release, duplicate commands can race, or the operational write can succeed while Payload creation fails.                                         | Critical | High        | Locks/CAS, semantic idempotency, operational-first transaction plus outbox, inspect-before-retry, and release coherence gate.             |
| Data integrity risks              | Yes      | Application-only duplicate checks race; soft references orphan; deletion erases history; silent repointing falsifies old releases.                                                    | Critical | High        | Database uniqueness, typed FKs, `ON DELETE RESTRICT`, append-only binding lineage, and new Page identity after release.                   |
| Security and privacy risks        | Yes      | Internal project names, source descriptions, IDs, status, GL codes, or restricted identities can leak through CMS, APIs, errors, logs, or RLS.                                        | Critical | High        | Phase 10-safe release snapshot only, no anonymous source/binding reads, neutral external errors, redacted telemetry, and negative tests.  |
| Scalability and performance risks | Yes      | Flat selectors, union scans, per-row RLS recursion, and repeated raw-source joins degrade at tenant scale.                                                                            | High     | High        | Cursor pagination, composite indexes, bounded eligible-source projections, release snapshots, query-plan and load gates.                  |
| Operational burden                | Yes      | Staff otherwise need tribal knowledge of Projects, Campaigns, Designations, duplicate repair, and three ownership models.                                                             | High     | Medium      | One guided setup, source-owned repair links, quiet exceptions, automated reconciliation, and complete export.                             |
| Observability gaps                | Yes      | Operators may not distinguish missing source, scope violation, source drift, duplicate Page, absent Payload draft, or safety block.                                                   | High     | High        | Correlated Page→binding→source→revision→release evidence, safe reason codes, coverage and drift monitors.                                 |
| Dependency and integration risks  | Yes      | Source vendors and CRM schemas may omit tombstones, change IDs/statuses, or lack a certified Ministry Project source.                                                                 | Critical | High        | Versioned adapters, explicit lifecycle/tombstone contracts, certification expiry, and unsupported-kind containment.                       |
| Migration and upgrade risks       | Yes      | Legacy `fundId`, fund/project/campaign conflation, copied titles, and fuzzy name matching can misclassify Pages and gifts.                                                            | Critical | High        | Complete census, typed mapping/disposition manifest, exact keys, private shadow reconciliation, quarantine, and one authority cutover.    |
| Other development hazards         | Yes      | Creation races, stale retries, service-role bypass, cross-store dual write, destructive rollback, and conflicting decision labels threaten consistency.                               | Critical | High        | Linearized command, idempotency/CAS/outbox, RLS plus constraints, append-only recovery, failure injection, and unique decision numbering. |

### Production proof gates

- Constraint and concurrency tests reject zero/multiple sources, discriminator
  mismatch, nonexistent or cross-scope source, destructive delete, duplicate
  current Page, stale correction, and post-release in-place swap.
- Authorization/RLS matrices cover anonymous, contributor, displayed person,
  project participant/lead, campaign owner, fund manager, revoked actor, staff,
  superadmin, service role, cross-Tenant, and cross-Legal-Entity paths.
- Every subject adapter proves eligibility, safe staff label, exact scope,
  immutable version, active/paused/completed/closed/retired/restored/successor
  lifecycle, export/tombstone behavior, and production-shaped fixtures.
- Cross-store failure injection proves exactly one operational Page and at most
  one Payload draft through timeout, retry, reorder, duplicate, and partial
  failure; release remains blocked until coherence is proved.
- Migration fixtures cover project-like funds, Designated Purposes, Campaigns,
  duplicate names, missing/inactive/restricted sources, corrupted cross-scope
  links, duplicate Pages, and complete disposition/control-total reconciliation.
- Accessibility and usability proof covers keyboard/screen reader, 320-CSS-pixel
  reflow, 200% zoom, mobile, forced colors, clear subject-versus-Giving meaning,
  duplicate resolution, and representative staff using materially different
  Project/Campaign/Designation vocabularies.
- Public privacy tests prove no source table, internal ID/name/status, raw
  description, GL code, restricted identity, binding row, or unsafe error enters
  HTML, RSC/data, API, metadata, card, sitemap, cache, log, or analytics output.

### Rejected alternatives

- generic `subject_type + subject_id`, arbitrary CRM custom objects, tenant-
  authored subject kinds, or a universal relationship DSL;
- treating every fund/Designation as a Project, every Campaign as a Page, or a
  CMS document/title as operational identity;
- using a subject relationship to infer Page access, contributors, displayed
  participants, Giving, progress, notifications, reach, release, or lifecycle;
- keeping mutable released subjects, cascading/deleting sources, rewriting
  historical releases, or silently substituting a successor;
- anonymous raw-source reads, direct browser/service-role writes, copied
  operational fields, raw IDs or internal labels in public output;
- application-only duplicate checks, blind retry, fictional cross-database
  atomicity, destructive rollback, or dual source authority; and
- fuzzy legacy matching, automatic Project promotion, General Fund fallback, or
  migration that leaves unclassified rows outside a complete disposition.

**Architectural record:**
[ADR-0134](../../adr/0134-exact-typed-public-page-subject-bindings.md).

## D18 — What may the Public Ministry runtime cache, and how must adverse changes converge?

**Status:** Ratified, amended, and adversarially hardened on 2026-08-06.

### Decision

> **C-prime-amended-and-hardened (C-prime-R) — one Phase-5-executed,
> Phase-22-semantic Public Ministry Runtime Composition Contract that selects
> only immutable, coherently available D2/D3/D4/D5/D9/D14/D17 release-bound
> presentation by exact opaque scope and generation after one small, disposable
> current-serving evaluation outside reusable content; resolves independently
> authoritative D2 reach, Phase 10 safety and containment, and D8 route heads to
> one typed local outcome; and composes D6 public progress, D7 Giving readiness,
> D9 delivery, D11 public Ministry Update releases, D13 discovery, and D14
> search/share only through their owner-versioned projections and degradation
> rules. No complete Asym-controlled HTML, RSC/prefetch, JSON, route, metadata,
> sitemap/robots, directory/search, Ministry Update, media/image-optimizer,
> resolver, or CDN response may bypass current admission; D7/Phase 13 executable
> actions always re-prove at their final boundary; and D15 measurement remains
> structurally absent from fetch, render, cache, crawler, social, probe, and
> repair traffic. Page- or Update-specific shared full-response caching is
> prohibited unless a provider-, product-, environment-, route-, and
> variant-pinned edge admission path is production-certified to run before that
> cache; otherwise only identity-free shells or immutable fragments may be
> shared-cached and the composed response remains dynamic and non-shared.**
>
> **Ordinary owner-authorized positive replacement production-shapes and
> addresses one complete immutable generation before D2's sole CAS activation,
> while the prior still-current safe release may remain available. An
> owner-labelled adverse or unknown fact first denies, omits, or disables only
> its affected positive behavior at the current local request or action boundary
> and forbids stale-while-revalidate and stale-if-error for that scope; it then
> invokes Phase 5 transport and the existing D8, D9, D13, and D14 effect owners
> through one code-owned applicable-surface coverage plan and rebuildable
> convergence projection that reference rather than recreate their facts.
> Monotonic generations, a transactionally coupled outbox, idempotency, lease
> fencing, tenant-fair coalescing, exact-scope keys, bounded retries, and
> residual-only recovery prevent reordered or duplicate work from resurrecting
> an older positive generation.**
>
> **Release activated, current admission, cache expiration requested, provider
> accepted, controlled response observed, not verifiable, and external
> observation remain separate facts. Healthy propagation is silent;
> contributors see only Public, Updating, or Not public, while staff see a
> cause-owned exception only for a missed controlled-surface deadline, including
> plain visitor impact, current automatic repair, and one narrow corrective
> action. Asym may claim current denial and best-evidenced cleanup only for
> surfaces it controls; recipient-held browser or router caches, screenshots,
> downloads, copied links, search engines, social networks, archives, and other
> external copies remain explicitly uncontrolled—without a second release,
> route, media, directory, search/share, subject, safety, Giving, progress, or
> measurement authority; raw-source joins; whole-request source fan-out;
> tag-as-isolation; tenant TTL or workflow matrices; broad purge; force success;
> blind retry; destructive rollback; stale adverse fallback; provider-parity
> fiction; public diagnostics; log-derived analytics; or any claim that
> released, served, cached, invalidated, accepted, observed, converged, crawled,
> indexed, shared, recalled, or forgotten are the same fact.**

### Runtime interpretation

- D18 has exactly four semantic freshness classes: **immutable released
  presentation**, **current serving admission**, **optional operational
  projections**, and **executable actions**. Tenants do not configure TTLs,
  cache keys, surface lists, purge behavior, or freshness workflows.
- The exact current-serving evaluation resolves only four typed local outcomes:
  **serve current release**, **privacy-safe absence**, **same-page redirect**, or
  **temporarily unavailable**. Unknown authority is the last outcome with a
  neutral, non-enumerating, non-shared response; it never becomes stale positive
  content, zero, or false not-found.
- Immutable released presentation is keyed by the complete Tenant, Legal Entity,
  environment, Site, verified host, locale, Page Family, Page or Update, route,
  release, renderer/deployment, Presentation Profile, safety epoch, and every
  referenced media/projection generation. Tags are invalidation handles only;
  they are never tenancy, authorization, completeness, or publication truth.
- The current-serving evaluation is disposable and rebuildable from
  D2, Phase 10, and D8 authority. It is deliberately small enough to evaluate
  before reusable positive content without a whole-request operational or CMS
  fan-out. It does not become another reach, safety, or route source.
- D6 progress is displayed only within its owner-proved validity and through-
  date; adverse or unknown progress is omitted, never retained or converted to
  zero. D7 Giving remains independently re-proved at the final Phase 13 action
  boundary. D9 media remains a current-authorized, immutable public derivative.
  D13/D14 directory, search, sitemap, metadata, and share outputs remain bound
  to their exact eligible release.
- Identity-bearing complete HTML, RSC/prefetch, JSON, metadata, card, sitemap,
  directory/search, media, or CDN responses cannot answer before current
  admission. The safe default is shared caching of identity-free shells or
  immutable fragments with a dynamic non-shared composed response. A complete
  shared response is allowed only where the exact hosting path is certified to
  execute the admission gate before every cache variant.

### Positive replacement and adverse convergence

- An ordinary approved positive replacement is completely generated,
  content-addressed, validated, and made coherently available before D2's sole
  release-head CAS. The preceding release may use bounded stale-while-revalidate
  only while it remains independently current, safe, reachable, and valid.
- Reach narrowing, Phase 10 containment, consent withdrawal, route retirement,
  Giving ineligibility, adverse progress correction, media withdrawal, and
  directory/search removal first deny, omit, redirect, or disable the affected
  positive behavior at the current local boundary. Stale-while-revalidate and
  stale-if-error are prohibited for that adverse scope.
- One append-only Public Ministry Surface Convergence Operation is created through a
  transactionally coupled outbox from the owner-labelled cause. It carries the
  exact scope, desired generation/disposition, input digest, idempotency key,
  applicable-surface coverage, deadline, attempts, and evidence. Workers use
  monotonic generation checks, single-flight or leases with fencing, bounded
  retries, tenant-fair coalescing/backpressure, and residual-only recovery.
- Applicable controlled surfaces include HTML, RSC and prefetch variants,
  public APIs/JSON, metadata and generated share images, sitemap and robots,
  redirects and tombstones, directory/search documents, source and transformed
  media, effective browser/CDN headers, and every organization-controlled CDN.
  D8, D9, D13, and D14 retain their own effect manifests; D18 references them.
- **Release activated**, **current admission**, **expiration requested**,
  **provider accepted**, **controlled response observed**, **not verifiable**,
  and **external observation** are separate facts. Provider acceptance or one
  cache header cannot close applicable coverage or prove removal everywhere.

### UX and operational contract

- Healthy activation and convergence create no task. Contributors see only the
  runtime/convergence summary **Public**, **Updating**, or **Not public** and
  never see TTLs, tags, variants, CDNs, queues, generations, or purge controls.
  These quiet summaries do not replace D2's exact Publication Reach outcomes:
  **Listed publicly**, **Shared by link — public**, and **Not public**.
- Staff additionally see **Visitor access stopped — cleanup continuing** or
  **Needs attention** only after a controlled-surface deadline is missed or a
  cause requires authorized action. Progressive detail shows plain visitor
  impact, affected surface, last proof/time, automatic next step, and one
  residual cause-owned action.
- The required adverse explanation is honest: **New requests through Asym are
  blocked. Cleanup of systems we control is continuing. Copies already saved or
  cached by other services may remain outside Asym's control.**
- There is no ordinary **Purge**, **Force live**, **Mark fixed**, or cache-policy
  workflow. An exceptional destructive provider operation requires exact
  capability proof, least privilege, rate/stampede protection, impact preview,
  append-only audit, and a still-authoritative local gate.
- Statuses, exceptions, and actions meet keyboard, screen-reader, focus,
  contrast, forced-color, 200% zoom/reflow, mobile, and no-color-only
  requirements. D15 measurement cannot count render, cache, crawler, social,
  probe, or repair traffic as human interaction.

### Source and phase boundaries

- **Phase 5** owns Next.js/Vercel-agnostic public-runtime primitives, exact cache
  arguments and tags, invalidation transport, host resolution, and public read
  choke points. D18 supplies Public Ministry semantics and applicable coverage;
  it does not fork those primitives.
- **D2 and Phase 10** own current reach, safe public projection, and containment.
  **D8** owns route and lifecycle disposition. Their facts feed the disposable
  current-admission projection but are not copied into D18 authority.
- **D6** owns progress truth and failure presentation. **D7/Phase 13** own the
  Giving binding and final executable eligibility. **D9/Phase 29** own public
  media and delivery authorization. **D11** owns Ministry Update releases.
  **D13** owns public discovery. **D14** owns search/share presentation.
  **D15** owns only bounded measurement. **D17** supplies the release-pinned
  public-safe Project/Campaign subject snapshot; **D19** supplies the release-
  pinned Missionary Ministry Assignment subject snapshot.
- Payload publication, deployment completion, cache entries, provider IDs,
  webhook delivery, purge response, crawler activity, or social-card refresh
  never become publication, reach, safety, route, media, progress, Giving,
  discovery, search/share, subject, or measurement truth.
- Browsers, recipient caches, screenshots, downloads, copied links, search and
  social caches, archives, and third-party replicas are uncontrolled external
  copies. D18 may record observations and trigger supported owner workflows but
  cannot truthfully claim recall or forgetting.

**D19 precision.** For a Missionary Ministry Page, D1 owns the Page Subject
Binding, Phase 9 owns the Ministry Assignment identity/lifecycle and source
version, and Phase 10 owns the minimum public-safe snapshot. D18 composes that
exact release-pinned snapshot but owns none of those facts and never raw-joins
CRM. A Ministry Assignment adverse lifecycle fact first enters the owning
Phase 10/D2/D8 safety, release, and route handling; D18 performs only the
resulting current admission and controlled-surface convergence. Membership or
Support Binding changes do not themselves select a Page disposition.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                 | Severity | Likelihood  | Permanent prevention                                                                                                                               |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Cache and projection layers can advance out of order; one missed variant can retain unsafe positive content.                                         | Critical | High        | Immutable generations, exact coverage, owner-labelled causes, outbox, monotonic consumers, and local denial independent of cleanup.                |
| Technical debt                    | Yes      | Per-route TTLs, tags, hooks, and `published` booleans create competing policies.                                                                     | High     | High        | One semantic boundary, exact key builder, four freshness classes, structural lint, and legacy-policy retirement.                                   |
| Edge cases                        | Yes      | Cached errors/redirects, aliases, locales, host moves, old RSC prefetches, withdrawn derivatives, rollbacks, and late retries can resurrect content. | Critical | High        | Sequence generations, tombstones, complete variant manifests, content digests, CAS/fencing, and reorder/delete property tests.                     |
| Footguns                          | Yes      | Tenant TTLs, broad purge, destructive delete, force success, or manual keys can expose data or take down the origin.                                 | Critical | Medium-high | No tenant cache controls or generic purge; typed scopes and audited, bounded residual repair only.                                                 |
| Tenant safety                     | Yes      | An omitted Tenant, Legal Entity, Site, host, locale, release, or generation can cross-serve or collateral-purge.                                     | Critical | Medium-high | Structural composite scopes, authoritative mappings, tenant-qualified provider namespaces, exact key arguments, and hostile isolation tests.       |
| Over-engineering                  | Yes      | A universal cache/workflow DSL would obscure the small set of actual semantics.                                                                      | High     | Medium      | Four fixed freshness classes, one convergence operation, and a small code-owned surface catalog.                                                   |
| UX/UI and user friction           | Yes      | Cache jargon, manual publish/purge steps, or premature `Live` copy mislead contributors and burden staff.                                            | High     | High        | Quiet automation, Public/Updating/Not public contributor states, exception-first staff detail, and one residual action.                            |
| Hidden coupling                   | Yes      | Payload, CDN, progress, Giving, media, route, and search can accidentally share authority or failure.                                                | Critical | High        | Independently owned typed projections and explicit component degradation; D18 composes only.                                                       |
| Failure modes                     | Yes      | Lost/duplicate events, partial purge, accepted-but-stale provider work, failed rendering, or admission outage can expose stale bytes.                | Critical | High        | Transactional outbox, production-shaped generation proof, fencing, safe non-shared unavailable response, deadlines, probes, and residual recovery. |
| Data integrity risks              | Yes      | Mutable cache rows, timestamp order, ambiguous paths, destructive cleanup, or idempotency reuse can mix generations.                                 | Critical | High        | Content addressing, input-digest validation, append-only evidence, exact constraints, and deterministic rebuilds.                                  |
| Security and privacy risks        | Yes      | Restricted identity, source filenames, direct media, hidden metadata, cache deception, or public diagnostics can leak.                               | Critical | High        | Current admission before positive bytes, D9 opaque references, neutral responses, private body-free telemetry, and negative security tests.        |
| Scalability and performance risks | Yes      | Request fan-out, tag explosion, broad purges, synchronized expiry, or deletion stampedes can overload systems.                                       | High     | High        | One indexed admission read, immutable fragment caching, bounded tags, coalescing, tenant-fair queues, jitter, and load tests.                      |
| Operational burden                | Yes      | Staff might otherwise manage CDN regions, RSC variants, transformed images, and retries manually.                                                    | High     | High        | Certified adapters, automatic residual retries, one exception inbox, manifest-derived runbooks, and scoped kill switches.                          |
| Observability gaps                | Yes      | One provider `200`, empty queue, or cache miss may be mistaken for complete convergence.                                                             | Critical | High        | Correlated cause-to-surface evidence with requested, accepted, observed, not-verifiable, and external states separated.                            |
| Dependency and integration risks  | Yes      | Next.js, hosting, CDN, image, CMS, search, and social semantics differ and change.                                                                   | High     | High        | Provider/product/environment/version-pinned capabilities, production certification, circuit breakers, and provider-independent local denial.       |
| Migration and upgrade risks       | Yes      | New renderers, key schemas, domains, framework releases, or providers can orphan old positive variants.                                              | High     | Medium-high | Versioned schemas/namespaces, retirement manifests, shadow proof, purge-before-retire evidence, one authority, and CAS rollback.                   |
| Other development hazards         | Yes      | Browser router caches, deployment skew, clock order, stale leases, non-atomic writes, and dev-only behavior can invalidate plausible tests.          | Critical | High        | Database generations/transactions, fencing, exact-version production tests, fault injection, named owners, and staged rollout.                     |

### Production proof gates

- Property tests prove no positive cached payload is selected without current
  exact-scope admission; an older generation cannot overwrite, reactivate, or
  close a newer generation; unknown cannot become positive, zero, or not-found;
  and no key/tag crosses Tenant, Legal Entity, Site, host, locale, route,
  release, renderer, profile, media/projection generation, or safety epoch.
- Exact production builds—not dev/HMR—prove effective browser/CDN headers,
  HTML, RSC/prefetch, Router Cache navigation, API/JSON, metadata, structured
  data, sitemap/robots, route/redirect, directory/search, source media, and all
  optimized derivatives through ordinary and adverse transitions.
- Every provider/product/environment adapter proves actual invalidate, delete,
  readback/observation, regional propagation, rate limit, unsupported
  capability, and origin-failure behavior. A provider preview or sandbox cannot
  establish production cache ordering.
- Fault injection covers provider outage, accepted work with stale observations,
  duplicate/reordered/delayed/lost messages, worker crash after external effect,
  expired lease with an old worker continuing, deployment skew, admission-store
  uncertainty, rendering failure, and mass multi-tenant containment.
- Security proof covers Phase 10 narrowing and consent withdrawal, D9 media
  withdrawal, cache-deception/path-confusion, uniform denial, inaccessible
  service evidence, no sensitive values in bodies/headers/logs, and no raw
  Payload or operational public reads.
- Performance proof covers hot pages, mass adverse events, provider throttling,
  cache stampede resistance, tenant fairness, bounded admission latency, and
  real D15 field budgets without weakening current safety.
- Accessibility/usability proof covers contributor and staff states, exception
  disclosure, keyboard/screen reader, mobile, reflow/zoom, forced colors, and
  representative users completing the normal flow without cache knowledge.
- Migration proof accounts for every mock/static Page, legacy 60-second entry,
  old key namespace, direct source-media URL, transformed derivative, route,
  alias, sitemap/robots entry, metadata/share artifact, and previous deployment
  through one explicit disposition. Rollback cannot revive an unsafe old Page.

### Rejected alternatives

- always-live request assembly across CMS, safety, progress, Giving, media,
  route, directory, and search sources;
- one whole-page TTL, ISR snapshot, CMS publish webhook, or provider cache as
  complete Page truth;
- origin-only admission where a CDN or browser can answer first;
- shared complete Page or Update responses without exact pre-cache admission
  certification for every provider/environment/route/variant;
- stale-while-revalidate or stale-if-error for any adverse scope;
- tag-as-tenant isolation, tag-as-authorization, arbitrary tenant TTLs, per-page
  cache workflows, or generic provider parity;
- broad tenant/project purge, ordinary destructive deletion, blind retry,
  force-success, destructive rollback, or manual database repair;
- provider acceptance, one sampled header, queue emptiness, or search-console
  submission as proof of complete convergence; and
- any promise to recall or forget recipient-held, crawler, social, archive,
  screenshot, download, or other uncontrolled copies.

**Architectural record:**
[ADR-0135](../../adr/0135-release-bound-public-ministry-runtime-composition.md).

## D19 — How do couples and teams share one ministry Page and, separately, the right support information?

**Status:** Ratified, amended, and adversarially hardened on 2026-08-06.

### Decision

> **C-prime-amended-and-hardened (C-prime-R) — one stable,
> CRM-authoritative, organization-owned, Tenant- and Legal-Entity-scoped
> Ministry Assignment with immutable identity and versioned lifecycle as the
> exact operational subject referenced—not copied—by each Missionary Ministry
> Page; zero-to-many prospective, effective-dated, append-only-corrected Party
> Participant Memberships; and one optional, prospective, immutable,
> same-scope, one-to-one Ministry Assignment Support Binding Version to Phase
> 21’s independently authoritative Support Assignment. Every spouse, teammate,
> leader, coach, staff member, and contributor retains a separate Party,
> principal, login, invitation, Ministry Assignment membership, Phase 21
> Support Assignment Participant Membership, D1 Display Participant and Public
> Page Contributor Assignment, Phase 12 Support Workspace authorization,
> responsibility, history floor, and notification-preference identity. One
> quiet tenant-defaulted People & access experience may atomically materialize
> the explicitly selected local facts and outbox intent through bounded safe
> presets and one literal consequence review, allowing multiple separately
> authenticated people to view the same source-owned support activity and exact
> per-ISO-currency Finance-confirmed Field Account Balances when—and only
> when—each holds the current purpose-, projection-, target-, and field-specific
> Phase 12 grant and the tenant’s applicable D9 publication permits that module.
> Ministry pages remain fully functional when Phase 21 is disabled or no
> Support Binding exists; membership, marriage, household, display, editing,
> Designation, D6 public progress, notification preference, or the Support
> Binding itself grants no financial access, reveals no supporter identity,
> moves no money, or changes historical truth. Composite same-scope
> constraints, non-overlapping half-open membership and binding intervals,
> explicit Data API grants, forced coarse Tenant RLS, browser-inaccessible raw
> tables, the sole server-side Phase 12 PDP, live authorization epochs,
> security-invoker or unexposed views, signal-only private Realtime,
> append-only evidence, deny-first revocation, non-propagating rebinding, and
> production-shaped isolation, bypass, concurrency, performance, privacy,
> mobile, and accessibility proof are mandatory—without shared credentials,
> person- or household-owned funds, implicit spouse/team access, a Phase 22 ACL
> engine, permission arrays in JWTs, client-trusted scope,
> service-key-as-authority, raw financial subscriptions, destructive merge,
> copied ledgers or balances, authoritative converted totals, or
> membership-driven financial mutation.**

### Domain and source interpretation

- A **Ministry Assignment** is the stable CRM-owned identity for one
  organization-authorized ministry within one Tenant and Legal Entity. It may
  have zero, one, or many current Party participants, and one Party may
  participate in multiple Ministry Assignments. Its identity survives marriage,
  team, leadership, employment, login, and participant changes.
- A Ministry Assignment is the people, service, and optional Support Workspace
  context for a Missionary Ministry Page. A Phase 9 Ministry Project is an
  initiative/program subject for D17's Project/Campaign Page. D19 adds no fourth
  D17 arm and never auto-links those two CRM identities.
- Every Missionary Ministry Page references one exact source-qualified Ministry
  Assignment identity and version through its D1 Page Subject Binding and
  re-proves current source eligibility before a new release. Page presentation
  references an approved public-safe snapshot; it never copies the assignment
  or makes Payload/CMS the operational owner.
- A **Ministry Assignment Participant Membership** records association only for
  one exact half-open interval. It does not grant public display, page editing,
  support-data access, responsibility, notification eligibility, donor-purpose
  authority, or money movement.
- D1 Display Participant and Public Page Contributor Assignment remain separate.
  A spouse may be associated but not displayed, displayed but not allowed to
  edit, or allowed to edit without receiving any financial field.
- The optional **Ministry Assignment Support Binding Version** is owned and
  written only through a separately finance-authorized Phase 21 command. It
  references one independently authoritative Support Assignment and is
  prospective, immutable, same-Tenant, same-Legal-Entity, and one-to-one within
  each non-overlapping effective interval. Phase 22 consumes the bridge but
  cannot select or mutate it through Page or contributor authority. It neither
  copies Field Account truth nor becomes a permission.
- A Missionary Ministry Page and its editing workflow work normally with no
  Support Binding or when Phase 21 is unavailable. The support module is absent
  by default. An unavailable state may appear only when this viewer is
  authorized, D9 selected that exact module, and its owning projection reports
  a temporary failure; balance-off renders no balance card or placeholder.
- Before a Page has ever released publicly, a subject correction appends a
  CAS-guarded successor binding. After first public release, a different
  Ministry Assignment requires a new Page identity and explicit D8 succession.
  Retirement preserves prior release history and enters D8 handling; it never
  repoints the Page.

### Independent authorities

The following facts may be presented together but never collapse:

1. Phase 9/CRM owns Ministry Assignment identity, lifecycle, and Party
   Participant Membership.
2. D1 owns Page Subject Binding, Display Participant, and Public Page Contributor
   Assignment. D4/D5 own content review and release handling.
3. Phase 21 D19 owns Support Assignment identity and Participant Membership and
   is the finance-authorized writer of the Ministry Assignment Support Binding
   Version. Phase 21 D1/D11 owns exact per-currency support occurrences, closes,
   and Finance-confirmed Field Account Balances.
4. Phase 12's sole server-side PDP owns every current principal-bound Support
   Workspace authorization, including purpose, projection, target, field,
   Legal Entity, history floor, and governance epoch.
5. Phase 21 D9 owns the applicable tenant-controlled support module publication
   choice. D6 owns only public, privacy-safe progress presentation and never
   authenticates access to support activity or balances.
6. Phase 6 owns notification intent, dispatch, suppression, and outcome; an
   independently current recipient preference and authorization remain
   prerequisites.

A relation in one list is not evidence for another. In particular, marriage,
household, assignment membership, subject, display, contributor, Designation,
progress, notification preference, or the Support Binding grants no financial
field or supporter identity.

### Quiet People & access experience

- Staff work in one progressive **People & access** surface. The first screen
  shows the ministry and its current people, followed only by applicable
  choices: **Associated with this ministry**, **Shown on the public page**,
  **Can edit this page**, **Can use the Support Workspace**, and **Gets
  updates**. When Support Workspace access is selected, the review lists the
  exact tenant-enabled modules, fields, and history independently; support
  activity does not imply that balances are enabled or visible.
- Tenant-defaulted safe presets may preselect a common spouse, teammate, leader,
  coach, or staff combination. Presets are convenience only and compile to exact
  owner-domain records; the minimum-safe support preset excludes supporter
  identity, contact details, evidence, and other sensitive fields unless each is
  separately field-authorized. There is no tenant-defined permission or
  workflow DSL.
- One literal review names the person, Page, ministry, Support Assignment when
  applicable, fields/history exposed, invitation, notification effect, and
  effective date. It also says **No balance moves. No closed history changes.**
- The action may atomically commit its local explicit facts and an outbox intent.
  External invitation and notification delivery remain asynchronous, visible,
  idempotent, and recoverable; a delivery failure never grants access or rolls
  back unrelated valid facts.
- Every person uses their own login. Pending, expired, revoked, wrong-tenant, or
  wrong-principal invitations grant nothing. Mobile invitation acceptance and
  account recovery do not require shared credentials or desktop-only steps.
- Missionaries see a quiet Page/team summary and only the support modules and
  fields they may currently use. They do not see access-control terminology,
  other people's permissions, hidden supporter fields, raw currencies combined
  into one total, or a false claim that support is available to spend.
- Removing access is deny-first and immediate for new reads. The interface
  separately previews association, display, editing, support access, and
  notification consequences so staff do not accidentally end all five when
  intending one.

### Supabase, PostgreSQL, and isolation contract

- Every Assignment, membership, binding, invitation, grant target, outbox, and
  evidence row carries complete Tenant and Legal Entity scope. Composite foreign
  keys reject cross-scope references; exclusion constraints reject overlapping
  current membership and binding intervals; deletion is restricted and
  corrections are append-only.
- RLS is enabled and forced on every D19 relation as a coarse Tenant isolation
  backstop. Table owners, service roles, and `BYPASSRLS` paths are not user
  authority and must repeat the same application authorization.
- Fine-grained spouse, participant, Page, Support Assignment, purpose,
  projection, field, and history-floor rules live only in Phase 12's server-side
  PDP. They are not duplicated in Phase 22 RLS, JWT permission arrays,
  `user_metadata`, cookies, URLs, or client state.
- Raw relations and finance-bearing views are inaccessible through the browser
  Data API. Least-privilege grants and revocations are explicit, with no `anon`
  or `authenticated` raw-table grant, and the catalog posture is tested. Any
  exposed view is security-invoker and still passes the server boundary;
  otherwise the view remains in an unexposed schema.
- The server derives the current principal and exact target; clients may request
  an opaque resource but cannot assert Tenant, Legal Entity, Ministry
  Assignment, Support Assignment, capability, purpose, projection, or fields.
- Authorization epochs and history floors are checked at request time so a
  stale JWT, cached response, deep link, queued job, or long-lived session cannot
  retain revoked access.
- Realtime is private and signal-only. An opaque resource/version signal causes
  a fresh authorized server read. Raw financial, supporter, membership,
  permission, or preference rows are never browser-subscribed.

### Lifecycle and recovery

- Adding, ending, correcting, or succeeding a Ministry Assignment membership
  does not propagate to Page display/edit rights, Phase 21 participation,
  Support Workspace access, responsibilities, or notifications. The UI may
  offer explicit follow-up choices, each owned and recorded separately.
- Rebinding to a different Support Assignment is prospective and requires exact
  same-scope proof plus a consequence review. It never transfers grants,
  participant membership, balances, closed history, donor identity, progress,
  Giving destination, or notifications. Existing access becomes an explicit
  retain/end/re-authorize decision under its owner.
- Party merge/split, spouse separation, departure, death/incapacity, leadership
  change, legal-entity change, tenant deactivation, Page retirement, and Support
  Assignment retirement preserve immutable attribution and route unresolved
  consequences to named owner-domain cases; none rewrites history or chooses a
  successor implicitly.
- Unknown or unavailable authorization fails closed for the affected positive
  field only. Authorized nonfinancial Page work and mandatory adverse
  corrections continue. Recovery is append-only and residual-only; no manual
  database edit, destructive merge, or broad tenant reset is permitted.

### Current implementation and migration posture

- The current person-keyed missionary portal and donation reads are prototype
  evidence, not D19 authority. A service-role client, `missionary_id` filter, or
  one `.single()` profile cannot establish couples, teams, field-level access,
  or tenant isolation.
- Migration uses a private typed mapping manifest for every legacy missionary,
  Page, collaborator, support/fund reference, and portal-access observation.
  Names, email addresses, marriages, household records, shared URLs, and prior
  visibility are evidence for human review only, never automatic authority.
- Every legacy row receives one explicit disposition: exact adoption, bounded
  transformation, quarantine for ambiguity, inert retained evidence, or
  retirement. Cutover proves one source authority and leaves no dual
  person-owned/Ministry-Assignment read or write path.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                | Severity | Likelihood  | Permanent prevention                                                                                                                                     |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | A person-keyed shortcut breaks when spouses share a ministry, one person serves several ministries, or participants change.                                                         | Critical | High        | Stable organization-owned Ministry Assignment, exact memberships, optional typed Support Binding, and source-qualified lifecycle.                        |
| Technical debt                    | Yes      | Repeating spouse/team inference across Pages, portal queries, notifications, and finance creates incompatible authorization logic.                                                  | Critical | High        | One CRM association model, D1 assignments, sole Phase 12 PDP, and owner-specific records behind one orchestrated UI.                                     |
| Edge cases                        | Yes      | Zero participants, many participants, multiple ministries per person, separation, merge/split, departure, rebinding, or partial invitation failure can orphan or overexpose access. | Critical | High        | Half-open versions, explicit dispositions, deny-first revocation, no propagation, append-only recovery, and lifecycle tests.                             |
| Footguns                          | Yes      | A friendly **Add spouse** or **Share** action could silently expose donor identity or terminate unrelated rights.                                                                   | Critical | High        | Separate consequence choices, safe presets, literal review, field/history preview, own logins, and no broad share toggle.                                |
| Tenant safety                     | Yes      | Missing Tenant or Legal Entity keys, service-role reads, or client-selected scopes can leak Page or financial data across organizations.                                            | Critical | Medium-high | Composite same-scope constraints, explicit grants, forced coarse RLS, server-derived scope, sole PDP, and hostile isolation tests.                       |
| Over-engineering                  | Yes      | A generic relationship/ACL/workflow engine would make ordinary spouse setup incomprehensible and duplicate Phase 12.                                                                | High     | Medium      | Three small typed association/binding facts, bounded presets, progressive disclosure, and no custom permission DSL.                                      |
| UX/UI and user friction           | Yes      | Staff may confuse **associated**, **shown**, **can edit**, **can view support**, and **gets updates**; missionaries may see irrelevant controls.                                    | High     | High        | One People & access surface, plain consequence labels, applicable choices only, preview, quiet defaults, mobile and accessibility proof.                 |
| Hidden coupling                   | Yes      | Changing a marriage, Page contributor, progress setting, Designation, or Support Binding could accidentally move money or grant access.                                             | Critical | High        | Independent owners, non-propagating events, explicit follow-up commands, and contract tests proving no derived authority.                                |
| Failure modes                     | Yes      | Invitation, outbox, PDP, Realtime, or binding operations can partially fail, race, or retry after revocation.                                                                       | Critical | High        | Atomic local facts plus outbox, idempotency, CAS/locks, authorization epochs, signal-only refresh, and residual recovery.                                |
| Data integrity risks              | Yes      | Duplicate/overlapping memberships, cross-scope bindings, destructive Party merge, or rebinding could rewrite who saw what and when.                                                 | Critical | Medium-high | Composite FKs, exclusion/uniqueness constraints, restricted delete, immutable versions, actor/cause evidence, and invariant tests.                       |
| Security and privacy risks        | Yes      | Participant inference, stale JWTs, raw views/subscriptions, broad supporter fields, or service-key bypass can expose sensitive supporters and balances.                             | Critical | High        | Sole server PDP, least fields, history floors, live epochs, unexposed raw data, explicit grants, forced RLS, and negative tests.                         |
| Scalability and performance risks | Yes      | Per-row policy recursion and N×membership×field joins can fail for large teams and high-volume activity.                                                                            | High     | Medium-high | Coarse indexed RLS, server-side compiled projection decisions, bounded pagination, stable query shapes, load plans, and no raw Realtime fan-out.         |
| Operational burden                | Yes      | Staff could otherwise maintain the same person separately across CRM, Page, support, access, and notifications with no clear result.                                                | High     | High        | One orchestrated exception-first experience, tenant presets, explicit owner outcomes, self-healing projections, and cause-owned queues.                  |
| Observability gaps                | Yes      | A successful UI save may hide a failed invite, stale permission, wrong field set, or missed revocation.                                                                             | Critical | High        | Correlated operation evidence, owner-specific statuses, access-decision telemetry without PII, deadlines, probes, and one residual action.               |
| Dependency and integration risks  | Yes      | Supabase grant defaults, RLS/view behavior, JWT freshness, Realtime authorization cost, or CRM import semantics can change.                                                         | High     | High        | Version-pinned platform contract, explicit grants, security-invoker/unexposed views, certification tests, and adapter capability records.                |
| Migration and upgrade risks       | Yes      | Legacy `missionary_id`, household, Page, and fund data can be ambiguously mapped or kept as a second authority.                                                                     | Critical | High        | Complete mapping/disposition manifest, private review, quarantine, reconciliation, one cutover, and no fuzzy or dual read/write.                         |
| Other development hazards         | Yes      | Check-then-insert races, stale editors, IDOR, cache reuse, cascade deletes, or tests running only as privileged roles can bypass a sound-looking design.                            | Critical | High        | Transactional constraints, CAS, server-owned resource lookup, deny-first cache invalidation, non-owner test roles, fault injection, and named ownership. |

### Production proof gates

- Database catalog and pgTAP proof covers RLS enabled and forced, explicit Data
  API grants, composite same-scope foreign keys, interval exclusion,
  one-to-one binding cardinality, restricted deletion, idempotency, and hostile
  cross-Tenant/cross-Legal-Entity attempts under anonymous, authenticated,
  table-owner, service, and bypass-capable execution paths.
- Authorization tests cover associated-only, displayed-only, contributor-only,
  support-summary-only, selected supporter fields, different history floors,
  coach/leader scopes, multiple ministries, no binding, disabled Phase 21,
  stale JWT/session, revoked grant, wrong deep link, and exact non-enumerating
  denial. Every read, mutation, export, job, and notification uses the same PDP.
- Invariant and property tests prove that membership, relationship, Page
  subject, display, contributor, Designation, D6 progress, preference, and
  Support Binding never produce a grant, financial occurrence, balance change,
  supporter disclosure, or notification by themselves.
- Concurrency/fault tests cover duplicate add, overlapping intervals, concurrent
  rebinding, membership end during request, grant revoke during pagination,
  invite retry, outbox crash, stale worker, Party merge/split, assignment
  retirement, and residual recovery without partial or resurrected authority.
- Query-plan and load proof uses production-like participants, assignments,
  activity, supporter fields, and concurrent tenants. Required policy/filter
  columns are indexed; authorization and pagination remain bounded; Realtime
  cannot multiply raw row checks or leak payloads.
- UX proof with singles, couples, teams, coaches, and finance staff confirms that
  users can predict each consequence, add/revoke the intended access, switch
  among several ministries/currencies, and understand through-dates without
  permission jargon. Keyboard, screen reader, focus, 320-CSS-pixel reflow,
  200% zoom, target size, forced colors, and mobile recovery all pass.
- Migration/cutover proof reconciles every legacy person, Page, collaborator,
  portal access, Support Assignment/fund reference, and ambiguous row to one
  disposition. Negative proof shows that names, emails, marriage, household,
  shared URL, and prior portal visibility create no inferred membership,
  contributor assignment, Support Binding, or grant.

### Rejected alternatives

- person-, login-, spouse-, household-, team-, Page-, or fund-owned ministry
  identity;
- shared credentials, shared principal, broad **Share account**, or one global
  missionary role;
- automatic page display/editing or financial access from Ministry Assignment,
  marriage, household, Support Assignment, Designation, progress, or binding;
- a Phase 22 ACL, generic ReBAC graph, tenant-authored permission matrix, RLS
  policy recursion, or fine-grained permission arrays in JWTs;
- browser access to raw assignment, supporter, activity, balance, grant, or
  notification relations and raw `postgres_changes` subscriptions;
- mutable binding pointer, destructive merge/delete, grant propagation during
  rebinding, automatic balance transfer, copied ledger/balance, or combined
  cross-currency total; and
- fuzzy legacy mapping, service-key-as-authority, client-selected scope, dual
  source authority, or a UI save treated as proof of invitation, access,
  notification, financial availability, or payment.

**Architectural record:**
[ADR-0136](../../adr/0136-organization-owned-ministry-assignments-and-separated-support-access.md).

## D20 — Which semantic sections ship in each Public Ministry Page family?

**Status:** Ratified and adversarially hardened on 2026-08-13.

> **C-prime-amended-and-hardened (C-prime-R) — two small,
> non-interchangeable, immutable, code-owned Page Family Semantic Catalog
> Generations under D3: one for Missionary Ministry Pages and one for
> Project/Campaign Pages, each declaring stable semantic section and slot
> identities, exact source and edit authority, required or bounded-optional
> cardinality, certified placement zone, locale behavior, accessibility and
> performance limits, and deterministic empty, unavailable, invalid, and
> withdrawn outcomes. The Missionary catalog contains managed public identity;
> optional introduction, ministry story, ministry focus, and prayer focus; D9
> media; optional D6 support progress; one required D7-managed Give semantic
> role whose certified placements share the one Page Giving Binding;
> one bounded D11 Ministry Updates feed; and locked organization stewardship
> disclosure and help. The Project/Campaign catalog contains managed project
> identity; optional project summary, need, planned work, and editorial
> expected-impact statements; D9 media; optional D6 project progress; one
> required D7-managed Give semantic role whose certified placements share the
> one Page Giving Binding; one exactly bound D11 project update feed;
> and locked organization stewardship disclosure and help. D3's prospective
> Tenant × Legal Entity × Site × Page Family Presentation Profile Version alone
> chooses whether each optional editorial section is Off, Available, or Expected,
> its bounded order within certified zones, and whether it is contributor-editable
> or staff-only; Expected is private completeness guidance and never fabricates a
> public placeholder. A page may add or remove only offered optional sections,
> while a distinct shell remains a complete certified same-family D3 profile
> selection rather than an override. Contributors use a quiet five-group Basics,
> Story, Media, Support & giving, and Updates form with managed facts plainly
> read-only, exact responsive preview, recoverable autosave, semantic review
> feedback, and one D4-correct Submit for review or Publish changes action; staff
> use two compact family setup surfaces with safe defaults, consequence preview,
> and prospective activation. Every D2 release pins the exact catalog, renderer,
> profile, content, locale, brand, and managed-reference generations; unknown,
> incompatible, unauthorized, stale, or over-budget input blocks the new
> candidate and preserves the last certified release. D20 owns only catalog and
> editorial-slot semantics: D6 progress, D7 Giving, D9 media, D11 Updates, D14
> search/share, D16 assistance, D18 freshness/cache, D19 subject/participants,
> Phase 10 safety, and D1/D2/D4/D5 authority remain independently
> authoritative—without a generic cross-family builder, tenant schema or
> workflow DSL, arbitrary layout or nesting, raw HTML/CSS/JavaScript,
> iframe/embed, form, query, free CTA URL, testimonial, free-form statistic
> counter, exact-location map, page-derived managed truth, UI-only authorization,
> silent forbidden-field discard, destructive removal or rollback, implicit
> locale fallback, or any claim that editing, saving, previewing, approving,
> releasing, reaching the public, Giving readiness, source freshness, or cache
> propagation are the same fact.**

### D3 elaboration, not a new configuration system

The founder quote's `managed project identity`, `project update feed`, and
environment-less D3 tuple are historical family shorthand. D17 and D27 govern
current implementation: every activation head is Tenant × Legal Entity ×
environment × Site × Page Family, managed subject presentation is qualified by
the exact CRM Ministry Project, Giving Campaign, or eligible Designation kind,
and Update inclusion uses one explicit Page-scoped D3 Feed Binding. An
incompatible source-kind field or feed is unavailable, never inferred,
fabricated, or relabelled as project truth.

- D20 supplies the concrete launch contents of D3's already-ratified
  family-qualified block-catalog generations. It creates no second profile
  resolver, release head, workflow, permission system, public-source selector,
  or runtime authority.
- The two catalogs are closed discriminated semantic registries. They share
  governed layout, typography, rich-text, media, and accessibility primitives;
  they do not share a universal condition-heavy page schema.
- Every semantic role has one stable code identity and declares family, source
  class, source owner, edit owner, certified zone, cardinality, locale and safety
  behavior, content budget, accessibility requirements, and deterministic
  complete, empty, unavailable, invalid, and withdrawn outcomes.
- A successor role, changed required field, reduced limit, or incompatible
  meaning requires a new immutable catalog generation with a compatibility or
  migration adapter. Existing D2 releases keep the generation they pin.
- Labels and help text may be localized without changing stable semantic role
  identity. Bounded tenant heading choices cannot rename managed facts into a
  misleading concept.

### Missionary Ministry Page launch catalog

| Semantic section                                   | Authority and edit boundary                                                                                                               | Bounded flexibility and public outcome                                                                                                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public identity and hero**                       | Required managed projection from D19's Ministry Assignment subject, D1 Display Participants, Phase 10 public-safe identity, and D9 media. | Tenant selects only a compatible certified treatment. Contributors cannot type or copy identity facts. Missing or newly unsafe identity invokes D2/Phase 10 containment.                     |
| **Introduction**                                   | Release-frozen editorial content.                                                                                                         | Zero or one short introduction; Off, Available, or Expected; staff-only or D1-assigned contributor-editable. Empty content omits the section.                                                |
| **Our ministry story**                             | Release-frozen bounded safe rich text.                                                                                                    | Zero or one; headings, paragraphs, lists, and emphasis only from an allowlisted semantic AST. No raw markup, embed, or layout controls.                                                      |
| **Ministry focus**                                 | Release-frozen structured editorial content.                                                                                              | Zero or one bounded ordered list of short focus items. It is not a statistics or progress surface.                                                                                           |
| **How you can pray**                               | Release-frozen structured editorial content subject to Phase 10 and D4/D5.                                                                | Zero or one bounded prayer-focus list. Tenant may turn it Off; empty content collapses.                                                                                                      |
| **Approved photos and media**                      | D9-owned released media references; contributor may choose or propose only through D9-authorized paths.                                   | One bounded gallery in its certified zone, with purpose-aware alt/decorative treatment, captions or transcript state, focal preview, responsive derivatives, and exact unavailable handling. |
| **Support progress**                               | D6-owned managed projection.                                                                                                              | Optional placement only. Hidden means absent; contributor cannot enter a goal, amount, percentage, period, or formula.                                                                       |
| **Give**                                           | Required managed surface over the page's one D7 Page Giving Binding.                                                                      | One destination across every certified CTA placement. Contributors may edit only D7-permitted bounded copy or suggestions, never URL, Designation, issuer, currency, or readiness.           |
| **Ministry Updates**                               | Bounded D11 feed through D3's exact Ministry Update Feed Binding.                                                                         | Optional presentation. Authorized contributors use the separate update workflow; update content is never copied into the page revision.                                                      |
| **Organization stewardship, disclosure, and help** | Required tenant/site-managed content, contributor-locked.                                                                                 | One compatible certified disclosure/help treatment; never omitted or moved outside its required context.                                                                                     |

### Project/Campaign Page launch catalog

| Semantic section                                   | Authority and edit boundary                                                            | Bounded flexibility and public outcome                                                                                                   |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Subject identity and hero**                      | Required managed projection from D17's exact kind-qualified subject, Phase 10, and D9. | Tenant selects only a compatible treatment. Contributors cannot type, copy, or relabel operational identity.                             |
| **Project summary**                                | Release-frozen editorial content.                                                      | Zero or one short summary; Off, Available, or Expected; staff-only or contributor-editable. Empty content omits the section.             |
| **The need**                                       | Release-frozen bounded safe rich text.                                                 | Zero or one clear need statement with allowlisted structure and safe locale/link behavior.                                               |
| **What this project will do**                      | Release-frozen bounded rich text or structured short steps.                            | Zero or one plan section. It cannot impersonate current source-owned lifecycle or completion truth.                                      |
| **Expected impact**                                | Release-frozen bounded editorial claim list reviewed under D4/D5.                      | Zero or one bounded list. Wording remains prospective; it is not an achieved result, metric, counter, ledger fact, or D6 progress input. |
| **Approved photos and media**                      | D9-owned released media references.                                                    | Same bounded, responsive, metadata-safe, accessible media contract as the Missionary family.                                             |
| **Project progress**                               | D6-owned managed projection.                                                           | Optional placement only; no contributor-entered totals, formulas, dates, or manual progress.                                             |
| **Give**                                           | Required managed surface over the page's one D7 Page Giving Binding.                   | One exact Designation and one consistent destination across certified placements.                                                        |
| **Updates**                                        | D11 feed selected by D3's Page-scoped Feed Binding and exact subject/purpose scope.    | Optional bounded feed. Subject, contributor, teammate, or fund proximity never infers inclusion; incompatible feeds are unavailable.     |
| **Organization stewardship, disclosure, and help** | Required tenant/site-managed content, contributor-locked.                              | One compatible certified treatment in its locked context.                                                                                |

### Flexibility and quiet authoring experience

- Each optional editorial section has two progressive controls in the staff
  profile setup: **Use on this page family** (`Off`, `Available`, `Expected`) and,
  only when applicable, **Who can edit** (`Staff only`, `Assigned page
contributors`). `Expected` affects draft prompts and completeness review only;
  it never releases empty filler or blocks mandatory adverse safety action.
- Profile setup starts from one accessible built-in default, displays only the
  chosen Page Family, and uses plain section names. Staff can use bounded
  Move-up/Move-down controls inside certified zones, choose a small certified
  visual treatment, preview representative complete/empty/unavailable/restricted
  states, review affected future candidates, and activate prospectively.
- Missionaries see page cards in their dashboard with Page Family, page name,
  and an exact **Live**, **Draft**, or **In review** state. **Edit public page**
  opens only editable content grouped as **Basics**, **Story**, **Media**,
  **Support & giving**, and **Updates**—never block, schema, zone, source-ID, or
  Payload terminology.
- Managed facts appear as compact read-only cards labelled **Provided by your
  organization**, with the current public-safe value, through/freshness state,
  and an authorized path to the owning staff workflow. Disabled inputs are not
  used to imply authority.
- Desktop may pair the form with exact responsive preview; mobile uses one
  readable column and a dedicated preview action. All required actions work by
  keyboard and pointer without drag; errors have an inline message and summary,
  focus moves predictably, save state is announced, and zoom/reflow/RTL/long
  locale behavior is proved.
- Autosave is private, coalesced, and recoverable. The interface continuously
  distinguishes **Saved draft**, **Submitted for review**, and **Live**, reports
  offline/conflict outcomes plainly, and never implies that an editor save made
  public content change.
- Empty optional editorial sections collapse without headings or spacing. An
  unavailable managed source uses its owner-declared behavior and cannot be
  converted into editorial emptiness.

### Current implementation disposition

The current repository is implementation evidence, not the D20 target:

- Missionary and Project collections both use the same freely sortable seven-
  block `layout` field. Its generic `hero`, `rich-text`, `media-feature`, CTA,
  FAQ, impact-stat, and testimonial blocks do not encode either Page Family's
  source/edit boundaries.
- Hero and CTA blocks accept author-controlled URL fields; identity uses soft
  `missionaryId` or `fundId` strings; `readOnly` is a Payload Admin hint; mutable
  templates copy layout blobs; and no D2 release manifest pins profile, catalog,
  renderer, or managed sources.
- Preview and public rendering are separate implementations, public serializers
  duplicate block handling, and unknown blocks may be reduced or omitted rather
  than rejecting a release. The current Missionary `/workers` page remains
  mock-backed and there is no corresponding project route.
- Existing Payload block/version tables, fixtures, templates, pages, and tests
  receive one explicit `adopt`, `transform`, `quarantine`, `compatible legacy
renderer`, or `retire` disposition. Generic headings, IDs, CTA URLs, FAQ,
  testimonial, or impact-stat content never infer a new semantic role or managed
  authority.
- Launch migration is additive: one shadow compiler validates exact family and
  semantic mappings, reconciles preview/public output and coverage, and creates
  deliberate new D2 candidates. Unresolved pages retain their compatible legacy
  renderer or remain non-public; there is no in-place schema rename, dual
  authority, or silent data loss.

### D20 ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                                                                                            | Severity    | Likelihood                           | Permanent prevention                                                                                                                                                                                                            |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Schemas, validators, editor forms, serializers, preview, public rendering, and migrations can encode different meanings; deployment skew or a renamed slot can break a public identity/Giving page.                                                             | High        | Medium-high                          | One immutable family registry with stable role IDs and digest; exhaustive adapters; D2 release pins; reject unknown generations while keeping the last certified release.                                                       |
| Technical debt                    | Yes      | Two hand-written copies drift, while one universal schema becomes a condition-heavy mega-builder; the current shared seven-block builder already demonstrates the second failure.                                                                               | High        | High                                 | Two explicit discriminated family registries sharing only governed primitives; one canonical compiler/DTO/renderer; no plugin or schema DSL.                                                                                    |
| Edge cases                        | Yes      | Empty content, concurrent spouses, revocation mid-session, changed profiles, restricted identity, withdrawn media, hidden progress, paused Giving, empty feeds, locale expansion, unsupported AST nodes, or stale comments can lose work or expose stale truth. | High        | High collectively                    | Complete family × role × source × locale × lifecycle state matrix, CAS revisions, normalized ASTs, source reproof, and production-shaped scenario tests.                                                                        |
| Footguns                          | Yes      | `readOnly` or hidden UI can be mistaken for authorization; forbidden field updates can appear saved; generic block clipboard/paste and free CTA URLs can cross contexts.                                                                                        | Critical    | Medium-high                          | Dedicated command allowlists that reject forbidden/unknown/stale fields, server-derived scope, no contributor block clipboard/layout editor, and defense-in-depth UI locks only.                                                |
| Tenant safety                     | Yes      | A profile, asset, source binding, pasted block, preview, or cache can cross Tenant, Legal Entity, Site, Page, or Page Family.                                                                                                                                   | Critical    | Medium                               | Complete scope on bindings/pins, composite constraints, deny-by-default access, actor-carrying Local API calls with enforced access, and hostile cross-scope tests for every egress.                                            |
| Over-engineering                  | Yes      | “Flexible” can grow into arbitrary zones, nested layouts, tenant schemas, workflow matrices, plugins, and a combinatorial certification surface.                                                                                                                | High        | High without a hard boundary         | Exactly two finite catalogs, one quiet default each, two small progressive controls for editorial roles, certified zones, bounded cardinalities, and code-reviewed successor generations only.                                  |
| UX/UI and user friction           | Yes      | Raw CMS blocks, layout jargon, drag-only ordering, noisy managed fields, ambiguous save/live state, and long mobile forms distract contributors and confuse staff/donors.                                                                                       | High        | High                                 | Task-language five-group contributor form, calm managed cards, accessible responsive preview, recoverable autosave, exact D4 action, compact family setup, predictable public layout, and usability/a11y proof.                 |
| Hidden coupling                   | Yes      | A presentation control can accidentally redefine D6 progress, D7 Giving, D9 media, D11 feeds, D14 SEO/share, D16 AI, D18 freshness/cache, or D19 identity.                                                                                                      | High        | High                                 | D20 owns only catalog membership/editorial schema/placement; managed roles reference normalized owner projections and keep independently pinned authority.                                                                      |
| Failure modes                     | Yes      | Invalid ASTs, source outage, profile activation during review, cache failure, unknown legacy block, or catalog/renderer skew can produce a partial page or false success.                                                                                       | High        | Medium                               | Candidate compilation fails closed and preserves the last certified release; per-role deterministic outcomes; required safety failure uses D2 containment; append-only corrected candidate/release recovery.                    |
| Data integrity risks              | Yes      | Duplicate roles, stale overwrites, mutable reinterpretation, copied managed data, conflicting order, unsafe locale fallback, or removing a section can corrupt meaning/history.                                                                                 | High        | Medium-high                          | Stable IDs, zero-or-one semantic cardinality, bounded internal arrays, CAS, hashes, immutable releases, deterministic zones/locales, append-only history, and private preservation of removed draft content.                    |
| Security and privacy risks        | Yes      | Rich text, URLs, media metadata, previews, prayer text, exact locations, or stories can expose XSS, tracking, private identities, or restricted-worker details.                                                                                                 | Critical    | High without controls                | Bounded semantic AST, server validation and contextual rendering, no arbitrary URLs/embeds/code, D9-only media, Phase 10 reproof at candidate and serve, D10 preview, CSP defense-in-depth, and no sensitive logs.              |
| Scalability and performance risks | Yes      | Large ASTs, galleries, locales, feeds, and request-time managed joins can cause slow editors/pages, N+1 calls, heavy HTML, and broad cache churn.                                                                                                               | High        | Medium                               | Code-owned budgets, bounded lists/feed pagination, D9 responsive media, precompiled editorial release DTO, batched managed resolution, D18 exact cache identities, and no editor JavaScript publicly.                           |
| Operational burden                | Yes      | Page-by-page design settings, repeated certification, manual invalid-layout repair, and too many variants create permanent staff/developer work.                                                                                                                | Medium-high | High if page-level flexibility grows | One default per family, profile-level prospective setup, rare complete profile exceptions, quiet collapse, impact preview, cause-owned exceptions, and deterministic migration/diagnostics.                                     |
| Observability gaps                | Yes      | Failed autosave, rejected release, collapsed source, preview/live drift, or stale generation may go unnoticed while users believe work is live.                                                                                                                 | High        | High without instrumentation         | PII-safe structured events keyed by scope/release/catalog and cause; visible save/review/live status; compiler diagnostics; source/convergence metrics; synthetic family/locale/safety checks.                                  |
| Dependency and integration risks  | Yes      | Exact internal Payload/Lexical and preview Next versions or independently changing D6/D7/D9/D11 contracts can break editing, migration, or rendering.                                                                                                           | High        | Medium                               | Asym adapter boundary, exact version pin/certification, documented API use only, owner-domain consumer contracts, shadow upgrade compilation, and prior renderer retention.                                                     |
| Migration and upgrade risks       | Yes      | Existing generic block/version tables and tests cannot be reinterpreted safely; URL/stat/testimonial data can acquire false meaning or be destroyed.                                                                                                            | High        | High                                 | Complete per-block disposition manifest, explicit semantic mapping, no managed-truth inference, additive catalog generations, shadow output reconciliation, and compatible legacy renderer until deliberate release/retirement. |
| Other development hazards         | Yes      | Read-before-write races, stale editors, deployment ordering, implicit “latest,” weak rollback, privileged-only tests, or unclear ownership can bypass a sound contract.                                                                                         | High        | Medium-high                          | Structural uniqueness, CAS/idempotency, readers-before-writers additive rollout, explicit generation pins, property/concurrency/fault tests under real roles, immutable rollback target, owner and generation kill switch.      |

### Required production proof

- Catalog property tests prove every stable semantic role has one family, source
  and edit owner, schema, zone, cardinality, locale/safety/budget contract,
  renderer, migration behavior, and all deterministic output states. Unknown,
  duplicate, wrong-family, over-cardinality, stale, and unsupported inputs fail.
- Authorization tests prove a D1-assigned contributor can mutate only current
  allowed editorial slots on the exact Page and that managed, staff-only,
  disabled, wrong-page, wrong-family, wrong-site, cross-tenant, cross-entity,
  stale, forged, imported, or clipboard-carried fields are rejected atomically.
- Concurrency and recovery tests cover two contributors, stale autosave,
  revocation mid-session, profile activation during review, reviewer comments on
  removed sections, offline reconnection, worker crash, retry, and no silent
  overwrite or resurrected authority.
- Managed-source tests cover D6 Hidden/unavailable/corrected, D7
  paused/replaced, D9 withdrawn or newly unsafe, D11 empty/withdrawn/rebound,
  D19/D17 succession, and Phase 10 tightening at draft, review, release, cached
  serve, and preview.
- Security tests fuzz unsafe Lexical nodes, oversized/deep ASTs, unsafe protocols,
  scripts/event attributes, embeds, forged references, metadata/filename
  exposure, preview enumeration, and cross-scope caches. Public rendering uses
  D9 release assets and Phase 10-safe projections only.
- Preview, candidate compiler, immutable release artifact, and public serving use
  one renderer generation and pass golden digest parity for both families,
  every certified profile, empty/unavailable/withdrawn states, and supported
  locale/safety classes.
- Accessibility and usability proof covers keyboard and non-drag ordering,
  screen-reader labels/status/errors, focus recovery, 320-CSS-pixel reflow, 200%
  and 400% zoom, target size, contrast/forced colors, reduced motion, RTL/CJK/
  long strings, meaningful alt/decorative decisions, caption/transcript gates,
  semantic public headings, and phone completion by first-time contributors.
- Performance proof uses maximum certified text, lists, media, locales, feeds,
  concurrent authors, public traffic, and tenants to enforce explicit HTML, JS,
  media, query, latency, preview, and cache-fan-out budgets.
- Migration reconciliation assigns every generic page, template, block, source
  reference, media record, preview, fixture, test, and current route one exact
  disposition. Shadow compilation proves no silent loss, false source authority,
  cross-family adoption, stale URL, or live-page mutation before deliberate D2
  release.

### Ruthless synthesis and implementation order

1. Preserve D20 only as the concrete two-family D3 catalog content and boundary;
   do not reopen or duplicate D1–D19 authorities.
2. Freeze the exact launch roles and exclusions above before altering Payload
   schemas, generated tables, editor forms, or public routes.
3. Define the canonical immutable code contracts, stable semantic identities,
   successor-generation compatibility, strict command allowlists, and one
   compiler/DTO/renderer seam.
4. Build the role-specific staff and contributor experiences over that command
   seam; never expose generic block/layout or Payload publication authority.
5. Integrate every managed role by exact reference and owner projection, then
   prove current source, safety, release, locale, and cache behavior independently.
6. Classify and shadow-compile every legacy page/block. Quarantine ambiguity,
   retain a compatible legacy renderer, and create new releases only after exact
   reconciliation.
7. Ship through an additive readers-before-writers rollout only after all
   catalog, authorization, isolation, security, accessibility, locale,
   concurrency, migration, observability, failure, and performance gates pass.

Detailed repo and external research is recorded in the
[Phase 22 research evidence](./phase-22-public-ministry-pages-research-evidence.md#43-ratified-d20-research--two-small-code-owned-page-family-semantic-catalogs-under-d3).

**Architectural record:**
[ADR-0137](../../adr/0137-two-bounded-page-family-semantic-catalogs.md).

## D21 — How does a tenant replace the legacy public-ministry surface without exposing mixed authority?

**Status:** Ratified, amended, and adversarially hardened on 2026-08-14.

### Decision

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
> D11 Updates; D13 discovery; D14 search/share; D17/D19 subjects and
> participants; locale, code, schema, environment, revocation, current heads,
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

### Authority and adoption interpretation

- The adoption cohort is one exact Tenant × Legal Entity × environment × Site ×
  verified-host set × locale. Page Family is not a smaller authority boundary
  when both families share routes, discovery, search, sitemap, media, or Giving
  behavior on that surface. This tuple is the minimum discriminator, not
  permission to split an indivisible artifact: the case must close over every
  affected shared route map, directory/search projection, sitemap, canonical or
  alternate-locale graph, and cache generation. A shared artifact may cross the
  case boundary only when its owner proves an atomically selectable,
  generation-pinned partition for that exact cohort; otherwise the dependent
  cases cannot become Ready independently and must cut over together. The exact
  verified-host set is immutable and digest-pinned.
- Incremental adoption means private preparation, never incremental public
  authority. An unresolved source item may receive an exact D2 Not-public, D8
  transition/terminal, quarantine, private-reference, or retirement outcome, so
  it need not trap every other safe Page; it still must appear exactly once in
  complete coverage. These owner outcomes are not one interchangeable D21
  status.
- The Adoption Coverage Manifest is evidence over owner facts. It references and
  never recreates D1–D20 authority. Payload `_status`, a Vercel deployment,
  provider acceptance, a successful purge, or one passing preview is not the
  cutover or proof of public convergence. Its tenant-scoped layer covers exact
  records, routes, artifacts, and dispositions; code-global readers,
  serializers, import paths, fixtures, and tests are covered by a
  content-addressed reference to the exact code/schema certification generation,
  not copied into each tenant manifest or admitted as tenant facts. A grouped
  historical range is allowed only with proved membership, count, digest, and
  one common inert disposition. Adoption Plan Versions and Adoption Coverage
  Manifests are immutable successors: each preparation or cutover attempt selects
  exactly one Plan Version and one Manifest by stable ID and digest, and every
  correction creates a successor rather than mutating either record or floating
  to `latest`.
- D10 remains the authenticated, currently authorized, exact-Page-and-version
  human preview. D21 separately owns a production-shaped, non-authoritative,
  side-effect-dark full-surface shadow for route, directory, search, sitemap,
  social, and cache proof. That shadow is not a D10 preview, D2 release, D18
  observation, or public endpoint.
- A **Compatible Legacy Page Release** is an immutable D2 Page Release Manifest,
  not the old reader. One certified compatibility adapter normalizes proved-safe
  legacy editorial input into a release-frozen, family-qualified public DTO. The
  release pins the exact D20 catalog, D3 profile, compatibility renderer,
  content, locale, brand, managed-reference generations, and every other D2
  owner fact and is served only through the Phase 5/D18 gateway. No request-time
  raw Payload or mutable legacy read occurs. Unknown, unmappable, wrong-family,
  or unsafe input cannot qualify. No new Compatible Legacy Page Release may be
  created after that cohort's cutover; the next editorial change creates an
  ordinary current-catalog successor.
- The short final transaction compares the already-computed census/content roots,
  source and authorization epochs, heads, and generation pins; it does not
  rescan, compile, or rewrite every Page. The authority-head change, receipt, and
  D18 outbox cause commit together. Provider and cache calls never execute while
  the database cutover locks are held. Distributed controlled surfaces converge
  afterward under D18. Google/Bing indexing and social-network refresh remain
  D14/D18 external observations; cutover, submission, fetch, provider acceptance,
  or elapsed time proves none of them.
- The Surface Authority Cutover advances one cohort reader-generation boundary;
  it is not another D2 Page release head, a tenant-global Boolean, or a mutable
  per-Page flag. **Public Ministry Surface Adoption Authority** is a separate,
  exact-scope Phase 12 capability to execute that CAS; D4/D5 review, D7 finance,
  D8 lifecycle, Phase 10 safety, D9 media, support-data, or service-role access
  does not imply it, and it implies none of those owner permissions in return.
  Before cutover succeeds, Phase 10, D2 containment, D8 lifecycle, and D9 media
  withdrawal continue to narrow or remove unsafe legacy behavior immediately;
  **old coherent surface** means all remaining pre-cutover traffic is still
  behind the sole Phase 5/Phase 10/D8 safety choke point and resolves through one
  internally consistent authority set, or safely unavailable. It is never an
  assumption that legacy data or readers are coherent merely because production
  currently uses them.
- After cutover, every Page—whether newly typed or frozen compatible legacy—uses
  ordinary D1–D20 release, correction, containment, and succession behavior.
  There is no recurring adoption mode or second launch switch.

### UX truth planes

D21 introduces no missionary Page status. Four separate planes use these exact
visible terms:

| Plane                   | Canonical terms                                                                                                            | Boundary                                                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D5 editorial workflow   | **Draft**, **Waiting for review**, **Changes requested**, **Published**                                                    | Ordinary authoring/review labels only; detailed D4 facts map beneath them. Published does not prove public serving.                                                                                           |
| D18 serving/convergence | **Public**, **Updating**, **Not public**                                                                                   | The only contributor-facing public-serving states for a Page or Ministry Update.                                                                                                                              |
| D21 staff readiness     | **Ready to use**, **Needs a decision**, **Not moving as a current ministry page**                                          | Disposable setup projection only; never D2 reach, D7 Giving readiness, approval, or mutable truth. The last group shows its exact redirect, transition, terminal, private-preservation, or retirement result. |
| D21 cutover receipt     | **Could not start — current site still in use**, **Started — public copies updating**, **Started — prepared pages in use** | Exact command/convergence consequence, never a Page state or the word Live.                                                                                                                                   |

The phrases **Preparing for launch**, **Ready for launch**, and **Live** in the
ratified quote therefore do not create product states. A missionary may instead
see one passive notice that the organization is preparing updated public Pages
and one exact notice that a newer saved draft is not in the pinned prepared
release; those notices never replace D5 or D18 truth.

### Quiet role-specific experience

Staff enter through one conditional **Finish setting up public pages** card for
the named website and language. The automatic read-only scan runs first. The
workspace uses three tasks: resolve genuine exceptions, review the complete
site, and start the prepared Pages. Healthy rows are collapsed; the default view
is **Needs a decision**; the third group is **Not moving as a current ministry
page**, not the overbroad ratified description **Will not be public**. Each
exception states the visitor consequence and one owner-correct action such as
**Connect the ministry**, **Choose the Giving destination**, **Replace this
photo**, or **Choose what this old address should do**. The action is enabled
only when the actor also holds the owning capability. Otherwise the row says,
for example, **Finance needs to choose the Giving destination**, and links to the
owner-correct task without granting authority through D21. High-risk identity,
Designation, reach, restricted-worker, route, and lifecycle decisions have no
bulk approval.

Current/prepared comparisons use exact D10 previews for the candidate Pages and
remain private, actor-authorized, and public-egress-safe. They never reveal raw
blocked identity, original media, source filenames, EXIF, private Updates,
support access, hidden operational identifiers, or any value Phase 10/D9 would
omit merely because it appeared on the old surface. Counts and summaries are
permission-filtered so an unauthorized staff member cannot infer that a
restricted Page exists.

The final consequence review names every Page becoming public or remaining
non-public, every old-address result, each exact Giving destination, hidden or
shown progress, directory/search/share treatment, media replacement, and any
newer draft not included. The one final action is **Start using these prepared
pages** for the visibly named scope. If current reproof fails, nothing switches
and the interface links to the exact changed item. The durable result
distinguishes **Could not start — current site still in use**, **Started — public
copies updating**, and **Started — prepared pages in use**; it never fabricates
a percentage or turns that receipt into a Page state.

Missionaries never enter the adoption workspace. Their existing dashboard keeps
ordinary D5 draft/review labels and D18 **Public**, **Updating**, or **Not public**
serving truth plus only actions they can actually take. Donors receive no
migration UI, technical status, or mixed content/Giving authority. Support uses
a separately authorized technical view with scope, generations, digests, proof
cause, convergence coverage, and trace/reference ID; it has no Force live,
safety override, direct repair, or Restore legacy reader command.

### Role consequences

| Actor                                | D21 consequence                                                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Adoption-authorized staff            | May review the complete redacted consequences and execute the exact-scope cutover; gains no owner-domain mutation.                                                  |
| D4/D5 reviewer                       | May decide only the exact candidate already within their review capability; review does not grant cutover authority.                                                |
| Finance/Designation owner            | Resolves D7 Giving through the D7 command; gains no editorial, route, subject, reach, or cutover authority.                                                         |
| Phase 10 or other safety owner       | May narrow current behavior immediately and never waits for preparation or cutover.                                                                                 |
| D1 contributor                       | Continues ordinary assigned-Page editing, submission, and exact preview; cannot choose subject, Designation, route, reach, safety, cohort, or cutover.              |
| Spouse, teammate, or D19 participant | Receives only separately assigned D1/D19 rights under their own principal; relationship alone grants nothing.                                                       |
| Donor or visitor                     | Receives one coherent admitted surface and a final-boundary-reproved Giving action, never a migration interface or substituted Designation.                         |
| Support/operator                     | May inspect permissioned evidence and run fenced residual operations; cannot force live, override safety, repair owner data directly, or restore the legacy reader. |

### D21 ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                                                              | Severity | Likelihood  | Permanent prevention                                                                                                                                 |
| --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Per-page switches can divide one website among mocks, Payload rows, new releases, incompatible routes, and stale caches; source or permission changes can stale an earlier green result.                                          | Critical | High        | Exact cohort, immutable inputs, resumable staging, complete manifest, final recensus, and CAS reproof.                                               |
| Technical debt                    | Yes      | A temporary v2 flag, duplicate serializer, or legacy fallback becomes permanent and doubles every later Phase 22 change.                                                                                                          | Critical | High        | One compiler, DTO, gateway, and authority path; compatible legacy exists only as a frozen D2 release, never a second runtime.                        |
| Edge cases                        | Yes      | Duplicate/case-folded slugs, multiple locales, restricted name-derived paths, withdrawn media, missing Designations, redirect loops, shared templates, concurrent edits, and open carts can produce unsafe or incorrect behavior. | Critical | High        | Structural route uniqueness, exact dispositions, immutable revisions, final owner reproof, and production-shaped fixtures.                           |
| Footguns                          | Yes      | Publish All, Force live, free CTA URLs, inferred mappings, broad redirects, generic Payload writes, or legacy restoration can expose workers or misdirect gifts.                                                                  | Critical | Medium-high | Prohibit unsafe bulk/override paths and require server-derived exact subject, Giving, media, route, and release commands.                            |
| Tenant safety                     | Yes      | Tenant, Legal Entity, Site, host, locale, CMS identity, object path, or cache-key drift can expose another organization’s content.                                                                                                | Critical | Medium-high | Scope-complete composite constraints, explicit grants plus indexed RLS, server-owned commands, and hostile cross-scope tests.                        |
| Over-engineering                  | Yes      | A migration DSL, custom workflow engine, arbitrary state matrix, environment clone, or multiple fallback readers turns a bounded cutover into a permanent product.                                                                | High     | High        | One code-owned Adoption Case, finite dispositions, three-task UX, one cutover, and narrow owner adapters.                                            |
| UX/UI and user friction           | Yes      | Staff can face a technical page-by-page marathon, missionaries can edit in two places, and CMS Published can be mistaken for publicly reachable.                                                                                  | High     | High        | Automatic exact preparation, exceptions first, plain consequences, one review/action, and one missionary Public Pages workspace.                     |
| Hidden coupling                   | Yes      | Adoption can accidentally redefine safety, Giving, routes, media, Updates, discovery, search/share, measurement, or caching.                                                                                                      | Critical | High        | Reference immutable D1–D20 facts and effect manifests; D21 owns only coverage and cutover evidence.                                                  |
| Failure modes                     | Yes      | Worker crashes, lost outbox events, stale CDN bytes, partial jobs, unavailable authority storage, or unsafe rollback can leave mixed or stale behavior.                                                                           | Critical | High        | Prebuild artifacts, transactional CAS/outbox, idempotent residual recovery, D18 request admission, and neutral fail-closed outcomes.                 |
| Data integrity risks              | Yes      | Check-then-create races, non-unique routes/subjects, fuzzy matches, omitted sources, duplicate dispositions, or in-place overwrites can create competing current truth.                                                           | Critical | High        | Composite uniqueness, count/digest reconciliation, exact IDs, append-only versions/corrections, and single-winner CAS.                               |
| Security and privacy risks        | Yes      | Restricted identities can leak through filenames, EXIF, old slugs, media derivatives, previews, logs, social cards, sitemaps, or shared caches.                                                                                   | Critical | High        | Phase 10 reproof during preparation, cutover, and serving; D9-only media; D10 authorization; complete egress census; redacted evidence.              |
| Scalability and performance risks | Yes      | One whole-site rewrite transaction, synchronous rendering, static redirect lists, or a large tenant can time out or starve others.                                                                                                | High     | Medium-high | Cursor-based chunks, resumability, tenant-fair queues, production indexes, precompiled artifacts, tiny final transaction, and scalable route lookup. |
| Operational burden                | Yes      | Rechecking every healthy Page and manually repairing caches or redirects creates tribal knowledge and developer dependency.                                                                                                       | High     | High        | Deterministic automatic preparation, cause-owned exceptions, saved progress, generated evidence, and supported residual operations.                  |
| Observability gaps                | Yes      | CMS Published, job complete, purge accepted, response observed, search indexed, and Giving executable can collapse into one false success.                                                                                        | Critical | High        | Separate immutable facts/timestamps, generation probes, coverage dashboards, deadlines, and honest external-observation states.                      |
| Dependency and integration risks  | Yes      | Payload, Next/Vercel caches, deployment skew, CDN behavior, provider limits, or crawler timing can invalidate proof.                                                                                                              | High     | Medium-high | Version/capability-pinned adapters, production certification, local semantic authority, and fail-safe unknown capabilities.                          |
| Migration and upgrade risks       | Yes      | Generic blocks, stats, testimonials, `fundId`, URLs, or copied profiles can acquire fabricated D20 meaning, while a down migration can revive unsafe content.                                                                     | Critical | High        | Additive versioned schemas, exact per-object dispositions, shadow compilation, source export, and no destructive down rollback.                      |
| Other development hazards         | Yes      | Stale tabs, double-clicks, concurrent staff, revoked permissions, duplicate events, deployment order, deadlocks, or fixtures becoming mappings can bypass the contract.                                                           | Critical | High        | Current authorization, idempotency, CAS/fencing, deterministic lock order, generation compatibility, and concurrency/fault tests.                    |

### Required production proof

- Census reconciliation proves zero missing items, overlapping dispositions,
  unexplained count differences, or digest differences and zero mock or fixture
  fact admitted as tenant truth.
- Structural tests reject duplicate Page, subject, normalized route, locale,
  current head, or scope bindings; wrong-Tenant/Entity/Site/host/locale/role and
  privileged-worker requests reveal no record existence.
- Shadow and public compilation have exact semantic parity. Unknown blocks,
  unsafe media, fuzzy identities, free CTAs, ineligible Designations, and missing
  source facts fail closed rather than disappearing or defaulting.
- D10 tests prove each human comparison is exact-version, currently authorized,
  redacted to public-egress-safe fields, and unable to enumerate a restricted
  Page; separate D21 tests prove the side-effect-dark full-surface shadow cannot
  serve publicly, create D15 measurement, or become a D2/D18 fact.
- Compatibility tests prove the sole gateway reads only the immutable D2
  manifest and normalized family-qualified DTO, pins every D20/D3 generation,
  never reads raw Payload at request time, rejects unknown input, and permits
  only an ordinary typed successor after cutover.
- Scope-closure tests reject an independently Ready case when a shared route,
  directory/search, sitemap, canonical/alternate-locale, or cache artifact lacks
  an atomically selectable cohort partition. Code-global certification evidence
  is digest-referenced and never appears as tenant data.
- Authorization matrices prove adoption authority, D4/D5 review, D7 finance,
  D8 lifecycle, Phase 10 safety, D9 media, D1 contribution, D19 participation,
  support access, and operator evidence access neither imply nor grant one
  another.
- Race/fault tests cover a Phase 10 change, Designation retirement, source edit,
  revoked actor, stale tab, two simultaneous cutovers, repeated/conflicting
  idempotency keys, crash before/after CAS, lost/delayed/out-of-order effects,
  old deployments, prefetched RSC, cached media, and safe residual recovery.
- Every old URL resolves to its exact retained Page, one-hop successor,
  transition, or terminal HTTP result with no loop, chain, soft 404, blanket
  redirect, identity disclosure, or destination substitution.
- Giving tests prove an existing tab, copied CTA, or cart crossing cutover cannot
  silently change its Designation and that Page reach remains independent from
  Phase 5/13 executable eligibility.
- Load proof covers at least a production-shaped 5,000-Page minimum test fixture
  with
  cursor-based preparation, tenant fairness, bounded previews, stable counts,
  resumability, targeted convergence, and a short final transaction. This is not
  a product limit, supported-tenant maximum, service guarantee, or substitute
  for measured capacity testing.
- Accessibility and usability proof covers keyboard completion, screen-reader
  status, focus, error summary plus inline errors, non-color meaning, semantic
  diff and non-iframe preview, 320-CSS-pixel reflow, 200% text, 400% zoom,
  forced colors, reduced motion, touch, RTL/long locales, and accurate outcome
  prediction by staff, missionaries, spouses/teams, and restricted-worker
  administrators. Copy tests keep D5 workflow, D18 serving, D21 readiness, and
  cutover-receipt vocabularies separate and prohibit Live as a D21 Page state.

### Ruthless synthesis and implementation order

1. Freeze the exact cohort, finite dispositions, D21 ownership boundary, UX
   vocabulary, and prohibition on fallback or mixed public authority.
2. Add scope-complete structural constraints, grants/RLS, immutable manifests,
   CAS/fencing, idempotency, and transactional-outbox seams before the UI.
3. Put every public egress behind the Phase 5/D18 gateway before activating any
   Phase 22 Page.
4. Build the complete census and private, deterministic, resumable shadow
   compiler with no public effects or fuzzy adoption.
5. Build the exception-first staff experience and ordinary missionary states
   over those proved commands, without duplicating D4/D5 review.
6. Certify routes, HTML/RSC/API, metadata, media, sitemap/robots, directory,
   social presentation, CTA, progress, Updates, cache, isolation, accessibility,
   concurrency, fault, load, and safe-recovery behavior.
7. Perform one complete-surface switch, monitor D18 controlled-surface
   convergence separately from external search/social observations, and disable
   the old reader for that cohort immediately.
8. Remove obsolete mocks, serializers, profile-publication controls, route and
   cache namespaces, and tests only after exact zero-reference, retention,
   export, and retirement evidence.

Detailed repository and current primary-source evidence is recorded in the
[Phase 22 research evidence](./phase-22-public-ministry-pages-research-evidence.md#44-ratified-d21-research--complete-public-ministry-surface-authority-cutover).

**Architectural record:**
[ADR-0138](../../adr/0138-complete-public-ministry-surface-authority-cutover.md).

## D22 — How does staff manage ongoing Public Pages work without a noisy second workflow?

**Status:** Ratified and adversarially hardened on 2026-08-14. This ruling is
planning truth only and authorizes no
implementation, migration, notification, issue publication, or production
activation.

### Ratified decision

> **C-prime-amended-and-hardened (C-prime-R) — one quiet, disposable,
> permission-filtered Public Page Operations Projection presented to authorized
> Mission Control staff as one `Public pages` workspace for each exact Tenant ×
> Legal Entity × environment × Site × locale scope, derived only from D1–D21's
> independently authoritative review candidates and finite, versioned,
> privacy-safe owner-condition descriptors rather than raw owner tables,
> duplicated status logic, or inferred health. It has exactly three stable,
> URL-addressable views: `To review`, which references without copying D4/D5's
> exact candidates and actions; `Needs attention`, which contains only current,
> unresolved, owner-labelled causes for which the current actor can perform one
> concrete authorized action; and `All pages`, which provides one
> coverage-labelled, server-filtered inventory of every Page the current actor
> may know exists. These are navigation views, never Page states. D5's `Draft`,
> `Waiting for review`, `Changes requested`, and `Published`; D18's `Public`,
> `Updating`, and `Not public`; D7's `Ready`, `Giving unavailable`, and `Staff
action needed`; and every other owner outcome remain separate
> plain-language facets, with no overall Healthy, Failed, Live, broken,
> completion-percentage, or red-amber-green Page score.**
>
> **Every projected operational condition is rooted in one stable owner-domain
> cause and monotonic source version, exact scope and affected Page or Ministry
> Update membership, privacy-safe visitor consequence, current human-
> actionability, required Phase 12 capability, responsible owner, finite
> code-owned action kind, and source coverage/through-time. One cause may affect
> many Pages without becoming many tasks or notifications, while multiple causes
> on one Page remain independently visible and independently owned. Identical
> same-scope effects are coalesced around the one root-cause action, and affected
> Pages remain inspectable only after current authorization. The projection is
> non-authoritative, application-read-only, disposable, and rebuildable from
> source truth; it has no mutable close state. A condition leaves current work
> only when its owner proves resolution or supersession. Missing, delayed,
> contradictory, stale, partial, or unavailable coverage never becomes zero,
> healthy, resolved, or a guessed task, and notification read state, dismissal,
> elapsed time, provider acceptance, an empty query result, or projection
> absence closes nothing.**
>
> **Each actionable item first states what visitors can see now and whether
> Giving is currently available, then what changed or could not be applied,
> whether Asym is already handling it, who owns the next step, and one literal
> action such as `Review changes`, `Replace photo`, `Review designation`, or
> `Choose what supporters see`. Technical provenance and exact freshness remain
> progressively disclosed to authorized staff. A code-owned action resolves to
> the owning workflow with an opaque reference and safe return path; that owner
> re-proves the actor, capability, scope, source head/version, and current facts
> before accepting any command. A viewer without that capability receives only
> permission-safe owner-directed explanation in `All pages`, not a disabled
> button or a `Needs attention` item. If no authorized responsible principal
> exists, the applicable Phase 12 access owner receives that separately owned
> cause. D22 cannot create, approve, publish, repair, retry, purge, waive,
> suppress, close, or reinterpret D1–D21 or Phase 10/12 truth.**
>
> **Quiet is structural: healthy Pages, successful automatic release, ordinary
> propagation, provider waiting, automatic retries, projection rebuilds, and
> resolved work produce no attention item, navigation alarm, email, success
> wall, or repeating live-region announcement. Communication-owning Phases 6
> and 17 may deliver at most one privacy-minimized notification occurrence for
> an exact root cause and responsible-owner generation when work first becomes
> human-actionable, its responsible owner changes, its owner-defined deadline or
> escalation is reached, or visitor impact materially worsens; repeated source
> observations do not fan out to every merely capable staff member. D22 creates
> no universal priority, due-date, SLA, assignment, or escalation engine, and
> immediate Phase 10 safety handling never waits for D22. Missionaries remain in
> their ordinary D1 Public pages dashboard and see only D5/D18 vocabulary plus
> calm actions or organization-owned explanations relevant to their exact
> assignment; spouse, teammate, subject, participant, D19 Ministry Assignment,
> and Phase 21 Support relationships grant nothing by themselves; D12 response
> moderation remains D12-owned; and donors receive no operations projection,
> cause, owner, trace, or diagnostic. An otherwise admitted Page may remain
> visible while an independently unavailable Give action uses honest
> non-technical text and never substitutes a Designation.**
>
> **The projection separates root causes from exact Page/Update impacts and
> preserves structurally complete, non-null Tenant, Legal Entity, environment,
> Site, locale, owner-domain, cause, version, Page/Update, and applicable
> generation identities through kind-correct constraints and unique impact
> membership. Projection rows, impacts, counts, filters, search, exports,
> subscriptions, logs, notifications, and caches are permission-filtered before
> presentation; exposed Supabase objects use explicit grants, indexed default-
> deny RLS and security-invoker behavior, privileged projector paths remain
> server-confined and audited, cache keys include complete scope, and no count,
> empty state, timing difference, URL, or notification may reveal another
> Tenant or a restricted Page. Transactional owner occurrences, idempotent
> monotonic consumers, out-of-order rejection, tenant-fair durable processing,
> keyset pagination, periodic count/digest reconciliation, coverage watermarks,
> smallest-scope rebuild, and privacy-safe lag/backlog diagnostics make repeated
> or delayed delivery harmless. The existing shared Mission Control task model
> may contribute reusable shell components and, only after complete same-scope
> integrity plus idempotent atomic linkage are proved, at most one follow-up
> collaboration task for a human-actionable root cause; its free-form issue
> metadata, tenant-only scope, dismiss/suppress controls, mutable resolution,
> and broad service-role access can never be D22 truth, and task completion,
> dismissal, suppression, reassignment, reminder, or read state closes nothing.**
>
> **The staff experience uses concise sentence-case consequence copy, explicit
> links and buttons rather than an ambiguous whole-row action, progressive
> detail, server-side bounded search/filter/sort, stable keyset pagination,
> honest loading/no-match/partial/unavailable states, permission-consistent
> counts, preserved filter and focus context after owner actions, semantic
> lists or tables on wide screens and stacked cards on narrow screens, logical
> keyboard order, restrained polite status announcements, non-color meaning,
> and WCAG 2.2 AA reflow and target sizing. Production activation requires
> owner-adapter contract proof; row/count/search/export/cache/RLS isolation;
> one-cause-many-Pages and many-causes-one-Page proof; duplicate, delayed,
> out-of-order, reopen, revocation, stale-tab, ambiguous-outcome, notification-
> storm, source-outage, rebuild, and rollout-skew proof; the D21 5,000-Page
> production-shaped cohort plus bursty causes and measured supported-tenant
> capacity; and representative staff, missionary, restricted-worker, mobile,
> keyboard, screen-reader, zoom, forced-colors, reduced-motion, RTL, and long-
> locale comprehension testing—without a mutable task or alert ledger, ticket
> or workflow engine, custom status/priority/due-date/assignment matrix,
> arbitrary action URL, bulk approval or resolution, `Dismiss`, `Snooze`, `Mark
fixed`, `Force live`, generic retry or purge, direct database repair, raw
> provider error, broad notification, relationship-derived access, public
> diagnostic leakage, absence-as-resolution, substituted Giving, duplicate
> owner authority, or any claim that drafted, reviewed, published, public,
> updating, gift-ready, action-needed, notified, repaired, converged, resolved,
> donated, settled, or paid are the same fact.**

### Why the raw option needed hardening

`One quiet workspace` is safe only if it is a read model over existing owner
truth. A universal task, alert, or case engine would duplicate D4/D5 review,
D7 Giving, D8 lifecycle, D9 media, D18 convergence, Phase 10 safety, and Phase
12 authority. A single Page health score would also lie: a Page may be
**Public**, have an unapplied new photo, and have **Giving unavailable** at the
same time. Those are three independently owned facts, not one amber status.

The current repository proves the risk is concrete. The generic
`mission_control_tasks` and `mission_control_attention_items` tables allow
mutable `completed`, `resolved`, `dismissed`, and `suppressed` outcomes,
free-form `issue_type`/JSON details, tenant-only uniqueness, and privileged
service-role access. Those semantics are appropriate migration evidence for
their current contribution-operations use; they cannot prove that a public-
page source cause was corrected. D22 therefore defines a separate disposable
projection contract and may reuse only presentation primitives.

### Exact information architecture

| View                | Includes                                                                                                                   | Excludes                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **To review**       | D4/D5 candidates awaiting a decision the current actor is authorized to make                                               | Automatic-mode healthy candidates, safety blocks masquerading as editorial choices, copied review state                       |
| **Needs attention** | Current owner-labelled causes with one concrete action the current actor may perform now                                   | Healthy work, automatic recovery, provider waiting, informational observations, inaccessible causes, mutable acknowledgements |
| **All pages**       | Coverage-labelled, permission-filtered inventory with independent **Visitor access**, **Giving**, and relevant owner facts | Overall health score, technical chips, restricted-page inference, raw owner/provider detail                                   |

The workspace landing remains calm. It surfaces a compact **Needs attention**
or **To review** entry only when the current actor has work; otherwise it opens
the authorized inventory with a plain **No work needs your attention** message.
Every view has a stable URL so bookmarks, browser history, and return paths do
not change unpredictably.

An ordinary healthy row contains only the Page identity, family/Site/locale,
**Visitor access**, and **Giving**. An actionable detail follows this order:

1. what supporters can see now;
2. whether Giving is available now;
3. what changed or could not be applied;
4. whether automatic recovery is continuing;
5. which owning role or team must act;
6. one literal owner action; and
7. source through-time only when freshness changes the decision.

For example:

> **New photo was not applied**
>
> Visitors still see the previous approved photo. The replacement did not meet
> the public-media requirements.
>
> **Replace photo**

and independently:

> **Giving is unavailable**
>
> Visitors can view this Page, but they cannot use its Give button. Finance
> needs to review the connected Designation.
>
> **Review designation**

If the viewer cannot perform the latter action, `All pages` may say **Finance
needs to review the connected Designation** when that disclosure is authorized;
it does not render a disabled fake action. Restricted-worker notifications use
neutral copy such as **A public page needs a security review — Sign in to
review it**, without a Page title, person, location, trigger, former URL, or
image.

### Cause, impact, and action boundary

- One root-cause record identifies the owning domain, stable owner cause,
  monotonic source version, current safe presentation key, actionability,
  required capability/action kind, responsible-owner generation, source
  through-time, and projection/reconciliation generations.
- Separate impact membership identifies each exact Page or Ministry Update and
  its privacy-safe visitor consequence. One Designation cause affecting 300
  Pages therefore creates one finance action and one notification intent with
  300 permission-filtered impacts, while a media cause and a Giving cause on one
  Page remain two causes.
- Owner adapters are finite, versioned, and contract-tested. They expose no raw
  owner enums, arbitrary URL, provider error, content body, donor data, original
  filename, EXIF, private review conversation, or restricted identity.
- Selecting an action resolves a code-owned route and invokes the owner command.
  The owner performs current authorization, source-head, scope, and idempotency
  reproof. D22 never writes owner state and cannot report **Fixed** merely
  because a request was accepted.
- A source-owned correction or supersession automatically removes the cause
  from current work. Owner history remains durable; D22 may show a permissioned
  reference timeline but never copies or becomes that audit record.
- Incomplete reconciliation shows **Some page information is temporarily
  unavailable** and the last complete through-time. It never shows a zero count
  or silently closes prior conditions. Direct owner workflows and public
  serving remain independent of D22 availability.

### Role and notification consequences

| Actor                                                   | D22 consequence                                                                                                                    |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Small-tenant generalist with several exact capabilities | Sees all actions they genuinely hold, with no fictional handoff or second approver; every action still enters its owning command.  |
| D4/D5 reviewer                                          | Sees exact `To review` candidates and review actions, not finance, safety, or operator detail they cannot act on.                  |
| Finance/Designation staff                               | Sees grouped D7/Phase 13 causes and affected Pages, never editorial or safety authority.                                           |
| Phase 10 safety owner                                   | Sees only currently authorized safety detail; adverse containment never waits for the workspace.                                   |
| D1 contributor/missionary                               | Remains in the missionary Public pages workspace and sees only assigned Page actions, D5 workflow, and D18 serving truth.          |
| Spouse, teammate, subject, D19 or Support participant   | Gains no enumeration or action without an exact current D1 or owner-specific assignment under their own principal.                 |
| Support/operator                                        | Uses a separate technical evidence view with safe references and no owner mutation, public content, finance, or safety override.   |
| Donor/visitor                                           | Receives only the currently admitted public experience and honest owner-defined unavailable behavior; no D22 payload or inference. |

Notification eligibility is a transition, not a polling result. A notification
may be requested only when a root cause first becomes human-actionable for its
responsible owner generation, responsibility changes, an owner-supplied
deadline/escalation is crossed, or visitor impact materially worsens. Duplicate
events, automatic retries, cache observations, reconciliation, and successful
resolution are quiet. Read/unread is personal presentation state, never cause
resolution. Phase 6/17 retain recipient, cadence, preference, suppression,
delivery, and provider truth.

### Supabase, isolation, scale, and recovery

- Raw projection writes are restricted to a server-confined projector identity.
  User reads use current Phase 12 authorization plus indexed default-deny RLS;
  exposed views are security-invoker, and security-definer helpers, if required,
  live outside exposed schemas with a pinned `search_path` and revoked public
  execution.
- Queries carry server-resolved Tenant, Legal Entity, environment, Site, and
  locale filters in addition to RLS. Policy predicates, stable sort, cause
  identity, impact membership, and actionable-view access paths are indexed and
  production-plan tested.
- Counts, filters, search, export, realtime, navigation badges, notification
  payloads, and cache entries use the same permission and coverage boundary as
  rows. An unauthorized Page contributes neither a row nor a distinguishable
  total, empty state, timing result, or cache artifact.
- Owner changes commit their product fact and transactional occurrence together.
  Consumers apply only monotonic versions idempotently; duplicates and old
  versions cannot reopen or close newer truth. Periodic source count/digest
  reconciliation catches missed delivery and rebuilds the smallest affected
  scope.
- Keyset pagination and bounded server filters replace offset scans and N+1
  fanout. Tenant-fair queues and burst controls keep one mass Designation,
  media, or route cause from starving other tenants.
- Private observability tracks adapter/source coverage, projection lag, oldest
  human-actionable cause, reconciliation mismatch, rejected old versions,
  duplicate collapse, stale action attempts, invalid action targets,
  notification deduplication, unauthorized access attempts, and rebuild
  duration without logging restricted identities or raw cause data.

### D22 ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                       | Severity | Likelihood  | Permanent prevention                                                                                                                                                    |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Missing, late, reordered, or incompatible owner facts can falsely remove work or leave a dead action.                                                                      | Critical | High        | Versioned adapters, monotonic updates, complete coverage watermarks, periodic reconciliation, source outage states, and execution-time reproof.                         |
| Technical debt                    | Yes      | Copying owner enums, permissions, close rules, labels, and links into D22 creates a drifting second implementation.                                                        | High     | High        | One finite semantic adapter/action contract, owner commands, shared presentation primitives, and exhaustive adapter conformance tests.                                  |
| Edge cases                        | Yes      | One cause can affect thousands of Pages, one Page can have several causes, a resolved cause can reopen, and Pages, locales, owners, or permissions can change mid-action.  | Critical | High        | Cause/impact separation, exact versions, deterministic grouping/order, source-owned reopen/supersession, retirement handling, and current reproof.                      |
| Footguns                          | Yes      | `Mark fixed`, dismiss, snooze, bulk approve, generic retry/purge, arbitrary severity, or Force live can hide harm or bypass an owner.                                      | Critical | Medium-high | Application-read-only projection, code-owned actions, no generic mutation/bulk correction, and owner-side authorization/idempotency.                                    |
| Tenant safety                     | Yes      | Rows, counts, searches, URLs, notifications, caches, or timing can reveal another tenant or a restricted Page.                                                             | Critical | Medium-high | Complete structural scope, indexed RLS, security-invoker views, post-authorization counts, safe caches/copy, and hostile cross-scope tests.                             |
| Over-engineering                  | Yes      | A universal case system, workflow builder, custom status matrix, assignment engine, or SLA product becomes permanent second authority.                                     | High     | High        | Exactly three fixed views, disposable read model, finite owner adapters, source-owned responsibility/deadlines, and existing communication infrastructure.              |
| UX/UI and user friction           | Yes      | Status-chip overload, technical jargon, empty alerts, disabled actions, whole-row activation, and desktop-only tables train staff to ignore real work.                     | High     | High        | Independent plain-language facets, one literal action, progressive disclosure, stable routes, quiet healthy states, mobile cards, and accessible feedback.              |
| Hidden coupling                   | Yes      | A change to review, Giving, media, routes, safety, search, or caching can silently change D22 behavior or vice versa.                                                      | Critical | High        | Versioned privacy-safe owner contracts, stable action kinds, no raw-table joins, and D22 writes to no owner domain.                                                     |
| Failure modes                     | Yes      | Projection outage, lost notification, partial rebuild, stale tab, broken deep link, or unknown command outcome can hide work or cause unsafe retry.                        | Critical | High        | Durable transactional occurrences, reconciliation, honest partial/unavailable states, safe return/refresh, owner idempotency, and inspect-before-retry.                 |
| Data integrity risks              | Yes      | Duplicate conditions, nullable scope, bad grouping, old close events, or mutable resolution can corrupt counts and hide current work.                                      | Critical | High        | Non-null kind-correct keys, unique cause/impact identity, monotonic CAS, source-owned append-only history, and no D22 resolution field.                                 |
| Security and privacy risks        | Yes      | Titles, aliases, safety causes, former routes, logs, exports, emails, provider errors, or aggregates can identify restricted workers.                                      | Critical | High        | Redaction before projection, opaque references, minimum safe copy, current capability checks, protected operator evidence, and non-enumerating denial.                  |
| Scalability and performance risks | Yes      | Request-time cross-domain joins, N+1 impact reads, offset scans, incident fanout, or RLS full scans can make the workspace unusable or unfair.                             | High     | High        | Incremental materialization, cause grouping, keyset pagination, bounded counts, indexed policies/filters, batching, tenant fairness, and measured load proof.           |
| Operational burden                | Yes      | Staff may acknowledge automation noise, triage duplicates, find owners, or clean stale/resolved rows manually.                                                             | High     | High        | Human-actionable-only membership, owner-derived responsibility, automatic source-owned removal, grouped causes, quiet retries, and private operator runbooks.           |
| Observability gaps                | Yes      | Staff may read an empty view as healthy while operators cannot trace lag, mismatch, dropped events, invalid actions, or notification storms.                               | Critical | High        | Coverage/through-time UI, source/cause/version references, lag/backlog/reconciliation metrics, synthetic checks, and privacy-safe trace IDs.                            |
| Dependency and integration risks  | Yes      | Payload, Giving, media, search, cache, notification, or provider semantics can drift and tempt D22 to guess, retry, or expose raw errors.                                  | High     | Medium-high | Capability/version-pinned owner adapters, explicit unknown, circuit breaking, owner-controlled provider operations, and contract certification.                         |
| Migration and upgrade risks       | Yes      | Legacy alerts or generic task rows can be imported as authority; schema/catalog changes can strand causes or duplicate notifications.                                      | High     | Medium-high | No legacy-alert authority, additive versioned schemas, shadow rebuild with count/digest parity, cursor cutover, and disposable rollback.                                |
| Other development hazards         | Yes      | Double clicks, revoked grants, clock skew, duplicate/out-of-order events, notification-at-least-once delivery, deployment skew, or unsafe flags can defeat the happy path. | Critical | High        | Owner-side CAS/idempotency, source sequencing, current authorization, deterministic notification keys, compatibility gates, kill switches, and concurrency/fault tests. |

### Required production proof

The eventual implementation is not acceptable until it proves:

1. D5 workflow, D18 serving, D7 Giving, every owner condition, and D22 view
   membership remain semantically and visibly separate;
2. rows, impacts, counts, search, filters, exports, subscriptions, notification
   copy, logs, URLs, caches, privileged projectors, security-definer helpers,
   and service-role paths cannot disclose a wrong Tenant, Legal Entity,
   environment, Site, locale, Page, restricted identity, or cause;
3. one cause affecting 300 Pages becomes one owner action/notification with
   300 permission-filtered impacts, while three causes on one Page remain three
   independent facts with no overall health score;
4. duplicate, delayed, missing, out-of-order, reopened, and superseded owner
   versions; partial source coverage; projector/queue outage; reconciliation
   mismatch; and smallest-scope rebuild never produce false zero, health, or
   resolution;
5. revoked actors, changed facts, stale tabs, two actors, repeated clicks,
   conflicting idempotency keys, an accepted-but-unobserved owner command, a
   changed action route, and safe return to the prior filtered view cannot
   duplicate, misapply, or falsely close work;
6. one notification eligibility transition remains one privacy-safe Phase
   6/17 intent despite repeated observations, twenty automatic retries, and
   projection rebuilds; responsibility or material-impact change creates only
   the appropriate successor intent;
7. 100 healthy Pages produce zero work items, zero attention alarm, zero email,
   and no success wall, while partial coverage is explicitly not shown as zero;
8. the D21 production-shaped 5,000-Page minimum cohort plus bursty one-cause-
   many-Page and many-cause-one-Page data retains stable indexed query plans,
   bounded keyset pagination, tenant fairness, reconciliation, and measured
   supported-tenant headroom;
9. staff of small and large tenants can correctly state what visitors see,
   whether Giving works, what changed, who acts, and what happens after the
   action without knowing Phase codes or architecture; and
10. keyboard, screen reader, focus, concise polite status messages, 320-CSS-
    pixel reflow, 200% text, 400% zoom, forced colors, reduced motion, touch,
    RTL/long locale, offline/interruption, public non-disclosure, and donor
    independent-degradation behavior.

### Ruthless synthesis and implementation order

1. Freeze the existing D5/D7/D18 vocabularies and prohibit a whole-Page health
   state before adding any aggregation.
2. Define the smallest versioned owner-condition, cause, impact, action-kind,
   coverage, and permission-safe presentation contracts; reject raw-table joins
   and a universal task/workflow schema.
3. Prove complete scope keys, kind-correct uniqueness, explicit grants, indexed
   RLS, security-invoker views, privileged-projector confinement, and hostile
   permission-filtered row/count/search/cache behavior.
4. Add transactional owner occurrences, idempotent monotonic projection,
   periodic count/digest reconciliation, keyset pagination, tenant fairness,
   and private lag/backlog/rebuild observability.
5. Build the three stable views and exact row anatomy over read-only projection
   data; route each literal action to its owner with current reproof and safe
   return.
6. Request notifications through Phase 6/17 only for exact human-actionability,
   responsibility, owner-deadline, or material-impact transitions, with root-
   cause deduplication and quiet defaults.
7. Preserve the ordinary missionary dashboard and donor-safe independent
   degradation without leaking causes, diagnostics, or alternate Designations.
8. Run contract, RLS, concurrency, fault, rebuild, notification-storm, scale,
   mobile, accessibility, and staff-comprehension proof before certification.

Detailed repository and current primary-source evidence is recorded in
[Phase 22 research evidence](./phase-22-public-ministry-pages-research-evidence.md#45-ratified-d22-research--quiet-derived-public-page-operations).

**Architectural record:**
[ADR-0139](../../adr/0139-derived-public-page-operations-with-cause-owned-actions.md).

D22 is closed as planning truth without reopening or weakening D1–D21. The
next dependency-ordered seam was D23: how an authorized tenant admin first sets
up and later changes Public Pages defaults without a settings maze or a second
source of truth. D23 was unresolved at D22 closure and is now ratified below.
No runtime, migration, issue publication, notification, or production action is
authorized.

## D23 — How does an authorized tenant admin set up and later change Public Page defaults without guesswork or a second source of truth?

**Status:** Ratified as the exact C-prime-R on 2026-08-14. This decision is
planning truth only and
authorizes no implementation, migration, notification, issue publication, or
production activation.

### Exact ratified formulation

> **C-prime-amended-and-hardened (C-prime-R) — one quiet, scope-first,
> permission-filtered, disposable Public Page Setup & Settings Projection in
> Mission Control over—and never instead of—the exact current source-owned
> immutable configuration versions established by D2–D20 and Phase 21 D10. A
> finite code-owned adapter catalog may summarize D2 Publication Reach;
> D3/D20 Missionary and Project/Campaign Presentation Profiles; D4/D5 Review &
> Release; D6 creation-only progress seeds; D11 Ministry Update audience
> seeds; D12 Supporter Responses; D13 Discovery; D15 Measurement; and D16's
> independently owned `public-profile drafting` AI capability availability,
> without storing or exposing a provider key. D7 Giving, D8 lifecycle, D9
> media safety, D14 search and sharing, D17 subject, D19 people and access,
> D18 runtime delivery, D21 surface adoption, and D22 operations remain
> per-item, automatic, or separately owned workflows rather than D23 settings.**
>
> **D23 owns only its finite presentation-and-routing descriptor catalog,
> permission-safe derived summary, setup guidance, navigation, and UI
> composition. Every descriptor identifies one exact owner and compatible
> adapter generation; source version and current head; internally complete
> Tenant, Legal Entity, environment, Site, and only applicable Page Family,
> locale, or publication-path dimensions; read and change capabilities;
> owner-supplied consequences and effective/through-time; and one literal
> owner action. The projection distinguishes `Organization choice`, `Built-in
default`, `Safe fallback — not yet chosen`, `Default for new items`, `Off`,
> `Unavailable`, `Partial`, `Unknown`, and `Not applicable` rather than
> collapsing them into a value. It cannot define or inherit a policy, infer a
> tenant choice from absence, copy a profile, reinterpret an owner default, or
> store mutable configuration, readiness, completion, health, or activation
> truth.**
>
> **First setup keeps the exact authorized organization, Legal Entity,
> environment, Site, and locale context visible and URL-addressable and
> foregrounds only the deliberate
> choices needed to begin safely: `Who can find new Missionary pages?`, `Who
can find new Project pages?`, and `Should staff review contributor changes?`.
> Missing D2 choices say that new release requests remain Not public; missing
> D4 choice says staff review remains required. Neither fallback is presented
> as an organization choice. One collapsed `Safe defaults already in use`
> summary explains built-in, Off, unavailable, and still-unset behavior without
> a completion percentage, success wall, or forced tour. Ongoing use keeps the
> same scope-first surface and four calm groups: `Visibility and publishing`,
> `Page appearance and discovery`, `Optional features`, and `Chosen on each
page`. Each row states `Current choice`, `Source`, `Applies to`, `What this
changes`, `What this does not change`, `Existing content`, and authorized
> last-change evidence, followed by one uniquely named action such as `Change
Project page reach`. D6 and D11 seeds are labelled for new items only; final
> D6 progress, D7 Giving, D11 audience where deliberately changed per Update,
> D17 subject, and D19 people and access remain explicitly page- or
> Update-owned.**
>
> **Each `Change` action opens one prepopulated, single-column,
> owner-specific form using plain-language choices, contextual help, and one
> exact `What will change / What will not change / Who and when` consequence
> review with descriptive commit copy. Saving invokes only the owning domain's
> current command after server-side reproof of actor, capability, complete
> scope, source head, prerequisites, and consequence evidence; validates one
> typed request; creates one prospective immutable successor; compare-and-swap
> advances the complete-scope owner head; and records owner audit and
> transactional occurrence evidence atomically under a content-bound
> idempotency key. Authoritative readback, not an optimistic toast, confirms
> the exact new choice and effect. Stale or concurrent work shows the current
> value beside the attempted value and never overwrites it; a timeout or
> ambiguous result says `We couldn't confirm whether this changed` and
> inspects owner truth before retry. `Use this choice again` creates a new
> successor instead of rolling history backward. Separate changes have
> separate outcomes—there is no fictional cross-owner atomic save or rollback.**
>
> **The authenticated summary is server-composed and private/no-store by
> default. Authorization and exact scope resolution occur before rows, labels,
> options, counts, history, previews, deep links, timing differences, or caches
> are composed. Exposed Supabase objects use explicit least-privilege grants,
> indexed default-deny RLS, complete same-scope constraints, and
> security-invoker views; any privileged helper remains server-confined in an
> unexposed schema with pinned `search_path` and public execution revoked. A
> browser service role, user-editable or stale JWT metadata, Payload
> preference, raw `tenants.org_settings`, prior URL, or last-viewed scope is
> never authority. If measured scale later requires materialization, that
> projection remains disposable and is partitioned by complete scope,
> authorization epoch, adapter generation, and owner-head digest; commands
> still re-read current owner truth. One unavailable source degrades only its
> row, shows last-confirmed coverage where safe, and never becomes blank,
> zero, Off, default, or success. D23 failure never blocks public serving or a
> direct owner workflow.**
>
> **Configuration remains separate from consequence: D2/D4 and each owner
> alone determine prospective effects; D21 alone prepares and starts the
> complete public surface; D22 alone presents operational work; D2's sole
> release command executes only D4/D5's settled release outcome; and Phase 10
> remains the non-waivable live safety ceiling. D23 may
> offer `Continue preparing pages` only as a clearly separate D21 link and may
> offer production-equivalent presentation preview only where its owner permits
> it; neither is proof of publication. Healthy optional settings stay collapsed
> and readable-but-not-changeable settings explain the responsible owner
> without a disabled fake control. The localized experience uses native
> controls, visible labels, fieldsets and legends, error summary plus inline
> errors, unsaved-change protection, stable deep links and return context,
> keyboard and screen-reader operation, restrained status announcements,
> non-color meaning, mobile/320-CSS-pixel reflow, 200% text, 400% zoom,
> unobscured focus, touch targets, forced colors, reduced motion, RTL, and long
> locale proof—without a universal settings blob, generic mutation endpoint,
> inheritance maze, arbitrary settings or workflow DSL, global `Save all`,
> tenant-wide enable switch, instant consequential toggle, implicit default,
> bulk apply/reset, retroactive propagation, mutable restore, destructive undo,
> blind retry, stale overwrite, cross-scope cache, raw-table or CMS authority,
> duplicated AI/provider configuration, persistent setup checklist, second
> review/release/activation/operations authority, or any claim that configured,
> selected, saved, profile-active, page-prepared, approved, released, publicly
> reachable, indexed, Giving-ready, operationally healthy, cut over, converged,
> donated, settled, or paid are the same fact.**

### Why the raw option needed hardening

One page labelled **Settings** can still be a dangerous second policy system.
The current repository proves that risk is not hypothetical:

- `packages/api/src/admin/org-settings.ts` reads and mutates one hard-coded
  demo Tenant, checks only coarse roles, casts request data, performs a mutable
  last-write-wins update, and invents a fallback when data is absent.
- `supabase/schema.sql` places untyped `org_settings` JSON on the secret-bearing
  `tenants` row. That blob cannot represent D2–D20's unequal scopes, immutable
  versions, owner commands, or authorization boundaries.
- `apps/admin/app/(app)/feed/org-updates/page-client.tsx` contains a simulated
  delay followed by a success toast rather than authoritative persistence.
- the current Web Studio picker resolves only a Tenant and the current auth
  context exposes coarse Tenant roles, not D23's Legal Entity, Site, locale,
  Page Family, publication-path, and owner-capability scope.

These are legacy or prototype seams, not a foundation to extend. D23 therefore
composes semantic owner ports and sends each change back to its owner. It does
not wrap the existing `org_settings` endpoint or add another JSON document.

### Exact information architecture

The persistent header says which organization, Legal Entity, Site, locale, and
environment the user is viewing. A dimension appears only when it is real for
the current setting. One available scope is plain text; several authorized
scopes use one accessible, URL-addressable selector. The server resolves and
authorizes every selection. The UI never infers scope from navigation history.

Initial setup shows only this:

```text
Public page settings

Choose defaults for new public pages. Each choice explains whether existing
pages or work will change.

Hope Missions · United States legal entity
give.hopemissions.org · English · Production
[Change site or language]

Choices to make

Who can find new Missionary pages?
Not chosen — new release requests remain not public
[Choose Missionary page reach]

Who can find new Project pages?
Not chosen — new release requests remain not public
[Choose Project page reach]

How are contributor changes published?
Staff review remains required until your organization chooses
[Choose review and publishing]

Safe defaults already in use
Missionary layout: Standard
Project layout: Standard
Directory: Together
Supporter responses: Off
Activity measurement: Off
Writing help: Off or unavailable
[Show optional features]

Chosen on each page
Support progress · Giving destination · Subject · People and access
[Open pages]
```

After the deliberate choices are saved, the summary may say **These defaults
are ready. No Page is live because of this setup.** It may then link to
**Continue preparing pages**, which enters D21. There is no **Setup complete**
state, checklist authority, or percent complete.

Ongoing configuration uses four groups:

| Group                             | Includes                                                                                                  | Excludes                                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Visibility and publishing**     | D2 requested-reach defaults per Page Family and D4/D5 review/release choice                               | Phase 10 override, Page release, D21 activation, D22 review queue                               |
| **Page appearance and discovery** | D3/D20 family profiles and D13 Together/separate discovery topology                                       | Per-Page content, D14 crawler observation, arbitrary layout builder                             |
| **Optional features**             | D6 creation seed, D11 audience seed, D12 responses, D15 measurement, and D16 writing-help availability    | Provider/API keys, raw events, per-Page final values, automatic D9/D14/D18 behavior             |
| **Chosen on each page**           | Links to D6 final progress, D7 Giving, D11 per-Update audience where changed, D17 subject, and D19 access | Global default impersonation, bulk mutation, inferred choices, finance or publication authority |

### One-setting change flow

A consequential choice is never an instant switch. For example:

```text
Who can find new Project pages?

○ Listed publicly
  People can find these pages in your ministry directory. Search engines may
  index an eligible release.

○ Shared by link — public
  Anyone with the link can open and reshare an eligible release. It does not
  appear in Asym directories or site search. This is not private.

○ Not public
  Visitors cannot open the page.

Before you save

Will change
• New Project page release requests prepared after 14 August 2026 will request
  Shared by link — public.

Will not change
• Existing released Pages
• Who may edit or release
• Giving destinations

Safety rules can still keep an individual Page unavailable.

[Use Shared by link for new Project pages]
```

The owner supplies every consequence statement because effects differ. D4
loosening does not auto-publish an existing review backlog; D13, D15, D12, D6,
and D11 each have their own prospective boundary. D23 cannot substitute a
generic **future only** promise.

Ordinary prospective changes do not need a confirmation modal after the
consequence review. Confirmation dialogs are reserved for a genuinely
destructive or irreversible owner action—which no ordinary D23 successor
change is. A successful command returns focus to the changed summary and
announces the exact owner-confirmed result. A failed form focuses an error
summary linked to field errors; entered values remain intact.

### Descriptor, command, and history boundary

Each finite descriptor supplies:

1. a stable setting kind and adapter generation;
2. one source owner, current head/version, and through-time;
3. the exact applicable scope dimensions and complete scope identity;
4. distinct read and change capabilities;
5. a typed current-state meaning and plain-language presentation;
6. owner-generated `changes`, `does not change`, existing-item, and timing
   consequences;
7. one code-owned owner action and safe return route; and
8. coverage, compatibility, and availability evidence.

The descriptor is not a generic profile schema, workflow rule, URL, mutation
payload, or product setting. Unknown descriptor or owner generations fail
honestly while the last source-confirmed value remains labelled with its
through-time where disclosure is safe.

Each owner keeps its own immutable versions and complete-scope head. A command
is one short transaction: validate, re-prove current authority and scope,
insert the successor, CAS the expected head, append audit/outbox evidence, and
return the authoritative result. Zero rows advanced is a conflict, not success.
Serialization or deadlock recovery retries the complete bounded transaction,
never a partial statement. The idempotency identity includes the actor, exact
owner command, complete scope, expected head, and request digest; key reuse with
different content fails visibly.

Authorized history shows semantic old/new choice, scope, actor where allowed,
effective boundary, and source version. It is an owner view, not copied D23
history. Selecting **Use this choice again** opens the ordinary consequence
review and creates a successor with the prior semantic value.

### Supabase, isolation, performance, and recovery

- D23 is a server data-access boundary. Browsers receive only the minimum
  permission-safe summary and owner action references; they do not query owner
  version/head tables or hold a service-role credential.
- RLS and grants are separate controls. Owner tables are default-deny, direct
  authenticated writes are absent, every relevant policy/filter column is
  indexed, and queries repeat exact scope filters in addition to RLS.
- Complete scope uses non-null, kind-correct keys, scope-specific uniqueness,
  and composite same-scope references. A nullable universal profile table or
  `type + id + JSON` relation is prohibited.
- Exposed views use `security_invoker = true`. A necessary security-definer
  helper is schema-qualified, lives outside exposed schemas, pins
  `search_path`, has public/anonymous/authenticated execution revoked, and has
  a narrow explicit grant.
- JWT user metadata is not authorization. Revocation and scope changes are
  re-proved from current owner/Phase 12 truth before reads and commands; cache
  artifacts cannot keep access alive.
- The initial server composition uses bounded parallel or batched owner reads.
  Request-time N+1 Page scans and broad cross-domain joins are prohibited.
  History is keyset-paginated and production plans are measured under the real
  RLS role.
- A materialized summary is permitted only after measured need. It is
  reconstructable from owner heads, carries adapter/head/authorization
  generations and coverage watermarks, and is never command authority.
- Private observability distinguishes not configured, safe fallback, Off,
  unauthorized, unavailable, incompatible adapter, stale head, idempotent
  replay, ambiguous outcome, and projection lag without recording public-page
  content, restricted identities, or provider secrets.

### D23 ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                             | Severity | Likelihood  | Permanent prevention                                                                                                                                 |
| --------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | Missing heads, owner outages, adapter drift, or one omitted scope dimension can display the wrong choice or consequence.                                                         | Critical | High        | Finite versioned adapters, exhaustive state meanings, complete scope keys, coverage/through-time, compatibility gates, and fail-honest rows.         |
| Technical debt                    | Yes      | Copying owner defaults, labels, permissions, forms, or effect logic into D23 creates a second implementation that will drift.                                                    | High     | High        | Presentation-only descriptors, owner-generated effects and commands, one typed composer, and exhaustive adapter contract tests.                      |
| Edge cases                        | Yes      | Multiple entities/sites/locales/families, unset fallbacks, legacy cohorts, open drafts, queued reviews, concurrent admins, retired scopes, or absent options behave differently. | Critical | High        | Exact scope/state algebra, owner-specific consequences, CAS, current reproof, and a complete scenario matrix.                                        |
| Footguns                          | Yes      | `Save all`, global toggles, wrong scope, instant auto-publish, reset, bulk apply, or last-write-wins can expose people or silently alter future behavior.                        | Critical | High        | Persistent scope, one setting/form/command, consequence review, descriptive commit verbs, immutable successors, and no broad controls.               |
| Tenant safety                     | Yes      | Cards, values, options, counts, history, deep links, caches, or timing can reveal or mutate another tenant/entity/site or restricted configuration.                              | Critical | Medium-high | Authorization before composition, server-derived scope, structural same-scope keys, indexed RLS, explicit grants, and hostile substitution tests.    |
| Over-engineering                  | Yes      | A universal schema, inheritance matrix, workflow/condition DSL, generic transaction coordinator, or permanent wizard becomes a new platform.                                     | High     | High        | Small finite catalog, three foregrounded choices, collapsed optional features, direct owner forms, and no persistent completion model.               |
| UX/UI and user friction           | Yes      | Jargon, settings mazes, hidden scope, ambiguous defaults, repeated confirmations, disabled mystery controls, or desktop-only forms create guesswork.                             | High     | High        | Plain task questions, source/effect copy, progressive disclosure, prepopulation, stable return, native controls, mobile/a11y/comprehension tests.    |
| Hidden coupling                   | Yes      | Reach could implicitly change directory, SEO, review, Giving, D21 readiness, D22 work, or another owner's profile.                                                               | Critical | High        | Independent versions/commands/outcomes and negative contract tests proving no cross-owner effects.                                                   |
| Failure modes                     | Yes      | Partial reads, source outage, stale tabs, timeout-after-commit, duplicate clicks, broken return links, or projection lag can mislead or duplicate work.                          | Critical | High        | Per-row states, idempotency/CAS, inspect-before-retry, authoritative readback, preserved context, and direct owner continuity.                       |
| Data integrity risks              | Yes      | Duplicate heads, nullable scope, cross-scope references, deep JSON merges, stale overwrites, or fictional bulk atomicity can corrupt policy truth.                               | Critical | High        | Owner-specific immutable versions, unique heads, composite FKs, transactional CAS/audit/outbox, and no D23 configuration rows.                       |
| Security and privacy risks        | Yes      | Coarse roles, shared caches, actor history, restricted Page existence, AI secrets, raw errors, or service-role/browser access can leak sensitive data.                           | Critical | High        | Current fine-grained capabilities, minimum safe summaries, private/no-store, redacted owner history/logs, RLS/grants, and no secret duplication.     |
| Scalability and performance risks | Yes      | N-way owner fanout, RLS recursion/full scans, all-scope loads, Page N+1 queries, offset history, or wide indexes can make settings slow and leaky.                               | High     | Medium-high | Batched bounded reads, measured optional materialization, predicate-aligned indexes, keyset history, query-plan and tenant-fair load proof.          |
| Operational burden                | Yes      | Staff may repeatedly certify defaults or manually reconcile divergent cards; developers may maintain duplicate forms and migration exceptions.                                   | High     | High        | Quiet safe defaults, no recurring checklist, adapter conformance/reconciliation, source-owned history, and cause-owned owner guidance.               |
| Observability gaps                | Yes      | Staff may mistake setup for live impact while operators cannot trace owner head, projection coverage, conflicts, or an ambiguous command.                                        | Critical | High        | Exact result copy, owner/head/request correlation, privacy-safe coverage/lag/conflict metrics, audit events, and synthetic adapter/isolation probes. |
| Dependency and integration risks  | Yes      | Phase owners, Phase 10/12, Payload, Supabase, and Phase 21 AI/provider capabilities evolve independently and can invalidate the summary.                                         | High     | High        | Versioned adapter compatibility, capability certification, circuit breaking, explicit unavailable states, and no raw/provider configuration.         |
| Migration and upgrade risks       | Yes      | Legacy global toggles, `org_settings`, CMS status, or fake saved state may be imported, dual-written, or left as shadow authority.                                               | Critical | Medium-high | Complete settings census, exact mapped/quarantined disposition, production-shaped shadow comparison, one UI-reader cutover, and no dual write.       |
| Other development hazards         | Yes      | CSRF/IDOR, stale sessions, deployment skew, double submission, retry storms, unsafe flags, clock assumptions, or accessibility regressions can cause harm.                       | Critical | High        | Origin/CSRF protection, opaque references, commit-time auth, idempotency/CAS, generation gates, bounded retries, kill switches, and full proof.      |

### Required production proof

The eventual implementation is not acceptable until it proves:

1. every displayed value, source label, consequence, and through-time matches
   the exact current owner head, while deleting/rebuilding any D23 projection
   changes no owner or public behavior;
2. D23 cannot publish, release, widen Phase 10, activate D21, clear D22 work,
   choose D7 Giving, modify D17/D19, or execute another owner's command;
3. organization choice, built-in default, safe fallback/unset, creation seed,
   Off, unavailable, partial, stale, unknown, unauthorized, and not-applicable
   states remain visibly and structurally distinct;
4. hostile Tenant, Legal Entity, environment, Site, locale, Page Family,
   publication-path, history, option, preview, deep-link, count, timing, and
   cache substitutions fail without enumeration;
5. current read/change capabilities differ correctly, revocation during an
   open form fails closed at commit, and tests run through real impersonated
   RLS roles rather than only a service role;
6. two admins, stale heads, repeated submission, idempotency-key misuse,
   timeout-after-commit, ambiguous response, complete-transaction retry, and
   independent partial outcomes never overwrite or duplicate truth;
7. D2/D4 changes, D6/D11 creation seeds, D12 responses, D13 topology, D15
   measurement, and D16 capability changes apply exactly their owner-defined
   prospective effects to releases, drafts, queued work, and future items;
8. source outage, Phase 10 narrowing, capability loss, adapter skew,
   pre-D21 tenancy, projection lag, and owner-workflow continuity remain honest
   and safe;
9. representative small- and large-tenant staff complete first setup and a
   later change without training, correctly teach back active scope, what
   changes, what stays unchanged, whether existing Pages change, whether
   anything becomes public, and who reviews;
10. native semantics, keyboard, screen reader, error/focus/status behavior,
    320-CSS-pixel reflow, 200% text, 400% zoom, unobscured focus, touch, forced
    colors, reduced motion, RTL, long locale, interruption, and mobile proof
    pass WCAG 2.2 AA and the Core accessibility contract;
11. bounded composition, permission-safe option/history reads, and owner
    consequence preflights retain stable indexed plans and measured headroom
    across the D21 5,000-Page production-shaped cohort, many scopes, and
    concurrent administrators;
12. the legacy settings census gives every row/flag exactly one mapped,
    quarantined, or inert disposition, proves shadow parity, removes dual UI
    authority, and recovers only through owner successors; and
13. private traces follow summary → owner head → consequence preflight →
    command → successor → projection refresh without logging protected content,
    restricted identity, or credentials.

### Ruthless synthesis and implementation order

1. Freeze the setting inventory and classify every D2–D20 fact as a profile,
   creation seed, per-item choice, automatic behavior, or separate workflow.
   D23 may expose only the first two as settings.
2. Define the small finite descriptor/state/owner-command contract. Reject a
   universal settings table, inherited mega-profile, generic PATCH, and copied
   consequence logic before schema or UI work starts.
3. Establish the genuine prerequisites: Phase 2 Legal Entity/Site scope, Phase
   12 fine-grained capabilities, and each owner's immutable version/head,
   semantic read adapter, consequence preflight, idempotent CAS command, audit,
   and transactional occurrence contract.
4. Prove server-derived scope, same-scope integrity, explicit grants, indexed
   RLS, security-invoker behavior, private/no-store summaries, and hostile
   row/option/count/history/deep-link/cache isolation before rendering change
   controls.
5. Build the initial three-choice setup, then the four-group ongoing summary,
   using owner copy, safe defaults, progressive disclosure, and literal actions.
6. Add one-setting owner forms, consequence review, authoritative readback,
   stale/ambiguous recovery, accessible status/errors, unsaved-change
   protection, successor history, and stable return context.
7. Link separately to D21 preparation, D22 operations, and per-page workflows;
   import none of their authority, status, rows, or commands.
8. Perform the legacy settings census and production-shaped shadow comparison,
   then retire the old settings UI/read path without changing D21's public
   reader boundary or dual-writing canonical settings.
9. Run ownership, isolation, concurrency, failure, migration, performance,
   observability, accessibility, localization, and comprehension certification
   before enabling the workspace.

Detailed current-repository, comparator, security, UX, accessibility, and
primary-source evidence is recorded in
[Phase 22 research evidence](./phase-22-public-ministry-pages-research-evidence.md#46-ratified-d23-research--derived-public-page-setup-and-settings).

**Architectural record:**
[ADR-0140](../../adr/0140-derived-public-page-setup-and-settings.md).

D23 is closed as planning truth without reopening or weakening any preceding
decision. D1–D23 are binding, and this ratification adds no runtime, migration, issue,
notification, or production authority.

## D24 — How may authorized staff revise contributor-authored Public Page content without erasing attribution or creating a second workflow?

**Status:** Ratified as the exact C-prime-R on 2026-08-14. This decision is
planning truth only and authorizes no
implementation, migration, notification, issue publication, or production
activation.

### Exact ratified formulation

> **C-prime-amended-and-hardened (C-prime-R) — one attribution-preserving
> Staff-authored Page Revision path inside D1's sole coherent working-revision
> contract, D20's bounded typed editorial surface, and D4/D5's sole candidate,
> review, and release contract for both Public Ministry Page families. A
> currently Phase-12-authorized staff Page content editor may use the ordinary
> `Edit page` action to create or resume one private staff-authored successor
> from the exact current coherent working head or, when none exists, the exact
> current live or D1-authorized initial private base. From one exact immutable
> submitted contributor candidate, an edit-capable staff member may use the
> same deliberately secondary `Edit page` action to derive a new
> staff-authored successor while preserving the candidate bytes and digest,
> contributor actors, submission and review facts, source lineage, and
> independent history. Review-only authority never grants edit; staff
> authorship never grants review, approval, release, reach, or public-safety
> authority; and the resulting revision follows the tenant's unchanged D4/D5
> `Submit for review` or `Publish changes` path through D2's sole release
> command.**
>
> **The ordinary path asks no source question and requires no reason. If an
> exact active or submitted contributor revision would be superseded, the UI
> first says whose work is preserved, what source will seed the staff revision,
> that nothing becomes public, and requires one short contributor-visible
> reason. If the coherent working head advanced after the reviewed submission,
> one exceptional consequence screen offers only `Continue from latest draft`
> (recommended) or `Start from submitted version`; the command still appends
> from and CAS-advances the exact current head while separately preserving the
> chosen same-scope content source. No arbitrary version picker, automatic
> merge, hidden branch, or last-write-wins overwrite exists. Every displaced
> draft, candidate, author, reason, and semantic comparison remains immutable,
> permission-filtered, and recoverable; `Use as starting point` creates another
> successor and never rewinds history.**
>
> **Each deliberate successor re-proves the current actor, exact staff edit
> capability and authorization epoch, Tenant, Legal Entity, environment, Site,
> locale, Page Family, Page, current assignment where applicable, lifecycle,
> Phase-10 ceiling, D3/D20 field allowlist and catalog generation, source
> identity and digest, expected working-head generation, and idempotency
> identity. It records exact actor and acting authority path, predecessor and
> same-scope content source, successor, changed semantic targets and diff
> digest, safe reason where required, server time, and outcome. Same-scope
> constraints, explicit grants, indexed deny-first RLS, a short compare-and-swap
> transaction, authoritative readback, complete-transaction retry for proved
> serialization/deadlock failures, and inspect-before-retry recovery make zero
> advanced rows a visible conflict rather than success. Payload remains the
> content/version store: every user-context Local API call carries the
> authenticated actor with `overrideAccess: false` and `overrideLock: false`;
> Payload locks, `_status`, Admin roles, restore, autosave, and native publish
> controls are never Asym authority. Cross-store work prepares one private,
> structurally inert content version before the short operational provenance,
> head, audit, and outbox commit; referenced semantic versions are retention
> pinned and pre-commit orphans are reconciled.**
>
> **The quiet experience keeps `Approve & publish` and `Request changes`
> primary during review, `Edit page` secondary, exact live
> preview visible, and managed source-owned facts read-only with links to their
> owning workflows. Private autosave never advances the semantic head,
> supersedes contributor work, releases content, or emits a notification.
> Contributors see `Staff updated this page`, the permission-safe actor or
> protected role label, through-time, safe reason where applicable, and an
> accessible changed-sections-only `Added` / `Removed` / `Changed` comparison;
> one privacy-minimized, idempotent notification intent is emitted only after a
> committed material supersession, request for action, genuine conflict, or
> release outcome, with Phases 6/17 retaining recipient, preference, dispatch,
> and delivery authority. Managed identity, D17 subject, D19 participants and
> support access, D2 reach and release, D8 route/lifecycle, D7 Designation, D6
> progress, D9 media, D11 Updates, D14 discovery/share, D15 measurement, Giving,
> finance, and Phase-10 safety remain independently source-owned.**
>
> **No separate staff-revision table, staff-override setting, missionary
> approval state, parallel queue, per-page workflow, branch model, CRDT or live
> coauthoring system, automatic content merge, per-word attribution theater,
> reason taxonomy, generic staff/admin role, relationship-derived permission,
> browser or service-role mutation, direct Payload Admin authority,
> `Approve with edits`, editing as a missionary, in-place candidate mutation,
> head rewind, destructive restore or delete, universal source chooser,
> mandatory reason for routine edits, autosave history or notification spam,
> raw-content logs, fake legacy actor/reason, blind retry, or claim that edited,
> autosaved, submitted, reviewed, approved, released, publicly reachable,
> indexed, Giving-ready, donated, settled, or paid are the same fact is
> permitted.**

### Plain-language product rule

Staff do not "override a missionary." The organization may revise the
presentation content it owns, but Asym always creates a new private revision
under the staff member's own identity. The missionary's or teammate's submitted
work stays preserved and attributed. Editing alone never makes the revision
public.

### Quiet UX contract

| Situation                                                         | Primary experience                                                                                                               | Result                                                                                                                             |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| No contributor work is active                                     | **Edit page** opens the current staff working revision, or starts from the exact current live release                            | Private staff revision; no source chooser, modal, or reason                                                                        |
| One contributor candidate is under review                         | **Approve & publish** and **Request changes** stay primary; **Edit page** is secondary and visible only with edit authority      | New staff revision derived from the immutable candidate; no review decision is manufactured                                        |
| A newer coherent draft exists than the reviewed candidate         | Show one plain consequence screen with **Continue from latest draft** recommended and **Start from submitted version** secondary | One linear successor records both the exact current predecessor and selected same-scope content source; nothing is merged silently |
| Staff deliberately supersede active or submitted contributor work | Explain whose work is preserved and require one short safe reason                                                                | Contributor work remains inspectable; one material-supersession occurrence may be emitted after commit                             |
| The public Page needs immediate removal or narrowing              | Route to D2/Phase 10 containment                                                                                                 | Public safety changes immediately through its owner; content editing is not an emergency-control substitute                        |
| A prior version should be reused                                  | **Use as starting point**                                                                                                        | New successor; no restore-over, head rewind, or history deletion                                                                   |

Routine editor chrome says **Saved privately**, then only the D4-profile-honest
final action: **Submit for review** or **Publish changes**. History and semantic
comparison are secondary links. Autosaves are collapsed beneath the deliberate
revision rather than flooding the timeline. Technical terms such as CAS,
successor, branch, source ID, and Payload status do not appear in ordinary UI.

### Authority and storage boundary

- **D1** owns one Page-and-locale working head and immutable revision lineage.
  D24 qualifies the author and supersession provenance; it creates no new
  revision family.
- **D2** remains the sole release/current-public-head and containment command.
  A D24 save cannot publish or unpublish.
- **D3/D20** determine which typed semantic targets the exact staff capability
  may edit. Managed fields remain read-only.
- **D4/D5** retain one candidate and review/release lane. Staff revision is not
  approval, rejection, or request-changes.
- **D10** supplies exact-version preview under current preview authority.
- **D16** may suggest text; applying it is still a staff-authored D24 revision.
- **D17/D19** keep subject and participant/support-access truth separate from
  editorial authorship.
- **D22/D23** may navigate to the owner action but own neither edit nor setting.
- **Phase 10** remains the non-waivable public-safety ceiling.
- **Phase 12** owns independent edit, preview, review, release, settings, and
  operational capabilities; a broad staff label is insufficient.
- **Payload** owns authored content and version storage only. The Phase 22
  server boundary owns the product command, provenance, and release handoff.
- **Phases 6/17** own notification recipients, preferences, delivery, and
  outcomes after one D24 occurrence.

### D24 ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                            | Severity | Likelihood  | Permanent prevention                                                                                                                                                                               |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | Yes      | The reviewed candidate, current working head, live release, permissions, or Page lifecycle may change between opening and saving, causing lost work or a false success.                         | Critical | High        | Exact immutable sources, current-scope reproof, expected-head CAS, visible zero-row conflict, authoritative readback, and no silent merge.                                                         |
| Technical debt                    | Yes      | A special staff draft, override state, editor, queue, or audit bolt-on would duplicate D1/D4 and drift.                                                                                         | High     | High        | One ordinary Page Revision and D20 editor with structural actor/source/diff provenance and one existing candidate/release lane.                                                                    |
| Edge cases                        | Yes      | Spouses, teammates, two staff editors, post-submission edits, stale tabs, revoked staff, retirement, locale changes, assets, or one-person tenants can create ambiguous authorship and state.   | Critical | High        | Complete state matrix, one head per exact scope, commit-time reproof, immutable snapshots, deterministic contextual source rules, and hostile concurrency tests.                                   |
| Footguns                          | Yes      | `Approve with edits`, direct restore/publish, edit-as-missionary, bulk replace, or mandatory generic override controls could erase attribution or publish unintended content.                   | Critical | High        | Literal actions, independent capabilities, secondary supersession action, allowlisted fields, successor-only reuse, and no direct Payload controls.                                                |
| Tenant safety                     | Yes      | Coarse tenant-staff access or guessed Page/version IDs could expose or mutate another Tenant, Legal Entity, Site, locale, restricted Page, actor, or history.                                   | Critical | Medium-high | Server-derived complete scope, Phase 12 capability proof, same-scope composite integrity, indexed RLS plus explicit grants, and hostile substitution tests before enumeration.                     |
| Over-engineering                  | Yes      | Git-like branches, CRDTs, per-word attribution, merge queues, reason catalogs, block locks, or arbitrary workflows would turn a bounded staff edit into a collaboration platform.               | High     | High        | One linear lineage, one contextual exceptional choice, semantic-section comparison, one free-text reason only on material supersession, and no new setting or queue.                               |
| UX/UI and user friction           | Yes      | Source choosers on every edit, technical statuses, forced explanations for typos, dense diffs, warnings, and notification noise would make ordinary work slow and confusing.                    | High     | High        | Quiet deterministic defaults, progressive disclosure only on real displacement/conflict, plain consequence copy, collapsed unchanged sections/history, and mobile/a11y testing.                    |
| Hidden coupling                   | Yes      | Staff editing might implicitly approve, publish, widen reach, alter managed facts, clear D22 work, or change D23 configuration.                                                                 | Critical | High        | Separate commands and capabilities plus negative contract tests proving every forbidden non-effect.                                                                                                |
| Failure modes                     | Yes      | Network loss, timeout after commit, duplicate click, serialization failure, lock expiry, adapter error, or revocation may create duplicates or make staff believe unsaved/private work is live. | Critical | High        | Idempotency bound to actor/scope/source/head/digest, inspect-before-retry, full-transaction bounded retry, honest save states, preserved authorized buffer, and last certified release continuity. |
| Data integrity risks              | Yes      | Mutable candidate bytes, cross-scope sources, duplicate heads, pruned referenced versions, stale overwrite, or destructive restore can corrupt lineage.                                         | Critical | High        | Immutable revisions/candidates, same-scope constraints, unique head/CAS, content and diff digests, retention pins, orphan reconciliation, and successor-only restoration.                          |
| Security and privacy risks        | Yes      | Old content, actor identity, reason, diff, preview, logs, or notification payloads may disclose restricted-worker facts or private editorial history.                                           | Critical | Medium-high | Current permission filtering, Phase 10 projection ceiling, private/no-store views, protected actor labels, content-free logs, safe reasons and links, and no service key in browser.               |
| Scalability and performance risks | Yes      | Every autosave, full rich-text diff, N+1 permission check, or offset history query can make high-volume Pages slow and expensive.                                                               | High     | Medium      | Separate/coalesce scratch autosave, bound semantic sections, precompute compact changed-path/diff summaries, exact-ID reads, predicate-aligned indexes, and keyset history.                        |
| Operational burden                | Yes      | Staff could be forced to reconcile parallel branches, repeat explanations, notify contributors manually, or learn hidden Payload behavior.                                                      | High     | High        | One editor and lineage, contextual one-time consequence step, automatic occurrence intent, source-owned actions, and no second admin system.                                                       |
| Observability gaps                | Yes      | Support may be unable to prove who changed what, which source was used, whether the head moved, or whether anything was actually released.                                                      | High     | High        | Privacy-safe revision-to-candidate-to-release correlation, exact actor/source/head/outcome evidence, conflict/orphan/adapter metrics, and synthetic isolation probes.                              |
| Dependency and integration risks  | Yes      | Payload access, lock, autosave, restore, or retention defaults may change and silently become authority; cross-store partial completion may dangle references.                                  | Critical | Medium-high | Version-pinned Payload adapter certification, explicit bypass-off flags, inert prepare plus short operational commit, retention proof, and upgrade conformance tests.                              |
| Migration and upgrade risks       | Yes      | Legacy Payload versions or coarse logs may be falsely attributed to a missionary or staff member, and old native publish paths may remain dual authority.                                       | High     | High        | Complete legacy census, explicit known/system/unknown provenance, no invented reasons, D21 reader/command cutover, and removal of native product authority.                                        |
| Other development hazards         | Yes      | CSRF/IDOR, stale sessions, clock ordering, deployment skew, review/edit conflation, double submission, or unsafe feature flags can defeat otherwise correct UX.                                 | Critical | Medium-high | Server commands with CSRF/origin/session protection, opaque references, server ordering, generation compatibility, idempotency, kill switches, and adversarial proof.                              |

### Required production proof

The eventual implementation is not acceptable until it proves:

1. staff edits always create a new correctly attributed successor and never
   mutate a contributor revision, submitted candidate, or live release;
2. edit, preview, review, approval, release, containment, settings, operational
   repair, and notification delivery remain independent permissions and facts;
3. every source and predecessor belongs to the same exact Tenant, Legal Entity,
   environment, Site, Page Family, Page, and locale, and hostile substitutions
   fail before counts, history, actors, or content are disclosed;
4. two staff editors, spouses/teammates, a contributor editing after submission,
   stale tabs, double clicks, timeout-after-commit, serialization/deadlock retry,
   and capability revocation never lose or duplicate work;
5. the ordinary edit requires no source choice or reason, while a material
   contributor-work supersession cannot proceed without clear consequence copy
   and one short safe reason;
6. reviewer-only staff cannot edit, editor-only staff cannot review or release,
   and a combined one-person actor is represented honestly under D4 rather than
   as independent maker-checker review;
7. D3/D20 managed targets, Page identity/subject, reach, route, Designation,
   progress, media, Updates, discovery, measurement, Giving, support, finance,
   and Phase-10 safety cannot be altered by the D24 command;
8. private autosave neither advances semantic history nor emits notification,
   and every semantic/candidate/release reference survives configured Payload
   retention and can be reconstructed;
9. an ambiguous cross-store prepare/commit leaves either an inert reconcilable
   orphan or one authoritative revision with residual-only recovery, never a
   half-authoritative public Page;
10. representative missionaries, spouses/team contributors, staff editors,
    reviewer-only staff, and combined small-tenant actors complete ordinary
    edit, submitted-candidate revision, comparison, and real conflict recovery;
    all correctly teach back whose work is preserved and whether anything is
    public, with zero silent overwrite or wrong attribution and at least 90%
    unassisted completion on ordinary paths;
11. native semantics, keyboard, screen reader, text-labelled diffs, focus and
    status behavior, 320-CSS-pixel reflow, 200% text, 400% zoom, unobscured
    focus, touch, forced colors, reduced motion, RTL/CJK, and long locales meet
    WCAG 2.2 AA and the Core accessibility contract;
12. production-shaped history, diff, permission, and contention tests retain
    stable indexed plans, bounded latency, tenant fairness, and no N+1 access
    pattern; and
13. the legacy census gives every current CMS version, draft, native status,
    publish path, and audit row exactly one mapped, quarantined, unknown, or
    inert disposition without fabricated actor or reason and without dual
    authority after D21 cutover.

### Ruthless synthesis and implementation order

1. Ratify the ownership statement first: **Staff-authored Page Revision** is a
   qualification of D1's ordinary Page Revision, not a new content or workflow
   object.
2. Specify Phase 12's exact staff content-edit capability and D3/D20's writable
   semantic targets; prove negative authority before exposing an edit action.
3. Make immutable source/predecessor provenance, same-scope integrity, one head,
   CAS, idempotency, retention, and cross-store recovery structural before UI.
4. Integrate the command into D4/D5 unchanged: ordinary edit is quiet;
   contributor-work supersession is the only reason/consequence branch.
5. Build one accessible editor, exact preview, changed-sections comparison,
   secondary history, honest save/release labels, and one material occurrence
   for existing notification owners.
6. Census and shadow legacy Payload drafts, versions, locks, statuses, buttons,
   and logs; preserve unknown provenance honestly and remove native dual
   authority through D21.
7. Certify authorization, tenant isolation, concurrency, ambiguous recovery,
   retention, negative cross-domain effects, performance, accessibility,
   localization, and representative-user comprehension before enablement.

Detailed current-repository, comparator, security, concurrency, Payload,
Supabase/Postgres, accessibility, and UX evidence is recorded in
[Phase 22 research evidence §47](./phase-22-public-ministry-pages-research-evidence.md#47-ratified-d24-research--attribution-preserving-staff-authored-page-revisions).

**Architectural record:**
[ADR-0141](../../adr/0141-attribution-preserving-staff-authored-page-revisions.md).

D24 is closed as planning truth without reopening or weakening any preceding
decision. D1–D24 are binding, and this ratification adds no runtime, migration,
issue, notification, or production authority.

## D25 — What happens to abandoned, old, withdrawn, or no-longer-current Public Page drafts and submitted candidates?

**Status:** Ratified as the exact C-prime-R on 2026-08-14. This decision is
planning truth only and grants no implementation, migration, retention,
deletion, notification, issue-publication, or production authority. D1–D24
remain binding.

This closes the highest-dependency Phase 22 editorial-lifecycle gap. The
source prompt explicitly requires a result when a draft is abandoned, its base
becomes old, classification changes, or the worker departs. D1–D24 define
authoring, submission, review, release, staff attribution, history, and public
containment, but they do not yet define when unreleased work remains actionable,
becomes recovery-only, is withdrawn, or is eventually eligible for
purpose-governed erasure.

### Founder-selected direction and concrete case

The founder selected **C-prime — Cause-gated actionability with tiered,
recoverable editorial work**, with two non-negotiable constraints: D25 must not
become a database burden and must not become a second complicated workflow.

Grace submits a new ministry story and photo. Staff do not review it for four
months. Meanwhile her spouse saves newer Page work, the tenant tightens the
Phase 10 safety ceiling, the submitted photo loses D9 eligibility, staff release
a different revision, and Grace later leaves and returns under a new Ministry
Assignment. Asym must preserve Grace's work without pretending its age, stored
bytes, old authorization, or Payload status proves what anyone may do now.

### Material corrections made by the adversarial review

The selected C-prime did not survive unchanged:

1. **No per-actor durable recovery branch.** D1 and D24 already require one
   coherent Page-and-locale working head. D25 therefore permits one coalesced,
   non-semantic server recovery buffer beneath that exact head and current
   editor lease. A losing tab may keep only an ephemeral in-memory copy; it
   cannot create another product head or durable sensitive browser record.
2. **Actionability is action-specific.** A changed dependency may block
   **Approve & publish** while **View submission**, **Request changes**,
   terminal rejection, explicit withdrawal, or separately authorized D24
   **Edit page** remains valid. D25 derives each permitted action; it does not
   persist one candidate-level stale or actionability status.
3. **Recovery does not submit.** **Review saved changes** opens a newly proofed
   D1 successor. The user then deliberately chooses the ordinary D4 action:
   **Submit for review** or **Publish changes**. Recovery never bundles a new
   submission or release.
4. **Reuse is exact-scope only.** The same Page, locale, family, and subject may
   seed a successor. A different Page, locale, family, or post-release subject
   follows its ordinary owner-authorized creation and D8 succession path.
5. **Stored content does not imply view authority.** Every view and comparison
   uses current Phase 12 authorization and Phase 10/D9-safe rendering. A failed
   proof gives a non-enumerating explanation, not protected bytes.
6. **Age is context, never a cause.** It creates no **Needs attention** item,
   task, notification, expiry, archive, deletion, or authority change. A valid
   old submission stays in **To review** until an existing D4/D5 outcome or
   explicit withdrawal.

### Database-minimal architecture

| Layer                                               | Durable responsibility                                                                                                                                                                                                           | Explicit non-responsibility                                                                           |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Payload private editorial store                     | Authored content bytes, one coalesced recovery buffer beneath the exact coherent working head, deliberate immutable content versions, and reference-safe scratch compaction                                                      | No product approval, release, access, retention, or restore authority; no append row per keystroke    |
| Existing D1/D2/D4/D5/D24 operational truth          | Exact Page/locale head generation, opaque content-version reference and digest, immutable candidate, actor/provenance, decision or withdrawal occurrence, release reference, idempotency evidence, and current owner generations | No copied prose, media, full diff, autosave history, D25 status, or generic archive state             |
| Finite server-side Editorial Actionability Resolver | At read time, derives the actions permitted to the current Principal and one privacy-safe, source-owned cause; at command time, the owning command independently re-proves every required fact                                   | No table, status column, materialized truth, timer, queue, trigger, polling scan, or source authority |
| D22 workspace                                       | Disposable, permission-filtered presentation of the derived action and owning cause                                                                                                                                              | No closure, workflow, notification, health, or retention truth                                        |

D25 adds **zero authoritative tables, zero Page/candidate status columns, zero
per-autosave audit or outbox events, zero copied content bodies or full diffs,
zero cross-schema foreign keys or triggers over Payload tables, zero materialized
D25 projection, and zero tenant expiry/retention matrix**. It reuses the compact
facts already required by D1–D24.

Payload currently shares the application's Postgres system under the private
`cms` schema, so recovery still has a real database cost. The permanent control
is one overwriteable/coalesced recovery version, not pretending the cost is
zero. Launch uses one code-owned trailing two-second dirty-aware debounce, a
15-second maximum wait, explicit **Save draft**, safe-navigation/editor-handoff
flush, digest-based no-op suppression, one in-flight write per
Page/locale/head generation, and late-write fencing. Unsafe close/navigation
keeps visible unsaved input and warns honestly rather than claiming an
unreliable flush. The timing is not a tenant knob and must pass
production-shaped load certification. The current 300 ms prototype interval
and Payload's native version cap are not product policy.

Only unreferenced scratch may be compacted. Deliberate D1 revisions and content
referenced by a candidate, decision, withdrawal, or release are protected by
their existing reference closure. Cleanup is incremental, resumable, and
fail-closed: it quarantines a candidate item, re-reads authoritative references,
deletes only when still unreferenced, and opens one private operational
exception when proof is missing. It never scans whole history on the hot path or
relies on `maxPerDoc` to decide evidence retention.

### Exact ratified formulation

> **C-prime-amended-and-hardened (C-prime-R) — cause-gated,
> action-specific editorial recovery over existing Phase 22 truth, with one
> bounded recovery buffer and no D25 database state machine:** Phase 22 D25
> governs unreleased D1 Public Page working content and D4/D5 Page Release
> Candidates only. Age is display-only context and never approves, publishes,
> rejects, withdraws, expires, archives, deletes, creates a task or notification,
> changes public reach, or establishes retention authority. For every read and
> deliberate command, one finite server-side resolver derives only the actions
> the current Principal may perform from the exact current Tenant, Legal Entity,
> environment, Site, Page Family, Page, locale, D1 working head, immutable
> candidate, D2 release and reach facts, D3/D20 catalog and renderer generations,
> D9 media eligibility, D17/D19 subject and lifecycle, Phase 10 ceiling, Phase 12
> authorization epoch, and each other already-required owner generation; the
> owning command re-proves those facts at commit. A failed proof removes only the
> actions that require it and never becomes one mutable candidate-level status.
>
> **D25 adds no authoritative actionability, stale, archive, expiry, retention,
> health, recovery, or resolution table or column; no per-autosave event, audit
> row, outbox row, content body, full diff, cross-schema foreign key, trigger,
> polling scan, duplicate task, or materialized D25 projection in operational
> Postgres.** It reuses D1/D2/D4/D5/D24's existing heads, opaque content-version
> references, digests, immutable candidates, actor provenance, decisions,
> withdrawals, releases, idempotency evidence, and owner generations. D22 may
> present a disposable, permission-filtered action result and owner cause, but
> neither that result nor elapsed time owns or closes work.
>
> **Payload remains the private editorial content/version store.** The
> production-certified Payload adapter coalesces autosave into one bounded,
> non-semantic recovery buffer for the exact Page and locale beneath the
> expected coherent working head and current editor lease; it creates no durable
> per-actor branch, advances no semantic head, freezes no candidate, emits no
> notification, and records no per-keystroke operational history. A stale or
> losing browser session may preserve only an ephemeral in-memory recovery copy
> and cannot overwrite or create another product head. Only unreferenced scratch
> may be compacted. Deliberate D1 revisions and the exact content sources
> referenced by candidates, decisions, withdrawals, and releases are protected
> by their existing reference closure outside scratch-pruning behavior. The
> launch save cadence is a code-owned trailing two-second dirty-aware debounce
> with a 15-second maximum wait, explicit **Save draft**,
> safe-navigation/editor-handoff flush, digest no-op suppression, one in-flight
> write per exact generation, and late-write fencing; it is not a tenant knob.
> Payload defaults, `maxPerDoc`, `_status`, locks, autosave, restore, trash,
> native publish, and the current 300 ms prototype interval are not product or
> retention authority. Blind native version pruning is disabled for these Page
> collections, and D24's bounded reconciler alone may reclaim
> reference-proved scratch or inert prepares. Cross-store prepare and cleanup
> use one command identity, bounded
> quarantine, authoritative reference recheck, and orphan reconciliation so
> cleanup cannot race a candidate or revision commit; missing proof preserves
> the item and opens a private operational exception rather than guessing.
>
> **A submitted Page candidate remains immutable and visible in D22's `To
review` view to currently authorized staff until an existing D4/D5 review
> outcome or explicit withdrawal.** Age never hides organizational
> responsibility. A real owner-domain change may prevent approval or release
> while still allowing independently authorized actions such as **View
> submission**, **Request changes**, terminal rejection, explicit withdrawal, or
> D24 **Edit page**; unavailable actions are omitted or replaced by a
> permission-safe owner explanation, not shown as misleading disabled controls.
> A prospective Review & Release Profile change never converts an old backlog
> into automatic publication.
>
> **Recovery is append-only, same-scope, and separate from submission.**
> **Review saved changes** or **Use as starting point** creates one newly
> attributed D1 successor from the exact current working head while separately
> referencing the preserved same-Page, same-locale, same-family, same-subject
> content source. It revalidates every current D3/D20 semantic target, D9 media
> reference, D17/D19 subject and lifecycle fact, Phase 10 safety result, and
> Phase 12 authorization; removed, incompatible, or unsafe material is not
> silently copied. The contributor then uses the unchanged D4 action **Submit for
> review** or **Publish changes**. Recovery never mutates a candidate, rewinds a
> head, invokes Payload restore, performs an automatic or last-write-wins merge,
> submits, publishes, or resurrects a prior authorization. A different Page,
> locale, family, or post-release subject is outside D25 reuse and must follow
> its ordinary owner-authorized Page and D8 succession contracts.
>
> **Withdrawal reuses D1/D4/D5's existing explicit, immutable occurrence.** It
> removes the candidate from actionable review, changes no live release, and
> preserves only the permission-filtered evidence required by its applicable
> purpose. “Recoverable” grants no current or former actor access and does not
> mean retained forever.
>
> **Retention behavior is derived from existing references, not stored as
> another workflow:** coalescible recovery scratch; current working or submitted
> editorial content; and content referenced by immutable candidate, decision,
> withdrawal, or release evidence. Phase 22 defines those semantic distinctions
> and protection requirements but invents no universal schedule, legal hold, or
> erasure authority. Payload executes editorial-byte storage and compaction
> under the applicable tenant-visible records/privacy policy; D9 and Phase 29
> retain public-media meaning and byte-lifecycle ownership; D2 retains release
> authority. Owner-authorized erasure first preserves referential integrity
> through the minimum permitted non-content tombstone or digest and, when
> current public output is affected, invokes the existing Phase 10/D2/D8/D18
> containment or successor path. Age, a Payload cap, a cleanup job, storage
> movement, task closure, or actor revocation never proves erasure eligibility.
>
> **The ordinary experience stays quiet.** Healthy editors see only **Saved
> privately** and a subtle last-saved time. If preserved work can no longer
> proceed unchanged, Asym says: **“Your earlier changes are saved, but this page
> has changed since then. Review them against the current page before submitting
> again.”** A currently authorized editor receives **Review saved changes** and,
> where D10 permits it, **View saved version**. Staff see the exact current
> visitor consequence, the source-owned blocker, and one literal authorized
> action. The UI does not use **Expired**, **Archived**, branch/merge language,
> technical version numbers, destructive **Restore**, success walls,
> age-created alarms, or per-autosave announcements.
>
> **Dependency failure is inert and recoverable.** If Payload, an owner proof,
> or the disposable resolver is unavailable or contradictory, the last safe
> public release remains independently governed, unreleased work remains
> private, no action is reported successful, and Asym says it cannot currently
> confirm the action. Idempotent authoritative readback and inspect-before-retry
> determine whether a deliberate revision, withdrawal, candidate, or successor
> committed. Tenant-safe aggregate telemetry may measure autosave write rate,
> recovery-buffer counts, orphan age, reference-integrity failures, cleanup
> outcomes, resolver denial causes, and latency without raw prose, media, diffs,
> public identifiers, per-keystroke events, or cross-tenant cardinality.
>
> **No per-actor durable draft, parallel branch, D25 status machine, generic
> stale cause, tenant expiry matrix, age-based task or reminder, per-autosave
> version/audit stream, full-content operational copy, raw Payload-table join,
> native restore/delete authority, whole-history scan, automatic cross-scope
> copy, silent field or media resurrection, former-contributor access, duplicate
> D22 issue, Phase-29 editorial-text takeover, Phase-40 dependency, blind retry,
> destructive rollback, or claim that saved, recoverable, current, actionable,
> reviewable, approved, released, public, retained, erased, or externally
> forgotten are the same fact is permitted.**

### Quiet, accessible UX contract

| Situation                                | What the person sees                                                                                                                            | Available result                                                                                                                                             |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Healthy editing                          | **Saved privately · just now** in a low-noise status region                                                                                     | No toast, task, history row, or authority change                                                                                                             |
| Save is still pending                    | **Saving…**                                                                                                                                     | The UI never claims durability before authoritative acknowledgement                                                                                          |
| Save fails                               | **We couldn't save your latest changes. Keep this page open and try again.**                                                                    | **Retry saving**; no success claim, release change, or lost visible input                                                                                    |
| Saved source no longer applies unchanged | **Your earlier changes are saved, but this page has changed since then. Review them against the current page before submitting again.**         | Primary **Review saved changes**; secondary **View saved version** when currently authorized                                                                 |
| Review finishes                          | The ordinary D4 action appears                                                                                                                  | **Submit for review** or **Publish changes**; recovery itself did neither                                                                                    |
| Staff candidate has a real blocker       | **This submission can't be approved yet because the page changed after it was submitted. The submitted version is still saved.**                | One source-owned primary action plus only independently authorized **Request changes**, **View submission**, **Edit page**, rejection, or withdrawal actions |
| Explicit withdrawal                      | **Withdraw this submission? It will leave the review queue. The live page will not change. A record of the withdrawal will remain in history.** | **Withdraw submission** or **Keep in review**                                                                                                                |

Save status uses a polite programmatic status announcement without moving focus;
save errors are assertive but keep the editor and input intact. Comparisons show
semantic sections rather than raw JSON, use side-by-side layout only where space
permits, stack **Saved version** and **Current page** on small screens, identify
content that cannot be carried forward with text rather than color alone, and
never require drag-only interaction.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                                                  | Severity | Likelihood  | Permanent prevention                                                                                                                                                                                                                                                 |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**  | Timers, persisted stale flags, broad generation invalidation, Payload `_status`, native restore, or `maxPerDoc` could become accidental authority and fail as owner facts or provider behavior changes. | High     | High        | Derive actions from exact current owner facts at read time and re-prove them inside every command; age is display-only; protect deliberate references from scratch pruning.                                                                                          |
| Technical debt                    | **Yes**  | Missionary, staff, CMS, and queue surfaces could each implement different “stale draft” rules and contradictory actions.                                                                                | High     | High        | One finite server resolver, one source-owned cause vocabulary, one UI action vocabulary, and no D25 table, copied content, full diff store, or second workflow.                                                                                                      |
| Edge cases                        | **Yes**  | Spouses, teammates, multiple tabs, another device, head or locale movement, safety or media change, retirement, return, and reassignment can lose work or resurrect material under the wrong scope.     | Critical | High        | One coherent head and recovery buffer, current editor lease, expected generation, CAS, commit-time reproof, exact-scope successor reuse, and explicit conflict preservation.                                                                                         |
| Footguns                          | **Yes**  | **Restore**, destructive delete, timer expiry, blanket archive, automatic merge, or approval from a stale tab can overwrite history or publish invalid work.                                            | Critical | Medium      | Literal non-destructive actions, append-only successors/withdrawal, action-specific authority, and cleanup that proves content is unreferenced before deletion.                                                                                                      |
| Tenant safety                     | **Yes**  | An omitted Tenant, Legal Entity, Site, Page, locale, subject, or authorization scope could expose restricted-worker drafts or let a departed contributor read old material.                             | Critical | Medium      | Server-derived complete scope, current Phase 12 and Phase 10 proof before enumeration/read/reuse, actor-context Payload access with overrides off, tenant-scoped caches, indexed deny-first RLS, and hostile substitution tests.                                     |
| Over-engineering                  | **Yes**  | D25 could become a branch/CRDT product, archive module, rules engine, reminder scheduler, tenant expiry matrix, or second review workflow.                                                              | High     | High        | Keep one recovery buffer and existing D1/D4/D5 occurrences; derive actions; add no D25 settings, queue, state machine, or generic task.                                                                                                                              |
| UX/UI and user friction           | **Yes**  | Work may disappear, old items may look “expired,” technical merge language may confuse users, or harmless age may flood staff queues and notifications.                                                 | High     | High        | Quiet save states, warnings only for real causes, valid old candidates remaining in **To review**, one owning action, progressive comparison, plain language, mobile/a11y tests, and no age-generated noise.                                                         |
| Hidden coupling                   | **Yes**  | Payload autosave, `_status`, D22 tabs, D4 review mode, D21 migration state, or D24 editing could silently control another domain.                                                                       | Critical | High        | Payload stays behind an editorial-storage adapter; the resolver returns only allowed actions and an owner cause; publication, review, safety, media, migration, and lifecycle retain their owners.                                                                   |
| Failure modes                     | **Yes**  | The UI may say saved before commit, cleanup may partially fail, authorization may change mid-edit, or an owner outage may make work look releasable.                                                    | Critical | Medium-high | Honest **Saving/Saved/Couldn't save** states, idempotent readback, fail-closed proof, last safe release continuity, bounded quarantine, resumable cleanup, and private operational exceptions.                                                                       |
| Data integrity risks              | **Yes**  | Mutable candidates, duplicate heads, destructive restoration, unprotected source pruning, or concurrent withdrawal/approval could make lineage unreconstructable.                                       | Critical | Medium-high | Immutable candidates and deliberate versions, one unique head, CAS/idempotency, exact digests/references, mutually exclusive command outcomes, reference reproof, and orphan reconciliation.                                                                         |
| Security and privacy risks        | **Yes**  | Sensitive drafts may persist in durable browser storage, logs, analytics, diffs, exports, or former-user sessions; “recoverable” may become indefinite retention.                                       | Critical | Medium-high | No sensitive durable `localStorage`, content-free telemetry, no-store permission-filtered views, current authorization per read, safe actor labels, purpose-owned retention/hold/export/erasure, and minimal tombstones.                                             |
| Scalability and performance risks | **Yes**  | The current 300 ms autosave, row-per-keystroke history, stale-status scans, N+1 proof checks, or synchronous full diffs could exhaust the small Payload pool and grow Postgres dead tuples.             | High     | High        | One overwriteable debounced recovery buffer, bounded maximum/flush, exact-ID/batched owner reads, no scan or per-autosave event, keyset history, bounded scratch cleanup, production load proof, and indexes only for measured query shapes.                         |
| Operational burden                | **Yes**  | Staff may be asked to choose timers, clear flags, reconcile branches, prune versions, or maintain a hidden archive taxonomy.                                                                            | High     | High        | No tenant expiry/retention settings or maintenance queue; automatic fail-closed scratch compaction, source-routed exceptions, and one applicable tenant-visible records policy.                                                                                      |
| Observability gaps                | **Yes**  | Lost saves, CAS conflicts, reference violations, cleanup failure, or divergence between offered and accepted actions may be invisible until work disappears.                                            | High     | Medium      | Content-free metrics and traces for confirmed save failures, conflicts, denial causes, orphan age, cleanup backlog/outcomes, pin violations, resolver latency, and synthetic tenant-isolation probes.                                                                |
| Dependency and integration risks  | **Yes**  | The installed internal Payload prerelease may differ from current documentation or change autosave, restore, lock, or pruning behavior during upgrade.                                                  | Critical | Medium-high | Exact-version adapter contract tests, upgrade certification, explicit configuration, native-control bypass tests, and a fallback deliberate immutable version store inside Payload—not copied content in operational Postgres—if native separation cannot be proved. |
| Migration and upgrade risks       | **Yes**  | Legacy mutable drafts or destructive-delete records may be guessed into active work, while a provider cap may discard valid sources.                                                                    | High     | Medium-high | D21 dry-run census and complete coverage manifest assigning each item exactly one working, open-candidate, reference-only, quarantined-scratch, disposable-unreferenced-scratch, or unknown disposition; no invented actor, reason, or authority.                    |
| Other development hazards         | **Yes**  | Retry may duplicate successors/withdrawal, cleanup may race submission, client clocks may drive age, deployment generations may disagree, or tests may cover only a happy path.                         | Critical | Medium-high | Server time/order, idempotency, expected-generation CAS, reference reproof before cleanup, compatible-generation cutover, property/state/race tests, provider-upgrade tests, accessibility tests, and explicit kill switches.                                        |

Every category has a material concern. That does not justify more durable state;
it justifies tighter ownership, current proof, and better adapter certification.

### Required production proof

The eventual implementation is not acceptable until it proves:

1. D25 creates no authoritative table/status/queue, copied content, raw CMS join,
   per-autosave event, or tenant expiry setting;
2. the exact installed Payload adapter maintains one coalesced recovery buffer,
   never advances the semantic head through autosave, and cannot prune a
   referenced revision, candidate, decision, withdrawal, or release source;
3. current save policy stays within certified write rate, latency, pool,
   table/index growth, dead-tuple, vacuum, and tenant-fairness budgets under
   production-shaped concurrent editing;
4. one resolver and each owning command agree on action-specific authority, and
   every command independently rejects stale, revoked, cross-tenant,
   cross-Page, cross-locale, cross-family, and cross-subject proof;
5. multiple tabs, spouses/teammates, staff edits, head movement, double clicks,
   timeout-after-commit, cleanup races, revocation, Phase 10 tightening, media
   invalidation, retirement, return, and dependency outage never lose work,
   expose protected bytes, or change the last safe release;
6. recovery opens one same-scope successor and then leaves submission/publication
   to the unchanged D4/D5 action; it never restores, merges, submits, or publishes
   implicitly;
7. age alone produces no task, notification, **Needs attention** item, outcome,
   access, or retention decision;
8. reference-aware cleanup is incremental, resumable, idempotent, fail-closed,
   and cannot delete content selected concurrently by a deliberate command;
9. currently unauthorized and former contributors cannot enumerate, preview,
   compare, reuse, export, or infer preserved work, actors, causes, or counts;
10. **Saving…**, **Saved privately**, failure, conflict, review, withdrawal, and
    release copy accurately teaches what happened and what did not happen;
11. representative missionaries, spouses/team contributors, staff reviewers,
    staff editors, one-person tenants, and restricted-worker cases achieve at
    least 90% unassisted completion on save recovery, review, reuse, and
    withdrawal tasks with zero silent overwrite or mistaken-live outcomes;
12. keyboard, screen reader, focus, status announcements, 320-CSS-pixel reflow,
    200% text, 400% zoom, touch targets, forced colors, reduced motion, RTL/CJK,
    and long locales meet WCAG 2.2 AA and Core's accessibility contract; and
13. exact-version provider, state-model, property, race, RLS, authorization,
    migration, cleanup, observability, load, accessibility, and upgrade tests
    pass before production authorization.

### Ruthless synthesis and implementation order

1. Freeze the ownership rule: D25 derives actions over D1/D2/D4/D5/D24 truth;
   it owns no new workflow fact.
2. Specify the finite action resolver and privacy-safe cause catalog, with each
   action's exact source proofs and negative effects.
3. Certify the installed Payload adapter: one recovery slot, bounded coalescing,
   semantic-version immutability, reference closure, cleanup quarantine, and no
   native publish/restore/retention authority.
4. Build expected-generation CAS, idempotent deliberate commands, action-specific
   commit-time reproof, authoritative readback, and reference-safe cleanup before
   exposing recovery controls.
5. Implement the quiet editor and staff states using the existing D4/D5 and D22
   vocabulary, not a D25 screen or settings area.
6. Reconcile legacy drafts and versions through D21's complete manifest without
   one operational row per CMS version or fabricated provenance.
7. Ship only after tenant isolation, restricted-worker privacy, concurrency,
   failure recovery, database load, provider upgrade, usability, mobile, and
   accessibility certification all pass.

Detailed current-repository and primary-source evidence is recorded in
[Phase 22 research evidence §48](./phase-22-public-ministry-pages-research-evidence.md#48-ratified-d25-research--cause-gated-actionability-with-bounded-recoverable-editorial-work).

### Ratification and congruency disposition

The founder explicitly ratified the exact C-prime-R above as **Phase 22 D25** on
2026-08-14. Ratification preserves every D1–D24 authority boundary and adds no
runtime, migration, retention execution, deletion, notification, issue, or
production authority.

- **D21:** legacy census and coverage may classify CMS scratch, deliberate
  revisions, candidates, references, and unknowns, but must not create one
  operational row per autosave/version or fabricate actor, reason, or authority.
- **D22:** age alone is not a Public Page Operational Cause or **Needs
  attention** item. D22 may display only the disposable, permission-filtered
  action evaluation and exact source-owned cause.
- **D24:** one coherent Page-and-locale working head remains binding. D25 adds
  one coalesced recovery buffer beneath that head, never a durable per-actor
  branch, and **Review saved changes** never submits or releases work.
- **D9/Phase 29:** D9 and Phase 29 continue to own Public Ministry Media meaning
  and byte custody. D25 editorial text/version bytes remain private Payload
  content and do not create a Phase 29 editorial-text family.
- **Phase 40:** D25 is deterministic owner-proof composition and bounded
  editorial recovery, not AI stewardship and not a Phase 40 prerequisite.

**Architectural record:**
[ADR-0142](../../adr/0142-derived-editorial-actionability-and-bounded-recovery.md).

D1–D25 are now binding Phase 22 planning truth. The next grill decision must
preserve them without retroactive reinterpretation.

## D26 — Who confirms that the words and images on a public Page may be shared?

**Status:** Founder-ratified on 2026-08-14 as **Phase 22 D26** after selecting
the simple page-level Option A and accepting the following adversarially
hardened A-prime-R as binding Phase 22 planning truth.

> **A-prime-amended-and-hardened (A-prime-R)** — one calm, action-bound Public
> Content Sharing Attestation for each exact immutable Public Content Release
> Candidate: the currently authorized Public Page Contributor or staff actor
> responsible for the words and images they deliberately submit or publish
> sees one plain sentence immediately beside the existing D4/D5 action — **“By
> submitting, you confirm you’re allowed to share the words and images on this
> page publicly.”** or **“By publishing, you confirm you’re allowed to share
> the words and images on this page publicly.”** The existing **Submit for
> review** or **Publish changes** action is the affirmative attestation; upload,
> autosave, preview, recovery, reviewer approval of an unchanged candidate, and
> Page setup are not. Image selection quietly says **“Use a photo you’re
> allowed to share. We remove hidden location and file details before it
> appears publicly.”**, with optional short **Photo sharing tips** for
> recognizable people and children. The immutable candidate records one
> code-owned statement identifier/version, actual actor, server time, exact
> Tenant, Legal Entity, environment, Site, Page Family, Page or independently
> released Ministry Update, locale, candidate identifier and normalized content
> digest, and submit/publish action; the owning release evidence — D2’s Page
> Release Manifest for a Page or D11’s Audience Release Manifest and Release
> Projection for an Update — pins that exact candidate and attestation rather
> than creating a second permission record.
> Any material staff revision is a new D24-attributed candidate and carries the
> same single action-bound confirmation; a clone, import, different scope,
> translation, changed candidate, or later Page release never inherits an old
> attestation. This is the submitter’s recorded confirmation, not verified
> ownership, person-by-person consent, legal advice, staff rights review, or a
> grant of edit or release authority. For Phase 22 only, it is the ordinary
> whole-candidate permission input and narrowly qualifies Phase 10’s earlier
> mandatory `publish_name`/`publish_photo`/`publish_story` checklist: absent
> granular records do not create another Page workflow, while any known direct
> objection, hard `do_not_publish`, restricted-person rule, safety ceiling, or
> stricter current Phase 10 prohibition remains subtractive and non-overridable.
> D1/Phase 12 retain contributor authority; D4/D5 retain candidate and review
> truth; D2 retains Page reach and release truth; D11 retains Update audience
> and projection release truth; D9/Phase 29 retain media sanitization, placement
> withdrawal, and byte custody; and D18 retains adverse-first public
> convergence. A currently assigned contributor may be responsible for content
> they submit, but no “Page owner” role, subject-derived right, or authority over
> another contributor is created — without an extra checkbox, modal, terms
> wall, participant or asset permission matrix, consent database, rights-proof
> upload, expiry or renewal policy, legal-review queue, staff verification task,
> face or child detection, frightening warranty or indemnity language, public
> attestation data, fabricated legacy evidence, admin bypass, or any claim that
> attested, verified, consent-complete, safe, reviewed, approved, released,
> cached, publicly reachable, or still publicly available are the same fact.

### Why the raw Option A needs this small hardening

The founder’s intended experience is correct: one understandable responsibility
checkpoint, not a rights-management product. The unsafe implementation would
be a mutable Page-lifetime `permission_confirmed = true` flag. That flag would
silently float to new images, rewritten stories, translations, clones, staff
edits, and future contributors. Candidate binding preserves the one-step UX
while making the statement describe exact content.

“The user is in charge of their Page” therefore has one precise meaning: a
currently assigned contributor controls preparation of the bounded content they
are authorized to edit and is responsible for what they deliberately submit.
It does not make that person an operational Page owner, reviewer, releaser,
safety authority, Designation owner, or controller of another contributor.

### Quiet interaction contract

| Moment                                           | What appears                                                                                                                                                | What it means                                                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Choose an image                                  | **Use a photo you’re allowed to share. We remove hidden location and file details before it appears publicly.**                                             | Calm just-in-time guidance; it is not an attestation and makes no processing-success claim before D9 succeeds.  |
| Optional help                                    | **Photo sharing tips:** Ask recognizable people before sharing. If a child is shown, ask a parent or guardian. Avoid precise locations or personal details. | Progressive disclosure, not a mandatory wizard or legal warning.                                                |
| Save/autosave/preview/recovery                   | No attestation prompt                                                                                                                                       | Private work does not acquire submission or publication meaning.                                                |
| Review mode                                      | **By submitting, you confirm you’re allowed to share the words and images on this page publicly.** directly beside **Submit for review**                    | The deliberate action freezes the exact candidate and records the attestation.                                  |
| Publish-after-checks mode                        | **By publishing, you confirm you’re allowed to share the words and images on this page publicly.** directly beside **Publish changes**                      | The same action records intent; the owning release command and every current safety proof still decide release. |
| Staff reviews an unchanged contributor candidate | Quiet secondary evidence: **Content sharing confirmed by [actor] · [date]**                                                                                 | Staff editorial approval does not become rights verification and needs no second attestation.                   |
| Staff materially edits content                   | The ordinary D24 successor path, followed by the same action-bound sentence                                                                                 | The staff actor confirms the new exact candidate; the contributor’s earlier attestation does not float.         |
| A concern is reported                            | **Remove from this page** or the existing smallest-scope containment action                                                                                 | D9 or D2/D18 narrows public output first; a corrected successor follows the ordinary path.                      |

The declaration is visible, concise, associated with the consequential action,
keyboard and screen-reader readable, and never hidden only in terms. The button
keeps its literal workflow label; no preselected or separately required
checkbox adds a redundant step.

### Ratified Phase 10 precision amendment

Phase 10 currently proposes granular per-person `publish_name`,
`publish_photo`, and `publish_story` evidence. D5 already rejects exposing that
as a Phase 22 per-person, per-field, or per-asset matrix. If D26 is ratified,
Phase 22 will use the whole-candidate Public Content Sharing Attestation as its
ordinary permission input:

- missing granular records alone do not create a Page checklist, queue, or
  release failure;
- a known person’s direct objection, hard `do_not_publish`, restricted-person
  rule, or stricter current Phase 10 prohibition still blocks or contains the
  exact affected public output;
- Phase 10 continues to own classification, restricted identity, public-safe
  projection, hard safety outcomes, and any separately collected person
  preference; and
- D26 does not abolish or reinterpret granular consent evidence needed by any
  other purpose or jurisdiction.

This is a deliberate narrow qualification, not a claim that a one-line
attestation proves every possible legal basis or third-party permission.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                                                                         | Severity | Likelihood          | Best permanent prevention                                                                                                                                                                                |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**  | A standing Page Boolean can survive changed prose, new images, translation, cloning, reassignment, or a later release and stop describing what was confirmed.                                                                  | High     | High                | Bind the one confirmation to the exact immutable candidate digest and record it through every deliberate submit/publish action with no extra click.                                                      |
| Technical debt                    | **Yes**  | Separate Page, media, Update, review, and staff checkboxes or copied disclosure strings would drift into contradictory rules.                                                                                                  | High     | High                | One code-owned localized statement catalog and one compact candidate evidence shape; reuse the existing candidate/release path and add no D26 table or rights engine.                                    |
| Edge cases                        | **Yes**  | Group photos, children, licensed media, quoted people, AI-assisted prose, translations, imported or cloned Pages, multiple contributors, staff rewrites, and independent Ministry Updates may fall outside an old declaration. | Critical | High                | Cover all words and images in the exact candidate; make every material successor attest through its own final action; retain optional photo tips and current Phase 10/D9 checks.                         |
| Footguns                          | **Yes**  | “I own everything,” a prechecked box, hidden terms, inherited evidence, or an admin bypass can cause accidental agreement or overclaim rights.                                                                                 | High     | High                | Use “allowed to share,” visible beside the final action; no preselection, ownership warranty, inheritance, or alternate public-release path.                                                             |
| Tenant safety                     | **Yes**  | An actor or attestation could be substituted across Tenant, Legal Entity, Site, Page, family, locale, environment, or candidate.                                                                                               | Critical | Medium              | Server-derive complete scope, enforce current D1/Phase 12 authorization and deny-first RLS, bind exact identifiers and digest, and reject all cross-scope reuse.                                         |
| Over-engineering                  | **Yes**  | Hardening can become per-person consent collection, a per-asset licensing graph, evidence uploads, expiry, renewals, reminders, legal rules, or a second approval product.                                                     | High     | High                | Explicitly prohibit them; keep two short pieces of copy and one constant-size fact in the existing command.                                                                                              |
| UX/UI and user friction           | **Yes**  | Repeated modals, checkboxes, legal jargon, scary warnings, or prompts during autosave interrupt writing and train users to click through.                                                                                      | High     | High                | Show one sentence only at the consequential action, one calm upload helper, optional help, no extra step, literal buttons, mobile/reflow/a11y testing, and no approval duplication.                      |
| Hidden coupling                   | **Yes**  | Staff may treat the attestation as Phase 10 consent, D9 media safety, editorial approval, legal verification, or actual release.                                                                                               | Critical | High                | Canonically name it an attestation and preserve separate owner facts, commands, labels, tests, and evidence for safety, media processing, review, and release.                                           |
| Failure modes                     | **Yes**  | The attestation may commit while submission fails, submission may commit without it, or a timeout may make the result ambiguous.                                                                                               | Critical | Medium              | Freeze candidate plus attestation in one idempotent CAS-guarded command with authoritative readback and inspect-before-retry; keep the previous release unchanged on failure.                            |
| Data integrity risks              | **Yes**  | A mutable flag without actor, wording, time, scope, or digest cannot show what was stated and may be applied to the wrong content.                                                                                             | Critical | Medium              | Immutable code-owned statement version, actual actor, server time, complete scope, candidate identifier/digest, and action inside the existing candidate; D2 or D11 pins the candidate.                  |
| Security and privacy risks        | **Yes**  | Attestation logs may expose sensitive Page subjects or prose; a service path may bypass it; confirmation may be mistaken for permission to expose a restricted worker.                                                         | Critical | Medium              | Content-free diagnostics, private permission-filtered evidence, current Phase 10 reproof, no public attestation fields, and only the existing D2 or D11 owning release command may create public truth.  |
| Scalability and performance risks | **Yes**  | Per-person or per-image rights joins can grow with every Page and burden releases and public renders.                                                                                                                          | Medium   | Low after hardening | One constant-size candidate fact, exact indexed command reads, no public-render lookup, no rights graph, and measured release-path load tests.                                                           |
| Operational burden                | **Yes**  | Staff may be forced to chase signatures, review licenses, renew permission, or adjudicate rights for ordinary Pages.                                                                                                           | High     | Medium              | No evidence uploads, renewal jobs, staff verification, or D26 queue; staff review stays editorial and only real reported concerns use existing containment.                                              |
| Observability gaps                | **Yes**  | A bypass or missing statement version may go unnoticed, while raw-content logging creates a new privacy leak.                                                                                                                  | High     | Medium              | Enforce a release invariant and content-free metrics for candidate ID, statement version, operation/result, safe denial cause, and bypass attempts.                                                      |
| Dependency and integration risks  | **Yes**  | Payload Admin/native publish, imports, bulk scripts, AI suggestions, restore, or service-role paths may bypass the attestation.                                                                                                | Critical | High                | Only the D4/D5 candidate and owning D2/D11 release commands carry authority; imports remain private until deliberate submission, AI remains suggestion-only, and bypass tests cover every provider path. |
| Migration and upgrade risks       | **Yes**  | Treating historical live Pages as attested fabricates evidence; blocking every safe legacy release immediately creates needless disruption.                                                                                    | High     | High                | Apply prospectively, record legacy evidence as **not captured**, preserve the current safe release, and require the declaration on the next editorial, cloned, imported, or reach-widening candidate.    |
| Other development hazards         | **Yes**  | Revocation, stale tabs, concurrent staff edits, double submission, statement-version changes, safety tightening, and containment can race final release.                                                                       | Critical | Medium              | Re-prove actor, assignment, current head, candidate, D9 and Phase 10 inside the final CAS; use server time, idempotency, negative race tests, and adverse-first containment.                             |

Every requested category has a concern. The answer is not another workflow; it
is exact candidate binding, one owning command, and honest language.

### Required production proof

The eventual implementation is not acceptable until it proves:

1. no attestation prompt appears on upload, autosave, preview, ordinary save,
   recovery, unchanged staff approval, or Page setup;
2. the disclosure is visible and programmatically associated with the exact
   **Submit for review** or **Publish changes** action without an extra control;
3. one idempotent command freezes exact content and records the statement
   version, actor, server time, complete scope, candidate identifier/digest, and
   action, and authoritative readback resolves timeout-after-commit;
4. changed content, translation, staff revision, clone, import, scope change,
   or new candidate cannot inherit earlier evidence;
5. missing D26 evidence cannot release through Payload Admin, native publish,
   bulk, restore, import, service role, AI, scheduler, or any alternate path;
6. direct objection, `do_not_publish`, restricted-person posture, D9 failure,
   safety tightening, and D18 containment always override the attestation;
7. an unchanged candidate creates no reviewer rights-verification task or
   duplicate attestation, while a material D24 staff successor uses the same
   one-step rule;
8. public rendering performs no rights-graph or attestation lookup and exposes
   no actor, statement, candidate, or diagnostic metadata;
9. legacy releases are never labelled attested without exact evidence, yet the
   last safe release is not removed solely because this prospective evidence
   was not historically captured;
10. content-free telemetry detects missing/bypassed evidence, ambiguous
    outcomes, cross-scope substitution, and containment failure without logging
    prose, media, filenames, people, or sensitive identifiers; and
11. missionaries, spouses/teammates, and staff complete submission or direct
    publication unassisted on mobile and desktop, with zero mistaken ownership,
    verified-rights, staff-approval, or live-publication interpretations, while
    WCAG 2.2 AA keyboard, focus, label/instruction, reflow, zoom, touch-target,
    screen-reader, forced-colors, and localization checks pass.

### Ruthless synthesis and permanent path

1. Freeze the terminology: **Public Content Sharing Attestation**, never Page
   ownership, verified rights, or person consent.
2. Put the one code-owned sentence beside the existing final action and the one
   calm helper beside image selection; add no checkbox or setup screen.
3. Extend the existing immutable candidate shape with the compact attestation
   provenance and have D2 or D11 pin that candidate in its owning release
   evidence; create no D26 table.
4. Apply the rule prospectively and classify legacy evidence honestly rather
   than fabricating it.
5. Narrowly qualify Phase 10 for Phase 22 whole-candidate permission while
   preserving all direct objections, do-not-publish, restricted-person, and
   safety outcomes as non-overridable.
6. Reuse D9/D2/D11/D18 for adverse removal and correction; create no complaint
   or rights-review state machine.
7. Ship only after bypass, tenant isolation, concurrency, failure, migration,
   usability, accessibility, and no-extra-step proof passes.

Detailed current-repository and primary-source evidence is recorded in
[Phase 22 research evidence §49](./phase-22-public-ministry-pages-research-evidence.md#49-ratified-d26-research--one-calm-page-content-sharing-attestation).

### Ratification disposition

The founder explicitly ratified the exact A-prime-R above as **Phase 22 D26** on
2026-08-14. D26 now binds Phase 22 and narrowly qualifies Phase 10 only for the
ordinary whole-candidate permission input described above; known direct
objections, `do_not_publish`, restricted-person rules, stricter current safety
outcomes, and every named owner boundary remain non-overridable. This planning
ratification authorizes no runtime, migration, issue, notification,
legal-policy, or production activation.

### Later D11 audience wording qualification

The ratified Page statement remains unchanged. A Ministry Update uses the same
single action-bound confirmation with code-owned wording that accurately names
its requested D11 audience selection: `in this update publicly` for `Public
page`, `in this update with authorized supporters` for `Supporters`, or `in this
update publicly and with authorized supporters` for `Public page and
supporters`. At Submit or Publish, the statement identifier/version is pinned
atomically to the exact candidate and requested audience selection. If release
later succeeds, D11's Audience Release Manifest pins that candidate, requested
audience selection, and attestation. This qualification adds no tenant-authored
wording, checkbox, modal, second attestation workflow, or pre-created release
truth.

**Architectural record:**
[ADR-0143](../../adr/0143-candidate-bound-public-content-sharing-attestation.md).

D1–D26 were binding Phase 22 planning truth when D27 was presented. The
ratification below adds D27 while preserving every earlier boundary except the
explicit later amendments named in this decision.

## D27 — What shares one Page identity and presentation pattern within one Site across Pages and locales?

**Status:** Ratified and adversarially hardened on 2026-08-14.

### Exact ratified formulation

> **C-prime-amended-and-hardened (C-prime-R) — one Site-scoped Public
> Ministry Page identity per exact typed D17/D19 subject, with one
> tenant-governed current D3 profile head per exact Tenant, Legal Entity,
> environment, Site, and D1 Page Family selecting one immutable Public Page
> Presentation Profile Version shared by every Page and locale in that family,
> while author-written editorial content
> remains independently versioned, reviewed, released, withheld, corrected,
> and retired per exact Page × Phase-24-owned BCP 47 locale. Missionary
> Ministry and Project/Campaign Pages retain their two non-interchangeable D3
> and D20 family patterns, but Phase 22 ships no Page- or locale-specific
> layout fork, layered override, copied profile, or schema variant: one
> Missionary design and one Project/Campaign design govern the Site, and every
> current locale presentation conforms to its family generation. Tenant
> onboarding configures or accepts the accessible built-in family defaults
> once; later presentation changes are authored once, production-shaped
> previewed against representative responsive, long-text, RTL, empty,
> unavailable, media, and safety fixtures, and shadow-compiled in tenant-fair
> chunks against the complete affected current Page × locale cohort: every
> non-retired Page × Phase-24-enabled locale with a current D2 release head in
> that Site and family, regardless of current reach. A compatible change
> activates only through one short CAS-guarded Public Page Family Presentation
> Activation after complete current actor, scope, D2/D3 head, Site × family
> cohort-fence epoch and release-head-set digest, generation, compatibility,
> and coherent-artifact reproof, recomposing every eligible locale at
> once without copied layout JSON, per-Page writes, editorial republication,
> or staff touching each Page; partial family activation is impossible. A
> semantic-exposure, removed-role, cardinality, locale-behavior, media-contract,
> catalog, renderer, or otherwise migration-required change leaves the prior
> family generation live and opens only exact cause-owned exceptions until
> each affected release has one explicit safe mapped, retained, omitted, or
> newly released disposition. A locale with no current release stays absent
> and proves compatibility when first released; an open candidate is
> revalidated under D25 and never rewritten. D2 release-time profile pins
> remain immutable baseline and historical evidence, while the immutable D3
> Presentation Activation Manifest owns current family-profile selection and
> pins the cohort fence, exact release-head-set digest, base and successor
> profile/catalog/renderer generations, artifact digests, actor, time, and
> compatibility result. D18 consumes—never owns—the exact D2 Page × locale
> release plus current D3 activation and D2/Phase-10/D8 admission; the D3 head
> is deliberately a separately current presentation authority but never a
> second content, review, reach, or Page-release authority.**
>
> **The shared Page identity carries Site-scoped operational references; D3
> alone owns shared family structure. Exact subject, contributor assignments,
> Display Participants, D6 progress selection, D7 Giving Binding, D8 lifecycle,
> and other managed facts remain references to their owning phases and are
> neither translated nor copied. Each locale lineage contains its localized
> title, narrative, structured editorial slots, and D9 caption and alternative
> text; D8 route, D4/D5 candidate and review, D26 attestation, D2 release, and
> D14 search/share facts remain independently owner-resolved at exact Page ×
> locale scope rather than becoming lineage authority. A family design action
> may change presentation across **all
> languages**; an editorial action changes **this language** only. Neither a
> source-locale edit nor a profile activation may translate, overwrite,
> submit, attest, approve, release, widen, or silently fall back into another
> locale. `Start from existing language` may create one private target-locale
> draft with exact source Page, locale, revision, and digest provenance, after
> which Phase 24 and, where already certified, D16 may assist; the target still
> receives its own human check and existing release lane. Public projection
> reads always request one exact locale with Payload/provider fallback disabled;
> an absent or ineligible target release stays absent and may only offer an
> explicit link to another independently eligible locale.**
>
> **One quiet UI names the boundary literally: staff see `Page design — all
languages` only in the D23 family settings surface, with exact affected Page
> and language counts, representative preview, `What will change / What will
not change`, and one descriptive activation action; contributors and staff
> edit `Content — this language` through a compact locale selector showing
> `Live`, `Draft`, `In review`, or `Not started`. Single-locale Sites see no
> locale machinery, contributors see tenant-managed structure rather than
> disabled layout controls, and healthy family updates create no task. D8/D14
> continue to provide distinct locale URLs, exact `lang`/`dir`, self-inclusive
> reciprocal eligible alternates, canonical and sitemap truth; D18 keys every
> artifact by exact Page release plus active family generation and applies
> adverse-first convergence. Structurally scoped same-tenant composite keys,
> kind-correct foreign keys, uniqueness, indexed deny-first RLS, explicit
> grants, server-owned commands, one Site × family coordination fence,
> content-addressed activation/impact manifests, short transactions, monotonic
> generations, and old-generation retention prevent
> cross-tenant, cross-Site, cross-family, cross-locale, stale, or half-applied
> presentation—without one universal Missionary/Project template, per-locale
> templates, per-Page profile exceptions, mutable latest rendering, automatic
> translation or publication, live source-locale fallback, cross-Site implicit
> propagation, row-by-row fanout, giant activation transactions, mass manual
> republishing, inheritance or synchronization matrices, provider-native
> publication authority, or any claim that structurally consistent, translated,
> attested, reviewed, released, safe, reachable, indexed, or Giving-ready are
> the same fact.**

**Controlling terminology note:** In the verbatim ratified text above,
`D17/D19 subject` is historical shorthand for D17's exact source-qualified Page
Subject Binding to a Phase-9-owned Ministry Assignment or other eligible source.
D19 owns only the separation and orchestration semantics for participant
association, D1 display/contribution, Phase 12 support access, Phase 21 support
binding, and notifications; it does not own the subject record or join those
authorities.

### Exact interpretation of “one edit across all locales”

The founder's desired simplicity is valid only after separating two actions
that the word “Page edit” otherwise conflates:

| Action                          | Scope                        | Automatic result                                                                          | Result it must never imply                                                           |
| ------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Page design — all languages** | One exact Site × Page Family | One compatible profile generation changes every current Page/locale presentation together | No prose, translation, media meaning, attestation, review, reach, or release changes |
| **Content — this language**     | One exact Page × locale      | One ordinary D1 successor in that locale's sole working lineage                           | No mutation, translation, submission, or publication in another locale               |

Phase 22 therefore has one Missionary pattern and one Project/Campaign pattern
per Site, not one cross-family universal template. The two families may look
related through shared brand and rendering primitives, but their D3 shells and
D20 semantic catalogs remain non-interchangeable.

Structural conformity does not force identical content. A Page may leave an
offered D20 optional section empty, D6 may hide progress, D11 may have no
eligible Updates, and D7 Giving may be unavailable; the shared profile still
owns the same section availability, order, editability, placement, and empty or
unavailable behavior for every Page and locale in that family.

D27 is an explicit later congruency amendment, not merely a narrow UI
qualification:

- **D1/D17:** Page uniqueness excludes locale. One Site-scoped Page has
  subordinate locale editorial lineages; another Site remains another Page.
- **D3/D20:** D3's earlier exact-Page profile exception does not ship, and D20
  cannot create one through optional content. Legacy exceptions receive a D21
  disposition before cutover.
- **D2/D3:** the immutable D2 profile pin becomes release-time baseline and
  compatibility evidence rather than the entire current presentation selector.
  D3's separately current activation head selects the one family profile.
- **D14/D18:** exact public/search/share/cache identity resolves both the D2
  Page × locale release and D3 activation generation. An unknown or mixed pair
  fails closed; D18 consumes both owners and advances neither.
- **D23:** “prospective” still protects all content, reach, and incompatible
  changes, but an explicitly consequence-reviewed compatible family activation
  deliberately recomposes current presentations instead of requiring manual
  Page republication.
- **D4/D5/D26:** a strictly compatible D3 activation creates no candidate,
  content release, translation, or attestation. Turning on never-released
  editorial material, changing a semantic source or locale rule, changing a
  content digest, or requiring new media is migration-required and follows the
  ordinary locale-specific D4/D5/D26/D2 path.

The ratified D2/D3 rule against a new default **silently** rewriting live Pages
therefore remains valid. D27 changes current presentation only through the
explicit, fully proved D3 family activation described here.

### Minimal authority and data contract

- One Page identity is unique within exact Tenant × Legal Entity × environment
  × Site × Page Family × D17 source-qualified subject. Another Site receives another Page
  because branding, host, Giving attribution, route, and publication context
  can differ.
- One subordinate locale identity is unique within exact Page × Phase-24 locale
  and has one coherent D1/D24/D25 working head. Locale identity is not encoded
  in a copied Page, mutable JSON key, title, slug, or provider document status.
- One current D3 profile head is unique within exact Tenant × Legal Entity ×
  environment × Site × Page Family. Locale and Page records reference its
  immutable generations; they never store copied layout configuration.
- One small coordination head/epoch exists at that same Site × family scope.
  Every D2 release-head CAS and D3 family activation locks and re-proves it in a
  consistent order. D2 release change advances its monotonic epoch; D3's
  activation manifest pins the epoch and exact current release-head-set digest.
  A concurrent D2 release or D3 activation makes the stale operation inspect
  current truth and retry rather than switching over an obsolete cohort.
- Same-scope composite foreign keys include Tenant, Legal Entity, environment,
  Site, Page Family, Page, and locale where applicable. Unique constraints
  prevent duplicate current Pages, locale variants, and family heads; foreign-
  key and RLS/filter columns are indexed in their real query order.
- One server-owned profile command derives scope, re-proves current capability,
  base head and catalog/renderer compatibility, prepares a content-addressed
  complete-cohort impact manifest outside the final transaction, then locks the
  coordination head, rechecks its epoch and release-head-set digest, and
  CAS-advances the family-profile head in one short transaction. A timeout uses
  authoritative readback; retry is idempotent. The old generation remains
  available for append-only reactivation and exact historical reconstruction
  from the D2 release plus D3 activation effective at the observation time.
- Anonymous serving reads only D18's privacy-minimized exact-locale projection.
  Contributors read and write only currently assigned locale drafts through the
  domain command. Browser service credentials, stale JWT metadata, Payload
  Local API defaults, raw profile rows, or a CMS locale selector grant nothing.
- Cohort compilation may be chunked and tenant-fair, but activation is all or
  nothing. It creates no per-Page layout updates, durable synchronization queue,
  giant transaction, or ordinary operational task.

### Quiet setup and editing experience

Onboarding shows at most two cards:

```text
Page design

Missionary pages
Standard · applies to every Missionary page and language on this Site
[Preview or change]

Project pages
Standard · applies to every Project page and language on this Site
[Preview or change]
```

The built-in accessible defaults require no forced design step. When staff
change a family, the consequence review says, for example:

> **Applies to 42 Missionary pages across 3 languages on give.hope.org.**
> Page wording, photos, public reach, Giving destinations, and review status
> will not change.

If proof is complete, one literal action such as **Use this Missionary page
design everywhere on this Site** activates the family generation. If proof is
not complete, the action stays unavailable and one exception-first list names
only affected Pages/locales and why. There is no language matrix to approve,
no “sync all” control, and no optimistic success before authoritative readback.

The Page editor labels the current locale using its native name and region when
needed. A compact selector appears only when more than one locale exists.
Structure is presented as **Set by your organization**, not as a forest of
disabled controls. A missing locale offers **Start [language] draft** or, when
appropriate, **Start from [source language]**; neither creates a route or
public fallback.

### Ruthless adversarial review

| Category                          | Concern? | What could go wrong / why it matters                                                                                                                                                                              | Severity | Likelihood             | Best permanent prevention                                                                                                                                                                                                             |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**  | A profile, catalog, renderer, locale, or CMS fallback change can make Pages compile differently or expose the wrong language.                                                                                     | Critical | High                   | Immutable generations, exact compatibility contracts, complete-cohort shadow compile, fallback-disabled public reads, and old-generation retention.                                                                                   |
| Technical debt                    | **Yes**  | Copying layout JSON into every Page/locale or maintaining separate preview/public renderers creates drift and expensive fanout.                                                                                   | High     | High                   | One referenced family profile, one canonical compiler/renderer contract, stable semantic IDs, and no copied or per-locale schema.                                                                                                     |
| Edge cases                        | **Yes**  | Missing locales, empty sections, long translations, RTL, mixed direction, locale additions/removal, restricted subjects, changed media crops, concurrent content releases, and retired Pages can break a rollout. | Critical | High collectively      | Exact state matrix; responsive/RTL/empty/adverse fixtures; generation/CAS reproof; compatibility classifications; and no partial activation.                                                                                          |
| Footguns                          | **Yes**  | “Apply everywhere” can be mistaken for translating or publishing prose; Payload fallback is on by default; a per-Page exception can quietly defeat consistency.                                                   | Critical | High                   | Two literal actions, hard schema separation, no profile exceptions, exact-locale reads with fallback off, and consequence copy that names exclusions.                                                                                 |
| Tenant safety                     | **Yes**  | An omitted Tenant, Legal Entity, Site, family, Page, or locale key can cross-serve content or apply another organization's profile.                                                                               | Critical | Medium-high            | Server-derived complete scope, composite uniqueness/FKs, explicit grants, indexed deny-first RLS, opaque IDs, and hostile cross-scope tests.                                                                                          |
| Over-engineering                  | **Yes**  | Locale inheritance trees, template forks, synchronization rules, translation memory, or a profile DSL would make the simple promise unmaintainable.                                                               | High     | High                   | Exactly two family profile heads per Site, one locale lineage per Page/locale, fixed code-owned catalogs, and no override or sync engine.                                                                                             |
| UX/UI and user friction           | **Yes**  | A locale matrix, repeated per-Page setup, manual republishing, disabled layout fields, or unclear live/draft states would overwhelm staff and missionaries.                                                       | High     | High                   | Hide locale UI for one locale; use two family cards, a compact native-name selector, exact counts/consequences, and exception-only intervention.                                                                                      |
| Hidden coupling                   | **Yes**  | Layout activation can accidentally become editorial release, media admission, SEO, Phase 10, Giving, or translation authority.                                                                                    | Critical | High                   | Typed owners and compatibility classes; D18 exact composite; separate labels/commands/evidence; and ordinary D2 release for any semantic exposure.                                                                                    |
| Failure modes                     | **Yes**  | Compilation may partly fail, the head may switch before artifacts exist, a timeout may be ambiguous, or stale caches may serve the preceding generation.                                                          | Critical | Medium-high            | Build and prove first, one short CAS last, content-addressed coherent availability, authoritative readback, generation-keyed D18 admission, outbox convergence, and no partial success.                                               |
| Data integrity risks              | **Yes**  | Duplicate Page/locale/profile heads, mutable-latest references, stale cohort coverage, or mismatched release/profile pairs can corrupt public truth.                                                              | Critical | Medium                 | Composite constraints, immutable versions, exact coverage digests, current-head CAS, referential integrity, and reconciliation monitors.                                                                                              |
| Security and privacy risks        | **Yes**  | Live locale fallback, stale source text, unsafe alt text, preview leakage, or broad profile access can expose a restricted missionary or precise location.                                                        | Critical | Medium-high            | Phase 10 at every egress, fallback disabled, private target drafts, permission-filtered commands/projections, redacted diagnostics, and adverse-first containment.                                                                    |
| Scalability and performance risks | **Yes**  | Page × locale compilation, row-by-row layout writes, broad invalidation, RLS scans, or a badly designed cohort epoch can overload a tenant or serialize ordinary releases.                                        | High     | Medium-high            | One short coordination lock touched only by D2/D3 head changes and never public reads; one reference switch; chunked tenant-fair compile; no per-Page layout mutation; bounded manifests, indexed filters, and lock/query/load proof. |
| Operational burden                | **Yes**  | Staff may otherwise chase every locale, understand profile generations, repair drift, or republish healthy Pages.                                                                                                 | High     | High without hardening | Automatic compatible recomposition, quiet healthy state, cause-owned exact exceptions, no routine sync queue, and owner-directed repair.                                                                                              |
| Observability gaps                | **Yes**  | Operators may not know which Page/locale failed, whether a mixed generation served, or whether alternates/cache artifacts converged.                                                                              | High     | Medium-high            | Content-free rollout/release/profile IDs, complete coverage counts, safe reason codes, mixed-generation denial, deadline monitors, and residual-only recovery.                                                                        |
| Dependency and integration risks  | **Yes**  | Payload's field-level localization and default fallback, provider status, Next routing, CDN behavior, or crawler interpretation can drift.                                                                        | High     | High                   | Asym-owned release/profile authority, exact adapters and version certification, fallback-off contract tests, distinct locale routes, and honest external-outcome boundaries.                                                          |
| Migration and upgrade risks       | **Yes**  | Legacy per-Page templates, copied locales, arbitrary blocks, and later catalog/schema changes can lose content or strand live Pages.                                                                              | Critical | High                   | D21 census/disposition, dry-run cohort migration, stable role IDs, compatibility adapters, quarantined ambiguity, retained old generation, and no destructive in-place rewrite.                                                       |
| Other development hazards         | **Yes**  | Profile/content races, deployment skew, stale retries, service-role bypass, oversized manifests, or weak rollback tests can produce split-brain presentation.                                                     | Critical | Medium-high            | Consistent lock order, idempotency/CAS/fencing, deployment-generation pins, manifest limits, failure injection, property/race tests, and append-only reactivation of a proved prior generation.                                       |

Every requested category has a concern. The answer is not per-locale layout
freedom; it is one referenced family pattern plus independently safe locale
meaning.

### Required production proof

The eventual implementation is not acceptable until it proves:

1. exactly one current Page exists for each permitted Site × family × subject
   and exactly one locale lineage exists for each Page × enabled locale;
2. exactly one current D3 family profile exists per Site × family and no Page or
   locale override, copied layout, Payload template, or native status can alter
   public structure;
3. public exact-locale reads disable provider fallback for missing, null, empty,
   draft, withdrawn, retired, and ineligible locale content;
4. a compatible profile successor shadow-compiles the complete current cohort,
   prepares every D9/D14/D18 artifact, pins and rechecks the Site × family
   cohort epoch and exact D2 release-head-set digest, switches one family head,
   and never exposes a mixed generation through a concurrent Page release,
   success, timeout, retry, deploy skew, or cache lag;
5. any semantic exposure, incompatible role, locale behavior, media contract,
   or unproved release blocks the whole family switch and preserves the prior
   generation while naming only exact exceptions;
6. a profile activation changes no editorial revision, candidate, D26
   attestation, D4/D5 verdict, D2 reach, D7 Giving, locale route, or source-owned
   managed fact;
7. a source-language edit cannot mutate or publish another locale, while a
   provenance-bound private seed cannot bypass Phase 24, D16, D26, or D4/D5/D2;
8. composite constraints, indexed RLS, current actor/scope reproof, anonymous
   projection isolation, and service-path negative tests reject every
   cross-Tenant, Legal Entity, Site, family, Page, subject, locale, and
   generation substitution;
9. cohort compile and runtime meet production Page/locale scale, Postgres pool,
   latency, WAL, family-coordination lock-contention, cache, and tenant-fair
   backpressure budgets without row-by-row layout fanout or giant activation
   transactions;
10. locale URLs, self-inclusive reciprocal `hreflang`, canonical, sitemap,
    `lang`, `dir`, localized metadata, and explicit language navigation are
    generated only for independently eligible releases; and
11. representative tenant staff and contributors complete onboarding, family
    design change, locale editing, missing-locale start, conflict recovery, and
    exception repair unassisted on mobile and desktop while WCAG 2.2 AA,
    long-text, RTL/LTR, zoom, reflow, keyboard, screen-reader, forced-colors,
    reduced-motion, and no-color-only proof passes.

### Ruthless synthesis and permanent path

1. Freeze the language: **Page design — all languages** is one D3 family
   operation; **Content — this language** is one locale editorial operation.
2. Narrow D3/D20 to exactly one Missionary and one Project/Campaign profile per
   Site, with no Page or locale layout exception in Phase 22.
3. Keep one Site-scoped Page identity and subordinate independent locale
   lineages with complete database constraints and source-owner references.
4. Classify profile changes mechanically as compatible or migration-required;
   only the first may recompose current releases without editorial work.
5. Prepare and certify the whole cohort outside the final transaction, then
   fence and recheck the exact D2 release set and advance one family head through
   a short CAS or keep the old generation live.
6. Disable public CMS fallback and make missing target content honestly absent;
   offer only a private, provenance-bound locale-start aid.
7. Ship the quiet two-card/one-selector UX only after isolation, race, failure,
   migration, scale, SEO, accessibility, and real-user comprehension proof.

Detailed current-repository and primary-source evidence is recorded in
[Phase 22 research evidence §50](./phase-22-public-ministry-pages-research-evidence.md#50-ratified-d27-research--one-family-pattern-with-independent-locale-content).

### Selection disposition

The founder ratified the exact C-prime-R above on 2026-08-14. Phase 22 therefore
has one stable Page-family pattern that requires no per-locale layout
maintenance, combined with independently safe localized meaning. “One edit
across all locales” means one **presentation** edit, never automatic prose
translation or publication.

D27 is binding Phase 22 planning truth and explicitly amends D1/D2/D3/D14/D17/
D18/D20/D23 as described above; it does not silently reinterpret them. Every
unamended D1–D26 boundary remains binding. Ratification authorizes no runtime,
schema, migration, profile activation, issue publication, or production
change. The hard-to-reverse authority decision is recorded in
[ADR-0144](../../adr/0144-site-family-presentation-with-independent-locale-releases.md).

## Phase 22 closure decision — Is D1–D27 complete enough to scope-freeze grooming?

**Status:** Founder-ratified on 2026-08-14 as **Option A — Closure-gated scope
freeze**. D1–D27 are the complete, scope-frozen Phase 22 grooming authority; no
D28 is opened.

### Closure-audit result

The complete decision-area, predecessor-contradiction, required-scenario,
public-egress, state-change failure/recovery, issue-readiness, and stop-condition
passes all succeed at contract level. Every original founder question maps to
D1–D27 or an explicitly preserved owning phase. No engineer is left to invent
Page ownership, public subject or identity, field allow-lists, sharing
attestation, review, progress, checkout, route, retirement, cache, or safety
behavior.

Production evidence remains intentionally incomplete. Cross-tenant isolation,
qualified security/privacy/nonprofit review, accessibility, migration, load,
provider, purge, and failure proof remain release gates for the eventual spec
and tickets; they are not unresolved product choices and ratifying closure
would not authorize implementation or production.

Detailed evidence is recorded in
[Phase 22 research evidence §51](./phase-22-public-ministry-pages-research-evidence.md#51-formal-phase-22-closure-audit--d1d27-are-product-decision-complete).

### Options

- **A — Closure-gated scope freeze — Recommended.** Accept the completed audit,
  freeze D1–D27 as the complete Phase 22 grooming authority, close the grill,
  and permit `/to-spec` only when the founder invokes it explicitly.
- **B — Keep the closure candidate open.** Preserve D1–D27 as binding but do not
  call grooming complete; require the founder to name one suspected gap for a
  focused audit before another decision is opened.
- **C — Open another product decision.** Allowed only if one exact
  Phase-22-owned unresolved behavior is first demonstrated. Continuing merely
  to increase the decision count is rejected.

### Selection disposition

The founder selected **A — Closure-gated scope freeze** on 2026-08-14. The
Phase 22 grill is closed, and D1–D27 remain binding without reopening or
weakening any decision or production gate. Closure itself did not start
`/to-spec` or authorize a PRD/spec, ticket, runtime, schema, migration, issue
publication, or production change. The founder later invoked `/to-spec`; the
linked PRD and OpenSpec change now carry the implementation-ready specification.
That later specification step still authorizes no implementation, migration,
dispatch, deployment, or production activation.
