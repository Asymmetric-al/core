# D4 — Reversible archive UX and recovery evidence

Research date: **2026-10-16 UTC**. Research-only support for the founder's selection
of **A: archive unused unshared preparation from active prospects**. No UI,
source command, permission, retention period, formal specification or workflow
is implemented by this note. Public documentation establishes documented vendor
behavior; no authenticated vendor account or Asym prototype was tested. Proposed
copy, layouts and tests below are design recommendations, not user-study results.

## Conclusion and selected boundary

Keep this in the existing prospect workspace: **Active / Archived**, the same
search and detail, **Archive prospect**, and **Restore to active**. Recommend one
deliberate ordinary archive action, a concise success message with optional
**Undo**, and a lasting way to find and restore the preparation after that message
has disappeared. No new archive application, reason form or routine confirmation
dialog is needed for this narrow reversible action.

The founder selected the behavior, not these exact control types or words. D4
changes the active-list disposition of the same bounded preparation. It does not
select canonical Party archival, a read-only record policy, deletion, automatic
cleanup, a retention timer, new access on departure, or a broader post-share
contact lifecycle. Find and restore remain subject to current exact source
authority and lawful retention. Avoid promises such as “always recoverable.”

The [D4 owner review](owner-lifecycle.md) establishes the material boundaries:
retain source identity and audience; do not complete independent duties, restore
expired rights, reset retention, recreate erased content or cancel an accepted
D2 share. Its current-source/revision and outcome rules are necessary to make the
simple UX truthful. The bounded P9 preparation source and its archive/restore
operation still need owner qualification; an existing canonical `archived` field
is not evidence that this operation is already available.

## Evidence method and confidence

The comparison deliberately covers a nonprofit CRM, another nonprofit CRM, a
general CRM and a collaborative CMS. It asks four concrete questions: where an
archived record goes, how someone finds it later, how they restore it, and what
else the vendor changes. Standards research then tests the recovery, focus,
feedback and search-scope recommendations. This is deeper evidence for the
chosen interaction, not a feature-count comparison.

- **High confidence in the stated documented behavior:** current full primary
  support pages were read for Givebutter, Virtuous archive, Dynamics/Power Apps,
  and Confluence archive/restore. D3 evidence was reused where identified.
- **High confidence in the accessibility requirement; moderate confidence in
  the proposed arrangement:** WCAG is normative; Understanding documents and
  APG explain application. None proves that one particular Asym layout is best.
- **Moderate confidence in the minimal UI recommendation:** multiple products
  support discoverable archive views and explicit restoration. Their permission,
  lifecycle, automation and confirmation choices differ. No benchmark supplies
  Asym's rights or validates Asym's source operation.
- **Limited evidence:** Apple Alerts was available as current official indexed
  guidance, while direct opening returned a JavaScript shell. It is secondary
  support for avoiding unnecessary alerts, not the sole basis for the decision.

All URLs below were consulted on the research date. A crawl date is not a product
release date. “Undated” means no precise publisher revision was established.

## Primary CRM and CMS comparison

| ID and source                                                                                                                                 | Publisher date / evidence                                                                | Exact useful behavior                                                                                                                                                                                                                                                                                  | Implication and limit for Asym                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1 — [Givebutter: archive or delete contacts](https://help.givebutter.com/en/articles/9150570-how-to-archive-or-delete-contacts)              | Current full official guide; displays “Updated over 2 weeks ago,” not an exact date.     | Archive is reversible. Contacts has an Archived filter; select archived records and Unarchive to return them to active contacts. The individual action uses a dialog with reason/notes. Archived contacts leave recipient lists and duplicate detection. Deletion is different and cannot be restored. | Strong nonprofit evidence for recovery inside the existing list. The broader contact/communication effects and reason dialog explain why its ceremony is not automatically appropriate for a list-only preparation action. Do not adopt archive as suppression or exclude retained identities from qualified matching. **Documented, not hands-on verified.** |
| C2 — [Virtuous: archive a contact](https://support.virtuous.org/hc/en-us/articles/360050635632-How-Do-I-Archive-a-Contact)                    | Updated **2025-11-17**; full official guide re-read.                                     | Archived contacts leave normal contact/individual queries; gift history remains. Gift/contact import search excludes them. Archive can be bulk; unarchive cannot. Individual archive includes a confirmation checkbox and optional reason.                                                             | Confirms separation of normal work from retained history, but exposes matching and recovery costs. Its canonical contact scope, bulk criteria and confirmation are not requirements for Asym's bounded preparation. **High confidence in documentation only.**                                                                                                |
| C3 — [Virtuous glossary: Archive](https://support.virtuous.org/hc/en-us/articles/360050474332-How-to-Speak-Virtuous-Glossary)                 | Updated **2025-08-28**; D3 full-read evidence reused, current official result rechecked. | Archived contact activity/gift history remains; administrators can view the archive and unarchive records.                                                                                                                                                                                             | A useful counterexample: recovery routed through administrators would conflict with treating D4 as ordinary currently authorized preparation recovery. This vendor's administrator rights confer no Asym access. No precise unarchive interaction beyond the documented list/ability was verified.                                                            |
| C4 — [Dynamics 365 Sales: accounts and contacts](https://learn.microsoft.com/en-us/dynamics365/sales/accounts-contacts)                       | Updated **2026-05-29**; current full official body read.                                 | Deactivated contacts become read-only, leave most views and retain history. Related opportunities, activities and other records remain active. Inactive Contacts is the discovery view.                                                                                                                | Supports distinct current-work and historical views, and independent related-work lifecycle. Asym is archiving preparation, not deactivating a person; do not copy read-only semantics or presume all linked duties stop.                                                                                                                                     |
| C5 — [Power Apps: deactivate or activate a contact](https://learn.microsoft.com/en-us/power-apps/user/deactivate-activate-account-contact)    | Updated **2024-12-10**; dated guide still currently published and re-read.               | Restore begins in the existing Contacts area: choose Inactive Contacts in System Views, select records, Activate and confirm. Existing relationships remain while inactive; new relationships/editing are constrained.                                                                                 | Demonstrates a persistent route back after navigation. Its activation confirmation and relationship restrictions reflect its wider operation, not proof that reversible preparation needs a modal. General platform documentation, not an authenticated Dynamics test.                                                                                        |
| C6 — [Confluence Cloud: archive content items](https://support.atlassian.com/confluence-cloud/docs/archive-pages/)                            | Current full official page; precise revision undated.                                    | Archived items leave the content tree and quick search; advanced search can include them. Authorized direct links still work and show Archived. Explicit restrictions still apply. The guide warns that moving content with inherited permissions into archive can widen its audience.                 | Good evidence for visible archive state, alternate discovery and useful direct links. Strong adverse evidence against treating an archive location/filter as access enforcement. Preserve Asym source restrictions without a permission-migration ceremony. Do not import disabled editing, archived analytics exclusion or staff notifications.              |
| C7 — [Confluence Cloud: restore archived items](https://support.atlassian.com/confluence-cloud/docs/restore-archived-pages-to-the-page-tree/) | Current full official page; precise revision undated.                                    | Restore is available from the archived item's banner and archive list, subject to its permissions. A destination is selected. The guide warns that changed inherited permissions during restoration can expose content. It labels future administrator bulk restore “Coming soon.”                     | Strong evidence for two routes to the same recovery action. Asym needs no destination chooser for a source disposition. Current exact authority must survive archive/restore; no new rights, nested restore workflow or announced bulk capability is imported.                                                                                                |

The comparison does **not** establish a universal industry rule that archive is
read-only, private, permanently retained, excluded from matching, or available to
an administrator. Products attach substantially different effects to that word.
Asym's narrower selected meaning and source owners govern those effects.

## Primary interaction and accessibility guidance

| ID and source                                                                                                    | Date / status                                                                                           | Supported principle and exact limit                                                                                                                                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| U1 — [W3C Understanding Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html)   | Updated **2026-08-10**; explanatory guidance for WCAG 2.2 SC 2.2.1 A.                                   | Explicitly addresses temporary toast messages. A timer need not be adjustable when the same information/function remains available without that timer; otherwise the criterion applies. Supports later recovery independent of a disappearing Undo. It sets no archive retention period and prescribes no particular Undo duration.                                 |
| U2 — [W3C Understanding Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)       | Updated **2026-05-11**; explanatory guidance for SC 4.1.3 AA; read by standards subagent.               | Material result/status messages must be programmatically available without taking focus. Context matters for changed counts. Ordinary content changes such as displaying a tab panel are distinguished from status messages; do not announce the whole list on every update.                                                                                        |
| U3 — [WAI APG: developing a keyboard interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)   | Current informative guidance; revision undated; read by standards subagent.                             | Removing a focused list item can drop focus to the document body. Maintain visible logical focus, with moving to the next item as an example. The exact fallback sequence for Asym remains a design choice to test.                                                                                                                                                 |
| U4 — [WAI APG: button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)                                 | Current informative guidance; revision undated; read by standards subagent.                             | Buttons activate with Enter and Space; focus depends on whether the action changes context. Archive/Restore are actions, while opening a detail or navigation view uses appropriate navigation semantics. Do not build custom ARIA controls over existing Base UI behavior.                                                                                         |
| U5 — [WCAG 2.2](https://www.w3.org/TR/WCAG22/)                                                                   | Recommendation **2024-12-12**.                                                                          | Relevant requirements: keyboard 2.1.1 A; focus order 2.4.3 A; visible focus 2.4.7 AA; focus not obscured 2.4.11 AA; reflow 1.4.10 AA; target size 2.5.8 AA. Reflow uses 320 CSS-pixel width for applicable vertical content. The AA target rule is 24×24 CSS pixels or its exceptions, not a comfortable universal phone target. Core's touch guidance is stronger. |
| U6 — [Microsoft Fluent 2: toast usage](https://fluent2.microsoft.design/components/web/react/core/toast/usage)   | Current full primary design guidance; revision undated.                                                 | Toasts suit relevant noncritical feedback; necessary actions should not rely on them. Timed dismissal suits results needing no further action; dismissed information should remain findable elsewhere. Its timing, stack sizes, styling and assertive feedback defaults are Fluent choices, not Asym requirements.                                                  |
| U7 — [Apple HIG: alerts](https://developer.apple.com/design/human-interface-guidelines/alerts)                   | Current official indexed guidance; exact revision unconfirmed; direct body limited by JavaScript shell. | Avoid alerts for common undoable actions. Supports evaluating a direct archive with recovery instead of habitual confirmation. Does not establish that an unqualified or wider destructive action is safely reversible. **Moderate source-access confidence.**                                                                                                      |
| U8 — [Scottish Government: search filters](https://designsystem.gov.scot/patterns/search-results/search-filters) | Published **2024-10-03**, updated **2025-08-04**; current official guidance read.                       | Clear categories and visible selected filters explain search scope. Its mobile pattern uses explicit Apply because users may miss automatic changes. This is a richer search-filter pattern: do not copy its accordion, checkbox collection or Apply step into a simple two-view prospect switch without need. Test that result changes remain perceivable.         |
| U9 — [GOV.UK: tag component](https://design-system.service.gov.uk/components/tag/)                               | Current guidance; component colour revision **February 2026 / v6.0.0**, not a date for every rule.      | Status tags should be descriptive, noninteractive and distinguishable from buttons. Supports an Archived status separate from the Restore action. It does not prescribe privacy policy or require a second visual system.                                                                                                                                           |

The local [shared UI contract](../../../../../packages/ui/AGENTS.md),
[frontend rules](../../../../ai/rules/frontend.md),
[accessibility review skill](../../../../ai/skills/accessibility-review/SKILL.md)
and [touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md)
govern composition. `packages/ui/components.json` was checked: exact
`base-maia`, Zinc base, semantic CSS variables and Base UI remain the baseline.
Existing shared tabs, dropdown menu, input, button, badge, empty state and Sonner
files were found. Presence is not an audit of their behavior or a claim that this
prospect screen exists. No CLI install, component edit or design-system migration
was performed for this research-only note.

## Minimal recommended screens and copy

The following is one coherent proposal to evaluate, not a formal specification.
Use existing Core typography, spacing, radii, semantic colour and control
variants. Beauty here comes from a clear hierarchy and calm predictable states:
one list heading, one visible scope control, one search field, readable names,
and consistent actions. No archive metrics dashboard, separate navigation app,
decorative timeline or colour system is needed.

### 1. Existing prospects list

Use **Active** and **Archived** near the list heading. Start ordinary work in
Active. Use the established Core view/filter pattern; tabs are one reasonable
option, not a mandated component or route architecture. The selected scope must
remain apparent on a narrow screen and to assistive technology. Counts are
optional and only count currently authorized records; a zero or hidden count
must never be a hint about inaccessible preparation.

The search's visible label can be **Search active prospects** or **Search
archived prospects**, changing with scope. Keep a query when switching views so
someone can look for the same person without retyping. Clearly show the new scope
and result state. Do not silently expand a search across private sources, tenants
or audiences. Archival is not proof of identity absence.

Use the existing detail link and a normal action menu. The menu item is **Archive
prospect**, not Delete, Close relationship, Deactivate contact or Mark complete.
Give an icon-only menu trigger a useful accessible name, for example **More
actions for [name]**. Never make hover, swipe, a keyboard shortcut or colour the
only way to reach Archive. No new bulk workflow is proposed by D4.

### 2. Archive once, then stay oriented

For this exact voluntary preparation action, recommend no routine confirmation
dialog, checkbox or required reason. The operation has an obvious object and
reversible consequence. The confirmation patterns in C1/C2/C5 belong to broader
contact operations; copying them would not itself improve this experience.

Where the meaning needs explanation, use short adjacent help: **“Moves this
prospect out of Active. Find it in Archived.”** This describes the selected
operation without claiming perpetual storage or a new privacy boundary. It need
not become repeated text on every row. If a later source design adds material
effects beyond this meaning, revisit that design instead of silently adding
effects behind a familiar Archive label.

During acceptance, retain enough context to identify the record and show a
pending state, such as **Archiving…**. A local animation or hidden row is not
evidence of success. On authoritative success:

- From a list, remove the row from Active and retain the current view/query.
  Show **“Prospect archived.”** with optional **Undo**. A currently authorized
  display name can disambiguate multiple operations; do not include private
  planning, contact details or a hidden identity in feedback.
- From detail, keep the useful detail open with an **Archived** status and
  **Restore to active**. Do not throw the user onto an unrelated page or require
  the toast to navigate back to the record.
- Announce the result once using the established accessible feedback pattern.
  Do not move focus into the toast. If the focused row disappears, move to a
  logical surviving target: proposed next record's main link, then previous
  record's main link, then the stable list heading/control for an empty list.
  Do not put focus on another Archive action where a held key can remove the
  next item. Test the actual component and list behavior.

Undo is a convenient current-authorized inverse of this source operation, not a
rollback of the entire contact snapshot. Bind it to the exact preparation and
operation. It must not overwrite newer state, restore old permissions, or repeat
sharing/notifications. Source ordering and recovery govern a delayed Undo.

### 3. Archived remains easy to find

The same workspace exposes Archived after toast dismissal, navigation and
reload. Reuse the familiar list rather than sending the missionary to settings
or an administrator. Show a descriptive **Archived** state where needed,
especially detail and authorized direct links; avoid duplicating a badge on
every row if the selected view already makes the state unmistakable.

Keep work status distinct from audience. The preparation's existing source-scoped
audience label remains meaningful, for example **“Preparation not shared with
staff.”** An Archived badge must not replace that label or imply that independent
canonical contact facts are hidden from staff. Use short explanatory text in
detail if needed: **“This prospect is out of your active list.”** Do not introduce
an audience picker, administrator recovery link or departure exception.

Use existing empty states with specific scope:

| Situation                               | Proposed copy / action                                                                                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Active is empty, with no search         | **No active prospects.** Keep Archived visibly available. Existing Add/new-preparation controls may remain in their established location.                                     |
| Archived is empty, with no search       | **No archived prospects.** Optional single explanatory line: **Prospects you archive appear here.**                                                                           |
| Active search has no permitted result   | **No results in active prospects.** A generic **Search archived prospects** action can keep the query and switch scope. Offer it without implying that a hidden match exists. |
| Archived search has no permitted result | **No results in archived prospects.** Retain the query and normal clear-search/scope controls.                                                                                |
| Results are still loading               | A scoped loading state, not a premature empty result or invented count.                                                                                                       |
| The view cannot load                    | **Couldn't load archived prospects.** A local **Try again** action; do not represent an error as an empty archive.                                                            |

An authorized archived preparation found during a new entry flow can be offered
as existing preparation with an **Open prospect** route and its Archived status.
This is preferable to instructing someone to create a replacement. Exact
candidate matching remains the qualified identity/source function; same name,
shared email or phone is not sufficient for automatic merge or restoration.
No hidden match, count or difference in result shape may disclose forbidden
preparation or a protected canonical person.

### 4. Restore the same preparation

Put **Restore to active** in the archived detail and its ordinary list action
menu. On success use **“Prospect restored to Active.”** In the Archived list the
record leaves that scope, with the same logical focus and feedback discipline.
On detail the state changes in place. An optional **View active prospects** link
can provide a clear destination without forcing navigation or dropping the
query. Restore does not require creating a new contact or filling the original
entry form again.

Do not require a destination, new ministry, archive reason, retention date,
successor, notification selection or re-consent as part of this source-only
transition. No auto-share, automatic task restart or contact-date refresh is
implied. The current content is what can lawfully be shown, not necessarily an
unchanged historical snapshot. If content has been restricted or erased, the
surface must reflect that qualified state without recreating it.

Making Restore prominent does not decide whether editing or the existing D2
share action is available while archived. Do not import a vendor's read-only
policy or infer that archive revokes a separate source capability. Exact
available actions and any necessary current review belong to the source design;
D4 does not authorize implicit restore-on-share or a new share prohibition.

## Material failure cases and concrete treatment

Severity here evaluates a conditional design failure, not an observed defect or
measured incidence. The UX should expose only the small amount of information
needed to continue; the underlying owner checks can remain strict without adding
a workflow wizard.

| Concern / consequence                                                                                                            | Recommended treatment and copy boundary                                                                                                                                                                                                                                                          | Evidence / confidence                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| **High — Wrong scope:** archive deactivates the person, changes shared contact data or closes accepted work.                     | Name the action in prospect context and operate on exact preparation. Keep independent tasks discoverable in their ordinary source surfaces. Do not advertise “all follow-up stopped.”                                                                                                           | D4 owner O4-01/O4-05; C4 useful counterexample. Owner boundary high.                                                     |
| **High — Access changes with location:** archived search, counts or restore grants staff access or revives old rights.           | Apply current source authorization before every result and recovery disclosure. Keep audience distinct from Archived. No admin/custodian shortcut.                                                                                                                                               | D4 owner O4-02; C6/C7 explicitly show inherited-permission risk. High.                                                   |
| **High — Active-only matching causes duplication or hidden-match disclosure.**                                                   | Separate view filtering from qualified identity resolution. Offer only permitted existing preparation; never automatically merge, clone or restore.                                                                                                                                              | D4 owner O4-03; C1/C2 show real archive matching exclusions. High for boundary; matching UX still needs prototype proof. |
| **High — Archive is mistaken for cancelling sharing.**                                                                           | A delayed or accepted D2 share retains its actual outcome. Resolve that outcome under current authority; never say “kept private” because Archive was pressed later. Stale reviewed share intent must be requalified.                                                                            | D4 owner O4-06; accepted D2 review. High.                                                                                |
| **Medium — Only Undo can recover:** a missed toast, screen reader delay or phone keyboard makes archive practically destructive. | Keep untimed Archived discovery and Restore. Undo timing is not the retention policy, and a permanent archive promise is unnecessary.                                                                                                                                                            | U1/U6; C1/C5/C7. High.                                                                                                   |
| **Medium — Focus disappears or lands on another destructive-looking action.**                                                    | Maintain a logical visible focus target after row removal; never steal focus to success feedback. Test first, middle, last and only rows.                                                                                                                                                        | U2/U3/U4. High principle, proposed exact sequence unvalidated.                                                           |
| **Medium — Unknown response is described as success or failure.**                                                                | On timeout: **“Couldn't confirm whether this prospect was archived.”** Offer the existing safe status/retry recovery path. Recover the same command outcome before applying a new inverse or claiming the old state.                                                                             | D4 owner O4-06/O4-07. High boundary; exact retry control is engineering design.                                          |
| **Medium — Known failed archive removes the row.**                                                                               | Preserve the record in its known source state; show **“Couldn't archive this prospect. Try again.”** Only use failure language once nonacceptance is known. A failed read after accepted success does not undo the source transition.                                                            | D4 owner O4-07. High.                                                                                                    |
| **Medium — Restore fails or becomes unavailable.**                                                                               | Known nonacceptance: **“Couldn't restore this prospect. Try again.”** Unknown: **“Couldn't confirm whether this prospect was restored.”** If current access is lost, use the existing privacy-preserving unavailable state; do not offer unauthorized recovery or disclose the retention reason. | D4 owner O4-02/O4-04/O4-07. High.                                                                                        |
| **Medium — Repeated command or delayed Undo overwrites newer intent.**                                                           | Prevent accidental repeated activation, recover the same outcome, and keep each Undo tied to its record. Already archived/currently active results can be quiet factual states; never replay a stale archive over a later restore.                                                               | D4 owner O4-06. High boundary; no particular database representation selected.                                           |
| **Medium — Search silently changes scope or loses the user's place.**                                                            | Keep Active/Archived visible, retain the query on scope switch, show scope in no-results copy, and use a meaningful local update announcement where needed. No hidden automatic cross-scope expansion.                                                                                           | U2/U8; C1/C5/C6. Moderate layout recommendation.                                                                         |
| **Medium — Archive promises a complete permanent snapshot.**                                                                     | Describe absence from active work, not “saved forever.” Restore current lawful content only. Do not reset expiry, resurrect erased text or overwrite corrected contact facts.                                                                                                                    | D4 owner O4-04; no vendor retention policy adopted. High.                                                                |
| **Low to Medium — A routine cleanup action becomes bureaucracy.**                                                                | No mandatory reason, typed name, checkbox, approval, multi-page confirmation or completion checklist for the selected list-only transition. No bulk/automatic cleanup feature added by this recommendation.                                                                                      | Narrow selected scope plus reversibility; U7 limited corroboration. Moderate UX judgment.                                |

Do not produce an ordinary staff activity, bell notification or outbound message
merely because Archive/Restore occurred. This is not an added notification
choice. Required minimized source evidence retains the preparation's audience;
generic logs, reports and AI summaries must not bypass that boundary.

## Phone, keyboard and visual fit

Use the existing base-maia layout at both widths. On a phone, place the scope and
search before the list with enough room for long names and normal text wrapping.
Do not add an archive drawer solely to hide two scope options. A compact action
menu is reasonable if the trigger is obvious, named and reachable without hover.
Restore should be visible on the archived detail rather than buried only in an
overflow menu there.

Core's [touch guidance](../../../../ai/skills/emil-design-engineering/touch-accessibility.md)
sets a **44-pixel minimum touch target**; use the established shared control/touch
tokens and spacing. Distinguish that local design requirement from WCAG's AA
24-CSS-pixel rule and exceptions. Check nearby targets as well as target area.
Do not make a row tap trigger Archive; the primary row action opens its detail.

Preserve visible focus through menus, view changes and disappearing rows. Search
and action controls should remain usable when the on-screen keyboard reduces
the viewport. Feedback must not cover Restore or the focused control. Do not
require someone to dismiss the keyboard or an expired toast to recover a record.
Respect the shared reduced-motion baseline; no new archive animation or timing
scale is required. A calm state change is sufficient.

Use ordinary action styling for Archive and Restore, not a danger-red treatment
that falsely signals deletion. Use a descriptive noninteractive Archived badge
only where it helps identify state. Never rely on colour alone, and do not make
the badge secretly act as Restore. Preserve the existing source audience text
where the user needs to understand what staff can see.

## Proposed verification and user research

These are tests to run when the source and UI are implemented. No usability
session, accessibility audit, benchmark timing or task-success result is claimed
here. Include missionaries with varying CRM familiarity and people who use
keyboard/screen-reader navigation; do not invent participant counts, measured
preferences or a universal completion-time target.

| Scenario                                                                                                                                                                                    | What would establish success                                                                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ordinary cleanup on a phone:** “You are not pursuing this prospect now. Keep it out of your current work.”                                                                                | The user finds the action, expects archive rather than deletion/sharing, and completes it without a reason form or needless confirmation. They can explain where it went.                           |
| **Later return:** ignore/dismiss Undo, navigate away, reload, then find the prospect and resume.                                                                                            | Archived is discoverable in the existing workspace; the same authorized preparation restores without re-entry or new canonical identity. Success does not depend on seeing the original toast.      |
| **Scope comprehension:** search for a record, switch Active/Archived with the query present, try empty results.                                                                             | The user can state which scope is searched, retains the query, and does not infer deletion or a hidden record from a misleading empty state.                                                        |
| **Keyboard and screen reader:** archive/restore first, middle, last and only results; use Enter/Space and menus.                                                                            | No focus drops to body, no next-record accidental activation, one useful outcome announcement, and a logical route to later restoration. Automated checks supplement this manual pass.              |
| **Narrow viewport and text:** 320 CSS-pixel reflow where applicable, enlarged text/zoom, long names, on-screen keyboard, touch and reduced motion.                                          | Scope, search, result identity and restoration remain readable/reachable; focus is not obscured and feedback does not cover necessary controls.                                                     |
| **Network uncertainty and concurrency:** delayed response, known write failure, lost success response, repeated activation, two tabs, archive → restore → late archive retry, delayed Undo. | Displayed state follows known source truth; no duplicate source, wrong-record Undo, stale overwrite, accidental share or repeated outward effect.                                                   |
| **Privacy and lifecycle:** another worker's hidden preparation, revoked access, authorized direct link, partial erasure, independent task and already accepted share.                       | Neither lists, counts, search, feedback nor recovery reveal forbidden content. Current access governs restoration; independent facts/duties and accepted share retain their actual source outcomes. |
| **Repeat entry:** the user's permitted archived preparation, shared household contact methods, ambiguous matches and a protected canonical person.                                          | A visible existing preparation can be opened without automatic restore; no automatic merge/clone and no hidden-match disclosure.                                                                    |

Ask neutral comprehension questions during testing, such as where the user
expects to find an archived prospect and what Restore will change. Do not teach
the answer first or treat a polished visual mockup as evidence that access,
matching or recovery semantics work.

## What remains design or engineering work

The product behavior is selected. The evidence supports the minimal arrangement
above without requiring the founder to choose a database enum, menu component,
toast timer, filter implementation or focus fallback. Those are engineering and
interaction choices to qualify against current Core components and the exact
preparation owner.

Still unverified: the implemented archive/restore command and reached writers;
current list/search/detail authorization; lawful retention and partial-content
outcomes; concurrency with D2 sharing; same-operation recovery; actual phone,
screen-reader and keyboard behavior; and usability with missionaries. No
additional archive/delete policy, departure automation or post-share lifecycle
has been inferred to fill those gaps.

Related evidence: [D3 UX/data quality](../d3-evidence/ux-data-quality.md),
[D4 owner lifecycle](owner-lifecycle.md), and
[D2 communication/share UX](../d2-evidence/ux-research.md). This research note is
the only file changed by this workstream.
