# Phase 24 D22 — co-responsible Website reviewers primary research

Date: 2026-08-28  
Research question: When one D21 Website-review responsibility route names
several people, should any one currently authorized person be able to complete
the existing D20 source review, and what route default, product bound, staff
experience, safeguards, and proof would make that safe and understandable?

This appendix is research evidence, not a runtime, schema, OpenSpec, ADR, or
ticket change. It distinguishes current repository facts, verified external
facts, product judgments, assumptions, and unresolved evidence gaps.

## Executive conclusion

**D22 Option 2 is the strongest v1 behavior, with required clarifications.** A
Website-review route should normally contain **one deliberately selected
person** and may contain a **small co-responsible set**. Every selected person
who is currently authorized for the exact Site, Plan, and review action gets a
private personal item. **Any one** of those people may perform the existing
source-owned review action. The first valid source transition wins; it ends the
applicable sibling items without claiming that the other people reviewed.

This is not a shared task, claim queue, vote, quorum, delegation ladder, group
identity, or permission grant. “Co-responsible” is specification language; the
staff UI should simply say **Website reviewers** and explain the consequence:

> Choose the people who share responsibility for Website reviews. Each person
> receives their own private item. Any one of them can complete a review.

### Recommended v1 shape

- **Default cardinality:** one person, deliberately chosen. Core never
  auto-selects an identity.
- **Recommended v1 hard maximum:** three distinct Parties per route revision.
- **Completion:** one current, authorized source action is sufficient.
- **Ordering:** none. The set has no primary, backup, rank, or drag order.
- **Groups:** not selectable. Routes contain explicit people, not dynamic teams
  or “everyone with permission.”
- **Channel:** the existing in-product D20 item only; no email or reminder by
  default.
- **Current-review changes:** prospective by default; D21's explicit,
  impact-previewed current-review handoff remains the only way to change an
  open episode's responsible people.

The number **three is not an externally proven universal optimum**. It is the
smallest defensible Core v1 product boundary that admits ordinary one-person
ownership, two-person coverage, and one additional language/region/operational
coverage person while structurally preventing a broad-team broadcast. It must
be code-owned, versioned, enforced on the server and at the persistence release
boundary, and tested with representative ministry staff before Live. It must
not be a Tenant-configurable ceiling and must never be confused with Phase
17's 50-recipient execution-safety bound.

## Why Option 2 fits Core

### Verified repository facts

1. D20 owns one source review episode; notification presentation and personal
   engagement do not own or complete it. [D20](./phase-24-d20-every-review-required-episode-adversarial-review.md)
2. D21 owns a closed, explicit Tenant/Site responsibility route; responsibility
   never grants authorization and current authorization never implies
   responsibility. A partially qualified primary route wins without widening
   to fallback. [D21](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
3. D21 already defines prospective route saves, explicit current-review
   handoff, unchanged-recipient preservation, removed-recipient presentation
   end, newly admitted successor occurrences, and no hidden fallback.
   [D21](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
4. ADR-0027 requires exact Tenant+Party+role+surface personal presentation,
   separates source state from engagement, keeps actionable work in **Needs
   attention** after read, and ends presentation from source truth rather than
   read state. [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
5. Phase 17's staff resolver ceiling of 50 and compiler ceiling of 200 are
   execution-safety bounds, not UX targets. A complete occurrence releases
   all-before-any and never silently truncates. [Phase 17 executable manifest](./phase-17-system-message-executable-manifest.md)
6. Core's repository UI rules require Base Maia, shared `@asym/ui`, Zinc
   tokens, native semantics or approved Base UI primitives, text rather than
   color-only state, 44-by-44 CSS-pixel targets, mobile parity, visible focus,
   and assistive-technology proof. [Frontend rules](../../ai/rules/frontend.md)
7. Server-owned business writes cross `packages/api`; tenant scope, RLS,
   grants, and trusted actor derivation remain mandatory. [Backend rules](../../ai/rules/backend.md)

**Consequence:** Option 2 can reuse the one source review plus recipient-
specific Phase 17 projection. Option 4 would create an all-person quorum that
does not exist. Option 3 would create ordered handoff/availability state that
does not exist. Option 1 is simpler but unnecessarily strands ordinary human
coverage when one named person is absent yet still authorized.

## What current primary sources establish

### One-of and all-of are different product meanings

- HubSpot Content Hub lets staff select multiple approvers and explicitly
  choose **All approvers** or **Just one approver**. It keeps approval
  permissions separate from the person-selection interaction, supports
  reassignment, and exposes approval on desktop and mobile. This proves that
  one-of is a recognizable CMS workflow, not that HubSpot's complete model or
  copy should be copied into Core. [HubSpot — Approve content](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- Microsoft Power Automate separately defines **Everyone must approve**,
  **First to respond**, wait-for-all custom responses, wait-for-one custom
  responses, and sequential approval. In its first-response mode, one
  approver's response completes the request. This verifies that “one response
  completes” is a distinct, explicit contract and that sequential/all-of
  behavior is additional workflow complexity. [Microsoft — Get started with approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals)
- Salesforce documents that a group/queue work item completes when its first
  member acts, while unanimous approval creates individual child work items.
  It also documents a simultaneous-action loser receiving an error. This is
  evidence that concurrency is real and that Core needs a humane current-state
  result for the losing reviewer; it is not a reason to import Salesforce's
  group work item. [Salesforce — Approval work items](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_concepts_work_items.htm&language=en_US&type=5)
- Atlassian Jira Service Management asks administrators to choose how many of
  the named approvers must approve. That reinforces the need to state the
  threshold explicitly rather than leave staff to infer it. [Atlassian — Add an approval step](https://support.atlassian.com/jira-service-management-cloud/docs/add-an-approval-to-a-request-type-in-team-managed-projects/)
- Blackbaud Financial Edge NXT permits **all**, **only one**, or a defined
  number of approvers and defaults its Payment Assistant to one approval. It
  separately requires approver permissions. This is useful nonprofit-product
  evidence that one-of and permission separation are familiar; payment
  controls, tiers, and separation-of-duties policy are finance-specific and
  must not be imported into Site identity or D20. [Blackbaud — Approval tiers](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)

**Finding:** “Any one may complete” is a modern, well-established workflow
meaning. It is not equivalent to “everyone reviewed,” and the UI must never
use language that implies consensus or collective approval.

### Broad-team notification has a documented noise cost

GitHub's official team-review settings say their purpose is to reduce
notification noise and clarify individual responsibility. GitHub replaces a
team review request with a configured subset of individuals and lets an owner
choose how many people are assigned. This directly supports Core's use of a
small explicit set instead of notifying every capable person. GitHub's
round-robin, load-balancing, and Busy-status behavior is not applicable: Core
has already rejected inferred availability and automatic reviewer selection.
[GitHub — Managing code-review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)

Contentful documents the opposite footgun clearly: a team task emails every
team member, and its API does not ensure the assignee can read the entry. An
assignee without access cannot resolve the task. Core must not copy either
behavior; D21's exact current authorization intersection and D22's finite
explicit people set are permanent safeguards. [Contentful — Entry tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)

### Group size creates a real but non-deterministic accountability risk

A controlled laboratory study of groups of different sizes found that
perceived responsibility decreased as group size increased and varied with
role assignment. The authors explicitly warn that the temporary laboratory
task and measurement method limit generalization to real working groups. This
is directional evidence for keeping the set small and making the action rule
explicit; it does **not** prove that two, three, or any other exact number is
optimal for nonprofit Website review. [Forsyth, Zyzniewski, and Giammanco — Responsibility Diffusion in Cooperative Collectives](https://facultystaff.richmond.edu/~dforsyth/pubs/forsythzyzniewskigiammanco2002.pdf)

### Accessibility constrains the picker, not the business threshold

- WAI's listbox guidance warns that listbox option names are flattened for
  assistive technology and that listboxes cannot accessibly contain
  interactive elements such as buttons or checkboxes inside each option. It
  also warns against long, repetitive option names. Core should use its tested
  searchable combobox/listbox primitive for choosing one person at a time,
  then render selected people as ordinary semantic rows with separate remove
  buttons—never an improvised rich multi-select option. [WAI-ARIA APG — Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- WAI's combobox pattern supports an editable input whose popup filters a
  predefined set and preserves prior input when dismissed. This fits a
  server-filtered people search. [WAI-ARIA APG — Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- WCAG 2.2 requires text labels/instructions and text error identification;
  status changes must be programmatically exposed; content must reflow without
  lost function at 320 CSS pixels; and AA target-size minimum is 24 CSS pixels.
  Core's repository-specific 44-pixel target is intentionally stronger.
  [WCAG 2.2](https://www.w3.org/TR/WCAG22/), [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html), [Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html), [Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

**Finding:** accessibility supports a compact add-one-person-at-a-time journey
and explicit selected rows. It supplies no evidence for an exact reviewer cap.

## Evidence limits

The reviewed official products establish that all-of, one-of, and sequential
approval are separate contracts; several show multiple individual approvers;
GitHub explicitly recognizes broad notification noise; and W3C specifies how
the interaction must remain operable. None of the reviewed primary sources:

- identifies an empirically validated universal maximum for Website reviewers;
- studies nonprofit ministry Website-review routes specifically;
- proves that multiple notified people act faster than one accountable person;
- proves that three is better than two or four;
- proves that co-reviewer names may always be disclosed to one another;
- justifies automatic absence, calendars, reminders, escalation, or email; or
- overrides Core's ADRs, tenant boundary, or source-owned review semantics.

The exact maximum is therefore a product risk boundary, not an imported “best
practice.” Calling three an industry standard would be false.

## Cap/default recommendation and rationale

### Verified facts versus product judgment

| Statement                                                                      | Classification                                          | Confidence                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------- |
| One-of and all-of are established distinct workflow meanings                   | Verified external fact                                  | High                                    |
| Broad team notifications can create noise and weaken individual responsibility | Verified product concern; directional original research | High for concern, not magnitude in Core |
| Core must use personal Party+role items and one source truth                   | Governing repository fact                               | High                                    |
| The route should begin with one deliberate person                              | Product judgment consistent with evidence and D21       | High                                    |
| V1 should allow up to three explicit people                                    | Product safety judgment; not externally proven          | Medium pending ministry validation      |
| Tenants should be able to raise the limit                                      | Rejected product choice                                 | High                                    |

### Why one by default

“Default one” does not mean Core chooses Maria automatically. It means the
normal interaction asks the manager to choose one person and does not pressure
them to fill additional slots. **Add another reviewer** is a secondary action
with a short explanation of when shared coverage is useful.

This preserves clear ownership for a small ministry and minimizes notification
volume. A second or third person is an intentional coverage choice, not a setup
completion meter, required field, recommendation carousel, or “invite your
team” growth prompt.

### Why recommend maximum three for v1

Three supports:

1. one normal accountable reviewer;
2. a second person for real coverage; and
3. one additional person where language, geography, or field conditions make
   that deliberate coverage useful.

It also keeps every name, current status, and remove action visible without
collapsed “+N” overflow; prevents “select all” behavior structurally; bounds
per-episode personal items at three; and leaves a large safety margin below
Phase 17's 50-person execution ceiling. Four or five might be valid for a real
ministry, but no evidence gathered here proves that need. An unbounded set
would contradict D21's purpose and GitHub's explicit noise lesson.

The bound should be a versioned code-owned contract such as
`site_default_locale_plan_review_route_max_recipients@1 = 3`. The exact final
identifier belongs to the later manifest/design. A route revision must record
an expected member count and may become the current head only after the server
and database release boundary prove one to three unique same-scope Parties.
Frontend prevention alone is not sufficient. A fourth member must reject the
whole save with no truncation and no fallback.

### What would falsify the recommendation

The cap should be changed through a reviewed contract version—not Tenant
configuration—if representative research or production evidence shows a
recurring legitimate need for more than three without broad-notification
behavior. Evidence should include the exact ministry workflow, why three
explicit people cannot cover it, authorization/privacy implications, expected
episode volume, and comprehension/noise testing. “Our team has many admins” is
not evidence because authorization and responsibility are separate.

## Best staff journey and interface contract

### Journey 1 — first setup: one reviewer is the happy path

At **Settings → Websites → Review notifications**:

```text
Website reviewers

Choose who normally handles final Website reviews.

Reviewer
[ Search people… ]

This sends private review attention. It does not give anyone access or
permission. Core checks access for every review.

[Save reviewers]
```

After Maria is selected:

```text
Website reviewers

Maria Santos
Can currently receive Website reviews
[Remove Maria Santos]

[Add another reviewer]

One reviewer is usually clearest. Add another only when people genuinely share
this responsibility.

[Save reviewers]
```

The interface does not show three empty slots, “1 of 3 complete,” celebratory
progress, an avatar wall, or a recommendation to add more. Those patterns
would make the maximum look like a target.

### Journey 2 — deliberate shared coverage

Selecting **Add another reviewer** reveals the same tested person-search
control. After Maria and Ana are selected:

```text
Website reviewers

Maria Santos       Can currently receive Website reviews
Ana García         Can currently receive Website reviews

Any one of these 2 reviewers can complete a review. Each person receives their
own private Needs attention item.

[Add another reviewer]   [Save reviewers]
```

At three people:

```text
Any one of these 3 reviewers can complete a review.

Maximum 3 reviewers. Keeping this group small makes responsibility clear and
limits unnecessary notifications.
```

The add control is omitted at the limit; the explanation remains visible. A
crafted fourth-person request receives the same textual error from the server.

### Journey 3 — current qualification is not permission editing

If a selected person cannot currently act for some or all affected Sites, the
selected row uses text, not color:

```text
Joel Martin
Cannot currently receive reviews for 2 of 18 Sites

Choosing Joel does not give him access. Update Website permissions separately,
or choose another reviewer.
```

The exact Site list and names appear only if the current manager may enumerate
them. Otherwise the summary is privacy-safe. The route may preserve Joel as
responsibility intent under D21, but he receives nothing where current exact
authorization fails. One qualified member keeps the Site route primary; Core
does not join fallback reviewers merely because another selected member is
unqualified.

### Journey 4 — save confirmation is prospective and specific

```text
Website reviewers saved

Maria Santos and Ana García will receive future review items when they are
allowed to review the Site. Existing reviews keep their current reviewers.

2 reviews are already waiting.
[Review current assignments]
```

This separates the durable route save from the optional D21 current-review
handoff. It avoids a surprise reassignment and avoids turning an ordinary
settings save into a multi-step wizard.

### Journey 5 — explicit handoff of current reviews

The D21 impact preview should incorporate D22's set semantics:

```text
Use these reviewers for 2 current reviews?

Newly notified
Ana García

No longer receives the review item
Maria Santos

Unchanged — no new notification
Joel Martin

Any one of the current reviewers can complete each review. This changes review
notifications only; it does not change permissions or who can review from
Languages.

[Update 2 current reviews]  [Keep current assignments]
```

Removing Maria from responsibility does not revoke her independent permission.
If she remains authorized, she can still navigate to **Site → Languages** and
perform the review; she simply no longer receives that private item. The UI
must say this because “reviewers” can otherwise sound like an exclusive access
list.

### Journey 6 — recipient experience

Maria's item remains the D20 card:

```text
Ready to review
hope.org · French (Canada)

French (Canada) became ready for final review.
This Plan does not change the website automatically.

[Review planned change]
```

The destination, not every compact card, adds the completion explanation:

```text
Website review

You and 1 other current reviewer can complete this review. Core needs one
review, not one from each person.

Sent to you through: Tenant Website reviewers
```

If Maria is independently allowed to enumerate the route, **1 other current
reviewer** may expand to the current names. Route membership alone does not
grant permission to see co-reviewer identities. With three, copy says **Any one
of the 3 current reviewers**; it never says **Either**.

Opening Maria's item clears only Maria's unread state. It does not claim the
review, hide Ana's item, change Ana's unread state, or imply Maria will act.
Core should not add “I'm reviewing this,” presence, locks, timers, or an
availability status in D22; those create new truth and failure modes.

### Journey 7 — one person completes while another is viewing

If Ana completes the source review first, Maria's open page receives or
discovers a polite, non-focus-stealing current-state update:

```text
Review complete

Ana García completed this review. No action is needed.
```

Show the actor only when Maria is authorized to see that attribution;
otherwise show **This review is complete**. A stale submit re-proves source
state. It creates no second review, no duplicate audit event, and no alarming
generic failure. If Maria entered unsaved text, Core must not silently discard
it; the later design must either preserve recoverable local text or prove that
the source command has no such draft.

### Journey 8 — no qualified recipient

D21 remains authoritative:

```text
Review notifications need setup

No selected reviewer can currently receive this Site's review notifications.
Authorized staff can still review the Plan in Languages.

[Set up reviewers]
```

No email, recurring reminder, support ticket, guessed admin, or public notice
is created.

## Interaction details required for excellent UX

### People picker

- Use Core's tested Base UI/searchable combobox primitive to add **one person
  at a time**; selected people render as semantic rows outside the listbox.
- Search is server-filtered, tenant-scoped, paginated, and debounced/cancelable;
  the page never downloads every Tenant person to the browser.
- Results include the Unicode display name and only an independently authorized
  secondary disambiguator when duplicate names require it. Avatar, flag, job
  title, color, or route membership is never the qualification signal.
- Already selected Parties are marked **Already selected** and cannot be added
  twice. Several Tenant assignments or grants for one Party still produce one
  route member and one fixed recipient-role item.
- There is no **Select all**, team/group selection, CSV import, paste-list,
  drag ordering, primary star, or backup rank.
- Each selected row has a 44-by-44 remove button with an accessible name such
  as **Remove Ana García**. Removing a row moves focus predictably to the next
  row, previous row, or add control.
- Search-result count, no results, selection, removal, limit reached, save
  success, and errors are programmatic status messages. Save errors are also
  persistent text associated with the affected control.

### Responsive and low-bandwidth behavior

- At 320 CSS pixels and 400% zoom, selected rows stack into one column; names,
  qualification text, and remove controls remain available without horizontal
  scrolling or hidden overflow.
- Long names, CJK, combining marks, bidirectional text, and tenant-localized
  UI strings wrap; identity keys never derive from display text.
- Avatars and decorative imagery are optional and should be omitted from this
  administrative path. Summary and selected rows render before optional fresh
  impact details.
- Losing the network preserves unsaved local selections in the current form and
  says **You're offline. Changes haven't been saved.** It does not optimistically
  claim a route change or use cached authorization to notify anyone.
- Lost save responses use D21's idempotent command receipt. The UI distinguishes
  **Reviewers saved; current-review updates still processing** from a failed
  prospective save.

### Language and terminology

Use:

- **Website reviewers**
- **Any one of these reviewers can complete a review**
- **Each person receives their own private Needs attention item**
- **This does not give access or permission**
- **Existing reviews keep their current reviewers**
- **Unchanged — no new notification**

Avoid:

- **approver group**, **approval team**, **quorum**, **first responder**,
  **assignees**, **owners**, or **queue**;
- **everyone approved** or **the team reviewed** after one person acts;
- **backup** or an ordered list;
- **active/inactive** when the fact is current exact authorization;
- **notify all**, **select all**, or an unexplained `1/3`; and
- “Either reviewer” when the set may contain three.

## Required domain invariants

1. A configured route contains one to the exact code-owned maximum of unique
   same-Tenant, same-environment Parties; no released partial or overflow set
   exists.
2. The absence of a route is an explicit no-route state, not an empty released
   member revision mistaken for a crash.
3. Membership order has no meaning. Display sorting changes no revision,
   routing occurrence, item, or audit.
4. Responsibility grants no authorization. Authorization alone grants no
   responsibility or item.
5. One current routing leg uses only its winning D21 route. Primary and fallback
   members are never unioned.
6. Only selected members who pass the exact current source-view and action
   capability conjunction receive an item.
7. Each qualified Party receives one personal item for the source episode and
   routing meaning, regardless of duplicate grants or assignments.
8. Read/unread remains personal. One recipient's engagement changes no other
   recipient's item or source state.
9. One valid source transition ends all applicable sibling items. It attributes
   action only to the actual source actor.
10. Concurrent valid commands use the source's expected fence: one wins; an
    exact retry returns its receipt; a loser observes the current outcome and
    cannot create a duplicate effect.
11. Prospective route saves do not change open episodes. An explicit D21
    current-review handoff admits only the newly selected delta, keeps unchanged
    item/engagement, and ends removed responsibility without revoking permission.
12. A later D20 review-required episode resolves the then-current route and
    creates new personal items; it never revives prior engagement.
13. The route maximum is a product bound. The Phase 17 50-recipient and
    200-member ceilings remain independent execution bounds.
14. No route, recipient, item, actor, or audit crosses Tenant, environment,
    Site, Plan, role, or privacy scope.
15. D22 changes no public Site, Page, Navigation, locale URL, Giving, donor,
    Stripe, Legal Entity, settlement, bank, currency, or accounting fact.

## Edge-case and failure map

| Scenario                                                   | Required result                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| one selected and qualified                                 | one personal item; singular copy                                            |
| two or three selected and qualified                        | each gets one personal item; any one source action may complete             |
| duplicate Party selected through another assignment        | one member; picker says Already selected                                    |
| fourth Party added                                         | entire save rejects; no truncation, partial revision, or fallback           |
| group/team chosen                                          | unsupported; explicit people only                                           |
| two selected, one unqualified                              | qualified person alone receives; primary route still wins                   |
| all selected unqualified                                   | D21 proved-zero fallback/no-route behavior                                  |
| qualification indeterminate                                | no partial release or fallback widening                                     |
| same Party appears in Site and Tenant routes               | winning route only; one item                                                |
| display order changes                                      | no semantic change or handoff                                               |
| route manager removes a recipient prospectively            | future episodes only; open review unchanged                                 |
| explicit handoff retains one and adds one                  | retained person keeps engagement; new person gets one unread successor item |
| explicit handoff removes still-authorized person           | item ends as Reassigned; person may still review through Languages          |
| recipient loses access                                     | active/recent presentation removed immediately; audit retained              |
| recipient later regains access                             | no old item revival; current leg stays stable under D21                     |
| two recipients open review together                        | both may view if currently authorized; no claim state                       |
| two recipients submit concurrently                         | one source CAS wins; loser sees truthful completion, no duplicate           |
| winning response lost                                      | exact idempotency retry returns same source outcome                         |
| source completes before successor handoff release          | no active unread successor debt                                             |
| source completes just after successor release              | successor immediately ends without fabricated read                          |
| reviewer reads then another completes                      | first read remains personal history; source completion ends actionability   |
| source requests changes and later becomes reviewable again | new D20 episode and new items; no revival                                   |
| Site/Tenant clone, import, transfer                        | no copied named reviewers or engagement; D21 destination rules apply        |
| duplicate/international names                              | authorized disambiguator; stable Party key; Unicode preserved               |
| manager loses route permission while editing               | save rejects atomically; no partial change                                  |
| stale manager tab overwrites newer route                   | expected revision CAS rejects and shows fresh diff                          |
| offline/lost save response                                 | no optimistic authority; preserve form; idempotent receipt on retry         |
| recipient cannot enumerate co-reviewers                    | show count/generic wording, not names                                       |
| Site retirement during review                              | source lifecycle ends applicability; no new routing                         |

## Implementation implications that research makes mandatory

These are safeguards, not a proposed generic workflow engine:

- Keep D21's immutable route revision and member rows; do not put a mutable
  Party array in a Site JSON blob.
- The released revision records expected member count and canonical member-set
  digest. A server command and database release invariant prove the exact count,
  uniqueness, and same-scope membership before the current head can point to it.
- Because ordinary SQL `CHECK` constraints cannot count sibling rows, the later
  design must use a narrowly scoped deferred constraint/release mechanism or an
  equivalent transactionally proved immutable-set boundary. Relying only on
  frontend validation is insufficient.
- Browser roles receive no direct route/member/item writes. `packages/api`
  derives Tenant, environment, actor, source, route revision, recipient role,
  and authorization proof from trusted context.
- RLS `USING` and `WITH CHECK`, grants, functions, RPCs, views, realtime,
  service-role paths, support paths, and workers must preserve the same scope.
  A member update cannot move a permitted row into another Tenant/Site/route.
- Index current route head, route-revision members, reverse Party impact,
  active D20 source dependency, and successor occurrence reconciliation. The
  picker uses bounded keyset search, not an unindexed `ILIKE '%…%'` full scan.
- The route-save/current-handoff/source-review commands use durable client
  command IDs, expected revision/source fences, short transactions, and a
  documented lock order. No network or broad authorization enumeration occurs
  while holding database locks.
- Recipient compilation remains all-before-any. Exactly-at-D22-limit may
  release; limit-plus-one produces no child items and never falls back as if it
  were zero.

## Proof gates before Live

### Product and usability proof

1. Run moderated task-based research with at least eight representative staff:
   small single-Site ministry, multi-Site ministry, multilingual responsibility,
   mobile/low-bandwidth user, keyboard-only user, and screen-reader user must be
   represented. This is a product test cohort, not a claim of statistical
   population confidence.
2. Every participant must correctly answer these critical questions after
   configuring one and multiple reviewers:
   - Who receives an item?
   - Does everyone need to review, or only one?
   - Does adding a reviewer grant access?
   - Do existing reviews change automatically?
   - Can a removed but still-authorized person review from Languages?
3. Any participant believing that everyone must act, that the route grants
   permission, that three is required, or that route removal revokes access is
   a release-blocking comprehension failure until copy/interaction is corrected
   and the affected task is retested.
4. Test one-, two-, and three-person setup, removal, duplicate names,
   unqualified selection, current-review impact preview, stale save, offline
   save, and fourth-person rejection on desktop and mobile.

### Functional and authorization proof

5. Prove 0/1/2/3/4 configured-member boundaries; four produces no route revision
   head, routing occurrence, fallback, item, or partial side effect.
6. Prove one qualified member of a three-person Site route wins without joining
   Tenant fallback.
7. Prove assignment never grants Site/Plan/action access and independent
   capability never creates route membership or an item.
8. Prove same Party through multiple assignments/grants and Site/Tenant overlap
   creates one exact Party+recipient-role item.
9. Prove cross-Tenant/environment/Site/Plan IDs, caller actor/recipient/role,
   stale capability epochs, service/support paths, and allowed-update-to-
   forbidden-state attempts fail with no information leak.

### Lifecycle, concurrency, and idempotency proof

10. With two and three recipients, prove one successful source action ends all
    sibling actionability while preserving each person's engagement and only
    the winner's actor attribution.
11. Race every pair of approve/request-changes/cancel/source-supersede actions
    supported by the final source contract. One current fence wins; losers see
    current truth and never produce duplicate effects.
12. Prove lost responses and exact retries return the same route-save, handoff,
    and source-action receipts.
13. Prove D21 prospective save, explicit current handoff, unchanged/new/removed
    differential behavior, access loss, Party merge/deactivation, Site
    retirement, source completion, and later D20 episode behavior.

### Accessibility, localization, and performance proof

14. Automated checks plus keyboard and screen-reader testing prove the person
    search, selected rows, add/remove, limit, save, errors, and async status.
15. Prove 320 CSS-pixel/400% reflow, 44-by-44 targets, visible/unobscured focus,
    no color-only meaning, reduced motion, CJK/RTL/long-name wrapping, and
    localized pluralization for one/two/three.
16. Prove the route page and picker do not bulk-load Tenant people or avatars;
    test constrained network, cold cache, cancellation, pagination, and
    lost-response recovery.
17. Run 0/1/2/3/4-recipient production-shaped compiler and feed tests with
    concurrent Sites, open episodes, handoffs, keyset pagination, p50/p95/p99,
    lock wait, deadlock, and error data. D19/D21 performance budgets remain the
    governing targets.

## Monitors and responses

These proposed thresholds are explicit product/operational guardrails, not
claims from vendors.

| Signal                                                | Threshold                                                                                                                    | Owner                                | Required response                                                                                                       |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `site_review_route_released_member_count`             | any released value outside 1–3                                                                                               | Site Platform on-call                | fail/disable affected route release, page, preserve evidence, repair through governed command; never truncate           |
| `site_review_episode_recipient_count`                 | any released occurrence above 3 or mismatch with canonical qualified set                                                     | Communications + Site Platform       | treat as severity-1 tenant-safety invariant, stop claims for occurrence, investigate resolver/release path              |
| `site_review_duplicate_party_item_count`              | any duplicate exact Tenant+episode+routing-meaning+Party+role item                                                           | Communications on-call               | block/reconcile duplicate, preserve audit, fix semantic identity before rollout resumes                                 |
| `site_review_cross_scope_denial_count`                | any successful poison-case or cross-scope read/write in continuous tests                                                     | Security owner                       | stop rollout; incident response and authorization repair                                                                |
| `site_review_competing_action_duplicate_effect_count` | any episode with more than one authoritative source effect                                                                   | Site domain owner                    | severity-1 source-integrity incident; halt action rollout and repair idempotency/fence                                  |
| `site_review_competing_action_current_state_rate`     | more than 1% of multi-recipient episodes over trailing 28 days, with at least 100 episodes                                   | Site Product + UX                    | inspect whether copy/coordination is causing avoidable duplicate work; user research before adding claim/presence state |
| `site_review_multi_vs_single_p75_completion_ratio`    | multi-recipient p75 exceeds single-recipient p75 by 25% for two consecutive 28-day windows, each cohort at least 30 episodes | Site Product                         | investigate diffusion/noise and route usage; tighten guidance/default/cap if causally supported                         |
| `site_review_routes_at_max_share`                     | more than 25% of active routes remain at three for two consecutive 28-day windows, at least 40 routes                        | Site Product Research                | sample affected tenants; determine legitimate coverage versus treating cap as target before changing maximum            |
| `site_review_route_member_unqualified_at_use_rate`    | above 10% of selected-member evaluations for 14 days, at least 100 evaluations                                               | Tenant Administration + Site Product | inspect setup copy/permission separation and route health; do not auto-grant or auto-remove                             |
| `site_review_handoff_renotified_unchanged_count`      | any unchanged Party receives new unread solely from handoff                                                                  | Communications owner                 | stop handoff rollout and repair differential occurrence logic                                                           |
| `site_review_source_resolved_unread_debt_count`       | any source-resolved-before-view item remains unread/actionable                                                               | Communications owner                 | reconcile immediately and repair source-end projection                                                                  |
| `site_review_picker_critical_accessibility_defects`   | any WCAG 2.2 AA or Core 44px/keyboard/focus release-blocker                                                                  | Accessibility owner                  | block release until fixed and manually reverified                                                                       |
| `site_review_setup_critical_misunderstanding`         | any critical misunderstanding in required pre-Live task test; after Live, 3 attributable support cases in 30 days            | Site Product + UX Writing            | revise copy/interaction, retest affected task, ship correction before expanding rollout                                 |
| `site_review_route_save_unknown_outcome_count`        | any save that cannot be reconciled to one durable receipt within D21's declared window                                       | Site Platform                        | show truthful pending/failed state, reconcile by command ID, never advise duplicate manual edits                        |

Do not add a recurring reminder, email escalation, due date, “claim review,” or
automatic primary merely because one of these signals fires. Each is a signal
to investigate the declared model, not permission to expand scope.

## Assumptions that require real ministry evidence

1. Most Tenants can name one normal Website reviewer.
2. Two or three people cover legitimate multilingual, multi-region, or absence
   scenarios without needing a dynamic team.
3. Staff prefer all co-responsible recipients to receive the initial in-product
   item rather than one person claiming it.
4. A recipient count plus privacy-safe “why me” explanation is sufficient when
   co-reviewer names cannot be disclosed.
5. Existing route managers can understand that responsibility changes do not
   change permission or exclusive action authority.

Evidence to verify them: contextual interviews and task tests with actual
ministry staff; anonymized pilot route-size/completion/conflict data; support
case coding; and direct observation of setup/current-handoff tasks. Do not
invent missionary availability, language staffing, or ministry approval policy
and treat it as fact.

## Founder-ready recommendation

**Recommend accepting D22 Option 2 with these amendments:**

> A D21 Website-review responsibility route normally names one deliberately
> selected person and may name a finite code-owned number of explicit,
> co-responsible people. Every selected person who independently passes current
> exact Tenant, environment, Site, Plan-view, and review-action authorization
> receives one private personal item. Any one may perform the existing
> source-owned review action; one valid source transition ends applicable
> sibling actionability and attributes the action only to the actual actor.
> Read state remains personal. The set is unordered, grants no permission,
> contains no group/team identity, and creates no claim, quorum, primary/backup,
> timer, reminder, email, or escalation behavior. Route changes follow D21's
> prospective and explicit differential-handoff contract. No D22 behavior has
> public, Giving, financial, or accounting effect.

D22's meaning is now defensible. The one remaining founder-visible policy is
the exact maximum.

## Recommended next Grill question — D23 exact route maximum

### Why this needs a decision

“Small” is not implementable. Without an exact code-owned maximum, one team may
treat the route as two people while another uses the Phase 17 execution ceiling
of 50, creating inconsistent UI, noise, and tests. No primary source proves a
universal number, so this is a Core product boundary that should be explicit
and validated rather than disguised as an industry standard.

### Option 1 — maximum two people

Strongest accountability and lowest notification volume. It covers one normal
reviewer plus one co-responsible person, but may be too tight for a genuine
three-language/region coverage arrangement.

### Option 2 — maximum three people

**Recommended.** The route still begins with one deliberate person and permits
up to two additional co-responsible people. It supports practical coverage,
keeps every name and state visible, and structurally prevents broad-team fanout.
The exact number is a Core v1 safety judgment and must be validated before Live.

**Staff example:** Hope Ministries chooses Maria. For one multilingual Site it
adds Ana and Joel. All three see that **Any one of these 3 reviewers can
complete a review**. A fourth selection is declined with a clear explanation;
Core never silently truncates or asks the ministry to rank people.

### Option 3 — maximum five people

More room for larger ministries, but more notification noise and weaker
accountability. No evidence gathered here proves that four or five are needed
for this narrow D20 review route.

### Option 4 — no small product maximum

Most flexible, but unsafe and inconsistent. It lets a responsibility route
become a permission-driven broadcast and makes the 50-person execution ceiling
an accidental UX target. Reject.

### Exact question and recommendation

**My recommendation is Option 2 — one person by default, maximum three explicit
co-responsible people per Tenant or Site Website-review route.** Do you choose
Option 2, or do you want maximum two, maximum five, or another exact bound? You
may amend the recommendation.

## Source index

### Governing Core sources

- [D20 — every review-required episode](./phase-24-d20-every-review-required-episode-adversarial-review.md)
- [D21 — explicit review responsibility routing](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
- [ADR-0027 — one notification presentation and engagement model](../../adr/0027-one-notification-presentation-and-engagement-model.md)
- [Phase 17 — System Messages executable manifest](./phase-17-system-message-executable-manifest.md)
- [Phase 17 — System Messages and Template Management](./phase-17-system-messages-template-management.md)
- [Core frontend rules](../../ai/rules/frontend.md)
- [Core backend rules](../../ai/rules/backend.md)

### Current primary external sources

- [HubSpot — Approve HubSpot content](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [Microsoft — Get started with Power Automate approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals)
- [Salesforce — Approval Work Items and Orchestration Work Items](https://help.salesforce.com/s/articleView?id=platform.automate_automated_approvals_concepts_work_items.htm&language=en_US&type=5)
- [Atlassian — Add an approval step](https://support.atlassian.com/jira-service-management-cloud/docs/add-an-approval-to-a-request-type-in-team-managed-projects/)
- [Blackbaud — Approval Tiers for Payment Assistant](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
- [GitHub — Managing code review settings for your team](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- [Contentful — Entry tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [WAI-ARIA APG — Listbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WAI-ARIA APG — Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [W3C — Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- [Forsyth, Zyzniewski, and Giammanco — Responsibility Diffusion in Cooperative Collectives](https://facultystaff.richmond.edu/~dforsyth/pubs/forsythzyzniewskigiammanco2002.pdf)
