# D16 — missionary-managed goals under organization control

**Disposition: Accept with required amendments.** The founder selected **A —
Missionary-managed when permitted**, adding staff control per missionary or
project and requiring excellent, simple UX. Research date: October 16, 2026 UTC.
Repository baseline: `9cada8f3d8ab59db391d3fd20df77fcadeb09813`.

On October 16, 2026 UTC the founder instructed: “Ratify this decision and
amendment.” The corrected D16 decision and required amendments below, including
**C01–C20 and P01–P24 as future acceptance obligations, are explicitly ratified**.
This includes editing-only control with optional goal setting, Staff-managed /
Missionary-managed labels, one live organization default with exact subject
overrides, the initial Staff-managed default and the bounded version/input
profile. Ratification does not establish implementation or release qualification.

This research-only Grill record changes no formal owner, ADR or OpenSpec
contract; publication awaits `/to-prd`, tickets await `/to-issues`. No application,
dependency, live Supabase setting, provider, permission or financial fact changed.

## Exact corrected decision to record

> Allow authorized staff to choose who manages fundraising goals for each
> eligible missionary or project. Use clear choices: **Staff-managed** or
> **Missionary-managed**. Where the subject follows the organization's default,
> show **Use organization default** and its actual current result.
>
> Missionary-managed means permission to act, not an obligation to create or
> change a goal. An authorized missionary can set or change the eligible goal in
> one short form with one **Save goal**. A readable staff-managed goal says
> **Managed by your organization**. If missionary management is enabled but this
> person lacks editing permission, show **View only** without a misleading Edit
> action. Authorized staff retain their separately granted management rights.
>
> Turning missionary editing off preserves the existing goal and its history.
> It does not hide, delete, zero, end or publish the goal. Goal visibility,
> coaching sharing, finance-approved plans and public-page publication remain
> independently governed. Goal permission never makes activity tracking,
> coaching, financial plans or performance targets compulsory.
>
> Each goal has one exact source and missionary/project scope. A shared project
> uses the same canonical goal wherever it appears. Every change requires
> current server-verified authority and preserves exact currency, purpose,
> period and attributed version history. A stale editor cannot overwrite a
> newer change or bypass a permission change. Saving an internal goal does not
> automatically change a released public target or any financial transaction.

**Confirmed meaning of “on/off/optional.”** After the initial review, the founder
answered: “Editing permission only: staff allow or disable missionary editing;
setting a goal remains optional (recommended).” This resolves the earlier
ambiguity: the setting controls editing, not Required/Optional/Not-used goal
usage. “Optional” describes freedom to have a goal; it is neither a third
permission state nor a synonym for inheritance. The clarification initially confirmed only this meaning. The subsequent explicit
ratification now also accepts the corrected control/default design and the
remaining required D16 amendments; these are intended behavior, not runtime proof.

## Evidence and alternatives

**Repository facts** below describe inspected contracts and source at the stated
baseline. **Primary external facts** are published vendor/standards documentation,
not authenticated competitor tests. **Product judgments** include the control
labels, initial default, prospective edit profile and positive new-goal rule.
**Measured evidence** is the isolated PostgreSQL probe, not hosted Core behavior.
No missionary/staff usability study or production-data census was performed.

| Evidence                                                                                                              | Verified finding                                                                                                                                                                                                                         | Consequence                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Owner/permission research](d16-evidence/owner-permissions.md)                                                        | P9 identities, P12 source capabilities, additive grants, floors and policy administration are distinct; membership/job title is not authority.                                                                                           | Use the current shared resolver and exact subject scope. A convenience setting cannot secretly become a new per-user deny rule.                                           |
| [Goal/finance lifecycle](d16-evidence/goals-finance-lifecycle.md)                                                     | P28 Goal Versions, P21 approved Plans, P13 goals/received facts, P16 commitments and P22 released progress have different owners.                                                                                                        | Define a bounded owner-qualified edit; do not clone a campaign goal or silently synchronize amounts.                                                                      |
| [Current source and UX](d16-evidence/current-source-and-ux.md)                                                        | A mounted GraphQL mutation updates legacy `funding_goal` through a service-role audit RPC; it lacks this subject policy/version contract. Current profile forms do not supply the new journey.                                           | Fence or converge every old writer before the new setting promises control. The earlier UI/profile-only search was not evidence of mutation absence.                      |
| Same source note                                                                                                      | Later forward SQL grants broad missionary SELECT; the field-policy ceiling is dormant and not wired into that writer. Public projection code reads the scalar, while the inspected worker page uses mock data.                           | Do not place private goal truth in the broadly read legacy row. These are source discrepancies, not a proven hosted disclosure or public-page update.                     |
| [Primary UX research](d16-evidence/primary-ux-research.md)                                                            | MPDX documents directly entering an organization-recommended goal; TntConnect documents editing near analysis. HubSpot separates goal viewing/editing. Salesforce and Atlassian illustrate different effective-access/default semantics. | Direct editing is credible. No comparator settles Core's policy, historic arithmetic or default inheritance. Avoid hidden double-click controls and copied rule builders. |
| [Database analysis](d16-evidence/database-lifecycle.md) and [PostgreSQL probe](d16-evidence/postgres-probe/README.md) | Real PostgreSQL 17.11 exercised 25 outcomes, including four concurrent-session orderings.                                                                                                                                                | Validates bounded transactional mechanics. It does not qualify Core's resolver, service role, Data API, deployed migrations, public consumers or UI.                      |

Fresh primary checks also covered [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security),
[database functions](https://supabase.com/docs/guides/database/functions),
[PostgreSQL 17 row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)
and [CREATE POLICY](https://www.postgresql.org/docs/17/sql-createpolicy.html).
RLS and grants are different layers; table owners/BYPASSRLS and function/view
ownership matter. Omitted WITH CHECK can inherit USING: omission alone is not
proof of unrestricted mutation. Row-level permission never establishes which
columns or source transitions may change. These facts support Core's existing
coarse tenant RLS plus fine-grained source authorization, rather than replacing
P12 with capability checks scattered through SQL policies.

| Strong alternative                                                       | Assessment                                                                                                                                                       |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff-only goals everywhere                                              | Simplest centralized administration, but denies the discretion explicitly selected in A. Retain it as an organization/subject policy, not the only product mode. |
| Free missionary editing of the current scalar                            | Small code change, but cannot enforce staff control, history, exact financial meaning or source separation. Reject as the implementation path.                   |
| Approval request for every goal change                                   | Appropriate only if separately selected for a source with that rule. Adds handoffs the chosen answer removes; no new routine queue.                              |
| Required/Optional/Not-used goals plus a custom permission matrix         | Potentially different product needs, not established by this answer. Do not build them from ambiguous shorthand.                                                 |
| One organization default, one exact subject exception, one owner command | Recommended. Staff can configure exceptions without a rule tree; the missionary has a short, direct workflow.                                                    |

## The complete, small user journey

**Staff:** in the existing missionary/project detail settings, show the actual
subject and organization, followed by one compact section:

```text
Fundraising goals
Who can manage this goal?

○ Use organization default — Staff-managed
○ Staff-managed
  Authorized staff set and change this goal.
○ Missionary-managed
  Missionaries with permission for this goal can set and change it.

Changing this setting keeps the existing goal and history.
                                            [Save changes]
```

For a subject with multiple eligible goals, label the section's actual scope
**Who can manage fundraising goals for this missionary/project?** The override
applies only to that typed subject's eligible goals, not to every project its
participants happen to belong to. A canonical goal displayed through several
contexts retains one management-policy scope; an alias displays that actual
mode and links to its permitted source setting rather than creating an exception.
Do not invent per-goal exceptions. The
organization-level control has the two explicit modes; its initial proposed
default is Staff-managed until an authorized administrator enables delegation.
An existing explicit exception remains an exception when the default changes.
Show the effective saved mode and **From organization default / Set for this
missionary/project**. Loading or failed policy resolution is not “Off.”

This control governs the missionary management path. It is not a global
revocation of independent staff authority or a safety-floor override. If a
person also has staff rights, explain their effective authority in the actual
active context where relevant; do not combine permissions across contexts or hats.
do not promise that this setting disables all their access. Use existing P12
permission explanation, without adding another access debugger.

**Missionary:** the goal card displays **Monthly support goal · USD 4,500**, or
the source-qualified special-gift purpose and dates. Currency is always explicit;
USD is an example. If permitted, **Edit goal** opens the short form in context:

```text
Edit monthly support goal
For: Maya · [organization]
Amount (USD)  [4,500]

This updates your internal fundraising goal.
It won't change your approved support plan or public giving-page target.
                                 [Cancel] [Save goal]
```

Use the boundary note where these other targets exist or confusion is likely;
do not fill a simple form with accounting terminology. Known subject, purpose,
currency and period are visible context, not repeated selection chores. A
special-gift goal shows its exact period and only the necessary editable fields.
The amount editor cannot casually change currency/subject/measurement basis.
If ending use of a current goal is allowed, **Stop using this goal** is a
separate deliberate source action with clear effects; typing zero is not that
action. This does not delete history or withdraw an independently released pin.

| Situation                                              | Clear behavior                                                                                                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Allowed; no goal exists                                | **No goal set** and **Set goal**. No red warning or required onboarding task.                                                                                  |
| Staff-managed; goal is readable                        | Show the saved goal and **Managed by your organization**. Do not display a dead Edit control.                                                                  |
| Missionary-managed; this reader lacks editing rights   | Show the permitted goal with **View only**. Do not imply that all missionaries are excluded or disclose protected grant details.                               |
| Staff-managed; no goal exists                          | **No goal has been set. Your organization manages this goal.** Normal work remains available.                                                                  |
| Goal or subject cannot be read                         | Follow the existing non-disclosing unavailable/not-found contract; do not reveal hidden values, names or existence.                                            |
| Policy/source is loading or unavailable                | Show the actual loading/error state, not a guessed default, zero or fake absence.                                                                              |
| Save succeeds                                          | Show **Goal saved** and the accepted value/timeframe. Announce status accessibly; stay in the user's context.                                                  |
| Another editor saved first                             | **This goal changed while you were editing. Review the current goal before saving.** Show authorized current/proposed values; no overwrite or automatic merge. |
| Policy became Staff-managed before acceptance          | **Your organization now manages this goal. Your changes weren't saved.** Use this sentence only when that policy cause and rejection are established.          |
| This person's edit grant was removed before acceptance | **You no longer have permission to edit this goal. Your changes weren't saved.** Do not imply that the policy changed for everyone.                            |
| Save response was lost                                 | **We haven't confirmed whether your goal was saved. Checking…** Reconcile the same operation before enabling another independent Save.                         |
| Permission to view is revoked                          | Clear protected values/drafts and late responses according to the current audience rule. Do not retain them in browser persistence for convenience.            |

Use existing **base-maia, Base UI and shared semantic tokens**. Stack the small
form cleanly on mobile; use visible labels, comfortable targets, keyboard access,
focus restoration, inline error text and announced save status. A decimal
keyboard is a hint, not validation. Preserve valid input on ordinary errors,
including slow networks, without adding an offline mutation queue. No separate
confirmation modal is needed for every reversible edit. W3C error-prevention
guidance permits correction/reversal; it does not mandate that modal.

## Consolidated concern register

Severity describes potential harm if shipped incorrectly. Likelihood is a
conditional engineering estimate, not an observed incident rate. Each row gives
failure, impact, evidence, effect on A and the exact permanent requirements below.

| ID  | What could go wrong and why it matters                                                                                                                                                 | Severity / likelihood                                     | Evidence / effect on A                                                                                                | Permanent prevention and exact clauses                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| F01 | “Off” hides or erases a goal; “Optional” becomes a compulsory-goal engine or ambiguous inheritance. Staff and missionaries misunderstand consequences.                                 | Medium / likely with literal shorthand                    | Q16 ambiguity; comparator defaults differ. **Clarifies/narrows** A; does not add compulsory usage.                    | Explicit editing modes, distinct facts, one-level defaults; **C01–C02, C13–C14**.                           |
| F02 | A generic project/user ID edits the wrong owner or creates one copy of a shared goal per participant. Targets and progress diverge.                                                    | High / plausible                                          | P9 identities, P13 canonical goals, P21/P22 Goal Versions. **Narrows** eligible targets.                              | Closed typed owner/subject binding, shared identity, scoped commands; **C03, C06, C11**.                    |
| F03 | A hidden button or new API check leaves the legacy service-role writer, raw read, privileged job or stale permission path open. Staff control becomes false and data may escape scope. | Critical / plausible; legacy alternate writer is concrete | Mounted GraphQL/RPC and migration trace; P12/Supabase. **Changes required implementation**, retains A.                | Current resolver, all-path admission, grants/RLS/projections, old-writer fence; **C04–C05, C10, C17**.      |
| F04 | Cross-tenant references, mutable attribution, imprecise amounts or duplicate heads create untrustworthy records.                                                                       | High / plausible                                          | PostgreSQL constraint semantics; current scalar lacks goal context. **Requires safeguards**.                          | Tenant-aware constraints, immutable source metadata, exact money and one head; **C05–C07**.                 |
| F05 | Today's edit rewrites September's target, a timezone change moves a period, or a historical goal pins stale cash. Coaching/history becomes misleading.                                 | High / likely with scalar reuse                           | ADR0098/0123, P16 dates, D9/D10 limits. **Narrows** ordinary edits to prospective meaning.                            | Versioned effective boundaries, exact calendars and independent current financial correction; **C08, C11**. |
| F06 | The goal becomes approved need, income, spendable funds or a sum of commitments and gifts. Shared projects double-count money.                                                         | High / likely with current fallbacks                      | P13/P16/P21 source contracts; model uses legacy/fallback totals. **Clarifies** meaning.                               | Source-certified comparisons and explicit Plan adoption; **C11–C12**.                                       |
| F07 | Save publishes a private target, widens coaching/history access or leaks sensitive Plan details through prefill, caches, exports or audits.                                            | High / plausible                                          | Public scalar consumer; ADR0098/0123 and ratified D8–D10. **Preserves/narrows** audiences.                            | Separate publication, read permissions and minimal provenance/egress; **C10, C12, C16**.                    |
| F08 | Two saves overwrite each other, permission Off loses a race, or a lost response creates another revision.                                                                              | High / plausible                                          | PostgreSQL ordering rules; 25-case probe exercises counterconditions. **Requires safeguards**.                        | Atomic expected-version acceptance, current policy fence, durable intent deduplication; **C09, C14–C15**.   |
| F09 | Settings look saved when only local state changed; missing is rendered as zero; mobile or localized input silently changes the amount.                                                 | Medium / likely if current examples are copied            | Current unpersisted settings, missing CTA, parser constraints; W3C/forms evidence. **Changes UX requirements**.       | One truthful state model, exact parse, explicit Save and recovery; **C07, C13–C14**.                        |
| F10 | Goal commits but audit/refresh fails; support cannot tell what happened; permanent logs retain needless financial context.                                                             | High / plausible                                          | Atomic source/evidence boundary, P12 tiered audit; derived caches are not truth. **Requires operational safeguards**. | Co-commit durable business history; repair projections; minimal protected audit; **C15–C16, C19**.          |
| F11 | Backfill invents units/currency/authority; an old deployment or restored backup resurrects a grant or overwrites newer targets.                                                        | High / plausible                                          | Legacy numeric→BIGINT conversion, missing source metadata, alternate writer. **Changes rollout**.                     | Qualified retained-data census, guarded activation, forward recovery and fenced restore; **C17, C19**.      |
| F12 | Per-card resolver/history scans and an undefined “beautiful/fast” claim fail with many subjects; review cannot be traced into implementation.                                          | Medium / plausible                                        | P12 set-based/R6 contract; no production workload or user study. **Adds proof**, no speculative infrastructure.       | Bounded indexed reads, measurable acceptance and traceability; **C18, C20**.                                |

## All 22 categories evaluated independently

The concern register supplies severity, likelihood, evidence, consequence and
fix for each referenced finding. The clauses are exact proposed spec language;
the proof matrix makes them falsifiable.

| #   | Category                                                      | Material concern? What was checked and required result                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Problem validity, necessity, and alternatives                 | **Yes — F01/F02.** Direct editing solves the selected handoff problem, but mandatory goal usage and a generic project goal engine are not established. Retain staff-only as policy; adopt the smaller source-qualified editor.                                                                   |
| 2   | Brittleness                                                   | **Yes — F02/F03/F09.** Profile-only keys, role labels, cached settings and assuming every project is a finite campaign break when subjects or permissions change. Use exact current context and qualified goal kinds.                                                                            |
| 3   | Technical debt                                                | **Yes — F02/F03/F11.** A second writer, duplicate P13/P28 targets or a local permission boolean creates lasting drift. Converge writers and owners before activation.                                                                                                                            |
| 4   | Edge cases                                                    | **Yes — F04/F05/F08/F09.** Checked unset/zero/ended goals, multiple currencies, over-goal support, midperiod edits, staff+missionary identities, shared projects, reassignment and interrupted saves. Require explicit outcomes, not inferred defaults.                                          |
| 5   | Footguns                                                      | **Yes — F01/F03/F06/F09.** Off-as-delete, silent publication, guessed currency and optimistic “Saved” are easy mistakes. Use precise labels and source-confirmed actions.                                                                                                                        |
| 6   | Tenant safety                                                 | **Yes — F02/F03/F04/F07.** Check subject/settings keys, related rows, caches, exports, service paths and same-user tenant switching. Tenant predicates alone do not establish permitted subject or purpose.                                                                                      |
| 7   | Database, RLS, and authorization safety                       | **Yes — F03/F04/F08.** Check grants, old/new row scope, immutable columns, tenant-aware FKs, definer privileges, views/RPCs and revocation ordering. No browser-authored actor/tenant/policy metadata.                                                                                           |
| 8   | Overengineering                                               | **Yes — F01/F02.** Required-goal machinery, nested policy inheritance, a formula builder, per-save approval and new vendors are unnecessary for A. One default, one subject exception and the existing owners suffice.                                                                           |
| 9   | UX/UI and user friction                                       | **Yes — F01/F09.** Checked staff setup through missionary save/conflict/read-only recovery, phone layout, keyboard, locale and slow network. The truth must be visible without another wizard. This adds no donor checkout step.                                                                 |
| 10  | Source of truth, ownership, and domain invariants             | **Yes — F02/F04/F05/F06.** One canonical goal/version, qualified metric and current head; separate Plan, commitments, gifts and public binding. No shadow authority from cards or imports.                                                                                                       |
| 11  | Hidden coupling                                               | **Yes — F03/F06/F07/F11.** Legacy public scalar reuse, Plan adoption and membership-derived project targets could change unrelated domains. Make those boundaries explicit and test them.                                                                                                        |
| 12  | Failure modes                                                 | **Yes — F08/F10/F11.** Check rejection, commit/response loss, audit failure, projection lag and restoration. Preserve accepted truth; retry the same intent or repair the derivative.                                                                                                            |
| 13  | Lifecycle, temporal correctness, concurrency, and idempotency | **Yes — F05/F08.** Check create/edit/end, current/previous versions, precise periods, no-op, competing saves, policy races, stale replays and correction. No accidental backdating or financial effect.                                                                                          |
| 14  | Data integrity risks                                          | **Yes — F02/F04/F06/F11.** Check duplicates, wrong shared subject, unsafe numeric conversion, legacy ambiguity and conflicting projections. Constraints and one command own invariants.                                                                                                          |
| 15  | Security and privacy risks                                    | **Yes — F03/F07/F10/F11.** Check source read restrictions, public/coach egress, protected plan provenance, logs, exports and restored grants. No new files or Storage objects are necessary; existing exports remain governed.                                                                   |
| 16  | Scalability and performance risks                             | **Yes — F12.** Check indexed head/subject lookups, paginated history, set-based permissions and multi-project screens. No whole-history scan, N+1 authorization or guessed latency/capacity claim.                                                                                               |
| 17  | Operational burden                                            | **Yes — F09/F10/F11.** Manual repair and staff handoffs would persist if saves are ambiguous or settings are cosmetic. Provide native conflict/reconciliation and policy explanations; direct SQL repair is not the normal workflow.                                                             |
| 18  | Observability and auditability gaps                           | **Yes — F07/F10.** Business revision history, security/policy events and technical traces have different audiences. Require attributable durable changes without dumping sensitive content into logs.                                                                                            |
| 19  | Dependency and integration risks                              | **Yes — F03/F06/F12.** No new third-party provider is required, but actual P12/source/metric qualification is a dependency. An external CRM's permissions or formula cannot substitute. Retain current owner gates.                                                                              |
| 20  | Migration, rollout, and upgrade risks                         | **Yes — F11.** Check retained data, mixed versions, protected old writers/readers, per-tenant activation and restore. Rollback cannot reactivate a less constrained scalar route.                                                                                                                |
| 21  | Testability, traceability, and proof                          | **Yes — F12.** “Eligible,” “optional” and “clear” need exact rules and outcomes. C01–C20/P01–P24 trace into owner amendments and later tests; the probe is bounded evidence only.                                                                                                                |
| 22  | Other development hazards                                     | **No additional material concern beyond F01–F12.** Checked billing/payroll/payment effects, automatic outreach, new role/dependency engines, old-stack revival and compulsory coaching. None is necessary or authorized by this goal-control decision; C01/C10/C20 exclude accidental expansion. |

## Exact required amendments

These clauses are ratified requirements to carry into the future owner/spec
work. They intentionally fix observable contracts and invariants, not table
names, component placement details or a new general framework.

**C01 — Permission, not compulsory usage.** The goal-management setting SHALL
control eligibility for missionary goal creation/change only, and any separately
offered owner-qualified ending action. It SHALL
NOT require a goal, activity target, check-in, coach, finance Plan or performance
score. Staff-managed SHALL preserve independently readable existing goals and
history. Missing, zero, ended, hidden, denied and unavailable SHALL remain distinct.

**C02 — One default and one subject exception.** Authorized staff SHALL manage
one tenant default and an exact typed-subject override: Use organization default,
Staff-managed or Missionary-managed. The default initially SHALL be Staff-managed
unless an explicit qualified migration decision establishes existing delegation.
Changing the default SHALL affect subsequent commands for inheriting subjects;
explicit exceptions SHALL remain unchanged. Default Off SHALL NOT be described
as a tenant-wide safety kill switch. No implicit project/member/household cascade
or third “Optional” authorization value SHALL be introduced.

**C03 — Exact owner and subject.** The setting SHALL identify the exact P9
Ministry Assignment or Ministry Project scope and the source-qualified goals it
governs, including the exact source-owned Legal Entity where applicable, never
inferred from a tenant default; it SHALL NOT use a login, Support Assignment or
Page as an interchangeable owner. P28 support-raising goals require an explicit bounded project profile
where used for Ministry Projects. Existing P13 campaign/Designation goals SHALL
remain P13-owned, edited only through that owner's bounded delegated capability
and command where qualified. A displayed P13 goal SHALL NOT be copied into P28
to make it editable. Source families/bindings SHALL be closed and validated, not
an arbitrary goal engine. Each canonical goal SHALL resolve one authoritative
management-policy scope across all display bindings, including a P13 goal shown
through several P9 contexts. Aliases SHALL not acquire conflicting local policies
or broaden that scope. Shared project participation creates no duplicate goal
or editing entitlement.

**C04 — Current authority and separation of administration.** Every goal or
policy command SHALL derive tenant, principal, actor, purpose and scope from
trusted server context and resolve current P12 EffectiveAccess. The subject
policy is a named source-purpose admission condition for missionary management,
not a parallel per-user DENY model or a replacement for grants/floors. Ordinary
editors SHALL NOT grant themselves management or change policy. Policy managers
SHALL need independent source authority to read/change an amount. Staff rights
remain separately granted. Jobs/service credentials SHALL confer no end-user
authority. Current epoch/source admission SHALL fence new write acceptance while
preserving lawful effects accepted before a later revocation.

**C05 — Database boundary.** Goal identities, versions, heads, policies, receipts
and history SHALL preserve same-tenant relationships and exact source-owned
Legal Entity scope where applicable with scoped unique/foreign keys and
source-valid nullability/checks. Source identity, tenant, actor, author,
effective attribution and adoption provenance SHALL NOT be caller-editable
fields. No ON DELETE cascade SHALL erase referenced goal/business history.
Use coarse tenant RLS plus the governed command/projection boundary; validate
both old-row reach and permitted resulting state. Browser roles SHALL NOT have
raw goal mutation or unprojected sensitive read access. Explicit grants, views,
RPC execution, security-definer owner/search path, GraphQL, service paths and
export/storage consumers SHALL preserve the same boundary. RLS alone is not
field or lifecycle authorization.

**C06 — One fact, immutable versions.** Each source-qualified logical goal SHALL
have at most one current head and immutable attributed revisions. Its qualified
identity includes subject, purpose, currency and applicable goal/period identity.
Recurring and separately identified special-gift goals or currencies may coexist;
this is not one goal per person. Source constraints SHALL prevent accidental
duplicate logical targets. Create/change SHALL use the source command. If an
owner-qualified stop action is offered, it SHALL remove current use while
retaining history and independently pinned versions; D16 does not require a new
Stop feature merely to permit editing.
Correction SHALL create attributed successor evidence, never silently overwrite
an accepted version. Hard deletion is not the ordinary correction workflow.

**C07 — Exact monetary inputs.** Newly authored monetary goals in this profile
SHALL have a positive, finite, source-supported amount in an explicit currency.
The existing exact money parser's exponent and safe-range contract SHALL govern
transport/storage conversion; no binary-float arithmetic, silent rounding,
ambiguous separator stripping or default-USD inference. Currency SHALL NOT change
with display locale. Ordinary amount editing SHALL preserve source identity,
currency and measurement meaning. Source-valid legacy zero remains distinguishable
and has no ratio; it SHALL NOT be blindly promoted into a new valid goal. Empty
input and stop-use SHALL NOT be encoded as zero.

**C08 — Prospective time semantics.** Ordinary changes SHALL create a new version
effective at the accepted source boundary, not backdate/rebase earlier periods.
Period-based goals SHALL carry exact start/end semantics and their source calendar;
date-only financial periods SHALL not shift with the viewer's timezone. Timestamp
events SHALL be stored as instants and displayed with relevant timezone context.
No automatic midperiod proration, future scheduling or retrospective correction
feature is implied. Earlier comparisons SHALL use an authorized qualified goal
version; when none exists, omit the ratio. Financial corrections SHALL still
flow through their owning effective fold. Changing a goal does not freeze money.

**C09 — Atomic command and concurrency.** An effective change SHALL atomically accept the exact
goal/policy revision, immutable new version/current head, attributed history and
durable operation receipt, or accept none. Permission revocation and Save SHALL
have an enforceable acceptance order: if revocation wins, reject Save; if Save
wins, retain that lawful change and reject later unauthorized changes. Competing
expected-version saves SHALL not both overwrite one head. A durable intent bound
to actor, subject, base revision and normalized payload SHALL deduplicate retries;
new transport keys SHALL not duplicate the same accepted effect. Reusing an
intent with changed payload SHALL fail. A no-op SHALL retain the head/history
unchanged and return a bounded operation outcome, not fabricate a revision.
Receipt readback SHALL require current appropriate read authority and never
reapply an old goal after a newer change.

**C10 — Separate audiences and consequences.** Saving, stopping or delegating a
goal SHALL NOT change the P21 Plan, P13/P16 money/commitments, public visibility,
P22 goal pin, coach grant, tasks, performance scores or notifications. Public use
SHALL adopt an exact compatible version through the normal prospective release;
source safety/incompatibility SHALL use existing suppression, not fallback zero.
Current source goals, historical versions, audit, counts, search, caches, exports,
documents and any future Storage copies SHALL each obey their actual audience.
Coach read-only remains read-only; earlier financial-period sharing grants no
automatic historical-goal access.

**C11 — Qualified progress.** Each comparison SHALL name its source metric,
scope including applicable source-owned Legal Entity, currency, period and basis.
P16 monthly-equivalent planning, dated expected
occurrences and P13 received facts SHALL remain distinct. Aggregate from the
qualified full source set, not the displayed list page. Do not sum expected plus
received, unlike currencies or overlapping project/campaign/fund goals. Missing,
incompatible or zero denominator SHALL produce no ratio. Over-goal support SHALL
remain numerically honest and create no spending, transfer, collection or target
increase. Goal history SHALL not silently re-interpret earlier performance.

**C12 — Optional Plan adoption.** Copy from approved Plan SHALL be a separate
explicit action requiring both exact Plan-projection read and target-goal write
authority. Review compatible amount/currency/scope and preserve exact immutable
Plan/version provenance. Hidden Plan details SHALL not leak through prefill or
labels. Later Plan changes may offer an authorized comparison; neither owner
SHALL live-synchronize or overwrite the other. Ordinary goal entry SHALL remain
useful without a Plan.

**C13 — Honest compact UI.** Staff SHALL see the saved effective subject mode and
its source, with explicit Save and conflict recovery. Missionaries SHALL see
Set/Edit only when currently eligible, otherwise a useful permitted view that
distinguishes Staff-managed policy from this person's absent editing permission.
The editor SHALL use existing shared UI, visible amount/currency/period,
only necessary fields, accessible labels/status/errors and phone/keyboard support.
An ordinary edit SHALL require one deliberate Save, not an approval queue or
repeated confirmation. No false required-state or dead “set a goal” prompt.

**C14 — Safe draft and recovery.** Unknown policy/source SHALL not become allowed,
Off or zero. Save-success copy SHALL require confirmed acceptance; a lost response
SHALL reconcile the same durable intent. Conflict SHALL preserve authorized input
and show the current value for deliberate review. Revocation SHALL remove actions
and protected draft/read content as appropriate. Cache keys and response admission
SHALL include current tenant/subject/authority context; same-user switching and
late responses SHALL not expose another context. No durable offline edit queue
or silent background Save is required.

**C15 — Authoritative success and secondary repair.** Goal acceptance SHALL not
depend on an optional notification/provider. Required business evidence SHALL
commit with the goal. Cache/projection refresh failure after commit SHALL be
reported as saved-but-refreshing/unavailable, not source failure or a fresh Save.
Refresh SHALL be repeatable from source versions and reject stale derived writes.
Use existing versioned invalidation/reconciliation; add a durable secondary
intent only where an actual owner effect requires one, not a new generic queue.

**C16 — Minimal durable history.** Record who changed the exact goal/policy,
accepted old/new version references, effective/recorded times and command outcome
in governed business history. Security audit SHALL separately capture permission
administration/denial with current trusted actor and context. Technical logs
SHALL use correlation IDs and safe error codes, not Plan detail, tokens, donor
data or full form payloads. Read-history rules SHALL not be broader than source
authority. Preserve references for released/history consumers; retention or
anonymization SHALL follow the actual owner purpose/legal hold, not an invented
financial or email retention period.

**C17 — Guarded migration and rollout.** Before enabling delegation, inventory
all reached writers/readers, retained goals and their known units/currency/scope.
Converge or fence legacy GraphQL/service RPC and scalar paths. Backfill only
provable source facts; quarantine ambiguous records for authorized review without
inventing zero, currency, period or permission. Add schema/contracts compatibly,
deploy enforcing server paths, qualify readers and mixed-version clients, then
enable by tenant. Old clients SHALL fail safely rather than bypass the setting.
Rollback SHALL retain accepted versions and current authority; it SHALL not
restore a weaker writer. A kill switch SHALL fence new edits without erasing goals.

**C18 — Bounded reads and measured performance.** Current cards/settings SHALL
use indexed exact tenant/subject/head lookups and set-based authorized projections;
history SHALL be paginated. Index all necessary referencing/query keys and measure
actual plans against large-tenant, many-project and long-history fixtures.
Preserve P12's logical R6 governance budget and documented safety exceptions;
do not perform per-card resolver calls or scan version history to find each head.
Select capacity/latency release budgets from actual workload evidence under
existing performance owners before launch; this review claims no unmeasured SLO.

**C19 — Repair and restore without new authority.** Native repair SHALL reconcile
accepted intent/current source, append correction evidence and rebuild derivatives;
it SHALL not require normal direct SQL edits. Restore SHALL fence affected writes,
protected reads, exports and publication until current permission/safety epochs,
source heads, receipts and publication references are
reconciled. A restored cache/snapshot SHALL not resurrect delegation or replay a
superseded edit. Backup access and policy remain governed; revoking editing is
not a promise to erase authorized prior disclosures or historical backups.

**C20 — Traceable bounded delivery.** D16 SHALL be mapped through glossary,
P28 goal ownership, P9 subject qualification, P12 policy/capabilities and affected
P13/P21/P22 contracts into explicit OpenSpec scenarios, design, tasks, tickets,
implementation and release evidence only at their authorized transitions. Every
eligible project goal family SHALL have an actual qualified owner command before
the UI offers editing. No new role engine, dependency, old CRM/stack integration,
approval inbox, formula builder or automatic outreach SHALL be added to satisfy A.
Claims of usability/security/readiness SHALL cite the completed proof below.

## Required proof and what has actually been tested

| ID  | Falsifiable acceptance outcome                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P01 | Staff-managed, Missionary-managed and inherited results render accurately; “optional” never creates required tasks, a hidden goal or a third permission truth.                                                                                                                     |
| P02 | Default change affects only inheriting typed subjects on later commands; explicit exceptions and existing amounts/history remain intact. Policy conflict cannot silently overwrite another administrator.                                                                          |
| P03 | Two missionaries on one project use one canonical goal; participation alone grants no edit. A missionary's personal exception does not alter another project's policy. One canonical goal shown through multiple contexts resolves the same management-policy scope.               |
| P04 | P28 assignment/project and P13 campaign/Designation targets route to their qualified owner commands; wrong-family/source IDs and duplicated canonical bindings are rejected.                                                                                                       |
| P05 | Policy administrators without amount rights cannot read/change goals; ordinary goal editors cannot change policy. Staff+missionary users receive the truthful result in their actual context, without cross-context union. Staff-managed and individual View only remain distinct. |
| P06 | Two tenants with matching-looking IDs/names cannot cross-read/write/reference data. Scope/actor/tenant spoofing and immutable-field mutation fail on all reached routes.                                                                                                           |
| P07 | Real anon/authenticated/authorized server/privileged paths, GraphQL, REST, RPCs and views preserve grants/RLS/projections. Old scalar writer cannot bypass staff-managed policy.                                                                                                   |
| P08 | Create/edit preserves one current head and immutable history; logical duplicates fail; source-valid coexistence of recurring and distinct special-gift goals succeeds. If offered, an owner-qualified stop action preserves history and independent pins.                          |
| P09 | Blank/zero/negative/nonfinite, excess precision, unsafe range and ambiguous locale inputs fail clearly without rounding; USD/JPY/three-decimal examples round-trip exactly.                                                                                                        |
| P10 | Midperiod change does not rebase prior targets or prorate by invention. Period boundary/timezone/leap-day fixtures retain exact source meaning.                                                                                                                                    |
| P11 | Two goal edits from the same head yield one winner and one conflict. Staff-policy and Save races in both orders have the specified admission result.                                                                                                                               |
| P12 | Lost response/repeated transport keys produce one revision/history effect; changed payload conflicts; no-op creates no false change; old receipt readback cannot overwrite a newer head.                                                                                           |
| P13 | Version/head/history/receipt failure rolls the whole source change back. Post-commit refresh failure preserves accepted goal and recovers without another source edit.                                                                                                             |
| P14 | Current recurring, dated expected and received progress use exact compatible source metrics; pagination, multi-currency and overlapping project/campaign displays do not distort totals.                                                                                           |
| P15 | Over-goal, missing/hidden/zero/ended/unavailable sources display truthful states; no NaN/infinity, fake 0%, cash promise or spending/transfer effect.                                                                                                                              |
| P16 | Allowed Plan adoption records exact provenance; denied/changed/incompatible Plan cannot leak or silently substitute. Later Plan change leaves the goal unchanged.                                                                                                                  |
| P17 | Internal edit/stop/policy change leaves finance, commitments, payments and released public goal pin unchanged. A separately authorized prospective release can adopt a compatible new version.                                                                                     |
| P18 | Coach/read-history/export/cache audiences do not expand after edit; an earlier financial-period grant alone cannot read an old Goal Version. Denied states do not disclose hidden subject or source facts.                                                                         |
| P19 | Phone/keyboard/screen-reader/zoom/slow-network journeys cover staff setting, Set/Edit/Save, read-only, validation, conflict and unknown response without data loss or misleading completion.                                                                                       |
| P20 | Representative staff and missionaries correctly identify who can edit, whether a goal is required, which subject changes and whether Save publishes. Any safety-critical misunderstanding requires design correction before release. No such user test is claimed today.           |
| P21 | Retained-data migration proves units/scope/currency before adoption; ambiguous legacy values do not become fabricated source facts. Old/new client/server combinations fail safely through activation and rollback.                                                                |
| P22 | Restore with stale policy/receipt/head evidence cannot enable an edit, disclose protected goal/history through reads/exports, replay a superseded effect or republish a target; current qualified authority can resume through normal recovery.                                    |
| P23 | Production-shaped indexed read/history tests and query instrumentation satisfy existing P12 budgets and chosen workload budgets; no growth to one resolver/full-history scan per visible card.                                                                                     |
| P24 | C01–C20 trace to owner changes and actual positive/negative tests, rollout and release evidence. Monitor thresholds have owners/responses; no ratification or probe result is labeled deployed implementation.                                                                     |

The [isolated probe](d16-evidence/postgres-probe/README.md) passed **25/25**
expected outcomes using PostgreSQL **17.11**, including four actual concurrent
session tests: same durable intent with different request keys, competing
expected-head edits, policy-Off-first, and Save-first. It also tested audit
rollback, scoped constraints, exact input boundaries, stale authority after
permission re-enable, superseded receipt behavior and unchanged public/finance sentinels.
It is a synthetic database model, not Core's goal schema or P12 resolver. Sentinel
rows do not prove real financial/public integrations. The actual Core/Supabase
role matrix, production concurrency paths, migration, accessibility, user study
and workload checks above remain implementation/release obligations. Backup
restore, no-op behavior and a separately read-authorized receipt endpoint were
not executed; the fixture's receipt path requires current edit permission.

Three independent synthesis reviews corrected individual read-only versus
Staff-managed copy, canonical policy scope across aliases, source Legal Entity,
conditional ending, no-op semantics, restore read fencing and proof wording.
The [verification record](d16-evidence/review-verification.json) checks document
structure, local references, unchanged founder brief, source/probe hashes and
cleanup evidence. The Q16 note's later answer/status update is recorded explicitly
as a research-snapshot change; governing owner files and executed probe remain
unchanged.

## Ordered synthesis and ownership reconciliation

1. **Before recording the amended decision:** retain selected A; replace vague
   On/Off/Optional copy with the founder-confirmed editing-only meaning.
   Setting a goal remains optional. The detailed control/default design and
   required amendments are now explicitly ratified. Record source boundaries. This report completes that decision work; no
   implementation detail is delegated back to the founder.
2. **Capture in the owner/spec design:** P28's typed goal/version/lifecycle,
   P9 assignment/project bindings, P12 subject policy and capability admission,
   and P13's bounded delegation where its goal is used. P21 explicit adoption
   and ADR0098/0123/P22 publication boundaries remain governing. P12 additive
   grants/coarse RLS are retained, not replaced by an imported vendor ACL model.
3. **Build the smallest reliable source path first:** exact money/identity
   constraints, atomic revision/audit/receipt, current policy fence and read
   projection. Fence the concrete legacy writer and broad legacy readers before
   exposing new permission controls. These are release prerequisites, not risks
   to defer to monitoring.
4. **Then complete the UI:** effective staff setting, goal card/editor and
   recovery states using the shared design system. Connect the same authority
   result to action visibility and server acceptance. Qualify phone/accessibility
   and comprehension with representative users; correct misleading copy before
   activation.
5. **Qualify and activate:** retained-data/mixed-version tests, actual role/API
   proof, controlled concurrency, owner metrics, query/load evidence and restore.
   Enable per tenant only after those gates. Forward repair preserves accepted
   history; disabling editing remains a safe operational control.

The incomplete P28 schema/source and legacy field-policy machinery are not
reasons to substitute a new mini-platform. They are specific source/owner work
needed to make the selected simple experience honest. Existing financial-owner
gates in the session remain in force; goal editing must not manufacture a
financial comparison whose source is still unqualified.

## Monitor only residual operational risks

These signals complement release prevention, not replace it. Owners are named
engineering/product responsibilities, not an assertion that a particular person
has been assigned. Thresholds are proposed operating rules, not measured rates.

| Signal                                                                                 | Threshold                                                                       | Owner                                      | Response                                                                                                                     |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Unauthorized/cross-tenant goal effect or raw protected read confirmed                  | **Any one confirmed occurrence**                                                | Identity/Access owner + P28 on-call        | Fence affected path/delegation, preserve evidence, assess affected audience and correct admission before reactivation.       |
| One logical intent produces multiple versions, or one goal has competing heads         | **Any invariant violation**                                                     | P28 data owner                             | Stop affected mutations; reconcile canonical source/history through governed repair; fix constraint/command before resuming. |
| Goal state differs from current source after a successful repair read                  | **One confirmed mismatch**                                                      | P28 projection owner                       | Invalidate/quarantine the derivative; show source-current/unavailable truth and investigate stale writer.                    |
| Goal/policy change lacks its required durable business audit                           | **Any committed change without evidence**                                       | P28 data owner + audit owner               | Fence affected mutation path; restore attributable evidence without rewriting original facts; fix co-commit.                 |
| Query instrumentation violates P12 R6 or finds per-card resolver growth                | **Any reproducible violation outside documented safety exceptions**             | Access/performance owner                   | Block rollout or bound the affected read; correct set-based query/index/projection and requalify.                            |
| User believes editing Off deletes the goal, or Save publishes/changes approved finance | **Any observed safety-critical misunderstanding in pilot/support reproduction** | Missionary experience product/design owner | Correct copy/interaction and repeat the affected comprehension test before broader activation.                               |

No new notification engine, periodic recertification job or analytics dependency
is required for this feature's monitoring. Use existing operational/audit and
support channels with privacy-safe identifiers.

## Final disposition

**Accept with required amendments.** Keep the founder's direct missionary
management choice and per-subject staff discretion. Make the setting's meaning
precise, retain one source-owned goal and give the user one truthful Save. The
complexity belongs in existing authorization and data integrity boundaries;
it should not become a complicated missionary workflow. The corrected wording
above and its required amendments are explicitly ratified. Implementation and
release qualification remain separate.
