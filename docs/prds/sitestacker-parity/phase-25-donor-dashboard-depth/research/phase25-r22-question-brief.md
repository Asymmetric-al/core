> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Question22 A1–A4/J01–J16/V01–V12/C01–C22 and reviewed Maia defaults, including two-line previews, stable arrangement ordering, authorized membership and exact historical/pending safeguards. T01–T18 remain required target proof. Earlier provisional wording below is historical; ratification does not certify implementation or live behavior.

> **Current status, 8 September 2026:** Conrad selected A. The [completed Question22 adversarial review](phase25-r22-adversarial-review.md) records corrected execution awaiting ratification. The unanswered wording below is historical pre-answer research.

# Question 22 — What Recurring giving shows first

Research date: 8 September 2026. **Question21 is fully ratified**, including A1–A4/J01–J16/V01–V12/C01–C22 and reviewed Maia defaults. **Question22 is unanswered.** This brief supports one founder decision during grooming. It is not a formal specification, implementation authorization or permission to change live records.

## The decision

When a donor opens **Recurring giving** normally, should the first view emphasize current arrangements with clear access to past ones, or show current and past arrangements together?

An arrangement is the recurring giving the person set up. Its individual payments remain in **Giving history**, whose all-available default is already ratified in Q10. This question changes neither that history nor the recurring detail, editing, pause/resume or fresh-restart journeys.

## Concrete example

Maria gives **USD50 monthly to School project**, has **USD30 monthly to Water project paused until December**, and canceled **USD20 monthly to Food relief** last year. These are three separate illustrative arrangements, not observed Asym donor data. On one visit she wants to check the two arrangements still in place. On another she wants to inspect Food relief and consider starting again.

<!-- prettier-ignore -->
| | **A — Current giving first; past easy to reach. Recommended.** | **B — Current and past giving together.** |
| --- | --- | --- |
| Ordinary first view | School project and the paused Water project, plus any source-qualified pending or unresolved current work. A plainly visible **Past recurring gifts** choice reaches ended arrangements. | School, Water and Food relief in one browsable view, with current entries first, clear states and a current-only filter. |
| Checking what remains in place | Maria sees her continuing and paused arrangements without older canceled arrangements in the same initial list. | Maria sees everything and uses the hierarchy/status labels to identify what remains in place. |
| Finding Food relief | One clear view change reaches the canceled arrangement and its existing detail/restart route. | The canceled arrangement is already in the view, although a long list may still require browsing or filtering. |
| Strongest benefit | A focused place to understand and manage future recurring giving. | Simple completeness and easier discovery when Maria remembers a ministry but not its arrangement's state. |
| Main tradeoff | Historical arrangement lookup on an ordinary visit requires a view change; past access must be obvious. | Long-lived accounts can accumulate many ended arrangements alongside the current ones. |
| Exact link to an old arrangement | Opens its authorized detail directly, bypassing the normal list default. | Opens the same authorized detail directly. |

Both alternatives can be calm, accessible and well organized. B is not an intentionally noisy list. A is not an archive or deletion policy. Neither requires downloading the entire history into the browser.

## Best recommendation

**Choose A — Current giving first; past easy to reach.** The recurring management destination should make what is continuing, paused or still being confirmed easy to understand. A donor who canceled and later restarted the same ministry should not repeatedly have to distinguish the old arrangement from its new successor during routine management.

Preserve B's strength through a visible, text-labeled past view beside the current view and direct links to historical arrangements. Do not hide it in an overflow menu or behind an archive icon. The proposed donor label is **Past recurring gifts**, not the broader **Past giving**, which could be confused with payment History. Exact component and copy refinements belong to the selected-direction review.

**Current** is preferable to **Active** for this proposed inclusive view: an intentionally paused gift still belongs where the donor can find and resume it. Current is a presentation grouping derived from authoritative facts, not a new writable lifecycle status. A paused gift is not, by itself, a problem or an attention task.

This recommendation is an Asym product judgment. **No Asym study proves** either default is universally better, how often donors seek ended arrangements, or a retention/support improvement. The primary evidence establishes credible patterns; the choice follows this product's self-service purpose and already-ratified journeys.

## Current primary evidence and selective transfer

Sources were checked on 8 September 2026. Provider examples support the comparison; they do not override Core.

<!-- prettier-ignore -->
| Primary source | Verified observation | Appropriate lesson and limit |
| --- | --- | --- |
| [Fundraise Up Donor Portal experience](https://fundraiseup.com/docs/donor-portal-experience/) | Its main recurring section shows active plans; selecting a plan opens details and management. | A precedent for emphasizing current management, not a specification of Asym's paused/pending membership. Its pause limits and canceled-plan reactivation language do not replace Q15/Q18. |
| [Givebutter personal profile](https://help.givebutter.com/en/articles/3670204-how-to-manage-your-personal-user-profile), dated28April2026 | Linked active and canceled recurring gifts appear in its Recurring Gifts section. | A credible precedent for B's combined access. The document does not establish exact ordering or comparative outcomes. Its identity-linking and one-time-history limitations are not adopted. |
| [Church Center giving guide](https://help.planningcenter.com/en/140951-manage-your-giving-information.html), dated3September2026 | Separates donation history from Planned giving and its recurring management. | Supports keeping payment history and arrangement management understandable as separate tasks. It does not establish this current/past default. Its pledge/payment-method semantics remain its own. |

These primary descriptions are stronger evidence than a generic claim that modern dashboards all use the same pattern. There is no universal vendor consensus here. No third option is added merely to fill a decision card: an initial category chooser would add a step without a distinct demonstrated advantage in this small fork.

## Why this is genuinely open in Core

Source checkpoint: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd` in the isolated research worktree. Three independent owner/product/UX reviews checked the frontier.

- **P16**, `docs/prds/sitestacker-parity/phase-16-pledges-recurring-commitments.md:539–562,2155–2169`, defines independent intent/schedule/payment/control facts and the recurring detail/Manage experience. It does not choose the normal summary list's current-versus-all inclusion.
- [Existing issue #811](https://github.com/Asymmetric-al/core/issues/811), freshly read and still OPEN, owns a quiet summary list, bookmarkable detail and explicit visibility of paused lines. Its body does not select this default. Future selected execution belongs with this owner, not a duplicate recurring platform. No dependency graph or dispatch status is changed by this brief.
- **Q09** governs focused editing. **Q15** governs deliberate fresh restart from canceled giving. **Q18** governs pause/resume. None determines the normal list entry.
- **Q05/Q10** preserve all available payment history. **Q12** governs the compact Home action section. Neither requires all ended arrangements in this separate first view.
- P16's H.1 next-date ordering describes the **missionary** dashboard. It must not silently decide donor navigation.

### Current implementation versus intended behavior

The current donor page, `apps/donor/app/(dashboard)/donor-dashboard/pledges/page-client.tsx`, displays every supplied legacy snapshot record as a card and offers a generic billing-portal handoff. The source read in `packages/api/src/donor-portal/service.ts:216–224` orders legacy `donor_pledges` by creation and caps the result at100. It has no current/past selector or proof of complete arrangement coverage. The old empty state says No recurring pledges yet.

This is incomplete predecessor behavior, not evidence that B was intentionally chosen. Filtering that capped array locally would not correctly implement A. The permanent path consumes P16's authorized group/line projections and existing detail/command owners, with complete bounded source traversal. This navigation choice introduces no new payment executor or provider capability.

## Boundaries common to both options

1. **Paused stays visible.** Include source-qualified pending activation and unresolved change/stop outcomes where needed; never equate Current with Stripe `active`, nonzero received money or a present next-charge date.
2. **Ending intent does not erase unsettled facts.** If payment/control/reconciliation still requires current presentation, keep that truth visible. Do not label uncertain external stopping as completed or revive terminal intent because a late event arrived. Exact membership is an owner projection to be tested in the selected review.
3. **Keep actual groups together.** Preserve explicit group identity and independently authorized destination lines, including mixed states. Do not infer a group from matching ministry, method or amount; do not split it into fake new arrangements or reveal hidden siblings. The list does not create group-total edit authority.
4. **Preserve history and fresh restart.** Past access carries no new retention limit. Q15's eligible canceled-gift route uses a fresh successor and authorization, never silent reuse of an old mandate. Existing exact links remain direct.
5. **Preserve scope before disclosure.** Tenant, personal/represented context, list labels, search, summaries and continuation obey the same established authorization. A view change grants no additional access. No new database/RLS policy or client-owned current/past field follows from the question.
6. **Use truthful empty and unavailable states.** No current arrangements with past records is not No recurring gifts yet. Loading, unavailable, denied and no available history are distinct. Do not encourage a duplicate new gift while accepted work is still being confirmed.
7. **Keep interactions quiet.** Switching views changes no gift, charge, notification, consent or document. Ordinary pauses and old canceled arrangements do not create new Home chores. Keep the existing exact Manage actions and safe status/date language.
8. **Keep source traversal bounded and complete.** Apply authorized view meaning before continuation, preserve stable identity/order and don't infer global counts from loaded rows. Large lists retain established accessible scrolling/filter patterns. No new browser-wide replica, numbered pagination or saved-view platform is selected.
9. **Retain intentional presentation and domain boundaries.** Shared shadcn/Base UI Maia remains the design system; ReUI remains the reference for actual grids. Do not force a small recurring list into a dense staff grid. Manual/external and fixed commitments retain the already-owned conditional Other commitments treatment.

## What happens after the answer

The selected direction receives the full adversarial review, with exact donor journey, current/past membership and mixed-group behavior, complete history access, empty/error states, mobile/keyboard presentation, source authorization/traversal and falsifiable acceptance criteria. That review must reconcile P16/#811 and Q09/Q12/Q15/Q18, rather than invent new lifecycle authority. Source code is not changed during this grooming session.

Question21's ratification is recorded in the [grooming notebook](../decision-log.md). Its old review bundle remains byte-for-byte unchanged. **Q14 G01 remains an unresolved native contract** and is not waived by this unrelated decision. No runtime behavior, live donor study or production performance result is certified here.

**Founder decision pending: what should donors see first when they open Recurring giving?**
