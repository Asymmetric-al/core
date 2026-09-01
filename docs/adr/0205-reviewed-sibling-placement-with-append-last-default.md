# ADR-0205: Preserve reviewed sibling placement or append the new Page last

**Status:** Accepted (founder-ratified Phase 24 D84, 2026-09-01)

## Context

D80-D83 create one fresh private target Page when a material-purpose candidate
cannot continue through the source Page identity. The target already needs a
D2-owned Parent Page, local web-address segment, and sibling order. D84 decides
how that initial sibling position is chosen without turning a rare handoff into
another mandatory ordering workflow.

The founder selected **preserve an explicit valid position; otherwise append
last**. The outcome is good, but the unqualified phrase “explicit position” is
unsafe. Proposed ADR-0146 and the proposed Web Studio D2 requirement say that a
Page Placement Revision owns sibling order; neither distinguishes a deliberate
staff choice from a creation default, imported sequence, migration result, or
provider rank. Current `develop` has no Site/locale Placement lineage or Page
sibling order at all.

Current CMS practice supports ordered hierarchical content. Payload exposes
fractional order keys; Craft exposes explicitly ordered structures; WordPress
keeps parent and Page order separate from Navigation; and Umbraco appends new
Pages then offers a later sorting action. Those products do not define Core's
material-purpose handoff or prove staff intent. Figma's production account of
fractional indexing also shows why an order token is only an implementation
primitive: concurrent inserts can target the same gap and the authoritative
server must assign a unique result.

The permanent decision therefore preserves only authenticated semantic
placement provenance already owned by D2. It never infers intent from a stored
rank or imports a provider ordering endpoint as product authority.

## Decision

### Reviewed Sibling Placement

**Reviewed Sibling Placement** is one D2-authenticated semantic placement input
for a Page in one exact sibling cohort. The staff choice is either an eligible
Parent Page or **Top level**. D2 resolves **Top level** from trusted Site context
to the existing Site-root placement owner/root Page before planning; a caller-
supplied or nullable parent never means top level. The placement is either:

- explicit **start**, represented by one successor Page identity;
- explicit **between**, represented by predecessor and successor Page
  identities;
- explicit **end**, represented by one predecessor Page identity;
- explicit **only**, represented by a tagged empty-cohort boundary; or
- the ordinary default **append last**.

Explicit start, between, end, and only provenance names stable Page identities
where applicable and comes from the immutable D2 placement-command receipt/
provenance for the exact
acknowledged source Placement candidate. The receipt/provenance records the
exact resolved parent/root placement owner, staff-visible Parent Page or Top-
level choice, closed semantic-boundary kind, applicable neighbor identities,
D2 ordering-contract version, expected semantic fence, actor attribution, and
source Placement revision. Boundary kinds are tagged; a null anchor or parent
never means start, end, only, top level, or missing data. This is an extension
of the existing D2 command evidence, not a new mutable Page flag, current-state
head, History axis, workflow, or ordering service.

A numeric index, array position, title, timestamp, provider order token,
Payload drag result, current sorted row, import order, migration guess, or
browser telemetry is never proof of explicit placement. **Append last** is
available only when D2 provenance positively records that ordinary default or
that no explicit sibling position was chosen. Missing, legacy, unreadable,
contradictory, or corrupt provenance is neither explicit placement nor a known
default: it blocks the handoff and uses the existing D2 position review.

### Validate both dispositions against one final handoff topology

D2 locks/fences the relevant owners, determines the exact qualified D81/D82/D83
successor-effect manifest, and derives the sibling cohort represented by those
post-clean current heads before inserting the fresh target. Both an explicit
boundary and append-last use that one final baseline. Physical SQL write order
may differ only when the transaction proves the identical final semantic
state. The explicit placement is valid only when:

1. the target, resolved parent/root owner, source candidate, and every anchor
   share the exact Tenant, environment, Site, and locale;
2. the selected Parent Page or trusted Top-level mapping is still the reviewed
   choice and remains eligible;
3. each named anchor is a current stable Page in that final parent cohort;
4. a **between** pair is still adjacent, **start** still names the first
   successor, **end** still names the last predecessor, or **only** still names
   an empty cohort;
5. source cleanup does not restore the source Page inside the proposed gap;
6. current target Placement authority and every required structural read are
   reauthorized; and
7. the D2 order contract and applicable expected state remain compatible.

An unrelated title edit or sibling change outside the exact gap does not
invalidate the semantic placement. D2 may refresh non-authoritative labels or
a coarse dependency digest without staff re-review when the exact resolved
parent/root owner, anchors, adjacency/boundary, scope, and outcome remain
identical. A deletion,
Trash transition, reparent, inserted sibling inside the gap, changed boundary,
permission loss, incompatible Placement head, or source restoration inside the
gap makes the explicit plan stale.

A stale explicit placement never silently becomes append-last. The handoff
remains uncommitted, shows the current position consequence, and uses the
existing D2 Page-tree position action for review.

### Append-last is semantic, not a frozen tail ID

When qualified D2 provenance positively records the ordinary default, the
sealed command carries the semantic mode **append last**. After deriving the
same post-D81/D82/D83 final baseline, D2 resolves its current tail under the
authoritative parent/order transaction and creates the target after it. An
empty cohort produces **Only Page under `<Parent>`** or **Only Page at top
level**.

The default does not bind staff to a tail Page that happened to exist during
preflight. Harmless tail changes may be reconciled without another human
decision because the reviewed outcome remains **Last under `<Parent>`** or
**Last at top level**. Two concurrent appenders serialize; each target is
appended at its own commit. D84 does not promise that either Page remains last
after later authorized work.

### Fresh target position; no source or provider-value transfer

D2 generates a fresh target sibling-order value inside the authoritative
transaction. It never copies, reassigns, or derives authority from the source
Page's value or from caller-supplied provider data. No immutable pre-existing
revision is mutated. Only exact owner-qualified D81/D82/D83 effects in the
sealed manifest may advance an affected head or change its source-clean/derived
state; every Page outside that manifest retains its parent and order. D84 then
preserves the relative order of all pre-existing members in that final cohort,
causes no additional source/descendant write, and adds only the fresh target
Placement/order effect.

Reviewed boundary identities remain minimized, bounded command/receipt
provenance after commit. They are not continuing foreign-key, synchronization,
or placement relationships and never cause the target to follow later sibling
edits. They fall under D81's versioned `material_page_handoff` retention,
privacy, legal-hold, deletion/anonymization, export, backup, and tombstone
contract. No permanent restrictive FK may block an authorized Page purge;
receipts retain or tombstone only the minimum evidence allowed by the current
governing policy.

The physical order representation remains a replaceable D2 persistence-adapter
concern. A qualified adapter may use fractional indexing, but D84 does not pin
Payload's field name, endpoint, rank grammar, automatic migration, or drag
implementation. Duplicate or unrepresentable order values fail closed; Page ID
is not a silent tie-breaker that changes reviewed meaning. Any required rank
maintenance belongs to a separately qualified semantics-preserving D2 adapter
operation. D84 does not renumber an unbounded sibling set inside the handoff.

### One atomic D80-D84 business transition

Target creation, D81 source cleanup/checkpoints/lease fences, any D82 claim
succession, any D83 derived closure, the fresh target Placement, the extended
semantic receipt, audit attribution, and internal outbox records commit in one
short D33-admitted database transaction or none do.

Under lock, the transaction first determines the permitted predecessor effects
and derives their post-clean topology, then validates the explicit boundary or
resolves append-last, then inserts the target. An implementation may reorder
physical writes only with proof that the committed topology is semantically
identical.

The command acquires its scoped locks in one deterministic order and verifies
the narrow semantic gap or append-last mode after locking. Serialization or
deadlock failure retries the complete command, including order selection. An
explicit retry may commit only if its exact semantic gap remains valid.

The semantic idempotency key binds the canonical D80-D84 request, source and
target heads, placement mode, explicit anchors when present, and D2 contract
version. For append-last it does not bind an incidental preflight tail. The
receipt records the actual committed predecessor/successor/boundary and order
contract. Exact replay returns that original committed result even if later
siblings exist; changed semantic input conflicts. An unknown response is
reconciled from the receipt before any successor command.

### Source of truth and authorization

- D2 owns Parent Page/Top-level resolution, logical sibling order, placement-
  command provenance, authoritative insertion, and order-adapter qualification.
- D12 owns immutable Placement revisions, Working heads, leases, and recovery.
- D80/D81 owns the one material-purpose handoff plan and semantic receipt.
- D4 independently owns Navigation membership and order.
- D1 independently owns any later Public Site Generation activation.
- Payload is a qualified private persistence/admin adapter, not hierarchy,
  intent, authorization, or public truth.
- The staff Page-tree and handoff summaries are rebuildable projections.

D84 creates no capability. The command reuses existing source effects from
D80-D83 plus the current target Page create/edit/Placement effect and D2's
ordinary Page-tree authority. Actor, Tenant, environment, Site, locale, Page,
resolved parent/root owner, anchors, effect epoch, and audit attribution come
from trusted server context and authoritative rows, never caller-controlled
identity fields.

The existing target-parent placement effect authorizes D2 to evaluate the
complete structural cohort, including Pages whose content/detail is not
readable by the actor; it grants no per-sibling content read. Neighbor labels,
paths, owners, locales, and a specific stale cause require the existing
consequence-detail authority. Without that detail authority the UI uses an
equivalent cause-neutral position result/error with uniform status, shape, and
timing. Without the structural placement effect the command is unavailable.

Browser and Data API roles receive no direct mutation grant for order values,
Placement heads, placement-command evidence, target creation, or receipts.
Applicable relations use same-scope composite references, restrictive deletion,
non-null trusted owners, equality-leading parent/order indexes, least grants,
and RLS with old-row `USING` and resulting-row `WITH CHECK` where mutation is
exposed. Payload Local API, service/BYPASSRLS roles, RPCs, views, imports,
migrations, workers, support, repair, and AI-assisted paths repeat the same
authorization and invariant boundary.

### Focused Web Studio experience

D84 stays inside the existing D80-D83 placement review. It adds no required
radio group, checkbox, modal, wizard, drag operation, or second confirmation.
The compact read-only row is always visible:

> **Page tree position**  
> **After:** Mission trips  
> **Before:** Resources  
> Uses the position reviewed in the saved Page change. Navigation and the live
> website will not change.

Reviewed start/end use the same row and distinguish deliberate intent from the
default:

> **Page tree position**  
> **Result:** First under Serve  
> **Before:** Mission trips  
> Uses the position reviewed in the saved Page change. Navigation and the live
> website will not change.

> **Page tree position**  
> **Result:** Last under Serve  
> **After:** Resources  
> Uses the position reviewed in the saved Page change. Navigation and the live
> website will not change.

Default:

> **Page tree position**  
> **Result:** Last under Serve  
> No sibling position was chosen in the saved Page change. The new Page will be
> added at the end when this handoff finishes. Navigation and the live website
> will not change.

Empty default:

> **Page tree position**  
> **Result:** Only Page under Serve  
> No sibling position was chosen in the saved Page change. The new Page will be
> the only Page under Serve when this handoff finishes. Navigation and the live
> website will not change.

An explicit empty-cohort choice shows the same result but says **Uses the only
position reviewed in the saved Page change**. For D80's **Top level** choice,
the same states use **First at top level**, **Last at top level**, or **Only Page
at top level**; the UI never exposes the internal root/Home Page as the selected
parent.

When the ordinary D2 position selector is available, a secondary **Change
position** action may open that same owner surface. D84 does not build a second
selector. Large sibling sets load/search/paginate only when staff deliberately
open that action; accepting a proved position never downloads the whole tree.

Stale explicit placement is persistent, textual, and cause-owned:

> **Page order changed**  
> The saved position is no longer available. Review the updated position.
> Nothing was moved.

Unknown provenance is distinct:

> **Review the Page tree position before continuing**  
> We couldn't verify whether this Page's position was deliberately chosen. Your
> saved work is safe.

When the actor may manage aggregate Page-tree placement but lacks detail needed
to disclose an anchor or the specific stale cause, the equivalent state is:

> **Position needs review**  
> Review the current Page tree position. Nothing was moved or published. Your
> saved work is safe.

Only currently authorized structural labels may appear. If exact neighbor
detail would disclose a hidden Page, the summary uses permission-safe aggregate
wording or the existing owner action; it never reveals title, path, locale,
owner, or a specific hidden cause by comparison, count, error, status shape, or
timing.

The experience reuses PageShell and existing `@asym/ui` Base UI/base-maia/Zinc
primitives. Exact **After**, **Before**, **First**, **Last**, and **Only Page**
labels carry meaning; arrows, indentation, color, and visual direction do not.
Content stacks and wraps at 320 CSS pixels/400% zoom, supports long/CJK/RTL
labels and forced colors, retains 44-pixel action targets, and respects reduced
motion. The ordinary D2 tree offers an equivalent single-pointer and keyboard/
assistive-technology control wherever drag exists.

Background refresh never steals focus. Failed submit focuses the linked error
summary once; only activating its link moves focus to the owner control. A
completed position change preserves useful focus and announces one complete
old/new result. Weak-network, reconnect, reauthentication, and unknown-outcome
states retain safe entered values and never call optimistic client state
committed.

### Navigation, public, donor, Vercel, and money boundaries

D84 creates a private target Placement only. It does not activate D1, change a
public canonical path or breadcrumb, add/reorder Navigation, alter search/
sitemap/cache state, create a redirect, call Vercel/DNS/TLS, touch Stripe or
the ledger, or add donor/missionary/public UI. The current public source and
every donor-visible result remain unchanged. Later target publication uses the
ordinary D1/D2/D4 contracts and does not inherit authority from D84.
The same-database write may use the qualified Payload persistence adapter; this
is not permission to call Payload's native reorder endpoint or to create an
external provider/control-plane effect.

### Migration, capacity, rollout, and proof

Current `develop` cannot implement D84: `pages.ts` has tenant-scoped editorial
and layout fields, a scalar slug, and provider drafts, but no stable Site/locale
Placement lineage, parent, sibling order, D2 semantic provenance, D12 head, or
D80-D84 command. The current migration also cannot safely represent the target
contract. The installed Payload 4 internal `orderable` feature is provider-
global mutable ordering with indexed but non-unique hidden keys and a native
reorder/migration path; it is evidence and possibly a low-level key generator,
not an implementation shortcut.

That installed-artifact claim is reproducible for this decision snapshot:
[`package.json`](../../package.json) and [`bun.lock`](../../bun.lock) pin
`payload@4.0.0-internal.1f9ae9a`; the lock records package integrity
`sha512-Eev+nlYltrR27qaIPMAwHQxmXhpe2aTjshiJkUbeZSFChyyF0xroDDAlH8BRV3IruCrcNPJcvG4+YIVw1uds1g==`;
after a frozen install, `dist/config/orderable/index.js` has SHA-256
`fb0bdf34988d3136166f4d5a9a3c5ff0e54714b1f395fb0bafd311f6664e8f77`,
its source map has
`a901001aa18e7984dc238be47bf83b8a98a2fe331837ad22c10e898fb86528fe`,
and its embedded TypeScript source has
`1f0bd5079d13fe941b8e8c1a8174c8bade8cc510d528befaa2d8a56b419d3c8e`.
The installed fractional-indexing JavaScript/source-map hashes are respectively
`c2fb28659fd457fbf21e941f1c7ef5fbbb123a73f2346d708187061eebd64556`
and `b830e0663995a63e04e8ebec98810accacdb266ba4526cc62a3161c89825e312`;
its embedded source has
`01e1f76d40b9bca71e4f900e2fdb406eb204796dc42bbb5d41fb3a413f8288bb`.
The vendored Payload 3.77.0 snapshot's `orderable/index.ts` does not match this
installed internal build and is comparison evidence only, never proof of
installed behavior.
This is snapshot evidence, not a promise about a future Payload release; adapter
qualification must regenerate it after every dependency change.

Rollout uses expand, complete hierarchy/order/provenance census, quarantine of
unknown order meaning, shadow append/anchor planning, structural constraints
and indexes, old-writer/native-endpoint fencing, qualified D2 adapter, limited
cohort, and contract cleanup. Imported or legacy order without source-proved
semantic placement provenance requires ordinary D2 position review; migration
never fabricates explicit intent or a known default.
At least one compatible reader remains for every committed D84 result through
rollback. Rollback disables new commands and repairs forward; it never rewrites
immutable Placement history or deletes an already-created target.

D33 qualification supplies Minimum, Typical, and Measured Maximum sibling-
cardinality/contention cases, transaction/lock budgets, and failure thresholds.
D84 invents no unsupported numeric product limit. If the adapter cannot produce
one position inside the admitted transaction budget, the command fails before
mutation and uses the existing D2 owner repair; it does not partially create,
renumber an unbounded set, or require direct database support.

Activation requires positive, negative, boundary, authorization, RLS/grant,
privileged-path, migration, mixed-version, concurrency, idempotency,
failpoint, accessibility, internationalization, weak-network, current-runtime
unavailability, and zero-public/external-provider/money-effect proof.

## Consequences

- Deliberately staged information architecture survives the handoff when Core
  can prove it.
- The common positively proved default case remains a predictable zero-question
  append-last flow; unproved placement intent receives focused review.
- A stale deliberate placement is never silently replaced by a different
  outcome.
- Core records one small semantic D2 provenance contract instead of treating a
  provider rank or audit log as business intent.
- Append-last can reconcile harmless tail churn without annoying staff, while
  exact explicit closed boundaries stay concurrency-safe.
- D84 adds no source/descendant mutation; sealed D81/D82/D83 effects remain
  authoritative, while D84 leaves final-baseline pre-existing relative order,
  Navigation, public delivery, donors, and money unchanged.
- Implementation cost stays inside D2/D12/D80-D84: one target insertion,
  semantic receipt extension, structural indexes/constraints, and hostile
  proof. No D84 subsystem is created.

## Rejected alternatives and unsafe interpretations

- **Always append last:** strongest minimal alternative, but discards proved
  staged intent and can create immediate cleanup work.
- **Require a position every time:** maximal control, but adds avoidable
  cognitive, mobile, accessibility, and concurrency friction to every handoff.
- **Infer intent from current order or copy the source/provider rank:** cannot
  distinguish defaults/imports, may be invalid under the final parent, and
  races concurrent insertion.
- **Silently append when an explicit anchor becomes stale:** changes a reviewed
  result without consent.
- **Freeze a preflight tail for default append:** creates needless stale-plan
  failures although the semantic outcome remains last.
- **Use Payload collection `orderable` as D2 authority:** global mutable order,
  native endpoint, and provider migration semantics do not satisfy same-scope
  immutable Placement, authorization, or atomic handoff requirements.
- **Use numeric `last + 1`, Page ID tie-breaking, client-generated fractional
  keys, or read-before-write only:** permits collisions, unreviewed order, and
  cross-request races.
- **Add a D84 intent table, current head, workflow, CRDT, real-time merge,
  asynchronous reorder job, or second Page-tree UI:** solves a much larger
  problem and duplicates D2/D12.
- **Rebalance all siblings in the handoff:** widens locks, revisions, failure
  scope, and staff consequences for a one-Page insertion.
- **Couple Page-tree order to Navigation or public routing:** violates D2/D4/D1
  ownership and changes visitor behavior without review.

## Activation boundary

This ADR records accepted target architecture only. D84 remains unavailable
until D1/D2/D4/D12/D33/D79-D83, exact same-scope hierarchy constraints,
authenticated D2 placement provenance, qualified order generation, final-
topology simulation, deterministic locking/CAS/idempotency, current
authorization and RLS/grant/privileged parity, migration quarantine, old-writer
and native-provider-endpoint fences, D33 capacity, mixed-version recovery,
accessibility/usability, and zero-public/Vercel/money effects all pass.

Ratification changes no runtime, schema, migration, Supabase policy, OpenSpec,
ticket, provider configuration, deployment, public route, Stripe state, or
production behavior.

## References

- [Phase 24 D84 adversarial review](../prds/sitestacker-parity/phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](./0204-atomic-source-tree-draft-path-rederivation.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](./0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [ADR-0202 - Material-purpose Page Handoffs append clean source Working successors](./0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](./0201-material-purpose-changes-create-independent-pages.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed Web Studio D2 OpenSpec](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/openspec/changes/add-web-studio-cms/specs/web-studio-cms/spec.md)
- [Payload collection ordering](https://payloadcms.com/docs/configuration/collections)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Craft 5 structured-entry placement](https://craftcms.com/docs/5.x/reference/element-types/entries.html#structures)
- [Umbraco Page sorting](https://docs.umbraco.com/umbraco-cms/tutorials/editors-manual/getting-started-with-umbraco/ordering-pages)
- [WordPress Page hierarchy and order](https://wordpress.org/documentation/article/create-pages/)
- [Shopify collection reorder mutation](https://shopify.dev/docs/api/admin-graphql/latest/mutations/collectionReorderProducts)
- [Figma ordered sequences](https://www.figma.com/blog/realtime-editing-of-ordered-sequences/)
- [Figma multiplayer hierarchy](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL serialization retry](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [WCAG 2.2 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)
- [WCAG 2.2 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG 2.2 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WAI rearrangeable listbox example and production warning](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/examples/listbox-rearrangeable/)
- [Atlassian drag accessibility guidance](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines)
