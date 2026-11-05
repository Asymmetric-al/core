# Phase 29 Q43 — Who may make ordinary file views available to colleagues?

2026-10-25, Asia/Bangkok. Q01–Q42 and all 26 glossary definitions are ratified.
**Q43 is unselected.** This is independent research for one next product choice,
not an ADR, formal owner/OpenSpec publication, implementation or activation.
Only this assigned note is authored; no accounts, providers, private documents
or real messages are touched.

## Recommended question and meaningful alternatives

For shared saved views of ordinary request files, should **ordinary staff who
may author views for this source be able to make their own eligible views
available directly to a permitted staff audience (A, recommended)**, or should
**only separately designated view managers publish shared views (B)**?

Personal views remain available under both options. Shared views are already
required; “do not build shared views” is not a faithful third option. The choice
is the additional manager-designation gate, not whether current source/P12
permission is required, whether every file reader may publish, or whether
publishing makes private results accessible.

| Option                                                                      | Concrete behavior                                                                                                                                                                                                                                                                                           | Strength                                                                                                                      | Real cost                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Qualified staff authors share their own views directly; recommended** | Ordinary staff with this source's view-authoring authority can deliberately make their own eligible definition available to an explicitly permitted staff audience. No separate view-manager designation is needed for that ordinary act. Current definition, audience and source restrictions still apply. | The person doing the work can give colleagues a useful reusable filter without a separate handoff. Personal use stays simple. | More authors can create overlapping or unclear shared views. Ownership, clear naming, controlled shared edits and supported cleanup matter. It is not permission for every reader to publish or alter someone else's view. |
| **B — Designated managers publish shared views**                            | Ordinary authors retain personal views. Only staff separately designated to manage shared views can publish/maintain shared definitions, within the same source/audience safety limits.                                                                                                                     | A smaller publishing group can curate naming, consistency, overlapping views and changes affecting colleagues.                | A useful personal view needs an additional human handoff before becoming shared, and availability depends on the manager cohort. This need not mean every publication requires another approver or a new approval queue.   |

**Recommend A.** The shared object is a bounded live-query definition over
already admitted metadata, with each reader's result authority unchanged. Let
qualified staff authors share their own eligible work directly; retain real
source-qualified administration for correction and continuity. A dedicated
manager cohort is not necessary solely to execute those current permission checks.

**B is a credible long-term operating model**, not a bad practice. It is stronger
where a consistently curated set of shared views matters more than direct author
publication. It can reduce duplicate definitions and competing terminology.
It does not itself make a sensitive title/filter safe or ensure every viewer
receives the same rows. Those checks are mandatory under either option.

This recommendation is product judgment, not evidence of observed Asym demand,
manager bottlenecks, time savings or better conversion. Neither alternative
introduces a general publishing platform, a new user role taxonomy or two
per-tenant product modes by implication.

## Illustrative staff journey

Elena has a personal **Equipment** view of ordinary request files, based on a
permitted label and useful columns. She wants an authorized colleague, Sam, to
reuse that way of finding work. This is an illustration, not an observed ministry
workflow or an assertion that labels are a complete review queue.

Under **A**, Elena deliberately chooses the permitted staff audience for her
eligible view and makes it available. The UI shows the view's scope, intended
audience and who can maintain the shared definition. Sam opens the same view
definition but sees only the entries and fields he is currently allowed to see.
His result count can legitimately differ from Elena's.

Under **B**, Elena keeps using her personal view. A designated view manager
creates or adopts an eligible equivalent through an authorized definition path
and publishes it. This describes the human handoff, not an automatic right for
the manager to inspect every private view or a newly selected in-app request
workflow. Sam's result restrictions remain exactly the same as under A.

Both options retain independently qualified ad-hoc filtered/query-context URLs.
A colleague can reopen such a permitted query under their current source rights
without publishing a reusable shared-library definition or gaining access to the
author's private saved-view record. A link that actually references a saved
definition additionally requires current access to that definition. Neither URL
form carries the author's data rights or permits sensitive query material in an
unqualified carrier.

Changing temporary filters while using a shared view should not silently change
everyone's saved definition. A deliberate shared-definition save requires the
actual maintenance authority. Where qualified, **Save a personal copy** gives
Sam his own version without overwriting Elena's view. Publishing a view does
not move files, assign tasks, approve evidence, send email, share document bytes
or set colleagues' default view automatically.

## Frontier check against the ratified scope

| Frontier considered             | What remains meaningful                                                                                               | Why Q43 should come first                                                                                                                                                                                  |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared-view publisher authority | Direct publication by qualified ordinary view authors versus separately designated managers                           | Q42 explicitly supplies private ordinary views while preserving the required shared-view outcome for owner-qualified audience work. This is the next real collaboration boundary of that concrete feature. |
| Bulk delivery shape             | Bounded ZIP/individual delivery/other source-qualified package semantics, exact selection and partial-result behavior | Important, but generic bulk handling already exists as a requirement. A new output/custody contract should be chosen for an actual delivery task, not inferred from view publication.                      |
| Exact-version review comments   | Where eligible staff observations live and how source review history is preserved without another conversation system | Potentially substantial, but generic comments and Q30 participant clarification already have boundaries. It needs its own exact source/actor/comment purpose. Nothing in Q43 settles or duplicates it.     |

Q43 is not a routine follow-on notification-default question. No new notice,
email distribution, review inbox or digest is included.

## Existing owner constraints read

The complete Q42 decision and its shared-view boundary were read in the current
workflow. A fresh direct read of P9 A14 and B11 in
`docs/prds/sitestacker-parity/phase-09-full-crm-depth-relationship-graph.md`
confirms: saved views are live-query definitions, private visibility is the
current contract, team/everyone is reserved, and membership lists are a distinct
future entity. The owner reviewer independently confirmed that no ordinary
shared-publisher authority has already been selected.

- The scope remains the same Tenant/environment and ordinary request-source
  evidence cohort. This does not activate shared views for every CRM, CMS,
  financial, Support or Media surface.
- Q38 governs approved metadata/source-context discovery, not a general body-text
  corpus. Current field/use authorization applies before every result, count,
  facet, ordering contribution and serialized output.
- Q42's one-home filing, optional labels, independent correction uses, invalid
  saved-criterion handling and private initial views remain intact. A shared
  definition is another authorized discovery route, not another folder placement.
- P12 remains the sole permission owner. View authoring, sharing a definition,
  changing another person's shared definition, using that definition and reading
  or exporting its results are distinct capabilities.
- Ordinary already-qualified publication does not automatically need a second
  human approval. Existing approvals for actual policy/projection widening still
  apply when that different action is performed; this question cannot bypass them.
- Existing URL/reference mechanics do not make arbitrary confidential filters
  safe to copy into a URL. A copied link remains a protected reference; it must
  neither grant access nor serialize disallowed title/predicate values into
  browser history, referrers, logs or unapproved channels.

This is source-grounded grooming. Adjacent named-view code is not proof that the
ordinary shared source, audience selector or publisher/maintenance path is built.

## Fresh primary comparisons

All sources below were read through official pages on **2026-10-25**. Displayed
dates are recorded where reliable. Vendor roles, default sharing, permission
propagation, lists and governance are not Core authority. No tenant was tested.

| Primary source                                                                                                                                                                                                                                                                                   | What is actually documented                                                                                                                                                                                                                         | Relevance and limits                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Raiser's Edge NXT: Share a List](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-share-list.html), no article date                                                                                                                                      | A saved list can be shared by reference link; the recipient may see different records/details because their security rights differ. Security settings control access.                                                                               | Direct nonprofit CRM precedent for a reusable view plus per-reader result rights. This does not authorize Core to send messages, copy sensitive criteria or import list membership/static snapshots.                                                                                                                                          |
| [RE NXT: Save a List or Edit Its Details](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-save-list.html) and [List Rights](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-lists-rights.html), no article dates | Separates personal access, others viewing and others managing; management still depends on list rights. Role permissions separately govern query editing/export. A shared query edit affects colleagues, and save conflicts have explicit handling. | Strong evidence that viewing and maintaining differ and that a reference is not a shared permission snapshot. Exclude its static/query-list alternatives, fundraiser workflows, supervisor powers and documented security-propagation delay from Core's new contract.                                                                         |
| [Blackbaud Education Management lists](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/education/teachers/content/bb-core-lists.html), no article date                                                                                                                                | Creator-owned SKY lists can separate view/copy from edit; roles govern available list types. The page explicitly keeps medical lists from platform managers lacking the relevant specialized role.                                                  | A separate education product, not a synonym for RE NXT or Grantmaking. Useful support for source-specific authority stronger than rank. Do not import its legacy SQL lists or its broad orphan-list deletion rule.                                                                                                                            |
| [Power Apps: Create and manage personal views](https://learn.microsoft.com/en-us/power-apps/user/grid-filters-advanced), updated 25 August 2026                                                                                                                                                  | Personal views can be shared when the user has Share permission. Write, Assign and Delete are separately described. Hiding a shared view can affect only the current user; deleting/deactivating it affects everyone with access.                   | Strong A-compatible author-sharing pattern and concrete maintenance distinctions. Some features depend on modern advanced find being enabled. Its same-name Save-as overwrite warning is a Core footgun to avoid, not behavior to copy.                                                                                                       |
| [HubSpot: Create and manage saved views](https://knowledge.hubspot.com/records/create-and-manage-saved-views), current retrieved page family                                                                                                                                                     | Documents a private-to-profile-and-Super-Admins starting state, Team/Everyone/Custom sharing, explicit Publish, and user-local filter changes distinct from root configuration. A copied view link is for users who already have access.            | Shows a practical shared-definition/local-use distinction. Our clean-URL fetch displayed 4 September 2026; root also saw a 19 October query variant. The older May search/region copy has different text. Do **not** claim its old creator/Super-Admin editing rule is universally current, or infer exact account rollout from banner dates. |
| [Salesforce: Standard-user list views](https://help.salesforce.com/s/articleView?id=000387562&language=en_US&type=1), published 14 June 2026; [Editing list-view permissions](https://help.salesforce.com/s/articleView?id=000393179&language=en_US&type=1), published 12 October 2026           | Standard User lacks Manage Public List Views and creates private lists; the guidance distinguishes that permission from Create and Customize List Views and explains granting it through profiles/permission sets.                                  | Strong B counterevidence: public/shared publication can reasonably be a separately designated responsibility. Do not equate a Salesforce permission with every Core manager or import broad visibility privileges.                                                                                                                            |
| [SharePoint: Create, change or delete a view](https://support.microsoft.com/en-us/sharepoint/lists/data-and-lists/create-change-or-delete-a-view-of-a-list-or-library), multi-edition guide                                                                                                      | The described personal/public model requires Member/equivalent authority for personal views and Designer/equivalent for public views. Public modification/deletion and defaults have separate rules.                                                | Document-library precedent for B's governance. The page mixes edition/classic instructions; do not claim all modern configurations match, adopt its public audience or copy its personal/public conversion limitations.                                                                                                                       |

The direct RE NXT pages are a better substantive comparison than Blackbaud's
administrative **User Lists** page, which also supports saved filters and security
settings but is specifically Control panel user management. That administrative
page was read as a fallback; it is not evidence that every Grantmaking staff
member can publish document views. Blackbaud product families are kept distinct.

The modern evidence supports **both** distributed author publication and a
separately managed shared catalog. It does not support “everyone can edit
everything,” automatic data access from a view, identical counts for all readers,
or an industry-wide best default.

## Common boundaries and simple user experience

1. **Make the population distinction explicit.** A covers ordinary authorized
   view authors publishing their own eligible definitions without separate
   manager designation. B requires that additional designation. Neither includes
   all document readers, review assignees, participants or staff by rank alone.
2. **Keep personal work personal until deliberate publication.** A new personal
   view remains private under Q42. Show actual audience and consequence before
   the single meaningful Share view/publish action. Do not preselect everyone,
   silently widen on save or add another routine approver.
3. **A definition itself can be confidential.** Its name, description, selected
   columns, filter values, referenced folders/labels, source associations and
   audience metadata need current disclosure authority. Result filtering alone
   does not make a sensitive definition safe. An ineligible publication preserves
   lawful personal work; do not silently strip a predicate and widen the query.
4. **Execute under each viewer's current rights.** Share the qualified live
   query/presentation, not a frozen result or creator permission. Results, counts,
   facets and later actions can differ by viewer and time. Publishing never adds
   Read, Download, Export, Q41 share or source-action authority.
5. **Use only real permitted staff audiences.** Reuse the actual source/P12
   audience capability after explicit adoption. This decision does not build a
   team directory, arbitrary address list, custom audience-rule designer or
   cross-tenant/global visibility engine. External and request-only contexts
   remain excluded from this ordinary staff feature.
6. **Separate using, copying and maintaining.** Temporary filter/column changes
   must not overwrite the shared definition implicitly. Clearly distinguish
   Save personal copy from Save shared changes where those actions qualify.
   View names do not identify the record to overwrite. Publication does not
   automatically make every viewer an editor or change their route default.
7. **Acknowledge shared consequences once.** A deliberate saved-definition or
   audience change can affect colleagues; show the relevant scope in that same
   edit flow. Keep the published definition intact until an authorized change
   succeeds. Current-state conflicts preserve lawful edits instead of silently
   overwriting another maintainer's changes. No separate approval workflow follows.
8. **Distinguish personal hiding from stopping shared use.** A user hiding or
   unpinning a view is not deletion for everyone. Unsharing/removal changes view
   availability, not evidence or source records. Bookmarked references to an
   unavailable definition have a safe current result and useful source route,
   without revealing private names/criteria.
9. **Have a real maintenance path.** The selected model needs a named current
   maintainer and source-qualified administration for departure, lost authority,
   correction or retirement. Do not assume administrator rank permits private
   definition inspection or create a broad data grant merely to fix a view.
   Exact transfer/departure rules belong in the selected-answer amendments.
10. **Preserve Q42 invalid-view behavior.** Deleted/unauthorized fields, folders
    or labels do not silently disappear from predicates. Unknown authority is
    not complete zero. Show safe repair/unavailable handling and keep current
    source navigation usable. Optional labels remain distinct from review status.
11. **Avoid noise and catalog overreach.** Publishing makes a view available;
    no email, mention, task, digest, subscription, ranking algorithm or forced
    pin/default follows. Helpful naming, visible maintainers and personal
    selection/hiding can keep the catalog useful without another platform.
12. **Accessible, bounded and recoverable.** Use the existing shared UI with
    clear Private/Shared audience text, keyboard/non-drag pointer controls,
    safe long/RTL names, responsive layout, status/focus and preserved input.
    Current permission gates late responses, saved links and all APIs. A lost
    response must reconcile the original publish/update result before another
    effect; no native capability or capacity is claimed by this research.

## Thirty-two affected journeys

| #   | Situation                                               | Required outcome under either selected model                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Elena creates a useful personal view                    | Private usable definition remains available without publishing or filing work.                                                                                                                                                                                    |
| 2   | Ordinary eligible author wants to share her own view    | A permits direct qualified publication; B requires designated manager publication. The difference is real and visible.                                                                                                                                            |
| 3   | Staff can read files but cannot author views            | No inferred author/publisher capability from data Read.                                                                                                                                                                                                           |
| 4   | Designated manager publishes under B                    | Real source/definition/audience authority still applies; designation is not a privacy override.                                                                                                                                                                   |
| 5   | User selects staff audience                             | Show only actually eligible destinations and permitted audience detail; no arbitrary email or all-staff expansion.                                                                                                                                                |
| 6   | Personal definition contains a protected name/filter    | Reject or require deliberate permitted repair for publication, preserving lawful personal work; no silent predicate removal.                                                                                                                                      |
| 7   | Sam opens the shared Equipment view                     | Same qualified definition, his own currently allowed rows/fields/counts. No promise of Elena's result set.                                                                                                                                                        |
| 8   | Sam has fewer source rights than Elena                  | Safe current results or unavailable definition as appropriate; no broader record access or leaked predicate values.                                                                                                                                               |
| 9   | Source record permissions change                        | Recheck results and definition safety; stale cached counts/metadata do not remain exposed.                                                                                                                                                                        |
| 10  | Member enters/leaves the permitted audience             | Definition availability follows the actual audience contract, without granting or revoking unrelated evidence rights.                                                                                                                                             |
| 11  | Reader changes temporary filters                        | Clearly local/unsaved use; no silent overwrite of the shared definition.                                                                                                                                                                                          |
| 12  | Reader wants a lasting variation                        | Qualified personal copy/new personal view, not editing the original by name.                                                                                                                                                                                      |
| 13  | Publisher edits shared criteria                         | Current maintenance and disclosure checks; deliberate save with shared consequence clear.                                                                                                                                                                         |
| 14  | Publisher broadens the audience                         | Treat as an explicit current disclosure change, not a harmless rename or inherited default.                                                                                                                                                                       |
| 15  | Two maintainers save concurrently                       | Preserve original/current definition and resolve stale intent; no invisible last-write overwrite.                                                                                                                                                                 |
| 16  | Response lost after publication                         | Reconcile one original effect; no duplicate view, widened audience or repeated notification.                                                                                                                                                                      |
| 17  | Publisher loses source/publish authority                | No further unauthorized edits/publication; supported current stewardship handles the shared definition under declared rules.                                                                                                                                      |
| 18  | Publisher leaves the organization                       | Real owner-qualified transfer/retirement path; no requirement to retain their login or impersonate them.                                                                                                                                                          |
| 19  | User hides/unpins a shared view                         | Only personal navigation changes; colleagues and evidence are unaffected.                                                                                                                                                                                         |
| 20  | Qualified maintainer stops sharing/removes a view       | View availability changes; evidence and ordinary source access remain intact.                                                                                                                                                                                     |
| 21  | Ad-hoc query link or old saved-view bookmark            | An independently qualified query context uses current source/query rights without private-view ownership access; a saved-definition link also needs definition authority. Unavailable definitions disclose no private detail and are not recreated automatically. |
| 22  | Shared criterion is deleted/unauthorized                | Q42's repairable invalid-view handling; no silent broadening or fabricated complete zero.                                                                                                                                                                         |
| 23  | Filter uses an optional label after correction          | No claim of a complete review queue; Q42's new correction has no copied label and source work remains discoverable independently.                                                                                                                                 |
| 24  | User chooses Download/Export/Share from results         | Separate current action, exact selection and source authority; view publication supplies none.                                                                                                                                                                    |
| 25  | Narrow source use has equal bytes elsewhere             | No union of other-use metadata or permission; same Q38/Q42 scope remains.                                                                                                                                                                                         |
| 26  | Participant/Q41 external reader gets a copied view link | No ordinary staff view, metadata, folder tree or widened private share access.                                                                                                                                                                                    |
| 27  | Tenant/environment/actor switches while loading         | Fence obsolete definition/results and reauthorize; no wrong-context flash.                                                                                                                                                                                        |
| 28  | Admin diagnoses or repairs view ownership               | Minimum currently permitted definition/operation facts and supported maintenance, no broad body-read grant or SQL-only routine fix.                                                                                                                               |
| 29  | Mobile/low bandwidth or long audience list              | Bounded search/selection, visible audience and recoverable intent; no exhaustive directory loading.                                                                                                                                                               |
| 30  | Keyboard/AT/voice/non-drag pointer user                 | Operable audience controls, clear labels/status/focus, no drag-only ordering or hover-only permission explanation.                                                                                                                                                |
| 31  | Long/RTL/IME names and similar view titles              | Preserve safe text and stable identity; distinguish actual owner/scope without exposing hidden people or overwriting a same-named view.                                                                                                                           |
| 32  | Old client, restored view or unsupported audience value | No activation of reserved broad visibility, inferred grants or silent policy widening; supported source-owner migration and current authorization remain necessary.                                                                                               |

## Proof direction for the selected answer

The later full adversarial review should make the selected author/manager model
and its exact audience/maintenance rules concrete, then require at least:

1. A meaningful positive/negative publisher-capability test separating ordinary
   authors from record readers and, for B, undesignated authors from managers.
2. Current definition/name/predicate/audience safety, separately from each
   viewer's result and subsequent action authority; same-tenant/source only.
3. Clear personal versus shared editing, copy identity, no name-based overwrite,
   current-state conflicts and exact original-result recovery.
4. Actual permitted audience changes, membership changes, source revocation,
   owner departure, unsharing/removal and stale-link behavior.
5. Q42 invalid-criterion handling and Q38 scope/privacy, including titles,
   counts, ranking, caches, URL state, logs and forbidden predicate leakage.
6. No evidence/folder/review/source-action changes, forced defaults or unsolicited
   outward messages from publishing a definition.
7. Complete keyboard/mobile/AT/localized/slow-network journeys with a real
   source-qualified administration path and finite query/catalog/audience limits.
8. Canonical source/P9/P12 adoption and actual native role/API/database/restore
   proof before activation. Reserved enums and adjacent private-view code are
   not implementation evidence.

Q43 should choose the publisher population now, then adversarially resolve those
details as exact amendments. It should not bundle another notice policy, a new
membership/list product, unlimited shared editing, a team-directory rewrite or
a general approval process into this one decision.

## Status

Research recommends **A**, with the common source/privacy boundaries above.
**B** remains a strong choice for deliberate central curation. No user answer
is inferred, and no Q43 ADR or glossary term is written. The complete root
question will receive an independent whole-file review when ready, followed
by an actual finding/closure append to this note after reconciliation.

## Final independent whole-question review

2026-10-25, Asia/Bangkok. Read the **entire**
[Q43 question](phase29-q43-question.md): status, single decision, A/B table,
recommendation, example, scope, primary evidence, seven governing boundaries,
alternative frontiers, all fourteen composed journeys, current-code/freshness
limitations and Q42 ratification status. Read the complete corrected question
again after root's reconciliation. This is actual whole-file review, not
approval inferred from an early recommendation.

**No unresolved material issue remains for question readiness.** The author
population difference is explicit: A includes publication of an eligible owned
definition within the normally granted ordinary view-authoring scope, with no
separate manager designation; B requires that designation. Both preserve actual
source/P12 powers, private initial use, deliberate audience choice and the
stronger approval gates that apply to actual permission/policy expansion.
The question does not grant file readers publication, all viewers editing,
tenant-wide Everyone visibility, public-web access or a new notification.

One material distinction was raised and fixed. The direct-link journey now
applies current source/query permission to an independently qualified ad-hoc
query context, without requiring access to the author's private saved-view
record. Only a link that actually references a saved definition additionally
requires that definition's permission. Neither type publishes a reusable shared
view. This preserves P9's existing filtered-link outcome under A **and** B and
avoids making manager-only publication appear to forbid ordinary safe query reuse.
The example and journey 21 above now retain that distinction too.

The primary claims match the documents read. The direct RE NXT Share/Save/Rights
pages substantiate definition reuse, separate maintenance and viewer-dependent
results; their static/membership alternatives are not imported. Salesforce is
real counterevidence for separate manager designation, rather than a deprecated
workaround. Power Apps separates view powers and personal hiding from deletion.
The HubSpot claim uses stable verified behavior and openly notes retrieval-date
variation; no older creator/admin edit rule is asserted as universally current.
SharePoint and Blackbaud Education remain edition/product-qualified comparisons.

The root's Unfiled example and this note's Equipment example are both explicitly
illustrative and preserve Q42. Neither is a new authoritative review queue or
evidence of observed ministry practice. A's recommendation and B's curation
advantage are judgments, not measured staffing, productivity or cost facts.

Current-code and ratification-census statements remain attributed to the
root/owner/runtime checks. This researcher did not repeat their complete live
tree/capability census or preservation run. The question correctly distinguishes
prepared capability code, personal gift-history settings and domain-specific
teams from an implemented ordinary shared-view publisher/audience. No native
runtime qualification is inferred from any of those adjacent facts.

### All thirty-two detailed journeys mapped

Root rows are identified by their displayed subject, with governing boundaries
where a condition spans rows. These are question-readiness distinctions for
the selected-answer review, not newly selected requirements or thirty-two screens.

| This journey                                  | Root question coverage                                                                                       |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1 Personal view                               | Staff makes a private view.                                                                                  |
| 2 Ordinary author publication                 | Ordinary author wants colleagues to reuse it; explicit A/B table.                                            |
| 3 Reader without authoring                    | Publisher population and current power distinction in boundary 3; tenant administration row.                 |
| 4 Designated manager                          | Designated view manager curates common work; B's table and handoff example.                                  |
| 5 Audience selection                          | Actual audience identity in boundary 4; source/P12 scope in boundary 3.                                      |
| 6 Protected personal definition               | View refers to a protected field, folder or label.                                                           |
| 7 Colleague opens shared definition           | Viewer has narrower source permissions; Rui example.                                                         |
| 8 Fewer data rights                           | Same narrower-viewer row and separate definition/result authority.                                           |
| 9 Source permission changes                   | Author/audience role changes; current authority in boundaries 3–5.                                           |
| 10 Audience membership changes                | Author or audience member leaves/changes role; current membership boundary 4.                                |
| 11 Temporary filter experiment                | Staff experiments with another person's shared view.                                                         |
| 12 Lasting personal variation                 | Same experiment/copy row; distinct personal work in boundary 5.                                              |
| 13 Shared definition edit                     | Shared definition changes during use; maintenance power in boundary 3.                                       |
| 14 Broader audience                           | Tenant administration or permission-policy change; protected expansion gates in boundaries 3–4.              |
| 15 Concurrent maintenance                     | Shared definition changes during use; conflict qualification in boundary 5.                                  |
| 16 Lost publication response                  | Usable mobile/network recovery and required selected-answer lifecycle proof in boundary 7.                   |
| 17 Publisher loses authority                  | Author/audience role-change row; no forever grant and actual stewardship.                                    |
| 18 Publisher departure                        | Same row and manager/administrator stewardship within actual grants.                                         |
| 19 Personal hide/unpin                        | Person hides or pins a view for themselves.                                                                  |
| 20 Stop shared availability/remove definition | Personal hide versus shared deletion distinction; boundary 5 lifecycle review.                               |
| 21 Ad-hoc query versus saved-definition link  | Corrected Staff opens a qualified direct link row and boundary 2.                                            |
| 22 Invalid/deleted criterion                  | A criterion is removed or becomes unauthorized; Q42 repair rules.                                            |
| 23 Optional label after correction            | No new source effects and preserved Q42 exact-use/label rules in boundary 6.                                 |
| 24 Result Download/Export/Share               | Distinct result actions in boundary 3 and no new source effects in boundary 6.                               |
| 25 Equal bytes/other use                      | Ordinary evidence cohort and preserved source owners; Q38/Q42 scope in boundaries 3/6.                       |
| 26 External/request-only reader               | Participant/donor/missionary/public user row; no staff library by association.                               |
| 27 Actor/Tenant/environment switch            | Current source/P12 scope and protected stale-state recovery; mobile/AT row.                                  |
| 28 Administrator ownership repair             | Tenant administration and actual stewardship; boundary 5 departure/recovery qualification.                   |
| 29 Mobile/large audience/weak network         | Mobile/non-drag/AT/low-bandwidth row, explicitly no full-directory loading.                                  |
| 30 Keyboard/AT/voice/pointer                  | Same accessible-composition row and proportionate existing UI boundary.                                      |
| 31 International/similar names                | Clear name/audience/action and selected-answer UI/identity qualification; no name-based sharing authority.   |
| 32 Old client/restore/reserved audience       | No reserved-enum activation in boundary 1; actual audience/source boundary and honest implementation status. |

The eight proof-direction groups remain necessary work after selection. They
fit this one publisher-population decision and do not preselect the exact
audience hierarchy, shared editing rights, departure policy or provider/schema
implementation before the full adversarial review.

Final status: **question ready; Q43 unselected**. Only this assigned note was
edited. No Q43 ADR/new glossary term, canonical/runtime/provider change, private
data inspection, native role/API/database/browser/AT/load test or real message
occurred. Writing is complete for this question version.
