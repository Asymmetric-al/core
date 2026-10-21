# D27 — returning missionary preparation: primary research and UX review

Research date: **October 17, 2026 UTC**. This note supports the founder's
selection of Q27 A: deliberate resumption of eligible own preparation after
returning to the same organization and ministry. It is research/design input,
not a formal specification, authorization contract or implemented feature.

## Evidence and confidence

Public primary documentation was freshly searched and directly opened for this
review. A current retrieval does not make an older article a recent product
release. Dates below are the page's stated dates; an undated page is not assigned
a guessed date. No authenticated competitor testing, missionary interview,
usability study, Core browser session, hosted database or runtime permission test
was performed. Maya's journey is an illustrative product judgment.

The evidence supports a bounded conclusion: fundraising and work-management
products distinguish retained history, current working lists and account access.
Some let people find and resume retained work. It does **not** establish that a
returning missionary automatically owns a continuing historical read right, that
all ministries need this workflow or that indefinite retention is appropriate.

## Directly read primary sources

All sources were retrieved on October 17, 2026. Claims are deliberately limited;
the Core consequence is reasoning, not a claim that the vendor implements Core's
permission boundary.

| ID         | Primary source and date                                                                                                                                                                                                           | Verified limited claim                                                                                                                                                                                                                                       | Application and conflict resolution                                                                                                                                                                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D27-UX-S01 | [MPDX — Deleting and Hiding Contacts](https://help.mpdx.org/article/152-deleting-and-hiding-contacts), updated **November 25, 2020**                                                                                              | Hidden contacts can be found through a status filter and deliberately moved to an active status. Its Hide action changes status to Never Ask; donation-system contacts cannot simply be deleted because synchronized data can recreate them.                 | Supports discoverability and deliberate return. **Do not import Hide → Never Ask:** D4 archive changes preparation working state, not consent, solicitation preference or canonical contact lifecycle. The old article is a relevant fundraising precedent, not proof of a modern measured usability advantage. |
| D27-UX-S02 | [TntConnect — Deleting Contacts](https://www.tntware.com/tntconnect/help/en/pages/contacts_deleting.aspx), **undated**; dated user comments do not date the article                                                               | The guide explains why earlier relationship context can help when a former contact becomes relevant again, and warns that deleting contacts can remove giving-history context. It advocates lifetime relationship retention and describes departure sharing. | Supports considering useful prior context before forcing re-entry. **Do not import** permanent retention, departure export/transfer, deletion semantics or unrestricted shared-history access. D3 expressly leaves retention source-owned and creates no new continuity reader.                                 |
| D27-UX-S03 | [HubSpot — Deactivate and remove users](https://knowledge.hubspot.com/user-management/remove-hubspot-users), updated **August 3, 2026**                                                                                           | Deactivation stops account access while retaining profile/data and historical activities; reactivation differs from removing and recreating a user. The article separately discusses owned assets and scheduling effects.                                    | Keep account access, original authorship, retained preparation and operational work distinct. **Do not import** restored prior access/seats, admin body access, asset reassignment or continued scheduling. Re-entry into Core still requires exact current authority.                                          |
| D27-UX-S04 | [Atlassian — Portal-only account revocation and deletion](https://support.atlassian.com/jira/kb/manage-portal-only-accounts-in-jsm-cloud-revoke-access-delete-impact/), updated **July 23, 2026**                                 | Revocation retains user references for later access; deletion followed by reinvitation produces a new unrelated account, even though the email may be reused.                                                                                                | Demonstrates why email similarity is not durable identity continuity. **Do not import** its deletion grace period, operator access or regrant policy. Core's canonical identity and assignment/source-history contracts govern.                                                                                 |
| D27-UX-S05 | [Givebutter — Archive or delete contacts](https://help.givebutter.com/en/articles/9150570-how-to-archive-or-delete-contacts), page says **updated over 2 weeks ago**; no exact publication date established                       | An Archived filter and deliberate Unarchive return contacts to the active list. Archived records are excluded from the vendor's duplicate detection and recipient lists. Deletion/re-upload does not recover previous preferences/history.                   | Supports an obvious retained-work route and clear deletion/return distinction. **Do not import** matching exclusion, communication side effects, mandatory reason collection, broad export or recreate-to-recover. Core must preserve existing identity resolution, suppression and the same preparation entry. |
| D27-UX-S06 | [Asana — Understanding projects](https://help.asana.com/s/article/understanding-projects?language=en_US), **undated**                                                                                                             | Archive focuses the active project list; unarchive is an explicit header/sidebar action. Archiving does not set the project's completion status, and assigned tasks can remain in My tasks. The guide promises non-expiring archived projects.               | Supports separating visibility/work-list state from completion and maintaining a persistent return action. **Do not import** indefinite retention, access from a project link, cross-workspace copying or its project permission model. A preparation read is not a task restart.                               |
| D27-UX-S07 | [W3C — WCAG 2.2, SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), current explanatory page; no separate publication date asserted                                                     | Visible action-result, waiting and error status messages need programmatically determinable semantics so assistive technology can announce them without focus changes. The guidance cautions against unnecessarily chatty live regions.                      | Make a successful return, retry state or error perceivable without relying on color/toast alone. Do not announce every list render or force focus into a success dialog.                                                                                                                                        |
| D27-UX-S08 | [W3C — WCAG 2.2, SC 3.3.7 Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), current explanatory page; no separate publication date asserted                                                     | Previously provided information required again within the **same process** should be available or populated, subject to essential, security and invalid-information exceptions.                                                                              | Preserve still-authorized input through retry and validation within the resumption flow. This criterion does **not** require indefinite retention or restoration across separate memberships; the broader convenience of reusing old preparation is a separate product judgment.                                |
| D27-UX-S09 | [W3C — WCAG 2.2, SC 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) and [SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), current explanatory pages | Reflow guidance includes a 320 CSS-pixel width for vertically scrolling content. Pointer targets have a 24 by 24 CSS-pixel minimum with documented exceptions, including spacing.                                                                            | Require the list, historical context, active/archive label and primary action to remain usable at narrow widths; use Core's shared touch controls. These are testable minimums, not proof that any proposed screen is beautiful or fully accessible.                                                            |

No DonorHub-specific restoration claim is needed: account/provider reconnection
is outside this bounded preparation decision. No new integration follows from
the research.

## Repository constraints verified for this review

- [D3 exact decision and reserved choices](../phase28-d3-adversarial-review.md:17)
  prohibit new continuity access, automatic sharing/transfer and indefinite
  retention promises. [D3-P10](../phase28-d3-adversarial-review.md:348) explicitly
  distinguishes current source/history rights from an old email, revoked grant
  or recreated assignment. D27 resolves the formerly open return direction; it
  does not repeal those boundaries.
- [D4 exact decision](../phase28-d4-adversarial-review.md:23) makes archive/return
  the same preparation's working-state transition. It changes no canonical
  contact, consent, task, gift or sharing state. Its small Active/Archived
  control and **Return to active prospects** action remain the ordinary recovery
  path. [D4's unselected choices](../phase28-d4-adversarial-review.md:58) include
  automatic archive, bulk archive and permanent retention.
- [D1-C03–C07](../phase28-d1-adversarial-review.md:376) require current authority
  before matching, discovery, snippets, counts, joins and other derivatives;
  identity similarity is not automatic matching, and preparation permission
  does not authorize outside channels. A helpful Earlier preparation banner
  must obey those same rules.
- [P12 assignment boundary](../../../../prds/sitestacker-parity/phase-12-full-role-permission-configuration.md:1712)
  binds grants to membership/assignment rather than bare person identity.
  [P9 history boundary](../../../../prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md:921)
  denies history access by assignment/linking alone. The source-owner review
  must admit D27's exact original-author/history use before the UX exposes it.
- [Frontend rulebook](../../../../ai/rules/frontend.md:14),
  [shared UI contract](../../../../../packages/ui/AGENTS.md:1) and
  [current components configuration](../../../../../packages/ui/components.json:3)
  require shared `@asym/ui`, exact `base-maia`, Base UI and semantic Maia/Zinc
  tokens. Existing shared Empty, Alert, Sheet, Skeleton and Sonner components
  provide presentation primitives; they do not establish the complete journey.
- The [accessibility review skill](../../../../ai/skills/accessibility-review/SKILL.md:1)
  and [testing rulebook](../../../../ai/rules/testing.md:20) require native/shared
  semantics, real keyboard/focus checks and bounded automated checks. They were
  read for this review; no conformance claim is made.
- The active [missionary roster safety change](../../../../../openspec/changes/fix-missionary-partner-roster-safety/specs/crm-core/spec.md:1)
  requires reachable loaded records, blocks hidden-identity edits and keeps
  narrow-screen controls usable. This is relevant intended behavior, not proof
  of a deployed D27 implementation or authority to use a donor roster as a
  private-preparation store.

This note does not recensus current runtime behavior. Earlier D3/D4 runtime
findings remain dated, scoped evidence. Reading design documents and component
configuration is not an application authorization test.

## Recommended whole journey

Use an ordinary continuation of known work, not an account-recovery product.
The organization/ministry context remains visible throughout. Staff manage
eligible access in the existing authorization surface; Maya decides which
available preparation to continue. Staff do not receive a private-content review
queue or a new reader role. No mandatory welcome wizard blocks ordinary work.

### 1. Arrive in the currently authorized workspace

Maya signs in and enters the current permitted organization and ministry. Normal
current work remains usable. When authorized retained results exist, show a quiet
link in the prospect area: **Earlier preparation**. An optional small inline
notice can say **Review preparation you saved earlier**; dismissal must not be
the only way to find it later. Do not toast private names on sign-in, advertise
an unauthorized hidden count or tell Maya that all old contacts are restored.

Offer only currently qualified results. A generic entry point may remain
available without a count if the feature itself is permitted; its empty state
must not distinguish forbidden records from absent records. The precise
placement is a design choice to test, not a new primary navigation module.

### 2. Find one useful entry without re-onboarding

Open a compact list scoped to this organization/ministry. Each visible row uses
the permitted identifying label, original preparation date or actual last
change date, and current **Active** or **Archived** working state. Search and
filters use the same current authority as the list; counts and paging describe
only permitted results. Keep free-text notes out of row previews by default.

The existing Active/Archived control is sufficient; do not create a parallel
set of recovery categories, risk scores or mandatory cleanup tasks. Preserve the
list position and filter when Maya opens an entry and returns. Long names and
non-Latin text wrap or truncate with an accessible way to read the full value;
do not force western first/last-name reconstruction.

### 3. Review in the ordinary preparation detail

Show the existing permitted preparation content with its real provenance and
working state. A concise contextual note says **Saved earlier — details may have
changed.** Show actual dates, using an unambiguous localized date and year; a
relative age alone is insufficient for older records. Opening or resuming must
not change **Last updated**, **Verified** or source-contact dates as if the
underlying facts were refreshed.

Show current independently authorized contact facts separately from historical
claims if both are available. Do not silently overwrite a current address or
consent state with earlier preparation. When a source correction or identity
resolution changes the relevant entry, route to the permitted current entry;
do not create a replacement person or infer a merge from the same email.

Make the primary action match the effect:

- A currently active, eligible earlier entry: **Continue preparation** opens
  its ordinary continuation/editing experience. This is deliberate use of the
  same entry, not a broad recovery operation or a new durable lifecycle category.
- An archived entry: show **Archived** and the existing **Return to active
  prospects** action if currently allowed. Reading it must not unarchive it.
  Do not require a redundant Resume confirmation followed by a second identical
  return confirmation. Permitted correction while archived follows D4/source
  rights; correction itself does not silently activate the entry.
- A historical entry whose body is readable but no longer editable: allow the
  qualified read and give a concise accurate explanation. Do not offer an inert
  Continue button or infer that every readable historical item is resumable.

Normal continuation needs no new purpose essay, per-field verification checklist,
staff approval per entry or obligatory contact/message. A required source access
decision is completed before this point; clicking Continue is not a consent form
that manufactures permission. Existing source-required validation still applies.

### 4. Continue once, with clear results

Maya corrects or adds context in the ordinary editor and saves through its source
boundary. Existing current facts remain authoritative. Preserve still-authorized
unsaved input on ordinary validation/network errors; do not repopulate content
after access has ended. A return action provides concise feedback such as
**Returned to active prospects** and leaves an enduring source state that can be
read again after a lost response. A read-only opening needs no success ceremony.

Completed/cancelled tasks remain complete/cancelled; reminders, coaching shares,
newsletters, subscriptions and connected sending remain under their independent
current contracts. The contextual explanation can say **Continuing preparation
does not restart messages or shared access** where that consequence is relevant.
Do not invent a bulk action to reconnect everything or a dashboard of unrelated
integration settings.

### 5. Leave and return without losing orientation

The same source entry remains in its actual active/archive state. Maya can return
through ordinary preparation navigation; she does not have to repeat the arrival
notice or an approval step. An already resumed item resolves to that existing
entry. A second tab/retry cannot create a second prospect or replay the original
state change over a later edit. A qualified ordinary archive action remains
available where D4 permits it; it is not a special Undo for all prior history.

## Honest states and copy

These are behavior/copy directions, not prescribed pixel layouts. Show a more
specific reason only when the current viewer is entitled to know it.

| State                                                               | User-facing behavior                                                                                                                               | Boundary                                                                                                                                                     |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Permitted result set is empty                                       | **No earlier preparation is available here.** Keep ordinary current work reachable.                                                                | Do not say all old work was deleted, retained or belongs to another person. Never show protected withheld counts.                                            |
| Feature currently unavailable by an explainable organization policy | **Earlier preparation is not available in this workspace.** An existing eligible help route may be offered.                                        | No new approval queue, promise that staff can see/recover it or per-entry metadata in a help message.                                                        |
| Known allowed entry is archived                                     | **Archived** plus **Return to active prospects** when allowed.                                                                                     | Do not call archive a deleted contact, Never Ask, inactive donor or completed task.                                                                          |
| Old claims are visible                                              | **Saved earlier — details may have changed.** Display original/corrected source dates truthfully.                                                  | No blanket required re-verification, guessed current facts or reset verification date.                                                                       |
| Source changed during editing                                       | Explain **This preparation changed. Review the latest version before saving.** Preserve only still-permitted input while reconciling.              | Do not silently overwrite a later correction or permanently duplicate the entry.                                                                             |
| Response lost after a mutation                                      | Show **Checking whether your change was saved…**, then recover the actual permitted result.                                                        | Do not say failed if the accepted outcome is unknown; retry must not duplicate or replay outward effects.                                                    |
| Connection absent before permission-sensitive operation             | Keep the shell/orientation; **Reconnect to continue**. Current access must be rechecked.                                                           | Do not promise offline history access, cache private payloads indefinitely or claim success before acceptance.                                               |
| Access ends, membership changes or policy narrows                   | Withdraw now-forbidden content and controls; show neutral **This preparation is no longer available here.** Keep a safe path back to current work. | No stale snippets, cached titles or protected reasons in notification, browser history state or error reports; no promise to erase information already seen. |
| Retained metadata but body removed                                  | Give only the lawful admitted receipt/history explanation, if one exists; no continuation control.                                                 | Retention of minimal evidence does not imply a readable/restorable body. Do not offer backup recovery.                                                       |
| Identity continuity cannot be established                           | No earlier-content preview. Use ordinary authorized account/identity help without content-bearing payloads.                                        | Same email, display name or staff assertion alone does not establish original authorship or historical authority.                                            |
| Same person works in multiple ministries or organizations           | Keep explicit current context and separately authorized list/results; context switch clears obsolete selection.                                    | No combined earlier-preparation portfolio or inferred cross-ministry transfer.                                                                               |

Avoid absolute privacy copy such as **Only you can ever see this**, **saved
forever**, **restore everything** or **no one can access old work**. Use precise
audience statements from the actual qualified projection, such as **Not shared
with a coach**, only when true; that statement is not a promise of absolute
secrecy. Source-owned lawful retention and permitted operational access remain
accurately described in the appropriate policy/help, not repeated in a modal.

## Visual, accessibility and field conditions

Compose existing Maia components: one calm page title, a concise context line,
small state control, readable list and familiar detail/editor. Give the current
action visual priority; secondary archive and back navigation remain discoverable.
Use spacing and typographic hierarchy instead of several colored badges or a
celebration for restored contacts. No new theme, primitive library, card carousel
or app-local variant is justified.

- Keyboard users can search, filter, open, continue/return and navigate back.
  Explicit labels distinguish row navigation from the return mutation. Shared
  sheet/dialog focus returns to the invoking row or a sensible surviving list
  location; filtered-out rows do not leave focus on the document body.
- Status and error feedback is available in text and through appropriate status
  semantics, not color, timed toast or pointer hover alone. Do not announce an
  entire private note into a live region or repeat list-result announcements on
  every render.
- At 320 CSS pixels, use a stacked list/detail arrangement with wrapping labels,
  reachable controls and no essential sideways scrolling. Honor Core target
  tokens and at least the applicable WCAG minimum/exception conditions. Verify
  zoom, screen-reader reading order and focus manually alongside automated tests.
- Display unambiguous localized dates. If a timestamp needs a zone, use the
  permitted user's display convention without implying that a city timezone is
  the missionary's current location. No new home-location collection is needed.
- A bounded initial list and authorized incremental loading support slow
  connections. Loading is distinct from empty results; filters apply to the
  eligible server result, not only the first loaded page. Do not make a whole
  history download a prerequisite for ordinary current work.
- Draft preservation must obey current authority. This decision does not add an
  offline private-data store, automatic export, remembered content across tenant
  changes or a guarantee that previously viewed data can be recalled.

## Alternatives and proportionality

**Strongest alternative B:** leave old private preparation unavailable through a
new resumption workflow in this release, while ordinary authorized CRM/current
source use remains available. B avoids a new historical admission path and is
reasonable if original-author/history qualification cannot be implemented. Its
cost is avoidable re-entry and possible loss of useful context; recreating contact
records is not an acceptable substitute. The founder selected A, so solve its
bounded source admission and reuse the normal preparation UI.

**Simplest implementation direction within A:** a qualified Earlier preparation
query and an ordinary same-entry continuation/return action. A new recovery
application, retention editor, bulk restore, per-entry approval queue, import
pipeline, copy-to-new-membership operation or generic permission builder is not
required. The source implementation may need durable admission evidence; that
does not require exposing a second workflow to Maya or relabeling content as a
newly authored record.

**Rejected shortcut:** automatically insert every retained item into the active
list upon return. That ignores deliberate selection, defeats the existing archive
state and makes old contact assertions look current. A quiet discovery route
achieves useful continuity with fewer accidental consequences.

## Material UX concerns and exact amendments

Severity is impact if the mistake occurs; likelihood is conditional reasoning,
not an observed incident rate. Each item changes or narrows A's expression, not
its central product choice.

| Concern                                                                                | Severity / likelihood                               | Evidence and consequence                                                                                                                                         | Exact recommended requirement and proof                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UX-R01: Resumption looks like permission restoration                                   | High / plausible                                    | D3-P10, P12 and S03/S04 separate retained work from current access. A banner, count or old URL can reveal forbidden history before the user makes a choice.      | **Every earlier-preparation result and action SHALL require current original-author/source/history qualification before discovery; user selection SHALL NOT confer authority.** Prove same-email/new-assignment, revoked access, cross-context cache and forbidden-count cases.                                           |
| UX-R02: Resume also unarchives, completes or restarts other work                       | High / plausible                                    | D4 and S01/S06 show why work-list status must be separated from business/communication status. Accidental sends or misleading active tasks harm trust.           | **Continuing preparation SHALL preserve the same source and current working state; archived entries SHALL require the ordinary deliberate return action; no independent work, communication or grant SHALL restart.** Prove archived read, completed task, withdrawn share and disconnected provider remain unchanged.    |
| UX-R03: Old information appears freshly verified or overwrites current facts           | High / likely without explicit dates                | Long absence creates realistic staleness; S02 supports value of history but not accuracy today. Historical claims can misdirect outreach or reverse suppression. | **Resumption SHALL preserve provenance and display historical context without resetting verification/source-change dates or replacing current canonical facts.** Prove current corrected contact facts, suppression, old notes and different identity links are not overwritten.                                          |
| UX-R04: Recreating or matching old contacts creates duplicates or leaks hidden matches | High / plausible                                    | D1/D4 govern identity; S05 documents a competing product's archive matching exclusion. Copy-to-restore loses evidence and preferences.                           | **Resumption SHALL continue the retained source entry and use existing authorized identity resolution; it SHALL NOT create a replacement Party or disclose inaccessible matches.** Prove one source identity, shared email and hidden canonical match.                                                                    |
| UX-R05: Recovery ceremony and unclear labels undermine the simple journey              | Medium / likely if modeled as full account recovery | The chosen task is continuing preparation, while S03/S04 deal with broader account lifecycle. Importing their admin workflow would add unrelated steps.          | **Provide persistent discovery and one meaningful continuation/return action; do not require a welcome wizard, reason form or per-entry access approval after current authority is established.** Observe users explain the effect and complete it without moderator correction.                                          |
| UX-R06: False success or destructive stale retry                                       | High / plausible on poor networks                   | A successful write can lose its response; parallel edits and revocation can invalidate local state. D1/D4 already govern durable acceptance.                     | **The UI SHALL distinguish pending, unknown, accepted and rejected outcomes, recover the current permitted result and reconcile source conflicts without repeating the business effect.** Prove lost response, duplicate click, later correction and access-ending cases.                                                 |
| UX-R07: Privacy and recovery copy promises more than the source can deliver            | High / plausible                                    | S02/S06 promise long retention, but D3/D4 do not; retained audit evidence may outlive readable content.                                                          | **Copy SHALL describe the actual permitted audience and current availability without promising permanent storage, absolute secrecy, deletion or recall.** Prove the empty/unavailable/restricted/body-purged copy does not reveal forbidden existence.                                                                    |
| UX-R08: Inaccessible or page-limited discovery creates false absence                   | Medium / plausible                                  | S07/S09 and the active roster change require reachable controls/results; client-only first-page filters miss retained work.                                      | **Eligible results SHALL remain reachable across authorized paging; loading, empty and failure states SHALL be distinct, with keyboard/focus, status-message and narrow-screen behavior verified.** Prove a result beyond the initial page, zero matches, last-row removal, long names, keyboard and screen-reader flows. |

## Evidence still needed before release

The source-owner and authorization review must prove that A admits the exact
current historical use without restoring ended grants, broadening staff/coach
access or inventing identity continuity. This note provides no database proof.

Representative returning missionaries should be able to explain what stays
archived, which information is historical and whether any message was sent;
staff should understand they receive no new body access. Treat an observed
misunderstanding that would disclose information, restart outreach or overwrite
current facts as a release-blocking design defect. Product/design owns the
comprehension review; engineering/QA owns actual state, authority, concurrency
and accessibility proofs. This is a proposed qualitative acceptance gate, not
an invented survey result or a requirement to instrument private reading.

No unsupported numerical performance or adoption claim is made. Performance
budgets and representative retained-data fixtures must be established by the
implementation owner; do not substitute a universal fixed archive limit or an
unbounded all-history load. Ordinary operational error signals should retain
minimal actor/context/outcome evidence and exclude private content.

## Disposition for the parent synthesis

**Accept with required amendments.** Preserve deliberate same-entry resumption,
current historical admission, original provenance, existing archive semantics
and independent operational state. Use the ordinary preparation surface and a
small Earlier preparation entry point. Do not add recovery ceremony, automatic
bulk return, duplicate contacts or new staff readers. These requirements make A
coherent without importing a vendor's conflicting permissions or retention.
