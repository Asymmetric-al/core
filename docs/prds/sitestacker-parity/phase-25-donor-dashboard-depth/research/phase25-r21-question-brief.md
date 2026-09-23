> Historical research record adopted for AL-1563. Scope and testing are ratified; earlier pending decisions and research-only workflow restrictions below preserve chronology. The [implementation specification](../../phase-25-donor-dashboard-depth.md) and its owner contracts are the implementation authority for this proposal. No historical synthetic/source check certifies target runtime behavior.

> **Fully ratified, 8 September 2026:** Conrad accepted Question21 A1–A4/J01–J16/V01–V12/C01–C22 and reviewed Maia defaults, including direct single-target controls, complete qualitative summaries, no numeric overview counts, independent scopes/saves and owner-converged adoption. T01–T18 remain required target proof. Earlier provisional wording is historical; ratification does not certify implementation or live behavior.

> **Current status, 8 September 2026:** Conrad selected A, one calm overview with editing as needed. The [completed adversarial review](phase25-r21-adversarial-review.md) records corrected execution awaiting ratification. The unanswered wording below is historical pre-answer research.

# Question 21 — Finding communication and Updates preferences

Research date: 8 September 2026. Question20 is fully ratified, including its availability limits and ReUI as the reference for all actual Asym/Core grids. **Question21 is unanswered.** This is a researched founder decision, not a PRD, formal specification, implementation plan or permission to change live preferences.

## The decision

On a normal visit to **Preferences**, should the donor see one calm overview of their communication and Ministry Updates choices, with focused editing as needed, or choose a category before seeing its controls?

This question concerns the communication/Updates area, not a redesign of Profile, Security, Payments or all account navigation. Q07 explicitly left this entry-layout choice open after Conrad corrected the missionary-newsletter model. Q13 later settled the routine receipt-email preference and its direct entry, but did not settle the common landing layout. We are not re-asking what the controls do.

## Concrete example

Alex wants fewer emails about Maya's **Asym Ministry Updates**, while continuing to see her posts in the donor dashboard. Alex also wants to check whether routine recurring receipt emails are on. Assume these particular source-owned choices are available and Alex has the required rights; this is an illustrative task, not observed donor research.

Both alternatives use the same already-ratified independent controls, exact scope, save behavior and direct links. Neither lets the portal manage Maya's externally sent newsletter.

<!-- prettier-ignore -->
| | **A — One calm overview, edit as needed. Recommended.** | **B — Choose a category first.** |
| --- | --- | --- |
| First screen | A small set of clearly separated groups with current permitted states and the simple controls that belong there. Reveal a longer topic/ministry list or focused detail only when needed. | Three plainly named category entries. Select one to open its focused controls; the first screen contains navigation and explanatory summaries, not operational switches. |
| Alex's example | Open Preferences, find Ministry Updates, open Maya's settings if necessary, and turn only her post emails off. The receipt-email choice is also easy to find in the same overview. | Open Preferences, select Ministry Updates, then Maya. To check receipts, switch back to the category selector and choose Receipt emails. |
| Strongest benefit | Helps donors understand the different kinds of communication and check more than one setting without repeatedly choosing a category. Simple qualified settings are directly available. | A quieter dedicated editing surface, useful when the person knows the category and its settings are extensive. |
| Main cost | Requires discipline: expanding every ministry/topic or inventing aggregate On/Off controls would make it noisy and misleading. | Adds a category-selection step on a neutral visit and makes cross-category checking less direct. |
| If a donor manages many ministries | Keep the overview compact; a searchable, bounded ministry management view supplies the same Q07 controls. Do not display every ministry in the initial page. | The category naturally leads to the same bounded ministry management view. |
| From an exact email/post/receipt link | Open the authorized relevant setting directly, preserving safe context through authentication. | Open the authorized relevant setting directly, bypassing the chooser. |

The distinction is **current choices visible first versus category navigation first**. If B also shows the current working controls across all groups, it has become A. If A is only three navigation cards, it has become B. Cards versus rows, accordion animation and exact breakpoints are implementation/presentation choices for the selected review, not a second founder question now.

## Recommendation

**Choose A — One calm overview, edit as needed.** The product already has three different communication jobs that are easy to confuse. Showing their distinctions together gives donors a predictable place to understand what they are changing. Focused detail keeps the long ministry/topic lists manageable. It also accommodates the common case of checking a receipt preference without first choosing a category.

Proposed groups, with their meanings rather than an invented topic catalog:

<!-- prettier-ignore -->
| Group | What belongs here | What stays separate |
| --- | --- | --- |
| **Emails from [organization]** | The portal-hosting organization's currently supported, authorized optional communication topics/channels. Clear topic names and actual saved states. | The organization here is the sender/host, not an organization whose giving Alex represents. No new topic, SMS/push channel, digest or all-email master switch follows from this layout. |
| **Ministry Updates** | The existing per-source **Show in my Updates** and **Email me about new posts** choices, including safe access to hidden-source management. | Externally sent missionary newsletters remain request-and-handoff. Giving, content access and email enrollment stay independent. |
| **Receipt emails** | Q13's narrowly eligible **Email routine recurring receipts** choice, scoped to its exact issuer/legal donor and independent permission. A quiet route to Receipts & statements remains available. | This is not a general receipt-off toggle, a document generator, delivery guarantee or new recipient/address choice. Q11 owns qualified email changes. |

Not every account necessarily has all three operational groups. Render the current qualified choices and truthful local availability. An unknown state is not Off, and lack of a particular grant is not evidence that no settings exist. A represented financial context must not silently retarget Alex's personal communication or reading preferences. Where a qualified receipt control concerns another legal donor, show that scope explicitly and require its own grant.

This is product judgment supported by current documented journeys. No Asym study proves that overview-first is universally better, that three is an optimal universal group count, or that it saves a fixed number of clicks. B is a strong alternative if the eventual qualified settings surface is extensive or donors reliably arrive with one category in mind. Exact links make both equally direct for those targeted journeys.

## Research and selective transfer

<!-- prettier-ignore -->
| Primary source | Verified finding | Useful lesson and limit |
| --- | --- | --- |
| [HubSpot subscription preferences](https://knowledge.hubspot.com/marketing-email/customize-email-subscription-pages), updated8June2026 | Recipient page shows named/described subscription types and their current selections. | Supports A's visible overview. Its email-address identity, all-off action and bulk unchecked-field save semantics are not imported. |
| [HubSpot subscription types](https://knowledge.hubspot.com/marketing-email/set-up-email-subscription-types), updated4August2026 | Types have understandable names/descriptions and distinguish Subscribed, Unsubscribed and Not specified. | Show precise local state rather than one ambiguous global status. Do not import its catalog limits, data model or compliance configuration. |
| [Church Center preferences](https://help.planningcenter.com/en/141287-view-notifications-and-update-preferences.html), published3September2026 | Users choose among settings categories; Giving has receipt-email controls. The documentation distinguishes push/in-app behavior from email and separately describes Giving. | Strong donor/community precedent for B and for stating each control's effect. Do not flatten that nuanced behavior into “all notifications off” or copy broader receipt policy over Q13. |
| [Slack notification settings](https://slack.com/help/articles/201355156-Configure-your-Slack-notifications) | Preferences → Notifications opens focused channel/settings controls, with additional detail organized inside that category. | Supports focused category navigation. Workplace message schedules, exception matrices and channel defaults are not donor requirements. |
| [Mailchimp preferences center](https://mailchimp.com/help/create-a-preferences-center/) | A central recipient page lets contacts change available groups/preferences. | Supports discoverable topic choices; its extra emailed access-link sequence and group/configuration system are not Asym requirements. |
| [Fundraise Up marketing consent](https://fundraiseup.com/docs/marketing-consent/) | Current docs say supporters cannot modify marketing consent in the Donor Portal after donation; the organization handles requested changes. | A useful counterexample: a modern donor platform's existing limitation is not automatically the best Asym self-service path. Its legal generalizations are not used as legal authority here. |
| [NN/g progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) | Recommends keeping important choices initially visible and revealing specialized options through clear labels. | A durable design principle, published2006—not newly invented2026 research. It supports limiting clutter but does not settle Asym's exact initial controls without task/comprehension testing. |

No claim of donation retention, reduced unsubscribe rate or task-completion improvement is inferred from these sources. Current sources include real alternatives and limitations, not an industry-consensus claim.

## Repository facts and current behavior

- **Explicitly open:** Q07 completed review, Entry and editing (`phase25-r07-adversarial-review.md:72`), says the overview-versus-chooser choice remains unratified; its final owner-seams section leaves overall settings navigation separate. The pre-answer Q07 brief is marked superseded by the newsletter clarification; Q21 uses the corrected two-control model and later Q13 receipt decision.
- **Already settled:** Q07 controls save independently with local truthful outcomes and current source/reader/contact scope. Q13 J01 routes receipt links into the same preference destination; J02 requires exact receipt-preference authority, not merely document/giving access. Its one Card/Switch guidance does not dictate the whole landing page. Q11 retains the qualified email-change journey. Q17 owns the notification center; Preferences is not a second inbox.
- **Roadmap:** `phase25` at `roadmap.md:2833–2895` assigns topic/channel preference-center UX to Phase25; P3/P6/P17 and applicable source owners govern permission, contactability, suppression, purpose and delivery. Marketing opt-out is distinct from required receipt policy, and stronger safety/contact restrictions remain.
- **Actual current settings:** `apps/donor/app/(dashboard)/donor-dashboard/settings/page-client.tsx:57–75,449–650` has Profile/Notifications/Security tabs, hard-coded notification categories/default booleans and timer-based Save success. The inspected Notifications tab does not persist those changes. Labels such as Monthly Statements, Video Stories, Quarterly Newsletter and emergency/SMS options are prototype implementation, not a founder-ratified topic/channel catalog.
- **Current implementation is mixed:** the shared consent floor exists; the coarse feed-preference route exists. Neither validates the prototype's aggregate settings defaults or complete per-source preference experience. A selected layout must converge through the existing source owners when implemented, not add parallel settings truth.
- **No contrary OpenSpec rule found:** the inspected donor-self-service active change governs financial self-service and does not choose a communication-preferences landing. Platform boundary notification clauses also do not decide this layout. Active changes remain proposed work, not deployed UI authority. Existing platform boundaries and ADR-0001 still govern.

The research source head/current develop remains `7abd2c11ffd4ed70c6775c4fd6f51c996e4350dd`. P22/P23/P24 branch heads were rechecked and are unchanged at `70c50e8c97556c43be5543332fb0993b468b90ab`, `9069dcad67f9630323474ca5ee8bcc85ca7bf0f6`, and `ab1a1703a725be454376990a7fe68aef2e048026`. A branch contract is not deployed proof. The five existing setup changes and historical review bundles remain preserved.

## Requirements preserved by either choice

1. **One set of source-owned controls.** Central and contextual entries read/write the same preferences, with the same per-control save and failure/unknown-result handling. No page-wide cross-domain Save or master switch.
2. **Exact scope.** Personal reading/contact intent and represented legal-donor receipt intent can differ. A shared layout creates no combined grant or subject. Current scope applies before labels, summaries, search and counts.
3. **Targeted links stay direct.** A valid receipt/post/email management link opens its qualified setting. Choosing a neutral entry does not add mandatory navigation or change RFC8058 one-click unsubscribe into an authenticated settings tour.
4. **Only supported choices.** No fake Off during loading, unsupported channel, invented opt-in, new topic taxonomy, newsletter subscription management or claims of guaranteed delivery. Distinguish saved choice from a current verification/delivery block where relevant.
5. **Calm, bounded presentation.** Use shared shadcn/Base UI Maia, readable labels and local feedback. Long source sets get bounded search/detail, not a wall of ministries, an administrative query builder or a required grid. ReUI informs actual grids under the newly ratified reference rule.
6. **Preserve documents and giving.** Preference changes do not stop giving, issue/reissue receipts, rewrite prepared communications or alter existing document access. Existing owners decide future applicability, suppression and in-flight outcomes.
7. **No new authority from this answer.** Choosing A/B sets the entry experience; the post-answer review will map its full journey and verify the reached owners, state boundaries, accessibility and migration/proof requirements. No code, canonical ADR/OpenSpec, issue or live preference changes are authorized here.

## What was checked before choosing this question

Independent owner/product/UX lanes verified the fork against prior ratifications. A proposed aggregate recurring-amount question was rejected because Q09 already forbids treating group total as writable authority. Skip-next and in-use wallet removal were not re-asked because their source contracts already establish the key behavior. Broad privacy/help features would risk opening later-phase scope instead of resolving this explicitly deferred Phase25 choice.

This session performed current source/document/primary-web research and documentary preservation checks. It did not run a preference mutation, email/unsubscribe action, browser acceptance test, Supabase migration, provider operation or donor usability study. Q14 G01 remains an unresolved native contract; this entry-layout choice neither depends on nor repairs that separate social-login gap.

**Recommendation:** A — One calm overview, edit as needed. **Alternative:** B — Choose a category first. **Founder decision:** What should a donor see first when opening communication and Updates Preferences?
