# Phase 23 D15 Content-list curation research

- **Status:** Founder-ratified Phase 23 D15 C-prime-amended-and-hardened
  (C-prime-R) on 2026-08-22.
- **Date:** 2026-08-22
- **Authority:** Research and decision support only. The exact ratified authority
  is preserved in the Phase 23 decision log and ADR-0159. This document does not
  authorize implementation, schema work, migration, provider adoption, issue
  publication, deployment, release activation, or production change.
- **Scope:** How an ordinary staff editor should choose, order, feature, hide,
  review, and recover items inside the D14 **Content list** block.
- **Authority boundary:** This note does not authorize implementation, schema
  changes, migration, provider adoption, issue publication, deployment, or
  release activation. D14, D1, D7-D9, D12, D13, Phase 10, Phase 22, and each
  source-owning phase remain authoritative for the facts they already own.

## Executive finding

The evidence supports three bounded strategies, but not a general collection
builder. The founder-ratified decision is:

> **C-prime-R — one D14 source with exactly three honest curation
> strategies.** **Updates automatically** is the quiet default: it retains D14
> filters, sort, and limit and permits only a bounded, per-list **Hide specific
> items** exception. **Featured first** uses that same active query and permits a
> bounded ordered set of matching item identities to lead the list before the
> deterministic, deduplicated automatic tail. A featured identity never bypasses
> the active filters or current source eligibility. **Choose every item** stores
> one bounded, ordered, duplicate-free set of exact source-item identities and
> uses no query filters, automatic sort, automatic backfill, or cross-source
> membership. All three strategies remain source-safe and release through D1;
> none copies item facts, changes a source record, creates global featured state,
> or overrides publication, lifecycle, Phase 10 safety, Tenant, Site, locale, or
> source authority. D8's Reusable Section revision owns this intent when the leaf
> is shared; otherwise the Page Editorial Revision owns it. D16—not D15—owns any
> later pagination and SEO decision.

This is deliberately simpler than Shopify's new multi-source collection model,
more flexible than Webflow's strict dynamic-versus-curated split, and safer than
WordPress's globally sticky-post convention. It uses Payload relationship and
array mechanics only as possible provider primitives, never as the product
contract or ordinary staff UI.

The important distinction is:

- **Updates automatically** means the D14 query decides membership, after only
  bounded Page- or Reusable-Section-local exclusions.
- **Featured first** changes the order of a bounded subset of items that still
  match that same query; it does not force a nonmatching item into membership.
- **Choose every item** means the owning revision decides the exact stable item
  identities and order.
- Under every strategy, the source owner still decides whether an item is
  currently public, safe, routeable, renderable, and within the active query,
  and it still owns every displayed item fact.

An exact chosen-item list is therefore a stable membership request, not a
frozen copy of titles, images, status, or other content.

## Repository evidence and inherited constraints

### D14 is already the listing authority

The founder-ratified D14 in
`docs/prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md` and
ADR-0158 establishes one provider-neutral, versioned **Dynamic Source Catalog**
and one source-discriminated **Dynamic Content List** D7 leaf. It already owns:

- one source per block;
- source-qualified filters, sort, limit, deterministic ordering, public DTO,
  bounds, cache causes, failure states, migrations, and conformance proof;
- trusted Tenant, environment, Site, locale, audience, publication, and safety
  scope;
- current-public-data preview through the same public-projection seam as the
  public page;
- D1-pinned configuration and compatible generations without freezing matching
  records; and
- immediate source-owned adverse suppression.

D14 explicitly reserves curation and pagination as later typed capabilities.
D15 must extend the D14 selection-intent union with only the three curation
strategies; D16 remains the separate pagination and SEO decision. D15 must not
create a second block, source catalog, query service, public reader, release
head, or copy of operational content. See
[`phase-23-d14-dynamic-source-catalog-research.md`](./phase-23-d14-dynamic-source-catalog-research.md)
and
[`ADR-0158`](../../../adr/0158-versioned-dynamic-source-catalog-and-content-list.md).

### Existing implementation is a seam, not a D15 implementation

- `packages/api/src/cms/public/reader.ts` is the established sole-entry public
  reader contract. Its current `getUpdates` operation accepts only a bounded
  limit; it has no curation contract.
- `apps/admin/src/cms/public/published-content-reader.ts` applies tenant and
  published predicates and `overrideAccess: false`, but the current shared
  `findPublic` helper is not an arbitrary D15 query or reference resolver.
- `packages/api/src/cms/public/context.ts` reserves a Site dimension but does
  not yet carry the complete D14 locale scope.
- `apps/admin/src/cms/collections/page-builders.ts` has a small provider block
  catalog and source-specific validation. It has neither a Content list block
  nor an established content-curation control.
- `packages/api/src/public-giving/types.ts` demonstrates the right public-safe
  projection boundary for operational content.
- Root and admin package manifests currently pin Payload and related packages
  to `4.0.0-internal.1f9ae9a`. That is an internal prerelease, while Phase 23
  still leaves exact Payload qualification open. Current Payload documentation
  is useful evidence, but implementation must certify the exact pinned build
  rather than assume stable-doc parity.

No current runtime seam authorizes raw Payload Admin, a generic `relationship`
field, or browser-submitted item IDs to become D15 product authority.

### Existing workflow and UI constraints

- D12 already owns working revisions, active-editor behavior, conflict
  handling, recovery, and undo. D15 should reuse it instead of adding a second
  lock, checkout, or collaboration engine.
- D1 alone publishes the exact configuration. Choosing, reordering, featuring,
  hiding, or changing strategy remains private until a D1 release.
- A local Content list's Page Editorial Revision owns its curation intent. D8
  is the one ownership exception: when the Content list is the semantic leaf in
  a Reusable Section, the exact Reusable Section revision owns that same intent,
  placements cannot override it, and D1 pins the exact shared revision.
- D9 renders only approved semantic variants from the serialized public view
  model. Curation cannot expose CSS, provider fields, or per-item layout code.
- Ordinary staff work in Web Studio, not raw Payload Admin.
- Repo UI rules require Base UI-based shared controls, Maia/Zinc design tokens,
  explicit labels, keyboard completion, accessible status, mobile reflow, and
  no drag-only interaction.

## Current primary-source product evidence

### Webflow: a clear dynamic-versus-curated split

Webflow's current
[Dynamic vs. curated Collection lists](https://help.webflow.com/hc/en-us/articles/41225336636307-Dynamic-vs-curated-Collection-lists)
documentation makes list type explicit:

- dynamic lists are the default and support filters, sort, pagination, and
  display limits;
- curated lists use searched checkbox selection and an editor-owned order;
- curated lists cannot also use filters, sort, pagination, or display limits;
  and
- a curated selection can reference a non-published item, but only Published or
  Queued to Publish items render on the canvas.

The broader
[Collection list](https://help.webflow.com/hc/en-us/articles/33961294051347-Collection-list)
documentation repeats the two modes and supplies an explicit empty state.
Webflow's
[Multi-reference field](https://help.webflow.com/hc/en-us/articles/33961260360083)
also preserves the order in which referenced items were selected, but removes
filter and sort controls for that referenced list.

**Useful lesson:** make automatic and hand-picked membership visibly different
and do not let a curated list pretend its order still comes from a query.

**Limitation to avoid:** silently allowing non-public selections to disappear
from preview creates an editor/public mismatch. Asym needs an explicit
`Not currently public` resolution state, public-safe omission, and a clear
remove/replace action.

### Shopify: current hybrid inclusion, exclusion, deduplication, and ordering

Shopify's current [Collections](https://help.shopify.com/en/manual/products/collections)
documentation says a new collection model is replacing legacy manual and smart
collections. The new model can combine automatic and manual inclusions and
automatic and manual exclusions.

The current
[Creating collections and adding products](https://help.shopify.com/en/manual/products/collections/create-collection)
documentation adds four particularly relevant semantics:

- the same product added through different sources displays only once;
- manually added products remain members until manually removed;
- exclusions override both manual and automatic inclusions; and
- one collection may combine products, variants, nested collections, and app
  sources.

Its
[Editing collection details and layout](https://help.shopify.com/en/manual/products/collections/collection-layout)
documentation supports automatic sorts and a manual order. Manual reordering
is not drag-only: selected items can also move to the beginning, end, or a
specific position.

Its
[Managing collection sources and conditions](https://help.shopify.com/en/manual/products/collections/manage-sources)
documentation exposes explicit add/remove/change operations and warns staff to
check whether somebody else is editing before making a change.

**Useful lesson:** inclusion, exclusion, final deduplication, and order need one
deterministic algebra, and move-to-position controls help large lists.

**Limits to avoid:** Shopify's multi-source/nested/app model is an eCommerce
catalog product, is currently in a staged transition, and would violate D14's
one-source boundary. Asym should borrow the deterministic semantics, not the
multi-source architecture or its manual concurrency convention. D12 already
provides the stronger conflict/recovery seam.

### WordPress: dynamic queries with sticky and exclusion controls

The current WordPress
[Query Loop block](https://wordpress.org/documentation/article/query-loop-block/)
offers a default or custom query, source-appropriate filters, order, item/page
limits, an offset, pagination, and a no-results state. Its Sticky posts control
offers Include, Exclude, Ignore, and Only.

The current developer
[Query Loop block reference](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-theme/core-block-query/)
shows that the query schema has an `exclude` array as well as a separate sticky
setting.

**Useful lesson:** a small, source-qualified exception control can make an
automatic list practical.

**Limit to avoid:** WordPress sticky state belongs to a post and affects other
queries. Asym should not add an Article-wide `featured` or `sticky` boolean just
to curate one Page block. D15 exceptions must be block-local editorial intent.

### Payload: useful relationship mechanics, insufficient product semantics

Payload's current
[Relationship field](https://payloadcms.com/docs/fields/relationship)
supports `hasMany`, `minRows`, `maxRows`, a sortable Admin presentation,
`allowCreate`, `allowEdit`, and `filterOptions`. Importantly, `filterOptions`
both limits choices in the UI and validates submitted relationships.

Payload's current [Array field](https://payloadcms.com/docs/fields/array)
supports bounded rows, row labels, validation, and an editor order. Payload's
[Indexes](https://payloadcms.com/docs/database/indexes) documentation warns
that `unique` on a field nested in an array creates collection-wide uniqueness;
it does not enforce uniqueness only within one document. Payload recommends
custom array validation for within-document duplicate prevention.

**Useful lesson:** server-side option filtering plus server-side validation,
bounded selection, useful row labels, and ordered arrays are credible provider
primitives.

**Limits to avoid:** Payload drag sorting does not itself meet Asym's keyboard
and single-pointer requirements, and a generic `hasMany` relationship has no
D14 source-contract version, Tenant/Site/locale proof, public eligibility,
mode semantics, final deduplication, or release behavior. The ordinary UI needs
a purpose-built Web Studio control even if Payload stores an adapter form.

### Sanity and Contentful: ordered reference arrays and bounded editing

Sanity's current [Array](https://www.sanity.io/docs/studio/array-type)
documentation defines an array as an ordered list, supports optional sorting
and `Rule.unique()`, and assigns persistent `_key` values to array objects so
collaborative reordering does not cause an edit to target the wrong item.
Sanity's current [Reference](https://www.sanity.io/docs/studio/reference-type)
documentation distinguishes strong references, which prevent deleting a
target, from weak references, which may resolve to missing content.

Contentful's current [References](https://www.contentful.com/help/references/)
documentation supports one-to-many references and reusable content. Its
[Basics FAQ](https://www.contentful.com/help/faq/basics/) says the bulk
reference editor works best for roughly a dozen linked entries and recommends
the default reference UI for larger sets.

**Useful lesson:** an ordered, identity-stable reference set with explicit
duplicate validation is a proven CMS model; large option sets need search and a
bounded editing surface.

**Limit to avoid:** a strong CMS foreign key must not prevent a source-owning
phase from withdrawing or retiring its record. D15 should retain a typed opaque
source identity and resolve it through the source contract, including a
missing/retired disposition, instead of giving the Page destructive lifecycle
control over source content.

## Recommended semantic contract for the decision

### One three-strategy discriminated union, not an optional-field bag

The product-level intent should have exactly one active curation strategy:

```text
selection =
  | automatic {
      d14QueryIntent,
      hiddenItemIds[]
    }
  | featuredFirst {
      d14QueryIntent,
      orderedFeaturedItemIds[],
      hiddenItemIds[]
    }
  | chooseEveryItem {
      orderedItemIds[]
    }
```

All item identities are stable, opaque, source-qualified identities governed
by the exact D14 source contract. The owning Page Editorial Revision—or the
exact D8 Reusable Section revision when shared—does not store raw provider IDs,
titles, routes, images, publication flags, or copied card data.

The D14 descriptor must declare the supported curation capabilities and
production-proved bounds. A source may support only **Updates automatically**,
or it may additionally qualify **Featured first** and/or **Choose every item**.
The UI hides an unsupported strategy rather than showing a disabled generic
control. **Featured first** is a first-class strategy, never a hidden sub-control
inside automatic mode.

### Updates-automatically resolution algebra

For **Updates automatically**, the intended resolution is:

1. Resolve the exact current public-safe candidate universe from the D14 source
   owner and trusted scope, applying the exact active D14 filters and total
   order.
2. Remove the bounded, explicitly hidden identities from this list only.
3. Deduplicate by the source owner's stable identity and take the configured
   final limit. If hidden or currently ineligible records create space, the
   deterministic query continues under a certified bounded-work plan to refill
   up to the limit.

In compact notation:

```text
visible = take(
  limit,
  unique(queryMatches - hidden)
)
```

This is not an authorization formula. `queryMatches` already means current,
public-safe, routeable results that satisfy the active filters under D14 and the
applicable Phase 10/22 authority.

### Featured-first resolution algebra

**Featured first** is the bounded hybrid. It uses the same active D14 query as
**Updates automatically**, then promotes only selected identities that remain
inside that query:

1. Resolve `queryMatches` using the exact active filters and deterministic total
   order.
2. Remove the bounded per-list hidden set.
3. Intersect the ordered featured identities with the remaining current query
   matches. A featured identity that no longer matches a filter, becomes
   unpublished, or is otherwise ineligible is suppressed; it is not force-added.
4. Emit those surviving identities in the stored featured order, then emit the
   remaining query matches in D14 order, excluding identities already emitted.
5. Apply final stable-identity deduplication and the configured final limit.
   Featured identities count toward that limit; the UI prevents configuring
   more featured identities than the limit instead of silently truncating them.

```text
visible = take(
  limit,
  unique(
    orderedFeatured ∩ (queryMatches - hidden) +
    queryMatches - hidden - orderedFeatured
  )
)
```

The picker searches within the active query, and the server re-proves that
membership on save, preview, compile, and render. Changing filters may therefore
make a stored featured identity inactive. The editor retains and labels that
identity for recovery; the public list suppresses it and the automatic tail
fills the remaining capacity. If the same non-terminal identity later matches
again, it can resume its stored featured position.

If a featured item becomes unavailable, it does not reserve a blank slot; the
automatic remainder fills the final `up to N` capacity. If that item later
becomes eligible again under the same non-terminal source identity, it may
return first and the last remainder item may leave. The editor summary and
preview must make this changing-membership consequence clear.

### Choose-every-item resolution algebra

**Choose every item** renders the eligible subset of its exact ordered
identities, once each, in the stored order:

```text
visible = eligible(unique(orderedItemIds))
```

It has no automatic query, filters, automatic sort, backfill, randomization, or
`show all`. Removing or suppressing an item produces a shorter list; the system
never substitutes a different record. Item content remains live and
source-owned. Pagination is not part of D15 under any strategy; D16 decides it
later without changing these membership and ordering semantics.

### Deterministic conflict and duplicate rules

- The item picker prevents choosing an already selected item.
- A source identity cannot appear twice in a chosen list, featured list, or
  hidden set.
- The feature and hidden sets are disjoint. A contradictory import or malformed
  command is rejected; it is not silently normalized into surprising intent.
- A featured identity must be within the active query. A stale stored identity
  is retained with an inactive disposition, but cannot be rendered as an
  out-of-filter exception.
- Final output is still defensively deduplicated by the source owner's stable
  item identity. A duplicate source result emits one cause-owned operational
  exception because it violates the D14 source contract.
- Duplicate titles are allowed. The picker disambiguates them with concise safe
  metadata such as publication date and item type, never by exposing private
  source data.
- Curation is locale- and Site-scoped through the surrounding D1/D14 revision.
  D15 creates no cross-locale alias or fallback rule. Ordinarily the Page
  Editorial Revision owns it; a D8 Reusable Section revision owns it exactly
  when that shared semantic leaf contains the list.

### Item lifecycle and unavailable selections

New selection should default to current public-safe candidates only. A future
source may expose a separately certified future-eligible reference capability,
but staff authentication or D13 scheduling must not manufacture one.

When a previously selected item becomes unavailable:

- the public list omits it immediately under D14 adverse/current-public rules;
- the stored revision retains its stable identity and order for evidence and
  recovery;
- the editor renders an explicit non-sensitive state such as **Not currently
  public**, **No longer available**, or **Needs replacement**, according to the
  source-owner disposition;
- the Page stays intact and the stored selected identity is never silently
  changed; Automatic and Featured-first may refill from their deterministic
  tail, while Choose-every-item deliberately shrinks;
- reappearance is allowed only where the source contract says the same identity
  can legitimately become eligible again; and
- unknown, wrong-source, wrong-Tenant/Site/locale, forged, or unprovable
  identities fail closed and create a private cause-owned exception.

A known same-scope item that is merely not currently public can remain in a
candidate revision only with its omission visible in review and with valid
empty behavior. An unknown or cross-scope reference blocks the candidate
release. The prior active generation remains intact.

## Staff UX/UI recommendation

### Quiet default flow

After D14's source choice, show one labelled control:

**How should items be chosen?**

- **Updates automatically — Recommended**
  _Uses your filters and order. New matching items can appear automatically._
- **Featured first**
  _Choose matching items to show first. The rest continue to update
  automatically._
- **Choose every item**
  _Shows only the items you choose, in the order below._

Do not call the choices `dynamic`, `curated`, `query`, `relationship`, `manual
source`, or `override algebra` in ordinary UI.

For **Updates automatically**, retain D14's simple source-specific filter,
order, and `up to` controls. Put its only exception lane under a closed **Hide
specific items** disclosure. Use a searched chooser plus a bounded selected
list; helper text says each source item remains public elsewhere and that the
automatic query will refill when more matches exist.

For **Featured first**, show the same filter, order, limit, and bounded hide
controls, followed by:

- one primary **Choose featured items** action;
- a searchable, server-paged chooser restricted to items that currently match
  the active filters;
- a short ordered selected list with **Move up**, **Move down**, optional **Move
  to position**, **Preview**, and **Remove** actions; and
- plain helper text: _Featured items must match these filters. If one stops
  matching or is no longer public, it is omitted and another matching item can
  fill the list._

For **Choose every item**, show:

- one primary **Add items** action;
- a searchable, filterable, server-paged chooser showing current eligible
  public-safe candidates;
- selected rows in exact public order, with **Move up**, **Move down**,
  optional **Move to position**, **Preview**, and **Remove** actions;
- optional pointer drag as an enhancement only; and
- a visible selected-count/cap summary.

Use the established product design tokens and shared Base UI primitives. Do not
embed raw Payload Admin or create a desktop-only dual-list transfer widget.

### Collapsed summaries

The block must remain understandable when collapsed:

> Articles · Updates automatically · Newest first · Up to 6 · 1 hidden

or:

> Articles · Featured first · Newest first · Up to 6 · 2 featured · 1 hidden

or:

> Articles · Choose every item · 4 selected · Ordered manually

The preview summary should state current consequences, for example:

> Showing up to 6 public Articles tagged Field Stories. “2024 archive notice”
> is hidden from this list. Previewed from public content at 3:42 PM; matching
> items can change automatically.

For **Featured first**:

> Showing up to 6 public Articles tagged Field Stories. “Grace in Chiang Mai”
> and one other matching Article are shown first. One selected feature no longer
> matches and is omitted; the automatic list fills its place. Previewed from
> public content at 3:42 PM.

For **Choose every item**:

> Showing 3 selected Articles in the order below. Their content and public
> status stay source-owned; unavailable items are omitted, not replaced.

### Strategy changes without lost work

Changing strategy is consequential and must never silently clear
configuration.

- **Updates automatically → Featured first:** retain the exact query and hidden
  set, then open the matching-item chooser. Nothing is featured until selected.
- **Featured first → Updates automatically:** retain the exact query and hidden
  set, name that the featured order will no longer apply, and show the resulting
  preview.
- **Automatic or Featured first → Choose every item:** offer **Use the current
  preview as a starting
  list** or **Start with no items**. The first action stores the exact stable
  identities in the current public preview order at a named freshness
  watermark. It does not copy item fields.
- **Choose every item → Updates automatically or Featured first:** require the
  editor to configure or accept the source default query, name that the exact
  selection and order will no longer control membership, and show the resulting
  public-safe preview. Entering Featured first does not automatically treat all
  formerly chosen items as featured; the editor selects the bounded subset.
- **Every direction:** one consequence dialog names what changes, keeps the old
  owning revision under D12, leaves the live Site unchanged until D1 release,
  and supports undo.
- A source change continues to follow D14's stronger reset/recovery contract;
  item IDs from one source can never be reinterpreted as another source's IDs.

### Empty, partial, and failure states

Keep these states visibly distinct:

- **No items selected** — an editable empty **Choose every item** configuration.
- **No current matches** — a valid automatic query with zero eligible results.
- **Some selected items are not currently public** — partial **Choose every
  item**
  resolution, with the remaining items previewed in order.
- **A featured item no longer matches** — a retained but inactive feature; it is
  omitted and the deterministic automatic tail refills when possible.
- **Source unavailable** — a transport/provider problem, not an empty list.
- **Selection needs attention** — unknown, retired, incompatible, or migrated
  references requiring staff action.
- **Permission changed** — authoring command no longer permitted; saved draft
  remains intact.

Public output uses only the D14-approved empty/omission behavior. Raw provider
errors, private item details, and internal IDs are never public.

## Accessibility and mobile contract

The current W3C
[Dragging Movements guidance](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
requires a non-drag single-pointer alternative. The current WAI-ARIA
[rearrangeable listbox example](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/)
demonstrates explicit Up/Down/Add/Remove actions, focus retention, and live
confirmation, but warns that APG example code is not production-ready and needs
real assistive-technology testing.

The underlying
[Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
also warns that listbox options cannot contain independently interactive links,
buttons, or checkboxes. Therefore:

- use an established accessible search/select or combobox only for choosing an
  available item;
- render chosen items as a semantic ordered list of rows with real labelled
  action buttons, not as interactive controls nested inside `role=option`;
- keep focus on the moved item after reorder and announce, for example,
  **Moved Grace in Chiang Mai to position 2 of 5**;
- after removal, move focus predictably to the next row, previous row, or Add
  items action;
- expose visible labels and concise safe distinguishing metadata;
- do not rely on color, icons, hover, drag handles, or toast-only feedback;
- meet the repo touch-target and 320-CSS-pixel reflow contracts; and
- test keyboard, screen reader, touch, zoom, forced colors, long labels,
  localization, RTL/CJK, and reduced motion with representative users.

The current [USWDS Combo box](https://designsystem.digital.gov/components/combo-box/)
guidance supports type-ahead for more than 15 choices but also reports known
assistive-technology usability concerns and tells implementers to test their
own product. Asym should use its established Base UI primitive and its own
production-shaped accessibility proof, not copy USWDS or invent another
combobox.

W3C's current
[Status Messages guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
requires result, waiting, and error status that does not take focus to be
programmatically determinable. Search should announce settled states such as
**12 items found**, **No matching items**, **Added**, **Removed**, and **Moved**
without announcing every keystroke or becoming chatty.

## Data, security, and runtime implications

### Source and tenant safety

- The server derives Tenant, environment, Site, locale, Page family, source,
  source-contract version, and authoring authority from trusted context.
- Every submitted item identity is independently re-resolved through the exact
  source adapter; appearing in a browser chooser is not authorization.
- Payload actor-scoped Local API calls use `overrideAccess: false`; privileged
  server callers never treat a successful provider lookup as Tenant authority.
  Supabase-backed adapters use least-privilege grants, exact Tenant predicates,
  and applicable indexed RLS. A service-role client is never isolation proof.
- Picker search, selected-item readback, validation, preview, release, and
  public rendering all prove the same scope and item type.
- Wrong-scope and nonexistent identities must produce indistinguishable
  non-sensitive failures to prevent ID enumeration.
- Cache identity includes D14's complete trusted scope and the canonical
  curation intent hash. A selected-ID list or exclusion set is never used as a
  cache key without the Tenant/Site/locale/source dimensions.

### Storage and referential integrity

- Store source-qualified opaque identities and exact ordered intent, not raw
  provider documents or copied presentation facts.
- Do not use a strong cross-domain foreign key that prevents the source owner
  from retiring or withdrawing content.
- If Payload backs an Article selection, `filterOptions` and `maxRows` may help
  the provider adapter, but product validation and D1 compilation remain
  authoritative.
- Enforce duplicate and disjoint-set invariants in the canonical validator,
  command path, and D1 compiler. Do not misapply Payload's nested `unique`
  option.
- Immutable owning revisions make an ordered array acceptable; D12
  expected-head conflict handling prevents concurrent last-write-wins reorder
  loss. D8 shared leaves store the intent only in their exact Reusable Section
  revision, never as diverging per-placement overrides.

### Performance and scale

- Candidate search is server-paged and bounded; never load a tenant's entire
  content catalog into a browser select.
- Resolve a **Choose every item** set in one bounded batch, preserving requested
  order;
  never issue one public query per item.
- Hidden-item and Featured-first resolution must be part of the source adapter
  plan where supported. If a provider cannot express exclusions directly,
  bounded over-fetch may fill the final limit only under a certified
  maximum-work contract. Featured candidates are intersected with the active
  query; they never require a second out-of-query inclusion lane.
- Each source descriptor sets production-proved maximums for exact choices,
  featured identities, and hidden identities. Do not invent one unbounded
  universal cap.
- Automatic result count remains `up to N`; do not run expensive total-count
  queries merely to decorate the editor.
- D15 does not ratify pagination or SEO. D16 must consume the already resolved,
  deduplicated strategy order without changing D15 membership semantics,
  treating stored featured order, automatic tail order, exact selected order,
  and current suppression consistently across page boundaries.

### Observability and recovery

Private telemetry should record only safe identifiers/digests and counts:

- source key and contract version;
- selection mode;
- configured/resolved/suppressed/featured/hidden counts;
- canonical intent digest and owning Page or Reusable Section revision plus
  generation correlation;
- source result state, latency, and exception cause; and
- mode-change, add/remove/reorder, validation, preview, compile, release, and
  recovery outcomes.

Do not log titles, private filter values, raw provider responses, or PII.
Operations must distinguish legitimate empty, intentionally hidden,
not-currently-public, wrong-scope/invalid, incompatible, and provider-failed
results.

## Edge-case matrix

| Scenario                                               | Required outcome                                                                                                                                                                                           |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same item matches the query and is featured            | Render once at its Featured-first position; it counts once toward the final limit.                                                                                                                         |
| Featured identity no longer matches the active filters | Retain and label it as inactive, suppress it publicly, and refill from the deterministic automatic tail; never force it into membership.                                                                   |
| Same item is submitted as featured and hidden          | UI prevents it; server rejects contradictory intent; no silent precedence.                                                                                                                                 |
| Source adapter returns the same stable identity twice  | Render at most once, emit a private contract exception, and fail source conformance proof.                                                                                                                 |
| Featured count exceeds list limit                      | Prevent save/release with an inline error; never silently drop the tail of the featured order.                                                                                                             |
| Hidden items remove most query matches                 | Continue only through bounded source-adapter fill; otherwise show fewer results truthfully.                                                                                                                |
| Chosen item becomes unpublished or safety-restricted   | Immediately omit it publicly, retain the reference and position, show a safe editor disposition, shrink the list, and never auto-replace it.                                                               |
| Unavailable featured item later becomes public again   | It may return first only if the source contract confirms the same non-terminal identity; the automatic tail may change.                                                                                    |
| Source item is permanently retired or deleted          | Preserve a tombstone/disposition where the source supports it; prompt Remove or Replace; public remains safely omitted.                                                                                    |
| Item moved to another Tenant, Site, locale, or source  | Treat as wrong-scope/invalid, never follow or reinterpret it.                                                                                                                                              |
| Two records have the same title                        | Allow both; distinguish with concise safe metadata and stable identity.                                                                                                                                    |
| Editor changes source                                  | Name every curation/filter/presentation reset, confirm, preserve old revision, and never reinterpret IDs.                                                                                                  |
| Editor changes mode                                    | Show before/after preview and exact consequences; preserve D12 recovery and require D1 release.                                                                                                            |
| Two editors reorder concurrently                       | D12 expected-revision conflict; no last-write-wins merge by array index.                                                                                                                                   |
| Item changes while a Page release is prepared          | D1/D14 reproof decides current safety and compatibility; config stays exact, membership remains source-current.                                                                                            |
| Source request times out                               | Preserve the rest of the Page; use D14's safe omission/degraded behavior and a private cause-owned exception.                                                                                              |
| Picker search fails                                    | Keep selected items and unsaved draft intact; show Retry without clearing the query or stealing focus.                                                                                                     |
| Picker returns thousands of matches                    | Server paging/type-ahead and bounded results; no giant DOM list or unbounded download.                                                                                                                     |
| Choose-every-item list resolves to zero visible items  | Show the exact empty preview and configured public empty behavior; do not substitute automatic content.                                                                                                    |
| Automatic query resolves to zero items                 | Distinguish `No current matches` from source failure and from `all matches hidden`.                                                                                                                        |
| Locale has no item variant                             | The source/Phase 24 contract decides fallback or omission; D15 never guesses or crosses locale.                                                                                                            |
| Public route for a selected item changes               | Source-safe route in the current public DTO updates; Page does not store or freeze the old URL.                                                                                                            |
| Import contains duplicate or unknown IDs               | Produce row/identity-specific validation dispositions; never silently discard, merge, or publish them.                                                                                                     |
| Reusable Section contains the list                     | The exact D8 Reusable Section revision—not each Page placement—owns and shares the curation strategy and intent; it does not share or freeze current result membership, and placements cannot override it. |
| Later pagination is requested                          | Defer to D16; D15 exposes only the deterministic resolved order and does not invent page boundaries, counts, URLs, or SEO policy.                                                                          |
| Scheduled Page publication executes later              | D13 re-proves config and current source compatibility; it does not promise the previewed membership will still match.                                                                                      |
| Source safety narrows during cache lifetime            | Adverse invalidation/suppression wins before ordinary cache freshness.                                                                                                                                     |

## Ruthless adversarial review

| Category                          | Concern? | What could go wrong and why it matters                                                                                                                                       | Severity    | Likelihood without controls     | Evidence or reasoning                                                                                                                                      | Permanent prevention                                                                                                                                                                  |
| --------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Brittleness                       | **Yes**  | Raw provider IDs, mutable titles, array indexes, or live `latest` contracts can break selections when content, locale, or provider shape changes.                            | High        | Medium-high                     | Sanity uses persistent array keys; D14 already requires stable identity, exact versions, and deterministic order.                                          | Stable source identities, exact contract versions, immutable revisions, explicit migrations, and retained resolution dispositions.                                                    |
| Technical debt                    | **Yes**  | One block with loosely combined query, choose, feature, hide, order, paging, and provider-specific optional fields becomes an unmaintainable bag with duplicated validation. | High        | High                            | Payload supplies generic arrays and relationships but no D14/D15 product semantics; D14 already rejects a universal optional-field bag.                    | Exactly three discriminated strategies, descriptor-declared capabilities, one canonical validator/compiler, and a shared conformance suite; pagination stays in D16.                  |
| Edge cases                        | **Yes**  | Withdrawn items, duplicate titles, zero results, partial resolution, concurrent edits, source changes, and locale gaps are normal, not exotic.                               | High        | High                            | Webflow documents selected unpublished items not rendering; Shopify specifies exclusion and deduplication precedence.                                      | Closed result states, the edge-case contract above, production-shaped fixtures, and explicit source dispositions.                                                                     |
| Footguns                          | **Yes**  | Silent mode resets, drag-only reorder, contradictory feature/hide state, huge lists, or a global featured flag can surprise staff or alter other Pages.                      | High        | Medium-high                     | Webflow mode conversion discards incompatible settings; WCAG 2.5.7 requires a non-drag alternative.                                                        | Consequence preview/undo, action buttons, disjoint validation, descriptor caps, and block-local intent only.                                                                          |
| Tenant safety                     | **Yes**  | Forged or cached IDs can expose another Tenant, Site, locale, or private source item.                                                                                        | Critical    | Medium without proof            | Payload Local API access can be overridden, and D14 requires every source operation and cache to bind the complete trusted scope.                          | Trusted server scope, per-ID re-resolution, indistinguishable negative responses, complete cache identity, and cross-scope denial tests.                                              |
| Over-engineering                  | **Yes**  | Shopify-like multi-source composition, nested collections, formulas, arbitrary rules, and tenant schemas would duplicate a CMS query platform.                               | High        | High under a “flexibility” goal | Shopify's current collection breadth shows how quickly hybrid curation expands; D14 deliberately permits only one source per Content list.                 | One D14 source, exactly three finite strategies, bounded local exceptions, code-owned capabilities, and explicit non-goals.                                                           |
| UX/UI and user friction           | **Yes**  | Technical language, noisy status, or presenting all three choices as advanced database configuration can make a simple list feel like administration.                        | High        | High                            | Webflow separates modes, WordPress progressively reveals query controls, and W3C requires settled status messages without focus movement.                  | A recommended automatic default, three plain-language strategy choices, controls shown only for the chosen strategy, concise summaries, actual preview, and exception-first guidance. |
| Hidden coupling                   | **Yes**  | Payload relationship fields, WordPress sticky state, or source title/URL snapshots can leak provider or source lifecycle into Page authority.                                | High        | Medium-high                     | WordPress sticky state is record-level; D8, D9, D12, D14, and D16 already divide ownership that D15 must not reinterpret.                                  | Provider-neutral opaque identities, no global item mutation, source-current DTOs, and adapter containment.                                                                            |
| Failure modes                     | **Yes**  | A resolver outage can blank a Page, an unavailable item can masquerade as no matches, or a retry can duplicate output.                                                       | High        | Medium                          | D14 already distinguishes legitimate empty, unavailable, unauthorized, incompatible, and transport failure.                                                | Section-level closed outcomes, safe omission, idempotent reads, stable dedupe, preserved configuration, and cause-owned exceptions.                                                   |
| Data integrity risks              | **Yes**  | Duplicate IDs, feature/hide overlap, order loss, silent truncation, or an incorrect `unique` index can corrupt editorial intent.                                             | High        | Medium-high                     | Payload warns that uniqueness inside arrays needs purpose-specific validation; Shopify explicitly deduplicates and gives exclusion precedence.             | UI prevention plus server/compiler validation, immutable ordered intent, no silent clamping, and provider-correct uniqueness design.                                                  |
| Security and privacy risks        | **Yes**  | Picker search or validation can enumerate private records or leak titles/status across scope; logs can retain sensitive values.                                              | Critical    | Medium                          | D14's public-safe preview boundary and Phase 10 firewall prohibit staff privilege from widening what the list can expose.                                  | Public-safe candidate projection, least privilege, non-sensitive errors, authorization on every read/write, and PII-minimized telemetry.                                              |
| Scalability and performance risks | **Yes**  | N+1 resolution, giant selects, unbounded exclusions, deep Payload population, or costly counts can fail on large tenants.                                                    | High        | Medium-high                     | Contentful recommends a different editor for larger reference sets; Payload exposes bounded arrays and selective query controls; D14 requires cost limits. | Bounded batch resolution, server paging, exact projection/depth, descriptor caps, indexed plans, and count avoidance.                                                                 |
| Operational burden                | **Yes**  | Staff may need to babysit stale featured/chosen items or developers may manually repair provider references.                                                                 | Medium-high | Medium                          | Dynamic source membership legitimately changes without a Page edit, so treating every change as an incident would create routine toil.                     | Automatic default, quiet grouped exceptions, Remove/Replace actions, explicit migrations, source tombstones, and self-serve recovery.                                                 |
| Observability gaps                | **Yes**  | Without mode/resolution/suppression data, support cannot tell an intentional empty list from a provider failure or safety withdrawal.                                        | High        | High                            | Three strategies have several legitimate omission causes that produce the same empty public shape without private reason codes.                            | Structured closed result telemetry, correlation/digests, safe counts, owner/cause/next action, and public/private separation.                                                         |
| Dependency and integration risks  | **Yes**  | Payload is currently an internal v4 build; Webflow/Shopify/WordPress semantics are comparisons, not APIs Asym controls.                                                      | High        | Medium                          | The repo pins `4.0.0-internal.1f9ae9a`, while official Payload docs describe general primitives rather than that build's certified D15 behavior.           | Exact Payload qualification, adapter contracts and conformance tests, no runtime dependency on comparator behavior, and capability-honest UI.                                         |
| Migration and upgrade risks       | **Yes**  | Provider-native relationship arrays or unversioned booleans can become unreadable after source, schema, or mode evolution.                                                   | High        | Medium                          | D14 already pins source-contract versions and forbids read-time reinterpretation; retained D1 generations require old semantics to remain readable.        | Semantic export, exact versions, successor drafts, retained adapters, per-ID dispositions, and no read-time mutation.                                                                 |
| Other development hazards         | **Yes**  | Array-index patches, source changes during release, blind retries, weak rollback, or missing accessibility tests can produce wrong order or lost work.                       | High        | Medium-high                     | Sanity's stable array keys and D12/D1 expected-revision/CAS contracts address realistic reorder and release races.                                         | Stable identity commands, D12/D1 CAS, idempotency, inspect-before-retry, immutable recovery, and manual plus automated accessibility proof.                                           |

## Options for the founder decision

### Option A — Automatic lists only

Keep D14 filters, order, and limit with no explicit curation.

- **Benefit:** smallest implementation and mental model.
- **Cost:** staff cannot create a testimonial/resource lineup, keep one annual
  item first, or suppress a one-off mismatch without changing source facts.
- **Risk:** teams create fake tags, dates, or global `featured` fields to work
  around the gap, coupling one Page's need to every other consumer.

### Option B — Strict Automatic or Choose-every-item strategies

Adopt the Webflow split: automatic query or exact ordered items, never both.

- **Benefit:** exceptionally clear semantics and simple public resolution.
- **Cost:** common “latest items, except feature this one and hide that one”
  cases require converting the whole list to exact choices, after which it stops
  admitting new matches.
- **Risk:** staff duplicate blocks or abandon automatic updates for one small
  exception.

### Option C-prime — Exactly three bounded curation strategies — Recommended

Offer exactly **Updates automatically**, **Featured first**, and **Choose every
item**. Automatic uses D14 filters/sort/limit plus only bounded per-list
exclusions. Featured first uses the same active query and exclusions, promotes a
bounded ordered subset of matching identities, and then fills from the
deterministic deduplicated query tail. Choose every item uses only a bounded
exact ordered set. Featured first is a distinct strategy, not a disclosure
inside automatic; it cannot admit an item outside the active filters.

- **Benefit:** preserves a quiet automatic default, makes the common
  “keep these matching stories first, then stay current” intent explicit, and
  supports exact curated campaigns without adding sources or a query language.
- **Cost:** requires one deterministic resolver, duplicate/conflict proof, mode
  conversion UX, and a stronger test matrix.
- **Why it wins:** Webflow proves the value of honest modes; Shopify proves
  deterministic include/exclude/dedupe; WordPress proves the need for bounded
  exceptions; Payload/Sanity prove ordered validated references. The proposed
  shape takes the useful intersection while rejecting their provider-specific
  coupling and excess breadth.

### Option D — General multi-source collection composition

Allow unions, nested lists, multiple source families, Boolean rules, and manual
exceptions in one block.

- **Benefit:** maximum theoretical flexibility.
- **Cost:** becomes a second query/CMS product, complicates Tenant safety,
  ordering, dedupe, pagination, caching, permissions, migration, and UX.
- **Risk:** directly contradicts D14's one-source, source-owned contract and is
  not justified for ordinary nonprofit Site staff.

## Ruthless synthesis and build-order implications

The founder-ratified permanent path is:

1. **Freeze terminology and ownership first.** One D14 Content list and exactly
   three strategies. A local Page Editorial Revision owns only the strategy and
   editorial membership intent; D8's exact Reusable Section revision is the one
   shared-leaf ownership exception. The source owner owns item truth, active
   filter membership, and current eligibility; D1 owns release.
2. **Extend the D14 descriptor and discriminated schema.** Declare supported
   curation capabilities, stable identity, caps, resolution dispositions, and
   migration behavior. Do not add provider fields to the semantic object.
3. **Specify the deterministic resolver.** Make active-filter intersection,
   final limit, feature order, hide behavior, dedupe, automatic/hybrid refill,
   exact-choice shrinkage, unavailable-item behavior, and batch resolution
   testable before UI work.
4. **Prove Article as the tracer.** Use current public-safe Article candidates,
   exact Tenant/Site/locale scope, batch resolution, and no N+1 queries. Other
   sources qualify independently through D14.
5. **Build the quiet editor on the public seam.** Automatic default, three
   plain-language choices, only strategy-relevant controls, searched Add items
   flows, semantic selected rows, actual public-safe preview, and D12 recovery.
6. **Prove accessibility before shipping.** Keyboard and single-pointer
   reorder, focus restoration, status announcements, mobile reflow, touch,
   screen-reader testing, and axe as supporting—not sufficient—evidence.
7. **Prove adversarial boundaries.** Cross-Tenant/Site/locale denial, forged
   IDs, duplicates, contradictory sets, concurrent editors, source withdrawal,
   outage, cache isolation, migration, and rollback.
8. **Keep pagination separate.** D15 defines membership and order only. D16
   consumes that order and cannot reinterpret it.

This creates meaningful tenant flexibility without burdening ordinary staff or
turning Asym into a provider-specific query builder.

## Required proof for an eventual specification

1. The stored value is one source-discriminated, three-strategy-discriminated,
   versioned, canonical intent; unknown strategies, fields, versions, and item
   roles fail closed.
2. Automatic default, automatic with exclusions, Featured first with and
   without exclusions, and Choose every item each have independently
   verifiable happy-path tests. No fourth combination or implicit hybrid is
   accepted.
3. Active-filter membership, feature order, D14 remainder order, final limit,
   final stable-identity dedupe, automatic/hybrid refill, exact-choice shrinkage,
   and unavailable-item behavior are deterministic under ties and source
   changes.
4. Duplicate IDs, feature/hide overlap, excessive selections, unknown IDs,
   wrong source, and wrong Tenant/Site/locale are rejected at command and D1
   compile boundaries.
5. Picker, validation, preview, compiler, and public rendering use the same
   exact source contract and scope; staff access never expands public preview.
6. Strategy/source changes preserve the prior owning revision, explain resets,
   preserve D8 shared ownership, preview the successor, require explicit
   confirmation, and support undo.
7. Withdrawal, retirement, deletion, republish, route change, title collision,
   missing locale, and source outage preserve safe public behavior and clear
   editor dispositions.
8. Choose-every-item resolution is one bounded batch; automatic exclusions and
   Featured-first promotion do not create N+1 reads or unbounded over-fetch;
   production query plans and latency meet the D14 descriptor budget.
9. Two-editor reorder/add/remove conflicts use D12/D1 expected revision and
   never apply stale array indexes to a different item.
10. Keyboard, focus, screen reader, touch, 320-pixel reflow, zoom, forced
    colors, long labels, localization, RTL/CJK, and reduced-motion behavior pass
    manual and automated production-shaped testing.
11. Telemetry distinguishes empty, hidden, unavailable, invalid, incompatible,
    and failed states without storing item titles, private filters, raw provider
    records, or PII.
12. Export/migration retains the exact strategy, ordered identities, exception
    roles, owning Page or Reusable Section revision, source contract, versions,
    dispositions, and attributable successor-draft history without read-time
    mutation.
13. D16 pagination conformance consumes D15's deterministic resolved order and
    cannot change filtering, feature precedence, exclusions, deduplication,
    suppression, or exact-choice membership.

## Explicit non-goals and limits

D15 does not create or ratify:

- multiple source families in one list;
- nested collections, joins, recommendations, personalization, or AI-selected
  membership;
- arbitrary Boolean groups, formulas, SQL, GraphQL, GROQ, raw Payload `Where`,
  raw JSON operators, or tenant-authored fields;
- a global Article/Missionary/Project `featured` or `hidden` flag for Page-local
  curation;
- item-content snapshots, copied routes, copied media, or Page-owned source
  publication;
- selecting private or draft operational facts merely because the staff user
  can access them elsewhere;
- strong cross-domain deletion locks;
- unbounded selected/excluded lists, `show all`, random order, drag-only
  controls, silent clamping, or silent mode/source resets;
- dynamic-list pagination, SEO, public search, taxonomy, recommendation, or
  source scheduling policy; or
- a claim that Payload, Webflow, Shopify, WordPress, Sanity, or Contentful
  behavior is itself Asym product authority.

## Primary sources reviewed

All sources were accessed on 2026-08-22.

### CMS and commerce products

- Webflow Help Center,
  [Dynamic vs. curated Collection lists](https://help.webflow.com/hc/en-us/articles/41225336636307-Dynamic-vs-curated-Collection-lists)
- Webflow Help Center,
  [Collection list](https://help.webflow.com/hc/en-us/articles/33961294051347-Collection-list)
- Webflow Help Center,
  [Multi-reference field](https://help.webflow.com/hc/en-us/articles/33961260360083)
- Shopify Help Center,
  [Collections](https://help.shopify.com/en/manual/products/collections)
- Shopify Help Center,
  [Creating collections and adding products](https://help.shopify.com/en/manual/products/collections/create-collection)
- Shopify Help Center,
  [Managing collection sources and conditions](https://help.shopify.com/en/manual/products/collections/manage-sources)
- Shopify Help Center,
  [Editing collection details and layout](https://help.shopify.com/en/manual/products/collections/collection-layout)
- WordPress.org,
  [Query Loop block](https://wordpress.org/documentation/article/query-loop-block/)
- WordPress Developer Resources,
  [Query Loop block reference](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/core-blocks-theme/core-block-query/)
- Payload,
  [Relationship field](https://payloadcms.com/docs/fields/relationship)
- Payload,
  [Array field](https://payloadcms.com/docs/fields/array)
- Payload,
  [Indexes](https://payloadcms.com/docs/database/indexes)
- Payload,
  [Local API access control](https://payloadcms.com/docs/local-api/access-control)
- Supabase,
  [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Sanity,
  [Array](https://www.sanity.io/docs/studio/array-type)
- Sanity,
  [Reference](https://www.sanity.io/docs/studio/reference-type)
- Contentful,
  [References](https://www.contentful.com/help/references/)
- Contentful,
  [Basics FAQ](https://www.contentful.com/help/faq/basics/)

### Accessibility and interaction guidance

- W3C WAI,
  [Understanding SC 2.5.7: Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
- W3C WAI-ARIA APG,
  [Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- W3C WAI-ARIA APG,
  [Example Listboxes with Rearrangeable Options](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/)
- W3C WAI,
  [Understanding SC 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- U.S. Web Design System,
  [Combo box](https://designsystem.digital.gov/components/combo-box/)

## Research-method note

The repo-required Nia workflow was attempted first. Resource listing returned
404 errors, and the repo-scoped semantic query returned only generic/stale repo
entrypoints rather than the current Phase 23 decision files. This note therefore
uses direct reads from the isolated current Phase 23 worktree for repository
truth and current official first-party documentation for comparator behavior.
No community post, reseller summary, search-result page, or model recollection
is treated as authority.
