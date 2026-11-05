# Phase 29 Q43 — Who can publish shared file views?

**Status:** Conrad fully ratified Q43 A and all required amendments on 2026-10-25, Asia/Bangkok. The [complete review](phase29-q43-adversarial-review.md) and [ADR-0043](../docs/adr/0043-staff-published-ordinary-request-file-views.md) record the adopted package. Q01–Q43 are ratified; all26 glossary definitions remain unchanged. Earlier preparation and selected-answer review sections below are dated history. No implementation, activation or formal owner/OpenSpec publication is claimed.

## Historical question preparation — 2026-10-25

**Status:** Researched question prepared 2026-10-25, Asia/Bangkok. Q01–Q42
and every required amendment are fully ratified; all 26 glossary definitions
remain unchanged. Q43 has no selected answer, ADR or new glossary term. This is
grooming research, not native qualification, activation or formal publication.

## One decision

**Should ordinary staff who are granted view-authoring scope be able to make
their own eligible saved file views available to a permitted staff audience,
or should only designated view managers publish shared views?**

Shared views are already a founder-required outcome. We are choosing who may
publish a reusable view into the shared staff library, not whether shared views
exist. Here, publish means deliberately make a reusable definition available to
the selected permitted staff audience. It does not mean public-web publication,
sharing files or sending an email. A saved view is a reusable set of permitted
filters, columns and sorting, evaluated against each viewer's current access.

| Option                                                                   | Practical behavior                                                                                                                                                                                                                                                                | Main tradeoff                                                                                                                                                                          |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Let eligible staff publish their own shared views (recommended).** | Include publication of one's own eligible ordinary-file views within the normally granted staff view-authoring scope, subject to current source/P12 authority and an explicitly permitted staff audience. No separate view-manager designation is required for that ordinary act. | Staff can reuse useful ways of finding work without a central publisher handoff. Requires clear audience/definition handling and ownership/cleanup so the shared library stays useful. |
| **B — Reserve shared-view publication for designated view managers.**    | Staff keep personal views; designated view managers create or publish the reusable shared definitions. Ordinary authors do not acquire this shared-publication power from their private-view authoring scope.                                                                     | A smaller centrally curated library, at the cost of a manager handoff for new shared arrangements and dependence on someone being available to maintain them.                          |

**Recommend A.** Reusing an ordinary, eligible way of finding work should not
normally need a separate central publishing handoff. Tenant control over who
receives actual source/P12 powers remains; A is an explicit proposed extension
of the normal authoring scope, not inference from a coarse staff role or mere
permission to read a file. B is appropriate when curated standard views and
consistent naming matter more than decentralized publication. No measured Asym
frequency, productivity benefit or staffing pattern establishes either option.

Both retain private views by default, deliberate sharing, current authorization
and manager/administrator stewardship within actual grants. Neither asks every
user to share, lets everyone edit everyone else's views, forces a view onto
another person's default tabs, or chooses tenant-wide Everyone visibility.
Neither introduces a view-approval queue, new notification engine or general
permissions builder. Existing P12 gates still apply where required.

## Concrete example and scope

Illustrative only: Elena creates **Unfiled request files**, a permitted live view
of ordinary request evidence with no home folder. She wants her operations
colleagues to reuse it rather than rebuild the filters.

Under A, if Elena has the ordinary authoring/publication scope and the definition
and audience qualify, she deliberately chooses **Share view**, selects the
permitted audience and makes it available. Under B, Elena retains her personal
view and a designated view manager publishes the shared definition. B does not
require a new formal proposal/approval workflow; the actual permitted handoff
must be usable if B is selected.

Rui opens the shared view with narrower source access. He may see fewer files
than Elena. Sharing the definition does not transfer Elena's permissions, create
folder references, copy evidence or grant download/export/share powers. If the
definition itself contains a protected folder name, label, field or predicate,
its disclosure must qualify too; filtering result rows alone is insufficient.

The first cohort remains **ordinary Private Document Request evidence entries**
under Q42, with Q38 approved metadata discovery. Other sources, public Media,
official artifacts and specialist records retain their own owners. Source-
approved live-query semantics remain; this is not a static list or membership
container. A view named Unfiled is not a new authoritative workflow queue.

## Current primary research and strongest counterevidence

Primary pages were read on 2026-10-25. They establish actual product patterns,
not universal best practice, measured Asym benefit or Core permission authority.

- [Power Apps personal views](https://learn.microsoft.com/en-us/power-apps/user/grid-filters-advanced)
  supports sharing personal views while distinguishing Share, Write, Assign and
  Delete powers. It also separates hiding a view for yourself from deleting it
  for everyone. This supports A with explicit powers rather than ambient staff
  authority; Core does not import its fetchXML/query designer or name-overwrite
  behavior.
- [HubSpot saved views](https://knowledge.hubspot.com/records/create-and-manage-saved-views)
  documents private initial views, explicit sharing settings and differences
  between profile-local changes and root configuration. Team/Everyone/Custom
  options demonstrate flexibility, not a mandate to implement every audience
  in Core. Retrieved page variants displayed different update dates; only the
  directly verified behavior is used. Older creator/admin-only edit wording is
  not asserted as a universal current rule.
- [Salesforce Standard User views](https://help.salesforce.com/s/articleView?id=000387562&language=en_US&type=1)
  documents private views for its Standard User profile because it lacks Manage
  Public List Views. Its [permission guide](https://help.salesforce.com/s/articleView?id=000393179&language=en_US&type=1)
  distinguishes private customization from public-view management. This is
  strong B counterevidence: deliberately narrower publication can be an
  intentional product choice, not an obsolete workaround.
- [Blackbaud RE NXT list sharing](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-share-list.html)
  explicitly preserves each recipient's security-dependent records/details.
  Its [save/list settings](https://webfiles-sc1.blackbaud.com/files/support/helpfiles/rex/content/en-gb/content/bb-save-list.html)
  distinguish others viewing from managing a definition. This is a strong
  nonprofit CRM comparison for definition reuse without transferred data
  access. Static queries, membership additions and vendor permission-delay
  behavior do not become Core semantics.

The [comparative research](phase29-q43-comparative-research.md) records source
limits, additional document-library precedents and the user-journey comparison.
No vendor account, private data or real staff usability study was exercised.

## Governing boundaries and why this is open

The [owner research](phase29-q43-owner-research.md) and
[runtime research](phase29-q43-runtime-research.md) retain complete owner/current
code evidence and the comparison with other next-question candidates.

1. **Publication eligibility remains open.** P9 A14/B11 define first-class live
   query views with private visibility now and team/everyone reserved. The
   founder requires personal/shared discovery, and Q42 explicitly preserves the
   shared-view frontier. None selects ordinary-author publication versus
   designated view managers. A would need an explicit scoped owner amendment;
   a reserved enum value is not activation authority.
2. **A shared view is not a shared file or a filtered link.** P9's already-
   required shareable query-context URLs do not grant definition or result
   access. B does not remove independently qualified direct-link use. Q38/Q42
   privacy controls still govern any URL, definition, name or predicate; use a
   safe qualified reference rather than exposing sensitive query material.
3. **Publication, definition disclosure, maintenance and result actions are
   distinct.** Current source/P12 rules govern the actual publisher, allowed
   audience, readable definition and each resulting entry/field. Choosing A
   does not grant publishing other authors' views, editing all shared views,
   changing others' defaults, exporting records or sharing evidence. Changing
   role/capability policy remains separate from using a qualified grant. A
   removes the designated view-manager gate only for deliberate publication of
   an eligible owned definition within the publisher's currently granted
   ordinary-source audience envelope. It grants no role/capability, group
   membership, field visibility or underlying record access. Any actual
   permission/audience-policy expansion, protected grant, self-benefiting or
   separation-of-duties restriction and policy widening retains its existing
   P12/P3 approval requirements.
4. **Actual audience identity is required.** Do not use demo teams, arbitrary
   profiles, a Support-specific team or Party association as a general sharing
   audience. Membership and source restrictions must be current. The question
   does not choose an unrestricted Everyone option or a new audience hierarchy.
5. **Private work and shared edits must remain clear.** Local filter experiments
   must not silently overwrite a shared definition. Changes to shared criteria,
   maintainer departure, audience changes, conflicts and deletion need the
   selected-answer review. Current Q42 invalid-criterion handling remains: no
   silently dropped predicate, broadened results or fabricated complete zero.
6. **No new source effects.** Views do not file evidence, select a different
   version, accept requirements, trigger notifications, extend Q41 access,
   alter retention or become source review queues. Q42 one-home and exact-use
   rules stay intact. Shared definition access never implies historical access.
7. **Keep the feature proportionate.** Use existing source/query/view/UI/P12
   boundaries and an explicit source audience. No generic policy engine,
   workflow designer, external connector, public catalog or new role directory
   is chosen. The full selected-answer review will resolve exact lifecycle and
   prove ordinary use/recovery without premature schema/provider decisions.

The alternative next frontiers include finite bulk-download delivery shape and
exact-version review-comment location. Both are genuine, but neither required
bulk capability nor staff comments should be reasked as an existence question.
Shared-view publication is the immediate organization gap left explicit by Q42
and extends its find/reuse journey without reopening folder cardinality or
mechanically asking another notification-default question.

## Journeys and acceptance direction

These are question-readiness boundaries, not selected Q43 requirements or proof
of current runtime behavior.

| Person or situation                                     | Required distinction under either option                                                                                                                                                                                                                                               |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staff makes a private view                              | Ordinary private use remains available; publication is deliberate rather than automatic on save.                                                                                                                                                                                       |
| Ordinary author wants colleagues to reuse it            | A permits direct publication within the granted ordinary-author scope; B uses the designated publisher route.                                                                                                                                                                          |
| Designated view manager curates common work             | Stewardship remains possible through actual powers; publication alone does not control everyone's defaults.                                                                                                                                                                            |
| Viewer has narrower source permissions                  | Current permitted definition and results only; no creator-access inheritance or complete-count promise.                                                                                                                                                                                |
| View refers to a protected field, folder or label       | Protect definition metadata as well as rows; audience selection is not a privacy bypass.                                                                                                                                                                                               |
| Staff experiments with another person's shared view     | Local changes/copy remain distinct from deliberate shared-definition editing.                                                                                                                                                                                                          |
| Author or audience member leaves/changes role           | Current authority and supported ownership recovery apply; no forever grant from creator identity.                                                                                                                                                                                      |
| Shared definition changes during use                    | Exact current/version/conflict behavior needs selected-answer qualification; no silent destructive overwrite.                                                                                                                                                                          |
| A criterion is removed or becomes unauthorized          | Preserve Q42 safe invalid/repairable behavior, never silently broaden.                                                                                                                                                                                                                 |
| Staff opens a qualified direct link                     | Apply current source/query permission; where the link references a saved definition, its current definition permission also applies. An ad-hoc query-context URL does not require access to the author's private saved-view record. The link is not publication to the shared library. |
| Person hides or pins a view for themselves              | Personal presentation is distinct from changing or deleting the shared definition for others.                                                                                                                                                                                          |
| Participant/donor/missionary/public user                | No staff view-library or new evidence access by association. Staff-role use still needs its actual source scope.                                                                                                                                                                       |
| Mobile, keyboard, non-drag pointer, AT or low bandwidth | Clear name/audience/action, usable recovery, protected stale state and no full-directory/tree loading.                                                                                                                                                                                 |
| Tenant administration or permission-policy change       | Existing P12 controls and genuine widening gates remain; choosing A adds no unrestricted staff grant.                                                                                                                                                                                  |

## Current implementation and freshness

Local Core remains `3d85897ebf1515008ef5c676b1c58a15422fb9ab`; fresh live develop
is `6ac594d96a061924df4bda98adcd9fff04595c04`. The complete prior-a6f6→6ac594
comparison is fifteen commits ahead, zero behind and twenty changed paths.
The new code-owned capability registry, bundles and pure context resolver are
real adjacent progress. Their current guide explicitly says **prepared, not
wired**, with no external imports/exported capabilities subpath, capability
tables/migrations or live authorization change. They do not implement an
ordinary shared-view publisher or audience loader.

Current named-view routes still implement personal gift-history settings;
tenant-default management is separate from shared publication. Demo team
collections and separate Support team CRUD do not establish a general staff
audience. No actual ordinary shared-view schema, SQL/RLS, source permission or
browser flow is qualified by this research. No pull, runtime/provider mutation,
private-data read, publication, notification or implementation test occurred.

## Q42 ratification and question preparation

Q42's exact 12,227-character/fourteen-paragraph decision and all135 substantive
review table rows were preserved. All26 glossary definitions are byte-preserved;
373 other-file hashes passed ratification preservation. These are documentation
checks, not native feature proof. Its full package is now ratified, including
one-time home-only correction initialization, empty-only removal, private initial
views, definition privacy, safe invalid criteria and source-owned recovery.

Independent whole-question reviews are closed: owner, runtime and comparative/
UX reviewers read every section and the fourteen composed journeys. Their notes
record actual closure and evidence limits. The one material wording correction
distinguishes an independently qualified ad-hoc query-context URL from a link
that references a saved definition; only the latter additionally needs that
definition's current permission. No unresolved material question-readiness issue
remains. The same source/query privacy boundaries apply under both options.

No Q43 ADR, glossary term or selected answer is written. Conrad chooses A or B,
then that answer receives the full adversarial review and exact amendments.
Formal owner/OpenSpec publication remains `/to-prd`; tickets remain `/to-issues`.

## Historical selected answer and review — before ratification, 2026-10-25

Conrad selected **A — Let eligible staff publish their own shared views** and
requested deep research/full adversarial review. Disposition: **Accept with
required amendments**. The [complete review](phase29-q43-adversarial-review.md)
and [ADR-0043](../docs/adr/0043-staff-published-ordinary-request-file-views.md)
record the exact14paragraph decision, Q43-C01–C14/P01–P36, all22 categories,
20lifecycle distinctions,40journeys,seven finite qualification budgets and
seven operating controls. This complete package awaits ratification; selecting
A is not ratification of material amendments. Q01–Q42 and all26 glossary
definitions remain unchanged; no new term is needed.

Normally qualified ordinary-source authors can publish owned eligible views
without a separate view-manager designation. Actual P12/P3 policy-widening,
protected-grant, self-benefit and separation-of-duties rules remain exact.
The first audience is a finite selected set of exact current staff Active Tenant
Assignments, within the source/Tenant/environment and publisher's actual
disclosure envelope. No automatic Everyone, dynamic team engine, external
recipient, broad role inference or copied file/result rights follows.

Explicit Share promotes the same stable private view identity. A deliberately
reviewed combined Save and share is permitted; there is no mandatory duplicate
private/published pair. Local filter experiments remain personal; Save shared
view is deliberate. Personal copy creates a separate private identity without
audience/manage rights. Protected definition facts are authorized separately
from each viewer's current rows/fields/counts. A useful zero is valid; unknown
authority or invalid criteria is not zero or permission to fall back to all.
Typed query/default/schema meaning cannot silently broaden or retarget.

Creator attribution is historical; one current maintainer and existing scoped
source administration provide continuity. Author departure does not itself
erase independently valid shared work; actual source/grantor dependencies win.
No blanket private-view takeover is granted. Stop sharing clears readers and
retains a lawful current-maintainer private view. With no eligible maintainer,
transfer first or immediately Remove/retire; urgent withdrawal cannot wait.
No silent draft save on an empty Share; last stored reader removal uses this
explicit withdrawal path. Temporary zero eligible retained readers is distinct.
Remove affects the definition, not evidence or independent copies; qualified
recovery is private and never automatically restores an audience.

One source command coherently commits exact intent, current authority, audience,
definition/default basis, maintainer/lifecycle, restricted history and outcome.
Old private writers/cascades, stale retries, expiry and restores cannot mutate
shared state or revive sharing. P12 is the fine-grained PDP; RLS supplies its
coarse Tenant defense, with effective grants/old-new policies and all alternate
doors qualified or closed. Current caches, links and minimal protected replay
evidence preserve the same boundary. No notification or new provider follows.

Current primary nonprofit/general CRM research supports direct sharing and
permission-dependent results; designated-manager B remains credible curation.
Same-name overwrite, admin private-view access, broad audiences and delayed
rights propagation are not imported. Current gift-history personal views and
the prepared/not-wired capability foundation are adjacent evidence, not Q43
implementation. Fresh live6ac594 and local3d85897 remain distinct and unchanged.

Independent full-report/ADR owner/runtime/UX reviews are closed after material
refinements. Document parity, all-category/proof coverage, links, formatting,
prior-decision/glossary preservation and unrelated-file hashes are verified.
No native RLS, concurrency, load, provider, browser/AT, user study or billing
proof is claimed. Formal canonical-owner/OpenSpec adoption remains /to-prd;
tickets remain /to-issues. Q44 is not asked or inferred.

## Full ratification — 2026-10-25

Conrad explicitly instructed on 2026-10-25: “Yes, fully ratify Q43 A with all required amendments. Record it and move to the next question in this Phase 29 grill-with-docs session, with research, practical options, and your recommendation.”

The complete fourteen-paragraph product decision, Q43-C01–C14/P01–P36, all22 category outcomes,20 lifecycle distinctions,40 user journeys,seven qualification budgets and seven operating controls are adopted. All substantive decision language and review tables are preserved. The final decision sentence changes only its stage from selected/proposed to fully ratified; it still disclaims implementation and formal publication. Q01–Q43 are ratified grooming intent. All26 glossary definitions remain byte-preserved; no new term is needed.

Eligible ordinary-source authors may directly share owned saved definitions within their current source/P12 envelope, without a separate designated-manager gate. Actual policy-widening/protected-grant/SoD requirements remain. Same-ID deliberate Share or reviewed Save and share commits a finite audience of exact eligible staff assignments; adding named colleagues within the envelope is ordinary Manage sharing. Dynamic audience forms remain unselected. Private/local experiments, deliberate shared save and independent private copies remain distinct.

Definition disclosure is independently authorized; every viewer receives only current permitted source results. Invalid criteria/default/schema changes cannot silently broaden queries. One current maintainer and scoped source administration provide shared-resource continuity, without blanket private-view takeover. Stop sharing requires a lawful private maintainer; transfer first or immediately retire otherwise. No old audience is restored through retry, recovery or backup. Files, evidence, source decisions, external shares and specialist ownership are unchanged.

One source command, immutable scope/provenance, current assignment/field authority, coarse Tenant RLS and the verified fine-grained PDP protect all real doors. Coherent state/history/outcome, exact replay-or-stale rejection, old-writer/cascade fences, compatible migration and current-denial-aware restore remain required. No new notification, provider or permissions engine follows.

Native source, database roles, concurrency/replay, migration/restore, workload/cost and composed accessible-user qualification remain activation gates. Ratification does not prove these tests or deployment. Formal owner/OpenSpec publication remains /to-prd; implementation tickets remain /to-issues. Q44 research and one next question are authorized; no answer is inferred.
