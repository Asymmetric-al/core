# Routine held-email review ownership: vendor evidence and recommendation

**Historical question-stage record.** On 12 September 2026 the founder selected A and fully ratified the [complete D19 review and every adopted amendment](phase26-d19-adversarial-review.md). Original unanswered/recommendation statements below describe the earlier question stage.

**Independent review input:** These are question-stage facts and proposed adaptations, not an accepted D19 decision.

Research checked 11 September 2026. This is an independent question-stage research input. It does not ratify Q19, change the existing intake contract, or specify runtime implementation. Repository alignment is being reviewed separately by the parent agent.

## Recommendation

Recommend **A: designated reviewers for each responsible shared inbox, with tenant oversight**. The same authorized team can cover several or all inboxes, so a tenant with one operations team can organize centrally without creating a different queue system. A does not mean every inbox member automatically becomes a reviewer, nor does reviewer assignment grant access to private Support or CRM content.

The strongest alternative is **B: a single tenant intake-review team**. Centralized staffing may make coverage simpler where one team already has the appropriate remit and authority. Its tradeoff is the need to route sensitive or specialist work onward, and the risk of treating centralized responsibility as blanket content access. **C: tenant administrators only** is operationally simple for a very small tenant, but routine recovery need not require broad administrative capabilities. It is less convincing as the default.

This is an Asym product judgment. The research establishes several viable vendor patterns and concrete failure modes; it does not establish a universal industry standard, measured ministry preference, or false-positive rate.

## The question and example

**Who should be responsible for regularly reviewing incoming email that Asym has safely retained for a decision but has not admitted as Support work?**

Illustrative example, not a claim about an observed ministry: a legitimate donor-care message arrives at an identified donor-care address but needs manual intake review. The sender is waiting, yet the message should not quietly enter normal work, send an acknowledgment, or create a CRM person before its eligibility is resolved. A qualified reviewer sees why it is held, checks the safe evidence they are allowed to see, and releases that particular message into the responsible inbox. Any identity linking and recipient authority still follow their owning rules.

| Choice                                   | Practical ownership                                                                                                | Best fit                                                              | Tradeoff                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| A — Reviewers for each responsible inbox | Designated eligible staff review that inbox's held mail; tenant oversight tracks coverage and unresolved problems. | Teams with distinct Support responsibilities or sensitive scopes.     | Requires explicit coverage when reviewers leave or lose access.                             |
| B — One central intake-review team       | One eligible tenant team owns routine held-mail review, with authorized handoffs for scopes it cannot inspect.     | A tenant that already staffs a common intake operation.               | Can create extra handoffs and must not become a privacy bypass.                             |
| C — Tenant administrators only           | Administrators undertake routine review as part of their administrative work.                                      | Small tenants with very low volume and active administrator coverage. | Broad privilege and a likely competing-priorities bottleneck; no inherent safety advantage. |

## Scope distinctions that must remain explicit

1. **Routine held intake** means content has a trustworthy tenant boundary, an identified responsible inbox or an independently authorized routing path, and a reason that the permitted business reviewer can actually resolve. It is not a catch-all label for every provider failure.
2. **Unknown or conflicting tenant identity** stays with the qualified platform/communication ingress owner. Do not show it to a guessed tenant reviewer or use the body to guess ownership.
3. **Technical retry or missing payload** stays with the technical owner. A business reviewer cannot repair unavailable evidence by clicking Release.
4. **Malware or a non-overridable security restriction** remains governed by the file/security owner. Business recovery cannot make a blocked attachment safe or turn an authentication failure into verified person identity.
5. **Ordinary unwanted mail already admitted into a conversation**, **provider mailbox spam folders**, and **administrator security quarantine** are distinct vendor mechanisms. Their documented permissions and side effects are evidence to evaluate, not proof that they are the same thing as Asym held intake.

## Primary-source comparisons

### Zendesk: suspended intake is a real operational queue, with broad permission coupling

[Viewing, recovering, and deleting suspended tickets](https://support.zendesk.com/hc/en-us/articles/4408893392922-Viewing-recovering-and-deleting-suspended-tickets), edited 7 May 2026, documents a system queue with suspension reason, sender and subject filters, individual/bulk recovery, and a 14-day unrecovered lifetime. Non-Enterprise access requires all-ticket visibility; Enterprise uses the relevant custom-role permission. Access also confers deletion of entries in that queue even without ordinary ticket-deletion permission. Recovered work is New and unassigned. Manual recovery creates a plain-text copy without original HTML/files and leaves the original suspended entry.

**Adopt:** a dedicated reason-aware queue and clear release destination. **Reject:** coupling routine review to all-ticket exposure or irrevocable deletion, and lossy copied recovery that obscures original evidence. The numeric lifetime is a Zendesk fact, not an Asym recommendation. Product edition materially changes the access comparison.

[Guidelines for reviewing suspended tickets](https://support.zendesk.com/hc/en-us/articles/4408832102042-Guidelines-for-reviewing-suspended-tickets), edited 11 June 2026, explicitly asks teams to review regularly. It identifies false spam positives, authentication failures and missing email reply tokens among recovery cases. Account registration policy changes the workflow; some recovery registers a user while leaving the email unverified.

**Fit:** human review serves a real intake need, but Asym recovery must not silently establish CRM identity, registration, conversation access or successful verification. A failed mail-authentication signal is evidence, not a definitive conclusion about the person or a universal staff-overridable condition.

[Setting up suspended ticket notifications](https://support.zendesk.com/hc/en-us/articles/4408834669082-Setting-up-suspended-ticket-notifications), edited 26 May 2026, supports configurable periodic mail or none. Notifications repeat information about currently suspended work; settings require administrative or qualified custom-role authority.

**Fit:** accountable review can have a digest. Do not copy repeated full-content emails, arbitrary external recipient lists, or every-ten-minute messages as the default. Asym can use its existing attention surface and authorized queue deep link, with content access checked on opening.

### Front: local inbox context and a clear current-item/future-sender distinction

[Spam in Front](https://help.front.com/en/articles/2251), edited 29 July 2026, distinguishes **Mark as spam** for the current conversation from **Block sender** affecting subsequent messages. Shared inbox spam appears inside that inbox; restoring explicitly names its destination. Shared blocking is controlled by a company setting and relevant permissions. Front says its provider supplies spam analysis; Gmail/Office 365 status synchronization differs from permanent deletion.

**Adopt:** unmistakable current-item action and named destination, with a separate consequential sender-policy action. **Reject:** assuming provider-folder semantics or synchronization are needed inside Asym. A Support review queue should consume the qualified communication owner rather than operate a separate mailbox.

[Teammate groups](https://help.front.com/en/articles/4645696), edited 1 September 2026, allows groups to manage inbox/workspace access separately from selected capabilities. Custom permissions are restricted to Enterprise and legacy Scale. Its block-sender capability includes delete/mark-spam permission. Visibility in the sidebar is independent from granted inbox access.

**Fit:** staff/group coverage and scope-aware navigation are useful, but a hidden sidebar item is not authorization. Asym should reuse Core's permissions and existing team membership, with no invented permission bundle that includes unrelated destructive powers.

[Spam, phishing, and identity warnings](https://help.front.com/en/articles/2425), edited 21 July 2025, separates provider spam/phishing signals from an identity warning. A discrepancy can indicate spoofing or configuration problems.

**Fit:** a reason summary should be legible without alarming staff unnecessarily. “Identity not established” is not the same as “malicious,” and a successful release must not remove evidence merely to make the interface look resolved.

### Help Scout: inbox visibility and deliberate administrative filtering settings

[Manage Spam and Unwanted Email](https://docs.helpscout.com/article/307-manage-spam-and-unwanted-email), updated 8 September 2026, describes a per-inbox spam workflow, regular checking for genuine mail, permanent purge, and sender-level learning when marking/unmarking spam. It specifically warns that marking legitimate automatic replies or notifications as spam can cause future sender mail to be blocked. Company Allow/Block settings are for administrators/account owners; emptying spam needs Delete conversations.

**Adopt:** clear reviewer ownership and regular attention to false positives. **Reject:** one-off release implicitly changing future sender eligibility. This documented warning is a particularly strong reason to keep “unwanted automatic message,” “held for review,” and “block future mail” distinct. Do not import its 30-day purge or last-action clock as an Asym decision.

[User Roles and Permissions](https://docs.helpscout.com/article/15-user-roles-and-permissions), current September 2026 page, says ordinary Users access specified inboxes; administrators also manage only inboxes they can access. Custom individual permissions require Plus/Pro. Within an accessible inbox, Help Scout does not offer per-conversation restriction for an ordinary User.

**Fit:** the separation of administrative role from inbox access supports A. Its coarse within-inbox visibility is not sufficient for Core's actual sensitive-data policy. Asym must check the precise held source and permitted preview, even when reviewer and inbox membership both exist.

### HubSpot: filtering policy, recovery, and consequential CRM effects

[Manage the allow and deny list in the conversations inbox or help desk](https://knowledge.hubspot.com/inbox/manage-your-allow-and-deny-list), updated 10 July 2026, is documented for all products/plans where applicable and requires Account Access for list changes. Settings do not modify external email-client lists. Types such as automatic, marketing or role-based mail can be filtered. A real later reply can move a thread out of spam. Recovery can create a new ticket dated to original receipt when automatic ticket creation applies.

**Fit:** policy configuration differs from routine recovery. Preserve original receipt and Support-ready admission separately; do not let release overwrite age or fabricate earlier service readiness. Do not copy sender-role filters indiscriminately: legitimate ministry requests can come from organizational/shared addresses. CRM membership is not proof of identity or safe mail.

[Manage tickets in help desk](https://knowledge.hubspot.com/help-desk/manage-tickets-in-help-desk), updated 20 July 2026, Service Hub Professional/Enterprise, requires Delete ticket permission to mark ticket conversations as spam. Selecting every associated conversation deletes the ticket. Its separate block-sender flow can delete contact and ticket when all associated conversations meet that condition, as well as affect future mail.

**Reject for Asym:** routine intake disposition must not delete Parties, change relationship ownership, or erase independent Support evidence. This is a concrete vendor boundary to avoid, not an assertion that HubSpot's documented behavior is always wrong for its own model.

[Organize teams and views in help desk](https://knowledge.hubspot.com/help-desk/organize-teams-and-views-in-help-desk), updated 18 June 2026, Service Hub Professional/Enterprise, describes team organization, a Spam view, and authorized ticket visibility. Service-seat requirements affect advanced views. The page says users see only tickets they can access.

**Fit:** group operational work by responsibility and keep authorization independent from filter/view naming. A global queue label alone cannot prove cross-scope visibility or safety.

### Zoho Desk: ticket disposition and contact disposition can be distinguished

[FAQs: Working on Tickets](https://help.zoho.com/portal/en/kb/desk/faqs/tickets/articles/faqs-working-on-tickets), current undated documentation checked 11 September 2026, documents recovery through the Spam Tickets view with Not Spam. Its bulk spam flow lets staff optionally mark associated contacts as spam, affecting future tickets. It also describes administrative automatic-spam configuration and a setting that protects contacts with other valid tickets. The precise edition-specific recovery permission is not established by that page.

**Adopt:** making current-ticket versus future-contact effect visible is better than hiding the distinction. **Reject:** a convenient contact mutation in routine Asym recovery. The source's 50-item bulk limit and 30-day cleanup are not adopted as requirements. Do not claim Zoho Mail administrator quarantine is Zoho Desk's Support workflow.

### Kustomer: email-specific sender coupling is explicit

[Mark a conversation as spam](https://help.kustomer.com/mark-a-conversation-as-spam-SkkErPQyP), last updated October 2024 and still available September 2026, describes automatic Done status through a business rule and a saved Spam search. For email, marking spam blocks future email from the sender; unmarking removes that block. Other channels differ. Its conversation Spam attribute permission can be withheld; exact plan availability is delegated to pricing and was not established here.

**Fit:** a dedicated view and limited action capability are relevant. **Reject:** implicit closure, sender-policy changes, and rules-engine dependency for the basic Asym intake-review action. The older article is a current available documentation source, not proof of every 2026 deployment's configuration.

## Reported friction, not verified current product behavior

In an [October 2025 HubSpot Community report](https://community.hubspot.com/t/help-desk-recommendations-issues/106446/3), a customer using Enterprise described difficulties separating multiple businesses' unassigned/spam work and inconsistent navigation between CRM tickets and Help Desk conversations. This is a useful first-person signal about scope and navigation, not a verified present-day permission defect, prevalence estimate or independent usability study. Current official documentation's access statement remains the product fact.

The actionable Asym lesson is to test the actual restricted-view journeys, not only the happy path for an all-access administrator. If the tenant supervisor can see review coverage but cannot read a private held source, the UI must preserve that distinction rather than treating a missing row as an empty queue.

## Minimum question-stage constraints

These constraints make the alternatives understandable without pretending to settle the detailed post-answer design:

1. **Queue naming:** “Held email” with a short “Needs review before it enters Support” explanation. A safe reason and destination are visible; “Spam” is reserved for a demonstrated spam classification rather than all exceptions.
2. **Review assignment is responsibility, not authority:** qualifying reviewer eligibility checks current tenant membership, relevant source/inbox read and disposition capabilities, and any narrower restriction. Do not auto-grant inbox, CRM, missionary-care or giving access.
3. **One-item scope by default:** “Release this message to [inbox]” and “Dismiss this message” are distinct from any future-sender policy, deletion/redaction, or business action. The chosen release can report an actual result link and reviewer identity without presenting the reviewer as message author.
4. **No blind claim that release is send:** release re-enters the authoritative intake boundary once. D1 identity/threading, D13 acknowledgment eligibility, D14 timing, D16/D17 content controls and P6 communication admission still apply. It is not an independent email send, template publication or permission grant.
5. **Honest destination and content:** where the destination cannot safely be established or the reviewer cannot see sufficient qualified evidence, there is an owned routing/technical exception. Do not fall back to the tenant's broad shared inbox merely to clear a counter.
6. **Coverage not noise:** the responsible reviewer group has a visible queue and one accountable backup route for lost coverage. Tenant oversight receives permitted health/coverage information and can reconfigure responsibility using existing capabilities. Routine bodies do not fan out into notifications.
7. **No ownership limbo:** changing reviewer coverage cannot make held work disappear; departed or revoked reviewers lose read/mutation rights immediately. The same service-owned item remains available to the newly eligible team. Technical failure is not silently converted into dismissal.
8. **No premature numerical policy:** review-time targets, queue-retention limits and bulk sizes need the chosen answer's detailed consistency review. Vendor numbers vary and do not determine Asym's values.

## Evidence limits

This pass used official current documentation and one explicitly labeled customer report. It performed no live vendor-account test, no provider operation, no browser visual accessibility evaluation, no mail release, and no source-code/runtime mutation. The recommendation assumes a tenant can identify suitable authorized reviewers, which configuration and operational acceptance must verify. No nonprofit-specific evidence establishes that ministries always prefer decentralized or central intake review.

The defensible recommendation is A because it permits close-to-work judgment and scoped access while retaining central staffing as an operating configuration. If Conrad instead values a mandatory common intake operation more highly than inbox-local judgment, B is a meaningful alternative; it still needs the same authorization and safe handoff boundaries.
