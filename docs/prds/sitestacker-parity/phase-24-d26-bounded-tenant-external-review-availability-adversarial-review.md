# Phase 24 D26 — bounded Tenant external-review availability adversarial review

> **Subsequent D29 reconciliation (2026-08-28):** D29 now accepts one distinct
> **Website review follow-up route** with one to three explicit Review
> coordinators, current authorization intersection, and no D21/inviter/admin/
> capability inference. Any statement below that calls D29 “next,” “pending,”
> or “unresolved” records the earlier dependency state and is superseded by the
> [D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md).

> **Subsequent IA reconciliation:** the final **Website reviews** page now has
> **Review notifications** and **External review follow-up** under **Review
> responsibilities**, followed by this D26 **External review** policy card. The
> two-card examples below predate D29 and do not remove the new responsibility
> card or turn this availability policy into a roster.

> **Artifact type:** Grill decision evidence; not a PRD, implementation
> authorization, migration, ticket set, or claim of shipped behavior.  
> **Founder answer:** **Bounded Tenant choice.** Confirm that this is modern best
> practice and make it fit Core's UX/UI.  
> **Review disposition:** **Accept with required amendments.**  
> **Session date:** 2026-08-28.

## Executive disposition

Bounded Tenant choice is the right permanent direction, but the two-choice
question was incomplete. A Tenant that has a deliberate prohibition on sharing
protected unpublished material outside the organization needs an explicit,
auditable **Do not allow external review** posture. Relying on nobody currently
holding the invitation capability is not equivalent: that is an authorization
result, not organizational policy, and a later grant could silently reopen the
path.

The corrected model is one closed, strictest-wins lattice:

```text
Do not allow external review
            <
Only when no eligible internal reviewer exists  (platform default)
            <
Let staff choose internal or external review when every source permits it
```

A Site inherits the Tenant posture or deliberately narrows it. It never widens
the Tenant. Every source restriction, current authorization check, D23/D24
independence rule, and D25 one-candidate security boundary remains stronger than
the setting.

The posture is a **current authorization ceiling over invitation bases**, not a
cosmetic preference. Narrowing immediately denies any active external invitation
or grant whose recorded issuance basis is no longer admitted, after a clear
impact preview and deliberate confirmation. Widening never resurrects, re-sends,
or creates anything. This makes the setting truthful: **Do not allow** actually
means no current external review access.

The result is not a policy builder, guest role, or automatic route. It is three
plain-language choices, one recommended default, one optional Site narrowing,
and a separate Phase 12 capability that decides who may configure policy or
issue an invitation.

## Plain-language outcome

Hope Ministries normally uses internal reviewers. Its Tenant setting stays at
**Only when no eligible internal reviewer exists**. If Maria is the only eligible
staff member and helped prepare a protected French-default candidate, Core may
offer the D25 recovery path. If Hope later decides that its bilingual board
member Eli should be selectable even while Ana is eligible internally, a
separately authorized Website-governance manager can choose **Let staff choose**.
Nothing is sent merely because the setting changed.

Hope's restricted field-security Site can independently choose **Do not allow
external review**. That Site then remains safely blocked when no internal
reviewer can act; the current Live website stays unchanged. The Site setting
does not weaken Hope's other Sites, create a self-review exception, or change
Giving.

## Evidence classification

- **Repository fact:** governing Core behavior already separates source review,
  responsibility routing, personal attention, identity handoff, authorization,
  communication delivery, and public effect.
- **Repository fact:** D23 identifies D25 as the lawful no-internal-reviewer
  recovery, while D25 and ADR-0181 describe that capability as source-authorized
  and permissive rather than an unavoidable Tenant mandate.
- **Repository fact:** current runtime has no D26 posture, Candidate Review
  Authorization Context, candidate-review invitation aggregate, or real Website
  review settings surface.
- **Verified external fact:** current collaboration platforms expose
  organization-level controls that can restrict or disable external sharing;
  their settings do not by themselves grant resource access.
- **Verified external fact:** modern hierarchical guardrails commonly define a
  maximum or ceiling while lower scopes may narrow; authorization remains a
  separate decision.
- **Product judgment:** three closed postures are the smallest set that is both
  truthful and flexible for Core. A binary setting either lacks an explicit
  prohibition or collapses recovery and ordinary choice.
- **Assumption:** a meaningful minority of missions organizations will require
  organization- or Site-level prohibition of external unpublished-content
  review. Representative interviews and pilot data must test that assumption.
- **Resolved subsequent decision:** when staff deliberately choose external
  review while internal reviewers are eligible, D23/D25 settle one winning
  source command but D21/D22 did not settle whether internal actionable
  attention remains parallel. D27 now selects one source-owned responsibility
  lane with deliberate takeover. D28 now closes explicit decline/expiry next-
  lane recovery; D29 next decides its bounded recovery-responsibility route.

## Current behavior, intended behavior, and best permanent path

### Current repository behavior

1. Phase 17 and the active outbound-communications OpenSpec contain a narrow
   one-person candidate-scoped delegated-review precedent, but not D26's
   Tenant/Site policy hierarchy.
2. D21 owns an explicit Tenant/Site responsibility route for review attention.
   Responsibility neither grants access nor proves review eligibility.
3. D22 permits a small unordered internal responsibility set; the first valid
   source transition wins and ends applicable sibling attention without
   attributing review to the others.
4. D23 owns the source-proportional independence floor and distinguishes proved
   zero from unknown. D24 excludes every substantive participant.
5. D25 and ADR-0181 establish source-authorized, exact-candidate external review,
   one active external path, saved-contact non-authority, Phase 4 invitation
   ownership, and the Phase 12 Candidate Review Authorization Context.
6. Phase 12's intended capability/PDP architecture is not the running MVP. The
   current auth map gives every staff subrole the same broad capabilities, and
   the current Teams **Invite User** control is a static prototype.
7. No current runtime route or table implements D26. Nothing here is a shipped
   behavior claim.

### Intended answer before adversarial review

The original Option 1 proposed two Tenant outcomes: recovery-only by default or
source-permitted staff choice, with a Site able to narrow. It also described a
return to recovery-only as prospective. That direction correctly separated
Tenant choice from D25 authority, but it left two gaps:

1. “Site may narrow” has no complete meaning below recovery-only unless an
   explicit no-external posture exists.
2. A prospective-only **Do not allow** result would be misleading if accepted
   grants continued to disclose protected content.

### Best permanent path

Record D26-R1 through D26-R18 below. Amend ADR-0181 to distinguish the D26
availability ceiling from source/admission/identity/candidate policy. Add one
Phase 24-owned operational Website-review policy aggregate in Asym Postgres,
authorize it through Phase 12, and keep every source's D25 adapter authoritative
for external-review admission. Build one Mission Control settings journey and
one Site narrowing journey with Base Maia components. Keep every source key
Reserved until Phase 4/6/12/17, D21-D25, OpenSpec, database/RLS, UX, and release
proof close together.

Do not retrofit the static Teams invitation, Payload access control, a generic
guest account, an email link, D21 route membership, or a mutable JSON settings
blob.

## Exact corrected D26 decision

### D26-R1 — one narrow question

D26 decides only **when** an otherwise D25-valid external invitation basis is
admitted by the Tenant and Site. It does not decide source eligibility,
participant independence, reviewer identity, projection contents, invitation
lifecycle, reviewer cardinality, communication delivery, review result, or
public effect.

### D26-R2 — closed Tenant posture lattice

Every Tenant has exactly one current Website External Review Availability
Posture Version with one of three code-owned values:

1. **`external_review_prohibited` — Do not allow external review.** No new external invitation
   may be issued and no active Candidate Review Grant may remain favorable.
2. **`recovery_only` — Only when no eligible internal reviewer exists.** This is
   the platform default. A new invitation is admitted only after complete
   current proof of zero eligible internal humans for the exact candidate.
3. **`source_permitted_choice` — Let staff choose internal or external review
   when every source permits it.** Internal eligibility does not block a
   deliberate external choice.

There is no custom rule, per-role condition, time schedule, reviewer category,
automatic fallback, “always external,” or hidden fourth state.

A deliberate no-row bootstrap or migration state resolves to `recovery_only`.
A corrupt row, missing expected head after initialization, unknown code,
unsupported version, or broken scope relationship fails closed as
`external_review_prohibited` until repaired. Neither state is interpreted as
ordinary optional external disclosure.

### D26-R3 — closed Site narrowing

Every Site has exactly one effective Site posture derived from:

- **Use organization setting** (`inherit_tenant`);
- **Recovery only for this Site** (`recovery_only`), only where that does not
  widen the Tenant; or
- **Do not allow external review for this Site**
  (`external_review_prohibited`).

The effective posture is the narrower of Tenant and Site. A Site cannot persist
or request `source_permitted_choice`; it obtains that result only by inheriting
a Tenant that deliberately chose it. A Tenant narrowing applies immediately to
all Sites regardless of a stored Site preference. Later Tenant widening may
reveal a still-explicit narrower Site choice, never a wider one.

### D26-R4 — organizational intent is not capability omission

The posture is authoritative organizational intent. Phase 12 separately decides
who can view or manage it and who may issue a D25 invitation. Absence of an
invitation-capability holder can make use currently impossible, but it cannot
stand in for `external_review_prohibited`. Conversely, enabling
`source_permitted_choice`
grants no capability, membership, visibility, reviewer qualification, or
invitation.

### D26-R5 — every stronger floor still wins

An effective posture other than `external_review_prohibited` is only a ceiling. External review
remains unavailable unless every included consequence-owning source:

- affirmatively admits D25 for the exact candidate/action;
- supplies a complete compatible minimized projection;
- permits the proposed human and assurance profile; and
- retains a current compatible adapter/policy generation.

Unknown, stale, incomplete, incompatible, contradictory, timed-out, or
over-limit source proof is never source-permitted.

### D26-R6 — exact issuance basis

Every D25 invitation and Candidate Review Grant records one immutable
`external_review_selection_basis`:

- `proved_zero_internal`, with the exact eligibility resolver generation and
  digest that proved recovery eligibility at issuance; or
- `tenant_permitted_choice`, with the exact effective Tenant/Site posture
  versions authorizing ordinary choice.

No client field chooses the basis. The server derives it in the invitation
issue transaction. A grant never changes basis, and resend never changes or
extends it. The immutable basis preserves why issuance was lawful; it does not
freeze continuing eligibility.

### D26-R7 — current ceiling and deterministic narrowing

Every protected invitation/grant read and action re-proves the current effective
posture and, where required, the complete current internal-eligibility result:

| Current effective posture    | Continuing favorable condition                                                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `external_review_prohibited` | none                                                                                                      |
| `recovery_only`              | immutable `proved_zero_internal` basis **and** complete current proof of zero eligible internal reviewers |
| `source_permitted_choice`    | either immutable basis; a newly eligible internal reviewer alone does not end the grant                   |

Narrowing increments the governing policy epoch before visible success. The
next protected request denies a now-incompatible invitation or grant
immediately; lifecycle reconciliation records the terminal policy-narrowed
reason without being the enforcement dependency.

An internal reviewer becoming eligible later never rewrites historical basis,
but under `recovery_only` it ends the current recovery condition and therefore
favorable external access. Under `source_permitted_choice` it does not by itself
end an otherwise-current D25 grant. Internal and external source actions still
use the same current D25 source CAS; the first valid command wins.

### D26-R8 — widening never resurrects or sends

Widening affects only future issue commands. It never restores an expired,
revoked, policy-ended, declined, replaced, completed, or candidate-superseded
invitation/grant; never restarts a session; never sends email; never selects a
contact; and never creates internal or external attention. A new candidate or
new invitation always follows D25 fresh-proof requirements.

### D26-R9 — exact viewing and management authorization

Role labels such as Owner, Admin, Website administrator, or Site manager are
display conveniences, never authorization. Phase 12 must register separate exact
capabilities for at least:

- viewing the effective Tenant/Site external-review posture;
- changing the Tenant posture;
- narrowing one Site posture;
- viewing a privacy-safe impact summary;
- managing active D25 invitations/grants; and
- issuing one D25 invitation.

Tenant posture management requires an active Tenant Assignment, current exact
Tenant-wide capability, current authentication, fresh risk-proportional step-up
for widening, and body-free durable audit. Site posture management requires the
exact Site-scoped capability and can only narrow. Candidate invitation still
requires the separate D25 delegate-review capability and current source access.

### D26-R10 — one calm, truthful settings surface

Mission Control exposes one **Settings → Websites → Reviews** surface with
separate cards for:

1. **Review notifications** — D21 responsibility only; and
2. **External review** — D26 availability only.

The D26 card uses a labeled radio group with three full-sentence choices,
recommended-default explanation, effective Site count/impact where authorized,
dirty-state preservation, explicit save, loading/empty/error/conflict states,
and a programmatic success result. It is not a switch because this is a
three-state governance choice with different consequences, not a simple
immediate on/off preference.

### D26-R11 — internal remains the ordinary candidate default

Under `source_permitted_choice`, internal review remains the visually primary
and recommended candidate path. **Use an external reviewer** is a deliberate
secondary choice that first explains protected disclosure, exact scope, expiry,
and unchanged public/Giving behavior. Core never remembers the per-candidate
choice as a future default or automatically selects/sends to a saved contact.

Under `recovery_only`, the external action appears only after proved-zero
internal eligibility. Under `external_review_prohibited`, it does not appear as a broken or
disabled ordinary action; an authorized policy viewer may see the effective
reason and settings path. Other staff see the lawful internal/safe-baseline
journey without private governance detail.

### D26-R12 — internal eligibility is exact and server-derived

“No internal reviewer exists” means complete current proof that zero same-Tenant
human principals can both view and perform the exact source review while
satisfying D23/D24 and every source qualification. It does not mean:

- the D21 notification route is empty;
- a selected person has not opened an item;
- nobody replied to email;
- someone is presumed away, busy, offline, or unwilling;
- a timer elapsed;
- a roster query was partial; or
- a user lacks permission to enumerate names.

Unknown is not zero and releases no recovery invitation.

### D26-R13 — impact-previewed, CAS-guarded changes

Before save, Core derives a permission-filtered impact preview containing:

- current and proposed posture in plain language;
- current and future Site scope;
- explicit Site overrides that remain narrower;
- count of pending invitations and active grants whose immutable basis would no
  longer be admitted;
- statement that narrowing ends those paths immediately;
- statement that widening sends nothing and grants nothing; and
- current public website and Giving behavior, which remain unchanged.

The save command derives Tenant, environment, actor, scope, current heads, and
audit attribution from trusted server context; locks the posture head; verifies
the expected current revision and compatible impact digest; appends one immutable
successor; increments the policy epoch; and records one idempotent receipt.
Concurrent stale save loses explicitly. No last-write-wins merge exists.

### D26-R14 — active-review consequences are honest and recoverable

After narrowing, affected staff surfaces say:

> **External review ended because review policy changed**
>
> Eli no longer has access to this version. Your current website is unchanged.
> Choose an eligible internal reviewer, change policy if authorized, or keep the
> current version.

The old invitation/grant remains immutable history and never reopens. Staff may
issue a lawful successor only under the then-current posture. Delivery already
in flight cannot be recalled, but its link/context is unusable after the policy
epoch changes. A lost save response reconciles by semantic command identity.

### D26-R15 — one operational owner, no CMS shadow

Phase 24 Website-review governance owns the Tenant posture, Site narrowing,
current heads, epochs, command receipts, and impact semantics in Asym Postgres.
Phase 12 authorizes reads/commands and binds current policy epochs into D25
contexts. Site identity and Payload/CMS may display a safe derived effective
posture but own no policy, capability, invitation, review, or audit truth.

The later design must reconcile Phase 2's typed operational Site-setting rule
with D21's typed revision lineage. It may use typed current values plus immutable
revisions/receipts or one cohesive Website-review governance aggregate, but must
not create a CMS duplicate, per-setting JSON blob, or generic policy engine.

### D26-R16 — no public, Giving, or financial effect

Posture view/change, impact preview, denial, widening, narrowing, or
reconciliation changes no Site content, Page, Navigation, default locale,
language route, public URL, Giving URL, Giving enablement, Legal Entity, Stripe
account, settlement, bank, currency, contribution, receipt, ledger, accounting,
or payout identity. Existing Live content remains active until an ordinary
source command lawfully changes it.

### D26-R17 — durable evidence and observable failure

Durable business evidence records opaque Tenant/Site/policy/head/actor keys,
old/new closed posture, semantic command identity, selection-basis impact counts,
policy epoch, time, and outcome/reason. It stores no candidate projection,
reviewer email, source body, donor/missionary fact, credential, or arbitrary
justification. Technical telemetry is separately minimized and never substitutes
for business audit.

Unknown impact, write conflict, epoch propagation failure, lifecycle
reconciliation lag, source-adapter drift, or policy/context mismatch is visible
to the correct owner and fails closed without public effect.

### D26-R18 — explicit non-goals

D26 creates no custom ACL language, approval builder, reviewer pool, standing
guest role, automatic routing, reviewer recommendation engine, external-review
quota, due date, reminder, escalation, email preference, presence/availability
model, bulk invitation, per-locale posture, per-source Tenant override, public
setting, or financial control.

## Staff UX/UI contract

### Information architecture

Use one coherent **Settings → Websites → Reviews** page instead of scattering
review behavior across Teams, Web Studio, Languages, Communications, and Support.
This page contains separate concepts with explicit explanatory boundaries:

```text
Website reviews

[Review notifications]
Who normally receives private Needs attention items.
This does not give access or permission.

[External review]
When an authorized person may invite one outside human for one exact protected
change. This does not grant invitation authority or make every change shareable.
```

This intentionally amends D21's narrower **Settings → Websites → Review
notifications** path into a broader page while preserving its card and wording.
It is information-architecture convergence, not domain ownership convergence.

### Tenant happy path

The radio cards use concise consequences rather than raw enum names:

```text
External review

Choose when authorized staff may invite one outside person to review one exact
protected Website change.

○ Do not allow external review
  Protected comparisons stay inside Hope Ministries. A change can remain blocked
  if no eligible internal reviewer exists.

● Only when no eligible internal reviewer exists        Recommended
  Gives small teams a safe recovery path without making outside sharing routine.

○ Let staff choose internal or external review when allowed
  Staff may choose an outside reviewer even when an eligible internal reviewer
  exists. Every source must still permit it.

This setting does not give anyone access, send an invitation, or guarantee that
external review is available for every change.
```

The recommended choice is selected only for a newly initialized Tenant. A saved
Tenant always displays its authoritative current value; the UI never silently
resets it to the recommendation.

### Widening confirmation

Selecting **Let staff choose** reveals an impact panel before save:

```text
Allow external review as an option

Authorized staff will be able to share a protected unpublished comparison with
one verified outside person when every source permits it.

Applies to: 18 current Sites and future Sites
Narrower Site settings retained: 2

Nothing will be sent now. Saved reviewer contacts receive no access.

[Allow as an option] [Cancel]
```

Fresh step-up occurs at confirmation only when the current session does not
already satisfy the bounded requirement. Returning from step-up preserves the
reviewed impact and revalidates it; it does not submit automatically.

### Narrowing confirmation

```text
Change to Recovery only

New external invitations will require proof that no eligible internal reviewer
exists.

2 current external reviews were chosen while an internal reviewer was eligible.
Their access will end when you save.

3 recovery invitations remain permitted by this setting.

Your websites and Giving stay unchanged.

[Change policy and end 2 reviews] [Cancel]
```

For **Do not allow**, the confirmation states the complete pending/active count
that will end. Counts are omitted or safely coarsened when the viewer cannot see
them; the command still applies correctly. No typed phrase is required.

### Site narrowing

At **Websites → hope-field.org → Reviews**:

```text
External review

Organization setting: Staff may choose internal or external review when allowed

● Use organization setting
○ Recovery only for this Site
○ Do not allow external review for this Site

A Site can be more restrictive than Hope Ministries, never less restrictive.
```

When the Tenant is already `recovery_only`, the Site shows only inheritance and
`external_review_prohibited`; when the Tenant is
`external_review_prohibited`, the effective state is clear and
no control can widen it. The interface explains why instead of presenting a
dead disabled radio with no context.

### Candidate journey under ordinary choice

When an internal reviewer is eligible and the effective posture is
`source_permitted_choice`:

```text
Choose how this version is reviewed

Recommended
[Request internal review]
Keeps the protected comparison inside Hope Ministries.

[Use an external reviewer]
Invite one verified outside person for only this version. Every source must
permit external review.
```

Choosing external then enters D25's review-person selector, exact scope summary,
expiry, identity proof, and send confirmation. Core never preselects a saved
contact, treats prior use as qualification, or remembers external as the next
candidate's default.

### Recovery-only and prohibited candidate states

Recovery-only with proved zero:

> **Independent reviewer needed**
>
> No eligible person inside Hope Ministries can complete this review. Your
> policy allows one outside reviewer for this version when every source permits
> it.
>
> **Invite an external reviewer** · **Keep current version**

Prohibited, for an authorized policy viewer:

> **External review is not allowed for this Site**
>
> This version needs another eligible internal reviewer. Your current website
> remains unchanged.
>
> **Review policy** · **Keep current version**

A person lacking policy-view authority sees the truthful source block and safe
next actions without private Tenant policy detail or a settings link.

### Loading, conflict, failure, and weak-network states

- Render the real PageShell and card skeletons to prevent layout shift.
- Preserve the selected draft during step-up, network loss, and a recoverable
  server error.
- Never optimistically display a changed posture or revoked external access.
- A stale save returns current/proposed differences and requires review; no
  silent refresh-and-resubmit.
- A successful save is visible in the page's programmatic status region and
  durable history; toast may supplement but never be the only confirmation.
- If epoch propagation or lifecycle reconciliation is delayed, the protected
  reviewer path still denies from the authoritative current policy check.
- Mobile uses the same radio choices and impact copy in one column; no side-by-
  side comparison is required.

### Accessibility and localization

- Use `@asym/ui`, Base Maia/Base UI, semantic Zinc-derived tokens, shared Card,
  RadioGroup, AlertDialog/confirmation, Badge, Button, Skeleton, and PageShell.
- Each radio has a programmatic label and description; the group has a visible
  legend/question. Do not make the whole card an unannounced custom control.
- Preserve 320-CSS-pixel reflow, 400% zoom, visible unobscured focus, keyboard-
  only use, 44-CSS-pixel targets, forced colors, high contrast, reduced motion,
  screen-reader order, RTL/bidi isolation, long Tenant/Site names, CJK, combining
  characters, and translated expansion.
- Announce impact-count loading, validation, conflicts, and success politely
  without stealing focus.
- Display times/zones only for affected D25 grants; D26 posture itself has no
  schedule or target date.
- Interface strings localize independently of candidate content. Core never
  machine-translates a protected candidate and treats it as authoritative.

## Source of truth and ownership

| Fact                                   | Authoritative owner                                      | D26 may retain/reference            | D26 must not own                                 |
| -------------------------------------- | -------------------------------------------------------- | ----------------------------------- | ------------------------------------------------ |
| Tenant external-review posture         | Phase 24 Website-review governance in Asym Postgres      | immutable version/head/epoch        | capability, source admission, invitation, review |
| Site narrowing                         | same Phase 24 operational owner, exact Tenant+Site scope | immutable override/effective result | Site identity, CMS content, source rule          |
| current ability to view/change posture | Phase 12 PDP + exact capabilities                        | decision proof/epoch                | role label or visible control                    |
| external-review source admission       | each consequence-owning source                           | closed result/version/reason        | global favorable override                        |
| internal-review eligibility            | Phase 12 plus D23/D24 and source policy                  | proved-zero digest/generation       | D21 route, email, presence guess                 |
| external selection basis               | D26 issue command consuming current policy/source proof  | immutable closed basis/version refs | mutable UI choice or later rewrite               |
| invitation lifecycle/identity          | Phase 4                                                  | exact invitation reference/state    | delivery, grant, public effect                   |
| Candidate Review Grant/context         | Phase 12 consuming Phase 4 and source proof              | exact grant/context refs            | Tenant membership or standing access             |
| communication preparation/outcome      | Phase 17 / Phase 6                                       | occurrence/evidence refs            | authority or review truth                        |
| responsibility and personal attention  | D21/D22 + Phase 17/ADR-0027                              | route/occurrence/item refs          | authorization or D26 posture                     |
| source review/public effect            | exact consequence-owning source command                  | receipt reference                   | policy save, email, item engagement              |
| public Site/default                    | existing Site/publication owners                         | unchanged/result assertion          | D26 setting                                      |
| Giving/financial identity              | existing Giving/finance owners                           | unchanged assertion only            | any account, route, amount, or ledger fact       |

## Domain invariants

1. Exactly one Tenant posture head exists per Tenant+environment.
2. Tenant posture is one of exactly three code-owned values.
3. A Site inherits or selects a posture no wider than its Tenant.
4. Effective posture is the strictest Tenant/Site result.
5. `external_review_prohibited` admits no active external selection basis.
6. `recovery_only` admits only an immutable `proved_zero_internal` basis.
7. `source_permitted_choice` admits both closed bases but creates nothing.
8. Capability and posture are conjunctive; neither substitutes for the other.
9. Every source must affirmatively admit D25; one unknown/block wins.
10. Proved-zero internal eligibility is complete, exact, and server-derived.
11. D21 responsibility route state never proves internal eligibility.
12. Every invitation/grant freezes one immutable selection basis and policy refs.
13. Narrowing denies incompatible bases at the current policy epoch before
    lifecycle cleanup.
14. Widening never revives, re-sends, or auto-creates.
15. Internal eligibility later becoming favorable does not rewrite historical
    basis; under recovery-only it ends favorable access, while under optional
    choice it does not by itself end the grant.
16. Candidate/source/participant/identity/authorization/admission changes retain
    D25's immediate invalidation rules.
17. Posture save and active invitation/grant effects are one local authoritative
    policy-epoch transaction plus resumable lifecycle reconciliation; no partial
    favorable access remains.
18. One stale or concurrent save cannot overwrite another current head.
19. Caller-controlled Tenant, Site, actor, capability, posture, impact count,
    basis, epoch, or audit attribution is never trusted.
20. A Site clone/import/transfer inherits destination Tenant policy and never
    copies a widening posture or active external authority.
21. Site retirement admits no new invitations and preserves required history.
22. D26 changes no public content, Giving, or financial identity.

## Conceptual database, RLS, and authorization contract

This is a conceptual proof shape, not authorization to freeze table names.

### Required logical records

- **Tenant posture version:** Tenant, environment, immutable closed posture,
  policy epoch, predecessor, actor, timestamp, semantic command identity, and
  body-free reason/result.
- **Tenant current head:** exact Tenant+environment current version/revision.
- **Site posture version:** same-scope Tenant+environment+Site, immutable
  `inherit_tenant | recovery_only | external_review_prohibited`, predecessor,
  actor, time, and
  semantic identity.
- **Site current head:** exact Tenant+environment+Site current version/revision.
- **Impact proof:** short-lived or transaction-local digest over current heads,
  affected active selection-basis counts, Site coverage, and current policy
  generation. It is not authorization after the command ends.
- **Policy command receipt:** requested/effective old/new values, exact affected
  scope, epoch, selection-basis counts, success/conflict/failure reason, and
  idempotency result.
- **D25 amendment:** every invitation/grant stores one immutable selection basis
  and exact Tenant/Site posture versions. D26 does not copy candidate bodies or
  create another grant table.

### Relational constraints

1. UUID primary keys follow repository convention; mutable labels/slugs never
   key policy or audit relationships.
2. Every D26 row carries `tenant_id NOT NULL` and environment; Site rows preserve
   same-Tenant composite relationships.
3. Closed checks or database enums admit only the exact postures above.
4. Tenant posture rows cannot carry Site identity; Site rows require exactly one
   same-Tenant Site.
5. One current head exists per Tenant+environment and per
   Tenant+environment+Site. Expected-revision commands are the sole writers.
6. Site effective posture cannot exceed the current Tenant posture. The command
   and database-enforced closed ordering both reject a widening request.
7. D25 invitation/grant selection basis is non-null, immutable, and compatible
   with its frozen issue-time policy references.
8. Foreign keys use restrictive deletion where policy/audit/invitation history
   must survive. Tenant offboarding follows the governing retention and
   pseudonymization contract rather than orphaning or cross-retargeting rows.
9. Index every current-head lookup, Site inheritance/narrowing lookup, reverse
   policy-impact lookup over active D25 bases, epoch check, command receipt,
   reconciliation, and audit keyset order. Foreign-key indexes are mandatory.
10. No trigger silently authors product policy from role, capability, source,
    Site creation, or Payload state. New Tenant initialization explicitly writes
    the recommended `recovery_only` version; new Sites inherit unless an
    authorized command narrows them.

### RLS and privilege requirements

- Enable and force RLS on every Tenant policy, Site policy, current-head,
  receipt, and restricted audit relation.
- Browser roles receive no direct `INSERT`, `UPDATE`, or `DELETE` on posture
  versions, heads, epochs, D25 selection bases, grant states, or command receipts.
- `USING` and `WITH CHECK` preserve exact current Tenant/environment, Site
  visibility, purpose, and capability. An allowed update cannot move policy to
  another Tenant/Site, change actor attribution, replace an immutable version,
  or widen a Site above Tenant.
- Tenant policy reads require the exact purpose/capability. Site readers receive
  only the effective posture and safe management projection their current scope
  permits. Candidate users without policy visibility receive lawful actions,
  not hidden Tenant governance facts.
- Commands live behind `packages/api` and derive Tenant, environment, actor,
  active assignment, Site, current heads, capabilities, step-up, time, epoch,
  impact, and audit attribution server-side.
- Any view, RPC, `SECURITY DEFINER`, service role, worker, repair, import,
  migration, Payload hook, cache, realtime path, support tool, impersonation,
  or operator route applies the identical poison matrix. A trusted backend is
  not a policy bypass.
- Security-definer functions use fully qualified objects, a fixed safe
  `search_path`, revoked public execution, least privilege, and positive plus
  hostile proof.
- Policy summaries, counts, caches, cursor keys, and realtime channels are
  partitioned by Tenant+environment+scope+purpose+policy epoch. No cross-Tenant
  cache key or aggregate is allowed.

### Command and concurrency model

The canonical command order is:

1. resolve authenticated principal and active Tenant Assignment;
2. authorize exact Tenant or Site posture-management capability;
3. load current Tenant/Site policy heads and current policy epoch;
4. derive the requested effective posture and reject Site widening;
5. derive a bounded privacy-safe impact and compatible digest;
6. obtain fresh step-up when widening or otherwise required by Phase 12;
7. lock current policy heads in documented Tenant-before-Site order;
8. re-prove expected heads, capability, step-up, impact digest, and current
   affected D25 selection-basis set;
9. append the successor version and command receipt, move the current head, and
   increment the policy epoch in one short local transaction;
10. append a transactional outbox/reconciliation intent for terminal lifecycle
    evidence and presentation changes; and
11. return one idempotent result. No email/provider/network call occurs in the
    transaction.

Every D25 protected request compares its immutable selection basis with the
current effective posture/epoch. Therefore a crash after policy commit but
before lifecycle reconciliation still denies incompatible access. Reconciliation
may be replayed without re-denying or reviving authority.

Same semantic key and same meaning returns the original result. Reusing a key
with a different Tenant, Site, expected head, posture, impact digest, actor, or
meaning rejects. Two administrators racing produce one winner and one current-
state conflict; there is no field merge or last-write-wins save.

## Lifecycle and temporal model

| Event                                                          | Required D26 result                                                                             |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Tenant initialized                                             | append `recovery_only`; no invitation or communication                                          |
| Site created                                                   | inherit current Tenant posture; no copied authority                                             |
| Site narrows                                                   | current effective ceiling changes; incompatible bases deny                                      |
| Tenant narrows choice → recovery                               | deny only active `tenant_permitted_choice` bases; recovery bases remain                         |
| Tenant/Site narrows → prohibited                               | deny every active external basis in scope                                                       |
| Tenant/Site widens                                             | future issue becomes eligible; no old path revives                                              |
| source blocks D25                                              | external remains unavailable regardless of posture                                              |
| eligibility proof is unknown                                   | no recovery basis can be issued                                                                 |
| internal reviewer later becomes eligible under recovery-only   | current recovery condition ends; external access denies; history remains                        |
| internal reviewer later becomes eligible under optional choice | grant may continue if every other D25 fact remains current; source CAS still decides one winner |
| capability to issue is removed                                 | no new invitation; current grants follow D25 current-authority rules, not D26 guesswork         |
| posture manager loses capability during save                   | save rejects; no successor or epoch change                                                      |
| invitation issue races narrowing                               | one lock/CAS order wins; no invitation favorable under a posture that already narrowed          |
| source completion races narrowing                              | one source/policy ordering wins; public effect and policy receipt remain truthful               |
| candidate changes                                              | D25 supersedes invitation/grant; new candidate uses current posture                             |
| Site transferred/cloned/imported                               | destination inherits destination Tenant; no source selection basis copies                       |
| Site retired                                                   | no new issue; incompatible current contexts deny; history remains                               |
| policy reconciliation lags                                     | request-time epoch denies; UI shows honest processing state                                     |
| policy data corrupt/unknown                                    | fail closed; current Live Site remains                                                          |

## Strongest alternatives

### Alternative A — two Tenant states and prospective-only narrowing

This is the original answer: `recovery_only | source_permitted_choice`, with Site
narrowing only from ordinary choice to recovery and existing grants unaffected.

**Best argument:** smallest data model and least disruption to an active
reviewer. It preserves D25 recovery and avoids treating a preference save like
revocation.

**Why it loses:** it cannot truthfully represent an organization or Site that
prohibits external unpublished-content sharing. Capability omission is not
stable policy. “Site may narrow” becomes incomplete below recovery. If an Off
choice is later added but remains prospective, staff reasonably reading “Do not
allow external review” would be misled while current external access continued.

**Disposition:** reject and replace with the three-state current ceiling.

### Alternative B — three states, but posture applies only at invitation issue

**Best argument:** policy changes never interrupt in-progress work, and source
reviewers finish under the rules staff saw when invited.

**Why it loses:** it makes the prohibition non-current and forces staff to find
and revoke every active path manually. Missed invitations, accepted contexts,
or open sessions can continue sharing after the organization believes it has
disabled external review. This conflicts with plain-language expectations and
creates recurring cleanup.

**Disposition:** reject. Preserve an exact issuance basis, but recheck whether
the current ceiling still admits that basis on every protected operation.

### Alternative C — capability grants only, with no policy

**Best argument:** Phase 12 already answers who may invite; withholding the
delegate capability effectively prevents use and avoids another settings model.

**Why it loses:** capability answers **who can perform an allowed action**, not
**whether the organization allows that action for this scope**. A later role or
group edit can reopen sharing without a Website-governance decision; staff
cannot distinguish deliberate prohibition from incomplete permission setup;
Site narrowing has no owner; audit cannot explain policy intent.

**Disposition:** keep capability as a required conjunct, reject it as policy.

### Alternative D — always source-permitted, with no Tenant setting

**Best argument:** fewest settings and maximum staff autonomy. D25 remains
candidate-scoped and source-safe.

**Why it loses:** it normalizes external disclosure for every Tenant and gives
organizations no deliberate governance control. Hidden or disabled UI per
Tenant would re-create an undocumented policy.

**Disposition:** reject.

### Alternative E — custom policy builder

Conditions might include source, role, locale, Site tag, reviewer type,
jurisdiction, risk, date, or approval chain.

**Best argument:** maximum flexibility for diverse ministries.

**Why it loses:** source contracts already own admissibility. A second
Tenant-authored rule language creates contradictory owners, hard-to-explain
authorization, poor small-team UX, migration burden, and a new workflow product.

**Disposition:** reject. Re-evaluate only after multiple proven use cases cannot
fit the three-state lattice and source-owned constraints.

## External modern-practice evidence and limits

The
[D26 primary research](./phase-24-d26-bounded-tenant-external-review-availability-primary-research.md)
is authoritative for the complete source reading. The decision imports
patterns, not vendor schemas:

- The [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  recommends least privilege, deny by default, every-request authorization,
  safe failure, logging, and authorization tests. This supports recovery-only
  initialization and current re-evaluation, not Core's exact labels.
- Microsoft documents an organization external-sharing ceiling with Site
  choices limited by that ceiling in
  [Change external sharing for a Site](https://learn.microsoft.com/en-us/sharepoint/change-external-sharing-site)
  and
  [SharePoint modern sharing and permissions](https://learn.microsoft.com/en-us/sharepoint/modern-experience-sharing-permissions).
  SharePoint's ability to make old links effective again after re-enabling is a
  negative precedent: Core terminates incompatible candidate grants and never
  silently revives them.
- Google documents higher-level shared-drive restrictions overriding child
  sharing in
  [How file access works in shared drives](https://support.google.com/a/users/answer/12380484)
  and external-access audit in
  [Drive log events](https://support.google.com/a/answer/4579696). Core adopts
  restrictive hierarchy and audit, not dormant link revival or file-wide scope.
- Microsoft Entra's
  [external collaboration settings](https://learn.microsoft.com/en-us/entra/external-id/external-collaboration-settings-configure)
  separate who may invite from what external people may see and support a
  **No one** invitation posture. Core adopts separate policy/invitation
  capabilities, not standing guest directory membership.
- Salesforce's
  [External Organization-Wide Defaults](https://help.salesforce.com/s/articleView?id=security_owd_external.htm&language=en_US)
  support a restrictive external baseline and prohibit external defaults from
  being more permissive than the governing ceiling. They do not prove Core's
  exact candidate workflow.
- [Contentful environment permissions](https://www.contentful.com/help/environments/environments-permissions/)
  support explicit environment scope and migration that avoids surprising
  permission changes. Core does not copy its standing roles.
- Blackbaud documents visible invitation states and explicit resend/cancel in
  [invitations](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/sec-invi.html)
  and persistent access through
  [roles](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-role.html).
  The lifecycle clarity is useful nonprofit evidence; its standing role model
  is broader than D25.
- Slack's
  [External people dashboard](https://slack.com/help/articles/5682545991443-Use-the-Slack-Connect-external-people-dashboard)
  supports visible, centrally manageable external access. Channels and DMs are
  much broader than one review projection.
- W3C [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)
  supports explicit save instead of unexpected auto-commit;
  the [radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)
  defines names/state/keyboard behavior; and
  [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow),
  [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
  and
  [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  support the responsive, announced, operable settings journey.

External vendors do **not** prove Core's exact three values, that all ministries
need external review, that government identity proof is universal, that a guest
directory is appropriate, or that provider-delivery/open state proves review.
Core's ADRs, source ownership, D21-D25, and platform boundaries remain stronger.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

- **What could go wrong:** Core could add a policy setting for a hypothetical
  workflow, or use only two values and still fail organizations that prohibit
  external unpublished-content sharing. Conversely, a generic Off switch could
  recreate the solo-ministry dead end without saying so.
- **Why it matters:** The setting determines whether protected unpublished
  meaning may leave the Tenant and whether staff can finish an independently
  reviewed change. Both privacy and operational continuity are real root needs.
- **Severity:** High.
- **Likelihood:** Medium. D25 proves the small-Tenant dead end structurally;
  demand for ordinary external choice and explicit prohibition remains a product
  assumption until ministry research/pilot evidence exists.
- **Evidence or reasoning:** D23 names D25 as the lawful recovery; D25 is
  candidate-scoped and permissive. Current external-sharing products expose
  organizational restriction/off controls, but no vendor proves Core's exact
  values.
- **Decision effect:** Changes the chosen answer from two states to a three-state
  lattice with recovery-only as the safe default.
- **Best permanent fix:** Keep one closed policy dimension, separate from
  capability and source admission; validate terminology and tasks with solo,
  small, multi-Site, restricted-field, and multilingual ministries.
- **Exact decision/spec language:** “The system SHALL provide exactly
  `external_review_prohibited`, `recovery_only`, and
  `source_permitted_choice`; it SHALL default
  new Tenants to `recovery_only` and SHALL create no custom policy language.”

### 2. Brittleness

**Material concern: Yes.**

- **What could go wrong:** Recovery might rely on an empty notification route,
  elapsed time, guessed human availability, a complete-directory scan, or a
  setting checked only when the page renders. Policy narrowing could depend on
  asynchronous cleanup before access actually ends.
- **Why it matters:** Staff absence, route changes, stale caches, large rosters,
  and worker delay would produce inconsistent disclosure or unexplained blocks.
- **Severity:** Critical.
- **Likelihood:** High if the loose “available” wording survives.
- **Evidence or reasoning:** D21 already distinguishes responsibility from
  authorization and proved zero from unknown. Phase 12 requires request-time
  epochs; D25 requires current context reproof.
- **Decision effect:** Narrows recovery to exact eligibility proof and makes the
  posture a request-time ceiling over immutable issuance bases.
- **Best permanent fix:** Use a closed basis, current policy epoch, bounded
  resolver generation/digest, and deny before reconciliation. Never infer
  presence or willingness.
- **Exact decision/spec language:** “Unknown, partial, stale, timed-out, or
  over-limit internal eligibility is not zero; lifecycle reconciliation SHALL
  NOT be required for current policy denial.”

### 3. Technical debt

**Material concern: Yes.**

- **What could go wrong:** D26 could become a JSON settings blob, a Payload field
  plus an operational copy, another role table, per-source booleans, or duplicate
  Tenant/Site policy services. Feature-local settings components could be copied
  into another app-local visual system.
- **Why it matters:** Policy drift and dual ownership would make security fixes,
  Site transfer, auditing, and future source adapters expensive and fragile.
- **Severity:** High.
- **Likelihood:** High because current runtime lacks a Website-governance
  aggregate and has static prototype settings.
- **Evidence or reasoning:** Platform boundaries require operational truth in
  CRM/Asym Postgres; Phase 2 rejects premature `site_*_settings` sprawl; D21
  already needs a typed revision lineage; shared UI belongs in `@asym/ui`.
- **Decision effect:** Requires one cohesive Phase 24 owner, typed closed values,
  immutable revisions, and shared UI primitives.
- **Best permanent fix:** Design D21 and D26 as separate dimensions in one
  Website-review governance boundary, with one canonical writer and no CMS
  shadow. Promote reusable settings composition to `@asym/ui` only when there
  are real cross-feature consumers.
- **Exact decision/spec language:** “D26 SHALL NOT introduce mutable JSON rules,
  a CMS policy copy, a generic guest role, or per-source Tenant booleans; one
  canonical operational command SHALL own every posture transition.”

### 4. Edge cases

**Material concern: Yes.**

- **What could go wrong:** Tenant and Site postures can conflict; a new Site may
  inherit unexpectedly; narrowing can race invitation issue or source
  completion; internal eligibility may appear after a recovery invite; a source
  may change admission; a Site may transfer; step-up may return to a stale impact;
  or an email already in flight may arrive after revocation.
- **Why it matters:** These are ordinary multi-Site and asynchronous conditions,
  not exotic failures. Undefined behavior can disclose content or strand staff.
- **Severity:** Critical.
- **Likelihood:** High over normal product lifetime.
- **Evidence or reasoning:** D21-D25 already require explicit handoff, stable
  identity, revoke-first replacement, expected heads, and one source CAS winner.
- **Decision effect:** Adds the lifecycle table, immutable selection basis,
  strictest-wins Site hierarchy, current epoch, and no-flap rule.
- **Best permanent fix:** Specify every pairwise race and scope transition;
  preserve current Live content and immutable history; make email/link inert
  after denial.
- **Exact decision/spec language:** “Site/Tenant narrowing, invitation issue,
  source completion, candidate succession, Site transfer/retirement, and lost
  response SHALL each have one deterministic CAS/idempotent outcome with no
  concurrent favorable scope outside the current ceiling.”

### 5. Footguns

**Material concern: Yes.**

- **What could go wrong:** A switch labeled **Enable external reviewers** can be
  toggled without understanding scope; staff may believe a saved contact is
  approved; an admin role may be treated as authority; Site inheritance may be
  invisible; or “Do not allow” may leave current access alive.
- **Why it matters:** A single misleading click could expose protected
  unpublished content or falsely assure administrators that sharing ended.
- **Severity:** Critical.
- **Likelihood:** High without the amended UX.
- **Evidence or reasoning:** D25 separates saved contacts from authority; Phase
  12 forbids visible controls/role names as authorization; current settings
  prototypes use simple switches that are inappropriate for this policy.
- **Decision effect:** Replaces the switch with three radio cards, exact impact,
  explicit save, current-ceiling denial, and separate capabilities.
- **Best permanent fix:** Plain consequences, recommended default, effective
  Site scope, no preselected contact, no optimistic save, and honest active-
  review counts.
- **Exact decision/spec language:** “The UI SHALL NOT label D26 as a generic
  enable switch, imply saved contacts are approved, or claim external review is
  available solely because the posture permits it.”

### 6. Tenant safety

**Material concern: Yes.**

- **What could go wrong:** Tenant/Site identifiers, policy heads, impact counts,
  caches, or active-grant scans can cross scope. A Site administrator could widen
  the Tenant. A cross-Tenant saved contact or grant could be counted or revoked.
- **Why it matters:** External-review policy concerns protected unpublished
  content; cross-Tenant leakage is a release-blocking safety failure.
- **Severity:** Critical.
- **Likelihood:** Medium with structural safeguards; High with caller-scoped or
  UI-only enforcement.
- **Evidence or reasoning:** Core's platform principles make Tenant safety the
  highest priority; Phase 12 documents current MVP cross-Tenant hazards and
  requires a unified Tenant source.
- **Decision effect:** Makes Tenant/environment/scope structural on every record,
  cache, cursor, audit, impact, command, and D25 basis.
- **Best permanent fix:** Composite same-scope relationships, forced RLS,
  server-derived active assignment, Site narrow-only database checks, scoped
  aggregates, and hostile cross-Tenant poison tests across privileged paths.
- **Exact decision/spec language:** “No browser, role, service, worker, support,
  Payload, cache, import, migration, or operator path MAY read, count, mutate,
  deny, or reconcile another Tenant's policy, Site, invitation, or grant.”

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

- **What could go wrong:** Mutable policy rows lose history; missing uniqueness
  permits two heads; incomplete `WITH CHECK` lets a Site row move Tenant/scope;
  direct browser writes forge actor/posture; service role bypasses current
  policy; narrowing commits but grants remain usable; or an allowed update turns
  a narrow Site into a wider one.
- **Why it matters:** UI checks cannot secure external disclosure or prove who
  changed policy.
- **Severity:** Critical.
- **Likelihood:** High without a sole command and database constraints.
- **Evidence or reasoning:** D21/D25 already require immutable revisions,
  composite scope, `USING` plus `WITH CHECK`, direct-write revocation, current
  context reproof, and privileged-path parity.
- **Decision effect:** Requires the conceptual data/RLS contract above and
  distinct capabilities.
- **Best permanent fix:** Immutable versions/current heads, closed checks,
  unique heads, same-scope FKs, restrictive delete, indexed reverse impact,
  forced RLS, least grants, trusted server context, fixed-search-path helpers,
  and request-time policy epoch checks.
- **Exact decision/spec language:** “All D26 business mutations SHALL cross one
  authorized server command; every policy relation SHALL enforce both `USING`
  and `WITH CHECK`, and no allowed mutation may widen a Site beyond Tenant or
  preserve a D25 basis the current posture denies.”

### 8. Overengineering

**Material concern: Yes.**

- **What could go wrong:** Core could import access packages, guest directories,
  approval workflows, custom conditions, reviewer categories, schedules,
  policy simulation, per-locale/source overrides, or a general organizational
  policy engine.
- **Why it matters:** Small ministries would face enterprise security machinery,
  while developers maintain abstractions with no second proven consumer.
- **Severity:** Medium.
- **Likelihood:** Medium because comparable enterprise products expose much
  broader controls.
- **Evidence or reasoning:** D25 explicitly rejects standing guest/workflow
  products; Phase 17 rejects generic frameworks without real consumers; Core
  prioritizes clarity and minimum steps.
- **Decision effect:** Limits D26 to three Tenant states, inheritance plus Site
  narrowing, exact capabilities, and one policy epoch.
- **Best permanent fix:** Reject speculative conditions and keep source-specific
  rules in their source adapters. Re-evaluate only from measured unmet cases.
- **Exact decision/spec language:** “D26 SHALL create no Tenant-authored rule
  predicates, approval chain, external-user directory, per-locale posture,
  reviewer taxonomy, schedule, or automation.”

### 9. UX/UI and user friction

**Material concern: Yes.**

- **What could go wrong:** Staff may not understand recovery versus ordinary
  choice; policy may be buried in Teams or Languages; Site inheritance may be
  invisible; impact confirmation may become a legal essay; or a disabled button
  may offer no next step. Mobile, screen reader, translated, or weak-network
  journeys could lose context.
- **Why it matters:** Confusion either increases unnecessary external sharing or
  pressures staff to broaden permissions and bypass governance.
- **Severity:** High.
- **Likelihood:** High unless the full journey is specified.
- **Evidence or reasoning:** Core requires Base Maia, shared language, clear next
  action, accessibility, perceived speed, and honest states. D21 already uses
  one calm settings pattern; D25 defines a focused invitation journey.
- **Decision effect:** Requires **Settings → Websites → Reviews**, radio cards,
  concise impact, internal-first candidate choice, distinct policy visibility,
  and complete state/accessibility behavior.
- **Best permanent fix:** Task-test setup, Site narrowing, candidate choice,
  policy denial, conflict recovery, and active-impact comprehension with
  representative staff at 320px/400%/keyboard/screen reader/RTL/long text.
- **Exact decision/spec language:** “The normal save SHALL be one deliberate
  action after understandable impact; it SHALL require no typed phrase,
  justification essay, workflow setup, per-Site repetition, or policy jargon.”

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

- **What could go wrong:** D26 policy may become source admission, capability,
  responsibility, invitation, review, or CMS truth. A read model or settings UI
  could start authoring policy. A later internal-eligibility change could mutate
  historical issuance basis.
- **Why it matters:** Dual ownership makes conflicts unrecoverable and audit
  explanations false.
- **Severity:** Critical.
- **Likelihood:** High because D26 crosses Phase 4/6/12/17, Phase 24 sources,
  Mission Control, Site scope, and D25.
- **Evidence or reasoning:** Governing platform boundaries and ADR-0181 already
  split these authorities; D21/D25 include explicit ownership matrices.
- **Decision effect:** Adds the D26 ownership table and 22 invariants.
- **Best permanent fix:** Phase 24 owns only posture/basis/epoch; Phase 12
  authorizes; sources admit and decide; Phase 4 invites; D21/17 present; CMS
  displays only a safe projection.
- **Exact decision/spec language:** “No D26 posture, effective result, impact
  summary, saved contact, route, message, or UI state SHALL grant authority or
  substitute for current source/PDP proof.”

### 11. Hidden coupling

**Material concern: Yes.**

- **What could go wrong:** External choice might silently depend on D21 route
  emptiness, D22 recipient count, the static Teams directory, Phase 17 email
  readiness, Payload roles, or Site locale/default state. A notification change
  could then alter authorization.
- **Why it matters:** Independent changes to routing, communications, CMS, or
  auth would unexpectedly expose or block external review.
- **Severity:** High.
- **Likelihood:** High without typed interfaces.
- **Evidence or reasoning:** D21 explicitly says responsibility is not
  authorization; D25 says delivery is not authority; platform boundaries require
  shared logic convergence without collapsing domains.
- **Decision effect:** Requires typed, narrow inputs and separate lifecycle
  states rather than shared booleans/status enums.
- **Best permanent fix:** D26 consumes only source-admission result, exact
  internal-eligibility proof, current posture heads, and Phase 12 decisions.
  Delivery/routing/CMS changes remain projections or consequences.
- **Exact decision/spec language:** “D21 route state, D22 cardinality, Phase 6
  delivery, Phase 17 presentation, Teams membership, Payload access, and Site
  public state SHALL NOT select or widen a D26 basis.”

### 12. Failure modes

**Material concern: Yes.**

- **What could go wrong:** Impact calculation succeeds but policy commit fails;
  policy commits but lifecycle rows lag; provider email is already accepted;
  epoch cache misses invalidation; step-up returns after a conflicting edit;
  source review completes during narrowing; or a response is lost after commit.
- **Why it matters:** Staff may believe access ended or work completed when only
  part of the effect happened. Retry can duplicate policy versions or revive an
  invitation.
- **Severity:** Critical.
- **Likelihood:** High over asynchronous systems.
- **Evidence or reasoning:** D25 separates invitation, delivery, grant, review,
  and public effect and requires local authority before provider work. D21 uses
  explicit handoff/outbox reconciliation; source commands use expected heads.
- **Decision effect:** Makes policy epoch denial authoritative, lifecycle cleanup
  resumable, and every state/result separately truthful.
- **Best permanent fix:** Commit posture/head/epoch/receipt atomically; use an
  outbox for presentation/lifecycle; revalidate after step-up; reconcile lost
  responses by semantic identity; never claim email recall.
- **Exact decision/spec language:** “A committed narrower policy SHALL deny an
  incompatible D25 basis even if lifecycle reconciliation or notification
  delivery is delayed; every partial/ambiguous outcome SHALL expose its actual
  state and safe retry.”

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

- **What could go wrong:** A posture could mutate in place, widening might revive
  terminated paths, recovery eligibility could flap with roster changes, two
  managers could overwrite each other, or invitation issue could commit against
  a stale ceiling. Same retry key with changed impact could alias a different
  business effect.
- **Why it matters:** Historical policy interpretation and current disclosure
  become unknowable; two individually valid actions can jointly violate the
  ceiling.
- **Severity:** Critical.
- **Likelihood:** High without immutable versions and lock order.
- **Evidence or reasoning:** Core's D21-D25 contracts use stable routing legs,
  immutable candidates/bases, current epochs, expected-head CAS, and semantic
  idempotency.
- **Decision effect:** Adds immutable posture versions, immutable issue basis,
  current eligibility reproof,
  current ceiling matrix, explicit no-resurrection, and documented command order.
- **Best permanent fix:** Append successors; bind issue-time basis; compare
  current epoch on each protected request; lock Tenant before Site before D25
  impact; reject changed-meaning idempotency reuse; test every race ordering.
- **Exact decision/spec language:** “Posture histories and selection bases SHALL
  be immutable; narrowing SHALL be monotonic for current authorization, widening
  SHALL be future-only, and exactly one expected-head command SHALL win each
  concurrent transition.”

### 14. Data integrity risks

**Material concern: Yes.**

- **What could go wrong:** Duplicate current heads, orphan Site overrides,
  missing selection bases, copied policy on clone, stale effective-posture cache,
  broken audit predecessor, deleted actor identity, or partial reconciliation can
  make reports and authorization disagree.
- **Why it matters:** Core could grant access that audit says was prohibited or
  deny access without explaining the governing policy.
- **Severity:** Critical.
- **Likelihood:** Medium with relational constraints; High with mutable settings
  and best-effort jobs.
- **Evidence or reasoning:** Phase 2 requires same-UUID Tenant/Site operational
  ownership; D21/D25 require exact composite relationships, unique heads,
  restrictive delete, indexed lookups, and immutable receipts.
- **Decision effect:** Requires non-null closed basis, unique heads, same-scope
  FKs, exact clone/transfer semantics, and repair that never fabricates access.
- **Best permanent fix:** Enforce structural constraints, periodic head/epoch/
  grant compatibility verification, body-free correction records, and
  fail-closed cache versioning.
- **Exact decision/spec language:** “No migration, clone, import, transfer,
  repair, or privacy erasure MAY fabricate, widen, retarget, revive, or delete
  the integrity evidence for a D26 policy or D25 selection basis.”

### 15. Security and privacy risks

**Material concern: Yes.**

- **What could go wrong:** A permissive setting can normalize disclosure;
  impact counts or Site names can reveal restricted operations; policy logs can
  retain reviewer identities; a stale open session can keep a projection; an
  operator/service path can bypass off; or a settings page can leak across
  Tenant/role.
- **Why it matters:** Protected ministry, missionary, location, member-care, or
  legal context may be physically or legally sensitive even when the projection
  is minimized.
- **Severity:** Critical.
- **Likelihood:** Medium with D25/D26 controls; High if UI-only or over-logged.
- **Evidence or reasoning:** Core's safety ladder prioritizes Tenant/permission
  correctness; D25 forbids unrelated data, trackers, generic navigation, and
  standing access; Phase 12 treats restricted-person exposure as physical safety.
- **Decision effect:** Adds explicit prohibition, internal-first UX,
  current-ceiling denial, purpose-limited counts/audit, and privileged-path parity.
- **Best permanent fix:** Data minimization before storage, no-store/no-third-
  party reviewer surface, exact purpose/capability, policy epoch on every
  operation, safe display projections, retention/pseudonymization, and red-team
  cross-scope/session/cache tests.
- **Exact decision/spec language:** “D26 policy, impact, audit, logs, traces,
  exports, backups, caches, and support tools SHALL retain only the minimum
  identifiers and closed facts required for authorization integrity and SHALL
  expose no protected candidate body or unrelated person/site detail.”

### 16. Scalability and performance risks

**Material concern: Yes.**

- **What could go wrong:** Tenant posture change may scan every Site, candidate,
  Party, and invitation synchronously; recovery eligibility may enumerate an
  unbounded directory; every protected read may perform N source queries; impact
  previews may lock active grants; or one large Tenant may delay another.
- **Why it matters:** A safe policy that times out becomes unusable; pressure to
  bypass it creates security debt. Long transactions increase race/deadlock risk.
- **Severity:** High.
- **Likelihood:** Medium initially, High with larger Tenants and source fan-out.
- **Evidence or reasoning:** D21/D25 require bounded resolvers, keyset search,
  indexed reverse lookup, short transactions, batch adapters, timeout as
  indeterminate, and no provider call under locks.
- **Decision effect:** Requires selection-basis-indexed impact rather than
  recompiling every candidate, request-time epoch checks, and bounded async
  reconciliation.
- **Best permanent fix:** Constant-shape current-head/epoch lookup, indexed
  active-basis counts, source-provided bounded eligibility proof, chunked
  reconciliation, per-Tenant work partitioning, production-shaped p50/p95/p99
  budgets, and no security-check removal to meet latency.
- **Exact decision/spec language:** “A posture command SHALL NOT synchronously
  traverse unbounded Sites, people, source graphs, or projection bodies; timeout
  or `limit + 1` SHALL be indeterminate and SHALL never preserve favorable
  access outside the new ceiling.”

### 17. Operational burden

**Material concern: Yes.**

- **What could go wrong:** Staff may need to configure every Site, revoke every
  invitation after narrowing, ask developers to repair stale settings, maintain
  reviewer pools, or reconcile policy against capabilities and source settings.
- **Why it matters:** Small missions organizations will either abandon the
  control or over-grant access to get work done.
- **Severity:** High.
- **Likelihood:** High if the system is prospective-only or per-Site by default.
- **Evidence or reasoning:** Core prioritizes durable system behavior over manual
  glue; D21 uses Tenant inheritance with rare Site override; D25 provides
  self-service resend/cancel/revoke/replace.
- **Decision effect:** Keeps one Tenant default, inheritance, optional Site
  narrowing, automatic current denial, and self-service recovery.
- **Best permanent fix:** Initialize recovery-only, show effective coverage and
  narrower Site counts, make one save apply across scope, reconcile automatically,
  and provide active-review management without direct database intervention.
- **Exact decision/spec language:** “Ordinary Tenants SHALL configure at most one
  posture; ordinary Sites SHALL inherit; narrowing SHALL enforce current scope
  without requiring staff to discover and revoke each incompatible grant.”

### 18. Observability and auditability gaps

**Material concern: Yes.**

- **What could go wrong:** Technical logs may say a setting changed without
  proving old/new posture, scope, actor, impact, selection basis, or current
  denial. Lifecycle lag, epoch drift, cross-scope rejection, or active access
  outside policy may go undetected. Staff may see only a toast.
- **Why it matters:** Security, support, and Tenant staff cannot answer who
  changed policy, what ended, whether access is currently denied, or how to
  repair.
- **Severity:** High.
- **Likelihood:** High without durable business evidence and named monitors.
- **Evidence or reasoning:** D21/D25 distinguish business audit from logs and
  require immutable receipts, exact digests, and reconciliation signals.
- **Decision effect:** Adds durable command receipts, current compatibility
  verification, staff history, programmatic status, and the monitor table below.
- **Best permanent fix:** Body-free audit with stable actor/source references;
  technical correlation separate; scheduled invariant verifier; dashboards and
  alerts with named owner/threshold/response; privacy-safe Tenant history.
- **Exact decision/spec language:** “Every posture transition and policy-ended
  D25 basis SHALL be causally traceable through immutable business evidence;
  logs, toasts, provider events, and cleanup state SHALL NOT substitute.”

### 19. Dependency and integration risks

**Material concern: Yes.**

- **What could go wrong:** Phase 4/6/12/17 or D21-D25 may not be Live; Supabase
  invite/auth behavior may be mistaken for authorization; Payload may copy
  policy; external-email delivery may be unavailable; source adapters may
  disagree; or current broad auth roles may be preserved for convenience.
- **Why it matters:** D26 can appear complete while its enforcement foundation is
  absent or contradictory.
- **Severity:** Critical.
- **Likelihood:** High because the required cross-phase runtime is not built.
- **Evidence or reasoning:** D25 current-state audit finds no Candidate Review
  Authorization Context or external-review endpoint; active OpenSpec remains
  weaker and uses latest-editor wording; current Teams/auth are prototypes.
- **Decision effect:** Blocks implementation/Live activation until all named
  dependencies and source manifests are compatible.
- **Best permanent fix:** Versioned interface/manifest compatibility, deny-by-
  default source adapters, auth-not-authority tests, no CMS policy copy, no
  provider fallback, feature/source kill switches, and generated trace closure.
- **Exact decision/spec language:** “D26 MAY become Live only with compatible
  Phase 4 invitation, Phase 12 context/PDP, D23/D24 eligibility, D25 grant,
  source admission, and policy-epoch generations; any missing or mixed
  generation SHALL deny.”

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

- **What could go wrong:** Migration may infer a favorable posture from current
  roles, invitations, external emails, Sites, or static UI; old code may ignore a
  new `external_review_prohibited` epoch; new code may read absent heads;
  rollback may widen
  after current policy has ended grants; or new Sites may copy source policy.
- **Why it matters:** Mixed versions can expose content outside the Tenant's
  declared ceiling and make rollback unsafe after new data exists.
- **Severity:** Critical.
- **Likelihood:** High unless rollout is additive and deny-first.
- **Evidence or reasoning:** There is no production D26 truth to migrate. D23-
  D25 require fresh-build, Reserved keys, source manifests, kill switches, and
  no favorable inference from legacy roles/tasks/editor fields.
- **Decision effect:** Requires deterministic `recovery_only` initialization,
  new-code/old-schema fail closed, old-code/new-schema fencing, and roll-forward
  repair rather than destructive rollback.
- **Best permanent fix:** Expand/contract schema, write current heads before
  readers, dark-read compatibility, source-by-source activation, cohort canary,
  policy epoch kill switch, preserve immutable versions, and prove rollback
  cannot restore denied grants.
- **Exact decision/spec language:** “Migration SHALL infer no
  `source_permitted_choice`, Site widening, selection basis, invitation, or grant
  from existing users, roles, Sites, emails, tasks, routes, or CMS data; every
  Tenant SHALL receive an explicit `recovery_only` initialization version.”

### 21. Testability, traceability, and proof

**Material concern: Yes.**

- **What could go wrong:** “Bounded choice,” “Site may narrow,” “no reviewer,” or
  “current ceiling” can pass happy-path tests while cross-Tenant, stale-cache,
  race, migration, accessibility, or active-revocation behavior is wrong.
- **Why it matters:** The decision is not independently falsifiable and can drift
  across founder log, glossary, ADR, PRDs, OpenSpec, design, tickets, code, UI,
  tests, and release evidence.
- **Severity:** Critical.
- **Likelihood:** High without closed enums, basis matrix, and acceptance pack.
- **Evidence or reasoning:** Core requires behavior-outcome proof and current
  OpenSpec contains known D24/D25 gaps. D21-D25 provide the trace pattern.
- **Decision effect:** Requires the 100 acceptance criteria below plus generated
  owner/version trace and hostile negative/race/accessibility/migration proof.
- **Best permanent fix:** Trace each D26 rule and state through artifacts;
  property-test lattice monotonicity; pgTAP RLS/constraints; integration and E2E
  user outcomes; production-shaped performance; independent release evidence.
- **Exact decision/spec language:** “No D26 key or source adapter SHALL be Live
  until every D26-R1–R18 rule, enum edge, Site/Tenant combination, selection
  basis, authorization path, race, migration, and user-visible state has positive
  and hostile traceable proof.”

### 22. Other development hazards

**Material concern: Yes.**

- **What could go wrong:** “External review off” could be treated as a self-
  review emergency; `recovery_only` could become an availability/presence engine;
  internal and external actionable lanes could run concurrently without an
  explicit owner; support might flip policy; or staff may think policy review
  satisfies legal/confidentiality obligations.
- **Why it matters:** These seams create unsafe bypasses, unclear accountability,
  or false compliance claims beyond the setting's scope.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence or reasoning:** D23 rejects admin/self-review and availability
  inference; D21/D22 own responsibility; D25 first-wins settles source action but
  not internal attention presentation after external selection.
- **Decision effect:** Explicitly preserves safe dead-end behavior, forbids
  support/operator bypass, and routed lane ownership to D27.
- **Best permanent fix:** No self-review fallback; plain blocked-state recovery;
  capability and policy remain separate; D27 now chooses one active actionable
  lane with deliberate takeover before D26 implementation.
- **Exact decision/spec language:** “`external_review_prohibited` SHALL leave novel protected
  work safely blocked rather than weaken independent review; D26 SHALL NOT infer
  availability or decide internal/external attention-lane ownership, which
  requires the separately ratified D27 contract.”

## Acceptance criteria

These are falsifiable decision outcomes for later OpenSpec/design/test work.
They are not a claim that implementation exists.

### Policy initialization and hierarchy

1. **D26-AC001 — Bootstrap default.** A deliberate new-Tenant/no-row bootstrap
   resolves to `recovery_only` without creating an invitation or communication.
2. **D26-AC002 — Migration default.** Existing Tenants receive no inferred
   opt-in and resolve to `recovery_only`.
3. **D26-AC003 — Corrupt state.** Unknown, corrupt, unsupported, or unexpectedly
   missing initialized policy fails as `external_review_prohibited` and emits a
   repair signal.
4. **D26-AC004 — Closed Tenant codes.** Only
   `external_review_prohibited`, `recovery_only`, and
   `source_permitted_choice` persist at Tenant scope.
5. **D26-AC005 — Closed Site codes.** Only `inherit_tenant`,
   `recovery_only`, and `external_review_prohibited` persist at Site scope.
6. **D26-AC006 — Inheritance.** An inheriting Site resolves the current Tenant
   head, not a copied prior value.
7. **D26-AC007 — Site recovery narrowing.** A Site beneath an optional Tenant
   may select recovery-only.
8. **D26-AC008 — Site prohibition.** A Site beneath optional or recovery-only
   Tenant policy may prohibit external review.
9. **D26-AC009 — No Site optional code.** A Site cannot persist or request
   `source_permitted_choice`; it obtains optionality only through inheritance.
10. **D26-AC010 — No child widening.** A Site cannot select an effective posture
    more permissive than its current Tenant.
11. **D26-AC011 — Explicit/effective display.** Authorized settings viewers see
    Tenant choice, Site choice, and effective Site posture separately.
12. **D26-AC012 — Environment isolation.** Preview/staging posture never becomes
    Production posture by inference, clone, or deployment.
13. **D26-AC013 — New Site behavior.** A new Site inherits its destination
    Tenant and receives no copied active external authority.
14. **D26-AC014 — Site transfer.** A transferred Site loses old-Tenant policy and
    active external contexts before destination resolution.
15. **D26-AC015 — Site retirement.** A retired Site admits no new D25 issue while
    preserving required policy/history evidence.

### Action availability and source floors

16. **D26-AC016 — Recovery success.** Recovery-only plus complete current
    proved-zero internal eligibility may expose D25 when every other gate passes.
17. **D26-AC017 — Recovery denied by internal.** Recovery-only plus one eligible
    internal human exposes no external action.
18. **D26-AC018 — Optional choice.** Optional posture plus an eligible internal
    human may expose a secondary D25 action when every source permits.
19. **D26-AC019 — Prohibition.** Prohibition exposes no D25 action even after
    proved-zero internal eligibility.
20. **D26-AC020 — Partial is not zero.** A partial internal resolver result
    releases no recovery action.
21. **D26-AC021 — Timeout is not zero.** Timeout, truncation, `limit + 1`, stale,
    failed, or contradictory eligibility releases no recovery action.
22. **D26-AC022 — Route is not eligibility.** Empty D21 routing neither proves
    zero internal eligibility nor releases D25.
23. **D26-AC023 — Engagement is not availability.** Unread, silence, email
    failure, elapsed time, presence, or staff activity never proves recovery.
24. **D26-AC024 — One source blocks.** One source prohibition or
    internal-officer requirement blocks the combined external path.
25. **D26-AC025 — Source unknown blocks.** Stale/unknown/incompatible source
    admission or projection blocks the combined external path.
26. **D26-AC026 — D23 preserved.** Optional posture never weakens a source-owned
    proportional independence floor.
27. **D26-AC027 — D24 preserved.** Optional posture never makes a substantive
    participant eligible.
28. **D26-AC028 — D25 scope preserved.** Every external action remains one human,
    one candidate, one projection, one expiry, and no membership.
29. **D26-AC029 — Internal primary.** When internal review is eligible, the UI
    leads with internal review and renders external as deliberate secondary.
30. **D26-AC030 — Source qualifier.** Optional policy presentation says **for
    source-approved changes** and never merely **enabled**.

### Side-effect and authority separation

31. **D26-AC031 — Widening sends nothing.** Widening sends no invitation,
    notification, email, or external request.
32. **D26-AC032 — Widening grants nothing.** Widening creates no context, grant,
    membership, route, task, or attention item.
33. **D26-AC033 — Saved contact remains inert.** Widening neither selects nor
    authorizes a saved reviewer contact.
34. **D26-AC034 — Fresh candidate decision.** Staff still review the D25 scope
    and deliberately send one invitation for one candidate.
35. **D26-AC035 — Capability conjunction.** Policy permission without D25 issue
    capability cannot issue; issue capability without policy admission cannot
    issue.
36. **D26-AC036 — Role labels inert.** Owner/Admin/Website manager labels alone
    cannot view, change, or issue.
37. **D26-AC037 — Separate manage capabilities.** Tenant change, Site narrowing,
    safe view, impact view, active-review management, and issue are independently
    enforceable.
38. **D26-AC038 — No public mutation.** Every posture read/change leaves Site
    content, Pages, Navigation, locale/default, and public URLs unchanged.
39. **D26-AC039 — Giving/finance absence.** Every path creates zero Giving,
    Legal Entity, Stripe, settlement, bank, currency, contribution, receipt,
    ledger, accounting, or payout effect.
40. **D26-AC040 — Histories separate.** Policy, invitation, delivery, projection
    access, reviewer decision, attention, and public effect remain distinct facts.

### Narrowing, current access, and no resurrection

41. **D26-AC041 — Current prohibited denial.** Prohibition immediately denies
    every pending or accepted D25 path in effective scope at policy-head commit.
42. **D26-AC042 — Recovery narrowing.** Optional→recovery immediately denies
    paths that do not satisfy complete current proved-zero internal eligibility.
43. **D26-AC043 — Newly eligible internal under recovery.** A newly eligible
    internal human ends favorable recovery-only external access.
44. **D26-AC044 — Newly eligible internal under optional.** Internal eligibility
    alone does not end an otherwise-current optional-mode D25 grant.
45. **D26-AC045 — Source change still revokes.** Source/admission/candidate/
    participant/identity/projection/auth/revocation/expiry changes retain D25
    immediate invalidation regardless of posture.
46. **D26-AC046 — Completed history.** Narrowing never erases, reattributes, or
    retroactively invalidates a completed review receipt/public effect.
47. **D26-AC047 — Cleanup not authority.** Request-time policy denial works even
    while per-context lifecycle reconciliation is delayed.
48. **D26-AC048 — In-flight email truth.** Narrowing does not claim email recall;
    a late link cannot yield current favorable context.
49. **D26-AC049 — No reactivation.** Later widening never revives old invitation,
    credential, grant, session, link, or delivery.
50. **D26-AC050 — Fresh recovery after widening.** A lawful later path requires a
    fresh D25 invitation and all current proofs.

### Authorization, RLS, and data integrity

51. **D26-AC051 — Trusted scope.** Server derives Tenant, environment, Site,
    actor, active assignment, capability, assurance, and audit attribution.
52. **D26-AC052 — Caller poison denied.** Caller actor/Tenant/Site/posture/head/
    impact/basis/epoch fields cannot become authority.
53. **D26-AC053 — No direct writes.** Browser roles cannot directly mutate
    policy versions, heads, epochs, receipts, or D25 selection basis/state.
54. **D26-AC054 — RLS read isolation.** `USING` denies cross-Tenant,
    cross-environment, cross-Site, wrong-purpose, and unauthorized reads.
55. **D26-AC055 — Mutation-state isolation.** `WITH CHECK`/command validation
    prevents an allowed row from moving to a forbidden scope or wider posture.
56. **D26-AC056 — Forced RLS.** Every Tenant policy relation has enabled and
    forced RLS with no ambient `USING(true)` escape.
57. **D26-AC057 — Privileged parity.** RPC, view, worker, service, repair,
    support, operator, impersonation, Payload, import, and migration paths pass
    the identical policy/source/authorization poison matrix.
58. **D26-AC058 — Safe definer.** Security-definer helpers use qualified objects,
    fixed safe search path, least privilege, and revoked public execution.
59. **D26-AC059 — Unique heads.** Constraints permit one current Tenant head per
    Tenant+environment and one Site head per Tenant+environment+Site.
60. **D26-AC060 — Immutable versions.** Committed posture versions, actor,
    predecessor, command identity, and D25 issuance basis cannot mutate.
61. **D26-AC061 — Same-scope relationships.** Site override, policy heads,
    receipts, and D25 references cannot cross Tenant/environment/Site.
62. **D26-AC062 — Restrictive deletion.** Site/Party/privacy lifecycle cannot
    cascade-delete or retarget integrity evidence.
63. **D26-AC063 — No policy body copy.** Policy rows contain no reviewer email,
    candidate body, source content, participant list, public state, or finance.
64. **D26-AC064 — Cache fencing.** Every favorable cache/context includes current
    Tenant/Site policy heads and authorization epoch; stale favorable serve fails.
65. **D26-AC065 — Privacy-safe impact.** Managers see exact rows only where
    separately authorized and a safe hidden count otherwise.

### Concurrency, failure, and idempotency

66. **D26-AC066 — One concurrent winner.** Two saves against one expected head
    produce one winner and one explicit current-state conflict.
67. **D26-AC067 — Recomputed conflict.** The losing manager receives current
    posture and a new permission-filtered impact, not silent overwrite.
68. **D26-AC068 — Exact replay.** Same semantic key and same meaning returns the
    original receipt with no duplicate version, epoch, or reconciliation.
69. **D26-AC069 — Changed-meaning replay denied.** Reusing a key with different
    Tenant/Site/head/posture/impact/actor/meaning rejects.
70. **D26-AC070 — Lost response.** Client reconciles current head and command
    receipt before offering retry or claiming failure.
71. **D26-AC071 — Step-up reproof.** Returning from step-up preserves draft but
    rechecks head, capability, assurance, and impact before commit.
72. **D26-AC072 — Issue/narrow race.** Invitation issue racing a narrower policy
    yields at most one lawful favorable result; stale issue sends nothing.
73. **D26-AC073 — Review/narrow race.** Final review racing policy narrowing
    yields one lawful source/policy outcome and no stale public effect.
74. **D26-AC074 — Atomic local truth.** Policy head, version, epoch, receipt, and
    durable reconciliation obligation either commit together or not at all.
75. **D26-AC075 — No provider in transaction.** No email/provider/network call
    occurs while policy locks are held.
76. **D26-AC076 — Outbox failure.** Worker/provider failure cannot roll back,
    invent, widen, or delay current authorization truth.
77. **D26-AC077 — Reconciliation replay.** Replaying policy-ended lifecycle work
    appends at most one terminal meaning and never revives or duplicates.
78. **D26-AC078 — Corrupt impact fails safely.** Missing/partial/over-limit impact
    cannot produce a falsely narrow count or favorable stale save.
79. **D26-AC079 — Policy/source race visibility.** Staff can distinguish policy
    saved, external access ended, review completed, and public effect.
80. **D26-AC080 — Current Site remains.** Every failure/race leaves the prior Live
    Site active unless an independently valid source command already won.

### UX, accessibility, localization, and resilience

81. **D26-AC081 — Correct information architecture.** Tenant policy appears in
    **Settings → Websites → Reviews**, separately from D21 notifications.
82. **D26-AC082 — Three-choice radio.** Tenant posture uses one visible labeled
    radio group, not an ambiguous switch or three hidden toggles.
83. **D26-AC083 — Explicit save.** Selecting a radio changes only draft; no
    access, context, navigation, or unexpected save occurs on input.
84. **D26-AC084 — Recommendation honest.** Recovery-only is labeled recommended
    for new/default choice; existing saved value is never silently reset.
85. **D26-AC085 — Widening impact.** Confirmation states scope, internal-first
    behavior, D25/source limits, and **This does not send an invitation**.
86. **D26-AC086 — Narrowing impact.** Confirmation states current affected count,
    access-ending consequence, safe blocked outcomes, and unchanged Live/Giving.
87. **D26-AC087 — No redundant ceremony.** No destructive dialog appears when
    effective posture/access does not change.
88. **D26-AC088 — Candidate optional flow.** Internal review is primary;
    external is a deliberate secondary action with exact disclosure.
89. **D26-AC089 — Candidate recovery flow.** Proved-zero explains why one
    external reviewer is needed and keeps current Site visible.
90. **D26-AC090 — Candidate prohibited flow.** External picker/contacts are
    absent; authorized policy viewers receive the policy path; others receive a
    safe handoff without private detail.
91. **D26-AC091 — Revoked reviewer UX.** Reviewer loses protected content/action
    and sees privacy-safe **This review is no longer available**.
92. **D26-AC092 — Status semantics.** Save/error/conflict/revocation results are
    programmatically announced without focus theft; toast is supplemental only.
93. **D26-AC093 — Keyboard/focus.** Radio, save, cancel, impact dialog, step-up
    return, error recovery, and trigger restoration work keyboard-only.
94. **D26-AC094 — Reflow/zoom.** Complete Tenant/Site/candidate/impact journeys
    preserve content/function at 320 CSS pixels and 400% zoom without two-axis
    scrolling.
95. **D26-AC095 — Nonvisual meaning.** No policy, inheritance, impact, or access
    meaning relies only on color, icon, badge, indentation, hover, avatar, or
    motion.
96. **D26-AC096 — Target/contrast.** Controls meet Core's touch-target, focus,
    forced-color, high-contrast, and semantic-token contracts.
97. **D26-AC097 — International content.** Long Unicode Tenant/Site/person/locale
    values, CJK, combining characters, RTL/bidi, translated expansion, time zone,
    and pluralized counts remain clear and safe.
98. **D26-AC098 — Weak network.** Draft survives recoverable failure; no offline
    final save/invite; retry reconciles before repeating an effect.
99. **D26-AC099 — Traceability.** D26 answer, glossary, ADR-0181 amendment, PRDs,
    OpenSpec, design, manifest, tickets, code, tests, and release evidence use
    the same postures, hierarchy, current predicate, capabilities, states, and
    zero-effect boundaries.
100.  **D26-AC100 — D27 boundary.** D26 tests prove source first-wins but do not
      silently choose parallel or single-lane D21/D22 attention. D27 separately
      ratifies one source-owned responsibility lane with deliberate takeover.

## Named monitoring plan

Thresholds below are launch hypotheses. Owners must ratify them against
production-shaped tests and early cohort baselines before alerts are enabled.
No monitor may widen policy, invite a reviewer, restore a grant, complete review,
publish content, or change Giving/finance automatically.

| Signal                                                     | Threshold                                                                   | Owner                          | Required response                                                                                     |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `external_review_policy_unknown_state_total`               | any                                                                         | Site IAM + Security            | fail prohibited, fence D25 in scope, inspect version/migration, repair before re-enable               |
| `external_review_site_widen_attempt_total`                 | any accepted attempt; repeated denied attempts by one actor/session alert   | Site IAM                       | verify denial, inspect UI/API mismatch or abuse, fix caller/command                                   |
| `external_review_policy_cross_scope_denial_total`          | any                                                                         | Security                       | preserve evidence, inspect Tenant/environment/Site binding, pause affected command if systemic        |
| `external_review_policy_cross_environment_effect_total`    | any                                                                         | Security + Release Engineering | incident; deny affected scopes, inspect clone/deploy/config propagation, prove Production head        |
| `external_review_policy_stale_favorable_serve_total`       | any                                                                         | Security + Platform            | incident; revoke contexts, fence caches, trace every read/effect, notify Tenant under incident policy |
| `external_review_policy_narrow_revocation_mismatch_total`  | any                                                                         | Site Product + Security        | confirm epoch denial, hide affected projection, replay reconciliation, repair invariant               |
| `external_review_revoked_context_success_total`            | any                                                                         | Security                       | P0 incident; stop external review, revoke sessions, inspect disclosure/source effects                 |
| `external_review_policy_resurrection_total`                | any                                                                         | Security + Site IAM            | incident; end resurrected context, fence widening path, inspect every dormant credential              |
| `external_review_policy_command_ambiguous_total`           | any unresolved after 5 minutes                                              | Platform Operations            | reconcile receipt/head, retain safest current posture, show staff authoritative truth                 |
| `external_review_policy_epoch_cache_lag_seconds`           | any favorable cache beyond current epoch; p99 above 60 seconds              | Platform + Security            | invalidate/fence cache generation; current protected commands remain server-checked                   |
| `external_review_policy_reconciliation_oldest_age_seconds` | oldest policy-ended context above 15 minutes                                | Platform Operations            | replay idempotent reconciler, confirm current denial, repair outbox/worker                            |
| `external_review_policy_save_error_rate`                   | above 1% of eligible saves in 1 hour, minimum 20                            | Platform Operations            | inspect command/database health, preserve current posture, expose repair guidance                     |
| `external_review_policy_conflict_rate`                     | above 5% of eligible saves in 7 days, minimum 20                            | Site Product                   | inspect stale-form/session UX and concurrency; do not weaken CAS                                      |
| `external_review_policy_denied_send_rate`                  | above 5% of send attempts in 7 days, minimum 20                             | Site Product                   | inspect stale UI/policy explanation/races; fix UI/cache, not authorization                            |
| `external_review_recovery_indeterminate_rate`              | above 5% of recovery attempts in 24 hours, minimum 20                       | Phase 12 + Source owners       | inspect resolver/source coverage, keep unknown fail-closed, repair bounded proof                      |
| `external_review_optional_invite_rate`                     | above 3× Tenant trailing 28-day rate without known rollout                  | Tenant Website owner + Product | inspect audit for misuse/training; do not auto-disable on volume alone                                |
| `external_review_optional_vs_internal_selection_ratio`     | baseline only for first release                                             | Product Research               | study demand/comprehension; never infer wrongdoing or availability from choice                        |
| `external_review_policy_hidden_impact_disclosure_total`    | any hidden Site/reviewer/candidate detail leaked                            | Security + Privacy             | incident; suppress impact rows, inspect affected viewers/logs, repair projection                      |
| `external_review_policy_capability_bypass_total`           | any policy save/impact/issue without exact capability and active assignment | Security                       | P0 stop command, revoke resulting paths, inspect all privileged routes                                |
| `external_review_policy_audit_gap_total`                   | any committed head without one command receipt/outbox obligation            | Site IAM + Platform            | fence further writes, reconstruct only from authoritative transaction evidence, repair                |
| `external_review_policy_a11y_failure_total`                | any critical automated or manual defect                                     | Accessibility + Site Product   | block rollout, repair shared primitive/composition, rerun manual proof                                |
| `external_review_policy_task_comprehension_rate`           | below 85% in moderated pilot for posture/effect questions                   | Product Research + Design      | revise copy/hierarchy, repeat testing before cohort expansion                                         |

## Migration, rollout, upgrade, and rollback

1. Keep D20-D26 keys Reserved. This report does not authorize implementation.
2. Land the D24 all-substantive-participant rule, D25 Candidate Review
   Authorization Context, Phase 4 invitation owner, and source adapters first.
3. Add the closed Tenant/Site policy model, immutable heads/receipts, current
   resolver, and D25 policy-generation/basis binding behind a server kill switch.
4. Deliberate no-row bootstrap and migration resolve `recovery_only`; infer no
   optional/prohibited value from roles, Sites, contacts, invitations, prior
   external activity, integration sharing, or CMS state.
5. Unknown/corrupt initialized state fails `external_review_prohibited` and
   surfaces a repair case only to the authorized owner.
6. Deploy read/enforcement compatibility before write UI. Old code must not
   ignore new policy heads or treat an unknown value as optional.
7. Prove policy-head/epoch narrowing denies incompatible pending/accepted D25
   reads and final commands before exposing any policy write.
8. Prove the same-transaction receipt/outbox obligation and idempotent lifecycle
   reconciler before allowing narrowing with active paths.
9. Dark-read effective Tenant/Site posture and impact against synthetic data;
   never dark-authorize or send.
10. Pilot with synthetic/internal Tenants, then a small explicit cohort including
    solo, multi-Site, restricted-field, multilingual, low-bandwidth, and assistive-
    technology journeys.
11. Activate one source adapter generation at a time. One mixed/missing source
    generation denies external review.
12. Use roll-forward repair. Reverting code after policy/grant data exists is not
    a truthful rollback if old code could ignore the current ceiling.
13. A kill switch may collapse optional selection to recovery-only or prohibit
    D25 under a declared incident posture, but can never widen or resurrect.
14. Preserve immutable policy, invitation, actor, review, and source-effect
    evidence through rollout/rollback; never rewrite history to claim compliance.
15. General availability requires Tenant-visible history, named monitor owners,
    incident/runbook proof, representative UX/a11y evidence, and trace closure.

## Required ADR, glossary, OpenSpec, and trace changes

### ADR-0181 amendment

ADR-0181 deliberately reserved whether a Tenant may offer D25 while an internal
reviewer exists. Amend it to record:

1. Phase 24 Website-review governance owns the closed three-state availability
   posture in Asym Postgres; Phase 12 authorizes, and sources retain admission.
2. `recovery_only` is the deliberate bootstrap/migration default; corrupt or
   unknown initialized state fails prohibited.
3. Site choice is inherit or narrow-only; no Site can widen Tenant.
4. Current posture and current recovery eligibility are rechecked on every D25
   protected operation.
5. Narrowing advances the policy epoch and immediately denies incompatible
   paths; lifecycle evidence reconciles afterward.
6. Widening sends nothing, grants nothing, and never revives a terminated path.
7. Capability omission is not an organizational prohibition; policy and
   capability are conjunctive.

This clarifies ADR-0181's existing statement that current policy changes end
favorable access. It does not reopen D25 identity, projection, cardinality,
expiry, replacement, source CAS, or no-finance boundaries.

### Glossary addition

Add:

> **Website External Review Availability Posture** (Phase 24): The private,
> versioned Tenant Website-governance ceiling that prohibits source-authorized
> external review, admits it only while complete current proof finds no eligible
> internal reviewer, or permits authorized staff to choose it for a source-
> approved exact candidate. A Site inherits or narrows the Tenant; the posture
> grants no capability, invitation, review authority, membership, or public
> effect.  
> _Avoid_: external review enabled; guest sharing switch; reviewer permission;
> Site widening; availability/presence status; external-review workflow.

### Future OpenSpec/design trace

Future normative work must replace the active outbound-communications delta's
latest-editor and weak one-person sentence with D24/D25/D26 exact behavior. It
must trace:

```text
D26 founder answer
  → glossary term
  → ADR-0181 amendment
  → Phase 24/4/6/12/17 PRDs
  → active OpenSpec requirements/scenarios
  → policy/source/capability manifests
  → relational/RLS design
  → implementation tickets
  → source/API/UI/database tests
  → release evidence and monitors
```

No ADR, decision log, or report authorizes runtime implementation on its own.

## Ruthless synthesis

### Must be resolved before recording D26

Resolved by this report:

1. replace two loose values with the complete three-state lattice;
2. distinguish deliberate no-row recovery initialization from corrupt fail-
   prohibited state;
3. close Tenant ceiling and Site narrow-only inheritance;
4. separate organizational posture from Phase 12 capability and source
   admission;
5. define current recovery eligibility, current policy denial, lifecycle
   reconciliation, and no resurrection;
6. define internal-first candidate UX, Settings information architecture,
   impact confirmations, and blocked states;
7. close operational ownership, relational/RLS/auth/concurrency boundaries;
8. state public/Giving/finance zero effects; and
9. isolate the then-unresolved D27 responsibility lane, now closed by ADR-0182.

### Must be captured before implementation

1. D26-R1–R18 or traceably equivalent normative requirements.
2. Exact capability registry meanings and assurance profiles.
3. The policy/basis/head/epoch/receipt relational model and RLS poison matrix.
4. D25 current-policy/current-zero re-evaluation and atomic narrowing contract.
5. Source-adapter compatibility generations and strictest-wins resolver.
6. Base Maia Tenant/Site/candidate/reviewer journeys with every state above.
7. All 100 acceptance outcomes and generated cross-artifact trace.
8. Migration, mixed-version, canary, kill-switch, roll-forward, and incident
   proof.
9. The now-ratified D27 lane/takeover contract before optional-mode internal/
   external attention can be marked Live.

### Implementation safeguards

- one canonical server writer and one effective-posture resolver;
- immutable versions, expected heads, semantic idempotency, and policy epoch;
- request-time denial independent of cleanup;
- no direct browser writes or trusted-backend bypass;
- exact Tenant/environment/Site/purpose/capability/assurance on every path;
- no provider call in policy transaction;
- no CMS copy, generic policy engine, or guest membership;
- no optimistic policy/access success;
- privacy-safe impact and durable business audit; and
- current public Site remains active on failure.

### Monitor only with named controls

Optional-use demand, internal-versus-external selection, copy comprehension,
save/conflict/denied-send rates, resolver indeterminate rate, reconciliation lag,
and accessibility quality may be monitored only through the named signals,
thresholds, owners, and responses above. Monitoring cannot silently change
policy or access.

### Unresolved unknowns

1. Exact Phase 12 capability identifiers and final assurance profiles.
2. Final environment UX and whether Production needs an explicit label in every
   consequence confirmation.
3. Which sources beyond Phase 17 will launch with qualified D25 adapters.
4. Real Tenant demand and usage distribution for optional/prohibited postures.
5. Moderated comprehension of **Do not allow**, **Only when needed**, **Allow as
   an option**, and **Ask a Website administrator**.
6. Governing retention/anonymization periods for policy and actor evidence.
7. Baseline values needed to ratify monitor thresholds.
8. D28 decline/expiry recovery after D27's one-lane behavior.

## Final disposition

**Accept with required amendments.**

Record the founder's answer as:

> Core provides one Phase 24-owned, versioned Website External Review
> Availability Posture per Tenant and environment with exactly three ordered
> values: **Do not allow external review**, **Only when no eligible internal
> reviewer exists** (the default), and **Allow external review as an option for
> source-approved changes**. Each Site inherits or deliberately narrows to
> recovery-only or prohibited; it never widens the Tenant. Policy is one current
> authorization ceiling, conjunctive with exact Phase 12 capabilities, every
> source's D25 admission, D23/D24 independence, and all D25 identity/projection/
> lifecycle safeguards. Narrowing immediately denies incompatible pending or
> accepted paths through current policy/eligibility reproof and idempotently
> records their end; widening sends nothing, grants nothing, and never revives.
> Internal review remains the ordinary visual default. Settings use one clear
> Base Maia three-choice radio journey with explicit save and permission-safe
> impact. D26 creates no membership, workflow, public, Giving, or financial
> effect.

## Recommended next one-at-a-time Grill question

### D27 — What happens to internal review attention when staff choose an external reviewer?

> **Resolved by D27:** the founder selected one source-owned visible
> responsibility lane with deliberate internal takeover. The external lane
> begins only when the local invitation commit succeeds; return makes external
> access inert before creating a fresh internal successor occurrence. D28 is
> now the next decision.

#### Context and impact

D23/D25 already settle authority and concurrency: one valid internal or external
source command wins. They do **not** settle D21/D22 presentation and
responsibility when both an eligible internal human and one invited external
human exist. Leaving this implicit could create duplicate work, unclear
ownership, or an external reviewer continuing after staff think an internal
person took over.

#### Hope Ministries example

Ana has a **Needs attention** item for Hope's French-default candidate. Under
D26 optional posture, Maria deliberately invites Eli, a bilingual board member,
to review that exact candidate. What should happen to Ana's actionable item?

#### Option 1 — one visible review lane with deliberate takeover — recommended

Sending Eli's invitation explicitly hands current responsibility to **External
review — Eli**. Ana's internal item ends as **Reassigned** without transferring
read history or removing her underlying Website capability. If Ana or another
authorized staff member needs to resume, **Take over review** shows the impact,
revokes Eli first, and creates a fresh internal responsibility leg. Delivery
failure, decline, expiry, or mistake offers **Send again**, **Choose another
external reviewer**, or **Return review to Hope Ministries**.

**Impact:** clearest accountability and least duplicate work/disclosure. It adds
one explicit, reversible handoff but reuses D21 differential handoff and D25
revoke-before-replace rather than creating a workflow engine.

#### Option 2 — internal and external stay actionable; first valid review wins

Ana keeps her item while Eli reviews. Either may complete the exact current
source command; the CAS loser sees the completed result.

**Impact:** fastest redundancy and simplest routing mutation, but both people may
do the same work, ownership is unclear, and Eli may receive protected content
or spend time after Ana finishes first.

#### Option 3 — external review is exclusive until it ends

Ana's item ends and no internal reviewer can intervene until Eli completes,
declines, expires, loses access, or an authorized staff manager cancels the
external path.

**Impact:** ownership is very clear, but the invitation becomes an avoidable
operational lock. Staff can be stranded behind an unavailable external person,
which makes recovery less flexible than D21/D25 require.

#### Recommendation

**Recommend Option 1 — one visible lane with deliberate takeover.** It gives
staff and reviewers one accountable owner at a time, preserves underlying
authorization, and provides a safe reversible recovery action. It is consistent
with Core's existing responsibility-versus-permission split, D21 differential
handoff, D22 personal engagement, D25 revoke-first replacement, and one
source-owned final effect.

Do you choose **Option 1**, **Option 2 — parallel first-wins**, or **Option 3 —
external exclusive until it ends**? You may amend any option.

## Primary evidence index

- [D26 primary research](./phase-24-d26-bounded-tenant-external-review-availability-primary-research.md)
- [D25 adversarial review](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
- [D25 primary research](./phase-24-d25-candidate-scoped-external-reviewer-primary-research.md)
- [D23 source-owned independence](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
- [D24 substantive participants](./phase-24-d24-every-substantive-participant-adversarial-review.md)
- [D21 responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [Phase 4 invitation foundation](./phase-04-identity-account-claiming-foundation.md)
- [Phase 12 authorization](./phase-12-full-role-permission-configuration.md)
- [Phase 17 System Messages](./phase-17-system-messages-template-management.md)
- [Phase 6 communications](./phase-06-shared-communication-event-model.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
