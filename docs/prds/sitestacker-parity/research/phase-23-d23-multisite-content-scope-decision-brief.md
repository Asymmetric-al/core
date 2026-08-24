# Phase 23 D23 decision brief — multi-site content scope and reuse

**Status:** Founder-ratified and adversarially hardened as **Phase 23 D23
B-prime-R** on 2026-08-23.

**Date:** 2026-08-23

## Decision to make

When one tenant operates more than one Site and wants similar ordinary content
on two Sites, should Phase 23 require staff to recreate it, create an
independent copy, or maintain one live shared source with Site overrides?

This is one decision. It does not reopen the already-ratified Page, locale,
Reusable Section, presentation, folder, Topic, Trash, or release authorities.

## Why this decision is next

The Phase 23 grill prompt requires every content family to have explicit scope,
forbids treating a missing Site as global, and requires host resolution to
identify Tenant and Site before content lookup. D1-D22 settle the component
authorities that this decision must now reconcile:

- [D1](../../../adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
  makes each stable ordinary Page Site-scoped and excludes cross-Site reusable
  content from Phase 23.
- [D8](../../../adr/0152-family-qualified-semantic-reusable-sections.md)
  scopes every Reusable Section to one exact Tenant x environment x Site x
  locale and explicitly forbids cross-Site reuse.
- [D9](../../../adr/0153-certified-site-bound-custom-presentation-packages.md)
  binds presentation packages to one exact environment x Site.
- [D18](../../../adr/0162-purpose-bounded-authority-free-content-library-folders.md),
  [D19](../../../adr/0163-versioned-release-bound-site-topic-profile-and-controlled-topic-sets.md),
  [D20](../../../adr/0164-bounded-personal-and-site-shared-saved-library-views.md),
  and [D21](../../../adr/0165-asym-owned-reference-aware-recoverable-trash.md)
  all retain exact Site scope.
- [D22](../../../adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md)
  gives a Site-scoped ordinary identity sparse exact-locale editorial
  lineages; it does not create cross-Site locale inheritance.
- [Phase 2](../phase-02-site-locale-currency-foundation.md) requires Site to be
  a first-class child of Tenant, requires `site_id` on ordinary CMS content,
  makes Page paths unique per Site, and keeps Media tenant-wide.
- Phase 24 owns the complete staff product for creating and configuring Sites,
  domains, enabled locales, branding, and broader content-sharing controls. D23
  must provide a compatible content contract, not absorb that settings product.

## Current repository facts

The current implementation is still a tenant-only bridge:

- `apps/admin/src/cms/collections/pages.ts` has a required Tenant relationship,
  scalar slug, drafts, and no Site field;
- `apps/admin/payload.config.ts` registers Tenants and Pages but no Sites
  collection and no Payload multi-tenant plugin;
- `apps/admin/src/cms/public/resolve-tenant.ts` deliberately leaves the
  reserved `siteId` seam null until the unified host-to-Site-to-Tenant resolver
  lands; and
- current public reads constrain Tenant and publication state, not the full
  Phase 2 Site contract.

These facts are implementation gaps, not permission to invent nullable or
provider-global content. Phase 2 and D1 remain the target authority.

## Primary-source research

### Payload

Payload's [Multi-Tenant Plugin](https://payloadcms.com/docs/plugins/multi-tenant)
adds one tenant field to selected collections, filters list and relationship
views by the selected tenant, assigns tenants to new documents, and can model
one document per tenant for a collection. The front end still has to query by
that tenant field. It does not define a second nested Site boundary, cross-Site
content ownership, copy semantics, source/override precedence, public release
coordination, or host resolution.

Payload's [database index documentation](https://payloadcms.com/docs/database/indexes)
supports compound indexes. That is useful machinery for enforcing per-Site
path uniqueness, but it does not establish product scope or authorization.
Core's exact internal Payload pin remains a qualified adapter, not the D23
authority.

### Storyblok

Storyblok documents that each
[Space](https://www.storyblok.com/docs/manuals/spaces) stores distinct stories,
blocks, assets, data sources, and configuration. Its guidance says linking
between spaces is not supported; cross-space synchronization uses explicit API
or CLI operations.

Its separate
[Multi-Space Orchestration](https://www.storyblok.com/docs/manuals/multi-space-orchestration)
product supports explicit clone, merge, and overwrite actions. The same
documentation calls out real failure cases: destination slug collisions,
assets that are not copied, and internal links that require related stories to
be cloned or manually repaired. This is strong evidence that cross-site reuse
is a consequential workflow, not a harmless checkbox.

### Contentful

Contentful supports
[cross-space references](https://www.contentful.com/developers/docs/references/content-management-api/cross-space-references/)
through a dedicated `ResourceLink` type, resource identifiers, and allowed
resource validation. Delivery requires additional per-space resolution tokens
and has explicit resolution, caching, rate-limit, and error behavior described
in its [Resource Links API](https://www.contentful.com/developers/docs/references/content-delivery-api/resource-links/).

This proves that live shared content is possible, but also that it creates a
separate identity, authorization, delivery, cache, and failure system.

### Sanity

Sanity's
[cross-dataset references](https://www.sanity.io/docs/studio/cross-dataset-references)
are a distinct enterprise feature. The referenced dataset and types must be
known in schema, GraphQL cannot dereference them, and deletion or missing
targets create explicit editing and publication consequences unless references
are weakened.

This again shows that live cross-boundary references require a substantial,
explicit product contract. They should not be inferred from a nullable Site or
a provider relationship field.

## Named ministry scenario

**Hope Global Missions** operates `hope.org` and a separately branded disaster
response Site at `relief.hope.org`. A communications editor wants to use the
released **How we serve** Page as the starting point for the Relief Site.

The desired ordinary experience is:

1. From **How we serve**, choose **Copy to another Site...**.
2. Select **Relief**, see its domain and target locale, and choose a
   collision-free target path.
3. Review a short consequence summary: editorial content will be copied into
   an independent draft; target-only references need review; nothing will be
   published; later source changes will not synchronize.
4. Select **Create independent draft**.
5. Land in the target editor with a persistent **Relief · relief.hope.org ·
   English (US) · Draft — not live** context and a short repair checklist.
6. Preview and publish only through the Relief Site's own D1 release.

This avoids retyping while preventing an edit on `hope.org` from silently
changing `relief.hope.org`.

## Options

### Option A — Strict Site-local content with manual recreation

Every ordinary content identity belongs to exactly one Site. Staff create a new
Page or Article manually on another Site and may use an Asym Page Starter, but
there is no cross-Site copy action.

**Benefits**

- smallest domain and command surface;
- no live cross-Site dependencies; and
- simple Site isolation and publication reasoning.

**Costs**

- staff retype or manually copy content outside the governed workflow;
- repeated content, links, media, and metadata are more likely to be missed or
  copied incorrectly; and
- it turns an ordinary, safe productivity need into needless work.

### Option B-prime — Exact Site ownership with one-time Copy-to-Site drafts

Every ordinary content identity still belongs to exactly one Site. An
authorized **Copy to another Site...** command creates a new, independent,
private target-Site draft from one exact source revision. It is a governed
starting action, not sharing, inheritance, synchronization, merge, or
overwrite.

**Benefits**

- preserves all settled Site and D1 authority boundaries;
- removes routine staff re-entry and clipboard errors;
- gives reference repair, target scope, and publication consequences a clear
  product home; and
- leaves an additive path to a future separately justified synchronized source
  without prebuilding that subsystem.

**Costs**

- copies may intentionally diverge;
- staff must understand that later changes do not synchronize; and
- target-specific paths, links, Topics, presentation, and public eligibility
  still require review.

### Option C-prime — Live tenant-shared source with Site variants

One tenant-shared source may feed selected Sites. Each Site can pin a source
revision and optionally own locale, content, presentation, or placement
overrides with independent publication.

**Benefits**

- one central edit can update many Sites;
- useful for content that must remain synchronized; and
- supports sophisticated multi-brand governance.

**Costs**

- reopens D1 and D8's ratified exclusion of cross-Site reuse;
- introduces source/consumer identity, precedence, permissions, deletion,
  override, locale, impact, fan-out, partial-release, rollback, and recovery
  semantics;
- makes an ordinary Page editor explain whether each field is inherited,
  overridden, detached, or stale; and
- solves an enterprise content-orchestration problem before ministry demand
  proves it is needed.

## Recommendation

Choose **B-prime**.

It is the smallest complete product that gives ministry staff a genuinely
useful multi-site workflow while preserving the architecture already ratified
through D22. It is not a workaround: exact Site ownership remains the durable
authority, and an independent copy is the permanent correct behavior whenever
two Sites should be free to adapt their wording, brand, routes, and release
timing.

Live synchronized content is a different product. The primary-source evidence
shows that capable CMS vendors implement it with dedicated reference or
distribution machinery and visible failure rules. Phase 23 should not hide
that complexity in one broad `scope` enum, a Site array, or nullable `site_id`.

## Mandatory B-prime riders if selected

### Explicit scope registry, not one universal scope field

| Family                                                                                             | D23 scope treatment                                                                                                                                  |
| -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary Page and Article                                                                          | One required Tenant x environment x Site; locale remains D22's subordinate exact lineage.                                                            |
| Navigation, Reusable Section, Content Library Folder, Topic Profile, Saved Library View, and Trash | Preserve their already-ratified exact Site scopes; never copy implicitly.                                                                            |
| Page Starter                                                                                       | Remains Asym-owned, code-owned, and versioned; application creates fresh Site-local instances.                                                       |
| Presentation Package and Site chrome                                                               | Preserve D9 and Phase 24 Site ownership; never copy with content.                                                                                    |
| Media                                                                                              | Remains tenant-wide under Phase 2; a target draft may retain a reference only after target permission, rendition, rights, and Phase 10 safety proof. |
| Phase 22 specialized content                                                                       | Remains Phase 22-owned and outside D23 ordinary-copy authority.                                                                                      |
| Dynamic or operational source                                                                      | Retains its source owner's scope and lifecycle; D23 copies no operational fact and only revalidates an allowed target reference.                     |

No ordinary record uses missing Site as global, stores an array of selected
Sites, or gains implicit Tenant-wide scope.

### Exact copy command

The command must:

- require source-read and target-create/edit authority;
- require source and target to share exact Tenant and environment while using
  different explicit Site identities;
- bind one exact source identity, locale, immutable revision, schema/catalog
  generation, and idempotency key;
- create a fresh target stable identity, target locale lineage, Page-local
  instance IDs, and independent private revision;
- use expected-revision fencing and one short atomic persistence boundary so
  failure creates no partial target;
- return the same target receipt after a lost response or duplicate retry; and
- retain inert source provenance for audit and support without creating a live
  dependency.

Copy never mutates the source and never permits later source changes to
propagate, merge, or overwrite the target.

### What copies and what does not

**Eligible to copy after validation:** family-compatible editorial content,
compatible typed local blocks, qualified rich text, bounded editorial SEO copy,
and independently safe tenant-wide Media references.

**Materialize or repair:** a D8 Reusable Section becomes fresh Page-local
content in the target; a target author may later deliberately save or select a
target-Site Reusable Section. Same-Site Page references, dynamic-source
bindings, embeds, assets, and locale-dependent facts are revalidated and either
mapped explicitly or shown as repair items. Nothing silently disappears or
falls back.

**Never copy as authority:** source path or placement, Navigation membership,
folder placement, Topic IDs, saved views, active-editor lease, comments,
review/approval, schedule, publication or D1 generation, search/cache/sitemap
state, analytics, Trash/retention state, audit receipts, Site chrome,
presentation package, operational data, or Phase 10/22 eligibility.

The target path is chosen separately and collision-checked under D2. A source
slug may be a visible suggestion, never an authoritative copy. Target SEO and
canonical consequences remain review-required before public release.

### Quiet, unmistakable UX

- Name the action **Copy to another Site...**, not **Share**, **Distribute**, or
  **Sync**.
- Show only Sites the actor may create in, with Site name and primary domain.
- Default only an exact compatible locale; any cross-locale start must use
  D22's explicit translation-start semantics.
- Before creation, state: **Creates an independent draft. Future edits will not
  stay in sync. Nothing will be published.**
- Show a compact **Copies / needs review / not copied** summary.
- After creation, keep Site, domain, locale, and **Draft — not live** visible in
  the editor and preview.
- Show target-specific repair items inline with exact actions; never signal
  success only through a toast.
- Do not launch bulk copy, merge, overwrite, propagation, or recurring sync.

### Public and failure safety

- Public resolution remains host -> Site -> Tenant before any exact-scope
  content query.
- Preview always names Site, domain, locale, and target revision and remains
  private/no-store/noindex.
- The new draft has no public effect until its target Site and locale pass the
  complete D1 release proof.
- Wrong-Tenant, wrong-environment, inactive target Site, disabled locale,
  unauthorized target, stale source, collision, incompatible block,
  unresolved reference, unsafe Media, database failure, and audit failure must
  fail closed with no partial target or false success.
- Observability distinguishes copy validation, commit, reference repair, and
  later target release without exposing content or cross-Tenant identifiers in
  low-cardinality telemetry.

## Founder selection

The founder selected **B-prime** on 2026-08-23. The selection preserves one
exact Site owner for every ordinary content identity and adds one explicit,
one-time productivity operation. It does not yet ratify D23.

## Post-selection primary-source and exact-pin findings

The post-selection review found two provider behaviors that must be made
explicit in B-prime-R:

- Payload's Local API skips access control by default unless the authenticated
  user is supplied and `overrideAccess: false` is set. A server-side location is
  therefore not proof of source- or target-Site authority.
- Payload's generic Duplicate operation is document-shaped: it obtains the
  latest provider version, duplicates provider locales, deep-copies the
  document, removes only selected provider identity fields, and invokes
  `beforeDuplicate`; unique required text defaults can gain `- Copy`. Payload
  exposes `disableDuplicate` and `admin.disableCopyToLocale`, so ordinary Page
  and Article collections can and must suppress those provider actions in
  favor of the Asym command.
- Payload transactions are viable mechanics only when the same request and
  transaction identity are threaded through every awaited nested operation.
  They do not define the copy boundary, idempotency, scope, repair policy, or
  release result.
- Storyblok's current cross-space documentation still calls out slug
  collisions, shared assets that are not cloned, and internal links that need
  explicit repair. Contentful and Sanity still require dedicated cross-boundary
  identity, validation, permission, query, deletion, and failure semantics for
  live reuse. Those are evidence against hiding C-prime inside a nullable Site,
  a Site array, or a generic relationship.

The repo's exact Payload `4.0.0-internal.1f9ae9a` source confirms the same
qualified-adapter boundary. In particular, its generic duplicate path selects
the latest provider collection version; that is not D12's visible acknowledged
working revision and is not D1's exact immutable release authority.

## Ruthless adversarial review

### Brittleness — material concern: yes

- **What could go wrong:** a generic object clone can carry source-Site links,
  Reusable Section identities, block IDs, anchors, locale facts, paths, or stale
  block shapes into a target where they are invalid.
- **Why it matters:** the target may look complete while rendering broken,
  unsafe, or semantically wrong content.
- **Severity / likelihood:** **High / High** without a typed mapper.
- **Evidence:** Storyblok documents clone collisions, uncopied assets, and link
  repair; Core already assigns those facts to different D1-D22 owners.
- **Permanent prevention:** use one code-owned, family- and version-qualified
  transfer manifest. Every field and block must be exhaustively classified as
  **copy**, **materialize/remap**, **review after copying**, or **never copy**;
  an unclassified catalog member fails conformance rather than cloning.

### Technical debt — material concern: yes

- **What could go wrong:** adding `duplicateFromID` to today's tenant-only Pages
  would fossilize the temporary null-`siteId` bridge and spread provider shape
  into domain code.
- **Why it matters:** the later Phase 2/D1 Site retrofit would require a second
  semantics-changing rewrite and could leave tenant-only copies ambiguous.
- **Severity / likelihood:** **Critical / High** if copy ships before Site
  authority.
- **Evidence:** current Pages have a Tenant but no Site; public resolution still
  reserves `siteId: null`, while Phase 2 and D1 require exact Site ownership.
- **Permanent prevention:** make the canonical Site registry,
  host-to-Site-to-Tenant resolution, required Site ownership, per-Site paths,
  and exact-Site authorization hard prerequisites. Expose only a
  provider-neutral Asym command; never ship an interim generic duplicate path.

### Edge cases — material concern: yes

- **What could go wrong:** the visible editor may contain unsaved or conflicted
  work; permission can be revoked while the surface is open; the source can move
  to Trash; the target Site or locale can become inactive; paths can race; block
  generations can diverge; references can disappear; and two Sites can share
  confusingly similar names.
- **Why it matters:** staff could copy the wrong content into the wrong public
  context or receive a draft that cannot safely release.
- **Severity / likelihood:** **High / High** across normal ministry operations.
- **Evidence:** D12 already distinguishes acknowledged revisions and conflicts;
  D2, D21, and D22 independently own paths, Trash, and exact locale lineages.
- **Permanent prevention:** bind preflight to the exact visible acknowledged
  revision and plan digest; block unresolved D12 save/conflict/offline states;
  re-prove every mutable guard at commit; use database uniqueness for path
  races; and show Site name, primary domain, exact locale, source state, and
  target URL throughout.

### Footguns — material concern: yes

- **What could go wrong:** labels such as **Share**, **Sync**, or provider
  **Duplicate** can imply ongoing linkage; automatic target defaults, silent
  path suffixes, copied approvals, or a favorable status can cause accidental
  publication or work in the wrong Site.
- **Why it matters:** a reversible private draft can still waste staff time or
  leak content if its authority is misunderstood.
- **Severity / likelihood:** **High / Medium-high**.
- **Evidence:** capable CMS products distinguish clone, merge, and overwrite;
  Payload separately exposes Duplicate and Copy-to-Locale controls.
- **Permanent prevention:** disable both generic controls for governed ordinary
  content; use only **Copy to another Site...**; require target selection when
  multiple Sites qualify; never overwrite, silently suffix, inherit favorable
  state, or publish; and name the destination in the final action.

### Tenant safety — material concern: yes

- **What could go wrong:** a client-supplied Site, elevated Local API call, broad
  relationship picker, or stale permission snapshot could copy content across
  Tenants/environments or reveal inaccessible Sites and revisions.
- **Why it matters:** that is a cross-tenant confidentiality and integrity
  breach, not an editorial inconvenience.
- **Severity / likelihood:** **Critical / Medium** without exact-scope guards.
- **Evidence:** Payload documents that Local API operations skip access control
  by default; its multi-tenant plugin supplies one tenant dimension, not Core's
  nested Site contract.
- **Permanent prevention:** derive scope server-side; require same exact Tenant
  and environment plus distinct source/target Sites; re-prove exact-source read
  and target-create/edit authority at commit with provider access enabled;
  enforce composite scope integrity and exact-Site query predicates; filter
  choices; and return non-enumerating unavailable results.

### Overengineering — material concern: yes

- **What could go wrong:** a recursive dependency graph, shared-source model,
  bulk distributor, diff/merge engine, overwrite, propagation scheduler, or
  cross-environment transport would quietly recreate C-prime.
- **Why it matters:** ordinary staff would inherit an enterprise content
  orchestration system before measured ministry demand justifies it.
- **Severity / likelihood:** **High / Medium-high** if boundaries remain open.
- **Evidence:** Storyblok, Contentful, and Sanity expose live or distributed
  cross-boundary content as separate products with substantial contracts.
- **Permanent prevention:** ship one Page-or-Article, one source revision, one
  target Site, one private draft. No bulk, recursion, live link, divergence
  dashboard, merge, overwrite, propagation, or cross-environment copy. Phase 30
  remains migration transport; a future synchronized lane requires a new
  founder decision and migration.

### UX/UI and user friction — material concern: yes

- **What could go wrong:** staff may not know what revision is copied, believe
  future changes synchronize, select the wrong similarly named Site, mistake
  copied prose for a translation, or face an opaque technical repair list.
- **Why it matters:** confidence and task completion collapse even if the data
  model is correct.
- **Severity / likelihood:** **High / High**.
- **Evidence:** the named ministry scenario crosses brands, domains, locales,
  paths, and release contexts; W3C requires programmatically determinable
  status feedback without unnecessarily interrupting work.
- **Permanent prevention:** use one responsive dialog/sheet, not a wizard or
  scary legal confirmation. Fix the visible saved source context; show only
  authorized targets with name and domain; preselect only the identical enabled
  locale; show the target domain plus editable address; state the no-sync and
  no-publish consequences; summarize **Ready to copy / Review after copying /
  Stays with Hope**; and land in the target editor with durable context and
  actionable repair links.

### Hidden coupling — material concern: yes

- **What could go wrong:** a `copiedFrom` relationship may become a runtime
  dependency, an implicit propagation seam, or a reason target reads fail when
  the source is deleted, moved, or permissioned differently.
- **Why it matters:** two supposedly independent Sites would share failure and
  lifecycle domains.
- **Severity / likelihood:** **High / Medium**.
- **Evidence:** cross-space products need dedicated resource resolution and
  deletion semantics; B-prime's purpose is deliberate independence.
- **Permanent prevention:** store protected immutable provenance and a receipt,
  not a live content relationship. Editing, preview, release, public reads,
  Trash, and recovery never dereference the source. Source disappearance cannot
  impair the target, and a later C-prime migration may not reinterpret old
  independent copies as synchronized content.

### Failure modes — material concern: yes

- **What could go wrong:** validation can pass and commit can later fail; a
  permission or path can change between them; a transaction can partially
  commit if nested work does not share the request; or a lost response can make
  staff create a second draft.
- **Why it matters:** uncertainty produces duplicates, orphan facts, false
  success, and unsafe manual cleanup.
- **Severity / likelihood:** **Critical / Medium**.
- **Evidence:** Payload explicitly warns that unawaited or differently scoped
  transactional work can return success without a committed result.
- **Permanent prevention:** preflight outside the transaction, then re-prove the
  plan digest and mutable guards inside one short transaction; await and thread
  the same request through identity, locale draft, placement, repair manifest,
  receipt, audit, and transactional outbox writes; roll back all durable facts
  together; keep remote calls outside the transaction; and reconcile uncertain
  responses through the idempotency receipt. A queue or workflow engine is not
  part of this bounded command.

### Data integrity risks — material concern: yes

- **What could go wrong:** retries can create duplicate targets; copied local
  IDs can collide; source IDs can remain in target references; two actors can
  claim the same path; or copy can produce only some required rows.
- **Why it matters:** duplicate or internally inconsistent drafts poison later
  editing, routing, audit, and release proof.
- **Severity / likelihood:** **Critical / Medium**.
- **Evidence:** D1/D2 require stable identities and exact path authority;
  provider deep-copy behavior is not aware of those invariants.
- **Permanent prevention:** create fresh stable, locale-lineage, block, anchor,
  and Page-local IDs; use an authorization-aware idempotency key and unique
  receipt with a canonical request digest; reject reuse of that key with any
  different source, target, locale, path, revision, or option; enforce per-Site
  path uniqueness at the database; use expected-source and catalog fences; and
  distinguish intentional, disclosed repair omissions from any unexpected
  partial write.

### Security and privacy risks — material concern: yes

- **What could go wrong:** a private draft may become visible to target staff
  who should not see it; inaccessible Site names or source titles may leak in
  selectors, provenance, errors, logs, or metrics; copied Media or embeds may
  retain unsafe target use.
- **Why it matters:** ministry content can expose people, locations, identities,
  or operational details.
- **Severity / likelihood:** **Critical / Medium**.
- **Evidence:** Phase 10/22/29 already treat public eligibility and media safety
  as independent current proofs; source publication is not target permission.
- **Permanent prevention:** check exact source revision and target access;
  access-filter provenance; re-prove every retained Media/embed/reference under
  current target policy; copy no Phase 10/22 eligibility; keep content, titles,
  domains, and raw identifiers out of telemetry; and store exact evidence only
  in protected audit records.

### Scalability and performance risks — material concern: yes

- **What could go wrong:** deep population, recursive relationship copying,
  Media-byte duplication, or long transactions can become slow and expensive
  on large Pages and high-copy tenants.
- **Why it matters:** timeouts amplify uncertain retries, locks, and support
  burden.
- **Severity / likelihood:** **Medium-high / Medium**.
- **Evidence:** cross-boundary resolution products expose explicit limits;
  Core's source graph contains independently owned objects.
- **Permanent prevention:** copy one bounded ordinary revision; read
  relationships at depth zero; batch exact validations; reuse qualified
  tenant-wide Media references rather than copying bytes; enforce existing
  family/block/revision bounds; keep commit short; and reject unsupported or
  recursively dependent content with precise preflight guidance rather than
  launching a graph copier.

### Operational burden — material concern: yes

- **What could go wrong:** staff or developers may need recurring cleanup for
  broken target references, mysterious duplicate drafts, stale transfer code,
  or pseudo-sync expectations.
- **Why it matters:** nonprofit teams are small, and copy should remove work
  rather than create a specialist operation.
- **Severity / likelihood:** **Medium-high / Medium**.
- **Evidence:** vendor distribution tooling surfaces dedicated troubleshooting;
  the simple ministry need is a one-time starting point.
- **Permanent prevention:** keep the action occasional and Page-local; generate
  a compact actionable repair projection from the target revision while D1
  recomputes current release blockers; do not create a second task/workflow
  database; reuse D21 Trash for mistaken private drafts; version one transfer
  manifest; expose aggregate health and failure causes; and provide no ongoing
  copy management, sync status, or manual data repair runbook as ordinary
  product behavior.

### Observability gaps — material concern: yes

- **What could go wrong:** operators may not distinguish validation rejection,
  commit failure, lost-response reconciliation, repair debt, or later release;
  conversely detailed telemetry may leak tenant content.
- **Why it matters:** support cannot tell whether a draft exists, and staff may
  retry blindly.
- **Severity / likelihood:** **High / Medium**.
- **Evidence:** B-prime spans a validation stage, an atomic commit, user
  continuation, and a separate D1 release.
- **Permanent prevention:** issue a stable correlation/idempotency receipt;
  record protected exact audit evidence and a transactional outbox with stages
  `validated`, `committed`, `reconciled`, and `released-separately`; publish only
  low-cardinality aggregate failure/latency/repair metrics; and never infer copy
  success from later search, cache, or public availability.

### Dependency and integration risks — material concern: yes

- **What could go wrong:** Payload's duplicate, localization, access, hooks,
  drafts, transactions, or version behavior may change; custom D9 packages may
  carry target-incompatible blocks; external embeds may become unavailable.
- **Why it matters:** provider mechanics could silently redefine a domain
  operation after an upgrade.
- **Severity / likelihood:** **High / Medium-high**.
- **Evidence:** the repo runs an internal Payload 4 pin, while Payload's stock
  duplicate and Copy-to-Locale controls do not implement D1/D22 semantics.
- **Permanent prevention:** place mechanics behind one provider-neutral port;
  set `disableDuplicate` and `admin.disableCopyToLocale`; require target-package
  compatibility declarations; pin and conformance-test Local API access,
  transactions, drafts, hooks, locales, and migrations; and fail closed on an
  unknown block, provider shape, or embed policy.

### Migration and upgrade risks — material concern: yes

- **What could go wrong:** existing tenant-only rows may receive ambiguous Site
  ownership, raw copied JSON may preserve obsolete schema, and rollback may
  strand new target identities or collapse Site distinctions.
- **Why it matters:** copy cannot be trustworthy if the ownership substrate or
  readers are lossy.
- **Severity / likelihood:** **High / Medium**.
- **Evidence:** current implementation is a bridge; the target contract is
  Phase 2/D1 Site scope plus versioned D7/D9/D11/D22 content.
- **Permanent prevention:** use restartable expand, proven one-Site backfill,
  checksum/constraint and shadow-read verification, cutover, then contract;
  enable copy only after Site proof passes; bind source and target catalog
  generations; use deterministic qualified migrators or reject; retain old
  readers; and use forward recovery rather than a lossy down migration.

### Other development hazards — material concern: yes

- **What could go wrong:** time-of-check/time-of-use races, unawaited hooks,
  schema deploy skew, unsafe defaults, incomplete tests, or unclear ownership of
  repair and release can defeat otherwise correct code.
- **Why it matters:** these failures occur at the exact boundary between source
  visibility and target authority.
- **Severity / likelihood:** **High / Medium**.
- **Evidence:** the operation crosses D1, D2, D7-D12, D21-D22, Phase 10, and the
  provider adapter while remaining intentionally small.
- **Permanent prevention:** use explicit ownership, immutable plan/version
  fences, transactional awaited writes, database uniqueness, compatibility
  gates during deploy skew, failpoint tests, hostile cross-scope fixtures,
  rollback/reconciliation tests, and one named owner for the transfer port and
  catalog manifest.

## Ruthless synthesis

### Must be fixed by this decision

1. Preserve required exact Site ownership and prohibit missing/global or
   multi-Site ordinary records.
2. Make the Phase 2/D1 Site substrate a hard prerequisite; do not implement an
   interim tenant-only duplicate.
3. Disable Payload Duplicate and Copy-to-Locale authority and define one
   provider-neutral, exact-revision Asym command.
4. Freeze the exhaustive transfer manifest, explicit never-copy authorities,
   target reference/media validation, and actionable repair semantics.
5. Require exact source and target authorization, an immutable preflight plan,
   one short atomic and idempotent commit, database path uniqueness, protected
   audit evidence, and uncertain-response reconciliation.
6. Keep target state private and adverse-first until its own D1 release, with no
   live source dependency or favorable inherited status.
7. Make the UX one calm surface with unmistakable Site/domain/locale/revision,
   no-sync/no-publish copy, durable destination context, accessible feedback,
   and release-blocking repair actions.

### Address in implementation planning immediately after ratification

- define the Page/Article and D7/D9/D11 block transfer manifest and deterministic
  migrator contract;
- specify the exact command, plan digest, transactional receipt/audit/outbox,
  composite scope constraints, path claim, and authorization-aware idempotency;
- design the provider conformance suite and make native duplicate/localization
  controls impossible at UI and API seams;
- build the hostile tenant, permission-revocation, source-change, path-race,
  schema-skew, reference/media, lost-response, failpoint, and rollback matrix;
  and
- validate the Hope-to-Relief task with representative ministry staff across
  keyboard, screen reader, touch, 320 CSS pixels, 400 percent zoom, long/RTL
  labels, slow network, conflict, collision, repair, and uncertain-response
  scenarios.

### Monitor without building speculative machinery

- copy volume, latency, rejection causes, duplicate-prevention receipts, and
  release-blocking repair rates;
- measured demand for cross-environment transport, bulk distribution, or live
  synchronization; and
- provider upgrade drift and custom-package compatibility failures.

These signals may justify a later decision. They do not authorize C-prime or
make old independent copies live-linked.

## Exact proposed Phase 23 D23 B-prime-R formulation

The founder ratified the following exact formulation as **Phase 23 D23** on
2026-08-23. It is the binding D23 decision boundary.

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

## Decision status

The founder ratified the exact B-prime-R block above as **Phase 23 D23** on
2026-08-23. Ratification establishes planning authority only and authorizes no
implementation, schema, migration, provider adoption, issue publication,
release activation, deployment, or production change.

## Evidence inventory

### Repository and pinned source

- `docs/adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md`
- `docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md`
- `docs/adr/0152-family-qualified-semantic-reusable-sections.md`
- `docs/adr/0153-certified-site-bound-custom-presentation-packages.md`
- `docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md`
- `docs/adr/0165-asym-owned-reference-aware-recoverable-trash.md`
- `docs/adr/0166-bounded-localized-editorial-profile-over-exact-locale-lineages.md`
- `docs/prds/sitestacker-parity/phase-02-site-locale-currency-foundation.md`
- `apps/admin/payload.config.ts`
- `apps/admin/src/cms/collections/pages.ts`
- `apps/admin/src/cms/public/resolve-tenant.ts`
- `packages/api/src/cms/public/context.ts`
- `package.json`
- `vendor/payload-upstream/docs/configuration/collections.mdx`
- `vendor/payload-upstream/docs/database/transactions.mdx`
- `vendor/payload-upstream/docs/hooks/fields.mdx`
- `vendor/payload-upstream/docs/local-api/access-control.mdx`
- `vendor/payload-upstream/docs/versions/drafts.mdx`
- `vendor/payload-upstream/packages/payload/src/collections/operations/duplicate.ts`
- `vendor/payload-upstream/packages/payload/src/duplicateDocument/index.ts`

### Primary external documentation

- [Payload collection configuration](https://payloadcms.com/docs/configuration/collections)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Payload field duplicate hooks](https://payloadcms.com/docs/hooks/fields)
- [Payload drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload multi-tenant plugin](https://payloadcms.com/docs/plugins/multi-tenant)
- [Payload compound indexes](https://payloadcms.com/docs/database/indexes)
- [Storyblok multi-space orchestration](https://www.storyblok.com/docs/manuals/multi-space-orchestration)
- [Contentful cross-space references](https://www.contentful.com/developers/docs/references/content-management-api/cross-space-references/)
- [Contentful resource-link resolution](https://www.contentful.com/developers/docs/references/graphql/resource-links/)
- [Sanity cross-dataset references](https://www.sanity.io/docs/studio/cross-dataset-references)
- [GOV.UK check-answers pattern](https://design-system.service.gov.uk/patterns/check-answers/)
- [GOV.UK confirmation pattern](https://design-system.service.gov.uk/patterns/confirmation-pages/)
- [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)
- [WCAG 2.2](https://www.w3.org/TR/wcag/)
- [W3C status messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)
