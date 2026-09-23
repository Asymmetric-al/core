# Phase 24 D38 — Explicit Tenant Capability Grant

**Decision date:** 2026-08-29  
**Founder direction:** Option 1 — explicit Tenant governance grant; zero holders
allowed.  
**Scope:** The grant, exercise, revocation, expiry, explanation, and UX of the
D37 Tenant-wide Website recovery current-work application capability.  
**Method:** `/grill-with-docs`, repository and governing-document audit,
current primary-source research, Core UI/accessibility review, and a ruthless
22-category adversarial pass.  
**Verification note:** Per founder direction, broad formatting, local-link,
skill-parity, strict OpenSpec, lint, typecheck, unit, build, and
`git diff --check` passes remain deferred until the end of the Grill session.
This decision was checked with focused repository searches and contract counts.

## Final disposition

**Accept with required amendments.**

Explicit assignment with a valid zero-holder state is the strongest permanent
default. It is least privilege, reversible, understandable, and compatible
with a small ministry that can safely rely on prospective policy plus the
Needs assignment lane until someone needs the exceptional Tenant-wide current-
work operation.

The founder phrase is not implementable safely by itself. In Core:

- zero must mean zero **effective current holders**, not zero direct rows;
- the authority to grant the capability must remain separate from possessing
  the capability, or zero holders becomes a bootstrap lockout;
- `permissions.manage_grants` and the grantor's live delegation ceiling—not
  `admin`, Owner, Web Studio, job title, route visibility, or the D38 capability
  itself—must authorize grants and revocations;
- the capability must be `explicit_only` in Phase 12's registry, absent from
  seeded groups and every friendly None/View/Manage/Admin rung;
- the current `/mc/admin/teams` surface is a seed-backed prototype, not the
  access-management authority or a UI contract to preserve;
- every grant binds an exact current Active Tenant Assignment in one Tenant;
- removing one grant path must not claim to remove effective access when
  another direct or group path survives; and
- ending one source must make only that source inert, while final post-change
  EffectiveAccess loss fences every later uncommitted D37 effect without
  rewriting committed source history.

These amendments narrow and complete Option 1; they do not replace it.

## Exact corrected decision

> Core registers **Apply Website recovery settings to current work** as one
> narrow, Tenant-scoped, `explicit_only` Phase 12 capability. It authorizes only
> D37 preparation, exact complete aggregate review, acceptance, safe operation
> status/result, and retry/reconciliation of one complete compatible Tenant
> current-work application. It grants no policy edit, source record, Site,
> return context, correction action, coordinator qualification, Tasks Hub
> administration, public Website, Giving, finance, export, or other authority.
>
> The capability has **no implicit or seeded holder**. Tenant Owner,
> administrator, staff role, Content/Web Studio group, policy editor, Site
> access, coordinator membership, source visibility, previous application
> authorship, and support/operator status do not imply it. New and existing
> Tenants start with zero effective holders, and migration or activation never
> infers a grant from existing roles, groups, tasks, settings, or history.
>
> Zero effective holders is a valid, quiet operating state. Prospective D35
> policy save, the source-owned Needs assignment lane, and ordinary authorized
> source assignment continue to work. Only the optional Tenant-wide adoption
> operation is unavailable. Core creates no fallback holder, minimum-holder
> guard, warning banner, Needs-attention item, email, reminder, recurring task,
> SLA, or escalation merely because the effective holder count is zero.
>
> Grant administration and capability exercise are separate. A current same-
> Tenant principal may grant or revoke only through Phase 12's
> `permissions.manage_grants` operation and only within the principal's live
> delegated scope and capability ceiling. The grantor does not need to possess
> the D38 capability. Role labels and `requireRole(["admin"])` are never
> sufficient. Phase 12's existing quorum-aware self-grant, separation-of-
> duties, delegation, and recovery rules apply; D38 creates no duplicate
> approver or break-glass system.
>
> D39 admits a governed group path. Attaching, renewing, or removing D38 on the
> group remains a `permissions.manage_grants` operation within a live
> assignable-capability ceiling. Adding, activating, or renewing a person is
> the separate scoped `permissions.manage_membership` operation, whose live
> protected-group administration ceiling must cover the complete current group
> bundle and bundle revision. The group is flat, manual, same-Tenant,
> assignment-bound, non-external, and non-dynamic. Ordinary Team ownership,
> stale membership authority, or same-Party self-add cannot become an indirect
> grant bypass.
>
> A grant may reach only a D39-approved typed direct assignment-capability
> relation or governed flat Access-group relation. Every human recipient and
> group membership resolves through
> one exact active same-Tenant staff Active Tenant Assignment, never bare
> profile, Party, email, job title, invitation, donor/missionary identity,
> external reviewer, support operator, service account, AI agent, API key, or
> cross-Tenant group. Assignment termination prevents the grant from attaching
> to a later or recreated assignment. Suspension/freeze resolves to zero while
> active; restoration behavior follows the same Phase 12 assignment identity
> and grant state rather than creating a new grant.
>
> Phase 12's code registry owns the capability definition. Its authorization
> tables and sole advisory-locked grant-state command own grants, revocations,
> expiry, delegation provenance, and governance epoch. `resolveProjection` owns
> current EffectiveAccess. The Website domain owns D35 policy and D37
> application truth. Access screens, caches, notifications, Tasks Hub, Payload,
> analytics, Realtime, workers, and Inngest are projections or executors and
> never become grant authority.
>
> The Phase 12 registry distinguishes bundled capabilities from
> `explicit_only` capabilities. Its coverage invariant becomes:
> `registry = bundled-map capabilities ∪ explicit-only catalog`. Every bundled
> capability remains covered by the reviewed module ladder; every explicit-
> only capability is deliberately assignable but excluded from the ladder and
> seeded bundles. D38 is explicit-only. Adding it to Owner, Content/Web Studio,
> Admin, or any default template is a build failure.
>
> The grant command derives Tenant, actual actor, acting principal, grantor
> Active Tenant Assignment, subject, capability, delegation, scope, and
> timestamps from trusted server context. It accepts only the intended subject,
> an explicit duration choice (`Until removed` or a future UTC expiry), one
> concise business reason, and an expected governance head. Caller-supplied
> actor, Tenant, role, effective-access result, grant source, audit attribution,
> or capability implication is ignored or rejected.
>
> A business reason is required, whitespace-normalized, Unicode-safe, bounded
> for storage and UI, and treated as authorization audit evidence—not source
> content, a routing instruction, a task comment, a recipient message, or
> Website context. It must never contain or solicit protected worker, member-
> care, donor, location, or correction detail. `Until removed` is permitted for
> a recurring operational responsibility; an explicit expiry is available for
> temporary coverage. D38 does not invent Website-local JIT, approval,
> recertification, or reminder machinery.
>
> Every grant and revoke uses semantic idempotency, expected-head/CAS
> protection, the advisory-locked Phase 12 mutation boundary, and one atomic
> governance-epoch advance. Exact replay returns the durable receipt. A changed
> subject, capability, duration, reason, grant source, or head conflicts or
> requires a fresh review; it never overwrites concurrent access state.
>
> Grant history is durable and attributable. The grant's Tenant, subject
> assignment, capability, source/provenance, reason, duration, grantor,
> delegation basis, created/revoked/expired instants, actual actor, acting
> actor, and resulting governance head are immutable or append-only. Ordinary
> Tenant-root governance grants survive the grantor's later departure while
> retaining attribution. A grant issued only under a bounded delegated ceiling
> becomes inert when that governing delegation ends, as required by Phase 12's
> live attenuation invariant.
>
> Effective holder count is derived from current EffectiveAccess, deduplicated
> by Active Tenant Assignment after active state, expiry, group/direct paths,
> delegation, floor, and governance epoch are evaluated. A direct grant row,
> group membership, visible badge, cached token, or historic audit event is not
> itself a holder. The authorized access UI shows every current path that
> contributes the capability and distinguishes direct, group-derived,
> eligible/inactive, expiring, expired, suspended, and revoked state.
>
> Removing one path recomputes the post-change EffectiveAccess before review
> and commit. If another path survives, the UI says, for example,
> **Direct permission removed. Jordan still has this permission through Website
> Operations.** It never says **Access removed**. Changing a group's capability
> or membership is reviewed as a group consequence affecting every current
> member; D38 provides no deceptive one-person “remove all paths” shortcut.
>
> Removing the final effective holder is permitted. The review explains that
> no one will be able to start a Tenant-wide current-work update until an
> authorized access manager grants the permission again, while new returned
> work and Needs assignment remain usable. It does not use destructive alarm
> styling, require a typed phrase, add a second approver, or block the action
> merely because the count becomes zero.
>
> Revocation, expiry, assignment end, freeze, or applicable delegation end
> makes the affected source path inert at the Phase 12 governance boundary.
> It fences all later uncommitted D37 members only when post-change
> EffectiveAccess no longer contains D38. A capability administrator receives the minimum
> non-enumerating consequence needed to revoke safely: whether this subject has
> an active current-work application and that remaining work will stop.
> Website item counts, Sites, titles, recipients, contexts, and results are not
> disclosed through permission management. Already committed D37 effects and
> audit history remain immutable; regrant never resumes the stopped
> application and requires a fresh D37 review/application.
>
> The durable UX belongs in Phase 12's intended Mission Control **People &
> access** product, not a Website-specific roster and not the current seeded
> **Teams & Users** demo. D38 appears as a plain-language explicit permission
> under **Additional permissions → Website operations**, with a neutral
> organization-wide scope explanation, exact non-effects, current provenance,
> duration, and audit history. It is not hidden behind the generic module
> ladder.
>
> The permission description is:
> **Review organization-wide impact and apply the saved Returned Website work
> setting to all compatible current work. This does not grant access to Website
> records, restricted Sites, or correction actions.**
>
> The grant review names the person or governed group, organization, permission,
> scope, duration, and reason; separates **Will be able to** from **Will not
> gain access to**; and offers **Cancel** then **Grant permission**. It is one
> focused review surface using Core Base Maia Card/Field/Alert/Button/Badge
> primitives. It is not a nested modal inside the current team Sheet, a wide
> permission matrix, a switch with immediate effect, an optimistic save, or a
> toast-only result.
>
> At zero holders, authorized access managers see:
> **No one currently has this permission. New returned work still follows the
> saved setting, and current work remains available in Needs assignment. Grant
> it only when someone needs to update current work across the organization.**
> Other staff receive no holder count or security roster.
>
> A holder can discover and exercise the operation without receiving policy-
> edit authority. Core exposes a focused read-only **Current-work update**
> destination under the Website operations/settings information architecture
> and from the holder's **My Access** explanation. It shows only D37's safe
> policy summary, action, progress, and result. Policy editors without the
> capability continue to see only D36's quiet successful prospective-save copy,
> with no disabled action, access request, holder roster, backlog oracle, or
> nag.
>
> Grant, revoke, conflict, expiry, and failure results are persistent,
> route-addressable, and programmatically announced; a toast is supplementary.
> Controls have meaningful names, at least 44-by-44 CSS-pixel touch targets,
> logical keyboard/focus order, focus restoration, error associations, no
> color-only state, 320-pixel and 400-percent reflow, forced-colors support,
> reduced motion, RTL/bidirectional isolation, localized dates/time zones,
> international names, and low-bandwidth recovery. No critical meaning depends
> on hover, animation, icon, color, truncation, or a transient notification.
>
> Browser roles have no authoritative grant writes. Grant tables use same-
> Tenant composite relationships, least privileges, `ENABLE` plus `FORCE RLS`,
> operation-correct `USING` and `WITH CHECK` policies, immutable scope and
> attribution, restricted delete behavior, and hardened functions with pinned
> `search_path`. Owner, service-role, `BYPASSRLS`, RPC, worker, support, repair,
> import, export, cache, Realtime, and AI paths preserve the same grant and
> disclosure boundary.
>
> Grant/revoke/expiry is synchronous product authority and does not depend on
> Inngest. Inngest may later execute an identifier-only, idempotent audit-alert,
> access-review, or reconciliation effect owned by Phase 12, but it never
> decides who is a holder, advances a grant because of a timer alone, becomes
> the revocation fence, or creates a Website-specific permission workflow.
>
> D38 creates no holder cap, required holder, Website-local role or grant table,
> automatic Owner/Admin/Web Studio grant, policy-editor implication, source
> visibility, task assignment, notification/unread, reminder, email, approval
> graph, JIT system, employee score, Site override, cross-source permission, or
> automatic Mobilize behavior. D39 permits both Phase 12 typed direct Active
> Tenant Assignment and protected flat Access-group sources through the same
> EffectiveAccess model.

## Evidence labels

- **Repository fact:** directly verified in current Core files.
- **Verified external fact:** directly supported by a current primary source.
- **Reasonable inference:** follows from verified contracts but needs
  implementation proof.
- **Product judgment:** the recommended tradeoff after comparison.
- **Assumption:** plausible but not yet validated with ministry users.
- **Unresolved unknown:** a later founder decision or implementation evidence.

## Current behavior, intended behavior, and permanent path

| Layer               | Current behavior                                                                                                                                     | Intended behavior                                                                                                     | Best permanent path                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Capability registry | `packages/auth/permissions.ts` exposes four broad Mission Control capabilities, and every staff subrole receives the same set. There is no D38 atom. | D37 requires a distinct Tenant-wide operation capability.                                                             | Register one Phase 12 `explicit_only` atom; no role-name compatibility fallback.                                     |
| Grant authority     | Current `hasRole("admin")` treats active staff and broad profile roles as admin.                                                                     | Only a current Phase 12 grant manager within live ceiling may grant.                                                  | `permissions.manage_grants` through the sole PDP and locked grant-state command.                                     |
| Access data         | `authz.memberships` is an MVP foundation with broad service-role access; Phase 12's full grant model is not implemented.                             | Same-Tenant, Active-Tenant-Assignment-bound grants, epochs, audit, and RLS.                                           | Implement Phase 12 before D38; no Website-local grant table.                                                         |
| Access UI           | `/mc/admin/teams` reads `TEAMS_SEED`/`TEAM_MEMBERS_SEED` and uses local default-value controls.                                                      | One central, explainable People & access product.                                                                     | Preserve Base Maia/component conventions, not seed data, generic ladder semantics, or undersized prototype controls. |
| Website UI          | No D35-D38 runtime exists.                                                                                                                           | Authorized holders can reach a focused current-work operation without policy edit; others see quiet prospective save. | Capability-aware read-only operation route plus D36/D37 action/result; no disabled-control clutter.                  |
| Holder default      | No D38 grant exists.                                                                                                                                 | Zero effective holders is valid.                                                                                      | Default deny and no inferred backfill; grant only by explicit governance action.                                     |
| Revocation          | No D38 behavior.                                                                                                                                     | Immediate effective-access loss and D37 member fence.                                                                 | Phase 12 epoch + D37 per-member reproof; immutable committed history.                                                |

## Problem validity, necessity, and strongest alternative

The real problem is not “who should be called a Website administrator.” It is
how a Tenant deliberately authorizes a rare, organization-wide operational
action without widening source visibility or making ordinary policy editing
dangerous.

The strongest alternative is automatic Tenant-Owner/Admin assignment. It
removes setup friction and ensures someone can act. It fails Core, however:
current admin checks collapse all staff, broad roles are migration inputs, and
automatic possession would make D37's separate capability nominal rather than
real. The source lane and prospective policy already provide a safe zero-holder
fallback, so continuity does not require implicit application authority.

The strongest no-build alternative is never offer current-work application:
save only prospectively and let authorized staff handle current work from
Needs assignment. That remains safe and fully usable, and should be the
Tenant's zero-holder posture. D38 is justified only for Tenants that want the
optional D37 consistency operation.

## Current modern-practice review

- Microsoft Entra models a role assignment as principal + role definition +
  scope, supports direct and governed group assignments, and denies when the
  requested action is not present. It also separates current assignment,
  expiry/JIT, provenance, and access review.
- Google Cloud states that most default allow policies are empty and supports
  limiting which roles a delegated administrator can grant or revoke. Its
  group guidance favors job-function access groups but warns that group
  administration and external members can create privilege paths.
- GitHub organization roles grant narrow organization actions to people or
  teams without full administration. Its recommendation to keep at least two
  organization owners protects existential organization control; it is not
  evidence for forcing holders of this optional operation.
- Salesforce recommends small, task-oriented permission sets and permission
  set groups, exposes “Access Granted By” provenance, supports no-expiry or
  expiring assignments, and recommends periodic access review.
- OWASP recommends least privilege, explicit deny by default, and authorization
  checks on every request.

**Product judgment:** explicit zero-by-default assignment is modern practice
when the capability is optional, narrow, recoverable through a separate access
administrator, and fully explainable. Importing enterprise PIM, mandatory
expiry, two-person approval, or a holder minimum into D38 would be
disproportionate and duplicate Phase 12.

## Core UX/UI fit audit

### What fits

- Mission Control already has an administrative access area.
- Core's shared component system supplies Base Maia Dialog, AlertDialog, Sheet,
  Card, Field, Select, Alert, Empty, Badge, Button, and status patterns.
- Phase 12 already specifies exact-ability explanation, My Access, named
  grants, groups, expiry, provenance, audit, and quorum-aware controls.
- D36/D37 already specify quiet prospective-save, one deliberate current-work
  review, persistent status, and non-enumerating presentation.

### What must not be copied from the current prototype

- `teamsCollection` and `teamMembersCollection` clone hard-coded seed arrays;
  they are not durable authorization state.
- generic None/View/Manage/Admin selects hide the exact D38 consequence and
  conflict with D37's no-implication requirement;
- local `defaultValue` and generic **Save Changes** can visually report a
  permission change without a server receipt;
- several `h-8`/`size-7` controls miss Core's 44-pixel touch guidance;
- hard-coded Zinc/blue/rose/emerald presentation and arbitrary sizes bypass the
  shared semantic-token contract;
- a second confirmation dialog opened from the existing management Sheet would
  create nested-overlay focus and mobile problems;
- the current screen has no effective-access provenance, expiry, expected-head
  conflict, before/after consequence, durable receipt, or “still granted
  through another path” state.

### Correct interaction architecture

1. **People & access → person/group → Additional permissions → Website
   operations** is the administrative home.
2. **My Access** explains possession, source(s), duration, and offers the safe
   operation destination; it never grants.
3. **Website → Returned work → Current-work update** is a focused read-only
   operation route for D38 holders, even when they cannot edit the policy.
4. The current team Sheet may later link to the dedicated permission detail,
   but it must not host a nested grant workflow.
5. On mobile, use one stacked route or full-height Sheet, never a horizontal
   permission matrix.

## Domain model, ownership, and invariants

### Canonical concepts

- **Capability definition:** code-owned `explicit_only` registry entry.
- **Grant subject:** a typed direct assignment-capability grant or a governed
  flat Access group; human authority and membership always resolve through an
  exact Active Tenant Assignment.
- **Grant source:** direct assignment or governed group path, never a UI role
  label.
- **Grant authority:** `permissions.manage_grants` plus live delegation scope
  and ceiling.
- **Effective holder:** one currently active Active Tenant Assignment whose
  current EffectiveAccess contains D38 after every input/floor/expiry check.
- **Grant receipt:** durable result of one semantic grant/revoke command.
- **Application authority:** the D38 capability; distinct from grant authority.

### Ownership map

| Fact                                                                   | Authority                                       | Derived consumers                             |
| ---------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------- |
| Capability identity, risk metadata, and `explicit_only` classification | Phase 12 code registry                          | DB seed, UI catalog, tests                    |
| Grant, revocation, expiry, delegation provenance, reason, audit        | Phase 12 authorization domain                   | People & access, My Access                    |
| Current EffectiveAccess and holder count                               | `resolveProjection` at current governance epoch | UI, D37 PEP, monitors                         |
| D35 policy and D37 application state                                   | Website source/product domain                   | Focused operation UI, safe revoke consequence |
| Staff identity and active Tenant hat                                   | Active Tenant Assignment                        | Grant eligibility and resolution              |
| UI labels and cached rosters                                           | Projection only                                 | Never a writer or permission input            |
| Tasks Hub/Inngest state                                                | Projection/execution only                       | Never a grant or holder fact                  |

### Permanent invariants

1. Zero or more D38 effective holders is valid; zero Phase 12
   `permissions.manage` holders is not.
2. Possessing D38 and administering D38 grants are independent facts.
3. No implicit role, seed, module rung, route, task, or policy edit grants D38.
4. A human D38 grant never exists outside one exact Tenant and Active Tenant
   Assignment.
5. Effective holder count is deduplicated from current EffectiveAccess, never
   counted from rows.
6. Every effective path is explainable; removing one path cannot hide another.
7. No grant path can exceed the grantor's current delegated ceiling.
8. Caller-controlled Tenant, actor, subject class, grant source, or attribution
   is never trusted.
9. Revocation/expiry/assignment end advances or invalidates the governing
   epoch before a later D37 commit.
10. Committed D37 source history is immutable; regrant never resumes stopped
    work.
11. Permission management reveals only grant/application consequence, never
    source member data.
12. The Website domain never owns a parallel role, roster, grant, expiry, or
    permission audit.

## Best user and Tenant journeys

### Access administrator grants

The administrator opens a person or governed group in **People & access**,
chooses **Additional permissions**, and finds:

> **Apply Website recovery settings to current work**  
> Organization-wide  
> Review organization-wide impact and apply the saved Returned Website work
> setting to all compatible current work. This does not grant access to Website
> records, restricted Sites, or correction actions.

The review surface shows:

> **Grant Website current-work permission?**  
> **To:** Jordan Lee  
> **Organization:** Hope Ministries  
> **Duration:** Until removed
>
> **Jordan will be able to**
>
> - review exact aggregate impact across compatible current work;
> - start and follow the organization-wide current-work update.
>
> **Jordan will not gain access to**
>
> - Website records or restricted Site details;
> - return/correction context or coordinator qualification;
> - policy editing, task administration, or correction actions.
>
> **Reason for access**  
> _Required. Do not include private ministry or person details._
>
> **Cancel** · **Grant permission**

On success the route retains a persistent receipt:

> **Permission granted**  
> Jordan can now review and apply Website recovery settings to current work.
> Granted by Ana Rivera · Until removed.

### Holder discovers and exercises

**My Access** says what the permission permits, its current source(s), duration,
and provides **Open current-work updates**. The focused operation page shows
D37's safe target policy summary and review action without exposing or enabling
policy editing. This prevents the “you have permission but no reachable UI”
failure and avoids broad Website Settings access.

### Policy editor without D38

After prospective save:

> **Setting saved for new returned work**  
> Existing work has not changed.

There is no disabled button, no holder count, no “ask an admin” dead end, no
backlog oracle, and no alert. Ordinary Needs assignment remains the visible
recovery path where the editor is independently authorized.

### Zero-holder state

Only an authorized access manager sees:

> **No one currently has this permission**  
> New returned work still follows the saved setting, and current work remains
> available in Needs assignment. Grant it only when someone needs to update
> current work across the organization.
>
> **Grant permission**

This is a neutral Empty/Card state, not a warning or setup blocker.

### Revoking one of several paths

The review names the exact path:

> **Remove Jordan's direct permission?**  
> Jordan will still have this permission through **Website Operations**.
>
> **Keep permission** · **Remove direct permission**

Success says **Direct permission removed. Jordan still has this permission
through Website Operations.**

### Revoking effective access

> **Remove Website current-work permission from Jordan?**  
> Jordan will no longer be able to start or view organization-wide current-work
> updates. If Jordan has an update in progress, its remaining items will stop.
> Completed changes and audit history remain.
>
> No one else currently has this permission.
>
> **Keep permission** · **Remove permission**

The zero-holder sentence appears only when current server proof says the
post-change effective count is zero.

### Conflict, expiry, and offboarding

- Concurrent change: **Access changed while you were reviewing it. Nothing was
  changed. Review the current access.**
- Assignment no longer active: **Jordan is no longer eligible for this
  permission. Nothing was granted.**
- Expired grant: it is shown in history, not counted as current access.
- Offboarding: the assignment end fences access; the grant never attaches to a
  new assignment.
- Lost response: reopening the durable route returns the receipt; staff never
  blind-submit.

## Conceptual persistence, RLS, and authorization

D38 should add no Website grant table. It consumes the Phase 12 capability,
grant, group, assignment, epoch, and audit records.

Required schema behavior:

- every grant/audit relation carries `tenant_id NOT NULL` and same-Tenant
  composite foreign keys;
- human direct grants reference the Active Tenant Assignment identifier, not
  bare profile, auth user, email, or Party;
- capability FK is `ON DELETE RESTRICT` and immutable;
- Tenant/subject/source/capability/grantor/delegation identity cannot be moved
  by update;
- `expires_at` is `timestamptz` nullable only when the user explicitly chose
  **Until removed**; display uses the viewer's locale/time zone while authority
  uses the UTC instant;
- required reason is bounded and stored as audit evidence, with no arbitrary
  protected JSON;
- one active semantic source path per Tenant/subject/capability/source identity;
- current effective access may have several paths but deduplicates the subject;
- revocation/expiry is append-only or an immutable terminal transition with
  append-only audit; no ordinary hard delete or cascade removes history;
- indexes support current resolution by Tenant/subject/capability, holder
  explanation by Tenant/capability, expiry sweep, delegation invalidation, and
  audit lookup without global scans;
- no client count, “is holder” Boolean, or cached projection is authoritative.

Authorization/RLS requirements:

- only `permissions.manage_grants` within current live scope/ceiling may invoke
  grant/revoke; D38 possession alone cannot;
- every command re-resolves the actual actor, acting actor, exact Active Tenant
  Assignment, Tenant, grant source, capability, delegation, and governance
  head;
- browser `INSERT`/`UPDATE`/`DELETE` are revoked;
- `ENABLE` and `FORCE ROW LEVEL SECURITY` apply to grant, membership,
  delegation, audit, receipt, and derived holder projections;
- `USING` protects existing rows and `WITH CHECK` protects inserted/resulting
  scope; scope-moving updates are structurally impossible;
- the sole advisory-locked grant-state function pins `search_path`, validates
  all inputs, increments the Tenant governance epoch atomically, and cannot be
  bypassed by another RPC;
- table owner, service role, `BYPASSRLS`, workers, support, import/repair, and
  AI paths repeat the same product authorization and audit boundary.

## Lifecycle, temporal correctness, concurrency, and idempotency

```text
registered explicit-only capability; zero holders
  |
  +-- authorized grant manager opens current projection
  |      stale/unauthorized/ineligible -> no review or write
  |
  +-- review subject + scope + duration + reason + consequences
  |
  +-- confirm under expected governance head
         changed -> nothing changed; fresh review
         valid   -> atomic grant + audit + epoch + receipt
                      |
                      +-- resolve current EffectiveAccess
                              |
                              +-- D37 use re-proves capability per member
                              |
                              +-- revoke/expire/end/suspend/delegation-end
                                      -> epoch/source reproof
                                      -> survivor: D37 continues
                                      -> final path lost: stop later uncommitted D37 effects
```

Concurrency rules:

- identical semantic grant/revoke replay returns one receipt;
- concurrent grants cannot create duplicate active source paths;
- grant vs revoke is ordered by expected governance head; neither silently
  overwrites the other;
- removing the final D38 holder is allowed, but removing the final
  `permissions.manage` holder is still rejected by Phase 12;
- a duration expiring exactly during D37 processing is inactive at the
  authoritative UTC instant and prevents the next commit;
- group and direct changes resolve from one epoch so a surviving path is
  recognized before copy claims total removal;
- restoring a suspended same assignment uses current unexpired grant state;
  creating a different assignment never resurrects it;
- grantor departure does not erase Tenant-root grant history; delegated grants
  obey the live delegation ceiling;
- regrant after revoke creates a new authorization generation and never resumes
  a stopped D37 application.

## Inngest boundary

Inngest is not needed for grant or revoke and should not sit in the critical
authorization path. The synchronous Phase 12 command owns the state and epoch.
An optional Phase 12 job may:

- reconcile projections from authoritative identifiers;
- emit a configured security alert;
- prepare a platform-wide access review; or
- sweep/report expired or orphaned delegated grants.

It cannot decide eligibility, add a holder, remove a holder, delay revocation,
own expiry, carry protected reason text in an event, or make access correct only
after a successful run.

## Normative requirements

1. **D38-R1 — Explicit-only atom.** Register one narrow D38 capability as
   `explicit_only` in Phase 12.
2. **D38-R2 — Zero-by-default.** Seed, migration, role, and policy state grant
   it to nobody.
3. **D38-R3 — Valid zero.** Zero effective holders remains safe and quiet.
4. **D38-R4 — Separate grant authority.** `permissions.manage_grants` plus a
   live assignable-capability ceiling—not D38 possession—owns capability-to-
   assignment/group grant/revoke. Group member add/activate/renew uses the
   separate scoped `permissions.manage_membership` path with a live protected-
   group ceiling covering the complete bundle and revision.
5. **D38-R5 — Active-assignment binding.** Human grants bind the exact same-
   Tenant staff Active Tenant Assignment.
6. **D38-R6 — No implication.** Owner/Admin/Web Studio/policy edit/Site/source/
   coordinator/task/support state never implies D38.
7. **D38-R7 — One PDP.** Current EffectiveAccess alone determines exercise and
   holder status.
8. **D38-R8 — Explain every path.** Direct/group/expiry/delegation provenance is
   visible to authorized access managers and the subject.
9. **D38-R9 — Deduplicate holders.** Count effective assignments, not grant
   rows.
10. **D38-R10 — Honest revocation.** Removing one path reports surviving
    effective access.
11. **D38-R11 — Last-holder removal allowed.** D38 has no minimum-holder guard.
12. **D38-R12 — Preserve Phase 12 continuity.** The last
    `permissions.manage` guard remains unchanged.
13. **D38-R13 — Deliberate grant.** Review subject, organization, scope,
    permission, non-effects, duration, and required concise reason.
14. **D38-R14 — Bounded duration choice.** Permit Until removed and optional
    future expiry; do not invent D38-local JIT.
15. **D38-R15 — Trusted attribution.** Derive Tenant, actor, grantor,
    capability, source, and time server-side.
16. **D38-R16 — One locked mutation.** Use Phase 12's expected-head,
    advisory-locked, semantic-idempotent grant command.
17. **D38-R17 — Durable history.** Grant/revoke/expiry/delegation lineage is
    immutable or append-only and auditable.
18. **D38-R18 — Immediate fence.** Revocation or equivalent loss advances the
    authorization epoch before any later D37 commit.
19. **D38-R19 — No resume.** Regrant requires a fresh D37 application.
20. **D38-R20 — Minimal revoke consequence.** Reveal active-application effect,
    never source members or counts.
21. **D38-R21 — Central UX.** Use intended People & access/My Access, not a
    Website roster or seeded Teams demo.
22. **D38-R22 — Reachable exercise.** A holder can reach a focused safe
    current-work route without policy-edit authority.
23. **D38-R23 — Quiet non-holder UX.** Policy editors see prospective-save
    truth, no disabled action or backlog/holder oracle.
24. **D38-R24 — Accessible review.** One non-nested, responsive, persistent,
    keyboard/screen-reader/touch-safe review and receipt.
25. **D38-R25 — No optimistic authority.** UI changes only after the durable
    server receipt.
26. **D38-R26 — Tenant/RLS structure.** Same-scope FKs, forced RLS, correct
    `USING`/`WITH CHECK`, least grants, no scope mutation.
27. **D38-R27 — Privileged parity.** Owner/service/RPC/worker/support/repair/
    import/export/AI paths enforce the same rule.
28. **D38-R28 — No Website permission engine.** Reuse Phase 12; D38 adds no
    local table, role, workflow, or access-review system.
29. **D38-R29 — No notification noise.** Zero/grant/revoke creates no D38-
    specific email, reminder, unread item, recurring task, or escalation.
30. **D38-R30 — Reserved until proof.** D38, D39, Phase 12/OpenSpec
    reconciliation, implementation, tests, and release evidence must agree
    before activation.

## Ruthless adversarial review by category

### 1. Problem validity, necessity, and alternatives

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                                      | Severity / likelihood                  | Evidence and effect on answer                                                                                                                                              | Permanent fix                                                                         | Exact language                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Core could build grant administration for an operation a Tenant does not need, adding setup and governance work. Automatic Admin assignment is simpler but broadens authority; no-build prospective-only recovery is safer. | High / Medium                          | D35-D37 already preserve prospective save and Needs assignment. Modern IAM is deny-by-default. This narrows Option 1 to an optional capability, not a required setup step. | Keep zero holders healthy and expose the grant only in central access administration. | “Prospective policy and source recovery are complete without a D38 holder; D38 is optional and zero creates no setup error.” |
| The choice could be made at the Website-role level instead of the authorization-domain level.                                                                                                                               | Critical / High if implemented locally | Phase 12 owns capabilities and grants; Website-local ownership creates dual IAM.                                                                                           | Register one Phase 12 atom; Website only consumes EffectiveAccess.                    | “The Website domain MUST NOT own a holder roster, grant table, role, or implication rule.”                                   |

### 2. Brittleness

**Material concern exists.**

| What could go wrong and why it matters                                                                                     | Severity / likelihood                 | Evidence and effect on answer                                                   | Permanent fix                                                                                      | Exact language                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Grants tied to email, profile, role text, or Party survive offboarding, cross Tenant hats, or attach to a rejoined person. | Critical / Medium                     | Phase 12's Active Tenant Assignment is the canonical membership-backed context. | Bind the exact active assignment and current governance epoch; never auto-revive a new assignment. | “Every human grant references one same-Tenant Active Tenant Assignment; a later assignment requires a new grant.” |
| A zero-holder state could be unrecoverable if only a D38 holder can grant D38.                                             | Critical / High under naive bootstrap | Grant authority and exercise authority are distinct in mature IAM and Phase 12. | Use `permissions.manage_grants` plus live ceiling; retain Phase 12 last-manager recovery.          | “D38 possession is neither necessary nor sufficient to administer D38 grants.”                                    |
| Group/direct/cached paths may change between preview and commit.                                                           | High / High enough to design          | EffectiveAccess is additive and epoch-bound.                                    | Recompute before review and under expected head at commit.                                         | “A grant/revoke review is advisory; confirmation re-proves every current access path and governance head.”        |

### 3. Technical debt

**Material concern exists.**

| What could go wrong and why it matters                                                                                                 | Severity / likelihood | Evidence and effect on answer                                                                            | Permanent fix                                                                  | Exact language                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| A `website_recovery_grants` table, coordinator reuse, JSON list, or copied permission predicate creates a second authorization system. | Critical / High       | Current repo already has broad MVP auth and domain-local patterns; Phase 12 is the ratified replacement. | Extend only Phase 12 registry/grants/PDP/audit.                                | “D38 adds no Website-local authorization state or predicate.”                                                           |
| Forcing D38 into the generic module ladder makes Web Studio Admin imply it; exempting it ad hoc breaks Phase 12 registry coverage.     | Critical / High       | Phase 12 currently states `registry ≡ union(map)` while also anticipating explicit grants.               | Add one general `explicit_only` registry class and adjust coverage invariants. | “Registry coverage is the disjoint union of reviewed bundled-map capabilities and reviewed explicit-only capabilities.” |
| D38-local expiry, approval, recertification, or alert engines duplicate Phase 12.                                                      | High / Medium         | Phase 12 already owns these governance mechanisms.                                                       | Consume them or defer; never fork.                                             | “D38 creates no local PIM, approval, review, notification, or recovery subsystem.”                                      |

### 4. Edge cases

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                                                                                                        | Severity / likelihood                    | Evidence and effect on answer                                | Permanent fix                                                                                      | Exact language                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last D38 holder removal, zero initial holders, self-grant, two grant sources, grantor departure, subject suspension, expiry at commit, assignment recreation, Party merge, capability retirement, and a running D37 application produce contradictory states. | Critical / High aggregate                | Every case is realistic in staff lifecycle and additive IAM. | Define each outcome through assignment identity, current epoch, provenance, and immutable history. | “Zero D38 holders is valid; assignment end/expiry/revoke/delegation end deny; a surviving path remains; regrant or new assignment never revives stopped work.” |
| A holder without policy-edit permission cannot find or reach D37; granting becomes useless.                                                                                                                                                                   | High / Medium                            | D37 intentionally separates edit and apply.                  | Provide a capability-scoped safe route and My Access deep link.                                    | “D38 includes only the safe operation destination and summary needed to exercise it, never policy edit.”                                                       |
| Removing a group capability as if it affects one person may silently affect many.                                                                                                                                                                             | Critical / Medium if groups are admitted | Modern group grants are additive and shared.                 | Preview every affected effective assignment; do not offer a false per-person group revoke.         | “Group changes state their complete authorized member consequence and retain group ownership.”                                                                 |

### 5. Footguns

**Material concern exists.**

| What could go wrong and why it matters                                                                                                      | Severity / likelihood  | Evidence and effect on answer                                               | Permanent fix                                                                      | Exact language                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| A toggle, checked-by-default box, generic Admin rung, bulk grant, or optimistic close can grant high-impact access accidentally or falsely. | Critical / Medium-high | Current prototype uses default-value selects and a generic close-only save. | One deliberate review, no default selection, durable receipt before UI success.    | “D38 grant/revoke is never an immediate toggle, client-only save, bulk role edit, or optimistic authority.”                 |
| “Revoke” may remove only one path while another remains.                                                                                    | High / Medium          | Phase 12 unions grants; Salesforce/Entra expose provenance for this reason. | Compute and present post-change EffectiveAccess.                                   | “Success names the removed path and truthfully states whether effective access remains.”                                    |
| A permission reason field may invite protected ministry details.                                                                            | High / Medium          | Audit reasons are durable and broadly visible to security administrators.   | Constrain helper text, length, purpose, retention, and protected-data prohibition. | “Reason records business need only and MUST NOT contain person, Site, correction, location, care, donor, or source detail.” |

### 6. Tenant safety

**Material concern exists.**

| What could go wrong and why it matters                                                                                           | Severity / likelihood                        | Evidence and effect on answer                                                                   | Permanent fix                                                                                    | Exact language                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| A target, group, grantor, cache key, receipt, or worker from another Tenant/environment could confer or exercise the capability. | Critical / Low with constraints; High impact | Core's current MVP auth has known cross-Tenant hazards; D37 can affect restricted current work. | Composite same-scope keys, one trusted Tenant context, poison tests, no clone/import carry-over. | “No D38 relationship, identity, projection, event, cache, or command may cross Tenant or environment.” |
| Global profile or `super_admin` status could bypass Tenant grant administration.                                                 | Critical / Medium under current patterns     | Current `hasRole` and RLS helpers contain broad compatibility behavior.                         | Tenant-scoped Phase 12 operator context and exact capability; no role escape.                    | “Platform support requires a separate audited Tenant operator grant and never implies D38.”            |

### 7. Database, RLS, and authorization safety

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                  | Severity / likelihood              | Evidence and effect on answer                                                                                  | Permanent fix                                                                                         | Exact language                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `USING` without correct `WITH CHECK`, mutable scope columns, owner bypass, broad service grants, or caller attribution can create/move a grant into a forbidden Tenant. | Critical / High if copied from MVP | PostgreSQL distinguishes existing-row eligibility from resulting-row checks; owners/BYPASSRLS bypass normally. | Forced RLS, composite FKs, immutable scope, least grants, hardened locked command, privileged parity. | “Grant/membership/delegation/receipt/audit tables ENABLE and FORCE RLS; every mutation has operation-correct USING and WITH CHECK; browser writes are revoked.” |
| A client-controlled actor, grantor, capability, source, or timestamp can forge history or privilege.                                                                    | Critical / Medium                  | Current application APIs commonly accept identifiers; D38 cannot trust them.                                   | Derive from verified EffectiveAccess and server registry/time.                                        | “The command accepts only target intent, duration, reason, and semantic command identity; all attribution and capability facts are server-derived.”             |
| An allowed update could transform a permitted grant into a cross-scope or different-capability grant.                                                                   | Critical / Medium                  | Mutable row designs allow state-moving updates.                                                                | Immutable identity columns and successor/revoke transitions.                                          | “Tenant, subject, capability, source, grantor/delegation basis, and created-at are immutable; widening requires a new reviewed grant.”                          |

### 8. Overengineering

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                                        | Severity / likelihood | Evidence and effect on answer                                                                   | Permanent fix                                                                                              | Exact language                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Mandatory two-person approval, JIT, fixed expiry, custom conditions, holder caps, access campaigns, or a Website permission builder burden small ministries without evidence. | High / Medium         | Entra offers such controls but they are platform governance products; Phase 12 is quorum-aware. | Reuse Phase 12 and require only explicit grant, reason, duration choice, audit, and revocation.            | “No D38-specific approval graph, JIT activation, ABAC expression, holder cap, calendar review, or reminder ships in v1.” |
| A new group solely for D38 could be noise for a one-person ministry.                                                                                                          | Medium / Medium       | Groups help at scale but direct assignment is clearer for one-off access.                       | D39 permits both sources but never auto-creates a Website group; direct is the contextual one-person path. | “D38 creates and seeds no group; Access groups are optional stable job-function sources.”                                |

### 9. UX/UI and user friction

**Material concern exists.**

| What could go wrong and why it matters                                                                                                         | Severity / likelihood                   | Evidence and effect on answer                                                                                                                      | Permanent fix                                                                                                  | Exact language                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Copying current Teams UI gives vague access levels, false saves, tiny controls, nested overlays, and no provenance.                            | Critical / High if called “existing UI” | The route reads seed collections and closes a Sheet without a durable permission mutation; repo rules require Base Maia/tokens/44px/accessibility. | Use product-backed People & access and focused explicit-permission detail.                                     | “The current Teams & Users implementation is prototype evidence, not a persistence, authorization, or component-layout contract.”           |
| Hiding the operation from a valid holder or showing disabled controls to a policy editor creates either unusable access or noisy dead ends.    | High / High                             | Edit/apply are intentionally separate.                                                                                                             | Capability-aware safe route for holders; quiet prospective copy for non-holders.                               | “A holder can navigate to the operation without policy edit; a non-holder receives no disabled action, roster, count, or request dead end.” |
| Mobile, screen-reader, low-bandwidth, locale, time-zone, long-name, RTL, or 400% zoom users may misread the subject/scope or lose the receipt. | High / Medium                           | Consequential grant/revoke must remain unambiguous across Core surfaces.                                                                           | Stacked semantic review, persistent result, logical focus, 44px targets, localized dates, no color-only state. | “Every grant/revoke journey meets Core accessibility and responsive contracts before activation.”                                           |

### 10. Source of truth, ownership, and domain invariants

**Material concern exists.**

| What could go wrong and why it matters                                                                                     | Severity / likelihood | Evidence and effect on answer                                                      | Permanent fix                                         | Exact language                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Capability registry, grant row, effective-access cache, Website action, UI badge, and task could all appear authoritative. | Critical / High       | Phase 12/D37 deliberately divide registry, EffectiveAccess, and application truth. | Publish the ownership map and prevent reverse writes. | “Phase 12 owns definition/grant/EffectiveAccess; Website owns policy/application; every other surface is derived.” |
| A stored “is holder” Boolean or grant-row count drifts from expiry/group/assignment truth.                                 | High / High           | EffectiveAccess is a current computation over additive paths and floor.            | Derive deduplicated holders under current epoch.      | “No persisted holder Boolean or raw row count authorizes, reports, or enforces D38.”                               |

### 11. Hidden coupling

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                      | Severity / likelihood | Evidence and effect on answer                                                                                                    | Permanent fix                                                                             | Exact language                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| D38 could depend on D35 coordinator roster, policy-editor membership, Tasks Hub roles, Mobilize groups, Payload collections, or the current tiles registry. | Critical / High       | Those domains have distinct purposes and lifecycles.                                                                             | Stable Phase 12 capability/assignment IDs; product-specific PEP only.                     | “No coordinator, task, CMS, Site, workflow, or visual-module identity is a grant input.”                  |
| Revocation could be used as a hidden per-application cancel mechanism.                                                                                      | High / Medium         | Revocation ends standing authority and all uncommitted applications by that authority; per-run stopping has different semantics. | Keep D38 revocation consequence truthful; decide any application-stop command separately. | “D38 revoke changes standing access only; it is not represented as Undo or an application-specific stop.” |

### 12. Failure modes

**Material concern exists.**

| What could go wrong and why it matters                                                         | Severity / likelihood                     | Evidence and effect on answer                                     | Permanent fix                                                                        | Exact language                                                                                                  |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| State commits but audit/epoch/receipt fails, or response is lost, leaving ambiguous authority. | Critical / Medium                         | Grant is a security business effect, not a best-effort UI update. | Atomic state+epoch+audit+receipt; semantic lookup before retry.                      | “No grant/revoke is effective unless its epoch and durable audit/receipt commit atomically.”                    |
| Projection/cache/notification failure could make the UI stale after correct authority changed. | High / Medium                             | Derived UI cannot be the safety fence.                            | Authoritative refetch, visible stale/error state, reconciler, no optimistic success. | “Projection failure never preserves authority; UI reports current receipt-backed state or a fail-closed error.” |
| Authorization store outage could fall back to current role checks.                             | Critical / Medium without explicit denial | Current broad role code is tempting compatibility logic.          | Fail closed; source recovery still works independently.                              | “Unknown grant or governance state denies D38 and never falls back to admin/staff/Owner.”                       |

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern exists.**

| What could go wrong and why it matters                                                              | Severity / likelihood            | Evidence and effect on answer                                   | Permanent fix                                                                    | Exact language                                                                                                                         |
| --------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Grant/revoke/expiry/suspension/offboarding/group change races with D37 acceptance or member commit. | Critical / High enough to design | D37 already requires per-member capability generation reproof.  | One monotonic governance epoch, expected heads, and atomic PEP checks.           | “The authoritative ordering decides whether each D37 effect committed before or after access ended; no ambiguous middle state exists.” |
| Duplicate submit creates duplicate grants or revoke-then-regrant resurrection.                      | Critical / Medium                | Network retry/lost response is normal.                          | Semantic idempotency bound to durable business meaning; successor generations.   | “Exact replay returns the receipt; changed meaning conflicts; terminal grant generations never reactivate.”                            |
| Expiry interpreted by local date/time can differ across staff.                                      | High / Medium                    | Salesforce and Entra explicitly model assignment duration/time. | Store UTC instant, display localized explicit date/time/zone, recheck at commit. | “Authority compares `timestamptz` UTC; UI names the effective local instant and time zone.”                                            |

### 14. Data integrity risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                       | Severity / likelihood | Evidence and effect on answer                                       | Permanent fix                                                                                      | Exact language                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Duplicate active paths, missing audit, dangling group/assignment links, hard-deleted history, or revived terminal rows corrupt holder truth. | Critical / Medium     | Additive IAM and staff lifecycle create many reconciliation edges.  | Same-scope FKs, unique active source path, terminal constraints, restrict deletes, reconciliation. | “Every current path has one valid source identity and receipt; terminal history is immutable and never cascade-deleted by ordinary lifecycle.” |
| Party merge or Tenant clone could union/copy grants unintentionally.                                                                         | Critical / Low-medium | Identity merge and environment copy are common operational tooling. | Explicit fail-closed reconciliation; no automatic transfer/copy.                                   | “Merge, split, clone, restore, import, and rejoin infer no D38 grant.”                                                                         |

### 15. Security and privacy risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                       | Severity / likelihood           | Evidence and effect on answer                                          | Permanent fix                                                                        | Exact language                                                                                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Holder rosters, grant reasons, active-application consequence, or provenance leak staff responsibilities or restricted work. | High / Medium                   | Access metadata is security-sensitive; D37 forbids source enumeration. | Separate own/access-admin/audit projections; minimize reason and revoke consequence. | “Only authorized access managers see holder rosters/history; permission management never exposes source member existence, count, identity, or result.” |
| Logs/events/exports/backups retain protected reason text or caller input.                                                    | High / Medium                   | Audit and observability have wider audiences and retention.            | Structured minimized audit, redact telemetry, governed export/retention.             | “Events carry identifiers/codes only; full reason remains in governed authorization audit and is excluded from ordinary logs.”                         |
| A service/AI account is granted human governance authority.                                                                  | Critical / Low with constraints | D37 is a deliberate human Tenant governance operation.                 | Human active-staff subjects only until a separately approved NHI contract.           | “Service principals, agents, integrations, support identities, and public users are ineligible D38 subjects.”                                          |

### 16. Scalability and performance risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                           | Severity / likelihood | Evidence and effect on answer                                                        | Permanent fix                                                                                                | Exact language                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Resolving audit history or all group members on every D37 member causes N+1 queries/lock storms; stale caches trade speed for unsafe revocation. | High / Medium         | D37 can have large cohorts and Phase 12 rejects per-principal transactional fan-out. | Indexed current heads, Tenant epoch, set-based provenance, cache inputs keyed by epoch, bounded holder page. | “Protected D37 PEP uses current indexed EffectiveAccess, never audit scans, remote IdP calls, or per-grant fan-out.”    |
| Capability-first holder lists may expose or time out for large Tenants.                                                                          | Medium / Medium       | Larger nonprofits may have many assignments/groups.                                  | Server pagination/search with exact safe total only for access managers; no client enumeration.              | “Holder search is Tenant-scoped, indexed, paginated, authorization-filtered, and stable under one governance snapshot.” |

### 17. Operational burden

**Material concern exists.**

| What could go wrong and why it matters                                                                     | Severity / likelihood | Evidence and effect on answer                                     | Permanent fix                                                                                           | Exact language                                                                                               |
| ---------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| A one-admin ministry may need platform support, SQL, or a second employee to bootstrap after zero holders. | High / Medium         | Phase 12 explicitly requires quorum-aware operation and recovery. | Separate grant authority with safe self-grant governed by Phase 12; no D38-holder bootstrap dependency. | “A valid Phase 12 grant manager can recover D38 from zero without direct database repair or possessing D38.” |
| Staff cannot tell why access remains after revoke and repeatedly contact support.                          | Medium / Medium       | Multiple additive paths are normal.                               | Provenance and post-change explanation.                                                                 | “Every holder detail and revoke receipt names all surviving effective sources.”                              |

### 18. Observability and auditability gaps

**Material concern exists.**

| What could go wrong and why it matters                                                                            | Severity / likelihood                               | Evidence and effect on answer                      | Permanent fix                                                                                                 | Exact language                                                                                                                                      |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technical logs cannot prove who granted what, under which authority, or whether a D37 commit followed revocation. | Critical / High absent design                       | Security/business history needs durable causality. | Immutable grant/revoke receipts, before/after effective result, governance heads, D37 linkage by identifiers. | “Audit records actual/acting actor, subject assignment, capability/source, reason, duration, delegation, before/after heads, outcome, and receipt.” |
| Monitors alert on raw zero holders and create noise.                                                              | Medium / High if generic IAM assumptions are reused | Zero is explicitly valid.                          | Monitor invariants and unsafe access, not healthy absence.                                                    | “No availability alert or SLO treats zero D38 holders as failure.”                                                                                  |

### 19. Dependency and integration risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                          | Severity / likelihood | Evidence and effect on answer                                                            | Permanent fix                                                                                     | Exact language                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Supabase service role, long-lived JWTs, Realtime, external IdP groups, Inngest, or current demo collections could delay/redefine authorization. | Critical / Medium     | Google documents external group propagation/divergence; PostgreSQL documents RLS bypass. | Core Postgres/PDP is authority; live epoch reproof; integrations identifier-only and fail closed. | “No provider, token claim, cache, event, or UI collection can create, retain, or revoke D38 independently of Phase 12.” |
| External CRM/CMS permission concepts could be imported despite conflicting Core ADRs.                                                           | High / Medium         | Comparable products inform UX, not repository authority.                                 | Adopt granular/provenance practices only through Phase 12.                                        | “External role/group patterns are evidence; Phase 12 remains the governing implementation boundary.”                    |

### 20. Migration, rollout, and upgrade risks

**Material concern exists.**

| What could go wrong and why it matters                                                                                                        | Severity / likelihood        | Evidence and effect on answer                                     | Permanent fix                                                                              | Exact language                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Backfilling Admin/Owner/Web Studio/policy editors creates unreviewed high-impact authority; writer-first versions may ignore `explicit_only`. | Critical / High without plan | Current broad roles and seed teams are not safe source data.      | Reader/registry/schema/denial guards first; zero-grant migration; explicit canary only.    | “No historic role, group, task, setting, coordinator, or operation author is inferred as a D38 grant.”  |
| Rollback after grants or D37 effects may delete history or restore role implication.                                                          | Critical / Medium            | Security state and source effects cannot be uncommitted globally. | Fence new writers, preserve grant heads/audit, roll forward; D37 committed results remain. | “Rollback never broadens, hard-deletes authority history, or rewrites committed D37 source effects.”    |
| Mixed versions may count grant rows rather than effective holders.                                                                            | High / Medium                | `explicit_only` and provenance are new central concepts.          | Compatibility readers and boot/build invariants before writers.                            | “Old code that cannot understand explicit-only/provenance fails closed and cannot serve or mutate D38.” |

### 21. Testability, traceability, and proof

**Material concern exists.**

| What could go wrong and why it matters                                                                                                                           | Severity / likelihood       | Evidence and effect on answer                                            | Permanent fix                                                                            | Exact language                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Tests may prove only a visible button or grant row, missing ordinary-staff over-authorization, cross-Tenant paths, caches, concurrent revoke, and accessibility. | Critical / High             | Current `hasRole("admin")` makes a positive UI test actively misleading. | Public-seam positive/negative/poison/concurrency/migration/a11y/production-shaped tests. | “Release evidence proves current EffectiveAccess and user-visible consequence across every PEP and privileged path, not implementation rows.” |
| Decision vocabulary can drift across Grill, glossary, ADR, Phase 12, OpenSpec, tickets, code, and release.                                                       | High / High without mapping | D37 depends on exact separation.                                         | Stable D38 IDs and terms; traceability matrix; contradiction gate.                       | “`explicit_only`, effective holder, grant authority, application authority, and zero-holder semantics use one definition everywhere.”         |

### 22. Other development hazards

**Material concern exists.**

| What could go wrong and why it matters                                                                                      | Severity / likelihood | Evidence and effect on answer                                                                            | Permanent fix                                             | Exact language                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Holder count becomes a staff status, readiness score, or performance metric; pressure produces pointless minimums and nags. | High / Medium         | The capability indicates a narrow operational permission, not organizational health.                     | Prohibit scoring/ranking and default notifications.       | “D38 holder presence/count is security administration data, never an employee, ministry-readiness, or compliance score.”      |
| “Explicit grant” becomes a generic cross-source super-permission.                                                           | Critical / Medium     | Mobilize/other domains may later need related bulk adoption but have different source/privacy contracts. | Source-specific capability decisions; no automatic reuse. | “D38 authorizes only Website recovery current-work application; later sources require their own evidence-backed atom and UX.” |

## Acceptance criteria

### Capability definition and zero-holder behavior

- **D38-AC001:** The code registry contains one stable D38 capability whose
  description matches the D37 operation and no broader action.
- **D38-AC002:** The registry marks D38 `explicit_only`.
- **D38-AC003:** No seeded group, Owner template, Web Studio template, role,
  staff subrole, or module ladder contains D38.
- **D38-AC004:** Registry coverage proves bundled-map capabilities plus the
  explicit-only catalog equals the full registry with no overlap ambiguity.
- **D38-AC005:** A newly created Tenant has zero D38 grant sources and zero
  effective holders.
- **D38-AC006:** An upgraded Tenant receives no inferred D38 grant.
- **D38-AC007:** Zero D38 holders does not block prospective D35 save.
- **D38-AC008:** Zero D38 holders does not hide or block the authorized Needs
  assignment lane or ordinary source assignment.
- **D38-AC009:** Zero D38 holders creates no warning, unread, email, reminder,
  task, SLA, escalation, or health failure.
- **D38-AC010:** Removing the last D38 effective holder succeeds when every
  other grant rule is satisfied.

### Grant authority and subject eligibility

- **D38-AC011:** A current same-Tenant `permissions.manage_grants` holder within
  ceiling may open a grant review.
- **D38-AC012:** D38 possession without `permissions.manage_grants` cannot open
  or invoke grant/revoke.
- **D38-AC013:** Current `admin`/`staff`/`super_admin` role labels alone cannot
  grant or revoke.
- **D38-AC014:** Policy edit, Web Studio Admin, coordinator membership, task
  administration, Site access, and source visibility cannot grant or revoke.
- **D38-AC015:** Delegated grant authority cannot grant D38 outside its live
  Tenant, subject scope, or capability ceiling.
- **D38-AC016:** Phase 12's current self-grant/quorum rule applies without a
  D38-specific bypass or hard-coded second person.
- **D38-AC017:** An active same-Tenant staff assignment is eligible for a typed
  direct grant or protected flat Access-group membership under D39.
- **D38-AC018:** Pending, invited, inactive, ended, wrong-Tenant, or nonstaff
  assignments are ineligible.
- **D38-AC019:** Donor, missionary, external reviewer, support, service, AI, API
  key, and public principals are ineligible grant subjects.
- **D38-AC020:** Candidate search returns only authorized eligible subjects and
  reveals no hidden cross-Tenant people.

### Trusted command, idempotency, and concurrency

- **D38-AC021:** The server derives Tenant, actual/acting actor, grantor
  assignment, capability, grant source, time, and delegation.
- **D38-AC022:** Caller-supplied Tenant, actor, role, effective state, source,
  timestamp, or audit attribution is rejected or ignored.
- **D38-AC023:** Grant confirmation re-proves grantor authority, subject
  eligibility, registry state, provenance, and expected governance head.
- **D38-AC024:** Revoke confirmation performs the same current reproof.
- **D38-AC025:** Exact semantic grant replay returns the original receipt.
- **D38-AC026:** Same request key with changed target, capability, source,
  duration, or reason conflicts.
- **D38-AC027:** Concurrent identical grants create at most one active semantic
  source path.
- **D38-AC028:** Concurrent grant and revoke have one expected-head winner and
  one complete audit history.
- **D38-AC029:** Subject deactivation racing grant has one fail-closed outcome;
  no effective grant attaches to an inactive assignment.
- **D38-AC030:** Grant/revoke state, governance epoch, audit, and receipt commit
  atomically or not at all.

### Effective access, provenance, and holder count

- **D38-AC031:** `resolveProjection` alone produces the current D38
  EffectiveAccess decision.
- **D38-AC032:** A direct row, group membership, UI badge, JWT claim, cache, or
  historic event cannot authorize by itself.
- **D38-AC033:** Holder count deduplicates one Active Tenant Assignment across
  multiple active grant paths.
- **D38-AC034:** Holder count excludes expired, revoked, suspended, ended,
  ineligible, out-of-ceiling, and wrong-epoch paths.
- **D38-AC035:** Authorized holder detail names every contributing direct/group
  source and its duration/state.
- **D38-AC036:** My Access shows only the current subject's safe effective
  provenance and duration.
- **D38-AC037:** Removing a direct path while a group path remains reports that
  effective access remains.
- **D38-AC038:** Removing a group membership while a direct path remains
  reports that effective access remains.
- **D38-AC039:** Capability-to-group mutation requires
  `permissions.manage_grants` within a live assignable-capability ceiling;
  membership add/activate/renew requires the separate scoped
  `permissions.manage_membership` path whose live protected-group ceiling
  covers the complete current bundle and revision. The review previews every
  authorized capability and D38 consequence, never one deceptive subject.
- **D38-AC040:** No unauthorized actor can enumerate holder identities, count,
  provenance, reason, or history.

### Grant/revoke UX and copy

- **D38-AC041:** The administrative label is **Apply Website recovery settings
  to current work**.
- **D38-AC042:** The description states organization-wide compatible current
  work and the exact non-effects.
- **D38-AC043:** Grant review names subject, organization, permission, scope,
  duration, reason, abilities, and non-effects.
- **D38-AC044:** The primary grant control is not preselected or an immediate
  toggle.
- **D38-AC045:** Cancel precedes Grant permission in visual and logical order
  unless locale direction correctly reverses presentation without changing
  semantic order.
- **D38-AC046:** Success is persistent and receipt-backed; a toast alone cannot
  report success.
- **D38-AC047:** Revocation review names the exact path or effective-access
  consequence.
- **D38-AC048:** Final-effective-access removal explains D37 remaining-work stop
  and immutable completed changes.
- **D38-AC049:** A post-change zero-holder statement appears only when the
  current server result proves zero.
- **D38-AC050:** No typed phrase, countdown, nested modal, horizontal matrix,
  destructive alarm styling, or misleading Undo is required.

### Duration, reason, audit, and lifecycle

- **D38-AC051:** The grant flow visibly supports **Until removed**.
- **D38-AC052:** An optional future expiry is represented as one UTC instant
  and displayed with local date, time, and zone.
- **D38-AC053:** An expired grant is ineffective at and after its authoritative
  instant without depending on a timer job.
- **D38-AC054:** The reason is required, normalized, bounded, Unicode-safe, and
  stored only in governed audit state.
- **D38-AC055:** Helper and validation copy prohibit protected person, Site,
  care, donor, location, return, or correction details.
- **D38-AC056:** Grant audit retains actual/acting actor, grantor, subject
  assignment, capability/source, duration, reason, delegation, head, outcome,
  and receipt.
- **D38-AC057:** Revoke/expiry/delegation-end audit retains the corresponding
  terminal cause and before/after result.
- **D38-AC058:** Tenant-root grant history survives the grantor's ordinary
  departure with attribution intact.
- **D38-AC059:** A grant issued only through bounded delegated authority becomes
  ineffective when its governing ceiling ends.
- **D38-AC060:** No ordinary hard delete or cascade erases grant/revoke history.

### Assignment, identity, and temporal edges

- **D38-AC061:** Every human grant FK references the exact Active Tenant
  Assignment and same Tenant.
- **D38-AC062:** Profile ID, email, display name, job title, role label, or
  Party alone cannot be the grant subject.
- **D38-AC063:** Assignment termination denies D38 immediately.
- **D38-AC064:** A later or recreated assignment does not inherit a prior
  grant.
- **D38-AC065:** Suspension/freeze resolves D38 to zero while active.
- **D38-AC066:** Restoring the same assignment observes only its still-current,
  unexpired, non-revoked grant sources under Phase 12.
- **D38-AC067:** Party merge does not automatically union or silently discard
  grants.
- **D38-AC068:** Tenant clone, restore, import, staging copy, or environment
  promotion copies no D38 grant.
- **D38-AC069:** Capability retirement denies new exercise while retaining
  historical audit readability.
- **D38-AC070:** Grantor departure never transfers grant-management authority
  or audit attribution to another person.

### D37 interaction and privacy boundary

- **D38-AC071:** A current holder can access D37 offer, preview, accept,
  status/result, and safe retry only through current EffectiveAccess.
- **D38-AC072:** A non-holder cannot invoke any D37 action by URL, API, stale
  page, task, or cached token.
- **D38-AC073:** Final post-change EffectiveAccess loss from revoke/expiry/
  assignment/delegation end prevents new D37 acceptance immediately; ending
  one source while another survives does not.
- **D38-AC074:** Final post-change EffectiveAccess loss stops every later
  uncommitted D37 member; a surviving source preserves current authority.
- **D38-AC075:** A D37 member committed before the authoritative revoke ordering
  remains immutable and auditable.
- **D38-AC076:** Regrant creates new authority but does not resume a stopped
  D37 application.
- **D38-AC077:** Revoke preview may disclose only whether the subject has an
  active application and that remaining work stops.
- **D38-AC078:** Permission management discloses no D37 item count, Site, title,
  source body, return context, coordinator, or member outcome.
- **D38-AC079:** Holding D38 grants no policy edit, source/detail, Site,
  correction, task, export, public, Giving, finance, or coordinator authority.
- **D38-AC080:** Granting D38 creates no policy save, D37 preview/application,
  task, assignment, unread, email, reminder, or source effect.

### Information architecture and non-holder UX

- **D38-AC081:** The durable administrative flow lives in the Phase 12
  People & access product, not Website settings.
- **D38-AC082:** The current seed-backed Teams collections never write or
  authorize a D38 grant.
- **D38-AC083:** D38 appears under explicit Additional permissions/Website
  operations, not a friendly module rung.
- **D38-AC084:** A D38 holder can discover the capability in My Access with
  current provenance/duration.
- **D38-AC085:** My Access can link to the focused safe current-work operation
  route without exposing policy edit.
- **D38-AC086:** The focused route exposes only D37's safe policy summary,
  action, progress, result, and recovery.
- **D38-AC087:** A policy editor without D38 sees only the successful
  prospective-save truth and no disabled action.
- **D38-AC088:** A non-holder sees no holder count, grant instruction, backlog
  existence, or fake request-access control in Website settings.
- **D38-AC089:** Authorized access managers see the neutral zero-holder empty
  state only inside access administration.
- **D38-AC090:** D38 adds no Website-specific holder roster, role, settings
  field, or navigation badge.

### Accessibility, mobile, localization, and recovery

- **D38-AC091:** Every important interactive target is at least 44 by 44 CSS
  pixels or has an equivalent 44-pixel hit area.
- **D38-AC092:** All grant/revoke fields have persistent labels,
  instructions, error associations, and programmatic required state.
- **D38-AC093:** Keyboard users can open, review, cancel, submit, resolve
  conflict, and return with visible focus and correct focus restoration.
- **D38-AC094:** Screen readers receive the title, subject, organization,
  scope, consequences, validation, pending state, and persistent result.
- **D38-AC095:** State/provenance/expiry is not communicated by color, icon,
  hover, animation, or position alone.
- **D38-AC096:** The journey reflows at 320 CSS pixels and 400-percent zoom
  without horizontal permission tables or clipped controls.
- **D38-AC097:** Forced colors and reduced motion preserve focus, state,
  hierarchy, and status.
- **D38-AC098:** Long international names, CJK, diacritics, plural forms, and
  RTL/bidirectional text do not obscure subject or scope.
- **D38-AC099:** Dates and expiry display in the user's locale and named time
  zone while preserving the authoritative UTC instant.
- **D38-AC100:** Low-bandwidth/lost-response recovery refetches the current
  projection and durable receipt before enabling another submission.

### Database, RLS, grants, and privileged paths

- **D38-AC101:** Every grant, source, membership, delegation, receipt, and audit
  relation has `tenant_id NOT NULL` and same-scope constraints.
- **D38-AC102:** Tenant, subject, capability, source, grantor/delegation, and
  created-at cannot be changed by an allowed update.
- **D38-AC103:** Capability deletion is restricted while any history refers to
  it.
- **D38-AC104:** One partial/conditional uniqueness rule prevents duplicate
  active semantic source paths without preventing historical successors.
- **D38-AC105:** Indexes support current subject resolution, capability holder
  explanation, expiry/delegation invalidation, and audit lookup.
- **D38-AC106:** Browser roles have no direct authoritative write grant.
- **D38-AC107:** Every D38 table enables and forces RLS.
- **D38-AC108:** `USING` and `WITH CHECK` reject cross-Tenant and scope-moving
  insert/update/delete attempts.
- **D38-AC109:** Security-definer/locked functions pin `search_path`, derive
  trusted context, and cannot be invoked as a broad generic grant API.
- **D38-AC110:** Table owner, service role, `BYPASSRLS`, RPC, worker, support,
  repair, import/export, cache, Realtime, and AI paths pass equivalent negative
  authorization/Tenant tests.

### Failure, scale, rollout, and traceability

- **D38-AC111:** Authorization-store uncertainty denies D38 and never falls
  back to a role or cached allow.
- **D38-AC112:** Audit/epoch/receipt failure rolls back the grant-state effect.
- **D38-AC113:** UI projection failure cannot retain or create authority and
  exposes a persistent recoverable error.
- **D38-AC114:** EffectiveAccess resolution uses indexed current inputs, not
  audit scans, remote IdP calls, or D37 cohort enumeration.
- **D38-AC115:** Holder search/list is Tenant-scoped, authorized, paginated, and
  stable under a current governance snapshot.
- **D38-AC116:** Mixed-version readers that do not understand
  `explicit_only`/provenance fail closed for D38.
- **D38-AC117:** Migration produces zero grants and a report proving no inferred
  role/group/policy/coordinator/task source.
- **D38-AC118:** Rollback fences writers, preserves current grants/history, and
  never restores implicit authority or rewrites D37 effects.
- **D38-AC119:** Grill, glossary, ADRs, Phase 12, OpenSpec, design, tickets,
  implementation, tests, and release evidence use the same D38 terms/rules.
- **D38-AC120:** Activation remains Reserved until D39's protected direct/group
  and D40 deliberate continuity-source contracts and all positive,
  negative, boundary, Tenant-poison, concurrency, migration, accessibility,
  production-shaped, and privileged-path evidence passes.

## Named production monitors

| Signal                                                     |                                                                                            Threshold | Owner                        | Required response                                                                              |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------: | ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `website_recovery_d38_implicit_grant_total`                |               Any role, seed, ladder, policy, coordinator, task, route, or support state confers D38 | IAM + Security               | P0 disable exercise/writers, revoke implicit paths, audit every application, fix registry/PEP. |
| `website_recovery_d38_zero_holder_dependency_total`        |           Any prospective save, lane, or ordinary source recovery fails because holder count is zero | Website + IAM                | Remove coupling immediately; restore source fallback; inspect affected Tenants.                |
| `website_recovery_d38_last_holder_revoke_blocked_total`    |                                        Any revoke blocked solely because D38 would have zero holders | IAM + UX                     | Repair guard/copy; distinguish Phase 12 last permissions manager.                              |
| `website_recovery_d38_grant_without_manage_grants_total`   |                                                                                                  Any | Security                     | P0 contain/revoke, preserve audit, inspect every grant path and caller.                        |
| `website_recovery_d38_grant_above_ceiling_total`           |                                                                                                  Any | IAM Security                 | Revoke affected grant, end delegated path, repair live ceiling evaluation.                     |
| `website_recovery_d38_cross_tenant_edge_total`             |                            Any grant/subject/group/receipt/cache/event crosses Tenant or environment | Security                     | P0 incident response, deny path, preserve evidence, repair constraints/RLS.                    |
| `website_recovery_d38_ineligible_subject_effective_total`  |   Any inactive, pending, nonstaff, service, external, or wrong-assignment subject resolves effective | IAM                          | Deny immediately, invalidate epoch, audit uses, repair eligibility/identity.                   |
| `website_recovery_d38_old_assignment_revived_total`        |                                                 Any ended/recreated assignment inherits an old grant | IAM + Data                   | End access, inspect applications, repair assignment-generation binding.                        |
| `website_recovery_d38_seed_or_ladder_presence_total`       |                      Any build/boot snapshot contains D38 in Owner, Web Studio, role, or module rung | IAM Architecture             | Fail build/boot; remove implicit bundle and reconcile grants.                                  |
| `website_recovery_d38_holder_count_mismatch_total`         |                           Any raw/projection count differs from deduplicated current EffectiveAccess | IAM + Data                   | Hide count, repair provenance/resolution, review revoke copy.                                  |
| `website_recovery_d38_false_revocation_message_total`      |                                             Any UI/receipt says access removed while a path survives | IAM UX                       | Correct receipt/projection, notify affected access manager in-product, add regression.         |
| `website_recovery_d38_stale_grant_commit_total`            |                 Any grant/revoke commits against a changed governance head without explicit conflict | IAM + Data Integrity         | Stop writer, inspect races, repair CAS/idempotency boundary.                                   |
| `website_recovery_d38_d37_commit_after_end_total`          |                                   Any uncommitted D37 member commits after effective authority ended | IAM + Website Workflow       | P0 stop claims, audit partial operation, repair epoch fence.                                   |
| `website_recovery_d38_regrant_resume_total`                |                                                        Any regrant resumes a stopped D37 application | Website + IAM                | Stop operation, preserve receipts, require fresh D37 review.                                   |
| `website_recovery_d38_privileged_bypass_total`             |          Any owner/service/RPC/worker/support/repair/import/AI path bypasses grantor or exercise PEP | Security                     | P0 disable path, rotate/restrict access if needed, inspect affected grants/effects.            |
| `website_recovery_d38_rls_scope_move_total`                |                          Any allowed mutation changes Tenant/subject/capability/source/grantor scope | Database Security            | Stop writer, quarantine row, repair constraints/policies, audit neighboring data.              |
| `website_recovery_d38_audit_atomicity_gap_total`           |                                      Any grant/revoke effective without complete epoch+audit+receipt | IAM + Audit                  | Freeze writer, reconstruct from WAL/evidence, repair atomic command.                           |
| `website_recovery_d38_protected_audit_payload_total`       |             Any source/person/Site/correction/care/donor detail enters reason, log, event, or export | Privacy + Security           | Stop sink, contain/purge under records policy, assess incident, tighten validation.            |
| `website_recovery_d38_holder_roster_leak_total`            |                                         Any unauthorized holder identity/count/provenance disclosure | Privacy + Security           | Disable projection/cache, contain disclosure, repair purpose authorization.                    |
| `website_recovery_d38_zero_holder_noise_total`             | Any D38-specific unread, email, reminder, task, banner, escalation, or health alert due only to zero | Product + Notifications      | Remove emission and retained noise; repair invariant tests.                                    |
| `website_recovery_d38_unreachable_holder_total`            |   >0 effective holders cannot reach the safe operation route for 15 minutes after current resolution | Website UX + IAM             | Repair nav/projection; provide direct safe route; do not widen policy edit.                    |
| `website_recovery_d38_unauthorized_disabled_control_total` |                         Any non-holder policy editor sees disabled D37 control/holder/backlog oracle | Website UX + Privacy         | Hide control, remove cached disclosure, test all states.                                       |
| `website_recovery_d38_nested_overlay_total`                |                                         Any production grant/revoke opens a modal from a modal/Sheet | IAM UX + Accessibility       | Block release, replace with dedicated route or one overlay.                                    |
| `website_recovery_d38_touch_target_violation_total`        |                                    Any important target below 44×44 CSS pixels in supported viewport | Accessibility + IAM UX       | Block release; fix shared control/spacing and reverify manually.                               |
| `website_recovery_d38_serious_a11y_defect_total`           |                      Any serious/critical keyboard, name, focus, status, reflow, forced-color defect | Accessibility + IAM UX       | Block rollout, repair, repeat manual and automated evidence.                                   |
| `website_recovery_d38_reason_validation_reject_rate`       |                    >5% of submitted reviews over 7 days, ≥100 submissions, excluding stale conflicts | IAM UX                       | Inspect copy/limits/localization; improve without weakening protected-data rule.               |
| `website_recovery_d38_resolution_latency`                  |                                           p95 >2× approved baseline for 15 minutes and ≥1,000 checks | IAM Platform                 | Inspect indexes/cache epochs; fail closed; pause expansion if D37 affected.                    |
| `website_recovery_d38_manual_db_repair_total`              |                                                                                                  Any | IAM Operations               | Treat as product defect; add/repair safe product recovery command.                             |
| `website_recovery_d38_group_consequence_mismatch_total`    |                         Any admitted group change affects a different effective cohort than reviewed | IAM + Data Integrity         | Roll back/fence group writer, recompute from receipt, repair snapshot/CAS.                     |
| `website_recovery_d38_cross_source_reuse_total`            |                                                Any automatic Mobilize or other-domain exercise/grant | Architecture                 | Remove copied capability/meaning; require a source-specific founder decision.                  |
| `website_recovery_d38_staff_scoring_use_total`             |                              Any ranking, performance, readiness, or disciplinary use of holder data | Privacy + Product Governance | Disable derived use, remove retained metric, review access and policy.                         |
| `website_recovery_d38_support_case_rate`                   |                                           >5 grant/revoke/meaning cases per 100 changes over 30 days | Support + IAM UX             | Research failures, improve copy/placement/provenance; never solve by auto-grant.               |

Zero effective holders is intentionally **not** a monitor threshold. It is
healthy state, not an incident.

## Ruthless synthesis

### Verified facts, judgments, assumptions, and unknowns

- **Repository fact:** current Core runtime has no D38 capability or durable
  generic permission-grant product.
- **Repository fact:** current `hasRole("admin")` includes ordinary active
  staff, so it is an unsafe D38 grantor check.
- **Repository fact:** `/mc/admin/teams` is seed-backed and its visible
  permission edits do not persist a canonical grant.
- **Repository fact:** Phase 12 owns the future registry, Active Tenant
  Assignment, central PDP, groups/named grants, governance epoch, delegation,
  audit, last-manager recovery, and locked grant-state command.
- **Repository conflict:** Phase 12's current registry/map equality would force
  D38 into a friendly ladder even though D37 forbids implication. The
  `explicit_only` catalog amendment resolves this without a second IAM system.
- **Verified external fact:** current Entra, Google Cloud IAM, GitHub, and
  Salesforce designs use explicit principal/role/scope assignments, granular
  permissions, groups where governed, effective-access explanation, expiry/
  revocation, and access review.
- **Verified external fact:** empty/default-deny assignment is normal; owner
  continuity minimums protect existential administration, not every optional
  operation.
- **Product judgment:** zero-by-default explicit grant is proportionate because
  the no-holder fallback remains fully usable and a separate Phase 12 access
  manager can recover it.
- **Product judgment:** one required concise governance reason plus visible
  Until removed/expiry is clearer than either no accountability or mandatory
  enterprise JIT.
- **Assumption:** ministry access managers will understand the plain-language
  distinction between policy editing and current-work application. Verify with
  scenario-based usability tests, not preference polling.
- **Assumption:** access administrators need the safe active-application
  consequence to revoke confidently. Verify comprehension without disclosing
  source facts.
- **Repository decision:** D39 permits both a typed direct assignment-
  capability grant and a protected governed flat Access-group path through one
  Phase 12 EffectiveAccess model.
- **Unresolved unknown:** a later decision may define an application-specific
  stop command; D38 revoke is not that command.

### Must be resolved before D38 is recorded

Resolved in this document:

1. zero means zero effective holders;
2. grant authority and exercise authority are separate;
3. Phase 12—not Website—owns grants;
4. D38 is `explicit_only` and absent from every seed/ladder;
5. current Teams UI is prototype evidence, not the permanent UX;
6. effective provenance and honest revoke copy are mandatory;
7. grants bind the Active Tenant Assignment;
8. every source loss advances current reproof, but only final EffectiveAccess
   loss fences later uncommitted D37 work and regrant never resumes it;
9. zero is quiet and last-holder removal is allowed.

### Must be captured in specification and design

1. Phase 12 registry coverage amendment and D38 capability metadata.
2. D39 typed direct/protected Access-group source, membership-ceiling,
   provenance, and truthful-overlap contract.
3. Exact grant/revoke command, semantic identity, reason/duration, provenance,
   delegation, audit, epoch, and active-assignment rules.
4. Separate grant-authority and application-authority PEPs.
5. People & access, My Access, safe operation route, zero, conflict, revoke,
   expiry, and lost-response states.
6. Database constraints, RLS/grants, privileged parity, retention, indexes, and
   migration.
7. D37 per-member authority fence and safe revoke consequence projection.
8. Accessibility/localization/low-bandwidth behavior.
9. Monitor ownership and incident responses.

### Required implementation safeguards and order

1. Reconcile Phase 12/identity-and-access OpenSpec and glossary before schema.
2. Add the code registry and `explicit_only` build/boot invariants.
3. Add same-scope grant/provenance/audit/epoch schema and locked commands.
4. Add current resolver/PEP, privileged denial tests, and cache fencing.
5. Add D37 authority-generation integration and safe revoke consequence.
6. Add product-backed read projections and My Access.
7. Add accessible People & access grant/revoke UX and persistent receipts.
8. Migrate to zero grants; shadow resolution; infer nothing.
9. Canary grant/revoke before enabling any D37 writer.
10. Exercise concurrent grant/revoke/offboard/expiry/group/D37 cases and
    disabled-Inngest recovery.
11. Expand only with clean Tenant, audit, provenance, latency, UX, and
    accessibility evidence.

### Monitor-only hypotheses

Nothing essential to correctness is relegated to monitoring. The only
monitor-only hypotheses are:

- **Comprehension:** signal `website_recovery_d38_support_case_rate`; threshold
  > 5 per 100 changes/30 days; owner Support + IAM UX; response usability
  > research and copy/placement revision without auto-granting.
- **Reason friction:** signal `website_recovery_d38_reason_validation_reject_rate`;
  threshold >5% over 7 days and ≥100 submissions; owner IAM UX; response inspect
  localization/helper/limits while preserving data minimization.
- **Performance:** signal `website_recovery_d38_resolution_latency`; threshold
  p95 >2× baseline for 15 minutes and ≥1,000 checks; owner IAM Platform;
  response inspect indexes/epoch cache and pause expansion.

## Migration, activation, and rollback

1. Land readers/schema/registry classification before writers.
2. Reject unknown or old capability classifications at build, boot, and PEP.
3. Infer no D38 grant from current staff/admin/Owner/Web Studio/team/policy/
   coordinator/task/source data.
4. Produce an explicit zero-grant migration evidence report per Tenant.
5. Shadow effective resolution and compare every path to the reference model.
6. Release read-only People & access/My Access explanation.
7. Canary explicit grant/revoke for selected non-production Tenants.
8. Test lost responses, concurrency, expiry, offboarding, rejoin, delegation,
   holder provenance, and final-holder removal.
9. Enable D37 preview without acceptance, then narrow acceptance canary.
10. Keep a kill switch for new grant/D37 writers and claims, not source
    recovery.
11. Rollback preserves authoritative grant heads, audit, receipts, and
    committed D37 history; roll forward from evidence.

## Decision to record

> **D38 — Explicit Tenant capability grant; zero effective holders allowed.**
> Core registers **Apply Website recovery settings to current work** as one
> `explicit_only` Phase 12 capability. It is default-deny, seeded nowhere, and
> never implied by Owner/Admin/staff/Web Studio/policy edit/Site/source/
> coordinator/task/support state. Zero effective holders is valid and quiet;
> prospective policy and the Needs assignment lane remain complete.
>
> Only a current same-Tenant `permissions.manage_grants` holder within live
> delegation scope/ceiling may deliberately grant or revoke it through Phase
> 12's locked, expected-head, idempotent, auditable grant command. Grant
> authority is separate from possession, so zero holders is recoverable without
> weakening the Phase 12 last-permissions-manager invariant.
>
> Human grants bind the exact Active Tenant Assignment, and current
> EffectiveAccess—not rows, roles, tokens, or UI—determines holder status and
> exercise. Authorized access UX explains every effective source and never
> claims access ended while another path survives. Removing the final holder is
> allowed after one proportionate consequence review.
>
> Revocation/expiry/assignment or delegation end makes the affected path inert;
> only final post-change EffectiveAccess loss fences every later uncommitted
> D37 effect. Committed source history remains immutable and regrant requires a
> fresh D37 review/application. Permission management reveals no source member
> detail.
>
> The durable experience belongs in Phase 12 **People & access** and **My
> Access**, with a focused safe Website current-work route for holders. It does
> not reuse the seed-backed Teams demo, add a Website roster, or create
> notification/reminder/task noise. D39 permits typed direct and protected
> flat Access-group sources through the same Phase 12 EffectiveAccess model;
> activation still requires implementation and proof.

## D39 — Which central assignment surfaces may carry D38?

### Context and concrete example

Hope Ministries has one operations lead, Jordan, so a direct grant is easiest
to explain. Larger Mission Network has six rotating Website operations staff
already managed through a governed Phase 12 group. If Core permits only direct
grants, larger Tenants repeat the same security change and can drift. If Core
permits only groups, a two-person ministry must create and maintain a group for
one person. If Core permits both without provenance, removing one path may
falsely appear to revoke access.

This is a distinct decision from D38's default and grant authority. It decides
the **subject/source of the grant**, not who may administer grants, who may edit
the policy, or who can see Website source work.

### Options

#### Option 1 — both direct Active Tenant Assignment and governed flat group — recommended

Phase 12 may assign the explicit-only atom directly for a one-off/small-team
need or deliberately to a flat same-Tenant access group for a stable job
function. Both resolve through one EffectiveAccess/provenance/epoch model.
There is no seeded Website group, nesting, dynamic/external membership, or
automatic role mapping. `permissions.manage_grants` attaches the capability to
the group; Phase 12 `permissions.manage_membership` governs its membership and
must expose the D38 consequence.

**User/Tenant UX:** small ministries choose one person without ceremony;
larger ministries manage one stable operations team. Every person view says
exactly **Direct grant** and/or **Through [group]**, and revoke reviews state
what will actually remain.

**Tradeoff:** best long-term flexibility and least per-person drift, but group
membership changes need the same high-impact consequence preview, audit, and
current-epoch fencing.

#### Option 2 — direct Active Tenant Assignment only

Every holder receives an individual explicit grant. Groups cannot carry D38.

**User/Tenant UX:** clearest provenance and simplest first implementation for
the likely small holder set.

**Tradeoff:** larger Tenants repeat grants/reviews/offboarding and may create
manual drift. Adding groups later changes the grant-source model, although
Phase 12 already anticipates it.

#### Option 3 — governed group only

Tenants must create/select a flat access group and manage holders through its
membership.

**User/Tenant UX:** consistent for larger teams and centralized rotation.

**Tradeoff:** needless ceremony and conceptual load for a one-person or
two-person ministry; the group becomes an artificial wrapper rather than a
real job-function bundle.

### Recommendation and exact question

**My recommendation is Option 1 — permit both direct Active Tenant Assignment
and governed flat-group assignment through Phase 12, with no seeded group and
one complete EffectiveAccess/provenance model.** This is the modern direct-for-
one-off/group-for-job-function pattern used by mature IAM products, fits both
small and larger ministries, and adds no second authorization engine. Its
safety depends on the precise group constraints stated above.

Which D39 assignment mode should Core record: **Option 1 — both direct and
governed flat group**, **Option 2 — direct only**, or **Option 3 — group only**?

### D39 reconciliation

D39 selected Option 1 with required amendments. D38 may attach directly only
through a typed Phase 12 assignment-capability grant, or indirectly through a
protected flat **Access group** whose active memberships bind exact same-Tenant
staff Active Tenant Assignments. Both paths are optional, additive,
deduplicated, independently expiring/revocable, and resolved by one
EffectiveAccess model. D38-bearing membership mutation is capability-aware
privilege administration: the scoped membership actor's live protected-group
ceiling must cover the complete current bundle and revision, and same-Party
self-add is forbidden outside Phase 12's existing quorum-aware recovery.

See the [D39 adversarial review](./phase-24-d39-direct-and-governed-group-capability-assignment-adversarial-review.md),
[D39 primary research](./phase-24-d39-direct-and-group-capability-assignment-primary-research.md),
and [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md).

### D40 reconciliation

D40 permits one deliberate **separate direct grant** while the exact Active
Tenant Assignment already receives D38 through current protected group paths
and has no direct source. The person-access flow shows every current group
source first, states that current ability is unchanged while future survival
changes, requires a fresh minimized reason and explicit unpreselected
independent duration, and binds review to the complete current group-source set.

The command reuses D39's typed direct relation and records immutable overlap-
creation evidence in audit/receipt history, not a new exception table or
authorization state. Relevant source change before commit conflicts; self/
alternate-hat/quorum controls still apply; state, basis, audit, receipt, and
one epoch commit atomically. Later group loss leaves the direct source current,
and only final EffectiveAccess loss fences D37.

See the [D40 adversarial review](./phase-24-d40-deliberate-continuity-direct-grant-adversarial-review.md)
and [D40 primary research](./phase-24-d40-deliberate-continuity-direct-grant-primary-research.md).
