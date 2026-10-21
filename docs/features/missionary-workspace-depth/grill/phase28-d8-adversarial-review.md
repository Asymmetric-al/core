# D8 — invited coaching with a complete, bounded workspace

**Disposition: Accept with required amendments.** Allow outside coaches when the
organization permits it. Give them a first-class coaching experience using their
own identity and exact read-only access. Do not disguise them as staff or treat
an invitation, role label or dashboard filter as authorization.

Reviewed October 16, 2026 UTC against repository baseline
`9cada8f3d8ab59db391d3fd20df77fcadeb09813`. The founder selected Q8 A and requested
deep practice, dashboard, multiple-subject, UX and Supabase review. On October 16,
2026 UTC, the founder subsequently instructed: “Ratify this decision and amendment.”
The corrected D8 decision and its required amendments, including C01–C24 and
P01–P30 acceptance obligations, are explicitly ratified. Other decisions retain
their separately recorded statuses. This is research and decision work, not a
formal PRD, implementation, activated access or new dependency.

## Exact corrected decision to record

> **D8 — Organization-permitted, deliberately invited coaching.** A missionary
> who currently has authority to share the selected coaching information may
> invite an internal or outside coach when the organization permits it. The coach
> uses their own proved identity. Acceptance binds the intended person; access
> begins only when the owning commands establish current, exact tenant and
> coaching authorization. Pending, expired, forwarded or revoked invitations
> grant nothing.
>
> Treat Coach as a first-class tenant-scoped product role with a useful coaching
> home and detail view, implemented through the existing identity, membership,
> capability and projection owners. It is not a staff account, impersonation,
> global all-tenant role or unrestricted supporter viewer. Explicitly reconcile
> the current fixed-role contract and routing implementation before activation.
>
> A coach SHALL be able to work with multiple independently authorized missionary
> contexts and multiple canonical Ministry Projects. Show those contexts in a searchable, permission-filtered portfolio
> within one clearly identified organization. Opening one shows only its permitted
> coaching information. Multiple organizations use explicit organization switching;
> do not combine their protected data. A project, team or shared ministry requires
> its own canonical source scope and authorized sharing; one member cannot expose
> everyone else's information.
>
> Build the complete read-only coaching job: prepare for a conversation, understand
> deliberately shared goals and source-qualified progress, review voluntary
> check-ins and agreed next steps, understand freshness and access limits, and
> leave or end access safely. Provide a clear missionary preview of the coach's
> permitted view for the sharing under review, bounded also by the missionary
> previewer's own read authority. The recommended dashboard modules below are conditional
> on exact source authorization; eligibility alone selects no money, history,
> donor-detail or export entitlement.
>
> Read-only means no coach mutation of missionary, contact, financial, goal,
> check-in or task records. Accepting or declining invitations, leaving coaching
> and managing one's own preferences are separate self-service actions. A shared
> conversation editor, coach-authored notes, task assignment and broader
> collaboration need separate explicit product authority; “full featured” does
> not silently grant them.
>
> Organization controls set the permitted ceiling. The missionary deliberately
> shares within that ceiling; coaches cannot delegate access. Current restrictions
> and revocation take effect at the protected source boundary across reads,
> summaries, links and background effects. Re-enabling a tenant option or issuing
> a new invitation never restores old access or historical reach implicitly.
>
> Reuse Asym's existing surfaces, shared design system, Postgres source owners and
> communication spine. Do not create a parallel CRM, coaching SaaS, inbox, calendar,
> financial ledger or permission engine. Coaching remains voluntary; missing
> activity records are not evidence of inactivity or a reason for penalties.

**Selected facts:** external eligibility under tenant permission; missionary
invitation; own account; authorized read-only access; a thoughtful complete
coaching role/experience, including multiple missionaries/projects.
**Ratified design direction:** concrete dashboard, exact lifecycle and source-owned
implementation safeguards. **Still separate product choices:** which optional
information modules/history/duration to share, and whether future coaching
collaboration should include writing. The ratified review supplies a concrete read-only design without pretending
those additional rights were selected.

## Evidence, current behavior and intended path

| Evidence                                                         | Finding and limits                                                                                                                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Coaching practice](d8-evidence/coach-practice.md)               | Primary missionary-coaching providers and MPDX explain planning, preparation, encouragement, discussion and progress review. Vendor claims are not measured Core user research. |
| [Owner boundaries](d8-evidence/owner-boundaries.md)              | P4/P12 distinguish identity, tenant context, invitations, subject grants and coaching/project projections. Formal owner changes remain necessary.                               |
| [Current runtime](d8-evidence/current-runtime.md)                | No qualified coach role/journey was found in the inspected code. Fixed roles, profile-tenant resolution, route gates and broad staff grants make a staff workaround unsafe.     |
| [Dashboard truth](d8-evidence/dashboard-truth.md)                | Goals, commitment expectations, received support and Field Account facts have different owners and permissions. A “support percentage” cannot erase those differences.          |
| [UX journeys](d8-evidence/ux-journeys.md)                        | Proposed invitation, acceptance, portfolio/detail and ending-access experience using existing Core components and primary accessibility guidance; no user-test claim.           |
| [Database and lifecycle](d8-evidence/database-lifecycle.md)      | Current official PostgreSQL/Supabase evidence and scoped mechanics; synthetic results and limits are recorded in the [probe](d8-evidence/postgres-probe/README.md).             |
| [Original Q8 research](phase28-q8-coach-eligibility-research.md) | Preserves the eligibility question and its evidence limits. The old dashboard document remains historical context only.                                                         |

The existing identity OpenSpec names only donor, missionary, staff, admin and
super_admin. Current source also lacks the required coaching context. P12's later
intent allows exact bounded coaching without Support Assignment participation.
Resolve this deliberately through the owning contracts and the actual auth
implementation; neither adding a UI alias nor changing one enum establishes it.
Current broad staff access makes “temporarily make the coach staff” unacceptable.
Five assertions against the actual auth modules confirm missing coach routing,
broad staff powers and legacy profile-role fallback after inactive membership.
The helper can union supplied memberships, but current callers filter to one
profile tenant; this is not a demonstrated live cross-tenant exploit. The existing
missionary portal also returns donor/task details and caches under one static key.
It cannot be reused by merely hiding fields or changing the selected missionary.
The qualified coaching path must replace these assumptions at every reached seam.

Evidence classes: repository intent, inspected source, published external
practice, synthetic database proof, and product judgment are distinct. No live
Supabase project, real invitation, authenticated competitor account, coach
interview, accessibility session or production load test is represented as run.

**Executed verification:** the [actual-source auth probe](d8-evidence/auth-probe/README.md)
passed 5/5 assertions. The isolated PostgreSQL 17.11 probe produced **35/35 expected
outcomes**, including **seven observed two-session transaction-lock waits** and
two deliberately unsafe counterexamples. It proved that grouping before exact
scope filtering leaks another target's value, and that stale entitlement evidence
can disclose after revocation. The safe fixture denied those cases without raw
coach table grants. These are bounded mechanism checks, not 35 Core feature tests;
actual external identity, hosted RLS/API, browser cache, provider delivery and
production performance remain unqualified. Exact roles, SQL, results, hashes,
fixture corrections and verified container/volume cleanup are retained.

## What fundraising coaches actually need

Primary provider evidence supports a continuing relationship: understand the
missionary's circumstances and goals, develop a workable plan, prepare and
practice an ask, discuss meetings and obstacles, encourage follow-through,
review progress and adapt the plan. Initial fundraising and long-term support
maintenance differ; project fundraising adds another context. Frequency varies.
A compulsory weekly-reporting workflow is not a universal ministry fact.

[MPDX's coach instructions](https://help.mpdx.org/article/510-for-mpd-coaches)
document selecting among multiple people and a separate coaching view. This is a
useful interaction precedent, not proof that its amounts-plus-initials approach
protects donor identity. [Tailored's services](https://www.tailored.fund/services)
illustrate preparation and debrief, not merely numerical monitoring.

The [current ICF ethics code](https://coachingfederation.org/credentialing/coaching-ethics/icf-code-of-ethics/),
effective April 1, 2025, emphasizes clear agreements, confidentiality boundaries,
ending relationships and conflicts where a coach has multiple roles. Those are
useful design principles, not a requirement that Asym coaches hold credentials or
that Asym build a contracting system. The interface must explain who can see
shared material; do not promise “only between you and your coach” if another
independently authorized audience can read it.

The strongest alternative is a staff-only dashboard or occasional manual summary
outside Core. It reduces onboarding work but excludes the selected outside
coach and creates repeated disclosure/export work. Broad CRM access is easier
to wire but fails least privilege. The permanent path is a small coherent native
coaching surface over qualified sources, not an all-purpose coaching platform.

### Recommended information architecture

| Coach job                   | Useful information and UI                                                                                                                                  | Boundary                                                                                                                                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Find the right conversation | Coaching home: organization, permitted person/ministry label, shared focus, latest shared check-in, agreed next-action date when present, source freshness | Enumerate only authorized targets. No hidden totals, performance rankings, global staff directory or cross-tenant portfolio.                                   |
| Prepare                     | Subject overview: current shared goal and timeframe, stage/context supplied for coaching, latest qualitative update, agreed next steps                     | Do not infer staff performance, geography, family circumstances or private preparation. Empty is not zero.                                                     |
| Review financial progress   | Separately enabled owner-qualified received-support trend, commitment summary or appeal progress, each labeled with currency, period, basis and freshness  | These are recommended modules, not default rights from D8. No donor rows/initials, bank details, compensation, reserve, balances or statements by implication. |
| Review the approach         | Optional activity targets and aggregate source-qualified activity, voluntarily shared successes, obstacles and discussion focus                            | Not every interaction is logged; duplicates, backdated entries and different ministry stages matter. No quotas or effort score.                                |
| Follow the conversation     | Read agreed next steps and permitted check-ins, see dates/ownership, return easily to the same subject                                                     | Coach does not mark someone else's task complete or author shared notes under a read-only grant. No new chat or calendar dependency.                           |
| Understand and end access   | Visible sharing scope/history, invitation state, organization policy explanation, Leave coaching or Stop sharing                                           | Exact current actor authority; no view-as impersonation, delegation or permanent retained coach access.                                                        |

A full read-only workflow can support real coaching conversations through the
parties' existing meeting channels. It must not display fake Comment, Assign,
Message, Schedule or Export controls. If later product decisions authorize
native collaboration, define each writing purpose and owner expressly instead
of relabeling it “read-only.”

### Concrete UI direction

Use the existing Missionary Workspace surface with a capability-shaped
**Coaching** entry, shared `base-maia` components, Base UI primitives and Zinc
semantic tokens. This is a proposed placement; the existing shell must first
support the actual coach context instead of hardcoding “missionary.”

```text
Organization: Example Ministry                 Viewing as: Coach
Coaching
[Search people or ministries]  [Relevant source-backed filters]

Maya — Community Ministry
Focus: Building recurring support
Latest shared check-in: 12 Oct     Next agreed step: 19 Oct
[View coaching]
```

The example is illustrative, not a source record. A compact table can serve a
larger desktop portfolio; stacked rows serve a phone. Keep financial charts in
the detail view, not one heavy chart per person. A detail page opens with context,
shared focus, next steps and data freshness; optional authorized progress modules
follow. Use descriptive labels and text values alongside charts. Do not render
controls for unauthorized actions, while retaining a short explanatory access
state where its absence would confuse the user.

For Maya: **Coaching → Invite coach → recipient and exact sharing summary → Send
invitation.** Show the actual selected scope, including history, before the
consequential action. Suggested copy: “They can view the coaching information
shown here. They cannot edit your records.” A preview must be produced through
the same authorized projection for the sharing under review, bounded by Maya's
own read authority and excluding any coach rights obtained from other sources; merely hiding UI fields in Maya's broader page
is not a trustworthy preview. Avoid generic “Share account.”

For the coach: invitation → own sign-in/account recovery or registration →
confirm intended organization/context and scope → acceptance → authorized
coaching detail. Preserve the intended destination through authentication, with
an allowlisted continuation. An email link opened by a scanner must not accept
or grant access. Wrong-account recovery must not disclose protected identities.
Email and pre-authentication pages must use only approved minimum information.

Pending invitation is different from active access and from delivery failure.
Suggested truthful states: “Invitation sent; awaiting acceptance,” “Invitation
saved; delivery delayed,” “You accepted the invitation, but access is not
available,” and “Coaching access ended.” Actual wording must reflect source
outcomes. No spinner should imply access exists. Losing access while a page is
open removes protected content on revalidation without trapping keyboard focus.

Mobile, keyboard, screen-reader and 200%/400% zoom journeys must include
invitation review, context switching, chart alternatives, recovery and ending
access. Localized dates include the relevant time zone for appointments/deadlines;
store instants separately from date-only targets. Accept international names
without forced first/last segmentation. Do not cache protected portfolio data
persistently on shared devices or imply offline changes have reached the server.

## Concern register

Likelihood is a qualitative engineering judgment conditional on a naive
implementation, not an observed incident rate. Severity reflects plausible
impact. Every concern states consequence, evidence, effect on the answer,
permanent prevention and the exact required amendment/proof below.

### R01 — A coach label could become a staff or global access shortcut

- **What/why:** broad staff privileges expose CRM and gifts; a global profile role also confuses a person who coaches in one tenant and is staff in another.
- **Severity / likelihood:** Critical / High if existing role gates are reused unchanged.
- **Evidence:** current-runtime audit; fixed-role OpenSpec; P12 exact tenant/active-hat rules.
- **Effect:** changes implementation and explicitly requires an owner amendment; does not reject external coaching.
- **Permanent fix:** tenant-scoped Coach capability preset and exact subject grants; independently qualify membership/context/routing without staff impersonation or role union.
- **Exact changes/proof:** C01–C03, C22; P01–P04, P28.

### R02 — Invitation possession could grant the wrong person access

- **What/why:** forwarded links, shared email, an already signed-in wrong account, stale acceptance or an inviting missionary who lost authority can disclose a restricted ministry.
- **Severity / likelihood:** Critical / Medium; ordinary invitation edge cases are common, harmful exploitation is unmeasured.
- **Evidence:** P4's explicit authority-free, expiring invitation contract; current callback continuation gap.
- **Effect:** narrows acceptance semantics, preserves a simple user journey.
- **Permanent fix:** exact intended-principal binding and fresh owner authorization; expiring single-use/revocable proof; safe account switching and replay handling.
- **Exact changes/proof:** C05–C07, C16–C17; P05–P10.

### R03 — Multiple people/projects could silently widen scope

- **What/why:** one grant could expose all projects, a spouse's information, a team roster or newly added members; overlapping cards could count the same support twice.
- **Severity / likelihood:** Critical / Medium–High if “project” is an unconstrained string or user ID shortcut.
- **Evidence:** P9/P21/P22 separate ministry/support identities; P12 separate coach/project/roster capabilities; dashboard-truth audit.
- **Effect:** narrows resource meaning and portfolio aggregation.
- **Permanent fix:** use canonical subject identities and explicit grants; one member cannot authorize another's source facts; show separate views without automatic rollups.
- **Exact changes/proof:** C03, C10, C20; P03–P04, P14, P23.

### R04 — “Full featured” could contradict read-only and voluntary coaching

- **What/why:** comments, task edits, goals, reminders or “missed reporting” flags add unselected writes and pressure to log private activity.
- **Severity / likelihood:** High / High under generic CRM/coaching templates.
- **Evidence:** founder chose read-only; P27 D26 and brief prohibit compulsory logging; provider practice varies by organization.
- **Effect:** narrows the broad rider; separate future writing decisions remain explicit.
- **Permanent fix:** complete read-only preparation/review journey, separately owned self-service actions, voluntary information and no surveillance scoring.
- **Exact changes/proof:** C09, C11, C19; P11–P12, P21.

### R05 — A helpful dashboard could report false financial truth

- **What/why:** commitments become received money, different currencies are summed, unknown becomes zero, historical goals shift, or a missing installment becomes donor delinquency.
- **Severity / likelihood:** High / High without explicit owner semantics.
- **Evidence:** P13/P16/P21/P27 distinctions and finance audit; current demo totals are not qualified coaching projections.
- **Effect:** changes module semantics, not coaching eligibility.
- **Permanent fix:** source-qualified values with basis, currency, effective period, goal version and coverage; separate permissions for each financial module.
- **Exact changes/proof:** C10–C12; P13–P16.

### R06 — Redaction and aggregate summaries could still identify supporters

- **What/why:** initials plus amount, one-person cohorts, date filters, comparisons and totals of hidden rows allow inference; shared narratives may reveal names or care details.
- **Severity / likelihood:** Critical / Medium, especially small ministries.
- **Evidence:** founder brief warning, MPDX documented initials/amounts, ADR-0209 subtract-only field policy; aggregation is not anonymization.
- **Effect:** narrows permitted projections; no default donor detail.
- **Permanent fix:** approved source summaries, pre-aggregation authorization and disclosure rules, bounded filters, explicit shared-content audience and field classification. No invented universal minimum cohort solves this.
- **Exact changes/proof:** C10–C12, C15, C18; P15–P18.

### R07 — Supabase row policies could preserve tenant ID but allow forbidden state changes

- **What/why:** callers mutate actor, owner, tenant, coach, target, history floor or grant status; permissive policies combine; SELECT access exposes raw financial fields.
- **Severity / likelihood:** Critical / High if raw generic CRUD is reused.
- **Evidence:** PostgreSQL grants/RLS semantics; current role-based policies; bounded database probe and audit.
- **Effect:** requires database/API safeguards, not another permission framework.
- **Permanent fix:** immutable trusted attribution/scope, tenant-aware relationships and constrained commands; explicit old/new state predicates plus grants; no coach write to source rows or permission-bearing columns.
- **Exact changes/proof:** C13–C16; P17–P20.

### R08 — Views, RPCs and privileged workers could bypass the intended projection

- **What/why:** an invoker view needs underlying grants, so developers grant raw reads; a definer or service-role query bypasses RLS and filters after data has escaped.
- **Severity / likelihood:** Critical / Medium–High.
- **Evidence:** current PostgreSQL/Supabase docs and database audit; a source-owned projection is not equivalent to a view name.
- **Effect:** changes reader implementation requirements.
- **Permanent fix:** exact authorized projection boundary, minimum execution privileges, fixed search path and schema-qualified references, audited worker admission; test each entry path and actual role.
- **Exact changes/proof:** C14–C15, C18; P17–P20, P24.

### R09 — Revocation could leave usable cached, exported or queued data

- **What/why:** stale JWT claims, cached membership, browser back, Realtime, signed URLs or a delayed notification keep exposing a ministry after access ends.
- **Severity / likelihood:** Critical / High unless revocation is designed end to end.
- **Evidence:** P12 current authority; Supabase token/storage semantics; multiple reached surfaces.
- **Effect:** strengthens lifecycle and truthful UX.
- **Permanent fix:** current authorization at every read/release, tenant/principal/hat/scope cache keys, adverse invalidation and source-controlled downloads; no export right from ordinary viewing. Previously delivered copies cannot be recalled.
- **Exact changes/proof:** C07–C08, C18–C19; P09–P10, P22–P25.

### R10 — Concurrent acceptance, policy changes and retries could resurrect access

- **What/why:** invite acceptance races revocation, duplicated requests create two relationships, or re-enabling policy silently reactivates ended grants.
- **Severity / likelihood:** Critical / Medium; retries and lost responses are routine.
- **Evidence:** independent valid mutations can jointly violate a grant invariant; P4/P12 require semantic idempotency and version guards.
- **Effect:** requires atomic owner transitions and explicit non-revival.
- **Permanent fix:** stable business-effect identity, unique active relationship, current revisions and ordered fences for acceptance/grant/end; durable outcomes and outbox intent in the appropriate local transaction.
- **Exact changes/proof:** C05–C08, C13, C16–C17; P07–P10, P19–P20.

### R11 — Identity and ministry lifecycle changes could transfer access improperly

- **What/why:** email change, Party merge/split, principal relink, missionary departure, project reorganization or coach replacement retargets grants and old history.
- **Severity / likelihood:** Critical / Medium.
- **Evidence:** P4 explicitly forbids identity/relationship change from unioning or transferring rights; D3 grants no continuity reader.
- **Effect:** narrows automatic migration and repair.
- **Permanent fix:** preserve historical actors; deny-first reconciliation of affected positive access; a new identity/resource/relationship needs current source authorization.
- **Exact changes/proof:** C03, C07–C08, C21–C22; P10, P26–P28.

### R12 — A polished interface could lie about who can see what

- **What/why:** wrong organization/hat, blank forbidden modules, disabled fake actions, an overbroad “preview,” or “private coaching” wording creates accidental disclosure and mistrust.
- **Severity / likelihood:** High / High given current shell assumptions.
- **Evidence:** runtime/UX audits; ICF confidentiality principles; current role-dependent routes.
- **Effect:** changes UI acceptance, not the selected authority.
- **Permanent fix:** explicit context, exact shared preview, truthful state-specific copy and capability-shaped actions; account/tenant recovery preserves authorized destination.
- **Exact changes/proof:** C02, C08–C09, C19; P02, P06, P21–P22, P29.

### R13 — Invitation and reminder delivery could disclose information or create duplicates

- **What/why:** email subject/body identifies a restricted ministry, preview bots activate access, retries send repeated invitations, or delivery failure is mistaken for failed local authorization.
- **Severity / likelihood:** High / Medium.
- **Evidence:** P4/P6/P17 ownership and provider failure semantics; delivery is separate from acceptance/access.
- **Effect:** requires a qualified notification purpose, not a new sender.
- **Permanent fix:** minimal approved payload, inert link reads, exact source outbox effects, current relevance checks and separate local/delivery status.
- **Exact changes/proof:** C05, C16–C17; P05, P07–P09, P24.

### R14 — A portfolio could become slow or leak through counts/search

- **What/why:** one query per missionary, one financial scan per card, unbounded lists, client-only filters or cross-tenant search become expensive and disclose inaccessible targets.
- **Severity / likelihood:** High / High as portfolio size grows; actual workload is unknown.
- **Evidence:** fanout/aggregation complexity and current source qualification gaps; no production-shaped budget measured.
- **Effect:** changes read/query requirements, not the right to coach several subjects.
- **Permanent fix:** authorized paginated queries, scope-first indexes and bounded summary reads; independently filtered counts/search; measure realistic largest-tenant and largest-coach workloads.
- **Exact changes/proof:** C15, C20, C24; P18, P23, P30.

### R15 — Weak history, retention or repair could force direct database intervention

- **What/why:** logs cannot explain a grant, an ended relationship destroys evidence, sensitive narratives persist forever, or administrators repair permissions with SQL.
- **Severity / likelihood:** High / Medium–High.
- **Evidence:** P3/P4/P12 and source custody requirements; current logger alone is not durable business history.
- **Effect:** adds source-owned evidence/recovery and limits content retention.
- **Permanent fix:** minimal durable actor/scope/version/state history, separately protected content custody, bounded source retention, owner commands for retry/end/correction and restore fencing.
- **Exact changes/proof:** C16, C21–C22; P20, P26–P28.

### R16 — Mixed-version rollout could fail open or misroute new coaches

- **What/why:** old clients parse unknown roles as staff/donor, new routes use old broad policies, old queues revive invites, or rollback drops evidence after access was granted.
- **Severity / likelihood:** Critical / Medium–High given fixed current roles.
- **Evidence:** runtime inventory and identity OpenSpec conflict; accepted planning does not implement membership resolution.
- **Effect:** requires coherent source amendment and expand-first rollout.
- **Permanent fix:** deny unknown contexts, deploy schema/authorization/readers before activation, no automatic staff conversion, fence legacy writers and prove safe roll-forward/recovery.
- **Exact changes/proof:** C01–C02, C22; P01, P27–P28.

### R17 — “Exceptional” and “full featured” could remain untestable claims

- **What/why:** a mock dashboard passes screenshots while wrong-account onboarding, multiple assignments, recovery, accessibility and actual coaching usefulness remain broken.
- **Severity / likelihood:** High / High without outcome acceptance.
- **Evidence:** no representative user study or full Core runtime proof; benchmarks describe jobs, not satisfaction or platform scale.
- **Effect:** changes completion criteria and evidence claims.
- **Permanent fix:** trace clauses to owner sources and tests; representative coach/missionary tasks, real RLS/API proof, accessibility and workload qualification; named signals for residual operational risks.
- **Exact changes/proof:** C19–C24; P01–P30.

## Individual category review

Each row explicitly answers whether a material concern exists. Referenced R
entries contain all eight requested dimensions; C clauses and P cases provide
exact changes and independent proof, avoiding contradictory repeated fixes.

| Category                                                      | Material concern?                                | Assessment                                                                                                                                                                                              |
| ------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Problem validity, necessity, and alternatives                 | Yes — R04/R17                                    | A real preparation/review job is supported by primary practice, but “full featured” needs concrete scope. Compare bounded native coaching with staff-only/manual summaries and reject broad CRM access. |
| Brittleness                                                   | Yes — R01/R03/R11/R16                            | Current role/tenant assumptions and user-as-ministry shortcuts break for external people, shared projects and lifecycle changes.                                                                        |
| Technical debt                                                | Yes — R01/R04/R08/R15                            | Parallel permissions, financial copies, another inbox and SQL repair would create lasting ownership debt.                                                                                               |
| Edge cases                                                    | Yes — R02/R03/R05/R11/R12                        | Wrong account, overlapping assignments, shared email, multiple currencies, unavailable sources, merges and departure require explicit behavior.                                                         |
| Footguns                                                      | Yes — R01/R02/R07/R12/R13                        | Staff-as-coach, generic Share account, broad raw updates and email-triggered acceptance make harmful actions easy.                                                                                      |
| Tenant safety                                                 | Yes — R01/R03/R08/R09/R14                        | Enforce exact organization/hat/subject before list, count, search, aggregation, cache and release; a switcher is not isolation.                                                                         |
| Database, RLS, and authorization safety                       | Yes — R07–R11                                    | Grants, old/new row checks, tenant-aware keys, definer/view ownership, mutation attribution and privileged paths all need qualification.                                                                |
| Overengineering                                               | Yes — R04/R15                                    | A new CRM, rules engine, coach marketplace, inbox, LMS or monitoring framework would exceed the selected job. Existing owners can support it.                                                           |
| UX/UI and user friction                                       | Yes — R02/R12/R17                                | Capability-shaped actions, truthful preview, own-account recovery, portfolio usability and mobile/accessibility are essential, currently unproved.                                                      |
| Source of truth, ownership, and domain invariants             | Yes — R03/R05/R07/R11                            | Identity, invitation, grant, coaching narrative, goals and financial facts remain separate authorities; projection cannot become a financial write source.                                              |
| Hidden coupling                                               | Yes — R01/R04/R08/R16                            | Profile roles, staff routes, source-owner gaps and implicit collaboration writes could couple coaching to unrelated apps or finance.                                                                    |
| Failure modes                                                 | Yes — R02/R09/R10/R13/R15                        | Lost responses, delivery delay, stale source, revocation and partial onboarding need durable truthful outcomes and recovery.                                                                            |
| Lifecycle, temporal correctness, concurrency, and idempotency | Yes — R02/R05/R09–R11                            | Acceptance/grant/end races, old history, period/goal versions and repeated delivery require exact source state and current checks.                                                                      |
| Data integrity risks                                          | Yes — R03/R05/R07/R10/R11                        | Duplicate active relationships, retargeted grants, inconsistent aggregates and identity merges can corrupt meaning or access.                                                                           |
| Security and privacy risks                                    | Yes — R02/R06–R09/R13/R15                        | External access, small-group inference, narratives, notification metadata, exports, caches and backup restore need minimization and exact authority.                                                    |
| Scalability and performance risks                             | Yes — R14/R17                                    | Portfolio fanout and aggregate scans need measured limits and bounded plans; no unverified “scalable” claim is accepted.                                                                                |
| Operational burden                                            | Yes — R10/R13/R15/R16                            | Staff workarounds, ambiguous invitations and direct database repair would create recurring intervention. Provide owner recovery paths.                                                                  |
| Observability and auditability gaps                           | Yes — R10/R13/R15/R17                            | Technical logs do not establish who granted which scope or whether a coach accepted, gained access, left or was revoked.                                                                                |
| Dependency and integration risks                              | Yes — R08/R13/R16                                | Auth and P6/P17 delivery are real dependencies; optional calendars, AI, SMS and external CRMs must not block native coaching.                                                                           |
| Migration, rollout, and upgrade risks                         | Yes — R01/R11/R16                                | Fixed role contracts and old clients require explicit compatibility and activation ordering; no conversion grants from historical labels.                                                               |
| Testability, traceability, and proof                          | Yes — R17                                        | Positive, negative, concurrency, migration, financial, accessibility and multi-subject outcomes are required; source inspection is not qualification.                                                   |
| Other development hazards                                     | No additional independent material concern found | Checked new money movement, public coaching directories, credential accreditation, billing, generative coaching and mandated training. None is required by D8; applicable overlaps are covered above.   |

## Exact requirements and acceptance amendments

These are explicitly ratified requirements for the developing D8 decision, not
already amended formal owner contracts. Reconcile them at the authorized
`/to-prd` transition.

**D8-C01 — Coach role and source authority.** Coach SHALL be a tenant-scoped
product role/preset of named capabilities and exact resource grants, not a global
staff alias. Reconcile the fixed-role identity spec, P4/P12 and every reached
routing/serialization boundary. Unknown roles/contexts SHALL deny, never fall
back to staff, donor or missionary privileges.

**D8-C02 — Own identity and active context.** Every request SHALL resolve the
validated principal, current tenant membership, active hat, capabilities and
applicable assurance server-side. Admit a human coach through the existing membership-backed Active
Tenant Assignment context; do not invent a fifth P12 context or use public,
service-identity or platform-operator authority as a shortcut. A coach can retain independent relationships
in several tenants; no request unions rights across tenants or hats. The current
single-profile tenant assumption SHALL be corrected through identity ownership,
not by moving a coach's profile between organizations or creating shared logins.
Use qualified existing P4 sign-in/recovery and applicable A10/G01 assurance gates;
external eligibility SHALL not create a new authentication provider or bypass.

**D8-C03 — Exact subject.** Every coaching grant SHALL name an existing canonical
owner subject and its exact tenant/resource scope. A person, Ministry Assignment,
Support Assignment, project/team, Page and participant roster SHALL NOT be
interchangeable. Project coaching SHALL use P9 Ministry Project identity where that is the
actual subject and its qualified typed coaching projection. Any P21 project/team
financial module requires independent admission; it is not a prerequisite for
nonfinancial P9 project coaching; grants SHALL NOT expand with team membership or project
children by implication. Only a currently authorized grantor can share it.

**D8-C04 — Organization permission.** Tenant settings SHALL use P12's existing
authority model to govern external-coach admission and the permitted ceiling.
Missionaries select eligible sharing within that ceiling. No second boolean
permission registry, arbitrary policy scripting or routine approval layer SHALL
be introduced. Actual projection-policy widening remains subject to ADR-0211;
ordinary invitations within approved policy do not acquire that extra ceremony.
A control labeled as disabling external coaching SHALL immediately fence affected
access and pending activation, without relying on eventual email/token refresh. Disabling SHALL fence the
exact affected current and pending sharing episodes/scopes, not merely hide a
control. Re-enabling permits fresh explicit source-authorized activation only;
it SHALL not clear old fences via an unchanged role, preset or grant.

**D8-C05 — Invitation.** An invitation SHALL identify its trusted source scope,
intended recipient, policy/scope version, validity and stable effect identity.
It SHALL be expiring, revocable and single-use for identity binding. Tokens SHALL
be protected, excluded from logs and inert on GET/HEAD/prefetch. Email possession
or delivery SHALL NOT establish identity or grant access. Reissue SHALL invalidate
the superseded proof; duplicate requests SHALL resolve the same intended effect.

**D8-C06 — Acceptance and activation.** Acceptance SHALL bind the intended proved
principal using P4. Exact membership/grant consequences SHALL run through their
owning commands with current P12 checks, including grantor authority, organization
policy, target and scope. Successful identity binding without eligible access
SHALL NOT be displayed as active coaching. Recovery SHALL require a current
qualified source command, not automatic elevation or raw database repair.

**D8-C07 — End access and non-revival.** The missionary with sharing authority,
an appropriately authorized tenant operator and the coach's self-leave action
SHALL have clear source-owned ending paths. Ending SHALL close the exact
coaching sharing episode/purpose and fence its dependent grants/effects, not
merely remove one capability preset. Canonical P9 relationship history and
independent valid grants remain intact. Revocation, expiration, current
policy restrictions and membership deactivation SHALL fence reads and unstarted
secondary effects. Re-enabling settings, new membership, reissue or recovery
SHALL NOT revive ended grants. Previously disclosed information cannot be erased
from human memory or recalled from delivered copies; UI SHALL not promise that.

**D8-C08 — Scope, history and temporal meaning.** An invitation/sharing review
SHALL show the exact eligible modules and historical range, including history
embedded in charts. Current access and retained historical evidence SHALL be
separate. New relationships SHALL receive no old history by implication. Access
validity/review rules SHALL be explicit source-owned policy before activation;
this decision does not invent a universal term length or retention period.

**D8-C09 — Read-only boundary.** Coaching SHALL NOT authorize changes to contacts,
financial records, missionary goals, check-ins, tasks, membership or another
coach's access. Invitations, self-leave and own preferences SHALL be separately
scoped actions. Coach-authored shared notes, comments, assignment and reminders
SHALL require a separate accepted source purpose and capability before any UI
promises them. Existing staff powers SHALL not leak through the coach hat.

**D8-C10 — Truthful dashboard.** The native portfolio SHALL list and open multiple permitted missionary contexts
and multiple canonical Ministry Projects. Its detail SHALL support preparation,
progress review, voluntary context and agreed next steps through
exact qualified modules. Goals, commitments, receipts, appeal attribution and
Field Account facts retain P28/P16/P13/P27/P21 ownership. Every financial measure
SHALL identify currency, basis, period, source coverage/freshness and applicable
goal version. No unauthorized money module, cross-currency sum, double-counted
portfolio total, hidden-data aggregate or balance/compensation access is implied.
Unresolved P13 E7 appeal-attribution or C-01 correction policy SHALL block only
the affected metric/action, not unrelated qualified coaching. No dashboard
formula SHALL invent a financial-owner ruling.

**D8-C11 — Voluntary coaching information.** Activity targets/check-ins SHALL be
separately deliberate and adaptable to ministry stage and capacity. A missing
log SHALL be “not recorded/shared,” not zero activity, failure, score or automatic
coaching enrollment. Shared narratives SHALL declare their audience and retain
source ownership; protected private CRM/member-care/history sources SHALL NOT be relabeled,
copied, quoted or summarized into coaching to bypass their audience restrictions,
whether manually or automatically. Newly authored sharing-eligible context
remains distinct from imported private history. Agreed next steps SHALL not duplicate task truth.

**D8-C12 — Minimum safe projection.** P3/P10/P12 SHALL govern static field policy,
current row/source rules and safety classification; unknown fields fail closed.
No raw donor identities, initials-plus-gift detail, private notes, care or precise
restricted locations SHALL follow from coaching. Aggregation, date filters,
comparisons and exports SHALL be qualified together against inference, not
called anonymous merely because names are absent. Limits may narrow a module
without substituting false zeros.

**D8-C13 — Database invariants.** Tenant-scoped relationship, invitation, grant
and projection references SHALL be non-null and tenant-consistent using keys and
constraints or the existing equivalent authoritative source boundary. Prevent
cross-tenant references and duplicate active coach/subject relationships; retain
separate historical episodes and per-module scopes. Actor, tenant, grantor,
approver, target and audit attribution SHALL derive from trusted context/source,
not generic input. Revoked/expired/ended records SHALL not become active through
raw update. Retention/deletion SHALL not cascade away required access history.
Money keeps its owning exact numeric representation/currency; no float copy.
Defaults SHALL grant no active access; null scope SHALL never mean all subjects.
Validate permitted state combinations, positive revisions, invitation expiry
later than issue time and end dates not earlier than start dates. Use timezone-aware
instants for events and source-defined date-only values for calendar targets.
Retained authorization transitions SHALL be append-only with attributed corrections
and governed retention; no editable audit author or cascading historical erasure.
Choose indexes for the actual tenant/principal/current-grant/subject lookup and
verify query plans under representative load rather than copying speculative DDL.

**D8-C14 — Grants and RLS.** RLS SHALL cover exposed scoped tables alongside
minimum schema/table/column/function grants. Coach readers SHALL receive no
base-table donor/finance SELECT or business UPDATE merely to support a dashboard.
Mutations SHALL validate both allowed old rows and resulting new state, including
immutable scope/actor fields and protected lifecycle transitions. Review combined
permissive/restrictive policies under actual roles. Missing `WITH CHECK` is not
always an absent check: PostgreSQL may inherit `USING`; prove the actual rule.

**D8-C15 — Views, functions and privileged paths.** Each view/RPC/service/worker
SHALL preserve the same exact source authorization before aggregation or release.
`security_invoker` is not a substitute for safe base grants; definer behavior
depends on actual owner/BYPASSRLS/ownership and FORCE RLS. Required privileged
readers SHALL have minimum privileges, constrained execution grants, fixed safe
search paths and no caller-controlled identity bypass. Pooled sessions SHALL
not retain prior tenant context. PostgREST hooks alone SHALL not be relied on for
Storage, Realtime or other transports.

**D8-C16 — Atomic effects and concurrency.** Owner commands SHALL version-guard
and serialize competing accept/grant/end/policy transitions on the exact source
scope. A repeated logical action SHALL not create a second active relationship
or independently resend an effect. The appropriate local state, durable audit
and required communication intent SHALL commit atomically; external delivery
remains asynchronous. Lost responses SHALL be recoverable by effect identity.
A final protected read/release SHALL obey the same revocation ordering.

**D8-C17 — Minimal communication.** P17/P6 SHALL qualify native invitation/access
notice purposes, sender identity, audience-safe text and stable delivery effects.
Before preparation or dispatch, each notice SHALL use its exact meaning-specific
P17 contract, producer occurrence/fence and admitted recipient-authority branch
in a proof-activated manifest generation. Absent, Reserved, unbound or incompatible
purposes SHALL reject, with no generic invitation-key, raw-email or existing
account-claim fallback. Do not invent a new donor Party merely to fit a queue.
Notifications SHALL carry only approved minimal context and links, no progress
report or sensitive narrative by default. Current authority/relevance SHALL be
checked before dispatch. Delivery, binding and active access SHALL have separate
states. Provider uncertainty SHALL use the existing recovery contract, not new
blind retries or an application-built email stack.

**D8-C18 — Every reached surface.** API, browser collection, GraphQL, search,
counts, previews, Realtime, jobs, storage, export/print and cache SHALL apply the
same current scope. Cache keys SHALL include the exact authorization context and
source/policy version; adverse changes SHALL invalidate or deny stale releases.
Do not persist protected coaching data for offline use by default. Export/print
is a separate source-authorized disclosure with applicable custody, not a free
consequence of screen access. Backups and restores SHALL reapply current fences.

**D8-C19 — Clear usable journey.** UI SHALL show the current organization and
coach context, the actual allowed action, exact sharing preview and truthful
pending/active/ended/unavailable states. Preview SHALL be limited to the sharing scope under review intersected
with the requester's own read authority; it SHALL not expose any independently
broader coach entitlement. It SHALL preserve safe invitation
continuation through login/recovery, handle wrong accounts without disclosure,
and explain policy restrictions where needed. Use shared Core components,
accessible names/focus/status messages, textual chart alternatives, mobile
layouts and localized dates/names. No disabled placeholder feature SHALL count
as a delivered coaching job.

**D8-C20 — Bounded portfolio.** Portfolio search/list/count/filter SHALL be
server-authorized before enumeration, paginated and indexed on the actual access
path. Avoid per-card raw financial fanout and all-record browser loading.
Performance qualification SHALL state largest supported tenant/coach scopes,
concurrency, page size, source volume, cache state, network profile, latency and
query/work budgets. No invented limit or cross-tenant summary is authorized.

**D8-C21 — History and correction.** Maintain protected durable records of the
actual actor, subject, purpose, scope/history version, state changes, cause and
stable effects; separate them from technical logs and content. Staff recovery
SHALL use the owning command with current authority. Narrative retention,
access-evidence retention, deletion/anonymization and backup handling SHALL use
applicable source policy with concrete periods before activation. An ended
coach's audit reference SHALL not preserve their reading access.

**D8-C22 — Safe rollout.** Reconcile owner contracts first, then expand schema
and capability readers, qualify all entry paths, migrate only proved associations
without new grants, fence incompatible writers, and enable a bounded cohort.
Unknown contexts fail closed throughout mixed versions. Provide a tenant/global
activation stop that denies new coaching access and effects while preserving
history and existing unrelated roles. Rollback SHALL not erase accepted effects,
restore broader grants or turn coaches into staff. Prefer a safe roll-forward
when new identities/history cannot be represented by old code.

**D8-C23 — Traceable proof.** D8 and each C/P identifier SHALL map to glossary,
source-owner amendments, formal OpenSpec/design/tasks and later authorized
issues, implementation tests and release evidence. Keep accepted intent,
implemented behavior, provider qualification and activation distinct. Real
API/Supabase role tests, concurrency, migrations, source financial correctness,
accessibility and representative coach/missionary journeys SHALL qualify release;
synthetic SQL alone SHALL not do so.

**D8-C24 — Operating thresholds.** Before activation, the owner SHALL publish
the actual supported workload and source freshness/delivery/recovery budgets.
Monitoring SHALL use the named signals, thresholds, owners and responses below.
Tenant/access leakage or unauthorized mutation is a release blocker, not a risk
to accept through monitoring. No blank or unmeasured service budget counts as
qualification.

## Lifecycle, schema and source synthesis

Keep three meanings separate: invitation delivery/acceptance, the coaching
relationship's evidence, and effective current authorization. The UI can show
one comprehensible status backed by those sources without duplicating state.

| Event                             | Required result                                                                                                                                                                         |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invite                            | Record exact eligible invitation intent; no coach access yet.                                                                                                                           |
| Email delayed/failed              | Preserve valid local invitation; show retryable delivery outcome, never fabricate acceptance.                                                                                           |
| Accept                            | Bind intended identity, then run independently authorized source consequences. Access may remain unavailable.                                                                           |
| Duplicate accept                  | Return the durable outcome; no duplicate grants, timeline events or invite email.                                                                                                       |
| Decline/cancel/expire             | Terminal invitation cannot activate; preserve minimal history.                                                                                                                          |
| Stop sharing/self-leave           | End the exact sharing episode/purpose and fence dependent grants/effects; other independent grants remain accurately explained, without accidentally cancelling unrelated staff access. |
| Tenant restriction/membership end | Deny affected coaching immediately through current authority. Explain the unavailable state safely.                                                                                     |
| Re-enable/reinvite                | New qualified action; no resurrection of ended grants or inherited historical range.                                                                                                    |
| Source unavailable/stale          | Show unknown/unavailable or clearly dated qualified data, according to owner rules; never substitute zero.                                                                              |
| Identity/target change            | Deny-first reconciliation for affected rights; preserve the historical actor and original scope.                                                                                        |

Core identity owns principal binding and tenant assignment; P12 owns effective
capabilities and exact grants; P9 owns canonical Party/coach relationship facts.
P28 owns the bounded source-authorized coaching participation/sharing purpose
and its qualified coaching-only material, not a copy of P9 relationships or
P9/P27 interaction history. Existing task,
goal, contribution, commitment, appeal and account owners remain authoritative.
A read model can cache qualified facts with source versions, but cannot change
them or outlive current authorization. No separate coach-person CRM store is
needed. Schema names and physical table count remain engineering choices.

### Invariants to make impossible to violate

1. One authenticated principal never obtains another's session or identity by invitation.
2. One tenant/hat's authority never widens another tenant/hat's result.
3. Each positive read has current exact subject, module, field and history authority.
4. Invitation acceptance does not itself manufacture that authority.
5. Read-only coaching cannot mutate authoritative missionary/financial records.
6. Revoked/expired/ended authority cannot revive through retry, restore or policy toggle.
7. No duplicate active logical coaching relationship for the same tenant, coach and target; historical episodes remain distinct.
8. Aggregation cannot incorporate unauthorized facts or create donor-identifying disclosure.
9. A derived figure does not become money truth; incompatible periods/currencies/bases are not summed.
10. Missing optional records do not become adverse performance facts.
11. Audit attribution and original scope survive identity corrections without transferring access.
12. A successful UI result corresponds to a durable source outcome, not an optimistic transport assumption.

## Falsifiable proof and acceptance scenarios

These are required outcomes, not a claim that Core tests have run. The separate
probe records only the synthetic mechanics it actually exercises.

| Proof                              | Required observable result                                                                                                                                                                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D8-P01 — role safety               | Coach can enter the qualified coaching surface; CRM, donor, finance and missionary write routes deny. Unknown legacy/new role values never fall back to staff.                                                                                                                                 |
| D8-P02 — multiple hats/tenants     | One person with independent staff/coach roles switches context safely; same URL/ID/cache key cannot union rights or leak the other organization's data.                                                                                                                                        |
| D8-P03 — many subjects             | One coach can list/open multiple explicitly granted missionary contexts and multiple canonical Ministry Projects; another coach's target and a newly added project/team member remain inaccessible.                                                                                            |
| D8-P04 — shared subject            | A spouse/team member cannot share another's facts without exact source authority; project, Ministry Assignment and Support Assignment are not aliased.                                                                                                                                         |
| D8-P05 — invitation privacy        | Unauthenticated/wrong-account/forwarded links expose no protected identity; GET/HEAD/prefetch accepts nothing; token is absent from logs.                                                                                                                                                      |
| D8-P06 — account continuation      | New/existing/recovered accounts reach the intended permitted scope without staff conversion; wrong-account switching is clear and safe.                                                                                                                                                        |
| D8-P07 — duplicate/lost response   | Repeating invite or accept after lost response returns the same effect without duplicate active relationships, audit transitions or delivery effects.                                                                                                                                          |
| D8-P08 — revoked authority race    | Concurrent acceptance versus grantor revocation, tenant disablement, invite expiry/reissue or target end has an ordered result; no stale activation succeeds.                                                                                                                                  |
| D8-P09 — ending access             | Missionary/operator end and coach self-leave remove affected current access, counts, search and pending notices; unrelated grants are preserved and explained correctly.                                                                                                                       |
| D8-P10 — no resurrection           | Reenable, old browser, old token, replay, merge, email change, restore and reinvite cannot revive ended grants or old history.                                                                                                                                                                 |
| D8-P11 — read-only                 | Forged POST/PATCH/RPC/collection calls cannot change contacts, goals, finances, tasks or shared notes; own permitted preferences remain usable.                                                                                                                                                |
| D8-P12 — voluntary data            | Absent optional activity/check-ins displays not recorded/shared; duplicate/backdated logs are handled by their source and do not become effort scores or rankings.                                                                                                                             |
| D8-P13 — correct finance           | Commitment expectation is distinguishable from received support; paused/missing/late states preserve owner meaning; refunds/corrections and goal-version changes are reflected honestly.                                                                                                       |
| D8-P14 — currencies/overlap        | Multiple currencies, overlapping shared assignments, appeals and zero/unset goals do not produce invalid percentages or duplicated totals.                                                                                                                                                     |
| D8-P15 — privacy inference         | Small groups, one donor, date filters and comparison differences cannot expose prohibited facts; initials and row counts are tested, not assumed safe.                                                                                                                                         |
| D8-P16 — source freshness          | Empty, unauthorized, stale, partial and unavailable financial data remain distinguishable without leaking forbidden existence; no missing value becomes zero.                                                                                                                                  |
| D8-P17 — grants/RLS                | Actual anon/authenticated/coach/staff/worker roles cannot directly read raw rows or move tenant, actor, target, owner, scope/history or lifecycle into forbidden states.                                                                                                                       |
| D8-P18 — aggregate/search boundary | Filter before authorized aggregation; invoker views cannot require unsafe raw grants; totals/search/pagination leak no inaccessible target or record.                                                                                                                                          |
| D8-P19 — concurrency               | Two accepts, two grants, acceptance/end and read/revoke interleavings preserve uniqueness and current authority under real transaction contention.                                                                                                                                             |
| D8-P20 — atomic rollback           | Inject failure after state write but before required audit/outbox commit: either complete local outcome or none; retries are safe and diagnosable.                                                                                                                                             |
| D8-P21 — truthful preview          | Preview equals the shared projection within the previewer's own read authority, with any omitted-from-preview scope explained safely; a coach with independently broader rights does not expose those rights to the previewer; any wider missionary/staff access cannot appear in the preview. |
| D8-P22 — stale browser             | Permission changes during detail, back navigation, second tab and context switch clear/fence stale protected views and preserve understandable focus/state.                                                                                                                                    |
| D8-P23 — portfolio scale           | Largest declared tenant/coach workload meets measured pagination/query/latency budgets without one raw-finance scan per card or all-record downloads.                                                                                                                                          |
| D8-P24 — secondary surfaces        | GraphQL, Realtime, provider notices, queued work, storage and downloads preserve exact current authority; provider delivery failure does not change grants.                                                                                                                                    |
| D8-P25 — export/custody            | Screen access alone permits no export/print; any separately allowed artifact has source scope, bounded custody and current retrieval checks.                                                                                                                                                   |
| D8-P26 — retention/recovery        | Source-authorized correction and lifecycle cleanup preserve required evidence without content over-retention; recovery never needs ad hoc SQL grants.                                                                                                                                          |
| D8-P27 — migration                 | Existing users/old code/new schema and new code/old schema fail safely; historical labels invite no one and confer no new access.                                                                                                                                                              |
| D8-P28 — rollout/rollback          | Activation stop and restore preserve current fences, unrelated roles and durable history; old queues cannot revive access.                                                                                                                                                                     |
| D8-P29 — accessible complete job   | Representative missionaries and coaches, including a multi-subject coach, complete invitation, acceptance, scope understanding, review and ending access on phone, keyboard and assistive technology.                                                                                          |
| D8-P30 — useful measurable result  | Coach can identify the correct subject, shared focus, meaning/freshness of progress and next step without confusing missing data with failure; measured workload and task budgets are recorded before release.                                                                                 |

## Adversarial check

### What could go wrong with this answer?

A new name on staff privileges could ship as “coaching,” or a pretty portfolio
could reveal donor details through aggregation. R01–R17 require exact source
boundaries and complete useful journeys rather than presentation-only isolation.

### What hidden assumptions are we making?

That the recommended read-only portfolio is useful across different ministries
is a product judgment supported by published practice, not measured user feedback.
Actual audience sizes, coaching frequency, optional financial scope, history and
service budgets are not established facts. Qualification must resolve them
without silently creating new access rights.

### How does this affect the whole product?

P4/P12 identity and tenant context, P3/P10 disclosure, P28 coaching source,
financial/task producer projections and P6/P17 invitation delivery must agree.
The fixed-role contract requires explicit reconciliation. Public pages, donors,
CRM, finance and private preparation retain their existing boundaries.

### How does this affect the end-user experience?

The missionary sees exactly what sharing means; the coach uses one own identity,
a clear organization context and a useful portfolio. Both can understand pending,
active and ended access without administrative handoffs for ordinary actions.
The product must prove these journeys with real users and accessibility checks.

### Does this follow modern best practices?

Primary support-raising providers support personalized planning, preparation,
progress discussion and continuing encouragement. MPDX supports deliberate
coaching access and a multi-person view. Current ICF guidance supports clear
confidentiality/role boundaries. PostgreSQL/Supabase guidance supports defense in
depth. None overrides Core or proves vendor workflows universally suitable.

### Does this fit Asym’s existing repo and product direction?

Yes with explicit identity/projection owner amendments. It follows native source
ownership, voluntary participation and the shared UI. Current role/routing and
membership gaps must be fixed; existing code is not accepted merely because it
exists. No new provider, app, workflow runtime or permission engine is justified.

### Should we adjust the recommendation?

Accept A with C01–C24 and P01–P30. Treat Coach as a real tenant-scoped product role
with bounded resource grants and a complete read-only experience. Do not silently
convert this into staff access, a surveillance dashboard or collaborative editing.

## Ordered synthesis and release discipline

**Resolve before recording this answer:** outside coaches are allowed only under
organization permission and deliberate missionary sharing; role label,
invitation, identity, grant and source projection are separate. “Full featured”
means a complete read-only job, not new writes. Multiple projects do not create
umbrella access. These resolutions are in the corrected decision; no extra
engineering questionnaire is required to make it coherent.

**Capture in the later formal specification/design, in this order:**

1. Reconcile P4/P12 and the fixed-role OpenSpec with an external principal's exact tenant membership/hat and Coach capability preset. Register the coaching projection and field policy through P3/P10 and any required ADR-0211 widening review.
2. Define canonical coaching subjects, invitation/acceptance, exact sharing scope/history and end-access commands. Preserve source-owned authority and distinguish selected eligibility from optional module choices.
3. Specify the concrete missionary/coach portfolio and detail journeys with the exact approved goal/progress/context modules. Use existing financial and task semantics; make unavailable data honest.
4. Specify constraints, privileges, source readers, concurrency, atomic evidence/outbox, cache/release fences and retention through the same owners.
5. Map C01–C24/P01–P30 to formal OpenSpec/design/tasks and, only at `/to-issues`, implementation tickets. Correct conflicting source clauses themselves; a pointer or banner is not reconciliation.

**Require in implementation before activation:** source identity/membership
support first; database/API boundaries next; invitation and projection services;
then the integrated UI and qualified delivery. Prove negative entry paths and
revocation before enabling real coaching. Qualify financial modules individually,
not by granting raw finance access. Migrate with no newly inferred access and
activate a bounded tenant cohort only after the complete journey passes.

**Monitor only residual operating risks after qualification:**

| Signal                                                                  | Threshold                                                                                | Accountable owner              | Response                                                                                                                                          |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized tenant/subject/field read or coaching write                | Any confirmed case; zero tolerated                                                       | Security and P12 owner         | Stop affected coaching access/effects, preserve evidence, contain/correct and requalify before resume. This is not an acceptable exposure budget. |
| Active access surviving an ended grant or identity fence                | Any confirmed occurrence                                                                 | Identity/P12 owner             | Deny affected scope immediately, invalidate reached surfaces, repair through source commands and add regression proof.                            |
| Invitation delivery unresolved                                          | Exceeds the activated P6 purpose's explicit retry/utility deadline                       | Communications owner           | Show truthful delay/failure, inspect durable effect, recover within provider contract; do not duplicate invite/grant.                             |
| Stale projection or failed source read                                  | Exceeds its activated source freshness budget, or any version mismatch                   | Owning projection/finance team | Mark stale/unavailable or deny according to source contract; refresh safely; never replace with zero.                                             |
| Portfolio query/latency/queue budget                                    | Exceeds declared p95/query/queue budget at the supported workload in the release profile | Workspace/API owner            | Inspect scoped plans and contention, reduce admitted load if needed, correct indexes/batching; retain authorization.                              |
| Wrong-organization or sharing-scope misunderstanding in task evaluation | Any critical misunderstanding; no release until corrected                                | Product/UX owner               | Correct language/context/preview and repeat the affected journey; collect task evidence without recording sensitive content.                      |
| Unexpected duplicate active relationship/effect                         | Any database or audit detection                                                          | P28 source owner               | Stop affected mutation path, reconcile exact source outcome, repair uniqueness/idempotency and requalify.                                         |

The named budget values must be measured and recorded before activation; leaving
them unset is a failed release gate, not a monitoring strategy. These are owner
responsibilities, not a new monitoring service. The founder explicitly ratified the corrected decision and required amendments
on October 16, 2026 UTC; actual runtime and human usability evidence remain
honestly bounded.
