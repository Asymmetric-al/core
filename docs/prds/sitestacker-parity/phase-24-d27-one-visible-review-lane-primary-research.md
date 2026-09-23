# Phase 24 D27 — one visible review lane with deliberate takeover primary research

Date: 2026-08-28  
Status: research evidence for the Phase 24 Grill session  
Founder answer: **One visible review lane with deliberate takeover**  
Scope: responsibility-lane coordination only; D21–D26 authority remains fixed

## Research question

When D26 permits staff to choose D25 external review while an eligible internal
reviewer and D21/D22 attention items already exist, should internal and external
review remain active together, should external review lock everyone else out,
or should Core show one current responsibility lane with an explicit safe way
for authorized internal staff to take the review back?

This document tests the founder's one-lane choice against current Core authority,
current repository behavior, official primary sources, comparable review and
assignment products, security principles, and accessible staff UX. It does not
implement the feature, invent customer demand, or reopen D21–D26.

## Executive finding

**Disposition: Accept with required amendments.**

One visible review lane is the clearest permanent UX, but only if **lane** is a
source-owned coordination state—not a role, capability, route, lock lease, task,
or claim. The corrected result is:

1. One exact candidate/review epoch has one current responsibility posture:
   internal, external, reassignment-needed, or terminal.
2. Opening the external-review sheet changes nothing. The handoff occurs only
   when **Send invitation and hand off** commits the D25 invitation and the new
   source-owned lane head.
3. Email/provider send, delivery, open, and invitation acceptance are later
   lifecycle facts. None selects the lane.
4. The external handoff ends current internal D21/D22 attention items as
   **Reassigned** but removes no internal capability or independence.
5. While the external lane is current, an independently authorized internal
   person sees **Take over review** instead of a competing final action. The
   takeover first makes the external invitation/context inert, then either
   restores the current internal route or completes the exact review in the
   same source transaction.
6. No committed state ever leaves both an external grant and an internal final
   lane active. One source compare-and-swap result still owns completion.
7. Delivery failure, decline, expiry, revocation, policy loss, and candidate
   supersession remain distinct; they never masquerade as reassignment or
   completion.

This choice is compatible with D21/D22 only if Core preserves their strongest
invariant: responsibility and attention are not permission. Any currently
source-authorized, D23/D24-independent internal human may initiate takeover,
including someone outside the notification route. The route merely decides who
receives internal attention after an internal lane is established.

## Current behavior, intended behavior, and permanent path

### Current repository behavior

**Repository fact:** there is no implemented D25 external-review surface,
Candidate Review Authorization Context, D26 policy, D27 lane model, takeover
command, or matching database schema under `apps`, `packages`, `supabase`, or
merged OpenSpec.

Current broad/stub Teams or settings screens are not an authority precedent.
No runtime behavior should be inferred from them.

### Accepted intended behavior before D27

- D21 establishes explicit Tenant/Site Website-review responsibility routes,
  stable routing legs, differential handoff, and personal attention items.
- D22 permits one to three co-responsible internal attention recipients. The
  route is not an action allowlist; an independently authorized non-routed
  person may review from the source. One valid source result ends sibling items.
- D23/D24 own proportional independence and the complete set of substantive
  candidate participants.
- D25 permits one active exact-candidate external invitation/grant, requires
  revoke-before-replace, and separates invitation creation, dispatch,
  acceptance, projection access, review, and public effect.
- D26 defines a three-state strictest-wins Tenant/Site availability posture and
  current-ceiling semantics. Policy narrowing can immediately end an external
  path; widening never invites or resurrects.

### Best permanent path

Add one source-owned **Candidate Review Responsibility Lane** head that
coordinates the existing internal attention route and D25 external context.
Do not mutate the D21 route, invent an external task queue, or use the
notification item as the lane.

The source command and lane head determine which pathway may currently attempt
the exact review effect. Phase 17 projects internal attention; Phase 4/D25 own
the invitation; Phase 12/source authorization still decides who may perform
each command.

## Exact corrected D27 decision

### D27-R1 — one source-owned responsibility posture

Each exact `{Tenant, environment, Site, source candidate, review epoch}` has one
current responsibility posture:

1. `internal_lane` — current internal pathway; D21 resolves the attention leg;
2. `external_lane` — one D25 invitation/context head, with its own substate;
3. `reassignment_needed` — no reviewer lane currently owns attention after an
   external path ended without a review; or
4. `terminal` — source review completed, changes requested ended the candidate,
   candidate canceled/superseded, or the source episode otherwise ended.

This is a small closed union. There is no `parallel`, `claimed`, `paused`,
`locked_by_user`, `waiting_for_email`, `first_wins`, or arbitrary workflow
state.

### D27-R2 — lane is coordination, never permission

The lane does not grant capability, membership, qualification, independence,
projection access, or source authority.

- D21/D22 route membership still grants only private attention.
- D25 Candidate Review Authorization Context still grants only the exact
  external projection and source command.
- Phase 12 plus the source still decide whether an internal actor may initiate
  takeover and whether the final action is authorized.
- A route member who lacks current source authority receives no actionable
  item and cannot take over.
- A qualified internal person outside the route may initiate takeover from the
  source. D27 must not turn D21 routing into an allowlist.

The final source command may require the current lane head as a state fence,
just as it requires the current candidate head. That is workflow coordination,
not authorization derived from attention.

### D27-R3 — handoff occurs at committed invitation creation

The external lane begins only when one privileged command atomically commits:

- the current D25 invitation identity/head;
- the exact external-review context intent and expiry boundary;
- the source candidate/review-epoch and expected lane head;
- the successor `external_lane` revision;
- the end of the active internal routing occurrence as **Reassigned**; and
- one recoverable invitation-delivery outbox obligation.

Opening a sheet, selecting a saved contact, typing an email address, previewing
access, or abandoning the form changes nothing.

The button must name both effects: **Send invitation and hand off**. A generic
**Send** hides the responsibility change.

### D27-R4 — provider and recipient events never select the lane

Do not wait for provider acceptance, inbox delivery, email open, link click,
identity acceptance, or projection access before ending internal attention.
Those facts can be delayed, duplicated, absent, unverifiable, or delivered
after a candidate changed.

Waiting would create an ambiguous parallel interval in which an internal person
could complete while Core is actively disclosing the candidate externally.

The committed invitation is the first durable staff choice and therefore the
only sound handoff point. If the invitation transaction fails, the internal lane
and its items remain unchanged. If later email dispatch fails, the external lane
remains selected with a truthful recovery state.

### D27-R5 — internal attention ends without fabricated engagement

When the external handoff commits:

- every active personal D21/D22 item for that internal routing leg ends as
  **Reassigned to external review**;
- unread/read/open/archive state is neither copied nor changed retroactively;
- no internal person is marked as having reviewed, declined, or acknowledged;
- names are shown only to viewers independently permitted to enumerate them;
- the durable Tenant/Site reviewer route remains unchanged for future internal
  lanes and future review episodes; and
- no automatic email, reminder, push, or “you were removed” message is sent.

If the same people later receive a successor internal leg, they receive new
personal items with new engagement state. Old engagement never revives.

### D27-R6 — external lane has truthful substates

The external lane projects, but is not owned by, these D25 facts:

- `invitation_created_delivery_pending`;
- `invitation_created_delivery_failed`;
- `invitation_sent` (provider acceptance, not inbox proof);
- `invitation_accepted` / active review context;
- `review_in_progress` only when the source owns a truthful activity fact—not
  inferred from open, presence, or elapsed time;
- `declined`;
- `expired`;
- `canceled_before_acceptance`;
- `revoked_after_acceptance`;
- `replaced`;
- `policy_or_authorization_ended`;
- `candidate_superseded`; or
- `review_completed` / source terminal result.

Delivery pending/failed does not reopen an internal lane. Staff receive the D25
choices **Send again**, **Replace external reviewer**, or **Return to internal
reviewers**. Core does not create parallel review merely because email is
uncertain.

### D27-R7 — takeover is deliberate and consequence-led

An independently authorized internal reviewer who opens a candidate with a
current external lane sees:

> **Eli Ramos currently has this review**  
> To review this version internally, Core must end Eli's invitation and access
> first. Eli's unfinished work will not be transferred.  
> **Take over review**

The takeover preview shows:

- exact Tenant, Site, locale, candidate, and external reviewer safe identity;
- whether the invitation is unaccepted or an accepted context is active;
- that external access ends immediately;
- that no external draft, engagement, or identity detail transfers;
- the intended internal target; and
- that the current public website remains unchanged unless a separately shown
  source effect is completed.

No reason essay, typed phrase, due date, second approver, or support request is
required. Current assurance and the exact source capability are re-used when
sufficient; otherwise the existing step-up is embedded once at the effect.

### D27-R8 — two admitted internal takeover outcomes

There are only two internal takeover meanings:

1. **Return to internal reviewers** — revoke/end the external path and create a
   successor internal lane. D21 resolves the current Site/Tenant route from
   current facts and creates personal attention only for its released qualified
   set.
2. **Take over and complete review** — a currently source-authorized,
   D23/D24-independent human who has already reviewed the exact current evidence
   may, after the explicit takeover consequence, atomically end the external
   path and execute the source's exact final review action. No intermediate
   attention item is needed because the review ends in the same command.

The UI should not offer **Take over and complete** before the actor has opened
the complete source-owned evidence, nor for a source whose exact action requires
a different interaction.

### D27-R9 — the internal target is current source truth, not the old item set

**Return to internal reviewers** uses the current D21/D22 resolver. It does not
restore a frozen list from before the external handoff.

- A released internal route creates one new successor routing occurrence and
  personal items for the complete qualified set.
- A completely proved released-zero route still permits the successor
  `internal_lane`: it creates one zero-member routing occurrence and no personal
  items, while the source review remains discoverable and performable by every
  independently authorized internal person. Zero attention recipients is not
  zero internal review authority.
- Indeterminate resolution blocks the return command and preserves the current
  external lane unless a separately authorized security revocation is required.
- A current policy/source/security revocation may end external access even when
  no internal target resolves; the source then enters `reassignment_needed`.

This preserves all-before-any routing and avoids revoking a valid external path
only to discover that the intended internal route is unusable.

### D27-R10 — revoke-before-internal is one transaction invariant

For a successful takeover, one short local compare-and-swap transaction must
re-prove and fence:

- current Tenant/environment/Site/candidate/review epoch and expected lane head;
- current D26 effective posture and every applicable source contract;
- D25 invitation/context identity, expiry, revocation, and active head;
- internal actor's current Phase 12/source authorization and D23/D24
  independence;
- current D21 route result when returning to internal reviewers;
- candidate, dependency, participant, projection, policy, evaluator,
  authorization, identity, and governance generations; and
- semantic idempotency meaning.

The committed result contains no state in which both lanes are effectful:

- the D25 credential/context is made inert;
- immutable external-end evidence is appended;
- the successor lane head is internal or terminal;
- the prior external lane ends; and
- the internal routing occurrence/outbox obligation or final source receipt is
  written.

No provider call occurs inside the transaction. Email/presentation cleanup is
recoverable projection work; external denial follows authoritative state
immediately.

### D27-R11 — final action remains one source CAS

An external completion requires the current external lane head and exact D25
context. An internal completion requires the current internal lane or the exact
atomic takeover-and-complete meaning.

Two concurrent actions produce one semantic source winner:

- external completion first → internal takeover observes terminal truth and
  creates no revocation, item, or second receipt;
- takeover first → the external context becomes inert and external completion
  fails with current privacy-safe truth;
- two internal takeovers → one lane-head winner; the loser receives the current
  lane/result and no retry that could duplicate effects; and
- semantic retry of the winner returns the same receipt.

### D27-R12 — terminal external events are not completion

Delivery failure, decline, expiry, cancellation, replacement failure, policy
loss, identity ambiguity, or source revocation never completes the review.

If an external path ends without an already committed successor:

- the lane becomes `reassignment_needed`;
- current public content stays unchanged;
- the candidate and source work remain preserved when still current;
- external projection access is denied;
- authorized staff see the exact next choices; and
- no previous internal item or external credential silently revives.

D28 now settles that reviewer decline or expiry requires one explicit state-
driven next-lane choice rather than automatic internal return. Delivery failure
remains nonterminal; policy/security denial and candidate/source terminality
follow their separately fixed current rules. D29 must still settle the bounded
recovery-responsibility route before the item key leaves Reserved.

### D27-R13 — candidate and source terminality always win

Candidate change, cancellation, supersession, Site retirement/transfer,
source episode end, or completed review ends the lane and every applicable item
and external context according to source truth.

A successor candidate has a new review epoch and begins from its current D21–
D26 facts. It never inherits an external reviewer, internal item engagement, or
lane head.

### D27-R14 — privacy follows least disclosure

- Internal recipients see only the safe fact that responsibility moved to
  external review unless they may see the reviewer's identity.
- The external reviewer never sees internal reviewer names, route membership,
  unread state, availability, reason for takeover, or staff audit detail.
- After takeover, the external surface returns the same privacy-safe unavailable
  result used for revocation; it does not name the internal actor unless a
  source contract specifically permits that disclosure.
- Staff impact previews hide Site/candidate/reviewer details outside the actor's
  independent visibility and use safe aggregate counts.
- No unfinished external input is copied to an internal item. Submitted
  source-owned **Request changes** or final evidence retains its own immutable
  history and consequence.

### D27-R15 — audit distinguishes responsibility, access, delivery, and decision

Durable business evidence records:

- prior and successor lane heads;
- exact candidate/review epoch and source heads;
- handoff/takeover meaning and server-derived actor;
- external invitation/context ended and reason code;
- prior internal routing occurrence ended and successor occurrence reference;
- safe impact digest and current policy/authorization generations;
- command key, attempt/result, timestamps, and expected heads; and
- final review actor/result only when the source review actually completes.

Technical logs/traces support diagnosis but are not the business audit. Do not
record candidate bodies, secrets, bearer material, hidden reviewer rosters,
email-open guesses, or private unfinished notes in generic logs.

### D27-R16 — accessible, mobile, localized, and weak-network complete

The ordinary and takeover surfaces use shared `@asym/ui` Base UI/Base Maia
primitives, semantic tokens, and Core state patterns.

- Lane status is text, not avatar/color/icon alone.
- Buttons state the consequence: **Send invitation and hand off**, **Return to
  internal reviewers**, **Take over and complete review**.
- Dialog/sheet headings, descriptions, focus containment/restoration, Escape,
  keyboard order, status announcements, error association, and destructive
  consequence are programmatically available.
- At 320 CSS pixels and 400% zoom, content stacks without losing current lane,
  exact candidate, impact, or action.
- Touch targets use Core shared controls; long Unicode names, translated copy,
  Sites, locales, dates, and time zones wrap safely.
- RTL uses logical layout and DOM order; no arrow/icon alone conveys transfer.
- Low-bandwidth retry first reconciles command receipt and current lane head.
  No offline takeover, final review, or external invitation is allowed.

### D27-R17 — no automation or workflow expansion

D27 creates no timer takeover, automatic first-wins parallelism, due date,
recurring reminder, escalation, claim/lease, reviewer presence, workload score,
round robin, workflow builder, generic assignment engine, approval vote,
marketplace, chat, or external guest workspace.

### D27-R18 — no domain expansion

D27 grants no Page/Navigation editing and has no Giving, Legal Entity, Stripe,
settlement, bank, currency, contribution, donor, missionary, receipt, statement,
ledger, accounting, credential, member-care, or public effect of its own.

## Repository authority and fit

### Governing repository facts

1. [ADR-0025](../../adr/0025-producer-owned-protected-actions.md) keeps protected
   effects with their consequence-owning producer; the lane belongs to the
   source candidate, not notifications.
2. [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
   makes notification presentation and personal engagement separate from
   business state.
3. [ADR-0029](../../adr/0029-reference-not-copy-cms-operational.md) prohibits
   copied cross-domain authority; lane rows reference source/invitation facts.
4. D21 explicitly defines prospective route saves and differential current-
   review handoff. Removed recipients lose attention without losing permission;
   new recipients get successor items; old engagement never revives.
5. D22 states that route membership is not an action allowlist, any independently
   authorized non-route reviewer may act, and one source CAS ends sibling items.
6. D23/D24 require current source-owned independent-human proof; lane ownership
   cannot make an interested or unauthorized human eligible.
7. D25 already requires revoke-before-replace and distinguishes invitation,
   provider, acceptance, projection, review, and public effect.
8. D26 current-ceiling semantics can make an external lane immediately
   inadmissible; D27 must converge presentation without delaying denial.
9. Platform principles put Tenant/permission correctness before convenience;
   platform boundaries keep privileged source effects server-side and preserve
   Tenant-controlled publication.
10. Core frontend rules require Base Maia/Base UI, semantic tokens, shared
    primitives, mobile/reflow, keyboard/focus, and honest async states.

### Required cross-document clarification

D22 currently says an authorized person outside the attention route may act
from the source. D27 does not reject that rule. It adds this narrower condition:

> While an exact D25 external responsibility lane is current, any internally
> authorized D23/D24-independent person may deliberately take over from the
> source. The source atomically ends external access before admitting an
> internal final action. The internal attention route remains neither an
> allowlist nor a permission grant.

That language must be traced through D21/D22/D23, ADR-0181, Phase 12 context,
the later OpenSpec delta, design, tickets, tests, and release evidence.

## External primary-source evidence

### Adobe Acrobat Sign: replacement and alternate are different semantics

Adobe documents two explicit choices for an active agreement:

- **Replace recipient** denies the original recipient further access and leaves
  only the new recipient able to complete; and
- **Add Alternate Recipient** leaves both able to participate.

Adobe also records replacement in its activity list/audit report. See
[Replace a recipient in an active agreement](https://helpx.adobe.com/sign/web/users/manage-agreements/replace-recipient.html).

**What this supports:** one-lane replacement and parallel participation are
different product meanings; Core should not accidentally implement “alternate”
when the founder chose “replace.” Replacement must be visible and audited.

**What it does not prove:** Acrobat's email-address agreement model, sender-only
replacement rule, or legal-signature workflow is not Core's authority model.

### Blackbaud Award Management: unsubmitted work can be reassigned; completed work stays

Blackbaud documents removing/replacing a reviewer, transferring owned reviews,
and reassigning unsubmitted—including drafted—reviews while leaving already
submitted reviews with their original reviewer. It also warns that invitations
may not be sent immediately. See
[Managing reviewers and reviewer groups](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/award-management/content/am-reviewer-groups.html).

**What this supports:** reassignment is a first-class lifecycle, delivery is not
assignment truth, and completed attribution must not be rewritten.

**What it does not prove:** Blackbaud reviewer groups, automatic distribution,
standing reviewer accounts, multiple reviews per application, deadlines, and
rubrics are broader than Core's exact-candidate one-review requirement.

Blackbaud Grantmaking also treats external reviewers as advisory—external
reviewers cannot approve/decline Requests—while Core D25 may admit an exact
source-owned review effect. See
[Blackbaud Grantmaking reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html).
Core must follow its own source contract rather than copy that advisory-only
limit universally.

### Linear: one assignee makes responsibility legible

Linear documents that issues have one assignee at a time for clear ownership,
tracks assignment/delegation changes in activity history, and updates assigned
views/inbox from assignment changes. See
[Assign and delegate issues](https://linear.app/docs/assigning-issues).

**What this supports:** a single visible owner/lane and durable handoff history
can reduce ambiguity.

**What it does not prove:** a Linear assignee is ordinary work management, not
authorization or protected review. Linear's agent delegation deliberately keeps
the human assignee responsible, which is a different parallel relationship.

### Power Automate: first-response, all-response, and sequential are distinct

Microsoft documents **First to respond**, **Everyone must approve**, and
**Sequential approval** as separate approval types, not interchangeable UI
variants. See
[Get started with approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals).

**What this supports:** parallel first-wins must be chosen deliberately; it is
not a harmless implementation detail. D27 can reject it for external/internal
lane collision while D22 retains it inside the internal co-responsible lane.

**What it does not prove:** Power Automate assigns guest users a Dataverse role
and exposes a generic workflow system; Core expressly avoids both.

### GitHub and GitLab: parallel review is intentional and visible

GitHub permits requesting and removing multiple requested reviewers; GitLab
supports multiple reviewers and visible per-reviewer status. See
[GitHub review-request API](https://docs.github.com/en/rest/pulls/review-requests)
and
[GitLab merge-request reviews](https://docs.gitlab.com/user/project/merge_requests/reviews/).

**What this supports:** products that want parallel review model it explicitly,
show multiple participants, and define completion/approval rules. Core should
not leave internal attention active accidentally after external handoff.

**What it does not prove:** open code-review visibility, repository membership,
admin bypass, and multi-approval rules do not fit Core's private candidate
projection or source-owned independence floor.

### OWASP: final authorization is operation-bound and current

The
[OWASP Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
recommends a final authorization gate, limited validity, unique authorization
per operation, and server-side enforcement. The
[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
recommends least privilege, default deny, every-request validation, logging,
and safe failure.

**What this supports:** takeover must not reuse a stale authorization or rely on
the UI/item; it must re-prove the exact operation and current actors at commit.

### W3C: predictable, announced, reflowing consequence UX

- [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) supports
  an explicit effect button rather than changing the lane merely by selecting a
  reviewer.
- [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  requires async success/error/current-state changes to be programmatically
  available without unnecessarily moving focus.
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow) requires the
  interface to preserve information/function at a 320 CSS-pixel equivalent.
- [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  requires at least a 24-by-24-CSS-pixel target or qualifying spacing; Core
  should use its larger shared touch controls.

No external source proves Core customer demand, exact labels, exact lane states,
or the correct D28 fallback. Those remain Core product judgments or unknowns.

## Alternatives pressure test

### Chosen — one visible lane with deliberate takeover

**Benefits:** clear responsibility, no duplicate review work, explicit external
disclosure, safe staff recovery, and one source completion path.

**Cost:** requires a source-owned lane head, explicit takeover command, and
careful reconciliation with D21/D22 rather than merely leaving existing items.

**Disposition:** accept with the amendments above.

### Strongest alternative — parallel internal/external first-wins

**Benefits:** minimal handoff state; an internal reviewer can rescue a slow or
failed external review without a takeover action.

**Risks:** two active audiences, duplicate work, unclear ownership, unexpected
external disclosure after an internal person is already acting, and a higher
race/test/audit burden. The user must understand that “assigned to Eli” does not
mean Eli owns it.

**Disposition:** reject for cross-boundary external/internal coordination. Keep
D22 first-wins only inside the deliberately co-responsible internal lane.

### Alternative — external lane locks all internal recovery

**Benefits:** mechanically simple single lane.

**Risks:** an authority-free invitation, failed email, or unavailable reviewer
can block legitimate internal work until cancellation/expiry. It makes staff
dependent on the inviter or support and violates the founder's flexibility
goal.

**Disposition:** reject. Authorized internal takeover is required.

### Alternative — external review is advisory; internal review always final

**Benefits:** preserves internal final control and resembles some grantmaking
products.

**Risks:** requires two people for every external path, makes D25 incapable of
solving a zero-internal-reviewer dead end, and duplicates source review meaning.

**Disposition:** reject as a universal rule. A particular source may define an
advisory external action, but D27 cannot impose it on all sources.

### No-build alternative — leave internal items active but hide them visually

**Benefits:** no new model.

**Risks:** hidden items remain actionable through deep links/API, notification
state diverges from the UI, and authority/audit races persist.

**Disposition:** reject. UI hiding is not a lane invariant.

## Staff and reviewer UX/UI contract

### Journey 1 — choose external from an active internal lane

Current source card:

```text
Review responsibility
Hope Ministries Website reviewers
Ana García and Joel Martin

[Request internal review]  [Invite an external reviewer]
```

The D25 selector remains one compact Base Maia sheet. Its final step adds the
handoff impact:

```text
Invite Eli Ramos

Eli can review only this French-default version.

What changes
• Ana and Joel's review items will end as Reassigned.
• Eli will become the only active external reviewer for this version.
• Authorized Hope staff can take the review back, which ends Eli's access.
• Your current website remains unchanged.

[Send invitation and hand off]  [Cancel]
```

Names appear only when the actor may enumerate the internal route. Otherwise:

```text
2 current internal review items will end as Reassigned.
```

### Journey 2 — invitation committed; email pending

```text
External review · Invitation created
Eli Ramos

Core is sending the invitation. Eli has no review access until identity and
acceptance checks succeed. Your website is unchanged.

[Return to internal reviewers]  [Replace external reviewer]
```

Provider acceptance later changes the delivery qualifier without changing the
lane.

### Journey 3 — delivery fails

```text
External review · Email could not be sent
Eli Ramos has not been told about this review.

Review responsibility is still external. No internal reviewer is working on it
unless you return it to them.

[Send again]  [Replace external reviewer]
[Return to internal reviewers]
```

Do not say **Eli did not receive it**; provider failure may not prove inbox
delivery. Do not automatically create internal parallel items.

### Journey 4 — invitation accepted

```text
External review · Access active
Eli Ramos

Can review only this exact version
Access ends 4 September 2026 at 17:00 ICT

[Revoke and return to internal reviewers]
[Replace external reviewer]
```

Do not show presence, email open, time spent, internal reviewer names to Eli,
or guesses such as **Reviewing now** without a source-owned fact.

### Journey 5 — internal reviewer takes over

Ana opens the current candidate:

```text
Eli Ramos currently has this review

To complete it internally, Core must end Eli's invitation and access first.
Eli's unfinished work will not transfer.

[Take over review]  [Keep external review]
```

After successful takeover:

```text
Review returned to Hope Ministries
Eli no longer has access.

Ana García and Joel Martin now have new review items.
Your website is unchanged.
```

If Ana already completed the exact evidence journey and the source admits the
combined action, the primary action may be **Take over and complete review**.
The preview must state both consequences; it is not a hidden shortcut.

### Journey 6 — takeover target cannot resolve

```text
Internal reviewers could not be confirmed

Core has not changed review responsibility or Eli's current access. Review the
Website reviewer setup, then try again.

[Review Website reviewers]  [Keep external review]
```

If security/policy has already ended Eli's access independently, show
**Review needs reassignment** instead; never claim the old external lane remains
effectful.

### Journey 7 — decline or expiry

```text
Review needs reassignment

Eli declined this review. No review was completed, and Eli no longer has access.
Your website is unchanged.

[Return to internal reviewers]
[Choose another external reviewer]
```

Expiry uses **This invitation expired**. Policy revocation uses **External
review ended because the Website review policy changed**. Candidate supersession
uses **This version was replaced** and links to the new current candidate only
when authorized.

### Journey 8 — concurrent loser

If Eli completes immediately before Ana's takeover:

```text
Review already completed

This exact review was completed before the takeover. No access or assignment
was changed.
```

Show Eli's identity only when actor attribution is visible. Preserve safe local
notes, remove stale effect controls, and offer no retry that could create a
second review.

### External reviewer after takeover

```text
This review is no longer available

The organization changed who is handling this review. No action is needed.
```

Do not expose the takeover actor, internal route, policy, candidate status, or
whether someone else later approved. Support uses opaque correlation evidence,
not candidate content in the public error.

## Source of truth and invariants

### Authority matrix

| Fact                                       | Authoritative owner                             | Derived projection          | Never authoritative             |
| ------------------------------------------ | ----------------------------------------------- | --------------------------- | ------------------------------- |
| Candidate/review epoch and terminality     | consequence-owning source                       | status card                 | item, invitation, lane label    |
| Current responsibility lane head           | consequence-owning source coordination owner    | staff lane summary          | browser, provider, notification |
| Internal durable responsibility route      | D21 Site/Tenant route owner                     | current route label         | lane, item, prior recipients    |
| Qualified internal attention set           | D21/D22 resolver + Phase 12/source              | personal items              | route count alone               |
| External invitation/identity lifecycle     | Phase 4 + D25                                   | lane qualifier              | email delivery/open             |
| External candidate authorization           | Phase 12 Candidate Review Authorization Context | narrow reviewer surface     | saved contact, lane alone       |
| Internal source authorization/independence | Phase 12 + source + D23/D24                     | current action availability | internal item/lane alone        |
| Personal attention/engagement              | ADR-0027 Phase 17 model                         | Needs attention/Recent      | review ownership/completion     |
| Review outcome and actor                   | source final command/receipt                    | completed status            | handoff, read, delivery         |
| Public/Giving/financial truth              | existing domain owners                          | unchanged copy              | D27 lane/history                |

### Required invariants

1. One candidate/review epoch has at most one current lane head.
2. A lane head references exactly one internal routing occurrence, one external
   invitation/context head, one reassignment reason, or one terminal source
   fact—never several.
3. Internal and external lanes are mutually exclusive at commit.
4. Lane, route, item, delivery, read, and saved contact grant no capability.
5. Current source authorization and independence are re-proved for takeover and
   final action.
6. One external lane references exactly D25's one active external person.
7. Starting external ends current internal items without changing their
   engagement history or durable route configuration.
8. Returning internal resolves current route truth; it never revives a frozen
   recipient set.
9. Revoke/end external precedes or is atomic with every admitted internal
   successor/final effect; no favorable overlap is externally observable.
10. One source CAS result owns review completion and actor attribution.
11. Delivery failure, decline, expiry, cancellation, revocation, replacement,
    supersession, and completion are distinct terminal/recovery meanings.
12. Old lane/items/grants never reactivate.
13. Candidate/source terminality wins every race.
14. Every row and relationship is exact Tenant/environment/Site/candidate/
    review-epoch scoped.
15. D27 has no public, Page-edit, Giving, finance, or unrelated-data authority.

## Database, RLS, and command boundary

### Recommended conceptual shape

Exact names remain design work, but the model should contain:

- immutable candidate-review-lane revisions;
- one current lane-head pointer per exact candidate/review epoch;
- a closed lane kind with exclusive internal/external/reassignment/terminal
  reference arcs;
- immutable handoff/takeover command receipts;
- references to D21 routing occurrences and D25 invitation/context heads;
- append-only external-end and internal-successor evidence owned by their
  respective domains; and
- transactional outbox/reconciliation obligations for Phase 17 items and Phase
  6 invitation delivery.

Do not add a mutable `assigned_to`, a polymorphic free-form JSON workflow row,
a shared task owner, or copied reviewer/source content.

### Relational safeguards

- UUID primary keys and non-null Tenant/environment/Site/candidate/review epoch.
- Composite same-scope references prevent cross-Tenant, cross-environment,
  cross-Site, cross-candidate, or stale-epoch links.
- Check constraints enforce exactly one reference arc for each lane kind.
- Unique current-head constraint admits one lane per candidate/review epoch.
- One semantic handoff/takeover receipt per business key/meaning.
- Restrictive delete preserves lane, actor, invitation, routing, and review
  history; privacy erasure follows stable identity/tombstone policy.
- Indexes cover current lane lookup, reverse active external contexts, reverse
  internal occurrence impact, reassignment-needed work, command receipt lookup,
  and reconciliation/outbox scans.

### RLS and privilege requirements

- Enable and force RLS on lane revisions/heads, command receipts, and any
  repair/reconciliation table.
- Browser roles receive no direct write grants. All lane transitions use
  `packages/api` source commands.
- `USING` and `WITH CHECK` enforce exact Tenant/environment/Site/candidate,
  purpose, current assignment/context, visibility, admitted transition, and
  non-mutable scope.
- Server commands derive Tenant, environment, Site, actor, Party, Active Tenant
  Assignment, current lane/candidate heads, capability, assurance, and audit
  attribution from trusted context.
- Caller-supplied lane kind, actor, reviewer, route result, item recipients,
  qualification, revocation reason, or source outcome is intent only and never
  authoritative.
- Direct table, PostgREST, collection, view, RPC, worker, service-role, support,
  impersonation, repair, import, migration, and export paths pass the same
  tenant/authorization poison matrix.
- Security-definer helpers use schema-qualified objects, fixed safe search path,
  least privilege, revoked public execute, and positive/negative database proof.
- Cache identities include candidate/review epoch, lane head, D25 context head,
  route occurrence, policy/source/authorization epochs, and viewer purpose.

## Lifecycle and transition table

| Current state              | Event                                                   | Next state                    | Required side effects                                                                |
| -------------------------- | ------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| internal                   | external form opened/abandoned                          | internal                      | none                                                                                 |
| internal                   | external handoff command commits                        | external / invitation created | end internal occurrence/items as Reassigned; create D25 invitation; enqueue delivery |
| internal                   | handoff command fails/stales                            | internal                      | none; preserve form safely                                                           |
| external / created         | delivery accepted by provider                           | external / sent               | delivery evidence only                                                               |
| external / created or sent | delivery failure                                        | external / delivery failed    | status/recovery only; no internal items                                              |
| external / pending         | identity acceptance succeeds                            | external / accepted           | D25 context; lane unchanged                                                          |
| external / any nonterminal | replace external                                        | external / successor invite   | old D25 path inert before successor; lane head advances                              |
| external / any nonterminal | return internal resolves                                | internal                      | old D25 path inert; new D21 occurrence/items                                         |
| external / any nonterminal | takeover-and-complete wins                              | terminal complete             | old D25 path inert; one source receipt; no internal item                             |
| external / any nonterminal | decline/expiry/cancel/security revoke without successor | reassignment needed           | deny external; no review result; staff recovery presentation                         |
| external / any nonterminal | candidate superseded/source ends                        | terminal                      | deny external; end items; no successor inherited                                     |
| external / accepted        | external completion wins                                | terminal complete             | one source receipt; end external context/lane                                        |
| reassignment needed        | return internal resolves                                | internal                      | new D21 occurrence/items                                                             |
| reassignment needed        | choose external succeeds                                | external                      | one fresh D25 invitation/outbox                                                      |
| reassignment needed        | candidate superseded/source ends                        | terminal                      | preserve history                                                                     |
| any nonterminal            | concurrent losing command                               | current winner truth          | no duplicate receipt/item/invite; safe reconciliation                                |

## Failure, retry, and repair behavior

### Invitation creation succeeds; outbox delivery fails

The external lane remains authoritative. Staff see delivery failure and can
retry the same invitation, replace, or return internally. Retrying the outbox
cannot create a second invitation or extend expiry.

### Lane commits; Phase 17 item projection lags

The source lane remains authoritative. Internal deep links/final commands check
the current lane and cannot act through stale items. A reconciler ends old
items/creates successor items idempotently; it never changes lane or review
truth.

### External revocation commits; presentation cache is stale

Every protected reviewer read and final command checks current context/lane
head and denies. Purge/revalidation repairs presentation; stale UI cannot
restore access.

### Internal route becomes indeterminate during takeover

**Return to internal reviewers** does not commit and does not revoke an
otherwise-valid external lane. Staff see current external status and repair
guidance. A separate security/policy revocation may still end external access
and leave `reassignment_needed`.

### Command response is lost

Client retries with the same semantic idempotency key. Same key/meaning returns
the existing receipt and current lane. Same key with different candidate,
reviewer, target, or effect rejects.

### Reconciliation repeatedly fails

Authority remains safe from source/lane/context state. Escalate the projection
repair signal; never reverse a takeover or resurrect an external grant merely
to repair a badge/item.

## Edge-case matrix

| Edge case                                                    | Correct result                                                                                                                |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| External selector opened in two tabs                         | no lane change until one command commits                                                                                      |
| Two external handoffs race                                   | one lane/invitation winner; loser sees current external lane                                                                  |
| External handoff races internal completion                   | one source/lane CAS winner; no invite after terminal review                                                                   |
| External handoff commits, email never starts                 | external lane + delivery pending/failed; explicit recovery                                                                    |
| Provider reports sent twice                                  | one delivery meaning; lane unchanged                                                                                          |
| Link scanner opens invite                                    | no acceptance, no lane change                                                                                                 |
| Internal recipient reads item during handoff                 | read may record before end; no authority or fabricated review                                                                 |
| Internal deep link cached after handoff                      | current lane blocks final action; takeover offered if authorized                                                              |
| Non-routed but authorized internal reviewer opens candidate  | takeover available; route membership not required                                                                             |
| Routed but now unauthorized internal reviewer opens item     | no action/takeover; presentation removed or safe stale state                                                                  |
| External accepts as policy narrows                           | current policy/context CAS decides; no favorable stale acceptance                                                             |
| External completes as internal takeover races                | one exact winner; loser sees terminal/current truth                                                                           |
| Takeover actor materially edited candidate                   | D23/D24 blocks; lane unchanged                                                                                                |
| Same human uses another account                              | stable-human proof blocks independence/takeover where applicable                                                              |
| External reviewer becomes Tenant member                      | current identity/eligibility re-proves; no automatic lane conversion                                                          |
| Internal route changed prospectively while external active   | external lane unchanged; later return uses new current route                                                                  |
| Prior internal recipient leaves Tenant                       | no stale restoration; current resolver filters/blocks                                                                         |
| Return target released-zero                                  | internal lane with one zero-member occurrence; no personal item; source remains discoverable to authorized internal reviewers |
| Return target indeterminate                                  | no handoff; indeterminate is not zero                                                                                         |
| External declines after staff already started return command | expected heads produce one successor/end meaning                                                                              |
| Invitation expires while reviewer page open                  | next protected operation denies; lane becomes reassignment-needed                                                             |
| Staff cancels before acceptance                              | external ends; no completion; explicit next lane required                                                                     |
| Policy prohibits external review                             | immediate denial; reconciliation moves lane to reassignment-needed/current commanded successor                                |
| Candidate changes during external review                     | terminal old lane/context; fresh candidate starts independently                                                               |
| Site retires or transfers                                    | old lane/context ends; no cross-Tenant successor                                                                              |
| External reviewer has local unfinished text                  | not transferred; revoke prevents submit; safe local discard warning where possible                                            |
| External already submitted Request changes                   | source-owned result/history governs; do not relabel as unfinished takeover                                                    |
| Takeover-and-complete source effect fails                    | whole transaction fails; external lane remains unless independent revocation already required                                 |
| Internal successor item outbox fails                         | internal lane remains; reconciliation creates items; no external revival                                                      |
| Viewer lacks reviewer-name visibility                        | role-safe lane label/count, no name leak                                                                                      |
| Low bandwidth duplicates click                               | button busy + semantic idempotency; one result                                                                                |
| Mobile back navigation after takeover                        | protected cache cannot reveal revoked candidate projection                                                                    |
| RTL/long Unicode identities                                  | logical order and wrapping; no truncation as sole identity                                                                    |
| Support impersonation                                        | no implicit takeover; exact governed capability/context required                                                              |
| Service-role repair script                                   | same lane/source invariants and immutable receipt                                                                             |
| Audit projection unavailable                                 | local command receipt required; generic log not authority                                                                     |

## Acceptance criteria

### Lane semantics

1. One exact candidate/review epoch has at most one current lane head.
2. Internal and external lanes cannot both be current.
3. Opening or changing the external-review form changes no lane.
4. Only committed invitation creation can hand off internal to external.
5. Provider send/delivery/open cannot choose or change a lane.
6. Invitation acceptance does not create a second lane transition.
7. Lane membership alone grants no source action or projection access.
8. D21 route membership remains attention-only.
9. An authorized non-route internal person may initiate takeover.
10. An unauthorized/ineligible route recipient cannot initiate takeover.

### External handoff

11. Final UI says **Send invitation and hand off**.
12. The preview truthfully shows internal attention ending, exact external
    scope, takeover consequence, and unchanged public website.
13. Successful handoff commits invitation, lane successor, prior occurrence
    end, and delivery outbox obligation together.
14. Failed/stale handoff leaves internal lane/items authoritative.
15. Internal items end as Reassigned, not read/declined/completed.
16. Internal engagement does not transfer to external or successor items.
17. Durable internal route configuration is unchanged by external handoff.
18. No email/reminder is sent to removed internal recipients by default.

### External lifecycle

19. Created, sent, accepted, delivery-failed, declined, expired, revoked,
    replaced, superseded, and completed are distinct states.
20. Delivery failure leaves one external lane and no parallel internal items.
21. Send again creates no new invitation and extends no expiry.
22. Replace external ends the old path before releasing one successor.
23. Decline/expiry without successor creates no review completion.
24. Candidate supersession gives the old reviewer no successor access.
25. A revoked open reviewer session fails on its next protected operation.

### Internal takeover

26. Takeover preview names the external access consequence and internal target.
27. Current source authorization and D23/D24 independence are re-proved.
28. Return to internal reviewers uses the current D21/D22 resolver.
29. Old internal recipient lists are never revived from history.
30. Released current route creates one successor occurrence and personal items.
31. A completely proved released-zero route permits an internal lane with one
    zero-member occurrence, no personal item, and source-surface discoverability.
32. Indeterminate route resolution does not revoke a valid external path merely
    to attempt return.
33. Security/policy revocation may end external and enter reassignment-needed
    even without an internal target.
34. Takeover makes external context inert before/with internal successor effect.
35. A current authorized actor can use takeover-and-complete only after viewing
    exact source evidence and when the source admits that combined command.
36. Takeover-and-complete creates one review receipt and no internal item.

### Concurrency and idempotency

37. External completion versus takeover produces one source winner.
38. Two takeovers produce one lane-head winner.
39. Handoff versus internal completion produces one lawful result.
40. Same semantic retry returns the original receipt/result.
41. Same key with different meaning rejects.
42. Losing commands create no duplicate invitation, revocation, lane, item, or
    review receipt.
43. Provider/network calls never occur inside lane/source transactions.
44. Lost responses reconcile current receipt/head before retry.

### Tenant, RLS, and privacy

45. Tenant/environment/Site/candidate/review epoch are server-derived and
    structurally same-scope.
46. Cross-Tenant/Site/candidate lane references reject.
47. Direct browser writes to lane/head/receipt tables reject.
48. RLS `USING` prevents forbidden reads.
49. `WITH CHECK`/command validation prevents an allowed row changing forbidden
    scope, kind, actor, or head.
50. Service role, RPC, worker, view, support, repair, import, and migration
    paths enforce the same invariant.
51. External reviewer never sees internal names, engagement, route, or takeover
    reason without a separate source contract.
52. Internal viewers without name visibility see safe lane/count status.
53. Generic logs contain no candidate body, bearer material, secret, hidden
    roster, or unfinished note.
54. Unfinished external input is not transferred as internal work or audit.

### UX, accessibility, mobile, and failure

55. Current lane and next lawful action are visible in text.
56. Essential meaning never relies on color, avatar, icon, hover, or presence.
57. Buttons name handoff/takeover consequences.
58. Keyboard users can complete/cancel dialogs and focus returns correctly.
59. Async current-state, success, stale, and error changes are announced.
60. The complete flow reflows at 320 CSS pixels without lost information or
    two-dimensional scrolling.
61. Shared touch controls meet Core/WCAG target expectations.
62. Long Unicode/translated/RTL content remains legible and logically ordered.
63. Weak-network retry creates one business result.
64. External post-takeover surface is privacy-safe and no-store.
65. Stale internal item/deep link cannot bypass the current lane.
66. Projection lag never changes source/lane authority.
67. Staff can recover from delivery failure without support or parallel review.
68. Current public content stays unchanged until an admitted source effect.

### Audit and exclusions

69. Audit distinguishes handoff, delivery, acceptance, access, takeover,
    decision, and public effect.
70. Completed actor attribution is never rewritten by later reassignment.
71. Old lane/item/grant engagement never revives.
72. D27 creates no timer, due date, reminder, escalation, claim, or workflow
    builder.
73. D27 creates no generic external member, guest role, or reviewer pool.
74. D27 grants no Page/Navigation editing.
75. D27 grants no Giving, Stripe, settlement, bank, currency, contribution,
    receipt, ledger, or accounting authority.
76. D27 cannot weaken source prohibition, D23/D24 independence, D25 scope, or
    D26 availability policy.

## Monitoring plan

Thresholds are launch hypotheses and require production baselines before
activation.

| Signal                                                     | Threshold                                        | Owner                          | Required response                                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| `candidate_review_parallel_lane_total`                     | any                                              | Site IAM + Security            | incident; fence both final paths, preserve current public head, reconstruct lane, inspect every effect |
| `candidate_review_external_success_after_takeover_total`   | any                                              | Security + source owner        | incident; stop external review, revoke contexts, inspect cache/RLS/command fences and public effect    |
| `candidate_review_internal_success_without_takeover_total` | any while external lane current                  | Source owner + Security        | incident; fence lane implementation, inspect receipts, correct source state without fabricating actor  |
| `candidate_review_lane_head_conflict_rate`                 | >1% of lane commands over 1 hour with minimum 20 | Platform + Site Product        | inspect stale UI/race patterns; improve reconciliation, never weaken CAS                               |
| `candidate_review_handoff_delivery_failure_rate`           | baseline, then >5% over 24 hours with minimum 20 | Communications Operations      | inspect provider/domain health; show retry/return; do not auto-parallelize                             |
| `candidate_review_lane_projection_lag_seconds`             | p95 >60 seconds or any stale effect control      | Phase 17 + Site Product        | replay projection; fence stale effect controls from source head                                        |
| `candidate_review_reassignment_needed_age`                 | baseline; alert on any >24 hours during pilot    | Tenant Website owner + Product | inspect UX/ownership; use D28-approved recovery, no automatic approval/reminder                        |
| `candidate_review_takeover_denial_rate`                    | >5% over 7 days with minimum 20                  | Site Product + IAM             | classify stale authorization, independence, route, or UI mismatch; improve explanation                 |
| `candidate_review_duplicate_successor_item_total`          | any                                              | Phase 17                       | deduplicate/reconcile items; preserve engagement/actor history                                         |
| `candidate_review_hidden_identity_exposure_total`          | any                                              | Security + Privacy             | incident; fence projection/export/log, assess notification obligations, repair visibility rules        |
| `candidate_review_command_ambiguous_total`                 | any unresolved after bounded reconciliation      | Platform Operations            | reconcile receipt/head, present safest current truth, never invite/revoke twice                        |
| `candidate_review_lane_a11y_critical_total`                | any release-blocking automated/manual finding    | Accessibility + Site Product   | block rollout, repair shared composition, rerun keyboard/reflow proof                                  |

No monitor may auto-approve, auto-publish, widen policy, restore external access,
or create a parallel lane.

## Migration and rollout

1. D21–D26 source contracts, Phase 12 Candidate Review Authorization Context,
   and exact D25 invitation lifecycle must land first.
2. Add lane heads/revisions and source command fences before exposing optional
   external handoff.
3. Backfill no external lanes. Existing active internal review episodes begin
   `internal_lane` only from complete current source/routing proof; unknown
   historical states remain safe/unassigned, never guessed.
4. Deploy readers that understand new lane states before writers.
5. Gate external handoff until revoke-before-internal, source CAS, RLS, cache,
   outbox, and mixed-version tests pass.
6. Pilot synthetic/internal Tenants, then a bounded opt-in Tenant cohort.
7. Feature-off stops new external handoffs and follows D26/D28 current-safe
   recovery; it never deletes history or resurrects internal items/grants.
8. Roll forward for repair. Code rollback after lane/invitation rows exist is
   not assumed safe without compatibility proof.
9. Provide staff-visible lane history and operational repair before general
   availability.
10. Conduct moderated mobile/desktop/keyboard tests with actual nonprofit
    Website staff; do not treat the Hope example as demand evidence.

## Unresolved unknowns

1. Exact source capability identifiers for external handoff, return-to-internal,
   takeover-and-complete, lane-history viewing, and repair.
2. Which consequence-owning sources admit a combined takeover-and-complete
   command versus requiring separate takeover then final review.
3. Whether every source can atomically create its lane successor and Phase 4
   D25 invitation in the same database boundary; adapters must prove the
   transaction contract.
4. Exact retention/anonymization rules for lane actor/reviewer identity and
   body-free evidence.
5. User-tested comprehension of **hand off**, **take over**, **return to internal
   reviewers**, **reassigned**, and **review needs reassignment**.
6. Actual rates of delivery failure, decline, expiry, takeover, and concurrent
   internal/external activity.
7. Whether a source-owned **Request changes** action ends the external lane or
   begins a new candidate epoch for each source; this must remain source-defined.
8. D28's terminal-without-review recovery posture.
9. Whether authorized staff need a safe optional note when handing off/taking
   over; no evidence justifies making one required.
10. Exact mixed-version deployment sequence across Phase 4, 12, 17, and each
    source adapter.

## Ruthless synthesis

### Must be amended before D27 is recorded

- Define lane as source-owned coordination, not assignment permission.
- Set handoff timing to committed invitation creation.
- End internal items as Reassigned without changing capability or route.
- Require explicit takeover and revoke-before-internal atomicity.
- Preserve non-routed authorized internal takeover.
- Define delivery/pending/decline/expiry/revocation/supersession truth.
- Define reassignment-needed as safe unresolved recovery, not parallel fallback.
- Preserve one source CAS and immutable attribution.

### Must be captured in spec/design

- closed lane union, heads, transitions, exclusive arcs, and ownership;
- Phase 4/D25 invitation + source-lane transaction boundary;
- D21/D22 successor routing and item reconciliation;
- D26 current-ceiling interaction;
- exact Base Maia staff/reviewer states and copy;
- 76 acceptance outcomes and monitors; and
- migration/mixed-version proof.

### Implementation safeguards

- server-derived exact scope/actor;
- no direct browser lane writes;
- force RLS plus `USING`/`WITH CHECK` and privileged-path parity;
- expected-head CAS and semantic idempotency;
- no network call inside authoritative transactions;
- current-context checks on every external read/effect;
- current-lane checks on every final source command; and
- projection repair never changes authority.

### Monitor, do not assume

- customer demand and preferred language;
- handoff/takeover frequency;
- delivery failure and reassignment age;
- contention and projection lag; and
- comprehension/accessibility outcomes.

## Recommended next one-at-a-time Grill question

### D28 — What should happen when an external lane ends without a review?

#### Why this needs a founder decision

D27 deliberately avoids parallel internal and external review. If Eli declines
or the invitation/grant expires, Core must decide whether to restore internal
attention automatically or ask an authorized human to choose the next lane.
The review is still required and the current website is safe, but an unclear
recovery can either surprise staff or let work disappear. Delivery failure,
policy/security denial, and candidate/source terminality retain their separately
defined behavior and are outside this question.

#### Hope Ministries example

Eli declines Hope's French-default review. Ana and Joel were the prior internal
Website reviewers, but their old items ended when Maria handed the review to
Eli. The current D21 route still resolves to Ana and Joel.

#### Option 1 — one state-driven reassignment choice — recommended

Move the candidate to **Review needs reassignment**. Create one deduplicated
in-product item only for current authorized people who can choose the next lane.
The screen leads with **Return to Hope Ministries reviewers** and also permits a
new D25 external reviewer when current D26/source rules allow it. No email,
recurring reminder, automatic reviewer selection, or old-item revival occurs.

**Impact:** staff get one clear recovery action without surprising Ana or Joel
with silently restored work. It adds one small, state-driven coordination item
but reuses the existing Core attention model.

#### Option 2 — automatically return to the current internal route

As soon as Eli's lane ends, resolve the current D21 route and create fresh
internal items for Ana and Joel.

**Impact:** least staff effort and fastest recovery, but it silently assigns
work after decline/expiry, may re-notify people Maria deliberately bypassed,
and must decide what happens when the route is zero or indeterminate.

#### Option 3 — remain unassigned with no item

Show **Review needs reassignment** only when someone revisits the candidate.

**Impact:** no notification noise or new coordination state, but the required
review can be forgotten indefinitely and staff may think someone else owns it.

#### Recommendation

**Recommend Option 1 — one state-driven reassignment choice.** It preserves the
founder's one-lane clarity and deliberate control while giving authorized staff
a discoverable next step. The item grants no permission, sends no email by
default, deduplicates by exact candidate/reassignment episode, and ends when a
new lane is committed or the source episode ends.
