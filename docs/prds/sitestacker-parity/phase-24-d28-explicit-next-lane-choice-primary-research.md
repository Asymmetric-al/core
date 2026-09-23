# Phase 24 D28 — explicit state-driven next-lane choice primary research

Date: 2026-08-28  
Status: research evidence for the Phase 24 Grill session  
Founder answer: **One explicit, state-driven next-lane choice**  
Scope: unfinished external-lane recovery; D19–D27 authority remains fixed

Companion decision evidence:
[D28 adversarial review](./phase-24-d28-explicit-next-lane-choice-adversarial-review.md)

## Subsequent D29 reconciliation — 2026-08-28

D29 is now accepted with required amendments. The current recipient contract is
the distinct **Website review follow-up route** documented in the
[D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md)
and [D29 primary research](./phase-24-d29-explicit-website-review-coordinators-primary-research.md):
one to three unordered, co-equal same-Tenant Review coordinators, current exact
source-authorization intersection, no D21/inviter/admin/capability inference,
and no D25/source-action block when coverage is unconfigured, deliberately
no-item, configured-but-proved-zero, or indeterminate.
Statements below that say D29 is unresolved describe the pre-D29 research state
and are superseded; the implementation key remains Reserved pending proof.

## Research question

When a current D25 external reviewer declines or their invitation/context
expires without completing a still-current protected review, how should Core
make the required next choice visible without silently restoring old internal
items, broadcasting to administrators, sending reminder email, or leaving work
hidden indefinitely?

This document tests the founder's state-driven choice against current Core
authority, current repository behavior, official primary sources, comparable
nonprofit and collaboration products, security practice, and accessible staff
UX. It does not implement the feature or treat the Hope example as evidence of
customer demand.

## Executive finding

**Disposition: Accept with required amendments.**

The permanent shape is:

1. A current external lane ends without a review.
2. If the exact candidate/review obligation is still current and no successor
   lane committed with that end, the source enters **Review needs
   reassignment** and opens one semantic **choose next review lane** episode.
3. That one source episode creates one canonical Phase 6 occurrence and one
   personal ADR-0027 in-product item per exact currently authorized recipient.
   There is never one shared item or shared read state.
4. The recipient candidate set remains deliberately unresolved until D29. The
   research recommendation is an explicit Website review-coordinator route
   using D21/D22's Site-then-Tenant, all-before-any machinery and one-to-three
   bound. Whatever D29 selects must resolve responsibility for the D28 next-
   lane action—not review eligibility—and grant no permission.
5. Reading clears only that person's unread state. The item stays in **Needs
   attention** while the source condition and their authority remain current.
   Active archive/dismiss is omitted and rejected.
6. No email, recurring reminder, push, SMS, due date, escalation, or automatic
   reviewer assignment is created.
7. The destination re-proves and shows only currently lawful actions:
   **Return to internal reviewers**, **Invite again** or **Choose another
   external reviewer**, and, only under an independently authorized source-
   owned terminal command, D17's **Cancel planned change** or an equally exact
   source-specific action.
8. The phrase **Keep current version** is rejected because “current” could mean
   either the Live website or the proposed candidate, and “keep” does not say
   whether review remains pending or the change ends.

This reuses D19–D22 instead of adding a task, queue, or generic assignment
engine. A proved zero-recipient result is valid and creates no guessed item; the
source remains discoverable in its authorized Site surface. Indeterminate,
partial, or over-limit resolution creates no partial fan-out.

The behavioral answer is accepted with the amendments below, but the D28 key
stays **Reserved** until D29 records the distinct recipient-responsibility
choice. That dependency prevents review responsibility and coordination
responsibility from becoming accidentally synonymous.

## Current behavior, intended behavior, and best permanent path

### Current repository behavior

**Repository fact:** no runtime D25–D28 external-review model, lane,
reassignment occurrence, matching item contract, or schema currently exists
under `apps`, `packages`, `supabase`, or merged OpenSpec.

Current demo/static notification, Teams, task, or settings components are not
an authority model for D28.

### Accepted intended behavior before D28

- D19 defines one producer-proved actionable episode, one Phase 6 occurrence,
  personal Phase 17 items, current authorization on every read/action, personal
  engagement, source-driven end, no active archive/dismiss, and no email or
  reminders.
- D20 creates one episode whenever a real review action newly becomes required;
  repeated source changes inside the same still-open meaning do not create
  repeated items.
- D21/D22 define explicit bounded Website responsibility routes, all-before-any
  resolution, successor routing occurrences, one-to-three co-responsible people,
  and the rule that attention is not source permission.
- D25 defines one exact external reviewer, fresh candidate grants, decline and
  expiry, and no standing membership.
- D26 defines the three-state strictest-wins external-review posture and current
  policy reproof.
- D27 establishes one visible lane, handoff at committed invitation creation,
  revoke-before-internal takeover, and `reassignment_needed` when an external
  path ends without review or successor.

### Best permanent path

Register one source-owned D28 actionable meaning in the existing D19/Phase 6/
Phase 17 occurrence-item model. The source lane remains authoritative;
notifications are a recoverable private projection.

Do not create:

- a D28-specific task table;
- a shared Tenant notification row;
- a mutable `assigned_to` field;
- a reminder schedule;
- an inferred inviter/creator fallback;
- a broad all-admin/capability-holder fan-out; or
- a generic workflow/approval engine.

## Exact corrected D28 decision

### D28-R1 — exact trigger predicate

The source enters D28 only when all of these are true:

1. one exact D27 external lane was current;
2. that lane ended without a committed review result;
3. the terminal reason is a registered unfinished-review reason;
4. the exact candidate/review epoch and source review obligation remain current;
5. no internal or successor external lane committed atomically with the end;
6. the current Site/source remains privately visible to the producer; and
7. source terminality, candidate supersession, or already-completed review has
   not won.

The D28 launch reason set is closed:

- `external_reviewer_declined`;
- `external_invitation_expired`;
- `external_context_expired`.

Cancellation, replacement, policy/security revocation, source-support loss,
identity failure, and candidate/source terminality retain their separately
governed D25–D27/source behavior. D28 does not silently map those different
causes into this decline/expiry contract. A later decision may explicitly
register an equivalent recovery presentation only after proving the same
authority, privacy, and source-end semantics.

Mere delivery failure is not terminal while D25 **Send again**, **Replace
reviewer**, or **Return to internal reviewers** remains available.

### D28-R2 — exact source episode and deduplication identity

One D28 episode is identified by a server-derived semantic key over:

- stable producer namespace and action meaning
  `candidate_review.choose_next_lane@1`;
- Tenant, environment, Site;
- source candidate stable identity and immutable review epoch;
- the exact ended external-lane head/invitation generation; and
- a source-owned monotonic reassignment-episode identity.

Timestamps, provider event IDs, delivery attempts, refreshes, job runs, read
state, current authorization revisions, and recipient membership are fences or
evidence—not uniqueness partitions.

Duplicate decline/expiry/provider/reconciliation events for the same ended lane
return the same source episode and occurrence. If a fresh external successor
later ends without review, its new external-lane head creates a genuinely new
reassignment episode. Old items and engagement never reopen.

### D28-R3 — decline-versus-expiry race is deterministic

The external **Decline** command succeeds only before the authoritative server
expiry instant and against the current lane/context head. At or after expiry,
expiry is the terminal reason. A race produces one compare-and-swap winner and
one D28 episode keyed to the ended lane; the loser reads current truth and
creates no second occurrence.

### D28-R4 — one source occurrence, personal items

The source episode emits one immutable, semantically idempotent Phase 6
occurrence. The canonical Phase 6/17 compiler creates one item for each exact
`Tenant + Party + fixed recipient role + surface` recipient in the complete
released set.

Each person owns independent engagement. Core never uses:

- one shared team item;
- a recipient array with one read flag;
- a task assignee as notification authority;
- one item copied between people; or
- a Tenant-global badge.

The item uses the D19
`presentation.source_actionable_then_recent_90d@1` behavior and one reserved
fixed recipient role for **Website review next-lane responsibility**. The exact
manifest key cannot become Live until its source, facts, actions, recipient,
privacy, end, and proof contracts pass.

### D28-R5 — use explicit review-coordination responsibility; do not infer it

Until D29 is decided, D28 has no releasable recipient candidate set. The
current D21 Website-review route is evidence that Core has suitable Site/
Tenant precedence, bounded membership, and explicit fallback machinery, but it
is not a provisional D28 audience. D29 must decide whether that machinery
carries a **distinct Website review coordinator responsibility** for one-to-
three people. D28 therefore remains **Reserved**: this document must not
silently collapse “review this change” and “coordinate what happens after
review ends” into one responsibility meaning.

The D28 resolver then applies **next-lane-action qualification**, not review
qualification. A person who materially edited the candidate may be ineligible
to perform D23/D24 review but still eligible to choose the next reviewer if
they currently:

- can see the exact private candidate/reassignment context; and
- can perform at least one currently displayed D28 typed action.

This distinction is essential. D28 does not pretend a lane coordinator is an
independent reviewer.

The route's one-to-three explicit Party maximum supplies a small bounded set.
The compiler never falls back to inviter, creator, prior reviewer, last editor,
all staff, all admins, all capability holders, support, or service role.

### D28-R6 — complete, bounded, all-before-any resolution

The resolver returns exactly one of:

1. `released` — complete bounded recipient set and proof;
2. `released_zero` — every applicable route/recipient fact was completely
   evaluated and no member can perform a current D28 action; or
3. `indeterminate` — any source, route, membership, capability, visibility,
   bound, freshness, or authorization proof is incomplete.

Only a complete released set creates children. Released-zero creates an
immutable zero-member occurrence and no item. Indeterminate, partial,
limit-plus-one, corrupt, or unavailable resolution creates no partial fan-out,
records a privacy-safe repair state, and retries the same semantic occurrence.

The source remains discoverable in **Websites → [Site] → Review** or the later
authorized **Needs attention** Site filter for actors who can independently see
it. Zero items never means the review ended.

### D28-R7 — one destination, currently lawful actions

The personal item has one typed destination action:

> **Choose what happens next**

It does not put three effect buttons in a notification row. The authenticated
destination re-proves and presents the latest safe source facts and only actions
the current viewer may perform.

This avoids freezing action availability into a notification generated before
a policy, route, capability, candidate, or source change.

### D28-R8 — Return to internal reviewers

Show **Return to internal reviewers** only when the actor is currently
authorized to invoke the lane command, current source authorization completely
proves at least one eligible internal reviewer exists, and the D21/D22
notification route is completely resolved. A released D21 route may contain
one-to-three recipients or zero recipients. Released-zero does not mean no
eligible internal reviewer exists; it means the internal lane will create no
personal notification items, so the confirmation must say that authorized
reviewers can still find the work in **Site → Languages**. Proved-zero internal
eligibility or indeterminate route/eligibility proof makes the action
unavailable.

On commit, one short source transaction:

- re-proves candidate/review epoch and expected reassignment/lane head;
- re-proves the current internal route and complete qualified set;
- creates the D27 internal-lane successor;
- creates one successor D21 routing occurrence/outbox obligation;
- ends the D28 source episode; and
- records one semantic command receipt.

Phase 17 later materializes new internal review items. Old pre-external items and
engagement never revive.

### D28-R9 — Invite another external reviewer

Show **Invite another external reviewer** only when:

- D26 effective posture currently permits it;
- every applicable source currently permits D25;
- the current actor can delegate/invite;
- the exact candidate and minimum projection remain current;
- stable-human/participant/assurance proof can be completed; and
- one active external successor does not already exist.

Opening the selector does not end D28. The final D27/D25 command creates a
fresh invitation, expiry, candidate context, and external lane; then it ends
the D28 episode. The previous reviewer contact may be preselected for search
convenience but grants no authority and must still pass current identity/
independence proof.

Do not label this **Retry external review** because retry could imply revival of
the expired/declined credential.

### D28-R10 — “Keep current version” is rejected as ambiguous

**Keep current version** has at least four plausible meanings:

1. keep the current Live public website and abandon the proposed change;
2. preserve the proposed candidate as the current draft and decide later;
3. keep the ended external reviewer/lane;
4. dismiss the attention item without changing source state.

Those meanings have different lifecycle, history, public, and UX consequences.
The phrase must never be a generic D28 command.

If every applicable source owns an admitted candidate-abandon transition, D28
may expose that already governed source action separately. For the Default Site
Locale Plan, use D17's accepted label and consequence preview:

> **Cancel planned change**  
> The current English website stays live. This proposed French change will no
> longer wait for review. Prepared source work is retained or closed exactly as
> described below.

The command must state whether prepared work remains as a reusable draft,
becomes a closed/superseded candidate, or is otherwise retained by its source.
It cannot delete history or imply public rollback.

If the source does not admit abandonment, no “keep” action appears. Choosing to
decide later means closing the page; the active item remains. Archive/dismiss is
not a substitute.

### D28-R11 — policy, source, zero, and unknown action matrix

| Current fact                                                                 | Return internal                                                             | Fresh external                                                                                | Cancel/stop change             |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------ |
| Internal eligibility proved nonzero + D21 route released with 1–3 recipients | allowed for authorized actor; preview recipients                            | depends on D26/D25                                                                            | depends on source              |
| Internal eligibility proved nonzero + D21 route released-zero                | allowed with explicit **no notification** warning and source-discovery path | depends on D26/D25                                                                            | depends on source              |
| Internal eligibility proved zero                                             | unavailable; do not create an unperformable lane                            | allowed only if D26/D25 permit                                                                | depends on source              |
| Internal eligibility or D21 route indeterminate                              | unavailable; unknown is not zero                                            | optional D26 posture may allow if all D25 facts independently complete; recovery-only may not | depends on source and actor    |
| D26 `source_permitted_choice`                                                | current internal rules apply                                                | may be allowed                                                                                | unaffected except source/actor |
| D26 `recovery_only` + proved zero internal                                   | unavailable                                                                 | may be allowed                                                                                | unaffected except source/actor |
| D26 `recovery_only` + internal released                                      | may be allowed                                                              | unavailable                                                                                   | unaffected except source/actor |
| D26 `recovery_only` + internal unknown                                       | unavailable                                                                 | unavailable                                                                                   | depends on source/actor        |
| D26 `external_review_prohibited` or corrupt current policy                   | current internal rules apply                                                | unavailable                                                                                   | depends on source/actor        |
| one source forbids external                                                  | current internal rules apply                                                | unavailable                                                                                   | source-specific                |
| source/candidate terminal                                                    | D28 occurrence ends; no action                                              | no action                                                                                     | no action                      |

Optional external choice does not require a proved-zero internal route; it still
requires every D25 fact. Recovery-only requires complete proved zero.

#### Context-sensitive action order

Action order follows current lawful facts and the external terminal reason; it
is not one fixed button stack:

1. Source/candidate terminality wins and shows no next-lane action.
2. After an explicit **Decline**, never recommend or preselect the same external
   person. When a fresh D25 successor is lawful, lead with **Choose another
   external reviewer** and keep **Return to internal reviewers** secondary.
   When external review is no longer lawful, internal return becomes primary.
3. After **Expiry**, the person did not explicitly refuse. When current D25/D26
   proof permits it, lead with **Invite Eli again**, explain that it creates a
   fresh invitation and expiry, keep **Choose another external reviewer**
   secondary, and place **Return to internal reviewers** after those external
   continuations. When external review is no longer lawful, internal return
   becomes primary.
4. Under policy/source prohibition, omit every external action and lead with a
   lawful internal route or source-specific stop/repair action.
5. D17's **Cancel planned change** or another source-specific terminal action
   is separated visually as the
   terminal alternative, never the default primary solely because another lane
   is temporarily unavailable.

This ordering is presentation only. The server independently re-proves every
action at commit.

### D28-R12 — reading, unread, and active archive behavior

- Deliberately opening the item or invoking **Mark as read** changes only that
  exact recipient's engagement.
- Listing, rendering, prefetch, hydration, realtime invalidation, background
  refresh, another person's action, provider events, and source reconciliation
  never mark it read.
- Read clears only that person's unread/bell contribution. It does not claim,
  assign, resolve, approve, choose a lane, or alter siblings.
- While the source episode and recipient's action authority remain current, the
  read item stays in **Needs attention** and **All**.
- Active archive/dismiss is omitted and the API rejects it with the contract
  explanation. There is no snooze.
- When the source episode ends, active presentation ends once. An unseen ended
  item creates no unread debt or fabricated read; permitted body-safe Recent
  history follows ADR-0027/D19's fixed 90-day ceiling.

### D28-R13 — permission loss, permission gain, and route changes

Every count/list/detail/item/destination/action re-proves current Tenant,
environment, Site, Party, role, route membership, capability, source visibility,
and exact action availability.

- A recipient who loses route membership or all D28 view/action authority loses
  active and recent presentation immediately. Source/audit history remains.
- Later restoration never revives the old item or engagement.
- A D21-authorized current responsibility handoff may create a successor routing
  occurrence beneath the same D28 source episode.
- Unchanged recipients keep their item and engagement; removed recipients end;
  newly admitted qualified recipients receive new independent unread items.
- A person gaining authority outside a producer-authorized successor handoff
  does not inherit another person's item.
- Proved loss of every current recipient may invoke only D21's explicit saved
  fallback; indeterminate loss invokes no fallback.

### D28-R14 — source end is the only business end

The D28 source episode ends when one of these becomes authoritative:

- a current internal lane successor commits;
- a fresh external lane successor commits;
- a source-owned candidate-abandon command commits;
- review completes through another current-safe path;
- candidate/review epoch is canceled, superseded, or no longer requires review;
- Site/source terminality ends the episode; or
- another explicitly registered source condition makes next-lane choice no
  longer applicable.

Reading, unread changes, route display, item deletion attempt, provider status,
elapsed time, Plan age, task state, or zero recipients never ends it.

### D28-R15 — expiry denial is immediate; occurrence projection may reconcile

External expiry is enforced by authoritative server time on every protected
request. No worker timing may extend access.

An idempotent source evaluator/reconciler may materialize the D28 episode and
outbox obligation when expiry is observed. If that projection is delayed,
external access is still denied and the source remains `reassignment_needed`.
The reconciler does not send a reminder or create repeated episodes.

### D28-R16 — no recurring reminder or email

The D28 communication contract has exactly one required `in_product` step per
released recipient occurrence. It has no email, SMS, push, digest, browser/OS
notification, sound, vibration, due date, recurrence, escalation, age-derived
urgency, or provider preparation.

Creating a fresh external lane separately authorizes D25's one initial
invitation message. That message is not a D28 reminder.

### D28-R17 — privacy-minimum item and destination

The item preview should contain only facts independently safe for that exact
recipient:

- Site safe label;
- source-owned review meaning;
- **External review ended** with a safe reason such as Declined or Expired;
- **No review was completed**;
- **The current website is unchanged**; and
- one **Choose what happens next** destination.

Do not expose external reviewer email/contact, internal sibling names, candidate
body, protected reason, participant list, route health, delivery/open history,
unread state, Giving/financial facts, or exact hidden blockers in notification,
logs, analytics, support output, or metrics.

The authenticated destination may show the external reviewer's safe display
identity only when the viewer may independently see it.

### D28-R18 — no domain or product expansion

D28 creates no task, generic queue, workflow builder, claim, assignee, reviewer
pool, calendar, chat, marketplace, automatic approval, public change, Page/
Navigation editing, Giving, Legal Entity, Stripe, settlement, bank, currency,
contribution, donor, missionary, receipt, statement, ledger, accounting,
credential, member-care, or unrelated-data authority.

## Core repository fit

### Governing repository facts

1. [ADR-0025](../../adr/0025-producer-owned-protected-actions.md) keeps the
   actionable predicate and effect with the source producer.
2. [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
   requires personal item/engagement state and source-owned action/end truth.
3. D19 already defines one occurrence, personal items, exact action-capable
   recipients, all-before-any bounded resolution, personal read, no active
   archive, current authorization, and no email/reminders.
4. D20 defines semantic episodes rather than edit/timestamp notification spam.
5. D21/D22 supply explicit Site/Tenant responsibility, one-to-three people,
   successor handoff, and the separation of attention from permission.
6. D23/D24 prevent lane selection from satisfying review independence.
7. D25/D26/D27 define external terminality, current availability, one lane, and
   reassignment-needed without automatic parallel fallback.
8. Platform principles put Tenant and permission safety above convenience;
   platform boundaries require server-side protected effects and clean role
   surfaces.
9. Frontend/Base Maia rules require shared Base UI primitives, semantic tokens,
   keyboard/focus, responsive/reflow, touch, and honest loading/error/disabled
   states.

### Required terminology

Use:

- **Review needs reassignment** — source state;
- **Choose what happens next** — item destination;
- **Return to internal reviewers** — internal successor command;
- **Invite another external reviewer** — fresh D25 path; and
- D17's exact **Cancel planned change**, or an equally exact source-specific
  terminal label — optional terminal command.

Avoid:

- Keep current version;
- Retry review;
- Reopen invitation;
- Reassign notification;
- Approval task;
- Owner/claim;
- Pending email; and
- External reviewer queue.

## External primary-source evidence

### Blackbaud Award Management: unsubmitted versus submitted reassignment

Blackbaud documents reassigning unsubmitted reviews, including drafted reviews,
while completed/submitted reviews remain with their original reviewer. It also
states reviewer invitations may not be sent immediately. See
[Managing reviewers and reviewer groups](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/award-management/content/am-reviewer-groups.html).

**Supports:** unfinished work and completed attribution require different
lifecycle treatment; assignment truth cannot depend on email timing.

**Does not prove:** Blackbaud's automatic redistribution, reviewer groups,
deadlines, standing accounts, and multiple reviews are broader than Core.

### Blackbaud Grantmaking: external input may be advisory

Blackbaud Grantmaking lets organizations invite external reviewers but says
external reviewers cannot approve or decline Requests. See
[Blackbaud Grantmaking Reviews](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/grantmaking/content/reviews.html).

**Supports:** external review workflows exist in nonprofit software and need
clear boundaries.

**Does not prove:** Core must make every external review advisory. D25 leaves
the exact decision with each source.

### Microsoft Power Automate: reassignment, cancel, and response cardinality are explicit

Microsoft documents a recipient's explicit **Reassign** action, a requester's
separate **Cancel** action, and distinct first-response versus everyone-response
approval modes. See
[Power Automate approval scenarios](https://learn.microsoft.com/en-us/power-automate/approvals-howto).

**Supports:** reassignment, cancellation, and multi-recipient completion are
different product meanings and should have explicit actions.

**Does not prove:** Power Automate's generic flows, email defaults, guest
Dataverse roles, and recipient-driven arbitrary reassignment fit Core.

### Adobe Acrobat Sign: replace and alternate are deliberately different

Adobe distinguishes **Replace recipient**, which ends the original recipient's
access, from **Add Alternate Recipient**, which leaves both able to act; it
records replacement in activity/audit history. See
[Replace a recipient](https://helpx.adobe.com/sign/web/users/manage-agreements/replace-recipient.html).

**Supports:** choosing one successor is not the same as parallel fallback, and
replacement should be explicit/audited.

**Does not prove:** legal-agreement sender rules or email-address identity fit
Core's source/Party authorization model.

### Linear: single assignment and history make responsibility legible

Linear documents one assignee per issue for clear ownership, assignment history,
and inbox/view updates. It also permits **No assignee**. See
[Assign and delegate issues](https://linear.app/docs/assigning-issues).

**Supports:** an explicit unassigned/reassignment-needed state is clearer than
pretending an old assignee remains responsible.

**Does not prove:** a work-item assignee is permission or that Core should create
a generic issue/task.

### GitHub/GitLab: parallel review requires explicit modeling

GitHub exposes requesting/removing reviewers, and GitLab exposes multiple
reviewers with individual statuses. See
[GitHub review requests](https://docs.github.com/en/rest/pulls/review-requests)
and
[GitLab merge-request reviews](https://docs.gitlab.com/user/project/merge_requests/reviews/).

**Supports:** products that choose parallel review model it visibly and define
completion semantics. Core should not create parallel review as an implicit
fallback after external decline/expiry.

**Does not prove:** public/open code-review permissions, admin bypass, and
repository membership belong in Core.

### OWASP: default deny and current action authorization

The
[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
recommends least privilege, deny by default, validation on every request,
appropriate logging, and safe failure. The
[OWASP Transaction Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html)
supports operation-bound final authorization.

**Supports:** notification/item possession cannot authorize a lane effect;
every displayed action is re-proved and atomically fenced.

### W3C: predictable controls and persistent accessible status

- [On Input](https://www.w3.org/WAI/WCAG22/Understanding/on-input.html) supports
  explicit action buttons rather than auto-submitting on a selection.
- [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
  requires important async results/errors to be programmatically available.
- [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow) supports complete
  one-column operation at 320 CSS pixels.
- [Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  establishes the WCAG 2.2 target/spacing floor; Core should use its larger
  shared controls.

No official source proves demand, D28's exact recipient role, exact copy, or
whether Core Tenants prefer automatic internal return. Those remain product
judgments or unknowns.

## Alternatives pressure test

### Chosen — explicit state-driven next-lane choice

**Benefits:** visible unfinished work, no surprise reassignment, no old-item
revival, one current lane, and clear staff choice.

**Cost:** one source episode/item projection and an explicit action instead of
automatic recovery.

**Disposition:** accept with amendments.

### Strongest alternative — automatically return to current internal route

**Benefits:** least staff effort and fastest new internal attention.

**Risks:** silently reassigns work to people staff deliberately bypassed,
creates new unread items without a human choice, cannot safely handle zero or
indeterminate routes, and may conflict with a Tenant's intent to choose another
external reviewer.

**Disposition:** reject as the universal behavior. An authorized D28 actor can
return internally in one deliberate action.

### Alternative — retain the old internal items in the background

**Benefits:** no new occurrence.

**Risks:** revives stale responsibility and engagement, makes “reassigned” false,
allows deep-link action races, and violates D19/D21 immutable successor
semantics.

**Disposition:** reject.

### Alternative — notify every admin/capability holder

**Benefits:** likely someone responds.

**Risks:** privacy overexposure, alert noise, ambiguous ownership, unbounded
fan-out, and direct conflict with D19/D21 no-broad-fallback decisions.

**Disposition:** reject.

### Alternative — no item; rely on source discovery

**Benefits:** no notification model or noise.

**Risks:** the review can be forgotten and staff may think the external reviewer
still owns it.

**Disposition:** retain only as the safe proved-zero-recipient fallback, not the
ordinary experience.

### Alternative — generic Keep current version

**Benefits:** short, reassuring label.

**Risks:** cannot tell Live from candidate or delay from cancellation; different
sources would implement incompatible hidden effects.

**Disposition:** reject and replace with an exact source-owned stop-change
command or no command.

## Staff UX/UI contract

### Item before read

```text
Unread · Needs attention
hope.org · French (Canada)

Review needs reassignment
Eli's external review ended without a completed review.
The current website is unchanged.

[Choose what happens next]
```

Use Eli's name only if the recipient may independently see it. Otherwise:

```text
The external review ended without a completed review.
```

### After read

```text
Needs attention
hope.org · French (Canada)

Review needs reassignment
The external reviewer declined. No review was completed.
The current website is unchanged.

[Choose what happens next]
```

The unread badge clears only for that person. No **Archive**, **Dismiss**,
**Snooze**, or **Mark complete** control appears while actionable.

### Destination with internal and external choices

```text
Choose who reviews this change next

Eli Ramos declined the external review.
No review was completed. The current English website is still live.

Recommended after Eli declined
[Choose another external reviewer]
Each invitation covers this exact version only.

Another option
[Return to Hope Ministries reviewers]
Ana García and Joel Martin can currently review this change.

End this Plan
[Cancel planned change]
The current English website stays live. The proposed French default will stop
waiting for review. Prepared work is retained as described by the source.
```

“Recommended” is a product presentation, not an automatic action. Omit the
internal row if resolver is zero/unknown; omit external if D26/D25 disallow;
omit stop if the source has no admitted terminal command.

For a decline, the external row says **Choose another external reviewer** and
does not preselect Eli. For expiry, when current policy/source gates permit, it
may instead lead with **Invite Eli again** plus **Choose another external
reviewer**; both create a fresh D25 invitation, context, and expiry.

### Recovery-only with internal route now available

```text
Return this review to Hope Ministries

Hope Ministries allows external review only when no internal reviewer is
eligible. Ana and Joel can now review this change.

[Return to internal reviewers]
```

Do not show a disabled external picker as an invitation to bypass policy.

### Recovery-only with proved zero internal

```text
Choose another external reviewer

Core confirmed that no eligible internal reviewer is available. Hope Ministries
allows a new exact-candidate external invitation for this situation.

[Invite another external reviewer]
```

### Internal route unknown

```text
Internal reviewer availability could not be confirmed

Core cannot safely return this review to the internal route yet. This does not
mean there are no eligible reviewers.

[Try again]  [Review Website reviewers]
```

Under D26 optional posture, a separately complete D25 external path may still
appear. Under recovery-only it does not.

### No currently permitted action

```text
This review still needs a next step

No available action can be safely completed right now. Your current website and
prepared change are unchanged.

[Review Website reviewers]
```

Do not render a dead primary button. Authorized repair navigation appears only
when current visibility permits it.

### Concurrent completion

If another recipient chooses a lane first:

```text
Review responsibility already updated

Someone changed who will handle this review. No additional action is needed.
```

Show actor/target only when independently visible. The old item ends without
fabricated read or retry.

### Accessibility, Base Maia, mobile, RTL, low bandwidth

- Use PageShell/Card/Alert and shared Base UI dialog/sheet/button/link patterns
  from `@asym/ui`; no app-local primitive or alternate style.
- Use semantic tokens and Zinc-derived Base Maia presentation. Status is text,
  not color/icon/avatar alone.
- One primary action per available path, with the recommended path first in DOM
  and visual order. Do not use a dropdown that hides consequences.
- Dialogs/sheets provide visible heading/description, programmatic names,
  focus containment/restoration, Escape before commit, field errors, busy state,
  and status announcement.
- At 320 CSS pixels/400% zoom, choice cards stack in one column. No horizontal
  table is required for staff operation.
- Core touch-target tokens exceed the WCAG minimum; labels are not truncated as
  sole meaning.
- Unicode person/Site/locale names, long translations, absolute localized
  dates/time zones, CJK, and RTL wrap with logical ordering.
- The external review's source locale remains exact. Staff chrome may localize;
  machine translation never becomes source evidence.
- Slow/lost requests reconcile semantic receipt and current source/lane head
  before retry. No offline lane choice, invitation, stop-change, or review.

## Source of truth, occurrence model, and invariants

### Authority matrix

| Fact                                    | Authoritative owner                                                                              | Derived projection               | Never authoritative                            |
| --------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- | ---------------------------------------------- |
| External lane terminal reason           | D25/D27 source lane + Phase 4/context owner                                                      | D28 safe reason                  | provider email alone                           |
| Candidate/review obligation current     | consequence-owning source                                                                        | item applicability               | item, read, elapsed time                       |
| D28 episode/end                         | consequence-owning source                                                                        | occurrence/item                  | task, notification row                         |
| D28 recipient responsibility route      | unresolved until D29; recommended distinct Site/Tenant coordinator route using D21/D22 machinery | resolved recipient set after D29 | D21 review route, inviter, creator, admin role |
| Recipient current view/action authority | Phase 12 + source                                                                                | item/action availability         | route membership alone                         |
| Personal engagement                     | ADR-0027 Phase 17                                                                                | unread/read/Recent               | source choice/completion                       |
| Internal successor                      | D27 lane + D21 occurrence                                                                        | staff status/items               | old internal item set                          |
| External successor                      | fresh D25 invitation/context + D27 lane                                                          | status                           | saved contact/old grant                        |
| Candidate cancel/stop                   | source terminal command                                                                          | outcome                          | “keep” label/item archive                      |
| Review/public effect                    | source final command                                                                             | status                           | D28 occurrence/action open                     |

### Invariants

1. One ended external-lane generation creates at most one open D28 source
   episode for one candidate/review epoch.
2. Repeated events/retries do not create repeated episodes/items.
3. A later genuinely ended successor external lane creates a new episode.
4. One source occurrence fans out to personal recipient items; no shared read.
5. Only complete current members of the D29-selected explicit responsibility
   route, resolved through D21/D22 machinery and intersected with D28
   view/action authority, receive items.
6. Route responsibility and item possession grant no action authority.
7. Released-zero is valid; indeterminate is not zero.
8. Read/unread changes engagement only.
9. Active archive/dismiss is unavailable.
10. One lawful lane/stop command ends the source episode and all applicable
    active sibling items.
11. Old items/engagement never revive on permission gain or new episode.
12. Internal return uses current resolver, not the prior item set.
13. External successor is always a fresh D25 path.
14. Stop/keep wording maps to one source-owned terminal effect or is absent.
15. Source/candidate terminality wins all races.
16. D28 creates no email/reminder/public/Giving/finance effect.

## Database, RLS, authorization, and performance

### Conceptual storage

D28 should reuse:

- source candidate/review-epoch and D27 lane head;
- source-owned monotonic reassignment episode identity;
- canonical Phase 6 occurrence/routing occurrence;
- recipient-specific Phase 17 item/group/engagement;
- D21 route revisions/current heads;
- D25 invitation/context heads;
- immutable source command receipts; and
- transactional outbox/reconciliation obligations.

Do not create a Site-specific D28 notification/task table, mutable recipient
array, shared engagement row, generic JSON state machine, or copied candidate/
reviewer truth.

### Required relational safeguards

- UUID primary keys and non-null Tenant/environment/Site/candidate/review epoch.
- Composite same-scope references prevent cross-Tenant/environment/Site/
  candidate/episode/Party links.
- Unique semantic episode identity and one occurrence slot per producer meaning.
- One active personal item per exact episode/meaning/Party/role/surface.
- One current D27 lane head and one successor command receipt per semantic key.
- Restrictive delete preserves source, occurrence, actor, route, external lane,
  item, and engagement evidence.
- Indexes cover current source episode, ended external lane lookup, occurrence
  dedupe, route resolution, active personal items, Party reverse impact,
  reassignment-needed Site filters, command receipt, and outbox reconciliation.

Because the proposed D29 route reuses D21/D22's one-to-three membership bound,
ordinary D28 fan-out is small. The inherited D19 execution ceiling still fails
closed if corrupted or future contracts exceed bounds; no Tenant can configure
a larger D28 audience.

### RLS and authorization

- Enable and force RLS on source episode/occurrence/item/engagement and any
  D28-owned projection or repair relation.
- Browser roles receive no direct business-state write. Source/lane effects use
  `packages/api` commands; permitted personal engagement uses the canonical
  Phase 17 path.
- `USING` and `WITH CHECK` enforce exact Tenant/environment/Site/candidate,
  Party/role/surface, purpose, current visibility, and admitted mutation.
- An allowed engagement update cannot change recipient, source, item scope,
  action meaning, actor, or business state.
- Server commands derive Tenant, environment, Site, candidate, episode, actor,
  Active Tenant Assignment, Party, role, capability, expected heads, assurance,
  and audit attribution from trusted context.
- Caller recipient arrays, actor IDs, route results, zero/unknown status, item
  read, lane target, stop meaning, or reviewer identity never become authority.
- Direct table, collection, PostgREST, view, RPC, worker, service role, support,
  impersonation, repair, import, migration, export, and cache paths pass the same
  authorization/tenant poison matrix.
- Security-definer helpers use schema-qualified objects, fixed safe search path,
  least privilege, revoked public execution, and positive/negative proof.
- Cache keys include Tenant/environment/Site/candidate/review epoch, source
  episode, routing occurrence, Party/role, D27 lane head, policy/source/
  authorization epochs, and viewer purpose.

### Atomicity and idempotency

Decline/expiry/end processing must atomically:

1. fence the current external lane/context and candidate/review epoch;
2. commit one terminal reason;
3. make external access inert;
4. advance D27 to `reassignment_needed` when still applicable;
5. append/identify one D28 source episode and durable compiler obligation; and
6. record one semantic receipt.

Recipient fan-out is recoverable canonical compiler work. Projection delay
never restores external access or ends source need.

Each next-lane/stop command fences the same source episode and current expected
heads. One winner commits. Same-key/same-meaning retry returns the same receipt;
same key with changed lane/target/candidate/meaning rejects. No provider/network
call occurs inside authoritative transactions.

## Lifecycle and edge-case matrix

| Event                                                                          | Source episode/item result                                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| External declines before expiry                                                | one D28 episode if candidate still current/no successor                                       |
| Decline at/after expiry                                                        | expiry wins; one D28 episode                                                                  |
| Expiry observed by several workers/requests                                    | one semantic episode/occurrence                                                               |
| Delivery fails but invitation remains retryable                                | no D28; D25 recovery remains                                                                  |
| Staff replaces external in one command                                         | no D28 gap; successor external lane                                                           |
| Staff returns internal in one command                                          | no D28 gap; successor internal lane                                                           |
| Staff cancels without successor                                                | outside D28; current D25–D27/source rule governs                                              |
| Policy ends external with successor internal                                   | outside D28; no D28 assumption or gap                                                         |
| Policy ends external without successor                                         | outside D28; current policy/security recovery rule governs                                    |
| Source stops permitting external during an existing decline/expiry D28 episode | episode remains; external action becomes unavailable                                          |
| Candidate completed/canceled/superseded concurrently                           | source terminal wins; no active D28                                                           |
| Same external terminal event delivered twice                                   | one receipt/episode                                                                           |
| Fresh successor external later declines                                        | new reassignment episode, new items                                                           |
| Recipient set unchanged during D21 handoff                                     | keep item/engagement; no new unread                                                           |
| Recipient removed                                                              | active/recent item removed; history preserved                                                 |
| Recipient newly admitted by authorized handoff                                 | new personal unread item                                                                      |
| Recipient loses capability after read                                          | item disappears; read history not transferred                                                 |
| Capability later returns                                                       | old item does not revive without producer successor occurrence                                |
| One recipient reads                                                            | siblings unchanged                                                                            |
| One recipient attempts active archive                                          | API rejects; item remains actionable                                                          |
| One recipient chooses internal                                                 | source episode ends; all sibling items end                                                    |
| Two recipients choose different lanes                                          | one source CAS winner; loser sees current truth                                               |
| Internal eligibility nonzero + D21 route released-zero                         | internal return allowed with no-notification warning; external/cancel depend on current facts |
| Internal eligibility zero                                                      | no internal return; external/cancel depend on current facts                                   |
| Internal eligibility or D21 route indeterminate                                | no false zero/internal; optional external may independently proceed                           |
| D26 optional                                                                   | internal/external actions shown only when each independently passes                           |
| D26 recovery-only + internal available                                         | internal only (plus source stop)                                                              |
| D26 recovery-only + proved zero                                                | external only (plus source stop)                                                              |
| D26 prohibited/corrupt                                                         | no external action                                                                            |
| Source stop unavailable                                                        | no Keep/Stop action                                                                           |
| Stop command races new lane                                                    | one source winner; no hidden cancellation                                                     |
| Item projection delayed                                                        | source remains reassignment-needed/discoverable                                               |
| Outbox retry duplicates                                                        | one occurrence/item per semantic identity                                                     |
| Route over limit/corrupt                                                       | no partial item; repair signal                                                                |
| Site transferred/retired                                                       | access/items end; no cross-Tenant migration                                                   |
| Reviewer identity erased/tombstoned                                            | safe historical attribution per retention; no contact leak                                    |
| Low bandwidth repeats action                                                   | semantic retry returns one result                                                             |
| Stale browser shows old action                                                 | server denies/current destination reconciles                                                  |
| RTL/long names                                                                 | logical order/wrap; no meaning lost                                                           |
| Support/service role attempts effect                                           | exact governed context required; no bypass                                                    |

## Acceptance criteria

### Trigger, end, and deduplication

1. A current external decline without review/successor creates one D28 episode
   when the candidate still requires review.
2. Invitation/context expiry creates one D28 episode under the same predicate.
3. Delivery failure alone creates no D28 episode while invitation recovery is
   available.
4. Candidate completion/cancellation/supersession prevents or ends D28.
5. A successor lane committed with external end prevents a D28 gap episode.
6. Duplicate decline events return the same episode/receipt.
7. Duplicate expiry evaluators return the same episode/receipt.
8. Decline at/after expiry resolves as expiry.
9. One ended external-lane head has at most one reassignment episode.
10. A later ended successor external lane creates a new episode.
11. Timestamps/provider attempts do not partition dedupe identity.
12. Reading/item state does not partition or end source identity.

### Occurrence and personal items

13. One D28 source episode creates one canonical Phase 6 occurrence.
14. Each released recipient gets one personal item at exact Party/role/surface.
15. Two recipients never share item or engagement rows.
16. One person qualifying through several grants receives one fixed-role item.
17. Released-zero creates a zero-member occurrence and no guessed item.
18. Indeterminate/partial/over-limit resolution creates no partial children.
19. Resolver retry fills only the original semantic occurrence.
20. D28 creates no generic task/shared queue/notification table.

### Recipient responsibility and authorization

21. Recipient candidates come only from the D29-selected explicit
    responsibility route resolved through D21/D22 machinery; until D29 is
    recorded, D28 stays Reserved and the D21 review route is merely the safe
    provisional model.
22. Creator/inviter/prior reviewer/admin/capability holder is not an inferred
    fallback.
23. Route members are evaluated for D28 next-action authority, not review
    independence.
24. A substantive participant may choose a next reviewer only when separately
    authorized; this does not qualify them to review.
25. A route member lacking candidate visibility receives no item.
26. A route member lacking every current D28 action receives no item.
27. Current authorization is re-proved on every item/count/detail/destination/
    action.
28. Access loss removes active and recent presentation immediately.
29. Later access gain never revives old engagement.
30. D21-authorized successor handoff preserves unchanged recipients and creates
    items only for newly admitted recipients.
31. Proved recipient loss may use only explicit D21 fallback.
32. Indeterminate loss uses no fallback.

### Read, unread, archive, and lifecycle

33. Deliberate open/Mark read changes only that recipient's engagement.
34. List/render/prefetch/hydration/realtime never marks read.
35. One recipient reading does not affect siblings.
36. Read clears unread/bell but not Needs attention.
37. Active archive/dismiss controls are absent.
38. Active archive/dismiss API attempts reject.
39. No snooze/remind-later state exists.
40. A source-ended unseen item creates no fabricated read/unread debt.
41. Permitted Recent history ends at the fixed 90-day ceiling.
42. Old items never reopen for a later reassignment episode.

### Current lawful actions

43. Item row has one **Choose what happens next** destination.
44. Destination re-proves current source/policy/route/capability facts.
45. Return internal appears only for an authorized actor after complete proof
    of at least one eligible internal reviewer and a completely resolved D21
    route; a released-zero notification route is allowed only with an explicit
    no-notification/source-discovery warning.
46. Return internal commits a new lane/routing occurrence; old items do not
    revive.
47. Fresh external appears only when D26/D25/source/actor gates pass.
48. Fresh external always creates a new invitation/context/expiry/lane.
49. Opening/abandoning an external selector does not end D28.
50. `Keep current version` never appears.
51. A source-specific stop action appears only with a complete admitted source
    terminal contract.
52. Stop copy states Live consequence and prepared-work disposition.
53. Closing the page/reading is not interpreted as stop or decide.
54. One successful next-lane/stop command ends all active sibling items.

### Policy/source/zero/unknown

55. D26 optional permits fresh external without proved-zero internal only when
    all independent D25 facts pass.
56. D26 recovery-only permits fresh external only after complete proved zero.
57. D26 prohibited/corrupt state blocks fresh external.
58. One source external prohibition blocks fresh external.
59. A released-zero D21 notification route is not proved-zero internal action
    eligibility and may still permit a truthful internal lane.
60. Proved-zero internal eligibility and indeterminate eligibility/route proof
    are distinct; neither is treated as a released internal successor.
61. Source/candidate terminality removes all D28 actions and ends occurrence.
62. Stop/internal actions remain source/actor-specific rather than inferred from
    external policy.

### Database, RLS, concurrency, privacy

63. Tenant/environment/Site/candidate/review epoch/Party relationships are
    same-scope and server-derived.
64. Cross-Tenant/Site/candidate/Party references reject.
65. Direct browser business-state writes reject.
66. RLS `USING` prevents forbidden reads.
67. `WITH CHECK`/command validation prevents recipient/scope/actor/business-state
    mutation through engagement.
68. Service role/RPC/worker/view/support/repair/import/migration/export paths
    enforce the same invariant.
69. Two different next-lane choices produce one source CAS winner.
70. Same semantic retry returns one receipt.
71. Same idempotency key with different meaning rejects.
72. Losing commands create no duplicate lane/invite/occurrence/item/stop effect.
73. No provider/network call occurs in authoritative transactions.
74. Item/log/metric exposes no hidden candidate/reviewer/route/financial data.
75. External reviewer sees no internal D28 recipient/engagement/action detail.

### UX, accessibility, mobile, and exclusions

76. Current state says **Review needs reassignment** and **No review was
    completed**.
77. Copy says current website is unchanged without implying candidate canceled.
78. Essential meaning never relies on color/icon/avatar/hover.
79. Buttons use effect-led labels and accessible names/descriptions.
80. Keyboard/focus/dialog/status/error behavior follows shared Base UI patterns.
81. Complete journey reflows at 320 CSS pixels/400% zoom without lost function.
82. Touch targets follow Core shared controls/WCAG minimum.
83. Unicode/translated/RTL/long labels wrap in logical order.
84. Low-bandwidth retries create one source effect and reconcile current truth.
85. No recurring reminder, email, push, SMS, due date, escalation, or sound.
86. No public, Page-edit, Giving, Stripe, settlement, bank, currency,
    contribution, receipt, ledger, or accounting effect is created.
87. Decline normally recommends another currently lawful external reviewer;
    expiry normally recommends a fresh invitation to the same reviewer; internal
    return becomes primary when external continuation is not currently lawful.
88. Decline never recommends or preselects the person who declined.
89. Expiry may offer the same person again only through a visibly fresh D25
    invitation with a new expiry.
90. Source-specific stop is visually separated from next-lane choices and is
    never implied by closing/reading the item.

## Monitoring plan

Thresholds are launch hypotheses and require production baselines before
activation.

| Signal                                            | Threshold                                          | Owner                          | Required response                                                                            |
| ------------------------------------------------- | -------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| `review_next_lane_duplicate_episode_total`        | any                                                | Source owner + Phase 6         | fence writer, dedupe to authoritative episode, reconcile items without engagement rewrite    |
| `review_next_lane_duplicate_item_total`           | any                                                | Phase 17                       | remove duplicate projection, preserve one canonical engagement, inspect uniqueness/compiler  |
| `review_next_lane_partial_fanout_total`           | any                                                | Phase 6 + Security             | retract unreleased children, repair all-before-any resolver, rerun same occurrence           |
| `review_next_lane_ineligible_recipient_total`     | any                                                | Site IAM + Phase 17            | remove presentation immediately, inspect resolver/authorization epoch, preserve source truth |
| `review_next_lane_active_archive_total`           | any accepted mutation                              | Phase 17                       | restore active presentation, reject endpoint path, inspect client/API contract               |
| `review_next_lane_email_or_reminder_total`        | any                                                | Communications Governance      | stop unauthorized channel, preserve evidence, remove contract/config, assess disclosure      |
| `review_next_lane_source_item_divergence_seconds` | p95 >60 seconds or any stale effect control        | Source + Phase 17              | replay compiler/projection; source remains authoritative; fence stale controls               |
| `review_next_lane_no_recipient_active_total`      | baseline; alert if >24 hours during pilot          | Tenant Website owner + Product | inspect D21 coverage and D29 posture; do not guess recipient or auto-approve                 |
| `review_next_lane_indeterminate_age_seconds`      | p95 >5 minutes or any >1 hour                      | Site IAM + Platform            | repair dependency/bounds; keep zero distinct; source remains visible                         |
| `review_next_lane_command_conflict_rate`          | >1% over 1 hour with minimum 20                    | Site Product + Platform        | inspect stale UI/concurrency; improve reconciliation, never weaken CAS                       |
| `review_next_lane_external_reuse_total`           | any old invitation/context reused                  | Security                       | incident; revoke, inspect D25 creation/context fences and affected reads/effects             |
| `review_next_lane_hidden_identity_exposure_total` | any                                                | Security + Privacy             | incident; fence item/log/export, assess exposure, repair fact allowlist                      |
| `review_next_lane_stop_meaning_mismatch_total`    | any source effect not matching displayed stop copy | Source owner + Product         | stop source command, preserve current public head, correct contract/evidence                 |
| `review_next_lane_a11y_critical_total`            | any release-blocking automated/manual finding      | Accessibility + Site Product   | block rollout, repair shared composition, rerun keyboard/reflow proof                        |

No monitor may auto-select a lane, revive an item/grant, send a reminder,
approve, publish, or change Giving/financial truth.

## Migration and rollout

1. Land D19–D27 canonical occurrence/item, routing, authorization, invitation,
   policy, and lane foundations first.
2. Register the D28 source meaning/fact/action/end/recipient/privacy contract as
   Reserved; do not make it Live before proof packs pass.
3. Backfill no historical unread items from expired/declined invitations.
4. Existing unknown historical external ends remain source-visible repair state;
   do not infer episode, recipient, read, or lane choice.
5. Deploy schema/constraints/readers and shadow recipient resolution before
   source writer and item fan-out.
6. Prove duplicate expiry/decline, zero/indeterminate, permission churn, route
   handoff, concurrency, RLS, privacy, and mixed-version behavior.
7. Pilot synthetic/internal Tenants, then a bounded opt-in cohort.
8. Feature-off stops new D28 item publication but leaves source reassignment
   state discoverable; it never restores external/internal authority.
9. Roll forward for repair; reverting code after new episodes/items exist is not
   presumed safe without compatibility proof.
10. Validate copy/journeys with actual nonprofit Website staff on desktop,
    mobile, keyboard, screen reader, zoom, RTL, and weak networks.

## Unresolved unknowns

1. Exact Phase 12 capability identifiers for each D28 destination action and
   safe occurrence/history viewing.
2. The final executable Phase 17 message key, fixed recipient role code, and
   destination code.
3. Whether sources beyond D17 need a candidate-abandon action and what exact
   prepared-work retention semantics they own.
4. Which sources allow optional external under internal-route indeterminacy when
   D25's independent facts are otherwise complete.
5. Exact retention/anonymization of external reviewer identity in D28 history.
6. Actual rates of decline, expiry, zero-recipient, indeterminate resolution,
   lane choice, and stop-change behavior.
7. User-tested comprehension of **Review needs reassignment**, **Choose what
   happens next**, **Return to internal reviewers**, and source-specific stop
   labels.
8. Whether one-to-three explicit Website review coordinators should carry D28
   follow-up responsibility through D21/D22 route machinery without gaining
   review or source authority.
9. D29's recipient-responsibility decision, including zero-qualified and
   unconfigured-route behavior. D28 remains Reserved until it is recorded.
10. Production baselines needed to ratify monitor thresholds.

## Ruthless synthesis

### Must be amended before D28 is recorded

- Define the complete still-current trigger and source-end predicate.
- Deduplicate by external-lane generation and monotonic reassignment episode,
  not timestamps/events.
- Preserve one occurrence with personal items and personal engagement.
- Keep the D28 recipient key Reserved until D29 chooses responsibility; reuse
  D21/D22 machinery only if that distinct responsibility is accepted.
- Keep zero and indeterminate distinct.
- Omit active archive/dismiss and every reminder/email channel.
- Re-prove internal/external/stop actions at destination and command.
- Reject generic **Keep current version**.
- Preserve source terminality, one CAS, fresh D25 external successors, and old-
  item non-revival.

### Must be captured in spec/design

- source episode/occurrence identity and reason set;
- recipient resolver, bounds, handoff, permission-churn behavior;
- exact item/destination/fact/action/end contract;
- Base Maia ordinary/zero/unknown/stale/concurrent journeys;
- source-specific stop semantics;
- 90 acceptance outcomes and monitors; and
- migration/mixed-version proof.

### Implementation safeguards

- one source writer and canonical Phase 6/17 compiler;
- no direct browser business-state write;
- force RLS plus operation-correct `USING`/`WITH CHECK`;
- server-derived scope/actor/recipient/action;
- expected-head CAS and semantic idempotency;
- no provider call in authoritative transactions;
- source truth outranks item projection; and
- no generic task/queue/policy engine.

### Monitor, do not assume

- customer demand and preferred recovery;
- zero-recipient and reassignment age;
- decline/expiry and action-selection rates;
- copy comprehension and abandonment;
- projection/reconciliation health; and
- accessibility/mobile outcomes.

## Recommended next one-at-a-time Grill question

### D29 — Who should be explicitly responsible for next-lane coordination?

#### Why this needs a founder decision

D21 answers **who is responsible for reviewing a protected change**. D28 needs
someone to coordinate **what happens after an external review declines or
expires**. Those are related jobs, but not the same job: a coordinator may be
allowed to invite a replacement or stop a proposal without being allowed to
approve it. Guessing from the original inviter or a broad role is convenient
but creates hidden, unstable responsibility. D29 must choose the bounded source
of recipient responsibility before D28 can leave Reserved.

#### Hope Ministries example

Maria sent Eli's external invitation. Eli declines. Jonah can review Website
changes, while Maria normally coordinates outside reviewers and follow-up. If
the product treats “reviewer” and “coordinator” as the same responsibility,
Jonah receives a confusing item he may not own. If it falls back to the
inviter, Maria becomes responsible by accident. Which people should Hope name
for this distinct follow-up job?

#### Option 1 — name one-to-three Website review coordinators — recommended

Reuse the already governed D21/D22 Site-then-Tenant route machinery, but give it
a distinct responsibility meaning and label: **Website review coordinators**.
An authorized manager names one, two, or three people once; Core intersects
that bounded list with current D28 visibility and exact next-action authority
whenever an episode is routed. Coordinator responsibility grants no review,
approval, Site, Page, Communications, Giving, or invitation permission.

The settings summary says exactly what this does: **These people decide what
happens next when an external Website review ends without a decision.** At
external handoff, Core shows **Follow-up coverage: Maria and Jonah**. If the
applicable route proves zero qualified recipients, Core creates no guessed
item, keeps **Review needs reassignment** visible at the source, and gives an
authorized manager one repair action: **Set review coordinators**. Unknown or
partial proof never widens the audience.

**Impact:** staff know why they received the item, small Tenants can name one
person, larger Tenants can share coverage without broadcasting private work,
and the product stays flexible through Site override plus Tenant default. The
cost is one clearly explained setting, but it reuses proven route, handoff,
authorization, audit, and zero-recipient behavior instead of adding a generic
task system.

#### Option 2 — notify every exact capability holder

At the moment the episode opens, notify every current staff member who can see
the source and perform at least one displayed D28 next-lane action, subject to
the existing hard execution bound.

**Impact:** no setup and broad coverage, but “can act” is not the same as “owns
follow-up.” Recipient counts and privacy exposure change whenever permissions
change, staff can assume someone else will act, and the model repeats the broad
capability-holder pattern D21 rejected.

#### Option 3 — original inviter, then managers

Send the item to the original internal inviter if still currently qualified. If
not, fall back to a bounded set of current Website managers with an exact D28
action.

**Impact:** this often feels intuitive for the first decline, but responsibility
is hidden in historical authorship. It breaks when the inviter leaves, loses
access, invited on someone else's behalf, is unavailable, or should not see the
current candidate. Manager fallback is broad and makes permission look like
ownership. Staff cannot inspect or deliberately change the assignment before a
failure.

#### Recommendation

**Recommend Option 1 — name one-to-three Website review coordinators through
D21/D22 route machinery.** It makes a different job explicit without creating a
different routing engine. It is bounded but not inflexible: a Tenant default
covers ordinary Sites, a Site override handles a genuinely different team, one
person is valid for a solo ministry, and up to three gives practical shared
coverage. Core still re-proves authorization at delivery and action time, so
the setting expresses responsibility rather than granting power. Options 2 and
3 save one setup step but turn incidental capability or historical authorship
into hidden ownership, which is weaker UX and a larger privacy/operations risk.

**Deferred follow-up:** the content and delivery of **Request changes** feedback
is intentionally not part of D29. Ask it only after recipient responsibility is
settled; otherwise two independent decisions would be conflated.
