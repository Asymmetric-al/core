# Phase 26 Q6 — The first staff owner for a new conversation

**Current status:** Answered A. The founder selected Shared Unassigned by default with flexible tenant configuration. [D6 full review](phase26-d6-adversarial-review.md) and every adopted amendment are fully founder-ratified, 10 September 2026. The options below are preserved as the historical question.

**Historical question prepared before the answer.** D1–D5 are fully ratified, including every adopted amendment. Research checked 10 September 2026. This selects the initial individual-assignment default for genuinely new inbound conversations after safe intake and inbox routing. It does not reassign existing threads, change move/reopen behavior, create a formal specification or authorize implementation.

## The question and concrete example

**For a newly configured Support inbox, how should a genuinely new incoming conversation get its first individual staff owner by default?**

Sarah sends a new receipt question to the tenant's Support address. It has passed the intake safeguards and reached the correct inbox. Maria and Daniel are authorized Support workers. Should it wait visibly for one of them to claim/assign it, go automatically to the next eligible person in a rotation, or go to the eligible person with the most room for work?

The example is illustrative. It does not assume ministry volume, staffing schedules, that every receipt question is simple, or that CRM/giving permissions follow from Support assignment. A reply to a conversation Maria already handles is a continuation, not a fresh opportunity to redistribute ownership.

## Options

| Option                                                                | Default behavior                                                                                                                                         | Strongest benefit                                                                                                                 | Cost and limitation                                                                                                                                                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Shared Unassigned intake; staff claim or assign — Recommended** | The new conversation is clearly visible in the responsible inbox's Unassigned queue. Staff use an explicit Assign to me/Assign action.                   | Simple first-use behavior with deliberate ownership and little staffing configuration; staff can triage context before assigning. | Someone must monitor and work that queue. Without visible queue responsibility, it can delay ownership or invite cherry-picking.                                                         |
| **B — Automatic round-robin**                                         | Assign new work in turn among the configured, currently eligible staff receiving work for that inbox. If no one qualifies, retain it visibly Unassigned. | Gives each arrival an individual owner promptly and distributes assignment turns predictably.                                     | Needs a real receiving-work pool and availability rules. Equal turns do not mean equal effort; absence/stale eligibility can create nominal rather than practical ownership.             |
| **C — Capacity-aware workload routing**                               | Assign to eligible staff with the most available capacity under an explicit workload/limit policy; otherwise retain visible Unassigned work.             | Can reduce overload when workload data and capacity policy genuinely describe the team's work.                                    | Requires a defensible definition of load, including waiting work, multiple inboxes and different limits. Conversation counts are not measured effort and can produce surprising choices. |

These are defaults, not mutually exclusive lifetime feature sets. Manual assignment, explicit Unassigned queues, properly qualified round-robin and CRM-conditioned routing remain within the Phase 26 brief. A tenant may deliberately configure another supported inbox mode or valid rule. Selecting A does not authorize leaving the promised automation features unfinished; selecting B/C does not remove the Unassigned fallback or manual correction.

## Single best recommendation: A

**Use shared Unassigned intake as the default, with deliberate opt-in automatic routing per inbox.** The inbox remains responsible for the queue until a specific person takes ownership; Unassigned means no individual assignee yet, not no one responsible for monitoring it. The UI must expose this work prominently and make claiming/assignment clear. Viewing or replying does not silently claim a conversation, consistent with D4.

This is a product default judgment, not a workaround for unfinished code. Even with every routing mode implemented correctly, a new inbox should not assume account activity means someone is on duty or that crude case counts describe their capacity. Existing evidence does not establish one staffing/volume model across Asym tenants. A gives an understandable starting point while allowing teams with a stable rotation to configure B deliberately.

**B is the strongest rival.** If the product's expected operating model is a defined group actively receiving work, automatic rotation removes repeated claiming and gives earlier personal accountability. A's manual burden and unowned-queue risk are real; do not dismiss B merely because it needs correct implementation. The evidence includes Intercom's recommendation against manual assignment for critical support inboxes, so A is conditional on actual shared-queue coverage, not an industry consensus. C becomes stronger when a team can define and maintain meaningful capacity limits. No measured Asym workload distribution supports making C universal today.

The related “must someone claim before composing or sending?” rule is not selected by this default question. D4 already prohibits assignment as a hidden Send side effect. Whatever explicit working/claim interaction is later qualified must preserve current authorization, collision protection and clear ownership.

## What research and Core establish

**Current product comparison.** HubSpot's July 8, 2026 Service Hub Professional/Enterprise help-desk guidance starts incoming tickets Unassigned and offers configured routing. Its assign-on-Send behavior is not adopted because D4 separates sending and ownership. [Official guidance](https://knowledge.hubspot.com/help-desk/route-tickets-in-help-desk).

Help Scout's September 8, 2026 documentation distinguishes rotation from balanced allocation, with availability/limits and visible Unassigned fallback. It routes an existing backlog too; that broader sweep is not selected by Q6. [Official routing documentation](https://docs.helpscout.com/article/1739-use-routing-to-automatically-assign-conversations).

Zendesk documents both rotation and spare-capacity routing, demonstrating credible B/C alternatives. Its capacity configuration and cross-channel event rules are not Asym defaults. [Official configuration guidance](https://support.zendesk.com/hc/en-us/articles/4828787357210-Managing-your-omnichannel-routing-configuration).

**Current repository facts.** Fresh worktree/live develop remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; open PR1335/1336/1564 heads are unchanged. The inbound creation path omits individual/team assignment. Current “round-robin” code actually selects the lowest old-active conversation count, breaking ties by agent ID; it is load-based selection, not rotation. The browser invokes it from collection arrays, and the live inbound path does not establish a qualified automatic assignment engine. An active agent row is not proof of availability or receiving-work status.

Those facts identify implementation and terminology gaps; they do not determine the product default. Current settings are not proof that either automatic mode satisfies new D3 work meanings, safe concurrency, membership or availability. The complete [evidence and independent challenge record](phase26-q6-evidence.md) contains exact source pointers and limits.

**Already-settled move behavior.** Core's governing move language preserves a destination-eligible assignee and otherwise leaves a moved conversation Unassigned without automatic round-robin. Q6 applies only to genuinely new conversations and does not override that rule. Existing/reopened work, reassignment after departure and queue draining after changing a setting require their own explicit policies; they are not new intake by implication.

## Safeguards every answer preserves

1. Inbox/tenant intake routing, quarantine and individual staff assignment remain distinct. Assignment never bypasses safety admission or care classification.
2. Support assignment does not grant CRM, financial or member-care permissions and does not copy the CRM record owner's identity into the support assignee by default.
3. Any recipient pool is explicit, tenant-scoped and currently authorized. Account active, browser online and available to receive work are different facts. Never fall back to an arbitrary first agent, administrator or disabled/inaccessible user.
4. Failed or unavailable routing leaves durable discoverable work in its responsible inbox, not a dropped conversation or a false assigned state. The absence of an individual owner must be visible. For an automatic mode, the same pending initial-assignment intent may be reconsidered when eligible staff become available, with fresh authorization and no overwrite of a later human claim or explicit unassignment. That is not permission to sweep unrelated old, moved or reopened Unassigned work.
5. Manual claims, explicit assignments and automatic decisions use one server-authorized conditional command/history boundary. Two workers or a worker/router race cannot overwrite a valid winner silently. Replayed inbound events cannot create duplicate assignments or reassign an existing thread.
6. First assignment must not change D3 work status/reminders, D4 reply behavior, D5 ending history, D2 recipients or any owner-domain facts. Existing valid ownership is not discarded by a generic routing retry.
7. More-specific routing, team membership, capacity counting, absence handling, notification policy and automation precedence require explicit qualification. This question does not create a new rules engine or freeze a numeric limit, waiting-state weight, SLA target or staffing schedule.

## Pressure cases for the selected answer's review

| Case                                                                  | Required distinction                                                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Maria and Daniel claim the same new item                              | One authoritative winner; the other sees current ownership rather than overwriting it.                       |
| Everyone is unavailable or at an applicable automatic limit           | Visible Unassigned work; no arbitrary fallback person.                                                       |
| A requester replies to Maria's existing conversation                  | Preserve continuation rules; it is not new intake for redistribution.                                        |
| A move clears an ineligible assignee                                  | Preserve the governing destination-Unassigned move rule.                                                     |
| An account is active but the worker is off duty                       | Account validity alone does not qualify automatic receipt of work.                                           |
| Maria has two complex waits; Daniel has three quick open questions    | Counts alone do not establish effort. B distributes turns; C needs its explicit policy rather than guessing. |
| An inbox's routing setting changes with older Unassigned work present | Do not silently treat the setting change as authorization to sweep or reassign that backlog.                 |
| A linked CRM record has an owner who lacks Support/context permission | No automatic ownership transfer or permission grant.                                                         |

Historical question record. The founder subsequently selected **A — Shared Unassigned intake as default**, requesting common tenant configuration. The [complete D6 adversarial review](phase26-d6-adversarial-review.md), configuration blueprint and evidence now record the exact amendments, fully founder-ratified on 10 September 2026. Its explicit current-policy treatment of still-pending automatic first assignments refines this question-stage future-only shorthand; no historical Shared/manual/move backlog sweep is authorized.
