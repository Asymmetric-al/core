# ADR-0149: Bounded Public Navigation purpose and item grammar

**Status:** Accepted (founder-ratified Phase 23 D5 B-prime-R, 2026-08-21)

## Context

ADR-0148 separates curated Navigation from Page hierarchy and binds its public
activation to D1's coherent Site generation, but deliberately leaves the
purpose catalog, item grammar, destination behavior, duplicate policy, and
depth unresolved. The existing implementation is tenant-only, unversioned, and
stores raw URLs while Header and Footer facts also exist in static code. A flat
menu would not cover the demonstrated grouped Primary and Footer experiences;
an extensible recursive menu system would create provider, editor, accessibility,
and tenant-safety complexity without a proven workflow.

## Decision

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

## Consequences

- Primary and Footer are the complete Phase 23 Navigation-purpose catalog.
  Legal links remain ordinary Footer content; no Utility purpose is implied.
- Link and Group form a closed structural union. Groups are non-clickable,
  contain terminal Links only, and create at most two visible levels.
- Internal destinations are stable, source-qualified references. Code-owned
  Site destinations stay registered with their owners, and external websites
  are validated absolute HTTPS targets that are never fetched during authoring
  or release.
- One optional Primary action is a semantic role on an ordinary Link. Tenants
  do not author item schemas, device variants, arbitrary styling, or capacity
  rules.
- One authored order and wording drives desktop and mobile; the exact renderer
  owns a versioned, tested capacity envelope.
- The Navigation and Page-aware experiences call one exact-scope,
  current-membership, expected-revision command. A visible picker or Payload
  relationship filter never substitutes for authorization.
- Payload authoring remains private and privileged, so Asym enforces the tenant
  boundary explicitly rather than falsely claiming ordinary RLS protects a
  bypass connection. Deliberately exposed future tables still require grants
  and indexed RLS.
- D1 alone selects and activates exact Navigation revisions. Ordinary failures
  preserve private work and the prior public generation; adverse source truth
  can suppress unsafe output; recovery is forward-only.
- Every legacy Header, CTA, Footer, legal, CMS Navigation, placeholder, and
  public-consumer fact needs an exact migration disposition and one authority
  cutover.

## Rejected alternatives

- a flat-only model unable to represent the demonstrated grouped Header and
  Footer experiences;
- tenant-created purposes, recursive mega menus, menu-to-menu references, or a
  normalized general graph;
- copied managed internal URLs, fake heading links, or one control that both
  navigates and expands;
- separate desktop/mobile authoring, per-item workflow/audience/schedule, or
  arbitrary theme controls;
- Payload-native publication, relationship filters, role strings, or Local API
  defaults as Asym authority;
- direct public authoring-table reads, request-time provider population, or
  synchronous external-link crawling; and
- last-write-wins, CRDT/event-sourcing machinery, dual authority, fuzzy
  migration, partial activation, or destructive rollback.

Ratification of this planning decision authorizes no implementation, schema,
migration, provider adoption, issue publication, release activation, or
production change.

## References

- [Phase 23 D5 decision log](../prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md#d5--two-bounded-public-navigation-purposes-with-link-or-group-composition)
- [Phase 23 D5 research and adversarial evidence](../prds/sitestacker-parity/phase-23-d5-navigation-catalog-and-depth-research-evidence.md)
- [ADR-0148 — Curated Navigation Revisions under coherent Site generations](./0148-curated-navigation-revisions-under-coherent-site-generations.md)
- [ADR-0145 — Page-local composition and coherent Site generations](./0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
