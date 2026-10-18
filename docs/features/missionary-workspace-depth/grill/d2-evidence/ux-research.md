# D2 UX research — make available to staff, with optional notification

Research/retrieval: **2026-10-16 UTC**. This is research and proposed UX language,
not a formal specification, implementation, owner amendment or runtime claim.
Public first-party documentation was opened in this pass; no vendor account,
actual staff directory, real contact, notification or authenticated vendor flow
was exercised. There are no invented interviews or usability results.

## Selected direction and recommendation

The founder rejected collaborator-based sharing. Deliberate availability puts
eligible reviewed contact information into the organization's ordinary staff
CRM, under its usual permissions. The founder also selected **specific staff to
notify, optionally**, avoiding an all-staff alert. Choosing notification
recipients does not choose who can access the contact information.

Recommend **one short review with one final “Make available to staff” action**.
Show the organization, the actual eligible details, the ordinary staff CRM
audience and the private-history boundary together. A compact optional staff
picker starts empty and shows chosen names. No permission
roles, collaborator invitation, custom group or record-level access editor
belongs in this flow. Notification off should require no recipient, message,
reason, extra page or alternate ceremony.

**Default off and in-app notification first are recommendations, not additional
founder decisions or established delivery capabilities.** An empty initial
selection minimizes unintended attention and gives meaning to choosing
recipients. Prefer this one control over a checkbox followed by a picker: it
removes an extra action and the unhelpful state “notification on, nobody
selected.” Selecting a person prepares the optional effect for final
confirmation; it does not send immediately. The existing notification owner must
qualify the
exact channel, recipient projection and outcome semantics. Do not imply that
in-app delivery, email or a new recipient-search permission already exists.

The strongest simpler alternative is a clearly labeled one-click availability
action with feedback and correction afterward. It minimizes effort for frequent
users. Its weakness is that disclosure can occur before a person notices the
wrong contact, field or organization; correction cannot recall what staff have
already read. The proposed single review earns its place by showing those
consequences, not by asking “Are you sure?” twice. Once the reviewed action is
accepted, ordinary authorized editing must not automatically repeat a sharing
wizard. A new disclosure scope or materially changed pending action is a
different review, governed by its source.

## Exact recommendation language for consolidation

> Keep “Make available to staff” as a deliberate action into the organization's
> ordinary CRM. Before confirmation, show the eligible information being made
> available and explain that usual staff CRM permissions apply. Do not turn this
> into choosing collaborators or per-contact access permissions. Earlier private
> notes, private planning and protected history do not become shared through
> contact availability, identity reuse or a notification.

> Let the missionary optionally choose staff to notify in that same short
> review. Label this as notification only: it does not grant access or limit
> other authorized staff's access. With notification off, finish the ordinary
> action without another step. Report contact availability and notification
> outcomes separately; notification failure never relabels successful
> availability as failure or causes the availability action to run again.

> Reuse an authorized existing contact through its owner. Show only facts and
> choices the actor may see and change. Do not overwrite canonical contact
> values, merge people or publish private history merely because a supplied
> name, phone or email matches. A restricted preparation can remain saved while
> canonical identity or staff availability is unresolved; say exactly which
> result is known.

These clauses do not select the exact shareable field set, a new contact fact
acceptance policy, a new merge service, historical access, exceptional access,
recall/deletion rules, notification channel or retention period.

## Primary evidence: comparable CRM and publication patterns

All dates below are the source's displayed content date where available.
“Undated” means no dependable publication/update date was shown; retrieval today
does not establish recent authorship. Documented behavior is not tested behavior.

| ID / current primary source                                                                                                                                                                                                           | Documented behavior                                                                                                                                                                                                                                                       | Useful principle and boundary                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| E1 — [Google Drive: Share files](https://support.google.com/drive/answer/2494822?hl=en), undated, opened                                                                                                                              | A notification checkbox can be cleared while sharing. A separate email-collaborators screen can message existing collaborators but cannot add new ones. General access and recipient messaging are distinct controls.                                                     | Strongest straightforward example of **attention independent of access**. Borrow the separation and labels; do not import Drive's roles, people-based grants, public links or editor resharing. First platform-parameter URL timed out; this official canonical URL opened successfully.                                                      |
| E2 — [SharePoint: Share a site](https://support.microsoft.com/en-us/sharepoint/sharepoint-sharing-and-permissions/share-a-site), undated, opened                                                                                      | A site owner selects authorized recipients/roles; clearing “Send email” skips notification while adding access. Site-only access is distinguished from membership in the broader Microsoft 365 group.                                                                     | Confirms notification is an optional effect, and seemingly related actions can grant different things. D2 uses the already chosen ordinary staff audience, not SharePoint's individual/site/group permission controls. Page header lists Server 2019/2016 while body discusses Microsoft 365: exact client/version behavior is not qualified. |
| E3 — [SharePoint: Create and use modern pages](https://support.microsoft.com/en-us/sharepoint/pages-in-sharepoint/create-and-use-modern-pages-on-a-sharepoint-site), undated, opened                                                  | Saving a draft and publishing to its audience are separate. Draft variants have different reader scopes; the article also describes release-dependent interface differences.                                                                                              | Good analogy for preparation versus deliberate availability. A generic “draft” label cannot prove author-only access. Do not reuse the site's editor/coauthor audience or its publication system for contact admission.                                                                                                                       |
| E4 — [Confluence Cloud: Create, update and manage written content](https://support.atlassian.com/confluence-cloud/docs/create-edit-and-publish-a-page/), undated, opened                                                              | First publication presents settings to review, then makes content discoverable to permitted readers. Later updates are distinguished from initial publication. Notification of watchers is a separate update option.                                                      | A short explicit initial transition and later normal editing are credible patterns. D2 needs neither a page-location wizard, version comments, schedule control, watchers nor an editable access section. A CMS draft is not evidence of P9 source authority.                                                                                 |
| E5 — [SharePoint: News for Email templates](https://support.microsoft.com/en-us/sharepoint/sites-pages/sharepoint-news-for-email-templates), undated, opened                                                                          | Email can carry the whole post even without site access. The emailed version is a static snapshot and does not change when the page is corrected. A link-only option is separately described.                                                                             | **Counterexample to “notification grants no access, therefore it cannot disclose.”** The payload itself discloses. Prefer a qualified minimal notice and currently authorized destination; exact title, contact name, preview and channel still need owner qualification. Do not import a newsletter or full-content email.                   |
| E6 — [Virtuous: Manage user permissions](https://support.virtuous.org/hc/en-us/articles/360050985731-How-Do-I-Manage-User-Permissions), updated **2025-11-24**, reopened                                                              | Ordinary contact reading is assumed for CRM users; most contacts are public within that CRM. Contact notes have separate permissions. Private contacts and private notes have different authorized readers; merge-tool access is separately limited.                      | Strong nonprofit comparison for shared organizational contacts with distinct protected notes. “Public” here must not be copied as Asym public-web language. No observed Virtuous transition proves Asym should flip a generic private flag or grant every staff account access.                                                               |
| E7 — [Virtuous: Understanding private data](https://support.virtuous.org/hc/en-us/articles/6984382728589-Understanding-Private-Data-in-Virtuous-CRM), updated **2025-07-08**, reopened                                                | Contacts, notes and gifts have separately described private meanings; private gift querying has its own permission rule.                                                                                                                                                  | One privacy badge is insufficient to explain every related object. D2 contact availability must not imply history or financial visibility. The linked infographic was not re-inspected in this pass; the article body and E6 supply the used claims.                                                                                          |
| E8 — [Bloomerang: User permissions](https://help.bloomerang.com/en/articles/17568278-user-permissions), displayed **“Updated this week”**, exact date unavailable; opened through official redirect from `/12632881-user-permissions` | Standard-user abilities are configurable. The document separately describes transaction/application access, notifications and email reports. It explicitly describes cases where emailed task/report information persists despite unavailable corresponding in-app views. | Strong nonprofit warning that source-screen permissions and downstream messages need separate qualification. Do not copy broad defaults or assume a hidden screen protects notifications. This is a documented behavior/counterexample, not an independently demonstrated vendor vulnerability.                                               |
| E9 — [Bloomerang: Review and merge duplicate constituents in the Data Health Hub](https://help.bloomerang.com/en/articles/15793806-review-and-merge-duplicate-constituents-in-the-data-health-hub), **2026-07-02**, opened            | Potential matches can be reviewed, dismissed or treated as household members. A merge preview lists consequences; merging is permanent and can affect multiple kinds of related information. Product bundle changes which interface applies.                              | Strong current nonprofit example of **review before consequential reconciliation**. A contact-availability action must not hide a merge. Do not import matching thresholds, household creation, financial comparisons, automations, destructive merge semantics or the full data-health workflow into ordinary sharing.                       |
| E10 — [Dynamics 365: Create or edit leads](https://learn.microsoft.com/en-us/dynamics365/sales/create-edit-lead-sales), updated **2026-07-17**, opened                                                                                | Selecting an existing contact can fill empty fields on a new lead. Already populated or manually entered fields are not overwritten by that auto-population.                                                                                                              | Supports preserving entered data and showing an existing contact deliberately. It does not establish which conflicting Asym value is true, authorize a canonical update, or make a sales lead the Asym source model.                                                                                                                          |
| E11 — [Dynamics 365: Qualify and convert a lead](https://learn.microsoft.com/en-us/dynamics365/sales/qualify-lead-convert-opportunity-sales), updated **2026-04-30** in same-session D1 inspection; searched again                    | Existing account/contact reuse and administrator-configured record creation are distinct. The manual flow uses explicit qualification rather than treating a selection or closed pane as completion.                                                                      | Reuse is not the same as creation or later work admission. This repeats D1 evidence rather than claiming a newly tested flow. D2 does not create an opportunity, sales funnel or cultivation enrollment.                                                                                                                                      |

The priority missionary products remain relevant background in the
[benchmark note](../phase28-benchmark-evidence.md), but inspected DonorElf, Sola
and Epistle public material does not establish this exact restricted-to-staff
transition, recipient picker authority or retry semantics. MPDX coaching
invitation is a different purpose and audience. TntConnect task/history patterns
do not settle this access choice. No external product supersedes the founder's
choice or the P4/P9/P12 owners.

Additional targeted search found Salesforce NPSP contact-merge guidance, but the
opened help page was dominated by its navigation/CSS-error shell and the useful
claim remained search-index text. It adds no necessary evidence beyond the
fully read Bloomerang/Dynamics sources above, so it is not treated as a verified
flow. Google support-community reports about missing email were also excluded:
user anecdotes are not primary product documentation or transaction guarantees.

## Primary usability and accessibility evidence

| ID / source and date                                                                                                                                                                                                                                                 | Guidance actually used                                                                                                                                                                                                         | Application and limit                                                                                                                                                                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 — [GOV.UK: Check answers](https://design-system.service.gov.uk/patterns/check-answers/), undated, opened                                                                                                                                                          | One review is recommended for a small/medium transaction; show relevant information, use an action-specific button, permit corrections and return without repeating the whole journey.                                         | One concise D2 review; no arbitrary wizard or second approval dialog. GOV.UK's full application-page layout is not a requirement for a small CRM action.                                                                                                                                     |
| U2 — [GOV.UK: Confirmation pages](https://design-system.service.gov.uk/patterns/confirmation-pages/), undated, opened                                                                                                                                                | Explain completion and what happens next; acknowledge that confirmation within a wider task remains a research gap.                                                                                                            | Durable availability feedback near the contact plus notification status may serve this task better than a separate “receipt” page. Do not add PDF export, a case number or service-desk copy merely because a government example has it.                                                     |
| U3 — [GOV.UK: Checkboxes](https://design-system.service.gov.uk/components/checkboxes/), undated, opened                                                                                                                                                              | A checkbox can toggle a single option; avoid preselecting answers because users may miss them or submit the wrong value.                                                                                                       | Relevant if testing a checkbox variant, but it does not require an extra checkbox before an optional picker. The simpler empty picker is the recommendation. This source does not establish an organizational notification policy or prove the default optimal for experienced missionaries. |
| U4 — [W3C APG: Modal dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), undated, opened                                                                                                                                                                | Move focus into the dialog, retain its tab sequence, provide Escape and a visible close/cancel control, and return focus logically. Important hard-to-reverse actions may merit initial focus away from the committing action. | Use the existing shared accessible dialog; let the review heading/summary be read before accidental activation. APG describes a pattern, not an automatic WCAG conformance certificate or a mandate for modals.                                                                              |
| U5 — [WCAG 2.2 SC 4.1.3: Status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current informative explanation, opened                                                                                                                 | In-page status changes need programmatic presentation without requiring focus. Excessive interruption is not the aim.                                                                                                          | Announce meaningful availability/notification outcomes; do not rely on a disappearing toast or repeatedly steal focus while checking a request.                                                                                                                                              |
| U6 — [WCAG 2.2 SC 3.3.4: Error prevention](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), current informative explanation, opened                                                                                          | Covered important data changes need at least one of reversibility, checking/correction, or review/confirmation.                                                                                                                | Review is a sensible response to disclosure consequences; WCAG does not require two confirmations or declare every “share” action legally irreversible. Actual applicability and conformance must be assessed on the implementation.                                                         |
| U7 — [WCAG 2.2](https://www.w3.org/TR/WCAG22/), Recommendation **2024-12-12**, same-session D1 reuse                                                                                                                                                                 | Keyboard operation, visible/unobscured focus, reflow, labels, errors and target-size requirements remain relevant.                                                                                                             | Test keyboard and mobile screen readers, zoom and narrow viewports. The 24 CSS-pixel target criterion has spacing/exceptions and is a minimum, not a comfortable-touch design target. No device/a11y test occurred in this research lane.                                                    |
| U8 — [Apple: Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) and [Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback), undated; official search-index text only, direct pages returned JavaScript shells | Indexed official guidance discourages alerts for routine undoable actions and favors status feedback proportionate to significance.                                                                                            | Corroborates calm feedback and avoiding redundant dialogs. Limited retrieval strength; U1/U4/U5 provide the readable primary basis. No Apple-native UI or styling is proposed.                                                                                                               |

The [D1 UX research](../d1-evidence/ux-research.md) remains the source for
international names/address/phone entry and third-party-contact autofill
cautions. D2 should not re-ask already accepted fields, force first/last-name
assumptions, add an address to make publication possible, or auto-fill the
missionary's own email into the prospect. This pass extends that work rather
than repeating its source coverage.

## Minimal end-to-end UI proposal

This is recommended copy and behavior to test, not a frozen content schema.
Use Core's shared Base UI/base-maia components and semantic tokens. The flow
starts in the current organization and actor context. Ministry Assignment is
included only when applicable and authorized; early permitted contact/referral/
task/preparation work does not need a fabricated ministry.

### 1. Entry and one review

Entry action: **Make available to staff**. Put it beside a plain explanation of
the restricted preparation, not on a generic lock icon. Opening it does not
change access or send a notice.

Suggested review text:

> **Make available to staff**
>
> These details will be available in **[Organization]'s staff CRM**. Usual staff
> permissions apply.
>
> **Details to make available**
>
> [Only the exact eligible contact details for this action, with a way to correct
>
> > them where authorized.]
>
> Your private notes and earlier private history stay restricted.
>
> **Notify staff (optional)**
>
> [Empty searchable picker: **Choose staff**; chosen names appear here.]
>
> This only chooses who gets a notification. Staff CRM access is the same either way.
>
> **Cancel** · **Make available to staff**

The bracketed details are a preview of a qualified command's real effects, not
permission to publish every populated field. If the facts accepted for staff
availability differ from what was prepared, show that difference before final
confirmation. Do not use a general timeline, automatically generated summary,
private note excerpt, hidden field or an attachment merely to fill the preview.
No new mandatory narrative or optional message composer is needed for this
choice. No per-field share toggles are implied: show only actual supported
choices and permitted corrections.

Use an unambiguous organization label when more than one organization is
available. “Staff” means the source-qualified ordinary staff CRM audience, not
every employee, every missionary, future employee without authority, financial
reader, coach, donor or public visitor. An audience explanation must remain
available afterward without enumerating protected staff identities.

If the scope includes a consequential disclosure users repeatedly misunderstand,
test one brief sentence before the final action: **“Staff may see these details
as soon as you confirm.”** Do not add a mandatory acknowledgment checkbox or
promise perfect recall through Undo. The initial review already provides the
deliberate confirmation.

### 2. Optional staff notification

Use one empty optional picker labeled **Notify staff (optional)**, not “Share
with,” “Who has access,” “Collaborators” or “Invite.” Searching/choosing names
occurs inline when needed; it does not open a second wizard. If the recommended
in-app channel is adopted and qualified, the helper can be more specific:
**“This only chooses who gets an in-app notification. Staff CRM access is the
same either way.”**

Show only the exact currently authorized staff-recipient projection; do not
offer arbitrary email entry, all-staff selection, external invitation, guest or
donor selection. Current directory visibility alone does not prove eligibility.
The selected names are notification destinations and do not define CRM access.

An empty selection means no notification is requested and is valid. Clearing
the last selected name returns to that state. There is no empty-recipient error
and no requirement to explain why nobody was selected. If recipient lookup is
unavailable, explain that optional problem while preserving reviewed contact
information; the user may proceed with no recipients. If already selected
recipients become invalid, let the user deliberately correct or clear them.
Do not silently substitute people or announce that anyone was notified.

A checkbox followed by a picker is a reasonable comparison variant only if
tests find that the empty picker is misread as mandatory or as immediate send.
E1/E2 establish the access/attention distinction, not a required control count.
If that variant is used, switching it off must remove the notification intent,
including any hidden selected names. Do not freeze either widget implementation
without checking the actual shared component and assistive-technology behavior.

The actual notification should be a separately qualified notice about already
accepted availability, not a new owner assignment, task, required response,
read receipt, email subscription or grant. A minimal current-authority link is
a recommended direction; the notification owner still controls its exact
payload, title, previews, delivery channel and lifecycle. A link can disclose
through its text or URL, so “link only” is not a complete privacy proof.

### 3. Truthful result where the person is already working

After known acceptance, return to the relevant contact/preparation detail with
a persistent audience state such as **“Available in the staff CRM”**, scoped to
the admitted details. Announce the result accessibly. Do not require another
page, all-staff broadcast or acknowledgment to finish. Staff discover it through
their normal authorized CRM surfaces; the optional notice only draws attention.

| Actual known result                                                          | Suggested user-facing wording                                                                      | Recovery principle                                                                                                                                                                              |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Availability accepted; notification not requested                            | **Available in the staff CRM.**                                                                    | The normal path is complete. “No notification requested” may appear in details; do not demand a second action.                                                                                  |
| Availability accepted; optional notice request durably recorded              | **Available in the staff CRM. Notification requested.**                                            | This requires a durable notice request/outcome, not a UI selection. Requested is not locally available, sent, delivered or read. Do not ask the user to make it available again.                |
| Availability accepted; in-app notice known locally available                 | **Available in the staff CRM. Notification available to selected staff.**                          | Use only after the qualified local event/projection exists. Reading or archiving the notice is not acknowledgment or follow-up.                                                                 |
| Availability accepted; local notice materialization known to have failed     | **Available in the staff CRM. Notification unavailable.**                                          | Offer only qualified recovery for the same notice. “Try notification again” is appropriate only where the owner proves it cannot duplicate a prior effect. Do not call this email-send failure. |
| Availability accepted; some recipients have a different notification outcome | **Available in the staff CRM. Some notifications are still pending.** or a truthful failed outcome | Show only authorized recipient-specific detail. Never replay the successful recipients or the availability operation as a blanket retry.                                                        |
| Availability result unknown after connection loss                            | **Checking whether these details are available to staff…**                                         | Recover the same intent through current authority. Do not say “still private,” “failed” or “available” without evidence; do not create a second contact or new publication.                     |
| Availability known not accepted                                              | **These details were not made available to staff. [Actual permitted next step.]**                  | An already saved preparation remains saved where lawful. Keep authorized input and avoid a generic “Save failed” that erases that distinction.                                                  |
| Restricted preparation saved; identity/admission unresolved                  | **Preparation saved. Making these details available to staff is still pending.**                   | Use pending only if an actual durable resolution process exists; otherwise say unavailable with the real next step. Do not invent a queue or service by wording alone.                          |
| Availability accepted; required projection still reconciling                 | **Accepted. Staff CRM view is updating.**                                                          | Do not claim currently discoverable availability if the required view is not yet usable. Source success and derivative delay remain distinct; reconcile without resubmitting contact facts.     |
| Notice availability outcome unknown                                          | **Available in the staff CRM. Notification status is being checked.**                              | Recover notice evidence before any repeated action. A network timeout is not proof of failure. Any later external channel would additionally need its own qualified submission/delivery states. |

The source must qualify which of these outcomes can actually occur. This is
truthful state vocabulary, not a new general workflow framework. “Sent” requires
the owner's evidence for that claim; delivered/read/help received are separate
claims and are not implied by availability.

The [D2 notification owner review](notification-boundary.md) sharpens the local
recommendation: use the P17 **Information** meaning, with no duty or follow-up
completion, and the P6 qualified local intent/event branch. “Notification
requested” needs the exact selected request and durable dispatch intent accepted
with required source evidence; a browser callback is insufficient. If that
required acceptance persistence fails, do not claim the combined command was
accepted. Once accepted, a later local notification failure does not undo staff
availability. An unavailable optional capability can be omitted deliberately
before acceptance while ordinary qualified availability remains usable.
Recovery concerns only the same missing notice effect, with current authority
and no substitute recipient. A genuine local-only path does not acquire an
email-provider setup prerequisite; its own exact producer and presentation must
still be qualified. This is owner interpretation for consolidation, not evidence
that the current bell implements the path.

## Material edge cases and adversarial UX concerns

| Concern / plausible consequence                                                                                                                                                             | Severity under the proposed condition | Recommended treatment and evidence                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **D2-UX01 — Users think only notified staff can see the details.** A narrow picker looks like a familiar file-sharing ACL.                                                                  | High                                  | Audience text precedes the picker; label it notification only; verify that a user can name an unnotified authorized reader. E1/E2 show the distinction, while D2 fixes the broader audience. No visual “sharing with 2 people” badge.                                                                                                                                                         |
| **D2-UX02 — “Available” silently exposes earlier private content.** A generic source-row flag, timeline or generated summary crosses the private-history boundary.                          | High                                  | Preview the exact admitted contact facts, preserve source classification, and test private markers across fields, activities and notices. P27's shared-context exception cannot be used as a private-note migration. E6/E7 support separating object meanings.                                                                                                                                |
| **D2-UX03 — Contact facts are laundered from private notes.** A “phone” field is populated by summarizing or quoting protected history.                                                     | High                                  | Field shape is not provenance or authorization. Only independently eligible source facts cross; do not mine notes or permit AI to rewrite protected meaning as “contact details.” Exact content policy remains an owner/founder dependency.                                                                                                                                                   |
| **D2-UX04 — An existing contact is confused with an already shared preparation.** Global contact existence makes the UI claim Maya's new assertions are already available.                  | High                                  | Reuse a visible authorized contact without a duplicate creation ceremony, but report availability of the reviewed assertion/version separately. Existing contact identity alone does not publish this preparation or its history. E9–E11 and D1 owner boundaries.                                                                                                                             |
| **D2-UX05 — Conflicting phone/email overwrites a current canonical fact.** Stale private preparation changes the shared record or routes later outreach wrongly.                            | High                                  | Preserve entered values and the source's canonical value. When both are viewable, label the actual conflict and show only supported owner-authorized corrections. Do not offer “replace” or “keep both” unless that exact command is qualified. If unresolved, keep preparation saved and block only the unsafe availability operation. E10 is a preservation analogy, not a conflict policy. |
| **D2-UX06 — Matching reveals hidden existence.** “Already in CRM,” a changed action, a count or notification suggestion discloses a protected contact.                                      | High                                  | Apply current result-disclosure rules before suggestions and results. Preserve D1 absent/hidden equivalence where required, with the same lawful preparation-save result. No hidden-match explanation or copied staff roster.                                                                                                                                                                 |
| **D2-UX07 — Repeated action duplicates publication or notices.** Double tap, Back, two tabs or a lost response looks like a new command.                                                    | High                                  | Recover the same accepted reviewed intent. “Already available to staff” is valid only for the same qualified result/version. A new optional notice after completion is a separately deliberate action if supported; repeated availability must not resend automatically.                                                                                                                      |
| **D2-UX08 — Notification failure looks like lost contact work.** User repeats the whole action or creates another prospect.                                                                 | Medium–high                           | Primary result says availability succeeded; secondary result explains the notification problem. Recovery replays only the still-authorized missing effect. E1 establishes separation; Core source contracts, not vendor marketing, establish correctness.                                                                                                                                     |
| **D2-UX09 — A review becomes stale before confirm.** Contact, organization, permission, allowed fields or recipients change while a dialog is open.                                         | High                                  | Revalidate at acceptance. Show changed reviewable facts before a materially different action; do not silently widen or overwrite. Preserve permitted input. Late results from A cannot replace the current record B or clear a newer draft.                                                                                                                                                   |
| **D2-UX10 — Clearing recipients still sends to stale selections.** Form state or a delayed picker response carries old recipients.                                                          | High                                  | Empty means no notification request for this action. Test select→remove all→confirm and context changes. If testing a checkbox variant, also test on→select→off→confirm. This is an operation invariant, not just hiding controls.                                                                                                                                                            |
| **D2-UX11 — Notification payload bypasses current CRM restrictions.** Mail preview, push title or queued content exposes details after authority narrows.                                   | High                                  | Qualify the payload and current authority independently; no private body in a title, snippet or exported email. E5/E8 are concrete documented counterexamples to assuming app access controls messages. No promise to recall delivered copies.                                                                                                                                                |
| **D2-UX12 — Optional notification becomes mandatory staff approval.** User cannot finish without a recipient, assignee, reason or response.                                                 | Medium                                | With notification off, finish the ordinary path. No recipient selection or waiting for staff as a substitute for source admission. A genuine permission/identity blocker is explained as that blocker without revealing protected reasons.                                                                                                                                                    |
| **D2-UX13 — A phone confirmation hides the consequences.** Footer covers preview, focus begins on commit, names truncate, or keyboard makes Cancel unreachable.                             | Medium–high                           | One readable column, no horizontally scrolling field comparison, visible Cancel, unobscured focus and comfortable targets. Keep organization/audience available, support long names/values, announce results. U1/U4/U5/U7.                                                                                                                                                                    |
| **D2-UX14 — Reversal promises more than it delivers.** “Undo sharing” implies staff never saw or used it.                                                                                   | High                                  | Use qualified correction/restriction language and explain delivered/read-copy limits where relevant. Do not invent an unshare product policy. P27 C08 and E5.                                                                                                                                                                                                                                 |
| **D2-UX15 — The picker leaks or selects the wrong staff member.** Similar names or cross-organization results send attention to the wrong person.                                           | High                                  | Search only the exact permitted current organization/recipient purpose. Show authorized disambiguation, not private roster attributes. Read back selections in the review; verify stale/revoked recipient behavior without all-staff fallback.                                                                                                                                                |
| **D2-UX16 — Staff availability is mistaken for outreach or development progress.** Creating a contact is counted as a supporter, actual conversation, consent, pledge or cultivation entry. | High                                  | Use the action's precise name and source result. Sharing neither sends to the prospect nor creates those independent facts. Avoid celebratory conversion labels and automatic follow-up tasks.                                                                                                                                                                                                |

## Representative tests to run before UI qualification

These are proposed task scenarios, not tests already executed or a claim of
exhaustive usability coverage. Recruit actual missionary and staff users with
varied experience, plus keyboard/screen-reader users and people who work mainly
on phones. Use synthetic contact information. Compare task completion,
misunderstandings, navigation, correction effort and uncertainty with the
current authorized workflow; set performance budgets from measured evidence,
not invented success rates or a fixed number of participants.

1. **Ordinary availability, notification off.** A missionary reviews incomplete
   eligible details, confirms once and continues. They can explain the ordinary
   staff audience and find the result without inventing a ministry or task.
2. **Optional selected notification.** The missionary chooses one staff member.
   Ask who else can see the contact details. Verify an unnotified authorized
   staff user can find them and that the picker did not create any grant.
3. **Choose then clear recipients.** Select two people, remove both, confirm. No notice is
   requested; no empty-recipient error or extra page appears.
4. **Existing visible contact.** Use a canonical contact already available to
   the actor, including one with a shared household email. Confirm there is no
   duplicate person, automatic household merge or exposure of unrelated history.
5. **Conflicting contact value.** The preparation's email differs from the
   visible canonical value. The user can explain what will change, preserve
   their input and avoid unauthorized replacement. Include a concurrent edit.
6. **Hidden-existing versus absent.** Paired fixtures differ only in hidden
   identity/work. Compare visible choices, hints, messages, recipient results,
   timing categories and recoveries; neither explains protected existence.
7. **Private-history trap.** Seed a unique private sentence in notes, task text
   and an AI-suggested summary. It never appears in the preview, admitted contact
   facts, notice, staff search, activity, logs or a shared-history derivative.
8. **Double tap and lost response.** Confirm twice or disconnect after command
   acceptance. Recover exactly the original result; user sees no false failure,
   second contact, extra notice or lost preparation.
9. **Availability succeeds, notice fails or remains unknown.** User can state
   what succeeded and choose safe notification recovery without redoing
   availability. Include a mixed-recipient outcome.
10. **Context/authority change.** Switch organization/record or revoke access
    while the review or recipient search is open. Old results cannot fill the
    new form, clear a newer draft, publish into another context or disclose a
    stored success body beyond current authority.
11. **Already available, reopen/back/two tabs.** Re-enter the action for the same
    admitted version. Show its truthful status; no new notice or publication
    occurs. If new facts are proposed, distinguish them from the existing result.
12. **Mobile and assistive technology.** Complete with a small viewport, large
    text, on-screen keyboard, keyboard-only navigation and mobile/desktop screen
    reader. Check long/non-Latin names, picker/chip announcements, focus
    return, no accidental Enter commit from search, Cancel and persistent status.
13. **Wrong recipient and lookup outage.** Disambiguate similarly named staff
    using only permitted information; recover an unavailable optional picker
    by deliberately continuing with no recipients. Never broaden to all staff.
14. **Post-disclosure correction.** Correct or restrict through the qualified
    owner and verify what future readers see. Users do not believe this erased
    material already lawfully read or delivered.

## Owner reconciliation and remaining qualification

The [D1 owner boundary review](../d1-evidence/owner-boundaries.md) supplies the
proposed P9 restricted-preparation source and the separation between attributed
assertions, canonical identity and staff admission. It expressly remains a
coordinated P9/P12 extension to qualify, not an implemented producer.
[P27 REQ27-P01](../../../../prds/sitestacker-parity/phase-27-donor-development/partnerships.md#req27-p01--continuing-work-belongs-to-an-identified-relationship-purpose)
preserves authorized early work before an identified ministry.

[P27 context C02–C09](../../../../prds/sitestacker-parity/phase-27-donor-development/context.md#req27-c02--new-eligible-shared-content-and-truthful-private-alternatives)
provides directly relevant inherited boundaries for protected history,
attribution, current-authority recovery, separate accepted/derivative outcomes,
calm composition and no automatic contact/progress effects. Its exact shared
partnership audience is **not** D2's ordinary staff CRM audience and cannot be
copied to grant history access. The source principles support the analysis;
the exact new contact-availability and notification purposes still require
owner qualification.

Required next evidence is narrow and concrete: the exact eligible contact-fact
set and source write/admission rules; the currently authoritative ordinary staff
audience explanation; the allowed conflict/correction path; the current
notification-recipient projection and channel; availability/notification retry
and derivative-state proofs; actual UI/source/database role tests; and a
representative pilot proving that users understand access versus attention.
No inspected external source supplies Core's transactional guarantee, current
permission check, hidden-record nondisclosure or notification idempotency.

No UI, code, schema, source contract, live CRM data, external message, issue or
root/session artifact was changed by this research lane. This file's structural
checks do not qualify the proposed user journey.
