> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

# Question 07, revised — Ministry Update visibility and notifications

> **Ratified 7 September 2026.** Conrad explicitly ratified Question07’s corrected two-control decision and C01–C22 with the recommended adjustments. Historical requests for ratification below are answered. Required implementation/source/provider/browser proof remains separate.

> **Answered 7 September 2026: A — Two independent controls.** The [complete Q07 execution review](phase25-r07-adversarial-review.md) now supersedes these pre-answer recommendations. Corrected wording/C01–C22 await ratification. Do not re-ask A versus combined choices.

7 September 2026. **Founder clarification recorded; revised options await a decision.** The former overview-versus-chooser question is superseded for now, not answered. Questions 01–06 remain ratified. This is researched grooming, not a PRD, formal specification, ticket set or implementation authorization.

## The correction

The previous question blurred email about Asym Ministry Update posts with a missionary's separately managed newsletter. Conrad has clarified that missionaries manage the newsletter list and send those newsletters themselves. Asym must not pretend it can subscribe/unsubscribe a person on that external list or certify its current membership.

Conrad also explicitly wants a public newsletter-request journey for signed-in people and guests, including non-donors: collect the appropriate contact information, pass the request to the missionary, and create an email and missionary-dashboard notification. The donor portal manages organization communications and preferences for Asym Ministry Update posts, including notifications and hiding a ministry from the personal reading list.

<!-- prettier-ignore -->
| User need | Correct meaning | Boundary |
| --- | --- | --- |
| Organization communications | Preferences for messages the tenant organization actually controls, including owner-permitted receipt delivery choices and optional organization topics | Not a universal switch for every missionary's external mailing list; required-message/contact/document rules still apply |
| Email about an Asym Ministry Update | A preference governing eligible notifications about posts published through Asym | Not automatic email after every post; source notification intent, current audience, consent and delivery rules still decide whether a message may be sent |
| Hide a ministry's posts | Personal suppression from the donor's ordinary Ministry Updates reading list and its dashboard preview | Not deletion, permission revocation, stopping gifts, unfollowing a relationship, blocking a person or external newsletter withdrawal |
| Ask for a missionary newsletter | A purpose-specific request handed to the missionary using the submitted contact details | Request received, missionary notified, list membership, newsletter sent and newsletter delivered remain different facts |

The first and fourth rows are different work. The newsletter request is not an on/off preference that Asym can read back from an unintegrated external list. The two middle rows are the donor-side decision now.

## Recommended donor experience

Use two clearly separated sections in the eventual preference experience: **Organization communications** and **Ministry Updates**. This is a recommendation reflecting different jobs, not ratification of a final navigation layout or a new topic catalog.

For each source-qualified ministry in Ministry Updates, show its privacy-safe name and two explicit meanings:

- **Show in my Updates** — whether its eligible posts appear in the ordinary reading list.
- **Email me about new posts** — whether the donor wants eligible Asym update emails for that source.

Use text labels and concise status/help, not unexplained eye/bell icons. Apply exact base-maia, Base UI and shared semantic tokens. The same controls can be reached from the relevant post's menu and the central preference page without storing competing copies.

Hiding from the list should have a quiet Undo and a discoverable **Hidden ministries** management path for current permitted scopes. Restoring posts must not silently opt a person into email. A filtered reading view remains the non-mutating R02 action; hiding is an explicit saved preference. Do not save a new hidden preference merely because a donor selected a filter or scrolled past a post.

## The revised alternatives

The meaningful choice is how to expose the relationship between reading-list visibility and Asym update email. Neither alternative controls external newsletters.

<!-- prettier-ignore -->
| | A — Two independent controls, recommended | B — Three combined choices |
| --- | --- | --- |
| Controls | Show in my Updates; Email me about new posts | Show posts and email me; Show posts without email; Hide posts and stop update emails |
| Hiding | Changes the reading-list preference only; email choice stays as it was | The plainly labeled Hide choice deliberately requests both hiding and stopping that source's Asym update emails |
| Main strength | Each label does one understandable thing and supports all four combinations | Three common modes are easy to scan; the quietest mode handles both effects together |
| Main cost | Two choices, with a potentially surprising hidden-but-email-on combination if poorly explained | No direct email-only mode; combined mutations need truthful partial/unknown results and separate source authority |
| Restore | Show posts again; preserve the current email choice | Restore to showing posts without automatically enabling email; enabling email requires its own explicit permitted choice |

**Illustrative example:** Alex prefers to receive Maya's Asym post notifications by email and keep the dashboard focused on other ministries. A supports this directly. B's three presets do not directly offer it. Another donor wants no ordinary Asym updates from that ministry anywhere; B offers one clearly named combined choice, while A lets that donor turn off the two independent preferences.

No research here establishes how common those donor needs are. They are reasonable examples that expose the tradeoff, not invented ministry usage statistics.

With A, all four combinations have clear meanings:

<!-- prettier-ignore -->
| Show posts in ordinary Updates | Eligible update emails requested | Meaning |
| --- | --- | --- |
| Yes | Yes | Read here and receive eligible email notifications |
| Yes | No | Read here without update emails |
| No | Yes | Keep this ministry out of the ordinary dashboard list; retain eligible update emails |
| No | No | Hide from the list and stop these optional update emails |

These are desired personal choices, not promises of content access or delivery. Source permission, released content, notification intent, contact validity and suppression still apply. No opt-in or enrollment default is decided here.

**Recommend A.** It maps cleanly to the two jobs Conrad described, keeps the source meanings separate, and avoids surprising email effects when the donor simply tidies the dashboard. Two clear controls are less complexity than several preset modes plus a special state when real preferences do not match a preset. When hiding while email is on, concise feedback can say: **Hidden from your Updates. Email notifications remain on.** That is feedback, not a forced second decision or automatic modal.

B is a valid presentation option if its two effects are explicitly requested, separately authorized and accurately reported. It must not create a global database rule that hidden means unsubscribed, erase existing email-only states, or reinterpret another channel's opt-out. If another permitted path produces a state outside the three presets, display it truthfully rather than silently coercing it. A combined shortcut over otherwise independent controls is still A with a shortcut; it is not a different underlying model.

## The external newsletter request: preserve the idea without claiming control

The user's request direction is confirmed; the detailed source contract is not yet ratified or implemented. The smallest permanent path should reuse the existing public-form and communication foundations with one exact purpose owner, rather than add a newsletter engine or a second missionary inbox.

1. The public action makes its effect explicit: the person asks the named missionary to send their separately managed newsletter. **Request newsletter** is the clearest proposed label; a familiar Subscribe label would need equally clear explanatory text. Final label choice is not settled here.
2. Use a short form. Proposed minimum is the chosen name and email address plus clear disclosure that these details will be shared for this request. Reuse an appropriate current signed-in identity/contact only with clear user intent; guests can request without donating or creating a portal account. Do not infer a Donor, support relationship or content grant from the form.
3. Record the request through its owner before saying **Request received**. Record the purpose and permission evidence; do not record **Subscribed** merely because the form was submitted. Request verification and actual external subscription remain distinct.
4. Produce the requested missionary email and in-dashboard notification through Phases 17/6, referencing the same request. The recipient must come from current, authorized routing, not a browser-supplied email address. Where a qualified private owner view exists, use a minimal safe email summary and authenticated link. If a bounded email-only Primary Outcome is explicitly qualified instead, disclose only its permitted minimal request fields; do not add a second request inbox merely to support a link. No private CRM enrichment is implied.
5. Notification channels have independent outcomes. A successful dashboard notice is not rolled back because email fails; retry only the failed eligible delivery. No new reminder campaign, due-date task, duplicate request queue or auto-enrollment is implied. A notification being read is not proof the missionary added someone to an external list.
6. The missionary handles the external newsletter using its actual list and unsubscribe mechanisms. Asym can truthfully report its request/handoff evidence; it cannot show a current subscription switch, promised newsletter arrival or a successful external unsubscribe without an explicitly qualified later integration.

**Guest verification is an unresolved execution decision, not an assumed legal mandate.** A forged address can generate unwanted leads and downstream mail. Email ownership proof before releasing the missionary notifications is the recommended direction for unknown addresses; already sufficient current proof should not create redundant friction. Phase 4 requires proof for claims/protected access, but that does not automatically settle all public intake. The verification threshold, exact fields, permission disclosure, retention, cancellation and unverified-request handling need explicit qualification under the request-purpose owner. They are not silently ratified by the hide/email choice. Mailchimp documents both single and double opt-in; its form defaults do not configure an Asym form/API handoff. [Mailchimp opt-in methods](https://mailchimp.com/help/set-signup-preferences/), [permission guidance](https://mailchimp.com/help/the-importance-of-permission/).

This handoff does not bypass the current Phase 32 subscription-owner gate by renaming signup as a generic Contact form. The cross-phase amendment below must explicitly admit the request-only purpose, its authority and its evidence boundary. Exactly one operational Primary Outcome must be qualified: D26's existing email-destination pattern where sufficient, or a certified Phase 28 purpose record if the product needs to manage completion there. The dashboard notification is not itself a second work record or proof of external enrollment. This donor-controls question does not silently decide that operational choice.

## Source ownership, amendments and current reality

<!-- prettier-ignore -->
| Finding | Exact source and status | Required disposition |
| --- | --- | --- |
| R02's filter is view-only; it introduced no cross-session saved-filter database | Ratified R02 C03 and C04 | Add the explicitly requested persistent hide preference as a separate action. Preserve the non-mutating filter, immediate reading, authorization, source ordering and continuation. Previous no-saved-filter wording does not prohibit a separately governed hide preference. |
| Ministry Update release, audience, notification intent and consent are separate | Active Phase 22 D11 decision log:1797–1816,1830–1839; UX ownership:1905–1907 | Preserve separate facts. Explicit paired narrowing in B can be composed; never let display state silently become send authority. |
| Missionary Page launch catalog excludes forms and third-party embeds | Active Phase 22 PRD:619–629, D20 | The newsletter request needs an explicit bounded first-party action/catalog amendment and compatible release rules. This is not permission for arbitrary widgets or URLs. |
| Public Forms already have a purpose-qualified owner and independent notifications | Active Phase 23 D26 decision log:6453–6580 | Reuse this pattern, not a new submissions/notification framework. A durable request owner with email/dashboard notification children requires exact qualification; do not promote the form envelope into a generic CRM inbox. |
| Newsletter consent/confirmation currently waits for the subscription owner | Phase 23 D26:6542–6545 | Explicitly reconcile the new request-only workflow with Phase 32. Do not disguise actual enrollment as an email-only form to bypass the gate. |
| Missionary newsletter/list and support context are future source responsibilities | Roadmap Phase 28:3083–3087,3130–3137 and Phase 32 scope | Clarify request handling versus external list management; admit a narrow guest/non-donor request-recipient purpose. Do not manufacture an active supporter, referral, donor or relationship to make the person visible. |
| Current Subscribe and preferences UI do not prove this works | Mock worker/update content and inert Subscribe; local notification-state/timer; coarse feed API and inconsistent defaults | Treat as prototypes/bridges to replace or reconcile through owners. No source mutation or provider action was performed in this review. |

**Classification:** separate truths and source-owned communication are **Durable patterns**. The existing public-form machinery is a **Useful precedent** that needs exact purpose qualification. Current coarse preference APIs are **Temporary bridges** with source inconsistencies; fake Subscribe/Save behavior is an **Implementation accident**. Claiming external subscription state or deriving access from a request is a **Conflict with first principles**.

The governing snapshots remain develop `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`; Phase 22 PR1323 `70c50e8c97556c43be5543332fb0993b468b90ab`; Phase 23 PR1340 `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`. Both active specification PRs remain open; that is accepted planning context, not implemented behavior.

Existing implementation work was cross-referenced before proposing new work: [#1382](https://github.com/Asymmetric-al/core/issues/1382) public-form purposes/acceptance, [#1383](https://github.com/Asymmetric-al/core/issues/1383) verified email destinations, and [#1386](https://github.com/Asymmetric-al/core/issues/1386) form notifications remain open. Their bodies preserve one Primary Outcome and independently governed deliveries; #1382 names #1380, #1383 names #1382 and communication prerequisites, and #1386 names #1384/#555/#563/#897/#903. [#1283](https://github.com/Asymmetric-al/core/issues/1283) still excludes forms from the current Page catalog; [#614](https://github.com/Asymmetric-al/core/issues/614) does not supply a complete guest contact-intake owner. These are dependencies to reconcile, not completed capabilities or permission to publish duplicate tickets.

## Edge cases that shape the recommendation

- **Hidden posts, email still wanted:** A retains the choice. A direct link deliberately opened from an eligible email may show the currently authorized post without permanently restoring it to the ordinary list. Hidden is not an authorization denial. This direct-link behavior is a proposed execution rule to review with the chosen answer.
- **Everything hidden:** Say there are no posts in this selected reading view and offer management of currently safe hidden scopes. Do not claim there are no ministries or no updates anywhere. Do not automatically show hidden posts to fill an empty page.
- **Restoring a ministry:** Apply current authorization and history rights; do not reveal withdrawn/restricted content, replay old notifications or opt email back in.
- **Coauthored or multi-source content:** Use the content owner's canonical subject/source association. Never infer a hide scope from the writer's name, a public page, spouse or free-text ministry label. Exact overlap/exclusion semantics need owner definition and proof before implementation; a client filter is insufficient.
- **Partial data or conflicting saves:** Unknown is not off. Hidden and email preferences retain separate confirmed/pending/failed states. A late response from another Tenant/person/context must not render under the new heading. B must not claim both effects completed when one remains unresolved.
- **A post already has an admitted notification:** Email opt-out rechecks the current source gate for unstarted sends; already in-flight delivery cannot be recalled. Hiding alone under A has no dispatch effect.
- **Privacy:** A private reading preference is not a missionary support-health change or a new notification to the missionary. Staff diagnostic access must be purpose-authorized; do not add donor disengagement scoring. Hidden controls, counts and search must not leak restricted-worker identities.
- **Guest request or mistyped address:** Do not match/claim a CRM identity by shared email alone or disclose whether an account exists. Verification/abuse controls must be proportional and accessible. A guest request creates no authenticated protected access.
- **Duplicate request, refresh or timeout:** Use the one durable request identity and safe retry/readback. Repeating a transport call must not create repeated missionary email/dashboard alerts. A legitimate later request is not a permanent block or silent duplicate.
- **Missionary unavailable, destination changed, revoked access or suppressed delivery:** Use current owner routing and truthful status. Do not silently route private details to a teammate/spouse or claim the missionary was notified. Exact handling belongs in the request-purpose release contract.
- **External newsletter withdrawal:** The external list's actual unsubscribe path controls that newsletter. A future Asym request to ask the missionary to stop is not the same as confirmed removal and is not newly approved here.
- **Organization receipts:** “How I receive receipts” needs the receipt/message owner's permitted choices. Marketing opt-out alone does not suppress required messages; required classification does not bypass do-not-contact, provider or security restrictions. Document access is separate from email delivery.

## Adversarial check

### What could go wrong with this answer?

Asym could falsely claim subscription control, send forged requests to missionaries, turn a harmless feed choice into a hidden email opt-out, or confuse saved preferences with delivery. Separate request, display, consent and delivery facts; require explicit source-owned effects and truthful outcomes.

### What hidden assumptions are we making?

The current public Subscribe button is not a working request system. A missionary may not have an eligible route, an external list may be unknown, and a supplied address may be unverified. The email-only preference example is plausible, not measured donor demand. These are qualification and product-evidence gaps, not facts to invent.

### How does this affect the whole product?

Phase 25 owns the donor's experience; Phase 22 owns released Updates and page catalogs; Phase 23 owns qualified form ingestion/routing; Phase 28 supplies the missionary purpose/surface; Phase 32 owns its subscription boundary; Phases 3/4/9/10/12 govern identity, current rights and privacy; Phases 17/6 govern messages and delivery. The requested cross-phase amendments must be explicit. No parallel CRM or newsletter sender is needed.

### How does this affect the end-user experience?

Name the thing being controlled. Donors see organization messages and Asym posts separately from external newsletter requests. Two plain controls offer quiet reading or inbox-only use. Hiding is recoverable; unsubscribe is precise; required unfinished work and unknown outcomes are not disguised as success.

### Does this follow modern best practices?

Mastodon explicitly separates muting content from optional notification muting. Substack distinguishes following from email subscription and provides a recoverable muted-content list. Church Center distinguishes notification preferences from email behavior. These are **Useful precedents**, not Asym permissions, subscription defaults or a universal UX verdict. Do not copy social discovery, public follower lists, default muting, ranking or a generic blocking system. [Mastodon](https://docs.joinmastodon.org/user/moderating/), [Substack following](https://support.substack.com/hc/en-us/articles/18261513315348-How-does-following-work-on-Substack), [Substack mute/restore](https://support.substack.com/hc/en-us/articles/14742982381332-How-do-I-mute-other-people-on-Substack-Notes), [Church Center](https://help.planningcenter.com/en/141287-view-notifications-and-update-preferences.html).

### Does this fit Asym’s existing repo and product direction?

The separation fits governing architecture, but the newsletter-request public action and guest-purpose visibility require explicit amendments/qualification. Persistent hiding is a newly requested personal preference alongside R02's unchanged filter. The original Q07 page-organization choice did not ratify any newsletter management authority.

### Should we adjust the recommendation?

Yes. Replace the old newsletter-like grouping premise with organization communications plus internal Ministry Update controls. Recommend A's independent controls. Record the request-only newsletter direction and its exact owner changes, without claiming the request flow or external subscription works today. Do not ask the founder to choose database facts or bundle guest-verification policy into the hide/email decision.

## Proof and records required before implementation is declared complete

This turn performed primary-document research, source/contract inspection and independent owner/UX/runtime review. No email, notification, subscription, payment, browser acceptance or database concurrency test was executed. Existing five setup-change files were preserved.

Future proof must cover the chosen hide/email combinations, no mutation from filter/GET/preview, scope before pagination and late-context races, restoration/current protected access, explicit consent/contact revision and send-time ordering, truthful partial results, two-user/Tenant isolation, private diagnostics and accessible mobile/keyboard/error behavior. The newsletter request additionally needs certified purpose/route/recipient/retention/verification rules, guest/no-donor acceptance, durable request with independent message outcomes, duplicate/lost-response/abuse tests and exact provider-contract evidence. A source subscription gate cannot be bypassed with a generic form. No historical evidence is presented as new feature proof.

### Repository references

- [ADR0001](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/adr/0001-asym-postgres-owns-crm-truth-twenty-retired.md), [platform boundaries](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/openspec/specs/platform-boundaries/spec.md), [roadmap Phases 28/32](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/roadmap.md).
- [Phase 22 PRD D20](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/prds/sitestacker-parity/phase-22-public-ministry-pages.md), [Phase 22 D11 decision log](https://github.com/Asymmetric-al/core/blob/70c50e8c97556c43be5543332fb0993b468b90ab/docs/prds/sitestacker-parity/phase-22-public-ministry-pages-decision-log.md).
- [Phase 23 D26](https://github.com/Asymmetric-al/core/blob/9069dcad67f9630323474ca5ee8bcc85ca7bf0f6/docs/prds/sitestacker-parity/phase-23-web-studio-cms-decision-log.md), [Phase 17 message owner](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-17-system-messages-template-management.md), [Phase 4 identity](https://github.com/Asymmetric-al/core/blob/7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd/docs/prds/sitestacker-parity/phase-04-identity-account-claiming-foundation.md).
- [Ratified R02](phase25-r02-adversarial-review.md); [grooming decision log](../decision-log.md).

## The one decision now

Recommendation: **A — Independent Show in my Updates and Email me about new posts controls.** Alternative: **B — Three combined choices, with hiding explicitly stopping Asym update emails too.** Neither touches external missionary newsletters or required organization messages. This question does not decide a global hidden-implies-unsubscribed invariant.

**How should donors control the visibility and email notifications of Asym Ministry Updates?**
