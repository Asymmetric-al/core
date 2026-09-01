# ADR-0204: Source-tree draft paths re-derive atomically through D2

**Status:** Accepted (founder-ratified Phase 24 D83, 2026-08-31; hardened by
the required adversarial amendments below)

## Context

ADR-0201 requires a materially different Page purpose to continue as a fresh
private Page. ADR-0202 moves the exact acknowledged candidate to that target
and returns the source Page-owned Working axes to their public pins in one
recoverable handoff. ADR-0203 lets that same transaction atomically succeed the
source's exact eligible Draft-only Path Claim to the target.

One remaining consequence is hierarchical. D2 derives a descendant Page's
full path and breadcrumbs from its stable direct Placement inputs plus its
ancestors. A source ancestor candidate can therefore create private derived
path effects for Pages that still belong to the source tree. When D81 cleans
the ancestor, those effects must not remain stale, disappear partially, or be
misread as children transferred to the new Page.

Current CMS practice supports automatic recomputation of derived hierarchy
outputs, but not blind semantic editing. Payload's Nested Docs plugin updates
descendant breadcrumbs when an ancestor changes; Sanity's current Hierarchy
**Public Beta** corroborates one-direct-parent and hierarchy-validation patterns;
WordPress child paths reflect Page hierarchy. Payload and Sanity both expose
transaction primitives, while
PostgreSQL supplies the authoritative constraints, locks, and atomic boundary.
Those are useful primitives, not Core's domain contract. In particular, a
recursive Payload hook that re-saves every child is not an acceptable D2
authority or large-tree release mechanism.

Proposed ADR-0146 and OpenSpec D2 already settle the governing model: one
complete affected-descendant closure, bounded and resumable preparation for
high fan-out, exact old/new impact, unchanged descendants without separate
approval, and one coherent public D1 activation. D83 reuses those closure and
preparation principles inside D80-D82 but does not invent a current private
closure head. It adds no tree engine, D83-specific workflow or table, route
ledger, second Site-plan authority, or provider recursion path.

Current `develop` cannot implement this decision. Its Payload Page model has a
Tenant relationship, a mutable scalar slug, provider drafts, and broad Tenant-
role access. It has no accepted Site/locale Page Placement identity, immutable
Placement revisions, D2 closure/claim namespace, D12 lease/head boundary, or
D80-D82 semantic transaction. This ADR records the permanent model and forbids
an interim scalar-slug or nested-provider-hook implementation.

## Decision

### Atomic Source-tree Draft-path Re-derivation

**Atomic Source-tree Draft-path Re-derivation** is the D2-owned disposition
used only when a qualified D80-D82 handoff cleans one source ancestor and that
cleanup changes derived private paths and their corresponding breadcrumbs for
Site-locale Page Placements that remain in the source tree.

The disposition SHALL preserve each affected descendant's:

- stable Page identity and Tenant, environment, Site, and locale scope;
- direct parent Page, authored local web-address segment, and sibling order;
- Editorial content, Page-local and shared references, and source ownership;
- current public Placement and every immutable Editorial/Placement revision;
- Navigation relationship and independently owned schedule, safety, access,
  continuity, Trash, and publication facts; and
- authorized private History and revision-bound preview provenance.

It SHALL recompute only D2-owned derived private canonical paths,
breadcrumbs, route delta, and current draft-claim outcomes from the exact
trusted Placement inputs and clean source ancestor. The target Page receives
no child, subtree, reference, Navigation item, permission, schedule, History,
or other descendant authority.

The phrase **in place** describes stable descendant identity and source-tree
membership; it never authorizes mutation or relabelling of an immutable
Placement Revision. If the accepted D2 representation stores derived path/
breadcrumb output in each immutable descendant Placement Revision, D2 MAY
append one D12-fenced, cause-labelled successor with identical authored inputs,
including for public-pin convergence when a clean successor is required by the
monotonic Working contract. It SHALL never append a redundant revision when
the exact existing public pin can be reused safely. If the accepted D2
representation derives output in a separately retained closure artifact, the
exact descendant Placement head MAY remain unchanged. In every design:

- old revisions remain immutable and readable under their original authority;
- no redundant revision or duplicate claimant occurrence is appended solely to
  create activity;
- the externally testable old/new closure, claim, receipt, and public-effect
  invariants are identical; and
- the physical representation remains a D2/D12 design choice rather than a
  D83-specific child-update table.

### Exact eligible closure

D2 SHALL derive the authoritative closure on the server. A browser-provided
descendant list, current UI tree, Payload breadcrumb array, cache, search
result, provider response, or caller count is never closure authority.

The closure is eligible only when, at preflight and again at commit:

1. its root is the exact sealed source Placement candidate used by D80-D82;
2. every member is reachable through trusted same-Tenant, same-environment,
   same-Site, same-locale direct parent relationships and remains the same
   stable Page under the source tree;
3. traversal is complete, cycle-safe, depth-bounded, and bound to an exact
   phantom-safe dependency fence scoped as narrowly as the accepted D2 model
   can prove. An unrelated branch SHALL NOT stale the plan unless D2 explicitly
   qualifies a coarser structural generation and its contention trade-off;
4. every exact old and new canonical equivalence class passes the current D2
   compiler, normalization, length, reserved/source-owned-route, route-history,
   reference, renderer, and safety checks independently;
5. every affected Placement head, direct input, current claim occurrence,
   relevant lease/dependency, schedule/release binding, lifecycle state,
   permission/effect epoch, public pin, and compiler/policy generation matches
   the sealed plan. If the Site-locale D1 serving head changed but still selects
   the exact same relevant public pins and route-policy inputs, the D1 owner MAY
   refresh that dependency without a staff re-review; any relevant public
   selection change blocks;
6. the actor currently holds the existing D80-D82 effects plus the ordinary
   D2 source-tree Placement effect needed for the full closure; D83 creates no
   new capability or implicit aggregate authority;
7. each acknowledged descendant Placement input is preserved exactly and is
   mechanically compatible with the clean ancestor; no field merge, automatic
   reparent, suffix, order choice, or semantic repair is required; and
8. the exact closure is within the active D33 Production Capacity Profile's
   admitted preparation and commit bounds.

An unrelated Editorial draft or Editorial lease does not block a path-only
closure and is never reset or transferred. An affected Placement lease is not
automatically taken over or fenced merely because D83 exists. It blocks when
the qualified adapter must advance that Placement head, when unacknowledged or
independently changing Placement work exists, or when the exact dependency CAS
cannot preserve the editor's work. Otherwise the later Placement save must
bind the new ancestor/closure dependency generation and refresh on conflict.

A descendant with a current acknowledged independent Placement input may stay
in the closure only when that exact input is already included in the D2 plan,
remains source-owned and mechanically compatible, and needs no merge or owner
decision. Any stale, inaccessible, cross-scope, independently reparented,
separately scheduled, protected, unknown-history, conflicting, over-capacity,
or otherwise non-deterministic member blocks the complete D80-D84 handoff.
Core then preserves every original fact and directs staff to the exact existing
D2 owner action. When a descendant-only conflict can be resolved while the
sealed source ancestor candidate and its Draft-only Path Claim remain current,
staff may repair that member and prepare the handoff again. When safety or
capacity requires cleaning/reverting the source ancestor first, that cleanup
supersedes/releases the root private claim and ends D82 adoption eligibility.
The target address then becomes an ordinary editable D2 suggestion, is not
reserved, and must win fresh commit-time validation; another claimant may take
it. Core SHALL state that consequence, never reconstruct eligibility from
History, and never promise that the same address remains available. This exact
owner-governed path is the permanent safe fallback, not an exceptional support
repair.

### Exhaustive claim outcomes

Every old derived private route effect in the sealed closure SHALL have exactly
one disposition at the post-commit boundary:

1. **successor private claim:** the obsolete source-derived current claim is
   superseded and the same descendant owns the newly compiled private key;
2. **public-pin convergence:** the newly compiled key equals the same stable
   descendant Page's exact current public canonical key, no independent
   Placement delta remains, and D2 supersedes the obsolete private effect and
   returns the Working axis to the public Placement result without a duplicate
   private claimant or redundant revision. D2 appends one cause-labelled clean
   successor only when the accepted representation and monotonic Working-head
   contract require it. When the old private key differs, that old-to-new
   address mapping still appears exactly once in the sealed plan, receipt, and
   staff affected count; or
3. **unchanged current private effect:** the old/new derived path and
   corresponding breadcrumb output are identical, so the same valid current
   private claimant remains. The member appears only in closure conservation/
   `closure_member_count`, not `changed_address_count`, and creates no revision,
   claim occurrence, or staff mapping; or
4. **block before mutation:** another Page/typed owner, protected or unknown
   route history, current reserved/source-owned route, lifecycle conflict, or
   any incomplete proof rejects the entire handoff.

There SHALL be no missing member, duplicate result, orphaned old private claim,
unowned interval, double claimant, silent suffix, or inference that ancestor
eligibility proves descendant eligibility. Zero-effective-derived-output
members whose old/new path and corresponding breadcrumb output are identical
do not inflate the affected count shown to staff.

Stable Page-identity references continue to point to the same descendant and
resolve through the applicable compiled Placement. Literal path strings in
rich text, settings, integrations, or external systems are not rewritten by
D83. A known incompatible literal dependency uses its existing owner action or
blocks; absence from a best-effort scan is not affirmative proof that none
exists.

### Bounded preparation and one atomic business transition

D2 MAY prepare one sealed, digest-bound successor plan and impact artifact in
bounded, resumable chunks while the old source candidate remains authoritative.
The artifact MAY be content-addressed if the accepted D2 design chooses; D83
does not mandate a private closure manifest or head. Prepared work is not
current route authority. A complete sealed plan MAY be inspected and previewed
only through an exact authorized plan-bound private preview; it cannot serve a
current/public route or report a successful handoff until commit. It binds at
least:

- trusted scope, root source and target Page identities, source/target
  Placement and Working heads, and exact clean source public pin;
- stable member Page/Placement identities, exact authored-input and expected-
  head/dependency versions, old/new canonical-key digests, breadcrumb/route-
  delta digests, and exhaustive claim dispositions;
- scoped structural/parent dependency, exact relevant public Placement/
  revision/route-policy dependency digest, canonicalizer, normalization,
  reservation, schema, renderer, adapter, and permission/effect generations;
- relevant lease and schedule/release dependencies;
- authoritative `closure_member_count`, staff-facing `changed_address_count`,
  capacity-profile cell, plan/content digest, preparation status, and expiry/
  staleness evidence; and
- the one D80-D84 semantic command identity and canonical request digest.

`closure_member_count` covers every sealed member/outcome used for conservation
and capacity. `changed_address_count` covers every old displayed private key
that differs from the clean result, including public-pin convergence, and
excludes members whose old/new path and corresponding breadcrumb output are
both identical. Breadcrumb-only work is outside D83's path-change scope. Large plans store authorized
detail in D2's accepted impact artifact; the D80-D84 receipt references its
immutable digest and both counts instead of embedding thousands of paths or any
Page body.

Commit SHALL first reconcile an already-committed identical semantic receipt,
then freshly authorize and revalidate every bound fact. In one short, proven
PostgreSQL transaction and one documented deterministic resource order, it
SHALL:

1. win or reconcile the scope-bound semantic receipt;
2. fence the exact source, target, public-pin, Placement, closure, claim,
   structural, policy, lease/dependency, and effect versions;
3. determine the exact sealed D81/D82/D83 predecessor-effect manifest, derive
   its post-clean/pre-target sibling cohort, and validate D84's tagged boundary
   or resolve append-last against that same baseline;
4. apply the complete sealed D2 successor plan and exhaustive member outcomes
   through D2's current Placement/claim boundaries, without adding a private
   closure serving head;
5. perform D82's exact root Draft-only Path Claim succession to the target;
6. create the complete private D80 target with its fresh D84 order, append
   D81's protected checkpoint and clean source successors, advance only required
   Working heads, and apply the qualified sealed-pair lease fences;
7. append immutable plan/closure/claim provenance, the extended D80-D84 receipt,
   business audit, and durable outbox; and
8. commit every effect or none.

Physical write order may differ only when the same final semantic topology is
proved. No immutable prior revision is mutated; only the sealed predecessor
manifest may advance affected heads/change source-clean or derived state, and
D84 causes no additional pre-existing Page parent/order write.

The accepted D2 design SHALL choose the smallest qualified representation that
preserves these behaviors. A digest-bound impact artifact MAY drive a bounded
set-based transaction, but it never becomes current route authority. Every
authoritative current Placement/head/claim mutation must fit the active D33
measured maximum. If it cannot, staff use the fallback below; D83 SHALL NOT
invent a private closure head to evade that bound. It SHALL NOT recursively
re-save child Payload documents, execute one HTTP request per child, hold locks
during user input or network I/O, expose authoritative partial batches, or use
a D83-specific saga, queue, background compensation, or second serving head.
An existing qualified D2 executor MAY distribute inert preparation chunks;
`SKIP LOCKED` MAY NOT determine closure membership, omit an outcome, or
participate in authoritative commit/cleanup.

Locks and compare-and-set predicates use stable scoped identifiers rather than
the paths being changed. Every writer acquires resource classes in one
documented order. A deadlock or serialization failure aborts the whole attempt
and replays the complete semantic command against fresh state; it never retries
only one child. The semantic key binds the canonical request, sealed-plan
digest, and reviewed relevant-dependency digest. The final relevant serving
generation is recorded in the committed receipt/audit but is not part of the
idempotency key, so a safe D1 dependency refresh does not become different
input. The
same key plus identical input reconciles the one durable effect, but receipt
presentation is reauthorized now: full detail requires current read authority;
otherwise D81's non-enumerating detail-free committed result appears. The same
key plus different input is a conflict. A lost response freezes successor
writes and reconciles the effect before retry or editing.

### Structural, RLS, and authorization boundary

D2 remains the sole owner of hierarchy traversal, canonical compilation,
private route-claim exclusivity, sealed closure plans/impact artifacts, and
claim succession. D12
owns immutable Placement history, Working heads, leases, and recovery. D1 owns
the public generation and serving head. D80-D84 compose one material-purpose
handoff and one receipt. Navigation, continuity, schedules, specialized routes,
safety, Trash, references, and providers remain separately owned.

The accepted model SHALL structurally provide:

- same-scope composite primary/foreign keys for every parent, Placement,
  closure member, claim, head, receipt, and audit relationship;
- non-null authoritative Tenant/environment/Site/locale/resource owners and
  restrictive lifecycle/delete behavior rather than cascade erasure;
- at most one current Placement Working head per exact resource and at most one
  current claimant across every typed owner competing for a canonical key;
- cycle, self-parent, depth, normalization, reserved-key, and closure-
  conservation enforcement at D2's sole mutation boundary;
- equality-leading indexes matching scoped parent traversal, current-head,
  accepted plan-member, claim-CAS, receipt, and authorization predicates; and
- append-only revision, claim-history, receipt, and business-audit evidence.

Exact table names, a materialized-path versus recursive-query helper, and the
physical current-claim/head representation remain design choices proven
against production-shaped plans. D83 SHALL NOT create a parallel hierarchy,
route table, current-owner cache, child mutation hook, or duplicate uniqueness
surface.

Browser, anonymous, and ordinary authenticated Data API roles receive no
direct authoritative D83 plan/claim/head/revision/receipt DML of any
cardinality. Only the trusted command boundary may mutate. Where exposed relations use RLS, updates prove the
authorized old row with `USING`, the permitted resulting scope with `WITH
CHECK`, and required `SELECT` access independently. Tenant, actor, author,
owner, effect, and audit attribution come from trusted server context, never
caller fields. Payload Local API, functions/RPCs, views, workers, service/
`BYPASSRLS`, imports, migrations, support, and repair paths reproduce the same
scope and effect checks. Any security-definer function uses a least owner,
schema-qualified objects, pinned empty `search_path`, revoked default execute,
and explicit server authorization; security invoker is preferred.

Payload and D2 writes must participate in the same proven PostgreSQL
transaction and actor-bound request. A Payload transaction plus a separate
Supabase HTTP/RPC call is not atomic. If one shared boundary cannot be proved,
D83 remains unavailable and staff use ordinary D2 cleanup first.

### Focused Web Studio experience

D83 stays inside D80-D82's existing PageShell consequence review. It adds no
RadioGroup, checkbox, modal, wizard, typed confirmation, destructive color,
second primary action, per-child approval, or mandatory full-list opening.

When at least one effective descendant address changes, an always-visible
summary immediately above the existing outcome rows states:

> **2 related draft addresses will update**  
> These Pages stay under About. Their private addresses will be recalculated
> from About's current `/about` location. Their live addresses and Navigation
> will not change.

The permission-safe `changed_address_count` is always visible after preparation;
`closure_member_count` remains the conservation/capacity fact and is not
substituted for it. Small closures use D2's concise exact mapping review; larger closures reuse D2's
existing searchable, resumable impact view. A disclosure may say **Review 2
address changes**, but opening it is optional because the one existing **Move
saved changes to new Page draft** action is the closure-level confirmation.
There is no D83-specific small/large threshold.

An expanded row uses Page title only with current read authority and states
scope and outcome plainly:

> **Our team · Draft address change**  
> **Current saved address:**  
> `https://hoperelief.org/serve/short-term-teams/our-team`  
> **After the handoff:** `https://hoperelief.org/about/our-team`  
> **Live address stays:** `https://hoperelief.org/about/our-team`

If some details are restricted, D2 uses its existing authorized aggregate and
detail rules. Core never leaks a hidden Page title, path, owner, Site, locale,
or existence. If the actor cannot receive enough aggregate consequence detail
to understand and authorize the complete effect, the handoff blocks with **You
don't have access to complete this Page-tree review. Ask someone with
permission to manage this Site's Page tree. Nothing was moved.** It reveals no
restricted count, title, path, owner, or existence and does not show a
misleading partial list.

Persistent states distinguish preparation, staleness, ownership, capacity, and
unknown outcome:

| State                     | Staff copy and action                                                                                                                                                                                                                                    |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preparing                 | **Checking related Page addresses...** Existing fields remain readable; the primary action waits.                                                                                                                                                        |
| Ready                     | **2 related draft addresses will update.** Exact public/non-public meaning stays visible.                                                                                                                                                                |
| Descendant Placement work | **Related Page address work changed since this review. Review the Page tree, then try again. Nothing was moved.**                                                                                                                                        |
| Permission-safe block     | **You don't have access to complete this Page-tree review. Ask someone with permission to manage this Site's Page tree. Nothing was moved.**                                                                                                             |
| Collision/protection      | **One related Page cannot use its recalculated address. Review the affected addresses. Nothing was moved.** Authorized detail names the exact cause.                                                                                                     |
| Stale tree/plan           | **The Page tree changed since this review. Review the updated addresses. Nothing was moved.**                                                                                                                                                            |
| Over capacity             | **This change affects more related Page addresses than can be processed safely at once. Review the Page tree first. If About's saved address is cleaned, the new Page address must be checked again and may no longer be available. Nothing was moved.** |
| Proof unavailable         | **We couldn't verify the related Page addresses right now. Nothing was moved. Try again.**                                                                                                                                                               |
| Committing                | **Moving saved changes and updating related draft addresses...** Inputs remain visible; duplicate submission is unavailable; interruption reconciles the receipt.                                                                                        |
| Outcome unknown           | **Checking whether the changes were moved...** Receipt reconciliation runs before another mutation.                                                                                                                                                      |

Errors preserve inputs. A failed submission moves focus once to the linked
error summary; activating a summary link moves focus to its repairable control.
A toast is never the sole evidence. Success opens the target
only after fresh read/edit and lease proof, focuses its heading, preserves
**Draft - not live**, and persistently says:

> **Saved changes moved**  
> Short-term team application is a private draft. About and its 2 related
> Pages remain in their current Page tree. Their private addresses were
> recalculated. Nothing was published, and Navigation did not change.

The surface reuses PageShell, Base UI, base-maia/Zinc, Core Field and status
patterns, and the existing disclosure/search components. It preserves one DOM
and visual order, native headings/lists/buttons, visible focus, 44-CSS-pixel
targets, 320-CSS-pixel and 400-percent reflow, forced colors, reduced motion,
keyboard and screen-reader operation, and polite complete status messages
without focus theft. Old/new paths stack on narrow screens, remain selectable,
wrap rather than truncate, and use bidi isolation for RTL/CJK/long input.

There is deliberately no donor, visitor, missionary, or public UI. The best
public experience is provable non-change.

### Preview, public, Vercel, and money boundary

Old preview credentials remain bound to their exact old private revision/plan
and are never retargeted. Every use reauthorizes current exact preview/read
scope; denial after access or retention loss is non-enumerating. A credential
is routing context, never bearer authority. A prepared or committed successor
preview binds the new exact sealed plan under fresh authority and remains
private, `no-store`, and `noindex`; preview never makes it current route truth.

D83 makes zero changes to the activated D1 public generation, Page identity,
public canonical path, breadcrumb, Navigation, redirect, repair, sitemap,
search, cache identity, donor result, branded host, or public response. It
therefore makes zero Vercel Domain, project, deployment, rewrite/redirect,
Routing Middleware, DNS, TLS, host, CDN, or cache API calls. It also makes zero
Stripe, currency, gift, recurring, ledger, receipt, form, donor-account, CRM,
email, analytics, or other external-provider/money effect. Qualified same-
database Payload persistence, the internal durable outbox, and private Web
Studio projection recovery remain allowed and non-authoritative.

### Migration, rollout, proof, and observability

Rollout SHALL use expand; complete hierarchy/route/claim census; quarantine of
duplicates, cycles, missing parents, cross-scope edges, nullable owners,
Unicode-equivalent keys, and unknown history; exact Site/locale/parent/public-
private provenance backfill; shadow closure compilation; constraints/indexes;
old-writer fence; qualified D2/Payload owner adapter; limited cohort; then
contract. Old-code/new-data and new-code/old-data readers remain compatible or
deployment fences incompatible readers before cohort activation. At least one
qualified reader can interpret every committed plan/receipt throughout
rollback. Uncommitted preparation may expire; every artifact needed to render
committed History or an authorized old preview is immutable and retained under
the governing D2/D12 history policy. Mixed schema, canonicalizer, policy,
adapter, or writer generations fail closed. Rollback disables new D83 commands
and rolls forward repairs from receipts; it never destructively rewinds
committed source/target history.

Durable audit records actor/effect, trusted scope, root/source/target identities,
sealed-plan digest, `closure_member_count`, `changed_address_count`, expected
and resulting heads, claim dispositions, reviewed dependency and final relevant
serving generations, compiler/policy/profile generations, semantic receipt,
outcome, and time. Raw private paths and renderable plan detail remain only in
authorized business artifacts under owner retention. Broad logs/metrics use
opaque IDs or keyed environment-scoped telemetry tokens—never Page bodies, raw
paths, content-addressed plan digests, or guessable per-path hashes—and never
replace business History.

Production monitors and responses are:

| Signal                              | Threshold                                                                                                                                                                                                                                                                 | Owner                             | Response                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `D83_PARTIAL_OR_CROSS_SCOPE_EFFECT` | Any occurrence                                                                                                                                                                                                                                                            | Data Integrity + Security on-call | Disable D83; preserve receipt/claim evidence; fence affected scope; repair forward and rerun full authorization proof. |
| `D83_CLOSURE_RECEIPT_MISMATCH`      | Any plan/member/count/outcome mismatch                                                                                                                                                                                                                                    | Web Studio + D2 owner             | Stop new handoffs; verify compiler, dependency fence, and receipt integrity; repair from authoritative history.        |
| `D83_PUBLIC_OR_EXTERNAL_EFFECT`     | Any public-delivery route/Navigation/cache/search, Vercel/external-provider, or money effect or call                                                                                                                                                                      | Web Platform on-call              | Kill-switch D83; restore authoritative D1 behavior; investigate owner-boundary breach.                                 |
| `D83_TRANSACTION_BUDGET`            | Any hard per-attempt limit or evidence-qualified alert ceiling in the active D33 scenario is breached                                                                                                                                                                     | Database/SRE                      | Lower the admitted closure bound; route larger cases to the truthful D2 fallback; requalify before restoring.          |
| `D83_STALE_REVIEW_BURDEN`           | The non-null evidence-qualified stale-plan ceiling in the launch Operational Qualification Attachment is breached; that attachment defines numerator (ready plans rejected solely for freshness), denominator (eligible prepared submissions), window, and minimum sample | Web Studio Product + Platform     | Inspect dependency scope, Placement/head churn, and review timing; improve preparation/recovery without weakening CAS. |
| `D83_UNAUTHORIZED_DETAIL`           | Any unauthorized aggregate or descendant disclosure                                                                                                                                                                                                                       | Security on-call + Web Studio     | Disable affected detail surface, invoke incident response, correct policy/projection, and rerun negative tests.        |

## Consequences

- Staff finish one rare but coherent material-purpose handoff without a second
  Page-tree cleanup when the descendant result is fully mechanical.
- Descendant Page ownership and authored Placement meaning remain stable; only
  D2-owned private derived outputs change.
- The exact affected count is visible, while detailed review remains
  proportional and permission-safe.
- High fan-out reuses D2's bounded sealed plan and one D33-admitted atomic
  business transition rather than recursive provider writes, a second private
  head, or a long unproved transaction.
- Any independently semantic, stale, protected, inaccessible, or over-capacity
  child preserves atomicity through its exact ordinary D2 owner action. If that
  action releases the root claim, the target address becomes an unreserved
  ordinary suggestion and may be lost; D82 is never reconstructed from History.
- The implementation cost is bounded closure provenance, phantom-safe fencing,
  claim conservation, and hostile concurrency proof. Those are existing D2/
  D12 correctness costs, not a new D83 subsystem.
- Donors and public delivery observe no change.
- ADR-0205 independently governs only the fresh target's initial sibling
  position. D83 still changes no source or descendant sibling order.

## Rejected alternatives

- **Require source-tree cleanup first for every descendant:** safe fallback but
  needless staff work when D2 can prove a complete deterministic private result.
- **Require staff to open and confirm every descendant:** duplicates D2's one
  closure-level confirmation and becomes unusable for large trees.
- **Recursively update/resave Payload child documents:** makes provider hooks
  authority, risks partial/false success, rewrites unrelated fields/history,
  and scales with HTTP/document hooks rather than D2's closure model.
- **Mutate existing Placement revisions or relabel ownership:** corrupts
  immutable history and makes recovery/audit untrustworthy.
- **Copy, move, or reparent the subtree to the target:** changes public meaning
  and separately owned facts without a founder decision.
- **Release and reclaim descendant paths in batches:** exposes partial trees,
  races other claimants, and violates closure conservation.
- **Queue/saga/background compensation:** adds a second lifecycle and permits a
  partially cleaned source for a staff convenience that must be atomic.
- **Infer child eligibility from the root or current-row absence:** misses
  protected history, another owner, normalization equivalence, and stale state.
- **Rewrite literal links or Navigation:** crosses owner boundaries and can
  change content/public behavior.
- **Create D83-specific thresholds, tables, capability, resolver, or impact
  UI:** duplicates D2/D12/D33 and creates avoidable technical debt.

## Activation boundary

This ADR records accepted target architecture only. D83 remains unavailable
until D1/D2/D12/D33/D79-D82, same-scope hierarchy and claim constraints,
complete route provenance, bounded/resumable preparation, one atomic closure/
handoff transition, old-writer fencing, exact authorization/RLS/grant/
privileged parity, Payload transaction qualification, closure/claim/head/lease/
schedule races, exact replay and failpoints, migration/rollback, public/
Vercel/money zero-effect, capacity, privacy, accessibility, weak-network, and
representative ministry-staff comprehension proof all pass.
The fresh target also requires ADR-0205's positive reviewed-gap or known append-
last provenance, final-topology validation, fresh target order representation,
and zero D84-caused pre-existing Page parent/order writes outside the sealed
D81/D82/D83 effect manifest; unknown or stale position provenance uses ordinary
D2 review before the handoff can commit.

Ratification changes no runtime, schema, migration, Supabase policy, OpenSpec,
ticket, Vercel configuration, deployment, public route, Stripe state, or
production behavior.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](./0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](../prds/sitestacker-parity/phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](./0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [ADR-0202 - Material-purpose Page Handoffs append clean source Working successors](./0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [ADR-0201 - Material Page-purpose changes create independent Pages](./0201-material-purpose-changes-create-independent-pages.md)
- [Phase 24 D83 adversarial review](../prds/sitestacker-parity/phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Payload Nested Docs](https://payloadcms.com/docs/plugins/nested-docs)
- [Payload transactions](https://payloadcms.com/docs/database/transactions)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)
- [Sanity hierarchy](https://www.sanity.io/docs/content-lake/hierarchy)
- [Sanity transactions and revision guards](https://www.sanity.io/docs/content-lake/transactions)
- [WordPress Page hierarchy](https://wordpress.org/documentation/article/create-pages/)
- [PostgreSQL recursive queries](https://www.postgresql.org/docs/current/queries-with.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL serialization retry](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel rewrites](https://vercel.com/docs/routing/rewrites)
- [Google URL-change guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [WCAG 2.2 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html)
- [WCAG 2.2 On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
- [WCAG 2.2 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
