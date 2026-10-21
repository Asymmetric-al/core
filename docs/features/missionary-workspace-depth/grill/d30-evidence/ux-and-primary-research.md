# D30 — One-time-need gift follow-up: UX and primary research

Research checked October 18, 2026 (UTC). This is bounded evidence and a design
recommendation for the D30 adversarial review, not a new ratified decision,
implementation, authenticated product test or report of ministry interviews.

The founder selected A: a qualified gift for a specific one-time need can justify
personal follow-up without a separate assertion that the money is additional
support. The customization clarification is still pending at this writing. The
recommended model below is one organization-wide On/Off setting; it does not
represent a selected per-need override model or create a new authorization grant.

## Primary evidence and its limits

All pages below were directly opened for this review on October 18. Relative
update labels are reported as displayed; they are not converted into invented
publication dates. Public documentation establishes documented behavior, not
that Asym users prefer it or that the same workflow is safe for Core.

| Source and date                                                                                                                                                     | Verified, bounded observation                                                                                                                                                                 | Application and conflict resolution                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [TntConnect: Campaigns and promises](https://www.tntware.com/tntconnect/help/en/pages/campaignsoverview.aspx), undated manual                                       | Campaigns can seek one-time gifts or recurring support/increases. Campaign gifts' pledge-fulfillment treatment is configurable.                                                               | Campaign membership alone does not distinguish one-time purpose from recurring support or additionality. Do not import its allocation defaults into Core's financial owners.                                     |
| [MPDX: Appeal flows](https://help.mpdx.org/article/774-flows-view-for-appeals), updated October 13, 2022                                                            | When regular and special gifts arrive together, the flow can require choosing the exact processed gift attributed to the appeal; received money and processed donations have distinct states. | Keep the exact gift visible and distinguish purpose recording from effective received support. This older page is a domain precedent, not proof of MPDX's current authenticated UI or Core source qualification. |
| [Givebutter: Funds and donation designations](https://help.givebutter.com/en/articles/4534181-how-to-use-funds-donation-designations), displays “Updated this week” | Donors may choose a designation; campaigns can preselect one; recurring payments can retain it. The article says funds are public donation options.                                           | Purpose, payment frequency and defaults are different facts. A default is not sufficient intent evidence. Reject its public-fund visibility for Core's restricted ministry/need titles.                          |
| [Givebutter: Appeals](https://help.givebutter.com/en/articles/12821780-how-to-track-fundraising-performance-with-appeals), displays “Updated over 3 weeks ago”      | Appeals describe solicitation methods, are not donor-selectable and may automatically tag campaign transactions.                                                                              | Internal attribution is not donor-purpose evidence. Its meaning of Appeal must not replace Core P27's meaning.                                                                                                   |
| [Givebutter: Tasks](https://help.givebutter.com/en/articles/9703441-how-to-manage-your-fundraising-to-do-list-with-tasks), displays “Updated over a week ago”       | Tasks can link contacts, transactions or campaigns and use task status/filtering. Its documented staff visibility is broad; task assignment can send email.                                   | Reusing existing work context is useful. Do not import broad staff visibility, automatic assignment email or unconstrained complete/reopen behavior over D20.                                                    |
| [HubSpot: Turn off workflows](https://knowledge.hubspot.com/workflows/turn-off-workflows), updated September 28, 2026                                               | Turning Off prevents new enrollment, while already enrolled records and delayed/skipped actions have separately documented behavior.                                                          | Off needs precise consequences. HubSpot's execution semantics are not Core's: this feature does not acquire a workflow engine, scheduling controls, skipped-action replay or HubSpot permissions.                |
| [GOV.UK: Check answers](https://design-system.service.gov.uk/patterns/check-answers/), undated current guidance                                                     | Guidance favors a clear final action, relevant review content and preserving entered answers when correcting them.                                                                            | Use a compact inline review of the actual gift, purpose and effect. Do not add a multi-page wizard or copy GOV.UK styling into Maia.                                                                             |
| [W3C APG: Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/), undated current guidance                                                                       | Switches are binary; their accessible label remains stable, state is programmatically exposed and Space changes it.                                                                           | Use the existing accessible shared primitive if a switch is used. A button with explicit Turn on/Turn off is also reasonable; do not make an unsaved visual toggle look like the saved policy.                   |
| [W3C: Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory guidance                                              | Material status updates can be exposed to assistive technology without moving focus. Excessive live announcements can be disruptive.                                                          | Announce a saved policy, recorded purpose, correction or refreshed review once. No repeated toast per gift or focus-stealing background reconciliation.                                                          |

The strongest finding is semantic, not decorative: familiar fundraising systems
attach several different meanings to funds, campaigns, appeals and gifts. Core
must present the exact qualified reason, rather than borrowing a vendor's label
as proof. No source establishes a universal special-gift threshold, follow-up
deadline, donor-retention improvement or requirement to show every need publicly.

## Governing repository facts and current implementation limits

- [Founder brief](../phase28-founder-brief.md:165) requires native qualified
  special-gift stewardship. A permanent manual-only fallback does not deliver
  the selected A behavior.
- [Q30's bounded scenario](../phase28-q30-one-time-need-purpose-research.md:35)
  deliberately uses an existing supporter and ministry, with no other qualifying
  reason. It is a design scenario, not an observed interview.
- [P27 REQ27-F83](../../../../prds/sitestacker-parity/phase-27-donor-development/requests.md:818)
  prohibits automatic tasks from mere membership, linking or responses. D30
  needs a qualified gift-purpose occurrence; no new Request or parallel Need
  object follows.
- [P27 ownership](../../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:31)
  separates working lists, Requests, presentation/response, expectations,
  received money and financial links. [E7](../../../../prds/sitestacker-parity/phase-27-donor-development/owner-reconciliation.md:41)
  leaves temporal financial attribution unresolved. D30 cannot choose it by
  displaying a campaign label.
- [D29-C01–C03](../phase28-d29-additional-gift-purpose-adversarial-review.md:169)
  establish exact purpose evidence and a source confirmation action, with
  organization-permitted staff and missionaries and no routine second approver.
  D30 is a separate purpose criterion. Its own exact action and scope require
  qualification; task editing or viewing money is not confirmation authority.
- [D20](../phase28-d20-grouped-special-gift-follow-up-adversarial-review.md:16)
  governs one compatible current task, individual gift evidence, reviewed-set
  handling and correction. A second reason for the same gift is not a second
  task or another unit of handled money.
- [D22's settings journey](../phase28-d22-amount-based-gift-follow-up-adversarial-review.md:92)
  provides a useful saved-state and single-action precedent. D30 must qualify
  its own time boundary: receipt and later purpose confirmation are different
  events, so “changes apply to new gifts” cannot be copied without qualification.
- [ADR0183](../../../../adr/0183-source-owned-work-projects-into-one-shared-tasks-hub.md:622)
  preserves source ownership and durable identifier-based work projection. A
  task summary is not a new purpose or financial authority.
- The current [manual task endpoint](../../../../../packages/api/src/missionary-portal/tasks.ts:81)
  inserts `is_auto_generated: false`. The current [task row](../../../../../packages/missionary/components/task-row.tsx:233)
  has a generic Auto badge, and the [task page](../../../../../apps/missionary/app/tasks/page-client.tsx:842)
  has complete/reopen behavior. These static facts do not prove a qualified
  special-gift producer, D20 group-completion control or D30 permission boundary.
- [Shared UI rules](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3)
  and [frontend rules](../../../../ai/rules/frontend.md:14) require exact
  `base-maia`, Base UI and semantic tokens through `@asym/ui`. Use existing
  components; no alternative primitive library, app-local fork or new theme.
- [Accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:1)
  requires semantic, keyboard and focus review; automated checks alone are not
  proof. [Testing guidance](../../../../ai/rules/testing.md:20) supports checks
  appropriate to the actual change. This note has no runtime proof.

## Smallest complete product and strongest alternatives

The useful addition is one explained eligibility reason and a scoped policy
control, connected to existing source facts and existing work. It does not need
a campaign builder, form designer, donor rating, threshold, approval queue or
workflow recipe. One-time describes the specific need's qualified purpose; it
does not mean “the payment is non-recurring,” “the appeal has an end date,” or
“the donor has no commitment.” No “extra support” wording follows without D29's
separate evidence.

**Recommended customization:** authorized staff enable or disable this reason
organization-wide. The setting changes the producer's eligibility policy, not
users' access, gift ownership, financial application, other follow-up reasons or
permission to contact a supporter. Initially Off until deliberately enabled is
a conservative rollout recommendation, not evidence that the founder has
selected a default. Do not add recipient-specific or missionary-specific
settings without a selected need for them.

The strongest alternative customization is an organization default with a
per-need override. It can accommodate organizations with materially different
stewardship practices for different needs, but adds inheritance, conflicting
states and explanation burdens. No evidence gathered here establishes that Core
needs those controls. The pending clarification should decide that product
scope; both models retain the same financial/privacy safeguards.

The strongest functional alternative is B: keep the purpose as context and
require another established qualifying reason or manual Add follow-up. That
reduces automatic work, but excludes precisely the selected scenario and causes
repeat manual handling. It is not a substitute for implementing A once A's
source and authorization contracts are qualified.

## Complete proposed journey

### 1. Staff enable a clear, bounded rule

In existing organization settings, place one section beside related personal
gift-follow-up settings, with the current organization visible. Suggested copy:

> **Follow-up for one-time needs**
>
> Create personal follow-up for eligible gifts with a confirmed connection to a
> specific one-time need. This does not mean the gift is extra support.
>
> No messages are sent automatically. Other follow-up reasons are unchanged.

Show the authoritative saved **On** or **Off** state. Loading or failure is not
Off. A single **Turn on** action can show its concise effect inline and save it;
no second approval, typed confirmation or scheduling picker. Show saved success
only after the source accepts the command. If there are other editable fields
on the page, this command must not silently save them.

With the recommended organization-wide model, show “Applies across this
organization.” It does not imply that every staff member can see the gifts.
Keep technical policy revisions out of ordinary form copy; authorized history
can explain who changed the setting and when.

**Turn off** must remain available without requiring edits to an invalid draft
elsewhere. Proposed result, subject to the main review's precise admission
contract:

> Follow-up for one-time needs is off. Existing follow-ups remain.

The nearby help must explain that this stops new work under this reason,
preserves already accepted work, and does not block necessary corrections.
Previously accepted work may still appear while projection catches up. Gifts
with another qualifying reason can still produce follow-up. Turning On must not
silently sweep history, replay the Off interval or reopen handled work. These
are required admission/lifecycle semantics, not something a tooltip can enforce.

### 2. Grace gives through the ordinary flow

Do not introduce a second donor question or “Is this special?” checkbox merely
to drive staff tasks. Reuse a qualified existing gift-purpose instruction or
source confirmation. An owner-qualified record of donor acceptance of captured,
concrete need terms can establish purpose, including accepted visible defaults
when the source qualifies that acceptance. A default fund, internal appeal tag
or imported label alone cannot. A published need may be a donor-facing choice
only under that source's existing publication and purpose contract; D30 grants
no new public visibility.

Grace's existing support elsewhere, payment frequency or lack of an explicit
“additional” statement must not accidentally suppress the selected criterion.
An eligible gift still needs effective received-money evidence. A promise,
checkout attempt or response is not received support.

### 3. The permitted recorder resolves the exact source once

Start from an already authorized gift/source context. The ordinary confirmation
should show its exact eligible gift and ministry context, source amount/currency
read-only, and an already qualified need reference or minimal permitted purpose
fact. A bounded P28 purpose assertion can carry the concrete terms; an existing
P27 reference is reused only when genuinely present and qualified. Do not create
another need, new Need registry or duplicate Request to make D30 work.

Where a human confirmation is required, use a source-owned contextual action
such as **Record one-time need purpose**. This is proposed wording, not a new
permission. The form states what the recorder is confirming and shows the
concrete need terms or eligible existing reference. A reference selector, where
applicable, offers only currently authorized candidates. A directly authored
purpose assertion still requires qualified attributable evidence; free text
cannot bypass it, and a P27 reference is not mandatory for every valid purpose.

Reuse already qualified evidence. If a direct statement must be recorded,
capture the source owner's minimum attributable facts using D29's restrained
pattern: no required donor-message body, transcript, upload, duplicate shared
interaction or second approver. Final evidence admissibility belongs to the
qualified D30 source contract; a visually credible label cannot prove it.

For the ordinary whole-gift case, do not ask the user to retype the amount. An
explicit partial-purpose fact uses only the existing exact-amount pattern if
the source qualifies it; no percentage calculator, inferred rounding or payment
split is introduced by this UI. Purpose amount does not reallocate posted money.

One **Save purpose** action records the authorized fact and its durable outcome.
Safe status copy distinguishes the outcomes:

- **Purpose recorded.** The source accepted the fact.
- **Follow-up is being updated.** Append only when an admitted task projection
  is actually pending; never for history-only, Off, already-handled or otherwise
  ineligible work.
- **Added to the current follow-up.** Show only after the actual shared work
  result is available, with an authorized link.
- **Purpose recorded. This follow-up rule is off.** Use only when the actor may
  see that policy and the policy actually explains the lack of D30 admission.

Failure to generate this reason must not claim that no other follow-up exists.
The source may legitimately retain purpose while this optional rule is Off.

### 4. Maya understands the existing task immediately

In her normal task list, retain the supporter/ministry context she is permitted
to see, the current group count and due/status information. The reason should
explain the human work, not merely display Auto:

> **Personal follow-up**
>
> Grace · 2 gifts
>
> Gift for a one-time need

When specifically approved for this audience, a concise reason can say **Gift
for vehicle repairs**. Raw need titles, geographic details, private messages,
care information or donation instructions must not be copied into task titles,
tooltips, search snippets or notifications. A generic category is safe only if
the category itself is permitted. If it is restricted, withhold that detail
through the qualified projection; do not pretend that generic text grants
permission to reveal a restricted occurrence.

The expanded task shows each eligible gift once with its own permitted amount,
currency, date and factual reasons. A gift qualifying under both D29 and D30
has two explained reasons on one gift member, not duplicate rows or tasks. Do
not add a combined mixed-currency total. No need financial dashboard is required
to finish a personal thank-you.

Use D20's single reviewed-group action. The ordinary path is read the two gifts,
handle the reviewed group once and finish it once. No mandatory checkbox per
gift and no blanket completion of unseen arrivals. A changed reviewed gift
requires refreshed review; a newly arrived gift can remain pending while the
unchanged reviewed gifts are handled. Show the truthful result, for example
**Finished 2 gifts. 1 new gift still needs review.** Sending remains a separate
deliberate action governed by current permissions and actual outcome.

### 5. Corrections, ordinary closure and later work stay intelligible

Closing or fully funding a need does not by itself undo the historical purpose
of a received gift or mean the supporter has already been thanked. A source
correction, refund or eligibility change has its own semantics and can narrow
or remove a reason through the owner-qualified path. The UI must distinguish
these events instead of treating every closed need as an invalid gift.

If only this reason is withdrawn and another remains, retain the appropriate
work with its surviving reason. If all qualifying reasons are withdrawn, show
the proper source-ended state rather than leaving an unexplained open task.
Completed handling retains truthful minimal evidence; a correction never
pretends an already-sent message was unsent. A later eligible gift does not
rewrite the earlier reviewed group.

The correction UI belongs to the source. Maya must not edit a task title to
change donor purpose, and a staff user must not re-label a gift to force task
creation. A permitted **View source** action can explain and route a correction;
it must not disclose source existence/details to an unauthorized viewer.

### 6. Failure, mobile and accessibility states

| State                               | Useful, truthful behavior                                                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Policy did not load                 | Show “Could not load this setting” and Retry. Do not render Off or permit a blind overwrite.                                                                              |
| Concurrent policy change            | Refresh the saved state and explain another change was saved; preserve still-authorized unsaved input. No silent last-write-wins.                                         |
| Save response lost                  | Resolve the durable command outcome before allowing another effective mutation. Do not assert failure or ask the user to recreate the purpose.                            |
| Source accepted; projection pending | Keep the fact saved and show pending work only when actually admitted. No repeated source confirmation.                                                                   |
| No eligible need fact available     | Explain the missing permitted qualification without a raw lookup or free-text bypass. Ordinary permitted task creation remains available.                                 |
| Access changed during review        | Deny the protected action and remove protected content; preserve only input the actor still may retain. Never retain a stale private need preview merely for convenience. |
| Source corrected while task open    | Refresh the affected review before completing its changed members; retain unchanged reviewed members under D20.                                                           |
| Rule Off                            | Show the saved state to authorized staff; retain other work and correction paths. Do not add a missionary pop-up for each gift.                                           |

Use one readable column on a phone, a clear primary action and expandable source
details instead of a wide dense table. Essential reasons, pending states and
errors must not depend on hover, color or icons. Long translated labels and
international names wrap. Dates use the source's actual temporal precision and
the existing display convention; do not invent a precise donor-statement time.
Currency is explicit where amounts appear, without automatic conversion.

Use shared Maia spacing, typography, semantic contrast and restrained status
badges. Preserve focus on a failed save, associate inline errors with controls,
return focus after a dialog closes, and announce material status changes once.
If a switch is chosen, keep its label stable and expose saved state; include a
clear saving state rather than visually promising instant success. Follow
Core's touch-target guidance and verify 320 CSS-pixel reflow. Do not conflate
Core's 44-pixel convention with WCAG 2.2 AA's separate minimum-target criterion.

No new offline synchronization, real-time feed, bulk import or export is needed
for this qualifier. Slow connections must preserve a truthful saved/pending
state and permit safe retry through the existing durable command boundary.

## Material UX concerns and exact prevention language

Likelihood below is reasoned exposure without safeguards, not measured incidence.
These findings narrow or clarify A; none requires replacing the selected purpose
criterion with manual-only work.

| Concern; severity / likelihood                                             | What goes wrong and supporting evidence                                                                                                                                     | Permanent fix and exact proposed requirement                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Purpose confused with payment frequency or appeal labels; High / High      | TntConnect campaigns include recurring goals; Givebutter defaults and internal appeal tags have other meanings. The system could create unexplained work for routine gifts. | **D30 SHALL qualify a specific one-time-need purpose independently of payment frequency, appeal membership, internal tags and additionality; the task SHALL explain the qualified reason.**                                                                                            |
| Configuration hierarchy before demonstrated need; Medium / Medium          | Per-need overrides add inheritance and conflicting saved states. The founder has not yet selected that model.                                                               | **If organization-wide control is selected, D30 SHALL expose one saved organization-wide On/Off setting, with no per-need, missionary or supporter override.** Do not silently narrow a contrary founder answer.                                                                       |
| Off presented as cancellation or complete automation shutdown; High / High | Existing shared work, accepted asynchronous effects and other reasons remain distinct. HubSpot's detailed Off rules show why the word alone is insufficient.                | **Off SHALL stop new admission under this reason at the qualified owner boundary, preserve accepted work and corrections, and leave other reasons unchanged. On SHALL NOT silently replay historical or Off-interval facts. The UI SHALL state those effects truthfully.**             |
| Private need title or category leaked; Critical / Medium                   | A needed factual reason is not authority to publish source narratives; vendor public-fund behavior conflicts with Core privacy.                                             | **Every projected reason and detail SHALL be approved for its audience before delivery. Raw need titles and protected narratives SHALL NOT be passed to the client, notification, search or logs for cosmetic masking. Generic wording SHALL NOT bypass occurrence/category privacy.** |
| Confirmation becomes duplicate administrative work; Medium / High          | Existing gifts, Requests and donor instructions already own the context. An added Need object or routine second approver would increase friction without proving truth.     | **The confirmation path SHALL reuse qualified source facts, require only attributable missing evidence, and permit one authorized deliberate save; it SHALL NOT require duplicate Requests, source bodies or routine second approval.**                                                |
| Purpose saved incorrectly implies task created; High / Medium              | Source acceptance, policy eligibility, prior handling and task projection are different outcomes.                                                                           | **The UI SHALL distinguish recorded purpose, admitted pending projection and available work; it SHALL NOT show pending task creation when no task effect was admitted.**                                                                                                               |
| Duplicate reason produces duplicate work or money; High / High             | The same gift can satisfy D29 and D30. Generic task creation ignores D20 coverage.                                                                                          | **One gift SHALL appear once in the compatible current group, with each permitted reason explained; extra reasons SHALL NOT create duplicate handling or alter financial totals.**                                                                                                     |
| Need closes and valid follow-up disappears; High / Medium                  | Administrative need lifecycle and received-gift purpose are different source facts.                                                                                         | **Ordinary need closure/funding SHALL NOT alone erase historical purpose or prior eligible stewardship. Actual corrections SHALL reconcile affected reasons and reviewed coverage through their qualified owners.**                                                                    |
| Current checkbox and Auto badge treated as sufficient UX; High / High      | Current components do not prove reviewed-set completion or factual explanation.                                                                                             | **D30 work SHALL use D20's reviewed-group handling and an intelligible factual reason; current generic completion controls SHALL NOT bypass that contract.**                                                                                                                           |
| Loading/error mistaken for Off or inaccessible updates; Medium / Medium    | A binary control cannot represent unknown saved state. W3C guidance requires correct semantics and status exposure.                                                         | **Saved, loading, saving and error states SHALL be distinguishable; keyboard/focus, status announcements and mobile reflow SHALL be verified with the actual shared components.**                                                                                                      |

## Proof, release questions and bounded monitoring

Before activation, demonstrate the complete selected scenario with an authorized
source and no independent qualifier. Show that the native task appears without
manual Add or an optional workflow. Also demonstrate the negative counterparts:
internal appeal tag only, default designation only, unreceived promise, unknown
purpose, protected need/category, revoked authority and a gift already handled.

Exercise the actual grouped review with two gifts, overlapping D29/D30 reasons,
a new gift arriving during review, a corrected member and source-ended work.
Exercise saved On/Off, an in-flight accepted effect, a concurrent policy edit,
lost response, and the Off interval without a historical sweep. Check exact
source and destination audience boundaries; visual masking is not proof.

Use representative staff and missionary task-based evaluation before release,
including phone, keyboard and screen-reader paths. Ask participants to explain
why the task exists, what Off does, whether extra support was asserted and which
gifts their action handles. This is a required validation proposal, not a claim
that such feedback has been gathered. No empirical success rate or invented
sample size is supplied here.

The product/design owner should treat **any observed misunderstanding that a
message was sent, a private need was published or an unseen gift was handled**
as a release-blocking issue requiring correction and repeated scenario review.
After release, monitor sanitized support reports of unexplained/duplicate work:
**one reproducible report** triggers source/reason/coverage investigation by the
feature owner, with the rule disabled for affected admission if correctness
cannot be maintained. This is a proposed operational trigger, not a substitute
for authorization, financial or idempotency gates.

No evidence here establishes how often ministries need per-need policy overrides,
which needs are private in a particular tenant or a universal follow-up deadline.
Use the pending customization answer and qualified source contracts for those
boundaries. Do not expand the UI to solve unobserved variation in advance.
