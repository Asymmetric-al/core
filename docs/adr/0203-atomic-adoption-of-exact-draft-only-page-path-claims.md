# ADR-0203: Material-purpose handoffs atomically adopt exact draft-only Page path claims

**Status:** Accepted (founder-ratified Phase 24 D82, 2026-08-31; hardened by
the required adversarial amendments below)

## Context

ADR-0201 requires a materially different Page purpose to continue as a fresh
private Page. ADR-0202 creates that target and returns the source Page-owned
Working heads to their exact public pins in one recoverable transaction. A
false collision remains when the sealed source Placement candidate already
holds the exact address staff want for the target even though Core has never
published or otherwise protected that normalized address.

Always rejecting that address would discard already-reviewed information-
architecture intent and make staff invent a worse URL. Releasing it first and
claiming it later would create an unowned interval and race. Creating an
unplaced Page would reopen D80's required Placement invariant and add a new
incomplete lifecycle. The useful operation is therefore narrow atomic claim
succession inside the existing D80-D84 command.

No reviewed CMS defines this exact operation as a universal industry feature.
Current Payload and Sanity documentation does establish the relevant modern
primitives: private drafts are distinct from published content; provider
version history is available under configurable retention; multi-write changes
can be transactional; and stale writes can be fenced by revision. Core's
governing D12 contract—not a vendor default—requires immutable append-only
meaningful checkpoints. PostgreSQL supplies the final transaction,
constraint, lock, and compare-and-set boundary. Current Contentful and
WordPress slug behavior also shows why editor availability checks or silent
suffixing are not sufficient route authority. D82 is a Core/D2 composition of
those proven primitives, not a generic Payload duplicate or slug-transfer
feature.

The phrase **never-public path** is too broad. Core cannot prove that nobody
ever typed, shared, or hosted a similar URL outside Core, and the path must
remain visible in authorized private source Revision History after the
handoff. The precise product term is **Draft-only Path Claim**: a current
private D2 claim whose complete Core route-effect history proves that its
canonical key has never been selected by an activated public generation and
has never participated in a public or protected route effect.

Current `develop` cannot implement this contract. Its Payload Page has a
Tenant relationship and mutable scalar slug, broad Tenant-role access, and an
ordinary non-unique slug index. It has no accepted Site/locale Page identity,
D1 serving generation, D2 Placement Revision and route namespace, D12 Working
head/lease fence, or D80-D84 transaction. This ADR records the permanent model
only and forbids an interim scalar-slug implementation.

## Decision

### One exact Draft-only Path Claim

A **Draft-only Path Claim** SHALL mean one current D2 claim for the exact
canonical route key derived by D2's sole versioned compiler from trusted:

- Tenant, deployment environment, Site, and stable BCP-47 locale namespace;
- current admitted Site-locale public-base generation;
- exact parent Page identity and normalized local web-address segment;
- canonicalizer, reserved-route, source-owned-route, and route-policy
  generations; and
- every equivalence rule D2 applies, including case, slash, percent-encoding,
  Unicode, locale-prefix, decoded form, and framework/static route treatment.

The compiler and policy generations are expected-state metadata, not a new
namespace partition that permits the same effective path once per version.
Migration and mixed-version proof SHALL preserve exclusivity across old/new
equivalent keys or fail closed until the prior representation is retired.

Adoption is eligible only when all of the following are true at preflight and
again at commit:

1. the exact claim is current and owned only by the sealed source Placement
   Working candidate used by D79-D81;
2. the complete authoritative D1/D2/D3 and route-owner history proves that no
   canonical equivalent, under any Page or route owner, has ever been selected
   by an activated Public Site Generation or served through Core's public
   runtime as tenant content, a redirect, rewrite, alias, canonical,
   predecessor, repair, or other public route result;
3. no current or historical root/Home, system, platform-reserved, protected,
   Phase-22 or other specialized source-owned, safety-withdrawn, scheduled,
   continuity/repair, retired-route, tombstone, migration, or Trash-retained
   effect owns or protects the key. The exact current private source candidate
   claim in item 1 is the sole permitted owner;
4. provenance is complete. A legacy/imported/unknown route history, missing
   reader, stale projection, or absence from analytics, logs, CDN, Search
   Console, Payload, Vercel, or a current-row query is never affirmative proof;
5. the sealed target parent and local segment still compile to the exact same
   key under the current D2 profile and remain valid; and
6. any dependent descendant/path closure either is empty or passes ADR-0204's
   complete Atomic Source-tree Draft-path Re-derivation contract. Every stale,
   inaccessible, protected, independently incompatible, unknown, or over-
   capacity closure remains unavailable and uses ordinary D2 cleanup first;
   no child is silently moved, copied, reparented, or transferred.

An immutable private source Placement Revision or D81 checkpoint may continue
to contain the old parent/segment/path for authorized comparison and recovery.
That private history is not a public route effect and does not itself reserve
the path after the current claim is superseded. Conversely, a D81 content-
retention pin never overrides a D2 route protection and must not be confused
with one.

A request that once returned the platform's true unknown-host or route-not-
found result is not a public use of the key. Evidence that Core accidentally
served tenant content at an unrecorded key is an integrity/security incident;
eligibility fails closed and the discrepancy is investigated rather than
reclassified as draft-only.

A host-global canonicalization response for an otherwise unknown URL—such as
normalizing a trailing slash before the final not-found result—also does not
become a tenant route-owner redirect merely because somebody requested it.
D2 still places every such equivalent spelling in the same canonical
equivalence class. Any redirect selected from tenant route ownership, route
history, repair, or migration remains an ineligible public/protected effect.
An authorized revision-scoped private preview is also not a public route
effect; it remains private, `no-store`, and `noindex`. Any preview that became
available without its exact authorization is a security incident and makes
eligibility fail closed until reconciled.

### Atomic Draft-path Adoption, not identity transfer

When staff retain the exact eligible source parent and segment, D80-D84 SHALL
perform **Atomic Draft-path Adoption**. The D2 owner appends/supersedes the
source's exact current private claim and creates a fresh target Placement
Revision plus a fresh target claimant-ownership occurrence/version for the same
canonical key inside D80-D84's one all-or-none transaction. A stable namespace
row for the canonical key may retain its identity. The immutable source Placement Revision, its
identity, and its private History are never reassigned, relabelled, copied as
authority, or deleted.

The physical schema may use the D2 route namespace's existing append-only
claim rows, current-owner pointer, or equivalent qualified representation.
D82 does not mandate a new transfer table, generic claim-transfer API,
deferrable constraint, global advisory-lock service, or second route ledger.
The externally testable D82 command-boundary invariants are:

- the externally visible pre-commit boundary has the exact source claimant and
  the post-commit boundary has the exact target claimant, with no visible
  zero-owner or double-owner interval during D82;
- the source claim/version expected by the plan is the only eligible
  predecessor;
- the target receives fresh Page and Placement Revision identities plus a fresh
  claimant-ownership occurrence/version; a stable canonical-key namespace row
  may retain its identity;
- the source private revision/checkpoint remains intact but loses current
  route-claim authority;
- the route namespace has exactly one target-owned current claimant after
  commit; and
- database uniqueness, not a UI check or read-before-write convention, is the
  final arbiter.

If staff change either Parent Page or local segment, the special provenance and
adoption disposition disappear. The new value follows ordinary D2 validation
and uniqueness. D81 may still supersede the abandoned source candidate claim
as part of cleaning the source, but it never assigns that key to the target.
Returning to the exact source values restores the provenance only after a fresh
server check.

### One D80-D84 transaction

Preflight SHALL extend the existing sealed D80-D84 plan; it SHALL NOT create a
reservation. The plan binds the exact actor/effect epoch; trusted scope;
source/target Page, Editorial, Placement, Working, public-generation,
continuity, schedule, and lease heads; source claimant-ownership occurrence/
version plus any stable namespace-row version and
complete route-disposition proof; selected Parent Page/Top-level choice,
trusted resolved parent/root placement owner, and sibling-position input
qualified by ADR-0205 as one tagged reviewed boundary, one positively known
append-last default, or review-required unknown; current Site/locale/public-base/domain-display generations; D2
canonicalizer/reservation/route-policy generations; transfer/adapter/schema
versions; target canonical key; D79 result; D81 checkpoint/clean outcome; and
one semantic command identity.

Commit SHALL first reconcile an already-committed same-command receipt, then
freshly authorize and revalidate every bound fact. In one short transaction
and documented deterministic lock order, it SHALL:

1. win or reconcile the scope-bound semantic receipt;
2. fence the exact source Working/public/continuity/schedule/lease heads,
   source private claim/version, D2 namespace generation, target parent chain,
   and route-policy generations;
3. re-prove complete Draft-only Path Claim eligibility through the owning
   persisted facts, not a cached boolean;
4. determine the sealed qualified D81/D82/D83 predecessor-effect manifest,
   derive its post-clean/pre-target sibling cohort, and validate D84's tagged
   boundary or resolve append-last against that same baseline;
5. create the complete private D80 target and fresh target Placement Revision,
   including the fresh D84 order result generated by D2 without copying the
   source/provider value or causing a pre-existing Page parent/order write;
6. supersede the exact source current private claim and create the target
   current private claim through D2's sole mutation boundary;
7. append the D81 protected source checkpoint, necessary clean source Working
   successors, any qualified D83 derived-output successors, exact manifest head
   advances, and sealed-pair lease fences;
8. append immutable claim-succession provenance, the extended D80-D84 receipt,
   business audit, and durable outbox; and
9. commit everything or nothing.

Physical write order may differ only when the same final semantic topology is
proved. No immutable prior revision is mutated; only the sealed D81/D82/D83
manifest may advance affected heads/change source-clean or derived state, and
D84 preserves the resulting cohort's pre-existing relative order.

The operation SHALL use targeted row locking and/or exact expected-owner/
version compare-and-set plus the existing uniqueness constraint. It need not
force every D80-D84 request to Serializable isolation; if the qualified
adapter uses Serializable or a deadlock retry, it SHALL replay the complete
semantic command against fresh current state. Transactions acquire the same
resource classes in one documented order, wait for no user or network input,
and use measured timeouts through the active Production Capacity Profile.

Replay with the same semantic-command key and identical canonical request SHALL
return the one authorized prior receipt even though the target now owns the
route key. It SHALL NOT misreport that committed success as a new collision.
Reuse of that semantic key with a different canonical request is a conflict and
changes nothing. After a lost response, the client freezes
successor writes and reconciles the receipt before offering retry or editing.

Any stale claim/head/lease/permission/policy, incomplete history, normalization
change, competitor, constraint conflict, or failure SHALL roll back every D80-
D82 effect. The source candidate, private claim, leases, target absence, and
public state remain exactly as before. Core SHALL NOT release then claim in two
requests, repair partial success, or add a saga/background job for this staff
convenience.

### Structural, RLS, and authorization boundary

D2 remains the sole owner of canonical-key compilation, namespace
exclusivity, reservations, eligibility, and claim succession. D1/D3 and
specialized route owners supply public/protected-history proof. D12 owns
immutable private Placement history, Working heads, leases, and recovery.
D80-D84 compose the handoff and existing receipt. Phase 12 owns the exact
source-Placement supersede and target-Placement create effects. D15/D16/D72
supply read-only public-base and tenant-branded domain display context.

Target create/edit/Placement authority alone is insufficient. The actor must
also hold current authority to supersede the exact source Placement candidate
and to perform every D79-D81 effect. Tenant, environment, Site, locale, actor,
source owner, target owner, claim owner, audit attribution, and route-policy
facts SHALL be derived from authenticated server context and constrained
relationships, never trusted caller fields.

The route namespace SHALL structurally preserve at most one current claimant
across every typed class that competes for the same key, and D82's pre/post
boundaries SHALL each have their exact one expected claimant. Its same-scope
primary/foreign keys, non-null owners, restrictive lifecycle/delete behavior,
checks, and unique constraint or qualified equivalent SHALL prevent cross-
Tenant/Site/locale reassignment, orphaning, cascade erasure, and duplicate
claimants. Equality-leading indexes SHALL match current-key lookup, claim-
owner CAS, parent/dependency, receipt, and authorization predicates. Exact
physical names and whether current claims use a partial unique index remain
design decisions proved against real queries; D82 does not create parallel
per-table uniqueness.

Browser, anonymous, and ordinary authenticated Data API roles SHALL receive no
direct multi-row adoption DML. Exposed reads/writes use least grants and RLS;
updates prove authorized old rows with `USING` and permitted resulting scope
with `WITH CHECK`, with required `SELECT` access tested separately. Views,
functions/RPCs, service/BYPASSRLS, Payload Local API, workers, imports,
migrations, support, and repair paths SHALL reproduce the same effect and
scope rules. Actor-scoped Payload calls pass the authenticated request/user,
`overrideAccess: false`, `overrideLock: false`, `fallbackLocale: false`, and the
same transaction request. Any necessary security-definer function uses a least
owner, empty pinned `search_path`, schema-qualified objects, revoked default
execute, and explicit authorization; security invoker is preferred.

If Payload source and D2 ownership writes cannot share one proven PostgreSQL
transaction, D82 remains unavailable. A Payload write plus separate Supabase
HTTP/RPC call is not atomic.

### Focused Web Studio experience

D82 SHALL remain inside the D80-D84 PageShell consequence review. It
adds no checkbox, RadioGroup, extra button, modal, wizard, typed confirmation,
destructive styling, timed-toast-only state, or technical claim-transfer
language.

The existing placement fields render as one semantic group:

> **Parent Page**  
> Serve
>
> **Web address**  
> `/short-term-teams`  
> **Full address:** `https://hoperelief.org/serve/short-term-teams`  
> **From About's saved draft**  
> Core has not published this address. If you keep it, it will be reserved for
> the new private Page when these changes move. It will not be live yet.

The complete tenant-branded URL is selectable, copyable, wrapping, and visibly
derived from the reviewed parent and segment. **Can be used for this move** is
an advisory preflight status, never a claim that the browser reserved it. If
either input changes, the source helper disappears and ordinary copy says
**New address for this Page. We will check it again when you move the
changes.** Input changes never mutate, submit, navigate, or move focus.

The D81 outcome summary SHALL state:

> **New Page · Private draft**  
> Short-term team application  
> `https://hoperelief.org/serve/short-term-teams`
>
> **About · Stays live**  
> `https://hoperelief.org/about`
>
> The new private Page will own the planned address. About stays live at its
> current address. Nothing will be published, redirected, or changed for
> website visitors.

The one primary action remains **Move saved changes to new Page draft**. The
source-provenance helper is sufficient; staff do not retype the path or make a
second adoption choice.

Persistent failure states distinguish the correct repair:

| Condition                        | Staff result                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Competing claimant               | **That address became unavailable. Choose another address. Nothing was moved.**                                  |
| Source Placement drift           | **About's saved address changed since this review. Review the latest saved version. Nothing was moved.**         |
| Current route rule rejects value | **This saved address no longer meets the current web-address rules. Choose another address. Nothing was moved.** |
| Parent no longer eligible        | **Serve is no longer available as the parent. Choose another Parent Page. Nothing was moved.**                   |
| Proof temporarily unavailable    | **We couldn't verify this address right now. Nothing was moved. Try again.**                                     |
| Outcome unknown                  | **Checking whether the changes were moved...**; reconcile before another action                                  |

Another claimant's title, owner, Site, or existence appears only after fresh
independent read authorization; otherwise the result remains non-enumerating.
Errors preserve every field. A failed submission moves focus once to the linked
summary; activating a summary link moves focus to its repairable control. Core
never silently suffixes, transliterates, normalizes to a different display
value, or switches to another path.

After a committed receipt and fresh target read/edit plus ordinary target-
lease proof, success opens the target editor, focuses its heading, preserves
**Draft - not live**, and persistently states:

> **Saved changes moved**  
> `/serve/short-term-teams` is reserved for **Short-term team application**.
> It is not live. About remains live at `/about`. Nothing was published.

In staff copy, **reserved for this Page** means the Page currently owns the
private claim after commit. It is not D2's distinct **platform-reserved route**
class, which is always ineligible for adoption.

If target read authority disappeared, the existing detail-free D81 committed
result applies and leaks no path or target detail. An authorized preview binds
the fresh target Page/Placement revision and remains private, `no-store`, and
`noindex`; a source preview token is never retargeted.

The surface reuses PageShell, Base UI, base-maia, Zinc, Core Field/
FieldDescription/FieldError and status patterns, and Lucide only where an icon
is supplementary. It retains one DOM/reading order, native labels and error
associations, visible focus, 44-CSS-pixel targets, 320-CSS-pixel and 400-percent
reflow, forced colors, reduced motion, keyboard/screen-reader operation, polite
status announcements without focus theft, bidi-isolated wrapping URLs, long/
CJK/RTL labels and Page titles, and summary-first weak-network recovery.

### History, restore, and later lifecycle

The D81 source checkpoint retains the exact old private Placement value under
its existing resource/version authorization. It is evidence, not an active
claim. **Restore content as a new draft** may restore Editorial content without
touching Placement. **Restore placement as a new draft** always runs ordinary
D2 validation; it never reclaims, overwrites, silently omits, or silently
suffixes the target-owned key. With target-read authority, the collision may
name the target; without it, staff see only **This saved address is no longer
available. Choose another address.**

Later target edits, publication, withdrawal, Trash, purge, restore, or access
changes follow the existing D1/D2/D12/Trash owners and may supersede, protect,
or release the target claim under those contracts. They never return the claim
automatically to the source, mutate source History, or create a source-target
synchronization relationship. D82 does not change incoming stable Page-
identity references or Navigation. ADR-0204/D83 may recompute only D2-owned
derived private descendant paths, breadcrumbs, route delta, and claim outcomes
while preserving direct Placement inputs and every existing immutable History
row; only ADR-0204's qualified cause-labelled derived-output successor may be
appended. Literal path
references remain governed by their owning dependency contracts and may block
rather than be silently rewritten.

### Public, Vercel, SEO, and money boundary

Atomic Draft-path Adoption has zero public effect. Before and after commit,
the source activated D1 generation serves the same route, content, canonical,
Navigation, search, sitemap, cache, schedule, donor, and safety result. The
target remains private with no public canonical or serving route. Because the
eligible key has never been published by Core, D82 creates no redirect, alias,
rewrite, canonical update, sitemap/search entry, or cache purge. The target's
later ordinary D1 publication owns those effects.

D82 SHALL make zero Vercel Domain, project, deployment, redirect/rewrite,
Routing Middleware, DNS, TLS, host, or cache API calls. Vercel owns project
host attachment and delivery primitives, not Core's private Page path
namespace. D82 also sends no Stripe, currency, gift, recurring, ledger,
receipt, email, form, donor-account, CRM, analytics, or other provider effect.

### Migration, rollout, proof, and observability

Rollout SHALL use expand, a complete route census/classification, migration of
known claim/history provenance, shadow eligibility, structural constraint and
index proof, old-writer fence, qualified D2/Payload owner port, limited cohort,
then contract. Unknown legacy/import history remains ineligible. Mixed code,
canonicalizer, route-policy, schema, or adapter generations fail closed; no
read-time mutation or lossy rollback may invent eligibility.

D82 adds one bounded claim succession to the D80-D84 D33 named scenario,
not a full history scan at commit. Preflight may use a maintained projection,
but commit fences its authoritative version and rechecks durable summary facts.
The active Production Capacity Profile supplies concrete Minimum, Typical, and
Measured-maximum route-history, contention, Page-size, and latency/lock/retry
cells. The Vercel Qualification Attachment records an exact zero-operation
scenario. No numeric threshold is invented here.

Durable audit records the semantic receipt, actor/effect, trusted scope, source
claimant-ownership/Placement version, target claimant-ownership/Placement version, canonical-key digest,
route/canonicalizer/policy generations, private-only eligibility evidence
version, D80-D84 result, outcome, and time. It stores no Page body, private URL
in broad technical logs, or new route authority. Technical telemetry uses
privacy-safe IDs/digests and never replaces business history.

## Consequences

- Staff can preserve an exact reviewed private address without a fake
  collision, second screen, or incomplete target state.
- The namespace remains race-safe: one D2-owned transaction replaces current
  private ownership without an observable free or dual-owner interval.
- The operation is deliberately narrower than generic route transfer. Public,
  protected, unknown-history, different-scope, incompatible descendant, or
  ordinary copy cases remain ineligible; only ADR-0204's exact qualified
  source-tree derived closure is admitted.
- Source History remains truthful and independently recoverable, while private
  history no longer masquerades as current route ownership.
- D82 reuses D2/D12/D80-D84 owners, receipt, transaction, and UI. It adds no
  resolver, workflow, reservation service, Vercel dependency, or money path.
- Implementation costs include complete route-effect provenance, one atomic
  claim-succession path, hostile concurrency/migration proof, and precise
  restore/error behavior. Those are necessary correctness costs, not a new
  platform.

## Rejected alternatives

- **Always require a different target address:** structurally simple but
  creates needless staff friction and poorer URLs when D81 already owns an
  atomic source cleanup.
- **Create an unplaced Page:** reopens D80's required private Placement,
  weakens preview/readiness, adds a lifecycle/task, and leaves the intended key
  exposed to another claimant.
- **Release then claim in separate requests:** creates a race and ambiguous
  partial failure.
- **Transfer/relabel the source Placement or claimant-ownership occurrence
  identity:** corrupts
  immutable source history and target fresh-identity invariants.
- **Treat current-row absence, analytics, logs, provider validation, or Vercel
  as proof:** none owns complete Core route-effect history.
- **Silent suffixing or automatic alternate path:** changes reviewed public
  meaning and hides a collision.
- **Generic transferable claims, reservations during review, a new route
  ledger, saga, queue, advisory-lock service, or redirect:** speculative
  machinery outside this bounded same-Site handoff.
- **Widen D23 Copy-to-Site:** D23 intentionally leaves its source unchanged and
  treats its path only as a suggestion; D82 is exclusively the D80-D84 same-Site
  succession.

## Activation boundary

This ADR records accepted target architecture only. D82 remains unavailable
until D1/D2/D3/D12/D79-D81, Phase 12 effects, complete route provenance,
structural exclusivity, same-scope constraints/indexes, qualified Payload/
PostgreSQL transaction participation, RLS/grant/privileged parity, native-
action suppression, migration/old-writer fencing, exact replay/failpoints,
route-equivalence properties, public/Vercel/money no-effect, D33 capacity,
accessibility, weak-network, and representative ministry-staff comprehension
proof all pass. A source candidate with descendant path effects additionally
requires ADR-0204's exact closure provenance, bounded/resumable preparation,
phantom-safe head/membership fencing, exhaustive claim outcomes, D33 capacity,
and atomic public-delivery/external-provider zero-effect proof; otherwise it remains unavailable
and uses ordinary D2 cleanup first.
Every target additionally requires ADR-0205's positive D2 placement provenance,
final-topology gap/default proof, fresh target order representation, zero
collateral Placement writes, and accessible consequence review. Unknown or
stale position provenance uses ordinary D2 review before D82 can commit.

Ratification changes no runtime, schema, migration, Supabase policy, OpenSpec,
ticket, Vercel configuration, deployment, public route, Stripe state, or
production behavior.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](./0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](../prds/sitestacker-parity/phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](./0204-atomic-source-tree-draft-path-rederivation.md)
- [Phase 24 D83 adversarial review](../prds/sitestacker-parity/phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md)
- [ADR-0202 - Material-purpose Page Handoffs append clean source Working successors](./0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](./0201-material-purpose-changes-create-independent-pages.md)
- [Phase 24 D82 adversarial review](../prds/sitestacker-parity/phase-24-d82-atomic-draft-path-adoption-adversarial-review.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Proposed ADR-0167 - Exact Site-owned content and Copy-to-Site drafts](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Versions](https://payloadcms.com/docs/versions/overview)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Payload Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [Sanity documents and drafts](https://www.sanity.io/docs/content-lake/documents)
- [Sanity transactions](https://www.sanity.io/docs/content-lake/transactions)
- [Contentful Content Management API optimistic locking](https://www.contentful.com/developers/docs/references/content-management-api/)
- [Contentful slug-validation update](https://www.contentful.com/developers/changelog/content-model-editor-update/)
- [WordPress unique post slug behavior](https://developer.wordpress.org/reference/functions/wp_unique_post_slug/)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL transactions and isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL partial indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase database functions](https://supabase.com/docs/guides/database/functions)
- [Vercel domains](https://vercel.com/docs/domains/working-with-domains)
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
- [Next.js trailing-slash behavior](https://nextjs.org/docs/app/api-reference/config/next-config-js/trailingSlash)
- [Google URL-change guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [WCAG 2.2 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
- [WCAG 2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
- [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
