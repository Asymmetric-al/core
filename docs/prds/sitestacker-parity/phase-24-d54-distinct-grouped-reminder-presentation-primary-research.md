# Phase 24 D54 — Distinct Grouped Reminder Presentation Primary Research

**Research date:** 2026-08-29

**Founder answer:** **Option 1 — one distinct recipient-specific reminder item,
perceptually and programmatically grouped with the exact request's existing
attention**

**Disposition:** **Accept with required amendments**

**Scope:** local staff Notification Center presentation for the one separately
activated D47–D53 courtesy-reminder source occurrence; grouping, item and group
identity, personal engagement, accessibility, privacy, authorization, RLS,
idempotency, failure, scale, rollout, proof, and one D55 question only

**Explicitly out of scope:** a reminder timing value or activation; a new task;
mutation of the existing task or initial item's engagement; exact final copy;
email, push, SMS, Slack, Teams, Google Chat, digest, escalation, snooze, priority,
deadline, inline access decision, general conversation/threading, schema,
migration, OpenSpec, manifest, runtime, telemetry, or UI implementation

## Executive conclusion

Option 1 is the strongest permanent direction, but only after narrowing
“grouped” into an exact Core contract. A reminder is a distinct meaningful
source descendant, so it needs a distinct recipient-specific notification item
and independent personal engagement. It is still part of the same access-review
triage unit as the initial per-request item, so presenting two unrelated rows
would create avoidable noise and look like duplicate work.

The corrected model is deliberately small:

1. Phase 12 continues to own the single courtesy-reminder source occurrence.
2. Phase 17 may later project one distinct reminder item per exact D49 member.
3. A closed code-owned access-review attention-group contract may correlate
   only that item and the exact D44 per-request initial item for the same Tenant,
   Party, role, surface, continuous recipient generation, and D43 request
   episode.
4. The reminder alone begins unread. The original child's read/unread,
   available time, history, and source applicability do not change.
5. The group contributes at most one unread badge count while preserving both
   child identities and their separate engagement evidence.
6. The existing Tasks Hub task is untouched. No second task, task reminder,
   due date, priority, comment, completion, or reassignment is created.
7. If the exact initial child is absent or no longer presentable, the reminder
   remains a truthful standalone one-child group/row. It never attaches to the
   D44 responsibility-update aggregate or guesses a sibling.
8. D54 creates no current executable or visible artifact. A stable key, group
   contract, manifest row, schema, and UI may appear only in the same later
   activation package that closes D47–D54 and the remaining content/channel
   gates.

This is modern practice in the relevant sense, not a vendor-copy exercise.
Android's official grouping model preserves complete independently useful child
notifications under a stable group key. W3C requires relationships conveyed
visually to remain programmatically determinable. Windows guidance says
notifications need clear intent, should enter the exact task context, and must
avoid enough noise that users disable the channel. GitHub preserves Read,
Unread, Done, and grouping as separate inbox concepts. None of those products
owns Core's source, authorization, grouping key, unread semantics, or copy.

## Exact corrected D54 decision

1. D54 selects one **distinct recipient-specific in-product courtesy-reminder
   item** for each successfully released D49 reminder member.
2. The reminder item is a projection of the already authoritative Phase 12
   reminder source occurrence; it does not create or reinterpret source truth.
3. The reminder item has its own stable semantic key/variant and immutable
   presentation identity. D54 fixes the meaning, not the final identifier
   spelling; the identifier is registered only in a complete activation.
4. The reminder's ordinary meaning is only that the exact access review is
   still waiting and the viewer is currently responsible. It is not a deadline,
   Due/Overdue state, escalation, access change, automatic decision, delivery
   guarantee, fault attribution, or performance judgment.
5. The reminder item uses
   `presentation.source_actionable_then_recent_90d@1` and a key-specific
   applicability/end rule derived from the D43 request, D49 member continuity,
   D51 cancellation fence, current authorization/privacy, and D43 terminal
   state. D52 bounds first release, not later truthful history.
6. The reminder begins with fresh personal unread engagement for that exact
   recipient only. No sibling, peer, group, task, coordinator, requester, or
   Tenant administrator receives or controls that engagement.
7. Creating, replaying, repairing, reading, unread-marking, source-ending, or
   purging the reminder never mutates the D44 initial item's engagement,
   immutable preview, `available_at`, source evidence, or history.
8. The original item is never cloned, replaced, reopened, re-aged, retitled,
   re-timestamped, or reset unread to simulate a reminder.
9. The one existing D43 source-backed Tasks Hub task is never created again,
   completed, reopened, reassigned, reprioritized, dated, reminded, commented
   on, or otherwise mutated by D54.
10. A closed code-owned **access-review attention-group contract** explicitly
    permits exactly two child meanings: the D44 per-request initial item and
    the D54 courtesy-reminder item.
11. This explicit compatibility contract resolves ADR-0027's prohibition on
    arbitrary cross-meaning grouping. Distinct child keys are compatible only
    because their shared group contract proves one purpose, action, privacy
    class, source episode, presentation policy, and triage unit.
12. No generic message thread, conversation, event-stream UI, tenant-defined
    group, title heuristic, URL heuristic, category heuristic, person-name
    heuristic, fuzzy matcher, or cross-contract grouping engine is introduced.
13. One group identity is derived server-side from the exact Tenant, D43
    request episode, recipient Party/role/surface, and continuous D44 recipient-
    generation identity required by D49. Caller input cannot select or rewrite
    it.
14. A group never crosses Tenant, environment, request episode, Party, role,
    surface, recipient generation, privacy class, authorization boundary, or
    registered group-contract revision.
15. The D44 `access_request_responsibility_updated_v1` aggregate is never a
    child of a per-request group because one aggregate may represent multiple
    requests and cannot truthfully supply request-specific engagement.
16. A later-added coordinator who has no exact D44 per-request initial child
    may receive the D54 reminder only if D49 admitted them. The reminder is
    then rendered as a one-child access-review group/row, not attached to the
    aggregate responsibility-update item and not denied merely because an
    earlier presentation child is absent.
17. The logical group has a maximum of two child meanings in this generation.
    Retry cannot add another child of either meaning.
18. Every child remains independently addressable in authorized history and
    audit evidence. Grouping is presentation correlation, not child collapse,
    deletion, content merge, or source merge.
19. The group's unread badge contribution is Boolean: one when at least one
    currently presentable child is unread, otherwise zero. Two unread children
    do not contribute two top-level badge counts.
20. Each child's personal read/unread evidence remains independent. Reading or
    unread-marking one never changes the other.
21. Adding the reminder may move/reopen the group according to the new child's
    immutable availability and actionable state, but never rewrites an earlier
    child's ordering evidence.
22. Top-level group ordering is based on the latest currently presentable
    child's immutable `available_at`, with one stable identity tie-breaker. It
    is never based on `updated_at`, read/unread mutation time, task activity,
    provider state, or browser arrival order.
23. Expanded child history uses a meaningful chronological order with explicit,
    localized timestamps and stable DOM/reading order. Visual indentation,
    color, icons, or proximity alone never convey the relationship.
24. The compact presentation uses one coherent row/card for the request group.
    It communicates the current child meaning, category, one action, update
    count, and unread state without duplicating the task or exposing protected
    details.
25. When two children are present, the collapsed accessible summary conveys the
    equivalent of **Access review is still waiting; 2 updates; 1 unread; Needs
    attention**. Exact copy and grammar localize; the facts and distinctions do
    not.
26. One separately operable disclosure may expose **Show updates**. Expanded
    content is a semantically named ordered list of child occurrences, not a
    chat transcript, comments stream, or nested task list.
27. Merely opening/closing the group, revealing a preview, focusing a row,
    scrolling it into view, receiving Realtime invalidation, or loading it on a
    second device changes no child's read state. Selecting the exact reminder
    child's **Review in People & access** source action may idempotently mark
    only that reminder child read; it never marks the initial child, group,
    task, request, peer, or external channel engaged. A lost/ambiguous response
    reconciles from authoritative engagement without blocking freshly
    authorized source navigation or guessing success.
28. The group and children remain in **Needs attention** while at least one
    child is currently source-actionable, whether read or unread. Read state
    affects the badge, not source-required attention.
29. Individual source-applicability endings remove only the affected child from
    active attention. D51 Off may end the reminder child while the unchanged
    D44 initial child and Tasks Hub task remain active for the pending request.
30. D43 terminal truth ends both active child presentations independently and
    moves still-authorized non-unread evidence through each child's registered
    Recent-history policy. It never fabricates read or group completion.
31. A reminder first released inside D52's half-open interval can remain
    truthful active/history presentation after `useful_until` while D43 and the
    registered applicability rule allow. An unreleased child at or after the
    upper boundary never appears.
32. Current recipient, assignment, purpose, Tenant, role, source visibility,
    and capability are re-proved before list, count, search, render, group
    expansion, engagement mutation, Realtime response, support view, repair,
    and destination resolution.
33. A typed code-owned destination resolves server-side to the current
    authorized People & access request detail. Raw URLs, return URLs, external
    URLs, and caller-authored route fragments are rejected.
34. Selecting the item never performs Keep, Remove, Withdraw, or any other
    consequential access action. It only navigates to a freshly authorized
    source surface where actions reauthorize independently.
35. When the viewer no longer has detail access, the destination fails closed
    without revealing whether another Tenant, holder, capability, group,
    requester, or request exists. A separately authorized lane fallback may be
    used only when its meaning is truthful and non-enumerating.
36. Notification and group persistence, foreign keys, unique constraints,
    queries, caches, counts, views/functions/RPCs, RLS, grants, Realtime,
    service-role paths, support, exports, and purge all preserve the same exact
    Tenant and recipient boundary.
37. `tenant_id`, source identity, recipient Party/role/surface/generation,
    group contract, stable child key, actor, and audit attribution are derived
    from trusted server/source context. A client cannot author them.
38. Mutation policies require both `USING` and `WITH CHECK` protection where
    applicable so an allowed engagement update cannot move a row across a
    Tenant, recipient, source, group, role, or surface boundary.
39. Product-database uniqueness owns semantic idempotency. Inngest, Realtime,
    browser retries, provider ids, timestamps, and transport-deduplication
    windows do not.
40. A conflicting reuse of an item or group identity with changed immutable
    input fails hard, leaves the earlier truth unchanged, and enters one typed
    repair path.
41. Source occurrence, projection intent, work claim, child item, group
    correlation, engagement, and audit evidence have explicit independent
    states. Partial success is visible and retryable without inventing another
    business effect.
42. Realtime carries identifier-only invalidation and never presentation
    content, protected source facts, or authority. Missed/out-of-order events
    recover from the product read model and stable cursor.
43. Safe preview contains no holder/requester name, request reason, decision
    explanation, capability, group/source provenance, continuity history,
    authority evidence, precise sensitive location, raw identifier, contact
    detail, or peer engagement.
44. The compact group does not use an avatar, remote image, tracking resource,
    decorative animation, or person-shaped sender treatment. The event comes
    from Asym/source state, not a person sending a message.
45. Ordinary copy never says **ignored**, **late**, **overdue**, **escalated**,
    **failed to act**, or an equivalent blame/performance inference. It does not
    expose request age or the D50/D52 internal clock.
46. The relationship and state are conveyed with semantic list/heading/
    description structure, meaningful text, programmatic names, and non-color
    indicators. ARIA supplements native semantics only when necessary.
47. The row, disclosure, child list, action, unread controls, and status work by
    keyboard with visible focus, logical reading/focus order, no focus theft,
    and programmatically announced asynchronous status where applicable.
48. The presentation reflows without lost information or function at a 320 CSS
    pixel viewport equivalent/400% zoom, uses WCAG 2.2 AA target sizing or
    spacing exceptions correctly, supports forced colors/reduced motion, and
    does not require hover or two-dimensional scrolling.
49. Copy, counts, times, and relationships support long localization, plural
    rules, CJK, RTL/bidirectional isolation, locale-aware dates, and logical
    layout without changing source time.
50. Mobile and low-bandwidth behavior loads a compact safe first page, does not
    require images to understand state, preserves explicit retry/offline/error
    states, and never lets a stale cache authorize an action.
51. Notification lists use Phase 17 keyset pagination and batched source/group
    projections. Grouping must not introduce per-row source/provider queries,
    an unbounded child fetch, or offset-dependent ordering.
52. No arbitrary latency, page-size, volume, or universal fatigue threshold is
    invented by D54. Activation records measured production-shaped budgets and
    blocks any query whose cost grows per group or whose plan loses required
    Tenant/recipient indexes.
53. Rollout is additive and deny-first: compatible schema/readers first,
    projection writer shadow proof without visible items, one active writer,
    then the exact activated key/group contract. There is no historical
    backfill or current-work unread wall.
54. Mixed versions never render the reminder as the initial item, drop a child
    into another group, count the same group twice, or mutate engagement. An
    unsupported new key remains nonpresentable while source/audit truth stays
    intact.
55. Disable/rollback may stop new reminder projection and hide incompatible
    presentation, but cannot delete source/audit history, alter the initial
    child/task, or free an immutable identifier for reuse.
56. D54 itself is documentation only. It creates no notification key, group-
    contract identifier, item, row, policy, renderer, preference, plan, channel,
    worker, schema, migration, OpenSpec requirement, UI, metric, or feature flag.
57. The future activation must register the exact stable reminder meaning,
    group compatibility, safe facts, destination, presentation policy, source-
    end predicates, retention, authorization, privacy, accessibility, load,
    repair, migration, and release evidence in Phase 12/17/6 and OpenSpec.
58. The existing hardcoded bell dropdown is replaced or adapted only through
    the Phase 17 implementation; its fake avatars, **8 New**, fake actions, and
    dot are not a design, data, or accessibility precedent.
59. The implementation reuses Core's `base-maia` Base UI primitives, shared
    semantic CSS variables, Zinc-oriented design language, Lucide icons where
    useful, and shared `packages/ui` ownership. It introduces no alternate
    primitive or design system.
60. Exact recipient-facing title/body/action copy remains a separate decision.
    D54 nevertheless closes engagement mechanics: passive presentation never
    reads anything, selecting the exact reminder source action may idempotently
    read only that reminder, and explicit Mark read/unread remains exact-child
    personal engagement. D55 instead decides urgent safety withdrawal.

## Research method and evidence labels

- **Verified repository fact:** directly observed in the current Core checkout
  or its accepted ADR/OpenSpec/PRD contracts.
- **Verified external fact:** directly stated by a current official first-party
  specification, product documentation, or design system.
- **Requirement inference:** necessary to make D54 compatible with governing
  Core boundaries and the verified facts.
- **Product judgment:** the smallest safe Core-specific choice among viable
  alternatives.
- **Assumption:** plausible but not established for representative nonprofit
  mission ministries.
- **Unresolved unknown:** must be settled by a later founder/research/release
  gate; it is not silently guessed here.

External examples are comparative evidence only. Core imports no vendor's
group key, timing, unread transition, retention period, component, badge count,
copy, action, analytics, notification frequency, or task model.

## Verified repository facts

| Repository source                                                                                                                  | Verified current fact                                                                                                                                                                                                                                                                | D54 consequence                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| [ADR-0027](../../adr/0027-one-notification-presentation-and-engagement-model.md)                                                   | Notification items are role-safe projections, not source/task/delivery truth. It owns two closed presentation policies, exact personal engagement, typed destinations, attention groups, one unread group count, keyset-paginated staff surfaces, and current authorization reproof. | D54 extends the existing bounded item/group model; it does not create a second feed or task model. |
| [ADR-0183](../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md)                                                 | One D43 source-backed task remains separate from notification engagement; D53 forbids reminder task fields/duplicates.                                                                                                                                                               | D54 can add only a notification child; task state is untouchable.                                  |
| [ADR-0184](../../adr/0184-direct-and-governed-group-capability-assignment.md)                                                      | D43–D53 define request source, D44 current responsibility, D48 prospective admission, D49 sealed recipients, D50 eligibility, D51 cancellation, D52 usefulness, and D53 evidence/activation.                                                                                         | Presentation consumes these facts and may only narrow; it cannot derive or repair them.            |
| [Phase 17 PRD](./phase-17-system-messages-template-management.md)                                                                  | An attention group is one producer episode/triage unit; item policy remains child-level; a group contributes one badge count and remains Needs attention while an actionable child exists.                                                                                           | D54 must use one explicit compatible group contract and preserve child engagement.                 |
| [Phase 17 manifest](./phase-17-system-message-executable-manifest.md) and [census](./phase-17-system-message-census-2026-07-19.md) | D44 keys are planning candidates/Reserved; D46–D53 add no reminder key or runtime artifact.                                                                                                                                                                                          | D54 remains documentary; activation must add exact generated/validated contracts together.         |
| [Workflow orchestration OpenSpec](../../../openspec/specs/workflow-orchestration/spec.md)                                          | Product records, claims, and dispatch ledger own truth; Inngest uses tenant-bound identifier-only envelopes and retry re-reads product state.                                                                                                                                        | Worker runs cannot own grouping, item identity, unread, or deduplication.                          |
| [Identity and access OpenSpec](../../../openspec/specs/identity-and-access/spec.md)                                                | Identity/Tenant/role resolve server-side; application authorization and RLS enforce Tenant isolation; UI hiding is not authorization.                                                                                                                                                | List/count/open/mutate/repair paths all reauthorize and fail closed.                               |
| [Core frontend rules](../../ai/rules/frontend.md) and [`packages/ui` instructions](../../../packages/ui/AGENTS.md)                 | Shared UI is Base UI with `base-maia`, semantic tokens, shared primitives, keyboard/a11y/responsive proof, and no alternate component system.                                                                                                                                        | Any later group row/disclosure must fit the existing Core product language.                        |
| [`components.json`](../../../packages/ui/components.json)                                                                          | `style: base-maia`, Zinc base color, CSS variables, Lucide, and shared aliases are current configuration.                                                                                                                                                                            | Vendor components/pattern code are not copied into Core.                                           |
| Current bell block                                                                                                                 | `packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx` is a hardcoded demo with fake people, remote avatars, **8 New**, fake actions, and a visual dot.                                                                                                             | It is migration input only and cannot validate D54 UX, data, unread, privacy, or a11y.             |

## Current official external evidence

| Official source                                                                                                                                                                                 | Verified fact                                                                                                                                                                                                 | What it supports                                                                                                              | What it does not decide for Core                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| [W3C WCAG 2.2 — Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)                                                                                | Structure/relationships conveyed by presentation must be programmatically determinable or available in text; native headings/lists and labelled grouping are sufficient techniques.                           | The visual request grouping needs semantic structure and textual relationship, not indentation/color alone.                   | Exact DOM, ARIA attributes, group identity, or copy.                                                     |
| [W3C WCAG 2.2 — Status Messages](https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html)                                                                                              | Status changes that do not move focus must be exposed programmatically; assertive alerts for nonurgent information are inappropriate.                                                                         | Read/result/error updates need polite, non-focus-stealing feedback.                                                           | Core's exact engagement transition or receipt model.                                                     |
| [W3C WCAG 2.2 — Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)                                                                                                                | Ordinary content must work at a 320 CSS-pixel equivalent without two-dimensional scrolling or lost function.                                                                                                  | A single-column compact group/timeline must survive mobile and 400% zoom.                                                     | Component dimensions beyond the standard.                                                                |
| [W3C WCAG 2.2 — Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)                                                                                      | Pointer targets meet the 24-by-24 CSS-pixel minimum or an allowed spacing/equivalent exception.                                                                                                               | Disclosure, action, and engagement controls need reachable touch geometry.                                                    | Core's visual density or a larger unsupported minimum.                                                   |
| [W3C WCAG 2.2 — Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)                                                                                                    | Color cannot be the only visual means of conveying information or prompting a response.                                                                                                                       | Unread/group/current state needs text/semantics in addition to any dot/token.                                                 | A specific color.                                                                                        |
| [Android — Create a group of notifications](https://developer.android.com/develop/ui/views/notifications/group)                                                                                 | Related complete notifications may be grouped under a stable group identifier; each child should remain independently useful; explicit grouping is more predictable than device-dependent automatic grouping. | A stable code-owned group with preserved child meaning is a mature pattern.                                                   | Android APIs, summary-notification duplication, or system-tray behavior for Core's web center.           |
| [WHATWG Notifications API](https://notifications.spec.whatwg.org/)                                                                                                                              | A notification represents something that happened; `tag` can replace the same conceptual notification; direction/language are explicit; actions should also exist in the application.                         | Occurrence identity, replacement versus distinct meaning, internationalization, and in-app action parity must be intentional. | Core should use Web Notifications, tags, push, or replacement for two distinct occurrences.              |
| [Microsoft — Notifications design basics](https://learn.microsoft.com/en-us/windows/apps/develop/notifications/app-notifications/app-notifications-ux-guidance)                                 | Notifications need clear intent, should not create extra work/noise, should open in the selected notification's context, and should leave a predictable Notification Center.                                  | One coherent request group, one contextual action, and noise restraint.                                                       | Windows toast components, automatic clearing, or Core engagement semantics.                              |
| [GitHub — Managing notifications from your inbox](https://docs.github.com/en/subscriptions-and-notifications/how-tos/viewing-and-triaging-notifications/managing-notifications-from-your-inbox) | GitHub exposes grouping plus distinct Read, Unread, Done, Save, and Unsubscribe concepts; read is not task completion.                                                                                        | Engagement and workflow state should not collapse into one Boolean.                                                           | Core's group cardinality, automatic-read trigger, Done/archive behavior, or retention.                   |
| [Confluence — View your notifications](https://support.atlassian.com/confluence-cloud/docs/view-your-notifications/)                                                                            | Confluence exposes a notification drawer, an unread-only view, and explicit mark-unread behavior.                                                                                                             | Unread is a personal triage state that remains useful after an item exists.                                                   | Source actionability, required-item archive rules, or request grouping.                                  |
| [Sanity — Meet the Dashboard](https://www.sanity.io/docs/dashboard/dashboard-introduction)                                                                                                      | A CMS can provide one organization-centered notification panel for comments/tasks across its product surfaces.                                                                                                | A central center is a comparable content-operations pattern.                                                                  | Combining tasks with notifications or sharing their engagement model.                                    |
| [Microsoft Entra — Create an access review](https://learn.microsoft.com/en-us/entra/id-governance/create-access-review)                                                                         | Access reviews distinguish initial reviewer email, reminders, review status, and contacted-reviewer evidence; midpoint reminders can be sent even when a reviewer has acted.                                  | Identity-governance products treat reminders as separate occurrences/evidence.                                                | Entra's due dates, midpoint, email default, or post-decision reminder behavior; those conflict with D43. |
| [Next.js — Authentication](https://nextjs.org/docs/app/guides/authentication)                                                                                                                   | Sensitive authorization should use secure checks in a centralized data-access layer rather than optimistic UI/route checks alone.                                                                             | The typed deep link must reauthorize at the destination.                                                                      | Core's capability name or database shape.                                                                |
| [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)                                                                                          | Grants and RLS are separate; exposed tables need both; service role bypasses RLS and must stay server-side.                                                                                                   | Every notification/group/engagement path needs least grants, policies, and privileged-path parity.                            | RLS as the only authorization layer.                                                                     |
| [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) and [Row Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)                       | Unique/foreign-key/check constraints enforce row invariants; enabled RLS with no applicable policy is default-deny.                                                                                           | Composite tenant-aware identity and deny-first policies can make invalid grouping harder.                                     | Exact schema/index names before implementation design.                                                   |
| [OWASP — Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)                                                                                          | Least privilege, deny by default, validation on every request, safe failure, logging, and authorization tests are recommended.                                                                                | List/open/mutate/support paths cannot trust earlier checks.                                                                   | Core's source-specific access decision.                                                                  |
| [OWASP — Unvalidated Redirects and Forwards](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)                                                | Prefer a short code/ID mapped server-side to a destination; untrusted URLs enable phishing and authorization bypass.                                                                                          | Use a typed destination and server resolver, never raw notification URLs.                                                     | Which current authorized fallback Core should show.                                                      |

### Comparable-system synthesis and limits

- **IAM:** Entra verifies that initial attention, reminders, reviewer identity,
  and delivery evidence are distinct. It is a poor source for Core's time or
  action semantics because Entra reviews have real review periods and can send
  midpoint reminders after a reviewer acted.
- **Work systems:** GitHub/Confluence verify durable inbox triage, grouping,
  and independent read/unread controls. They do not prove that opening a Core
  request should mark a reminder read or that read means work complete.
- **CMS:** Sanity verifies the usefulness of a central organization-scoped
  notification surface across content applications. It does not authorize a
  combined task/notification ledger.
- **Platform notification systems:** Android/Windows/WHATWG verify stable
  occurrence identity, deliberate grouping/replacement, contextual actions,
  and noise reduction. Their system-tray APIs and clearing rules are not Core's
  product model.

No current official source states that “one distinct grouped reminder item” is
a universal best practice. The conclusion is a **Core product judgment** that
combines separately verified occurrence, grouping, accessibility, authorization,
and noise principles with Core's governing ADRs.

## Current behavior, D54 intent, and best permanent path

| Area                    | Current repository behavior                                                                                                                        | D54 intended behavior after full activation                                                                                                 | Best permanent path                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Reminder source         | No active D43 reminder runtime/key/UI; D46–D53 are documentary gates.                                                                              | Consume one D47–D53-admitted source occurrence and D49 member.                                                                              | Keep all eligibility/cardinality/time/cancel/usefulness truth in Phase 12.                                             |
| Initial local attention | D44 plans a per-request required item for recipients at request creation and a separate coalesced responsibility-update item for later admissions. | Correlate the reminder only with the exact per-request child when one exists.                                                               | Explicit two-child group compatibility; never unpack the aggregate.                                                    |
| Tasks Hub               | One source-backed task per responsible coordinator/request.                                                                                        | No change.                                                                                                                                  | Preserve task identity/status/engagement and source ownership.                                                         |
| Notification Center     | Phase 17 is specified, but current staff bell is hardcoded demo UI.                                                                                | One compact request group with independent child history and one badge contribution.                                                        | Implement through Phase 17 shared Base Maia surfaces, not the demo block.                                              |
| Read/unread             | ADR-0027 owns personal child engagement.                                                                                                           | Reminder alone begins unread; passive presentation never reads; selecting its exact source action may idempotently read only that reminder. | Preserve explicit exact-child Mark read/unread and reconcile ambiguous action responses from authoritative engagement. |
| Grouping                | Phase 17 permits one genuine producer episode/triage unit and prohibits arbitrary cross-boundary grouping.                                         | One explicit access-review group contract permits initial+reminder child meanings.                                                          | Code-owned compatibility and server-derived exact group identity.                                                      |
| Deep link               | D44 uses a typed authenticated Phase 12 destination.                                                                                               | Reminder reuses the purpose-compatible typed destination after fresh authorization.                                                         | Server map code to route; deny safely; never persist raw URLs.                                                         |
| Channels                | D45 initial email is independent; reminder channel is unregistered.                                                                                | Local item only for D54.                                                                                                                    | Admit each future external channel separately without changing local/source truth.                                     |
| Scale                   | Phase 17 requires keyset pagination and no per-row provider queries.                                                                               | Bounded two-child groups, Boolean group unread, one paginated row.                                                                          | Indexed composite identities, batched read model, property/load proof.                                                 |

## Problem validity and strongest alternative

The root problem is not “we need another notification.” It is that one separately
earned courtesy occurrence must create useful local attention without looking
like duplicate work or lying about prior engagement. D44's original item may
already be read while its source remains actionable. Resetting it would falsify
history; creating an unrelated row would make one request look like two jobs;
creating another task would duplicate work.

The strongest alternative is **no new in-product item**: retain the source
occurrence only for separately approved external channels. That is simpler and
quieter. It loses dependable local recovery whenever email/push/chat are Off,
unavailable, suppressed, or never built, and it turns optional transports into
the only visible effect of a product-level timing policy. Given that D47's
evidence gate must first prove the reminder useful and D54 bounds it to one
occurrence, a distinct locally grouped child is the more coherent permanent
path.

The selected answer is invalid without the amendments above. In particular,
“group by request” alone is too vague: it would permit cross-Tenant collisions,
wrong-recipient coupling, aggregate-item corruption, visual-only grouping,
mutable unread history, or a generic thread engine.

## UX/UI contract

### Compact state

The Notification Center presents one request group, not two peer rows. The
latest currently actionable child supplies the primary semantic summary. With
both children present, the row communicates:

```text
Access requests
Access review is still waiting
2 updates · 1 unread
[Review in People & access]  [Show updates]
```

This is a semantic wireframe, not frozen final copy or component markup. The
action and disclosure are sibling controls, never nested interactive elements.
There is no avatar, holder/requester name, request reason, age badge, countdown,
Due/Overdue chip, priority, inline decision, or task checkbox.

### Expanded state

**Show updates** reveals a named ordered list in chronological order:

```text
Updates for this access review
1. Access review needs attention — read — localized initial-item time
2. Access review is still waiting — unread — localized reminder time
```

The group summary and child list expose equivalent relationships to visual,
screen-reader, keyboard, forced-colors, high-zoom, RTL, and touch users. A
visual connector or indentation may reinforce—but never own—the relationship.
Expansion alone does not mark either child read and does not move focus unless
the user explicitly navigates.

### One-child state

When the exact initial child was never created for this recipient, is no longer
presentable, or is outside authorized recent history, no empty “earlier update”
placeholder appears. The reminder remains one truthful row in the same
access-review group family. It never attaches to a responsibility-update
aggregate or fabricates that the person was previously notified.

### Source-ended and unavailable states

- D51 Off may end the reminder child while the initial child remains actionable;
  the group stays in Needs attention because the request is still pending.
- D43 terminal truth ends active presentation for both children. Authorized
  recent history may remain without unread debt or fake completion.
- Authorization loss removes the group from active and recent presentation.
  The destination and cached preview fail closed without protected explanation.
- Projection or network failure shows one quiet, persistent retry/error state;
  it never creates a toast storm, spinner-only dead end, or weaker authorization
  path.

## Domain model, ownership, and invariants

### Canonical D54 terms

- **Access-review attention group:** a presentation-only correlation of the
  exact allowed notification children for one Tenant, current recipient
  continuity, surface, and D43 request episode. It is not a source request,
  task, conversation, delivery, or shared engagement record.
- **Courtesy-reminder item:** the distinct recipient-specific Phase 17 child
  projected from one released D49 member. It has independent engagement and no
  source/access/deadline consequence.
- **Group compatibility contract:** the immutable code-owned allow-list of
  child meanings, purpose, action, privacy class, presentation policy, and
  source relationship permitted to share one attention group.
- **Group unread contribution:** the derived Boolean that contributes one bell
  count when any currently presentable child in the group is unread.

### Ownership matrix

| Fact                                              | Authoritative owner                                               | Allowed projection                      | Explicit non-owners                               |
| ------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------- |
| Request episode/actionability/terminal truth      | Phase 12 D43 source                                               | lane, task, notifications, audit        | group, child unread, task engagement, worker      |
| Reminder eligibility/occurrence/cancel/usefulness | Phase 12 D47–D53 source contract                                  | identifier-only projection intent       | Phase 17, task, provider, browser, Inngest        |
| Reminder recipient member                         | D49 sealed cohort plus fresh current narrowing                    | one Phase 17 child                      | group query, task assignee, another channel       |
| Initial notification item                         | D44/Phase 17 stable child contract                                | group child, authorized recent history  | reminder, group aggregate                         |
| Reminder notification item                        | D54/Phase 17 stable child contract                                | group child, authorized recent history  | initial child, task, external channel             |
| Group compatibility/identity                      | Phase 17 code contract plus server-derived source/recipient tuple | list/read-model correlation             | title, URL, category, client, Tenant config       |
| Personal engagement                               | exact recipient/item engagement owner                             | child state and derived group unread    | source, group shared state, task, peer, admin     |
| Group unread/count/order                          | deterministic Phase 17 derivation                                 | cached/query projection with validation | mutable counter as authority, Realtime, analytics |
| Tasks Hub work                                    | ADR-0183 task projection                                          | My Tasks/read model                     | notification item/group/unread                    |
| Destination authorization                         | Phase 12 current source and IAM data-access layer                 | typed safe navigation result            | persisted URL, preview, browser route guard       |
| Execution/retry                                   | product work claim/dispatch ledger; replaceable worker            | traces and same-effect retry            | semantic uniqueness, source time, engagement      |
| Provider/channel evidence                         | later exact adapter/provider                                      | operations evidence                     | local item/group/source/unread                    |

### Non-negotiable invariants

1. One D43 request episode has zero or one Phase 12 reminder occurrence.
2. One released D49 recipient member has zero or one reminder item.
3. One access-review attention group has at most one initial per-request child
   and one reminder child in this generation.
4. A group identity never crosses Tenant, recipient continuity, role, surface,
   source episode, privacy class, or group-contract revision.
5. Grouping never mutates, replaces, merges, or deletes a child.
6. The reminder is the only new child and the only child eligible for fresh
   unread because of D54.
7. Group unread is derived from presentable child engagement and contributes
   zero or one badge count.
8. Source actionability and personal unread are independent.
9. The initial item, reminder item, and Tasks Hub task have independent identity
   and engagement/lifecycle truth.
10. The responsibility-update aggregate never becomes a per-request child.
11. The typed destination never carries authority and performs no access change.
12. All protected visibility and mutations reauthorize against current
    same-Tenant source/recipient facts.
13. Product uniqueness, not transport or UI timing, makes release/retry
    idempotent.
14. D51/D52 may prevent/end reminder presentation without changing the initial
    item, task, or D43 request.
15. Current/runtime absence remains truthful until full activation.

## Lifecycle and transition matrix

| Current state/event                   | Initial child                            | Reminder child                                         | Group                                                             | Task/source                                         |
| ------------------------------------- | ---------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| No activated timing profile           | Existing D44 behavior only               | Absent                                                 | Existing behavior only                                            | Unchanged                                           |
| D48-admitted request opens            | One D44 child for then-current recipient | Not yet eligible                                       | One-child group/row permitted                                     | One task; request pending                           |
| Initial child read                    | Read                                     | Absent                                                 | Still Needs attention; no unread contribution if no other unread  | Unchanged                                           |
| D49 occurrence releases in D52 window | Preserved exactly                        | One new unread child                                   | Same exact group reopens/moves; one unread badge contribution     | Unchanged                                           |
| Retry/reordered materialization       | Preserved                                | Same identity/result                                   | Same group; deterministic order                                   | Same occurrence/task                                |
| Passive expand/collapse               | Preserved                                | Preserved                                              | View state only                                                   | Unchanged                                           |
| Exact reminder source action selected | Never implicitly changed                 | Only exact reminder may idempotently transition read   | Derived unread recomputes                                         | Request reauthorizes; task/source remain unchanged  |
| D51 Off wins before release           | Preserved                                | Never released                                         | Existing initial-only group                                       | Request/task unchanged                              |
| D51 Off wins after release            | Preserved                                | Active applicability ends; truthful history may remain | Recomputed from surviving active child                            | Request/task unchanged                              |
| D52 upper bound before release        | Preserved                                | Terminal no-release                                    | No reminder-induced change                                        | Request/task unchanged                              |
| D52 upper bound after release         | Preserved                                | Remains under ordinary applicability/history           | No expiry toast/countdown                                         | Request/task unchanged                              |
| D43 request terminal                  | Active presentation ends                 | Active presentation ends                               | Leaves Needs attention; authorized history follows child policies | Task derives terminal result                        |
| Recipient authorization loss          | Not presentable                          | Not presentable                                        | Not presentable/count zero                                        | Source remains; task visibility separately narrows  |
| Recipient later regains authority     | Old child does not revive                | No D49 replacement/replay                              | No revived group from old engagement                              | New source generation only if separately authorized |

Forbidden transitions include reminder → initial replacement, group expansion →
read, group read → both children read without a later explicit contract,
notification engagement → task/source completion, route repair → new reminder,
provider event → local read, and Tenant switch → engagement transfer.

## Race, failure, and recovery matrix

| Race/failure                                          | Safe result                                                                                                                                                                       | Permanent mechanism                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Reminder release vs D51 Off                           | Exactly the already ratified source winner; Off-first no child, release-first one historically truthful child whose applicability may end.                                        | Source lock/claim and cancellation epoch; projection consumes committed result.       |
| Reminder release vs D43 terminal                      | No active reminder unless the complete current source claim wins while actionable; terminal recheck ends stale presentation.                                                      | Product claim plus query-time source ceiling.                                         |
| Two workers/replays                                   | One child/group correlation, same receipt; changed immutable input hard-conflicts.                                                                                                | Composite uniqueness and idempotent product claim.                                    |
| Initial projection delayed beyond reminder            | Reminder may appear as one-child group; later same initial child can join in immutable time order without changing reminder engagement.                                           | Stable independent child identities and deterministic sorting.                        |
| Realtime arrives before DB visibility or out of order | Client invalidates/refetches; no content/authority in event and no fabricated state.                                                                                              | Identifier-only event, product DB authority, cursor recovery.                         |
| Group read model/cache stale                          | Query-time authorization/source ceilings omit forbidden child/group; stale cache cannot authorize action.                                                                         | DAL checks, RLS, typed refetch, cache scoping/invalidation.                           |
| Read mutation response lost                           | D54 requires an idempotent exact-child mutation and authoritative refetch; navigation may continue after fresh authorization, with no guessed read, second child, or task effect. | Expected engagement identity/head, durable receipt, and lost-response reconciliation. |
| Deep link target resolved/removed/unauthorized        | Deny or truthful authorized lane/current-state fallback without protected existence disclosure.                                                                                   | Typed server destination resolver plus current authorization.                         |
| Purge worker late                                     | Query ceiling hides expired/unpresentable preview; durable minimized audit remains under separate policy.                                                                         | Read-path ceiling independent of purge completion.                                    |
| Old reader sees new key                               | New item stays nonpresentable or uses a proved compatible reader; never masquerades as initial.                                                                                   | Additive schema, registry compatibility, activation sequencing.                       |
| New reader before writer cutover                      | No reminder row means no reminder UI; existing D44 behavior remains complete.                                                                                                     | Readers first, one writer last, no placeholder.                                       |

## Authorization, database, RLS, and privacy requirements

D54 does not choose a table layout. Any implementation must nevertheless make
invalid cross-boundary relationships impossible at the database seam rather
than relying on UI convention:

- every child/group/engagement relation carries or joins through tenant-aware
  composite keys; a same-shaped ID from another Tenant cannot relate;
- child type/group-contract compatibility, maximum child cardinality, immutable
  identity, and required non-null source/recipient revisions are constrained or
  admitted through one authoritative mutation boundary;
- deletes do not cascade away durable source/audit evidence or another child's
  engagement; presentation purge is distinct from business/audit retention;
- list/count/select policies use exact current recipient and active Tenant
  predicates; engagement updates protect the old row with `USING` and the new
  row with `WITH CHECK` so immutable ownership cannot be transformed;
- views, functions, RPCs, Realtime publications, support tools, exports, repair,
  and service-role/background paths reproduce the same application
  authorization and Tenant predicates; RLS is defense in depth, not the only
  check;
- logs/traces use opaque identifiers, result codes, counts, and latency only—no
  safe preview, reason, person, capability, source detail, or deep-link token;
- group summaries never expose another recipient's child/read state, and a
  Tenant administrator cannot inspect personal engagement merely because they
  manage the cadence or Delivery Plan.

## Scalability and performance posture

The group is bounded to two children, so D54 does not justify a general thread
store, recursion, arbitrary aggregates, full conversation hydration, or a new
search index. The Phase 17 list remains keyset-paginated. One page query returns
authorized group summary facts and safe previews in bounded batches; expanding
one group fetches at most its two permitted children. Badge/count computation
uses the same current source/recipient ceilings and cannot count raw stale rows.

Activation proof must include production-shaped multi-Tenant data with skewed
large Tenants, many read/unread/source-ended combinations, denied rows, late
purge, and concurrent writes. D54 deliberately invents no universal p95 or
page-size number. The activation package records the real repository SLO and
fixture cardinalities, then proves:

- list/count query count does not grow with the number of groups on one page;
- query plans use the intended Tenant/recipient/presentability/order indexes and
  do not perform an unbounded sequential scan;
- cursor order is stable under concurrent read/unread and new-child writes;
- child expansion is bounded at two and returns no provider/source N+1 fetch;
- payload remains linear in requested page size and independent of hidden
  cross-Tenant rows; and
- low-bandwidth state remains usable without remote media or Realtime.

## Migration, rollout, rollback, and upgrade posture

1. Keep current runtime unchanged while D54 remains planning.
2. In the eventual activation, add compatible immutable registry/group
   contracts and database constraints before any producer can emit the child.
3. Deploy readers that safely ignore an unsupported reminder key/group version.
4. Shadow-compare exact recipient/group/count/order results without exposing a
   shadow item or changing engagement.
5. Enable exactly one projection writer only after source, manifest, OpenSpec,
   RLS, privacy, a11y, load, and mixed-version proofs pass.
6. Create reminders only from post-D48 admitted live source occurrences. Never
   backfill historical/current requests or synthesize original unread state.
7. A release control may only narrow new projection and must have owner/removal
   criteria. It cannot become source or grouping truth.
8. Roll back by stopping new projection and keeping compatible reads/decoders;
   do not delete committed child/source/audit truth or mutate the initial item.
9. Retire via a successor contract while retaining historical decoding and
   immutable group/child identities.

## Ruthless 22-category adversarial review

All 22 categories have a material concern under the unamended phrase “distinct
grouped reminder.” The table supplies every requested concern field: failure,
importance, severity, likelihood, evidence, decision effect, permanent fix,
and exact language/proof.

|   # | Category / material concern                             | What could go wrong and why it matters                                                                                                                  | Severity / likelihood                            | Evidence or reasoning                                                                                           | Effect on answer                                                         | Permanent fix                                                                                                                 | Exact language / proof to add                                 |
| --: | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
|   1 | Problem validity, necessity, alternatives — **Yes**     | Another local item may duplicate D44 attention without improving recovery; no-build could be better.                                                    | High / Medium until D47 passes                   | D44 already supplies lane, task, and initial item; Windows warns noisy notifications cause channel disablement. | Narrows, not invalidates: D54 is contingent on D47/full activation.      | Compare full no-reminder baseline and keep Off/no-build valid.                                                                | D54 rules 1–2, 56–57; D54-RAC001, RAC059–060.                 |
|   2 | Brittleness — **Yes**                                   | Grouping by title, URL, time, category, or display name breaks under localization, route change, renamed people, retries, and migrations.               | Critical / High without a contract               | ADR-0027 requires exact identity; Android uses stable group identifiers; W3C requires preserved relationships.  | Changes naive grouping into a closed typed contract.                     | Server-derived group identity and exact compatibility allow-list.                                                             | Rules 10–17, 36–40; RAC003–010, RAC032–038.                   |
|   3 | Technical debt — **Yes**                                | A generic thread/conversation engine, duplicated notification stack, or child-content merge creates abstractions Core does not need.                    | High / High if “thread” is implemented literally | Core already has bounded attention groups and Base Maia UI; group has only two meanings.                        | Rejects general threading while accepting bounded correlation.           | Extend Phase 17 group policy; no new engine/library/store.                                                                    | Rules 12, 17–18, 51, 58–59; RAC005, RAC054–055.               |
|   4 | Edge cases — **Yes**                                    | Missing/delayed initial child, later coordinator, Off/terminal races, absent authorization, and late purge can create empty/broken/wrong groups.        | High / High                                      | D44 aggregate and D49 cohort differ; D51/D52 explicitly create race boundaries.                                 | Requires one-child behavior and source-specific endings.                 | Deterministic independent children, no aggregate attachment, query ceilings.                                                  | Rules 15–16, 29–35, 41–42; RAC010, RAC024–033, RAC039–041.    |
|   5 | Footguns — **Yes**                                      | A developer may reset the original unread/timestamp, mark both children read, create another task, or treat expansion as engagement.                    | Critical / High absent negative rules            | ADR-0027 separates engagement; ADR-0183 separates task; W3C distinguishes focus/status.                         | Adds explicit prohibitions.                                              | Immutable child engagement; only the exact reminder source action may idempotently read that child; passive views do nothing. | Rules 6–9, 19–27; RAC011–020, RAC042–043.                     |
|   6 | Tenant safety — **Yes**                                 | A group key lacking Tenant/recipient/surface may mix items or badge counts across organizations/roles.                                                  | Critical / Medium                                | Core OpenSpec makes Tenant the product boundary; Phase 17 has no global feed.                                   | Requires exact Tenant-aware group identity and every-path reproof.       | Composite boundaries in DB, query, cache, Realtime, support, exports.                                                         | Rules 13–14, 32, 36–38; RAC007–009, RAC034–041.               |
|   7 | Database, RLS, authorization — **Yes**                  | Caller-owned tenant/group/actor fields, weak FKs, missing `WITH CHECK`, unsafe views/RPCs, or service-role bypass can move/read rows across boundaries. | Critical / Medium                                | Identity OpenSpec, Supabase grants/RLS, PostgreSQL default-deny, OWASP every-request authorization.             | Makes data design a release blocker, not a UI detail.                    | Server derivation, tenant-aware constraints, least grants, `USING` + `WITH CHECK`, privileged parity.                         | Rules 32–40; RAC034–041 and production-shaped negative tests. |
|   8 | Overengineering — **Yes**                               | Recursive threads, configurable grouping, analytics scores, push infrastructure, and read-sync buses solve speculative futures.                         | Medium / High                                    | Exact group cardinality is two; external channels are separately governed.                                      | Narrows Option 1 to existing primitives and bounded data.                | No conversation model, external channel, flag, or arbitrary group configuration.                                              | Rules 10–17, 44, 51–56; RAC005, RAC043–055.                   |
|   9 | UX/UI and friction — **Yes**                            | Two peer rows look like two jobs; an overdecorated group hides the action; visual-only grouping excludes users; automatic read creates distrust.        | High / High                                      | W3C relationships/reflow/target/color; Windows clear intent/noise; Core Base Maia contract.                     | Requires a compact semantic group with optional history.                 | Latest meaning primary, one action, one disclosure, text counts/state, no avatar/urgency.                                     | Rules 23–28, 43–50, 58–60; RAC044–054.                        |
|  10 | Source of truth, ownership, invariants — **Yes**        | Group/read/task/provider/worker state could become request/reminder truth or circularly repair another domain.                                          | Critical / Medium                                | ADRs 0027/0183/0184 and workflow OpenSpec explicitly separate these facts.                                      | Requires an ownership matrix and one-way projections.                    | Phase 12 source; Phase 17 item/group/engagement; task/channel remain separate.                                                | Rules 2, 5, 9, 18–21, 28–31, 39–42; RAC001–033.               |
|  11 | Hidden coupling — **Yes**                               | Grouping could depend on English copy, current route, demo component, D44 aggregate shape, Inngest, or a provider identifier.                           | High / High without explicit negatives           | Current dropdown is fake; external platform APIs vary; D44 aggregate spans multiple requests.                   | Eliminates heuristic/provider/UI coupling.                               | Typed group contract/destination, product uniqueness, shared primitives.                                                      | Rules 12–16, 33, 39, 42, 58–59; RAC006–010, RAC032–044.       |
|  12 | Failure modes — **Yes**                                 | Source commit may succeed while projection fails; lost responses/reordered events may create duplicates, stale count, or missing attention.             | High / High under at-least-once execution        | Workflow OpenSpec requires product ledger/claims and DB truth; WHATWG distinguishes occurrences.                | Requires visible repair and same-effect replay.                          | Atomic intent, durable claim/receipt, hard conflict, query ceilings, cursor recovery.                                         | Rules 39–42, 50–55; RAC030–033, RAC054–060.                   |
|  13 | Lifecycle, temporal, concurrency, idempotency — **Yes** | Off, terminal, D52 boundary, read, repair, or two workers can race and jointly violate cardinality/engagement.                                          | Critical / Medium                                | D48–D52 already specify half-open/source-winner semantics; DB uniqueness is Core precedent.                     | Adds exact group/child transition matrix.                                | One semantic child identity, immutable times, source-specific end, expected engagement mutation.                              | Rules 17–22, 27–31, 39–41; RAC011–033.                        |
|  14 | Data integrity — **Yes**                                | Duplicate child/group, wrong sibling, mutable count, drifted cache, or non-deterministic order corrupts badge/history.                                  | Critical / Medium                                | Phase 17 demands one badge group, keyset pagination, and immutable tuples.                                      | Requires derived counts and deterministic order.                         | Constraints, compatible child allow-list, stable cursor/tie-breaker, reconciliation.                                          | Rules 13–22, 36–42, 51; RAC003–019, RAC021–038, RAC055–059.   |
|  15 | Security and privacy — **Yes**                          | Preview/deep link/log/group may leak holder, requester, reason, capability, provenance, peer engagement, or another Tenant.                             | Critical / Medium                                | Core source is protected; OWASP warns guessed IDs/open redirects; RLS service paths bypass policies.            | Requires minimized preview and fresh deep-link authorization.            | Typed server destination, no raw URL/detail, opaque logs, same-Tenant all-path tests.                                         | Rules 32–45; RAC034–047, RAC059–060.                          |
|  16 | Scalability and performance — **Yes**                   | N+1 source/provider lookups, raw-row counts, offset paging, or full-thread hydration degrade for large/skewed Tenants.                                  | High / Medium                                    | Phase 17 already requires keyset pagination/no per-row provider query; group is bounded at two.                 | Adds production-shaped query/load proof without invented SLA.            | Batched projection, indexed cursor, bounded two-child expansion, plan/query-slope gates.                                      | Rules 17, 22, 50–52; RAC054–055, RAC059.                      |
|  17 | Operational burden — **Yes**                            | Manual DB fixes, group repair scripts, unread corrections, or undocumented mixed-version behavior become tribal knowledge.                              | High / Medium                                    | Core requires one typed repair path and product-owned evidence.                                                 | Requires deterministic repair/replay and named owners.                   | One conflict/reconciliation path; no evidence edits or group reconstruction by support.                                       | Rules 39–42, 52–57; RAC032–033, RAC056–060.                   |
|  18 | Observability and auditability — **Yes**                | Logs cannot answer which source/member/key/group/read transition occurred; content-rich logs create privacy harm.                                       | High / Medium                                    | Phase 17 separates durable body-free audit from logs and user history.                                          | Requires traceable opaque identities and durable receipts.               | Record source→member→child→group correlation→engagement with minimized result codes.                                          | Rules 18–22, 39–43, 55–57; RAC032, RAC057–060.                |
|  19 | Dependencies and integrations — **Yes**                 | Android/Windows/Web Notifications, Realtime, Inngest, or future chat providers could become grouping/delivery truth or lock-in.                         | High / Medium                                    | Official vendor behavior varies; Core OpenSpec makes executor replaceable and DB authoritative.                 | External patterns remain evidence only.                                  | Provider-neutral product contract; Realtime invalidation only; channels separately admitted.                                  | Rules 33, 39–44, 53–59; RAC039–044, RAC054–060.               |
|  20 | Migration, rollout, upgrades — **Yes**                  | Old readers may misrender the new key; dual writers/backfill can duplicate items/unread; rollback may delete truth.                                     | Critical / Medium                                | Phase 17 uses Reserved/Live/Retired and future-only one-writer migration.                                       | Requires additive compatibility and no backfill.                         | Readers/constraints first, shadow no-visibility, writer last, decoder retained, roll-forward repair.                          | Rules 53–57; RAC056–060.                                      |
|  21 | Testability, traceability, proof — **Yes**              | Snapshot tests can pass while relationships, auth, races, unread, order, and migrations fail.                                                           | Critical / High without outcome proof            | User requires falsifiable cross-artifact trace; Core treats a11y/race/isolation as blockers.                    | Adds 60 outcome criteria and production-shaped matrices.                 | Positive/negative/property/concurrency/migration/a11y/manual AT/load evidence tied to D54 IDs.                                | D54-RAC001–060 and monitors below.                            |
|  22 | Other hazards — **Yes**                                 | Copy or analytics may shame staff, imply lateness/SLA, rank response speed, or turn courtesy attention into surveillance.                               | High / Medium                                    | D47 research gate prohibits blame/performance interpretation; Windows warns against noise.                      | Restricts meaning and telemetry; exact copy remains separately governed. | Neutral no-clock/no-blame copy, no personal productivity analytics, representative comprehension proof.                       | Rules 4, 43–45, 52, 60; RAC044–047, RAC059–060.               |

## D54 research assertions

The identifiers below are continuous and classified so later glossary, ADR,
OpenSpec, design, ticket, implementation, test, and release evidence can trace
the decision without turning research into runtime authority.

- **D54-RA001 — Verified repository fact:** D54 is documentation-only and the
  current repository has no activated D43 courtesy-reminder source, key, item,
  group, worker, or settings UI.
- **D54-RA002 — Verified repository fact:** D46–D53 explicitly keep reminder
  artifacts absent until an exact pair and complete activation package pass.
- **D54-RA003 — Verified repository fact:** the current staff bell dropdown is
  hardcoded demo presentation with fake avatars, fake actions, **8 New**, and a
  visual dot rather than Phase 17 authority.
- **D54-RA004 — Verified repository fact:** Core's shared UI configuration is
  Base UI `base-maia`, Zinc-oriented semantic variables, Lucide icons, and
  shared `packages/ui` ownership.
- **D54-RA005 — Verified repository fact:** ADR-0027 defines notifications as
  attention projections rather than source records, tasks, delivery receipts,
  or business-completion truth.
- **D54-RA006 — Verified repository fact:** ADR-0027 gives each recipient/item
  independent seen/read/unread/archive engagement distinct from source state.
- **D54-RA007 — Verified repository fact:**
  `presentation.source_actionable_then_recent_90d@1` keeps actionable work in
  Needs attention after read and omits archive while action remains required.
- **D54-RA008 — Verified repository fact:** ADR-0027 permits a group only for
  one genuine producer episode/triage unit and forbids grouping across Tenant,
  role, privacy boundary, incompatible meaning, or source episode.
- **D54-RA009 — Verified repository fact:** a Phase 17 group contributes one
  badge count while preserving child evidence and remains Needs attention while
  a current actionable child exists.
- **D54-RA010 — Verified repository fact:** a new meaningful source transition
  creates a new child and may reopen a group without mutating or reviving an old
  child.
- **D54-RA011 — Verified repository fact:** D44's per-request initial item has
  stable title/category/action semantics and exact request/recipient-generation
  uniqueness.
- **D54-RA012 — Verified repository fact:** D44's responsibility-update item is
  one recipient/application-generation aggregate that may cover several exact
  pending requests and intentionally avoids N unread items.
- **D54-RA013 — Verified repository fact:** D44 presentation contains no
  protected request explanation, capability, provenance, authority evidence,
  or subject list and loads details after fresh Phase 12 authorization.
- **D54-RA014 — Verified repository fact:** D45 email is an optional independent
  sibling whose delivery/open/click never marks the local item read or completes
  the task/request.
- **D54-RA015 — Verified repository fact:** D48 limits first activation to
  genuine requests created after the successful non-Off policy boundary and
  forbids current/historical catch-up.
- **D54-RA016 — Verified repository fact:** D49 seals one exact current D44
  responsibility cohort at occurrence commit and later presentation/channel
  layers may narrow but never add recipients.
- **D54-RA017 — Verified repository fact:** D49 excludes ended/recreated or
  remove-then-readded recipient continuity and treats indeterminate resolution
  as no release/retry of the same occurrence.
- **D54-RA018 — Verified repository fact:** D50 supplies one request-anchored
  elapsed not-before instant that is eligibility, not Due/Overdue or promised
  delivery time.
- **D54-RA019 — Verified repository fact:** D51's cancellation epoch can prevent
  or end reminder descendants without changing the D43 request, initial item,
  or Tasks Hub task.
- **D54-RA020 — Verified repository fact:** D52's half-open usefulness interval
  bounds first release; a released item may remain truthful presentation/history
  afterward under its registered source applicability.
- **D54-RA021 — Verified repository fact:** D53 evidence qualification creates
  no runtime/UI artifact and activation alone may register an immutable
  code-owned timing profile.
- **D54-RA022 — Verified repository fact:** ADR-0183 keeps one D43 source-backed
  task and prohibits notification engagement from completing or mutating it.
- **D54-RA023 — Verified repository fact:** workflow orchestration uses product-
  owned dispatch/claims and identifier-only Tenant envelopes and never owns
  business truth.
- **D54-RA024 — Verified repository fact:** Core's identity OpenSpec resolves
  identity, Tenant, role, membership, and capability server-side and treats UI
  hiding as insufficient authorization.
- **D54-RA025 — Verified repository fact:** Core requires application-layer
  Tenant authorization with database RLS as defense in depth.
- **D54-RA026 — Verified repository fact:** Phase 17 destinations are typed
  product codes resolved server-side; arbitrary URLs are rejected.
- **D54-RA027 — Verified repository fact:** Phase 17 Realtime carries
  identifiers only, uses DB truth after invalidation, and relies on cursor
  recovery for missed events.
- **D54-RA028 — Verified repository fact:** Phase 17 requires keyset pagination
  for notification lists and removal of per-row producer/provider queries.
- **D54-RA029 — Verified repository fact:** Phase 17 Live state is proof-gated
  through Reserved/Live/Retired catalog contracts and generated validation.
- **D54-RA030 — Verified repository fact:** the current census has no reminder
  row; D53 leaves its candidate counts unchanged pending complete activation.
- **D54-RA031 — Verified external fact:** WCAG 2.2 SC 1.3.1 requires information,
  structure, and relationships conveyed visually to be programmatically
  determinable or available in text.
- **D54-RA032 — Verified external fact:** W3C lists native headings and ordered/
  unordered lists among sufficient semantic techniques for preserving
  relationships.
- **D54-RA033 — Verified external fact:** WCAG 2.2 SC 1.4.1 prohibits color as
  the only visual means of conveying information or prompting a response.
- **D54-RA034 — Verified external fact:** WCAG status messages require
  programmatically determinable updates when context/focus does not change.
- **D54-RA035 — Verified external fact:** W3C warns against assertive alert
  semantics for information that is not important and time-sensitive.
- **D54-RA036 — Verified external fact:** WCAG Reflow requires ordinary
  vertical content to work at a 320 CSS-pixel equivalent without lost
  information/function or two-dimensional scrolling.
- **D54-RA037 — Verified external fact:** WCAG 2.2 Target Size Minimum uses a
  24-by-24 CSS-pixel minimum with defined exceptions such as sufficient spacing.
- **D54-RA038 — Verified external fact:** Android recommends explicit grouping
  for related notifications and uses a stable group identifier.
- **D54-RA039 — Verified external fact:** Android says grouped children should
  remain complete notifications that are useful individually.
- **D54-RA040 — Verified external fact:** Android warns automatic grouping can
  vary by device and explicit group identity/summary is more predictable.
- **D54-RA041 — Verified external fact:** Windows says notifications need clear
  intent and should save time rather than distract or create more work.
- **D54-RA042 — Verified external fact:** Windows warns excessive interruptions
  can cause users to disable the notification channel.
- **D54-RA043 — Verified external fact:** Windows says activating a notification
  should open the application in the notification's appropriate context.
- **D54-RA044 — Verified external fact:** Windows recommends predictable
  Notification Center removal behavior so users do not fear missing
  information.
- **D54-RA045 — Verified external fact:** the WHATWG Notifications standard
  defines a notification as an abstract representation of something that
  happened.
- **D54-RA046 — Verified external fact:** the WHATWG notification `tag` can
  replace an earlier same-origin notification with the same conceptual tag.
- **D54-RA047 — Verified external fact:** WHATWG models `renotify` separately
  from replacement and defaults it false.
- **D54-RA048 — Verified external fact:** WHATWG notification title/body/actions
  have explicit language/direction treatment and should survive bidi contexts.
- **D54-RA049 — Verified external fact:** WHATWG recommends that actions exposed
  by a notification also be available inside the application.
- **D54-RA050 — Verified external fact:** GitHub's notifications inbox can group
  notifications and display read and unread items together or filter unread.
- **D54-RA051 — Verified external fact:** GitHub exposes Read and Unread as
  separate triage operations from Done, Save, and Unsubscribe.
- **D54-RA052 — Verified external fact:** Confluence exposes an unread-only
  notification view and a user action to mark a notification unread.
- **D54-RA053 — Verified external fact:** Sanity's organization-centered
  dashboard has one notifications panel for notifications such as comments and
  tasks across studios/apps.
- **D54-RA054 — Verified external fact:** Microsoft Entra treats initial access-
  review email and reminder email as separately configurable behaviors.
- **D54-RA055 — Verified external fact:** Entra can report contacted reviewers
  and notification timestamps independently from review decisions.
- **D54-RA056 — Verified external fact:** Entra may send a midpoint reminder to
  reviewers even when they have already made a decision, demonstrating that
  its reminder semantics are not safe to import into D43.
- **D54-RA057 — Verified external fact:** Next.js recommends secure database-
  backed authorization in a centralized data-access layer for sensitive data/
  actions rather than relying only on optimistic checks.
- **D54-RA058 — Verified external fact:** Supabase states that grants and RLS
  are separate layers and both must be configured for exposed tables.
- **D54-RA059 — Verified external fact:** Supabase's service role bypasses RLS,
  so service-role use must remain server-side and reproduce application
  authorization.
- **D54-RA060 — Verified external fact:** PostgreSQL unique, foreign-key, and
  check constraints can enforce identity/relationship invariants at write time.
- **D54-RA061 — Verified external fact:** PostgreSQL RLS is default-deny when
  enabled and no policy applies.
- **D54-RA062 — Verified external fact:** OWASP recommends least privilege and
  deny-by-default authorization.
- **D54-RA063 — Verified external fact:** OWASP recommends validating
  permissions on every request and failing safely when authorization fails.
- **D54-RA064 — Verified external fact:** OWASP recommends logging and unit/
  integration tests for authorization logic.
- **D54-RA065 — Verified external fact:** OWASP recommends mapping a short
  code/identifier server-side rather than accepting a caller-authored redirect
  URL.
- **D54-RA066 — Verified external fact:** OWASP warns unvalidated redirects can
  support phishing and authorization bypass.
- **D54-RA067 — Verified external fact:** WHATWG distinguishes notification
  actual timestamp from display time and permits delayed display evidence.
- **D54-RA068 — Verified external fact:** WHATWG warns not to convey unique
  information only through images/icons/badges/vibration because platforms may
  omit them.
- **D54-RA069 — Verified external fact:** no reviewed official source proves a
  universal count, read trigger, retention period, copy, or notification timing
  for Core's request type.
- **D54-RA070 — Verified external fact:** platform/product grouping examples
  vary enough that their implementation APIs cannot be Core authority.
- **D54-RA071 — Requirement inference:** a separately meaningful source
  occurrence needs a distinct child identity to preserve provenance and
  idempotency.
- **D54-RA072 — Requirement inference:** the initial and reminder can form one
  triage group only through an explicit compatible group contract.
- **D54-RA073 — Requirement inference:** a per-request reminder cannot inherit
  engagement from D44's multi-request responsibility-update aggregate.
- **D54-RA074 — Requirement inference:** the group is a derived presentation
  relation, not a third source/business record.
- **D54-RA075 — Requirement inference:** D54's group has a hard maximum of two
  child meanings and does not justify arbitrary threading.
- **D54-RA076 — Requirement inference:** group identity must derive from trusted
  Tenant, request, recipient continuity, role, surface, and contract facts
  rather than presentation text.
- **D54-RA077 — Requirement inference:** a visually grouped layout must expose
  equivalent semantic list/heading/description relationships.
- **D54-RA078 — Requirement inference:** one top-level badge contribution must
  derive from whether any presentable child is unread, not raw child count.
- **D54-RA079 — Requirement inference:** each child must retain independent
  personal engagement because read is evidence about one person's interaction
  with one occurrence.
- **D54-RA080 — Requirement inference:** adding the reminder cannot mutate the
  initial child's read state, timestamp, source, or history.
- **D54-RA081 — Requirement inference:** top-level order must use immutable
  availability plus a stable tie-breaker so engagement updates do not reorder
  work unpredictably.
- **D54-RA082 — Requirement inference:** expanded child history must use stable
  chronological order so retries and delayed materialization cannot lie about
  sequence.
- **D54-RA083 — Requirement inference:** passive expansion/preview/focus cannot
  count as reading because it does not prove the person opened the occurrence's
  action/context.
- **D54-RA084 — Requirement inference:** deep-link activation must reauthorize
  current source and recipient access; possession of a notification ID is not
  authority.
- **D54-RA085 — Requirement inference:** a typed destination avoids route
  injection and decouples persisted meaning from current URL structure.
- **D54-RA086 — Requirement inference:** absence of an exact initial child must
  yield a truthful one-child group rather than failure or guessed correlation.
- **D54-RA087 — Requirement inference:** each child's applicability must end
  independently because D51 can end the reminder while D43 remains pending.
- **D54-RA088 — Requirement inference:** D43 terminal truth can end both active
  children without fabricating read or task completion.
- **D54-RA089 — Requirement inference:** product-database uniqueness must make
  worker/browser/Realtime retries converge on the same child and group.
- **D54-RA090 — Requirement inference:** local grouping cannot authorize an
  external channel, task mutation, or access action.
- **D54-RA091 — Product judgment:** accept Option 1 only with the bounded group,
  independent engagement, exact authorization, and no-artifact amendments.
- **D54-RA092 — Product judgment:** one compact top-level request group is
  clearer than two peer rows once a useful reminder has independently earned
  activation.
- **D54-RA093 — Product judgment:** the collapsed group should foreground the
  latest actionable meaning and expose earlier occurrences through one optional
  disclosure.
- **D54-RA094 — Product judgment:** a person/avatar treatment is inappropriate
  because the source occurrence comes from product state, not a human sender.
- **D54-RA095 — Product judgment:** elapsed age/countdown should remain absent
  because D50 eligibility is not deadline or urgency.
- **D54-RA096 — Product judgment:** localized update count, unread count, and
  Needs-attention state are sufficient group context without duplicating child
  copy.
- **D54-RA097 — Product judgment:** the bell badge should count one unread group
  even if repair temporarily leaves two child items unread.
- **D54-RA098 — Product judgment:** full-page and mobile sheet surfaces should
  expose equivalent group/child semantics rather than separate behavior.
- **D54-RA099 — Product judgment:** no modal, toast-only result, hover-only
  affordance, or automatic focus move is needed for a routine courtesy item.
- **D54-RA100 — Product judgment:** the item should navigate to source context
  and should not contain inline Keep/Remove controls.
- **D54-RA101 — Product judgment:** selecting the exact reminder source action
  is sufficient affirmative engagement to idempotently read only that reminder;
  passive expansion/viewing is not.
- **D54-RA102 — Product judgment:** a general notification-thread engine is
  overengineering for two registered child meanings.
- **D54-RA103 — Product judgment:** D54 authorizes no external channel; every
  future channel remains a separate proof-gated delivery step.
- **D54-RA104 — Product judgment:** group compatibility belongs in one code-
  owned Phase 17 contract, never Tenant configuration or renderer convention.
- **D54-RA105 — Product judgment:** after complete activation, the local item is
  dependable attention for each released member regardless of optional
  external-channel availability.
- **D54-RA106 — Product judgment:** before activation, no placeholder/disabled
  item/group/control is better UX than advertising unavailable behavior.
- **D54-RA107 — Product judgment:** stable key/group registration must occur in
  the same activation package as source, renderer, authorization, migration,
  and proof rather than piecemeal.
- **D54-RA108 — Product judgment:** one reminder child per member is the smallest
  bounded cardinality and a second reminder requires a new founder/source
  decision, not configuration.
- **D54-RA109 — Product judgment:** child-specific recent history is more
  truthful than one mutable group timeline blob.
- **D54-RA110 — Product judgment:** privacy-minimized generic preview is better
  than displaying person/source details in a compact shared-work surface.
- **D54-RA111 — Assumption:** representative coordinators will benefit from one
  later local courtesy occurrence after the D47 gate proves a real recovery
  improvement.
- **D54-RA112 — Assumption:** coordinators will understand one compact group as
  one request with two attention moments rather than two tasks.
- **D54-RA113 — Assumption:** neutral “still waiting” language can avoid blame,
  deadline, and access-change interpretations across supported locales.
- **D54-RA114 — Assumption:** omitting avatars and protected details improves
  clarity/privacy without removing information coordinators need to triage.
- **D54-RA115 — Assumption:** one group badge contribution materially reduces
  perceived duplication compared with two top-level unread rows.
- **D54-RA116 — Unresolved unknown:** the exact authority, proof threshold,
  irreversible sequencing, and calm Tenant UX for urgent safety withdrawal of
  an activated profile remain D55.
- **D54-RA117 — Unresolved unknown:** the final title/body/action words and
  localization variants that pass D47 comprehension/fatigue gates.
- **D54-RA118 — Unresolved unknown:** whether representative users routinely
  need the child disclosure expanded or can understand the compact summary.
- **D54-RA119 — Unresolved unknown:** the measured production SLO, page size,
  and largest release fixture that match the eventual Phase 17 implementation.
- **D54-RA120 — Unresolved unknown:** the exact implementation schema/module;
  it must be selected only after constraints, RLS, plans, and current source
  tests prove the behavioral contract without adding another authority.

## D54 research acceptance criteria

- **D54-RAC001:** Before full activation, repository/runtime inspection finds
  no reminder key, group contract, row, UI, worker, flag, or placeholder caused
  by D54.
- **D54-RAC002:** One released D49 member maps to exactly one stable distinct
  reminder child semantic identity and a replay returns the same result.
- **D54-RAC003:** A group key is derived from trusted Tenant, request episode,
  recipient Party/role/surface/continuity, and group-contract revision.
- **D54-RAC004:** Caller attempts to supply/change Tenant, group, source,
  recipient, role, surface, child key, actor, or audit attribution are ignored or
  rejected before write.
- **D54-RAC005:** The group contract admits at most one D44 per-request initial
  child and one D54 reminder child and rejects a third or unknown meaning.
- **D54-RAC006:** The D44 responsibility-update aggregate can never join a
  per-request D54 group.
- **D54-RAC007:** Same-shaped identities from two Tenants cannot relate through
  insert, update, query, cache, Realtime, support, repair, export, or service
  paths.
- **D54-RAC008:** A different Party, role, surface, or recipient generation
  cannot see or join another recipient's group or engagement.
- **D54-RAC009:** A different privacy/purpose/group-contract revision is
  rejected even when Tenant/request/recipient identifiers otherwise match.
- **D54-RAC010:** If the initial child is absent/unpresentable, the reminder
  renders as one truthful child without placeholder or guessed sibling.
- **D54-RAC011:** Creating the reminder leaves every immutable and engagement
  field of the original child byte-for-byte unchanged.
- **D54-RAC012:** The newly released reminder alone begins unread for its exact
  recipient and creates no peer/shared/admin unread state.
- **D54-RAC013:** A previously read initial child remains read after reminder
  release, retry, repair, grouping, sort, and source refresh.
- **D54-RAC014:** Reading the reminder never marks the initial child read and
  reading the initial never marks the reminder read.
- **D54-RAC015:** Marking either child unread changes only that child's personal
  engagement and no source/task/group ownership fact.
- **D54-RAC016:** Passive expansion/collapse, preview, focus, scrolling,
  Realtime, refresh, and second-device load change no child engagement.
- **D54-RAC017:** Selecting the exact reminder's **Review in People & access**
  action may use one idempotent exact-child read mutation; lost/ambiguous
  response reconciles from authoritative engagement, navigation reauthorizes,
  and no initial/group/task/source/peer/channel state changes.
- **D54-RAC018:** A group with one or two unread presentable children contributes
  exactly one accessible bell badge count; zero unread contributes zero.
- **D54-RAC019:** Raw unread rows cannot make an unauthorized, source-ended, or
  otherwise unpresentable group contribute to count.
- **D54-RAC020:** Adding a reminder may reopen/reorder only its own group and
  never rewrites the original child's `available_at` or read evidence.
- **D54-RAC021:** Group ordering uses latest presentable immutable child
  availability plus a stable tie-breaker and is unchanged by engagement-only
  updates.
- **D54-RAC022:** Expanded children appear in deterministic chronological order
  under retry, delayed initial materialization, and equal timestamps.
- **D54-RAC023:** Needs attention includes the group whenever either compatible
  child remains current/actionable, irrespective of read state.
- **D54-RAC024:** D51 Off before release produces no reminder child, unread, or
  group change beyond existing initial behavior.
- **D54-RAC025:** D51 Off after release ends only reminder active/unread
  applicability; the pending request's initial item/task remain independently
  correct.
- **D54-RAC026:** D52 equality/post-boundary first release produces no reminder
  child, placeholder, missed badge, catch-up, or unread reset.
- **D54-RAC027:** A child released inside the D52 window is not deleted or
  falsely expired merely because wall time later passes `useful_until`.
- **D54-RAC028:** D43 terminal truth removes the group from Needs attention and
  preserves only authorized child-specific Recent history without fabricated
  read/completion.
- **D54-RAC029:** Current authorization/recipient loss removes active/recent
  presentation/count immediately even when cleanup/cache/worker lags.
- **D54-RAC030:** Later authority restoration or remove/re-add never revives the
  old item/group/engagement or mints a replacement D49 member.
- **D54-RAC031:** Two simultaneous workers, browser retries, duplicate events,
  and repair converge on one reminder child and one group correlation.
- **D54-RAC032:** Reusing an immutable child/group identity with changed source,
  recipient, meaning, policy, or safe facts hard-conflicts and records one typed
  repair case.
- **D54-RAC033:** Source commit followed by projection failure remains visible
  in product-owned dispatch/claim evidence and can replay only the same effect.
- **D54-RAC034:** Tenant-aware primary/foreign/unique/check constraints reject
  cross-Tenant and incompatible child/group relations.
- **D54-RAC035:** Select/count/list/search/expand policies fail closed for a
  wrong Tenant/recipient/role/surface/source relationship.
- **D54-RAC036:** Engagement mutation applies both `USING` and `WITH CHECK`
  semantics so immutable ownership cannot be transformed into a forbidden
  state.
- **D54-RAC037:** Views, functions, RPCs, Realtime, grants, support, repair,
  export, purge, and service-role/background paths pass equivalent authorization
  and Tenant-isolation tests.
- **D54-RAC038:** Anonymous, incompatible staff, requester, former coordinator,
  other Tenant, support, operator, impersonation, AI, and guessed-ID cases see
  no protected preview or existence signal unless separately authorized.
- **D54-RAC039:** The item stores/resolves one typed destination code; raw,
  external, protocol-relative, encoded, or caller-authored redirect values are
  rejected.
- **D54-RAC040:** Destination activation freshly authorizes the current request
  and either shows exact allowed detail or a non-enumerating authorized fallback/
  denial.
- **D54-RAC041:** List, count, render, expand, mutate, support, repair, and
  destination tests each prove current authorization rather than trusting item
  possession or earlier route checks.
- **D54-RAC042:** The reminder/group cannot Keep, Remove, Withdraw, decide,
  complete, reopen, reassign, reprioritize, date, comment on, or remind the task/
  request.
- **D54-RAC043:** D54 emits no email, SMS, push, Slack, Teams, Google Chat,
  digest, escalation, provider request, sound, toast, or new task.
- **D54-RAC044:** Safe preview contains none of the prohibited holder/requester,
  reason, capability, group/provenance, continuity, authority, contact, location,
  raw-ID, or peer-engagement facts.
- **D54-RAC045:** User-facing content contains no Due/Overdue, deadline,
  countdown, guaranteed-send, access-change, automatic-decision, blame, or staff-
  performance implication in every supported locale.
- **D54-RAC046:** Group state/update count/unread/action are available in text
  and semantics and remain understandable with CSS, color, icons, images, and
  motion independently removed.
- **D54-RAC047:** The compact group and expanded ordered child list expose
  equivalent perceptual/programmatic relationship and meaningful sequence in
  manual screen-reader tests.
- **D54-RAC048:** Keyboard users can reach, identify, activate, expand/collapse,
  and leave the group with visible unobscured focus and no nested-interactive or
  focus-theft defect.
- **D54-RAC049:** Asynchronous load/read/error/recovery feedback is persistent
  where needed and politely programmatically announced, never toast-only or
  assertive for routine status.
- **D54-RAC050:** At 320 CSS pixels/400% zoom, all content/actions reflow to one
  reading order without horizontal scrolling, clipping, overlap, or lost state.
- **D54-RAC051:** Pointer controls meet WCAG 2.2 AA target size/spacing,
  keyboard equivalence, and touch operation without hover dependency.
- **D54-RAC052:** Forced colors, reduced motion, dark/light themes, long strings,
  plurals, CJK, RTL, bidi isolation, localized dates, and device/session time
  zones preserve meaning and order.
- **D54-RAC053:** Low-bandwidth/offline tests require no remote image/resource
  for comprehension and expose safe retry/current-state behavior without stale
  authorization.
- **D54-RAC054:** Notification/group list uses keyset pagination, stable cursor,
  bounded summary data, and at most two children per expanded D54 group.
- **D54-RAC055:** Production-shaped query instrumentation proves SQL/source/
  provider call count does not increase per group on a fixed page and intended
  Tenant/recipient/order indexes prevent unbounded scans.
- **D54-RAC056:** New readers safely handle absence and unsupported future keys;
  old readers never render the reminder as the initial item or count it twice.
- **D54-RAC057:** Cutover proves constraints/readers first, nonvisible shadow
  comparison, exactly one writer, and no historical/current-request backfill.
- **D54-RAC058:** Disable/rollback stops new projection without deleting source/
  audit/child history, mutating the initial item/task, or reusing an identity.
- **D54-RAC059:** Release evidence traces founder D54 → glossary → ADRs → PRDs →
  OpenSpec → manifest/census → design/tasks/tickets → implementation → tests →
  migration → production proof with no contradictory term/key/count/state.
- **D54-RAC060:** Representative coordinators, including part-time/volunteer,
  assistive-technology, mobile, low-bandwidth, international, and privacy-
  sensitive contexts, pass preregistered comprehension/noise/harm criteria before
  activation; any critical deadline/access/blame misconception blocks release.

## Named release and production monitors

These monitors become applicable only if a complete activation ships. A missing
profile/feature today is not an incident.

| Signal                             | Threshold                                                                                                                                  | Owner                                        | Required response                                                                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `D54_DUPLICATE_REMINDER_CHILD`     | Any second reminder child for one exact Tenant/request/member/key identity                                                                 | Phase 12 + Phase 17                          | Stop new projection for the key, preserve evidence, reconcile to the canonical child, fix uniqueness/replay, run full corpus proof.                 |
| `D54_INVALID_GROUP_CHILD`          | Any child outside the registered initial/reminder compatibility set or any group with more than two D54 children                           | Phase 17                                     | Hide invalid group safely, block writer/release, open repair case, correct contract/data without mutating valid children.                           |
| `D54_CROSS_BOUNDARY_GROUP`         | Any group crossing Tenant, environment, Party, role, surface, recipient generation, request episode, or privacy class                      | Security + IAM + Phase 17                    | Activate kill/narrowing control, open critical incident, contain/exposure-assess, repair all paths, add regression proof before re-enable.          |
| `D54_ORIGINAL_ENGAGEMENT_MUTATION` | Any reminder operation changes the D44 initial child's immutable or engagement fields                                                      | Phase 17                                     | Disable mutation path, restore from durable evidence via governed correction, investigate audit impact, add concurrency/negative tests.             |
| `D54_TASK_MUTATION`                | Any reminder/group operation writes task status, assignment, priority, dates, comments, or reminder fields                                 | Phase 12 + Tasks Hub                         | Stop writer, reverse only through source/task correction contract, preserve audit, add cross-domain mutation fence.                                 |
| `D54_BADGE_DIVERGENCE`             | Computed accessible unread-group count differs from authorized group listing by any value                                                  | Phase 17                                     | Mark count unavailable rather than guess, recompute from authoritative query, repair projection/index/cursor, verify every Tenant boundary.         |
| `D54_UNAUTHORIZED_PRESENTATION`    | Any denied viewer receives preview, count, child relation, source existence, or deep-link detail                                           | Security + Privacy + IAM                     | Critical incident: disable affected read path, contain, assess disclosure, repair authorization/RLS/cache/service parity, retest production corpus. |
| `D54_UNSAFE_DESTINATION`           | Any raw/unapproved URL or destination that skips current source authorization                                                              | Security + Phase 12                          | Disable activation route, invalidate unsafe mappings, investigate open-redirect/access exposure, replace with typed server resolver.                |
| `D54_PASSIVE_READ_CHANGE`          | Any expand/collapse/preview/focus/scroll/load/Realtime event changes read state                                                            | Phase 17 + Accessibility                     | Disable offending engagement hook, restore exact child evidence if possible, add input/modality/device regression tests.                            |
| `D54_SOURCE_CEILING_LEAK`          | Any active reminder presentation after current D51/D43/recipient/auth ceiling denies it, or any first release at/after D52 upper bound     | Phase 12 + Phase 17                          | Stop presentation/release, preserve occurrence evidence, reconcile claims, repair query/source fence, run boundary/concurrency proof.               |
| `D54_N_PLUS_ONE`                   | SQL/source/provider call count increases with number of groups in a fixed-size list page, or expanded group fetches more than two children | Phase 17 + Database                          | Block release/rollback query, batch projection, restore indexed keyset plan, rerun skewed multi-Tenant load proof.                                  |
| `D54_PRIVACY_FIELD_LEAK`           | Any prohibited protected/source/person/peer field appears in preview, event, log, metric, cache key, export, or support surface            | Privacy + Security + affected owner          | Stop affected output, contain/purge where lawful, assess notification, minimize schema/envelope, add static/runtime leakage tests.                  |
| `D54_MIXED_VERSION_MISRENDER`      | Any deployed reader counts/renders a reminder as an initial item, loses group identity, or duplicates badge contribution                   | Release Engineering + Phase 17               | Halt rollout, narrow new writer, retain decoders/data, roll forward compatible reader, rerun version matrix.                                        |
| `D54_COMPREHENSION_HARM`           | Any critical deadline/access/automatic-decision/blame interpretation or any preregistered cohort threshold failure                         | UX Research + Accessibility + Access Product | Keep/turn feature Off, simplify semantic contract/copy, investigate affected cohorts, retest before activation/re-enable.                           |

## Ruthless synthesis and ordered path forward

### Must be resolved before D54 is recorded

Resolved in this document:

1. “Grouped” means one closed code-owned compatibility contract, not a visual
   convention or generic thread engine.
2. Only the exact per-request initial child can be the reminder's sibling; the
   responsibility-update aggregate is excluded.
3. The reminder is a distinct item and only it receives fresh unread.
4. The group contributes one badge count while child engagement remains
   independent.
5. Missing initial presentation has a truthful one-child behavior.
6. D51/D52/D43 endings affect only the facts they own.
7. Typed deep links, fresh authorization, privacy minimization, and no task
   mutation are explicit.
8. D54 creates no current runtime/UI artifact.

### Requirements to carry into spec/design

1. Register the exact child semantic key and two-child group compatibility in
   Phase 17's generated manifest only inside the full activation package.
2. Specify composite identity, immutable child input, derived group unread/
   ordering, source-specific end predicates, typed destination, safe fields,
   retention, and mixed-version behavior.
3. Add application authorization, least grants, RLS `USING`/`WITH CHECK`,
   views/RPC/Realtime/service/support/repair/export parity, and cross-Tenant
   constraints.
4. Specify the compact/expanded Base Maia semantics, exact a11y relationships,
   mobile/low-bandwidth states, localization, and prohibited content.
5. Preserve Phase 17 keyset pagination and establish measured activation
   budgets from production-shaped fixtures rather than inventing numbers.

### Implementation safeguards required

1. TDD at the public source→projection and list/count/mutation/destination seams.
2. Composite database uniqueness and fail-hard immutable-input conflict.
3. One product-owned claim/receipt and identifier-only workflow/Realtime
   envelopes.
4. Query-time source/authorization ceilings independent of cleanup workers.
5. Deterministic keyset order and bounded two-child expansion without N+1.
6. Manual keyboard, screen-reader, touch, zoom/reflow, forced-colors, RTL/CJK,
   offline/low-bandwidth, and multi-device engagement evidence.
7. Readers/constraints before one writer, no backfill, retained decoder, and
   roll-forward repair.

### Risks that may be monitored after activation

Only the fourteen named monitors above qualify: each has a concrete signal,
threshold, owner, and response. Product popularity, opens, clicks, task
completion speed, individual response time, and “engagement” are not safety or
success signals and must not become staff-performance surveillance.

## Final disposition

**Accept with required amendments.** Option 1 is modern, coherent with Core,
and proportionate only as one distinct child inside the existing Phase 17
attention-group model with exact compatibility, independent engagement, one
badge contribution, fresh authorization, bounded UI, no task mutation, and no
current artifact. Implementing “threading” generically, grouping by display
values, resetting the original item, or adding another task would be **Reject
and replace**.

## D55 — How should Core urgently withdraw an activated timing-profile revision found unsafe?

### Why this needs one founder decision

Suppose a complete timing-profile revision passed D47–D54, activated, and is
now referenced by several Tenant selected policy heads. Later, credible reviewed
evidence finds a critical defect—for example, the profile's stable semantic
contract materially causes people to believe access will be removed
automatically. Some already admitted requests have pinned source tuples; some
reminder occurrences are sealed or released; other descendants remain
unreleased; and each Tenant's selected head remains truthful historical policy.

Ordinary D53 retirement is intentionally insufficient: it removes a profile
from new selection/reselection but allows a Tenant's existing selected head to
continue admitting later D43 requests until that Tenant deliberately changes
policy. Urgent safety withdrawal must stop unsafe future effects quickly without
rewriting Tenant choices, lying about history, deleting decoders, creating an
N-Tenant fanout race, or presenting an alarming wall of notifications. It must
also be irreversible for the exact unsafe revision; any safe return is a newly
qualified/activated successor, not clearing the old fence.

This decision does not choose the safety defect, threshold evidence, emergency
actor/capability, replacement timing profile, or incident communications. It
chooses the authoritative narrowing shape that the later activation package
must fully specify and prove before the first profile can ship.

### Option 1 — one monotonic platform safety fence for the exact profile revision — recommended

One authorized, audited, product-owned fence irreversibly withdraws the exact
profile revision in O(1) source-policy work. It preserves every Tenant selected
head, immutable D43 pinned tuple, decoder, released item/history, and audit
fact, while immediately blocking:

- offering or newly selecting/reselecting the profile;
- new D43 admission through an existing Tenant head that references it;
- any not-yet-committed D49 seal; and
- every still-unreleased local or external descendant.

Every source/query/effect boundary re-proves the monotonic fence, so asynchronous
cleanup cannot leak an unsafe effect. The Tenant settings surface calmly shows
the preserved selection as **Unavailable — safety review** in read-only
**Current setting**, explains that no new requests will use it, and offers the
ordinary authorized choice of Off or another fully activated profile. It does
not auto-save, mass-publish replacement heads, list affected requests, create a
task/notification per Tenant/request, or claim earlier reminders were recalled.

**Why recommended:** it is the smallest fail-closed model, has one authoritative
race boundary, avoids partial N-Tenant policy mutation, preserves truthful
Tenant intent/history, and follows Core's source-owned monotonic-narrowing
pattern without building an emergency workflow engine.

### Option 2 — mass-publish Off successor heads for every affected Tenant

The platform enumerates affected Tenants and publishes a new Off policy head for
each. This makes every Tenant's effective configuration ordinary Off and may be
appropriate if a future legal/product rule requires explicit policy correction,
but it rewrites Tenant-owned selection, needs per-Tenant authority/audit and
communication semantics, races concurrent administrator saves, can partially
succeed, scales with Tenant count, and still needs a global admission fence
during the fanout. It is therefore materially more brittle and operationally
expensive.

**Which should Core record for D55: Option 1 or Option 2?**
