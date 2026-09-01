# Phase 24 D74 — Owner-cleared Tenant domain disconnection adversarial review

**Date:** 2026-08-30  
**Founder answer reviewed:** Separate Tenant self-service disconnection after
complete owner clearance, conditioned on excellent Tenant/staff UX and
consistency with Core.  
**Final disposition:** **Accept with required amendments.**  
**Recorded decision:**
[ADR-0195](../../adr/0195-owner-cleared-tenant-domain-disconnection.md)

## Executive verdict

Separate self-service disconnection is the right permanent product rule.
Squarespace, Shopify, WordPress.com, and Wix all separate disconnecting a domain
from a website from canceling or transferring domain registration. Vercel also
separates project-domain removal from team/account-domain removal. Automatic
cleanup is too surprising; support-only cleanup defeats Phase 24 self-service.

The informal answer is not safe enough without six amendments:

1. **Complete clearance** means no _current positive dependency on Core
   hosting_, not no historical fact. D9–D15 reservations, immutable history, and
   provider-control paths that end with detachment survive without blocking.
2. The staff action is **Disconnect from this Site**, followed by **Disconnect
   domain**. “Delete,” “release,” “remove from Vercel,” and the platform-centric
   “Disconnect from Core” are avoided in ordinary UI.
3. One short local commit first establishes a monotonic **Disconnecting**
   barrier and acknowledged adverse host fence. Provider work never runs in the
   transaction.
4. A Vercel DELETE response is not completion. Authenticated readback must prove
   that every applicable Core-controlled routing association for the exact host
   is absent.
5. Only then may a second local commit end the current Site-binding interval and
   current global occupancy claim. Host identity, history, and protected address
   reservations are never deleted.
6. DNS, registration, renewal, email, Vercel team/account ownership, unrelated
   hosts, and future attachment are separate authorities. D74 never changes or
   claims to change them.

That is proportionate rather than overengineered. It is one confirmation and
one durable forward-only operation reusing D72's Domain authority, D73's owner
registry, the existing Base UI AlertDialog, and the repository's outbox/CAS
patterns. It adds no workflow engine, provider dashboard, DNS product, domain
transfer, timer, bulk action, approval queue, crawler, or new public resolver.

## Current behavior, intended behavior, and permanent path

| Layer                 | Verified current/repository state                                                                                                                                                | D74 intended behavior                                                                                                | Permanent path                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Host resolution       | `resolveTenantFromRequest` trusts forwarded/host input, queries nullable nonunique Payload Tenant `primaryDomain` with `overrideAccess: true`, and may fall back to Tenant slug. | A disconnected/unknown exact host is rejected before Tenant/content/cache selection.                                 | D72 trusted hosting-adapter identity plus adverse-first Domain projection.                        |
| Site context          | `PublicRequestContext.siteId` remains `null`; current source has no Site-domain claim or disconnection state.                                                                    | One exact Tenant/environment/Site binding enters Disconnecting and later ends.                                       | Relational global hostname identity, current claim, immutable binding intervals, and CAS heads.   |
| Public origins/routes | Metadata still uses global `siteConfig.url`; redirects are host-blind; current runtime has no finite route-owner clearance contract.                                             | Every registered owner returns current positive, historical-only, ends-with-detach, or blocking/unknown disposition. | Versioned finite owner registry; no Internet or universal route crawler.                          |
| Vercel                | Core has no product Domains API adapter. Vercel distinguishes project assignment from team/account domain ownership.                                                             | Remove only exact Core project/routing associations after the adverse fence, then read back absence.                 | Sealed outbox work, signed-event hints, current authenticated readback, bounded reconciliation.   |
| Database/auth         | D72/D73 are accepted documentation intent; no operational tables, constraints, RLS, grants, RPCs, or workers implement them.                                                     | One protected human effect, server-derived scope/actor/provider identity, two short transactions.                    | Composite same-scope constraints, append-only history, full RLS/grant/privileged-path parity.     |
| Staff UX              | No Site → Domains management product is shipped. Shared Base UI AlertDialog and Base Maia standards exist.                                                                       | One eligible row action, compact confirmation, durable in-progress/needs-attention/success states.                   | Reuse shared primitives and Domain workspace hierarchy; no provider dashboard clone.              |
| Formal authority      | Active OpenSpec does not contain D72–D74. Phase 23 PR #1340 is still `OPEN/BLOCKED`.                                                                                             | D74 is intended product/architecture documentation only.                                                             | Reconcile Phase 23 generation authority and consolidate Phase 24 OpenSpec before tickets/runtime. |

Current repository evidence:

- [`resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts)
- [`tenants.ts`](../../../apps/admin/src/cms/collections/tenants.ts)
- [`context.ts`](../../../packages/api/src/cms/public/context.ts)
- [`metadata.ts`](../../../packages/lib/seo/metadata.ts)
- [`apps/donor/next.config.ts`](../../../apps/donor/next.config.ts)
- [`alert-dialog.tsx`](../../../packages/ui/components/shadcn/alert-dialog.tsx)
- [Mission Control admin UX standards](../../ai/ADMIN-UX-STANDARDS.md)

After a fresh fetch, branch HEAD and `origin/develop` both resolved to
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. PR #1340 remained `OPEN/BLOCKED`
at `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`.

## Verified current external evidence

| Source                                                                                                                                                                                                                              | Verified current practice                                                                                                                                                              | D74 use                                                                                               | Boundary retained                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [Vercel domain removal](https://vercel.com/docs/domains/working-with-domains/remove-a-domain)                                                                                                                                       | Removing from a project and removing from a team/account are different operations; Vercel-purchased domains may not be removable from the account until expiry.                        | Confirms project detachment only.                                                                     | D74 never performs account/registrar deletion.                  |
| [Vercel working with domains](https://vercel.com/docs/domains/working-with-domains)                                                                                                                                                 | Domain ownership and Project assignment are separate concepts.                                                                                                                         | Requires exact scope and truthful copy.                                                               | Provider objects do not own Core Site meaning.                  |
| [Vercel REST API](https://vercel.com/docs/rest-api) and [errors](https://vercel.com/docs/rest-api/errors)                                                                                                                           | Project domain GET/list/delete are separate from account domain APIs; rate limits are endpoint-specific and returned in headers; `403`, `429`, and other failures differ from absence. | Readback, current headers, and explicit indeterminate outcomes.                                       | Numeric provider limits are not Core invariants.                |
| [Vercel webhooks](https://vercel.com/docs/webhooks/webhooks-api)                                                                                                                                                                    | Project-domain events are signed; failed deliveries retry with backoff for up to 24 hours and are then discarded.                                                                      | Events accelerate reconciliation but silence/single delivery cannot complete it.                      | Current authenticated readback remains authority.               |
| [Vercel transfer guidance](https://vercel.com/docs/domains/working-with-domains/transfer-your-domain) and [zero-downtime project move](https://vercel.com/kb/guide/how-to-move-a-domain-between-vercel-projects-with-zero-downtime) | Remove/add project moves may have downtime; team, project, and registrar transfer effects differ.                                                                                      | Requires explicit interruption warning and separately governed moves.                                 | D74 is not transfer or zero-downtime migration automation.      |
| [Squarespace disconnection](https://support.squarespace.com/hc/en-us/articles/205812428-Disconnecting-a-third-party-domain)                                                                                                         | Third-party domain disconnection is site-scoped self-service and does not cancel linked external services.                                                                             | Supports the chosen staff mental model.                                                               | Product copy is adapted to Base Maia, not copied.               |
| [Shopify third-party removal](https://help.shopify.com/en/manual/domains/removing-domains/removing-third-party-domains)                                                                                                             | A Primary must change before removal; DNS can then point elsewhere.                                                                                                                    | Supports nonprimary precondition and separate DNS work.                                               | Core avoids Shopify's delete terminology.                       |
| [WordPress.com domains](https://wordpress.com/support/domains/)                                                                                                                                                                     | Detaching a domain from a Site keeps registration; cancellation ends ownership.                                                                                                        | Proves the distinction users need.                                                                    | Core neither registers nor cancels Tenant domains.              |
| [OWASP subdomain-takeover prevention](https://cheatsheetseries.owasp.org/cheatsheets/Subdomain_Takeover_Prevention_Cheat_Sheet.html)                                                                                                | Decommissioning a cloud resource before changing dangling DNS can create a takeover/error window; DNS/resource inventory and ordered cleanup matter.                                   | Requires a prominent prepare-destination/update-DNS-first recommendation and post-detach observation. | Tenant DNS remains external authority; Core does not mutate it. |
| [W3C alert dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)                                                                                                                                                           | Important confirmation can use a real modal alert dialog with visible name/description, contained interaction, and correct focus.                                                      | Supports one compact confirmation.                                                                    | Shared Base UI behavior and release tests remain required.      |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) and [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                                                   | Grants and policies both matter; `USING` checks existing rows and `WITH CHECK` constrains resulting rows; service/owner paths can bypass RLS.                                          | Requires operation-specific policies plus privileged-path poison tests.                               | The browser never mutates provider/domain truth directly.       |

## Facts, judgments, assumptions, and unresolved unknowns

### Verified facts

- Current Core cannot implement D74 safely; D72/D73 relational authority and
  owner manifests do not yet exist in runtime or active OpenSpec.
- Vercel project removal is distinct from provider account/domain removal.
- Vercel webhooks can be missed permanently after their retry window.
- Current RLS guidance requires both grants and policies and explicitly warns
  that service/secret roles bypass RLS.
- D10 already requires permanent exact-origin/path reservations to survive a
  custom domain leaving Core and to reapply if that origin returns.

### Product judgments

- Self-service is the normal path; support handles only provider-account,
  registrar, lost-authority, or corrupted-state exceptions.
- “Current positive hosting dependency” is the only meaningful clearance gate.
- The staff surface should name the Site and effect rather than expose Core or
  Vercel architecture in the action label.
- One AlertDialog is sufficient only because readiness is proved before entry;
  unresolved owner work stays in the Domains workspace.
- DNS movement is continuity guidance, not command authority or a required use-
  case questionnaire.

### Assumptions requiring representative evidence

- Authorized ministry staff understand “disconnect from this Site” versus
  registration/DNS when shown the exact non-effects. This is plausible, not yet
  measured.
- The complete owner registry and provider association census remain bounded at
  supported Tenant/Site/domain limits. Capacity profiles are not yet accepted.
- The standard Domain Manager bundle should include the separately protected
  `sites.disconnect_domains` effect without exposing a second daily approval
  step; custom least-privilege roles may withhold it.

### Unresolved unknowns outside D74

- ADR-0196/D75 now permits every Tenant to create a new private binding only
  after fresh Core-owned DNS proof and atomic global claim, with no positive
  inheritance and every D9–D15 reservation retained.
- A separately named Vercel team/account ownership release or domain transfer
  may be needed later; it is not part of ordinary Site disconnection.
- Supported wildcard/custom-domain catalogs and exact provider reconciliation
  SLOs require measured design evidence before implementation.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** treating the last public-use
stop as automatic cleanup can surprise staff and replace a controlled response
with an external error; support-only cleanup can strand routine migrations.
**Why it matters:** the Tenant, not a metric or provider, owns migration timing.
**Severity: High. Likelihood: High. Evidence/reasoning:** current Squarespace,
Shopify, and WordPress patterns separate site disconnection from registration;
Vercel separates project and account effects. **Decision effect:** validates
self-service but rejects automatic and support-only defaults. **Permanent fix:**
one explicit owner-cleared command. **Exact spec language:** D74-R1, R3–R4,
R18; AC1–AC6, AC37–AC40.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** a Boolean `connected=false`
or one Vercel DELETE can race a new route activation, retain a hidden alias, or
release the claim under ambiguous provider state. **Why it matters:** two
individually plausible writers can create wrong-Site routing. **Severity:
Critical. Likelihood: High. Evidence/reasoning:** current Core lacks a Domain
aggregate; provider removal and local authority cannot be atomic. **Decision
effect:** changes the operation to an adverse barrier, readback, and final
release. **Permanent fix:** D74-R5–R9 with shared claim/owner heads. **Exact spec
language:** AC13–AC28.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** teams could add a second
hostname resolver, mutable provider-status fields, per-domain pollers, a domain
workflow engine, or a registrar/DNS dashboard. **Why it matters:** these shadow
D72 authority and create permanent operational burden. **Severity: High.
Likelihood: High. Evidence/reasoning:** D72 already owns exact host identity and
Core has reusable outbox/CAS/UI primitives. **Decision effect:** narrows D74 to
one operation and one provider adapter. **Permanent fix:** reuse authoritative
heads, finite owner adapters, consolidated webhook/readback, and shared
AlertDialog. **Exact spec language:** D74-R5, R7, R13–R14, R18; AC19–AC24,
AC35–AC40.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** apex/`www`, IDN equivalence,
manual aliases, branch domains, provider redirects, wildcard parents, current
Giving routes, stale service workers, Site retirement, recent primary moves,
DNS still pointing at Vercel, and lost provider authority can invalidate a
simple detach. **Why it matters:** these are realistic domain lifecycle states.
**Severity: Critical. Likelihood: High. Evidence/reasoning:** Vercel exposes
multiple routing/domain concepts and remove/add moves can interrupt service.
**Decision effect:** forbids cascade and requires exact manifests/readback.
**Permanent fix:** D74-R1–R2, R6–R9, R11–R12, R15. **Exact spec language:**
AC1–AC4, AC7–AC12, AC17–AC30, AC34–AC36.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** “Delete domain,” `--force`,
account-level deletion, blind retry, provider not-found under wrong scope,
automatic rollback, or DNS instructions that touch MX/nameservers can destroy
availability or ownership. **Why it matters:** the wrong effect can be difficult
or impossible to reverse. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** Vercel explicitly exposes distinct project, account, move,
and force operations; WordPress warns cancellation can forfeit a domain.
**Decision effect:** materially narrows naming and provider authority.
**Permanent fix:** allowlisted exact project operations, sealed server IDs,
authenticated readback, and explicit non-effects. **Exact spec language:**
D74-R3–R4, R7, R11–R12, R18; AC5–AC6, AC19–AC30, AC37–AC40.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** a hostname, provider object,
worker, cache, or error from one Tenant/Site/environment could detach or disclose
another scope. **Why it matters:** public identity and sensitive ministry
relationships can leak cross-Tenant. **Severity: Critical. Likelihood: Medium-
high. Evidence/reasoning:** current `primaryDomain` is nonunique and Tenant-only;
D72 requires platform-wide current uniqueness. **Decision effect:** no caller-
selected scope and no cross-Tenant existence disclosure. **Permanent fix:**
composite scope FKs, one current global claim, server-derived provider identity,
non-enumerating failures, privileged-path poison tests. **Exact spec language:**
D74-R5, R8, R10, R15–R17; AC13–AC18, AC29–AC36.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** an UPDATE could move an
allowed row to another Site, direct DML could release a claim without provider
proof, or service/owner/view paths could bypass Tenant policies. **Why it
matters:** UI-only checks do not protect the actual invariant. **Severity:
Critical. Likelihood: High. Evidence/reasoning:** current Supabase guidance
requires grants plus RLS and both `USING`/`WITH CHECK`; service roles bypass RLS.
**Decision effect:** makes structural database parity release-blocking.
**Permanent fix:** immutable facts, restricted deletes, composite FKs/checks/
unique indexes, operation-only mutations, force RLS, safe views/functions, and
poison tests. **Exact spec language:** D74-R5, R8–R10, R16–R17; AC13–AC18,
AC31–AC36.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** a wizard, typed hostname,
second approver, timer, reason taxonomy, bulk cleanup, intended-use questionnaire,
or route matrix could turn a rare proven action into administrative friction.
**Why it matters:** small ministries need a simple, learnable path. **Severity:
Medium. Likelihood: High. Evidence/reasoning:** all hard safety facts are
machine-owned and can be checked before confirmation. **Decision effect:** keeps
one compact confirmation and one durable status. **Permanent fix:** D74-R3–R4,
R18. **Exact spec language:** AC5–AC6, AC37–AC40.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** staff may confuse website
stop, hosting disconnection, registration cancellation, DNS, email, or future
reuse; a disabled action or raw provider error gives no repair path. **Why it
matters:** misunderstanding can cause donor-visible downtime. **Severity: High.
Likelihood: High. Evidence/reasoning:** comparable products explicitly separate
site detachment and ownership; Base Maia favors one clear next action and
durable state. **Decision effect:** changes labels, hierarchy, copy, focus, and
receipts. **Permanent fix:** four truthful row states, owner handoffs, concise
AlertDialog, safe focus, durable outcomes, IDN/mobile/accessibility proof.
**Exact spec language:** D74-R3–R4, R12–R15; AC5–AC12, AC29–AC30, AC34–AC36.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** DNS, Vercel, Payload,
traffic, or the UI could become the authority for clearance/disconnection,
while history and current occupancy become dual-owned. **Why it matters:** the
same hostname could be simultaneously “free” and still routed. **Severity:
Critical. Likelihood: High. Evidence/reasoning:** current provider and runtime
facts are only partial observations; D72 establishes Operational Domain
authority. **Decision effect:** preserves one Core current claim and append-only
binding history. **Permanent fix:** explicit ownership matrix and invariants in
D74-R2, R5–R8, R11, R13. **Exact spec language:** AC1–AC4, AC13–AC28,
AC31–AC33.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** disconnection could
implicitly retire a Site, cancel Giving, remove Donor Portal/auth hosts, change
email/DNS, delete certificates, or enable another Site. **Why it matters:** each
owner has different safety and lifecycle rules. **Severity: Critical.
Likelihood: Medium-high. Evidence/reasoning:** D9–D15 and Phase 4 already reserve
independent address authorities. **Decision effect:** restricts D74 to exact Site
hosting association and current claim. **Permanent fix:** owner-clearance
taxonomy, explicit exclusions, and source-owned handoffs. **Exact spec language:**
D74-R1–R2, R8, R11, R15, R18; AC1–AC4, AC23–AC24, AC31–AC33, AC37–AC40.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** local barrier commit may
succeed before provider failure; provider removal may succeed with a lost
response; final release may fail; an external actor may reattach the domain.
**Why it matters:** falsely saying “disconnected” or blindly restoring service
can create cross-Site routing and staff confusion. **Severity: Critical.
Likelihood: High. Evidence/reasoning:** provider APIs and webhooks are external,
rate-limited, and not transaction participants. **Decision effect:** requires
forward-only, itemized, reconciled states. **Permanent fix:** D74-R5–R9,
R11–R13. **Exact spec language:** AC13–AC30.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** activate/disconnect, primary-
change/disconnect, two disconnects, manual provider moves, or late events can
each be valid alone but violate the joint claim invariant. **Why it matters:**
ordering errors can expose the wrong Tenant. **Severity: Critical. Likelihood:
High. Evidence/reasoning:** current Core has no shared claim barrier and Vercel
events may be delayed/duplicated. **Decision effect:** defines explicit states
and one winner. **Permanent fix:** CAS on shared heads, semantic idempotency,
generation-bound provider work, no post-barrier cancel, late-event rejection.
**Exact spec language:** D74-R5–R9, R12; AC13–AC28.

Valid lifecycle:

```text
connected_nonpublic
  → disconnecting_fence_pending
  → disconnecting_provider_pending
  → disconnected

disconnecting_* → needs_attention → disconnecting_* → disconnected
```

There is no `disconnecting → connected` automatic rollback. A pre-submit cancel
changes nothing; a later Core use begins through ADR-0196's fresh setup.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** deleting the hostname row,
rewriting an old binding, losing a provider receipt, releasing before absence,
or forgetting D10 reservations can corrupt reporting and allow old protected
addresses to gain new meaning. **Why it matters:** public and financial history
must remain interpretable. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** D8–D10 require immutable Site/domain/address history.
**Decision effect:** release means interval end, never record deletion.
**Permanent fix:** append-only identities/intervals/evidence, restricted FKs,
reservation precedence on every future binding. **Exact spec language:**
D74-R2, R5, R8–R10, R13, R16; AC2–AC4, AC13–AC18, AC25–AC33.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** logs, errors, blocker counts,
provider IDs, or availability responses could reveal a sensitive former Tenant,
missionary, Giving path, domain history, or provider account. A dangling route
could serve another Site. **Why it matters:** missions data can carry physical
and pastoral safety consequences. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** ADR-0028 requires defense-in-depth isolation; owner detail
may be restricted. **Decision effect:** makes summaries permission-filtered and
public results neutral/non-enumerating. **Permanent fix:** D74-R3, R6, R10,
R13, R15–R17; AC7–AC12, AC29–AC36.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** unbounded owner scans, all-
project provider enumeration per request, per-domain webhooks, or synchronous
provider calls can exceed Postgres/Vercel limits and hold UI requests open.
**Why it matters:** one large Tenant or onboarding batch can starve every other
Tenant. **Severity: High. Likelihood: Medium-high. Evidence/reasoning:** Vercel
rate limits are endpoint-specific; Core's public path has a launch p99 budget.
**Decision effect:** moves all provider work off locks/requests and requires
bounded catalog profiles. **Permanent fix:** indexed current manifests,
consolidated event intake, queued fair work, live limit headers/backoff, and
measured maximums. **Exact spec language:** D74-R7, R13–R14, R16–R17;
AC19–AC22, AC34–AC36.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** support may become the normal
queue, provider unknowns may require direct DB repair, or one task may be created
per hidden route/provider attempt. **Why it matters:** small ministries and the
platform team cannot sustain tribal cleanup. **Severity: High. Likelihood:
Medium-high. Evidence/reasoning:** the operation is mechanically provable and
provider reconciliation is repeatable. **Decision effect:** support becomes
exception-only. **Permanent fix:** one durable operation, cause-owned handoff,
replay/readback runbook, and named monitors. **Exact spec language:** D74-R3,
R7, R12–R14, R18; AC7–AC12, AC19–AC30, AC37–AC40.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** technical logs or a toast
cannot prove who requested disconnection, what clearance/provider generations
were used, whether the fence was acknowledged, or why a claim remains reserved.
**Why it matters:** diagnosis and safe replay require durable business evidence.
**Severity: High. Likelihood: High. Evidence/reasoning:** D72/D73 and repository
patterns distinguish receipts/audits from telemetry. **Decision effect:** adds
an immutable receipt and itemized state history. **Permanent fix:** D74-R5,
R7–R9, R12–R13 plus eleven named monitors. **Exact spec language:** AC13–AC30,
AC34–AC36.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** Vercel endpoints, schemas,
limits, permissions, events, aliases, or account ownership can drift; a webhook
may never arrive. **Why it matters:** provider state must not silently become
Core authority. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** Vercel documents endpoint-specific limits, multiple domain
surfaces, and a finite webhook retry window. **Decision effect:** strengthens
adapter/readback and forbids frozen numeric assumptions. **Permanent fix:**
D74-R7, R11–R14, R16–R17; AC19–AC30, AC34–AC36.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** `primaryDomain`, DNS,
traffic absence, or current provider inventory could be backfilled as historical
clearance/disconnection; old code could bypass the barrier after new writers
enable. **Why it matters:** fabricated history and mixed-version serving can
cross Tenant boundaries. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** current runtime is Tenant-only and host/redirect readers
are not D72-aware. **Decision effect:** blocks writers until adverse readers and
constraints are ubiquitous. **Permanent fix:** expand/backfill/contract,
quarantine ambiguity, shadow provider inventory, writer-last cohort rollout,
forward-only recovery. **Exact spec language:** D74-R16–R17; AC31–AC40.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** a unit test for one Boolean
or mocked DELETE can pass while RLS, races, residual aliases, public behavior,
mobile/accessibility, and mixed versions remain unsafe. **Why it matters:** the
decision spans user-visible and cross-system outcomes. **Severity: Critical.
Likelihood: High. Evidence/reasoning:** Core requires public-seam and negative
tests; active OpenSpec has no D74. **Decision effect:** adds 40 falsifiable
criteria and end-to-end traceability. **Permanent fix:** D74-R17 and the proof
matrix below. **Exact spec language:** AC1–AC40.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** “release” can be mistaken
for cross-Tenant availability, “disconnected” can imply Vercel-account removal,
and D74 can be smuggled into Site retirement or bulk cleanup. **Why it matters:**
terminology can authorize work the founder did not choose. **Severity: High.
Likelihood: High. Evidence/reasoning:** Vercel has separate project/account/
transfer concepts; ADR-0196 now separately governs fresh post-release claims.
**Decision effect:** narrows D74 and creates a glossary term/ADR boundary.
**Permanent fix:** D74-R1, R3, R8, R11, R16, R18 and ADR-0196. **Exact spec language:** AC1–AC6, AC23–AC24,
AC31–AC33, AC37–AC40.

## Exact normative requirements

### D74-R1 — Exact custom-host eligibility

D74 MUST apply to one exact nonprimary Tenant-controlled custom hostname bound
to one Tenant × environment × Site. A Primary or Redirect Site Domain, Core-
owned/platform/wildcard/preview/provider hostname, Donor Portal host, another
Site/environment/Tenant, or hostname with a conflicting/pending operation MUST
be ineligible. Apex, `www`, wildcard, parent, child, and sibling hosts are
independent; no action cascades or is inferred.

### D74-R2 — Complete current owner-clearance taxonomy

One versioned finite registry MUST classify every applicable owner result as:

1. `requires_current_hosting` — a current favorable/direct role, route, or
   control dependency; blocks;
2. `historical_reservation_only` — immutable history, audit, attribution, or
   D9–D15 adverse reservation; survives and does not block;
3. `ends_with_detachment` — provider validation/control and Core's neutral
   adverse host result that end with provider removal; does not circularly
   block; or
4. `unknown_or_conflicting` — missing, stale, truncated, unauthorized,
   contradictory, or unsafe evidence; blocks.

Traffic absence, analytics, DNS, provider state, Payload `primaryDomain`, AI,
imports, timers, and caller claims MUST NOT infer clearance. Core MUST NOT crawl
the Internet or build a universal URL/dependency graph.

### D74-R3 — Domains-workspace states and actions

**Site → Domains** MUST distinguish:

- **Not used for website · Other uses remain** with one permission-safe owner
  handoff and no disconnect action;
- **Not public · Connected for hosting** with **Disconnect from this Site**;
- **Disconnecting** or **Not public · Disconnection needs attention**, with no
  second submit or cancellation; and
- **Disconnected**, with a permission-filtered durable receipt/history row.

Unknown readiness MUST say **Couldn't confirm this domain is ready to
disconnect** and identify the cause owner without leaking hidden facts. Numeric
counts require a complete viewer-authorized inventory.

### D74-R4 — Compact explicit confirmation

The eligible action MUST use one shared Base UI AlertDialog with the exact Site
and hostname, what stops, what remains, provider/browser-error risk, fresh-setup
consequence, **Keep connected** with initial focus, and **Disconnect domain**.
It MUST NOT use delete/remove/release/transfer/unregister wording, a wizard,
Sheet, provider dashboard, typed phrase, checkbox, reason, second approver,
timer, schedule, bulk action, or toast-only outcome.

### D74-R5 — First local barrier transaction

Outside the lock Core MUST compile the exact current clearance and provider-
association manifests. In one short stable-order transaction it MUST
reauthorize the current human, reload and compare-and-set the current scope/
hostname/claim/binding/owner/provider heads, insert the immutable operation,
receipt, audit, and deduplicated outbox, and enter the monotonic Disconnecting
barrier—or change nothing. No network, DNS, Payload, cache, or provider call may
occur under lock.

### D74-R6 — Adverse host fence before provider work

Every favorable host, role, route, publication, primary/redirect activation,
and new binding writer MUST reject the Disconnecting barrier. The trusted public
admission projection MUST expose the exact adverse generation everywhere and
Core MUST read back the required edge/runtime cohorts before provider removal.
Unknown/mismatched hosts fail platform-neutral with no Asym/Tenant branding,
content, redirect, analytics, application cookie, or fallback.

### D74-R7 — Provider removal and authenticated absence proof

Only after D74-R6 acknowledgement may the sealed provider worker remove the
exact Core-controlled Vercel associations identified by the current manifest.
It MUST derive team/project/hostname IDs server-side, never use `--force`, and
perform authenticated readback over applicable project-domain, deployment-
alias, branch, redirect, and wildcard associations. A response or webhook alone
is insufficient. Provider not-found counts only under proved exact current
scope; permission loss and wrong scope remain unknown.

### D74-R8 — Final claim release and retained history

Only provider absence bound to the same operation/attachment generation permits
a second short transaction to end the current Site-binding interval and
platform-wide current occupancy claim. It MUST NOT delete or rewrite canonical
hostname identity, historical intervals, receipts, audits, public attribution,
or D9–D15 reservations. Provider success followed by local failure retains the
claim until the same operation finalizes.

### D74-R9 — Lifecycle, races, and semantic idempotency

Activation/primary change/route admission/disconnection MUST share the claim,
binding, and owner heads so exactly one wins. Same semantic key/meaning returns
the original operation; different meaning conflicts. Duplicate, delayed,
missing, and out-of-order provider events are normal observations. After the
barrier there is no cancel or automatic restore; reconnection is fresh setup.

### D74-R10 — Database, RLS, grants, and privileged parity

Same-scope composite FKs, unique/check constraints, restrictive deletion,
immutable facts, indexed current heads, operation-specific grants, forced RLS,
and correct `USING`/`WITH CHECK` MUST enforce D74-R1–R9. Browser roles receive no
direct mutation. Views, RPCs/functions, triggers, table owners, secret/service
roles, workers, Payload, support, imports, repairs, and AI MUST pass the same
Tenant/scope/operation invariants and poison tests.

### D74-R11 — External non-effects

D74 MUST NOT change Vercel team/account ownership, registration, registrant,
renewal, transfer status, DNS, nameservers, MX/DKIM/DMARC/CAA/DNSSEC, email,
unrelated hosts, certificates outside the exact provider association, external
caches/indexes/archives, another Site, or future availability. It MUST NOT call
the account-domain delete/move/transfer interfaces. A separately governed
provider-account release, if ever needed, is not D74.

### D74-R12 — Failure and forward recovery

Pre-barrier known failure changes nothing. After the barrier, timeout, lost
response, `429`, `5xx`, `403`, malformed/contradictory provider evidence,
residual association, or final-commit failure MUST retain the adverse fence and
claim, show one durable **Disconnection needs attention** state, and reconcile
the original work. The UI MUST tell staff not to resubmit or attach elsewhere.
No rollback may restore a former role automatically.

### D74-R13 — Durable business evidence and operations

The immutable receipt MUST bind actor, trusted timestamp/timezone, exact scope,
canonical host identity, expected heads, owner digest/version, fence evidence,
provider manifest/generation, attempts/readbacks, final result, and retained
reservation consequence. Technical telemetry is separate, minimized, correlated,
and redacted. Eleven named signals below MUST have thresholds, owners, and responses.

### D74-R14 — Bounded scale and provider discipline

Owner/provider manifests MUST be finite, versioned, indexed, and qualified at
declared maximum Tenant/Site/domain/route cardinalities. No public/request-time
provider call, unbounded event scan, N+1 owner query, per-domain webhook, or
unfair global queue is allowed. Provider work honors live limit/reset headers,
bounded jittered backoff, and Tenant-fair concurrency; launch SLOs require
measured production-shaped evidence.

### D74-R15 — Privacy, internationalization, and accessibility

Restricted owner/history/provider data MUST remain non-enumerating. Safe Unicode
plus canonical ASCII IDN display, bidi isolation, no material truncation, 320px,
400% zoom, keyboard, screen reader, touch, forced colors, reduced motion, long
localization, RTL, weak network, refresh/resume, session expiry, and JavaScript-
independent public failure behavior are release requirements. Status uses one
polite live region without repeated polling announcements.

### D74-R16 — Migration and rollout

No current `primaryDomain`, slug fallback, DNS, provider row, traffic absence,
or missing content may infer historical clearance/disconnection. Ambiguous
records are quarantined. Global hostname identities, claims, binding intervals,
constraints, negative readers, and adverse projection land before writers;
provider inventory shadows without deletion; writers enable by cohort last. A
kill switch stops new requests but never abandons committed reconciliation.
After barrier/provider effect, recovery is roll-forward.

### D74-R17 — Traceability and proof

The founder answer, glossary, ADRs, Phase 2/5/12, living spec, roadmap, future
consolidated OpenSpec, design, tickets, implementation, tests, migrations, and
release evidence MUST use the same terms/states/invariants. D74 is not shipped
until AC1–AC40, the monitors, inherited D8–D16/D72–D73 tests, and current
production-shaped provider/security/accessibility evidence pass.

### D74-R18 — Explicit non-goals

D74 adds no automatic/scheduled/bulk cleanup, domain transfer/reassignment,
registrar/DNS/email product, provider-account deletion, crawler, traffic/search
threshold, generic dependency editor, approval workflow, reminder/task, typed
confirmation, second resolver, arbitrary provider operation, or automatic
rollback. Support remains an exception path, not the normal command.

## Acceptance criteria and proof matrix

### Eligibility and owner clearance

- **AC1:** An exact nonprimary custom host with complete current clearance shows
  **Not public · Connected for hosting** and **Disconnect from this Site**.
- **AC2:** Primary, Redirect, platform/wildcard/preview/provider, Donor Portal,
  cross-Site/environment/Tenant, and pending/conflicting hosts are ineligible.
- **AC3:** Current direct Giving/auth/callback/API/protected/provider-return or
  other positive hosting dependencies block through one owner handoff.
- **AC4:** Historical facts, D9–D15 reservations, neutral adverse response, and
  validation paths ending with detach survive but do not falsely block;
  missing/stale/truncated/contradictory evidence blocks.

### Staff and visitor experience

- **AC5:** The confirmation names exact Site/host, stopping effect, external
  error risk, fresh setup, and registration/DNS/renewal/email/history non-effects.
- **AC6:** **Keep connected** receives initial focus; **Disconnect domain** is
  the only commit action; no forbidden friction or ambiguous deletion wording
  appears.
- **AC7:** Ineligible/unknown rows show cause-owned repair without an unexplained
  disabled disconnect control or hidden-fact disclosure.
- **AC8:** Acknowledgement immediately returns a durable **Disconnecting** state
  and says the page may be left; refresh/resume uses the receipt.
- **AC9:** Unknown provider outcome says not to resubmit/reattach and retains the
  claim; success says **Disconnected from this Site** and repeats non-effects.
- **AC10:** IDN/RTL/long-host copy is safe and untruncated at mobile/zoom; focus,
  screen reader, touch, forced-colors, reduced-motion, localization, weak-
  network, and session-expiry tests pass.
- **AC11:** Public requests during/after disconnection never reach Payload/slug
  fallback, another Site, content/cache, redirect, analytics, or branded fallback.
- **AC12:** DNS still pointing at Vercel produces only the warned external
  provider/browser behavior after removal; Core makes no false continuity claim.

### Local authority, concurrency, and history

- **AC13:** First transaction reauthorizes and CAS-pins exact scope, claim,
  binding, owner digest, provider generation, capability epoch, and operation.
- **AC14:** Audit/outbox/receipt failure rolls back the barrier; no provider call
  occurs in a database transaction.
- **AC15:** Disconnect versus Primary/Redirect/route activation has one winner;
  the barrier blocks every later favorable writer and current-head transform.
- **AC16:** Same-key/same-meaning retry returns the original operation; changed
  host/Site/digest/claim/provider/effect conflicts.
- **AC17:** Final release is impossible without matching fence acknowledgement
  and current provider absence bound to the same operation/generation.
- **AC18:** Release ends only the current claim/binding interval; hostname
  identity, history, attribution, audits, and every adverse reservation remain.

### Vercel/provider behavior and failures

- **AC19:** No provider removal begins before every required adverse admission
  cohort is acknowledged.
- **AC20:** Exact server-derived team/project/ASCII hostname are used; caller,
  browser, worker, provider event, DNS, support, and UI cannot widen scope.
- **AC21:** Success, already absent, lost response, timeout, `429`, `5xx`, `403`,
  malformed response, and duplicate/out-of-order/missing webhook cases reconcile
  under one work identity.
- **AC22:** Signed events use raw-body constant-time verification, event dedupe,
  exact scope checks, quick enqueue, and never replace readback.
- **AC23:** Project-domain absence with residual alias/branch/redirect/wildcard/
  another Core association retains **Needs attention** and the claim.
- **AC24:** Account-domain delete, registrar/renewal/transfer, DNS/NS/MX/CAA/
  DNSSEC/email mutation, force/move, cascade, and unrelated host effects are
  unreachable in code and tests.
- **AC25:** Provider removal success plus final-commit failure remains adverse
  and reserved until the same operation finalizes.
- **AC26:** Provider not-found proves absence only with current authenticated
  exact-scope access; permission loss/wrong scope remains unknown.
- **AC27:** Manual provider drift cannot restore favorable Core output, free the
  claim, select another Site, or silently re-add an association.
- **AC28:** Pre-barrier failure changes nothing; post-barrier recovery is
  forward-only and never offers cancel, blind retry, or automatic restore.

### Security, data, migration, scale, and traceability

- **AC29:** Cross-Tenant/Site/environment and IDN-equivalent probes/actions are
  non-enumerating; restricted owner/provider/history detail never leaks.
- **AC30:** Logs, traces, receipts, exports, support views, and errors minimize
  sensitive data and never contain credentials/raw secret/provider payloads.
- **AC31:** Direct DML and every grant/RLS/view/RPC/function/trigger/table-owner/
  secret/service/worker/Payload/import/repair/support/AI path fail the same
  unauthorized, cross-scope, precondition, and premature-release poison tests.
- **AC32:** Composite FKs, unique/check constraints, restricted deletes,
  immutable rows, `USING`/`WITH CHECK`, and indexes are inspected/tested under
  positive and negative operations.
- **AC33:** A future fresh binding inherits no former role/content/brand/locale/
  permission/cache/cookie/service-worker/provider state and still enforces every
  D9–D15 reservation; ADR-0196 governs the fresh claimant policy.
- **AC34:** Maximum qualified owner/provider cohorts meet declared transaction,
  queue, provider-call, reconciliation, and UI latency budgets without N+1 or
  public/request-time provider calls.
- **AC35:** All current readers reject unknown/disconnecting/disconnected hosts
  before writers enable; ambiguous legacy rows are quarantined, never inferred.
- **AC36:** Mixed-version, deploy/rollback, delayed job/event, feature-flag,
  kill-switch, provider outage, and roll-forward drills preserve fence/claim/
  history invariants.
- **AC37:** D74 terms, states, numbers, owners, invariants, requirements, and ACs
  trace without contradiction through every required artifact.
- **AC38:** Consolidated Phase 24 OpenSpec validates strictly and contains
  positive, negative, authorization, concurrency, provider, migration,
  accessibility, performance, and production-shaped scenarios before tickets.
- **AC39:** Representative ministry staff distinguish website stop, hosting
  disconnect, DNS, registration, email, history, and fresh setup and complete
  the eligible task without assistance at the accepted success threshold.
- **AC40:** No runtime/schema/provider/production claim is made until D72/D73,
  Phase 23 generation authority, D74-R1–R18, AC1–AC40, and release evidence are
  implemented and verified.

## Required monitors

| Signal                                                                | Threshold                                                                       | Owner                               | Required response                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site_domain_disconnect_positive_dependency_commit_total`             | Any                                                                             | Domain Platform + exact route owner | Stop new disconnects, retain fence/claim, inspect owner registry, repair forward, and add the missing negative proof.                                                                                                                                    |
| `site_domain_disconnect_provider_delete_without_fence_total`          | Any                                                                             | Security + Domain Operations        | Stop provider worker, preserve evidence and claim, declare incident, prove admission sequence before restart.                                                                                                                                            |
| `site_domain_disconnect_claim_released_before_provider_absence_total` | Any                                                                             | Security + Database                 | Globally fence hostname, disable release/claim writers, investigate cross-Tenant exposure, reconstruct safely.                                                                                                                                           |
| `site_domain_disconnect_provider_routing_residual_total`              | Any residual association after claimed removal                                  | Domain Operations                   | Keep claim reserved, show **Needs attention**, remove/reconcile the exact association; never round to success.                                                                                                                                           |
| `site_domain_disconnect_admission_divergence_age_seconds`             | Any cohort above 30 seconds                                                     | Public Runtime                      | Stop new operations, preserve adverse authority, reconcile projection/cache, and page the owner.                                                                                                                                                         |
| `site_domain_disconnect_unknown_provider_age_seconds`                 | Above the evidence-qualified adapter SLO                                        | Domain Operations                   | Retain claim, page owner, read back/reconcile the same work identity; block launch until a numeric SLO is qualified.                                                                                                                                     |
| `disconnected_hostname_favorable_core_response_total`                 | Any                                                                             | Security + Public Runtime           | P0; globally fence, preserve request/cache evidence, contain wrong-Site exposure, and repair forward.                                                                                                                                                    |
| `site_domain_disconnect_unauthorized_attempt_total`                   | Five denied attempts by one principal in 10 minutes or any cross-Tenant attempt | Security                            | Re-evaluate/revoke session epoch, investigate actor/device, retain minimized evidence, notify per policy.                                                                                                                                                |
| `site_domain_disconnect_p99_seconds`                                  | Above qualified p99 for 15 minutes or oldest in-progress above qualified SLO    | Domain Operations                   | Stop new cohort expansion, inspect queue/provider limits, preserve truthful state, and scale/reconcile bounded work.                                                                                                                                     |
| `site_domain_disconnect_history_or_reservation_loss_total`            | Any missing binding history, receipt, attribution, or D9–D15 reservation        | Data + Giving + Security            | Block release/rebinding, restore adverse reservation/history from evidence, incident review; never invent favorable meaning.                                                                                                                             |
| `disconnected_hostname_dns_still_targets_core_age_seconds`            | Longer than 24 hours and longer than two observed pre-disconnect DNS TTLs       | Domain Operations                   | Verify the exact DNS observation, keep **Update DNS at your provider** guidance visible, notify through the Tenant's existing domain-attention surface, and never mutate DNS, reattach, or infer ownership; escalate only a verified takeover indicator. |

## Ruthless synthesis

### Must be resolved before recording

Resolved in this decision: clearance taxonomy, exact custom-host scope,
non-cascading action, staff terminology, two-commit barrier/readback/release
sequence, retained history/reservations, provider/account/DNS exclusions,
forward-only recovery, and ADR-0196's fresh-claim boundary. The founder answer is therefore
recorded only in its corrected form below.

### Must be captured in specification and design

1. D74-R1–R18, AC1–AC40, the eleven monitors, and inherited D8–D16/D72–D73 rules.
2. Exact Domain/claim/binding/operation/owner/provider invariants and Phase 12's
   protected `sites.disconnect_domains` human capability.
3. Provider association inventory, signed-event intake, authenticated readback,
   ambiguity interpretation, queue fairness, numeric SLO qualification, and
   exception runbooks.
4. Base Maia Domains workspace states, exact copy, AlertDialog focus, durable
   receipts, IDN/localization/accessibility/mobile/weak-network behavior, and
   representative staff comprehension evidence.
5. Consolidated Phase 24 OpenSpec after Phase 23 generation-authority
   reconciliation; no runtime work may infer that the current repo already has
   these foundations.

### Required implementation safeguards and order

1. Reconcile accepted Site/D8–D16/D72–D73 and Phase 23 public-generation
   contracts; register and prove the Phase 12 capability atom/bundle.
2. Land canonical hostname identity, platform-wide claims, binding intervals,
   owner registry, append-only operations, structural constraints, grants/RLS,
   and adverse readers with D74 writers disabled.
3. Make every public/CMS/Giving/auth/cache path reject unknown, Disconnecting,
   and disconnected hosts before any Payload `primaryDomain` or slug fallback.
4. Shadow the complete provider-association census/readback; prove ambiguity,
   drift, rate-limit, signed-event, maximum-cardinality, and outage behavior
   without deleting anything.
5. Implement the two local transactions and sealed provider worker; run DB/RLS/
   privileged/concurrency/mixed-version/rollback/provider/public-seam proofs.
6. Build and usability-test the compact Domains action and durable states;
   enable one bounded production cohort behind a new-request kill switch while
   existing operations continue forward reconciliation.

### Monitor only

Only the eleven named signals above and explicitly external search/browser
observations are residual monitoring. Any positive dependency disconnected,
provider work before fencing, premature claim release, residual Core routing,
favorable disconnected-host response, unauthorized cross-Tenant effect, or
history/reservation loss is an incident—not an acceptable monitored risk.

## Exact corrected decision

> Core will provide a separate Tenant self-service **Disconnect from this Site**
> action for one exact Tenant-controlled custom hostname only after a complete
> current finite owner manifest proves that no current behavior requires Core
> hosting. A Primary/Redirect hostname, positive source-owned route, pending or
> ambiguous operation, unknown evidence, platform/provider/wildcard host, or
> independently governed origin cannot disconnect.
>
> Historical Site/domain facts, receipts, attribution, D9–D15 reservations,
> provider-control paths that end with detachment, and the current neutral
> adverse response survive and do not falsely block. The confirmation names the
> exact Site/hostname, warns that registration and DNS remain unchanged and that
> DNS still pointing to Vercel may produce a provider/browser error, and offers
> only **Keep connected** and **Disconnect domain**.
>
> One short reauthorized CAS transaction records the operation and establishes a
> monotonic Disconnecting barrier. After every required public-admission cohort
> acknowledges the adverse fence, a sealed worker removes only the exact Core-
> controlled Vercel routing associations and performs authenticated current
> readback. Only proved absence permits a second transaction to end the current
> Site-binding interval and platform-wide occupancy claim. Ambiguity retains the
> fence and claim and reconciles forward; there is no blind retry, cancellation,
> automatic restore, transfer, DNS/account deletion, or cross-host cascade.
>
> Canonical hostname identity, immutable history, audits, and protected address
> reservations are never deleted. Any future Core use is fresh setup under the
> ADR-0196 claimant policy and inherits no prior Site meaning.

## D76 reconciliation (2026-08-30)

An eligible same-Tenant live move follows ADR-0197, not D74→D75. D76 never
removes provider hosting or releases global occupancy; it establishes its own
adverse Moving barrier and advances immutable Site-binding/public heads. A
Disconnecting or provider-ambiguous hostname cannot start D76, and D74 cannot
run while a D76 operation is nonterminal.
