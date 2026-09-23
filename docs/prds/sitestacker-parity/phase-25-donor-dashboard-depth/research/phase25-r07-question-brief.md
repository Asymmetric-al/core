> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 07 — Finding your communication preferences

> **Superseded by founder clarification, 7 September 2026.** This overview-versus-chooser question was not answered. Missionary newsletters are request-and-handoff, not portal-managed subscriptions. The [revised Question 07](phase25-r07-revised-question.md) separates organization communications, Asym Ministry Update emails, personal feed hiding and the public newsletter request. Do not ratify the old A/B choices from this clarification.

Research and founder question, 7 September 2026. **Recommendation only; awaiting the founder's answer.** Question 06's corrected decision and C01–C20 are explicitly ratified. This remains grooming, not a PRD, formal specification or implementation authorization.

## The one decision

On a normal visit to Communication preferences, should the donor start with one calm grouped overview of their available choices, or first choose the organization/ministry whose messages they want to manage?

Both alternatives provide the same source-qualified topic and channel choices, preserve exact targeted entry, and enforce the same consent and authorization boundaries. They differ in what a neutral entry shows first. Neither creates a bulk opt-out, an all-in-one save transaction, a fixed topic taxonomy or a new consent model.

## Why this is the next question

Q01/Q02 established easy self-service and accessible Ministry Updates; Q03/Q06 separated payment maintenance from financial action. Communication preferences now needs the same clarity: a person should be able to reduce particular emails without wondering whether they stopped supporting a ministry, lost access to its updates, or changed every message from the organization.

This is genuinely open. The current roadmap already requires granular topic/channel preferences and scoped one-click unsubscribe, so those rights are not being re-asked. Phase 22 D11 explicitly assigns preference-center UX to Phase 25 while keeping supporter relationship, content access, notification intent, consent, suppression, cadence and delivery separate. Phase 3 reserves the deeper center; its existing consent floor remains binding. The current prototype is not evidence of a settled working journey.

Other possible next questions were considered. Phase 19 already requires yearly document grouping, so asking yearly versus document-type organization would reopen a settled decision. Dedicated Documents entry versus access through Giving history remains a later legitimate navigation question. Channel-first preferences is less useful as today's primary alternative while unsupported channels must remain unavailable. No new product choice is inferred from a screenshot or from a provider's database fields.

## Concrete donor situation

Illustrative example, not a claim about observed ministry behavior: Alex receives organization news and updates from Maya's and Ravi's ministries. Assume the source contracts expose those exact, currently authorized email choices. Alex wants to stop Maya's emails, retain Ravi's emails and organization news, and still read any Ministry Updates Alex remains authorized to access.

The task is to make the intended scope obvious. The example does not declare every supported or visible ministry subscribable, make giving consent, or prescribe a new organization-wide subscription catalog.

## The alternatives

<!-- prettier-ignore -->
| | A — One calm grouped overview | B — Choose the organization or ministry first |
| --- | --- | --- |
| First screen | Organization choices and individually authorized ministry groups, with current preference states or concise summaries. Reveal detailed choices when needed. | A clear choice of the organization or an authorized ministry. Selecting one opens only its settings. |
| Alex's journey | Open preferences, find Maya's group and change that exact email choice. The overview makes Ravi's and organization choices easy to verify as unaffected. | Open preferences, choose Maya, then change her exact email choice. Return to the chooser to inspect Ravi or organization settings. |
| Strongest benefit | One place to understand and manage the whole permitted picture; less navigation between sources. | A quieter focused settings view, especially when the person has many independently configurable ministries. |
| Main cost | Can become a long or noisy page if every detail is expanded or unrelated choices are listed. | Adds a selection step on a neutral visit and hides other sources' states while editing one. |
| Simplicity constraint | Use restrained groups and readable summaries, with bounded navigation/search only if the real list requires it. No giant channel matrix. | Keep one source selector and one shared settings renderer; no separately maintained settings system for each ministry. |
| Exact targeted link | Opens the permitted relevant section directly, preserving safe context through authentication. | Opens the permitted focused source directly, bypassing the neutral-entry chooser. |

If B's first screen also exposes every current setting, it becomes A with a different visual treatment. The meaningful distinction is overview-first versus choose-first, not cards versus rows or inline expansion versus a separate detail route.

## Recommendation

**Recommend A: one calm grouped overview, with detail revealed as needed.** It best supports the already-ratified goal of clear, effortless self-service and helps a donor verify that changing one ministry's emails did not affect another. It also gives organization-wide communication choices a predictable home without requiring the donor to navigate through ministries to find them.

B is credible for people who mainly manage one known ministry or have many choices. Preserve its focused-edit advantage within A through exact links and concise group details; do not require a chooser on every ordinary visit. Do not promise fewer clicks for every task: a targeted link can make both alternatives equally direct.

This recommendation is a product judgment supported by documented patterns, not a measured Asym usability result. Validate it with representative donors who have no ministry preferences, one, and several; include a person managing someone else's giving who lacks authority to change that person's communication consent.

## Evidence and classification

<!-- prettier-ignore -->
| Pattern | Classification and evidence | What Asym should take from it |
| --- | --- | --- |
| Explicit named communication choices | **Useful precedent.** HubSpot documents named, described subscription types on a preference page and distinct Subscribed/Unsubscribed/Not specified states. [Official guide](https://knowledge.hubspot.com/marketing-email/set-up-email-subscription-types). | Make each choice's scope understandable and represent unknown/unset states honestly. Do not copy HubSpot's contact properties, commercial limits or assume its subscription catalog is Asym's. |
| Current choices in one center | **Useful precedent.** HubSpot documents a recipient preference page with named/described types and the recipient's current selections. [Official preference-page guide](https://knowledge.hubspot.com/marketing-email/customize-email-subscription-pages). | This supports A's overview. Do not copy personalized-email identity, all-off behavior or treating every unchecked/unseen field as an opt-out after a partial read. |
| Focused creator settings | **Useful precedent.** Patreon explicitly documents choosing a creator and then changing that creator's Lives notification setting. [Official instructions](https://support.patreon.com/hc/en-us/articles/36658508974733-How-can-I-join-a-Live-on-Patreon). | This supports B as a credible alternative. It is not evidence that creator membership equals Asym ministry consent or that one navigation pattern performs better. |
| Group-specific notification choices | **Useful precedent.** Church Center documents product/group notification settings and distinguishes push delivery from in-app notification visibility. [Official guide](https://help.planningcenter.com/en/141287-view-notifications-and-update-preferences.html). | Make the affected source and effect clear. This does not prove A's overview, qualify Asym push, or import Church Center's receipt/channel policy. |
| Independent content access and communication eligibility | **Durable pattern.** Phase 22 D11 and Phases 3/6/17 separate these source facts. | An email change does not itself modify giving, supporter relationships, content permission or which authorized Ministry Updates can be read. |
| Same consent and send boundary from every surface | **Durable pattern.** ADR0001 and platform boundaries prohibit competing application-local business truth; Phase 6 owns the shared communication seam. | The central page and contextual links use the same source commands/projections. Mission Control sees the same properly scoped evidence. |
| A working-looking local settings tab | **Implementation accident.** Current notification settings use local state and simulated success; broad prototype categories are not a qualified catalog. | Replace through owning services when implementation is authorized. Do not turn a prototype toggle into a new permanent permission or consent field. |
| A required-message exemption from all contact restrictions | **Conflict with first principles and governing source.** Phase 3 keeps an absolute do-not-contact floor; Phase 17 also preserves applicable provider/safety restrictions. | Marketing opt-out alone does not stop required receipts, but “required” is not permission to bypass stronger restrictions or promise delivery. |

## One-click unsubscribe is a separate, already required journey

The preference-center layout does not add a login or confirmation step to mailbox one-click unsubscribe. RFC 8058 specifies a recipient/list-bound HTTPS POST without cookies or HTTP authentication, a hard-to-forge identifier, signed unsubscribe headers and no redirect. An ordinary GET or link scanner does not perform that mutation. This token authorizes the exact unsubscribe, not a full personal settings page or another person's subscriptions. [RFC 8058](https://datatracker.ietf.org/doc/html/rfc8058).

Gmail explicitly distinguishes a body link to a preference page from the required header-based action, and says one-click can remove the recipient from the particular mailing list associated with the message. Its current FAQ uses a 48-hour fulfillment expectation. Yahoo requires honoring unsubscribes within two days; its detailed standards recommend RFC 8058 while also allowing mailto. Asym retains the expressly required RFC 8058 contract and prompt source enforcement rather than adopting the weakest provider alternative or treating two days as the desired wait. Already in-flight delivery must still be explained honestly. [Gmail FAQ](https://support.google.com/mail/answer/14229414?hl=en), [Yahoo standards](https://senders.yahooinc.com/best-practices/?is_listing=false), [Yahoo FAQ](https://senders.yahooinc.com/faqs/).

## Conditions common to both choices

- **Real choices only.** Build the display from a source-qualified preference projection. A gift, follow, supporter relationship, visible update or shared email does not create a preference row, permission or opt-in. Completing the source catalog/commands is required owner work; this question does not assume they already exist.
- **Exact personal scope.** Tenant, subject, contact point and purpose remain exact. Q04's right to help manage giving does not automatically confer authority to change another person's communication consent. Current authorization and privacy-safe labels also govern summaries, search and counts.
- **Unambiguous organization meaning.** The organization group concerns messages from the ministry organization hosting this portal. It must not be confused with an organization whose giving the person helps manage under Q04.
- **Truthful status.** Show the donor's saved choice distinctly from a pending verification, unknown status or provider delivery block when relevant. Failed saves must not look successful. Viewing, searching or opening a group changes nothing.
- **No hidden broadened action.** A ministry-specific change affects its exact source-qualified purpose/channel. No “all ministries,” “all email,” auto-enrollment, aggregate toggle, cross-source save or consent-reset behavior is approved by A or B.
- **Ministry Updates stays independent and easy to reach.** Preference controls may explain the distinction and link back to existing authorized Updates. They do not become a second feed, control content visibility, or add a subscription-discovery directory. Normal shared Updates links retain Q01/Q02 meaning.
- **Available channels only.** Do not show SMS, push, WhatsApp or a digest-frequency selector as operational unless the appropriate source and delivery contracts actually support it. This choice does not launch a new channel or cadence.
- **Necessary messages remain governed.** A marketing choice does not itself suppress required receipts; contact/security/provider restrictions remain. Access to already-authorized documents is a separate permission question.
- **Clear mobile and accessible presentation.** Exact base-maia, Base UI and shared semantic tokens; visible scope labels, readable descriptions and current status, predictable keyboard/focus behavior and no color-only meaning. Long translations and names must not hide which source a control affects. Precise component choice and layout are not frozen by this decision.
- **Recoverable current behavior.** Preserve independently loaded sections, safe return paths and truthful error/pending states. Recheck current authority and source revision on mutation; late responses from another context must not render under a new heading. Existing consent/dispatch ordering decides which unstarted sends stop; the UI cannot recall an in-flight email.
- **One permanent owner.** No parallel portal preference table, sender, recipient directory or boolean inferred from browser state. Phase 32 later consumes the same consent/suppression/export boundary; it does not restore unsubscribed people because an external list disagrees.

## Repository checkpoint and proof limits

Current remote develop and research worktree: `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. The Phase 22 source branch remains open at `70c50e8c97556c43be5543332fb0993b468b90ab` (`codex/phase-22-public-ministry-pages-grill`, PR1323); Phase 24 remains open draft at `ab1a1703a725be454376990a7fe68aef2e048026` (`codex/phase-24-multi-site-management-spec`, PR1558). Those accepted planning decisions are not deployed behavior.

- [Current roadmap](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md):2875–2879 — granular preferences and scoped unsubscribe.
- [Phase 3](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-03-minimum-permission-role-scoped-projection-foundation.md):310,370–411 — deeper-center reservation and contact/suppression authority.
- [Phase 22 D11 decision log](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md):1797–1816,1830–1839,1905–1907 — independent truths and preference-center UX ownership.
- [Current notification settings](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/apps/donor/app/%28dashboard%29/donor-dashboard/settings/page-client.tsx):474–500 — local state and simulated save; no target proof.
- [Platform boundaries](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/platform-boundaries/spec.md) and [ADR0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md) — source ownership and current scope.

Current implementation is mixed, not wholly absent: the email consent gate exists and [PR502](https://github.com/Asymmetric-al/core/pull/502) is merged (8 July, head `4dbf7e6ca00857a4217c7dde1e9fe8262dfbc582`). Older #555/#680 statements that it is unmerged are stale. The coarse feed-preference API also exists, but it combines follow/feed/email booleans, uses a fixed Tenant and disagrees with the donor snapshot about default states. None supplies a complete per-ministry preference catalog or this page's qualified journey. The preference center must converge those paths into the owning source model; it must not infer opt-in from either default.

Fresh read-only owner issues: [#494](https://github.com/Asymmetric-al/core/issues/494) narrow-surface mutations, [#555](https://github.com/Asymmetric-al/core/issues/555) consent snapshot, [#557](https://github.com/Asymmetric-al/core/issues/557) suppression/export eligibility, [#680](https://github.com/Asymmetric-al/core/issues/680) channel/purpose authority and [#895](https://github.com/Asymmetric-al/core/issues/895) exact scoped unsubscribe remain open/blocked. The first four native blocker lists are empty despite body dependencies; #895 lists #893/#894. This is not readiness. Exact per-ministry catalog/commands and consent provenance still require source-owner completion and review; neither A nor B ratifies an invented schema or enrollment policy. No duplicate ticket is proposed.

Benchmark counterexamples were also examined. Fundraise Up's current marketing-consent guide says post-gift consent cannot be edited in its donor portal; staff-dependent updates are not the desired Asym self-service outcome. Givebutter documents account-wide marketing unsubscribe by channel, which must not silently replace Asym's narrower intended scope. These limitations matter more than a marketing checklist. [Fundraise Up](https://fundraiseup.com/docs/marketing-consent/), [Givebutter](https://help.givebutter.com/en/articles/5497894-how-unsubscribed-contacts-are-handled).

The research checks documented product journeys, source intent and current code; it does not establish actual donor usage distribution or comparative usability. No email, unsubscribe, provider mutation, live preference change, browser acceptance test or new PostgreSQL test was performed for this question. The five existing setup-change files remain preserved. A future selected answer will be pressure-tested against exact owner contracts and current implementation evidence before being ratified; this brief does not declare Phase 25 complete.

## Founder decision

Recommendation: **A — One calm grouped overview.** Alternative: **B — Choose the organization or ministry first.** Both preserve the same exact controls and source boundaries.

**What should a donor see first when opening Communication preferences?**
