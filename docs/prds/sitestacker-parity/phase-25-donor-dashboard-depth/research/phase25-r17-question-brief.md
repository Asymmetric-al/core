> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Ratified,8September2026:** Conrad explicitly accepted Question17’s corrected All-first direction, including its content limits, presentation defaults and execution safeguards (A1–A4/J01–J12/V1–V8/C01–C22). T01–T15 remain required target proof. Earlier provisional wording below records review history; ratification does not certify implementation or live behavior.

> **Current status,8September2026:** Conrad tentatively selected A and requested the full review. The [completed adversarial review](phase25-r17-adversarial-review.md) proposes corrected execution for ratification. The unanswered wording below is historical pre-answer research.

# Question 17 — What should the notification bell show first?

Research date: 7 September 2026. **Question17 is unanswered. Recommendation: A — All notifications first.** This is a grooming question and evidence brief, not a PRD, formal specification or implementation authority.

## Previous decision: ratified

Conrad explicitly ratified Question16's corrected requirements, Maia presentation defaults and the proposed24-hour/10-day pending-preference limits. The notebook records A1–A5, J01–J12, V1–V8 and C01–C22 as accepted. Those clocks govern an explicitly requested payment-method preference waiting for setup/verification; they are not estimates of ACH donation settlement. The historical Q16 proof bundle is preserved unchanged.

The additional ACH direction is accepted as execution strengthening: after source-confirmed bank submission, give the donor a warm, stable completion surface, a clear submitted confirmation and an ordinary secondary Bank payment processing status. Say No further action needed right now only when the owner proves that no donor step remains. Provide normal Giving history and Ministry Updates navigation. Do not leave the donor watching a settlement spinner or treat ordinary bank processing as a failure or a Home chore.

Gratitude and completed submission do not imply received funds, an official receipt or activated future recurring collection. Verification-required, unknown and mixed outcomes remain truthful and recoverable. Phase13 D3 and Phase16 B5 retain these financial boundaries. No new email is implied: the ACH-initiation message key remains Reserved until qualified through its owner. Current Stripe documentation confirms the delayed-notification mechanism, not Core's exact connected-account behavior. No payment was run.

## The real-world choice

Home already answers **Do I need to do anything?** through Question12's compact current-action section. The bell opens the donor's notification center. Its initial view can either help the donor catch up on changes or concentrate on outstanding actions. Both views remain available in either option; this question chooses the ordinary initial view, not new messages or permissions.

Consider a future, explicitly qualified notification journey: Maria opens the bell to revisit a notice she read yesterday. She also has an older notice that still requires action. With All first she can find the recent notice immediately, with the outstanding action still clearly presented. With Needs attention first she sees the outstanding action first and selects All to find yesterday's notice. This example illustrates the navigation difference; it does not claim that any particular donor notification type is already implemented or approved for the bell.

<!-- prettier-ignore -->
| Option | What the donor sees | Benefit and cost |
| --- | --- | --- |
| **A — All notifications first. Recommended.** | The bell opens All: currently available notifications, including current required notices and recent information. Needs attention is a clear adjacent tab. | Fits looking for what changed and complements Home. Required actions must remain easy to identify, including older ones; newest information cannot bury them. |
| **B — Needs attention first.** | The bell opens notices whose underlying source still requires attention. All is the adjacent tab for the broader notification list. | Stronger task focus. Someone looking for recent information takes one extra step and may initially see No action needed despite having an unread informational notice. |

Direct links retain their intended destination. An explicit view choice is not interrupted by a newly arriving item. Neither option adds a stored cross-session default preference, automatic tab switching, a different retention period or a new notification ledger.

## Recommendation and research

Recommend **A**. A donor may open the bell to remember a message, confirm what changed or find a relevant destination, even when no action is required. Home already covers current needs. Giving both surfaces the same action-only starting point would reduce this distinction. This is a product judgment, not a measured Asym conversion or satisfaction result.

[Slack's current Activity guidance](https://slack.com/help/articles/19693583638803-Get-your-work-done-from-the-Activity-view) explicitly describes opening to recent messages and notifications, then filtering. [Microsoft Teams](https://support.microsoft.com/en-us/teams/notifications-settings/explore-the-activity-feed-in-microsoft-teams) describes a broad activity summary with optional filtering, including unread. These are **Useful precedents** for a broad initial view and optional focus; their messaging volume, social features, clearing behavior and retention are not donor requirements. Unread is not equivalent to Needs attention.

The existing **Durable pattern** is Core's one source-owned notification and engagement model. A separate portal notification store, automatic email mirror or generated activity for every gift/post would conflict with that pattern and introduce duplicate truth. The shared static dropdown is an **Implementation accident / visual seed**, not a source of valid content, counts or behavior.

## Proposed calm Maia execution

Keep the visible choice small: the title Notifications and two plainly named tabs, All and Needs attention. Use shared shadcn/Base UI components and the repository's verified base-maia configuration. Current [shadcn Base UI Tabs documentation](https://ui.shadcn.com/docs/components/base/tabs) supports this composition; no dependency upgrade or copied demo styling is required by this question.

Use readable rows with a short meaningful title, concise explanation where needed, useful time/context and the authorized destination or action. Use text to distinguish a required action from an unread item; color and dots alone are insufficient. Preserve required current/urgent prominence without making routine information a wall of warning cards. Final ordering, grouping and responsive composition must follow the accepted owner contracts and be tested with realistic content.

On a narrow screen both tabs remain reachable and actions have comfortable targets. Preserve keyboard focus and reading position. Loading or a failed request is not No notifications. A true empty Needs attention view can say No action needed and leave All plainly accessible. No forced sorting controls, custom saved views, social ranking, notification streaks or extra settings are needed to settle this choice.

## Repository evidence and dependencies

Current develop was inspected at `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`.

- [ADR0027](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0027-one-notification-presentation-and-engagement-model.md) reserves broad donor-center information architecture to Phase25. Its actionable policy presents current required work in Needs attention and All even after read. The information policy is All-only. Current access, source status, engagement and durable audit are different facts.
- [Phase17 notification presentation](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md#L1263) supplies finite presentation policies, source-end rules, grouping and exact Tenant/Party/role/access enforcement. The staff UI paragraph names both tabs but does not establish a donor default. Question12 expressly leaves the global donor center separate from Home's current needs.
- [The executable manifest](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-message-executable-manifest.md#L685) initially maps seven in-product staff keys. Donor receipt/correction email/history profiles do not automatically authorize bell items. Phase25 must qualify the exact donor event, recipient, surface, source-end rule and activation evidence for every displayed notification. Reserved message keys remain non-executable until owner adoption. This is a material implementation dependency, not a reason to populate an empty center from raw emails.
- Actual [#890](https://github.com/Asymmetric-al/core/issues/890) and [#891](https://github.com/Asymmetric-al/core/issues/891) bodies were inspected. They supply the canonical projection/engagement and staff-center predecessor work; they do not constitute a completed donor-center ticket. No duplicate ticket was created.
- The inspected donor code has notification preferences, not proof of the complete canonical center. The generic `packages/ui/components/shadcn-studio/blocks/dropdown-notification.tsx` contains hard-coded people, Inbox/General and 8 New. None is inherited product authority. `packages/ui/components.json` declares base-maia.

**All** means the currently authorized, presentable notification set. It is not unlimited history or every email, gift, document or Ministry Update. An older still-actionable notice can remain; a recent notice can disappear when access ends. Reading never completes the underlying task. Neither default changes missionary newsletter responsibility or the dedicated Ministry Updates reading experience.

## Coverage and proof status

Settled: Q16 and ACH experience strengthening. Open: Q17 initial view, exact donor notification admissions/activation, remaining global-center execution, Q14 G01 and other phase-wide dependencies. No new implementation, PostgreSQL/concurrency test, browser journey, provider verification, GitHub mutation or live-provider change occurred. Documentary/source inspection is not target runtime certification.

After the founder chooses, review the selected default against the complete donor journey and inherited policies. Preserve the single source model, current access, read-versus-resolution distinction, clear failure states and accessible navigation. This question does not claim Phase25 is ready for specification or release.
