# Phase 24 D26 — bounded Tenant external-review availability primary research

Date: 2026-08-28  
Status: research evidence for the Phase 24 Grill session  
Founder answer: **Bounded Tenant choice**  
Scope: external-review availability only; D25 remains fixed

## Research question

When every applicable source permits D25's exact-candidate external-review
path, should a Tenant be able to make that path available even while a qualified
internal reviewer exists, and how should that choice work without becoming
unsafe, confusing, or administratively brittle?

This document evaluates the founder's choice against current Core decisions,
current repository behavior, official primary sources, comparable products,
security practice, and accessible staff UX. It does not implement the feature
or reopen D25.

## Executive finding

**Disposition: Accept with required amendments.**

The founder's bounded Tenant choice is consistent with modern, proven practice
when it is implemented as a small, explicit three-state hierarchy:

1. Core's default is **Only when no internal reviewer is eligible**.
2. An independently authorized Tenant Website-policy manager may deliberately
   choose the stricter **Do not allow external review** or the more flexible
   **Allow external review as an option for source-approved changes**.
3. Each Site inherits the Tenant ceiling unless an authorized Site-policy
   manager chooses a stricter posture for that Site.
4. A Site can never be more permissive than its Tenant, and no Tenant or Site
   setting can override a source prohibition, an indeterminate eligibility
   result, or any D23–D25 safeguard.
5. The setting changes only whether authorized staff may deliberately begin a
   D25 invitation. It never sends, routes, approves, publishes, or grants access
   by itself.

That structure is modern because it combines:

- a deny-by-default posture and current per-request authorization;
- organization-level control with a narrower resource-level choice;
- least-privilege administration instead of broad administrator dependence;
- visible inheritance and explicit effective state;
- immutable policy versions and current policy re-evaluation; and
- purpose-limited external access rather than guest membership.

The external evidence does **not** prove that every nonprofit needs optional
external review. That remains a product judgment. It does show that centrally
bounded external collaboration, narrower child settings, explicit invitation
authority, and auditability are established practices. The exact Core decision
is stronger than many comparable products because D25 creates no standing guest
account or reusable resource permission.

## Fixed boundary: D25 is not reopened

D26 controls only the availability of the D25 action. The following D25 facts
remain unchanged:

- one active external invitation or accepted grant per exact candidate;
- one fresh invitation and grant for every candidate version;
- every applicable source must affirmatively permit external review;
- the reviewer is a verified, distinct nonmember human;
- the reviewer receives only the minimum source-certified projection;
- no Tenant membership, internal route, editing, export, re-delegation, or
  successor-candidate access;
- no Giving, Legal Entity, Stripe, settlement, bank, currency, receipt, ledger,
  accounting, donor, missionary, member-care, credential, or unrelated data;
- current eligibility, policy, candidate, identity, projection, expiry, and
  revocation are rechecked at every protected read and final command; and
- failure leaves the current website unchanged.

The governing record is
[ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md),
with the supporting
[D25 adversarial review](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
and
[D25 primary research](./phase-24-d25-candidate-scoped-external-reviewer-primary-research.md).

## Exact corrected D26 decision

The founder answer should be recorded with the following amendments.

### D26-R1 — one closed three-state Tenant policy lattice

The Tenant policy has exactly three ordered values, from most restrictive to
most permissive:

1. `external_review_prohibited` — **Do not allow external review**;
2. `recovery_only` — **Only when no internal reviewer is eligible**; or
3. `source_permitted_choice` — **Allow external review as an option for
   source-approved changes**.

The deliberate no-row bootstrap/migration state resolves to `recovery_only`.
A corrupt row, missing expected head, unknown code, unsupported version, broken
scope relationship, or otherwise unresolvable persisted state fails to
`external_review_prohibited` until repaired. Neither case is interpreted as
optional external disclosure.

This is a closed policy, not a rules builder, arbitrary expression, priority,
schedule, reviewer pool, source matrix, or list of exceptions.

### D26-R2 — recovery-only is the platform and migration default

Every existing and new Tenant starts in `recovery_only`. Rollout and backfill
must not infer opt-in from saved contacts, old invitations, current staff roles,
historical external reviews, broad administrator status, or an integration's
sharing configuration.

### D26-R3 — the Tenant chooses a ceiling; a Site may narrow only

The effective posture for one exact Tenant, environment, and Site is:

```text
effective posture = stricter_of(Tenant posture, Site explicit posture)

where Site posture is one of:
  inherit
  recovery_only
  external_review_prohibited
```

A Site stores only `inherit`, `recovery_only`, or
`external_review_prohibited`. It cannot store `source_permitted_choice`; that
posture is available only by inheriting the current Tenant ceiling. A Site
cannot select `recovery_only` when the Tenant prohibits external review because
that would widen the effective posture. This avoids dual ownership, copied
booleans, and a widening child override.

### D26-R4 — the policy is only one input to the D25 authorization result

External review is selectable only when the current server result is:

```text
all D25 gates pass
AND (
  effective posture is source_permitted_choice
  OR the complete current resolver proves zero eligible internal reviewers
)
AND effective posture is not external_review_prohibited
```

Partial, stale, timed-out, limit-exceeded, contradictory, failed, or unknown
internal-reviewer resolution is **indeterminate**, not zero. It cannot release
the recovery path.

### D26-R5 — source restrictions always win

The Tenant setting means “Core may offer D25 where every current source permits
it,” not “external review is permitted everywhere.” One nondelegable,
qualification-restricted, stale, or indeterminate applicable source blocks the
combined external path.

The UI must never summarize an opt-in Tenant as **External review enabled**
without the qualifier **for source-approved changes**.

### D26-R6 — enabling availability creates no external effect

Saving `source_permitted_choice` does not:

- invite or notify anyone;
- select a saved reviewer;
- create a grant, guest account, route, task, or Needs attention item;
- re-open an expired, canceled, replaced, revoked, or completed invitation;
- change an internal reviewer route;
- approve or publish a candidate; or
- change any public, Giving, or financial state.

An authorized staff member must still make a fresh, explicit D25 choice for one
exact candidate and review the disclosure summary before **Send invitation**.

### D26-R7 — internal review remains the ordinary visual default

When an eligible internal reviewer exists, Core leads with the current internal
review path. If optional external review is available, it appears as the clear
secondary action **Invite an external reviewer**. Core must not preselect,
remember, auto-suggest, or visually recommend an external person merely because
one was used before.

When zero internal reviewers is completely proved, the D25 recovery action is
promoted and explains why it is needed. When resolution is indeterminate, Core
shows a retry/repair state and no external action.

### D26-R8 — current facts, not invitation-time facts, determine continuing access

The effective posture and zero-internal proof are current authorization facts.

- Under `source_permitted_choice`, a newly eligible internal reviewer does not
  by itself invalidate an otherwise-current D25 grant.
- Under `recovery_only`, the appearance of an eligible internal reviewer ends
  the recovery condition and therefore ends favorable external access.
- Under `external_review_prohibited`, no D25 invitation or accepted grant is
  favorable, regardless of internal-reviewer availability.
- Narrowing the Tenant or Site posture immediately makes every pending or
  accepted D25 path that no longer passes the effective current predicate
  inert through current policy-head/epoch reproof. Idempotent lifecycle
  reconciliation then records the policy-ended state; it never delays denial.
- Completed decisions remain immutable history. A later policy change never
  fabricates, erases, or retroactively reinterprets the actor or result.

These consequences follow D25's already accepted rule that current policy and
authorization changes end favorable access. D26 does not create a
prospective-only authorization loophole.

### D26-R9 — no hidden reactivation

If a policy narrows and a D25 path becomes ineligible, later widening does not
revive its invitation, credential, grant, session, or link. Staff must issue a
fresh invitation for the still-current candidate after all checks pass.

This intentionally differs from products that retain dormant item permissions
and silently make them effective again when a parent sharing switch is
re-enabled.

#### Current ceiling versus prospective-only policy

Three transition semantics were evaluated:

1. **Current ceiling — adopted.** Every protected read and final command uses
   the current effective Tenant/Site posture. Narrowing immediately denies
   incompatible pending/accepted paths and triggers durable lifecycle
   reconciliation; widening never auto-invites or resurrects them.
2. **Prospective-only narrowing — rejected.** Existing grants would continue
   even after the Tenant says external review is prohibited or recovery-only no
   longer applies. Staff could not truthfully understand the current policy,
   and D25's current-policy reproof would be bypassed.
3. **Dormant permission that resumes after widening — rejected.** SharePoint
   and Google document variants of this behavior for item links/permissions.
   It can be appropriate for general file collaboration, but it is unsafe and
   surprising for a one-candidate authorization credential.

The current-ceiling approach is stricter than general collaboration products
but proportionate here: a candidate grant is short-lived and replaceable, the
current website remains active, completed history is preserved, and a fresh
invitation remains available if policy later permits it.

### D26-R10 — policy writes are explicit, privileged, stepped-up, and audited

Changing the Tenant policy requires a dedicated, registry-owned Tenant
Website-policy capability, current Active Tenant Assignment, appropriate fresh
assurance, and a server-derived Tenant/environment context. Changing a Site
override requires a distinct Site-scoped policy capability and current exact
Site scope.

Neither action should require a universal second approver, typed phrase, due
date, reason essay, or support intervention. Core is designed for small
ministries; one independently authorized human with fresh assurance, explicit
impact, and durable audit is proportionate. A source may still own a stronger
requirement for its own consequence.

The exact capability identifiers are not yet settled and must come from the
Phase 12 capability registry before implementation.

### D26-R11 — every save uses an expected policy head

Tenant and Site saves use compare-and-swap against the exact policy-head and
governance epoch shown to the staff member. Two concurrent managers cannot
silently overwrite each other. The losing save receives the current policy,
actor-safe change summary, and a fresh impact preview.

### D26-R12 — widening and narrowing have different UX consequences

Widening to optional from either stricter posture shows:

- the exact scope affected;
- that internal review remains ordinary;
- that external review is still source- and candidate-gated;
- what external reviewers can and cannot see/do; and
- **This does not send an invitation**.

Narrowing shows the count of currently active invitations/grants that will
lose access, grouped only by Sites/candidates the manager may see. The save
action names the consequence, for example **Use recovery-only and revoke 2
external reviews**. Hidden items contribute to a privacy-safe count without
leaking names or content.

No confirmation is needed when the effective result does not change or no
current path is affected. Core should not train staff to click through routine
warning dialogs.

### D26-R13 — inheritance is always visible

Tenant and Site settings must show all three facts separately:

- **Tenant choice**;
- **Site choice** (`Uses Tenant setting` or `Only when needed`); and
- **Effective for this Site**.

Authorized staff must not have to infer inheritance from a disabled switch.
Staff who may view but not manage policy see the effective state and a safe
owner/handoff action, not a misleading editable control.

### D26-R14 — availability, invitation, and review are separate histories

The authoritative histories remain distinct:

1. Tenant/Site availability-policy versions;
2. D25 invitation/grant lifecycle;
3. delivery/provider outcomes;
4. projection access;
5. reviewer decision; and
6. source-owned public effect.

A policy change never mutates a D25 invitation row into a different meaning,
and an invitation never becomes proof of the Tenant policy.

### D26-R15 — environment is explicit in authority, quiet in ordinary UX

Phase 24 and D25 bind protected behavior to an exact environment. Policy
storage, enforcement, audit, cache identity, and command fencing therefore
must include the exact environment. The ordinary UI may omit an environment
selector where the current Web Studio context already proves it, but must show
the environment in impact confirmation whenever confusion with Production is
possible.

No policy silently propagates from preview/staging into Production.

### D26-R16 — no new product category

D26 does not create:

- a generic external-sharing center;
- an external reviewer marketplace or approval directory;
- custom policies per source, locale, reviewer type, or person;
- an allow/block email-domain system;
- automatic reviewer routing, email reminders, SLA, escalation, or schedule;
- reusable guest membership or workspace access; or
- Giving or finance policy.

## Why this is consistent with Core

### Repository facts

1. [Platform principles](../../../openspec/specs/platform-principles/spec.md)
   make tenant safety and permission correctness outrank convenience and require
   a coherent, trustworthy product experience.
2. [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
   require tenant isolation, server-side sensitive operations, role-scoped
   surfaces, and Tenant-controlled publication boundaries.
3. Phase 12 defines one server-side Policy Decision Point and a server-derived
   Tenant Authorization Context. D25 requires a new candidate-review context;
   a browser-selected Tenant or Site cannot be trusted.
4. Phase 17 already uses explicit inherited-versus-custom policy presentation,
   future resolution, version pins, impact previews, and source-fixed policies
   that Tenant choice cannot override.
5. D21 already establishes the Core UX grammar for **Uses Tenant Website
   reviewers**, an explicit Site override, a safe effective summary, and
   separate prospective/current-work handling.
6. D23 defines source-owned proportional review requirements and says Tenant
   policy may strengthen but never weaken the source floor.
7. D25 and [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
   define exact-candidate, one-human, minimum-projection review with no standing
   access.
8. Root [AGENTS.md](../../../AGENTS.md), the frontend rulebook, and
   `packages/ui/AGENTS.md` require Base Maia, Base UI, semantic tokens, shared
   `@asym/ui` primitives, mobile/reflow quality, and permission-safe server
   boundaries.
9. A current repository search finds no runtime implementation, schema,
   `CandidateReviewAuthorizationContext`, saved reviewer model, or external-
   review setting under `apps`, `packages`, `supabase`, or merged OpenSpec.
   Existing static Teams and settings UI are not an authority model for D26.

### External primary-source facts

#### OWASP: least privilege, default deny, and every-request checks

The [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
recommends least privilege, explicit deny-by-default behavior, authorization on
every request, safe failure, logging, and authorization tests. This supports
recovery-only as the default and current evaluation of policy/source/candidate
facts. It does not prescribe Core's three labels or Site hierarchy.

#### Microsoft SharePoint: organization ceiling with narrower Site choice

Microsoft documents organization- and Site-level external-sharing settings.
The Site's available choices depend on the organization setting, and Site
administration is restricted to an appropriate administrator. See
[Change external sharing for a Site](https://learn.microsoft.com/en-us/sharepoint/change-external-sharing-site)
and
[SharePoint modern sharing and permissions](https://learn.microsoft.com/en-us/sharepoint/modern-experience-sharing-permissions).

This is strong evidence for a Tenant ceiling with a narrower Site setting. It
is not evidence that Core should copy SharePoint's broad Site/file guest model.

Microsoft also documents that disabling organization sharing stops links but
re-enabling it can restore the prior Site setting and make old links work
again. That is a negative precedent for D26: D25 credentials and grants must be
revoked, not left dormant for hidden reactivation.

#### Google Workspace: higher-level restrictions override child sharing

Google documents that shared-drive restrictions override file/folder sharing
and that changing the higher-level restriction updates effective access. See
[How file access works in shared drives](https://support.google.com/a/users/answer/12380484).
Google likewise documents that old direct permission can remain stored and
become effective again if external sharing is later re-enabled. Core should
adopt the restrictive hierarchy but reject dormant authorization revival.

Google's
[Drive log events](https://support.google.com/a/answer/4579696)
let administrators identify externally shared items and external user actions.
This supports first-class external-access audit and monitoring, not reliance on
provider delivery logs.

#### Microsoft Entra: separate invitation authority and least-privilege roles

Microsoft's
[external collaboration settings](https://learn.microsoft.com/en-us/entra/external-id/external-collaboration-settings-configure)
separate who may invite guests from what guests may see, support restricted
inviter roles, and recommend least-privilege administration. Entra also emits
guest sign-in and audit records. This supports a dedicated policy-management
capability and separate D25 invitation capability. Core must not inherit
Entra's standing directory-guest model.

#### Salesforce: external access can be more restrictive, not more permissive

Salesforce's
[External Organization-Wide Defaults](https://help.salesforce.com/s/articleView?id=security_owd_external.htm&language=en_US)
allow external authenticated users to have more restrictive defaults than
internal users; external access cannot be more permissive than the internal
ceiling, and private is the recommended starting point for nonpublic records.
This supports a restrictive external baseline but not Core's exact reviewer
workflow.

#### Contentful: environment-scoped access and migration caution

Contentful documents explicit environment access, a restrictive master-only
default, and a 2026 migration toggle intended to avoid unexpectedly changing
existing permissions. See
[Contentful environment permissions](https://www.contentful.com/help/environments/environments-permissions/).
This supports environment-aware authority and an explicit safe migration. Its
standing roles are broader than D25 and should not be copied.

#### Blackbaud: visible invitation lifecycle, but standing role access

Blackbaud exposes invitation status and explicit **Resend invite** and **Cancel
invitation** actions, then grants feature access from assigned roles after
acceptance. See
[Blackbaud invitations](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/sec-invi.html)
and
[Blackbaud roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-role.html).
The lifecycle labels support D25/D26 clarity; the persistent user/role model is
the wrong authority shape for an exact-candidate Core reviewer.

#### Slack: external people are visibly labeled and centrally manageable

Slack provides an
[External people dashboard](https://slack.com/help/articles/5682545991443-Use-the-Slack-Connect-external-people-dashboard)
for authorized owners/admins to inspect and disconnect external people, and it
marks external conversations separately. This supports visible external status
and accountable management. Slack channels and DMs remain much broader than a
D25 review projection.

#### W3C: predictable controls, radio semantics, reflow, status, targets

- [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) says a
  setting change must not cause an unexpected context change. D26 therefore
  uses an explicit save, not an auto-saving switch with hidden revocation.
- The [WAI-ARIA radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
  defines expected names, checked state, and keyboard behavior for mutually
  exclusive choices.
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow) supports a
  one-column 320-CSS-pixel experience without loss of information or function.
- [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  requires important asynchronous save/error results to be programmatically
  available without needlessly moving focus.
- [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  establishes a 24-by-24-CSS-pixel minimum or qualifying spacing. Core should
  continue using its larger shared touch-target controls.

### Explicit evaluation: two states or three?

The initial D26 candidate used only `recovery_only` and optional choice. That is
not sufficient after adversarial review.

#### Evidence for a Tenant-level prohibition

- SharePoint permits the organization to prevent external sharing, and Site
  options cannot exceed the organization setting.
- Google shared-drive and administrator restrictions can prevent external
  sharing even when an item-level permission exists.
- Microsoft Entra permits administrators to set guest invitation to **No one**
  and separately restrict what guests can see.
- Salesforce keeps external defaults more restrictive than internal access and
  fixes unauthenticated guest access to private.
- OWASP's deny-by-default guidance requires an explicit restrictive outcome;
  absence of a capability is not a transparent, auditable Tenant policy.

These sources do not prove Core's exact labels, but they consistently establish
that an organization owner can prohibit external collaboration instead of being
forced to retain a recovery path.

#### Compatibility with D25

D25 says Core **permits** one source-authorized exact-candidate external review
path; it does not say every Tenant must allow external disclosure. A Tenant
prohibition therefore governs whether D25 may be used without changing D25's
identity, projection, grant, or lifecycle model. The recovery-only default
still preserves the founder's low-friction small-team path for every Tenant that
does not deliberately opt out.

#### Why capability absence is not enough

Treating “nobody currently has the invite capability” as prohibition would be
brittle:

- a later role edit could enable external sharing without an intentional
  Website-policy decision;
- staff could not distinguish organization policy from incomplete setup;
- Site inheritance could not be explained or constrained; and
- audit could not answer whether external review was deliberately prohibited.

The prohibition must therefore be a first-class, versioned Tenant policy state,
not an emergent result of current role assignment.

#### Why not four or more states

Source-specific prohibitions, identity assurance, projection safety, and
qualification already belong to their source/D25 owners. Adding modes such as
“saved contacts only,” “specific domains,” “board members,” or “selected
sources” would duplicate those owners and create a policy builder. Three states
are the smallest complete lattice:

```text
external_review_prohibited
  < recovery_only (default)
  < source_permitted_choice
```

**Conclusion:** adopt the three-state lattice. It is more governable and no
less usable because recovery-only remains the default, policy opt-in/out sends
no invitation, and a Site can choose only a stricter effective state.

### Product judgments derived from the evidence

These are reasoned Core decisions, not externally proven facts:

1. `recovery_only` is the best default because it avoids automatic disclosure
   while preserving D25's small-team recovery without setup.
2. A three-choice radio group is clearer than a switch because prohibition,
   recovery-only, and optional use are three materially different policies.
   A switch cannot explain the middle state.
3. Internal review should remain visually primary when available; optional
   external review should be explicit but not hidden.
4. Site narrowing should use the same closed lattice below the Tenant ceiling,
   not a source-by-source policy builder.
5. Revoked candidate grants should never silently reactivate when a policy is
   widened later.
6. A policy change should not require a universal second approver; fresh
   assurance, exact capability, impact preview, and audit are proportionate for
   small ministries.
7. External-review policy belongs with Website review/publication settings, not
   People/Teams, Giving, Integrations, or general security, because it governs
   when one Website candidate may use D25 rather than who is a Tenant member.

### Assumptions requiring product validation

- Some Tenants genuinely use qualified board, legal, language, accessibility,
  or denominational reviewers who are not staff. This is plausible but not yet
  proven by Core user research.
- Website-policy managers will understand **Only when needed** and **Allow as
  an option** better than technical terms such as “fallback” and “delegated
  reviewer.” Moderated usability testing must verify the labels.
- Most Tenants will keep the recovery-only default. Production data is required
  before capacity or operational conclusions.
- The current Web Studio information architecture can add a **Review &
  publishing** setting without creating a second general settings center. The
  exact route should be validated against the Phase 24 implementation design.

## Recommended Core UX/UI

### Information architecture

Use two coherent locations:

1. **Mission Control → Web Studio → Website settings → Review & publishing**
   owns the Tenant policy.
2. **Websites → [Site] → Settings → Review & publishing** shows inheritance and
   permits the narrow Site override.

Do not place D26 under **People**, **Teams**, **Roles**, or **External users**.
That would imply membership or standing access. Do not place it under Giving or
finance; those domains are outside D25/D26.

The eventual UI must compose existing `@asym/ui` Base UI/Base Maia primitives,
semantic tokens, PageShell/Card/Alert/RadioGroup/Dialog/Sheet patterns, and Core
focus/status behavior. This document specifies the information and behavior,
not a new app-local component system.

### Tenant settings card

Recommended text:

```text
External review

Choose when staff may invite a verified person outside Hope Ministries to
review one protected website version. External reviewers never become staff
and cannot edit your website or access Giving or other records.

○ Do not allow external review
  Staff must use an eligible reviewer from Hope Ministries. Protected changes
  remain safely pending when no internal reviewer is available.

● Only when no internal reviewer is eligible (recommended)
  Core offers external review only when it can prove no qualified person in
  Hope Ministries can perform this review.

○ Allow as an option for source-approved changes
  Authorized staff may choose an external reviewer even when an internal
  reviewer is available. Each invitation still covers one version only.

This does not send an invitation.

[Save review policy]
```

Use a labelled fieldset/radio group, not a lone toggle. Selecting a radio only
updates the unsaved form. The explicit button performs the privileged save.
Dirty state, saving, success, stale-policy, and authorization-loss states are
visible in text and announced appropriately.

### Widening impact panel

When Maria selects **Allow as an option**:

```text
What will change

• Internal review remains the normal choice.
• Staff may invite one external reviewer for a source-approved version.
• Every invitation shows exactly what the reviewer can see and do.
• No invitation or access is created by saving this setting.

Applies to 6 Production websites. Sites may use a stricter setting.

[Allow optional external review] [Cancel]
```

If Maria's session already meets the required assurance, reuse it. Otherwise,
embed the existing step-up at the final save. Do not add a second confirmation
after successful step-up.

### Narrowing impact panel

When narrowing affects current external access:

```text
Use external review only when needed?

2 current external reviews will lose access because an internal reviewer is
available. Completed reviews and the current website will not change.

• hope.org — French default review
• relief.hope.org — Navigation review

[Use recovery-only and revoke 2 reviews] [Keep current setting]
```

Moving from recovery-only or optional choice to **Do not allow external
review** uses the same impact pattern, but includes every current external path
in scope because internal-reviewer availability is irrelevant under
prohibition. If this creates protected candidates with no eligible review path,
show that truthful count and explain that the current website remains active;
do not block the policy choice or imply Core can approve around it.

Only disclose rows Maria may see. Otherwise say, for example, **2 additional
reviews you cannot view will also lose access**. Never reveal reviewer identity,
candidate text, protected reason, or Site names through an impact count the
actor cannot independently see.

### Ordinary inheriting Site

```text
External review

Uses Hope Ministries setting
Allow as an option for source-approved changes

This Site can use a stricter setting without changing other websites.

● Use Hope Ministries setting
○ Only when no internal reviewer is eligible for this Site
○ Do not allow external review for this Site

[Save Site policy]
```

### Site when the Tenant is recovery-only

Do not render a disabled optional choice that looks broken:

```text
External review

Only when no internal reviewer is eligible
Set by Hope Ministries

External review becomes available only after Core proves this Site has no
eligible internal reviewer.

● Use Hope Ministries setting
○ Do not allow external review for this Site

[Save Site policy]
```

An authorized Site-policy manager may prohibit external review for this Site
but cannot expose the optional choice. A read-only viewer sees the effective
state and, when independently permitted, **View organization policy**. A user
without that visibility receives a safe **Ask a Website administrator** handoff
rather than names or capabilities they may not enumerate.

### Site when the Tenant prohibits external review

```text
External review

Not allowed by Hope Ministries

Reviewers for this Site must be eligible members of Hope Ministries. If no
internal reviewer is available, the protected version remains safely pending
and the current website stays live.

[View organization policy]
```

Do not show **Invite an external reviewer**, saved external contacts, or a
disabled external-review picker in the candidate flow. The policy status and a
lawful internal-route repair action remain visible to authorized staff.

### Candidate journey when optional review is available

```text
Ready for independent review

Ana García can review this version for Hope Ministries.

[Request internal review]
[Invite an external reviewer]
```

The external action opens the D25 sheet:

1. **Choose reviewer** — search Previously used reviewers or add a new person.
2. **Review access** — exact organization, Site, locale, candidate, expiry,
   visible projection, allowed actions, and unchanged current website.
3. **Send invitation** — one deliberate effect.

Previously used reviewers carry an **External** text badge. Selection never
claims **Approved**, **Trusted**, **Qualified**, or **Has access**. Do not sort a
person to the top solely because they were used most recently; ordinary search
and an accessible recent section are enough.

### Candidate journey in recovery-only mode

When zero eligible internal reviewers is completely proved:

```text
Another reviewer is needed

Everyone currently qualified to review this version helped prepare it. You may
invite one verified person outside Hope Ministries to review only this version.
The current website stays live while they review.

[Invite an external reviewer]
[Keep the current website]
```

When proof is indeterminate:

```text
Reviewer availability could not be confirmed

Core has not proved that no internal reviewer is available, so external review
cannot start yet. Your website and prepared version are unchanged.

[Try again]
[Review Website reviewers]
```

Never translate “resolver failed” into the friendlier but false “no reviewer.”

### Policy changes during an open invitation

- If the final send command observes a newer restrictive policy, preserve the
  candidate and reviewer selection locally, return focus to the inline policy
  message, and offer the lawful internal path. Do not send.
- If the external reviewer is currently viewing when policy narrows, the next
  read fails safely and the page shows **This review is no longer available**.
  No candidate content remains in client caches or back navigation.
- Staff see **Access ended because the Website review policy changed**, with
  the next lawful action. Do not mislabel it **Canceled by reviewer**.
- Widening later offers a fresh invitation action; it does not resurrect the
  old one.

### Accessibility, mobile, localization, and low bandwidth

- Use native fieldset/legend semantics or the established Base UI RadioGroup
  with visible labels and programmatic descriptions.
- Radio, Save, Cancel, impact, and handoff controls follow Core touch-target and
  focus-visible behavior; no icon-only security actions.
- At 320 CSS pixels, cards and impact rows stack in one column. Candidate names,
  Unicode person names, Sites, locales, long translated labels, and time-zone
  text wrap without horizontal scrolling.
- No meaning relies on color, lock icons, badges, indentation, hover, or avatar.
- Saving, stale-policy, revoked-access, and successful update messages are
  programmatically announced without moving focus unnecessarily.
- A destructive narrowing dialog receives initial focus on its title or safe
  action according to the shared dialog pattern, traps focus, closes with
  Escape before commit, and restores focus to the triggering control.
- Localize staff copy through Core message ownership. Store policy codes, never
  translated labels. Do not machine-translate source-certified reviewer
  evidence and treat it as authoritative.
- Retry is idempotent. A slow or lost response resolves from the authoritative
  command receipt and current policy head; the UI never asks staff to guess
  whether a policy changed.
- No offline final save or external invitation. Draft radio selection may stay
  local, but authority changes only after the confirmed server receipt.

## Source of truth and data boundary

### Authority matrix

| Fact                              | Authoritative owner                                 | Derived presentation                 | Never authoritative                |
| --------------------------------- | --------------------------------------------------- | ------------------------------------ | ---------------------------------- |
| Tenant availability posture       | Site/Website policy owner, immutable version        | settings summary                     | browser, Site row copy, invitation |
| Site narrow override              | Site policy owner, immutable version                | inherited/effective label            | Tenant cache, page content         |
| Effective posture                 | one server resolver over current heads              | candidate action availability        | UI toggle, stale token             |
| Source external-review permission | consequence-owning source                           | reason-safe availability             | Tenant/Site policy                 |
| Internal reviewer result          | Phase 12 + source qualification                     | released/released-zero/indeterminate | route member count                 |
| Candidate grant                   | D25/Phase 12 Candidate Review Authorization Context | reviewer surface                     | saved contact, policy setting      |
| Reviewer identity                 | CRM/Party stable-human owner                        | minimum display identity             | email string alone                 |
| Candidate/review/public effect    | consequence-owning source                           | status projection                    | policy audit, invitation delivery  |
| Policy change actor/evidence      | append-only command receipt                         | authorized history                   | application log only               |

### Recommended conceptual relational shape

Exact names remain design work, but implementation should preserve:

1. immutable Tenant policy versions keyed by Tenant + environment + revision;
2. one current Tenant policy head per Tenant + environment;
3. immutable Site policy versions keyed by Tenant + environment + Site +
   revision, with only `inherit`, `recovery_only`, or
   `external_review_prohibited`;
4. one current Site policy head per Tenant + environment + Site;
5. append-only policy command receipts with server-derived actor, scope, prior
   head, successor head, assurance, governance epoch, and safe impact digest;
6. D25 invitation/context rows reference or bind the exact effective policy
   generation/epoch used at acceptance and re-evaluate the current head on each
   protected request; and
7. no copied saved-contact, source-permission, internal-route, candidate-body,
   or public-state truth in policy rows.

A single mutable `settings` JSON document would make constraints, history,
expected-head concurrency, narrow-only Site behavior, indexes, and audit much
harder to prove. A generic “policy engine” would be unnecessary overengineering
for three modes and one subtract-only override.

### Required database constraints

- UUID primary keys and explicit non-null Tenant/environment scope.
- Same-scope composite foreign keys or equivalent trusted validation prevent a
  Site/policy/revision from crossing Tenant or environment.
- Closed enum/check constraints admit only Tenant
  `external_review_prohibited`, `recovery_only`, or
  `source_permitted_choice`, and Site `inherit`, `recovery_only`, or
  `external_review_prohibited`.
- The effective resolver selects the stricter Tenant/Site value. No
  denormalized child rewrite is required when the Tenant changes.
- One unique current head per exact scope; revision numbers are monotonic within
  their scope and never caller-assigned.
- Restrictive delete behavior preserves policy and command history; Site
  retirement ends authority but does not erase evidence.
- Indexes cover current Tenant head, current Site head, reverse impact for
  active D25 contexts, policy history pagination, and repair/reconciliation.
- Policy and D25 writes remain short local transactions with no email/provider
  call inside the transaction.

### RLS and authorization requirements

- Enable and force RLS on policy, head, impact, and command-receipt tables.
- Browser roles receive no direct write privilege. Privileged writes cross a
  `packages/api` command boundary.
- Read policies expose only exact current Tenant/environment/Site scopes and
  purpose-safe summaries.
- Mutation policies and RPCs enforce both row visibility and admitted new state;
  an authorized update cannot move a row to another Tenant, environment, Site,
  actor, policy type, or head.
- `USING` and `WITH CHECK` behavior is tested for insert/update/delete as
  applicable; direct table, PostgREST, view, RPC, worker, service-role, repair,
  import, support, impersonation, and migration paths enforce the same invariant.
- Tenant, environment, actor, Active Tenant Assignment, Site, current heads,
  capability, assurance, governance epoch, and audit attribution come from
  trusted server context, never caller fields.
- Any security-definer helper uses schema-qualified objects, a fixed empty or
  controlled search path, least privilege, revoked public execution, and
  positive/negative database proof.
- Cache keys include Tenant, environment, Site, Tenant policy head, Site policy
  head, source-policy generations, and authorization epoch. A cache hit cannot
  outlive a narrowing policy change.

## Lifecycle, concurrency, and failure model

### Policy lifecycle

```text
deliberate no-row bootstrap/migration
  -> effective recovery_only

corrupt / unknown / unresolvable persisted state
  -> fail-closed external_review_prohibited until repaired

recovery_only
  -> external_review_prohibited (explicit privileged narrow)

external_review_prohibited
  -> recovery_only (explicit privileged widen)

external_review_prohibited
  -> source_permitted_choice (explicit privileged widen)

recovery_only
  -> source_permitted_choice (explicit privileged widen)

source_permitted_choice
  -> recovery_only (explicit privileged narrow + impact/revocation)

source_permitted_choice
  -> external_review_prohibited (explicit privileged narrow + impact/revocation)

Site inherit
  -> Site recovery_only (explicit narrow)

Site inherit / Site recovery_only
  -> Site external_review_prohibited (explicit narrow)

Site recovery_only
  -> Site inherit (effective result becomes the current Tenant posture)

Site external_review_prohibited
  -> Site recovery_only or inherit only when the current Tenant ceiling admits
     the resulting effective posture
```

Every transition creates a new immutable version and command receipt. There is
no edit-in-place, scheduled change, draft policy workflow, temporary exception,
person-specific override, or automatic rollback.

### Transition consequences

| Event                                                  | Correct result                                                                                                                                 |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant widens                                          | future/current candidates may show secondary external action after fresh resolution; no invite/grant created                                   |
| Tenant narrows                                         | new policy head/epoch immediately denies now-inadmissible D25 paths; lifecycle evidence reconciles idempotently; current public Site unchanged |
| Site narrows                                           | same behavior for that Site only                                                                                                               |
| Site returns to inherit while Tenant optional          | effective optional posture after save; no old D25 path reactivates                                                                             |
| Tenant narrows while Site says inherit                 | Site immediately inherits the new stricter effective posture without a child rewrite                                                           |
| Tenant widens while Site override is recovery-only     | Site remains recovery-only                                                                                                                     |
| Tenant or Site prohibits                               | every active D25 path in that effective scope ends, regardless of internal-reviewer availability                                               |
| Tenant widens from prohibited to recovery-only         | no external path appears until proved-zero internal resolution; no old path reactivates                                                        |
| internal reviewer becomes eligible under recovery-only | active recovery grant ends on current re-evaluation                                                                                            |
| internal reviewer becomes eligible under optional      | active grant may continue if every other D25 fact remains current                                                                              |
| source withdraws support                               | active path ends regardless of Tenant/Site setting                                                                                             |
| two managers save                                      | one expected-head transition wins; loser sees current truth and recomputes impact                                                              |
| response is lost                                       | same semantic command key returns the existing receipt; no duplicate policy or revocation                                                      |
| completed review exists                                | history remains; no retroactive invalidation or republication                                                                                  |

### Atomicity

One narrowing command must atomically:

1. reauthorize the exact manager and scope;
2. compare the expected policy head/governance epoch;
3. compute a permission-filtered impact summary and safe impact digest from
   current facts;
4. append the policy version and command receipt;
5. advance the policy head; and
6. append one durable reconciliation/outbox obligation keyed to the old and new
   policy heads.

The new head/epoch makes every incompatible context fail authorization
immediately, without synchronously locking or updating an unbounded Tenant-wide
set. An idempotent reconciler appends per-context **Ended by policy** evidence
and presentation cleanup. If the policy head/receipt/reconciliation obligation
cannot commit, none of the policy change commits. Message dispatch and staff
notification, if any, follow through recoverable outbox work and do not define
authority.

## Adversarial edge cases

| Edge case                                             | Required behavior                                                                                                            |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Deliberate no-row migration/default                   | recovery-only; no opt-in inferred                                                                                            |
| Expected policy head missing or corrupt               | fail prohibited; visible repair state to authorized manager                                                                  |
| Unknown future policy code                            | fail prohibited; no D25 action                                                                                               |
| Site override points across Tenant                    | constraint/RLS rejection; security signal                                                                                    |
| Tenant optional, Site recovery-only                   | recovery-only at that Site                                                                                                   |
| Tenant optional, Site prohibited                      | no D25 action at that Site; active D25 paths end                                                                             |
| Tenant recovery-only, Site prohibited                 | no D25 recovery action at that Site                                                                                          |
| Tenant prohibited, stale Site recovery/optional cache | prohibition wins at current server resolver                                                                                  |
| Tenant prohibited, zero eligible internal reviewers   | protected candidate remains pending; current website stays live; no D25 invite                                               |
| Tenant recovery-only, stale Site optional cache       | server denies; cache evicted by policy epoch                                                                                 |
| Internal reviewer resolver times out                  | indeterminate; no recovery path                                                                                              |
| Some but not all internal reviewers resolve           | partial is not zero; no recovery path                                                                                        |
| Source A permits, source B forbids                    | combined external path blocked with safe source-led explanation                                                              |
| Saved external contact exists before opt-in           | contact remains authority-free; no action until policy/source/candidate permit                                               |
| Staff starts external sheet, policy narrows           | final send denied; selection preserved locally; lawful next step shown                                                       |
| Policy narrows while reviewer reads                   | next read denies and purges protected cache; current Site unchanged                                                          |
| Policy narrows during final review command            | one fence wins; stale command has no public effect                                                                           |
| Policy widens after revocation                        | no old credential/grant/session resurrection                                                                                 |
| Tenant manager loses capability during save           | deny before commit; no partial policy/revocation                                                                             |
| Support impersonates manager                          | governed support boundary applies; no implicit policy capability                                                             |
| Administrator has broad unrelated rights              | no D26 capability means read-only/hidden action                                                                              |
| Two tabs save opposite choices                        | expected-head CAS; losing tab refreshes current truth                                                                        |
| Two Sites share a host or content reference           | Site identity and policy remain exact; no host/name-based inheritance                                                        |
| Site is cloned                                        | destination Site inherits destination Tenant policy; no copied override unless explicitly imported under a ratified contract |
| Site transfers Tenant                                 | old policy/active D25 paths end; destination re-resolves; no cross-Tenant copy                                               |
| Site retires                                          | no new D25 path; active grants end; history retained                                                                         |
| Environment is cloned/promoted                        | no implicit Production opt-in; exact destination policy required                                                             |
| Locale changes mid-review                             | D25 candidate/projection currentness decides; D26 does not broaden scope                                                     |
| Candidate superseded                                  | old grant ends; new candidate requires fresh invitation                                                                      |
| Identity merge/split                                  | current stable-human proof reruns; ambiguous identity blocks                                                                 |
| Reviewer becomes Tenant staff                         | D24/D25 eligibility is recomputed; no automatic conversion to internal route                                                 |
| Internal reviewer leaves under recovery-only          | external recovery may become available only after complete proved-zero resolution; no auto-invite                            |
| Internal reviewer is added under recovery-only        | current recovery grant ends; staff see internal next action                                                                  |
| Internal reviewer is added under optional             | existing grant remains only if all D25 checks pass; future staff still choose deliberately                                   |
| Impact count includes hidden Site                     | show aggregate hidden count only; no names/content                                                                           |
| No active grants are affected by narrowing            | concise save; no alarming destructive dialog                                                                                 |
| Provider email delivery is delayed                    | availability setting is unchanged; D25 lifecycle shows delivery truth                                                        |
| Browser retries a save                                | semantic idempotency returns same receipt                                                                                    |
| Service-role script bypasses UI                       | same resolver/policy/source invariants; no privileged shortcut                                                               |
| Policy cache is stale at CDN/browser                  | protected read/final command checks current server epoch; no favorable stale serve                                           |
| Long translated labels                                | wrap/reflow; no truncation as sole meaning                                                                                   |
| Right-to-left staff locale                            | logical layout/order; radio/help text and impact list remain coherent                                                        |
| Weak mobile network loses response                    | reconcile command receipt/current head before offering retry                                                                 |
| Audit sink unavailable                                | authoritative policy receipt remains local; policy commit follows repository's required audit-before-effect contract         |

## Strongest alternatives

### Alternative A — two states with no Tenant prohibition

Allow only recovery-only or optional external choice.

**Strength:** one fewer policy value and every Tenant retains D25 recovery for a
small-team dead end.

**Weakness:** it forces every Tenant to permit some external disclosure even if
its governance prohibits outsiders. Removing every invite capability is not a
safe substitute because a role change can silently alter the result and no
explicit policy/audit explains the organization choice.

**Assessment:** reject and replace with the three-state lattice. D25 remains a
platform capability; the default remains recovery-only; explicit prohibition
is a Tenant governance ceiling, not a change to candidate-scoped access.

### Alternative B — recovery-only forever

**Strength:** smallest disclosure surface, no availability setting, and the
least policy state.

**Weakness:** a Tenant cannot deliberately use a qualified outside language,
legal, accessibility, board, or denominational reviewer while an internal
reviewer happens to be eligible. Staff may respond by unnecessarily adding that
person as a member, which creates more standing access than D25.

**Assessment:** this is the strongest safety alternative but is unnecessarily
rigid once D25's candidate-scoped capability exists. It does not invalidate the
founder choice.

### Alternative C — always show external review whenever sources allow it

**Strength:** no setting and maximum immediate staff choice.

**Weakness:** every Tenant receives a privacy-sensitive disclosure option
without asking for it. It normalizes external sharing, conflicts with default
deny, and gives Sites no way to narrow.

**Assessment:** reject.

### Alternative D — configure every source/Site/reviewer category

**Strength:** maximum theoretical customization.

**Weakness:** a policy builder creates contradictory combinations, hard-to-
explain effective state, brittle migrations, large test matrices, and policy
debt. Source owners already decide whether their consequence may use D25.

**Assessment:** reject as overengineering.

### No-build alternative — add every outside reviewer as staff

**Strength:** reuses existing membership concepts.

**Weakness:** standing Tenant access, onboarding burden, broader visibility,
role maintenance, and inaccurate staff identity for one candidate review.

**Assessment:** reject; D25 exists specifically to avoid this.

## Acceptance criteria

The following outcomes are independently falsifiable. They are research inputs
for the later OpenSpec/design/test work, not evidence that implementation now
exists.

### Policy and inheritance

1. A new Tenant resolves to recovery-only without a policy row.
2. An existing Tenant migration resolves to recovery-only.
3. Unknown, corrupt, or unsupported persisted Tenant policy state resolves to
   prohibition and emits a repair signal; deliberate no-row bootstrap remains
   recovery-only.
4. An authorized Tenant manager can save optional posture with current
   assurance and expected head.
5. A user lacking the exact Tenant policy capability cannot widen or narrow it.
6. A broad administrator role without the exact capability cannot change it.
7. A Site in `inherit` resolves to the current Tenant posture.
8. A Site recovery-only override remains recovery-only when the Tenant widens.
9. A Site cannot store an optional override.
10. A Site manager cannot widen beyond a recovery-only or prohibited Tenant.
11. A Site override cannot reference another Tenant/environment/Site.
12. Tenant and Site settings show configured and effective values separately.
13. A viewer lacking person-enumeration permission receives no hidden names.
14. Returning a Site to inherit uses the current Tenant head, not a copied old
    value.
15. Production posture is not inferred or copied from another environment.

### Action availability

16. Recovery-only plus proved-zero internal reviewers may expose the D25 action.
17. Recovery-only plus one eligible internal reviewer does not expose the D25
    optional action.
18. Optional posture plus one eligible internal reviewer may expose a secondary
    D25 action.
19. Partial internal resolution never counts as zero.
20. Timed-out internal resolution never counts as zero.
21. One source prohibition blocks the combined external action.
22. One source unknown/stale result blocks the combined external action.
23. Tenant optional posture never weakens D23/D24 participant independence.
24. Tenant optional posture never grants D25 projection access by itself.
25. Internal review remains the ordinary visual primary action when eligible.
26. The UI uses the exact qualifier **for source-approved changes**.

### Side-effect separation

27. Widening policy sends no invitation or notification.
28. Widening creates no D25 context, grant, membership, route, or task.
29. Widening does not select a saved reviewer.
30. Widening changes no candidate, public Site, Giving, or financial state.
31. Staff must still confirm one exact D25 disclosure and **Send invitation**.
32. Invitation creation, dispatch, acceptance, review, and public effect remain
    distinct evidence.

### Narrowing and revocation

33. Narrowing atomically advances the current policy head/epoch so every active
    incompatible path is immediately denied without requiring a bulk row
    update.
34. A policy commit cannot succeed unless its command receipt and durable
    lifecycle-reconciliation obligation commit with it.
35. Narrowing leaves completed review evidence immutable.
36. Narrowing leaves the current public Site unchanged.
37. Narrowing shows exact visible impact and privacy-safe hidden counts.
38. Narrowing with no effective or active-path change avoids a redundant
    destructive confirmation.
39. A reviewer request immediately after narrowing is denied.
40. Re-widening never revives an old invitation, credential, grant, or session.
41. A newly eligible internal reviewer ends recovery-only external access.
42. A newly eligible internal reviewer alone does not end an optional-mode
    grant that still passes every other D25 check.

### Authorization and data safety

43. The server derives Tenant, environment, Site, actor, and assurance.
44. Caller-supplied actor, Tenant, Site, mode, revision, or impact count cannot
    become authority.
45. Direct browser writes to policy/version/head/receipt tables are denied.
46. RLS `USING` prevents cross-scope reads.
47. RLS/RPC `WITH CHECK` prevents an allowed row from moving to forbidden scope
    or state.
48. Service-role, worker, RPC, view, repair, support, impersonation, and import
    paths pass the same authorization matrix.
49. Security-definer functions use fixed safe search paths and restricted
    execution grants.
50. Cache keys/fences include current policy heads and authorization epoch.
51. A stale favorable cache cannot authorize a protected read or final action.
52. No policy row copies reviewer identity, source content, candidate body,
    public state, or financial data.

### Concurrency, failure, and idempotency

53. Two concurrent saves against one head produce one winner.
54. The losing manager sees the winning state and a recomputed impact preview.
55. Retrying the same semantic command returns one receipt and no duplicate
    version or revocation.
56. A lost response reconciles against the current head/receipt before retry.
57. A policy change racing invitation send produces at most one lawful result.
58. A policy change racing final review produces at most one lawful public
    effect.
59. An outbox/provider failure cannot roll back or invent policy authority.
60. Audit projection failure does not erase the authoritative command receipt.

### UX, accessibility, mobile, and localization

61. The Tenant control is a labelled mutually exclusive choice, not an
    ambiguous switch.
62. Changing the radio does not auto-save or unexpectedly change context.
63. Save success, error, stale state, and revocation are visible and
    programmatically announced.
64. Keyboard users can traverse choices, save, cancel, dialog, and return focus.
65. Essential meaning does not rely on color, icons, avatars, or hover.
66. The complete setting and impact flow reflows at 320 CSS pixels without
    two-dimensional scrolling or lost function.
67. Interactive targets meet Core's shared touch-target contract and WCAG 2.2
    minimum target/spacing requirement.
68. Long Unicode names, domains, Sites, locale labels, and translated copy wrap
    safely.
69. Right-to-left presentation preserves logical reading and focus order.
70. Weak-network retries never create duplicate policy or invitation effects.
71. A policy-revoked reviewer receives a privacy-safe unavailable state, not a
    candidate detail leak.
72. Staff see **Internal review**, **External review**, **Invitation sent**,
    **Accepted**, **Review completed**, and **Published** as distinct facts.

### Scope exclusions

73. D26 creates no guest membership or reusable external role.
74. D26 creates no source-by-source policy builder.
75. D26 creates no recurring reminder, SLA, escalation, or scheduled change.
76. D26 creates no Page/Navigation editing authority.
77. D26 creates no Giving, Stripe, settlement, bank, currency, contribution,
    receipt, ledger, or accounting authority.
78. D26 cannot make a source-fixed or nondelegable candidate externally
    reviewable.
79. An authorized Tenant manager can save `external_review_prohibited` with
    current assurance, expected head, and impact preview.
80. Prohibition blocks D25 even when zero eligible internal reviewers is proved.
81. Prohibition makes every pending or accepted D25 path in effective scope
    inert at the same policy-head commit; per-context end evidence reconciles
    idempotently afterward.
82. A Site may prohibit external review beneath an optional or recovery-only
    Tenant.
83. A Site cannot select recovery-only or optional use beneath a prohibited
    Tenant.
84. Removing the last current invite-capability holder does not silently change
    the configured Tenant policy.

## Monitoring plan

These are named operational signals for the eventual implementation. Thresholds
are launch hypotheses and must be ratified against production baselines before
alerts are enabled.

| Signal                                                    | Threshold                                                                    | Owner                              | Required response                                                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `external_review_policy_unknown_state_total`              | any                                                                          | Site IAM + Security                | fail prohibited, fence every D25 path in scope, inspect migration/version, repair before re-enable                                        |
| `external_review_site_widen_attempt_total`                | any accepted attempt; alert on repeated denied attempts by one actor/session | Site IAM                           | verify denial, inspect UI/API mismatch or abuse, fix caller if legitimate                                                                 |
| `external_review_policy_cross_scope_denial_total`         | any                                                                          | Security                           | preserve evidence, inspect Tenant/environment/Site relationship, disable affected command if systemic                                     |
| `external_review_policy_stale_favorable_serve_total`      | any                                                                          | Security + Platform                | incident; revoke affected contexts, fence cache generation, trace reads and public effects                                                |
| `external_review_policy_narrow_revocation_mismatch_total` | any                                                                          | Site Product + Security            | confirm policy-epoch denial remains effective, fence affected presentation, replay idempotent lifecycle reconciliation, repair invariants |
| `external_review_revoked_context_success_total`           | any                                                                          | Security                           | incident; stop external review, revoke sessions, inspect every read/effect, notify affected Tenant under incident policy                  |
| `external_review_policy_command_ambiguous_total`          | any unresolved after bounded automatic reconciliation                        | Platform Operations                | reconcile receipt/head, keep safest effective posture, provide staff current truth                                                        |
| `external_review_optional_invite_rate`                    | baseline, then >3× Tenant's trailing 28-day rate without known rollout       | Tenant Website owner + Product     | review audit for misuse or training issue; do not auto-disable solely on volume                                                           |
| `external_review_optional_vs_internal_selection_ratio`    | baseline only for first release                                              | Product                            | study usability/need; never infer wrongdoing from choice alone                                                                            |
| `external_review_policy_denied_send_rate`                 | >5% of external-send attempts over 7 days after minimum volume 20            | Site Product                       | inspect stale UI/policy explanation and race frequency; fix UX/cache, not authorization                                                   |
| `external_review_policy_save_error_rate`                  | >1% of eligible save attempts over 1 hour with minimum volume 20             | Platform Operations                | inspect command/database health, preserve current posture, surface repair guidance                                                        |
| `external_review_policy_a11y_failure_total`               | any release-blocking automated or manual critical defect                     | Accessibility owner + Site Product | block rollout, repair shared primitive/composition, rerun manual keyboard/reflow proof                                                    |

No monitor may automatically widen policy, invite a reviewer, restore a revoked
grant, publish a candidate, or change Giving/financial state.

## Migration and rollout requirements

1. Land Phase 12 Candidate Review Authorization Context and source adapters
   required by D25 before exposing D26.
2. Add the closed Tenant/Site policy model and resolvers behind a server-side
   kill switch whose off state is recovery-only.
3. Backfill no optional policy rows. Existing Tenants resolve recovery-only.
4. Deploy read compatibility before write UI; old code must treat new policy as
   recovery-only rather than crash or widen.
5. Prove policy-head/epoch narrowing immediately denies incompatible D25 reads
   and effects, and prove the same-transaction reconciliation obligation before
   allowing opt-in.
6. Roll out to internal/synthetic Tenants first, then a small opt-in cohort.
7. Keep roll-forward as the normal recovery. Turning the feature flag off must
   stop optional selection without resurrecting or erasing historical grants.
8. Do not claim rollback is safe by reverting code after new policy or grant
   rows exist. Mixed-version behavior needs explicit compatibility tests.
9. Provide a Tenant-visible audit history before general availability.
10. Validate the exact copy and journeys with nonprofit Website staff, including
    one-person and multi-Site Tenants, before treating assumptions as facts.

## Unresolved unknowns

These cannot be truthfully filled from current evidence and must remain visible:

1. The exact Phase 12 capability identifiers for Tenant policy management, Site
   narrowing, safe policy viewing, and D25 invitation.
2. The final Phase 24 environment model and whether ordinary staff need to see
   an environment selector or only an environment label at consequence points.
3. Which source domains beyond Phase 17 will affirmatively support the D25
   projection contract at launch.
4. Which source-specific qualification rules make external review unavailable
   even under the optional Tenant posture.
5. Real Tenant demand for optional external review and the distribution of
   use cases. No external product documentation proves Core customer demand.
6. Moderated usability evidence for **Only when no internal reviewer is
   eligible**, **Only when needed**, **Allow as an option**, and **Ask a Website
   administrator**.
7. Baseline counts/rates needed to ratify monitor thresholds.
8. The governing retention/anonymization posture for policy-change evidence and
   reviewer identity tombstones.
9. Whether a future compliance tier must prohibit Tenant optionality for some
   classes beyond the source-level prohibition already defined.

## Ruthless synthesis

### Must be fixed before D26 is recorded

- Replace the loose phrase “bounded Tenant choice” with D26-R1–R16.
- State the recovery-only default.
- State narrow-only Site inheritance.
- State that Tenant/Site policy cannot override source or D25.
- State that saving policy creates no invitation or authority.
- State current-policy revocation and no hidden reactivation.
- State dedicated capability, fresh assurance, immutable version, CAS, and
  audit requirements.

### Must be captured in later spec and design

- the closed relational policy model and current-head resolver;
- current D25 re-evaluation, atomic policy-head denial, and idempotent lifecycle
  reconciliation;
- exact Tenant and Site settings journeys/copy;
- permission-safe impact summaries;
- Base Maia/Base UI, mobile, localization, accessibility, and weak-network
  states;
- the 84 acceptance outcomes; and
- the monitor ownership/response table.

### Must remain implementation safeguards

- one server authorization resolver and server-derived scope;
- no direct browser policy write;
- force RLS plus operation-correct checks on every privileged path;
- policy-generation cache fencing;
- semantic idempotency and expected-head concurrency;
- no provider call inside the policy transaction; and
- no generic settings JSON or policy engine.

### May be monitored, not silently guessed

- actual optional-external-review usage;
- denial/race frequency;
- staff comprehension and completion rate;
- save reliability; and
- accessibility defects.

Every monitored risk has a signal, threshold, owner, and response above. Demand,
copy comprehension, source coverage, and retention remain explicit unknowns,
not invented ministry facts.

## Deferred lower-dependency UX observation

When policy does not allow optional external review, staff still need a truthful
explanation and a lawful next action. The no-build baseline is a privacy-safe
**Ask a Website administrator** handoff or settings link. A later decision may
choose a deduplicated permission-routed request, but D26 must not silently add a
new request lifecycle, email, reminder, or approval workflow.

## Recommended next one-at-a-time Grill question

### D27 — What happens to internal review attention when staff choose an external reviewer?

> **Resolved by D27:** the founder selected one source-owned visible
> responsibility lane with deliberate internal takeover. The external lane
> begins only when the local invitation commit succeeds; internal items end as
> Reassigned without capability loss; return makes external access inert before
> creating a fresh internal successor occurrence. D28 now closes explicit
> decline/expiry next-lane recovery; D29 is the next decision.

#### Why this needs a founder decision

Under D26 optional posture, Ana can be an eligible internal reviewer at the
same moment Maria deliberately invites Eli externally. D21/D22 may already have
created personal internal **Needs attention** items. D25 limits external review
to one active person but does not decide whether internal and external review
lanes should stay active together.

This choice changes ownership clarity, duplicate work, recovery, concurrency,
and the words staff see. It does not change who is independently qualified or
permit two review effects.

#### Hope Ministries example

Ana has a **Needs attention** item for Hope's French-default candidate. Maria
chooses **Invite an external reviewer** and sends the exact-candidate invitation
to Eli. Should Ana's internal item remain actionable while Eli is reviewing?

#### Option 1 — one visible review lane with deliberate takeover — recommended

Sending Eli's invitation explicitly hands responsibility to **External review
— Eli Martin**. Ana's internal attention occurrence ends as **Reassigned**; her
read history is not transferred. Eligible internal people do not lose their
underlying Website capabilities, but the source presents **Take over review**
instead of a competing final action. Taking over shows the consequence, revokes
Eli's pending/accepted path first, and creates a fresh internal responsibility
leg. The current website stays live throughout.

If delivery fails or Eli declines, staff see **Send again**, **Choose another
external reviewer**, or **Return review to Hope Ministries**. Core never runs
both lanes merely because email is uncertain.

**Impact:** one clear accountable lane, no duplicate review, and a reversible
staff recovery action. It requires one explicit handoff state and atomic
external-revoke/internal-successor behavior, but reuses D21 differential handoff
and D25 replacement rather than creating a workflow engine.

#### Option 2 — internal and external remain active; first valid review wins

Ana keeps her item while Eli receives the external invitation. Either may
complete the exact current review; one compare-and-swap wins and the other sees
the completed truth.

**Impact:** fastest fallback and least routing mutation, but two people may do
the same work, ownership is unclear, staff can surprise the external reviewer,
and external disclosure may occur unnecessarily after Ana completes first.

#### Option 3 — external lane locks internal review until it ends

Ana's item ends and no internal reviewer can take over while Eli's invitation or
grant is active. Only cancel, expiry, decline, policy revocation, or external
completion releases the candidate.

**Impact:** strongest single-owner rule, but it is inflexible when Eli is slow,
unreachable, or invited by mistake. It turns an authority-free invitation into
an avoidable operational lock.

#### Recommendation

**Recommend Option 1 — one visible lane with deliberate takeover.** It gives
staff one unambiguous accountable reviewer at a time while preserving a clear,
safe recovery path. It aligns with Core's existing differential-handoff model,
D25's revoke-before-replace rule, and source-owned atomic final effects. The
spec must state that attention is presentation/responsibility, not permission;
the takeover command coordinates the one lane and cannot grant capability or
weaken D23/D24 independence.
