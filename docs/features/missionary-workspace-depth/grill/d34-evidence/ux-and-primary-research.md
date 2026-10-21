# D34 — expired-referral history: UX and primary research

Research date: **October 18, 2026 UTC**. The founder selected **A — Limited
expired-referral history**, with an explicit instruction to avoid complexity and
confusion and challenge whether this is the best experience. That preference is
user direction, not a research finding. The original
[Q34 question snapshot](q34-before-answer.txt) records
the earlier unanswered question; this note evaluates the subsequent selection.

**Recommendation: accept with required amendments.** Keep a small **Expired**
view in the ordinary Referrals surface. Keep current work the default. Show only
currently permitted, recognizable entries. Do not create another inbox,
dashboard, approval process or archive of anonymous placeholders. This preserves
A's useful orientation while respecting the source/privacy boundary.

These are research and proposed acceptance requirements for the parent review,
not ratification of amendments, a formal OpenSpec change, implemented UI or
runtime permission proof. The actor allowed to continue a referral remains
unselected. No Continue, Restore, Renew or Contact action is promised here.

## Evidence classification and governing context

| Evidence                                                                                                                                                                                                                       | Verified fact or bounded interpretation                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Founder referral journey](../phase28-founder-brief.md:137)                                                                                                                                                                    | Referral provenance, expiry, cannot-pursue dispositions, correction and deliberate continuation belong to Phase 28. Continuation does not confer contact permission. It does not select the continuation actor or a universal expiry timer.                                  |
| [Founder stages and contact restrictions](../phase28-founder-brief.md:139)                                                                                                                                                     | P27 stages preserve unassessed and terminal states. List and board use the same records. Moving a card cannot reverse Never Ask or contact restrictions. Expiry must not become a person's compulsory cultivation or financial status.                                       |
| [Workspace active-relationship boundary](../../../../prds/program-roadmap/owner-constraints.md:143)                                                                                                                            | Ordinary Party enumeration requires an active supporter or referral relationship. A historical entry without that relationship needs the explicitly bounded P9/P12 source-purpose amendment identified by Q34; it is not a normal Party profile with fewer visible controls. |
| [P9 ownership in the roadmap](../../../../prds/sitestacker-parity/roadmap.md:4175)                                                                                                                                             | P9 owns referral edges, provenance, expiry and source reporting. P28 consumes these facts; the missionary history view must not create another referral authority.                                                                                                           |
| [P12 current context](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1552) and [purpose boundary](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1654) | Current tenant, actor, record, field and purpose admission applies to names, counts and options as well as bodies. Readable and contactable are separate. Organizational permission cannot override the privacy floor.                                                       |
| [P27 return boundary](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md:377)                                                                                                                      | A genuine cultivation return needs current authority and cannot revive consumed effects or permissions. This is not itself a referral-history grant or a selected referral-continuation workflow.                                                                            |
| [Earlier source investigation](../phase28-relationship-finance-evidence.md:277)                                                                                                                                                | A complete detailed P9 referral-expiry/loop/privacy producer had not been established. The named owner is not evidence that a qualified implementation already exists.                                                                                                       |
| [Shared UI contract](../../../../../packages/ui/AGENTS.md:5), [configuration](../../../../../packages/ui/components.json:3), [frontend rules](../../../../ai/rules/frontend.md:14)                                             | Preserve exact `base-maia`, Base UI primitives, shared `@asym/ui` ownership and semantic tokens. Existing shared select, field and empty components can support this small surface. No new component system is warranted.                                                    |
| [Accessibility review](../../../../ai/skills/accessibility-review/SKILL.md:1) and [testing rules](../../../../ai/rules/testing.md:20)                                                                                          | Keyboard, focus, responsive and state behavior need actual browser verification later. Automated accessibility checks alone cannot prove usability or conformance. Documentation work receives structural verification.                                                      |

The bounded implementation search recorded in Q34 is reused as historical
source evidence, not rerun or expanded into a whole-repository or live-product
absence claim. This lane inspected owner text and UI contracts, not a running
Referrals feature. The wording below describes intended behavior and product
judgment. No real missionary interview, competitor account session, accessibility
pass or measured usability outcome was obtained.

## Fresh official external evidence

All nine pages were directly opened on **October 18, 2026**. Retrieval date is
not publication date. Earlier Q34 sources were reopened rather than treated as
fresh facts solely because they appeared in that note. Claims below stay within
the publicly readable documentation; older fundraising manuals provide domain
precedent, not proof of the best contemporary interface.

| Primary source and document date                                                                                                                                                | Bounded documented behavior                                                                                                                                                                   | Lesson and limit for Core                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [MPDX — Status, MPD Phase](https://help.mpdx.org/article/162-mpdx-status-mpd-phase), updated September 18, 2023                                                                 | Expired Referral belongs to hidden statuses, omitted from active contacts but discoverable through the status filter. Status is editable.                                                     | Existing-list filtering separates current work from history. Do not import full-contact disclosure, bulk status reactivation or its single status's financial meaning.                        |
| [MPDX — Add Referrals to Contacts](https://help.mpdx.org/article/194-add-referrals-to-contacts), updated June 8, 2023                                                           | It preserves the introducing connection; referral lists show names and referral dates. Its Recent display covers two weeks.                                                                   | Source dates can distinguish introductions. The two-week filter is not an expiry policy, and a referrer relationship does not authorize disclosure of that person's identity.                 |
| [TntConnect — TNT Phase](https://www.tntware.com/tntconnect/help/en/pages/contacts_mpdphase.aspx), undated manual                                                               | Expired Referral describes an introduction whose reasonable contact window has passed; it suggests checking for updated information. Not Interested and Unresponsive have different meanings. | Expiry is not a donor refusal. The manual supplies no universal deadline, Core contact permission or reason to copy its compulsory contact-wide phase.                                        |
| [Givebutter — Archive or delete contacts](https://help.givebutter.com/en/articles/9150570-how-to-archive-or-delete-contacts), page says “Updated over 2 weeks ago” at retrieval | An Archived filter changes the existing Contacts list; a distinct unarchive action returns selected contacts to active.                                                                       | A small filter is sufficient navigation precedent. Core must not copy the article's broader access, archive export, duplicate-detection exclusion, deletion or restoration semantics.         |
| [Microsoft Dynamics 365 — Reopen leads](https://learn.microsoft.com/en-us/dynamics365/sales/re-open-lead-sales), updated May 29, 2026                                           | A Closed Leads view and separate Reactivate Lead action support deliberate reopening; availability depends on role/configuration.                                                             | Historical discovery and continuation are separate. Lead disqualification is not referral expiry. The text was readable despite an authorization banner; no authenticated product was tested. |
| [IBM Carbon — Empty states](https://www.carbondesignsystem.com/building-blocks/core/patterns/empty-states), updated August 11, 2026                                             | Distinguishes no data, search feedback and errors; recommends brief contextual wording and recognizes that a next action is not always appropriate.                                           | Use compact, truthful states; do not invent a recovery button to fill an empty view. Carbon components and permission-revealing explanations do not replace Core design/privacy rules.        |
| [W3C APG — Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), current undated guidance                                                                          | A disclosure button toggles associated content, supports Enter/Space and exposes expanded state.                                                                                              | Use the existing primitive only when a row has additional permitted information. Avoid an empty detail modal or a visually clickable row that does nothing.                                   |
| [W3C — WCAG 2.2 status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory guidance                                                | Material displayed status feedback should be programmatically available without unnecessary focus interruption; excessive announcements can distract.                                         | Make filter loading/failure feedback accessible. This does not require expiry alerts, an unread count or automatic announcements of every background change.                                  |
| [W3C — WCAG 2.2 reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), current explanatory guidance                                                                  | Ordinary vertical content should reflow at 320 CSS pixels without two-dimensional scrolling; specified exceptions exist.                                                                      | A small referral row has no need for a wide horizontal grid. Reading this guidance does not qualify an implementation.                                                                        |

No source proves that missionaries want this feature, quantifies how often
referrals expire, establishes a legal retention period or demonstrates that
retaining a recognizable label is lawful in every ministry context. Those are
separate product/source decisions. No deadline is inferred from an example,
manual, recent-items filter or the earlier private-preparation retention choice.

## The strongest alternatives

| Option                                                       | Benefit                                                                                                                                                 | Cost or conflict                                                                                                                   | Judgment                                                                                                                                                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Small Expired view within Referrals                          | Maya can recognize an eligible earlier introduction without confusing it with active work. Staff need not explain every permitted historical reference. | Requires a qualified minimal historical purpose and useful safe labeling.                                                          | Best fit for selected A, provided that the entry is recognizable and all fields remain currently authorized. The benefit is a hypothesis to validate, not measured evidence.                   |
| Remove from Maya's workspace; existing authorized staff help | Fewer missionary states and less historical disclosure; works where no useful minimal projection is lawful.                                             | Adds a handoff and makes permitted past work harder to orient around. Staff help still depends on current authority and retention. | Strongest simpler alternative. It remains the fallback for records/readers that cannot qualify for A, not a promise of staff recovery or a reason to silently discard selected A for everyone. |
| Retain the whole contact in an archive                       | Familiar full context and easy apparent continuation.                                                                                                   | An expired relationship becomes a standing Party grant, retaining private details and possibly contact tools.                      | Reject: it conflicts with the governing boundary. Hiding buttons is insufficient.                                                                                                              |
| Show anonymous “Restricted referral” rows                    | Appears to preserve every item's existence.                                                                                                             | Discloses existence/counts while giving Maya no reliable way to recognize the introduction.                                        | Reject: a confusing graveyard is neither useful history nor adequate privacy protection.                                                                                                       |

The smallest useful permanent design is **one existing surface, one view choice,
a readable row and no new mutation**. It does not need a custom archive manager,
referral retention dashboard, per-row publication approval, separate request
queue, notification stream, expiry countdown or rule builder.

## Maya's journey

1. **Continue normal work.** Referrals opens in its ordinary active view. Expired
   entries do not appear as overdue tasks, unread work, failed targets or active
   cultivation. The ordinary supporter record remains available independently
   when its own current permissions allow it.
2. **Look back deliberately.** In the same view control, choose **Expired**.
   Keep one label throughout; avoid mixing History, Hidden and Archive as if
   they were different features. This is a navigation action, not a new consent
   ceremony or a continuation decision.
3. **Recognize the introduction.** Read the approved display label, **Expired**
   state and actual source dates where available. Search, if present in the
   existing list, searches only fields admitted for this historical purpose.
   It must not discover hidden names and then render a generic placeholder.
4. **Understand the boundary.** A short view description explains the limited
   history. If all permitted information fits in the row, stop there. Do not
   require opening a detail page, confirming a modal or acknowledging a warning.
5. **Return to current work.** Switching back restores the ordinary active view.
   Opening or leaving history has not continued a referral, created a contact,
   added a task, subscribed a person or sent a message.

Suggested compact layout, using fictional data and illustrative dates:

```text
Referrals                           View: Expired

Past referrals with limited details.
Opening a referral does not restart follow-up.

Sam Rivera                                      Expired
Referred 12 June 2026 · Expired 12 September 2026
```

The example does **not** select a three-month expiry rule. A quiet neutral state
label is enough; red warnings or failure illustrations would add urgency that
this history does not represent. The actual source admission, not the display
example, determines which fields exist.

### Essential fields and what stays out

| Field                      | Requirement                                                                                                                                                                                                                      |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recognizable display label | Current source-purpose-approved label. A person's name is personal data; initials, aliases and old display names are not automatically anonymous. No new manual approval step or special label-writing form is required by D34.  |
| Expired state              | State of this referral occurrence, not the person's interest, consent, financial partnership or other introductions.                                                                                                             |
| Referral date              | Show when known and permitted, at its actual precision. A source month must not become an invented first day.                                                                                                                    |
| Expiry date                | Show when known and permitted. Do not substitute cleanup time, last-login time or the date this view was opened. Omit an unknown date from the compact row; if relevant in existing details, say **“Expiry date not recorded.”** |
| Distinguishing context     | Only enough already-approved context to distinguish occurrences when needed. Do not reveal a referrer, location, private ministry title or notes merely to disambiguate two names.                                               |
| Source identity            | Preserve the exact referral occurrence internally. A short existing permitted reference may help support, but exposing a UUID in every row is not a recognition strategy.                                                        |

Do not include contact addresses, phone/email actions, notes, message history,
financial totals, private referral explanations, third-party photos or a link
that upgrades this entry into ordinary Party detail. A disclosure is justified
only if additional approved information actually exists. Reuse the shared
primitive; do not add a modal simply because other records have one.

**If there is no useful safe identifier, do not show that entry to this reader.**
Its absence must also apply to search matches, result counts, pagination totals,
suggestions and badges. Existing generic organizational help can remain
available without confirming that a particular hidden record exists. This is not
permission to delete the source record or require staff to reconstruct it.

### Same names, multiple introductions and active relationships

Two referrals concerning Sam Rivera can be distinct source occurrences. They
must not be merged by name or replaced with a new contact to make the history
look simpler. Show permitted distinguishing dates/context when available. If
these remain ambiguous, do not imply a choice identifies a particular
introduction and do not disclose protected context to resolve the ambiguity.
This read-only view can report only what the permitted evidence supports;
source correction remains with its owner.

A current supporter record and an expired introduction can coexist. The expired
entry does not make the supporter inactive and the supporter relationship does
not automatically reveal the expired referral's private context. The existing
current supporter journey remains governed by its own purpose. D34 does not need
a second shortcut to that record. Any retained ordinary shortcut must separately
qualify access and clearly identify its destination; it cannot serve as a back
door through the limited entry.

## Staff journey without a new administration product

Authorized staff use the established permission configuration for **View limited
expired-referral history**, subject to the P9/P12 qualified purpose and privacy
floor. This is descriptive capability copy, not a new role or selected setting
schema. D34 does not independently choose a default, per-project overrides,
custom visibility rules or a new hierarchy of settings.

Staff do not approve each harmless history row, manually mark expired items to
make the UI update, or rewrite an approved label for each missionary. Eligibility
and allowed fields come from current source/purpose policy. Staff reviewing the
source use their own current authority; the missionary entry does not confer
broader staff access.

If Maya asks about a past introduction, existing permitted staff help may resolve
it using the exact source reference. A source correction is not an instruction
to clone a contact or bypass restrictions. No new **Request continuation** queue,
service promise, mandatory comment or approval ceremony is justified by this
visibility decision. The separate continuation actor choice must precede a
product action that promises continuation.

## Clear state copy and recovery

| Actual state                             | Suggested copy and behavior                                                                                                                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eligible limited entry                   | **“This referral has expired. Contact details and private referral notes aren't shown here.”** Use in available detail/help, not repeated on every compact row. “Here” scopes the claim; it does not deny independently authorized access elsewhere. |
| No currently visible expired entries     | **“No expired referrals to show.”** No hidden count or assertion that the organization has never received a referral.                                                                                                                                |
| No matches within the permitted view     | **“No matching referrals. Try another name or clear your search.”** Offer the existing clear-search control. Do not search protected fields to determine that result.                                                                                |
| Actual load failure                      | **“Referral history couldn't be loaded. Try again.”** Offer Retry; do not convert an error into a zero-state success.                                                                                                                                |
| Previously obtained link now unavailable | **“This referral isn't available here.”** Return to Referrals. Apply the governed uniform missing/denied behavior; do not disclose whether deletion, restriction, transfer or an unknown identifier caused it.                                       |
| Capability unavailable                   | Do not show an unusable Expired control that implies records exist. The ordinary active journey remains available under its existing permissions.                                                                                                    |
| Unknown date                             | Omit unsupported precision. Use **“Expiry date not recorded”** only where explaining that absence is useful. The permitted state must itself still be source-established.                                                                            |

Referrer identity and private reasons are not needed to explain expiry. Avoid
**“You missed your chance,” “Lost supporter,” “Restore contact”** or a disabled
**Continue** button. These either misstate the fact, introduce blame or promise a
workflow whose actor/authorization has not been selected.

## Temporal, phone and accessibility behavior

- **Expiry takes effect when the source says it does.** Delayed cleanup cannot
  leave full active-referral disclosure authorized after its deadline. A reader
  who crosses that boundary receives the currently qualified projection or the
  ordinary unavailable state. Do not depend on a scheduled cleanup task to
  enforce visibility.
- **Refresh without disorientation.** Preserve permitted view/search context
  during normal navigation, but fence late responses on tenant, actor and access
  changes. Clear no-longer-authorized content. A blank replacement must not
  preserve its old name in browser metadata, accessibility text or suggestions.
  Do not promise that information already seen can be recalled from a person.
- **Low bandwidth.** The minimal text list should not need avatars, charts,
  continuous polling or background full-profile downloads. A failed refresh
  must not certify an old protected body as currently readable. Pagination is
  bounded and applies to admitted rows, without leaking hidden totals.
- **Phone layout.** Stack identifying text and dates; allow long international
  names to wrap. Do not rely on hover to reveal the only differentiating text.
  Preserve source-script names, locale-aware display and actual date precision;
  no inferred surname or forced Western name split.
- **Keyboard and assistive technology.** Use real list semantics and labeled
  existing controls. Keep visible focus and predictable navigation. Changing a
  filter should not throw focus into a row or announce every result. If details
  are useful, the disclosure exposes its state and supports the normal keyboard
  pattern. Status is communicated by text, not color alone.
- **Visual system.** Use Maia spacing, shared controls and semantic tokens.
  This view needs careful typography and hierarchy, not bespoke animations or
  an alternate table library. Validate narrow reflow, zoom, contrast, touch
  affordances and reduced motion using the existing Core review workflow.

Retention and visibility remain separate. Expired does not mean deleted; lawful
retention does not imply this missionary may read it. D34 selects no retention
period, indefinite archive, deletion operation or trash/undo interface. D27/D28's
private preparation rules do not transfer to referral records.

## Material concerns and precise prevention

Likelihood below is qualitative reasoning about a naive implementation, not
incident frequency measured in Core.

| Concern, severity / likelihood                                                    | What could go wrong and evidence                                                                                                                                 | Effect on answer and exact proposed requirement                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Historical name becomes Party authority — High / Medium                           | A familiar archive row links to the full contact despite no active relationship. Owner constraints and P12 reject this; comparator contact archives are broader. | Narrows A: **“Expired-referral history SHALL use a separately qualified minimal source-purpose projection; it SHALL NOT confer ordinary Party, contactability or private referral-body access.”**                                |
| Anonymous graveyard — Medium / High when redaction is applied mechanically        | Repeated restricted rows are unrecognizable while still exposing existence. Source field admission and the user's simplicity instruction both matter.            | Narrows A: **“An entry without useful currently permitted identifying information SHALL be absent from this reader's list, search, counts and suggestions; the source record SHALL remain subject to its own retention rules.”** |
| Expired mislabels the person — High / Medium                                      | Whole-contact phase copying removes an independently active supporter, implies refusal or changes finance. MPDX/TntConnect illustrate this coupling.             | Clarifies A: **“Expired SHALL describe the exact referral occurrence only; independent current supporter access, cultivation, contact restrictions and financial facts SHALL be evaluated separately.”**                         |
| Same names or unknown dates — Medium / Medium                                     | Name-based merging or fabricated dates create false history and future wrong-record continuation. Source occurrence identity is authoritative.                   | Adds precision: **“History SHALL preserve occurrence identity and actual source date precision; ambiguity SHALL NOT be resolved by invented facts, a duplicate Party or disclosure of otherwise protected context.”**            |
| Cleanup controls authorization — High / Medium                                    | Overdue cleanup leaves readable contact details after effective expiry. Q34's current-purpose boundary is temporal, not cosmetic.                                | Adds safeguard: **“Read eligibility SHALL honor source-effective expiry independently of physical cleanup and SHALL fence stale or late results after current authority changes.”**                                              |
| Premature continuation flow — Medium / High if normal archive patterns are copied | Restore/Continue appears to grant self-service rights and restore tasks or consent. Continuation actor remains unselected.                                       | Narrows scope: **“Viewing history SHALL have no continuation, task, subscription or communication effect. A continuation action SHALL require its separately selected and qualified source contract.”**                          |
| New inbox and approval burden — Medium / Medium                                   | A small read requirement grows into staff publication queues, alerts and mandatory per-row review. No source or founder requirement establishes this workflow.   | Simplifies A: **“Use the ordinary referral surface with Active as the default and one Expired view; this decision SHALL introduce no per-row approval, unread queue or expiry notification.”**                                   |
| Empty/error/existence confusion — High for privacy, Medium for usability / Medium | Hidden records produce revealing counts; a failed load says none; a dead link reveals a private reason. P12 and Carbon's state separation apply together.        | Adds state proof: **“Empty, failed and unavailable states SHALL be truthful without revealing denied existence or cause; error recovery SHALL not fabricate a successful empty result.”**                                        |
| Unsupported accessibility claims — Medium / Medium                                | Attractive mock text is treated as proof that keyboard, phone or localization works. Core testing rules explicitly require actual behavior checks.               | Adds release proof: **“The implemented view SHALL pass the scoped browser, keyboard, focus, reflow and current-permission cases before activation; this research note supplies no such pass.”**                                  |

No independent new payment, email-provider, map, AI, calendar or coach-summary
feature is needed. History does not create an activity or performance metric.
The proposal depends on the existing referral/permission owners and shared UI,
not a new third-party archive service.

## Falsifiable UX acceptance cases for later implementation

1. With qualified historical access and no active relationship, Maya can find a
   recognizable approved expired occurrence; opening it does not expose contact
   channels or private context and does not mutate the source.
2. Active remains the initial work view. One existing view change reaches
   Expired; no per-row acknowledgment or modal is necessary to read its minimal
   information.
3. Two permitted occurrences with the same display name remain distinct and
   show only known permitted differentiating context. No Party duplication or
   name-based merge occurs.
4. A missing or imprecise date is not replaced with a cleanup timestamp,
   guessed day or universal deadline. A source-established expired state can
   remain visible without inventing a date.
5. An unidentifiable or denied entry contributes no row, match, count, page-gap
   total or suggestion. Generic assistance does not confirm the hidden item.
6. The same person's independently authorized current supporter record remains
   usable. Its existence does not widen the expired introduction's fields.
7. Crossing effective expiry while cleanup is delayed cannot preserve the old
   full active projection. Current access removal and tenant switching fence
   late results and clear denied content.
8. Legitimate empty, filtered-no-result, load-error and unavailable-link states
   use the corresponding truthful behavior. Retry is repeatable and read-only.
9. Long names, right-to-left text, phone reflow, zoom, keyboard navigation,
   screen-reader control/state names and non-hover access to identifying text
   work in the actual shared components. No status relies on color alone.
10. Expired history adds no donor messages, requests, tasks, target progress,
    automatic continuation, new permission or changes to source retention.

These are proposed tests, not executed tests. Before implementation, the owning
review must settle and reconcile the explicit bounded historical-purpose
amendment with P9/P12, define the producer's allowed identifying fields and
eligibility, and retain the current source limitation honestly. No numerical
expiry or retention default needs to be invented to settle this UX decision.
