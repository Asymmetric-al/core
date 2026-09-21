# Phase 24 D22 — small co-responsible Website reviewers adversarial review

> **Subsequent D29 reconciliation (2026-08-28):** D29 now accepts one distinct
> **Website review follow-up route** with one to three explicit Review
> coordinators, current authorization intersection, and no D21/inviter/admin/
> capability inference. Any statement below that calls D29 “next,” “pending,”
> or “unresolved” records the earlier dependency state and is superseded by the
> [D29 adversarial review](./phase-24-d29-explicit-website-review-coordinators-adversarial-review.md).

Date: 2026-08-28  
Founder answer: **Option 2 — one or a deliberately small co-responsible set;
any one may act**  
Final disposition: **Accept with required amendments**

This is the finished product/specification review for D22. It pressure-tests
the founder answer against the current Core repository, accepted ADRs and
OpenSpec direction, Phase 12 authorization, Phase 17 notification contracts,
D17–D21, current primary sources, accessibility guidance, and realistic
failure conditions.

It is documentation and product evidence only. It changes no runtime, schema,
migration, OpenSpec requirement, ADR, ticket, provider configuration, public
Site, Giving behavior, or financial behavior.

## Final disposition and exact corrected decision

**Accept with required amendments.** Option 2 is the right permanent shape,
but **small** and **any one may act** were too vague to implement consistently.

> A configured Tenant or Site Default Site Locale Plan review-responsibility
> route is an unordered set of **one to three distinct explicit same-Tenant
> people**. A new Tenant begins unconfigured. Core never auto-selects the
> current user, creator, editor, prior reviewer, administrator, role, group, or
> permission holder. The UI recommends one deliberately selected person and
> permits at most two additional co-responsible people.
>
> Three is the hard v1 product and generated-contract maximum. It is not a
> Tenant setting and is not Phase 17's 50-recipient execution ceiling. A fourth
> person, duplicate Party, corrupt count, or legacy overflow rejects the whole
> save or routing result. Core never truncates, replaces someone silently,
> releases a partial set, or treats overflow as proved zero for fallback.
>
> Members are co-equal. Selection, display, insertion, and canonical digest
> order have no responsibility meaning. There is no primary, backup, rank,
> promotion, claim, presence, round robin, workload score, timer, escalation,
> quorum, vote, or all-of progress.
>
> For each initial or D21-authorized successor routing leg, Core resolves only
> the winning route and derives its complete currently qualified subset from
> trusted Tenant, environment, Site, Plan, source action, EffectiveAccess,
> recipient-role, authorization-epoch, and governing separation rules. Every
> qualified routed Party receives one personal ADR-0027 item. An unqualified
> configured person may remain visible to an authorized route manager as
> responsibility intent, but receives no item and gains no access.
>
> The route selects **private attention recipients only**. It is not an action
> allowlist. Any person independently authorized by the source for the exact
> current review—including an authorized person outside the route—may act
> through Site → Languages. Notification membership grants and removes no
> source authority.
>
> One current compare-and-swap-valid source review completes the one source
> review requirement and ends all applicable sibling items. Only the successful
> actor is attributed as having reviewed. Opening, reading, rendering,
> prefetching, or another person's engagement never claims, reserves, approves,
> or completes work and never fabricates sibling engagement or attribution.
>
> Two concurrent valid submissions produce one source winner. The loser sees
> **Review already completed** and current authorized truth, with no retry
> prompt and no second receipt. Stale source, Plan, default-head, dependency,
> policy, or authorization fences commit no review or notification effect.
>
> D21 remains controlling for Site/Tenant precedence, proved-zero fallback,
> indeterminate resolution, stable routing legs, prospective settings, and
> explicit differential current-review handoff. Partial qualification does not
> join fallback. Unchanged people keep their item/engagement; removed
> responsibility ends without revoking permission; newly selected qualified
> people get one successor item; old engagement never revives.
>
> D22 adds no task, queue, due date, reminder, email, SMS, push, Page,
> Navigation, Communications, public Site, activation, Giving, Legal Entity,
> Stripe, settlement, bank, currency, contribution, receipt, statement, ledger,
> or accounting effect.

The limit of three is a **Core v1 product judgment**, not a universal industry
fact. Primary sources prove that one-of, all-of, and sequential review are
different meanings and that broad audiences create notification noise. No
source proves an optimal count for nonprofit Website review. Three is the
smallest defensible ceiling that supports one clear person, a second for real
coverage, and one additional genuine co-responsible person while structurally
preventing a broad-team broadcast. Representative ministry evidence may lower
it before Live. Raising it requires a reviewed versioned contract.

## End-user and Tenant example

Hope Ministries normally chooses Maria alone. Its French Site genuinely shares
responsibility with Ana, so an authorized manager adds Ana. Maria and Ana each
receive their own private **Needs attention** item only when currently allowed
to see and perform that exact review.

Maria opens her item; only Maria's unread state clears. Ana completes the
source review first. The review becomes complete, both actionable items end,
and only Ana is recorded as the reviewer. Core does not pretend Maria reviewed,
approved, acknowledged, or even opened anything.

Joel may still complete the review through **Site → Languages** if the source
independently authorizes him, even when he was not selected for attention.
Conversely, adding Joel to the route gives him no Site access or review power.

## Current behavior, intended behavior, and permanent path

### Current repository behavior

- No stable operational Site/default-locale Plan or D20/D21/D22 runtime exists.
  `apps/admin/src/cms/public/resolve-tenant.ts` still returns `siteId: null` at
  the reserved Site seam.
- `packages/auth/permissions.ts` still maps every staff subrole to the same
  broad four-capability MVP set. It is not the final Phase 12 product.
- Current contribution-approval code enumerates Tenant admin/super-admin
  profiles and has contribution-specific task, email, reminder, and escalation
  behavior. It is another domain, not a safe D22 precedent.
- ADR-0027, Phase 12/17, and D17–D21 are governing design contracts, not proof
  that this runtime is shipped.

### Intended behavior before correction

D21 supplied the Tenant route, rare Site override, visible fallback, current
authorization intersection, and personal items. D22 Option 2 intended one
normal person or a small co-responsible set where one review is enough.

Without correction, **small**, **reviewer**, and **may act** could become an
uncapped group, ordered list, permission allowlist, shared task, or first-click
claim. Those interpretations are rejected.

### Best permanent path

Use one typed bounded D20-specific responsibility route; exact people only;
one-person happy path; maximum three; independent current source authorization;
one source CAS result; ADR-0027 personal items; D21 prospective/differential
lifecycle; no generic workflow or notification substitute.

## Evidence and evidence limits

### Verified repository facts

1. [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)
   separates producer truth, presentation, personal engagement, and completion.
2. [D17](./phase-24-d17-private-default-site-locale-plan-adversarial-review.md)
   says assignment grants no access and source actions use independent current
   authorization.
3. [D19](./phase-24-d19-state-driven-plan-attention-adversarial-review.md)
   requires exact Tenant+Party+role+surface items, personal engagement, no
   unread fabrication, and no revival.
4. [D20](./phase-24-d20-every-review-required-episode-adversarial-review.md)
   owns one source review episode and completion, not one approval per recipient.
5. [D21](./phase-24-d21-explicit-review-responsibility-routing-adversarial-review.md)
   separates responsibility from authorization and defines precedence,
   fallback, stable legs, and differential handoff.
6. Phase 17 requires complete all-before-any recipient release; 50 is an
   execution ceiling, not a desired audience.
7. Platform principles rank tenant/permission safety first and require clarity,
   accessibility, perceived speed, shared language, and product-level done.

### Verified current external facts

- [HubSpot](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content),
  [Microsoft](https://learn.microsoft.com/en-us/power-automate/get-started-approvals),
  and [Blackbaud](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
  expose one-of and all-of as different meanings; Blackbaud separately requires
  approver permission. Finance-specific tiers do not belong to Site identity.
- [GitHub](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
  explicitly limits team-review notifications to reduce noise and clarify
  individual responsibility.
- [Contentful](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
  demonstrates the footguns of team-wide fan-out and assignment that may not
  prove entry access. Core adopts neither.
- [WAI listbox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
  says interactive controls do not belong inside listbox options; selected
  people should render as ordinary rows after a single-person search.
- [WAI combobox guidance](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
  supports searchable single-choice selection over an allowed set.
- WCAG requires visible labels/instructions, textual errors, programmatic
  status, and 320-CSS-pixel reflow. Core's 44-pixel target rule is stronger
  than WCAG's minimum.

### Product judgments, assumptions, and unknowns

- Product judgments: one explicit person is normal; maximum three; unordered
  equality; add one at a time; no claim/presence/reminder system.
- Assumptions: most Tenants can name one normal person; two or three cover
  genuine shared responsibility; safe counts work when names cannot be shown;
  staff understand responsibility is neither access nor exclusive authority.
- D23 now selects a source-owned proportional independence floor. D20 keys
  remain Reserved even though D24 now closes the protected-participant predicate
  by excluding every source-defined substantive participant in the exact
  protected candidate. They cannot advance until every source evaluator,
  identity, authorization, D25 recovery, and synchronized proof dependency is
  exact.

These assumptions require direct ministry interviews, task tests, anonymized
pilot data, and support-case coding. They are not ministry facts.

## Complete staff and recipient UX/UI

### Tenant setup — one is the happy path

Location: **Settings → Websites → Review notifications**.

```text
Review notifications

People to notify
Choose the smallest set of people who genuinely share this responsibility.

[Search people…]

Each selected person who is currently allowed receives a private Needs
attention item. One authorized person completes the review.
This does not give anyone access or permission.

[Save reviewers]
```

Core shows one required search after staff choose to configure the route. It
does not show three empty slots, `1 of 3 complete`, an avatar wall, or progress
that makes the maximum look like a target. Nobody is preselected.

After Maria is selected:

```text
Maria Santos
Coverage will be checked whenever a review is needed.
[Remove Maria Santos]

One person is usually clearest.
[Add coverage reviewer]
```

With Maria and Ana:

```text
2 people share review notifications

Maria Santos
Ana García

Both receive their own item when currently allowed. One authorized person can
complete the review; Core does not need one review from each person.
```

At three:

```text
3 people selected · maximum

Any one currently authorized person can complete a review.
Keeping this group small makes responsibility clear and limits unnecessary
notifications. Remove someone before adding another.
```

The add action becomes unavailable but its explanation remains. A forged fourth
request receives a persistent text error and writes nothing.

### Person picker

- Use a shared Base UI searchable combobox to add one exact person at a time.
- Selected people live outside the listbox as semantic rows with separate
  44-by-44 **Remove Name** buttons.
- Search is server-filtered, same-Tenant, purpose-filtered, keyset-paginated,
  cancelable, and never downloads the full directory.
- Show Unicode name plus only an independently authorized disambiguator.
- Duplicate Party says **Already selected**. Multiple assignments/grants still
  create one Party member and one item.
- No select-all, team, group, CSV, paste-list, drag order, star, primary, or
  backup control.
- Focus after remove is predictable; add/remove/count/max/save/error are
  announced once without stealing focus.

### Qualification and coverage

At Site scope show **Can currently receive this Site's reviews** or **Cannot
currently receive this Site's reviews — adding this person does not grant
access**.

At Tenant scope, eligibility differs by Site. Where permitted, show a safe
summary such as **Maria can currently receive reviews for 12 of 18 Sites; 2
Sites use their own notifications**. Do not claim universal eligibility or
enumerate restricted Sites.

One qualified member of three keeps the Site route as winner; no Tenant
fallback joins. Proved zero follows D21 fallback/no-route. Unknown is never
zero.

### Prospective save and current handoff

```text
Review notifications saved

Maria Santos and Ana García will receive future review items when currently
allowed. Existing reviews keep their current notifications.

2 reviews are already waiting.
[Review current assignments]
```

Normal save is one step with no modal. The separate D21 journey says:

```text
Newly notified
Ana García

No longer receives the item
Maria Santos

Unchanged · no new notification
Joel Martin

This changes review attention only. It does not change who has permission to
review from Languages.

[Update 2 current reviews]  [Keep current assignments]
```

### Recipient and concurrent-completion experience

The compact D20 item remains minimal. The destination adds:

```text
Review notifications

You and 1 other person received this review. One authorized person completes
the review; Core does not need one review from each person.
Opening this item does not claim it.
```

Names require separate roster visibility. Never show sibling delivery, unread,
read, opened, presence, availability, or access-failure state.

If Ana completes while Maria is viewing:

```text
Review complete

Ana García completed this review. No action is needed.
```

Show Ana only when actor attribution is visible; otherwise show **This review
is complete**. Remove the effectful action, preserve safe recoverable local
input, and offer no misleading retry.

### No-recipient state

```text
Review notifications need setup

No selected person can currently receive this Site's review notifications.
Authorized staff can still review the Plan in Languages.

[Set up reviewers]
```

This creates no guessed admin, task, email, reminder, public message, or block
on independently authorized review.

### Visual, accessibility, localization, and resilience contract

- Mission Control only; shared `@asym/ui`; Base Maia/Base UI; Zinc semantic
  tokens; no app-local primitive or second visual system.
- Native labelled semantics, persistent descriptions/errors, visible focus,
  keyboard/Escape behavior, and one concise live status.
- Core 44-by-44 targets; 320-CSS-pixel/400% one-column reflow; forced colors;
  reduced motion; no color/avatar-only state or horizontal task scrolling.
- Long names, CJK, combining marks, RTL/bidi isolation, text spacing, and
  localized singular/plural copy preserve every decisive action.
- Optional avatars are decorative and omitted by default; flags never represent
  identity, language, location, or eligibility.
- Offline edits remain local with **You're offline. Changes haven't been
  saved.** No cached authorization or optimistic route claim is used.
- Lost responses reconcile by command ID. Saved configuration and pending
  downstream effects are stated separately.
- No decorative motion, focus-stealing toast, repeated announcement, or sound.

## Sources of truth and invariants

| Fact                         | Authority                                      | Never authority              |
| ---------------------------- | ---------------------------------------------- | ---------------------------- |
| configured route             | immutable Site/Tenant revision + current head  | role, item, browser form     |
| current action authorization | Phase 12 EffectiveAccess + exact source policy | route membership, prior item |
| winning/qualified set        | generated D21/D22 resolver                     | caller, cache, legacy task   |
| item/engagement              | Phase 17 Tenant+Party+role+surface             | source review, shared row    |
| review outcome/actor         | source-owned D17 command/receipt               | route save, open/read        |
| public/default               | D16/public generation owners                   | notification/route           |
| Giving/financial             | their existing owners                          | Site identity/D22 route      |

Required invariants:

1. Current configured route has 1–3 unique same-Tenant Parties; no route is a
   distinct state.
2. Order has no meaning.
3. Responsibility never grants authorization; authorization never creates
   responsibility or an item.
4. Route is attention selection, not action allowlisting.
5. One routing leg uses only the D21 winner; Site/Tenant members never union.
6. Only the complete currently qualified subset receives items.
7. Partial qualification does not invoke fallback; indeterminate releases none.
8. One Party+fixed role has at most one active item for the same episode/meaning.
9. Engagement is personal; no peer state is shared or fabricated.
10. One source result ends siblings and attributes only the actual actor.
11. A separately source-authorized and D23-eligible non-recipient may act.
12. Route edits are prospective unless D21 current handoff succeeds.
13. Unchanged people are never re-alerted solely by route revision.
14. Remove/re-add, access regain, identity relink, and cache replay never revive
    old items/engagement.
15. At most three active items exist per routing leg; historical successor legs
    may contain more distinct people over time without rewriting history.
16. Fourth member, duplicate, count/digest mismatch, or partial write never
    becomes current or triggers fallback.
17. Clone/import/template/transfer/environment copy never copies named people
    or engagement implicitly.
18. D23/source separation rules may filter a selected person; route membership
    never weakens them.
19. D22 never changes public, Giving, or financial truth.

## Conceptual database, RLS, and authorization contract

Exact physical names remain design work, but the later model must use:

- typed append-only Tenant/Site route lineage and one current head per scope;
- immutable normalized Party members, not mutable JSON;
- revision header with expected count constrained 1–3, canonical set digest,
  release state, and provenance;
- no semantic primary/backup/rank/position; an internal canonical ordinal may
  serve digest/release only and cannot affect behavior;
- immutable receipt/body-free audit; separate Phase 17 occurrence/item/
  engagement owners.

PostgreSQL cannot safely count sibling rows with an ordinary row `CHECK`. The
sole route command validates the full set, acquires a documented route lock,
writes header/members in one short transaction, verifies count/uniqueness/
digest, moves the current head by expected-revision CAS, and exposes release
last. Direct child writes are revoked.

Required safeguards:

1. Stable UUID/Party identity; names/slugs never key membership.
2. Structural Tenant/environment/Site/Party same-scope relationships.
3. Closed scope checks and unique current head/Party-per-revision constraints.
4. Restrictive deletion and retained evidence; merge/erasure follow identity
   owner and never transfer business history.
5. Index current route, members, reverse Party impact, inherited/fallback Sites,
   active source, reconciliation, and stable keyset search/audit.
6. No direct browser route/member/occurrence/item/audit write; use
   `packages/api`.
7. No `anon`; explicit least-privilege grants plus RLS.
8. Purpose-specific reads: route manager full editor, recipient safe why-me,
   ordinary reviewer no roster.
9. RLS `USING` checks existing rows and `WITH CHECK` checks resulting rows; an
   allowed row cannot move across scope.
10. Tenant, actor, Party binding, head, recipient role, count, qualification,
    set, and audit derive from trusted server context; requested Party IDs are
    configuration intent only.
11. Owner/service/definer/RPC/view/worker/support/repair/import/cache/realtime/
    export/AI paths pass the same poison matrix.
12. Definers use qualified objects, controlled `search_path`, least privilege,
    revoked public execution, and pgTAP proof.
13. Route save uses command ID + expected head; exact retry returns one receipt;
    changed payload under same key rejects.
14. Lock order is consistent; slow authorization/network work stays outside
    locks and is re-fenced inside.
15. Generated D20 binding uses maximum 3, not generic Phase 17 ceiling;
    limit-plus-one is invalid/indeterminate, never zero.

## Lifecycle and failure map

| Scenario                      | Required result                                    |
| ----------------------------- | -------------------------------------------------- |
| new Tenant                    | no route; no inferred person                       |
| 1/2/3 configured              | complete immutable unordered revision              |
| fourth/duplicate              | whole save rejects; prior head remains             |
| same set reordered            | semantic no-op                                     |
| one of three qualifies        | one item; no fallback                              |
| zero proved qualified         | D21 saved fallback/no-route                        |
| unknown/stale                 | no release or widening                             |
| Party in Site + Tenant routes | winning route only; one item                       |
| several grants/assignments    | one Party/fixed-role item                          |
| authorized non-recipient acts | succeeds; siblings end                             |
| recipient reads               | only personal unread changes                       |
| two view                      | no claim/presence                                  |
| two submit                    | one CAS winner; truthful loser                     |
| source/policy/access changes  | stale action commits nothing                       |
| response lost                 | exact retry returns same receipt                   |
| prospective save              | future episodes only                               |
| `[Maria,Ana]→[Ana,Joel]`      | Ana unchanged; Maria ends; Joel gets one successor |
| source before/after handoff   | converges with no badge debt/fabricated read       |
| removed but authorized        | item ends; may still review from Languages         |
| access loss/regain            | presentation removed; no revival                   |
| Party merge/relink            | governed reconciliation; no transfer               |
| new genuine review episode    | new items under current route                      |
| clone/import/transfer         | no people/engagement copied                        |
| Site retirement               | no new routing; history preserved                  |
| offline/lost save             | honest local draft + idempotent receipt            |

## Ruthless adversarial review — all 22 categories

Each entry explicitly covers what can fail, impact, severity/likelihood,
evidence, effect on the answer, permanent prevention, and exact spec language.

### 1. Problem validity, necessity, and alternatives

**Material concern: Yes.**

- **What/why:** Core could build a team workflow or broadcast to everyone with
  permission. The root problem is clear personal attention with deliberate
  coverage, not permission or approval orchestration.
- **Severity/likelihood:** High / High without a bound.
- **Evidence:** D21 separates responsibility/authorization; GitHub documents
  team-notification noise; one-of is established; no source proves a count.
- **Effect:** Narrows but does not invalidate Option 2.
- **Fix:** One explicit person by default, max three, no capability fan-out.
- **Exact language:** “Core SHALL recommend one deliberate recipient, permit at
  most three explicit Parties, and SHALL NOT infer responsibility from role,
  capability, creator, prior reviewer, or team.”

### 2. Brittleness

**Material concern: Yes.**

- **What/why:** Vague size, stale eligibility, guessed absence, and accidental
  order semantics fail as people/source/access change.
- **Severity/likelihood:** High / High.
- **Evidence:** Authorization is target/time specific; D21 distinguishes
  partial, zero, and indeterminate.
- **Effect:** Requires exact 1–3/current reproof/no inferred availability.
- **Fix:** Closed results, stable identities, current fences, D21 lifecycle.
- **Exact language:** “Resolution SHALL return complete-qualified,
  proved-zero, indeterminate, or invalid and SHALL NOT infer availability,
  priority, or fallback from partial/stale evidence.”

### 3. Technical debt

**Material concern: Yes.**

- **What/why:** JSON arrays, teams, mutable assignees, contribution tables, or
  task queues create duplicate authorization/notification infrastructure.
- **Severity/likelihood:** Critical / High if shortcuts are reused.
- **Evidence:** Current contribution flow is broad/finance-specific; ADR-0027
  and D21 require different owners.
- **Effect:** Forces typed D21 revisions + canonical Phase 17 writer.
- **Fix:** Normalized immutable members; no generic substitute.
- **Exact language:** “D22 SHALL NOT create/reuse a generic team, task, queue,
  mutable JSON recipient list, or second notification writer.”

### 4. Edge cases

**Material concern: Yes.**

- **What/why:** Zero/duplicate/fourth, partial qualification, overlap, multiple
  assignments, identity merge, last removal, stale tabs, concurrency, clone,
  retirement, and international names can create wrong/missing/duplicate work.
- **Severity/likelihood:** High / High.
- **Evidence:** D19/D21 require exact Party identity/successors/no revival.
- **Effect:** Requires closed lifecycle and proof matrix.
- **Fix:** Stable set, exact head/digest/fences, explicit no-route, Unicode UX.
- **Exact language:** “Implementation SHALL prove 0/1/2/3/4, duplicate,
  overlap, partial/unknown, handoff, identity, race, clone/transfer, retirement,
  and localization cases.”

### 5. Footguns

**Material concern: Yes.**

- **What/why:** First-listed looks primary; add looks like access grant; open
  looks like claim; remove looks like permission revocation; three looks
  required; developers may truncate four.
- **Severity/likelihood:** High / High.
- **Evidence:** Assignment/access confusion is documented and forbidden by
  D17/D21.
- **Effect:** Requires equal rows, consequence copy, no preselection, server
  rejection.
- **Fix:** Repeat the distinction at setup/save/handoff/destination.
- **Exact language:** “Every editor SHALL state that selection changes private
  attention only, grants no access, is non-exclusive, and requires one source-
  authorized review.”

### 6. Tenant safety

**Material concern: Yes.**

- **What/why:** Forged/cached Party/Site/route/count/realtime/support/export can
  expose another Tenant's staff or private Plan.
- **Severity/likelihood:** Critical / Medium without structural scope.
- **Evidence:** Core prioritizes tenant/permission correctness; ADR-0027 uses
  exact Tenant+Party+role.
- **Effect:** Requires same-scope constraints and current reproof everywhere.
- **Fix:** Scoped relationships/projections/cache/topic keys + poison tests.
- **Exact language:** “No route, member, occurrence, item, cache, cursor,
  realtime, support, export, or repair may bind/reveal another Tenant,
  environment, Site, or Party.”

### 7. Database, RLS, and authorization safety

**Material concern: Yes.**

- **What/why:** App-only counts race; weak update moves rows across scope;
  missing `WITH CHECK`, child writes, service bypass, cascade, or caller actor/
  qualification corrupts truth.
- **Severity/likelihood:** Critical / Medium-High.
- **Evidence:** PostgreSQL row checks cannot count siblings; Supabase/Postgres
  require grants/RLS/operation-correct policy halves.
- **Effect:** Strongly narrows mutation/release design.
- **Fix:** Locked append-only complete set, release-last, composite scope,
  restrictive delete, privileged poison tests.
- **Exact language:** “Scope, actor, role, count, qualification, set, and audit
  SHALL be server-derived; mutations SHALL pass old-row `USING` and resulting-
  row `WITH CHECK`.”

### 8. Overengineering

**Material concern: Yes.**

- **What/why:** Order, claim, presence, workload, calendar, escalation, quorum,
  reminders, or teams add speculative state/privacy/operations.
- **Severity/likelihood:** High / High.
- **Evidence:** D18 no date; D19 no reminder/email; D21 rejects availability;
  one source review already exists.
- **Effect:** Keeps Option 2 small.
- **Fix:** Equal 1–3 recipients + one source CAS only.
- **Exact language:** “D22 SHALL add no order, claim, presence, workload,
  schedule, due date, escalation, reminder, quorum, vote, or workflow state.”

### 9. UX/UI and user friction

**Material concern: Yes.**

- **What/why:** Team language, rich multi-select tags, hidden max, ambiguous
  one/all, modals, misleading eligibility, or weak mobile/a11y cause over-
  notification, broad grants, or abandonment.
- **Severity/likelihood:** High / High before usability proof.
- **Evidence:** Core favors clarity/a11y; W3C constrains listboxes/forms; no D22
  UI is tested.
- **Effect:** Adds complete journey and release gates.
- **Fix:** Add-one combobox, semantic rows, one-person path, consequence copy,
  one-step prospective save, separate handoff, honest states.
- **Exact language:** “Representative staff SHALL correctly explain recipients,
  one-of completion, no access grant, prospective behavior, and non-exclusive
  authority before Live.”

### 10. Source of truth, ownership, and invariants

**Material concern: Yes.**

- **What/why:** Route/item/read become completion authority or attribute all
  recipients, corrupting review evidence and engagement.
- **Severity/likelihood:** Critical / High.
- **Evidence:** ADR-0027/D19 separate facts; Phase 12 says assignment grants no
  decision power.
- **Effect:** Adds route-as-attention and ownership map.
- **Fix:** Source command alone owns completion/actor.
- **Exact language:** “Only the source review records completion/actor; route,
  item, delivery, open, read, unread, archive, or sibling state SHALL NOT create
  or infer review evidence.”

### 11. Hidden coupling

**Material concern: Yes.**

- **What/why:** A reviewer team could control Page, Communications, activation,
  Giving, or finance, silently crossing source owners.
- **Severity/likelihood:** Critical / Medium.
- **Evidence:** Site is presentation/attribution only; D17/D21 preserve owners;
  Giving/finance are explicitly separate.
- **Effect:** Restricts D22 to D20 meanings/fixed recipient role.
- **Fix:** Typed boundaries + cross-domain poison tests.
- **Exact language:** “D22 membership SHALL have no Page, Navigation,
  Communications, activation, public, Giving, Legal Entity, Stripe, settlement,
  bank, currency, or accounting authority/effect.”

### 12. Failure modes

**Material concern: Yes.**

- **What/why:** Lost response, partial fan-out, source end during compile,
  deactivation, outage, or ambiguous success creates contradictory UI/badges
  and repeated actions.
- **Severity/likelihood:** Critical / Medium.
- **Evidence:** Phase 17 all-before-any; D20 separates source/notification
  recovery.
- **Effect:** Requires receipts, outbox, release-last, reproof, honest pending.
- **Fix:** Durable same-identity replay + reconciliation + Languages path.
- **Exact language:** “Pre-release failure exposes no set; post-authoritative
  failure reconciles the same identity and never creates a peer revision,
  occurrence, item, or review.”

### 13. Lifecycle, temporal correctness, concurrency, idempotency

**Material concern: Yes.**

- **What/why:** Two commits, stale review, unchanged re-notify, fallback bounce,
  or retry-created history jointly violate one-review/one-item invariants.
- **Severity/likelihood:** Critical / High.
- **Evidence:** D17/D20 source fences; D21 stable legs/differential successors.
- **Effect:** Requires lifecycle table/one CAS winner.
- **Fix:** Business-effect idempotency, expected heads, set diff, lock order,
  no revival.
- **Exact language:** “Concurrent source commands SHALL yield one winner and
  truthful losers; handoff SHALL preserve unchanged engagement and create only
  newly admitted items.”

### 14. Data integrity risks

**Material concern: Yes.**

- **What/why:** Duplicate Parties/items, count/digest mismatch, order-only
  revisions, partial sets, orphan successors, or merged engagement corrupt
  history/reporting.
- **Severity/likelihood:** Critical / Medium.
- **Evidence:** D19/Phase 17 exact identity/complete release.
- **Effect:** Requires immutable digest/uniqueness/reconciliation.
- **Fix:** Party-role uniqueness, canonical IDs, release-last, restrictive FKs.
- **Exact language:** “Released route/occurrence SHALL prove count, unique
  Parties, canonical digest, and complete children; order, duplicate grants, or
  identity relink SHALL NOT duplicate/transfer state.”

### 15. Security and privacy risks

**Material concern: Yes.**

- **What/why:** Picker timing, names, eligibility, sibling engagement, actor,
  logs, metrics, support, exports, or backups reveal restricted relationships.
- **Severity/likelihood:** Critical / Medium.
- **Evidence:** D19 reauthorizes count/list/detail/action and retains body-free
  audit.
- **Effect:** Requires purpose projections/minimal telemetry.
- **Fix:** Uniform hidden/missing, manager roster, safe why-me/count, no PII
  telemetry or peer state.
- **Exact language:** “Membership SHALL NOT authorize peer identity,
  eligibility, delivery, read, presence, or actor disclosure; each requires its
  own current purpose projection.”

### 16. Scalability and performance risks

**Material concern: Yes.**

- **What/why:** Tenant routes across many Sites can cause N+1 auth, bulk bursts,
  directory downloads, lock waits, or overloaded individuals despite max 3.
- **Severity/likelihood:** High / Medium-High.
- **Evidence:** D19/D21 require bounded/indexed work; no production D22 evidence.
- **Effect:** Requires indexed/batched impact, prospective defaults, bounded
  reconciliation, quantitative gates.
- **Fix:** Keyset search, equality-first indexes, no global scan/cached auth,
  p50/p95/p99/lock proof.
- **Exact language:** “D22 SHALL separately measure Site count, item volume,
  plans, locks, and p50/p95/p99 under production-shaped concurrency.”

### 17. Operational burden

**Material concern: Yes.**

- **What/why:** Inactive people, cap friction, unclear no-route, or partial
  failure can require SQL, broad grants, or developers.
- **Severity/likelihood:** High / Medium.
- **Evidence:** Phase 12 requires small-org usability; D21 supplies inheritance/
  guided handoff.
- **Effect:** Requires health/remove/replace/no-route/repair UX.
- **Fix:** Governed successor commands; no manual DB normal process.
- **Exact language:** “Every inactive, empty, over-limit, stale, or unknown
  state SHALL have permitted in-product diagnosis and governed repair; direct
  SQL is never normal remediation.”

### 18. Observability and auditability gaps

**Material concern: Yes.**

- **What/why:** A notification row alone cannot explain configured/qualified/
  winning sets, fan-out, personal engagement, or source actor/outcome.
- **Severity/likelihood:** High / High without separate evidence.
- **Evidence:** ADR-0027 separates presentation/business history; D21 requires
  provenance.
- **Effect:** Adds route/resolution/occurrence/item/engagement/source evidence.
- **Fix:** Body-free audit + redacted correlated telemetry.
- **Exact language:** “Audit SHALL distinguish configured members, qualified
  recipients, leg/reason, items, personal engagement, source result, and actor
  without private content/peer state in metrics.”

### 19. Dependency and integration risks

**Material concern: Yes.**

- **What/why:** Shipping before Site/Phase12/17/Plan/source closure or adapting
  contribution notifications preserves broad roles and a second writer.
- **Severity/likelihood:** Critical / High if rushed.
- **Evidence:** No stable D22 runtime; current contribution code is incompatible.
- **Effect:** Keys remain Reserved; implementation dependency-gated.
- **Fix:** One compatible generation after exact IDs and D23; no dual-write.
- **Exact language:** “No D20 key becomes Live until Site/Plan, source action,
  Phase 12, Phase 17, D21, D22, and D23 contracts are jointly proved.”

### 20. Migration, rollout, and upgrade risks

**Material concern: Yes.**

- **What/why:** Inferring admins/creators/prior notices creates false routes and
  unread floods; mixed versions truncate; cap changes rewrite history; rollback
  erases evidence.
- **Severity/likelihood:** Critical / Medium.
- **Evidence:** No eligible history; D17/D21 forbid inferred assignees; Phase 17
  requires compatible generation.
- **Effect:** Empty future-only start + one writer.
- **Fix:** Negative readers, explicit setup, shadow sets, canary, preserved
  history, roll-forward repair.
- **Exact language:** “Migration SHALL infer zero routes/items from role,
  admin, creator, editor, prior reviewer, task, contribution approver, or legacy
  notification; incompatible generations fail closed and never truncate.”

### 21. Testability, traceability, and proof

**Material concern: Yes.**

- **What/why:** Happy-path tests can pass while `small`, `reviewer`, and `any
one` contradict glossary/PRD/OpenSpec/manifest/RLS/UI/runtime.
- **Severity/likelihood:** Critical / High.
- **Evidence:** Phase 17 requires generated contracts/proof; D20 keys unminted.
- **Effect:** Adds exact acceptance matrix/trace chain/release gates.
- **Fix:** Answer → glossary → D19–D22 → future OpenSpec/design/tasks →
  manifest → tests → evidence.
- **Exact language:** “Contradictory cardinality, order, action authority,
  completion, role, source end, privacy, or identifiers SHALL block minting or
  keep the generation Reserved.”

### 22. Other development hazards

**Material concern: Yes.**

- **What/why:** Route membership could waive self-review rules; cap changes
  silently; three becomes a target; selected people seem exclusively authorized.
- **Severity/likelihood:** Critical / Medium.
- **Evidence:** Phase 12/17 source-specific different-human rules; D23 requires
  proportional source-owned evaluation; D24 now excludes every source-defined
  substantive participant in the complete exact protected-candidate lineage; no
  source proves three.
- **Effect:** Requires the closed D23/D24 contract, D25 recovery, and versioned
  cap governance.
- **Fix:** Source-owned actor eligibility, one-person UX, evidence-gated cap
  changes, route-not-allowlist proof.
- **Exact language:** “D22 SHALL never weaken source-owned maker-checker/self-
  review rules; changing the maximum requires explicit compatible amendment and
  representative usability, privacy, load, and rollout evidence.”

## Strongest alternative and why it loses

Exactly one person gives the clearest accountability, smallest UI, and least
noise. It loses because Core cannot know an authorized person is absent, and
one loss immediately strands attention or invokes fallback. Corrected Option 2
naturally behaves like that alternative for the normal one-person route while
allowing deliberate two/three-person coverage without a scheduler.

Ordered backup needs manual promotion/availability and duplicates D21 handoff.
All-of changes the source meaning and blocks on every unavailable person.
Permission-wide fan-out is easy to configure but worst for accountability,
privacy, and noise.

## Falsifiable acceptance criteria

1. New Tenant has no route/inferred person.
2. Setup requires explicit Party; no one is preselected.
3. 1/2/3 unique people save; four rejects atomically and preserves prior head.
4. Duplicate Party gives field error and no duplicate member/item.
5. Same set reordered is a semantic no-op.
6. No order/primary/backup/claim/quorum/presence/reminder UI exists.
7. One-person copy never looks `1 of 3 complete`.
8. Two/three copy says one review suffices and personal items are independent.
9. Max explanation remains visible; server independently rejects four.
10. Setup/save/handoff/destination all say no access grant.
11. Last Tenant member uses explicit route removal.
12. Last Site member uses inherit-Tenant or no-notification; no empty override.
13. Prospective save changes no open episode.
14. Current handoff labels new/removed/unchanged and no re-notify.
15. No-recipient state preserves Languages review path.
16. Staff task tests correctly explain recipients, one-of, no access grant,
    prospective behavior, and non-exclusive authority.
17. Selection grants no membership/capability/access/action/public authority.
18. Independent authorization creates no route membership/item.
19. Selected unqualified person receives no item/access.
20. One qualified of three receives one item; no fallback.
21. Proved zero alone follows D21 fallback/no-route.
22. Unknown/stale/partial/corrupt/overflow releases none and never widens.
23. Non-routed source-authorized person can review from Languages.
24. Denial solely because actor is not routed fails.
25. Route cannot bypass source self-review/different-human rules.
26. Ordinary recipient cannot enumerate peer names/status/engagement.
27. Candidate search/timing cannot enumerate hidden people.
28. Cross-scope poison fails for browser/RPC/view/service/worker/support/repair/
    export/realtime/cache.
29. `USING` and `WITH CHECK` reject scope transformation.
30. Logs/metrics contain no person names/private Plan/source diff/peer state.
31. No public/Page/Communications/Giving/financial effect occurs.
32. Current head references one complete immutable 1–3-member revision with
    matching count/digest.
33. Zero-member current revision is impossible.
34. Member permutations share one canonical digest.
35. Display sorting creates no revision/item/unread.
36. Several assignments/grants create one Party member/fixed-role item.
37. Site/Tenant overlap uses winner only.
38. At most three active items exist for one routing leg.
39. Qualified 1/2/3 sets release all-before-any.
40. Mismatch/overflow exposes no partial set/fallback.
41. Direct browser business writes fail.
42. Privileged paths cannot bypass cap/uniqueness/scope/eligibility.
43. Route save is atomic and exact retry returns same receipt.
44. Same command ID with changed payload rejects.
45. Concurrent managers produce one head winner/current-diff loser.
46. First valid source CAS creates one review and ends siblings.
47. Only successful actor is attributed.
48. Concurrent reviewers produce one success + truthful completed loser, no
    retry/second receipt.
49. Review racing source/default/dependency/policy/access change commits no
    stale effect.
50. Open/read/prefetch/render/realtime never claims/completes.
51. Completion before view creates no unread debt/fabricated read.
52. Prospective edit affects future episodes only.
53. `[Maria,Ana]→[Ana,Joel]` preserves Ana, ends Maria, adds one Joel item.
54. Responsibility removal does not revoke source permission.
55. Access loss removes presentation; audit remains.
56. Regain/re-add/fallback recovery never revives old engagement.
57. Source/handoff races converge without badge debt/duplicate occurrence.
58. Party deactivation/merge/relink never transfers state.
59. Clone/import/transfer copies no people/engagement.
60. Retirement creates no new routing; history remains.
61. Migration infers no route/item from roles/admins/creators/editors/prior
    reviewers/tasks/contribution approvers/legacy notifications.
62. Incompatible generations fail closed and never truncate.
63. Rollback stops new occurrences but preserves all history.
64. Keyboard/focus/add/remove/max/save/error/status pass manually.
65. Screen reader gets stable labels and no interactive listbox option child.
66. Remove controls are named and at least 44-by-44.
67. 320px/400% preserves all content/actions without horizontal task scroll.
68. Forced colors, reduced motion, text spacing, CJK, combining, RTL, long
    names, and localized 1/2/3 pass.
69. Offline/lost response preserves draft, claims no false success, reconciles
    one receipt.
70. Picker is server-filtered/keyset/cancelable and bulk-loads no directory.
71. Production-shaped 0/1/2/3/4, many-Site, handoff, auth churn, p50/p95/p99,
    plans, locks, deadlocks, and partial-release tests pass.
72. Trace artifacts agree on cardinality/order/auth/completion/privacy/source
    end.
73. No D20 key becomes Reserved/Live without max 3, fixed resolver/role, D23,
    D24's protected participant predicate, source/end, and proof links.

## Named monitors

Zero-tolerance invariants page immediately. Product/performance thresholds must
be registered before pilot; missing required thresholds block Live.

| Signal                                                    |                                                       Threshold | Owner                       | Response                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------: | --------------------------- | ------------------------------------------------------------------------- |
| `site_review_route_member_bound_violation_total`          |                                                 any outside 1–3 | Site Product + Data         | stop writer/fence D20/preserve/forward-repair; never truncate             |
| `site_review_route_zero_member_head_total`                |                                                             any | Site Data                   | fence/release none/explicit repair                                        |
| `site_review_route_duplicate_member_total`                |                                                             any | Site API                    | reject/preserve receipt/fix canonical validation                          |
| `site_review_route_auto_selected_identity_total`          |                                                             any | Site Product + Security     | remove inferred state/assess disclosure/require setup                     |
| `site_review_route_order_only_revision_total`             |                                                             any | Site API                    | suppress revision/handoff/unread/fix digest                               |
| `site_review_route_recipient_overflow_release_total`      |                                                      any leg >3 | Phase 17 + Site Security    | stop compiler/hide partial/fix resolver; never fallback/truncate          |
| `site_review_route_partial_fanout_total`                  |                                                             any | Phase 6/17                  | quarantine/expose none/replay same identity                               |
| `site_review_route_duplicate_active_item_total`           |                                                             any | Phase 17                    | hide duplicate/preserve/fix uniqueness                                    |
| `site_review_route_action_denied_only_not_routed_total`   |                                                             any | Site Authorization          | P0 remove route-allowlist coupling/rerun matrix                           |
| `site_review_route_partial_qualification_fallback_total`  |                                                             any | Site IAM                    | end wrong fallback/fix precedence/replay fixtures                         |
| `site_review_route_quorum_or_claim_total`                 |                                                             any | Site Product                | fence/restore one-source-review/require founder amendment                 |
| `site_review_route_sibling_engagement_disclosure_total`   |                                                             any | Phase 17 Security           | remove projection/assess privacy/fix purpose                              |
| `site_review_route_cross_party_engagement_mutation_total` |                                                             any | Phase 17 Security           | restore/fix Party-role predicates                                         |
| `site_review_route_double_source_review_total`            |                                                             any | Site Domain                 | P0 halt/preserve/fix CAS/inspect effects                                  |
| `site_review_route_stale_review_accepted_total`           |                                                             any | Site Publication Security   | P0 block activation/preserve/fix fences/inspect Sites                     |
| `site_review_route_attribution_mismatch_total`            |                                                             any | Site Audit                  | preserve/correct/investigate every review                                 |
| `site_review_route_sibling_actionable_after_end_total`    |                                                             any | Site + Phase 17             | fail closed/reconcile/fix items/counts                                    |
| `site_review_route_unchanged_renotify_total`              |                                                             any | Site + Phase 17             | pause handoff/hide duplicate/fix diff                                     |
| `site_review_route_cross_tenant_exposure_total`           |                                                             any | Security                    | P0 contain/revoke/inspect/fix constraints/RLS                             |
| `site_review_route_public_financial_effect_total`         |                                                             any | Site + Giving/Finance       | P0 contain/restore owner/remove coupling/poison test                      |
| `site_review_route_self_review_floor_bypass_total`        |                                                             any | Site Authorization          | fence action/key/inspect/fix eligibility                                  |
| `site_review_route_comprehension_gate`                    | any pre-Live critical miss; 3 attributable cases/30d after Live | Site Product + UX           | pause/revise/retest before expansion                                      |
| `site_review_route_a11y_gate`                             |                                           any WCAG/Core blocker | Site UX + Accessibility     | block/fix/repeat manual+automated proof                                   |
| `site_review_route_multi_recipient_rate`                  |                         missing or above registered pilot bound | Site Product + UX           | study/improve default/copy or lower cap; never suppress silently          |
| `site_review_route_competing_action_rate`                 |                          >1%/28d, ≥100 multi-recipient episodes | Site Product + UX           | inspect duplicate work; research before claim/presence                    |
| `site_review_route_multi_single_p75_ratio`                |         multi p75 > single by 25% for two 28d windows, each ≥30 | Site Product                | investigate; change guidance/cap only with causal evidence                |
| `site_review_routes_at_max_share`                         |                            >25% for two 28d windows, ≥40 routes | Site Research               | sample Tenants; test genuine coverage vs cap-as-target                    |
| `site_review_route_unqualified_at_use_rate`               |                                      >10%/14d, ≥100 evaluations | Tenant Admin + Site Product | improve setup/permission UX; never auto-grant/remove                      |
| `site_review_route_unrouted_completion_rate`              |                         missing or above registered pilot bound | Site Product + UX           | audit responsibility; improve routing, not authorization/fan-out          |
| `site_review_route_unknown_save_total`                    |                                           any beyond D21 window | Site Platform               | honest state/reconcile command ID/no duplicate edits                      |
| `site_review_route_save_p95_ms`                           |                missing or above registered budget/window/sample | Site Platform               | pause/inspect indexes-batching-locks; never cache authority/weaken checks |

Monitors do not authorize email, reminders, claims, automatic primaries,
broader fallback, or silent cap changes.

## Migration, rollout, rollback, and ruthless synthesis

### Resolved before recording D22

Resolved here: one-person default presentation; max three; unordered equality;
attention-not-authorization; non-exclusive source action; one CAS/one actor;
private peer engagement; D21 lifecycle; zero external effects.

### Must enter future OpenSpec/design/manifest

1. Exact route-management/source-view/source-action/recipient-role/D23 IDs and
   D24 protected-participant predicate.
2. Exact 1–3 invariant and generated maximum `3`.
3. Unordered digest/no-op behavior.
4. Closed resolver algebra and D21 fallback.
5. Source CAS/loser/actor/privacy/end rule.
6. Immutable set/receipt + Phase 17 all-before-any boundaries.
7. Grants/RLS/privileged-path matrix.
8. Full staff/recipient accessible/resilient states.
9. Acceptance IDs, monitors, runbooks, rollout/rollback, proof links.

### Safe order

1. Carry the closed stable Site/Plan/source and D23–D25 contracts forward; then
   carry forward D26/D27's closed availability and one-lane takeover contracts,
   then resolve D28's decline/expiry recovery posture.
2. Register exact Phase 12 management/action capabilities.
3. Add negative readers and dormant immutable structures with grants/RLS.
4. Infer no routes/items; start unconfigured.
5. Prove sole 1–3 command, unordered digest, expected-head CAS.
6. Shadow D21/D22 configured/qualified/winning sets with no items.
7. Prove boundary/race/identity/poison/performance matrices.
8. Add one compatible Phase 17 writer with max 3; keys stay Reserved.
9. Expose Tenant setup then rare Site override behind kill switch.
10. Pass comprehension/a11y/localization/low-bandwidth/noise gates.
11. Canary one writer/bounded Tenants; watch named signals.
12. Activate the compatible D20–D23 generation together.

Rollback stops new occurrences/writer but preserves revisions, receipts, source
reviews, items, engagement, and audit. Repair rolls forward; never truncate or
rewrite. Mixed versions fail closed. Future cap changes use a new version,
preserve history, preview affected routes, and never silently add/remove people.

Only named product/performance signals are monitorable drift. Cross-scope
exposure, overflow/partial release, duplicate/stale source effect, route-as-
allowlist denial, self-review bypass, peer leak, or public/financial effect are
zero-tolerance stop conditions.

No new ADR is required: corrected D22 conforms to ADR-0027. Making the route a
permission group, shared task, quorum, or notification owner would conflict and
require explicit ADR amendment. No current OpenSpec/schema/runtime/ticket/
commit/staging change is authorized by this decision.

## Historical next Grill decision — D23 review independence boundary

D22 decides who receives attention, not whether someone who created or
materially edited the Plan may perform the source review. That rule belongs to
the exact Page, Navigation, publication, and default-change policy.

**Hope example:** Maria creates the French Plan and is selected for attention.
For an ordinary change, she could review if the source policy permits and she
is independently authorized. If protected Navigation, safety-sensitive content,
or the publication policy requires another human, Maria cannot satisfy it;
Ana or another qualified independent person must act.

### Decision candidates

1. **Always require a different person.** Strong universal separation, but
   strands solo/small ministries where the source requires no second human.
2. **Source-owned proportional independence floor — recommended.** The exact
   source policy says when another human is required; Core enforces the
   strictest rule. Otherwise an independently authorized creator/editor may
   act. Tenants may strengthen but never weaken the floor. UI says **You can
   complete this review** or **Someone else must review this change**.
3. **Always permit self-review when authorized.** Lowest friction, but can
   bypass meaningful source-owned independent-review requirements.

**Recommendation: Option 2.** It keeps safety with the domain that understands
the change, never weakens a real independent-review rule, and avoids a second-
person gate where no accepted policy requires one.

Should D23 record that recommended source-owned proportional independence
floor, or would you amend it toward always-different-person or always-permit
self-review?

### D23 closure

The founder selected Option 2. The completed
[D23 adversarial review](./phase-24-d23-source-owned-proportional-independence-adversarial-review.md)
defines exact-action applicability, stable-human conflict, source-owned
participant provenance, prospective policy relaxation, fail-closed unknowns,
recipient filtering, command/CAS evidence, and the staff UX. D24 Option 2 now
resolves the repository's latest-editor versus every-substantive-participant
conflict, as recorded in the
[D24 primary research](./phase-24-d24-every-substantive-participant-primary-research.md)
and [adversarial review](./phase-24-d24-every-substantive-participant-adversarial-review.md).
[D25](./phase-24-d25-candidate-scoped-external-reviewer-adversarial-review.md)
now closes recovery when no qualified internal reviewer remains, with the
authorization boundary governed by
[ADR-0181](../../adr/0181-source-authorized-candidate-scoped-external-review.md).
D26 now closes availability when an internal reviewer is eligible, and D27
closes one source-owned responsibility lane with deliberate takeover. D28 now
closes explicit decline/expiry next-lane recovery; D29 next decides its bounded
recovery-responsibility route.

## Primary source index

- [D22 primary research](./phase-24-d22-co-responsible-reviewers-primary-research.md)
- [HubSpot content approvals](https://knowledge.hubspot.com/website-and-landing-pages/approve-hubspot-content)
- [Microsoft approvals](https://learn.microsoft.com/en-us/power-automate/get-started-approvals)
- [Blackbaud approval tiers](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/fe/content/fe-payment-assistant-settings-tiers.html)
- [GitHub review settings](https://docs.github.com/en/organizations/organizing-members-into-teams/managing-code-review-settings-for-your-team)
- [Contentful entry tasks](https://www.contentful.com/developers/docs/references/content-management-api/entry-tasks/)
- [WAI listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/)
- [WAI combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
- [WCAG labels](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html)
- [WCAG errors](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Subsequent D31 Tasks Hub reconciliation

D22's one-to-three co-responsible reviewers remain a review-attention route,
not a general task-assignee list. D31/ADR-0183 neither copies that roster into
Tasks Hub nor treats “any one may review” as proof of correction
responsibility. Each source-backed task assignment requires its own complete
bounded source-responsibility result plus current action/detail authorization;
recipient projections never inflate one source occurrence into several
business problems.
