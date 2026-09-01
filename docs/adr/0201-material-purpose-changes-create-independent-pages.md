# ADR-0201: Material Page-purpose changes create independent Pages

**Status:** Accepted with required amendments (Phase 24 D80 — 2026-08-31)

## Context

Phase 24 D78 permits one exact historical ordinary-Page address to lead to a
different General Page only after an authorized owner compares the two exact
public releases and confirms the same public subject, substantive purpose, and
intended visitor task. D79 then lets routine releases of that stable target Page
reuse one sparse Page Purpose Continuity Version after the Page owner explicitly
confirms that the effective release keeps what the Page is for. It deliberately
blocked a candidate declared to change the Page's purpose until D80 chose the
permanent outcome.

Reusing the existing Page identity for a genuinely different subject, purpose,
or visitor task is unsafe even if Core makes its historical routes not-found.
An old address might previously have produced a cacheable permanent redirect to
the current canonical URL. Core can change later origin responses and its own
caches, but it cannot prove that every browser, intermediary, search system,
bookmark, printed link, or external reference has forgotten the association.
More fundamentally, the canonical URL itself would begin identifying a
different public resource than visitors expect.

W3C Web Architecture ties URI persistence to consistent, predictable
representations judged with user expectations in mind. RFC 9110 defines 301 and
308 as permanent-URI assertions and makes them heuristically cacheable. Current
Google guidance says redirects should map to corresponding replacements and
warns that irrelevant redirects confuse visitors and may be treated as soft
404s. Current WordPress and Contentful products demonstrate the useful UX
pattern of copying authorable content into a separate unpublished item, but
their generic duplicate operations do not supply Core's Site, locale, route,
reference, authorization, publication, or historical-address invariants.

No external standard mandates a particular CMS button or decides ministry
meaning. The new-Page boundary is a Core product judgment derived from those
Web invariants and D78/D79's stricter repository promise. Materiality remains an
explicit accountable human judgment; Core does not infer it from prose, fields,
traffic, redirects, embeddings, or AI.

Current `develop` still has Tenant-scoped Payload Pages with a mutable slug,
mutable `pageType`, provider drafts, and latest-published reads. It has no
accepted Site/locale Page identity, D1 Public Site Generation, D2 Placement
Revision, D76/D78 relation, or D79 continuity state. Proposed Phase 23 ADR-0145,
ADR-0146, ADR-0150, ADR-0156, ADR-0167, and ADR-0177 remain blocked in PR #1340. This
decision therefore records target architecture only and cannot be implemented
as a wrapper around today's template or Payload duplicate endpoints.

## Decision

### A material-purpose change always continues as a new Page

When an authorized Page publisher selects **This update changes what this Page
is for** in D79's existing D1 consequence review, Core SHALL NOT publish that
candidate through the existing Page identity, current canonical route, or any
historical address associated with that Page. The review SHALL instead offer
one contextual **Move saved changes to new Page draft** continuation.

This is a universal D80 rule. Core SHALL NOT offer an in-place direct-only
exception based on redirect history, analytics, traffic, cache observation, or
a staff override. Redirect history can prove that a risk exists but cannot
prove that all external agents have forgotten a Page or that the canonical URI
still names the same resource. Removing the branch also avoids a new route-
history inventory and resolver solely for material-purpose publication. D77's
already-required small critical-path owner inventory remains unchanged; D80
does not expand it.

D79's **keeps what this Page is for** lane remains the low-friction answer for
normal evolution: wording, design, accessibility, staff names, contact details,
images, and other changes may remain on the stable Page whenever the authorized
publisher truthfully concludes that its public subject, substantive purpose,
and intended visitor task are unchanged. If staff chose **changes** by mistake,
they return to editing/review and make the correct D79 choice; D80 adds no
semantic classifier or override.

Because the existing Page does not publish, D80 SHALL NOT create or advance a
successor Page Purpose Continuity Version. The existing Page's current
continuity head and every D78 relation remain unchanged. The new Page starts
with no inherited D78 relation or D79 continuity state; if it later acquires a
different-Page historical address, the ordinary D76-D79 rules create its own
sparse state from fresh evidence.

### One narrow same-Site independent-draft command

**Move saved changes to new Page draft** SHALL operate only on one exact acknowledged D12
Working Revision that the current D1 review already classified as a material-
purpose candidate. It creates one fresh independent `general_page` identity in
the same exact Tenant, deployment environment, Site, and BCP-47 locale, with
one fresh locale lineage, fresh Page-local block and anchor identities, one
separately reviewed D2 Placement Revision, and one private Working Revision.
It never selects another Tenant, Site, locale, or Page family and never becomes
a generic **Duplicate Page** action.

The target receives one explicitly reviewed Page title, D2-eligible parent
choice, and local web-address segment. **Top level** means the existing ordinary
placement directly under the current Site root; it never creates, replaces, or
reassigns the root/Home Page. Core
may suggest the title-derived segment, but staff review it and the complete
tenant-branded proposed URL. The server normalizes and validates it through D2.
The route claim must be distinct from the source's current and historical
**public** routes and every reserved, protected, active, unrelated draft-
claimed, Trash-retained, or source-owned route in the same Site and locale.
ADR-0203/D82 permits one exception only: the exact sealed source **Draft-only
Path Claim** may be superseded while a fresh target claimant-ownership
occurrence/version for the same D2 canonical key is appended inside the same
D80-D84 transaction. Complete
positive route-effect history, current source-claim ownership, fresh target
identity, and one namespace-wide database winner are mandatory; private source
Revision History remains evidence rather than a claim. A database constraint
and commit-time proof decide uniqueness; the UI never overwrites, silently
appends `-2`, or treats a preflight availability check as a reservation.

ADR-0204/D83 permits that transaction to include one completely qualified
source-owned descendant draft-path closure. D2 preserves every descendant
Page identity and authored Placement input, prepares the exact old/new derived
path/breadcrumb/claim outcomes, and atomically establishes the clean source-
tree successor closure. No child or Navigation fact transfers to the target.
Any stale, inaccessible, protected, independently incompatible, or over-
capacity closure uses ordinary D2 cleanup first.

Creation reserves a proposed Page placement only. It creates no public route,
canonical URL, redirect, rewrite, Navigation membership, sitemap/search entry,
cache result, or serving generation. The future self-canonical URL is derived
only if that new Page later passes its own ordinary D1 release.

### Reuse the bounded transfer compiler, not provider duplication

D80 SHALL reuse the finite, versioned transfer-manifest compiler, exact-
revision fencing, repair classification, atomic/idempotent receipt, and owner
adapters already required by proposed Phase 23 D23/ADR-0167. It adds one narrow
same-Site policy profile to that product-owned compiler; it does not widen the
user-facing **Copy to another Site...** command, create an adapter framework,
or authorize arbitrary same-Site cloning.

The manifest classifies every admitted field, rich-text node, semantic block,
certified custom block, and relationship as **copy**, **materialize/remap**,
**review after creating**, or **never copy**. Unknown or incompatible members
fail closed. Eligible Page-owned editorial content and compatible SEO copy may
copy. Page-local identities and local anchors are fresh and deterministically
remapped. Reusable Sections materialize as fresh Page-local content so the old
and new purposes do not gain hidden live coupling; staff may deliberately
select a shared section later. Exact self-references remap to the new Page;
qualified same-Site references to other stable Pages and safe Tenant Media may
remain only after current target-use validation. Absolute internal URLs,
embeds, dynamic-source bindings, Media, and other owner relationships are
revalidated and either retained under their owner contract, disclosed as
review/repair items, or rejected. Nothing silently disappears or becomes safe
because it existed on the source candidate.

Source placement/path, Navigation and incoming-link authority, folders,
Topics, saved views, active-editor state, comments, approval, schedule,
publication, Page Purpose Continuity Versions, D78 relations, public
generations, search/sitemap/cache state, analytics/provider identifiers,
public timestamps, Trash/lifecycle, Site settings, safety findings, audit
identity, and operational or money facts never transfer as target authority.
Copy provenance is one immutable, protected, non-authoritative link between
the exact source candidate and new Page for audit, recovery, and help. Editing,
preview, D1, routing, D78, search, Trash, and public reads never dereference it
as a live dependency, equivalence claim, successor, or synchronization source.

### The source Page remains public as-is and receives an append-only clean draft

The source Page's currently published release, canonical route, public
generation, continuity head, D78 relations, Navigation membership, schedule,
search state, analytics identity, and every other source-public or separately
owned fact outside ADR-0202's explicit source Working Revision disposition SHALL
remain unchanged. No historical address is transferred, retired, redirected,
or requalified. Any later unpublish, retirement, path move, replacement, or
fresh D78 qualification is a separate explicit owner action under its existing
contract.

The material candidate cannot remain an unlabelled ordinary publishable draft
on the source after target creation: that would recreate the exact D80 footgun.
Nor may Core silently destroy mixed routine edits. Per ADR-0202, the same short
transaction appends one protected logical source-handoff event grouping
independently resource-scoped checkpoint pins for the exact Editorial/
Placement candidate pair, creates the complete private target, appends a clean
private successor for each changed source-owned axis from the exact revision
pinned by the same current D1 public generation, advances those source Working
heads, and fences every old lease generation in the sealed source Editorial/
Placement pair—or does none of those.
An unchanged axis receives no no-op revision. Shared/global, Navigation,
schedule, public, continuity, provider, operational, and money owners do not
reset implicitly.

The exact untransformed candidate remains recoverable in protected source
history. The target contains every safely transferred meaning as D80's
deterministic fresh-identity result; any repairable omission is explicit and
remains recoverable in source History. It is not a byte clone.
The source candidate can never publish under the old identity without a new
D79 review. Ordinary retention/privacy/legal-hold owners remain authoritative,
but provider pruning alone may not break the promised recovery.

### Focused Web Studio experience

Selecting D79's material-change RadioGroup item performs no mutation, opens no
modal, navigates nowhere, and does not move focus. It reveals one main-column
continuation panel in the existing D1 consequence review, after the choice and
before the final action:

> **This update needs a new Page**
>
> Keep **About** at its current address for its current purpose, and create a
> separate private Page draft for this new purpose. Nothing will be published
> now.

The panel shows two stacked summaries at every viewport:

> **Current Page · Stays live as-is**<br>
> About<br>
> `https://hoperelief.org/about`
>
> **New Page draft · Not live**<br>
> Main Website · English (US)

It then shows only **Page title**, **Parent Page** (including **Top level** under
the current Site root), and **Web address**. Site, domain, locale, family, source revision, and current-Page URL are fixed,
permission-safe context, not editable hidden fields. The full proposed URL is
visible and copyable. Consequence copy states:

> **What happens**
>
> - A new independent private draft is created from these saved changes.
> - About, its public address, and its historical addresses stay unchanged.
> - Navigation, existing incoming links, schedules, and public search stay
>   unchanged.
> - Any copied items that need attention will appear in the new draft.

Immediately above the primary action, the review adds **About · Stays live;
these Page changes leave its draft**, states that nothing will be published,
separately managed content stays unchanged, and the exact saved source version
remains protected in History, and says **If any of these changes still belong
on About, go back and separate them before moving.** The primary action is
**Move saved changes to new Page draft**; the
secondary action is **Back to editing**. This is
not destructive styling, a warning modal, a checkbox, typed confirmation,
wizard, target search, redirect console, access-request flow, or donor-facing
interstitial. If the actor lacks the existing Page-create effect, the panel
preserves the candidate and says that someone with Page-create access must
perform the step; D80 adds no role, invite, assignment, approval, or exception.

Preflight states use plain cause-owned text: **Save these changes first**,
**Checking the new Page and About...**, **Ready to move · Nothing will be
published**, **Review after moving**, **Fix items before moving**, or **That web
address is already in use**. The
occupying Page is identified only with existing read authority. Source/head,
permission, manifest, route, or policy drift says **About changed since this
review. Review the latest saved version. Nothing was moved.** An uncertain
response says **Checking whether the changes were moved...** and resolves the
durable receipt before another submission is enabled. Commit says **Creating
the new Page and removing these Page changes from About's active draft...**.

After a fresh target read/edit and ordinary target-lease check, success
navigates in the same tab to the new Page editor, focuses its heading, and
persistently shows **Main Website · hoperelief.org · English (US) · Draft -
not live**, **Saved changes moved from About. About stays live; these moved Page
changes are no longer active there. Separately managed content was not changed.
Nothing was published**, any release-blocking repairs before review-
only items, and permission-safe **Open About** and **View source history**
links. Source Editorial/Placement history authorizes per axis; a receipt-bound
initial-target revision additionally requires fresh exact target-resource and
target-version/history read authority. The ordinary Navigation surface truthfully shows that the new Page is
not yet in Navigation. No essential result exists only in a toast, color, icon,
hover, animation, or optional preview. If the post-commit target check fails,
the surface instead shows a detail-free committed confirmation and does not
navigate or undo the handoff.

The experience follows PageShell, Base UI, base-maia, and Zinc patterns. It has
one semantic reading order, native labels and described errors, visible focus,
44-pixel touch targets, forced-color and reduced-motion support, bidi-isolated
wrapping URLs, long/translated/CJK/RTL content, keyboard and screen-reader
operation, 320-CSS-pixel/400-percent reflow, summary-first weak-network
rendering, preserved input after errors, focus to the error summary/first
invalid field, and polite announcements only for meaningful checking,
uncertain, failure, and success states.

ADR-0205/D84 adds one always-visible read-only **Page tree position** result to
that same placement group. D2 resolves Parent Page/Top level from trusted Site
state, never null/caller input. It preserves a position only through positively
proved command provenance for a still-valid tagged start/between/end/only
boundary; a positively recorded ordinary default appends at the tail of the
same post-D81/D82/D83 final baseline. Missing/unknown provenance and a stale
explicit boundary use ordinary D2 position review. Reviewed/default First/Last/
Only/Between and “at top level” copy remain distinct. No mandatory picker,
additional confirmation, or drag interaction is added. The row states that
Navigation and the live website do not change.

### Source of truth, authorization, atomicity, and failure safety

The Page/D1 owner owns source and target Page identities, revisions, family,
and public generations. D2 owns placement/path. D12 owns Working Revisions,
leases, checkpoints, and expected source revisions. D23's product-owned
transfer compiler owns the deterministic copy/repair plan. D78 owns each
historical-address relation; D79 owns the sparse existing-Page continuity
choice/head. Phase 12 owns actor effects. Phase 5 owns public request
resolution. Media, dynamic sources, forms, money, safety, Navigation, search,
and providers retain their existing owners. The D80 receipt coordinates these
authoritative references but owns none of their facts.

Commit requires D79's exact source release-decision effect, source Editorial
read/edit, source Placement edit/supersede whenever that axis differs, target
Page create/edit/placement, and D12 head/lease authority. Target Placement
authority cannot mutate source Placement. Every current lease in the sealed
source Editorial/Placement pair must be unowned or held by the initiating
authorized session; otherwise staff use D12's existing explicit return/takeover
flow before the D80-D84 handoff.

Preflight creates an immutable, expiring plan digest bound to the trusted
server-derived actor/effect epoch, exact Tenant/environment/Site/Page/locale,
source Editorial/Placement Working revision pair and effective dependency digest, D79 choice/current
continuity head, family/manifest/adapter/policy generations, target title,
selected Parent Page/Top-level choice, trusted resolved parent/root placement
owner, normalized proposed segment/path claim, repair manifest, and semantic
idempotency identity. Commit reauthorizes and revalidates every mutable input,
including lease/expected revision and route availability.

The plan additionally carries D84's positively qualified `reviewed_gap` or
`append_last` semantic disposition, D2 ordering-contract version, and explicit
stable closed boundaries when applicable. A rank/provider row never proves
intent. D2 derives one post-D81/D82/D83-clean, pre-target-insert baseline under
lock, then validates an explicit gap or resolves the current append tail, and
generates one fresh target order representation. It copies no source/provider
value. No immutable prior revision changes; only the sealed owner-qualified
D81/D82/D83 manifest may advance an affected head or change its source-clean/
derived state. D84 causes no additional source/descendant write and preserves
the relative order of pre-existing members in the resulting final cohort.

One short transaction through the authoritative owner port creates the target
identity, locale lineage, Working and Placement Revisions, remapped content,
repair manifest, inert provenance, protected source checkpoint event with
independent per-axis pins, necessary clean source Working successors and head
advances, sealed-pair lease-generation fences,
durable business receipt, audit, and outbox—or creates none. All qualified
Payload writes are awaited and share the same request transaction. No network,
Vercel, preview, media fetch, renderer, cache, search, analytics, notification,
Stripe, or provider call runs inside the transaction. If the required source/
target/continuity records cannot participate in one atomic persistence
boundary, D80 cannot activate; Core does not add a distributed transaction or
compensating saga for a private convenience.

An exact replay returns the same authorized target and receipt. Reuse of the
key with different source, revision, dependency digest, continuity head,
target title/placement/path, manifest, policy, public pins, source lease
generations, D84 position disposition/explicit boundaries/order-contract
version, or actor effect
fails as a semantic conflict and creates nothing. A later unauthorized replay
returns a non-enumerating result. A replay after target Trash/purge reports only
the currently authorized lifecycle result and never resurrects the Page. Two
tabs, a scheduled source publish, D78/D79 activity, a route claimant, lease
takeover, capability revocation, or deploy-version drift have one expected-head
winner; losers preserve source work and create no second target.

Browser/Data API roles SHALL have no direct mutation grant for D80 plans,
receipts, provenance, repair manifests, Page identity, placement, continuity,
route claims, audit, or outbox. Applicable exposed tables use least grants and
ENABLE/FORCE RLS, `SELECT`/delete `USING`, insert `WITH CHECK`, and update both
`USING` and `WITH CHECK`; append-only facts expose no direct update/delete.
Composite same-scope keys, restrictive deletes, non-null owner references,
unique target identity/path/semantic-command constraints, and equality-leading
indexes make cross-Tenant/Site/locale relationships and duplicate effects
structurally invalid. Views, RPCs, security-definer functions, table owners,
service/BYPASSRLS roles, workers, Payload Local API, migrations, imports,
support, and repair paths repeat the same authorization and expected-head
proof. Privileged functions use least-privileged owners, schema-qualified names,
and an empty pinned `search_path`.

Payload remains a qualified private authoring/persistence adapter. Its native
duplicate and copy-to-locale controls stay disabled; Local API calls pass the
authenticated principal, `overrideAccess: false`, `overrideLock: false`,
`fallbackLocale: false`, explicit draft status, depth-zero relationships, and the shared transaction
request. Supabase Auth and Phase 12, not Payload or browser form state, supply
identity and authorization. Supabase RLS is defense in depth for exposed Core
tables and is never claimed to constrain a privileged direct Payload database
connection; exact command-port parity is mandatory.

### Public, donor, Vercel, and money boundaries

D80 draft creation has zero public effect. Donors and visitors continue to see
the tenant-native old Page at its current URL and any already qualified
historical addresses. They see no transition status, platform/Asym/Vercel
branding, interstitial, extra hop, partial Page, or new route. The new draft is
private, `no-store`, and `noindex`; authorized preview names exact Site, domain,
locale, and revision. Only its later ordinary D1 release can compile a route,
canonical, search/sitemap projection, cache tag, and public Page.

D80 sends no Vercel Domains/redirect/deployment request and writes no DNS, TLS,
CDN, middleware, project, host, route-config, or provider cache state. The new
path is Core/D2 data until D1 activation, so Vercel limits and asynchronous
domain verification are not in the transaction. D80 also creates no Stripe,
merchant, bank, currency, price, gift, recurring schedule, ledger, designation,
receipt, form submission, email, or donor-account fact. References to those
owners transfer no authority and are rechecked by their normal release gates.

### Rollout and proof boundary

D80 cannot activate before accepted Phase 23 Site-owned stable Page identity,
exact locale Editorial and Placement Revisions, D12 acknowledged Working
Revisions, D1 generations, D2 route constraints, the D23 transfer compiler, an
active D33 Production Capacity Profile version with a named complete D80-D84 handoff scenario
across all three cohorts, its Capacity Evidence Package and matching exact
Vercel Qualification Attachment, D76-D79 state, ADR-0202's protected source
checkpoint/clean-successor/lease-fence contract, the Phase 12 owner port, and
one adverse-first Phase 5 reader are implemented and proved. No interim command may duplicate today's
Tenant-only Payload document.

Rollout is expand/additive: add versioned readers/compiler behavior and
constraints, suppress raw provider duplication, shadow preflight with no write,
prove hostile scope/route/reference cases, enable the private action for one
Tenant cohort, then permit target creation. Old writers are fenced from
publishing a D79 **changes** candidate. Mixed code/schema versions fail the
command rather than omit unknown fields or copy authority. Rollback disables
new D80 creation, preserves all committed Pages/receipts/history, and continues
ordinary Page editing/public serving; it never deletes a created target or
re-enables in-place material publication. Forward repair uses retained readers
and a newly proved command.

## Consequences

- A genuinely new public subject, purpose, or visitor task receives a genuinely
  new stable Page identity and proposed route. Routine Page evolution remains
  low friction through D79's preserve lane.
- D80 never advances the old Page's continuity head and never carries D78
  relations. This corrects D79's previously deferred placeholder.
- The rule is universal and therefore removes redirect-history branching,
  direct-only exceptions, a second public outcome, and a speculative cache-
  history resolver.
- Staff retain every safely transferable saved meaning without retyping, see
  explicit repairable omissions in one review, receive a clean source draft,
  and create nothing public. The exact untransformed source candidate remains
  protected in History.
- The bounded transfer compiler gains one contextual same-Site policy profile,
  not a general clone product. Raw provider duplication remains disabled.
- Navigation, links, schedules, public search, analytics, historical routes,
  owner facts, Vercel, and money remain untouched until their existing owners
  receive later explicit actions.
- The command costs manifest coverage, route/reference validation, atomic
  creation, idempotency, accessibility, and production-shaped proof, but avoids
  the much larger cost of in-place route repair, semantic diffing, workflow, or
  synchronization.

## Rejected alternatives and unsafe interpretations

- in-place material publication followed by not-found historical routes;
- blocking until every old address receives a new disposition and then
  repurposing the existing canonical Page;
- a direct-only exception, route-history heuristic, traffic/cache observation,
  browser telemetry, or staff acknowledgement that external redirects are safe;
- advancing the source Page's continuity head or copying continuity/D78 state to
  the target;
- generic same-Site **Duplicate Page**, native Payload duplicate,
  `duplicateFromID`, silent numeric suffix, clipboard copy, or reusing today's
  template flow as the product command;
- copying the old placement, canonical URL, Navigation, schedule, approval,
  publication, search/cache, analytics, Trash, safety, operational, or money
  truth;
- live source-target synchronization, inherited overrides, recursive graph copy,
  merge, overwrite, bulk replacement, or background distribution;
- arbitrary/external target URLs, cross-Tenant/Site/locale/family creation,
  redirect/canonical creation, homepage reassignment, or reclaim of any source
  current/historical public route; ADR-0203's exact private-claim succession is
  not public-route reclaim;
- AI/diff/keyword/score/materiality classification, Page-purpose fields,
  taxonomy, new capability, approval, assignment, invite, or access-request
  workflow;
- optimistic/lost-response success, partial target, compensating saga, provider
  network call under lock, or direct database/support repair; and
- any donor-facing migration warning or claim that Core can recall external
  permanent redirects.

## Activation boundary

Ratification records the universal fresh-Page outcome and ADR-0202 settles the
source Working Revision disposition. Activation remains blocked until the
complete D80-D84 command proves exact-scope authorization, exhaustive transfer
coverage, route/reference/lease/head races, atomic and semantic-idempotent
creation, RLS/grant/privileged parity, native-provider suppression, mixed-
version rollout, safe rollback, active D33 Profile scenario numeric cells/
evidence/SLOs and bounded-linear maximum-Page performance,
privacy-safe observability, public/Vercel/money no-effect, and representative
ministry staff usability and accessibility across conflict, repair, collision,
uncertain-response, mobile, assistive-technology, RTL/CJK, and weak-network
scenarios. ADR-0203 additionally requires complete Draft-only Path Claim
provenance, atomic D2 claim succession, route-equivalence and current-owner
races, private-History/restore correctness, and zero-public/Vercel/money proof.
ADR-0204 additionally requires complete source-tree closure provenance,
bounded/resumable preparation, exhaustive derived-claim outcomes, phantom-safe
membership/head fencing, D33 capacity, and atomic no-public-delivery/external-
provider-effect proof. Qualified same-database Payload persistence remains part
of the transaction. Any closure outside that exact qualified cohort remains
unavailable and uses ordinary D2 cleanup first.

ADR-0205 additionally requires positive D2 reviewed-gap or known append-last
provenance, final-topology validation, a fresh D2-generated target order
representation, zero D84-caused collateral parent/order writes, and an
accessible consequence row. Expected D81/D82/D83 successor/head effects remain
limited to their sealed owner-qualified manifest. Missing/unknown provenance
and stale explicit gaps remain ordinary D2 review work and cannot be guessed
inside D80.

This decision authorizes no runtime implementation, schema, migration,
Supabase policy, provider adoption, OpenSpec delta, ticket publication, Vercel/
DNS/Stripe action, deployment, D1 activation, release, or production change.

## References

- [ADR-0205 - Reviewed sibling placement with append-last default](./0205-reviewed-sibling-placement-with-append-last-default.md)
- [Phase 24 D84 adversarial review](../prds/sitestacker-parity/phase-24-d84-reviewed-sibling-placement-adversarial-review.md)
- [ADR-0204 - Atomic source-tree draft-path re-derivation](./0204-atomic-source-tree-draft-path-rederivation.md)
- [Phase 24 D83 adversarial review](../prds/sitestacker-parity/phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md)
- [ADR-0203 - Atomic adoption of exact draft-only Page path claims](./0203-atomic-adoption-of-exact-draft-only-page-path-claims.md)
- [Phase 24 D82 adversarial review](../prds/sitestacker-parity/phase-24-d82-atomic-draft-path-adoption-adversarial-review.md)
- [ADR-0202 - Material-purpose Page Handoffs append clean source Working successors](./0202-atomic-material-page-handoffs-append-clean-source-revisions.md)
- [Phase 24 D81 adversarial review](../prds/sitestacker-parity/phase-24-d81-atomic-material-page-handoff-adversarial-review.md)
- [Phase 24 D80 adversarial review](../prds/sitestacker-parity/phase-24-d80-material-purpose-new-page-adversarial-review.md)
- [ADR-0200 - Stable Page identity with Page Purpose Continuity Versions](./0200-stable-page-identity-with-purpose-continuity-versions.md)
- [ADR-0199 - Owner-qualified exact ordinary Page succession](./0199-owner-qualified-exact-ordinary-page-succession.md)
- [Proposed ADR-0167 - Exact Site-owned content and Copy-to-Site drafts](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0167-exact-site-owned-ordinary-content-with-independent-copy-to-site-drafts.md)
- [Proposed ADR-0177 - Provider-neutral Production Capacity Profile](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0177-provider-neutral-production-capacity-profile-and-vercel-qualification.md)
- [Proposed ADR-0156 - Working Revisions and active editor](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0156-bounded-editorial-working-revisions-and-recoverable-active-editor.md)
- [Proposed ADR-0150 - Ordinary Page families and Page Starters](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0150-two-semantic-ordinary-page-families-and-bounded-page-starters.md)
- [Proposed ADR-0146 - Staged hierarchical public paths](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0146-staged-hierarchical-public-paths-under-coherent-site-generations.md)
- [Proposed ADR-0145 - Page-local composition and Public Site Generations](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/adr/0145-page-local-composition-bounded-reuse-and-coherent-site-generations.md)
- [W3C - Architecture of the World Wide Web: URI persistence](https://www.w3.org/TR/webarch/#URI-persistence)
- [RFC 9110 - 301 Moved Permanently](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4.2)
- [RFC 9110 - 308 Permanent Redirect](https://www.rfc-editor.org/rfc/rfc9110.html#section-15.4.9)
- [Google - Site moves and corresponding URL mappings](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google - Soft 404 and clear replacement guidance](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors#soft-404-errors)
- [Google - Canonicalization](https://developers.google.com/search/docs/crawling-indexing/canonicalization)
- [Payload - Collection `disableDuplicate`](https://payloadcms.com/docs/configuration/collections)
- [Payload - Local API and transaction request propagation](https://payloadcms.com/docs/local-api/overview)
- [Payload - Local API access control](https://payloadcms.com/docs/local-api/access-control)
- [WordPress.com - Copy a Page into a draft](https://wordpress.com/support/copy-a-post-or-page/)
- [WordPress.com - Permalinks and unique Page URLs](https://wordpress.com/support/permalinks-and-slugs/)
- [Contentful - Entries, duplicate, drafts, and publication](https://www.contentful.com/help/content-and-entries/)
- [Blackbaud - Copy an existing Page to an inactive Page](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/content_pagebuilder2_pages_copying_existing_page_use_as_model.html)
- [Supabase - Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL - Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [W3C - WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [W3C - WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [Vercel - CDN cache](https://vercel.com/docs/caching/cdn-cache)
- [Next.js - Permanent redirects](https://nextjs.org/docs/app/api-reference/config/next-config-js/redirects)
