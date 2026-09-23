# Phase 24 D27 — one visible review lane with deliberate takeover adversarial review

> **Subsequent D29 reconciliation (2026-08-28):** D29 now accepts one distinct
> **Website review follow-up route** with one to three explicit Review
> coordinators, current authorization intersection, and no D21/inviter/admin/
> capability inference. Any statement below that calls D29 “next,” “pending,”
> or “unresolved” records the earlier dependency state and is superseded by the
> [D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md).

> **Artifact type:** Grill decision evidence; not a PRD, implementation
> authorization, migration, ticket set, or claim of shipped behavior.  
> **Founder answer:** **One visible review lane with deliberate takeover.**  
> **Review disposition:** **Accept with required amendments.**  
> **Session date:** 2026-08-28.

## Executive disposition

One visible review lane is the strongest permanent UX and coordination model,
but the phrase is safe only after several amendments.

The lane is a source-owned statement of **who currently has review
responsibility for one exact candidate and review episode**. It is not a role,
permission, assignee, lock, task, notification, or proof that somebody is
working. There are four closed postures:

1. **Internal review**;
2. **External review — named person where the viewer may see the name**;
3. **Review needs reassignment**; or
4. **Review ended**.

The external handoff happens when **Send invitation and hand off** durably
creates the D25 invitation, advances the source lane, ends the current internal
routing occurrence as **Reassigned**, and records a delivery outbox obligation
in one transaction. It does not wait for email, provider acceptance, delivery,
open, link click, or recipient acceptance.

Internal staff retain their underlying authorization. Any currently eligible,
independent internal actor may deliberately take the review back even when that
actor was not on the D21/D22 attention route. A manager with the exact
lane-management capability may return responsibility to the current internal
route without gaining authority to review. No command “claims” the work for the
person pressing the button.

Return to internal review is revoke-before-successor and atomic: the external
invitation/context becomes inert in the same authoritative transaction that
creates the internal successor lane. A complete released-zero route is valid:
the internal lane exists, has one zero-member routing occurrence and no personal
items, while the source review page remains discoverable to independently
authorized people. An indeterminate route is not zero and cannot replace an
otherwise-valid external lane. If security or policy independently requires
external access to end, the source enters **Review needs reassignment**.

Decline, expiry, cancellation, policy loss, and other external terminal events
without a review also enter **Review needs reassignment**. D28, not D27, decides
the recovery presentation and next-lane choice. Core must not silently fall
back to internal review.

This is deliberately smaller than a workflow engine. It composes D21/D22
attention routing, D25 candidate-scoped external authority, D26 bounded Tenant
policy, Phase 12 authorization, Phase 17 presentation, and one source
compare-and-swap result.

## Plain-language outcome

Hope Ministries has asked Eli to review the private French-default candidate.
Ana's old **Needs attention** item now says **Reassigned to external review**.
Ana's Website permission did not disappear.

When Ana opens the candidate, she sees:

> **Eli Ramos currently has this review**  
> To review this version internally, Core must end Eli's invitation and access
> first. Eli's unfinished work will not transfer.  
> **Take over review**

If Ana chooses to return the review, Core previews the current internal route.
After one confirmation, Eli loses access and fresh internal attention appears
for the current routed reviewers. If nobody is currently routed, Core says so
plainly and creates no guessed personal notification; the review remains
available from the Site review page to authorized staff.

The public website remains unchanged throughout. Giving, Legal Entity, Stripe,
settlement, bank, and accounting identity remain outside D27.

## Evidence classification

- **Repository fact:** D19–D22 separate source state, durable responsibility
  route, personal attention, engagement, and permission; old items never revive.
- **Repository fact:** D23/D24 make independence source-owned and require every
  substantive participant to be considered.
- **Repository fact:** D25 permits one exact-candidate external person and
  requires revoke-before-replace; D26 imposes a current strictest-wins Tenant/
  Site policy ceiling.
- **Repository fact:** ADR-0027 defines attention items as role-safe
  projections, not action authority or business truth.
- **Repository fact:** current runtime contains no candidate responsibility
  lane, D25 authorization context, D26 policy, or D27 takeover command.
- **Verified external fact:** Adobe Acrobat Sign distinguishes replacing a
  recipient from adding an alternate; Blackbaud products expose explicit
  reviewer reassignment; HubSpot content approvals permit one pending request
  with explicit cancel/reassign; these support deliberate transfer rather than
  hidden parallel ownership.
- **Verified external fact:** Linear's single-assignee convention improves
  coordination clarity, while Contentful keeps task/workflow assignment
  separate from underlying permissions. These are coordination precedents, not
  authorization models.
- **Verified external fact:** OWASP requires server-side authorization and
  transaction authorization bound to the exact operation; W3C guidance requires
  changes not occur merely on input and status changes be programmatically
  exposed.
- **Product judgment:** one visible lane plus deliberate takeover is clearer
  and safer than parallel first-wins or an external lock.
- **Assumption:** nonprofit Website staff will understand “hand off,” “take
  over,” “return to internal reviewers,” and “reassigned.” Moderated testing
  must verify the words; comparable products do not prove Core's terminology.
- **Resolved by D28:** an external decline/expiry opens one explicit state-
  driven next-lane choice. **Still unresolved:** D29 must choose the bounded
  recovery-responsibility route before the notification key becomes Live.

## Current behavior, intended behavior, and best permanent path

### Current repository behavior

No current application or migration implements D27. Existing broad permission
constants, generic Mission Control task rows, static Teams surfaces, CMS state,
or notification queues are not acceptable substitutes:

- current broad staff capabilities do not express candidate-specific,
  source-owned review authority;
- generic Mission Control tasks include mutable assignee, urgency, due-date,
  reminder, queue, and JSON-detail concepts that contradict this narrow lane;
- current service-role task access is not a proof of the D27 tenant/Party/
  source authorization boundary; and
- UI hiding cannot enforce the lane or tenant boundary.

### Intended behavior before this review

The founder chose one visible lane with deliberate takeover: handing review to
an external person removes competing internal actionable attention while
preserving internal permissions and a safe way to resume internally.

### Best permanent path

Add one **Candidate Review Responsibility Lane** head to the
consequence-owning source. Project that state into existing D21/D22 and Phase 17
attention, and reference the existing D25 invitation/context. Do not add a
second policy owner, generalized workflow engine, mutable assignee, or external
review queue.

## Exact corrected D27 decision

### D27-R1 — one closed, source-owned lane

Each exact {Tenant, environment, Site, source candidate, review episode} has
one current lane head:

- **internal_lane** — the current D21 route owns attention;
- **external_lane** — one exact D25 invitation/context owns attention;
- **reassignment_needed** — the prior external lane ended without a review and
  no successor has been selected; or
- **terminal** — the source review/candidate episode ended.

There is no parallel, claim, user lock, pause, waiting-for-email, or arbitrary
workflow state.

### D27-R2 — lane coordinates responsibility but grants nothing

The lane never grants Tenant membership, role, capability, qualification,
independence, candidate access, source command authority, or public effect.
D21/D22 routes remain attention-only. D25 remains the external access grant.
Phase 12, D23/D24, and the source re-prove each actor and action.

### D27-R3 — external handoff occurs at durable invitation creation

One source command atomically:

- verifies the expected candidate and lane heads;
- creates the D25 invitation identity and exact authorization intent;
- advances to **external_lane**;
- ends the current internal routing occurrence as `responsibility_reassigned`
  and records the item-reconciliation obligation; active personal items then
  leave current attention as **Reassigned to external review** without becoming
  authority for the handoff;
- records an immutable command receipt; and
- creates one recoverable delivery outbox obligation.

The action label is **Send invitation and hand off**. Opening, editing, or
abandoning the form changes nothing.

### D27-R4 — provider and acceptance events are separate

Email enqueue, provider acceptance, delivery, bounce, open, link scan, click,
identity acceptance, and first candidate read may update truthful D25
substates. None chooses or reopens a lane. A failed send remains an external
lane with **Delivery failed** and the choices **Send again**, **Replace external
reviewer**, or **Return to internal reviewers**.

### D27-R5 — internal items end; route and engagement do not mutate

The handoff ends each current internal personal item as **Reassigned**. It
does not mark read, reviewed, acknowledged, declined, or completed; copy
engagement to anybody; change the durable D21 route; remove capability; or send
an automatic email/reminder. A later internal leg creates new items with new
engagement. Old items never revive.

### D27-R6 — truthful external substates

The external lane may project invitation created/delivery pending, delivery
failed, provider accepted, invitation accepted, source-proved review activity,
declined, expired, canceled, revoked, replaced, policy/authorization ended,
candidate superseded, or review completed. Names and details are role-safe.
Elapsed time, email open, link click, browser presence, or unsaved text never
proves review activity.

### D27-R7 — deliberate, consequence-led takeover

An authorized viewer sees who currently has review responsibility, what will
end, what will not transfer, the intended successor, and the unchanged public
website before confirmation. The primary copy is **Take over review**, followed
by the precise permitted outcome:

- **Return to internal reviewers**; or
- **Take over and complete review**, only when the exact source supports an
  atomic final effect and the actor has independently reviewed the exact
  evidence.

The UI never offers a generic **Claim**.

### D27-R8 — exact takeover authorization

Any current internal human who is independently authorized and D23/D24-eligible
for the relevant source action may initiate deliberate takeover even when not
on the route. A current lane manager may return responsibility to internal
reviewers when that manager has the exact lane-management capability, but the
return grants the manager no review authority. Route membership, admin label,
creator status, prior participation, invitation authorship, or the lane itself
is insufficient.

### D27-R9 — no self-claim

Return to internal review resolves the current D21/D22 route; it never assigns
the pressing actor by convention. Takeover-and-complete records one final
source result and creates no personal ownership leg. If a future product wants
self-assignment, it requires a separate decision and authority model.

### D27-R10 — released-zero and indeterminate are different

A complete current D21/D22 resolution may return:

- **released with one to three current recipients** — create a fresh internal
  occurrence and fresh personal items;
- **released with zero recipients** — create a fresh zero-member internal
  occurrence, no personal items, and preserve source-page discoverability for
  independently authorized reviewers; or
- **indeterminate** — do not return, do not revoke an otherwise-valid external
  lane, and show repair guidance.

No recipient is guessed from prior items, every admin, every capability holder,
the inviter, the manager, or the takeover actor.

### D27-R11 — external denial and internal successor are atomic

The return command uses one short authoritative transaction. It proves the
current candidate, lane, external context, policy, authorization, and route
result; makes the external invitation/context inert; creates the internal lane
and routing occurrence; records the receipt; and enqueues item reconciliation.
There is no provider network call inside the transaction and no committed
state with both pathways active.

### D27-R12 — independent security/policy revocation still wins

If the route is indeterminate but external access remains valid, return fails
without changing the external lane. If security, source, membership, identity,
or D26 policy independently requires external access to end, access ends
immediately and the lane becomes **reassignment_needed** unless the source
episode is terminal. Safety never waits for a replacement route.

### D27-R13 — one source CAS decides races

External completion, internal takeover, return, replacement, candidate
supersession, source cancellation, and policy termination all present expected
heads to one source-owned compare-and-swap boundary. Exactly one compatible
effect wins. Losers receive the current authoritative result and create no
duplicate invitation, item, receipt, lane, or review effect.

### D27-R14 — terminal-without-review is not automatic fallback

External decline, expiry, cancellation, revocation, or other terminal result
without a source review moves the lane to **reassignment_needed**. D27 does not
automatically restore the prior or current internal route. D28 must define one
explicit, state-driven next-lane choice.

### D27-R15 — candidate and source terminality win

Completion, request-changes semantics, cancellation, supersession, retirement,
transfer, or another source terminal fact ends the lane according to the
source. No prior route, item, invitation, grant, browser session, retry, or
worker may reopen it.

### D27-R16 — privacy-safe projection

Reviewer name, email, route recipients, candidate detail, independence facts,
policy facts, takeover actor, and history are visible only to separately
authorized viewers. Everyone else receives the minimum safe state:
**External review is in progress**, **Review needs reassignment**, or **This
review ended**. Logs and analytics carry opaque identifiers, not content or
email addresses.

### D27-R17 — durable business evidence is separate from telemetry

Every transition records an immutable, body-free command receipt with trusted
actor/Party, scope, prior and successor heads, reason code, semantic
idempotency key, authorization/policy/source generations, and correlation
identifier. Technical logs, email events, item engagement, and provider records
are diagnostic evidence, not the business history.

### D27-R18 — accessible, resilient Core UX

The staff surface uses Core's Base Maia primitives, visible state text, one
clear primary action, inline impact preview, non-color status, keyboard and
screen-reader semantics, 320 CSS-pixel reflow, Core's larger shared 44-CSS-
pixel touch targets while satisfying WCAG's 24-by-24 minimum, logical RTL
order, locale-aware names/dates, weak-network progress, idempotent retry,
conflict refresh, and no input-triggered handoff.

### D27-R19 — bounded scope

D27 does not edit or publish content, choose a default locale, mutate URLs,
change Giving, select Legal Entity/Stripe/settlement/bank/accounting identity,
send recurring reminders, create generic tasks, infer staff availability, add a
guest role, or create a workflow builder.

### D27-R20 — D28 owns recovery presentation; D29 owns responsibility

D27 creates the safe **reassignment_needed** fact only. D28 now requires one
explicit next-lane choice and defines the decline/expiry recovery presentation.
D29 must still decide the distinct bounded responsibility route, exact
recipient role, and resolver. Until D29 is accepted, the notification key stays
Reserved and implementation cannot broadcast by capability, original inviter,
admin label, or D21 review-route membership.

## Staff UX/UI contract

### Information architecture

The Site candidate review header shows one calm responsibility card:

- lane label and truthful substate;
- role-safe person/organization identity;
- unchanged public state;
- one primary next action for the current viewer;
- secondary **View history** only when authorized; and
- no workflow timeline, Kanban board, mutable assignee picker, or notification
  settings.

### External handoff journey

1. Staff select **Ask an external reviewer** from the candidate review page.
2. Core shows the exact candidate, locale, protected projection, person, expiry,
   policy/source admission, and internal attention that will end.
3. The footer says **Nothing changes until you confirm. Your live website
   remains unchanged.**
4. The primary button says **Send invitation and hand off**.
5. On success, the card immediately says **External review — invitation
   created**. Delivery is a smaller substatus.
6. On ambiguous response, the form stays safe and resolves the semantic command
   receipt before permitting another click.

### External lane states

**Delivery pending**

> **Waiting for Eli Ramos to accept**  
> The invitation is being sent. Eli has no review access until identity and
> acceptance checks succeed. Your live website is unchanged.  
> **View review details**

**Delivery failed**

> **Invitation created, but the email could not be sent**  
> Eli has not been told and has no review access. External review remains the
> selected lane; no internal reviewer was restored.  
> **Send again** · **Replace reviewer** · **Return to internal reviewers**

**Accepted**

> **Eli Ramos has this review**  
> Eli can review only this version until the shown expiry.  
> **Take over review**

### Deliberate return journey

The confirmation sheet leads with consequences:

> **Return this review to Hope Ministries?**  
> Eli's invitation and access will end immediately. Unfinished external work
> will not transfer. Core will use the current internal review route—not the
> people who had the old items. Your live website remains unchanged.

Then it presents exactly one of:

- **Ana Silva and Joel Martin will receive new Needs attention items**;
- **No internal reviewer will receive an item. Authorized staff can still find
  this review on the Site review page**; or
- **We could not prove the current internal route. Eli keeps this review until
  the route can be checked.**

The confirming action says **End external access and return review**.

### Takeover-and-complete journey

Where a source supports it and the actor is eligible:

> **Complete this review internally?**  
> Eli's access will end before your decision is recorded. Confirm that you
> reviewed this exact candidate and evidence. No internal item will be assigned
> to you.

The action says **End external access and record approval** or the
source-specific outcome. It is not offered when independence, evidence,
assurance, candidate, or source state is incomplete.

### Conflict and stale-state journey

If Eli completed while Ana confirmed takeover:

> **This review already ended**  
> Eli's review was recorded before your takeover. Nothing was changed twice.  
> **View current result**

No destructive toast, blank page, generic 409, or invitation resurrection
appears.

### Privacy and role-safe copy

Viewers without identity enumeration see **An external reviewer has this
review**. External reviewers whose access ended see:

> **This review is no longer available**  
> The organization changed who is handling it. No action is needed.

They do not learn who took over, the current route, internal policy, candidate
outcome, or public-release timing.

### Accessibility, mobile, localization, and weak network

- Focus moves to the sheet heading and returns predictably.
- Status changes use an appropriate live region without stealing focus.
- Destructive consequences precede the confirmation control in DOM order.
- Reviewer names wrap; truncation is not the sole identity cue.
- Locale, direction, date, and time-zone labels are explicit.
- The sheet reflows without two-dimensional scrolling at 320 CSS pixels.
- Buttons remain reachable above mobile safe areas and do not depend on hover.
- Double taps, refresh, and retry use one semantic command key.
- A lost response resolves current truth instead of asking staff to guess.

## Source of truth and ownership

| Fact                                     | Authoritative owner                        | Derived/projection      | Never authoritative         |
| ---------------------------------------- | ------------------------------------------ | ----------------------- | --------------------------- |
| Candidate/review episode and terminality | consequence-owning source                  | status UI               | lane label, item, provider  |
| Current responsibility lane              | source coordination owner                  | staff card              | route, item, browser, email |
| Durable internal route                   | D21 Site/Tenant route owner                | route preview           | old recipients, lane        |
| Current internal recipient result        | D21/D22 resolver plus Phase 12/source      | personal items          | route count alone           |
| External invitation identity/lifecycle   | Phase 4 plus D25                           | lane substatus          | email open/click            |
| External candidate access                | D25 Candidate Review Authorization Context | narrow external surface | saved contact, lane         |
| Internal authorization/independence      | Phase 12, source, D23/D24                  | action availability     | lane or item                |
| Personal attention/engagement            | ADR-0027/Phase 17                          | Needs attention/Recent  | responsibility or review    |
| Review result and actor                  | source final command/receipt               | outcome history         | handoff or delivery         |
| Public, Giving, and finance truth        | existing domain owners                     | unchanged reassurance   | D27                         |

## Domain invariants

1. One exact candidate/review episode has at most one current lane head.
2. Internal and external lanes are mutually exclusive.
3. Each lane references exactly one compatible internal occurrence, external
   invitation/context, reassignment reason, or terminal source fact.
4. Lane, route, item, engagement, delivery, contact, and provider state grant
   no permission.
5. Current authorization and D23/D24 independence are re-proved for every
   action.
6. One external lane references D25's one active exact-candidate person.
7. External handoff ends current internal items without mutating the durable
   route or engagement history.
8. Return resolves current route truth and never restores frozen recipients.
9. Released-zero is valid; indeterminate is not zero.
10. External denial and internal successor/final effect are atomic.
11. No committed state exposes both an active external context and an internal
    final-action lane.
12. One source CAS owns the final outcome and actor attribution.
13. Manager return grants no review authority; reviewer takeover grants no
    self-assignment.
14. External terminal-without-review becomes reassignment-needed, not fallback.
15. Candidate/source terminality wins every race.
16. Old lane heads, items, invitations, contexts, and engagement never revive.
17. All relationships remain exact Tenant/environment/Site/candidate/episode
    scoped.
18. Public content, Giving, finance, and unrelated private data are unaffected.

## Conceptual database, RLS, and authorization contract

### Required logical records

- immutable candidate-review lane revisions;
- one current lane-head pointer per exact candidate/review episode;
- closed lane kind with exclusive typed reference arcs;
- immutable semantic command receipts;
- D21 routing occurrence references;
- D25 invitation/context references;
- append-only external-end and internal-successor evidence; and
- transactional outbox/reconciliation obligations for item and delivery
  projection.

Do not reuse Mission Control tasks, notification queues, CMS fields, saved
contacts, a JSON workflow blob, or a mutable assigned-to column.

### Relational constraints

- UUID primary keys and non-null Tenant, environment, Site, candidate, episode.
- Composite foreign keys enforce same Tenant/environment/Site/candidate/
  episode on lane heads, revisions, routes, invitations, and receipts.
- A check constraint permits exactly one typed arc for each lane kind.
- A unique current-head constraint permits one current lane per episode.
- A unique semantic business key deduplicates each exact transition meaning.
- Restrictive deletion preserves attribution/history; privacy erasure uses the
  approved stable tombstone/anonymization contract.
- Indexes cover current-head lookup, active external reverse lookup, internal
  occurrence impact, reassignment-needed recovery, command receipts, and
  reconciliation/outbox scans.

### RLS and privilege requirements

- Enable and **force** RLS on lane heads/revisions, receipts, and repair tables.
- Browser roles receive no direct write grant; transitions use source commands
  in the API boundary.
- **USING** and **WITH CHECK** enforce exact scope, current assignment/context,
  purpose, candidate/episode, permitted transition, and immutable ownership.
- Tenant, environment, Site, actor, Party, Active Tenant Assignment, lane and
  candidate heads, route result, authorization, assurance, policy/source
  generations, and audit attribution come from trusted server context.
- Caller-supplied actor, lane kind, route recipients/result, reviewer identity,
  qualification, independence, end reason, or source outcome is intent only.
- Direct SQL, PostgREST, views, RPCs, storage, workers, service role, support,
  impersonation, import, migration, repair, and export paths pass the same
  tenant/authorization poison matrix.
- Security-definer functions use schema-qualified objects, fixed safe
  search_path, least privilege, revoked public execute, and positive/negative
  database tests.
- Cache keys include Tenant, environment, Site, candidate, episode, lane head,
  D25 context head, route occurrence, viewer purpose, and current policy/source/
  authorization generations.

### Command boundaries

**External handoff** locks/compares the current candidate and lane, proves D26
and source admission, creates the D25 invitation and lane successor, ends the
internal occurrence, records receipt/outbox, and commits before dispatch.

**Return internal** proves a complete route result before the transaction,
then rechecks its generation while atomically ending external access and
creating the internal successor. An indeterminate result produces no write.

**Take over and complete** atomically ends external access and records the one
source outcome only where the source owns such a command. Otherwise the UI
requires return first.

No command calls email, identity provider, CMS, or another network provider
inside the authoritative transaction.

## Lifecycle, temporal correctness, concurrency, and idempotency

| Current lane        | Event                                       | Next lane           | Authoritative result                                          |
| ------------------- | ------------------------------------------- | ------------------- | ------------------------------------------------------------- |
| internal            | form open/edit/abandon                      | internal            | no write                                                      |
| internal            | invitation handoff commits                  | external            | old internal occurrence Reassigned; invitation/outbox created |
| internal            | handoff fails/stales                        | internal            | no partial successor                                          |
| external            | provider send/delivery/open                 | external            | substatus only                                                |
| external            | acceptance                                  | external            | D25 context active; same lane                                 |
| external            | delivery failure                            | external            | recovery actions; no fallback                                 |
| external            | replace reviewer                            | external            | old context inert before one successor                        |
| external            | released route return                       | internal            | external inert plus fresh route occurrence                    |
| external            | zero-member return                          | internal            | external inert; zero-member occurrence; no items              |
| external            | indeterminate route return                  | external            | no write; safe repair guidance                                |
| external            | eligible takeover-and-complete              | terminal            | external inert plus one source result                         |
| external            | decline/expiry/cancel/revoke without result | reassignment_needed | no automatic internal lane                                    |
| external            | candidate/source ends                       | terminal            | no successor inherited                                        |
| reassignment_needed | D28 chooses internal                        | internal            | fresh current route                                           |
| reassignment_needed | D28 chooses external                        | external            | fresh D25 invitation                                          |
| any nonterminal     | concurrent loser                            | winner truth        | no duplicate business effect                                  |

Semantic idempotency is tied to {Tenant, environment, Site, candidate, episode,
command meaning, expected lane head, intended successor}, not one HTTP request.
Same key and meaning returns the original receipt/current truth. Reusing the key
for a different person, candidate, target, or effect rejects.

## Strongest alternatives

### Alternative A — internal and external remain actionable; first valid review wins

This minimizes coordination writes and offers redundancy, but duplicates work,
creates ambiguous accountability, and can disclose protected content to an
external person after an internal reviewer already acted. It weakens the staff
promise that handing off actually hands off. Rejected.

### Alternative B — external exclusive until it ends

This provides one lane but turns an invitation into an operational lock.
Authorized staff cannot recover from an unavailable or mistaken reviewer until
a timeout or manager action. It is less flexible than Core's D21/D25 boundaries
and worse for urgent ministry work. Rejected.

### Alternative C — wait for invitation acceptance before handoff

This feels intuitive but creates an unbounded parallel interval and ties
business responsibility to delayed/unreliable recipient/provider events.
Rejected.

### Alternative D — handoff at provider send success

Provider acceptance is not inbox delivery and can be lost, duplicated, or
reported after source state changed. It also leaves responsibility ambiguous
between database commit and network response. Rejected.

### Alternative E — assign to whoever presses Take over

This is superficially convenient but converts coordination into self-claim,
bypasses D21 routing, conflates management with review authority, and creates
stale mutable ownership. Rejected.

### Alternative F — generalized workflow/approval engine

Statuses, approver groups, due dates, escalation, reminders, task dependencies,
and custom transitions solve speculative problems and duplicate source truth.
Rejected for D27.

## External modern-practice evidence and limits

| Primary source                                                                                                                                                               | What it supports                                                                     | Limit for Core                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [Adobe Acrobat Sign — replace a recipient](https://helpx.adobe.com/sign/web/users/manage-agreements/replace-recipient.html)                                                  | Replacing one responsible recipient is distinct from adding an alternate             | E-sign recipient semantics are not Core source authorization                                |
| [Blackbaud Award Management — reviewer groups and reassignment](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/award-management/content/am-reviewer-groups.html) | Review responsibility can be deliberately reassigned                                 | Product-specific group workflows do not justify Core roles or queues                        |
| [Blackbaud Grantmaking — external reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html)                                      | Nonprofit grant systems use explicit external reviewer boundaries                    | Grantmaking does not prove Core's candidate/lane model                                      |
| [HubSpot — approve content](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)                                                                 | One pending approval request plus explicit cancel/reassign supports one visible lane | Core rejects mandatory due dates, super-admin bypass, and vendor-specific approver rules    |
| [Contentful — tasks](https://www.contentful.com/help/content-and-entries/tasks/)                                                                                             | Assignment is a distinct coordination object                                         | Core does not import required tasks, due dates, reminders, email, or all-task publish gates |
| [Contentful — workflow permissions](https://www.contentful.com/help/ai-automations/workflows/workflows-steps-management/)                                                    | Workflow responsibility and underlying permission remain separate                    | Core uses source commands rather than a generic CMS workflow                                |
| [Contentful — allow and deny rules](https://www.contentful.com/help/roles/space-roles-and-permissions/allow-and-deny-rules/)                                                 | Explicit deny/permission precedence supports current reproof                         | Contentful's role model is not Core's Party/Active Tenant Assignment model                  |
| [Linear — assigning issues](https://linear.app/docs/assigning-issues)                                                                                                        | A single visible assignee improves coordination clarity                              | Issue assignment grants no review authority and is not a security model                     |
| [Microsoft Power Automate — approval types](https://learn.microsoft.com/en-us/power-automate/get-started-approvals)                                                          | Parallel first-response and all-response semantics are meaningfully different        | Core deliberately avoids a generic approval orchestration engine                            |
| [GitHub — review request API](https://docs.github.com/en/rest/pulls/review-requests)                                                                                         | Review request and reviewer management are explicit operations                       | Code-review requests do not prove tenant or candidate authorization                         |
| [GitLab — merge request reviews](https://docs.gitlab.com/user/project/merge_requests/reviews/)                                                                               | Reviewer assignment is visible coordination separate from merge authority            | Repository merge semantics do not map directly to protected Site candidates                 |
| [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                             | Deny by default, validate every request, and enforce server-side                     | General security guidance; Core's exact policy comes from repository ADRs                   |
| [OWASP Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)                                     | Authorization must bind to exact transaction data and final effect                   | Does not prescribe Core's UI labels or database schema                                      |
| [W3C WCAG On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html)                                                                                               | Selecting/editing a field should not unexpectedly commit handoff                     | Does not choose the business transition                                                     |
| [W3C WCAG Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)                                                                                 | Async lane/delivery/conflict status must be programmatically exposed                 | Does not justify noisy announcements                                                        |
| [W3C WCAG Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)   | Mobile reflow and usable targets                                                     | Minimum conformance is not proof of excellent comprehension                                 |

The sources converge on explicit responsibility transfer, single-owner
coordination, separate permission, and accessible confirmation. None validates
Core's exact terminology, demand, state names, or source transaction design;
repository authority remains controlling.

## Full adversarial category review

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

- **What could go wrong:** Core could solve “who should see an item” rather
  than the root problem of ambiguous current review responsibility, or add a
  lane even where one source CAS plus ordinary source UI would suffice.
- **Why it matters:** A misplaced abstraction creates duplicate work and another
  state owner without improving staff confidence.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence or reasoning:** D21/D22 already solve routing and attention; D25
  creates an external actor. The unresolved gap is their exclusive coordination,
  not authorization. Parallel first-wins and external lock both fail realistic
  recovery journeys.
- **Decision effect:** Narrows the answer to a source-owned coordination head
  that composes existing domains.
- **Best permanent fix:** Keep one closed lane union, validate the task and
  language with actual ministry staff, and build no generic approval workflow.
- **Exact decision/spec language:** “The Candidate Review Responsibility Lane
  SHALL express only current review responsibility for one exact source
  candidate/review episode and SHALL NOT replace source outcome, D21 routing,
  D25 authorization, or Phase 17 attention.”

### 2. Brittleness

**Material concern: Yes.**

- **What could go wrong:** Handoff could depend on email success, recipient
  acceptance, old route snapshots, guessed availability, stale caches, or a
  reconciliation worker completing before safety is true.
- **Why it matters:** Providers, staff, routes, and networks change; ideal-order
  behavior would produce parallel authority or stranded reviews.
- **Severity:** Critical.
- **Likelihood:** High without exact transition rules.
- **Evidence or reasoning:** Official provider events are asynchronous; D21
  proves zero differs from unknown; D25 already requires current-context reproof.
- **Decision effect:** Requires commit-time handoff, current route resolution,
  source CAS, and authority that remains safe while projections lag.
- **Best permanent fix:** Put authoritative denial/successor state in one short
  transaction and make all external reads and final actions recheck current
  heads.
- **Exact decision/spec language:** “Provider, delivery, engagement, cache, and
  worker state SHALL NOT select a lane or be required for current access denial;
  indeterminate route resolution SHALL NOT be treated as zero.”

### 3. Technical debt

**Material concern: Yes.**

- **What could go wrong:** Teams could implement lane state in a CMS field,
  generic task, notification queue, invitation row, JSON blob, or multiple
  source-specific copies.
- **Why it matters:** Dual ownership and copied state make future source,
  permission, migration, and repair changes expensive and inconsistent.
- **Severity:** High.
- **Likelihood:** High because current runtime has tempting generic task and
  broad-permission precedents but no lane aggregate.
- **Evidence or reasoning:** ADR-0027 makes items projections; current Mission
  Control tasks have mutable assignee/due/reminder semantics; D25 invitation
  lifecycle does not own source responsibility.
- **Decision effect:** Requires one source coordination contract and adapters,
  not one app-local implementation per surface.
- **Best permanent fix:** Add typed immutable revisions/heads/receipts in the
  source boundary and reuse shared Base Maia presentation.
- **Exact decision/spec language:** “Implementations SHALL NOT persist the lane
  in Payload, notifications, Mission Control tasks, saved contacts, provider
  metadata, or free-form workflow JSON.”

### 4. Edge cases

**Material concern: Yes.**

- **What could go wrong:** Two tabs, double taps, bounced email, link scanners,
  role loss, route changes, zero recipients, route timeout, candidate
  supersession, external acceptance during revocation, or source completion
  during takeover could create contradictory state.
- **Why it matters:** These are ordinary distributed-system events, not exotic
  failures; mishandling can disclose content or duplicate outcomes.
- **Severity:** Critical.
- **Likelihood:** High over system lifetime.
- **Evidence or reasoning:** D25 and the completed D27 research identify each
  race; provider and browser events are independently delayed/duplicated.
- **Decision effect:** Adds a closed transition table, explicit zero/unknown
  behavior, and one expected-head winner.
- **Best permanent fix:** Test every pairwise race at the public command seam
  and fail losers to authoritative current truth.
- **Exact decision/spec language:** “Every admitted transition SHALL be
  idempotent and compare the current candidate, episode, lane, context, policy,
  source, and route generations; a loser SHALL create no business side effect.”

### 5. Footguns

**Material concern: Yes.**

- **What could go wrong:** A generic **Send**, **Cancel**, **Assign to me**, or
  dropdown change could hide revocation/handoff consequences; staff could think
  email failure restored internal review or that manager takeover authorizes a
  review.
- **Why it matters:** Small labels could cause privacy exposure, abandoned work,
  unauthorized decisions, or accidental loss of external work.
- **Severity:** High.
- **Likelihood:** Medium to high.
- **Evidence or reasoning:** W3C warns against context changes on input; Core's
  permission/responsibility split is invisible unless copy states it.
- **Decision effect:** Requires consequence-led preview and explicit action
  labels; prohibits self-claim.
- **Best permanent fix:** Use one review card, one primary action, exact
  consequences, confirm only at the final button, and safe conflict results.
- **Exact decision/spec language:** “No selection, form open, preview, route
  edit, or provider event SHALL hand off; final actions SHALL name both external
  denial and the intended successor effect.”

### 6. Tenant safety

**Material concern: Yes.**

- **What could go wrong:** A lane, invitation, cache, item, history row, worker,
  or manager command could cross Tenant, environment, Site, candidate, episode,
  or Party scope.
- **Why it matters:** The lane concerns protected unpublished content and human
  identity; one cross-scope link is a material tenant breach.
- **Severity:** Critical.
- **Likelihood:** Medium without composite scoping and poison tests.
- **Evidence or reasoning:** Platform boundaries require tenant enforcement
  below UI; current service-role patterns do not prove Party/source parity.
- **Decision effect:** Makes exact composite scope a relational and command
  invariant, including privileged paths.
- **Best permanent fix:** Same-scope foreign keys, force RLS, trusted server
  derivation, cache partitioning, and cross-tenant/environment poison suites.
- **Exact decision/spec language:** “Every D27 row, reference, query, cache key,
  command, event, export, and repair SHALL bind the same Tenant, environment,
  Site, candidate, and review episode; mismatch SHALL deny and emit evidence.”

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

- **What could go wrong:** Caller-controlled actor/route/reviewer fields, weak
  foreign keys, mutable scope, missing **WITH CHECK**, service-role bypass, or
  an allowed update that changes a row into another tenant/state could defeat
  the model.
- **Why it matters:** UI checks cannot protect candidate data or final source
  effects.
- **Severity:** Critical.
- **Likelihood:** High if implemented as conventional CRUD.
- **Evidence or reasoning:** Phase 12 requires exact capabilities and trusted
  Active Tenant Assignment; platform-boundary rules explicitly reject UI-only
  isolation; current generic task RLS is not sufficient.
- **Decision effect:** Prohibits direct browser writes and requires a privileged
  command with transition-specific server proof.
- **Best permanent fix:** Immutable revisions, one head CAS, composite keys,
  force RLS, restrictive grants, safe security-definer functions, and parity
  tests for every privileged path.
- **Exact decision/spec language:** “The server SHALL derive actor, Party,
  scope, current heads, authorization, independence, route result, and audit
  attribution from trusted context; **USING** and **WITH CHECK** SHALL reject
  scope mutation and every inadmissible transition.”

### 8. Overengineering

**Material concern: Yes.**

- **What could go wrong:** Core could add approval stages, timers, escalations,
  SLAs, due dates, reminders, queues, workflow templates, presence, claims, or
  custom transition builders for speculative future use.
- **Why it matters:** That would make the product harder for small ministries
  and duplicate source, Phase 17, and communication ownership.
- **Severity:** High.
- **Likelihood:** Medium because comparable CMS/CRM products expose those
  features.
- **Evidence or reasoning:** Contentful/HubSpot workflows contain useful
  coordination patterns but also complexity D19 explicitly rejected; the
  founder chose one lane.
- **Decision effect:** Narrows D27 to four postures and a few source commands.
- **Best permanent fix:** Treat every new posture/transition as a founder/source
  contract change; keep optional notes, due dates, automation, and escalation
  out.
- **Exact decision/spec language:** “D27 SHALL NOT create a generic task,
  approval, workflow, queue, escalation, reminder, due-date, claim, or presence
  subsystem.”

### 9. UX/UI and user friction

**Material concern: Yes.**

- **What could go wrong:** One lane could become opaque: staff might not know
  why internal action disappeared, whether the email arrived, what takeover
  revokes, who gets the review next, or whether Live/Giving changed.
- **Why it matters:** Confusion can cause duplicate work, donor-facing fear,
  delayed publishing, and destructive retries.
- **Severity:** High.
- **Likelihood:** High unless states and consequences are explicitly designed.
- **Evidence or reasoning:** Comparable systems use explicit pending/reassign
  states; WCAG requires non-surprising input and accessible status; Core's
  product principles prioritize clarity and coherence.
- **Decision effect:** Requires one responsibility card, truthful delivery
  substatus, role-safe identity, current-route preview, unchanged-public copy,
  mobile/a11y/locale behavior, and safe conflict recovery.
- **Best permanent fix:** Prototype and test complete journeys with actual
  nonprofit staff on desktop, mobile, keyboard, screen reader, RTL, long names,
  low bandwidth, zero routes, and failure states.
- **Exact decision/spec language:** “Every lane-changing confirmation SHALL
  state who currently has responsibility, what access ends, what does not
  transfer, the exact successor result, and that the Live website and Giving
  remain unchanged.”

### 10. Source of truth, ownership, and domain invariants

**Material concern: Yes.**

- **What could go wrong:** The source, lane, invitation, item, provider, and CMS
  could each appear to own current responsibility or completion.
- **Why it matters:** Dual ownership produces circular synchronization,
  historical drift, and unrepairable disagreement after partial failure.
- **Severity:** Critical.
- **Likelihood:** High without an explicit authority matrix.
- **Evidence or reasoning:** D19–D26 already assign each fact to a distinct
  owner; ADR-0027 forbids projection from becoming source truth.
- **Decision effect:** Places candidate/terminality/result and the lane head in
  the consequence-owning source; other domains project/reference.
- **Best permanent fix:** Encode exclusive arcs and same-scope references,
  document the matrix in ADR/OpenSpec, and permit only source commands to
  advance the head.
- **Exact decision/spec language:** “The consequence-owning source SHALL own the
  candidate, review episode, current lane head, and final result; invitation,
  route, item, provider, and CMS projections SHALL NOT write those facts.”

### 11. Hidden coupling

**Material concern: Yes.**

- **What could go wrong:** D27 could silently depend on email availability,
  Phase 17 item creation, one CMS, D21 route recipients, global admins, D26 UI,
  or a provider's acceptance state.
- **Why it matters:** Provider outages, route changes, source additions, and app
  migrations would unexpectedly change authority.
- **Severity:** High.
- **Likelihood:** Medium to high.
- **Evidence or reasoning:** Core deliberately separates Phase 4 identity,
  Phase 6 communication, Phase 12 authorization, Phase 17 presentation, and
  source consequences.
- **Decision effect:** Requires typed contracts and outbox projections while
  keeping source authority independent of secondary effects.
- **Best permanent fix:** Define versioned source adapter interfaces and
  dependency failure semantics; never infer lane truth from a downstream system.
- **Exact decision/spec language:** “Email, CMS, item, provider, and route
  projection failures SHALL be repairable without reversing, fabricating, or
  advancing the authoritative lane.”

### 12. Failure modes

**Material concern: Yes.**

- **What could go wrong:** Invitation commit may succeed while dispatch fails;
  lane commit may succeed while items lag; revocation may succeed while cache is
  stale; the response may be lost; or reconciliation may repeatedly fail.
- **Why it matters:** Staff need truthful recovery while protected access fails
  safely and business history remains diagnosable.
- **Severity:** Critical.
- **Likelihood:** High over time.
- **Evidence or reasoning:** These are normal transactional-outbox and
  distributed-cache failure shapes; the primary research enumerates them.
- **Decision effect:** Separates authoritative transaction from retryable
  projection and requires command receipts/reconciliation.
- **Best permanent fix:** Outbox after commit, current checks on every protected
  effect, semantic retry, staff-visible status, dead-letter repair, and no
  rollback-by-resurrection.
- **Exact decision/spec language:** “After authoritative commit, secondary
  failure SHALL preserve the committed lane, expose a truthful recoverable
  state, and retry idempotently; repair SHALL never restore ended authority.”

### 13. Lifecycle, temporal correctness, concurrency, and idempotency

**Material concern: Yes.**

- **What could go wrong:** Late delivery/acceptance, expiry during an open page,
  policy change, backdated audit, concurrent completion/takeover, or key reuse
  could make two individually valid actions jointly violate exclusivity.
- **Why it matters:** One duplicate review or favorable stale access breaks the
  core promise.
- **Severity:** Critical.
- **Likelihood:** High at production concurrency.
- **Evidence or reasoning:** D25 already requires revoke-before-replace and
  exact-candidate CAS; D27 adds a second pathway that must share that boundary.
- **Decision effect:** Defines all states/transitions, candidate/source
  terminality precedence, exact expiry, semantic keys, and one CAS winner.
- **Best permanent fix:** Transactional state machine with expected heads,
  server time, immutable receipts, duplicate-delivery handling, and pairwise
  race tests.
- **Exact decision/spec language:** “Late or duplicate provider, browser,
  worker, or retry events SHALL be monotone evidence only and SHALL NOT advance
  an ended or superseded lane.”

### 14. Data integrity risks

**Material concern: Yes.**

- **What could go wrong:** Duplicate heads, orphan references, multiple active
  invitations, stale recipient restoration, partial handoffs, incorrect actor
  attribution, or deleted history could corrupt reporting and recovery.
- **Why it matters:** Staff could contact the wrong person, expose the wrong
  candidate, or be unable to prove who reviewed what.
- **Severity:** Critical.
- **Likelihood:** Medium without database constraints and idempotent repair.
- **Evidence or reasoning:** Application convention cannot make one-current-head
  or exclusive-arc invariants impossible to violate under concurrency.
- **Decision effect:** Requires relational constraints, append-only evidence,
  restrictive deletes, and no copied reviewer/source content.
- **Best permanent fix:** Unique/exclusion constraints, composite FKs, typed
  checks, immutable receipts, reconciliation audits, and migration poison data.
- **Exact decision/spec language:** “The database SHALL make multiple current
  lane heads, incompatible reference arcs, cross-scope links, and duplicate
  semantic transitions impossible, not merely discouraged by application code.”

### 15. Security and privacy risks

**Material concern: Yes.**

- **What could go wrong:** Stale external access, overbroad manager takeover,
  identity enumeration, candidate content in logs, exports/backups, cached
  browser pages, or support impersonation could expose sensitive ministry data.
- **Why it matters:** Unpublished location, personnel, member-care, missionary,
  and ministry context may be highly sensitive.
- **Severity:** Critical.
- **Likelihood:** Medium; impact is high even at low frequency.
- **Evidence or reasoning:** D25 intentionally minimizes projection and requires
  current access checks; OWASP requires per-request authorization; platform
  boundaries reject UI-only safeguards.
- **Decision effect:** Requires privacy-safe role projections, immediate
  revocation, data minimization, retention/anonymization, and governed support/
  export paths.
- **Best permanent fix:** Narrow D25 projection, opaque telemetry, current
  context/lane checks, cache-control, audit-only identity, and tested erasure/
  export contracts.
- **Exact decision/spec language:** “D27 SHALL persist no candidate body or
  external email in telemetry, SHALL expose identity only to authorized viewers,
  and SHALL deny every protected read/effect after current context or lane loss.”

### 16. Scalability and performance risks

**Material concern: Yes.**

- **What could go wrong:** Returning internally could scan every staff member,
  item reconciliation could become N-squared, current-lane checks could add
  unbounded joins, or reassignment queues could grow without indexed lookup.
- **Why it matters:** Large Tenants and high candidate volume would create slow
  confirmations, timeouts mistaken for zero, or stale favorable access.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence or reasoning:** D22 deliberately caps routed co-responsible
  recipients at three; D21 needs bounded proof; current generic task listing has
  a fixed limit but not D27's correctness.
- **Decision effect:** Keeps resolver output bounded, indexes active/recovery
  paths, and treats timeout/truncation as indeterminate.
- **Best permanent fix:** Production-shaped load budgets, query plans, bounded
  reverse indexes, batch reconciliation, and no roster-wide authorization scan.
- **Exact decision/spec language:** “Route resolution SHALL return a complete
  bounded proof or indeterminate; timeout, truncation, limit overflow, stale
  generation, or partial pages SHALL never release a return command.”

### 17. Operational burden

**Material concern: Yes.**

- **What could go wrong:** Staff or support may need recurring cleanup, direct
  database repair, provider inspection, manual item recreation, or tribal
  knowledge to recover stuck lanes.
- **Why it matters:** Small ministries and support teams cannot safely operate a
  fragile workflow.
- **Severity:** High.
- **Likelihood:** Medium without first-class recovery.
- **Evidence or reasoning:** Every distributed side effect can fail; D19 rejects
  recurring reminders/generic tasks as hidden operational machinery.
- **Decision effect:** Requires source-visible status, idempotent retry/replace/
  return, repair tooling, and no manual authority edits.
- **Best permanent fix:** Governed diagnostic/repair commands that recompute
  projections from immutable truth, plus runbooks and bounded alerts.
- **Exact decision/spec language:** “No ordinary D27 recovery SHALL require SQL,
  provider-console edits, item fabrication, or developer intervention; repair
  commands SHALL preserve the same authorization and invariants.”

### 18. Observability and auditability gaps

**Material concern: Yes.**

- **What could go wrong:** Logs could show a click without proving commit, or a
  committed handoff could lack actor, prior/successor heads, reason, or projection
  status.
- **Why it matters:** Staff, security, and support could not distinguish
  duplicate clicks, stale UI, provider failure, authorization denial, or actual
  business history.
- **Severity:** High.
- **Likelihood:** High if telemetry is mistaken for audit.
- **Evidence or reasoning:** ADR-0027 separates engagement from source truth;
  D25 separates invitation/provider lifecycle from authorization.
- **Decision effect:** Requires immutable business receipts plus separate
  technical traces and role-safe staff history.
- **Best permanent fix:** Transaction-bound receipts/outbox evidence, opaque
  correlations, transition/reconciliation metrics, and a safe history view.
- **Exact decision/spec language:** “Every committed transition SHALL have one
  immutable source receipt in the same transaction; technical logs, analytics,
  item engagement, and provider events SHALL NOT substitute for it.”

### 19. Dependency and integration risks

**Material concern: Yes.**

- **What could go wrong:** Email/provider outage, API schema changes, rate
  limits, duplicate webhooks, identity-provider disagreement, or CMS/source
  adapter drift could alter or strand responsibility.
- **Why it matters:** External systems are not under Core's transaction or
  authorization control.
- **Severity:** High.
- **Likelihood:** High over product lifetime.
- **Evidence or reasoning:** Official provider models expose asynchronous
  send/accept/reassign behavior; OWASP guidance keeps authorization local to the
  protected operation.
- **Decision effect:** Provider facts become projections only; Core owns lane,
  access ceiling, idempotency, and reconciliation.
- **Best permanent fix:** Versioned adapters, provider event deduplication,
  monotone mapping, retries/backoff, reconciliation, outage copy, and no provider
  call inside source transaction.
- **Exact decision/spec language:** “Provider success, failure, webhook, open,
  and acceptance SHALL update only admitted D25 lifecycle evidence and SHALL
  never grant source authority, select a lane, or revive ended access.”

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

- **What could go wrong:** Old readers may ignore new lane heads, new writers may
  create states old code treats as internal, backfills may infer ownership from
  items/invitations, rollback may revive access, or mixed source adapters may
  disagree.
- **Why it matters:** A deployment window could create parallel authority or
  hidden reviews even when steady-state design is correct.
- **Severity:** Critical.
- **Likelihood:** Medium without explicit sequencing.
- **Evidence or reasoning:** Current runtime has none of D25–D27; this is an
  additive cross-domain model, not a safe one-step field migration.
- **Decision effect:** Requires reader-first compatibility, no inferred
  backfill, kill switch, adapter readiness, dark reads, cohort rollout, and
  roll-forward repair.
- **Best permanent fix:** Reserve-only until dependencies exist; deploy deny/
  read enforcement before writes; never assume code rollback after authority
  rows is safe.
- **Exact decision/spec language:** “Migration SHALL NOT infer lane, actor, or
  recipient from historical items, tasks, contacts, email, or CMS state; unknown
  preexisting review state SHALL remain safe and require explicit resolution.”

### 21. Testability, traceability, and proof

**Material concern: Yes.**

- **What could go wrong:** Tests may assert component labels while missing
  cross-tenant mutation, stale grant, zero/unknown routing, pairwise races,
  migration compatibility, or user-visible failure recovery. D27 wording could
  diverge across decision log, ADR, glossary, OpenSpec, design, tickets, code,
  and release evidence.
- **Why it matters:** The one-lane promise is only credible if independently
  falsifiable at public seams and traceable through implementation.
- **Severity:** Critical.
- **Likelihood:** High without an explicit matrix.
- **Evidence or reasoning:** The current active OpenSpec still contains an
  older latest-editor rule that D24 must correct; current runtime is a negative,
  not confirming, precedent.
- **Decision effect:** Adds 110 acceptance criteria, pairwise authorization/
  migration/accessibility tests, ADR-0182, and required trace links.
- **Best permanent fix:** Contract tests at API/database/source seams, realistic
  multi-actor concurrency, release evidence, and one terminology registry.
- **Exact decision/spec language:** “Implementation SHALL NOT ship until every
  D27 acceptance criterion traces to OpenSpec/design/tasks/tests and production
  evidence, with no contradictory term, state, role, or authority owner.”

### 22. Other development hazards

**Material concern: Yes.**

- **What could go wrong:** A feature flag may disable enforcement but leave
  access, analytics may treat takeover as staff performance, notification counts
  may drive authority, translations may imply approval, or repair tooling may
  bypass invariants.
- **Why it matters:** Cross-cutting “convenience” behavior can silently undo the
  narrow model even when core commands are correct.
- **Severity:** High.
- **Likelihood:** Medium.
- **Evidence or reasoning:** D19 forbids engagement from becoming workflow
  truth; D26 forbids widening/resurrection; platform principles place safety
  ahead of convenience.
- **Decision effect:** Adds explicit kill-switch, analytics, localization,
  repair, and non-goal constraints.
- **Best permanent fix:** Treat every auxiliary path as an authorization path,
  keep metrics aggregate/privacy-safe, make feature-off deny new handoffs, and
  require reviewed translations.
- **Exact decision/spec language:** “Flags, analytics, localization, support,
  repair, import, export, and background jobs SHALL preserve D27 authority and
  no-resurrection invariants and SHALL NOT infer worker performance or reviewer
  availability from engagement.”

## Acceptance criteria

These are falsifiable decision outcomes for later OpenSpec, design, tests, and
release evidence. They do not claim implementation exists.

### Lane semantics and ownership

1. **D27-AC001 — One current head.** One exact Tenant/environment/Site/
   candidate/review episode cannot persist two current lane heads.
2. **D27-AC002 — Closed kinds.** Only internal, external,
   reassignment-needed, and terminal lane kinds are accepted.
3. **D27-AC003 — Exclusive arc.** Each lane revision has exactly one reference
   arc compatible with its kind.
4. **D27-AC004 — No parallel state.** No API/database transition can commit an
   internal lane while a current external context remains active.
5. **D27-AC005 — Source ownership.** Item, route, invitation, provider, browser,
   or CMS writes cannot advance the source lane head.
6. **D27-AC006 — Coordination only.** Creating or reading a lane grants no
   capability, membership, independence, projection, or source action.
7. **D27-AC007 — Route attention only.** Adding a person to the D21 route does
   not by itself permit takeover or review.
8. **D27-AC008 — Item attention only.** Receiving or opening a personal item
   does not permit takeover or review.
9. **D27-AC009 — Candidate exactness.** A lane for candidate A cannot authorize,
   end, or report a review for candidate B or a successor episode.
10. **D27-AC010 — Terminal monotonicity.** No retry, provider event, item event,
    route edit, or worker can reopen a terminal episode.

### External handoff

11. **D27-AC011 — Form is inert.** Opening, editing, selecting within, or
    abandoning the external-review form creates no invitation or lane change.
12. **D27-AC012 — Exact label.** The final primary action communicates both
    send and handoff; a generic **Send** is not the sole label.
13. **D27-AC013 — Preview scope.** The preview shows exact Site, candidate,
    locale, reviewer, access/expiry, and unchanged Live state to authorized
    viewers.
14. **D27-AC014 — Preview impact.** The preview states that current internal
    attention ends and that underlying staff permission/route does not.
15. **D27-AC015 — Atomic creation.** Successful handoff commits the invitation,
    external lane, prior internal end, receipt, and delivery outbox obligation
    in one authoritative transaction.
16. **D27-AC016 — Failed transaction.** Any failure before that commit leaves
    the internal lane/items current and creates no active invitation.
17. **D27-AC017 — Stale expected head.** A handoff using stale candidate or lane
    heads creates nothing and returns current truth.
18. **D27-AC018 — D26 reproof.** Current D26 policy/source ceiling is re-proved
    at handoff even when the form rendered as allowed.
19. **D27-AC019 — D23/D24 reproof.** Current source independence and all
    substantive participants are re-proved at handoff.
20. **D27-AC020 — No network transaction.** Provider/email calls occur only
    after authoritative commit and cannot roll the lane back.

### Provider and external lifecycle

21. **D27-AC021 — Created is handoff.** Immediately after durable invitation
    creation, the current lane is external even before dispatch begins.
22. **D27-AC022 — Provider accepted is not delivered.** Provider acceptance is
    labeled truthfully and does not claim inbox receipt.
23. **D27-AC023 — Open is not acceptance.** Email open, link scanner, preview,
    or browser request cannot accept the invitation or change the lane.
24. **D27-AC024 — Acceptance is same lane.** Valid identity acceptance activates
    only the D25 context and creates no second handoff.
25. **D27-AC025 — Delivery failure stays external.** Bounce/timeout/failure
    exposes retry/replace/return and creates no internal item.
26. **D27-AC026 — Retry identity.** Sending again reuses the same invitation
    business identity and cannot extend expiry by accident.
27. **D27-AC027 — Replacement ordering.** Replacing makes the prior invitation/
    context inert before one successor becomes active.
28. **D27-AC028 — Activity truth.** UI shows **Review in progress** only from a
    source-owned fact, never elapsed time/open/presence/unsaved text.
29. **D27-AC029 — Expiry enforcement.** After authoritative expiry, the next
    protected external read/effect denies even if a page or token is cached.
30. **D27-AC030 — Terminal without review.** Decline, expiry, cancellation, or
    revocation without a source outcome enters reassignment-needed, not internal.

### Takeover, management, and route resolution

31. **D27-AC031 — Non-route eligible actor.** A current independently eligible
    internal actor outside the attention route can initiate permitted takeover.
32. **D27-AC032 — Routed ineligible actor.** A route recipient who loses current
    source authority cannot take over or review.
33. **D27-AC033 — Manager return.** A manager with exact lane-management
    capability can return the lane without receiving review capability.
34. **D27-AC034 — Manager cannot complete.** That manager cannot use
    takeover-and-complete absent independent exact review authority/evidence.
35. **D27-AC035 — No self-claim.** Return never selects the pressing actor unless
    that actor independently appears in the current resolved route.
36. **D27-AC036 — Current route.** Return uses the current route/generation, not
    the pre-handoff recipient snapshot.
37. **D27-AC037 — Released recipients.** A complete released route with one to
    three eligible people creates one fresh occurrence and fresh personal items.
38. **D27-AC038 — Released zero.** A complete released-zero route creates one
    internal zero-member occurrence, no personal item, and source discoverability.
39. **D27-AC039 — Indeterminate preservation.** Timeout, partial, stale,
    contradictory, over-limit, or failed route proof leaves a valid external
    lane/context unchanged.
40. **D27-AC040 — Security override.** If independent policy/security requires
    denial while route proof is indeterminate, external access ends and the lane
    becomes reassignment-needed or source-terminal.

### Atomicity, races, and idempotency

41. **D27-AC041 — Atomic return.** External denial and internal lane/occurrence
    creation commit together; neither is observable alone.
42. **D27-AC042 — Atomic complete.** Supported takeover-and-complete makes
    external access inert and records exactly one source result in one boundary.
43. **D27-AC043 — Unsupported combined action.** A source without that atomic
    command offers return first and cannot simulate completion across two writes.
44. **D27-AC044 — Completion versus takeover.** A concurrent external completion
    and internal takeover produce exactly one source winner and one safe loser.
45. **D27-AC045 — Handoff versus internal completion.** A concurrent handoff
    and internal completion produce one winner; no invitation remains after a
    terminal internal result.
46. **D27-AC046 — Two handoffs.** Concurrent invitations for different external
    people create at most one active external invitation/lane.
47. **D27-AC047 — Return versus replace.** Concurrent return and external
    replacement yield one current successor and no favorable overlap.
48. **D27-AC048 — Same-key retry.** Same semantic key and exact meaning returns
    the prior receipt/result without another transition.
49. **D27-AC049 — Key misuse.** Reusing a key for a different candidate,
    reviewer, target, or command meaning rejects.
50. **D27-AC050 — Lost response.** Refresh/retry after a lost response resolves
    current source truth before enabling another destructive action.

### Database, RLS, authorization, and tenant isolation

51. **D27-AC051 — Composite scope.** Cross-Tenant, environment, Site, candidate,
    or episode foreign-key references fail at the database boundary.
52. **D27-AC052 — Immutable scope.** An admitted update cannot mutate any
    ownership/scope field into a forbidden state.
53. **D27-AC053 — Forced RLS.** Lane/receipt/repair tables have RLS enabled and
    forced for applicable owners.
54. **D27-AC054 — No browser writes.** Anonymous/authenticated browser roles
    have no direct insert/update/delete grant on authoritative D27 records.
55. **D27-AC055 — USING and WITH CHECK.** Negative tests prove both row
    visibility and mutation targets enforce exact scope and transition.
56. **D27-AC056 — Trusted actor.** Spoofed actor, Party, assignment, lane,
    reviewer, route result, or attribution input cannot change the trusted value.
57. **D27-AC057 — Current assignment.** Expired/revoked Active Tenant Assignment
    denies the next command even with a previously loaded page.
58. **D27-AC058 — Stable human.** Alternate accounts cannot bypass D23/D24
    independence where stable-human proof is required.
59. **D27-AC059 — Privileged parity.** Service role, worker, support,
    impersonation, repair, import, export, view, RPC, and direct SQL paths pass
    the same scope/transition poison matrix.
60. **D27-AC060 — Cache isolation.** Cache keys and invalidation prevent one
    tenant, environment, viewer purpose, candidate, lane, or context from serving
    another's favorable result.

### Attention, engagement, privacy, and history

61. **D27-AC061 — Reassigned meaning.** External handoff ends current internal
    personal items as Reassigned, not reviewed/completed/declined.
62. **D27-AC062 — Route unchanged.** Handoff does not alter the configured D21
    Tenant/Site responsibility route.
63. **D27-AC063 — Engagement preserved.** Prior read/unread/open/archive history
    remains historical and is not copied to successor items.
64. **D27-AC064 — Fresh engagement.** A later internal occurrence creates new
    personal items with independent engagement state.
65. **D27-AC065 — Old item cannot act.** Deep links from ended items recheck the
    current lane and cannot invoke a stale final action.
66. **D27-AC066 — Old item never revives.** Reversal, retry, route restoration,
    repair, or feature rollback cannot reactivate an ended item.
67. **D27-AC067 — No default messaging.** Handoff/return creates no automatic
    email, push, recurring reminder, or “removed” message beyond separately
    authorized delivery.
68. **D27-AC068 — Role-safe identity.** A viewer lacking reviewer enumeration
    sees a generic external-lane label and no name/email.
69. **D27-AC069 — External denial copy.** An ended external reviewer learns only
    that access ended and no action is needed, not the successor/actor/outcome.
70. **D27-AC070 — Body-free evidence.** Command receipts/logs/analytics contain
    no candidate body, sensitive location, or external email in clear telemetry.

### Staff UX, accessibility, localization, and resilience

71. **D27-AC071 — One visible card.** The candidate surface presents one current
    responsibility card, not simultaneous internal/external actionable cards.
72. **D27-AC072 — State plus substate.** Delivery pending/failed/accepted is
    visually subordinate to the external lane and cannot be mistaken for lane
    ownership.
73. **D27-AC073 — Consequence order.** Confirmation copy states access ending
    and unfinished-work loss before the final action in DOM and visual order.
74. **D27-AC074 — Live reassurance.** Handoff, failure, return, takeover, and
    conflict states state that Live and Giving remain unchanged where helpful.
75. **D27-AC075 — Programmatic status.** Async success/failure/conflict changes
    are exposed to assistive technology without unexpected focus movement.
76. **D27-AC076 — Keyboard.** Every view, confirmation, retry, replace, return,
    history, and cancel action is fully keyboard operable with visible focus.
77. **D27-AC077 — Reflow.** All states reflow at 320 CSS pixels without
    two-dimensional scrolling or clipped primary controls.
78. **D27-AC078 — Target size.** Interactive targets use Core's shared 44-CSS-
    pixel touch contract, satisfy WCAG 2.2's minimum, and remain reachable above
    mobile safe areas.
79. **D27-AC079 — Locale and direction.** Long Unicode names, RTL direction,
    explicit locale, time zone, and expiry render without identity ambiguity.
80. **D27-AC080 — No input commit.** Selecting reviewer, route, or option never
    commits the transition before explicit confirmation.

### Failure, repair, operations, and observability

81. **D27-AC081 — Dispatch lag.** Invitation commit plus delayed worker remains
    external/delivery-pending and does not restore internal items.
82. **D27-AC082 — Item lag.** Internal return plus delayed Phase 17 projection
    remains internally authoritative and cannot revive external access.
83. **D27-AC083 — Stale external cache.** Current protected read/effect denies
    after revocation even before purge/revalidation completes.
84. **D27-AC084 — Reconciliation retry.** Duplicate/reordered reconciliation
    produces the same item/end state and no authority change.
85. **D27-AC085 — Dead letter.** A repeatedly failing outbox/reconciliation
    obligation produces an owner-visible operational signal and safe staff state.
86. **D27-AC086 — One receipt.** Every committed transition has exactly one
    immutable receipt in the authoritative transaction.
87. **D27-AC087 — No click-as-audit.** A UI click or provider log without a
    command receipt cannot be reported as a committed handoff/takeover.
88. **D27-AC088 — Safe history.** Authorized history distinguishes handoff,
    delivery, acceptance, replacement, return, completion, and reassignment
    without exposing candidate body.
89. **D27-AC089 — Governed repair.** Repair recomputes projections from
    authoritative heads/receipts and cannot directly fabricate a lane or review.
90. **D27-AC090 — Ordinary recovery.** Delivery failure, conflict, replace, and
    return can be recovered without SQL/provider-console/developer intervention.

### Migration, rollout, dependency, and performance

91. **D27-AC091 — No inferred backfill.** Migration does not infer current lane,
    actor, reviewer, or recipients from historical tasks/items/email/CMS/contact.
92. **D27-AC092 — Reader first.** Deployed readers deny/understand every D27
    state before any production writer can create one.
93. **D27-AC093 — Old-code compatibility.** Mixed-version tests prove old code
    cannot treat external/reassignment/unknown lane state as internal authority.
94. **D27-AC094 — New-code compatibility.** New code fails safe against absent/
    old schema and cannot create partial authority.
95. **D27-AC095 — Kill switch.** Feature-off stops new external handoffs while
    preserving current denial, history, and explicit recovery; it revives nothing.
96. **D27-AC096 — Provider outage.** A provider outage cannot block authoritative
    return/takeover or create parallel authority.
97. **D27-AC097 — Duplicate webhook.** Duplicate, delayed, or contradictory
    provider events are deduplicated/flagged and never advance ended state.
98. **D27-AC098 — Bounded resolver.** Route/authorization resolution has a
    production-shaped bound; overflow/timeout returns indeterminate, not zero.
99. **D27-AC099 — Indexed current path.** Query-plan proof covers current lane,
    external context, reassignment recovery, receipt, and outbox lookups at the
    agreed production-shaped tenant/candidate volumes.
100.  **D27-AC100 — Cohort rollback.** Rollout pause/rollback has a proven
      roll-forward repair for already-written lanes and never deletes evidence.

### Traceability, source effects, and non-goals

101. **D27-AC101 — D19 trace.** D27 personal item behavior traces to one
     source-driven actionable meaning and separate engagement.
102. **D27-AC102 — D21/D22 trace.** Internal return creates one new current
     routing occurrence and zero-to-three current personal projections.
103. **D27-AC103 — D25 trace.** External lane references exactly one current
     candidate-scoped invitation/context and honors revoke-before-successor.
104. **D27-AC104 — D26 trace.** Current Tenant/Site/source policy narrowing can
     deny external access without waiting for a lane replacement.
105. **D27-AC105 — ADR-0182 trace.** The accepted one-lane tradeoff, handoff
     timing, and no-self-claim invariants are recorded in a dedicated ADR.
106. **D27-AC106 — Glossary trace.** **Candidate review responsibility lane** has
     one definition and is not used as a synonym for route, item, role, or lock.
107. **D27-AC107 — Source outcome.** D27 cannot edit/publish content or infer
     approval; only the consequence-owning source command records an outcome.
108. **D27-AC108 — Giving isolation.** No D27 state/action chooses Giving
     capability, URL, Legal Entity, Stripe, settlement, bank, or accounting
     identity.
109. **D27-AC109 — Release proof.** Release evidence includes positive,
     negative, boundary, tenant, authorization, race, migration, accessibility,
     low-bandwidth, and production-shaped outcomes—not component snapshots alone.
110. **D27-AC110 — D28 fence.** Until D28 is accepted and traced, external
     terminal-without-review can only enter reassignment-needed; no automatic
     internal fallback or silent no-item recovery may ship. D28 now satisfies
     the behavior fence; D29 still fences recipient publication.

## Named monitoring plan

Thresholds are launch hypotheses. Product, Security, Platform, and Operations
owners must ratify them against production-shaped tests and early cohort
baselines. No monitor may choose a lane, grant/revive access, create review
authority, publish content, or change Giving automatically.

| Signal                                                    | Threshold                                                                  | Owner                          | Required response                                                                                                   |
| --------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `candidate_review_multiple_current_lanes_total`           | any                                                                        | Source owner + Security        | P0 fence affected source writes; deny protected effects; inspect heads/constraints; repair by authoritative receipt |
| `candidate_review_parallel_authority_total`               | any observable internal/external overlap                                   | Security                       | P0 revoke external path, freeze affected lane commands, trace every protected read/effect                           |
| `candidate_review_cross_scope_link_total`                 | any                                                                        | Security + Data Platform       | incident; deny affected scopes, preserve evidence, inspect composite keys/RLS/repair paths                          |
| `candidate_review_lane_authorization_bypass_total`        | any                                                                        | Security + Phase 12            | P0 stop command, revoke resulting context/effect, audit all privileged paths                                        |
| `candidate_review_external_after_denial_success_total`    | any protected read/effect                                                  | Security                       | P0 revoke sessions/tokens, inspect cache/context/current checks, follow incident policy                             |
| `candidate_review_old_item_revival_total`                 | any                                                                        | Phase 17 + Source owner        | end revived item, fence reconciliation/rollback path, restore immutable history                                     |
| `candidate_review_old_context_revival_total`              | any                                                                        | Security + Phase 4             | P0 make context inert, inspect widening/retry/migration, trace disclosures                                          |
| `candidate_review_command_ambiguous_total`                | any unresolved after 5 minutes                                             | Platform Operations            | reconcile semantic receipt/head; show authoritative staff state; do not retry with a new key                        |
| `candidate_review_handoff_outbox_oldest_age_seconds`      | above 300 seconds                                                          | Communications Operations      | inspect/replay delivery obligation; keep external lane; expose pending/failed truth                                 |
| `candidate_review_item_reconciliation_oldest_age_seconds` | above 300 seconds                                                          | Phase 17 Operations            | replay projection; current lane continues to gate effects; never reverse authority                                  |
| `candidate_review_route_indeterminate_rate`               | above 5% of eligible return attempts in 24 hours, minimum 20               | D21 owner + Platform           | inspect timeout/coverage/generation; preserve external lane where valid; do not treat as zero                       |
| `candidate_review_reassignment_oldest_age_hours`          | above 24 hours in pilot or agreed Tenant threshold                         | Site Product owner             | inspect D28 discoverability/authorization coverage; contact Tenant only under approved support policy               |
| `candidate_review_takeover_conflict_rate`                 | above 5% of takeover attempts in 7 days, minimum 20                        | Site Product + Source owner    | inspect stale-state UX and contention; keep CAS; improve refresh/explanation                                        |
| `candidate_review_handoff_error_rate`                     | above 1% of eligible commands in 1 hour, minimum 20                        | Platform Operations            | inspect source/database/adapter health; preserve current lane; provide safe retry                                   |
| `candidate_review_delivery_failure_rate`                  | above 5% in 24 hours, minimum 20                                           | Communications Operations      | inspect provider/domain configuration; preserve one lane; improve recovery copy                                     |
| `candidate_review_external_terminal_without_result_rate`  | baseline first cohort; alert at 3x trailing 28-day rate                    | Product + Tenant Website owner | inspect invitation fit/expiry/comprehension; do not auto-fallback or penalize reviewers                             |
| `candidate_review_privacy_projection_violation_total`     | any                                                                        | Security + Privacy             | suppress projection, preserve evidence, investigate viewers/logs/exports, follow incident policy                    |
| `candidate_review_audit_gap_total`                        | any committed head without one receipt/outbox obligation                   | Source owner + Platform        | fence further writes in scope, reconstruct only from transaction evidence, repair invariant                         |
| `candidate_review_provider_contradiction_total`           | any unresolved after reconciliation window of 15 minutes                   | Communications Operations      | reconcile monotone D25 state; provider cannot change lane; escalate adapter defect                                  |
| `candidate_review_p99_current_lane_read_ms`               | above ratified budget for 3 consecutive 5-minute windows                   | Platform                       | inspect plans/indexes/cache partitioning; do not cache favorable authority beyond current heads                     |
| `candidate_review_staff_comprehension_rate`               | below 85% correct on owner/access/Live-impact questions in moderated pilot | Product Research + Design      | revise labels/hierarchy and repeat test before cohort expansion                                                     |
| `candidate_review_task_success_rate`                      | below 90% for handoff/return recovery in moderated pilot                   | Product Research + Design      | identify friction/error states; revise and retest                                                                   |
| `candidate_review_critical_a11y_defect_total`             | any                                                                        | Accessibility + Site Product   | block rollout for affected journey; repair shared primitive/composition; rerun manual proof                         |

## Migration, rollout, upgrade, and rollback

1. Keep D27 Reserved. This report does not authorize implementation.
2. Correct the active OpenSpec's weaker latest-editor rule under D24 before
   D27 can rely on complete participant independence.
3. Land/verify D21/D22 route occurrences and Phase 17 personal attention
   semantics first, including released-zero, indeterminate, differential
   handoff, and no revival.
4. Land/verify D25 Candidate Review Authorization Context, one active external
   person, revoke-before-replace, current-context read/effect checks, and Phase 4
   identity invitation ownership.
5. Land/verify D26 current strictest-wins Tenant/Site/source ceiling and
   immediate denial behavior.
6. Add ADR-0182, glossary, OpenSpec lane contract, source-adapter interface,
   immutable heads/revisions/receipts, force-RLS policy, and outbox obligations
   behind server-side kill switches.
7. Deploy readers/enforcement that understand internal, external,
   reassignment-needed, terminal, and unknown before deploying writers.
8. Do not infer historical lane/actor/recipient from notifications, tasks,
   contacts, email, provider, CMS, or audit logs. Unknown legacy work remains
   safe and requires an explicit source-owned resolution.
9. Prove external denial and internal successor/final effect atomicity for each
   source adapter before enabling return/takeover.
10. Prove every mixed-version pairing: old code/new schema, new code/old schema,
    partial source adapters, delayed Phase 17 projection, and delayed provider
    delivery.
11. Dark-read lane derivation only against synthetic/internal data. Dark mode
    must not invite, revoke, reassign, notify, or expose candidates.
12. Pilot synthetic/internal Tenants, then a small explicit cohort including
    solo/small/multi-Site, multilingual, restricted-field, zero-route,
    low-bandwidth, mobile, keyboard, and screen-reader journeys.
13. Expand only after ACs, monitors, comprehension thresholds, privacy review,
    query plans, and operational runbooks pass.
14. Feature-off stops new handoffs. Existing external contexts remain governed
    by D25/D26/current source state and receive explicit safe recovery; nothing
    is deleted or resurrected.
15. Prefer roll-forward repair. Code rollback after lane/invitation authority
    exists is unsafe unless old readers demonstrably enforce every new state.
16. Retain body-free receipts/history under approved privacy/retention policy;
    anonymize identity through stable tombstones without changing actor/history
    cardinality.

## Required ADR, glossary, OpenSpec, and trace changes

### New ADR-0182 — source-owned single Candidate review responsibility lane

D27 merits a dedicated ADR because it makes a durable cross-domain tradeoff:
one source-owned coordination lane replaces parallel internal/external
actionability while permission stays independent. It should not be buried only
in a Phase 24 PRD.

ADR-0182 must record:

- context: D21/D22 internal attention and D25 external authority can coexist
  conceptually unless coordinated;
- decision: one closed source-owned lane with deliberate takeover;
- handoff: committed invitation creation, not provider/delivery/acceptance;
- consequences: internal items end Reassigned; route/capability/engagement stay;
- authorization: any current eligible internal actor may initiate; lane manager
  may return without review authority; no self-claim;
- safety: external denial plus admitted internal successor/final effect atomic;
- routing: current released-zero allowed, indeterminate preserves valid external;
- recovery: external terminal-without-review becomes reassignment-needed pending
  D28;
- concurrency: one source CAS and semantic idempotency;
- alternatives rejected: parallel first-wins, external lock, acceptance-timed
  handoff, and generic workflow; and
- consequences: more source coordination state and adapters in exchange for
  clear responsibility, lower duplicate work, and no favorable overlap.

### Glossary addition

Add exactly:

> **Candidate review responsibility lane** — The source-owned, tenant- and
> candidate-scoped coordination state that identifies whether one exact review
> episode currently rests with the current internal responsibility route, one
> authorized external reviewer, a reassignment-needed state, or a terminal
> source result. The lane grants no role, capability, independence, candidate
> access, or source authority and is not a task, personal attention item,
> assignee, claim, or lock.

Use the full term in normative contracts. Staff copy may say **Review
responsibility** or **Who has this review** after comprehension testing.

### OpenSpec/design trace

| Decision                         | Governing artifact                   | Later required proof                             |
| -------------------------------- | ------------------------------------ | ------------------------------------------------ |
| Source/lane/result ownership     | D27 + ADR-0182 + source specs        | source adapter contract and CAS tests            |
| Internal route and items         | D21/D22 + ADR-0027 + Phase 17        | released/zero/indeterminate and no-revival tests |
| External identity/access         | D25 + ADR-0181 + Phase 4/12          | current-context and revoke-first tests           |
| Tenant/Site availability ceiling | D26 + ADR-0181                       | strictest-wins and policy-race tests             |
| Exact independence               | D23/D24 + corrected active OpenSpec  | all-participant negative tests                   |
| Handoff delivery                 | Phase 6/outbound communications      | transactional outbox/dedupe tests                |
| Staff/reviewer UI                | D27 + platform principles/boundaries | journey, privacy, a11y, locale, mobile proof     |
| Reassignment recovery            | D28 after founder answer             | next-lane attention/authorization tests          |
| Implementation plan              | future design/tasks/tickets          | each task cites D27-R and D27-AC identifiers     |
| Release                          | future release evidence              | required checks plus production-shaped monitors  |

The decision log must link this report and the D27 primary research. Future
OpenSpec SHALL use the same four lane terms and SHALL NOT reintroduce parallel
action, route-as-permission, latest-editor independence, automatic fallback, or
old-item revival.

## Unresolved unknowns

1. Exact source capabilities for external handoff, lane return, combined
   takeover-and-complete, lane-history viewing, and governed repair.
2. Which sources can atomically combine external denial and a final internal
   review outcome versus requiring return first.
3. Exact cross-database boundary if Phase 4 invitation identity and a source
   lane cannot share one transaction; the adapter must still prove one durable
   commit contract before implementation.
4. Approved retention/anonymization periods for lane actor and reviewer
   identity.
5. Staff comprehension of **hand off**, **take over**, **return to internal
   reviewers**, **reassigned**, and **review needs reassignment**.
6. Actual handoff, delivery-failure, return, decline, expiry, conflict, and
   released-zero rates.
7. **Resolved by D30:** **Request changes** terminates the exact external review,
   requires one bounded explanation, never opens D28, and leaves any corrected
   successor as a fresh candidate requiring fresh review; the exact source
   repair command remains source-specific design work.
8. D28's exact authorized recipient resolver and choices for
   reassignment-needed.
9. Whether a non-required handoff/takeover note creates enough staff value to
   justify later addition; no evidence supports a required note.
10. Ratified latency, volume, retention, monitoring, and cohort thresholds.

Unknowns 1–4 and 7–8 block implementation design where applicable. Unknowns
5–6 and 9–10 require research/measurement; they do not justify speculative
workflow complexity.

## Ruthless synthesis

### Must be resolved before recording D27

Resolved in D27-R1–R20:

- lane is source-owned coordination, never permission or self-claim;
- handoff occurs at durable invitation creation;
- provider/acceptance lifecycle remains separate;
- D21/D22 route remains attention-only;
- any current eligible internal actor can initiate permitted takeover;
- lane managers can return without gaining review authority;
- external denial plus internal successor/final effect is atomic;
- released-zero is a valid internal lane with no personal items;
- indeterminate preserves a valid external lane;
- security/policy denial still wins independently;
- decline/expiry without review becomes reassignment-needed and follows D28's
  explicit next-lane choice, with item delivery Reserved pending D29; and
- ended items/contexts/lanes never revive.

### Must be captured before implementation

1. ADR-0182 and glossary term.
2. Corrected D24 active OpenSpec and D21–D26 dependency contracts.
3. Four-state lane schema, exclusive arcs, source adapters, commands, route
   results, receipts, outboxes, RLS, and privilege parity.
4. Complete Core UX copy/states, role-safe identity, mobile/a11y/locale behavior.
5. D28 recovery decision and D29 bounded responsibility decision.
6. D27-AC001–AC110 trace into design, tasks, tests, and release evidence.

### Implementation safeguards

1. One source CAS and semantic business idempotency.
2. Trusted server-derived scope, actor, Party, assignment, authorization,
   independence, route result, and audit attribution.
3. Composite same-scope constraints, force RLS, **USING**/**WITH CHECK**, and no
   browser authoritative writes.
4. No provider call inside authoritative transaction.
5. Current lane/context/policy/source checks on every protected read/effect.
6. Projection repair cannot change authority.
7. No inferred legacy ownership, automatic fallback, self-claim, generic tasks,
   recurring reminders, or old-state revival.

### Monitor only with named controls

Demand, terminology comprehension, handoff/takeover frequency, provider
failure, reassignment age, conflict, projection lag, performance, and
accessibility may be monitored only through the named signals, thresholds,
owners, and responses above. None authorizes automatic state changes.

### Strongest path forward, in order

1. Record the corrected D27 decision and ADR/glossary obligation.
2. Ask and resolve D28 before permitting unfinished external terminal states in
   implementation.
3. Reconcile D24 OpenSpec and dependency ownership.
4. Specify source adapter/transaction/RLS schemas and full UX state map.
5. Implement behind reader-first enforcement and kill switches.
6. Prove ACs and pairwise races at public seams.
7. Pilot with representative ministry staff and assistive/mobile/low-bandwidth
   journeys.
8. Expand only after named monitor thresholds and repair runbooks pass.

## Final disposition

**Accept with required amendments.**

Exact corrected decision to record:

> For each exact Tenant, environment, Site, source candidate, and review
> episode, Core SHALL maintain one source-owned Candidate review responsibility
> lane: internal, external, reassignment-needed, or terminal. Choosing external
> review hands off only when **Send invitation and hand off** durably creates
> the D25 invitation, advances the lane, ends current internal attention as
> Reassigned, and records delivery work in one transaction; provider,
> delivery, open, and acceptance events do not choose the lane. The lane and
> D21/D22 route grant no permission. Any currently eligible, independent
> internal actor may initiate a permitted takeover even when not routed; a
> manager with exact lane-management authority may return the review without
> gaining review authority; no action self-claims the review. Returning internal
> SHALL atomically make the external path inert and create a successor from the
> current route. A complete released-zero route creates an internal lane with
> no personal items and source discoverability; an indeterminate route preserves
> an otherwise-valid external lane. Independent security/policy denial still
> ends external access. External terminal-without-review enters
> reassignment-needed and follows D28's explicit next-lane choice, never
> automatic fallback; the notification route remains Reserved pending D29. One source CAS
> owns completion and actor attribution, and ended lanes, contexts, invitations,
> items, and engagement never revive.

## Historical next one-at-a-time Grill question — answered by D28

### D28 — What should Core do when an external reviewer declines or access expires?

#### Context and impact

D27 now gives one person/path responsibility at a time. If Eli declines or his
invitation/grant expires before he records a review, automatically notifying
internal reviewers could surprise people Maria deliberately bypassed. Doing
nothing could let required work disappear.

Delivery failure is nonterminal and retains resend/replace/return. Policy or
security loss and candidate/source terminality follow their separately fixed
current rules. D28 covers only decline or expiry for a still-current candidate
that still requires review.

The choice determines who sees the exception, whether Core silently chooses the
next lane, and how quickly staff can recover. It does not change the Live
website or Giving.

#### Hope Ministries example

Eli declines the private French-default review. Ana and Joel's old items ended
when Maria handed the review to Eli. Core now shows:

> **External review needs a next step**  
> Eli declined and no longer has access. Your live website remains unchanged.

Who should be prompted, and should Core choose the next lane automatically?

#### Option 1 — one state-driven explicit next-lane choice — recommended

Create one deduplicated in-product **Needs attention** item for only the people
currently authorized to choose the next lane. The source screen leads with
**Return to Hope Ministries reviewers** and, when D25/D26/source rules currently
allow it, also offers **Invite Eli again** or **Choose another external
reviewer**. Reading clears unread; the item remains actionable until a new lane
commits or the source episode ends. No recurring reminder or email by default.

**Tenant/staff impact:** one clear recovery step appears only after an unusual
failure. Ana and Joel are not silently re-notified, Maria can still choose the
bilingual expertise she intended, and authorized staff can see exactly what
will happen before choosing.

**Architecture impact:** reuses D19's source-driven attention and D27's
reassignment-needed state; adds no task engine, timer, automatic fallback, or
old-item revival.

#### Option 2 — automatically return to the current internal route

Immediately resolve D21/D22 and create a fresh internal lane/items.

**Tenant/staff impact:** least effort and fastest progress, but it silently
reverses the deliberate external choice, may notify people Maria intentionally
bypassed, and must still handle zero/indeterminate routes.

#### Option 3 — stay reassignment-needed with no personal item

Show the recovery only when an authorized person happens to revisit the source.

**Tenant/staff impact:** no notification noise, but the required review may be
forgotten indefinitely and staff may wrongly assume somebody else has it.

#### Recommendation

**Recommend Option 1 — one state-driven explicit next-lane choice.** It is the
smallest model that preserves deliberate human control without hiding stranded
work. It gives staff excellent clarity only when intervention is actually
needed, uses existing attention semantics, and does not automate a potentially
wrong reviewer choice.

Do you choose **Option 1**, **Option 2 — automatic internal return**, or
**Option 3 — no personal recovery item**? You may amend any option.

## Primary evidence index

- [D27 primary research](./phase-24-d27-one-visible-review-lane-primary-research.md)
- [D19 state-driven attention](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
- [D20 review-required episodes](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D21 responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [D22 co-responsible reviewers](./phase-24-d22-small-co-responsible-reviewers-adversarial-review.md)
- [D23 source-owned independence](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
- [D24 substantive participants](./phase-24-d24-every-substantive-participant-adversarial-review.md)
- [D25 candidate-scoped external reviewer](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
- [D26 bounded Tenant availability](./phase-24-d26-bounded-tenant-external-review-availability-adversarial-review.md)
- [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md)
- [ADR-0182](../../adr/0182-one-current-candidate-review-responsibility-lane.md)
- [Platform principles](../../../openspec/specs/platform-principles/spec.md)
- [Platform boundaries](../../../openspec/specs/platform-boundaries/spec.md)
- [Active SiteStacker change](../../../openspec/changes/sitestacker-parity)
