# D3 UX and data-quality research — no new continuity access

Research/retrieval: **2026-10-16 UTC**. Research only: no new product policy,
workflow, permission, retention schedule, implementation or runtime qualification
is established by this note. Official public documentation was read; no vendor
account, actual offboarding, archival/deletion action or user study was performed.

## Decision and recommendation

The founder selected **no new access right on departure or incapacity**, and
asked for simple UX and clean, useful data. Staff, administrators and successors
do not gain access to unshared preparation merely because its missionary leaves
or cannot continue. This preserves D1's restricted start and D2's deliberate
contact availability. It does not promise the departed missionary continued
access, erase independently authorized organizational facts, or dispose of
records automatically.

Recommend the smallest useful presentation: a truthful access explanation,
ordinary source-authorized correction, and an uncluttered working list.
**Reversible archiving of the exact preparation entry is a proposed cleanup
option, not a selected D3 policy.** Use an existing qualified source operation
where one exists. The bounded P9 preparation source is still an owner extension;
its archive, restore and disposition behavior cannot be assumed from a generic
CRM soft-delete or a vendor example. Until qualified, the UI must not advertise
Archive, Restore or Delete as working capabilities.

If adopted, archiving should remove the particular preparation from current work
without deactivating the person across the organization's CRM, changing access,
closing accepted duties or silently starting retention. A way to find the
archived entry and restore it under **current authority** would make that promise
useful. Retained data remains subject to its real retention/disposition owner;
“archived” must not mean indefinite storage.

The strongest lower-complexity alternative is a filtered current-work list with
no new lifecycle mutation. It can reduce visible clutter while preserving source
state, but filtering alone does not provide record disposition, resolve mistakes
or tell the user that an entry has been deliberately set aside. Prefer it when
existing source states already express the needed meaning. Do not add an archive
state simply to satisfy an assumed feature checklist.

## Exact proposed language for consolidation

> Leaving the organization or being unable to continue does not make unshared
> prospect preparation available to staff. Existing authorized contact records
> and accepted organizational duties continue under their own source rules.
> End access when required by the identity and permission owners; do not delay
> that for handoff or treat a replacement assignment as a transfer of private
> information.

> Keep the workspace useful through truthful current-work views and ordinary
> source-authorized correction. If reversible archiving is adopted, explain
> exactly which entry it removes from current work, how an authorized user can
> find it again and what remains unchanged. Archiving is distinct from deletion,
> person-level inactivity, access removal, consent and task completion. D3
> chooses no automatic archive, age-based purge, permanent storage or new
> administrator recovery right.

The first paragraph records D3's access choice with inherited boundaries. The
second contains a **conditional UX recommendation**, not approval of a new
archive/restore source command. The [D3 owner review](owner-lifecycle.md) is the
local evidence for these distinctions and the still-open preparation lifecycle.

## Current primary CRM evidence

Confidence here describes confidence in the documented claim, not tested vendor
behavior or fitness for Asym. **High/documented** means the official article body
was readable and explicit. **Moderate** means version/date or retrieval limits
remain. No source proves Core's access enforcement or user comprehension.
Undated articles were available at retrieval but lack a dependable update date.

| ID / official source and displayed date                                                                                                                                                                                                                                                                                                | Documented behavior                                                                                                                                                                                                                                                                                                                 | Implication and limit                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1 — [Virtuous: How do I archive a contact?](https://support.virtuous.org/hc/en-us/articles/360050635632-How-Do-I-Archive-a-Contact), updated **2025-11-17**; High/documented                                                                                                                                                          | Contact archiving hides records from the main screen and contact/individual queries, retains giving history, and excludes them from gift/contact import search. Bulk archive and bulk unarchive have different capabilities.                                                                                                        | Useful evidence that cleanup can preserve history but have wider effects. **Counterexample:** removing old records from matching can make duplicate prevention harder. Do not import whole-contact scope, its blanket no-delete rule, two-year examples, giving/engagement criteria or app-wide effects into restricted preparation. |
| C2 — [Virtuous glossary: Archive](https://support.virtuous.org/hc/en-us/articles/360050474332-How-to-Speak-Virtuous-Glossary), updated **2025-08-28**; High/documented                                                                                                                                                                 | Archived contacts preserve history; the glossary describes an administrator view and unarchive ability.                                                                                                                                                                                                                             | Documents a reversible product concept. **The administrator access is a vendor permission, not Asym authority.** D3 expressly does not introduce an admin archive browser or private-record restoration grant.                                                                                                                       |
| C3 — [Dynamics 365 Sales: Manage accounts and contacts](https://learn.microsoft.com/en-us/dynamics365/sales/accounts-contacts), updated **2026-05-29**; High/documented                                                                                                                                                                | Deactivating a contact makes it read-only, hides it from most views and retains history. Related opportunities, activities and other records remain active.                                                                                                                                                                         | Excellent separation of inactive display from deletion and related-work lifecycle. A missionary leaving is not evidence that a supporter is inactive. Do not copy Dynamics' read-only rule, related-record behavior or company/contact structure as Asym policy.                                                                     |
| C4 — [Power Apps: Deactivate or activate an account or contact](https://learn.microsoft.com/en-us/power-apps/user/deactivate-activate-account-contact), updated **2024-12-10**; High/documented, dated model-driven-app guidance                                                                                                       | Describes finding inactive records and deliberately activating them again, preserving the audit trail rather than deleting the record.                                                                                                                                                                                              | A later authorized retrieval path makes reversibility useful beyond a short toast. This is a dated platform-specific flow, not proof that Asym restoration should restore old access, cancel newer corrections or restart paused work.                                                                                               |
| C5 — [Bloomerang: Constituent Dashboard](https://help.bloomerang.com/en/articles/12632808-constituent-dashboard), **2026-05-20**; High/documented                                                                                                                                                                                      | The list has status filters for Active/Inactive/Deceased and separate donor-lifecycle filters. Missing contact information is shown empty.                                                                                                                                                                                          | Supports distinct filter meanings and honest missing values. Do not infer deceased, inactive, lapsed or unvaluable from staff departure, no gift or empty fields; do not import its 13-month giving classification.                                                                                                                  |
| C6 — [Bloomerang: Bulk delete constituents](https://help.bloomerang.com/en/articles/12632758-bulk-delete-constituents), **2026-01-02**; High/documented                                                                                                                                                                                | Deleting a household can delete its constituent members; this tool permanently deletes associated information and cannot restore it.                                                                                                                                                                                                | Concrete reason not to use “Delete contact” as routine workspace cleanup. This is a destructive comparator, not a proposal for bulk deletion, household cascades or exporting private records before removal.                                                                                                                        |
| C7 — [Blackbaud Raiser's Edge NXT: Constituent statuses](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/bb-constituent-status.html), undated; High/documented, version/date unconfirmed                                                                                                                        | Inactive retains history while limiting use. Deceased, anonymous giving, requests-no-email and invalid-address indicators have different meanings.                                                                                                                                                                                  | A single inactive/private/removed badge cannot carry all these meanings. No email suppression, anonymity, death or invalid address should be inferred from a cleanup action. Vendor merge and communication rules do not transfer.                                                                                                   |
| C8 — [Blackbaud: User details](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/sec-userdetails.html), undated; High/documented, version/date unconfirmed                                                                                                                                                        | User inactivity, removal of solution access and deletion of the user association are separate operations. Access-oriented action history is retained; recent-access display can lag by a day.                                                                                                                                       | Account access and contact cleanup are different jobs. Last-login display is not proof of incapacity. Do not import its admin powers, restoration of prior rights, timing, inactivity automation or audit-reader scope.                                                                                                              |
| C9 — [HubSpot: Deactivate and remove users](https://knowledge.hubspot.com/user-management/remove-hubspot-users), updated **2026-08-03**; High/documented                                                                                                                                                                               | Deactivation prevents access while retaining historical activities; account removal differs from deactivation and from deleting a global user. Created assets/activities can remain attributed to a deactivated/removed creator. The article also distinguishes some previously shared material from inaccessible private material. | Strong evidence that ending access need not erase historical authorship. **Do not import generic “reassign records” advice, super-admin powers, impersonation, prior-access restoration or vendor automation behavior.** These do not authorize access to Asym unshared preparation.                                                 |
| C10 — [Bloomerang: Review and merge duplicate constituents](https://help.bloomerang.com/en/articles/17568946-review-and-merge-duplicate-constituents-in-the-data-health-hub), current destination displays **“Updated this week”**, exact date unknown; High for same-session documented behavior, Moderate for changed-page freshness | Earlier D2 reading of official `/15793806-…` was dated **2026-07-02** and explicitly described potential-match review, separate household alternatives and irreversible merge consequences. Reopening in D3 redirects to the new official URL.                                                                                      | Keep uncertain matches distinct from confirmed identity and preserve consequences for review. No automatic dedupe on departure or archive. The new redirect's full body was not re-read; no newly changed merge behavior is claimed. The earlier full inspection is recorded in [D2 research](../d2-evidence/ux-research.md).        |
| C11 — [Virtuous: User permissions](https://support.virtuous.org/hc/en-us/articles/360050985731-How-Do-I-Manage-User-Permissions), updated **2025-11-24**, same-session D2 reuse; High/documented                                                                                                                                       | Private contacts and private notes have distinct reader rules; contact editing and merge privileges are separate.                                                                                                                                                                                                                   | Privacy wording must describe the actual object and audience. Archived, inactive or authored-by-me cannot be used as synonyms for private. This source provides no new Asym administrator read right.                                                                                                                                |

Targeted MPDX/Tnt searches did not establish the requested departure/privacy
contract. MPDX search results used archive for task completion or Mailchimp
contacts, which are different source meanings. TntConnect's old 3.2 release page
discusses inactive database users without sufficient current audience detail.
Neither is used as evidence that D3 needs deletion, an archive service, financial
redirects, password recovery access or contact transfer. No community discussion
or marketing claim is treated as an access contract.

## Primary UX guidance

These sources were researched in parallel by the standards lane for this D3
pass. Exact date qualifications matter: component release dates are not the
publication dates of every sentence of guidance.

| ID / source                                                                                                                                                                                                                 | Guidance and confidence                                                                                                                                                                | Application and limit                                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 — [GOV.UK: Tag](https://design-system.service.gov.uk/components/tag/); latest displayed component change **2026-02, v6.0.0**, guidance change **2025-05**                                                                | High/documented: status tags are descriptive and noninteractive; start with the smallest useful set of statuses.                                                                       | Use a clear Archived status only where it is true. Put Archive/Restore in an actual action control. The guidance does not make a status into an access rule.                                                                                |
| U2 — [GOV.UK: Button](https://design-system.service.gov.uk/components/button/); latest displayed component change **2026-07, v6.4.0**                                                                                       | High/documented: action-specific labels; warning styling for serious destruction that cannot easily be undone; meaning must not rely on color.                                         | Prefer “Archive entry” or “Delete entry” only when those exact effects exist. “Clear” obscures scope. Do not add a destructive red confirmation to routine reversible cleanup merely by analogy.                                            |
| U3 — [Microsoft Fluent 2: Dialog](https://fluent2.microsoft.design/components/web/react/core/dialog/usage), undated current page                                                                                            | High/documented: dialogs interrupt; use clear consequences and specific actions, avoiding redundant choices.                                                                           | Keep source-permitted routine cleanup short. If actual destruction or material side effects require review, explain them in one focused confirmation. This is behavior guidance, not permission to replace Core's Base UI/base-maia system. |
| U4 — [Outlook: Archive in Outlook for Windows](https://support.microsoft.com/en-us/outlook/mail/archive-in-outlook-for-windows), undated current new/classic Outlook guidance                                               | High/documented: archive moves mail without deleting it, keeps it findable, and new Outlook offers Undo feedback.                                                                      | A familiar reversible declutter example. Do not import mailbox access, AutoArchive or retention rules. A temporary Undo does not replace a later restore path if that is promised.                                                          |
| U5 — [W3C: Understanding SC 3.3.4](https://www.w3.org/WAI/WCAG22/Understanding/error-prevention-legal-financial-data.html), updated **2025-09-16**, informative explanation of WCAG 2.2 AA                                  | High/documented: applicable serious data changes require reversibility, checking/correction or review/confirmation; the explanation does not require a dialog for every ordinary save. | Distinguish reversible archive from destructive deletion. Actual conformance depends on the implementation; this does not require offering deletion or specify its retention policy.                                                        |
| U6 — [Apple HIG: Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts) and [Undo and redo](https://developer.apple.com/design/human-interface-guidelines/undo-and-redo), exact revision unconfirmed | Moderate: official indexed text supports avoiding alerts for common undoable actions and showing reversal results. Direct pages returned JavaScript shells.                            | Corroborates proportionate feedback; the fully readable sources above carry the recommendation. No promise that a particular Asym operation is undoable follows.                                                                            |

The [D1 UX](../d1-evidence/ux-research.md) and [D2 UX](../d2-evidence/ux-research.md)
notes already cover international contact fields, actual audience labels,
keyboard/focus/reflow, accessible status messages, source-acknowledged outcomes,
unknown results and retry recovery. Those requirements remain; they are not
replaced by a new cleanup wizard.

## Minimal recommended UX

### Access explanation: selected D3 meaning

Use a plain label at the restricted preparation, such as **“Not shared with
staff”**, paired with an explanation of its actual source scope. Avoid “Only
you,” “Private forever,” “Staff can recover this” or “Archived = private.”
None is established by D3. An already shared canonical contact can coexist with
restricted preparation, so the label must refer to **this preparation**, not
every fact about that person.

Suggested concise help text:

> Leaving the organization or being unable to continue does not share this
> preparation with staff. Contact information already available in the staff
> CRM keeps its own access rules.

This belongs in an existing access explanation where useful, not a repeated
departure warning on every save. It does not promise future author access or
indefinite retention. Staff views must not gain a list, count, placeholder or
“recover private prospects” button merely to explain the rule. A general
offboarding explanation can say private preparation is not transferred without
revealing that a particular worker has any.

### Ordinary cleanup: conditional recommendation

If the source owner adopts reversible entry archival:

- Offer **Archive entry** in the normal entry actions, scoped to the preparation.
  Show a brief description such as **“Remove this entry from your working
  list. Its access does not change.”** Use this only if those effects are true.
- On acknowledged success, show **“Entry archived”** and a qualified **Undo**
  action when supported. Keep a permitted Archived filter/view and a later
  **Restore entry** action if later restoration is part of the promise. Do not
  create a separate archive application, supervisor queue or cleanup campaign.
- On the archived detail, keep the access explanation distinct from the
  **Archived** work-state indicator. Restoration returns the exact permitted
  entry to work, subject to current rights; it does not publish it, restore old
  grants, create an encounter or restart canceled notifications/tasks.
- An entry with an uncertain archive outcome says **“Checking archive
  status…”**, not “Archived” or “Deleted.” Reconcile the same operation rather
  than recreating the entry. A source failure preserves whatever is lawfully
  saved; a late result cannot clear another record's work.

This proposal does not imply that staff may archive inaccessible preparation or
that records are automatically archived when a missionary leaves. It also does
not select global contact inactivity, automatic task cancellation or an archive
timer. If the operation has broader side effects, that is a different product
choice and should not be hidden beneath this simple wording.

### Departure or incapacity: no new workflow

Use the existing access/offboarding owner. There is no new successor picker,
unshared-contact transfer, compulsory handoff review or “request private access”
button from D3. Do not infer incapacity, departure or permission to inspect from
silence, elapsed time, missed tasks or a last-login date.

For independently authorized existing organizational work, show the source's
true current responsibility. A departed/ineligible assignee is not healthy
coverage and must not remain a selectable current recipient merely because a
historical author record survives. Preserve historical attribution where lawful;
do not relabel past work as the replacement's work. Reassignment of accepted
duties uses its existing source authority and cannot transfer private context.
No such new duty arises from being a prospect alone.

## Clean-data approach without destructive shortcuts

| Need                          | Minimal source-governed treatment                                                                                                                          | Shortcut to reject                                                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Relevant daily work           | Filter by actually qualified current-work state; consider reversible entry archive only if adopted.                                                        | Automatically make all of a departing worker's people inactive or hide unresolved accepted obligations.                                               |
| Correct contact details       | Correct the exact attributed assertion, or a canonical field through independently authorized owner commands; show conflicts only when viewable.           | Treat the latest private assertion as a global overwrite, verification, consent or new identity.                                                      |
| Useful incomplete preparation | Keep unknown values honest and distinguish saved preparation from unresolved identity/admission.                                                           | Fabricate name parts, contact methods, Ministry Assignment, gift intent or a data-completeness score to make a row look tidy.                         |
| Duplicate control             | Reuse qualified source identity; consider authorized archived matches without auto-restoring them; keep unresolved matches and hidden existence protected. | Omit every archived record from matching, then create another person; merge shared mailboxes/households automatically; show hidden “duplicate” hints. |
| Historical continuity         | Retain lawful source references, authorship, corrections and accepted organizational evidence under their qualified audiences.                             | Delete an author/assignment and cascade away history; reattribute it to a successor; union private histories during a person merge.                   |
| Valid current access          | End current access when required, independently of cleanup; re-evaluate rights upon return or restoration.                                                 | Delay access removal until handoff finishes, or restore all historical rights when an account is reactivated.                                         |
| Lawful disposition            | Follow the exact record/body/audit/derivative retention and erasure rules; current restrictions apply before restored data can be read or used.            | Keep everything forever because it is archived; purge at an invented age; promise total deletion while copies remain accessible elsewhere.            |
| Fewer notifications           | Present only source-applicable current effects; preserve separate accepted outcomes and owner recovery.                                                    | Archive to mark a task complete, erase a pending send, revive canceled work on restore, or notify staff of private data as “cleanup.”                 |

“Clean” is correctness and relevance, not simply a smaller row count. No gifts,
old gifts, missing email, no recent login, silent engagement metrics or an absent
worker are sufficient evidence that a human relationship is worthless, that a
record may be deleted or that staff may read it. The Virtuous bulk-archive
examples and Bloomerang giving categories are explicitly **not adopted
selection rules**. Source owners may separately have real lawful schedules;
this note neither invents nor suspends them.

## Material concerns and proposed evidence

Severity is conditional design impact, not an observed incident or measured
likelihood. These checks need actual owner/service/database/UI qualification.

| ID / failure                                                                         | Severity    | Falsifiable check or minimal treatment                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D3-UX01 — “No new access” is read as continued author access forever.                | High        | Ask users what happens to their own login after departure. Explain only the selected staff boundary and actual owner policy; do not advertise guaranteed restoration.                                   |
| D3-UX02 — Admin Archive becomes a hidden continuity-access route.                    | High        | An administrator/successor without the source grant cannot enumerate, count, search, read, export or restore the private preparation. Archival retention supplies no new right.                         |
| D3-UX03 — Archive, inactive, departed, unshared and deleted collapse into one badge. | Medium–high | Users can explain work state versus access versus disposition. Use the smallest useful status vocabulary and action-specific labels, not a large new taxonomy.                                          |
| D3-UX04 — Global contact deactivation breaks another worker's relationship.          | High        | Archive one preparation for a person who has independent authorized shared work elsewhere. The shared contact, other ministry work and financial truth remain governed by their owners.                 |
| D3-UX05 — Cleanup deletes or completes accepted responsibilities.                    | High        | An independently accepted task remains source-truthful after entry cleanup or author departure. No automatic completion, false handoff or new task arises from a tentative prospect.                    |
| D3-UX06 — Archived matches are forgotten or reveal private existence.                | High        | Test visible archived, hidden archived and absent fixtures with shared email/same name. No duplicate canonical creation or automatic merge; no unauthorized difference in suggestion/result shape.      |
| D3-UX07 — Restore revives stale access, sends or private-to-shared projections.      | High        | Restore after role loss, suppression, contact correction and a narrower source policy. Current policy wins before read/dispatch; no stale grants or canceled effects return.                            |
| D3-UX08 — A “delete” promise ignores history, logs or backup copies.                 | High        | Before presenting deletion, prove exact retained/disposed artifacts and reader scopes. Do not claim this from row removal or hidden UI. No new purge timer is chosen.                                   |
| D3-UX09 — Row removal disorients phone or keyboard users.                            | Medium      | Focus moves logically after archive; status is announced; Undo and the later permitted retrieval route work with screen reader, touch and zoom. No swipe-only path or color-only meaning.               |
| D3-UX10 — A lost response or double action duplicates/recreates work.                | Medium–high | Reconcile the same archive/restore command and current authority. A late response cannot clear a newer edit or other entry; unknown is not success or failure.                                          |
| D3-UX11 — Cleanup dashboard leaks unshared inventory.                                | High        | Staff cannot learn names, counts, stale dates, task titles or owner-specific existence from “orphaned/private prospects” reports without exact authority. No new administrative overview is introduced. |
| D3-UX12 — Silent inactivity is treated as incapacity.                                | High        | Long quiet periods, travel or a no-login fixture never trigger sharing, archive, transfer or destruction. Only actual source-qualified events affect access/responsibility.                             |

## Proposed small usability evaluation

Use synthetic records with actual missionary/staff participants, including phone
and assistive-technology users. No interviews or tests have occurred in this
research lane. Measure unassisted task completion, misunderstanding, unnecessary
navigation, correction effort and uncertainty against the current qualified
workflow; set numerical budgets from evidence.

1. Read the restricted-preparation label and explain what staff or a successor
   can see after departure, and what it does not promise about future login.
2. If archival is adopted, set aside an entry, locate it after Undo disappears,
   and restore it. Explain what happened to the shared person and separate tasks.
3. Compare an archived private entry with a shared contact about the same person;
   distinguish their scope without copying or revealing protected history.
4. Try resuming after access was revoked and then legitimately re-established.
   Verify current authority, honest unavailable copy and no promise of automatic
   historical access.
5. Correct an old phone number while a canonical contact has a newer value;
   retain provenance and expose only an authorized conflict/repair route.
6. Experience an archive timeout, double tap and context switch. Confirm the
   result is recoverable without duplicate identity, lost work or false status.
7. Exercise archive/filter/restore using keyboard, screen reader, large text and
   phone touch. Status tags remain noninteractive; actual controls are named,
   reachable and comfortably targetable.

## Qualification limits

This lane inspected current official CRM and UX guidance plus the local D1/D2
notes and the D3 owner lifecycle review. It did not perform a retained-data
census, schema qualification, actual role test, migration, offboarding, browser
journey, vendor account test or pilot. The [D1 lifecycle review](../d1-evidence/lifecycle-disclosure.md)
and [D3 owner review](owner-lifecycle.md) supply detailed inherited custody,
derivative and current-authority constraints; external examples are comparisons.

The remaining narrow work is to qualify ordinary preparation removal/correction
and source-governed disposition, actual audience wording and return behavior,
then prove the reached readers/derivatives and minimal UX. No formal archive
policy, new cleanup platform, permanent cache of private contacts, automatic age
purge, successor access or administrator exception is authorized by this note.
