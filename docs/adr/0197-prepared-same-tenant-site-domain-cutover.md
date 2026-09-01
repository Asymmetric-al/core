# ADR-0197: Prepared same-Tenant Site Domain cutovers

**Status:** Accepted with required amendments (Phase 24 D76 — 2026-08-30)

## Context

Phase 24 must let authorized Tenant staff move an exact, still-connected custom
hostname between two Sites without first destroying the working connection.
D74 disconnection followed by D75 fresh claiming is a safe ownership-boundary
flow, but it is unnecessarily disruptive when Tenant, environment, hostname,
and hosting ownership remain unchanged. A mutable `site_id` reassignment is not
an acceptable shortcut: a trusted public address could expose the wrong Site,
leave the source without its required Primary, reinterpret protected routes, or
erase binding history.

Modern provider behavior separates ownership from assignment. Vercel recommends
its authenticated Move path, without repeat DNS verification, when both scopes
are accessible. Vercel also now exposes a project-domain move API. Neither fact
makes Vercel the Core authority or guarantees a no-gap public switch. Its own
zero-downtime guidance uses a separately prepared deployment alias and warns
that remove/add API calls may briefly interrupt service.

Current WordPress.com likewise exposes a direct dashboard action to move a
connected or registered domain to another Site in the same account and ends in
one explicit confirmation. It does not make staff disconnect and reclaim the
domain or treat Site assignment as content export. This is useful CMS UX
evidence; Core still needs stronger two-Site, route, Tenant and generation
safety than WordPress documents.

Current Core topology is simpler: every public Site is served through the one
`apps/donor` Vercel project. Launch D76 therefore needs no Vercel project-domain,
alias, redirect, certificate, DNS, or registrar mutation. Site assignment is a
Core Domain/public-generation transition. A future provider topology with one
project per Site requires its own ADR and evidence gate rather than speculative
abstraction in D76.

Current `develop` remains incompatible with this decision. It resolves a
nullable, nonunique Payload Tenant `primaryDomain` with `overrideAccess: true`,
forwarded-host input and slug fallback; public context still carries
`siteId: null`; donor redirects are host-blind; and the runtime has no D72–D76
Domain identity, binding generation, public head, move operation, capability,
RLS, adverse barrier, or Site workspace.

## Decision

### One exact same-Tenant successor

A **Prepared Site Domain Cutover** changes one exact current custom hostname
from one Site to a different Site in the same trusted Tenant and production
environment. The hostname stays continuously occupied by that Tenant. D76 never
releases the global claim, invokes D74, reacquires through D75, transfers legal
or provider ownership, or mutates the old Site-scoped binding.

The source and destination must share the currently proved Core hosting and
admission topology. Current staff authority must cover both exact Sites. A
same-Site request opens the existing Domain detail. Cross-Tenant,
cross-environment, wildcard, platform-owned, provider-generated, contested,
Disconnecting, provider-ambiguous, retiring, or retired cases are ineligible.

Ordinary D76 admission does not repeat a DNS TXT challenge. Current Tenant
occupancy plus trusted present control/provider observations are revalidated
server-side. Age alone never makes proof stale. A disconnected hostname,
different Tenant/environment/hostname/provider-ownership scope, missing legacy
provenance, `verified: false`, loss signal, conflict, or material ambiguity
pauses the review and requires a new exact move-bound control challenge while
the source remains current.

### Explicit public meaning on both Sites

The destination website role is required and initially unselected:

- **Primary website address**;
- **Redirects website visits**; or
- **Not public on this Site**.

No current role, provider field, destination state, apex/`www` relationship,
selection order, or likely intent may choose it. A private destination choosing
Primary composes D6 first public activation and the final action names that
go-live consequence. A public destination choosing Primary composes D73 and
requires its initially unselected former-primary website disposition. Redirect
is available only when the destination has a qualified current Primary.

If the hostname is the source Primary and the source remains publicly active,
the review requires a different, already eligible replacement Primary and its
complete source public-generation closure. The moved hostname necessarily stops
its source website role because one exact hostname cannot represent two Sites.
D76 does not pause, retire, unpublish, or silently take the source Site offline.
If no replacement exists, staff receive one cause-owned path to prepare another
domain; Site retirement must complete separately through D8.

The review reuses D73's finite, versioned critical-path and owner-outcome
registry. It is not a new generic impact engine or Internet crawler. Domain,
Site lifecycle, public generations, locales, brands, origins, admission, caches,
and registered security/route owners supply current hard evidence. Known
external placements remain explicitly incomplete advisory evidence.

Giving, checkout, Issued Giving Addresses, authentication, callbacks, APIs,
provider-return paths, protected actions, and every other source-owned route
retain only their owner's current meaning. D76 may consume the owner's current
direct/unavailable/successor/block disposition; it never moves, copies, infers,
or rewrites one. D9–D15 reservations remain stronger than the destination
website role. A same path or slug at the destination proves nothing.

ADR-0198/D77 resolves the ordinary-route part of this review. D76 consumes one
derived authority digest produced from the existing critical owner-family
registry plus complete immutable source/destination effective-host manifests.
Every applicable critical owner must be current. Source-only ordinary addresses
compile durable not-found effects, target-only addresses retain their own
authority, exact collisions block until their owner resolves them, and only an
already owner-qualified successor may continue. The staff review shows only
actionable exceptions and compact automatic-outcome counts. D77 creates no new
owner adapter framework, resolver, route store, crawler, redirect console, or
provider rule.

ADR-0199/D78 supplies the only accepted different-Page ordinary successor D76
may consume. One exact former General Page address may point to one different
current General Page only through a directional, revision-bound Page-owner
qualification after complete same-scope/locale/audience/safety/public proof and
one authorized human's exact-release subject/purpose/task review. D76 neither
creates nor infers it. Missing, stale, rejected, Article/specialized, or
protected proof remains block/not-found. Direct same-path service requires a
target Primary; a Redirect Site Domain composes one direct final owner result to
the Primary. D78 changes no provider, money, content, or Domain fact.

### Immutable plan, adverse fence, and successor

Before public effect, Core compiles one immutable move-plan revision containing
the exact hostname, source and destination identities and heads, current roles,
required source replacement, requested destination role, applicable D6/D73
choices, current owner-manifest digest, control posture, pinned provider
topology, complete target preview/public closure, and expected consequences.
Preparation copies no Site data and causes no public or provider mutation.

A distributed admission projection cannot change every cohort at one instant.
One explicit human command therefore drives an adverse-fenced sequence:

1. A short expected-head transaction reauthorizes both Sites, proves the exact
   move plan, records the durable operation/receipt/audit/outbox, and advances
   the hostname to a monotonic **Moving** barrier while the immutable source
   claim/binding remains current.
2. Core projects and reads back that adverse generation across every required
   host, route, and cache-admission cohort.
3. One short stable-lock-order transaction appends the new target claim/binding
   generation, closes the source generation, advances the private global
   current-host head, advances the required source/destination Domain and public
   heads, and records the final authority outcome/outbox atomically.
4. Only that exact target generation is admitted and read back. Completion
   requires the authoritative heads and required public probes to agree.

No network call runs under a database lock. The global hostname identity,
Tenant/environment occupancy, old binding, historical role/public generations,
and business evidence are never updated, retargeted, or deleted. A move is
append-and-advance, not row reassignment.

Before the Moving barrier begins, the source remains the public authority and
the staff member may abandon the review. After the barrier is acknowledged,
lagging or unknown cohorts return the tiny platform-neutral, no-brand,
`no-store` temporary-unavailable response; they never serve either unproved
Site. A brief measured neutral gap is safer than wrong-Site or mixed-generation
content. Core does not promise literal zero downtime.

Failure before the barrier changes nothing. If the authority swap has not
committed, a failed/stale plan may re-admit the unchanged source only after
current source readback and a durable not-started outcome. Once the authority
swap commits, recovery is forward-only. There is no automatic inverse, cached
rollback, or **Undo**; moving back is a newly reviewed successor.

### Provider-no-op launch boundary

Launch D76 is eligible only when both Sites use the exact same pinned
`apps/donor` Vercel team/project and compatible provider association. D76 makes
no Vercel move, alias, project-domain add/remove, redirect, branch/custom-
environment, certificate, DNS, account-domain, or registrar request.

An observed `project.domain-moved`, provider assignment change, alias change,
project mismatch, or verification regression during D76 is external drift. Core
fences or blocks the hostname, reconciles current evidence, and never adopts
that provider mutation as the product decision. A future cross-project Site
topology is not silently enabled by an adapter branch; it requires a separate
provider-transition decision, UX, failure model, and release proof.

### Authorization, database, and RLS

Reading and preparing the move requires current `sites.manage_domains` access
to both exact Sites. Committing public meaning requires current
`sites.activate_domains` on both. D6/D73 effects reuse their existing exact
protection. D8, Giving, authentication, route-owner, support, and provider
effects remain separate. D76 creates no `sites.move_domains` capability.

The caller supplies only the stable move-plan revision, required explicit
choices, expected heads, and semantic idempotency key. Actor, Tenant,
environment, Sites, current host/binding/role generations, capability epochs,
provider topology, policy, time, owner evidence, and audit attribution derive
from trusted server context.

The logical model requires one immutable global hostname identity, one private
global current-host head, immutable Site-scoped claim/binding generations,
same-Tenant/environment composite relationships, different source/destination
Sites, exactly one current occupancy and binding generation, exactly one
Primary per active nonretired public Site, finite compatible roles, a Moving
barrier incompatible with favorable admission or competing D72–D76 writes,
restrictive deletes, append-only plan/operation/receipt/audit/outbox history,
and equality-leading indexes for current heads, active moves, owner manifests,
projection work, and reconciliation.

Tenant-visible projections use minimum grants, enabled and applicable FORCE
RLS, operation-correct `USING` and `WITH CHECK`, and immutable scope. Browser
and Data API roles receive no direct authority mutation. The global current
head remains private/no-Data-API. Views, functions/RPCs, triggers, table owners,
`BYPASSRLS`, secret/service roles, workers, Payload, imports, support, repairs,
and AI repeat both-Site authorization, exact-head, owner-manifest, topology,
reservation, and attribution checks. Security-definer functions use minimum
execute grants, fully qualified objects, and an empty pinned `search_path`.

Commands lock the global hostname head first, then source and destination Sites
in stable identifier order, then exact role/public/owner heads. Concurrent
moves, D6/D7/D8/D66/D72–D75 changes, Giving issue/stop, control loss, provider
drift, capability revocation, and duplicate tabs yield one winner or an explicit
stale-review result. Same semantic key and meaning return the original durable
operation; changed meaning conflicts.

### Staff experience

Two entry points open one route-addressable, resumable full-page review:

- source Domain detail: **Move to another Site**;
- destination **Add domain**, after an authorized same-Tenant collision:
  **Already connected to {Site}** with **Open {Site}** and **Move to this Site**.

An actor who cannot view the source sees only **Already connected elsewhere in
{Tenant}** and that access to both Sites is required. Cross-Tenant or otherwise
unauthorized callers see only **Domain isn't available for setup**.

The full-page Base Maia review uses the existing compact `PageShell`, Zinc
semantic surfaces, shared fields/RadioGroup/buttons, one-column mobile layout,
text plus restrained semantic status indicators, and no second AlertDialog.
It is not a Sheet, wizard, matrix, infrastructure console, provider dashboard,
or new component family. Its hierarchy is:

1. exact Domain plus **{source Site} → {destination Site}**;
2. finite **Before this domain can move** readiness and cause-owned repairs;
3. required destination website role;
4. source Site after the move, including replacement Primary when needed;
5. destination former-primary disposition when needed;
6. complete authorized route/security outcomes and explicitly incomplete
   advisory placements;
7. **What changes** and **What does not change**;
8. production-faithful private target preview; and
9. one consequence-specific final action.

The review is the confirmation. Initial focus is on the page title. It requires
no typed hostname, checkbox acknowledgement, reason, schedule, countdown,
second approver, support ticket, DNS step, or provider terminology. The safe
secondary action is **Keep on {source Site}**. Final labels are **Move {hostname}
to {destination Site}** or, when D6 is composed, **Move domain and make
{destination Site} public**. Move is a high-consequence primary action, not
destructive-red deletion styling.

Missing choices produce one visible error summary and deterministic focus on
the exact field. A changed head, permission, proof, manifest, or topology clears
only affected choices and shows **Plan changed · Review again** with a concise
before/current difference. No disabled unexplained action is allowed.

Durable states are **Needs preparation**, **Ready to move**, **Plan changed ·
Review again**, **Moving domain**, **Move not started**, **Move needs attention**,
and **Moved to {Site}**. During preparation, copy says the source remains live.
During the acknowledged barrier, copy truthfully says visitors may briefly see
a neutral unavailable response and will never be shown the wrong Site. Staff
may leave and resume the durable operation; unknown acknowledgement never asks
them to submit again.

The success receipt names the exact current Site, source replacement and target
role, applicable D73 outcome, unchanged source-owned routes, and any precise
attention item. It says that DNS, registration, renewal, email, provider
project, Site content, gifts, recurring commitments, Giving addresses, and
unrelated domains were not moved or copied.

Hostnames use Geist Mono only where comparison/copy benefits, safe Unicode plus
canonical ASCII for IDNs, bidi isolation, LTR technical rendering, safe wrap,
and no truncation. Release evidence covers 320 CSS pixels, 400% zoom, keyboard,
screen readers, visible focus, forced colors, reduced motion, 44px touch
targets, long localization, RTL, weak networks, refresh/resume, expired
sessions, duplicate clicks, and lost acknowledgement. One polite status region
announces meaningful transitions without polling noise or focus theft.

### Donor, browser, money, and cache safety

Before the adverse barrier, every admitted request uses the complete source
generation. During the barrier, new uncertain requests receive only the neutral
unavailable response. After target admission, every newly admitted request uses
the complete target Site, brand, locale, Navigation, canonical/search metadata,
route authority, security context, and cache namespace. A request may finish
under a previously admitted complete source generation, but no response or
write may mix generations.

The hostname is unchanged, so browser-origin state can survive. Tenant-scoped
sessions remain only when their audience and authorization are independently
valid; Site/binding-scoped cookies, tokens, signed contexts, and client state
must validate the exact immutable generation and be rejected or rotated at the
destination. Root-scoped service workers remain prohibited. Cache identity
includes host, binding, Site, public, locale, route, and owner generations;
stale-while-revalidate is never the correctness boundary for a Site identity
change.

Forms or actions opened before the cutover remain pinned to their original
binding and durable purpose or receive a clear refresh/review response. Existing
checkout, gift, pledge, recurring, task, import, and provider operations remain
bound to their original Site, designation, currency, cadence, source, and
idempotency authority. D76 creates no Stripe request and no ledger, payment,
settlement, recurrence, or accounting effect. Stripe-hosted custom domains, if
later adopted, are separately owned provider resources and never follow a Site
Domain cutover.

## Consequences

- Same-Tenant staff can reorganize Sites without destructive release/reclaim or
  routine registrar access.
- The launch implementation is smaller and safer than a provider abstraction:
  one existing Domain authority, one finite owner registry, one durable
  operation, one shared-project no-op, and one full-page review.
- A bounded neutral gap may occur while distributed cohorts transition. Core
  prioritizes never showing or accepting work for the wrong Site over an
  unprovable zero-downtime claim.
- The unchanged origin requires explicit browser/session/cache-generation tests.
- A future provider-per-Site topology cannot reuse D76 implicitly; it must prove
  a separate no-gap provider protocol and recovery model.

## Rejected alternatives and unsafe interpretations

- **Disconnect then claim:** creates needless outage, provider churn, and DNS
  work for an unchanged Tenant ownership boundary.
- **Mutable `site_id` reassignment:** destroys history and permits stale
  readers/events to authorize the wrong Site.
- **One database transaction means instant global cutover:** ignores distributed
  admission and cache propagation.
- **Literal zero-downtime promise:** is not guaranteed by Core or Vercel's move
  endpoint; safety uses an adverse barrier.
- **Routine DNS reproof:** adds friction without improving same-Tenant
  assignment safety; only adverse ownership/control evidence triggers it.
- **Vercel Move, alias, force, remove/add, or redirect at launch:** is unnecessary
  under Core's shared donor project and creates another routing authority.
- **Implicit destination role or source retirement:** hides public consequences
  and can violate exactly-one-Primary invariants.
- **Copy content/settings/routes:** confuses public address assignment with Site
  migration and can reinterpret donor/auth meaning.
- **Automatic rollback or Undo after authority swap:** can revive stale public
  generations; recovery is forward-only.
- **Generic migration/workflow engine, scheduled/bulk/drag move, or support-only
  normal path:** adds speculative machinery or operational dependency.

## References

- [D76 adversarial review](../prds/sitestacker-parity/phase-24-d76-prepared-same-tenant-site-domain-cutover-adversarial-review.md)
- [ADR-0198 — Critical-path-gated Domain move route review](./0198-critical-path-gated-exception-led-domain-move-route-review.md)
- [ADR-0199 — Owner-qualified exact ordinary Page succession](./0199-owner-qualified-exact-ordinary-page-succession.md)
- [D78 — Owner-qualified ordinary Page successor review](../prds/sitestacker-parity/phase-24-d78-owner-qualified-ordinary-page-successor-adversarial-review.md)
- [D77 adversarial review](../prds/sitestacker-parity/phase-24-d77-critical-path-exception-led-domain-move-route-adversarial-review.md)
- [ADR-0193 — Primary and Redirect Site Domains](./0193-one-primary-site-domain-with-redirect-site-domains.md)
- [ADR-0194 — Former-primary disposition](./0194-explicit-former-primary-website-disposition.md)
- [ADR-0195 — Owner-cleared disconnection](./0195-owner-cleared-tenant-domain-disconnection.md)
- [ADR-0196 — Fresh-proof clean-start claim](./0196-fresh-proof-clean-start-site-domain-claims.md)
- [D8 — Site retirement](../prds/sitestacker-parity/phase-24-d8-site-retirement-adversarial-review.md)
- [D9 — Retired-address disposition](../prds/sitestacker-parity/phase-24-d9-retired-address-disposition-adversarial-review.md)
- [D10 — Issued Giving Address reservation](../prds/sitestacker-parity/phase-24-d10-issued-giving-address-reservation-adversarial-review.md)
- [Vercel — Claim versus authenticated Move](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership)
- [Vercel — Domain ownership and project assignment](https://vercel.com/docs/domains/working-with-domains)
- [Vercel SDK — Move a project domain](https://github.com/vercel/sdk/blob/main/src/funcs/projectsMoveProjectDomain.ts)
- [Vercel — Project-domain move and downtime guidance](https://vercel.com/kb/guide/how-to-move-a-domain-between-vercel-projects-with-zero-downtime)
- [Vercel — Activity Log](https://vercel.com/docs/activity-log)
- [Cloudflare — Edit a custom hostname](https://developers.cloudflare.com/api/resources/custom_hostnames/methods/edit/)
- [WordPress.com — Move a domain to another Site](https://wordpress.com/support/domains/move-a-domain-to-another-wordpress-com-site/)
- [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL — Explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL — Transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [RFC 10025 — Cookies: HTTP State Management Mechanism](https://auth48-transition.rfc-editor.org/authors/rfc10025.html)
- [Stripe — Checkout custom domains](https://docs.stripe.com/payments/checkout/custom-domains)
- [WCAG 2.2 — Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
- [WCAG 2.2 — Error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
