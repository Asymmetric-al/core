# Phase 24 D76 — Prepared same-Tenant Site Domain cutover adversarial review

**Date:** 2026-08-30  
**Founder answer reviewed:** Option 1 — prepared self-service Site-to-Site
cutover, conditioned on current modern practice and an excellent Core-consistent
Tenant/staff UX.  
**Final disposition:** **Accept with required amendments.**  
**Recorded decision:**
[ADR-0197](../../adr/0197-prepared-same-tenant-site-domain-cutover.md)

## Executive verdict

Prepared same-Tenant self-service is the strongest permanent product choice.
It solves a real Phase 24 multi-Site job without abusing D74 disconnection and
D75 ownership claiming. Current Vercel guidance also distinguishes authenticated
Move from DNS claiming and does not require repeat proof when the relevant owner
still controls both scopes.

The founder answer is unsafe if interpreted as a mutable Site reassignment, an
instant global switch, a Vercel project move, a universal zero-downtime promise,
automatic destination publication, or implicit movement of content, Giving,
authentication, routes, cookies, or provider state. Core's current repository
uses one `apps/donor` Vercel project for every public Site. Launch D76 must
therefore be a provider **no-op** and a generation-safe Core Domain/public-
authority successor.

Distributed admission makes one globally instantaneous switch impossible to
prove. One human command must prepare both Site outcomes, establish and read
back an adverse **Moving** barrier, then append and advance the immutable target
binding and complete public-generation cohort. Core may create a bounded neutral
gap; it must never serve both Sites favorably, expose the target early, or show
Asym/Vercel branding.

## Current behavior, intended behavior, and permanent path

| Layer             | Verified current repository behavior                                                                                                                                                                                    | D76 intended behavior                                                  | Best permanent path                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Host resolution   | [`resolve-tenant.ts`](../../../apps/admin/src/cms/public/resolve-tenant.ts) trusts forwarded-host input, queries Payload Tenant `primaryDomain` with `overrideAccess: true`, and falls back to slug.                    | One exact hostname changes from Site A to Site B.                      | Retire the legacy resolver before D76; use the D72 operational Domain authority and adverse-first projection.  |
| Domain storage    | [`tenants.ts`](../../../apps/admin/src/cms/collections/tenants.ts) has one optional nonunique Tenant field; no Site binding or immutable generation exists.                                                             | Continuous same-Tenant occupancy with a new Site binding.              | Immutable host, claim/binding generations, one private global current head, append-and-advance only.           |
| Public context    | [`context.ts`](../../../packages/api/src/cms/public/context.ts) still carries `siteId: null`.                                                                                                                           | Every request resolves the exact target Site/generation after cutover. | Generation-bearing public context and fail-closed host/route admission.                                        |
| Authorization     | [`permissions.ts`](../../../packages/auth/permissions.ts) has broad MVP staff permissions and no D72–D76 atoms.                                                                                                         | Current staff prepare and commit for both Sites.                       | `sites.manage_domains` on both to prepare; `sites.activate_domains` on both to commit; no new move capability. |
| Provider topology | [`affected-projects.mjs`](../../../scripts/vercel/affected-projects.mjs) and [`vercel-build-controls.mjs`](../../../scripts/verify/vercel-build-controls.mjs) pin all public donor traffic to one `apps/donor` project. | Site assignment changes without changing provider ownership.           | Launch provider no-op; any project mutation is drift. A future per-Site project topology needs another ADR.    |
| Redirects/routes  | [`apps/donor/next.config.ts`](../../../apps/donor/next.config.ts) has host-blind permanent redirects including `/give`; D9–D15 are documentation intent.                                                                | Protected meaning remains source-owned through the move.               | Remove static bypasses; run the finite owner registry before website role admission.                           |
| UI                | No Site Domain workspace or move flow exists.                                                                                                                                                                           | One self-service review and durable operation.                         | Full-page compact Base Maia `PageShell`; two entry points, one command/state machine.                          |
| OpenSpec          | Merged OpenSpec contains no D76 runtime contract.                                                                                                                                                                       | D76 becomes consolidated Phase 24 intent.                              | Record docs now; carry every clause into the later Phase 24 PRD/OpenSpec/design/tickets before implementation. |

Freshly fetched `HEAD` and `origin/develop` were both
`7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. Phase 23 PR
[#1340](https://github.com/Asymmetric-al/core/pull/1340) remained `OPEN/BLOCKED`
at `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`. These facts are current-source
evidence, not proof that Phase 23/D72–D76 runtime authority exists.

## Verified current external evidence

| Source                                                                                                                               | Verified fact                                                                                                                                 | D76 use                                                                          | Boundary                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [Vercel claim guidance](https://vercel.com/docs/domains/working-with-domains/claim-domain-ownership)                                 | When both scopes remain accessible, Vercel recommends Move because it is simpler and does not require DNS verification.                       | Do not repeat DNS proof for an ordinary trustworthy same-Tenant assignment.      | Vercel access never grants Core Site/Tenant authority.                                                                            |
| [Vercel Domain model](https://vercel.com/docs/domains/working-with-domains)                                                          | Domain ownership and project assignment are distinct.                                                                                         | Tenant is Core's ownership/occupancy boundary; Site is assignment/presentation.  | The analogy does not make a Site a Vercel Project.                                                                                |
| [Vercel generated Move operation](https://github.com/vercel/sdk/blob/main/src/funcs/projectsMoveProjectDomain.ts)                    | Current SDK exposes `POST /v1/projects/{source}/domains/{host}/move`; documented outcomes include success, conflicts and ambiguous failures.  | Confirms move is a first-class provider operation.                               | Launch Core does not call it because both Sites share one project and the endpoint promises no Core atomicity or no-gap behavior. |
| [Vercel zero-downtime guidance](https://vercel.com/kb/guide/how-to-move-a-domain-between-vercel-projects-with-zero-downtime)         | Provider guidance first aliases the immutable target; raw remove/add may briefly interrupt service.                                           | Never implement D76 as remove/add or promise literal zero downtime.              | Core launch has no project move at all.                                                                                           |
| [Vercel Activity Log](https://vercel.com/docs/activity-log)                                                                          | `project-domain-moved` is observable provider activity.                                                                                       | Detect unexpected provider drift.                                                | Provider activity is evidence, not Core completion.                                                                               |
| [Cloudflare custom-hostname edit](https://developers.cloudflare.com/api/resources/custom_hostnames/methods/edit/)                    | A verified custom hostname can change its origin independently of ownership proof.                                                            | Supports ownership-versus-assignment separation.                                 | Cloudflare is not Core's selected authority/provider.                                                                             |
| [Shopify managed-domain transfer](https://help.shopify.com/en/manual/domains/managing-domain-ownership/transferring-shopify-domains) | Shopify uses explicit authenticated permissions/confirmation for a managed domain move; DNS proof is for a different ownership case.          | Supports consequence-labelled authorized movement.                               | Shopify store/domain semantics do not govern Core.                                                                                |
| [WordPress.com Site move](https://wordpress.com/support/domains/move-a-domain-to-another-wordpress-com-site/)                        | WordPress.com offers a direct same-account domain-to-Site move with target selection and final confirmation for registered/connected domains. | Confirms the staff mental model and avoids disconnect/reclaim churn.             | Its flow does not prove Core's Tenant, route, generation or two-Site invariants.                                                  |
| [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                | Grants and policies both matter; views and service/secret roles can bypass policies; exposed tables need operation tests.                     | Requires minimum grants, FORCE RLS where applicable, and privileged-path parity. | RLS remains defense in depth; structural commands own the invariant.                                                              |
| [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)                                         | Row locks block competing writers; inconsistent lock order creates deadlocks; transactions should be short.                                   | Stable host-first/Site-ID lock order and no network under lock.                  | Locks do not make distributed projections atomic.                                                                                 |
| [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)                                     | Read Committed can observe different snapshots; Serializable prevents anomalies but requires retry handling.                                  | Expected heads, constraints, deterministic locks and whole-command retries.      | Isolation alone does not model semantic idempotency or edge convergence.                                                          |
| [RFC 10025](https://auth48-transition.rfc-editor.org/authors/rfc10025.html)                                                          | Cookies remain host/domain scoped and are sent to the same hostname after the server meaning changes.                                         | Binding-generation validation and deliberate Tenant/Site session treatment.      | Cookies never authorize the new Site by possession alone.                                                                         |
| [Stripe Checkout custom domains](https://docs.stripe.com/payments/checkout/custom-domains)                                           | Stripe-hosted custom domains are separately configured provider resources, generally on a subdomain.                                          | D76 creates no Stripe/domain/payment mutation.                                   | Site Domain movement never moves Checkout, money or settlement truth.                                                             |
| [WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                         | Meaningful async status must be programmatically available without moving focus.                                                              | One polite durable operation announcement, no polling noise.                     | Technical status does not replace visible business outcome.                                                                       |
| [WCAG 2.2 error identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)                               | Errors must identify the affected item and describe the problem in text.                                                                      | Visible error summary, exact field error and deterministic focus.                | Provider/internal errors must first be translated to a safe cause-owned action.                                                   |

## Facts, judgments, assumptions, and unresolved unknowns

### Verified repository facts

- One `apps/donor` Vercel project currently serves the public/donor app; Core
  does not deploy one project per Site.
- Current source has no operational Site-aware Domain authority or D76 UI.
- D72 requires one current Site binding, one Primary per active public Site,
  immutable complete role generations, provider subordination and a bounded
  critical path.
- D73 already owns finite hard/source/advisory impact classification and every
  former-primary disposition.
- D74 releases occupancy only after adverse fencing and provider absence; D76
  must never use it.
- D75 acquires a new claim only after release and fresh proof; D76 keeps the
  existing same-Tenant occupancy.
- D9–D15 retain route/address authority ahead of Site website routing.

### Product judgments

- **Prepared Site Domain Cutover** is the canonical domain term; staff see
  **Move to another Site**.
- Repeat DNS proof is triggered by adverse ownership/control evidence, not by
  age or ordinary same-Tenant reassignment.
- Launch is provider no-op and production-only; future provider-per-Site
  topology is a separate decision.
- Preventing a wrong-Site response outranks a literal zero-downtime promise; a
  measured neutral gap is acceptable.
- One full-page review is proportionate. A modal, wizard, approval queue,
  typed confirmation, reason, or schedule is not.
- Destination website role is explicit and initially unselected.

### Assumptions requiring representative evidence

- Missions organizations will sometimes reorganize branded Sites while keeping
  a public hostname. This is plausible and central to multi-Site management,
  but frequency is not yet measured.
- Representative Domain Managers can understand source replacement,
  destination role, protected-route outcomes and a possible neutral cutover gap
  from the proposed review without support.
- The future D72 admission projection can expose bounded cohort acknowledgements
  without request-time provider/database scans.
- Maximum Sites, domains, locales, affected owner entries and public heads per
  move remain unmeasured; design must qualify limits and latency before launch.

### Decisions outside D76

- ADR-0198/D77 now settles the move-time rule: every critical owner remains a
  hard gate and one deterministic effective-host comparison exposes ordinary
  exceptions while compiling durable source-only not-found outcomes.
  ADR-0199/D78 now permits one exact, directional, revision-bound General Page
  owner qualification; absent its current proof, the collision still blocks or
  compiles not-found. D76 consumes but never authors that Page-owner fact.
- A future cross-project or multi-provider Site topology requires a new ADR and
  cannot be inferred from D76.
- Contested cross-Tenant current claims remain outside D74–D76.
- Exact physical relation/event names and measured projection/gap SLOs remain
  implementation-design and release-evidence decisions.

## Ruthless category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.** **What could go wrong:** forcing D74→D75 creates an
avoidable outage and DNS/provider work; silent reassignment exposes the wrong
Site. **Why it matters:** moving a still-owned address is a normal multi-Site
administration job with direct public/donor trust impact. **Severity: High.
Likelihood: High. Evidence/reasoning:** Vercel separates authenticated Move from
ownership claim, and Phase 24 explicitly promises self-service multi-Site
management. **Decision effect:** validates Option 1 but only as a prepared Core
successor. **Permanent fix:** D76-R1–R4, R7, R20; AC1–AC8, AC37–AC40.

### 2. Brittleness

**Material concern: Yes.** **What could go wrong:** a `site_id` update, one
Boolean, one DB transaction, optimistic UI or eventual cache invalidation can
produce overlapping/mixed Sites and stale worker effects. **Why it matters:**
the hostname is a trusted public identity. **Severity: Critical. Likelihood:
High. Evidence/reasoning:** D72 uses immutable generations; distributed edge
cohorts cannot switch atomically with Postgres. **Decision effect:** requires an
adverse-fenced append-and-advance sequence. **Permanent fix:** D76-R9–R13,
R15–R19; AC17–AC32, AC37–AC40.

### 3. Technical debt

**Material concern: Yes.** **What could go wrong:** a D76-only resolver,
provider abstraction, impact engine, permission, workflow builder, or mirrored
Site state duplicates D72–D75 and drifts. **Why it matters:** later Domain
changes would synchronize several authorities. **Severity: High. Likelihood:
High. Evidence/reasoning:** D72/D73 already own heads, critical-owner manifests
and capabilities. **Decision effect:** one additional move-plan/operation facet
only. **Permanent fix:** D76-R2, R7, R9–R10, R14–R20; AC3–AC8, AC17–AC40.

### 4. Edge cases

**Material concern: Yes.** **What could go wrong:** source/destination Primary,
private target, no replacement, target former Primary, IDNs, stale proof,
redirect history, concurrent retirement, route collisions, cookies, in-flight
forms or provider drift break a happy path. **Why it matters:** several are
ordinary Site lifecycle states. **Severity: Critical. Likelihood: High.
Evidence/reasoning:** D6/D8/D72/D73 define mutually constrained heads and RFC
10025 preserves same-host cookies. **Decision effect:** finite role/lifecycle
matrix plus binding-generation tests. **Permanent fix:** D76-R1–R8, R15–R20;
AC1–AC40.

### 5. Footguns

**Material concern: Yes.** **What could go wrong:** Vercel Move/alias/remove-add,
`--force`, automatic role, implicit retirement, routine TXT rotation, Undo,
drag/drop or content-copy controls can cause outage or hidden public effects.
**Why it matters:** each looks convenient in implementation/UI but bypasses
Core ownership. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** Vercel documents separate move/alias behavior and Core's
launch topology needs none of it. **Decision effect:** forbids shortcuts.
**Permanent fix:** D76-R1–R7, R10–R14, R18–R20; AC1–AC16, AC25–AC40.

### 6. Tenant safety

**Material concern: Yes.** **What could go wrong:** source identity leaks to an
unauthorized viewer, a cross-Tenant target is selected, or occupancy briefly
releases and another claimant wins. **Why it matters:** sensitive ministry
identity and public content could cross scopes. **Severity: Critical.
Likelihood: High. Evidence/reasoning:** D72 requires platform-wide uniqueness;
current code is Tenant-only/nonunique. **Decision effect:** both-Site scope,
permission-filtered disclosure and continuous private occupancy. **Permanent
fix:** D76-R1–R3, R12, R14–R20; AC1–AC8, AC17–AC40.

### 7. Database, RLS, and authorization safety

**Material concern: Yes.** **What could go wrong:** a permitted row update moves
scope; a service role/function bypasses RLS; two heads advance partially; or an
actor loses one Site's authority during review. **Why it matters:** UI/RLS alone
cannot preserve two-Site public invariants. **Severity: Critical. Likelihood:
High. Evidence/reasoning:** current Supabase docs require grants plus policies
and explicitly identify bypass paths; Postgres documents lock/deadlock and
snapshot behavior. **Decision effect:** private head, immutable generations,
command-only writes and privileged poison tests. **Permanent fix:** D76-R10,
R12, R14–R18, R20; AC17–AC32, AC37–AC40.

### 8. Overengineering

**Material concern: Yes.** **What could go wrong:** supporting provider-project
moves, schedules, bulk/drag operations, universal routing migration, crawler,
approval queue or generic saga engine solves speculative cases. **Why it
matters:** it obscures one exact same-project Site successor and raises
operational cost. **Severity: High. Likelihood: High. Evidence/reasoning:** Core
currently has one donor project and D73's finite registry. **Decision effect:**
narrows launch to provider no-op, one host and two Sites. **Permanent fix:**
D76-R1–R2, R7, R9, R13–R14, R20; AC1–AC8, AC17–AC20, AC37–AC40.

### 9. UX/UI and user friction

**Material concern: Yes.** **What could go wrong:** a modal/wizard, hidden source
impact, default role, raw provider status, disabled unexplained CTA or repeated
DNS proof strands staff or creates accidental publication. **Why it matters:**
the action spans two Sites and unfamiliar asynchronous states. **Severity:
High. Likelihood: High. Evidence/reasoning:** Core's PageShell/detail standards,
Base Maia contract and WCAG status/error guidance require visible durable
context and cause-owned repair. **Decision effect:** one full-page consequence
review, explicit roles, durable states and no routine proof. **Permanent fix:**
D76-R2–R7, R18–R20; AC3–AC16, AC29–AC40.

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.** **What could go wrong:** provider assignment, CMS,
DNS, cache, move plan, or target preview becomes current binding/public
authority. **Why it matters:** dual ownership yields circular sync and wrong-
Site routing. **Severity: Critical. Likelihood: High. Evidence/reasoning:** D72
assigns binding/role authority to Operational Domain; D6/D73 and route owners
own their heads. **Decision effect:** exact ownership map and one command.
**Permanent fix:** D76-R1–R13, R15–R20; AC1–AC40.

### 11. Hidden coupling

**Material concern: Yes.** **What could go wrong:** the hostname move silently
copies Brand/Navigation/content, rewrites Giving/auth/callback routes, mutates
Stripe, retires a Site, changes DNS/email or equates Site with provider Project.
**Why it matters:** these domains have independent safety, privacy and lifecycle
rules. **Severity: Critical. Likelihood: High. Evidence/reasoning:** platform
boundaries and D8–D15 explicitly separate those owners. **Decision effect:**
zero-effect clauses and owner dispositions. **Permanent fix:** D76-R4–R8,
R13–R14, R19–R20; AC5–AC16, AC25–AC40.

### 12. Failure modes

**Material concern: Yes.** **What could go wrong:** barrier projection is
unknown, authority swaps but response is lost, target admission lags, source
cannot be re-admitted, or unexpected provider drift creates both/neither
routes. **Why it matters:** retries could duplicate effects or expose a wrong
Site. **Severity: Critical. Likelihood: High. Evidence/reasoning:** local and
distributed effects cannot be one transaction. **Decision effect:** durable
operation, adverse barrier, readback and forward reconciliation. **Permanent
fix:** D76-R9–R13, R17–R20; AC17–AC40.

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.** **What could go wrong:** two staff move the host to
different Sites, D73/D74/D75/D8/D66 changes race, proof degrades, capability is
revoked, or a lost response is resubmitted with changed meaning. **Why it
matters:** one hostname and both Sites have interdependent heads. **Severity:
Critical. Likelihood: High. Evidence/reasoning:** Postgres requires stable lock
order/retries and current repository decisions use semantic receipts. **Decision
effect:** exact state machine, deterministic locks and meaning-bound idempotency.
**Permanent fix:** D76-R9–R12, R15, R17–R18; AC17–AC32, AC37–AC40.

Valid lifecycle:

```text
needs_preparation → ready_to_move → moving_barrier → authority_swapped
                  → plan_changed
moving_barrier → move_not_started (only before authority swap, after source proof)
authority_swapped → target_admitting → completed | needs_attention
```

After authority swap, correction is a new successor; there is no Undo state.

### 14. Data integrity risks

**Material concern: Yes.** **What could go wrong:** old `site_id` changes,
source/target bindings overlap, a source Site loses its Primary, move history is
deleted, or protected addresses become destination routes. **Why it matters:**
public and financial history become false. **Severity: Critical. Likelihood:
High. Evidence/reasoning:** D72's complete immutable role generations and D10's
permanent reservations reject mutable shortcuts. **Decision effect:** append-
only heads, cardinality constraints and reservation precedence. **Permanent
fix:** D76-R4–R12, R15–R20; AC9–AC32, AC37–AC40.

### 15. Security and privacy risks

**Material concern: Yes.** **What could go wrong:** old cookies, sessions,
signed context, service workers, caches or permissions authorize destination
behavior; unauthorized users learn the source Site. **Why it matters:** the
origin is unchanged even though Site meaning changes. **Severity: Critical.
Likelihood: Medium-high. Evidence/reasoning:** RFC 10025 preserves host/domain
cookies; D75 already prohibits root-scope reusable-host service workers.
**Decision effect:** generation-bound client/runtime authority and permission-
safe disclosure. **Permanent fix:** D76-R2, R14–R20; AC3–AC8, AC21–AC40.

### 16. Scalability and performance risks

**Material concern: Yes.** **What could go wrong:** a global scan, one query per
route/locale, unbounded move plan, long lock, or per-request provider/database
call degrades large Tenants and edge latency. **Why it matters:** Domain
admission is on every public request and the move touches two Site cohorts.
**Severity: High. Likelihood: Medium. Evidence/reasoning:** D72 sets one bounded
indexed admission projection and D73 a finite owner registry. **Decision effect:**
batch indexed preparation and short exact-head transactions. **Permanent fix:**
D76-R7, R9–R10, R15, R17, R19–R20; AC17–AC20, AC29–AC40.

### 17. Operational burden

**Material concern: Yes.** **What could go wrong:** support manually edits
Vercel or Postgres, staff coordinate a maintenance window, ambiguous moves need
DB repair, or every move needs registrar access. **Why it matters:** ordinary
multi-Site work must remain self-service for small ministries. **Severity:
High. Likelihood: High. Evidence/reasoning:** same-project Core topology needs no
provider mutation or routine DNS proof. **Decision effect:** product-owned
durable self-service with cause-owned exceptions. **Permanent fix:** D76-R2–R3,
R9–R14, R18–R20; AC3–AC8, AC17–AC20, AC29–AC40.

### 18. Observability and auditability gaps

**Material concern: Yes.** **What could go wrong:** logs cannot prove which
plan/heads/barrier/target won, how long the neutral gap lasted, or whether a
wrong Site or protected route appeared. **Why it matters:** safe diagnosis and
forward repair require durable business evidence distinct from telemetry.
**Severity: High. Likelihood: High. Evidence/reasoning:** D72–D75 require
receipts, outbox and readback; Vercel Activity is provider-only. **Decision
effect:** immutable plan/operation receipts plus twelve named monitors.
**Permanent fix:** D76-R9–R13, R17–R20; AC17–AC40.

### 19. Dependency and integration risks

**Material concern: Yes.** **What could go wrong:** a Vercel endpoint/alias is
mistaken for Core move authority, project topology changes silently, rate/
provider events drift, or Stripe custom-domain state is swept along. **Why it
matters:** provider disagreement could expose the wrong deployment or create
money-facing confusion. **Severity: Critical. Likelihood: Medium.
Evidence/reasoning:** current repo has one donor project; Vercel Move has no Core
atomic/no-gap guarantee; Stripe custom domains are separate resources.
**Decision effect:** provider-no-op launch and separate future ADR. **Permanent
fix:** D76-R3, R7, R13, R18–R20; AC7–AC8, AC17–AC20, AC25–AC40.

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.** **What could go wrong:** legacy `primaryDomain` or
provider state is treated as a binding, old readers ignore the barrier, new
writers run before constraints, or rollback revives a stale source. **Why it
matters:** mixed versions can bypass the entire cutover contract. **Severity:
Critical. Likelihood: High. Evidence/reasoning:** current resolver and OpenSpec
have no D76 authority. **Decision effect:** negative readers/barriers first,
proved candidates only, writer-off kill switch and forward recovery. **Permanent
fix:** D76-R18–R20; AC33–AC40.

### 21. Testability, traceability, and proof

**Material concern: Yes.** **What could go wrong:** a happy-path UI or row test
passes while cross-Site authorization, Primary cardinality, distributed lag,
cookies, routes, concurrency or migration fails. **Why it matters:** D76 spans
two Sites, public edge, browser state and several source owners. **Severity:
High. Likelihood: High. Evidence/reasoning:** repository proof policy requires
public-seam, negative and production-shaped evidence. **Decision effect:** 40
falsifiable criteria and complete artifact trace. **Permanent fix:** D76-R20 and
the proof matrix below; AC1–AC40.

### 22. Other development hazards

**Material concern: Yes.** **What could go wrong:** staff-facing “transfer,”
“migration,” “instant,” “zero downtime,” or “everything moves” language creates
false legal, provider, content or financial promises; ordinary route continuity
is guessed. **Why it matters:** terminology can authorize unsafe behavior and
create donor-visible harm. **Severity: Critical. Likelihood: Medium-high.
Evidence/reasoning:** provider moves, Core bindings and route meaning are
separate, and ADR-0198/D77 now makes route continuity an exact owner-gated
manifest comparison. **Decision effect:** controlled language, truthful neutral-
gap copy and explicit D77 consumption. **Permanent fix:** D76-R1, R4–R8, R11,
R13, R19–R20; D77-R1–R22; AC1–AC16, AC21–AC40.

## Exact normative requirements

### D76-R1 — Exact same-Tenant production scope

Source and destination MUST be different current Sites in the same trusted
Tenant and production environment. The exact custom hostname MUST have one
current, non-Disconnecting, noncontested binding/claim. Cross-Tenant,
cross-environment, wildcard, platform/provider host, Donor Portal, retiring,
retired, provider-ambiguous, or safety-fenced cases MUST be unavailable.

### D76-R2 — One workflow with permission-safe entry

Source **Move to another Site** and destination **Move to this Site** MUST open
one route-addressable durable review and one command/state machine. Same-Site
entry opens Domain detail. Source identity MAY appear only to a viewer currently
authorized for it; cross-Tenant and unauthorized states remain non-enumerating.

### D76-R3 — Current control revalidation, not routine TXT proof

Core MUST revalidate the current hostname/Tenant/environment/provider-control
posture server-side. Age alone MUST NOT require new proof. D74 disconnection,
scope/hostname/provider-ownership change, missing provenance, `verified: false`,
loss/conflict or material ambiguity MUST pause the review and require a fresh
exact move-bound challenge while source authority remains unchanged.

### D76-R4 — Required explicit destination role

The review MUST require one initially unselected destination website role:
Primary, Redirect, or Not public. Eligibility MUST derive from D6/D72/D73 and
current target state. No UI/provider/history heuristic may preselect or infer
the role.

### D76-R5 — Source Primary remains valid or blocks

If the moved host is source Primary and source stays active/nonretired, the
plan MUST include a different qualified replacement Primary and complete source
successor closure. The moved host's source website role ends. D76 MUST NOT pause,
retire, unpublish or take the source offline; absent replacement blocks with a
cause-owned preparation path.

### D76-R6 — Destination D6/D73 composition

Destination Primary on a private Site MUST pass D6 and the final action MUST
name first go-live. Destination Primary replacing an existing Primary MUST
include D73's current initially unselected former-primary disposition and every
redirect/cache/route constraint. Redirect requires a qualified current target
Primary. Not public creates no favorable destination website role.

### D76-R7 — One finite critical owner inventory

D76 MUST reuse the versioned D72/D73 critical-path/owner registry for Domain,
Site lifecycle, D1/D6/D66 public heads, brand/Navigation/locales/origins,
D9–D15 routes/reservations, auth/callback/API/protected/security owners, cache/
admission cohorts and provider topology. It MUST NOT add a generic impact
engine, universal route graph, Internet crawler or claim of complete external
placement discovery.

### D76-R8 — Source-owned meaning never moves

Giving, checkout, Issued Giving Addresses, auth, callbacks, APIs, protected
actions, provider returns and every other source-owned route retain their exact
owner/Site/purpose identity. D76 consumes only an owner's current direct,
unavailable, successor or block result. Same path/slug/content or AI similarity
MUST NOT infer equivalence. D10 reservations run before destination website
routing and can never become destination Giving meaning.

### D76-R9 — Immutable move-plan revision

Outside authority locks, Core MUST compile one immutable plan with exact host,
source/destination binding/role/public heads, source replacement, target role,
D6/D73 choices, owner digest, control posture, pinned provider topology,
production-faithful target closure and consequences. Preparation MUST copy no
Site data, reserve no additional hostname and create no public/provider effect.

### D76-R10 — Adverse-fenced two-commit cutover

One explicit human command MUST first reauthorize and CAS the exact plan/heads,
record durable operation/receipt/audit/outbox and install a monotonic Moving
barrier. After every required adverse cohort is acknowledged, a second short
transaction MUST append target generations, close source, advance the private
global current-host head and every required source/destination Domain/public
head atomically. Only then may the target generation be admitted/read back. No
network call occurs under lock.

### D76-R11 — Never mixed Sites; truthful neutral gap

Source remains authoritative before the barrier. Barrier/unknown/mismatched
generations MUST return a tiny platform-neutral no-brand `no-store` temporary-
unavailable response, with `Retry-After` only when current evidence supports it.
Target becomes favorable only after exact authority/admission agreement. Core
MUST NOT promise literal zero downtime, serve both Sites, expose target early,
fallback, interstitial, or provider/platform branding.

### D76-R12 — Continuous occupancy and immutable history

D76 MUST NOT release/reacquire the global claim. One private current-host head
MUST advance from an immutable source Site claim/binding generation to a new
immutable target generation. Host identity, Tenant/environment, old Site scope,
history and public generations MUST NOT be updated, retargeted or deleted.

### D76-R13 — Provider-no-op launch

Launch MUST require the exact same pinned `apps/donor` Vercel project/team and
compatible association for both Sites. D76 MUST issue no provider move, alias,
project-domain add/remove, redirect, branch/custom-environment, TLS, DNS,
account-domain or registrar request. Any provider move/assignment/alias/
verification drift MUST block or fence and reconcile. Future cross-project
topology requires a separate accepted ADR and evidence gate.

### D76-R14 — Both-Site human authorization

Current `sites.manage_domains` on both exact Sites is required to view/prepare;
current `sites.activate_domains` on both is required to commit. D6/D73 and every
source-owner effect retain their existing protection. Actor/scope/capability
epochs derive from trusted context. D76 creates no move capability and grants
no authority to provider credentials, DNS access, support/operator status, AI,
UI visibility or prior permission.

### D76-R15 — Structural database invariants

Logical relations MUST enforce immutable hostname identity; one private current
head; immutable Site-scoped claim/binding generations; complete same-Tenant/
environment composite relationships; different Sites; one current occupancy/
binding; exactly one Primary per active nonretired public Site; finite compatible
roles; Moving incompatibility with favorable admission/D72–D76 writes; stronger
D9–D15 reservations; restrictive deletes; append-only plan/operation/receipt/
audit/outbox; and equality-leading current/move/owner/projection indexes.

### D76-R16 — Grants, RLS and privileged parity

Browser/Data API roles MUST have no direct authority mutation. Tenant-visible
projections use minimum grants, applicable enabled/FORCE RLS, operation-correct
`USING`/`WITH CHECK` and immutable scope. Global heads remain private. Views,
functions/RPCs, triggers, owners, `BYPASSRLS`, service/secret roles, workers,
Payload, support, imports, repairs and AI MUST repeat both-Site capability,
scope, expected-head, manifest, topology, reservation and attribution checks.
Security-definer functions use minimum execute, qualified objects and empty
`search_path`.

### D76-R17 — Deterministic concurrency and semantic idempotency

Commands MUST lock global host first, Sites in stable-ID order, then exact role/
public/owner heads. They MUST recheck D6–D8/D66/D72–D76, D9–D15, control/
topology and both capability epochs. Concurrent moves/role/locale/route/
retirement/disconnection/proof/provider/permission changes yield one winner or
stale review. Semantic identity includes every effect-bearing plan field. Exact
replay returns the original operation; changed meaning conflicts.

### D76-R18 — Failure, cancellation and forward recovery

Pre-barrier failure changes nothing. Before authority swap, an invalid plan MAY
end not-started and re-admit unchanged source only after source readback. Unknown
barrier projection remains adverse. Authority-swap response loss reconciles the
original operation. Target lag remains adverse. After authority swap, recovery
is forward-only; no automatic source restoration/Undo exists. D74/D75/another
D76 remain blocked until a proved terminal outcome.

### D76-R19 — Runtime, browser, money and cache isolation

Public context, favorable caches, cookies/tokens/sessions, signed context,
CORS/CSP/callback decisions, absolute URLs and owner projections MUST validate
exact Tenant/Site/binding/public generations. Root-scope reusable-host service
workers remain prohibited. Host-only/stale-while-revalidate caches and static
redirect/CMS/default fallback cannot bypass Domain/owner admission. Pre-admitted
forms/checkouts/gifts/recurrences/tasks remain bound to original durable purpose
or require explicit refresh; D76 creates no Stripe/ledger/payment effect.

### D76-R20 — UX, rollout, traceability and non-goals

Core MUST ship the exact full-page Base Maia experience and durable states below.
Readers/adverse barriers/constraints deploy before writers; legacy Payload/
slug/static redirects/host-only caches are removed; backfill fabricates no move.
Launch is cohort-gated on consolidated OpenSpec, D6–D15/D66/D72–D76, Phase 23
authority, both-Site RLS/capabilities, same-project topology, route protection,
cross-region probes, accessibility, migration and AC1–AC40. Kill switch blocks
new commands but preserves active barriers/history. Bulk, schedule, recurring,
drag/drop, cross-scope, provider-project, content-copy, route-transfer,
retirement, Giving rewrite and generic migration engine are out of scope.

## Acceptance criteria and proof matrix

### Scope, roles, proof and staff entry

- **AC1:** Same-Tenant/different-Site/current-production cases qualify; every
  cross-Tenant/environment/same-Site/wildcard/retired/contested/Disconnecting/
  ambiguous case receives its correct safe outcome.
- **AC2:** The hostname remains globally occupied by the same Tenant throughout;
  no D74 release or D75 acquisition occurs.
- **AC3:** Source and destination entry points resume one route/plan/operation;
  no duplicate workflow or provider state is created.
- **AC4:** Authorized viewers see exact same-Tenant source context; insufficient
  Site access hides source detail; cross-Tenant results are non-enumerating.
- **AC5:** Trustworthy current control proceeds without DNS work; age alone never
  prompts proof.
- **AC6:** Every listed adverse ownership/control condition pauses and issues one
  exact move-bound challenge without changing source public behavior.
- **AC7:** Primary/Redirect/Not-public destination role is initially unselected,
  eligibility-explained and never inferred.
- **AC8:** IDN/hostname/Tenant/environment/Site presentation remains exact,
  bidi-safe, untruncated and permission-safe.

### Two-Site consequences and source owners

- **AC9:** A source Primary cannot move while its active Site lacks a different
  qualified replacement; suspension is insufficient and D76 cannot retire it.
- **AC10:** A qualified replacement and complete source public closure advance
  with the move or nothing advances.
- **AC11:** Destination Primary on an existing public Site requires current D73
  disposition; private destination Primary requires D6 and names go-live.
- **AC12:** Redirect requires a qualified target Primary; Not public creates no
  destination favorable website behavior.
- **AC13:** Source moved hostname cannot remain a source Redirect or website
  origin; independent owner behavior remains owner-defined.
- **AC14:** D9–D15 Giving/address reservations precede target routing and never
  transfer, clear or gain destination purpose.
- **AC15:** Auth/callback/API/protected/provider/control owners return current
  dispositions and unknown/contradictory/block prevents commit.
- **AC16:** Content, Brand, Navigation, locale data, routes, permissions,
  analytics, DNS, registration, renewal, email, provider project, Stripe, money
  and unrelated domains are neither copied nor mutated.

### Plan, database, concurrency and distributed cutover

- **AC17:** Plan pins every R9 field and becomes stale on any effect-bearing
  change; unrelated UI/advisory refresh does not fabricate staleness.
- **AC18:** Begin transaction is short, reauthorized, expected-head, all-or-none,
  records one durable identity and performs no network work.
- **AC19:** Moving barrier is monotonic, blocks favorable D72–D76 operations and
  becomes public only after required adverse cohort readback.
- **AC20:** Finalize appends target/close-source and advances host/source/
  destination/public heads atomically in deterministic lock order.
- **AC21:** Old rows/scopes never update or delete; immutable history reconstructs
  the complete before/after operation.
- **AC22:** Two concurrent targets, duplicate tabs and D6–D8/D66/D72–D75 races
  yield one winner/original replay or visible stale review, never partial heads.
- **AC23:** Same semantic retry returns the operation/receipt; changed target/
  role/replacement/disposition/heads/manifest/proof/topology conflicts.
- **AC24:** Direct DML, RLS `USING`/`WITH CHECK`, grants, views/RPC/functions,
  owner/service/worker/Payload/support/import/repair/AI paths fail every cross-
  scope, stale, unreviewed and partial-poison case.

### Public, browser, provider and failure safety

- **AC25:** Before barrier, requests use complete source; barrier/unknown uses
  neutral unavailable; after admission, requests use complete target.
- **AC26:** No response or write combines Site/brand/locale/navigation/canonical/
  route/cache/security generations and no two Sites are favorable concurrently.
- **AC27:** Launch executes zero Vercel/DNS/TLS/registrar/alias/project mutations;
  any observed provider movement/verification drift fences or blocks.
- **AC28:** Site is never equated with Vercel Project; future topology mismatch is
  unavailable and cannot fall back to remove/add, alias or force.
- **AC29:** Old Site/binding cookies, sessions, signed context, local state and
  cache entries cannot authorize/render target meaning; valid Tenant scope is
  independently rechecked.
- **AC30:** Root service workers are absent; hostile stale worker/storage/cache
  browser corpus cannot override server authority or show wrong-Site content.
- **AC31:** Pre-admitted form/checkout/gift/recurrence operations preserve exact
  original source/purpose/idempotency or show refresh; none is reinterpreted.
- **AC32:** Lost begin/final response, unknown barrier, target lag, late events
  and pre/post-swap failures produce exact durable states without blind retry,
  auto-release, auto-rollback or false success.

### UX, accessibility, migration and traceability

- **AC33:** Full-page compact PageShell has exact hierarchy, one primary action,
  safe secondary action and no modal/Sheet/wizard/provider console/new visual
  system.
- **AC34:** Every blocker has one cause-owned next action; no unexplained disabled
  Move, raw provider error, hidden count, fake percentage or toast-only result.
- **AC35:** Missing/stale choices produce visible text errors, concise changes
  and deterministic focus; one polite status region announces only meaningful
  transitions.
- **AC36:** 320px, 400% zoom, keyboard, screen reader, visible focus, forced
  colors, 44px touch, reduced motion, RTL/IDN, long names, weak network,
  refresh/resume, session expiry and duplicate click tests pass.
- **AC37:** Migration infers no current Site binding/move from Payload/domain/
  slug/provider/DNS traffic; ambiguous legacy state is quarantined.
- **AC38:** Old-code/new-schema and new-code/old-schema drills, reader/barrier-
  first activation, writer kill switch, active-barrier continuation and forward
  recovery preserve invariants.
- **AC39:** Maximum evidence-qualified Sites/domains/locales/owners/heads meet
  bounded DB transaction, projection, public p99 and UI rendering budgets with
  no N+1/global/provider request path.
- **AC40:** D76 is not called shipped until glossary→ADR→PRD→consolidated
  OpenSpec→design→tickets→implementation→tests→release evidence trace exactly,
  all dependencies and twelve monitors pass, and representative ministry staff
  complete normal/stale/error/mobile journeys without support.

## Exact staff experience

### Entry and surface

Source **Site → Domains → Move to another Site** and an authorized destination
collision **Already connected to Field Stories → Move to this Site** lead to one
route-addressable full-page review. It uses the existing compact `PageShell`,
Base Maia/Base UI primitives, Zinc semantic tokens, Inter/Syne hierarchy and
Geist Mono only for technical host comparison. No alternate style or component
system is introduced.

Title and subtitle:

> **Move `stories.hoperelief.org`**  
> **Field Stories → Main Website**

The page contains:

1. **Current and destination** — exact Site roles and production context.
2. **Before this domain can move** — current control, destination critical
   public paths, locales/brand, owner dispositions, source replacement and
   same-project cutover evidence; each blocker has one owner action.
3. **Website after the move** — required Primary/Redirect/Not-public
   RadioGroup, initially unselected.
4. **Field Stories after the move** — replacement Primary when required, never
   hidden retirement/pause.
5. **Main Website's current primary** — D73 disposition when applicable.
6. **Other address uses** — complete permission-safe owner results and clearly
   incomplete advisory placements.
7. **What changes / What does not change** — concise business consequences.
8. **Preview** — production renderer on a private preview host, evidence only.

Normal same-project copy says:

> Visitors will continue using the same address. Core does not expect a DNS
> change or new verification. The move becomes public only after both Sites and
> the complete public cutover pass their checks.

If the source Primary lacks replacement:

> **Field Stories needs another eligible primary address before this domain can
> move.**  
> Prepare another domain

Final actions are **Keep on Field Stories** and **Move
`stories.hoperelief.org` to Main Website**. If a private destination is going
live, the final action is **Move domain and make Main Website public**. The page
is the confirmation; there is no second AlertDialog, typed domain, reason,
checkbox, second approver, schedule or support ticket.

### Durable states and copy

| State                       | Staff copy                                                                                                                                                                                                 | Public truth                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Needs preparation           | **3 items need attention before this domain can move.**                                                                                                                                                    | Source remains authoritative; cause-owned actions only.                      |
| Ready to move               | **Field Stories and Main Website are ready for the prepared cutover.**                                                                                                                                     | Final action available; nothing changed yet.                                 |
| Plan changed · Review again | **Some details changed since this review was prepared.**                                                                                                                                                   | Source remains authoritative; affected choices must be reviewed.             |
| Moving domain               | **Core is switching this address. Visitors may briefly see an unavailable page, but Core will not show the wrong Site. You can leave this page.**                                                          | Adverse barrier/target admission is in progress; no duplicate submission.    |
| Move not started            | **Nothing changed. `stories.hoperelief.org` is still connected to Field Stories.**                                                                                                                         | Pre-authority failure; source readback confirmed.                            |
| Move needs attention        | **Core is preventing this domain from serving the wrong Site while it confirms the cutover. Don't repeat the move or change DNS.**                                                                         | Exact adverse state and owner response appear; no false destination success. |
| Moved to Main Website       | **`stories.hoperelief.org` now serves Main Website. Field Stories now uses `fieldstories.hoperelief.org`. DNS, email, registration, provider project, Site content and gifts were not changed or copied.** | Exact target admitted and read back; durable receipt available.              |

The success surface provides **Open Main Website** and **View operation details**.
There is no Undo. A reversal is a newly reviewed current-state move.

## Required monitors

| Signal                                                 | Threshold                                                       | Owner                       | Required response                                                                                          |
| ------------------------------------------------------ | --------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `site_domain_move_cross_tenant_effect_total`           | Any                                                             | Security + Domain Platform  | P0; fence hostname, stop D76 writers, preserve evidence and investigate authorization path.                |
| `site_domain_dual_favorable_site_total`                | Any                                                             | Security + Public Runtime   | P0; adverse-fence host, disable writers, reconcile heads/projections.                                      |
| `site_domain_current_binding_overlap_total`            | Any                                                             | Domain Platform             | P0; stop authority writers and repair current head from immutable history.                                 |
| `site_domain_move_primary_cardinality_violation_total` | Any                                                             | Domain Platform             | P0; stop role writers, keep affected Sites adverse and repair valid heads.                                 |
| `site_domain_move_reserved_address_reassignment_total` | Any                                                             | Giving + Security           | P0 money-integrity incident; block route/checkout cohort and preserve source evidence.                     |
| `site_domain_move_wrong_site_response_total`           | Any confirmed wrong-Site fingerprint                            | Security + Public Runtime   | P0; fence host/cohort, inspect public/binding/cache heads and assess disclosure.                           |
| `site_domain_move_wrong_binding_write_total`           | Any form/payment/protected write attributed to wrong generation | Security + owning domain    | P0; quarantine effect, stop affected action path and reconcile original purpose.                           |
| `site_domain_move_provider_mutation_total`             | Any at launch                                                   | Hosting Platform + Security | P0; stop adapter, reconcile exact Vercel association and audit credential path.                            |
| `site_domain_move_head_cohort_mismatch_total`          | Any after finalize transaction                                  | Domain + Web Studio         | Keep adverse; halt cohort and reconcile all pinned heads forward.                                          |
| `site_domain_move_projection_unknown_over_slo_total`   | First breach of the numeric launch-qualified projection SLO     | Public Runtime/SRE          | Keep barrier, halt new cohort, diagnose projection/readback; never allow mixed serving to reduce latency.  |
| `site_domain_move_neutral_gap_duration_seconds`        | Above the numeric launch-qualified p99 neutral-gap SLO          | Public Runtime/SRE          | Investigate admission path, preserve safety barrier and halt expansion until evidence passes.              |
| `site_domain_move_completion_rate`                     | Below 80% within 24 hours with at least 20 starts in 30 days    | Site Product/UX             | Review blocker/copy/session evidence and improve self-service; never weaken scope, owner or barrier rules. |

## Ruthless synthesis

### Must be resolved before recording

- Replace “instant/zero-downtime move” with prepared cutover plus truthful
  adverse gap.
- Make launch provider no-op on the one donor project.
- Remove routine DNS reproof; keep adverse evidence triggers.
- Require explicit destination role and source Primary replacement.
- Preserve continuous Tenant occupancy and immutable generations.
- Reuse D73's finite owner registry and consume ADR-0198/D77's deterministic
  ordinary-route authority digest.

These are resolved in ADR-0197, ADR-0198, D76-R1–R20, and D77-R1–R22.

### Must be captured in specification and design

1. Exact logical relations, heads, constraints, composite keys, grants, RLS and
   privileged poison cases.
2. Complete D6/D8–D15/D66/D72–D76 owner/role/lifecycle matrix.
   D77 adds the critical-owner/effective-route authority digest and durable
   source-only not-found effects. ADR-0199/D78 supplies the only accepted
   different-Page case: one exact directional, revision-bound General Page
   owner qualification with explicit human subject/purpose/task review.
3. Moving barrier cohort/acknowledgement contract and qualified numeric SLOs.
4. Public/browser/cache/session/form/checkout generation contract.
5. Exact Base Maia page, copy, errors, focus and durable operation states.
6. Migration, mixed-version, feature cohort, kill-switch and forward-recovery
   plan.

### Required implementation order

1. Land D72 immutable Domain/current-head authority, D9–D15 adverse routing and
   D6/D66 complete public-generation owners.
2. Replace Payload/slug/static redirect/host-only cache authority with
   generation-bearing adverse-first readers.
3. Register and prove both-Site `manage`/`activate` capabilities, DB constraints,
   RLS and privileged paths.
4. Implement immutable D76 plan/operation/receipt and stable-lock expected-head
   command.
5. Implement/read back the Moving barrier and target admission projection.
6. Build the one full-page Site workspace review and durable receipt.
7. Run the full authorization/concurrency/browser/route/accessibility/migration/
   cross-region matrix and launch provider-no-op cohorts.

### Monitor only

Only post-release operational/UX performance is monitored. Every monitor above
has a named signal, threshold, owner and response. Integrity/security signals
have zero tolerance. Numeric projection/gap SLOs must be measured and fixed
before launch; “fast” is not an acceptance criterion.

## Exact corrected decision

An authorized current human may prepare one exact, continuously connected
custom hostname cutover between two different Sites in the same trusted Tenant
and production environment. Current `sites.manage_domains` on both Sites is
required to prepare and current `sites.activate_domains` on both is required to
commit. The ordinary move revalidates current control but does not repeat DNS
proof unless present evidence is lost, conflicting or unknown.

The review requires an initially unselected destination website role, every
applicable D6/D73 consequence, a qualified source replacement Primary when the
source stays public, and the complete finite owner outcome basis. It copies no
content or settings and changes no Giving/auth route, DNS, registration, email,
provider project, Stripe or money truth.

One durable human command installs and reads back a monotonic adverse Moving
barrier, then atomically advances immutable source/destination Domain/public
heads and the private global current-host head to a new target binding
generation. The Tenant's occupancy is never released. Launch issues no Vercel
mutation because all Core Sites share the donor project. Source is favorable
before the barrier, unknown cohorts fail neutral during transition, and target
is favorable only after exact admission readback. Core promises no wrong-Site
or mixed-generation response—not mathematically absolute zero downtime.

The staff experience is one route-addressable, resumable full-page Base Maia
review with two discoverable entry points, concise cause-owned blockers,
explicit before/after consequences, a safe secondary action, one exact final
action, honest durable progress/outcome and complete mobile/accessibility proof.
Failure before authority swap changes nothing or restores only the already-
current source after readback; after authority swap recovery is forward-only and
moving back is a new reviewed successor.
